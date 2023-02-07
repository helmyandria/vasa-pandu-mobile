import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {Http} from '@angular/http';
import {Platform} from 'ionic-angular';
import {SQLite, SQLiteObject} from '@ionic-native/sqlite';
import {SQLitePorter} from '@ionic-native/sqlite-porter';
import {Storage} from '@ionic/storage';
import {BehaviorSubject} from 'rxjs/Rx';
import * as moment from 'moment';

@Injectable()
export class SqliteServiceProvider {
    db: SQLiteObject = null;
    webdb: any;
    private databaseReady: BehaviorSubject<boolean>

    constructor(
        public _platform: Platform,
        private sqlite: SQLite,
        private sqlitePorter: SQLitePorter,
        private storage: Storage,
        private http: Http
    ) {
        console.log('Hello Database Provider');

        this._platform.ready().then(() => {
            if (this._platform.is('android') || this._platform.is('ios')) {

                this.sqlite.create({
                    name: 'spk.db',
                    location: 'default'
                })
                    .then((db: SQLiteObject) => {
                        this.db = db;
                        this.storage.get('database_filled').then(val => {
                            if (val) {
                                this.databaseReady.next(true);
                            } else {
                                this.fillDatabase();
                            }
                        });
                    });

                this.sqlite = new SQLite();
                this.sqlite.create({name: "spk.db", location: "default"}).then((db: SQLiteObject) => {
                    //spk table
                    db.executeSql('CREATE TABLE IF NOT EXISTS spk (spk_id INTEGER PRIMARY KEY UNIQUE,username TEXT, vjson TEXT, status INTEGER, tgl_spk TEXT, timestamp TEXT)', {})
                        .then(() => console.log('Executed SQL - spk table'))
                        .catch(e => console.log(e));
                    //detail spk table
                    db.executeSql('CREATE TABLE IF NOT EXISTS detail_spk (detail_spk_id INTEGER PRIMARY KEY UNIQUE, vjson TEXT)', {})
                        .then(() => console.log('Executed SQL - detail table'))
                        .catch(e => console.log(e));
                    //detail spk table
                    db.executeSql('CREATE TABLE IF NOT EXISTS history (history_id INTEGER PRIMARY KEY UNIQUE, vjson TEXT)', {})
                        .then(() => console.log('Executed SQL - detail table'))
                        .catch(e => console.log(e));
                    //msg queue
                    db.executeSql('CREATE TABLE IF NOT EXISTS event (event_id INTEGER PRIMARY KEY UNIQUE, msg TEXT, state INTEGER)', {})
                        .then(() => console.log('Executed SQL - event table'))
                        .catch(e => console.log(e));
                    //VERSION
                    db.executeSql('CREATE TABLE IF NOT EXISTS version (versi_id INTEGER PRIMARY KEY UNIQUE, versi TEXT, tgl_versi TEXT, status INTEGER)', {})
                        .then(() => console.log('Executed SQL - version table'))
                        .catch(e => console.log(e));
                    //REALISASI
                    db.executeSql('CREATE TABLE IF NOT EXISTS realisasi (spk_id INTEGER PRIMARY KEY UNIQUE,username TEXT, vjson TEXT, status INTEGER, progress TEXT, tgl_spk TEXT, timestamp TEXT)', {})
                        .then(() => console.log('Executed SQL - realisasi table'))
                        .catch(e => console.log(e));
                    //REALISASI MQTT LOG
                    db.executeSql('CREATE TABLE IF NOT EXISTS realisasi_mqtt_log (spk_id INTEGER PRIMARY KEY UNIQUE,username TEXT,vjson TEXT, msg_state TEXT, tgl_spk TEXT)', {});
                    //adjusttime mqtt log table
                    db.executeSql('CREATE TABLE IF NOT EXISTS adjusttime_mqtt_log (spk_id INTEGER PRIMARY KEY UNIQUE,username TEXT,vjson TEXT, msg_state TEXT, tgl_spk TEXT)', {});

                    //add column msg_state 
                    db.executeSql('ALTER TABLE spk ADD COLUMN msg_state TEXT', {});
                })
                    .catch(e => console.log("error create spk.db", e));
                // }
            } else {
                this.webdb = (<any>window).openDatabase('__vasaPanduDb', '', 'Mobile Pandu DB', 2 * 1024 * 1024);
                this.webdb.transaction((trx) => {
                    //spk table
                    trx.executeSql('CREATE TABLE IF NOT EXISTS spk (spk_id INTEGER PRIMARY KEY UNIQUE,username TEXT, vjson TEXT, status INTEGER, tgl_spk TEXT, timestamp TEXT)');
                    //detail spk table
                    trx.executeSql('CREATE TABLE IF NOT EXISTS detail_spk (detail_spk_id INTEGER PRIMARY KEY UNIQUE, vjson TEXT)');
                    //detail spk table
                    trx.executeSql('CREATE TABLE IF NOT EXISTS history (history_id INTEGER PRIMARY KEY UNIQUE, vjson TEXT)');
                    //event table
                    trx.executeSql('CREATE TABLE IF NOT EXISTS event (event_id INTEGER PRIMARY KEY UNIQUE, msg TEXT, state INTEGER)');
                    //version table
                    trx.executeSql('CREATE TABLE IF NOT EXISTS version (versi_id INTEGER PRIMARY KEY UNIQUE, versi TEXT, tgl_versi TEXT, status INTEGER)');
                    //realisasi table
                    trx.executeSql('CREATE TABLE IF NOT EXISTS realisasi (spk_id INTEGER PRIMARY KEY UNIQUE,username TEXT, vjson TEXT, status INTEGER, progress TEXT, tgl_spk TEXT, timestamp TEXT)');
                    //realisasi mqtt log table
                    trx.executeSql('CREATE TABLE IF NOT EXISTS realisasi_mqtt_log (spk_id INTEGER PRIMARY KEY UNIQUE,username TEXT,vjson TEXT, msg_state TEXT, tgl_spk TEXT)');
                    //adjusttime mqtt log table
                    trx.executeSql('CREATE TABLE IF NOT EXISTS adjusttime_mqtt_log (spk_id INTEGER PRIMARY KEY UNIQUE,username TEXT,vjson TEXT, msg_state TEXT, tgl_spk TEXT)');

                    //add column msg_state
                    trx.executeSql('ALTER TABLE spk ADD COLUMN msg_state TEXT');
                })
            }
        });
    }

