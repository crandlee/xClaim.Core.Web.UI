import { Component, Input, ViewChild } from '@angular/core';
import { Validators, FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { BaseService } from '../shared/service/base.service';
import { XCoreBaseComponent } from '../shared/component/base.component';
import { HubService } from '../shared/hub/hub.service';
import * as _ from 'lodash';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { IEntityValueViewModel, EntityValuesService, EntityType, INamespaceOption } from './entityValues.service';
import { TraceMethodPosition } from '../shared/logging/logging.service';
import { INgTableColumn, INgTableConfig, INgTableRow, INgTableChangeMessage, NgTableComponent } from '../shared/table/table.component';
import { IEnumViewModel } from '../shared/service/base.service';
import { IFormValidationResult } from '../shared/validation/validation.service';
import { AsyncValidator } from '../shared/validation/async-validator.service';
import { EntityValuesValidationService } from './entityValues.validation';

import * as moment from 'moment';


@Component({
    moduleId: module.id,
    selector: 'entity-values',
    styleUrls: ['entityValues.component.css'],
    templateUrl: 'entityValues.component.html'
})
export class EntityValuesComponent extends XCoreBaseComponent {

    public columns: INgTableColumn[] = [
        { name: "namespaceDescription", title: "Property Name", colWidth: 3, sort: "asc" },
        { name: "value", title: "Value", colWidth: 3 },
        { name: "effectiveDate", title: "Effective", colWidth: 2 },
        { name: "secondary", title: "Secondary Ids", colWidth: 2 },
        { name: "priority", title: "Priority", colWidth: 1 },
        { name: "Delete", title: "", deleteRow: !this.readOnly, deleteMessage: "Delete this value?", colWidth: 1 }
    ];

    public tableConfig: INgTableConfig = {
        sorting: { columns: this.columns },
        selectOn: this.rowSelect.bind(this),
        readOnly: false,
        deleteOn: this.deleteSelect.bind(this)
    }

    public entityValues: IEntityValueViewModel[] = [];
    public id: string;
    public viewModel: IEntityValueViewModel;
    public validationMessages: IFormValidationResult[] = [];

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

    public readOnly: boolean = true;
    private validationSet: boolean = false;

    @ViewChild("form") form: FormGroup;
    @ViewChild(NgTableComponent) tableComponent: NgTableComponent;

    private get deleteSelect(): (id: string) => boolean {
        return (id: string) => {
            var ev = _.find(this.entityValues, m => m.id === id);
            if (ev) return !ev.isDefault;
            return false;
        }
    }

    private get tableLoadFunction(): (readOnly: boolean) => INgTableChangeMessage {
        return (readOnly: boolean) => {
            this.tableConfig.readOnly = readOnly;
            return { rows: this.entityValues, config: this.tableConfig }
        };
    }

    constructor(protected baseService: BaseService, private service: EntityValuesService,
        private builder: FormBuilder, private validationService: EntityValuesValidationService) {
        super(baseService);
        this.initializeTrace("EntityValuesComponent");

        this.viewModel = this.service.getEmptyViewModel();
    }

    private rowSelect(id: string): void {

        this.service.getSingle(id, this.parentId, this.parentEntityType).subscribe(vm => {
            this.tableComponent.unhighlight(this.viewModel.id);
            this.viewModel = vm;
            //Go ahead and set priority to 1 when a default row (with priority zero) is clicked
            if (this.viewModel.priority === 0) this.viewModel.priority = 1;
            
        });

    }

    
    public initializeValidation(form:FormGroup) {

        if (this.validationSet) return;
        this.setControlProperties(form, "namespaceId", "Property Name", Validators.compose([Validators.required]));
        this.setControlProperties(form, "planId", "Plan", Validators.compose([]));
        this.setControlProperties(form, "pharmacyId", "Pharmacy", Validators.compose([]));
        this.setControlProperties(form, "memberId", "Member", Validators.compose([]));
        this.setControlProperties(form, "drugId", "Drug", Validators.compose([]));
        this.setControlProperties(form, "value", "Value");
        this.setControlProperties(form, "index", "Index", Validators.compose([EntityValuesValidationService.isGreaterThanOrEqualToZero.bind(this, false)]));
        this.setControlProperties(form, "priority", "Priority", Validators.compose([EntityValuesValidationService.isGreaterThanZero.bind(this, false)]));
        this.setControlProperties(form, "effectiveDate", "Effective Date", Validators.compose([EntityValuesValidationService.isDate.bind(this, false)]));
        this.setControlProperties(form, "terminationDate", "Termination Date", Validators.compose([EntityValuesValidationService.isDate.bind(this, true)]));        

        var executeValidation = () => {
            var flv = Validators.compose([]);
            var flav = Validators.composeAsync([
                AsyncValidator.debounceControl(form.controls['planId'], control => this.validationService.isEntityIdValid(EntityType.Plan, control, this.service)),
                AsyncValidator.debounceControl(form.controls['pharmacyId'], control => this.validationService.isEntityIdValid(EntityType.Pharmacy, control, this.service)),
                AsyncValidator.debounceControl(form.controls['drugId'], control => this.validationService.isEntityIdValid(EntityType.Drug, control, this.service)),
                AsyncValidator.debounceControl(form.controls['memberId'], control => this.validationService.isEntityIdValid(EntityType.Member, control, this.service)) 
            ]);
            this.validationService.getValidationResults(form, flv, flav).then(results => {
                this.validationMessages = results;
            });
        };

        form.valueChanges.subscribe(executeValidation);

        executeValidation();

        this.validationSet = true;
    }




    public load(initial: boolean, parentId: string, parentEntityType: EntityType, parentEntityName: string, parentEntityId: string, readOnly: boolean) {

        this.parentId = parentId;
        this.parentEntityType = parentEntityType;
        this.parentEntityName = parentEntityName;
        this.parentEntityTypeDesc = this.getEntityTypeName();
        this.parentEntityId = parentEntityId;
        this.viewModel = this.service.getEmptyViewModel();
        this.readOnly = readOnly;

        this.service.get(0, 0, { entityId: parentId, entityType: parentEntityType }).subscribe(vm => {
            this.service.getNamespacesForDropdown().subscribe(opt => {
                this.namespaceOptions = opt.rows;
                this.entityValues = vm.rows;
                if (initial) this.initializeValidation(this.form);
                this.tableComponent.load(this.tableLoadFunction(this.readOnly));
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

        if (this.readOnly) return;
        
        this.service.deleteEntityValue(row.id).subscribe(d => {
            if (d) {
                this.baseService.loggingService.success(`Entity Value deleted successfully`);
                _.remove(this.entityValues, vm => vm.id === row.id);
                if (this.entityValues.length > 0) {
                    this.viewModel = this.entityValues[0];
                    this.tableComponent.highlight(this.viewModel.id);                    
                }
                //this.tableComponent.load(this.tableLoadFunction());
                this.load(false, this.parentId, this.parentEntityType, this.parentEntityName, this.parentEntityId, this.readOnly);
            }
        });
        trace(TraceMethodPosition.Exit);

    }

    public save(): void {
        var trace = this.classTrace("save");
        trace(TraceMethodPosition.Entry);

        if (this.readOnly) return;

        var lookup: IEntityValueViewModel = _.find(this.entityValues, vm => vm.namespaceId == this.viewModel.namespaceId
            && new Date(vm.effectiveDate).getTime() === new Date(this.viewModel.effectiveDate).getTime() && vm.planId === this.viewModel.planId && vm.serviceProviderId === this.viewModel.serviceProviderId
            && vm.memberId === this.viewModel.memberId && vm.productServiceId === this.viewModel.productServiceId && vm.isDefault === false);

        var vm = lookup || this.service.getEmptyViewModel();
        var planId = this.parentEntityType === EntityType.Plan ? this.parentEntityId : this.viewModel.planId;
        var memberId = this.parentEntityType === EntityType.Member ? this.parentEntityId : this.viewModel.memberId;
        var productServiceId = this.parentEntityType == EntityType.Drug ? this.parentEntityId : this.viewModel.productServiceId;
        var serviceProviderId = this.parentEntityType == EntityType.Pharmacy ? this.parentEntityId : this.viewModel.serviceProviderId;
        vm = <IEntityValueViewModel>_.extend(vm, {
            id: (lookup && lookup.id) || "", namespaceId: this.viewModel.namespaceId, namespaceDescription: this.getNamespaceDescription(this.viewModel.namespaceId),
            parentId: this.parentId, parentEntityType: this.parentEntityType,
            serviceProviderId: serviceProviderId, productServiceId: productServiceId,
            memberId: memberId, index: this.viewModel.index, priority: this.viewModel.priority, isDefault: this.viewModel.isDefault,
            effectiveDate: this.viewModel.effectiveDate,
            terminationDate: this.viewModel.terminationDate, value: this.viewModel.value,
            planId: planId,
            
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
            this.load(false, this.parentId, this.parentEntityType, this.parentEntityName, this.parentEntityId, this.readOnly);
        });
        
        trace(TraceMethodPosition.Exit);
    }

    private newItem($event?:any): void {

        if (this.readOnly) return;

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
