import { Component } from '@angular/core';
import { NavController,ViewController, NavParams, AlertController } from 'ionic-angular';
import { SpkData } from '../../providers/spk-data';
import {Validators, FormBuilder, FormGroup } from '@angular/forms';
import * as moment from 'moment';
/**
 * Generated class for the BatalPanduComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'adjust-time',
  templateUrl: 'adjust-time.html',
  providers:[SpkData]
})
export class AdjustTimeComponent {
  workId;
  adjustTime : FormGroup


  constructor(
    private view:ViewController, 
    private params: NavParams,
    private _spkData: SpkData,
    private alertCtrl: AlertController,
    private formBuilder: FormBuilder
  ) {
    // this.workId = params.get('index');
    this.workId = JSON.parse( localStorage.getItem('v_worker2')) ;
    console.log(this.workId);
  }

  onCancel(ev:any){
    
  }

  dismiss(form){
    let dataTahapan = [];
    let v: string;
    for(let tahapan of this.workId){
      tahapan.value = form.value[tahapan.id];
      // console.log("data parsing", this.rmZone(v), moment(v).format());
      dataTahapan.push(tahapan)
    }
    console.log("To localDB", dataTahapan);
    v = JSON.stringify(dataTahapan);
    localStorage.setItem('v_worker2',this.rmZone(v));
    this.view.dismiss(true)
  }

  rmZone(str){
    return str.replace(/([Z+])/g, "");
  }

  cancel(){
    this.view.dismiss(false)
  }
}
