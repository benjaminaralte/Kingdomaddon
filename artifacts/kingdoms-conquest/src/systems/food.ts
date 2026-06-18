import type { VillageData, FoodShortageStage } from "../types/index.js";
import { FOOD_PER_VILLAGER_PER_DAY, FOOD_PER_SOLDIER_PER_DAY } from "../types/index.js";
import { getAllVillages, saveVillage } from "../storage/index.js";
import { getCurrentDay, isNewDay } from "../utils/tick.js";
import { notifyPlayer } from "../utils/notify.js";

export function getFoodProduction(village: VillageData): number {
  const farmerOutput = village.workers.farmers * 3;
  return farmerOutput;
}

export function getFoodConsumption(village: VillageData): number {
  const soldiers =
    village.troops.cityGuards +
    village.troops.spearmen +
    village.troops.archers +
    village.troops.cavalry;

  const civilians = village.population - soldiers;

  return (
    Math.max(0, civilians) * FOOD_PER_VILLAGER_PER_DAY +
    soldiers * FOOD_PER_SOLDIER_PER_DAY
  );
}

export function tickFood(village: VillageData): boolean {
  const currentDay = getCurrentDay();
  if (!isNewDay(village.lastDayProcessed)) return false;

  const production = getFoodProduction(village);
  const consumption = getFoodConsumption(village);

  village.foodStorage += production;
  village.foodStorage -= consumption;

  if (village.foodStorage < 0) village.foodStorage = 0;

  updateFoodShortageStage(village, consumption);

  village.lastDayProcessed = currentDay;
  saveVillage(village);
  return true;
}

function updateFoodShortageStage(village: VillageData, dailyConsumption: number): void {
  const prev = village.foodShortageStage;

  if (village.foodStorage <= 0 && dailyConsumption > 0) {
    const newStage = Math.min(4, village.foodShortageStage + 1) as FoodShortageStage;
    village.foodShortageStage = newStage;

    switch (newStage) {
      case 1:
        notifyPlayer(
          village.owner,
          `§e⚠ Food warning in §b${village.name}§e! Stores are running low.`
        );
        break;
      case 2:
        notifyPlayer(
          village.owner,
          `§c⚠ Food shortage in §b${village.name}§c! Population growth paused.`
        );
        break;
      case 3:
        village.prosperity = Math.max(0, village.prosperity - 10);
        notifyPlayer(
          village.owner,
          `§c⚠ Severe food shortage in §b${village.name}§c! Morale dropping.`
        );
        break;
      case 4:
        notifyPlayer(
          village.owner,
          `§4⚠ FAMINE in §b${village.name}§4! Population is dying!`
        );
        break;
    }
  } else if (village.foodStorage > dailyConsumption * 3) {
    if (village.foodShortageStage > 0) {
      village.foodShortageStage = Math.max(0, village.foodShortageStage - 1) as FoodShortageStage;
      if (prev > 0 && village.foodShortageStage === 0) {
        notifyPlayer(village.owner, `§aFood stores recovered in §b${village.name}§a.`);
      }
    }
  }
}

export function buyFood(village: VillageData, amount: number): boolean {
  const costPerUnit = 2;
  const total = amount * costPerUnit;

  if (village.treasury < total) return false;

  village.treasury -= total;
  village.foodStorage += amount;
  saveVillage(village);
  notifyPlayer(village.owner, `§aBought ${amount} food for ${total}💎 in §b${village.name}§a.`);
  return true;
}

export function sellFood(village: VillageData, amount: number): boolean {
  const sellPricePerUnit = 1;

  if (village.foodStorage < amount) return false;

  village.foodStorage -= amount;
  village.treasury += amount * sellPricePerUnit;
  saveVillage(village);
  notifyPlayer(village.owner, `§aSold ${amount} food for ${amount * sellPricePerUnit}💎.`);
  return true;
}

export function depositFood(village: VillageData, amount: number): void {
  village.foodStorage += amount;
  saveVillage(village);
}

export function processAllFood(): void {
  for (const village of getAllVillages()) {
    tickFood(village);
  }
}
