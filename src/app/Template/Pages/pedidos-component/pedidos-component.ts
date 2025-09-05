import { Component, OnInit } from '@angular/core';
import { PedidosProvedorService } from '../../../Service/pedidos-provedor-service';
import { Pedidos } from '../../../Models/pedidos';
import { ActivatedRoute, Router } from '@angular/router';
import { PedidoDetalleLibroResponse } from '../../../Models/pedidoDetalleRequest';
import { Directory, Filesystem, WriteFileResult } from '@capacitor/filesystem';
import { AlertService } from '../../../Service/alert-service';

@Component({
  selector: 'app-pedidos-component',
  standalone: false,
  templateUrl: './pedidos-component.html',
  styleUrl: './pedidos-component.css'
})
export class PedidosComponent implements OnInit {
  estadoFiltro: string = '';
  pedidos: PedidoDetalleLibroResponse[] = [];
  fileOpener: any;
  constructor(
    private _pedidoService: PedidosProvedorService,
    private alerts: AlertService,
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
  generandoPDF: boolean = false;
  async generarPDF(idProveedor: number, fecha: string) {
    this.generandoPDF = true;

    // Convertir string a Date
    const fechaObj = new Date(fecha);

    if (!fechaObj || isNaN(fechaObj.getTime())) {
      this.alerts.error('Fecha inválida', 'short');
      this.generandoPDF = false;
      return;
    }

    const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
    const dia = String(fechaObj.getDate()).padStart(2, '0');
    const anio = fechaObj.getFullYear();
    const fechaFormateada = `${mes}/${dia}/${anio}`;
    const fechaCodificada = encodeURIComponent(fechaFormateada);

    const nombreArchivo = `Pedidos_${anio}-${mes}-${dia}_Proveedor${idProveedor}.pdf`;

    this._pedidoService.generarPdfPedidosDelDia(fechaCodificada, idProveedor).subscribe({
      next: async (blob) => {
        try {
          const base64Data = await blobToBase64(blob);

          const result: WriteFileResult = await Filesystem.writeFile({
            path: nombreArchivo,
            data: base64Data,
            directory: Directory.Documents
          });

          this.alerts.success('✅ PDF guardado con éxito', 'short');
          await this.fileOpener.open(result.uri, 'application/pdf');
        } catch (error) {
          console.error(error);
          this.alerts.error('❌ Error al guardar o abrir el PDF', 'short');
        }
      },
      error: () => {
        this.alerts.error('❌ No hay pedidos para esta fecha y proveedor', 'short');
      },
      complete: () => {
        this.generandoPDF = false;
      }
    });
  }



}
// Utilidad para convertir blob a base64
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onloadend = () => {
      const base64data = (reader.result as string).split(',')[1];
      resolve(base64data);
    };
    reader.readAsDataURL(blob);
  });

}