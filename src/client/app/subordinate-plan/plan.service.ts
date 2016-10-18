import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { BaseService, INameValue } from '../shared/service/base.service';
import { HubService } from '../shared/hub/hub.service';
import { IServiceOptions, IDataService, ICollectionViewModel, IEnumViewModel } from '../shared/service/base.service';
import * as _ from 'lodash';
import { IPlansToServerFilter } from './plan.filter.service';
import { IFilterDefinition } from '../shared/filtering/filter.service';
import { TraceMethodPosition } from '../shared/logging/logging.service'
import * as moment from 'moment';


@Injectable()
export class PlanService implements IDataService<IPlan, IPlanViewModel, IPlansToServerFilter, IPlansToClientFilter> {
    
    constructor(private baseService: BaseService) {
         baseService.initializeTrace("PlanService");               
    }

    public endpointKey: string = 'xClaim.Core.Web.Api.Claims';


    public get(skip?: number, take?: number, toServerFilter?: IPlansToServerFilter): Observable<IPlansToClientFilter> {

        var trace = this.baseService.classTrace("get");
        trace(TraceMethodPosition.Entry);
        
        if (!skip) skip = 0;
        if (!take) take = this.baseService.appSettings.DefaultPageSize;

        var url = `plans?skip=${skip}&take=${take}`;
        if (toServerFilter && toServerFilter.name) url +=`&name=${toServerFilter.name}`;
        if (toServerFilter && toServerFilter.bin) url +=`&bin=${toServerFilter.bin}`;
        if (toServerFilter && toServerFilter.pcn) url +=`&pcn=${toServerFilter.pcn}`;
        if (toServerFilter && toServerFilter.groupId) url +=`&groupId=${toServerFilter.groupId}`;
        var obs = this.baseService.getObjectData<IPlansFromServer>(this.baseService.getOptions(this.baseService.hubService, this.endpointKey, "There was an error retrieving the data"), url)
            .map<IPlansToClientFilter>(data => { 
                            return { rowCount: data.rowCount, 
                                     rows: data.rows.map(r => this.toViewModel(r))}});

        trace(TraceMethodPosition.Exit);
        return obs;
    }

    public isNameDuplicate(name: string, id: string): Observable<boolean> {
        var trace = this.baseService.classTrace("isNameDuplicate");
        trace(TraceMethodPosition.Entry);                
        var obs = this.baseService.getObjectData<boolean>(this.baseService.getOptions(this.baseService.hubService, this.endpointKey, "There was an error valdiating the name"), `planfromname/${name}/isduplicated/${id}`);
        trace(TraceMethodPosition.Exit);
        return obs;
    }

    public isIdentDuplicate(id: string, bin: string, pcn: string, groupId: string, effectiveDate: string): Observable<boolean> {
        var trace = this.baseService.classTrace("isIdentDuplicate");
        trace(TraceMethodPosition.Entry);
        var planFromIdents = { id: id, bin: bin, pcn: pcn, groupId: groupId, effectiveDate: moment(new Date(effectiveDate)).utc().toDate()};      
        var obs = this.baseService.postData<IPlanFromIdentsStruct, boolean>(
            planFromIdents
            , this.baseService.getOptions(this.baseService.hubService, this.endpointKey, "There was an error valdiating the identifiers"), `planfromidents`);
        trace(TraceMethodPosition.Exit);
        return obs;
    }

    public getNew(): Observable<IPlan> {          
        var trace = this.baseService.classTrace("getNew");
        trace(TraceMethodPosition.Entry);
        var obs = this.baseService.getObjectData<IPlan>(this.baseService.getOptions(this.baseService.hubService, this.endpointKey, "There was an error starting a new item"), `plans/new`);
        trace(TraceMethodPosition.Exit);
        return obs;
    }


    public getExistingById(bin: string, pcn: string, groupId: string): Observable<IPlan> {  
        var trace = this.baseService.classTrace("getExistingById");
        trace(TraceMethodPosition.Entry);
        var opt = this.baseService.getOptions(this.baseService.hubService, this.endpointKey, "There was an error retrieving the item");
        opt.propogateException = true;
        var obs = this.baseService.getObjectData<IPlan>(opt, 
            `plansbyid/${bin}/${pcn}/${groupId}`);
        trace(TraceMethodPosition.Exit);
        return obs;
    }
    
    public getExisting(id: string): Observable<IPlan> {  
        var trace = this.baseService.classTrace("getExisting");
        trace(TraceMethodPosition.Entry);
        var obs = this.baseService.getObjectData<IPlan>(this.baseService.getOptions(this.baseService.hubService, this.endpointKey, "There was an error retrieving the item"), `plans/${id}`);
        trace(TraceMethodPosition.Exit);
        return obs;
    }

