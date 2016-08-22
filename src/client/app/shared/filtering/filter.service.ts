import { Injectable } from '@angular/core';
import { TraceMethodPosition, BaseService } from '../index';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

@Injectable()
export abstract class FilterService<TFilterToServer, TFilterToClient> implements IFilterService<TFilterToServer, TFilterToClient> {

    public setupObject: IFilterSetupObject<TFilterToServer, TFilterToClient>;

    public currentFilter: IFilterDefinition<TFilterToServer, TFilterToClient>;
    public componentOptions: IComponentOptions = { autoApplyFilter: false, applyDelayOnAutoFilter: 2000, otherComponentOptions: {} };
    public setupCalled: boolean = false;
    public idListMappings: IFilterIdListMapping[];
    protected emptyFilterDefinition: () => IFilterDefinition<TFilterToServer, TFilterToClient>;

    private setupCalledSource = new Subject<boolean>();    
    public setupCalledEvent = this.setupCalledSource.asObservable().share();
    private initializeCalledSource = new Subject<IFilterDefinition<TFilterToServer, TFilterToClient>>();    
    public initializeCalledEvent = this.initializeCalledSource.asObservable().share();

    private filterUpdatedSource = new Subject<IFilterDefinition<TFilterToServer, TFilterToClient>>();
    public filterUpdatedEvent = this.filterUpdatedSource.asObservable().share();

    constructor(protected baseService: BaseService) {
                
        baseService.initializeTrace("FilterService");               
        var trace = baseService.classTrace("constructor");        
        trace(TraceMethodPosition.Entry);
        
        trace(TraceMethodPosition.Exit);
        
    }

    protected initialize(context: FilterService<TFilterToServer, TFilterToClient>,
                              emptyFilterDefinition: () => IFilterDefinition<TFilterToServer, TFilterToClient>,
                              initialComponentOptions: IComponentOptions,
                              idListMappings: IFilterIdListMapping[],
                              initializeFilter: () => Observable<TFilterToClient>,
                              filterSummaryFunction: (filter: IFilterDefinition<TFilterToServer, TFilterToClient>) => string,
                              filterResetFunction: (serverFilter: TFilterToServer) => Observable<IFilterDefinition<TFilterToServer, TFilterToClient>>,
                              applyFilterFunction: (serverFilter: TFilterToServer) => Observable<IFilterDefinition<TFilterToServer, TFilterToClient>>
                              ) {
        var trace = this.baseService.classTrace("initializeSetup");        
        trace(TraceMethodPosition.Entry);

        var setupObject: IFilterSetupObject<TFilterToServer, TFilterToClient> = {
            componentOptions: initialComponentOptions,
            idListMappings: idListMappings,
            filterSummaryFunction: filterSummaryFunction.bind(context),
            initializeFilterFunction: initializeFilter.bind(context),
            filterResetFunction: filterResetFunction.bind(context),
            applyFilterFunction: applyFilterFunction.bind(context)
        };
        this.emptyFilterDefinition = emptyFilterDefinition;        
        this.setup(emptyFilterDefinition(), setupObject);        
        trace(TraceMethodPosition.Exit);

    }
    //This gets called by the domain component with all the functions and config data necessary to do its job
    //filterDefinition => the current toServerFilter definition

    public setup(filterDefinition: IFilterDefinition<TFilterToServer, TFilterToClient>, setupObject: IFilterSetupObject<TFilterToServer,TFilterToClient>): void {
        var trace = this.baseService.classTrace("setup");        
        trace(TraceMethodPosition.Entry);
        this.setupObject = setupObject;
        this.currentFilter = filterDefinition;
        this.componentOptions = setupObject.componentOptions;
        this.idListMappings = setupObject.idListMappings || [];
        this.setupCalledSource.next(true);
        this.setupCalled = true;
        trace(TraceMethodPosition.Exit);
    };

    public initializeFilter(): Observable<IFilterDefinition<TFilterToServer, TFilterToClient>> {
        var trace = this.baseService.classTrace("initializeFilter");        
        trace(TraceMethodPosition.Entry);        
        //This should retrieve both the client and server filter and set them on the current filter
        this.checkRequiredConfiguration();
        var obs = this.setupObject.initializeFilterFunction().share().map<IFilterDefinition<TFilterToServer, TFilterToClient>>(cf => {
            return { toServerFilter: this.currentFilter.toServerFilter, toClientFilter: cf}
        }); 
        if (!this.setupObject.initializeFilterFunction) throw "No pre-display filter behavior was defined";
        obs.subscribe((returnFilter: IFilterDefinition<TFilterToServer, TFilterToClient>) => {
            trace(TraceMethodPosition.Callback);
            if (!returnFilter) throw "Must return a valid filter object from initializeFilterFunction";
            this.currentFilter = returnFilter;
            this.initializeCalledSource.next(returnFilter);
        });
        trace(TraceMethodPosition.Exit);
        return obs;
    };

