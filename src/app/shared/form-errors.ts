import { AbstractControl } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";
export function mensaje(e: unknown) {
  return e instanceof HttpErrorResponse
    ? e.error?.mensaje ||
        (e.status === 0
          ? "No se pudo conectar con el backend."
          : "No se pudo completar la operación.")
    : "No se pudo completar la operación.";
}
export function campos(e: unknown): Record<string, string> {
  return e instanceof HttpErrorResponse ? e.error?.campos || {} : {};
}
export function localError(c: AbstractControl | null): string {
  if (!c || !c.touched || !c.errors) return "";
  if (c.hasError("required")) return "Campo obligatorio.";
  if (c.hasError("pattern")) return "El formato no es válido.";
  if (c.hasError("minlength")) return "El texto es demasiado corto.";
  if (c.hasError("maxlength")) return "El texto es demasiado largo.";
  if (c.hasError("min") || c.hasError("max"))
    return "Valor fuera del rango permitido.";
  return "Revisa el valor ingresado.";
}
