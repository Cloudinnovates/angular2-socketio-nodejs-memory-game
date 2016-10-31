import { Component, OnInit } from '@angular/core';
import { SocketIoService, UserService } from '../../providers';
import { JwtHelper } from 'angular2-jwt';
import {Card} from '../../models/card';
import {User} from '../../models/user';
@Component({
  selector: 'my-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  cards: Card[] = [];

  jwt: string;
  decodedJwt: any;
  response: string;
  api: string;
  user: User;

  constructor(private messageService: SocketIoService,
              public jwtHelper: JwtHelper,
              private userService: UserService
  ) {

    this.jwt = localStorage.getItem('jwt');
    this.decodedJwt = this.jwt && this.jwtHelper.decodeToken(this.jwt);
    this.user = this.userService.getCurrentUser();
    console.log('USER: ' + this.user);
    this.messageService.newCardGame.subscribe( m => {
        if(m){
        console.log(m);
          this.cards = m;
        }
      }, (e) => console.log(e)
    );
  }

  ngOnInit() {
    console.log('Hello Home');
  }
  onLogin (user: User) {
    console.log('onLogin');
    this.user = user;
    this.jwt = localStorage.getItem('jwt');
    this.decodedJwt = this.jwt && this.jwtHelper.decodeToken(this.jwt);
  }

  logout() {
    localStorage.removeItem('jwt');
    this.user = null;
    this.jwt = localStorage.getItem('jwt');
    this.decodedJwt = this.jwt && this.jwtHelper.decodeToken(this.jwt);
  }
  newGame() {
    this.messageService.newGame();
  }
}
