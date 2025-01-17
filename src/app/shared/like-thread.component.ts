import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NavController, ModalController } from '@ionic/angular';
import { AuthService } from '../core/auth.service';
import { FcmProvider } from '../core/fcm.service';
import { SignupAppPage } from '../signup-app/signup-app.page';
import { Router } from '@angular/router';




@Component({
    selector: 'like-thread',
    template: `

    <div #likebtn (click)="likeClick($event)" class="like-div">
        <ion-button [class.heart-container]="true" [color]="color ? color : 'light'" [class.custom-btn]="thread?.likedByUser"  fill="clear" size="small" slot="start">
            <ion-icon *ngIf="!color" [name]="thread?.likedByUser ? 'heart-red' : 'heart-outline-white'"></ion-icon>
            <ion-icon *ngIf="color" [name]="thread?.likedByUser ? 'heart-red' : 'heart-outline-gray'"></ion-icon>
            <div  *ngIf="thread?.count > 0" [class.count]="true" [class.custom-btn]="thread?.likedByUser">{{thread?.count}}</div>
            <div  *ngIf="thread?.count == 0"[class.count]="true" [class.custom-btn]="thread?.likedByUser">Like</div>
        </ion-button>
    </div>

    `,
    styles: [

        `

    ion-icon {
        font-size: 16px;
        margin-right: 5px !important;
    }
  
    .count {
        font-size: 14px;
        font-weight: 500;
        
    }
    .custom-btn {
        color: #EB4B59 !important;
    }
    .like-div {
        display: inline-block;
        width: 63px;
    }`,]
})
export class LikeThreadComponent {
    @Input() thread: any; //timeline/answer o thread DRY()
    @Input() color: string;
    @Input() initialPath: string;
    @Output() like = new EventEmitter();


    constructor(private router: Router, private fcm: FcmProvider, private authService: AuthService, private modalCtrl: ModalController, private navCtrl: NavController) {

    }


    likeClick(event) {

        
        event.stopPropagation();
        
        if (this.authService.isLoggedIn()) {
            this.fcm.impact('light');
            this.like.emit({});
        }
        else {
            //Mandar a signup
            let data = {
                message: 'Sign up to like this post!',
            }
            this.modalCtrl.create({
                component: SignupAppPage,
                componentProps: {
                    data
                }
            }).then(modal => {
                modal.present();
                modal.onDidDismiss()
                    .then((data: any) => {
                        if (data.data.goToSignGlobal) {

                            let typeParams = {
                                type: data.data.type,
                                fromInitialPage: false
                            }

                            this.authService.paramSignUp = typeParams;
                            this.navCtrl.navigateForward('/signup-global');
                        }
                    })
            })


        }
    }

}