    public fillDatabase() {
        this.http.get('assets/sql/dermaga_offline.sql')
            .map(res => res.text())
            .subscribe(sql => {
                this.sqlitePorter.importSqlToDb(this.db, sql)
                    .then(data => {
                        this.databaseReady.next(true);
                        this.storage.set('database_filled', true);
                    })
                    .catch(e => console.error(e));
            });
    }

    public openDB(): Promise<void> {
        return this.sqlite.create({
            name: 'spk.db',
            location: 'default'
        })
            .then((db: SQLiteObject) => {
                //storage object to property
                this.db = db;
            });
    }

    /**
     * Save data spk to sqlite
     * @param DataArray : Object
     */
    public saveSpkToSqlite(DataArray) {
        if (this._platform.is('android') || this._platform.is('ios')) {
            return new Promise((resolve, reject) => {
                // using sqlite
                this.sqlite.create({
                    name: 'spk.db',
                    location: 'default'
                })
                    .then((db: SQLiteObject) => {
                        DataArray.forEach(element => {
                            let repQuery, query, arD;
                            query = "INSERT INTO spk (spk_id,tgl_spk,vjson,status,timestamp,username) VALUES (?,?,?,?,?,?)";
                            arD = [element.id, element.jamPenetapanPandu, JSON.stringify(element), element.flagDone, moment(element.created).unix(), localStorage.getItem('username')];
                            // console.log("INSERT QUERY SPK",query, arD, element)

                            db.executeSql(query, arD).then((data) => {
                                // console.log("INSERT NATIVE: spk data");
                            }, (error) => {
                                // console.log("ERROR insert spk: " + JSON.stringify(error.err));
                                if (element.flagDone == 2)
                                    repQuery = "update spk set msg_state = 'C', status=2 where spk_id = ? ";
                                else if (element.flagDone == 1)
                                    repQuery = "update spk set msg_state = 'P' where spk_id = ? ";

                                let repArD = [element.id];

                                // console.log(repQuery, element.id);
                                db.executeSql(repQuery, repArD).then(data => {
                                    // console.log("update msg state WEB: data spk ");
                                });
                                reject("ERROR insert spk: " + JSON.stringify(error.err))
                            });
                        });
                        resolve("data inserted")
                    })
                    .catch(e => console.log(e));
            })
        } else {
            return new Promise((resolve, reject) => {
                //using websql
                this.webdb = (<any>window).openDatabase('__vasaPanduDb', '', 'Mobile Pandu DB', 2 * 1024 * 1024);
                DataArray.forEach(element => {
                    let repQuery, query, arD;
                    query = "INSERT INTO spk (spk_id,tgl_spk,vjson,status,timestamp,username) VALUES (?,?,?,?,?,?)";
                    arD = [element.id, element.jamPenetapanPandu, JSON.stringify(element), element.flagDone, moment(element.created).unix(), localStorage.getItem('username')];

                    this.webdb.transaction((trx) => {
                        trx.executeSql(query, arD, (data) => {
                            // console.log("insert spk");
                        }, (error, er) => {
                            if (element.flagDone == 2)
                                repQuery = "update spk set msg_state = 'C', status=2 where spk_id = ?";
                            else if (element.flagDone == 1)
                                repQuery = "update spk set msg_state = 'P' where spk_id = ?";

                            let repArD = [element.id];

                            // console.log(repQuery, element.id);
                            trx.executeSql(repQuery, repArD, (data) => {
                                // console.log("update msg state WEB: data spk ");
                            }, (error, er) => {
                                // console.log("ERROR update msg detail spk: " + er);
                            });
                        });
                        resolve("data inserted")
                    });
                });
            })
        }


    }

