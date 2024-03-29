import { Component, ViewChild } from '@angular/core';
import { BaseService } from '../shared/service/base.service';
import { XCoreListComponent } from '../shared/component/list.component';
import { HubService } from '../shared/hub/hub.service';
import { NgTableComponent }  from '../shared/table/table.component';
import { INgTableColumn, INgTableConfig, INgTableRow, INgTableChangeMessage } from '../shared/table/table.component';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { IDataService, ICollectionViewModel } from '../shared/service/base.service';
import { ClaimService, IClaim, IClaimViewModel, IClaimsToClientFilter } from './claim.service';
import { ClaimFilterComponent } from './claim.filter.component';
import { ClaimFilterService, IClaimsToServerFilter } from './claim.filter.service';
import { Observable } from 'rxjs';
import { IFilterDefinition, IFilterService } from '../shared/filtering/filter.service';
import { TraceMethodPosition } from '../shared/logging/logging.service';
import { OverpunchService } from './overpunch.service'

@Component({
    moduleId: module.id,    
    styleUrls: ['claim.list.component.css'],
    templateUrl: 'claim.list.component.html',
    providers: [ClaimService, ClaimFilterService, OverpunchService]
})
export class ClaimListComponent extends XCoreListComponent<IClaim, IClaimViewModel, IClaimsToServerFilter, IClaimsToClientFilter> {
    
    @ViewChild(NgTableComponent) tableComponent: NgTableComponent;


    constructor(protected baseService: BaseService, private claimService: ClaimService, private claimFilterService: ClaimFilterService) {
        super(baseService);
        this.initializeTrace("ClaimsListComponent");
    }

    public ngOnInit() {
        this.initializeWith([
            { title: "Authorization Number", name: "authorizationNumber", colWidth: 2 },
            { title: "Processed Date", name: "processedDate", isDate: true, colWidth: 2, sort: "desc" },
            { title: "Fill Date", name: "dateOfService", isDate: true, colWidth: 2 },
            { title: "Pharmacy Id", name: "serviceProviderId", colWidth: 2 },
            { title: "Prescription Number", name: "prescriptionRefNumber", colWidth: 2 },
            { title: "Response", name: "secondaryPacketType", colWidth: 1 },
            { title: "View", name: "View", colWidth: 1, editRow: true }      
        ], this.claimFilterService, this.claimService);  
    }

    public ngAfterViewInit() {
        this.NotifyLoaded("ClaimsList");
        super.initialize(this.tableComponent);
    }

    public viewClaim(row: INgTableRow): void {
        var trace = this.classTrace("viewClaim");
        trace(TraceMethodPosition.Entry);
        if (!row || !row.id) throw Error("Invalid row");
        var url = `/packet/${row.id}`;
        this.baseService.router.navigate([url]);
        trace(TraceMethodPosition.Exit);            
    }

    public reload() {
        window.location.reload();
    }
}