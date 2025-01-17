import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ViewChild } from '@angular/core';
import { NavController, ModalController, LoadingController, ToastController, ActionSheetController, AlertController } from '@ionic/angular';
import { IThread, ITimeline, ITake, ITrivia } from '../shared/interfaces';
import { AuthService } from '../core/auth.service';
import { ThreadLikesService } from '../core/thread-likers.service';
import { ThreadDiscussionService } from '../core/thread-discussion.service';
import { WebSocketService } from '../core/websocket.service';
import { AppState } from '../core/state.service';
import { FcmProvider } from '../core/fcm.service';
import { Router } from '@angular/router';
import { AddCommentPage } from '../add-comment/add-comment.page';
import { SignupAppPage } from '../signup-app/signup-app.page';
import { EditCommentPage } from '../edit-comment/edit-comment.page';
import { TakeDiscussionService } from '../core/take-discussion.service';
import { PlayDiscussionService } from '../core/play-discussion.service';


@Component({
    selector: 'trivia-timeline-item',
    templateUrl: './trivia-timeline-item.component.html',
    styleUrls: ['./trivia-timeline-item.component.scss']
})
export class TriviaTimelineItemComponent {

    @Input() timeline: ITimeline;
    @Input() trivia: ITrivia;
    @Output() deleteComment = new EventEmitter();
    profilePicture: any;
    discussionOrAnswer: string = "discussion"; //Para que likers service distinga entre timeline y respuesta, y así aplicar DRY.

    constructor(public navCtrl: NavController,
        private alertCtrl: AlertController,
        public authService: AuthService,
        private actionSheetCtrl: ActionSheetController,
        private fcm: FcmProvider,
        private playDiscussionService: PlayDiscussionService,
        private likesService: ThreadLikesService,
        private router: Router,
        public global: AppState,
        private modalCtrl: ModalController,
        private toastCtrl: ToastController,
        private loadingCtrl: LoadingController,
        private threadDiscussionService: ThreadDiscussionService,
        private webSocketService: WebSocketService) {

    }


    goToUser(event, user) {

        if (this.authService.isLoggedIn()) {
            if (this.authService.currentUser.username == user.username) {
                this.authService.downloadProfile = true;
                let data = {
                    fromTabs: false,
                    loadInitial: true
                }
                this.authService.paramSignUp = data;


                this.navCtrl.navigateForward(this.router.url.substr(0, 10) + '/profile');

            } else {
                let data = {
                    user: user
                }
                this.authService.paramSignUp = data;


                this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/user', user._id]);

            }

        } else {
            let data = {
                user: user
            }
            this.authService.paramSignUp = data;


            this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/user', user._id]);

        }

    }

    replyTo() {

        if (this.authService.isLoggedIn()) {
            let data = {
                username: this.timeline.user.username
            }

            this.modalCtrl.create({
                component: AddCommentPage,
                componentProps: {
                    data
                }
            }).then(modal => {
                modal.present();
                modal.onDidDismiss()
                    .then(data => {
                        if (data.data.comment) {
                            if (data.data.comment.length > 0) {
                                this.sendComment(data.data.comment); 
                            }
                        }
                    })
            })


        } else {
            let data = {
                message: 'Sign up to comment and reply!',
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

    edit() {

        this.actionSheetCtrl.create({
            header: 'ACTION',
            cssClass: 'my-custom-action',
            buttons: [
                {
                    text: 'Edit',
                    handler: () => {
                        let data = {
                            comment: this.timeline
                        }
                        this.modalCtrl.create({
                            component: EditCommentPage,
                            componentProps: {
                                data: data
                            }
                        }).then(modal => {
                            modal.present();
                            modal.onDidDismiss()
                                .then(data => {
                                    if (data.data.comment != null) this.timeline.discussion = data.data.comment;
                                })
                        })

                    }
                },
                {
                    text: 'Delete',
                    handler: () => {
                        this.alertCtrl.create({
                            header: 'Do you want to delete this comment?',
                            buttons: [
                                {
                                    text: 'Cancel',
                                    role: 'cancel',
                                    handler: () => {
                                    }
                                },
                                {
                                    text: 'Yes',
                                    handler: () => {
                                        this.deleteDiscussion();
                                    }
                                }
                            ]
                        }).then(alert => alert.present())

                    }
                },
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {

                    }
                }
            ]
        }).then(as => as.present())

    }


    deleteDiscussion() {

        this.loadingCtrl.create({
            spinner: 'crescent',
            cssClass: 'my-custom-loading'
        }).then(loader => {
            loader.present();
            let data = {
                dId: this.timeline._id,
                triviaId: this.trivia._id,
                userId: this.authService.currentUser._id
            }

            this.playDiscussionService.deleteTriviaComment(data)
                .subscribe((success) => {
                    if (success) {
                        this.deleteComment.emit(this.timeline._id);
                        loader.dismiss();

                    } else {

                        this.toastCtrl.create({
                            message: 'This comment has already been deleted',
                            duration: 3000,
                            position: 'bottom'
                        }).then(toast => {
                            toast.present();
                            loader.dismiss()
                        })


                    }
                },
                    (err) => {
                        this.toastCtrl.create({
                            message: err,
                            duration: 3000,
                            position: 'bottom'
                        }).then(toast => {
                            toast.present();
                            loader.dismiss();
                        })


                    });
        })




    }


    sendComment(comment: string) {

        this.loadingCtrl.create({
            spinner: 'crescent',
            message: 'Sending...',
            cssClass: 'my-custom-loading'
        }).then(loader => {
            loader.present();
            if (this.authService.isLoggedIn()) {
                let data = {
                    triviaId: this.trivia._id,
                    response: comment,
                    parent: this.timeline._id,
                    userMention: this.timeline.user._id,
                    playerIds: this.timeline.user.playerIds


                }
                this.playDiscussionService.postTriviaAnswer(data, this.trivia._id, this.timeline._id, this.timeline.discussion)
                    .subscribe((answer: any) => {

                        this.webSocketService.emitPost(this.trivia._id, "trivia", this.timeline.user._id, this.authService.currentUser._id)
                        if (this.timeline.numberOfAnswers > 0) this.timeline.numberOfAnswers += 1;
                        else this.timeline.numberOfAnswers = 1;
                        answer.count = 0;
                        loader.dismiss();

                    },
                        (err) => {
                            this.toastCtrl.create({
                                message: err,
                                duration: 3000,
                                position: 'bottom',
                                cssClass: "toast",
                            }).then(toast => {
                                toast.present();
                                loader.dismiss();
                            })

                        });
            }
        })



    }

    goToDetail() {
        let data = {
            timeline: this.timeline,
            trivia: this.trivia
        }
        this.authService.paramSignUp = data;


        this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/trivia-timeline-detail', this.timeline._id]);

    }

    like() {

        this.fcm.impact("light");
        if (this.authService.isLoggedIn()) {
            if (this.userHasLiked(this.timeline)) {
                this.timeline.likedByUser = false;
                this.timeline.count -= 1;
                this.likesService.deleteLike(this.discussionOrAnswer, this.timeline, this.authService.currentUser._id);

            } else {
                this.timeline.likedByUser = true;
                this.timeline.count += 1;
                this.likesService.postLike(this.discussionOrAnswer, this.timeline, this.authService.currentUser._id);
            }
        }
        else {

            //Mandar a signup
            let data = {
                message: 'Sign up to like this comment',
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



    userHasLiked(timeline: ITimeline) {
        if (this.authService.isLoggedIn()) {
            return this.likesService.userHasLiked(timeline, this.authService.currentUser._id);
        } else {
            return false;
        }
    }

}