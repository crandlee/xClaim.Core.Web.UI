import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EntityValuesComponent, EntityValuesService, EntityValuesValidationService } from './index';
import { AccordionModule, DatepickerModule } from 'ng2-bootstrap/ng2-bootstrap';
import { ValidationComponent } from '../shared/validation/validation.component';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [CommonModule, AccordionModule, DatepickerModule, FormsModule, SharedModule],
  declarations: [EntityValuesComponent],
  exports: [],
  providers: [EntityValuesService, EntityValuesValidationService]
})

export class EntityValuesModule { }