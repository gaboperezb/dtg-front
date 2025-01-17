import { Component, ElementRef, ViewChild } from '@angular/core';
import { ModalController, LoadingController, ToastController, ActionSheetController, DomController, AlertController, NavController, IonContent } from '@ionic/angular';
import { IThread, ITimeline } from '../../app/shared/interfaces'
import { AuthService } from '../../app/core/auth.service';
import { ThreadsService } from '../../app/core/threads.service';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
import { ThreadDiscussionService } from '../../app/core/thread-discussion.service';
import { ThreadLikesService } from '../../app/core/thread-likers.service';
import { WebSocketService } from '../../app/core/websocket.service';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { AppState } from '../../app/core/state.service';
import { FcmProvider } from '../../app/core/fcm.service';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { AddCommentPage } from '../add-comment/add-comment.page';
import { SignupAppPage } from '../signup-app/signup-app.page';
import { SharePostPage } from '../share-post/share-post.page';
import { NewChatPage } from '../new-chat/new-chat.page';
import { ChatService } from '../core/chat.service';

import { Clipboard } from '@ionic-native/clipboard/ngx';




/**
 * Generated class for the ThreadDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'app-thread-detail',
    templateUrl: './thread-detail.page.html',
    styleUrls: ['./thread-detail.page.scss']
})

export class ThreadDetailPage {


    threaddd: any;
    prueba: number = 0;
    thread: IThread;
    options: string[] = [];
    optionsWithPercentage: any[] = [];
    totalVotes: number;
    showResults: boolean = false;
    voted: boolean = false;
    percentageSum: number = 0;
    timelines: ITimeline[] = [];
    hot: boolean = true;
    new: boolean = false;
    pollEffect: boolean = false;
    top: boolean = false;
    sortBy: string = "HOT COMMENTS";
    loadingDiscussions: boolean = false;
    editUrl: string = '/tabs/tab1';
    admin: boolean = false;
    loadingInitial: boolean = true;
    reactivateInfinite: any;
    skipHot: number = 0;
    skipNew: number = 0;
    skipTop: number = 0;
    loadingImage: boolean = true;
    opacityToCero: boolean = false;
    imageToDisplay: string;
    enableInfinite: boolean = false;
    loaderInstance: any;
    scrollTO: any;
    notificationInformation: any;
    loadingThread: boolean = false;
    scrollPosition: number;
    swipeTimeOut: any;


    savedForToolbar: boolean = false;

    @ViewChild('tabDetail', { static: true }) content: IonContent;

    constructor(
        private fcm: FcmProvider,
        private navCtrl: NavController,
        private alertCtrl: AlertController,
        private domCtrl: DomController,
        private chatService: ChatService,
        public modalCtrl: ModalController,
        private route: ActivatedRoute,
        public authService: AuthService,
        private clipboard: Clipboard,
        private threadsService: ThreadsService,
        private inAppBroswer: InAppBrowser,
        private likesService: ThreadLikesService,
        private threadDiscussionService: ThreadDiscussionService,
        private router: Router,
        public toastCtrl: ToastController,
        private actionSheetCtrl: ActionSheetController,
        public loadingCtrl: LoadingController,
        private webSocketService: WebSocketService,
        private socialSharing: SocialSharing,
        public global: AppState,
        private el: ElementRef) {

        let id = this.route.snapshot.paramMap.get('id');

        this.notificationInformation = this.authService.paramSignUp; //De notificación
        if (this.notificationInformation) {
            if (!this.notificationInformation.fcmThread) {
                if (!this.threadsService.getThread(id)) {
                    if (!this.threadsService.threadUserPage.created) {
                        this.threadsService.threadUserPage.created = this.created(this.threadsService.threadUserPage);
                    }
                    this.thread = this.threadsService.threadUserPage;
                }
                else {
                    this.thread = this.threadsService.getThread(id);
                }


            } else {
                this.loadingThread = true;
            }

        } else {
            if (!this.threadsService.getThread(id)) {
                if (!this.threadsService.threadUserPage) return //cordova kill
                if (!this.threadsService.threadUserPage.created) {
                    this.threadsService.threadUserPage.created = this.created(this.threadsService.threadUserPage);
                }
                this.thread = this.threadsService.threadUserPage;
            }
            else {
                this.thread = this.threadsService.getThread(id);
            }

        }
    }


    ngAfterViewInit() {
        let elements = this.el.nativeElement.querySelector('.thread-description a')
        if (elements) elements.addEventListener('click', this.onClick.bind(this));
        //this.deleteEmptyTags()
    }

  


    deleteEmptyTags() {

        var wrapper = document.querySelector('.thread-description');
        console.log(wrapper)
        let test = wrapper.querySelectorAll('p')
        console.log(test)

        for (var p = 0; p < test.length; p++) {

            if (test[p].innerHTML === '<br>') {
                test[p].classList.add("empty")
            }
        }
    }


    onClick(event) {
        event.preventDefault()
        let href = event.srcElement.href;
        const browser = this.inAppBroswer.create(href, '_system');
    }

    ngOnInit() {

        if (this.notificationInformation) {
            if (this.notificationInformation.fcmThread) {

                setTimeout(() => {
                    this.getThread(this.notificationInformation.threadId);
                }, 800);

            } else {

                if (this.authService.isLoggedIn()) {
                    if (this.authService.currentUser.username === this.thread.user.username || this.authService.currentUser.isAdmin) {
                        this.showResults = true;
                    }
                }

                if (this.thread.pollValues.length > 1) {
                    this.options = this.thread.pollValues;
                    this.totalVotes = this.thread.votes.length;
                    this.userHasVoted();
                }
                else if (this.thread.abValues.length > 1) {

                    this.options = this.thread.abValues;
                    this.totalVotes = this.thread.votes.length;
                    this.userHasVoted();
                }

                setTimeout(() => {
                    this.enableInfinite = true;
                }, 2000);

            }
        } else {
            if (!this.thread) {
                this.goToTabRoot()
                return
            } // cordova kill
            if (this.authService.isLoggedIn()) {
                if (this.authService.currentUser.username === this.thread.user.username || this.authService.currentUser.isAdmin) {
                    this.showResults = true;
                }
            }
            if (this.thread.pollValues.length > 1) {
                this.options = this.thread.pollValues;
                this.totalVotes = this.thread.votes.length;
                this.userHasVoted();
            }
            else if (this.thread.abValues.length > 1) {

                this.options = this.thread.abValues;
                this.totalVotes = this.thread.votes.length;
                this.userHasVoted();
            }

            setTimeout(() => {

                this.enableInfinite = true;
            }, 2000);
        }

        if (this.thread) this.savedForToolbar = this.userHasSaved(this.thread);
    }

    goToTabRoot() {
        this.navCtrl.navigateRoot(this.router.url.substr(0, 10))
    }




    ionViewDidEnter() {

        //track views
        if (!this.thread) return // cordova kill
        setTimeout(() => {
            this.content.scrollY = true;
        }, 100);

        if (this.authService.paramSignUp) {

            if (!this.authService.paramSignUp.fcmThread) {
                if (this.authService.isLoggedIn()) {
                    if (this.authService.currentUser.isAdmin) this.admin = true;
                    if (this.authService.currentUser.username != this.thread.user.username) this.threadsService.trackViews(this.thread._id);
                } else {
                    this.threadsService.trackViews(this.thread._id);
                    this.admin = false;
                }

            }

        } else {
            if (this.authService.isLoggedIn()) {
                if (this.authService.currentUser.isAdmin) this.admin = true;
                if (this.authService.currentUser.username != this.thread.user.username) this.threadsService.trackViews(this.thread._id);
            } else {
                this.threadsService.trackViews(this.thread._id);
                this.admin = false;
            }
        }

    }


    getThread(threadId: string) {

        this.loadingThread = true;
        this.threadsService.getThreadDB(threadId)
            .subscribe((thread: any) => {

                thread.date = new Date(thread.date);
                thread.created = this.created(thread);
                thread.likedByUser = this.userHasLiked(thread);
                thread.count = thread.likers ? thread.likers.length : 0;
                thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');

                this.thread = thread;
                this.savedForToolbar = this.userHasSaved(this.thread);
                if (this.authService.isLoggedIn()) {
                    if (this.authService.currentUser.username === this.thread.user.username || this.authService.currentUser.isAdmin) {
                        this.showResults = true;
                    }

                }

                if (this.thread.pollValues.length > 1) {
                    this.options = this.thread.pollValues;

                    this.totalVotes = this.thread.votes.length;
                    this.userHasVoted();
                }
                else if (this.thread.abValues.length > 1) {

                    this.options = this.thread.abValues;
                    this.totalVotes = this.thread.votes.length;
                    this.userHasVoted();
                }

                setTimeout(() => {

                    this.getDiscussions();
                }, 1000);
                this.loadingThread = false;
                this.enableInfinite = true;

            }, (err) => {

                this.navCtrl.pop();
                this.toastCtrl.create({
                    message: err,
                    duration: 3000,
                    position: 'top'
                }).then(toast => toast.present())

            })

    }

    savePostToolbar() {

        if (!this.thread) return;

        let saved = this.userHasSaved(this.thread)
        this.savePost(this.thread, saved)
    }

    savePost(thread: IThread, saved: boolean) {

        if (this.authService.isLoggedIn()) {
            if (saved) {
                const index = thread.bookmarks.indexOf(this.authService.currentUser._id)
                if (index > -1) {
                    thread.bookmarks.splice(index, 1)
                }
                this.threadsService.deleteBookmark(thread._id)
                this.savedForToolbar = false; //toolbar
                setTimeout(() => {
                    this.toastCtrl.create({
                        message: "Post unsaved",
                        duration: 2000,
                        color: 'warning',
                        position: 'bottom'
                    }).then(toast => {
                        toast.present();
                    })

                }, 300);

            } else {
                if (thread.bookmarks) thread.bookmarks.push(this.authService.currentUser._id);
                else {
                    thread.bookmarks = [this.authService.currentUser._id];
                }
                this.savedForToolbar = true; //toolbar
                this.threadsService.addToBookmarks(thread._id)
                setTimeout(() => {
                    this.toastCtrl.create({
                        message: "Post saved",
                        duration: 2000,
                        color: 'warning',
                        position: 'bottom'
                    }).then(toast => {
                        toast.present();
                    })

                }, 300);
            }
        } else {
            let data = {
                message: 'Sign up to save this post!',
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
                    })

            })

        }

    }

    userHasSaved(thread: IThread) {

        if (this.authService.currentUser && thread.bookmarks) {
            return thread.bookmarks.some((user: any) => user === this.authService.currentUser._id);
        } else {
            return false;
        }
    }

    presentActionSheetShare(e: any, thread: IThread) {

        let saved = this.userHasSaved(thread)

        e.stopPropagation()
        this.actionSheetCtrl.create({
            cssClass: 'my-custom-action',
            buttons: [
                {
                    text: saved ? 'Unsave post' : 'Save post',
                    icon: saved ? 'bookmark' : 'bookmark-outline',
                    handler: () => {
                        this.savePost(thread, saved);
                    }
                },
                {
                    text: 'Send to chat',
                    icon: 'send',
                    handler: () => {
                        this.sharePostToChat(e, thread)
                    }
                }, {
                    text: 'Copy link to post',
                    icon: 'link',
                    handler: () => {

                        let url = 'https://www.discussthegame.com/posts/' + thread._id
                        this.clipboard.copy(url).then(() => {
                            this.toastCtrl.create({
                                message: "Copied to clipboard",
                                duration: 2000,
                                color: 'warning',
                                position: 'bottom'
                            }).then(toast => {
                                toast.present();
                            })
                        }).catch((err) => {
                            this.toastCtrl.create({
                                message: err,
                                duration: 2000,
                                color: 'warning',
                                position: 'bottom'
                            }).then(toast => {
                                toast.present();
                            })
                        });

                    }
                },
                {
                    text: 'Share post via...',
                    icon: 'share-outline',
                    handler: () => {
                        this.shareVia(thread)
                    }
                },
                {
                    text: 'Close',
                    role: 'cancel',
                    handler: () => {

                    }
                }
            ]
        }).then((actionSheet) => {
            actionSheet.present();
        })



    }



    shareVia(thread: IThread) {

        var options = {
            url: 'https://www.discussthegame.com/posts/' + thread._id
        };
        this.socialSharing.shareWithOptions(options)
    }

    editOrDelete(thread: IThread) {

        this.actionSheetCtrl.create({
            header: 'ACTION',
            cssClass: 'my-custom-action',
            buttons: [
                {
                    text: 'Edit',
                    handler: () => {

                        let data = {
                            thread,
                            selection: thread.type.toLocaleLowerCase()
                        }
                        this.authService.paramSignUp = data;

                        if (!thread.fromWeb) this.navCtrl.navigateForward(this.router.url.substr(0, 10) + '/edit-thread'); //NAVIGATE
                        else {
                            this.toastCtrl.create({
                                message: "This post was created with the web editor, please go to discussthegame.com/posts to edit it.",
                                duration: 5000,
                                position: 'bottom'
                            }).then(toast => toast.present())
                        }

                    }
                },
                {
                    text: 'Delete',
                    handler: () => {
                        this.alertCtrl.create({
                            header: 'Do you want to delete this post?',
                            buttons: [
                                {
                                    text: 'Cancel',
                                    role: 'cancel',
                                    handler: () => {
                                    }
                                },
                                {
                                    text: 'Yes',
                                    handler: () => {
                                        this.deletePost(this.thread);
                                    }
                                }
                            ]
                        }).then(a => a.present())


                    }
                },
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {

                    }
                }
            ]
        }).then(as => {
            as.present();
        })


    }

    deletePost(thread: any) {

        this.loadingCtrl.create({
            spinner: 'crescent',
            cssClass: 'my-custom-loading'
        }).then(
            loader => {

                loader.present();
                let data = {
                    tId: thread._id,
                    userId: this.authService.currentUser._id
                }

                this.threadsService.deleteThread(data)
                    .subscribe((success) => {

                        if (success) {
                            this.navCtrl.pop()
                            loader.dismiss();

                        } else {

                            this.toastCtrl.create({
                                message: 'Failed to delete Post',
                                duration: 3000,
                                position: 'bottom'
                            }).then(toast => toast.present())

                            loader.dismiss();

                        }
                    },
                        (err) => {
                            this.toastCtrl.create({
                                message: err,
                                duration: 3000,
                                position: 'bottom'
                            }).then(toast => toast.present())

                            loader.dismiss();

                        });
            }
        )




    }

    edit(thread: IThread) {

        this.actionSheetCtrl.create({
            header: 'ACTION',
            cssClass: 'my-custom-action',
            buttons: [
                {
                    text: 'Edit',
                    handler: () => {

                        let data = {
                            thread,
                            selection: thread.type.toLocaleLowerCase()
                        }
                        this.authService.paramSignUp = data;

                        if (!thread.fromWeb) this.navCtrl.navigateForward(this.router.url.substr(0, 10) + '/edit-thread'); //NAVIGATE
                        else {
                            this.toastCtrl.create({
                                message: "This post was created with the web editor, please go to discussthegame.com/posts to edit it.",
                                duration: 5000,
                                position: 'bottom'
                            }).then(toast => toast.present())
                        }

                    }
                },
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {

                    }
                }
            ]
        }).then(as => {
            as.present();
        })


    }

    deleteComment(comment: string) {

        this.timelines = this.timelines.filter(timeline => timeline._id.toString() != comment.toString());

    }

    showVisible(e) {

        for (let img of this.el.nativeElement.querySelectorAll('.user-picture')) {
            let realSrc = img.dataset.src;
            if (!realSrc) continue;

            if (this.isVisible(img)) {

                if (e != null) {
                    e.domWrite(() => {
                        img.src = realSrc;
                        img.dataset.src = ''
                    });
                } else {
                    this.domCtrl.write(() => {
                        img.src = realSrc;
                        img.dataset.src = ''
                    });
                }

            }
        }

    }





    ionViewWillLeave() {
        clearTimeout(this.swipeTimeOut);
        this.authService.swipeBack = false;

        this.swipeTimeOut = setTimeout(() => {
            this.authService.swipeBack = true;
        }, 1500);
    }

    ionViewDidLeave() {
        this.authService.paramSignUp = undefined;
        this.content.scrollY = false;
        clearTimeout(this.swipeTimeOut);
        this.authService.swipeBack = true;

    }




    isVisible(elem) {

        let coords = elem.getBoundingClientRect();

        let windowHeight = document.documentElement.clientHeight;

        // top elem edge is visible OR bottom elem edge is visible
        let topVisible = coords.top > 0 && coords.top < windowHeight;
        let bottomVisible = coords.bottom < windowHeight && coords.bottom > 0;

        return topVisible || bottomVisible;
    }

    onLoad() {

        this.loadingImage = false;
        this.thread.imageCached = true;
        this.setOpacitytoCero();

    }

    setOpacitytoCero() {

        setTimeout(() => {
            this.opacityToCero = true;
        }, 400);

    }

    goBack() {

        this.authService.addurl = false;
        this.navCtrl.pop();

    }


    sharePostToChat(e: any, thread: IThread) {

        if (this.authService.isLoggedIn()) {
            let data = {
                thread
            }
            this.modalCtrl.create({
                component: SharePostPage,
                componentProps: {
                    data: data
                }

            }).then((modal) => {
                modal.present();
                modal.onDidDismiss()
                    .then((data) => {

                        if (data.data.newChat) this.newChat(e, thread);

                    })
            })

        } else {
            let data = {
                message: 'Sign up to start chatting!',
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
                    })

            })

        }


    }

    newChat(e: any, thread: any) {
        let data = {
            addPeople: false
        }

        this.modalCtrl.create({
            component: NewChatPage,
            componentProps: {
                data
            }

        }).then((modal) => {
            modal.present();
            modal.onDidDismiss()
                .then((data) => {

                    if (data.data.chat) {
                        //El chat esta en el arreglo de chats
                        if (this.chatService.chats.some(chat => chat._id == data.data.chat._id)) {
                            this.sharePostToChat(e, thread);

                        } else {
                            //El chat no estaba en el arreglo epro existe en la base de datos
                            this.chatService.addNewChat(data.data.chat);
                            this.sharePostToChat(e, thread);
                        }

                    } else if (data.data.provChat) {
                        //Create "new chat"
                        data.data.provChat._id = "empty";
                        data.data.provChat.createdAt = Date.now();
                        this.chatService.addNewChat(data.data.provChat);
                        this.sharePostToChat(e, thread);
                    }
                })
        })
    }
    goToUser(event, user) {

        if (this.authService.isLoggedIn()) {
            if (this.authService.currentUser.username == user.username) {
                this.authService.downloadProfile = true;
                let data = {
                    fromTabs: false,
                    loadInitial: true
                }
                this.authService.paramSignUp = data;


                this.navCtrl.navigateForward(this.router.url.substr(0, 10) + '/profile');
                //navigate
            } else {
                let data = {
                    user: user
                }
                this.authService.paramSignUp = data;


                this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/user', user._id]);
                //navigate

            }

        } else {
            let data = {
                user: user
            }
            this.authService.paramSignUp = data;


            this.navCtrl.navigateForward([this.router.url.substr(0, 10) + '/user', user._id]);
            //navigate

        }

    }


    addComment() {

        if (this.authService.isLoggedIn()) {
            let data = {
                title: this.thread.title
            }
            this.modalCtrl.create({
                component: AddCommentPage,
                componentProps: {
                    data
                }

            }).then((modal) => {
                modal.present();
                modal.onDidDismiss()
                    .then((comment) => {

                        if (comment.data.comment) {
                            if (comment.data.comment.length > 0) this.sendComment(comment.data.comment); //CHECK_DTG 
                        }

                    })
            })

        } else {
            let data = {
                message: 'Sign up to comment and reply!',
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

                    })
            })


        }


    }

    

    sendComment(comment: string) {
        this.loadingCtrl.create({
            spinner: 'crescent',
            message: 'Sending...',
            cssClass: 'my-custom-loading'
        }).then(loader => {
            loader.present();
           
            if (this.authService.isLoggedIn()) {
                let data = {
                    opinion: comment,
                    threadUser: this.thread.user._id,
                    playerIds: this.thread.user.playerIds

                }

                this.threadDiscussionService.postDiscussion(data, this.thread._id)
                    .subscribe((timeline: ITimeline) => {
                        this.webSocketService.emitPost(this.thread._id, "thread", this.thread.user._id, this.authService.currentUser._id)
                        timeline.date = new Date(timeline.date)
                        timeline.count = 0;
                        timeline.created = "1min"
                        this.timelines.unshift(timeline);

                        this.thread.replies += 1;

                        loader.dismiss();
                        setTimeout(() => {
                            this.showVisible(null);
                        }, 0);

                    },
                        (err) => {
                            this.toastCtrl.create({
                                message: err,
                                duration: 3000,
                                position: 'bottom',
                                cssClass: "toast",
                            }).then(toast => toast.present());

                            loader.dismiss();
                        });
            }
        })

    }


    presentActionSheet() {

        let hotIcon;
				let newIcon;
				let topIcon;

				if (this.global.state['theme'] == 'light') {
					hotIcon = this.hot ? 'checkmark' : 'hot-primary';
					newIcon = this.new ? 'checkmark' : 'new-primary';
					topIcon = this.top ? 'checkmark' : 'top-primary'
				} else {
					hotIcon = this.hot ? 'checkmark' : 'hot-white'
					newIcon = this.new ? 'checkmark' : 'new-white';
					topIcon = this.top ? 'checkmark' : 'top-white'
				}

        this.actionSheetCtrl.create({
            header: 'SORT COMMENTS BY',
            cssClass: 'my-custom-action',
            buttons: [
                {
                    text: 'Hot',
                    icon: hotIcon,
                    handler: () => {

                        this.sortBy = "HOT COMMENTS";
                        this.loadingDiscussions = true;
                        this.getDiscussions();
                        this.hot = true;
                        this.new = false;
                        this.top = false;
                    }
                }, {
                    text: 'New',
                    icon: newIcon,
                    handler: () => {
                        this.sortBy = "NEW COMMENTS";
                        this.loadingDiscussions = true;
                        this.hot = false;
                        this.new = true;
                        this.top = false;
                        this.getNewestDiscussions()
                    }
                },
                {
                    text: 'Top',
                    icon: topIcon,
                    handler: () => {
                        this.sortBy = "TOP COMMENTS";
                        this.loadingDiscussions = true;
                        this.hot = false;
                        this.new = false;
                        this.top = true;
                        this.getTopDiscussions()
                    }
                },
                {
                    text: 'Close',
                    role: 'cancel',
                    handler: () => {

                    }
                }
            ]
        }).then(as => as.present());


    }

    refresh() {

        if (this.hot) {
            this.loadingDiscussions = true;
            this.getDiscussions();
        } else if (this.new) {
            this.loadingDiscussions = true;
            this.getNewestDiscussions();
        } else {
            this.loadingDiscussions = true;
            this.getTopDiscussions();
        }

    }


    getNewestDiscussions() {



        this.enableInfinite = false;
        this.skipNew = 0;
        if (this.reactivateInfinite) this.enableInfinite = true;

        this.threadDiscussionService.getNewestDiscussions(this.thread._id, 0)
            .subscribe((timelines: any[]) => {
                timelines.forEach((timeline) => {
                    timeline.date = new Date(timeline.date);
                    timeline.created = this.created(timeline);
                    timeline.likedByUser = this.userHasLiked(timeline);
                })
                this.timelines = timelines;
                this.loadingDiscussions = false;
                this.loadingInitial = false;
                if (this.timelines.length >= 25) this.enableInfinite = true;
                else {
                    this.enableInfinite = false;
                }
                setTimeout(() => {
                    this.showVisible(null);
                }, 0);

            },
                (err) => {
                    this.loadingDiscussions = false;
                    this.loadingInitial = false;
                    this.enableInfinite = true;
                    this.toastCtrl.create({
                        message: err,
                        duration: 3000,
                        position: 'top'
                    }).then(toast => toast.present());

                })

    }

    getTopDiscussions() {


        this.enableInfinite = false;
        this.skipTop = 0;
        if (this.reactivateInfinite) this.enableInfinite = true;
        this.threadDiscussionService.getTopDiscussions(this.thread._id, 0)
            .subscribe((timelines: any[]) => {
                timelines.forEach((timeline) => {
                    timeline.date = new Date(timeline.date);
                    timeline.created = this.created(timeline);
                    timeline.likedByUser = this.userHasLiked(timeline);

                })

                this.loadingDiscussions = false;
                this.loadingInitial = false;
                this.timelines = timelines;
                if (this.timelines.length >= 25) this.enableInfinite = true;
                else {
                    this.enableInfinite = false;
                }


                setTimeout(() => {
                    this.showVisible(null);
                }, 0);

            },
                (err) => {
                    this.enableInfinite = true;
                    this.loadingDiscussions = false;
                    this.loadingInitial = false;
                    this.toastCtrl.create({
                        message: err,
                        duration: 3000,
                        position: 'top'
                    }).then(toast => toast.present())

                })
    }

    getDiscussions() {

        this.skipHot = 0;
        if (this.reactivateInfinite) this.enableInfinite = true;

        this.threadDiscussionService.getDiscussions(this.thread._id, 0)
            .subscribe((timelines: any[]) => {
                timelines.forEach((timeline) => {
                    timeline.date = new Date(timeline.date);
                    timeline.created = this.created(timeline);
                    timeline.likedByUser = this.userHasLiked(timeline);

                })

                this.loadingDiscussions = false;
                this.loadingInitial = false;
                this.timelines = timelines;





                if (this.timelines.length >= 25) this.enableInfinite = true;
                else {
                    this.enableInfinite = false;
                }

                if (this.reactivateInfinite) this.reactivateInfinite.target.complete();


                setTimeout(() => {
                    this.showVisible(null);
                }, 0);

            },
                (err) => {
                    this.enableInfinite = true;
                    this.loadingDiscussions = false;
                    this.loadingInitial = false;
                    this.toastCtrl.create({
                        message: err,
                        duration: 3000,
                        position: 'top'
                    }).then(toast => toast.present())

                })
    }

    getMoreNewestDiscussions(skip: number, infiniteScroll: any) {

        this.loadingDiscussions = true;
        this.threadDiscussionService.getNewestDiscussions(this.thread._id, skip)
            .subscribe((timelines: any[]) => {
                timelines.forEach((timeline) => {
                    timeline.date = new Date(timeline.date);
                    timeline.created = this.created(timeline);
                    timeline.likedByUser = this.userHasLiked(timeline);


                })
                let newTimelinesArray = this.timelines.concat(timelines);

                //Eliminar duplicados. Esto sucede porque continuamente se agregan discusiones a la base de datos; el skip genera esto.
                var unique = newTimelinesArray.filter((item, i, array) => {
                    return array.findIndex((item2: any) => { return item2._id == item._id }) === i;
                })

                this.loadingDiscussions = false;
                infiniteScroll.target.complete();
                if (timelines.length < 25) this.enableInfinite = false;


                this.timelines = unique;
                setTimeout(() => {
                    this.showVisible(null);
                }, 0);

            },
                (err) => {
                    infiniteScroll.target.complete();
                    this.loadingDiscussions = false;
                    this.toastCtrl.create({
                        message: err,
                        duration: 3000,
                        position: 'top'
                    }).then(toast => toast.present())

                })

    }

    getMoreTopDiscussions(skip: number, infiniteScroll: any) {


        this.loadingDiscussions = true;
        this.threadDiscussionService.getTopDiscussions(this.thread._id, skip)
            .subscribe((timelines: any[]) => {
                timelines.forEach((timeline) => {
                    timeline.date = new Date(timeline.date);
                    timeline.created = this.created(timeline);
                    timeline.likedByUser = this.userHasLiked(timeline);


                })
                let newTimelinesArray = this.timelines.concat(timelines);

                //Eliminar duplicados. Esto sucede porque continuamente se agregan discusiones a la base de datos; el skip genera esto.
                var unique = newTimelinesArray.filter((item, i, array) => {
                    return array.findIndex((item2: any) => { return item2._id == item._id }) === i;
                })
                this.timelines = unique;
                this.loadingDiscussions = false;
                infiniteScroll.target.complete();
                if (timelines.length < 25) this.enableInfinite = false;
                setTimeout(() => {
                    this.showVisible(null);
                }, 0);

            },
                (err) => {
                    infiniteScroll.target.complete();
                    this.loadingDiscussions = false;
                    this.toastCtrl.create({
                        message: err,
                        duration: 3000,
                        position: 'top'
                    }).then(toast => toast.present());

                })
    }

    getMoreDiscussions(skip: number, infiniteScroll: any) {

        this.loadingDiscussions = true;
        this.threadDiscussionService.getDiscussions(this.thread._id, skip)
            .subscribe((timelines: any[]) => {
                timelines.forEach((timeline) => {
                    timeline.date = new Date(timeline.date);
                    timeline.created = this.created(timeline);
                    timeline.likedByUser = this.userHasLiked(timeline);


                })
                let newTimelinesArray = this.timelines.concat(timelines);

                //Eliminar duplicados. Esto sucede porque continuamente se agregan discusiones a la base de datos; el skip genera esto.
                var unique = newTimelinesArray.filter((item, i, array) => {
                    return array.findIndex((item2: any) => { return item2._id == item._id }) === i;
                })
                this.timelines = unique;
                this.loadingDiscussions = false;
                infiniteScroll.target.complete();
                if (timelines.length < 25) this.enableInfinite = false;
                setTimeout(() => {
                    this.showVisible(null);
                }, 0);

            },
                (err) => {
                    infiniteScroll.target.complete();
                    this.loadingDiscussions = false;
                    this.toastCtrl.create({
                        message: err,
                        duration: 3000,
                        position: 'top'
                    }).then(toast => toast.present());

                })
    }


    created(thread: any): string {

        let milliseconds = thread.date.getTime();
        let now = new Date();
        let millisecondsNow = now.getTime();
        let diffInHours = (millisecondsNow - milliseconds) / (1000 * 60 * 60); //hours
        let typeTime;

        if (diffInHours >= 24) {
            //DAYS
            let threadCreated = Math.floor(diffInHours / 24); //Template binding
            typeTime = "d"
            return `${threadCreated}${typeTime}`

        } else if (diffInHours < 1 && diffInHours > 0) {
            //MINUTES
            let threadCreated = Math.ceil(diffInHours * 60); //Template binding
            typeTime = "min"
            return `${threadCreated}${typeTime}`

        } else {
            //HOURS   
            let threadCreated = Math.floor(diffInHours); //Template binding
            typeTime = "h"
            return `${threadCreated}${typeTime}`

        }

    }

    userHasVoted() {

        if (this.authService.isLoggedIn()) {
            if (this.threadsService.userHasVoted(this.thread, this.authService.currentUser._id) || this.showResults) {
                this.calculatePercentage(false);
            }
        }



    }

    boost() {
        if (this.admin) {
            this.alertCtrl.create({
                header: 'Number of likes?',
                inputs: [
                    {
                        name: 'likes',
                    }
                ],
                buttons: [
                    {
                        text: 'Cancel',
                        role: 'cancel',
                        handler: data => {

                        }
                    },
                    {
                        text: 'Boost!',
                        handler: data => {
                            let likes = +data.likes;
                            if (isNaN(likes)) return;
                            this.threadsService.boost(this.thread._id, likes);

                        }
                    }
                ]
            }).then(as => as.present())

        }
    }

    boostViews() {
        if (this.admin) {
            let alert = this.alertCtrl.create({
                header: 'Number of views?',
                inputs: [
                    {
                        name: 'views',
                    }
                ],
                buttons: [
                    {
                        text: 'Cancel',
                        role: 'cancel',
                        handler: data => {

                        }
                    },
                    {
                        text: 'Boost!',
                        handler: data => {
                            let views = +data.views;
                            if (isNaN(views)) return;
                            this.threadsService.boostViews(this.thread._id, views);

                        }
                    }
                ]
            }).then(as => as.present());

        }
    }

    boostVotes() {
        if (this.admin) {
            let alert = this.alertCtrl.create({
                header: 'Number of votes?',
                inputs: [
                    {
                        name: 'numberOfVotes',
                    }
                ],
                buttons: [
                    {
                        text: 'Cancel',
                        role: 'cancel',
                        handler: data => {

                        }
                    },
                    {
                        text: 'Boost!',
                        handler: data => {
                            let numberOfVotes = +data.numberOfVotes;
                            if (isNaN(numberOfVotes)) return;
                            this.threadsService.boostVotes(this.thread._id, numberOfVotes, undefined);

                        }
                    }
                ]
            }).then(as => as.present())

        }
    }

    boostIndividual(option: string) {
        if (this.admin) {
            this.alertCtrl.create({
                header: 'Number of votes?',
                inputs: [
                    {
                        name: 'votes',
                    }
                ],
                buttons: [
                    {
                        text: 'Cancel',
                        role: 'cancel',
                        handler: data => {

                        }
                    },
                    {
                        text: 'Boost!',
                        handler: data => {
                            let votes = +data.votes;
                            if (isNaN(votes) || votes < 0) return;
                            this.threadsService.boostVotes(this.thread._id, votes, option);

                        }
                    }
                ]
            }).then(as => as.present())

        }

    }

    feature() {
        if (this.admin) {

            this.alertCtrl.create({
                message: "Do you want to feature this post?",
                buttons: [
                    {
                        text: 'Cancel',
                        role: 'cancel',
                        handler: () => {

                        }
                    },
                    {
                        text: 'Feature',
                        handler: () => {

                            this.loadingCtrl.create({
                                spinner: 'crescent',
                                message: 'Updating..'
                            }).then(loader => {
                                loader.present()

                                this.threadsService.feature(this.thread._id)
                                    .subscribe(success => {
                                        if (success) this.thread.featured = true;
                                        loader.dismiss()
                                    },
                                        (err) => {
                                            this.toastCtrl.create({
                                                message: err,
                                                duration: 3000,
                                                position: 'bottom',
                                                cssClass: "toast",
                                            }).then(toast => toast.present());
                                            loader.dismiss()

                                        });
                            })


                        }
                    }
                ]
            }).then(alert => alert.present());

        }
    }


    calculatePercentage(makeEffect: boolean) {

        this.optionsWithPercentage = [];
        for (let i = 0; i < this.options.length; i++) {
            this.optionsWithPercentage.push(this.createOptionsObject(i));
        }

        let diffTo100 = 100 - this.percentageSum;
        if (diffTo100 != 0) {
            let provisionalArray = this.optionsWithPercentage.concat();
            provisionalArray.sort((a, b) => {
                return b.decimal - a.decimal;
            });


            for (let i = 0; i < diffTo100; i++) {
                for (let j = 0; j < this.optionsWithPercentage.length; j++) {
                    if (this.optionsWithPercentage[j].option == provisionalArray[i].option) {
                        this.optionsWithPercentage[j].flooredPercentage += 1;

                    }
                }

            }
        }

        this.voted = true;



    }



    createOptionsObject(i: number) {

        let option = this.options[i].trim();
        let provArray = this.thread.votes.filter(i => i.option.trim() == option)
        let totalVotesOfOption = provArray.length;
        let userInOption = provArray.some((voter: any) => voter.user == this.authService.currentUser._id); //ID

        let percentage = (totalVotesOfOption / this.totalVotes) * 100;
        let decimal = percentage % 1
        let flooredPercentage = Math.floor(percentage);

        this.percentageSum += flooredPercentage;

        let object = {
            option: option,
            percentage: percentage,
            decimal: decimal,
            flooredPercentage: isNaN(flooredPercentage) ? 0 : flooredPercentage,
            userInOption: userInOption
        }


        return object;
    }



    toggleVote(value: string) {

        if (this.authService.isLoggedIn() && this.options.length > 1) {
            this.pollEffect = true;
            if (!this.threadsService.userHasVoted(this.thread, this.authService.currentUser._id)) {
                setTimeout(() => { this.voted = true; }, 700);
                this.totalVotes += 1;
                this.threadsService.postVote(this.thread, value);
                let objectToPush = {
                    option: value,
                    user: this.authService.currentUser._id
                }
                this.thread.votes.push(objectToPush);
                this.calculatePercentage(true);

            }

        } else {

            let data = {
                message: 'Sign up to vote in polls!',
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

                    })
            })

            //Mandar a registrar


        }

    }


    openLink() {

        const browser = this.inAppBroswer.create(this.thread.url, '_system');
    }


    replyDetail(timeline: ITimeline) {

    }


    //Thread
    like() {

        if (this.authService.isLoggedIn()) {
            if (this.userHasLiked(this.thread)) {
                this.thread.likedByUser = false;
                this.thread.count -= 1;
                this.likesService.deleteThreadLike(this.thread, this.authService.currentUser._id);

            } else {
                this.thread.likedByUser = true;
                this.thread.count += 1;
                this.likesService.postThreadLike(this.thread, this.authService.currentUser._id);

            }

        }
        else {
            let data = {
                message: 'Sign up to like this post!',
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
                    })

            })

        }
    }


    //Thread
    userHasLiked(thread: IThread) {
        if (this.authService.isLoggedIn()) {
            return this.likesService.userHasLiked(thread, this.authService.currentUser._id);
        } else {
            return false;
        }
    }


    doInfinite(infiniteScroll) {



        this.reactivateInfinite = infiniteScroll;
        if (this.timelines.length == 0) {
            console.log('get')
            this.getDiscussions()
            return;
        }

        if (this.hot) {
            this.skipHot += 25;
            this.getMoreDiscussions(this.skipHot, infiniteScroll);
        } else if (this.new) {
            this.skipNew += 25;
            this.getMoreNewestDiscussions(this.skipNew, infiniteScroll);

        } else {
            this.skipTop += 25;
            this.getMoreTopDiscussions(this.skipTop, infiniteScroll);
        }

    }

}
