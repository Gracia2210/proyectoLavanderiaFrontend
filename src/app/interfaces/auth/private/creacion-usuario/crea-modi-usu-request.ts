import { CreaModiRolRequest } from "./crea-modi-rol-request";

export class CreaModiUsuarioRequest {
  id:string;
  usuario:string;
  password:string;
  nombre:string;
  apellidoPaterno:string;
  apellidoMaterno:string;
  sexo:string;
  codigo:string;
  email:string;
  telefono:string;
  carrera:string;
  idCarrera:number;
  usuario_id:number;
  fila:number;
  roles:CreaModiRolRequest[];
};
