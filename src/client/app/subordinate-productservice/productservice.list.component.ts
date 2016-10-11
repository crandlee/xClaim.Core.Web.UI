import { Component, ViewChild } from '@angular/core';
import { BaseService } from '../shared/service/base.service';
import { XCoreListComponent } from '../shared/component/list.component';
import { HubService } from '../shared/hub/hub.service';
import { NgTableComponent }  from '../shared/table/table.component';
import { INgTableColumn, INgTableConfig, INgTableRow, INgTableChangeMessage } from '../shared/table/table.component';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { IDataService, ICollectionViewModel } from '../shared/service/base.service';
import { ProductServiceService, IProductService, IProductServiceViewModel, IProductServicesToClientFilter } from './productservice.service';
import { ProductServiceFilterComponent } from './productservice.filter.component';
import { ProductServiceFilterService, IProductServicesToServerFilter } from './productservice.filter.service';
import { Observable } from 'rxjs';
import { IFilterDefinition, IFilterService } from '../shared/filtering/filter.service';
import { TraceMethodPosition } from '../shared/logging/logging.service';

@Component({
    moduleId: module.id,    
    styleUrls: ['productservice.list.component.css'],
    templateUrl: 'productservice.list.component.html'
})
export class ProductServiceListComponent extends XCoreListComponent<IProductService, IProductServiceViewModel, IProductServicesToServerFilter, IProductServicesToClientFilter> {
    
    @ViewChild(NgTableComponent) tableComponent: NgTableComponent;


    constructor(protected baseService: BaseService, private service: ProductServiceService, private specificfilterService: ProductServiceFilterService) {
        super(baseService);
        this.initializeTrace("ProductServiceListComponent");
    }

    public ngOnInit() {
        this.initializeWith([
            { title: "NDC", name: "productServiceId", colWidth: 3, sort: "asc" },
            { title: "Name", name: "drugDetails.label", colWidth: 8 },
            { title: "View", name: "View", colWidth: 1, editRow: true },        
        ], this.specificfilterService, this.service);  
    }

    public ngAfterViewInit() {
        this.NotifyLoaded("ProductServiceList");
        super.initialize(this.tableComponent);
    }
    
    public edit(row: INgTableRow): void {
        var trace = this.classTrace("edit");
        trace(TraceMethodPosition.Entry);
        if (!row || !row.id) throw Error("Invalid row");
        var url = `/productservices/${row.id}`;
        this.baseService.router.navigate([url]);
        trace(TraceMethodPosition.Exit);            
    }
    
    

    public reload() {
        window.location.reload();
    }
}