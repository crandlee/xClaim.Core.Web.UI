import { Component, Input, ViewChild } from '@angular/core';
import { Validators, ControlGroup, Control, FormBuilder } from '@angular/common';
import { BaseService } from '../shared/service/base.service';
import { UserService, IUserProfile, IUserProfileViewModel, IUserClaimViewModel } from '../usermanagement/user.service';
import { XCoreBaseComponent } from '../shared/component/base.component';
import { HubService } from '../shared/hub/hub.service';
import * as _ from 'lodash';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { IClaimDefinitionViewModel, ClaimDefinitionsService } from './claimDefinitions.service';
import { TraceMethodPosition } from '../shared/logging/logging.service';
import { INgTableColumn, INgTableConfig, INgTableRow, INgTableChangeMessage, NgTableComponent } from '../shared/table/table.component';
import { OrderByPipe } from '../shared/pipe/orderby.pipe';


@Component({
    moduleId: module.id,
    selector: 'user-claims',
    styleUrls: ['user.claims.component.css'],
    templateUrl: 'user.claims.component.html',
    providers: [UserService, ClaimDefinitionsService],
    directives: [NgTableComponent],
    pipes: [OrderByPipe]
})
export class UserClaimsComponent extends XCoreBaseComponent {

    public columns: INgTableColumn[] = [
        { name: "description", title: "Claim Name", colWidth: 5, sort: "asc" },
        { name: "value", title: "Claim Value", colWidth: 6 },
        { name: "Delete", title: "", deleteRow: true, deleteMessage: "Delete this claim from the user?", colWidth: 1}
    ];

    public tableConfig: INgTableConfig = {
        sorting: { columns: this.columns  }
    }
    public claimDefinitions: IClaimDefinitionViewModel[] = [];
    public claimType: string;
    public claimValue: string;

    @Input() public user: IUserProfileViewModel;
    @ViewChild(NgTableComponent) tableComponent: NgTableComponent;

    private get tableLoadFunction(): () => INgTableChangeMessage {
        return () => {
            return { rows: _.filter(this.user.claims, r => ['given_name', 'email', 'sub', 'name'].indexOf(r.name) === -1), config: this.tableConfig }            
        };
    }
    constructor(protected baseService: BaseService, private userService: UserService, 
        private builder: FormBuilder, private claimDefinitionsService: ClaimDefinitionsService)     
    {  
        super(baseService);
        
        this.initializeTrace("UserClaimsComponent");

    }
    
    public load(user: IUserProfileViewModel) {
        this.user = user;
        this.tableComponent.load(this.tableLoadFunction());
        this.claimDefinitionsService.getNonCoreDefinitions().subscribe(cd => {
            this.claimDefinitions = cd.rows;
        });

    }
    
    public deleteClaim(row: IUserClaimViewModel): void {

        var trace = this.classTrace("deleteClaim");
        trace(TraceMethodPosition.Entry);

        this.userService.deleteUserClaim(row.id).subscribe(d => {
           if (d) {
             this.baseService.loggingService.success(`User claim ${row.description} deleted successfully`);
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

