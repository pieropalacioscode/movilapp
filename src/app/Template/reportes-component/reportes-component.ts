import { Component, OnInit } from '@angular/core';
import { PedidosProvedorService } from '../../Service/pedidos-provedor-service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '../../Service/alert-service';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { Filesystem, Directory, Encoding, WriteFileResult } from '@capacitor/filesystem';
import { FileOpener } from '@awesome-cordova-plugins/file-opener/ngx';

interface DiaCalendario {
  numero: number;
  fecha: Date;
  esDelMes: boolean;
  esHoy: boolean;
  estaSeleccionado: boolean;
}

@Component({
  selector: 'app-reportes-component',
  standalone: false,
  templateUrl: './reportes-component.html',
  styleUrl: './reportes-component.css'
})
export class ReportesComponent implements OnInit {

  form: FormGroup;
  constructor(private fb: FormBuilder, private pedidoService: PedidosProvedorService,
    private alerts: AlertService,
    private fileOpener: FileOpener
  ) {
    registerLocaleData(localeEs);
    this.form = this.fb.group({
      fecha: [this.formatearFecha(new Date()), Validators.required],
      proveedor: [null, Validators.required]
    });
    this.pedidoService.obtenerProveedores().subscribe({
      next: (data) => this.proveedores = data,
      error: () => this.alerts.error('Error al cargar proveedores', 'short')
    });
  }
  fechaSeleccionada = new FormControl(this.formatearFecha(new Date()));
  busquedaProveedor: string = '';
  proveedores: any[] = [];
  proveedoresFiltrados: any[] = [];
  proveedorSeleccionado: any = null;
  generandoPDF: boolean = false;

  ngOnInit(): void {
    // puedes suscribirte a cambios si necesitas
    this.fechaSeleccionada.valueChanges.subscribe(val => {
      console.log('Fecha seleccionada:', val);
    });
    this.pedidoService.obtenerProveedores().subscribe((res) => {
      this.proveedores = res;
    });
    this.generarCalendario();
  }

  private formatearFecha(fecha: Date): string {
    const yyyy = fecha.getFullYear();
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const dd = String(fecha.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  filtrarProveedores(valor: string) {
    this.busquedaProveedor = valor;
    const q = valor.toLowerCase().trim();
    this.proveedoresFiltrados = this.proveedores.filter(p =>
      p.razonSocial.toLowerCase().includes(q)
    );
  }
  onProveedorInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.filtrarProveedores(input.value);
  }

  seleccionarProveedor(proveedor: any) {
    this.form.get('proveedor')?.setValue(proveedor);
    this.busquedaProveedor = proveedor.razonSocial;
    this.proveedoresFiltrados = [];
  }


  mesActual = new Date();
  diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  diasMes: DiaCalendario[] = [];

  // Para el input de fecha
  fechaMaxima = new Date().toISOString().split('T')[0];
  fechaMinima = new Date(2020, 0, 1).toISOString().split('T')[0];


  generarCalendario() {
    const año = this.mesActual.getFullYear();
    const mes = this.mesActual.getMonth();

    // Primer día del mes
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);

    // Días del mes anterior para completar la semana
    const diasAnteriores = primerDia.getDay();

    this.diasMes = [];

    // Días del mes anterior
    for (let i = diasAnteriores - 1; i >= 0; i--) {
      const fecha = new Date(año, mes, -i);
      this.diasMes.push({
        numero: fecha.getDate(),
        fecha: fecha,
        esDelMes: false,
        esHoy: this.esMismaFecha(fecha, new Date()),
        estaSeleccionado: false
      });
    }

    // Días del mes actual
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      const fecha = new Date(año, mes, dia);
      this.diasMes.push({
        numero: dia,
        fecha: fecha,
        esDelMes: true,
        esHoy: this.esMismaFecha(fecha, new Date()),
        estaSeleccionado: this.esMismaFecha(fecha, this.fechaSeleccionada.value)
      });
    }

