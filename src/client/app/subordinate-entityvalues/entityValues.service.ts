import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Injectable } from '@angular/core';
import { BaseService, INameValue } from '../shared/service/base.service';
import { HubService } from '../shared/hub/hub.service';
import { IServiceOptions, IDataService, ICollectionViewModel, IEntity, IEnumViewModel } from '../shared/service/base.service';
import * as _ from 'lodash';
import { IFilterDefinition } from '../shared/filtering/filter.service';
import { TraceMethodPosition } from '../shared/logging/logging.service';
import * as moment from 'moment';

@Injectable()
export class EntityValuesService implements IDataService<IEntityValueModel, IEntityValueViewModel, IEntityValuesToServerFilter, IEntityValuesToClientFilter> {

    constructor(private baseService: BaseService) {
         this.baseService.classTrace = this.baseService.loggingService.getTraceFunction("EntityValuesService");
    }

    private endpointKey: string = 'xClaim.Core.Web.Api.Claims';

    private testEntityModels: IEntityValueModel[] = [];

    public get(skip?: number, take?: number, toServerFilter?: IEntityValuesToServerFilter): Observable<IEntityValuesToClientFilter> {
        var trace = this.baseService.classTrace("get");
        trace(TraceMethodPosition.Entry);

        if (!skip) skip = 0;
        if (!take) take = this.baseService.appSettings.DefaultPageSize;
        var entityId = toServerFilter && toServerFilter.entityId;
        var entityType = toServerFilter && toServerFilter.entityType;

        var url = `entities/${entityType}/${entityId}/entityvalues`;
        // var obs: Observable<ICollectionViewModel<IEntityValueViewModel>> = Observable.create((observer: Observer<ICollectionViewModel<IEntityValueModel>>) => {
        //     observer.next({ rows: [], rowCount: 0})
        // }).map((m: ICollectionViewModel<IEntityValueModel>) =>  {

        var obs = this.baseService.getObjectData<ICollectionViewModel<IEntityValueModel>>(this.baseService.getOptions(this.baseService.hubService, this.endpointKey, "There was an error retrieving the entity values"), url)
        .map(m => {
            var vm = _.map(m.rows, m => this.toViewModel(m));
            return { rows: vm };
        });
        trace(TraceMethodPosition.Exit);
        return obs;

    }


    public isEntityIdValid(entityId: string, entityType: EntityType): Observable<boolean> {
        var trace = this.baseService.classTrace("isEntityIdValid");
        trace(TraceMethodPosition.Entry);
        var obs = this.baseService.getObjectData<boolean>(this.baseService.getOptions(this.baseService.hubService, this.endpointKey, "There was an error valdiating the name"), `entityidvalid/${entityId}/${entityType}`);
        trace(TraceMethodPosition.Exit);
        return obs;
    }


    public getSingle(id: string, parentId: string, parentType: EntityType): Observable<IEntityValueViewModel> {
        var trace = this.baseService.classTrace("getSingle");
        trace(TraceMethodPosition.Entry);

        var url = `entityvalues/${id}/${parentId}/${parentType}`;

        // var obs: Observable<IEntityValueViewModel> = Observable.create((observer: Observer<IEntityValueModel>) => {
        //     observer.next(_.find(this.testEntityModels, m => m.id === id));
        // }).map((m: IEntityValueModel) =>  {
        var obs = this.baseService.getObjectData<IEntityValueModel>(this.baseService.getOptions(this.baseService.hubService, this.endpointKey, "There was an error retrieving the entity values"), url)
        .map(m => {
            return this.toViewModel(m);
        });

        trace(TraceMethodPosition.Exit);
        return obs;

    }

    public getEmptyViewModel(): IEntityValueViewModel {
        return {
            id: "", effectiveDate: "1/1/2001", terminationDate: "", namespaceId: "", value: "", planId: "", productServiceId: "", serviceProviderId: "", memberId: "", namespaceDescription: "",
            isDefault: false, index: 0, priority: 1, parentId: "", parentEntityType: EntityType.Unknown, secondary: ""
        };
    }

    public toModel(vm: IEntityValueViewModel): IEntityValueModel {
        return {
            id: vm.id || this.baseService.appSettings.EmptyGuid,
            effectiveDate: moment(new Date(vm.effectiveDate)).utc().toDate(),
            terminationDate: vm.terminationDate ? moment(new Date(vm.terminationDate)).utc().toDate() : null,
            namespaceId: vm.namespaceId || this.baseService.appSettings.EmptyGuid,
            value: vm.value,
            planId: vm.planId,
            productServiceId: vm.productServiceId,
            serviceProviderId: vm.serviceProviderId,
            memberId: vm.memberId,
            namespaceDescription: vm.namespaceDescription,
            isDefault: vm.isDefault,
            index: vm.index,
            priority: vm.priority,
            parentId: vm.parentId || this.baseService.appSettings.EmptyGuid,
            parentEntityType: vm.parentEntityType
        };
    }

    private getSecondaryText(model: IEntityValueModel): string {
        var secondaryString = "";
        if (model && model.planId && model.parentEntityType !== EntityType.Plan) secondaryString += (secondaryString ? "\r\n" : "") + `Plan: ${model.planId} `;
        if (model && model.memberId && model.parentEntityType !== EntityType.Member) secondaryString += (secondaryString ? "\r\n" : "") + `Member: ${model.memberId} `;
        if (model && model.productServiceId && model.parentEntityType !== EntityType.ProductService) secondaryString += (secondaryString ? "\r\n" : "") + `NDC: ${model.productServiceId} `;
        if (model && model.serviceProviderId && model.parentEntityType !== EntityType.ServiceProvider) secondaryString += (secondaryString ? "\r\n" : "") + `Pharmacy: ${model.serviceProviderId} `;
        return secondaryString;
    }

