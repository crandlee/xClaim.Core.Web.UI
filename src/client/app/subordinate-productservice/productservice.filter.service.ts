import { FilterService } from '../shared/filtering/filter.service';
import { BaseService } from '../shared/service/base.service';
import { IFilterDefinition, IComponentOptions, IFilterIdListMapping, IFilterSetupObject } from '../shared/filtering/filter.service';
import { Observable } from 'rxjs';
import { ProductServiceService, IProductServicesToClientFilter } from './productservice.service';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { TraceMethodPosition } from '../shared/logging/logging.service';
import * as moment from 'moment';

@Injectable()
export class ProductServiceFilterService extends FilterService<IProductServicesToServerFilter, IProductServicesToClientFilter> {


    constructor(protected baseService: BaseService, private service: ProductServiceService) {
        super(baseService)
        
        var trace = this.baseService.classTrace("constructor");
        trace(TraceMethodPosition.Entry);
        
        var emptyFilterDefinition = () => {
            return <IFilterDefinition<IProductServicesToServerFilter, IProductServicesToClientFilter>>{
                toClientFilter: { rows: [], rowCount: 0 },
                toServerFilter: { ndc: "", name: "" }            
            };
        }
        
        this.initialize(this, emptyFilterDefinition,
                { autoApplyFilter: false }, [], this.initializeFilterFunction, this.filterSummaryFunction, this.filterResetFunction, this.applyFilterFunction);

        trace(TraceMethodPosition.Exit);

    }
    

    protected filterSummaryFunction(filter: IFilterDefinition<IProductServicesToServerFilter, IProductServicesToClientFilter>): string  {

        var trace = this.baseService.classTrace("filterSummaryFunction");
        trace(TraceMethodPosition.Entry);

        var toServerFilter = filter.toServerFilter;
        var toClientFilter = filter.toClientFilter;

        var filterSummary = "";
        if (toServerFilter.ndc) filterSummary += this.addAnd(filterSummary) + "NDC contains '" + (toServerFilter.ndc || "") + "'";
        if (toServerFilter.name) filterSummary += this.addAnd(filterSummary) + "Name contains '" + (toServerFilter.name || "") + "'";
        trace(TraceMethodPosition.Exit);

        return filterSummary;
    } 

    protected initializeFilterFunction() : Observable<IProductServicesToClientFilter> {
        
        var trace = this.baseService.classTrace("initializeFilterFunction");
        trace(TraceMethodPosition.Entry);
        var obs = this.service.get(null, null, this.emptyFilterDefinition().toServerFilter);
        trace(TraceMethodPosition.Exit);
        return obs;

    }

    protected filterResetFunction (filter: IProductServicesToServerFilter) : Observable<IFilterDefinition<IProductServicesToServerFilter, IProductServicesToClientFilter>> {

        var trace = this.baseService.classTrace("filterResetFunction");
        trace(TraceMethodPosition.Entry);
        var obs = this.service.get(null, null, this.emptyFilterDefinition().toServerFilter).map<IFilterDefinition<IProductServicesToServerFilter, IProductServicesToClientFilter>>(cf => {
            return { toClientFilter: cf, toServerFilter: this.emptyFilterDefinition().toServerFilter }
        });
        trace(TraceMethodPosition.Exit);
        return obs;
    }

    protected applyFilterFunction (filter: IProductServicesToServerFilter) : Observable<IFilterDefinition<IProductServicesToServerFilter, IProductServicesToClientFilter>> {
        var trace = this.baseService.classTrace("applyFilterfunction");
        trace(TraceMethodPosition.Entry);
        var obs = this.service.get(null, null, filter).map<IFilterDefinition<IProductServicesToServerFilter, IProductServicesToClientFilter>>(cf => {
            return { toClientFilter: cf, toServerFilter: this.currentFilter.toServerFilter }
        });
        trace(TraceMethodPosition.Exit);
        return obs;
    }


}


export interface IProductServicesToServerFilter {
    ndc: string;
    name: string;
}