    public getSpkOfflineData(tglMulai, tanggalAkhir) {
        if (this._platform.is('android') || this._platform.is('ios')) {
            return new Promise((resolve, reject) => {
                let query = "SELECT * FROM spk where datetime(tgl_spk) >= datetime('" + tglMulai + " 00:00:00') and datetime(tgl_spk) <= datetime('" + tanggalAkhir + " 23:59:59') and username='" + localStorage.getItem('username') + "' order by spk_id desc";
                let arr = [];
                // console.log("native array data", query);
                this.sqlite.create({
                    name: 'spk.db',
                    location: 'default'
                })
                    .then((db: SQLiteObject) => {
                        // console.log(query);
                        db.executeSql(query, []).then((data) => {
                            if (data.rows.length > 0) {
                                for (var i = 0; i < data.rows.length; i++) {
                                    var item = data.rows.item(i);
                                    arr.push(item);
                                }
                            }
                            resolve(arr);
                        }, (error) => {
                            reject(error);
                            // console.log("error get spk", error);
                        });
                    })
                    .catch(e => console.log("error get spk offline sqliteservice", e));
            });
        } else {
            return new Promise((resolve, reject) => {
                this.webdb = (<any>window).openDatabase('__vasaPanduDb', '', 'Mobile Pandu DB', 2 * 1024 * 1024);
                let queryWeb = `SELECT a.* FROM spk a 
                                    where datetime(a.tgl_spk) >= datetime('${tglMulai} 00:00:00') 
                                    and datetime(a.tgl_spk) <= datetime('${tanggalAkhir} 23:59:59')  
                                    and a.username='${localStorage.getItem('username')}' 
                                    order by a.spk_id desc`;
                // console.log("web query",queryWeb);
                let arr = [];
                this.webdb.transaction((trx) => {
                    trx.executeSql(queryWeb, [], function (t, data) {
                        // console.log("from select", data);
                        for (var i = 0; i < data.rows.length; i++) {
                            arr.push(data.rows.item(i));
                        }

                        //  console.log(arr);
                        resolve(arr)
                    }, (error) => {
                        // console.log(error);
                        reject(error)
                    });
                })
            });
        }
    }

    public deleteSpkOfflineData() {
        this.sqlite.create({
            name: 'spk.db',
            location: 'default'
        })
            .then((db: SQLiteObject) => {
                db.executeSql("DELETE FROM spk", []).then((data) => {
                    // console.log("DELETED: " + JSON.stringify(data));
                }, (error) => {
                    // console.log("ERROR kod brisanja: " + JSON.stringify(error.err));
                });
            })
            .catch(e => console.log(e));
    }

    /**
     * update spk status
     * @param spk_id
     */
    public updateSpkStatus(spk_id, state) {
        if (this._platform.is('android') || this._platform.is('ios')) {
            return new Promise((resolve, reject) => {
                this.sqlite.create({
                    name: 'spk.db',
                    location: 'default'
                })
                    .then((db: SQLiteObject) => {
                        db.executeSql("UPDATE spk set status = 2, msg_state = '" + state + "' where spk_id = ?", [spk_id]).then((data) => {
                            // console.log("update native spk status");
                            resolve("update status spk berhasil")
                        }, (error) => {
                            // console.log("error update spk status");
                            reject("gagal")
                        });
                    })
                    .catch(e => console.log(e));
            });
        } else {
            return new Promise((resolve, reject) => {
                let query = "UPDATE spk set status = 2, msg_state = '" + state + "' where spk_id = ?";
                let arD = [spk_id]
                // console.log("INSERT QUERY DETAIL SPK",query, arD)
                this.webdb = (<any>window).openDatabase('__vasaPanduDb', '', 'Mobile Pandu DB', 2 * 1024 * 1024);
                this.webdb.transaction((trx) => {
                    trx.executeSql(query, arD, (data) => {
                        resolve("update status spk berhasil");
                        // console.log("update web spk status: ", spk_id);
                    }, (error) => {
                        reject("gagal")
                        console.log("ERROR update status spk: " + JSON.stringify(error.err));
                    });
                });
            });
        }
    }

    /**
     * update message status
     * @param spk_id
     * @param state
     */
    public updateMessageStatus(spk_id, state): Promise<any> {
        if (this._platform.is('android') || this._platform.is('ios')) {
            return new Promise((resolve, reject) => {
                this.sqlite.create({
                    name: 'spk.db',
                    location: 'default'
                })
                    .then((db: SQLiteObject) => {
                        db.executeSql("UPDATE spk set msg_state = '" + state + "', status=2 where spk_id = ?", [spk_id]).then((data) => {
                            // console.log("update native spk message status");
                            resolve()
                        }, (error) => {
                            // console.log("error update spk message status");
                            // reject()
                        });
                    })
                    .catch(e => console.log(e));
            });
        } else {
            return new Promise((resolve, reject) => {
                let query = "UPDATE spk set msg_state = '" + state + "', status=2 where spk_id = ?";
                let arD = [spk_id];
                // console.log(query);
                this.webdb = (<any>window).openDatabase('__vasaPanduDb', '', 'Mobile Pandu DB', 2 * 1024 * 1024);
                this.webdb.transaction((trx) => {
                    trx.executeSql(query, arD, (data) => {
                        // console.log("update web spk message status: ", spk_id);
                        resolve()
                    }, (error) => {
                        // console.log("ERROR update message status spk: " + JSON.stringify(error.err));
                        // reject()
                    });
                });
            });
        }
    }

