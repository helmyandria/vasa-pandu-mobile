import { Injectable } from '@angular/core';
import { ConfigService } from '../services/config/config.service';

declare var process: any;

@Injectable()
export class AppConfig {  
    public apiBaseUrl: string;
    public amsUrl: string;
    public env:string;

    constructor(private _configService: ConfigService) {
        this._configService.getConfig('assets/api/config.json').then(
            config => {
                console.log("this debug", config);
                this.apiBaseUrl = config.apiUrl;
                this.amsUrl = config.amsUrl;
                this.env = config.env;
            }
        );
    }

    private _readString(key: string, defaultValue?: string): string {
        const v = process.env[key];
        return v === undefined ? defaultValue : String(v);
    }
}