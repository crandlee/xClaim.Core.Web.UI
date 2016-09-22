import { Component, ViewChild, Renderer } from '@angular/core';
import { FilterComponent } from '../shared/filtering/filter.component';
import { MemberFilterService, IMembersToServerFilter } from './member.filter.service';
import { BaseService } from '../shared/service/base.service';
import { ACCORDION_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { IMembersToClientFilter } from './member.service';
import { OffClickDirective } from '../shared/off-click/off-click.directive';
//import { DATEPICKER_DIRECTIVES } from 'ng2-bootstrap/components/datepicker'
//import * as moment from 'moment';

@Component({
    moduleId: module.id,
    selector: "memberfilter",
    styleUrls: ['member.filter.component.css'],
    templateUrl: 'member.filter.component.html',
    providers: [],
    directives: [/*DATEPICKER_DIRECTIVES,*/ ACCORDION_DIRECTIVES, OffClickDirective]
})
export class MemberFilterComponent extends FilterComponent<IMembersToServerFilter, IMembersToClientFilter> {
    
    @ViewChild('memberId') focusRef: any;
    public self:FilterComponent<IMembersToServerFilter, IMembersToClientFilter> = this;


    
    constructor(protected baseService: BaseService, private memberFilterService: MemberFilterService, private renderer: Renderer) {

        super(baseService, memberFilterService);
        
    }

    
    ngOnInit() {

    }

}

