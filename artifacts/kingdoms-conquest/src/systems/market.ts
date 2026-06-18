import { world } from "@minecraft/server";
import type { VillageData, MerchantData } from "../types/index.js";
import { MERCHANT_SPAWN_RADIUS } from "../types/index.js";
import { getAllVillages, saveVillage } from "../storage/index.js";
import { isNewDay } from "../utils/tick.js";
import { notifyPlayer } from "../utils/notify.js";

const MERCHANT_STOCK_TEMPLATES: Record<string, Record<string, number>> = {
  common: {
    "minecraft:iron_ingot": 32,
    "minecraft:gold_ingot": 8,
    "minecraft:coal": 64,
  },
  rare: {
    "minecraft:diamond": 5,
    "minecraft:iron_ingot": 48,
    "minecraft:gold_ingot": 16,
  },
  food: {
    "minecraft:bread": 64,
    "minecraft:cooked_beef": 32,
    "minecraft:apple": 48,
  },
};

export function getMaxMerchants(village: VillageData): number {
  return Math.floor(village.marketLevel * 1.5 + village.population / 20);
}

export function tickMarket(village: VillageData): void {
  if (!isNewDay(village.lastDayProcessed)) return;

  cleanupDespawnedMerchants(village);

  const maxMerchants = getMaxMerchants(village);
  const currentCount = village.activeMerchants.length;

  if (currentCount >= maxMerchants) return;

  const spawnChance = 0.2 + (village.prosperity / 100) * 0.5;
  if (Math.random() < spawnChance) {
    spawnMerchant(village);
  }
}

function spawnMerchant(village: VillageData): void {
  const dim = world.getDimension(village.location.dimension);
  const loc = village.townHallLocation;

  const templates = Object.keys(MERCHANT_STOCK_TEMPLATES);
  const templateKey = templates[Math.floor(Math.random() * templates.length)];
  const stock = { ...MERCHANT_STOCK_TEMPLATES[templateKey] };

  try {
    const entity = dim.spawnEntity("kingdoms:merchant", {
      x: loc.x + (Math.random() * MERCHANT_SPAWN_RADIUS * 2 - MERCHANT_SPAWN_RADIUS),
      y: loc.y,
      z: loc.z + (Math.random() * MERCHANT_SPAWN_RADIUS * 2 - MERCHANT_SPAWN_RADIUS),
    });

    const merchantData: MerchantData = {
      entityId: entity.id,
      stock,
      destinationVillageId: village.id,
      currentPoleIndex: 0,
    };

    entity.setDynamicProperty("kc:merchant_data", JSON.stringify(merchantData));
    entity.setDynamicProperty("kc:village_id", village.id);
    entity.nameTag = `Merchant [${village.name}]`;

    village.activeMerchants.push(merchantData);
    saveVillage(village);

    notifyPlayer(
      village.owner,
      `§6A merchant has arrived at §b${village.name}§6! (Stock: ${Object.keys(stock).length} types)`
    );
  } catch {
    // Chunk not loaded
  }
}

function cleanupDespawnedMerchants(village: VillageData): void {
  const dim = world.getDimension(village.location.dimension);
  const allEntities = dim.getEntities({ type: "kingdoms:merchant" });
  const activeIds = new Set(allEntities.map((e) => e.id));

  const before = village.activeMerchants.length;
  village.activeMerchants = village.activeMerchants.filter((m) => activeIds.has(m.entityId));

  if (village.activeMerchants.length < before) {
    saveVillage(village);
  }
}

export function tradeMerchant(
  village: VillageData,
  merchantEntityId: string,
  itemTypeId: string,
  buyAmount: number
): boolean {
  const merchantIdx = village.activeMerchants.findIndex((m) => m.entityId === merchantEntityId);
  if (merchantIdx === -1) return false;

  const merchant = village.activeMerchants[merchantIdx];
  const availableStock = merchant.stock[itemTypeId] ?? 0;
  if (availableStock < buyAmount) {
    notifyPlayer(village.owner, `§cMerchant only has ${availableStock} of that item.`);
    return false;
  }

  const pricePer = getMerchantPrice(itemTypeId);
  const totalCost = pricePer * buyAmount;

  if (village.treasury < totalCost) {
    notifyPlayer(village.owner, `§cNeed ${totalCost}💎 to buy ${buyAmount}x ${itemTypeId}.`);
    return false;
  }

  village.treasury -= totalCost;
  merchant.stock[itemTypeId] -= buyAmount;

  if (merchant.stock[itemTypeId] <= 0) {
    delete merchant.stock[itemTypeId];
  }

  const totalRemaining = Object.values(merchant.stock).reduce((a, b) => a + b, 0);
  if (totalRemaining <= 0) {
    removeMerchant(village, merchantEntityId);
  } else {
    saveVillage(village);
  }

  return true;
}

function removeMerchant(village: VillageData, merchantEntityId: string): void {
  const dim = world.getDimension(village.location.dimension);
  try {
    const entities = dim.getEntities({ type: "kingdoms:merchant" });
    const entity = entities.find((e) => e.id === merchantEntityId);
    if (entity) entity.remove();
  } catch { /* ignore */ }

  village.activeMerchants = village.activeMerchants.filter((m) => m.entityId !== merchantEntityId);
  saveVillage(village);
}

function getMerchantPrice(itemTypeId: string): number {
  const prices: Record<string, number> = {
    "minecraft:iron_ingot": 1,
    "minecraft:gold_ingot": 3,
    "minecraft:diamond": 8,
    "minecraft:coal": 1,
    "minecraft:bread": 1,
    "minecraft:cooked_beef": 1,
    "minecraft:apple": 1,
  };
  return prices[itemTypeId] ?? 2;
}

export function upgradeMarket(village: VillageData): boolean {
  if (village.marketLevel >= 5) {
    notifyPlayer(village.owner, "§cMarket already at maximum level.");
    return false;
  }

  const cost = village.marketLevel * 20;
  if (village.treasury < cost) {
    notifyPlayer(village.owner, `§cNeed ${cost}💎 to upgrade market.`);
    return false;
  }

  village.treasury -= cost;
  village.marketLevel++;
  saveVillage(village);
  notifyPlayer(village.owner, `§aMarket upgraded to level §b${village.marketLevel}§a in §b${village.name}§a!`);
  return true;
}

export function processAllMarkets(): void {
  for (const village of getAllVillages()) {
    tickMarket(village);
  }
}
