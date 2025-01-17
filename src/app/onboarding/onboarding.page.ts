import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { NavController, IonSlides } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { AppState } from '../core/state.service';

@Component({
	selector: 'app-onboarding',
	templateUrl: './onboarding.page.html',
	styleUrls: ['./onboarding.page.scss'],
})
export class OnboardingPage implements OnInit {

	@ViewChild('slides') slides: IonSlides;
	isEnd: boolean = false;

	slideOpts = {
		initialSlide: 0,
		speed: 400
	};

	constructor(private authService: AuthService,
		private navCtrl: NavController,
		private global: AppState,
		private storage: Storage) { }

	ngOnInit() {
	}

	signup(type: string) {




	}

	skip() {


	}


	nextSlide() {

		this.slides.isEnd().then((isEnd) => {
			if (isEnd) {

				if (this.authService.paramSignUp) this.navCtrl.navigateForward('/signup-global');
				else {
					this.storage.set('initial', 'light');
					this.global.set('theme', 'light');
					this.navCtrl.navigateRoot('/', { animated: true, animationDirection: 'forward' });
				}
			} else {
				this.slides.slideNext(400).then(() => {
					this.slides.isEnd().then((isEnd) => {
						if (isEnd) {
							this.isEnd = true;
						}
	
					})
				})
			}

		})
	}

}
