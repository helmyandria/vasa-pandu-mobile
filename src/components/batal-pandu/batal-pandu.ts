import { Component } from '@angular/core';
import { NavController,ViewController, NavParams, AlertController } from 'ionic-angular';

import { SpkData } from '../../providers/spk-data';
import { SqliteServiceProvider } from '../../providers/sqlite-service/sqlite-service';
/**
 * Generated class for the BatalPanduComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'batal-pandu',
  templateUrl: 'batal-pandu.html',
  providers:[SpkData, SqliteServiceProvider]
})
export class BatalPanduComponent {

  text: string;
  items: any=[];
  namaDermaga: string;
  kodeDermaga:string;
  kendalaOperasional:string;
  workId;
  cabang;

  constructor(
    private view:ViewController, 
    private params: NavParams,
    private _spkData: SpkData,
    private sqlService: SqliteServiceProvider,
    private alertCtrl: AlertController
  ) {
    this.workId = params.get('index');
    this.cabang = localStorage.getItem('kodeterminal');
  }

  searchDermaga(namaDermaga) {
    console.log("Nama Dermaga", namaDermaga);
    // this._spkData.searchMdmDermaga(namaDermaga).subscribe( data => {
    //   this.items = data;
    //   console.log("Data dermaga tujuan pandu: ",data);
    // })

    this.sqlService.getDermagaOffline(namaDermaga,this.cabang).then(data =>{
      this.items = data;
      console.log("Data dermaga tujuan pandu: ",JSON.stringify(data) );
    })
  }

  getItem(item){
    console.log("item index","item",item);
    this.kodeDermaga = item.mdmgKode;
    this.namaDermaga = item.mdmgNama;

    this.items = [];
  }

  onCancel(ev:any){
    console.log("on cancel");
    this.items = [];
  }

  dismiss(){
    if(this.kodeDermaga === undefined || this.kendalaOperasional === undefined){
      let Alert = this.alertCtrl.create({
        title: 'Error..!!',
        subTitle: 'Mohon isi lokasi pandu tujuan dan alasan kendala operasional.."',
        buttons: ['OK']
      }).present();
    }else{
      let data = { 
        kodeDermaga : this.kodeDermaga,
        namaDermaga : this.namaDermaga,
        kendalaOperasional: this.kendalaOperasional,
        index: this.workId
      };
      this.view.dismiss(data); 
    }
  }
  cancel(){
    this.view.dismiss()
  }
}
