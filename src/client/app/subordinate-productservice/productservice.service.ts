import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { BaseService, INameValue, IDropdownOptionViewModel } from '../shared/service/base.service';
import { HubService } from '../shared/hub/hub.service';
import { IServiceOptions, IDataService, ICollectionViewModel, IEnumViewModel } from '../shared/service/base.service';
import * as _ from 'lodash';
import { IProductServicesToServerFilter } from './productservice.filter.service';
import { IFilterDefinition } from '../shared/filtering/filter.service';
import { TraceMethodPosition } from '../shared/logging/logging.service'
import * as moment from 'moment';
import { IAddress, IPaymentEntity, IPaymentEntityViewModel } from '../shared/common/interfaces.ts';

@Injectable()
export class ProductServiceService implements IDataService<IProductService, IProductServiceViewModel, IProductServicesToServerFilter, IProductServicesToClientFilter> {

    constructor(private baseService: BaseService) {
        baseService.initializeTrace("ProductServiceService");
    }

    public endpointKey: string = 'xClaim.Core.Web.Api.Claims';


    public get(skip?: number, take?: number, toServerFilter?: IProductServicesToServerFilter): Observable<IProductServicesToClientFilter> {

        var trace = this.baseService.classTrace("get");
        trace(TraceMethodPosition.Entry);

        if (!skip) skip = 0;
        if (!take) take = this.baseService.appSettings.DefaultPageSize;

        var url = `productservices?skip=${skip}&take=${take}`;
        if (toServerFilter && toServerFilter.ndc) url += `&ndc=${toServerFilter.ndc}`;
        if (toServerFilter && toServerFilter.name) url += `&name=${toServerFilter.name}`;
        var obs = this.baseService.getObjectData<IProductServicesFromServer>(this.baseService.getOptions(this.baseService.hubService,
            this.endpointKey, "There was an error retrieving the data"), url)
            .map<IProductServicesToClientFilter>(data => {
                return {
                    rowCount: data.rowCount,
                    rows: data.rows.map(r => this.toViewModel(r))
                }
            });

        trace(TraceMethodPosition.Exit);
        return obs;
    }


    public getExistingById(ndc: string): Observable<IProductService> {
        var trace = this.baseService.classTrace("getExistingById");
        trace(TraceMethodPosition.Entry);
        var obs = this.baseService.getObjectData<IProductService>(this.baseService
            .getOptions(this.baseService.hubService, this.endpointKey, "There was an error retrieving the item"), `productservicesbyid/${ndc}`);
        trace(TraceMethodPosition.Exit);
        return obs;
    }

    public getExisting(id: string): Observable<IProductService> {
        var trace = this.baseService.classTrace("getExisting");
        trace(TraceMethodPosition.Entry);
        var obs = this.baseService.getObjectData<IProductService>(this.baseService
            .getOptions(this.baseService.hubService, this.endpointKey, "There was an error retrieving the item"), `productservices/${id}`);
        trace(TraceMethodPosition.Exit);
        return obs;
    }

    public toModel(viewModel: IProductServiceViewModel): IProductService {
        //This is unncessary since there will be no saving
        return null;
    }

