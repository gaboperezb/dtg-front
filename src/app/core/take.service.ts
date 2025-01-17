import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse,  } from '@angular/common/http';
import { IThread, IPoll, ITake } from '../shared/interfaces'
//Grab everything with import 'rxjs/Rx';
import { Observable, throwError } from 'rxjs';
import {map, catchError} from 'rxjs/operators'
import { AuthService } from './auth.service';
import { ThreadsService } from './threads.service';


@Injectable({
    providedIn: 'root'
})
export class TakeService {

    baseUrl: string = 'https://www.discussthegame.com/api/take';
    embdelyURLOauth: string = 'https://api.embedly.com/1/oembed';
    embdelyURLDisplay: string = 'https://i.embed.ly/1/display/resize';
    embedlyKey: string = "116e3e2241ba42e49a5d9091d51206dd";
    leagueToDownload: string = "TOP";
    takesToggled: boolean = false;

    fullScreen: boolean = false;
    fullScreenImage: string;
    menuLeagues: any = [];
    nofollowing: boolean = false;
    placeholders: boolean = true;
    loaderActive: boolean = false; //ion-infinite
    bookmarks: boolean = false
  
    loadingFeatured: boolean = true;
    toggleRefresh: boolean = false;
    toggleFeaturedRefresh: boolean = false;
    followers: boolean = false;
    width: number;
    height: number;
    hot: boolean = true;
    new: boolean = false;
    top: boolean = false;
    videoFullscreen: boolean = false;
    destroyDiscussions: boolean = false; //en lockscreen salen los  controles de video, hay que evitar esto
    skip: number = 0;
	skipNewest: number = 0;
	skipTop: number = 0;
    skipFollowers: number = 0;
    skipSaved: number = 0;

    takes: ITake[] = [];
    refreshTakes: IThread[] = [];

    takeUserPage: ITake;
    editUrl: string = '/tabs/tab1'

    constructor(private http: HttpClient, public authService: AuthService, private threadsService: ThreadsService) { }


