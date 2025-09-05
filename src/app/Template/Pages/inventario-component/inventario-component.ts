import { Component, OnInit } from '@angular/core';
import { LibroService } from '../../../Service/libro-service';
import { Inventario } from '../../../Models/inventario';
import { PaginacionResponse } from '../../../Models/PaginacionResponse';
import { debounceTime, distinctUntilChanged, of, Subject, switchMap } from 'rxjs';
import { KardexService } from '../../../Service/kardex-service';
import { AlertService } from '../../../Service/alert-service';

@Component({
  selector: 'app-inventario-component',
  standalone: false,
  templateUrl: './inventario-component.html',
  styleUrl: './inventario-component.css'
})
export class InventarioComponent implements OnInit {
  constructor(
    private libroService: LibroService,
    private kardexService: KardexService,
    private alerts: AlertService
  ) { }

  inventario: Inventario[] = [];
  inventarioOriginal: Inventario[] = [];

  paginaActual = 1;
  totalPaginas = 0;
  editando: boolean = false;
  // Propiedades de búsqueda
  searchQuery: string = '';
  quickFilter: string = '';
  isSearching: boolean = false;

  inventarioFiltrado: any[] = []; // Array filtrado para mostrar

  // Subject para debounce de búsqueda
  private searchSubject = new Subject<string>();

  // Propiedades de expansión
  expandedItems: Set<number> = new Set();
  // Map para controlar qué libros están expandidos
  private expandedStates = new Map<number, boolean>();

  ngOnInit(): void {
    this.getInventario(),
      this.setupSearch()
  }

  getInventario(): void {
    this.libroService.getInventario(this.paginaActual, 10).subscribe((res: PaginacionResponse<Inventario>) => {
      this.inventario = res.items;
      this.inventarioOriginal = res.items;
      this.totalPaginas = res.totalPaginas;
      this.applyFilters(); // mostrar por defecto
    });
  }

  cambiarPagina(pagina: number) {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.getInventario(); // Método que llama a tu API
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Opcional: para móviles
  }


  getPaginasVisibles(): number[] {
    const paginas: number[] = [];

    if (this.totalPaginas <= 5) {
      // Mostrar todas si son 5 o menos
      for (let i = 1; i <= this.totalPaginas; i++) {
        paginas.push(i);
      }
    } else {
      if (this.paginaActual <= 3) {
        paginas.push(1, 2, 3, 4, -1, this.totalPaginas);
      } else if (this.paginaActual >= this.totalPaginas - 2) {
        paginas.push(1, -1);
        for (let i = this.totalPaginas - 3; i <= this.totalPaginas; i++) {
          paginas.push(i);
        }
      } else {
        paginas.push(1, -1, this.paginaActual - 1, this.paginaActual, this.paginaActual + 1, -1, this.totalPaginas);
      }
    }

    return paginas;
  }



  // Función para alternar la expansión de un libro
  toggleExpansion(index: number): void {
    const currentState = this.expandedStates.get(index) || false;
    this.expandedStates.set(index, !currentState);
  }

  // Función para verificar si un libro está expandido
  isExpanded(index: number): boolean {
    return this.expandedStates.get(index) || false;
  }

  // Función para colapsar todos los libros
  collapseAll(): void {
    this.expandedStates.clear();
  }

  // Función para expandir todos los libros
  expandAll(): void {
    this.inventario.forEach((_, index) => {
      this.expandedStates.set(index, true);
    });
  }

  getStockPercentage(stock: number): number {
    const maxStock = 20;
    return Math.min((stock / maxStock) * 100, 100);
  }

  // Configurar búsqueda con debounce
  setupSearch() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || query.trim() === '') {
          return of(this.inventarioOriginal);
        }
        return this.libroService.getBuscarInventario(query.trim());
      })
    ).subscribe({
      next: (results) => {
        this.isSearching = this.searchQuery.trim().length > 0;
        this.inventarioFiltrado = results || [];
      },
      error: (error) => {
        console.error('Error en búsqueda:', error);
        this.isSearching = false;
        this.inventarioFiltrado = [];
      }
    });
  }


  // Manejar cambios en el input de búsqueda
  onSearchChange() {
    if (this.searchQuery.trim()) {
      this.searchSubject.next(this.searchQuery);
    } else {
      this.isSearching = false;
      this.applyFilters();
    }
  }

  // Limpiar búsqueda
  clearSearch() {
    this.searchQuery = '';
    this.isSearching = false;
    this.applyFilters();
  }

  // Establecer filtro rápido
  setQuickFilter(filter: string) {
    this.quickFilter = filter;
    this.applyFilters();
  }

  // Aplicar filtros locales (cuando no hay búsqueda de texto)
  applyFilters() {
    let filtered = [...this.inventario];

    // Aplicar filtro rápido
    switch (this.quickFilter) {
      case 'stock-alto':
        filtered = filtered.filter(libro => libro.stock > 10);
        break;
      case 'stock-bajo':
        filtered = filtered.filter(libro => libro.stock > 0 && libro.stock <= 10);
        break;
      case 'agotado':
        filtered = filtered.filter(libro => libro.stock === 0);
        break;
      default:
        // Mostrar todos
        break;
    }

    this.inventarioFiltrado = filtered;
  }

  // Resaltar términos de búsqueda
  highlightSearchTerm(text: string): string {
    if (!this.searchQuery || !text) {
      return text;
    }

    const regex = new RegExp(`(${this.searchQuery})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
  }
  // Manejar input de búsqueda
  onSearchInput(event: any) {
    this.searchQuery = event.target.value;
    this.onSearchChange();
  }

  iniciarEdicion(libro: any) {
    libro.stockTemp = libro.stock; // inicializa el input con el valor actual
    libro.editando = true;
  }

  updateStock(idLibro: number, stock: number) {
    this.kardexService.updateStock(idLibro, stock).subscribe({
      next: () => { this.alerts.success('Stock actualizado ✅'), this.getInventario() },
      error: () => this.alerts.error('Error al actualizar stock ❌')
    });
  }
  cancelarEdicion(libro: any, event: Event) {
    event.stopPropagation(); // evita abrir detalles
    libro.stockTemp = libro.stock; // restaurar el valor original
    libro.editando = false;        // cerrar modo edición
  }

}
