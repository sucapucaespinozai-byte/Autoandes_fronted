import { Component, inject, signal } from "@angular/core";
import { CurrencyPipe, DatePipe } from "@angular/common";
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { OrdenApi } from "../../core/services/orden.service";
import { Orden } from "../../core/models";
import { SiPermiso } from "../../shared/directives/si-permiso";
import { FieldError } from "../../shared/field-error";
import { mensaje, campos } from "../../shared/form-errors";
import { finalize } from "rxjs";
@Component({
  imports: [
    CurrencyPipe,
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    SiPermiso,
    FieldError,
  ],
  templateUrl: "./orden-detail.html",
})
export class OrdenDetail {
  private readonly api = inject(OrdenApi);
  private readonly route = inject(ActivatedRoute);
  readonly orden = signal<Orden | null>(null);
  readonly error = signal("");
  readonly errores = signal<Record<string, string>>({});
  readonly enviando = signal(false);
  readonly cargando = signal(true);
  readonly registrada = this.route.snapshot.queryParamMap.has("registrada");
  readonly form = inject(NonNullableFormBuilder).group({
    motivo: [
      "",
      [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(200),
      ],
    ],
  });
  ngOnInit() {
    this.api
      .buscar(Number(this.route.snapshot.paramMap.get("id")))
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: (o) => this.orden.set(o),
        error: (e) => this.error.set(mensaje(e)),
      });
  }
  anular() {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.enviando()) return;
    if (!confirm("¿Anular la orden " + this.orden()?.numero + "?")) return;
    this.error.set("");
    this.errores.set({});
    this.enviando.set(true);
    this.api
      .anular(this.orden()!.id, this.form.getRawValue().motivo)
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: (o) => this.orden.set(o),
        error: (e) => {
          this.error.set(mensaje(e));
          this.errores.set(campos(e));
        },
      });
  }
}
