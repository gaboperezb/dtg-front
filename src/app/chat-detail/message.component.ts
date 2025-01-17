import { Component, OnInit, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import { ChatService } from '../core/chat.service';
import { AuthService } from '../core/auth.service';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';


@Component({
    selector: 'message',
    templateUrl: './message.component.html',
    styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit {

    @Output() scroll = new EventEmitter();
    @Input() message: any;
    @Input() unreadMessages: any;
    @Input() chat: any;
    @Input() i: number;
    @Input()
    set ready(isReady: boolean) {
        this.last = isReady;
    }
    toggleDate: boolean = false;
    last: any;
    conversationThread: boolean = false;
    optionsLinkified: any = {
        formatHref: function (href, type) {
            if (type === 'mention') {
                href = '/mentiondtg' + href.substring(1);
            }
            return href;
        }
    }


    constructor(
        private keyboard: Keyboard,
        public authService: AuthService,
        private navCtrl: NavController,
        private inAppBroswer: InAppBrowser,
        private el: ElementRef,
        private router: Router,
        public chatService: ChatService) {

    }


    ngOnInit() {
        this.checkConvThread();
    }

    goToThread() {

        if (this.keyboard.isVisible) {
            this.keyboard.hide();
            setTimeout(() => {
                if (this.message.thread.title) {
                    let information = {
                        fcmThread: true, //porque nunca se usa paramSignup para thread-detail, solo en este caso.
                        threadId: this.message.thread._id
                    }

                    this.authService.paramSignUp = information;
                    this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/thread-detail', this.message.thread._id]);

                }
            }, 400);

        } else {
            let information = {
                fcmThread: true, //porque nunca se usa paramSignup para thread-detail, solo en este caso.
                threadId: this.message.thread._id
            }

            this.authService.paramSignUp = information;
            this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/thread-detail', this.message.thread._id]);
        }




    }

    goToTake() {

        if (this.keyboard.isVisible) {
            this.keyboard.hide();
            setTimeout(() => {
                if (this.message.take.take) {
                    let information = {
                        fcmTake: true, //porque nunca se usa paramSignup para thread-detail, solo en este caso.
                        takeId: this.message.take._id
                    }

                    this.authService.paramSignUp = information;
                    this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/take-detail', this.message.take._id]);

                }
            }, 400);

        } else {
            let information = {
                fcmTake: true, //porque nunca se usa paramSignup para thread-detail, solo en este caso.
                takeId: this.message.take._id
            }

            this.authService.paramSignUp = information;
            this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/take-detail', this.message.take._id]);
        }




    }

    checkConvThread() {
        if (this.i == 0) {
            this.conversationThread = false;
        } else {
            this.conversationThread = this.chatService.channelMessages[this.chat._id][this.i - 1].user._id == this.message.user._id
        }

    }

    showDate() {
        if (!this.keyboard.isVisible) this.toggleDate = !this.toggleDate;
    }

    ngAfterViewInit() {
        if (this.last) {

            this.scrollToItem();

        }

        let elements = this.el.nativeElement.querySelector('a')
        if (elements) elements.addEventListener('click', this.onClick.bind(this));
    }

    onClick(event) {
      
        event.preventDefault();
        event.stopPropagation();
        let href = event.srcElement.href;
       
        let path = event.srcElement.pathname
        if (path.substring(1,11) == 'mentiondtg') {

            
            let user = this.chat.members.find(m => m.username == path.substring(11))
           
            if(user) {
                let information = {
                    fcm: true,
                    userId: user._id
                }
    
                this.authService.paramSignUp = information;
                this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/user', user._id]);
            }
            

        } else {
            const browser = this.inAppBroswer.create(href, '_system');
            
        }

    }


    goToUser() {

        if (this.keyboard.isVisible) {
            this.keyboard.hide();
            setTimeout(() => {
                let information = {
                    fcm: true,
                    userId: this.message.user._id
                }

                this.authService.paramSignUp = information;
                this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/user', this.message.user._id]);
            }, 400);

        } else {
            let information = {
                fcm: true,
                userId: this.message.user._id
            }

            this.authService.paramSignUp = information;
            this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/user', this.message.user._id]);
        }
    }

    scrollToItem() {
        setTimeout(() => {
            this.scroll.emit({});
        }, 0);

    }


    displayDate(date: string) {
        var d = new Date(date),
            minutes = d.getMinutes().toString().length == 1 ? '0' + d.getMinutes() : d.getMinutes(),
            hours = d.getHours().toString().length == 1 ? '0' + d.getHours() : d.getHours(),
            ampm = d.getHours() >= 12 ? 'pm' : 'am',
            months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            isToday = new Date().getDate() == d.getDate() ? 'Today' : ""

        if (new Date().getDate() == d.getDate() && new Date().getMonth() == d.getMonth() && new Date().getFullYear() == d.getFullYear()) {
            return "Today\n" + hours + ':' + minutes + ampm;
        }
        else {
            return d.getMonth() + 1 + '/' + d.getDate() + '/' + d.getFullYear().toString().substr(-2) + '\n' + hours + ':' + minutes + ampm;
        }


    }


}
