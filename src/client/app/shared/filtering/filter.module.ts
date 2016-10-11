import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionModule } from 'ng2-bootstrap/ng2-bootstrap';
import { FilterComponent } from './filter.component';
import { FilterService } from './filter.service';
import { OffClickDirective } from '../off-click/off-click.directive';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AccordionModule],
  declarations: [FilterComponent, OffClickDirective],
  exports: [],
  providers: []
})
export class FilterModule { }