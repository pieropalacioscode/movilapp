import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Pedidos } from '../Models/pedidos';
import { environment } from '../../environments/environment';
import { observableToBeFn } from 'rxjs/internal/testing/TestScheduler';
import { ConfirmarRecepcionRequest, ContadorEstadoResponse, PedidoDetalleLibroResponse, PedidoDetalleRequest } from '../Models/pedidoDetalleRequest';
import { PaginacionResponse } from '../Models/PaginacionResponse';
import { CapacitorHttp, HttpOptions } from '@capacitor/core';
import { HttpResponse } from '@capacitor/core';

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

  crearPedido(pedido: PedidoDetalleRequest): Observable<PedidoDetalleRequest> {
    return this._http.post<PedidoDetalleRequest>(this.apiurl + '/create-with-details', pedido)
  }

  getPedidoDetalle(id: number): Observable<PedidoDetalleLibroResponse> {
    return this._http.get<PedidoDetalleLibroResponse>(`${this.apiurl}/con-detalles/${id}`)
  }
  // En tu servicio (pedidoService)
  confirmarPedidoJson(payload: any): Observable<any> {
    return this._http.put(`${this.apiurl}/confirmar-recepcion-json`, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }



  getPedidoPorFecha(fecha: string, pagina: number, cantidad: number): Observable<PaginacionResponse<PedidoDetalleLibroResponse>> {
    const params = new HttpParams()
      .set('fecha', fecha)
      .set('pagina', pagina.toString())
      .set('cantidad', cantidad.toString());

    return this._http.get<PaginacionResponse<PedidoDetalleLibroResponse>>(`${this.apiurl}/fecha`, { params });
  }

  getPedidosDetallesEstado(estado: string, pagina: number, cantidad: number): Observable<PaginacionResponse<PedidoDetalleLibroResponse>> {
    const params = new HttpParams()
      .set('estado', estado)
      .set('pagina', pagina.toString())
      .set('cantidad', cantidad.toString());

    return this._http.get<PaginacionResponse<PedidoDetalleLibroResponse>>(`${this.apiurl}/Detalles/estado`, { params });
  }

  getContEstado(): Observable<ContadorEstadoResponse> {
    return this._http.get<ContadorEstadoResponse>(`${this.apiurl}/contador`);
  }

  generarPdfPedidosDelDia(fecha: string, idProveedor: number): Observable<Blob> {
    const url = `${this.apiurl}/pdf-dia-fecha?fecha=${fecha}&idProveedor=${idProveedor}`;
    return this._http.get(url, { responseType: 'blob' });
  }

  obtenerProveedores(): Observable<any[]> {
    return this._http.get<any[]>(`http://192.168.1.8:5229/Proveedor`);
  }

  generarLinkPdf(fecha: string, idProveedor: number): Observable<{ url: string }> {

    const params = new HttpParams()
      .set('fecha', fecha)
      .set('idProveedor', idProveedor.toString());

    return this._http.get<{ url: string }>(`${this.apiurl}/pdf-link-firebase`, { params });
  }

}
