import { Component, ViewChild, OnInit } from '@angular/core';
import { ModalController, ToastController, LoadingController, IonSearchbar, NavParams } from '@ionic/angular';
import { AuthService } from '../core/auth.service';

import { ChatService } from '../core/chat.service';
import * as _ from 'lodash';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { WebSocketService } from '../core/websocket.service';
import { AppState } from '../core/state.service';
import { Storage } from '@ionic/storage';


@Component({
	selector: 'app-share-post',
	templateUrl: './share-post.page.html',
	styleUrls: ['./share-post.page.scss'],
})
export class SharePostPage implements OnInit {

	recipients: any[] = [];
	skip: number = 0;
	enableInfinite: boolean = false;
	data: any;
	chats: any[];
	message: string = "";
	thread;
	take;
	totalLoops: number = 0;
	loopCount: number = 0;

	@ViewChild(IonSearchbar) search: IonSearchbar;

	constructor(private navParams: NavParams,
		private loadingCtrl: LoadingController,
		private chatService: ChatService,
		public global: AppState,
		private keyboard: Keyboard,
		private storage: Storage,
		private modal: ModalController,
		private authService: AuthService,
		private webSocketService: WebSocketService,
		private toastCtrl: ToastController) {

		this.data = this.navParams.get('data');
		console.log(this.data)

		if(this.data.thread) this.thread = this.data.thread;
		else {
			this.take = this.data.take;
		}

		

	}

	ngOnInit() {
		this.chats = _.cloneDeep(this.chatService.chats);
		this.configureChats(this.chats);
	}


	configureChats(chats: any) {
		
		chats.forEach(chat => {
			if (chat.customType == "general-group" || chat.customType == "team-group" || chat.customType == "sport-group") {
				chat.chatName = chat.name;
				chat.otherUserPicture = chat.coverUrl;

			} else {

				if (!chat.recipient) {

					for (let index = 0; index < chat.members.length; index++) {
						let member = chat.members[index];
						if (member._id != this.authService.currentUser._id) {
							chat.chatName = member.username;
							chat.otherUserPicture = member.profilePicture;
							chat.otherUserId = member._id
							break;

						}
					}
				} else {
					chat.chatName = chat.recipient.username;
					chat.otherUserId = chat.recipient._id
					chat.otherUserPicture = chat.recipient.profilePicture;
				}

			}
		})
	}

	dismissModal() {

		this.modal.dismiss({
			newChat: null
		});

	}

	addChat($event, chat) {

		if (!this.keyboard.isVisible) {
			if (!chat.active) {
				chat.active = true;
				if (this.recipients.length > 2) {
					this.toastCtrl.create({
						message: "You can only send it to a max. of 3 chats",
						duration: 5000,
						position: 'bottom'
					}).then(toast => toast.present())
					chat.active = false;
					return;
				}
				this.recipients.push(chat);
			} else {
				this.recipients = this.recipients.filter(recipient => recipient._id != chat._id)
				chat.active = false;
			}
		}

	}

	newChat() {
		this.modal.dismiss({
			newChat: true
		});
	}

	handleMessage() {

		this.totalLoops = this.recipients.length;
		for (let index = 0; index < this.recipients.length; index++) {
			const chat = this.recipients[index]
			if (chat._id == "empty") {
				if(this.thread)this.newMessageCreate(chat);
				else {
					this.newMessageCreateForDiscussion(chat)
				}
				
			} else {
				if(this.thread) this.newMessage(chat);
				else {
					this.newMessageForDiscussion(chat)
				}
				
			
		}
		}

	}

