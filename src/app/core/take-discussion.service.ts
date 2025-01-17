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
export class TakeDiscussionService {

    private baseUrl: string = 'https://www.discussthegame.com/api/take-discussions';

    constructor(private http: HttpClient, public authService: AuthService) { }
    
    deletePost(data:any) {
        
      let headers = new HttpHeaders({'Content-Type': 'application/json'});
      headers = headers.append('Authorization', this.authService.token);
      let options = {headers: headers}
      return this.http.post(this.baseUrl + "/i/delete-post", data, options)
                      .pipe(
                          map((res: any) => {
                          let data = res.succeded;
                          return data;
                      }),
                      catchError(this.handleError));

  }

    postAnswer(data:any, takeId: any, discussionId: string, text: string, answerId?: string): Observable<any> {
        
      let headers = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json');
      headers = headers.append('Authorization', this.authService.token);
      let options = {headers: headers};
      if (answerId)  data.aId = answerId
         
      data.replyText = text;
      let url = this.baseUrl + "/" + discussionId + "/answers";
      return this.http.post(url, data, options)
                  .pipe(
                     
                  catchError(this.handleError));


  }

    deletePostMyTake(data:any) {
        
      let headers = new HttpHeaders({'Content-Type': 'application/json'});
      headers = headers.append('Authorization', this.authService.token);
      let options = {headers: headers};
      return this.http.post(this.baseUrl + "/i/delete-post-mytake", data, options)
                      .pipe(
                          map((res: any) => {
                          let data = res.succeded;
                          return data;
                      }),
                      catchError(this.handleError));

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

    postDiscussion(data:any, takeId: string): Observable<any> {
        
      let headers = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json');
      headers = headers.append('Authorization', this.authService.token);
      let options = {headers: headers};
      let url = this.baseUrl + "/" + takeId;
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