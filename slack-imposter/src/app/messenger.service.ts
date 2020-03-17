import { WebClient } from '@slack/web-api'
import { Injectable } from '@angular/core'

@Injectable({
    providedIn: 'root'
})
export class Messenger {
    slack: WebClient

    constructor(token: string) {
        this.slack = new WebClient(token);
    }

    async getUserInfo(userid: string) {
        return this.slack.users.info({
            user: userid
        })
    }

    async getAllUsers(): Promise<Array<Messenger.User>> {
        return this.slack.paginate('users.list', {}, () => false, (accumulator, page, index) => {
            if(accumulator == null) {
                accumulator = []
            }
            for (const member of (page.members as Array<any>)) {
                accumulator.push(new Messenger.User(
                    member.id,
                    member.name,
                    member.profile.real_name,
                    member.profile.display_name,
                    member.profile.image_72
                ))
            }
            return accumulator
        })
    }
}

export namespace Messenger {
    export class User {
        id: string
        name: string
        real_name: string
        display_name: string
        image: string

        constructor(id: string, name: string, real_name: string, display_name: string, image: string) {
            this.id = id
            this.name = name
            this.real_name = real_name
            this.display_name = display_name
            this.image = image
        }
    }
}

