import { Component, OnInit, Input } from '@angular/core';
import { Messenger } from '../messenger.service';

@Component({
  selector: 'app-user-list-item',
  templateUrl: './user-list-item.component.html',
  styleUrls: ['./user-list-item.component.css']
})
export class UserListItemComponent implements OnInit {

  @Input() user: Messenger.User

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
