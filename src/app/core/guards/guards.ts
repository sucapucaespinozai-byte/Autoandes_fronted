import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../auth/auth.service";
import { Permiso } from "../models";
export const authGuard: CanActivateFn = (_, state) => {
  const auth = inject(AuthService);
  return auth.autenticado()
    ? true
    : inject(Router).createUrlTree(["/login"], {
        queryParams: { returnUrl: state.url },
      });
};
export const invitadoGuard: CanActivateFn = () =>
  !inject(AuthService).autenticado() ||
  inject(Router).createUrlTree(["/servicios"]);
export const permisoGuard: CanActivateFn = (route) =>
  inject(AuthService).tiene(route.data["permiso"] as Permiso) ||
  inject(Router).createUrlTree(["/acceso-denegado"]);
