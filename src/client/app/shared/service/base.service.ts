import { Observable } from 'rxjs/Observable';
import { Injectable, ReflectiveInjector } from '@angular/core';
import { TraceMethodPosition, IFilterDefinition } from '../index';

import { Router } from '@angular/router';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { CookieService } from 'angular2-cookie/core';
import { AppSettings } from '../../appsettings';
import { ScrollService } from '../scroll/scroll.service';
import { LoggingService } from '../logging/logging.service';
import { SecurityService } from '../security/security.service';
import { BusyService } from '../service/busy.service';
import { HubService } from '../hub/hub.service';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/finally';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/empty';
import 'rxjs/add/operator/share';

@Injectable()
export class BaseService {
        
    constructor(
        public loggingService: LoggingService, 
        public securityService: SecurityService, 
        public router: Router, 
        public http: Http,
        public cookieService: CookieService, 
        public appSettings: AppSettings,
        public busyService: BusyService,
        public scrollService: ScrollService,
        public hubService: HubService
    ) {

        this.classTrace = this.loggingService.getTraceFunction("UnspecifiedService");
    }
    

    public getOptions(hubService: HubService, endpointKey: string, serviceError: string): IServiceOptions {
        var trace = this.classTrace("getOptions");
        trace(TraceMethodPosition.Entry);
        var obs = { apiRoot: hubService.findApiEndPoint(endpointKey).apiRoot, ServiceError: serviceError };
        trace(TraceMethodPosition.Exit);
        return obs;
    }

    private setHeaders(options: RequestOptions): RequestOptions {
        
        if (!options) options = new RequestOptions();
        if (!options.headers) options.headers = new Headers();       
        options.headers.delete('Content-Type');
        options.headers.delete('Accept');
        options.headers.delete('Authorization');
        options.headers.append('Content-Type', 'application/json');
        options.headers.append('Accept', 'application/json');
        var token = this.securityService.GetToken();
        if (token !== "") {
            options.headers.append('Authorization', 'Bearer ' + token);
        }
        return options;
    }
    
    public initializeTrace(className: string) {
        this.classTrace = this.loggingService.getTraceFunction(className);
    }
    
    public classTrace: (methodName: string) => (methodPosition: TraceMethodPosition, extraMessage?: string) => void;

    public logError(message: string, options?: any): void {
        this.loggingService.error(message, options);
    }

    public logSuccess(message: string, options?: any): void {
        this.loggingService.success(message, options);
    }

    public logWarn(message: string, options?: any): void {
        this.loggingService.warn(message, options);
    }

    public log(message: string, options?: any): void {
        this.loggingService.debug(message, options);
    }

    public logInfo(message: string, options?: any): void {
        this.loggingService.info(message, options);
    }

    public logTrace(message: string, options?: any): void {
        this.loggingService.trace(message, options);
    }

    private passedAuthentication(): boolean {
        var trace = this.classTrace("passedAuthentication");
        trace(TraceMethodPosition.Entry);
        if (this.securityService.checkAuthorized()) {
            trace(TraceMethodPosition.Exit);
            return true;
        }        
        var currentRoute = this.router.serializeUrl(this.router.urlTree);
        this.cookieService.put(this.appSettings.CookieKeys.RouteAfterLoginKey,currentRoute);
        //this.xCoreServices.SecurityService.Authorize();
        trace(TraceMethodPosition.Exit);
        return false;
    }    
    
    private getCleanRoutePath(routePath: string): string {        
        return routePath ? `/${routePath}` : '';
    }

    private getCleanApiRoot(apiRoot: string): string {        
        return apiRoot.endsWith('/api') ? apiRoot : apiRoot + '/api';
    }
    
    private executeObservable<TData>(obs: Observable<TData>): Observable<TData> {
        var trace = this.classTrace("executeObservable");
        trace(TraceMethodPosition.Entry);
        if (this.passedAuthentication()) {
            this.busyService.notifyBusy(true);
            trace(TraceMethodPosition.Exit); 
            return obs;                
        } else {
            return Observable.empty<TData>();
        }   
    }

    public getTextData(serviceOptions: IServiceOptions, routePath: string, requestOptions?: RequestOptions,  onError?: (error: any, friendlyError: string, caught: Observable<string>) => void): Observable<string> {
        var trace = this.classTrace("getTextData");
        trace(TraceMethodPosition.Entry);
        var baseObs = this.getBaseGetObservable(serviceOptions.apiRoot, routePath)                                        
                .map(res => { return res.text(); });
            var tailObs = this.getTailGetObservable<string>(baseObs, serviceOptions, onError);   
        var ret  = this.executeObservable(tailObs);
        trace(TraceMethodPosition.Exit);
        return ret;
    }

    private getBaseGetObservable(apiRoot: string, routePath: string, options?: RequestOptions): Observable<Response> {
        var trace = this.classTrace("getBaseGetObservable");
        trace(TraceMethodPosition.Entry);
        apiRoot = this.getCleanApiRoot(apiRoot);
        this.loggingService.debug(`Making a GET request to ${apiRoot}${this.getCleanRoutePath(routePath)}`);
        var ret = this.http
            .get(`${apiRoot}${this.getCleanRoutePath(routePath)}`, this.setHeaders(options)).share();
        trace(TraceMethodPosition.Exit);
        return ret;
    }   
     
