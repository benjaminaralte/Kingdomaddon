import { world } from "@minecraft/server";
import type { VillageData, ResourceStorage } from "../types/index.js";
import { EMPTY_RESOURCE_STORAGE, RESOURCE_LABELS } from "../types/index.js";
import { getVillage, saveVillage, getAllVillages } from "../storage/index.js";
import { notifyPlayer } from "../utils/notify.js";

export function registerMaterialStorage(
  village: VillageData,
  location: { x: number; y: number; z: number }
): void {
  village.hasStorage = true;
  village.storageLocation = { x: location.x, y: location.y, z: location.z };
  if (!village.resourceStorage) {
    village.resourceStorage = { ...EMPTY_RESOURCE_STORAGE };
  }
  saveVillage(village);
  notifyPlayer(
    village.owner,
    `§aMaterial Storage built in §b${village.name}§a! Assign workers at the Town Hall to gather resources.`
  );
}

export function removeMaterialStorage(village: VillageData): void {
  village.hasStorage = false;
  village.storageLocation = undefined;
  saveVillage(village);
  notifyPlayer(
    village.owner,
    `§cMaterial Storage destroyed in §b${village.name}§c! Workers will idle until a new one is built.`
  );
}

export function getMaterialStorageSummary(village: VillageData): string {
  const v = getVillage(village.id) ?? village;
  const rs = v.resourceStorage ?? { ...EMPTY_RESOURCE_STORAGE };
  const miners = v.workers?.miners ?? 0;

  const resourceLines = (Object.keys(RESOURCE_LABELS) as Array<keyof ResourceStorage>)
    .map((k) => `  ${RESOURCE_LABELS[k]}: §f${rs[k] ?? 0}`)
    .join("\n");

  return [
    `§b${v.name}§r — Material Storage`,
    ``,
    `§7── Stored Resources ──`,
    resourceLines,
    ``,
    `§7── Miners ──`,
    `  §fAssigned Miners: §7${miners}`,
    `  §7(Miners passively gather iron, coal, stone, wood, gold & diamonds)`,
    `  §7Assign miners via the §bTown Hall → Workers§7 menu.`,
  ].join("\n");
}

const MINER_TICK_INTERVAL = 1200;

const MINER_RATES: Record<keyof ResourceStorage, { min: number; max: number }> = {
  iron:     { min: 2, max: 5 },
  coal:     { min: 3, max: 7 },
  stone:    { min: 4, max: 8 },
  wood:     { min: 3, max: 6 },
  gold:     { min: 0, max: 2 },
  diamonds: { min: 0, max: 1 },
};

export function tickMinerProduction(village: VillageData, tick: number): void {
  if (!village.hasStorage) return;
  const miners = village.workers?.miners ?? 0;
  if (miners === 0) return;
  if (tick % MINER_TICK_INTERVAL !== 0) return;

  if (!village.resourceStorage) {
    village.resourceStorage = { ...EMPTY_RESOURCE_STORAGE };
  }
  const rs = village.resourceStorage;

  for (const key of Object.keys(MINER_RATES) as Array<keyof ResourceStorage>) {
    const rate = MINER_RATES[key];
    const perMiner = rate.min + Math.floor(Math.random() * (rate.max - rate.min + 1));
    rs[key] = (rs[key] ?? 0) + Math.floor(perMiner * miners);
  }
  saveVillage(village);
}

export function tickAllMinerProduction(tick: number): void {
  for (const village of getAllVillages()) {
    tickMinerProduction(village, tick);
  }
}
