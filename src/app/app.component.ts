import { Component, ViewChild } from '@angular/core';
import { Platform, NavController, ToastController, IonSlides } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { AppState } from './core/state.service';
import { Router, NavigationEnd, NavigationStart, NavigationCancel, NavigationError } from '@angular/router';
import { AuthService } from './core/auth.service';
import { FcmProvider } from './core/fcm.service';
import { Storage } from '@ionic/storage';
import { WebSocketService } from './core/websocket.service';
import { Network } from '@ionic-native/network/ngx';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { ChatService } from './core/chat.service';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { ThreadsService } from './core/threads.service';
import { LikesService } from './core/likers.service';
import { TakeService } from './core/take.service';
import { PlayService } from './core/play.service';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

declare var embedly;
declare var cordova: any;

@Component({
	selector: 'app-root',
	templateUrl: 'app.component.html',
	styleUrls: ['app.component.scss']
})
export class AppComponent {

	swiper: any;
	sliderOptns = {
		zoom: {
			maxRatio: 2.5
		}
	}
	@ViewChild('imageSlide') slide: IonSlides;
	onResumeSubscription;
	onPauseSubscription;
	disconnection;
	disconnectionTimeout;
	chatsSubscription;
	urlsToHide: string[] = ['chats', 'chat-detail', 'chat-info', 'new-thread', 'new-take', 'teams', 'thread-detail', 'take-detail', 'timeline-detail', 'take-timeline-detail', 'trivia-detail', 'trivia-timeline-detail']
	test: string = "asd";
	previousUrl: string;
	currentUrl: string;
	presentRateDialog0: boolean = false;
	presentRateDialog1: boolean = false;
	presentRateDialog2: boolean = false;
	constructor(
		private toastCtrl: ToastController,
		private platform: Platform,
		private splashScreen: SplashScreen,
		private keyboard: Keyboard,
		private router: Router,
		private playService: PlayService,
		private likesService: LikesService,
		private firebaseNative: FirebaseX,
		public authService: AuthService,
		private toast: ToastController,
		private statusBar: StatusBar,
		private fcm: FcmProvider,
		private threadsService: ThreadsService,
		private storage: Storage,
		private webSocketService: WebSocketService,
		private navCtrl: NavController,
		private network: Network,
		private inAppBrowser: InAppBrowser,
		public takeService: TakeService,
		public global: AppState,
		private chatService: ChatService

	) {
		this.initializeApp();

	}

	ngOnInit() {

		this.disconnection = this.debounce();
		this.checkRouterEvent();
		this.initializeEmbedly();
		this.dark()

	}

	loaded(e: any) {


		this.slide.getSwiper().then(swiper => {
			this.swiper = swiper
		})

	}

	closeGesture(e: any) {

		if (this.swiper.zoom.scale == 1) this.closeFullScreen()
	}



	getMessages() {


		this.chatService.connectingDetail = true;
		this.chatService.getMessagesForChat(this.chatService.currenChatRoom, 0, 50)
			.subscribe((messages) => {

				let localMess;
				let dbMess;
				this.chatService.connectingDetail = false;
				if (messages.length > 0) {
					if (this.chatService.channelMessages[this.chatService.currenChatRoom]) {
						localMess = this.chatService.channelMessages[this.chatService.currenChatRoom].concat().reverse().slice(0, 30).map(e => e.message);
					} else {
						localMess = [];
					}
					dbMess = messages.concat().reverse().slice(0, 30).map(e => e.message)

					if (dbMess.sort().join(',') === localMess.sort().join(',')) {
						//equal



					} else {

						setTimeout(() => {
							this.chatService.channelMessages[this.chatService.currenChatRoom] = messages;
						}, 400);
					}

				}

			},
				(err) => {

				})
	}


