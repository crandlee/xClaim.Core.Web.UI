import { AppSettings } from '../appsettings';
import { RouteMetadata } from '@angular/router/src/metadata/metadata';
import { ProductServiceListComponent } from './productservice.list.component';
import { ProductServiceComponent } from './productservice.component';

export var ProductServiceRoutes: RouteMetadata[] =  [
    { path: '/productservicelist', component: ProductServiceListComponent },
    { path: '/productservices/:id', component: ProductServiceComponent },
    { path: '/productservicesbyid/:ndc', component: ProductServiceComponent }
];

