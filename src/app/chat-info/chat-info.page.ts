import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { NavController, AlertController, LoadingController, ToastController, ModalController, PickerController, IonSelect } from '@ionic/angular';
import { ChatService } from '../core/chat.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import * as _ from 'lodash';
import { WebSocketService } from '../core/websocket.service';
import { NewChatPage } from '../new-chat/new-chat.page';
import { FcmProvider } from '../core/fcm.service';
import { AppState } from '../core/state.service';

@Component({
	selector: 'app-chat-info',
	templateUrl: './chat-info.page.html',
	styleUrls: ['./chat-info.page.scss'],
})
export class ChatInfoPage implements OnInit {

	members: any[] = [];
	toggleSelect: boolean = false;
	id: string;
	chat: any;
	admin: boolean = false;
	toggleType: boolean = false;
	option: any;
	options: any[] = [];

	@ViewChild('optionSelect', { static: true }) select: IonSelect;

	constructor(public authService: AuthService,
		private webSocketService: WebSocketService,
		private fcm: FcmProvider,
		private route: ActivatedRoute,
		private modalCtrl: ModalController,
		private toastCtrl: ToastController,
		private navCtrl: NavController,
		private storage: Storage,
		public global: AppState,
		private picker: PickerController,
		private loadingCtrl: LoadingController,
		private alertCtrl: AlertController,
		private router: Router,
		public chatService: ChatService) {

		this.id = this.route.snapshot.paramMap.get('id');

		this.chat = this.chatService.getChat(this.id);


	}

	ngOnInit() {


		this.admin = this.chat.operatorsIds.some(operator => operator == this.authService.currentUser._id);
		this.chat.members.forEach(member => {

			if (this.chat.operatorsIds.some(operator => operator == member._id)) {
				member.admin = true;
			}

		});

		for (let index = 0; index < this.chat.unreadMessages.length; index++) {
			const element = this.chat.unreadMessages[index];
			if (element.user == this.authService.currentUser._id) {
				this.chat.muted = element.muted;
				break;
			}

		}


	}


	goToUser(user) {

		if (this.authService.isLoggedIn()) {
			if (this.authService.currentUser._id == user) {
				this.authService.downloadProfile = true;
				let data = {
					fromTabs: false,
					loadInitial: true
				}
				this.authService.paramSignUp = data;
				this.navCtrl.navigateForward(this.router.url.substr(0, 10) + '/profile');


			} else {
				let information = {
					fcm: true,
					userId: user
				}
		
				this.authService.paramSignUp = information;
				this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/user', user]);

			}

		} else {
			let information = {
				fcm: true,
				userId: user
			}
	
			this.authService.paramSignUp = information;
			this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/user', user]);

		}

	}


	removeMember(event: any, member: any) {

		event.stopPropagation();
		if(this.chat.public) {

			this.alertCtrl.create({
				header: 'Do you want to remove ' + member.username + ' from this group? This user won\'t be able to join again',
				buttons: [
					{
						text: 'Cancel',
						role: 'cancel',
						handler: () => {
	
						}
					},
					{
						text: 'Remove',
						handler: () => {
	
							this.loadingCtrl.create({
								spinner: 'crescent',
								cssClass: 'my-custom-loading'
							}).then(loader => {
								loader.present()
								let data = {
									memberId: member._id,
									username: member.username
								}
	
								this.chatService.removeMember(data, this.chat._id)
									.subscribe((message: any) => {
										loader.dismiss()
										this.chat.members = this.chat.members.filter(m => m._id != member._id);
										message.user = {
											_id: this.authService.currentUser._id,
											username: this.authService.currentUser.username,
											profilePictureThumbnail: this.authService.currentUser.profilePictureThumbnail
										}
	
										if (this.chatService.channelMessages[this.chat._id]) {
											this.chatService.channelMessages[this.chat._id].push(message);
										} else {
											this.chatService.channelMessages[this.chat._id] = [];
											this.chatService.channelMessages[this.chat._id].push(message);
										}
										this.webSocketService.emitMessage(this.chat, message, this.authService.currentUser._id)
	
									},
										(err) => {
											loader.dismiss()
											this.toastCtrl.create({
												message: err,
												duration: 3000,
												position: 'bottom'
											}).then(toast => toast.present())
										})
							})
						}
					}
				]
			}).then(alert => alert.present());

		} else {
			this.alertCtrl.create({
				header: 'Do you want to remove ' + member.username + ' from this group?',
				buttons: [
					{
						text: 'Cancel',
						role: 'cancel',
						handler: () => {
	
						}
					},
					{
						text: 'Remove',
						handler: () => {
	
							this.loadingCtrl.create({
								spinner: 'crescent',
								cssClass: 'my-custom-loading'
							}).then(loader => {
								loader.present()
								let data = {
									memberId: member._id,
									username: member.username
								}
	
								this.chatService.removeMember(data, this.chat._id)
									.subscribe((message: any) => {
										loader.dismiss()
										this.chat.members = this.chat.members.filter(m => m._id != member._id);
										message.user = {
											_id: this.authService.currentUser._id,
											username: this.authService.currentUser.username,
											profilePictureThumbnail: this.authService.currentUser.profilePictureThumbnail
										}
	
										if (this.chatService.channelMessages[this.chat._id]) {
											this.chatService.channelMessages[this.chat._id].push(message);
										} else {
											this.chatService.channelMessages[this.chat._id] = [];
											this.chatService.channelMessages[this.chat._id].push(message);
										}
										this.webSocketService.emitMessage(this.chat, message, this.authService.currentUser._id)
	
									},
										(err) => {
											loader.dismiss()
											this.toastCtrl.create({
												message: err,
												duration: 3000,
												position: 'bottom'
											}).then(toast => toast.present())
										})
							})
						}
					}
				]
			}).then(alert => alert.present());
		}
		
	}

