import { Component } from '@angular/core';
import { Events, NavController, LoadingController, AlertController, ToastController } from 'ionic-angular';
import { Storage } from '@ionic/storage-angular'

import { Pnetwork } from '../../providers/pnetwork';
import { RencanaData } from '../../providers/rencana-data';

/*
  Generated class for the Perencanaan page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-perencanaan',
  templateUrl: 'perencanaan.html',
  providers:[RencanaData]
})
export class PerencanaanPage {
  datas = [];
  public loader;

  constructor(
    public navCtrl: NavController,
    public loadingCtrl: LoadingController, 
    public pnetwork: Pnetwork,
    public rencanaData: RencanaData,
    public events: Events,
    public alertCtrl: AlertController,
    private toastCtrl: ToastController,
    public storage: Storage,
  ) {}

  ionViewDidLoad() {
    console.log('Hello PerencanaanPage Page');
    this.pnetwork.listenNetworkEvents()
    this.firstLoad();
  }

  firstLoad(){
    this.rencanaData.load().subscribe( data => {
      this.datas = data;
      console.log(this.datas);
    },
    err => {
      console.log("error load data spk");
      this.events.publish('refresh:state', false);
    },
    () => {
      console.log("success load data spk");
      this.events.publish('refresh:state', true);
    });
  }

  doRefresh(refresher){
   
    this.firstLoad()
    this.events.subscribe('refresh:state', (refstate) => {

      if(refstate == true)
        refresher.complete();
      else{
        
        this.toastCtrl.create({
          message: 'Error load data..',
          duration: 3000,
          position: 'bottom'
        }).present().then( (ev) => {
          console.log(ev);
           refresher.complete();
          return false;
        })

       
      }
    })
    //refresher.preventDefault();
    //refresher.stopPropagation();
  }
}
