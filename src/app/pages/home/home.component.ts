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
  cardsDemo: Card[] = [
    new Card({id: 1, image: 1}),
    new Card({id: 5, image: 3}),
    new Card({id: 2, image: 1}),
    new Card({id: 3, image: 2}),
    new Card({id: 6, image: 3}),
    new Card({id: 4, image: 2})
  ];
  tabSelected = 1;
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
    this.messageService.authorizationExpired.subscribe( m => {
        if ( m ) {
          this.logout();
        }
    });
    this.messageService.newCardGame.subscribe( m => {
        if ( m ) {
          this.cards = m;
          console.log(this.cards);
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
    this.messageService.disconectSocket();
  }
  newGame() {
    this.messageService.newGame();
  }
  tabClick(selectedTab){
    this.tabSelected = selectedTab;
  }
}
