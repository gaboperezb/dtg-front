import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, } from '@angular/common/http';
import { IChat } from '../shared/interfaces'
//Grab everything with import 'rxjs/Rx';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators'
import { AuthService } from './auth.service';
import { WebSocketService } from './websocket.service';
import { FcmProvider } from './fcm.service';
import { FlashProvider } from './flash.service';
import { Storage } from '@ionic/storage';
import { ToastController, NavController } from '@ionic/angular';
import * as _ from 'lodash';
import { Router } from '@angular/router';
import { ThreadsService } from './threads.service';
import { TakeService } from './take.service';

@Injectable({
    providedIn: 'root'
})
export class ChatService {

    baseUrl: string = 'https://www.discussthegame.com/api/chat';
    chats: IChat[] = [];
   
    discoverChats: IChat[] = [];
    channelMessages: any = [];
    unreadChats: boolean = false;
    sb: any;
    wait: boolean = true;
    channelListQuery: any;
    prevMessageListQuery: any;
    typingMembers: any[];
    chatNotificationsNumber: number = 0;
    connectionM;
    connectionTS;
    currenChatRoom: string;
    connectionTE;
    typingTimeout;
    chatNotification = false; //para distinguir entre notification de chat y de room, y top tabs ui de chats
    observableTyping;
    waitForRooms = false;
    boolPresentCheat: boolean = true;
    roomsFilterBy: string = 'TOP';
    connecting: boolean = true;
    countForConnecting: number = 0; //Se compara esta variable con unreadschats totales al bajar chats. Cuando se iguala  (se acaban de bajar chats) a esta se quieta "connecting"
    connectingDetail: boolean = true;
    cheatForTyping: boolean = true;

    typingIndex: number;
    urlsToHide: string[] = ['thread-detail', 'new-thread', 'chat-info', 'chat-detail']
    currentChatId: string = "";
    skip: number = 0;
    skipRooms: number = 0;
    enableInfinite: boolean = true;
    membersIds: any[] = [];

    constructor(
        private http: HttpClient,
        private fcm: FcmProvider,
        private flash: FlashProvider,
        private storage: Storage,
        private navCtrl: NavController,
        private router: Router,
        private takeService: TakeService,
        private toastCtrl: ToastController,
        private webSocketService: WebSocketService,
        private threadsService: ThreadsService,
        private authService: AuthService,
    ) {
        this.connection()
        this.observableTyping = new BehaviorSubject(false);

    }


    connection() {
        if (this.connectionM) this.connectionM.unsubscribe();
        if (this.connectionTS) this.connectionTS.unsubscribe();
        if (this.connectionTE) this.connectionTE.unsubscribe();
        this.messageHandler();
        this.typingStartHandler();
        this.typingEndHandler();
    }





    addMembersThroughMessages(messages: any[], chat: any) { //para rooms

        let members = messages.map(msg => msg.user);
        let membersFiltered = members.filter((a, b) => members.findIndex(_a => _a._id == a._id) === b);
        let chatM = chat.members.concat(membersFiltered);
        let chatMFiltered = chatM.filter((a, b) => chatM.findIndex(_a => _a._id == a._id) === b);

        chat.members = chatMFiltered;



    }

    messageHandler() {

        this.connectionM = this.webSocketService.onMessages().subscribe((data: any) => {
            setTimeout(() => {
                let chatFromSocket = data.chat;
                let messageFromSocket = data.message
                let found = false;


                if (this.channelMessages[chatFromSocket._id]) {

                    if (!this.channelMessages[chatFromSocket._id].find(m => m._id == messageFromSocket._id)) {

                        this.channelMessages[chatFromSocket._id].push(messageFromSocket);



                    }

                } else {
                    this.channelMessages[chatFromSocket._id] = [];
                    setTimeout(() => {
                        this.channelMessages[chatFromSocket._id].push(messageFromSocket);
                    }, 300);
                }

                if (!chatFromSocket.room) {
                    for (let index = 0; index < this.chats.length; index++) {
                        if (this.chats[index]._id == chatFromSocket._id) {

                            if (messageFromSocket.customType == 'operation' && chatFromSocket.name != this.chats[index].name) this.chats[index].chatName = chatFromSocket.name;
                            this.chats[index].lastMessage = messageFromSocket;
                            this.chats[index].lastMessage.createdAt = new Date(messageFromSocket.createdAt);
                            this.chats[index].lastMessageTime = this.created(new Date(chatFromSocket.lastMessage.createdAt));
                            this.chats[index].unreadMessageCount += 1;

                            this.chats[index].clicked = false;
                            found = true;


                            break;
                        }
                    }

                }


                if (found && !chatFromSocket.room) {
                    this.sortChats();

                }
                
                const urlArray = this.router.url.split('/');
                const page = urlArray[3] || 'home';


                if (this.urlsToHide.indexOf(page) == -1 && !chatFromSocket.room) {
                    if (!this.takeService.destroyDiscussions) { //para esperar hasta que se vuelvan a cargar los videos (causa errores)
                        setTimeout(() => {
                            this.flash.show(messageFromSocket.user, messageFromSocket.message, chatFromSocket._id, 4000, chatFromSocket.name);
                        }, 300);

                    }

                }

                if (!chatFromSocket.room) this.determineChatNotifications();
                this.presentCheatToast();
            }, 300);

        })
    }


