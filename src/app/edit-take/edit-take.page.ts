import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/auth.service';
import * as _ from 'lodash';
import { ITake, ITeam } from '../shared/interfaces';
import { ToastController, NavController, LoadingController } from '@ionic/angular';
import { TakeService } from '../core/take.service';
import { AppState } from '../core/state.service';

@Component({
	selector: 'app-edit-take',
	templateUrl: './edit-take.page.html',
	styleUrls: ['./edit-take.page.scss'],
})
export class EditTakePage implements OnInit {

	take: ITake;
	takeText: string = "";
	originalTake: ITake;
	count: number = 300;
	league: string = "";
	max: number = 300;
	teams: ITeam[] = [];
	postTeams: any[] = [""];
	teamsAvailable: boolean = true;
	url: string = "";
	link: boolean = false;

	constructor(private authService: AuthService,
		private toastCtrl: ToastController,
		private takeService: TakeService,
		public global: AppState,
		private loadingCtrl: LoadingController,
		private navCtrl: NavController) {

		let data = _.cloneDeep(this.authService.paramSignUp);
		this.take = data.take;
		this.originalTake = this.authService.paramSignUp.take;
		if (this.take.url) this.link = true;

	}

	ngOnInit() {
		this.wordCount();
		this.getTeams(this.take.league);
	}

	dismiss() {

		this.authService.addurl = false;
		this.navCtrl.pop();

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

	selectChange(e) {
		this.getTeams(e.detail.value);
	}

	wordCount() {
		this.count = this.max - this.take.take.length;
	}

	getTeams(league: string) {

		this.postTeams = [""];
		this.authService.getAllTeams(league)
			.subscribe((teams: ITeam[]) => {

				if (teams.length == 0) this.teamsAvailable = false;
				else {
					this.teamsAvailable = true;
				}
				teams.sort((a, b) => (a.teamName > b.teamName) ? 1 : -1)
				this.teams = teams;

				if (this.take.teams.length) {
					this.postTeams = this.take.teams.map(t => {
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

	submit() {

		if (this.take.take) {
			if (this.take.take.length > 300) {
				this.toastCtrl.create({
					message: 'The discussion text must have less than 300 characters.',
					duration: 5000,
					position: 'bottom'
				}).then(toast => {
					toast.present();
				})

				return;
			}
		} else {
			this.toastCtrl.create({
				message: 'Please add a text to the discussion.',
				duration: 5000,
				position: 'bottom'
			}).then(toast => {
				toast.present();
			})
			return;
		}

		this.postTeams = this.postTeams.filter(t => t.length)
		let teams = null;
		

		if (this.postTeams.length && this.postTeams[0].length) {
			teams = this.postTeams.map((t) => {
				return this.teams.find(t2 => t2.teamName == t)._id

			})
		}


		this.loadingCtrl.create({
			spinner: 'crescent',
			cssClass: 'my-custom-loading'
		}).then(loader => {
			loader.present()

			if (this.link) {
				//llamar a embedly API
				

				let encoded = encodeURIComponent(this.take.url)
				this.takeService.embedlyAPI(encoded)
					.subscribe((response) => {
						let data;
						data = {
							userId: this.authService.currentUser._id,
							urlType: response.type,
							url: response.url || this.take.url,
							provider_name: response.provider_name,
							provider_url: response.provider_url.replace(/(^\w+:|^)\/\//, ''),
							html: response.html,
							thumbnail_url: response.thumbnail_url,
							league: this.take.league,
							type: 'Link',
							htmlWidth: response.width,
							htmlHeight: response.height,
							thumbnail_width: response.thumbnail_width,
							thumbnail_height: response.thumbnail_height,
							teams: teams != null ? teams : undefined,
							take: this.take.take,
							urlTitle: response.title,
							urlDescription: response.description
						}

						this.takeService.edit(this.take._id, data)
							.subscribe((take) => {

								loader.dismiss();
								this.originalTake.take = this.take.take;
								this.originalTake.league = this.take.league;
								this.originalTake.url = this.take.url
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

					},
						(err) => {
							loader.dismiss();
							this.toastCtrl.create({
								message: "Invalid URL",
								duration: 3000,
								position: 'bottom'
							}).then(toast => toast.present())

						});  //

			} else {

				let data = {
					userId: this.authService.currentUser._id,
					league: this.take.league,
					teams: teams != null ? teams : undefined,
					take: this.take.take
				}

				this.takeService.edit(this.take._id, data)
				.subscribe((take) => {

					loader.dismiss();
					this.originalTake.take = this.take.take;
					this.originalTake.league = this.take.league;
					this.originalTake.url = this.take.url
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

				

			}

		})



	}

}
