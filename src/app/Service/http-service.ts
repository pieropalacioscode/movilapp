import { Injectable } from '@angular/core';
import { CapacitorHttp, HttpOptions } from '@capacitor/core';
import { Capacitor } from '@capacitor/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class HttpService {

    constructor(private http: HttpClient) { }

  // Método para GET requests
  get(url: string, options?: any): Observable<any> {
    if (Capacitor.isNativePlatform()) {
      const httpOptions: HttpOptions = {
        url: environment.endPoint + url,
        headers: options?.headers || {},
      };
      return from(CapacitorHttp.get(httpOptions));
    } else {
      return this.http.get(environment.endPoint + url, options);
    }
  }

  // Método para POST requests
  post(url: string, data: any, options?: any): Observable<any> {
    if (Capacitor.isNativePlatform()) {
      const httpOptions: HttpOptions = {
        url: environment.endPoint + url,
        headers: options?.headers || { 'Content-Type': 'application/json' },
        data: data
      };
      return from(CapacitorHttp.post(httpOptions));
    } else {
      return this.http.post(environment.endPoint + url, data, options);
    }
  }

  // Método para PUT requests
  put(url: string, data: any, options?: any): Observable<any> {
    if (Capacitor.isNativePlatform()) {
      const httpOptions: HttpOptions = {
        url: environment.endPoint + url,
        headers: options?.headers || { 'Content-Type': 'application/json' },
        data: data
      };
      return from(CapacitorHttp.put(httpOptions));
    } else {
      return this.http.put(environment.endPoint + url, data, options);
    }
  }

  // Método para DELETE requests
  delete(url: string, options?: any): Observable<any> {
    if (Capacitor.isNativePlatform()) {
      const httpOptions: HttpOptions = {
        url: environment.endPoint + url,
        headers: options?.headers || {},
      };
      return from(CapacitorHttp.delete(httpOptions));
    } else {
      return this.http.delete(environment.endPoint + url, options);
    }
  }
}
