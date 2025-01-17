import { Component } from '@angular/core';

import { FlashProvider } from '../core/flash.service';
import { ThreadsService } from '../core/threads.service';
import { FcmProvider } from '../core/fcm.service';
import { IThread } from '../shared/interfaces';
import { AuthService } from '../core/auth.service';
import { LikesService } from '../core/likers.service';
import { Storage } from '@ionic/storage';
import { ToastController, MenuController, ModalController, NavController } from '@ionic/angular';
import { SignupAppPage } from '../signup-app/signup-app.page';
import { AppState } from '../core/state.service';
import { TakeService } from '../core/take.service';
import { PlayService } from '../core/play.service';


@Component({
    selector: 'menu-selection',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss'],

})
export class MenuComponent {


    leagues: any;

    constructor(public threadsService: ThreadsService,
        private menuController: MenuController,
        private modalCtrl: ModalController,
        private storage: Storage,
        public global: AppState,
        private takeService: TakeService,
        private navCtrl: NavController,
        public playService: PlayService,
        private likesService: LikesService,
        private toastCtrl: ToastController,
        private authService: AuthService) {

    }

    navbarGetThreads(league: string) {

        if (this.threadsService.postsToggled) {


            this.threadsService.hideInfinite = true;
            this.threadsService.toggleRefresh = false;
            this.threadsService.toggleFeaturedRefresh = false;
            this.threadsService.followers = false;
            this.takeService.followers = false;
            this.threadsService.bookmarks = false;
            this.takeService.bookmarks = false;
            this.threadsService.loaderActive = true;
            this.toTop();


            if (this.threadsService.hot) {
                this.getFeatured(league);
                this.getThreads(league)

            } else if (this.threadsService.new) {
                this.getNewestThreads(league)

            } else if (this.threadsService.top) {
                this.getFeatured(league);
                this.getTopThreads(league);
            }

        } else if(this.takeService.takesToggled) {


            this.threadsService.hideInfinite = true;
            this.threadsService.toggleRefresh = false;
            this.threadsService.followers = false;
            this.takeService.followers = false;
            this.takeService.loaderActive = true;
            this.toTop();


            if (this.takeService.hot) {

                this.getTakes(league)

            } else if (this.takeService.new) {
                this.getNewestTakes(league)

            } else if (this.takeService.top) {

                this.getTopTakes(league);
            }

        } else {
            this.threadsService.hideInfinite = true;
            this.threadsService.toggleRefresh = false;
            this.threadsService.followers = false;
            this.takeService.followers = false;
            this.threadsService.bookmarks = false;
            this.takeService.bookmarks = false;
            this.playService.loaderActive = true;
            this.toTop();
            this.getPlayItems(league);

        }



    }

    toTop() {
        this.authService.observableTabOne.next(true);

    }

    ngOnInit() {

    }
    
    getSavedPosts() {

        this.threadsService.hideInfinite = true;
        this.threadsService.toggleRefresh = false;

        this.toTop()

        if (this.authService.isLoggedIn()) {

            this.threadsService.followers = false;
            this.takeService.followers = false;
            this.threadsService.bookmarks = true;
            this.takeService.bookmarks = true;
            if (this.threadsService.postsToggled) {
                this.getSavedThreads()
            } else if(this.takeService.takesToggled) {
                this.getSavedTakes()
            }


        } else {

            setTimeout(() => {
                this.menuController.close();
            }, 50);

            //Mandar a signup
            let data = {
                message: 'Sign up to save posts!',
            }
            this.modalCtrl.create({
                component: SignupAppPage,
                componentProps: {
                    data: data
                }
            }).then((modal) => {

                modal.present();
                modal.onDidDismiss()
                    .then((data: any) => {
                        if (data.goToSignGlobal) {

                            let typeParams = {
                                type: data.type,
                                fromInitialPage: false
                            }

                            this.authService.paramSignUp = typeParams;
                            this.navCtrl.navigateForward('/signup-global')
                        }
                    })
            })

        }


    }
    handlerFollowers() {

        this.threadsService.hideInfinite = true;
        this.threadsService.toggleRefresh = false;

        this.toTop()

        if (this.authService.isLoggedIn()) {

            this.threadsService.followers = true;
            this.takeService.followers = true;
            this.threadsService.bookmarks = false;
            this.takeService.bookmarks = false;


            if (this.threadsService.postsToggled) {

               
                if (this.authService.currentUser.followingNumber == 0) {
                    this.threadsService.threads = [];
                    this.threadsService.nofollowing = true;

                } else {

                    this.threadsService.loaderActive = true;
                    this.getFollowersThreads('TOP');
                }

            } else if(this.takeService.takesToggled) {

                
                if (this.authService.currentUser.followingNumber == 0) {
                    this.takeService.takes = [];
                    this.takeService.nofollowing = true;

                } else {

                    this.takeService.loaderActive = true;
                  
                    this.getFollowersTakes('TOP');
                }

            }



        } else {

            setTimeout(() => {
                this.menuController.close();
            }, 50);

            //Mandar a signup
            let data = {
                message: 'Sign up so you can start following people!',
            }
            this.modalCtrl.create({
                component: SignupAppPage,
                componentProps: {
                    data: data
                }
            }).then((modal) => {

                modal.present();
                modal.onDidDismiss()
                    .then((data: any) => {
                        if (data.goToSignGlobal) {

                            let typeParams = {
                                type: data.type,
                                fromInitialPage: false
                            }

                            this.authService.paramSignUp = typeParams;
                            this.navCtrl.navigateForward('/signup-global')
                        }
                    })
            })

        }


    }



