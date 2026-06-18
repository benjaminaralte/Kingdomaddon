import type { VillageData, TroopType, TrainingJob } from "../types/index.js";
import { saveVillage } from "../storage/index.js";
import { notifyPlayer } from "../utils/notify.js";

export interface TrainingCost {
  food: number;
  iron: number;
  wood: number;
}

export const TRAINING_COSTS: Record<TroopType, TrainingCost> = {
  cityGuards: { food: 5,  iron: 3, wood: 0 },
  spearmen:   { food: 8,  iron: 5, wood: 0 },
  archers:    { food: 6,  iron: 3, wood: 3 },
  cavalry:    { food: 10, iron: 8, wood: 0 },
};

export const TRAINING_TICKS: Record<TroopType, number> = {
  cityGuards: 1200,
  spearmen:   1800,
  archers:    1600,
  cavalry:    2400,
};

export const TROOP_LABELS: Record<TroopType, string> = {
  cityGuards: "City Guard",
  spearmen:   "Spearman",
  archers:    "Archer",
  cavalry:    "Cavalry",
};

const MAX_QUEUE_SIZE = 10;

export function canAffordTraining(village: VillageData, troopType: TroopType, count: number): string | null {
  const cost = TRAINING_COSTS[troopType];
  const rs = village.resourceStorage;
  const food = village.foodStorage;

  if (food < cost.food * count) {
    return `§cNeed §f${cost.food * count}§c food (have §f${food}§c).`;
  }
  if (rs.iron < cost.iron * count) {
    return `§cNeed §f${cost.iron * count}§c iron (have §f${rs.iron}§c).`;
  }
  if (cost.wood > 0 && rs.wood < cost.wood * count) {
    return `§cNeed §f${cost.wood * count}§c wood (have §f${rs.wood}§c).`;
  }
  return null;
}

export function queueTraining(
  village: VillageData,
  troopType: TroopType,
  count: number,
  currentTick: number
): boolean {
  if (village.trainingQueue.length >= MAX_QUEUE_SIZE) {
    notifyPlayer(village.owner, `§cTraining queue is full (max ${MAX_QUEUE_SIZE} jobs).`);
    return false;
  }

  const err = canAffordTraining(village, troopType, count);
  if (err) {
    notifyPlayer(village.owner, err);
    return false;
  }

  const cost = TRAINING_COSTS[troopType];
  village.foodStorage -= cost.food * count;
  village.resourceStorage.iron -= cost.iron * count;
  if (cost.wood > 0) village.resourceStorage.wood -= cost.wood * count;

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
  const cost2 = TRAINING_COSTS[troopType];
  const costStr = [
    `${cost2.food * count} food`,
    cost2.iron * count > 0 ? `${cost2.iron * count} iron` : "",
    cost2.wood * count > 0 ? `${cost2.wood * count} wood` : "",
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
      village.troops[job.troopType] += job.count;
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
