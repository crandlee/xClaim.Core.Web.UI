import { ValidationService, IValidationOptions, IFormValidationResult, IValidationResult } from '../shared/validation/validation.service';
import { LoggingService, TraceMethodPosition } from '../shared/logging/logging.service';
import { Control, ControlGroup, AbstractControl } from '@angular/common';
import { ValidatorFn, AsyncValidatorFn } from '@angular/common/src/forms/directives/validators';
import { ProductServiceService } from './productservice.service';
import 'rxjs/add/operator/toPromise';

export class ProductServiceValidationService extends ValidationService {
    

    constructor() {
        super();
    }
    

    public getValidatorErrorMessage(code: string): string {
        let config: any = {
        };
        return config[code] ||  super.getValidatorErrorMessage(code);
    }

}