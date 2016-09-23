import { Component, ViewChild, Renderer } from '@angular/core';
import { FilterComponent } from '../shared/filtering/filter.component';
import { ServiceProviderFilterService, IServiceProvidersToServerFilter } from './serviceprovider.filter.service';
import { BaseService } from '../shared/service/base.service';
import { ACCORDION_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { IServiceProvidersToClientFilter } from './serviceprovider.service';
import { OffClickDirective } from '../shared/off-click/off-click.directive';
//import { DATEPICKER_DIRECTIVES } from 'ng2-bootstrap/components/datepicker'
//import * as moment from 'moment';
import { IEnumViewModel} from '../shared/service/base.service';
import { ServiceProviderService} from './serviceprovider.service';
import { OrderByPipe } from '../shared/pipe/orderby.pipe';

@Component({
    moduleId: module.id,
    selector: "serviceproviderfilter",
    styleUrls: ['serviceprovider.filter.component.css'],
    templateUrl: 'serviceprovider.filter.component.html',
    providers: [],
    directives: [/*DATEPICKER_DIRECTIVES,*/ ACCORDION_DIRECTIVES, OffClickDirective],
    pipes: [OrderByPipe]    
})
export class ServiceProviderFilterComponent extends FilterComponent<IServiceProvidersToServerFilter, IServiceProvidersToClientFilter> {
    
    @ViewChild('npi') focusRef: any;
    public self:FilterComponent<IServiceProvidersToServerFilter, IServiceProvidersToClientFilter> = this;

    public pharmacyTypes: IEnumViewModel[] = [];
    
    constructor(protected baseService: BaseService,
        private service: ServiceProviderService, 
        private pharmacyFilterService: ServiceProviderFilterService, private renderer: Renderer) {

        super(baseService, pharmacyFilterService);
        
    }

    
    ngOnInit() {
        
        this.baseService.hubService.callbackWhenLoaded(() => {
            this.service.getPharmacyTypes().subscribe(t => {
                this.pharmacyTypes = t;
                this.pharmacyTypes.unshift({id: null, description: "[All]"});
                this.toServerFilter.pharmacyType = null;
            });
        });



    }


    public changedType($event: any): void {
        var type = this.pharmacyTypes.find(t => t.id == this.toServerFilter.pharmacyType);
        this.toServerFilter.pharmacyTypeDesc = (type && type.description) || '';
    }

}

