import { Component, OnInit, ViewChild } from '@angular/core';
import { IonSlides, AlertController, NavController, ActionSheetController, ToastController, ModalController, LoadingController } from '@ionic/angular';
import { PlayService } from '../core/play.service';
import { ITrivia, ITimeline } from '../shared/interfaces';
import { AuthService } from '../core/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AppState } from '../core/state.service';
import { AddCommentPage } from '../add-comment/add-comment.page';
import { SignupAppPage } from '../signup-app/signup-app.page';
import { Storage } from '@ionic/storage';
import { PlayDiscussionService } from '../core/play-discussion.service';
import { PlayLikesService } from '../core/play-likers.service';
import { FcmProvider } from '../core/fcm.service';

@Component({
    selector: 'app-trivia-detail',
    templateUrl: './trivia-detail.page.html',
    styleUrls: ['./trivia-detail.page.scss'],
})
export class TriviaDetailPage implements OnInit {

    data: any;
    id: string;
    trivia: ITrivia;
    sortBy: string = "HOT COMMENTS";
    @ViewChild('triviaSlides') slides: IonSlides;
    isEnd: boolean = false;
    addCommentToggled: boolean = false;
    loadingDiscussions: boolean = false;
    loadingInitial: boolean = true;
    viewEntered: boolean = false;
    reactivateInfinite: any;
    timelines: ITimeline[] = [];
    public didInit: boolean = false;
    swipeTimeOut: any;

    hot: boolean = true;
    new: boolean = false;
    top: boolean = false;


    slideOpts: any = {
        initialSlide: 0,
        speed: 400,
        allowTouchMove: false
    };

    countdown: number = 15;
    selected: boolean = false;
    userSelection: string = "";
    countInterval: any;
    ownerOftrivia: boolean = false;
    triviaAnswered: any;
    enableInfinite: boolean = false;
    skipHot: number = 0;
    skipNew: number = 0;
    skipTop: number = 0;
    swiper: any;
    alreadyAnswered: boolean = false;
    answer: any;
    helper: boolean = false;

    constructor(
        private navCtrl: NavController,
        public global: AppState,
        private router: Router,
        private fcm: FcmProvider,
        private playDiscussionService: PlayDiscussionService,
        private alertCtrl: AlertController,
        private playLikesService: PlayLikesService,
        private modalCtrl: ModalController,
        private storage: Storage,
        private playService: PlayService,
        private loadingCtrl: LoadingController,
        private actionSheetCtrl: ActionSheetController,
        private route: ActivatedRoute,
        private toastCtrl: ToastController,
        private authService: AuthService) {
        let id = this.route.snapshot.paramMap.get('id');

        this.trivia = this.playService.getDailyTrivia(id);

    }

    ngOnInit() {


        if (!this.trivia) {
            this.goToTabRoot()
            return // cordova kill
        }

        if (this.trivia.revealAnswer) { //24 horas después
            this.answer = this.trivia.options.find(o => o._id == this.trivia.correctOption);
        }

        this.getDiscussions();
        if (this.authService.currentUser.dailyTrivias && this.authService.currentUser.dailyTrivias.length) {
            this.triviaAnswered = this.authService.currentUser.dailyTrivias.find(t => t.trivia == this.trivia._id);
            if (!!this.triviaAnswered && this.triviaAnswered.answer) {
                this.userSelection = this.triviaAnswered.answer
                this.trivia.correct = this.userSelection == this.trivia.correctOption ? true : false;
            } else if (!!this.triviaAnswered && this.triviaAnswered.timesUp) {
                this.userSelection = null;
                this.trivia.correct = false;
                this.trivia.timesUp = true;
            }
        }

        if (!!this.triviaAnswered) { // ya se seleccionó
            this.calculatePercentage()
            this.checkIfTriviaHelper()
            this.selected = true;
            this.addCommentToggled = true;
            this.alreadyAnswered = true;

        }

    }

    loaded(slider: any) {
        this.slides.getSwiper().then(swiper => {
            this.swiper = swiper
        })
    }

    checkIfTriviaHelper() {
        this.storage.get('trivia-notifications-helper').then((val) => {
            if (!val) this.helper = true;
        })
    }

    setTriviaHelper() {
        this.storage.set('trivia-notifications-helper', '1')
        this.helper = false;
    }




    ngAfterViewInit() {
        this.didInit = true;
    }

    ionViewWillLeave() {
        clearTimeout(this.swipeTimeOut);
        this.authService.swipeBack = false;

        this.swipeTimeOut = setTimeout(() => {
            this.authService.swipeBack = true;
        }, 1500);
    }


