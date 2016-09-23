import { FilterService } from '../shared/filtering/filter.service';
import { BaseService } from '../shared/service/base.service';
import { IFilterDefinition, IComponentOptions, IFilterIdListMapping, IFilterSetupObject } from '../shared/filtering/filter.service';
import { Observable } from 'rxjs';
import { ServiceProviderService, IServiceProvidersToClientFilter } from './serviceprovider.service';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { TraceMethodPosition } from '../shared/logging/logging.service';
import * as moment from 'moment';

@Injectable()
export class ServiceProviderFilterService extends FilterService<IServiceProvidersToServerFilter, IServiceProvidersToClientFilter> {


    constructor(protected baseService: BaseService, private service: ServiceProviderService) {
        super(baseService)
        
        var trace = this.baseService.classTrace("constructor");
        trace(TraceMethodPosition.Entry);
        
        var emptyFilterDefinition = () => {
            return <IFilterDefinition<IServiceProvidersToServerFilter, IServiceProvidersToClientFilter>>{
                toClientFilter: { rows: [], rowCount: 0 },
                toServerFilter: { npi: "", name: "", number: "", pharmacyType: null, pharmacyTypeDesc: "" }            
            };
        }
        
        this.initialize(this, emptyFilterDefinition,
                { autoApplyFilter: false }, [], this.initializeFilterFunction, this.filterSummaryFunction, this.filterResetFunction, this.applyFilterFunction);

        trace(TraceMethodPosition.Exit);

    }
    

    protected filterSummaryFunction(filter: IFilterDefinition<IServiceProvidersToServerFilter, IServiceProvidersToClientFilter>): string  {

        var trace = this.baseService.classTrace("filterSummaryFunction");
        trace(TraceMethodPosition.Entry);

        var toServerFilter = filter.toServerFilter;
        var toClientFilter = filter.toClientFilter;

        var filterSummary = "";
        if (toServerFilter.npi) filterSummary += this.addAnd(filterSummary) + "NPI contains '" + (toServerFilter.npi || "") + "'";
        if (toServerFilter.name) filterSummary += this.addAnd(filterSummary) + "Pharmacy Name contains '" + (toServerFilter.name || "") + "'";
        if (toServerFilter.number) filterSummary += this.addAnd(filterSummary) + "Store Number contains '" + (toServerFilter.number || "") + "'";
        if (toServerFilter.pharmacyType && !_.isNaN(new Number(toServerFilter.pharmacyType))) filterSummary += this.addAnd(filterSummary) + "Pharmacy Type = '" + (toServerFilter.pharmacyTypeDesc || "") + "'";
        trace(TraceMethodPosition.Exit);

        return filterSummary;
    } 

    protected initializeFilterFunction() : Observable<IServiceProvidersToClientFilter> {
        
        var trace = this.baseService.classTrace("initializeFilterFunction");
        trace(TraceMethodPosition.Entry);
        var obs = this.service.get(null, null, this.emptyFilterDefinition().toServerFilter);
        trace(TraceMethodPosition.Exit);
        return obs;

    }

    protected filterResetFunction (filter: IServiceProvidersToServerFilter) : Observable<IFilterDefinition<IServiceProvidersToServerFilter, IServiceProvidersToClientFilter>> {

        var trace = this.baseService.classTrace("filterResetFunction");
        trace(TraceMethodPosition.Entry);
        var obs = this.service.get(null, null, this.emptyFilterDefinition().toServerFilter).map<IFilterDefinition<IServiceProvidersToServerFilter, IServiceProvidersToClientFilter>>(cf => {
            return { toClientFilter: cf, toServerFilter: this.emptyFilterDefinition().toServerFilter }
        });
        trace(TraceMethodPosition.Exit);
        return obs;
    }

    protected applyFilterFunction (filter: IServiceProvidersToServerFilter) : Observable<IFilterDefinition<IServiceProvidersToServerFilter, IServiceProvidersToClientFilter>> {
        var trace = this.baseService.classTrace("applyFilterfunction");
        trace(TraceMethodPosition.Entry);
        var obs = this.service.get(null, null, filter).map<IFilterDefinition<IServiceProvidersToServerFilter, IServiceProvidersToClientFilter>>(cf => {
            return { toClientFilter: cf, toServerFilter: this.currentFilter.toServerFilter }
        });
        trace(TraceMethodPosition.Exit);
        return obs;
    }


}


export interface IServiceProvidersToServerFilter {
    npi: string;
    name: string;
    number: string;
    pharmacyType: number;
    pharmacyTypeDesc: string;
}
