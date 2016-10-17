import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { BaseService, INameValue, IDropdownOptionViewModel } from '../shared/service/base.service';
import { HubService } from '../shared/hub/hub.service';
import { IServiceOptions, IDataService, ICollectionViewModel, IEnumViewModel } from '../shared/service/base.service';
import * as _ from 'lodash';
import { IServiceProvidersToServerFilter } from './serviceprovider.filter.service';
import { IFilterDefinition } from '../shared/filtering/filter.service';
import { TraceMethodPosition } from '../shared/logging/logging.service'
import * as moment from 'moment';
import { IAddress, IPaymentEntity, IPaymentEntityViewModel } from '../shared/common/interfaces';

@Injectable()
export class ServiceProviderService implements IDataService<IServiceProvider, IServiceProviderViewModel, IServiceProvidersToServerFilter, IServiceProvidersToClientFilter> {
    
    constructor(private baseService: BaseService) {
         baseService.initializeTrace("ServiceProviderService");               
    }

    public endpointKey: string = 'xClaim.Core.Web.Api.Claims';


    public get(skip?: number, take?: number, toServerFilter?: IServiceProvidersToServerFilter): Observable<IServiceProvidersToClientFilter> {

        var trace = this.baseService.classTrace("get");
        trace(TraceMethodPosition.Entry);
        
        if (!skip) skip = 0;
        if (!take) take = this.baseService.appSettings.DefaultPageSize;

        var url = `serviceproviders?skip=${skip}&take=${take}`;
        if (toServerFilter && toServerFilter.npi) url +=`&npi=${toServerFilter.npi}`;
        if (toServerFilter && toServerFilter.name) url +=`&name=${toServerFilter.name}`;
        if (toServerFilter && toServerFilter.number) url +=`&number=${toServerFilter.number}`;
        if (toServerFilter && toServerFilter.pharmacyType) url +=`&pharmacyType=${toServerFilter.pharmacyType}`;
        var obs = this.baseService.getObjectData<IServiceProvidersFromServer>(this.baseService.getOptions(this.baseService.hubService, 
            this.endpointKey, "There was an error retrieving the data"), url)
            .map<IServiceProvidersToClientFilter>(data => { 
                            return { rowCount: data.rowCount, 
                                     rows: data.rows.map(r => this.toViewModel(r))}});

        trace(TraceMethodPosition.Exit);
        return obs;
    }


    public getPharmacyTypes(): Observable<IEnumViewModel[]> {
        var trace = this.baseService.classTrace("getPharmacyTypes");
        trace(TraceMethodPosition.Entry);
        var obs = this.baseService.getObjectData<IEnumViewModel[]>(this.baseService
            .getOptions(this.baseService.hubService, this.endpointKey, "There was an error retrieving the pharmacy types"), `pharmacytypes`);
        trace(TraceMethodPosition.Exit);
        return obs;
    }

    public getDispenserTypes(): Observable<IEnumViewModel[]> {
        var trace = this.baseService.classTrace("getDispenserTypes");
        trace(TraceMethodPosition.Entry);
        var obs = this.baseService.getObjectData<IEnumViewModel[]>(this.baseService
            .getOptions(this.baseService.hubService, this.endpointKey, "There was an error retrieving the dispenser types"), `dispensertypes`);
        trace(TraceMethodPosition.Exit);
        return obs;
    }


    public getDispenserClasses(): Observable<IEnumViewModel[]> {
        var trace = this.baseService.classTrace("getDispenserClasses");
        trace(TraceMethodPosition.Entry);
        var obs = this.baseService.getObjectData<IEnumViewModel[]>(this.baseService
            .getOptions(this.baseService.hubService, this.endpointKey, "There was an error retrieving the dispenser classes"), `dispenserclasses`);
        trace(TraceMethodPosition.Exit);
        return obs;
    }


    public isIdentDuplicate(id: string, npi: string, effectiveDate: string): Observable<boolean> {
        var trace = this.baseService.classTrace("isIdentDuplicate");
        trace(TraceMethodPosition.Entry);
        var fromIdents = { id: id, npi: npi, effectiveDate: moment(new Date(effectiveDate)).utc().toDate()};    
        var obs = this.baseService.postData<IServiceProviderFromIdentsStruct, boolean>(
            fromIdents
            , this.baseService.getOptions(this.baseService.hubService, 
                this.endpointKey, "There was an error valdiating the identifiers"), `serviceproviderfromidents`);
        trace(TraceMethodPosition.Exit);
        return obs;
    }

