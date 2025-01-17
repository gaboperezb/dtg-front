import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ITake, ITimeline } from '../shared/interfaces';
import { AuthService } from '../core/auth.service';
import { TakeService } from '../core/take.service';
import { NavController, ToastController, ModalController, LoadingController, ActionSheetController, AlertController } from '@ionic/angular';
import { LikesService } from '../core/likers.service';
import { TakeDiscussionService } from '../core/take-discussion.service';
import { InViewportMetadata } from 'ng-in-viewport';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { FcmProvider } from '../core/fcm.service';
import { TakeLikesService } from '../core/take-likers.service';
import { SignupAppPage } from '../signup-app/signup-app.page';
import { AppState } from '../core/state.service';
import { AddCommentPage } from '../add-comment/add-comment.page';
import { ThreadDiscussionService } from '../core/thread-discussion.service';
import { WebSocketService } from '../core/websocket.service';
import { isNumber } from 'util';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { SharePostPage } from '../share-post/share-post.page';
import { NewChatPage } from '../new-chat/new-chat.page';
import { ChatService } from '../core/chat.service';

@Component({
    selector: 'app-take-detail',
    templateUrl: './take-detail.page.html',
    styleUrls: ['./take-detail.page.scss'],
})
export class TakeDetailPage implements OnInit {


    swipeTimeOut: any;
    showTimer: boolean = false;
    largeLink: boolean = false;
    take: ITake;
    notificationInformation: any;
    loadingTake: boolean = false;
    enableInfinite: boolean = false;
    skipHot: number = 0;
    skipNew: number = 0;
    skipTop: number = 0;
    reactivateInfinite: any;
    timeInterval: any;
    loadingDiscussions: boolean = false;
    loadingInitial: boolean = true;
    timelines: ITimeline[] = [];
    admin: boolean = false;
    videoPaused: boolean = true;
    dontPlay: boolean = false;
    displayTimeTimeout: any;
    time: string;
    notLoaded: boolean = true;
    videoLoaded: boolean = false;
    hot: boolean = true;
    new: boolean = false;
    sortBy: string = "HOT COMMENTS";
    top: boolean = false;
    videoStyle: any;
    pictureStyle: any;
    viewEntered: boolean = false;
    savedForToolbar: boolean = false;
    @ViewChild('videoTake') videoTake: ElementRef;


    options: string[] = [];
    showResults: boolean = false;
    optionsWithPercentage: any[] = [];
    percentageSum: number = 0;
    totalVotes: number = 0;
    voted: boolean = false;
    pollEffect: boolean = false;

    constructor(private route: ActivatedRoute,
        private el: ElementRef,
        private alertCtrl: AlertController,
        private threadDiscussionService: ThreadDiscussionService,
        public authService: AuthService,
        private takeDiscussionService: TakeDiscussionService,
        public takeService: TakeService,
        private loadingCtrl: LoadingController,
        private actionSheetCtrl: ActionSheetController,
        private fcm: FcmProvider,
        public global: AppState,
        private clipboard: Clipboard,
        private socialSharing: SocialSharing,
        private router: Router,
        private webSocketService: WebSocketService,
        private modalCtrl: ModalController,
        private takeLikesService: TakeLikesService,
        private toastCtrl: ToastController,
        private inAppBrowser: InAppBrowser,
        private chatService: ChatService,
        private likesService: LikesService,
        private navCtrl: NavController) {

        let id = this.route.snapshot.paramMap.get('id');
        this.notificationInformation = this.authService.paramSignUp; //De notificación
        if (this.notificationInformation) {
            if (!this.notificationInformation.fcmTake) {
                if (!this.takeService.getTake(id)) {
                    if (!this.takeService.takeUserPage.created) {
                        this.takeService.takeUserPage.created = this.created(this.takeService.takeUserPage);
                    }
                    this.take = this.takeService.takeUserPage;
                }
                else {

                    this.take = this.takeService.getTake(id);
                }


            } else {
                this.loadingTake = true;
            }

        } else {
            if (!this.takeService.getTake(id)) {
                if (!this.takeService.takeUserPage) return //cordova kill
                if (!this.takeService.takeUserPage.created) {
                    this.takeService.takeUserPage.created = this.created(this.takeService.takeUserPage);
                }
                this.take = this.takeService.takeUserPage;
            }
            else {
                this.take = this.takeService.getTake(id);

            }

        }
    }


