import { AppSettings } from '../appsettings';
import { RouteMetadata } from '@angular/router/src/metadata/metadata';
import { UserProfileComponent, UserListComponent, UserComponent } from '../usermanagement/index';

export var UserManagementRoutes: RouteMetadata[] =  [
    { path: '/UserProfile', component: UserProfileComponent },
    { path: '/UserList', component: UserListComponent },
    { path: '/User/:id', component: UserComponent },
    { path: '/NewUser', component: UserComponent }
];

