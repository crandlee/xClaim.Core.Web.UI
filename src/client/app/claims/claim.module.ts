import { NgModule } from '@angular/core';
import { ClaimListComponent, ClaimComponent, ClaimFilterComponent, ClaimService, ClaimFilterService } from './index';
import { AccordionModule, DatepickerModule } from 'ng2-bootstrap/ng2-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [CommonModule, FormsModule, RouterModule, ReactiveFormsModule, AccordionModule, DatepickerModule, SharedModule],
  declarations: [ClaimComponent, ClaimFilterComponent, ClaimListComponent],
  exports: [],
  providers: [ClaimService, ClaimFilterService]
})
export class ClaimModule { }