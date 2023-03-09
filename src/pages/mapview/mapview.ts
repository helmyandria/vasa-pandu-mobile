import { Component } from '@angular/core';
import { NavController,ToastController, LoadingController, Events, Platform, App } from 'ionic-angular';
import * as moment from "moment";
import L, * as Leaflet from "leaflet";
import * as geoJson from 'geojson';
import { Geolocation, BackgroundGeolocation, Dialogs } from 'ionic-native';
import { LocationTracker } from '../../providers/location-tracker';
import { Notification } from '../../providers/notification';
import { Geojson } from '../../providers/geojson';
import { Pnetwork } from '../../providers/pnetwork';


declare module 'geojson' {
    export var version : string;
    export var defaults: Object;
    export function parse(data: Object, properties: Object, callback?: Function) : Object;
}

let PERMISSION_DENIED = 1;
let POSITION_UNAVAILABLE = 2;
let TIMEOUT = 3;


@Component({
  selector: 'page-mapview',
  templateUrl: 'mapview.html',
  providers:[Geojson]
})
export class LeafletView {

  private _currentLatLng: any;
  private _map: any;
  private _marker: any;
  private _defLoc: any;
  private lat: any;
  private lon: any;

  private app: App;
  private map: any;
  private nav: NavController;
  private events: Events;
  public locations; // Polyline for leaflet
  public intRefresh: any;
  public amsToken:any;
  public refreshInterval:number = 1;
 
  options: any;
  is_not_android: any;
  path: any;
  isTracking: any;
  postingEnabled: any;
  online: any;
  toggle: any;
  pace: any;
  locationAccuracy: any;
  previousLocation: any;
  provider: any;

  items:any;
  searchName=[];
  tempSearchName=[];
  searchItem:boolean=false;

  /**
   * Url Map http://183.91.67.210:8232/vessels?type=inner&port=8
   */

  public loader;
  private layerShip;
  private layerPilot;


  constructor(
     _nav: NavController, 
     _events: Events, 
     _platform: Platform, 
     _app: App,
    public locationTracker : LocationTracker,
    public notification : Notification,
    private geojs : Geojson,
    public loadingCtrl: LoadingController,
    public toast:ToastController,
    public pnetwork: Pnetwork
  ) {
    this.loader = this.loadingCtrl.create({
      content: "Please wait...",
      duration: 5000
    }); 
  }

  ionViewDidLoad() {
    console.log("map enter")
    this.loader.present();
    this._map = L.map('map', {zoomControl:false}).setView([-7.135073,112.681487], 13);
    // L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png").addTo(this._map);
    L.tileLayer("http://140.211.167.105/{z}/{x}/{y}.png").addTo(this._map);

    // L.tileLayer("http://{s}.tiles.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZGVkZHlzaXAiLCJhIjoiY2l3eHE4Z256MDE0OTJ5bzBzNXdtaDFyNSJ9.8LE3GwYl3j5knjHY7dWRtw").addTo(this._map);
    
    this.loader.present();
    this.appendShip(1);
    this.currentLoc();
  }

  ionViewDidEnter(){
    document.querySelector('.leaflet-control-attribution')['style']="display:none"
    console.log('read intRefresh', this.intRefresh);
    console.log('initiate clear interval');
    clearInterval(this.intRefresh);
    console.log('initiate set interval');
    this.intRefresh = setInterval( ()=>{
        this.setShip(this.amsToken)
    }, this.refreshInterval * 60 * 1000)
  }

  ionViewDidLeave(){
    console.log('clear interval');
    clearInterval(this.intRefresh);
  }



  showToast(msg) {
    // let toast = new Toast(this.app);
    // toast.setMessage(msg);
    // toast.present();
  }

  // Update screen according to new location
  setCurrentLocation(location) {
    console.log("!!!DEMO : setCurrentLocation, location: { " + Number(location.latitude) + ", " + Number(location.longitude) + "}");
    
    // Update leaflet map
    this.locations.addLatLng([location.latitude, location.longitude]);
    this.map.fitBounds(this.locations.getBounds());
  }

