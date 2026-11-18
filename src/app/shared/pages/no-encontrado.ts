import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
@Component({
  imports: [RouterLink],
  template:
    '<h1>Página no encontrada</h1><a routerLink="/servicios">Ir a Servicios</a>',
})
export class NoEncontrado {}
