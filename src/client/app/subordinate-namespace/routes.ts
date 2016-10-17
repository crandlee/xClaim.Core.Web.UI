import { AppSettings } from '../appsettings';
import { NamespaceListComponent } from './namespace.list.component';
import { NamespaceComponent } from './namespace.component';
import { Routes } from '@angular/router';

export var NamespaceRoutes: Routes =  [
    { path: 'namespacelist', component: NamespaceListComponent },
    { path: 'namespaces/:id', component: NamespaceComponent },
    { path: 'newnamespace', component: NamespaceComponent }
];

