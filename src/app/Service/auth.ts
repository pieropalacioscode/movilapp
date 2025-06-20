import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { User } from '../Models/User';
import { LoginResponse } from '../Models/loginResponse';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  constructor(private _http: HttpClient,
    private router: Router
  ) { }

  private endpoint = environment.endPoint
  private apiurl = this.endpoint + "Auth"


  login(username: string, password: string) {
    return this._http.post<LoginResponse>(this.apiurl, { username, password }).pipe(
      tap((response: { success: any; token: string; usuario: any; }) => {
        if (response.success) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.usuario));
        }
      })
    );
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token'); // Elimina el token del almacenamiento
    localStorage.removeItem('user');  // Opcional: Elimina la info del usuario
    sessionStorage.clear();           // Limpia todo el sessionStorage
    this.router.navigate(['/auth']);
  }
  
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): any {
    return JSON.parse(localStorage.getItem('user') || '{}');
  }
}
