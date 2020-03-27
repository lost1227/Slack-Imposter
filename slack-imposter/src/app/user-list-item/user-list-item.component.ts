import { Component, OnInit, Input } from '@angular/core';
import { UserDataManager } from '../user-data-manager';

@Component({
  selector: 'app-user-list-item',
  templateUrl: './user-list-item.component.html',
  styleUrls: ['./user-list-item.component.css']
})
export class UserListItemComponent implements OnInit {

  @Input() user: UserDataManager.User

  constructor() { }

  ngOnInit(): void {
  }

}
