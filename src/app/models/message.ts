import { UUID } from 'angular2-uuid';

export class Message {

  id: string;
  username: string;
  datetime: string;
  message: string;
  isLoading: boolean;

  constructor(obj?: any) {
    this.id         = obj && obj.id         || UUID.UUID();
    this.username   = obj && obj.username   || null;
    this.datetime   = obj && obj.datetime   || new Date();
    this.message    = obj && obj.message    || null;
    this.isLoading  = obj && obj.isLoading  || false;
  }
}

export enum MessagingEvent {
  SendMessage,
  MessageReceived,
  NewMessage
}
