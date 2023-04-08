import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController,Events } from 'ionic-angular';
import { Storage } from '@ionic/storage-angular'
import * as Leaflet from "leaflet";

import { PemanduanPage } from '../pemanduan/pemanduan';
import { HistoryRealisasiPage } from '../history-realisasi/history-realisasi';


import { SpkData } from '../../providers/spk-data';
import { Pnetwork } from '../../providers/pnetwork';
import { Geojson } from '../../providers/geojson';
import { LocationTracker } from '../../providers/location-tracker';
import { SqliteServiceProvider } from '../../providers/sqlite-service/sqlite-service';
/*
  Generated class for the DetailSpk page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-detail-spk',
  templateUrl: 'detail-spk.html',
  providers:[SpkData, Geojson]
})
export class DetailSpkPage {
  
  private data :any;
  private datas = [];
  id : any;
  private startProgress:string;
  private _map: any;
  private _marker: any;
  private _defLoc: any;
  public wizardOption;
  public wizardStep: string = null;
  public loader : any;
  public tundas = {};
  public status = 1;
  public msg_state = "P";
  public generate_wizard = [
    [
      { id:"pemanduan_start",   map:"jamNaik",            title: "Pandu Naik", status:false, value: "00:00:00"},
      { id:"kapal_bergerak",    map:"jamKapalGerak",      title: "Kapal Bergerak", status: false, value: "00:00:00" },
      { id:"ikat_tali_tunda",   map:"tglMulaiTunda",      title: "Ikat Tali Tunda", status: false, value: "00:00:00" },
      { id:"ikat_tali_kapal",   map:"tglMulaiTambat",     title: "Ikat Tali Kapal", status: false, value: "00:00:00" },
      { id:"lepas_tali_tunda",  map:"tglSelesaiTunda",    title: "Lepas Tali Tunda", status: false, value: "00:00:00" },
      { id:"isi_pin",           map:"",                   title: "Isi Pin ", status: false, value: "00:00:00" },
      { id:"selesai_pandu",     map:"tglSelesaiPandu",    title: "Selesai Pandu", status: false, value: "00:00:00" },
      { id:"keluar",status: false,                        title: "Keluar" }
    ],
    [
      { id:"pemanduan_start",   map:"jamNaik",            title: "Pandu Naik", status:false, value: "00:00:00", },
      { id:"ikat_tali_tunda",   map:"tglMulaiTunda",      title: "Ikat Tali Tunda", status: false, value: "00:00:00" },
      { id:"lepas_tali_kapal",  map:"tglSelesaiTambat",   title: "Lepas Tali Kapal", status: false, value: "00:00:00" },
      { id:"kapal_bergerak",    map:"jamKapalGerak",      title: "Kapal Bergerak", status: false, value: "00:00:00" },
      { id:"lepas_tali_tunda",  map:"tglSelesaiTunda",    title: "Lepas Tali Tunda", status: false, value: "00:00:00" },
      { id:"isi_pin",           map:"",                   title: "Isi Pin ", status: false, value: "00:00:00" },
      { id:"selesai_pandu",     map:"tglSelesaiPandu",    title: "Selesai Pandu", status: false, value: "00:00:00" },
      { id:"keluar", status: false,                       title: "Keluar" }
    ],
    [
      { id:"pemanduan_start",   map:"jamNaik",            title: "Pandu Naik", status:false, value: "00:00:00", },
      { id:"kapal_bergerak",    map:"jamKapalGerak",      title: "Kapal Bergerak", status: false, value: "00:00:00" },
      { id:"isi_pin",           map:"",                   title: "Isi Pin ", status: false, value: "00:00:00" },
      { id:"selesai_pandu",     map:"tglSelesaiPandu",    title: "Selesai Pandu", status: false, value: "00:00:00" },
      { id:"keluar", status: false,                       title: "Keluar" }
    ],
    [
      { id:"pemanduan_start",   map:"jamNaik",            title: "Pandu Naik", status:false, value: "00:00:00", },
      { id:"ikat_tali_tunda",   map:"tglMulaiTunda",      title: "Ikat Tali Tunda", status: false, value: "00:00:00" },
      { id:"lepas_tali_kapal",  map:"tglSelesaiTambat",   title: "Lepas Tali Kapal", status: false, value: "00:00:00" },
      { id:"kapal_bergerak",    map:"jamKapalGerak",      title: "Kapal Bergerak", status: false, value: "00:00:00" },
      { id:"ikat_tali_kapal",   map:"tglMulaiTambat",     title: "Ikat Tali Kapal", status: false, value: "00:00:00" },
      { id:"lepas_tali_tunda",  map:"tglSelesaiTunda",    title: "Lepas Tali Tunda", status: false, value: "00:00:00" },
      { id:"isi_pin",           map:"",                   title: "Isi Pin ", status: false, value: "00:00:00" },
      { id:"selesai_pandu",     map:"tglSelesaiPandu",    title: "Selesai Pandu", status: false, value: "00:00:00" },
      { id:"keluar", status: false,                       title: "Keluar" }
    ],
    [
      { id:"pemanduan_start",   map:"jamNaik",            title: "Pandu Naik", status:false, value: "00:00:00" },
      { id:"ikat_tali_tunda",   map:"tglMulaiTunda",      title: "Ikat Tali Tunda", status: false, value: "00:00:00" },
      { id:"lepas_tali_kapal",  map:"tglSelesaiTambat",   title: "Lepas Tali Kapal", status: false, value: "00:00:00" },
      { id:"lepas_tali_tunda",  map:"tglSelesaiTunda",    title: "Lepas Tali Tunda", status: false, value: "00:00:00" },
      { id:"kapal_bergerak",    map:"jamKapalGerak",      title: "Kapal Bergerak", status: false, value: "00:00:00" },
      { id:"ikat_tali_tunda2",                            title: "Ikat Tali Tunda", status: false, value: "00:00:00" },
      { id:"ikat_tali_kapal",   map:"tglMulaiTambat",     title: "Ikat Tali Kapal", status: false, value: "00:00:00" },
      { id:"lepas_tali_tunda2",                           title: "Lepas Tali Tunda", status: false, value: "00:00:00" },
      { id:"isi_pin",           map:"",                   title: "Isi Pin ", status: false, value: "00:00:00" },
      { id:"selesai_pandu",     map:"tglSelesaiPandu",    title: "Selesai Pandu", status: false, value: "00:00:00" },
      { id:"keluar", status: false,                       title: "Keluar" }
    ]

  ]
  constructor(
      public navCtrl: NavController, 
      public params: NavParams,
      public spkData: SpkData,
      public storage: Storage,
      public alertCtrl: AlertController,
      public pnetwork: Pnetwork,
      public geojson: Geojson,
      public locationTracker: LocationTracker,
      public loading: LoadingController,
      public _sql: SqliteServiceProvider,
      public _spk: SpkData,
      public events: Events
  ) {
    
    this.datas = JSON.parse(params.get('datas')); 
    this.tundas = params.get('tundas');
    this.status= params.get('status');
    this.msg_state= params.get('msg_state');
    this.generateStep(this.datas['jenisDermaga']-1);

    if(this.status == 1)
      this.startProgress = "MULAI KERJAKAN";
    else 
      this.startProgress = "LIHAT HISTORI REALISASI"
    console.log("data tundas",this.tundas);
}

  ionViewDidLoad() {
    console.log('Hello DetailSpkPage Page');
  }

  ionVieWillEnter(){
    // this.presentLoadingDefault()
  }

  ionViewDidEnter(){
    // this.loader.dismiss();
  }

  presentLoadingDefault() {
    this.loader = this.loading.create({
      content: 'Please wait...'
    });

    this.loader.present();
  }

  pemanduan(){
    this.storage.get('panduid').then( panduid => {
      console.log(panduid);
      if(panduid == null){
        this.navCtrl.push(PemanduanPage, { data: this.datas});
      }else{
        console.log("cek working",panduid,this.datas['id']);
        if(panduid == this.datas['id']){
          this.navCtrl.push(PemanduanPage, { data: this.datas});
        }else{
          let confirm = this.alertCtrl.create({
            title: 'Pemanduan Error !!',
            message: 'Anda memiliki pekerjaan yang belum terselesaikan, mohon selesaikan pemanduan sebelumnya !',
            buttons: [{
              text: 'OK',
              handler: () => {
                
              },
            }],
          });
          confirm.present();
        }
      }
    })    
  }

  mulaiPandu(){
    if(this.datas['status'] == 'SPK'){
      let confirm = this.alertCtrl.create({
            title: 'Pemanduan Error !!',
            message: 'Maaf belum bisa dilakukan pekerjaan dikarenakan Status belum OHN',
            buttons: [{
              text: 'OK',
              handler: () => {
                
              },
            }],
          });
          confirm.present();
    }else if('OHN'){
      if(this.status == 2){
        this.navCtrl.push(HistoryRealisasiPage, 
          {
            noSpk:this.datas['nomorSpkPandu'], 
            detail:false,
            spkId:this.datas['id']
          }
        )
      }else{    
        let self = this;
        
        this.storage.get('panduid').then( panduid => {
          console.log(panduid);
          self.navCtrl.push(PemanduanPage, { datas: self.datas, tundas: this.tundas});

          /**
           * dicoment dulu karena bikin pandu marah :D
           * alasan karena pandu tidak menyelesaikan SPK sampai akhir
           * akhirnya terblok
           */
          // if(panduid == null){
          //   self.navCtrl.push(PemanduanPage, { datas: self.datas});
          //   console.log("panduid null",self.datas);
          // }else{
          //   console.log("cek working",panduid,self.datas['id']);
          //   if(panduid == self.datas['id']){
          //     console.log("cek working",panduid,self.datas['id']);
          //     // self.navCtrl.push(PemanduanPage, { data: self.datas, wizard:self.wizardOption});
          //     self.navCtrl.push(PemanduanPage, { datas: self.datas, wizard:self.wizardOption});
          //   }else{
          //     let confirm = self.alertCtrl.create({
          //       title: 'Pemanduan Error !!',
          //       message: 'Anda memiliki pekerjaan yang belum terselesaikan, mohon selesaikan pemanduan sebelumnya !',
          //       buttons: [{
          //         text: 'OK',
          //         handler: () => {
                    
          //         },
          //       }],
          //     });
          //     confirm.present();
          //   }
          // }
        })
      }
    }
  }

  
  generateStep(id){
    console.log("Generate Step by id", id);
    let vData = [];
    this.generate_wizard[id].forEach( ret => {
      if(ret.id != 'isi_pin' && ret.id != 'keluar')
        vData.push(ret);
    })

    this.wizardStep = '<ol class="list-inline text-center step-indicator">';
    for(let i in vData){
        this.wizardStep += 
          ` <li class="`+vData[i].id+` active">
              <div class="step">`+ (Number(i) + 1) +`</div>
              <div class="caption hidden-xs hidden-sm">
              `+vData[i].title+`</div>
            </li>
        `;
      
    }
    this.wizardStep +='</ol>';

  }

  runPendingState(){
    console.log("Calling DataPending");
    this._sql.getRealisasiPending().then((data: any) => {
      console.log("DataPending",data);
      for(let i in data){
        console.log("DEBUG: Run Data Pending from detail", i);
        let flow = JSON.parse(data[i].vjson);
        this._spk.realisasiPandu(flow.jenisDermaga, JSON.parse(data[i].vjson));
        this._spk.postProgressBulk(JSON.parse(data[i].progress))
        this._spk.putProgressDone(data[i].spk_id).subscribe(
          resp => {
            console.log("DEBUG: Progress done", resp);
            if(resp.status == 200){
              this._sql.updateRealisasiLog(data[i].spk_id);
              this.events.publish('refresh:data', true);
            }
          }
        )
      }
    })
}

}
