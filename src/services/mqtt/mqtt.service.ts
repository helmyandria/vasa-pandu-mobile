import {Injectable} from '@angular/core';

import {Events, AlertController, Platform, ModalController} from 'ionic-angular';
import {Subject} from 'rxjs/Rx';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

import {Config} from '../config';
import {TransportService, TransportState} from './transport.service';

import 'mqtt';
import {Client, Packet, connect} from 'mqtt';
import {IClientOptions, IDisconnectPacket} from 'mqtt';

import {Network} from "@ionic-native/network";
import {LocalNotifications} from '@ionic-native/local-notifications';
import {Vibration} from '@ionic-native/vibration';
import {Badge} from '@ionic-native/badge';
import {Dialogs} from '@ionic-native/dialogs';

import {Storage} from '@ionic/storage-angular';

import {AlertTolakSpkComponent} from '../../components/alert-tolak-spk/alert-tolak-spk';

import * as moment from 'moment';

import {SqliteServiceProvider} from "../../providers/sqlite-service/sqlite-service";
import {debounce} from 'ionic-angular/util/util';
import {Device} from '@ionic-native/device';

/** look up states for the message queue */
export const StateLookup: string[] = [
    'CLOSED',
    'TRYING',
    'CONNECTED',
    'SUBSCRIBED',
    'DISCONNECTING'
];

/**
 * Angular2 Message Queue Service using MQTT.js
 *
 * @description This service handles subscribing to a
 * message queue using the mqtt library, and returns
 * values via the ES6 Observable specification for
 * asynchronous value streaming by wiring messages
 * into a Subject observable.
 */
@Injectable()
export class MQTTService implements TransportService {

    /* Service parameters */

    // State of the MQTTService
    public state: BehaviorSubject<TransportState>;

    // Publishes new messages to Observers
    public messages: Subject<Packet>;

    // Configuration structure with MQ creds
    private config: Config;

    // MQTT Client from MQTT.js
    private client: Client;

    // Resolve Promise made to calling class, when connected
    private resolvePromise: (...args: any[]) => void;

    public badgeTot;

    public username;
    private monInterval;

    /** Constructor */
    public constructor(
        public alertCtrl: AlertController,
        public platform: Platform,
        private localNotification: LocalNotifications,
        private badge: Badge,
        private vibration: Vibration,
        private network: Network,
        private events: Events,
        private storage: Storage,
        private _sql: SqliteServiceProvider,
        private device: Device,
        private dialog: Dialogs,
        public modal: ModalController
    ) {
        this.messages = new Subject<Packet>();
        this.state = new BehaviorSubject<TransportState>(TransportState.CLOSED);
    }


    /** Set up configuration */
    public configure(config?: Config): void {

        // Check for errors:
        if (this.state.getValue() !== TransportState.CLOSED) {
            throw Error('Already running!');
        }
        if (config === null && this.config === null) {
            throw Error('No configuration provided!');
        }
        console.log('when connection is reconfigure', config);
        // Set our configuration
        if (config != null) {
            this.config = config;
        }

        // If host isn't set, use the browser's location
        if (typeof this.config.host === 'undefined') {
            this.config.host = document.location.hostname;
        }
    }


    /**
     * Perform connection to broker, returning a Promise
     * which is resolved when connected.
     */
    public try_connect(): Promise<{}> {
        this.debug('try_connect');
        if (this.state.getValue() !== TransportState.CLOSED) {
            throw Error('Can\'t try_connect if not CLOSED!');
        }
        if (this.client === null) {
            throw Error('Client not configured!');
        }

        // Connecting via SSL Websocket?
        let scheme = 'ws';
        if (this.config.ssl) {
            scheme = 'wss';
        }

        // Client options loaded from config
        const options: IClientOptions = {
            'keepalive': this.config.keepalive,
            'reconnectPeriod': 10000,
            'clientId': 'vasa_pandu_clientid_' + Math.floor(Math.random() * 65535),
            // 'clientId': 'vasa_pandu_clientid_'+localStorage.getItem('username'),
            'username': this.config.user,
            'password': this.config.pass,
            'clean': false
        };

        const url = scheme + '://' + this.config.host + ':' + this.config.port;
        console.log("Mqtt connection", options, url);
        // Create the client and listen for its connection
        this.client = connect(url, options);

        this.client.addListener('connect', this.on_connect);
        this.client.addListener('reconnect', this.on_reconnect);
        this.client.addListener('message', this.on_message);
        this.client.addListener('offline', this.on_offline);
        this.client.addListener('error', this.on_error);

        this.debug('connecting to ' + url);
        this.state.next(TransportState.TRYING);

        return new Promise(
            (resolve, reject) => this.resolvePromise = resolve
        );
    }


