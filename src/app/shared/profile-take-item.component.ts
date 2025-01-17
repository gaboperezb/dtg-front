import { Component, OnInit, ViewChild, Input, ElementRef, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { ITake } from './interfaces';
import { TakeService } from '../core/take.service';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { InViewportMetadata } from 'ng-in-viewport';
import { ThreadsService } from '../core/threads.service';
import { NavController, ModalController, ActionSheetController, ToastController, AlertController, LoadingController, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { FcmProvider } from '../core/fcm.service';
import { LikesService } from '../core/likers.service';
import { SignupAppPage } from '../signup-app/signup-app.page';
import { TakeLikesService } from '../core/take-likers.service';
import { AppState } from '../core/state.service';
import { SharePostPage } from '../share-post/share-post.page';
import { NewChatPage } from '../new-chat/new-chat.page';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { ChatService } from '../core/chat.service';


declare var loadImage;



@Component({
	selector: 'profile-take-item',
	templateUrl: './profile-take-item.component.html',
	styleUrls: ['./profile-take-item.component.scss'],
})
export class ProfileTakeItemComponent {

	@ViewChild('videoTake') videoTake: ElementRef;
	@Input() take: ITake;
	@Input() takes: ITake[] = [];
	@Output() filterTake = new EventEmitter();
	@Input() showUser: boolean;
	linkStyle: any;
	iframeStyle: any;
	timeInterval: any;
	displayTimeTimeout: any;
	time: string;
	showTimer: boolean = false;
	videoPaused: boolean = true;
	dontPlay: boolean = false;
	largeLink: boolean = false;
	smallLink: boolean = false;
	reducedTitle: string = "";
	videoStyle: any;

	hideVideo: boolean = false;
	notLoaded: boolean = true;
	videoLoaded: boolean = false;

	options: string[] = [];
	showResults: boolean = false;
	optionsWithPercentage: any[] = [];
	percentageSum: number = 0;
	totalVotes: number = 0;
	voted: boolean = false;
	pollEffect: boolean = false;


	constructor(public authService: AuthService,
		private inAppBrowser: InAppBrowser,
		private el: ElementRef,
		private actionSheetCtrl: ActionSheetController,
		public global: AppState,
		private clipboard: Clipboard,
		private socialSharing: SocialSharing,
		private chatService: ChatService,
		private toastCtrl: ToastController,
		private loadingCtrl: LoadingController,
		private router: Router,
		private alertCtrl: AlertController,
		private fcm: FcmProvider,
		private platform: Platform,
		private takeLikesService: TakeLikesService,
		private navCtrl: NavController,
		private modalCtrl: ModalController,
		private threadsService: ThreadsService,
		public takeService: TakeService) { }





	ngOnDestroy() {

		if (this.take.video) this.unloadVideo();

	}

	ngOnInit() {


		if (this.take.video) {
			this.setVideoContainerStyle();
			this.take.videoDuration = this.sec2time(Math.round(this.take.videoDuration))
		}

		if (this.take.type == 'Link') {

			this.resizeURLImage();

		}

		if (this.take.type == "Poll") {
			if (this.authService.isLoggedIn()) {
				if (this.authService.currentUser.username === this.take.user.username) {
					this.showResults = true;
				}
			}
			this.options = this.take.pollValues;
			this.totalVotes = this.take.votes.length;
			this.userHasVoted();
		}



	}

	userHasVoted() {

        if (this.authService.isLoggedIn()) {
            if (this.takeService.userHasVoted(this.take, this.authService.currentUser._id) || this.showResults) {
                this.calculatePercentage(false);
            }
        }
	}

	createOptionsObject(i: number) {

        let option = this.options[i].trim();
        let provArray = this.take.votes.filter(i => i.option.trim() == option)
        let totalVotesOfOption = provArray.length;
        let userInOption = provArray.some((voter: any) => voter.user == this.authService.currentUser._id); //ID

        let percentage = (totalVotesOfOption / this.totalVotes) * 100;
        let decimal = percentage % 1
        let flooredPercentage = Math.floor(percentage);

        this.percentageSum += flooredPercentage;

        let object = {
            option: option,
            percentage: percentage,
            decimal: decimal,
            flooredPercentage: isNaN(flooredPercentage) ? 0 : flooredPercentage,
            userInOption: userInOption
        }


        return object;
    }
	
	calculatePercentage(makeEffect: boolean) {

        this.take.optionsWithPercentage = [];
        for (let i = 0; i < this.options.length; i++) {
            this.take.optionsWithPercentage.push(this.createOptionsObject(i));
        }

        let diffTo100 = 100 - this.percentageSum;
        if (diffTo100 != 0) {
            let provisionalArray = this.take.optionsWithPercentage.concat();
            provisionalArray.sort((a, b) => {
                return b.decimal - a.decimal;
            });


            for (let i = 0; i < diffTo100; i++) {
                for (let j = 0; j < this.take.optionsWithPercentage.length; j++) {
                    if (this.take.optionsWithPercentage[j].option == provisionalArray[i].option) {
                        this.take.optionsWithPercentage[j].flooredPercentage += 1;

                    }
                }

            }
        }

        this.take.voted = true;
	}
	
	toggleVote(value: string, event: any) {

		event.stopPropagation()
        if (this.authService.isLoggedIn() && this.options.length > 1) {
            this.pollEffect = true;
            if (!this.takeService.userHasVoted(this.take, this.authService.currentUser._id)) {
                setTimeout(() => { this.take.voted = true; }, 700);
                this.totalVotes += 1;
                this.takeService.postVote(this.take._id, value);
                let objectToPush = {
                    option: value,
                    user: this.authService.currentUser._id
                }
                this.take.votes.push(objectToPush);
				this.calculatePercentage(true);
				setTimeout(() => {
					this.pollEffect = false;
				}, 2000);

            }

        } else {

            let data = {
                message: 'Sign up to vote in polls!',
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

            //Mandar a registrar
        }

    }




	cutURLText(limit: number) {
		let reducedText = this.take.urlTitle.substring(0, limit);
		if (reducedText.length < this.take.urlTitle.length) {
			this.take.reducedTitle = this.take.urlTitle.substring(0, limit) + "...";
		} else {
			this.take.reducedTitle = this.take.urlTitle
		}

	}


	resizeURLImage() {

		if (this.take.thumbnail_width > 500 && this.take.provider_name != 'Twitter' && this.take.urlType != 'video') {
			var imageUrl = this.take.thumbnail_url;
			loadImage(
				imageUrl,
				(img, data) => {
					if (img.type === "error") {

					} else {

						this.cutURLText(80)
						img.setAttribute("style", "object-fit:cover; border-bottom: 1px solid #ededed; height: 170px; border-radius: 10px 10px 0 0");
						let el = this.el.nativeElement.querySelector('.link-container');
						el.insertBefore(img, el.firstChild);
						this.largeLink = true;


					}
				},
				{ canvas: true, maxWidth: 700 }
			);

		} else {

			this.cutURLText(60)
			this.smallLink = true;

		}



	}


	isVisible(elem) {

		if (elem) {
			let coords = elem.getBoundingClientRect();

			let windowHeight = document.documentElement.clientHeight;

			// top elem edge is visible OR bottom elem edge is visible
			let topVisible = coords.top > 0 && coords.top < windowHeight;
			let bottomVisible = coords.bottom < windowHeight && coords.bottom > 0;

			return topVisible || bottomVisible;
		}


	}


	onPause($event) {

		clearInterval(this.timeInterval);

		let vid = $event.target;
		this.videoPaused = true;
		if (this.platform.is('android')) {
			vid.controls = true;
		} else {
			vid.controls = false;
		}
		this.videoTime(vid);

		clearInterval(this.displayTimeTimeout)
		this.showTimer = true;
		this.displayTimeTimeout = setTimeout(() => {
			this.showTimer = false;
		}, 4000);



	}


	onPlay($event) {



		let vid = $event.target;
		this.videoPaused = false;
		clearTimeout(this.displayTimeTimeout)
		this.showTimer = true;
		this.displayTimeTimeout = setTimeout(() => {
			this.showTimer = false;
		}, 3000);



	}

	onMetadata($event) {


		let vid = $event.target;

		this.videoTime(vid)

		this.showTimer = true;
		this.displayTimeTimeout = setTimeout(() => {
			this.showTimer = false;
		}, 4000);
	}


	unloadVideo() {

		this.videoTake.nativeElement.pause();
		this.videoTake.nativeElement.src = ""; // empty source
		this.videoTake.nativeElement.load();
		this.videoLoaded = false;
		this.videoTake.nativeElement.controls = false;
	}

	loadVideo() {


		this.videoTake.nativeElement.pause();
		this.videoTake.nativeElement.src = this.take.video; // empty source
		this.videoTake.nativeElement.load();
		this.videoLoaded = true;

	}



	openLink(e: any) {

		e.stopPropagation()

		const browser = this.inAppBrowser.create(this.take.url, '_system');
	}

	onData(e: any) {
		this.notLoaded = false;
		let vid = e.target;
		if (this.take.videoCurrentTime) vid.currentTime = this.take.videoCurrentTime;
		this.take.videoCurrentTime = null;

	}


	videoTime(vid: any) {
		this.timeInterval = setInterval(() => {
			if (vid.duration) this.time = this.sec2time(Math.round(vid.duration - vid.currentTime))
		}, 1000);
	}

	pad(num, size) {
		return ('000' + num).slice(size * -1);
	}

	sec2time(timeInSeconds: any) {

		let time = parseFloat(timeInSeconds).toFixed(3);
		let hours = Math.floor(Number(time) / 60 / 60),
			minutes = Math.floor(Number(time) / 60) % 60,
			seconds = Math.floor(Number(time) - minutes * 60),
			milliseconds = time.slice(-3);

		return this.pad(minutes, 2).charAt(1) + ':' + this.pad(seconds, 2)
	}



	itemTapped() {

		if (this.take.video) {
			let vid: any = document.getElementById('media-' + this.take._id);
			this.take.videoCurrentTime = vid.currentTime;
		}

		this.takeService.takeUserPage = this.take;
		this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/take-detail', this.take._id]);
	}

	like(e: any) {

		e.stopPropagation();
		this.fcm.impact("light");
		if (this.authService.isLoggedIn()) {
			if (this.userHasLiked(this.take)) {
				this.take.likedByUser = false;
				this.take.count -= 1;
				this.takeLikesService.deleteTakeLike(this.take, this.authService.currentUser._id);

			} else {
				this.take.likedByUser = true;
				this.take.count += 1;
				this.takeLikesService.postTakeLike(this.take, this.authService.currentUser._id);
			}
		}
		else {

			//Mandar a signup
			let data = {
				message: 'Sign up to like!',
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

	userHasLiked(thread: any) {



		if (this.authService.currentUser) {
			return this.takeLikesService.userHasLiked(thread, this.authService.currentUser._id);
		} else {
			return false;
		}
	}

	goToUser(event) {

		let user = this.take.user;

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


	setVideoContainerStyle() {


		this.videoStyle = {
			'border-radius': '10px',
			'position': 'relative',
			'padding-top': ((this.take.videoHeight / this.take.videoWidth) * 100) + "%"

		}
	}


	setiframeStyle() {

		let percentage = (this.takeService.width / this.take.htmlWidth);

		this.iframeStyle = {
			'height': this.take.htmlHeight * percentage > this.take.htmlHeight ? this.take.htmlHeight + 'px' : this.take.htmlHeight * percentage + 'px',
			'width': this.takeService.width + 'px',
			'margin': '16px 0'

		}



	}


	fullVideo(vid: any) {

		vid.muted = false
		this.videoPaused = false;
		if (this.platform.is('android')) {
			vid.controls = true;
		} else {
			vid.controls = false;
		}

		vid.play();
	}

	fullSizePicture(e: any) {
		e.stopPropagation();
		this.takeService.fullScreen = true;
		this.takeService.fullScreenImage = this.take.picture
	}



	public changeVideoAudio(id: string, e: any) {

		e.stopPropagation();
		let vid: any = document.getElementById('media-' + id);
		this.fullVideo(vid);

	}

	dataon() {

	}

	deleteOrEdit(e) {

		e.stopPropagation();
		let actionSheet = this.actionSheetCtrl.create({
			header: 'ACTION',
			cssClass: 'my-custom-action',
			buttons: [
				{
					text: 'Edit',
					handler: () => {
						let data = {
							take: this.take
						}
						this.authService.paramSignUp = data;
						this.navCtrl.navigateForward(this.router.url.substr(0, 10) + '/edit-take');
					}
				},
				{
					text: 'Delete',
					handler: () => {
						this.alertCtrl.create({
							header: 'Do you want to delete this discussion?',
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
										this.deleteTake();
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

	deleteTake() {

		this.loadingCtrl.create({
			spinner: 'crescent',
			cssClass: 'my-custom-loading'
		}).then(
			loader => {

				loader.present();
				let data = {
					takeId: this.take._id,
					userId: this.authService.currentUser._id
				}

				this.takeService.deleteTake(data)
					.subscribe((success) => {

						if (success) {

							this.filterTake.emit(this.take._id);
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

	saveDiscussion(take: ITake, saved: boolean) {

		if (this.authService.isLoggedIn()) {
			if (saved) {
				const index = take.bookmarks.indexOf(this.authService.currentUser._id)
				if (index > -1) {
					take.bookmarks.splice(index, 1)
				}
				this.takeService.deleteBookmark(take._id)
				setTimeout(() => {
					this.toastCtrl.create({
						message: "Discussion unsaved",
						duration: 2000,
						color: 'warning',
						position: 'bottom'
					}).then(toast => {
						toast.present();
					})
					
				}, 300);
				
			} else {
				if(take.bookmarks) take.bookmarks.push(this.authService.currentUser._id);
				else {
					take.bookmarks = [this.authService.currentUser._id];
				}
				this.takeService.addToBookmarks(take._id)
				setTimeout(() => {
					this.toastCtrl.create({
						message: "Discussion saved",
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
				message: 'Sign up to save this discussion!',
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

	userHasSaved(take: ITake) {

		if (this.authService.currentUser && take.bookmarks) {
			return take.bookmarks.some((user: any) => user === this.authService.currentUser._id);
		} else {
			return false;
		}
	}

	presentActionSheetShare(e: any, take: ITake) {

		e.stopPropagation()
		let saved = this.userHasSaved(take)
		this.actionSheetCtrl.create({
			cssClass: 'my-custom-action',
			buttons: [
				{
					text: saved ? 'Unsave discussion' : 'Save discussion',
					icon: saved ? 'bookmark' : 'bookmark-outline',
					handler: () => {
						this.saveDiscussion(take, saved);
					}
				},
				{
					text: 'Send to chat',
					icon: 'send',
					handler: () => {
						this.shareDiscussionToChat(e, take)
					}
				}, {
					text: 'Copy link to discussion',
					icon: 'link',
					handler: () => {

						let url = 'https://www.discussthegame.com/discussions/' + take._id
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
					text: 'Share discussion via...',
					icon: 'share-outline',
					handler: () => {
						this.shareVia(take)
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


	shareVia(take: ITake) {

		var options = {
			url: 'https://www.discussthegame.com/discussions/' + take._id
		};
		this.socialSharing.shareWithOptions(options)
	}

	shareDiscussionToChat(e: any, take: ITake) {

		if (this.authService.isLoggedIn()) {
			let data = {
				take
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

						if (data.data.newChat) this.newChat(e, take);

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

	newChat(e: any, take: any) {
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
							this.shareDiscussionToChat(e, take);

						} else {
							//El chat no estaba en el arreglo epro existe en la base de datos
							this.chatService.addNewChat(data.data.chat);
							this.shareDiscussionToChat(e, take);
						}

					} else if (data.data.provChat) {
						//Create "new chat"
						data.data.provChat._id = "empty";
						data.data.provChat.createdAt = Date.now();
						this.chatService.addNewChat(data.data.provChat);
						this.shareDiscussionToChat(e, take);
					}

				})
		})
	}

	onIntersection($event) {

		const { [InViewportMetadata]: { entry }, target } = $event;
		const ratio = entry.intersectionRatio;
		const vid = target;

		if (ratio >= 0.02) {

			this.dontPlay = false;
			if (this.take.videoCurrentTime) vid.currentTime = this.take.videoCurrentTime;
			if (!this.videoLoaded) this.loadVideo();

		} else {

			this.dontPlay = true; //a veces no se pone pausa por el hack cuando te sales de fullscreen para que se vuelva a reproducir
			vid.currentTime = 0;
			if (this.videoLoaded) this.unloadVideo();
		}


	}

	setLinkStyle() {

		this.linkStyle = {
			'background-image': 'url(' + this.take.thumbnail_url + ')',
			'background-size': 'cover',
			'height': '75px',
			'width': '95px',
			'margin-left': '10px',
			'background-position': 'center',
			'border-radius': '5px',
			'float': 'right',
			'position': 'relative',
			'overflow': 'hidden'
		}

	}


}
