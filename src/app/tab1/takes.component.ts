import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { TakeService } from '../core/take.service';
import { ThreadsService } from '../core/threads.service';
import { ToastController, ActionSheetController, MenuController } from '@ionic/angular';
import { ITake } from '../shared/interfaces';
import { LikesService } from '../core/likers.service';
import { AppState } from '../core/state.service';


@Component({
	selector: 'takes',
	templateUrl: './takes.component.html',
	styleUrls: ['./takes.component.scss'],
})
export class TakesComponent implements OnInit {



	sortBy: string;
	iconToDisplay: string = "hot-white"; //CHECK_DTG


	constructor(private authService: AuthService,
		public takeService: TakeService,
		private likesService: LikesService,
		public global: AppState,
		private toastCtrl: ToastController,
		private actionSheetCtrl: ActionSheetController,
		private menu: MenuController,
		public threadsService: ThreadsService) { }

	ngOnInit() {
		this.navBarGetTakes()
	}


	navBarGetTakes() {


		this.threadsService.toggleRefresh = false;
		this.takeService.toggleRefresh = false;

		if (this.takeService.followers) {

			this.getFollowersTakes(this.threadsService.filterBy)

		}
		else if (this.takeService.bookmarks) {
			this.getSavedTakes()
		}
		else if (this.takeService.hot) {

			this.sortBy = 'HOT DISCUSSIONS'
			this.getTakes(this.threadsService.filterBy)

		} else if (this.takeService.new) {

			this.sortBy = 'NEW DISCUSSIONS'
			this.getNewestTakes(this.threadsService.filterBy)

		} else if (this.takeService.top) {

			this.sortBy = 'TOP DISCUSSIONS'
			this.getTopTakes(this.threadsService.filterBy)


		}

	}


	presentActionSheet() {

		this.menu.isOpen().then(open => {
			if (open) {
				this.menu.close()
			} else {

				let hotIcon;
				let newIcon;
				let topIcon;

				if (this.global.state['theme'] == 'light') {
					hotIcon = this.takeService.hot ? 'checkmark' : 'hot-primary';
					newIcon = this.takeService.new ? 'checkmark' : 'new-primary';
					topIcon = this.takeService.top ? 'checkmark' : 'top-primary'
				} else {
					hotIcon = this.takeService.hot ? 'checkmark' : 'hot-white'
					newIcon = this.takeService.new ? 'checkmark' : 'new-white';
					topIcon = this.takeService.top ? 'checkmark' : 'top-white'
				}

				this.actionSheetCtrl.create({
					header: 'SORT DISCUSSIONS BY',
					cssClass: 'my-custom-action',
					buttons: [
						{
							text: 'Hot',
							icon: hotIcon,
							handler: () => {
								this.sortBy = "HOT DISCUSSIONS";
								this.takeService.hot = true;
								this.takeService.new = false;
								this.takeService.top = false;
								this.iconToDisplay = "hot-white";
								this.getTakes(this.threadsService.filterBy)


							}
						}, {
							text: 'New',
							icon: newIcon,
							handler: () => {
								this.sortBy = "NEW DISCUSSIONS";
								this.takeService.hot = false;
								this.takeService.top = false;
								this.takeService.new = true;
								this.iconToDisplay = "new-white";
								this.getNewestTakes(this.threadsService.filterBy)
							}
						},
						{
							text: 'Top past 24 hrs',
							icon: topIcon,
							handler: () => {
								this.sortBy = "TOP DISCUSSIONS";
								this.takeService.hot = false;
								this.takeService.top = true;
								this.takeService.new = false;
								this.iconToDisplay = "top-white";

								this.getTopTakes(this.threadsService.filterBy)
							}
						},
						{
							text: 'Close',
							role: 'cancel',
							handler: () => {

							}
						}
					]
				}).then((actionSheet) => {
					actionSheet.present();
				})

			}
		})
	}

