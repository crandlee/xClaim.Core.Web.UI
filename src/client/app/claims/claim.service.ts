import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { BaseService, INameValue } from '../shared/service/base.service';
import { HubService } from '../shared/hub/hub.service';
import { OverpunchService } from './overpunch.service';
import { IServiceOptions, IDataService, ICollectionViewModel } from '../shared/service/base.service';
import * as _ from 'lodash';
import { IClaimsToServerFilter } from './claim.filter.service';
import { IFilterDefinition } from '../shared/filtering/filter.service';
import { TraceMethodPosition } from '../shared/logging/logging.service'
import * as moment from 'moment';

@Injectable()
export class ClaimService implements IDataService<IClaim, IClaimViewModel, IClaimsToServerFilter, IClaimsToClientFilter> {
    
    constructor(private baseService: BaseService, private overpunchService: OverpunchService) {
         baseService.initializeTrace("ClaimService");               
    }

    public endpointKey: string = 'xClaim.Core.Web.Api.Claims';


    public get(skip?: number, take?: number, toServerFilter?: IClaimsToServerFilter): Observable<IClaimsToClientFilter> {

        var trace = this.baseService.classTrace("get");
        trace(TraceMethodPosition.Entry);
        
        if (!skip) skip = 0;
        if (!take) take = this.baseService.appSettings.DefaultPageSize;

        var url = `claims?skip=${skip}&take=${take}`;
        if (toServerFilter && toServerFilter.dateOfServiceStart) url +=`&startServiceDate=${moment(toServerFilter.dateOfServiceStart).format("MM/DD/YYYY")}`;
        if (toServerFilter && toServerFilter.dateOfServiceEnd) url +=`&endServiceDate=${moment(toServerFilter.dateOfServiceEnd).format("MM/DD/YYYY")}`;
        if (toServerFilter && toServerFilter.processedStartDate) url +=`&startDate=${moment(toServerFilter.processedStartDate).utc().format("MM/DD/YYYY HH:mm:ss")}`;
        if (toServerFilter && toServerFilter.processedEndDate) url +=`&endDate=${moment(toServerFilter.processedEndDate).utc().format("MM/DD/YYYY HH:mm:ss")}`;
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
            processedDate: moment.utc(model.processedDate).local().format('MM/DD/YYYY hh:mm:ss a'),
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
            pairedContents: model.pairedContents,
            secondaryId: model.secondaryId,
            authorizationNumber: model.authorizationNumber,
            primaryPacketType: this.toPacketTypeViewModel(model.primaryPacketType),
            secondaryPacketType: this.toPacketTypeViewModel(model.secondaryPacketType),
            processingLogs: (model.processingLogs ? model.processingLogs.map(pl => this.processingLogToViewModel(pl)) : []),
            rejections: (model.rejections ? model.rejections.map(r => this.rejectionToViewModel(r)) : []),
            additionalValues: (model.additionalValues ? model.additionalValues.map(av => this.additionalValueToViewModel(av)) : []),
            subordinateDataValues: (model.subordinateDataValues ? model.subordinateDataValues.map(sd => this.subordinateDataToViewModel(sd)) : []),
            statusChanges: (model.statusChanges ? model.statusChanges.map(sc => this.statusChangeToViewModel(sc)) : []),
            isIncoming: model.isIncoming,
            correlatedPackets: (model.correlatedPackets ? model.correlatedPackets.map(cp => this.correlatedPacketToViewModel(cp)) : []),
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
        var segment = <ISegment>{};
        segment.Fields = [];
        segment.TransactionIndex = transactionIndex || 0;
        segment.TransactionType = transactionType;
        for (var propertyName in packetSegment) {
            if (propertyName === "SegmentCode") {
                segment.SegmentCode = packetSegment[propertyName];
                continue;
            }  
            if (propertyName === "SegmentDescription") {
                segment.SegmentDescription = packetSegment[propertyName];
                continue;
            } 
            if (propertyName.indexOf("FieldGroupSize") > -1 || propertyName === "TransactionIndex") continue;

            var field = <IClaimField>packetSegment[propertyName];
            if (_.isArray(packetSegment[propertyName])) {
                var fieldGroup = <IClaimField[]>packetSegment[propertyName];
                fieldGroup.forEach(innerField => {
                    field = <IClaimField>{ Fields: []};
                    field.Fields = this.fieldGroupToViewModel(innerField);
                    segment.Fields.push(field);        
                });
            } else {
                field.Fields = [];                
                segment.Fields.push(this.fieldToViewModel(field));    
            }
        }
        return segment;
    }

    private fieldGroupToViewModel(fieldGroup: any): IClaimField[] {
        var fieldGroupFields: IClaimField[] = [];
        for (var propertyName in fieldGroup) {
            if (propertyName.indexOf("FieldGroupSize") > -1) continue;
            var field = <IClaimField>fieldGroup[propertyName];
            if (_.isArray(fieldGroup[propertyName])) {
                var innerFieldGroup = <IClaimField[]>fieldGroup[propertyName];
                innerFieldGroup.forEach(innerField => {
                    field = <IClaimField>{Fields: []};
                    field.Fields = this.fieldGroupToViewModel(innerField);
                    fieldGroupFields.push(field);
                });
            } else {
                field.Fields = [];
                fieldGroupFields.push(this.fieldToViewModel(field));
            }
        }
        return fieldGroupFields;            
    }

