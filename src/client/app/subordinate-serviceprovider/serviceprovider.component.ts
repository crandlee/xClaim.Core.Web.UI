import { Component, ViewChild } from '@angular/core';
import { Validators, ControlGroup, Control, FormBuilder } from '@angular/common';
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
import { RouteSegment } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { UiSwitchComponent } from 'angular2-ui-switch';
import { TraceMethodPosition } from '../shared/logging/logging.service';
import { OrderByPipe } from '../shared/pipe/orderby.pipe';
import { DropdownService } from '../shared/common/dropdowns';
import * as moment from 'moment';
import { DATEPICKER_DIRECTIVES } from 'ng2-bootstrap/components/datepicker'
import { EntityValuesComponent } from '../subordinate-entityvalues/entityValues.component';
import { EntityType } from '../subordinate-entityvalues/entityValues.service';
import 'rxjs/Rx';

@Component({
    moduleId: module.id,
    templateUrl: 'serviceprovider.component.html',
    styleUrls: ['serviceprovider.component.css'],
    providers: [ServiceProviderService, ServiceProviderValidationService, DropdownService],
    directives: [DATEPICKER_DIRECTIVES, ValidationComponent, UiSwitchComponent, EntityValuesComponent],
    pipes: [OrderByPipe]
})
export class ServiceProviderComponent extends XCoreBaseComponent  {

    public viewModel: IServiceProviderViewModel;
    public form: ControlGroup;
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

    @ViewChild(EntityValuesComponent) EntityValuesView: EntityValuesComponent;

    constructor(protected baseService: BaseService, private service: ServiceProviderService,
        private builder: FormBuilder, private validationService: ServiceProviderValidationService, private routeSegment: RouteSegment, private dropdownService: DropdownService)     
    {  
        super(baseService);
        this.initializeTrace("ServiceProviderComponent");
        this.id = routeSegment.getParam("id");
        this.viewModel = this.service.getEmptyViewModel();
        this.states = this.dropdownService.getStates();

    }
    
