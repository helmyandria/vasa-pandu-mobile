import { Component } from '@angular/core';
import { NavParams,Platform, ToastController, Events, AlertController, LoadingController } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';

import { AppVersion} from 'ionic-native';

import { Packet } from 'mqtt';

import { LeafletView } from '../mapview/mapview';
import { AbsensiPage } from '../absensi/absensi';
import { RealisasiPanduPage } from '../realisasi-pandu/realisasi-pandu';
import { MonitoringPage } from '../monitoring/monitoring';

import { Notification } from '../../providers/notification';
import { AppConfig } from '../../config/app.config';
import { Cordova } from '@ionic-native/core';
import { Dialogs } from '@ionic-native/dialogs';

/*
  Generated class for the Tabs page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
declare var IonicCordova;
declare var ionicPro;

@Component({
  templateUrl: '../tabs/tabs.html'
})
export class TabsPage {
  // this tells the tabs component which Pages
  // should be each tab's root Page
  tab1Root = AbsensiPage;
  tab2Root = RealisasiPanduPage;
  tab3Root = LeafletView;

  badgeValue = 0;
  //tab3Root = MonitoringPage;
  
  mySelectedIndex: number;

  public count = 0;
  appId:string;
  channel:string;
  options: any = null;
  constructor(
    public navParams: NavParams, 
    public notification: Notification,
    public events : Events,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private platform: Platform,
    private toastCtrl : ToastController,
    private appConfig: AppConfig,
    private dialog: Dialogs
  ) {
    this.appId = '312eea82';
    if(this.appConfig.env == 'uat' || this.appConfig.env == 'dev'){
      /**
       * Env uat / development
       */
      this.channel = 'Master';
    }else if(this.appConfig.env == 'prod'){
      /**
       * Env Production
       */
      this.channel = 'Production';
    }
    
    this.mySelectedIndex = navParams.data.tabIndex || 0;

    this.events.subscribe("notif:mqttbadge",(badge)=>{
      this.badgeValue = badge[0];
    });
    
    if(this.platform.is('android') || this.platform.is('ios')){
      // this.updateApp()
    }

    /**
     * cek update setiap 30 menit
     */
    setTimeout(() => {
      // this.updateApp();
    }, 30 * 1000 * 60)
  }

  updateApp(){
    IonicCordova.deploy.init({channel: this.channel, appId: this.appId}, (res: any) => {
      console.log(res)
    }, (err: any) => {
      console.log(err);
    })
    
    IonicCordova.deploy.check(snapshotAvailable => {
      if(snapshotAvailable == 'true'){
        this.dialog.confirm(
          'Tersedia pembaharuan aplikasi, klik [OK] untuk memperbaharui.',
          'Pembaharuan Aplikasi',
          ['OK','Not Now']
        ).then(
          (data) => {
            console.log("from confirm data", data);
            if(data == 1){
              this.downloadUpdate();
            }
          })
      }
    })
  }
  
  showToast(loading, err = ""){
    let toast = this.toastCtrl.create({
        message: 'Error memperbaharui aplikasi '+err,
        duration: 5000,
        position: 'center'
      });
    toast.present();
    loading.dismiss();
  }


  private releaseBadge(){
    this.badgeValue = null;
  }

  onConnected(){
    console.log('Connected to broker');
  }

  downloadUpdate(){
    let loading = this.loadingCtrl.create({
      spinner: 'hide',
      content: `Mohon tunggu untuk pembaharuan aplikasi`
    });
    loading.present();

    IonicCordova.deploy.download(downloadStatus => {
      if (downloadStatus === 'true') {
        console.log("Download done", downloadStatus);
        IonicCordova.deploy.extract(extractStatus => {
          console.log("begin extract", downloadStatus);
          if (extractStatus === 'true' || extractStatus === 'done') {
                IonicCordova.deploy.redirect(); // reloads the app / webview
          } else {
            console.log("DEBUG extract", extractStatus);
            loading.setContent("Extracting:"+extractStatus+"%")
          }
        }, e => {
          console.log("DEBUG error", e);
        });
      } else {
        console.log("Progress:", downloadStatus);
        loading.setContent("Mohon tunggu untuk pembaharuan aplikasi: "+downloadStatus+"%")
      }
    }, e => {
      console.log("DEBUG error download", e);
      this.showToast(loading,e)
    })
  }
  
}
