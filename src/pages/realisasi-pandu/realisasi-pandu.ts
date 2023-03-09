import {Component, ViewChild, NgZone} from '@angular/core';
import {
    Events,
    NavController,
    LoadingController,
    AlertController,
    ToastController,
    Content,
    Platform,
    Refresher,
    NavParams
} from 'ionic-angular';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import "rxjs/Rx";
import {Storage} from '@ionic/storage-angular'
import {Badge} from '@ionic-native/badge';
import {SQLite} from '@ionic-native/sqlite';
import {Device} from '@ionic-native/device';
import * as moment from 'moment';

import {DetailSpkPage} from '../detail-spk/detail-spk';

import {Pnetwork} from '../../providers/pnetwork';
import {SqliteServiceProvider} from '../../providers/sqlite-service/sqlite-service';
import {SpkData} from '../../providers/spk-data';
import {SpkOfflineProvider} from '../../providers/spk-offline/spk-offline';
import {setInterval, clearInterval} from 'timers';
import {resolve} from 'url';

import {AppConfig} from '../../config/app.config';
import {Spk} from '../../models/spk';

@Component({
    selector: 'page-realisasi-pandu',
    templateUrl: 'realisasi-pandu.html',
    providers: [SpkData]
})
export class RealisasiPanduPage {
    @ViewChild(Content) content: Content;
    public spk = [];
    public datas = [];
    public profile: any = [];
    public loader;
    public badge_state: string;
    public classCondition = false;
    public DataArray: Array<Object>;
    public database: SQLite
    private condNetwork: boolean = true;
    private tglMulai: string = moment().subtract(5, 'day').format('YYYY-MM-DD');
    private tglSelesai: string = moment().add(1, 'day').format('YYYY-MM-DD');
    private panduid_flag;
    private kapalTunda = [];
    private user: Observable<{}>;
    private flagStatusDone;
    private deviceid;
    private t_timer: any;
    private objData = [];

    constructor(
        public navCtrl: NavController,
        public loadingCtrl: LoadingController,
        public pnetwork: Pnetwork,
        public storage: Storage,
        public events: Events,
        public alertCtrl: AlertController,
        private toastCtrl: ToastController,
        private spkData: SpkData,
        private badge: Badge,
        public _sql: SqliteServiceProvider,
        private sqlite: SQLite,
        private platform: Platform,
        private params: NavParams,
        private device: Device,
        public appConfig: AppConfig,
        private spkOffline: SpkOfflineProvider
    ) {
        this.pnetwork.listenNetworkEvents()
        this.kapalTunda = params.get('tundas');
        this.platform.ready().then(() => {
            this.storage.get('panduid').then(panduid => {
                this.panduid_flag = panduid;
            })
            //handling using sqlite on device
            if (this.platform.is('ios') || this.platform.is('android')) {
                this.deviceid = this.device.uuid;
                console.log("getting from android or ios", this.datas);
            } else {
                this.deviceid = "BrowserDev";
            }

            /**
             * get online data
             * ketika refresh manual / pull down
             */
            this.events.subscribe('refresh:data', (state) => {
                if (state)
                    this.getOnlineData()
            })

            /**
             * sync online data
             * ketika ada event network connected
             */
            this.events.subscribe('network:state', state => {
                setTimeout(() => {
                    if (state)
                        this.getOnlineData()
                }, 10 * 1000);
            })

        })
    }

    ngOnInit() {
        /**
         * subscribe data from observable subject
         * disini object packageData akan selalu diupdate oleh offline method
         */

        this.spkOffline.packageData.subscribe((data) => {
            this.datas = data;
        })

        setInterval(() => {
            this.spkOffline.getMyOfflineData(this.tglMulai, this.tglSelesai)
        }, 10000)
    }

    /**
     * Loading present
     */
    loadingPressent() {
        this.loader = this.loadingCtrl.create({
            content: "Please wait..."
        });
        this.loader.onWillDismiss((data) => {
            console.log("dismiss", data);
        })
    }

    /**
     * load every enter page
     */
    ionViewDidEnter() {
        this.badge.clear();
        this.badge.set(0);
        this.runPendingState()
        this.loadData()

        /**
         * cek interval data setiap masuk
         * page realisasi
         */
        // this.cekDataInterval()      
    }

    ionViewWillLeave() {
        /**
         * clear interval data
         * setiap keluar page realisasi
         */
        // clearInterval(this.t_timer)
    }

    /**
     * monitoring network
     */
    networkCondition() {
        this.events.subscribe("network:state", (state) => {
            this.condNetwork = state;
        });
    }

