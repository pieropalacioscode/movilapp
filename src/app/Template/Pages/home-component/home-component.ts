import { Component, OnInit, OnDestroy } from '@angular/core';
import { Auth } from '../../../Service/auth';
import { Router } from '@angular/router';
import { NotificacionService } from '../../../Service/notificacion-service';
import { AlertService } from '../../../Service/alert-service';

@Component({
  selector: 'app-home-component',
  standalone: false,
  templateUrl: './home-component.html',
  styleUrl: './home-component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  isOpen = false;
  mostrarSubmenu = false;
  isDarkMode = false;

  // ✅ Para el componente toast personalizado
  mostrarToast = false;
  toastMensaje: string = '';
  toastTipo: 'success' | 'error' | 'warning' = 'success';

  cantidadNotificaciones: number = 0;

  constructor(
    private auth: Auth,
    private router: Router,
    public notiService: NotificacionService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.initializeTheme();
    this.initializeAlerts();
    this.initializeNotifications();
    this.notiService.cantidadNotificaciones$.subscribe(c => {
      this.cantidadNotificaciones = c;
    });
  }

  verNotificaciones(){}

  private initializeAlerts(): void {
    this.alertService.alerta$.subscribe(({ mensaje, tipo }) => {
      // ✅ Usar tu componente toast personalizado
      this.mostrarToastPersonalizado(mensaje, tipo);
    });
  }

  // ✅ Método para mostrar toast personalizado
  private mostrarToastPersonalizado(mensaje: string, tipo: 'success' | 'error' | 'warning'): void {
    this.toastMensaje = mensaje;
    this.toastTipo = tipo;
    this.mostrarToast = true;

    // Auto-ocultar después de 4 segundos
    setTimeout(() => {
      this.mostrarToast = false;
    }, 4000);
  }

  // ✅ Método para cerrar toast manualmente
  cerrarToast(): void {
    this.mostrarToast = false;
  }

  private initializeNotifications(): void {
    this.notiService.initializeSignalRConnection();

    this.cargarNotificacionesExistentes(); // ✅ Primero carga las previas

    this.notiService.notificacion$.subscribe(notificacion => {
      this.cantidadNotificaciones = this.notiService.notificaciones.length;

      // ✅ Mostrar el toast y sonido
      this.alertService.warning(notificacion.mensaje, 'long');
      // this.reproducirSonidoNotificacion();
    });

    this.verificarStockInicial();

    // 🔁 Verifica cada 10 min
    setInterval(() => {
      this.verificarStock();
    }, 10 * 60 * 1000);
  }



  private initializeTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode = savedTheme === 'dark';

    const html = document.documentElement;
    if (this.isDarkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }


  // ✅ Cargar notificaciones existentes
  private cargarNotificacionesExistentes(): void {
    this.notiService.obtenerNotificaciones().subscribe(data => {
      this.notiService.notificaciones = data;
      this.cantidadNotificaciones = data.length;
    });
  }


  // ✅ Verificación inicial de stock
  private verificarStockInicial(): void {
    setTimeout(() => {
      this.verificarStock();
    }, 2000); // Esperar 2 segundos después de cargar la página
  }

  // ✅ Verificar stock
  private verificarStock(): void {
    this.notiService.verificarStock().subscribe({
      next: (response) => {
      },
      error: (error) => {
        console.error('❌ Error verificando stock:', error);
      }
    });
  }

  // // ✅ Reproducir sonido de notificación (opcional)
  // private reproducirSonidoNotificacion(): void {
  //   try {
  //     const audio = new Audio('assets/sounds/notification.mp3');
  //     audio.volume = 0.3;
  //     audio.play().catch(e => console.log('No se pudo reproducir sonido:', e));
  //   } catch (error) {
  //     console.log('Sonido de notificación no disponible');
  //   }
  // }

  // ✅ Método para marcar todas las notificaciones como leídas
  marcarTodasComoLeidas(): void {
    // Aquí puedes implementar la lógica para marcar como leídas
    this.cantidadNotificaciones = 0;
    this.alertService.success('Todas las notificaciones han sido marcadas como leídas');
  }

  // ✅ Método para verificar stock manualmente
  verificarStockManual(): void {
    this.alertService.success('Verificando stock...');
    this.verificarStock();
  }

  // Métodos existentes...
  toggleSidebar() {
    this.isOpen = !this.isOpen;
  }

  logout() {
    try {
      this.auth.logout();
      this.alertService.success("Sesión cerrada correctamente");
    } catch (error) {
      console.log(error);
      this.alertService.error("Error al cerrar sesión");
    }
  }

  esRutaActiva(rutas: string[]): boolean {
    return rutas.some(ruta => this.router.url.includes(ruta));
  }

  getCurrentTime(): string {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'America/Lima',
      hour12: false
    };
    return new Intl.DateTimeFormat('es-PE', options).format(date);
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    const html = document.documentElement;
    if (this.isDarkMode) {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  ngOnDestroy(): void {
    // Desconectar SignalR al destruir el componente
    this.notiService.disconnect();
  }
  mostrarDropdownNotificaciones = false;
  // ✅ Toggle dropdown de notificaciones
  toggleNotificaciones(): void {
    this.mostrarDropdownNotificaciones = !this.mostrarDropdownNotificaciones;
  }

}