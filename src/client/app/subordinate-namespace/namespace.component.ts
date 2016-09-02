import { Component, ViewChild } from '@angular/core';
import { Validators, ControlGroup, Control, FormBuilder } from '@angular/common';
import { IFormValidationResult } from '../shared/validation/validation.service';
import { ValidationComponent } from '../shared/validation/validation.component';
import { AsyncValidator } from '../shared/validation/async-validator.service';
import { NamespaceValidationService } from './namespace.validation';
import { BaseService } from '../shared/service/base.service';
import { NamespaceService, INamespace, INamespaceViewModel } from './namespace.service';
import { XCoreBaseComponent } from '../shared/component/base.component';
import { HubService } from '../shared/hub/hub.service';
import { IEnumViewModel } from '../shared/service/base.service';
import * as _ from 'lodash';
import { RouteSegment } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { UiSwitchComponent } from 'angular2-ui-switch';
import { TraceMethodPosition } from '../shared/logging/logging.service';
import { OrderByPipe } from '../shared/pipe/orderby.pipe';

@Component({
    moduleId: module.id,
    templateUrl: 'namespace.component.html',
    providers: [NamespaceService, NamespaceValidationService],
    directives: [ValidationComponent, UiSwitchComponent],
    pipes: [OrderByPipe]
})
export class NamespaceComponent extends XCoreBaseComponent  {

    public viewModel: INamespaceViewModel;
    public form: ControlGroup;
    public validationMessages: IFormValidationResult[] = [];
    public controlDataDescriptions: string[];
    public id: string;
    public namespaceValueTypes: IEnumViewModel[] = [];

    constructor(protected baseService: BaseService, private service: NamespaceService, 
        private builder: FormBuilder, private validationService: NamespaceValidationService, private routeSegment: RouteSegment)     
    {  
        super(baseService);
        this.initializeTrace("NamespaceComponent");
        this.id = routeSegment.getParam("id");
        this.viewModel = this.service.getEmptyViewModel();


    }
    
    private initializeForm(builder: FormBuilder): void {

        var trace = this.classTrace("initializeForm");
        trace(TraceMethodPosition.Entry);
        
        //Set up any async validators
        var nameControl = new Control("", Validators.compose([Validators.required, NamespaceValidationService.noSpaces]));
        var nameValidator = AsyncValidator.debounceControl(nameControl, control => this.validationService.isNameDuplicate(control, 
            this.service, this.viewModel.id));
            
        //Set up controls            
        var buildReturn = this.validationService.buildControlGroup(builder, [
            { controlName: "NameControl", description: "Name", control: nameControl},
            { controlName: "DescriptionControl", description: "Description", control: new Control("")},
            { controlName: "TypeControl", description: "Type", control: new Control("")},
            { controlName: "ValidationPatternControl", description: "Validation Pattern", control: new Control("")},
            { controlName: "LengthControl", description: "Length", control: new Control("", 
                Validators.compose([NamespaceValidationService.isGreaterThanOrEqualToZero.bind(this, false)]))},
            { controlName: "PrecisionControl", description: "Precision", control: new Control("", 
                Validators.compose([NamespaceValidationService.isGreaterThanOrEqualToZero.bind(this, false)]))},
            { controlName: "AllowNullControl", description: "AllowNull", control: new Control("")}
        ]);                
        this.form = buildReturn.controlGroup;
        this.controlDataDescriptions = buildReturn.controlDataDescriptions;
        
        //Initialize all validation
        this.form.valueChanges.subscribe(form => {
            trace(TraceMethodPosition.CallbackStart, "FormChangesEvent");
            var flv = Validators.compose([]);
            var flav = Validators.composeAsync([nameValidator]);
            this.validationService.getValidationResults(this.form, this.controlDataDescriptions, flv, flav).then(results => {
                this.validationMessages = results;
            });
            trace(TraceMethodPosition.CallbackEnd, "FormChangesEvent");                                    
        });
                
        trace(TraceMethodPosition.Exit);
        
    }
    
    
    private getInitialData(service: NamespaceService, id: string): void {        
        var trace = this.classTrace("getInitialData");
        var fn: () => Observable<INamespace> = (!this.id) 
            ? service.getNew.bind(service) 
            : service.getExisting.bind(service, this.id);

        this.service.getNamespaceValueTypes().subscribe(et => {
            this.namespaceValueTypes = et;
        });
                            
        fn().subscribe(up => {
            trace(TraceMethodPosition.CallbackStart);
            this.viewModel = this.service.toViewModel(up);
            //Load any subviews here
            trace(TraceMethodPosition.CallbackEnd);            
        }); 
        
        trace(TraceMethodPosition.Exit);
    }
    
    ngAfterViewInit() {
        this.baseService.hubService.callbackWhenLoaded(this.getInitialData.bind(this, this.service, this.id));
    }

    ngOnInit() {        
        super.NotifyLoaded("Namespace");   
        this.initializeForm(this.builder);     
    }

    public onSubmit() {
        var trace = this.classTrace("onSubmit");
        trace(TraceMethodPosition.Entry);
        this.service.save(this.viewModel).subscribe(vm => {
            trace(TraceMethodPosition.Callback);
            this.viewModel = vm;
            this.baseService.loggingService.success("Namespace successfully saved");
            this.baseService.router.navigate([`/namespaces/${this.viewModel.id}`]);
        });
        
        trace(TraceMethodPosition.Exit);
    }
    
    public cancel(): void {
        this.baseService.router.navigate(["/namespacelist"]);
    }
}