    getFollowersTakes(league: string, event?: any) {



        this.threadsService.filterBy = league;
        this.takeService.skipFollowers = 0;
        this.takeService.placeholders = true;
        this.takeService.loaderActive = true;

        setTimeout(() => {
            this.menuController.close();
        }, 50);



        this.takeService.getFollowingTakes(league, this.takeService.skipFollowers)
            .subscribe((takes: any) => {
                let prov = takes.map((take: any) => {
                    take.date = new Date(take.date);
                    take.created = this.created(take);
                    take.likedByUser = this.userHasLiked(take);
                    take.count = take.likers ? take.likers.length : 0;
                    take.levelN = take.user.badge.picture.replace('.png', 'N.png');
                    return take;
                })

                this.takeService.takes = prov
                this.takeService.loaderActive = false;
                setTimeout(() => {
                    this.takeService.placeholders = false;
                }, 1000);

                this.threadsService.hideInfinite = false;
               


            },
                (err) => {


                    this.takeService.loaderActive = false;
                    this.takeService.placeholders = false;

                    this.toastCtrl.create({
                        message: err,
                        duration: 3000,
                        position: 'top'
                    }).then(toaster => toaster.present())

                })

    }
    //Followers

    getFollowersThreads(league: string) {


        this.threadsService.filterBy = league;
        this.threadsService.placeholders = true;
        this.threadsService.loaderActive = true;
        this.threadsService.skipFollowers = 0;
        setTimeout(() => {
            this.menuController.close();
        }, 50);

        this.threadsService.getFollowingThreads(league, 0)
            .subscribe((threads: any) => {
                let prov = threads.map((thread: any) => {
                    thread.date = new Date(thread.date);
                    thread.created = this.created(thread);
                    thread.likedByUser = this.userHasLiked(thread);
                    thread.count = thread.likers ? thread.likers.length : 0;
                    thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');
                    return thread;
                })

                this.threadsService.threads = prov
                this.threadsService.loaderActive = false;
                setTimeout(() => {
                    this.threadsService.placeholders = false;
                }, 1000);

                this.threadsService.hideInfinite = false;


            },
                (err) => {

                    this.threadsService.loaderActive = false;
                    this.threadsService.placeholders = false;

                    this.toastCtrl.create({
                        message: err,
                        duration: 3000,
                        position: 'top'
                    }).then(toaster => toaster.present())

                })

    }

    getAllThreads() { //tambien takes y trivias


        this.threadsService.followers = false;
        this.takeService.followers = false;
        this.threadsService.bookmarks = false;
        this.takeService.bookmarks = false;
        this.threadsService.hideInfinite = true;
        this.takeService.nofollowing = false;
        this.takeService.toggleRefresh = false;


        
        if (this.takeService.takesToggled) {

            this.takeService.loaderActive = true;
            this.toTop();
            if (this.takeService.hot) {

                this.getTakes('TOP')
            } else if (this.takeService.new) {
                this.getNewestTakes('TOP')

            } else {

                this.getTopTakes('TOP');
            }

        } else if(this.threadsService.postsToggled) {
          
            

            this.threadsService.loaderActive = true;
            this.toTop();
            if (this.threadsService.hot) {
                this.getFeatured('TOP')
                this.getThreads('TOP')
            } else if (this.threadsService.new) {
                this.getNewestThreads('TOP')

            } else {
                this.getFeatured('TOP')
                this.getTopThreads('TOP');
            }
        } else {
            this.playService.loaderActive = true;
            this.toTop();
            console.log('hola')
            this.getPlayItems('TOP')
        }



    }


