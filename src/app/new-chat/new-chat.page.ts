import { Component, ViewChild, OnInit, ElementRef } from '@angular/core';
import { ModalController, ToastController, AlertController, LoadingController, IonSearchbar, NavParams } from '@ionic/angular';
import { AuthService } from '../core/auth.service';
import { FormControl } from '@angular/forms';
import { IUserDB } from '../shared/interfaces';
import { ChatService } from '../core/chat.service';
import { AppState } from '../core/state.service';


declare var SendBird;

@Component({
	selector: 'app-new-chat',
	templateUrl: './new-chat.page.html',
	styleUrls: ['./new-chat.page.scss'],
})
export class NewChatPage implements OnInit {

	recipients: any[] = [];
	searchTerm: string = '';
	trimSearchTerm: string = "";
	items: any;
	users: IUserDB[] = [];
	followers: IUserDB[] = [];
	searchControl: FormControl;
	searching: boolean = true;
	skip: number = 0;
	skipFollowers: number = 0;
	enableInfinite: boolean = false;
	scrollTO: any;
	data: any;
	addPeople: boolean;
	chatType: string = "";

	@ViewChild(IonSearchbar, { static: true }) search: IonSearchbar;

	constructor(private navParams: NavParams, 
		private loadingCtrl: LoadingController, 
		private alertCtrl: AlertController, 
		private chatService: ChatService, 
		private el: ElementRef, 
		private modal: ModalController, 
		private authService: AuthService, 
		public global: AppState,
		private toastCtrl: ToastController) {

		this.data = this.navParams.get('data');
		this.addPeople = this.data.addPeople;
	}

	ngOnInit() {
		setTimeout(() => {
			this.getFollowers();
		}, 500);
	}

	dismissModal() {

		this.modal.dismiss({
			chat: null
		});

	}


	handleChat() {

		if (this.addPeople) {
			this.addPeopleToGroup();
		} else {
			this.startChat();
		}

	}

	addUser($event, user) {

		if (!user.active) {
			
			if (this.recipients.length > 74 ) {
				this.toastCtrl.create({
					message: "Group chats should have less than 75 members",
					duration: 5000,
					position: 'bottom'
				}).then(toast => toast.present())
				user.active = false;
				return;
			}


			if(this.addPeople) {
				
				if(this.data.membersIds.indexOf(user._id) > -1) {
					this.toastCtrl.create({
						message: user.username + " is already a member",
						duration: 5000,
						position: 'bottom'
					}).then(toast => toast.present())
					return;
				}

				if(this.recipients.length + this.data.membersIds.length > 74) {
					this.toastCtrl.create({
						message: "Group chats should have less than 75 members",
						duration: 5000,
						position: 'bottom'
					}).then(toast => toast.present())
					return;
				}
				
			}

			if(this.recipients.length) {
				if(!this.recipients.some(member => member._id == user._id)) this.recipients.push(user)
				else {
					this.toastCtrl.create({
						message: "You can't add a user twice",
						duration: 5000,
						position: 'bottom'
					}).then(toast => toast.present())
				}
			} else {
				this.recipients.push(user)
			}

			user.active = true;
			
			
			setTimeout(() => {
				var elmnt = this.el.nativeElement.querySelectorAll('.to-padding');
				elmnt[0].scrollLeft += 1000;
			}, 0);
		} else {
			this.recipients = this.recipients.filter(recipient => recipient.username != user.username)
			user.active = false;
		}

		this.search.value = "";
	}


