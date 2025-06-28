import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { debounceTime, distinctUntilChanged } from 'rxjs';
import { PedidosProvedorService } from '../../../../../Service/pedidos-provedor-service';
import { AlertService } from '../../../../../Service/alert-service';
import { LibroService } from '../../../../../Service/libro-service';
import { ProveedorService } from '../../../../../Service/proveedor-service';
import { PersonaService } from '../../../../../Service/persona-service';
import { Persona } from '../../../../../Models/persona';


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
  formBuscar: FormGroup;
  personaEncontrada?: Persona;
  mostrarFormularioCliente = false;
  tipoDocumentoSeleccionado: string = '';
  pedidoForm: FormGroup = new FormGroup({
    idProveedor: new FormControl(null, Validators.required),
    estado: new FormControl('iniciado', Validators.required),
    descripcionPedido: new FormControl('')
  });

  libroFormMap = new Map<number, FormGroup>();


  constructor(
    private fb: FormBuilder,
    private pedidoService: PedidosProvedorService,
    private alert: AlertService,
    private libroService: LibroService,
    private proveedorService: ProveedorService,
    private personaService: PersonaService,
  ) {
    this.formBuscar = this.fb.group({
      tipoDocumento: ['DNI', Validators.required], // ✅ Agregado aquí
      numeroDocumento: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

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
      return;
    }

    if (!this.personaEncontrada || !this.personaEncontrada.idPersona) {
      this.alert.warning('Debe asignar un cliente al pedido.');
      return;
    }

    const fecha = new Date();
    const data = {
      pedido: {
        idPersona: this.personaEncontrada.idPersona, // ✅ Aquí va dentro de "pedido"
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
        console.log('Persona encontrada:', this.personaEncontrada);
        this.alert.success('Pedido enviado correctamente');
        this.pedidoForm.reset();
        this.detalles = [];
        this.librosFiltrados = [];
        this.personaEncontrada = undefined;
        console.log(data);
        
      },
      error: err => {
        this.alert.error('Error al registrar el pedido');
        console.error(err);
        console.log(data);
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
  numeroDocumentoSeleccionado: string = '';

  //Cliente
  buscarCliente() {
    const tipo = this.formBuscar.get('tipoDocumento')?.value;
    const nro = this.formBuscar.get('numeroDocumento')?.value;

    this.tipoDocumentoSeleccionado = tipo;
    this.numeroDocumentoSeleccionado = nro;

    this.personaService.buscarPorDni(tipo, nro).subscribe((resp: Persona) => {
      if (resp.idPersona && resp.idPersona !== 0) {
        // ✅ Persona REAL registrada en BD
        this.personaEncontrada = resp;
        this.mostrarFormularioCliente = false;
      } else if (resp.nombre) {
        // ✅ Persona viene desde RENIEC (sin idPersona)
        this.personaEncontrada = undefined; // No lo tratamos como cliente
        this.alert.warning("Persona no encontrada, creará un nuevo registro.", 'short');
        this.mostrarFormularioCliente = true;
      } else {
        // ❌ Documento no válido o error en consulta
        this.alert.error("No se encontraron datos para el número ingresado.", 'short');
      }
    });
  }



  recibirPersonaGuardada(persona: Persona) {
    this.personaEncontrada = persona;
    this.mostrarFormularioCliente = false;
  }
}
