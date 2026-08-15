import { expect, test } from "bun:test";

interface InventoryDependency {
  readonly from: string;
  readonly scope: string;
  readonly specifier: string;
  readonly to: string;
}

function asciiSorted(values: readonly string[]): string[] {
  return [...values].sort((left, right) => left < right ? -1 : left > right ? 1 : 0);
}

test("the portable portfolio inventory matches the package boundary", async () => {
  const inventory = await Bun.file(
    new URL("../portfolio-inventory.json", import.meta.url),
  ).json();
  const packageJson = await Bun.file(new URL("../package.json", import.meta.url)).json();
  const dependencies = inventory.dependencies as readonly InventoryDependency[];

  expect(Object.keys(inventory).sort()).toEqual([
    "brands",
    "components",
    "contract",
    "dependencies",
    "deployments",
    "formatVersion",
    "publications",
    "repository",
  ]);
  expect(inventory.contract).toBe("hraness.portfolio-inventory/v1");
  expect(inventory.formatVersion).toBe(1);
  expect(inventory.repository).toBe("hraness/design-kit");
  expect(inventory.brands).toEqual([]);
  expect(inventory.deployments).toEqual([]);
  expect(inventory.components).toEqual([{
    kind: "package",
    name: packageJson.name,
    path: ".",
    visibility: "public",
    version: packageJson.version,
  }]);
  expect(dependencies).toEqual([{
    from: packageJson.name,
    scope: "runtime",
    specifier: packageJson.dependencies["@hraness/ui"],
    to: "@hraness/ui",
  }]);
  expect(inventory.publications).toEqual([{
    component: packageJson.name,
    packageName: packageJson.name,
    repository: inventory.repository,
  }]);

  for (const key of ["components", "dependencies", "publications"] as const) {
    const values = (inventory[key] as readonly Record<string, string>[])
      .map((entry) => JSON.stringify(entry));
    expect(values).toEqual(asciiSorted(values));
  }
});
