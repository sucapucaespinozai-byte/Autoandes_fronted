import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { Orden, OrdenRequest } from "../models";
@Injectable({ providedIn: "root" })
export class OrdenApi {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl + "/ordenes";
  listar(filtros: Record<string, string> = {}) {
    return this.http.get<Orden[]>(this.url, { params: filtros });
  }
  buscar(id: number) {
    return this.http.get<Orden>(this.url + "/" + id);
  }
  crear(d: OrdenRequest) {
    return this.http.post<Orden>(this.url, d);
  }
  anular(id: number, motivo: string) {
    return this.http.patch<Orden>(this.url + "/" + id + "/anular", { motivo });
  }
}
