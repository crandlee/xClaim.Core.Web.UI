import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { AppSettings } from '../../appsettings';
declare var $:any;

@Injectable()
export class ScrollService {

    private ScrollNearBottomSource = new Subject<IScrollInfo>();    
    private nearBottom: boolean = false;

    public ScrollNearBottomEvent = this.ScrollNearBottomSource.asObservable().share();
    constructor(private appSettings: AppSettings) {}

    public get isNearBottom() {
        this.checkNearBottom();
        return this.nearBottom;
    }

    public checkNearBottom(): void {
        setTimeout(() => {
            var scrollElem = $(window.document.body);
            var height:number = $(window).height();
            if($(window).scrollTop() + height > $(window.document).height() - this.appSettings.DefaultNearBottomPixels) {
                this.notifyNearBottom(height);
            }
            if(this.nearBottom && $(window).scrollTop() + height <= $(window.document).height() - this.appSettings.DefaultNearBottomPixels) {
                this.notifyAwayFromBottom();
            }        
        },500);
    }

    public notifyNearBottom(positionY: number): void {
        this.ScrollNearBottomSource.next({ positionY: positionY });
        this.nearBottom = true;
    }

    public notifyAwayFromBottom(): void {
        this.nearBottom = false;
    }
}

export interface IScrollInfo {
    positionY: number
}