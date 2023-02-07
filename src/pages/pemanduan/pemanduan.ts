import {Component, ViewChild} from '@angular/core';
import {
    NavController,
    ViewController,
    AlertController,
    NavParams,
    ModalController,
    LoadingController
} from 'ionic-angular';
import {Storage} from '@ionic/storage';
import {RealisasiPanduPage} from '../realisasi-pandu/realisasi-pandu';


import * as moment from 'moment';
import * as SignaturePad from 'signature_pad';
import 'moment/locale/id';

import {SpkData} from '../../providers/spk-data';
import {Pnetwork} from '../../providers/pnetwork';
import {Notification} from '../../providers/notification';
import {LocationTracker} from "../../providers/location-tracker";

import {RemarkComponent} from '../../components/remark/remark';
import {BatalPanduComponent} from '../../components/batal-pandu/batal-pandu';
import {AdjustTimeComponent} from '../../components/adjust-time/adjust-time';

import {AppConfig} from '../../config/app.config';

import {SQLite} from '@ionic-native/sqlite';
import {SqliteServiceProvider} from '../../providers/sqlite-service/sqlite-service';

/*
  Generated class for the Pemanduan page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/


@Component({
    selector: 'page-pemanduan',
    templateUrl: 'pemanduan.html',
    providers: [SpkData, LocationTracker]
})
export class PemanduanPage {
    private data: any;
    public profile: any = [];

    public isPin: boolean = false;
    public v_pandu_status: boolean = true;
    public v_pemanduan_start: boolean = false;
    public v_save_call: boolean = false;
    public v_kapal_bergerak: boolean = false;
    public v_selesai_pandu: boolean = false;
    public v_ikat_tali_tunda: boolean = false;
    public v_ikat_tali_kapal: boolean = false;
    public v_lepas_tali_tunda: boolean = false;
    public v_lepas_tali_kapal: boolean = false;
    public v_isi_pin: boolean = false;
    public v_pandu_turun: boolean = false;
    public v_pemanduan_stop: boolean = false;
    public v_pemanduan_selesai: boolean = false;
    public v_sign: boolean = false;
    public working: Array<string>;
    public htmlText: string = "";
    public s_working;
    public v_pin_nahkoda: any;
    public last_state: string = null;
    public v_timer: string;
    public wizard = null;
    public showWizard = false;
    public currentWizard = 0;
    public showButton = "pemanduan_start";
    public showButtonBatal = false;
    public signaturePad;
    public canvas;
    public paramWizard;
    public wizardStep;
    public timeDiff: string = "";
    public manualText: string = "";
    private remark: string;
    private loader;
    private kapalTunda = [];
    private kendalaOperasional;
    private kodeLokasiPanduTujuan;
    private namaLokasiPanduTujuan;

    public index?: number;

    public flag_state = {
        pemanduan_start: {
            tahapPandu: 1,
            title: "Pandu Naik (Pilot Get On)",
            map: "jamNaik",
            status: false,
            value: "00:00:00"
        },
        kapal_bergerak: {
            tahapPandu: 2,
            title: "Kapal Bergerak",
            map: "jamKapalGerak",
            status: false,
            value: "00:00:00"
        },
        ikat_tali_tunda: {
            tahapPandu: 4,
            title: "Ikat Tali Tunda",
            map: "tglMulaiTunda",
            status: false,
            value: "00:00:00"
        },
        ikat_tali_kapal: {
            tahapPandu: 6,
            title: "Ikat Tali Kapal",
            map: "tglMulaiTambat",
            status: false,
            value: "00:00:00"
        },
        lepas_tali_tunda: {
            tahapPandu: 5,
            title: "Lepas Tali Tunda",
            map: "tglSelesaiTunda",
            status: false,
            value: "00:00:00"
        },
        lepas_tali_tunda2: {
            tahapPandu: 0, title: "Lepas Tali Tunda", status: false, value: "00:00:00"
        },
        lepas_tali_kapal: {
            tahapPandu: 7, title: "Lepas Tali Kapal", status: false, value: "00:00:00"
        },
        lepas_tali_kapal2: {
            tahapPandu: 0, title: "Lepas Tali Kapal", status: false, value: "00:00:00"
        },
        // isi_pin: {           tahapPandu:0,   title: "Isi Pin ",             status: false, value: "00:00:00" },
        selesai_pandu: {
            tahapPandu: 3,
            title: "Selesai Pandu",
            map: "tglSelesaiPandu",
            status: false,
            value: "00:00:00"
        },
        keluar: {tahapPandu: 0, title: "Keluar (Close)", status: false, value: "00:00:00"}
    }

    public generate_wizard = [
        [
            {
                id: "pemanduan_start",
                map: "jamNaik",
                tahapPandu: 1,
                title: "Pandu Naik (Pilot Get On)",
                status: false,
                value: "00:00:00"
            },
            {
                id: "kapal_bergerak",
                map: "jamKapalGerak",
                tahapPandu: 2,
                title: "Kapal Bergerak (Start Ship)",
                status: false,
                value: "00:00:00"
            },
            {
                id: "ikat_tali_tunda",
                map: "tglMulaiTunda",
                tahapPandu: 4,
                title: "Ikat Tali Tunda (Tug Fast)",
                status: false,
                value: "00:00:00"
            },
            {
                id: "ikat_tali_kapal",
                map: "tglMulaiTambat",
                tahapPandu: 6,
                title: "Ikat Tali Kapal (Fast Line)",
                status: false,
                value: "00:00:00"
            },
            {
                id: "lepas_tali_tunda",
                map: "tglSelesaiTunda",
                tahapPandu: 5,
                title: "Lepas Tali Tunda (Tug Off)",
                status: false,
                value: "00:00:00"
            },
            // { id:"isi_pin",           map:"",                                     title: "Isi Pin ", status: false, value: "00:00:00" },
            {
                id: "selesai_pandu",
                map: "tglSelesaiPandu",
                tahapPandu: 3,
                title: "Selesai Pandu (Pilot Get Off)",
                status: false,
                value: "00:00:00"
            },
            {
                id: "keluar", status: false, title: "Keluar (Close)"
            }
        ],
        [
            {
                id: "pemanduan_start",
                map: "jamNaik",
                tahapPandu: 1,
                title: "Pandu Naik (Pilot Get On)",
                status: false,
                value: "00:00:00",
            },
            {
                id: "ikat_tali_tunda",
                map: "tglMulaiTunda",
                tahapPandu: 4,
                title: "Ikat Tali Tunda (Tug Fast)",
                status: false,
                value: "00:00:00"
            },
            {
                id: "lepas_tali_kapal",
                map: "tglSelesaiTambat",
                tahapPandu: 7,
                title: "Lepas Tali Kapal (Last Line)",
                status: false,
                value: "00:00:00"
            },
            {
                id: "kapal_bergerak",
                map: "jamKapalGerak",
                tahapPandu: 2,
                title: "Kapal Bergerak (Start Ship)",
                status: false,
                value: "00:00:00"
            },
            {
                id: "lepas_tali_tunda",
                map: "tglSelesaiTunda",
                tahapPandu: 5,
                title: "Lepas Tali Tunda (Tug Off)",
                status: false,
                value: "00:00:00"
            },
            // { id:"isi_pin",           map:"",                                     title: "Isi Pin ", status: false, value: "00:00:00" },
            {
                id: "selesai_pandu",
                map: "tglSelesaiPandu",
                tahapPandu: 3,
                title: "Selesai Pandu (Pilot Get Off)",
                status: false,
                value: "00:00:00"
            },
            {
                id: "keluar", status: false, title: "Keluar (Close)"
            }
        ],
        [
            {
                id: "pemanduan_start",
                map: "jamNaik",
                tahapPandu: 1,
                title: "Pandu Naik (Pilot Get On)",
                status: false,
                value: "00:00:00",
            },
            {
                id: "kapal_bergerak",
                map: "jamKapalGerak",
                tahapPandu: 2,
                title: "Kapal Bergerak (Start Ship)",
                status: false,
                value: "00:00:00"
            },
            // { id:"isi_pin",           map:"",                                     title: "Isi Pin ", status: false, value: "00:00:00" },
            {
                id: "selesai_pandu",
                map: "tglSelesaiPandu",
                tahapPandu: 3,
                title: "Selesai Pandu (Pilot Get Off)",
                status: false,
                value: "00:00:00"
            },
            {id: "keluar", status: false, title: "Keluar (Close)"}
        ],
        [
            {
                id: "pemanduan_start",
                map: "jamNaik",
                tahapPandu: 1,
                title: "Pandu Naik (Pilot Get On)",
                status: false,
                value: "00:00:00",
            },
            {
                id: "ikat_tali_tunda",
                map: "tglMulaiTunda",
                tahapPandu: 4,
                title: "Ikat Tali Tunda (Tug Fast)",
                status: false,
                value: "00:00:00"
            },
            {
                id: "lepas_tali_kapal",
                map: "tglSelesaiTambat",
                tahapPandu: 7,
                title: "Lepas Tali Kapal (Last Line)",
                status: false,
                value: "00:00:00"
            },
            {
                id: "kapal_bergerak",
                map: "jamKapalGerak",
                tahapPandu: 2,
                title: "Kapal Bergerak (Start Ship)",
                status: false,
                value: "00:00:00"
            },
            {
                id: "ikat_tali_kapal",
                map: "tglMulaiTambat",
                tahapPandu: 6,
                title: "Ikat Tali Kapal (Fast Line)",
                status: false,
                value: "00:00:00"
            },
            {
                id: "lepas_tali_tunda",
                map: "tglSelesaiTunda",
                tahapPandu: 5,
                title: "Lepas Tali Tunda (Tug Off)",
                status: false,
                value: "00:00:00"
            },
            // { id:"isi_pin",           map:"",                                     title: "Isi Pin ", status: false, value: "00:00:00" },
            {
                id: "selesai_pandu",
                map: "tglSelesaiPandu",
                tahapPandu: 3,
                title: "Selesai Pandu (Pilot Get Off)",
                status: false,
                value: "00:00:00"
            },
            {id: "keluar", status: false, title: "Keluar (Close)"}
        ],
        [
            {
                id: "pemanduan_start",
                map: "jamNaik",
                tahapPandu: 1,
                title: "Pandu Naik (Pilot Get On)",
                status: false,
                value: "00:00:00"
            },
            {
                id: "ikat_tali_tunda",
                map: "tglMulaiTunda",
                tahapPandu: 4,
                title: "Ikat Tali Tunda (Tug Fast)",
                status: false,
                value: "00:00:00"
            },
            {
                id: "lepas_tali_kapal",
                map: "tglSelesaiTambat",
                tahapPandu: 7,
                title: "Lepas Tali Kapal (Last Line)",
                status: false,
                value: "00:00:00"
            },
            {
                id: "lepas_tali_tunda",
                map: "tglSelesaiTunda",
                tahapPandu: 5,
                title: "Lepas Tali Tunda (Tug Fast)",
                status: false,
                value: "00:00:00"
            },
            {
                id: "kapal_bergerak",
                map: "jamKapalGerak",
                tahapPandu: 2,
                title: "Kapal Bergerak (Start Ship)",
                status: false,
                value: "00:00:00"
            },
            {
                id: "ikat_tali_tunda2", title: "Ikat Tali Tunda", status: false, value: "00:00:00"
            },
            {
                id: "ikat_tali_kapal",
                map: "tglMulaiTambat",
                tahapPandu: 6,
                title: "Ikat Tali Kapal (Fast Line)",
                status: false,
                value: "00:00:00"
            },
            {
                id: "lepas_tali_tunda2", title: "Lepas Tali Tunda (Tug Off)", status: false, value: "00:00:00"
            },
            // { id:"isi_pin",           map:"",                                     title: "Isi Pin ", status: false, value: "00:00:00" },
            {
                id: "selesai_pandu",
                map: "tglSelesaiPandu",
                tahapPandu: 3,
                title: "Selesai Pandu (Pilot Get Off)",
                status: false,
                value: "00:00:00"
            },
            {
                id: "keluar", status: false, title: "Keluar (Close)"
            }
        ]

    ]

    /**
     * kondisi flow
     * 1. area labuh ke tambatan API 1 (Pandu Tunda Tambat)
     * 2. tambatan ke area labuh API 1 (Pandu Tunda Tambat)
     * 3. area labuh ke area labuh (Pandu)
     * 4. tambatan ke tambatan dalam 1 wilayah (Pandu Tunda Tambat)
     * 5. dari tambatan ke tambatan tapi beda wilayah
     */

    constructor(
        public navCtrl: NavController,
        public storage: Storage,
        private alertCtrl: AlertController,
        public params: NavParams,
        public pnetwork: Pnetwork,
        public notification: Notification,
        public spkData: SpkData,
        public tracker: LocationTracker,
        private modal: ModalController,
        private view: ViewController,
        private loadingCtrl: LoadingController,
        public appConfig: AppConfig,
        public _sql: SqliteServiceProvider,
        private sqlite: SQLite,
    ) {
        this.data = params.get('datas');
        this.kapalTunda = params.get('tundas')
        console.log(this.data);
        this.paramWizard = (this.data.jenisDermaga - 1);
        this.v_pandu_status = true;
        console.log("generate wizard flow", this.paramWizard)
        //this.fetchingWorker();

        console.log('Hello PemanduanPage Page');


        this.storage.ready().then(() => {
            this.storage.get('profile').then((data) => {
                this.profile = data;
                console.log(this.profile);
            })

            this.firstLoad()
        })
    }

    ionViewDidLoad() {

    }

    firstLoad() {
        this.generateStep(this.paramWizard)
        this.current_state();
    }

    presentLoadingDefault() {
        this.loader = this.loadingCtrl.create({
            content: 'Please wait...'
        });

        this.loader.present();
    }

    resizeCanvas() {
        var ratio = Math.max(window.devicePixelRatio || 1, 1);
        this.canvas.width = this.canvas.offsetWidth * ratio;
        this.canvas.height = this.canvas.offsetHeight * ratio;
        this.canvas.getContext("2d").scale(ratio, ratio);
    }


    current_state() {

        console.log("Current State.....");
        this.storage.get('last_state2').then(state => {
            console.log('state', state);
            this.storage.get('panduid').then(panduid => {
                if (panduid != null && panduid == this.data.id) {
                    this.last_state = state;
                    this.showButtonBatal = true;

                    console.log("storage", state)
                    if (this.last_state == null) {
                        this.v_pemanduan_start = true;
                        this.showWizard = true;
                    } else if (this.last_state == 'pemanduan_stop') {
                        this.v_pemanduan_selesai = true;
                    } else {
                        let next_state = this.getNextStep(this.last_state);
                        this["v_" + next_state] = true;
                    }

                    this.fetchingWorker();
                    this.index = this.getIndexbyObject(this.wizard, this.last_state);

                    this.nextAction(this.last_state, this.index)

                    if (this.last_state == "selesai_pandu") {
                        this.v_sign = true;
                        this.showButtonBatal = false;
                        setTimeout(() => {
                            this.canvas = document.querySelector("canvas");

                            this.signaturePad = new SignaturePad(this.canvas);
                        }, 2000)
                    }
                } else {
                    this.last_state = null;

                    this.storage.remove('last_state2');
                    this.storage.remove('last_state');
                    this.storage.remove('panduid');
                    this.storage.remove('v_worker2');
                    this.storage.remove('notif_spk');
                    this.storage.remove('notifWorking');
                    localStorage.removeItem('v_worker2');
                    localStorage.removeItem('notifWorking');
                    localStorage.removeItem('last_state2');

                    console.log("storage", state)
                    if (this.last_state == null) {
                        this.v_pemanduan_start = true;
                        this.showWizard = true;
                    } else if (this.last_state == 'pemanduan_stop') {
                        this.v_pemanduan_selesai = true;
                    } else {
                        let next_state = this.getNextStep(this.last_state);
                        this["v_" + next_state] = true;
                    }

                    this.fetchingWorker();
                    this.index = this.getIndexbyObject(this.wizard, this.last_state);

                    this.nextAction(this.last_state, this.index)

                    if (this.last_state == "selesai_pandu") {
                        this.v_sign = true;
                        setTimeout(() => {
                            this.canvas = document.querySelector("canvas");

                            this.signaturePad = new SignaturePad(this.canvas);
                        }, 2000)
                    }
                }
            })


        })

    }

    fetchingWorker() {
        console.debug("fetchingWorker.....");
        // console.log("before this working", this.s_working);
        this.s_working = [];
        this.s_working = localStorage.getItem('v_worker2');
        console.log("after this working", this.s_working);
        if (this.s_working != null)
            this.wizard = JSON.parse(this.s_working);
        else
            this.wizard = this.generate_wizard[this.paramWizard]

        console.log("Wizard used..", this.wizard)

        for (let v_data in this.wizard) {
            console.log("title:", this.wizard[v_data]['title'], "status:", this.wizard[v_data]['status'], "V:", moment(this.wizard[v_data]['value']).format("HH:mm:ss"));

            if (this.wizard[v_data]['status'] == true) {
                this.stepComplete(this.wizard[v_data]['id']);

                //if(Number(v_data) >= 1 && Number(v_data) < Number(this.wizard.length)){
                //console.log('start', this.wizard[v_data]['value'], 'end', this.wizard[Number(v_data)+1]['value'])

                this.diffProgress(this.wizard[v_data]['value'], this.wizard[Number(v_data) + 1]['value'])
                //}
                console.debug("title:", this.wizard[v_data]['title'], "status:", this.wizard[v_data]['status'], "status:", this.wizard[v_data]['value']);
                this.statusTemplate(this.wizard[v_data]['title'], this.wizard[v_data]['value'], this.wizard[v_data]['tahapPandu'])
            }
        }
        this.showWizard = true;

    }

    stepComplete(elm) {
        try {
            let el = document.getElementsByClassName("i" + elm)[0];
            if (elm != 'isi_pin' && elm != 'keluar')
                el.setAttribute('class', 'complete')
        } catch (e) {
            console.log("wizard step was completed");
        }
    }

    getIndexbyObject(Ar, id) {
        return Ar.map((e) => {
            return e.id
        }).indexOf(id)
    }

    timer(worker: string, title: string, status = true) {

        this.last_state = worker;

        this.flag_state[worker].status = status;
        this.wizard[this.getIndexbyObject(this.wizard, worker)].status = status;
        console.log(this.flag_state[worker].status, worker)

        this.flag_state[worker].value = moment().format('YYYY-MM-DD[T]HH:mm');
        this.wizard[this.getIndexbyObject(this.wizard, worker)].value = moment().format('YYYY-MM-DD[T]HH:mm');


        this.storage.set('last_state', worker);
        this.storage.set('last_state2', worker);
        this.storage.set('v_worker2', this.flag_state);

        localStorage.setItem('last_state2', worker);
        localStorage.setItem('notifWorking', 'true');
        localStorage.setItem('v_worker2', JSON.stringify(this.wizard));
        this.v_timer = moment().format('YYYY-MM-DD[T]HH:mm');

        //add progress to template
        this.statusTemplate(title, this.v_timer, this.wizard[this.getIndexbyObject(this.wizard, worker)]['tahapPandu']);

        //replace color step wizard to complete
        this.stepComplete(worker);

        if (this.index > 0) {
            var v1 = this.wizard[this.index].value;
            var v2 = this.wizard[this.index - 1].value;

            console.warn(v2, v1)
            this.diffProgress(v2, v1);
        }

        if (worker != 'isi_pin' && worker != 'keluar') {
            let postParam = {
                idTahapanPandu: this.flag_state[worker].tahapPandu,
                nomorSpk: this.data.nomorSpk,
                nomorSpkPandu: this.data.nomorSpkPandu,
                tglTahapan: this.v_timer,
                title: title

            }

            console.debug("POST PROGRESS", postParam)
            /**
             * post progres using http
             *
             */
            // this.spkData.postProgress(
            //   postParam.idTahapanPandu,
            //   postParam.nomorSpk,
            //   postParam.nomorSpkPandu,
            //   postParam.tglTahapan
            // );

            /**
             * post progress menggunakan MQTT
             *
             * topic /progress/rea/pandu
             */
            this.notification.sendMessage(JSON.stringify(postParam), '/progress/rea/pandu');

            /**
             * post progress ke mobile tunda dan tambat
             *
             * @topic /notif/progress/pandu/${nomorSpkPandu}
             */
            this.notification.sendMessage(JSON.stringify(postParam), `/notif/progress/pandu/${this.data.nomorSpkPandu}`);

            /**
             * notif ketika user tidak melakukan pekerjaan
             * true = apabila alert sudah ditampilkan 1x
             * false = alert belum ditampilkan
             */
            this.storage.set('notifWorking', 'false');
        }


        //push to data
        if (worker != 'isi_pin') {
            console.log(this.wizard[this.getIndexbyObject(this.wizard, worker)].map
                , moment().format('YYYY-MM-DD[T]HH:mm'))
            this.data[this.wizard[this.getIndexbyObject(this.wizard, worker)].map] = moment().format('YYYY-MM-DD[T]HH:mm:ss');

            //handling tglMulaiPandu disamakan dengan kapal bergerak..
            if (worker == 'kapal_bergerak') {
                this.data['tglMulaiPandu'] = moment().format('YYYY-MM-DD[T]HH:mm');
            } else if (worker == 'selesai_pandu') {
                this.data['jamTurun'] = moment().format('YYYY-MM-DD[T]HH:mm');
            }
        }

    }

    getNextStep(current: string) {
        let aData = [];

        for (let data in this.flag_state) {
            aData.push(data);
        }
        let currentIndex = aData.indexOf(current);

        return aData[currentIndex + 1];
    }

    statusTemplate(title: string, value: any, wizardId: any) {
        let vVal = moment(value).format('HH:mm');
        this.htmlText = this.htmlText +
            `
          <div class="ps_stat_left">
            ` + title +
            `
          </div>
          <div class="ps_stat_right">
            ` + vVal +
            `
          </div>
      `;
    }

    pemanduan_start() {
        this.v_pandu_status = true;

        this.storage.set('panduid', this.data.id);
        this.tracker.startTracking();
        this.tracker.startPanduLocation(true, this.data.nomorSpkPandu);
        this.timer('pemanduan_start', 'Pandu Naik (Pilot Get On)');
        this.showButtonBatal = true;
    }

    kapal_bergerak() {
        this.timer('kapal_bergerak', 'Kapal Bergerak (Start Ship)');
        this.showButtonBatal = true;
    }

    selesai_pandu() {
        this.timer('selesai_pandu', 'Selesai Pandu (Pilot Get Off)');
        this.showButtonBatal = false;
    }

    ikat_tali_kapal() {
        this.timer('ikat_tali_kapal', 'Ikat Tali Kapal (Fast Line)');
        this.showButtonBatal = true;
    }

    ikat_tali_tunda() {
        this.timer('ikat_tali_tunda', 'Ikat Tali Tunda (Tug Fast)');
        this.showButtonBatal = true;
    }

    ikat_tali_tunda2() {
        this.timer('ikat_tali_tunda2', 'Ikat Tali Tunda 2');
    }

    lepas_tali_kapal() {
        this.timer('lepas_tali_kapal', 'Lepas Tali Kapal (Last Line)');
        this.showButtonBatal = true;
    }

    lepas_tali_tunda() {
        this.timer('lepas_tali_tunda', 'Lepas Tali Tunda (Tug Off)');
        this.showButtonBatal = true;
    }

    lepas_tali_tunda2() {
        this.timer('lepas_tali_tunda2', 'Lepas Tali Tunda 2');
    }

    isi_pin() {
        /**
         * show pin container
         */
        this.isPin = true;

        this.timer('isi_pin', 'Isi Pin');
    }

    pandu_turun() {
        this.timer('pandu_turun', 'Pandu Turun ');
    }

    pemanduan_stop() {
        this.timer('pemanduan_stop', 'Stop');
    }

    pemanduan_selesai() {
        this.showButtonBatal = false;
        this.timer('selesai_pandu', 'Selesai Pandu');
    }

    clearSignature() {
        this.signaturePad.clear()
    }

    nextAction(workId, index) {
        this.index = index;
        if (this.last_state != workId) {
            switch (workId) {
                case 'pemanduan_start':
                    this.pemanduan_start();
                    break;
                case 'kapal_bergerak':
                    this.kapal_bergerak();
                    break;
                case 'ikat_tali_tunda':
                    this.ikat_tali_tunda()
                    break;
                case 'ikat_tali_kapal':
                    this.ikat_tali_kapal()
                    break;
                case 'lepas_tali_kapal':
                    this.lepas_tali_kapal()
                    break;
                case 'lepas_tali_tunda':
                    this.lepas_tali_tunda()
                    break;
                case 'ikat_tali_tunda2':
                    this.ikat_tali_tunda2()
                    break;
                case 'lepas_tali_tunda2':
                    this.lepas_tali_tunda2()
                    break;
                case 'isi_pin':
                    this.isi_pin();
                    break;
                case 'selesai_pandu':

                    this.v_sign = true;
                    this.isPin = false;

                    setTimeout(() => {
                        this.canvas = document.querySelector("canvas");
                        this.signaturePad = new SignaturePad(this.canvas);
                    }, 2000)
                    this.pemanduan_selesai();
                    break;
                case 'keluar':
                    if (this.signaturePad.isEmpty()) {
                        let notifAlert = this.alertCtrl.create({
                            title: 'Error..!!',
                            subTitle: 'Mohon isi tanda tangan nahkoda kapal"',
                            buttons: ['OK']
                        })
                        notifAlert.present()
                        return false;
                    }

                    this.showButton = this.wizard[index].id;

                    this.presentLoadingDefault()

                    /**
                     * update progress to done when progress pemanduan selesai
                     */
                    console.log("PUT PROGRESS DONE", this.data.id)
                    console.log("master data", this.data);
                    /**
                     * put progress using http
                     */
                    // this.spkData.putProgressDone(this.data.id);

                    /**
                     * topic : /mobile/spk/pandu/done
                     * payload: idspk
                     */
                    this.notification.sendMessage(JSON.stringify(this.data.id), '/mobile/spk/pandu/done')

                    /**
                     * publish to API
                     */
                    this.pubToApi();

                    /**
                     * kriim tahapan pandu manual
                     *
                     */
                    // this.postTahapanBulk(this.data.nomorSpk, this.data.nomorSpkPandu, this.data.id)

                    setTimeout(() => {
                        /**
                         * remove all key from storage
                         */
                        this.removeStorage();

                        this.loader.dismiss();

                        this.navCtrl.setRoot(RealisasiPanduPage);
                        /**
                         * stop kirim lokasi pandu
                         */
                        this.tracker.stopTracking();
                        this.tracker.startPanduLocation(false);
                        clearInterval(this.tracker.intMulaiPandu);

                        // this.navCtrl.setRoot(RealisasiPanduPage);
                    }, 5000)

                    break;
            }
        }

        if (workId != 'keluar')
            this.showButton = this.wizard[index + 1].id;

        console.log("must be shown", this.showButton)
    }

    pubToApi() {

        let data_format = {
            "remark": this.remark,
            "asalDermaga": 0,
            "catatan": this.remark,
            "flagApbs": 0,
            "flagRampdoor": 0,
            "nipPandu": this.profile.nipPandu,
            "username": this.profile.nipPandu,
            "jenisKep": "normal",
            "jenisRealisasi": 0,
            "namaPandu": this.profile.namaPetugas,
            "mobileAppVersion": this.appConfig['version'],
            "posisiKapal": "1",
            "status": 0,
            "statusPelaksanaan": 0,
            "statusSiklusPandu": 1,
            "sign": this.signaturePad.toDataURL(),
            "msgId": this.data.id
        }

        for (let i in data_format) {
            this.data[i] = data_format[i];
        }

        /**
         * post realisasi pandu
         */
        console.debug("POST REA", this.data)
        if (this.pnetwork.network_state) {
            console.log("DEBUG REALISASI: online");
            this.spkData.realisasiPandu(this.data.jenisDermaga, this.data);

            this.realisasiAction("C");
        } else {
            console.log("DEBUG REALISASI: offline");
            this.realisasiAction("P");
        }

        /**
         * topic realisasi
         * /mobile/rea/pandu
         */
        this.notification.sendMessage(JSON.stringify(this.data), '/mobile/rea/pandu/log')
        /**
         * Jika menggunakan offline data
         */
        // this._sql.saveRealisasiToSqlite(this.data)
        // this._sql.saveRealisasiMqttLog(this.data)
    }

    /**
     *
     * @param state {P | C} string
     */
    realisasiAction(state: string) {
        this._sql.saveRealisasiToSqlite(this.data).then(() => {
            this._sql.saveRealisasiMqttLog(this.data, state).then(() => {
                /**
                 * Jika menggunakan offline data
                 */
                this._sql.updateSpkStatus(this.data.id, state);
            })
        })

        /**
         * kriim tahapan pandu manual
         *
         */
        this.postTahapanBulk(this.data.nomorSpk, this.data.nomorSpkPandu, this.data.id)
    }

    public generateStep(id) {
        console.log("wizard used", id)
        let vData = [];
        this.generate_wizard[id].forEach(ret => {
            if (ret.id != 'isi_pin' && ret.id != 'keluar')
                vData.push(ret);
        })

        this.wizardStep = '<ol class="list-inline text-center step-indicator">';
        for (let i in vData) {
            this.wizardStep +=
                ` <li class="i` + vData[i].id + ` active">
              <div class="step">` + (Number(i) + 1) + `</div>
              <div class="caption hidden-xs hidden-sm">
              ` + vData[i].title + `</div>
            </li>
        `;

        }
        this.wizardStep += '</ol>';
    }

    diffProgress(start, end) {
        if (end > start) {
            // var ms = moment(end,"HH:mm:ss").diff(moment(start,"HH:mm:ss"));
            // var d = moment.duration(ms);
            // var s = Math.floor(d.asHours()) + moment.utc(ms).format(":mm");

            var date1 = moment(start, 'YYYY-MM-DDTHH:mm'),
                date2 = moment(end, 'YYYY-MM-DDTHH:mm');
            var duration = moment.duration(date2.diff(date1));

            var ms = moment(end, "HH:mm").diff(moment(start, "HH:mm"));
            var d = moment.duration(ms);
            var s = moment.utc(ms).format(":mm");

            var res;
            if (Math.floor(d.asHours()) > 24)
                res = Math.floor(duration.asHours()) + s
            else
                res = Math.floor(d.asHours()) + moment.utc(ms).format(":mm");


            if (this.timeDiff != 'undefined')
                this.timeDiff += `<li><div>` + res + `</div></li>`;
        }
    }

    removeStorage() {
        this.storage.remove('v_worker');
        localStorage.removeItem('v_worker');
        this.storage.remove('v_worker2');
        localStorage.removeItem('v_worker2');
        localStorage.removeItem('last_state2');
        this.storage.remove('last_state');
        this.storage.remove('last_state2');
        this.storage.remove('panduid');
    }

    drawComplete() {
        // will be notified of szimek/signature_pad's onEnd event
        console.log(this.signaturePad.toDataURL());
    }

    drawStart() {
        // will be notified of szimek/signature_pad's onBegin event
        console.log('begin drawing');
    }

    presentPopover(ev) {
        let modal = this.modal.create(RemarkComponent,
            {remark: this.remark},
            {
                showBackdrop: true,
                enableBackdropDismiss: false
            }
        )
        modal.onDidDismiss(data => {
            console.log("Dismiss from modal", data);
            this.remark = data;
        });
        modal.present();
    }

    showBatalPandu(index) {
        let modalBatalPandu = this.modal.create(BatalPanduComponent,
            {index: index},
            {
                showBackdrop: true,
                enableBackdropDismiss: false
            }
        )
        modalBatalPandu.onDidDismiss(data => {

            this.showButtonBatal = true;

            console.log("batal pandu dismiss", data);
            this.data["namaLokasiPanduTujuan"] = data.namaDermaga;
            this.data["kodeLokasiPanduTujuan"] = data.kodeDermaga;
            this.data["kendalaOperasional"] = data.kendalaOperasional;
            var c = data.index;

            for (let v_val in this.wizard) {
                setTimeout(() => {
                    if (c == v_val && this.wizard[c].id !== 'keluar') {
                        this.nextAction(this.wizard[c].id, c);
                        c++;
                    }
                }, 2000)
            }
        });

        modalBatalPandu.present();
    }

    showAdjustTime() {
        let modalAdjustTime = this.modal.create(AdjustTimeComponent,
            {index: ""},
            {
                showBackdrop: true,
                enableBackdropDismiss: false
            }
        )

        modalAdjustTime.onDidDismiss(data => {
            if (data) {
                this.htmlText = '';
                this.timeDiff = ''
                setTimeout(() => {
                    this.firstLoad()
                }, 1000);
            }
        });
        modalAdjustTime.present();
    }

    postTahapanBulk(nomorSpk, nomorSpkPandu, spkId) {

        let data_format = {
            "nomorSpk": nomorSpk,
            "nomorSpkPandu": nomorSpkPandu,
            "userCreated": this.profile.nipPandu,
            "progressPemanduan": []
        }

        let tanggalTahapan = JSON.parse(localStorage.getItem('v_worker2'));
        let v: string;
        for (let i in tanggalTahapan) {
            data_format.progressPemanduan.push(
                {
                    "idTahapanPandu": tanggalTahapan[i].tahapPandu,
                    "tglTahapan": tanggalTahapan[i].value,
                    "title": tanggalTahapan[i].title
                }
            )
        }

        /**
         * kirim progress bulk manual input
         * menggunakn HTTP
         */
        this.spkData.postProgressBulk(data_format);

        /**
         * kirim progress bulk manual input
         * menggunakan mqtt
         * @topic /progress/manual/pandu
         */
        // this.notification.sendMessage(JSON.stringify(data_format), '/progress/manual/pandu');

        this._sql.updateProgressRealisasi(spkId, JSON.stringify(data_format))
        this._sql.saveAddjusttimeMqttLog(this.data);
    }

    appendComponent() {

    }
}
