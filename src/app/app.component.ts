import { Component, ViewChild, enableProdMode } from '@angular/core';

import { Events, Platform, MenuController, Nav, AlertController } from 'ionic-angular';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
//import { Push, PushObject, PushOptions} from '@ionic-native/push';
import { BackgroundMode } from '@ionic-native/background-mode';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { Badge } from '@ionic-native/badge';
import { Storage } from '@ionic/storage';
import { Deploy } from '@ionic/cloud-angular';

import * as moment from 'moment';

import { TabsPage } from '../pages/tabs/tabs';

import { AccountPage } from '../pages/account/account';
import { LoginPage } from '../pages/login/login';
import { RealisasiPanduPage } from '../pages/realisasi-pandu/realisasi-pandu';
import { PerencanaanPage } from '../pages/perencanaan/perencanaan';
import { HistoryPelayananPage } from '../pages/history-pelayanan/history-pelayanan';


import { Notification } from '../providers/notification';
import { UserData } from '../providers/user-data';
import { Pnetwork } from '../providers/pnetwork';
import { LocationTracker } from '../providers/location-tracker';
//import { Config } from '../providers/config';
import { SpkData } from '../providers/spk-data';
import { SqliteServiceProvider } from '../providers/sqlite-service/sqlite-service';

import { ConfigService } from "../services/config/config.service";
import { MQTTService } from "../services/mqtt/mqtt.service";
import { Observable } from "rxjs";

import { AppConfig } from '../config/app.config';

import { Packet } from 'mqtt';


declare var cordova: any;

export interface PageInterface {
  title: string;
  component: any;
  icon: string;
  logsOut?: boolean;
  index?: number;
}

@Component({
  templateUrl: 'app.html',
  providers: [
    MQTTService,
    ConfigService,
    SqliteServiceProvider,
    SpkData
  ]
})
export class PanduApp {
  @ViewChild(Nav) nav: Nav;

  // make UsersPage the root (or first) page
  rootPage: any;
  baseUrl: string;
  amsUrl: string;
  env: "dev";

  pages: Array<{ title: string, component: any }>;
  displayName: any;
  notif: boolean = false;
  public config = {};

  appPages: PageInterface[] = [
    { title: 'Absensi', component: TabsPage, index: 0, icon: 'card' },
    { title: 'SPK Hari Ini', component: TabsPage, index: 1, icon: 'call' },
    { title: 'Rencana Hari Ini', component: PerencanaanPage, icon: 'paper' },
    { title: 'History Pelayanan', component: HistoryPelayananPage, icon: 'calendar' },
    { title: 'Map', component: TabsPage, index: 2, icon: 'globe' }
  ];
  loggedInPages: PageInterface[] = [
    { title: 'Account', component: AccountPage, icon: 'person' }
  ];
  loggedOutPages: PageInterface[] = [
    { title: 'Login', component: LoginPage, icon: 'log-in' }
  ];

  constructor(
    public events: Events,
    public platform: Platform,
    public menu: MenuController,
    public notification: Notification,
    public userData: UserData,
    public alertCtrl: AlertController,
    public storage: Storage,
    public pnetwork: Pnetwork,
    public locationTracker: LocationTracker,
    public deploy: Deploy,
    private localNotification: LocalNotifications,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private badge: Badge,
    private backgroundMode: BackgroundMode,
    private _configService: ConfigService,
    public appConfig: AppConfig,
    private _spk: SpkData,
    private _sql: SqliteServiceProvider
  ) {
    this.initializeApp();

    this.events.subscribe('notif:state', (notif) => {
      this.notif = notif[0];
      //console.log("run events notif", notif);
    })

    // decide which menu items should be hidden by current login status stored in local storage
    this.userData.hasLoggedIn().then((hasLoggedIn) => {
      this.enableMenu(hasLoggedIn === true);

      if (hasLoggedIn != true) {
        this.rootPage = LoginPage;
      } else {
        this.rootPage = TabsPage;

        this.userData.getUsername().then((username) => {
          console.log("Get Username", username);
          if (username != null)
            this.notification.init(username)
        })
      }

    });

    this.listenToLoginEvents();

  }