    public getNew(): Observable<IServiceProvider> {          
        var trace = this.baseService.classTrace("getNew");
        trace(TraceMethodPosition.Entry);
        var obs = this.baseService.getObjectData<IServiceProvider>(this.baseService
            .getOptions(this.baseService.hubService, this.endpointKey, "There was an error starting a new item"), `serviceproviders/new`)
        trace(TraceMethodPosition.Exit);
        return obs;
    }


    public getExistingById(npi: string): Observable<IServiceProvider> {  
        var trace = this.baseService.classTrace("getExistingById");
        trace(TraceMethodPosition.Entry);
        var opt = this.baseService
            .getOptions(this.baseService.hubService, this.endpointKey, "There was an error retrieving the item");
        opt.propogateException = true;
        var obs = this.baseService.getObjectData<IServiceProvider>(opt, `serviceprovidersbyid/${npi}`);
        trace(TraceMethodPosition.Exit);
        return obs;
    }
    
    public getExisting(id: string): Observable<IServiceProvider> {  
        var trace = this.baseService.classTrace("getExisting");
        trace(TraceMethodPosition.Entry);
        var obs = this.baseService.getObjectData<IServiceProvider>(this.baseService
            .getOptions(this.baseService.hubService, this.endpointKey, "There was an error retrieving the item"), `serviceproviders/${id}`);
        trace(TraceMethodPosition.Exit);
        return obs;
    }

    public save(vm: IServiceProviderViewModel): Observable<IServiceProviderViewModel> {
        var trace = this.baseService.classTrace("save");
        trace(TraceMethodPosition.Entry);
        var m = this.toModel(vm);
        var obs = this.baseService.postData<IServiceProvider, IServiceProvider>(m, 
            this.baseService.getOptions(this.baseService.hubService, this.endpointKey, "There was an error saving the item"), 'serviceproviders')
                .map(m => this.toViewModel(m));        
        trace(TraceMethodPosition.Exit)
        return obs;
    }

    public delete(id: string): Observable<boolean> {
        var trace = this.baseService.classTrace("delete");
        trace(TraceMethodPosition.Entry);                
        var obs = this.baseService.deleteData(this.baseService
            .getOptions(this.baseService.hubService, this.endpointKey, "There was an error deleting the item"), `serviceproviders/${id}`);        
        trace(TraceMethodPosition.Exit)
        return obs;
        
    }

