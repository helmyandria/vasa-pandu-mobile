import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {Events} from 'ionic-angular';
import 'rxjs/add/operator/map';

import {Network} from '@ionic-native/network';
import {Storage} from '@ionic/storage-angular';
import {SqliteServiceProvider} from "../providers/sqlite-service/sqlite-service";

/*
  Generated class for the Pnetwork provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class Pnetwork {

    public mqtt_state: boolean = false;
    public network_state: boolean = true;
    public gps_state: boolean = false;
    public connectSub;
    public disconnectSub;

    mqtt_title = null;
    network_title = null;

    constructor(
        public http: Http,
        public events: Events,
        public storage: Storage,
        private network: Network,
        private _sql: SqliteServiceProvider
    ) {
        console.log('Hello Pnetwork Provider');

        this.monConnection()

        /**
         * listen network status
         */
        this.listenNetworkEvents();
    }

    monConnection() {
        this.disconnectSub = this.network.onDisconnect().subscribe(() => {
            console.log('network was disconnected :-(');
            this.storage.set('network_status', false);
            this.events.publish('network:state', false);
            console.log('you are offline');
        });

        this.connectSub = this.network.onConnect().subscribe(() => {
            console.log('network connected!');
            this.storage.set('network_status', true);
            this.events.publish('network:state', true);
            console.log('you are online');
        });
    }

    listenNetworkEvents() {
        this.events.subscribe('mqtt:state', (state) => {
            console.log("mqtt state ", state);
            this.mqtt_state = state;
            this.changeStatus(this.mqtt_state, 'mqtt_title')
        });

        this.events.subscribe('network:state', (state) => {
            console.log("network state ", state);
            this.network_state = state
            this.changeStatus(this.network_state, 'network_title')
        });
    }

    changeStatus(status, title) {
        if (status)
            this[title] = "Connected..";
        else
            this[title] = "Disconnect..";
    }

}
