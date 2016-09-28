import { Component, ViewChild, Renderer } from '@angular/core';
import { FilterComponent } from '../shared/filtering/filter.component';
import { ProductServiceFilterService, IProductServicesToServerFilter } from './productservice.filter.service';
import { BaseService } from '../shared/service/base.service';
import { ACCORDION_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { IProductServicesToClientFilter } from './productservice.service';
import { OffClickDirective } from '../shared/off-click/off-click.directive';
//import { DATEPICKER_DIRECTIVES } from 'ng2-bootstrap/components/datepicker'
//import * as moment from 'moment';
import { IEnumViewModel} from '../shared/service/base.service';
import { ProductServiceService} from './productservice.service';
import { OrderByPipe } from '../shared/pipe/orderby.pipe';

@Component({
    moduleId: module.id,
    selector: "productservicefilter",
    styleUrls: ['productservice.filter.component.css'],
    templateUrl: 'productservice.filter.component.html',
    providers: [],
    directives: [/*DATEPICKER_DIRECTIVES,*/ ACCORDION_DIRECTIVES, OffClickDirective],
    pipes: [OrderByPipe]    
})
export class ProductServiceFilterComponent extends FilterComponent<IProductServicesToServerFilter, IProductServicesToClientFilter> {
    
    @ViewChild('npi') focusRef: any;
    public self:FilterComponent<IProductServicesToServerFilter, IProductServicesToClientFilter> = this;

    public pharmacyTypes: IEnumViewModel[] = [];
    
    constructor(protected baseService: BaseService,
        private service: ProductServiceService, 
        private pharmacyFilterService: ProductServiceFilterService, private renderer: Renderer) {

        super(baseService, pharmacyFilterService);
        
    }

    
    ngOnInit() {
        


    }


}

