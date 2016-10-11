import { NgModule } from '@angular/core';
import { NgTableComponent } from './table.component';
import { NgTableSortingDirective } from './table.sorting.directive';
import { CommonModule } from '@angular/common';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';

@NgModule({
  imports: [CommonModule, Ng2Bs3ModalModule],
  declarations: [NgTableSortingDirective, NgTableComponent],
  exports: [NgTableSortingDirective, NgTableComponent],
  providers: []
})
export class TableModule { }