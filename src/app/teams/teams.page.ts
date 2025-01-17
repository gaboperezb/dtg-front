import { Component, OnInit, ElementRef } from '@angular/core';
import { NavController, ToastController, LoadingController } from '@ionic/angular';
import { ThreadsService } from '../core/threads.service';
import { AuthService } from '../core/auth.service';
import { ITeam } from '../shared/interfaces';

import * as _ from 'lodash';
import { AppState } from '../core/state.service';

@Component({
	selector: 'app-teams',
	templateUrl: './teams.page.html',
	styleUrls: ['./teams.page.scss'],
})
export class TeamsPage implements OnInit {


	leagues: string[] = [];
	teamLeagues = ['NBA', 'NFL', 'Soccer', 'MLB', 'NHL', 'NCAAF', 'NCAAB']
	filterBy: any;
	teams: ITeam[] = [];
	teamsToShow = [];
	wait: boolean = true;
	favAllTeams: ITeam[] = [];
	favMainTeams: ITeam[] = []; //UNO DE CADA LIGA
	warning: boolean = false;

	emptyLeagues = [];
	contextLeagues = [];
	subLeaguesCategories = [];
	filterBySub = "ALL";

	constructor(private navCtrl: NavController,
		private toastCtrl: ToastController,
		private el: ElementRef,
		public global: AppState,
		private loadingCtrl: LoadingController,
		private threadsService: ThreadsService,
		private authService: AuthService) { }

	ngOnInit() {
		this.leagues = this.threadsService.leagues.filter((league) => {
			return this.teamLeagues.indexOf(league) > -1
		})
		this.emptyLeagues = this.leagues.concat();
		this.filterBy = this.leagues.length > 0 ? this.leagues[0] : null;
		setTimeout(() => {
			if (this.filterBy != null) this.getTeams(this.filterBy);
		}, 400);

		this.initialPopulation();

	}

	
	dismiss() {
		this.navCtrl.pop();
	}


	subLeagues(teams, league) {


		this.contextLeagues = _.groupBy(teams, league);
		this.subLeaguesCategories = Object.keys(this.contextLeagues);
		this.filterBySub = this.subLeaguesCategories[0];
		this.selectContextLeague(this.filterBySub)
	}

	selectContextLeague(league: string) {

		this.filterBySub = league;
		this.teamsToShow = this.contextLeagues[league];
	}


	initialPopulation() {

		this.favAllTeams = this.authService.currentUser.favAllTeams.concat();
	}


	addTeam(team: any) {

		if (team.selected) {
			this.favAllTeams = this.favAllTeams.filter(teamToDelete => teamToDelete._id != team._id);
			team.selected = false;

		} else {

			this.favAllTeams.push(team);
			team.selected = true;
			setTimeout(() => {
				var elmnt = this.el.nativeElement.querySelectorAll('.fav-padding');
				elmnt[0].scrollLeft += 1000;
			}, 0);
		}

	}


	updateTeams() {

		this.loadingCtrl.create({
			spinner: 'crescent',
			cssClass: 'my-custom-loading'
		}).then(loader => {
			loader.present()
			let favAllTeams = this.favAllTeams.map(t => t._id);
			let data = {
				favAllTeams
			}

			this.authService.updateTeams(data)
				.subscribe((user: any) => {
					loader.dismiss()
					this.favAllTeams.forEach(f => {
						delete f.selected
					})
					this.authService.currentUser.favAllTeams = this.favAllTeams;
					this.navCtrl.pop();
				},
					(err) => {
						loader.dismiss()
						this.toastCtrl.create({
							message: err,
							duration: 3000,
							position: 'bottom',
							cssClass: "toast",
						}).then(toast => toast.present());
					})
		})


	}


	getTeams(league: string) {
		this.wait = true;
		this.filterBy = league;

		this.authService.getAllTeams(league)
			.subscribe((teams: ITeam[]) => {

				for (let index = 0; index < teams.length; index++) {
					const team = teams[index];

					if (this.favAllTeams.find(t => t._id == team._id)) {
						team.selected = true;

					} 


				}

				this.teams = teams;

				if (this.filterBy == 'Soccer') this.subLeagues(teams, 'soccerLeague')
				else if (this.filterBy == 'NCAAF') {
					this.subLeagues(teams, 'fbsConference')
				} else {
					this.teamsToShow = this.teams.concat();
				}


				setTimeout(() => {
					this.wait = false;
				}, 300);

			},
				(err) => {
					this.wait = false;
					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'bottom',
						cssClass: "toast",
					}).then(toast => toast.present());


				})
	}

}