    public save(vm: IPlanViewModel): Observable<IPlanViewModel> {
        var trace = this.baseService.classTrace("save");
        trace(TraceMethodPosition.Entry);                
        var obs = this.baseService.postData<IPlan, IPlan>(this.toModel(vm), 
            this.baseService.getOptions(this.baseService.hubService, this.endpointKey, "There was an error saving the item"), 'plans')
                .map(m => this.toViewModel(m));        
        trace(TraceMethodPosition.Exit)
        return obs;
    }

    public delete(id: string): Observable<boolean> {
        var trace = this.baseService.classTrace("delete");
        trace(TraceMethodPosition.Entry);                
        var obs = this.baseService.deleteData(this.baseService.getOptions(this.baseService.hubService, this.endpointKey, "There was an error deleting the item"), `plans/${id}`);        
        trace(TraceMethodPosition.Exit)
        return obs;
        
    }

    public toModel(viewModel: IPlanViewModel): IPlan {
        var model: IPlan  = {
            id: viewModel.id,
            name: viewModel.name,
            bin: viewModel.bin,
            pcn: viewModel.pcn,
            groupId: viewModel.groupId,
            addressId: viewModel.addressId || this.baseService.appSettings.EmptyGuid,
            address: {
                id: (viewModel.address && (viewModel.address.id  || this.baseService.appSettings.EmptyGuid)),
                address1: (viewModel.address && viewModel.address.address1),
                address2: (viewModel.address && viewModel.address.address2),
                address3: (viewModel.address && viewModel.address.address3),
                city: (viewModel.address && viewModel.address.city),
                state: (viewModel.address && viewModel.address.state),
                zipCode: (viewModel.address && viewModel.address.zipCode)
            },
            phone: viewModel.phone,
            fax: viewModel.fax,
            contact: viewModel.contact,
            comments: viewModel.comments,
            effectiveDate: moment(new Date(viewModel.effectiveDate)).utc().toDate(),
            terminationDate: viewModel.terminationDate ? moment(new Date(viewModel.terminationDate)).utc().toDate() : null
        }
        return model;
    }
    
    public toViewModel(model: IPlan): IPlanViewModel {
        var vm: IPlanViewModel  = {
            id: model.id,
            name: model.name,
            bin: model.bin,
            pcn: model.pcn,
            groupId: model.groupId,
            addressId: model.addressId,
            address: {
                id: (model.address && model.address.id),
                address1: (model.address && model.address.address1),
                address2: (model.address && model.address.address2),
                address3: (model.address && model.address.address3),
                city: (model.address && model.address.city),
                state: (model.address && model.address.state),
                zipCode: (model.address && model.address.zipCode)
            },
            phone: model.phone,
            fax: model.fax,
            contact: model.contact,
            comments: model.comments,
            effectiveDate: moment.utc(model.effectiveDate).local().format('MM/DD/YYYY hh:mm:ss a'),
            terminationDate: model.terminationDate ? moment.utc(model.terminationDate).local().format('MM/DD/YYYY hh:mm:ss a') : null,
            tooltipMessage: `<table>
                            <tr>
                                <td>Contact:</td><td>${model.contact || '(None)'}</td>
                            </tr>   
                            <tr>
                                <td>Phone:</td><td>${model.phone || '(None)'}</td>
                            </tr>   
                            <tr>
                                <td>Effective Date:</td><td>${moment.utc(model.effectiveDate).local().format('MM/DD/YYYY hh:mm:ss a')}</td>
                            </tr>   
                            <tr>                                        
                                <td>Id:</td><td>${model.id}</td>
                            </tr>
                            </table>
            `  
        };            
    
        return vm;
    }
    
    public getEmptyViewModel(): IPlanViewModel {
        return <IPlanViewModel>{ id: "", name: "", bin: "", pcn: "", groupId: "", address: { address1: "", address2: "", address3: "", city: "", state: "", zipCode: ""},  
            phone: "", fax: "", contact: "", comments: "", effectiveDate: "", terminationDate: "", tooltipMessage: ""};
    }


}


export interface IPlanViewModel {
    id: string;
    name: string;
    bin: string;
    pcn: string;
    groupId: string;
    addressId: string;
    address: IAddress;
    phone: string;
    fax: string;
    contact: string;
    comments: string;
    effectiveDate: string;
    terminationDate: string;
    tooltipMessage: string;
}

export interface IPlan {
    id: string;
    name: string;
    bin: string;
    pcn: string;
    groupId: string;
    addressId: string;
    address: IAddress;
    phone: string;
    fax: string;
    contact: string;
    comments: string;
    effectiveDate: Date;
    terminationDate: Date;
}

export interface IAddress {
    id: string;
    address1: string;
    address2: string;
    address3: string;
    city: string;
    state: string;
    zipCode: string;
}

export interface IPlanFromIdentsStruct {
    id: string;
    bin: string;
    pcn: string;
    groupId: string;
    effectiveDate: Date;
}
export interface IPlansFromServer extends ICollectionViewModel<IPlan> {

}

export interface IPlansToClientFilter extends ICollectionViewModel<IPlanViewModel> {
    
}