	getSavedTakes(event?: any) {

	
		this.takeService.skipSaved = 0;

		if (!event) {
			this.takeService.loaderActive = true;
			this.takeService.placeholders = true;
		}
		this.takeService.getBookmarks(this.takeService.skipSaved)
			.subscribe((takes: any) => {


				let prov = takes.map((take: any) => {
					take.date = new Date(take.date);
					take.created = this.created(take);
					take.likedByUser = this.userHasLiked(take);
					take.count = take.likers ? take.likers.length : 0;
					take.levelN = take.user.badge.picture.replace('.png', 'N.png');

					return take;
				})
				this.takeService.takes = prov

				this.takeService.loaderActive = false;
				setTimeout(() => {
					this.takeService.placeholders = false;
				}, 1000);

				this.threadsService.hideInfinite = false;
				this.takeService.toggleRefresh = false;
				this.threadsService.toggleRefresh = false;
				
				if (event) event.target.complete();

			},
				(err) => {


					if (event) event.target.complete();

					this.takeService.loaderActive = false;
					this.takeService.placeholders = false;

					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'top'
					}).then(toast => toast.present())

				})

	}
	

	getTakes(league: string, event?: any) {

		this.threadsService.filterBy = league;
		this.takeService.skip = 0;

		if (!event) {
			this.takeService.loaderActive = true;
			this.takeService.placeholders = true;
		}
		this.takeService.getTakes(league, this.takeService.skip)
			.subscribe((takes: any) => {


				let prov = takes.map((take: any) => {
					take.date = new Date(take.date);
					take.created = this.created(take);
					take.likedByUser = this.userHasLiked(take);
					take.count = take.likers ? take.likers.length : 0;
					take.levelN = take.user.badge.picture.replace('.png', 'N.png');

					return take;
				})



				this.takeService.takes = prov

				this.takeService.loaderActive = false;
				setTimeout(() => {
					this.takeService.placeholders = false;
				}, 1000);

				this.threadsService.hideInfinite = false;
				this.takeService.toggleRefresh = false;
				this.threadsService.toggleRefresh = false;
				
				if (event) event.target.complete();





			},
				(err) => {


					if (event) event.target.complete();

					this.takeService.loaderActive = false;
					this.takeService.placeholders = false;

					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'top'
					}).then(toast => toast.present())

				})

	}

	getNewestTakes(league: string, event?: any) {


		this.takeService.skipNewest = 0;
		this.threadsService.filterBy = league;

		if (!event) {
			this.takeService.placeholders = true;
			this.takeService.loaderActive = true;
		}

		this.takeService.getNewestTakes(league, this.takeService.skipNewest)
			.subscribe((takes: any) => {



				let prov = takes.map((take: any) => {
					take.date = new Date(take.date);
					take.created = this.created(take);
					take.likedByUser = this.userHasLiked(take);
					take.count = take.likers ? take.likers.length : 0;
					take.levelN = take.user.badge.picture.replace('.png', 'N.png');

					return take;
				})
				this.takeService.takes = prov
				this.takeService.loaderActive = false;
				setTimeout(() => {
					this.takeService.placeholders = false;
				}, 1000);


				this.threadsService.hideInfinite = false;
				this.takeService.toggleRefresh = false;
				this.threadsService.toggleRefresh = false;
			
				if (event) event.target.complete();


			},
				(err) => {


					this.takeService.loaderActive = false;
					if (event) event.target.complete();
					this.takeService.placeholders = false;

					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'top'
					}).then(toast => toast.present())

				})

	}

	getTopTakes(league: string, event?: any) {



		this.takeService.skipTop = 0;
		this.threadsService.filterBy = league;


		if (!event) {
			this.takeService.placeholders = true;
			this.takeService.loaderActive = true;
		}
		this.takeService.getTakes(league, this.threadsService.skipTop)
			.subscribe((takes: any) => {


				let prov = takes.map((take: any) => {
					take.date = new Date(take.date);
					take.created = this.created(take);
					take.likedByUser = this.userHasLiked(take);
					take.count = take.likers ? take.likers.length : 0;
					take.levelN = take.user.badge.picture.replace('.png', 'N.png');

					return take;
				})

				this.takeService.takes = prov
				this.takeService.loaderActive = false;
				setTimeout(() => {
					this.threadsService.placeholders = false;
				}, 1000);

				if (event) event.target.complete();

				this.threadsService.hideInfinite = false;
				this.takeService.toggleRefresh = false;
				this.threadsService.toggleRefresh = false;
				


			},
				(err) => {

					this.takeService.loaderActive = false;
					this.takeService.placeholders = false;

					if (event) event.target.complete();

					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'top'
					}).then(toaster => {
						toaster.present()
					})

				})

	}



	getFollowersTakes(league: string, event?: any) {

		this.threadsService.filterBy = league;
		this.takeService.skipFollowers = 0;

		if (!event) {
			this.takeService.placeholders = true;
			this.takeService.loaderActive = true;
		}


		this.takeService.getFollowingTakes(league, this.takeService.skipFollowers)
			.subscribe((takes: any) => {


				let prov = takes.map((take: any) => {
					take.date = new Date(take.date);
					take.created = this.created(take);
					take.likedByUser = this.userHasLiked(take);
					take.count = take.likers ? take.likers.length : 0;
					take.levelN = take.user.badge.picture.replace('.png', 'N.png');
					return take;
				})

				this.takeService.takes = prov

				this.takeService.loaderActive = false;
				if (event) event.target.complete();
				setTimeout(() => {
					this.takeService.placeholders = false;
				}, 1000);



				this.threadsService.hideInfinite = false;




			},
				(err) => {


					if (event) event.target.complete();

					this.takeService.loaderActive = false;
					this.takeService.placeholders = false;

					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'top'
					}).then(toaster => toaster.present())

				})

	}


	getMoreSavedTakes(event: any) {

		this.takeService.getBookmarks(this.takeService.skipSaved)
			.subscribe((takes: any) => {

				if (takes.length > 0) {
					let provisionalArray = takes.map((take: any) => {
						take.date = new Date(take.date);
						take.created = this.created(take);
						take.likedByUser = this.userHasLiked(take);
						take.count = take.likers ? take.likers.length : 0;
						take.levelN = take.user.badge.picture.replace('.png', 'N.png');
						return take;
					})

					let newThreadsArray = this.takeService.takes.concat(provisionalArray)
					//Eliminar duplicados. Esto sucede porque continuamente se agregan discusiones a la base de datos; el skip genera esto.
					let unique = newThreadsArray.filter((item, i, array) => {
						return array.findIndex((item2) => { return item2._id == item._id }) === i;
					})
					this.takeService.takes = unique;

				}

				event.target.complete()
			},
				(err) => {

					event.target.complete()
					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'top'
					}).then(toast => toast.present())

				})

	}

	getMoreTakes(event: any) {

		this.takeService.getTakes(this.threadsService.filterBy, this.takeService.skip)
			.subscribe((takes: any) => {

				if (takes.length > 0) {
					let provisionalArray = takes.map((take: any) => {
						take.date = new Date(take.date);
						take.created = this.created(take);
						take.likedByUser = this.userHasLiked(take);
						take.count = take.likers ? take.likers.length : 0;
						take.levelN = take.user.badge.picture.replace('.png', 'N.png');
						return take;
					})

					let newThreadsArray = this.takeService.takes.concat(provisionalArray)
					//Eliminar duplicados. Esto sucede porque continuamente se agregan discusiones a la base de datos; el skip genera esto.
					let unique = newThreadsArray.filter((item, i, array) => {
						return array.findIndex((item2) => { return item2._id == item._id }) === i;
					})
					this.takeService.takes = unique;

				}

				event.target.complete()
			},
				(err) => {

					event.target.complete()
					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'top'
					}).then(toast => toast.present())

				})

	}

	getMoreNewestTakes(event: any) {

		this.takeService.getNewestTakes(this.threadsService.filterBy, this.takeService.skipNewest)
			.subscribe((takes: any) => {


				if (takes.length > 0) {
					let provisionalArray = takes.map((take: any) => {
						take.date = new Date(take.date);
						take.created = this.created(take);
						take.likedByUser = this.userHasLiked(take);
						take.count = take.likers ? take.likers.length : 0;
						take.levelN = take.user.badge.picture.replace('.png', 'N.png');


						return take;
					})

					let newThreadsArray = this.takeService.takes.concat(provisionalArray)
					//Eliminar duplicados. Esto sucede porque continuamente se agregan discusiones a la base de datos; el skip genera esto.
					let unique = newThreadsArray.filter((item, i, array) => {
						return array.findIndex((item2) => { return item2._id == item._id }) === i;
					})
					this.takeService.takes = unique;

				}

				event.target.complete()



			},
				(err) => {

					event.target.complete()
					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'top'
					}).then(toast => toast.present());

				})

	}


	getMoreTopTakes(event: any) {

		this.takeService.getTopTakes(this.threadsService.filterBy, this.takeService.skipTop)
			.subscribe((takes: any) => {



				if (takes.length > 0) {
					let provisionalArray = takes.map((take: any) => {
						take.date = new Date(take.date);
						take.created = this.created(take);
						take.likedByUser = this.userHasLiked(take);
						take.count = take.likers ? take.likers.length : 0;
						take.levelN = take.user.badge.picture.replace('.png', 'N.png');


						return take;
					})

					let newThreadsArray = this.takeService.takes.concat(provisionalArray)
					//Eliminar duplicados. Esto sucede porque continuamente se agregan discusiones a la base de datos; el skip genera esto.
					let unique = newThreadsArray.filter((item, i, array) => {
						return array.findIndex((item2) => { return item2._id == item._id }) === i;
					})
					this.takeService.takes = unique;


				}

				event.target.complete()



			},
				(err) => {

					event.target.complete()
					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'top'
					}).then(toast => {
						toast.present();
					})

				})
	}

	getMoreFollowersTakes(event: any) {

		this.takeService.getFollowingTakes(this.threadsService.filterBy, this.takeService.skipFollowers)
			.subscribe((takes: any) => {

				if (takes.length > 0) {
					let provisionalArray = takes.map((take: any) => {
						take.date = new Date(take.date);
						take.created = this.created(take);
						take.likedByUser = this.userHasLiked(take);
						take.count = take.likers ? take.likers.length : 0;
						take.levelN = take.user.badge.picture.replace('.png', 'N.png');

						return take;
					})

					let newThreadsArray = this.takeService.takes.concat(provisionalArray)
					//Eliminar duplicados. Esto sucede porque continuamente se agregan discusiones a la base de datos; el skip genera esto.
					let unique = newThreadsArray.filter((item, i, array) => {
						return array.findIndex((item2) => { return item2._id == item._id }) === i;
					})
					this.takeService.takes = unique;




				}

				event.target.complete()
			},
				(err) => {

					event.target.complete()
					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'top'
					}).then(toast => toast.present())

				})

	}

	created(thread: ITake): string {

		let milliseconds = thread.date.getTime();
		let now = new Date();
		let millisecondsNow = now.getTime();
		let diffInHours = (millisecondsNow - milliseconds) / (1000 * 60 * 60); //hours
		let typeTime;

		if (diffInHours >= 24) {
			//DAYS
			let threadCreated = Math.floor(diffInHours / 24); //Template binding
			typeTime = "d"
			return `${threadCreated}${typeTime}`

		} else if (diffInHours < 1 && diffInHours > 0) {
			//MINUTES
			let threadCreated = Math.ceil(diffInHours * 60); //Template binding
			typeTime = "min"
			return `${threadCreated}${typeTime}`

		} else {
			//HOURS   
			let threadCreated = Math.floor(diffInHours); //Template binding
			typeTime = "h"
			return `${threadCreated}${typeTime}`

		}

	}

	userHasLiked(thread: ITake) {

		if (this.authService.currentUser) {
			return this.likesService.userHasLiked(thread, this.authService.currentUser._id);
		} else {
			return false;
		}
	}

}
