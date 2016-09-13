import { FilterService } from '../shared/filtering/filter.service';
import { BaseService } from '../shared/service/base.service';
import { IFilterDefinition, IComponentOptions, IFilterIdListMapping, IFilterSetupObject } from '../shared/filtering/filter.service';
import { Observable } from 'rxjs';
import { PlanService, IPlansToClientFilter } from './plan.service';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { TraceMethodPosition } from '../shared/logging/logging.service';
import * as moment from 'moment';

@Injectable()
export class PlanFilterService extends FilterService<IPlansToServerFilter, IPlansToClientFilter> {


    constructor(protected baseService: BaseService, private service: PlanService) {
        super(baseService)
        
        var trace = this.baseService.classTrace("constructor");
        trace(TraceMethodPosition.Entry);
        
        var emptyFilterDefinition = () => {
            return <IFilterDefinition<IPlansToServerFilter, IPlansToClientFilter>>{
                toClientFilter: { rows: [], rowCount: 0 },
                toServerFilter: { name: null, bin: null, pcn: null, groupId: null }            
            };
        }

        this.initialize(this, emptyFilterDefinition,
                { autoApplyFilter: false }, [], this.initializeFilterFunction, this.filterSummaryFunction, this.filterResetFunction, this.applyFilterFunction);

        trace(TraceMethodPosition.Exit);

    }
    

    protected filterSummaryFunction(filter: IFilterDefinition<IPlansToServerFilter, IPlansToClientFilter>): string  {

        var trace = this.baseService.classTrace("filterSummaryFunction");
        trace(TraceMethodPosition.Entry);

        var toServerFilter = filter.toServerFilter;
        var toClientFilter = filter.toClientFilter;

        var filterSummary = "";
        if (toServerFilter.name) filterSummary += this.addAnd(filterSummary) + "Name contains '" + (toServerFilter.name || "") + "'";
        if (toServerFilter.bin) filterSummary += this.addAnd(filterSummary) + "BIN contains '" + (toServerFilter.bin || "") + "'";
        if (toServerFilter.pcn) filterSummary += this.addAnd(filterSummary) + "PCN contains '" + (toServerFilter.pcn || "") + "'";
        if (toServerFilter.groupId) filterSummary += this.addAnd(filterSummary) + "GroupId contains '" + (toServerFilter.groupId || "") + "'";
        trace(TraceMethodPosition.Exit);

        return filterSummary;
    } 

    protected initializeFilterFunction() : Observable<IPlansToClientFilter> {
        
        var trace = this.baseService.classTrace("initializeFilterFunction");
        trace(TraceMethodPosition.Entry);
        var obs = this.service.get(null, null, this.emptyFilterDefinition().toServerFilter);
        trace(TraceMethodPosition.Exit);
        return obs;

    }

    protected filterResetFunction (filter: IPlansToServerFilter) : Observable<IFilterDefinition<IPlansToServerFilter, IPlansToClientFilter>> {

        var trace = this.baseService.classTrace("filterResetFunction");
        trace(TraceMethodPosition.Entry);
        var obs = this.service.get(null, null, this.emptyFilterDefinition().toServerFilter).map<IFilterDefinition<IPlansToServerFilter, IPlansToClientFilter>>(cf => {
            return { toClientFilter: cf, toServerFilter: this.emptyFilterDefinition().toServerFilter }
        });
        trace(TraceMethodPosition.Exit);
        return obs;
    }

    protected applyFilterFunction (filter: IPlansToServerFilter) : Observable<IFilterDefinition<IPlansToServerFilter, IPlansToClientFilter>> {
        var trace = this.baseService.classTrace("applyFilterfunction");
        trace(TraceMethodPosition.Entry);
        var obs = this.service.get(null, null, filter).map<IFilterDefinition<IPlansToServerFilter, IPlansToClientFilter>>(cf => {
            return { toClientFilter: cf, toServerFilter: this.currentFilter.toServerFilter }
        });
        trace(TraceMethodPosition.Exit);
        return obs;
    }


}


export interface IPlansToServerFilter {
    name: string;
    bin: string;
    pcn: string;
    groupId: string;
}
