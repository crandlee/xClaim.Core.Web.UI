import { AppSettings } from '../appsettings';
import { RouteMetadata } from '@angular/router/src/metadata/metadata';
import { MemberListComponent } from './member.list.component';
import { MemberComponent } from './member.component';

export var MemberRoutes: RouteMetadata[] =  [
    { path: '/memberlist', component: MemberListComponent },
    { path: '/members/:id', component: MemberComponent },
    { path: '/newmember', component: MemberComponent }
];

