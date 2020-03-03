import { Injectable } from '@angular/core';
import {Message} from './class/message';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  messages: Message[] = [];

  add(message: string) {
    const dt = new Date();
    const utcDate = dt.toUTCString();
    const msg: Message = {text: message , timestamp: utcDate};
    this.messages.push(msg);
  }
  clear(): void {
    this.messages = [];
  }
}
