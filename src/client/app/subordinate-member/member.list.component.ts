import { Component, ViewChild } from '@angular/core';
import { BaseService } from '../shared/service/base.service';
import { XCoreListComponent } from '../shared/component/list.component';
import { HubService } from '../shared/hub/hub.service';
import { NgTableComponent }  from '../shared/table/table.component';
import { INgTableColumn, INgTableConfig, INgTableRow, INgTableChangeMessage } from '../shared/table/table.component';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { IDataService, ICollectionViewModel } from '../shared/service/base.service';
import { MemberService, IMember, IMemberViewModel, IMembersToClientFilter } from './member.service';
import { MemberFilterComponent } from './member.filter.component';
import { MemberFilterService, IMembersToServerFilter } from './member.filter.service';
import { Observable } from 'rxjs';
import { IFilterDefinition, IFilterService } from '../shared/filtering/filter.service';
import { TraceMethodPosition } from '../shared/logging/logging.service';

@Component({
    moduleId: module.id,    
    styleUrls: ['member.list.component.css'],
    templateUrl: 'member.list.component.html',
    providers: [MemberService, MemberFilterService],
    directives: [NgTableComponent, MemberFilterComponent]
})
export class MemberListComponent extends XCoreListComponent<IMember, IMemberViewModel, IMembersToServerFilter, IMembersToClientFilter> {
    
    @ViewChild(NgTableComponent) tableComponent: NgTableComponent;


    constructor(protected baseService: BaseService, private service: MemberService, private specificfilterService: MemberFilterService) {
        super(baseService);
        this.initializeTrace("MemberListComponent");
    }

    public ngOnInit() {
        this.initializeWith([
            { title: "Member Id", name: "memberId", colWidth: 2 },
            { title: "First Name", name: "firstName", colWidth: 2 },
            { title: "Last Name", name: "lastName", colWidth: 3 },
            { title: "Plan", name: "planName", colWidth: 3, sort: "asc" },
            { title: "Edit", name: "Edit", colWidth: 1, editRow: true },        
            { title: "Delete", name: "Delete", colWidth: 1, deleteRow: true, deleteMessage: 'Do you want to delete this member?' }
        ], this.specificfilterService, this.service);  
    }

    public ngAfterViewInit() {
        this.NotifyLoaded("MemberList");
        super.initialize(this.tableComponent);
    }

    public addNew(event: any): void {
        event.preventDefault();
        var trace = this.classTrace("addNew");
        trace(TraceMethodPosition.Entry);
        this.baseService.router.navigate(['/newmember'])
        trace(TraceMethodPosition.Exit);            
    }
    
    public edit(row: INgTableRow): void {
        var trace = this.classTrace("edit");
        trace(TraceMethodPosition.Entry);
        if (!row || !row.id) throw Error("Invalid row");
        var url = `/members/${row.id}`;
        this.baseService.router.navigate([url]);
        trace(TraceMethodPosition.Exit);            
    }
    
    public delete(row: INgTableRow): void {
        var trace = this.classTrace("delete");
        trace(TraceMethodPosition.Entry);
        if (!row || !row.id) throw Error("Invalid row");
        this.service.delete(row.id).subscribe(d => {
           if (d) {
             this.baseService.loggingService.success("Member deleted successfully");
             _.remove(this.dataViewModel.rows, u => u.id === row.id);  
             this.tableComponent.load({ rows: this.dataViewModel.rows, config: this.tableConfig });
           } 
        });
        trace(TraceMethodPosition.Exit);                        
    }
    

    public reload() {
        window.location.reload();
    }
}