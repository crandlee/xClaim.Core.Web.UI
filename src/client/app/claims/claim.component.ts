import { Component, ViewChild } from '@angular/core';
import { BaseService } from '../shared/service/base.service';
import { ClaimService, IClaimViewModel } from '../claims/claim.service';
import { XCoreBaseComponent } from '../shared/component/base.component';
import { HubService } from '../shared/hub/hub.service';
import * as _ from 'lodash';
import { RouteSegment } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { TraceMethodPosition } from '../shared/logging/logging.service';
import { SecurityService } from '../shared/security/security.service';

@Component({
    moduleId: module.id,
    styleUrls: ['claim.component.css'],
    templateUrl: 'claim.component.html',
    providers: [ClaimService],
    directives: []
})
export class ClaimComponent extends XCoreBaseComponent  {

    public claim: IClaimViewModel;
    public controlDataDescriptions: string[];
    public id: string;
    public showDescriptions: boolean = false;

    public firstName: string;
    public lastName: string;
    public genderCode: string;
    public memberId: string;
    public personCode: string;
    public productServiceId: string;
    public compoundDosageForm: string;
    public compoundDispensingUnitForm: string;
    public compounds: ICompound[] = [];
    public refillCount: string;
    public isCompound: string;
    public wac: string;
    public unitCost: string;
    public unitCostUsed: string;
    public quantity: string;
    public macDifference: string;
    public otherCoverageAmount: string;
    public otherCoverage: string;
    public dispensedAsWritten: string;
    public daysSupply: string;
    public prescriberId: string;
    public priorAuthorization: string;
    public rebate: string;
    public rebatePct: string;
    public checkNumber: string;
    public checkDate: string;
    public costSubmitted: string;
    public costCalculated: string;
    public dispFeeSubmitted: string;
    public dispFeeCalculated: string;
    public taxSubmitted: string;
    public taxCalculated: string;
    public priceSubmitted: string;
    public priceCalculated: string;
    public copaySubmitted: string;
    public copayCalculated: string;
    public usualAndCustomary: string;
    public paidAmount: string;
    public totalWithMargin: string;
    public employerName: string;
    public dateOfInjury: string;
    public workersCompClaimId: string;

    public canViewSummary: boolean;
    public canViewDetails: boolean;
    public canViewDiagnostics: boolean;

    constructor(protected baseService: BaseService, 
        private claimService: ClaimService, private routeSegment: RouteSegment,
        private securityService: SecurityService)     
    {  
        super(baseService);
        this.initializeTrace("UserComponent");
        this.id = routeSegment.getParam("id");
        this.claim = this.claimService.getEmptyClaimViewModel();
    }
        
    
    private getInitialData(claimService: ClaimService, id: string): void {        
        var trace = this.classTrace("getInitialData");
        trace(TraceMethodPosition.Entry);        
                            
        this.claimService.getClaim(this.id).subscribe(model => {
            trace(TraceMethodPosition.CallbackStart);            
            this.claim = this.claimService.toViewModel(model);
            this.setSummaryFields();
            trace(TraceMethodPosition.CallbackEnd); 
        }); 
        
        trace(TraceMethodPosition.Exit);
    }

    private setSummaryFields(): void {
        this.firstName = this.getFieldValue("CA");
        this.lastName = this.getFieldValue("CB");
        this.memberId = this.getFieldValue("C2");
        this.genderCode = this.getFieldValue("C5");
        this.personCode = this.getFieldValue("C3");
        this.productServiceId = this.getFieldValue("D7");
        this.compoundDispensingUnitForm = this.getFieldValue("EG");
        this.compoundDosageForm = this.getFieldValue("EF");
        this.compounds = this.getCompounds();
        this.refillCount = this.getFieldValue("D3") + "/" + this.getFieldValue("DF");
        this.isCompound = this.getFieldValue("D6");
        this.daysSupply = this.getFieldValue("D5");
        this.quantity = this.getFieldValue("E7");
        this.otherCoverage = this.getFieldValue("C8");
        this.dispensedAsWritten = this.getFieldValue("D8");
        this.prescriberId = this.getFieldValue("DB");
        this.priorAuthorization = this.getFieldValue("EU") + " - " + this.getFieldValue("EV");
        this.costSubmitted = this.getFieldValue("D9");
        this.dispFeeSubmitted = this.getFieldValue("DC");
        this.taxSubmitted = this.getFieldValue("HA") || this.getFieldValue("GE");
        this.usualAndCustomary = this.getFieldValue("DQ");
        this.copaySubmitted = this.getFieldValue("DX");
        
    }

    private getCompounds(): ICompound[] {
        var ids = this.getFieldValues("TE");
        var qtys = this.getFieldValues("ED");
        var costs = this.getFieldValues("EE");
        var vals = _.zip(ids, qtys, costs);
        var compounds = _.map(vals, v => {
            return <ICompound>_.zipObject(["id", "qty", "cost"], v);
        });
        return compounds;
    }


    private getFieldValue(fieldCode: string): string {
        if (!this.claim || !this.claim.contents) return "";
        var val = this.claimService.getFieldValues(fieldCode, this.claim.contents, true);
        if (val.length > 0) return val[0];
        return "";
    }

    private getFieldValues(fieldCode: string): string[] {
        if (!this.claim || !this.claim.contents) return [];
        return this.claimService.getFieldValues(fieldCode, this.claim.contents, false, true);
    }

    public cancel() {
        this.baseService.router.navigate(["/packetlist"]);
    }

    ngAfterViewInit() {
        this.baseService.hubService.callbackWhenLoaded(this.getInitialData.bind(this, this.claimService, this.id));
    }

    ngOnInit() {        
        super.NotifyLoaded("Claim");   
        this.canViewSummary = this.securityService.HasAdminRole()
            || this.securityService.getTokenValueAsBoolean("xclaim.permissions.claims.summary");
        this.canViewDetails = this.securityService.HasAdminRole()
            || this.securityService.getTokenValueAsBoolean("xclaim.permissions.claims.details");
        this.canViewDiagnostics = this.securityService.HasAdminRole()
            || this.securityService.getTokenValueAsBoolean("xclaim.permissions.claims.diagnostics");

    }
 
    
}

export interface ICompound {
    id: string;
    cost: string;
    qty: string;
}
