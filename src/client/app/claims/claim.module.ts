import { NgModule } from '@angular/core';
import { ClaimListComponent, ClaimComponent, ClaimFilterComponent, ClaimService, ClaimFilterService } from './index';
import { AccordionModule, DatepickerModule } from 'ng2-bootstrap/ng2-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [FormsModule, ReactiveFormsModule, AccordionModule, DatepickerModule],
  declarations: [ClaimComponent, ClaimFilterComponent, ClaimListComponent],
  exports: [],
  providers: [ClaimService, ClaimFilterService]
})
export class ClaimModule { }