    public toModel(viewModel: IServiceProviderViewModel): IServiceProvider {
        var model: IServiceProvider  = {
            id: viewModel.id,
            ncpdp: viewModel.ncpdp,
            npi: viewModel.npi,
            name: viewModel.name,
            storeNumber: viewModel.storeNumber,
            type: viewModel.type,
            physicalAddressId: viewModel.physicalAddressId || this.baseService.appSettings.EmptyGuid,
            physicalAddress: {
                id: ((viewModel.physicalAddress && viewModel.physicalAddress.id) || this.baseService.appSettings.EmptyGuid),
                address1: (viewModel.physicalAddress && viewModel.physicalAddress.address1),
                address2: (viewModel.physicalAddress && viewModel.physicalAddress.address2),
                address3: (viewModel.physicalAddress && viewModel.physicalAddress.address3),
                city: (viewModel.physicalAddress && viewModel.physicalAddress.city),
                state: (viewModel.physicalAddress && viewModel.physicalAddress.state),
                zipCode: (viewModel.physicalAddress && viewModel.physicalAddress.zipCode)
            },
            mailingAddressId: viewModel.mailingAddressId || this.baseService.appSettings.EmptyGuid,
            mailingAddress: {
                id: ((viewModel.mailingAddress && viewModel.mailingAddress.id) || this.baseService.appSettings.EmptyGuid),
                address1: (viewModel.mailingAddress && viewModel.mailingAddress.address1),
                address2: (viewModel.mailingAddress && viewModel.mailingAddress.address2),
                address3: (viewModel.mailingAddress && viewModel.mailingAddress.address3),
                city: (viewModel.mailingAddress && viewModel.mailingAddress.city),
                state: (viewModel.mailingAddress && viewModel.mailingAddress.state),
                zipCode: (viewModel.mailingAddress && viewModel.mailingAddress.zipCode)
            },
            paymentEntityId: viewModel.paymentEntityId || this.baseService.appSettings.EmptyGuid,
            paymentEntity: {
                id: (viewModel.paymentEntity && viewModel.paymentEntity.id) || this.baseService.appSettings.EmptyGuid,
                ein: (viewModel.paymentEntity && viewModel.paymentEntity.ein),
                remittanceAddressId: (viewModel.paymentEntity && viewModel.paymentEntity.remittanceAddressId)  || this.baseService.appSettings.EmptyGuid,
                remittanceAddress: {
                    id: ((viewModel.paymentEntity && viewModel.paymentEntity.remittanceAddress && viewModel.paymentEntity.remittanceAddress.id) || this.baseService.appSettings.EmptyGuid),
                    address1: (viewModel.paymentEntity && viewModel.paymentEntity.remittanceAddress && viewModel.paymentEntity.remittanceAddress.address1),
                    address2: (viewModel.paymentEntity && viewModel.paymentEntity.remittanceAddress && viewModel.paymentEntity.remittanceAddress.address2),
                    address3: (viewModel.paymentEntity && viewModel.paymentEntity.remittanceAddress && viewModel.paymentEntity.remittanceAddress.address3),
                    city: (viewModel.paymentEntity && viewModel.paymentEntity.remittanceAddress && viewModel.paymentEntity.remittanceAddress.city),
                    state: (viewModel.paymentEntity && viewModel.paymentEntity.remittanceAddress && viewModel.paymentEntity.remittanceAddress.state),
                    zipCode: (viewModel.paymentEntity && viewModel.paymentEntity.remittanceAddress && viewModel.paymentEntity.remittanceAddress.zipCode)
                }                                
            },
            telephone: viewModel.telephone,
            eMailAddress: viewModel.eMailAddress,
            fax: viewModel.fax,
            dispenserClass: viewModel.dispenserClass,
            dispenserType: viewModel.dispenserType,
            typeName: viewModel.typeName,
            effectiveDate: moment(new Date(viewModel.effectiveDate)).utc().toDate(),
            terminationDate: viewModel.terminationDate ? moment(new Date(viewModel.terminationDate)).utc().toDate() : null
        }
        return model;
    }
    
