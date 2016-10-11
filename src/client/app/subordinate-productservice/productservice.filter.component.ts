import { Component, ViewChild, Renderer } from '@angular/core';
import { FilterComponent } from '../shared/filtering/filter.component';
import { ProductServiceFilterService, IProductServicesToServerFilter } from './productservice.filter.service';
import { BaseService } from '../shared/service/base.service';
import { IProductServicesToClientFilter } from './productservice.service';
import { IEnumViewModel} from '../shared/service/base.service';
import { ProductServiceService } from './productservice.service';

@Component({
    moduleId: module.id,
    selector: "productservicefilter",
    styleUrls: ['productservice.filter.component.css'],
    templateUrl: 'productservice.filter.component.html'
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