    getFeatured(league: string) {
        this.threadsService.loadingFeatured = true;
        this.threadsService.getFeatured(league, 0)
            .subscribe((threads: any) => {

                let prov = threads.map((thread: any) => {
                    thread.date = new Date(thread.date);
                    thread.created = this.created(thread);
                    thread.likedByUser = this.userHasLiked(thread);
                    thread.count = thread.likers ? thread.likers.length : 0;
                    thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');
                    let reducedText = thread.title.substring(0, 50);
                    if (reducedText.length < thread.title.length) {
                        thread.titleToShow = thread.title.substring(0, 50) + "...";
                    } else {
                        thread.titleToShow = thread.title;
                    }

                    return thread;
                })
                


                this.threadsService.featuredThreads = prov;

                let loaderInterval = setInterval(() => { //para sincronizar con hot y top threads

                    if (this.threadsService.threads.length) {
                        this.threadsService.loaderActive = false;
                        this.threadsService.loadingFeatured = false;
                        clearInterval(loaderInterval)
                    }
                }, 10);



            },
                (err) => {
                    this.threadsService.loadingFeatured = false;
                    this.toastCtrl.create({
                        message: err,
                        duration: 3000,
                        position: 'top'
                    }).then(toast => toast.present())

                })
    }

    getPlayItems(league: string) {

        this.threadsService.filterBy = league;
        setTimeout(() => {
            this.menuController.close();
        }, 50);
        this.playService.getDailyTrivias(league)
        
			.subscribe((trivias: any) => {
              
				this.playService.trivias = trivias
				this.playService.loaderActive = false;
				setTimeout(() => {
					this.playService.placeholders = false;
				}, 1000);

				this.threadsService.hideInfinite = false;
				this.playService.toggleRefresh = false;
                this.threadsService.toggleRefresh = false;
                this.playService.toggleRefresh = false;

				


			},
				(err) => {


					this.playService.loaderActive = false;
					this.playService.placeholders = false;

					this.toastCtrl.create({
						message: err,
						duration: 3000,
						position: 'top'
					}).then(toast => toast.present())

				})

    }


    getTakes(league: string) {

        this.threadsService.filterBy = league;
        this.takeService.loaderActive = true;
        this.takeService.placeholders = true;
        this.takeService.skip = 0;
        setTimeout(() => {
            this.menuController.close();
        }, 50);
        this.takeService.getTakes(league, this.takeService.skip)
            .subscribe((takes: any) => {

                let prov = takes.map((take: any) => {
                    take.date = new Date(take.date);
                    take.created = this.created(take);
                    take.likedByUser = this.userHasLiked(take);
                    take.count = take.likers ? take.likers.length : 0;
                    take.levelN = take.user.badge.picture.replace('.png', 'N.png');

                    return take;
                })


                this.takeService.takes = prov;
                this.takeService.loaderActive = false;
                setTimeout(() => {
                    this.takeService.placeholders = false;
                }, 1000);

                this.threadsService.hideInfinite = false;
                this.takeService.toggleRefresh = false;
                


            },
                (err) => {



                    this.takeService.loaderActive = false;
                    this.takeService.placeholders = false;

                    this.toastCtrl.create({
                        message: err,
                        duration: 3000,
                        position: 'top'
                    }).then(toast => toast.present())

                })

    }

