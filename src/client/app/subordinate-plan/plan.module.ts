import { NgModule } from '@angular/core';
import { PlanListComponent, PlanComponent, PlanFilterComponent, PlanService, PlanFilterService, PlanValidationService } from './index';
import { AccordionModule, DatepickerModule } from 'ng2-bootstrap/ng2-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  imports: [CommonModule, FormsModule, SharedModule, ReactiveFormsModule, AccordionModule, DatepickerModule],
  declarations: [PlanComponent, PlanFilterComponent, PlanListComponent],
  exports: [],
  providers: [PlanService, PlanFilterService, PlanValidationService]
})
export class PlanModule { }