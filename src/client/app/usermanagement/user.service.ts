import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { BaseService, INameValue } from '../shared/service/base.service';
import { HubService } from '../shared/hub/hub.service';
import { IServiceOptions, IDataService, ICollectionViewModel } from '../shared/service/base.service';
import * as _ from 'lodash';
import { IUsersToServerFilter } from './user.filter.service';
import { IFilterDefinition } from '../shared/filtering/filter.service';
import { TraceMethodPosition } from '../shared/logging/logging.service'

@Injectable()
export class UserService implements IDataService<IUserProfile, IUserProfileViewModel, IUsersToServerFilter, IUsersToClientFilter> {
    
    constructor(private baseService: BaseService) {
         baseService.initializeTrace("FilterService");               
    }

    private endpointKey: string = 'xClaim.Core.Web.Api.Security';


    public defaultStatuses: INameValue<string>[] = [{ name: "All", value:"All"}, {name: "Enabled", value: "Enabled"}, {name: "Disabled", value: "Disabled"}]

    public get(skip?: number, take?: number, toServerFilter?: IUsersToServerFilter): Observable<IUsersToClientFilter> {

        var trace = this.baseService.classTrace("getUsers");
        trace(TraceMethodPosition.Entry);
        
        if (!skip) skip = 0;
        if (!take) take = this.baseService.appSettings.DefaultPageSize;

        var url = `users?skip=${skip}&take=${take}`;
        if (toServerFilter && toServerFilter.userName) url +=`&userName=${toServerFilter.userName}`;
        if (toServerFilter && toServerFilter.fullName) url +=`&fullName=${toServerFilter.fullName}`;
        if (toServerFilter && toServerFilter.email) url +=`&email=${toServerFilter.email}`;
        if (toServerFilter && toServerFilter.status && toServerFilter.status !== "All") url +=`&enabled=${toServerFilter.status === "Enabled"? true : false}`;

        var obs = this.baseService.getObjectData<IUsersFromServer>(this.baseService.getOptions(this.baseService.hubService, this.endpointKey, "There was an error retrieving the users"), url)
            .map<IUsersToClientFilter>(data => { 
                            return { rowCount: data.rowCount, 
                                    rows: data.rows.map(r => this.toViewModel(r)), 
                                    statuses: this.defaultStatuses };})

        trace(TraceMethodPosition.Exit);
        return obs;
    }

    public getNewUser(): Observable<IUserProfile> {          
        var trace = this.baseService.classTrace("getNewUser");
        trace(TraceMethodPosition.Entry);
        var obs = this.baseService.getObjectData<IUserProfile>(this.baseService.getOptions(this.baseService.hubService, this.endpointKey, "There was an error starting a new user"), `user/new`);
        trace(TraceMethodPosition.Exit);
        return obs;
    }
    
    public getUserProfile(userId: string): Observable<IUserProfile> {  
        var trace = this.baseService.classTrace("getUserProfile");
        trace(TraceMethodPosition.Entry);
        var obs = this.baseService.getObjectData<IUserProfile>(this.baseService.getOptions(this.baseService.hubService, this.endpointKey, "There was an error retrieving the user profile"), `userfromid/${userId}`);
        trace(TraceMethodPosition.Exit);
        return obs;
    }
    
    public isEmailDuplicate(email: string, userId: string): Observable<boolean> {
        var trace = this.baseService.classTrace("isEmailDuplicate");
        trace(TraceMethodPosition.Entry);                
        var obs = this.baseService.getObjectData<boolean>(this.baseService.getOptions(this.baseService.hubService, this.endpointKey, "There was an error valdiating the email address"), `userfromemail/${email}/isduplicated/${userId}`);
        trace(TraceMethodPosition.Exit);
        return obs;
    }

    public isUserNameDuplicate(userName: string, userId: string): Observable<boolean> {
        var trace = this.baseService.classTrace("isUserNameDuplicate");
        trace(TraceMethodPosition.Entry);                
        var obs = this.baseService.getObjectData<boolean>(this.baseService.getOptions(this.baseService.hubService, this.endpointKey, "There was an error valdiating the user name"), `userfromusername/${userName}/isduplicated/${userId}`);
        trace(TraceMethodPosition.Exit);
        return obs;
    }
    
    public toModel(vm: IUserProfileViewModel): IUserProfile {
        var up: IUserProfile = {
            name: vm.name,
            id: vm.id,
            savePassword: vm.password,
            confirmPassword: vm.confirmPassword,
            saveGivenName: vm.givenName,
            saveEmailAddress: vm.emailAddress,
            enabled: vm.enabled,
            claims: []
        };        
        return up;
    }

