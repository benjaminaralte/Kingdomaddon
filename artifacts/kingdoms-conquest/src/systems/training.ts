import type { VillageData, TroopType, TrainingJob } from "../types/index.js";
import { saveVillage } from "../storage/index.js";
import { notifyPlayer } from "../utils/notify.js";

export interface TrainingCost {
  emeralds: number;
  iron: number;
  gold: number;
  diamonds: number;
}

export const TRAINING_COSTS: Record<TroopType, TrainingCost> = {
  cityGuards:      { emeralds: 4,  iron: 8,  gold: 0,  diamonds: 0  },
  spearmen:        { emeralds: 6,  iron: 12, gold: 0,  diamonds: 0  },
  archers:         { emeralds: 6,  iron: 10, gold: 4,  diamonds: 0  },
  cavalry:         { emeralds: 12, iron: 18, gold: 6,  diamonds: 0  },
  heavyKnight:     { emeralds: 20, iron: 25, gold: 10, diamonds: 5  },
  samurai:         { emeralds: 40, iron: 30, gold: 15, diamonds: 10 },
  mercenaryLancer: { emeralds: 35, iron: 25, gold: 12, diamonds: 8  },
  legionary:       { emeralds: 35, iron: 25, gold: 12, diamonds: 8  },
};

export const TRAINING_TICKS: Record<TroopType, number> = {
  cityGuards:      1200,
  spearmen:        1800,
  archers:         1600,
  cavalry:         2400,
  heavyKnight:     6000,
  samurai:         9000,
  mercenaryLancer: 8000,
  legionary:       8000,
};

export const TROOP_LABELS: Record<TroopType, string> = {
  cityGuards:      "City Guard",
  spearmen:        "Spearman",
  archers:         "Archer",
  cavalry:         "Cavalry",
  heavyKnight:     "Heavy Knight",
  samurai:         "Samurai",
  mercenaryLancer: "Mercenary Lancer",
  legionary:       "Legionary",
};

export const ELITE_TROOP_TYPES: TroopType[] = ["samurai", "mercenaryLancer", "legionary"];

const MAX_QUEUE_SIZE = 10;

export function canAffordTraining(village: VillageData, troopType: TroopType, count: number): string | null {
  const cost = TRAINING_COSTS[troopType];
  const rs = village.resourceStorage;

  if (village.treasury < cost.emeralds * count) {
    return `§cNeed §f${cost.emeralds * count} emeralds§c in treasury (have §f${village.treasury}§c).`;
  }
  if (rs.iron < cost.iron * count) {
    return `§cNeed §f${cost.iron * count} iron§c in storage (have §f${rs.iron}§c).`;
  }
  if (cost.gold > 0 && rs.gold < cost.gold * count) {
    return `§cNeed §f${cost.gold * count} gold§c in storage (have §f${rs.gold}§c).`;
  }
  if (cost.diamonds > 0 && rs.diamonds < cost.diamonds * count) {
    return `§cNeed §f${cost.diamonds * count} diamonds§c in storage (have §f${rs.diamonds}§c).`;
  }
  return null;
}

export function queueTraining(
  village: VillageData,
  troopType: TroopType,
  count: number,
  currentTick: number,
  playerVillageCount = 0
): boolean {
  if (village.trainingQueue.length >= MAX_QUEUE_SIZE) {
    notifyPlayer(village.owner, `§cTraining queue is full (max ${MAX_QUEUE_SIZE} jobs).`);
    return false;
  }

  if (troopType === "heavyKnight" && village.barracksLevel < 3) {
    notifyPlayer(village.owner, `§cHeavy Knights require §bBarracks Level 3+§c (currently Lv${village.barracksLevel}).`);
    return false;
  }

  if (ELITE_TROOP_TYPES.includes(troopType)) {
    if (!village.hasCastle) {
      notifyPlayer(village.owner, `§cElite troops require a §bCastle§c built in this village.`);
      return false;
    }
    if (playerVillageCount < 3) {
      notifyPlayer(village.owner, `§cElite troops require §boccupation of 3 villages§c (you have §f${playerVillageCount}§c).`);
      return false;
    }
  }

  const err = canAffordTraining(village, troopType, count);
  if (err) {
    notifyPlayer(village.owner, err);
    return false;
  }

  const cost = TRAINING_COSTS[troopType];
  village.treasury -= cost.emeralds * count;
  village.resourceStorage.iron -= cost.iron * count;
  if (cost.gold > 0) village.resourceStorage.gold -= cost.gold * count;
  if (cost.diamonds > 0) village.resourceStorage.diamonds -= cost.diamonds * count;

  const ticksNeeded = TRAINING_TICKS[troopType] * count;
  const lastJobEnd = village.trainingQueue.length > 0
    ? village.trainingQueue[village.trainingQueue.length - 1].completeTick
    : currentTick;

  const job: TrainingJob = {
    troopType,
    count,
    completeTick: Math.max(lastJobEnd, currentTick) + ticksNeeded,
  };

  village.trainingQueue.push(job);
  saveVillage(village);

  const label = TROOP_LABELS[troopType];
  const costStr = [
    `${cost.emeralds * count} emeralds`,
    cost.iron * count > 0 ? `${cost.iron * count} iron` : "",
    cost.gold * count > 0 ? `${cost.gold * count} gold` : "",
    cost.diamonds * count > 0 ? `${cost.diamonds * count} diamonds` : "",
  ].filter(Boolean).join(", ");

  const secRemaining = Math.ceil((job.completeTick - currentTick) / 20);
  notifyPlayer(village.owner, `§a🪖 Training §f${count} ${label}§a started. Cost: §f${costStr}§a. Ready in §f~${secRemaining}s§a.`);
  return true;
}

export function tickTraining(village: VillageData, currentTick: number): void {
  if (!village.trainingQueue || village.trainingQueue.length === 0) return;

  let changed = false;
  const remaining: TrainingJob[] = [];

  for (const job of village.trainingQueue) {
    if (currentTick >= job.completeTick) {
      village.troops[job.troopType] = (village.troops[job.troopType] ?? 0) + job.count;
      const label = TROOP_LABELS[job.troopType];
      notifyPlayer(village.owner, `§a🪖 §f${job.count} ${label}§a finished training and joined §b${village.name}§a's garrison!`);
      changed = true;
    } else {
      remaining.push(job);
    }
  }

  if (changed) {
    village.trainingQueue = remaining;
    saveVillage(village);
  }
}

export function getTrainingQueueSummary(village: VillageData, currentTick: number): string {
  if (!village.trainingQueue || village.trainingQueue.length === 0) {
    return "§7No troops in training.";
  }

  return village.trainingQueue
    .map((job, i) => {
      const label = TROOP_LABELS[job.troopType];
      const secLeft = Math.max(0, Math.ceil((job.completeTick - currentTick) / 20));
      return `§7[${i + 1}] §f${job.count}x ${label} §7— §e~${secLeft}s`;
    })
    .join("\n");
}
