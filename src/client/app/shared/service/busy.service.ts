import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class BusyService {
    
    private notifyBusySource = new Subject<number>();
    private busyCount: number =  0;
    notifyBusy$ = this.notifyBusySource.asObservable();

    public notifyBusy(isBusy: boolean) {
        this.busyCount += (isBusy ? 1 : -1);
        if (this.busyCount < 0) this.busyCount = 0;
        this.notifyBusySource.next(this.busyCount);        
    }
    
    public get appIsBusy(): boolean { return (this.busyCount == 0) }

}
