import { FilterService } from '../shared/filtering/filter.service';
import { BaseService } from '../shared/service/base.service';
import { IFilterDefinition, IComponentOptions, IFilterIdListMapping, IFilterSetupObject } from '../shared/filtering/filter.service';
import { Observable } from 'rxjs';
import { ClaimService, IClaimsToClientFilter } from './claim.service';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { TraceMethodPosition } from '../shared/logging/logging.service';


@Injectable()
export class ClaimFilterService extends FilterService<IClaimsToServerFilter, IClaimsToClientFilter> {


    constructor(protected baseService: BaseService, private claimService: ClaimService) {
        super(baseService)
        
        var trace = this.baseService.classTrace("constructor");
        trace(TraceMethodPosition.Entry);
        
        var emptyFilterDefinition = () => {
            return <IFilterDefinition<IClaimsToServerFilter, IClaimsToClientFilter>>{
                toClientFilter: { Rows: [], RowCount: 0 },
                toServerFilter: { ProcessedStartDate: null, ProcessedEndDate: null, DateOfServiceStart: null, DateOfServiceEnd: null,
                    TransactionCode: null, Bin: null, GroupId: null, Pcn: null, PrescriptionRefNumber: null, ServiceProviderId: null }            
            };
        }

        this.initialize(this, emptyFilterDefinition,
                { autoApplyFilter: false }, [], this.initializeFilterFunction, this.filterSummaryFunction, this.filterResetFunction, this.applyFilterFunction);

        trace(TraceMethodPosition.Exit);

    }
    

    protected filterSummaryFunction(filter: IFilterDefinition<IClaimsToServerFilter, IClaimsToClientFilter>): string  {

        var trace = this.baseService.classTrace("filterSummaryFunction");
        trace(TraceMethodPosition.Entry);

        var toServerFilter = filter.toServerFilter;
        var toClientFilter = filter.toClientFilter;

        var filterSummary = "";
        if (toServerFilter.ProcessedStartDate) filterSummary += this.addAnd(filterSummary) + "Processed Date >= '" + (toServerFilter.ProcessedStartDate || "") + "'";
        if (toServerFilter.ProcessedEndDate) filterSummary += this.addAnd(filterSummary) + "Processed Date <= '" + (toServerFilter.ProcessedEndDate || "") + "'";
        if (toServerFilter.DateOfServiceStart) filterSummary += this.addAnd(filterSummary) + "Fill Date >= '" + (toServerFilter.DateOfServiceStart || "") + "'";
        if (toServerFilter.DateOfServiceEnd) filterSummary += this.addAnd(filterSummary) + "Fill Date <= '" + (toServerFilter.DateOfServiceEnd || "") + "'";
        if (toServerFilter.TransactionCode) filterSummary += this.addAnd(filterSummary) + "Transaction Code = '" + (toServerFilter.TransactionCode || "") + "'";
        if (toServerFilter.Bin) filterSummary += this.addAnd(filterSummary) + "BIN contains '" + (toServerFilter.Bin || "") + "'";
        if (toServerFilter.Pcn) filterSummary += this.addAnd(filterSummary) + "PCN contains '" + (toServerFilter.Pcn || "") + "'";
        if (toServerFilter.GroupId) filterSummary += this.addAnd(filterSummary) + "Group Id contains '" + (toServerFilter.GroupId || "") + "'";
        if (toServerFilter.PrescriptionRefNumber) filterSummary += this.addAnd(filterSummary) + "Prescription Number contains '" + (toServerFilter.PrescriptionRefNumber || "") + "'";
        if (toServerFilter.ServiceProviderId) filterSummary += this.addAnd(filterSummary) + "Pharmacy Id contains '" + (toServerFilter.ServiceProviderId || "") + "'";
        trace(TraceMethodPosition.Exit);

        return filterSummary;
    } 

    protected initializeFilterFunction() : Observable<IClaimsToClientFilter> {
        
        var trace = this.baseService.classTrace("initializeFilterFunction");
        trace(TraceMethodPosition.Entry);
        var obs = this.claimService.get(null, null, this.emptyFilterDefinition().toServerFilter);
        trace(TraceMethodPosition.Exit);
        return obs;

    }

    protected filterResetFunction (filter: IClaimsToServerFilter) : Observable<IFilterDefinition<IClaimsToServerFilter, IClaimsToClientFilter>> {

        var trace = this.baseService.classTrace("filterResetFunction");
        trace(TraceMethodPosition.Entry);
        var obs = this.claimService.get(null, null, this.emptyFilterDefinition().toServerFilter).map<IFilterDefinition<IClaimsToServerFilter, IClaimsToClientFilter>>(cf => {
            return { toClientFilter: cf, toServerFilter: this.emptyFilterDefinition().toServerFilter }
        });
        trace(TraceMethodPosition.Exit);
        return obs;
    }

    protected applyFilterFunction (filter: IClaimsToServerFilter) : Observable<IFilterDefinition<IClaimsToServerFilter, IClaimsToClientFilter>> {
        var trace = this.baseService.classTrace("applyFilterfunction");
        trace(TraceMethodPosition.Entry);
        var obs = this.claimService.get(null, null, filter).map<IFilterDefinition<IClaimsToServerFilter, IClaimsToClientFilter>>(cf => {
            return { toClientFilter: cf, toServerFilter: this.currentFilter.toServerFilter }
        });
        trace(TraceMethodPosition.Exit);
        return obs;
    }


}


export interface IClaimsToServerFilter {
    ProcessedStartDate: Date;
    ProcessedEndDate: Date;
    TransactionCode: string;
    Bin: string;
    Pcn: string;
    GroupId: string;
    PrescriptionRefNumber: string;
    ServiceProviderId: string;
    DateOfServiceStart: Date;
    DateOfServiceEnd: Date;    
}

