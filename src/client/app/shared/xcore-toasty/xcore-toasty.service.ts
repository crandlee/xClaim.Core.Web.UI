import { Injectable, Inject } from '@angular/core';
import { ToastyService, ToastOptions } from '../ng2-toasty/ng2-toasty';

@Injectable()
export class XCoreToastService {
    constructor(private _toastyService: ToastyService) {}
    
    default(options: IXCoreToastOptions) {
        this.callSpecificType(XCoreToastType.Default, this.getToastyOptions(options));
    }

    info(options: IXCoreToastOptions) {
        this.callSpecificType(XCoreToastType.Info, this.getToastyOptions(options));
    }

    wait(options: IXCoreToastOptions) {
        this.callSpecificType(XCoreToastType.Wait, this.getToastyOptions(options));
    }

    warn(options: IXCoreToastOptions) {
        this.callSpecificType(XCoreToastType.Warning, this.getToastyOptions(options));
    }

    error(options: IXCoreToastOptions) {
        this.callSpecificType(XCoreToastType.Error, this.getToastyOptions(options));
    }

    success(options: IXCoreToastOptions) {
        this.callSpecificType(XCoreToastType.Success, this.getToastyOptions(options));
    }

    private callSpecificType(type: XCoreToastType, toastyOptions: ToastOptions): void {
        switch (type) {
            case XCoreToastType.Default: this._toastyService.default(toastyOptions); break;
            case XCoreToastType.Info: this._toastyService.info(toastyOptions); break;
            case XCoreToastType.Success: this._toastyService.success(toastyOptions); break;
            case XCoreToastType.Wait: this._toastyService.wait(toastyOptions); break;
            case XCoreToastType.Error: this._toastyService.error(toastyOptions); break;
            case XCoreToastType.Warning: this._toastyService.warning(toastyOptions); break;            
        }                       
    }
    
    private getToastyOptions(options: IXCoreToastOptions): ToastOptions {
        return {
            msg: options.message || '',
            title: options.title || '',
            showClose: options.showClose || true,
            timeout: options.timeout || 5000
        };        
    }
}


export interface IXCoreToastOptions {
    message: string,
    title?: string,
    showClose?: boolean,
    timeout?: number
}

export enum XCoreToastType {
    Default,
    Info,
    Success,
    Wait,
    Error,
    Warning
}