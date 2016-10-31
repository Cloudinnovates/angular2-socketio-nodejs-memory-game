import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Http } from '@angular/http';
import {JwtHelper} from 'angular2-jwt';
import {contentHeaders} from '../utils/headers';
import {Subject, BehaviorSubject, Observable, ConnectableObservable, ReplaySubject} from 'rxjs';
import {Message, MessagingEvent} from '../models/message';
import {Card, CardEvent} from '../models/card';
import {User} from '../models/user';
import 'rxjs/add/operator/map';

@Injectable()
export class UserService {
  private baseUri = 'http://fersz.dlinkddns.com:8888';
  private loginUrl =  this.baseUri + '/user/create';
  private currentUser: User;
  public userSubject: Subject<User> = new BehaviorSubject<User>(null);
  public authError: Subject<string> = new BehaviorSubject<string>(null);
  constructor(private http: Http, private jwtHelper: JwtHelper) {
  }
  login(username: string): Promise<User> {
    return this.post(this.loginUrl, username);
  }
  private post(url: string, username: string): Promise<User> {
    let body = JSON.stringify({ username: username });
    return this.http.post(url, body, { headers: contentHeaders }).toPromise()
      .then(response => {
        let userJson = response.json();
        localStorage.setItem('jwt', userJson.id_token);
        this.currentUser = new User(this.jwtHelper.decodeToken(userJson.id_token));
        this.userSubject.next(this.currentUser);
        return this.currentUser || { };
      }, error => {
        this.authError.next(error.text());
        console.log(error.text());
        return Promise.reject(error.text());
      });
  }
  getCurrentUser(): User {
    if (this.currentUser == null) {
      let jwt = localStorage.getItem('jwt');
      if (jwt) {
        this.currentUser = new User(this.jwtHelper.decodeToken(jwt));
        this.userSubject.next(this.currentUser);
      } else
        this.authError.next('no user signed in.');
    }
    return this.currentUser;
  }
}



@Injectable()
export class SocketIoService {
  private jwt;
  private baseUri = 'http://fersz.dlinkddns.com:8888';
  private socket;
  /* --- CHAT SUBJECTS ------------------------------------------------------------------------------------------ --- */
  newMessage: Subject<Message> = new BehaviorSubject<Message>(null);
  receivedMessage: Subject<string> = new Subject<string>();
  /* --- CARD SUBJECTS ------------------------------------------------------------------------------------------ --- */
  statusCard: Subject<Card> = new BehaviorSubject<Card>(null);
  newCardGame: Subject<Card[]> = new BehaviorSubject<Card[]>(null);

  constructor(private userService: UserService) {
    console.log('Hello SocketIoService', userService);
    userService.userSubject.subscribe(  m => {
        if (m != null) {
        console.log("USER IS HERE");
          this.connectSocket();
        }
      }, (e) => console.log(e)
    );
  }
  getJWT(): string{
    this.jwt = localStorage.getItem('jwt');
    console.log('getJWT => ' + this.jwt);
    return this.jwt;
  }
  connectSocket(){
    console.log(this.socket);
    if(!this.socket){
      this.socket = io.connect(this.baseUri, {query: 'token=' + this.getJWT()})
      this.socket.on('connect', () => {
        console.log('connected');
        this.currentGame();
      });
      this.socket.on('disconnect', () => {
        console.log('disconnected');
      });
      /* --- CHAT LISTENERS --------------------------------------------------------------------------------------- --- */
      this.socket.on(MessagingEvent[MessagingEvent.NewMessage], (msg) => {
        this.newMessage.next(new Message(JSON.parse(msg)));
      });
      this.socket.on(MessagingEvent[MessagingEvent.MessageReceived], (msgId) => {
        this.receivedMessage.next(msgId);
      });
      /* --- CARD LISTENERS --------------------------------------------------------------------------------------- --- */
      this.socket.on(CardEvent[CardEvent.CardStatus], (msg) => {
        this.statusCard.next(new Card(JSON.parse(msg)));
      });
      this.socket.on(CardEvent[CardEvent.CardNewGameReceived], (msg) => {
        var aux : Card[] = [];
        for (var card of msg){
          console.log(card);
          aux.push(new Card(card));
        }
        this.newCardGame.next(aux);
      });
    }
  }


  sendMessage(message: Message): void {
    let msg = JSON.stringify(message);
    this.socket.emit(MessagingEvent[MessagingEvent.SendMessage], msg);
  }
  sendCard(message: Card): void {
    let msg = JSON.stringify(message);
    this.socket.emit(CardEvent[CardEvent.CardClicked], msg);
  }
  newGame():void {
    this.socket.emit(CardEvent[CardEvent.CardNewGame], {});
  }
  currentGame():void {
    this.socket.emit(CardEvent[CardEvent.CardCurrentGame], {});
  }
}