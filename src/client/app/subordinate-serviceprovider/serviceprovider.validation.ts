import { ValidationService, IValidationOptions, IFormValidationResult, IValidationResult } from '../shared/validation/validation.service';
import { LoggingService, TraceMethodPosition } from '../shared/logging/logging.service';
import { FormControl, FormGroup, AbstractControl, ValidatorFn, AsyncValidatorFn } from '@angular/forms';
import { ServiceProviderService } from './serviceprovider.service';
import 'rxjs/add/operator/toPromise';

export class ServiceProviderValidationService extends ValidationService {
    
    private static idsNotUnique: string = "idsNotUnique";
    private static remittanceAddressRequired: string = "remittanceAddressRequired";
    private static mailingAddressRequired: string = "mailingAddressRequired";

    constructor() {
        super();
    }
    
    public static remittanceAddressCheck(form: FormGroup): IValidationResult {
        var einControl: AbstractControl = form.controls["ein"];
        var rAddress1Control: AbstractControl = form.controls["raddress1"];
        var rCityControl: AbstractControl = form.controls["rcity"];
        var rStateControl: AbstractControl = form.controls["rstate"];
        var rZipControl: AbstractControl = form.controls["rzipCode"];

        if (einControl.value && (!rAddress1Control.value || !rCityControl.value || !rStateControl.value || !rZipControl.value))
            return { [ServiceProviderValidationService.remittanceAddressRequired] : true};
        else 
            return null;
    }

    public static mailingAddressCheck(form: FormGroup): IValidationResult {
        var mAddress1Control: AbstractControl = form.controls["maddress1"];
        var mCityControl: AbstractControl = form.controls["mcity"];
        var mStateControl: AbstractControl = form.controls["mstate"];
        var mZipControl: AbstractControl = form.controls["mzipCode"];
        if (mAddress1Control.value &&  (!mCityControl.value || !mStateControl.value || !mZipControl.value))
            return { [ServiceProviderValidationService.mailingAddressRequired] : true};
        else 
            return null;
    }

    public static isIdentDuplicate(service: ServiceProviderService, id: string, ctl: AbstractControl): Promise<IValidationResult> {
        var form = <FormGroup>ctl;
        var npiControl: AbstractControl = form.controls["npi"];
        var effectiveDateControl: AbstractControl = form.controls["effectiveDate"];
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