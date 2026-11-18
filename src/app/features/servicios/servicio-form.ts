import { Component, inject, signal } from "@angular/core";
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { finalize } from "rxjs";
import { ServicioApi } from "../../core/services/servicio.service";
import { FieldError } from "../../shared/field-error";
import { mensaje, campos } from "../../shared/form-errors";
@Component({
  imports: [ReactiveFormsModule, RouterLink, FieldError],
  templateUrl: "./servicio-form.html",
})
export class ServicioForm {
  private readonly api = inject(ServicioApi);
  private readonly router = inject(Router);
  readonly id =
    Number(inject(ActivatedRoute).snapshot.paramMap.get("id")) || null;
  readonly form = inject(NonNullableFormBuilder).group({
    codigo: ["", [Validators.required, Validators.pattern(/^SRV-\d{3}$/)]],
    nombre: [
      "",
      [Validators.required, Validators.minLength(3), Validators.maxLength(80)],
    ],
    precio: [0, [Validators.required, Validators.min(0.01)]],
    duracionMin: [
      30,
      [Validators.required, Validators.min(15), Validators.max(480)],
    ],
    activo: [true],
  });
  readonly error = signal("");
  readonly errores = signal<Record<string, string>>({});
  readonly cargando = signal(false);
  readonly guardando = signal(false);
  ngOnInit() {
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
        void this.router.navigate(["/servicios"], {
          queryParams: { guardado: 1 },
        }),
      error: (e) => {
        this.error.set(mensaje(e));
        this.errores.set(campos(e));
      },
    });
  }
}
