import { Component } from '@angular/core';
import { NavController, LoadingController, AlertController, ModalController, Platform } from '@ionic/angular';
import { AuthService } from '../../app/core/auth.service';

import { LevelsPage } from '../levels/levels.page';
import { Router } from '@angular/router';
import { AppState } from '../core/state.service';
import { FcmProvider } from '../core/fcm.service';
import { ChatService } from '../core/chat.service';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { ThreadsService } from '../core/threads.service';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { ChooseLeaguesPage } from '../choose-leagues/choose-leagues.page';

/**
 * Generated class for the EditPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
	selector: 'app-edit',
	templateUrl: './edit.page.html',
	styleUrls: ['./edit.page.scss']
})
export class EditPage {

	scrollTO: any;
	nightMode: boolean = false;
	dmsOpen: boolean = false;
	swipeTimeOut: any;

	constructor(public navCtrl: NavController,
		private authService: AuthService,
		private loadingCtrl: LoadingController,
		private alertCtrl: AlertController,
		private statusBar: StatusBar,
		private threadsService: ThreadsService,
		private modalCtrl: ModalController,
		private router: Router,
		private platform: Platform,
		private inAppBrowser: InAppBrowser,
		public global: AppState,
		private fcm: FcmProvider,
		private chatService: ChatService) {

		this.nightMode = this.global.state['theme'] == 'light' ? false : true;
		this.dmsOpen = this.authService.currentUser.dmsOpen;

	}




	goBack() {

		this.authService.addurl = false;
		this.navCtrl.pop();
		
	}


	toggleDMS() {

		this.fcm.impact('light');
		let header = this.dmsOpen ? "Users won't be able to send you direct messages or add you to group chats if you do not follow them" : "Users will be able to send you direct messages or add you to group chats if you do not follow them"
		this.alertCtrl.create({
			header,
			buttons: [
				{
					text: 'Cancel',
					role: 'cancel',
					handler: () => {
						this.dmsOpen = !this.dmsOpen;
					}
				},
				{
					text: 'Ok',
					handler: () => {
						//toggle
						this.authService.allowDMS()
						.subscribe(() => {
						
							this.authService.currentUser.dmsOpen = !this.authService.currentUser.dmsOpen;
						})
						
					}
				}
			]
		}).then(alert => alert.present())

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
			
			modal.present();
			modal.onDidDismiss()
				.then(() => {
					this.threadsService.populateMenu()
				})
		})



	}


	favTeams() {
		this.navCtrl.navigateForward(this.router.url.substr(0, 10) + '/teams');
	}



	itemSelected(action) {

		let data = {
			action: action
		}

		this.authService.paramSignUp = data;
		this.navCtrl.navigateForward(this.router.url.substr(0, 10) + '/edit-form');
	}

	

	levelsInfo() {

		this.modalCtrl.create({
			component: LevelsPage
		}).then(modal => {
			modal.present()
		})

	}

	openLink(type: string) {
		

		let url;

		if (type == 'privacy') url = 'https://www.discussthegame.com/legal/privacy-policy';
		else if(type == 'terms') {
			url = "https://www.discussthegame.com/legal/terms-of-use"
		} else if(type == 'rules') {
			url = "https://www.discussthegame.com/legal/rules"
		} else {
			url = "https://www.discussthegame.com/legal/guidelines"
		}

		 const browser = this.inAppBrowser.create(url, '_system');

		
	}

	ionViewDidLeave() {

		
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


	logout() {
		this.alertCtrl.create({
			header: 'Do you want to sign out?',
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

						this.loadingCtrl.create({
							spinner: 'crescent',
							cssClass: 'my-custom-loading'
						}).then(loader => {
							loader.present();
							this.chatService.chats = [];
							this.chatService.channelMessages = [];
							this.authService.logOut();
							loader.dismiss();
						})
						this.navCtrl.pop();
					}
				}
			]
		}).then(alert => alert.present())
	}
}
