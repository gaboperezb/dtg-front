import { Component, Input } from '@angular/core';
import { IUserDB } from '../../app/shared/interfaces';
import { AuthService } from '../../app/core/auth.service';
import { ToastController, NavController } from '@ionic/angular';
import { WebSocketService } from '../../app/core/websocket.service';
import { Router } from '@angular/router';
import { FcmProvider } from '../core/fcm.service';



@Component({
    selector: 'followers-item',
    templateUrl: './followers-item.component.html',
    styleUrls: ['./followers-item.component.scss']
})
export class FollowersItemComponent {

   @Input() user: IUserDB; 
   follow: boolean = false;

	constructor(private authService: AuthService, 
		private fcm: FcmProvider,
		private toastCtrl: ToastController,
		private webSocketService: WebSocketService,
		private router: Router,
        private navCtrl: NavController) {

    }

    ngOnInit() {
		
		this.followRelation(); 
		
    }

    followRelation() {

		if (this.authService.currentUser.following.indexOf(this.user._id) >= 0) {
			this.user.provFollowing = true;
			this.user.loadingFollow = false;
		} else {
			this.user.loadingFollow = false;
		}
    }


    goToUser() {

        if (this.authService.currentUser.username == this.user.username) {
            this.authService.downloadProfile = true;
            let data = {
				fromTabs: false,
				loadInitial: true
            }
			this.authService.paramSignUp = data;
			
			
            this.navCtrl.navigateForward(this.router.url.substr(0,10) + '/profile');
        } else {
            let data = {
                user: this.user
            }
			this.authService.paramSignUp = data;
			
           this.navCtrl.navigateForward([this.router.url.substr(0,10) + '/user', this.user._id]);
        }

        

    }
    

    followUser(e: any) {

		e.stopPropagation();
		this.fcm.impact('light');

		if (!this.user.loadingFollow) {
			if (this.user.provFollowing) {
				//Unfollow
				this.user.provFollowing = false;
				this.authService.currentUser.followingNumber -= 1;
                this.user.followersNumber -= 1;

				this.authService.currentUser.following = this.authService.currentUser.following.filter(element=> element != this.user._id );
				this.authService.unfollow(this.user._id)
					.subscribe(() => {

					},
						(err) => {
							this.toastCtrl.create({
								message: err,
								duration: 3000,
								position: 'bottom'
							}).then(toast => {
                                toast.present();
                            })
                            
						

						});

			} else {
				//Follow
				this.user.provFollowing = true;
				this.authService.currentUser.followingNumber += 1;
				this.user.followersNumber += 1;
				this.authService.currentUser.following.push(this.user._id);
				this.authService.follow(this.user._id)
					.subscribe(() => {
						this.webSocketService.emitPost(null, "follow", this.user._id, this.authService.currentUser._id);
					},
						(err) => {
							this.toastCtrl.create({
								message: err,
								duration: 3000,
								position: 'bottom'
							}).then(toast => toast.present())
							
						
						});

			}
		}

	}


}