    /**
     * Detail SPK
     * @param DataArrayTwo
     * @param detail_spk_id
     */
    public saveDetailSpkToSqlite(DataArrayTwo, detail_spk_id) {
        if (this._platform.is('android') || this._platform.is('ios')) {
            this.sqlite.create({
                name: 'spk.db',
                location: 'default'
            })
                .then((db: SQLiteObject) => {

                    db.executeSql("REPLACE INTO detail_spk (detail_spk_id,vjson) VALUES (?,?)", [detail_spk_id, DataArrayTwo]).then((data) => {
                        // console.log("INSERT NATIVE");
                    }, (error) => {
                        // console.log("ERROR insert detail spk: " + error);
                    });
                })
                .catch(e => console.log(e));
        } else {
            let query = "REPLACE INTO detail_spk (detail_spk_id,vjson) VALUES (?,?)";
            let arD = [detail_spk_id, DataArrayTwo]

            this.webdb = (<any>window).openDatabase('__vasaPanduDb', '', 'Mobile Pandu DB', 2 * 1024 * 1024);
            this.webdb.transaction((trx) => {
                trx.executeSql(query, arD, (data) => {
                    // console.log("INSERT detail WEB")        
                }, (error) => {
                    // console.log("ERROR insert detail spk: " + JSON.stringify(error.err));
                });
            });
        }
    }

    public getDetailSpkOfflineData(detailSpkId) {
        if (this._platform.is('android') || this._platform.is('ios')) {
            return new Promise((resolve, reject) => {
                this.sqlite.create({
                    name: 'spk.db',
                    location: 'default'
                })
                    .then((db: SQLiteObject) => {
                        let query = "SELECT vjson FROM detail_spk where detail_spk_id =" + detailSpkId;
                        // console.log(query);
                        db.executeSql(query, []).then((data) => {
                            let LocalArrayTwo: any;
                            if (data.rows.length > 0) {
                                // for(let i = 0; i < data.rows.length; i++) {
                                //     LocalArrayTwo.push(data.rows);
                                // }
                                LocalArrayTwo = data.rows.item(0)
                            }
                            // console.log("RESULT DETAIL: ", LocalArrayTwo);
                            resolve(LocalArrayTwo);
                        }, (error) => {
                            reject(error);
                        });
                    })
                    .catch(e => console.log(e));
            });
        } else {
            return new Promise((resolve, reject) => {
                this.webdb = (<any>window).openDatabase('__vasaPanduDb', '', 'Mobile Pandu DB', 2 * 1024 * 1024);
                let query = "SELECT vjson FROM detail_spk where detail_spk_id =" + detailSpkId;
                // console.log((query));
                this.webdb.transaction((trx) => {
                    trx.executeSql(query, [], (t, data) => {
                        resolve(data.rows.item(0));
                    }, (error) => {
                        // console.log(error);
                        reject(error)
                    });
                })
            });
        }
    }

    public deleteDetailSpkOfflineData() {
        this.sqlite.create({
            name: 'spk.db',
            location: 'default'
        })
            .then((db: SQLiteObject) => {
                db.executeSql("DELETE FROM detail_spk", []).then((data) => {
                    // console.log("DELETED: " + JSON.stringify(data));
                }, (error) => {
                    // console.log("ERROR kod delete: " + JSON.stringify(error.err));
                });
            })
            .catch(e => console.log(e));
    }


    /**
     * History data
     *
     * @param DataArrayTwo
     * @param history_id
     */
    public saveDetailHistoryToSqlite(DataArrayTwo, history_id) {
        if (this._platform.is('android') || this._platform.is('ios')) {
            this.sqlite.create({
                name: 'spk.db',
                location: 'default'
            })
                .then((db: SQLiteObject) => {
                    // console.log("INSERT INTO history (history_id,vjson) VALUES (?,?)", [history_id, DataArrayTwo]);
                    db.executeSql("REPLACE INTO history (history_id,vjson) VALUES (?,?)", [history_id, DataArrayTwo]).then((data) => {
                        // console.log("INSERTED QUERY history: " + JSON.stringify(data));
                    }, (error) => {
                        // console.log("ERROR insert history spk: " + error);
                    });
                })
                .catch(e => console.log(e));
        } else {
            let query = "REPLACE INTO history (detail_spk_id,vjson) VALUES (?,?)";
            let arD = [history_id, DataArrayTwo]
            // console.log("INSERT QUERY HISTORY SPK",query, arD)
            this.webdb = (<any>window).openDatabase('__vasaPanduDb', '', 'Mobile Pandu DB', 2 * 1024 * 1024);
            this.webdb.transaction((trx) => {
                trx.executeSql(query, arD, (data) => {
                    // console.log("INSERTED DETAIL: ", history_id);
                }, (error) => {
                    // console.log("ERROR insert history spk: " + JSON.stringify(error.err));
                });
            });
        }
    }

