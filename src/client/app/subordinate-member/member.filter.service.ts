import { FilterService } from '../shared/filtering/filter.service';
import { BaseService } from '../shared/service/base.service';
import { IFilterDefinition, IComponentOptions, IFilterIdListMapping, IFilterSetupObject } from '../shared/filtering/filter.service';
import { Observable } from 'rxjs';
import { MemberService, IMembersToClientFilter } from './member.service';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { TraceMethodPosition } from '../shared/logging/logging.service';
import * as moment from 'moment';

@Injectable()
export class MemberFilterService extends FilterService<IMembersToServerFilter, IMembersToClientFilter> {


    constructor(protected baseService: BaseService, private service: MemberService) {
        super(baseService)
        
        var trace = this.baseService.classTrace("constructor");
        trace(TraceMethodPosition.Entry);
        
        var emptyFilterDefinition = () => {
            return <IFilterDefinition<IMembersToServerFilter, IMembersToClientFilter>>{
                toClientFilter: { rows: [], rowCount: 0 },
                toServerFilter: { memberId: "", firstName: "", lastName: "" }            
            };
        }

        this.initialize(this, emptyFilterDefinition,
                { autoApplyFilter: false }, [], this.initializeFilterFunction, this.filterSummaryFunction, this.filterResetFunction, this.applyFilterFunction);

        trace(TraceMethodPosition.Exit);

    }
    

    protected filterSummaryFunction(filter: IFilterDefinition<IMembersToServerFilter, IMembersToClientFilter>): string  {

        var trace = this.baseService.classTrace("filterSummaryFunction");
        trace(TraceMethodPosition.Entry);

        var toServerFilter = filter.toServerFilter;
        var toClientFilter = filter.toClientFilter;

        var filterSummary = "";
        if (toServerFilter.memberId) filterSummary += this.addAnd(filterSummary) + "Member Id contains '" + (toServerFilter.memberId || "") + "'";
        if (toServerFilter.firstName) filterSummary += this.addAnd(filterSummary) + "First Name contains '" + (toServerFilter.firstName || "") + "'";
        if (toServerFilter.lastName) filterSummary += this.addAnd(filterSummary) + "Last Name contains '" + (toServerFilter.lastName || "") + "'";
        trace(TraceMethodPosition.Exit);

        return filterSummary;
    } 

    protected initializeFilterFunction() : Observable<IMembersToClientFilter> {
        
        var trace = this.baseService.classTrace("initializeFilterFunction");
        trace(TraceMethodPosition.Entry);
        var obs = this.service.get(null, null, this.emptyFilterDefinition().toServerFilter);
        trace(TraceMethodPosition.Exit);
        return obs;

    }

    protected filterResetFunction (filter: IMembersToServerFilter) : Observable<IFilterDefinition<IMembersToServerFilter, IMembersToClientFilter>> {

        var trace = this.baseService.classTrace("filterResetFunction");
        trace(TraceMethodPosition.Entry);
        var obs = this.service.get(null, null, this.emptyFilterDefinition().toServerFilter).map<IFilterDefinition<IMembersToServerFilter, IMembersToClientFilter>>(cf => {
            return { toClientFilter: cf, toServerFilter: this.emptyFilterDefinition().toServerFilter }
        });
        trace(TraceMethodPosition.Exit);
        return obs;
    }

    protected applyFilterFunction (filter: IMembersToServerFilter) : Observable<IFilterDefinition<IMembersToServerFilter, IMembersToClientFilter>> {
        var trace = this.baseService.classTrace("applyFilterfunction");
        trace(TraceMethodPosition.Entry);
        var obs = this.service.get(null, null, filter).map<IFilterDefinition<IMembersToServerFilter, IMembersToClientFilter>>(cf => {
            return { toClientFilter: cf, toServerFilter: this.currentFilter.toServerFilter }
        });
        trace(TraceMethodPosition.Exit);
        return obs;
    }


}


export interface IMembersToServerFilter {
    memberId: string;
    firstName: string;
    lastName: string;
}
