import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, tap } from "rxjs";

export interface Config {
  siteLocked: boolean
}

@Injectable({
  providedIn: "root"
})
export class ConfigService {

  constructor(private httpClient: HttpClient){}

  configMain = "/api/config";

  private config: Config | null = null; 

  loadConfig(): Observable<Config>{
    return this.httpClient.get<Config>(`${this.configMain}/getconfig`) 
    .pipe(tap(config => {
      this.config = config;
    }));
  }

  getConfig(): Config | null {
    return this.config ?? null;
  }
}