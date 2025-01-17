import { Component, OnInit, ViewChild, Input, ElementRef } from '@angular/core';
import { PlayService } from '../core/play.service';
import { ITrivia } from '../shared/interfaces';
import { ModalController, NavController } from '@ionic/angular';
import { TriviaDetailPage } from '../trivia-detail/trivia-detail.page';
import { AuthService } from '../core/auth.service';
import { FcmProvider } from '../core/fcm.service';
import { Router } from '@angular/router';
import { SignupAppPage } from '../signup-app/signup-app.page';


@Component({
    selector: 'pick-item',
    templateUrl: './pick-item.component.html',
    styleUrls: ['./pick-item.component.scss'],
})
export class PickItemComponent {

    @Input() pick: ITrivia;
    images: string[] = [];
    currentImage: string;
    counter: number = 1;
    imageInterval: any;
    triviaAnswered: any;
    allImagesLoaded: boolean = false;
    constructor(public playService: PlayService,
        private modalCtrl: ModalController,
        private navCtrl: NavController,
        private router: Router,
        private authService: AuthService,
        private fcm: FcmProvider) { }

    ngOnInit() {
        this.playStatus()

    }

    playStatus() {
        if (this.authService.currentUser && this.authService.currentUser.dailyTrivias && this.authService.currentUser.dailyTrivias.length) {
            this.triviaAnswered = this.authService.currentUser.dailyTrivias.find(t => t.trivia == this.pick._id);
            if (!!this.triviaAnswered && this.triviaAnswered.answer) {
                this.pick.correct = this.triviaAnswered.answer == this.pick.correctOption ? true : false;
            } else if (!!this.triviaAnswered && this.triviaAnswered.timesUp) {
                this.pick.correct = false;
            } else {
                this.pick.pending = true;
            }
        } else {
            this.pick.pending = true;
        }
    }

    

    ngOnDestroy() {
       
    }

    goToPick() {

        if(this.pick.pending) this.fcm.impact('light')
        if (this.authService.isLoggedIn()) {
            this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/trivia-detail', this.pick._id]);
        } else {
            let data = {
                message: 'Sign up to play!',
            }
            this.modalCtrl.create({
                component: SignupAppPage,
                componentProps: {
                    data
                }
            }).then(modal => {
                modal.present();
                modal.onDidDismiss()
                    .then(data => {

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
