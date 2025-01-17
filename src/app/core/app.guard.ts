import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AppState } from './state.service';
import { Platform } from '@ionic/angular';
import { Device } from '@ionic-native/device/ngx';


@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private storage: Storage,
        private global: AppState,
        private platform: Platform,
        private device: Device

    ) { }

    updateDOMMode(shouldAdd) {


        if (shouldAdd) this.global.set('theme', 'black')
        else {
            this.global.set('theme', 'light')
        }




    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {

        return new Promise((resolve) => {

            this.storage.get('initial').then((valTheme) => {
                if (!valTheme) {

                    this.storage.set('motorsports', '1');
                    this.storage.set('darkTheme', 'black');
                    
                    if (this.platform.is('ios')) {
                        if (+this.device.version >= 13) {
                            this.storage.set('systemMode', '1');
                           
                        }
                    }


                    if (this.platform.is('android')) {
                        if (+this.device.version >= 10) {
                            this.storage.set('systemMode', '1');
                          
                        }
                    }
                    this.router.navigateByUrl('/signup-unique');

                    resolve(false);

                    //No hay necesidad de mostrar si quieren agregar MMA  ya que se va a llevar a choose leagues
                } else {

                    this.storage.get('systemMode').then((valSystem) => {
                        if (!valSystem) {
                            if (valTheme == 'dark') {
                                this.global.set('theme', "dark");
                                resolve(true)

                            } else if (valTheme == 'black') {
                                this.global.set('theme', "black");
                                resolve(true)
                            } else {

                                console.log(valTheme)
                                this.global.set('theme', "light");
                                resolve(true)
                            }

                        } else {
                            resolve(true)
                        }
                    });

                }
            });
        })
    }
}