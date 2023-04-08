import { Component } from '@angular/core';
import { IonicPage, NavController, ModalController, LoadingController, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage-angular';
import * as moment from 'moment';
import 'moment/src/locale/id';

import { ListPetugasPanduComponent } from '../../components/list-petugas-pandu/list-petugas-pandu';

import { AbsensiData } from '../../providers/absensi-data';
import { UserData } from '../../providers/user-data';
import { Pnetwork } from '../../providers/pnetwork';
import { setTimeout } from 'timers';

import { DatePicker } from '@ionic-native/date-picker';
/*
  Generated class for the Absensi page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/

@Component({
  selector: 'my-component',
  template: `I'm a direct child of body <br>`,
})
export class MyComponent { }


@Component({
  selector: 'page-absensi',
  templateUrl: 'absensi.html',
  providers:[UserData, AbsensiData]
})
export class AbsensiPage {
  mulaiTglAbsen : string;
  mulaiJamAbsen : string;
  akhirTglAbsen : string;
  akhirJamAbsen : string;
  absenStatus : string;
  ketAvaiAbsen : string;
  ketUnavaiAbsen : string;
  ketSilahkanAbsen : string;
  ketShift : string;
  now:any;
  username: string;
  
  public fullname: string;
  public email : string;
  public hp : string;
  public photo : string;
  public btnAbsenOn: boolean;
  public btnAbsenOff: boolean;

  public portalProfile = {};
  public loader;
  public alert;

  dataPetugas = [];

  public selectOptions;

  constructor(
    public navCtrl: NavController, 
    public userData:UserData,
    public absensiData:AbsensiData,
    public storage: Storage,
    public modal: ModalController,
    public loading: LoadingController,
    public alertCtrl: AlertController,
    public pnetwork: Pnetwork,
    private datePicker: DatePicker
  ) {
    moment.locale('id');
  }

  // ionViewDidLoad() {
  //   console.log('Hello AbsensiPage Page');
  //   let cekAbsen = JSON.parse(localStorage.getItem('mulaiAbsen'));
    
  //   console.log("DEBUG: Waiting network condition");
  //   setTimeout( ()=>{
  //     this.pnetwork.monConnection()
  //     console.log("DEBUG:","isConnect:", this.pnetwork.connectSub, "isDisconnect:",this.pnetwork.disconnectSub);
  //   },5000);

  //   this.storage.get('profile').then( (profile) => {
  //     console.log("Profile Petugas Pandu", profile);

  //     this.fullname = profile.namaPetugas;
  //     this.email = profile.emailPetugas;
  //     this.hp = profile.hp;
  //     this.photo = profile.photo;
  //     this.username = profile.username;

  //     this.userData.getAbsen(profile.username).then(data => {
  //       console.log(data);
  //       if(data.statusKesediaan == "1"){
  //         this.btnAbsenOn = true;
  //         this.btnAbsenOff = false;
          
  //         this.mulaiJamAbsen = cekAbsen['mulaiJamAbsen'];
  //         this.mulaiTglAbsen = cekAbsen['mulaiTglAbsen'];
  //       }else{
  //         this.btnAbsenOn = false;
  //         this.btnAbsenOff = true;
  //       }
        
  //       this.absenStatus = cekAbsen['absenStatus'];
  //     }, err => {
  //       console.log("error", err)
  //     }).catch(err =>{
  //       console.log("Error getting absen", err);
  //     })
  //   })

  //   this.storage.get('portalProfile').then(portalPorfile => {
  //     this.portalProfile = portalPorfile
  //   })
  // }

  ionViewDidEnter() {
    this.storage.get('jadwalGroupPandu').then((jadwalGroupPandu) => {
      console.log("Jadwal Group Pandu Storage",jadwalGroupPandu);

      this.ketShift = jadwalGroupPandu;
    })

    this.storage.get('listPetugasPandu').then((listPetugasPandu) => {
      console.log("List Petugas Pandu Storage",listPetugasPandu);
      if (listPetugasPandu != null) {
        for (var i of listPetugasPandu) {
          let groupName = i.namaPetugas+" "+i.kode;
          i.groupName = groupName;
          this.dataPetugas.push(i);
        }
      }
    })
  }

  ionViewDidLoad() {
    console.log('Hello AbsensiPage Page');
    
    console.log("DEBUG: Waiting network condition");
    setTimeout( ()=>{
      this.pnetwork.monConnection()
      console.log("DEBUG:","isConnect:", this.pnetwork.connectSub, "isDisconnect:",this.pnetwork.disconnectSub);
    },5000);

    this.storage.get('portalProfile').then(portalPorfile => {
      this.portalProfile = portalPorfile
    })

    this.storage.get('profile').then( (profile) => {
      console.log("Profile Petugas Pandu", profile);

      this.fullname = profile.namaPetugas;
      this.email = profile.emailPetugas;
      this.hp = profile.hp;
      this.photo = profile.photo;
      this.username = profile.username;

      this.userData.getAbsenPanduMyIntan(this.username).then((data)=> {
        console.log(data);
        this.absenStatus = "ON";
        console.log("Absen");

        this.mulaiJamAbsen = moment(data.tglMasuk).format('YYYY-MM-DD');
        this.mulaiTglAbsen = moment(data.tglMasuk).format('YYYY-MM-DD');

        this.mulaiTglAbsen = moment(data.tglMasuk).locale('id').format('dddd, LL');
        this.mulaiJamAbsen = moment(data.tglMasuk).locale('id').format('hh:mm:ss');
    
        this.akhirTglAbsen = moment(data.tglKeluar).locale('id').format('dddd, LL');
        this.akhirJamAbsen = moment(data.tgKeluar).locale('id').format('hh:mm:ss');
    
        let va = {
          'idAbsensiMyPelindo':data.id,
          'status':true, 
          'time':this.now,
          'mulaiTglAbsen':data.tglMasuk,
          'selesaiTglAbsen':data.tglKeluar,
          'absenStatus':'ON'
        }
        localStorage.setItem('absensiPanduMyPelindo', JSON.stringify(va));

        localStorage.setItem('kesediaan', data.kesediaan);

        if (data.kesediaan === 1) {
          console.log("Yes");
          this.ketSilahkanAbsen = '';
          this.ketAvaiAbsen = 'AVAILABLE SPK';
          this.ketUnavaiAbsen = '';
          this.btnAbsenOn = true;
          this.btnAbsenOff = false;
        } else {
          console.log("No");
          this.ketSilahkanAbsen = '';
          this.ketAvaiAbsen = '';
          this.ketUnavaiAbsen = 'UNAVAILABLE SPK';
          this.btnAbsenOn = false;
          this.btnAbsenOff = true;
        }

      }, err => {
        console.log("Error absen");
        this.absenStatus = "OFF";

        let va = {
          'idAbsensiMyPelindo':0,
          'status':false, 
          'time':this.now,
          'absenStatus':'OFF'
        }
        localStorage.setItem('absensiPanduMyPelindo', JSON.stringify(va));

        localStorage.setItem('kesediaan', '0');

        this.ketSilahkanAbsen = 'SILAHKAN ABSEN DI MY PELINDO!';
        this.ketAvaiAbsen = '';
        this.ketUnavaiAbsen = '';
        this.btnAbsenOn = true;
        this.btnAbsenOff = true;
      }).catch(err =>{
        console.log("Error getting absen", err);
      })

      this.getListPetugasPandu(this.username);

      this.getJadwalGroupPandu(this.username);
    })
  }

  getListPetugasPandu(username) {
    this.userData.getListPetugasPandu(this.username).then((data)=> {
      console.log("List Petugas Pandu",data);
      for (var i of data) {
        let groupName = i.namaPetugas+" "+i.kode;
        i.groupName = groupName;
        this.dataPetugas.push(i);
      }
      
      localStorage.setItem('listPetugasPandu', JSON.stringify(this.dataPetugas));
    }, err => {
      console.log("error", err);
      this.alertPresent(err)
    }).catch(err =>{
      console.log("Error getting list petugas pandu", err);
    })
  }

  getJadwalGroupPandu(username) {
    this.userData.getJadwalShiftGroupPandu(this.username).then((data)=> {
      console.log("Jadwal Shift Pandu",data);
      this.ketShift = 'Shift '+data.jamMulai+' - '+data.jamSelesai+' '+data.namaGroup;

      localStorage.setItem('jadwalGroupPandu', this.ketShift);
    }, err => {
      console.log("error", err);
      this.alertPresent(err)
    }).catch(err =>{
      console.log("Error getting jadwal pandu", err);
    })
  }

  refreshAbsensiPandu() {
    console.log("tgl masuk : ",moment().format('MM/DD/YYYY'));
    this.loadingPresent()
    this.absensiData.refreshAbsensi(this.username, moment().format('MM/DD/YYYY')).then((data)=> {
      console.log("Refresh Absensi Pandu",data);
      this.ionViewDidEnter();
      this.ionViewDidLoad();
      this.loader.dismiss()
    }, err => {
      console.log("error", err);
      this.loader.dismiss()
      this.alertPresent(err)
    }).catch(err =>{
      this.loader.dismiss()
      console.log("Error refresh absensi pandu", err);
    })
  }

  showListPetugasPandu() {
    let modalBatalPandu = this.modal.create(ListPetugasPanduComponent,
      {dataPetugas:this.dataPetugas},
      {
        showBackdrop:true,
        enableBackdropDismiss: false
      }
    )
    modalBatalPandu.onDidDismiss(data => {
    });
    modalBatalPandu.present();
  }

  loadingPresent(){
    this.loader = this.loading.create({
                  spinner: 'hide',
                  content: `Sedang koneksi ke server..`
                });
    this.loader.present();
  }

  alertPresent(msg){
    this.alert = this.alertCtrl.create({
                  title: 'Error..!!',
                  subTitle: "Gagal koneksi ke server, cek koneksi internet anda..",
                  buttons: ['OK']
                })
    this.alert.present();
  }

  absenOn(){
    let absensiMyPelindo = JSON.parse(localStorage.getItem('absensiPanduMyPelindo'));
    let id = absensiMyPelindo['idAbsensiMyPelindo'];
    if (id != 0) {
      this.loadingPresent()
      this.userData.putKesediaanPanduOn(id).then((data)=> {
          console.log('kesediaan pandu on. ',data);
          
          this.absenStatus = "ON";
          this.btnAbsenOn = true;
          this.btnAbsenOff = false;
          this.ketAvaiAbsen = 'AVAILABLE SPK';
          this.ketUnavaiAbsen = '';
          this.ketSilahkanAbsen = '';

          localStorage.setItem('kesediaan', '1');
          
          this.loader.dismiss()
        }, err => {
          console.log("error", err);
          this.loader.dismiss();
          this.alertPresent(err);
        }).catch(err => {
          this.loader.dismiss();
          this.alertPresent(err);
        })
    }
  }

  absenOff(){
    let absensiMyPelindo = JSON.parse(localStorage.getItem('absensiPanduMyPelindo'));
    let id = absensiMyPelindo['idAbsensiMyPelindo'];
    if (id != 0) {
      this.loadingPresent()
      this.userData.putKesediaanPanduOff(id).then((data)=> {
          console.log('kesediaan pandu off. ',data);
          
          this.absenStatus = "ON";
          this.btnAbsenOn = false;
          this.btnAbsenOff = true;
          this.ketAvaiAbsen = '';
          this.ketUnavaiAbsen = 'UNAVAILABLE SPK';
          this.ketSilahkanAbsen = '';

          localStorage.setItem('kesediaan', '0');

          this.loader.dismiss()
        }, err => {
          console.log("error", err);
          this.loader.dismiss();
          this.alertPresent(err);
        }).catch(err => {
          this.loader.dismiss();
          this.alertPresent(err);
        })
    }
  }

  // absenOn(){
  //   this.now = moment().format();
  //   this.mulaiTglAbsen = moment(this.now).locale('id').format('dddd, LL');
  //   this.mulaiJamAbsen = moment(this.now).locale('id').format('hh:mm:ss');

  //   this.akhirTglAbsen = moment(moment(this.now).add(1, 'day')).locale('id').format('dddd, LL');
  //   this.akhirJamAbsen = moment(moment(this.now).add(1, 'day')).locale('id').format('hh:mm:ss');
    
  //   this.loadingPresent()
  //   this.toDb(this.username, true);
    
  // }

  // absenOff(){
  //   this.loadingPresent()
  //   this.toDb(this.username, false, "Izin")
  // }

  /**
   * 
   * @param username 
   */
  getAbsenStatus(username){
    this.userData.getAbsen( username );
  }

  toDb(username, param, alasanOff=""){
    if(param){
      this.userData.absenMasuk(username).then(data => {
        console.log(data);
        this.absenStatus = "ON";
        this.btnAbsenOff = false;
        this.btnAbsenOn = true;

        let va = {
              'status':true, 
              'time':this.now,
              'mulaiTgllAbsen':this.mulaiTglAbsen,
              'mulaiJamAbsen':this.mulaiJamAbsen, 
              'absenStatus':'ON'
            }
        localStorage.setItem('mulaiAbsen', JSON.stringify(va));

        this.loader.dismiss()
      }, err => {
        console.log("error", err);
        this.loader.dismiss();
        this.alertPresent(err);
      }).catch(err => {
        console.log("error absen masuk", err);
        this.loader.dismiss();
        this.alertPresent(err);
      })
    }else{
      this.userData.absenOff(username, alasanOff).then( (data)=> {
        console.log(data);
        this.absenStatus = "OFF";
        this.btnAbsenOff = true;
        this.btnAbsenOn = false;

        let va = {
              'status':false, 
              'time':this.now, 
              'username':username, 
              'absenStatus':'OFF'
          }
        localStorage.setItem('mulaiAbsen', JSON.stringify(va));

        this.loader.dismiss()
      }, err => {
        console.log("error", err);
        this.loader.dismiss();
        this.alertPresent(err);
      }).catch(err => {
        this.loader.dismiss();
        this.alertPresent(err);
      })
    }
  }
}