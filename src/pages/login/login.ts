import {Component} from '@angular/core';

import {NavController, MenuController, Events, AlertController} from 'ionic-angular';

import {TabsPage} from '../tabs/tabs';
import {UserData} from '../../providers/user-data';

@Component({
    selector: 'page-user',
    templateUrl: 'login.html'
})
export class LoginPage {
    login: { username?: string, password?: string } = {};
    submitted = false;
    erroruser: string;

    constructor(
        public navCtrl: NavController,
        public userData: UserData,
        public menuCtrl: MenuController,
        public events: Events,
        public alertCtrl: AlertController
    ) {
        //this.userData.logout();
        this.menuCtrl.swipeEnable(false);

        this.menuCtrl.enable(false)

    }

    ionViewWillLeave() {
        this.menuCtrl.enable(true);
    }

    onLogin(form) {
        this.submitted = true;
        if (form.valid) {
            //this.navCtrl.setRoot(HomePage);
            this.userData.login(this.login.username, this.login.password);
            this.events.subscribe('user:erroruser', (msg) => {
                this.erroruser = msg;
            });

            this.events.subscribe('user:successlogin', (msg) => {
                this.navCtrl.setRoot(TabsPage);
            });
        }
        console.log('login')
    }

}