    // Días del mes siguiente para completar la grilla
    const diasRestantes = 42 - this.diasMes.length;
    for (let dia = 1; dia <= diasRestantes; dia++) {
      const fecha = new Date(año, mes + 1, dia);
      this.diasMes.push({
        numero: dia,
        fecha: fecha,
        esDelMes: false,
        esHoy: this.esMismaFecha(fecha, new Date()),
        estaSeleccionado: false
      });
    }
  }

  seleccionarFecha(dia: DiaCalendario) {
    if (!dia.esDelMes) return;

    const fechaFormateada = this.formatearFecha(dia.fecha);
    this.fechaSeleccionada.setValue(fechaFormateada);
    this.form.get('fecha')?.setValue(fechaFormateada); // ✅ sincroniza con el form
    this.generarCalendario();
  }

  mesAnterior() {
    this.mesActual = new Date(this.mesActual.getFullYear(), this.mesActual.getMonth() - 1, 1);
    this.generarCalendario();
  }

  mesSiguiente() {
    this.mesActual = new Date(this.mesActual.getFullYear(), this.mesActual.getMonth() + 1, 1);
    this.generarCalendario();
  }

  getClaseDia(dia: DiaCalendario): string {
    let clases = 'w-8 h-8 text-sm rounded-lg transition-all duration-200 ';

    if (!dia.esDelMes) {
      clases += 'text-gray-300 cursor-not-allowed ';
    } else if (dia.estaSeleccionado) {
      clases += 'bg-yellow-500 text-white font-bold shadow-md ';
    } else if (dia.esHoy) {
      clases += 'bg-blue-100 text-blue-600 font-semibold border-2 border-blue-300 ';
    } else {
      clases += 'text-gray-700 hover:bg-yellow-100 hover:text-yellow-700 font-medium ';
    }

    return clases;
  }

  seleccionarHoy() {
    const hoy = new Date();
    const fechaFormateada = this.formatearFecha(hoy);
    this.fechaSeleccionada.setValue(fechaFormateada);
    this.form.get('fecha')?.setValue(fechaFormateada); // ✅
    this.generarCalendario();
  }

  seleccionarAyer() {
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    const fechaFormateada = this.formatearFecha(ayer);
    this.fechaSeleccionada.setValue(fechaFormateada);
    this.form.get('fecha')?.setValue(fechaFormateada); // ✅
    this.generarCalendario();
  }

  seleccionarSemanaAnterior() {
    const semanaAnterior = new Date();
    semanaAnterior.setDate(semanaAnterior.getDate() - 7);
    this.fechaSeleccionada.setValue(this.formatearFecha(semanaAnterior));
    this.generarCalendario();
  }

  private esMismaFecha(fecha1: Date, fecha2: Date | string | null): boolean {
    if (!fecha1 || !fecha2) return false;

    const f2 = typeof fecha2 === 'string'
      ? new Date(fecha2 + 'T00:00:00')
      : fecha2;

    return fecha1.toDateString() === f2.toDateString();
  }

  // Método mejorado para clases de días en móvil
  getClaseDiaMobile(dia: DiaCalendario): string {
    let clases = 'w-10 h-10 text-sm rounded-xl transition-all duration-200 font-medium ';

    if (!dia.esDelMes) {
      clases += 'text-gray-300 cursor-not-allowed ';
    } else if (dia.estaSeleccionado) {
      clases += 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold shadow-lg transform scale-110 ';
    } else if (dia.esHoy) {
      clases += 'bg-blue-100 text-blue-600 font-bold border-2 border-blue-300 shadow-sm ';
    } else {
      clases += 'text-gray-700 hover:bg-yellow-100 hover:text-yellow-700 hover:shadow-sm active:scale-95 ';
    }

    return clases;
  }
  // Método para azul
  getClaseDiaAzul(dia: DiaCalendario): string {
    let clases = 'w-10 h-10 text-sm rounded-xl transition-all duration-200 font-medium ';

    if (!dia.esDelMes) {
      clases += 'text-gray-300 cursor-not-allowed ';
    } else if (dia.estaSeleccionado) {
      clases += 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold shadow-lg transform scale-110 ';
    } else if (dia.esHoy) {
      clases += 'bg-blue-100 text-blue-600 font-bold border-2 border-blue-300 shadow-sm ';
    } else {
      clases += 'text-gray-700 hover:bg-blue-100 hover:text-blue-700 hover:shadow-sm active:scale-95 ';
    }

    return clases;
  }

  getClaseDiaTeal(dia: DiaCalendario): string {
    let clases = 'w-10 h-10 text-sm rounded-xl transition-all duration-200 font-medium ';

    if (!dia.esDelMes) {
      clases += 'text-gray-300 cursor-not-allowed ';
    } else if (dia.estaSeleccionado) {
      clases += 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold shadow-lg transform scale-110 ';
    } else if (dia.esHoy) {
      clases += 'bg-teal-100 text-teal-600 font-bold border-2 border-teal-300 shadow-sm ';
    } else {
      clases += 'text-gray-700 hover:bg-teal-100 hover:text-teal-700 hover:shadow-sm active:scale-95 ';
    }

    return clases;
  }
  getClaseDiaSlate(dia: DiaCalendario): string {
    let clases = 'w-10 h-10 text-sm rounded-xl transition-all duration-200 font-medium ';

    if (!dia.esDelMes) {
      clases += 'text-gray-300 cursor-not-allowed ';
    } else if (dia.estaSeleccionado) {
      clases += 'bg-gradient-to-r from-slate-500 to-gray-600 text-white font-bold shadow-lg transform scale-110 ';
    } else if (dia.esHoy) {
      clases += 'bg-slate-100 text-slate-600 font-bold border-2 border-slate-300 shadow-sm ';
    } else {
      clases += 'text-gray-700 hover:bg-slate-100 hover:text-slate-700 hover:shadow-sm active:scale-95 ';
    }

    return clases;
  }
  // Método para limpiar proveedor
  limpiarProveedor() {
    this.proveedorSeleccionado = null;
    this.busquedaProveedor = '';
    this.form.get('proveedor')?.setValue(null);
  }
  async generarPDF() {
    if (this.form.invalid) {
      this.alerts.warning('Completa los campos requeridos', 'short');
      return;
    }

    this.generandoPDF = true;

    const rawFecha = this.form.value.fecha;
    const proveedor = this.form.value.proveedor;

    const fecha = typeof rawFecha === 'string'
      ? new Date(rawFecha + 'T00:00:00')
      : rawFecha;

    if (!fecha || isNaN(fecha.getTime())) {
      this.alerts.error('Fecha inválida', 'short');
      this.generandoPDF = false;
      return;
    }

    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    const anio = fecha.getFullYear();
    const fechaFormateada = `${mes}/${dia}/${anio}`;
    const fechaCodificada = encodeURIComponent(fechaFormateada);
    const nombreArchivo = `Pedidos_${anio}-${mes}-${dia}_${proveedor.razonSocial}.pdf`;

    this.pedidoService.generarPdfPedidosDelDia(fechaCodificada, proveedor.idProveedor).subscribe({
      next: async (blob) => {
        try {
          const base64Data = await blobToBase64(blob);

          const result: WriteFileResult = await Filesystem.writeFile({
            path: nombreArchivo,
            data: base64Data,
            directory: Directory.Documents
          });

          this.alerts.success('✅ PDF guardado con éxito', 'short');

          // Abrir el PDF
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
