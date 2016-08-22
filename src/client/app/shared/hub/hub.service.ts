import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Injectable, Inject } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';

import * as _ from 'lodash';
import  { TraceMethodPosition } from '../index';
import { LoggingService } from '../logging/logging.service';
import { AppSettings } from '../../appsettings';
import { SecurityService } from '../security/security.service';
import { BusyService } from '../service/busy.service';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/finally';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/empty';
import 'rxjs/add/operator/share';

@Injectable()
export class HubService {
    
    private clientId: string;
    private scopes: string;
    private hubData: IHubServiceData;
    private id: number;

    public get Id(): number  { return this.id; }
    public get HubData(): IHubServiceData { return this.hubData; }
    public get ClientId():string { return this.clientId; }
    public get Scopes():string { return this.scopes; }
    
    private HubDataRetrievedSource = new Subject<IHubServiceData>();
    private HubDataCompletedSource = new Subject<IHubServiceData>();
    
    public HubDataRetrievedEvent = this.HubDataRetrievedSource.asObservable().share();
    public HubDataCompletedEvent = this.HubDataCompletedSource.asObservable().share();
    
    public HubDataLoaded: boolean = false;
    public classTrace: (methodName: string) => (methodPosition: TraceMethodPosition, extraMessage?: string) => void;

    constructor(private appSettings: AppSettings, private loggingService: LoggingService, private securityService: SecurityService, private http: Http, private busyService: BusyService) {

        this.classTrace = this.loggingService.getTraceFunction("HubService");
        var trace = this.classTrace("constructor");        
        trace(TraceMethodPosition.Entry);
        
        //Initially set hub client/scope to the hub client scope.  These will
        //get modified when the hub sends new scopes
        this.clientId = this.appSettings.ApiClientId;
        this.scopes = this.appSettings.HubScopes;
        this.id = parseInt(String(Math.random() * 100));
        trace(TraceMethodPosition.Exit);
        
    }

    private setHeaders(): RequestOptions {
        
        var  options = new RequestOptions();
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

     

    public getLoggedInGivenName(): string {        
        return this.securityService.getUserName();
    }
    
    public retrieveHubData(): void {
        
        var trace = this.classTrace("retrieveHubData");                
        trace(TraceMethodPosition.Entry);

        try {
            var obs = this.http.get(`${this.appSettings.HubApiEndpoint}/${this.appSettings.HubRoute}`, this.setHeaders()).share()
                    .map<Response>(res => res.json())
                    .catch<IHubServiceData>((err, caught) => {
                        var newError = err._body;
                        this.loggingService.error(newError, "Unable to retrieve main menu");
                        return Observable.empty<IHubServiceData>(); 
                    }).finally<IHubServiceData>(() => {
                        this.busyService.notifyBusy(false);
                    });

        } catch(ex) {
            throw ex;
        }

        if (this.passedAuthentication()) {
            this.busyService.notifyBusy(true);
            obs.subscribe((hb: IHubServiceData) => {
                trace(TraceMethodPosition.CallbackStart, "HubDataRetrievedEvent");
                //Update with the proper api scopes - hub should not be called again until total refresh
                this.clientId = this.appSettings.ApiClientId;
                this.scopes = hb.scopes;
                hb.userId = this.securityService.getUserId()
                this.hubData = hb;
                this.HubDataRetrievedSource.next(hb);
                trace(TraceMethodPosition.CallbackEnd, "HubDataRetrievedEvent");
            });
        }   
        trace(TraceMethodPosition.Exit); 

    }    
    
    private passedAuthentication(): boolean {
        var trace = this.classTrace("passedAuthentication");
        trace(TraceMethodPosition.Entry);
        if (this.securityService.checkAuthorized()) {
            trace(TraceMethodPosition.Exit);
            return true;
        }        
        trace(TraceMethodPosition.Exit);
        return false;
    }    

    
    public triggerHubDataCompletedLoading(): void {
        
        var trace = this.classTrace("triggerHubDataCompletedLoading");        
        trace(TraceMethodPosition.Entry);

        this.HubDataCompletedSource.next(this.hubData);  
        this.HubDataLoaded = true;      
        trace(TraceMethodPosition.Exit);
    }
    
    public findApiEndPoint(apiKey: string): IHubServiceApiEndpoint {
        
        var trace = this.classTrace("findApiEndPoint");        
        trace(TraceMethodPosition.Entry);
        var ret = _.find(this.hubData.apiEndpoints, e => { return e.apiKey === apiKey; });
        trace(TraceMethodPosition.Exit);
        return ret; 
    }
    
    public callbackWhenLoaded(action: Function) {
        var trace = this.classTrace("callbackWhenLoaded");        
        trace(TraceMethodPosition.Entry);
        if (this.HubDataLoaded)
            action();
        else           
            this.HubDataCompletedEvent.subscribe(hd => {
                trace(TraceMethodPosition.Callback);                
                action();        
            });
        trace(TraceMethodPosition.Exit);
    }
    
}

export interface IHubServiceData {
    apiEndpoints: IHubServiceApiEndpoint[],
    menuItems: IHubServiceMenuItem[],
    scopes: string,
    userId: string
}

export interface IHubServiceApiEndpoint {
    apiKey: string;
    apiRoot: string;
}

export interface IHubServiceMenuItem {
    key: string,
    name: string,
    description: string,
    route: string,
    icon: string,
    subMenus: IHubServiceMenuItem[]
}