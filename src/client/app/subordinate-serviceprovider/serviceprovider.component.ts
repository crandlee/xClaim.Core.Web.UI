import { Component, ViewChild, Input } from '@angular/core';
import { Validators, FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { Location } from '@angular/common';
import { IFormValidationResult } from '../shared/validation/validation.service';
import { ValidationComponent } from '../shared/validation/validation.component';
import { AsyncValidator } from '../shared/validation/async-validator.service';
import { ServiceProviderValidationService } from './serviceprovider.validation';
import { BaseService, IEnumViewModel } from '../shared/service/base.service';
import { ServiceProviderService, IServiceProvider, IServiceProviderViewModel } from './serviceprovider.service';
import { XCoreBaseComponent } from '../shared/component/base.component';
import { HubService } from '../shared/hub/hub.service';
import { IDropdownOptionViewModel } from '../shared/service/base.service';
import * as _ from 'lodash';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { TraceMethodPosition } from '../shared/logging/logging.service';
import { DropdownService } from '../shared/common/dropdowns';
import * as moment from 'moment';
import { EntityValuesComponent } from '../subordinate-entityvalues/entityValues.component';
import { EntityType } from '../subordinate-entityvalues/entityValues.service';
import 'rxjs/Rx';

@Component({
    moduleId: module.id,
    templateUrl: 'serviceprovider.component.html',
    styleUrls: ['serviceprovider.component.css']
})
export class ServiceProviderComponent extends XCoreBaseComponent  {

    public loadingMessage: string = "Loading Pharmacy";
    public viewModel: IServiceProviderViewModel;
    public validationMessages: IFormValidationResult[] = [];
    public id: string;
    public states: IDropdownOptionViewModel[] = [];
    public dispenserTypes: IEnumViewModel[] = [];
    public dispenserClasses: IEnumViewModel[] = [];
    public pharmacyTypes: IEnumViewModel[] = [];
    public effectiveDateInvalid: boolean = true;
    public terminationDateInvalid: boolean = false;
    public showEffectiveDatePicker: boolean = false;
    public showTerminationDatePicker: boolean = false;
    public effectiveDate: Date;
    public terminationDate: Date;
    public readOnly: boolean = true;
    public npi: string;
    private validationSet: boolean = false;

    @ViewChild('form') form: FormGroup;
    @ViewChild(EntityValuesComponent) EntityValuesView: EntityValuesComponent;

    constructor(protected baseService: BaseService, private service: ServiceProviderService,
        private validationService: ServiceProviderValidationService, 
        private activatedRoute: ActivatedRoute, private dropdownService: DropdownService, private location: Location)     
    {  
        super(baseService);
        this.initializeTrace("ServiceProviderComponent");
        this.viewModel = this.service.getEmptyViewModel();
        this.states = this.dropdownService.getStates();

    }
    
    
    public initializeValidation(form:FormGroup) {

        if (this.validationSet) return;
        this.setControlProperties(form, "storeNumber", "Store Number", Validators.compose([Validators.required, Validators.maxLength(10)]));
        this.setControlProperties(form, "npi", "NPI", Validators.compose([Validators.required, Validators.maxLength(10)]));
        this.setControlProperties(form, "storeName", "Store Name", Validators.compose([Validators.required, Validators.maxLength(64)]));
        this.setControlProperties(form, "pharmacyType", "Pharmacy Type", Validators.compose([ServiceProviderValidationService.isGreaterThanZero.bind(this, false)]));
        this.setControlProperties(form, "dispenserClass", "Dispenser Class", Validators.compose([Validators.required]));
        this.setControlProperties(form, "dispenserType", "Dispenser Type", Validators.compose([Validators.required]));
        this.setControlProperties(form, "paddress1", "Physical - Address 1", Validators.compose([Validators.required, Validators.maxLength(128)]));
        this.setControlProperties(form, "paddress2", "Physical - Address 2", Validators.compose([Validators.maxLength(128)]));
        this.setControlProperties(form, "paddress3", "Physical - Address 3", Validators.compose([Validators.maxLength(128)]));
        this.setControlProperties(form, "pcity", "Physical - City", Validators.compose([Validators.maxLength(64)]));
        this.setControlProperties(form, "pstate", "Physical - State", Validators.compose([Validators.maxLength(2)]));
        this.setControlProperties(form, "pzipCode", "Physical - Zip Code", Validators.compose([Validators.maxLength(10)]));
        this.setControlProperties(form, "maddress1", "Mailing - Address 1", Validators.compose([Validators.maxLength(128)]));
        this.setControlProperties(form, "maddress2", "Mailing - Address 2", Validators.compose([Validators.maxLength(128)]));
        this.setControlProperties(form, "maddress3", "Mailing - Address 3", Validators.compose([Validators.maxLength(128)]));
        this.setControlProperties(form, "mcity", "Mailing - City", Validators.compose([Validators.maxLength(64)]));
        this.setControlProperties(form, "mstate", "Mailing - State", Validators.compose([Validators.maxLength(2)]));
        this.setControlProperties(form, "mzipCode", "Mailing - Zip Code", Validators.compose([Validators.maxLength(10)]));
        this.setControlProperties(form, "raddress1", "Remittance - Address 1", Validators.compose([Validators.maxLength(128)]));
        this.setControlProperties(form, "raddress2", "Remittance - Address 2", Validators.compose([Validators.maxLength(128)]));
        this.setControlProperties(form, "raddress3", "Remittance - Address 3", Validators.compose([Validators.maxLength(128)]));
        this.setControlProperties(form, "rcity", "Remittance - City", Validators.compose([Validators.maxLength(64)]));
        this.setControlProperties(form, "rstate", "Remittance - State", Validators.compose([Validators.maxLength(2)]));
        this.setControlProperties(form, "rzipCode", "Remittance - Zip Code", Validators.compose([Validators.maxLength(10)]));
        this.setControlProperties(form, "ein", "EIN", Validators.compose([Validators.maxLength(50)]));
        this.setControlProperties(form, "phone", "Telephone", Validators.compose([ServiceProviderValidationService.isInteger.bind(this, true),  Validators.maxLength(10)]));
        this.setControlProperties(form, "email", "Email Address", Validators.compose([Validators.maxLength(256), ServiceProviderValidationService.isEmailValid]));
        this.setControlProperties(form, "fax", "Fax", Validators.compose([Validators.maxLength(10), ServiceProviderValidationService.isInteger.bind(this, true)]));
        this.setControlProperties(form, "effectiveDate", "Effective Date", Validators.compose([ServiceProviderValidationService.isDate.bind(this, false)]));
        this.setControlProperties(form, "terminationDate", "Termination Date", Validators.compose([ServiceProviderValidationService.isDate.bind(this, true)]));        
        var identValidator = AsyncValidator.debounceControl(form, frm => ServiceProviderValidationService.isIdentDuplicate(this.service, this.viewModel.id, frm));

        var executeValidation = () => {
            var flv = Validators.compose([ServiceProviderValidationService.mailingAddressCheck, ServiceProviderValidationService. remittanceAddressCheck]);
            var flav = Validators.composeAsync([identValidator]);
            this.validationService.getValidationResults(form, flv, flav).then(results => {
                this.validationMessages = results;
            });
        };

        form.valueChanges.subscribe(executeValidation);

        executeValidation();

        this.validationSet = true;
    }
    
    
    private getInitialData(service: ServiceProviderService, id: string): void {        
        var trace = this.classTrace("getInitialData");
        var fn: () => Observable<IServiceProvider> = (!this.id) 
            ? ((!this.npi) ? service.getNew.bind(service) : service.getExistingById.bind(service, this.npi)) 
            : service.getExisting.bind(service, this.id);
        
        fn().catch<IServiceProvider>(err => {
            this.loadingMessage = "Pharmacy Not Found";
            return new Observable<IServiceProvider>();
        }).subscribe(up => {
            trace(TraceMethodPosition.CallbackStart);
            this.initializeValidation(this.form);
            this.viewModel = this.service.toViewModel(up);
            if (!this.id && !this.npi) {
                this.viewModel.effectiveDate = "";
            }
                        
            Observable.forkJoin(this.service.getDispenserClasses(), this.service.getDispenserTypes(), this.service.getPharmacyTypes())
                .subscribe((data:Array<IEnumViewModel[]>) => {
                    this.dispenserClasses = data[0];
                    this.dispenserTypes = data[1];
                    this.pharmacyTypes = data[2];

                    this.EntityValuesView.load(true, this.viewModel.id, EntityType.Pharmacy, this.viewModel.name, this.viewModel.npi, this.readOnly);
                        trace(TraceMethodPosition.CallbackEnd);

                });

        }); 
        
        trace(TraceMethodPosition.Exit);
    }
    
    ngAfterViewInit() {
        this.baseService.hubService.callbackWhenLoaded(this.getInitialData.bind(this, this.service, this.id));        
    }

    ngOnInit() {        
        super.NotifyLoaded("ServiceProvider");   
        this.activatedRoute.params.subscribe(params => {
            this.id = params["id"];
            this.npi = params["npi"];
            this.readOnly = (new Boolean(this.npi).valueOf());
        });
    }

    public reloadForEdit() {
        this.id = this.viewModel.id;
        this.readOnly = false;
        this.baseService.hubService.callbackWhenLoaded(this.getInitialData.bind(this, this.service, this.id));
    }

    public onSubmit() {
        var trace = this.classTrace("onSubmit");
        trace(TraceMethodPosition.Entry);

        if (this.readOnly) return;

        this.service.save(this.viewModel).subscribe(vm => {
            trace(TraceMethodPosition.Callback);
            this.viewModel = vm;
            this.baseService.loggingService.success("Pharmacy successfully saved");
            this.baseService.router.navigate([`/serviceproviders/${this.viewModel.id}`]);
        });
        
        trace(TraceMethodPosition.Exit);
    }
    
    public return(): void {
        this.location.back();
    }


    private effectiveDateString(targetInput:any): void {
        this.effectiveDateInvalid = true;
        if (!targetInput.value) return;
        if (ServiceProviderValidationService.isValidDate(targetInput.value)) {
            this.effectiveDateInvalid = false;
            this.viewModel.effectiveDate = targetInput.value;            
        }             
        else {
            this.effectiveDateInvalid = true;
        }
    }

    private terminationDateString(targetInput:any): void {
        this.terminationDateInvalid = false;
        if (!targetInput.value) return;
        if (ServiceProviderValidationService.isValidDate(targetInput.value)) 
            this.viewModel.terminationDate = targetInput.value;
        else {
            this.terminationDateInvalid = true;
        }
            
    }

    public toggleEffectiveDate(event: any): void {
        this.showEffectiveDatePicker = !this.showEffectiveDatePicker;
        this.showTerminationDatePicker = false;
        event.preventDefault();
    }

    public hideEffectiveDate(): void {
        this.effectiveDateString({value:this.effectiveDate ? moment.utc(this.effectiveDate).local().format('MM/DD/YYYY hh:mm:ss a'): null});
        this.showEffectiveDatePicker = false;
    }

    public toggleTerminationDate(event: any): void {
        this.showTerminationDatePicker = !this.showTerminationDatePicker;
        this.showEffectiveDatePicker = false;
        event.preventDefault();
    }

    public hideTerminationDate(): void {
        this.terminationDateString({value:this.terminationDate ? moment.utc(this.terminationDate).local().format('MM/DD/YYYY hh:mm:ss a'): null});
        this.showTerminationDatePicker = false;
    }


}
