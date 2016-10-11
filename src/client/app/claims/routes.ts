import { AppSettings } from '../appsettings';
import { Route } from '@angular/router';
import { ClaimComponent, ClaimListComponent } from '../claims/index';

export var ClaimRoutes: Route[] =  [
    { path: '/packetlist', component: ClaimListComponent },
    { path: '/packet/:id', component: ClaimComponent }
];

