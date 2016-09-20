import { ValidationService, IValidationOptions, IFormValidationResult, IValidationResult } from '../shared/validation/validation.service';
import { LoggingService, TraceMethodPosition } from '../shared/logging/logging.service';
import { Control, ControlGroup, AbstractControl } from '@angular/common';
import { ValidatorFn, AsyncValidatorFn } from '@angular/common/src/forms/directives/validators';
import { PlanService } from './plan.service';
import 'rxjs/add/operator/toPromise';

export class PlanValidationService extends ValidationService {
    
    private static nameNotUnique: string = "nameNotUnique";
    private static idsNotUnique: string = "idsNotUnique";
    private static idsRequired: string = "idsRequired";

    constructor() {
        super();
    }
    
    

    public isNameDuplicate(nameControl: AbstractControl, planService: PlanService, id: string): Promise<IValidationResult> {
        
        if (!id || !nameControl.value) return Promise.resolve(null);
        
        var svc = planService.isNameDuplicate(nameControl.value, id);                            
        var p = new Promise<IValidationResult>(resolve => {
            svc.subscribe(isDuplicate => {
                resolve(isDuplicate ? {[PlanValidationService.nameNotUnique] : true}: null);                                
            });            
        });  
        
        return p;
    }
    
    
    public static isIdentDuplicate(planService: PlanService, id: string, ctl: AbstractControl): Promise<IValidationResult> {
        var form = <ControlGroup>ctl;
        var binControl: AbstractControl = form.controls["BinControl"];
        var pcnControl: AbstractControl = form.controls["PcnControl"];
        var groupIdControl: AbstractControl = form.controls["GroupIdControl"];
        var effectiveDateControl: AbstractControl = form.controls["EffectiveDateControl"];
        if (binControl.value || pcnControl.value || groupIdControl.value || effectiveDateControl.value) {
            var svc = planService.isIdentDuplicate(id, binControl.value, pcnControl.value, groupIdControl.value, effectiveDateControl.value);                            
            var p = new Promise<IValidationResult>(resolve => {
                svc.subscribe(isDuplicate => {
                    resolve(isDuplicate ? {[PlanValidationService.idsNotUnique] : true}: null);                                
                });            
            });  
            return p;
        } else {
            return new Promise<IValidationResult>(resolve => {
                resolve(null);
            });
        }
    }

    public static identRequired(form: ControlGroup): IValidationResult {
        var pcnControl: AbstractControl = form.controls["PcnControl"];
        var groupIdControl: AbstractControl = form.controls["GroupIdControl"];

        if (!pcnControl.value && !groupIdControl.value) {
            return { [PlanValidationService.idsRequired]: true};        
        } else {
            return null;
        }
        
    }

    public getValidatorErrorMessage(code: string): string {
        let config: any = {
            [PlanValidationService.nameNotUnique]: "This plan name is already in use",
            [PlanValidationService.idsNotUnique]: "The BIN/PCN/Group Id is already in use",
            [PlanValidationService.idsRequired]: "Must enter either a PCN or a Group Id"
        };
        return config[code] ||  super.getValidatorErrorMessage(code);
    }

}