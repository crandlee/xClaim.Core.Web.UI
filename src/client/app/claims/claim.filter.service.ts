import { FilterService } from '../shared/filtering/filter.service';
import { BaseService } from '../shared/service/base.service';
import { IFilterDefinition, IComponentOptions, IFilterIdListMapping, IFilterSetupObject } from '../shared/filtering/filter.service';
import { Observable } from 'rxjs';
import { ClaimService, IClaimsToClientFilter } from './claim.service';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { TraceMethodPosition } from '../shared/logging/logging.service';
import * as moment from 'moment';

@Injectable()
export class ClaimFilterService extends FilterService<IClaimsToServerFilter, IClaimsToClientFilter> {


    constructor(protected baseService: BaseService, private claimService: ClaimService) {
        super(baseService)
        
        var trace = this.baseService.classTrace("constructor");
        trace(TraceMethodPosition.Entry);
        
        var emptyFilterDefinition = () => {
            return <IFilterDefinition<IClaimsToServerFilter, IClaimsToClientFilter>>{
                toClientFilter: { rows: [], rowCount: 0 },
                toServerFilter: { processedStartDate: null, processedEndDate: null, dateOfServiceStart: null, dateOfServiceEnd: null,
                    transactionCode: null, bin: null, groupId: null, pcn: null, prescriptionRefNumber: null, serviceProviderId: null }            
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
        if (toServerFilter.processedStartDate) filterSummary += this.addAnd(filterSummary) + "Processed Date >= '" + (moment(toServerFilter.processedStartDate).format("MM/DD/YYYY hh:mm:ss a") || "") + "'";
        if (toServerFilter.processedEndDate) filterSummary += this.addAnd(filterSummary) + "Processed Date <= '" + (moment(toServerFilter.processedEndDate).format("MM/DD/YYYY hh:mm:ss a") || "") + "'";
        if (toServerFilter.dateOfServiceStart) filterSummary += this.addAnd(filterSummary) + "Fill Date >= '" + (moment(toServerFilter.dateOfServiceStart).format("MM/DD/YYYY") || "") + "'";
        if (toServerFilter.dateOfServiceEnd) filterSummary += this.addAnd(filterSummary) + "Fill Date <= '" + (moment(toServerFilter.dateOfServiceEnd).format("MM/DD/YYYY") || "") + "'";
        if (toServerFilter.transactionCode) filterSummary += this.addAnd(filterSummary) + "Transaction Code = '" + (toServerFilter.transactionCode || "") + "'";
        if (toServerFilter.bin) filterSummary += this.addAnd(filterSummary) + "BIN contains '" + (toServerFilter.bin || "") + "'";
        if (toServerFilter.pcn) filterSummary += this.addAnd(filterSummary) + "PCN contains '" + (toServerFilter.pcn || "") + "'";
        if (toServerFilter.groupId) filterSummary += this.addAnd(filterSummary) + "Group Id contains '" + (toServerFilter.groupId || "") + "'";
        if (toServerFilter.prescriptionRefNumber) filterSummary += this.addAnd(filterSummary) + "Prescription Number contains '" + (toServerFilter.prescriptionRefNumber || "") + "'";
        if (toServerFilter.serviceProviderId) filterSummary += this.addAnd(filterSummary) + "Pharmacy Id contains '" + (toServerFilter.serviceProviderId || "") + "'";
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
    processedStartDate: Date;
    processedEndDate: Date;
    transactionCode: string;
    bin: string;
    pcn: string;
    groupId: string;
    prescriptionRefNumber: string;
    serviceProviderId: string;
    dateOfServiceStart: Date;
    dateOfServiceEnd: Date;    
}

