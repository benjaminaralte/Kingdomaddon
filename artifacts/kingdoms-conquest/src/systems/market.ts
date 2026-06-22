import { world, Player, ItemStack, EntityInventoryComponent } from "@minecraft/server";
import type { VillageData, MerchantData } from "../types/index.js";
import { getAllVillages, saveVillage } from "../storage/index.js";
import { notifyPlayer } from "../utils/notify.js";

const MERCHANT_OUTER_SPAWN_MIN = 70;
const MERCHANT_OUTER_SPAWN_MAX = 100;
const MERCHANT_MOVE_SPEED = 2.0;       // blocks per second (called every 20 ticks)
const MERCHANT_ARRIVE_RADIUS = 2.5;    // blocks
const MERCHANT_DANGER_RADIUS = 5;      // hostiles within this range damage merchant
const MERCHANT_SPAWN_INTERVAL = 1200;  // ticks — try spawn every ~60s

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

export interface MaterialCost {
  itemId: string;
  amount: number;
  label: string;
}

export interface SeedShopEntry {
  itemId: string;
  label: string;
  quantityPerPurchase: number;
  emeraldCost: number;
}

/** Materials consumed from player inventory on every seed/tool purchase. */
export const SEED_PURCHASE_MATERIALS: MaterialCost[] = [];

export const SEED_SHOP: SeedShopEntry[] = [
  // ── Vanilla Seeds ──────────────────────────────────────────────────────────
  { itemId: "minecraft:wheat_seeds",   label: "Wheat Seeds",    quantityPerPurchase: 16, emeraldCost: 1 },
  { itemId: "minecraft:carrot",        label: "Carrots",        quantityPerPurchase: 16, emeraldCost: 1 },
  { itemId: "minecraft:potato",        label: "Potatoes",       quantityPerPurchase: 16, emeraldCost: 1 },
  { itemId: "minecraft:beetroot_seeds",label: "Beetroot Seeds", quantityPerPurchase: 16, emeraldCost: 1 },
  { itemId: "minecraft:pumpkin_seeds", label: "Pumpkin Seeds",  quantityPerPurchase: 12, emeraldCost: 1 },
  { itemId: "minecraft:melon_seeds",   label: "Melon Seeds",    quantityPerPurchase: 12, emeraldCost: 1 },
  { itemId: "minecraft:nether_wart",   label: "Nether Wart",    quantityPerPurchase: 8,  emeraldCost: 2 },
  // ── Bob's Farming Crops (twb_farm) ─────────────────────────────────────────
  { itemId: "twb_farm:garlic",         label: "🧄 Garlic",      quantityPerPurchase: 8,  emeraldCost: 2 },
  { itemId: "twb_farm:onion",          label: "🧅 Onion",       quantityPerPurchase: 8,  emeraldCost: 2 },
  { itemId: "twb_farm:rice",           label: "🌾 Rice",        quantityPerPurchase: 8,  emeraldCost: 2 },
  { itemId: "twb_farm:broccoli",       label: "🥦 Broccoli",    quantityPerPurchase: 8,  emeraldCost: 2 },
  { itemId: "twb_farm:cauliflower",    label: "🥬 Cauliflower", quantityPerPurchase: 8,  emeraldCost: 2 },
  { itemId: "twb_farm:chili",          label: "🌶 Chili",       quantityPerPurchase: 8,  emeraldCost: 2 },
  { itemId: "twb_farm:eggplant",       label: "🍆 Eggplant",    quantityPerPurchase: 8,  emeraldCost: 2 },
  { itemId: "twb_farm:leek",           label: "🌿 Leek",        quantityPerPurchase: 8,  emeraldCost: 2 },
  { itemId: "twb_farm:grape",          label: "🍇 Grape",       quantityPerPurchase: 8,  emeraldCost: 3 },
  { itemId: "twb_farm:pineapple",      label: "🍍 Pineapple",   quantityPerPurchase: 8,  emeraldCost: 3 },
];

export interface FoodSellEntry {
  itemId: string;
  label: string;
  itemsPerEmerald: number;
  minBatch: number;
}