    typingStartHandler() {
        this.connectionTS = this.webSocketService.onStartTyping().subscribe((data: any) => {


            let chatFromSocket = data.chat;
            let usernameFromSocket = data.username;

            if (!chatFromSocket.room) {
                for (let index = 0; index < this.chats.length; index++) {
                    if (this.chats[index]._id == chatFromSocket._id) {

                        this.cheatForTyping = true;
                        this.chats[index].typing = 'is typing...';
                        this.chats[index].usernameTyping = usernameFromSocket;

                        this.presentCheatToast();
                        this.observableTyping.next(true);

                        //Por si hay error
                        clearTimeout(this.typingTimeout);
                        this.typingTimeout = setTimeout(() => {
                            this.cheatForTyping = false;
                            this.chats[index].typing = ''
                            this.chats[index].usernameTyping = ''
                            this.presentCheatToast();
                        }, 10000);
                        break;
                    }
                }
            } 

        })
    }

    typingEndHandler() {

        this.connectionTE = this.webSocketService.onEndTyping().subscribe((data: any) => {

            let chatFromSocket = data.chat;

            if (!chatFromSocket.room) {
                for (let index = 0; index < this.chats.length; index++) {
                    if (this.chats[index]._id == chatFromSocket._id) {
                        this.chats[index].typing = '';
                        this.chats[index].usernameTyping = '';
                        this.presentCheatToast();
                        break;
                    }

                }
            } 

        })
    }


    presentCheatToast() {
        this.toastCtrl.create({
            message: '',
            duration: 1000,
            cssClass: 'cheat-toast',
            position: 'bottom'
        }).then(toast => {
            toast.present();

        })
    }

    createUserMetaData() {
        var data = {
            username: this.authService.currentUser.username,
            profilePicture: this.authService.currentUser.profilePicture,
            profilePictureThumbnail: this.authService.currentUser.profilePictureThumbnail
        };
        var user = this.sb.currentUser;
        if (!user.metadata) {
            user.createMetaData(data, function (metadata, error) {
                if (error) {
                    return;
                }
            });
        }
    }


    sortChats() {
        this.chats.sort((a, b) => {
            return (b.lastMessage ? b.lastMessage.createdAt : b.createdAt) - (a.lastMessage ? a.lastMessage.createdAt : a.createdAt);
        });
    }


    markAsRead(chat) {

        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        headers = headers = headers.append('Authorization', this.authService.token);
        let options = { headers: headers }
        return this.http.put(this.baseUrl + "/markasread/" + chat, {}, options)
            .pipe(

                catchError(this.handleError))
            .subscribe()

    }


    sendMessage(groupChannel, message, user) {

        let messageToAppend = {
            _sender: {
                userId: user._id
            },
            data: {
                profilePictureThumbnail: user.profilePictureThumbnail
            },
            message,
            customType: 'text'
        }
        if (this.channelMessages[groupChannel.url]) {
            this.channelMessages[groupChannel.url].push(messageToAppend)
        } else {
            this.channelMessages[groupChannel.url] = [];
            this.channelMessages[groupChannel.url].push(messageToAppend)

        }

        const params = new this.sb.UserMessageParams();
        params.message = message;
        params.customType = "text";
        params.mentionType = 'channel';
        params.pushNotificationDeliveryOption = 'default';  // Either 'default' or 'suppress' 

        groupChannel.sendUserMessage(params, (message, error) => {
            if (error) {
                return;
            }


        });
    }


