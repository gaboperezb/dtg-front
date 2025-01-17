import { Component, ViewChild } from '@angular/core';
import { ToastController, LoadingController, NavController, IonContent, Platform } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidationService } from '../../app/shared/validation.service';
import { AuthService } from '../core/auth.service';
import { AppState } from '../../app/core/state.service';
import { FcmProvider } from '../../app/core/fcm.service';
import { ThreadsService } from '../../app/core/threads.service';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { ChatService } from '../core/chat.service';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Keyboard } from '@ionic-native/keyboard/ngx';

@Component({
	selector: 'app-signup-global',
	templateUrl: './signup-global.page.html',
	styleUrls: ['./signup-global.page.scss'],
})
export class SignupGlobalPage {

	registerForm: FormGroup;
	loginForm: FormGroup;
	username: string = "";
	title: string = "";
	fromInitialPage: boolean;
	password: string = "";
	loaderInstance: any;
	yOffset: number;
	@ViewChild('signupContent', { static: true }) content: IonContent;


	constructor(
		private router: Router,
		private formBuilder: FormBuilder,
		private authService: AuthService,
		private toastCtrl: ToastController,
		private storage: Storage,
		private inAppBrowser: InAppBrowser,
		public loadingCntrl: LoadingController,
		public global: AppState,
		private inAppBroswer: InAppBrowser,
		private fcm: FcmProvider,
		private threadsService: ThreadsService,
		private navCtrl: NavController,
		private statusBar: StatusBar,
		private chatService: ChatService,
		private keyboard: Keyboard,
		private platform: Platform,
		private appVersion: AppVersion) {

		this.title = this.authService.paramSignUp.type;
		this.fromInitialPage = this.authService.paramSignUp.fromInitialPage;

		this.buildForm();
		this.buildLogin();

	}


	ngOnInit() {
		this.statusBar.styleLightContent();
		if (this.platform.is('android')) {
			this.statusBar.backgroundColorByHexString('#21253C')
		}
	}


	openLink(type: string) {

		let url;
		if (type == 'privacy') url = 'https://www.discussthegame.com/legal/privacy-policy';
		else {
			url = "https://www.discussthegame.com/legal/terms-of-use"
		}

		const browser = this.inAppBrowser.create(url, '_system');
	}

	forgot() {

		let url = 'https://www.discussthegame.com/pwd-forgot';
		const browser = this.inAppBroswer.create(url, '_system');
	}

	buildForm() {
		this.registerForm = this.formBuilder.group({
			username: ["", [Validators.required, ValidationService.usernameValidator]],
			email: ["", [Validators.required, ValidationService.emailValidator]],
			password: ["", [Validators.required, ValidationService.passwordValidator]],
			confirmPassword: ["", Validators.required]

		});

	}


	buildLogin() {
		this.loginForm = this.formBuilder.group({
			email: ["", [Validators.required]],
			password: ["", [Validators.required, ValidationService.passwordValidator]],

		});
	}


	elementFocus(event) {
		let elmt = event.srcElement.id;

		this.content.getScrollElement().then(a => {

			let yOffset = document.getElementById(elmt).getBoundingClientRect().top - 75 + a.scrollTop;


			if (this.keyboard.isVisible) {

				this.content.scrollToPoint(0, yOffset, 500);


			}
			else {
				setTimeout(() => {
					this.content.scrollToPoint(0, yOffset, 500);
				}, 600);
			}

		})

	}


	submit(formValues: any) {

		this.storage.get('blocked').then((value) => {

			if (!value) {
				this.appVersion.getVersionNumber().then(val => {

					formValues.username = formValues.username.toLowerCase();
					formValues.email = formValues.email.toLowerCase();
					formValues.versionNumber = val;
					if (formValues.password != formValues.confirmPassword) {
						this.toastCtrl.create({
							message: "The passwords don't match",
							duration: 3000,
							position: 'top'
						}).then(toast => toast.present())

						return false;
					}

					if (formValues.username.length > 20) {
						this.toastCtrl.create({
							message: "The username is too long",
							duration: 3000,
							position: 'top'
						}).then(toast => toast.present())
						return false;
					}

					//Loader


					this.loadingCntrl.create({
						spinner: 'crescent'
					})
						.then(load => {
							load.present();
							this.authService.signup(formValues)
								.subscribe((data: { error: string, user: any }) => {
									if (data.user) {
										this.fcm.grantPermission();
										this.fcm.getToken();
										if (this.threadsService.leagues.length > 1 && this.authService.currentUser.leagues.length == 0) {
											let data = {
												leagues: this.threadsService.leagues.filter(league => league != 'TOP')
											}
											this.authService.saveLeagues(data)
												.subscribe((leagues) => { },
													(err) => { })
										}
										this.chatService.getChats(0);
										this.chatService.connection()
										load.dismiss().then(() => {


											if (this.fromInitialPage) {
												setTimeout(() => {
													this.navCtrl.navigateRoot('/')
												}, 200);

											}
											else {
												//REGRESAR CHECK_DTG
												this.navCtrl.navigateForward('/');
											}
										})
									} else {
										this.toastCtrl.create({
											message: data.error,
											duration: 3000,
											position: 'top'
										}).then(toast => toast.present())

										load.dismiss();

									}

								},
									(err) => {
										this.toastCtrl.create({
											message: err,
											duration: 3000,
											position: 'top'
										}).then(toast => toast.present())

										this.loaderInstance.dismiss();

									});


						}
						)
				})

			} else {
				this.toastCtrl.create({
					message: `You have been banned from DiscussTheGame.`,
					duration: 8000,
					position: 'top'
				}).then(toast => toast.present());
			}
		})


	}


	submitLogin(formValues: any) {

		this.storage.get('blocked').then((value) => {

			if (!value) {

				//Loader

				this.loadingCntrl.create({
					spinner: 'crescent',

				}).then(load => {
					load.present();
					this.authService.login(formValues)
						.subscribe((data: { token: string, user: any, error: string }) => {
							if (data.user) {

								this.fcm.grantPermission();
								this.fcm.getToken();

								if (this.threadsService.leagues.length > 1 && this.authService.currentUser.leagues.length == 0) {
									let data = {
										leagues: this.threadsService.leagues.filter(league => league != 'TOP')
									}
									this.authService.saveLeagues(data)
										.subscribe((leagues) => { },
											(err) => { })
								}

								this.chatService.getChats(0);
								this.chatService.connection()
								load.dismiss().then(() => {
									if (this.fromInitialPage) {
										setTimeout(() => {
											this.navCtrl.navigateRoot('/')
										}, 200);

									}
									else {
										//REGRESAR CHECK_DTG
										this.navCtrl.navigateForward('/');
									}
								})



							} else {
								this.toastCtrl.create({
									message: data.error,
									duration: 3000,
									position: 'top'
								}).then(toast => toast.present())

								load.dismiss();

							}

						},
							(err) => {
								this.toastCtrl.create({
									message: err,
									duration: 3000,
									position: 'top'
								}).then(toast => toast.present())
								this.loaderInstance.dismiss();

							});

				})

			} else {
				this.toastCtrl.create({
					message: `You have been banned from DiscussTheGame.`,
					duration: 8000,
					position: 'top'
				}).then(toast => toast.present());
			}
		})





	}

}
