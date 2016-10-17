import { Component, ViewChild } from '@angular/core';
import { Validators, FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { Location } from '@angular/common';
import { IFormValidationResult } from '../shared/validation/validation.service';
import { ValidationComponent } from '../shared/validation/validation.component';
import { AsyncValidator } from '../shared/validation/async-validator.service';
import { PlanValidationService } from './plan.validation';
import { BaseService } from '../shared/service/base.service';
import { PlanService, IPlan, IPlanViewModel } from './plan.service';
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
    templateUrl: 'plan.component.html',
    styleUrls: ['plan.component.css']
})
export class PlanComponent extends XCoreBaseComponent  {

    public loadingMessage: string = "Loading Plan";
    public viewModel: IPlanViewModel;
    public form: FormGroup;
    public validationMessages: IFormValidationResult[] = [];
    public controlDataDescriptions: string[];
    public id: string;
    public states: IDropdownOptionViewModel[] = [];
    public effectiveDateInvalid: boolean = true;
    public terminationDateInvalid: boolean = false;
    public showEffectiveDatePicker: boolean = false;
    public showTerminationDatePicker: boolean = false;
    public effectiveDate: Date;
    public terminationDate: Date;
    public readOnly: boolean;
    public bin: string;
    public pcn: string;
    public groupId: string;

    @ViewChild(EntityValuesComponent) EntityValuesView: EntityValuesComponent;

    constructor(protected baseService: BaseService, private service: PlanService,
        private builder: FormBuilder, private validationService: PlanValidationService, private activatedRoute: ActivatedRoute, 
        private dropdownService: DropdownService, private location: Location)     
    {  
        super(baseService);

        this.initializeTrace("PlanComponent");
        this.readOnly = (new Boolean(this.bin).valueOf());

        this.viewModel = this.service.getEmptyViewModel();
        this.states = this.dropdownService.getStates();

    }
    
    private initializeForm(builder: FormBuilder): void {

        var trace = this.classTrace("initializeForm");
        trace(TraceMethodPosition.Entry);
        
        //Set up any async validators
        var nameControl = new FormControl("", Validators.compose([Validators.required, Validators.maxLength(50)]));
        var nameValidator = AsyncValidator.debounceControl(nameControl, control => this.validationService.isNameDuplicate(control, 
            this.service, this.viewModel.id));

        //Set up controls
        var binControl = new FormControl("", Validators.maxLength(6));
        var buildReturn = this.validationService.buildControlGroup(builder, [
            { controlName: "NameControl", description: "Name", control: nameControl},
            { controlName: "BinControl", description: "BIN", control: binControl},
            { controlName: "PcnControl", description: "PCN", control: new FormControl("", Validators.maxLength(10))},
            { controlName: "GroupIdControl", description: "Group Id", control: new FormControl("", Validators.maxLength(15))},
            { controlName: "Address1Control", description: "Address 1", control: new FormControl("", Validators.compose([Validators.maxLength(128), Validators.required]))},
            { controlName: "Address2Control", description: "Address 2", control: new FormControl("", Validators.maxLength(128))},
            { controlName: "Address3Control", description: "Address 3", control: new FormControl("", Validators.maxLength(128))},
            { controlName: "CityControl", description: "City", control: new FormControl("", Validators.compose([Validators.maxLength(64), Validators.required]))},
            { controlName: "StateControl", description: "State", control: new FormControl("", Validators.required)},
            { controlName: "ZipCodeControl", description: "Zip Code", control: new FormControl("", Validators.compose([Validators.maxLength(10), Validators.required]))},
            { controlName: "PhoneControl", description: "Phone", control: new FormControl("", Validators.maxLength(15))},
            { controlName: "FaxControl", description: "Fax", control: new FormControl("", Validators.maxLength(15))},
            { controlName: "ContactControl", description: "Contact", control: new FormControl("", Validators.maxLength(25))},
            { controlName: "CommentsControl", description: "Comments", control: new FormControl("", Validators.maxLength(1000))},
            { controlName: "EffectiveDateControl", description: "Effective Date", control: new FormControl("", Validators.compose([PlanValidationService.isDate.bind(this, false)]))},
            { controlName: "TerminationDateControl", description: "Termination Date", control: new FormControl("", Validators.compose([PlanValidationService.isDate.bind(this, true)]))}
        ]);                
        this.form = buildReturn.controlGroup;
        this.controlDataDescriptions = buildReturn.controlDataDescriptions;
        
        var identValidator = AsyncValidator.debounceControl(this.form, form => PlanValidationService.isIdentDuplicate(this.service, this.viewModel.id, form));

        //Initialize all validation
        this.form.valueChanges.subscribe(form => {
            trace(TraceMethodPosition.CallbackStart, "FormChangesEvent");
            var flv = Validators.compose([PlanValidationService.identRequired]);
            var flav = Validators.composeAsync([nameValidator, identValidator ]);
            this.validationService.getValidationResults(this.form, flv, flav).then(results => {
                this.validationMessages = results;
            });
            trace(TraceMethodPosition.CallbackEnd, "FormChangesEvent");                                    
        });
                
        trace(TraceMethodPosition.Exit);
        
    }
    
    
    private getInitialData(service: PlanService, id: string): void {        
        var trace = this.classTrace("getInitialData");
        var fn: () => Observable<IPlan> = (!this.id) 
            ? ((!this.bin) ? service.getNew.bind(service) : service.getExistingById.bind(service, this.bin, this.pcn, this.groupId)) 
            : service.getExisting.bind(service, this.id);
                            
        fn().catch<IPlan>(err => {
            this.loadingMessage = "No Plan Found";
            return new Observable<IPlan>();
        }).subscribe(up => {
            trace(TraceMethodPosition.CallbackStart);
            this.viewModel = this.service.toViewModel(up);
            if (!this.id) {
                this.viewModel.effectiveDate = "";
            }
            //Load any subviews here
            this.EntityValuesView.load(true, this.viewModel.id, EntityType.Plan, this.viewModel.name, 
                (this.viewModel.bin || "") + "/" + (this.viewModel.pcn || "") + "/" + (this.viewModel.groupId || ""), this.readOnly);

            trace(TraceMethodPosition.CallbackEnd);            
        }); 
        
        trace(TraceMethodPosition.Exit);
    }
    
    ngAfterViewInit() {
        this.baseService.hubService.callbackWhenLoaded(this.getInitialData.bind(this, this.service, this.id));
    }

    ngOnInit() {        
        super.NotifyLoaded("Plan");   
        this.activatedRoute.params.subscribe(params => {
            this.id = params["id"];
            this.bin = params["bin"];
            this.pcn = params["pcn"];
            this.groupId = params["groupId"];

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
            this.baseService.loggingService.success("Plan successfully saved");
            this.baseService.router.navigate([`/plans/${this.viewModel.id}`]);
        });
        
        trace(TraceMethodPosition.Exit);
    }
    
    public reloadForEdit() {
        this.id = this.viewModel.id;
        this.readOnly = false;
        this.baseService.hubService.callbackWhenLoaded(this.getInitialData.bind(this, this.service, this.id));
    }

    public return(): void {
        this.location.back();
    }



    private effectiveDateString(targetInput:any): void {
        this.effectiveDateInvalid = true;
        if (!targetInput.value) return;
        if (PlanValidationService.isValidDate(targetInput.value)) {
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
        if (PlanValidationService.isValidDate(targetInput.value)) 
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

