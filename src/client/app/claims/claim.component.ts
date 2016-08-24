import { Component, ViewChild } from '@angular/core';
import { BaseService } from '../shared/service/base.service';
import { ClaimService, IClaimViewModel } from '../claims/claim.service';
import { XCoreBaseComponent } from '../shared/component/base.component';
import { HubService } from '../shared/hub/hub.service';
import * as _ from 'lodash';
import { RouteSegment } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { TraceMethodPosition } from '../shared/logging/logging.service';

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
    
    constructor(protected baseService: BaseService, private claimService: ClaimService, private routeSegment: RouteSegment)     
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
            trace(TraceMethodPosition.CallbackEnd);            
        }); 
        
        trace(TraceMethodPosition.Exit);
    }
    
    public cancel() {
        this.baseService.router.navigate(["/packetlist"]);
    }

    ngAfterViewInit() {
        this.baseService.hubService.callbackWhenLoaded(this.getInitialData.bind(this, this.claimService, this.id));
    }

    ngOnInit() {        
        super.NotifyLoaded("Claim");   
    }
    
}

