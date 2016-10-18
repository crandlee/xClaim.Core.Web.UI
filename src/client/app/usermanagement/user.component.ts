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
    public validationMessages: IFormValidationResult[] = [];
    public userId: string;
    private validationSet: boolean = false;
    @ViewChild("form") form: FormGroup;
    @ViewChild(UserClaimsComponent) ClaimsView: UserClaimsComponent;

    constructor(protected baseService: BaseService, private userService: UserService, 
        private builder: FormBuilder, private validationService: UserProfileValidationService, private activatedRoute: ActivatedRoute)     
    {  
        super(baseService);
        this.initializeTrace("UserComponent");
        this.userProfile = this.userService.getEmptyUserProfileViewModel();
    }
    
    public initializeValidation(form:FormGroup) {

        if (this.validationSet) return;
        this.setControlProperties(form, "userName", "User Name", Validators.compose([Validators.required]));
        this.setControlProperties(form, "fullName", "Full Name", Validators.compose([Validators.required, Validators.maxLength(256)]));
        this.setControlProperties(form, "email", "Email Address", Validators.compose([Validators.required, UserProfileValidationService.isEmailValid, Validators.maxLength(128)]));
        this.setControlProperties(form, "password", "Password", Validators.compose([Validators.required, UserProfileValidationService.passwordStrength]));
        this.setControlProperties(form, "confirmPassword", "Confirm Password", Validators.compose([Validators.required]));

        var executeValidation = () => {
            var flv = Validators.compose([UserProfileValidationService.passwordCompare]);
            var flav = Validators.composeAsync([
                AsyncValidator.debounceControl(form.controls["email"], control => this.validationService.isEmailDuplicate(control, this.userService, this.userProfile.id)), 
                AsyncValidator.debounceControl(form.controls["userName"], control => this.validationService.isUserNameDuplicate(control, this.userService, this.userProfile.id))
            ]);
            this.validationService.getValidationResults(form, flv, flav).then(results => {
                this.validationMessages = results;
            });
        };

        form.valueChanges.subscribe(executeValidation);

        executeValidation();

        this.validationSet = true;
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
            this.initializeValidation(this.form);   
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