    public toViewModel(model: IEntityValueModel): IEntityValueViewModel {
        return {
            id: model.id,
            effectiveDate: moment.utc(model.effectiveDate).local().format('MM/DD/YYYY hh:mm:ss a'),
            terminationDate: model.terminationDate ? moment.utc(model.terminationDate).local().format('MM/DD/YYYY hh:mm:ss a') : null,
            namespaceId: model.namespaceId,
            planId: model.planId,
            serviceProviderId: model.serviceProviderId,
            productServiceId: model.productServiceId,
            memberId: model.memberId,
            namespaceDescription: model.namespaceDescription,
            index: model.index,
            priority: model.priority,
            isDefault: model.isDefault,
            value: model.value,
            parentId: model.parentId,
            secondary: this.getSecondaryText(model),
            parentEntityType: model.parentEntityType
        };
    }


    public getNamespacesForDropdown(): Observable<ICollectionViewModel<INamespaceOption>> {
        var trace = this.baseService.classTrace("getNamespaceValueTypes");
        trace(TraceMethodPosition.Entry);
        var obs = this.baseService.getObjectData<ICollectionViewModel<INamespaceOption>>(this.baseService.getOptions(this.baseService.hubService,
            this.endpointKey, "There was an error retrieving the value types"), `namespaces`);
        trace(TraceMethodPosition.Exit);
        return obs;
    }

    public isEntityValueValid(namespaceId: string, value:string): Observable<boolean> {
        var trace = this.baseService.classTrace("isEntityValueValid");
        trace(TraceMethodPosition.Entry);
        // var obs: Observable<boolean> = Observable.create((observer: Observer<boolean>) => {
        //    observer.next(true);
        //});
        var obs = this.baseService.postData<IValidateEntityValueStruct, boolean>({ value: value, namespaceId: namespaceId }, this.baseService.getOptions(this.baseService.hubService, this.endpointKey, "There was an error validating the entity value"), `entityvalues/validate`);
        trace(TraceMethodPosition.Exit)
        return obs;
    }

    public deleteEntityValue(id: string): Observable<boolean> {
        var trace = this.baseService.classTrace("deleteEntityValue");
        trace(TraceMethodPosition.Entry);
        var obs = this.baseService.deleteData(this.baseService.getOptions(this.baseService.hubService, this.endpointKey, "There was an error deleting the entity value"), `entityvalues/${id}`);
        // var obs: Observable<boolean> = Observable.create((observer: Observer<boolean>) => {
        //     _.remove(this.testEntityModels, m => m.id == id);
        //     observer.next(true);
        // });
        trace(TraceMethodPosition.Exit)
        return obs;

    }

    public saveEntityValue(vm: IEntityValueViewModel): Observable<IEntityValueViewModel> {
        var trace = this.baseService.classTrace("saveEntityValue");
        trace(TraceMethodPosition.Entry);
        //vm.id = this.guid();
        // var obs: Observable<IEntityValueViewModel> = Observable.create((observer: Observer<IEntityValueModel>) => {
        //     var m = this.toModel(vm);
        //     this.testEntityModels.push(m);
        //     observer.next(m);
        // }).map((m: IEntityValueModel) => {
        var obs = this.baseService.postData<IEntityValueModel, IEntityValueModel>(this.toModel(vm),
        this.baseService.getOptions(this.baseService.hubService, this.endpointKey, "There was an error saving the entity value"), 'entityvalues')
        .map(m => {
            return this.toViewModel(m);
        });
        trace(TraceMethodPosition.Exit)
        return obs;
    }


    // public guid() {
    //     function s4() {
    //         return Math.floor((1 + Math.random()) * 0x10000)
    //         .toString(16)
    //         .substring(1);
    //     }
    //     return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    //         s4() + '-' + s4() + s4() + s4();
    // }
}

export interface INamespaceOption {
    id: string;
    name: string;
    description: string;
}
export interface IValidateEntityValueStruct {
    value: string;
    namespaceId: string;
}

export interface IEntityValueModel extends IEntity {
    parentId: string;
    parentEntityType: EntityType;
    planId: string;
    serviceProviderId: string;
    productServiceId: string;
    memberId: string;
    effectiveDate: Date;
    terminationDate: Date;
    namespaceId: string;
    namespaceDescription: string;
    isDefault: boolean;
    index: number;
    priority: number;
    value: string;
}

export interface IEntityValueViewModel extends IEntity {
    parentId: string;
    parentEntityType: EntityType;
    planId: string;
    serviceProviderId: string;
    productServiceId: string;
    memberId: string;
    effectiveDate: string;
    terminationDate: string;
    namespaceId: string;
    namespaceDescription: string;
    isDefault: boolean;
    index: number;
    priority: number;
    value: string;
    secondary: string;
}

export interface IEntityValuesToServerFilter {
    entityId: string;
    entityType: EntityType;
}

export interface IEntityValuesToClientFilter {
    rows: IEntityValueViewModel[]
}

export enum EntityType {
    Unknown = 0,
    Plan = 1,
    Member = 2,
    ProductService = 4,
    ServiceProvider = 5,
    Chain = 6
}