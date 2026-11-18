import {
  Directive,
  effect,
  inject,
  input,
  TemplateRef,
  ViewContainerRef,
} from "@angular/core";
import { AuthService } from "../../core/auth/auth.service";
import { Permiso } from "../../core/models";
@Directive({ selector: "[appSiPermiso]" })
export class SiPermiso {
  readonly appSiPermiso = input.required<Permiso>();
  private readonly auth = inject(AuthService);
  private readonly tpl = inject(TemplateRef);
  private readonly view = inject(ViewContainerRef);
  constructor() {
    effect(() => {
      this.view.clear();
      if (this.auth.tiene(this.appSiPermiso()))
        this.view.createEmbeddedView(this.tpl);
    });
  }
}
