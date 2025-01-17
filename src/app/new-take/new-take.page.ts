import { Component, ViewChild } from '@angular/core';
import { NavController, IonSelect, ToastController, LoadingController, AlertController, IonContent } from '@ionic/angular';
import { ThreadsService } from '../../app/core/threads.service';
import { AuthService } from '../../app/core/auth.service';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { ITeam } from '../shared/interfaces';
import { AppState } from '../core/state.service';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { TakeService } from '../core/take.service';
import { VideoEditor, TranscodeOptions } from '@ionic-native/video-editor/ngx';
import { File } from '@ionic-native/file/ngx';



import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';




declare var loadImage;

/**
 * Generated class for the NewThreadPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
	selector: 'app-new-take',
	templateUrl: './new-take.page.html',
	styleUrls: ['./new-take.page.scss']
})
export class NewTakePage {



	//video

	yOffset: number = 0;
	videoFile: any;
	progress: number = 0;
	videoFileName: any;
	videoFileType: string;
	threadVideo: SafeResourceUrl;
	videoDuration: number;
	videoHeight: number;
	videoWidth: number;
	videoLoader: any;
	toggleVideo: boolean = false;
	videoThumbnail: any;
	videoTypeThumbnail: string;
	videoNameThumbnail: string;
	video: any;
	signedRequestThumbnailAWS: string
	signedRequestVideoThumbnailAWS: string
	urlVideoThumbnailAWS: string;
	base64VideoThumbnail: any;
	base64Video: any;
	poll: any;
	pictureHeight: number;
	pictureWidth: number;
	link: boolean = false;
	loader: any;
	selection: string = "";
	url: string = "";
	league: string = "";
	count: number = 300;
	take: string = "";
	max: number = 300;
	imgSource: string;
	options: string[] = ["", ""];
	postTeams: any[] = [""];
	pollValue: string = "";

	file: any;
	fileThumbnail: any;
	fileName: string;
	testW: string = "asdasd";
	test: string = "";
	fileType: string;
	fileNameThumbnail: string;
	fileTypeThumbnail: string;
	fileUrlNoSpaces: string;
	threadPicture: any;
	countDescription: number = 500;
	signedRequestAWS: string;

	quill: any;
	draft: boolean = false;
	loadingTeams: boolean = false;
	teams: ITeam[] = [];
	teamsAvailable: boolean = true;
	swipeTimeOut: any;

	urlAWS: string;
	urlThumbnailAWS: string;
	postFlag: boolean;
	toggleProgress: boolean = false;

	canvas: any;
	@ViewChild('leagueSelection', { static: true }) select: IonSelect;
	@ViewChild('createContent', { static: true }) content: IonContent;

	constructor(public navCtrl: NavController,
		private alertCtrl: AlertController,
		private keyboard: Keyboard,
		private camera: Camera,
		private filePlugin: File,
		private toastCtrl: ToastController,
		public global: AppState,
		private videoEditor: VideoEditor,
		private takeService: TakeService,
		private threadService: ThreadsService,
		private authService: AuthService,
		private domSanitazer: DomSanitizer,
		private loadingCtrl: LoadingController,
		private router: Router) {


		let data = authService.paramSignUp;
		this.selection = data;


	}

	canDeactivate(): Promise<boolean> | boolean {

		return true;

	}

	elementFocus(event) {
		let elmt = event.srcElement.id;

		this.content.getScrollElement().then(a => {
			this.yOffset = document.getElementById(elmt).getBoundingClientRect().top - 145 + a.scrollTop;
			if (this.keyboard.isVisible) this.content.scrollToPoint(0, this.yOffset, 300);
			
		})


	}

	keyBooardHandler() {

		window.addEventListener('keyboardDidShow', () => {
			setTimeout(() => {
				this.content.scrollToPoint(0, this.yOffset, 300);
			}, 50);
		});

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
		if (!this.selection) {
			this.goToTabRoot();
			return;
		}

		this.keyBooardHandler()


	}

	customTrackBy(index: number, obj: any): any {
		return index;
	}


	pollTake() {

		this.link = false;
		this.url = "";
		this.deletePicture();
		this.deleteVideo();
		this.poll = true
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

	deleteOption(i: number) {
		this.options.splice(i, 1);
	}

	linkTake() {

		this.link = !this.link;
		this.url = "";
		this.deletePicture();
		this.deleteVideo();
		this.poll = false;
	}


	dismiss() {
		if (this.take.length > 0) {

			this.alertCtrl.create({
				header: 'Do you want to discard your take?',
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
			this.navCtrl.pop();

		}

	}

	wordCount() {
		this.count = this.max - this.take.length;
	}


	deletePicture() {

		this.file = undefined
		this.fileType = undefined
		this.fileName = undefined;
		this.threadPicture = undefined;

	}

	deleteVideo() {



		this.toggleProgress = false;
		this.videoFile = null
		this.videoFileName = null
		this.videoFileType = null
		this.videoDuration = null;
		this.videoHeight = null;
		this.videoWidth = null;

		this.videoThumbnail = null
		this.videoNameThumbnail = null
		this.videoTypeThumbnail = null

		this.base64VideoThumbnail = null
	}

	dataURLtoBlob(dataurl) {
		var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
			bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
		while (n--) {
			u8arr[n] = bstr.charCodeAt(n);
		}
		return new Blob([u8arr], { type: mime });
	}






	onChangeVideo(event: EventTarget) {


		let fileName = this.authService.randomString(7) + this.authService.currentUser.username;
		const options: CameraOptions = {
			destinationType: this.camera.DestinationType.FILE_URI,
			mediaType: this.camera.MediaType.VIDEO,
			sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
			quality: 50
		}


		this.camera.getPicture(options).then((videoData) => {

			let videoDataWithProtocol = videoData.indexOf('file://') == 0 ? videoData : 'file://' + videoData;
			this.progress = 0;
			this.toggleProgress = true;
			//Editarlo y comprimirlo
			this.videoEditor.transcodeVideo({
				fileUri: videoDataWithProtocol,
				outputFileName: fileName,
				saveToLibrary: false,
				outputFileType: 1,
				height: 600,
				progress: (progress: number) => {
					this.progress = Math.round(progress);


				}
			})
				.then((videoTranscoded: string) => {

					let videoTranscodedWithProtocol = videoTranscoded.indexOf('file://') == 0 ? videoTranscoded : 'file://' + videoTranscoded;
					let thumbnailName = this.authService.randomString(7) + this.authService.currentUser.username;

					//crear thumbnail
					this.videoEditor.createThumbnail(
						{
							fileUri: videoTranscodedWithProtocol, // the path to the video on the device
							outputFileName: thumbnailName, // the file name for the JPEG image
							atTime: 0 // optional, location in the video to create the thumbnail (in seconds)
						}
					).then((videoThumbnailUri) => {

						//ya esta el thumbnail y el video y se le agregan el file protocol por si no lo tienen
						let videoThumbnailTranscodedWithProtocol = videoThumbnailUri.indexOf('file://') == 0 ? videoThumbnailUri : 'file://' + videoThumbnailUri;


						var currentVideoName = videoTranscodedWithProtocol.substr(videoTranscodedWithProtocol.lastIndexOf('/') + 1);
						var currentThumbnailName = videoThumbnailTranscodedWithProtocol.substr(videoThumbnailTranscodedWithProtocol.lastIndexOf('/') + 1);


						let dir = videoTranscodedWithProtocol.split('/');
						dir.pop();
						let fromDir = dir.join('/');
						let toDir = this.filePlugin.dataDirectory;

						let dirThumb = videoThumbnailTranscodedWithProtocol.split('/');
						dirThumb.pop();
						let fromDirThumb = dirThumb.join('/');
						let toDirThumb = this.filePlugin.dataDirectory;

						//copy video to app file
						this.filePlugin.copyFile(fromDir, currentVideoName, toDir, currentVideoName).then(success => {

							//copy thumbnail to app file
							this.filePlugin.copyFile(fromDirThumb, currentThumbnailName, toDir, currentThumbnailName).then(success => {

								//read as array video
								this.filePlugin.readAsArrayBuffer(toDir, currentVideoName).then((videoBuffer) => {
									this.videoFile = new Blob([videoBuffer], { type: "video/mp4" });
									this.videoFileName = currentVideoName;
									this.videoFileType = 'video/mp4';

									var reader = new FileReader();
									reader.readAsDataURL(this.videoFile);
									reader.onloadend = () => {
										this.base64Video = reader.result;
										var video = document.createElement('video');
										video.preload = 'metadata';

										video.onloadedmetadata = () => {

											this.videoDuration = video.duration;
											this.videoHeight = video.videoHeight;
											this.videoWidth = video.videoWidth;


											//delete cache
											this.filePlugin.removeFile(this.filePlugin.dataDirectory, currentVideoName).then(() => {


												//delete temporary
												this.filePlugin.removeFile(fromDir, currentVideoName).then(() => {

												})
											})

											//read as array videoThumbnail
											this.filePlugin.readAsArrayBuffer(toDir, currentThumbnailName).then((videoThumbBuffer) => {
												this.videoThumbnail = new Blob([videoThumbBuffer], { type: "image/jpeg" });
												this.videoNameThumbnail = currentThumbnailName;
												this.videoTypeThumbnail = 'image/jpeg'

												var reader = new FileReader();
												reader.readAsDataURL(this.videoThumbnail);
												reader.onloadend = () => {
													this.base64VideoThumbnail = reader.result;
													this.progress = 100;
													setTimeout(() => {
														this.toggleProgress = false;
													}, 300);


												}


												//delete cache
												this.filePlugin.removeFile(this.filePlugin.dataDirectory, currentThumbnailName).then(() => {


													//delete temporary
													this.filePlugin.removeFile(fromDirThumb, currentThumbnailName).then(() => {

													})
												})

												this.link = false;
												this.poll = false;
												this.deletePicture();
												this.url = "";


												if (this.videoDuration > 150) {

													this.deleteVideo();
													this.toastCtrl.create({
														message: "The video duration must be less than 2 minutes and 30 seconds",
														duration: 5000,
														position: 'bottom'
													}).then(toast => toast.present())
												}


											},
												error => {
													this.toggleProgress = false;
													this.toastCtrl.create({
														message: "Error buffering",
														duration: 3000,
														position: 'bottom'
													}).then(toast => toast.present())
												});



										}

										video.src = this.base64Video
									}



								},
									error => {
										this.toggleProgress = false;
										this.toastCtrl.create({
											message: "Error buffering",
											duration: 3000,
											position: 'bottom'
										}).then(toast => toast.present())
									});



							}, error => {

								this.toggleProgress = false;
								this.toastCtrl.create({
									message: "Error copying",
									duration: 3000,
									position: 'bottom'
								}).then(toast => toast.present())
							});



						}, error => {
							this.toggleProgress = false;
							this.toastCtrl.create({
								message: "Error copying",
								duration: 3000,
								position: 'bottom'
							}).then(toast => toast.present())
						});



					}).catch(() => {
						this.toggleProgress = false;
						this.toastCtrl.create({
							message: "Please use another video",
							duration: 3000,
							position: 'bottom'
						}).then(toast => toast.present())
					})




				})
				.catch((error: any) => {

					this.toggleProgress = false;
				})

		}, (err) => {
			this.toggleProgress = false;
			// Handle error
		});



		//Probar en android 



	}


	getDuration() {
		var video = document.createElement('video');
		video.preload = 'metadata';


		video.onloadedmetadata = () => {

			var duration = video.duration;
		}

		video.src = this.base64Video
	}



	imageLoaded(event: any) {

		this.pictureHeight = event.target.height;
		this.pictureWidth = event.target.width;

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
			if (files[0].name.match(/.(webp)$/i)) {
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
				(img: any, data: any) => {
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
											this.link = false;
											this.poll = false;
											this.deleteVideo();
											this.url = "";
											loader.dismiss();

										}, this.fileType);

									}
								},
								{
									maxWidth: 300,
									orientation: 1
								}
							);

						}, this.fileType);

					}
				},
				{
					maxWidth: 800,
					orientation: 1
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



	customTrackByTeams(index: number, obj: any): any {
		return index;
	}


	addPostTeam() {
		this.postTeams.push("");

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

	getSignedRequestVideo(file: File, data: any, fileThumbnail: File) {

		//VIDEO
		this.threadService.getSignedRequest(this.videoFileName, this.videoFileType)
			.subscribe((response: any) => {

				this.signedRequestAWS = response.signedRequest;
				this.urlAWS = response.url;


				//video thumbnail
				this.threadService.getSignedRequest(this.videoNameThumbnail, this.videoTypeThumbnail)
					.subscribe((responseVideoThumb: any) => {
						this.signedRequestVideoThumbnailAWS = responseVideoThumb.signedRequest;
						this.urlVideoThumbnailAWS = responseVideoThumb.url;

						this.uploadVideoFile(data);

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



	uploadVideoFile(data: any) {
		this.authService.uploadFile(this.signedRequestAWS, this.videoFile)
			.subscribe(() => {

				let fileUrlNoSpaces = this.urlAWS.replace(/\s+/g, '+');
				data.video = fileUrlNoSpaces;


				//VIDEO THUMBNAIL
				this.authService.uploadFile(this.signedRequestVideoThumbnailAWS, this.videoThumbnail)
					.subscribe(() => {
						let fileUrlNoSpaces = this.urlVideoThumbnailAWS.replace(/\s+/g, '+');
						data.videoThumbnail = fileUrlNoSpaces;
						data.videoDuration = this.videoDuration;
						data.videoHeight = this.videoHeight;
						data.videoWidth = this.videoWidth;

						//submit normal
						this.takeService.newTake(data)
							.subscribe(({ take, error }: any) => {

								if (take) {


									this.loader.dismiss();
									this.navCtrl.pop();
								} else {
									this.loader.dismiss();
									this.toastCtrl.create({
										message: error,
										duration: 3000,
										position: 'bottom'
									}).then(toast => toast.present())
								}


							},
								(err) => {
									this.loader.dismiss();
									this.toastCtrl.create({
										message: err,
										duration: 3000,
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
						data.pictureHeight = this.pictureHeight
						data.pictureWidth = this.pictureWidth;



						//submit normal
						this.takeService.newTake(data)
							.subscribe(({ take, error }: any) => {

								if (take) {
									this.loader.dismiss();
									this.navCtrl.pop();

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


			if (this.take.length > 300) {
				this.toastCtrl.create({
					message: 'The discussion must have less than 300 characters.',
					duration: 5000,
					position: 'bottom'
				}).then(toast => {
					toast.present();
				})
				this.loader.dismiss();
				return;
			}

			if (this.take && this.authService.isLoggedIn() && this.league) {

				let data;
				if (this.link) {
					//llamar a embedly API

					let encoded = encodeURI(this.url)
					this.takeService.embedlyAPI(encoded)
						.subscribe((response) => {

							let thumbnail = response.thumbnail_url ? response.thumbnail_url.replace(/^http:\/\//i, 'https://') : undefined;
							let favIcon = response.favicon_url ? response.favicon_url.replace(/^http:\/\//i, 'https://') : undefined;

							data = {
								urlType: response.type,
								url: response.url || this.url,
								provider_name: response.provider_name,
								provider_url: response.provider_url.replace(/(^\w+:|^)\/\//, ''),
								html: response.html,
								thumbnail_url: thumbnail,
								league: this.league,
								type: 'Link',
								favicon_url: favIcon,
								htmlWidth: response.width,
								htmlHeight: response.height,
								thumbnail_width: response.thumbnail_width,
								thumbnail_height: response.thumbnail_height,
								teams: teams != null ? teams : undefined,
								take: this.take,
								urlTitle: response.title == "JavaScript is not available." ? response.description : response.title,
								urlDescription: response.description
							}
	
							this.takeService.newTake(data)
								.subscribe(({ take, error }: any) => {

									if (take) {
										this.loader.dismiss();
										this.navCtrl.pop();

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

						},
							(err) => {
								this.loader.dismiss();
								this.toastCtrl.create({
									message: "Invalid URL",
									duration: 3000,
									position: 'bottom'
								}).then(toast => toast.present())

							});  //

				}
				else if (this.poll) {

					if (this.options.length >= 2) {
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

						data = {
							league: this.league,
							type: 'Poll',
							teams: teams != null ? teams : undefined,
							take: this.take,
							pollValues: this.options
						}

						this.takeService.newTake(data)
							.subscribe(({ take, error }: any) => {

								if (take) {
									this.loader.dismiss();
									this.navCtrl.pop();

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



				} else {

					data = {

						league: this.league,
						type: 'Text',
						teams: teams != null ? teams : undefined,
						take: this.take
					}


					if (!!this.videoFile) this.getSignedRequestVideo(this.videoFile, data, this.videoThumbnail);
					else if (!!this.file) this.getSignedRequest(this.file, data, this.fileThumbnail);
					else {
						this.takeService.newTake(data)
							.subscribe(({ take, error }: any) => {

								if (take) {
									this.loader.dismiss();
									this.navCtrl.pop();

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

				}



			} else if (!this.take) {
				this.postFlag = false;
				this.loader.dismiss();
				this.toastCtrl.create({
					message: "Please enter a text",
					duration: 5000,
					position: 'bottom'
				}).then(t => t.present())


			}
		})
	}

}
