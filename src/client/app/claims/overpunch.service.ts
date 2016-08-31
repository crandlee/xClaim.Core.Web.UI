import { Injectable } from '@angular/core';
import { BaseService } from '../shared/service/base.service';
import * as _ from 'lodash';

@Injectable()
export class OverpunchService  {
    
    constructor(private baseService: BaseService) {
         baseService.initializeTrace("OverpunchService");               
    }

    private overpunchConversions: IOverpunchConversion[] = [
        { absValue:"0", indicator:"{", negative: false},
        { absValue:"1", indicator:"A", negative: false},
        { absValue:"2", indicator:"B", negative: false},
        { absValue:"3", indicator:"C", negative: false},
        { absValue:"4", indicator:"D", negative: false},
        { absValue:"5", indicator:"E", negative: false},
        { absValue:"6", indicator:"F", negative: false},
        { absValue:"7", indicator:"G", negative: false},
        { absValue:"8", indicator:"H", negative: false},
        { absValue:"9", indicator:"I", negative: false},
        { absValue:"0", indicator:"}", negative: true},
        { absValue:"1", indicator:"J", negative: true},
        { absValue:"2", indicator:"K", negative: true},
        { absValue:"3", indicator:"L", negative: true},
        { absValue:"4", indicator:"M", negative: true},
        { absValue:"5", indicator:"N", negative: true},
        { absValue:"6", indicator:"O", negative: true},
        { absValue:"7", indicator:"P", negative: true},
        { absValue:"8", indicator:"Q", negative: true},
        { absValue:"9", indicator:"R", negative: true}
    ];

    public overpunch(rawValue: string): IOverpunchResult {
        
        //Assumes that the caller knows that the value needs overpunched, so does not check the type
        if (!rawValue) return { overpunched: false, value: rawValue};
        var conversion = _.find(this.overpunchConversions, oc => oc.indicator === _.last(rawValue));

        if (!conversion) return { overpunched: false, value: rawValue};

        rawValue = rawValue.substr(0, rawValue.length - 1) + conversion.absValue;
        rawValue = (conversion.negative ? "-" : "") + rawValue;
        return { overpunched: true, value: rawValue};
    }

}

export interface IOverpunchConversion {
    indicator: string;
    absValue: string;
    negative: boolean;
}

export interface IOverpunchResult {
    overpunched: boolean;
    value: string;
}