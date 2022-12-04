import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { observable, Observable } from 'rxjs';
import { ChatService } from 'src/app/services/chat.service';
import { Message } from 'src/app/services/chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  @ViewChild(IonContent ) content!: IonContent;
  // @ViewChild(IonCont<ent, { static: false }) content!: IonContent;
  messages : Observable<Message[]> | undefined; 
  // messages : any;
  newMsg:any = '';

  constructor(private chatService: ChatService, private router: Router) { }

   ngOnInit() {
    // right work
   this.chatService.getChatMessages().then((msg:any)=>{
    this.messages = msg;
    });
    console.log(`on init: chat message: ${this.messages}`);
  }

  // right work probles content
   sendMessage() {
    console.log(`....send message clicked....`);
    this.chatService.addChatMessage(this.newMsg).then(() =>{
      this.newMsg = '';
      console.log(`sendMessage: newMsg: ${this.newMsg}`);
      this.content.scrollToBottom();  // probles here
    }, err =>{
      console.log('sendMessage: error ', err);
    });
  }

  // right work but alert for confirmation msg
  signOut(){
    this.chatService.signOut().then(() => {
      this.router.navigateByUrl('/', { replaceUrl: true });
    });
  }

}
