import { AppSettings } from '../appsettings';
import { RouteMetadata } from '@angular/router/src/metadata/metadata';
import { PlanListComponent } from './plan.list.component';
import { PlanComponent } from './plan.component';

export var PlanRoutes: RouteMetadata[] =  [
    { path: '/planlist', component: PlanListComponent },
    { path: '/plans/:id', component: PlanComponent },
    { path: '/plansbyid/:bin/:pcn/:groupId', component: PlanComponent },
    { path: '/newplan', component: PlanComponent }
];

