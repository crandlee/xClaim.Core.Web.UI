import { ValidationService, IValidationOptions, IFormValidationResult, IValidationResult } from '../shared/validation/validation.service';
import { LoggingService, TraceMethodPosition } from '../shared/logging/logging.service';
import { Control, ControlGroup, AbstractControl } from '@angular/common';
import { ValidatorFn, AsyncValidatorFn } from '@angular/common/src/forms/directives/validators';
import { ServiceProviderService } from './serviceprovider.service';
import 'rxjs/add/operator/toPromise';

export class ServiceProviderValidationService extends ValidationService {
    
    private static idsNotUnique: string = "idsNotUnique";
    private static remittanceAddressRequired: string = "remittanceAddressRequired";
    private static mailingAddressRequired: string = "mailingAddressRequired";

    constructor() {
        super();
    }
    
    public static remittanceAddressCheck(form: ControlGroup): IValidationResult {
        var einControl: AbstractControl = form.controls["EINControl"];
        var rAddress1Control: AbstractControl = form.controls["RAddress1Control"];
        var rCityControl: AbstractControl = form.controls["RCityControl"];
        var rStateControl: AbstractControl = form.controls["RStateControl"];
        var rZipControl: AbstractControl = form.controls["RZipCodeControl"];

        if (einControl.value && (!rAddress1Control.value || !rCityControl.value || !rStateControl.value || !rZipControl.value))
            return { [ServiceProviderValidationService.remittanceAddressRequired] : true};
        else 
            return null;
    }

    public static mailingAddressCheck(form: ControlGroup): IValidationResult {
        var mAddress1Control: AbstractControl = form.controls["MAddress1Control"];
        var mCityControl: AbstractControl = form.controls["MCityControl"];
        var mStateControl: AbstractControl = form.controls["MStateControl"];
        var mZipControl: AbstractControl = form.controls["MZipCodeControl"];
        if (mAddress1Control.value &&  (!mCityControl.value || !mStateControl.value || !mZipControl.value))
            return { [ServiceProviderValidationService.mailingAddressRequired] : true};
        else 
            return null;
    }

    public static isIdentDuplicate(service: ServiceProviderService, id: string, ctl: AbstractControl): Promise<IValidationResult> {
        var form = <ControlGroup>ctl;
        var npiControl: AbstractControl = form.controls["NPIControl"];
        var effectiveDateControl: AbstractControl = form.controls["EffectiveDateControl"];
        if (npiControl.value || effectiveDateControl.value) {
            var svc = service.isIdentDuplicate(id, npiControl.value, effectiveDateControl.value);                            
            var p = new Promise<IValidationResult>(resolve => {
                svc.subscribe(isDuplicate => {
                    resolve(isDuplicate ? {[ServiceProviderValidationService.idsNotUnique] : true}: null);                                
                });            
            });  
            return p;
        } else {
            return new Promise<IValidationResult>(resolve => {
                resolve(null);
            });
        }
    }

    public getValidatorErrorMessage(code: string): string {
        let config: any = {
            [ServiceProviderValidationService.idsNotUnique]: "The NPI is already in use for this effective date",
            [ServiceProviderValidationService.remittanceAddressRequired]: "A full remittance address (Address 1, City, State, and Zip Code) must be filled out when an EIN is entered",
            [ServiceProviderValidationService.mailingAddressRequired]: "A full mailing address (City, State, and Zip) must be filled out when Mailing Address 1 is entered"
        };
        return config[code] ||  super.getValidatorErrorMessage(code);
    }

}