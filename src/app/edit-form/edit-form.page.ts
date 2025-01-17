import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, ToastController, AlertController, Platform } from '@ionic/angular';
import { AuthService } from '../../app/core/auth.service';
import { AppState } from '../core/state.service';
import { FcmProvider } from '../core/fcm.service';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Storage } from '@ionic/storage';
import { Device } from '@ionic-native/device/ngx';

declare var loadImage;


@Component({
	selector: 'app-edit-form',
	templateUrl: './edit-form.page.html',
	styleUrls: ['./edit-form.page.scss'],
})


export class EditFormPage implements OnInit {

	action: string = "";
	file: File;
	fileType: string;
	fileName: string;
	fileThumbnail: File;
	fileTypeThumbnail: string;
	fileNameThumbnail: string;
	profilePicture: any = "";
	loader: any;
	coverPhoto: any;
	count: number = 150;
	max: number = 150;
	username: string = "";
	scrollTO: any;

	currentPassword: string = "";
	bio: string = "";
	newPassword: string = "";
	confirmPassword: string = "";
	automaticMode: boolean = false;
	darkBlue: boolean = false;
	darkBlack: boolean = false;
	darkMode: boolean = false;
	androidVersion: number = 0;
	iosVersion: number = 0;



	constructor(public navCtrl: NavController,
		
		private loadingCtrl: LoadingController,
		public authService: AuthService,
		public global: AppState,
		private storage: Storage,
		private platform: Platform,
		private fcm: FcmProvider,
		private device: Device,
		private statusBar: StatusBar,
		private alertCtrl: AlertController,
		private toastCtrl: ToastController) {

		let data = this.authService.paramSignUp;
		this.action = data.action;

		this.storage.get('systemMode').then((val) => {
			if (!!val) {
				this.automaticMode = true;
			}
		});

		this.storage.get('initial').then((val) => {
			if (!!val) {
				if (val == 'dark' || val == 'black') {
					this.darkMode = true;
				} else {
					this.darkMode = false;
				}
			}
		});

		this.storage.get('darkTheme').then((val) => {

			if (!!val) {
				if (val == 'dark') {
					this.darkBlue = true;
				} else if (val == 'black') {
					this.darkBlack = true;
				}

			}
		});

	}

	ngOnInit() {

		this.initialSettings();
		this.count = this.max - this.bio.length;
		if (this.platform.is('android')) {
			this.androidVersion = +this.device.version
		}

		if (this.platform.is('ios')) {
			this.iosVersion = +this.device.version
		}
		
	}

	goBack() {

		this.authService.addurl = false;
		this.navCtrl.pop();

	}

	toggleSystemMode() {


		if (this.automaticMode) {
			this.storage.remove('systemMode');
			this.darkMode = false;
			this.toggleDarkMode('light')
		}
		else {
			this.fcm.impact('light');
			this.storage.set('systemMode', '1');
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
			this.updateDOMMode(prefersDark.matches);

		}
	}

	updateDOMMode(shouldAdd) {
	
		if (this.darkBlack) {
			if (shouldAdd) this.global.set('theme', 'black')
			else {
				this.global.set('theme', 'light')
			}
		} else {
			if (shouldAdd) this.global.set('theme', 'dark')
			else {
				this.global.set('theme', 'light')
			}
		}
		
	}

	toggleDarkMode(style?: string) { //style para reiniciar cuadno se desactive system mode

		this.fcm.impact('light');
		let theme = this.darkMode ? 'light' : 'dark';
		console.log(theme)

		if (theme == 'light' || style == 'light') {
			this.statusBar.styleDefault();
			if (this.platform.is('android')) {
				this.statusBar.backgroundColorByHexString('#edeff1')
			}

		}
		else {
			this.statusBar.styleLightContent();
			if (this.platform.is('android')) {
				if (this.darkBlue) {
					this.statusBar.backgroundColorByHexString('#21253C')
				}
				else if (this.darkBlack) {
					this.statusBar.backgroundColorByHexString('#000000')
				}
			}
		}

		if (theme == 'light' || style == 'light') this.global.set('theme', 'light');
		else {
			if (this.darkBlack) {
				this.global.set('theme', 'black');
			} else {
				this.global.set('theme', 'dark');
			}
		}

	}



