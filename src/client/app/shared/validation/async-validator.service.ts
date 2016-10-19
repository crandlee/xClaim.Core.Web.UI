import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import { AbstractControl, FormGroup, FormControl } from '@angular/forms';

export class AsyncValidator {

    private _validate: any;

    constructor() {

    }

    static create(validator: (control: AbstractControl) => any, debounceTime = 1000): any {

        var validateFn = {};

        let source: Observable<{}> = new Observable((observer: Observer<AbstractControl>) => {
            validateFn = (control: any) => observer.next(control);
        });

        source
            .debounceTime(debounceTime)
            .map((x: any) => { return { control: x.control, promise: validator(x.control), resolver: x.promiseResolver }; })
            .subscribe(
            (x: any) => {
                return x.promise.then((resultValue: any) => {
                    //Take over error handling for control level validation and handle manually
                    //Form-level validation (instanceOf ControlGroup) will continue to be passed for the pipe
                    if (x.control && x.control instanceof FormControl && resultValue) {
                        x.control.setErrors(resultValue, false);
                        return x.resolver(null);
                    }
                    return x.resolver(resultValue)
                });
            },
            (e: any) => { console.log('async validator error: %s', e); }
            );

        return validateFn;
    }

    private static getValidator(validateFn: any) {
        return (control: any) => {
            let promiseResolver: any;
            let p = new Promise((resolve) => {
                promiseResolver = resolve;
            });
            validateFn({ control: control, promiseResolver: promiseResolver });
            return p;
        };
    }

    private static getValidatorControl(control: AbstractControl, validateFn: any) {
        return () => {
            let promiseResolver: any;
            let p = new Promise((resolve) => {
                promiseResolver = resolve;
            });
            validateFn({ control: control, promiseResolver: promiseResolver });
            return p;
        };
    }

    static debounceControl(control: AbstractControl, validator: (control: AbstractControl) => any, debounceTime = 100) {
        var validateFn = AsyncValidator.create(validator, debounceTime);
        return AsyncValidator.getValidatorControl(control, validateFn);
    }

    static debounceForm(validator: (form: FormGroup) => any, debounceTime = 100) {
        var validateFn = AsyncValidator.create(validator, debounceTime);
        return AsyncValidator.getValidator(validateFn);
    }

}