import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginacionResponse } from '../Models/PaginacionResponse';
import { Proveedor } from '../Models/proveedor';

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

  getProveedoresPaginado(pagina: number, cantidad: number): Observable<PaginacionResponse<Proveedor>> {
    return this._http.get<PaginacionResponse<Proveedor>>(`${this.apiurl}/paginado?pagina=${pagina}&cantidad=${cantidad}`);
  }

  filtrarPorNombre(nombre: string, pagina: number):Observable<PaginacionResponse<Proveedor>> {
    return this._http.get<PaginacionResponse<Proveedor>>(`${this.apiurl}/buscar`,{params:new HttpParams().set('nombre',nombre)})
  }
}