export const FOOD_SELL_RATES: FoodSellEntry[] = [
  { itemId: "minecraft:wheat",           label: "Wheat",         itemsPerEmerald: 5,  minBatch: 10 },
  { itemId: "minecraft:carrot",          label: "Carrot",        itemsPerEmerald: 4,  minBatch: 8  },
  { itemId: "minecraft:potato",          label: "Potato",        itemsPerEmerald: 5,  minBatch: 10 },
  { itemId: "minecraft:baked_potato",    label: "Baked Potato",  itemsPerEmerald: 3,  minBatch: 6  },
  { itemId: "minecraft:bread",           label: "Bread",         itemsPerEmerald: 2,  minBatch: 4  },
  { itemId: "minecraft:beetroot",        label: "Beetroot",      itemsPerEmerald: 6,  minBatch: 12 },
  { itemId: "minecraft:apple",           label: "Apple",         itemsPerEmerald: 4,  minBatch: 8  },
  { itemId: "minecraft:cooked_beef",     label: "Cooked Beef",   itemsPerEmerald: 1,  minBatch: 2  },
  { itemId: "minecraft:cooked_porkchop", label: "Cooked Pork",   itemsPerEmerald: 1,  minBatch: 2  },
  { itemId: "minecraft:cooked_chicken",  label: "Cooked Chicken",itemsPerEmerald: 2,  minBatch: 4  },
  { itemId: "minecraft:cooked_mutton",   label: "Cooked Mutton", itemsPerEmerald: 2,  minBatch: 4  },
  { itemId: "minecraft:cooked_salmon",   label: "Cooked Salmon", itemsPerEmerald: 2,  minBatch: 4  },
  { itemId: "minecraft:melon_slice",     label: "Melon Slice",   itemsPerEmerald: 6,  minBatch: 12 },
];

export function getMaxMerchants(village: VillageData): number {
  return Math.floor(village.marketLevel * 3 + village.population / 8);
}

export function tickAllMerchantsSpawn(currentTick: number): void {
  if (currentTick % MERCHANT_SPAWN_INTERVAL !== 0) return;
  for (const village of getAllVillages()) {
    cleanupDespawnedMerchants(village);
    if (village.activeMerchants.length < getMaxMerchants(village)) {
      spawnMerchant(village);
    }
  }
}

export function tickAllMerchantMovement(): void {
  for (const village of getAllVillages()) {
    if (village.activeMerchants.length === 0) continue;
    tickMerchantMovement(village);
  }
}

function spawnMerchant(village: VillageData): void {
  const dim = world.getDimension(village.location.dimension);
  const loc = village.townHallLocation;

  const templates = Object.keys(MERCHANT_STOCK_TEMPLATES);
  const templateKey = templates[Math.floor(Math.random() * templates.length)];
  const stock = { ...MERCHANT_STOCK_TEMPLATES[templateKey] };

  const angle = Math.random() * Math.PI * 2;
  const distance = MERCHANT_OUTER_SPAWN_MIN + Math.random() * (MERCHANT_OUTER_SPAWN_MAX - MERCHANT_OUTER_SPAWN_MIN);

  try {
    const entity = dim.spawnEntity("kingdoms:merchant", {
      x: loc.x + Math.cos(angle) * distance,
      y: loc.y,
      z: loc.z + Math.sin(angle) * distance,
    });

    const merchantData: MerchantData = {
      entityId: entity.id,
      stock,
      destinationVillageId: village.id,
      currentPoleIndex: 0,
    };

    entity.setDynamicProperty("kc:merchant_data", JSON.stringify(merchantData));
    entity.setDynamicProperty("kc:village_id", village.id);
    entity.nameTag = `§6Merchant §7[${village.name}]`;

    village.activeMerchants.push(merchantData);
    saveVillage(village);

    notifyPlayer(
      village.owner,
      `§6A merchant has set out for §b${village.name}§6! (${Math.round(distance)} blocks away, Stock: ${Object.keys(stock).length} types)`
    );
  } catch {
    // Chunk not loaded
  }
}

