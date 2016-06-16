import {Directive, Host, Input} from '@angular/core';

@Directive({
    selector: '[offClick]',
    inputs: ['offClick'],
    host: {
        '(click)': 'onClick($event)',
    }
})
export class OffClickDirective {
    @Input('offClick') offClickHandler: any;

    constructor() {
    }

    ngOnInit() {
      let self=this;
      setTimeout(() => {window.addEventListener('click', self.offClickHandler);}, 0);
    }
    
    ngOnDestroy() {
      let self=this;
      document.removeEventListener('click', self.offClickHandler);    
    }

    onClick($event: any) {
        $event.stopPropagation();
    }
}