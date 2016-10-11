import { AppSettings } from '../appsettings';
import { UserProfileComponent, UserListComponent, UserComponent } from '../usermanagement/index';
import { Routes } from '@angular/router';

export var UserManagementRoutes: Routes =  [
    { path: '/userprofile', component: UserProfileComponent },
    { path: '/userlist', component: UserListComponent },
    { path: '/user/:id', component: UserComponent },
    { path: '/newuser', component: UserComponent }
];

