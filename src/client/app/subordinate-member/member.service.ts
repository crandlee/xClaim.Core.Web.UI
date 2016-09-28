import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { BaseService, INameValue, IDropdownOptionViewModel } from '../shared/service/base.service';
import { HubService } from '../shared/hub/hub.service';
import { IServiceOptions, IDataService, ICollectionViewModel, IEnumViewModel } from '../shared/service/base.service';
import * as _ from 'lodash';
import { IMembersToServerFilter } from './member.filter.service';
import { IFilterDefinition } from '../shared/filtering/filter.service';
import { TraceMethodPosition } from '../shared/logging/logging.service'
import * as moment from 'moment';
import { IAddress } from '../shared/common/interfaces.ts';

@Injectable()
export class MemberService implements IDataService<IMember, IMemberViewModel, IMembersToServerFilter, IMembersToClientFilter> {
    
    constructor(private baseService: BaseService) {
         baseService.initializeTrace("MemberService");               
    }

    public endpointKey: string = 'xClaim.Core.Web.Api.Claims';


    public get(skip?: number, take?: number, toServerFilter?: IMembersToServerFilter): Observable<IMembersToClientFilter> {

        var trace = this.baseService.classTrace("get");
        trace(TraceMethodPosition.Entry);
        
        if (!skip) skip = 0;
        if (!take) take = this.baseService.appSettings.DefaultPageSize;

        var url = `members?skip=${skip}&take=${take}`;
        if (toServerFilter && toServerFilter.memberId) url +=`&memberId=${toServerFilter.memberId}`;
        if (toServerFilter && toServerFilter.firstName) url +=`&firstName=${toServerFilter.firstName}`;
        if (toServerFilter && toServerFilter.lastName) url +=`&lastName=${toServerFilter.lastName}`;
        var obs = this.baseService.getObjectData<IMembersFromServer>(this.baseService.getOptions(this.baseService.hubService, this.endpointKey, "There was an error retrieving the data"), url)
            .map<IMembersToClientFilter>(data => { 
                            return { rowCount: data.rowCount, 
                                     rows: data.rows.map(r => this.toViewModel(r))}});

        trace(TraceMethodPosition.Exit);
        return obs;
    }


    public getRelationshipCodes(): Observable<IEnumViewModel[]> {
        var trace = this.baseService.classTrace("getRelationshipCodes");
        trace(TraceMethodPosition.Entry);
        var obs = this.baseService.getObjectData<IEnumViewModel[]>(this.baseService
            .getOptions(this.baseService.hubService, this.endpointKey, "There was an error retrieving the relationship codes"), `relationshipcodes`);
        trace(TraceMethodPosition.Exit);
        return obs;
    }

    public getGenderCodes(): Observable<IEnumViewModel[]> {
        var trace = this.baseService.classTrace("getGenderCodes");
        trace(TraceMethodPosition.Entry);
        var obs = this.baseService.getObjectData<IEnumViewModel[]>(this.baseService
            .getOptions(this.baseService.hubService, this.endpointKey, "There was an error retrieving the gender codes"), `gendercodes`);
        trace(TraceMethodPosition.Exit);
        return obs;
    }

    public getPlans(): Observable<IDropdownOptionViewModel[]> {
        var trace = this.baseService.classTrace("getPlans");
        trace(TraceMethodPosition.Entry);
        var obs = this.baseService.getObjectData<IDropdownOptionViewModel[]>(this.baseService
            .getOptions(this.baseService.hubService, this.endpointKey, "There was an error retrieving the plans"), `plansfordropdown`);
        trace(TraceMethodPosition.Exit);
        return obs;
    }


    public isIdentDuplicate(id: string, memberId: string, effectiveDate: string): Observable<boolean> {
        var trace = this.baseService.classTrace("isIdentDuplicate");
        trace(TraceMethodPosition.Entry);
        var fromIdents = { id: id, memberId: memberId, effectiveDate: moment(new Date(effectiveDate)).utc().toDate()};    
        var obs = this.baseService.postData<IMemberFromIdentsStruct, boolean>(
            fromIdents
            , this.baseService.getOptions(this.baseService.hubService, 
                this.endpointKey, "There was an error valdiating the identifiers"), `memberfromidents`);
        trace(TraceMethodPosition.Exit);
        return obs;
    }

    public getNew(): Observable<IMember> {          
        var trace = this.baseService.classTrace("getNew");
        trace(TraceMethodPosition.Entry);
        var obs = this.baseService.getObjectData<IMember>(this.baseService
            .getOptions(this.baseService.hubService, this.endpointKey, "There was an error starting a new item"), `members/new`)
        trace(TraceMethodPosition.Exit);
        return obs;
    }


    public getExistingById(memberId: string): Observable<IMember> {  
        var trace = this.baseService.classTrace("getExistingById");
        trace(TraceMethodPosition.Entry);
        var obs = this.baseService.getObjectData<IMember>(this.baseService
            .getOptions(this.baseService.hubService, this.endpointKey, "There was an error retrieving the item"), `membersbyid/${memberId}`);
        trace(TraceMethodPosition.Exit);
        return obs;
    }
    
    public getExisting(id: string): Observable<IMember> {  
        var trace = this.baseService.classTrace("getExisting");
        trace(TraceMethodPosition.Entry);
        var obs = this.baseService.getObjectData<IMember>(this.baseService
            .getOptions(this.baseService.hubService, this.endpointKey, "There was an error retrieving the item"), `members/${id}`);
        trace(TraceMethodPosition.Exit);
        return obs;
    }

