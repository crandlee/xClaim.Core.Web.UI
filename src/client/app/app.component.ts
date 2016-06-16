import { Component, ViewContainerRef } from '@angular/core';
import { BaseService, OffClickDirective, LoggingService, SecurityService, BusyService  } from './shared/index';
import { AppSettings } from './appsettings';
import { CookieService } from 'angular2-cookie/core';
import { Routes, ROUTER_DIRECTIVES } from '@angular/router';
import { DomainService } from './domain.service';
import { ToastyService, ToastyConfig, Toasty, ToastOptions, ToastData, SecurityComponent} from './shared/index';
import { Http } from '@angular/http';
import { Router } from '@angular/router';

declare var $:any;

@Component({
    selector: 'xcore-app',
    templateUrl: 'app/app.component.html',
    styles: ['app/app.component.css'],
    providers: [],
    directives: [Toasty, OffClickDirective, SecurityComponent, ROUTER_DIRECTIVES]
})
@Routes([].concat(DomainService.getRoutes()))
export class AppComponent  {
        
    private currentlyWaitingForScroll: boolean = false;

    constructor(private baseService: BaseService) {
    }

    //Setup scroll events (allows infinite paging)
    public onScroll(event: any): void {
        if (!this.currentlyWaitingForScroll) {
            this.currentlyWaitingForScroll = true;
            setTimeout(this.onScrollTimerEvent.bind(this, event),1000);
        }
    }

    public onScrollTimerEvent(event: any): void  {
        this.baseService.scrollService.checkNearBottom();
        this.currentlyWaitingForScroll = false;
    }
    
}


