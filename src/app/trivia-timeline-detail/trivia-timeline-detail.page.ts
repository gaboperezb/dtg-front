import { Component, ViewChild, ElementRef } from '@angular/core';
import { IonContent, ToastController, ModalController, LoadingController, ActionSheetController, AlertController, NavController } from '@ionic/angular';
import { ITimeline, IAnswer, ITrivia } from '../shared/interfaces';
import { AuthService } from '../core/auth.service';
import { ThreadLikesService } from '../core/thread-likers.service';
import { ThreadDiscussionService } from '../core/thread-discussion.service';
import * as _ from 'lodash';
import { WebSocketService } from '../core/websocket.service';
import { FcmProvider } from '../core/fcm.service';
import { AppState } from '../core/state.service';
import { Router } from '@angular/router';
import { AddCommentPage } from '../add-comment/add-comment.page';
import { SignupAppPage } from '../signup-app/signup-app.page';
import { EditCommentPage } from '../edit-comment/edit-comment.page';
import { PlayDiscussionService } from '../core/play-discussion.service';


/**
 * Generated class for the TimelineDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


@Component({
	selector: 'app-trivia-timeline-detail',
	templateUrl: './trivia-timeline-detail.page.html',
	styleUrls: ['./trivia-timeline-detail.page.scss'],
})

export class TriviaTimelineDetailPage {

	wait: boolean = false;
	timeline: ITimeline;
	trivia: ITrivia;
	loadingAnswers: boolean = true;
	answers: IAnswer[] = [];
	discussionOrAnswer: string = "discussion";
	parents: any;
	scrollTo: string = "";
	data: any;
	scrollTimeout: any;
	scrollTO: any;
	toastrInstance: any;
	scrollPosition: number;
	swipeTimeOut: any;

	@ViewChild('timelineDetail', { static: true }) content: IonContent;

	constructor(
		private router: Router,
		private fcm: FcmProvider,
		public global: AppState,
		public authService: AuthService,
		private likesService: ThreadLikesService,
		private threadDiscussionService: ThreadDiscussionService,
		private toastCtrl: ToastController,
		private modalCtrl: ModalController,
		private loadingCtrl: LoadingController,
		private playDiscussionService: PlayDiscussionService,
		private navCtrl: NavController,
		private webSocketService: WebSocketService,
		private actionSheetCtrl: ActionSheetController,
		private alertCtrl: AlertController,
		private el: ElementRef) {

		this.data = authService.paramSignUp;
		if (!this.data) {


			return; // cordova kill
		}
		if (!this.data.fcm) {
			this.timeline = this.data.timeline;
			this.trivia = this.data.trivia;
		}

		if (this.data.fromNotificationsPage) this.wait = true;
		if (this.data.scrollTo) this.scrollTo = this.data.scrollTo;
	}

	goToTabRoot() {
		this.navCtrl.navigateRoot(this.router.url.substr(0, 10))
	}

	goBack() {


		this.authService.addurl = false;
		if (this.toastrInstance) this.toastrInstance.dismiss();
		this.navCtrl.pop();

	}

	ionViewDidLeave() {
		this.content.scrollY = false
		clearTimeout(this.swipeTimeOut);
		this.authService.swipeBack = true;
	}

	ionViewWillLeave() {
		clearTimeout(this.swipeTimeOut);
		this.authService.swipeBack = false;

		this.swipeTimeOut = setTimeout(() => {
			this.authService.swipeBack = true;
		}, 1500);
	}




	ionViewDidEnter() {


		setTimeout(() => {
			this.content.scrollY = true
		}, 100);
		if (this.data.fcm) {

			this.getDiscussion(this.data.timelineId);
			//cuando es por notificación
		} else {
			this.getAnswers()
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

	filterAnswers(answerId) {
		this.answers = this.answers.filter(_answer => _answer._id !== answerId);
	}


	deleteDiscussion() {

		this.loadingCtrl.create({
			spinner: 'crescent',
			cssClass: 'my-custom-loading'
		}).then(loader => {
			loader.present();
			let data = {
				dId: this.timeline._id,
				triviaId: this.trivia._id || this.trivia,
				userId: this.authService.currentUser._id
			}

			this.playDiscussionService.deleteTriviaComment(data)
				.subscribe((success) => {
					if (success) {
						this.navCtrl.pop();
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

	showVisible(e) {


		for (let img of this.el.nativeElement.querySelectorAll('.user-picture')) {
			let realSrc = img.dataset.src;
			if (!realSrc) continue;

			if (this.isVisible(img)) {

				if (e != null) {
					e.domWrite(() => {
						img.src = realSrc;
						img.dataset.src = ''
					});
				} else {
					img.src = realSrc;
					img.dataset.src = ''
				}


				;
			}
		}

	}


	isVisible(elem) {

		let coords = elem.getBoundingClientRect();

		let windowHeight = document.documentElement.clientHeight;

		// top elem edge is visible OR bottom elem edge is visible
		let topVisible = coords.top > 0 && coords.top < windowHeight;
		let bottomVisible = coords.bottom < windowHeight && coords.bottom > 0;

		return topVisible || bottomVisible;
	}

	emitterImages() {
		setTimeout(() => {
			this.showVisible(null);
		}, 0);
	}

	ngOnInit() {

		if (!this.data) {
			this.goToTabRoot()
			return; // cordova kill
		}

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

				this.navCtrl.navigateForward(this.router.url.substr(0, 10) + '/profile')

			} else {
				let data = {
					user: user
				}
				this.authService.paramSignUp = data;

				this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/user', user._id])
			}

		} else {
			let data = {
				user: user
			}
			this.authService.paramSignUp = data;

			this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/user', user._id])

		}

	}

	scrollToItem() {
		if (this.scrollTo) {
			let yOffset = document.getElementById(this.scrollTo).getBoundingClientRect().top - 70;
			this.content.scrollToPoint(0, yOffset, 0);
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
							if (data.data.comment.length > 0) this.sendComment(data.data.comment);
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
							this.navCtrl.navigateForward('/signup-global')
						}

					})
			})

		}


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
					triviaId: this.trivia._id || this.trivia,
					response: comment,
					parent: this.timeline._id,
					userMention: this.timeline.user._id,
					playerIds: this.timeline.user.playerIds

				}


				let triviaId = this.trivia._id || this.trivia

				this.playDiscussionService.postTriviaAnswer(data, triviaId, this.timeline._id, this.timeline.discussion)
					.subscribe((answer: any) => {

						if (this.timeline.numberOfAnswers > 0) this.timeline.numberOfAnswers += 1;
						else this.timeline.numberOfAnswers = 1;

						answer.date = new Date(answer.date);
						answer.children = [];
						answer.created = '1min'
						answer.count = 0;
						answer.likedByUser = this.userHasLiked(answer);


						//Para evitar la operacion de 'Populate' en mongo.
						answer.user = {

							username: this.authService.currentUser.username,
							playerIds: this.authService.currentUser.playerIds,
							profilePicture: this.authService.currentUser.profilePicture,
							profilePictureThumbnail: this.authService.currentUser.profilePictureThumbnail,
							_id: this.authService.currentUser._id,
							badge: this.authService.currentUser.badge

						};

						//socket io
						this.webSocketService.emitPost(triviaId, "trivia", this.timeline.user._id, this.authService.currentUser._id)
						answer.responding = { username: this.timeline.user.username };
						this.answers.unshift(answer);
						loader.dismiss();
						setTimeout(() => {
							this.showVisible(null);
						}, 0);


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

	like() {
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
			//mandar a registrarse
		}
	}

	userHasLiked(timeline: any) {
		if (this.authService.isLoggedIn()) {
			return this.likesService.userHasLiked(timeline, this.authService.currentUser._id);
		} else {
			return false;
		}
	}

	


	getDiscussion(id: string) {


		this.threadDiscussionService.getDiscussion(id)
			.subscribe((discussion) => {

				this.authService.currentUser.notifications.shift();
				if (this.authService.notifications != 0) this.authService.notifications -= 1;

				//Discussion Configuration
				discussion.date = new Date(discussion.date);
				discussion.created = this.created(discussion);
				discussion.count = discussion.likers.length;
				discussion.likedByUser = this.userHasLiked(discussion);
				let notification;
				//Thread Configuration
				
				discussion.numberOfAnswers = discussion.answers.length;
				this.timeline = discussion;
				this.trivia = discussion.trivia;

				//Answers/Notification Configuration 
                if (this.data.answerId) {
                    this.configureAnswers(discussion.answers);

                    let answer = discussion.answers.find(item => item._id.toString() == this.data.answerId);
                    let reducedTextMention = answer.replyText.substring(0, 40);

                    if (reducedTextMention.length < answer.replyText.length) {
                        answer.replyTextToShow = answer.replyText.substring(0, 40) + "...";
                    } else {
                        answer.replyTextToShow = answer.replyText;
                    }
                    notification = {
                        user: answer.user,
                        notification: answer,
                        trivia: discussion.trivia,
                        replyTextToShow: answer.replyTextToShow,
                        typeOf: "mention",
                        parent: answer.parent,
                        replyType: answer.replyType,
                        timeline: discussion,
                        timelineUser: discussion.user
                    };

                } 
				
				if (!this.authService.downloadNotifications && notification.user._id != this.authService.currentUser._id ) this.authService.visibleNotifications.unshift(notification);
				this.clearOneNotification();
				this.wait = false;
				this.loadingAnswers = false;

				let message = 'In the trivia: ';
				this.toastCtrl.create({
					message: message + this.trivia.question,
					duration: 5000,
					color: "warning",
					buttons: [
						{
							text: 'Close',
							role: 'cancel',
							handler: () => {
								console.log('Close clicked');
							}
						}
					],
					position: 'bottom'
				}).then(toast => {
					this.toastrInstance = toast;
					this.toastrInstance.present();
				})

			},
				(err) => {
					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'bottom'
					}).then(toast => toast.present())
					this.wait = false;
					this.loadingAnswers = false;

				});
	}

	clearOneNotification() {
		this.authService.clearOneNotification()
			.subscribe((success) => {
				this.fcm.substractBadgeNumber();

			},
				(err) => {

					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'top'
					}).then(toast => {
						toast.present()
					})
				});

	}

	configureAnswers(answers: IAnswer[]) {
		answers.forEach((answer) => {
			answer.date = new Date(answer.date);
			answer.created = this.created(answer);
			answer.count = answer.likers.length;
			answer.likedByUser = this.userHasLiked(answer);

		})

		this.timeline.numberOfAnswers = answers.length;

		let parents = _.chain(answers)
			.filter({ 'parent': this.timeline._id })
			.value();
		let children = answers.filter((answer) => answer.parent != this.timeline._id);
		let childrenF = _.chain(children)
			.groupBy('parent')
			.value();
		for (let index = 0; index < parents.length; index++) {
			const element = parents[index];
			let insert = childrenF[element._id] ? childrenF[element._id] : [];
			element.children = insert;
		}

		this.answers = parents;

        /* setTimeout(() => {
            this.showVisible(null);
        }, 0); */

	}

	getAnswers() {

		this.threadDiscussionService.getAnswers(this.timeline._id)
			.subscribe((answers) => {
				this.configureAnswers(answers);
				this.wait = false;
				this.loadingAnswers = false;

			},
				(err) => {
					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'bottom'
					}).then(toast => toast.present())
					this.wait = false;
					this.loadingAnswers = false;

				});

	}



	created(thread: any): string {

		let milliseconds = thread.date.getTime();
		let now = new Date();
		let millisecondsNow = now.getTime();
		let diffInHours = (millisecondsNow - milliseconds) / (1000 * 60 * 60); //hours
		let typeTime;

		if (diffInHours >= 24) {
			//DAYS
			let threadCreated = Math.floor(diffInHours / 24); //Template binding
			typeTime = "d"
			return `${threadCreated}${typeTime}`

		} else if (diffInHours < 1 && diffInHours > 0) {
			//MINUTES
			let threadCreated = Math.ceil(diffInHours * 60); //Template binding
			typeTime = "min"
			return `${threadCreated}${typeTime}`

		} else {
			//HOURS   
			let threadCreated = Math.floor(diffInHours); //Template binding
			typeTime = "h"
			return `${threadCreated}${typeTime}`

		}

	}


}


