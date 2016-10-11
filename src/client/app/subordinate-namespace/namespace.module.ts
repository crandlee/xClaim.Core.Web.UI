import { NgModule } from '@angular/core';
import { NamespaceListComponent, NamespaceComponent, NamespaceFilterComponent, NamespaceService, NamespaceFilterService, 
  NamespaceValidationService,  DefaultValuesComponent, DefaultValuesService } from './index';
import { AccordionModule, DatepickerModule } from 'ng2-bootstrap/ng2-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  imports: [CommonModule, FormsModule, SharedModule, ReactiveFormsModule, AccordionModule, DatepickerModule],
  declarations: [NamespaceComponent, NamespaceFilterComponent, NamespaceListComponent, DefaultValuesComponent],
  exports: [],
  providers: [NamespaceService, NamespaceFilterService, NamespaceValidationService, DefaultValuesService]
})
export class NamespaceModule { }