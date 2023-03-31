import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions} from '@angular/http';
import {Platform} from 'ionic-angular';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import {Storage} from '@ionic/storage'

import {Spk} from '../models/spk';

import {AppConfig} from '../config/app.config';

import {Device} from '@ionic-native/device'
import 'rxjs/add/operator/timeout'

/*
  Generated class for the SpkData provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class SpkData {
  
    private sufApi = "api/mobile";
    // private sufApi = "vasa-jboss-perencanaanPandu/mobile";
    // private sufApiRealisasi = "vasa-jboss-realisasi/mobile";
    // private sufApiMdm = "vasa-jboss-mdm/mobile";
    private spkApiUrl = "";
    private deviceId;

    constructor(
        public http: Http,
        public appConfig: AppConfig,
        public storage: Storage,
        private device: Device,
        private platform: Platform
    ) {
        this.spkApiUrl = this.appConfig.apiBaseUrl + this.sufApi;

        if (this.platform.is('android') || this.platform.is('ios'))
            this.deviceId = this.device.uuid;
        else
            this.deviceId = "BrowserDev";
    }

    /**
     *  GET SPK data by Notification
     */
    // Load SPK data by Notification
    load(): Observable<Spk[]> {
        var headers = new Headers();
        var notifId = localStorage.getItem('notif_spk_id');
        return this.http.get(`${this.appConfig.apiBaseUrl}/${this.sufApi}/surat_perintah_kerja_pandu/${notifId}`, {headers: headers})
            .map(res => <Spk[]>res.json())
            .catch(this.handleError);
    }

    /**
     * load detail spk by id
     *
     * @param id
     */
    // Get Spk by providing spk id
    loadDetails(id: string): Promise<Spk> {
        return this.http.get(`${this.appConfig.apiBaseUrl}/${this.sufApi}/surat_perintah_kerja_pandu/${id}`)
            .map(res => <Spk>(res.json()))
            .toPromise()
    }

    /**
     * load realisasi by tglMulai & tglSelesai
     *
     * @param tglMulai
     * @param tglSelesai
     */
    loadRealisasi(tglMulai: string, tglSelesai: string): Promise<any> {
        var headers = new Headers();
        var username = localStorage.getItem('username');

        console.log(`${this.appConfig.apiBaseUrl}/${this.sufApi}/progress_spk/username/${username}?tglMulai=${tglMulai}&tglSelesai=${tglSelesai}&jenisJasa=pandu&status=OHN`);
        return this.http.get(`${this.appConfig.apiBaseUrl}/${this.sufApi}/progress_spk/username/${username}?tglMulai=${tglMulai}&tglSelesai=${tglSelesai}&jenisJasa=pandu&status=OHN`, {headers: headers})
            .timeout(10000000)
            .map(res => res.json())
            .toPromise()
    }

    /**
     * Load history realisasi by date
     *
     * @param tglMulai
     * @param tglSelesai
     */
    loadHistoryRealisasi(tglMulai: string, tglSelesai: string): Observable<Spk[]> {
        var headers = new Headers();
        var username = localStorage.getItem('username');

        return this.http.get(`${this.appConfig.apiBaseUrl}/${this.sufApi}/progress_spk/username/${username}?tglMulai=${tglMulai}&tglSelesai=${tglSelesai}&jenisJasa=pandu&flagDone=2`, {headers: headers})
            .map(res => <Spk[]>res.json())
            .catch(this.handleError);
    }

    /**
     * Load history realisasi by nomor SPK (pandu, tunda, tambat)
     *
     * @param noSpk
     */
    loadHistorySpk(noSpk: any): Observable<any> {
        var headers = new Headers();
        console.log(`${this.appConfig.apiBaseUrl}/${this.sufApi}/progress_spk/nomor_spk/${noSpk}`);
        return this.http.get(`${this.appConfig.apiBaseUrl}/${this.sufApi}/progress_spk/nomor_spk/${noSpk}`, {headers: headers})
            .map(res => <Spk[]>res.json())
            .catch(this.handleError)
    }

    /**
     *
     * @param idTahapanPandu
     * @param nomorSpk
     */
    postProgress(idTahapanPandu, nomorSpk, nomorSpkPandu, tglTahapan) {
        let body = JSON.stringify({
            idTahapanPandu: idTahapanPandu,
            nomorSpk: nomorSpk,
            nomorSpkPandu: nomorSpkPandu,
            tglTahapan: tglTahapan
        });
        console.log("post progress", body)
        let url = `${this.appConfig.apiBaseUrl}/${this.sufApi}/progress_spk`;
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});

        return this.http.post(url, body, options)
            .map(res => res.json())
            .subscribe(
                data => {
                    console.log("Response", data);
                },
                err => {
                    console.log("ERROR!: ", err);
                }
            )
    }

    /**
     * Kirim progress tahapan pandu dengan manual input
     * @param progress data
     */
    postProgressBulk(progress) {
        let body = JSON.stringify(progress);
        console.log("post progress", body)
        let url = `${this.appConfig.apiBaseUrl}/${this.sufApi}/progress_spk/bulk`;
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});

        return this.http.post(url, body, options)
            .map(res => res.json())
            .subscribe(
                data => {
                    console.log("Response", data);
                },
                err => {
                    console.log("ERROR!: ", err);
                }
            )
    }

    /**
     * Put Progress by idspk
     * @param id
     */
    putProgressDone(id) {

        let url = `${this.appConfig.apiBaseUrl}/${this.sufApi}/progress_spk/spk_pandu/${id}/set_as_done`;
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});

        console.debug("DEBUG -> putProgressDone", url);
        return this.http
            .put(url, JSON.stringify(id), {headers: headers})
            .map(res => res)
    }

    handleError(error) {
        return Observable.throw(error.json().error || 'Server error');
    }


    /**
     * Realisasi pandu tambat tunda
     *
     * @param kondisiFlow
     * @param data
     */
    realisasiPandu(kondisiFlow, data) {
        let body = JSON.stringify(data);
        // let url = `${this.appConfig.apiBaseUrl}/${this.sufApi}/realisasi/rea_tambat_pandu_tunda`;
        let url = `${this.appConfig.apiBaseUrl}/${this.sufApi}/progress_spk/rea_tambat_pandu_tunda`;
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});

        if (kondisiFlow == 1 || kondisiFlow == 2 || kondisiFlow == 4) {
            url = `${this.appConfig.apiBaseUrl}/${this.sufApi}/realisasi/rea_tambat_pandu_tunda`;
            // url = `${this.appConfig.apiBaseUrl}/${this.sufApi}/progress_spk/rea_tambat_pandu_tunda`;
        } else if (kondisiFlow == 3) {
            url = `${this.appConfig.apiBaseUrl}/${this.sufApi}/realisasi/rea_pandu`;
            // url = `${this.appConfig.apiBaseUrl}/${this.sufApiRealisasi}/realisasi/rea_pandu`;
        } else {
            url = `${this.appConfig.apiBaseUrl}/${this.sufApi}/realisasi/rea_pandu_tunda`;
            // url = `${this.appConfig.apiBaseUrl}/${this.sufApiRealisasi}/realisasi/rea_pandu_tunda`;
        }
        console.debug("REALISASI DENGAN FLOW", kondisiFlow, url, body)
        return this.http.post(url, body, options)
            .map(res => res.json())
            .subscribe(
                data => {
                    console.log("Response", data);
                },
                err => {
                    console.log("ERROR!: ", err);
                }
            )
    }

    searchMdmDermaga(namaDermaga): Observable<any> {
        var headers = new Headers();
        var cabang = localStorage.getItem('kodecabang');

        console.log(`${this.appConfig.apiBaseUrl}/${this.sufApi}/mdm_dermaga/search?nama=${namaDermaga}&kodeCabang=${cabang}&limit=20`);
        // console.log(`${this.appConfig.apiBaseUrl}/${this.sufApiMdm}/mdm_dermaga/search?nama=${namaDermaga}&kodeCabang=${cabang}&limit=20`);

        return this.http.get(`${this.appConfig.apiBaseUrl}/${this.sufApi}/mdm_dermaga/search?nama=${namaDermaga}&kodeCabang=${cabang}&limit=20`, {headers:headers})
        // return this.http.get(`${this.appConfig.apiBaseUrl}/${this.sufApiMdm}/mdm_dermaga/search?nama=${namaDermaga}&kodeCabang=${cabang}&limit=20`, {headers: headers})
            .map(res => <Spk[]>res.json())
            .catch(this.handleError);
    }

    /**
     *
     * @param logBatal data
     */
    postLogPembatalanSpkPandu(logBatal) {
        let body = JSON.stringify(logBatal);
        console.log("post progress", body)
        let url = `${this.appConfig.apiBaseUrl}/${this.sufApi}/log_pembatalan_spk_pandu`;
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});

        return this.http.post(url, body, options)
            .map(res => res.json())
            .subscribe(
                data => {
                    console.log("Response", data);
                },
                err => {
                    console.log("ERROR!: ", err);
                }
            )
    }

    /**
     * Put Tolak SPK by noPpkJasa
     * @param noPpkJasa
     */
    putTolakSpk(noPpkJasa) {
        console.debug("putTolakSpk");

        let url = `${this.appConfig.apiBaseUrl}/${this.sufApi}/surat_perintah_kerja_pandu/tolak_spk/${noPpkJasa}`;
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});

        console.debug("DEBUG -> putTolakSpk", url);
        return this.http
            .put(url, JSON.stringify(noPpkJasa), {headers: headers})
            .map(res => res)
    }

}

//