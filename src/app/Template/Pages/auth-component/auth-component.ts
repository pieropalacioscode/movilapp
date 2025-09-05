import { Component } from '@angular/core';
import { Auth } from '../../../Service/auth';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from '../../../Models/User';
import { Router } from '@angular/router';
import { AlertService } from '../../../Service/alert-service';

@Component({
  selector: 'app-auth-component',
  standalone: false,
  templateUrl: './auth-component.html',
  styleUrl: './auth-component.css'
})
export class AuthComponent {

  formulario!: FormGroup;
  private user: User[] = []
  constructor(
    private fb: FormBuilder,
    private authService: Auth,
    private router: Router,
    private alert: AlertService
  ) {
    this.formulario = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  login() {
    const val = this.formulario.value
    if (val.username && val.password) {
      this.authService.login(val.username, val.password).subscribe({
        next: (response) => {
          if (val.username == "admin" || val.username == "vendedor" || val.username=="vendedor2") {
            console.log("User is logged in");
            this.router.navigateByUrl('');
            this.alert.success("Bienvenido", 'short')
          }
        },
        error: (err) => {
          this.alert.error("Credenciales Incorrectas",'short')
        }
      })
    }
  }
  logout() {
    this.authService.logout()
  }
  

}