    public toViewModel(model: IServiceProvider): IServiceProviderViewModel {
        var vm: IServiceProviderViewModel  = {
            id: model.id,
            ncpdp: model.ncpdp,
            npi: model.npi,
            name: model.name,
            storeNumber: model.storeNumber,
            type: model.type,
            physicalAddressId: model.physicalAddressId || this.baseService.appSettings.EmptyGuid,
            physicalAddress: {
                id: (model.physicalAddress && model.physicalAddress.id),
                address1: (model.physicalAddress && model.physicalAddress.address1),
                address2: (model.physicalAddress && model.physicalAddress.address2),
                address3: (model.physicalAddress && model.physicalAddress.address3),
                city: (model.physicalAddress && model.physicalAddress.city),
                state: (model.physicalAddress && model.physicalAddress.state),
                zipCode: (model.physicalAddress && model.physicalAddress.zipCode)
            },
            mailingAddressId: model.mailingAddressId || this.baseService.appSettings.EmptyGuid,
            mailingAddress: {
                id: (model.mailingAddress && model.mailingAddress.id),
                address1: (model.mailingAddress && model.mailingAddress.address1),
                address2: (model.mailingAddress && model.mailingAddress.address2),
                address3: (model.mailingAddress && model.mailingAddress.address3),
                city: (model.mailingAddress && model.mailingAddress.city),
                state: (model.mailingAddress && model.mailingAddress.state),
                zipCode: (model.mailingAddress && model.mailingAddress.zipCode)
            },
            paymentEntityId: model.paymentEntityId || this.baseService.appSettings.EmptyGuid,
            paymentEntity: {
                id: (model.paymentEntity && model.paymentEntity.id) || this.baseService.appSettings.EmptyGuid,
                ein: (model.paymentEntity && model.paymentEntity.ein),
                remittanceAddressId: (model.paymentEntity && model.paymentEntity.remittanceAddressId),
                remittanceAddress: {
                    id: (model.paymentEntity && model.paymentEntity.remittanceAddress && model.paymentEntity.remittanceAddress.id),
                    address1: (model.paymentEntity && model.paymentEntity.remittanceAddress && model.paymentEntity.remittanceAddress.address1),
                    address2: (model.paymentEntity && model.paymentEntity.remittanceAddress && model.paymentEntity.remittanceAddress.address2),
                    address3: (model.paymentEntity && model.paymentEntity.remittanceAddress && model.paymentEntity.remittanceAddress.address3),
                    city: (model.paymentEntity && model.paymentEntity.remittanceAddress && model.paymentEntity.remittanceAddress.city),
                    state: (model.paymentEntity && model.paymentEntity.remittanceAddress && model.paymentEntity.remittanceAddress.state),
                    zipCode: (model.paymentEntity && model.paymentEntity.remittanceAddress && model.paymentEntity.remittanceAddress.zipCode)
                }                                
            },
            telephone: model.telephone,
            eMailAddress: model.eMailAddress,
            fax: model.fax,
            dispenserClass: model.dispenserClass,
            dispenserType: model.dispenserType,
            typeName: model.typeName,
            effectiveDate: moment.utc(model.effectiveDate).local().format('MM/DD/YYYY hh:mm:ss a'),
            terminationDate: model.terminationDate ? moment.utc(model.terminationDate).local().format('MM/DD/YYYY hh:mm:ss a') : null,
            tooltipMessage: `<table>
                            <tr>
                                <td>Store Number:</td><td style="padding-left: 5px">${model.storeNumber}</td>
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
    
    public getEmptyViewModel(): IServiceProviderViewModel {
        return <IServiceProviderViewModel>{ id: "", ncpdp: "", npi: "", name: "", storeNumber: "", type: undefined, physicalAddressId: "", 
            physicalAddress: { id: "", address1: "", address2: "", address3: "", city: "", state: "", zipCode: ""}, mailingAddressId: "", 
            mailingAddress: { id: "", address1: "", address2: "", address3: "", city: "", state: "", zipCode: ""}, paymentEntityId: "", 
            paymentEntity: { id: "", ein: "", remittanceAddress: 
            { id: "", address1: "", address2: "", address3: "", city: "", state: "", zipCode: ""} },  
            telephone: "", eMailAddress: "", dispenserClass: 0, dispenserType: 0, typeName: "", effectiveDate: "", terminationDate: "", tooltipMessage: ""};
    }


}


export interface IServiceProviderViewModel {
    id: string;
    ncpdp: string;
    npi: string;
    name: string;
    storeNumber: string;
    type: number;
    typeName: string;
    physicalAddressId: string;
    physicalAddress: IAddress;
    mailingAddressId: string;
    mailingAddress: IAddress;
    paymentEntityId: string;    
    paymentEntity: IPaymentEntityViewModel;
    telephone: string;
    fax: string;
    eMailAddress: string;
    dispenserClass: number;
    dispenserType: number;    
    effectiveDate: string;
    terminationDate: string;
    tooltipMessage: string;
}

export interface IServiceProvider {
    id: string;
    ncpdp: string;
    npi: string;
    name: string;
    storeNumber: string;
    type: number;
    typeName: string;
    physicalAddressId: string;
    physicalAddress: IAddress;
    mailingAddressId: string;
    mailingAddress: IAddress;
    paymentEntityId: string;
    paymentEntity: IPaymentEntity;
    telephone: string;
    fax: string;
    eMailAddress: string;
    dispenserClass: number;
    dispenserType: number;    
    effectiveDate: Date;
    terminationDate: Date;
}


export interface IServiceProviderFromIdentsStruct {
    id: string;
    npi: string;    
    effectiveDate: Date;
}
export interface IServiceProvidersFromServer extends ICollectionViewModel<IServiceProvider> {

}

export interface IServiceProvidersToClientFilter extends ICollectionViewModel<IServiceProviderViewModel> {
    
}
