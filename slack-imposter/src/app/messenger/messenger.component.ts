import { Component, OnInit } from '@angular/core';
import { UserDataManager } from '../user-data-manager';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';

import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Messenger } from '../messenger.service';

import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-messenger',
  templateUrl: './messenger.component.html',
  styleUrls: ['./messenger.component.css']
})
export class MessengerComponent implements OnInit {

  user: UserDataManager.User
  channels: Array<Messenger.Channel>

  messageForm

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userDataManager: UserDataManager,
    private messenger: Messenger,
    private formBuilder: FormBuilder
    ) {

      this.messageForm = this.formBuilder.group({
        channel: '',
        message: ''
      })

    }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap((params: ParamMap) =>
      this.userDataManager.getSingleUser(params.get('id')))
    ).subscribe((user: UserDataManager.User) => this.user = user)

    this.messenger.getAllChannels().subscribe((channels: Array<Messenger.Channel>) => this.channels = channels);
  }

  onSubmit(messageData) {
    if(!messageData.channel) {
      console.warn("Cannot submit to empty channel")
      return
    }
    let channel = this.channels.find((it: Messenger.Channel) => it.id == messageData.channel)
    if(!channel) {
      console.warn("Cannot submit to nonexistent channel")
      return
    }
    if(!messageData.message) {
      console.warn("Cannot submit empty message")
      return
    }
    if(!this.user) {
      console.warn("Cannot submit with null user")
      return
    }
    this.messenger.postMessage(messageData.message, channel, this.user).subscribe()
    this.messageForm.reset()
  }

}
