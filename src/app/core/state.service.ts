import { Inject, Injectable, RendererFactory2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Storage } from '@ionic/storage';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Platform, ToastController } from '@ionic/angular';
import { Keyboard, KeyboardStyle } from '@ionic-native/keyboard/ngx';



@Injectable({
    providedIn: 'root'
})
export class AppState {
    _state = {};
    renderer: any;


    constructor(@Inject(DOCUMENT) private document: Document,
        private storage: Storage,
        private statusBar: StatusBar,
        private keyboard: Keyboard,
        private toastCtrl: ToastController,
        private platform: Platform,
        rendererFactory: RendererFactory2) {
        this.renderer = rendererFactory.createRenderer(null, null);
    }


    //return a clone of state
    get state() {
        return this._state = this.clone(this._state);
    }

    private clone(object) {
        return JSON.parse(JSON.stringify(object))
    }

    get(prop?: any) {
        const state = this.state;
        return state.hasOwnPropertyprop(prop) ? state[prop] : state;
    }


    set(prop: string, value: any) {
        //update the specified state property with the value
        this.storage.set('initial', value);
        this._state[prop] = value;
        if (value == 'light') {
            this.renderer.removeClass(this.document.body, 'dark');
            this.renderer.removeClass(this.document.body, 'black');
            this.renderer.addClass(this.document.body, 'light');
            this.platform.ready().then(() => {
                setTimeout(() => {
                    this.statusBar.styleDefault();
                    if (this.platform.is('android')) {
                        this.statusBar.backgroundColorByHexString('#edeff1')
                    }
                    this.keyboard.setKeyboardStyle(KeyboardStyle.Light);
                }, 1300);

            })

        } else if(value == 'black') {
            this.storage.set('darkTheme', 'black');
            this.renderer.removeClass(this.document.body, 'light');
            this.renderer.removeClass(this.document.body, 'dark');
            this.renderer.addClass(this.document.body, 'black');

            this.platform.ready().then(() => {

                setTimeout(() => {
                    this.statusBar.styleLightContent();
                    if (this.platform.is('android')) {
                        this.statusBar.backgroundColorByHexString('#000000')
                    }
                    this.keyboard.setKeyboardStyle(KeyboardStyle.Dark);
                }, 1300);

            })
        } else  {
            this.storage.set('darkTheme', 'dark');
            this.renderer.removeClass(this.document.body, 'light');
            this.renderer.removeClass(this.document.body, 'black');
            this.renderer.addClass(this.document.body, 'dark');

            this.platform.ready().then(() => {

                setTimeout(() => {
                    this.statusBar.styleLightContent();
                    if (this.platform.is('android')) {
                        this.statusBar.backgroundColorByHexString('#21253C')
                    }
                    this.keyboard.setKeyboardStyle(KeyboardStyle.Dark);
                }, 1300);

            })
        }
        this.toastCtrl.create({
            message: '',
            duration: 1000,
            cssClass: 'cheat-toast',
            position: 'bottom'
        }).then(toast => {
            toast.present();

        })

        return this._state[prop] = value;
    }
}