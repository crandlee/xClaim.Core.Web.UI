import { Component, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { Validators, FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { IFormValidationResult } from '../shared/validation/validation.service';
import { ValidationComponent } from '../shared/validation/validation.component';
import { AsyncValidator } from '../shared/validation/async-validator.service';
import { MemberValidationService } from './member.validation';
import { BaseService, IEnumViewModel } from '../shared/service/base.service';
import { MemberService, IMember, IMemberViewModel } from './member.service';
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

@Component({
    moduleId: module.id,
    templateUrl: 'member.component.html',
    styleUrls: ['member.component.css']
})
export class MemberComponent extends XCoreBaseComponent  {

    public loadingMessage: string = "Loading Member";
    public viewModel: IMemberViewModel;
    public form: FormGroup;
    public validationMessages: IFormValidationResult[] = [];
    public controlDataDescriptions: string[];
    public id: string;
    public states: IDropdownOptionViewModel[] = [];
    public plans: IDropdownOptionViewModel[] = [];
    public genderCodes: IEnumViewModel[] = [];
    public relationshipCodes: IEnumViewModel[] = [];
    public effectiveDateInvalid: boolean = true;
    public terminationDateInvalid: boolean = false;
    public dateOfBirthInvalid: boolean = true;
    public showEffectiveDatePicker: boolean = false;
    public showTerminationDatePicker: boolean = false;
    public showDateOfBirthPicker: boolean = false;
    public effectiveDate: Date;
    public terminationDate: Date;
    public dob: Date;
    public readOnly: boolean;
    public memberId: string;

    @ViewChild(EntityValuesComponent) EntityValuesView: EntityValuesComponent;

    constructor(protected baseService: BaseService, private service: MemberService,
        private builder: FormBuilder, private validationService: MemberValidationService, private activatedRoute: ActivatedRoute, 
        private dropdownService: DropdownService, private location: Location)     
    {  
        super(baseService);
        this.initializeTrace("MemberComponent");
        this.viewModel = this.service.getEmptyViewModel();
        this.readOnly = (new Boolean(this.memberId).valueOf());
        this.states = this.dropdownService.getStates();

    }
    
    private initializeForm(builder: FormBuilder): void {

        var trace = this.classTrace("initializeForm");
        trace(TraceMethodPosition.Entry);
        
        //Set up any async validators
        var memberIdControl = new FormControl("", Validators.compose([Validators.required, Validators.maxLength(20)]));

        //Set up controls
        var binControl = new FormControl("", Validators.maxLength(6));
        var buildReturn = this.validationService.buildControlGroup(builder, [
            { controlName: "MemberIdControl", description: "Member Id", control: memberIdControl},
            { controlName: "PlanControl", description: "Plan", control: new FormControl("", Validators.required)},
            { controlName: "DateOfBirthControl", description: "Date Of Birth", control: new FormControl("", Validators.compose([MemberValidationService.isDate.bind(this, false)]))},
            { controlName: "PersonCodeControl", description: "Person Code", control: new FormControl("", Validators.compose([Validators.required, MemberValidationService.isGreaterThanOrEqualToZero.bind(this, false)]))},
            { controlName: "EligibilityCodeControl", description: "Eligibility Code", control: new FormControl("", Validators.maxLength(1))},
            { controlName: "FirstNameControl", description: "First Name", control: new FormControl("", Validators.maxLength(50))},
            { controlName: "MiddleNameControl", description: "Middle Name", control: new FormControl("", Validators.maxLength(50))},
            { controlName: "LastNameControl", description: "Last Name", control: new FormControl("", Validators.maxLength(50))},
            { controlName: "LocationControl", description: "Location", control: new FormControl("", Validators.maxLength(50))},
            { controlName: "Address1Control", description: "Address 1", control: new FormControl("", Validators.compose([Validators.required, Validators.maxLength(128)]))},
            { controlName: "Address2Control", description: "Address 2", control: new FormControl("", Validators.maxLength(128))},
            { controlName: "Address3Control", description: "Address 3", control: new FormControl("", Validators.maxLength(128))},
            { controlName: "CityControl", description: "City", control: new FormControl("", Validators.compose([Validators.maxLength(64), Validators.required]))},
            { controlName: "StateControl", description: "State", control: new FormControl("", Validators.compose([Validators.required, Validators.maxLength(2)]))},
            { controlName: "ZipCodeControl", description: "Zip Code", control: new FormControl("", Validators.compose([Validators.maxLength(10), Validators.required]))},
            { controlName: "PhoneControl", description: "Phone", control: new FormControl("", Validators.maxLength(15))},
            { controlName: "EmailControl", description: "Email Address", control: new FormControl("", Validators.compose([Validators.maxLength(256), MemberValidationService.isEmailValid]))},
            { controlName: "EffectiveDateControl", description: "Effective Date", control: new FormControl("", Validators.compose([MemberValidationService.isDate.bind(this, false)]))},
            { controlName: "TerminationDateControl", description: "Termination Date", control: new FormControl("", Validators.compose([MemberValidationService.isDate.bind(this, true)]))}
        ]);                
        this.form = buildReturn.controlGroup;
        this.controlDataDescriptions = buildReturn.controlDataDescriptions;
        
        var identValidator = AsyncValidator.debounceControl(this.form, form => MemberValidationService.isIdentDuplicate(this.service, this.viewModel.id, form));

        //Initialize all validation
        this.form.valueChanges.subscribe(form => {
            trace(TraceMethodPosition.CallbackStart, "FormChangesEvent");
            var flv = Validators.compose([]);
            var flav = Validators.composeAsync([identValidator ]);
            this.validationService.getValidationResults(this.form, flv, flav).then(results => {
                this.validationMessages = results;
            });
            trace(TraceMethodPosition.CallbackEnd, "FormChangesEvent");                                    
        });
                
        trace(TraceMethodPosition.Exit);
        
    }
    
    
    private getInitialData(service: MemberService, id: string): void {        
        var trace = this.classTrace("getInitialData");
        var fn: () => Observable<IMember> = (!this.id) 
            ? ((!this.memberId) ? service.getNew.bind(service) : service.getExistingById.bind(service, this.memberId)) 
            : service.getExisting.bind(service, this.id);
        
        fn().catch<IMember>(err => {
            this.loadingMessage = "Member Not Found";
            return new Observable<IMember>();
        }).subscribe(up => {
            trace(TraceMethodPosition.CallbackStart);
            this.viewModel = this.service.toViewModel(up);
            if (!this.id && !this.memberId) {
                this.viewModel.dateOfBirth = "";
                this.viewModel.effectiveDate = "";
                this.viewModel.planId = null;
            }
            
            this.service.getGenderCodes().subscribe(gc => {
                this.genderCodes = gc;

                this.service.getRelationshipCodes().subscribe(rc => {
                    this.relationshipCodes = rc;

                    this.service.getPlans().subscribe(plans => {
                        this.plans = plans;


                        //Load any subviews here
                        this.EntityValuesView.load(true, this.viewModel.id, EntityType.Member, this.viewModel.lastName + ", " + this.viewModel.firstName
                            , this.viewModel.memberId, this.readOnly);
                        trace(TraceMethodPosition.CallbackEnd);            
                    });

                });


            });
        }); 
        
        trace(TraceMethodPosition.Exit);
    }
    
    ngAfterViewInit() {
        this.baseService.hubService.callbackWhenLoaded(this.getInitialData.bind(this, this.service, this.id));
    }

    ngOnInit() {        
        super.NotifyLoaded("Member");   

        this.activatedRoute.params.subscribe(params => {
            this.id = params["id"];
            this.memberId = params["memberid"];
            this.initializeForm(this.builder);     
        });

    }

    public onSubmit() {
        var trace = this.classTrace("onSubmit");
        trace(TraceMethodPosition.Entry);

        if (this.readOnly) return;

        this.service.save(this.viewModel).subscribe(vm => {
            trace(TraceMethodPosition.Callback);
            this.viewModel = vm;
            this.baseService.loggingService.success("Member successfully saved");
            this.baseService.router.navigate([`/members/${this.viewModel.id}`]);
        });
        
        trace(TraceMethodPosition.Exit);
    }
    
    public return(): void {
        this.location.back();
    }

    public reloadForEdit() {
        this.id = this.viewModel.id;
        this.readOnly = false;
        this.baseService.hubService.callbackWhenLoaded(this.getInitialData.bind(this, this.service, this.id));
    }


    private effectiveDateString(targetInput:any): void {
        this.effectiveDateInvalid = true;
        if (!targetInput.value) return;
        if (MemberValidationService.isValidDate(targetInput.value)) {
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
        if (MemberValidationService.isValidDate(targetInput.value)) 
            this.viewModel.terminationDate = targetInput.value;
        else {
            this.terminationDateInvalid = true;
        }
            
    }

    private dateOfBirthString(targetInput:any): void {
        this.dateOfBirthInvalid = true;
        if (!targetInput.value) return;
        if (MemberValidationService.isValidDate(targetInput.value)) {
            this.dateOfBirthInvalid = false;
            this.viewModel.dateOfBirth = targetInput.value;            
        }             
        else {
            this.dateOfBirthInvalid = true;
        }
    }

    public toggleEffectiveDate(event: any): void {
        this.showEffectiveDatePicker = !this.showEffectiveDatePicker;
        this.showTerminationDatePicker = false;
        this.showDateOfBirthPicker = false;
        event.preventDefault();
    }

    public hideEffectiveDate(): void {
        this.effectiveDateString({value:this.effectiveDate ? moment.utc(this.effectiveDate).local().format('MM/DD/YYYY hh:mm:ss a'): null});
        this.showEffectiveDatePicker = false;
    }

    public toggleTerminationDate(event: any): void {
        this.showTerminationDatePicker = !this.showTerminationDatePicker;
        this.showEffectiveDatePicker = false;
        this.showDateOfBirthPicker = false;
        event.preventDefault();
    }

    public hideTerminationDate(): void {
        this.terminationDateString({value:this.terminationDate ? moment.utc(this.terminationDate).local().format('MM/DD/YYYY hh:mm:ss a'): null});
        this.showTerminationDatePicker = false;
    }

    public toggleDateOfBirth(event: any): void {
        this.showDateOfBirthPicker = !this.showDateOfBirthPicker;
        this.showTerminationDatePicker = false;
        this.showEffectiveDatePicker = false;
        event.preventDefault();
    }

    public hideDateOfBirth(): void {
        this.dateOfBirthString({value:this.dob ? moment(this.dob).format('MM/DD/YYYY'): null});
        this.showDateOfBirthPicker = false;
    }

}

