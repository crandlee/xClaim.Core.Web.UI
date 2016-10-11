import { Component, ViewChild, Renderer } from '@angular/core';
import { FilterComponent } from '../shared/filtering/filter.component';
import { PlanFilterService, IPlansToServerFilter } from './plan.filter.service';
import { BaseService } from '../shared/service/base.service';
import { IPlansToClientFilter } from './plan.service';

@Component({
    moduleId: module.id,
    selector: "planfilter",
    styleUrls: ['plan.filter.component.css'],
    templateUrl: 'plan.filter.component.html'
})
export class PlanFilterComponent extends FilterComponent<IPlansToServerFilter, IPlansToClientFilter> {
    
    @ViewChild('groupId') focusRef: any;
    public self:FilterComponent<IPlansToServerFilter, IPlansToClientFilter> = this;

    
    constructor(protected baseService: BaseService, private planFilterService: PlanFilterService, private renderer: Renderer) {

        super(baseService, planFilterService);
        
    }

    
    ngOnInit() {

    }

}

