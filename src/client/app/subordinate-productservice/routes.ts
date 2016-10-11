import { AppSettings } from '../appsettings';
import { ProductServiceListComponent } from './productservice.list.component';
import { ProductServiceComponent } from './productservice.component';
import { Routes } from '@angular/router';

export var ProductServiceRoutes: Routes =  [
    { path: '/productservicelist', component: ProductServiceListComponent },
    { path: '/productservices/:id', component: ProductServiceComponent },
    { path: '/productservicesbyid/:ndc', component: ProductServiceComponent }
];