    /** Disconnect the client and clean up */
    public disconnect(): void {

        // Notify observers that we are disconnecting!
        this.state.next(TransportState.DISCONNECTING);
        this.debug("MQTT Disconnect from client", this.client);
        // Disconnect. Callback will set CLOSED state
        if (this.client) {
            this.client.end(
                false,
                () => this.state.next(TransportState.CLOSED)
            );
            //this.monInterval.clearTimeout()
            clearInterval(this.monInterval);
        }
    }


    /** Send a message to all topics */
    public publish(message?: string) {

        for (const t of this.config.publish) {
            this.client.publish(t, message);
        }
    }

    public publishTopic(message: string, topic: string) {
        this.client.publish(topic, message, {qos: 2});
        this.debug('publish topic : ', moment().format('HH:mm:ss'), "=>", topic, " - ", message);
    }


    /** Subscribe to server message queues */
    public subscribe(): void {

        // Subscribe to our configured queues
        // Callback is set at client instantiation (assuming we don't need separate callbacks per queue.)
        for (const t of this.config.subscribe) {
            this.debug('subscribing: ' + t);
            this.client.subscribe(t);
        }
        // Update the state
        if (this.config.subscribe.length > 0) {
            this.state.next(TransportState.SUBSCRIBED);
        }
    }

    public clientSubscribe(topic): void {
        this.client.subscribe(topic, {qos: 2});
        console.debug("DEBUG MQTT:subscsribe", topic)
    }


    /**
     * Callback Functions
     *
     * Note the method signature: () => preserves lexical scope
     * if we need to use this.x inside the function
     */
    public debug(...args: any[]) {

        // Push arguments to this function into console.log
        if (window.console && console.log && console.log.apply) {
            console.log.apply(console, args);
        }
    }

    // Callback run on successfully connecting to server
    public on_reconnect = () => {
        this.debug('on_reconnect');
        // this.disconnect()
        // this.configure();
        // this.try_connect();

    };

    // Callback run on successfully connecting to server
    public on_connect = () => {

        this.debug('on connected');

        // Indicate our connected state to observers
        this.state.next(TransportState.CONNECTED);

        this.storage.get('username').then((username) => {
            /**
             * disable dulu untuk tidak mendapatkan notifikasi spk
             */
            // this.clientSubscribe("/notif/pandu/spk/" + username + "");

            this.clientSubscribe("/notif/pandu/ohn/" + username + "");
            this.clientSubscribe("/user/status/" + username + "");

            this.clientSubscribe("/monitoring/version");
            this.clientSubscribe("/monitoring/status");
            this.clientSubscribe("/mobile/rea/pandu/status/#");
            this.clientSubscribe("/monitoring/log");
            this.clientSubscribe("/notif/pandu/batal/spk/#");

            this.debug("mqtt.service.ts /notif/pandu/spk/" + username + "");
            this.debug("mqtt.service.ts /notif/pandu/ohn/" + username + "");

            this.username = username;
            this.publishTopic(`App running ${username} ` + moment().format('DD/MM/YYYY HH:mm'), `/notif/first/${username}`);
        })


        // Subscribe to message queues
        this.subscribe();

        // console.log(typeof this.resolvePromise);
        // Resolve our Promise to the caller
        // this.resolvePromise();

        // Clear callback
        this.resolvePromise = null;

        this.monitoringIpadPandu();
    };


    // Handle errors
    public on_error = (error: any) => {

        this.debug('on_error mqtt', error);

        if (typeof error === 'undefined') {
            this.debug('Undefined error');
            this.state.next(TransportState.TRYING);
            return;
        }

        // Check for dropped connection and try reconnecting
        // if (error.indexOf('Lost connection') !== -1) {
        if (error == "client disconnecting") {
            // Reset state indicator
            this.state.next(TransportState.CLOSED);

            // Attempt reconnection
            this.debug("Reconnecting in 5 seconds...");
            setTimeout(() => {
                this.configure();
                this.try_connect();
            }, 5000);
        }
    };


    // On message RX, notify the Observable with the message object
    public on_message = (...args: any[]) => {

        const topic = args[0],
            message = args[1],
            packet: Packet = args[2];

        if (message.toString()) {
            this.messages.next(message);

            this.debug("On_Message in service =>", message.toString())

            this.actMessage(message, topic);
        } else {
            console.warn('Empty message received!');
        }
    }

