import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { HttpClientModule } from '@angular/common/http';

import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { UserListComponent } from './user-list/user-list.component';
import { UserListItemComponent } from './user-list-item/user-list-item.component';
import { MessengerComponent } from './messenger/messenger.component';
import { NotFoundComponent } from './not-found/not-found.component';

import { ReactiveFormsModule } from '@angular/forms'

const appRoutes : Routes = [
  {
    path: 'user/:id',
    component: MessengerComponent
  }, {
    path: 'users',
    component: UserListComponent,
    data: { title: 'Users List'}
  }, {
    path: '',
    redirectTo: '/users',
    pathMatch: 'full'
  }, {
    path: '**',
    component: NotFoundComponent
  }
]

@NgModule({
  declarations: [
    AppComponent,
    UserListComponent,
    UserListItemComponent,
    MessengerComponent,
    NotFoundComponent
  ],
  imports: [
    RouterModule.forRoot(
      appRoutes,
      {enableTracing: false}
    ),
    ReactiveFormsModule,
    BrowserModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
