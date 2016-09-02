import { ValidationService, IValidationOptions, IFormValidationResult, IValidationResult } from '../shared/validation/validation.service';
import { LoggingService, TraceMethodPosition } from '../shared/logging/logging.service';
import { Control, ControlGroup, AbstractControl } from '@angular/common';
import { ValidatorFn, AsyncValidatorFn } from '@angular/common/src/forms/directives/validators';
import { NamespaceService } from './namespace.service';
import 'rxjs/add/operator/toPromise';

export class NamespaceValidationService extends ValidationService {
    
    private static nameNotUnique: string = "nameNotUnique";
    private static nameSpaceFree: string = "nameSpaceFree";
    
    constructor() {
        super();
    }
    
    
    public static noSpaces(control: AbstractControl): IValidationResult {
        
        if (!control.value || control.value.indexOf(" ") === -1) {
            return null;
        } else {
            return { [NamespaceValidationService.nameSpaceFree]: true };
        }
        
    }

    public isNameDuplicate(nameControl: AbstractControl, namespaceService: NamespaceService, id: string): Promise<IValidationResult> {
        
        if (!id || !nameControl.value) return Promise.resolve(null);
        
        var svc = namespaceService.isNameDuplicate(nameControl.value, id);                            
        var p = new Promise<IValidationResult>(resolve => {
            svc.subscribe(isDuplicate => {
                resolve(isDuplicate ? {[NamespaceValidationService.nameNotUnique] : true}: null);                                
            });            
        });  
        
        return p;
    }
    
    
    public getValidatorErrorMessage(code: string): string {
        let config: any = {
            [NamespaceValidationService.nameNotUnique]: "This namespace name is already in use",
            [NamespaceValidationService.nameSpaceFree]: "The name cannot contain spaces"
        };
        return config[code] ||  super.getValidatorErrorMessage(code);
    }

}