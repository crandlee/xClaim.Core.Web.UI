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

    public hubData: IHubServiceData =  { apiEndpoints: [], menuItems: [], scopes:"", userId: "" };
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
        this.hubData.menuItems = _.chain(this.hubData.menuItems)
            .sortBy(mi => mi.description)
            .value();
        this.menuItems = this.flattenMenuItems();
        this.hubDataLoaded = true;
        trace(TraceMethodPosition.CallbackEnd);                    
    }
    public visibleMenuItems() {
        var trace = this.classTrace("visibleMenuItems");
        trace(TraceMethodPosition.Entry);        
        var ret = _.chain(this.menuItems).filter(mi => mi.isDisplayed).value();
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
        this.getMenuItemChildren(level, null, parents, this.hubData.menuItems, ret);
        trace(TraceMethodPosition.Exit);
        return ret;
    }

    public getClassMap(menuItem: IMainMenuItem): string {
        return `menu-image pull-left glyphicon ${menuItem.menuItem.icon}`;    
    }
    
    public reactToItemClick(id: number): void {
        
        var trace = this.classTrace("reactToItemClick");
        trace(TraceMethodPosition.Entry);
        
        var item = _.find(this.menuItems, mi => mi.id == id);
        if (!item) this.baseService.loggingService.warn(`Unable to select element with Id ${id}`);
        if (item.menuItem.subMenus.length > 0) {
            this.setMenuItemState(item, !item.isOpen);
        } else {
            this.navigateToRoute(item.menuItem.route);
        }
        
        trace(TraceMethodPosition.Exit);
    }
    
    private setMenuItemState(item: IMainMenuItem, open: boolean) {
        
        var trace = this.classTrace("setMenuItemState");
        trace(TraceMethodPosition.Entry);
        
        item.isOpen = open;        
        _.each(this.menuItems, mi => {
           //If an item has this item in the parent chain then check to see if its immediate parent is open
           //If it is then display it.  If not then don't
           if (_.findIndex(mi.parents, p => p == item.id) > -1) {
                if (mi.parent && mi.parent.isOpen) mi.isDisplayed = true;
                if (mi.parent && !mi.parent.isOpen) mi.isDisplayed = false;             
                if (!open) mi.isDisplayed = false;      
           }                       
        });
        if (open) {
            //Set other items at this level to closed if they are open
            _.chain(this.menuItems)
                .filter(mi => mi.id !== item.id && mi.level == item.level)
                .each(mi => { if (mi.isOpen) this.setMenuItemState(mi, false); }).value();            
        }
        
        trace(TraceMethodPosition.Exit);
    }
    
    public hasSubItems(menuItem: IMainMenuItem): boolean {
        return menuItem.menuItem.subMenus.length > 0    
    }
    
    public showDownCaret(menuItem: IMainMenuItem): boolean {
        return menuItem.menuItem.subMenus.length > 0 && menuItem.isOpen;
    }

    public showLeftCaret(menuItem: IMainMenuItem): boolean {
        return menuItem.menuItem.subMenus.length > 0 && !menuItem.isOpen;
    }
    
    private getMenuItemChildren(level: number, parent: IMainMenuItem, parents: number[], currentChildren: IHubServiceMenuItem[], allItems: IMainMenuItem[] ): void {
        
        var trace = this.classTrace("getMenuItemChildren");
        trace(TraceMethodPosition.Entry);
        
        _.each(currentChildren, (mi) => {
            this.menuItemIdGenerator += 1;
            var newMenuItem: IMainMenuItem = {
                id: this.menuItemIdGenerator,
                menuItem: mi,
                isDisplayed: (level == 1),
                level: level,
                parents: [].concat(parents),
                parent: parent,
                isOpen: false
            }
            allItems.push(newMenuItem);            
            this.getMenuItemChildren(level + 1, newMenuItem, parents.concat(newMenuItem.id), mi.subMenus, allItems);
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
    id: number,
    menuItem: IHubServiceMenuItem,
    isDisplayed : boolean,
    isOpen: boolean,
    level: number,
    parents: number[],
    parent: IMainMenuItem
}