import { NgModule } from '@angular/core';
import { MemberListComponent, MemberComponent, MemberFilterComponent, MemberService, MemberFilterService, MemberValidationService } from './index';
import { AccordionModule, DatepickerModule } from 'ng2-bootstrap/ng2-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EntityValuesModule } from '../subordinate-entityvalues/entityValues.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AccordionModule, DatepickerModule, SharedModule, EntityValuesModule],
  declarations: [MemberComponent, MemberFilterComponent, MemberListComponent],
  exports: [],
  providers: [MemberService, MemberFilterService, MemberValidationService]
})
export class MemberModule { }