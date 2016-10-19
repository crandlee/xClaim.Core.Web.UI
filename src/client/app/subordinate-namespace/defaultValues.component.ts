import { Component, Input, ViewChild } from '@angular/core';
import { Validators, FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { BaseService } from '../shared/service/base.service';
import { NamespaceService, INamespace, INamespaceViewModel } from './namespace.service';
import { XCoreBaseComponent } from '../shared/component/base.component';
import { HubService } from '../shared/hub/hub.service';
import * as _ from 'lodash';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { IDefaultValueViewModel, DefaultValuesService } from './defaultValues.service';
import { TraceMethodPosition } from '../shared/logging/logging.service';
import { INgTableColumn, INgTableConfig, INgTableRow, INgTableChangeMessage, NgTableComponent } from '../shared/table/table.component';
import { OrderByPipe } from '../shared/pipe/orderby.pipe';
import { IEnumViewModel } from '../shared/service/base.service';
import { IFormValidationResult, ValidationService } from '../shared/validation/validation.service';
import { ValidationComponent } from '../shared/validation/validation.component';
import { AsyncValidator } from '../shared/validation/async-validator.service';

import * as moment from 'moment';


@Component({
    moduleId: module.id,
    selector: 'default-values',
    styleUrls: ['defaultValues.component.css'],
    templateUrl: 'defaultValues.component.html'
})
export class DefaultValuesComponent extends XCoreBaseComponent {

    public columns: INgTableColumn[] = [
        { name: "entityTypeDescription", title: "Entity Type", colWidth: 2, sort: "asc" },
        { name: "value", title: "Default Value", colWidth: 3 },
        { name: "effectiveDate", title: "Effective Date", colWidth: 3 },
        { name: "terminationDate", title: "Termination Date", colWidth: 3 },
        { name: "Delete", title: "", deleteRow: true, deleteMessage: "Delete this default value?", colWidth: 1}
    ];

    public tableConfig: INgTableConfig = {
        sorting: { columns: this.columns  }
    }
    public defaultValues: IDefaultValueViewModel[] = [];
    public id: string;
    public parentId: string;
    public entityType: number;
    public value: string;
    public effectiveDate: Date;
    public terminationDate: Date;
    public entityTypes: IEnumViewModel[] = [];
    public valueValid: boolean = false;
     
    public effectiveDateInvalid: boolean = true;
    public terminationDateInvalid: boolean = false;
    public showEffectiveDatePicker: boolean = false;
    public showTerminationDatePicker: boolean = false;

    @Input() public parentVm: INamespaceViewModel;
    @ViewChild(NgTableComponent) tableComponent: NgTableComponent;

    private get tableLoadFunction(): () => INgTableChangeMessage {
        return () => {
            return { rows: this.defaultValues, config: this.tableConfig }            
        };
    }
    constructor(protected baseService: BaseService, private service: NamespaceService, 
        private builder: FormBuilder, private defaultValuesService: DefaultValuesService )     
    {  
        super(baseService);
        
        this.initializeTrace("DefaultValuesComponent");
    }
    
    public load(parentVm: INamespaceViewModel) {
        this.parentVm = parentVm;
        if (this.parentVm.id === this.baseService.appSettings.EmptyGuid) return;

        this.parentId = parentVm.id;

        
        this.defaultValuesService.getNamespaceEntityTypes().subscribe(vm => {
            this.entityTypes = vm;
            this.defaultValuesService.get(0, 10, {namespaceId: this.parentVm.id}).subscribe(vm => {
                this.defaultValues = vm.rows;
                this.tableComponent.load(this.tableLoadFunction());
            });
        });        
    }
    
    public delete(row: IDefaultValueViewModel): void {

        var trace = this.classTrace("delete");
        trace(TraceMethodPosition.Entry);

        this.defaultValuesService.deleteDefaultValue(row.id).subscribe(d => {
           if (d) {
             this.baseService.loggingService.success(`Default Value deleted successfully`);
             _.remove(this.defaultValues, vm =>  vm.id === row.id);  
             this.tableComponent.load(this.tableLoadFunction());
           } 
        });
        trace(TraceMethodPosition.Exit);

    }

    public save(event: any): void {
        var trace = this.classTrace("save");
        trace(TraceMethodPosition.Entry);
        var lookup: IDefaultValueViewModel = _.find(this.defaultValues, vm => vm.entityType == this.entityType 
            && new Date(vm.effectiveDate).getTime() === this.effectiveDate.getTime());
        var vm = <IDefaultValueViewModel>{ id: (lookup && lookup.id) || "", namespaceId: this.parentVm.id, 
            keyCompositeId: (lookup && lookup.keyCompositeId) || "", effectiveDate: this.effectiveDate.toString(), 
            terminationDate: this.terminationDate && this.terminationDate.toString(), entityType: this.entityType, value: this.value};
        this.defaultValuesService.saveDefaultValue(vm).subscribe(vm => {
            this.baseService.loggingService.success(`Successfully saved the default value for ${vm.entityTypeDescription}`);
            if (lookup == null) {
                this.defaultValues.push(vm);
            } else {
                lookup.value = vm.value;
                lookup.effectiveDate = vm.effectiveDate;
                lookup.terminationDate = vm.terminationDate;
            }
            this.clear();
            this.tableComponent.load(this.tableLoadFunction());
        });
        trace(TraceMethodPosition.Exit);
    }

    private clear(): void {
        this.entityType = null;
        this.id = null;
        this.value = null;
        this.effectiveDate = null;
        this.terminationDate = null;
        this.effectiveDateInvalid = true;
        this.valueValid = false;

    }

    public isValid(): boolean {
        return this.entityType !== null 
            && this.effectiveDate !== null
            && (!this.effectiveDateInvalid && !this.terminationDateInvalid)
            && this.valueValid;
    }

    private isDate(dateString: string): boolean {
        var date = new Date(dateString);
        return date instanceof Date && !isNaN(date.valueOf())
    }


    private effectiveDateString(targetInput:any): void {
        this.effectiveDateInvalid = true;
        if (!targetInput.value) return;
        if (ValidationService.isValidDate(targetInput.value)) {
            this.effectiveDateInvalid = false;
            this.effectiveDate = targetInput.value;            
        }             
        else {
            this.effectiveDateInvalid = true;
        }
    }

    private terminationDateString(targetInput:any): void {
        this.terminationDateInvalid = false;
        if (!targetInput.value) return;
        if (ValidationService.isValidDate(targetInput.value)) 
            this.terminationDate = targetInput.value;
        else {
            this.terminationDateInvalid = true;
        }
            
    }

    public toggleEffectiveDate(): void {
        this.showEffectiveDatePicker = !this.showEffectiveDatePicker;
        this.showTerminationDatePicker = false;
    }

    public hideEffectiveDate(): void {
        this.effectiveDateString({value:this.effectiveDate ? moment.utc(this.effectiveDate).local().format('MM/DD/YYYY hh:mm:ss a'): null});
        this.showEffectiveDatePicker = false;
    }

    public toggleTerminationDate(): void {
        this.showTerminationDatePicker = !this.showTerminationDatePicker;
        this.showEffectiveDatePicker = false;
    }

    public hideTerminationDate(): void {
        this.terminationDateString({value:this.terminationDate ? moment.utc(this.terminationDate).local().format('MM/DD/YYYY hh:mm:ss a'): null});
        this.showTerminationDatePicker = false;
    }


    public validateDefaultValue(): void {
        this.defaultValuesService.isDefaultValueValid(this.parentVm.type, this.parentVm.validationPattern, this.value, this.parentVm.allowNull, this.parentVm.precision, this.parentVm.length)
            .debounceTime(1000)            
            .subscribe(valid => {
                this.valueValid = valid;
            });
    }

    public entityTypeInvalid(): boolean {        
        return (this.entityType === undefined);
    }
}

