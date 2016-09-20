import { Component, Input, ViewChild } from '@angular/core';
import { Validators, ControlGroup, Control, FormBuilder } from '@angular/common';
import { BaseService } from '../shared/service/base.service';
import { XCoreBaseComponent } from '../shared/component/base.component';
import { HubService } from '../shared/hub/hub.service';
import * as _ from 'lodash';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { IEntityValueViewModel, EntityValuesService, EntityType, INamespaceOption } from './entityValues.service';
import { TraceMethodPosition } from '../shared/logging/logging.service';
import { INgTableColumn, INgTableConfig, INgTableRow, INgTableChangeMessage, NgTableComponent } from '../shared/table/table.component';
import { OrderByPipe } from '../shared/pipe/orderby.pipe';
import { IEnumViewModel } from '../shared/service/base.service';
import { DATEPICKER_DIRECTIVES } from 'ng2-bootstrap/components/datepicker'
import { IFormValidationResult } from '../shared/validation/validation.service';
import { ValidationComponent } from '../shared/validation/validation.component';
import { AsyncValidator } from '../shared/validation/async-validator.service';
import { EntityValuesValidationService } from './entityValues.validation';

import * as moment from 'moment';


@Component({
    moduleId: module.id,
    selector: 'entity-values',
    styleUrls: ['entityValues.component.css'],
    templateUrl: 'entityValues.component.html',
    providers: [EntityValuesService, EntityValuesValidationService],
    directives: [ValidationComponent, DATEPICKER_DIRECTIVES, NgTableComponent],
    pipes: [OrderByPipe]
})
export class EntityValuesComponent extends XCoreBaseComponent {

    public columns: INgTableColumn[] = [
        { name: "namespaceDescription", title: "Property Name", colWidth: 3, sort: "asc" },
        { name: "value", title: "Value", colWidth: 3 },
        { name: "effectiveDate", title: "Effective", colWidth: 2 },
        { name: "secondary", title: "Secondary Ids", colWidth: 2 },
        { name: "priority", title: "Priority", colWidth: 1 },
        { name: "Delete", title: "", deleteRow: true, deleteMessage: "Delete this value?", colWidth: 1 }
    ];

    public tableConfig: INgTableConfig = {
        sorting: { columns: this.columns },
        selectOn: this.rowSelect.bind(this),
        deleteOn: this.deleteSelect.bind(this)
    }

    public entityValues: IEntityValueViewModel[] = [];
    public id: string;
    public viewModel: IEntityValueViewModel;
    public form: ControlGroup;
    public validationMessages: IFormValidationResult[] = [];
    public controlDataDescriptions: string[];

    public entityTypes: IEnumViewModel[] = [];
    public valueValid: boolean = false;
    public namespaceOptions: INamespaceOption[] = [];

    public parentId: string;
    public parentEntityType: EntityType;
    public parentEntityName: string;
    public parentEntityTypeDesc: string;
    public parentEntityId: string;

    public effectiveDateInvalid: boolean = true;
    public terminationDateInvalid: boolean = false;
    public showEffectiveDatePicker: boolean = false;
    public showTerminationDatePicker: boolean = false;

    @ViewChild(NgTableComponent) tableComponent: NgTableComponent;

    private get deleteSelect(): (id: string) => boolean {
        return (id: string) => {
            var ev = _.find(this.entityValues, m => m.id === id);
            if (ev) return !ev.isDefault;
            return false;
        }
    }

    private get tableLoadFunction(): () => INgTableChangeMessage {
        return () => {
            return { rows: this.entityValues, config: this.tableConfig }
        };
    }

    constructor(protected baseService: BaseService, private service: EntityValuesService,
        private builder: FormBuilder, private validationService: EntityValuesValidationService) {
        super(baseService);
        this.initializeTrace("EntityValuesComponent");
    }

    private rowSelect(id: string): void {

        this.service.getSingle(id, this.parentId, this.parentEntityType).subscribe(vm => {
            this.tableComponent.unhighlight(this.viewModel.id);
            this.viewModel = vm;
            //Go ahead and set priority to 1 when a default row (with priority zero) is clicked
            if (this.viewModel.priority === 0) this.viewModel.priority = 1;
            
        });

    }

