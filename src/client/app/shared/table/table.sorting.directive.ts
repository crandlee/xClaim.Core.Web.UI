import {Directive, EventEmitter, Input, Output, HostListener} from '@angular/core';
import { INgTableColumn, INgTableConfig } from './table.component';

@Directive({selector: '[ngTableSorting]'})
export class NgTableSortingDirective {
  @Input() public ngTableSorting:INgTableConfig;
  @Input() public column:INgTableColumn;
  @Output() public sortChanged:EventEmitter<INgTableColumn> = new EventEmitter<INgTableColumn>();

  @Input()
  public get config():INgTableConfig {
    return this.ngTableSorting;
  }

  public set config(value:INgTableConfig) {
    this.ngTableSorting = value;
  }

  private static clearOtherColumnSorts(config: INgTableConfig, column: INgTableColumn):void {
    config.sorting.columns = config.sorting.columns.map(c => {
      if (c.name !== column.name) c.sort = "";
      return c;
    });
  }

  @HostListener('click', ['$event', '$target'])
  public onToggleSort(event:any):void {

    if (event) event.preventDefault();
    
    NgTableSortingDirective.clearOtherColumnSorts(this.config, this.column);
    if (this.column.editRow || this.column.deleteRow) return;
    
    if (this.ngTableSorting && this.column) {
      switch (this.column.sort) {
        case 'asc':
          this.column.sort = 'desc';
          break;
        case 'desc':
          this.column.sort = 'asc';
          break;
        default:
          this.column.sort = 'asc';
          break;
      }
      
      this.sortChanged.emit(this.column);
    }
  }
}