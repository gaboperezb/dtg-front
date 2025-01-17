import { Component, ViewChild } from '@angular/core';
import { NavController, IonSelect, ToastController, LoadingController, AlertController, IonContent } from '@ionic/angular';
import { ThreadsService } from '../../app/core/threads.service';
import { AuthService } from '../../app/core/auth.service';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { ITeam } from '../shared/interfaces';
import { AppState } from '../core/state.service';
import { Keyboard } from '@ionic-native/keyboard/ngx';



declare var loadImage;

/**
 * Generated class for the NewThreadPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
	selector: 'app-new-thread',
	templateUrl: './new-thread.page.html',
	styleUrls: ['./new-thread.page.scss']
})
export class NewThreadPage {

	loader: any;
	selection: string = "";
	url: string = "";
	league: string = "";
	count: number = 120;
	title: string = "";
	description: string = "";
	max: number = 120;
	imgSource: string;
	options: string[] = [];
	postTeams: any[] = [""];
	pollValue: string = "";
	file: File;
	fileThumbnail: File;
	fileName: string;
	testW: string = "asdasd";
	test: string = "";
	fileType: string;
	fileNameThumbnail: string;
	fileTypeThumbnail: string;
	fileUrlNoSpaces: string;
	threadPicture: any;
	countDescription: number = 600;
	signedRequestAWS: string;
	signedRequestThumbnailAWS: string
	quill: any;
	draft: boolean = false;
	loadingTeams: boolean = false;
	teams: ITeam[] = [];
	teamsAvailable: boolean = true;
	swipeTimeOut: any;

	urlAWS: string;
	urlThumbnailAWS: string;
	postFlag: boolean;

	canvas: any;
	@ViewChild('leagueSelection', { static: true }) select: IonSelect;
	@ViewChild('createContent', { static: true }) content: IonContent;

	constructor(public navCtrl: NavController,
		private alertCtrl: AlertController,
		private keyboard: Keyboard,
		private toastCtrl: ToastController,
		public global: AppState,
		private threadService: ThreadsService,
		private storage: Storage,
		private authService: AuthService,
		private loadingCtrl: LoadingController,
		private router: Router) {


		let data = authService.paramSignUp;
		this.selection = data;
		if (this.selection == 'poll') this.options = ["", ""]

	}

	canDeactivate(): Promise<boolean> | boolean {

		return true;
	}

	elementFocus(event) {
		let elmt = event.srcElement.id;

		this.content.getScrollElement().then(a => {

			let yOffset = document.getElementById(elmt).getBoundingClientRect().top - 150 + a.scrollTop;


			if (this.keyboard.isVisible) this.content.scrollToPoint(0, yOffset, 300);
			else {
				setTimeout(() => {
					this.content.scrollToPoint(0, yOffset, 300);
				}, 600);
			}

		})





	}




	url_domain(data: any) {


		var a = document.createElement('a');
		a.href = data;
		return a.hostname;
	}

	ionViewDidLeave() {

		this.content.scrollY = false;
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
	
	goToTabRoot() {
		this.navCtrl.navigateRoot(this.router.url.substr(0, 10))
	}

	ngOnInit() {


		if(!this.selection) {
		
                this.goToTabRoot()
                return // cordova kill
           
		}

		if (this.selection == 'text' || this.selection == 'poll') {

			this.storage.get('draft').then((value) => {
				if (!!value) {
					this.description = value;
					this.draft = true;
					this.storage.get('draft-title').then((value) => {
						if (!!value) {
							this.title = value;
						}
					})
				}
			})

		} 

	}

	saveDraft() {
		this.storage.set('draft', this.description);
		this.storage.set('draft-title', this.title);
		this.toastCtrl.create({
			message: "Your draft has been saved",
			duration: 3000,
			position: 'top'
		}).then(toast => toast.present())
		this.draft = true;

	}

	deleteDraft() {


		this.alertCtrl.create({
			header: 'Do you want to delete your draft?',
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
						this.storage.set('draft', '');
						this.storage.set('title', '');
						this.toastCtrl.create({
							message: "Draft deleted",
							duration: 3000,
							position: 'top'
						}).then(toast => toast.present())
						this.description = "";
						this.title = "";
						this.draft = false;
					}
				}
			]
		}).then(a => a.present());

	}


	dismiss() {
		if (this.title.length > 0 || this.description.length > 0 || this.url.length > 0 || this.file) {

			this.storage.get('draft').then((value) => {
				if (!value) {
					this.alertCtrl.create({
						header: 'Do you want to discard your post?',
						buttons: [
							{
								text: 'Cancel',
								role: 'cancel',
								handler: () => {
								}
							},
							{
								text: 'Discard',
								handler: () => {
									setTimeout(() => {
										this.navCtrl.pop();
									}, 200);

								}
							}
						]
					}).then(a => a.present());
				} else {

					setTimeout(() => {
						this.navCtrl.pop();
					}, 200);

				}
			})




		} else {
			this.navCtrl.pop();

		}

	}

	wordCount() {
		this.count = this.max - this.title.length;
	}

	wordCountDescription() {
		this.countDescription = (600 - this.description.length) > 0 ? 600 - this.description.length : -1;
	}

	deletePicture() {

		this.file = undefined
		this.fileType = undefined
		this.fileName = undefined;
		this.threadPicture = undefined;

	}



	blobToFile = (theBlob: Blob, fileName: string): File => {
		var b: any = theBlob;
		//A Blob() is almost a File() - it's just missing the two properties below which we will add
		b.lastModifiedDate = new Date();
		b.name = fileName;

		//Cast to a File() type
		return <File>theBlob;
	}

	onChange(event: EventTarget) {

		this.loadingCtrl.create({
			spinner: 'crescent',
			cssClass: 'my-custom-loading'
		}).then(loader => {
			loader.present()

			let eventObj: MSInputMethodContext = <MSInputMethodContext>event;
			let target: HTMLInputElement = <HTMLInputElement>eventObj.target;
			let files: FileList = target.files;
			if (!files[0].name.match(/.(jpg|jpeg|png)$/i)) {
				this.toastCtrl.create({
					message: "Format not supported",
					duration: 3000,
					position: 'bottom'
				}).then(toast => toast.present())
				loader.dismiss();
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
					this.threadPicture = fr.result;
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
						}).then(toast => toast.present())

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
										}).then(toast => toast.present())

									} else {

										img.toBlob((blob: any) => {
											this.fileThumbnail = blob;
											loader.dismiss();

										}, this.fileType);

									}
								},
								{
									maxWidth: 300,
									orientation: true
								}
							);

						}, this.fileType);

					}
				},
				{
					maxWidth: 800,
					orientation: true
				}
			);
			// FileReader support (Para cargar la imagen en el img tag)


			if (this.file == null) {

				this.toastCtrl.create({
					message: "No file selected",
					duration: 3000,
					position: 'bottom'
				}).then(toast => toast.present())

			}
		})




	}

	customTrackBy(index: number, obj: any): any {
		return index;
	}

	customTrackByTeams(index: number, obj: any): any {
		return index;
	}

	addOption() {
		if (this.options.length < 6) this.options.push("");
		else {
			this.toastCtrl.create({
				message: "You have reached the maximum number of options for your poll",
				duration: 4000,
				position: 'bottom'
			}).then(toast => toast.present())

		}
	}

	addPostTeam() {
		this.postTeams.push("");

	}

	deleteOption(i: number) {
		this.options.splice(i, 1);
	}


	deletePostTeam(i: number) {

		if (this.postTeams.length > 1) this.postTeams.splice(i, 1);
		else {
			this.postTeams[i] = "";
		}

	}


	getTeams(league: string) {
		this.loadingTeams = true;
		this.postTeams = [""];

		this.authService.getAllTeams(league)
			.subscribe((teams: ITeam[]) => {

				if (teams.length == 0) this.teamsAvailable = false;
				else {
					this.teamsAvailable = true;
				}
				teams.sort((a, b) => (a.teamName > b.teamName) ? 1 : -1)
				this.teams = teams;

				setTimeout(() => {
					this.loadingTeams = false;
				}, 300);

			},
				(err) => {
					this.loadingTeams = false;
					this.toastCtrl.create({
						message: 'Error loading teams, please try again later',
						duration: 3000,
						position: 'bottom',
						cssClass: "toast",
					}).then(toast => toast.present());

				})
	}


	getSignedRequest(file: File, data: any, fileThumbnail: File) {

		//NORMAL IMAGE
		this.threadService.getSignedRequest(this.fileName, this.fileType)
			.subscribe((response: any) => {


				this.signedRequestAWS = response.signedRequest;
				this.urlAWS = response.url;

				//THUMBNAIL IMAGE
				this.threadService.getSignedRequest(this.fileNameThumbnail, this.fileTypeThumbnail)
					.subscribe((responseThumb: any) => {
						this.signedRequestThumbnailAWS = responseThumb.signedRequest;
						this.urlThumbnailAWS = responseThumb.url;

						this.uploadFile(this.file, this.signedRequestAWS, this.urlAWS, data, this.fileThumbnail, this.signedRequestThumbnailAWS, this.urlThumbnailAWS);

					},
						(err) => {
							this.loader.dismiss();
							this.toastCtrl.create({
								message: err,
								duration: 3000,
								position: 'bottom'
							}).then(toast => toast.present())

						});

			},
				(err) => {
					this.loader.dismiss();
					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'bottom'
					}).then(toast => toast.present())

				});


	}

	uploadFile(file: File, signedRequest: string, url: string, data: any, fileThumbnail: File, signedRequestThumbnail: string, urlThumbnail: string) {
		this.authService.uploadFile(signedRequest, file)
			.subscribe(() => {

				//THUMBNAIL
				this.authService.uploadFile(signedRequestThumbnail, fileThumbnail)
					.subscribe(() => {
						let fileUrlNoSpaces = url.replace(/\s+/g, '+');
						data.picture = fileUrlNoSpaces;
						let fileUrlNoSpacesThumbnail = urlThumbnail.replace(/\s+/g, '+');
						data.thumbnail = fileUrlNoSpacesThumbnail;

					

							//submit normal
							this.threadService.newThread(data)
								.subscribe(({ thread, error }: any) => {

									if (thread) {
										this.loader.dismiss();
										this.navCtrl.pop();
										this.storage.set('draft', '');
										this.storage.set('draft-title', '');
									} else {
										this.loader.dismiss();
										this.toastCtrl.create({
											message: error,
											duration: 5000,
											position: 'bottom'
										}).then(toast => toast.present())
									}
								},
									(err) => {
										this.loader.dismiss();
										this.toastCtrl.create({
											message: err,
											duration: 5000,
											position: 'bottom'
										}).then(toast => toast.present())

									});  //no se pudo actualizar info

						

					},

						(err) => {
							this.loader.dismiss();
							this.toastCtrl.create({
								message: err,
								duration: 3000,
								position: 'bottom'
							}).then(toast => toast.present())

						});  //no se pudo subir el archivo a aws(thumbnail)






			},
				(err) => {
					this.loader.dismiss();
					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'bottom'
					}).then(toast => toast.present())

				});  //no se pudo subir el archivo a aws

	}


	selectChange(e) {
		if (this.postFlag) this.submit();
		this.getTeams(e.detail.value);
	}

	selectCancel() {
		this.postFlag = false;
	}


	submit() {

		this.postFlag = true;
		let teams = null;
		this.postTeams = this.postTeams.filter(t => t.length)
		if (this.postTeams.length && this.postTeams[0].length) {
			teams = this.postTeams.map((t) => {
				return this.teams.find(t2 => t2.teamName == t)._id
			})
		}

		if (!this.league) {
			this.select.open();
			return;
		}

		this.loadingCtrl.create({
			spinner: 'crescent',
			message: 'Posting..',
			cssClass: 'my-custom-loading'
		}).then(loader => {
			this.loader = loader;
			this.loader.present();

			if (this.selection == 'text') {

				if (this.description.trim().length < 600) {
					this.toastCtrl.create({
						message: 'The description text must have at least 600 characters.',
						duration: 5000,
						position: 'bottom'
					}).then(toast => {
						toast.present();
					})
					this.loader.dismiss();
					return;
				}

				if (this.title && this.description && this.authService.isLoggedIn() && this.league) {
					let data = {
						title: this.title,
						description: this.description,
						league: this.league,
						type: 'General',
						teams: teams != null ? teams : undefined

					}

					if (!!this.file) this.getSignedRequest(this.file, data, this.fileThumbnail);
					else {
						this.threadService.newThread(data)
							.subscribe(({ thread, error }: any) => {

								if (thread) {
									this.loader.dismiss();
									this.navCtrl.pop();
									this.storage.set('draft', '');
									this.storage.set('draft-title', '');
								} else {
									this.loader.dismiss();

									this.toastCtrl.create({
										message: error,
										duration: 5000,
										position: 'bottom'
									}).then(toast => {
										toast.present();
									})


								}

							},

								(err) => {
									this.loader.dismiss();
									this.toastCtrl.create({
										message: err,
										duration: 5000,
										position: 'bottom'
									}).then(toast => toast.present())

								});  //no se pudo subir el archivo a mlab

					}

				} else if (!this.title) {
					this.postFlag = false;
					this.loader.dismiss();
					this.toastCtrl.create({
						message: "Please enter a title",
						duration: 5000,
						position: 'bottom'
					}).then(t => t.present())


				} else {
					this.postFlag = false;
					this.loader.dismiss();
					this.toastCtrl.create({
						message: "Please enter a description",
						duration: 5000,
						position: 'bottom'
					}).then(t => t.present())

				}

			} else if (this.selection == 'poll') {

				if (this.description.length < 600) {
					this.toastCtrl.create({
						message: 'The description text must have at least 600 characters.',
						duration: 5000,
						position: 'bottom'
					}).then(toast => {
						toast.present();
					})
					this.loader.dismiss();
					return;
				}
				if (!this.description.replace(/\s/g, '')) {
					this.loader.dismiss();
					this.toastCtrl.create({
						message: "Please add a description",
						duration: 5000,
						position: 'bottom'
					}).then(t => t.present())

					return;
				}

				if (this.title && this.description && this.league && this.options.length >= 2 && this.authService.isLoggedIn()) {
					for (let index = 0; index < this.options.length; index++) {
						const element = this.options[index];

						if (element.length <= 1) {
							this.loader.dismiss();
							this.toastCtrl.create({
								message: "Poll options must contain at least 2 characters",
								duration: 5000,
								position: 'bottom'
							}).then(t => t.present())

							return;

						} else if (element.length == 0) {
							this.options.splice(index, 1);

						}

					}
					let data = {
						title: this.title,
						description: this.description,
						pollValues: this.options,
						league: this.league,
						type: 'Poll',
						teams: teams != null ? teams : undefined
					}

					if (!!this.file) this.getSignedRequest(this.file, data, this.fileThumbnail);
					else {
						this.threadService.newThread(data)
							.subscribe(({ thread, error }: any) => {

								if (thread) {
									this.loader.dismiss();
									this.navCtrl.pop();
								} else {
									this.loader.dismiss();
									this.toastCtrl.create({
										message: error,
										duration: 5000,
										position: 'bottom'
									}).then(t => t.present())


								}
							},

								(err) => {
									this.loader.dismiss();
									this.toastCtrl.create({
										message: err,
										duration: 5000,
										position: 'bottom'
									}).then(t => t.present())

								});  //no se pudo subir el archivo a mlab

					}

				} else if (!this.title) {
					this.postFlag = false;
					this.loader.dismiss();
					this.toastCtrl.create({
						message: "Please enter a title",
						duration: 5000,
						position: 'bottom'
					}).then(t => t.present())


				} else {
					this.postFlag = false;
					this.loader.dismiss();
					this.toastCtrl.create({
						message: "Please enter a description",
						duration: 5000,
						position: 'bottom'
					}).then(t => t.present())

				}

			} 



		})




	}

}