    getNewestTakes(league: string) {
        this.threadsService.filterBy = league;
        this.takeService.loaderActive = true;
        this.takeService.placeholders = true;
        this.takeService.skip = 0;
        setTimeout(() => {
            this.menuController.close();
        }, 50);

        this.takeService.getNewestTakes(league, this.takeService.skipNewest)
            .subscribe((takes: any) => {

                let prov = takes.map((take: any) => {
                    take.date = new Date(take.date);
                    take.created = this.created(take);
                    take.likedByUser = this.userHasLiked(take);
                    take.count = take.likers ? take.likers.length : 0;
                    take.levelN = take.user.badge.picture.replace('.png', 'N.png');

                    return take;
                })



                this.takeService.takes = prov

                this.takeService.loaderActive = false;
                setTimeout(() => {
                    this.takeService.placeholders = false;
                }, 1000);

                this.threadsService.hideInfinite = false;
                this.takeService.toggleRefresh = false;
                


            },
                (err) => {

                    this.takeService.loaderActive = false;
                    this.takeService.placeholders = false;

                    this.toastCtrl.create({
                        message: err,
                        duration: 3000,
                        position: 'top'
                    }).then(toast => toast.present())

                })

    }

    getTopTakes(league: string) {

        this.threadsService.filterBy = league;
        this.takeService.loaderActive = true;
        this.takeService.placeholders = true;
        this.takeService.skip = 0;
        setTimeout(() => {
            this.menuController.close();
        }, 50);
        this.takeService.getTakes(league, this.threadsService.skipTop)
            .subscribe((takes: any) => {

                let prov = takes.map((take: any) => {
                    take.date = new Date(take.date);
                    take.created = this.created(take);
                    take.likedByUser = this.userHasLiked(take);
                    take.count = take.likers ? take.likers.length : 0;
                    take.levelN = take.user.badge.picture.replace('.png', 'N.png');

                    return take;
                })


                this.takeService.takes = prov

                this.takeService.loaderActive = false;
                setTimeout(() => {
                    this.threadsService.placeholders = false;
                }, 1000);

                this.threadsService.hideInfinite = false;
                this.takeService.toggleRefresh = false;
               


            },
                (err) => {

                    this.takeService.loaderActive = false;
                    this.takeService.placeholders = false;



                    this.toastCtrl.create({
                        message: err,
                        duration: 3000,
                        position: 'top'
                    }).then(toaster => {
                        toaster.present()
                    })

                })

    }

    getSavedTakes() {

        this.takeService.loaderActive = true;
        this.takeService.placeholders = true;
        this.takeService.skipSaved = 0;
        setTimeout(() => {
            this.menuController.close();
        }, 50);
        this.takeService.getBookmarks(this.takeService.skipSaved)
            .subscribe((takes: any) => {

                let prov = takes.map((take: any) => {
                    take.date = new Date(take.date);
                    take.created = this.created(take);
                    take.likedByUser = this.userHasLiked(take);
                    take.count = take.likers ? take.likers.length : 0;
                    take.levelN = take.user.badge.picture.replace('.png', 'N.png');

                    return take;
                })


                this.takeService.takes = prov;
                this.takeService.loaderActive = false;
                setTimeout(() => {
                    this.takeService.placeholders = false;
                }, 1000);

                this.threadsService.hideInfinite = false;
                this.takeService.toggleRefresh = false;
                


            },
                (err) => {

                    this.takeService.loaderActive = false;
                    this.takeService.placeholders = false;

                    this.toastCtrl.create({
                        message: err,
                        duration: 3000,
                        position: 'top'
                    }).then(toast => toast.present())

                })

    }

    getSavedThreads() {

        this.threadsService.loaderActive = true;
        this.threadsService.placeholders = true;
        this.threadsService.skipSaved = 0;
        this.threadsService.threads = []
        setTimeout(() => {
            this.menuController.close();
        }, 50);

        this.threadsService.getBookmarks(0)
            .subscribe((threads: any) => {

                console.log(threads)

                let prov = threads.map((thread: any) => {
                    thread.date = new Date(thread.date);
                    thread.created = this.created(thread);
                    thread.likedByUser = this.userHasLiked(thread);
                    thread.count = thread.likers ? thread.likers.length : 0;
                    thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');

                    return thread;
                })

                this.threadsService.threads = prov
                setTimeout(() => {
                    this.threadsService.placeholders = false;
                }, 1000);

                this.threadsService.hideInfinite = false;
                this.threadsService.toggleRefresh = false;
                this.threadsService.loaderActive = false;
                this.threadsService.toggleFeaturedRefresh = false;
            },
                (err) => {

                    this.threadsService.loaderActive = false;
                    this.threadsService.placeholders = false;

                    this.toastCtrl.create({
                        message: err,
                        duration: 3000,
                        position: 'top'
                    }).then(toast => toast.present())

                })

    }

   

