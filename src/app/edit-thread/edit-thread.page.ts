import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController, ToastController } from '@ionic/angular';
import { IThread, ITeam } from '../../app/shared/interfaces';
import { ThreadsService } from '../../app/core/threads.service';
import * as _ from 'lodash';
import { AuthService } from '../../app/core/auth.service';
import { AppState } from '../core/state.service';

/**
 * Generated class for the EditThreadPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


@Component({
	selector: 'app-edit-thread',
	templateUrl: './edit-thread.page.html',
	styleUrls: ['./edit-thread.page.scss']
})
export class EditThreadPage {

	countDescription: number;
	selection: string = "";
	url: string = "";
	league: string = "";
	count: number = 120;
	title: string = "";
	description: string = "";
	max: number = 120;
	thread: IThread;
	originalThread: IThread;
	scrollTO: any;
	teams: ITeam[] = [];
	postTeams: any[] = [""];
	teamsAvailable: boolean = true;

	constructor(public navCtrl: NavController,
		private loadingCtrl: LoadingController,
		private toastCtrl: ToastController,
		public global: AppState,
		private threadsService: ThreadsService,
		private alertCtrl: AlertController,
		private authService: AuthService
	) {


		let data = _.cloneDeep(this.authService.paramSignUp);
		this.selection = data.selection;
		this.thread = data.thread;
		this.originalThread = this.authService.paramSignUp.thread;
		


	}

	ngOnInit() {

		this.wordCount();
		this.getTeams(this.thread.league);
		
	}

	customTrackByTeams(index: number, obj: any): any {
		return index;
	}

	addPostTeam() {
		this.postTeams.push("");
	}


	deletePostTeam(i: number) {

		if(this.postTeams.length > 1) this.postTeams.splice(i, 1);
		else {
			this.postTeams[i] = "";
		}
		
	}

	selectChange(e) {
		this.getTeams(e.detail.value);
	}


	getTeams(league: string) {
		
		this.postTeams = [""];
		this.authService.getAllTeams(league)
			.subscribe((teams: ITeam[]) => {

				if(teams.length == 0) this.teamsAvailable = false;
				else {
					this.teamsAvailable = true;
				}
				teams.sort((a, b) => (a.teamName > b.teamName) ? 1 : -1)
				this.teams = teams;
				
				if(this.thread.teams.length) {
					this.postTeams = this.thread.teams.map(t => {
						return teams.find(t2 => t2._id == t).teamName
					});
					
				}

			},
				(err) => {
				
					this.toastCtrl.create({
						message: 'Error loading teams, please try again later',
						duration: 3000,
						position: 'bottom',
						cssClass: "toast",
					}).then(toast => toast.present());

				})
	}


	goBack() {

		this.authService.addurl = false;
		this.navCtrl.pop();
		
	}

	
	dismiss() {

		this.alertCtrl.create({
			header: 'Do you want to discard your changes?',
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
						this.navCtrl.pop();
					}
				}
			]
		}).then(a => a.present())



	}


	submit() {

		if(this.thread.description) {
			if(this.thread.description.trim().length < 600) {
				this.toastCtrl.create({
					message: 'The description text must have at least 600 characters.',
					duration: 5000,
					position: 'bottom'
				}).then(toast => {
					toast.present();
				})
				
				return;
			}
		}

		this.postTeams = this.postTeams.filter(t => t.length)
		let teams = null;

		if(this.postTeams.length && this.postTeams[0].length) {
			teams = this.postTeams.map((t) => {
				return this.teams.find(t2 => t2.teamName == t)._id

			})
		}
	

		this.loadingCtrl.create({
			spinner: 'crescent',
			cssClass: 'my-custom-loading'
		}).then(loader => {
			loader.present()
			let data = {
				userId: this.authService.currentUser._id,
				league: this.thread.league,
				title: this.thread.title,
				description: this.thread.description,
				url: this.thread.url ? this.thread.url : undefined,
				teams: teams != null ? teams : []

			}
			
			this.threadsService.edit(this.thread._id, data)
				.subscribe((thread) => {

					loader.dismiss();
					this.originalThread.title = this.thread.title;
					this.originalThread.description = this.thread.description;
					this.originalThread.league = this.thread.league;
					this.originalThread.url = this.thread.url ? this.thread.url : undefined;
					this.navCtrl.pop();
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

	wordCount() {
		this.count = this.max - this.thread.title.length;
	}

	

}