	initializeApp() {

		this.platform.ready().then(() => {

			this.onData();
			this.authService.checkAuthentication();
			this.takeService.width = this.platform.width();
			this.takeService.height = this.platform.height()

			this.onResumeSubscription = this.platform.resume.subscribe(() => {

				setTimeout(() => {
					this.takeService.destroyDiscussions = false
				}, 1000);
				setTimeout(() => {

					if (this.authService.isLoggedIn()) {

						this.chatService.getChatsOnResume(0);
						if (this.chatService.currenChatRoom) this.getMessages();
						this.authService.getNotificationsOnResume();
						this.webSocketService.connection();

					}

					if (this.threadsService.bookmarks || this.takeService.bookmarks) return;
					else {
						if (this.takeService.takesToggled) {
							this.getTakesForRefresh()

						} else if (this.threadsService.postsToggled) {
							this.getThreadsForRefresh();

						} else {
							this.getPlayForRefresh()
						}
					}


				}, 300);


			});

			this.onPauseSubscription = this.platform.pause.subscribe(() => {
				this.takeService.destroyDiscussions = true
				this.chatService.cheatForTyping = false;
				this.webSocketService.disconnection();
			});

			this.network.onConnect().subscribe((data) => {
				clearTimeout(this.disconnectionTimeout);
			})

			this.network.onDisconnect().subscribe((data) => {
				this.disconnection();
			})

			//Rate app

			this.storage.get('rate').then((value) => {
				if (!value) {

					this.storage.get('rateCount').then((value) => {
						if (!!value) {
							let count = +value + 1;
							if (count >= 6) {
								setTimeout(() => {
									this.presentRateDialog0 = true;
									this.presentRateDialog1 = true;
								}, 2000);
							}
							this.storage.set('rateCount', count);

						} else {
							this.storage.set('rateCount', '1');
						}
					})

				}
			})

			setTimeout(() => {
				this.keyboard.hideFormAccessoryBar(true);
				this.splashScreen.hide();
			}, 1300);


		});
	}

	rateApp() {

		this.cancelRate()
		if (this.platform.is('android')) {

			let href = 'market://details?id=com.discussthegame';
			const browser = this.inAppBrowser.create(href, '_system');


		} else {
			let href = "https://apps.apple.com/app/id1411535287?action=write-review"
			const browser = this.inAppBrowser.create(href, '_system');

		}

	}

	remindRate() {
		this.presentRateDialog0 = false;
		this.presentRateDialog1 = false;
		this.presentRateDialog2 = false;
	}


	moveToSecondDialog() {
		this.presentRateDialog1 = false;
		this.presentRateDialog2 = true;
	}


	cancelRate() {
		this.presentRateDialog0 = false;
		this.presentRateDialog1 = false;
		this.presentRateDialog2 = false;
		this.storage.set('rate', '1');
	}

	getThreadsForRefresh() {

		if (this.threadsService.followers) {

			this.getHomeThreads()

		} else if (this.threadsService.hot) {

			this.getHotThreads()
			this.getFeatured();

		} else if (this.threadsService.new) {

			this.getNewThreads()


		} else if (this.threadsService.top) {

			this.getTopThreads()
			this.getFeatured();
		}

	}

	getTakesForRefresh() {

		if (this.takeService.followers) {
			this.getFollowersTakes()
		} else if (this.takeService.hot) {
			this.getTakes()
		} else if (this.takeService.new) {
			this.getNewestTakes()

		} else if (this.takeService.top) {

			this.getTopTakes()
		}

	}


	closeFullScreen() {
		this.takeService.fullScreen = false;
		this.takeService.fullScreenImage = ""
	}


	dark() {

		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
		this.toggleDarkTheme(prefersDark.matches);
		// Listen for changes to the prefers-color-scheme media query
		prefersDark.addListener((mediaQuery) => this.toggleDarkTheme(mediaQuery.matches));

		// Add or remove the "dark" class based on if the media query matches

	}

	toggleDarkTheme(shouldAdd) {
		this.storage.get('systemMode').then((val) => {
			if (!!val) {
				this.storage.get('initial').then((theme) => {
					if (!!theme) {
						if (theme == 'dark') {
							if (shouldAdd) {
								this.statusBar.styleLightContent();
								if (this.platform.is('android')) {
									this.statusBar.backgroundColorByHexString('#21253C')
								}
								this.global.set('theme', 'dark')
							}
							else {
								this.global.set('theme', 'light')
							}
						} else {
							if (shouldAdd) {
								this.statusBar.styleLightContent();
								if (this.platform.is('android')) {
									this.statusBar.backgroundColorByHexString('#000000')
								}
								this.global.set('theme', 'black')
							}
							else {
								this.global.set('theme', 'light')
							}
						}
					}
				});
			}
		});

	}

