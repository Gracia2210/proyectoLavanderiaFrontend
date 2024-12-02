enum Rol {
  ALUMNO = 1,
  DOCENTE = 2
}

export function obtenerPerfilEnum(rol: string): number | undefined {
  return Rol[rol as keyof typeof Rol];
}
