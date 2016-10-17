import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionModule } from 'ng2-bootstrap/ng2-bootstrap';
import { FilterComponent } from './filter.component';
import { FilterService } from './filter.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared.module';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AccordionModule, SharedModule],
  declarations: [FilterComponent],
  exports: [],
  providers: []
})
export class FilterModule { }