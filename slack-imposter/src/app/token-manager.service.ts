import { Injectable } from '@angular/core';
import { environment } from '../environments/environment'

@Injectable({
    providedIn: 'root'
})
export class TokenManager {

    static readonly TOKEN_LOCAL_STORAGE_KEY = "slack-token";

    hasToken() : boolean {
        return  this.getToken() != null
    }

    getToken() : String {
        return localStorage.getItem(TokenManager.TOKEN_LOCAL_STORAGE_KEY)
    }

    startAuth() : void {
        window.location.assign(environment.oauthUrl + "?redirect=" + encodeURIComponent(environment.thisUrl))
    }
}
