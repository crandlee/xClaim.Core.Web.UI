///<reference path="../../../../../typings/jquery/jquery.d.ts" />
///<reference path="../../../../../typings/bootstrap/bootstrap.d.ts"/>

import {Component, EventEmitter, Input, Output, ViewContainerRef} from '@angular/core';
import {CORE_DIRECTIVES, NgClass} from '@angular/common';
import {NgTableSortingDirective} from './table.sorting.directive';
import {Modal, BS_MODAL_PROVIDERS} from 'angular2-modal/plugins/bootstrap/index';
import 'jquery';
import 'bootstrap';
import * as moment from 'moment';

@Component({
  moduleId: module.id,
  selector: 'ng-table',
  styleUrls: ['table.component.css'],
  templateUrl: 'table.component.html',
  directives: [NgTableSortingDirective, NgClass, CORE_DIRECTIVES],
  viewProviders: [...BS_MODAL_PROVIDERS]
})
export class NgTableComponent {

  private _columns: INgTableColumn[] = [];
  public rowSelected: { [key:string]: boolean } = {};

  constructor(public modal: Modal, viewContainer: ViewContainerRef) {
    modal.defaultViewContainer = viewContainer;

  }

  // Table values
  public rows: INgTableRow[] = [];
  @Input() public config: INgTableConfig = { sorting: { columns: []} }

  @Input() public rowTemplate: string = "";
  @Input() public tooltipTemplate: string = `<div class="tooltip tooltip-custom">
                  <div class="tooltip-arrow tooltip-arrow-custom"></div>
                  <div class="tooltip-inner tooltip-inner-custom"></div>
                </div>`;

  // Outputs (Events)
  @Output() public tableChanged: EventEmitter<INgTableConfig> = new EventEmitter<INgTableConfig>();
  @Output() public deleteClicked: EventEmitter<INgTableRow> = new EventEmitter<INgTableRow>();
  @Output() public editClicked: EventEmitter<INgTableRow> = new EventEmitter<INgTableRow>();

  @Input()
  public set columns(values: INgTableColumn[]) {
    values.forEach((value: any) => {
      let column = this._columns.find((col: any) => col.name === value.name);
      if (column) {
        Object.assign(column, value);
      }
      if (!column) {
        this._columns.push(value);
      }
    });
  }
  public get columns(): INgTableColumn[] {
    return this._columns;
  }

  public clearHighlight(): void {
      this.rowSelected = {};
  }

  public highlight(id: string) {
      this.rowSelected[id] = true;
  }

  public unhighlight(id: string) {
      this.rowSelected[id] = false;
  }
  
  public getRowTooltip(row: INgTableRow): string {
    var id = "R" + row.id;
    if (!this.tooltipTemplate) return id;
    jQuery('#' + id).tooltip({
      delay: { show: 500, hide: 10 },
      placement: 'top',
      html: true,
      template: this.tooltipTemplate,
      title: (row && row.tooltipMessage) ? row.tooltipMessage : ""
    });
    return id;
  }

  public getColumnClass(column: any) {
    return `col-xs-${column.colWidth}`;
  }


  public onRowClick(event: any, row: INgTableRow) {
    if (this.config.selectOn) {
      this.config.selectOn(row.id);
      this.highlight(row.id);
    }
  }

  public onEditClick(event: any, row: INgTableRow, column: INgTableColumn) {
    event.preventDefault();
    event.stopPropagation();
    this.editClicked.emit(row);
  }

  public onDeleteClick(event: any, row: INgTableRow, column: INgTableColumn) {
    event.preventDefault();
    event.stopPropagation();
    var msg = "Do you really want to delete this item?";
    if (column.deleteMessage) msg = column.deleteMessage;
    var box = this.modal.confirm().isBlocking(true).size('sm').message(msg).open();
    box.then(resultPromise => {
      return resultPromise.result.then((result) => {
        this.deleteClicked.emit(row);
      }, cancel => {});
    });

  }

  public get configColumns(): { columns: INgTableColumn[] } {
    let sortColumns: INgTableColumn[] = [];
    this.columns.forEach((column: any) => {
      if (column.sort) {
        sortColumns.push(column);
      }
    });

    return { columns: sortColumns };
  }


  public changeSortEvent() {
      this.rows =  this.changeSort(this.rows, this.config);
  } 

  public changeTableEvent(tableChangedMessage: INgTableChangeMessage): void {
    this.rows = this.changeSort(tableChangedMessage.rows, tableChangedMessage.config);
  }


  public getData(row: INgTableRow, propertyName: string): string {
    var val = propertyName.split('.').reduce((prev: any, curr: string) => prev[curr], row);
    var colDef = this._columns.find(c => c.name == propertyName);
    if (colDef && colDef.transformBool) {
      val = colDef.transformBool(val);
    }
    if (colDef && colDef.transformString) {
      val = colDef.transformString(val);
    }
    if (colDef && colDef.dateFormat) {
      val = moment(Date.parse(val)).format(colDef.dateFormat);
    }
    return val;
  }


  private getSortedColumn(config: INgTableConfig): { columnName: string, sort: string, isDate: boolean } {

    let columns = config.sorting.columns || [];
    let columnName: string = void 0;
    let sort: string = void 0;
    var isDate: boolean = false;
    for (let i = 0; i < columns.length; i++) {
      if (columns[i].sort) {
        columnName = columns[i].name;
        isDate = columns[i].isDate;
        sort = columns[i].sort;
      }
    }
    return { columnName: columnName, sort: sort, isDate: isDate }
  }

  public changeSort(data: INgTableRow[], config: INgTableConfig): INgTableRow[] {

    if (!config.sorting) return data;

    var sortedColumn = this.getSortedColumn(config);
    if (!sortedColumn.columnName) return data;

    // simple sorting
    var sorted = data.sort((previous: any, current: any) => {
      
      var prev = previous[sortedColumn.columnName];
      var curr = current[sortedColumn.columnName];
      if (prev === null) prev = "";    
      if (curr === null) curr = "";      
      if (typeof curr === 'string') curr = curr.toLowerCase();
      if (typeof prev === 'string') prev = prev.toLowerCase();
      if (sortedColumn.isDate) curr = new Date(curr);
      if (sortedColumn.isDate) prev = new Date(prev);
      var ret = 0;
      if (prev > curr) {
        ret = sortedColumn.sort === 'desc' ? -1 : 1;
      } else if (prev < curr) {
        ret = sortedColumn.sort === 'asc' ? -1 : 1;
      }      
      return ret;
    });

    return sorted;
  }

  public load(message: INgTableChangeMessage): void {

      this.changeTableEvent(message);
  }  

}


export interface INgTableColumn {
  title: string;
  name: string;
  colWidth?: number;
  sort?: "asc" | "desc" | "";
  transformBool?: (trans: boolean) => string;
  transformString?: (trans: string) => string;
  dateFormat?: string;
  isDate?: boolean;
  editRow?: boolean;
  deleteRow?: boolean;
  deleteMessage?: string;
}

export interface INgTableConfig {
  sorting: { columns: INgTableColumn[] };
  selectOn?: (id: string) => void;
  deleteOn?: (id: string) => boolean;
  readOnly?: boolean;
}

export interface INgTableRow {
  id: string;
  tooltipMessage?: string;
}

export interface INgTableChangeMessage {
  rows: INgTableRow[];
  config: INgTableConfig;
}