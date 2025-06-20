import { Component, OnInit } from '@angular/core';
import { PedidosProvedorService } from '../../../Service/pedidos-provedor-service';
import { Pedidos } from '../../../Models/pedidos';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-pedidos-component',
  standalone: false,
  templateUrl: './pedidos-component.html',
  styleUrl: './pedidos-component.css'
})
export class PedidosComponent implements OnInit {

  pedidos: Pedidos[] = [];
  constructor(
    private _pedidoService: PedidosProvedorService,
     private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const estado = params.get('estado');
      if (estado) {
        this.getPedidos(estado);
      }
    });
  }
  getPedidos(estado: string) {
    this._pedidoService.getPedidos(estado).subscribe({
      next: (response) => {
        this.pedidos = response;
      }
    });
  }

}
