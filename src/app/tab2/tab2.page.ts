import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ITeam, IThread } from '../shared/interfaces';
import { AuthService } from '../core/auth.service';
import { NavController, ToastController, IonSearchbar, IonSegment, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ThreadsService } from '../core/threads.service';
import { LikesService } from '../core/likers.service';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { ChatService } from '../core/chat.service';
import { SignupAppPage } from '../signup-app/signup-app.page';
import { AppState } from '../core/state.service';

@Component({
	selector: 'app-tab2',
	templateUrl: './tab2.page.html',
	styleUrls: ['./tab2.page.scss']
})
export class Tab2Page implements OnInit {

	searchToggled: boolean = false;
	searching: boolean = false;
	posts: boolean = true;
	skipThreads: number = 0;
	skipUsers: number = 0;
	threads: IThread[] = [];
	notFound: boolean = false;
	hideInfinite: boolean = true;
	hideInfiniteUsers: boolean = true;
	searchTerm: string = "";
	trimSearchTerm: string = "";
	users: any[] = [];
	loadingChats: boolean = true;
	chats: any[] = [];
	sortBy: string = "sports";

	@ViewChild(IonSearchbar) searchbar: IonSearchbar;
	@ViewChild(IonSegment) segment: IonSegment;

	constructor(private threadsService: ThreadsService,
		private modalCtrl: ModalController,
		public authService: AuthService,
		private likesService: LikesService,
		public global: AppState,
		private el: ElementRef,
		public toastCtrl: ToastController,
		private navCtrl: NavController,
		private keyboard: Keyboard,
		public chatService: ChatService,
		private router: Router) {

	}

	goBack() {

		this.authService.addurl = false;
		this.navCtrl.pop();
		
	}


	ngOnInit() {

		
		
	}

	searchCancel() {
		this.searchToggled = false;
		this.posts = true;
		this.notFound = false;
		this.threads = [];
		this.users = [];
		this.searching = false;
		this.searchbar.value = "";

	}

	addFavorites() {

		if (this.authService.isLoggedIn()) {
			this.navCtrl.navigateForward(this.router.url.substr(0, 10) + '/teams');

		} else {
			let data = {
				message: 'Sign up to add your favorites!',
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


	seeAllChats() {
		this.navCtrl.navigateForward(this.router.url.substr(0, 10) + '/public-chats');
	}



	searchFocus() {
		this.searchToggled = true;

	}


	onSearchInput(event) {

		this.searchTerm = event.detail.value;
		if (this.searchTerm.trim().length == 0) {
			this.searching = false;
			this.notFound = false;
			return;
		}
		this.searching = true;
		this.notFound = false;


		if (this.posts) {
			this.searchPosts(this.searchTerm);

		} else {

			let searchTerm = event.detail.value;
			this.trimSearchTerm = searchTerm.replace(/ /g, '');
			if (this.trimSearchTerm.length == 0) {
				this.searching = false;
				this.users = [];
				return
			}
			this.searchUsers();

		}


	}



	logScrollStart() {
		if (this.keyboard.isVisible) this.searchbar.getInputElement().then((input) => {
			input.blur();
		})
	}

	segmentChanged(e: any, value: string) {

		e.preventDefault();
	
		this.segment.value = value;

		if (value == 'posts') {
			this.posts = true;
			this.hideInfinite = true;
			if (this.searchTerm.trim().length == 0) {
				this.searching = false;
				this.notFound = false;
				return;
			}
			this.searching = true;
			this.notFound = false;
			this.searchPosts(this.searchTerm);


		} else {
			this.posts = false;
			this.hideInfiniteUsers = true;
			this.trimSearchTerm = this.searchbar.value.replace(/ /g, '');
			if (this.trimSearchTerm.length == 0) {
				this.searching = false;
				this.users = [];
				return
			}
			this.searching = true;
			this.notFound = false;

			this.searchUsers();

		}
	}

	showVisible(e) {

		for (let img of this.el.nativeElement.querySelectorAll('.profile-pic')) {
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

	searchUsers() {

		this.skipUsers = 0;
		this.authService.searchUsers(this.trimSearchTerm, this.skipUsers)
			.subscribe((users: any) => {

				if (this.authService.isLoggedIn()) {
					let usersF = users.filter(user => user._id != this.authService.currentUser._id);
					this.users = usersF;
				} else {

					this.users = users;
				}
				this.searching = false;

				if (users.length < 20) this.hideInfiniteUsers = true;
				else {
					this.hideInfiniteUsers = false;
				}
				setTimeout(() => {
					this.showVisible(null);
				}, 0);

			},
				(err) => {

					this.searching = false;
					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'top'
					}).then(toast => toast.present())

				})

	}

	searchMoreUsers(infiniteScroll) {

		this.authService.searchUsers(this.trimSearchTerm, this.skipUsers)
			.subscribe((users: any) => {

				if (this.authService.isLoggedIn()) {
					let usersF = users.filter(user => user._id != this.authService.currentUser._id);
					this.users = this.users.concat(usersF);
				} else {
					this.users = this.users.concat(users);
				}

				infiniteScroll.target.complete();
				if (users.length < 20) this.hideInfiniteUsers = true;
				else {
					this.hideInfiniteUsers = false
				}

			},
				(err) => {

					infiniteScroll.target.complete();
					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'top'
					}).then(toast => toast.present())

				})

	}


	searchPosts(value: string) {

		this.skipThreads = 0;
		this.threadsService.searchThreads(value, this.skipThreads)
			.subscribe((threads: any) => {
				if (threads.length == 0) this.notFound = true;
				let prov = threads.map((thread: any) => {
					thread.date = new Date(thread.date);
					thread.created = this.created(thread);
					thread.likedByUser = this.userHasLiked(thread);
					thread.count = thread.likers ? thread.likers.length : 0;
					thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');

					return thread;
				})

				this.searching = false;
				if (threads.length < 10) this.hideInfinite = true
				else {
					this.hideInfinite = false
				}
				this.threads = prov;


			},
				(err) => {
					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'top'
					}).then(toast => {
						toast.present();
					})
				})

	}

	searchMorePosts(infiniteScroll) {

		this.threadsService.searchThreads(this.searchTerm, this.skipThreads)
			.subscribe((threads: any) => {
				let prov = threads.map((thread: any) => {
					thread.date = new Date(thread.date);
					thread.created = this.created(thread);
					thread.likedByUser = this.userHasLiked(thread);
					thread.count = thread.likers ? thread.likers.length : 0;
					thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');

					return thread;
				})
				if (threads.length < 10) this.hideInfinite = true
				else {
					this.hideInfinite = false
				}
				this.threads = this.threads.concat(prov);
				infiniteScroll.target.complete();


			},
				(err) => {
					infiniteScroll.target.complete();
					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'top'
					}).then(toast => {
						toast.present();
					})
				})



	}


	goToChat(chat: any) {
		this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/public-chat-info', chat._id]);
	}

	goToFav(team: any) {

		if (team == 'All') {
			this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/fav-detail', 'all']);
		} else {
			this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/fav-detail', team._id]);
		}

	}

	itemTapped($event, thread) {

		if (!this.threadsService.getThread(thread._id)) this.threadsService.threadUserPage = thread;
		this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/thread-detail', thread._id]);

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

	doInfinite(event) {

		
		if (this.threads.length > 0) {
			this.skipThreads += 10;
			this.searchMorePosts(event);
		}

	}


	doInfiniteUsers(infiniteScroll) {

		this.skipUsers += 20;
		this.searchMoreUsers(infiniteScroll);

	}

}