    public toViewModel(model: IUserProfile): IUserProfileViewModel {
        var emailClaim = _.find(model.claims, c => c.definition && c.definition.name == "email");
        var givenNameClaim = _.find(model.claims, c => c.definition && c.definition.name == "given_name");
        var vm: IUserProfileViewModel  = {
                id: model.id,
                name: model.name,
                givenName: (givenNameClaim && givenNameClaim.value) || "",
                emailAddress: (emailClaim && emailClaim.value) || "",
                password: "Dummy@000",
                confirmPassword: "Dummy@000",
                enabled: model.enabled,
                claims: [].concat(_.map(model.claims, c => this.userClaimToViewModel(c)  )),
                tooltipMessage: `<table>
                                <tr>
                                    <td>User Name:</td><td>${model.name}</td>
                                </tr>
                                <tr>
                                    <td>Full Name:</td><td>${(givenNameClaim && givenNameClaim.value) || ""}</td>
                                </tr>
                                <tr>
                                    <td>Email:</td><td>${(emailClaim && emailClaim.value) || ""}</td>
                                </tr>
                                <tr>                                        
                                    <td>Id:</td><td>${model.id}</td>
                                </tr>
                                </table>
                `  
        };            
    
        return vm;
    }
    
    public deleteUser(id: string): Observable<boolean> {
        var trace = this.baseService.classTrace("deleteUserProfile");
        trace(TraceMethodPosition.Entry);                
        var obs = this.baseService.deleteData(this.baseService.getOptions(this.baseService.hubService, this.endpointKey, "There was an error deleting the user"), `user/${id}`);        
        trace(TraceMethodPosition.Exit)
        return obs;
        
    }

    public deleteUserClaim(id: string): Observable<boolean> {
        var trace = this.baseService.classTrace("deleteUserClaim");
        trace(TraceMethodPosition.Entry);                
        var obs = this.baseService.deleteData(this.baseService.getOptions(this.baseService.hubService, this.endpointKey, "There was an error deleting the user claim"), `userclaim/${id}`);        
        trace(TraceMethodPosition.Exit)
        return obs;
        
    }
    
    public saveUserProfile(vm: IUserProfileViewModel): Observable<IUserProfileViewModel> {
        var trace = this.baseService.classTrace("saveUserProfile");
        trace(TraceMethodPosition.Entry);                
        var obs = this.baseService.postData<IUserProfile, IUserProfile>(this.toModel(vm), 
            this.baseService.getOptions(this.baseService.hubService, this.endpointKey, "There was an error saving the user profile"), 'userprofile')
                .map(m => this.toViewModel(m));        
        trace(TraceMethodPosition.Exit)
        return obs;
    }

    public saveUser(vm: IUserProfileViewModel): Observable<IUserProfileViewModel> {
        var trace = this.baseService.classTrace("saveUser");
        trace(TraceMethodPosition.Entry);                
        var obs = this.baseService.postData<IUserProfile, IUserProfile>(this.toModel(vm), 
            this.baseService.getOptions(this.baseService.hubService, this.endpointKey, "There was an error saving the user profile"), 'user')
                .map(m => this.toViewModel(m));        
        trace(TraceMethodPosition.Exit)
        return obs;
    }

    public saveUserClaim(vm: IUserClaimViewModel): Observable<IUserClaimViewModel> {
        var trace = this.baseService.classTrace("saveUserClaim");
        trace(TraceMethodPosition.Entry);   
        var obs = this.baseService.postData<IUserClaim, IUserClaim>(this.viewModelToUserClaim(vm), 
            this.baseService.getOptions(this.baseService.hubService, this.endpointKey, "There was an error saving the user claim"), 'userclaim')
                .map(m => this.userClaimToViewModel(m));        
        trace(TraceMethodPosition.Exit)
        return obs;
    }

    public getEmptyUserProfileViewModel(): IUserProfileViewModel {
        return <IUserProfileViewModel>{ id: "", name: "", emailAddress: "", givenName: "", password: "", confirmPassword: "", enabled: false, 
        tooltipMessage: "", claims: []};
    }


    public userClaimToViewModel(model: IUserClaim) : IUserClaimViewModel {
        return <IUserClaimViewModel>{ id: model.id || this.baseService.appSettings.EmptyGuid, definitionId: model.definition.id,  userId: model.userId,
            name: model.definition && model.definition.name, description: model.definition && model.definition.description, value: model.value }
    } 

    public viewModelToUserClaim(vm: IUserClaimViewModel): IUserClaim {
        return <IUserClaim>{ id: vm.id || this.baseService.appSettings.EmptyGuid, userId: vm.userId, 
            definitionId: vm.definitionId, definition: { id: vm.definitionId, name: vm.name, description: vm.description}, value: vm.value };

    }

}

export interface IUserProfileViewModel {
     name: string;
     id: string;
     emailAddress: string;
     givenName: string;
     password?: string;
     confirmPassword?: string;
     enabled: boolean;
     tooltipMessage: string;
     claims: IUserClaimViewModel[];
}

export interface IUserClaimViewModel {
    id: string;
    definitionId: string;
    name: string;
    description: string;
    value: string;
    userId: string;
}

export interface IUserProfile {
     name: string;
     id: string;
     savePassword: string;
     confirmPassword: string;
     saveGivenName: string;
     saveEmailAddress: string;  
     enabled: boolean;  
     claims: IUserClaim[];
}

export interface IUserClaim {
     userId: string;
     definition: IClaimDefinition;
     definitionId: string;
     id: string;         
     value?: string;
}

export interface IClaimDefinition {
     id: string;
     name: string;
     description?: string;
}

export interface IUsersFromServer extends ICollectionViewModel<IUserProfile> {

}

export interface IUsersToClientFilter extends ICollectionViewModel<IUserProfileViewModel> {
    statuses: INameValue<string>[];
}
