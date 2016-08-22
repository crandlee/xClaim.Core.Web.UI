import { AppSettings } from '../appsettings';
import { RouteMetadata } from '@angular/router/src/metadata/metadata';
import { ClaimComponent, ClaimListComponent } from '../claims/index';

export var ClaimRoutes: RouteMetadata[] =  [
    { path: '/packetlist', component: ClaimListComponent },
    { path: '/packet/:id', component: ClaimComponent }
];

