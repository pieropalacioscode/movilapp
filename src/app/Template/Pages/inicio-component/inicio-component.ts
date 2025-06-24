import { Component, OnInit } from '@angular/core';
import { PedidosProvedorService } from '../../../Service/pedidos-provedor-service';
import { ContadorEstadoResponse } from '../../../Models/pedidoDetalleRequest';

@Component({
  selector: 'app-inicio-component',
  standalone: false,
  templateUrl: './inicio-component.html',
  styleUrl: './inicio-component.css'
})
export class InicioComponent implements OnInit {

  contador?: ContadorEstadoResponse;

  constructor(private pedidosService: PedidosProvedorService
  ) { }

  ngOnInit(): void {
    this.getContadorEstado();
  }

  getContadorEstado() {
    this.pedidosService.getContEstado().subscribe({
      next: (response) => {
        this.contador=response;
      }
    })
  }
}
