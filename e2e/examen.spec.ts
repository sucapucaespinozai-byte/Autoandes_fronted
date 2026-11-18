import {
  test as base,
  expect,
  Page,
  APIRequestContext,
} from "@playwright/test";
const api = "http://localhost:8080/api/v1";
const test = base.extend<{ sinErrores: void }>({
  sinErrores: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("response", (r) => {
        if (r.status() >= 500) errors.push(r.status() + " " + r.url());
      });
      await use();
      expect(errors).toEqual([]);
    },
    { auto: true },
  ],
});
async function login(page: Page, user = "admin", ruta = "/servicios") {
  await page.goto(ruta);
  await page.getByLabel("Usuario", { exact: true }).fill(user);
  await page.getByLabel("Contraseña", { exact: true }).fill("Auto2026*");
  await page.getByRole("button", { name: "Ingresar", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Cerrar sesión" }),
  ).toBeVisible();
}
async function token(request: APIRequestContext, user = "admin") {
  const r = await request.post(api + "/auth/login", {
    data: { username: user, password: "Auto2026*" },
  });
  expect(r.status()).toBe(200);
  return (await r.json()).token as string;
}
async function prepararOrden(page: Page, km = "1000") {
  await page
    .getByLabel("Vehículo", { exact: true })
    .selectOption({ label: "HHH-888 — Transportes Andes SAC" });
  await page.getByLabel("Kilometraje", { exact: true }).fill(km);
  await page
    .getByLabel("Servicio 1", { exact: true })
    .selectOption({ label: "SRV-001 — Cambio de aceite" });
  await page.getByLabel("Cantidad 1", { exact: true }).fill("2");
}
test("login incorrecto e inactivo muestran el mensaje comun", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByLabel("Usuario", { exact: true }).fill("inactivo");
  await page.getByLabel("Contraseña", { exact: true }).fill("Auto2026*");
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Usuario o contraseña incorrectos",
  );
  await expect(page).toHaveURL(/login/);
});
test("CRUD servicios con precios reales y baja logica", async ({
  page,
  request,
}) => {
  const t = await token(request);
  const lista = await (
    await request.get(api + "/servicios", {
      headers: { Authorization: "Bearer " + t },
    })
  ).json();
  const usado = new Set(lista.map((s: { codigo: string }) => s.codigo));
  const code = Array.from({ length: 100 }, (_, i) => "SRV-" + (900 + i)).find(
    (c) => !usado.has(c),
  )!;
  await login(page, "jefe");
  await page.getByRole("link", { name: "Nuevo servicio", exact: true }).click();
  await page.getByLabel("Código", { exact: true }).fill(code);
  await page
    .getByLabel("Nombre", { exact: true })
    .fill("Servicio E2E temporal");
  await page.getByLabel("Precio", { exact: true }).fill("42.50");
  await page.getByLabel("Duración (minutos)", { exact: true }).fill("30");
  await page.getByRole("button", { name: "Guardar", exact: true }).click();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "Servicio guardado correctamente." }),
  ).toBeVisible();
  let row = page.locator("tbody tr").filter({ hasText: code });
  await expect(row).toContainText("42.50");
  await row.getByRole("link", { name: "Editar" }).click();
  await page.getByLabel("Precio", { exact: true }).fill("45");
  await page.getByRole("button", { name: "Guardar", exact: true }).click();
  row = page.locator("tbody tr").filter({ hasText: code });
  await expect(row).toContainText("45.00");
  page.on("dialog", (d) => d.accept());
  await row.getByRole("button", { name: "Dar de baja", exact: true }).click();
  await expect(row).toContainText("Inactivo");
  await row.getByRole("button", { name: "Eliminar", exact: true }).click();
  await expect(row).toHaveCount(0);
});
test("error 400 real aparece bajo el campo del formulario", async ({
  page,
}) => {
  await login(page, "admin", "/servicios/nuevo");
  await page.getByLabel("Código", { exact: true }).fill("SRV-899");
  await page.getByLabel("Nombre", { exact: true }).fill("Validacion E2E");
  await page.getByLabel("Precio", { exact: true }).fill("40");
  await page.getByLabel("Duración (minutos)", { exact: true }).fill("30");
  await page.route("**/api/v1/servicios", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    const d = route.request().postDataJSON();
    d.codigo = "incorrecto";
    await route.continue({ postData: JSON.stringify(d) });
  });
  await page.getByRole("button", { name: "Guardar", exact: true }).click();
  await expect(
    page
      .locator("div")
      .filter({ has: page.getByLabel("Código", { exact: true }) })
      .last()
      .locator("app-field-error"),
  ).toContainText("SRV-000");
  await expect(page.getByLabel("Nombre", { exact: true })).toHaveValue(
    "Validacion E2E",
  );
});
test("vehiculo con placa repetida muestra 409 y conserva campos", async ({
  page,
}) => {
  await login(page, "asesor", "/vehiculos/nuevo");
  await page.getByLabel("Placa", { exact: true }).fill("AAA-111");
  await page.getByLabel("Marca", { exact: true }).fill("Toyota");
  await page.getByLabel("Modelo", { exact: true }).fill("Corolla");
  await page.getByLabel("Año", { exact: true }).fill("2020");
  await page
    .getByLabel("Cliente", { exact: true })
    .selectOption({ label: "Ana Torres" });
  await page.getByRole("button", { name: "Guardar", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("la placa ya existe");
  await expect(page.getByLabel("Placa", { exact: true })).toHaveValue(
    "AAA-111",
  );
});
test("CRUD vehiculos carga clientes desde Oracle", async ({
  page,
  request,
}) => {
  const t = await token(request);
  const rows = await (
    await request.get(api + "/vehiculos", {
      headers: { Authorization: "Bearer " + t },
    })
  ).json();
  const plates = new Set(rows.map((v: { placa: string }) => v.placa));
  const plate = Array.from({ length: 100 }, (_, i) => "E2E-" + (900 + i));
  // La placa del contrato exige tres letras, se usa TST para el registro temporal.
  const placa = plate
    .map((v) => v.replace("E2E", "TST"))
    .find((v) => !plates.has(v))!;
  await login(page, "asesor", "/vehiculos/nuevo");
  await page.getByLabel("Placa", { exact: true }).fill(placa);
  await page.getByLabel("Marca", { exact: true }).fill("Toyota");
  await page.getByLabel("Modelo", { exact: true }).fill("Prueba E2E");
  await page.getByLabel("Año", { exact: true }).fill("2020");
  await page
    .getByLabel("Cliente", { exact: true })
    .selectOption({ label: "Ana Torres" });
  await page.getByRole("button", { name: "Guardar", exact: true }).click();
  let row = page.locator("tbody tr").filter({ hasText: placa });
  await expect(row).toContainText("Ana Torres");
  await row.getByRole("link", { name: "Editar" }).click();
  await page.getByLabel("Modelo", { exact: true }).fill("Editado E2E");
  await page.getByRole("button", { name: "Guardar", exact: true }).click();
  row = page.locator("tbody tr").filter({ hasText: placa });
  await expect(row).toContainText("Editado E2E");
  page.on("dialog", (d) => d.accept());
  await row.getByRole("button", { name: "Eliminar" }).click();
  await expect(row).toHaveCount(0);
});
test("orden cabecera detalle recalcula total y se registra en Oracle", async ({
  page,
  request,
}) => {
  await login(page, "asesor", "/ordenes/nueva");
  await prepararOrden(page);
  await page.getByRole("button", { name: "Agregar servicio" }).click();
  await page
    .getByLabel("Servicio 2", { exact: true })
    .selectOption({ label: "SRV-002 — Alineamiento" });
  await expect(page.getByTestId("total")).toContainText("220.00");
  const wait = page.waitForResponse(
    (r) =>
      r.url().endsWith("/api/v1/ordenes") && r.request().method() === "POST",
  );
  await page
    .getByRole("button", { name: "Registrar orden", exact: true })
    .click();
  const response = await wait;
  expect(response.status()).toBe(201);
  const orden = await response.json();
  expect(Number(orden.total)).toBe(220);
  expect(orden.detalles).toHaveLength(2);
  await expect(page.getByRole("status")).toContainText(orden.numero);
  const jefe = await token(request, "jefe");
  expect(
    (
      await request.patch(api + "/ordenes/" + orden.id + "/anular", {
        headers: { Authorization: "Bearer " + jefe },
        data: { motivo: "Cierre de la prueba E2E de registro" },
      })
    ).status(),
  ).toBe(200);
});
test("kilometraje menor muestra 409 sin perder lineas", async ({ page }) => {
  await login(page, "asesor", "/ordenes/nueva");
  await prepararOrden(page, "44999");
  await page
    .getByLabel("Vehículo", { exact: true })
    .selectOption({ label: "AAA-111 — Ana Torres" });
  await page
    .getByRole("button", { name: "Registrar orden", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("45000");
  await expect(page.getByLabel("Cantidad 1", { exact: true })).toHaveValue("2");
  await expect(page.getByTestId("total")).toContainText("160.00");
});
test("jefe no registra y URL directa muestra acceso denegado", async ({
  page,
}) => {
  await login(page, "jefe", "/ordenes");
  await expect(
    page.getByRole("link", { name: "Nueva orden", exact: true }),
  ).toHaveCount(0);
  await page.goto("/ordenes/nueva");
  await expect(
    page.getByRole("heading", { name: "Acceso denegado" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Cerrar sesión" }),
  ).toBeVisible();
});
test("403 del backend no cierra la sesion", async ({ page }) => {
  await login(page, "asesor");
  await page.evaluate(() => {
    const s = JSON.parse(sessionStorage.getItem("autoandes.sesion")!);
    s.permisos.push("REPORTE_VER");
    sessionStorage.setItem("autoandes.sesion", JSON.stringify(s));
  });
  await page.goto("/reportes");
  await expect(page.getByRole("alert")).toContainText(
    "No tiene el permiso requerido",
  );
  await expect(page).toHaveURL(/reportes/);
  await expect(
    page.getByRole("button", { name: "Cerrar sesión" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Servicios", exact: true }).click();
  await expect(
    page.locator("tbody tr").filter({ hasText: "SRV-001" }),
  ).toBeVisible();
});
test("token alterado provoca 401 y login con returnUrl", async ({ page }) => {
  await login(page, "asesor");
  await page.evaluate(() => {
    const s = JSON.parse(sessionStorage.getItem("autoandes.sesion")!);
    s.token = "token.alterado.invalido";
    sessionStorage.setItem("autoandes.sesion", JSON.stringify(s));
  });
  await page.reload();
  await expect(page).toHaveURL(/login.*expirada=1/);
  await expect(page.getByRole("status")).toContainText("expiró");
});
test("sesion se cierra automaticamente al vencer", async ({ page }) => {
  await page.clock.install();
  await login(page, "asesor", "/ordenes/nueva");
  await page.clock.fastForward(3601000);
  await expect(page).toHaveURL(/login.*expirada=1/);
  await expect(page).toHaveURL(/returnUrl=%2Fordenes%2Fnueva/);
});
test("reporte usa agregacion real y excluye ordenes anuladas", async ({
  page,
}) => {
  await login(page, "jefe", "/reportes");
  await page.getByLabel("Desde", { exact: true }).fill("2026-10-29");
  await page.getByLabel("Hasta", { exact: true }).fill("2026-10-29");
  await page.getByRole("button", { name: "Consultar", exact: true }).click();
  await expect(
    page.locator("tbody tr").filter({ hasText: "SRV-001" }),
  ).toContainText("80.00");
  await expect(
    page.locator("tbody tr").filter({ hasText: "SRV-007" }),
  ).toHaveCount(0);
});
test("anulacion desde SPA con motivo y confirmacion", async ({
  page,
  request,
}) => {
  const asesor = await token(request, "asesor");
  const r = await request.post(api + "/ordenes", {
    headers: { Authorization: "Bearer " + asesor },
    data: {
      vehiculoId: 8,
      kilometraje: 1000,
      detalles: [{ servicioId: 1, cantidad: 1 }],
    },
  });
  expect(r.status()).toBe(201);
  const orden = await r.json();
  await login(page, "jefe", "/ordenes/" + orden.id);
  await page
    .getByLabel("Motivo de anulación", { exact: true })
    .fill("El cliente solicita cancelar la atención");
  page.on("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Anular orden", exact: true }).click();
  await expect(page.locator("dd").filter({ hasText: "ANULADA" })).toBeVisible();
});
test("ruta inexistente muestra pagina 404", async ({ page }) => {
  await login(page);
  await page.goto("/ruta-que-no-existe");
  await expect(
    page.getByRole("heading", { name: "Página no encontrada" }),
  ).toBeVisible();
});
