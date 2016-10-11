import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { APP_BASE_HREF, CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { routes } from './app.routes';
import { LoggingService, SecurityModule, XCoreToastService, ToastyModule, HubService, BusyService } from './shared/index';
import { WelcomeModule } from './welcome/welcome.module';
import { UiSwitchModule } from 'angular2-ui-switch'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from './shared/shared.module';


import { MemberModule } from './subordinate-member/member.module';
import { NamespaceModule } from './subordinate-namespace/namespace.module';

export const appModules = [
    BrowserModule,
    HttpModule,
    RouterModule.forRoot(routes),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ToastyModule,
    WelcomeModule,
    SecurityModule,
    UiSwitchModule,
    SharedModule.forRoot(),
    MemberModule,
    NamespaceModule
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
  LoggingService,
  XCoreToastService,
  HubService,
  BusyService
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