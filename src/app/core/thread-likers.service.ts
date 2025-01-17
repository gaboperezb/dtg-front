import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse,  } from '@angular/common/http';
import { ITimeline, IAnswer } from '../shared/interfaces'
//Grab everything with import 'rxjs/Rx';
import { Observable, throwError } from 'rxjs';
import {map, catchError} from 'rxjs/operators'
import { AuthService } from './auth.service';


@Injectable({
    providedIn: 'root'
})
export class ThreadLikesService {

    baseDiscussionsUrl: string = 'https://www.discussthegame.com/api/thread-discussions';
    baseUrl: string = 'https://www.discussthegame.com/api/threads';

    constructor(private http: HttpClient, public authService: AuthService) { }

    postLike(discussionOrAnswer: string, discussion: ITimeline, likerUsername: string, answer?: IAnswer) {
        
        let body = answer ? {"aId": answer._id} : {};
        if (answer) answer.likers.push(likerUsername);
        else discussion.likers.push(likerUsername);

        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let options = {headers: headers};
        let url = `${this.baseDiscussionsUrl}/${discussion._id}/likers/${likerUsername}?discussionOrAnswer=${discussionOrAnswer}`;
        return this.http.post(url, body, options)
                        .pipe(catchError(this.handleError))
                        .subscribe();
    }

    deleteLike(discussionOrAnswer: string, discussion: ITimeline, username: string, answer?: IAnswer) {
        
        let query = answer ? `&answerId=${answer._id}` : "";
        if (answer) answer.likers = answer.likers.filter(likerUsername => likerUsername !== username);
        else  discussion.likers = discussion.likers.filter(likerUsername => likerUsername !== username);
        
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let url = `${this.baseDiscussionsUrl}/${discussion._id}/likers/${username}?discussionOrAnswer=${discussionOrAnswer}${query}`;
    
        return this.http.delete(url, {headers: headers})
                        .pipe(catchError(this.handleError))
                        .subscribe();
    }

    postThreadLike(thread: any, user: string) {

        thread.likers.push(user);
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let options = {headers: headers};
        
        let url = `${this.baseUrl}/${thread._id}/likers/${user}`;
        return this.http.post(url, {}, options)
                        .pipe(catchError(this.handleError))
                        .subscribe();
    }

    deleteThreadLike(thread: any, user: string) {

        thread.likers = thread.likers.filter(likerUsername => likerUsername !== user);
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'application/json');
        headers = headers.append('Authorization', this.authService.token);
        let options = {headers: headers};
        
        let url = `${this.baseUrl}/${thread._id}/likers/${user}`;
        return this.http.delete(url, options )
                        .pipe(catchError(this.handleError))
                        .subscribe();
    }

    //También para respuestas (por eso no se especifica el tipo)
    userHasLiked(discussion:any, username: string) {
        return discussion.likers.some((liker:any) => liker === username);
    }

    //También para respuestas (por eso no se especifica el tipo)
    userHasDisliked(discussion:any, username: string) {
        return discussion.dislikers.some((disliker:any) => disliker === username);
    }

    private handleError(error) {
        console.error('server error:', error);
        let errorMessage = '';
        if (error instanceof HttpErrorResponse) {
          // client-side error
          errorMessage = error.message;
        } else {
          // server-side error
          errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }
        return throwError(errorMessage);
      }



}