    public getEmptyViewModel(): IProductServiceViewModel {
        return <IProductServiceViewModel>{ id: "", productServiceId: "", drugDetails: {
            label: "", extendedLabel: "", manufacturer: "", generic: "", gpi: "", ahfs: "", class: "", multiSourceCode: "", thirdPartyCode: "",
            rxOtc: "", routeOfAdministration: "", itemStatus: "", unitOfUse: "", top500: "", maintenanceIndicator: "", deaCode: "", desiCode: "",
            repackagedDrugs: "", form: "", strength: 0, strengthUnit: "", packageSize: 0, packageSizeUnit: "", packageQuantity: 0, currentAwpUnitPrice: 0,
            currentAwpPackagePrice: 0, currentAwpEffectiveDate: "", previousAwpPackagePrice: 0, previousAwpUnitPrice: 0, previousAwpEffectiveDate: "",
            aawpUnitPrice: 0, aawpEffectiveDate: "", hcfaUnitPrice: 0, hcfaEffectiveDate: "", wacUnitPrice: 0, dpUnitPrice: 0, dpEffectiveDate: "", medispanMarkupRate: 0
        }};
    }
    public toViewModel(model: IProductService): IProductServiceViewModel {
        var vm: IProductServiceViewModel = {
            id: model.id,
            productServiceId: model.productServiceId,
            drugDetails: {
                label: (model.drugDetails && model.drugDetails.label),
                extendedLabel: (model.drugDetails && model.drugDetails.extendedLabel),
                manufacturer: (model.drugDetails && model.drugDetails.manufacturer),
                generic: (model.drugDetails && model.drugDetails.generic),
                gpi: (model.drugDetails && model.drugDetails.gpi),
                ahfs: (model.drugDetails && model.drugDetails.ahfs),
                class: (model.drugDetails && model.drugDetails.class),
                multiSourceCode: (model.drugDetails && model.drugDetails.multiSourceCode),
                thirdPartyCode: (model.drugDetails && model.drugDetails.thirdPartyCode),
                rxOtc: (model.drugDetails && model.drugDetails.rxOtc),
                routeOfAdministration: (model.drugDetails && model.drugDetails.routeOfAdministration),
                itemStatus: (model.drugDetails && model.drugDetails.itemStatus),
                unitOfUse: (model.drugDetails && model.drugDetails.unitOfUse),
                top500: (model.drugDetails && model.drugDetails.top500),
                maintenanceIndicator: (model.drugDetails && model.drugDetails.maintenanceIndicator),
                deaCode: (model.drugDetails && model.drugDetails.deaCode),
                desiCode: (model.drugDetails && model.drugDetails.desiCode),
                repackagedDrugs: (model.drugDetails && model.drugDetails.repackagedDrugs),
                form: (model.drugDetails && model.drugDetails.form),
                strength: (model.drugDetails && model.drugDetails.strength),
                strengthUnit: (model.drugDetails && model.drugDetails.strengthUnit),
                packageSize: (model.drugDetails && model.drugDetails.packageSize),
                packageSizeUnit: (model.drugDetails && model.drugDetails.packageSizeUnit),
                packageQuantity: (model.drugDetails && model.drugDetails.packageQuantity),
                currentAwpPackagePrice: (model.drugDetails && model.drugDetails.currentAwpPackagePrice),
                currentAwpUnitPrice: (model.drugDetails && model.drugDetails.currentAwpUnitPrice),
                currentAwpEffectiveDate: (model.drugDetails && moment(model.drugDetails.currentAwpEffectiveDate).format('MM/DD/YYYY')),
                previousAwpPackagePrice: (model.drugDetails && model.drugDetails.previousAwpPackagePrice),
                previousAwpUnitPrice: (model.drugDetails && model.drugDetails.previousAwpUnitPrice),
                previousAwpEffectiveDate: (model.drugDetails && moment(model.drugDetails.previousAwpEffectiveDate).format('MM/DD/YYYY')),
                aawpUnitPrice: (model.drugDetails && model.drugDetails.aawpUnitPrice),
                aawpEffectiveDate: (model.drugDetails && moment(model.drugDetails.aawpEffectiveDate).format('MM/DD/YYYY')),
                hcfaUnitPrice: (model.drugDetails && model.drugDetails.hcfaUnitPrice),
                hcfaEffectiveDate: (model.drugDetails && moment(model.drugDetails.hcfaEffectiveDate).format('MM/DD/YYYY')),
                wacUnitPrice: (model.drugDetails && model.drugDetails.wacUnitPrice),
                dpUnitPrice: (model.drugDetails && model.drugDetails.dpUnitPrice),
                dpEffectiveDate: (model.drugDetails && moment(model.drugDetails.dpEffectiveDate).format('MM/DD/YYYY')),
                medispanMarkupRate: (model.drugDetails && model.drugDetails.medispanMarkupRate)
            }
        };

        return vm;
    }


}


export interface IProductServiceViewModel {
    id: string;
    productServiceId: string;
    drugDetails: IDrugDetailViewModel;
}

export interface IProductService {
    id: string;
    productServiceId: string;
    drugDetails: IDrugDetailModel;
}


export interface IDrugDetailModel {
    label: string;
    extendedLabel: string;
    manufacturer: string;
    generic: string;
    gpi: string;
    ahfs: string;
    class: string;
    multiSourceCode: string;
    thirdPartyCode: string;
    rxOtc: string;
    routeOfAdministration: string;
    itemStatus: string;
    unitOfUse: string;
    top500: string;
    maintenanceIndicator: string;
    deaCode: string;
    desiCode: string;
    repackagedDrugs: string;
    form: string;
    strength: number;
    strengthUnit: string;
    packageSize: number;
    packageSizeUnit: string;
    packageQuantity: number;
    currentAwpPackagePrice: number;
    currentAwpUnitPrice: number;
    currentAwpEffectiveDate: Date;
    previousAwpPackagePrice: number;
    previousAwpUnitPrice: number;
    previousAwpEffectiveDate: Date;
    aawpUnitPrice: number;
    aawpEffectiveDate: Date;
    hcfaUnitPrice: number;
    hcfaEffectiveDate: Date;
    wacUnitPrice: number;
    dpUnitPrice: number;
    dpEffectiveDate: Date;
    medispanMarkupRate: number;
}

export interface IDrugDetailViewModel {
    label: string;
    extendedLabel: string;
    manufacturer: string;
    generic: string;
    gpi: string;
    ahfs: string;
    class: string;
    multiSourceCode: string;
    thirdPartyCode: string;
    rxOtc: string;
    routeOfAdministration: string;
    itemStatus: string;
    unitOfUse: string;
    top500: string;
    maintenanceIndicator: string;
    deaCode: string;
    desiCode: string;
    repackagedDrugs: string;
    form: string;
    strength: number;
    strengthUnit: string;
    packageSize: number;
    packageSizeUnit: string;
    packageQuantity: number;
    currentAwpPackagePrice: number;
    currentAwpUnitPrice: number;
    currentAwpEffectiveDate: string;
    previousAwpPackagePrice: number;
    previousAwpUnitPrice: number;
    previousAwpEffectiveDate: string;
    aawpUnitPrice: number;
    aawpEffectiveDate: string;
    hcfaUnitPrice: number;
    hcfaEffectiveDate: string;
    wacUnitPrice: number;
    dpUnitPrice: number;
    dpEffectiveDate: string;
    medispanMarkupRate: number;
}

export interface IProductServicesFromServer extends ICollectionViewModel<IProductService> {

}

export interface IProductServicesToClientFilter extends ICollectionViewModel<IProductServiceViewModel> {

}

