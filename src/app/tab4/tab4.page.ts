import { Component, ViewChild } from '@angular/core';
import { IonContent, NavController, ToastController, LoadingController, ModalController } from '@ionic/angular';
import { AuthService } from '../../app/core/auth.service';
import { IThread } from '../../app/shared/interfaces';
import { ThreadDiscussionService } from '../../app/core/thread-discussion.service';
import { WebSocketService } from '../../app/core/websocket.service';
import { ThreadLikesService } from '../../app/core/thread-likers.service';
import { FcmProvider } from '../../app/core/fcm.service';
import { SignupAppPage } from '../signup-app/signup-app.page';
import { AddCommentPage } from '../add-comment/add-comment.page';
import { ThreadsService } from '../core/threads.service';
import { Router } from '@angular/router';
import { ChatService } from '../core/chat.service';
import { AppState } from '../core/state.service';
import { TakeDiscussionService } from '../core/take-discussion.service';
import { PlayDiscussionService } from '../core/play-discussion.service';

@Component({
	selector: 'app-tab4',
	templateUrl: './tab4.page.html',
	styleUrls: ['./tab4.page.scss']
})
export class Tab4Page {

	notifications: any[] = [];
	begin: number = 0;
	end: number = 20;
	wait: boolean = true;
	permissionForNotifications: boolean;
	enableInfinite: boolean = true;
	loadingNotis: boolean = true;
	scrollSubscription: any;
	scrollTO: any;
	@ViewChild('tabFour', { static: true }) content: IonContent;


	constructor(public navCtrl: NavController,
		public authService: AuthService,
		private toastCtrl: ToastController,
		private loadingCtrl: LoadingController,
		private chatService: ChatService,
		public global: AppState,
		private modalCtrl: ModalController,
		private router: Router,
		private threadDiscussionService: ThreadDiscussionService,
		private playDiscussionService: PlayDiscussionService,
		private takeDiscussionService: TakeDiscussionService,

		private webSocketService: WebSocketService,
		private likesService: ThreadLikesService,
		private threadsService: ThreadsService,
		public fcm: FcmProvider) {

	}

	checkPermission() {

		this.fcm.hasPermission().then((isEnabled) => {

			this.authService.permissionForNotifications = isEnabled;

		})
			.catch((error) => {

			});

	}

	ionViewWillEnter() {
		this.showTabs()
	
	}

	public showTabs() {
		const tabBar = document.getElementById('myTabBar');
		if (tabBar !== null && tabBar.style.display !== 'flex') tabBar.style.display = 'flex';
	}

	ionViewDidLeave() {
		this.content.scrollY = false;
	}




