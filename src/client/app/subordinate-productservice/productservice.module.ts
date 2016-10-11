import { NgModule } from '@angular/core';
import { ProductServiceListComponent, ProductServiceComponent, ProductServiceFilterComponent, ProductServiceService, ProductServiceFilterService, ProductServiceValidationService } from './index';
import { AccordionModule, DatepickerModule } from 'ng2-bootstrap/ng2-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  imports: [CommonModule, FormsModule, SharedModule, ReactiveFormsModule, AccordionModule, DatepickerModule],
  declarations: [ProductServiceComponent, ProductServiceFilterComponent, ProductServiceListComponent],
  exports: [],
  providers: [ProductServiceService, ProductServiceFilterService, ProductServiceValidationService]
})
export class ProductServiceModule { }