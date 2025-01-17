import { Component } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { FlashProvider } from '../core/flash.service';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ChatService } from '../core/chat.service';

@Component({
    selector: 'flash',
    templateUrl: './flash.component.html',
    styleUrls: ['./flash.component.scss'],
    animations: [
        trigger('messageState', [
            transition('void => *', [
                style({ transform: 'translateY(-100%)' }),
                animate('200ms ease-out')
            ]),
            transition('* => void', [
                animate('180ms', style({ transform: 'translateY(-150%)' }))
            ])
        ])
    ]
})
export class FlashComponent {

    active: boolean = false;
    message: string = '';
    user: any;
    chatId: string;
    flashTime: any
    group: string;

    constructor(private flashProvider: FlashProvider,
        private router: Router,
        private chatService: ChatService,
        private navCtrl: NavController) {
        this.flashProvider.show = this.show.bind(this);
        this.flashProvider.hide = this.hide.bind(this);
    }

    show(user, message, chatId, duration, group?) {

        clearTimeout(this.flashTime);
        this.chatId = chatId;
        this.message = message;
        this.user = user;
        this.active = true;
        this.group = ""; //reset
        if (group) this.group = group;
        this.flashTime = setTimeout(() => {
            this.active = false;
        }, duration);

    }

    hide() {
        this.active = false;
        setTimeout(() => {
            this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/chat-detail', this.chatId]);
        }, 200);
       
    }

    closeGesture(e) {
    
        this.active = false;
    }
 
}