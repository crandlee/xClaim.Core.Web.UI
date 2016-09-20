import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { BaseService, INameValue } from '../shared/service/base.service';
import { HubService } from '../shared/hub/hub.service';
import { IServiceOptions, IDataService, ICollectionViewModel, IEntity, IEnumViewModel } from '../shared/service/base.service';
import * as _ from 'lodash';
import { IFilterDefinition } from '../shared/filtering/filter.service';
import { TraceMethodPosition } from '../shared/logging/logging.service';
import * as moment from 'moment';

@Injectable()
export class DefaultValuesService implements IDataService<IDefaultValueModel, IDefaultValueViewModel, IDefaultValuesToServerFilter, IDefaultValuesToClientFilter> {

    constructor(private baseService: BaseService) {
        
         this.baseService.classTrace = this.baseService.loggingService.getTraceFunction("DefaultValuesService");
    }

    private endpointKey: string = 'xClaim.Core.Web.Api.Claims';

    public get(skip?: number, take?: number, toServerFilter?: IDefaultValuesToServerFilter): Observable<IDefaultValuesToClientFilter> {
        var trace = this.baseService.classTrace("get");
        trace(TraceMethodPosition.Entry);
        
        if (!skip) skip = 0;
        if (!take) take = this.baseService.appSettings.DefaultPageSize;
        var namespaceId = toServerFilter && toServerFilter.namespaceId;

        var url = `namespaces/${namespaceId}/defaultvalues`;

        var obs = this.baseService.getObjectData<ICollectionViewModel<IDefaultValueModel>>(this.baseService.getOptions(this.baseService.hubService, this.endpointKey, "There was an error retrieving the default values"), url)
            .map(m =>  {
                var vm = _.map(m.rows, m => this.toViewModel(m));
                return { rows: vm }; 
            });
        trace(TraceMethodPosition.Exit);
        return obs;

    }

    private entityTypeToViewModel(entityType: number): string {
        if (entityType === 1) return "Plan";
        if (entityType === 2) return "Member";
        if (entityType === 3) return "Group";
        if (entityType === 4) return "Drug";
        if (entityType === 5) return "Pharmacy";
        if (entityType === 6) return "Chain";
        return "Unknown";
    }

    public toModel(vm: IDefaultValueViewModel): IDefaultValueModel {
        return {
            id: vm.id || this.baseService.appSettings.EmptyGuid,
            effectiveDate: moment(new Date(vm.effectiveDate)).utc().toDate(),
            terminationDate: vm.terminationDate ? moment(new Date(vm.terminationDate)).utc().toDate() : null,
            namespaceId: vm.namespaceId || this.baseService.appSettings.EmptyGuid,
            keyCompositeId: vm.keyCompositeId || this.baseService.appSettings.EmptyGuid,
            entityType: vm.entityType,
            value: vm.value
        };
    }

    public toViewModel(model: IDefaultValueModel): IDefaultValueViewModel {
        return {
            id: model.id,
            effectiveDate: moment.utc(model.effectiveDate).local().format('MM/DD/YYYY hh:mm:ss a'),
            terminationDate: model.terminationDate ? moment.utc(model.terminationDate).local().format('MM/DD/YYYY hh:mm:ss a') : null,
            namespaceId: model.namespaceId,
            keyCompositeId: model.keyCompositeId,
            entityType: model.entityType,
            entityTypeDescription: this.entityTypeToViewModel(model.entityType),
            value: model.value
        };
    }


    public isDefaultValueValid(valueType: number, pattern: string, value:string, allowNulls: boolean, precision: number, length: number): Observable<boolean> {
        var trace = this.baseService.classTrace("isDefaultValueValid");
        trace(TraceMethodPosition.Entry);       
        var obs = this.baseService.postData<IValidateNamespaceValueStruct, boolean>({ value: value, pattern: pattern, valueType: valueType, allowNulls: allowNulls, precision: precision, length: length },
            this.baseService.getOptions(this.baseService.hubService, this.endpointKey, "There was an error validating the default value"), `namespacevalues/validate`);
        trace(TraceMethodPosition.Exit)
        return obs;
    }

    public deleteDefaultValue(id: string): Observable<boolean> {
        var trace = this.baseService.classTrace("deleteDefaultValue");
        trace(TraceMethodPosition.Entry);                
        var obs = this.baseService.deleteData(this.baseService.getOptions(this.baseService.hubService, this.endpointKey, "There was an error deleting the default value"), `defaultvalues/${id}`);        
        trace(TraceMethodPosition.Exit)
        return obs;
        
    }

    public saveDefaultValue(vm: IDefaultValueViewModel): Observable<IDefaultValueViewModel> {
        var trace = this.baseService.classTrace("saveDefaultValue");
        trace(TraceMethodPosition.Entry);   
        var obs = this.baseService.postData<IDefaultValueModel, IDefaultValueModel>(this.toModel(vm), 
            this.baseService.getOptions(this.baseService.hubService, this.endpointKey, "There was an error saving the default value"), 'defaultvalues')
            .map(m => {
                return this.toViewModel(m);
            });        
        trace(TraceMethodPosition.Exit)
        return obs;
    }

    public getNamespaceEntityTypes(): Observable<IEnumViewModel[]> {
        var trace = this.baseService.classTrace("getNamespaceEntityTypes");
        trace(TraceMethodPosition.Entry);
        var obs = this.baseService.getObjectData<IEnumViewModel[]>(this.baseService.getOptions(this.baseService.hubService, this.endpointKey, "There was an error retrieving the entity types"), `namespaceentitytypes`);
        trace(TraceMethodPosition.Exit);
        return obs;
    }


}

export interface IValidateNamespaceValueStruct {
    value: string;
    pattern: string;
    valueType: number;
    allowNulls: boolean;
    precision: number;
    length: number;
}

export interface IDefaultValueModel extends IEntity {
    effectiveDate: Date;
    terminationDate: Date;
    namespaceId: string;
    keyCompositeId: string;
    entityType: number;
    value: string;
}

export interface IDefaultValueViewModel extends IEntity {
    effectiveDate: string;
    terminationDate: string;
    namespaceId: string;
    keyCompositeId: string;
    entityType: number;
    entityTypeDescription: string;
    value: string;
}

export interface IDefaultValuesToServerFilter {
    namespaceId: string;
}

export interface IDefaultValuesToClientFilter {
    rows: IDefaultValueViewModel[]
}