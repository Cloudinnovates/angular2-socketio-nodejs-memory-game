export class User {
  id: string;
  username: string;
  isOnline: boolean;
  score: number;

  constructor(obj?: any) {
    this.id       =   obj && obj.id       || null;
    this.username =   obj && obj.username || null;
    this.isOnline =   obj && obj.isOnline || false;
    this.score    =   obj && obj.score    || 0;
  }
}