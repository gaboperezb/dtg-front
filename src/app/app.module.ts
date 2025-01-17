import { NgModule, Injectable } from '@angular/core';
import { BrowserModule, HammerGestureConfig, HAMMER_GESTURE_CONFIG, HammerModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { Device } from '@ionic-native/device/ngx';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { IonicStorageModule } from '@ionic/storage';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { File } from '@ionic-native/file/ngx';

import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { TapticEngine } from '@ionic-native/taptic-engine/ngx';
import { ChooseLeaguesPage } from './choose-leagues/choose-leagues.page';
import { AddCommentPage } from './add-comment/add-comment.page';
import { SignupAppPage } from './signup-app/signup-app.page';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { SharedModule } from './shared/shared.module';
import { FormsModule } from '@angular/forms';
import { LevelsPage } from './levels/levels.page';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { EditCommentPage } from './edit-comment/edit-comment.page';
import { Network } from '@ionic-native/network/ngx';
import { EditAnswerPage } from './edit-answer/edit-answer.page';
import { NewChatPage } from './new-chat/new-chat.page';
import { NgxLinkifyjsModule } from 'ngx-linkifyjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlashComponent } from './shared/flash.component';
import { HttpClientModule } from '@angular/common/http';
import { SharePostPage } from './share-post/share-post.page';
import * as Hammer from 'hammerjs';
import { MenuComponent } from './menu/menu.component';
import { VideoEditor } from '@ionic-native/video-editor/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { TriviaDetailPage } from './trivia-detail/trivia-detail.page';





const config: SocketIoConfig = { url: 'https://www.discussthegame.com', options: {/* reconnection: true,
reconnectionDelay: 1000,
reconnectionDelayMax : 5000,
reconnectionAttempts: Infinity */} };


@Injectable()
export class CustomHammerConfig extends HammerGestureConfig {

  overrides = {
    'swipe': {
      threshold: 5,
      direction: Hammer.DIRECTION_ALL
    }
  }

}

@NgModule({
  declarations: [
    AppComponent, 
    ChooseLeaguesPage, 
    SignupAppPage, 
    AddCommentPage, 
    LevelsPage, 
    EditCommentPage, 
    EditAnswerPage, 
    NewChatPage, 
    FlashComponent, 
    SharePostPage, 
    EditCommentPage,
    MenuComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    SocketIoModule.forRoot(config),
    NgxLinkifyjsModule.forRoot(),
    IonicModule.forRoot(), 
    HttpClientModule,
    IonicStorageModule.forRoot(),
    AppRoutingModule,
    BrowserAnimationsModule,
    HammerModule
    
  ],
  providers: [
    StatusBar,
    SplashScreen,
    FirebaseX,
    Device,
    SocialSharing,
    Keyboard,
    InAppBrowser,
    AppVersion,
    Network,
    Clipboard,
    File,
    VideoEditor,
    Camera,
    TapticEngine,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy } ,
    { provide: HAMMER_GESTURE_CONFIG, useClass: CustomHammerConfig }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
