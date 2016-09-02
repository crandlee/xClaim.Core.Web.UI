import { AppSettings } from '../appsettings';
import { RouteMetadata } from '@angular/router/src/metadata/metadata';
import { NamespaceListComponent } from './namespace.list.component';
import { NamespaceComponent } from './namespace.component';

export var NamespaceRoutes: RouteMetadata[] =  [
    { path: '/namespacelist', component: NamespaceListComponent },
    { path: '/namespaces/:id', component: NamespaceComponent },
    { path: '/newnamespace', component: NamespaceComponent }
];

