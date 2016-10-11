import { AppSettings } from '../appsettings';
import { ServiceProviderListComponent } from './serviceprovider.list.component';
import { ServiceProviderComponent } from './serviceprovider.component';
import { Routes } from '@angular/router';

export var ServiceProviderRoutes: Routes =  [
    { path: '/serviceproviderlist', component: ServiceProviderListComponent },
    { path: '/serviceproviders/:id', component: ServiceProviderComponent },
    { path: '/serviceprovidersbyid/:npi', component: ServiceProviderComponent },
    { path: '/newserviceprovider', component: ServiceProviderComponent }
];

