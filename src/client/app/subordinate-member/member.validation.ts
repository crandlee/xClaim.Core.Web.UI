import { ValidationService, IValidationOptions, IFormValidationResult, IValidationResult } from '../shared/validation/validation.service';
import { LoggingService, TraceMethodPosition } from '../shared/logging/logging.service';
import { Control, ControlGroup, AbstractControl } from '@angular/common';
import { ValidatorFn, AsyncValidatorFn } from '@angular/common/src/forms/directives/validators';
import { MemberService } from './member.service';
import 'rxjs/add/operator/toPromise';

export class MemberValidationService extends ValidationService {
    
    private static idsNotUnique: string = "idsNotUnique";

    constructor() {
        super();
    }
    
    
    public static isIdentDuplicate(service: MemberService, id: string, ctl: AbstractControl): Promise<IValidationResult> {
        var form = <ControlGroup>ctl;
        var memberIdControl: AbstractControl = form.controls["MemberIdControl"];
        var effectiveDateControl: AbstractControl = form.controls["EffectiveDateControl"];
        if (memberIdControl.value || effectiveDateControl.value) {
            var svc = service.isIdentDuplicate(id, memberIdControl.value, effectiveDateControl.value);                            
            var p = new Promise<IValidationResult>(resolve => {
                svc.subscribe(isDuplicate => {
                    resolve(isDuplicate ? {[MemberValidationService.idsNotUnique] : true}: null);                                
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
            [MemberValidationService.idsNotUnique]: "The Member Id is already in use for this effective date",
        };
        return config[code] ||  super.getValidatorErrorMessage(code);
    }

}