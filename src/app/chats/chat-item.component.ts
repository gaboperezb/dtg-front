import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NavController } from '@ionic/angular';
import { IChat, IUserDB } from '../../app/shared/interfaces';
import { AuthService } from '../../app/core/auth.service';
import { AppState } from '../../app/core/state.service';
import { Storage } from '@ionic/storage';

import { ChatService } from '../core/chat.service';
import { Router } from '@angular/router';


@Component({
	selector: 'chat-item',
	templateUrl: './chat-item.component.html',
	styleUrls: ['./chat-item.component.scss']
})
export class ChatItemComponent {

	@Input() chat: IChat;
	chatName: string = "";

	otherUserPicture: string = "";
	otherUser: IUserDB;
	@Output() deleteComment = new EventEmitter();
	profilePicture: any;
	online: boolean = false;
	loaded: boolean = false;

	discussionOrAnswer: string = "discussion"; //Para que likers service distinga entre timeline y respuesta, y así aplicar DRY.

	constructor(public navCtrl: NavController,
		public authService: AuthService,
		public global: AppState,
		private router: Router,
		private storage: Storage,
		private chatService: ChatService) {
	}

	ngOnInit() {

		if (this.chat.customType == "general-group" || this.chat.customType == "team-group" || this.chat.customType == "sport-group") {
			this.chatName = this.chat.name;
			this.chat.chatName = this.chatName;
			this.chat.otherUserPicture = this.chat.coverUrl;

		} else {

			if (!this.chat.recipient) {

				for (let index = 0; index < this.chat.members.length; index++) {
					let member = this.chat.members[index];
					if (member._id != this.authService.currentUser._id) {
						this.otherUser = member
						break;

					}
				}
				this.chatName = this.otherUser.username;
				this.chat.chatName = this.chatName;
				this.chat.otherUserPicture = this.otherUser.profilePicture;
			} else {
				this.chatName = this.chat.recipient.username;
				this.chat.chatName = this.chatName;
				this.chat.otherUserPicture = this.chat.recipient.profilePicture;
			}

		}

		if (this.chat._id != "empty") {
			this.checkIfOnline();
			//this.checkToGetMessages();
			for (let index = 0; index < this.chat.unreadMessages.length; index++) {
				const element = this.chat.unreadMessages[index];
				if (element.user == this.authService.currentUser._id) {
					this.chat.muted = element.muted;
					break;
				}
	
			}
		}
	
	}

	
	checkToGetMessages() {

		this.storage.get(this.chat._id).then((value) => {
			if (!!value) {//existe

				this.chatService.channelMessages[this.chat._id] = JSON.parse(value);
				if (this.chat.unreadMessageCount > 0) this.getMessages();

			} else {

				this.getMessages();

			}
		})
	}


	getMessages() {
		let limit = (this.chat.unreadMessageCount > 30 && this.chat.unreadMessageCount < 100) ? this.chat.unreadMessageCount : 30;
		this.chatService.getMessagesForChat(this.chat._id, 0, limit)
			.subscribe((messages) => {

					if (this.chat.unreadMessageCount == 0) {
						if(messages.length > 0) this.storage.set(this.chat._id, JSON.stringify(messages));
					}
					this.chatService.channelMessages[this.chat._id] = messages;
				
			})
	}

	checkIfOnline() {
		let count = 0;

		if(this.chat._id != 'empty') {
			if (this.chat.customType == "1-1") {
				this.chatService.checkIfOnline(this.chat._id)
					.subscribe((chat: any) => {
						for (let index = 0; index < chat.members.length; index++) {
							const member = chat.members[index];
							if (member.connectionStatus == "online") {
								if (member._id != this.authService.currentUser._id) {
									count += 1
									this.chat.online = true;
									break;
								}
							}
	
						}
						if (count == 0) this.chat.online = false;
	
					})
			}
		}
		

	}

	goToChat() {
		this.chat.clicked = true; 
		setTimeout(() => {
			this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/chat-detail', this.chat._id]);	
		}, 0);
		
		
	}

}