import { afterNextRender, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ProveedorService } from '../../Service/proveedor-service';
import { Proveedor, ProveedorUI } from '../../Models/proveedor';
import { PedidosProvedorService } from '../../Service/pedidos-provedor-service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-proveedor-component',
  standalone: false,
  templateUrl: './proveedor-component.html',
  styleUrl: './proveedor-component.css'
})
export class ProveedorComponent implements OnInit {
  constructor(private proveedorService: ProveedorService,
    private pedidoProveedorService: PedidosProvedorService,
     private cdr: ChangeDetectorRef
  ) { }
  proveedores: ProveedorUI[] = [];
  paginaActual = 1;
  totalPaginas = 0;
  mostrarDetalles = false;
  fechaActual: string = '';
  searchQuery: string = '';

  ngOnInit(): void {
    this.getProveedoresPaginado(this.paginaActual, 10);
  }

onSearchInput(event: Event) {
  const input = event.target as HTMLInputElement;
  this.searchQuery = input.value;

  if (this.searchQuery.trim() === '') {
    this.getProveedoresPaginado(this.paginaActual, 10);
    return;
  }

  this.paginaActual = 1;
  this.proveedorService.filtrarPorNombre(this.searchQuery, this.paginaActual).subscribe({
    next: (res) => {
      console.log('✅ Resultado de búsqueda:', res);

      this.proveedores = (res.items || []).map(p => ({
        ...p,
        mostrarDetalles: false
      }));
      this.totalPaginas = res.totalPaginas || 0;
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('❌ Error al buscar proveedores', err);
      this.proveedores = [];
    }
  });
}



  clearSearch() {
    this.searchQuery = '';
    this.onSearchInput({ target: { value: '' } } as any); // llamada simulada
  }



  // 👇 Utilidad para formatear fecha como "MM/dd/yyyy"
  obtenerFechaActual(): string {
    const hoy = new Date();
    return hoy.toLocaleDateString('en-US'); // ejemplo: "07/08/2025"
  }

  getProveedoresPaginado(pagina: number, cantidad: number) {
    this.proveedorService.getProveedoresPaginado(pagina, cantidad).subscribe({
      next: (res) => {
        this.proveedores = res.items;
        this.paginaActual = res.paginaActual;
        this.totalPaginas = res.totalPaginas;
      },
      error: (err) => {
        console.error('Error al obtener proveedores paginados', err);
      }
    });
  }

  // Método para manejar la expansión de detalles\
  toggleDetalles(index: number)
    : void {
    // Si no existe la propiedad, la inicializamos
    if (!this.proveedores[index].hasOwnProperty("mostrarDetalles")) {
      this.proveedores[index].mostrarDetalles = false
    }

    // Alternamos el estado
    this.proveedores[index].mostrarDetalles = !this.proveedores[index].mostrarDetalles
  }

  // Método para cambiar página\
  cambiarPagina(pagina: number)
    : void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina
      // Aquí cargarías los datos de la nueva página
      this.getProveedoresPaginado(this.paginaActual, 10)
    }
  }
  formatearFecha(fecha: Date): string {
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');
    const anio = fecha.getFullYear();
    return `${mes}/${dia}/${anio}`; // formato MM/dd/yyyy
  }
  getCurrentDate()
    : string {
    const today = new Date()
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    }
    return today.toLocaleDateString('es-ES', options);
  }
  enviarPdfPorWhatsapp(idProveedor: number, telefono: string) {
    const hoy = new Date();

    const fechaFormateadaApi = `${(hoy.getMonth() + 1).toString().padStart(2, '0')}/${hoy.getDate().toString().padStart(2, '0')}/${hoy.getFullYear()}`;
    const fechaEstiloPeru = `${hoy.getDate().toString().padStart(2, '0')}/${(hoy.getMonth() + 1).toString().padStart(2, '0')}/${hoy.getFullYear()}`;

    this.pedidoProveedorService.generarLinkPdf(fechaFormateadaApi, idProveedor).subscribe({
      next: (res) => {
        const urlPdf = res.url;
        const mensaje =
          `👋 Estimado proveedor,

        Le saludamos desde *Librería Saber SAC*.

        📦 Adjuntamos el PDF con los detalles del pedido correspondiente al día ${fechaEstiloPeru}.

        🔗 Puede descargar el archivo directamente desde el siguiente enlace (válido por 24 horas):
        ${urlPdf}

        ⚠️ Este enlace se desactivará automáticamente por motivos de seguridad una vez transcurrido ese tiempo.

        Agradecemos su atención y quedamos atentos a cualquier consulta.

        Atentamente,
        📚 Librería Saber SAC`;


        const mensajeEncoded = encodeURIComponent(mensaje);
        const whatsappURL = `https://wa.me/51${telefono}?text=${mensajeEncoded}`;
        window.open(whatsappURL, '_blank');
      },
      error: (err) => {
        console.error('Error generando el PDF', err);
        alert('Hubo un error al generar el PDF');
      }
    });
  }


}