    ngOnDestroy() {

        if (this.take && this.take.video) this.unloadVideo();

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
                            this.takeService.boost(this.take._id, likes);

                        }
                    }
                ]
            }).then(as => as.present())

        }
    }


    goToUser(event) {

        let user = this.take.user


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


    loadVideo() {

        this.videoTake.nativeElement.pause();
        this.videoTake.nativeElement.src = this.take.video; // empty source
        this.videoTake.nativeElement.load();
        this.videoLoaded = true;

    }

    unloadVideo() {

        this.videoTake.nativeElement.pause();
        this.videoTake.nativeElement.src = ""; // empty source
        this.videoTake.nativeElement.load();
        this.videoLoaded = false;
    }



    ngOnInit() {


        if (this.take && !isNaN(this.take.videoDuration)) {
            if (this.take.video) this.take.videoDuration = this.sec2time(Math.round(this.take.videoDuration))
        }

        if (this.notificationInformation) {
            if (this.notificationInformation.fcmTake) {

                setTimeout(() => {
                    this.getTake(this.notificationInformation.takeId);
                }, 800);

            } else {

                if (this.take.video) {
                    this.setVideoContainerStyle();
                }
                else if (this.take.picture) {
                    this.setPictureContainerStyle()
                }
                if (this.authService.isLoggedIn()) {
                    if (this.authService.currentUser.isAdmin) this.admin = true;
                }
                this.getDiscussions();

            }
        } else {

            if (!this.take) {
                this.goToTabRoot()
                return // cordova kill
            }
            this.getDiscussions();

            if (this.take.type == 'Poll') {

                if (this.authService.isLoggedIn()) {
                    if (this.authService.currentUser.username === this.take.user.username) {
                        this.showResults = true;
                    }
                }
                this.options = this.take.pollValues;
                this.totalVotes = this.take.votes.length;
                this.userHasVoted();

            }
            if (this.take.video) {
                this.setVideoContainerStyle();
            }
            else if (this.take.picture) {
                this.setPictureContainerStyle()
            }
           
            
            if (this.authService.isLoggedIn()) {
                if (this.authService.currentUser.isAdmin) this.admin = true;
            }

        }

        if (this.take) this.savedForToolbar = this.userHasSaved(this.take);

    }

    userHasVoted() {

        if (this.authService.isLoggedIn()) {
            if (this.takeService.userHasVoted(this.take, this.authService.currentUser._id) || this.showResults) {
                this.calculatePercentage(false);
            }
        }
    }

    createOptionsObject(i: number) {

        let option = this.options[i].trim();
        let provArray = this.take.votes.filter(i => i.option.trim() == option)
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

    calculatePercentage(makeEffect: boolean) {

        this.take.optionsWithPercentage = [];
        for (let i = 0; i < this.options.length; i++) {
            this.take.optionsWithPercentage.push(this.createOptionsObject(i));
        }

        let diffTo100 = 100 - this.percentageSum;
        if (diffTo100 != 0) {
            let provisionalArray = this.take.optionsWithPercentage.concat();
            provisionalArray.sort((a, b) => {
                return b.decimal - a.decimal;
            });

            for (let i = 0; i < diffTo100; i++) {
                for (let j = 0; j < this.take.optionsWithPercentage.length; j++) {
                    if (this.take.optionsWithPercentage[j].option == provisionalArray[i].option) {
                        this.take.optionsWithPercentage[j].flooredPercentage += 1;
                    }
                }
            }
        }

        this.take.voted = true;
    }

    toggleVote(value: string, event: any) {

        event.stopPropagation()
        if (this.authService.isLoggedIn() && this.options.length > 1) {
            this.pollEffect = true;
            if (!this.takeService.userHasVoted(this.take, this.authService.currentUser._id)) {
                setTimeout(() => { this.take.voted = true; }, 0);
                this.totalVotes += 1;
                this.takeService.postVote(this.take._id, value);
                let objectToPush = {
                    option: value,
                    user: this.authService.currentUser._id
                }
                this.take.votes.push(objectToPush);
                this.calculatePercentage(true);
                setTimeout(() => {
					this.pollEffect = false;
				}, 2000);

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



    goToTabRoot() {
        this.navCtrl.navigateRoot(this.router.url.substr(0, 10))
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


    syncVideoTime(vid: any) {


        vid.currentTime = this.take.videoCurrentTime;



    }



    ionViewWillLeave() {


        if (this.take && this.take.video) {
            this.take.videoCurrentTime = this.videoTake.nativeElement.currentTime;
        }
        clearTimeout(this.swipeTimeOut);
        this.authService.swipeBack = false;

        this.swipeTimeOut = setTimeout(() => {
            this.authService.swipeBack = true;
        }, 1500);

    }

    ionViewDidEnter() {
        this.viewEntered = true;
    }

    ionViewDidLeave() {
        this.authService.paramSignUp = undefined;
        this.notificationInformation = undefined;
        clearTimeout(this.swipeTimeOut);
        this.authService.swipeBack = true;
    }

    goBack() {

        this.authService.addurl = false;
        this.navCtrl.pop();

    }

    ngAfterViewInit() {

    }

    deleteComment(comment: string) {

        this.timelines = this.timelines.filter(timeline => timeline._id.toString() != comment.toString());

    }

    getDiscussions() {

        this.enableInfinite = false;
        this.skipHot = 0;
        if (this.reactivateInfinite) this.enableInfinite = true;
        this.takeDiscussionService.getDiscussions(this.take._id, 0)
            .subscribe((timelines: any[]) => {
                timelines.forEach((timeline) => {
                    timeline.date = new Date(timeline.date);
                    timeline.created = this.created(timeline);
                    timeline.likedByUser = this.userHasLiked(timeline);

                })

                let enteredInterval = setInterval(() => {
                    if (this.viewEntered) {
                        this.timelines = timelines;
                        this.loadingInitial = false;
                        this.loadingDiscussions = false;
                        clearInterval(enteredInterval);
                    }
                }, 100);

                if (this.timelines.length >= 25) this.enableInfinite = true;
                else {
                    this.enableInfinite = false;
                }


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

    getNewestDiscussions() {



        this.enableInfinite = false;
        this.skipNew = 0;
        if (this.reactivateInfinite) this.enableInfinite = true;

        this.takeDiscussionService.getNewestDiscussions(this.take._id, 0)
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
        this.takeDiscussionService.getTopDiscussions(this.take._id, 0)
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

    cutURLText(limit: number) {

        let reducedText = this.take.urlTitle.substring(0, limit);
        if (reducedText.length < this.take.urlTitle.length) {
            this.take.reducedTitle = this.take.urlTitle.substring(0, limit) + "...";
        } else {
            this.take.reducedTitle = this.take.urlTitle
        }

    }

    getTake(takeId: string) {


        this.loadingTake = true;
        this.takeService.getTakeDB(takeId)
            .subscribe((take: any) => {

                take.date = new Date(take.date);
                take.created = this.created(take);
                take.likedByUser = this.userHasLiked(take);
                take.count = take.likers ? take.likers.length : 0;
                take.levelN = take.user.badge.picture.replace('.png', 'N.png');

                this.take = take;
                this.savedForToolbar = this.userHasSaved(this.take);


                this.getDiscussions();
                this.take.videoDuration = this.sec2time(Math.round(this.take.videoDuration))

                this.loadingTake = false;


                if (this.take.type == 'Link') {

                    if (this.take.thumbnail_width > 500 && this.take.provider_name != 'Twitter' && this.take.urlType != 'video') {

                        this.cutURLText(80)

                    } else {

                        this.cutURLText(60)

                    }
                } 

                if(this.take.type == 'Poll') {
                    if (this.authService.isLoggedIn()) {
                        if (this.authService.currentUser.username === this.take.user.username) {
                            this.showResults = true;
                        }
                    }
                    this.options = this.take.pollValues;
                    this.totalVotes = this.take.votes.length;
                    this.userHasVoted();
                }

                if (this.take.video) {
                    this.setVideoContainerStyle();
                }
                else if (this.take.picture) {
                    this.setPictureContainerStyle()
                }
                if (this.authService.isLoggedIn()) {
                    if (this.authService.currentUser.isAdmin) this.admin = true;
                }

            }, (err) => {

                this.navCtrl.pop();
                this.toastCtrl.create({
                    message: err,
                    duration: 3000,
                    position: 'top'
                }).then(toast => toast.present())

            })

    }

    public changeVideoAudio(id: string) {

        let vid: any = document.getElementById('media-detail-' + id);
        this.fullVideo(vid);

    }

    fullVideo(vid: any) {


        vid.muted = false
        vid.controls = false;

        vid.play();




    }

    fullSizePicture(e: any) {
        e.stopPropagation();
        this.takeService.fullScreen = true;
        this.takeService.fullScreenImage = this.take.picture
    }

    openLink(e: any) {

        e.stopPropagation()

        const browser = this.inAppBrowser.create(this.take.url, '_system');
    }

    isVisible(elem) {

        if (elem) {
            let coords = elem.getBoundingClientRect();

            let windowHeight = document.documentElement.clientHeight;

            // top elem edge is visible OR bottom elem edge is visible
            let topVisible = coords.top > 0 && coords.top < windowHeight;
            let bottomVisible = coords.bottom < windowHeight && coords.bottom > 0;

            return topVisible || bottomVisible;
        }


    }

    onPause($event) {

        clearInterval(this.timeInterval);

        let vid = $event.target;
        this.videoTime(vid);
        this.videoPaused = true;
        vid.controls = false;


        clearInterval(this.displayTimeTimeout)
        this.showTimer = true;
        this.displayTimeTimeout = setTimeout(() => {
            this.showTimer = false;
        }, 4000);



    }



    videoTime(vid: any) {
        if (vid.duration) this.time = this.sec2time(Math.round(vid.duration - vid.currentTime))
        this.timeInterval = setInterval(() => {
            if (vid.duration) this.time = this.sec2time(Math.round(vid.duration - vid.currentTime))
        }, 1000);
    }

    pad(num, size) {
        return ('000' + num).slice(size * -1);
    }

    sec2time(timeInSeconds: any) {

        let time = parseFloat(timeInSeconds).toFixed(3);
        let hours = Math.floor(Number(time) / 60 / 60),
            minutes = Math.floor(Number(time) / 60) % 60,
            seconds = Math.floor(Number(time) - minutes * 60),
            milliseconds = time.slice(-3);

        return this.pad(minutes, 2).charAt(1) + ':' + this.pad(seconds, 2)
    }


    onPlay($event) {




        let vid = $event.target;

        this.videoPaused = false;
        clearTimeout(this.displayTimeTimeout)
        this.showTimer = true;
        this.displayTimeTimeout = setTimeout(() => {
            this.showTimer = false;
        }, 3000);



    }

    onMetadata($event) {

        let vid = $event.target;
        this.syncVideoTime(vid);
        this.videoTime(vid);
        this.showTimer = true;
        this.displayTimeTimeout = setTimeout(() => {
            this.showTimer = false;
        }, 4000);
    }





    like(e: any) {

        e.stopPropagation();
        this.fcm.impact("light");
        if (this.authService.isLoggedIn()) {
            if (this.userHasLiked(this.take)) {
                this.take.likedByUser = false;
                this.take.count -= 1;
                this.takeLikesService.deleteTakeLike(this.take, this.authService.currentUser._id);

            } else {
                this.take.likedByUser = true;
                this.take.count += 1;
                this.takeLikesService.postTakeLike(this.take, this.authService.currentUser._id);
            }
        }
        else {

            //Mandar a signup
            let data = {
                message: 'Sign up to like!',
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

    userHasLiked(thread: any) {

        if (this.authService.currentUser) {
            return this.takeLikesService.userHasLiked(thread, this.authService.currentUser._id);
        } else {
            return false;
        }
    }

    addComment() {

        if (this.authService.isLoggedIn()) {
            let data = {
                title: this.take.take
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
            cssClass: 'my-custom-loading',
            message: 'Sending...'
        }).then(loader => {
            loader.present();
            if (this.authService.isLoggedIn()) {
                let data = {
                    opinion: comment,
                    takeUser: this.take.user._id,
                    playerIds: this.take.user.playerIds

                }

                this.takeDiscussionService.postDiscussion(data, this.take._id)
                    .subscribe((timeline: ITimeline) => {
                        this.webSocketService.emitPost(this.take._id, "take", this.take.user._id, this.authService.currentUser._id)
                        timeline.date = new Date(timeline.date)
                        timeline.count = 0;
                        timeline.created = "1min"
                        this.timelines.unshift(timeline);

                        this.take.replies += 1;

                        loader.dismiss();


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



    created(take: any): string {

        let milliseconds = take.date.getTime();
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

    getMoreNewestDiscussions(skip: number, infiniteScroll: any) {

        this.loadingDiscussions = true;
        this.takeDiscussionService.getNewestDiscussions(this.take._id, skip)
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
        this.takeDiscussionService.getTopDiscussions(this.take._id, skip)
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
        this.takeDiscussionService.getDiscussions(this.take._id, skip)
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

    saveDiscussionToolbar() {

        if (!this.take) return;

        let saved = this.userHasSaved(this.take)
        this.saveDiscussion(this.take, saved)
    }
    


    saveDiscussion(take: ITake, saved: boolean) {

        if (this.authService.isLoggedIn()) {
            if (saved) {
                const index = take.bookmarks.indexOf(this.authService.currentUser._id)
                if (index > -1) {
                    take.bookmarks.splice(index, 1)
                }
                this.takeService.deleteBookmark(take._id)
                this.savedForToolbar = false;
                setTimeout(() => {
                    this.toastCtrl.create({
                        message: "Discussion unsaved",
                        duration: 2000,
                        color: 'warning',
                        position: 'bottom'
                    }).then(toast => {
                        toast.present();
                    })

                }, 300);

            } else {
                if (take.bookmarks) take.bookmarks.push(this.authService.currentUser._id);
                else {
                    take.bookmarks = [this.authService.currentUser._id];
                }
                this.takeService.addToBookmarks(take._id)
                this.savedForToolbar = true;
                setTimeout(() => {
                    this.toastCtrl.create({
                        message: "Discussion saved",
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
                message: 'Sign up to save this discussion!',
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

    userHasSaved(take: ITake) {

        if (this.authService.currentUser && take.bookmarks) {
            return take.bookmarks.some((user: any) => user === this.authService.currentUser._id);
        } else {
            return false;
        }
    }


    presentActionSheetShare(e: any, take: ITake) {

        e.stopPropagation()
        let saved = this.userHasSaved(take)

        this.actionSheetCtrl.create({
            cssClass: 'my-custom-action',
            buttons: [
                {
                    text: saved ? 'Unsave discussion' : 'Save discussion',
                    icon: saved ? 'bookmark' : 'bookmark-outline',
                    handler: () => {
                        this.saveDiscussion(take, saved);
                    }
                },
                {
                    text: 'Send to chat',
                    icon: 'send',
                    handler: () => {
                        this.shareDiscussionToChat(e, take)
                    }
                }, {
                    text: 'Copy link to discussion',
                    icon: 'link',
                    handler: () => {

                        let url = 'https://www.discussthegame.com/discussions/' + take._id

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
                    text: 'Share discussion via...',
                    icon: 'share-outline',
                    handler: () => {
                        this.shareVia(take)
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

    newChat(e: any, take: any) {
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
                            this.shareDiscussionToChat(e, take);

                        } else {
                            //El chat no estaba en el arreglo epro existe en la base de datos
                            this.chatService.addNewChat(data.data.chat);
                            this.shareDiscussionToChat(e, take);
                        }

                    } else if (data.data.provChat) {
                        //Create "new chat"
                        data.data.provChat._id = "empty";
                        data.data.provChat.createdAt = Date.now();
                        this.chatService.addNewChat(data.data.provChat);
                        this.shareDiscussionToChat(e, take);
                    }

                })
        })
    }

    shareDiscussionToChat(e: any, take: ITake) {

        if (this.authService.isLoggedIn()) {
            let data = {
                take
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

                        if (data.data.newChat) this.newChat(e, take);

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

    shareVia(take: ITake) {

        var options = {
            url: 'https://www.discussthegame.com/discussions/' + take._id
        };
        this.socialSharing.shareWithOptions(options)
    }

    editOrDelete(e) {

        e.stopPropagation();
        let actionSheet = this.actionSheetCtrl.create({
            header: 'ACTION',
            cssClass: 'my-custom-action',
            buttons: [
                {
                    text: 'Edit',
                    handler: () => {
                        let data = {
                            take: this.take
                        }
                        this.authService.paramSignUp = data;
                        this.navCtrl.navigateForward(this.router.url.substr(0, 10) + '/edit-take');
                    }
                },
                {
                    text: 'Delete',
                    handler: () => {
                        this.alertCtrl.create({
                            header: 'Do you want to delete this discussion?',
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
                                        this.deleteTake();
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
        }).then(as => as.present())

    }

    edit(e) {

        e.stopPropagation();
        let actionSheet = this.actionSheetCtrl.create({
            header: 'ACTION',
            cssClass: 'my-custom-action',
            buttons: [
                {
                    text: 'Edit',
                    handler: () => {
                        let data = {
                            take: this.take
                        }
                        this.authService.paramSignUp = data;
                        this.navCtrl.navigateForward(this.router.url.substr(0, 10) + '/edit-take');
                    }
                },

                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {

                    }
                }
            ]
        }).then(as => as.present())

    }

  
    deleteTake() {

        this.loadingCtrl.create({
            spinner: 'crescent',
            cssClass: 'my-custom-loading'
        }).then(
            loader => {

                loader.present();
                let data = {
                    takeId: this.take._id,
                    userId: this.authService.currentUser._id
                }

                this.takeService.deleteTake(data)
                    .subscribe((success) => {

                        if (success) {
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

    setVideoContainerStyle() {


        this.videoStyle = {
            'border-radius': '10px',
            'position': 'relative',
            'padding-top': ((this.take.videoHeight / this.take.videoWidth) * 100) + "%"

        }
    }

    setPictureContainerStyle() {


        this.pictureStyle = {
            'position': 'relative',
            'background': '#ededed',
            'border': '1px solid #ededed',
            'border-radius': '10px',
            'padding-top': ((this.take.pictureHeight / this.take.pictureWidth) * 100) + "%"

        }
    }


    doInfinite(infiniteScroll) {

        this.reactivateInfinite = infiniteScroll;
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
