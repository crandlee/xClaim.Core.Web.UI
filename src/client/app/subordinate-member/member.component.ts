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
    public validationMessages: IFormValidationResult[] = [];
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
    private validationSet: boolean = false;

    @ViewChild("form") form: FormGroup;
    @ViewChild(EntityValuesComponent) EntityValuesView: EntityValuesComponent;

    constructor(protected baseService: BaseService, private service: MemberService,
        private builder: FormBuilder, private validationService: MemberValidationService, private activatedRoute: ActivatedRoute, 
        private dropdownService: DropdownService, private location: Location)     
    {  
        super(baseService);
        this.initializeTrace("MemberComponent");
        this.viewModel = this.service.getEmptyViewModel();
        this.states = this.dropdownService.getStates();

    }
    
    public initializeValidation(form:FormGroup) {

        if (this.validationSet) return;
        this.setControlProperties(form, "memberId", "Member Id", Validators.compose([Validators.required, Validators.maxLength(20)]));
        this.setControlProperties(form, "plan", "Plan", Validators.required);
        this.setControlProperties(form, "dateOfBirth", "Date Of Birth", Validators.compose([MemberValidationService.isDate.bind(this, false)]));
        this.setControlProperties(form, "personCode", "Person Code", Validators.compose([Validators.required, MemberValidationService.isGreaterThanOrEqualToZero.bind(this, false)]));
        this.setControlProperties(form, "eligibilityCode", "Eligibility Code", Validators.compose([Validators.maxLength(1)]));
        this.setControlProperties(form, "relationshipCode", "Relationship Code", Validators.compose([Validators.required]));
        this.setControlProperties(form, "gender", "Gender", Validators.compose([]));
        this.setControlProperties(form, "firstName", "First Name", Validators.compose([Validators.maxLength(50)]));
        this.setControlProperties(form, "middleName", "Middle Name", Validators.compose([Validators.maxLength(50)]));
        this.setControlProperties(form, "lastName", "Last Name", Validators.compose([Validators.maxLength(50)]));
        this.setControlProperties(form, "location", "Location", Validators.compose([Validators.maxLength(50)]));
        this.setControlProperties(form, "address1", "Address 1", Validators.compose([Validators.required, Validators.maxLength(128)]));
        this.setControlProperties(form, "address2", "Address 2", Validators.compose([Validators.maxLength(128)]));
        this.setControlProperties(form, "address3", "Address 3", Validators.compose([Validators.maxLength(128)]));
        this.setControlProperties(form, "city", "City", Validators.compose([Validators.maxLength(64)]));
        this.setControlProperties(form, "state", "State", Validators.compose([Validators.maxLength(2)]));
        this.setControlProperties(form, "zipCode", "Zip Code", Validators.compose([Validators.maxLength(10)]));
        this.setControlProperties(form, "phone", "Phone", Validators.compose([Validators.maxLength(15), MemberValidationService.isInteger.bind(this, true)]));
        this.setControlProperties(form, "email", "Email Address", Validators.compose([Validators.maxLength(256), MemberValidationService.isEmailValid]));
        this.setControlProperties(form, "effectiveDate", "Effective Date", Validators.compose([MemberValidationService.isDate.bind(this, false)]));
        this.setControlProperties(form, "terminationDate", "Termination Date", Validators.compose([MemberValidationService.isDate.bind(this, true)]));        

        var executeValidation = () => {
            var flv = Validators.compose([]);
            var flav = Validators.composeAsync([
                AsyncValidator.debounceControl(form, frm => MemberValidationService.isIdentDuplicate(this.service, this.viewModel.id, frm))
            ]);
            this.validationService.getValidationResults(form, flv, flav).then(results => {
                this.validationMessages = results;
            });
        };

        form.valueChanges.subscribe(executeValidation);

        executeValidation();

        this.validationSet = true;
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
                        
                        this.initializeValidation(this.form);

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
            this.readOnly = (new Boolean(this.memberId).valueOf());
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

