import { Injectable } from '@angular/core'
import { HttpClient, HttpErrorResponse } from '@angular/common/http'

import { TokenManager } from './token-manager.service'
import { environment } from '../environments/environment'
import { catchError, map } from 'rxjs/operators'
import { Observable, throwError } from 'rxjs'


@Injectable({
    providedIn: 'root'
})
export class Messenger {

    private token: string

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

    getAllUsers(): Observable<Array<Messenger.User>> {
        return this.http.post<Array<Messenger.User>>(environment.apiUrl, {
            "csrf-token": this.token,
            "method": "list"
        }).pipe(
            catchError((error: HttpErrorResponse) => this.handleError(error))
        )
    }
}

export namespace Messenger {
    export interface User {
        id: string
        name: string
        real_name: string
        display_name: string
        image: string
    }
}

