import { Component, OnInit } from '@angular/core';
import { NotificacionService } from '../../Service/notificacion-service';
import { Notificacion } from '../../Models/pedidos';

@Component({
  selector: 'app-notificacion-component',
  standalone: false,
  templateUrl: './notificacion-component.html',
  styleUrl: './notificacion-component.css'
})
export class NotificacionComponent implements OnInit {
  nuevasHoy: Notificacion[] = [];
  noLeidasAntiguas: Notificacion[] = [];
  leidas: Notificacion[] = [];
  mostrarLeidas = false;

  constructor(private notificacionService: NotificacionService) {}

  ngOnInit(): void {
    this.cargarNotificaciones();

    // Escuchar en tiempo real con SignalR
    this.notificacionService.notificacion$.subscribe((nueva) => {
      if (!nueva.leido) {
        if (this.esDeHoy(nueva.fecha)) {
          this.nuevasHoy.unshift(nueva);
        } else {
          this.noLeidasAntiguas.unshift(nueva);
        }
      }
    });
  }

  cargarNotificaciones() {
    this.notificacionService.obtenerNotificaciones().subscribe({
      next: (res: Notificacion[]) => {
        const hoy = new Date();

        this.nuevasHoy = res.filter(n =>
          !n.leido &&
          new Date(n.fecha).toDateString() === hoy.toDateString()
        );

        this.noLeidasAntiguas = res.filter(n =>
          !n.leido &&
          new Date(n.fecha).toDateString() !== hoy.toDateString()
        );

        this.leidas = res.filter(n => n.leido);
      },
      error: (err) => console.error('Error al cargar notificaciones', err)
    });
  }
  filtroActivo: string = 'nuevas'; // 'todas', 'nuevas', 'pendientes', 'leidas'
    // Método para cambiar el filtro
  cambiarFiltro(filtro: string) {
    this.filtroActivo = filtro;
  }

  esDeHoy(fechaStr: string): boolean {
    const fecha = new Date(fechaStr);
    const hoy = new Date();
    return fecha.getDate() === hoy.getDate() &&
           fecha.getMonth() === hoy.getMonth() &&
           fecha.getFullYear() === hoy.getFullYear();
  }

  marcarComoLeida(noti: Notificacion) {
    const notiActualizada = { ...noti, leido: true };
    this.notificacionService.updateNotificacion(notiActualizada).subscribe(() => {
      noti.leido = true;
      this.cargarNotificaciones();
    });
  }

  marcarTodasComoLeidas() {
    [...this.nuevasHoy, ...this.noLeidasAntiguas].forEach(n => {
      this.notificacionService.updateNotificacion({ ...n, leido: true }).subscribe();
    });
    this.cargarNotificaciones();
  }

  toggleLeidas() {
    this.mostrarLeidas = !this.mostrarLeidas;
  }
}
