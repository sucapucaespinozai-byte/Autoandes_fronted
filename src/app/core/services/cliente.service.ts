import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { Cliente } from "../models";
@Injectable({ providedIn: "root" })
export class ClienteApi {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl + "/clientes";
  listar() {
    return this.http.get<Cliente[]>(this.url);
  }
}
