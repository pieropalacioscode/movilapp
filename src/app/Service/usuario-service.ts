import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { UsuarioPersonaResponse } from '../Models/User';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UsuarioSercive {
  private endpoitn = environment.apiurl
  private apiurl = this.endpoitn+"Usuario"
  constructor(private http : HttpClient){
  }

  getUsuario(id:number): Observable<UsuarioPersonaResponse>{
    return this.http.get<UsuarioPersonaResponse>(`${this.apiurl}/Persona/${id}`)
  }
}
