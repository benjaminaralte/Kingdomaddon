import { world, Player, ItemStack, EntityInventoryComponent } from "@minecraft/server";
import type { VillageData, Vec3 } from "../types/index.js";
import { saveVillage, getAllVillages } from "../storage/index.js";
import { getCurrentDay, daysSince } from "../utils/tick.js";
import { notifyPlayer } from "../utils/notify.js";
import { VILLAGE_CLAIM_RADIUS } from "../types/index.js";

export const CROP_MAX_AGES: Record<string, number> = {
  "minecraft:wheat": 7,
  "minecraft:carrots": 7,
  "minecraft:potatoes": 7,
  "minecraft:beetroots": 3,
  "minecraft:nether_wart": 3,
};

const CROP_DROPS: Record<string, Array<{ item: string; min: number; max: number }>> = {
  "minecraft:wheat": [
    { item: "minecraft:wheat", min: 1, max: 1 },
    { item: "minecraft:wheat_seeds", min: 0, max: 3 },
  ],
  "minecraft:carrots": [{ item: "minecraft:carrot", min: 2, max: 5 }],
  "minecraft:potatoes": [{ item: "minecraft:potato", min: 2, max: 5 }],
  "minecraft:beetroots": [
    { item: "minecraft:beetroot", min: 1, max: 1 },
    { item: "minecraft:beetroot_seeds", min: 0, max: 3 },
  ],
  "minecraft:nether_wart": [{ item: "minecraft:nether_wart", min: 2, max: 4 }],
};

export const FOOD_ITEM_VALUES: Record<string, number> = {
  "minecraft:wheat": 2,
  "minecraft:carrot": 3,
  "minecraft:potato": 1,
  "minecraft:baked_potato": 5,
  "minecraft:beetroot": 1,
  "minecraft:bread": 5,
  "minecraft:melon_slice": 2,
  "minecraft:apple": 4,
  "minecraft:pumpkin": 4,
  "minecraft:cooked_beef": 8,
  "minecraft:cooked_porkchop": 8,
  "minecraft:cooked_chicken": 6,
  "minecraft:cooked_mutton": 6,
  "minecraft:cooked_salmon": 6,
  "minecraft:cooked_cod": 5,
  "minecraft:nether_wart": 0,
};

export function isCropBlock(typeId: string): boolean {
  return typeId in CROP_MAX_AGES;
}

export function getGranaryFoodUnits(village: VillageData): number {
  return Object.entries(village.granaryItems).reduce((total, [item, count]) => {
    const value = FOOD_ITEM_VALUES[item] ?? 0;
    return total + value * count;
  }, 0);
}

export function addToGranary(village: VillageData, item: string, amount: number): void {
  if (amount <= 0) return;
  village.granaryItems[item] = (village.granaryItems[item] ?? 0) + amount;
  saveVillage(village);
}

export function removeFromGranary(village: VillageData, item: string, amount: number): number {
  const current = village.granaryItems[item] ?? 0;
  const removed = Math.min(current, amount);
  if (removed > 0) {
    village.granaryItems[item] = current - removed;
    if (village.granaryItems[item] === 0) delete village.granaryItems[item];
  }
  return removed;
}

export function handleCropBreak(
  player: Player,
  blockTypeId: string,
  blockAge: number,
  blockLocation: Vec3,
  dimensionId: string
): boolean {
  const maxAge = CROP_MAX_AGES[blockTypeId];
  if (maxAge === undefined || blockAge < maxAge) return false;

  const village = findVillageAt(blockLocation, dimensionId);
  if (!village) return false;

  const drops = CROP_DROPS[blockTypeId] ?? [];
  const harvestedItems: Array<{ item: string; amount: number }> = [];
  const playerItems: Array<{ item: string; amount: number }> = [];

  for (const drop of drops) {
    const amount = drop.min + Math.floor(Math.random() * (drop.max - drop.min + 1));
    if (amount <= 0) continue;
    const isFood = (FOOD_ITEM_VALUES[drop.item] ?? -1) >= 0;
    if (isFood) {
      harvestedItems.push({ item: drop.item, amount });
    } else {
      playerItems.push({ item: drop.item, amount });
    }
  }

  for (const { item, amount } of harvestedItems) {
    addToGranary(village, item, amount);
  }

  const inv = player.getComponent(EntityInventoryComponent.componentId) as EntityInventoryComponent | undefined;
  if (inv?.container) {
    for (const { item, amount } of playerItems) {
      let remaining = amount;
      const container = inv.container;
      for (let i = 0; i < container.size && remaining > 0; i++) {
        const slot = container.getItem(i);
        if (!slot) {
          const give = Math.min(remaining, 64);
          container.setItem(i, new ItemStack(item, give));
          remaining -= give;
        } else if (slot.typeId === item && slot.amount < 64) {
          const give = Math.min(remaining, 64 - slot.amount);
          slot.amount += give;
          container.setItem(i, slot);
          remaining -= give;
        }
      }
    }
  }

  const foodTotal = harvestedItems.reduce((sum, { item, amount }) => sum + (FOOD_ITEM_VALUES[item] ?? 0) * amount, 0);
  if (foodTotal > 0) {
    notifyPlayer(player.name, `§a+${harvestedItems.map(({ item, amount }) => `${amount}x ${item.replace("minecraft:", "")}`).join(", ")} → §b${village.name} Granary`);
  }

  return true;
}

