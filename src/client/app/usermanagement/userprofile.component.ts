import { Component, OnInit, ViewChild } from '@angular/core';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { XCoreBaseComponent } from '../shared/component/base.component';
import { IFormValidationResult } from '../shared/validation/validation.service';
import { ValidationComponent } from '../shared/validation/validation.component';
import { AsyncValidator } from '../shared/validation/async-validator.service';
import { UserProfileValidationService } from './userprofile.validation';
import { UserService, IUserProfile, IUserProfileViewModel } from './user.service';
import { BaseService  } from '../shared/service/base.service';
import { TraceMethodPosition } from '../shared/logging/logging.service';

@Component({
    moduleId: module.id,
    templateUrl: 'userprofile.component.html'
})
export class UserProfileComponent extends XCoreBaseComponent implements OnInit  {

    public userProfile: IUserProfileViewModel;
    public active: boolean = false;    
    public validationMessages: IFormValidationResult[] = [];
    private validationSet: boolean = false;


    @ViewChild("form") form: FormGroup;

    constructor(protected baseService: BaseService, private userService: UserService, private validationService: UserProfileValidationService)     
    {  
        super(baseService);
        this.initializeTrace("UserProfileComponent");        
        this.userProfile = this.userService.getEmptyUserProfileViewModel();
    }
    
    public initializeValidation(form:FormGroup) {
        if (this.validationSet) return;
        this.setControlProperties(form, "email", "Email Address", Validators.compose([Validators.required, UserProfileValidationService.isEmailValid, Validators.maxLength(128)]));
        this.setControlProperties(form, "password", "Password", Validators.compose([Validators.required, UserProfileValidationService.passwordStrength]));
        this.setControlProperties(form, "confirmPassword", "Confirm Password", Validators.compose([Validators.required]));

        var executeValidation = () => {
            var flv = Validators.compose([UserProfileValidationService.passwordCompare]);
            var flav = Validators.composeAsync([
                AsyncValidator.debounceControl(form.controls["email"], control => this.validationService.isEmailDuplicate(control, this.userService, this.userProfile.id))
            ]);
            this.validationService.getValidationResults(form, flv, flav).then(results => {
                this.validationMessages = results;
            });
        };

        form.valueChanges.subscribe(executeValidation);

        executeValidation();

        this.validationSet = true;
    }

        
    private getInitialData(userService: UserService): void {
        
        var trace = this.classTrace("getInitialData");
        trace(TraceMethodPosition.Entry);
        userService.getUserProfile(this.baseService.hubService.HubData.userId).subscribe(up => {
            trace(TraceMethodPosition.CallbackStart);
            this.userProfile = this.userService.toViewModel(up);
            this.active = true;
            this.initializeValidation(this.form);
            trace(TraceMethodPosition.CallbackEnd);            
        }); 
        
        trace(TraceMethodPosition.Exit);
    }
    
    ngAfterViewInit() {
        this.baseService.hubService.callbackWhenLoaded(this.getInitialData.bind(this, this.userService, this.baseService.hubService));
    }

    ngOnInit() {        
        super.NotifyLoaded("UserProfile");        
    }
                 
    public onSubmit(): void {
        var trace = this.classTrace("onSubmit");
        trace(TraceMethodPosition.Entry);
        
        this.userService.saveUserProfile(this.userProfile).subscribe(up => {
            trace(TraceMethodPosition.Callback);
            this.userProfile = up;
            this.baseService.loggingService.success("User profile successfully updated");
            this.baseService.router.navigate(["/"]);
        });
        
        trace(TraceMethodPosition.Exit);
    }
    
    public cancel(): void {
        this.baseService.router.navigate(['/']);
    }
}
