import { Component, OnInit } from '@angular/core';
import { UserDataManager } from '../UserDataManager.service';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';

import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-messenger',
  templateUrl: './messenger.component.html',
  styleUrls: ['./messenger.component.css']
})
export class MessengerComponent implements OnInit {

  user: Observable<UserDataManager.User>

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userDataManager: UserDataManager
    ) { }

  ngOnInit(): void {
    this.user = this.route.paramMap.pipe(
      switchMap((params: ParamMap) =>
      this.userDataManager.getSingleUser(params.get('id')))
    )
  }

}
