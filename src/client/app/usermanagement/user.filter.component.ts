import { Component, ViewChild, Renderer } from '@angular/core';
import { FilterComponent } from '../shared/filtering/filter.component';
import { UserFilterService, IUsersToServerFilter } from './user.filter.service';
import { BaseService } from '../shared/service/base.service';
import { IUsersToClientFilter } from './user.service';

@Component({
    moduleId: module.id,
    selector: "userfilter",
    styleUrls: ['user.filter.component.css'],
    templateUrl: 'user.filter.component.html'
})
export class UserFilterComponent extends FilterComponent<IUsersToServerFilter, IUsersToClientFilter> {
    
    @ViewChild('userName') focusRef: any;
    public self:FilterComponent<IUsersToServerFilter, IUsersToClientFilter> = this;

    constructor(protected baseService: BaseService, private userFilterService: UserFilterService, private renderer: Renderer) {

        super(baseService, userFilterService);
        
    }

    ngOnInit() {

    }

}

