import { Component, Input, ViewChild } from '@angular/core';
import { Validators, ControlGroup, Control, FormBuilder } from '@angular/common';
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


@Component({
    moduleId: module.id,
    selector: 'default-values',
    styleUrls: ['defaultValues.component.css'],
    templateUrl: 'defaultValues.component.html',
    providers: [NamespaceService, DefaultValuesService],
    directives: [NgTableComponent],
    pipes: [OrderByPipe]
})
export class DefaultValuesComponent extends XCoreBaseComponent {

    public columns: INgTableColumn[] = [
        { name: "entityTypeDesc", title: "Entity Type", colWidth: 3, sort: "asc" },
        { name: "value", title: "Claim Value", colWidth: 8 },
        { name: "Delete", title: "", deleteRow: true, deleteMessage: "Delete this default value?", colWidth: 1}
    ];

    public tableConfig: INgTableConfig = {
        sorting: { columns: this.columns  }
    }
    public defaultValues: IDefaultValueViewModel[] = [];
    public entityType: string;
    public value: string;

    @Input() public parentVm: INamespaceViewModel;
    @ViewChild(NgTableComponent) tableComponent: NgTableComponent;

    private get tableLoadFunction(): () => INgTableChangeMessage {
        return () => {
            return { rows: this.defaultValues, config: this.tableConfig }            
        };
    }
    constructor(protected baseService: BaseService, private service: NamespaceService, 
        private builder: FormBuilder, private defaultValuesService: DefaultValuesService)     
    {  
        super(baseService);
        
        this.initializeTrace("DefaultValuesComponent");

    }
    
    public load(parentVm: INamespaceViewModel) {
        this.parentVm = parentVm;
        this.tableComponent.load(this.tableLoadFunction());
        this.defaultValuesService.get(0,10, {namespaceId: this.parentVm.id}).subscribe(vm => {
            this.defaultValues = vm.rows;
        });

    }
    
    public delete(row: IDefaultValueViewModel): void {

        var trace = this.classTrace("delete");
        trace(TraceMethodPosition.Entry);

        this.defaultValuesService.deleteDefaultValue(row.id).subscribe(d => {
           if (d) {
             this.baseService.loggingService.success(`Default Value deleted successfully`);
             _.remove(this.user.claims, cd =>  cd.id === row.id && cd.value.toLowerCase() === row.value.toLowerCase());  
             this.tableComponent.load(this.tableLoadFunction());
           } 
        });
        trace(TraceMethodPosition.Exit);

    }

    public addClaim(event: any): void {
        var trace = this.classTrace("addClaim");
        trace(TraceMethodPosition.Entry);
        var claimLookup: IClaimDefinitionViewModel = _.find(this.claimDefinitions, cd => cd.id === this.claimType);
        var existingUserClaim: IUserClaimViewModel = _.find(this.user.claims, cd => cd.definitionId === this.claimType && cd.value.toLowerCase() === this.claimValue.toLowerCase());
        if (existingUserClaim) this.baseService.loggingService.warn("This claim/value already exist on the user");
        if (claimLookup && !existingUserClaim) {
            var vm = <IUserClaimViewModel>{ id: "", value: this.claimValue, definitionId: claimLookup.id, description: claimLookup.description, name: claimLookup.name, userId: this.user.id };            
            this.userService.saveUserClaim(vm).subscribe(vm => {
                this.baseService.loggingService.success(`Successfully added new ${vm.description} claim `);
                this.user.claims.push(vm);
                this.tableComponent.load(this.tableLoadFunction());
                this.claimType = null;
                this.claimValue = null;
            });
        }    
        trace(TraceMethodPosition.Exit);
    }


}