    newMessage(chatId, data) {

        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        headers = headers.append('Authorization', this.authService.token);
        let options = { headers: headers };
        return this.http.post(this.baseUrl + "/messages/" + chatId, data, options)
            .pipe(
                catchError(this.handleError));
    }

    checkIfOnline(chatId: any) {

        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.authService.token);
        return this.http.get(this.baseUrl + '/chat/' + chatId, { headers: headers })
            .pipe(

                catchError(this.handleError));


    }

    getMoreChats(skip: number) {

        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.authService.token);
        return this.http.get(this.baseUrl + "?skip=" + skip, { headers: headers })
            .pipe(
                tap((chats: any[]) => {

                    chats.forEach(channel => {
                        let umc = channel.unreadMessages.filter(unread => unread.user.toString() == this.authService.currentUser._id.toString())[0].unreadMessageCount;
                        channel.unreadMessageCount = umc;
                        if (channel.lastMessage) {
                            channel.lastMessage.createdAt = new Date(channel.lastMessage.createdAt);
                            channel.lastMessageTime = this.created(channel.lastMessage.createdAt)
                        } else {
                            channel.createdAt = new Date(channel.createdAt);
                            channel.lastMessageTime = this.created(channel.createdAt)
                        }

                    });
                    this.chats = this.chats.concat(chats);
                    this.determineChatNotifications();

                }),
                catchError(this.handleError))

    }


    addPeopleToChat(data: any, chat: string) {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        headers = headers.append('Authorization', this.authService.token);
        let options = { headers: headers }
        return this.http.put(this.baseUrl + "/add/" + chat, data, options)
            .pipe(

                catchError(this.handleError))
    }

    makeItPublic(chat: string) {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        headers = headers.append('Authorization', this.authService.token);
        let options = { headers: headers };;
        return this.http.put(this.baseUrl + "/public/" + chat, {}, options)
            .pipe(

                catchError(this.handleError))
    }


    muteMessages(chat: string) {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        headers = headers.append('Authorization', this.authService.token);
        let options = { headers: headers };;
        return this.http.put(this.baseUrl + "/mute/" + chat, {}, options)
            .pipe(

                catchError(this.handleError))
    }

    editChatName(data: any, chat: string) {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        headers = headers.append('Authorization', this.authService.token);
        let options = { headers: headers }
        return this.http.put(this.baseUrl + "/name/" + chat, data, options)
            .pipe(

                catchError(this.handleError))

    }

    deleteChat(chat: string) {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        headers = headers.append('Authorization', this.authService.token);
        let options = { headers: headers }
        return this.http.put(this.baseUrl + "/leave/" + chat, {}, options)
            .pipe(

                catchError(this.handleError))

    }

    removeMember(data: any, chat: string) {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        headers = headers.append('Authorization', this.authService.token);
        let options = { headers: headers }
        return this.http.put(this.baseUrl + "/remove/" + chat, data, options)
            .pipe(

                catchError(this.handleError))

    }



    getChats(skip: number, conVar?: boolean) {

        if (!conVar) this.connecting = true; //General, se asigne unicamente si no viene de la pagina de chats (para evitar que aparezca rapidamente el letrero de no-chats)
        this.connectingDetail = true; //para chat Detail
        let headers = new HttpHeaders();
        headers = headers = headers.append('Authorization', this.authService.token);
        return this.http.get(this.baseUrl + "?skip=" + skip, { headers: headers })
            .pipe(

                tap((chats: any[]) => {
                    this.connectingDetail = false;

                    if (chats.length) {
                        chats.forEach(channel => {
                            let umc = channel.unreadMessages.filter(unread => unread.user.toString() == this.authService.currentUser._id.toString())[0].unreadMessageCount;
                            channel.unreadMessageCount = umc;
                            if (channel.lastMessage) {
                                channel.lastMessage.createdAt = new Date(channel.lastMessage.createdAt);
                                channel.lastMessageTime = this.created(channel.lastMessage.createdAt)
                            } else {
                                channel.createdAt = new Date(channel.createdAt);
                                channel.lastMessageTime = this.created(channel.createdAt)
                            }

                            channel.connecting = true;
                        });


                        if (this.chats.length > 0) {

                            let chatsToCompare = chats.filter(c => !!c.lastMessage)
                            let localChatsToCompare = this.chats.filter(c => !!c.lastMessage)
                            if (!_.isEqual(chatsToCompare.map(c => c.lastMessage._id), localChatsToCompare.map(c => c.lastMessage._id))) {
                                this.chats = chats;
                            }

                        } else {
                            this.chats = chats;
                        }

                        this.determineChatNotifications();
                        if (this.chatNotificationsNumber == 0) this.connecting = false;
                        this.chats.forEach((chat) => {
                            this.checkToGetMessages(chat);
                        })

                        this.sortChats();


                    } else {
                        this.connecting = false;
                    }



                }),
                catchError(this.handleError)).
            subscribe();

    }

    getRoomChats(skip: number, room: string) {

        this.connecting = true; //General, se asigne unicamente si no viene de la pagina de chats (para evitar que aparezca rapidamente el letrero de no-chats)
        this.connectingDetail = true; //para chat Detail
        let headers = new HttpHeaders();
        headers = headers = headers.append('Authorization', this.authService.token);
        return this.http.get(this.baseUrl + '/rooms/' + room + "?skip=" + skip, { headers: headers })
            .pipe(
                tap((chats: any[]) => {

                    this.connectingDetail = false;
                    chats.forEach(channel => {

                    });
                    this.connecting = false;
                    this.waitForRooms = false;

                }),
                catchError(this.handleError))


    }

    getMessageCount(chat: string) {

        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.authService.token);
        return this.http.get(this.baseUrl + "/message-count/" + chat, { headers: headers })
            .pipe(
                catchError(this.handleError))

    }

   

    getChatsOnResume(skip: number) {


        this.connecting = true;
        this.connectingDetail = true;
        this.countForConnecting = 0;
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.authService.token);
        return this.http.get(this.baseUrl + "?skip=" + skip, { headers: headers })
            .pipe(
                tap((chats: any[]) => {

                    this.connectingDetail = false;
                    this.presentCheatToast();
                    if (chats.length) {

                        chats.forEach(channel => {

                            let umc = channel.unreadMessages.filter(unread => unread.user == this.authService.currentUser._id)[0].unreadMessageCount;
                            channel.unreadMessageCount = umc;
                            if (channel.lastMessage) {
                                channel.lastMessage.createdAt = new Date(channel.lastMessage.createdAt);
                                channel.lastMessageTime = this.created(channel.lastMessage.createdAt)
                            } else {
                                channel.createdAt = new Date(channel.createdAt);
                                channel.lastMessageTime = this.created(channel.createdAt)
                            }


                            //Para saber cuantos son diferentes
                            let foundChat = this.chats.find(c => c._id == channel._id);
                            if (foundChat) {
                                if (channel.lastMessage && foundChat.lastMessage && (channel.lastMessage._id != foundChat.lastMessage._id) && channel.unreadMessageCount > 0) {
                                    this.countForConnecting += 1;
                                    channel.connecting = true;
                                }
                            } else if (channel.unreadMessageCount > 0) {
                                this.countForConnecting += 1;
                                channel.connecting = true;
                            }

                        });


                        //si se crea un grupo nuevo no hay lastmessage y causa error.
                        let chatsToCompare = chats.filter(c => !!c.lastMessage)
                        let localChatsToCompare = this.chats.filter(c => !!c.lastMessage)

                        if (!_.isEqual(chatsToCompare.map(c => c.lastMessage._id), localChatsToCompare.map(c => c.lastMessage._id))) {

                            this.chats = chats;
                            this.determineChatNotifications()
                            if (this.chatNotificationsNumber == 0) {
                                this.connecting = false;
                                this.presentCheatToast();
                            }
                            chats.forEach((chat) => {
                                this.checkToGetMessagesOnResume(chat);
                            })

                        } else {
                            this.connecting = false;
                            this.presentCheatToast();
                        }

                        this.sortChats();


                    } else {
                        this.connecting = false;
                    }


                }),
                catchError(this.handleError)).
            subscribe();

    }



    checkToGetMessages(chat: any) {

        this.storage.get(chat._id).then((value) => {
            if (!!value) {//existe

                if (!this.channelMessages[chat._id]) this.channelMessages[chat._id] = JSON.parse(value);

                if (chat.unreadMessageCount > 0) this.getMessages(chat);
                else {
                    chat.connecting = false;
                }

            } else {

                this.getMessages(chat);

            }
        })
    }

    checkToGetMessagesOnResume(chat: any) {
        if (chat.unreadMessageCount > 0) this.getMessages(chat);
    }


    getMessages(chat: any) {
        let limit = (chat.unreadMessageCount > 30 && chat.unreadMessageCount < 100) ? chat.unreadMessageCount : 30;
        this.getMessagesForChat(chat._id, 0, limit)
            .subscribe((messages) => {

                if (chat.unreadMessageCount == 0) {
                    this.storage.set(chat._id, JSON.stringify(messages));
                }

                let localMess;
                let dbMess;
                if (messages.length > 0) {
                    if (this.channelMessages[chat._id]) {
                        localMess = this.channelMessages[chat._id].concat().reverse().slice(0, 30).map(e => e.message);
                    } else {
                        localMess = [];
                    }
                    dbMess = messages.concat().reverse().slice(0, 30).map(e => e.message)

                    if (dbMess.sort().join(',') === localMess.sort().join(',')) {
                        //equal
                    } else {
                        this.channelMessages[chat._id] = messages;
                    }
                }

                chat.connecting = false;
                this.presentCheatToast();
                this.countForConnecting += 1;
                if (this.countForConnecting >= this.chatNotificationsNumber) {
                    if (this.connecting) this.presentCheatToast();
                    this.connecting = false;
                    this.countForConnecting = 0;
                }

            })
    }


    determineChatNotifications() {

        this.chatNotificationsNumber = this.chats.reduce((acc, curr) => {
            return curr.unreadMessageCount > 0 ? 1 + acc : 0 + acc;
        }, 0)

        this.authService.clearNotifications(this.chatNotificationsNumber, 'message')
            .subscribe()
        let array = [];
        for (let index = 0; index < this.chatNotificationsNumber; index++) {
            array.push("message");
        }
        this.authService.currentUser.notifications = this.authService.currentUser.notifications.filter(n => n != 'message')
        this.authService.currentUser.notifications = this.authService.currentUser.notifications.concat(array)
        this.fcm.setBadge(this.authService.currentUser.notifications.length);

    }




    getMessagesForChat(chatId: string, skip: number, limit: number): Observable<any[]> {
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.authService.token);
        return this.http.get(this.baseUrl + "/messages/" + chatId + "?skip=" + skip + "&limit=" + limit, { headers: headers })
            .pipe(
                map((res: any) => {

                    let messages = res;
                    messages.reverse();

                    return messages;
                }),

                catchError(this.handleError));

    }



    containsObject(id, list) {
        var i;
        for (i = 0; i < list.length; i++) {
            if (list[i]._id === id) {
                return true;
            }
        }

        return false;
    }

    getChat(id) {
        return this.chats.find(chat => chat._id === id)
    }

    checkChat(data: any) {

        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        headers = headers = headers.append('Authorization', this.authService.token);
        let options = { headers: headers };
        return this.http.post(this.baseUrl + "/check", data, options)
            .pipe(catchError(this.handleError));

    }


    addNewChat(chat: any) {

        if (chat.lastMessage) {
            chat.lastMessage.createdAt = new Date(chat.lastMessage.createdAt);
            chat.lastMessageTime = this.created(chat.lastMessage.createdAt)
        } else {
            chat.createdAt = new Date(chat.createdAt);
            chat.lastMessageTime = this.created(chat.createdAt)
        }
        this.chats.unshift(chat);

    }

    editType(data: any) {

        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        headers = headers = headers.append('Authorization', this.authService.token);
        let options = { headers: headers };
        return this.http.put(this.baseUrl + "/type/" + data.chat, data, options)
            .pipe(

                catchError(this.handleError));

    }


    createChat(data: any) {

        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        headers = headers = headers.append('Authorization', this.authService.token);
        let options = { headers: headers };
        return this.http.post(this.baseUrl + "/", data, options)
            .pipe(

                catchError(this.handleError));

    }

    created(date: Date): string {

        let milliseconds = date.getTime();
        let now = new Date();
        let millisecondsNow = now.getTime();
        let diffInHours = (millisecondsNow - milliseconds) / (1000 * 60 * 60); //hours
        let typeTime;

        if (diffInHours >= 24) {
            //DAYS
            let threadCreated = Math.floor(diffInHours / 24); //Template binding
            typeTime = "d"
            return `${threadCreated} ${typeTime}`

        } else if (diffInHours < 1 && diffInHours > 0) {
            //MINUTES
            let threadCreated = Math.ceil(diffInHours * 60); //Template binding
            typeTime = "min"
            return `${threadCreated} ${typeTime}`

        } else {
            //HOURS   
            let threadCreated = Math.floor(diffInHours); //Template binding
            typeTime = "h"
            return `${threadCreated} ${typeTime}`
        }
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