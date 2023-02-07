import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { HistoryRealisasiPage } from '../history-realisasi/history-realisasi';

/*
  Generated class for the DetailHistoryPelayanan page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-detail-history-pelayanan',
  templateUrl: 'detail-history-pelayanan.html'
})
export class DetailHistoryPelayananPage {
  datas = [];

  constructor(
    public navCtrl: NavController,
    public params: NavParams
  ) {}

  ionViewDidLoad() {
    console.log('Hello DetailHistoryPelayananPage Page');

    this.datas = this.params.get('datas');
  }

  openHistoryDetail(noSpk){
    this.navCtrl.push(HistoryRealisasiPage,{noSpk:noSpk,detail:true})
  }

}
