import {Injectable} from '@angular/core';

import {Events, AlertController} from 'ionic-angular';
import {Storage} from '@ionic/storage';
import {Http, Headers, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import {MQTTService} from '../services/mqtt';

import {AppConfig} from '../config/app.config';

@Injectable()
export class UserData {
    _favorites = [];
    HAS_LOGGED_IN = 'hasLoggedIn';
    public s_username: any;
    public s_password: any;
    private sufApi = "api/mobile";
    // private sufApi = "vasa-jboss-perencanaanPandu/mobile";
    private spkApiUrl = "";

    constructor(
        public events: Events,
        public storage: Storage,
        private http: Http,
        public alertCtrl: AlertController,
        public _mqttService: MQTTService,
        public appConfig: AppConfig
    ) {
        this.spkApiUrl = this.appConfig.apiBaseUrl + this.sufApi;
    }

    hasFavorite(sessionName) {
        return (this._favorites.indexOf(sessionName) > -1);
    }

    addFavorite(sessionName) {
        this._favorites.push(sessionName);
    }

    removeFavorite(sessionName) {
        let index = this._favorites.indexOf(sessionName);
        if (index > -1) {
            this._favorites.splice(index, 1);
        }
    }

    login(username, password) {

        let body = JSON.stringify({
            "username": username,
            "password": password
        });
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});

        return this.http.post(`${this.appConfig.apiBaseUrl}/api/auth/login`, body, options)
        // return this.http.post(`${this.appConfig.apiBaseUrl}/vasa-jboss-auth/auth/login`, body, options)
            .map(res =>
                //console.log("Response headers",res.headers);
                res.json()
            )
            .subscribe(
                data => {
                    localStorage.setItem('kodeterminal', data.kdterminal);
                    localStorage.setItem('kodecabang', data.kdcabang);
                    localStorage.setItem('x-token', data.sandi);

                    if (data.responType == "E-002") {
                        this.events.publish('user:erroruser', data.responText);
                        let alert = this.alertCtrl.create({
                            title: 'Login Error..',
                            message: data.responText,
                            buttons: ['Dismiss']
                        });
                        alert.present();
                    } else if (data.responType == "S") {
                        var portalProfile = data;
                        this.getProfile(username).then(data => {
                            this.storage.set('profile', data);
                            this.storage.set('portalProfile', portalProfile);
                            this.events.publish('user:successlogin', data.responText);
                            this.setUsername(username);
                            this.events.publish('user:login', username);
                            this.storage.set(this.HAS_LOGGED_IN, true);
                        }).catch(err => {
                            let alert = this.alertCtrl.create({
                                title: 'Login Error..',
                                message: "Profile tidak tersedia",
                                buttons: ['Dismiss']
                            });
                            alert.present();
                        })
                    } else {
                        let alert = this.alertCtrl.create({
                            title: 'Login Error..',
                            message: data.responText,
                            buttons: ['Dismiss']
                        });
                        alert.present();
                    }
                },
                err => {
                    let alert = this.alertCtrl.create({
                        title: 'Login Error..',
                        message: err,
                        buttons: ['Dismiss']
                    });
                    alert.present();
                }
            )

    }

    signup(username) {
        this.storage.set(this.HAS_LOGGED_IN, true);
        this.setUsername(username);
        this.events.publish('user:signup');
    }

    logout() {
        this.storage.remove(this.HAS_LOGGED_IN);
        this.storage.remove('username');
        this.storage.remove('profile');
        this.storage.remove('network_status');
        this.storage.remove('notif_spk');
        this.storage.remove('portalProfile');
        ;
        this.storage.remove('panduid');
        this.storage.remove('notifWorking');
        this.storage.remove('last_state');
        this.storage.remove('last_state2');
        this.storage.remove('hasLoggedIn');
        this.storage.remove('v_worker2');
        localStorage.clear();
        this._mqttService.disconnect();
        this.events.publish('user:logout');
    }

    setUsername(username) {
        this.storage.set('username', username);
        localStorage.setItem("username", username)
    }

    getUsername() {
        return this.storage.get('username').then((username) => {
            this.s_username = username;
            return username;
        })
    }

    // return a promise
    hasLoggedIn() {
        return this.storage.get(this.HAS_LOGGED_IN).then((value) => {
            return value;
        });
    }

    getProfile(username): Promise<any> {
        var headers = new Headers();

        return this.http.get(`${this.appConfig.apiBaseUrl}/${this.sufApi}/petugas_pandu/profile/${username}`, {headers: headers})
            .map(res => res.json())
            .toPromise();
    }

    absenMasuk(username): Promise<any> {
        let body = JSON.stringify({
            "kodeCabang": localStorage.getItem('kodeterminal'),
            "username": username
        });
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});
        console.log(`${this.appConfig.apiBaseUrl}/${this.sufApi}/petugas_pandu/absen_masuk`);
        return this.http.post(`${this.appConfig.apiBaseUrl}/${this.sufApi}/petugas_pandu/absen_masuk`, body, options)
            .map(res => res.json()).toPromise();
    }

    absenOff(username, alasanOff): Promise<any> {
        let body = JSON.stringify({
            "kodeCabang": localStorage.getItem('kodeterminal'),
            "username": username,
            "alasanOff": alasanOff
        });
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});
        console.log(`${this.appConfig.apiBaseUrl}/${this.sufApi}/petugas_pandu/absen_pulang`);
        return this.http.post(`${this.appConfig.apiBaseUrl}/${this.sufApi}/petugas_pandu/absen_pulang`, body, options)
            .map(res =>
                //console.log("Response headers",res.headers);
                res.json()
            ).toPromise()
    }

    getAbsen(username) {
        var headers = new Headers();

        return this.http.get(`${this.appConfig.apiBaseUrl}/${this.sufApi}/petugas_pandu/status_absen/${username}`, {headers: headers})
            .map(res => res.json())
            .toPromise()
    }

    getAbsenPanduMyIntan(nip) {
        var headers = new Headers();
        var nip = nip;
        console.log(`${this.appConfig.apiBaseUrl}/api/public/absensi_pandu/getAbsensiPanduIfExist?nip=${nip}`);
        return this.http.get(`${this.appConfig.apiBaseUrl}/api/public/absensi_pandu/getAbsensiPanduIfExist?nip=${nip}`, {headers:headers})
        // console.log(`${this.appConfig.apiBaseUrl}/vasa-jboss-perencanaanPandu/public/absensi_pandu/getAbsensiPanduIfExist?nip=${nip}`);
        // return this.http.get(`${this.appConfig.apiBaseUrl}/vasa-jboss-perencanaanPandu/public/absensi_pandu/getAbsensiPanduIfExist?nip=${nip}`, {headers: headers})
            .map(res => res.json())
            .toPromise()
    }

    putKesediaanPanduOn(id) {
        let body = JSON.stringify(id);
        let url = `${this.appConfig.apiBaseUrl}/api/public/absensi_pandu/kesediaan_on/${id}`;
        // let url = `${this.appConfig.apiBaseUrl}/vasa-jboss-perencanaanPandu/public/absensi_pandu/kesediaan_on/${id}`;
        let headers = new Headers({'Content-Type': 'application/json'});

        console.debug("DEBUG -> putKesediaanPanduOn", url, body);
        return this.http
            .put(url, body, {headers: headers})
            .map(res => res)
            .toPromise()
    }

    putKesediaanPanduOff(id) {
        let body = JSON.stringify(id);
        let url = `${this.appConfig.apiBaseUrl}/api/public/absensi_pandu/kesediaan_off/${id}`;
        // let url = `${this.appConfig.apiBaseUrl}/vasa-jboss-perencanaanPandu/public/absensi_pandu/kesediaan_off/${id}`;
        let headers = new Headers({'Content-Type': 'application/json'});

        console.debug("DEBUG -> putKesediaanPanduOff", url, body);
        return this.http
            .put(url, body, {headers: headers})
            .map(res => res)
            .toPromise()
    }

    getListPetugasPandu(username): Promise<any> {
        var headers = new Headers();

        return this.http.get(`${this.appConfig.apiBaseUrl}/${this.sufApi}/petugas_pandu/list_absen_today/${username}`, {headers: headers})
            .map(res => res.json())
            .toPromise();
    }

    getJadwalShiftGroupPandu(username): Promise<any> {
        var headers = new Headers();

        return this.http.get(`${this.appConfig.apiBaseUrl}/${this.sufApi}/petugas_pandu/jadwal_shift_group_pandu/${username}`, {headers: headers})
            .map(res => res.json())
            .toPromise();
    }

}