export function withdrawFromGranary(
  player: Player,
  village: VillageData,
  itemTypeId: string,
  amount: number
): boolean {
  const available = village.granaryItems[itemTypeId] ?? 0;
  if (available < amount) {
    notifyPlayer(player.name, `§cNot enough ${itemTypeId.replace("minecraft:", "")} in granary (${available} available).`);
    return false;
  }

  const inv = player.getComponent(EntityInventoryComponent.componentId) as EntityInventoryComponent | undefined;
  if (!inv?.container) return false;
  const container = inv.container;

  let remaining = amount;
  for (let i = 0; i < container.size && remaining > 0; i++) {
    const slot = container.getItem(i);
    if (!slot) {
      const give = Math.min(remaining, 64);
      container.setItem(i, new ItemStack(itemTypeId, give));
      remaining -= give;
    } else if (slot.typeId === itemTypeId && slot.amount < 64) {
      const give = Math.min(remaining, 64 - slot.amount);
      slot.amount += give;
      container.setItem(i, slot);
      remaining -= give;
    }
  }

  if (remaining > 0) {
    notifyPlayer(player.name, "§cInventory full.");
    return false;
  }

  removeFromGranary(village, itemTypeId, amount);
  notifyPlayer(player.name, `§aWithdrew ${amount}x ${itemTypeId.replace("minecraft:", "")} from §b${village.name}§a granary.`);
  return true;
}

export function depositPlayerItemsToGranary(
  player: Player,
  village: VillageData,
  itemTypeId: string,
  amount: number
): boolean {
  const inv = player.getComponent(EntityInventoryComponent.componentId) as EntityInventoryComponent | undefined;
  if (!inv?.container) return false;
  const container = inv.container;

  let available = 0;
  for (let i = 0; i < container.size; i++) {
    const slot = container.getItem(i);
    if (slot?.typeId === itemTypeId) available += slot.amount;
  }

  const toDeposit = Math.min(available, amount);
  if (toDeposit === 0) {
    notifyPlayer(player.name, `§cNo ${itemTypeId.replace("minecraft:", "")} in your inventory.`);
    return false;
  }

  let remaining = toDeposit;
  for (let i = 0; i < container.size && remaining > 0; i++) {
    const slot = container.getItem(i);
    if (!slot || slot.typeId !== itemTypeId) continue;
    const take = Math.min(slot.amount, remaining);
    remaining -= take;
    if (take >= slot.amount) {
      container.setItem(i, undefined);
    } else {
      slot.amount -= take;
      container.setItem(i, slot);
    }
  }

  addToGranary(village, itemTypeId, toDeposit);
  notifyPlayer(player.name, `§aDeposited ${toDeposit}x ${itemTypeId.replace("minecraft:", "")} into §b${village.name}§a granary.`);
  return true;
}

