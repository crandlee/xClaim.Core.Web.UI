import { Component } from '@angular/core';
import { TraceMethodPosition } from '../index';
import { BaseService } from '../service/base.service';

export class XCoreBaseComponent  {
    
    protected classTrace: (methodName: string) => (methodPosition: TraceMethodPosition, extraMessage?: string) => void;

    constructor(protected baseService: BaseService) {
        this.classTrace = this.baseService.loggingService.getTraceFunction("UnspecifiedService");
     }
    
    protected initializeTrace(className: string) {
        this.classTrace = this.baseService.loggingService.getTraceFunction(className);
    }

    protected NotifyLoaded(componentName: string) {                            
        this.baseService.loggingService.info(`Component: ${componentName}`, { noToast: true });
        this.baseService.loggingService.info(`Route: ${this.baseService.router.serializeUrl(this.baseService.router.parseUrl(this.baseService.router.url)) || "root"}`, { noToast: true });            
    }
              
}


