import { Component } from '@angular/core';
import { Auth } from '../../../Service/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-component',
  standalone: false,
  templateUrl: './home-component.html',
  styleUrl: './home-component.css'
})
export class HomeComponent {
  constructor (private auth:Auth,
    private router: Router
  ){}
  isOpen = false;
  mostrarSubmenu = false;
  toggleSidebar() {
    this.isOpen = !this.isOpen;
  }
  logout(){
    
    try {
      this.auth.logout()
      alert("se cerro la sesion")
    } catch (error) {
      console.log(error);
      
    }
  }

  esRutaActiva(rutas: string[]): boolean {
  return rutas.some(ruta => this.router.url.includes(ruta));
}
}