    getThreads(league: string) {


        this.threadsService.filterBy = league;
        this.threadsService.loaderActive = true;
        this.threadsService.placeholders = true;
        this.threadsService.skip = 0;
        this.threadsService.threads = []
        setTimeout(() => {
            this.menuController.close();
        }, 50);

        this.threadsService.getThreads(league, 0)
            .subscribe((threads: any) => {

                let prov = threads.map((thread: any) => {
                    thread.date = new Date(thread.date);
                    thread.created = this.created(thread);
                    thread.likedByUser = this.userHasLiked(thread);
                    thread.count = thread.likers ? thread.likers.length : 0;
                    thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');

                    return thread;
                })

                this.threadsService.threads = prov
                setTimeout(() => {
                    this.threadsService.placeholders = false;
                }, 1000);

                this.threadsService.hideInfinite = false;
                this.threadsService.loaderActive = false;
                this.threadsService.toggleRefresh = false;
                this.threadsService.toggleFeaturedRefresh = false;
                console.log(this.threadsService.loaderActive)
            },
                (err) => {

                    this.threadsService.loaderActive = false;
                    this.threadsService.placeholders = false;

                    this.toastCtrl.create({
                        message: err,
                        duration: 3000,
                        position: 'top'
                    }).then(toast => toast.present())

                })

    }

    getNewestThreads(league: string) {

        this.threadsService.filterBy = league;
        this.threadsService.loaderActive = true;
        this.threadsService.placeholders = true;
        setTimeout(() => {
            this.menuController.close();
        }, 50);
        this.threadsService.skipNewest = 0;


        this.threadsService.getNewestThreads(league, 0)
            .subscribe((threads: any) => {

                let prov = threads.map((thread: any) => {
                    thread.date = new Date(thread.date);
                    thread.created = this.created(thread);
                    thread.likedByUser = this.userHasLiked(thread);
                    thread.count = thread.likers ? thread.likers.length : 0;
                    thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');

                    return thread;
                })

                this.threadsService.threads = prov
                this.threadsService.loaderActive = false;
                setTimeout(() => {
                    this.threadsService.placeholders = false;
                }, 1000);

                this.threadsService.hideInfinite = false;
                this.threadsService.toggleRefresh = false;
                this.threadsService.toggleFeaturedRefresh = false;


            },
                (err) => {


                    this.threadsService.loaderActive = false;
                    this.threadsService.placeholders = false;

                    this.toastCtrl.create({
                        message: err,
                        duration: 3000,
                        position: 'top'
                    }).then(toast => toast.present())

                })

    }

    getTopThreads(league: string) {

        this.threadsService.filterBy = league;
        this.threadsService.loaderActive = true;
        this.threadsService.placeholders = true;
        this.threadsService.threads = []
        setTimeout(() => {
            this.menuController.close();
        }, 50);
        this.threadsService.skipTop = 0;

        this.threadsService.getTopThreads(league, 0)
            .subscribe((threads: any) => {

                let prov = threads.map((thread: any) => {
                    thread.date = new Date(thread.date);
                    thread.created = this.created(thread);
                    thread.likedByUser = this.userHasLiked(thread);
                    thread.count = thread.likers ? thread.likers.length : 0;
                    thread.levelN = thread.user.badge.picture.replace('.png', 'N.png');


                    return thread;
                })


                this.threadsService.threads = prov

                setTimeout(() => {
                    this.threadsService.placeholders = false;
                }, 1000);


                this.threadsService.hideInfinite = false;
                this.threadsService.loaderActive = false;
                this.threadsService.toggleRefresh = false;
                this.threadsService.toggleFeaturedRefresh = false;


            },
                (err) => {

                    this.threadsService.loaderActive = false;
                    this.threadsService.placeholders = false;


                    this.toastCtrl.create({
                        message: err,
                        duration: 3000,
                        position: 'top'
                    }).then(toaster => {
                        toaster.present()
                    })

                })

    }


    userHasLiked(thread: IThread) {

        if (this.authService.currentUser) {
            return this.likesService.userHasLiked(thread, this.authService.currentUser._id);
        } else {
            return false;
        }
    }

    created(thread: IThread): string {

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



}