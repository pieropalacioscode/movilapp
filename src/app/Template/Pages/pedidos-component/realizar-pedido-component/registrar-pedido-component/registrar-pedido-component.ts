import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';

import { debounceTime, distinctUntilChanged } from 'rxjs';
import { PedidosProvedorService } from '../../../../../Service/pedidos-provedor-service';
import { AlertService } from '../../../../../Service/alert-service';
import { LibroService } from '../../../../../Service/libro-service';
import { ProveedorService } from '../../../../../Service/proveedor-service';


@Component({
  selector: 'app-registrar-pedido-component',
  standalone: false,
  templateUrl: './registrar-pedido-component.html',
  styleUrl: './registrar-pedido-component.css',
  encapsulation: ViewEncapsulation.None
})
export class RegistrarPedidoComponent implements OnInit {
  busquedaControl = new FormControl('');
  librosFiltrados: any[] = [];
  detalles: any[] = [];
  proveedores: any[] = [];
  fechaActual = new Date();

  pedidoForm: FormGroup = new FormGroup({
    idProveedor: new FormControl(null, Validators.required),
    estado: new FormControl('iniciado', Validators.required),
    descripcionPedido: new FormControl('')
  });

  libroFormMap = new Map<number, FormGroup>();
  

  constructor(
    private pedidoService: PedidosProvedorService,
    private alert: AlertService,
    private libroService: LibroService,
    private proveedorService: ProveedorService
  ) { }

  ngOnInit() {
    this.proveedorService.getProveedores().subscribe(data => {
      this.proveedores = data;
    });
    this.busquedaControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(titulo => {
        if (titulo && titulo.length >= 2) {
          this.libroService.buscarPorTitulo(titulo).subscribe(data => {
            this.librosFiltrados = data;
            this.librosFiltrados.forEach(libro => this.crearFormularioLibro(libro));
          });
        } else {
          this.librosFiltrados = [];
        }
      });
  }

  getFormGroup(libroId: number): FormGroup {
    const form = this.libroFormMap.get(libroId);
    if (!form) {
      const nuevoForm = new FormGroup({
        cantidad: new FormControl(null, [Validators.required, Validators.min(1)]),
        precio: new FormControl(null, [Validators.required, Validators.min(0)])
      });
      this.libroFormMap.set(libroId, nuevoForm);
      return nuevoForm;
    }
    return form;
  }
  crearFormularioLibro(libro: any) {
    if (!this.libroFormMap.has(libro.id)) {
      this.libroFormMap.set(libro.id, new FormGroup({
        cantidad: new FormControl(null, [Validators.required, Validators.min(1)]),
        precio: new FormControl(null, [Validators.required, Validators.min(0)])
      }));
    }
  }
  agregarLibro(libro: any) {
    const form = this.libroFormMap.get(libro.id);
    if (!form || form.invalid) {
      this.alert.warning('Completa cantidad y precio');
      return;
    }

    const cantidad = form.get('cantidad')?.value;
    const precio = form.get('precio')?.value;

    const yaAgregado = this.detalles.some(d => d.idLibro === libro.id);
    if (yaAgregado) {
      this.alert.warning('Este libro ya fue agregado al pedido');
      return;
    }

    this.detalles.push({
      idLibro: libro.idLibro,
      titulo: libro.titulo,
      cantidadPedida: cantidad,
      cantidadRecibida: 0,
      precioUnitario: precio
    });

    this.alert.success(`"${libro.titulo}" agregado al pedido`);
    this.libroFormMap.delete(libro.id); // opcional: limpiar formulario
  }

  crearPedido() {
    if (this.pedidoForm.invalid || this.detalles.length === 0) {
      this.alert.warning('Completa los datos del pedido y al menos un libro');
      console.log('Form Value:', this.pedidoForm.value);
      console.log('Detalles:', this.detalles);
      return;
    }
    const fecha = new Date();
    const data = {
      pedido: {
        fecha: new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, -1),
        estado: this.pedidoForm.value.estado,
        idProveedor: this.pedidoForm.value.idProveedor,
        descripcionPedido: this.pedidoForm.value.descripcionPedido,
        descripcionRecepcion: ''
      },
      detalles: this.detalles
    };

    this.pedidoService.crearPedido(data).subscribe({
      next: res => {
        this.alert.success('Pedido enviado correctamente');
        this.pedidoForm.reset();
        this.detalles = [];
        this.librosFiltrados = [];
      },
      error: err => {
        this.alert.error('Error al registrar el pedido');
        console.error(err);
      }
    });
  }

  removerLibro(index: number) {
    this.detalles.splice(index, 1);
  }


  getProveedorSeleccionado() {
  const idSeleccionado = this.pedidoForm.get('idProveedor')?.value;
  return this.proveedores.find(p => p.idProveedor === idSeleccionado);
}

limpiarProveedor() {
  this.pedidoForm.get('idProveedor')?.setValue(null);
}

seleccionarProveedor(proveedor: any) {
  this.pedidoForm.get('idProveedor')?.setValue(proveedor.idProveedor);
}
}
