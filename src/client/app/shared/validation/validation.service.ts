import { FormControl, FormGroup, AbstractControl, FormBuilder, AsyncValidatorFn, ValidatorFn } from '@angular/forms';
import * as _ from 'lodash';
import { Injectable } from '@angular/core';
import { LoggingService, TraceMethodPosition } from '../logging/logging.service';
import * as moment from 'moment';

@Injectable()
export class ValidationService {
    

    private static passwordNotStrong: string = "passwordNotStrong";
    private static required: string = "required";
    private static exceedsLength: string = "maxlength";
    private static invalidEmailAddress: string = "invalidEmailAddress";
    private static notNumeric: string = "notNumeric";
    private static notDate: string = "notDate";
    private static notInteger: string = "notInteger";
    private static lessThanOne: string = "lessThanOne";
    private static lessThanZero: string = "lessThanZero";

    public getValidatorErrorMessage(code: string): string {
        let config:any = {
            [ValidationService.required]: "Required",
            [ValidationService.invalidEmailAddress]: "Invalid email address",
            [ValidationService.passwordNotStrong]: "The password must be at least 9 characters containing one upper, lower, numeric, and symbol character",
            [ValidationService.notNumeric]: "Value must be numeric",
            [ValidationService.notDate]: "Value must be a date",
            [ValidationService.notInteger]: "Value must be an integer",
            [ValidationService.lessThanOne]: "Value must be greater than zero",
            [ValidationService.lessThanZero]: "Value must be greater than or equal to zero",
            [ValidationService.exceedsLength]: "Value exceeds maximum length"
        };

        return config[code] || `Unknown Error (key = ${code})`;
    }

    constructor() {
    }


    public static isGreaterThanOrEqualToZero(canBeEmpty: boolean = false, control: AbstractControl): IValidationResult {
        
        if (canBeEmpty && (!control || !control.value)) return null;
        var num = _.toNumber(control.value);
        if (!_.isNaN(num) && Number.isInteger(num) && num >= 0) {
            return null;
        } else {
            return { [ValidationService.lessThanZero]: true };
        }
        
    }


    public static isGreaterThanZero(canBeEmpty: boolean = false, control: AbstractControl): IValidationResult {
        if (canBeEmpty && (!control || !control.value)) return null;
        var num = _.toNumber(control.value);
        if (!_.isNaN(num) && Number.isInteger(num) && num > 0) {
            return null;
        } else {
            return { [ValidationService.lessThanOne]: true };
        }
        
    }


    public static isDate(canBeEmpty: boolean = false, control: AbstractControl): IValidationResult {
        if (canBeEmpty && (!control || !control.value)) return null;
        var ret = null;
        if (ValidationService.isValidDate(control.value)) {
            ret =  null;
        } else {
            ret = { [ValidationService.notDate]: true };
        }
        return ret;
    }

    public static isValidDate(str: string): boolean {
        if (str == null) return false;
        var d = moment(str,'M/D/YYYY');
        if(d == null || !d.isValid()) return false;
        return str.indexOf(d.format('M/D/YYYY')) >= 0 
            || str.indexOf(d.format('MM/DD/YYYY')) >= 0
            || str.indexOf(d.format('M/D/YY')) >= 0 
            || str.indexOf(d.format('MM/DD/YY')) >= 0;
    }

    public static isInteger(canBeEmpty: boolean = false, control: AbstractControl): IValidationResult {
        
        if (canBeEmpty && (!control || !control.value)) return null;
        var num = _.toNumber(control.value);
        if (!_.isNaN(num) && Number.isInteger(num)) {
            return null;
        } else {
            return { [ValidationService.notInteger]: true };
        }
        
    }

    public static isNumeric(canBeEmpty: boolean = false, control: AbstractControl): IValidationResult {
        
        if (canBeEmpty && (!control || !control.value)) return null;
        var num = _.toNumber(control.value);
        if (!_.isNaN(num)) {
            return null;
        } else {
            return { [ValidationService.notNumeric]: true };
        }
        
    }


    
    public static passwordStrength(passwordControl: AbstractControl): IValidationResult {
        
        if (passwordControl.value.match(/(?=.{9,})(?=.*?[^\w\s])(?=.*?[0-9])(?=.*?[A-Z]).*?[a-z].*/)) {
            return null;
        } else {
            return { [ValidationService.passwordNotStrong]: true };
        }
        
    }

    public static valueLength(control: AbstractControl, expectedLength: number): IValidationResult {
        
        if (control.value.length <= expectedLength) {
            return null;
        } else {
            return { [ValidationService.exceedsLength]: true };
        }
        
    }

