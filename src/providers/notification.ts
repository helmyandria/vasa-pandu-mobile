import { Injectable } from '@angular/core';

import { App, Events, AlertController, Platform } from 'ionic-angular';
import { BackgroundMode } from '@ionic-native/background-mode';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { Vibration } from '@ionic-native/vibration';
import { Badge } from '@ionic-native/badge';
import { Network } from '@ionic-native/network';

import { Storage } from '@ionic/storage-angular';
import { Http } from '@angular/http';

import * as moment from 'moment';
import 'rxjs/add/operator/map';

import { UserData } from './user-data';

import { Subject } from 'rxjs/Rx';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Observable } from 'rxjs/Observable';
import { Packet } from 'mqtt';

import { MQTTService } from '../services/mqtt';
import { ConfigService } from '../services/config/config.service';

@Injectable()
export class Notification {

  username: string;
  v_badge: number = 0;
  mqtt_connect: boolean = false;
  si = null;
  ext: any;

  public messages: Observable<Packet>;

  // Array of historic message (bodies)
  public mq: Array<string> = [];

  // A count of messages received
  public count = 0;
  public allconfig: {};

  public badgeTot
  constructor(
    public http: Http,
    public events: Events,
    public alertCtrl: AlertController,
    public userData: UserData,
    public platform: Platform,
    public storage: Storage,
    public appCtrl: App,
    private localNotification: LocalNotifications,
    private badge: Badge,
    private vibration: Vibration,
    private network: Network,
    private _mqService: MQTTService,
    private _configService: ConfigService
  ) {
    console.log('Hello Notification Provider');
    
  }


  init(username) {
    var self = this;

    self.username = username;
    console.log("Init Notif", self.username);

    this._configService.getConfig('assets/api/config.json').then(
      config => {
        // ... then pass it to (and connect) the message queue:
        this._mqService.configure(config);
        this._mqService.try_connect()
          .then(this.on_connect)
          .catch(this.on_error);
        
        this.allconfig = config;
      }
    );

  }

  /** Callback on_connect to queue */
  public on_connect = () => {

    // Store local reference to Observable
    // for use with template ( | async )
    // this.messages = this._mqService.messages;

    // Subscribe a function to be run on_next message
    this.messages.subscribe(this.on_next);

    console.log('Connected to broker with user.', this.username);

    this._mqService.clientSubscribe("/notif/pandu/spk/" + this.username + "");
    this._mqService.clientSubscribe("/notif/pandu/ohn/" + this.username + "");

    console.log("/notif/pandu/spk/" + this.username + "");
    console.log("/notif/pandu/ohn/" + this.username + "");
    

    this.sendMessage('App running ', `/notif/first/${this.username}` );

    this.events.publish('mqtt:state', true)
    this.storage.set('mqtt_status', true)
    this.mqtt_connect = true;

  }

  /** Consume a message from the _mqService */
  public on_next = (message: Packet) => {

    // Store message in "historic messages" queue
    this.mq.push(message.toString() + '\n');

    // Count it
    this.count++;
  }

  public on_error = () => {
    console.error('Ooops, error in RawDataComponent');
    
  }


  public sendMessage(vmessage: any, topic: string) {
    console.debug("send mesage", vmessage, 'topic', topic)
    this._mqService.publishTopic(vmessage, topic)
  }

  

};
