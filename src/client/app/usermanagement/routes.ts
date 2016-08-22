import { AppSettings } from '../appsettings';
import { RouteMetadata } from '@angular/router/src/metadata/metadata';
import { UserProfileComponent, UserListComponent, UserComponent } from '../usermanagement/index';

export var UserManagementRoutes: RouteMetadata[] =  [
    { path: '/userprofile', component: UserProfileComponent },
    { path: '/userlist', component: UserListComponent },
    { path: '/user/:id', component: UserComponent },
    { path: '/newuser', component: UserComponent }
];

