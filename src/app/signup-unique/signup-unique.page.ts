import { ViewChild, Component } from '@angular/core';
import { AppState } from '../../app/core/state.service';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { Storage } from '@ionic/storage';
import { IonContent, NavController, Platform } from '@ionic/angular';
import { StatusBar } from '@ionic-native/status-bar/ngx';

@Component({
	selector: 'app-signup-unique',
	templateUrl: './signup-unique.page.html',
	styleUrls: ['./signup-unique.page.scss'],
})
export class SignupUniquePage {

	@ViewChild("signupTab", { static: true }) content: IonContent;

	constructor(private navCtrl: NavController, 
		private authService: AuthService, 
		private router: Router,
		 public global: AppState, 
		 private statusBar: StatusBar,
		 private platform: Platform,
		 private storage: Storage) {
	}


	ionViewDidEnter() {
		this.authService.paramSignUp = null;
	}

	signup(type: string) {



		let typeParams = {
			type: type,
			fromInitialPage: true
		}
		this.authService.paramSignUp = typeParams;
		if (type == 'Log in') {
			this.navCtrl.navigateForward('/signup-global');
		} else {
			this.navCtrl.navigateForward('/onboarding');
		}

	}

	ngOnInit() {
		this.content.scrollY = false;
		this.statusBar.styleLightContent();
		if (this.platform.is('android')) {
			this.statusBar.backgroundColorByHexString('#21253C')
		}
	}


	skip() {
		this.navCtrl.navigateForward('/onboarding');
	}

}
