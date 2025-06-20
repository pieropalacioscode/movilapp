import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {
    private endpoint = environment.apiurl;
    private apiurl = this.endpoint + 'Proveedor';
  constructor(private _http: HttpClient) { }

  getProveedores(): Observable<any[]> {
  return this._http.get<any[]>(this.apiurl);
}
}
