import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { TokenManager } from './token-manager.service'
import { environment } from '../environments/environment'
import { catchError } from 'rxjs/operators'
import { Observable, throwError, of } from 'rxjs'
import { UserDataManager } from './user-data-manager';

@Injectable({
    providedIn: 'root'
})
export class Messenger {

    private token: string
    private cache: Array<Messenger.Channel> = null

    constructor(private http: HttpClient, private tokenManager: TokenManager) {
        if(this.tokenManager.hasToken()) {
            this.token = this.tokenManager.getToken()
        } else {
                this.tokenManager.startAuth();
        }
    }

    private handleError(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
                // A client-side or network error occurred. Handle it accordingly.
                console.error('An error occurred:', error.error.message);
        } else {
                // The backend returned an unsuccessful response code.
                // The response body may contain clues as to what went wrong,
                if(error.status == 400 && ["Error: invalid token", "Error: not authed"].includes(error.error)) {
                        this.tokenManager.startAuth()
                        return throwError("Reauthentication required")
                }
                console.error(
                        `Backend returned code ${error.status}, ` +
                        `body was: ${error.error}`);
        }
        return throwError('Something bad happened; please try again later')
    }

    getAllChannels(): Observable<Array<Messenger.Channel>> {
        if(this.cache == null) {
            let query = this.http.post<Array<Messenger.Channel>>(environment.apiUrl, {
                "csrf-token": this.token,
                "method": "list_channels"
            }).pipe(
                catchError((error: HttpErrorResponse) => this.handleError(error))
            )

            query.subscribe((channels: Array<Messenger.Channel>) => this.cache = channels)
            return query
        } else {
            return of(this.cache)
        }
    }

    postMessage(message: string, channel: Messenger.Channel, user: UserDataManager.User): Observable<Messenger.Result> {
        return this.http.post<Messenger.Result>(environment.apiUrl, {
            "csrf-token": this.token,
            "method": "post_message",
            "channel": channel.id,
            "text": message,
            "icon_url": user.image,
            "username": user.name
        }).pipe(
            catchError((error: HttpErrorResponse) => this.handleError(error))
        )
    }
    
}

export namespace Messenger {
    export interface Channel {
        id: string
        name: string
    }
    export interface Result {
        ok: boolean
    }
}
