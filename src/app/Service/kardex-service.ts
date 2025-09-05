import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";

@Injectable({
    providedIn: 'root'
})
export class KardexService {
    private enpoint = environment.apiurl
    private apiUrl = this.enpoint + 'Kardex'
    constructor(private http: HttpClient) { }

    updateStock(idLibro: number, stock: number): Observable<any> {
        const body = { idLibro, stock }; // 👈 estructura exacta
        return this.http.put(`${this.apiUrl}/actualizar-stock/${idLibro}`, body);
    }
}