import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { NavController, ToastController, ModalController, IonContent, LoadingController, ActionSheetController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { IChat } from '../shared/interfaces';
import { ChatService } from '../core/chat.service';
import { NewChatPage } from '../new-chat/new-chat.page';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { AppState } from '../core/state.service';
import { Router } from '@angular/router';
import { ChatItemComponent } from './chat-item.component';
import { ThreadsService } from '../core/threads.service';
import { SignupAppPage } from '../signup-app/signup-app.page';

@Component({
	selector: 'app-chats',
	templateUrl: './chats.page.html',
	styleUrls: ['./chats.page.scss'],
})
export class ChatsPage implements OnInit {

	chats: IChat[] = [];
	skip: number = 0;
	enableInfinite: boolean = true;
	underlinedRooms: boolean = true;
	scrollToTop: boolean = false;
	sortBy: string = "TEAM ROOMS";
	refreshFavorites: boolean = true;

	@ViewChild('chat', { static: true }) content: IonContent;
	@ViewChild(ChatItemComponent) child: ChatItemComponent;

	constructor(public authService: AuthService,
		private socialSharing: SocialSharing,
		private toastCtrl: ToastController,
		private actionSheetCtrl: ActionSheetController,
		public global: AppState,
		private router: Router,
		public threadsService: ThreadsService,
		private loadingCtrl: LoadingController,
		private navCtrl: NavController,
		private modalCtrl: ModalController,
		public chatService: ChatService,
		private storage: Storage) { }

	ngOnInit() {
	
		setTimeout(() => {
			this.scrollToTop = true;
		}, 2000);
	}



	filterRooms(league: string) {
		this.chatService.waitForRooms = true;
		this.chatService.roomsFilterBy = league;
		this.getChats();

	}

	ionViewDidEnter() {

		
		if(!this.child) return //cordova kill
		this.child.checkIfOnline();

		this.chatService.enableInfinite = true;
		this.chatService.chatNotification = false;
	}


	ionViewWillEnter() {
		if (this.scrollToTop) this.content.scrollToTop();	
		if(this.chatService.chatNotification) {
			this.underlinedRooms = false;
			
		}
		this.showTabs()
	}


	addFavorites() {

		this.refreshFavorites = true;
		this.navCtrl.navigateForward(this.router.url.substr(0, 10) + '/teams');
	}

	

	getChats() {

		if(this.authService.isLoggedIn()) {
			
				this.chatService.getChats(0, true);
				this.chatService.skip = 0
				this.chatService.enableInfinite = true;
			
		}
	}

	public showTabs() {
		const tabBar = document.getElementById('myTabBar');
		if (tabBar !== null && tabBar.style.display !== 'flex') tabBar.style.display = 'flex';
	}

	goBack() {

		this.authService.addurl = false;
		this.navCtrl.pop();
		
	}


	shareSheetShare() {

		this.loadingCtrl.create({
			spinner: 'crescent',
			cssClass: 'my-custom-loading'
		}).then((loader) => {
			loader.present()

			let title = "Download Discuss the Game now!"
			let url = 'https://www.discussthegameapp.com';

			this.socialSharing.share(title, null, null, url).then(() => {
				loader.dismiss();
			}).catch(() => {
				loader.dismiss();
				this.toastCtrl.create({
					message: 'Failed to share App',
					duration: 3000,
					position: 'bottom'
				}).then(toast => toast.present())


			});
		})


	}

	presentActionSheet() {

		this.actionSheetCtrl.create({
			buttons: [
				{
					text: 'New Chat',
					handler: () => {
						this.newChat();
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

	newChat() {
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

							this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/chat-detail', data.data.chat._id]);


						} else {
							//El chat no estaba en el arreglo epro existe en la base de datos
							this.chatService.addNewChat(data.data.chat);

							this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/chat-detail', data.data.chat._id]);
						}

					} else if (data.data.provChat) {

						//Create "new chat"
						data.data.provChat._id = "empty";
						data.data.provChat.createdAt = Date.now();
						this.chatService.addNewChat(data.data.provChat);
						this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/chat-detail', data.data.provChat._id]);
					}
				})
		})
	}


	getMoreChatsFromDB(infiniteScroll?: any) {
		this.chatService.getMoreChats(this.chatService.skip)
			.subscribe((chats) => {
				infiniteScroll.target.complete();
				if (chats.length < 20) this.chatService.enableInfinite = false;
			},
				(err) => {
					infiniteScroll.target.complete();
				})
	}

	created(thread: IChat): string {

		let milliseconds = thread.modified.getTime();
		let now = new Date();
		let millisecondsNow = now.getTime();
		let diffInHours = (millisecondsNow - milliseconds) / (1000 * 60 * 60); //hours
		let typeTime;

		if (diffInHours >= 24) {
			//DAYS
			let threadCreated = Math.floor(diffInHours / 24); //Template binding
			typeTime = "d"
			return `${threadCreated} ${typeTime}`

		} else if (diffInHours < 1 && diffInHours > 0) {
			//MINUTES
			let threadCreated = Math.ceil(diffInHours * 60); //Template binding
			typeTime = "min"
			return `${threadCreated} ${typeTime}`

		} else {
			//HOURS   
			let threadCreated = Math.floor(diffInHours); //Template binding
			typeTime = "h"
			return `${threadCreated} ${typeTime}`
		}
	}

	doInfinite(infiniteScroll) {
		
		this.chatService.skip += 20;
		this.getMoreChatsFromDB(infiniteScroll);
		
		
	}
}
