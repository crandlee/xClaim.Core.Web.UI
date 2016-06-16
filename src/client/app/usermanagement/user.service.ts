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


    public defaultStatuses: INameValue<string>[] = [{ Name: "All", Value:"All"}, {Name: "Enabled", Value: "Enabled"}, {Name: "Disabled", Value: "Disabled"}]

    public get(skip?: number, take?: number, toServerFilter?: IUsersToServerFilter): Observable<IUsersToClientFilter> {

        var trace = this.baseService.classTrace("getUsers");
        trace(TraceMethodPosition.Entry);
        
        if (!skip) skip = 0;
        if (!take) take = this.baseService.appSettings.DefaultPageSize;

        var url = `users?skip=${skip}&take=${take}`;
        if (toServerFilter && toServerFilter.UserName) url +=`&userName=${toServerFilter.UserName}`;
        if (toServerFilter && toServerFilter.FullName) url +=`&fullName=${toServerFilter.FullName}`;
        if (toServerFilter && toServerFilter.Email) url +=`&email=${toServerFilter.Email}`;
        if (toServerFilter && toServerFilter.Status && toServerFilter.Status !== "All") url +=`&enabled=${toServerFilter.Status === "Enabled"? true : false}`;

        var obs = this.baseService.getObjectData<IUsersFromServer>(this.baseService.getOptions(this.baseService.hubService, this.endpointKey, "There was an error retrieving the users"), url)
            .map<IUsersToClientFilter>(data => { 
                            return { RowCount: data.RowCount, 
                                    Rows: data.Rows.map(r => this.toViewModel(r)), 
                                    Statuses: this.defaultStatuses };})

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
            Name: vm.Name,
            Id: vm.Id,
            SavePassword: vm.Password,
            ConfirmPassword: vm.ConfirmPassword,
            SaveGivenName: vm.GivenName,
            SaveEmailAddress: vm.EmailAddress,
            Enabled: vm.Enabled,
            Claims: []
        };        
        return up;
    }

    public toViewModel(model: IUserProfile): IUserProfileViewModel {
        var emailClaim = _.find(model.Claims, c => c.Definition && c.Definition.Name == "email");
        var givenNameClaim = _.find(model.Claims, c => c.Definition && c.Definition.Name == "given_name");
        var vm: IUserProfileViewModel  = {
                Id: model.Id,
                Name: model.Name,
                GivenName: (givenNameClaim && givenNameClaim.Value) || "",
                EmailAddress: (emailClaim && emailClaim.Value) || "",
                Password: "Dummy@000",
                ConfirmPassword: "Dummy@000",
                Enabled: model.Enabled,
                Claims: [].concat(_.map(model.Claims, c => this.userClaimToViewModel(c)  )),
                TooltipMessage: `<table>
                                <tr>
                                    <td>User Name:</td><td style="padding-left: 5px">${model.Name}</td>
                                </tr>
                                <tr>
                                    <td>Full Name:</td><td style="padding-left: 5px">${(givenNameClaim && givenNameClaim.Value) || ""}</td>
                                </tr>
                                <tr>
                                    <td>Email:</td><td style="padding-left: 5px">${(emailClaim && emailClaim.Value) || ""}</td>
                                </tr>
                                <tr>                                        
                                    <td>Id:</td><td style="padding-left: 5px">${model.Id}</td>
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
            this.baseService.getOptions(this.baseService.hubService, this.endpointKey, "There was an error saving the user profile"), 'user').map(m => this.toViewModel(m));        
        trace(TraceMethodPosition.Exit)
        return obs;
    }

    public saveUserClaim(vm: IUserClaimViewModel): Observable<IUserClaimViewModel> {
        var trace = this.baseService.classTrace("saveUserClaim");
        trace(TraceMethodPosition.Entry);   
        var obs = this.baseService.postData<IUserClaim, IUserClaim>(this.viewModelToUserClaim(vm), 
            this.baseService.getOptions(this.baseService.hubService, this.endpointKey, "There was an error saving the user claim"), 'userclaim').map(m => this.userClaimToViewModel(m));        
        trace(TraceMethodPosition.Exit)
        return obs;
    }

    public getEmptyUserProfileViewModel(): IUserProfileViewModel {
        return <IUserProfileViewModel>{ Id: "", Name: "", EmailAddress: "", GivenName: "", Password: "", ConfirmPassword: "", Enabled: false, TooltipMessage: "", Claims: []};
    }


    public userClaimToViewModel(model: IUserClaim) : IUserClaimViewModel {
        return <IUserClaimViewModel>{ Id: model.Id || this.baseService.appSettings.EmptyGuid, DefinitionId: model.Definition.Id,  UserId: model.UserId,
            Name: model.Definition && model.Definition.Name, Description: model.Definition && model.Definition.Description, Value: model.Value }
    } 

    public viewModelToUserClaim(vm: IUserClaimViewModel): IUserClaim {
        return <IUserClaim>{ Id: vm.Id || this.baseService.appSettings.EmptyGuid, UserId: vm.UserId, DefinitionId: vm.DefinitionId, Definition: { Id: vm.DefinitionId, Name: vm.Name, Description: vm.Description}, Value: vm.Value };

    }

}

export interface IUserProfileViewModel {
     Name: string;
     Id: string;
     EmailAddress: string;
     GivenName: string;
     Password?: string;
     ConfirmPassword?: string;
     Enabled: boolean;
     TooltipMessage: string;
     Claims: IUserClaimViewModel[];
}

export interface IUserClaimViewModel {
    Id: string;
    DefinitionId: string;
    Name: string;
    Description: string;
    Value: string;
    UserId: string;
}

export interface IUserProfile {
     Name: string;
     Id: string;
     SavePassword: string;
     ConfirmPassword: string;
     SaveGivenName: string;
     SaveEmailAddress: string;  
     Enabled: boolean;  
     Claims: IUserClaim[];
}

export interface IUserClaim {
     UserId: string;
     Definition: IClaimDefinition;
     DefinitionId: string;
     Id: string;         
     Value?: string;
}

export interface IClaimDefinition {
     Id: string;
     Name: string;
     Description?: string;
}

export interface IUsersFromServer extends ICollectionViewModel<IUserProfile> {

}

export interface IUsersToClientFilter extends ICollectionViewModel<IUserProfileViewModel> {
    Statuses: INameValue<string>[];

}

