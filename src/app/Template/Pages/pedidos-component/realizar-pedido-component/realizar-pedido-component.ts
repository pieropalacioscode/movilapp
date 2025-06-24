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
  pedidoHoy: PedidoDetalleLibroResponse[] = [];
  mostrarPedidosHoy = false;

  constructor(
    private pedidoService: PedidosProvedorService,
    private alert: AlertService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Detectar si la ruta es /realizar-pedido/hoy
    this.modoHoy = this.route.snapshot.routeConfig?.path?.includes('hoy') || false;

    if (this.modoHoy) {
      this.verPedidosHoy(); // Cargar automáticamente si es vista de hoy
    }
  }
  totalPaginas: number = 0;
  totalPedidos: number = 0;
  paginaActual: number = 1;
  cantidadPorPagina: number = 10;

  verPedidosHoy() {
    const fecha = new Date().toLocaleDateString('en-US'); // Formato MM/DD/YYYY
    this.pedidoService.getPedidoPorFecha(fecha, this.paginaActual, this.cantidadPorPagina)
      .subscribe({
        next: res => {
          this.pedidoHoy = res.items; // ✅ Extraer los pedidos desde la respuesta paginada
          this.totalPaginas = res.totalPaginas;
          this.totalPedidos = res.total;
          this.paginaActual = res.paginaActual;
          this.mostrarPedidosHoy = true;
        },
        error: err => {
          this.alert.warning('No se encontraron pedidos para hoy');
          this.pedidoHoy = [];
          this.mostrarPedidosHoy = true;
        }
      });
  }
  cambiarPagina(nuevaPagina: number) {
    if (nuevaPagina < 1 || nuevaPagina > this.totalPaginas) return;
    this.paginaActual = nuevaPagina;
    this.verPedidosHoy(); // o getPedidos(), según el contexto
    window.scrollTo({ top: 0, behavior: 'smooth' }); // opcional
  }
  // ✅ Utilidad para Math.abs en el template
  abs(value: number): number {
    return Math.abs(value);
  }


  getPaginasVisibles(): number[] {
    const total = this.totalPaginas;
    const actual = this.paginaActual;

    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

    const paginas: number[] = [];

    if (actual > 2) paginas.push(1);         // siempre mostrar la primera

    if (actual > 3) paginas.push(-1);        // -1 representará "..."

    const inicio = Math.max(2, actual - 1);
    const fin = Math.min(total - 1, actual + 1);

    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }

    if (actual < total - 2) paginas.push(-1); // "..." al final

    if (actual < total) paginas.push(total); // última página

    return paginas;
  }

}
