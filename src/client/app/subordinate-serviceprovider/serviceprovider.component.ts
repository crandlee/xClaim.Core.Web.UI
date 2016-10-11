import { Component, ViewChild } from '@angular/core';
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
    public form: FormGroup;
    public validationMessages: IFormValidationResult[] = [];
    public controlDataDescriptions: string[];    
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
    
    @ViewChild(EntityValuesComponent) EntityValuesView: EntityValuesComponent;

    constructor(protected baseService: BaseService, private service: ServiceProviderService,
        private builder: FormBuilder, private validationService: ServiceProviderValidationService, 
        private activatedRoute: ActivatedRoute, private dropdownService: DropdownService, private location: Location)     
    {  
        super(baseService);
        this.initializeTrace("ServiceProviderComponent");
        this.readOnly = (new Boolean(this.npi).valueOf());

        this.viewModel = this.service.getEmptyViewModel();
        this.states = this.dropdownService.getStates();

    }
    
    private initializeForm(builder: FormBuilder): void {

        var trace = this.classTrace("initializeForm");
        trace(TraceMethodPosition.Entry);
        
        //Set up any async validators
        var npiControl = new FormControl("", Validators.compose([Validators.required, Validators.maxLength(10)]));

        //Set up controls
        var binControl = new FormControl("", Validators.maxLength(6));
        var buildReturn = this.validationService.buildControlGroup(builder, [
            { controlName: "NPIControl", description: "NPI", control: npiControl},
            { controlName: "StoreNameControl", description: "Store Name", control: new FormControl("", Validators.compose([Validators.required, Validators.maxLength(64)]))},
            { controlName: "StoreNumberControl", description: "Store Number", control: new FormControl("", Validators.compose([Validators.required, Validators.maxLength(10)]))},
            { controlName: "PharmacyTypeControl", description: "Pharmacy Type", control: new FormControl("", Validators.required)},
            { controlName: "DispenserClassControl", description: "Dispenser Class", control: new FormControl("", Validators.required)},
            { controlName: "DispenserTypeControl", description: "Dispenser Type", control: new FormControl("", Validators.required)},
            { controlName: "EligibilityCodeControl", description: "Eligibility Code", control: new FormControl("", Validators.maxLength(1))},
            { controlName: "PAddress1Control", description: "Physical - Address 1", control: new FormControl("", Validators.compose([Validators.required, Validators.maxLength(128)]))},
            { controlName: "PAddress2Control", description: "Physical - Address 2", control: new FormControl("", Validators.maxLength(128))},
            { controlName: "PAddress3Control", description: "Physical - Address 3", control: new FormControl("", Validators.maxLength(128))},
            { controlName: "PCityControl", description: "Physical - City", control: new FormControl("", Validators.compose([Validators.maxLength(64), Validators.required]))},
            { controlName: "PStateControl", description: "Physical - State", control: new FormControl("", Validators.compose([Validators.required, Validators.maxLength(2)]))},
            { controlName: "PZipCodeControl", description: "Physical - Zip Code", control: new FormControl("", Validators.compose([Validators.maxLength(10), Validators.required]))},
            { controlName: "MAddress1Control", description: "Mailing - Address 1", control: new FormControl("", Validators.maxLength(128))},
            { controlName: "MAddress2Control", description: "Mailing - Address 2", control: new FormControl("", Validators.maxLength(128))},
            { controlName: "MAddress3Control", description: "Mailing - Address 3", control: new FormControl("", Validators.maxLength(128))},
            { controlName: "MCityControl", description: "Mailing - City", control: new FormControl("", Validators.maxLength(64))},
            { controlName: "MStateControl", description: "Mailing - State", control: new FormControl("", Validators.maxLength(2))},
            { controlName: "MZipCodeControl", description: "Mailing - Zip Code", control: new FormControl("", Validators.maxLength(10))},
            { controlName: "EINControl", description: "EIN", control: new FormControl("", Validators.maxLength(50))},
            { controlName: "RAddress1Control", description: "Remittance - Address 1", control: new FormControl("", Validators.maxLength(128))},
            { controlName: "RAddress2Control", description: "Remittance - Address 2", control: new FormControl("", Validators.maxLength(128))},
            { controlName: "RAddress3Control", description: "Remittance - Address 3", control: new FormControl("", Validators.maxLength(128))},
            { controlName: "RCityControl", description: "Remittance - City", control: new FormControl("", Validators.maxLength(64))},
            { controlName: "RStateControl", description: "Remittance - State", control: new FormControl("", Validators.maxLength(2))},
            { controlName: "RZipCodeControl", description: "Remittance - Zip Code", control: new FormControl("", Validators.maxLength(10))},
            { controlName: "TelephoneControl", description: "Phone", control: new FormControl("", Validators.compose([ServiceProviderValidationService.isInteger.bind(this, true),  Validators.maxLength(10)]))},
            { controlName: "EmailControl", description: "Email Address", control: new FormControl("", Validators.compose([Validators.maxLength(256), ServiceProviderValidationService.isEmailValid]))},
            { controlName: "FaxControl", description: "Email Address", control: new FormControl("", Validators.compose([Validators.maxLength(10), ServiceProviderValidationService.isInteger.bind(this, true)]))},

            { controlName: "EffectiveDateControl", description: "Effective Date", control: new FormControl("", Validators.compose([ServiceProviderValidationService.isDate.bind(this, false)]))},
            { controlName: "TerminationDateControl", description: "Termination Date", control: new FormControl("", Validators.compose([ServiceProviderValidationService.isDate.bind(this, true)]))}
        ]);                
        this.form = buildReturn.controlGroup;
        this.controlDataDescriptions = buildReturn.controlDataDescriptions;
        
        var identValidator = AsyncValidator.debounceControl(this.form, form => ServiceProviderValidationService.isIdentDuplicate(this.service, this.viewModel.id, form));

        //Initialize all validation
        this.form.valueChanges.subscribe(form => {
            trace(TraceMethodPosition.CallbackStart, "FormChangesEvent");
            var flv = Validators.compose([ServiceProviderValidationService.mailingAddressCheck, ServiceProviderValidationService. remittanceAddressCheck]);
            var flav = Validators.composeAsync([identValidator ]);
            this.validationService.getValidationResults(this.form, this.controlDataDescriptions, flv, flav).then(results => {
                this.validationMessages = results;
            });
            trace(TraceMethodPosition.CallbackEnd, "FormChangesEvent");                                    
        });
                
        trace(TraceMethodPosition.Exit);
        
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
            this.initializeForm(this.builder);     
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

