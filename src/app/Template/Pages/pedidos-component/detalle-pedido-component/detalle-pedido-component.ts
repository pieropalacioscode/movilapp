import { Component, OnInit } from '@angular/core';
import { PedidosProvedorService } from '../../../../Service/pedidos-provedor-service';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConfirmarRecepcionRequest, PedidoDetalleLibroResponse } from '../../../../Models/pedidoDetalleRequest';
import { AlertService } from '../../../../Service/alert-service';

@Component({
  selector: 'app-detalle-pedido-component',
  standalone: false,
  templateUrl: './detalle-pedido-component.html',
  styleUrl: './detalle-pedido-component.css'
})
export class DetallePedidoComponent implements OnInit {
  pedidoForm!: FormGroup;
  modoConfirmacion = false;

  constructor(
    private route: ActivatedRoute,
    private pedidoService: PedidosProvedorService,
    private fb: FormBuilder,
    private alert: AlertService
  ) { }

  get detalles(): FormArray {
    return this.pedidoForm.get('detalles') as FormArray;
  }

  ngOnInit(): void {
    this.pedidoForm = this.fb.group({
      id: new FormControl<number | null>(null),
      proveedor: new FormControl<string | null>(null),
      fecha: new FormControl<string | null>(null),
      estado: new FormControl<string | null>(null),
      descripcionPedido: new FormControl<string | null>(null),
      descripcionRecepcion: new FormControl('', { nonNullable: true }),
      detalles: this.fb.array([])
    });

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.getPedidoDetalle(id);
    }
  }

  getPedidoDetalle(id: number) {
    this.pedidoService.getPedidoDetalle(id).subscribe({
      next: (pedido: PedidoDetalleLibroResponse) => {
        // 👇 Usamos directamente el nuevo modelo
        this.pedidoForm.patchValue({
          id: pedido.id,
          proveedor: pedido.proveedor,
          fecha: pedido.fecha,
          estado: pedido.estado,
          descripcionPedido: pedido.descripcionPedido,
          descripcionRecepcion:pedido.descripcionRecepcion
        });

        if (pedido.detalles && pedido.detalles.length > 0) {
          const detallesForm = pedido.detalles.map(d =>
            this.fb.group({
              id: d.id,                     
              idLibro: d.idLibro,
              titulo: d.titulo,
              isbn: d.isbn,
              imagen: d.imagen,
              cantidadPedida: d.cantidadPedida,
              cantidadRecibida: d.cantidadRecibida,
              precioUnitario: d.precioUnitario
            })
          );

          this.pedidoForm.setControl('detalles', this.fb.array(detallesForm));
        }
      },
      error: err => {
        console.error('Error al cargar el pedido', err);
      }
    });
  }

  get confirmacionValida() {
    return this.pedidoForm.get('descripcionRecepcion')?.value?.trim().length > 0 &&
      this.detalles.controls.every(d => d.get('cantidadRecibida')?.value >= 0);
  }

  enviarConfirmacion() {
    const payload: ConfirmarRecepcionRequest = {
      idPedido: this.pedidoForm.get('id')?.value,
      idSucursal: Number(1), // 👈 asegúrate de que sea número
      descripcionRecepcion: this.pedidoForm.get('descripcionRecepcion')?.value,
      detalles: this.detalles.controls.map(d => ({
        id: d.get('id')?.value,
        idPedidoProveedor: this.pedidoForm.get('id')?.value,
        idLibro: d.get('idLibro')?.value,
        cantidadPedida: d.get('cantidadPedida')?.value,
        cantidadRecibida: d.get('cantidadRecibida')?.value,
        precioUnitario: d.get('precioUnitario')?.value
      }))
    };

    this.pedidoService.confirmarPedido(payload).subscribe({
      next: () => {
        this.alert.success('📦 Pedido confirmado correctamente');
        this.modoConfirmacion = false;
        this.getPedidoDetalle(payload.idPedido)
      },
      error: () => {
        this.alert.error('❌ Error al confirmar el pedido');
      }
    });
  }
}