	toggleBlackTheme() {
		this.fcm.impact('light');
		if (this.darkMode) {
			if (this.darkBlack) {
				
				this.darkBlue = true;
				this.statusBar.styleLightContent();
				if (this.platform.is('android')) {
					this.statusBar.backgroundColorByHexString('#21253C')
				}
				this.global.set('theme', 'dark');
			}
			else {
				this.darkBlue = false;
				this.statusBar.styleLightContent();
				if (this.platform.is('android')) {
					this.statusBar.backgroundColorByHexString('#000000')
				}
				this.global.set('theme', 'black');
			}
		} else if (this.automaticMode) {

			if (this.darkBlack) {
				
				this.darkBlue = true;
				if (window.matchMedia('(prefers-color-scheme: dark)').matches) { // se cambia solo si es de noche
					this.statusBar.styleLightContent();
					if (this.platform.is('android')) {
						this.statusBar.backgroundColorByHexString('#21253C')
					}
					this.global.set('theme', 'dark');
				}
			}
			else {
				this.darkBlue = false;
				if (window.matchMedia('(prefers-color-scheme: dark)').matches) { // se cambia solo si es de noche
					this.statusBar.styleLightContent();
					if (this.platform.is('android')) {
						this.statusBar.backgroundColorByHexString('#000000')
					}
					this.global.set('theme', 'black');
				}
			}

		} else {
			if (this.darkBlack) {
				this.darkBlue = true;
				this.storage.set('darkTheme', 'dark');
				
			}  else {
				this.darkBlue = false;
				this.storage.set('darkTheme', 'black');
			}


		}

	}

	toggleDarkTheme() {
		this.fcm.impact('light');
		if (this.darkMode) {
			if (this.darkBlue) {
				
				this.darkBlack = true;
				this.statusBar.styleLightContent();
				if (this.platform.is('android')) {
					this.statusBar.backgroundColorByHexString('#000000')
				}
				this.global.set('theme', 'black');
			}
			else {
				this.darkBlack = false;
				this.statusBar.styleLightContent();
				if (this.platform.is('android')) {
					this.statusBar.backgroundColorByHexString('#21253C')
				}
				this.global.set('theme', 'dark');
			}
		} else if (this.automaticMode) {

			if (this.darkBlue) {
				
				this.darkBlack = true;
				if (window.matchMedia('(prefers-color-scheme: dark)')) { // se cambia solo si es de noche
					this.statusBar.styleLightContent();
					if (this.platform.is('android')) {
						this.statusBar.backgroundColorByHexString('#000000')
					}
					this.global.set('theme', 'black');
				}
			}
			else {
				this.darkBlack = false;
				if (window.matchMedia('(prefers-color-scheme: dark)')) { // se cambia solo si es de noche
					this.statusBar.styleLightContent();
					if (this.platform.is('android')) {
						this.statusBar.backgroundColorByHexString('#21253C')
					}
					this.global.set('theme', 'dark');
				}
			}

		} else {
			if (this.darkBlue) {
				this.darkBlack = true;
				this.storage.set('darkTheme', 'black');
				
			}  else {
				this.darkBlack = false;
				this.storage.set('darkTheme', 'dark');
			}


		}

	}



	initialSettings() {
		this.profilePicture = this.authService.currentUser.profilePicture;
		if (this.authService.currentUser.bio) this.bio = this.authService.currentUser.bio;
		if (!!this.authService.currentUser.coverPhoto) {
			this.coverPhoto = {
				'background-image': 'url(' + this.authService.currentUser.coverPhoto + ')',
			}
		} else {
			this.coverPhoto = {
				'border': '1px dashed #b7b7b7',
				'border-radius': '10px',

			}
		}

	}

	wordCount() {
		this.count = this.max - this.bio.length;
	}


