import { Injectable } from '@angular/core';
import { RouteMetadata } from '@angular/router/src/metadata/metadata';

import { UserManagementRoutes } from './usermanagement/routes';
import { ClaimRoutes } from './claims/routes';
import { NamespaceRoutes } from './subordinate-namespace/routes';
import { WelcomeComponent } from './welcome/index';
import { PlanRoutes } from './subordinate-plan/routes';
import { MemberRoutes } from './subordinate-member/routes';
import { ServiceProviderRoutes } from './subordinate-serviceprovider/routes';
import { ProductServiceRoutes } from './subordinate-productservice/routes';

@Injectable()
export class DomainService {
        
    public static getRoutes(): RouteMetadata[] {
        var baseRoutes: RouteMetadata[] = [    
        ];
        var retRoutes = baseRoutes
            .concat(ClaimRoutes)
            .concat(UserManagementRoutes)
            .concat(NamespaceRoutes)
            .concat(PlanRoutes)
            .concat(MemberRoutes)
            .concat(ServiceProviderRoutes)
            .concat(ProductServiceRoutes)
            .concat([{ path: '/', component: WelcomeComponent }, { path: '/**', component: WelcomeComponent }]);
            return retRoutes;
    }
     
}