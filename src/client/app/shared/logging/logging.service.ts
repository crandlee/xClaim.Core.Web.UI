import { XCoreToastService, IXCoreToastOptions } from '../xcore-toasty/xcore-toasty.service';
import { Injectable } from '@angular/core';
import { AppSettings, LogLevel } from '../../appsettings';

import * as _ from 'lodash';



@Injectable()
export class LoggingService {

    constructor(private xCoreToast: XCoreToastService, private appSettings: AppSettings) 
    {
    }
    
    public getTraceFunction(className: string):  (methodName: string) => (methodPosition: TraceMethodPosition, extraMessage?: string) => void {
        return (methodName: string) => 
                (methodPosition: TraceMethodPosition, extraMessage?: string) => {
                    var msg = `${className}::${methodName}::${TraceMethodPosition[methodPosition]}`
                    if (extraMessage) msg += `::${extraMessage}`;
                    this.trace(msg);
        }
    }   
      
    private performLogging(consolePrefix: string, toastFunc: Function, style: string, message: string, toastMessage: string, options?: IxLoggingOptions) {
        if (!options || !options.noToast) {
            if (!toastMessage) toastMessage = message;
            var toastOptions = this.setToastOptions(toastMessage, options);
            if (toastFunc) toastFunc(toastOptions);            
        }
        if (!options || !options.noConsole) {            
            console.log(`%c${consolePrefix}: ${message}`, `${style}`);
        }        
    }
    
    public error(errorMessage: any, userMessage?: string, options?: IxLoggingOptions) {
        if (this.appSettings.MinimumLogLevel > LogLevel.Error) return;
        this.performLogging("Error", this.xCoreToast.error.bind(this.xCoreToast),  'background: red; color: white', errorMessage, userMessage, options);
    }

    public success(message: any, options?: IxLoggingOptions) {
        if (this.appSettings.MinimumLogLevel > LogLevel.Success) return;
        this.performLogging("Success", this.xCoreToast.success.bind(this.xCoreToast), 'background: green; color: white', message, null, options);
    }

    public debug(message: any, options?: IxLoggingOptions) {
        //No toast for debug        
        if (this.appSettings.MinimumLogLevel > LogLevel.Debug) return;
        this.performLogging("Debug", null, 'background: black; color: white', message, null, options);        
    }

    public info(message: any, options?: IxLoggingOptions) {
        if (this.appSettings.MinimumLogLevel > LogLevel.Info) return;
        this.performLogging("Info", this.xCoreToast.info.bind(this.xCoreToast), 'background: blue; color: white', message, null, options);
    }

    public warn(errorMessage: any, userMessage?: string, options?: IxLoggingOptions) {
        if (this.appSettings.MinimumLogLevel > LogLevel.Warn) return;
        this.performLogging("Warning", this.xCoreToast.warn.bind(this.xCoreToast), 'background: yellow; color: black', errorMessage, userMessage, options);
    }

    public trace(message: any, options?: IxLoggingOptions) {
        if (this.appSettings.MinimumLogLevel > LogLevel.Trace) return;
        this.performLogging("Trace", null, 'background: orange; color: black', message, null, options);
    }
    
    private setToastOptions(message: any, options?: IxLoggingOptions): IXCoreToastOptions {
        var msg:string = message;
        var toastOptions: IXCoreToastOptions = { message: msg };        
        if (options) {
            toastOptions.showClose = options.showClose || true;
            toastOptions.timeout = options.timeout || 5;
            toastOptions.title = options.title || "";
        }
        return toastOptions;
    }
    
}


export enum TraceMethodPosition {
    Entry,
    Exit,
    Callback,
    CallbackStart,
    CallbackEnd
}

export interface IxLoggingOptions {
    showClose?: boolean,
    timeout?: number,
    title?: string,
    noConsole?: boolean,
    noToast?: boolean    
}