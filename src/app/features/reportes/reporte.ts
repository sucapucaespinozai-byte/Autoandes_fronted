import { Component, inject, signal } from "@angular/core";
import { CurrencyPipe } from "@angular/common";
import { NonNullableFormBuilder, ReactiveFormsModule } from "@angular/forms";
import { ReporteApi } from "../../core/services/reporte.service";
import { Ingreso } from "../../core/models";
import { mensaje } from "../../shared/form-errors";
@Component({
  imports: [CurrencyPipe, ReactiveFormsModule],
  templateUrl: "./reporte.html",
})
export class Reporte {
  private readonly api = inject(ReporteApi);
  readonly filas = signal<Ingreso[]>([]);
  readonly error = signal("");
  readonly cargando = signal(true);
  readonly form = inject(NonNullableFormBuilder).group({
    desde: [""],
    hasta: [""],
  });
  ngOnInit() {
    this.buscar();
  }
  buscar() {
    this.error.set("");
    this.cargando.set(true);
    this.api
      .ingresos(
        Object.fromEntries(
          Object.entries(this.form.getRawValue()).filter(([, v]) => v !== ""),
        ),
      )
      .subscribe({
        next: (r) => {
          this.filas.set(r);
          this.cargando.set(false);
        },
        error: (e) => {
          this.error.set(mensaje(e));
          this.cargando.set(false);
        },
      });
  }
}
