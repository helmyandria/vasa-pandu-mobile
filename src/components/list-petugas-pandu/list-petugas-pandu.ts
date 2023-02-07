import { Component } from '@angular/core';
import { NavController,ViewController, NavParams, AlertController } from 'ionic-angular';
/**
 * Generated class for the BatalPanduComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
    selector: 'list-petugas-pandu',
    templateUrl: 'list-petugas-pandu.html'
  })
export class ListPetugasPanduComponent {
  
  dataPetugas = [];

  constructor(
    private view:ViewController, 
    private params: NavParams,
    private alertCtrl: AlertController
  ) {
    this.dataPetugas = params.get('dataPetugas');
  }

  dismiss(){
    this.view.dismiss()
  }
}