    private initializeForm(builder: FormBuilder): void {

        var trace = this.classTrace("initializeForm");
        trace(TraceMethodPosition.Entry);

        //Set up any async validators
        //var nameControl = new Control("", Validators.compose([Validators.required, Validators.maxLength(50)]));
        // var nameValidator = AsyncValidator.debounceControl(nameControl, control => this.validationService.isNameDuplicate(control, 
        //     this.service, this.viewModel.id));
        var planControl = new Control("");
        var planValidator = AsyncValidator.debounceControl(planControl, control => this.validationService.isEntityIdValid(EntityType.Plan, control, this.service));
        var pharmacyControl = new Control("");
        var pharmacyValidator = AsyncValidator.debounceControl(pharmacyControl, control => this.validationService.isEntityIdValid(EntityType.ServiceProvider, control, this.service));
        var drugControl = new Control("");
        var drugValidator = AsyncValidator.debounceControl(drugControl, control => this.validationService.isEntityIdValid(EntityType.ProductService, control, this.service));
        var memberControl = new Control("");
        var memberValidator = AsyncValidator.debounceControl(memberControl, control => this.validationService.isEntityIdValid(EntityType.Member, control, this.service));
        
        //Set up controls            
        var buildReturn = this.validationService.buildControlGroup(builder, [
            { controlName: "NamespaceControl", description: "Property Name", control: new Control("", Validators.compose([Validators.required])) },
            { controlName: "PlanControl", description: "BIN/PCN/Group Id", control: planControl },
            { controlName: "PharmacyControl", description: "Pharmacy Id", control: pharmacyControl },
            { controlName: "DrugControl", description: "Drug Id (NDC)", control: drugControl },
            { controlName: "MemberControl", description: "Member Id", control: memberControl },
            { controlName: "ValueControl", description: "Value", control: new Control("") },
            { controlName: "IndexControl", description: "Index", control: new Control("", Validators.compose([EntityValuesValidationService.isGreaterThanOrEqualToZero.bind(this, false)])) },
            { controlName: "PriorityControl", description: "Priority", control: new Control("", Validators.compose([EntityValuesValidationService.isGreaterThanZero.bind(this, false)])) },
            { controlName: "EffectiveDateControl", description: "Effective Date", control: new Control("", Validators.compose([EntityValuesValidationService.isDate.bind(this, false)])) },
            { controlName: "TerminationDateControl", description: "Termination Date", control: new Control("", Validators.compose([EntityValuesValidationService.isDate.bind(this, true)])) }
        ]);
        this.form = buildReturn.controlGroup;
        this.controlDataDescriptions = buildReturn.controlDataDescriptions;

        //Initialize all validation
        this.form.valueChanges.subscribe(form => {
            trace(TraceMethodPosition.CallbackStart, "FormChangesEvent");
            var flv = Validators.compose([]);
            var flav = Validators.composeAsync([planValidator, pharmacyValidator, drugValidator, memberValidator]);
            this.validationService.getValidationResults(this.form, this.controlDataDescriptions, flv, flav).then(results => {
                this.validationMessages = results;
            });
            trace(TraceMethodPosition.CallbackEnd, "FormChangesEvent");
        });

        trace(TraceMethodPosition.Exit);

    }


    public load(initial: boolean, parentId: string, parentEntityType: EntityType, parentEntityName: string, parentEntityId: string) {

        this.parentId = parentId;
        this.parentEntityType = parentEntityType;
        this.parentEntityName = parentEntityName;
        this.parentEntityTypeDesc = this.getEntityTypeName();
        this.parentEntityId = parentEntityId;
        this.viewModel = this.service.getEmptyViewModel();
                
        if (initial) this.initializeForm(this.builder);
        this.service.get(0, 0, { entityId: parentId, entityType: parentEntityType }).subscribe(vm => {
            this.service.getNamespacesForDropdown().subscribe(opt => {
                this.namespaceOptions = opt.rows;
                this.entityValues = vm.rows;
                this.tableComponent.load(this.tableLoadFunction());
                if (vm.rows.length > 0) {
                    this.viewModel = vm.rows[0];
                    if (this.viewModel.priority === 0) this.viewModel.priority = 1;
                    this.tableComponent.highlight(vm.rows[0].id);
                }
            });
        });
    }

    public delete(row: IEntityValueViewModel): void {

        var trace = this.classTrace("delete");
        trace(TraceMethodPosition.Entry);

        this.service.deleteEntityValue(row.id).subscribe(d => {
            if (d) {
                this.baseService.loggingService.success(`Entity Value deleted successfully`);
                _.remove(this.entityValues, vm => vm.id === row.id);
                if (this.entityValues.length > 0) {
                    this.viewModel = this.entityValues[0];
                    this.tableComponent.highlight(this.viewModel.id);                    
                }
                //this.tableComponent.load(this.tableLoadFunction());
                this.load(false, this.parentId, this.parentEntityType, this.parentEntityName, this.parentEntityId);
            }
        });
        trace(TraceMethodPosition.Exit);

    }

