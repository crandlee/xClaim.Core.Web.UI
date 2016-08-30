import { APP_BASE_HREF } from '@angular/common';
import { PLATFORM_DIRECTIVES } from '@angular/core';
import { enableProdMode, provide, Injectable, ExceptionHandler } from '@angular/core';
import { bootstrap } from '@angular/platform-browser-dynamic';
import { HTTP_PROVIDERS } from '@angular/http';
import { ROUTER_PROVIDERS, ROUTER_DIRECTIVES } from '@angular/router';
import { AppSettings } from './appsettings';
import { ToastyService, ToastyConfig, Toasty, ToastOptions, ToastData, XCoreToastService, LoggingService } from './shared/index';
import { BaseService, HubService, SecurityService, BusyService, ScrollService } from './shared/index';
import { LocationStrategy, HashLocationStrategy} from '@angular/common';

import { CookieService } from 'angular2-cookie/core';
import { MODAL_BROWSER_PROVIDERS } from 'angular2-modal/platform-browser/index';

if ('<%= ENV %>' === 'prod') { enableProdMode(); }

// Our main component
import { AppComponent } from './app.component';

@Injectable()
export class RootExceptionHandler  {
  
  constructor(private logService: LoggingService) {}
  
  call(error: any, stackTrace: any = null, reason: any = null) {
    console.log(error);
    var err = new Error();
    console.log(err.stack);
    this.logService.error(error);
  }
  
}


//****This is a fix for a problem with the angular2 modal window - provided as issue #98 on the github repo
import {BrowserDomAdapter} from '@angular/platform-browser/src/browser/browser_adapter';
BrowserDomAdapter.makeCurrent();
//********

bootstrap(AppComponent, [
   ...MODAL_BROWSER_PROVIDERS, ToastyService, ToastyConfig, HTTP_PROVIDERS, ROUTER_PROVIDERS, AppSettings, BusyService,  XCoreToastService, 
   LoggingService, CookieService, SecurityService, HubService, ScrollService, BaseService,
   provide(ExceptionHandler, { useClass: RootExceptionHandler}), provide(Window, { useValue: window }), provide(PLATFORM_DIRECTIVES, { useValue: [ROUTER_DIRECTIVES], multi: true})
]);




// In order to start the Service Worker located at "./worker.js"
// uncomment this line. More about Service Workers here
// https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers
//
// if ('serviceWorker' in navigator) {
//   (<any>navigator).serviceWorker.register('./worker.js').then((registration: any) =>
//       console.log('ServiceWorker registration successful with scope: ', registration.scope))
//     .catch((err: any) =>
//       console.log('ServiceWorker registration failed: ', err));
// }
