import { AppSettings } from '../appsettings';
import { PlanListComponent } from './plan.list.component';
import { PlanComponent } from './plan.component';
import { Routes } from '@angular/router';

export var PlanRoutes: Routes =  [
    { path: '/planlist', component: PlanListComponent },
    { path: '/plans/:id', component: PlanComponent },
    { path: '/plansbyid/:bin/:pcn/:groupId', component: PlanComponent },
    { path: '/newplan', component: PlanComponent }
];

