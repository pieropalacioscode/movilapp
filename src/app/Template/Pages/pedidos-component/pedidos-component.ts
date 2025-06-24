import { Component, OnInit } from '@angular/core';
import { PedidosProvedorService } from '../../../Service/pedidos-provedor-service';
import { Pedidos } from '../../../Models/pedidos';
import { ActivatedRoute, Router } from '@angular/router';
import { PedidoDetalleLibroResponse } from '../../../Models/pedidoDetalleRequest';

@Component({
  selector: 'app-pedidos-component',
  standalone: false,
  templateUrl: './pedidos-component.html',
  styleUrl: './pedidos-component.css'
})
export class PedidosComponent implements OnInit {
  estadoFiltro: string = '';
  pedidos: PedidoDetalleLibroResponse[] = [];
  constructor(
    private _pedidoService: PedidosProvedorService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const estado = params.get('estado');
      if (estado) {
        this.estadoFiltro = estado.toLowerCase();
        this.getPedidos(this.estadoFiltro);

      }
    });

  }
  paginaActual: number = 1;
  cantidadPorPagina: number = 10;
  totalPaginas: number = 0;
  totalPedidos: number = 0;
  getPedidos(estado: string) {
    this._pedidoService.getPedidosDetallesEstado(estado, this.paginaActual, this.cantidadPorPagina).subscribe({
      next: (response) => {
        this.pedidos = response.items;
        this.totalPaginas = response.totalPaginas;
        this.totalPedidos = response.total;
        this.paginaActual = response.paginaActual;
      },
      error: (err) => {
        console.error('Error al obtener pedidos', err);
      }
    });
  }
  cambiarPagina(pagina: number) {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;

    this.getPedidos(this.estadoFiltro); // Asegúrate de tener guardado el estado
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getTituloEstado(): string {
    switch (this.estadoFiltro) {
      case 'iniciado': return 'en Proceso';
      case 'recibido': return 'Recibidos';
      case 'cancelado': return 'Cancelado';
      default: return '';
    }
  }


  getPaginasVisibles(): number[] {
    const total = this.totalPaginas;
    const actual = this.paginaActual;

    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

    const paginas: number[] = [];

    if (actual > 2) paginas.push(1);
    if (actual > 3) paginas.push(-1); // representa "..."

    const inicio = Math.max(2, actual - 1);
    const fin = Math.min(total - 1, actual + 1);

    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }

    if (actual < total - 2) paginas.push(-1);
    if (actual < total) paginas.push(total);

    return paginas;
  }

}
