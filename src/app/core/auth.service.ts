import { Injectable, ɵConsole } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { HttpClient, HttpHeaders, HttpErrorResponse, } from '@angular/common/http';
import { IUserDB, IUser } from '../shared/interfaces'
//Grab everything with import 'rxjs/Rx';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators'

import { WebSocketService } from './websocket.service';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { AppState } from './state.service'
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Storage } from '@ionic/storage';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    paramSignUp: any;
    disableTabs: boolean = true; //para que no le piquen muy rapido
    public token: any;
    currentUser: IUserDB;
    redirectUrl: string;
    gettingAnswers: boolean = false;
    toggleUsername: boolean = false;
    accessTokenFB: string;
    accessTokenG: string;
    google: boolean = false;
    facebook: boolean = false;
    connection: any;
    ioConnection: any;
    disconnection: any;
    connectionM: any;
    wifi: boolean = false;
    showAddComment: boolean = true;
    notifications: number = 0;
    public downloadProfile: boolean = true;
    public downloadNotifications: boolean = true;
    showLikeHelp: boolean = false;
    permissionForNotifications: boolean;
    leveledUp: boolean = false;
    initialTimeSpent: number = Date.now();
    visibleNotifications: any[] = []; //Para el componente de notifications
    noScroll: boolean = false;
    scroll: boolean = false;
    observableTabOne: any;
    swipeBackObservable: boolean = true;
    swipeBack: boolean = true;
    urlsStack: string[] = [];
    urlsStack1: string[] = ["/tabs/tab1"];
    urlsStack2: string[] = ["/tabs/tab2"];
    urlsStack4: string[] = ["/tabs/tab4"];
    urlsStack5: string[] = ["/tabs/tab5"];
    addurl: boolean = true;


    constructor(
        private appVersion: AppVersion,
        private firebase: FirebaseX, private toastCtrl: ToastController,
        private global: AppState,
        private http: HttpClient, public storage: Storage,
        private webSocketService: WebSocketService) {
        storage.get('user').then((val) => {
            if (!!val) {
                this.currentUser = val;

            }

        })

        this.observableTabOne = new BehaviorSubject(this.scroll);
    }

    addLastMessage(lastMessage: string, chat: string) {

        let data = {
            lastMessage,
            chat
        }
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.token);
        return this.http.put('https://www.discussthegame.com/api/user/chat-last-message', data, { headers: headers })
            .pipe(
                catchError(this.handleError)
            ).subscribe();
    }

    saveTimeSpent(timeSpent) {
        let data = {
            timeSpent
        }
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.token);
        return this.http.post('https://www.discussthegame.com/api/user/time-spent', data, { headers: headers })
            .pipe(
                catchError(this.handleError)
            ).subscribe();
    }

    isLoggedIn(): boolean {
        return !!this.currentUser;
    }

    facebookAuth() {
        return this.http.get("/api/user/auth/facebook")
            .pipe(
                tap((data: any) => {
                    if (data.user) this.currentUser = data.user;
                }),
                catchError(this.handleError));

    }

    saveLeagues(data) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.token);

        return this.http.post('https://www.discussthegame.com/api/user/save-leagues', data, { headers: headers })
            .pipe(

                catchError(this.handleError));
    }


    getFollowers(skip: number, user: string) {
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.token);
        return this.http.get("https://www.discussthegame.com/api/user/followers/" + user + "?skip=" + skip, { headers: headers })
            .pipe(

                catchError(this.handleError));

    }

    getFollowing(skip: number, user: string) {
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.token);
        return this.http.get("https://www.discussthegame.com/api/user/following/" + user + "?skip=" + skip, { headers: headers })
            .pipe(

                catchError(this.handleError));

    }

    getProfile(skip: number) {
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.token);
        return this.http.get("https://www.discussthegame.com/api/user/profile?skip=" + skip, { headers: headers })
            .pipe(

                catchError(this.handleError));

    }

    getUser(id: string) {
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.token);
        return this.http.get("https://www.discussthegame.com/api/user/user-fcm/" + id, { headers: headers })
            .pipe(

                catchError(this.handleError));
    }

    reportUser(user: string, reason: string, chat?: string) {
        let data = {
            user,
            reason,
            chat
        }
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        headers = headers.append('Authorization', this.token);
        return this.http.post("https://www.discussthegame.com/api/user/report", data, { headers: headers })
            .pipe(

                catchError(this.handleError));
    }

    unblockUser(user: string) {
        let data = {
            user
        }
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        headers = headers.append('Authorization', this.token);
        return this.http.post("https://www.discussthegame.com/api/user/unblock", data, { headers: headers })
            .pipe(

                catchError(this.handleError));
    }

    blockUser(user: string) {
        let data = {
            user
        }
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        headers = headers.append('Authorization', this.token);
        return this.http.post("https://www.discussthegame.com/api/user/block", data, { headers: headers })
            .pipe(

                catchError(this.handleError));
    }

    searchUsers(searchTerm: string, skip: number) {

        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.token);
        return this.http.get("https://www.discussthegame.com/api/user/search/" + searchTerm + "?skip=" + skip, { headers: headers })
            .pipe(

                catchError(this.handleError));

    }

    getTrivias(skip: number) {
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.token);
        return this.http.get("https://www.discussthegame.com/api/user/trivias?skip=" + skip, { headers: headers })
            .pipe(

                catchError(this.handleError));

    }

    follow(id: any) {
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.token);
        return this.http.put("https://www.discussthegame.com/api/user/follow/" + id, {}, { headers: headers })
            .pipe(

                catchError(this.handleError));
    }

    unfollow(id: any) {
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.token);
        return this.http.put("https://www.discussthegame.com/api/user/unfollow/" + id, {}, { headers: headers })
            .pipe(

                catchError(this.handleError));
    }

    getUserTrivias(skip: number, user: string) {

        return this.http.get("https://www.discussthegame.com/api/user/user-trivias?skip=" + skip + "&user=" + user)
            .pipe(
                catchError(this.handleError));
    }

    getTakes(skip: number) {
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.token);
        return this.http.get("https://www.discussthegame.com/api/user/takes?skip=" + skip, {headers})
            .pipe(
                catchError(this.handleError));
    }

    getOtherUserTakes(league: string, skip: number, user: string, leagues: string[]) {
        return this.http.get("https://www.discussthegame.com/api/user/other-user-takes?skip=" + skip + "&user=" + user + "&league=" + league + '&leagues=' + JSON.stringify(leagues))
            .pipe(

                catchError(this.handleError));
    }

    getOtherUserThreads(league: string, skip: number, user: string, leagues: string[]) {
        return this.http.get("https://www.discussthegame.com/api/user/other-user-threads?skip=" + skip + "&user=" + user + "&league=" + league + '&leagues=' + JSON.stringify(leagues))
            .pipe(

                catchError(this.handleError));
    }

    getUserProfile(skip: number, user: string) {

        return this.http.get("https://www.discussthegame.com/api/user/user-profile?skip=" + skip + "&user=" + user)
            .pipe(

                catchError(this.handleError));

    }


    getUserThreads(skip: number) {
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.token);
        return this.http.get("https://www.discussthegame.com/api/user/threads?skip=" + skip, { headers: headers })
            .pipe(

                catchError(this.handleError));

    }

    getUserThreadDiscussions(skip: number) {
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.token);
        return this.http.get("https://www.discussthegame.com/api/user/thread-discussions?skip=" + skip, { headers: headers })
            .pipe(

                catchError(this.handleError));

    }

    getUserThreadAnswers(skip: number) {
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.token);
        return this.http.get("https://www.discussthegame.com/api/user/thread-answers?skip=" + skip, { headers: headers })
            .pipe(

                catchError(this.handleError));

    }


    randomString(length: number) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }


    editUserInfo(data: any) {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        headers = headers.append('Authorization', this.token);
        let options = { headers: headers }
        return this.http.post('https://www.discussthegame.com/api/user/edit', data, options)
            .pipe(
                tap((data: any) => {
                    if (data.user) this.currentUser = data.user;
                }),
                catchError(this.handleError));


    }

    logOut() {

        this.webSocketService.disconnection();
        if(this.ioConnection) this.ioConnection.unsubscribe()
        if(this.disconnection) this.disconnection.unsubscribe();
        this.storage.set('token', '');
        this.storage.set('user', '');
        this.storage.set('initial', 'light');
        this.global.set('theme', 'light');
        
        this.currentUser = null;
        if(this.connection) this.connection.unsubscribe();

        this.firebase.getToken().then((token) => {

            let data = {
                playerId: token
            };

            let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
            headers = headers.append('Authorization', this.token);
            let options = { headers: headers }
            return this.http.post('https://www.discussthegame.com/api/user/log-out', data, options)
                .pipe(

                    catchError(this.handleError))
                .subscribe((data) => {
                    this.token = null;
                    this.storage.set('fcmtoken', '');
                    this.firebase.unregister();
                });
        })

    }

    forgot(data: any) {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        let options = { headers: headers }
        return this.http.post('/api/user/forgot', data, options)
            .pipe(

                catchError(this.handleError));

    }

    clearNotifications(newNotifications: number, type: string) {

        let data = {
            newNotifications,
            type
        }
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.token);
        let options = { headers: headers }
        return this.http.put('https://www.discussthegame.com/api/user/clear-notifications', data, options)
            .pipe(catchError(this.handleError));
    }

    allowDMS() {

       
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.token);
        let options = { headers: headers }
        return this.http.put('https://www.discussthegame.com/api/user/allow-dms', {}, options)
            .pipe(catchError(this.handleError))

    }


    clearOneNotification() {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.token);
        let options = { headers: headers }
        return this.http.put('https://www.discussthegame.com/api/user/clear-one-notification', {}, options)
            .pipe(catchError(this.handleError));
    }

    getReset(token: string) {
        return this.http.get("/api/user/reset/" + token)
            .pipe(
                catchError(this.handleError));


    }

    postReset(data: any, token: any) {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        let options = { headers: headers }
        return this.http.post('/api/user/reset/' + token, data, options)
            .pipe(

                tap((data: any) => {
                    if (data.user) this.currentUser = data.user;

                }),
                catchError(this.handleError));

    }

    changePassword(data: any) {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        headers = headers.append('Authorization', this.token);
        let options = { headers: headers }
        return this.http.post('https://www.discussthegame.com/api/user/change-password', data, options)
            .pipe(

                catchError(this.handleError));


    }

    deleteProfilePicture(fileName: string, fileNameThumbnail: string) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.token);
        let url = 'https://www.discussthegame.com/api/user/files/' + fileName + '/' + fileNameThumbnail;

        return this.http.delete(url, { headers: headers })
            .pipe(
                map((res: any) => {
                    let data = res.deleted;
                    return data;
                }),
                catchError(this.handleError));
    }


    deleteCoverPhoto(fileName: string) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.token);
        let url = 'https://www.discussthegame.com/api/user/file/' + fileName;

        return this.http.delete(url, { headers: headers })
            .pipe(
                map((res: any) => {
                    let data = res.deleted;
                    return data;
                }),
                catchError(this.handleError));
    }

    signup(user: IUser) {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        let options = { headers: headers }
        return this.http.post('https://www.discussthegame.com/api/user/signup', user, options)
            .pipe(

                tap((data: any) => {
                    if (data.user) {
                        this.global.set("theme", "light");
                        this.storage.set('initial', 'light');
                        this.currentUser = data.user;
                        this.token = data.token;
                 
                        this.storage.set('token', data.token);
                        this.storage.set('user', data.user);
                        this.notifications = this.currentUser.notifications.filter(n => n != "message").length;

                        this.webSocketService.connection();
                        this.webSocketService.updateConnection('online', this.currentUser._id);
                        this.webSocketService.loggedIn(this.currentUser._id)

                        this.disconnection = this.webSocketService.onDisconnection().subscribe(reason => {
                            if (reason === 'io server disconnect' || reason === 'transport close') {
                                // the disconnection was initiated by the server, you need to reconnect manually
                                this.webSocketService.connection();

                            }

                        })
                        this.ioConnection = this.webSocketService.onConnection().subscribe(() => {
                            
                            this.webSocketService.updateConnection('online', this.currentUser._id);
                            this.webSocketService.loggedIn(this.currentUser._id);

                        })
                        this.connection = this.webSocketService.onNotifications().subscribe(post => {
                            this.toastCtrl.create({
                                message: '',
                                duration: 1000,
                                cssClass: 'cheat-toast',
                                position: 'bottom'
                            }).then(toast => {
                                toast.present();

                            })
                            this.currentUser.notifications.push(post);
                            this.notifications = this.currentUser.notifications.filter(n => n != "message").length;
                        })


                    }
                }),
                catchError(this.handleError));

    }


    getAllTeams(league: string) {

        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.token);
        let options = { headers: headers }
        return this.http.get('https://www.discussthegame.com/api/teams?league=' + league, options)
            .pipe(
                catchError(this.handleError))

    }

    updateTeams(data: any) {

        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        headers = headers.append('Authorization', this.token);
        return this.http.put("https://www.discussthegame.com/api/teams/update-user-teams", data, { headers: headers })
            .pipe(
                catchError(this.handleError));
    }


    login(user: any) {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        let options = { headers: headers }
        return this.http.post('https://www.discussthegame.com/api/user/login', user, options)
            .pipe(

                tap((data: any) => {

                    if (data.blocked) {

                        this.toastCtrl.create({
                            message: `You have been blocked from DiscussTheGame. \nReason: ${data.blockedReason}`,
                            duration: 8000,
                            position: 'top'
                        }).then(toast => toast.present());
                    }
                    else if (data.user) {
                        this.global.set('theme', "light");
                        this.storage.set('initial', 'light');
                        this.currentUser = data.user;
                        this.token = data.token;
                      
                        this.storage.set('token', data.token);
                        this.storage.set('user', data.user);
                        this.notifications = this.currentUser.notifications.filter(n => n != "message").length;

                        this.webSocketService.connection();
                        this.webSocketService.updateConnection('online', this.currentUser._id);
                        this.webSocketService.loggedIn(this.currentUser._id)
                        this.disconnection = this.webSocketService.onDisconnection().subscribe(reason => {
                            if (reason === 'io server disconnect' || reason === 'transport close') {
                                // the disconnection was initiated by the server, you need to reconnect manually
                                this.webSocketService.connection();

                            }

                        })
                        this.ioConnection = this.webSocketService.onConnection().subscribe(() => {

                            this.webSocketService.updateConnection('online', this.currentUser._id);
                            this.webSocketService.loggedIn(this.currentUser._id);

                        })
                        this.connection = this.webSocketService.onNotifications().subscribe(post => {
                            this.toastCtrl.create({
                                message: '',
                                duration: 1000,
                                cssClass: 'cheat-toast',
                                position: 'bottom'
                            }).then(toast => {
                                toast.present();

                            })
                            this.currentUser.notifications.push(post);
                            this.notifications = this.currentUser.notifications.filter(n => n != "message").length;
                        })



                    }




                }),
                catchError(this.handleError));

    }




    getNotificationsOnResume() {

        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.token);
        let options = { headers: headers }
        return this.http.get('https://www.discussthegame.com/api/user/resume', options)
            .pipe(

                tap((data: any) => {
                    if (data.blocked) {
                        this.logOut();
                        this.storage.set('blocked', '1');
                        this.toastCtrl.create({
                            message: `You have been blocked from DiscussTheGame.\nReason: ${data.blockedReason}`,
                            duration: 8000,
                            position: 'top'
                        }).then(toast => toast.present())

                    }
                    if (data.notifications) this.notifications = data.notifications.filter(n => n != "message").length;


                    if (data.badge.level > this.currentUser.badge.level) {
                        setTimeout(() => {
                            this.leveledUp = true;
                        }, 1000);
                    }
                    this.currentUser = data;

                }),
                catchError(this.handleError))
            .subscribe();

    }


    saveFirebaseToken(token: string) {

        let data = {
            playerId: token
        };
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.token);
        let options = { headers: headers };
        return this.http.post('https://www.discussthegame.com/api/user/save-fcm', data, options)
            .pipe(

                tap((data: any) => {

                    if (data.updated) {
                        this.currentUser.playerIds.push(token);
                        this.storage.set('fcmtoken', token);
                        this.permissionForNotifications = true; //Notifications page
                    } else {
                        this.storage.set('fcmtoken', '');
                    }

                }),
                catchError(this.handleError))
            .subscribe();

    }

    checkAuthentication() {

    
        //Load token if exists
        this.storage.get('token').then((value) => {

            if (!!value) {
                this.token = value;
                let headers = new HttpHeaders();
                headers = headers.append('Authorization', this.token);
                return this.http.get('https://www.discussthegame.com/api/user/session', { headers: headers })
                    .pipe(
                        map((res: any) => {
                            const data = res;
                            return data.user;
                        }),
                        tap(currentUser => {
                            if (!!currentUser) {

                                
                                if (currentUser.blocked) {

                                    this.storage.set('blocked', '1');
                                    this.logOut();
                                    this.toastCtrl.create({
                                        message: `You have been blocked from DiscussTheGame. \nReason: ${currentUser.blockedReason}`,
                                        duration: 8000,
                                        position: 'top'
                                    }).then(toast => toast.present())

                                }
                                if (currentUser.badge.level > this.currentUser.badge.level) {
                                    setTimeout(() => {
                                        this.leveledUp = true;
                                    }, 1000);
                                }
                                this.storage.set('user', currentUser);
                               
                                this.currentUser = currentUser;
                                this.notifications = this.currentUser.notifications.filter(n => n != "message").length;
                                this.webSocketService.connection();
                                this.webSocketService.updateConnection('online', this.currentUser._id);
                                this.webSocketService.loggedIn(this.currentUser._id)
                                
                                this.firebase.onTokenRefresh().subscribe(token => {
                                    if (this.currentUser.playerIds.indexOf(token) == -1) {
                                        this.saveFirebaseToken(token);
                                    }

                                });
                                this.disconnection = this.webSocketService.onDisconnection().subscribe(reason => {
                                    if (reason === 'io server disconnect' || reason === 'transport close') {
                                        // the disconnection was initiated by the server, you need to reconnect manually
                                        this.webSocketService.connection();
                                    }

                                })
                                this.ioConnection = this.webSocketService.onConnection().subscribe(() => {

                                    this.webSocketService.updateConnection('online', this.currentUser._id);
                                    this.webSocketService.loggedIn(this.currentUser._id);

                                })

                                this.connection = this.webSocketService.onNotifications().subscribe(post => {
                                    this.toastCtrl.create({
                                        message: '',
                                        duration: 1000,
                                        cssClass: 'cheat-toast',
                                        position: 'bottom'
                                    }).then(toast => {
                                        toast.present();
                                    })
                                    this.currentUser.notifications.push(post);
                                    this.notifications = this.currentUser.notifications.filter(n => n != "message").length;
                                })
                                
                            }

                        }),
                        catchError(this.handleError))
                    .subscribe();

            } else {

            }
        });
    }

    saveVersion(versionNumber) {
        let data = {
            versionNumber
        };
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.token);
        let options = { headers: headers }
        return this.http.post('https://www.discussthegame.com/api/user/save-version-number', data, options)
            .pipe(
                tap((data) => {
                    this.currentUser.versionNumber = versionNumber;
                }),
                catchError(this.handleError))
            .subscribe();
    }


    getNotis() {

        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.token);
        return this.http.get('https://www.discussthegame.com/api/user/notis', { headers: headers })
            .pipe(

                catchError(this.handleError));

    }





    getSignedRequest(fileName: string, fileType: string) {
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.token);
        let url = `https://www.discussthegame.com/api/user/sign-s3?file-name=${fileName}&file-type=${fileType}`;
        return this.http.get(url, { headers: headers })
            .pipe(

                catchError(this.handleError));

    }

    uploadFile(signedRequest: string, file: any) {
        return this.http.put(signedRequest, file)
            .pipe(
                catchError(this.handleError))
    }



    private handleError(error) {
        console.error('server error:', error);
        let errorMessage = '';
        if (error instanceof HttpErrorResponse) {
          // client-side error
          errorMessage = `Oops! Something went wrong`;
        } else {
          // server-side error
          errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }
        return throwError(errorMessage);
      }


}


