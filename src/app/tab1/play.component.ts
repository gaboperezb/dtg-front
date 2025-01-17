import { Component, OnInit, ViewChild } from '@angular/core';
import { PlayService } from '../core/play.service';
import { ThreadsService } from '../core/threads.service';
import { ITrivia } from '../shared/interfaces';
import { ToastController, IonSegment } from '@ionic/angular';
import { TakeService } from '../core/take.service';



@Component({
	selector: 'play',
	templateUrl: './play.component.html',
	styleUrls: ['./play.component.scss'],
})
export class PlayComponent implements OnInit {

	trivias: ITrivia[] = [];
	trivia:boolean = true;
	@ViewChild(IonSegment) segment: IonSegment;


    constructor(public playService: PlayService, 
        private takeService: TakeService,
        public threadsService: ThreadsService,
        private toastCtrl: ToastController) { }

	ngOnInit() {

    }
    

    navbarGetPlayItems() {
        this.playService.toggleRefresh = false;
        this.takeService.toggleRefresh = false;
		this.threadsService.toggleRefresh = false;
		
		if(this.playService.playToggled) this.getTriviaItems(this.threadsService.filterBy)
		else {
			this.getPickItems(this.threadsService.filterBy)
		}
		

	}
	
	segmentChanged(value: string) {

		this.segment.value = value;
		if (value == 'trivia') {
			this.playService.triviaToggled = true;
			this.getTriviaItems(this.threadsService.filterBy)
		} else {
			this.playService.triviaToggled = false;
			this.getPickItems(this.threadsService.filterBy)
		}
	}


    getTriviaItems(league: string, event?: any) {

		this.playService.triviaToggled = true;
        this.threadsService.filterBy = league;
		if (!event) {
			this.playService.loaderActive = true;
			this.playService.placeholders = true;
		}
		this.playService.getDailyTrivias(league)
			.subscribe((trivias: any[]) => {

				this.playService.trivias = trivias;
				this.playService.loaderActive = false;
				setTimeout(() => {
					this.playService.placeholders = false;
				}, 1000);

				this.threadsService.hideInfinite = false;
				this.playService.toggleRefresh = false;
                this.threadsService.toggleRefresh = false;
                this.playService.toggleRefresh = false;

				if (event) event.target.complete();


			},
				(err) => {


					if (event) event.target.complete();

					this.playService.loaderActive = false;
					this.playService.placeholders = false;

					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'top'
					}).then(toast => toast.present())

				})

	}

	getPickItems(league: string, event?: any) {

        this.threadsService.filterBy = league;
		if (!event) {
			this.playService.loaderActive = true;
			this.playService.placeholders = true;
		}
		this.playService.getDailyPicks(league)
			.subscribe((picks: any[]) => {

				this.playService.picks = picks;
				console.log(picks)
				this.playService.loaderActive = false;
				setTimeout(() => {
					this.playService.placeholders = false;
				}, 1000);

				this.threadsService.hideInfinite = false;
				this.playService.toggleRefresh = false;
                this.threadsService.toggleRefresh = false;
                this.playService.toggleRefresh = false;

				if (event) event.target.complete();


			},
				(err) => {


					if (event) event.target.complete();

					this.playService.loaderActive = false;
					this.playService.placeholders = false;

					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'top'
					}).then(toast => toast.present())

				})

	}
	
	


	

}
