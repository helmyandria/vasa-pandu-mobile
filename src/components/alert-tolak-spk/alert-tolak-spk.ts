import { Component } from '@angular/core';
import { NavController,ViewController, NavParams, AlertController, ModalController } from 'ionic-angular';

import { Storage } from '@ionic/storage-angular';

import * as moment from 'moment';

import { SpkData } from '../../providers/spk-data';
import { TolakSpkPanduComponent } from '../../components/tolak-spk-pandu/tolak-spk-pandu';

/**
 * Generated class for the BatalPanduComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
    selector: 'alert-tolak-spk',
    templateUrl: 'alert-tolak-spk.html',
    providers : [SpkData]
  })
export class AlertTolakSpkComponent {

  private data : any;
  public profile: any = [];
  public namaKapal: string;
  public tanggal: string;
  public noPpk1: string;
  public nomorSpk: string;
  public asal : string;
  public tujuan : string;

  constructor(
    private view:ViewController, 
    private params: NavParams,
    private alertCtrl: AlertController,
    public storage: Storage,
    public spkData: SpkData,
    public modal: ModalController
  ) {
    this.data = params.get('toDetail'); 
    console.log("toDetail: ", this.data);
    this.namaKapal = this.data.namaKapal;
    this.noPpk1 = this.data.noPpk1;
    this.nomorSpk = this.data.nomorSpkPandu;
    this.asal = this.data.namaLokasiPanduAsal;
    this.tujuan = this.data.namaLokasiPanduTujuan;
    this.tanggal = moment(this.data.jamPenetapanPandu).format('DD/MM/YYYY HH:mm');
    // this.storage.ready().then(() => {
      this.storage.get('profile').then((data)=>{
        this.profile = data;
        console.log("profile. ", this.profile);
      })
    // })
  }

  tolak(){
    console.log("alert tolak spk pandu ");
    let modalTolakSpkPandu = this.modal.create(TolakSpkPanduComponent,
        {toDetail:this.data},
        {
          showBackdrop:true,
          enableBackdropDismiss: false
        }
    )
    modalTolakSpkPandu.onDidDismiss(data => {

        if (data == false) { //tolak spk - ok
          console.log("pop up tolak spk pandu ", false);
          this.view.dismiss(false)

        } else if (data == true) { //terima spk - cancel
          console.log("pop up terima spk pandu ", true);
          // this.view.dismiss(true)
        }

    });

    modalTolakSpkPandu.present();
  }

  terima(){
    console.log("alert terima spk pandu ");
    this.view.dismiss(true)
  }

}