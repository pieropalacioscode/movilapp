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
  mostrarModuloCliente: boolean = false;
    // SOLO AGREGAR ESTAS 3 NUEVAS VARIABLES:
  mostrarLibrosProveedor: boolean = false;
  filtroProveedorControl = new FormControl('');
  librosFiltradosProveedor: any[] = [];

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
    this.pedidoForm.get('idProveedor')?.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(idProveedor => {
        if (idProveedor) {
          this.obetenerlibrosProveedor(1, idProveedor, this.cantidadPorPagina);
        } else {
          this.librosFiltrados = [];
        }
      });
          this.filtroProveedorControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(filtro => {
        this.filtrarLibrosProveedor(filtro || '');
      });
  }
  paginaActual: number = 1;
  cantidadPorPagina: number = 10;
  totalPaginas: number = 0;
  totalPedidos: number = 0;
  idProveedorSeleccionado?: number;
  total:number =0;

  obetenerlibrosProveedor(pagina: number, idProveedor: number, cantidad: number) {
    this.idProveedorSeleccionado = idProveedor;

    this.libroService.getLibroProveedor(pagina, idProveedor, cantidad).subscribe({
      next: (response) => {
        this.librosFiltrados = response.items;
        this.paginaActual = response.paginaActual;
        this.totalPaginas = response.totalPaginas;
        this.librosFiltradosProveedor = response.items;
        this.total=response.total;
        this.libroFormMap.clear(); // Limpiar formularios anteriores si se desea
        this.librosFiltrados.forEach(libro => this.crearFormularioLibro(libro));
      },
      error: err => {
        console.error('Error al obtener libros por proveedor', err);
        this.librosFiltrados = [];
        this.librosFiltradosProveedor = [];
      }
    });
  }


  quitarCliente() {
    this.personaEncontrada = undefined;
    this.formBuscar.get('numeroDocumento')?.setValue('');
    this.mostrarFormularioCliente = false;
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
    const fecha = new Date();
    const data = {
      pedido: {
        idPersona: this.personaEncontrada?.idPersona, // ✅ Aquí va dentro de "pedido"
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
        this.formBuscar.get('numeroDocumento')?.setValue('');
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
    this.mostrarLibrosProveedor = false;
    this.filtroProveedorControl.setValue('');
    this.librosFiltradosProveedor = [];
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

  limpiarBusqueda() {
    this.busquedaControl.setValue('');
  }

  recibirPersonaGuardada(persona: Persona) {
    this.personaEncontrada = persona;
    this.mostrarFormularioCliente = false;
  }

  cambiarPagina(nuevaPagina: number) {
    if (nuevaPagina < 1 || nuevaPagina > this.totalPaginas) return;
    this.paginaActual = nuevaPagina;
    const idProveedor = this.pedidoForm.get('idProveedor')?.value;
    if (idProveedor) {
      this.obetenerlibrosProveedor(this.paginaActual, idProveedor, this.cantidadPorPagina);
    } // o getPedidos(), según el contexto
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

  // SOLO AGREGAR ESTOS 3 NUEVOS MÉTODOS:
  toggleLibrosProveedor() {
    this.mostrarLibrosProveedor = !this.mostrarLibrosProveedor;
  }

  filtrarLibrosProveedor(filtro: string) {
    if (!filtro || filtro.trim() === '') {
      this.librosFiltradosProveedor = [...this.librosFiltrados];
    } else {
      const filtroLower = filtro.toLowerCase().trim();
      this.librosFiltradosProveedor = this.librosFiltrados.filter(libro =>
        libro.titulo?.toLowerCase().includes(filtroLower) ||
        libro.autor?.toLowerCase().includes(filtroLower) ||
        libro.isbn?.toLowerCase().includes(filtroLower)
      );
    }
  }

  limpiarFiltroProveedor() {
    this.filtroProveedorControl.setValue('');
  }
}
