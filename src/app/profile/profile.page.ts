import { Component, ViewChild } from '@angular/core';
import { IonContent, NavController, ToastController, ModalController, ActionSheetController, AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from '../../app/core/auth.service';
import { IThread, ITake } from '../../app/shared/interfaces';
import { ThreadLikesService } from '../../app/core/thread-likers.service';


import { ThreadsService } from '../../app/core/threads.service';
import { ThreadDiscussionService } from '../../app/core/thread-discussion.service';
import { AppState } from '../../app/core/state.service';
import { SignupAppPage } from '../signup-app/signup-app.page';
import { LevelsPage } from '../levels/levels.page';
import { FcmProvider } from '../core/fcm.service';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { Router } from '@angular/router';
import { EditCommentPage } from '../edit-comment/edit-comment.page';
import { EditAnswerPage } from '../edit-answer/edit-answer.page';
import { SharePostPage } from '../share-post/share-post.page';
import { NewChatPage } from '../new-chat/new-chat.page';
import { ChatService } from '../core/chat.service';
import { Clipboard } from '@ionic-native/clipboard/ngx';

/**
 * Generated class for the ProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
	selector: 'page-profile',
	templateUrl: './profile.page.html',
	styleUrls: ['./profile.page.scss']
})
export class ProfilePage {

	userBackground: any;
	thumbnail: any;
	takes: ITake[] = [];
	postsBoolean: boolean = true;
	takesBoolean: boolean = false;
	commentsBoolean: boolean = false;
	answersBoolean: boolean = false;
	triviasBoolean: boolean = false;
	nextPoints: number;
	currentPoints: number;
	pointsPercentage: number;
	threads: any[] = [];
	comments: any[] = [];
	answers: any[] = [];
	skipThreads: number = 0;
	skipComments: number = 0;
	skipAnswers: number = 0;
	skipTrivias: number = 0;
	skipTakes: number = 0;
	wait: boolean = true;
	teamsToShow: any[] = [];

	waitComments: boolean = false;
	reactivateInfinite: any;
	commaPoints: string = "";
	enableInfinite: boolean = false;
	data: any;
	trivias: any[] = [];
	extraTeams: number;
	largeLevel: string = "";
	scrollSubscription: any;
	scrollTO: any;
	@ViewChild('tabFive', { static: true }) content: IonContent;

	constructor(public navCtrl: NavController,
		public authService: AuthService,
		private toastCtrl: ToastController,
		private threadLikesService: ThreadLikesService,
		private router: Router,
		private clipboard: Clipboard,
		private chatService: ChatService,
		private likesService: ThreadLikesService,
		private socialSharing: SocialSharing,
		private modalCtrl: ModalController,
		private actionSheetCtrl: ActionSheetController,
		private alertCtrl: AlertController,
		private fcm: FcmProvider,
		private threadsService: ThreadsService,
		private loadingCtrl: LoadingController,
		private threadDiscussionService: ThreadDiscussionService,
		public global: AppState) {



		this.data = this.authService.paramSignUp //Si viene de otro lugar que no sea tabs



	}

	addMoreTeams() {
		
		if(this.authService.currentUser.favAllTeams.length) {
			this.teamsToShow = this.teamsToShow.concat(this.authService.currentUser.favAllTeams.slice(this.teamsToShow.length, this.teamsToShow.length + 10))
			this.extraTeams = this.authService.currentUser.favAllTeams.length - this.teamsToShow.length;
		}

	}

	populateTeamsToShow() {
		if(this.authService.currentUser.favAllTeams && this.authService.currentUser.favAllTeams.length) {
			this.teamsToShow = this.authService.currentUser.favAllTeams.slice(0,10);
			this.extraTeams = this.authService.currentUser.favAllTeams.length - this.teamsToShow.length;
		}
	}

	ngOnInit() {
		this.populateTeamsToShow();
	}

	ionViewDidLeave() {
		this.scrollSubscription.unsubscribe();
		this.content.scrollY = false;

	}

	ionViewWillEnter() {
		this.showTabs()

	}

	public showTabs() {
		const tabBar = document.getElementById('myTabBar');
		if (tabBar !== null && tabBar.style.display !== 'flex') tabBar.style.display = 'flex';
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

			this.setInitialSettings();

			if (this.authService.downloadProfile) this.load();
			if (!this.data) this.authService.downloadProfile = false; //Para ViewDidEnter
			if (this.data) {
				if (!this.data.loadInitial) this.authService.downloadProfile = false
			}

		} else {
			//UI NOT LOGGED IN

			this.comments = [];
			this.threads = [];
			this.answers = [];
			this.authService.downloadProfile = true;
			let data = {
				message: 'Sign up to see your profile!'
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

	numberWithCommas(x: number) {
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}


	displayBar() {

		let result;
		let top;
		let bottom;

		if (this.authService.currentUser.badge.level != 1) {
			top = this.authService.currentUser.totalPoints - this.authService.currentUser.badge.previousPoints;
			bottom = this.authService.currentUser.badge.nextPoints - this.authService.currentUser.badge.previousPoints;
			result = (top / bottom) * 100;

		} else {
			top = this.authService.currentUser.totalPoints;
			bottom = this.authService.currentUser.badge.nextPoints;
			result = (top / bottom) * 100;
		}


		return result;
	}

	change(theme: string) {

		if (this.authService.isLoggedIn()) {


			this.global.set('theme', theme);



		} else {
			let data = {
				message: 'Sign up to change to night mode!',
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

	}

	selectTeams() {
		this.navCtrl.navigateForward(this.router.url.substr(0, 10) + '/teams');
	}

	filterTake(takeID: string) {

		this.takes = this.takes.filter(_take => _take._id !== takeID);
	}

	deletePost(thread: any) {

		this.loadingCtrl.create({
			spinner: 'crescent',
			cssClass: 'my-custom-loading'
		}).then(
			loader => {

				loader.present();
				let data = {
					tId: thread._id,
					userId: this.authService.currentUser._id
				}

				this.threadsService.deleteThread(data)
					.subscribe((success) => {

						if (success) {
							this.threads = this.threads.filter(_thread => _thread._id !== thread._id);
							loader.dismiss();

						} else {

							this.toastCtrl.create({
								message: 'Failed to delete Post',
								duration: 3000,
								position: 'bottom'
							}).then(toast => toast.present())

							loader.dismiss();

						}
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
		)




	}

	deleteDiscussion(comment: any) {

		this.loadingCtrl.create({
			spinner: 'crescent',
			cssClass: 'my-custom-loading'
		}).then(loader => {
			loader.present()

			let data = {
				dId: comment._id,
				tId: comment.thread._id,
				userId: this.authService.currentUser._id
			}


			this.threadDiscussionService.deletePost(data)
				.subscribe((success) => {
					if (success) {
						this.comments = this.comments.filter(_comment => _comment._id !== comment._id);
						loader.dismiss();

					} else {

						this.toastCtrl.create({
							message: 'Failed to delete Post',
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



	deleteAnswer(answer: any) {

		let loader = this.loadingCtrl.create({
			spinner: 'crescent',
			cssClass: 'my-custom-loading'
		}).then(loader => {

			loader.present();

			let data = {
				dId: answer._id,
				aId: answer.answers._id,
				tId: answer.thread._id,
				userId: this.authService.currentUser._id
			}


			this.threadDiscussionService.deletePost(data)
				.subscribe((success) => {
					if (success) {
						this.answers = this.answers.filter(_answer => _answer.answers._id !== answer.answers._id);
						loader.dismiss();

					} else {

						this.toastCtrl.create({
							message: 'Failed to delete Post',
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


	deleteComment(e, object: any, alertText: string) {
		e.stopPropagation();

		this.actionSheetCtrl.create({
			header: 'ACTION',
			cssClass: 'my-custom-action',
			buttons: [
				{
					text: 'Edit',
					handler: () => {

						if (alertText == 'comment') {

							let data = {
								comment: object
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
										if (data.data.comment != null) object.discussion = data.data.comment;
									})
							})

						} else {
							let data = {
								comment: object.answers,
								discussionId: object._id
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
										if (data.data.comment != null) object.answers.discussion = data.data.comment;
									})
							})
						}


					}
				},

				{
					text: 'Delete',
					handler: () => {
						this.alertCtrl.create({
							header: 'Do you want to delete this ' + alertText + '?',
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
										if (alertText == 'post') this.deletePost(object);
										else if (alertText == 'comment') {
											if (object.thread) this.deleteDiscussion(object);
											else {

											}

										}
										else if (alertText == 'answer') {

											if (object.thread) this.deleteAnswer(object);
											else {

											}


										}
									}
								}
							]
						}).then(a => a.present())


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


	//Llamado por un output de user discussion
	delete(e, object: any, alertText: string) {
		e.stopPropagation();

		this.actionSheetCtrl.create({
			header: 'ACTION',
			cssClass: 'my-custom-action',
			buttons: [

				{
					text: 'Delete',
					handler: () => {
						this.alertCtrl.create({
							header: 'Do you want to delete this ' + alertText + '?',
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
										if (alertText == 'post') this.deletePost(object);
										else if (alertText == 'comment') {
											if (object.thread) this.deleteDiscussion(object);
											else {

											}

										}
										else if (alertText == 'answer') {

											if (object.thread) this.deleteAnswer(object);
											else {

											}


										}
									}
								}
							]
						}).then(a => a.present())


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

	deleteOrEdit(e, object: any, alertText: string) {

		e.stopPropagation();
		let actionSheet = this.actionSheetCtrl.create({
			header: 'ACTION',
			cssClass: 'my-custom-action',
			buttons: [
				{
					text: 'Edit',
					handler: () => {
						let data = {
							thread: object,
							selection: object.type.toLocaleLowerCase()

						}
						this.authService.paramSignUp = data;

						if (!object.fromWeb) this.navCtrl.navigateForward(this.router.url.substr(0, 10) + '/edit-thread');
						else {
							this.toastCtrl.create({
								message: "This post was created with the web editor, please go to discussthegame.com/posts to edit it.",
								duration: 5000,
								position: 'bottom'
							}).then(toast => toast.present())

						}


					}
				},
				{
					text: 'Delete',
					handler: () => {
						this.alertCtrl.create({
							header: 'Do you want to delete this ' + alertText + '?',
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
										if (alertText == 'post') this.deletePost(object);
										else if (alertText == 'comment') {
											if (object.thread) this.deleteDiscussion(object);
											else {

											}

										}
										else if (alertText == 'answer') {

											if (object.thread) this.deleteAnswer(object);
											else {

											}


										}
									}
								}
							]
						}).then(a => a.present())


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


	goToSign() {

		this.authService.downloadProfile = true;
		let data = {
			message: 'Sign up to see your profile!',
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

	setInitialSettings() {

		if (this.authService.currentUser) {

			this.commaPoints = this.numberWithCommas(this.authService.currentUser.totalPoints);

			if (!!this.authService.currentUser.coverPhoto) {
				this.userBackground = {
					'background-image': 'url(' + this.authService.currentUser.coverPhoto + ')',
					'background-repeat': 'no-repeat',
					'background-size': 'cover',
					'background-position': 'top',
					'padding-bottom': '40%'

				}
			} else {
				this.userBackground = {
					'background-color': '#4264d0',
					'background-repeat': 'no-repeat',
					'background-size': 'cover',
					'background-position': 'center',
					'padding-bottom': '40%'

				}

			}

		}



	}

	searchUsers() {

		this.navCtrl.navigateForward(this.router.url.substr(0, 10) + '/search-users');

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

	savePost(thread: IThread, saved: boolean) {

		if (this.authService.isLoggedIn()) {
			if (saved) {
				const index = thread.bookmarks.indexOf(this.authService.currentUser._id)
				if (index > -1) {
					thread.bookmarks.splice(index, 1)
				}
				this.threadsService.deleteBookmark(thread._id)
				setTimeout(() => {
					this.toastCtrl.create({
						message: "Post unsaved",
						duration: 2000,
						color: 'warning',
						position: 'bottom'
					}).then(toast => {
						toast.present();
					})
					
				}, 300);
				
			} else {
				if(thread.bookmarks) thread.bookmarks.push(this.authService.currentUser._id);
				else {
					thread.bookmarks = [this.authService.currentUser._id];
				}
				this.threadsService.addToBookmarks(thread._id)
				setTimeout(() => {
					this.toastCtrl.create({
						message: "Post saved",
						duration: 2000,
						color: 'warning',
						position: 'bottom'
					}).then(toast => {
						toast.present();
					})
					
				}, 300);
			}
		} else {
			let data = {
				message: 'Sign up to save this post!',
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

	userHasSaved(thread: IThread) {

		if (this.authService.currentUser && thread.bookmarks) {
			return thread.bookmarks.some((user: any) => user === this.authService.currentUser._id);
		} else {
			return false;
		}
	}

	presentActionSheetShare(e: any, thread: IThread) {

		
		e.stopPropagation();
		let saved = this.userHasSaved(thread)

		this.actionSheetCtrl.create({
			cssClass: 'my-custom-action',
			buttons: [
				{
					text: saved ? 'Unsave post' : 'Save post',
					icon: saved ? 'bookmark' : 'bookmark-outline',
					handler: () => {
						this.savePost(thread, saved);
					}
				},
				{
					text: 'Send to chat',
					icon: 'send',
					handler: () => {
						this.sharePostToChat(e, thread)
					}
				}, {
					text: 'Copy link to post',
					icon: 'link',
					handler: () => {

						let url = 'https://www.discussthegame.com/posts/' + thread._id
                        this.clipboard.copy(url).then(() => {
							this.toastCtrl.create({
								message: "Copied to clipboard",
								duration: 2000,
								color: 'warning',
								position: 'bottom'
							}).then(toast => {
								toast.present();
							})
						}).catch((err) => {
							this.toastCtrl.create({
								message: err,
								duration: 2000,
								color: 'warning',
								position: 'bottom'
							}).then(toast => {
								toast.present();
							})
						});

					}
				},
				{
					text: 'Share post via...',
					icon: 'share-outline',
					handler: () => {
						this.shareVia(thread)
					}
				},
				{
					text: 'Close',
					role: 'cancel',
					handler: () => {

					}
				}
			]
		}).then((actionSheet) => {
			actionSheet.present();
		})



	}



	shareVia(thread: IThread) {

		var options = {
			url: 'https://www.discussthegame.com/posts/' + thread._id
		};
		this.socialSharing.shareWithOptions(options)
	}



	levelsInfo() {

		this.modalCtrl.create({
			component: LevelsPage
		}).then(modal => modal.present())


	}

	load(event?: any) {

		if (event) this.fcm.impact('light');

		if (this.authService.isLoggedIn()) {
			this.skipAnswers = 0;
			this.skipComments = 0;
			this.skipThreads = 0;
			this.skipTrivias = 0;
			this.wait = true;
			this.postsBoolean = true;
			this.takesBoolean = false;
			this.commentsBoolean = false;
			this.answersBoolean = false;
			this.triviasBoolean = false;

			if (event) this.getThreads(event);
			else {
				this.getThreads();
			}

		} else {
			event.target.complete()
		}

	}


	addCover() {
		let data = {
			action: "cover"
		}
		this.authService.paramSignUp = data;

		this.navCtrl.navigateForward(this.router.url.substr(0, 10) + '/edit-form');

	}


	editProfile(e) {
		e.preventDefault();

		this.navCtrl.navigateForward(this.router.url.substr(0, 10) + '/edit');
	}

	goToObject(e, object) {

		e.stopPropagation();
		this.threadsService.threadUserPage = object.thread;
		this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/thread-detail', object.thread._id]);

	}


	//Threads

	goToThread(thread) {

		this.threadsService.threadUserPage = thread;
		this.threadsService.editUrl = '/tabs/tab5';

		this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/thread-detail', thread._id]);

	}

	//Comments

	goToComment(comment) {

		if (comment.thread) {

			let data = {
				fromNotificationsPage: true,
				timeline: comment,
				thread: comment.thread,
				scrollTo: null //No hay necesidad, no es una respuesta.
			}

			this.authService.paramSignUp = data;

			this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/timeline-detail', comment._id]);

		} else if (comment.take) {
			let information = {
				fcm: true,
				timelineId: comment._id,
				fromNotificationsPage: true,
				takeId: comment.take
			}

			this.authService.paramSignUp = information;
			this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/take-timeline-detail', comment._id]);

		} else {
			let information = {
				fcm: true,
				timelineId: comment._id,
				fromNotificationsPage: true,
				triviaId: comment.trivia
			}

			this.authService.paramSignUp = information;
			this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/trivia-timeline-detail', comment._id]);
		}


	}

	sharePostToChat(e: any, thread: IThread) {

		if (this.authService.isLoggedIn()) {
			let data = {
				thread
			}
	
			this.modalCtrl.create({
				component: SharePostPage,
				componentProps: {
					data: data
				}

			}).then((modal) => {
				modal.present();
				modal.onDidDismiss()
					.then((data) => {

						if (data.data.newChat) this.newChat(e, thread);

					})
			})

		} else {
			let data = {
				message: 'Sign up to start chatting!',
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

	newChat(e: any, thread: any) {
		let data = {
			addPeople: false
		}

		this.modalCtrl.create({
			component: NewChatPage,
			componentProps: {
				data
			}

		}).then((modal) => {
			modal.present();
			modal.onDidDismiss()
				.then((data) => {

					if (data.data.chat) {
						//El chat esta en el arreglo de chats
						if (this.chatService.chats.some(chat => chat._id == data.data.chat._id)) {
							this.sharePostToChat(e, thread);

						} else {
							//El chat no estaba en el arreglo epro existe en la base de datos
							this.chatService.addNewChat(data.data.chat);
							this.sharePostToChat(e, thread);
						}

					} else if (data.data.provChat) {
						//Create "new chat"
						data.data.provChat._id = "empty";
						data.data.provChat.createdAt = Date.now();
						this.chatService.addNewChat(data.data.provChat);
						this.sharePostToChat(e, thread);
					}

				})
		})
	}

	like(thread: IThread) {

		if (this.authService.isLoggedIn()) {
			if (this.userHasLiked(thread)) {
				thread.likedByUser = false;
				thread.count -= 1;
				this.threadLikesService.deleteThreadLike(thread, this.authService.currentUser._id);

			} else {
				thread.likedByUser = true;
				thread.count += 1;
				this.threadLikesService.postThreadLike(thread, this.authService.currentUser._id);

			}

		}

	}

	likeComment(timeline) {

		if (this.authService.isLoggedIn()) {
			if (this.userHasLiked(timeline)) {
				timeline.likedByUser = false;
				timeline.count -= 1;
				this.likesService.deleteLike("discussion", timeline, this.authService.currentUser._id);

			} else {
				timeline.likedByUser = true;
				timeline.count += 1;
				this.likesService.postLike("discussion", timeline, this.authService.currentUser._id);
			}
		}
		else {
			//mandar a registrarse
		}
	}

	likeAnswer(e, timeline) {

		if (this.authService.isLoggedIn()) {
			if (this.userHasLiked(timeline.answers)) {
				timeline.answers.likedByUser = false;
				timeline.answers.count -= 1;
				this.likesService.deleteLike('answer', timeline, this.authService.currentUser._id, timeline.answers);

			} else {
				timeline.answers.likedByUser = true;
				timeline.answers.count += 1;
				this.likesService.postLike('answer', timeline, this.authService.currentUser._id, timeline.answers);
			}
		}
	}






	goToAnswer(comment) {


		if (comment.thread) {

			let data = {
				fromNotificationsPage: true,
				timeline: comment,
				thread: comment.thread,
				scrollTo: comment.answers._id //No hay necesidad, no es una respuesta.
			}

			this.authService.paramSignUp = data;

			this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/timeline-detail', comment._id]);


		} else if (comment.take) {


			let information = {
				fcm: true,
				timelineId: comment._id,
				fromNotificationsPage: true,
				answerId: comment.answers._id,
				scrollTo: comment.answers._id,
				takeId: comment.take
			}


			this.authService.paramSignUp = information;
			this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/take-timeline-detail', comment._id]);

		} else {
			let information = {
				fcm: true,
				timelineId: comment._id,
				fromNotificationsPage: true,
				answerId: comment.answers._id,
				scrollTo: comment.answers._id,
				triviaId: comment.trivia
			}


			this.authService.paramSignUp = information;
			this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/trivia-timeline-detail', comment._id]);
		}


	}


	getThreads(event?: any) {

		this.enableInfinite = true;
		this.authService.getProfile(0)
			.subscribe((user: any) => {

				this.waitComments = false;
				let threads = user.threads;

				if (threads.length >= 15) {
					this.enableInfinite = true;
				} else {
					this.enableInfinite = false;
				}
				if (threads.length > 0) {
					let provisionalArray = threads.map((thread: any) => {
						thread.date = new Date(thread.date);
						thread.created = this.created(thread);
						thread.likedByUser = this.userHasLiked(thread);
						thread.count = thread.likers ? thread.likers.length : 0;
						thread.user = this.authService.currentUser;
						return thread;
					})

					this.threads = provisionalArray;

				}
				if (user.badge.level > this.authService.currentUser.badge.level) {
					setTimeout(() => {
						this.authService.leveledUp = true;
					}, 1000);
				}
				this.authService.currentUser.badge = user.badge;
				this.authService.currentUser.followingNumber = user.followingNumber;
				this.authService.currentUser.followersNumber = user.followersNumber;
				this.authService.currentUser.totalPoints = user.totalPoints;
				this.wait = false;
				if (event) event.target.complete()
			},
				(err) => {
					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'bottom'
					}).then(toast => toast.present())
					if (event) event.target.complete()

					this.wait = false;
					this.waitComments = false;
					this.authService.downloadProfile = false;

				});

	}

	getTakes() {

		this.waitComments = true;
		this.enableInfinite = true;
		this.authService.getTakes(0)
			.subscribe((takes: any) => {

				this.waitComments = false;

				if (takes.length >= 10) {
					this.enableInfinite = true;
				} else {
					this.enableInfinite = false;
				}
				if (takes.length > 0) {
					let provisionalArray = takes.map((take: any) => {
						take.date = new Date(take.date);
						take.created = this.created(take);
						take.likedByUser = this.userHasLiked(take);
						take.count = take.likers ? take.likers.length : 0;
						take.user = this.authService.currentUser;
						return take;
					})

					this.takes = provisionalArray;

				}


				this.waitComments = false;

			},
				(err) => {
					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'bottom'
					}).then(toast => toast.present())

					this.waitComments = false;


				});

	}




	getComments() {

		this.waitComments = true;
		this.enableInfinite = true;

		this.authService.getUserThreadDiscussions(0)
			.subscribe((comments: any) => {
				console.log(comments)


				comments = comments.filter(comment => comment.thread || comment.trivia || comment.take);

				if (comments.length >= 15) {
					this.enableInfinite = true;
				} else {
					this.enableInfinite = false;
				}
				if (comments.length > 0) {
					let provisionalArray = comments.map((comment: any) => {
						comment.date = new Date(comment.date);
						comment.user = this.authService.currentUser;
						comment.created = this.created(comment);
						comment.likedByUser = this.userHasLiked(comment);

						if (comment.thread) {
							comment.thread.date = new Date(comment.thread.date);
							comment.thread.likedByUser = this.userHasLiked(comment.thread);
							comment.thread.count = comment.thread.likers ? comment.thread.likers.length : 0;
						}

						return comment;
					})

					this.comments = provisionalArray;





				}

				this.waitComments = false;


			},
				(err) => {
					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'bottom'
					}).then(toast => {
						toast.present()
					})

					this.waitComments = false;


				});



	}

	getAnswers() {

		this.waitComments = true;
		this.enableInfinite = true;

		this.authService.getUserThreadAnswers(0)
			.subscribe((comments: any) => {

				comments = comments.filter(comment => comment.thread || comment.take || comment.trivia);

				if (comments.length >= 15) {
					this.enableInfinite = true;
				} else {
					this.enableInfinite = false;
				}
				if (comments.length > 0) {
					let provisionalArray = comments.map((comment: any) => {
						comment.answers.date = new Date(comment.answers.date);
						comment.answers.likedByUser = this.userHasLiked(comment.answers);
						comment.answers.count = comment.numberOfLikers;
						comment.answers.created = this.created(comment.answers);
						comment.date = new Date(comment.date);
						comment.created = this.created(comment);
						comment.likedByUser = this.userHasLiked(comment);
						comment.count = comment.likers ? comment.likers.length : 0;
						if (comment.thread) {
							comment.thread.date = new Date(comment.thread.date);
							comment.thread.likedByUser = this.userHasLiked(comment.thread);
							comment.thread.count = comment.thread.likers ? comment.thread.likers.length : 0;
						}

						return comment;
					})

					this.answers = provisionalArray;



				}
				this.waitComments = false;


			},
				(err) => {
					this.enableInfinite = true
					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'bottom'
					}).then(toast => {
						toast.present()
					})
					this.waitComments = false;


				});



	}



	getMoreAnswers(skip, infiniteScroll) {

		this.authService.getUserThreadAnswers(skip)
			.subscribe((comments: any) => {


				if (comments.length < 15) this.enableInfinite = false;
				if (comments.length > 0) {
					let provisionalArray = comments.map((comment: any) => {
						comment.answers.date = new Date(comment.answers.date);
						comment.answers.created = this.created(comment.answers);
						comment.answers.user = this.authService.currentUser;
						if (comment.thread) {
							comment.thread.date = new Date(comment.thread.date);
							comment.thread.likedByUser = this.userHasLiked(comment.thread);
							comment.thread.count = comment.thread.likers ? comment.thread.likers.length : 0;
						}

						return comment;
					})

					this.answers = this.answers.concat(provisionalArray);
					infiniteScroll.target.complete();



				}


			},
				(err) => {
					this.enableInfinite = true
					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'bottom'
					}).then(toast => {
						toast.present()
					})
					infiniteScroll.target.complete();



				});



	}


	getMoreTakes(skip, infiniteScroll) {


		this.authService.getTakes(skip)
			.subscribe((takes: any) => {

				if (takes.length >= 10) {
					this.enableInfinite = true;
				} else {
					this.enableInfinite = false;
				}
				if (takes.length > 0) {
					let provisionalArray = takes.map((take: any) => {
						take.date = new Date(take.date);
						take.created = this.created(take);
						take.likedByUser = this.userHasLiked(take);
						take.count = take.likers ? take.likers.length : 0;
						take.user = this.authService.currentUser;
						return take;
					})

					this.takes = this.takes.concat(provisionalArray);



				}
				infiniteScroll.target.complete();




			},
				(err) => {
					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'bottom'
					}).then(toast => toast.present())

					infiniteScroll.target.complete();
					this.enableInfinite = true


				});

	}

	getMoreComments(skip, infiniteScroll) {

		this.authService.getUserThreadDiscussions(skip)
			.subscribe((comments: any) => {


				if (comments.length < 15) this.enableInfinite = false;
				if (comments.length > 0) {
					let provisionalArray = comments.map((comment: any) => {
						comment.date = new Date(comment.date);
						comment.user = this.authService.currentUser;
						comment.created = this.created(comment);
						if (comment.thread) {
							comment.thread.date = new Date(comment.thread.date);
							comment.thread.likedByUser = this.userHasLiked(comment.thread);
							comment.thread.count = comment.thread.likers ? comment.thread.likers.length : 0;
						}

						return comment;
					})


					this.comments = this.comments.concat(provisionalArray);
					infiniteScroll.target.complete();



				}


			},
				(err) => {
					this.enableInfinite = true
					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'bottom'
					}).then(toast => {
						toast.present()
					})
					infiniteScroll.target.complete();
				});
	}


	getMorePosts(skip: number, infiniteScroll: any) {
		this.authService.getProfile(skip)
			.subscribe((user: any) => {

				let threads = user.threads;
				if (threads.length < 15) this.enableInfinite = false;
				if (threads.length > 0) {
					let provisionalArray = threads.map((thread: any) => {
						thread.date = new Date(thread.date);
						thread.created = this.created(thread);
						thread.likedByUser = this.userHasLiked(thread);
						thread.count = thread.likers ? thread.likers.length : 0;
						thread.user = this.authService.currentUser;
						return thread;
					})

					this.threads = this.threads.concat(provisionalArray);
					infiniteScroll.target.complete();

				}
			},
				(err) => {
					this.enableInfinite = true
					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'bottom'
					}).then(toast => {
						toast.present()
					})
					infiniteScroll.target.complete();
				})


	}



	getPostsSegment() {
		this.postsBoolean = true;
		this.commentsBoolean = false;
		this.takesBoolean = false;
		this.answersBoolean = false;
		this.triviasBoolean = false;
		this.waitComments = true;
		this.getThreads();

	}

	getTakesSegment() {
		this.postsBoolean = false;
		this.commentsBoolean = false;
		this.takesBoolean = true;
		this.answersBoolean = false;
		this.triviasBoolean = false;
		this.waitComments = true;
		this.getTakes();

	}

	getCommentsSegment() {
		this.postsBoolean = false;
		this.commentsBoolean = true;
		this.takesBoolean = false;
		this.answersBoolean = false;
		this.triviasBoolean = false;
		this.getComments();

	}

	getAnswersSegment() {
		this.postsBoolean = false;
		this.commentsBoolean = false;
		this.takesBoolean = false;
		this.answersBoolean = true;
		this.triviasBoolean = false;
		this.getAnswers();


	}



	created(thread: IThread): string {

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

	userHasLiked(thread: IThread) {

		if (this.authService.currentUser) {
			return this.likesService.userHasLiked(thread, this.authService.currentUser._id);
		} else {
			return false;
		}
	}

	following() {
		let data = {
			user: this.authService.currentUser,
			title: "Following"
		}
		this.authService.paramSignUp = data;

		this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/followers', this.authService.currentUser._id]);

	}

	followers() {
		let data = {
			user: this.authService.currentUser,
			title: "Followers"
		}
		this.authService.paramSignUp = data;

		this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/followers', this.authService.currentUser._id]);
	}

	doInfinite(infiniteScroll) {


		if (this.postsBoolean) {
			this.skipThreads += 15;
			this.getMorePosts(this.skipThreads, infiniteScroll);
		} else if (this.commentsBoolean) {
			this.skipComments += 15;
			this.getMoreComments(this.skipComments, infiniteScroll);

		} else if (this.answersBoolean) {
			this.skipAnswers += 15;
			this.getMoreAnswers(this.skipAnswers, infiniteScroll);

		} else {
			this.skipTakes += 10;
			this.getMoreTakes(this.skipTakes, infiniteScroll);
		}

	}


}
