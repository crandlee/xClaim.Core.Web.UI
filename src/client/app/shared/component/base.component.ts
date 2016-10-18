import { Component } from '@angular/core';
import { TraceMethodPosition } from '../index';
import { BaseService } from '../service/base.service';
import { FormGroup, FormControl, ValidatorFn, AsyncValidatorFn } from '@angular/forms';
import * as _ from 'lodash';

export class XCoreBaseComponent  {
    
    protected classTrace: (methodName: string) => (methodPosition: TraceMethodPosition, extraMessage?: string) => void;

    constructor(protected baseService: BaseService) {
        this.classTrace = this.baseService.loggingService.getTraceFunction("UnspecifiedService");
     }
    
    protected initializeTrace(className: string) {
        this.classTrace = this.baseService.loggingService.getTraceFunction(className);
    }

    // protected setFormFromViewModel(form: FormGroup, viewModel: any): void {
    //     if (form && form.controls) {
    //         _.forOwn(form.controls, (ctl, key) => {
    //             var val = _.get(viewModel, key);
    //             var obj = {}; obj[key] = _.get(viewModel, key);
    //             form.patchValue(obj);
    //         });
    //     }
    // }

    protected setControlProperties(form: FormGroup, name: string, description: string, syncValidator: ValidatorFn = null, asyncValidator: AsyncValidatorFn = null) {
        if (syncValidator !== null) form.controls[name].validator = syncValidator;
        if (asyncValidator !== null) form.controls[name].asyncValidator = asyncValidator;
        form.controls[name]['description'] = description;
    }


    // protected setViewModelFromForm(form: FormGroup, viewModel: any, exceptions: string[] = []): void {
    //     if (form && form.controls) {
    //         _.forOwn(form.controls, (ctl, key) => {
    //             if (_.indexOf(exceptions, key) === -1) {} _.set(viewModel, key, ctl.value);
    //         });
    //     }
    // }

    protected NotifyLoaded(componentName: string) {                            
        this.baseService.loggingService.info(`Component: ${componentName}`, { noToast: true });
        this.baseService.loggingService.info(`Route: ${this.baseService.router.serializeUrl(this.baseService.router.parseUrl(this.baseService.router.url)) || "root"}`, { noToast: true });            
    }
              
}


