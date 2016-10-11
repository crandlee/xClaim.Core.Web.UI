
import { Component } from '@angular/core';
import * as _ from 'lodash';
import { TraceMethodPosition, IHubServiceData } from '../index';
import { BaseService } from '../service/base.service';

import { XCoreBaseComponent } from '../component/base.component';
@Component({
    moduleId: module.id,
    selector: 'xcore-security',
    templateUrl: 'security.component.html',
    styleUrls: ['security.component.css']
})
export class SecurityComponent extends XCoreBaseComponent  {

    public loggedIn: boolean;
    public userName: string;
    public isBusy: boolean = false;
    public isCollapsed:boolean = true;
    public hubData: IHubServiceData =  {apiEndpoints: [], menuItems: [], scopes:"", userId: null };
    public refreshMinutesLeft: number = 0;

    constructor( 
        protected baseService: BaseService) {
            super(baseService);
            this.initializeTrace("SecurityComponent");               

    }
                  
    private performPostLoginProcedure() {

        var trace = this.classTrace("performPostLoginProcedure");        
        trace(TraceMethodPosition.Entry);
        
        this.subscribeToIsApplicationBusy();
        this.retrieveHubData();
        trace(TraceMethodPosition.Exit);
    }
    
    private retrieveHubData() {
        
        var trace = this.classTrace("retrieveHubData");        
        trace(TraceMethodPosition.Entry);
        
        //Set up event subscriptions   
        this.baseService.hubService.HubDataRetrievedEvent.subscribe(hubData => {
            trace(TraceMethodPosition.CallbackStart, "HubDataRetrievedEvent");
            this.receiveHubDataAndReAuthorize();
            trace(TraceMethodPosition.CallbackEnd, "HubDataRetrievedEvent");
        });                    
        this.baseService.loggingService.debug(`Retrieving data from hub at ${this.baseService.appSettings.HubApiEndpoint}`, { noToast: true });
        this.baseService.hubService.retrieveHubData();        
        
        trace(TraceMethodPosition.Exit);
    }
        

    private receiveHubDataAndReAuthorize() {
        
        var trace = this.classTrace("receiveHubDataAndReAuthorize");        
        trace(TraceMethodPosition.Entry);
        this.baseService.loggingService.debug(`Retrieved ${this.baseService.hubService.HubData.apiEndpoints.length} api endpoints and ${this.baseService.hubService.HubData.menuItems.length} menu items from the hub`);
        this.hubData = this.baseService.hubService.HubData;
        if (!this.hubData.scopes) {
            this.baseService.loggingService.warn("No applications are available to load.  Please check with the system administrator for further access");
            return;    
        }
        if (this.hubData.scopes !== this.baseService.appSettings.HubScopes 
            && this.baseService.securityService.getCurrentScopes() == this.baseService.appSettings.HubScopes) {
            //Now that hub has returned data, request new authorization with requested scopes
            //(only if requested scopes are different, which they should be)
            this.baseService.securityService.requestNewScopeAuthorization(this.hubData.scopes);
        } else {
            this.baseService.loggingService.debug("No more reauthorization needed. Scopes are up to date");
            //This call is to allow other components interested in hub data to know it is finalized.
            this.baseService.hubService.triggerHubDataCompletedLoading();
            this.performPostLoginRouting();
        }        
        trace(TraceMethodPosition.Exit);
    }
        
    private performPostLoginRouting() {
        
        var trace = this.classTrace("performPostLoginRouting");        
        trace(TraceMethodPosition.Entry);

        //Check for needed routing from post-login (where are previous route was requested and stored)
        var needRoute = this.baseService.cookieService.get(this.baseService.appSettings.CookieKeys.RouteAfterLoginKey);
        if (needRoute) {
            this.baseService.cookieService.remove(this.baseService.appSettings.CookieKeys.RouteAfterLoginKey);
            this.baseService.router.navigate([`${needRoute}`]);
        }        
        
        trace(TraceMethodPosition.Exit);
    }

    public login(): void {
        
        var trace = this.classTrace("login");        
        trace(TraceMethodPosition.Entry);
        
        try {
            this.baseService.securityService.Authorize();
        } catch (err) {
            this.baseService.loggingService.error(JSON.stringify(err));
        }
        
        trace(TraceMethodPosition.Exit);
    };
        
    public resetLocalHubData() {
        this.hubData = { apiEndpoints: [], menuItems: [], scopes:"", userId: "" }        
    }
    
    public logout(): void {
        
        var trace = this.classTrace("logout");        
        trace(TraceMethodPosition.Entry);

        try {
            this.baseService.securityService.Logoff();
            this.loggedIn = false;
            this.isCollapsed = true;
            this.resetLocalHubData();
        } catch (err) {
            this.baseService.loggingService.error(JSON.stringify(err));
        }
        
        trace(TraceMethodPosition.Exit);
    };
    
    public ngOnInit(): void {
        
        var trace = this.classTrace("ngOnInit");        
        trace(TraceMethodPosition.Entry);

        super.NotifyLoaded("Security");
         try {  
             this.loggedIn = this.baseService.securityService.checkAuthorized();            
             this.userName = this.baseService.securityService.getUserName();                                   
             this.performPostLoginProcedure();
             this.initializeAccessCounter();
             
         } catch (err) {            
             this.baseService.loggingService.error(JSON.stringify(err));
         }
         
         trace(TraceMethodPosition.Exit);
         
    };
    
    private initializeAccessCounter() {
        var minutesLeft = Math.round(this.baseService.securityService.getAccessTimeLeftSeconds() / 60);
        this.refreshMinutesLeft = minutesLeft;
        setInterval(() => {
            var minutesLeft = Math.round(this.baseService.securityService.getAccessTimeLeftSeconds() / 60);
            this.refreshMinutesLeft = minutesLeft;
        }, 10000);
    }
    
    public navigateToRoute(route: string): void {
        
        var trace = this.classTrace("navigateToRoute");        
        trace(TraceMethodPosition.Entry);
        
        if (!route) return;
        this.baseService.router.navigate([route]);  
        this.isCollapsed = true;      
        
        trace(TraceMethodPosition.Exit);
    }
    
    private subscribeToIsApplicationBusy() {
        
        var trace = this.classTrace("subscribeToIsApplicationBusy");        
        trace(TraceMethodPosition.Entry);

        this.baseService.busyService.notifyBusy$.subscribe(busyCount => {
            trace(TraceMethodPosition.Callback, `notifyBusy ${busyCount}`); 
            this.isBusy = (busyCount > 0);
        });
        
        trace(TraceMethodPosition.Exit);
    }
                  
}