    /**
     * Detail History
     *
     * @param historyId
     */
    public getDetailHistoryOfflineData(historyId) {
        if (this._platform.is('android') || this._platform.is('ios')) {
            return new Promise((resolve, reject) => {
                this.sqlite.create({
                    name: 'spk.db',
                    location: 'default'
                })
                    .then((db: SQLiteObject) => {
                        let query = "SELECT vjson FROM history where detail_spk_id =" + historyId;
                        // console.log(query);
                        db.executeSql(query, []).then((data) => {
                            let LocalArrayTwo: any;
                            if (data.rows.length > 0) {
                                // for(let i = 0; i < data.rows.length; i++) {
                                //     LocalArrayTwo.push(data.rows);
                                // }
                                LocalArrayTwo = data.rows.item(0)
                            }
                            // console.log("RESULT DETAIL: ", LocalArrayTwo);
                            resolve(LocalArrayTwo);
                        }, (error) => {
                            reject(error);
                        });
                    })
                    .catch(e => console.log(e));
            });
        } else {
            return new Promise((resolve, reject) => {
                this.webdb = (<any>window).openDatabase('__vasaPanduDb', '', 'Mobile Pandu DB', 2 * 1024 * 1024);
                let query = "SELECT vjson FROM history where detail_spk_id =" + historyId;
                // console.log((query));
                this.webdb.transaction((trx) => {
                    trx.executeSql(query, [], (t, data) => {

                        resolve(data.rows.item(0));
                    }, (error) => {
                        // console.log(error);
                        reject(error)
                    });
                })
            });
        }
    }

    /**
     * Save Versi aplikasi
     *
     * @param DataArray
     */
    public saveVersiToSqlite(DataArray) {
        if (this._platform.is('android') || this._platform.is('ios')) {
            return new Promise((resolve, reject) => {
                // using sqlite
                this.sqlite.create({
                    name: 'spk.db',
                    location: 'default'
                })
                    .then((db: SQLiteObject) => {
                        DataArray.forEach(element => {
                            let query = "REPLACE INTO version (versi_id,versi,tgl_versi,status) VALUES (?,?,?,?)";
                            let arD = [element.id, element.versi, element.tgl, element.status];
                            // console.log("INSERT QUERY version",query, arD, element)
                            db.executeSql(query, arD).then((data) => {
                                // console.log("INSERTED: " + JSON.stringify(data), DataArray);
                            }, (error) => {
                                // console.log("ERROR insert version: " + JSON.stringify(error.err));
                                reject("ERROR insert version: " + JSON.stringify(error.err))
                            });
                        });
                        resolve("data versi inserted")
                    })
                    .catch(e => console.log(e));
            })
        } else {
            return new Promise((resolve, reject) => {
                //using websql
                this.webdb = (<any>window).openDatabase('__vasaPanduDb', '', 'Mobile Pandu DB', 2 * 1024 * 1024);
                DataArray.forEach(element => {
                    let query = "REPLACE INTO version (versi_id,versi,tgl_versi,status) VALUES (?,?,?,?)";
                    let arD = [element.id, element.versi, element.tgl, element.status];
                    // console.log("INSERT QUERY VERSION",query, arD, element)

                    this.webdb.transaction((trx) => {
                        trx.executeSql(query, arD, (data) => {
                            // console.log("INSERTED: " + JSON.stringify(data), DataArray);
                        }, (error) => {
                            // console.log("ERROR insert spk: " + JSON.stringify(error.err));
                            reject("ERROR insert spk: " + JSON.stringify(error.err))
                        });
                        resolve("data VERSION inserted")
                    });
                });
            })
        }
    }


    public saveRealisasiToSqlite(DataArray) {
        if (this._platform.is('android') || this._platform.is('ios')) {
            return new Promise((resolve, reject) => {
                // using sqlite
                this.sqlite.create({
                    name: 'spk.db',
                    location: 'default'
                })
                    .then((db: SQLiteObject) => {
                        let element = DataArray
                        let query = "REPLACE INTO realisasi (spk_id,tgl_spk,vjson,status,timestamp,username) VALUES (?,?,?,?,?,?)";
                        let arD = [element.id, element.created, JSON.stringify(element), 2, moment(element.created).unix(), localStorage.getItem('username')];
                        // console.log("INSERT QUERY SPK",query, arD, element)
                        db.executeSql(query, arD).then((data) => {
                            // console.log("INSERTED: " + JSON.stringify(data), DataArray);
                            resolve("data inserted")
                        }, (error) => {
                            // console.log("ERROR insert realisasi: " + JSON.stringify(error.err));
                            reject("ERROR insert realisasi: " + JSON.stringify(error.err))
                        });


                    })
                    .catch(e => console.log(e));
            })
        } else {
            return new Promise((resolve, reject) => {
                //using websql
                this.webdb = (<any>window).openDatabase('__vasaPanduDb', '', 'Mobile Pandu DB', 2 * 1024 * 1024);
                // console.log('Data Array insert replace',DataArray)
                let element = DataArray
                let query = "REPLACE INTO realisasi (spk_id,tgl_spk,vjson,status,timestamp,username) VALUES (?,?,?,?,?,?)";
                let arD = [element.id, element.created, JSON.stringify(element), 2, moment(element.created).unix(), localStorage.getItem('username')];

                this.webdb.transaction((trx) => {
                    trx.executeSql(query, arD, (data) => {
                        // console.log("INSERT: Realisasi");
                        resolve("data inserted")
                    }, (error) => {
                        // console.log("ERROR insert spk: " + JSON.stringify(error.err));
                        reject("ERROR insert realisasi: " + JSON.stringify(error.err))
                    });
                });

            })
        }
    }