    /**
     * First load page
     *
     * do networkCondition
     * do loadData
     * do save badgeState to panduid key
     */
    ionViewDidLoad() {
        this.networkCondition();

        this.events.publish('notif:state', false);
        //set notification 0/clear
        this.events.publish('notif:mqttbadge', 0);

        this.storage.get('panduid').then(panduid => {
            this.badge_state = panduid;
        })

        // this.loadData()

    }

    /**
     * Open Detail Realisasi
     *
     * @param pageid
     */
    openDetail(pageid, index, status, msg_state) {
        let loading2 = this.loadingCtrl.create({
            content: 'Please wait...'
        });

        console.log('opendetail', pageid, this.datas[index]);
        this.loadingPressent();

        this._sql.getDetailSpkOfflineData(pageid).then((datas) => {
                this.navCtrl.push(DetailSpkPage,
                    {
                        id: pageid,
                        datas: datas['vjson'],
                        tundas: this.datas[index].listKapalTunda,
                        status: status,
                        msg_state: msg_state
                    }
                )

                this.loader.dismiss()
            },
            (error) => {
                console.log("Error detail spk", error)
                this.loader.dismiss();
            })
            .catch(err => {
                console.log("Error detail spk", err)
                this.toastCtrl.create({
                    message: 'ERROR : Tidak dapat menemukan detail SPK',
                    duration: 5000,
                    position: 'bottom'
                }).present();
                this.loader.dismiss();
            });
    }

    /**
     * Load Data realisasi
     *
     * @param tglMulai, tglSelesai
     */
    loadData() {
        /**
         * show loading
         */
        this.loadingPressent();

        /**
         * first get online data
         *
         */
        this.getOnlineData()

        /**
         * get offline data from db
         */
        // this.getMyOfflineData();
        this.spkOffline.getMyOfflineData(this.tglMulai, this.tglSelesai)


    }//end of loadData

    /**
     * Refresh event
     *
     * @param refresher
     */
    doRefresh(refresher: Refresher) {
        this.getOnlineData().then(() => {
            refresher.complete();
            console.log("DEBUG: refresh complete", true);
        }, err => {
            refresher.complete();
            console.log("DEBUG: refresh complete", false);
        })
    }

    /**
     * Offline data from sqlite
     *
     */
    getMyOfflineData() {
        this.datas = [];
        this._sql.getSpkOfflineData(this.tglMulai, this.tglSelesai).then((data: any) => {
            /**
             * push to datas object
             * variable datas pada directive realisasi-pandu.html
             * mengacu pada index array disini.
             */
                // console.log("getting offline data from db",data);

            let v_offline = [];
            for (let i in data) {
                // console.log(data);
                this.datas.push([
                    {'data': JSON.parse(data[i]['vjson'])},
                    {'spk_id': data[i]['spk_id']},
                    {'status': data[i]['status']},
                    {'msg_state': data[i]['msg_state']}
                ]);
            }

            // console.log("Data offline", this.datas);

        });
    }

    /**
     * Online data from server
     *
     */
    getOnlineData(): Promise<any> {
        console.log('load from online data');
        return new Promise<void>((resolve, reject) => {
            this.spkData.loadRealisasi(this.tglMulai, this.tglSelesai).then(data => {
                    // this.datas = data;
                    this.loader.dismiss();

                    /**
                     * save spk to db
                     */
                    this._sql.saveSpkToSqlite(data).then((cb) => {
                        console.log("call back", cb);
                    })

                    /**
                     * save detail spk to db
                     */
                    data.forEach(element => {
                        // console.log("id element",element.id);
                        this.spkData.loadDetails(element.id).then((datas) => {
                            this._sql.saveDetailSpkToSqlite(JSON.stringify(datas), element.id)
                        })
                    });

                    /**
                     * default data
                     */
                    // this.getMyOfflineData()
                    this.spkOffline.getMyOfflineData(this.tglMulai, this.tglSelesai)


                    if (this.t_timer) {
                        console.log("clear value timer", this.t_timer._id)
                        clearInterval(this.t_timer)
                    }
                    resolve();
                },
                err => {
                    console.log("online error load data spk", err);
                    this.loader.dismiss();
                    this.spkOffline.getMyOfflineData(this.tglMulai, this.tglSelesai)
                    resolve();
                }).catch(errRejected => {
                console.log("catch rejected", errRejected);
                this.spkOffline.getMyOfflineData(this.tglMulai, this.tglSelesai)

                this.loader.dismiss()
                resolve();
            })
        });
    }

    /**
     * Cek data online
     * setiap 10 menit
     *
     */
    cekDataInterval() {
        this.t_timer = setInterval(() => {
            this.getOnlineData()
            this.runPendingState()
            console.log("new val timer", this.t_timer);
        }, 1 * 60 * 1000)
    }

