import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Inventario } from '../Models/inventario';
import { PaginacionResponse } from '../Models/PaginacionResponse';
import { Libro } from '../Models/libro';

@Injectable({
  providedIn: 'root'
})
export class LibroService {
  private endpoint = 'http://192.168.1.8:5229/';
  private apiurl = this.endpoint + 'Libro';
  constructor(private _http: HttpClient) { }

  buscarPorTitulo(titulo: string): Observable<any[]> {
    return this._http.get<any[]>(`http://192.168.1.8:5229/Libro/filtroComplete?titulo=${titulo}`);
  }

  getInventario(pagina: number, cantidad: number): Observable<PaginacionResponse<Inventario>> {
    const params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('cantidad', cantidad.toString());

    return this._http.get<PaginacionResponse<Inventario>>(`${this.apiurl}/inventario`, { params })
  }

  getBuscarInventario(query: string): Observable<Inventario[]> {
    return this._http.get<Inventario[]>(`${this.apiurl}/buscar-inventario`, {
      params: new HttpParams().set('query', query)
    });
  }

  getLibroProveedor(pagina: number,idProveedor:number,cantidad: number):Observable<PaginacionResponse<Libro>>{
     const params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('cantidad', cantidad.toString());
    return this._http.get<PaginacionResponse<Libro>>(`${this.apiurl}/proveedor/${idProveedor}`,{params})
  }
}
