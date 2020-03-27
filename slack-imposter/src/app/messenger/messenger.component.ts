import { Component, OnInit } from '@angular/core';
import { UserDataManager } from '../user-data-manager';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';

import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Messenger } from '../messenger.service';

@Component({
  selector: 'app-messenger',
  templateUrl: './messenger.component.html',
  styleUrls: ['./messenger.component.css']
})
export class MessengerComponent implements OnInit {

  user: Observable<UserDataManager.User>
  channels: Observable<Array<Messenger.Channel>>

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userDataManager: UserDataManager,
    private messenger: Messenger
    ) { }

  ngOnInit(): void {
    this.user = this.route.paramMap.pipe(
      switchMap((params: ParamMap) =>
      this.userDataManager.getSingleUser(params.get('id')))
    )
    this.channels = this.messenger.getAllChannels()
  }

}