    private initializeForm(builder: FormBuilder): void {

        var trace = this.classTrace("initializeForm");
        trace(TraceMethodPosition.Entry);
        
        //Set up any async validators
        var npiControl = new Control("", Validators.compose([Validators.required, Validators.maxLength(10)]));

        //Set up controls
        var binControl = new Control("", Validators.maxLength(6));
        var buildReturn = this.validationService.buildControlGroup(builder, [
            { controlName: "NPIControl", description: "NPI", control: npiControl},
            { controlName: "StoreNameControl", description: "Store Name", control: new Control("", Validators.compose([Validators.required, Validators.maxLength(64)]))},
            { controlName: "StoreNumberControl", description: "Store Number", control: new Control("", Validators.compose([Validators.required, Validators.maxLength(10)]))},
            { controlName: "PharmacyTypeControl", description: "Pharmacy Type", control: new Control("", Validators.required)},
            { controlName: "DispenserClassControl", description: "Dispenser Class", control: new Control("", Validators.required)},
            { controlName: "DispenserTypeControl", description: "Dispenser Type", control: new Control("", Validators.required)},
            { controlName: "EligibilityCodeControl", description: "Eligibility Code", control: new Control("", Validators.maxLength(1))},
            { controlName: "PAddress1Control", description: "Physical - Address 1", control: new Control("", Validators.compose([Validators.required, Validators.maxLength(128)]))},
            { controlName: "PAddress2Control", description: "Physical - Address 2", control: new Control("", Validators.maxLength(128))},
            { controlName: "PAddress3Control", description: "Physical - Address 3", control: new Control("", Validators.maxLength(128))},
            { controlName: "PCityControl", description: "Physical - City", control: new Control("", Validators.compose([Validators.maxLength(64), Validators.required]))},
            { controlName: "PStateControl", description: "Physical - State", control: new Control("", Validators.compose([Validators.required, Validators.maxLength(2)]))},
            { controlName: "PZipCodeControl", description: "Physical - Zip Code", control: new Control("", Validators.compose([Validators.maxLength(10), Validators.required]))},
            { controlName: "MAddress1Control", description: "Mailing - Address 1", control: new Control("", Validators.maxLength(128))},
            { controlName: "MAddress2Control", description: "Mailing - Address 2", control: new Control("", Validators.maxLength(128))},
            { controlName: "MAddress3Control", description: "Mailing - Address 3", control: new Control("", Validators.maxLength(128))},
            { controlName: "MCityControl", description: "Mailing - City", control: new Control("", Validators.maxLength(64))},
            { controlName: "MStateControl", description: "Mailing - State", control: new Control("", Validators.maxLength(2))},
            { controlName: "MZipCodeControl", description: "Mailing - Zip Code", control: new Control("", Validators.maxLength(10))},
            { controlName: "EINControl", description: "EIN", control: new Control("", Validators.maxLength(50))},
            { controlName: "RAddress1Control", description: "Remittance - Address 1", control: new Control("", Validators.maxLength(128))},
            { controlName: "RAddress2Control", description: "Remittance - Address 2", control: new Control("", Validators.maxLength(128))},
            { controlName: "RAddress3Control", description: "Remittance - Address 3", control: new Control("", Validators.maxLength(128))},
            { controlName: "RCityControl", description: "Remittance - City", control: new Control("", Validators.maxLength(64))},
            { controlName: "RStateControl", description: "Remittance - State", control: new Control("", Validators.maxLength(2))},
            { controlName: "RZipCodeControl", description: "Remittance - Zip Code", control: new Control("", Validators.maxLength(10))},
            { controlName: "TelephoneControl", description: "Phone", control: new Control("", Validators.compose([ServiceProviderValidationService.isInteger.bind(this, true),  Validators.maxLength(10)]))},
            { controlName: "EmailControl", description: "Email Address", control: new Control("", Validators.compose([Validators.maxLength(256), ServiceProviderValidationService.isEmailValid]))},
            { controlName: "FaxControl", description: "Email Address", control: new Control("", Validators.compose([Validators.maxLength(10), ServiceProviderValidationService.isInteger.bind(this, true)]))},

            { controlName: "EffectiveDateControl", description: "Effective Date", control: new Control("", Validators.compose([ServiceProviderValidationService.isDate.bind(this, false)]))},
            { controlName: "TerminationDateControl", description: "Termination Date", control: new Control("", Validators.compose([ServiceProviderValidationService.isDate.bind(this, true)]))}
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
            ? service.getNew.bind(service) 
            : service.getExisting.bind(service, this.id);
        
        fn().subscribe(up => {
            trace(TraceMethodPosition.CallbackStart);
            this.viewModel = this.service.toViewModel(up);
            if (!this.id) {
                this.viewModel.effectiveDate = "";
            }
            
            Observable.forkJoin(this.service.getDispenserClasses(), this.service.getDispenserTypes(), this.service.getPharmacyTypes())
                .subscribe((data:Array<IEnumViewModel[]>) => {
                    this.dispenserClasses = data[0];
                    this.dispenserTypes = data[1];
                    this.pharmacyTypes = data[2];

                    this.EntityValuesView.load(true, this.id, EntityType.ServiceProvider, this.viewModel.name, this.viewModel.npi);
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
        this.initializeForm(this.builder);     
    }

    public onSubmit() {
        var trace = this.classTrace("onSubmit");
        trace(TraceMethodPosition.Entry);
        this.service.save(this.viewModel).subscribe(vm => {
            trace(TraceMethodPosition.Callback);
            this.viewModel = vm;
            this.baseService.loggingService.success("Pharmacy successfully saved");
            this.baseService.router.navigate([`/serviceproviders/${this.viewModel.id}`]);
        });
        
        trace(TraceMethodPosition.Exit);
    }
    
    public cancel(): void {
        this.baseService.router.navigate(["/serviceproviderlist"]);
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

