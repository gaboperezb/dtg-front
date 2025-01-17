import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { NavController, IonContent, ToastController, ModalController, ActionSheetController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ITeam, IThread, ITake } from '../shared/interfaces';
import { LikesService } from '../core/likers.service';
import { ThreadLikesService } from '../core/thread-likers.service';
import { ThreadsService } from '../core/threads.service';
import { FcmProvider } from '../core/fcm.service';
import { NewChatPage } from '../new-chat/new-chat.page';
import { SignupAppPage } from '../signup-app/signup-app.page';
import { SharePostPage } from '../share-post/share-post.page';
import { ChatService } from '../core/chat.service';
import { Platform } from '@ionic/angular';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AppState } from '../core/state.service';
import { TakeService } from '../core/take.service';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';

@Component({
	selector: 'app-fav-detail',
	templateUrl: './fav-detail.page.html',
	styleUrls: ['./fav-detail.page.scss'],
})
export class FavDetailPage implements OnInit {

	team: ITeam;
	wait: boolean = true;
	threads: IThread[] = [];
	takes: ITake[] = [];
	hideInfinite: boolean = false;
	teamId: any;
	skip: number = 0;
	skipTakes: number = 0;
	teamStyle: any;
	swipeTimeOut: any;
	underlinedTakes: boolean = false;
	postsBoolean: boolean = true;
	takesBoolean: boolean = false;
	@ViewChild('favTeamsPage', { static: true }) content: IonContent;

	constructor(private authService: AuthService,
		private statusBar: StatusBar,
		private platform: Platform,
		private navCtrl: NavController,
		private threadsService: ThreadsService,
		private takeService: TakeService,
		private actionSheetCtrl: ActionSheetController,
		private likesService: LikesService,
		private threadLikesService: ThreadLikesService,
		private router: Router,
		private clipboard: Clipboard,
		private socialSharing: SocialSharing,
		private global: AppState,
		private chatService: ChatService,
		private modalCtrl: ModalController,
		private fcm: FcmProvider,
		private toastCtrl: ToastController,
		private route: ActivatedRoute) {

		let id = this.route.snapshot.paramMap.get('id');
		if (id != 'all') {
			this.team = this.authService.currentUser.favAllTeams.find(t => t._id == id)
			this.teamId = this.team._id;
		}
		else {
			this.teamId = 'All'
		}

	}

	ngOnInit() {

		if (this.teamId == 'All') {
			this.teamStyle = {
				'background-color': '#21253C'
			}
		}
		else {
			this.teamStyle = {
				'background-color': this.team.background
			}
		}

		setTimeout(() => {
			this.getThreads(this.teamId)
		}, 800);

	}

	getPostsSegment() {
		this.wait = true;
		this.underlinedTakes = false;
		this.postsBoolean = true;
		this.takesBoolean = false;
		this.getThreads(this.teamId)
	}


	getTakesSegment() {
		this.wait = true;
		this.underlinedTakes = true;
		this.postsBoolean = false;
		this.takesBoolean = true;
		this.getTakes(this.teamId)
	}


	createPost() {
		let selection = 'text';
		this.authService.paramSignUp = selection;
		this.navCtrl.navigateForward(this.router.url.substr(0, 10) + '/new-thread');
	}

	ionViewDidLeave() {
		this.content.scrollY = false;
		clearTimeout(this.swipeTimeOut);
		this.authService.swipeBack = true;
	}


	ionViewDidEnter() {
		//track views
		setTimeout(() => {
			this.content.scrollY = true;
		}, 100);

	}





	ionViewWillLeave() {
		if (this.global.state['theme'] == 'light') {
			this.platform.ready().then(() => {
				if (this.platform.is('ios')) {
					this.statusBar.styleDefault();
				}

			})
		}

		clearTimeout(this.swipeTimeOut);
		this.authService.swipeBack = false;

		this.swipeTimeOut = setTimeout(() => {
			this.authService.swipeBack = true;
		}, 1500);


	}

	ionViewWillEnter() {
		this.platform.ready().then(() => {
			if (this.platform.is('ios')) {
				this.statusBar.styleLightContent();
			}
		})
	}

	goBack() {

		this.authService.addurl = false;
		this.navCtrl.pop();

	}

