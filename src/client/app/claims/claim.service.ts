import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { BaseService, INameValue } from '../shared/service/base.service';
import { HubService } from '../shared/hub/hub.service';
import { IServiceOptions, IDataService, ICollectionViewModel } from '../shared/service/base.service';
import * as _ from 'lodash';
import { IClaimsToServerFilter } from './claim.filter.service';
import { IFilterDefinition } from '../shared/filtering/filter.service';
import { TraceMethodPosition } from '../shared/logging/logging.service'
import * as moment from 'moment';

@Injectable()
export class ClaimService implements IDataService<IClaim, IClaimViewModel, IClaimsToServerFilter, IClaimsToClientFilter> {
    
    constructor(private baseService: BaseService) {
         baseService.initializeTrace("ClaimService");               
    }

    private endpointKey: string = 'xClaim.Core.Web.Api.Claims';



    public get(skip?: number, take?: number, toServerFilter?: IClaimsToServerFilter): Observable<IClaimsToClientFilter> {

        var trace = this.baseService.classTrace("get");
        trace(TraceMethodPosition.Entry);
        
        if (!skip) skip = 0;
        if (!take) take = this.baseService.appSettings.DefaultPageSize;

        var url = `claims?skip=${skip}&take=${take}`;
        if (toServerFilter && toServerFilter.dateOfServiceStart) url +=`&startServiceDate=${toServerFilter.dateOfServiceStart}`;
        if (toServerFilter && toServerFilter.dateOfServiceEnd) url +=`&endServiceDate=${toServerFilter.dateOfServiceEnd}`;
        if (toServerFilter && toServerFilter.processedStartDate) url +=`&startDate=${toServerFilter.processedStartDate}`;
        if (toServerFilter && toServerFilter.processedEndDate) url +=`&endDate=${toServerFilter.processedEndDate}`;
        if (toServerFilter && toServerFilter.bin) url +=`&bin=${toServerFilter.bin}`;
        if (toServerFilter && toServerFilter.pcn) url +=`&pcn=${toServerFilter.pcn}`;
        if (toServerFilter && toServerFilter.groupId) url +=`&groupId=${toServerFilter.groupId}`;
        if (toServerFilter && toServerFilter.prescriptionRefNumber) url +=`&prescriptionRefNumber=${toServerFilter.prescriptionRefNumber}`;
        if (toServerFilter && toServerFilter.serviceProviderId) url +=`&serviceProviderId=${toServerFilter.serviceProviderId}`;
        if (toServerFilter && toServerFilter.transactionCode) url +=`&transactionCode=${toServerFilter.transactionCode}`;
        var obs = this.baseService.getObjectData<IClaimsFromServer>(this.baseService.getOptions(this.baseService.hubService, this.endpointKey, "There was an error retrieving the claims"), url)
            .map<IClaimsToClientFilter>(data => { 
                            return { rowCount: data.rowCount, 
                                     rows: data.rows.map(r => this.toViewModel(r))}});

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
            id: vm.id,
            processedDate: new Date(vm.processedDate),
            serviceProviderId: vm.serviceProviderId,
            transactionCode: vm.transactionCode,
            dateOfService: new Date(vm.dateOfService),
            prescriptionRefNumber: vm.prescriptionRefNumber,
            bin: vm.bin,
            pcn: vm.pcn,
            groupId: vm.groupId,
            transactionCount: vm.transactionCount,
            headerResponseStatus: vm.headerResponseStatus,
            version: vm.version,
            contents: vm.contents
        };        
        return model;
    }

    public toViewModel(model: IClaim): IClaimViewModel {
        var vm: IClaimViewModel  = {
            id: model.id,
            processedDate: moment(model.processedDate).format('MM/DD/YYYY hh:mm:ss a'),
            serviceProviderId: model.serviceProviderId,
            transactionCode: model.transactionCode,
            dateOfService: moment(model.dateOfService).format('MM/DD/YYYY'),
            prescriptionRefNumber: model.prescriptionRefNumber,
            bin: model.bin,
            pcn: model.pcn,
            groupId: model.groupId,
            transactionCount: model.transactionCount,
            headerResponseStatus: model.headerResponseStatus,
            version: model.version,
            contents: model.contents,
            tooltipMessage: `<table>
                            <tr>
                                <td>BIN:</td><td style="padding-left: 5px">${model.bin}</td>
                            </tr>   
                            <tr>
                                <td>PCN:</td><td style="padding-left: 5px">${model.pcn}</td>
                            </tr>   
                            <tr>
                                <td>Group Id:</td><td style="padding-left: 5px">${model.groupId}</td>
                            </tr>   
                            <tr>
                                <td>Transaction Code:</td><td style="padding-left: 5px">${model.transactionCode}</td>
                            </tr>   
                            <tr>
                                <td>Response Status:</td><td style="padding-left: 5px">${model.headerResponseStatus}</td>
                            </tr>   
                            <tr>                                        
                                <td>Id:</td><td style="padding-left: 5px">${model.id}</td>
                            </tr>
                            </table>
            `  
        };            
    
        return vm;
    }
    
    public getEmptyClaimViewModel(): IClaimViewModel {
        return <IClaimViewModel>{ id: "", processedDate: "", serviceProviderId: "", transactionCode: "", dateOfService: "",
            prescriptionRefNumber: "", bin: "", pcn: "", groupId: "", transactionCount: 0, headerResponseStatus: "", version: "", contents: "", 
            tooltipMessage: ""};
    }

}

export interface IClaimViewModel {
     id: string;
     processedDate: string;
     serviceProviderId: string;
     transactionCode: string;
     dateOfService: string;
     prescriptionRefNumber: string;
     bin: string;
     pcn: string;
     groupId: string;
     transactionCount: number;
     headerResponseStatus: string;
     version: string;
     contents: string;
     tooltipMessage: string;
}


export interface IClaim {
     id: string;
     processedDate: Date;
     serviceProviderId: string;
     transactionCode: string;
     dateOfService: Date;
     prescriptionRefNumber: string;
     bin: string;
     pcn: string;
     groupId: string;
     contents: string;
     transactionCount: number;
     headerResponseStatus: string;
     version: string;
}



export interface IClaimsFromServer extends ICollectionViewModel<IClaim> {

}

export interface IClaimsToClientFilter extends ICollectionViewModel<IClaimViewModel> {
    
}

