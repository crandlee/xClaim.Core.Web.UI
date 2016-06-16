import { Observable } from 'rxjs/Observable';
import { ToastyConfig } from './toasty.config';
/**
 * Options to configure specific Toast
 */
export interface ToastOptions {
    title: string;
    msg?: string;
    showClose?: boolean;
    theme?: string;
    timeout?: number;
    onAdd?: Function;
    onRemove?: Function;
}
/**
 * Structrure of Toast
 */
export interface ToastData {
    id: number;
    title: string;
    msg: string;
    showClose: boolean;
    type: string;
    theme: string;
    timeout: number;
    onAdd: Function;
    onRemove: Function;
    onClick: Function;
}
/**
 * Toasty service helps create different kinds of Toasts
 */
export declare class ToastyService {
    private config;
    uniqueCounter: number;
    static THEMES: Array<string>;
    private toastsObservable;
    private toastsSubscriber;
    private clearObservable;
    private clearSubscriber;
    constructor(config: ToastyConfig);
    /**
     * Get list of toats
     */
    getToasts(): Observable<ToastData>;
    getClear(): Observable<void>;
    /**
     * Create Toast of a default type
     */
    default(options: ToastOptions | string | number): void;
    /**
     * Create Toast of default type
     * @param  {object} options Individual toasty config overrides
     */
    info(options: ToastOptions | string | number): void;
    /**
     * Create Toast of success type
     * @param  {object} options Individual toasty config overrides
     */
    success(options: ToastOptions | string | number): void;
    /**
     * Create Toast of wait type
     * @param  {object} options Individual toasty config overrides
     */
    wait(options: ToastOptions | string | number): void;
    /**
     * Create Toast of error type
     * @param  {object} options Individual toasty config overrides
     */
    error(options: ToastOptions | string | number): void;
    /**
     * Create Toast of warning type
     * @param  {object} options Individual toasty config overrides
     */
    warning(options: ToastOptions | string | number): void;
    private add(options, type);
    clearAll(): void;
    private _checkConfigItem(config, options, property);
}
