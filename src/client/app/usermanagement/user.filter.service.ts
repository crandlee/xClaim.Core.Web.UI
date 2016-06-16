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
                toClientFilter: { Rows: [], RowCount: 0, Statuses: this.userService.defaultStatuses },
                toServerFilter: { UserName: null, Email: null, FullName: null, Status: "All"  }            
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
        if (toServerFilter.UserName) filterSummary += "User Name contains '" + (toServerFilter.UserName || "") + "'";
        if (toServerFilter.FullName) filterSummary += this.addAnd(filterSummary) + "Full Name contains '" + (toServerFilter.FullName || "") + "'";
        if (toServerFilter.Email) filterSummary += this.addAnd(filterSummary) + "Email contains '" + (toServerFilter.Email || "") + "'";
        if (toServerFilter.Status && toServerFilter.Status !== "All") filterSummary += this.addAnd(filterSummary) + "Status = " + (toServerFilter.Status || "") + "";
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
    UserName: string;
    FullName: string;
    Email: string;
    Status: string;
}

