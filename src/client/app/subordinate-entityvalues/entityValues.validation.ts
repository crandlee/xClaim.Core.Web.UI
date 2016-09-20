import { ValidationService, IValidationOptions, IFormValidationResult, IValidationResult } from '../shared/validation/validation.service';
import { LoggingService, TraceMethodPosition } from '../shared/logging/logging.service';
import { Control, ControlGroup, AbstractControl } from '@angular/common';
import { ValidatorFn, AsyncValidatorFn } from '@angular/common/src/forms/directives/validators';
import { EntityValuesService, EntityType } from './entityValues.service';
import 'rxjs/add/operator/toPromise';

export class EntityValuesValidationService extends ValidationService {
    
    
    constructor(private service: EntityValuesService) {
        super();
    }
    
    private static idIsNotValid: string = "idIsNotValid";

    public isEntityIdValid(entityType: EntityType, nameControl: AbstractControl): Promise<IValidationResult> {
        
        if (!entityType || !nameControl.value) return Promise.resolve(null);
        
        var svc = this.service.isEntityIdValid(nameControl.value, entityType);                            
        var p = new Promise<IValidationResult>(resolve => {
            svc.subscribe(isValid => {
                resolve(isValid ? {[EntityValuesValidationService.idIsNotValid] : true}: null);                                
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