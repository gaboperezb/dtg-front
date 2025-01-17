import { Component, ViewChild } from '@angular/core';
import { NavParams, ModalController, AlertController, ToastController, LoadingController } from '@ionic/angular';
import { AppState } from '../../app/core/state.service';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { AuthService } from '../core/auth.service';
import { ThreadDiscussionService } from '../core/thread-discussion.service';

/**
 * Generated class for the AddCommentPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
	selector: 'app-edit-answer',
	templateUrl: './edit-answer.page.html',
	styleUrls: ['./edit-answer.page.scss']
})
export class EditAnswerPage {

	data: any;
	comment: string = "";
	discussionId: any;
	@ViewChild('input') myInput;

	constructor(private navParams: NavParams,
		private modal: ModalController,
		private alertCtrl: AlertController,
		private toastCtrl: ToastController,
		private keyboard: Keyboard,
		private authService: AuthService,
		private threadDiscussionService: ThreadDiscussionService,
		private loadingCtrl: LoadingController,
		public global: AppState) {

		this.data = this.navParams.get('data');
		this.comment = this.data.comment.discussion;
		this.discussionId = this.data.discussionId;


	}

	showKeyboard(e) {
		e.preventDefault();
	}

	dismissModal() {

		this.keyboard.hide();
		setTimeout(() => {
			this.modal.dismiss({
				comment: null
			});
		}, 300);



	}

	send() {

		this.keyboard.hide();
		setTimeout(() => {
			if (this.comment.length > 0) {
				this.loadingCtrl.create({
					spinner: 'crescent',
					cssClass: 'my-custom-loading'
				}).then(loader => {
					loader.present()
					let data = {
						userId: this.authService.currentUser._id,
						discussion: this.comment,
						commentId: this.discussionId,
						answerId: this.data.comment._id
					}	

					this.threadDiscussionService.editAnswer(data)
						.subscribe((comment) => {

							loader.dismiss();
							this.modal.dismiss({
								comment: this.comment
							})
							//dismiss modal
						},
							(err) => {

								loader.dismiss();
								this.toastCtrl.create({
									message: err,
									duration: 3000,
									position: 'top'
								}).then(toast => toast.present())

							})

				})
			}

			else {
				this.toastCtrl.create({
					message: 'Please enter a comment',
					duration: 3000,
					position: 'top',
					cssClass: "toast",
				}).then(toast => toast.present());
			}
		}, 300);

	}

}
