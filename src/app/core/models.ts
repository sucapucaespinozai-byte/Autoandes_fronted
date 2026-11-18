export type Permiso =
  | "SERVICIO_LEER"
  | "SERVICIO_ESCRIBIR"
  | "VEHICULO_LEER"
  | "VEHICULO_ESCRIBIR"
  | "ORDEN_LEER"
  | "ORDEN_REGISTRAR"
  | "ORDEN_ANULAR"
  | "REPORTE_VER";
export interface Sesion {
  token: string;
  tipo: string;
  username: string;
  nombreCompleto: string;
  roles: string[];
  permisos: Permiso[];
  vence: number;
}
export interface LoginResponse {
  token: string;
  tipo: string;
  username: string;
  nombreCompleto: string;
  roles: string[];
  permisos: Permiso[];
  expiraEnSegundos: number;
}
export interface Cliente {
  id: number;
  documento: string;
  nombres: string;
  telefono: string;
}
export interface Servicio {
  id: number;
  codigo: string;
  nombre: string;
  precio: number;
  duracionMin: number;
  activo: boolean;
}
export type ServicioRequest = Omit<Servicio, "id">;
export interface Vehiculo {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  clienteId: number;
  clienteNombre: string;
}
export type VehiculoRequest = Omit<Vehiculo, "id" | "clienteNombre">;
export interface Detalle {
  id: number;
  servicioId: number;
  servicioCodigo: string;
  servicioNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}
export interface Orden {
  id: number;
  numero: string;
  fecha: string;
  vehiculoId: number;
  placa: string;
  clienteNombre: string;
  kilometraje: number;
  estado: "REGISTRADA" | "ANULADA";
  total: number;
  usuarioRegistro: string;
  motivoAnulacion: string | null;
  detalles: Detalle[];
}
export interface OrdenRequest {
  vehiculoId: number;
  kilometraje: number;
  detalles: { servicioId: number; cantidad: number }[];
}
export interface Ingreso {
  codigo: string;
  servicio: string;
  cantidadTotal: number;
  importeTotal: number;
}
export interface ApiError {
  mensaje: string;
  campos?: Record<string, string>;
}
