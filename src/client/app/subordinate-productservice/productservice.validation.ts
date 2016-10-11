import { ValidationService, IValidationOptions, IFormValidationResult, IValidationResult } from '../shared/validation/validation.service';
import { LoggingService, TraceMethodPosition } from '../shared/logging/logging.service';
import { FormControl, FormGroup, AbstractControl, ValidatorFn, AsyncValidatorFn } from '@angular/forms';
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