    private fieldToViewModel(packetField: any): IClaimField {
        var transmissionField = <IClaimField>{};
        transmissionField.FieldId = packetField.FieldId || '(none)';
        transmissionField.FieldName = packetField.FieldName || '(none)';
        transmissionField.Description = packetField.Description || '(none)';
        transmissionField.Fields = [];
        transmissionField.Value = (packetField.Value && packetField.Value.Data) || packetField.Value;
        var valDesc = (packetField.Value && packetField.Value.Metadata && packetField.Value.Metadata.Description);
        if (valDesc) transmissionField.Value += ` (${valDesc})`;
        transmissionField.Summary = packetField.Value ? packetField.Value.Metadata && packetField.Value.Metadata.Summary : null;
        return transmissionField;
    }


    private processingLogToViewModel(model: IProcessingLog): IProcessingLogViewModel {
        var vm: IProcessingLogViewModel = {
            loggedDate: moment.utc(model.loggedDate).local().format('MM/DD/YYYY hh:mm:ss a'),
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

    private correlatedPacketToViewModel(model: ICorrelatedPacket): ICorrelatedPacketViewModel {
        var vm: ICorrelatedPacketViewModel = {
            id: model.id,
            transactionCode: model.transactionCode,
            processedDate: moment.utc(model.processedDate).local().format('MM/DD/YYYY hh:mm:ss a'),
            type: this.toCorrelatedPacketType(model.transactionCode)
        }
        return vm;
    }

    private statusChangeToViewModel(model: IStatusChange): IStatusChangeViewModel {
        var vm: IStatusChangeViewModel = {
            statusDate: moment.utc(model.statusDate).local().format('MM/DD/YYYY hh:mm:ss a'),
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
        if (model.matchedBins) matched += `${this.getSeparator(matched)}BINs: ${model.matchedBins}\n`;
        if (model.matchedPcns) matched += `${this.getSeparator(matched)}PCNs: ${model.matchedPcns}\n`;
        if (model.matchedGroupIds) matched += `${this.getSeparator(matched)}Groups: ${model.matchedGroupIds}\n`;
        if (model.matchedServiceProviderIds) matched += `${this.getSeparator(matched)}Pharmacies: ${model.matchedServiceProviderIds}\n`;
        if (model.matchedProductServiceIds) matched += `${this.getSeparator(matched)}NDCs: ${model.matchedProductServiceIds}\n`;
        if (model.matchedMemberIds) matched += `${this.getSeparator(matched)}Members: ${model.matchedMemberIds}\n`;
        if (!matched) matched += model.referenceType;
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

    public toCorrelatedPacketType(transactionCode: string): string {

        if (!transactionCode) return "Unknown";
        if (_.last(transactionCode) === "1") return "Billing Request";
        if (_.last(transactionCode) === "2") return "Reversal";
        if (_.last(transactionCode) === "3") return "Rebill/Inquiry";
        if (_.last(transactionCode) === "4") return "Request Only";
        return "Unknown";

    }

    private toPacketTypeViewModel(packetType: number): string {
        if (packetType === 0) return "Unknown";
        if (packetType === 1) return "Service Provider Request";
        if (packetType === 2) return "Accepted";
        if (packetType === 3) return "Benefit";
        if (packetType === 4) return "Captured";
        if (packetType === 5) return "Paid";
        if (packetType === 6) return "Rejected";
        if (packetType === 7) return "Deferred";
        if (packetType === 8) return "Outgoing Response";
        if (packetType === 9) return "Outgoing Request";
        if (packetType === 9) return "Incoming Payer";
        return "Unknown";
    }


    public getQuickFields(contents: string, fieldCode: string, overpunch: boolean = false, decimals: number = 0): string[] {

        const fieldSeparator = String.fromCharCode(28);
        const segmentSeparator = String.fromCharCode(29);
        const transactionSeparator = String.fromCharCode(30);
        const maxNumber = 2147483647
        var search = `${fieldSeparator}${fieldCode}`;
        var searchIndexStart = contents.indexOf(search);
        var strs: string[] = [];
        do {
            if (searchIndexStart <= -1) break;
            searchIndexStart += search.length;
            var nextFld = contents.indexOf(fieldSeparator, searchIndexStart);
            if (nextFld == -1) nextFld = maxNumber;
            var nextSeg = contents.indexOf(segmentSeparator, searchIndexStart);
            if (nextSeg == -1) nextSeg = maxNumber;
            var nextTrans = contents.indexOf(transactionSeparator, searchIndexStart);
            if (nextTrans == -1) nextTrans = maxNumber;
            var endOfPacket = contents.length - 1;
            var searchIndexEnd = _.min([nextFld, nextSeg, nextTrans, endOfPacket]);
            strs.push(contents.substr(searchIndexStart, searchIndexEnd - searchIndexStart));
            searchIndexStart = contents.indexOf(search, searchIndexEnd);
        } while (searchIndexStart > -1 && searchIndexStart < contents.length)
        return strs.map(s => {
            s = s.trim();
            if (overpunch) {
                var overpunchResult = this.overpunchService.overpunch(s);
                if (overpunchResult.overpunched) s = overpunchResult.value;
            }
            var num = _.toNumber(s);
            if (decimals > 0 && !_.isNaN(num)) {
                num = num / Math.pow(10, decimals);
                s = num.toFixed(decimals);                
            }
            return s;
        });
    }

    public getFieldValues(fieldCode: string, claim: ITransmission, firstOnly: boolean = false, firstTransactionOnly: boolean = false): string[] {
        //Super rough and brute force version of this function.  Only goes two levels of field groups - but the standard only goes up to two
        //levels atm.  
        var values: string[] = [];
        for (var i = 0; i < claim.Segments.length; i++) {
            for (var j = 0; j < claim.Segments[i].Fields.length; j++) {
                if (claim.Segments[i].Fields[j].FieldId === fieldCode) {
                    values.push(claim.Segments[i].Fields[j].Value);
                    if (firstOnly) return values;
                } 
                for (var k = 0; k < claim.Segments[i].Fields[j].Fields.length; k++) {
                    if (claim.Segments[i].Fields[j].Fields[k].FieldId === fieldCode) {
                        values.push(claim.Segments[i].Fields[j].Fields[k].Value);
                        if (firstOnly) return values;
                    } 
                    for (var l = 0; l < claim.Segments[i].Fields[j].Fields[k].Fields.length; l++) {
                        if (claim.Segments[i].Fields[j].Fields[k].Fields[l].FieldId === fieldCode) {
                            values.push(claim.Segments[i].Fields[j].Fields[k].Fields[l].Value);
                            if (firstOnly) return values;
                        } 
                    }                
                }                
            }
        };

        var transactionLength = claim.Transactions.length > 0 ? (firstTransactionOnly ? 1 : claim.Transactions.length) : 0;

        for (var t = 0; t < transactionLength; t++) {
            for (var i = 0; i < claim.Transactions[t].Segments.length; i++) {
                for (var j = 0; j < claim.Transactions[t].Segments[i].Fields.length; j++) {
                    if (claim.Transactions[t].Segments[i].Fields[j].FieldId === fieldCode){
                        values.push(claim.Transactions[t].Segments[i].Fields[j].Value);
                        if (firstOnly) return values;
                    } 
                    for (var k = 0; k < claim.Transactions[t].Segments[i].Fields[j].Fields.length; k++) {
                        if (claim.Transactions[t].Segments[i].Fields[j].Fields[k].FieldId === fieldCode) {
                            values.push(claim.Transactions[t].Segments[i].Fields[j].Fields[k].Value);
                            if (firstOnly) return values;
                        } 
                        for (var l = 0; l < claim.Transactions[t].Segments[i].Fields[j].Fields[k].Fields.length; l++) {
                            if (claim.Transactions[t].Segments[i].Fields[j].Fields[k].Fields[l].FieldId === fieldCode) {
                                values.push(claim.Transactions[t].Segments[i].Fields[j].Fields[k].Fields[l].Value);
                                if (firstOnly) return values;
                            } 
                        }                
                    }
                }
            };
        };

        return values;
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
     pairedContents: string;
     tooltipMessage: string;     
     processingLogs: IProcessingLogViewModel[];
     rejections: IRejectionViewModel[];
     additionalValues: IAdditionalValueViewModel[];
     subordinateDataValues: ISubordinateDataViewModel[];
     statusChanges: IStatusChangeViewModel[];
     primaryPacketType: string;
     secondaryPacketType: string;
     secondaryId: string;
     authorizationNumber: string;
     isIncoming: boolean;
     correlatedPackets: ICorrelatedPacketViewModel[];
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
     //NOTE: The paired contents field is not JSON, it is a raw packet since we only
     //need a couple of fields from it and it thus not worth converting to JSON on the server side.
     pairedContents: string;
     transactionCount: number;
     headerResponseStatus: string;
     version: string;
     processingLogs: IProcessingLog[];
     rejections: IRejection[];
     additionalValues: IAdditionalValue[];
     subordinateDataValues: ISubordinateData[];
     statusChanges: IStatusChange[];
     primaryPacketType: number;
     secondaryPacketType: number;
     secondaryId: string;
     authorizationNumber: string;
     isIncoming: boolean;
     correlatedPackets: ICorrelatedPacket[];
}

export interface ICorrelatedPacket {
    id: string;
    transactionCode: string;
    processedDate: Date;
}

export interface ICorrelatedPacketViewModel {
    id: string;
    transactionCode: string;
    processedDate: string;
    type: string;
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
    type: string;
    referenceType: string;
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

