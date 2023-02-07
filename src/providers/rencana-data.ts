import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { AppConfig } from '../config/app.config';
/*
  Generated class for the RencanaData provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class RencanaData {
  private sufApi = "api/mobile";
  // private sufApi = "vasa-jboss-permohonan/mobile";
  private spkApiUrl = "";

  constructor(public http: Http,public appConfig: AppConfig) {
    console.log('Hello RencanaData Provider');
  }

  load(){
    return this.http.get(`${this.appConfig.apiBaseUrl}/${this.sufApi}/pmh_pandu/list_perencanaan?kodeCabang=`+localStorage.getItem("kodecabang"))
      .map(res => res.json());
  }

}
