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
export class ThreadDiscussionService {

    private baseUrl: string = 'https://www.discussthegame.com/api/thread-discussions';


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

    editComment(data: any) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let options = {headers: headers};      
        return this.http.put(this.baseUrl + '/edit', data, options)
                        .pipe(
                           
                        catchError(this.handleError));

    }

    editAnswer(data: any) {
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let options = {headers: headers};    
        return this.http.put(this.baseUrl + '/edit/answers', data, options)
                        .pipe(
                            
                        catchError(this.handleError));

    }

    deletePostMyThread(data:any) {
        
        let headers = new HttpHeaders({'Content-Type': 'application/json'});
        headers = headers.append('Authorization', this.authService.token);
        let options = {headers: headers};
        return this.http.post(this.baseUrl + "/i/delete-post-mythread", data, options)
                        .pipe(
                            map((res: any) => {
                            let data = res.succeded;
                            return data;
                        }),
                        catchError(this.handleError));

    }

    getNewestDiscussions(threadId: string, skip: number): Observable<any>  {
        let userId = this.authService.isLoggedIn() ? this.authService.currentUser._id : '0';
        return this.http.get(this.baseUrl + "/" + threadId + '/new' + "?skip=" + skip + '&userId=' + userId)
                        .pipe(
                            
                        catchError(this.handleError));
    }

    getDiscussions(threadId: string, skip: number): Observable<any>  {
        let userId = this.authService.isLoggedIn() ? this.authService.currentUser._id : '0';
        return this.http.get(this.baseUrl + "/" + threadId + "?skip=" + skip + '&userId=' + userId)
                        .pipe(
                           
                        catchError(this.handleError));
    }

    getTopDiscussions(threadId: string, skip: number): Observable<any>  {
        let userId = this.authService.isLoggedIn() ? this.authService.currentUser._id : '0';
        return this.http.get(this.baseUrl + "/" + threadId + '/top' + "?skip=" + skip + '&userId=' + userId)
                        .pipe(
                           
                        catchError(this.handleError));
    }


    postDiscussion(data:any, threadId: string): Observable<any> {
        
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let options = {headers: headers};
        let url = this.baseUrl + "/" + threadId;
        return this.http.post(url, data, options)
                    .pipe(
                        
                    catchError(this.handleError));


    }

    getDiscussion(discussionId:string):Observable<any>  {
        return this.http.get(this.baseUrl + "/" + discussionId + "/notification")
                        .pipe(
                            
                        catchError(this.handleError));

    }

    getAnswers(discussionId:string):Observable<any>  {
        let userId = this.authService.isLoggedIn() ? this.authService.currentUser._id : '0';
        return this.http.get(this.baseUrl + "/" + discussionId + "/answers?userId=" + userId)
                        .pipe(
                           
                        catchError(this.handleError));

    }

    postAnswer(data:any, threadId: any, discussionId: string, text: string, answerId?: string): Observable<any> {
        
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