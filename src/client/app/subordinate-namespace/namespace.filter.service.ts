import { FilterService } from '../shared/filtering/filter.service';
import { BaseService } from '../shared/service/base.service';
import { IFilterDefinition, IComponentOptions, IFilterIdListMapping, IFilterSetupObject } from '../shared/filtering/filter.service';
import { Observable } from 'rxjs';
import { NamespaceService, INamespacesToClientFilter } from './namespace.service';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { TraceMethodPosition } from '../shared/logging/logging.service';
import * as moment from 'moment';

@Injectable()
export class NamespaceFilterService extends FilterService<INamespacesToServerFilter, INamespacesToClientFilter> {


    constructor(protected baseService: BaseService, private namespaceService: NamespaceService) {
        super(baseService)
        
        var trace = this.baseService.classTrace("constructor");
        trace(TraceMethodPosition.Entry);
        
        var emptyFilterDefinition = () => {
            return <IFilterDefinition<INamespacesToServerFilter, INamespacesToClientFilter>>{
                toClientFilter: { rows: [], rowCount: 0 },
                toServerFilter: { name: null, description: null }            
            };
        }

        this.initialize(this, emptyFilterDefinition,
                { autoApplyFilter: false }, [], this.initializeFilterFunction, this.filterSummaryFunction, this.filterResetFunction, this.applyFilterFunction);

        trace(TraceMethodPosition.Exit);

    }
    

    protected filterSummaryFunction(filter: IFilterDefinition<INamespacesToServerFilter, INamespacesToClientFilter>): string  {

        var trace = this.baseService.classTrace("filterSummaryFunction");
        trace(TraceMethodPosition.Entry);

        var toServerFilter = filter.toServerFilter;
        var toClientFilter = filter.toClientFilter;

        var filterSummary = "";
        if (toServerFilter.name) filterSummary += this.addAnd(filterSummary) + "Name contains '" + (toServerFilter.name || "") + "'";
        if (toServerFilter.description) filterSummary += this.addAnd(filterSummary) + "Description contains '" + (toServerFilter.description || "") + "'";
        trace(TraceMethodPosition.Exit);

        return filterSummary;
    } 

    protected initializeFilterFunction() : Observable<INamespacesToClientFilter> {
        
        var trace = this.baseService.classTrace("initializeFilterFunction");
        trace(TraceMethodPosition.Entry);
        var obs = this.namespaceService.get(null, null, this.emptyFilterDefinition().toServerFilter);
        trace(TraceMethodPosition.Exit);
        return obs;

    }

    protected filterResetFunction (filter: INamespacesToServerFilter) : Observable<IFilterDefinition<INamespacesToServerFilter, INamespacesToClientFilter>> {

        var trace = this.baseService.classTrace("filterResetFunction");
        trace(TraceMethodPosition.Entry);
        var obs = this.namespaceService.get(null, null, this.emptyFilterDefinition().toServerFilter).map<IFilterDefinition<INamespacesToServerFilter, INamespacesToClientFilter>>(cf => {
            return { toClientFilter: cf, toServerFilter: this.emptyFilterDefinition().toServerFilter }
        });
        trace(TraceMethodPosition.Exit);
        return obs;
    }

    protected applyFilterFunction (filter: INamespacesToServerFilter) : Observable<IFilterDefinition<INamespacesToServerFilter, INamespacesToClientFilter>> {
        var trace = this.baseService.classTrace("applyFilterfunction");
        trace(TraceMethodPosition.Entry);
        var obs = this.namespaceService.get(null, null, filter).map<IFilterDefinition<INamespacesToServerFilter, INamespacesToClientFilter>>(cf => {
            return { toClientFilter: cf, toServerFilter: this.currentFilter.toServerFilter }
        });
        trace(TraceMethodPosition.Exit);
        return obs;
    }


}


export interface INamespacesToServerFilter {
    name: string;
    description: string;
}
