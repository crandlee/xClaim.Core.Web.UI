import { Component, Input, SimpleChange } from '@angular/core';
import { IFormValidationResult } from './validation.service';
import { BusyService } from '../service/busy.service';

@Component({
    moduleId: module.id,
    selector: 'validation',
    templateUrl: 'validation.component.html',
    providers: []
})
export class ValidationComponent {
    @Input() validationMessages: IFormValidationResult[];     

    public isBusy: boolean = false;
    public hasValidationMessages = false;
    public get isVisible(): boolean {
        return this.hasValidationMessages && !this.isBusy
    } 

    constructor(private busyService: BusyService) {
        this.busyService.notifyBusy$.subscribe(isBusy => {
            this.isBusy = (isBusy > 0) ;
        });
    }

    ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
        this.hasValidationMessages = this.validationMessages && this.validationMessages.length > 0;        
    }
}