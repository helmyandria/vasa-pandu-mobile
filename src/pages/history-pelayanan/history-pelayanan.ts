import { Component } from '@angular/core';
import { Events, NavController, LoadingController, AlertController, ToastController } from 'ionic-angular';
import { Storage } from '@ionic/storage'

import * as moment from 'moment';

import { DetailHistoryPelayananPage} from '../detail-history-pelayanan/detail-history-pelayanan';

import { SpkData } from '../../providers/spk-data';
import { Pnetwork } from '../../providers/pnetwork';

/*
  Generated class for the HistoryPelayanan page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-history-pelayanan',
  templateUrl: 'history-pelayanan.html',
  providers: [SpkData]
})
export class HistoryPelayananPage {
  public datas = [];
  public loader;
  public tglAwal : string;
  public tglAkhir : string;

  constructor(
    public navCtrl: NavController, 
    public loadingCtrl: LoadingController, 
    public pnetwork: Pnetwork,
    public storage: Storage,
    public events: Events,
    public alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private spkData: SpkData
  ) {
    this.loader = this.loadingCtrl.create({
      content: "Please wait...",
      duration: 5000
    });    

    let now = moment().format('YYYY-MM-DD');
    this.tglAwal = now;
    this.tglAkhir = now;
  }

  openDetail(){
    this.loadData(this.tglAwal, this.tglAkhir);
  }

  loadData(tglMulai, tglSelesai){
    this.loader.present()
    this.spkData.loadHistoryRealisasi(tglMulai, tglSelesai).subscribe( data => {
      this.datas = data;
      console.log(this.datas);
      this.loader.dismiss()
      this.navCtrl.push(DetailHistoryPelayananPage, {datas:this.datas})
    },
    err => {
      console.log("error load data spk");
      this.loader.dismiss()
      this.events.publish('refresh:state', false);
    },
    () => {
      console.log("success load data spk");
      this.events.publish('refresh:state', true);
    });
  }

}