export function consumeSoldierFoodFromGranary(village: VillageData): void {
  const currentDay = getCurrentDay();
  const daysSinceFeed = daysSince(village.lastSoldierFeedDay ?? 0);
  if (daysSinceFeed < 3) return;

  const soldiers =
    village.troops.cityGuards               +
    village.troops.spearmen                 +
    village.troops.archers                  +
    village.troops.cavalry                  +
    (village.troops.heavyKnight      ?? 0)  +
    (village.troops.samurai          ?? 0)  +
    (village.troops.mercenaryLancer  ?? 0)  +
    (village.troops.legionary        ?? 0);

  if (soldiers === 0) {
    village.lastSoldierFeedDay = currentDay;
    village.missedSoldierFeedDays = 0;
    saveVillage(village);
    return;
  }

  const foodNeeded = soldiers * 6;
  let foodPaid = 0;

  for (const item of Object.keys(village.granaryItems)) {
    if (foodPaid >= foodNeeded) break;
    const value = FOOD_ITEM_VALUES[item] ?? 0;
    if (value <= 0) continue;
    const unitsNeeded = Math.ceil((foodNeeded - foodPaid) / value);
    const removed = removeFromGranary(village, item, unitsNeeded);
    foodPaid += removed * value;
  }

  if (foodPaid < foodNeeded) {
    const shortfall = Math.ceil(foodNeeded - foodPaid);
    if (village.foodStorage >= shortfall) {
      village.foodStorage -= shortfall;
      foodPaid += shortfall;
    } else {
      village.foodStorage = 0;
    }
  }

  const fed = foodPaid >= foodNeeded;

  if (fed) {
    village.missedSoldierFeedDays = 0;
    notifyPlayer(
      village.owner,
      `§e${soldiers} soldiers in §b${village.name}§e consumed food from granary.`
    );
  } else {
    village.missedSoldierFeedDays = (village.missedSoldierFeedDays ?? 0) + 1;

    if (village.missedSoldierFeedDays === 1) {
      notifyPlayer(
        village.owner,
        `§c⚠ Soldiers in §b${village.name}§c couldn't be fully fed! They are starving — feed them or they will desert.`
      );
      village.prosperity = Math.max(0, village.prosperity - 10);
    } else {
      // Second consecutive missed feeding — troops desert as typed bandits
      const deserters: Partial<Record<string, number>> = {};
      const troopKeys: Array<keyof typeof village.troops> = [
        "cityGuards", "spearmen", "archers", "cavalry",
        "heavyKnight", "samurai", "mercenaryLancer", "legionary",
      ];

      let totalDeserters = 0;
      for (const key of troopKeys) {
        const count = village.troops[key] ?? 0;
        if (count > 0) {
          const d = Math.ceil(count * 0.3);
          deserters[key] = d;
          village.troops[key] = count - d;
          totalDeserters += d;
        }
      }

      village.missedSoldierFeedDays = 0;
      village.prosperity = Math.max(0, village.prosperity - 20);

      notifyPlayer(
        village.owner,
        `§4⚔ ${totalDeserters} starving soldiers deserted §b${village.name}§4 and turned hostile!`
      );

      if (totalDeserters > 0) {
        void import("./bandit.js").then(({ spawnTypedDeserters }) => {
          spawnTypedDeserters(village, deserters);
        });
      }
    }
  }

  village.lastSoldierFeedDay = currentDay;
  saveVillage(village);
}

export function processAllSoldierFood(): void {
  for (const village of getAllVillages()) {
    consumeSoldierFoodFromGranary(village);
  }
}

export function collectDroppedEmeraldsNearTreasury(village: VillageData): void {
  if (!village.treasuryLocation) return;
  const dim = world.getDimension(village.location.dimension);
  const loc = village.treasuryLocation;

  try {
    const items = dim.getEntities({
      type: "minecraft:item",
      location: { x: loc.x + 0.5, y: loc.y + 0.5, z: loc.z + 0.5 },
      maxDistance: 6,
    });

    let collected = 0;
    for (const item of items) {
      const itemComp = item.getComponent("minecraft:item") as { itemStack?: ItemStack } | undefined;
      if (!itemComp?.itemStack) continue;
      if (itemComp.itemStack.typeId !== "minecraft:emerald") continue;
      collected += itemComp.itemStack.amount;
      item.remove();
    }

    if (collected > 0) {
      village.treasury += collected;
      saveVillage(village);
      notifyPlayer(village.owner, `§a+${collected}💎 auto-collected to §b${village.name}§a treasury.`);
    }
  } catch {
    // chunk not loaded
  }
}

export function processAllTreasuryCollect(): void {
  for (const village of getAllVillages()) {
    collectDroppedEmeraldsNearTreasury(village);
  }
}