	onChange(event: EventTarget) {


		let loader = this.loadingCtrl.create({
			spinner: 'crescent',
			cssClass: 'my-custom-loading'
		}).then(loader => {
			loader.present()
			if (this.action != 'profile') {


				let eventObj: MSInputMethodContext = <MSInputMethodContext>event;
				let target: HTMLInputElement = <HTMLInputElement>eventObj.target;
				let files: FileList = target.files;
				this.file = files[0];
				this.fileType = this.file.type;
				this.fileName = this.authService.randomString(7) + this.authService.currentUser.username + '.' + this.file.type.split('/')[1];

				if (!this.file.name.match(/.(jpg|jpeg|png)$/i)) {
					this.file = undefined;
					this.toastCtrl.create({
						message: "Not an image",
						duration: 3000,
						position: 'bottom'
					}).then(t => t.present())

					return;
				}

				if (FileReader && files && files.length) {
					var fr = new FileReader();
					fr.onload = () => {

						this.coverPhoto = {
							'background-image': 'url(' + fr.result + ')',
						}


					}
					fr.readAsDataURL(files[0]);
				}

				let maxWidth = 1000;

				//External library (orientation=true desactiva el exif data)
				loadImage(
					this.file,
					(img: any) => {
						if (img.type === "error") {
							loader.dismiss();
							this.toastCtrl.create({
								message: "Error loading image",
								duration: 3000,
								position: 'bottom'
							}).then(t => t.present())

						} else {

							img.toBlob((blob: any) => {
								this.file = blob;
								loader.dismiss();

							}, this.fileType);

						}
					},
					{
						maxWidth: maxWidth,
						orientation: true
					}
				);
				// FileReader support (Para cargar la imagen en el img tag)
				if (this.file == null) {

					this.toastCtrl.create({
						message: "No file selected",
						duration: 3000,
						position: 'bottom'
					}).then(t => t.present())

				}


			} else {


				let eventObj: MSInputMethodContext = <MSInputMethodContext>event;
				let target: HTMLInputElement = <HTMLInputElement>eventObj.target;
				let files: FileList = target.files;
				if (!files[0].name.match(/.(jpg|jpeg|png)$/i)) {
					this.toastCtrl.create({
						message: "Not an image",
						duration: 3000,
						position: 'bottom'
					}).then(t => t.present())

					return;
				}
				this.file = files[0];
				this.fileThumbnail = files[0];
				this.fileType = this.file.type;
				this.fileTypeThumbnail = this.fileType;
				this.fileName = this.authService.randomString(7) + this.authService.currentUser.username + '.' + this.file.type.split('/')[1];
				this.fileNameThumbnail = this.authService.randomString(7) + "-thumb" + this.authService.currentUser.username + '.' + this.file.type.split('/')[1];


				if (FileReader && files && files.length) {
					var fr = new FileReader();
					fr.onload = () => {
						this.profilePicture = fr.result;
					}
					fr.readAsDataURL(files[0]);
				}

				//External library (orientation=true desactiva el exif data)
				loadImage(
					this.file,
					(img: any) => {
						if (img.type === "error") {
							loader.dismiss();
							this.toastCtrl.create({
								message: "Error loading image",
								duration: 3000,
								position: 'bottom'
							}).then(t => t.present())

						} else {

							img.toBlob((blob: any) => {
								this.file = blob;

								//THUMBNAIL
								loadImage(
									this.fileThumbnail,
									(img: any) => {
										if (img.type === "error") {
											loader.dismiss();
											this.toastCtrl.create({
												message: "Error loading image",
												duration: 3000,
												position: 'bottom'
											}).then(t => t.present())

										} else {

											img.toBlob((blob: any) => {
												this.fileThumbnail = blob;
												loader.dismiss();

											}, this.fileType);

										}
									},
									{
										maxWidth: 160,
										orientation: true
									}
								);

							}, this.fileType);

						}
					},
					{
						maxWidth: 500,
						orientation: true
					}
				);
				// FileReader support (Para cargar la imagen en el img tag)


				if (this.file == null) {

					this.toastCtrl.create({
						message: "No file selected",
						duration: 3000,
						position: 'bottom'
					}).then(t => t.present())

				}

			}
		})




	}

