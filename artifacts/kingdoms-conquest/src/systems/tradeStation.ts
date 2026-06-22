import type { VillageData, ResourceStorage } from "../types/index.js";
import { EMPTY_RESOURCE_STORAGE, RESOURCE_LABELS } from "../types/index.js";
import { getVillage, saveVillage, getAllVillages } from "../storage/index.js";
import { notifyPlayer } from "../utils/notify.js";

export function registerTradeStation(
  village: VillageData,
  location: { x: number; y: number; z: number }
): void {
  village.hasTradeStation = true;
  village.tradeStationLocation = { x: location.x, y: location.y, z: location.z };
  saveVillage(village);
  notifyPlayer(village.owner, `§aTrade Station built in §b${village.name}§a. Railway logistics enabled!`);
}

export function removeTradeStation(village: VillageData): void {
  village.hasTradeStation = false;
  village.tradeStationLocation = undefined;
  saveVillage(village);
  notifyPlayer(village.owner, `§cTrade Station destroyed! §b${village.name}§c can no longer send or receive railway shipments.`);
}

export function getConnectedVillages(village: VillageData): VillageData[] {
  return getAllVillages().filter(
    (v) => v.id !== village.id && v.hasTradeStation
  );
}

export function getTradeStationSummary(village: VillageData): string {
  const v = getVillage(village.id) ?? village;
  const rs = v.resourceStorage ?? { ...EMPTY_RESOURCE_STORAGE };
  const t = v.troops;

  const resourceLines = (Object.keys(RESOURCE_LABELS) as Array<keyof ResourceStorage>)
    .filter((k) => (rs[k] ?? 0) > 0)
    .map((k) => `  ${RESOURCE_LABELS[k]}: ${rs[k]}`)
    .join("\n") || "  (none)";

  const activeCarts = v.activeCarts.filter((c) => c.isRailShipment).length;

  return [
    `§b${v.name}§r — Trade Station`,
    `§7Population: §f${v.population}/${v.housingCapacity}`,
    `§7Treasury: §6${v.treasury}💎`,
    `§7Food: §a${v.foodStorage}🌾`,
    ``,
    `§7── Resource Storage ──`,
    resourceLines,
    ``,
    `§7── Barracks ──`,
    `  City Guards: ${t.cityGuards}  Spearmen: ${t.spearmen}`,
    `  Archers: ${t.archers}  Cavalry: ${t.cavalry}`,
    ``,
    `§7Active Rail Shipments: §f${activeCarts}`,
  ].join("\n");
}

export function getCargoSummary(cargo: import("../types/index.js").TradeCartCargo): string {
  const parts: string[] = [];
  if (cargo.food > 0) parts.push(`${cargo.food}🌾`);
  if (cargo.emeralds > 0) parts.push(`${cargo.emeralds}💎`);
  if (cargo.iron > 0) parts.push(`${cargo.iron} Iron`);
  if (cargo.gold > 0) parts.push(`${cargo.gold} Gold`);
  if (cargo.coal > 0) parts.push(`${cargo.coal} Coal`);
  if (cargo.wood > 0) parts.push(`${cargo.wood} Wood`);
  if (cargo.stone > 0) parts.push(`${cargo.stone} Stone`);
  if (cargo.diamonds > 0) parts.push(`${cargo.diamonds} Diamonds`);
  const troops = cargo.troops ?? {};
  if ((troops.cityGuards ?? 0) > 0) parts.push(`${troops.cityGuards} Guards`);
  if ((troops.spearmen ?? 0) > 0) parts.push(`${troops.spearmen} Spearmen`);
  if ((troops.archers ?? 0) > 0) parts.push(`${troops.archers} Archers`);
  if ((troops.cavalry ?? 0) > 0) parts.push(`${troops.cavalry} Cavalry`);
  return parts.join(", ") || "Empty";
}

export function ensureResourceStorage(village: VillageData): void {
  if (!village.resourceStorage) {
    village.resourceStorage = { ...EMPTY_RESOURCE_STORAGE };
  }
}
