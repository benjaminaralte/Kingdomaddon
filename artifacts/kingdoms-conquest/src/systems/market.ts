import { world, Player, ItemStack, EntityInventoryComponent } from "@minecraft/server";
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

export interface SeedShopEntry {
  itemId: string;
  label: string;
  quantityPerPurchase: number;
  emeraldCost: number;
}

export const SEED_SHOP: SeedShopEntry[] = [
  { itemId: "minecraft:wheat_seeds",   label: "Wheat Seeds",    quantityPerPurchase: 8,  emeraldCost: 1 },
  { itemId: "minecraft:carrot",        label: "Carrots (seed)", quantityPerPurchase: 8,  emeraldCost: 2 },
  { itemId: "minecraft:potato",        label: "Potatoes (seed)",quantityPerPurchase: 8,  emeraldCost: 2 },
  { itemId: "minecraft:beetroot_seeds",label: "Beetroot Seeds", quantityPerPurchase: 8,  emeraldCost: 1 },
  { itemId: "minecraft:pumpkin_seeds", label: "Pumpkin Seeds",  quantityPerPurchase: 8,  emeraldCost: 2 },
  { itemId: "minecraft:melon_seeds",   label: "Melon Seeds",    quantityPerPurchase: 8,  emeraldCost: 2 },
  { itemId: "minecraft:nether_wart",   label: "Nether Wart",    quantityPerPurchase: 4,  emeraldCost: 3 },
];

export interface FoodSellEntry {
  itemId: string;
  label: string;
  itemsPerEmerald: number;
  minBatch: number;
}

export const FOOD_SELL_RATES: FoodSellEntry[] = [
  { itemId: "minecraft:wheat",           label: "Wheat",         itemsPerEmerald: 8,  minBatch: 16 },
  { itemId: "minecraft:carrot",          label: "Carrot",        itemsPerEmerald: 6,  minBatch: 16 },
  { itemId: "minecraft:potato",          label: "Potato",        itemsPerEmerald: 8,  minBatch: 16 },
  { itemId: "minecraft:baked_potato",    label: "Baked Potato",  itemsPerEmerald: 5,  minBatch: 16 },
  { itemId: "minecraft:bread",           label: "Bread",         itemsPerEmerald: 3,  minBatch: 8  },
  { itemId: "minecraft:beetroot",        label: "Beetroot",      itemsPerEmerald: 10, minBatch: 16 },
  { itemId: "minecraft:apple",           label: "Apple",         itemsPerEmerald: 6,  minBatch: 16 },
  { itemId: "minecraft:cooked_beef",     label: "Cooked Beef",   itemsPerEmerald: 2,  minBatch: 8  },
  { itemId: "minecraft:cooked_porkchop", label: "Cooked Pork",   itemsPerEmerald: 2,  minBatch: 8  },
  { itemId: "minecraft:cooked_chicken",  label: "Cooked Chicken",itemsPerEmerald: 3,  minBatch: 8  },
  { itemId: "minecraft:cooked_mutton",   label: "Cooked Mutton", itemsPerEmerald: 3,  minBatch: 8  },
  { itemId: "minecraft:cooked_salmon",   label: "Cooked Salmon", itemsPerEmerald: 3,  minBatch: 8  },
  { itemId: "minecraft:melon_slice",     label: "Melon Slice",   itemsPerEmerald: 10, minBatch: 16 },
];

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

