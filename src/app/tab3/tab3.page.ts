import { Component } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { Router } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { SignupAppPage } from '../signup-app/signup-app.page';
import { AppState } from '../core/state.service';
import { Storage } from '@ionic/storage';

@Component({
	selector: 'app-tab3',
	templateUrl: 'tab3.page.html',
	styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

	showHelper: boolean;
	post: boolean = false;

	constructor(public global: AppState,
		private navCtrl: NavController,
		private authService: AuthService,
		private router: Router,
		private modalCtrl: ModalController,
		private storage: Storage) {

	}

	ngOnInit() {
		this.storage.get('create-helper').then((val) => {
			if (!val) this.showHelper = true;

		})
	}

	ionViewWillEnter() {
		this.showTabs()

	}

	public showTabs() {
		const tabBar = document.getElementById('myTabBar');
		if (tabBar !== null && tabBar.style.display !== 'flex') tabBar.style.display = 'flex';
	}

	hideHelper() {
		this.storage.set('create-helper', '1');
		this.showHelper = false;
	}

	openType() {

		this.post = true;

	}

	closeType() {
		this.post = false;
	}

	createTake() {


		if (this.authService.isLoggedIn()) {
			let selection = 'take';
			this.authService.paramSignUp = selection;
			this.navCtrl.navigateForward(this.router.url.substr(0, 10) + '/new-take');

		} else {
			let data = {
				message: 'Sign up to create a take!',
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


	create(e: any, type: string) {
		e.stopPropagation()
		this.post = false;

		setTimeout(() => {
			if (this.authService.isLoggedIn()) {

				let selection = type;
				this.authService.paramSignUp = selection;
				this.navCtrl.navigateForward(this.router.url.substr(0, 10) + '/new-thread');

			} else {
				let data = {
					message: 'Sign up to create a post!',
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
		}, 300);


	}
}
