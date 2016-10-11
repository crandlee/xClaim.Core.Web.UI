import { Component, ViewChild } from '@angular/core';
import { Validators, FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { Location } from '@angular/common';
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
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { TraceMethodPosition } from '../shared/logging/logging.service';
import { OrderByPipe } from '../shared/pipe/orderby.pipe';
import { DefaultValuesComponent } from './defaultValues.component';

@Component({
    moduleId: module.id,
    templateUrl: 'namespace.component.html'
})
export class NamespaceComponent extends XCoreBaseComponent  {

    public viewModel: INamespaceViewModel;
    public form: FormGroup;
    public validationMessages: IFormValidationResult[] = [];
    public controlDataDescriptions: string[];
    public id: string;
    public namespaceValueTypes: IEnumViewModel[] = [];

    @ViewChild(DefaultValuesComponent) DefaultValuesView: DefaultValuesComponent;

    constructor(protected baseService: BaseService, private service: NamespaceService, 
        private builder: FormBuilder, private validationService: NamespaceValidationService, 
        private activatedRoute: ActivatedRoute, private location: Location)     
    {  
        super(baseService);
        this.initializeTrace("NamespaceComponent");
        this.viewModel = this.service.getEmptyViewModel();


    }
    
    private initializeForm(builder: FormBuilder): void {

        var trace = this.classTrace("initializeForm");
        trace(TraceMethodPosition.Entry);
        
        //Set up any async validators
        var nameControl = new FormControl("", Validators.compose([Validators.required, NamespaceValidationService.noSpaces]));
        var nameValidator = AsyncValidator.debounceControl(nameControl, control => this.validationService.isNameDuplicate(control, 
            this.service, this.viewModel.id));
            
        //Set up controls            
        var buildReturn = this.validationService.buildControlGroup(builder, [
            { controlName: "NameControl", description: "Name", control: nameControl},
            { controlName: "DescriptionControl", description: "Description", control: new FormControl("")},
            { controlName: "TypeControl", description: "Type", control: new FormControl("")},
            { controlName: "ValidationPatternControl", description: "Validation Pattern", control: new FormControl("")},
            { controlName: "LengthControl", description: "Length", control: new FormControl("", 
                Validators.compose([NamespaceValidationService.isGreaterThanOrEqualToZero.bind(this, false)]))},
            { controlName: "PrecisionControl", description: "Precision", control: new FormControl("", 
                Validators.compose([NamespaceValidationService.isGreaterThanOrEqualToZero.bind(this, false)]))},
            { controlName: "AllowNullControl", description: "AllowNull", control: new FormControl("")}
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
            this.DefaultValuesView.load(this.viewModel);

            trace(TraceMethodPosition.CallbackEnd);            
        }); 
        
        trace(TraceMethodPosition.Exit);
    }
    
    ngAfterViewInit() {
        this.baseService.hubService.callbackWhenLoaded(this.getInitialData.bind(this, this.service, this.id));
    }

    ngOnInit() {        
        super.NotifyLoaded("Namespace");   
        this.activatedRoute.params.subscribe(params => {
            this.id = params["id"];
            this.initializeForm(this.builder);     
        });
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
    
    public return(): void {
        this.location.back();
    }
}

