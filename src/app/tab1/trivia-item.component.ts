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
    selector: 'trivia-item',
    templateUrl: './trivia-item.component.html',
    styleUrls: ['./trivia-item.component.scss'],
})
export class TriviaItemComponent {

    @Input() trivia: ITrivia;
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
        this.transitionImages();
        this.triviaStatus()

    }

    triviaStatus() {
        if (this.authService.currentUser && this.authService.currentUser.dailyTrivias && this.authService.currentUser.dailyTrivias.length) {
            this.triviaAnswered = this.authService.currentUser.dailyTrivias.find(t => t.trivia == this.trivia._id);
            if (!!this.triviaAnswered && this.triviaAnswered.answer) {
                this.trivia.correct = this.triviaAnswered.answer == this.trivia.correctOption ? true : false;
            } else if (!!this.triviaAnswered && this.triviaAnswered.timesUp) {
                this.trivia.correct = false;
            } else {
                this.trivia.pending = true;
            }
        } else {
            this.trivia.pending = true;
        }
    }

    transitionImages() {
        this.images = this.trivia.options.map(option => option.picture);
        this.currentImage = this.images[0]
        this.imageInterval = setInterval(() => {
            if (this.counter == this.images.length) {
                this.counter = 0;
                this.allImagesLoaded = true;
            }

            if(!this.allImagesLoaded) {
                var img = new Image();
                img.src =  this.images[this.counter];
                img.onload =  () => {
                    this.currentImage = this.images[this.counter]
                    this.counter++;
                    img = undefined;
                };
            } else {
        
                this.currentImage = this.images[this.counter]
                this.counter++;
            }

    
        }, 3000);
    }


    ngOnDestroy() {
        clearInterval(this.imageInterval);
    }

    goToTrivia() {

        if(this.trivia.pending) this.fcm.impact('light')
        if (this.authService.isLoggedIn()) {

            this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/trivia-detail', this.trivia._id]);
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
