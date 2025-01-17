import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { NavController, LoadingController, ToastController, IonContent, ModalController, ActionSheetController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { IThread } from '../shared/interfaces';
import * as _ from 'lodash';
import { ThreadLikesService } from '../core/thread-likers.service';
import { LikesService } from '../core/likers.service';
import { ThreadsService } from '../core/threads.service';
import { FcmProvider } from '../core/fcm.service';
import { SharePostPage } from '../share-post/share-post.page';
import { SignupAppPage } from '../signup-app/signup-app.page';
import { NewChatPage } from '../new-chat/new-chat.page';
import { ChatService } from '../core/chat.service';
import { AppState } from '../core/state.service';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';

@Component({
	selector: 'app-all-featured',
	templateUrl: './all-featured.page.html',
	styleUrls: ['./all-featured.page.scss'],
})
export class AllFeaturedPage implements OnInit {

	league: string = "";
	leagueToShow: string = ";"
	loaderInstance: any;
	hideInfinite: boolean = false;
	skip: number = 0;
	showTitle: boolean = false;
	loadingFeatured: boolean = true;
	featuredThreads: any[] = [];
	scrollPosition: number;
	swipeTimeOut: any;
	@ViewChild('featuredPage', { static: true }) content: IonContent;

	constructor(private authService: AuthService,
		private chatService: ChatService,
		private navCtrl: NavController,
		private threadLikesService: ThreadLikesService,
		private fcm: FcmProvider,
		private modalCtrl: ModalController,
		private likesService: LikesService,
		private actionSheetCtrl: ActionSheetController,
		public global: AppState,
		private clipboard: Clipboard,
		private socialSharing: SocialSharing,
		private router: Router,
		public threadsService: ThreadsService,
		private toastCtrl: ToastController,
		private loadingCtrl: LoadingController,
		private route: ActivatedRoute) {

		this.leagueToShow = this.route.snapshot.paramMap.get('league') == "TOP" ? "ALL" : this.route.snapshot.paramMap.get('league');
		this.league = this.route.snapshot.paramMap.get('league');
		this.featuredThreads = _.cloneDeep(this.threadsService.featuredThreads);

	}

	ngOnInit() {

		setTimeout(() => {
			this.loadingFeatured = false
		}, 1000);

	}

	ionViewDidLeave() {

		this.content.scrollY = false;
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

		//track views
		setTimeout(() => {
			this.content.scrollY = true;
		}, 100);
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

	fScroll(event) {

		if (event.detail.currentY > 90) {
			if (!this.showTitle) this.showTitle = true;
		} else {
			if (this.showTitle) this.showTitle = false;
		}

	}

	getFeatured(league: string, event?: any) {
		this.hideInfinite = false;
		this.skip = 0;
		if (event) this.fcm.impact('light');
		this.threadsService.getFeatured(league, this.skip)
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

				this.featuredThreads = prov;
				this.hideInfinite = false;

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

				if (thread.bookmarks) thread.bookmarks.push(this.authService.currentUser._id);
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

	getMoreFeatured(league: string, event: any) {

		this.threadsService.getFeaturedForFeaturedPage(league, this.skip)
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
					let newThreadsArray = this.featuredThreads.concat(prov)
					//Eliminar duplicados. Esto sucede porque continuamente se agregan discusiones a la base de datos; el skip genera esto.
					let unique = newThreadsArray.filter((item, i, array) => {
						return array.findIndex((item2) => { return item2._id == item._id }) === i;
					})
					this.featuredThreads = unique;

				} else {
					this.hideInfinite = true;
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

	shareVia(thread: IThread) {

		var options = {
			url: 'https://www.discussthegame.com/posts/' + thread._id
		};
		this.socialSharing.shareWithOptions(options)
	}

	doInfinite(event) {

		this.skip += 6;
		this.getMoreFeatured(this.league, event);

	}

}
