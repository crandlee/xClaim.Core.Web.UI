import { Component, ViewChild } from '@angular/core';
import { Subscription, Observable } from 'rxjs';

import { ActivatedRoute, NavigationStart } from '@angular/router';

import { TraceMethodPosition, IDataService, ICollectionViewModel, BaseService,
    IFilterDefinition, IFilterService, INgTableColumn, INgTableConfig, INgTableRow, INgTableChangeMessage, NgTableComponent } from '../index';
import { XCoreBaseComponent } from './base.component';
import * as _ from 'lodash';

export class XCoreListComponent<TModel, TViewModel extends INgTableRow, TFilterToServer, TFilterToClient extends ICollectionViewModel<TViewModel>> extends XCoreBaseComponent  {
    
    protected serviceSubscription: Subscription = null;
    public dataViewModel: ICollectionViewModel<TViewModel> = { rowCount:0, rows:[] };

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

        this.baseService.router.events.subscribe(event => {

            //Unsubscribe from the infinite stream when when change routes
            if (event instanceof NavigationStart && this.serviceSubscription) {
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
            currentViewModel.rows = [];
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
        filterService.filterUpdatedEvent.subscribe(filter => {
            trace(TraceMethodPosition.Callback);
            currentViewModel.rows = [];
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

        currentViewModel.rows = currentViewModel.rows.concat(filter.toClientFilter.rows);
        currentViewModel.rowCount = filter.toClientFilter.rowCount;
        var msg: INgTableChangeMessage = { rows: currentViewModel.rows, config: tableConfig };
        tableComponent.load(msg);

        //Subscribe to infinite scroll
        if (this.serviceSubscription) this.serviceSubscription.unsubscribe();      
        this.serviceSubscription = this.baseService.scrollService.ScrollNearBottomEvent.subscribe(si => {
            if (currentViewModel.rows.length >= currentViewModel.rowCount) return;
            service.get(currentViewModel.rows.length, this.baseService.appSettings.DefaultPageSize, filter.toServerFilter).subscribe(data => {
                currentViewModel.rows = currentViewModel.rows.concat(data.rows);
                currentViewModel.rowCount = data.rowCount;                
                tableComponent.load({ rows: currentViewModel.rows, config: tableConfig });
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