    edit(id:string, data) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let options = {headers: headers};        
        return this.http.post(this.baseUrl + '/' + id, data, options)
                        .pipe(
                            
                        catchError(this.handleError));
                        

    }

    deleteTake(data:any) {
        
        let headers = new HttpHeaders({'Content-Type': 'application/json'});
        headers = headers.append('Authorization', this.authService.token);
        let options = {headers: headers};
        return this.http.post(this.baseUrl + "/i/delete-take", data, options)
                        .pipe(
                            map((res: any) => {
                            let data = res.succeded;
                            return data;
                        }),
                        catchError(this.handleError));
    }

    embedlyAPI(url: string): Observable<any> {
       
        return this.http.get(this.embdelyURLOauth + '?url=' + url + '&key=' + this.embedlyKey)
                        .pipe(
                        catchError(this.handleError));

    }

    boost(take: any, likes: number) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let options = {headers: headers};
        let body = {
            likes
        }
        let url = `${this.baseUrl}/${take}/boost`;
        return this.http.post(url, body, options)
                        .pipe(catchError(this.handleError))
                        .subscribe();
    }

    getBookmarks(skip: number): Observable<any> {
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.authService.token);
        return this.http.get(this.baseUrl + '/bookmarks?skip=' + skip, {headers})
                        .pipe(       
                        catchError(this.handleError));

    }

    addToBookmarks(thread: any) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let options = {headers: headers};
        let url = `${this.baseUrl}/${thread}/bookmark`;
        return this.http.post(url, {}, options)
                        .pipe(catchError(this.handleError))
                        .subscribe();
    }

    deleteBookmark(thread: any) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let options = {headers: headers};
        let url = `${this.baseUrl}/${thread}/bookmark`;
        return this.http.delete(url, options)
                        .pipe(catchError(this.handleError))
                        .subscribe();

    }

    embedlyDisplay(url: string): Observable<any> {
       
        let headers = new HttpHeaders();
        headers = headers.append('Accept', 'image/*');
        return this.http.get(this.embdelyURLDisplay + '?url=' + url + '&key=' + this.embedlyKey)
                        .pipe(
                        catchError(this.handleError));

    }

    getTeamTakes(team: string, skip: number): Observable<any> {

        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.authService.token);
        return this.http.get(this.baseUrl + '/i/teams?team=' + team + '&skip=' + skip + '&limit=10', {headers})
                        .pipe(   
                        catchError(this.handleError));

    }

    newTake(data:any) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let options = {headers: headers};
        return this.http.post(this.baseUrl, data, options)
                        .pipe(
                            
                        catchError(this.handleError));

    }

    getTakeDB(id: string): Observable<any> {
       
        return this.http.get(this.baseUrl + '/' + id)
                        .pipe(
                            
                        catchError(this.handleError));

    }

    getFollowingTakes(league: string, skip: number): Observable<any> {
        let headers = new HttpHeaders();
        headers = headers.append('Authorization', this.authService.token);
        let options = {headers: headers};   
        return this.http.get(this.baseUrl + '/following' + '?league=' + league + '&skip=' + skip + '&limit=10'+ '&leagues=' + JSON.stringify(this.threadsService.leagues), options)
                        .pipe(
                           
                        catchError(this.handleError));

    }

    getTakes(league: string, skip: number): Observable<any> {
        let userId = this.authService.isLoggedIn() ? this.authService.currentUser._id : '0';
        return this.http.get(this.baseUrl + '?league=' + league + '&skip=' + skip + '&leagues=' + JSON.stringify(this.threadsService.leagues) + '&userId=' + userId+ '&limit=10')
                        .pipe(
                            
                        catchError(this.handleError));

    }

    getNewestTakes(league: string, skip: number): Observable<any> {
    
        let userId = this.authService.isLoggedIn() ? this.authService.currentUser._id : '0';
        return this.http.get(this.baseUrl + "/i/newest" + '?league=' + league + '&skip=' + skip+ '&leagues=' + JSON.stringify(this.threadsService.leagues) + '&userId=' + userId + '&limit=10' )
                        .pipe(
                            
                        catchError(this.handleError));

    }

    getTopTakes(league: string, skip: number): Observable<any> {
        let userId = this.authService.isLoggedIn() ? this.authService.currentUser._id : '0';
        return this.http.get(this.baseUrl + "/i/top" + '?league=' + league + '&skip=' + skip + '&leagues=' + JSON.stringify(this.threadsService.leagues) + '&userId=' + userId+ '&limit=10' )
                        .pipe(
                            
                        catchError(this.handleError));

    }

    getTake(id) {
        return this.takes.find(take => take._id === id);
    }

    getNewestDiscussions(takeId: string, skip: number): Observable<any>  {
        let userId = this.authService.isLoggedIn() ? this.authService.currentUser._id : '0';
        return this.http.get(this.baseUrl + "/" + takeId + '/new' + "?skip=" + skip + '&userId=' + userId)
                        .pipe(
                            
                        catchError(this.handleError));
    }

    getDiscussions(takeId: string, skip: number): Observable<any>  {
        let userId = this.authService.isLoggedIn() ? this.authService.currentUser._id : '0';
        return this.http.get(this.baseUrl + "/" + takeId + "?skip=" + skip + '&userId=' + userId)
                        .pipe(
                           
                        catchError(this.handleError));
    }

    getTopDiscussions(takeId: string, skip: number): Observable<any>  {
        let userId = this.authService.isLoggedIn() ? this.authService.currentUser._id : '0';
        return this.http.get(this.baseUrl + "/" + takeId + '/top' + "?skip=" + skip + '&userId=' + userId)
                        .pipe(
                           
                        catchError(this.handleError));
    }



    postVote(takeId: string, option: string) {    

        //Para no quebrar antiguas versiones
           
            let body = {
                option,
                takeId
            }
            let headers = new HttpHeaders();
            headers = headers.append('Content-Type', 'application/json');
            headers = headers.append('Authorization', this.authService.token);
            let options = {headers: headers};
            let url = `${this.baseUrl}/${takeId}/vote`
            return this.http.post(url, body, options)
                            .pipe(catchError(this.handleError))
                            .subscribe();
        }

     //Tambien para daily poll
     userHasVoted(take:any, userId: string) {
        return take.votes.some((voter:any) => voter.user === userId);
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