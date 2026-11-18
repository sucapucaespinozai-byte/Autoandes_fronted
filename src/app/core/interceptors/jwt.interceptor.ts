import { inject } from "@angular/core";
import { HttpInterceptorFn } from "@angular/common/http";
import { AuthService } from "../auth/auth.service";
import { environment } from "../../../environments/environment";
export function esApi(url: string) {
  const api = new URL(environment.apiUrl);
  const target = new URL(url, location.origin);
  return (
    target.origin === api.origin &&
    target.pathname.startsWith(api.pathname + "/")
  );
}
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token();
  return next(
    token && esApi(req.url)
      ? req.clone({ setHeaders: { Authorization: "Bearer " + token } })
      : req,
  );
};
