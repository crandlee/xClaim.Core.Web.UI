import { Component } from '@angular/core';
import { BaseService, TraceMethodPosition, IHubServiceData, IHubServiceMenuItem, XCoreBaseComponent  } from '../shared/index';
import { ACCORDION_DIRECTIVES } from 'ng2-bootstrap';
import * as _ from 'lodash';

@Component({
    moduleId: module.id,
    templateUrl: 'welcome.component.html',
    directives: [ACCORDION_DIRECTIVES],
    providers: [],
    styleUrls: ['welcome.component.css']
})
export class WelcomeComponent extends XCoreBaseComponent {

    public hubData: IHubServiceData =  { ApiEndpoints: [], MenuItems: [], Scopes:"", UserId: "" };
    public menuItems: IMainMenuItem[] = [];
    public menuItemIdGenerator: number = 0;
    public hubDataLoaded: boolean = false;
    
    constructor(protected baseService: BaseService) {
        super(baseService);
        
        this.initializeTrace("WelcomeComponent");
    }

    private loadMenuItems(hd: IHubServiceData) {
        var trace = this.classTrace("loadMenuItems");
        trace(TraceMethodPosition.CallbackStart);
        this.hubData = hd;
        this.hubData.MenuItems = _.chain(this.hubData.MenuItems)
            .sortBy(mi => mi.Description)
            .value();
        this.menuItems = this.flattenMenuItems();
        this.hubDataLoaded = true;
        trace(TraceMethodPosition.CallbackEnd);                    
    }
    public visibleMenuItems() {
        var trace = this.classTrace("visibleMenuItems");
        trace(TraceMethodPosition.Entry);        
        var ret = _.chain(this.menuItems).filter(mi => mi.IsDisplayed).value();
        trace(TraceMethodPosition.Exit);
    }
    
    public navigateToRoute(route: string): void {
        if (!route) return;        
        var trace = this.classTrace("navigateToRoute");
        trace(TraceMethodPosition.Entry);
        this.baseService.router.navigate([route]); 
        trace(TraceMethodPosition.Exit);       
    }

    private flattenMenuItems(): IMainMenuItem[]  {
        var trace = this.classTrace("flattenMenuItems");
        trace(TraceMethodPosition.Entry);        
        var ret: IMainMenuItem[] = [];
        var level: number = 1;
        var parents: number[] = [];
        this.menuItemIdGenerator = 0;
        this.getMenuItemChildren(level, null, parents, this.hubData.MenuItems, ret);
        trace(TraceMethodPosition.Exit);
        return ret;
    }

    public getClassMap(menuItem: IMainMenuItem): string {
        return `menu-image pull-left glyphicon ${menuItem.MenuItem.Icon}`;    
    }
    
    public reactToItemClick(id: number): void {
        
        var trace = this.classTrace("reactToItemClick");
        trace(TraceMethodPosition.Entry);
        
        var item = _.find(this.menuItems, mi => mi.Id == id);
        if (!item) this.baseService.loggingService.warn(`Unable to select element with Id ${id}`);
        if (item.MenuItem.SubMenus.length > 0) {
            this.setMenuItemState(item, !item.IsOpen);
        } else {
            this.navigateToRoute(item.MenuItem.Route);
        }
        
        trace(TraceMethodPosition.Exit);
    }
    
    private setMenuItemState(item: IMainMenuItem, open: boolean) {
        
        var trace = this.classTrace("setMenuItemState");
        trace(TraceMethodPosition.Entry);
        
        item.IsOpen = open;        
        _.each(this.menuItems, mi => {
           //If an item has this item in the parent chain then check to see if its immediate parent is open
           //If it is then display it.  If not then don't
           if (_.findIndex(mi.Parents, p => p == item.Id) > -1) {
                if (mi.Parent && mi.Parent.IsOpen) mi.IsDisplayed = true;
                if (mi.Parent && !mi.Parent.IsOpen) mi.IsDisplayed = false;             
                if (!open) mi.IsDisplayed = false;      
           }                       
        });
        if (open) {
            //Set other items at this level to closed if they are open
            _.chain(this.menuItems)
                .filter(mi => mi.Id !== item.Id && mi.Level == item.Level)
                .each(mi => { if (mi.IsOpen) this.setMenuItemState(mi, false); }).value();            
        }
        
        trace(TraceMethodPosition.Exit);
    }
    
    public hasSubItems(menuItem: IMainMenuItem): boolean {
        return menuItem.MenuItem.SubMenus.length > 0    
    }
    
    public showDownCaret(menuItem: IMainMenuItem): boolean {
        return menuItem.MenuItem.SubMenus.length > 0 && menuItem.IsOpen;
    }

    public showLeftCaret(menuItem: IMainMenuItem): boolean {
        return menuItem.MenuItem.SubMenus.length > 0 && !menuItem.IsOpen;
    }
    
    private getMenuItemChildren(level: number, parent: IMainMenuItem, parents: number[], currentChildren: IHubServiceMenuItem[], allItems: IMainMenuItem[] ): void {
        
        var trace = this.classTrace("getMenuItemChildren");
        trace(TraceMethodPosition.Entry);
        
        _.each(currentChildren, (mi) => {
            this.menuItemIdGenerator += 1;
            var newMenuItem: IMainMenuItem = {
                Id: this.menuItemIdGenerator,
                MenuItem: mi,
                IsDisplayed: (level == 1),
                Level: level,
                Parents: [].concat(parents),
                Parent: parent,
                IsOpen: false
            }
            
            allItems.push(newMenuItem);            
            this.getMenuItemChildren(level + 1, newMenuItem, parents.concat(newMenuItem.Id), mi.SubMenus, allItems);
        });    
        
        trace(TraceMethodPosition.Exit);
    }
    
    ngOnInit() {
        super.NotifyLoaded("Welcome");
        
        if (this.baseService.hubService.HubDataLoaded)
            this.loadMenuItems(this.baseService.hubService.HubData)
        else                   
            this.baseService.hubService.HubDataCompletedEvent.subscribe(hd => {
                this.loadMenuItems(hd);
            });

    }

}

export interface IMainMenuItem {
    Id: number,
    MenuItem: IHubServiceMenuItem,
    IsDisplayed : boolean,
    IsOpen: boolean,
    Level: number,
    Parents: number[],
    Parent: IMainMenuItem
}