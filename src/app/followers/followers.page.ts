import { Component, ElementRef, ViewChild } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { IUserDB } from '../../app/shared/interfaces';
import { AuthService } from '../../app/core/auth.service';
import * as _ from 'lodash';
import { FollowersItemComponent } from './followers-item.component';
import { AppState } from '../core/state.service';

/**
 * Generated class for the FollowersPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
	selector: 'app-followers',
	templateUrl: './followers.page.html',
	styleUrls: ['./followers.page.scss']
})
export class FollowersPage {

	title: string = "";
	skipFollowing: number = 0;
	skipFollowers: number = 0;
	users: IUserDB[] = [];
	fetchUser: string;
	wait: boolean = true;
	enableInfinite: boolean = false;
	scrollTO: any;
	swipeTimeOut: any;
	@ViewChild(FollowersItemComponent) child:FollowersItemComponent;

	constructor(public navCtrl: NavController,
		private authService: AuthService,
		private el: ElementRef,
		public global: AppState,
		private toastCtrl: ToastController) {

		let data = this.authService.paramSignUp
	
		this.title = data.title;
		this.fetchUser = data.user._id;
	}

	ionViewDidLeave() {

	
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

	
	ngOnInit() {

		if (this.title.toLocaleLowerCase() == "followers") {
			setTimeout(() => {
				this.getFollowers();
			}, 500);
		}
		else {
			setTimeout(() => {
				this.getFollowing();
			}, 500);

		}
	}


	goBack() {

		this.authService.addurl = false;
		this.navCtrl.pop();
		
	}



	ionViewDidEnter() {

		if (this.users.length > 0) {
			//Optimizar follow
		}
	}

	showVisible(e) {

		for (let img of this.el.nativeElement.querySelectorAll('.profile-pic')) {
			let realSrc = img.dataset.src;
			if (!realSrc) continue;

			if (this.isVisible(img)) {

				if (e != null) {
					e.domWrite(() => {
						img.src = realSrc;
						img.dataset.src = ''
					});
				} else {
					img.src = realSrc;
					img.dataset.src = ''
				}
			}
		}

	}


	isVisible(elem) {

		let coords = elem.getBoundingClientRect();

		let windowHeight = document.documentElement.clientHeight;

		// top elem edge is visible OR bottom elem edge is visible
		let topVisible = coords.top > 0 && coords.top < windowHeight;
		let bottomVisible = coords.bottom < windowHeight && coords.bottom > 0;

		return topVisible || bottomVisible;
	}


	getFollowers() {

		this.authService.getFollowers(0, this.fetchUser)
			.subscribe((data: any) => {
				let followers = data.followers.filter(element => element._id != this.authService.currentUser._id);
				this.wait = false;

				this.users = followers;
				if (data.followers.length < 20) this.enableInfinite = false;
				else {
					this.enableInfinite = true;
				}

				setTimeout(() => {
					this.showVisible(null);
				}, 0);

			},
				(err) => {
					this.wait = false;
					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'bottom'
					}).then(toast => toast.present())
					
				});

	}

	getMoreFollowers(infiniteScroll) {

		this.authService.getFollowers(this.skipFollowers, this.fetchUser)
			.subscribe((data: any) => {
				let followers = data.followers.filter(element => element._id != this.authService.currentUser._id);;
				this.wait = false;
				let newTimelinesArray = this.users.concat(followers);

				//Eliminar duplicados. Esto sucede porque continuamente se agregan discusiones a la base de datos; el skip genera esto.
				var unique = newTimelinesArray.filter((item, i, array) => {
					return array.findIndex((item2: any) => { return item2._id == item._id }) === i;
				})
				this.users = unique;

				infiniteScroll.target.complete();
				if (data.followers.length < 20) this.enableInfinite = false;
				setTimeout(() => {
					this.showVisible(null);
				}, 0);

			},
				(err) => {
					this.wait = false;
					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'bottom'
					}).then(toast => toast.present())
					infiniteScroll.target.complete();
				});

	}


	getFollowing() {

		this.authService.getFollowing(0, this.fetchUser)
			.subscribe((data: any) => {

				this.users = data.following.filter(element => element._id != this.authService.currentUser._id);
				this.wait = false;
				if (data.following.length < 20) this.enableInfinite = false;
				else {
					this.enableInfinite = true;
				}
				setTimeout(() => {
					this.showVisible(null);
				}, 0);

			},
				(err) => {
					this.wait = false;
					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'bottom'
					}).then(toast => toast.present())
					
				});
	}

	getMoreFollowing(infiniteScroll) {

		this.authService.getFollowing(this.skipFollowing, this.fetchUser)
			.subscribe((data: any) => {
				let following = data.following.filter(element => element._id != this.authService.currentUser._id);
				this.wait = false;
				let newTimelinesArray = this.users.concat(following);

				//Eliminar duplicados. Esto sucede porque continuamente se agregan discusiones a la base de datos; el skip genera esto.
				var unique = newTimelinesArray.filter((item, i, array) => {
					return array.findIndex((item2: any) => { return item2._id == item._id }) === i;
				})
				this.users = unique;

				infiniteScroll.target.complete();
				if (data.following.length < 20) this.enableInfinite = false;
				setTimeout(() => {
					this.showVisible(null);
				}, 0);

			},
				(err) => {
					this.wait = false;
					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'bottom'
					}).then(toast => toast.present())
					infiniteScroll.target.complete();
				});

	}

	doInfinite(infiniteScroll) {

		if (this.title.toLocaleLowerCase() == "following") {
			this.skipFollowing += 20;
			this.getMoreFollowing(infiniteScroll);
		} else {
			this.skipFollowers += 20;
			this.getMoreFollowers(infiniteScroll);

		}

	}


}
