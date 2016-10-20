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
    public validationMessages: IFormValidationResult[] = [];
    public id: string;
    public states: IDropdownOptionViewModel[] = [];
    public showEffectiveDatePicker: boolean = false;
    public showTerminationDatePicker: boolean = false;
    public effectiveDate: Date;
    public terminationDate: Date;
    public readOnly: boolean;
    public bin: string;
    public pcn: string;
    public groupId: string;
    private validationSet: boolean = false;

    @ViewChild("form") form: FormGroup;
    @ViewChild(EntityValuesComponent) EntityValuesView: EntityValuesComponent;

    constructor(protected baseService: BaseService, private service: PlanService,
        private builder: FormBuilder, private validationService: PlanValidationService, private activatedRoute: ActivatedRoute, 
        private dropdownService: DropdownService, private location: Location)     
    {  
        super(baseService);

        this.initializeTrace("PlanComponent");

        this.viewModel = this.service.getEmptyViewModel();
        this.states = this.dropdownService.getStates();

    }


    public initializeValidation(form:FormGroup) {

        if (this.validationSet) return;
        this.setControlProperties(form, "name", "Name",Validators.compose([Validators.required, Validators.maxLength(50)]));
        this.setControlProperties(form, "bin", "BIN", Validators.compose([Validators.maxLength(6), Validators.required]));
        this.setControlProperties(form, "pcn", "PCN", Validators.maxLength(10));
        this.setControlProperties(form, "groupId", "Group Id", Validators.maxLength(15));
        this.setControlProperties(form, "address1", "Address 1", Validators.compose([Validators.required, Validators.maxLength(128)]));
        this.setControlProperties(form, "address2", "Address 2", Validators.compose([Validators.maxLength(128)]));
        this.setControlProperties(form, "address3", "Address 3", Validators.compose([Validators.maxLength(128)]));
        this.setControlProperties(form, "city", "City", Validators.compose([Validators.maxLength(64)]));
        this.setControlProperties(form, "state", "State", Validators.compose([Validators.maxLength(2)]));
        this.setControlProperties(form, "zipCode", "Zip Code", Validators.compose([Validators.maxLength(10)]));
        this.setControlProperties(form, "phone", "Phone", Validators.compose([Validators.maxLength(15), PlanValidationService.isInteger.bind(this, true)]));
        this.setControlProperties(form, "fax", "Fax", Validators.compose([Validators.maxLength(15), PlanValidationService.isInteger.bind(this, true)]));
        this.setControlProperties(form, "contact", "Contact", Validators.compose([Validators.maxLength(25)]));
        this.setControlProperties(form, "comments", "Comments", Validators.compose([Validators.maxLength(1000)]));
        this.setControlProperties(form, "effectiveDate", "Effective Date", Validators.compose([PlanValidationService.isDate.bind(this, false)]));
        this.setControlProperties(form, "terminationDate", "Termination Date", Validators.compose([PlanValidationService.isDate.bind(this, true)]));        

        var executeValidation = () => {
            var flv = Validators.compose([PlanValidationService.identRequired]);
            var flav = Validators.composeAsync([
                AsyncValidator.debounceForm(frm => PlanValidationService.isIdentDuplicate(this.service, this.viewModel.id, frm)),
                AsyncValidator.debounceControl(form.controls['name'], control => this.validationService.isNameDuplicate(control, this.service, this.viewModel.id))
            ]);
            this.validationService.getValidationResults(form, flv, flav).then(results => {
                this.validationMessages = results;
            });
        };

        form.valueChanges.debounceTime(1000).distinctUntilChanged(null, (x) => x).subscribe(executeValidation);


        this.validationSet = true;
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
                this.viewModel.effectiveDate = null;
            }
            this.initializeValidation(this.form);
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
            this.readOnly = (new Boolean(this.bin).valueOf());
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
            this.location.replaceState(`/plans/${this.viewModel.id}`);
            this.id = this.viewModel.id;
            this.bin = this.viewModel.bin;
            this.pcn = this.viewModel.pcn;
            this.groupId = this.viewModel.groupId;
            this.readOnly = (new Boolean(this.bin).valueOf());
            this.baseService.hubService.callbackWhenLoaded(this.getInitialData.bind(this, this.service, this.id));

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
        if (!targetInput.value) return;
        if (PlanValidationService.isValidDate(targetInput.value)) {
            this.viewModel.effectiveDate = targetInput.value;            
        }             
    }

    private terminationDateString(targetInput:any): void {
        if (!targetInput.value) return;
        if (PlanValidationService.isValidDate(targetInput.value)) { 
            this.viewModel.terminationDate = targetInput.value;
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

