import { Component } from '@angular/core';
import { NavController,ViewController, NavParams } from 'ionic-angular';
/**
 * Generated class for the RemarkComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'remark',
  templateUrl: 'remark.html'
})
export class RemarkComponent {

  text: string;
  remark:string;

  constructor(private view:ViewController, private params: NavParams) {
    this.remark = this.params.get('remark');
  }

  dismiss() {
    this.view.dismiss(this.remark);
  }

}
