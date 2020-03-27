import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { UserDataManager } from '../UserDataManager.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: Observable<Array<UserDataManager.User>>

  constructor(private userDataManager: UserDataManager) { }

  ngOnInit(): void {
    this.users = this.userDataManager.getAllUsers()
  }

}
