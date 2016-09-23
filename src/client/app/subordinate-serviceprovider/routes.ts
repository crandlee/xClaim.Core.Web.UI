import { AppSettings } from '../appsettings';
import { RouteMetadata } from '@angular/router/src/metadata/metadata';
import { ServiceProviderListComponent } from './serviceprovider.list.component';
import { ServiceProviderComponent } from './serviceprovider.component';

export var ServiceProviderRoutes: RouteMetadata[] =  [
    { path: '/serviceproviderlist', component: ServiceProviderListComponent },
    { path: '/serviceproviders/:id', component: ServiceProviderComponent },
    { path: '/newserviceprovider', component: ServiceProviderComponent }
];

