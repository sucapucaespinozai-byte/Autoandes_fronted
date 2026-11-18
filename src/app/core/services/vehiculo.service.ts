import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { Vehiculo, VehiculoRequest } from "../models";
@Injectable({ providedIn: "root" })
export class VehiculoApi {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl + "/vehiculos";
  listar(clienteId?: number) {
    return this.http.get<Vehiculo[]>(this.url, {
      params: clienteId ? { clienteId } : {},
    });
  }
  buscar(id: number) {
    return this.http.get<Vehiculo>(this.url + "/" + id);
  }
  crear(d: VehiculoRequest) {
    return this.http.post<Vehiculo>(this.url, d);
  }
  actualizar(id: number, d: VehiculoRequest) {
    return this.http.put<Vehiculo>(this.url + "/" + id, d);
  }
  eliminar(id: number) {
    return this.http.delete<void>(this.url + "/" + id);
  }
}