export function buySeedsFromMarket(
  player: Player,
  village: VillageData,
  entry: SeedShopEntry
): boolean {
  if (village.marketLevel < 1) {
    notifyPlayer(player.name, "§cBuild and upgrade the market first.");
    return false;
  }

  const inv = player.getComponent(EntityInventoryComponent.componentId) as EntityInventoryComponent | undefined;
  if (!inv?.container) return false;
  const container = inv.container;

  let emeraldsHeld = 0;
  for (let i = 0; i < container.size; i++) {
    const slot = container.getItem(i);
    if (slot?.typeId === "minecraft:emerald") emeraldsHeld += slot.amount;
  }

  if (emeraldsHeld < entry.emeraldCost) {
    notifyPlayer(player.name, `§cNeed §6${entry.emeraldCost} emeralds§c (you have ${emeraldsHeld}) to buy ${entry.quantityPerPurchase}x ${entry.label}.`);
    return false;
  }

  let emeraldsToRemove = entry.emeraldCost;
  for (let i = 0; i < container.size && emeraldsToRemove > 0; i++) {
    const slot = container.getItem(i);
    if (!slot || slot.typeId !== "minecraft:emerald") continue;
    const take = Math.min(slot.amount, emeraldsToRemove);
    emeraldsToRemove -= take;
    if (take >= slot.amount) {
      container.setItem(i, undefined);
    } else {
      slot.amount -= take;
      container.setItem(i, slot);
    }
  }

  let remaining = entry.quantityPerPurchase;
  for (let i = 0; i < container.size && remaining > 0; i++) {
    const slot = container.getItem(i);
    if (!slot) {
      const give = Math.min(remaining, 64);
      container.setItem(i, new ItemStack(entry.itemId, give));
      remaining -= give;
    } else if (slot.typeId === entry.itemId && slot.amount < 64) {
      const give = Math.min(remaining, 64 - slot.amount);
      slot.amount += give;
      container.setItem(i, slot);
      remaining -= give;
    }
  }

  if (remaining > 0) {
    notifyPlayer(player.name, "§cInventory full — some seeds couldn't be delivered.");
  }

  notifyPlayer(player.name, `§aBought §b${entry.quantityPerPurchase - remaining}x ${entry.label}§a for §6${entry.emeraldCost}💎§a.`);
  return true;
}

export function sellFoodBulk(
  player: Player,
  village: VillageData,
  entry: FoodSellEntry,
  batches: number
): boolean {
  const totalItems = entry.itemsPerEmerald * batches;
  const emeraldsEarned = batches;

  if (batches < 1) {
    notifyPlayer(player.name, "§cMinimum 1 batch.");
    return false;
  }

  const granaryHas = village.granaryItems[entry.itemId] ?? 0;
  const inv = player.getComponent(EntityInventoryComponent.componentId) as EntityInventoryComponent | undefined;
  const container = inv?.container;

  let inventoryHas = 0;
  if (container) {
    for (let i = 0; i < container.size; i++) {
      const slot = container.getItem(i);
      if (slot?.typeId === entry.itemId) inventoryHas += slot.amount;
    }
  }

  const totalAvailable = granaryHas + inventoryHas;
  if (totalAvailable < totalItems) {
    notifyPlayer(
      player.name,
      `§cNeed §b${totalItems}x ${entry.label}§c to sell (granary: ${granaryHas}, inventory: ${inventoryHas}).`
    );
    return false;
  }

  let remaining = totalItems;

  if (granaryHas > 0 && remaining > 0) {
    const fromGranary = Math.min(granaryHas, remaining);
    village.granaryItems[entry.itemId] = granaryHas - fromGranary;
    if (village.granaryItems[entry.itemId] === 0) delete village.granaryItems[entry.itemId];
    remaining -= fromGranary;
  }

  if (remaining > 0 && container) {
    for (let i = 0; i < container.size && remaining > 0; i++) {
      const slot = container.getItem(i);
      if (!slot || slot.typeId !== entry.itemId) continue;
      const take = Math.min(slot.amount, remaining);
      remaining -= take;
      if (take >= slot.amount) {
        container.setItem(i, undefined);
      } else {
        slot.amount -= take;
        container.setItem(i, slot);
      }
    }
  }

  if (container) {
    let emeraldsLeft = emeraldsEarned;
    for (let i = 0; i < container.size && emeraldsLeft > 0; i++) {
      const slot = container.getItem(i);
      if (!slot) {
        const give = Math.min(emeraldsLeft, 64);
        container.setItem(i, new ItemStack("minecraft:emerald", give));
        emeraldsLeft -= give;
      } else if (slot.typeId === "minecraft:emerald" && slot.amount < 64) {
        const give = Math.min(emeraldsLeft, 64 - slot.amount);
        slot.amount += give;
        container.setItem(i, slot);
        emeraldsLeft -= give;
      }
    }
    if (emeraldsLeft > 0) {
      notifyPlayer(player.name, "§eInventory full — some emeralds dropped on the ground.");
      try {
        const loc = player.location;
        player.dimension.spawnItem(new ItemStack("minecraft:emerald", emeraldsLeft), loc);
      } catch { /* ignore */ }
    }
  }

  saveVillage(village);
  notifyPlayer(
    player.name,
    `§aSold §b${totalItems}x ${entry.label}§a → §6+${emeraldsEarned}💎§a.`
  );
  return true;
}

export function processAllMarkets(): void {
  for (const village of getAllVillages()) {
    tickMarket(village);
  }
}
