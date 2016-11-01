import {Component, OnInit, Input, ViewChild, ElementRef, EventEmitter} from '@angular/core';
import { SocketIoService , UserService} from '../../providers';
import {Message} from '../../models/message';
import {NgClass} from "@angular/common";
import {User} from "../../models/user";
@Component({
  selector: 'my-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  messages: Array<any> = [];
  draftMessageText: string;
  private user: User;

  constructor(private messageService: SocketIoService, private userService: UserService) {
    this.user = userService.getCurrentUser();
    this.messageService.newMessage.subscribe( m => {
        if (m != null) {
          console.log(m);
          m.isLoading = false;
          this.messages.push(m);
        }
      }, (e) => console.log(e)
    );
  }

  ngOnInit() {
    console.log('Hello Chat');
  }
  onEnter(event: any): void {
    this.sendMessage();
    event.preventDefault();
  }
  sendMessage(): void {
    this.user = this.userService.getCurrentUser();
    let m = new Message({
      username: this.user.username,
      datetime: new Date().toISOString(),
      isLoading: true,
      message: this.draftMessageText
    });
    this.draftMessageText = '';
    this.messages.push(m);
    this.messageService.sendMessage(m);
  }
  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.log(err);
    }
  }
}

@Component({
  selector: 'my-message-row',
  styleUrls: ['./message-row.component.scss'],
  templateUrl: './message-row.component.html',
  inputs: [
    'message'
  ],
  outputs: [
    'change'
  ]
})
export class MessageRowComponent {
  messageMode: number;
  change = new EventEmitter<any>();
  message: Message;
  timeAgo: string;
  user: User;
  constructor(private messageService: SocketIoService, private userService: UserService) {
    this.messageService.receivedMessage
      .delay(1000).subscribe(msgId => {
        if (this.message.id === msgId) {
          this.message.isLoading = false;
        }
      });
  }
  ngOnInit() {
    this.messageMode = this.userService.getCurrentUser().username === this.message.username ? 1 : 0;
    this.timeAgo = this.calcTimeAgo(this.message.datetime);
    setInterval(() => {
      this.timeAgo = this.calcTimeAgo(this.message.datetime);
    }, 30000);
  }
  calcTimeAgo(messageTime: string): string {
    let today = new Date();
    let diffMs = Math.abs(new Date(messageTime.toString()).getTime() - today.getTime()); // milliseconds between now & Christmas
    let diffDays = Math.round(diffMs / 86400000); // days
    if (diffDays >= 7) {
      var weekCount = Math.floor(diffDays / 7);
      if (weekCount >= 4) {
        var monthCount = Math.floor(weekCount / 4);
        if (monthCount === 1) {
          return '1 month ago';
        } else {
          return monthCount + ' months ago';
        }
      } else if (weekCount < 4 && weekCount > 1) {
        return weekCount + ' weeks ago';
      } else {
        return '1 week ago';
      }
    } else if (diffDays < 7 && diffDays > 1) {
      return diffDays + ' days ago';
    } else if (diffDays === 1) {
      return '1 day ago';
    } else {
      var diffHrs = Math.round((diffMs % 86400000) / 3600000); // hours
      if (diffHrs > 1) {
        return diffHrs + 'hours ago';
      } else if (diffHrs === 1) {
        return '1 hour ago';
      } else {
        var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
        if (diffMins > 1) {
          return diffMins + ' minutes ago';
        } else if (diffMins === 1) {
          return '1 minute ago';
        } else {
          var diffSeconds = Math.round(diffMs / 1000);
          if (diffMins >= 3) {
            return diffSeconds + ' seconds ago';
          } else {
            return 'a moment ago';
          }
        }
      }
    }
  }
}
