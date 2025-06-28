import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { Persona } from '../Models/persona';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class PersonaService {

  private endpoint = environment.apiurl;
  private apiUrl = this.endpoint + "Persona"
  constructor(private http: HttpClient) { }


  buscarPorDni(tipo: string, numero: string) {
    return this.http.get<Persona>(`${this.apiUrl}/dni/${tipo}/${numero}`);
  }
  crearPersona(persona:Persona):Observable<Persona>{
    return this.http.post<Persona>(this.apiUrl,persona)
  }

}
