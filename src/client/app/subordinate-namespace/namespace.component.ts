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
    public validationMessages: IFormValidationResult[] = [];
    public id: string;
    public namespaceValueTypes: IEnumViewModel[] = [];
    private validationSet: boolean = false;

    @ViewChild("form") form: FormGroup;
    @ViewChild(DefaultValuesComponent) DefaultValuesView: DefaultValuesComponent;

    constructor(protected baseService: BaseService, private service: NamespaceService, 
        private builder: FormBuilder, private validationService: NamespaceValidationService, 
        private activatedRoute: ActivatedRoute, private location: Location)     
    {  
        super(baseService);
        this.initializeTrace("NamespaceComponent");
        this.viewModel = this.service.getEmptyViewModel();


    }
    
    public initializeValidation(form:FormGroup) {

        if (this.validationSet) return;
        this.setControlProperties(form, "name", "Name", Validators.compose([Validators.required, NamespaceValidationService.noSpaces, Validators.maxLength(250)]));
        this.setControlProperties(form, "description", "Description", Validators.compose([Validators.maxLength(256)]));
        this.setControlProperties(form, "type", "Type");
        this.setControlProperties(form, "validationPattern", "Validation Pattern", Validators.compose([Validators.maxLength(500)]));
        this.setControlProperties(form, "length", "Length", Validators.compose([NamespaceValidationService.isGreaterThanOrEqualToZero.bind(this, false)]));
        this.setControlProperties(form, "precision", "Precision", Validators.compose([NamespaceValidationService.isGreaterThanOrEqualToZero.bind(this, false)]));

        var executeValidation = () => {
            var flv = Validators.compose([]);
            var flav = Validators.composeAsync([
                AsyncValidator.debounceControl(form.controls['name'], control => this.validationService.isNameDuplicate(control, this.service, this.viewModel.id)) 
            ]);
            this.validationService.getValidationResults(form, flv, flav).then(results => {
                this.validationMessages = results;
            });
        };

        form.valueChanges.debounceTime(1000).distinctUntilChanged(null, (x) => x).subscribe(executeValidation);

        this.validationSet = true;
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
            this.initializeValidation(this.form);

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
        });
    }
    
    public onSubmit() {
        var trace = this.classTrace("onSubmit");
        trace(TraceMethodPosition.Entry);
        this.service.save(this.viewModel).subscribe(vm => {
            trace(TraceMethodPosition.Callback);
            this.viewModel = vm;
            this.id = this.viewModel.id;
            this.baseService.loggingService.success("Namespace successfully saved");
            this.location.replaceState(`/namespaces/${this.viewModel.id}`);
            this.baseService.hubService.callbackWhenLoaded(this.getInitialData.bind(this, this.service, this.id));
        });
        
        trace(TraceMethodPosition.Exit);
    }
    
    public return(): void {
        this.location.back();
    }
}

