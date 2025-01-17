import { Component, ViewChild, OnInit, Renderer2 } from '@angular/core';
import { IonContent, MenuController, NavController, ActionSheetController, ModalController, LoadingController, ToastController, DomController, Platform } from '@ionic/angular';
import { ThreadsService } from '../../app/core/threads.service';
import { IThread } from '../shared/interfaces';
import { AuthService } from '../core/auth.service';
import { LikesService } from '../core/likers.service';
import { Storage } from '@ionic/storage';
import { AppState } from '../../app/core/state.service';
import { ChooseLeaguesPage } from '../choose-leagues/choose-leagues.page'
import { Router } from '@angular/router';
import { SignupAppPage } from '../signup-app/signup-app.page'
import { ThreadLikesService } from '../core/thread-likers.service';
import { FcmProvider } from '../core/fcm.service';
import { ChatService } from '../core/chat.service';
import { SharePostPage } from '../share-post/share-post.page';
import { NewChatPage } from '../new-chat/new-chat.page';
import { Clipboard } from '@ionic-native/clipboard/ngx';

import * as _ from 'lodash';
import { TakeService } from '../core/take.service';
import { TakesComponent } from './takes.component';
import { PlayService } from '../core/play.service';
import { PlayComponent } from './play.component';

import { SocialSharing } from '@ionic-native/social-sharing/ngx';


