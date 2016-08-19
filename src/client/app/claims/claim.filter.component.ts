import { Component, ViewChild, Renderer } from '@angular/core';
import { FilterComponent } from '../shared/filtering/filter.component';
import { ClaimFilterService, IClaimsToServerFilter } from './claim.filter.service';
import { BaseService } from '../shared/service/base.service';
import { ACCORDION_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { IClaimsToClientFilter } from './claim.service';
import { OffClickDirective } from '../shared/off-click/off-click.directive';

@Component({
    moduleId: module.id,
    selector: "claimfilter",
    styleUrls: ['claim.filter.component.css'],
    templateUrl: 'claim.filter.component.html',
    providers: [],
    directives: [ACCORDION_DIRECTIVES, OffClickDirective]
})
export class ClaimFilterComponent extends FilterComponent<IClaimsToServerFilter, IClaimsToClientFilter> {
    
    @ViewChild('dateOfServiceStart') focusRef: any;
    public self:FilterComponent<IClaimsToServerFilter, IClaimsToClientFilter> = this;

    constructor(protected baseService: BaseService, private claimFilterService: ClaimFilterService, private renderer: Renderer) {

        super(baseService, claimFilterService);
        
    }

    ngOnInit() {

    }

}

