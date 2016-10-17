import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { APP_BASE_HREF, CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { routes } from './app.routes';
import { LoggingService, SecurityModule, ToastyModule, ToastyService, ToastyConfig } from './shared/index';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from './shared/shared.module';
import { WelcomeModule } from './welcome/welcome.module';
import { MemberModule } from './subordinate-member/member.module';
import { NamespaceModule } from './subordinate-namespace/namespace.module';
import { UserModule } from './usermanagement/user.module';
import { ClaimModule } from './claims/claim.module';
import { PlanModule } from './subordinate-plan/plan.module';
import { ProductServiceModule } from './subordinate-productservice/productservice.module';
import { ServiceProviderModule } from './subordinate-serviceprovider/serviceprovider.module';

export const appModules = [
    BrowserModule,
    HttpModule,    
    RouterModule.forRoot(routes),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ToastyModule.forRoot(),
    WelcomeModule,
    SecurityModule,
    UserModule,
    SharedModule.forRoot(),
    ClaimModule,
    MemberModule,
    NamespaceModule,
    PlanModule,
    ProductServiceModule,
    ServiceProviderModule
];


export const appDeclarations = [
    AppComponent
];

export const appProviders = [
  {
    provide: APP_BASE_HREF,
    useValue: '<%= APP_BASE %>',
    providers: [{provide: ErrorHandler, useClass: RootErrorHandler}]
  }, 
  ToastyService,
  ToastyConfig
];

export class RootErrorHandler implements ErrorHandler  {

    constructor(private logService: LoggingService) {}

    handleError(error: any) {
        console.log(error);
        var err = new Error();
        console.log(err.stack);
        this.logService.error(error);
    }

}

@NgModule({
  imports: [...appModules],
  declarations: [...appDeclarations],
  providers: [...appProviders],
  exports: [ ],
  bootstrap: [AppComponent]
})
export class AppModule { }