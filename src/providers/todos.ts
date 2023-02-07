import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Auth } from './auth';
import 'rxjs/add/operator/map';
 
@Injectable()
export class Todos {
 
  constructor(public http: Http, public authService: Auth) {
 
  }
 
 
}