export function getGranaryReport(village: VillageData): string {
  const items = Object.entries(village.granaryItems).filter(([, count]) => count > 0);
  if (items.length === 0) {
    return `§b${village.name} Granary§r\nEmpty — harvest crops within village range to fill it.\n\nAbstract food reserve: ${village.foodStorage}🌾`;
  }

  const lines = items.map(([item, count]) => {
    const foodVal = FOOD_ITEM_VALUES[item] ?? 0;
    return `${item.replace("minecraft:", "")} ×${count} (${foodVal * count} food units)`;
  });

  const totalFood = getGranaryFoodUnits(village);
  return [
    `§b${village.name} Granary§r`,
    ...lines,
    ``,
    `Total: ${totalFood} food units`,
    `Abstract reserve: ${village.foodStorage}🌾`,
  ].join("\n");
}

function findVillageAt(location: Vec3, dimensionId: string): VillageData | undefined {
  return getAllVillages().find((v) => {
    if (v.location.dimension !== dimensionId) return false;
    const dx = v.location.x - location.x;
    const dz = v.location.z - location.z;
    return Math.sqrt(dx * dx + dz * dz) < VILLAGE_CLAIM_RADIUS;
  });
}

// ── Field Storage ─────────────────────────────────────────────────────────────
// NPC auto-harvest goes here. Players must manually collect and carry to granary.

export function addToFieldStorage(village: VillageData, item: string, amount: number): void {
  if (amount <= 0) return;
  village.fieldStorage ??= {};
  village.fieldStorage[item] = (village.fieldStorage[item] ?? 0) + amount;
}

export function getFieldStorageTotal(village: VillageData): number {
  if (!village.fieldStorage) return 0;
  return Object.entries(village.fieldStorage).reduce((total, [item, count]) => {
    return total + (FOOD_ITEM_VALUES[item] ?? 0) * count;
  }, 0);
}

export function getFieldStorageReport(village: VillageData): string {
  const fs = village.fieldStorage ?? {};
  const items = Object.entries(fs).filter(([, count]) => count > 0);
  if (items.length === 0) return `§b${village.name} Field Storage§r\nEmpty — NPC farmers will fill this each day.`;
  const lines = items.map(([item, count]) => {
    const val = FOOD_ITEM_VALUES[item] ?? 0;
    return `${item.replace("minecraft:", "")} ×${count} (${val * count} food units)`;
  });
  const total = getFieldStorageTotal(village);
  return [`§b${village.name} Field Storage§r`, ...lines, ``, `Total: ${total} food units`].join("\n");
}

/**
 * Moves all items from the village's field storage into the player's inventory.
 * Returns the number of item stacks transferred.
 */
export function collectFieldStorage(player: Player, village: VillageData): number {
  const fs = village.fieldStorage ?? {};
  const items = Object.entries(fs).filter(([, count]) => count > 0);
  if (items.length === 0) {
    notifyPlayer(player.name, `§eField storage in §b${village.name}§e is empty. Wait for farmers to harvest.`);
    return 0;
  }

  const inv = player.getComponent(EntityInventoryComponent.componentId) as EntityInventoryComponent | undefined;
  if (!inv?.container) return 0;
  const container = inv.container;

  let transferred = 0;
  const leftover: Record<string, number> = {};

  for (const [item, total] of items) {
    let remaining = total;
    for (let i = 0; i < container.size && remaining > 0; i++) {
      const slot = container.getItem(i);
      if (!slot) {
        const give = Math.min(remaining, 64);
        container.setItem(i, new ItemStack(item, give));
        remaining -= give;
        transferred++;
      } else if (slot.typeId === item && slot.amount < 64) {
        const give = Math.min(remaining, 64 - slot.amount);
        slot.amount += give;
        container.setItem(i, slot);
        remaining -= give;
      }
    }
    if (remaining > 0) leftover[item] = remaining;
  }

  village.fieldStorage = leftover;
  saveVillage(village);

  const foodUnits = getFieldStorageTotal(village);
  const leftoverNote = Object.keys(leftover).length > 0 ? " §e(inventory full — some items left behind)" : "";
  notifyPlayer(
    player.name,
    `§a🌾 Collected field harvest from §b${village.name}§a! Bring items to the granary to deposit.${leftoverNote}`
  );
  if (foodUnits > 0) {
    notifyPlayer(player.name, `§7${foodUnits} food units still remain in field storage.`);
  }
  return transferred;
}

// ── NPC Auto-Harvest ──────────────────────────────────────────────────────────

