import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse,  } from '@angular/common/http';
import { ITimeline, IUserDiscussion } from '../shared/interfaces';
import { IAnswer } from '../shared/interfaces';
//Grab everything with import 'rxjs/Rx';
import { Observable, throwError } from 'rxjs';
import {map, catchError} from 'rxjs/operators'
import { AuthService } from './auth.service';



@Injectable({
    providedIn: 'root'
})
export class PlayDiscussionService {

    private baseUrl: string = 'https://www.discussthegame.com/api/play-discussions';

    constructor(private http: HttpClient, public authService: AuthService) { }
    
    deleteTriviaAnswer(data:any) {
        
      let headers = new HttpHeaders({'Content-Type': 'application/json'});
      headers = headers.append('Authorization', this.authService.token);
      let options = {headers: headers}
      return this.http.post(this.baseUrl + "/i/delete-trivia-answer", data, options)
                      .pipe(
                          map((res: any) => {
                          let data = res.succeded;
                          return data;
                      }),
                      catchError(this.handleError));

  }

    postTriviaAnswer(data:any, triviaId: any, discussionId: string, text: string, answerId?: string): Observable<any> {
        
      let headers = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json');
      headers = headers.append('Authorization', this.authService.token);
      let options = {headers: headers};
      if (answerId)  data.aId = answerId
         
      data.replyText = text;
      let url = this.baseUrl + "/trivias/" + discussionId + "/answers";
      return this.http.post(url, data, options)
                  .pipe(
                     
                  catchError(this.handleError));


  }

  deleteTriviaComment(data:any) {
        
      let headers = new HttpHeaders({'Content-Type': 'application/json'});
      headers = headers.append('Authorization', this.authService.token);
      let options = {headers: headers};
      return this.http.post(this.baseUrl + "/i/delete-trivia-comment", data, options)
                      .pipe(
                          map((res: any) => {
                          let data = res.succeded;
                          return data;
                      }),
                      catchError(this.handleError));

  }
  
    getNewestTriviaDiscussions(triviaId: string, skip: number): Observable<any>  {
        let headers = new HttpHeaders({'Content-Type': 'application/json'});
        headers = headers.append('Authorization', this.authService.token);
        return this.http.get(this.baseUrl + "/trivias/" + triviaId + "/new?skip=" + skip, {headers})
                        .pipe(
                            
                        catchError(this.handleError));
    }

    getTriviaDiscussions(triviaId: string, skip: number): Observable<any>  {
        let headers = new HttpHeaders({'Content-Type': 'application/json'});
        headers = headers.append('Authorization', this.authService.token);
        return this.http.get(this.baseUrl + "/trivias/" + triviaId + "?skip=" + skip, {headers})
                        .pipe(
                        catchError(this.handleError));
    }

    getTopTriviaDiscussions(triviaId: string, skip: number): Observable<any>  {
       
        let headers = new HttpHeaders({'Content-Type': 'application/json'});
        headers = headers.append('Authorization', this.authService.token);
        return this.http.get(this.baseUrl + "/trivias/" + triviaId + "/top?skip=" + skip, {headers})
                        .pipe(    
                        catchError(this.handleError));
    }

    postTriviaDiscussion(data:any, triviaId: string): Observable<any> {
        
      let headers = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json');
      headers = headers.append('Authorization', this.authService.token);
      let options = {headers: headers};
      let url = this.baseUrl + "/trivias/" + triviaId;
      return this.http.post(url, data, options)
                  .pipe(
                      
                  catchError(this.handleError));
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