import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AuthService } from '../core/auth.service';
import { AppState } from '../core/state.service';

@Component({
  selector: 'app-levels',
  templateUrl: './levels.page.html',
  styleUrls: ['./levels.page.scss'],
})
export class LevelsPage implements OnInit {

  constructor(public authService: AuthService, private modal: ModalController, public global: AppState) { }

  ngOnInit() {
  }


  dismissModal() {
    this.modal.dismiss();
  }


}
