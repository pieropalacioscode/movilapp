export interface User{
  idUsuario: number;
  username: string;
  password: string;
  cargo: string;
  estado: boolean;
  idPersona: number;
}

export interface UsuarioPersonaResponse {
  idUsuario: number;
  username?: string;
  cargo?: string;
  estado?: boolean; 
  estadoDescripcion: string;
  nombre: string;
  apellido: string;
  tipoDocumento: string;
  numeroDocumento: string;
  telefono: string;
}
