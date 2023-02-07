# README #

Repositori untk mobile app vasa pandu

Menggunakan framework ionic3

### Installation ###

* git clone https://tantowi_jauhari@bitbucket.org/tantowi_jauhari/vasa-mobile-pandu-v3.git
* npm install (install all package from this package.json)

### Add Platform IOS/Android ###
* ionic add platform ios/android

### Add resources to platform ###
* ionic resources

### Running app on device ###
* ionic cordova build ios/android
* ionic cordova run android

### Serve app on web ###
* ionic serve

### Restore plugin from state ###
* ionic state restore


### Module compatible with app ###
* signature_pad compatible with version 1.5.3
* ionic cli 3.10.3 menggunakan nodejs v8.5.0
* ionic deploy 6.7

### Perubahan pada versi >= 2.2.1 ###
* Penambahan fitur Tolak spk pandu

### Perubahan pada versi >= 2.1.0 ###
* Perubahan absensi pandu

### Perubahan pada versi >= 2.0.0 ###
* versi ini menggunakan ionic pro untuk live update 
* saat pertama kali clone aplikasi untuk versi IOS harus menggunakan .xcworkspace
* pilih sign untuk apple dev
* lalu build menggunakan 'ionic cordova build ios'

### v.1.4.0
* Bug fixing Offline data
* Auto Sync

### v.1.3.0
* Penambahan pandu turun / batal pandu
* Offline sync

### v.1.1.9
* penambahan fitur multi language indo/english pada menu pemanduan

### v.1.1.8
* penambahan fitur manual input tahapan pandu
* list data OHN saja

### v.1.1.7
* bug fixing realisasi
* bug fixing flag done
* upgrade ionic cli dan ionic script mengakibatkan gagal upload snapshot, fixied menggunakan nodejs v8.8.0
* buka handling pemanduan 

### v.1.1.5
* offline data (realisasi, detail realisasi, )
* remark pemanduan
* sinkronisasi absensi dan server
* bug fix selesai pandu pada signature (cancel signature)
* pencarian nama kapal
* put progress done (mqtt)
* menggunakan ip static untuk map (vpn telkomsem)


## Install dependency untuk ionic native

npm install @ionic-native/background-geolocation && npm install @ionic-native/background-mode && npm install @ionic-native/badge && npm install @ionic-native/geolocation && npm install @ionic-native/local-notifications && npm install @ionic-native/network && npm install @ionic-native/splash-screen && npm install @ionic-native/sqlite && npm install @ionic-native/status-bar && npm install @ionic-native/vibration

### Merge to dev from other branch
* pastikan d branch dev
* git fetch origin
* git merge origin/pandu-offline

