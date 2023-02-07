import {Injectable, Pipe} from '@angular/core';

import * as moment from 'moment';

/*
  Generated class for the Idformat pipe.

  See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
  Angular 2 Pipes.
*/
@Pipe({
    name: 'idformat'
})
@Injectable()
export class Idformat {
    /*
      Takes a value and makes it lowercase.
     */
    transform(value, args) {
        value = value + ''; // make sure it's a string
        return moment(value).format('DD-MM-YYYY HH:mm:ss');
    }

}
