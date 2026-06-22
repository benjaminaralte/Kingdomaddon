import type { VillageData, TroopType } from "../types/index.js";
import { TROOP_WAGES, WAGE_INTERVAL_DAYS } from "../types/index.js";
import { getAllVillages, saveVillage } from "../storage/index.js";
import { getCurrentDay, daysSince } from "../utils/tick.js";
import { notifyPlayer } from "../utils/notify.js";
import { spawnBanditDeserters } from "./bandit.js";

const RECRUIT_COSTS: Record<TroopType, number> = {
  cityGuards:      8,
  spearmen:        12,
  archers:         12,
  cavalry:         20,
  heavyKnight:     35,
  samurai:         60,
  mercenaryLancer: 50,
  legionary:       50,
};

export function getRecruitCost(type: TroopType): number {
  return RECRUIT_COSTS[type];
}

export function recruitTroop(village: VillageData, type: TroopType, count: number = 1): boolean {
  if (type === "heavyKnight" && village.barracksLevel < 3) {
    notifyPlayer(village.owner, `§cHeavy Knights require §bBarracks Level 3§c (currently Lv${village.barracksLevel}).`);
    return false;
  }

  const costEach = RECRUIT_COSTS[type];
  const totalCost = costEach * count;
  const availableWorkers =
    village.population -
    village.troops.cityGuards -
    village.troops.spearmen -
    village.troops.archers -
    village.troops.cavalry -
    (village.troops.heavyKnight      ?? 0) -
    (village.troops.samurai          ?? 0) -
    (village.troops.mercenaryLancer  ?? 0) -
    (village.troops.legionary        ?? 0) -
    village.workers.farmers -
    village.workers.workers;

  if (availableWorkers < count) {
    notifyPlayer(village.owner, `§cNot enough available workers to recruit ${count} ${type}.`);
    return false;
  }

  if (village.treasury < totalCost) {
    notifyPlayer(village.owner, `§cNeed ${totalCost}💎 to recruit ${count} ${type}.`);
    return false;
  }

  village.treasury -= totalCost;
  village.troops[type] += count;
  saveVillage(village);
  notifyPlayer(village.owner, `§aRecruited ${count} ${type} in §b${village.name}§a.`);
  return true;
}

export function disbandTroop(village: VillageData, type: TroopType, count: number = 1): boolean {
  if (village.troops[type] < count) return false;
  village.troops[type] -= count;
  saveVillage(village);
  notifyPlayer(village.owner, `§eDisbanded ${count} ${type} in §b${village.name}§a.`);
  return true;
}

export function tickWages(village: VillageData): void {
  const currentDay = getCurrentDay();
  const daysSinceWage = daysSince(village.lastWageDay);

  if (daysSinceWage < WAGE_INTERVAL_DAYS) return;

  const hk = village.troops.heavyKnight     ?? 0;
  const sa = village.troops.samurai         ?? 0;
  const ml = village.troops.mercenaryLancer ?? 0;
  const le = village.troops.legionary       ?? 0;
  const totalWages =
    village.troops.cityGuards  * TROOP_WAGES.cityGuards +
    village.troops.spearmen    * TROOP_WAGES.spearmen +
    village.troops.archers     * TROOP_WAGES.archers +
    village.troops.cavalry     * TROOP_WAGES.cavalry +
    hk                         * TROOP_WAGES.heavyKnight +
    sa                         * TROOP_WAGES.samurai +
    ml                         * TROOP_WAGES.mercenaryLancer +
    le                         * TROOP_WAGES.legionary;

  if (totalWages === 0) {
    village.lastWageDay = currentDay;
    saveVillage(village);
    return;
  }

  if (village.treasury >= totalWages) {
    village.treasury -= totalWages;
    village.missedWages = 0;
    village.lastWageDay = currentDay;
    notifyPlayer(village.owner, `§aPaid wages (${totalWages}💎) in §b${village.name}§a.`);
  } else {
    village.missedWages++;
    village.lastWageDay = currentDay;

    switch (village.missedWages) {
      case 1:
        notifyPlayer(
          village.owner,
          `§e⚠ Missed wage payment in §b${village.name}§e! Soldiers are unhappy.`
        );
        break;
      case 2:
        village.prosperity = Math.max(0, village.prosperity - 15);
        notifyPlayer(
          village.owner,
          `§c⚠ Second missed payment in §b${village.name}§c! Morale is low.`
        );
        break;
      case 3:
        handleDesertion(village);
        break;
    }
  }

  saveVillage(village);
}

function handleDesertion(village: VillageData): void {
  const deserters: Partial<Record<TroopType, number>> = {};
  const keys: TroopType[] = ["cityGuards", "spearmen", "archers", "cavalry", "heavyKnight", "samurai", "mercenaryLancer", "legionary"];

  let totalDeserters = 0;
  for (const key of keys) {
    if (village.troops[key] > 0) {
      const d = Math.ceil(village.troops[key] * 0.3);
      deserters[key] = d;
      village.troops[key] -= d;
      totalDeserters += d;
    }
  }

  village.missedWages = 0;
  village.prosperity = Math.max(0, village.prosperity - 25);

  notifyPlayer(
    village.owner,
    `§c${totalDeserters} soldiers deserted §b${village.name}§c and joined the bandits!`
  );

  spawnBanditDeserters(village, totalDeserters);
}

export function upgradeBarracks(village: VillageData): boolean {
  const maxLevel = 5;
  if (village.barracksLevel >= maxLevel) {
    notifyPlayer(village.owner, "§cBarracks already at maximum level.");
    return false;
  }
  const cost = village.barracksLevel * 15;
  if (village.treasury < cost) {
    notifyPlayer(village.owner, `§cNeed ${cost}💎 to upgrade barracks.`);
    return false;
  }
  village.treasury -= cost;
  village.barracksLevel++;
  saveVillage(village);
  notifyPlayer(village.owner, `§aBarracks upgraded to level ${village.barracksLevel} in §b${village.name}§a!`);
  return true;
}

export function getTotalTroops(village: VillageData): number {
  return (
    village.troops.cityGuards               +
    village.troops.spearmen                 +
    village.troops.archers                  +
    village.troops.cavalry                  +
    (village.troops.heavyKnight      ?? 0)  +
    (village.troops.samurai          ?? 0)  +
    (village.troops.mercenaryLancer  ?? 0)  +
    (village.troops.legionary        ?? 0)
  );
}

export function getMilitaryStrength(village: VillageData): number {
  return (
    village.troops.cityGuards              * 1 +
    village.troops.spearmen                * 2 +
    village.troops.archers                 * 2 +
    village.troops.cavalry                 * 3 +
    (village.troops.heavyKnight      ?? 0) * 5 +
    (village.troops.samurai          ?? 0) * 7 +
    (village.troops.mercenaryLancer  ?? 0) * 6 +
    (village.troops.legionary        ?? 0) * 6
  );
}

export function processAllWages(): void {
  for (const village of getAllVillages()) {
    tickWages(village);
  }
}
