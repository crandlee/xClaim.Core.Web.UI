import { Component, ViewChild } from '@angular/core';
import { BaseService } from '../shared/service/base.service';
import { ClaimService, IClaimViewModel } from './claim.service';
import { XCoreBaseComponent } from '../shared/component/base.component';
import { HubService } from '../shared/hub/hub.service';
import * as _ from 'lodash';
import { Location } from '@angular/common';
import { RouteSegment } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { TraceMethodPosition } from '../shared/logging/logging.service';
import { SecurityService } from '../shared/security/security.service';
import { OverpunchService } from './overpunch.service'
import {IMember} from '../subordinate-member/member.service';
import {IPlan} from '../subordinate-plan/plan.service';
import {IServiceProvider} from '../subordinate-serviceprovider/serviceprovider.service';
import {IProductService} from '../subordinate-productservice/productservice.service';
import * as moment from 'moment';

@Component({
    moduleId: module.id,
    styleUrls: ['claim.component.css'],
    templateUrl: 'claim.component.html',
    providers: [ClaimService, OverpunchService],
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

    public pharmacyName: string;
    public pharmacyTelephone: string;
    public memberEffectiveDate: string;
    public memberTerminationDate: string;
    public dateOfBirth: string;
    public productName: string;
    public productGpi: string;
    public productMultiSourceCode: string;
    public groupName: string;

    public canViewSummary: boolean;
    public canViewDetails: boolean;
    public canViewDiagnostics: boolean;

    constructor(protected baseService: BaseService, 
        private claimService: ClaimService, private routeSegment: RouteSegment,
        private securityService: SecurityService, private location: Location)     
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
        this.costCalculated = this.getPairedContentsFieldValue("F6", true, 2);
        this.dispFeeSubmitted = this.getFieldValue("DC");
        this.dispFeeCalculated = this.getPairedContentsFieldValue("F7", true, 2);
        this.taxSubmitted = this.getFieldValue("HA") || this.getFieldValue("GE");
        this.taxCalculated = this.getPairedContentsFieldValue("AX", true, 2) || this.getPairedContentsFieldValue("AW", true, 2);
        this.usualAndCustomary = this.getFieldValue("DQ");
        this.copaySubmitted = this.getFieldValue("DX");
        this.copayCalculated = this.getPairedContentsFieldValue("F5", true, 2);
        this.paidAmount = this.getPairedContentsFieldValue("F9", true, 2);

        var serviceProvider = this.getServiceProvider();
        var plan = this.getPlan();
        var member = this.getMember();
        var products = this.getProductServices();
        this.pharmacyName = serviceProvider && serviceProvider.name;
        this.pharmacyTelephone = serviceProvider && serviceProvider.telephone;
        this.memberEffectiveDate = member && member.effectiveDate ? moment.utc(member.effectiveDate).local().format('MM/DD/YYYY hh:mm:ss a') : null;
        this.memberTerminationDate = member && member.terminationDate ? moment.utc(member.terminationDate).local().format('MM/DD/YYYY hh:mm:ss a') : null
        this.dateOfBirth = member && member.dob ? moment.utc(member.dob).local().format('MM/DD/YYYY') : null
        this.groupName = plan && plan.name;

        var foundDrug = _.find(products, ps => ps.productServiceId === this.productServiceId);
        if (foundDrug) {
            this.productGpi = foundDrug.drugDetails.gpi;
            this.productMultiSourceCode = foundDrug.drugDetails.multiSourceCode;
            this.productName = foundDrug.drugDetails.label;
            this.wac = foundDrug.drugDetails.wacUnitPrice.toString();
        }  
    }

    public getProductName(ndc: string):string {
        var productServices = this.getProductServices();
        var found = _.find(productServices, ps => ps.productServiceId === ndc);
        if (found) return found.drugDetails.label;
        return "(none)";
    }

    private getServiceProvider(): IServiceProvider {
        return this.claim && this.claim.claimSubordinateData && this.claim.claimSubordinateData.serviceProvider     
    }
    private getMember(): IMember {
        return this.claim && this.claim.claimSubordinateData && this.claim.claimSubordinateData.member     
    }
    private getPlan(): IPlan {
        return this.claim && this.claim.claimSubordinateData && this.claim.claimSubordinateData.plan     
    }
    private getProductServices(): IProductService[] {
        return this.claim && this.claim.claimSubordinateData && this.claim.claimSubordinateData.productServices     
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

    public getPairedContentsFieldValue(fieldCode: string, overpunch: boolean = false, decimals: number = 0): string {
        if (!this.claim || !this.claim.pairedContents) return "";
        var values = this.claimService.getQuickFields(this.claim.pairedContents, fieldCode, overpunch, decimals);
        if (values && values.length > 0) return values[0];
        return "";
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

    public return() {
        this.location.back();
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
