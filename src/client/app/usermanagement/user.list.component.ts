import { Component, ViewChild } from '@angular/core';
import { BaseService } from '../shared/service/base.service';
import { XCoreListComponent } from '../shared/component/list.component';
import { HubService } from '../shared/hub/hub.service';
import { NgTableComponent }  from '../shared/table/table.component';
import { INgTableColumn, INgTableConfig, INgTableRow, INgTableChangeMessage } from '../shared/table/table.component';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { IDataService, ICollectionViewModel } from '../shared/service/base.service';

import { UserService, IUserProfile, IUserProfileViewModel, IUsersToClientFilter } from './user.service';
import { UserFilterComponent } from './user.filter.component';
import { UserFilterService, IUsersToServerFilter } from './user.filter.service';
import { Observable } from 'rxjs';
import { IFilterDefinition, IFilterService } from '../shared/filtering/filter.service';
import { TraceMethodPosition } from '../shared/logging/logging.service';


@Component({
    moduleId: module.id,    
    styleUrls: ['user.list.component.css'],
    templateUrl: 'user.list.component.html',
    providers: [UserService, UserFilterService],
    directives: [NgTableComponent, UserFilterComponent]
})
export class UserListComponent extends XCoreListComponent<IUserProfile, IUserProfileViewModel, IUsersToServerFilter, IUsersToClientFilter> {
    
    @ViewChild(NgTableComponent) TableComponent: NgTableComponent;

    constructor(protected baseService: BaseService, private userService: UserService, private userFilterService: UserFilterService) {
        super(baseService);
        this.initializeTrace("UserListComponent");
    }

    public ngOnInit() {
        this.initializeWith([
            { title: "User Name", name: "Name", colWidth: 3, sort: "asc" },
            { title: "Full Name", name: "GivenName", colWidth: 6 },
            { title: "Enabled", name: "Enabled", colWidth: 1, transform: (val: boolean) => { return val ? "Yes": "No"; } },
            { title: "Edit", name: "Edit", colWidth: 1, editRow: true },        
            { title: "Delete", name: "Delete", colWidth: 1, deleteRow: true, deleteMessage: 'Do you want to delete this user?' }
        ], this.userFilterService, this.userService);  
    }

    public ngAfterViewInit() {
        this.NotifyLoaded("UserList");
        super.initialize(this.TableComponent);
    }

    public addNew(event: any): void {
        event.preventDefault();
        var trace = this.classTrace("addNew");
        trace(TraceMethodPosition.Entry);
        this.baseService.router.navigate(['/NewUser'])
        trace(TraceMethodPosition.Exit);            
    }
    
    public editUser(row: INgTableRow): void {
        var trace = this.classTrace("editUser");
        trace(TraceMethodPosition.Entry);
        if (!row || !row.Id) throw Error("Invalid row");
        var url = `/User/${row.Id}`;
        this.baseService.router.navigate([url]);
        trace(TraceMethodPosition.Exit);            
    }
    
    public deleteUser(row: INgTableRow): void {
        var trace = this.classTrace("deleteUser");
        trace(TraceMethodPosition.Entry);
        if (!row || !row.Id) throw Error("Invalid row");
        this.userService.deleteUser(row.Id).subscribe(d => {
           if (d) {
             this.baseService.loggingService.success("User deleted successfully");
             _.remove(this.dataViewModel.Rows, u => u.Id === row.Id);  
             this.TableComponent.load({ rows: this.dataViewModel.Rows, config: this.tableConfig });
           } 
        });
        trace(TraceMethodPosition.Exit);                        
    }
    

}

