import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { BaseService, INameValue } from '../shared/service/base.service';
import { HubService } from '../shared/hub/hub.service';
import { IServiceOptions, IDataService, ICollectionViewModel } from '../shared/service/base.service';
import * as _ from 'lodash';
import { IClaimsToServerFilter } from './claim.filter.service';
import { IFilterDefinition } from '../shared/filtering/filter.service';
import { TraceMethodPosition } from '../shared/logging/logging.service'

@Injectable()
export class ClaimService implements IDataService<IClaim, IClaimViewModel, IClaimsToServerFilter, IClaimsToClientFilter> {
    
    constructor(private baseService: BaseService) {
         baseService.initializeTrace("ClaimService");               
    }

    private endpointKey: string = 'xClaim.Core.Web.Api.Claim';



    public get(skip?: number, take?: number, toServerFilter?: IClaimsToServerFilter): Observable<IClaimsToClientFilter> {

        var trace = this.baseService.classTrace("get");
        trace(TraceMethodPosition.Entry);
        
        if (!skip) skip = 0;
        if (!take) take = this.baseService.appSettings.DefaultPageSize;

        var url = `claims?skip=${skip}&take=${take}`;
        if (toServerFilter && toServerFilter.DateOfServiceStart) url +=`&startServiceDate=${toServerFilter.DateOfServiceStart}`;
        if (toServerFilter && toServerFilter.DateOfServiceEnd) url +=`&endServiceDate=${toServerFilter.DateOfServiceEnd}`;
        if (toServerFilter && toServerFilter.ProcessedStartDate) url +=`&startDate=${toServerFilter.ProcessedStartDate}`;
        if (toServerFilter && toServerFilter.ProcessedEndDate) url +=`&endDate=${toServerFilter.ProcessedEndDate}`;
        if (toServerFilter && toServerFilter.Bin) url +=`&bin=${toServerFilter.Bin}`;
        if (toServerFilter && toServerFilter.Pcn) url +=`&pcn=${toServerFilter.Pcn}`;
        if (toServerFilter && toServerFilter.GroupId) url +=`&groupId=${toServerFilter.GroupId}`;
        if (toServerFilter && toServerFilter.PrescriptionRefNumber) url +=`&prescriptionRefNumber=${toServerFilter.PrescriptionRefNumber}`;
        if (toServerFilter && toServerFilter.ServiceProviderId) url +=`&serviceProviderId=${toServerFilter.ServiceProviderId}`;
        if (toServerFilter && toServerFilter.TransactionCode) url +=`&transactionCode=${toServerFilter.TransactionCode}`;
        var obs = this.baseService.getObjectData<IClaimsFromServer>(this.baseService.getOptions(this.baseService.hubService, this.endpointKey, "There was an error retrieving the claims"), url)
            .map<IClaimsToClientFilter>(data => { 
                            return { RowCount: data.RowCount, 
                                     Rows: data.Rows.map(r => this.toViewModel(r))}});

        trace(TraceMethodPosition.Exit);
        return obs;
    }
    
    public getClaim(id: string): Observable<IClaim> {  
        var trace = this.baseService.classTrace("getClaim");
        trace(TraceMethodPosition.Entry);
        var obs = this.baseService.getObjectData<IClaim>(this.baseService.getOptions(this.baseService.hubService, this.endpointKey, "There was an error retrieving the user profile"), `claim/${id}`);
        trace(TraceMethodPosition.Exit);
        return obs;
    }
    
    
    public toModel(vm: IClaimViewModel): IClaim {
        var model: IClaim = {
            Id: vm.Id,
            ProcessedDate: vm.ProcessedDate,
            ServiceProviderId: vm.ServiceProviderId,
            TransactionCode: vm.TransactionCode,
            DateOfService: vm.DateOfService,
            PrescriptionRefNumber: vm.PrescriptionRefNumber,
            Bin: vm.Bin,
            Pcn: vm.Pcn,
            GroupId: vm.GroupId,
            TransactionCount: vm.TransactionCount,
            HeaderResponseStatus: vm.HeaderResponseStatus,
            Version: vm.Version
        };        
        return model;
    }

    public toViewModel(model: IClaim): IClaimViewModel {
        var vm: IClaimViewModel  = {
            Id: model.Id,
            ProcessedDate: model.ProcessedDate,
            ServiceProviderId: model.ServiceProviderId,
            TransactionCode: model.TransactionCode,
            DateOfService: model.DateOfService,
            PrescriptionRefNumber: model.PrescriptionRefNumber,
            Bin: model.Bin,
            Pcn: model.Pcn,
            GroupId: model.GroupId,
            TransactionCount: model.TransactionCount,
            HeaderResponseStatus: model.HeaderResponseStatus,
            Version: model.Version,
            TooltipMessage: `<table>
                            <tr>
                                <td>Date Of Service:</td><td style="padding-left: 5px">${model.DateOfService}</td>
                            </tr>
                            <tr>
                                <td>BIN:</td><td style="padding-left: 5px">${model.Bin}</td>
                            </tr>   
                            <tr>
                                <td>PCN:</td><td style="padding-left: 5px">${model.Pcn}</td>
                            </tr>   
                            <tr>
                                <td>Group Id:</td><td style="padding-left: 5px">${model.GroupId}</td>
                            </tr>   
                            <tr>                                        
                                <td>Id:</td><td style="padding-left: 5px">${model.Id}</td>
                            </tr>
                            </table>
            `  
        };            
    
        return vm;
    }
    
    
}

export interface IClaimViewModel {
     Id: string;
     ProcessedDate: Date;
     ServiceProviderId: string;
     TransactionCode: string;
     DateOfService: Date;
     PrescriptionRefNumber: string;
     Bin: string;
     Pcn: string;
     GroupId: string;
     TransactionCount: number;
     HeaderResponseStatus: string;
     Version: string;
     TooltipMessage: string;
}


export interface IClaim {
     Id: string;
     ProcessedDate: Date;
     ServiceProviderId: string;
     TransactionCode: string;
     DateOfService: Date;
     PrescriptionRefNumber: string;
     Bin: string;
     Pcn: string;
     GroupId: string;
     TransactionCount: number;
     HeaderResponseStatus: string;
     Version: string;
}



export interface IClaimsFromServer extends ICollectionViewModel<IClaim> {

}

export interface IClaimsToClientFilter extends ICollectionViewModel<IClaimViewModel> {
    
}

