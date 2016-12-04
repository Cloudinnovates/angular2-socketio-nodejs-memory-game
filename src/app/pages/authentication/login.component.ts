import {Component, Output, EventEmitter, ViewChild} from '@angular/core';

import {User} from '../../models/user';
import {UserService} from '../../providers';
declare var $:any;
@Component({
  selector: 'my-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  @Output() onLogin = new EventEmitter<User>();
  @ViewChild('username') usernameInput;
  constructor(private userService: UserService) {

  }
  login(event, username) {
    event.preventDefault();
    this.userService.login(username).then((user) => {
        this.onLogin.emit(user);
      },
      (a) => {
        console.log('SOMETHING GONE WRONG', a);
      });
  }

  ngAfterViewInit(){
    console.log('Login Init');
    // $(this.usernameInput.nativeElement).val('gasd');
  }
}
