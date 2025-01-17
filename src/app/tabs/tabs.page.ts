import { Component, ViewChild } from '@angular/core';
import { IonContent, IonTabs, DomController, NavController, IonTabButton } from '@ionic/angular';
import { AuthService } from '../core/auth.service';
import { AppState } from '../core/state.service';
import { ChatService } from '../core/chat.service';

@Component({
	selector: 'app-tabs',
	templateUrl: 'tabs.page.html',
	styleUrls: ['tabs.page.scss']
})
export class TabsPage {
	@ViewChild("dtgTabs", { static: true }) dtgTabs: IonTabs;
	@ViewChild("dtgTab1", { static: true }) dtgTab1: IonTabButton;
	@ViewChild("dtgTab2", { static: true }) dtgTab2: IonTabButton;
	@ViewChild("dtgTab3", { static: true }) dtgTab3: IonTabButton;
	@ViewChild("dtgTab4", { static: true }) dtgTab4: IonTabButton;
	@ViewChild("dtgTab5", { static: true }) dtgTab5: IonTabButton;
	tab1Activated: boolean = true;
	tab2Activated: boolean = false;
	tab3Activated: boolean = false;
	tab4Activated: boolean = false;
	tab5Activated: boolean = false;
	swipeSubscription: any;
	tabSubscription: any;

	constructor(private navCtrl:NavController, 
		public authService: AuthService, 
		public chatService: ChatService,
		public global: AppState,
		private domCtrl: DomController) {

	}

	makeid(length) {
		var result           = '';
		var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		var charactersLength = characters.length;
		for ( var i = 0; i < length; i++ ) {
		   result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	 }

	toTop() {
		this.authService.observableTabOne.next(true);
	}

	checkIfCanActivate(
		tabButton1: IonTabButton,
		tabButton2: IonTabButton,
		tabButton3: IonTabButton,
		tabButton4: IonTabButton,
		tabButton5: IonTabButton) {

		tabButton1.disabled = this.authService.disableTabs;
		tabButton2.disabled = this.authService.disableTabs;
		tabButton3.disabled = this.authService.disableTabs;
		tabButton4.disabled = this.authService.disableTabs;
		tabButton5.disabled = this.authService.disableTabs;
	}

	getChats() {

		if(this.authService.isLoggedIn()) {
			
				this.chatService.getChats(0, true);
				this.chatService.skip = 0
				this.chatService.enableInfinite = true;
			
		}
	}
	
	ngOnInit() {
	
		this.dtgTabs.ionTabsWillChange.subscribe((e) => {
			switch (this.dtgTabs.getSelected()) {
				case "tab1":
					this.tab1Activated = true;
					this.tab2Activated = false;
					this.tab3Activated = false;
					this.tab4Activated = false;
					this.tab5Activated = false;
					break;
				case "tab2":
					this.tab1Activated = false;
					this.tab2Activated = true;
					this.tab3Activated = false;
					this.tab4Activated = false;
					this.tab5Activated = false;
					setTimeout(() => {
						this.getChats()
					}, 300);
					
					break;
				case "tab3":
					this.tab1Activated = false;
					this.tab2Activated = false;
					this.tab3Activated = true;
					this.tab4Activated = false;
					this.tab5Activated = false;

					break;
				case "tab4":
					this.tab1Activated = false;
					this.tab2Activated = false;
					this.tab3Activated = false;
					this.tab4Activated = true;
					this.tab5Activated = false;

					break;
				case "tab5":
					this.tab1Activated = false;
					this.tab2Activated = false;
					this.tab3Activated = false;
					this.tab4Activated = false;
					this.tab5Activated = true;
					break;

				default:
					break;
			}
		})
	}


}