	newMessage(chat: any) {

		this.loadingCtrl.create({
			spinner: 'crescent',
			message: 'Sending...',
			cssClass: 'my-custom-loading'
		}).then(loader => {
			loader.present()

			if (this.message.length >= 5000) return;
			let data = {
				message: {
					message: !this.message ? 'Sent a post' : this.message.trim(),
					customType: 'post',
					thread: this.thread._id,
					chat: chat._id
				},
				toUser: !!chat.otherUserId ? chat.otherUserId : undefined

			}

			let messageToAppend = {
				user: {
					_id: this.authService.currentUser._id,
					username: this.authService.currentUser.username,
					profilePictureThumbnail: this.authService.currentUser.profilePictureThumbnail
				},
				message: !this.message ? 'Sent a post' : this.message.trim(),
				thread: {
					title: this.thread.title,
					picture: this.thread.picture,
					_id: this.thread._id,
					user: {
						username: this.thread.user.username,
						profilePictureThumbnail: this.thread.user.profilePictureThumbnail
					}
				},
				customType: 'post',
				createdAt: Date.now()
			}

			if (this.chatService.channelMessages[chat._id]) {
				this.chatService.channelMessages[chat._id].push(messageToAppend);
			} else {
				this.chatService.channelMessages[chat._id] = [];
				this.chatService.channelMessages[chat._id].push(messageToAppend);
			}


			this.chatService.newMessage(chat._id, data)
				.subscribe((dataDB: any) => {

					if (dataDB.message) {
						dataDB.message.user = {
							_id: this.authService.currentUser._id,
							username: this.authService.currentUser.username,
							profilePictureThumbnail: this.authService.currentUser.profilePictureThumbnail
						}
						dataDB.message.thread = {
							title: this.thread.title,
							picture: this.thread.picture,
							_id: this.thread._id,
							user: {
								username: this.thread.user.username,
								profilePictureThumbnail: this.thread.user.profilePictureThumbnail
							}
						}

						let index = this.chatService.chats.findIndex(c => c._id == chat._id)
						if (index > -1) {
							this.chatService.chats[index].lastMessage = messageToAppend;
						}

						this.chatService.sortChats();
						this.webSocketService.emitMessage(chat, dataDB.message, this.authService.currentUser._id)
					} else {

						this.toastCtrl.create({
							message: 'The message could not be sent to.' + chat.chatName + ' Either the recipient has blocked you or disabled DMs',
							duration: 5000,
							position: 'bottom'
						}).then(toast => {
							toast.present();

						})

					}

					loader.dismiss();
					this.loopCount += 1;
					if (this.loopCount == this.totalLoops) loader.dismiss(); this.dismissModal();

				},
					(err) => {
						this.loopCount += 1;
						if (this.loopCount == this.totalLoops) loader.dismiss();
						this.toastCtrl.create({
							message: 'The message could not be sent.',
							duration: 5000,
							position: 'bottom'
						}).then(toast => {
							toast.present();

						})
					})
		})


	}

	newMessageCreate(chat: any) {

		if (this.message.length >= 5000) return;

		this.loadingCtrl.create({
			spinner: 'crescent',
			message: "Sending...",
			cssClass: 'my-custom-loading'
		}).then(loader => {
			loader.present();
			let members = [];
			members.push(chat.recipient._id, this.authService.currentUser._id);
			let unreadMessages = members.map(member => {
				return {
					user: member,
					unreadMessageCount: 0,
					muted: false
				}
			})

			let data = {
				message: {
					message: !this.message ? 'Sent a post' : this.message.trim(),
					customType: 'post',
					thread: this.thread._id,
				},
				chat: {
					members,
					operatorsIds: [this.authService.currentUser._id],
					customType: '1-1',
					unreadMessages
				},
				toUser: !!chat.otherUserId ? chat.otherUserId : undefined

			}

			let messageToAppend = {
				user: {
					_id: this.authService.currentUser._id,
					username: this.authService.currentUser.username,
					profilePictureThumbnail: this.authService.currentUser.profilePictureThumbnail
				},
				message: !this.message ? 'Sent a post' : this.message.trim(),
				thread: {
					title: this.thread.title,
					picture: this.thread.picture,
					_id: this.thread._id,
					user: {
						username: this.thread.user.username,
						profilePictureThumbnail: this.thread.user.profilePictureThumbnail
					}
				},
				customType: 'post',
				createdAt: Date.now()
			}



			this.chatService.newMessage(chat._id, data)
				.subscribe((dataDB: any) => {

					if (dataDB.message) {

						loader.dismiss();
						chat._id = dataDB.message.chat;
						chat.lastMessage = messageToAppend;
						chat.members = [chat.recipient, this.authService.currentUser];
						let chatForSocket = _.cloneDeep(chat);
						delete chatForSocket.recipient;
						delete chatForSocket.chatName;
						dataDB.message.user = {
							_id: this.authService.currentUser._id,
							username: this.authService.currentUser.username,
							profilePictureThumbnail: this.authService.currentUser.profilePictureThumbnail
						}
						dataDB.message.thread = {
							title: this.thread.title,
							picture: this.thread.picture,
							_id: this.thread._id,
							user: {
								username: this.thread.user.username,
								profilePictureThumbnail: this.thread.user.profilePictureThumbnail
							}
						}
						chat.unreadMessages = dataDB.chat.unreadMessages;
						chatForSocket.unreadMessages = dataDB.chat.unreadMessages;
						this.webSocketService.emitMessage(chatForSocket, dataDB.message, this.authService.currentUser._id)
						if (this.chatService.channelMessages[chat._id]) {
							this.chatService.channelMessages[chat._id].push(messageToAppend);
						} else {
							this.chatService.channelMessages[chat._id] = [];
							this.chatService.channelMessages[chat._id].push(messageToAppend);
						}
						this.chatService.getChats(0);

					} else {
						this.toastCtrl.create({
							message: 'The message could not be sent. Either the recipient has blocked you or disabled DMs',
							duration: 5000,
							position: 'bottom'
						}).then(toast => {
							toast.present();

						})

					}
					this.loopCount += 1;
					if (this.loopCount == this.totalLoops) loader.dismiss(); this.dismissModal();



				},
					(err) => {
						this.loopCount += 1;
						if (this.loopCount == this.totalLoops) loader.dismiss(); this.dismissModal();

					})
		})


	}

