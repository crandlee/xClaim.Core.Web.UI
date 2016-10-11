import { Component, ViewChild, Renderer } from '@angular/core';
import { FilterComponent } from '../shared/filtering/filter.component';
import { ClaimFilterService, IClaimsToServerFilter } from './claim.filter.service';
import { BaseService } from '../shared/service/base.service';
import { IClaimsToClientFilter } from './claim.service';
import * as moment from 'moment';

@Component({
    moduleId: module.id,
    selector: "claimfilter",
    styleUrls: ['claim.filter.component.css'],
    templateUrl: 'claim.filter.component.html'
})
export class ClaimFilterComponent extends FilterComponent<IClaimsToServerFilter, IClaimsToClientFilter> {
    
    @ViewChild('dateOfServiceStart') focusRef: any;
    public self:FilterComponent<IClaimsToServerFilter, IClaimsToClientFilter> = this;
    public showServiceStartPicker: boolean = false;
    public showServiceEndPicker: boolean = false;
    public showStartPicker: boolean = false;
    public showEndPicker: boolean = false;

    public startServiceInvalid: boolean = false;
    public endServiceInvalid: boolean = false;
    public startInvalid: boolean = false;
    public endInvalid: boolean = false;

    private isDate(dateString: string): boolean {
        var date = new Date(dateString);
        return date instanceof Date && !isNaN(date.valueOf())
    }

    get StartServiceDateString(): string {
        if (this.toServerFilter.dateOfServiceStart)
            return moment.utc(this.toServerFilter.dateOfServiceStart).format("MM/DD/YYYY");
        return null;
    }
    
    public disableApply(): boolean {
        return this.startServiceInvalid || this.endServiceInvalid || this.startInvalid || this.endInvalid;
    }

    public clearDateTexts(): void {

        this.toServerFilter.dateOfServiceStart = new Date();
        this.startServiceInvalid = false;
        this.toServerFilter.dateOfServiceEnd = new Date();
        this.endServiceInvalid = false;
        this.toServerFilter.processedStartDate = new Date();
        this.startInvalid = false;
        this.toServerFilter.processedEndDate = new Date();
        this.endInvalid = false;

    }

    private startServiceDateString(targetInput:any): void {
        this.startServiceInvalid = false;
        if (!targetInput.value) return;
        if (this.isDate(targetInput.value)) 
            this.toServerFilter.dateOfServiceStart = new Date(targetInput.value);
        else {
            this.startServiceInvalid = true;
        }
    }

    get EndServiceDateString(): string {
        if (this.toServerFilter.dateOfServiceEnd)
            return moment(this.toServerFilter.dateOfServiceEnd).format("MM/DD/YYYY");
        return null;
    }
    private endServiceDateString(targetInput:any): void {
        this.endServiceInvalid = false;
        if (!targetInput.value) return;
        if (this.isDate(targetInput.value)) 
            this.toServerFilter.dateOfServiceEnd = new Date(targetInput.value);
        else {
            this.endServiceInvalid = true;
        }
    }

    get StartDateString(): string {
        if (this.toServerFilter.processedStartDate)
            return moment(this.toServerFilter.processedStartDate).format("MM/DD/YYYY hh:mm:ss a");
        return null;
    }
    private startDateString(targetInput:any): void {
        this.startInvalid = false;
        if (!targetInput.value) return;
        if (this.isDate(targetInput.value)) 
            this.toServerFilter.processedStartDate = new Date(targetInput.value);
        else {
            this.startInvalid = true;
        }
            
    }

    get EndDateString(): string {
        if (this.toServerFilter.processedEndDate)
            return moment.utc(this.toServerFilter.processedEndDate).format("MM/DD/YYYY hh:mm:ss a");
        return null;
    }
    private endDateString(targetInput:any): void {
        this.endInvalid = false;
        if (!targetInput.value) return;
        if (this.isDate(targetInput.value)) 
            this.toServerFilter.processedEndDate = new Date(targetInput.value);
        else {
            this.endInvalid = true;
        }
    }
    
    constructor(protected baseService: BaseService, private claimFilterService: ClaimFilterService, private renderer: Renderer) {

        super(baseService, claimFilterService);
        
    }

    public toggleServiceStart(): void {
        this.showServiceStartPicker = !this.showServiceStartPicker;
    }

    public hideServiceStart(): void {
        this.showServiceStartPicker = false;
    }

    public toggleServiceEnd(): void {
        this.showServiceEndPicker = !this.showServiceEndPicker;
    }

    public hideServiceEnd(): void {
        this.showServiceEndPicker = false;
    }

    public toggleStart(): void {
        this.showStartPicker = !this.showStartPicker;
    }

    public hideStart(): void {
        this.showStartPicker = false;
    }

    public toggleEnd(): void {
        this.showEndPicker = !this.showEndPicker;
    }

    public hideEnd(): void {
        this.showEndPicker = false;
    }
    
    ngOnInit() {

    }

}

