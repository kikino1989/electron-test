import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { SQLite3Service } from './slqlite3Service/sqlite3.service';

@NgModule({
  declarations: [AppComponent],
  imports: [CommonModule, BrowserModule, IonicModule.forRoot(), ReactiveFormsModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, SQLite3Service],
  bootstrap: [AppComponent],
})
export class AppModule { }
