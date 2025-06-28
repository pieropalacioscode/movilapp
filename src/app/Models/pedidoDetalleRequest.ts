import { Libro } from "./libro";
import { Pedidos } from "./pedidos";

export interface PedidoDetalleRequest {
    pedido: Pedidos;
    detalles: {
        idLibro: number;
        cantidadPedida: number;
        cantidadRecibida: number;
        precioUnitario: number;
    }[];
}


export interface PedidoDetalleLibroResponse {
    id: number;
    fecha: string;
    estado: string;
    descripcionPedido: string;
    descripcionRecepcion: string;
    proveedor: string; // 🔄 antes era idProveedor, ahora es string nombre
    imagen:string;
    detalles: LibroPedidoDetalleDto[]; // 🔄 antes era detallePedidoProveedors
    idProveedor:number;
}

export interface LibroPedidoDetalleDto {
    id:number;
    idLibro: number;
    titulo?: string;
    isbn: string;
    imagen: string;
    cantidadPedida: number;
    cantidadRecibida: number | null;
    precioUnitario: number;
}


export interface ConfirmarRecepcionRequest {
  idPedido: number;
  idSucursal: number;
  descripcionRecepcion: string;
  detalles: {
    id: number;
    idPedidoProveedor: number;
    idLibro: number;
    cantidadPedida: number;
    cantidadRecibida: number;
    precioUnitario: number;
  }[];
}

export interface ContadorEstadoResponse{
  totalIniciados:number,
  totalRecibidos:number,
  totalCancelados:number
}


