import { UserManagementRoutes } from './usermanagement/routes';
import { ClaimRoutes } from './claims/routes';
import { NamespaceRoutes } from './subordinate-namespace/routes';
import { WelcomeComponent } from './welcome/index';
import { PlanRoutes } from './subordinate-plan/routes';
import { MemberRoutes } from './subordinate-member/routes';
import { ServiceProviderRoutes } from './subordinate-serviceprovider/routes';
import { ProductServiceRoutes } from './subordinate-productservice/routes';
import { Routes } from '@angular/router';


export const routes: Routes = [
  ...UserManagementRoutes,
  ...ClaimRoutes,
  ...NamespaceRoutes,
  ...PlanRoutes,
  ...MemberRoutes,
  ...ServiceProviderRoutes,
  ...ProductServiceRoutes
]
.concat([{ path: '', component: WelcomeComponent }, { path: '**', component: WelcomeComponent }]);
