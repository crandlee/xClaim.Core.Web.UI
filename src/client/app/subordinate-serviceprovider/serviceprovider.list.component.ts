import { Component, ViewChild } from '@angular/core';
import { BaseService } from '../shared/service/base.service';
import { XCoreListComponent } from '../shared/component/list.component';
import { HubService } from '../shared/hub/hub.service';
import { NgTableComponent }  from '../shared/table/table.component';
import { INgTableColumn, INgTableConfig, INgTableRow, INgTableChangeMessage } from '../shared/table/table.component';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { IDataService, ICollectionViewModel } from '../shared/service/base.service';
import { ServiceProviderService, IServiceProvider, IServiceProviderViewModel, IServiceProvidersToClientFilter } from './serviceprovider.service';
import { ServiceProviderFilterService, IServiceProvidersToServerFilter } from './serviceprovider.filter.service';
import { Observable } from 'rxjs';
import { IFilterDefinition, IFilterService } from '../shared/filtering/filter.service';
import { TraceMethodPosition } from '../shared/logging/logging.service';

@Component({
    moduleId: module.id,    
    styleUrls: ['serviceprovider.list.component.css'],
    templateUrl: 'serviceprovider.list.component.html'
})
export class ServiceProviderListComponent extends XCoreListComponent<IServiceProvider, IServiceProviderViewModel, IServiceProvidersToServerFilter, IServiceProvidersToClientFilter> {
    
    @ViewChild(NgTableComponent) tableComponent: NgTableComponent;


    constructor(protected baseService: BaseService, private service: ServiceProviderService, private specificfilterService: ServiceProviderFilterService) {
        super(baseService);
        this.initializeTrace("ServiceProviderListComponent");
    }

    public ngOnInit() {
        this.initializeWith([
            { title: "NPI", name: "npi", colWidth: 2, sort: "asc" },
            { title: "Store Name", name: "name", colWidth: 2 },
            { title: "Store Number", name: "storeNumber", colWidth: 3 },
            { title: "Pharmacy Type", name: "typeName", colWidth: 3 },
            { title: "Edit", name: "Edit", colWidth: 1, editRow: true },        
            { title: "Delete", name: "Delete", colWidth: 1, deleteRow: true, deleteMessage: 'Do you want to delete this pharmacy?' }
        ], this.specificfilterService, this.service);  
    }

    public ngAfterViewInit() {
        this.NotifyLoaded("ServiceProviderList");
        super.initialize(this.tableComponent);
    }

    public addNew(event: any): void {
        event.preventDefault();
        var trace = this.classTrace("addNew");
        trace(TraceMethodPosition.Entry);
        this.baseService.router.navigate(['/newserviceprovider'])
        trace(TraceMethodPosition.Exit);            
    }
    
    public edit(row: INgTableRow): void {
        var trace = this.classTrace("edit");
        trace(TraceMethodPosition.Entry);
        if (!row || !row.id) throw Error("Invalid row");
        var url = `/serviceproviders/${row.id}`;
        this.baseService.router.navigate([url]);
        trace(TraceMethodPosition.Exit);            
    }
    
    public delete(row: INgTableRow): void {
        var trace = this.classTrace("delete");
        trace(TraceMethodPosition.Entry);
        if (!row || !row.id) throw Error("Invalid row");
        this.service.delete(row.id).subscribe(d => {
           if (d) {
             this.baseService.loggingService.success("Pharmacy deleted successfully");
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