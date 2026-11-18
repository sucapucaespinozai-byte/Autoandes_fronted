import { computed, inject, Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { tap } from "rxjs";
import { environment } from "../../../environments/environment";
import { LoginResponse, Permiso, Sesion } from "../models";
const KEY = "autoandes.sesion";
@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private timer?: ReturnType<typeof setTimeout>;
  private readonly state = signal<Sesion | null>(this.restore());
  readonly sesion = this.state.asReadonly();
  readonly autenticado = computed(
    () => this.state() !== null && this.state()!.vence > Date.now(),
  );
  constructor() {
    const s = this.state();
    if (s) this.programar(s);
  }
  private restore(): Sesion | null {
    try {
      const raw = JSON.parse(sessionStorage.getItem(KEY) || "null");
      return raw &&
        typeof raw.token === "string" &&
        typeof raw.vence === "number" &&
        Array.isArray(raw.permisos) &&
        typeof raw.username === "string"
        ? raw
        : null;
    } catch {
      sessionStorage.removeItem(KEY);
      return null;
    }
  }
  login(username: string, password: string) {
    return this.http
      .post<LoginResponse>(environment.apiUrl + "/auth/login", {
        username,
        password,
      })
      .pipe(
        tap((r) => {
          const s: Sesion = {
            ...r,
            vence: Date.now() + r.expiraEnSegundos * 1000,
          };
          sessionStorage.setItem(KEY, JSON.stringify(s));
          this.state.set(s);
          this.programar(s);
        }),
      );
  }
  token() {
    const s = this.state();
    return s && s.vence > Date.now() ? s.token : null;
  }
  tiene(p: Permiso) {
    return this.state()?.permisos.includes(p) ?? false;
  }
  cerrar(expirada = false, returnUrl = this.router.url) {
    if (this.timer) clearTimeout(this.timer);
    this.state.set(null);
    sessionStorage.removeItem(KEY);
    void this.router.navigate(["/login"], {
      queryParams: expirada ? { expirada: "1", returnUrl } : {},
    });
  }
  private programar(s: Sesion) {
    if (this.timer) clearTimeout(this.timer);
    const falta = s.vence - Date.now();
    this.timer = setTimeout(() => this.cerrar(true), Math.max(0, falta));
  }
}