    private getTailGetObservable<TData>(currentObservable: Observable<TData>, serviceOptions?: IServiceOptions,
            onError?:(error: any, friendlyError: string, caught: Observable<TData>) => void): Observable<TData> {
                
        var trace = this.classTrace("getTailGetObservable");
        trace(TraceMethodPosition.Entry);
        if (!onError) onError = (error: any, friendlyError: string,  caught: any) => { this.loggingService.error(error, friendlyError); }
        var swallowException = (!serviceOptions || !serviceOptions.propogateException);
        var suppressDefaultException = (serviceOptions && serviceOptions.suppressDefaultException); 
        currentObservable = currentObservable
            .catch<TData>((err,caught) => {
                if (suppressDefaultException) throw err;
                var newError = err._body;
                var friendlyError = this.getGeneralErrorMessage("retrieving", serviceOptions);                
                if (!err.status || err.status === 200) newError = friendlyError;                                
                onError(newError, friendlyError, caught);
                if (swallowException) return Observable.empty<TData>();
                throw newError;
            }).share();
        var ret = currentObservable.finally<TData>(() => {
            this.busyService.notifyBusy(false);
        });
        
        trace(TraceMethodPosition.Exit);
        return ret;
        
    }

    private getGeneralErrorMessage(action:string, serviceOptions?: IServiceOptions): string {
        
        var trace = this.classTrace("getGeneralErrorMessage");
        
        trace(TraceMethodPosition.Entry);
        var dataDescription: string = serviceOptions && serviceOptions.serviceDataDescription;
        if (!dataDescription) dataDescription = "requested data"; 
        var errorDescription: string = serviceOptions && serviceOptions.serviceError; 
        if (!errorDescription) errorDescription = `There was an error ${action} the ${dataDescription}`;
        
        trace(TraceMethodPosition.Exit);
        return errorDescription; 
    }   
     
    public getObjectData<TData>(serviceOptions: IServiceOptions, routePath: string, 
        requestOptions?: RequestOptions, onError?: (error: any, friendlyError: string, caught: Observable<TData>) => void): Observable<TData> {
            
            var trace = this.classTrace("getObjectData");
            trace(TraceMethodPosition.Entry);
            var baseObs = this.getBaseGetObservable(serviceOptions.apiRoot, routePath, requestOptions)
                .map<TData>(res => res.json());                
            var tailObs = this.getTailGetObservable<TData>(baseObs, serviceOptions, onError);   
        var ret =  this.executeObservable(tailObs);
        trace(TraceMethodPosition.Exit);
        return ret;
    }
    
    public postData<T, TRet>(data: T, serviceOptions: IServiceOptions, routePath: string, 
        requestOptions?: RequestOptions, onError?: (error: any, friendlyError: string, caught: Observable<TRet>) => void): Observable<TRet> {
        
        var trace = this.classTrace("postData");
        trace(TraceMethodPosition.Entry);
        serviceOptions.apiRoot = this.getCleanApiRoot(serviceOptions.apiRoot);
        var baseObs = this.http
                .post(`${serviceOptions.apiRoot}${this.getCleanRoutePath(routePath)}`, 
                    JSON.stringify(data), this.setHeaders(requestOptions)).share()
                    .map<TRet>( res => { return res.json(); });
        var tailObs = this.getTailGetObservable<TRet>(baseObs, serviceOptions, onError);
        var ret =  this.executeObservable(tailObs);
        trace(TraceMethodPosition.Exit);
        return ret;
    }

    public putData<T, TRet>(data: T, serviceOptions: IServiceOptions, routePath: string, 
        requestOptions?: RequestOptions, onError?: (error: any, friendlyError: string, caught: Observable<TRet>) => void): Observable<TRet> {
        
        var trace = this.classTrace("putData");
        trace(TraceMethodPosition.Entry);
        serviceOptions.apiRoot = this.getCleanApiRoot(serviceOptions.apiRoot);                
        var baseObs = this.http
                .put(`${serviceOptions.apiRoot}${this.getCleanRoutePath(routePath)}`, 
                    JSON.stringify(data), this.setHeaders(requestOptions)).share()
                    .map<TRet>( res => { return res.json(); });
        var tailObs = this.getTailGetObservable<TRet>(baseObs, serviceOptions, onError);
        var ret = this.executeObservable(tailObs);
        trace(TraceMethodPosition.Exit);
        return ret;
    }

    public deleteData(serviceOptions: IServiceOptions, routePath: string,  
        requestOptions?: RequestOptions, onError?: (error: any, friendlyError: string, caught: Observable<boolean>) => void): Observable<boolean> {
        
        var trace = this.classTrace("deleteData");
        trace(TraceMethodPosition.Entry);
        serviceOptions.apiRoot = this.getCleanApiRoot(serviceOptions.apiRoot);                
        var baseObs = this.http
                .delete(`${serviceOptions.apiRoot}${this.getCleanRoutePath(routePath)}`, 
                     this.setHeaders(requestOptions)).share()
                    .map<boolean>( res => { return true; });
        var tailObs = this.getTailGetObservable<boolean>(baseObs, serviceOptions, onError);
        var ret =  this.executeObservable(tailObs);
        trace(TraceMethodPosition.Exit);
        return ret;
    }
        
}


export interface IDataService<TModel, TViewModel, TFilterToServer, TFilterToClient> {
    toViewModel(model: TModel): TViewModel;
    toModel(vm: TViewModel): TModel;
    get(skip?: number, take?: number, filter?: TFilterToServer): Observable<TFilterToClient>
}

export interface ICollectionViewModel<T> {
    rowCount: number;
    rows: T[];
}

export interface IEntity {
    id: string;
}

export interface IServiceOptions {
    suppressDefaultException?: boolean;
    serviceDataDescription?: string;
    serviceError?: string;
    propogateException?: boolean;
    apiRoot: string
}


export interface INameValue<T> {
    name: string,
    value: T
}