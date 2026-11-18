import { Component, computed, inject, signal } from "@angular/core";
import { CurrencyPipe } from "@angular/common";
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { finalize, forkJoin } from "rxjs";
import { OrdenApi } from "../../core/services/orden.service";
import { ServicioApi } from "../../core/services/servicio.service";
import { VehiculoApi } from "../../core/services/vehiculo.service";
import { Servicio, Vehiculo } from "../../core/models";
import { FieldError } from "../../shared/field-error";
import { mensaje, campos } from "../../shared/form-errors";
function repetidos(control: AbstractControl) {
  const ids = (control.value as { servicioId: number }[])
    .map((d) => d.servicioId)
    .filter(Boolean);
  return new Set(ids).size === ids.length ? null : { repetidos: true };
}
@Component({
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, FieldError],
  templateUrl: "./orden-form.html",
})
export class OrdenForm {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly api = inject(OrdenApi);
  private readonly serviciosApi = inject(ServicioApi);
  private readonly vehiculosApi = inject(VehiculoApi);
  private readonly router = inject(Router);
  readonly servicios = signal<Servicio[]>([]);
  readonly vehiculos = signal<Vehiculo[]>([]);
  readonly error = signal("");
  readonly errores = signal<Record<string, string>>({});
  readonly guardando = signal(false);
  readonly cargando = signal(true);
  private readonly revision = signal(0);
  private linea() {
    return this.fb.group({
      servicioId: [0, [Validators.required, Validators.min(1)]],
      cantidad: [
        1,
        [
          Validators.required,
          Validators.min(1),
          Validators.max(5),
          Validators.pattern(/^\d+$/),
        ],
      ],
    });
  }
  readonly form = this.fb.group({
    vehiculoId: [0, [Validators.required, Validators.min(1)]],
    kilometraje: [
      0,
      [
        Validators.required,
        Validators.min(0),
        Validators.max(9999999),
        Validators.pattern(/^\d+$/),
      ],
    ],
    detalles: this.fb.array(
      [this.linea()],
      [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(10),
        repetidos,
      ],
    ),
  });
  get detalles() {
    return this.form.controls.detalles;
  }
  readonly total = computed(() => {
    this.revision();
    return this.detalles.controls.reduce(
      (n, l) =>
        n +
        this.precio(l.controls.servicioId.value) * l.controls.cantidad.value,
      0,
    );
  });
  constructor() {
    this.form.valueChanges.subscribe(() => this.revision.update((n) => n + 1));
  }
  ngOnInit() {
    forkJoin({
      servicios: this.serviciosApi.listar(),
      vehiculos: this.vehiculosApi.listar(),
    })
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: (r) => {
          this.servicios.set(r.servicios.filter((s) => s.activo));
          this.vehiculos.set(r.vehiculos);
        },
        error: (e) => this.error.set(mensaje(e)),
      });
  }
  precio(id: number) {
    return Number(
      this.servicios().find((s) => s.id === Number(id))?.precio || 0,
    );
  }
  agregar() {
    if (this.detalles.length < 10) this.detalles.push(this.linea());
  }
  quitar(i: number) {
    this.detalles.removeAt(i);
  }
  usado(id: number, index: number) {
    return this.detalles.controls.some(
      (c, i) => i !== index && c.controls.servicioId.value === id,
    );
  }
  guardar() {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.guardando()) return;
    this.error.set("");
    this.errores.set({});
    this.guardando.set(true);
    this.api
      .crear(this.form.getRawValue())
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: (o) =>
          void this.router.navigate(["/ordenes", o.id], {
            queryParams: { registrada: 1 },
          }),
        error: (e) => {
          this.error.set(mensaje(e));
          this.errores.set(campos(e));
        },
      });
  }
}
