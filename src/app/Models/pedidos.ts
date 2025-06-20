export interface Pedidos {
    id?: number;
    fecha: string; // ISO string (equivalente a DateTime en C#)
    estado: string;
    idProveedor?: number;
    descripcionPedido?: string;
    descripcionRecepcion?: string;
}