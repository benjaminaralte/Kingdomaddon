import { world } from "@minecraft/server";
import type { VillageData } from "../types/index.js";
import { POPULATION_GROWTH_INTERVAL_DAYS } from "../types/index.js";
import { getAllVillages, saveVillage } from "../storage/index.js";
import { daysSince } from "../utils/tick.js";
import { notifyPlayer } from "../utils/notify.js";
import { sendCrisisTitle } from "../utils/notify.js";

const GROWTH_CHANCE = 0.6;
const MORTALITY_CHANCE = 0.4;
const HOUSING_UNIT_SIZE = 5;

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

    checkAndGrowStructures(village);
  }

  spawnVillagerEntity(village);
}

function handlePopulationDecline(village: VillageData): void {
  if (village.population > 1 && Math.random() < MORTALITY_CHANCE) {
    village.population -= 1;

    const totalSoldiers =
      village.troops.cityGuards               +
      village.troops.spearmen                 +
      village.troops.archers                  +
      village.troops.cavalry                  +
      (village.troops.heavyKnight      ?? 0)  +
      (village.troops.samurai          ?? 0)  +
      (village.troops.mercenaryLancer  ?? 0)  +
      (village.troops.legionary        ?? 0);

    if (village.population < totalSoldiers + village.workers.farmers + village.workers.workers) {
      if (village.troops.cityGuards > 0)               village.troops.cityGuards--;
      else if (village.troops.spearmen > 0)            village.troops.spearmen--;
      else if (village.troops.archers > 0)             village.troops.archers--;
      else if (village.troops.cavalry > 0)             village.troops.cavalry--;
      else if ((village.troops.heavyKnight ?? 0) > 0)      village.troops.heavyKnight!--;
      else if ((village.troops.samurai ?? 0) > 0)          village.troops.samurai!--;
      else if ((village.troops.mercenaryLancer ?? 0) > 0)  village.troops.mercenaryLancer!--;
      else if ((village.troops.legionary ?? 0) > 0)        village.troops.legionary!--;
      else if (village.workers.workers > 0)            village.workers.workers--;
      else if (village.workers.farmers > 0)            village.workers.farmers--;
    }

    notifyPlayer(
      village.owner,
      `§cPopulation declined in §b${village.name}§c due to starvation! (${village.population})`
    );
    if (village.population < 5 && village.population > 0) {
      sendCrisisTitle(
        village.owner,
        "§c§lVILLAGE DYING",
        `§e${village.name} — only ${village.population} citizens left!`,
        "mob.villager.death"
      );
    }
  }
}

function checkAndGrowStructures(village: VillageData): void {
  const builtUnits = village.builtHousingUnits ?? 0;
  const unitsNeeded = Math.floor(village.population / HOUSING_UNIT_SIZE);

  if (unitsNeeded <= builtUnits) return;

  placeFarmlandUnit(village);
  village.builtHousingUnits = builtUnits + 1;
  village.housingCapacity = Math.max(village.housingCapacity, (builtUnits + 1) * HOUSING_UNIT_SIZE + 5);
  saveVillage(village);
  notifyPlayer(village.owner, `§6New farm and housing unit built for §b${village.name}§6! Capacity: ${village.housingCapacity}`);
}

function placeFarmlandUnit(village: VillageData): void {
  try {
    const dim = world.getDimension(village.location.dimension);
    const builtUnits = village.builtHousingUnits ?? 0;

    const angle = (builtUnits * 72 * Math.PI) / 180;
    const radius = 12 + builtUnits * 6;
    const cx = Math.floor(village.townHallLocation.x + Math.cos(angle) * radius);
    const cy = village.townHallLocation.y;
    const cz = Math.floor(village.townHallLocation.z + Math.sin(angle) * radius);

    const floor = findSolidY(dim, cx, cy, cz);
    const farmY = floor + 1;

    dim.runCommand(`fill ${cx - 2} ${farmY} ${cz - 2} ${cx + 2} ${farmY} ${cz + 2} minecraft:farmland`);
    dim.runCommand(`setblock ${cx} ${farmY} ${cz} minecraft:water`);

    dim.runCommand(`fill ${cx - 2} ${farmY + 1} ${cz - 2} ${cx + 2} ${farmY + 1} ${cz + 2} minecraft:wheat[growth=0]`);
    dim.runCommand(`setblock ${cx} ${farmY + 1} ${cz} minecraft:air`);

    dim.runCommand(`setblock ${cx - 3} ${farmY} ${cz} minecraft:composter`);
    dim.runCommand(`setblock ${cx - 3} ${farmY + 1} ${cz} minecraft:air`);

    const bedX = cx + 3;
    dim.runCommand(`setblock ${bedX} ${farmY} ${cz} minecraft:white_bed["direction":1,"head_bit":true,"occupied_bit":false]`);
    dim.runCommand(`setblock ${bedX + 1} ${farmY} ${cz} minecraft:white_bed["direction":1,"head_bit":false,"occupied_bit":false]`);

  } catch {
    // chunk not loaded or block placement failed — silent
  }
}

function findSolidY(dim: ReturnType<typeof world.getDimension>, x: number, startY: number, z: number): number {
  for (let y = startY; y >= startY - 10; y--) {
    try {
      const block = dim.getBlock({ x, y, z });
      if (block && block.typeId !== "minecraft:air" && block.typeId !== "minecraft:water") {
        return y;
      }
    } catch { break; }
  }
  return startY;
}

function spawnVillagerEntity(village: VillageData): void {
  const dim = world.getDimension(village.location.dimension);
  const loc = village.townHallLocation;

  const query = {
    type: "minecraft:villager_v2",
    location: { x: loc.x, y: loc.y, z: loc.z },
    maxDistance: 64,
  };

  const existingVillagers = dim.getEntities(query);
  if (existingVillagers.length < village.population) {
    try {
      const spawnX = loc.x + (Math.random() * 6 - 3);
      const spawnZ = loc.z + (Math.random() * 6 - 3);
      const entity = dim.spawnEntity("minecraft:villager_v2", {
        x: spawnX,
        y: loc.y,
        z: spawnZ,
      });

      entity.setDynamicProperty("kc:village_id", village.id);
      entity.nameTag = `Villager [${village.name}]`;

      try {
        dim.runCommand(`event entity @e[type=minecraft:villager_v2,x=${Math.floor(spawnX)},y=${Math.floor(loc.y)},z=${Math.floor(spawnZ)},r=3] minecraft:become_farmer`);
      } catch { /* profession event may not apply */ }

    } catch {
      // Chunk may not be loaded
    }
  }
}

export function getTotalWorkers(village: VillageData): number {
  const soldiers =
    village.troops.cityGuards               +
    village.troops.spearmen                 +
    village.troops.archers                  +
    village.troops.cavalry                  +
    (village.troops.heavyKnight      ?? 0)  +
    (village.troops.samurai          ?? 0)  +
    (village.troops.mercenaryLancer  ?? 0)  +
    (village.troops.legionary        ?? 0);
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
