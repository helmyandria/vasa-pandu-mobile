import { Component, Input } from '@angular/core';
import { Network } from '@ionic-native/network';
import { Platform } from 'ionic-angular';

/**
 * Generated class for the NetworkStateComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */

declare var Connection;

@Component({
  selector: 'network-state',
  templateUrl: 'network-state.html'
})
export class NetworkStateComponent {

  @Input('state') netstate;
  text: string;
  onDevice: boolean;

  constructor(private network:Network) {
    console.log('Hello NetworkStateComponent Component');
    this.text = 'OL';
    

    setTimeout( ()=> {
      console.log("Prepare network status");
      this.network.onConnect().subscribe(data => {
        this.text = "ONLINE";
        setTimeout(() => {
          if (this.network.type === 'wifi') {
            console.log('we got a wifi connection, woohoo!');
            this.text = "we got a wifi connection, woohoo!"
          }
        }, 3000);
      }, error => console.error(error));
     
      this.network.onDisconnect().subscribe(data => {
        this.text = "OFFLINE";
      }, error => console.error(error));
      console.log("Network status is", this.text);
    },3000)
  }

  ionViewDidEnter(){
    console.log("enter network state component");
  }

}
