import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AppState } from './state.service';
import { Platform, ModalController, NavController } from '@ionic/angular';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AuthService } from './auth.service';
import { SignupAppPage } from '../signup-app/signup-app.page';




@Injectable({ providedIn: 'root' })
export class ChatGuard implements CanActivate {
    constructor(
        private router: Router,
        private storage: Storage,
        private global: AppState,
        private statusBar: StatusBar,
        private authService: AuthService,
        private modalCtrl: ModalController,
        private navCtrl: NavController,
        private platform: Platform
      
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

       
            if (this.authService.isLoggedIn()) {
                return true;
    
            } else {

                //una ultima checada por si se reinicia la app
                this.storage.get('user').then((val) => {
                    if (!!val) {
                        this.authService.currentUser = val;
                        return true
                    } else {
                        let data = {
                            message: 'Sign up to join group chats around your favorite teams!',
                        }
                        this.modalCtrl.create({
                            component: SignupAppPage,
                            componentProps: {
                                data
                            }
                        }).then(modal => {
                            modal.present();
                            modal.onDidDismiss()
                                .then(data => {
                                    if (data.data.goToSignGlobal) {
            
                                        let typeParams = {
                                            type: data.data.type,
                                            fromInitialPage: false
                                        }
            
                                        this.authService.paramSignUp = typeParams;
                                        this.navCtrl.navigateForward('/signup-global');
                                        
                                        
                                        
                                        
                                    }
                                    return false;
                                })
            
                        })
                    }
        
                })
                
                
                
                
    
            }
      
    }
}