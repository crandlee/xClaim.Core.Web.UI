import { Component, Input } from '@angular/core';
import { IFormValidationResult } from './validation.service';


@Component({
    moduleId: module.id,
    selector: 'validation',
    templateUrl: 'validation.component.html',
    providers: []
})
export class ValidationComponent {
    @Input() validationMessages: IFormValidationResult[];     
}