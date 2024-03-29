import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserComponent, UserProfileComponent, UserListComponent, UserFilterComponent, UserClaimsComponent, 
    UserService, ClaimDefinitionsService, UserFilterService, UserProfileValidationService } from './index';
import { AccordionModule, DatepickerModule } from 'ng2-bootstrap/ng2-bootstrap';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  imports: [CommonModule, AccordionModule, SharedModule, DatepickerModule, FormsModule],
  declarations: [UserComponent, UserProfileComponent, UserFilterComponent, UserListComponent, UserClaimsComponent],
  exports: [],
  providers: [UserService, UserFilterService, ClaimDefinitionsService, UserProfileValidationService]
})

export class UserModule { }