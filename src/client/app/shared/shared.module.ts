import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OrderByPipe } from './pipe/orderby.pipe';
import { ValidationComponent } from './validation/validation.component';
import { ValidationService } from './validation/validation.service';
import { TableModule } from './table/table.module';
import { FilterModule } from './filtering/filter.module';
import { OffClickDirective } from './off-click/off-click.directive';
import { UiSwitchModule } from 'angular2-ui-switch'
import { BaseService } from './service/base.service';
import { AppSettings } from '../appsettings';
import { CookieService } from 'angular2-cookie/core';
import { ScrollService, LoggingService, XCoreToastService, HubService, BusyService, DropdownService} from './index';

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TableModule, UiSwitchModule],
  declarations: [OrderByPipe, ValidationComponent, OffClickDirective],
  exports: [CommonModule, FormsModule, ReactiveFormsModule, OrderByPipe, ValidationComponent, TableModule, OffClickDirective, UiSwitchModule]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [ValidationService, BaseService, AppSettings, CookieService, LoggingService, XCoreToastService, HubService, BusyService, ScrollService, DropdownService ]
    };
  }
}