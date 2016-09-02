import { Component, ViewChild, Renderer } from '@angular/core';
import { FilterComponent } from '../shared/filtering/filter.component';
import { NamespaceFilterService, INamespacesToServerFilter } from './namespace.filter.service';
import { BaseService } from '../shared/service/base.service';
import { ACCORDION_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { INamespacesToClientFilter } from './namespace.service';
import { OffClickDirective } from '../shared/off-click/off-click.directive';
//import { DATEPICKER_DIRECTIVES } from 'ng2-bootstrap/components/datepicker'
//import * as moment from 'moment';

@Component({
    moduleId: module.id,
    selector: "namespacefilter",
    styleUrls: ['namespace.filter.component.css'],
    templateUrl: 'namespace.filter.component.html',
    providers: [],
    directives: [/*DATEPICKER_DIRECTIVES,*/ ACCORDION_DIRECTIVES, OffClickDirective]
})
export class NamespaceFilterComponent extends FilterComponent<INamespacesToServerFilter, INamespacesToClientFilter> {
    
    @ViewChild('name') focusRef: any;
    public self:FilterComponent<INamespacesToServerFilter, INamespacesToClientFilter> = this;


    // private isDate(dateString: string): boolean {
    //     var date = new Date(dateString);
    //     return date instanceof Date && !isNaN(date.valueOf())
    // }

    
    constructor(protected baseService: BaseService, private namespaceFilterService: NamespaceFilterService, private renderer: Renderer) {

        super(baseService, namespaceFilterService);
        
    }

    
    ngOnInit() {

    }

}

