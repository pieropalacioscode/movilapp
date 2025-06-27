import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Toast } from '@capacitor/toast';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alertaSubject = new Subject<{ mensaje: string, tipo: 'success' | 'error' | 'warning' }>();
  alerta$ = this.alertaSubject.asObservable();

  constructor() {}

  async success(message: string, duration: 'short' | 'long' = 'short') {
    await this.show(message, duration, 'success');
  }

  async error(message: string, duration: 'short' | 'long' = 'long') {
    await this.show(message, duration, 'error');
  }

  async warning(message: string, duration: 'short' | 'long' = 'long') {
    await this.show(message, duration, 'warning');
  }

  private async show(message: string, duration: 'short' | 'long', tipo: 'success' | 'error' | 'warning') {
    const isNative = Capacitor.isNativePlatform();

    if (isNative) {
      await Toast.show({ text: message, duration });
    } else {
      this.alertaSubject.next({ mensaje: message, tipo });
    }
  }
}
