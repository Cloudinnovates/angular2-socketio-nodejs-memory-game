export class Card {

  id: string;
  image: string;
  userId: string;
  username: string;
  datetime: string;
  state: boolean;
  lock: boolean;
  isLoading: boolean;

  constructor(obj?: any) {
    this.id         = obj && obj.id         || null;
    this.image      = obj && obj.image      || 1;
    this.userId     = obj && obj.userId     || null;
    this.username   = obj && obj.username   || null;
    this.datetime   = obj && obj.datetime   || new Date();
    this.state      = obj && obj.state      || false;
    this.lock       = obj && obj.lock       || false;
    this.isLoading  = obj && obj.isLoading  || false;
  }
}

export enum CardEvent {
  CardNewGame,
  CardNewGameReceived,
  CardCurrentGame,
  CardClicked,
  CardStatus
}