import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { MQTTService } from '../../services/mqtt';
import { TransportState } from "../../services/mqtt/transport.service";

/**
 * Generated class for the Status component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'mq-status',
  templateUrl: 'status.html'
})
export class Status  implements OnInit {

  public state: Observable<string>;

  constructor(private _mqService: MQTTService) { }

  ngOnInit() {
    console.log('Status init');
    this.state = this._mqService.state
      .map((state: number) => TransportState[state]);
  }

}
