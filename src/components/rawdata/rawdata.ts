import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Packet } from 'mqtt';

import { MQTTService } from '../../services/mqtt';
import { ConfigService } from '../../services/config/config.service';

/**
 * Generated class for the Rawdata component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'mq-rawdata',
  templateUrl: 'rawdata.html',
  providers: [MQTTService, ConfigService]
})
 export class Rawdata implements OnInit, OnDestroy {
//export class Rawdata {
  // Stream of messages
  public messages: Observable<Packet>;

  // Array of historic message (bodies)
  public mq: Array<string> = [];

  // A count of messages received
  public count = 0;

  /** Constructor */
  constructor(
    private _mqService: MQTTService,
    private _configService: ConfigService
  ) {}

  ngOnInit() {
    // Get configuration from config service...
    this._configService.getConfig('assets/api/config.json').then(
      config => {
        // ... then pass it to (and connect) the message queue:
        this._mqService.configure(config);
        this._mqService.try_connect()
          .then(this.on_connect)
          .catch(this.on_error);
      }
    );

    setInterval( () => {
      this._mqService.publishTopic("Test Message "+new Date(), '/test/topic')
    }, 5 * 60 * 1000);
  }

  ngOnDestroy() {
    this._mqService.disconnect();
  }

  /** Callback on_connect to queue */
  public on_connect = () => {

    // Store local reference to Observable
    // for use with template ( | async )
    this.messages = this._mqService.messages;

    // Subscribe a function to be run on_next message
    this.messages.subscribe(this.on_next);
  }

  /** Consume a message from the _mqService */
  public on_next = (message: Packet) => {

    // Store message in "historic messages" queue
    this.mq.push(message.toString() + '\n');

    // Count it
    this.count++;
  }

  public on_error = () => {
    console.error('Ooops, error in RawDataComponent');
    
  }

}