	newMessageForDiscussion(chat: any) {

		this.loadingCtrl.create({
			spinner: 'crescent',
			message: 'Sending...',
			cssClass: 'my-custom-loading'

		}).then(loader => {
			loader.present()

			if (this.message.length >= 5000) return;
			let data = {
				message: {
					message: !this.message ? 'Sent a discussion' : this.message.trim(),
					customType: 'discussion',
					take: this.take._id,
					chat: chat._id
				},
				toUser: !!chat.otherUserId ? chat.otherUserId : undefined

			}

			let messageToAppend = {
				user: {
					_id: this.authService.currentUser._id,
					username: this.authService.currentUser.username,
					profilePictureThumbnail: this.authService.currentUser.profilePictureThumbnail
				},
				message: !this.message ? 'Sent a discussion' : this.message.trim(),
				take: {
					take: this.take.take,
					picture: this.take.picture,
					_id: this.take._id,
					user: {
						username: this.take.user.username,
						profilePictureThumbnail: this.take.user.profilePictureThumbnail
					}
				},
				customType: 'discussion',
				createdAt: Date.now()
			}

			if (this.chatService.channelMessages[chat._id]) {
				this.chatService.channelMessages[chat._id].push(messageToAppend);
			} else {
				this.chatService.channelMessages[chat._id] = [];
				this.chatService.channelMessages[chat._id].push(messageToAppend);
			}


			this.chatService.newMessage(chat._id, data)
				.subscribe((dataDB: any) => {

					if (dataDB.message) {
						dataDB.message.user = {
							_id: this.authService.currentUser._id,
							username: this.authService.currentUser.username,
							profilePictureThumbnail: this.authService.currentUser.profilePictureThumbnail
						}
						dataDB.message.take = {
							take: this.take.take,
							picture: this.take.picture ? this.take.picture : undefined,
							_id: this.take._id,
							user: {
								username: this.take.user.username,
								profilePictureThumbnail: this.take.user.profilePictureThumbnail
							}
						}

						let index = this.chatService.chats.findIndex(c => c._id == chat._id)
						if (index > -1) {
							this.chatService.chats[index].lastMessage = messageToAppend;
						}

						this.chatService.sortChats();
						this.webSocketService.emitMessage(chat, dataDB.message, this.authService.currentUser._id)
					} else {

						this.toastCtrl.create({
							message: 'The message could not be sent to.' + chat.chatName + ' Either the recipient has blocked you or disabled DMs',
							duration: 5000,
							position: 'bottom'
						}).then(toast => {
							toast.present();

						})

					}

					loader.dismiss();
					this.loopCount += 1;
					if (this.loopCount == this.totalLoops) loader.dismiss(); this.dismissModal();

				},
					(err) => {
						this.loopCount += 1;
						if (this.loopCount == this.totalLoops) loader.dismiss();
						this.toastCtrl.create({
							message: 'The message could not be sent.',
							duration: 5000,
							position: 'bottom'
						}).then(toast => {
							toast.present();

						})
					})
		})


	}

