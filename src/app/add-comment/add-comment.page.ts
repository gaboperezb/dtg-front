import { Component, ViewChild } from '@angular/core';
import { NavParams, ModalController, AlertController, ToastController, IonTextarea } from '@ionic/angular';
import { AppState } from '../../app/core/state.service';
import { Keyboard } from '@ionic-native/keyboard/ngx';

/**
 * Generated class for the AddCommentPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
	selector: 'app-add-comment',
	templateUrl: './add-comment.page.html',
	styleUrls: ['./add-comment.page.scss'] 
})
export class AddCommentPage {

	data: any;
	illusion: boolean = true
	comment: string = "";
	@ViewChild('commentInput', { static: true }) myInput: IonTextarea;

	constructor(private navParams: NavParams,
		private modal: ModalController,
		private alertCtrl: AlertController,
		private toastCtrl: ToastController,
		private keyboard: Keyboard,
		public global: AppState) {

		this.data = this.navParams.get('data');

	}

	ngOnInit() {
		setTimeout(() => {
			this.myInput.setFocus()
		}, 700);
		
	}

	ionViewDidEnter() {
		this.illusion = false
	}
	
	showKeyboard(e) {
		e.preventDefault();
	}

	dismissModal() {

		this.keyboard.hide();	
		setTimeout(() => {
			if (this.comment.length > 0) {
				this.alertCtrl.create({
					header: 'Do you want to discard your comment?',
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

								this.modal.dismiss({

									comment: null
								});
							}
						}
					]
				}).then(alert => alert.present())


			} else {
				this.modal.dismiss({

					comment: null

				});
			}
		}, 200);


	}

	send() {

		this.keyboard.hide();
		setTimeout(() => {
			if (this.comment.length > 0) this.modal.dismiss({

				comment: this.comment

			}
			);
			else {
				this.toastCtrl.create({
					message: 'Please enter a comment',
					duration: 3000,
					position: 'top',
					cssClass: "toast",
				}).then(toast => toast.present());
			}
		}, 200);

	}

}
