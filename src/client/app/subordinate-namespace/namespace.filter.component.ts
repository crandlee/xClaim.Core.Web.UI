import { Component, ViewChild, Renderer } from '@angular/core';
import { FilterComponent } from '../shared/filtering/filter.component';
import { NamespaceFilterService, INamespacesToServerFilter } from './namespace.filter.service';
import { BaseService } from '../shared/service/base.service';
import { INamespacesToClientFilter } from './namespace.service';

@Component({
    moduleId: module.id,
    selector: "namespacefilter",
    styleUrls: ['namespace.filter.component.css'],
    templateUrl: 'namespace.filter.component.html'
})
export class NamespaceFilterComponent extends FilterComponent<INamespacesToServerFilter, INamespacesToClientFilter> {
    
    @ViewChild('name') focusRef: any;
    public self:FilterComponent<INamespacesToServerFilter, INamespacesToClientFilter> = this;

    
    constructor(protected baseService: BaseService, private namespaceFilterService: NamespaceFilterService, private renderer: Renderer) {

        super(baseService, namespaceFilterService);
        
    }

    
    ngOnInit() {

    }

}

