import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NavController, ModalController, LoadingController, ToastController, ActionSheetController, AlertController } from '@ionic/angular';
import { IThread, IAnswer, ITimeline, ITake, ITrivia } from '../shared/interfaces';
import { AuthService } from '../core/auth.service';
import { ThreadLikesService } from '../core/thread-likers.service';
import { ThreadDiscussionService } from '../core/thread-discussion.service'; 
import { WebSocketService } from '../core/websocket.service';
import { AppState } from '../core/state.service';
import { FcmProvider } from '../core/fcm.service';
import { Router } from '@angular/router';
import { AddCommentPage } from '../add-comment/add-comment.page';
import { SignupAppPage } from '../signup-app/signup-app.page';
import { EditAnswerPage } from '../edit-answer/edit-answer.page';
import { PlayDiscussionService } from '../core/play-discussion.service';

 
@Component({
    selector: 'trivia-answer-item',
    templateUrl: './trivia-answer-item.component.html',
    styleUrls: ['./trivia-answer-item.component.scss']
})
export class TriviaAnswerItemComponent {
    
    @Output() scroll = new EventEmitter();
    @Output() imageVisible = new EventEmitter();
    @Output() filterAnswer = new EventEmitter();
    @Input() answer: IAnswer;
    @Input() timeline: ITimeline;
    @Input() 
    set scrollTo(scrollTo: string) {
        this.focus = scrollTo;
        setTimeout(() => {
            this.focus = "";
        }, 2500);

    }
    @Input() trivia: ITrivia;
    @Input()
    set ready(isReady: boolean) {
      this.last = isReady;
    }
    showHide: string = "Hide";
    focus: string;
    last: boolean;
    showHideToggle: boolean = true;
    discussionOrAnswer: string = "answer"; //Para que likers service distinga entre answer y respuesta, y así aplicar DRY.
 
    constructor(public navCtrl: NavController,
            public authService: AuthService,
            private actionSheetCtrl: ActionSheetController,
            public global: AppState,
            private router: Router,
            private fcm: FcmProvider,
            private alertCtrl: AlertController,
            private likesService: ThreadLikesService,
            private modalCtrl: ModalController,
            private loadingCtrl: LoadingController,
            private playDiscussionService: PlayDiscussionService,
            private threadDiscussionService: ThreadDiscussionService,
            private toastCtrl: ToastController,
            private webSocketService: WebSocketService) {
        
    }

    scrollToItem() {
        this.scroll.emit({});
    }

    ngOnInit() {
        
    
    }

    ngAfterViewInit(){
        if(this.last) this.scrollToItem();
    }

    goToUser(event, user) {

        event.stopPropagation()

        
        if (this.authService.isLoggedIn()) {
            if (this.authService.currentUser.username == user.username) {
                this.authService.downloadProfile = true;
                let data = {
                    fromTabs: false,
                    loadInitial: true
                }
                this.authService.paramSignUp = data;
               
                this.navCtrl.navigateForward(this.router.url.substr(0,10) + '/profile')
                
            } else {
                let data = {
                    user: user
                }
                this.authService.paramSignUp = data;
            
               this.navCtrl.navigateForward([this.router.url.substr(0,10) + '/user', user._id])
                

            }

        } else {
            let data = {
                user: user
            }
            this.authService.paramSignUp = data;
       
           this.navCtrl.navigateForward([this.router.url.substr(0,10) + '/user', user._id])
            

        }

    }



    

    replyTo(username: string, parent: IAnswer, answer: IAnswer) {

        if(this.authService.isLoggedIn()) {

            let data = {
                username: username
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
                        if(data.data.comment) {
                            if(data.data.comment.length > 0) this.sendComment(data.data.comment, parent, answer);
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
                modal.present()
                modal.onDidDismiss()
                    .then(data => {
                        if (data.data.goToSignGlobal) {
        
                            let typeParams = {
                              type: data.data.type,
                              fromInitialPage: false
                            }
                            this.authService.paramSignUp = typeParams;
                            this.navCtrl.navigateForward('/signup-global')
                  
                          }
                    })
            })
            

        }

        
        
    }

