import { Component, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { Observable } from 'rxjs';
import { TraceMethodPosition, IDataService, ICollectionViewModel, BaseService,
    IFilterDefinition, IFilterService, INgTableColumn, INgTableConfig, INgTableRow, INgTableChangeMessage, NgTableComponent } from '../index';
import { XCoreBaseComponent } from './base.component';

import * as _ from 'lodash';

export abstract class XCoreListComponent<TModel, TViewModel extends INgTableRow, TFilterToServer, TFilterToClient extends ICollectionViewModel<TViewModel>> extends XCoreBaseComponent  {
    
    protected serviceSubscription: Subscription = null;
    public dataViewModel: ICollectionViewModel<TViewModel> = { RowCount:0, Rows:[] };

    public columns: INgTableColumn[] = [];

    public tableConfig: INgTableConfig = {
        sorting: { columns: [] }
    }
    private filterService: IFilterService<TFilterToServer, TFilterToClient>;
    private dataService: IDataService<TModel, TViewModel, TFilterToServer, TFilterToClient>;
    tableComponent: NgTableComponent;

    constructor(protected baseService: BaseService) {
        super(baseService);
        this.classTrace = this.baseService.loggingService.getTraceFunction("XCoreListComponent");

        //Unsubscribe from the infinite stream when when change routes
        this.baseService.router.changes.subscribe(val => {            
            if (this.serviceSubscription) {
                this.serviceSubscription.unsubscribe();
                this.serviceSubscription = null;
            }
        });

     }

    protected initializeWith(columns: INgTableColumn[], 
        filterService: IFilterService<TFilterToServer, TFilterToClient>, 
        dataService: IDataService<TModel, TViewModel, TFilterToServer, TFilterToClient>) {
        this.columns = columns;
        this.tableConfig = { sorting: {columns: columns }};
        this.filterService = filterService;
        this.dataService = dataService;
    }

    protected performStartup(currentViewModel: ICollectionViewModel<TViewModel>,
        tableComponent: NgTableComponent,
        tableConfig: INgTableConfig,
        filterService: IFilterService<TFilterToServer, TFilterToClient>, 
        service: IDataService<TModel, TViewModel, TFilterToServer, TFilterToClient>): void {

        var trace = this.classTrace("performStartup");
        trace(TraceMethodPosition.Entry);
        filterService.initializeFilter().subscribe(filter => {
            trace(TraceMethodPosition.Callback);
            currentViewModel.Rows = [];
            this.loadFirstData(currentViewModel, tableComponent, tableConfig, filter, service);
            this.subscribeToFilterChanged(currentViewModel, tableComponent, tableConfig, filterService, service);
        });

        trace(TraceMethodPosition.Exit);
    }

    private subscribeToFilterChanged(currentViewModel: ICollectionViewModel<TViewModel>,
        tableComponent: NgTableComponent, 
        tableConfig: INgTableConfig,
        filterService: IFilterService<TFilterToServer, TFilterToClient>,         
        service: IDataService<TModel, TViewModel, TFilterToServer, TFilterToClient>) {

        var trace = this.classTrace("subscribeToFilterChanged");
        trace(TraceMethodPosition.Entry);
        filterService.FilterUpdatedEvent.subscribe(filter => {
            trace(TraceMethodPosition.Callback);
            currentViewModel.Rows = [];
            this.loadFirstData(currentViewModel, tableComponent, tableConfig, filter, service);
        });
        trace(TraceMethodPosition.Exit);
    }    

    private loadFirstData(currentViewModel: ICollectionViewModel<TViewModel>,
        tableComponent: NgTableComponent,      
        tableConfig: INgTableConfig,
        filter: IFilterDefinition<TFilterToServer, TFilterToClient>, 
        service: IDataService<TModel, TViewModel, TFilterToServer, TFilterToClient>): void {

        var trace = this.classTrace("loadFirstData");
        trace(TraceMethodPosition.Entry);

        currentViewModel.Rows = currentViewModel.Rows.concat(filter.toClientFilter.Rows);
        currentViewModel.RowCount = filter.toClientFilter.RowCount;
        var msg: INgTableChangeMessage = { rows: currentViewModel.Rows, config: tableConfig };
        tableComponent.load(msg);

        //Subscribe to infinite scroll
        if (this.serviceSubscription) this.serviceSubscription.unsubscribe();      
        this.serviceSubscription = this.baseService.scrollService.ScrollNearBottomEvent.subscribe(si => {
            if (currentViewModel.Rows.length >= currentViewModel.RowCount) return;
            service.get(currentViewModel.Rows.length, this.baseService.appSettings.DefaultPageSize, filter.toServerFilter).subscribe(data => {
                currentViewModel.Rows = currentViewModel.Rows.concat(data.Rows);
                currentViewModel.RowCount = data.RowCount;                
                tableComponent.load({ rows: currentViewModel.Rows, config: tableConfig });
                this.baseService.scrollService.checkNearBottom();
            });                                     
        });
        this.baseService.scrollService.checkNearBottom();
        trace(TraceMethodPosition.Exit);
    }


    protected initialize(tableComponent: NgTableComponent) {
        var trace = this.classTrace("initializing");        
        trace(TraceMethodPosition.Entry);
        this.tableComponent = tableComponent;
        this.baseService.hubService.callbackWhenLoaded(this.performStartup.bind(this,
            this.dataViewModel,
            this.tableComponent,
            this.tableConfig,  
            this.filterService, 
            this.dataService));

        trace(TraceMethodPosition.Exit);
    }

}