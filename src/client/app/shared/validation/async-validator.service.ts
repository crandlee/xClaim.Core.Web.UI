import {Component} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import {AbstractControl, ControlGroup, Control} from '@angular/common';

export class AsyncValidator {

private _validate:any;

constructor(validator: (control: AbstractControl) => any, debounceTime = 1000) {
    let source: any = new Observable((observer: Observer<AbstractControl>) => {
        this._validate = (control:any) => observer.next(control);
    });

    source.debounceTime(debounceTime)
        //.distinctUntilChanged(null, (x) => x.control.value)
        .map((x:any) => { return { control: x.control, promise: validator(x.control), resolver: x.promiseResolver }; })
        .subscribe(
            (x:any) => { return x.promise.then((resultValue:any) =>  {
                //Take over error handling for control level validation and handle manually
                //Form-level validation (instanceOf ControlGroup) will continue to be passed for the pipe
                if (x.control && x.control instanceof Control && resultValue) {
                    x.control.setErrors(resultValue, false);
                    return x.resolver(null);
                } 
                return x.resolver(resultValue)
            }); },
            (e:any) => { console.log('async validator error: %s', e); }
        );
        
}

private _getValidator() {
    return (control:any) => {
        let promiseResolver:any;
        let p = new Promise((resolve) => {
            promiseResolver = resolve;
        });
        this._validate({ control: control, promiseResolver: promiseResolver });
        return p;
    };
}

private _getValidatorControl(control: AbstractControl) {
    return () => {
        let promiseResolver:any;
        let p = new Promise((resolve) => {
            promiseResolver = resolve;
        });
        this._validate({ control: control, promiseResolver: promiseResolver });
        return p;
    };
}

static debounceControl(control: AbstractControl, validator: (control: AbstractControl) => any, debounceTime = 400) {
    var asyncValidator = new this(validator, debounceTime);
    return asyncValidator._getValidatorControl(control);
}

static debounceForm(validator: (form: ControlGroup) => any, debounceTime = 400) {
    var asyncValidator = new this(validator, debounceTime);
    return asyncValidator._getValidator();
}

}