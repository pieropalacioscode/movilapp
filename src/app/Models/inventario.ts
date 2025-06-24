export interface Inventario {

    idLibro: number;
    titulo: string;
    isbn: string;
    stock: number;
    subcategoria:string;
    proveedor?: string;
    autores: string[]; 
}