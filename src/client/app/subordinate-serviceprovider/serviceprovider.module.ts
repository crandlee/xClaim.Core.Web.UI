import { NgModule } from '@angular/core';
import { ServiceProviderListComponent, ServiceProviderComponent, ServiceProviderFilterComponent, ServiceProviderService, ServiceProviderFilterService, ServiceProviderValidationService } from './index';
import { AccordionModule, DatepickerModule } from 'ng2-bootstrap/ng2-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule , ReactiveFormsModule} from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { EntityValuesModule } from '../subordinate-entityvalues/entityValues.module';

@NgModule({
  imports: [CommonModule, FormsModule, SharedModule, ReactiveFormsModule, AccordionModule, DatepickerModule, EntityValuesModule],
  declarations: [ServiceProviderComponent, ServiceProviderFilterComponent, ServiceProviderListComponent],
  exports: [],
  providers: [ServiceProviderService, ServiceProviderFilterService, ServiceProviderValidationService]
})
export class ServiceProviderModule { }