  initializeApp() {
    this.platform.ready().then(() => {
      console.log("device ready..")
      /**
       * load global app config
       */
      this.baseUrl = this.appConfig.apiBaseUrl;
      this.amsUrl = this.appConfig.apiBaseUrl;

      /**
       * handling by device
       */
      if (this.platform.is('android') || this.platform.is('ios')) {
        //for dark text
        //StatusBar.styleDefault();

        //for light text
        this.statusBar.styleLightContent()

        this.statusBar.overlaysWebView(false);

        this.statusBar.backgroundColorByHexString('#232838');

        this.localNotification.hasPermission().then((granted) => {
          console.log("Local Notification granted", granted)
          // if(granted == false){
          //   this.localNotification.registerPermission().then((v)=>{
          //     console.log("Local notification register permission", v)
          //   })
          // }
        }).catch((e) => {
          console.log('error', e);
        })

        this.localNotification.fireEvent('click', (notif) => {
          console.log("from notification local", notif);
          this.nav.push(RealisasiPanduPage);
          this.localNotification.clearAll();
          this.badge.clear();
          this.notification.badgeTot = "";
        })


        /**
         * [Background Mode description]
         * @param  {"Pelindo         3 Pandu"}      {title [description]
         * @param  {"Disconnected.." }} text [description]
         * @return {[type]}                [description]
         */
        this.backgroundMode.setDefaults({
          title: "Vasa Pandu",
          text: "Disconnected.."
        })
        this.backgroundMode.enable();
      } //end of check platform

      /**
       * [registerBackButtonAction description]
       * @param  {[type]} ( [description]
       * @return {[type]}   [description]
       */
      this.platform.registerBackButtonAction(() => {
        this.registerBackButtonListener();
      });

      setTimeout(() => {
        this.locationTracker.startTracking();
        setInterval(() => {
          this.locationTracker.sendLocPandu(0)
        }, 1 * 60 * 1000)
      }, 5000)

      //cek current working and send notif
      this.notifWorking()

      /**
       * handling splashscreen
       * hide when device ready
       */
      this.splashScreen.hide();
    }); //end of platform ready

    this._configService.getConfig('assets/api/config.json').then(
      config => {
        this.config = config;

        console.log("loading init config ", this.config);
      }
    );

    //store data spk to offline storage
    setTimeout(() => {
      console.log("ex store spk");
      this.storeSpk();

    }, 2000);

    this.events.subscribe('network:state', (state) => {
      if (state) {
        this.storeSpk();
        this.runPendingState()
      } else
        console.log("no connection to server");
    })
  }//end of initializeApp



  /**
   * [registerBackButtonListener description]
   * @return {[type]} [description]
   */
  registerBackButtonListener() {
    if (this.nav.canGoBack()) {
      this.nav.setRoot(this.rootPage);
    } else {
      this.confirmExitApp(this.nav);
    }
  }

  /**
   * [confirmExitApp description]
   * @param  {[type]} nav [description]
   * @return {[type]}     [description]
   */
  confirmExitApp(nav) {
    let confirm = this.alertCtrl.create({
      title: 'Confirm Exit',
      message: 'Really exit app?',
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: 'Exit',
          handler: () => {
            //nav.exitApp();
          }
        }
      ]
    });
    nav.present(confirm);
  }

  /**
   * [openPage description]
   * @param  {[type]} page [description]
   * @return {[type]}      [description]
   */
  openPage(page: PageInterface) {
    if (page.index) {
      this.nav.setRoot(page.component, { tabIndex: page.index });
    } else {
      this.nav.setRoot(page.component).catch(() => {
        console.log("Didn't set nav root");
      });
    }

  }



  public listenToLoginEvents() {
    this.events.subscribe('user:login', (username) => {
      this.enableMenu(true);
      this.notification.init(username);
    });

    this.events.subscribe('user:signup', () => {
      this.enableMenu(true);
    });

    this.events.subscribe('user:logout', () => {
      this.nav.setRoot(LoginPage);
      this.menu.swipeEnable(false);

    });
  }

  public enableMenu(loggedIn) {
    this.menu.enable(loggedIn, 'loggedInMenu');
    this.menu.enable(!loggedIn, 'loggedOutMenu');
  }

  public notifWorking() {
    this.storage.get('panduid').then(data => {
      if (data) {
        this.storage.get('notifWorking').then((v) => {
          if (v == 'false') {
            this.storage.set('notifWorking', 'true');
            this.alertCtrl.create({
              title: 'Notifikasi',
              message: `Anda memiliki pekerjaan yang belum diselesaikan<br>
                          Mohon Selesaikan Pemanduan Anda..!`,
              buttons: [{
                text: 'ok',
                handler: () => {
                  this.storage.set('notifWorking', 'false');
                }
              }],
              cssClass: "alertDanger",
              enableBackdropDismiss: false
            }).present();
            if (this.platform.is('ios') || this.platform.is('android')) {
              this.localNotification.schedule({
                title: "Pemberitahuan Pemanduan",
                text: "Anda Memiliki Pekerjaan yang Belum Diselesaikan",
                sound: 'file://assets/sound/wind.mp3',
                data: { secret: 'key' }
              })
            }
          }
        })
      }
    })
    console.log("cek notif working");
    setTimeout(() => {
      this.notifWorking();
      this.storeSpk()
    }, 10 * 60 * 1000);
  }

  public storeSpk() {
    console.log("APPCOMPONENT:storeSPK");
    let tglMulai = moment().subtract(4, 'day').format('YYYY-MM-DD');
    let tglSelesai = moment().add(1, 'day').format('YYYY-MM-DD');

    this._spk.loadRealisasi(tglMulai, tglSelesai).then(data => {

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
        this._spk.loadDetails(element.id).then((datas) => {
          this._sql.saveDetailSpkToSqlite(JSON.stringify(datas), element.id)
        })
      });

      if (data)
        this.events.publish('refresh:data', true);
    },
      err => {
        console.log("error load data spk", err);
      }).catch(errRejected => {
        console.log("catch rejected", errRejected);
      })
  }

  runPendingState() {
    this._sql.getRealisasiPending().then((data: any) => {
      for (let i in data) {
        console.log("DEBUG: Run data pending from component");
        let flow = JSON.parse(data[i].vjson);
        this._spk.realisasiPandu(flow.jenisDermaga, JSON.parse(data[i].vjson));
        this._spk.postProgressBulk(JSON.parse(data[i].progress))
        this._spk.putProgressDone(data[i].spk_id).subscribe(
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
}