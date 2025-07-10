export interface Proveedor {
    idProveedor: number;
    razonSocial?: string;
    ruc?: string;
    direccion?: string;
    telefono:string;
    idTipoProveedor: number;
    nombreTipoProveedor?: string;
}

export interface ProveedorUI extends Proveedor {
  mostrarDetalles?: boolean;
}