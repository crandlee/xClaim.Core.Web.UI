import { Component, ViewChild, Renderer } from '@angular/core';
import { FilterComponent } from '../shared/filtering/filter.component';
import { MemberFilterService, IMembersToServerFilter } from './member.filter.service';
import { BaseService } from '../shared/service/base.service';
import { IMembersToClientFilter } from './member.service';

@Component({
    moduleId: module.id,
    selector: "memberfilter",
    styleUrls: ['member.filter.component.css'],
    templateUrl: 'member.filter.component.html'
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

