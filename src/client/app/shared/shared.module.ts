import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OrderByPipe } from './pipe/orderby.pipe';
import { ValidationComponent } from './validation/validation.component';
import { ValidationService } from './validation/validation.service';
import { TableModule } from './table/table.module';
import { FilterModule } from './filtering/filter.module';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TableModule, FilterModule],
  declarations: [OrderByPipe, ValidationComponent],
  exports: [CommonModule, FormsModule, ReactiveFormsModule, OrderByPipe, ValidationComponent]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [ValidationService]
    };
  }
}