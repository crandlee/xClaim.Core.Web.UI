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


@Component({
    moduleId: module.id,    
    styleUrls: ['claim.list.component.css'],
    templateUrl: 'claim.list.component.html',
    providers: [ClaimService, ClaimFilterService],
    directives: [NgTableComponent, ClaimFilterComponent]
})
export class ClaimListComponent extends XCoreListComponent<IClaim, IClaimViewModel, IClaimsToServerFilter, IClaimsToClientFilter> {
    
    @ViewChild(NgTableComponent) TableComponent: NgTableComponent;
}