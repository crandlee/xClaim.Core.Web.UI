import { AppSettings } from '../appsettings';
import { MemberListComponent } from './member.list.component';
import { MemberComponent } from './member.component';
import { Routes } from '@angular/router';

export var MemberRoutes: Routes =  [
    { path: '/memberlist', component: MemberListComponent },
    { path: '/members/:id', component: MemberComponent },
    { path: '/membersbyid/:memberid', component: MemberComponent },
    { path: '/newmember', component: MemberComponent }
];

