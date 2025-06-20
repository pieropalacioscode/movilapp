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

  imagenesRecepcion: string[] = [];            // Imagenes ya guardadas (de Firebase)
  imagenesPreview: string[] = [];              // Base64 para previsualizar nuevas
  imagenesSeleccionadas: File[] = [];          // Archivos reales para enviar

  imagenAmpliada: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private pedidoService: PedidosProvedorService,
    private fb: FormBuilder,
    private alert: AlertService
  ) {}

  get detalles(): FormArray {
    return this.pedidoForm.get('detalles') as FormArray;
  }

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    this.pedidoForm = this.fb.group({
      id: new FormControl<number | null>(null),
      proveedor: new FormControl<string | null>(null),
      fecha: new FormControl<string | null>(null),
      estado: new FormControl<string | null>(null),
      descripcionPedido: new FormControl<string | null>(null),
      descripcionRecepcion: new FormControl('', { nonNullable: true }),
      imagen: new FormControl<string | null>(null),
      detalles: this.fb.array([])
    });

    // Cargar pedido
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) this.getPedidoDetalle(id);
  }

  getPedidoDetalle(id: number) {
    this.pedidoService.getPedidoDetalle(id).subscribe({
      next: (pedido: PedidoDetalleLibroResponse) => {
        this.pedidoForm.patchValue({
          id: pedido.id,
          proveedor: pedido.proveedor,
          fecha: pedido.fecha,
          estado: pedido.estado,
          descripcionPedido: pedido.descripcionPedido,
          descripcionRecepcion: pedido.descripcionRecepcion,
          imagen: pedido.imagen
        });

        if (pedido.detalles?.length) {
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

        if (pedido.imagen) {
          this.imagenesRecepcion = pedido.imagen.split(',').map(url => url.trim());
        }
      },
      error: err => console.error('Error al cargar el pedido', err)
    });
  }

  get confirmacionValida() {
    return this.pedidoForm.get('descripcionRecepcion')?.value?.trim().length > 0 &&
      this.detalles.controls.every(d => d.get('cantidadRecibida')?.value >= 0);
  }

  enviarConfirmacion() {
    const idPedido = this.pedidoForm.get('id')?.value;
    const idSucursal = 1;
    const descripcionRecepcion = this.pedidoForm.get('descripcionRecepcion')?.value;

    const detalles = this.detalles.controls.map(d => ({
      id: d.get('id')?.value,
      idPedidoProveedor: idPedido,
      idLibro: d.get('idLibro')?.value,
      cantidadPedida: d.get('cantidadPedida')?.value,
      cantidadRecibida: d.get('cantidadRecibida')?.value,
      precioUnitario: d.get('precioUnitario')?.value
    }));

    const formData = new FormData();
    formData.append('idPedido', idPedido.toString());
    formData.append('idSucursal', idSucursal.toString());
    formData.append('descripcionRecepcion', descripcionRecepcion);
    formData.append('detallesJson', JSON.stringify(detalles));

    // Adjuntar imágenes reales seleccionadas
    this.imagenesSeleccionadas.forEach(file => {
      formData.append('imagenes', file);
    });

    this.pedidoService.confirmarPedidoConImagen(formData).subscribe({
      next: () => {
        this.alert.success('📦 Pedido confirmado correctamente con imagen');
        this.modoConfirmacion = false;
        this.getPedidoDetalle(idPedido);
        this.imagenesPreview = [];
        this.imagenesSeleccionadas = [];
      },
      error: () => {
        this.alert.error('❌ Error al confirmar el pedido con imagen');
      }
    });
  }

  // 📷 Previsualizar imágenes seleccionadas
  onSeleccionImagenes(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    this.imagenesSeleccionadas = Array.from(input.files);
    this.imagenesPreview = [];

    for (const file of this.imagenesSeleccionadas) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenesPreview.push(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  // 🔍 Ampliar imagen al hacer clic
  abrirImagen(url: string) {
    this.imagenAmpliada = url;
  }

  cerrarImagen() {
    this.imagenAmpliada = null;
  }

  // ❌ Remover imagen previsualizada
  removerImagen(index: number) {
    this.imagenesPreview.splice(index, 1);
    this.imagenesSeleccionadas.splice(index, 1);
  }
}
