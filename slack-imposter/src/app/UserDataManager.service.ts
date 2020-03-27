import { Injectable } from '@angular/core'
import { HttpClient, HttpErrorResponse } from '@angular/common/http'

import { TokenManager } from './token-manager.service'
import { environment } from '../environments/environment'
import { catchError, map } from 'rxjs/operators'
import { Observable, throwError, of } from 'rxjs'


@Injectable({
    providedIn: 'root'
})
export class UserDataManager {

    private token: string

    private cache: Array<UserDataManager.User> = null

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

    getAllUsers(): Observable<Array<UserDataManager.User>> {
        if(this.cache == null) {
            let query = this.http.post<Array<UserDataManager.User>>(environment.apiUrl, {
                "csrf-token": this.token,
                "method": "list"
            }).pipe(
                catchError((error: HttpErrorResponse) => this.handleError(error))
            )

            query.subscribe((users: Array<UserDataManager.User>) => this.cache = users)

            return query
        } else {
            return of(this.cache)
        }
        
    }

    getSingleUser(id: string): Observable<UserDataManager.User> {
        let cached = this.cache?.find((value) => value.id == id)
        if(cached) {
            return of(cached)
        } else {
            return this.http.post<UserDataManager.User>(environment.apiUrl, {
                "csrf-token": this.token,
                "method": "single",
                "id": id
            }).pipe(
                catchError((error: HttpErrorResponse) => this.handleError(error))
            )
        }
    }
}

export namespace UserDataManager {
    export interface User {
        id: string
        name: string
        real_name: string
        display_name: string
        image: string
    }
}