    public save(vm: IMemberViewModel): Observable<IMemberViewModel> {
        var trace = this.baseService.classTrace("save");
        trace(TraceMethodPosition.Entry);
        var m = this.toModel(vm);
        var obs = this.baseService.postData<IMember, IMember>(m, 
            this.baseService.getOptions(this.baseService.hubService, this.endpointKey, "There was an error saving the item"), 'members')
                .map(m => this.toViewModel(m));        
        trace(TraceMethodPosition.Exit)
        return obs;
    }

    public delete(id: string): Observable<boolean> {
        var trace = this.baseService.classTrace("delete");
        trace(TraceMethodPosition.Entry);                
        var obs = this.baseService.deleteData(this.baseService
            .getOptions(this.baseService.hubService, this.endpointKey, "There was an error deleting the item"), `members/${id}`);        
        trace(TraceMethodPosition.Exit)
        return obs;
        
    }

    public toModel(viewModel: IMemberViewModel): IMember {
        var model: IMember  = {
            id: viewModel.id,
            planId: viewModel.planId,
            planName: viewModel.planName,
            memberId: viewModel.memberId,
            dob: moment(new Date(viewModel.dateOfBirth)).toDate(),
            location: viewModel.location,
            relationshipCode: viewModel.relationshipCode,
            personCode: viewModel.personCode,
            firstName: viewModel.firstName,
            middleName: viewModel.middleName,
            lastName: viewModel.lastName,            
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
            telephone: viewModel.phone,
            emailAddress: viewModel.emailAddress,
            sex: viewModel.sex,
            eligibilityCode: viewModel.eligibilityCode,
            effectiveDate: moment(new Date(viewModel.effectiveDate)).utc().toDate(),
            terminationDate: viewModel.terminationDate ? moment(new Date(viewModel.terminationDate)).utc().toDate() : null
        }
        return model;
    }
    
    public toViewModel(model: IMember): IMemberViewModel {
        var vm: IMemberViewModel  = {
            id: model.id,
            planId: model.planId,
            planName: model.planName,
            memberId: model.memberId,
            dateOfBirth: moment(model.dob).format('MM/DD/YYYY'),
            location: model.location,
            relationshipCode: model.relationshipCode,
            personCode: model.personCode,
            firstName: model.firstName,
            middleName: model.middleName,
            lastName: model.lastName,            
            addressId: model.addressId || this.baseService.appSettings.EmptyGuid,
            address: {
                id: (model.address && model.address.id),
                address1: (model.address && model.address.address1),
                address2: (model.address && model.address.address2),
                address3: (model.address && model.address.address3),
                city: (model.address && model.address.city),
                state: (model.address && model.address.state),
                zipCode: (model.address && model.address.zipCode)
            },
            phone: model.telephone,
            emailAddress: model.emailAddress,
            sex: model.sex,
            eligibilityCode: model.eligibilityCode,
            effectiveDate: moment.utc(model.effectiveDate).local().format('MM/DD/YYYY hh:mm:ss a'),
            terminationDate: model.terminationDate ? moment.utc(model.terminationDate).local().format('MM/DD/YYYY hh:mm:ss a') : null,
            tooltipMessage: `<table>
                            <tr>
                                <td>Date Of Birth:</td><td style="padding-left: 5px">${moment(model.dob).format('MM/DD/YYYY')}</td>
                            </tr>   
                            <tr>
                                <td>Phone:</td><td style="padding-left: 5px">${model.telephone || '(None)'}</td>
                            </tr>   
                            <tr>
                                <td>Effective Date:</td><td style="padding-left: 5px">${moment.utc(model.effectiveDate).local().format('MM/DD/YYYY hh:mm:ss a')}</td>
                            </tr>   
                            <tr>                                        
                                <td>Id:</td><td style="padding-left: 5px">${model.id}</td>
                            </tr>
                            </table>
            `  
        };            
    
        return vm;
    }
    
    public getEmptyViewModel(): IMemberViewModel {
        return <IMemberViewModel>{ id: "", planId: 0, memberId: "", dateOfBirth: "", personCode: 0, location: "", relationshipCode: 0,
            firstName: "", middleName: "", lastName: "", addressId: "", 
            address: { id: "", address1: "", address2: "", address3: "", city: "", state: "", zipCode: ""},  
            phone: "", emailAddress: "", sex: 0, eligibilityCode: "", effectiveDate: "", terminationDate: "", tooltipMessage: ""};
    }


}


export interface IMemberViewModel {
    id: string;
    memberId: string;
    planId: number;
    planName: string;
    dateOfBirth: string;
    personCode: number;
    location: string;
    relationshipCode: number;
    firstName: string;
    middleName: string;
    lastName: string;
    addressId: string;
    address: IAddress;
    phone: string;
    emailAddress: string;
    sex: number;
    eligibilityCode: string;    
    effectiveDate: string;
    terminationDate: string;
    tooltipMessage: string;
}

export interface IMember {
    id: string;
    memberId: string;
    planId: number;
    planName: string;
    dob: Date;
    personCode: number;
    location: string;
    relationshipCode: number;
    firstName: string;
    middleName: string;
    lastName: string;
    addressId: string;
    address: IAddress;
    telephone: string;
    emailAddress: string;
    sex: number;
    eligibilityCode: string;    
    effectiveDate: Date;
    terminationDate: Date;
}


export interface IMemberFromIdentsStruct {
    id: string;
    memberId: string;
    effectiveDate: Date;
}
export interface IMembersFromServer extends ICollectionViewModel<IMember> {

}

export interface IMembersToClientFilter extends ICollectionViewModel<IMemberViewModel> {
    
}