	addPeople() {


		let membersIds = this.chat.members.map(m => m._id)

		let data = {
			addPeople: true,
			chat: this.chat._id,
			membersIds: membersIds,
			removed: this.chat.removed,
			public: this.chat.public
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

					if (data.data.message) {
						let message = data.data.message;
						let newMembers = data.data.newMembers;
						message.user = {
							_id: this.authService.currentUser._id,
							username: this.authService.currentUser.username,
							profilePictureThumbnail: this.authService.currentUser.profilePictureThumbnail
						}


						//no añadir duplicados

						this.chat.members.push(...newMembers);
						let membersIds = this.chat.members.map(member => member._id || member)
						if (this.chatService.channelMessages[this.chat._id]) {
							this.chatService.channelMessages[this.chat._id].push(message);
						} else {
							this.chatService.channelMessages[this.chat._id] = [];
							this.chatService.channelMessages[this.chat._id].push(message);
						}
						this.webSocketService.emitMessage(this.chat, message, this.authService.currentUser._id)
					}


				})
		})
	}

	deleteChat() {

		this.alertCtrl.create({
			header: 'Do you want to leave this chat?',
			buttons: [
				{
					text: 'Cancel',
					role: 'cancel',
					handler: () => {

					}
				},
				{
					text: 'Leave',
					handler: () => {

						this.loadingCtrl.create({
							spinner: 'crescent',
							cssClass: 'my-custom-loading'
						}).then(loader => {
							loader.present()
							this.chatService.deleteChat(this.chat._id)
								.subscribe((message: any) => {
									loader.dismiss();
									this.chatService.channelMessages[this.chat._id] = [];
									this.storage.remove(this.chat._id);
									this.chatService.chats = this.chatService.chats.filter(c => c._id != this.chat._id);
									this.chatService.determineChatNotifications();


									if (this.chat.customType != "1-1") {
										message.user = {
											_id: this.authService.currentUser._id,
											username: this.authService.currentUser.username,
											profilePictureThumbnail: this.authService.currentUser.profilePictureThumbnail
										}

										this.webSocketService.emitMessage(this.chat, message, this.authService.currentUser._id)

									}
									setTimeout(() => {
										this.navCtrl.navigateBack('/tabs/tab2')
									}, 500);



								},
									(err) => {
										this.toastCtrl.create({
											message: err,
											duration: 3000,
											position: 'bottom'
										}).then(toast => toast.present());

									});
						})



					}
				}
			]
		}).then(alert => alert.present());

	}


	reportChat() {
		this.alertCtrl.create({
			header: 'Why are you reporting this chat?',
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
						this.authService.reportUser(undefined, data.reason, this.chat._id)
							.subscribe((user) => {
								this.alertCtrl.create({
									header: 'Thanks for reporting this conversation',
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


	blockUser() {

		let user = this.chat.members.filter(m => m._id != this.authService.currentUser._id)[0];
		this.alertCtrl.create({
			header: 'Block ' + user.username + '?',
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


						this.authService.currentUser.usersBlocked.push(user._id);
						this.authService.blockUser(user._id)
							.subscribe(() => {

								this.deleteChat();

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

	goBack() {

		this.authService.addurl = false;
		this.navCtrl.pop();
		
	}


	selectType() {

		if (this.admin) this.toggleType = true;

	}

	hideType() {
		this.toggleType = false;
	}


	editType(type: string) {

		if (this.admin) {
			if (type == 'sport') {
				let prov = ['NBA', 'NFL', 'Soccer', 'MLB', 'NHL', 'NCAAF', 'NCAAB'];
				this.options = [];
				this.options = prov.map(l => {
					return {
						text: l,
						value: l

					}
				})
				this.toggleSelect = true;
				setTimeout(() => {
					this.select.open();
				}, 250);

			} else if (type == 'team') {
				this.options = [];
				this.options = this.authService.currentUser.favAllTeams.map(t => {
					return {
						text: t.teamName,
						value: {
							id: t._id,
							league: t.league
						}
					}
				})
				this.toggleSelect = true;
				setTimeout(() => {
					this.select.open();
				}, 250);


			} else {
				let data = {
					chat: this.chat._id
				}
				this.editChat(data)
			}
		}


	}

	selectChange(e) {
		if (this.admin) {
			this.toggleSelect = false;
			this.toggleType = false;
			if (typeof e.detail.value == 'object') { //team

				let data = {
					team: e.detail.value.id,
					league: e.detail.value.league,
					chat: this.chat._id
				}

				this.editChat(data);

			} else {

				let data = {
					league: e.detail.value,
					chat: this.chat._id
				}
				this.editChat(data);

			}
		}


	}


	editChat(data: any) {

		this.toggleType = false;
		this.loadingCtrl.create({
			spinner: 'crescent',
			cssClass: 'my-custom-loading'
		}).then(loader => {
			loader.present()
			this.chatService.editType(data)
				.subscribe((chat: any) => {
					loader.dismiss()
					if (chat.league && !chat.team) {
						this.chat.league = chat.league;
						this.chat.team = undefined;
					} else if (chat.team) {

						this.chat.league = chat.league;
						this.chat.team = this.authService.currentUser.favAllTeams.find(t => t._id == chat.team);
					} else {
						this.chat.league = undefined;
						this.chat.team = undefined;
					}
				},
					(err) => {
						loader.dismiss()
						this.toastCtrl.create({
							message: "Something went wrong, please try again later.",
							duration: 5000,
							position: 'bottom'
						}).then(toast => toast.present())

					})
		})


	}

	editName() {

		if (this.chat.public) {
			this.alertCtrl.create({
				message: "You can't change the group name of a public chat",
				buttons: [
					{
						text: 'Ok',
						handler: () => {

						}
					}
				]
			}).then(alert => alert.present());


		} else {
			this.alertCtrl.create({
				header: 'Group Name:',
				inputs: [
					{
						name: 'groupName',
						value: this.chat.name

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
						text: 'Done',
						handler: a => {

							this.loadingCtrl.create({
								spinner: 'crescent',
								cssClass: 'my-custom-loading'
							}).then(loader => {
								loader.present()

								if (a.groupName.length == 0) return;
								if (a.groupName.length > 20) {

									loader.dismiss();
									this.toastCtrl.create({
										message: "Group names must be less than 20 characters.",
										duration: 3000,
										position: 'bottom'
									}).then(toast => toast.present())
									return;

								}
								let data = {
									name: a.groupName[0].toUpperCase() + a.groupName.slice(1),
								}

								this.chatService.editChatName(data, this.chat._id)
									.subscribe((message: any) => {

										loader.dismiss();
										message.user = {
											_id: this.authService.currentUser._id,
											username: this.authService.currentUser.username,
											profilePictureThumbnail: this.authService.currentUser.profilePictureThumbnail
										}
										let membersIds = this.chat.members.map(member => member._id || member)
										if (this.chatService.channelMessages[this.chat._id]) {
											this.chatService.channelMessages[this.chat._id].push(message);
										} else {
											this.chatService.channelMessages[this.chat._id] = [];
											this.chatService.channelMessages[this.chat._id].push(message);
										}
										this.chat.name = a.groupName[0].toUpperCase() + a.groupName.slice(1);
										this.chat.chatName = a.groupName[0].toUpperCase() + a.groupName.slice(1);
										this.webSocketService.emitMessage(this.chat, message, this.authService.currentUser._id)


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
					}
				]
			}).then(alert => alert.present())
		}


	}


	makeItPublic() {

		this.fcm.impact('light');
		this.chatService.makeItPublic(this.chat._id)
			.subscribe((chat: any) => {
				this.chat.public = chat.public;
				this.chat.name = chat.name;
				if (chat.public) {
					this.alertCtrl.create({

						message: 'Your chat will now appear in the Discover tab for fans to join',
						buttons: [
							{
								text: 'Ok',
								handler: () => {

								}
							}
						]
					}).then(alert => alert.present());
				}

			},
				(err) => {

					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'bottom'
					}).then(toast => toast.present())
				})

	}


	muteMessages() {

		this.fcm.impact('light');
		this.chatService.muteMessages(this.chat._id)
			.subscribe((chat: any) => {
				this.chat.unreadMessages = chat.unreadMessages;

			},
				(err) => {

					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'bottom'
					}).then(toast => toast.present())
				})

	}

}
