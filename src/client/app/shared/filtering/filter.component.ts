import { Component, OnInit, ElementRef } from '@angular/core';
import { BaseService } from '../service/base.service';
import * as _ from 'lodash';
import { FilterService, IComponentOptions, IFilterDefinition } from './filter.service';
import { XCoreBaseComponent } from '../component/base.component';
import { Subscription, Observable } from 'rxjs';
import { ACCORDION_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { TraceMethodPosition } from '../logging/logging.service';

@Component({
    moduleId: module.id,
    styleUrls: ['filter.component.css'],
    templateUrl: 'filter.component.html',
    providers: [FilterService],
    directives: [ACCORDION_DIRECTIVES]
})
export abstract class FilterComponent<TFilterToServer, TFilterToClient> extends XCoreBaseComponent  {

    private unregisterSetupCalled: Subscription;
    private mergedServiceOptions = false;
    private updateSubscription: Subscription;

    public filterOptions: { filterVisible: boolean };
    public workingArea: IWorkingArea;
    public summaryText: string = "No filter set";
    public get toServerFilter(): TFilterToServer { return this.filterService && this.filterService.currentFilter && this.filterService.currentFilter.toServerFilter }
    public get toClientFilter(): TFilterToClient { return this.filterService && this.filterService.currentFilter && this.filterService.currentFilter.toClientFilter }

    public get componentOptions(): IComponentOptions { return this.filterService.componentOptions;}
    public set componentOptions(componentOptions: IComponentOptions) { this.filterService.componentOptions = _.merge(this.filterService.componentOptions, componentOptions);}

    constructor(protected baseService: BaseService, private filterService: FilterService<TFilterToServer, TFilterToClient>) {
        super(baseService);
        this.initializeTrace("FilterComponent");  
        var trace = this.classTrace("constructor");
        trace(TraceMethodPosition.Entry);
        this.watchForServiceSetupCalled();
        trace(TraceMethodPosition.Exit);
        this.filterOptions = { filterVisible: false };
    }


    public fillWorkingArea() {
        //Currently Fills out Id variables for selected Id lists passed in the toServerFilter
        //Uses the idListMappings on the FilterService to determine which dataArray goes to a particular idArray
        this.workingArea = {};
        var toServerFilter: any = this.filterService.currentFilter.toServerFilter;
        this.filterService.idListMappings.forEach((mapping) => {
            if (toServerFilter[mapping.idArrayName]) {
                toServerFilter[mapping.idArrayName].forEach((dataId: number) => {
                    this.workingArea[mapping.dataArrayName + dataId] = true;
                });
            }
        });
    }


    //Once filter service has been configured, execute functionality that relies on that
    private watchForServiceSetupCalled() {
        var trace = this.classTrace("watchForServiceSetupCalled");
        trace(TraceMethodPosition.Entry);
        this.unregisterSetupCalled = this.filterService.SetupCalledEvent.subscribe(called => {
            this.filterService.initializeFilter().subscribe((returnFilter: IFilterDefinition<TFilterToServer, TFilterToClient>) => {
                this.unregisterSetupCalled.unsubscribe();
                this.unregisterSetupCalled = null;
                this.fillWorkingArea();
                //Keep copy of initial summary text so we can make immediate text change on Reset (since we don't have to wait
                //for the server to come back to know what it's going to be).
                this.summaryText = this.filterService.getFilterSummary();
            });            
        });
        trace(TraceMethodPosition.Exit);
    }


    //Fire this when toServerFilter changes (ngModelChange)="toServerFilterChanged($event)" 
    public toServerFilterChanged(event?: any): void {
        if (this.filterService.componentOptions && this.filterService.componentOptions.autoApplyFilter) {
            this.applyFilter(event);
        }
    }
    

    private updateFilter(filterFunction: () => Observable<IFilterDefinition<TFilterToServer, TFilterToClient>>, timer: number): Observable<IFilterDefinition<TFilterToServer, TFilterToClient>> {
        var trace = this.classTrace("updateFilter");
        trace(TraceMethodPosition.Entry);              
        this.summaryText = this.filterService.getFilterSummary();
        var obs = filterFunction.bind(this.filterService)();
        if (timer > 0) 
            obs = obs.debounceTime(timer).map((i:any) => i);
        else
            obs = obs.map((i:any) => i);
        obs.subscribe((filter: IFilterDefinition<TFilterToServer, TFilterToClient>) => {
            this.fillWorkingArea();
        });
        trace(TraceMethodPosition.Exit);
        return obs;
    }

    public applyFilter(event: any): void {        
        var trace = this.classTrace("applyFilter");
        trace(TraceMethodPosition.Entry);
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        var timeout: number = 0;
        if (this.filterService.componentOptions.autoApplyFilter) {
            timeout = (this.filterService.componentOptions && this.filterService.componentOptions.applyDelayOnAutoFilter) || 2000;            
        } else {
            this.filterOptions.filterVisible = false;
        }
        var obs = this.updateFilter(this.filterService.applyFilter, timeout);
        trace(TraceMethodPosition.Exit);
    }

    public resetFilter(event: any): Observable<IFilterDefinition<TFilterToServer, TFilterToClient>> {
        var trace = this.classTrace("resetFilter");
        trace(TraceMethodPosition.Entry);
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        this.filterOptions.filterVisible = false;
        var obs = this.updateFilter(this.filterService.resetFilter, 0);
        obs.subscribe(() => {
            this.summaryText = this.filterService.getFilterSummary();
        });
        trace(TraceMethodPosition.Exit);
        return obs;
    }

    public onOutsideClick(comp: FilterComponent<TFilterToServer, TFilterToClient>): () => void {
        return function() {
            this.filterOptions.filterVisible = false;
        }.bind(comp);
    }


    public onFilterClick(comp: FilterComponent<TFilterToServer, TFilterToClient>): () => void {
        return function() {
            //Sets up toggling filter display/setting default focus element
            this.filterOptions.filterVisible = !this.filterOptions.filterVisible;
            if (this.filterOptions.filterVisible && this.focusRef) this.renderer.invokeElementMethod(this.focusRef.nativeElement, 'focus', []);
        }.bind(comp);
    }

    public setIdList(idType: string, id: any): void {
        var trace = this.classTrace("setIdList");
        trace(TraceMethodPosition.Entry);
        
        var mapping = this.filterService.idListMappings.filter((item) => item.dataArrayName === idType);
        var toServerFilter: any = this.filterService.currentFilter.toServerFilter;  
        if (!mapping || mapping.length === 0) return;
        if (this.workingArea[idType + id]) {
            toServerFilter[mapping[0].idArrayName].push(id);                        
        } else {
            var index = toServerFilter[mapping[0].idArrayName].indexOf(id);
            if (index > -1) toServerFilter[mapping[0].idArrayName].splice(index, 1);
        }
        this.toServerFilterChanged();
        trace(TraceMethodPosition.Exit);
    }

}


export interface IWorkingArea {
    [key: string]: boolean;
}

