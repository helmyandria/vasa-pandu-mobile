import { Injectable, NgZone } from '@angular/core';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { BackgroundGeolocation, BackgroundGeolocationConfig, BackgroundGeolocationResponse } from '@ionic-native/background-geolocation';
import 'rxjs/add/operator/filter';

import { Storage } from '@ionic/storage-angular';

import * as moment from 'moment';

import { Notification } from "../providers/notification";

@Injectable()
export class LocationTracker {

  public watch: any;
  public lat: number = 0;
  public lng: number = 0;
  public intMulaiPandu: any;

  constructor(
    public zone: NgZone,
    private backgroundGeolocation: BackgroundGeolocation,
    private geolocation: Geolocation,
    private notification: Notification,
    public storage: Storage
  ) {

  }

  startTracking() {
    // Background Tracking

    let config: BackgroundGeolocationConfig = {
      desiredAccuracy: 0,
      stationaryRadius: 20,
      distanceFilter: 10,
      debug: false,
      interval: 5000
    };
    this.backgroundGeolocation.configure(config)
      .then((location: BackgroundGeolocationResponse) => {

        //console.log('BackgroundGeolocation:  ' + location.latitude + ',' + location.longitude);

        // Run update inside of Angular's zone
        this.zone.run(() => {
          this.lat = location.latitude;
          this.lng = location.longitude;
        });

      }, (err) => {
        console.log(err);
      });

    // Foreground Tracking

    let options = {
      frequency: 3000,
      enableHighAccuracy: true
    };

    this.watch = this.geolocation.watchPosition(options).filter((p: any) => p.code === undefined).subscribe((position: Geoposition) => {

      //console.log("Position",position);

      // Run update inside of Angular's zone
      this.zone.run(() => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
      });

    });

    // Turn ON the background-geolocation system.
    //disable dulu
    this.backgroundGeolocation.start();
  }

  stopTracking() {
    console.log('stopTracking');

    this.backgroundGeolocation.finish();
    this.watch.unsubscribe();

  }

  public sendLocPandu(flag, noSpkPandu: number = 0) {
    var mDate = moment().format('YYYY-MM-DD[T]HH:mm:ss');
    var username = this.notification.username;

    this.storage.get('profile').then(profile => {
      if (profile != null) {
        var panduLocMsg = {
          nipPandu: username,
          namaPetugas: profile.namaPetugas,
          longitude: this.lng,
          latitude: this.lat,
          tglAktivitas: mDate,
          flag: flag,
          noSpkPandu: noSpkPandu
        };
        this.notification.sendMessage(JSON.stringify(panduLocMsg), "/pandu/location/" + username)
      }
    })

  }

  public startPanduLocation(param: boolean, noSpkPandu: number = 0) {
    if (param) {
      this.startTracking();
      this.intMulaiPandu = setInterval(() => {

        this.sendLocPandu(1, noSpkPandu);
      }, 1 * 15 * 1000)
    } else {
      console.log('clear interval pandu location');
      this.stopTracking()
      clearInterval(this.intMulaiPandu);
    }
  }

}
