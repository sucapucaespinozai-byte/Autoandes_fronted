import { Routes } from "@angular/router";
import { authGuard, invitadoGuard, permisoGuard } from "./core/guards/guards";
export const routes: Routes = [
  {
    path: "login",
    canActivate: [invitadoGuard],
    loadComponent: () => import("./features/auth/login").then((m) => m.Login),
  },
  {
    path: "",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./layout/main-layout").then((m) => m.MainLayout),
    children: [
      { path: "", pathMatch: "full", redirectTo: "servicios" },
      {
        path: "servicios",
        canActivate: [permisoGuard],
        data: { permiso: "SERVICIO_LEER" },
        loadComponent: () =>
          import("./features/servicios/servicio-list").then(
            (m) => m.ServicioList,
          ),
      },
      {
        path: "servicios/nuevo",
        canActivate: [permisoGuard],
        data: { permiso: "SERVICIO_ESCRIBIR" },
        loadComponent: () =>
          import("./features/servicios/servicio-form").then(
            (m) => m.ServicioForm,
          ),
      },
      {
        path: "servicios/:id/editar",
        canActivate: [permisoGuard],
        data: { permiso: "SERVICIO_ESCRIBIR" },
        loadComponent: () =>
          import("./features/servicios/servicio-form").then(
            (m) => m.ServicioForm,
          ),
      },
      {
        path: "vehiculos",
        canActivate: [permisoGuard],
        data: { permiso: "VEHICULO_LEER" },
        loadComponent: () =>
          import("./features/vehiculos/vehiculo-list").then(
            (m) => m.VehiculoList,
          ),
      },
      {
        path: "vehiculos/nuevo",
        canActivate: [permisoGuard],
        data: { permiso: "VEHICULO_ESCRIBIR" },
        loadComponent: () =>
          import("./features/vehiculos/vehiculo-form").then(
            (m) => m.VehiculoForm,
          ),
      },
      {
        path: "vehiculos/:id/editar",
        canActivate: [permisoGuard],
        data: { permiso: "VEHICULO_ESCRIBIR" },
        loadComponent: () =>
          import("./features/vehiculos/vehiculo-form").then(
            (m) => m.VehiculoForm,
          ),
      },
      {
        path: "ordenes",
        canActivate: [permisoGuard],
        data: { permiso: "ORDEN_LEER" },
        loadComponent: () =>
          import("./features/ordenes/orden-list").then((m) => m.OrdenList),
      },
      {
        path: "ordenes/nueva",
        canActivate: [permisoGuard],
        data: { permiso: "ORDEN_REGISTRAR" },
        loadComponent: () =>
          import("./features/ordenes/orden-form").then((m) => m.OrdenForm),
      },
      {
        path: "ordenes/:id",
        canActivate: [permisoGuard],
        data: { permiso: "ORDEN_LEER" },
        loadComponent: () =>
          import("./features/ordenes/orden-detail").then((m) => m.OrdenDetail),
      },
      {
        path: "reportes",
        canActivate: [permisoGuard],
        data: { permiso: "REPORTE_VER" },
        loadComponent: () =>
          import("./features/reportes/reporte").then((m) => m.Reporte),
      },
      {
        path: "acceso-denegado",
        loadComponent: () =>
          import("./shared/pages/acceso-denegado").then(
            (m) => m.AccesoDenegado,
          ),
      },
      {
        path: "**",
        loadComponent: () =>
          import("./shared/pages/no-encontrado").then((m) => m.NoEncontrado),
      },
    ],
  },
];