	ionViewDidEnter() {

		setTimeout(() => {
			this.content.scrollY = true;
		}, 100);
		this.authService.observableTabOne.next(false);
		this.scrollSubscription = this.authService.observableTabOne
			.subscribe(scroll => {
				if (scroll) this.content.scrollToTop(300);

			});

		if (this.authService.isLoggedIn()) {
			this.checkPermission();

			if (this.authService.downloadNotifications || this.authService.notifications) this.getNotis();
			this.authService.downloadNotifications = false;

		} else {
			//UI NOT LOGGED IN
			this.loadingNotis = false;
			this.authService.downloadNotifications = true;
			let data = {
				message: 'Sign up to see your notifications!',
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

	/* ionSelected() {
		this.content.scrollToTop();
	} */

	goToSign() {

		this.authService.downloadNotifications = true;
		let data = {
			message: 'Sign up to see your notifications!',
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
						this.navCtrl.navigateForward('/signup-global');


					}
				})
		})


	}


	clearNotifications() {

		this.authService.currentUser.notifications = this.authService.currentUser.notifications.filter(n => n == 'message');
		this.authService.notifications = 0; //Para que se quita el circulo hasta que se bajen las notificaciones (front end)
		this.authService.clearNotifications(this.chatService.chatNotificationsNumber, "noti")
			.subscribe((success) => {


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


	getMoreNotis(infiniteScroll) {

		this.begin += 20;
		this.end += 20;
		this.authService.visibleNotifications = this.authService.visibleNotifications.concat(this.notifications.slice(this.begin, this.end));
		infiniteScroll.target.complete();
		if (this.authService.visibleNotifications.length == this.notifications.length) this.enableInfinite = false;

	}

	userHasLiked(thread: IThread) {

		if (this.authService.currentUser) {
			return this.likesService.userHasLiked(thread, this.authService.currentUser._id);
		} else {
			return false;
		}
	}

	goToUser(event, user) {

		event.stopPropagation();
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



	goToDetail(notification) {

		if (notification.thread) {
			let data = {
				fromNotificationsPage: true,
				timeline: notification.timeline,
				thread: notification.thread,
				scrollTo: notification.notification._id
			}

			data.timeline.count = notification.timeline.likers ? notification.timeline.likers.length : 0;
			data.timeline.likedByUser = this.userHasLiked(notification.timeline);
			if (notification.typeOf == 'comment') {
				data.scrollTo = null; //No hay necesidad, la notificacion no es una respuesta.
				data.timeline.user = notification.user;
			} else {
				data.timeline.user = notification.timelineUser;
			}

			this.authService.paramSignUp = data;

			this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/timeline-detail', data.timeline._id]);

		} else if(notification.take) {
			let data = {
				fromNotificationsPage: true,
				timeline: notification.timeline,
				take: notification.take,
				scrollTo: notification.notification._id
			}

			data.timeline.count = notification.timeline.likers ? notification.timeline.likers.length : 0;
			data.timeline.likedByUser = this.userHasLiked(notification.timeline);
			if (notification.typeOf == 'comment') {
				data.scrollTo = null; //No hay necesidad, la notificacion no es una respuesta.
				data.timeline.user = notification.user;
			} else {
				data.timeline.user = notification.timelineUser;
			}

			this.authService.paramSignUp = data;

			this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/take-timeline-detail', data.timeline._id]);
		} else {

			let data = {
				fromNotificationsPage: true,
				timeline: notification.timeline,
				trivia: notification.trivia,
				scrollTo: notification.notification._id
			}

			data.timeline.count = notification.timeline.likers ? notification.timeline.likers.length : 0;
			data.timeline.likedByUser = this.userHasLiked(notification.timeline);
			if (notification.typeOf == 'comment') {
				data.scrollTo = null; //No hay necesidad, la notificacion no es una respuesta.
				data.timeline.user = notification.user;
			} else {
				data.timeline.user = notification.timelineUser;
			}

			this.authService.paramSignUp = data;

			this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/trivia-timeline-detail', data.timeline._id]);
		
		}

	}

	getNotis(event?: any) {

		//Reset for slice
		this.begin = 0;
		this.end = 20;
		this.enableInfinite = false;
		if (!event) this.loadingNotis = true;
		if (event) this.fcm.impact('light');

		this.authService.getNotis()
			.subscribe((notis: any) => {
			
				this.fcm.setBadge(this.chatService.chatNotificationsNumber);
				notis = notis.filter(noti => noti.thread || noti.take || noti.trivia || noti.typeOf == 'follow');
				let notisMapped = notis.map((noti: any) => {
			
					if (noti.typeOf != 'follow') {

						noti.timeline.date = new Date(noti.timeline.date);
						noti.timeline.created = this.created(noti.timeline);
						noti.notification.date = new Date(noti.notification.date);
						noti.notification.created = this.created(noti.notification);
						noti.timeline.likedByUser = this.userHasLiked(noti.timeline);

						if (noti.thread) {
						
							if(noti.threadTitle) {
								let reducedText = noti.threadTitle.substring(0, 40);
								if (reducedText.length < noti.threadTitle.length) {
									noti.titleToShow = noti.threadTitle.substring(0, 40) + "...";
								} else {
									noti.titleToShow = noti.threadTitle;
								}
							}
							
							
						}

						if (noti.take) {
							
							if(noti.takeTitle) {
								let reducedText = noti.takeTitle.substring(0, 40);
								if (reducedText.length < noti.takeTitle.length) {
									noti.titleToShow = noti.takeTitle.substring(0, 40) + "...";
								} else {
									noti.titleToShow = noti.takeTitle;
								}
							}
							
						}

						if (noti.replyText) {
							let reducedTextMention = noti.replyText.substring(0, 40);
							if (reducedTextMention.length < noti.replyText.length) {
								noti.replyTextToShow = noti.replyText.substring(0, 40) + "...";
							} else {
								noti.replyTextToShow = noti.replyText;
							}
						}

					} else {
						noti.date = new Date(noti.date);
						noti.created = this.created(noti);

					}

					return noti;
				})

				this.notifications = notisMapped;
				this.authService.visibleNotifications = this.notifications.slice(this.begin, this.end);


				if (this.authService.notifications > 0) this.clearNotifications();


				this.wait = false;
				this.loadingNotis = false;
				this.enableInfinite = true;
				if (event) event.target.complete();

			},
				(err) => {
					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'top'
					}).then(toast => {
						toast.present()
					})
					this.enableInfinite = true;
					this.loadingNotis = false;
					this.wait = false;

				})
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

	replyTo(notification, e) {
		e.stopPropagation()

		let data = {
			username: notification.user.username
		}

		this.modalCtrl.create({
			component: AddCommentPage,
			componentProps: {
				data
			}
		}).then(modal => {
			modal.present()
			modal.onDidDismiss()
				.then(data => {

					if(data.data.comment) {
						if (data.data.comment.length > 0) {
							if(notification.take) {
							
								this.sendTakeComment(data.data.comment, notification);
							} else if(notification.thread) {
								this.sendComment(data.data.comment, notification);
							} else {
								this.sendTriviaComment(data.data.comment, notification);
							}
							
						}
					}
					
				})
		})

	}

	defineParent(notification: any) {

		if (notification.typeOf == "comment") return notification.notification._id;
		else {
			if (notification.replyType == 'discussion') return notification.notification._id;
			else {
				return notification.parent;
			}
		}

	}
	

	sendComment(comment: string, notification: any) {

		this.loadingCtrl.create({
			spinner: 'crescent',
			message: 'Sending...',
			cssClass: 'my-custom-loading'
		}).then(loader => {
			loader.present()
			
				if (this.authService.isLoggedIn()) {
					let data = {
						threadId: notification.thread,
						response: comment,
						parent: this.defineParent(notification),
						userMention: notification.user._id,
						playerIds: notification.user.playerIds
					}

					console.log(notification.thread)

					let aId = notification.typeOf == "comment" ? undefined : notification.notification._id;
					this.threadDiscussionService.postAnswer(data, notification.thread, notification.timeline._id, notification.notification.discussion, aId)
						.subscribe((answer: any) => {

							this.webSocketService.emitPost(notification.thread, "thread", notification.user._id, this.authService.currentUser._id)
							loader.dismiss();

						},
							(err) => {
								this.toastCtrl.create({
									message: err,
									duration: 3000,
									position: 'bottom'

								}).then(toast => toast.present())
								loader.dismiss();
							});
				}

			
		})



	}

	sendTakeComment(comment: string, notification: any) {

		this.loadingCtrl.create({
			spinner: 'crescent',
			message: 'Sending...',
			cssClass: 'my-custom-loading'
		}).then(loader => {
			loader.present()
			

				if (this.authService.isLoggedIn()) {
					let data = {
						takeId: notification.take,
						response: comment,
						parent: this.defineParent(notification),
						userMention: notification.user._id,
						playerIds: notification.user.playerIds
					}

					let aId = notification.typeOf == "comment" ? undefined : notification.notification._id;
					this.takeDiscussionService.postAnswer(data, notification.take, notification.timeline._id, notification.notification.discussion, aId)
						.subscribe((answer: any) => {

							this.webSocketService.emitPost(notification.take, "take", notification.user._id, this.authService.currentUser._id)
							loader.dismiss();

						},
							(err) => {
								this.toastCtrl.create({
									message: err,
									duration: 3000,
									position: 'bottom'

								}).then(toast => toast.present())
								loader.dismiss();
							});
				}

			
		})



	}

	sendTriviaComment(comment: string, notification: any) {

		this.loadingCtrl.create({
			spinner: 'crescent',
			message: 'Sending...',
			cssClass: 'my-custom-loading'
		}).then(loader => {
			loader.present()
			

				if (this.authService.isLoggedIn()) {
					let data = {
						triviaId: notification.trivia,
						response: comment,
						parent: this.defineParent(notification),
						userMention: notification.user._id,
						playerIds: notification.user.playerIds
					}

					let aId = notification.typeOf == "comment" ? undefined : notification.notification._id;
					this.playDiscussionService.postTriviaAnswer(data, notification.trivia, notification.timeline._id, notification.notification.discussion, aId)
						.subscribe((answer: any) => {

							this.webSocketService.emitPost(notification.trivia, "trivia", notification.user._id, this.authService.currentUser._id)
							loader.dismiss();

						},
							(err) => {
								this.toastCtrl.create({
									message: err,
									duration: 3000,
									position: 'bottom'

								}).then(toast => toast.present())
								loader.dismiss();
							});
				}

			
		})



	}

	goToThread(notification, e) {

		e.stopPropagation()

		let information = {
			fcmThread: true, //porque nunca se usa paramSignup para thread-detail, solo en este caso.
			threadId: notification.thread
		}
		console.log('asd')

		this.authService.paramSignUp = information;
		this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/thread-detail', notification.thread]);

	}


	goToTake(notification, e) {

		e.stopPropagation()

		let information = {
			fcmTake: true, //porque nunca se usa paramSignup para thread-detail, solo en este caso.
			takeId: notification.take
		}

		this.authService.paramSignUp = information;
		this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/take-detail', notification.take]);

	}

	doInfinite(infiniteScroll) {


		this.getMoreNotis(infiniteScroll);
	}

}
