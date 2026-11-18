import { Permiso } from "../models";
export const MENU: { ruta: string; texto: string; permiso: Permiso }[] = [
  { ruta: "/servicios", texto: "Servicios", permiso: "SERVICIO_LEER" },
  { ruta: "/vehiculos", texto: "Vehículos", permiso: "VEHICULO_LEER" },
  { ruta: "/ordenes", texto: "Órdenes", permiso: "ORDEN_LEER" },
  { ruta: "/reportes", texto: "Reportes", permiso: "REPORTE_VER" },
];
