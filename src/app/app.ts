import { Component, OnInit } from '@angular/core';
import { App as CapacitorApp } from '@capacitor/app';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App implements OnInit{
  constructor(private router: Router) {}

  ngOnInit(): void {
    CapacitorApp.addListener('backButton', () => {
      const currentUrl = this.router.url;

      if (currentUrl === '/home' || currentUrl === '/auth') {
        CapacitorApp.exitApp(); // 🚪 Cierra la app si está en una pantalla raíz
      } else {
        window.history.back(); // 🔙 Retrocede si hay historial
      }
    });
  }

  protected title = 'libmovil';
}
