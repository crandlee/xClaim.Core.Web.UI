import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionModule } from 'ng2-bootstrap/ng2-bootstrap';
import { WelcomeComponent } from './welcome.component';

@NgModule({
  imports: [CommonModule, AccordionModule],
  declarations: [WelcomeComponent],
  exports: [],
  providers: []
})
export class WelcomeModule { }