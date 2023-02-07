import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';

import { ConfigInterface } from '../models/configmodel';


/*
  Generated class for the Config provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class Config {
  data : any;
  constructor(public http: Http) {
    console.log('Hello Config Provider');
  }

    /** Make an http request for a config file, and
      * return a Promise for its resolution.
      */
public getConfig(): Promise<ConfigInterface> {
    return this.http.get('assets/config.json')
      .map(res => res.json()).toPromise()
    
  }

}
