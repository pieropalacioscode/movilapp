import { Component, OnInit } from '@angular/core';
import { UsuarioSercive } from '../../../../Service/usuario-service';
import { UsuarioPersonaResponse } from '../../../../Models/User';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-perfil-component',
  standalone: false,
  templateUrl: './perfil-component.html',
  styleUrl: './perfil-component.css'
})
export class PerfilComponent implements OnInit {

  usuarioForm!: FormGroup;
  usuario!: UsuarioPersonaResponse | null;
  constructor(private usuarioService: UsuarioSercive, private fb: FormBuilder) {}

   ngOnInit() {
    // Obtener objeto user desde localStorage
    const userData = localStorage.getItem('user');

    if (userData) {
      const user = JSON.parse(userData);
      const idUsuario = user.idUsuario; // ← aquí está tu idUsuario

      if (idUsuario) {
        this.getUsuario(Number(idUsuario));
      } else {
        console.error("El objeto user no contiene idUsuario");
      }
    } else {
      console.error("No se encontró 'user' en localStorage");
    }
  }

  getUsuario(id: number) {
    this.usuarioService.getUsuario(id).subscribe({
      next: (res) => {
        this.usuario = res;

        // Crear el formulario con los datos obtenidos
        this.usuarioForm = this.fb.group({
          nombre: [res.nombre],
          apellido: [res.apellido],
          tipoDocumento: [res.tipoDocumento],
          numeroDocumento: [res.numeroDocumento],
          telefono: [res.telefono]
        });
      }
    })
  }
}
