import { Component, inject, signal } from "@angular/core";
import { DatePipe, CurrencyPipe } from "@angular/common";
import { NonNullableFormBuilder, ReactiveFormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { OrdenApi } from "../../core/services/orden.service";
import { Orden } from "../../core/models";
import { SiPermiso } from "../../shared/directives/si-permiso";
import { mensaje } from "../../shared/form-errors";
@Component({
  imports: [DatePipe, CurrencyPipe, ReactiveFormsModule, RouterLink, SiPermiso],
  templateUrl: "./orden-list.html",
})
export class OrdenList {
  private readonly api = inject(OrdenApi);
  readonly lista = signal<Orden[]>([]);
  readonly error = signal("");
  readonly cargando = signal(true);
  readonly form = inject(NonNullableFormBuilder).group({
    placa: [""],
    estado: [""],
    desde: [""],
    hasta: [""],
  });
  ngOnInit() {
    this.buscar();
  }
  buscar() {
    this.error.set("");
    this.cargando.set(true);
    const filtros = Object.fromEntries(
      Object.entries(this.form.getRawValue()).filter(([, v]) => v !== ""),
    );
    this.api.listar(filtros).subscribe({
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
}
