import { Component, OnInit } from '@angular/core';
import { PedidosProvedorService } from '../../../../Service/pedidos-provedor-service';
import { AlertService } from '../../../../Service/alert-service';
import { PedidoDetalleLibroResponse } from '../../../../Models/pedidoDetalleRequest';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-realizar-pedido-component',
  standalone: false,
  templateUrl: './realizar-pedido-component.html',
  styleUrl: './realizar-pedido-component.css'
})
export class RealizarPedidoComponent implements OnInit {
   modoHoy = false;
  pedidoHoy: PedidoDetalleLibroResponse | null = null;
  mostrarPedidosHoy = false;

  constructor(
    private pedidoService: PedidosProvedorService,
    private alert: AlertService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Detectar si la ruta es /realizar-pedido/hoy
    this.modoHoy = this.route.snapshot.routeConfig?.path?.includes('hoy') || false;

    if (this.modoHoy) {
      this.verPedidosHoy(); // Cargar automáticamente si es vista de hoy
    }
  }

  verPedidosHoy() {
    const fecha = new Date().toLocaleDateString('en-US'); // Formato MM/DD/YYYY
    this.pedidoService.getPedidoPorFecha(fecha).subscribe({
      next: res => {
        this.pedidoHoy = res;
        this.mostrarPedidosHoy = true;
      },
      error: err => {
        this.alert.warning('No se encontraron pedidos para hoy');
        this.pedidoHoy = null;
        this.mostrarPedidosHoy = true;
      }
    });
  }
}