	getSignedRequestProfile() {

		//NORMAL IMAGE
		this.authService.getSignedRequest(this.fileName, this.fileType)
			.subscribe((response: any) => {

				let signedRequestAWS = response.signedRequest;
				let urlAWS = response.url;

				//THUMBNAIL IMAGE
				this.authService.getSignedRequest(this.fileNameThumbnail, this.fileTypeThumbnail)
					.subscribe((responseThumb: any) => {
						let signedRequestThumbnailAWS = responseThumb.signedRequest;
						let urlThumbnailAWS = responseThumb.url;

						this.uploadFileProfile(this.file, signedRequestAWS, urlAWS, this.fileName, this.fileThumbnail, signedRequestThumbnailAWS, urlThumbnailAWS, this.fileNameThumbnail);

					},
						(err) => {
							this.loader.dismiss();
							this.toastCtrl.create({
								message: err,
								duration: 3000,
								position: 'bottom'
							}).then(t => t.present())

						});

			},
				(err) => {
					this.loader.dismiss();
					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'bottom'
					}).then(t => t.present())

				});


	}


	getSignedRequest() {
		this.authService.getSignedRequest(this.fileName, this.fileType)
			.subscribe((response: any) => {
				let signedRequest = response.signedRequest;
				let url = response.url;
				this.uploadFile(this.file, signedRequest, url, this.fileName);

			},
				(err) => {

					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'bottom'
					}).then(t => t.present())



				});


	}



	uploadFileProfile(file: File, signedRequest: string, url: string, fileName: string, fileThumbnail: File, signedRequestThumbnail: string, urlThumbnail: string, fileNameThumbnail: string,) {

		let userPicture;
		let userPictureThumbnail;

		//DRY
		if (this.authService.currentUser.profilePicture == "assets/imgs/user.png") {
			userPicture = "user.png";
			userPictureThumbnail = "user.png";
		} else {
			userPicture = this.authService.currentUser.profilePictureName ? this.authService.currentUser.profilePictureName : 'user.png';
			userPictureThumbnail = this.authService.currentUser.profilePictureNameThumbnail ? this.authService.currentUser.profilePictureNameThumbnail : 'user.png';
		}

		this.authService.deleteProfilePicture(userPicture, userPictureThumbnail)
			.subscribe((deleted: boolean) => {

				this.authService.uploadFile(signedRequest, file)
					.subscribe(() => {

						//submit
						this.authService.uploadFile(signedRequestThumbnail, fileThumbnail)
							.subscribe(() => {


								let fileUrlNoSpaces = url.replace(/\s+/g, '+');
								let fileUrlNoSpacesThumbnail = urlThumbnail.replace(/\s+/g, '+');
								let data = {
									profilePicture: fileUrlNoSpaces,
									profilePictureName: fileName,
									profilePictureThumbnail: fileUrlNoSpacesThumbnail,
									profilePictureNameThumbnail: fileNameThumbnail,

								}

								//submit
								this.authService.editUserInfo(data)
									.subscribe((data: { error: any, user: any }) => {
										if (data.user) {
											this.authService.currentUser = data.user;

											this.loader.dismiss();
											this.navCtrl.pop();
										} else {

											this.toastCtrl.create({
												message: data.error,
												duration: 3000,
												position: 'bottom'
											}).then(t => t.present())

											this.navCtrl.pop();

										};
									},
										(err) => {
											this.toastCtrl.create({
												message: err,
												duration: 3000,
												position: 'bottom'
											}).then(t => t.present())

											this.loader.dismiss();

										});  //no se pudo actualizar info

							},
								(err) => {
									this.toastCtrl.create({
										message: err,
										duration: 3000,
										position: 'bottom'
									}).then(t => t.present())

									this.loader.dismiss();

								});  //no se pudo subir thumbnail



					},
						(err) => {

							this.toastCtrl.create({
								message: err,
								duration: 3000,
								position: 'bottom'
							}).then(t => t.present())

							this.loader.dismiss();

						});  //no se pudo subir el archivo a aws



			},
				(err) => {
					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'bottom'
					}).then(t => t.present())

					this.loader.dismiss();

				});  //no se pudo eliminar el archivo a aws





	}


	uploadFile(file: File, signedRequest: string, url: string, fileName: string) {

		let coverPhoto;

		coverPhoto = this.authService.currentUser.coverPhotoName ? this.authService.currentUser.coverPhotoName : 'no.png';


		this.authService.deleteCoverPhoto(coverPhoto)
			.subscribe((deleted: boolean) => {
				this.authService.uploadFile(signedRequest, file)
					.subscribe(() => {
						let fileUrlNoSpaces = url.replace(/\s+/g, '+');
						let data = {
							profilePicture: fileUrlNoSpaces,
							profilePictureName: fileName,
							coverPhoto: fileUrlNoSpaces,
							coverPhotoName: fileName,
						}

						data.profilePicture = undefined;
						data.profilePictureName = undefined;




						//submit
						this.authService.editUserInfo(data)
							.subscribe((data: { error: any, user: any }) => {
								if (data.user) {
									this.authService.currentUser = data.user;

									this.loader.dismiss();
									this.navCtrl.pop();
								} else {

									this.toastCtrl.create({
										message: data.error,
										duration: 3000,
										position: 'bottom'
									}).then(t => t.present())

									this.loader.dismiss();

								};
							},
								(err) => {
									this.toastCtrl.create({
										message: err,
										duration: 3000,
										position: 'bottom'
									}).then(t => t.present())

									this.loader.dismiss();

								});  //no se pudo actualizar info
					},
						(err) => {

							this.toastCtrl.create({
								message: err,
								duration: 3000,
								position: 'bottom'
							}).then(t => t.present())

							this.loader.dismiss();

						});  //no se pudo subir el archivo a aws



			},
				(err) => {
					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'bottom'
					}).then(t => t.present())

					this.loader.dismiss();

				});  //no se pudo eliminar el archivo a aws

	}

	changePassword(data: any) {

		if (data.newPassword != data.confirmPassword) {
			this.toastCtrl.create({
				message: "Passwords don't match",
				duration: 3000,
				position: 'bottom'
			}).then(t => t.present())

			this.loader.dismiss();
			return false;
		}
		this.authService.changePassword(data)
			.subscribe((data: any) => {
				if (data.passwordChanged) {
					this.loader.dismiss();
					this.navCtrl.pop();
				} else {
					this.toastCtrl.create({
						message: "The password you entered is incorrect",
						duration: 3000,
						position: 'bottom'
					}).then(t => t.present())

					this.loader.dismiss();

				}

			},
				(err) => {
					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'bottom'
					}).then(t => t.present())

					this.loader.dismiss();

				});



	}


	editUser(data: any) {

		this.authService.editUserInfo(data)
			.subscribe((data: { error: any, user: any }) => {
				if (data.user) {
					this.authService.currentUser = data.user;
					this.toastCtrl.create({
						message: "Your profile has been successfully modified",
						duration: 3000
					}).then(toast => toast.present())
					this.loader.dismiss();
					this.navCtrl.pop();
				} else {

					this.toastCtrl.create({
						message: data.error,
						duration: 3000,
						position: 'bottom'
					}).then(t => t.present())

					this.loader.dismiss();

				};
			},
				(err) => {
					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'bottom'
					}).then(t => t.present())

					this.loader.dismiss();

				});
	}


	submit() {
		this.loadingCtrl.create({
			spinner: 'crescent',
			message: 'Updating..',
			cssClass: 'my-custom-loading'
		}).then(loader => {
			this.loader = loader;
			this.loader.present();
			if (this.action == 'bio') {

				if (this.bio.length > 150) {
					this.loader.dismiss();
					return;
				};
				let data = {
					bio: this.bio
				}
				this.editUser(data);
			}
			else if (this.action == 'username') {
				if (this.username.length > 20) {

					this.toastCtrl.create({
						message: "Please enter a valid username",
						duration: 3000,
						position: 'top'
					}).then(toast => toast.present())
					this.loader.dismiss();
					return;
				}



				if (this.username.length == 0) {
					this.toastCtrl.create({
						message: "Please add a new username",
						duration: 3000,
						position: 'top'
					}).then(toast => toast.present())
					this.loader.dismiss();
					return;
				}

				if (this.username.match(/^[a-zA-Z0-9_]{1,21}$/)) {

				} else {
					let error = `Please enter a valid username. Don't add special symbols or spaces`;
					this.toastCtrl.create({
						message: error,
						duration: 3000,
						position: 'top'
					}).then(toast => toast.present())
					this.loader.dismiss();
					return;
				}

				this.loader.dismiss();
				this.alertCtrl.create({
					message: "Do you want to change your username to " + this.username + "?",
					buttons: [
						{
							text: 'Cancel',
							role: 'cancel',
							handler: () => {

							}
						},
						{
							text: 'Change',
							handler: () => {

								this.loadingCtrl.create({
									spinner: 'crescent',
									message: 'Updating..'
								}).then(loader => {
									this.loader = loader;
									this.loader.present();
									let data = {
										username: this.username
									}

									this.editUser(data);
								})


							}
						}
					]
				}).then(alert => alert.present());


			}
			else if (this.action != 'password') {
				if (this.authService.isLoggedIn()) {

					if (!!this.file && this.action != 'profile') this.getSignedRequest();
					if (!!this.file && this.action == 'profile') this.getSignedRequestProfile();


				}

			} else {

				if (this.currentPassword && this.confirmPassword && this.newPassword) {

					let data = {
						currentPassword: this.currentPassword,
						newPassword: this.newPassword,
						confirmPassword: this.confirmPassword
					}

					this.changePassword(data);

				}



			}
		})




	}

}
