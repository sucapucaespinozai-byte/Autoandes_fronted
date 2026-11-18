import { Component, input } from "@angular/core";
import { AbstractControl } from "@angular/forms";
import { localError } from "./form-errors";
@Component({
  selector: "app-field-error",
  template:
    '@if(server() || localError(control())) {<small class="field-error">{{server() || localError(control())}}</small>}',
})
export class FieldError {
  readonly control = input<AbstractControl | null>(null);
  readonly server = input("");
  protected readonly localError = localError;
}
