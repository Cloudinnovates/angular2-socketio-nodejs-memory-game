import { Component, OnInit, Input }       from '@angular/core';
import { SocketIoService , UserService }  from '../../providers';
import { User }                           from '../../models/user';
@Component({
  selector: 'my-scoreboard',
  templateUrl: './scoreboard.component.html',
  styleUrls: ['./scoreboard.component.scss']
})
export class ScoreboardComponent implements OnInit {
  private users: User[];
  private currentUser: User;
  constructor(private messageService: SocketIoService, private userService: UserService) {
    this.currentUser = userService.getCurrentUser();
    this.messageService.receivedAllUser.subscribe( m => {
        if (m != null) {
          console.log(m);
          this.users = m;
        }
      }, (e) => console.log(e)
    );
    this.messageService.receivedSingleUser.subscribe(m => {
      if (m != null) {
        console.log(m);
        let found = false;
        for ( let u of this.users ){
          if (u.id === m.id) {
            found = true;
          }
        }
        if (!found) {
          this.users.push(m);
        }
      }
    });
  }

  ngOnInit() {
    console.log('Hello Scoreboard');
  }

  logout(){
    this.messageService.logout();
  }
}
@Component({
  selector: 'my-user-row',
  styleUrls: ['./user-row.component.scss'],
  templateUrl: './user-row.component.html'
})
export class UserRowComponent {
  @Input() user: User;
  constructor(private messageService: SocketIoService) {
    this.messageService.receivedSingleUser.subscribe(m => {
      if (m != null && this.user != null) {
        if (this.user.id === m.id) {
          this.user = m;
        }
      }
    });
  }
  ngOnInit() {
    console.log('Hello User Row');
  }
}
