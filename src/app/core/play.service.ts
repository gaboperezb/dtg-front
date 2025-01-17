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
export class PlayService {

    baseUrl: string = 'https://www.discussthegame.com/api/play';
    trivias: any[] = [];
    picks: any[] = [];
    triviaToggled: boolean = true;
    refreshTrivias: any[] = [];
    loaderActive: boolean = false; //ion-infinite
    playToggled: boolean = false; 
    toggleRefresh: boolean = false;
    placeholders: boolean = true;
   

    constructor(private http: HttpClient, public authService: AuthService, private threadsService: ThreadsService) { }


    getDailyTrivias(league: string): Observable<any>  {

        return this.http.get(this.baseUrl + "/daily-trivias?league=" + league + '&leagues=' + JSON.stringify(this.threadsService.leagues))
                        .pipe(
                        catchError(this.handleError));
    }

    getDailyPicks(league: string): Observable<any>  {

        return this.http.get(this.baseUrl + "/daily-picks?league=" + league + '&leagues=' + JSON.stringify(this.threadsService.leagues))
                        .pipe(
                        catchError(this.handleError));
    }

    postTriviaAnswer(id:string, answerId: string) {
        let headers = new HttpHeaders();
        let data = {
            trivia: id,
            answerId: answerId
        }
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let options = {headers: headers};
        return this.http.post(this.baseUrl + "/daily-trivias/" + id + "/answers", data, options)
                        .pipe(
                        catchError(this.handleError))
                        .subscribe()
    }

    timesUp(id: string) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let options = {headers: headers};
        return this.http.post(this.baseUrl + "/daily-trivias/" + id + "/timesup", {}, options)
                        .pipe(
                        catchError(this.handleError))
                        .subscribe()
    }

    getDailyTrivia(id) {
        return this.trivias.find(trivia => trivia._id === id);
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