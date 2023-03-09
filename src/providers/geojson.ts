import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

import { Storage } from '@ionic/storage-angular';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';

/*
  Generated class for the Geojson provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class Geojson {
  apiUrl = 'http://amsvasa.pelindo.co.id:8080/api';
  pilotUrl = 'http://apivasa.pelindo.co.id:8081/api/mobile';

  constructor(public http: Http, public storage: Storage) {
    console.log('Hello Geojson Provider');
  }


  getInfoLogin(): Promise<any>{
    
    let body = JSON.stringify({
      "username": "891004820",
      "password": "surabaya191089"
    });
    let headers = new Headers({ 'Content-Type': 'application/json',  });
    let options = new RequestOptions({ headers: headers });

    return this.http.post(this.apiUrl+'/user/login', body, options)
                    .map(res => {
                      var hd = res.headers;
                      localStorage.setItem('x-token-ams', res.headers.get('x-token'));
                      console.log("result header geojson",res.headers.get('x-token'));
                      return res.headers.get('x-token');
                      
                    }).toPromise()
  }

  getShipPosition(xtoken):Promise<any>{
    var headers = new Headers();
    headers.append('x-token',xtoken)
    var opt = new RequestOptions({headers:headers})
    console.log("REQUEST SHIP POSITION!!", opt)
    return this.http.get(`${this.apiUrl}/vessels?type=inner&port=8`, opt) 
      .map(res => res.json())
      .toPromise();
  }

  getPilotJsonPosition():Promise<any>{
    console.debug("REQUEST PILOT POSITION!!")
    return this.http.get(`${this.pilotUrl}/lokasi_pandu/latest`) 
      .map(res => res.json())
      .toPromise();
  }

  getPilotPosition(xtoken){
    var headers = new Headers({'x-token':xtoken});
    
    return this.http.get(`${this.apiUrl}/pilots?port=8`, {headers:headers}) 
      .map(res => res.json())
      .toPromise();
  }

  getObjects(obj, key, val) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(this.getObjects(obj[i], key, val));    
        } else 
        //if key matches and value matches or if key matches and value is not passed (eliminating the case where key matches but passed value does not)
        if (i == key && obj[i] == val || i == key && val == '') { //
            objects.push(obj);
        } else if (obj[i] == val && key == ''){
            //only add if the object is not already in the array
            if (objects.lastIndexOf(obj) == -1){
                objects.push(obj);
            }
        }
    }
    return objects;
}

  distance(lat1, lon1, lat2, lon2, unit) {
    var radlat1 = Math.PI * lat1/180
    var radlat2 = Math.PI * lat2/180
    var theta = lon1-lon2
    var radtheta = Math.PI * theta/180
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist)
    dist = dist * 180/Math.PI
    dist = dist * 60 * 1.1515
    if (unit=="K") { dist = dist * 1.609344 }
    if (unit=="N") { dist = dist * 0.8684 }
    return dist
  }
}
