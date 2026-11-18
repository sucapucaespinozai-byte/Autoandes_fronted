import { Component, computed, inject, signal } from "@angular/core";
import { CurrencyPipe } from "@angular/common";
import { RouterLink, ActivatedRoute } from "@angular/router";
import { ServicioApi } from "../../core/services/servicio.service";
import { Servicio } from "../../core/models";
import { SiPermiso } from "../../shared/directives/si-permiso";
import { mensaje } from "../../shared/form-errors";
@Component({
  imports: [RouterLink, CurrencyPipe, SiPermiso],
  templateUrl: "./servicio-list.html",
})
export class ServicioList {
  private readonly api = inject(ServicioApi);
  readonly lista = signal<Servicio[]>([]);
  readonly cargando = signal(true);
  readonly error = signal("");
  readonly guardado =
    inject(ActivatedRoute).snapshot.queryParamMap.has("guardado");
  readonly texto = signal("");
  readonly filas = computed(() =>
    this.lista().filter((s) =>
      (s.codigo + " " + s.nombre)
        .toLowerCase()
        .includes(this.texto().toLowerCase()),
    ),
  );
  ngOnInit() {
    this.cargar();
  }
  cargar() {
    this.cargando.set(true);
    this.error.set("");
    this.api.listar().subscribe({
      next: (r) => {
        this.lista.set(r);
        this.cargando.set(false);
      },
      error: (e) => {
        this.error.set(mensaje(e));
        this.cargando.set(false);
      },
    });
  }
  eliminar(s: Servicio) {
    if (!confirm("¿Eliminar el servicio " + s.codigo + "?")) return;
    this.api
      .eliminar(s.id)
      .subscribe({
        next: () => this.cargar(),
        error: (e) => this.error.set(mensaje(e)),
      });
  }
  estado(s: Servicio) {
    if (
      !confirm(
        "¿" +
          (s.activo ? "Dar de baja" : "Activar") +
          " el servicio " +
          s.codigo +
          "?",
      )
    )
      return;
    this.api
      .estado(s.id, !s.activo)
      .subscribe({
        next: () => this.cargar(),
        error: (e) => this.error.set(mensaje(e)),
      });
  }
}
