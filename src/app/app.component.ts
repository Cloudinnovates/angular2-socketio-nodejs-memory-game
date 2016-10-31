import { Component } from '@angular/core';
import '../style/app.scss';
@Component({
  selector: 'my-app', // <my-app></my-app>
  template: '<router-outlet></router-outlet>',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor() {
  }
}
