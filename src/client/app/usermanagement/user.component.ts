import { Component, ViewChild } from '@angular/core';
import { Validators, ControlGroup, Control, FormBuilder } from '@angular/common';
import { IFormValidationResult } from '../shared/validation/validation.service';
import { ValidationComponent } from '../shared/validation/validation.component';
import { AsyncValidator } from '../shared/validation/async-validator.service';
import { UserProfileValidationService } from './userprofile.validation';
import { BaseService } from '../shared/service/base.service';
import { UserService, IUserProfile, IUserProfileViewModel } from '../usermanagement/user.service';
import { XCoreBaseComponent } from '../shared/component/base.component';
import { HubService } from '../shared/hub/hub.service';
import * as _ from 'lodash';
import { RouteSegment } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { UiSwitchComponent } from 'angular2-ui-switch';
import { UserClaimsComponent } from './user.claims.component';
import { TraceMethodPosition } from '../shared/logging/logging.service';

@Component({
    templateUrl: 'app/usermanagement/user.component.html',
    providers: [UserService, UserProfileValidationService],
    directives: [ValidationComponent, UiSwitchComponent, UserClaimsComponent]
})
export class UserComponent extends XCoreBaseComponent  {

    public userProfile: IUserProfileViewModel;
    public form: ControlGroup;
    public validationMessages: IFormValidationResult[] = [];
    public controlDataDescriptions: string[];
    public userId: string;
    @ViewChild(UserClaimsComponent) ClaimsView: UserClaimsComponent;

    constructor(protected baseService: BaseService, private userService: UserService, 
        private builder: FormBuilder, private validationService: UserProfileValidationService, private routeSegment: RouteSegment)     
    {  
        super(baseService);
        console.log('part of the way');
        this.initializeTrace("UserComponent");
        this.userId = routeSegment.getParam("id");
        this.userProfile = this.userService.getEmptyUserProfileViewModel();
    }
    
    private initializeForm(builder: FormBuilder): void {

        var trace = this.classTrace("initializeForm");
        trace(TraceMethodPosition.Entry);
        
        //Set up any async validators
        var emailControl = new Control("", Validators.compose([Validators.required, this.validationService.emailValidator]));
        var emailAsyncValidator = AsyncValidator.debounceControl(emailControl, control => this.validationService.isEmailDuplicate(control, this.userService, this.userProfile.Id));
        var userNameControl = new Control("", Validators.compose([Validators.required]));
        var userNameValidator = AsyncValidator.debounceControl(userNameControl, control => this.validationService.isUserNameDuplicate(control, this.userService, this.userProfile.Id));
            
        //Set up controls            
        var buildReturn = this.validationService.buildControlGroup(builder, [
            { controlName: "UserNameControl", description: "User Name", control: userNameControl},
            { controlName: "FullNameControl", description: "Full Name", control: new Control("", Validators.compose([Validators.required]))},
            { controlName: "EMailControl", description: "EMail", control: emailControl},
            { controlName: "PasswordControl", description: "Password", control: new Control("", Validators.compose([Validators.required, UserProfileValidationService.passwordStrength]))},
            { controlName: "ConfirmPasswordControl", description: "Confirm Password", control: new Control("", Validators.compose([Validators.required]))},
            { controlName: "EnabledControl", description: "Enabled", control: new Control("")}
        ]);                
        this.form = buildReturn.controlGroup;
        this.controlDataDescriptions = buildReturn.controlDataDescriptions;
        
        //Initialize all validation
        this.form.valueChanges.subscribe(form => {
            trace(TraceMethodPosition.CallbackStart, "FormChangesEvent");
            var flv = Validators.compose([UserProfileValidationService.passwordCompare]);
            var flav = Validators.composeAsync([emailAsyncValidator, userNameValidator]);
            this.validationService.getValidationResults(this.form, this.controlDataDescriptions, flv, flav).then(results => {
                this.validationMessages = results;
            });
            trace(TraceMethodPosition.CallbackEnd, "FormChangesEvent");                                    
        });
                
        trace(TraceMethodPosition.Exit);
        
    }
    
    
    private getInitialData(userService: UserService, userId: string): void {        
        var trace = this.classTrace("getInitialData");
        trace(TraceMethodPosition.Entry);        
        var fn: () => Observable<IUserProfile> = (!this.userId) 
            ? userService.getNewUser.bind(userService) 
            : userService.getUserProfile.bind(userService, this.userId);
                            
        fn().subscribe(up => {
            trace(TraceMethodPosition.CallbackStart);
            this.userProfile = this.userService.toViewModel(up);
            
            if (this.userId == null) {
                this.userProfile.Password = "";
                this.userProfile.ConfirmPassword = "";
                this.userProfile.Enabled = true;
            }
            this.ClaimsView.load(this.userProfile);
            trace(TraceMethodPosition.CallbackEnd);            
        }); 
        
        trace(TraceMethodPosition.Exit);
    }
    
    ngAfterViewInit() {
        this.baseService.hubService.callbackWhenLoaded(this.getInitialData.bind(this, this.userService, this.userId));
    }

    ngOnInit() {        
        super.NotifyLoaded("User");   
        this.initializeForm(this.builder);     
    }

    public onSubmit() {
        var trace = this.classTrace("onSubmit");
        trace(TraceMethodPosition.Entry);
        
        this.userService.saveUserProfile(this.userProfile).subscribe(up => {
            trace(TraceMethodPosition.Callback);
            this.userProfile = up;
            this.baseService.loggingService.success("User successfully saved");
            this.baseService.router.navigate([`/User/${this.userProfile.Id}`]);
        });
        
        trace(TraceMethodPosition.Exit);
    }
    
    public cancel(): void {
        this.baseService.router.navigate(["/UserList"]);
    }
}

