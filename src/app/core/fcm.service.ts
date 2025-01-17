import { Injectable } from '@angular/core';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { Platform } from '@ionic/angular';
import { AuthService } from './auth.service';
import { TapticEngine } from '@ionic-native/taptic-engine/ngx';
import { Storage } from '@ionic/storage';


@Injectable({
  providedIn: 'root'
})
export class FcmProvider {

  constructor(
    public firebaseNative: FirebaseX,
    private tapticEngine: TapticEngine,
    private platform: Platform,
    private authService: AuthService,
    private storage: Storage
  ) { }

  // Get permission from the user
  getToken() {

    this.firebaseNative.onTokenRefresh().subscribe(token => {
     
      this.saveTokenToDb(token);
    });

  }


  substractBadgeNumber() {
    this.firebaseNative.getBadgeNumber().then((val) => {
      this.setBadge(val - 1);
    })
  }

  onTokenRefresh() {

    this.firebaseNative.onTokenRefresh().subscribe(token => {

      if (this.authService.isLoggedIn()) {
        if (this.authService.currentUser.playerIds.indexOf(token) == -1) {
          this.saveTokenToDb(token);
        }
      }

    });

  }

  async grantPermission() {

    if (this.platform.is('ios')) {
      await this.firebaseNative.grantPermission();
    }

  }

  async hasPermission() {

    if (this.platform.is('ios')) {
      let permission;
      permission = await this.firebaseNative.hasPermission();

      return permission; //.isEnabled en firebase

    } else {
      return true;
    }

  }

  setBadge(badgeNum: number) {

    if (this.platform.is('ios')) {
      this.firebaseNative.setBadgeNumber(badgeNum);
    }

  }

  // Save the token to firestore
  private saveTokenToDb(token) {

    this.authService.saveFirebaseToken(token);

  }


  //Taptic

  selection() {
    if (this.platform.is('ios')) {
      this.tapticEngine.selection();
    }
  }

  noti() {

    if (this.platform.is('ios')) {
      this.tapticEngine.notification({
        type: "success" // success | warning | error
      });
    }
  }

  impact(type: any) {
    if (this.platform.is('ios')) {
      this.tapticEngine.impact({
        style: type // light | medium | heavy
      });
    }
  }

}