    public applyFilter(): Observable<IFilterDefinition<TFilterToServer, TFilterToClient>> {
        var trace = this.baseService.classTrace("applyFilter");        
        trace(TraceMethodPosition.Entry);        
        //This function only returns the client filter.
        this.checkRequiredConfiguration();
        if (!this.setupObject.applyFilterFunction) throw "No apply filter behavior was defined";
        if (!this.currentFilter || !this.currentFilter.toServerFilter) throw "No filter available to send to server";
        var obs = this.setupObject.applyFilterFunction(this.currentFilter.toServerFilter).share();
        
        obs.subscribe((returnFilter: IFilterDefinition<TFilterToServer, TFilterToClient>) => {
            trace(TraceMethodPosition.Callback);
            if (!returnFilter) throw "Must return a valid filter object from applyFilterFunction";
            this.currentFilter = returnFilter;
            this.filterUpdatedSource.next(returnFilter);            
        });
        
        trace(TraceMethodPosition.Exit);        
        return obs;
    };

    private checkRequiredConfiguration(): FilterService<TFilterToServer, TFilterToClient> {
        if (!this.setupObject) throw "No filter setup has been configured";
        if (!this.currentFilter) throw "No filter definition has been provided";
        return this;
    }

    public getFilterSummary() {
        var trace = this.baseService.classTrace("getFilterSummary");        
        trace(TraceMethodPosition.Entry);                
        this.checkRequiredConfiguration();
        if (!this.setupObject.filterSummaryFunction) throw "No filter summary behavior was defined";
        var ret = this.setupObject.filterSummaryFunction(this.currentFilter) || "No filter set";
        trace(TraceMethodPosition.Exit);
        return ret;
    }

    public resetFilter(): Observable<IFilterDefinition<TFilterToServer, TFilterToClient>> {
        var trace = this.baseService.classTrace("resetFilter");        
        trace(TraceMethodPosition.Entry);                
        this.checkRequiredConfiguration();
        if (!this.setupObject.filterResetFunction) throw "No filter reset behavior was defined";
        var obs = this.setupObject.filterResetFunction(this.currentFilter.toServerFilter);        
        obs.subscribe((returnFilter: IFilterDefinition<TFilterToServer, TFilterToClient>) => {
            trace(TraceMethodPosition.Callback);
            if (!returnFilter) throw "Must return a valid filter object from resetFilterFunction";
            this.currentFilter = returnFilter;
            this.filterUpdatedSource.next(returnFilter);
        });
        trace(TraceMethodPosition.Exit);
        return obs;
    }

    //*****Some helper functions for building filter summary descriptions******
    protected aggregateDescription(items: Array<any>, nameProperty: string, header: string, anded: string) {
        var aggregate = "";
        if (items.length > 0) {
            items.forEach(function (item) { aggregate += (aggregate === "" ? "" : " OR ") + item[nameProperty] });
            return anded + header + "(" + aggregate + ")";
        }
        return "";
    }

    protected selectedItems(arrList: Array<any>, idList: Array<any>, idProperty: string) {
        idProperty = idProperty || "Id";
        return (arrList && arrList.filter(function(item) { return item && idList && (idList.indexOf(item[idProperty]) > -1); })) || [];
    }
    protected addAnd(summary: string) {
        return (summary === "") ? "" : " AND ";
    }
    //*********************************************************************

    protected abstract filterSummaryFunction(filter: IFilterDefinition<TFilterToServer, TFilterToClient>): string;
    protected abstract initializeFilterFunction() : Observable<TFilterToClient>;
    protected abstract filterResetFunction (filter: TFilterToServer) : Observable<IFilterDefinition<TFilterToServer, TFilterToClient>>;
    protected abstract applyFilterFunction (filter: TFilterToServer) : Observable<IFilterDefinition<TFilterToServer, TFilterToClient>>;
    
} 

export interface IFilterIdListMapping {
    dataArrayName: string;
    idArrayName: string;    
}

export interface IFilterSetupObject<TFilterToServer, TFilterToClient> {
    componentOptions: IComponentOptions;
    idListMappings: IFilterIdListMapping[];
    initializeFilterFunction: (() =>  Observable<TFilterToClient>);
    filterSummaryFunction: ((filter: IFilterDefinition<TFilterToServer, TFilterToClient>) => string);
    filterResetFunction: ((filter: TFilterToServer) => Observable<IFilterDefinition<TFilterToServer, TFilterToClient>>);
    applyFilterFunction: ((filter: TFilterToServer) => Observable<IFilterDefinition<TFilterToServer, TFilterToClient>>);
}


export interface IFilterDefinition<TFilterToServer, TFilterToClient> {
    toClientFilter: TFilterToClient;
    toServerFilter: TFilterToServer;
}

export interface IComponentOptions {
    autoApplyFilter?: boolean;
    applyDelayOnAutoFilter?: number;
    otherComponentOptions?: Object;
}


export interface IFilterService<TFilterToServer, TFilterToClient> {
    initializeFilter(): Observable<IFilterDefinition<TFilterToServer, TFilterToClient>>;
    filterUpdatedEvent: Observable<IFilterDefinition<TFilterToServer, TFilterToClient>>;
}
