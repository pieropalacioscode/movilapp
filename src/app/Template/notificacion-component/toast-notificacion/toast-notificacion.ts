import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-toast-notificacion',
  standalone: false,
  templateUrl: './toast-notificacion.html',
  styleUrl: './toast-notificacion.css'
})
export class ToastNotificacion {
  @Input() mensaje: string = '';
  @Input() tipo: 'success' | 'error' | 'warning' = 'success';
  @Output() cerrar = new EventEmitter<void>(); // ✅ Emitir evento
  
  mostrar = true;

  cerrarToast() {
    this.mostrar = false;
    this.cerrar.emit(); // ✅ Emitir evento al padre
  }

  get icono() {
    switch (this.tipo) {
      case 'success': return '✔️';
      case 'error': return '🚫';
      case 'warning': return '⚠️';
      default: return '';
    }
  }

  get color() {
    switch (this.tipo) {
      case 'success': return 'bg-green-100 border-green-500 text-green-800';
      case 'error': return 'bg-red-100 border-red-500 text-red-800';
      case 'warning': return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      default: return '';
    }
  }
}
