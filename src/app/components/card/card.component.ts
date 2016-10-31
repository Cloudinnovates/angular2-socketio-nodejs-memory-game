import {Component, OnInit, Input} from '@angular/core';
import { SocketIoService, UserService } from '../../providers';
import {Card} from '../../models/card';
import {User} from '../../models/user';
@Component({
  selector: 'my-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {
  flip: boolean = false;
  private user: User;
  @Input() item: Card;
  constructor(private messageService: SocketIoService, private userService: UserService ) {
    this.user = userService.getCurrentUser();
    this.messageService.statusCard.subscribe( m => {
        if (m && this.item && m.id == this.item.id) {
          console.log(m);
          this.item = m ;
        }
      }, (e) => console.log(e)
    );
  }
  ngOnInit() {
    console.log('Hello Card');
  }
  getFlip($event) {
    this.item.userId = this.user.id;
    this.messageService.sendCard(this.item);
  }

}
