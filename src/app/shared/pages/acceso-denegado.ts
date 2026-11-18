import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
@Component({
  imports: [RouterLink],
  template:
    '<h1>Acceso denegado</h1><p>No tienes permiso para esta operación. Tu sesión sigue activa.</p><a routerLink="/servicios">Volver a Servicios</a>',
})
export class AccesoDenegado {}