    public getRealisasiOffline(spk_id) {
        if (this._platform.is('android') || this._platform.is('ios')) {
            return new Promise((resolve, reject) => {
                this.sqlite.create({
                    name: 'spk.db',
                    location: 'default'
                })
                    .then((db: SQLiteObject) => {
                        let query = "SELECT * FROM realisasi where spk_id =" + spk_id;
                        // console.log(query);
                        db.executeSql(query, []).then((data) => {
                            if (data.rows.length > 0)
                                resolve(data.rows.item(0));
                            else
                                reject(1)
                        }, (error) => {
                            // console.log("error sqlite offline history",error);
                            reject(1);
                        });
                    })
                    .catch(e => console.log(e));
            });
        } else {
            return new Promise((resolve, reject) => {
                this.webdb = (<any>window).openDatabase('__vasaPanduDb', '', 'Mobile Pandu DB', 2 * 1024 * 1024);
                let query = "SELECT * FROM realisasi where spk_id =" + spk_id;
                // console.log((query));
                this.webdb.transaction((trx) => {
                    trx.executeSql(query, [], (t, data) => {

                        if (data.rows.length > 0)
                            resolve(data.rows.item(0));
                        else
                            reject(1)
                    }, (error) => {
                        // console.log("error sqlite offline history",error);
                        reject(error)
                    });
                })
            });
        }
    }

    public updateProgressRealisasi(spk_id, dataProgress) {
        if (this._platform.is('android') || this._platform.is('ios')) {
            return new Promise((resolve, reject) => {
                this.sqlite.create({
                    name: 'spk.db',
                    location: 'default'
                })
                    .then((db: SQLiteObject) => {
                        db.executeSql("UPDATE realisasi set status=2, progress='" + dataProgress + "' where spk_id = ?", [spk_id]).then((data) => {
                            // console.log("update native realisasi");
                            resolve("berhasil update progress realisasi")
                        }, (error) => {
                            // console.log("update spk");
                            reject("error update progress realisasi")
                        });
                    })
                    .catch(e => console.log(e));
            });
        } else {
            return new Promise((resolve, reject) => {
                let query = "UPDATE realisasi set status=2, progress = ? where spk_id = ?";
                let arD = [dataProgress, spk_id]
                // console.log("INSERT QUERY DETAIL SPK",query, arD)
                this.webdb = (<any>window).openDatabase('__vasaPanduDb', '', 'Mobile Pandu DB', 2 * 1024 * 1024);
                this.webdb.transaction((trx) => {
                    trx.executeSql(query, arD, (data) => {
                        // console.log("update web realisasi status: ", spk_id);
                        resolve("berhasil update progress realisasi")
                    }, (error) => {
                        // console.log("ERROR update realisasi status: " + JSON.stringify(error.err));
                        reject("error update progress realisasi")
                    });
                });
            });
        }
    }

    /**
     * Save data realisasi mqtt log to sqlite
     * @param DataArray : Object
     * @param state : String
     *  P = pendung
     *  C = Created
     */
    public saveRealisasiMqttLog(DataArray, state) {
        if (this._platform.is('android') || this._platform.is('ios')) {
            return new Promise((resolve, reject) => {
                // using sqlite
                this.sqlite.create({
                    name: 'spk.db',
                    location: 'default'
                })
                    .then((db: SQLiteObject) => {
                        let element = DataArray
                        let query, arD;
                        query = "INSERT INTO realisasi_mqtt_log (spk_id,tgl_spk,vjson,msg_state) VALUES (?,?,?,?)";
                        arD = [element.id, element.jamPenetapanPandu, JSON.stringify(element), state];

                        db.executeSql(query, arD).then((data) => {
                            resolve("data inserted")
                        }, (error) => {
                            reject("ERROR insert spk: " + JSON.stringify(error.err))
                        });
                    })
                    .catch(e => console.log(e));
            })
        } else {
            return new Promise((resolve, reject) => {
                //using websql
                this.webdb = (<any>window).openDatabase('__vasaPanduDb', '', 'Mobile Pandu DB', 2 * 1024 * 1024);
                let element = DataArray;

                let query, arD;
                query = "INSERT INTO realisasi_mqtt_log (spk_id,tgl_spk,vjson,msg_state) VALUES (?,?,?,?)";
                arD = [element.id, element.jamPenetapanPandu, JSON.stringify(element), state];
                // console.log(query, arD);
                this.webdb.transaction((trx) => {
                    trx.executeSql(query, arD, (data) => {
                        // console.log("insert spk");
                        resolve("data inserted")
                    }, (error, er) => {
                        reject();
                    });

                });
            })
        }
    }

    /**
     * Save data realisasi mqtt log to sqlite
     * @param DataArray : Object
     */
    public saveAddjusttimeMqttLog(DataArray) {
        if (this._platform.is('android') || this._platform.is('ios')) {
            return new Promise((resolve, reject) => {
                // using sqlite
                this.sqlite.create({
                    name: 'spk.db',
                    location: 'default'
                })
                    .then((db: SQLiteObject) => {
                        let element = DataArray
                        let query, arD;
                        query = "REPLACE INTO adjusttime_mqtt_log (spk_id,tgl_spk,vjson,msg_state) VALUES (?,?,?,?)";
                        arD = [element.id, element.created, JSON.stringify(element), "P"];

                        db.executeSql(query, arD).then((data) => {
                            resolve("data inserted")
                        }, (error) => {
                            reject("ERROR insert spk: " + JSON.stringify(error.err))
                        });

                    })
                    .catch(e => console.log(e));
            })
        } else {
            return new Promise((resolve, reject) => {
                //using websql
                console.log("adjusttime", DataArray);
                this.webdb = (<any>window).openDatabase('__vasaPanduDb', '', 'Mobile Pandu DB', 2 * 1024 * 1024);
                let element = DataArray;

                let query, arD;
                query = "REPLACE INTO adjusttime_mqtt_log (spk_id,tgl_spk,vjson,msg_state) VALUES (?,?,?,?)";
                arD = [element.id, element.created, JSON.stringify(element), "P"];
                // console.log(query, arD);
                this.webdb.transaction((trx) => {
                    trx.executeSql(query, arD, (data) => {
                        // console.log("insert spk");
                        resolve("data inserted")
                    }, (error, er) => {
                        reject();
                    });

                });

            })
        }
    }

