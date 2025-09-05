export interface Pedidos {
    id?: number;
    fecha: string; // ISO string (equivalente a DateTime en C#)
    estado: string;
    idProveedor?: number;
    descripcionPedido?: string;
    descripcionRecepcion?: string;
    idPersona?: number;
}

export interface Notificacion {
  id: number;
  mensaje: string;
  fecha: string;
  tipo: string;
  idLibro: number;
  leido: boolean;
}
