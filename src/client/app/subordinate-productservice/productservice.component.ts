import { Component, ViewChild } from '@angular/core';
import { Validators, FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { Location } from '@angular/common';
import { IFormValidationResult } from '../shared/validation/validation.service';
import { ValidationComponent } from '../shared/validation/validation.component';
import { AsyncValidator } from '../shared/validation/async-validator.service';
import { ProductServiceValidationService } from './productservice.validation';
import { BaseService, IEnumViewModel } from '../shared/service/base.service';
import { ProductServiceService, IProductService, IProductServiceViewModel, IDrugDetailViewModel } from './productservice.service';
import { XCoreBaseComponent } from '../shared/component/base.component';
import { HubService } from '../shared/hub/hub.service';
import { IDropdownOptionViewModel } from '../shared/service/base.service';
import * as _ from 'lodash';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { TraceMethodPosition } from '../shared/logging/logging.service';
import * as moment from 'moment';
import { EntityValuesComponent } from '../subordinate-entityvalues/entityValues.component';
import { EntityType } from '../subordinate-entityvalues/entityValues.service';
import 'rxjs/Rx';
import 'rxjs/add/operator/catch';

@Component({
    moduleId: module.id,
    templateUrl: 'productservice.component.html',
    styleUrls: ['productservice.component.css']
})
export class ProductServiceComponent extends XCoreBaseComponent  {

    public loadingMessage:string = "Loading Drug";
    public viewModel: IProductServiceViewModel;
    public dvm: IDrugDetailViewModel;
    public id: string;
    public ndc: string;
    public readOnly: boolean = false;

    @ViewChild(EntityValuesComponent) EntityValuesView: EntityValuesComponent;

    constructor(protected baseService: BaseService, private service: ProductServiceService,
        private builder: FormBuilder, private validationService: ProductServiceValidationService, private activatedRoute: ActivatedRoute, private location: Location)     
    {  
        super(baseService);
        this.initializeTrace("ProductServiceComponent");
        this.viewModel = this.service.getEmptyViewModel();
        this.dvm = this.viewModel.drugDetails;        
        if (this.ndc) this.readOnly = true;
    }
        
    
    private getInitialData(service: ProductServiceService, id: string): void {        
        var trace = this.classTrace("getInitialData");
        var fn: () => Observable<IProductService> = (this.id) ? service.getExisting.bind(service, this.id) : service.getExistingById.bind(service, this.ndc);
        
        fn().catch<IProductService>(err => {
            this.loadingMessage = "Drug Not Found";
            return new Observable<IProductService>();
        }).subscribe(up => {
            trace(TraceMethodPosition.CallbackStart);
            this.viewModel = this.service.toViewModel(up);
            this.dvm = this.viewModel.drugDetails;
            this.EntityValuesView.load(true, this.id, EntityType.Drug, this.viewModel.drugDetails.label, this.viewModel.productServiceId, this.readOnly);
                trace(TraceMethodPosition.CallbackEnd);

        }); 
        
        trace(TraceMethodPosition.Exit);
    }
    
    ngAfterViewInit() {
        this.baseService.hubService.callbackWhenLoaded(this.getInitialData.bind(this, this.service, this.id));
    }

    ngOnInit() {        
        super.NotifyLoaded("ProductService");   

        this.activatedRoute.params.subscribe(params => {
            this.id = params["id"];
            this.ndc = params["ndc"];
        });
        
    }
    

    public return(): void {
        this.location.back();
    }



}

