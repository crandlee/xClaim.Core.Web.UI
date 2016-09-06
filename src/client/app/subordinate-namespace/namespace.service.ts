import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { BaseService, INameValue } from '../shared/service/base.service';
import { HubService } from '../shared/hub/hub.service';
import { IServiceOptions, IDataService, ICollectionViewModel, IEnumViewModel } from '../shared/service/base.service';
import * as _ from 'lodash';
import { INamespacesToServerFilter } from './namespace.filter.service';
import { IFilterDefinition } from '../shared/filtering/filter.service';
import { TraceMethodPosition } from '../shared/logging/logging.service'

@Injectable()
export class NamespaceService implements IDataService<INamespace, INamespaceViewModel, INamespacesToServerFilter, INamespacesToClientFilter> {
    
    constructor(private baseService: BaseService) {
         baseService.initializeTrace("NamespaceService");               
    }

    public endpointKey: string = 'xClaim.Core.Web.Api.Claims';


    public get(skip?: number, take?: number, toServerFilter?: INamespacesToServerFilter): Observable<INamespacesToClientFilter> {

        var trace = this.baseService.classTrace("get");
        trace(TraceMethodPosition.Entry);
        
        if (!skip) skip = 0;
        if (!take) take = this.baseService.appSettings.DefaultPageSize;

        var url = `namespaces?skip=${skip}&take=${take}`;
        if (toServerFilter && toServerFilter.name) url +=`&name=${toServerFilter.name}`;
        if (toServerFilter && toServerFilter.description) url +=`&description=${toServerFilter.description}`;
        var obs = this.baseService.getObjectData<INamespacesFromServer>(this.baseService.getOptions(this.baseService.hubService, this.endpointKey, "There was an error retrieving the namespaces"), url)
            .map<INamespacesToClientFilter>(data => { 
                            return { rowCount: data.rowCount, 
                                     rows: data.rows.map(r => this.toViewModel(r))}});

        trace(TraceMethodPosition.Exit);
        return obs;
    }

    public isNameDuplicate(name: string, id: string): Observable<boolean> {
        var trace = this.baseService.classTrace("isNameDuplicate");
        trace(TraceMethodPosition.Entry);                
        var obs = this.baseService.getObjectData<boolean>(this.baseService.getOptions(this.baseService.hubService, this.endpointKey, "There was an error valdiating the name"), `namespacefromname/${name}/isduplicated/${id}`);
        trace(TraceMethodPosition.Exit);
        return obs;
    }

    public getNew(): Observable<INamespace> {          
        var trace = this.baseService.classTrace("getNewNamespace");
        trace(TraceMethodPosition.Entry);
        var obs = this.baseService.getObjectData<INamespace>(this.baseService.getOptions(this.baseService.hubService, this.endpointKey, "There was an error starting a new namespace"), `namespaces/new`);
        trace(TraceMethodPosition.Exit);
        return obs;
    }

    
    public getNamespaceValueTypes(): Observable<IEnumViewModel[]> {
        var trace = this.baseService.classTrace("getNamespaceValueTypes");
        trace(TraceMethodPosition.Entry);
        var obs = this.baseService.getObjectData<IEnumViewModel[]>(this.baseService.getOptions(this.baseService.hubService, this.endpointKey, "There was an error retrieving the value types"), `namespacevaluetypes`);
        trace(TraceMethodPosition.Exit);
        return obs;
    }

    public getExisting(id: string): Observable<INamespace> {  
        var trace = this.baseService.classTrace("getNamespace");
        trace(TraceMethodPosition.Entry);
        var obs = this.baseService.getObjectData<INamespace>(this.baseService.getOptions(this.baseService.hubService, this.endpointKey, "There was an error retrieving the namespace"), `namespaces/${id}`);
        trace(TraceMethodPosition.Exit);
        return obs;
    }

    public save(vm: INamespaceViewModel): Observable<INamespaceViewModel> {
        var trace = this.baseService.classTrace("saveUser");
        trace(TraceMethodPosition.Entry);                
        var obs = this.baseService.postData<INamespace, INamespace>(this.toModel(vm), 
            this.baseService.getOptions(this.baseService.hubService, this.endpointKey, "There was an error saving the namespace"), 'namespaces')
                .map(m => this.toViewModel(m));        
        trace(TraceMethodPosition.Exit)
        return obs;
    }

    public delete(id: string): Observable<boolean> {
        var trace = this.baseService.classTrace("deleteNamespace");
        trace(TraceMethodPosition.Entry);                
        var obs = this.baseService.deleteData(this.baseService.getOptions(this.baseService.hubService, this.endpointKey, "There was an error deleting the namespace"), `namespaces/${id}`);        
        trace(TraceMethodPosition.Exit)
        return obs;
        
    }

    public toModel(viewModel: INamespaceViewModel): INamespace {
        var model: INamespace  = {
            id: viewModel.id,
            name: viewModel.name,
            description: viewModel.description,
            type: viewModel.type,
            validationPattern: viewModel.validationPattern,
            length: viewModel.length,
            precision: viewModel.precision,
            allowNull: viewModel.allowNull,
        }
        return model;
    }
    
    public toViewModel(model: INamespace): INamespaceViewModel {
        var vm: INamespaceViewModel  = {
            id: model.id,
            name: model.name,
            description: model.description,
            type: model.type,
            validationPattern: model.validationPattern,
            length: model.length,
            precision: model.precision,
            allowNull: model.allowNull,
            tooltipMessage: `<table>
                            <tr>
                                <td>Type:</td><td style="padding-left: 5px">${this.namespaceValueTypeToText(model.type)}</td>
                            </tr>   
                            <tr>
                                <td>Length:</td><td style="padding-left: 5px">${model.length}</td>
                            </tr>   
                            <tr>
                                <td>Precision:</td><td style="padding-left: 5px">${model.precision}</td>
                            </tr>   
                            <tr>                                        
                                <td>Id:</td><td style="padding-left: 5px">${model.id}</td>
                            </tr>
                            </table>
            `  
        };            
    
        return vm;
    }
    
    private namespaceValueTypeToText(type: number): string {
        if (type === 1) return "String";
        if (type === 2) return "Boolean";
        if (type === 3) return "Integer";
        if (type === 4) return "Decimal";
        if (type === 5) return "Date";
        if (type === 6) return "JSON";
        return "Unknown";
    } 

    public getEmptyViewModel(): INamespaceViewModel {
        return <INamespaceViewModel>{ id: "", name: "", description: "", type: 0, validationPattern: "", length: 0, precision: 0,
            allowNull: false, tooltipMessage: ""};
    }


}


export interface INamespaceViewModel {
    id: string;
    name: string;
    description: string;
    type: number;
    validationPattern: string;
    length: number;
    precision: number;
    allowNull: boolean;
    tooltipMessage: string;
}

export interface INamespace {
    id: string;
    name: string;
    description: string;
    type: number;
    validationPattern: string;
    length: number;
    precision: number;
    allowNull: boolean;
}


export interface INamespacesFromServer extends ICollectionViewModel<INamespace> {

}

export interface INamespacesToClientFilter extends ICollectionViewModel<INamespaceViewModel> {
    
}

