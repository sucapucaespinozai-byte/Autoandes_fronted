import { Component, inject, signal } from "@angular/core";
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "../../core/auth/auth.service";
import { mensaje, campos } from "../../shared/form-errors";
import { FieldError } from "../../shared/field-error";
@Component({
  imports: [ReactiveFormsModule, FieldError],
  template: `<main class="login">
    <section>
      <h1>AutoAndes</h1>
      <h2>Iniciar sesión</h2>
      @if (expirada) {
        <p role="status">Tu sesión expiró. Inicia sesión nuevamente.</p>
      }
      @if (error()) {
        <p class="alert" role="alert">{{ error() }}</p>
      }
      <form [formGroup]="form" (ngSubmit)="ingresar()" novalidate>
        <label for="username">Usuario</label
        ><input
          id="username"
          formControlName="username"
          autocomplete="username"
        /><app-field-error
          [control]="form.controls.username"
          [server]="errores()['username'] || ''"
        /><label for="password">Contraseña</label
        ><input
          id="password"
          type="password"
          formControlName="password"
          autocomplete="current-password"
        /><app-field-error
          [control]="form.controls.password"
          [server]="errores()['password'] || ''"
        /><button class="primary" [disabled]="enviando()">
          {{ enviando() ? "Ingresando…" : "Ingresar" }}
        </button>
      </form>
    </section>
  </main>`,
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly form = inject(NonNullableFormBuilder).group({
    username: ["", Validators.required],
    password: ["", Validators.required],
  });
  readonly expirada = this.route.snapshot.queryParamMap.has("expirada");
  readonly error = signal("");
  readonly errores = signal<Record<string, string>>({});
  readonly enviando = signal(false);
  ingresar() {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.enviando()) return;
    this.error.set("");
    this.errores.set({});
    this.enviando.set(true);
    const d = this.form.getRawValue();
    this.auth.login(d.username, d.password).subscribe({
      next: () => {
        const url = this.route.snapshot.queryParamMap.get("returnUrl");
        void this.router.navigateByUrl(
          url && url.startsWith("/") && !url.startsWith("//")
            ? url
            : "/servicios",
        );
      },
      error: (e) => {
        this.error.set(mensaje(e));
        this.errores.set(campos(e));
        this.enviando.set(false);
      },
    });
  }
}