	newMessageCreateForDiscussion(chat: any) {

		if (this.message.length >= 5000) return;

		this.loadingCtrl.create({
			spinner: 'crescent',
			message: "Sending...",
			cssClass: 'my-custom-loading'
		}).then(loader => {
			loader.present();
			let members = [];
			members.push(chat.recipient._id, this.authService.currentUser._id);
			let unreadMessages = members.map(member => {
				return {
					user: member,
					unreadMessageCount: 0,
					muted: false
				}
			})

			let data = {
				message: {
					message: !this.message ? 'Sent a discussion' : this.message.trim(),
					customType: 'discussion',
					take: this.take._id,
				},
				chat: {
					members,
					operatorsIds: [this.authService.currentUser._id],
					customType: '1-1',
					unreadMessages
				},
				toUser: !!chat.otherUserId ? chat.otherUserId : undefined

			}

			let messageToAppend = {
				user: {
					_id: this.authService.currentUser._id,
					username: this.authService.currentUser.username,
					profilePictureThumbnail: this.authService.currentUser.profilePictureThumbnail
				},
				message: !this.message ? 'Sent a discussion' : this.message.trim(),
				take: {
					take: this.take.take,
					picture: this.take.picture,
					_id: this.take._id,
					user: {
						username: this.take.user.username,
						profilePictureThumbnail: this.take.user.profilePictureThumbnail
					}
				},
				customType: 'discussion',
				createdAt: Date.now()
			}


			this.chatService.newMessage(chat._id, data)
				.subscribe((dataDB: any) => {

					if (dataDB.message) {

						loader.dismiss();
						chat._id = dataDB.message.chat;
						chat.lastMessage = messageToAppend;
						chat.members = [chat.recipient, this.authService.currentUser];
						let chatForSocket = _.cloneDeep(chat);
						delete chatForSocket.recipient;
						delete chatForSocket.chatName;
						dataDB.message.user = {
							_id: this.authService.currentUser._id,
							username: this.authService.currentUser.username,
							profilePictureThumbnail: this.authService.currentUser.profilePictureThumbnail
						}
						dataDB.message.take = {
							take: this.take.take,
							picture: this.take.picture,
							_id: this.take._id,
							user: {
								username: this.take.user.username,
								profilePictureThumbnail: this.take.user.profilePictureThumbnail
							}
						}
						chat.unreadMessages = dataDB.chat.unreadMessages;
						chatForSocket.unreadMessages = dataDB.chat.unreadMessages;
						this.webSocketService.emitMessage(chatForSocket, dataDB.message, this.authService.currentUser._id)
						if (this.chatService.channelMessages[chat._id]) {
							this.chatService.channelMessages[chat._id].push(messageToAppend);
						} else {
							this.chatService.channelMessages[chat._id] = [];
							this.chatService.channelMessages[chat._id].push(messageToAppend);
						}
						this.chatService.getChats(0);

					} else {
						this.toastCtrl.create({
							message: 'The message could not be sent. Either the recipient has blocked you or disabled DMs',
							duration: 5000,
							position: 'bottom'
						}).then(toast => {
							toast.present();

						})

					}
					this.loopCount += 1;
					if (this.loopCount == this.totalLoops) loader.dismiss(); this.dismissModal();



				},
					(err) => {
						this.loopCount += 1;
						if (this.loopCount == this.totalLoops) loader.dismiss(); this.dismissModal();

					})
		})


	}

	getMoreChatsFromDB(infiniteScroll?: any) {
		this.chatService.getMoreChats(this.skip)
			.subscribe((chats) => {
				this.configureChats(chats);
				infiniteScroll.target.complete();
				if (chats.length < 20) this.enableInfinite = false;
				this.chats = this.chats.concat(chats)
			},
				(err) => {
					infiniteScroll.target.complete();
				})

	}

	doInfinite(infiniteScroll) {


		this.skip += this.chatService.chats.length;
		this.getMoreChatsFromDB(infiniteScroll);


	}




}
