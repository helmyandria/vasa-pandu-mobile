import { Component } from '@angular/core';
import { NavController, NavParams,LoadingController } from 'ionic-angular';

import { Storage } from '@ionic/storage-angular';

import * as moment from 'moment';

import { SpkData } from '../../providers/spk-data';
import { SqliteServiceProvider } from '../../providers/sqlite-service/sqlite-service';
/*
  Generated class for the HistoryRealisasi page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-history-realisasi',
  templateUrl: 'history-realisasi.html',
  providers: [SpkData]
})
export class HistoryRealisasiPage {
  private datas=[];
  public databyId:any;
  public noSpk: string;
  public loader;
  public profile: any=[];
  public wizardStep;
  public timeDiff:string="";
  public htmlText: string = "";
  public detail:boolean = true;

  public generate_wizard = [
    [
      { id:"pemanduan_start",   map:"jamNaik",            tahapPandu:1,     title: "Pandu Naik", status:false, value: "00:00:00"},
      { id:"kapal_bergerak",    map:"jamKapalGerak",      tahapPandu:2,     title: "Kapal Bergerak", status: false, value: "00:00:00" },
      { id:"ikat_tali_tunda",   map:"tglMulaiTunda",      tahapPandu:4,     title: "Ikat Tali Tunda", status: false, value: "00:00:00" },
      { id:"ikat_tali_kapal",   map:"tglMulaiTambat",     tahapPandu:6,     title: "Ikat Tali Kapal", status: false, value: "00:00:00" },
      { id:"lepas_tali_tunda",  map:"tglSelesaiTunda",    tahapPandu:5,     title: "Lepas Tali Tunda", status: false, value: "00:00:00" },
      { id:"isi_pin",           map:"",                                     title: "Isi Pin ", status: false, value: "00:00:00" },
      { id:"selesai_pandu",     map:"tglSelesaiPandu",    tahapPandu:3,     title: "Selesai Pandu", status: false, value: "00:00:00" },
      { id:"keluar",status: false,                        title: "Keluar" }
    ],
    [
      { id:"pemanduan_start",   map:"jamNaik",            tahapPandu:1,     title: "Pandu Naik", status:false, value: "00:00:00", },
      { id:"ikat_tali_tunda",   map:"tglMulaiTunda",      tahapPandu:4,     title: "Ikat Tali Tunda", status: false, value: "00:00:00" },
      { id:"lepas_tali_kapal",  map:"tglSelesaiTambat",   tahapPandu:7,     title: "Lepas Tali Kapal", status: false, value: "00:00:00" },
      { id:"kapal_bergerak",    map:"jamKapalGerak",      tahapPandu:2,     title: "Kapal Bergerak", status: false, value: "00:00:00" },
      { id:"lepas_tali_tunda",  map:"tglSelesaiTunda",    tahapPandu:5,     title: "Lepas Tali Tunda", status: false, value: "00:00:00" },
      { id:"isi_pin",           map:"",                                     title: "Isi Pin ", status: false, value: "00:00:00" },
      { id:"selesai_pandu",     map:"tglSelesaiPandu",    tahapPandu:3,     title: "Selesai Pandu", status: false, value: "00:00:00" },
      { id:"keluar", status: false,                                         title: "Keluar" }
    ],
    [
      { id:"pemanduan_start",   map:"jamNaik",            tahapPandu:1,     title: "Pandu Naik", status:false, value: "00:00:00", },
      { id:"kapal_bergerak",    map:"jamKapalGerak",      tahapPandu:2,     title: "Kapal Bergerak", status: false, value: "00:00:00" },
      { id:"isi_pin",           map:"",                                     title: "Isi Pin ", status: false, value: "00:00:00" },
      { id:"selesai_pandu",     map:"tglSelesaiPandu",    tahapPandu:3,     title: "Selesai Pandu", status: false, value: "00:00:00" },
      { id:"keluar", status: false,                                         title: "Keluar" }
    ],
    [
      { id:"pemanduan_start",   map:"jamNaik",            tahapPandu:1,     title: "Pandu Naik", status:false, value: "00:00:00", },
      { id:"ikat_tali_tunda",   map:"tglMulaiTunda",      tahapPandu:4,     title: "Ikat Tali Tunda", status: false, value: "00:00:00" },
      { id:"lepas_tali_kapal",  map:"tglSelesaiTambat",   tahapPandu:7,     title: "Lepas Tali Kapal", status: false, value: "00:00:00" },
      { id:"kapal_bergerak",    map:"jamKapalGerak",      tahapPandu:2,     title: "Kapal Bergerak", status: false, value: "00:00:00" },
      { id:"ikat_tali_kapal",   map:"tglMulaiTambat",     tahapPandu:6,     title: "Ikat Tali Kapal", status: false, value: "00:00:00" },
      { id:"lepas_tali_tunda",  map:"tglSelesaiTunda",    tahapPandu:5,     title: "Lepas Tali Tunda", status: false, value: "00:00:00" },
      { id:"isi_pin",           map:"",                                     title: "Isi Pin ", status: false, value: "00:00:00" },
      { id:"selesai_pandu",     map:"tglSelesaiPandu",    tahapPandu:3,     title: "Selesai Pandu", status: false, value: "00:00:00" },
      { id:"keluar", status: false,                                         title: "Keluar" }
    ],
    [
      { id:"pemanduan_start",   map:"jamNaik",            tahapPandu:1,     title: "Pandu Naik", status:false, value: "00:00:00" },
      { id:"ikat_tali_tunda",   map:"tglMulaiTunda",      tahapPandu:4,     title: "Ikat Tali Tunda", status: false, value: "00:00:00" },
      { id:"lepas_tali_kapal",  map:"tglSelesaiTambat",   tahapPandu:7,     title: "Lepas Tali Kapal", status: false, value: "00:00:00" },
      { id:"lepas_tali_tunda",  map:"tglSelesaiTunda",    tahapPandu:5,     title: "Lepas Tali Tunda", status: false, value: "00:00:00" },
      { id:"kapal_bergerak",    map:"jamKapalGerak",      tahapPandu:2,     title: "Kapal Bergerak", status: false, value: "00:00:00" },
      { id:"ikat_tali_tunda2",                                              title: "Ikat Tali Tunda", status: false, value: "00:00:00" },
      { id:"ikat_tali_kapal",   map:"tglMulaiTambat",     tahapPandu:6,     title: "Ikat Tali Kapal", status: false, value: "00:00:00" },
      { id:"lepas_tali_tunda2",                                             title: "Lepas Tali Tunda", status: false, value: "00:00:00" },
      { id:"isi_pin",           map:"",                                     title: "Isi Pin ", status: false, value: "00:00:00" },
      { id:"selesai_pandu",     map:"tglSelesaiPandu",    tahapPandu:3,     title: "Selesai Pandu", status: false, value: "00:00:00" },
      { id:"keluar", status: false,                                         title: "Keluar" }
    ]

  ]

  constructor(
    public navCtrl: NavController,
    public spkData: SpkData,
    public navParam: NavParams,
    public loadingCtrl: LoadingController, 
    public storage: Storage,
    private _sql: SqliteServiceProvider
    ) {
      this.loader = this.loadingCtrl.create({
        content: "Please wait...",
        duration: 5000
      }); 
      
      
    }

  ionViewDidLoad() {
    console.log('Hello HistoryRealisasiPage Page');
    this.noSpk = this.navParam.get('noSpk');
    this.detail = this.navParam.get('detail');
    console.log('load data history')
    this.loadDataHistory(this.noSpk, this.navParam.get('spkId') );
  }

  public loadDataHistory(noSpk, spkId){
    console.log("load no spk", noSpk, spkId);
    this.loader.present();

    if(spkId !== undefined){
      this._sql.getRealisasiOffline(spkId).then( dataRea => {
        let progress = JSON.parse(dataRea['progress']);
        this.databyId = JSON.parse(dataRea['vjson']);
        this.datas = this.databyId;
        
        console.log("offline data rea",this.databyId);
        this.generateStep(Number(this.databyId['jenisDermaga'])-1);

        progress['progressPemanduan'].forEach((data,i) =>{
          this.statusTemplate(data['title'], data['tglTahapan']);
          if(i < progress['progressPemanduan'].length){
            
            if((i+1) !== progress['progressPemanduan'].length){
              this.diffProgress(data['tglTahapan'],progress['progressPemanduan'][i+1]['tglTahapan'])
            }
          }
          this.storage.get('profile').then((data)=>{
            this.profile = data;
          })
        })
      },(err) => {
        this.onlineHistory(noSpk)
      }).catch(err => {
        this.onlineHistory(noSpk);
      })
    }else{
      this.onlineHistory(noSpk)
    }
  }

  onlineHistory(noSpk){
    this.spkData.loadHistorySpk(noSpk).subscribe(data => {
      this.datas = [];
      this.datas = data;
      
      this.spkData.loadDetails(this.datas['id']).then(data =>{
        this.databyId = data;
        this.generateStep(Number(this.databyId['jenisDermaga'])-1);

        this.datas['listProgress'].forEach((data,i) =>{
          this.statusTemplate(data['tahapanPandu'], data['tglTahapan']);
          
          if(i <= this.datas['listProgress'].length)
            this.diffProgress(data['tglTahapan'],this.datas['listProgress'][i+1]['tglTahapan'])
          
            this.storage.get('profile').then((data)=>{
            this.profile = data;
          })
        })
      })
    },
    err => {
      console.log("error load data spk");
    },
    () => {
      console.log("success load data spk");
    })
  }

  public statusTemplate(title: string, value: any) {
      this.htmlText = this.htmlText +
        `
          <div class="ps_stat_left">
            ` + title +
            `
          </div>
          <div class="ps_stat_right">
            ` + moment(value).format('HH:mm:ss') +
            `
          </div>
      `;
  }

  public diffProgress(start, end){
    console.debug('DEBUG', start, end)
    if(end > start){
      var ms = moment(end,"HH:mm:ss").diff(moment(start,"HH:mm:ss"));
      var d = moment.duration(ms);
      var s = Math.floor(d.asHours()) + moment.utc(ms).format(":mm:ss");
      //console.log("from diff", this.timeDiff)
    
      if(this.timeDiff != 'undefined')
        this.timeDiff += `<li><div>`+ s +`</div></li>`;
    }
      

  }

  public generateStep(id){ console.log("wizard used", id)
    let vData = [];
    this.generate_wizard[id].forEach( ret => {
      if(ret.id != 'isi_pin' && ret.id != 'keluar')
        vData.push(ret);
    })

    this.wizardStep = '<ol class="list-inline text-center step-indicator">';
    for(let i in vData){
        this.wizardStep += 
          ` <li class="i`+vData[i].id+` active">
              <div class="step">`+ (Number(i) + 1) +`</div>
              <div class="caption hidden-xs hidden-sm">
              `+vData[i].title+`</div>
            </li>
        `;
      
    }
    this.wizardStep +='</ol>';
  }

}