    public static isEmailValid(control: AbstractControl): IValidationResult {
        var ret:any = null;
        if (!control.value) return null;
        if (!control.value.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)) {
            ret = { [ValidationService.invalidEmailAddress]: true };
        }
        return ret;
    }

    public getValidationResults(controlGroup: FormGroup,  
        formLevelValidation?: ValidatorFn, asyncFormLevelValidation?: AsyncValidatorFn, options?: IValidationOptions): Promise<IFormValidationResult[]> {
        
        
        var dirtyOnly = (options && options.dirtyOnly || false);
                    
        //Process form level validation not attached to any particular control
        var flv: IFormValidationResult[] = [];
        var flp: Promise<IFormValidationResult[]>;
        if (formLevelValidation || asyncFormLevelValidation) {
            flp = this.processFormLevelValidation(controlGroup, formLevelValidation, asyncFormLevelValidation);
        } else {
            flp = Promise.resolve([]);
        }
        
        //Build form validation results from control-level validation/form-level validation
        var clp = flp.then(flv => {
            return new Promise(resolve => {
                var ret = _.map(this.processControlLevelValidation(controlGroup, dirtyOnly), ce => {
                    var res:any = <IFormValidationResult>{ control: ce.control, message: this.getValidatorErrorMessage(ce.error), controlDescription: ce.controlDescription, 
                        type: ValidationResultType.Error, getMessage: () => { return res.controlDescription + ": " + res.message; } }; 
                    return res;   
                }).concat(flv);
                resolve(ret);
            });
                        
        });
                                  
        return clp;
        
    }
    
    private processControlLevelValidation(controlGroup: FormGroup, dirtyOnly: boolean): IControlLevelErrorResult[] {
                
        var controlErrors: IControlLevelErrorResult[] = [];

        _.chain(controlGroup.controls)
            .values<FormControl>()
            .map((c, idx) => {
                return { control: c,  description: c['description']}
            })
            .filter(ctrlDesc => (!dirtyOnly || ctrlDesc.control.dirty) &&  !ctrlDesc.control.valid && !ctrlDesc.control.pending)
            .each(ctrlDesc => {
                _.each(_.keys(ctrlDesc.control.errors),e => {                
                    controlErrors.push({ control: ctrlDesc.control, error: e, controlDescription: ctrlDesc.description })
                });            
            }).value();
                
        return controlErrors;
    }
    
    private processFormLevelValidation(controlGroup: FormGroup, formLevelValidation: ValidatorFn, asyncFormLevelValidation: AsyncValidatorFn): Promise<IFormValidationResult[]> {
        
        var formLevelResultsPromise = new Promise<IFormValidationResult[]>((resolve,reject) => {
            var formLevelResults:any = [];
            if (formLevelValidation)
                formLevelResults = formLevelResults.concat(this.buildValidationResultsFromValidatorResults(formLevelValidation(controlGroup))); 
                
            if (asyncFormLevelValidation) {
                asyncFormLevelValidation(controlGroup).then((results:any) => {
                    formLevelResults = formLevelResults.concat(this.buildValidationResultsFromValidatorResults(results));
                    resolve(formLevelResults);
                    return;
                }, (err:any) => {
                    //this.loggingService.error(err, "Unable to complete validation. An error occurred");
                    reject(err);
                });
            } else {
                resolve(formLevelResults);                
            }
        });            
        return formLevelResultsPromise;
        
    }
    
    
    private buildValidationResultsFromValidatorResults(results: any): IFormValidationResult[] {

        var ret = _.chain(results)            
            .pickBy(flv => flv === true)
            .map((flv:any, flr:any) => {
                var res:any = <IFormValidationResult>{ control: null, message: this.getValidatorErrorMessage(flr), controlDescription: null, 
                    type: ValidationResultType.Error, getMessage: () => { return res.message; }};
                return res;  
            }).value();
            
        return ret;
    }
    
    public buildControlGroup(builder: FormBuilder, controlDefinitions: IControlDefinition[]): { controlGroup: FormGroup, controlDataDescriptions: string[] } {


        if (controlDefinitions == null) throw new Error("Must provide a control definition");


        var names = _.map(controlDefinitions, cd => cd.controlName);        
        var descriptions = _.map(controlDefinitions, cd => cd.description);
        var controls = _.map(controlDefinitions, cd => cd.control);
        
        var builderDef = <{[key:string]: AbstractControl}>_.zipObject(names, controls);
        var form = new FormGroup(builderDef);                
        return {
            controlGroup: form,
            controlDataDescriptions: descriptions 
        }
        
    }
    
};

interface IControlLevelErrorResult {
    control: AbstractControl, 
    error: any, 
    controlDescription: string
}

export interface IControlDefinition {
    controlName: string,
    description: string,
    control: FormControl
}
export interface IFormValidationResult {
    control: FormControl;
    message: string;
    controlDescription: string;
    type: ValidationResultType;
    getMessage: () => string;
}

export enum ValidationResultType {
    Information,
    Warning,
    Error
}

export interface IValidationOptions {
    dirtyOnly?: boolean;
}

export interface IValidationResult {
    [key:string]: boolean;
}
