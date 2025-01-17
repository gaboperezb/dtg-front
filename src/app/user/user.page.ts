import { Component, ViewChild } from '@angular/core';
import { IonContent, ToastController, LoadingController, ModalController, AlertController, ActionSheetController, NavController } from '@ionic/angular';
import { IThread, IUserDB } from '../../app/shared/interfaces';
import { AuthService } from '../../app/core/auth.service';
import { ThreadLikesService } from '../../app/core/thread-likers.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { AppState } from '../../app/core/state.service';
import { WebSocketService } from '../../app/core/websocket.service';
import { Router } from '@angular/router';
import { SignupAppPage } from '../signup-app/signup-app.page';
import { ThreadsService } from '../core/threads.service';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { FcmProvider } from '../core/fcm.service';
import { ChatService } from '../core/chat.service';
import { SharePostPage } from '../share-post/share-post.page';
import { NewChatPage } from '../new-chat/new-chat.page';
import { Clipboard } from '@ionic-native/clipboard/ngx';


/**
 * Generated class for the UserPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
	selector: 'app-user',
	templateUrl: './user.page.html',
	styleUrls: ["./user.page.scss"]
})
export class UserPage {

	user: IUserDB;
	userBackground: any;
	wait: boolean = true;
	waitProfile: boolean = false;
	enableInfinite: boolean;
	threads: IThread[] = [];
	takes: IThread[] = [];
	skipPosts: number = 0;
	skipTakes: number = 0;
	takesBoolean: boolean = false;
	skipTrivias: number = 0;
	triviasBoolean: boolean = false;
	postsBoolean: boolean = true;
	reactivateInfinite: any;
	swipeTimeOut: any;
	fetchingTeams: boolean = true;
	blocked: boolean = false;
	scrollPosition: number;
	data: any;
	filterBy: string = "TOP"
	largeLevel: string = "";
	scrollTO: any;
	commaPoints: string = "";
	entered: boolean = false;
	extraTeams: number;
	teamsToShow: any[] = [];

	@ViewChild('userPage', { static: true }) content: IonContent;

	constructor(
		private fcm: FcmProvider,
		private actionSheetCtrl: ActionSheetController,
		private loadingCtrl: LoadingController,
		private socialSharing: SocialSharing,
		private chatService: ChatService,
		private threadLikesService: ThreadLikesService,
		private webSocketService: WebSocketService,
		private modalCtrl: ModalController,
		private alertCtrl: AlertController,
		private clipboard: Clipboard,
		private authService: AuthService,
		private likesService: ThreadLikesService,
		private toastCtrl: ToastController,
		private router: Router,
		private navCtrl: NavController,
		public threadsService: ThreadsService,
		public global: AppState) {

		this.data = authService.paramSignUp;
		if (!this.data) {
			return;
		}

		if (!this.data.fcm) {
			this.user = this.data.user;
		} else {
			this.waitProfile = true;
		}

	}
	goToTabRoot() {
		this.navCtrl.navigateRoot(this.router.url.substr(0, 10))
	}

	handlePosts(league: string) {
		if (this.postsBoolean) {
			this.getThreads(league)
		} else {
			this.getTakes(league)
		}
	}

	goBack() {

		this.authService.addurl = false;
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
			this.content.scrollY = true;
		}, 100);

	}

	ngOnInit() {

		if (!this.data) {
			this.goToTabRoot()
			return;
		}
		if (!this.data.fcm) {
			this.commaPoints = this.numberWithCommas(this.user.totalPoints);
			this.followRelation();
			this.blockRelation();
			this.setInitialSettings();
			
			setTimeout(() => {
				this.getThreads(this.filterBy);
				this.getUser(this.user._id)
			}, 500);
		} else {
			setTimeout(() => {
				this.getUser(this.data.userId); //cuando es por notificación
			}, 800);

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

		e.stopPropagation()
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


	presentActionSheet() {

		this.actionSheetCtrl.create({
			header: 'ACTION',
			cssClass: 'my-custom-action',
			buttons: [
				{
					text: 'Send Message',
					handler: () => {

						if (!this.authService.isLoggedIn()) {
							this.alertCtrl.create({
								header: 'You must log in to send a private message',
								buttons: ['Dismiss']
							}).then(alert => {
								alert.present();
							})

							return;
						}


						this.loadingCtrl.create({
							spinner: 'crescent',
							cssClass: 'my-custom-loading'
						}).then(loader => {
							loader.present();

							let members = [this.user._id, this.authService.currentUser._id]

							let data: any = {
								customType: '1-1',
								members,
								operatorIds: [this.authService.currentUser._id]
							}

							this.chatService.checkChat(data)
								.subscribe((chat: any) => {

									loader.dismiss();
									if (chat) {

										//El chat esta en el arreglo de chats
										if (this.chatService.chats.some(chatt => chatt._id == chat._id)) {

											var foundIndex = this.chatService.chats.findIndex(x => x._id == chat._id);
											this.chatService.chats[foundIndex].chatName = this.user.username;
											this.chatService.chats[foundIndex].otherUserPicture = this.user.profilePicture;
											this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/chat-detail', chat._id]);

										} else {
											chat.chatName = this.user.username;
											chat.otherUserPicture = this.user.profilePicture;
											//El chat no estaba en el arreglo epro existe en la base de datos
											this.chatService.addNewChat(chat);
											this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/chat-detail', chat._id]);
										}

									} else {

										data.recipient = this.user;
										data.chatName = this.user.username;
										data.otherUserPicture = this.user.profilePicture;
										let provChat = data;

										//Create "new chat"
										provChat._id = "empty";
										provChat.createdAt = Date.now();
										this.chatService.addNewChat(provChat);
										this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/chat-detail', provChat._id]);

									}

								},
									(err) => {
										loader.dismiss();
										this.toastCtrl.create({
											message: err,
											duration: 3000,
											position: 'bottom'
										}).then(toast => toast.present())
									})
						})





					}
				},
				{
					text: 'Report',

					handler: () => {

						if (!this.authService.isLoggedIn()) {
							this.alertCtrl.create({
								header: 'Please login before reporting a user',
								buttons: ['Dismiss']
							}).then(alert => {
								alert.present();
							})

							return;
						}
						this.alertCtrl.create({
							header: 'Why are you reporting ' + this.user.username + '?',
							inputs: [
								{
									name: 'reason',
									placeholder: 'Reason'
								}
							],
							buttons: [
								{
									text: 'Cancel',
									role: 'cancel',
									handler: data => {

									}
								},
								{
									text: 'Report',
									handler: data => {
										this.authService.reportUser(this.user._id, data.reason)
											.subscribe((user) => {
												this.alertCtrl.create({
													header: 'Thanks for reporting ' + this.user.username,
													subHeader: 'Thanks to you we can make DiscussTheGame a better community!',
													buttons: ['Dismiss']
												}).then(alert => alert.present());


											},
												(err) => {
													this.toastCtrl.create({
														message: err,
														duration: 3000,
														position: 'bottom'
													}).then(toast => toast.present());

												});
									}
								}
							]
						}).then(alert => alert.present())

					}
				},
				{
					text: this.blocked ? 'Unblock' : 'Block',
					handler: () => {

						if (!this.authService.isLoggedIn()) {
							this.alertCtrl.create({
								header: 'Not Logged In',
								subHeader: 'Please login before blocking a user',
								buttons: ['Dismiss']
							}).then(alert => alert.present());

							return;
						}

						if (this.blocked) {

							this.alertCtrl.create({
								header: 'Unblock ' + this.user.username + '?',
								message: "This person will be able to find your profile, your posts or your comments. DiscussTheGame will not warn this person that you unblocked it.",
								buttons: [
									{
										text: 'Cancel',
										role: 'cancel',
										handler: () => {

										}
									},
									{
										text: 'Unblock',
										handler: () => {
											this.blocked = false;
											this.authService.currentUser.usersBlocked = this.authService.currentUser.usersBlocked.filter(element => element != this.user._id);
											this.authService.unblockUser(this.user._id)
												.subscribe(() => {

												},
													(err) => {
														this.toastCtrl.create({
															message: err,
															duration: 3000,
															position: 'bottom'
														}).then(toast => toast.present());

													});


										}
									}
								]
							}).then(alert => alert.present());


						} else {
							this.alertCtrl.create({
								header: 'Block ' + this.user.username + '?',
								message: "This person will not be able to send you private messages, find your profile, your posts or your comments. DiscussTheGame will not warn this person that you blocked it.",
								buttons: [
									{
										text: 'Cancel',
										role: 'cancel',
										handler: () => {

										}
									},
									{
										text: 'Block',
										handler: () => {

											if (this.user.provFollowing) {

												this.user.provFollowing = false;
												this.authService.currentUser.followingNumber -= 1;
												this.user.followersNumber -= 1;
												this.authService.currentUser.following = this.authService.currentUser.following.filter(element => element != this.user._id);

											}



											this.blocked = true;
											this.authService.currentUser.usersBlocked.push(this.user._id);
											this.authService.blockUser(this.user._id)
												.subscribe(() => {

												},
													(err) => {
														this.toastCtrl.create({
															message: err,
															duration: 3000,
															position: 'bottom'
														}).then(toast => toast.present());

													});


										}
									}
								]
							}).then(alert => alert.present());
						}

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

	numberWithCommas(x: number) {
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

	addMoreTeams() {

		if(this.user.favAllTeams.length) {
			this.teamsToShow = this.teamsToShow.concat(this.user.favAllTeams.slice(this.teamsToShow.length, this.teamsToShow.length + 10))
			this.extraTeams = this.user.favAllTeams.length - this.teamsToShow.length;
		}
		
	}


	getUser(userId: string) {

		this.authService.getUser(userId)
			.subscribe((user: any) => {
				this.user = user;
				console.log(user)
				this.largeLevel = this.user.badge.picture.replace(".png", "L.png");
				this.waitProfile = false;
				this.commaPoints = this.numberWithCommas(this.user.totalPoints);
				this.followRelation();

				if(this.user.favAllTeams && this.user.favAllTeams.length) {
					this.teamsToShow = this.user.favAllTeams.slice(0,10);
					this.extraTeams = this.user.favAllTeams.length - this.teamsToShow.length;
				
				}
				this.fetchingTeams = false;
				this.blockRelation();
				this.setInitialSettings();
				this.getThreads(this.filterBy);

			},
				(err) => {
					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'bottom'
					}).then(toast => toast.present())

					this.waitProfile = false;
				});

	}

	followings() {

		if (this.authService.isLoggedIn()) {

			let data = {
				user: this.user,
				title: "Following"
			}
			this.authService.paramSignUp = data;


			this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/followers', this.user._id])

		} else {

			//Mandar a signup
			let data = {
				message: 'Sign up to follow people!',
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

	followers() {

		if (this.authService.isLoggedIn()) {



			let data = {
				user: this.user,
				title: "Followers"
			}
			this.authService.paramSignUp = data;


			this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/followers', this.user._id])

		} else {

			//Mandar a signup
			let data = {
				message: 'Sign up to follow people!',
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


	followRelation() {

		if (this.authService.isLoggedIn()) {
			if (this.authService.currentUser.following.indexOf(this.user._id) >= 0) {
				this.user.provFollowing = true;
				this.user.loadingFollow = false;
			} else {
				this.user.provFollowing = false;
				this.user.loadingFollow = false;
			}
		} else {
			this.user.loadingFollow = false;
			this.user.provFollowing = false;
		}

	}

	blockRelation() {

		if (this.authService.isLoggedIn()) {
			if (this.authService.currentUser.usersBlocked.indexOf(this.user._id) >= 0) {
				this.blocked = true;

			} else {
				this.blocked = false;

			}
		} else {
			this.blocked = false;
		}

	}

	followUser() {

		if (this.authService.isLoggedIn()) {

			this.fcm.impact('light');

			if (!this.user.loadingFollow) {
				if (this.user.provFollowing) {
					//Unfollow
					this.user.provFollowing = false;
					this.authService.currentUser.followingNumber -= 1;
					this.user.followersNumber -= 1;
					this.authService.currentUser.following = this.authService.currentUser.following.filter(element => element != this.user._id);
					this.authService.unfollow(this.user._id)
						.subscribe(() => {


						},
							(err) => {
								this.toastCtrl.create({
									message: err,
									duration: 3000,
									position: 'bottom'
								}).then(toast => toast.present())

							});

				} else {
					//Follow
					this.user.provFollowing = true;
					this.authService.currentUser.followingNumber += 1;
					this.user.followersNumber += 1;
					this.authService.currentUser.following.push(this.user._id);
					this.authService.follow(this.user._id)
						.subscribe(() => {
							this.webSocketService.emitPost(null, "follow", this.user._id, this.authService.currentUser._id);
						},
							(err) => {
								this.toastCtrl.create({
									message: err,
									duration: 3000,
									position: 'bottom'
								}).then(toast => toast.present())
							});

				}
			}


		} else {
			//Mandar a signup
			let data = {
				message: 'Sign up to follow people!',
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

	setInitialSettings() {

		if (this.user.coverPhoto) {
			this.userBackground = {
				'background-image': 'url(' + this.user.coverPhoto + '',
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

	goToThread(thread) {

		thread.user = this.user;
		this.threadsService.threadUserPage = thread;
		this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/thread-detail', thread._id])

	}


	getPostsSegment() {
		this.postsBoolean = true;
		this.takesBoolean = false;

		this.wait = true;
		this.getThreads(this.filterBy);

	}

	getTakesSegment() {
		this.postsBoolean = false;
		this.takesBoolean = true;

		this.wait = true;
		this.getTakes(this.filterBy);

	}

	getTakes(league: string) {

		this.filterBy = league;
		this.wait = true;
		///
		if (this.reactivateInfinite) this.enableInfinite = true;
		this.authService.getOtherUserTakes(this.filterBy, 0, this.user._id, this.threadsService.leagues)
			.subscribe((takes: any) => {

				this.wait = false;
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
						take.user = this.user;
						take.count = take.likers ? take.likers.length : 0
						return take;
					})

					this.takes = provisionalArray;


				} else {
					this.takes = [];
				}

			},
				(err) => {
					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'bottom'
					}).then(toast => toast.present())

					this.wait = false;

				});

	}


	getThreads(league: string) {

		this.filterBy = league;
		this.wait = true;
		///
		if (this.reactivateInfinite) this.enableInfinite = true;
		this.authService.getOtherUserThreads(this.filterBy, 0, this.user._id, this.threadsService.leagues)
			.subscribe((threads: any) => {

				this.wait = false;
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
						return thread;
					})

					this.threads = provisionalArray;

				} else {
					this.threads = [];
				}

			},
				(err) => {
					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'bottom'
					}).then(toast => toast.present())

					this.wait = false;

				});

	}


	getMorePosts(skip: number, infiniteScroll: any) {
		this.authService.getOtherUserThreads(this.filterBy, skip, this.user._id, this.threadsService.leagues)
			.subscribe((threads: any) => {
				if (threads.length < 15) this.enableInfinite = false;
				if (threads.length > 0) {
					let provisionalArray = threads.map((thread: any) => {
						thread.date = new Date(thread.date);
						thread.created = this.created(thread);
						thread.count = thread.likers ? thread.likers.length : 0;
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
						position: 'top'
					}).then(toast => {
						toast.present()
					})
					infiniteScroll.target.complete();
				})


	}

	getMoreTakes(skip: number, infiniteScroll: any) {
		this.authService.getOtherUserTakes(this.filterBy, skip, this.user._id, this.threadsService.leagues)
			.subscribe((takes: any) => {
				if (takes.length < 10) this.enableInfinite = false;
				if (takes.length > 0) {
					let provisionalArray = takes.map((take: any) => {
						take.date = new Date(take.date);
						take.created = this.created(take);
						take.likedByUser = this.userHasLiked(take);
						take.user = this.user;
						take.count = take.likers ? take.likers.length : 0
						return take;
					})

					this.takes = this.takes.concat(provisionalArray);
					infiniteScroll.target.complete();

				}
			},
				(err) => {
					this.enableInfinite = true
					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'top'
					}).then(toast => {
						toast.present()
					})
					infiniteScroll.target.complete();
				})


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


	doInfinite(infiniteScroll) {

		this.reactivateInfinite = infiniteScroll;
		if (this.postsBoolean) {
			this.skipPosts += 15;
			this.getMorePosts(this.skipPosts, infiniteScroll);
		} else {
			this.skipTakes += 10;
			this.getMoreTakes(this.skipTakes, infiniteScroll);
		}

	}

}
