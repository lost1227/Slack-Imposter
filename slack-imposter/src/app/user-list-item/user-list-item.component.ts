import { Component, OnInit, Input } from '@angular/core';
import { UserDataManager } from '../user-data-manager';

@Component({
  selector: 'app-user-list-item',
  templateUrl: './user-list-item.component.html',
  styleUrls: ['./user-list-item.component.css']
})
export class UserListItemComponent implements OnInit {

  @Input() user: UserDataManager.User

  displayName: String

  constructor() { }

  ngOnInit(): void {
    this.displayName = this.user.display_name
    if(!this.displayName) {
      this.displayName = this.user.real_name
    }
    if(!this.displayName) {
      this.displayName = this.user.name
    }
  }

}