	addPeopleToGroup() {

		this.loadingCtrl.create({
			spinner: 'crescent',
			cssClass: 'my-custom-loading'
		}).then(loader => {

			let newMembers = this.recipients.filter(recipient => {
				return this.data.membersIds.indexOf(recipient._id) < 0;
			})
			if(newMembers.length == 0) {
				this.toastCtrl.create({
					message: "You can't add a user that's already in the chat",
					duration: 5000,
					position: 'bottom'
				}).then(toast => toast.present())
				loader.dismiss()
				return;
			}
			let members = newMembers.map((recipient) => {
				return {
					username: recipient.username,
					id: recipient._id
				}
			})

			let data = {
				members
			}


			let newMembersIds = newMembers.map(m => m._id);
			let checkLength = this.data.membersIds.concat(newMembersIds);


			//checar si ya fueron elimidaos (solo si es publico)
			for (let index = 0; index < newMembersIds.length; index++) {
				const element = newMembersIds[index];
				 if (this.data.removed.some(member => member == element) && this.data.public) {

					this.toastCtrl.create({
						message: "You cannot add users to public chats who have previously been removed. If you want to add a user that has been previously removed, make this chat private",
						duration: 7000,
						position: 'bottom'
					}).then(toast => toast.present())
					loader.dismiss()
					return;
					
				}

			}

			if (checkLength.length > 75) {
				this.toastCtrl.create({
					message: "Chat groups should have less than 75 members",
					duration: 5000,
					position: 'bottom'
				}).then(toast => toast.present())
				loader.dismiss()
				
				return;
			}

			//eliminar duplicados
			this.chatService.addPeopleToChat(data, this.data.chat)
				.subscribe((message) => {

					loader.dismiss()
					this.modal.dismiss({
						message,
						newMembers
					});

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

	startChat() {

	
		if (this.recipients.length > 75) {
			this.toastCtrl.create({
				message: "Chat groups should have less than 75 members",
				duration: 3000,
				position: 'bottom'
			}).then(toast => toast.present())
		}

		let members = this.recipients.map((recipient) => {
			return recipient._id
		})
		if (members.length > 1) {
			this.alertCtrl.create({
				header: 'How do you want to call this group?',
				inputs: [
					{
						name: 'groupName',
						placeholder: 'Group name'


					}
				],
				buttons: [
					{
						text: 'Create group',
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
								
								members.push(this.authService.currentUser._id);
								let unreadMessages = members.map(member => {
									return {
										user: member,
										unreadMessageCount: 0,
										muted: false
									}
								})
								let data = {
									members,
									operatorsIds: [this.authService.currentUser._id],
									name: a.groupName[0].toUpperCase() + a.groupName.slice(1),
									coverUrl: 'assets/imgs/group.png',   // or .coverUrl = COVER_URL
									customType: 'general-group',
									unreadMessages
								}

								this.chatService.createChat(data)
									.subscribe((chat: any) => {
										loader.dismiss();
										chat.members = this.recipients;
										this.modal.dismiss({
											chat
										});
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
					},
					{
						text: 'Cancel',
						role: 'cancel',
						handler: data => {

						}
					}
				]
			}).then(alert => alert.present())
		} else {

			this.loadingCtrl.create({
				spinner: 'crescent',
				cssClass: 'my-custom-loading'
			}).then(loader => {
				loader.present();

				members.push(this.authService.currentUser._id)
				let data: any = {
					customType: '1-1',
					members,
					operatorsIds: [this.authService.currentUser._id]
				}

				this.chatService.checkChat(data)
					.subscribe((chat) => {

						loader.dismiss();
						if (chat) {
							this.modal.dismiss({
								chat
							});
						} else {
							data.recipient = this.recipients[0];
							let provChat = data;
							this.modal.dismiss({
								provChat
							});
						}

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


	getFollowers() {

		this.skipFollowers = 0;
		this.authService.getFollowers(0, this.authService.currentUser._id)
			.subscribe((data: any) => {
				this.followers = data.followers;
				if (this.users.length == 0) this.users = data.followers;
				this.searching = false;
				if (data.followers.length < 20) this.enableInfinite = false;
				else {
					this.enableInfinite = true;
				}

			},
				(err) => {
					this.searching = false;
					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'bottom'
					}).then(toast => toast.present())

				});
	}

	getMoreFollowers(infiniteScroll) {

		this.authService.getFollowers(this.skipFollowers, this.authService.currentUser._id)
			.subscribe((data: any) => {
				let followers = data.followers.filter(element => element._id != this.authService.currentUser._id);;
				let newTimelinesArray = this.followers.concat(followers);

				//Eliminar duplicados. Esto sucede porque continuamente se agregan discusiones a la base de datos; el skip genera esto.
				var unique = newTimelinesArray.filter((item, i, array) => {
					return array.findIndex((item2: any) => { return item2._id == item._id }) === i;
				})
				this.followers = unique;
				this.users = unique;

				infiniteScroll.target.complete();
				if (data.followers.length < 20) this.enableInfinite = false;


			},
				(err) => {
					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'bottom'
					}).then(toast => toast.present())
					infiniteScroll.target.complete();
				});

	}

	searchUsers() {

		this.skip = 0;
		this.authService.searchUsers(this.trimSearchTerm, this.skip)
			.subscribe((users: any) => {

				let usersF = users.filter(user => user._id != this.authService.currentUser._id);
				this.searching = false;
				this.users = usersF;
				if (users.length < 20) this.enableInfinite = false;
				else {
					this.enableInfinite = true;
				}

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

		this.authService.searchUsers(this.trimSearchTerm, this.skip)
			.subscribe((users: any) => {
				let usersF = users.filter(user => user._id != this.authService.currentUser._id);
				this.users = this.users.concat(usersF);
				infiniteScroll.target.complete();
				if (users.length < 20) this.enableInfinite = false;

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

	onSearchInput(event) {

		this.enableInfinite = false;
		this.searching = true;
		let searchTerm = event.detail.value;

		this.trimSearchTerm = searchTerm.replace(/ /g, '');
		if (this.trimSearchTerm.length == 0) {
			this.searching = false;
			this.users = this.followers;
			this.enableInfinite = true;
			return
		}
		this.searchUsers();


	}

	doInfinite(infiniteScroll) {


		if (this.trimSearchTerm.length > 0) {
			this.skip += 20;
			this.searchMoreUsers(infiniteScroll);
		} else {
			this.skipFollowers += 20;
			this.getMoreFollowers(infiniteScroll);
		}


	}

}
