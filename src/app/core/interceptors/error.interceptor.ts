import { inject } from "@angular/core";
import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { catchError, throwError } from "rxjs";
import { AuthService } from "../auth/auth.service";
import { esApi } from "./jwt.interceptor";
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  return next(req).pipe(
    catchError((e: HttpErrorResponse) => {
      if (
        e.status === 401 &&
        esApi(req.url) &&
        !req.url.endsWith("/auth/login")
      )
        auth.cerrar(true, location.pathname + location.search);
      return throwError(() => e);
    }),
  );
};
