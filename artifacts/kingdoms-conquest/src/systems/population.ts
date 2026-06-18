import { world } from "@minecraft/server";
import type { VillageData } from "../types/index.js";
import { POPULATION_GROWTH_INTERVAL_DAYS } from "../types/index.js";
import { getAllVillages, saveVillage } from "../storage/index.js";
import { daysSince } from "../utils/tick.js";
import { notifyPlayer } from "../utils/notify.js";

const GROWTH_CHANCE = 0.6;
const MORTALITY_CHANCE = 0.4;

export function tickPopulation(village: VillageData): void {
  if (daysSince(village.lastDayProcessed) < POPULATION_GROWTH_INTERVAL_DAYS) return;

  if (village.foodShortageStage >= 4) {
    handlePopulationDecline(village);
    return;
  }

  if (village.foodShortageStage >= 2) {
    return;
  }

  const canGrow =
    village.population < village.housingCapacity && village.foodStorage > 10;

  if (canGrow && Math.random() < GROWTH_CHANCE) {
    village.population += 1;
    village.workers.farmers = Math.max(
      village.workers.farmers,
      Math.floor(village.population * 0.3)
    );
    notifyPlayer(village.owner, `§aPopulation grew in §b${village.name}§a! (${village.population})`);
  }

  spawnVillagerEntity(village);
}

function handlePopulationDecline(village: VillageData): void {
  if (village.population > 1 && Math.random() < MORTALITY_CHANCE) {
    village.population -= 1;

    const totalSoldiers =
      village.troops.cityGuards +
      village.troops.spearmen +
      village.troops.archers +
      village.troops.cavalry;

    if (village.population < totalSoldiers + village.workers.farmers + village.workers.workers) {
      if (village.troops.cityGuards > 0) village.troops.cityGuards--;
      else if (village.troops.spearmen > 0) village.troops.spearmen--;
      else if (village.troops.archers > 0) village.troops.archers--;
      else if (village.troops.cavalry > 0) village.troops.cavalry--;
      else if (village.workers.workers > 0) village.workers.workers--;
      else if (village.workers.farmers > 0) village.workers.farmers--;
    }

    notifyPlayer(
      village.owner,
      `§cPopulation declined in §b${village.name}§c due to starvation! (${village.population})`
    );
  }
}

function spawnVillagerEntity(village: VillageData): void {
  const dim = world.getDimension(village.location.dimension);
  const loc = village.townHallLocation;

  const query = {
    type: "minecraft:villager",
    location: { x: loc.x, y: loc.y, z: loc.z },
    maxDistance: 64,
  };

  const existingVillagers = dim.getEntities(query);
  if (existingVillagers.length < village.population) {
    try {
      dim.spawnEntity("minecraft:villager", {
        x: loc.x + (Math.random() * 6 - 3),
        y: loc.y,
        z: loc.z + (Math.random() * 6 - 3),
      });
    } catch {
      // Chunk may not be loaded
    }
  }
}

export function getTotalWorkers(village: VillageData): number {
  const soldiers =
    village.troops.cityGuards +
    village.troops.spearmen +
    village.troops.archers +
    village.troops.cavalry;
  return village.population - soldiers;
}

export function getAvailableWorkers(village: VillageData): number {
  const assigned = village.workers.farmers + village.workers.workers;
  return getTotalWorkers(village) - assigned;
}

export function assignWorker(
  village: VillageData,
  role: "farmers" | "workers"
): boolean {
  if (getAvailableWorkers(village) <= 0) return false;
  village.workers[role]++;
  saveVillage(village);
  return true;
}

export function unassignWorker(
  village: VillageData,
  role: "farmers" | "workers"
): boolean {
  if (village.workers[role] <= 0) return false;
  village.workers[role]--;
  saveVillage(village);
  return true;
}

export function recruitSoldier(
  village: VillageData,
  troopType: keyof VillageData["troops"],
  recruitCost: number
): boolean {
  if (village.treasury < recruitCost) return false;
  if (getAvailableWorkers(village) <= 0) return false;

  village.treasury -= recruitCost;
  village.troops[troopType]++;
  saveVillage(village);
  notifyPlayer(village.owner, `§aRecruited 1 ${troopType} in §b${village.name}§a.`);
  return true;
}

export function processAllPopulation(): void {
  for (const village of getAllVillages()) {
    tickPopulation(village);
  }
}
