import { Component, inject, signal } from "@angular/core";
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { finalize } from "rxjs";
import { VehiculoApi } from "../../core/services/vehiculo.service";
import { FieldError } from "../../shared/field-error";
import { mensaje, campos } from "../../shared/form-errors";
import { ClienteApi } from "../../core/services/cliente.service";
import { Cliente } from "../../core/models";
@Component({
  imports: [ReactiveFormsModule, RouterLink, FieldError],
  templateUrl: "./vehiculo-form.html",
})
export class VehiculoForm {
  private readonly api = inject(VehiculoApi);
  private readonly router = inject(Router);
  readonly id =
    Number(inject(ActivatedRoute).snapshot.paramMap.get("id")) || null;
  private readonly clienteApi = inject(ClienteApi);
  readonly clientes = signal<Cliente[]>([]);
  readonly form = inject(NonNullableFormBuilder).group({
    placa: ["", [Validators.required, Validators.pattern(/^[A-Z]{3}-\d{3}$/)]],
    marca: ["", [Validators.required, Validators.maxLength(40)]],
    modelo: ["", [Validators.required, Validators.maxLength(40)]],
    anio: [
      2026,
      [Validators.required, Validators.min(1990), Validators.max(2027)],
    ],
    clienteId: [0, [Validators.required, Validators.min(1)]],
  });
  readonly error = signal("");
  readonly errores = signal<Record<string, string>>({});
  readonly cargando = signal(false);
  readonly guardando = signal(false);
  ngOnInit() {
    this.clienteApi
      .listar()
      .subscribe({
        next: (r) => this.clientes.set(r),
        error: (e) => this.error.set(mensaje(e)),
      });
    if (this.id) {
      this.cargando.set(true);
      this.api
        .buscar(this.id)
        .pipe(finalize(() => this.cargando.set(false)))
        .subscribe({
          next: (r) => this.form.patchValue(r),
          error: (e) => this.error.set(mensaje(e)),
        });
    }
  }
  guardar() {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.guardando()) return;
    this.error.set("");
    this.errores.set({});
    this.guardando.set(true);
    const d = this.form.getRawValue();
    const request = this.id
      ? this.api.actualizar(this.id, d)
      : this.api.crear(d);
    request.pipe(finalize(() => this.guardando.set(false))).subscribe({
      next: () =>
        void this.router.navigate(["/vehiculos"], {
          queryParams: { guardado: 1 },
        }),
      error: (e) => {
        this.error.set(mensaje(e));
        this.errores.set(campos(e));
      },
    });
  }
}