    sendComment(comment: string, parent: IAnswer, answer: IAnswer) {

        this.loadingCtrl.create({
            spinner: 'crescent',
            message: 'Sending...',
            cssClass: 'my-custom-loading'
        }).then(loader => {
            loader.present()
            if (this.authService.isLoggedIn()) {
                let data = {
                    triviaId: this.trivia._id || this.trivia,
                    response: comment,
                    parent: parent._id,
                    userMention: answer.user._id,
                    playerIds: answer.user.playerIds
                }
                
               
                this.playDiscussionService.postTriviaAnswer(data, data.triviaId, this.timeline._id, answer.discussion, answer._id)
                                    .subscribe((_answer: any) => {
    
                                        if (this.timeline.numberOfAnswers > 0) this.timeline.numberOfAnswers+= 1;
                                        else this.timeline.numberOfAnswers = 1;
    
                                        _answer.date = new Date(_answer.date);
                                        _answer.created = "1min";
                                        _answer.count = 0;
                                        _answer.likedByUser = this.userHasLiked(_answer);
                                        
                                        
                                        //Para evitar la operacion de 'Populate' en mongo.
                                        _answer.user = {
                                            
                                            username: this.authService.currentUser.username,
                                            playerIds: this.authService.currentUser.playerIds,
                                            profilePicture: this.authService.currentUser.profilePicture,
                                            profilePictureThumbnail: this.authService.currentUser.profilePictureThumbnail,
                                            _id: this.authService.currentUser._id,
                                            badge: this.authService.currentUser.badge
                                            
                                        };
                                        
                                        //socket io
                                        this.webSocketService.emitPost(this.trivia._id, "trivia", answer.user._id, this.authService.currentUser._id)
                                        _answer.responding = {username: answer.user.username};
                                        this.answer.children.push(_answer);
                    
                                        this.imageVisible.emit({});
                                       
                                        loader.dismiss();
                                        
                                    },
                                    (err) => {
                                        this.toastCtrl.create({
                                            message: err,
                                            duration: 3000,
                                            position: 'bottom',
                                            cssClass: "toast",
                                          }).then(toast => {
                                            toast.present()
                                          })
                                          loader.dismiss();
                                          
                                    });
            }
        })
        
        
    
    }


    editAnswer(answer) {
        this.actionSheetCtrl.create({
            header: 'ACTION',
            cssClass: 'my-custom-action',
            buttons: [
                {
                    text: 'Edit',
                    handler: () => {
                        let data = {
                            comment: answer,
                            discussionId: this.timeline._id
                        }
                        
                        this.modalCtrl.create({
                            component: EditAnswerPage,
                            componentProps: {
                                data: data
                            }
                        }).then(modal => {
                            modal.present();
                            modal.onDidDismiss()
                                .then(data => {
                                    if (data.data.comment != null) answer.discussion = data.data.comment;
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
                                        this.deleteAnswer(answer);
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


    deleteAnswer(answer: any) {


     
		let loader = this.loadingCtrl.create({
            spinner: 'crescent',
            cssClass: 'my-custom-loading'
		}).then(loader => {

			loader.present();

			let data = {
				dId: this.timeline._id,
				aId: answer._id,
				triviaId: this.trivia._id || this.trivia,
				userId: this.authService.currentUser._id
            }
            
			this.playDiscussionService.deleteTriviaAnswer(data)
				.subscribe((success) => {
					if (success) {
                        
                        if(answer.children) this.filterAnswer.emit(answer._id);
                        else {
                            this.answer.children = this.answer.children.filter(_answer => _answer._id !== answer._id);
                        }
						loader.dismiss();

					} else {

						this.toastCtrl.create({
							message: 'Failed to delete answer',
							duration: 3000,
							position: 'bottom'
						}).then(t => t.present())

						loader.dismiss();

					}
				},
					(err) => {
						this.toastCtrl.create({
							message: err,
							duration: 3000,
							position: 'bottom'
						}).then(t => t.present())

						loader.dismiss();


					});

		})


	}


    like(e, answer) {
        
        this.fcm.impact("light");
        if (this.authService.isLoggedIn()) {
            if(this.userHasLiked(answer)) {
                answer.likedByUser = false;
                answer.count -= 1;
                this.likesService.deleteLike(this.discussionOrAnswer, this.timeline, this.authService.currentUser._id, answer);
                  
            } else {
                answer.likedByUser = true;
                answer.count += 1;
                this.likesService.postLike(this.discussionOrAnswer, this.timeline, this.authService.currentUser._id, answer);
            }
        }
        else {
            //mandar a registrarse
            let data = {
                message: 'Sign up to like this comment!',
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
                            this.navCtrl.navigateForward('/signup-global')
                          }
                    })

            })
            

        }
    }

   

    userHasLiked(answer: IAnswer) {
        if (this.authService.isLoggedIn()) {
            return this.likesService.userHasLiked(answer, this.authService.currentUser._id);
        } else {
            return false;
        }
    }

    toggleAnswers() {

        this.showHideToggle = !this.showHideToggle;
        if(this.showHideToggle) this.showHide = "Hide";
        else { this.showHide = "Show"}
        this.imageVisible.emit({});
        
        
    }

    created(thread: IAnswer): string {

        let milliseconds = thread.date.getTime();
        let now = new Date();
        let millisecondsNow = now.getTime();
        let diffInHours = (millisecondsNow - milliseconds) / (1000*60*60); //hours
        let typeTime;

        if (diffInHours >= 24) {
            //DAYS
            let threadCreated = Math.floor(diffInHours/24); //Template binding
            typeTime = "d"
            return `${threadCreated}${typeTime}`

        } else if (diffInHours < 1 && diffInHours > 0) {
            //MINUTES
            let threadCreated = Math.ceil(diffInHours * 60); //Template binding
            typeTime = "min"
            return `${threadCreated}${typeTime}`

        } else {
            //HOURS   
            let threadCreated =  Math.floor(diffInHours); //Template binding
            typeTime = "h"
            return `${threadCreated}${typeTime}`

        }

    }
  
    
}