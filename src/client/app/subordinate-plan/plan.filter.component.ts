import { Component, ViewChild, Renderer } from '@angular/core';
import { FilterComponent } from '../shared/filtering/filter.component';
import { PlanFilterService, IPlansToServerFilter } from './plan.filter.service';
import { BaseService } from '../shared/service/base.service';
import { ACCORDION_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { IPlansToClientFilter } from './plan.service';
import { OffClickDirective } from '../shared/off-click/off-click.directive';
//import { DATEPICKER_DIRECTIVES } from 'ng2-bootstrap/components/datepicker'
//import * as moment from 'moment';

@Component({
    moduleId: module.id,
    selector: "planfilter",
    styleUrls: ['plan.filter.component.css'],
    templateUrl: 'plan.filter.component.html',
    providers: [],
    directives: [/*DATEPICKER_DIRECTIVES,*/ ACCORDION_DIRECTIVES, OffClickDirective]
})
export class PlanFilterComponent extends FilterComponent<IPlansToServerFilter, IPlansToClientFilter> {
    
    @ViewChild('groupId') focusRef: any;
    public self:FilterComponent<IPlansToServerFilter, IPlansToClientFilter> = this;


    // private isDate(dateString: string): boolean {
    //     var date = new Date(dateString);
    //     return date instanceof Date && !isNaN(date.valueOf())
    // }

    
    constructor(protected baseService: BaseService, private planFilterService: PlanFilterService, private renderer: Renderer) {

        super(baseService, planFilterService);
        
    }

    
    ngOnInit() {

    }

}

