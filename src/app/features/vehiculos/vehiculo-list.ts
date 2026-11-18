import { Component, inject, signal } from "@angular/core";
import { RouterLink, ActivatedRoute } from "@angular/router";
import { VehiculoApi } from "../../core/services/vehiculo.service";
import { ClienteApi } from "../../core/services/cliente.service";
import { Vehiculo, Cliente } from "../../core/models";
import { SiPermiso } from "../../shared/directives/si-permiso";
import { mensaje } from "../../shared/form-errors";
@Component({
  imports: [RouterLink, SiPermiso],
  templateUrl: "./vehiculo-list.html",
})
export class VehiculoList {
  private readonly api = inject(VehiculoApi);
  private readonly clientesApi = inject(ClienteApi);
  private clienteId = "";
  readonly clientes = signal<Cliente[]>([]);
  readonly lista = signal<Vehiculo[]>([]);
  readonly cargando = signal(true);
  readonly error = signal("");
  readonly guardado =
    inject(ActivatedRoute).snapshot.queryParamMap.has("guardado");
  ngOnInit() {
    this.clientesApi
      .listar()
      .subscribe({
        next: (r) => this.clientes.set(r),
        error: (e) => this.error.set(mensaje(e)),
      });
    this.cargar();
  }
  cargar(cliente = this.clienteId) {
    this.clienteId = cliente;
    this.cargando.set(true);
    this.error.set("");
    this.api.listar(cliente ? Number(cliente) : undefined).subscribe({
      next: (r) => {
        this.lista.set(r);
        this.cargando.set(false);
      },
      error: (e) => {
        this.error.set(mensaje(e));
        this.cargando.set(false);
      },
    });
  }
  eliminar(v: Vehiculo) {
    if (!confirm("¿Eliminar el vehículo " + v.placa + "?")) return;
    this.api
      .eliminar(v.id)
      .subscribe({
        next: () => this.cargar(),
        error: (e) => this.error.set(mensaje(e)),
      });
  }
}