	userHasLiked(thread: IThread) {

		if (this.authService.currentUser) {
			return this.likesService.userHasLiked(thread, this.authService.currentUser._id);
		} else {
			return false;
		}
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

			this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/user', user._id])

		}

	}

	itemTapped($event, thread) {

		if (!this.threadsService.getThread(thread._id)) this.threadsService.threadUserPage = thread;
		this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/thread-detail', thread._id]);

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


	getTakes(team: string, event?: any) {
		this.hideInfinite = false;
		this.skipTakes = 0;
		if (event) this.fcm.impact('light');

		this.takeService.getTeamTakes(team, this.skipTakes)
			.subscribe((takes: any) => {

				let prov = takes.map((take: any) => {
					take.date = new Date(take.date);
					take.created = this.created(take);
					take.likedByUser = this.userHasLiked(take);
					take.count = take.likers ? take.likers.length : 0;
					take.levelN = take.user.badge.picture.replace('.png', 'N.png');

					return take;
				})

				this.takes = prov;
				this.hideInfinite = false;
				this.wait = false;
				if (takes.length < 10) this.hideInfinite = true;
				if (event) event.target.complete();

			},
				(err) => {

					if (event) event.target.complete();
					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'top'
					}).then(toast => toast.present())

				})
	}

	getMoreThreads(team: string, event: any) {

		this.threadsService.getTeamThreads(team, this.skip)
			.subscribe((threads: any) => {

				if (threads.length > 0) {

					let prov = threads.map((thread: any) => {
						thread.date = new Date(thread.date);
						thread.created = this.created(thread);
						thread.likedByUser = this.userHasLiked(thread);
						thread.count = thread.likers ? thread.likers.length : 0;
						thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');
						let reducedText = thread.title.substring(0, 50);
						if (reducedText.length < thread.title.length) {
							thread.titleToShow = thread.title.substring(0, 50) + "...";
						} else {
							thread.titleToShow = thread.title;
						}

						return thread;
					})
					let newThreadsArray = this.threads.concat(prov)
					//Eliminar duplicados. Esto sucede porque continuamente se agregan discusiones a la base de datos; el skip genera esto.
					let unique = newThreadsArray.filter((item, i, array) => {
						return array.findIndex((item2) => { return item2._id == item._id }) === i;
					})
					this.threads = unique;

				}

				if (threads.length < 8) {
					this.hideInfinite = true;
				} else {
					this.hideInfinite = false;
				}

				event.target.complete()

			},
				(err) => {

					event.target.complete()
					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'top'
					}).then(toast => toast.present())

				})
	}

	getThreads(team: string, event?: any) {
		this.hideInfinite = false;
		this.skip = 0;
		if (event) this.fcm.impact('light');

		this.threadsService.getTeamThreads(team, this.skip)
			.subscribe((threads: any) => {


				let prov = threads.map((thread: any) => {
					thread.date = new Date(thread.date);
					thread.created = this.created(thread);
					thread.likedByUser = this.userHasLiked(thread);
					thread.count = thread.likers ? thread.likers.length : 0;
					thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');
					let reducedText = thread.title.substring(0, 50);
					if (reducedText.length < thread.title.length) {
						thread.titleToShow = thread.title.substring(0, 50) + "...";
					} else {
						thread.titleToShow = thread.title;
					}

					return thread;
				})

				this.threads = prov;
				this.hideInfinite = false;
				this.wait = false;
				if (threads.length < 8) this.hideInfinite = true;
				if (event) event.target.complete();

			},
				(err) => {

					if (event) event.target.complete();
					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'top'
					}).then(toast => toast.present())

				})
	}


	getMoreTakes(team: string, event: any) {

		this.takeService.getTeamTakes(team, this.skip)
			.subscribe((takes: any) => {

				if (takes.length > 0) {

					let prov = takes.map((take: any) => {
						take.date = new Date(take.date);
						take.created = this.created(take);
						take.likedByUser = this.userHasLiked(take);
						take.count = take.likers ? take.likers.length : 0;
						take.levelN = take.user.badge.picture.replace('.png', 'N.png');


						return take;
					})
					let newThreadsArray = this.threads.concat(prov)
					//Eliminar duplicados. Esto sucede porque continuamente se agregan discusiones a la base de datos; el skip genera esto.
					let unique = newThreadsArray.filter((item, i, array) => {
						return array.findIndex((item2) => { return item2._id == item._id }) === i;
					})
					this.threads = unique;

				}

				if (takes.length < 10) {
					this.hideInfinite = true;
				} else {
					this.hideInfinite = false;
				}

				event.target.complete()

			},
				(err) => {

					event.target.complete()
					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'top'
					}).then(toast => toast.present())

				})
	}



	sharePostToChat(e: any, thread: IThread) {

		if (this.authService.isLoggedIn()) {
			let data = {
				thread
			}
			e.stopPropagation();
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

		let saved = this.userHasSaved(thread)

		e.stopPropagation()
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

	doInfinite(event) {

		if (this.postsBoolean) {

			this.skip += 8;
			this.getMoreThreads(this.teamId, event);

		} else {

			this.skipTakes += 10;
			this.getMoreTakes(this.teamId, event);

		}


	}


}
