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

    public toModel(viewModel: IClaimViewModel): IClaim {
        return null;
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
            headerResponseStatus: !model.headerResponseStatus ? null : model.headerResponseStatus == 'A'? 'Accepted': 'Rejected',
            version: model.version,
            contents: this.contentsToViewModel(model.contents),
            processingLogs: (model.processingLogs ? model.processingLogs.map(pl => this.processingLogToViewModel(pl)) : []),
            rejections: (model.rejections ? model.rejections.map(r => this.rejectionToViewModel(r)) : []),
            additionalValues: (model.additionalValues ? model.additionalValues.map(av => this.additionalValueToViewModel(av)) : []),
            subordinateDataValues: (model.subordinateDataValues ? model.subordinateDataValues.map(sd => this.subordinateDataToViewModel(sd)) : []),
            statusChanges: (model.statusChanges ? model.statusChanges.map(sc => this.statusChangeToViewModel(sc)) : []),
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
                                <td>Response Status:</td><td style="padding-left: 5px">${!model.headerResponseStatus ? null : model.headerResponseStatus == 'A'? 'Accepted': 'Rejected'}</td>
                            </tr>   
                            <tr>                                        
                                <td>Id:</td><td style="padding-left: 5px">${model.id}</td>
                            </tr>
                            </table>
            `  
        };            
    
        return vm;
    }
    

    private contentsToViewModel(contents: string): ITransmission {
        if (!contents) return null;        
        var packet = JSON.parse(contents);
        var tm: ITransmission = { Segments: [], Transactions: []};
        var transactionIndex: number = 0;
        //Transmission Level Segments
        for (var propertyName in packet) {
            if (propertyName.indexOf("Segment") > -1) {
                var segment = <ISegment>packet[propertyName];
                tm.Segments.push(this.segmentToViewModel(tm, segment));
            }
            if (propertyName === "Transactions") {
                var transactions:any[] = packet[propertyName];
                transactions.forEach(transaction => {
                    transactionIndex += 1;
                    var transactionType = transaction.Description;
                    var tx: ITransaction = {Segments: [], TransactionIndex: transactionIndex};
                    for (var segmentProperty in transaction) {
                        if (segmentProperty === "Description" || segmentProperty === "TransactionIndex" || segmentProperty === "TransactionCode") continue;
                        var segment = <ISegment>transaction[segmentProperty];
                        tx.Segments.push(this.segmentToViewModel(tx, segment, transactionIndex, transactionType));                    
                    }
                    tm.Transactions.push(tx);
                });
            }
        }
        return tm;
        
    }

    private segmentToViewModel(segmentContainer: ISegmentContainer, packetSegment:any, transactionIndex?: number, transactionType?: string): ISegment {
        var transmissionSegment = <ISegment>{};
        transmissionSegment.Fields = [];
        transmissionSegment.TransactionIndex = transactionIndex || 0;
        transmissionSegment.TransactionType = transactionType;
        for (var propertyName in packetSegment) {
            if (propertyName === "SegmentCode") {
                transmissionSegment.SegmentCode = packetSegment[propertyName];
                continue;
            }  
            if (propertyName === "SegmentDescription") {
                transmissionSegment.SegmentDescription = packetSegment[propertyName];
                continue;
            } 
            if (propertyName.indexOf("FieldGroupSize") > -1 || propertyName === "TransactionIndex") continue;

            var field = <IClaimField>packetSegment[propertyName];
            field.Fields = [];
            if (_.isArray(packetSegment[propertyName])) this.fieldGroupToViewModel(field, packetSegment[propertyName]);
            transmissionSegment.Fields.push(this.fieldToViewModel(field));    
        }
        return transmissionSegment;
    }

    private fieldGroupToViewModel(field: IClaimField, fieldGroup: any[]): void {
        fieldGroup.forEach(innerField => {
            for (var propertyName in innerField) {
                if (propertyName.indexOf("FieldGroupSize") > -1) continue;
                var field = <IClaimField>innerField[propertyName];
                field.Fields = [];
                if (_.isArray(innerField[propertyName])) this.fieldGroupToViewModel(field, innerField[propertyName]);
                field.Fields.push(this.fieldToViewModel(field));    
            }        
        });
    }

    private fieldToViewModel(packetField: any): IClaimField {
        var transmissionField = <IClaimField>{};
        transmissionField.FieldId = packetField.FieldId || '(none)';
        transmissionField.FieldName = packetField.FieldName || '(none)';
        transmissionField.Description = packetField.Description || '(none)';
        transmissionField.Value = (packetField.Value && packetField.Value.Data) || packetField.Value;
        var valDesc = (packetField.Value && packetField.Value.Metadata && packetField.Value.Metadata.Description);
        if (valDesc) transmissionField.Value += ` (${valDesc})`;
        transmissionField.Summary = packetField.Value ? packetField.Value.Metadata && packetField.Value.Metadata.Summary : null;
        return transmissionField;
    }

    private processingLogToViewModel(model: IProcessingLog): IProcessingLogViewModel {
        var vm: IProcessingLogViewModel = {
            loggedDate: moment(model.loggedDate).format('MM/DD/YYYY hh:mm:ss a'),
            message: model.message
        }
        return vm;
    }

    private additionalValueToViewModel(model: IAdditionalValue): IAdditionalValueViewModel {
        var vm: IAdditionalValueViewModel = {
            key: model.key,
            value: model.value
        }
        return vm;
    }

    private statusChangeToViewModel(model: IStatusChange): IStatusChangeViewModel {
        var vm: IStatusChangeViewModel = {
            statusDate: moment(model.statusDate).format('MM/DD/YYYY hh:mm:ss a'),
            routeOrdinal: this.translateRouteOrdinal(model.routeOrdinal),
            eventName: model.eventName.replace(/\./g," / ")    
        }
        return vm;
    }

    private replaceAll(str:string, find:string, replace:string) {
        return str.replace(new RegExp(find, 'g'), replace);
    }

    private subordinateDataToViewModel(model: ISubordinateData): ISubordinateDataViewModel {
        var vm: ISubordinateDataViewModel = {
            namespace: model['namespace'],
            description: model.description,
            value: model.value,
            matched: this.translateMatchedSubordinate(model)
        }
        return vm;
    }

    private getSeparator(existing: string): string {
        if (existing) return " / ";
        return "";
    }
    private translateMatchedSubordinate(model: ISubordinateData): string {
        var matched: string = "";
        if (model.matchedBins) matched += `${this.getSeparator(matched)}BINs: ${model.matchedBins}`;
        if (model.matchedPcns) matched += `${this.getSeparator(matched)}PCNs: ${model.matchedPcns}\n`;
        if (model.matchedGroupIds) matched += `${this.getSeparator(matched)}Groups: ${model.matchedGroupIds}\n`;
        if (model.matchedServiceProviderIds) matched += `${this.getSeparator(matched)}Pharmacies: ${model.matchedServiceProviderIds}\n`;
        if (model.matchedProductServiceIds) matched += `${this.getSeparator(matched)}NDCs: ${model.matchedProductServiceIds}\n`;
        if (model.matchedMemberIds) matched += `${this.getSeparator(matched)}Members: ${model.matchedMemberIds}\n`;
        return matched;
    }

    private translateRejectionLevel(rejectionLevel: number): string {
        if (rejectionLevel === 0) return "Transmission";
        if (rejectionLevel === 1) return "Transaction";
        return "Unknown";
    }

    private translateRouteOrdinal(routeOrdinal: number): string {
        if (routeOrdinal === -1) return "Initial";
        if (routeOrdinal === 10000) return "Central Handler Response";
        if (routeOrdinal === 10001) return "Return To Source";
        if (routeOrdinal === -2) return "Unknown Or Timeout";
        return `Step ${(routeOrdinal + 1).toString()}`;
    }

    private translateTransactionIndex(index: number): string {
        if (index === -1) return "";
        return (index + 1).toString();
    }

    private rejectionToViewModel(model: IRejection): IRejectionViewModel {
        var vm: IRejectionViewModel = {
            rejectionLevel: this.translateRejectionLevel(model.rejectionLevel),
            transactionIndex: this.translateTransactionIndex(model.transactionIndex),
            repeatingFieldIndex: model.repeatingFieldIndex + 1,
            code: model.code ? model.code.toUpperCase() : "(None)",
            description: model.description ? model.description : "(None)",
            message: model.message ? model.message : "(None)"
        }
        return vm;
    }

    public getEmptyClaimViewModel(): IClaimViewModel {
        return <IClaimViewModel>{ id: "", processedDate: "", serviceProviderId: "", transactionCode: "", dateOfService: "",
            prescriptionRefNumber: "", bin: "", pcn: "", groupId: "", transactionCount: 0, headerResponseStatus: "", version: "", contents: null, 
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
     contents: ITransmission;
     tooltipMessage: string;     
     processingLogs: IProcessingLogViewModel[];
     rejections: IRejectionViewModel[];
     additionalValues: IAdditionalValueViewModel[];
     subordinateDataValues: ISubordinateDataViewModel[];
     statusChanges: IStatusChangeViewModel[];
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
     processingLogs: IProcessingLog[];
     rejections: IRejection[];
     additionalValues: IAdditionalValue[];
     subordinateDataValues: ISubordinateData[];
     statusChanges: IStatusChange[];
}

export interface IProcessingLog {
    loggedDate: Date;
    message: string;
}

export interface IProcessingLogViewModel {
    loggedDate: string;
    message: string;
}

export interface IRejection {
    rejectionLevel: number;
    transactionIndex: number;
    repeatingFieldIndex: number;
    code: string;
    description: string;
    message: string;
}

export interface IRejectionViewModel {
    rejectionLevel: string;
    transactionIndex: string;
    repeatingFieldIndex: number;
    code: string;
    description: string;
    message: string;
}

export interface IAdditionalValue {
    key: string;
    value: string;
}

export interface IAdditionalValueViewModel {
    key: string;
    value: string;
}

export interface IStatusChange {
    statusDate: Date;
    routeOrdinal: number;
    eventName: string;    
}

export interface IStatusChangeViewModel {
    statusDate: string;
    routeOrdinal: string;
    eventName: string;
}

export interface ISubordinateData {
    namespace: string;
    description: string;
    value: string;
    matchedBins: string;
    matchedPcns: string;
    matchedGroupIds: string;
    matchedServiceProviderIds: string;
    matchedProductServiceIds: string;
    matchedMemberIds: string;
}


export interface ISubordinateDataViewModel {
    namespace: string;
    description: string;
    value: string;
    matched: string;
}


export interface IClaimField {
    Value: string,
    FieldId: string,
    FieldName: string,
    Description: string,
    Summary: string,
    Fields: IClaimField[]
}

export interface ISegment {
    SegmentCode: string,
    SegmentDescription: string,
    TransactionIndex: number,
    TransactionType: string,
    Fields: IClaimField[]
}

export interface InsuranceRequestSegment extends ISegment {
    CardholderId: IClaimField,
    EligibilityClarificationCode: IClaimField,
    GroupId: IClaimField,
    PatientRelationshipCode: IClaimField,
    MedicaidIndicator: IClaimField
}

export interface ISegmentContainer {
    Segments: ISegment[]
}
export interface ITransaction extends ISegmentContainer {
    TransactionIndex: number;
}

export interface ITransmission extends ISegmentContainer {
    Transactions: ITransaction[];
}


export interface IClaimsFromServer extends ICollectionViewModel<IClaim> {

}

export interface IClaimsToClientFilter extends ICollectionViewModel<IClaimViewModel> {
    
}