function tickMerchantMovement(village: VillageData): void {
  const dim = world.getDimension(village.location.dimension);
  const poles = village.tradePoles;
  const townHall = village.townHallLocation;
  let changed = false;

  for (const merchantData of village.activeMerchants) {
    try {
      const entities = dim.getEntities({ type: "kingdoms:merchant" });
      const entity = entities.find((e) => e.id === merchantData.entityId);
      if (!entity) continue;

      const loc = entity.location;

      let target: { x: number; y: number; z: number };
      let onPole = false;

      if (poles.length > 0 && merchantData.currentPoleIndex < poles.length) {
        target = poles[merchantData.currentPoleIndex].location;
        onPole = true;
      } else {
        target = townHall;
      }

      const dx = target.x - loc.x;
      const dz = target.z - loc.z;
      const dist2D = Math.sqrt(dx * dx + dz * dz);

      if (dist2D < MERCHANT_ARRIVE_RADIUS) {
        if (onPole) {
          merchantData.currentPoleIndex++;
          changed = true;
        }
        continue;
      }

      const ratio = MERCHANT_MOVE_SPEED / dist2D;
      entity.teleport(
        { x: loc.x + dx * ratio, y: loc.y, z: loc.z + dz * ratio },
        { keepVelocity: false }
      );

      try {
        const hostiles = dim.getEntities({ location: loc, maxDistance: MERCHANT_DANGER_RADIUS, families: ["monster"] });
        if (hostiles.length > 0) {
          entity.applyDamage(2);
          if (Math.random() < 0.04) {
            notifyPlayer(village.owner, `§c⚠ A merchant heading to §b${village.name}§c is under mob attack! (${Math.round(dist2D)} blocks out)`);
          }
        }
      } catch { /* family query not supported */ }
    } catch { /* chunk unloaded */ }
  }

  if (changed) saveVillage(village);
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
    "minecraft:iron_ingot":  3,
    "minecraft:gold_ingot":  5,
    "minecraft:diamond":     12,
    "minecraft:coal":        2,
    "minecraft:bread":       2,
    "minecraft:cooked_beef": 2,
    "minecraft:apple":       1,
  };
  return prices[itemTypeId] ?? 3;
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

function countItem(container: import("@minecraft/server").Container, itemId: string): number {
  let total = 0;
  for (let i = 0; i < container.size; i++) {
    const slot = container.getItem(i);
    if (slot?.typeId === itemId) total += slot.amount;
  }
  return total;
}

function removeItems(container: import("@minecraft/server").Container, itemId: string, amount: number): void {
  let toRemove = amount;
  for (let i = 0; i < container.size && toRemove > 0; i++) {
    const slot = container.getItem(i);
    if (!slot || slot.typeId !== itemId) continue;
    const take = Math.min(slot.amount, toRemove);
    toRemove -= take;
    if (take >= slot.amount) container.setItem(i, undefined);
    else { slot.amount -= take; container.setItem(i, slot); }
  }
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

  const emeraldsHeld = countItem(container, "minecraft:emerald");
  if (emeraldsHeld < entry.emeraldCost) {
    notifyPlayer(player.name, `§cNeed §6${entry.emeraldCost} emeralds§c (you have ${emeraldsHeld}).`);
    return false;
  }

  const missing: string[] = [];
  for (const mat of SEED_PURCHASE_MATERIALS) {
    if (countItem(container, mat.itemId) < mat.amount) {
      missing.push(`§e${mat.label}`);
    }
  }
  if (missing.length > 0) {
    notifyPlayer(player.name, `§cAlso need: ${missing.join("§c, ")}`);
    return false;
  }

  removeItems(container, "minecraft:emerald", entry.emeraldCost);

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

  if (remaining > 0) notifyPlayer(player.name, "§cInventory full — some seeds couldn't be delivered.");
  notifyPlayer(
    player.name,
    `§aBought §b${entry.quantityPerPurchase - remaining}x ${entry.label}§a for §6${entry.emeraldCost} emerald(s)§a.`
  );
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

  village.treasury += emeraldsEarned;

  saveVillage(village);
  notifyPlayer(
    player.name,
    `§aSold §b${totalItems}x ${entry.label}§a → §6+${emeraldsEarned}💎§a added to §b${village.name}§a treasury. (Total: §6${village.treasury}💎§a)`
  );
  return true;
}

