export interface PaginacionResponse<T> {
  items: T[];
  total: number;
  paginaActual: number;
  totalPaginas: number;
}

