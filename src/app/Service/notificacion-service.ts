import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import * as signalR from '@microsoft/signalr';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { Notificacion } from '../Models/pedidos';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  public hubConnection!: signalR.HubConnection; // ✅ Usar ! para indicar que se inicializará
  private notificacionSubject = new Subject<any>();
  public notificacion$ = this.notificacionSubject.asObservable();
  public notificaciones: any[] = [];
  private endpoint = environment.endPoint;
  private apiurl = this.endpoint + 'Notificacion';
  private cantidadSubject = new BehaviorSubject<number>(0);
  public cantidadNotificaciones$ = this.cantidadSubject.asObservable();
  constructor(private http: HttpClient) {
    // No inicializar SignalR en el constructor
  }

  // ✅ Método público para inicializar SignalR (llamar desde ngOnInit)
  public initializeSignalRConnection(): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`http://192.168.1.3:5229/hubs/notificaciones`) // ✅ Corregido: notificaciones (plural)
      .withAutomaticReconnect()
      .build();

    // Escuchar notificaciones desde el servidor
    this.hubConnection.on('RecibirNotificacion', (data) => {
      this.notificaciones.unshift(data);
      this.notificacionSubject.next(data);
      this.cantidadSubject.next(this.notificaciones.length);
    });

    // Iniciar conexión
    this.startConnection();
  }

  private async startConnection(): Promise<void> {
    try {
      await this.hubConnection.start();
    } catch (err) {
      // Reintentar después de 5 segundos
      setTimeout(() => this.startConnection(), 5000);
    }
  }

  // ✅ Método para llamar al endpoint que verifica stock
  public verificarStock(): Observable<any> {
    return this.http.get(`${this.apiurl}/verificar-stock`);
  }

  // ✅ Método para obtener todas las notificaciones
  public obtenerNotificaciones(): Observable<any> {
    return this.http.get(`${this.apiurl}`);
  }

  marcarComoLeida(notificacion: Notificacion): Observable<any> {
    return this.http.put(`${this.apiurl}`, notificacion);
  }
  updateNotificacion(noti: Notificacion): Observable<any> {
    return this.http.put(`${this.apiurl}`, noti);
  }
  getNotificacionById(id: number): Observable<Notificacion> {
    return this.http.get<Notificacion>(`${this.apiurl}/${id}`);
  }


  // ✅ Obtener notificaciones no leídas
  public obtenerNoLeidas(): Observable<any> {
    return this.http.get(`${this.apiurl}/no-leidas`);
  }

  // ✅ Método para desconectar SignalR
  public disconnect(): Promise<void> {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      return this.hubConnection.stop();
    }
    return Promise.resolve();
  }

  // ✅ Obtener estado de conexión
  public get connectionState(): signalR.HubConnectionState | undefined {
    return this.hubConnection?.state;
  }
}