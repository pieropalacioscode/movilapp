import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Pedidos } from '../Models/pedidos';
import { environment } from '../../environments/environment';
import { observableToBeFn } from 'rxjs/internal/testing/TestScheduler';
import { ConfirmarRecepcionRequest, PedidoDetalleLibroResponse, PedidoDetalleRequest } from '../Models/pedidoDetalleRequest';

@Injectable({
  providedIn: 'root'
})
export class PedidosProvedorService {
  private endpoint = environment.endPoint;
  private apiurl = this.endpoint + 'PedidoProveedor';
  constructor(private _http: HttpClient) { }

getPedidos(estado: string): Observable<Pedidos[]> {
  const params = new HttpParams().set('estado', estado);
  return this._http.get<Pedidos[]>(this.apiurl + '/estado', { params });
}

crearPedido(pedido:PedidoDetalleRequest):Observable<PedidoDetalleRequest>{
  return this._http.post<PedidoDetalleRequest>(this.apiurl+'/create-with-details',pedido)
}

getPedidoDetalle(id:number):Observable<PedidoDetalleLibroResponse>{
  return this._http.get<PedidoDetalleLibroResponse>(`${this.apiurl}/con-detalles/${id}`)
}
  confirmarPedido(payload: ConfirmarRecepcionRequest): Observable<any> {
    return this._http.put(`${this.apiurl}/confirmar-recepcion`, payload);
  }
}