    runPendingState() {
        this._sql.getRealisasiPending().then((data: any) => {
            for (let i in data) {
                console.log("DEBUG: Run data pending from realisasi", i);
                let flow = JSON.parse(data[i].vjson);
                this.spkData.realisasiPandu(flow.jenisDermaga, JSON.parse(data[i].vjson));
                this.spkData.postProgressBulk(JSON.parse(data[i].progress))
                this.spkData.putProgressDone(data[i].spk_id).subscribe(
                    resp => {
                        console.log("Progress done", resp);
                        if (resp.status == 200) {
                            this._sql.updateRealisasiLog(data[i].spk_id);
                            this.events.publish('refresh:data', true);
                        }
                    }
                )
            }
        })
    }

    /**
     * Untuk repair data realisasi
     * yang status created di lokal tapi
     * flag done dari server masih 1
     *
     */
    repairRealisasiData() {

    }

    sendPanduRealization() {
        console.log("COBA DEBUG REALISASI: online");
        //console.log("data :",this.datas);

        for (let data of this.datas) {
            console.log("data a:", data);

            if ((data[3]['msg_state'] == 'P' && data[2]['status'] == 2) || (data[3]['msg_state'] == 'D' && data[2]['status'] == 2)) {
                let data_sign;
                this._sql.getRealisasiMqttLogOffline(data[0].data.id).then(dataRealisasi => {
                    data_sign = JSON.parse(dataRealisasi['vjson']);
                    console.log("dataRealisasi: ", dataRealisasi);
                    console.log("data_sign : ", data_sign);
                    //console.log("sign : ",data_sign.sign);

                    let data_format = {
                        "remark": "",
                        "asalDermaga": 0,
                        "catatan": "",
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
                        "sign": "",
                        "msgId": data.id
                    }

                    if (data_sign.sign == 'undefined' || data_sign.sign == null)
                        data_format.sign = ""
                    else
                        data_format.sign = data_sign.sign

                    for (let i in data_format) {
                        data[i] = data_format[i];
                    }

                    console.log("data sa:", data);
                    console.log("data_sign : ", data_sign);
                    console.log("jenis dermaga :", data[0].data.jenisDermaga);

                    if (this.pnetwork.network_state) {
                        this.spkData.realisasiPandu(data[0].data.jenisDermaga, data_sign);

                        this.realisasiAction("C", data_sign);
                    } else {
                        this.realisasiAction("P", data_sign);
                    }
                });
            }
        }
    }

    realisasiAction(state: string, data) {
        //console.log("COBA DEBUG REALISASI ACTION: online");
        console.log("realisasiAction data:", data);
        this._sql.saveRealisasiToSqlite(data).then(() => {
            this._sql.saveRealisasiMqttLog(data, state).then(() => {
                /**
                 * Jika menggunakan offline data
                 */
                this._sql.updateSpkStatus(data.id, state);
            })
        })

        /**
         * kriim tahapan pandu manual
         *
         */
        this.postTahapanBulk(data.nomorSpk, data.nomorSpkPandu, data.id, data)
    }

    postTahapanBulk(nomorSpk, nomorSpkPandu, spkId, data) {
        let sum_el;
        sum_el = document.querySelectorAll('.tahapanPandu');
        let data_format = {
            "nomorSpk": nomorSpk,
            "nomorSpkPandu": nomorSpkPandu,
            "userCreated": this.profile.nipPandu,
            "progressPemanduan": []
        }

        // console.log("Total element", sum_el);
        for (let idx = 0; idx < sum_el.length; idx++) {
            let id = document.querySelectorAll('.tahapanPandu')[idx].getAttribute('data')
            // let val:any = document.querySelectorAll('.tahapanPandu').value
            let val: string = (document.querySelectorAll('.tahapanPandu')[idx] as HTMLInputElement).value;
            let title = document.querySelectorAll('.tahapanPandu')[idx].getAttribute('title')

            data_format.progressPemanduan.push(
                {
                    "idTahapanPandu": id,
                    "tglTahapan": moment().format('YYYY-MM-DD[T]') + val,
                    "title": title
                }
            )
        }

        /**
         * kirim progress bulk manual input
         * menggunakn HTTP
         */
        console.log("postProgressBulk data:", data);
        this.spkData.postProgressBulk(data_format);

        /**
         * kirim progress bulk manual input
         * menggunakan mqtt
         * @topic /progress/manual/pandu
         */
        // this.notification.sendMessage(JSON.stringify(data_format), '/progress/manual/pandu');
        this._sql.updateProgressRealisasi(spkId, JSON.stringify(data_format))
        this._sql.saveAddjusttimeMqttLog(data);
    }

}
