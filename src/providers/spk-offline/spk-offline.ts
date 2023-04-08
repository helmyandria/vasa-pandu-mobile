import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Platform } from 'ionic-angular';
import 'rxjs/add/operator/map';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';


import { AppConfig } from '../../config/app.config';
import { Storage } from '@ionic/storage-angular'
import { Device } from '@ionic-native/device'
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';


import { SQLite } from '@ionic-native/sqlite';
import { SqliteServiceProvider } from '../sqlite-service/sqlite-service';

@Injectable()
export class SpkOfflineProvider {
  // private sufApi = "api/mobile";
  private sufApi = "vasa-jboss-perencanaanPandu/mobile";
  private spkApiUrl = "";
  private deviceId;
  private data = new BehaviorSubject([]);
  
  packageData: Subject<Array<string>> = new BehaviorSubject<Array<string>>([]);
  cast = this.packageData.asObservable();
  constructor(
    public http: Http,
    public appConfig: AppConfig,
    public storage: Storage,
    private device: Device,
    private platform: Platform,
    private sqlite: SQLite,
    private _sql: SqliteServiceProvider
  ) {
    console.log('Hello SpkOfflineProvider Provider');
    
  }

  /**
     * load realisasi by tglMulai & tglSelesai
     * 
     * @param tglMulai 
     * @param tglSelesai 
     */
    loadRealisasi(tglMulai:string,tglSelesai:string) {
      var headers = new Headers();
      var username = localStorage.getItem('username');
      
      console.log(`${this.appConfig.apiBaseUrl}/${this.sufApi}/progress_spk/username/${username}?tglMulai=${tglMulai}&tglSelesai=${tglSelesai}&jenisJasa=pandu&status=OHN`);
      return this.http.get(`${this.appConfig.apiBaseUrl}/${this.sufApi}/progress_spk/username/${username}?tglMulai=${tglMulai}&tglSelesai=${tglSelesai}&jenisJasa=pandu&status=OHN`, {headers:headers}) 
        .map(res => res.json())
        .subscribe(data => {
          this.packageData.next(data);
        })
    }

  /**
   * Offline data from sqlite
   * 
   */
  getMyOfflineData(tglMulai, tglSelesai){
    this._sql.getSpkOfflineData(tglMulai, tglSelesai).then((data: any)=>{
      /**
       * push to datas object
       * variable datas pada directive realisasi-pandu.html 
       * mengacu pada index array disini.
       */
      let datas = [];
      let v_offline = [];
      for(let i in data){
        // console.log(data);
        datas.push([
          { 'data' : JSON.parse(data[i]['vjson']) },
          { 'spk_id' : data[i]['spk_id'] },
          { 'status' : data[i]['status'] },
          { 'msg_state' : data[i]['msg_state'] }
        ]);
      }
      
      this.packageData.next(datas);
    });
  } 
}