    /**
     * Insert Data to spk and detail
     * from mqtt
     *
     * @param DataArray
     */
    public saveSpkAndDetail(DataArray): Promise<any> {
        return new Promise((resolve, reject) => {
            let toSpk = [DataArray.detailFromList];
            let toDetail = DataArray.detailFromObject;
            // console.log("insert to spk", toSpk);
            // console.log("insert to detail", toDetail);
            this.saveSpkToSqlite(toSpk);
            this.saveDetailSpkToSqlite(JSON.stringify(toDetail), toDetail.id)
            resolve()
        });
    }

    public getRealisasiPending() {
        if (this._platform.is('android') || this._platform.is('ios')) {
            return new Promise((resolve, reject) => {
                let query = 'select a.* from realisasi a, realisasi_mqtt_log b where a.spk_id = b.spk_id and b.msg_state = "P"';
                let arr = [];
                // console.log("native array data", query);
                this.sqlite.create({
                    name: 'spk.db',
                    location: 'default'
                })
                    .then((db: SQLiteObject) => {
                        // console.log(query);
                        db.executeSql(query, []).then((data) => {
                            if (data.rows.length > 0) {
                                for (var i = 0; i < data.rows.length; i++) {
                                    var item = data.rows.item(i);
                                    arr.push(item);
                                }
                            }
                            resolve(arr);
                        }, (error) => {
                            reject(error);
                            // console.log("error get spk", error);
                        });
                    })
                    .catch(e => console.log("error get spk offline sqliteservice", e));
            });
        } else {
            return new Promise((resolve, reject) => {
                this.webdb = (<any>window).openDatabase('__vasaPanduDb', '', 'Mobile Pandu DB', 2 * 1024 * 1024);
                let queryWeb = `select a.* from realisasi a, realisasi_mqtt_log b where a.spk_id = b.spk_id and b.msg_state = "P"`;
                // console.log("web query",queryWeb);
                let arr = [];
                this.webdb.transaction((trx) => {
                    trx.executeSql(queryWeb, [], function (t, data) {
                        // console.log("from select", data);
                        for (var i = 0; i < data.rows.length; i++) {
                            arr.push(data.rows.item(i));
                        }

                        //  console.log(arr);
                        resolve(arr)
                    }, (error) => {
                        // console.log(error);
                        reject(error)
                    });
                })
            });
        }
    }

    public getRealisasiMqttLogOffline(spk_id) {
        if (this._platform.is('android') || this._platform.is('ios')) {
            return new Promise((resolve, reject) => {
                this.sqlite.create({
                    name: 'spk.db',
                    location: 'default'
                })
                    .then((db: SQLiteObject) => {
                        let query = "SELECT * FROM realisasi_mqtt_log where spk_id =" + spk_id;
                        // console.log(query);
                        db.executeSql(query, []).then((data) => {
                            let LocalArrayTwo: any;
                            if (data.rows.length > 0)
                                resolve(data.rows.item(0));
                            else
                                reject(1)
                        }, (error) => {
                            // console.log("error sqlite offline history",error);
                            reject(1);
                        });
                    })
                    .catch(e => console.log(e));
            });
        } else {
            return new Promise((resolve, reject) => {
                this.webdb = (<any>window).openDatabase('__vasaPanduDb', '', 'Mobile Pandu DB', 2 * 1024 * 1024);
                let query = "SELECT * FROM realisasi_mqtt_log where spk_id =" + spk_id;
                // console.log((query));
                this.webdb.transaction((trx) => {
                    trx.executeSql(query, [], (t, data) => {
                        let LocalArrayTwo = [];
                        // console.log("detail data history",data.rows, "length", data.rows.length, query);
                        if (data.rows.length > 0)
                            resolve(data.rows.item(0));
                        else
                            reject(1)
                    }, (error) => {
                        // console.log("error sqlite offline history",error);
                        reject(error)
                    });
                })
            });
        }
    }

    public updateRealisasiLog(spk_id) {
        if (this._platform.is('android') || this._platform.is('ios')) {
            return new Promise((resolve, reject) => {
                this.sqlite.create({
                    name: 'spk.db',
                    location: 'default'
                })
                    .then((db: SQLiteObject) => {
                        db.executeSql("UPDATE realisasi_mqtt_log set msg_state = 'C' where spk_id = ?", [spk_id]).then((data) => {
                            // console.log("update native realisasi log");
                        }, (error) => {
                            // console.log("update spk");
                        });
                    })
                    .catch(e => console.log(e));
            });
        } else {
            let query = "UPDATE realisasi_mqtt_log set msg_state = 'C' where spk_id = ?";
            let arD = [spk_id]
            // console.log("INSERT QUERY DETAIL SPK",query, arD)
            this.webdb = (<any>window).openDatabase('__vasaPanduDb', '', 'Mobile Pandu DB', 2 * 1024 * 1024);
            this.webdb.transaction((trx) => {
                trx.executeSql(query, arD, (data) => {
                    // console.log("update web realisasi log status: ", spk_id);
                }, (error) => {
                    // console.log("ERROR update realisasi status: " + JSON.stringify(error.err));
                });
            });
        }
    }

