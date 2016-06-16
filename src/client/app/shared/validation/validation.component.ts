import { Component, Input } from '@angular/core';
import { IFormValidationResult } from './validation.service';


@Component({
    selector: 'validation',
    templateUrl: 'app/shared/validation/validation.component.html',
    providers: []
})
export class ValidationComponent {
    @Input() validationMessages: IFormValidationResult[];     
}