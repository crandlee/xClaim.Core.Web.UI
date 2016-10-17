import { Component, ViewChild } from '@angular/core';
import { Validators, FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { IFormValidationResult } from '../shared/validation/validation.service';
import { ValidationComponent } from '../shared/validation/validation.component';
import { AsyncValidator } from '../shared/validation/async-validator.service';
import { UserProfileValidationService } from './userprofile.validation';
import { BaseService } from '../shared/service/base.service';
import { UserService, IUserProfile, IUserProfileViewModel } from '../usermanagement/user.service';
import { XCoreBaseComponent } from '../shared/component/base.component';
import { HubService } from '../shared/hub/hub.service';
import * as _ from 'lodash';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { UserClaimsComponent } from './user.claims.component';
import { TraceMethodPosition } from '../shared/logging/logging.service';

@Component({
    moduleId: module.id,
    templateUrl: 'user.component.html'
})
export class UserComponent extends XCoreBaseComponent  {

    public userProfile: IUserProfileViewModel;
    public form: FormGroup;
    public validationMessages: IFormValidationResult[] = [];
    public controlDataDescriptions: string[];
    public userId: string;
    @ViewChild(UserClaimsComponent) ClaimsView: UserClaimsComponent;

    constructor(protected baseService: BaseService, private userService: UserService, 
        private builder: FormBuilder, private validationService: UserProfileValidationService, private activatedRoute: ActivatedRoute)     
    {  
        super(baseService);
        this.initializeTrace("UserComponent");
        this.userProfile = this.userService.getEmptyUserProfileViewModel();
    }
    
    private initializeForm(builder: FormBuilder): void {

        var trace = this.classTrace("initializeForm");
        trace(TraceMethodPosition.Entry);
        
        //Set up any async validators
        var emailControl = new FormControl("", Validators.compose([Validators.required, UserProfileValidationService.isEmailValid]));
        var emailAsyncValidator = AsyncValidator.debounceControl(emailControl, control => this.validationService.isEmailDuplicate(control, this.userService, this.userProfile.id));
        var userNameControl = new FormControl("", Validators.compose([Validators.required]));
        var userNameValidator = AsyncValidator.debounceControl(userNameControl, control => this.validationService.isUserNameDuplicate(control, this.userService, this.userProfile.id));
            
        //Set up controls            
        var buildReturn = this.validationService.buildControlGroup(builder, [
            { controlName: "UserNameControl", description: "User Name", control: userNameControl},
            { controlName: "FullNameControl", description: "Full Name", control: new FormControl("", Validators.compose([Validators.required]))},
            { controlName: "EMailControl", description: "EMail", control: emailControl},
            { controlName: "PasswordControl", description: "Password", control: new FormControl("", Validators.compose([Validators.required, UserProfileValidationService.passwordStrength]))},
            { controlName: "ConfirmPasswordControl", description: "Confirm Password", control: new FormControl("", Validators.compose([Validators.required]))},
            { controlName: "EnabledControl", description: "Enabled", control: new FormControl("")}
        ]);                
        this.form = buildReturn.controlGroup;
        this.controlDataDescriptions = buildReturn.controlDataDescriptions;
        
        //Initialize all validation
        this.form.valueChanges.subscribe(form => {
            trace(TraceMethodPosition.CallbackStart, "FormChangesEvent");
            var flv = Validators.compose([UserProfileValidationService.passwordCompare]);
            var flav = Validators.composeAsync([emailAsyncValidator, userNameValidator]);
            this.validationService.getValidationResults(this.form, flv, flav).then(results => {
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
                this.userProfile.password = "";
                this.userProfile.confirmPassword = "";
                this.userProfile.enabled = true;
            }
            this.initializeForm(this.builder);   
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

        this.activatedRoute.params.subscribe(params => {
            this.userId = params["id"];
        });

    }

    public onSubmit() {
        var trace = this.classTrace("onSubmit");
        trace(TraceMethodPosition.Entry);
        
        this.userService.saveUser(this.userProfile).subscribe(up => {
            trace(TraceMethodPosition.Callback);
            this.userProfile = up;
            this.baseService.loggingService.success("User successfully saved");
            this.baseService.router.navigate([`/user/${this.userProfile.id}`]);
        });
        
        trace(TraceMethodPosition.Exit);
    }
    
    public cancel(): void {
        this.baseService.router.navigate(["/userlist"]);
    }
}