    public save(): void {
        var trace = this.classTrace("save");
        trace(TraceMethodPosition.Entry);
        var lookup: IEntityValueViewModel = _.find(this.entityValues, vm => vm.namespaceId == this.viewModel.namespaceId
            && new Date(vm.effectiveDate).getTime() === new Date(this.viewModel.effectiveDate).getTime() && vm.planId === this.viewModel.planId && vm.serviceProviderId === this.viewModel.serviceProviderId
            && vm.memberId === this.viewModel.memberId && vm.productServiceId === this.viewModel.productServiceId && vm.isDefault === false);

        var vm = lookup || this.service.getEmptyViewModel();

        vm = <IEntityValueViewModel>_.extend(vm, {
            id: (lookup && lookup.id) || "", namespaceId: this.viewModel.namespaceId, namespaceDescription: this.getNamespaceDescription(this.viewModel.namespaceId),
            parentId: this.parentId, parentEntityType: this.parentEntityType,
            serviceProviderId: this.viewModel.serviceProviderId, productServiceId: this.viewModel.productServiceId,
            memberId: this.viewModel.memberId, index: this.viewModel.index, priority: this.viewModel.priority, isDefault: this.viewModel.isDefault,
            effectiveDate: this.viewModel.effectiveDate,
            terminationDate: this.viewModel.terminationDate, value: this.viewModel.value,
            planId: this.parentEntityId
        });
        this.service.saveEntityValue(vm).subscribe(vm => {
            this.baseService.loggingService.success(`Successfully saved the value for ${vm.namespaceDescription}`);
            if (lookup == null)
                this.entityValues.push(vm);
            else {
                lookup.value = vm.value;
                lookup.effectiveDate = vm.effectiveDate;
                lookup.terminationDate = vm.terminationDate;
                lookup.priority = vm.priority;
                lookup.index = vm.index;
            }
            this.newItem();
            //this.tableComponent.load(this.tableLoadFunction());
            this.load(false, this.parentId, this.parentEntityType, this.parentEntityName, this.parentEntityId);
        });
        
        trace(TraceMethodPosition.Exit);
    }

    private newItem($event?:any): void {
        this.id == null;
        this.viewModel = this.service.getEmptyViewModel();
        this.tableComponent.clearHighlight();
        if ($event) $event.preventDefault();
    }




    private effectiveDateString(targetInput: any): void {
        this.effectiveDateInvalid = true;
        if (!targetInput.value) return;
        if (EntityValuesValidationService.isValidDate(targetInput.value)) {
            this.effectiveDateInvalid = false;
            this.viewModel.effectiveDate = targetInput.value;
        }
        else {
            this.effectiveDateInvalid = true;
        }
    }

    private terminationDateString(targetInput: any): void {
        this.terminationDateInvalid = false;
        if (!targetInput.value) return;
        if (EntityValuesValidationService.isValidDate(targetInput.value))
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
        this.effectiveDateString({ value: this.viewModel.effectiveDate ? moment.utc(this.viewModel.effectiveDate).local().format('MM/DD/YYYY hh:mm:ss a') : null });
        this.showEffectiveDatePicker = false;
    }

    public toggleTerminationDate(event: any): void {
        this.showTerminationDatePicker = !this.showTerminationDatePicker;
        this.showEffectiveDatePicker = false;
        event.preventDefault();
    }

    public hideTerminationDate(): void {
        this.terminationDateString({ value: this.viewModel.terminationDate ? moment.utc(this.viewModel.terminationDate).local().format('MM/DD/YYYY hh:mm:ss a') : null });
        this.showTerminationDatePicker = false;
    }

    public validateEntityValue(): void {
        if (this.viewModel)
            this.service.isEntityValueValid(this.viewModel.namespaceId, this.viewModel.value)
                .subscribe(valid => {
                    this.valueValid = valid;
                });
    }

    public getEntityTypeName(): string {
        var selectedKey = "";
        _.forOwn(EntityType, (value, key) => {
            if (value === this.parentEntityType) selectedKey = key;
        });
        return selectedKey;
    }

    private getNamespaceDescription(id: string) {
        var ns = _.find(this.namespaceOptions, opt => opt.id === id);
        if (ns) return ns.description;
        return "";
    }

}

