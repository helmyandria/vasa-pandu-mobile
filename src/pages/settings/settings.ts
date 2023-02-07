import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { Pnetwork } from '../../providers/pnetwork';

/*
  Generated class for the Settings page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {
  mqtt_url:any;
  mqtt_port:any;
  constructor(public navCtrl: NavController, public pnetwork:Pnetwork) {}

  ionViewDidLoad() {
    console.log('Hello SettingsPage Page');

    this.pnetwork.listenNetworkEvents();
    this.getDefaults();
  }

  getDefaults(){
    if(localStorage.getItem('mqtt_url') != null){
      this.mqtt_url = localStorage.getItem('mqtt_url');
      this.mqtt_port = localStorage.getItem('mqtt_port');
    } else {
      this.mqtt_url = 'test.mosquitto.org';
      this.mqtt_port = '8080';
    }
  }

  setDefaults(){
    this.mqtt_url = localStorage.setItem('mqtt_url', this.mqtt_url)
    this.mqtt_port = localStorage.setItem('mqtt_port', this.mqtt_port)
  }

}
