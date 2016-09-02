import { Component, ViewChild } from '@angular/core';
import { BaseService } from '../shared/service/base.service';
import { XCoreListComponent } from '../shared/component/list.component';
import { HubService } from '../shared/hub/hub.service';
import { NgTableComponent }  from '../shared/table/table.component';
import { INgTableColumn, INgTableConfig, INgTableRow, INgTableChangeMessage } from '../shared/table/table.component';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { IDataService, ICollectionViewModel } from '../shared/service/base.service';
import { NamespaceService, INamespace, INamespaceViewModel, INamespacesToClientFilter } from './namespace.service';
import { NamespaceFilterComponent } from './namespace.filter.component';
import { NamespaceFilterService, INamespacesToServerFilter } from './namespace.filter.service';
import { Observable } from 'rxjs';
import { IFilterDefinition, IFilterService } from '../shared/filtering/filter.service';
import { TraceMethodPosition } from '../shared/logging/logging.service';

@Component({
    moduleId: module.id,    
    styleUrls: ['namespace.list.component.css'],
    templateUrl: 'namespace.list.component.html',
    providers: [NamespaceService, NamespaceFilterService],
    directives: [NgTableComponent, NamespaceFilterComponent]
})
export class NamespaceListComponent extends XCoreListComponent<INamespace, INamespaceViewModel, INamespacesToServerFilter, INamespacesToClientFilter> {
    
    @ViewChild(NgTableComponent) tableComponent: NgTableComponent;


    constructor(protected baseService: BaseService, private service: NamespaceService, private specificfilterService: NamespaceFilterService) {
        super(baseService);
        this.initializeTrace("ClaimsListComponent");
    }

    public ngOnInit() {
        this.initializeWith([
            { title: "Name", name: "name", colWidth: 5, sort: "asc" },
            { title: "Description", name: "description", colWidth: 5 },
            { title: "Edit", name: "Edit", colWidth: 1, editRow: true },        
            { title: "Delete", name: "Delete", colWidth: 1, deleteRow: true, deleteMessage: 'Do you want to delete this namespace?' }
        ], this.specificfilterService, this.service);  
    }

    public ngAfterViewInit() {
        this.NotifyLoaded("NamespacesList");
        super.initialize(this.tableComponent);
    }

    public addNew(event: any): void {
        event.preventDefault();
        var trace = this.classTrace("addNew");
        trace(TraceMethodPosition.Entry);
        this.baseService.router.navigate(['/newnamespace'])
        trace(TraceMethodPosition.Exit);            
    }
    
    public edit(row: INgTableRow): void {
        var trace = this.classTrace("edit");
        trace(TraceMethodPosition.Entry);
        if (!row || !row.id) throw Error("Invalid row");
        var url = `/namespaces/${row.id}`;
        this.baseService.router.navigate([url]);
        trace(TraceMethodPosition.Exit);            
    }
    
    public delete(row: INgTableRow): void {
        var trace = this.classTrace("delete");
        trace(TraceMethodPosition.Entry);
        if (!row || !row.id) throw Error("Invalid row");
        this.service.delete(row.id).subscribe(d => {
           if (d) {
             this.baseService.loggingService.success("Namespace deleted successfully");
             _.remove(this.dataViewModel.rows, u => u.id === row.id);  
             this.tableComponent.load({ rows: this.dataViewModel.rows, config: this.tableConfig });
           } 
        });
        trace(TraceMethodPosition.Exit);                        
    }
    

    public reload() {
        window.location.reload();
    }}