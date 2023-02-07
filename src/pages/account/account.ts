import { Component } from '@angular/core';
import { AlertController, NavController } from 'ionic-angular';

import { Storage } from '@ionic/storage';

import { LoginPage } from '../login/login';
import { UserData } from '../../providers/user-data';
import { Notification } from '../../providers/notification';


@Component({
  selector: 'page-account',
  templateUrl: 'account.html'
})
export class AccountPage {
  username: string;
  profile = {};
  public version: string;

  constructor(
    public alertCtrl: AlertController, 
    public nav: NavController, 
    public userData: UserData,
    public notification: Notification,
    public storage: Storage
  ) {
    
  }

  ionViewDidLoad() {
    this.storage.get('profile').then( (dataProfile)=> {
      this.profile = dataProfile;
    })
    
    this.getUsername();
  }

  updatePicture() {
    console.log('Clicked to update picture');
  }

  // Present an alert with the current username populated
  // clicking OK will update the username and display it
  // clicking Cancel will close the alert and do nothing
  changeUsername() {
    let alert = this.alertCtrl.create({
      title: 'Change Username',
      buttons: [
        'Cancel'
      ]
    });
    alert.addInput({
      name: 'username',
      value: this.username,
      placeholder: 'username'
    });
    alert.addButton({
      text: 'Ok',
      handler: data => {
        this.userData.setUsername(data.username);
        this.getUsername();
      }
    });

    alert.present();
  }

  getUsername() {
    this.storage.get('username').then((username) => {
      this.username = username;
    });
  }

  changePassword() {
    console.log('Clicked to change password');
  }

  logout() {
    this.userData.logout();
    this.nav.setRoot(LoginPage);
  }

}
