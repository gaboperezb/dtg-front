import { Component } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { AppState } from '../core/state.service';


@Component({
  selector: 'app-signup-app',
  templateUrl: './signup-app.page.html',
  styleUrls: ['./signup-app.page.scss'],
})
export class SignupAppPage  {

  message: string;


  constructor(private navParams:NavParams, private modalController: ModalController, public global: AppState) {

    this.message = navParams.get('data').message || "You need to have an account to access this feature.";

  }


  goToSign(type: string) {
    let data = {
      type: type,
      goToSignGlobal: true
    }
    this.modalController.dismiss(data);
  }



  dismiss() {
    let data = {
      goToSignGlobal: false
    }
    this.modalController.dismiss(data);
  }

  

  

}