    public getLog(query, action) {
        let arr = [];
        if (this._platform.is('android') || this._platform.is('ios')) {
            return new Promise((resolve, reject) => {
                this.sqlite.create({
                    name: 'spk.db',
                    location: 'default'
                })
                    .then((db: SQLiteObject) => {
                        if (action == "GET")
                            db.executeSql(query, []).then((data) => {

                                for (var i = 0; i < data.rows.length; i++) {
                                    arr.push(data.rows.item(i));
                                }
                                resolve(arr)
                            }, (error) => {
                                reject("error get all log:" + error)
                            });

                        else if (action == "PUT" || action == "POST")
                            db.executeSql(query, []).then((data) => {
                                resolve(data)
                            }, (error) => {
                                reject(error)
                            });
                    })
                    .catch(e => console.log(e));
            });
        } else {
            return new Promise((resolve, reject) => {
                let arr = [];
                this.webdb = (<any>window).openDatabase('__vasaPanduDb', '', 'Mobile Pandu DB', 2 * 1024 * 1024);
                this.webdb.transaction((trx) => {
                    if (action == "GET")
                        this.webdb.transaction((trx) => {
                            trx.executeSql(query, [], function (t, data) {

                                for (var i = 0; i < data.rows.length; i++) {
                                    arr.push(data.rows.item(i));
                                }
                                resolve(arr)
                            }, (error) => {
                                reject("error get all log:" + error)
                            });
                        })
                    else if (action == "PUT" || action == "POST")
                        trx.executeSql(query, [], (data) => {
                            resolve(data)
                        }, (error) => {
                            reject(error)
                        });
                });
            });
        }
    }

    public getDermagaOffline(namaDermanga, kodeCabang) {
        if (this._platform.is('android') || this._platform.is('ios')) {
            return new Promise((resolve, reject) => {
                this.sqlite.create({
                    name: 'spk.db',
                    location: 'default'
                })
                    .then((db: SQLiteObject) => {
                        let query = "select * from dermaga where kdCabang=" + kodeCabang + " and mdmgNama like '%" + namaDermanga + "%'";
                        // console.log(query);
                        db.executeSql(query, []).then((data) => {
                            let LocalArrayTwo = [];
                            if (data.rows.length > 0) {
                                for (var i = 0; i < data.rows.length; i++) {
                                    console.log("dermaga", data.rows.item(i), "index", i);
                                    LocalArrayTwo.push(data.rows.item(i))
                                }
                                console.log("RESULT dermaga: ", LocalArrayTwo);
                                resolve(LocalArrayTwo);
                            } else {
                                reject(1)
                            }
                        }, (error) => {
                            // console.log("error sqlite offline history",error);
                            reject(1);
                        });
                    })
                    .catch(e => console.log(e));
            });
        } else {
            return new Promise((resolve, reject) => {
                this.webdb = (<any>window).openDatabase('__vasaPanduDb', '', 'Mobile Pandu DB', 2 * 1024 * 1024);
                let query = "select * from dermaga where kdCabang=" + kodeCabang + " and mdmgNama like '%" + namaDermanga + "%'";
                console.log(query);
                this.webdb.transaction((trx) => {
                    trx.executeSql(query, [], (t, data) => {
                        let LocalArrayTwo = [];
                        if (data.rows.length > 0) {
                            for (var i = 0; i < data.rows.length; i++) {
                                console.log("dermaga", data.rows.item(i), "index", i);
                                LocalArrayTwo.push(data.rows.item(i))
                            }
                            console.log("RESULT dermaga: ", LocalArrayTwo);
                            resolve(LocalArrayTwo);
                        } else {
                            reject(1)
                        }
                    }, (error) => {
                        // console.log("error sqlite offline history",error);
                        reject(error)
                    });
                })
            });
        }
    }

    deleteSpk(spk_id) {
        if (this._platform.is('android') || this._platform.is('ios')) {
            return new Promise((resolve, reject) => {
                this.sqlite.create({
                    name: 'spk.db',
                    location: 'default'
                })
                    .then((db: SQLiteObject) => {
                        db.executeSql("DELETE FROM spk where spk_id = ?", [spk_id]).then((data) => {
                            resolve(true)
                        }, (error) => {
                            reject("error")
                        });
                    })
                    .catch(e => console.log(e));
            });
        } else {
            return new Promise((resolve, reject) => {
                let query = "DELETE FROM spk where spk_id = ?";
                let arD = [spk_id]
                this.webdb = (<any>window).openDatabase('__vasaPanduDb', '', 'Mobile Pandu DB', 2 * 1024 * 1024);
                this.webdb.transaction((trx) => {
                    trx.executeSql(query, arD, (data) => {
                        resolve(true)
                    }, (error) => {
                        reject("error")
                    });
                });
            });
        }
    }
}