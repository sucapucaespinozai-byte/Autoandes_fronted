import { Component, inject } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { AuthService } from "../core/auth/auth.service";
import { MENU } from "../core/config/menu";
@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `<div class="shell">
    <aside>
      <a class="brand" routerLink="/servicios">AutoAndes</a>
      <p>Taller mecánico</p>
      <nav aria-label="Menú principal">
        @for (item of menu; track item.ruta) {
          @if (auth.tiene(item.permiso)) {
            <a [routerLink]="item.ruta" routerLinkActive="active">{{
              item.texto
            }}</a>
          }
        }
      </nav>
    </aside>
    <div>
      <header>
        <span>{{ auth.sesion()?.nombreCompleto }}</span
        ><button type="button" (click)="auth.cerrar()">Cerrar sesión</button>
      </header>
      <main><router-outlet /></main>
    </div>
  </div>`,
})
export class MainLayout {
  protected readonly auth = inject(AuthService);
  protected readonly menu = MENU;
}