  // Only used for non android device
  onGetLocations() {

    BackgroundGeolocation.getLocations()
      .then(
        (res) => {
          console.log(res);
        }
      )
      .catch(
        (err) => {
          console.error("On Get Locations : error = " + err);
        }
      );
  }

  onRefresh(){
    // this.loader.present()
    this.refreshShip();
  }

  onClickHome() {
    Geolocation.getCurrentPosition(this.options)
      .then((resp) => {
        console.log("!!!DEMO : Geolocation : " + resp.coords.latitude + ", " + resp.coords.longitude);
        this.showToast("Your location is : "+ resp.coords.longitude + ", " + resp.coords.latitude);

        // center on the location
        this._map.setView([resp.coords.latitude, resp.coords.longitude],17)
        this.setCurrentLocation(resp.coords);
      })
      .catch((error) => {
        console.log("!!!DEMO : Failed to get Geolocation, errors :" + error);
        if (error.code == PERMISSION_DENIED) {
          console.log("!!!DEMO : On permission denied -> REPORT TO DEV");
        } else if ( error.code == POSITION_UNAVAILABLE ) {
          console.log("!!!DEMO : On position unavailable -> switch on location, activate gps, wifi network");
        } else if ( error.code == TIMEOUT ) {
          this.showToast("On timeout -> switch on location, activate gps, wifi network -> wait");
        }
      });
  }
  
  currentLoc(){
    this.lat = this.locationTracker.lat;
    this.lon = this.locationTracker.lng;
    this._currentLatLng = [this.lat,this.lon];
    
    let pilotIcon = L.icon({
      iconUrl: 'assets/img/pilot.png',
      iconSize: [50, 50],
      iconAnchor: [16, 37],
      popupAnchor: [0, -28]
    });

    //console.log("Update position");
    if(!this._marker){
      this._marker = Leaflet.marker(this._currentLatLng, {icon:pilotIcon}).addTo(this._map);
    }

    this._marker.setLatLng(this._currentLatLng).update();
    setTimeout(()=>{
      this.currentLoc()
    }, 3000);
  }

  onEachFeature(feature, layer) {
    var html = `<table width=100%>
                  <tbody>
                    <tr >
                      <td style="width:50px">Name</td>
                      <td style="width:50px">${feature.properties.name}</td>
                      <td style="width:50px">Longitude</td>
                      <td style="width:50px">${feature.geometry.coordinates[0]}</td>
                    </tr>
                    <tr >
                      <td>MMSI</td>
                      <td>${feature.properties.mmsi}</td>
                      <td>Latitude</td>
                      <td>${feature.geometry.coordinates[1]}</td>
                    </tr>
                    <tr >
                      <td>Call Sign</td>
                      <td>${feature.properties.callSign}</td>
                      <td>Speed</td>
                      <td>${feature.properties.speed} kts</td>
                    </tr>
                    <tr >
                      <td>IMO Number</td>
                      <td>${feature.properties.code}</td>
                      <td>Heading</td>
                      <td>${feature.properties.heading}°</td>
                    </tr>
                  </tbody>
                </table>`;
		var popupContent = html;
    //console.log(feature, layer)

		if (feature.properties && feature.properties.popupContent) {
			popupContent += feature.properties.popupContent;
		}

		layer.bindPopup(popupContent);
	}

  onEachFeaturePilot(feature, layer) {
    var html = `<table width=100%>
                  <tbody>
                    <tr >
                      <td style="width:100px">Nama Petugas</td>
                      <td style="width:150px">${feature.properties.namaPetugas}</td>
                    </tr>
                    <tr >
                      <td style="width:100px">NIPP Petugas</td>
                      <td >${feature.properties.nipPandu}</td>
                    </tr>
                    <tr >
                      <td>Tgl Aktivitas</td>
                      <td style="width:150px">${moment(feature.properties.tglAktivitas).format('DD-MM-YYYY HH:mm')}</td>
                    </tr>
                  </tbody>
                </table>`;
		var popupContent = html;
    //console.log(feature, layer)

		if (feature.properties && feature.properties.popupContent) {
			popupContent += feature.properties.popupContent;
		}

		layer.bindPopup(popupContent);
	}

