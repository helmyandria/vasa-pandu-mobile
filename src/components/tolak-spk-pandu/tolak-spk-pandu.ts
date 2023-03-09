import { Component } from '@angular/core';
import { NavController,ViewController, NavParams, AlertController } from 'ionic-angular';

import { Storage } from '@ionic/storage-angular';

import { SpkData } from '../../providers/spk-data';

/**
 * Generated class for the BatalPanduComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
    selector: 'tolak-spk-pandu',
    templateUrl: 'tolak-spk-pandu.html',
    providers : [SpkData]
  })
export class TolakSpkPanduComponent {

  private data : any;
  private alasan : any;
  public profile: any = [];

  constructor(
    private view:ViewController, 
    private params: NavParams,
    private alertCtrl: AlertController,
    public storage: Storage,
    public spkData: SpkData
  ) {
    this.data = params.get('toDetail'); 
    // this.storage.ready().then(() => {
      this.storage.get('profile').then((data)=>{
        this.profile = data;
        console.log("profile. ", this.profile);
      })
    // })
  }

  postPembatalanSpkPandu() {
    console.log("data. ", this.data);
    let data_format = {
      "alasan": this.alasan,
      "nipPandu": this.profile.nipPandu,
      "nomorSpk": this.data.nomorSpk,
      "nomorSpkPandu": this.data.nomorSpkPandu
    }

    console.log("data format. ",data_format);

    /**
     * kirim pembatalan spk pandu
     * menggunakan HTTP
     */
    this.spkData.postLogPembatalanSpkPandu(data_format);
  }

  putTolakSpkPandu() {
    console.log("noPpkJasa. ",this.data.noPpkJasaPandu);
    console.log("put tolak spk.")
    this.spkData.putTolakSpk(this.data.noPpkJasaPandu).subscribe(
      resp => {
        console.log("Tolak SPK done", resp);
      }
    );
  }

  cancel(){
    console.log("pop up isi terima spk pandu ");
    this.view.dismiss(true)
  }

  ok(){
    console.log("pop up isi tolak spk pandu ");
    this.postPembatalanSpkPandu();
    this.putTolakSpkPandu();
    this.view.dismiss(false)
  }

}