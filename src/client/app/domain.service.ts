import { Injectable } from '@angular/core';
import { RouteMetadata } from '@angular/router/src/metadata/metadata';

import { UserManagementRoutes } from './usermanagement/routes';
import { ClaimRoutes } from './claims/routes';
import { WelcomeComponent } from './welcome/index';

@Injectable()
export class DomainService {
        
    public static getRoutes(): RouteMetadata[] {
        var baseRoutes: RouteMetadata[] = [    
        ];
        var retRoutes = baseRoutes
            .concat(ClaimRoutes)
            .concat(UserManagementRoutes)
            .concat([{ path: '/', component: WelcomeComponent }, { path: '/**', component: WelcomeComponent }]);
            return retRoutes;
    }
     
}