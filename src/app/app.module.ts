import { NgModule, ErrorHandler, Pipe, PipeTransform } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { PanduApp } from './app.component';
import { Observable } from 'rxjs/Observable';

import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

// import { SignaturePadModule } from 'angular2-signaturepad';

/**
 * Ionic native declaration
 */
import { IonicStorageModule, Storage } from '@ionic/storage-angular';
import { Drivers } from '@ionic/storage';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { CloudSettings, CloudModule } from '@ionic/cloud-angular';
import { Badge } from '@ionic-native/badge';
import { Vibration } from '@ionic-native/vibration';
import { Network } from '@ionic-native/network';
import { BackgroundMode } from '@ionic-native/background-mode';
import { Geolocation } from '@ionic-native/geolocation';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SQLite } from '@ionic-native/sqlite';
import { SQLitePorter } from '@ionic-native/sqlite-porter';
import { Device } from '@ionic-native/device';
import { DatePicker } from '@ionic-native/date-picker';
import { Dialogs } from '@ionic-native/dialogs';

/**
 * Pages declaration
 */
import { AccountPage } from '../pages/account/account';
import { LoginPage } from '../pages/login/login';
import { AbsensiPage, MyComponent } from '../pages/absensi/absensi';
import { RealisasiPanduPage } from '../pages/realisasi-pandu/realisasi-pandu';
import { DetailSpkPage } from '../pages/detail-spk/detail-spk';
import { PemanduanPage } from '../pages/pemanduan/pemanduan';
import { SettingsPage } from '../pages/settings/settings';
import { LeafletView } from '../pages/mapview/mapview';
import { PerencanaanPage } from '../pages/perencanaan/perencanaan';
import { HistoryPelayananPage } from '../pages/history-pelayanan/history-pelayanan';
import { DetailHistoryPelayananPage } from '../pages/detail-history-pelayanan/detail-history-pelayanan';
import { HistoryRealisasiPage } from '../pages/history-realisasi/history-realisasi';
import { TabsPage } from '../pages/tabs/tabs';

/**
 * Providers declaration
 */
import { LocationTracker } from '../providers/location-tracker';
import { Notification } from '../providers/notification';
import { UserData } from '../providers/user-data';
import { Pnetwork } from '../providers/pnetwork';
//import { Config } from '../providers/config';
import { Geojson } from '../providers/geojson';

/**
 * Service declaration
 */
import {ConfigService} from "../services/config/config.service";
import {MQTTService} from "../services/mqtt/mqtt.service";

/**
 * Pipes declaration
 */
import { Idformat } from '../pipes/idformat';

import { ComponentsModule } from '../components/components.module'
import { RemarkComponentModule } from '../components/remark/remark.module';
import { AppConfig }    from '../config/app.config';
import { SqliteServiceProvider } from '../providers/sqlite-service/sqlite-service';


import {NgxMaskModule} from 'ngx-mask';
import { SpkOfflineProvider } from '../providers/spk-offline/spk-offline';


const cloudSettings: CloudSettings = {
  'core': {
    'app_id': '8d8175b5'
  },
  'push': {
    'pluginConfig': {
      'ios': {
        'badge': true,
        'sound': true
      }
    }
  }
};

@Pipe({
  name: 'sanitizeHtml'
})
export class SanitizeHtml implements PipeTransform  {

 constructor(private _sanitizer: DomSanitizer){}  

 transform(v: string) : SafeHtml {
    return this._sanitizer.bypassSecurityTrustHtml(v); 
 } 
}

@NgModule({
  declarations: [
    PanduApp,
    AccountPage,
    LoginPage,
    AbsensiPage,
    RealisasiPanduPage,
    DetailSpkPage,
    PemanduanPage,
    SettingsPage,
    LeafletView,
    PerencanaanPage,
    TabsPage,
    HistoryPelayananPage,
    DetailHistoryPelayananPage,
    HistoryRealisasiPage,
    Idformat,
    SanitizeHtml
  ],
  imports: [
    IonicModule.forRoot(PanduApp,
    {
      mode:'md',
      tabsPlacement : "top",
      tabsHighlight : "true",
      tabsLayout : "icon-hide",
      color:"primary"
    }),
    BrowserModule,
    HttpModule,
    // SignaturePadModule,
    IonicStorageModule.forRoot({
     name: '__vasaPanduDb',
     driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage]
    //  driverOrder: ['websql', 'sqlite', 'localstorage']
   }),
    CloudModule.forRoot(cloudSettings),
    NgxMaskModule,
    ComponentsModule,
    RemarkComponentModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    PanduApp,
    AccountPage,
    LoginPage,
    AbsensiPage,
    RealisasiPanduPage,
    DetailSpkPage,
    PemanduanPage,
    SettingsPage,
    LeafletView,
    PerencanaanPage,
    TabsPage,
    HistoryPelayananPage,
    DetailHistoryPelayananPage,
    HistoryRealisasiPage
  ],
  providers: [
    UserData,
    LocationTracker,
    Notification,
    Storage,
    Pnetwork,
    //Config,
    Geojson,
    LocalNotifications,
    BackgroundGeolocation,
    Badge,
    Vibration,
    Network,
    BackgroundMode,
    Geolocation,
    StatusBar,
    SplashScreen,
    MQTTService,
    ConfigService,
    AppConfig,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    SqliteServiceProvider,
    SQLite,
    SQLitePorter,
    Device,
    SpkOfflineProvider,
    DatePicker,
    Dialogs
  ]
})
export class AppModule {}