	getFeatured() {

		this.threadsService.getFeatured(this.threadsService.filterBy, 0)
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

				let provToCompare = prov.map(thread => thread.title)
				let currentToCompare = this.threadsService.featuredThreads.map(thread => thread.title)
				if (provToCompare.sort().join(',') != currentToCompare.sort().join(',')) {
					this.threadsService.refreshFeaturedThreads = prov;
					this.threadsService.toggleFeaturedRefresh = true;
				}

			})
	}

	getPlayForRefresh() {
		this.playService.getDailyTrivias(this.threadsService.filterBy)
			.subscribe((trivias: any) => {

				let provToCompare = trivias.map(trivia => trivia.question)
				let currentToCompare = this.playService.trivias.map(trivia => trivia.question)
				if (provToCompare.sort().join(',') != currentToCompare.sort().join(',')) {
					this.playService.toggleRefresh = true;
					this.playService.refreshTrivias = trivias;
				}
			})

	}

	getTakes() {


		this.takeService.getTakes(this.threadsService.filterBy, 0)
			.subscribe((takes: any) => {

				let prov = takes.map((take: any) => {
					take.date = new Date(take.date);
					take.created = this.created(take);
					take.likedByUser = this.userHasLiked(take);
					take.count = take.likers ? take.likers.length : 0;
					take.levelN = take.user.badge.picture.replace('.png', 'N.png');

					return take;
				})


				let provToCompare = prov.map(take => take.take)
				let currentToCompare = this.takeService.takes.slice(0, 10).map(take => take.take)

				if (provToCompare.sort().join(',') != currentToCompare.sort().join(',')) {
					this.takeService.toggleRefresh = true;
					this.takeService.refreshTakes = prov;
				}


			})

	}

	getNewestTakes() {


		this.takeService.getNewestTakes(this.threadsService.filterBy, 0)
			.subscribe((takes: any) => {

				let prov = takes.map((take: any) => {
					take.date = new Date(take.date);
					take.created = this.created(take);
					take.likedByUser = this.userHasLiked(take);
					take.count = take.likers ? take.likers.length : 0;
					take.levelN = take.user.badge.picture.replace('.png', 'N.png');

					return take;
				})



				let provToCompare = prov.map(take => take.take)
				let currentToCompare = this.takeService.takes.slice(0, 10).map(take => take.take)

				if (provToCompare.sort().join(',') != currentToCompare.sort().join(',')) {
					this.takeService.toggleRefresh = true;
					this.takeService.refreshTakes = prov;
				}


			})

	}

	getTopTakes() {


		this.takeService.getTakes(this.threadsService.filterBy, 0)
			.subscribe((takes: any) => {

				let prov = takes.map((take: any) => {
					take.date = new Date(take.date);
					take.created = this.created(take);
					take.likedByUser = this.userHasLiked(take);
					take.count = take.likers ? take.likers.length : 0;
					take.levelN = take.user.badge.picture.replace('.png', 'N.png');

					return take;
				})


				let provToCompare = prov.map(take => take.take)
				let currentToCompare = this.takeService.takes.slice(0, 10).map(take => take.take)

				if (provToCompare.sort().join(',') != currentToCompare.sort().join(',')) {
					this.takeService.toggleRefresh = true;
					this.takeService.refreshTakes = prov;
				}


			})

	}

	getFollowersTakes() {

		this.takeService.getFollowingTakes(this.threadsService.filterBy, this.takeService.skipFollowers)
			.subscribe((takes: any) => {
				let prov = takes.map((take: any) => {
					take.date = new Date(take.date);
					take.created = this.created(take);
					take.likedByUser = this.userHasLiked(take);
					take.count = take.likers ? take.likers.length : 0;
					take.levelN = take.user.badge.picture.replace('.png', 'N.png');
					return take;
				})

				let provToCompare = prov.map(take => take.take)
				let currentToCompare = this.takeService.takes.slice(0, 10).map(take => take.take)

				if (provToCompare.sort().join(',') != currentToCompare.sort().join(',')) {
					this.takeService.toggleRefresh = true;
					this.takeService.refreshTakes = prov;
				}


			})

	}



	getHotThreads() {

		this.threadsService.getThreads(this.threadsService.filterBy, 0)
			.subscribe((threads: any) => {

				let prov = threads.map((thread: any) => {
					thread.date = new Date(thread.date);
					thread.created = this.created(thread);
					thread.likedByUser = this.userHasLiked(thread);
					thread.count = thread.likers ? thread.likers.length : 0;
					thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');

					return thread;
				})

				let provToCompare = prov.map(thread => thread.title)
				let currentToCompare = this.threadsService.threads.slice(0, 8).map(thread => thread.title)

				if (provToCompare.sort().join(',') != currentToCompare.sort().join(',')) {
					this.threadsService.toggleRefresh = true;
					this.threadsService.refreshThreads = prov;
				}
			})

	}


	getNewThreads() {

		this.threadsService.getNewestThreads(this.threadsService.filterBy, 0)
			.subscribe((threads: any) => {

				let prov = threads.map((thread: any) => {
					thread.date = new Date(thread.date);
					thread.created = this.created(thread);
					thread.likedByUser = this.userHasLiked(thread);
					thread.count = thread.likers ? thread.likers.length : 0;
					thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');

					return thread;
				})

				let provToCompare = prov.map(thread => thread.title)
				let currentToCompare = this.threadsService.threads.slice(0, 8).map(thread => thread.title)
				if (provToCompare.sort().join(',') != currentToCompare.sort().join(',')) {
					this.threadsService.toggleRefresh = true;
					this.threadsService.refreshThreads = prov;
				}
			})

	}


	getTopThreads() {


		this.threadsService.getTopThreads(this.threadsService.filterBy, 0)
			.subscribe((threads: any) => {

				let prov = threads.map((thread: any) => {
					thread.date = new Date(thread.date);
					thread.created = this.created(thread);
					thread.likedByUser = this.userHasLiked(thread);
					thread.count = thread.likers ? thread.likers.length : 0;
					thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');

					return thread;
				})

				let provToCompare = prov.map(thread => thread.title)
				let currentToCompare = this.threadsService.threads.slice(0, 8).map(thread => thread.title)
				if (provToCompare.sort().join(',') != currentToCompare.sort().join(',')) {
					this.threadsService.toggleRefresh = true;
					this.threadsService.refreshThreads = prov;
				}
			})

	}


	getHomeThreads() {

		this.threadsService.getFollowingThreads(this.threadsService.filterBy, 0)
			.subscribe((threads: any) => {

				let prov = threads.map((thread: any) => {
					thread.date = new Date(thread.date);
					thread.created = this.created(thread);
					thread.likedByUser = this.userHasLiked(thread);
					thread.count = thread.likers ? thread.likers.length : 0;
					thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');

					return thread;
				})

				let provToCompare = prov.map(thread => thread.title)
				let currentToCompare = this.threadsService.threads.slice(0, 8).map(thread => thread.title)
				if (provToCompare.sort().join(',') != currentToCompare.sort().join(',')) {
					this.threadsService.toggleRefresh = true;
					this.threadsService.refreshThreads = prov;
				}
			})

	}



	debounce() {

		let coolDown = false;
		return function () {

			if (coolDown) return;

			this.disconnectionTimeout = setTimeout(() => {
				let toast = this.toastCtrl.create({
					message: "You've lost your internet connection :(",
					duration: 5000,
					position: 'bottom'
				});
				toast.present();
				coolDown = true;
				setTimeout(() => {
					coolDown = false;
				}, 60000);
			}, 5000);

		}

	}

	checkRouterEvent(): void {
		let backTimeout;
		this.router.events.subscribe(event => {

			if (event instanceof NavigationStart) {

			}

			if (event instanceof NavigationEnd) {

				this.authService.disableTabs = false //para que no se pique tan rapido las tabs (causa errores)
				const urlArray = event.url.split('/');
				const page = urlArray[3] || 'home';

				if ((this.urlsToHide.indexOf(page) > -1)) this.hideTabs();

				else {
					this.showTabs()
				}


			}
		})

	}

	public hideTabs() {
		const tabBar = document.getElementById('myTabBar');
		if (tabBar !== null && tabBar.style.display !== 'none') tabBar.style.display = 'none';
	}

	public showTabs() {
		const tabBar = document.getElementById('myTabBar');
		if (tabBar !== null && tabBar.style.display !== 'flex') tabBar.style.display = 'flex';
	}


	initializeEmbedly() {

		embedly("defaults", {
			cards: {
				key: '116e3e2241ba42e49a5d9091d51206dd',
				chrome: 0,
				controls: 0,
				recommend: 0
			}
		});
	}

	onData() {

		this.firebaseNative.onMessageReceived().subscribe(data => {

			setTimeout(() => {
				if (data.tap) {

					if (data.cr) { //Para distinguir tipos de notificaciones(comments/replies)
						let information = {
							fcm: true,
							timelineId: data.timelineId,
							fromNotificationsPage: true,
							answerId: data.answerId ? data.answerId : undefined,
							scrollTo: data.answerId ? data.answerId : null,
							takeId: data.takeId ? data.takeId : undefined,
							threadId: data.threadId ? data.threadId : undefined,
							triviaId: data.triviaId ? data.triviaId : undefined,
							tabId: data.timelineId
						}


						this.authService.paramSignUp = information;
						this.storage.get('token').then((value) => {
							if (!!value) {
								this.authService.token = value;
								if (information.threadId) {
									setTimeout(() => {
										this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/timeline-detail', data.timelineId]);
									}, 800);


								} else if (information.takeId) {
									setTimeout(() => {
										this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/take-timeline-detail', data.timelineId]);
									}, 800);
								} else {
									setTimeout(() => {
										this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/trivia-timeline-detail', data.timelineId]);
									}, 800);
								}
							}

						})

					} else if (data.foll) { //follows


						let information = {
							fcm: true,
							userId: data.userId,
							tabId: data.userId
						}

						this.authService.paramSignUp = information;
						this.storage.get('token').then((value) => {
							if (!!value) {
								this.authService.token = value;
								setTimeout(() => {
									this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/user', data.userId]);
								}, 800);


							}
						})
					} else if (data.post) {

						let information = {
							fcmThread: true, //porque nunca se usa paramSignup para thread-detail, solo en este caso.
							threadId: data.threadId,
							tabId: data.threadId
						}

						this.authService.paramSignUp = information;
						setTimeout(() => {
							this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/thread-detail', data.threadId]);
						}, 800);


					} else if (data.chat) {

						let chatId = data.chatId;
						this.chatService.chatNotification = true;
						if (this.chatService.getChat(chatId)) {
							setTimeout(() => {
								this.router.navigateByUrl("/tabs/tab2");
								/* this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/chats']); */
							}, 800);


						} else {
							let searching = setInterval(() => {
								if (this.chatService.getChat(chatId)) {
									clearInterval(searching)
									setTimeout(() => {
										this.router.navigateByUrl("/tabs/tab2");
									}, 500);
								}
							}, 300);

							setTimeout(() => {
								clearInterval(searching)
							}, 15000);
						}

					} else if (data.take) {

						let information = {
							fcmTake: true, //porque nunca se usa paramSignup para thread-detail, solo en este caso.
							takeId: data.takeId,
							tabId: data.takeId
						}

						this.authService.paramSignUp = information;
						setTimeout(() => {
							this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/take-detail', data.takeId]);
						}, 800);

					} else if (data.room) {

						let roomId = data.roomId;
						setTimeout(() => {
							this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/room-detail', roomId]);
						}, 800);
					}

				}
			}, 200);

		});
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


	largePicture() {

		let large = (this.authService.currentUser.badge.picture).replace(/(\d+)/, '$1L');
		return large;
	}

	userHasLiked(thread: any) {



		if (this.authService.currentUser) {
			return this.likesService.userHasLiked(thread, this.authService.currentUser._id);
		} else {
			return false;
		}
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
