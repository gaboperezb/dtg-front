import { Component } from '@angular/core';
import { ToastController, LoadingController, ModalController, NavParams } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { AuthService } from '../../app/core/auth.service';
import { ThreadsService } from '../../app/core/threads.service';
import { Router } from '@angular/router';
import { AppState } from '../core/state.service';



@Component({
	selector: 'page-choose-leagues',
	templateUrl: 'choose-leagues.page.html',
	styleUrls: ['./choose-leagues.page.scss'],

})
export class ChooseLeaguesPage {

	leagues: any[] = []
	selectedLeagues: string[] = [];
	showLikeHelp: boolean = false;
	loaderInstance: any;


	constructor(
		private storage: Storage,
		private router: Router,
		private toastCtrl: ToastController,
		private modalController: ModalController,
		private authService: AuthService,
		public global: AppState,
		private navParams: NavParams,
		private threadsService: ThreadsService,
		private loadingCtrl: LoadingController) {

		this.leagues = [
			{
				league: 'NBA',
				selected: false,
				image: "assets/imgs/nba.png"
			},
			{
				league: 'NFL',
				selected: false,
				image: "assets/imgs/nfl.png"
			},
			{
				league: 'Soccer',
				selected: false,
				image: "assets/imgs/soccer.png"
			},
			{
				league: 'MLB',
				selected: false,
				image: "assets/imgs/mlb.png"
			},
			{
				league: 'NHL',
				selected: false,
				image: "assets/imgs/nhl.png"
			},
			{
				league: 'NCAAF',
				selected: false,
				image: "assets/imgs/ncaaf.png"
			},
			{
				league: 'NCAAB',
				selected: false,
				image: "assets/imgs/ncaab.png"
			},
			{
				league: 'NFL Fantasy',
				selected: false,
				image: "assets/imgs/nfl-fantasy.png"
			},
			{
				league: 'MMA',
				selected: false,
				image: "assets/imgs/mma.png"
			},
			{
				league: 'Boxing',
				selected: false,
				image: "assets/imgs/boxing.png"
			},
			{
				league: 'Tennis',
				selected: false,
				image: "assets/imgs/tennis.png"
			},
			{
				league: 'Golf',
				selected: false,
				image: "assets/imgs/golf.png"
			},
			{
				league: 'Motorsports',
				selected: false,
				image: "assets/imgs/motorsports.png"
			},
			{
				league: 'General',
				selected: false,
				image: "assets/imgs/general.png"
			}

		];
		

		this.selectedLeagues = this.navParams.get('data').leagues;
		this.showLikeHelp = this.navParams.get('data').showLikeHelp;
		this.leagues = this.leagues.map((league) => {
			if (this.selectedLeagues.some(selected => selected == league.league)) league.selected = true;
			return league;
		})
	}


	selectAll() {

		this.selectedLeagues = [];
		for (let index = 0; index < this.leagues.length; index++) {
			const element = this.leagues[index];
			element.selected = true;
			this.selectedLeagues.push(element.league);
		}
	}

	


	done() {
		if (this.selectedLeagues.length > 0) {
			this.storage.set('leagues', JSON.stringify(this.selectedLeagues));
			this.selectedLeagues.unshift('TOP');
			this.threadsService.leagues = this.selectedLeagues;

			if (this.authService.isLoggedIn()) {
				this.loadingCtrl.create({
					spinner: 'crescent',
					cssClass: 'my-custom-loading'
				}).then(loader => {
					loader.present()
					let data = {
						leagues: this.selectedLeagues.filter(league => league != 'TOP')
					}
					this.authService.saveLeagues(data)
					.subscribe((leagues) => {

						this.modalController.dismiss();
						loader.dismiss()
					},
						(err) => {
							this.toastCtrl.create({
								message: err,
								duration: 3000,
								position: 'bottom'
							}).then(loader => {
								this.loaderInstance = loader;
								this.loaderInstance.present();
							})
							loader.dismiss()
							this.modalController.dismiss();

						})
					
				})
				
				
				
			} else {
				this.modalController.dismiss();
			}
		}
		else {
			this.toastCtrl.create({
				message: 'You need to select at least one',
				duration: 3000,
				position: 'bottom'
			}).then(toast => toast.present())
			
		}
	}

	addLeague(league) {

	
		if(league.selected) {
			this.selectedLeagues = this.selectedLeagues.filter(leagueToDelete => leagueToDelete != league.league)
		league.selected = false;
		} else {
			this.selectedLeagues.push(league.league);
			league.selected = true;
		}
		

	}


}

