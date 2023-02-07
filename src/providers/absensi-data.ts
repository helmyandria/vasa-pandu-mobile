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
export class AbsensiData {
  private sufApi = "api/public/absensi_pandu";
  // private sufApi = "vasa-jboss-perencanaanPandu/public/absensi_pandu";
  private spkApiUrl = "";

  constructor(public http: Http,public appConfig: AppConfig) {
    console.log('Hello AbsensiData Provider');
  }

  /**
     * load detail spk by id
     * 
     * @param nip 
     * @param tglMasuk
     */
    // Get Spk by providing spk id
  refreshAbsensi(nip:string,tglMasuk:string):Promise<any>{
    var headers = new Headers();

    return this.http.get(`${this.appConfig.apiBaseUrl}/${this.sufApi}/mobile_refresh_absensi_pandu?nip=${nip}&tglMasuk=${tglMasuk}`)
      .map(res => res.json())
      .toPromise();
  }

}
