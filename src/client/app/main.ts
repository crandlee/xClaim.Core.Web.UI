// import { APP_BASE_HREF } from '@angular/common';
// import { enableProdMode, Injectable, ErrorHandler } from '@angular/core';
// import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
// import { } from '@angular/http';
// import { AppSettings } from './appsettings';
// import { ToastyService, ToastyConfig, Toasty, ToastOptions, ToastData, XCoreToastService, LoggingService } from './shared/index';
// import { BaseService, HubService, SecurityService, BusyService, ScrollService } from './shared/index';
// import { LocationStrategy, HashLocationStrategy} from '@angular/common';

// import { CookieService } from 'angular2-cookie/core';
// import { MODAL_BROWSER_PROVIDERS } from 'angular2-modal/platform-browser/index';

// if ('<%= ENV %>' === 'prod') { enableProdMode(); }

// // Our main component
// import { AppComponent } from './app.component';

// @Injectable()
// export class RootExceptionHandler  {
  
//   constructor(private logService: LoggingService) {}
  
//   call(error: any, stackTrace: any = null, reason: any = null) {
//     console.log(error);
//     var err = new Error();
//     console.log(err.stack);
//     this.logService.error(error);
//   }
  
// }


// //****This is a fix for a problem with the angular2 modal window - provided as issue #98 on the github repo
// import {BrowserDomAdapter} from '@angular/platform-browser/src/browser/browser_adapter';
// BrowserDomAdapter.makeCurrent();
// //********

// platformBrowserDynamic().bootstrapModule(AppComponent, [
//    ...MODAL_BROWSER_PROVIDERS, ToastyService, ToastyConfig, HTTP_PROVIDERS, ROUTER_PROVIDERS, AppSettings, BusyService,  XCoreToastService, 
//    LoggingService, CookieService, SecurityService, HubService, ScrollService, BaseService,
//    provide(ErrorHandler, { useClass: RootExceptionHandler}), provide(Window, { useValue: window })
// ]);




// // In order to start the Service Worker located at "./worker.js"
// // uncomment this line. More about Service Workers here
// // https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers
// //
// // if ('serviceWorker' in navigator) {
// //   (<any>navigator).serviceWorker.register('./worker.js').then((registration: any) =>
// //       console.log('ServiceWorker registration successful with scope: ', registration.scope))
// //     .catch((err: any) =>
// //       console.log('ServiceWorker registration failed: ', err));
// // }


/**
 * Bootstraps the application and makes the ROUTER_PROVIDERS and the APP_BASE_HREF available to it.
 * @see https://angular.io/docs/ts/latest/api/platform-browser-dynamic/index/bootstrap-function.html
 */
import { enableProdMode } from '@angular/core';
// The browser platform with a compiler
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

// The app module
import { AppModule } from './app.module';

if (String('<%= ENV %>') === 'prod') { enableProdMode(); }

// Compile and launch the module
platformBrowserDynamic().bootstrapModule(AppModule);

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