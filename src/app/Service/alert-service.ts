import { Injectable } from '@angular/core';
import { HotToastService } from '@ngxpert/hot-toast';
import { Toast } from '@capacitor/toast';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(private toast: HotToastService) { }

  async success(message: string, duration: 'short' | 'long' = 'short') {
    await this.show(message, duration, 'success');
  }

  async error(message: string, duration: 'short' | 'long' = 'long') {
    await this.show(message, duration, 'error');
  }

  async warning(message: string, duration: 'short' | 'long' = 'long') {
    await this.show(message, duration, 'warning');
  }

  private async show(message: string, duration: 'short' | 'long', type: 'success' | 'error' | 'warning') {
    const isNative = Capacitor.isNativePlatform();

    if (isNative) {
      await Toast.show({ text: message, duration });
    } else {
      const durationMs = duration === 'short' ? 2000 : 3500;
      switch (type) {
        case 'success':
          this.toast.success(message, { duration: durationMs, icon: '✔️' });
          break;
        case 'error':
          this.toast.error(message, { duration: durationMs, icon: '🚫' });
          break;
        case 'warning':
          this.toast.show(message, { duration: durationMs, icon: '⚠️' });
          break;
      }
    }
  }

}