  setColorShip(color){
    
    var cl = "ship-gray.png";
    switch(color){
      case "B":
        cl = "blue.png";
        break;
      case "Y":
        cl = "yellow.png";
        break;
      case "R":
        cl = "red.png";
        break;
      case "G":
        cl = "green.png";
        break;
    }

    return cl;
  }

 
  /**
   * set ship icon
   * 
   * @param xtoken 
   */
  setShip(xtoken){
    var self = this;
    var pilotIcon = L.icon({
      iconUrl: 'assets/img/pilot.png',
      iconSize: [50, 50],
      iconAnchor: [16, 37],
      popupAnchor: [0, -28]
    });
    var pilotIconOff = L.icon({
      iconUrl: 'assets/img/pilot-off.png',
      iconSize: [50, 50],
      iconAnchor: [16, 37],
      popupAnchor: [0, -28]
    });
    
    var ArrowMarker = L.Marker.extend({
      _reset: function() {
        var pos = this._map.latLngToLayerPoint(this._latlng).round();
        //console.log("position", pos)
        L.DomUtil.setPosition(this._icon, pos);
        if (this._shadow) {
            L.DomUtil.setPosition(this._shadow, pos);
        }

        if (this.options.iconAngle) {
            this._icon.style.WebkitTransform = this._icon.style.WebkitTransform + ' rotate(' + this.options.iconAngle + 'deg)';
            this._icon.style.MozTransform = 'rotate(' + this.options.iconAngle + 'deg)';
            this._icon.style.MsTransform = 'rotate(' + this.options.iconAngle + 'deg)';
            this._icon.style.OTransform = 'rotate(' + this.options.iconAngle + 'deg)';
        }

        this._icon.style.zIndex = pos.y;
      }
    });

    this.geojs.getShipPosition(xtoken).then( data =>{
      this.items = data.features;
      console.log("ship data", this.items);
      this.searchName = []
      for(var i in this.items){
        this.searchName.push(this.items[i].properties.name)
      }
      // setTimeout(() => {
      //   console.log("test get object",this.geojs.getObjects(this.items,"name","ZALEHA FITRAT, KM"));
        
      //   var needle = "ZALEHA FITRAT, KM"
      //   let obj = this.items.find(x => x.properties.name === needle);
      //   let index = this.items.indexOf(obj);
      //   console.log(this.items[index].geometry);
      //   // array.fill(obj.name='some new string', index, index++);
      //   console.log(this.searchName);
      // }, 5000);
      
      this.layerShip.clearLayers();
      // this.layerShip = Leaflet.geoJSON(data, {

      //   pointToLayer: function (feature, latlng) {
      //     //console.log("Color ship",self.setColorShip(feature.properties['status']));
      //     return new ArrowMarker(latlng, 
      //           {
      //             icon: L.divIcon({
      //               className : "css-icon",
      //               iconSize: [50, 50],
      //               iconAnchor: [16, 37],
      //               popupAnchor: [0, -28],
      //               html:'<img src="assets/img/'+self.setColorShip(feature.properties['status'])+'" style="-webkit-transform: rotate(' + feature.properties['heading'] + 'deg); -moz-transform:rotate(' + feature.properties['heading'] + 'deg);" />'
      //             }), 
      //             iconAngle: feature.properties['heading']
      //           });
          
      //   },
      //   onEachFeature: this.onEachFeature

      // }).addTo(this._map);
    },err => {
      console.log('err', err)
    }).catch(err => {
      console.log("Error load ship", err)
      this.toast.create({
        closeButtonText:"Close",
        message:err
      })
    })

    let geoData:any;
    var selfs = this;
    this.geojs.getPilotJsonPosition().then(dataJson => {
        geoData = this.toGeojsonFormat( dataJson );
        console.log("hasil convert", geoData);

          this.layerPilot.clearLayers();
          this.layerPilot = L.geoJSON(geoData, {
            pointToLayer: function (feature, latlng) {
              
              if(feature.properties['nipPandu'] != localStorage.getItem('username') && feature.properties['nipPandu'] != localStorage.getItem('username').toUpperCase())
                if(self.less1hour(feature.properties['tglAktivitas']))
                  return L.marker(latlng, {icon: pilotIconOff});
                else
                   return L.marker(latlng, {icon: pilotIcon});
            },
            onEachFeature: this.onEachFeaturePilot

          }).addTo(this._map);
      })

  }