const AUTO_HARVEST_SCAN_RADIUS = 16;
const AUTO_HARVEST_SCAN_STEP = 2;
const AUTO_HARVEST_Y_RANGE = 3;
const FIELD_WORKER_UPGRADE_COST = 20;
const FIELD_WORKER_MAX_LEVEL = 5;
const FIELD_WORKER_CAP_PER_LEVEL = 50;

function getHarvestCap(village: VillageData): number {
  return FIELD_WORKER_CAP_PER_LEVEL + (village.fieldWorkerLevel ?? 0) * FIELD_WORKER_CAP_PER_LEVEL;
}

export function upgradeFieldWorkers(village: VillageData): boolean {
  const currentLevel = village.fieldWorkerLevel ?? 0;
  if (currentLevel >= FIELD_WORKER_MAX_LEVEL) {
    notifyPlayer(village.owner, "§cField Workers are already at maximum level (Lv5).");
    return false;
  }
  if (village.treasury < FIELD_WORKER_UPGRADE_COST) {
    notifyPlayer(village.owner, `§cNeed §6${FIELD_WORKER_UPGRADE_COST}💎§c emeralds to upgrade Field Workers.`);
    return false;
  }
  village.treasury -= FIELD_WORKER_UPGRADE_COST;
  village.fieldWorkerLevel = currentLevel + 1;
  saveVillage(village);
  const newCap = getHarvestCap(village);
  notifyPlayer(
    village.owner,
    `§aField Workers upgraded to §bLv${village.fieldWorkerLevel}§a in §b${village.name}§a! NPC farmers now harvest up to §f${newCap}§a crops per day.`
  );
  return true;
}

/**
 * Simulates NPC farmers harvesting ripe crops within the village bounds.
 * Harvested items go into fieldStorage — players must collect and deposit manually.
 * Only activates when at least one farmer is assigned.
 */
export function autoHarvestVillage(village: VillageData): void {
  if ((village.workers?.farmers ?? 0) === 0) return;

  const dim = world.getDimension(village.location.dimension);
  const cx = Math.floor(village.townHallLocation.x);
  const cz = Math.floor(village.townHallLocation.z);
  const baseY = Math.floor(village.townHallLocation.y);

  const harvestCap = getHarvestCap(village);
  let harvestCount = 0;
  let anyAdded = false;

  outer: for (
    let x = cx - AUTO_HARVEST_SCAN_RADIUS;
    x <= cx + AUTO_HARVEST_SCAN_RADIUS;
    x += AUTO_HARVEST_SCAN_STEP
  ) {
    for (
      let z = cz - AUTO_HARVEST_SCAN_RADIUS;
      z <= cz + AUTO_HARVEST_SCAN_RADIUS;
      z += AUTO_HARVEST_SCAN_STEP
    ) {
      if (harvestCount >= harvestCap) break outer;
      for (let y = baseY - AUTO_HARVEST_Y_RANGE; y <= baseY + AUTO_HARVEST_Y_RANGE; y++) {
        try {
          const block = dim.getBlock({ x, y, z });
          if (!block || !isCropBlock(block.typeId)) continue;

          const maxAge = CROP_MAX_AGES[block.typeId];
          const age = block.permutation.getState("age") as number | undefined;
          if (age === undefined || age < maxAge) continue;

          // Reset crop to seedling stage (replanted)
          block.setPermutation(block.permutation.withState("age", 0));

          const drops = CROP_DROPS[block.typeId] ?? [];
          for (const drop of drops) {
            const amount = drop.min + Math.floor(Math.random() * (drop.max - drop.min + 1));
            if (amount <= 0) continue;
            const isFood = (FOOD_ITEM_VALUES[drop.item] ?? -1) >= 0;
            if (isFood) {
              addToFieldStorage(village, drop.item, amount);
              anyAdded = true;
            }
          }
          harvestCount++;
        } catch {
          // Chunk not loaded — skip silently
        }
      }
    }
  }

  if (anyAdded) {
    saveVillage(village);
    const fieldTotal = getFieldStorageTotal(village);
    notifyPlayer(
      village.owner,
      `§7🌾 Farmers in §b${village.name}§7 harvested ${harvestCount} crop(s). Field storage: §f${fieldTotal}§7 food units. Collect at the granary.`
    );
  }
}

export function autoHarvestAllVillages(): void {
  for (const village of getAllVillages()) {
    autoHarvestVillage(village);
  }
}
