import { FilterService } from '../shared/filtering/filter.service';
import { BaseService } from '../shared/service/base.service';
import { IFilterDefinition, IComponentOptions, IFilterIdListMapping, IFilterSetupObject } from '../shared/filtering/filter.service';
import { Observable } from 'rxjs';
import { UserService, IUsersToClientFilter } from './user.service';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { TraceMethodPosition } from '../shared/logging/logging.service';


@Injectable()
export class UserFilterService extends FilterService<IUsersToServerFilter, IUsersToClientFilter> {


    constructor(protected baseService: BaseService, private userService: UserService) {
        super(baseService)
        
        var trace = this.baseService.classTrace("constructor");
        trace(TraceMethodPosition.Entry);
        
        var emptyFilterDefinition = () => {
            return <IFilterDefinition<IUsersToServerFilter, IUsersToClientFilter>>{
                toClientFilter: { rows: [], rowCount: 0, statuses: this.userService.defaultStatuses },
                toServerFilter: { userName: null, email: null, fullName: null, status: "All"  }            
            };
        }

        this.initialize(this, emptyFilterDefinition,
                { autoApplyFilter: false }, [], this.initializeFilterFunction, this.filterSummaryFunction, this.filterResetFunction, this.applyFilterFunction);

        trace(TraceMethodPosition.Exit);

    }
    

    protected filterSummaryFunction(filter: IFilterDefinition<IUsersToServerFilter, IUsersToClientFilter>): string  {

        var trace = this.baseService.classTrace("filterSummaryFunction");
        trace(TraceMethodPosition.Entry);

        var toServerFilter = filter.toServerFilter;
        var toClientFilter = filter.toClientFilter;

        var filterSummary = "";
        if (toServerFilter.userName) filterSummary += "User Name contains '" + (toServerFilter.userName || "") + "'";
        if (toServerFilter.fullName) filterSummary += this.addAnd(filterSummary) + "Full Name contains '" + (toServerFilter.fullName || "") + "'";
        if (toServerFilter.email) filterSummary += this.addAnd(filterSummary) + "Email contains '" + (toServerFilter.email || "") + "'";
        if (toServerFilter.status && toServerFilter.status !== "All") filterSummary += this.addAnd(filterSummary) + "Status = " + (toServerFilter.status || "") + "";
        //filterSummary += this.aggregateDescription(this.selectedItems(toClientFilter.Status, toServerFilter.Statuses, "Value"), "Value", "Statuses are ", this.addAnd(filterSummary));

        trace(TraceMethodPosition.Exit);

        return filterSummary;
    } 

    protected initializeFilterFunction() : Observable<IUsersToClientFilter> {
        
        var trace = this.baseService.classTrace("initializeFilterFunction");
        trace(TraceMethodPosition.Entry);
        var obs = this.userService.get(null, null, this.emptyFilterDefinition().toServerFilter);
        trace(TraceMethodPosition.Exit);
        return obs;

    }

    protected filterResetFunction (filter: IUsersToServerFilter) : Observable<IFilterDefinition<IUsersToServerFilter, IUsersToClientFilter>> {

        var trace = this.baseService.classTrace("filterResetFunction");
        trace(TraceMethodPosition.Entry);
        var obs = this.userService.get(null, null, this.emptyFilterDefinition().toServerFilter).map<IFilterDefinition<IUsersToServerFilter, IUsersToClientFilter>>(cf => {
            return { toClientFilter: cf, toServerFilter: this.emptyFilterDefinition().toServerFilter }
        });
        trace(TraceMethodPosition.Exit);
        return obs;
    }

    protected applyFilterFunction (filter: IUsersToServerFilter) : Observable<IFilterDefinition<IUsersToServerFilter, IUsersToClientFilter>> {
        var trace = this.baseService.classTrace("applyFilterfunction");
        trace(TraceMethodPosition.Entry);
        var obs = this.userService.get(null, null, filter).map<IFilterDefinition<IUsersToServerFilter, IUsersToClientFilter>>(cf => {
            return { toClientFilter: cf, toServerFilter: this.currentFilter.toServerFilter }
        });
        trace(TraceMethodPosition.Exit);
        return obs;
    }


}


export interface IUsersToServerFilter {
    userName: string;
    fullName: string;
    email: string;
    status: string;
}

