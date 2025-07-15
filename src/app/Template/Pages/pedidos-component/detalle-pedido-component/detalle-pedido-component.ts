import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { PedidosProvedorService } from '../../../../Service/pedidos-provedor-service';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PedidoDetalleLibroResponse } from '../../../../Models/pedidoDetalleRequest';
import { AlertService } from '../../../../Service/alert-service';
import { Dialog } from '@capacitor/dialog';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

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
  ) { }

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
      idPersona: new FormControl<number | null>(null),
      nombreCliente: new FormControl<string | null>(null),
      lote: new FormControl<string | null>(null),
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
          imagen: pedido.imagen,
          idPersona: pedido.idPersona,
          nombreCliente: pedido.nombreCliente,
          lote: pedido.detalles?.[0]?.lote ?? null
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
              precioUnitario: d.precioUnitario,
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
    return this.pedidoForm.get('descripcionRecepcion')?.valid && this.detalles.valid;
  }
  async takePhoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        webUseInput: true // Important for web
      });

      if (image.dataUrl) {
        this.imagenesPreview.push(image.dataUrl);
        // Convert dataUrl to File object for sending
        const blob = this.dataURLtoBlob(image.dataUrl);
        const file = new File([blob], `photo_${Date.now()}.jpeg`, { type: 'image/jpeg' });
        this.imagenesSeleccionadas.push(file);
      }
    } catch (e) {
      console.error('Error al tomar foto:', e);
      this.alert.error('no se pudo tomar los permisos necesarios');
    }
  }

  private dataURLtoBlob(dataurl: string) {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }


  enviarConfirmacion(estado: 'Recibido' | 'Cancelado' = 'Recibido') {
    const idPedido = this.pedidoForm.get('id')?.value;
    const idSucursal = 1;
    const descripcionRecepcion = this.pedidoForm.get('descripcionRecepcion')?.value;

    if (!idPedido || !descripcionRecepcion?.trim()) {
      this.alert.error('❌ Faltan datos requeridos');
      return;
    }

    const detalles = this.detalles.controls.map(d => ({
      id: d.get('id')?.value || 0,
      idPedidoProveedor: idPedido,
      idLibro: d.get('idLibro')?.value || 0,
      cantidadPedida: d.get('cantidadPedida')?.value || 0,
      cantidadRecibida: d.get('cantidadRecibida')?.value || 0,
      precioUnitario: d.get('precioUnitario')?.value || 0
    }));

    // Leer imágenes como base64 (async)
    const promesasImagenes = this.imagenesSeleccionadas.map(file => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1]; // solo la parte base64
          resolve(base64);
        };
        reader.onerror = () => reject('Error al leer imagen');
        reader.readAsDataURL(file);
      });
    });

    // Esperar a que se conviertan todas las imágenes
    Promise.all(promesasImagenes)
      .then(imagenesBase64 => {
        const payload = {
          idPedido: idPedido,
          idSucursal: idSucursal,
          descripcionRecepcion: descripcionRecepcion.trim(),
          detalles: detalles,
          imagenesBase64: imagenesBase64,
          estado: estado
        };

        console.log('=== Payload JSON final ===');
        console.log(payload);

        // Enviar como JSON
        this.pedidoService.confirmarPedidoJson(payload).subscribe({
          next: (data) => {
            console.log('✅ Respuesta exitosa:', data);
            this.alert.success('📦 Pedido confirmado correctamente');
            this.getPedidoDetalle(idPedido);
            this.modoConfirmacion = false;
          },
          error: (err) => {
            console.error('❌ Error completo:', JSON.stringify(err, null, 2));
            this.alert.error('❌ Error al confirmar pedido');
          }
        });
      })
      .catch(error => {
        console.error('❌ Error al convertir imágenes:', error);
        this.alert.error('❌ No se pudo convertir las imágenes');
      });
  }


  async confirmarCancelacion() {
    const { value } = await Dialog.confirm({
      title: '¿Cancelar Pedido?',
      message: '¿Estás seguro de que deseas cancelar este pedido?',
      okButtonTitle: 'Sí, cancelar',
      cancelButtonTitle: 'No'
    });

    if (value) {
      this.enviarConfirmacion('Cancelado');
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




  onSeleccionImagenes(event: any) {
    if (event.target.files) {
      for (const file of event.target.files) {
        this.imagenesSeleccionadas.push(file);
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagenesPreview.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  }


  rellenarCantidadesRecibidas() {
    const detallesFormArray = this.pedidoForm.get('detalles') as FormArray;

    detallesFormArray.controls.forEach(control => {
      const grupo = control as FormGroup;
      const cantidadPedida = grupo.get('cantidadPedida')?.value;
      grupo.get('cantidadRecibida')?.setValue(cantidadPedida);
    });
  }

}