  less1hour(timestamp): boolean{
    var less1fromnow = moment().unix() - 3600;
    var ts = moment(timestamp).unix();
    
    if(ts <= less1fromnow)
      return true;
    else
      return false;
  }

  /**
   * Append ship to map
   * 
   * @param 
   * interval in minute
   * 
   */
  appendShip(refreshInterval){
    this.layerShip = L.geoJSON();
    this.layerPilot = L.geoJSON();

    this.geojs.getInfoLogin().then( res => {
      console.log("before parse", res);
      // var result =JSON.parse(res);
      // console.log("result :", result['X-Token']);
      this.amsToken = res;

      this.setShip(res)

      this.refreshInterval = refreshInterval;

      // this.intRefresh = setInterval( ()=>{
      //   this.setShip(this.amsToken)
      // }, refreshInterval * 10 * 1000)
      
    },
    err => {
      console.log('err', err)
    }
    ).catch( (err) => {
      console.log(err)
    })

  }

  /**
   * Refresh Ship
   */
  refreshShip(){
      this.setShip(this.amsToken);
  }

  /**
   * hitung jarak antara point 1 dan 2
   * 
   * @param lat1 
   * @param lon1 
   * @param lat2 
   * @param lon2 
   * @param unit = the unit you desire for results                               :::
   *           where: 'M' is statute miles (default)                         :::
   *                  'K' is kilometers                                      :::
   *                  'N' is nautical miles 
   */
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

  toGeojsonFormat(obj){
    return geoJson.parse(obj, {Point:['latitude', 'longitude']});
  }

  getItems(ev: any) {
    // set val to the value of the searchbar
    this.searchItem = true;
    let val = ev.target.value;
    this.tempSearchName = this.searchName;
    console.log("temporari",this.tempSearchName);
    if (val && val.trim() != '') {
      // return this.tempSearchName = this.tempSearchName.filter(ship => ship.toLowerCase().indexOf(val.toLowerCase()) > -1)
      this.tempSearchName = this.tempSearchName.filter(item => {
        try{
          console.log("mapview",item);
          console.log("search by nama kapal",(item.toLowerCase().indexOf(val.toLowerCase()) > -1) , "items:",item, "index of", item.toLowerCase().indexOf(val.toLowerCase()));
          return (item.toLowerCase().indexOf(val.toLowerCase()) > -1);
        }catch (e){
          console.log("ERROR", e);
        }
      })
    }
  }

  getIndexItem(item){
    console.log(item);
    this.searchItem = false;
    var needle = item
      let obj = this.items.find(x => x.properties.name === needle);
      let index = this.items.indexOf(obj);
      console.log("get index items search",this.items[index].geometry);
      let resp = this.items[index].geometry;
      console.log("pointing to: ",resp.coordinates[1], resp.coordinates[0]);
      this._map.setView([resp.coordinates[1], resp.coordinates[0]],18)
  }

  onCancel(ev:any){
    console.log("on cancel");
    this.searchItem = false;
    // this.tempSearchName = [];
    // console.log(this.tempSearchName);
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
}