@Component({
	selector: 'app-tab1',
	templateUrl: 'tab1.page.html',
	styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {


	@ViewChild(TakesComponent) takesComponent: TakesComponent;
	@ViewChild(PlayComponent) playComponent: PlayComponent;
	tabControl: boolean = false;
	endTransition: boolean = false;
	filterBy: string = "TOP";
	all: string = "TOP"; //SBN ERROR
	iconToDisplay: string = "hot-white"; //CHECK_DTG
	place: boolean = false;
	skip: number = 0;
	skipNewest: number = 0;
	skipTop: number = 0;
	skipFollowers: number = 0;
	underlinedTakes: boolean = false;
	underlinedPosts: boolean = true;
	underlinedPlay: boolean = false;
	slideOpts = {
		initialSlide: 0,
		speed: 400
	};

	threadsDownloaded = false;
	hideAnimation: boolean = false;
	modalInstance: any;
	loaderInstance: any;
	scrollSubscription: any;
	scrollTO: any;
	scrollPosition: number;
	stopScroll: boolean = false;
	scrollEnded: boolean = false;
	scrollStarted: boolean = false;
	showHelp: boolean = false;
	sortBy: string = "HOT POSTS";

	@ViewChild('tabOne', { static: true }) content: IonContent;

	constructor(public navCtrl: NavController,
		public renderer: Renderer2,
		public playService: PlayService,
		private fcm: FcmProvider,
		public loadingCtrl: LoadingController,
		public actionSheetCtrl: ActionSheetController,
		public takeService: TakeService,
		private toastCtrl: ToastController,
		public threadsService: ThreadsService,
		public authService: AuthService,
		private likesService: LikesService,
		private threadLikesService: ThreadLikesService,
		private storage: Storage,
		private modalCtrl: ModalController,
		private router: Router,
		private socialSharing: SocialSharing,
		private platform: Platform,
		public chatService: ChatService,
		private clipboard: Clipboard,
		private menu: MenuController,
		public global: AppState) {

	}


	openFirst() {

		this.menu.isOpen().then(open => {
			if (open) {
				this.menu.close()
			} else {
				this.menu.open('first');
			}
		})

	}

	getPostsSegment() {
		this.takeService.takes = [];
		this.playService.trivias = [];

		this.threadsService.loaderActive = true;
		this.takeService.loaderActive = false;
		this.playService.loaderActive = false;
		this.content.scrollToTop();

		this.underlinedTakes = false;
		this.underlinedPlay = false;
		this.underlinedPosts = true;
		this.takeService.takesToggled = false;
		this.threadsService.postsToggled = false;
		this.playService.playToggled = false;

		setTimeout(() => {
			this.threadsService.postsToggled = true;
			//solo se vuelven a cargar las takes por el ngIf del template, asi que hay que volver a bajar threads
			this.navbarGetThreads(this.threadsService.filterBy)

		}, 50);


	}

	getTakesSegment() {

		this.threadsService.featuredThreads = [];
		this.threadsService.threads = [];
		this.playService.trivias = [];
		this.takeService.loaderActive = true;
		this.threadsService.loaderActive = false;
		this.playService.loaderActive = false;
		//para evitar lag, primero nos enfocamos en lo visual y despues cargamos las takes
		this.content.scrollToTop()

		this.underlinedTakes = true;
		this.underlinedPlay = false;
		this.underlinedPosts = false;
		this.threadsService.postsToggled = false;
		this.takeService.takesToggled = true;
		this.playService.playToggled = false;
		setTimeout(() => {
			this.takeService.takesToggled = true;
			this.takesComponent.navBarGetTakes()
		}, 50);


	}

	getPlaySegment() {

		this.takeService.takes = [];
		this.threadsService.featuredThreads = [];
		this.threadsService.threads = [];
		this.takeService.loaderActive = false;
		this.threadsService.loaderActive = false;
		this.playService.loaderActive = true;
		//para evitar lag, primero nos enfocamos en lo visual y despues cargamos las takes
		this.content.scrollToTop()

		this.underlinedTakes = false;
		this.underlinedPlay = true;
		this.underlinedPosts = false;
		this.threadsService.postsToggled = false;
		this.takeService.takesToggled = false;
		setTimeout(() => {
			this.playService.playToggled = true;
			this.playComponent.navbarGetPlayItems();
		}, 50);


	}

	logScrollStart() {

		this.scrollEnded = false;
	}

	logScrollEnd() {

		this.scrollEnded = true;
	}

	ionViewDidEnter() {


		this.tabControl = true;
		this.authService.observableTabOne.next(false);
		this.scrollSubscription = this.authService.observableTabOne
			.subscribe(scroll => {
				if (scroll) { //fix scroll: cuando se este scrolleando user el metodo de stopScroll, si no hacerlo normal


					if (this.scrollEnded) {

						if (!this.threadsService.loaderActive) {
							this.threadsService.scrolling = true;
							this.content.scrollToTop(300).then(() => {
								this.threadsService.scrolling = false;
							});
						}
						else {
							this.content.scrollToTop(0);
						}

					} else {
						this.stopScroll = true;
						setTimeout(() => {

							this.stopScroll = false;
							if (!this.threadsService.loaderActive) {

								this.threadsService.scrolling = true;
								this.content.scrollToTop(300).then(() => {
									this.threadsService.scrolling = false;
								});
							}
							else {
								this.content.scrollToTop(0);
							}
						}, 250);
					}
				}

			});

		setTimeout(() => {
			this.content.scrollY = true;
			this.hideAnimation = false;
		}, 100);

	}

	ionViewWillEnter() {
		this.showTabs()

	}

	ionViewDidLeave() {

		this.content.scrollY = false;
		this.tabControl = false;
		this.scrollSubscription.unsubscribe();
	}



	public showTabs() {
		const tabBar = document.getElementById('myTabBar');
		if (tabBar !== null && tabBar.style.display !== 'flex') tabBar.style.display = 'flex';
	}


	ngOnInit() {

		this.storage.get('leagues').then((val) => {
			if (!val) {
				let data = {
					leagues: [],
					showLikeHelp: true
				}

				this.modalCtrl.create({
					component: ChooseLeaguesPage,
					componentProps: {
						data: data
					}
				}).then(modal => {



					this.modalInstance = modal;
					this.modalInstance.present();
					modal.onDidDismiss().then(() => {

						this.threadsService.populateMenu()
						this.getThreads(false, 'TOP');
						if (this.authService.isLoggedIn()) {
							this.navCtrl.navigateForward(this.router.url.substr(0, 10) + '/teams');
							this.chatService.getChats(0);

						} else {
							this.chatService.connecting = false;
						}
						this.getFeatured('TOP');
						this.threadsService.hot = true;
						this.threadsService.new = false;
						this.threadsService.top = false;
						this.iconToDisplay = "hot-white";
						this.showHelp = true;


					})
				})

			} else {
				/* let prev = JSON.parse(val);
				prev.unshift('TOP');
				this.threadsService.leagues = prev; */
				this.threadsService.populateMenu()
				this.getFeatured('TOP');
				this.getThreads(false, 'TOP');
				if (this.authService.isLoggedIn()) {
					this.chatService.getChats(0);

				} else {
					this.chatService.connecting = false;
				}

				this.threadsService.hot = true;
				this.threadsService.new = false;
				this.threadsService.top = false;
				this.iconToDisplay = "hot-white";
				if (this.authService.isLoggedIn()) this.saveLeagues();
				this.storage.get('motorsports').then((val) => { //Para que a todos los que ya la bajaron se les de la oprtunidad de escoger si quieren o no.
					if (!val) {
						this.storage.set('motorsports', '1');
						this.configLeagues();
					}
				});

			}
		});
	}


	gotIt() {
		this.showHelp = false;
	}


	chats() {
		this.navCtrl.navigateForward(this.router.url.substr(0, 10) + '/search');
	}



	saveLeagues() {
		if (this.threadsService.leagues.length > 1 && this.authService.currentUser.leagues.length == 0) {
			let data = {
				leagues: this.threadsService.leagues.filter(league => league != 'TOP')
			}
			this.authService.saveLeagues(data)
				.subscribe((leagues) => { },
					(err) => { })
		}
	}

	configLeagues() {

		let data = {
			leagues: this.threadsService.leagues.filter(league => league != 'TOP'),
			showLikeHelp: false
		}

		this.modalCtrl.create({
			component: ChooseLeaguesPage,
			componentProps: {
				data: data
			}
		}).then(modal => {
			this.modalInstance = modal;
			this.modalInstance.present();
			this.modalInstance.onDidDismiss()
				.then(() => {
					this.getFeatured('TOP')
					this.getThreads(false, 'TOP');
					if (this.authService.isLoggedIn()) {
						this.chatService.getChats(0);

					}
					this.threadsService.hot = true;
					this.threadsService.new = false;
					this.threadsService.top = false;
					this.iconToDisplay = "hot-white";
				})
		})



	}


	presentActionSheet() {

		this.menu.isOpen().then(open => {
			if (open) {
				this.menu.close()
			} else {

				let hotIcon;
				let newIcon;
				let topIcon;

				if (this.global.state['theme'] == 'light') {
					hotIcon = this.threadsService.hot ? 'checkmark' : 'hot-primary';
					newIcon = this.threadsService.new ? 'checkmark' : 'new-primary';
					topIcon = this.threadsService.top ? 'checkmark' : 'top-primary'
				} else {
					hotIcon = this.threadsService.hot ? 'checkmark' : 'hot-white'
					newIcon = this.threadsService.new ? 'checkmark' : 'new-white';
					topIcon = this.threadsService.top ? 'checkmark' : 'top-white'
				}

				this.actionSheetCtrl.create({
					header: 'SORT POSTS BY',
					cssClass: 'my-custom-action',
					buttons: [
						{
							text: 'Hot',
							icon: hotIcon,
							handler: () => {
								this.sortBy = "HOT POSTS";
								this.threadsService.hot = true;
								this.threadsService.new = false;
								this.threadsService.top = false;
								this.iconToDisplay = "hot-white";



								this.getFeatured(this.threadsService.filterBy)
								this.getThreads(true, this.threadsService.filterBy)


							}
						}, {
							text: 'New',
							icon: newIcon,
							handler: () => {
								this.sortBy = "NEW POSTS";
								this.threadsService.hot = false;
								this.threadsService.top = false;
								this.threadsService.new = true;
								this.iconToDisplay = "new-white";
								this.getNewestThreads(true, this.threadsService.filterBy)
							}
						},
						{
							text: 'Top past 24 hrs',
							icon: topIcon,
							handler: () => {
								this.sortBy = "TOP POSTS";
								this.threadsService.hot = false;
								this.threadsService.top = true;
								this.threadsService.new = false;
								this.iconToDisplay = "top-white";
								this.getFeatured(this.threadsService.filterBy)
								this.getTopThreads(true, this.threadsService.filterBy)
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
		})
	}

	handleRefreshButton() {
		if (this.takeService.takesToggled) {
			this.refreshTakes()
		} else if (this.threadsService.postsToggled) {
			this.refreshPosts()
		} else {
			this.refreshPlay()
		}
	}

	refreshPlay() {

		this.takeService.toggleRefresh = false;
		this.threadsService.toggleRefresh = false;
		this.playService.toggleRefresh = false;

		if (this.playService.refreshTrivias.length) {

			this.playService.loaderActive = true;
			this.content.scrollToTop();

			this.playService.trivias = _.cloneDeep(this.playService.refreshTrivias);
			this.playService.refreshTrivias = null;

			setTimeout(() => {
				this.playService.loaderActive = false;
			}, 500);
		}


	}


	refreshTakes() {

		this.takeService.toggleRefresh = false;
		this.threadsService.toggleRefresh = false;
		this.playService.toggleRefresh = false;

		if (this.takeService.refreshTakes.length) {

			this.takeService.skip = 0;
			this.takeService.skipFollowers = 0;
			this.takeService.skipNewest = 0;
			this.takeService.skipTop = 0;


			this.takeService.loaderActive = true;
			this.content.scrollToTop();

			this.takeService.takes = _.cloneDeep(this.takeService.refreshTakes);
			this.takeService.refreshTakes = null;

			setTimeout(() => {
				this.takeService.loaderActive = false;
			}, 500);
		}


	}



	refreshPosts() {

		this.takeService.toggleRefresh = false;
		this.threadsService.toggleRefresh = false;
		this.playService.toggleRefresh = false;


		if (this.threadsService.refreshThreads.length) {
			this.threadsService.skip = 0;
			this.threadsService.skipFollowers = 0;
			this.threadsService.skipNewest = 0;
			this.threadsService.skipTop = 0;


			this.threadsService.loaderActive = true;
			this.content.scrollToTop();

			if ((this.threadsService.hot || this.threadsService.top) && !this.threadsService.followers && this.threadsService.toggleFeaturedRefresh) {
				this.threadsService.loadingFeatured = true;
				this.threadsService.toggleFeaturedRefresh = false;
				this.threadsService.featuredThreads = _.cloneDeep(this.threadsService.refreshFeaturedThreads);
				this.threadsService.refreshFeaturedThreads = null;
			}
			this.threadsService.threads = _.cloneDeep(this.threadsService.refreshThreads);
			this.threadsService.refreshThreads = null;

			setTimeout(() => {
				this.threadsService.loaderActive = false;
				this.threadsService.loadingFeatured = false;

			}, 500);
		}


	}

	navbarGetThreads(league: string, event?: any) {

		if (this.threadsService.postsToggled) {

			this.threadsService.toggleRefresh = false;
			this.takeService.toggleRefresh = false;
			this.playService.toggleRefresh = false;
			this.threadsService.toggleFeaturedRefresh = false;

			if (event) this.fcm.impact('light');

			let wait = !!event ? 500 : 0;
			setTimeout(() => { //para que el efecto de refresh este con el tiempo adecuado
				if (this.threadsService.followers) {
					this.handlerFollowers(league, event);
				}
				else if (this.threadsService.bookmarks) {
					this.getSavedThreads(true, event)
				}
				else if (this.threadsService.hot) {
					this.getFeatured(league, event);
					this.getThreads(true, league, event)
				} else if (this.threadsService.new) {
					this.getNewestThreads(true, league, event)

				} else {
					this.getFeatured(league, event);
					this.getTopThreads(true, league, event);
				}
			}, wait);


		} else if (this.takeService.takesToggled) {

			this.takeService.toggleRefresh = false;
			this.threadsService.toggleRefresh = false;
			this.playService.toggleRefresh = false;
			this.threadsService.toggleFeaturedRefresh = false;

			if (event) this.fcm.impact('light');
			let wait = !!event ? 500 : 0;

			setTimeout(() => {
				if (this.takeService.followers) {
					this.handlerFollowers(league, event);
				}
				else if (this.takeService.bookmarks) {

					this.takesComponent.getSavedTakes(event);

				}
				else if (this.takeService.hot) {

					this.takesComponent.getTakes(this.threadsService.filterBy, event);

				} else if (this.takeService.new) {

					this.takesComponent.getNewestTakes(this.threadsService.filterBy, event);

				} else {

					this.takesComponent.getTopTakes(this.threadsService.filterBy, event);
				}
			}, wait);

		} else {
			this.takeService.toggleRefresh = false;
			this.threadsService.toggleRefresh = false;
			this.playService.toggleRefresh = false;
			this.threadsService.toggleFeaturedRefresh = false;

			if (event) this.fcm.impact('light');
			let wait = !!event ? 500 : 0;

			setTimeout(() => {

				if (this.playService.triviaToggled) this.playComponent.getTriviaItems(this.threadsService.filterBy, event)
				else {
					this.playComponent.getPickItems(this.threadsService.filterBy, event)
				}

			}, wait);

		}



	}


	handlerFollowers(league: string, event?: any) {

		this.threadsService.hideInfinite = true;
		this.threadsService.toggleRefresh = false;
		this.takeService.toggleRefresh = false;
		this.playService.toggleRefresh = false;

		if (this.authService.isLoggedIn()) {


			if (!this.takeService.takesToggled) {

				this.threadsService.followers = true;
				if (this.authService.currentUser.followingNumber == 0) {
					this.threadsService.threads = [];
					this.threadsService.nofollowing = true;
					this.threadsService.loaderActive = false;

				} else {

					if (!!event) this.threadsService.loaderActive = true;
					this.getFollowersThreads(true, league, event);

				}

			}
			else {

				this.takeService.followers = true;
				if (this.authService.currentUser.followingNumber == 0) {
					this.takeService.takes = [];
					this.takeService.nofollowing = true;
					this.takeService.loaderActive = false;

				} else {

					this.takeService.loaderActive = true;
					this.takesComponent.getFollowersTakes(this.threadsService.filterBy, event);

				}

			}


		} else {

			//Mandar a signup
			let data = {
				message: 'Sign up so you can start following people!',
			}
			this.modalCtrl.create({
				component: SignupAppPage,
				componentProps: {
					data: data
				}
			}).then((modal) => {
				this.modalInstance = modal;
				this.modalInstance.present();
				this.modalInstance.onDidDismiss()
					.then((data: any) => {
						if (data.goToSignGlobal) {

							let typeParams = {
								type: data.type,
								fromInitialPage: false
							}

							this.authService.paramSignUp = typeParams;
							this.navCtrl.navigateForward('/signup-global')
						}
					})
			})

		}


	}


	//Followers

	getFollowersThreads(scroll: boolean, league: string, event?: any) {


		this.threadsService.filterBy = league;
		this.threadsService.skipFollowers = 0;


		if (!event) {
			this.threadsService.placeholders = true;
			this.threadsService.loaderActive = true;
		}


		this.threadsService.getFollowingThreads(league, this.threadsService.skipFollowers)
			.subscribe((threads: any) => {


				let prov = threads.map((thread: any) => {
					thread.date = new Date(thread.date);
					thread.created = this.created(thread);
					thread.likedByUser = this.userHasLiked(thread);
					thread.count = thread.likers ? thread.likers.length : 0;
					thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');
					return thread;
				})

				this.threadsService.threads = prov
				this.threadsService.loaderActive = false;
				setTimeout(() => {
					this.threadsService.placeholders = false;
				}, 1000);
				this.threadsService.loaderActive = false;



				this.threadsService.hideInfinite = false;
				if (event) event.target.complete();


			},
				(err) => {


					if (event) event.target.complete();

					this.threadsService.loaderActive = false;
					this.threadsService.placeholders = false;

					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'top'
					}).then(toaster => toaster.present())

				})

	}

	getSavedThreads(scroll: boolean, event?: any) {

		console.log('saved')

		this.threadsService.skipSaved = 0;
		this.threadsDownloaded = false;

		if (!event) {
			this.threadsService.loaderActive = true;
			this.threadsService.placeholders = true;
			this.threadsService.threads = []
		}
		this.threadsService.getBookmarks(this.threadsService.skipSaved)
			.subscribe((threads: any) => {

				let prov = threads.map((thread: any) => {
					thread.date = new Date(thread.date);
					thread.created = this.created(thread);
					thread.likedByUser = this.userHasLiked(thread);
					thread.count = thread.likers ? thread.likers.length : 0;
					thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');

					return thread;
				})


				this.threadsService.threads = prov

				setTimeout(() => {
					this.threadsService.placeholders = false;
				}, 1000);

				this.threadsDownloaded = true;
				this.threadsService.hideInfinite = false;
				this.threadsService.loaderActive = false;
				this.threadsService.toggleRefresh = false;
				this.takeService.toggleRefresh = false;
				this.playService.toggleRefresh = false;
				this.threadsService.toggleFeaturedRefresh = false;
				if (event) event.target.complete();


			},
				(err) => {


					if (event) event.target.complete();

					this.threadsDownloaded = true;
					this.threadsService.loaderActive = false;
					this.threadsService.placeholders = false;

					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'top'
					}).then(toast => toast.present())

				})

	}


	getFeatured(league: string, event?: any) {

		if (!event) this.threadsService.loadingFeatured = true;
		this.threadsService.getFeatured(league, 0)
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

				console.log('downloaded')
				this.threadsService.featuredThreads = prov;
				let loaderInterval = setInterval(() => { //para sincronizar con hot y top threads

					if (this.threadsService.threads.length || this.threadsDownloaded) {
						this.threadsService.loaderActive = false;
						this.threadsService.loadingFeatured = false;
						clearInterval(loaderInterval)
					}

				}, 200);


			},
				(err) => {
					this.threadsService.loadingFeatured = false;
					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'top'
					}).then(toast => toast.present())

				})
	}

	//Followers
	getThreads(scroll: boolean, league: string, event?: any) {


		this.threadsService.filterBy = league;
		this.threadsService.skip = 0;
		this.threadsDownloaded = false;

		if (!event) {
			this.threadsService.loaderActive = true;
			this.threadsService.placeholders = true;
			this.threadsService.threads = []
		}
		this.threadsService.getThreads(league, this.threadsService.skip)
			.subscribe((threads: any) => {





				let prov = threads.map((thread: any) => {
					thread.date = new Date(thread.date);
					thread.created = this.created(thread);
					thread.likedByUser = this.userHasLiked(thread);
					thread.count = thread.likers ? thread.likers.length : 0;
					thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');

					return thread;
				})


				this.threadsService.threads = prov

				setTimeout(() => {
					this.threadsService.placeholders = false;
				}, 1000);

				this.threadsDownloaded = true;
				this.threadsService.hideInfinite = false;
				this.threadsService.toggleRefresh = false;
				this.takeService.toggleRefresh = false;
				this.playService.toggleRefresh = false;
				if (this.threadsService.threads.length == 0) this.threadsService.loaderActive = false;
				this.threadsService.toggleFeaturedRefresh = false;
				if (event) event.target.complete();


			},
				(err) => {


					if (event) event.target.complete();

					this.threadsDownloaded = true;
					this.threadsService.loaderActive = false;
					this.threadsService.placeholders = false;

					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'top'
					}).then(toast => toast.present())

				})

	}

	getNewestThreads(scroll: boolean = true, league: string, event?: any) {


		this.threadsDownloaded = false;
		this.threadsService.skipNewest = 0;
		this.threadsService.filterBy = league;

		if (!event) {
			this.threadsService.placeholders = true;
			this.threadsService.loaderActive = true;
		}


		this.threadsService.getNewestThreads(league, this.threadsService.skipNewest)
			.subscribe((threads: any) => {


				let prov = threads.map((thread: any) => {
					thread.date = new Date(thread.date);
					thread.created = this.created(thread);
					thread.likedByUser = this.userHasLiked(thread);
					thread.count = thread.likers ? thread.likers.length : 0;
					thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');

					return thread;
				})

				this.threadsService.threads = prov
				this.threadsService.loaderActive = false;
				setTimeout(() => {
					this.threadsService.placeholders = false;
				}, 1000);

				this.threadsDownloaded = true;
				this.threadsService.hideInfinite = false;
				this.threadsService.toggleRefresh = false;
				this.takeService.toggleRefresh = false;
				this.playService.toggleRefresh = false;
				this.threadsService.toggleFeaturedRefresh = false;
				if (event) event.target.complete()



			},
				(err) => {


					this.threadsDownloaded = true;
					this.threadsService.loaderActive = false;
					if (event) event.target.complete();
					this.threadsService.placeholders = false;

					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'top'
					}).then(toast => toast.present())

				})

	}

	getTopThreads(scroll: boolean = true, league: string, event?: any) {



		this.threadsService.skipTop = 0;
		this.threadsService.filterBy = league;
		this.threadsDownloaded = false;


		if (!event) {
			this.threadsService.placeholders = true;
			this.threadsService.loaderActive = true;
			this.threadsService.threads = []
		}
		this.threadsService.getTopThreads(league, this.threadsService.skipTop)
			.subscribe((threads: any) => {



				let prov = threads.map((thread: any) => {
					thread.date = new Date(thread.date);
					thread.created = this.created(thread);
					thread.likedByUser = this.userHasLiked(thread);
					thread.count = thread.likers ? thread.likers.length : 0;
					thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');


					return thread;
				})

				this.threadsService.threads = prov
				setTimeout(() => {
					this.threadsService.placeholders = false;
				}, 1000);


				this.threadsService.hideInfinite = false;
				this.threadsService.toggleRefresh = false;
				this.takeService.toggleRefresh = false;
				if (this.threadsService.threads.length == 0) this.threadsService.loaderActive = false;
				this.threadsService.toggleFeaturedRefresh = false;
				this.threadsDownloaded = true;
				if (event) event.target.complete();


			},
				(err) => {

					this.threadsService.loaderActive = false;
					this.threadsService.placeholders = false;

					if (event) event.target.complete();

					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'top'
					}).then(toaster => {
						toaster.present()
					})

				})

	}




	getMoreFollowersThreads(event: any) {

		this.threadsService.getFollowingThreads(this.threadsService.filterBy, this.threadsService.skipFollowers)
			.subscribe((threads: any) => {

				if (threads.length > 0) {

					let prov = threads.map((thread: any) => {
						thread.date = new Date(thread.date);
						thread.created = this.created(thread);
						thread.likedByUser = this.userHasLiked(thread);
						thread.count = thread.likers ? thread.likers.length : 0;
						thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');
						return thread;
					})

					let newThreadsArray = this.threadsService.threads.concat(prov)
					//Eliminar duplicados. Esto sucede porque continuamente se agregan discusiones a la base de datos; el skip genera esto.
					let unique = newThreadsArray.filter((item, i, array) => {
						return array.findIndex((item2) => { return item2._id == item._id }) === i;
					})
					this.threadsService.threads = unique;
					this.threadsService.toggleRefresh = false;
					this.takeService.toggleRefresh = false;
					this.threadsService.toggleFeaturedRefresh = false;



				}

				event.target.complete()



			},
				(err) => {


					event.target.complete()
					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'top'
					}).then(toast => {
						toast.present();
					})

				})

	}

	getMoreSavedThreads(event: any) {

		this.threadsService.getBookmarks(this.threadsService.skipSaved)
			.subscribe((threads: any) => {

				if (threads.length > 0) {
					let provisionalArray = threads.map((thread: any) => {
						thread.date = new Date(thread.date);
						thread.created = this.created(thread);
						thread.likedByUser = this.userHasLiked(thread);
						thread.count = thread.likers ? thread.likers.length : 0;
						thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');


						return thread;
					})

					let newThreadsArray = this.threadsService.threads.concat(provisionalArray)
					//Eliminar duplicados. Esto sucede porque continuamente se agregan discusiones a la base de datos; el skip genera esto.
					let unique = newThreadsArray.filter((item, i, array) => {
						return array.findIndex((item2) => { return item2._id == item._id }) === i;
					})
					this.threadsService.threads = unique;
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


	getMoreThreads(event: any) {

		this.threadsService.getThreads(this.threadsService.filterBy, this.threadsService.skip)
			.subscribe((threads: any) => {

				if (threads.length > 0) {
					let provisionalArray = threads.map((thread: any) => {
						thread.date = new Date(thread.date);
						thread.created = this.created(thread);
						thread.likedByUser = this.userHasLiked(thread);
						thread.count = thread.likers ? thread.likers.length : 0;
						thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');


						return thread;
					})

					let newThreadsArray = this.threadsService.threads.concat(provisionalArray)
					//Eliminar duplicados. Esto sucede porque continuamente se agregan discusiones a la base de datos; el skip genera esto.
					let unique = newThreadsArray.filter((item, i, array) => {
						return array.findIndex((item2) => { return item2._id == item._id }) === i;
					})
					this.threadsService.threads = unique;




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

	getMoreNewestThreads(event: any) {

		this.threadsService.getNewestThreads(this.threadsService.filterBy, this.threadsService.skipNewest)
			.subscribe((threads: any) => {


				if (threads.length > 0) {
					let provisionalArray = threads.map((thread: any) => {
						thread.date = new Date(thread.date);
						thread.created = this.created(thread);
						thread.likedByUser = this.userHasLiked(thread);
						thread.count = thread.likers ? thread.likers.length : 0;
						thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');


						return thread;
					})

					let newThreadsArray = this.threadsService.threads.concat(provisionalArray)
					//Eliminar duplicados. Esto sucede porque continuamente se agregan discusiones a la base de datos; el skip genera esto.
					let unique = newThreadsArray.filter((item, i, array) => {
						return array.findIndex((item2) => { return item2._id == item._id }) === i;
					})
					this.threadsService.threads = unique;

				}

				event.target.complete()



			},
				(err) => {

					event.target.complete()
					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'top'
					}).then(toast => toast.present());

				})

	}


	getMoreTopThreads(event: any) {

		this.threadsService.getTopThreads(this.threadsService.filterBy, this.threadsService.skipTop)
			.subscribe((threads: any) => {



				if (threads.length > 0) {
					let provisionalArray = threads.map((thread: any) => {
						thread.date = new Date(thread.date);
						thread.created = this.created(thread);
						thread.likedByUser = this.userHasLiked(thread);
						thread.count = thread.likers ? thread.likers.length : 0;
						thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');


						return thread;
					})

					let newThreadsArray = this.threadsService.threads.concat(provisionalArray)
					//Eliminar duplicados. Esto sucede porque continuamente se agregan discusiones a la base de datos; el skip genera esto.
					let unique = newThreadsArray.filter((item, i, array) => {
						return array.findIndex((item2) => { return item2._id == item._id }) === i;
					})
					this.threadsService.threads = unique;


				}

				event.target.complete()



			},
				(err) => {

					event.target.complete()
					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'top'
					}).then(toast => {
						toast.present();
					})

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

	userHasSaved(thread: IThread) {

		if (this.authService.currentUser && thread.bookmarks) {
			return thread.bookmarks.some((user: any) => user === this.authService.currentUser._id);
		} else {
			return false;
		}
	}


	doInfinite(event) {

		if (this.takeService.takesToggled) {

			if (this.takeService.followers) {
				this.takeService.skipFollowers += 10;
				if (this.takeService.takes.length > 0) {
					this.takesComponent.getMoreFollowersTakes(event);

				}
			}
			else if (this.takeService.bookmarks) {
				this.takeService.skipSaved += 10;
				if (this.takeService.takes.length > 0) this.takesComponent.getMoreSavedTakes(event);

			}
			else if (this.takeService.hot) {
				this.takeService.skip += 10;
				if (this.takeService.takes.length > 0) this.takesComponent.getMoreTakes(event);

			} else if (this.takeService.new) {
				this.takeService.skipNewest += 10;
				if (this.takeService.takes.length > 0) this.takesComponent.getMoreNewestTakes(event);

			} else {
				this.takeService.skipTop += 10;
				if (this.takeService.takes.length > 0) this.takesComponent.getMoreTopTakes(event);
			}



		} else if (this.threadsService.postsToggled) {




			if (this.threadsService.followers) {
				this.threadsService.skipFollowers += 8;
				if (this.threadsService.threads.length > 0) this.getMoreFollowersThreads(event);

			}
			else if (this.threadsService.bookmarks) {
				this.threadsService.skipSaved += 8;
				if (this.threadsService.threads.length > 0) this.getMoreSavedThreads(event);

			}
			else if (this.threadsService.hot) {
				this.threadsService.skip += 8;
				if (this.threadsService.threads.length > 0) this.getMoreThreads(event);

			} else if (this.threadsService.new) {
				this.threadsService.skipNewest += 8;
				if (this.threadsService.threads.length > 0) this.getMoreNewestThreads(event);

			} else {
				this.threadsService.skipTop += 8;
				if (this.threadsService.threads.length > 0) this.getMoreTopThreads(event);
			}

		} else {
			event.target.complete()
		}




	}

	/* ITEM */

	like(thread: IThread) {

		this.menu.isOpen().then(open => {
			if (open) {
				this.menu.close()
			} else {
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
		})


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

	savePost(thread: IThread, saved: boolean) {

		if (this.authService.isLoggedIn()) {
			if (saved) {
				const index = thread.bookmarks.indexOf(this.authService.currentUser._id)
				if (index > -1) {
					thread.bookmarks.splice(index, 1)
				}
				this.threadsService.deleteBookmark(thread._id)

				if (this.threadsService.bookmarks) this.threadsService.threads = this.threadsService.threads.filter(t => t._id != thread._id);
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

	presentActionSheetShare(e: any, thread: IThread) {

		e.stopPropagation()

		let saved = this.userHasSaved(thread)


		this.menu.isOpen().then(open => {
			if (open) {
				this.menu.close()
			} else {

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


	itemTapped($event, thread) {

		this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/thread-detail', thread._id]);
	}

	allFeatured() {
		this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/all-featured', this.threadsService.filterBy]);
	}

}
