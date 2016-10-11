import { Component, ViewContainerRef } from '@angular/core';
import { BaseService, LoggingService, BusyService  } from './shared/index';


@Component({
    moduleId: module.id,
    selector: 'xcore-app',
    templateUrl: 'app.component.html',
    styles: ['app.component.css']
})
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


