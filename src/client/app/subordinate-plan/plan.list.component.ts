import { Component, ViewChild } from '@angular/core';
import { BaseService } from '../shared/service/base.service';
import { XCoreListComponent } from '../shared/component/list.component';
import { HubService } from '../shared/hub/hub.service';
import { NgTableComponent }  from '../shared/table/table.component';
import { INgTableColumn, INgTableConfig, INgTableRow, INgTableChangeMessage } from '../shared/table/table.component';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { IDataService, ICollectionViewModel } from '../shared/service/base.service';
import { PlanService, IPlan, IPlanViewModel, IPlansToClientFilter } from './plan.service';
import { PlanFilterService, IPlansToServerFilter } from './plan.filter.service';
import { Observable } from 'rxjs';
import { IFilterDefinition, IFilterService } from '../shared/filtering/filter.service';
import { TraceMethodPosition } from '../shared/logging/logging.service';

@Component({
    moduleId: module.id,    
    styleUrls: ['plan.list.component.css'],
    templateUrl: 'plan.list.component.html'
})
export class PlanListComponent extends XCoreListComponent<IPlan, IPlanViewModel, IPlansToServerFilter, IPlansToClientFilter> {
    
    @ViewChild(NgTableComponent) tableComponent: NgTableComponent;


    constructor(protected baseService: BaseService, private service: PlanService, private specificfilterService: PlanFilterService) {
        super(baseService);
        this.initializeTrace("PlanListComponent");
    }

    public ngOnInit() {
        this.initializeWith([
            { title: "BIN", name: "bin", colWidth: 2 },
            { title: "PCN", name: "pcn", colWidth: 2 },
            { title: "Group Id", name: "groupId", colWidth: 2, sort: "asc" },
            { title: "Name", name: "name", colWidth: 4 },
            { title: "Edit", name: "Edit", colWidth: 1, editRow: true },        
            { title: "Delete", name: "Delete", colWidth: 1, deleteRow: true, deleteMessage: 'Do you want to delete this plan?' }
        ], this.specificfilterService, this.service);  
    }

    public ngAfterViewInit() {
        this.NotifyLoaded("PlanList");
        super.initialize(this.tableComponent);
    }

    public addNew(event: any): void {
        event.preventDefault();
        var trace = this.classTrace("addNew");
        trace(TraceMethodPosition.Entry);
        this.baseService.router.navigate(['/newplan'])
        trace(TraceMethodPosition.Exit);            
    }
    
    public edit(row: INgTableRow): void {
        var trace = this.classTrace("edit");
        trace(TraceMethodPosition.Entry);
        if (!row || !row.id) throw Error("Invalid row");
        var url = `/plans/${row.id}`;
        this.baseService.router.navigate([url]);
        trace(TraceMethodPosition.Exit);            
    }
    
    public delete(row: INgTableRow): void {
        var trace = this.classTrace("delete");
        trace(TraceMethodPosition.Entry);
        if (!row || !row.id) throw Error("Invalid row");
        this.service.delete(row.id).subscribe(d => {
           if (d) {
             this.baseService.loggingService.success("Plan deleted successfully");
             _.remove(this.dataViewModel.rows, u => u.id === row.id);  
             this.tableComponent.load({ rows: this.dataViewModel.rows, config: this.tableConfig });
           } 
        });
        trace(TraceMethodPosition.Exit);                        
    }
    

    public reload() {
        window.location.reload();
    }}