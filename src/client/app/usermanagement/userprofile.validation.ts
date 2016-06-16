import { ValidationService, IValidationOptions, IFormValidationResult, IValidationResult } from '../shared/validation/validation.service';
import { LoggingService, TraceMethodPosition } from '../shared/logging/logging.service';
import { Control, ControlGroup, AbstractControl } from '@angular/common';
import { ValidatorFn, AsyncValidatorFn } from '@angular/common/src/forms/directives/validators';
import { UserService } from './user.service';
import 'rxjs/add/operator/toPromise';

export class UserProfileValidationService extends ValidationService {
    
    private static passwordsDoNotMatch: string = "passwordsDoNoMatch";
    private static emailNotUnique: string = "emailNotUnique";
    private static userNameNotUnique: string = "userNameNotUnique";
    
    constructor() {
        super();
    }
    
    
    public isEmailDuplicate(emailControl: AbstractControl, userService: UserService, id: string): Promise<IValidationResult> {
        
        if (!id || !emailControl.value) return Promise.resolve(null);
        
        var svc = userService.isEmailDuplicate(emailControl.value, id);                            
        var p = new Promise<IValidationResult>(resolve => {
            svc.subscribe(isDuplicate => {
                resolve(isDuplicate ? {[UserProfileValidationService.emailNotUnique] : true}: null);                                
            });            
        });  
        
        return p;
    }

    public isUserNameDuplicate(userNameControl: AbstractControl, userService: UserService, id: string): Promise<IValidationResult> {
        
        if (!id || !userNameControl.value) return Promise.resolve(null);
        
        var svc = userService.isUserNameDuplicate(userNameControl.value, id);                            
        var p = new Promise<IValidationResult>(resolve => {
            svc.subscribe(isDuplicate => {
                resolve(isDuplicate ? {[UserProfileValidationService.userNameNotUnique] : true}: null);                                
            });            
        });  
        
        return p;
    }
    
    public static passwordCompare(form: ControlGroup): IValidationResult {
        var passwordControl: AbstractControl = form.controls["PasswordControl"];
        var confirmPasswordControl: AbstractControl = form.controls["ConfirmPasswordControl"];
        
        return { [UserProfileValidationService.passwordsDoNotMatch] : passwordControl.value !== confirmPasswordControl.value};
    }

    
    public getValidatorErrorMessage(code: string): string {
        let config: any = {
            [UserProfileValidationService.passwordsDoNotMatch]: "Passwords must match",
            [UserProfileValidationService.emailNotUnique]: "This email address is already attached to another user",
            [UserProfileValidationService.userNameNotUnique]: "This user name is already in use"
        };
        return config[code] ||  super.getValidatorErrorMessage(code);
    }

}