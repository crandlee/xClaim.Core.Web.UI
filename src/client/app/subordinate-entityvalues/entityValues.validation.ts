import { ValidationService, IValidationOptions, IFormValidationResult, IValidationResult } from '../shared/validation/validation.service';
import { LoggingService, TraceMethodPosition } from '../shared/logging/logging.service';
import { FormControl, FormGroup, AbstractControl,ValidatorFn, AsyncValidatorFn } from '@angular/forms';
import { EntityValuesService, EntityType } from './entityValues.service';
import 'rxjs/add/operator/toPromise';

export class EntityValuesValidationService extends ValidationService {
        
    constructor() {
        super();
    }
    
    private static idIsNotValid: string = "idIsNotValid";

    public isEntityIdValid(entityType: EntityType, ctrl: AbstractControl, service: EntityValuesService): Promise<IValidationResult> {
        
        if (!ctrl) return Promise.resolve(null);
        if (!entityType || !ctrl.value) return Promise.resolve(null);
        
        var svc = service.isEntityIdValid(ctrl.value, entityType);                            
        var p = new Promise<IValidationResult>(resolve => {
            svc.subscribe(isValid => {
                resolve(!isValid ? {[EntityValuesValidationService.idIsNotValid] : true}: null);                                
            });            
        });  
        
        return p;
    }

    public getValidatorErrorMessage(code: string): string {
        let config: any = {
            [EntityValuesValidationService.idIsNotValid]: "The id does not exist",
        };
        return config[code] ||  super.getValidatorErrorMessage(code);
    }

}