    public actMessage(message, topic) {
        console.log("mqtt message", topic);
        let payload: any = message.toString();
        var v_title = "";
        this.debug('Message arrived.', payload, "topic", topic);

        let msgId = this.parseTopicStatus(topic);
        if (topic == '/mobile/rea/pandu/status/' + msgId) {
            this.debug("Topic all status", msgId);
            this._sql.updateMessageStatus(msgId, message).then(() => {
                this.events.publish('refresh:data', true);
            })
        }

        let spkId = this.parseTopicStatus(topic);
        if (topic == '/notif/pandu/batal/spk/' + spkId) {
            this.debug("Batal SPK untuk SPK ID", spkId);
            let msg = "Anda mendapatkan pemberitahuan untuk pembatalan SPK";
            if (this.platform.is('ios') || this.platform.is('android')) {
                this.localNotification.schedule({
                    title: "Notifikasi Baru",
                    text: msg,
                    sound: 'file://assets/sound/wind.mp3',
                    data: {secret: 'key'}
                })

                this.dialog.alert(msg, "Notifikasi Baru").then(() => {
                    this._sql.deleteSpk(spkId).then(() => {
                        this.events.publish('refresh:data', true);
                    })
                    this.badge.clear()
                })
            } else {
                this.alertCtrl.create({
                    title: "Notifikasi Baru",
                    subTitle: msg,
                    buttons: [{
                        text: 'OK',
                        handler: () => {
                            this._sql.deleteSpk(spkId).then(() => {
                                this.events.publish('refresh:data', true);
                            })
                        }
                    }]
                }).present()
            }
        }

        /**
         * payload format
         * {
         *    username:"",
         *    query: ""
         *    action: "GET | POST | PUT" 
         * }
         */
        if (topic == '/monitoring/log') {
            let req = JSON.parse(payload);
            console.log("from log", req);
            if (req.username == this.username)
                this._sql.getLog(req.query, req.action).then(data => {
                    this.publishTopic(JSON.stringify(data), '/monitoring/log/pub');
                })
        }

        if (topic == '/monitoring/version') {
            let name, msg;
            this.storage.get('profile').then(val => {
                name = val.namaPetugas
                msg = {
                    'version': this.config['version'],
                    'name': name,
                    'nipp': localStorage.getItem('username'),
                    'uuid': this.device.uuid,
                    'platform': this.device.platform,
                    'serial': this.device.serial
                }

                this.publishTopic(JSON.stringify(msg), '/monitoring/version/pub');
            });
        }

        if (topic == '/monitoring/status') {
            let name, msg, status: any;
            this.storage.get('profile').then(val => {
                name = val.namaPetugas + '-' + val.nipp;
                status = localStorage.getItem('mulaiAbsen')
                msg = {
                    'version': this.config['version'],
                    'username': name,
                    'nipp': localStorage.getItem('username'),
                    'status': status
                }

                this.publishTopic(JSON.stringify(msg), '/monitoring/version/pub');
            }, err => {
                this.debug("not found progfile from mqtt", err);
            });
        }

        if (topic == '/notif/pandu/spk/' + this.username) {
            this.debug("mqtt message spk" + topic + "");
            console.log("mqtt message spk ", topic);
            v_title = "Pemberitahuan Baru untuk SPK";
        } else if (topic == '/notif/pandu/ohn/' + this.username) {
            this.debug("mqtt message ohn" + topic + "");
            console.log("mqtt message ohn ", topic);
            v_title = "Pemberitahuan Baru untuk OHN";

            this.alertTolakSpk(payload);
        }

        if (v_title != "") {
            this.events.publish('notif:mqttbadge', 1);
            if (this.platform.is('ios') || this.platform.is('android')) {
                this.setBadge();
                this.localNotification.hasPermission().then((granted) => {
                    this.debug("Local Notification granted", granted)
                    // if(granted == false){
                    //   this.localNotification.registerPermission().then((v)=>{
                    //     this.debug("Local notification register permission", v)
                    //   })
                    // }
                }).catch((e) => {
                    this.debug("error", e);
                })

                this.localNotification.schedule({
                    title: "Notifikasi Baru",
                    text: v_title,
                    sound: 'file://assets/sound/wind.mp3',
                    data: {secret: 'key'}
                })

                this.dialog.alert(v_title, "Notifikasi Baru").then(() => {
                    this.badge.clear()
                })
            } else {
                let notifAlert = this.alertCtrl.create({
                    title: "Notifikasi Baru",
                    subTitle: v_title,
                    buttons: ['OK']
                }).present()
            }

            this.storage.set('notif_spk', true);

        }

    }

