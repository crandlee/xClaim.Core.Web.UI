import { NgModule } from '@angular/core';
import { DropdownModule, CollapseModule } from 'ng2-bootstrap/ng2-bootstrap';
import { SecurityComponent } from './security.component';
import { SecurityService } from './security.service';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared.module';

@NgModule({
  imports: [CommonModule, SharedModule, DropdownModule, CollapseModule],
  declarations: [SecurityComponent],
  exports: [],
  providers: [SecurityService]
})
export class SecurityModule { }