    ionViewDidEnter() {
        this.viewEntered = true;
        if (!this.triviaAnswered) { // ya se seleccionó
            this.countInterval = setInterval(() => {

                this.countdown = --this.countdown;
                if (this.countdown <= 0) {
                    this.timeOut();
                    clearInterval(this.countInterval);
                }
            }, 1000);

        }
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


    getDiscussions() {

        this.enableInfinite = false;
        this.skipHot = 0;
        if (this.reactivateInfinite) this.enableInfinite = true;

        this.playDiscussionService.getTriviaDiscussions(this.trivia._id, 0)
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

        this.playDiscussionService.getNewestTriviaDiscussions(this.trivia._id, 0)
            .subscribe((timelines: any[]) => {
                timelines.forEach((timeline) => {
                    timeline.date = new Date(timeline.date);
                    timeline.created = this.created(timeline);
                    timeline.likedByUser = this.userHasLiked(timeline);
                })
                this.timelines = timelines;
                this.loadingDiscussions = false;
                console.log(timelines)
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
        this.playDiscussionService.getTopTriviaDiscussions(this.trivia._id, 0)
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

    getMoreNewestDiscussions(skip: number, infiniteScroll: any) {

        this.loadingDiscussions = true;
        this.playDiscussionService.getNewestTriviaDiscussions(this.trivia._id, skip)
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

    goToTabRoot() {
        this.navCtrl.navigateRoot(this.router.url.substr(0, 10))
    }

    getMoreTopDiscussions(skip: number, infiniteScroll: any) {

        this.loadingDiscussions = true;
        this.playDiscussionService.getTopTriviaDiscussions(this.trivia._id, skip)
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
        this.playDiscussionService.getTriviaDiscussions(this.trivia._id, skip)
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


    calculatePercentage() {
        let percentageSum = 0;
        let totalVotes = this.trivia.options.reduce((accumulator, current) => accumulator + current.count, 0);
        for (let i = 0; i < this.trivia.options.length; i++) {
            const option = this.trivia.options[i];
            option.fullPercentage = isNaN((+option.count / +totalVotes) * 100) ? 0 : (+option.count / +totalVotes) * 100
            option.flooredPercentage = Math.floor(option.fullPercentage)
            option.decimal = option.fullPercentage % 1;
            percentageSum += option.flooredPercentage
        }
        let sortedPercetages = this.trivia.options.concat().sort((a, b) => b.decimal - a.decimal)

        let diffTo100 = 100 - percentageSum;
        for (let i = 0; i < diffTo100; i++) {
            let index = this.trivia.options.findIndex(o => o._id == sortedPercetages[0]._id)
            if (index > -1) this.trivia.options[index].flooredPercentage += 1

        }

    }

    timeOut() {

        this.calculatePercentage();
        this.selected = true;
        this.trivia.timesUp = true;
        this.trivia.pending = false;
        let dailyTrivia = {
            league: this.trivia.league,
            trivia: this.trivia._id,
            timesUp: true
        }
        if (!this.authService.currentUser.dailyTrivias.some(t => t.trivia == this.trivia._id)) {
            this.authService.currentUser.dailyTrivias.push(dailyTrivia)
            this.playService.timesUp(this.trivia._id)
        }

        setTimeout(() => {
            this.nextSlide()
        }, 1000);
    }

    postTimesUp() {

    }

    deleteComment(comment: string) {

        this.timelines = this.timelines.filter(timeline => timeline._id.toString() != comment.toString());

    }

    nextSlide() {
        this.addCommentToggled = true;

        this.slides.slideNext(400).then(() => {
            this.fcm.impact('light')
            this.checkIfTriviaHelper()
        })
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
                    opinion: comment
                }

                this.playDiscussionService.postTriviaDiscussion(data, this.trivia._id)
                    .subscribe((timeline: ITimeline) => {

                        timeline.date = new Date(timeline.date)
                        timeline.count = 0;
                        timeline.created = "1min"
                        this.timelines.unshift(timeline);
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

    addComment() {

        if (this.authService.isLoggedIn()) {
            let data = {
                title: this.trivia.question
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

    selection(option) {

        clearInterval(this.countInterval);
        if (!this.trivia.timesUp && !this.trivia.timesUp) {
            option.count += 1;
            this.calculatePercentage()
            this.userSelection = option._id;
            this.trivia.pending = false;
            this.trivia.correct = this.userSelection == this.trivia.correctOption ? true : false;
            let dailyTrivia = {
                league: this.trivia.league,
                trivia: this.trivia._id,
                answer: option._id,
                timesUp: false
            }
            if (!this.authService.currentUser.dailyTrivias.some(t => t.trivia == this.trivia._id)) {
                this.authService.currentUser.dailyTrivias.push(dailyTrivia)
                this.playService.postTriviaAnswer(this.trivia._id, option._id);
            }

            setTimeout(() => {
                this.nextSlide()
                this.selected = true;
            }, 1000);
        }
    }


    goBack() {

        if (this.trivia.timesUp || this.userSelection) {

            this.authService.addurl = false;
            this.navCtrl.pop();

        } else {
            this.alertCtrl.create({
                header: 'If you close the trivia you will not be able to play again',
                buttons: [
                    {
                        text: 'Cancel',
                        role: 'cancel',
                        handler: () => {
                        }
                    },
                    {
                        text: 'Leave',

                        handler: () => {

                            this.trivia.pending = false;
                            this.trivia.timesUp = true;
                            let dailyTrivia = {
                                league: this.trivia.league,
                                trivia: this.trivia._id,
                                timesUp: true
                            }
                            if (!this.authService.currentUser.dailyTrivias.some(t => t.trivia == this.trivia._id)) {
                                this.authService.currentUser.dailyTrivias.push(dailyTrivia)
                                this.playService.timesUp(this.trivia._id)
                            }
                            this.authService.addurl = false;
                            this.navCtrl.pop();
                        }
                    }
                ]
            }).then(alert => alert.present())
        }

    }

    userHasLiked(thread: any) {

        if (this.authService.currentUser) {
            return this.playLikesService.userHasLiked(thread, this.authService.currentUser._id);
        } else {
            return false;
        }
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