    public alertTolakSpk(payload) {
        this.debug("Pemberitahuan Baru untuk OHN. " + payload + "");
        console.log("Pemberitahuan Baru untuk OHN. ", payload);

        let toDetail = JSON.parse(payload).detailFromObject;

        let modalAlertTolakSpkPandu = this.modal.create(AlertTolakSpkComponent,
            {toDetail: toDetail},
            {
                showBackdrop: true,
                enableBackdropDismiss: false
            }
        )
        modalAlertTolakSpkPandu.onDidDismiss(data => {

            if (data == false) { //tolak spk
                console.log("mqtt service tolak spk pandu ");

            } else if (data == true) { //terima spk
                console.log("mqtt service terima spk pandu ");

                console.log("from toDetail: ", toDetail);
                let msg = {
                    'id': toDetail.id,
                    'imeiNumber': this.device.uuid
                }
                this.publishTopic(JSON.stringify(msg), `/notif/pandu/callback/${this.username}`);

                this._sql.saveSpkAndDetail(JSON.parse(payload)).then(() => {
                    this.events.publish('refresh:data', true);
                });
            }

        });

        modalAlertTolakSpkPandu.present();

        // let notifTolak = this.alertCtrl.create({
        //   title: "Notifikasi Baru",
        //   subTitle: "Pemberitahuan Baru untuk OHN",
        //   buttons: [{
        //     text: 'Tolak',
        //     handler : ()=>{
        //       console.log("Tolak SpkData.");
        //       let modalTolakSpkPandu = this.modal.create(TolakSpkPanduComponent,
        //         {toDetail:toDetail},
        //         {
        //           showBackdrop:true,
        //           enableBackdropDismiss: false
        //         }
        //       )
        //       modalTolakSpkPandu.onDidDismiss(data => {
        //         console.log("tolak spk pandu dismiss", data);

        //         if (data == true) { //tolak spk
        //           this.debug("tolak spk pandu ", data);
        //           console.log("tolak spk pandu ", data);

        //         } else if (data == false) { //cancel tolak spk
        //           this.debug("tolak spk pandu ", data);
        //           console.log("tolak spk pandu ", data);

        //           this.debug("from toDetail: ", toDetail);
        //           console.log("from toDetail: ", toDetail);
        //           let msg = {
        //             'id': toDetail.id,
        //             'imeiNumber':this.device.uuid
        //           }
        //           this.publishTopic(JSON.stringify(msg), `/notif/pandu/callback/${this.username}`);

        //           this._sql.saveSpkAndDetail(JSON.parse(payload)).then(()=>{
        //             this.events.publish('refresh:data', true);
        //           });
        //         }

        //       });

        //       modalTolakSpkPandu.present();
        //     }
        //   },
        //   {
        //     text: 'Terima',
        //     handler : ()=>{
        //       this.debug("Terima SpkData. ");
        //       console.log("Terima SpkData.");

        //       this.debug("from toDetail: ", toDetail);
        //       console.log("from toDetail: ", toDetail);
        //       let msg = {
        //         'id': toDetail.id,
        //         'imeiNumber':this.device.uuid
        //       }
        //       this.publishTopic(JSON.stringify(msg), `/notif/pandu/callback/${this.username}`);

        //       this._sql.saveSpkAndDetail(JSON.parse(payload)).then(()=>{
        //         this.events.publish('refresh:data', true);
        //       });
        //     }
        //   }
        // ],
        // enableBackdropDismiss: false
        // }).present()

    }

    public setBadge() {
        this.vibration.vibrate(1000);

        this.badge.get().then((badge) => {
            if (badge == 0) {
                this.badge.set(1);
            } else if (badge >= 1) {
                this.badge.increase(1)
            }

            this.badgeTot = badge;
            this.events.publish('notif:mqttbadge', badge);
            this.debug("current badge", badge)
        }).catch((e) => {
            this.debug("error", e);
        })
    }

    parseTopicStatus(topic) {
        let delimiter = '/';
        let ar = topic.split(delimiter);
        let msgId = ar[5];
        this.debug(ar);
        return msgId;
    }

    public on_offline = (error: any) => {
        this.debug("Mqtt Offline", error);
    }

    monitoringIpadPandu() {
        this.monInterval = setInterval(() => {
            console.log("monitoringIpadPandu");
            //console.log("username: ", localStorage.getItem('username'));
            this.publishTopic(localStorage.getItem('username'), `/status/ipad/pandu/${localStorage.getItem('username')}`);
        }, 5 * 60 * 1000);
    }
}