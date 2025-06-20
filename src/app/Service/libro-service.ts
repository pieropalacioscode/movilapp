import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LibroService {
  private endpoint = environment.endPoint;
  
  constructor(private _http: HttpClient) { }


   buscarPorTitulo(titulo: string): Observable<any[]> {
    return this._http.get<any[]>(`https://localhost:7143/Libro/filtroComplete?titulo=${titulo}`);
  }

}
