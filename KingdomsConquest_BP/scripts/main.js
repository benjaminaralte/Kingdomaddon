var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/storage/index.ts
var storage_exports = {};
__export(storage_exports, {
  deleteBanditCamp: () => deleteBanditCamp,
  deleteKingdom: () => deleteKingdom,
  deleteVillage: () => deleteVillage,
  generateId: () => generateId,
  getAllBanditCamps: () => getAllBanditCamps,
  getAllKingdoms: () => getAllKingdoms,
  getAllVillages: () => getAllVillages,
  getBanditCamp: () => getBanditCamp,
  getKingdom: () => getKingdom,
  getKingdomByKing: () => getKingdomByKing,
  getVillage: () => getVillage,
  getVillageByOwner: () => getVillageByOwner,
  saveBanditCamp: () => saveBanditCamp,
  saveKingdom: () => saveKingdom,
  saveVillage: () => saveVillage
});
import { world as world4 } from "@minecraft/server";
function getRegistry() {
  const raw = world4.getDynamicProperty(REGISTRY_KEY);
  if (!raw) return { villageIds: [], kingdomIds: [], banditCampIds: [], rebelCityIds: [] };
  try {
    const r = JSON.parse(raw);
    if (!r.rebelCityIds) r.rebelCityIds = [];
    return r;
  } catch {
    return { villageIds: [], kingdomIds: [], banditCampIds: [], rebelCityIds: [] };
  }
}
function saveRegistry(data) {
  world4.setDynamicProperty(REGISTRY_KEY, JSON.stringify(data));
}
function getVillage(id) {
  const raw = world4.getDynamicProperty(VILLAGE_PREFIX + id);
  if (!raw) return void 0;
  try {
    return JSON.parse(raw);
  } catch {
    return void 0;
  }
}
function saveVillage(data) {
  world4.setDynamicProperty(VILLAGE_PREFIX + data.id, JSON.stringify(data));
  const reg = getRegistry();
  if (!reg.villageIds.includes(data.id)) {
    reg.villageIds.push(data.id);
    saveRegistry(reg);
  }
}
function deleteVillage(id) {
  world4.setDynamicProperty(VILLAGE_PREFIX + id, void 0);
  const reg = getRegistry();
  reg.villageIds = reg.villageIds.filter((v) => v !== id);
  saveRegistry(reg);
}
var _vcTick = -1;
var _vcCache = null;
function getAllVillages() {
  const tick = getCurrentTick();
  if (tick === _vcTick && _vcCache !== null) return _vcCache;
  const reg = getRegistry();
  _vcCache = reg.villageIds.flatMap((id) => {
    const v = getVillage(id);
    return v ? [v] : [];
  });
  _vcTick = tick;
  return _vcCache;
}
function getVillageByOwner(playerName) {
  return getAllVillages().filter((v) => v.owner === playerName);
}
function getKingdom(id) {
  const raw = world4.getDynamicProperty(KINGDOM_PREFIX + id);
  if (!raw) return void 0;
  try {
    return JSON.parse(raw);
  } catch {
    return void 0;
  }
}
function saveKingdom(data) {
  world4.setDynamicProperty(KINGDOM_PREFIX + data.id, JSON.stringify(data));
  const reg = getRegistry();
  if (!reg.kingdomIds.includes(data.id)) {
    reg.kingdomIds.push(data.id);
    saveRegistry(reg);
  }
}
function deleteKingdom(id) {
  world4.setDynamicProperty(KINGDOM_PREFIX + id, void 0);
  const reg = getRegistry();
  reg.kingdomIds = reg.kingdomIds.filter((k) => k !== id);
  saveRegistry(reg);
}
function getAllKingdoms() {
  const reg = getRegistry();
  return reg.kingdomIds.flatMap((id) => {
    const k = getKingdom(id);
    return k ? [k] : [];
  });
}
function getKingdomByKing(playerName) {
  return getAllKingdoms().find((k) => k.king === playerName);
}
function getBanditCamp(id) {
  const raw = world4.getDynamicProperty(BANDIT_PREFIX + id);
  if (!raw) return void 0;
  try {
    return JSON.parse(raw);
  } catch {
    return void 0;
  }
}
function saveBanditCamp(data) {
  world4.setDynamicProperty(BANDIT_PREFIX + data.id, JSON.stringify(data));
  const reg = getRegistry();
  if (!reg.banditCampIds.includes(data.id)) {
    reg.banditCampIds.push(data.id);
    saveRegistry(reg);
  }
}
function deleteBanditCamp(id) {
  world4.setDynamicProperty(BANDIT_PREFIX + id, void 0);
  const reg = getRegistry();
  reg.banditCampIds = reg.banditCampIds.filter((b) => b !== id);
  saveRegistry(reg);
}
function getAllBanditCamps() {
  const reg = getRegistry();
  return reg.banditCampIds.flatMap((id) => {
    const b = getBanditCamp(id);
    return b ? [b] : [];
  });
}
function generateId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
// Define the strings explicitly right here:
var REGISTRY_KEY = "kc:registry";
var VILLAGE_PREFIX = "kc:village:";
var KINGDOM_PREFIX = "kc:kingdom:";
var BANDIT_PREFIX = "kc:bandit:";
var REBEL_PREFIX = "kc:rebel:";
var ACHIEVEMENT_PREFIX = "kc:achievements:";

function getRebelCity(id) {
  const raw = world4.getDynamicProperty(REBEL_PREFIX + id);
  if (!raw) return void 0;
  try { return JSON.parse(raw); } catch { return void 0; }
}
function saveRebelCity(data) {
  world4.setDynamicProperty(REBEL_PREFIX + data.id, JSON.stringify(data));
  const reg = getRegistry();
  if (!reg.rebelCityIds.includes(data.id)) {
    reg.rebelCityIds.push(data.id);
    saveRegistry(reg);
  }
}
function deleteRebelCity(id) {
  world4.setDynamicProperty(REBEL_PREFIX + id, void 0);
  const reg = getRegistry();
  reg.rebelCityIds = reg.rebelCityIds.filter((r) => r !== id);
  saveRegistry(reg);
}
function getAllRebelCities() {
  const reg = getRegistry();
  return reg.rebelCityIds.flatMap((id) => {
    const r = getRebelCity(id);
    return r ? [r] : [];
  });
}
function getPlayerAchievements(playerName) {
  const raw = world4.getDynamicProperty(ACHIEVEMENT_PREFIX + playerName);
  if (!raw) return { campsDestroyed: 0, citiesDefeated: 0 };
  try { return { campsDestroyed: 0, citiesDefeated: 0, ...JSON.parse(raw) }; } catch {
    return { campsDestroyed: 0, citiesDefeated: 0 };
  }
}
function savePlayerAchievements(playerName, data) {
  world4.setDynamicProperty(ACHIEVEMENT_PREFIX + playerName, JSON.stringify(data));
}
function awardCampDestroyed(playerName) {
  const ach = getPlayerAchievements(playerName);
  ach.campsDestroyed++;
  savePlayerAchievements(playerName, ach);
}
function awardCityDefeated(playerName) {
  const ach = getPlayerAchievements(playerName);
  ach.citiesDefeated++;
  savePlayerAchievements(playerName, ach);
}

var init_storage = __esm({
  "src/storage/index.ts"() {
    "use strict";
    // You can keep these here or remove them, as long as they are defined above!
    REGISTRY_KEY = "kc:registry";
    VILLAGE_PREFIX = "kc:village:";
    KINGDOM_PREFIX = "kc:kingdom:";
    BANDIT_PREFIX = "kc:bandit:";
    REBEL_PREFIX = "kc:rebel:";
    ACHIEVEMENT_PREFIX = "kc:achievements:";
  }
});


// src/main.ts
import { world as world16, system as system3, EntityInventoryComponent as EntityInventoryComponent8, ItemStack as ItemStack6 } from "@minecraft/server";
import { ActionFormData, ModalFormData, MessageFormData } from "@minecraft/server-ui";

// src/types/index.ts
var WEAPON_TIERS = ["wood", "stone", "iron", "gold", "diamond", "netherite"];
var ARMOR_TIERS = ["leather", "iron", "gold", "diamond", "netherite"];
var TROOP_WAGES = {
  cityGuards: 1,
  spearmen: 2,
  archers: 2,
  cavalry: 3,
  samurai: 4,
  heavyKnights: 4
};
var EMPTY_RESOURCE_STORAGE = {
  iron: 0,
  gold: 0,
  coal: 0,
  wood: 0,
  stone: 0,
  diamonds: 0
};
var MERCHANT_MATERIAL_MAP = {
  "minecraft:iron_ingot": "iron",
  "minecraft:gold_ingot": "gold",
  "minecraft:diamond": "diamonds",
  "minecraft:coal": "coal",
  "minecraft:oak_planks": "wood",
  "minecraft:cobblestone": "stone"
};
var RESOURCE_ITEM_IDS = {
  iron: "minecraft:iron_ingot",
  gold: "minecraft:gold_ingot",
  diamonds: "minecraft:diamond",
  coal: "minecraft:coal",
  wood: "minecraft:oak_planks",
  stone: "minecraft:cobblestone"
};
var ARMORY_WEAPON_ITEMS = new Set([
  "minecraft:wooden_sword", "minecraft:stone_sword", "minecraft:iron_sword",
  "minecraft:golden_sword", "minecraft:diamond_sword", "minecraft:netherite_sword",
  "minecraft:bow", "minecraft:crossbow", "minecraft:iron_axe", "minecraft:diamond_axe",
  "minecraft:netherite_axe", "minecraft:trident"
]);
var ARMORY_ARMOR_ITEMS = new Set([
  "minecraft:leather_helmet", "minecraft:leather_chestplate", "minecraft:leather_leggings", "minecraft:leather_boots",
  "minecraft:iron_helmet", "minecraft:iron_chestplate", "minecraft:iron_leggings", "minecraft:iron_boots",
  "minecraft:golden_helmet", "minecraft:golden_chestplate", "minecraft:golden_leggings", "minecraft:golden_boots",
  "minecraft:diamond_helmet", "minecraft:diamond_chestplate", "minecraft:diamond_leggings", "minecraft:diamond_boots",
  "minecraft:netherite_helmet", "minecraft:netherite_chestplate", "minecraft:netherite_leggings", "minecraft:netherite_boots"
]);
var ALL_ARMORY_ITEMS = new Set([...ARMORY_WEAPON_ITEMS, ...ARMORY_ARMOR_ITEMS]);
var FORGE_RECIPES = {
  iron: { weaponItem: "minecraft:iron_sword", armorPiece: "minecraft:iron_chestplate", materialKey: "iron", weaponCost: 2, armorCost: 8 },
  gold: { weaponItem: "minecraft:golden_sword", armorPiece: "minecraft:golden_chestplate", materialKey: "gold", weaponCost: 2, armorCost: 8 },
  diamond: { weaponItem: "minecraft:diamond_sword", armorPiece: "minecraft:diamond_chestplate", materialKey: "diamonds", weaponCost: 3, armorCost: 10 }
};
var RESOURCE_LABELS = {
  iron: "Iron",
  gold: "Gold",
  coal: "Coal",
  wood: "Wood",
  stone: "Stone",
  diamonds: "Diamonds"
};
var TICKS_PER_DAY = 24e3;
var CLAIM_COST_COBBLESTONE = 10;
var VILLAGE_CLAIM_RADIUS = 64;
var MIN_VILLAGERS_TO_CLAIM = 3;
var FOOD_PER_VILLAGER_PER_DAY = 1;
var FOOD_PER_SOLDIER_PER_DAY = 2;
var POPULATION_GROWTH_INTERVAL_DAYS = 2;
var WAGE_INTERVAL_DAYS = 3;
var MAX_GUARDS_PER_POLE = 3;
var WATCHTOWER_DETECTION_RADIUS = 48;
var BANDIT_MIGRATE_DISTANCE = 200;
var MAX_VILLAGE_POPULATION = 20;
var MAX_VILLAGE_SOLDIERS = 100;

// src/utils/tick.ts
import { world } from "@minecraft/server";
function getCurrentDay() {
  return Math.floor(world.getAbsoluteTime() / TICKS_PER_DAY);
}
function getCurrentTick() {
  return world.getAbsoluteTime();
}
function isNewDay(lastProcessedDay) {
  return getCurrentDay() > lastProcessedDay;
}
function daysSince(day) {
  return getCurrentDay() - day;
}
function distanceSq(a, b) {
  return (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2;
}
function distance(a, b) {
  return Math.sqrt(distanceSq(a, b));
}

// src/utils/notify.ts
import { world as world3 } from "@minecraft/server";

// src/systems/playerSettings.ts
import { world as world2 } from "@minecraft/server";
var DEFAULT_SETTINGS = {
  alertsEnabled: true
};
function settingsKey(playerName) {
  return `kc:settings:${playerName}`;
}
function getPlayerSettings(playerName) {
  const raw = world2.getDynamicProperty(settingsKey(playerName));
  if (!raw) return { ...DEFAULT_SETTINGS };
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}
function savePlayerSettings(playerName, settings) {
  world2.setDynamicProperty(settingsKey(playerName), JSON.stringify(settings));
}
function isAlertsEnabled(playerName) {
  return getPlayerSettings(playerName).alertsEnabled;
}
function toggleAlerts(playerName) {
  const settings = getPlayerSettings(playerName);
  settings.alertsEnabled = !settings.alertsEnabled;
  savePlayerSettings(playerName, settings);
  return settings.alertsEnabled;
}

// src/utils/notify.ts
function notifyPlayer(playerName, message) {
  const player = world3.getPlayers().find((p) => p.name === playerName);
  if (player) {
    player.sendMessage(`\xA76[Kingdoms]\xA7r ${message}`);
  }
}
function notifyAlert(playerName, message) {
  if (!isAlertsEnabled(playerName)) return;
  notifyPlayer(playerName, message);
}
function notifyKingdom(kingName, villageOwners, message) {
  const players = world3.getPlayers();
  const recipients = /* @__PURE__ */ new Set([kingName, ...villageOwners]);
  for (const player of players) {
    if (recipients.has(player.name)) {
      player.sendMessage(`\xA7d[Kingdom]\xA7r ${message}`);
    }
  }
}

// src/main.ts
init_storage();

// src/systems/harvest.ts
init_storage();
import { world as world5, ItemStack, EntityInventoryComponent } from "@minecraft/server";
var CROP_MAX_AGES = {
  "minecraft:wheat": 7,
  "minecraft:carrots": 7,
  "minecraft:potatoes": 7,
  "minecraft:beetroots": 3,
  "minecraft:nether_wart": 3
};
var CROP_DROPS = {
  "minecraft:wheat": [
    { item: "minecraft:wheat", min: 1, max: 1 },
    { item: "minecraft:wheat_seeds", min: 0, max: 3 }
  ],
  "minecraft:carrots": [{ item: "minecraft:carrot", min: 2, max: 5 }],
  "minecraft:potatoes": [{ item: "minecraft:potato", min: 2, max: 5 }],
  "minecraft:beetroots": [
    { item: "minecraft:beetroot", min: 1, max: 1 },
    { item: "minecraft:beetroot_seeds", min: 0, max: 3 }
  ],
  "minecraft:nether_wart": [{ item: "minecraft:nether_wart", min: 2, max: 4 }]
};
var FOOD_ITEM_VALUES = {
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
  "minecraft:nether_wart": 0
};
function isCropBlock(typeId) {
  return typeId in CROP_MAX_AGES;
}
function getGranaryFoodUnits(village) {
  return Object.entries(village.granaryItems).reduce((total, [item, count]) => {
    const value = FOOD_ITEM_VALUES[item] ?? 0;
    return total + value * count;
  }, 0);
}
function addToGranary(village, item, amount) {
  if (amount <= 0) return;
  village.granaryItems[item] = (village.granaryItems[item] ?? 0) + amount;
  saveVillage(village);
}
function removeFromGranary(village, item, amount) {
  const current = village.granaryItems[item] ?? 0;
  const removed = Math.min(current, amount);
  if (removed > 0) {
    village.granaryItems[item] = current - removed;
    if (village.granaryItems[item] === 0) delete village.granaryItems[item];
  }
  return removed;
}
function handleCropBreak(player, blockTypeId, blockAge, blockLocation, dimensionId) {
  const maxAge = CROP_MAX_AGES[blockTypeId];
  if (maxAge === void 0 || blockAge < maxAge) return false;
  const village = findVillageAt(blockLocation, dimensionId);
  if (!village) return false;
  const drops = CROP_DROPS[blockTypeId] ?? [];
  const harvestedItems = [];
  const playerItems = [];
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
  const inv = player.getComponent(EntityInventoryComponent.componentId);
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
    notifyPlayer(player.name, `\xA7a+${harvestedItems.map(({ item, amount }) => `${amount}x ${item.replace("minecraft:", "")}`).join(", ")} \u2192 \xA7b${village.name} Granary`);
  }
  return true;
}
function withdrawFromGranary(player, village, itemTypeId, amount) {
  const available = village.granaryItems[itemTypeId] ?? 0;
  if (available < amount) {
    notifyPlayer(player.name, `\xA7cNot enough ${itemTypeId.replace("minecraft:", "")} in granary (${available} available).`);
    return false;
  }
  const inv = player.getComponent(EntityInventoryComponent.componentId);
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
  const actuallyGiven = amount - remaining;
  if (actuallyGiven <= 0) {
    notifyPlayer(player.name, "\xA7cInventory full \u2014 nothing withdrawn.");
    return false;
  }
  removeFromGranary(village, itemTypeId, actuallyGiven);
  if (remaining > 0) {
    notifyPlayer(player.name, `\xA7eInventory partially full \u2014 withdrew ${actuallyGiven}x ${itemTypeId.replace("minecraft:", "")} from \xA7b${village.name}\xA7e granary.`);
    return false;
  }
  notifyPlayer(player.name, `\xA7aWithdrew ${actuallyGiven}x ${itemTypeId.replace("minecraft:", "")} from \xA7b${village.name}\xA7a granary.`);
  return true;
}
function depositPlayerItemsToGranary(player, village, itemTypeId, amount) {
  const inv = player.getComponent(EntityInventoryComponent.componentId);
  if (!inv?.container) return false;
  const container = inv.container;
  let available = 0;
  for (let i = 0; i < container.size; i++) {
    const slot = container.getItem(i);
    if (slot?.typeId === itemTypeId) available += slot.amount;
  }
  const toDeposit = Math.min(available, amount);
  if (toDeposit === 0) {
    notifyPlayer(player.name, `\xA7cNo ${itemTypeId.replace("minecraft:", "")} in your inventory.`);
    return false;
  }
  let remaining = toDeposit;
  for (let i = 0; i < container.size && remaining > 0; i++) {
    const slot = container.getItem(i);
    if (!slot || slot.typeId !== itemTypeId) continue;
    const take = Math.min(slot.amount, remaining);
    remaining -= take;
    if (take >= slot.amount) {
      container.setItem(i, void 0);
    } else {
      slot.amount -= take;
      container.setItem(i, slot);
    }
  }
  addToGranary(village, itemTypeId, toDeposit);
  notifyPlayer(player.name, `\xA7aDeposited ${toDeposit}x ${itemTypeId.replace("minecraft:", "")} into \xA7b${village.name}\xA7a granary.`);
  return true;
}
function consumeSoldierFoodFromGranary(village) {
  const currentDay = getCurrentDay();
  const daysSinceFeed = daysSince(village.lastSoldierFeedDay ?? 0);
  if (daysSinceFeed < 3) return;
  const soldiers = village.troops.cityGuards + village.troops.spearmen + village.troops.archers + village.troops.cavalry;
  if (soldiers === 0) {
    village.lastSoldierFeedDay = currentDay;
    saveVillage(village);
    return;
  }
  const foodNeeded = soldiers * 6;
  let foodPaid = 0;
  const items = Object.keys(village.granaryItems);
  for (const item of items) {
    if (foodPaid >= foodNeeded) break;
    const value = FOOD_ITEM_VALUES[item] ?? 0;
    if (value <= 0) continue;
    const unitsNeeded = Math.ceil((foodNeeded - foodPaid) / value);
    const removed = removeFromGranary(village, item, unitsNeeded);
    foodPaid += removed * value;
  }
  if (foodPaid < foodNeeded) {
    const shortfall = foodNeeded - foodPaid;
    const abstractFood = Math.ceil(shortfall);
    if (village.foodStorage >= abstractFood) {
      village.foodStorage -= abstractFood;
      foodPaid += abstractFood;
    } else {
      village.foodStorage = 0;
      notifyPlayer(
        village.owner,
        `\xA7c\u26A0 Soldiers in \xA7b${village.name}\xA7c couldn't be fully fed! Morale dropping.`
      );
      village.prosperity = Math.max(0, village.prosperity - 10);
    }
  } else {
    notifyPlayer(
      village.owner,
      `\xA7e${soldiers} soldiers in \xA7b${village.name}\xA7e consumed food from granary.`
    );
  }
  village.lastSoldierFeedDay = currentDay;
  saveVillage(village);
}
function processAllSoldierFood() {
  for (const village of getAllVillages()) {
    consumeSoldierFoodFromGranary(village);
  }
}
function getGranaryReport(village) {
  const items = Object.entries(village.granaryItems).filter(([, count]) => count > 0);
  if (items.length === 0) {
    return `\xA7b${village.name} Granary\xA7r
Empty \u2014 harvest crops within village range to fill it.

Abstract food reserve: ${village.foodStorage}\u{1F33E}`;
  }
  const lines = items.map(([item, count]) => {
    const foodVal = FOOD_ITEM_VALUES[item] ?? 0;
    return `${item.replace("minecraft:", "")} \xD7${count} (${foodVal * count} food units)`;
  });
  const totalFood = getGranaryFoodUnits(village);
  return [
    `\xA7b${village.name} Granary\xA7r`,
    ...lines,
    ``,
    `Total: ${totalFood} food units`,
    `Abstract reserve: ${village.foodStorage}\u{1F33E}`
  ].join("\n");
}
function findVillageAt(location, dimensionId) {
  return getAllVillages().find(
    (v) => v.location.dimension === dimensionId && Math.abs(v.location.x - location.x) < VILLAGE_CLAIM_RADIUS && Math.abs(v.location.z - location.z) < VILLAGE_CLAIM_RADIUS
  );
}
function addToFieldStorage(village, item, amount) {
  if (amount <= 0) return;
  village.fieldStorage ?? (village.fieldStorage = {});
  village.fieldStorage[item] = (village.fieldStorage[item] ?? 0) + amount;
}
function getFieldStorageTotal(village) {
  if (!village.fieldStorage) return 0;
  return Object.entries(village.fieldStorage).reduce((total, [item, count]) => {
    return total + (FOOD_ITEM_VALUES[item] ?? 0) * count;
  }, 0);
}
function getFieldStorageReport(village) {
  const fs = village.fieldStorage ?? {};
  const items = Object.entries(fs).filter(([, count]) => count > 0);
  if (items.length === 0) return `\xA7b${village.name} Field Storage\xA7r
Empty \u2014 NPC farmers will fill this each day.`;
  const lines = items.map(([item, count]) => {
    const val = FOOD_ITEM_VALUES[item] ?? 0;
    return `${item.replace("minecraft:", "")} \xD7${count} (${val * count} food units)`;
  });
  const total = getFieldStorageTotal(village);
  return [`\xA7b${village.name} Field Storage\xA7r`, ...lines, ``, `Total: ${total} food units`].join("\n");
}
function collectFieldStorage(player, village) {
  const fs = village.fieldStorage ?? {};
  const items = Object.entries(fs).filter(([, count]) => count > 0);
  if (items.length === 0) {
    notifyPlayer(player.name, `\xA7eField storage in \xA7b${village.name}\xA7e is empty. Wait for farmers to harvest.`);
    return 0;
  }
  const inv = player.getComponent(EntityInventoryComponent.componentId);
  if (!inv?.container) return 0;
  const container = inv.container;
  let transferred = 0;
  const leftover = {};
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
  const leftoverNote = Object.keys(leftover).length > 0 ? " \xA7e(inventory full \u2014 some items left behind)" : "";
  notifyPlayer(
    player.name,
    `\xA7a\u{1F33E} Collected field harvest from \xA7b${village.name}\xA7a! Bring items to the granary to deposit.${leftoverNote}`
  );
  if (foodUnits > 0) {
    notifyPlayer(player.name, `\xA77${foodUnits} food units still remain in field storage.`);
  }
  return transferred;
}
var AUTO_HARVEST_SCAN_RADIUS = 16;
var AUTO_HARVEST_SCAN_STEP = 2;
var AUTO_HARVEST_Y_RANGE = 3;
var FIELD_WORKER_UPGRADE_COST = 20;
var FIELD_WORKER_MAX_LEVEL = 5;
var FIELD_WORKER_CAP_PER_LEVEL = 50;
function getHarvestCap(village) {
  return FIELD_WORKER_CAP_PER_LEVEL + (village.fieldWorkerLevel ?? 0) * FIELD_WORKER_CAP_PER_LEVEL;
}
function upgradeFieldWorkers(village) {
  const currentLevel = village.fieldWorkerLevel ?? 0;
  if (currentLevel >= FIELD_WORKER_MAX_LEVEL) {
    notifyPlayer(village.owner, "\xA7cField Workers are already at maximum level (Lv5).");
    return false;
  }
  if (village.treasury < FIELD_WORKER_UPGRADE_COST) {
    notifyPlayer(village.owner, `\xA7cNeed \xA76${FIELD_WORKER_UPGRADE_COST}\u{1F48E}\xA7c emeralds to upgrade Field Workers.`);
    return false;
  }
  village.treasury -= FIELD_WORKER_UPGRADE_COST;
  village.fieldWorkerLevel = currentLevel + 1;
  saveVillage(village);
  const newCap = getHarvestCap(village);
  notifyPlayer(
    village.owner,
    `\xA7aField Workers upgraded to \xA7bLv${village.fieldWorkerLevel}\xA7a in \xA7b${village.name}\xA7a! NPC farmers now harvest up to \xA7f${newCap}\xA7a crops per day.`
  );
  return true;
}
function autoHarvestVillage(village) {
  if ((village.workers?.farmers ?? 0) === 0) return;
  const dim = world5.getDimension(village.location.dimension);
  const cx = Math.floor(village.townHallLocation.x);
  const cz = Math.floor(village.townHallLocation.z);
  const baseY = Math.floor(village.townHallLocation.y);
  const harvestCap = getHarvestCap(village);
  let harvestCount = 0;
  let anyAdded = false;
  outer: for (let x = cx - AUTO_HARVEST_SCAN_RADIUS; x <= cx + AUTO_HARVEST_SCAN_RADIUS; x += AUTO_HARVEST_SCAN_STEP) {
    for (let z = cz - AUTO_HARVEST_SCAN_RADIUS; z <= cz + AUTO_HARVEST_SCAN_RADIUS; z += AUTO_HARVEST_SCAN_STEP) {
      if (harvestCount >= harvestCap) break outer;
      for (let y = baseY - AUTO_HARVEST_Y_RANGE; y <= baseY + AUTO_HARVEST_Y_RANGE; y++) {
        try {
          const block = dim.getBlock({ x, y, z });
          if (!block || !isCropBlock(block.typeId)) continue;
          const maxAge = CROP_MAX_AGES[block.typeId];
          const age = block.permutation.getState("age");
          if (age === void 0 || age < maxAge) continue;
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
        }
      }
    }
  }
  if (anyAdded) {
    saveVillage(village);
    const fieldTotal = getFieldStorageTotal(village);
    notifyPlayer(
      village.owner,
      `\xA77\u{1F33E} Farmers in \xA7b${village.name}\xA77 harvested ${harvestCount} crop(s). Field storage: \xA7f${fieldTotal}\xA77 food units. Collect at the granary.`
    );
  }
}
function autoHarvestAllVillages() {
  for (const village of getAllVillages()) {
    autoHarvestVillage(village);
  }
}

// src/systems/commands.ts
init_storage();
import { system as system2 } from "@minecraft/server";

// src/systems/village.ts
import { world as world6, EntityInventoryComponent as EntityInventoryComponent2 } from "@minecraft/server";
init_storage();

// src/systems/kingdom.ts
init_storage();
function createKingdom(king, name) {
  const existing = getKingdomByKing(king);
  if (existing) return existing;
  const kingdom = {
    id: generateId(),
    name,
    king,
    villageIds: [],
    wars: [],
    alliances: []
  };
  saveKingdom(kingdom);
  notifyPlayer(king, `Your kingdom "\xA7b${name}\xA7r" has been founded!`);
  return kingdom;
}
function addVillageToKingdom(kingdomId, villageId) {
  const kingdom = getKingdom(kingdomId);
  if (!kingdom) return;
  if (!kingdom.villageIds.includes(villageId)) {
    kingdom.villageIds.push(villageId);
    saveKingdom(kingdom);
  }
}
function removeVillageFromKingdom(kingdomId, villageId) {
  const kingdom = getKingdom(kingdomId);
  if (!kingdom) return;
  kingdom.villageIds = kingdom.villageIds.filter((id) => id !== villageId);
  if (kingdom.villageIds.length === 0) {
    collapseKingdom(kingdomId);
  } else {
    saveKingdom(kingdom);
  }
}
function collapseKingdom(kingdomId) {
  const kingdom = getKingdom(kingdomId);
  if (!kingdom) return;
  notifyPlayer(kingdom.king, `\xA7cYour kingdom "${kingdom.name}" has collapsed!`);
  notifyAllKingdomMembers(kingdom, `\xA7cThe kingdom of "${kingdom.name}" has fallen!`);
  for (const vid of kingdom.villageIds) {
    const village = getVillage(vid);
    if (village) {
      village.kingdomId = "";
      village.owner = "";
      saveVillage(village);
    }
  }
  deleteKingdom(kingdomId);
}
function declareWar(attackerId, defenderId) {
  const attacker = getKingdom(attackerId);
  const defender = getKingdom(defenderId);
  if (!attacker || !defender) return;
  if (!attacker.wars.includes(defenderId)) attacker.wars.push(defenderId);
  if (!defender.wars.includes(attackerId)) defender.wars.push(attackerId);
  attacker.alliances = attacker.alliances.filter((id) => id !== defenderId);
  defender.alliances = defender.alliances.filter((id) => id !== attackerId);
  saveKingdom(attacker);
  saveKingdom(defender);
  notifyPlayer(attacker.king, `\xA7cWar declared against "${defender.name}"!`);
  notifyPlayer(defender.king, `\xA7c"${attacker.name}" has declared war on your kingdom!`);
}
function makePeace(kingdomAId, kingdomBId) {
  const a = getKingdom(kingdomAId);
  const b = getKingdom(kingdomBId);
  if (!a || !b) return;
  a.wars = a.wars.filter((id) => id !== kingdomBId);
  b.wars = b.wars.filter((id) => id !== kingdomAId);
  saveKingdom(a);
  saveKingdom(b);
  notifyPlayer(a.king, `\xA7aPeace made with "${b.name}".`);
  notifyPlayer(b.king, `\xA7aPeace made with "${a.name}".`);
}
function formAlliance(kingdomAId, kingdomBId) {
  const a = getKingdom(kingdomAId);
  const b = getKingdom(kingdomBId);
  if (!a || !b) return;
  if (a.wars.includes(kingdomBId) || b.wars.includes(kingdomAId)) return;
  if (!a.alliances.includes(kingdomBId)) a.alliances.push(kingdomBId);
  if (!b.alliances.includes(kingdomAId)) b.alliances.push(kingdomAId);
  saveKingdom(a);
  saveKingdom(b);
  notifyPlayer(a.king, `\xA7aAlliance formed with "${b.name}"!`);
  notifyPlayer(b.king, `\xA7aAlliance formed with "${a.name}"!`);
}
function areAtWar(kingdomAId, kingdomBId) {
  const a = getKingdom(kingdomAId);
  return a ? a.wars.includes(kingdomBId) : false;
}
function getKingdomStrength(kingdomId) {
  const kingdom = getKingdom(kingdomId);
  if (!kingdom) return 0;
  let total = 0;
  for (const vid of kingdom.villageIds) {
    const village = getVillage(vid);
    if (village) {
      total += village.troops.cityGuards * 1 + village.troops.spearmen * 2 + village.troops.archers * 2 + village.troops.cavalry * 3;
    }
  }
  return total;
}
function getKingdomSummary(kingdomId) {
  const kingdom = getKingdom(kingdomId);
  if (!kingdom) return "Unknown kingdom";
  let totalPop = 0;
  let totalTreasury = 0;
  let totalFood = 0;
  for (const vid of kingdom.villageIds) {
    const v = getVillage(vid);
    if (v) {
      totalPop += v.population;
      totalTreasury += v.treasury;
      totalFood += v.foodStorage;
    }
  }
  const strength = getKingdomStrength(kingdomId);
  return [
    `\xA7b${kingdom.name}\xA7r (King: ${kingdom.king})`,
    `Villages: ${kingdom.villageIds.length}  Population: ${totalPop}`,
    `Treasury: ${totalTreasury}\u{1F48E}  Food: ${totalFood}\u{1F33E}`,
    `Military: ${strength} strength`,
    `Wars: ${kingdom.wars.length}  Alliances: ${kingdom.alliances.length}`
  ].join("\n");
}
function notifyAllKingdomMembers(kingdom, message) {
  const owners = [];
  for (const vid of kingdom.villageIds) {
    const v = getVillage(vid);
    if (v && v.owner) owners.push(v.owner);
  }
  notifyKingdom(kingdom.king, owners, message);
}
function getKingdomOf(playerName) {
  return getAllKingdoms().find(
    (k) => k.king === playerName || k.villageIds.some((vid) => {
      const v = getVillage(vid);
      return v?.owner === playerName;
    })
  );
}

// src/systems/village.ts
function claimVillage(player, townHallBlock, kingdomName) {
  const loc = townHallBlock.location;
  const dim = player.dimension;
  const existing = getAllVillages().find(
    (v) => v.location.dimension === dim.id && Math.abs(v.location.x - loc.x) < VILLAGE_CLAIM_RADIUS && Math.abs(v.location.z - loc.z) < VILLAGE_CLAIM_RADIUS
  );
  if (existing && existing.owner) {
    notifyPlayer(player.name, `\xA7cThis territory already belongs to "${existing.name}".`);
    return false;
  }
  const query = {
    type: "minecraft:villager",
    location: loc,
    maxDistance: VILLAGE_CLAIM_RADIUS
  };
  const villagers = dim.getEntities(query);
  if (villagers.length < MIN_VILLAGERS_TO_CLAIM) {
    notifyPlayer(
      player.name,
      `\xA7cNeed at least ${MIN_VILLAGERS_TO_CLAIM} villagers within ${VILLAGE_CLAIM_RADIUS} blocks to claim.`
    );
    return false;
  }
  const inv = player.getComponent(EntityInventoryComponent2.componentId);
  if (!inv) return false;
  const container = inv.container;
  if (!container) return false;
  let cobbleFound = 0;
  const slotsToConsume = [];
  for (let i = 0; i < container.size; i++) {
    const item = container.getItem(i);
    if (item && item.typeId === "minecraft:cobblestone") {
      const needed = CLAIM_COST_COBBLESTONE - cobbleFound;
      const take = Math.min(needed, item.amount);
      slotsToConsume.push({ slot: i, amount: take });
      cobbleFound += take;
      if (cobbleFound >= CLAIM_COST_COBBLESTONE) break;
    }
  }
  if (cobbleFound < CLAIM_COST_COBBLESTONE) {
    notifyPlayer(player.name, `\xA7cNeed ${CLAIM_COST_COBBLESTONE} cobblestone to claim a village. (You have ${cobbleFound})`);
    return false;
  }
  for (const { slot, amount } of slotsToConsume) {
    const item = container.getItem(slot);
    if (!item) continue;
    if (item.amount <= amount) {
      container.setItem(slot, void 0);
    } else {
      item.amount -= amount;
      container.setItem(slot, item);
    }
  }
  let kingdom = getKingdomOf2(player.name);
  if (!kingdom) {
    kingdom = createKingdom(player.name, kingdomName);
  }
  const villageName = existing?.name ?? `${player.name}'s Village ${Math.floor(Math.random() * 1e3)}`;
  const villageId = existing?.id ?? generateId();
  const village = {
    id: villageId,
    name: villageName,
    owner: player.name,
    kingdomId: kingdom.id,
    location: { x: loc.x, y: loc.y, z: loc.z, dimension: dim.id },
    townHallLocation: { x: loc.x, y: loc.y, z: loc.z },
    population: villagers.length,
    housingCapacity: villagers.length + 4,
    treasury: 0,
    foodStorage: 20,
    marketLevel: 1,
    barracksLevel: 1,
    prosperity: 50,
    tradeCartCount: 0,
    troops: { cityGuards: 0, spearmen: 0, archers: 0, cavalry: 0, samurai: 0, heavyKnights: 0 },
    missedWages: 0,
    lastDayProcessed: getCurrentDay(),
    lastWageDay: getCurrentDay(),
    foodShortageStage: 0,
    guardPoles: [],
    tradePoles: [],
    workers: { farmers: Math.max(1, Math.floor(villagers.length * 0.5)), workers: 0 },
    blacksmith: { weaponTier: 0, armorTier: 0 },
    activeMerchants: [],
    activeCarts: [],
    granaryItems: {},
    lastSoldierFeedDay: getCurrentDay(),
    builtHousingUnits: 0,
    hasTradeStation: false,
    resourceStorage: { ...EMPTY_RESOURCE_STORAGE },
    trainingQueue: []
  };
  saveVillage(village);
  addVillageToKingdom(kingdom.id, villageId);
  notifyPlayer(
    player.name,
    `\xA7aVillage "\xA7b${villageName}\xA7a" claimed for kingdom "\xA7b${kingdom.name}\xA7a"!`
  );
  return true;
}
function renameVillage(playerName, villageId, newName) {
  const village = getVillage(villageId);
  if (!village || village.owner !== playerName) return false;
  village.name = newName;
  saveVillage(village);
  notifyPlayer(playerName, `Village renamed to "\xA7b${newName}\xA7r".`);
  return true;
}
function getVillageSummary(village) {
  const t = village.troops;
  const totalSoldiers = t.cityGuards + t.spearmen + t.archers + t.cavalry + (t.samurai ?? 0) + (t.heavyKnights ?? 0);
  const stages = ["\u2714 None", "\u26A0 Stage 1", "\u26A0 Stage 2", "\xA7c Stage 3", "\xA7c Stage 4"];
  const rs = village.resourceStorage ?? { iron: 0, gold: 0, coal: 0, wood: 0, stone: 0, diamonds: 0 };
  const hasStation = village.hasTradeStation ? "\xA7a\u2714 Active" : "\xA7c\u2718 None";
  return [
    `\xA7b${village.name}\xA7r (${village.owner})`,
    `Pop: ${village.population}/${village.housingCapacity}  Prosperity: ${village.prosperity}`,
    `Treasury: ${village.treasury}\u{1F48E}  Food: ${village.foodStorage}\u{1F33E}`,
    `Market Lv${village.marketLevel}  Barracks Lv${village.barracksLevel}`,
    `Troops: ${totalSoldiers} (G:${t.cityGuards} Sp:${t.spearmen} Ar:${t.archers} Ca:${t.cavalry} Sa:${t.samurai ?? 0} HK:${t.heavyKnights ?? 0})`,
    `Food Shortage: ${stages[village.foodShortageStage] ?? "Unknown"}`,
    `Weapon Tier: ${village.blacksmith.weaponTier}  Armor Tier: ${village.blacksmith.armorTier}`,
    `Trade Station: ${hasStation}`,
    `Resources: Fe:${rs.iron} Au:${rs.gold} C:${rs.coal} W:${rs.wood} St:${rs.stone} Di:${rs.diamonds}`
  ].join("\n");
}
function updateHousingCapacity(villageId) {
  const village = getVillage(villageId);
  if (!village) return;
  const dim = world6.getDimension(village.location.dimension);
  const loc = village.townHallLocation;
  let beds = 0;
  for (let dx = -VILLAGE_CLAIM_RADIUS; dx <= VILLAGE_CLAIM_RADIUS; dx += 4) {
    for (let dz = -VILLAGE_CLAIM_RADIUS; dz <= VILLAGE_CLAIM_RADIUS; dz += 4) {
      for (let dy = -5; dy <= 10; dy++) {
        try {
          const block = dim.getBlock({ x: loc.x + dx, y: loc.y + dy, z: loc.z + dz });
          if (block && block.typeId.includes("bed")) beds++;
        } catch {
        }
      }
    }
  }
  village.housingCapacity = Math.max(beds, village.population);
  saveVillage(village);
}
function getKingdomOf2(playerName) {
  return getAllKingdoms().find((k) => k.king === playerName);
}

// src/systems/military.ts
init_storage();

// src/systems/bandit.ts
import { world as world7, system } from "@minecraft/server";
init_storage();
var MAX_WORLD_CAMPS = 20;
var MIN_WORLD_SPAWN_DIST = 150;
var MAX_WORLD_SPAWN_DIST = 500;
var RAID_FOOD_STEAL_PER_STRENGTH = 3;
var MAX_RAID_FOOD_PCT = 0.15;
var MAX_ENTITIES_PER_CAMP = 15;
function spawnBanditDeserters(village, count) {
  const loc = village.location;
  const angle = Math.random() * Math.PI * 2;
  const campX = loc.x + Math.cos(angle) * BANDIT_MIGRATE_DISTANCE;
  const campZ = loc.z + Math.sin(angle) * BANDIT_MIGRATE_DISTANCE;
  let nearestCamp;
  let nearestDist = 80;
  for (const camp of getAllBanditCamps()) {
    if (camp.location.dimension !== loc.dimension) continue;
    const d = distance(camp.location, { x: campX, y: loc.y, z: campZ });
    if (d < nearestDist) {
      nearestDist = d;
      nearestCamp = camp;
    }
  }
  if (nearestCamp) {
    nearestCamp.strength += count;
    saveBanditCamp(nearestCamp);
    trySpawnEntities(nearestCamp);
  } else {
    const camp = {
      id: generateId(),
      location: { x: campX, y: loc.y, z: campZ, dimension: loc.dimension },
      strength: count,
      originKingdomId: village.kingdomId,
      entityIds: []
    };
    saveBanditCamp(camp);
    trySpawnEntities(camp);
    system.run(() => { try { buildBanditCampStructure(world7.getDimension(camp.location.dimension), camp.location); } catch {} });
  }
}
function tryWorldSpawn() {
  const camps = getAllBanditCamps();
  if (camps.length >= MAX_WORLD_CAMPS) return;
  const villages = getAllVillages();
  if (villages.length === 0) return;
  const anchor = villages[Math.floor(Math.random() * villages.length)];
  const angle = Math.random() * Math.PI * 2;
  const dist = MIN_WORLD_SPAWN_DIST + Math.random() * (MAX_WORLD_SPAWN_DIST - MIN_WORLD_SPAWN_DIST);
  const campX = anchor.location.x + Math.cos(angle) * dist;
  const campZ = anchor.location.z + Math.sin(angle) * dist;
  for (const v of villages) {
    if (distance(v.location, { x: campX, y: v.location.y, z: campZ }) < MIN_WORLD_SPAWN_DIST) return;
  }
  for (const c of camps) {
    if (distance(c.location, { x: campX, y: c.location.y, z: campZ }) < 150) return;
  }
  const strength = 3 + Math.floor(Math.random() * 5);
  const camp = {
    id: generateId(),
    location: { x: campX, y: anchor.location.y, z: campZ, dimension: anchor.location.dimension },
    strength,
    originKingdomId: "",
    entityIds: []
  };
  saveBanditCamp(camp);
  trySpawnEntities(camp);
  system.run(() => { try { buildBanditCampStructure(world7.getDimension(camp.location.dimension), camp.location); } catch {} });
}
function trySpawnEntities(camp) {
  const dim = world7.getDimension(camp.location.dimension);
  const liveEntities = getLiveEntities(dim, camp);
  const target = Math.min(camp.strength, MAX_ENTITIES_PER_CAMP);
  const toSpawn = target - liveEntities.length;
  for (let i = 0; i < toSpawn; i++) {
    try {
      const entity = dim.spawnEntity("kingdoms:bandit", {
        x: camp.location.x + (Math.random() * 10 - 5),
        y: camp.location.y,
        z: camp.location.z + (Math.random() * 10 - 5)
      });
      entity.setDynamicProperty("kc:camp_id", camp.id);
      if (!camp.entityIds.includes(entity.id)) {
        camp.entityIds.push(entity.id);
      }
    } catch {
    }
  }
  saveBanditCamp(camp);
}
function getLiveEntities(dim, camp) {
  const all = dim.getEntities({ type: "kingdoms:bandit" });
  const alive = all.filter((e) => camp.entityIds.includes(e.id));
  return alive;
}
function cleanDeadEntities(camp) {
  try {
    const dim = world7.getDimension(camp.location.dimension);
    const liveIds = new Set(
      dim.getEntities({ type: "kingdoms:bandit" }).map((e) => e.id)
    );
    const before = camp.entityIds.length;
    camp.entityIds = camp.entityIds.filter((id) => liveIds.has(id));
    const killed = before - camp.entityIds.length;
    if (killed > 0) {
      camp.strength = Math.max(0, camp.strength - killed);
    }
    saveBanditCamp(camp);
  } catch {
  }
}
function tickBandits() {
  tryWorldSpawn();
  tryWorldSpawnRebelCity();
  const camps = getAllBanditCamps();
  for (const camp of camps) {
    cleanDeadEntities(camp);
    const fresh = getBanditCamp(camp.id);
    if (!fresh) continue;
    if (fresh.strength <= 0) {
      const killer = findNearestPlayer(fresh.location, 128);
      disbandBanditCamp(fresh.id, killer?.name);
      continue;
    }
    trySpawnEntities(fresh);
    if (Math.random() < 0.3) {
      raidNearbyTargets(fresh);
    }
  }
  tickRebelCities();
}
function findNearestPlayer(loc, maxDist) {
  let nearest = null;
  let nearestDist = maxDist;
  for (const p of world7.getAllPlayers()) {
    if (p.dimension.id !== loc.dimension) continue;
    const d = distance(p.location, loc);
    if (d < nearestDist) { nearestDist = d; nearest = p; }
  }
  return nearest;
}
function raidNearbyTargets(camp) {
  const villages = getAllVillages();
  let target;
  let targetDist = 300;
  for (const village of villages) {
    if (village.location.dimension !== camp.location.dimension) continue;
    const d = distance(village.location, camp.location);
    if (d < targetDist) {
      const defense = getTotalVillageDefense(village);
      if (camp.strength > defense * 0.4 || d < 100) {
        targetDist = d;
        target = village;
      }
    }
  }
  if (!target) return;
  const dim = world7.getDimension(camp.location.dimension);
  const merchants = dim.getEntities({ type: "kingdoms:merchant" });
  for (const merchant of merchants) {
    if (distance(merchant.location, camp.location) < 150) {
      notifyAlert(target.owner, `\xA7c\u2694 Bandits are attacking a merchant near \xA7b${target.name}\xA7c!`);
      merchant.applyDamage(12);
      break;
    }
  }
  const stolen = Math.min(
    Math.floor(camp.strength * RAID_FOOD_STEAL_PER_STRENGTH),
    Math.floor(target.foodStorage * MAX_RAID_FOOD_PCT),
    50
  );
  if (stolen > 0) {
    target.foodStorage = Math.max(0, target.foodStorage - stolen);
    camp.strength = Math.min(camp.strength + 1, 30);
    saveBanditCamp(camp);
    system.run(() => {
      try {
        void Promise.resolve().then(() => (init_storage(), storage_exports)).then(({ saveVillage: saveVillage2 }) => {
          saveVillage2(target);
        });
      } catch {
      }
    });
    notifyAlert(
      target.owner,
      `\xA7c\u{1F3F4} Bandits raided \xA7b${target.name}\xA7c! They stole \xA7e${stolen}\u{1F33E}\xA7c food. (Camp strength: ${camp.strength})`
    );
  } else if (stolen === 0 && target.foodStorage === 0) {
    const emeraldStolen = Math.min(Math.floor(camp.strength * 0.5), target.treasury, 10);
    if (emeraldStolen > 0) {
      target.treasury -= emeraldStolen;
      system.run(() => {
        void Promise.resolve().then(() => (init_storage(), storage_exports)).then(({ saveVillage: saveVillage2 }) => {
          saveVillage2(target);
        });
      });
      notifyAlert(
        target.owner,
        `\xA7c\u{1F3F4} Bandits raided \xA7b${target.name}\xA7c! No food \u2014 they looted \xA76${emeraldStolen}\u{1F48E}\xA7c from the treasury.`
      );
    }
  }
}
function getTotalVillageDefense(village) {
  return village.troops.cityGuards * 1 + village.troops.spearmen * 2 + village.troops.archers * 2 + village.troops.cavalry * 3;
}
function disbandBanditCamp(campId, killerPlayerName) {
  const camp = getBanditCamp(campId);
  if (!camp) return;
  try {
    const dim = world7.getDimension(camp.location.dimension);
    const live = getLiveEntities(dim, camp);
    for (const entity of live) {
      try { entity.kill(); } catch {}
    }
  } catch {}
  deleteBanditCamp(campId);
  if (killerPlayerName) {
    awardCampDestroyed(killerPlayerName);
    const ach = getPlayerAchievements(killerPlayerName);
    notifyPlayer(killerPlayerName, `\xA7a\u2605 ACHIEVEMENT: Bandit camp destroyed! (Total: \xA7e${ach.campsDestroyed}\xA7a camps)`);
  }
}
function getBanditCampSummary() {
  const camps = getAllBanditCamps();
  if (camps.length === 0) return "\xA77No active bandit camps.";
  return camps.map(
    (c, i) => `\xA7c\u2694 Camp #${i + 1}\xA7r  Strength: \xA7e${c.strength}\xA7r  Entities: ${c.entityIds.length}  Pos: \xA77${Math.round(c.location.x)},${Math.round(c.location.z)}`
  ).join("\n");
}

// ── Rebel City / Bandit Stronghold ──────────────────────────────────────────
var MAX_REBEL_CITIES = 5;
var REBEL_CITY_MIN_STRENGTH = 20;
var REBEL_CITY_MAX_STRENGTH = 40;
var REBEL_CITY_MAX_ENTITIES = 30;
var REBEL_WARN_RADIUS = 150;
var lastRebelWarn = new Map();

function buildRebelCityStructure(dim, loc) {
  const x = Math.floor(loc.x);
  const z = Math.floor(loc.z);
  const y = Math.floor(loc.y);
  try {
    dim.runCommand(`fill ${x - 12} ${y + 1} ${z - 12} ${x + 12} ${y + 8} ${z + 12} minecraft:air replace minecraft:air`);
    dim.runCommand(`fill ${x - 12} ${y} ${z - 12} ${x + 12} ${y} ${z + 12} minecraft:cobblestone`);
    // Outer walls
    dim.runCommand(`fill ${x - 12} ${y + 1} ${z - 12} ${x + 12} ${y + 5} ${z - 12} minecraft:stone_bricks`);
    dim.runCommand(`fill ${x - 12} ${y + 1} ${z + 12} ${x + 12} ${y + 5} ${z + 12} minecraft:stone_bricks`);
    dim.runCommand(`fill ${x - 12} ${y + 1} ${z - 12} ${x - 12} ${y + 5} ${z + 12} minecraft:stone_bricks`);
    dim.runCommand(`fill ${x + 12} ${y + 1} ${z - 12} ${x + 12} ${y + 5} ${z + 12} minecraft:stone_bricks`);
    // Corner towers
    for (const [ox, oz] of [[-12,-12],[12,-12],[-12,12],[12,12]]) {
      dim.runCommand(`fill ${x+ox-2} ${y+1} ${z+oz-2} ${x+ox+2} ${y+8} ${z+oz+2} minecraft:stone_bricks hollow`);
      dim.runCommand(`setblock ${x+ox} ${y+9} ${z+oz} minecraft:torch`);
    }
    // Gates (openings in walls)
    dim.runCommand(`fill ${x - 2} ${y + 1} ${z - 13} ${x + 2} ${y + 4} ${z - 11} minecraft:air`);
    dim.runCommand(`fill ${x - 2} ${y + 1} ${z + 11} ${x + 2} ${y + 4} ${z + 13} minecraft:air`);
    // Central keep
    dim.runCommand(`fill ${x - 4} ${y + 1} ${z - 4} ${x + 4} ${y + 7} ${z + 4} minecraft:stone_bricks hollow`);
    dim.runCommand(`fill ${x - 3} ${y + 2} ${z - 3} ${x + 3} ${y + 6} ${z + 3} minecraft:air`);
    dim.runCommand(`setblock ${x} ${y + 8} ${z} minecraft:nether_star`);
    // Campfires and tents
    dim.runCommand(`setblock ${x - 6} ${y + 1} ${z} minecraft:campfire`);
    dim.runCommand(`setblock ${x + 6} ${y + 1} ${z} minecraft:campfire`);
    dim.runCommand(`setblock ${x} ${y + 1} ${z - 6} minecraft:campfire`);
    dim.runCommand(`setblock ${x} ${y + 1} ${z + 6} minecraft:campfire`);
    // Loot chests
    dim.runCommand(`setblock ${x - 2} ${y + 1} ${z - 2} minecraft:chest`);
    dim.runCommand(`setblock ${x + 2} ${y + 1} ${z - 2} minecraft:chest`);
    dim.runCommand(`setblock ${x - 2} ${y + 1} ${z + 2} minecraft:chest`);
    dim.runCommand(`setblock ${x + 2} ${y + 1} ${z + 2} minecraft:chest`);
    // Barrels and crafting
    dim.runCommand(`setblock ${x - 8} ${y + 1} ${z - 8} minecraft:barrel`);
    dim.runCommand(`setblock ${x + 8} ${y + 1} ${z - 8} minecraft:barrel`);
    dim.runCommand(`setblock ${x - 8} ${y + 1} ${z + 8} minecraft:barrel`);
    dim.runCommand(`setblock ${x + 8} ${y + 1} ${z + 8} minecraft:barrel`);
    dim.runCommand(`setblock ${x} ${y + 1} ${z + 2} minecraft:crafting_table`);
    // Paths inside
    dim.runCommand(`fill ${x - 11} ${y + 1} ${z} ${x + 11} ${y + 1} ${z} minecraft:gravel`);
    dim.runCommand(`fill ${x} ${y + 1} ${z - 11} ${x} ${y + 1} ${z + 11} minecraft:gravel`);
    // Torches on walls
    dim.runCommand(`setblock ${x - 6} ${y + 6} ${z - 12} minecraft:torch`);
    dim.runCommand(`setblock ${x + 6} ${y + 6} ${z - 12} minecraft:torch`);
    dim.runCommand(`setblock ${x - 6} ${y + 6} ${z + 12} minecraft:torch`);
    dim.runCommand(`setblock ${x + 6} ${y + 6} ${z + 12} minecraft:torch`);
    dim.runCommand(`setblock ${x - 12} ${y + 6} ${z - 6} minecraft:torch`);
    dim.runCommand(`setblock ${x - 12} ${y + 6} ${z + 6} minecraft:torch`);
    dim.runCommand(`setblock ${x + 12} ${y + 6} ${z - 6} minecraft:torch`);
    dim.runCommand(`setblock ${x + 12} ${y + 6} ${z + 6} minecraft:torch`);
  } catch {}
}

function trySpawnEntitiesRebelCity(city) {
  const dim = world7.getDimension(city.location.dimension);
  const live = dim.getEntities({ type: "kingdoms:bandit" }).filter((e) => e.getDynamicProperty("kc:rebel_id") === city.id);
  const target = Math.min(city.strength, REBEL_CITY_MAX_ENTITIES);
  const toSpawn = target - live.length;
  for (let i = 0; i < toSpawn; i++) {
    try {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * 10;
      const entity = dim.spawnEntity("kingdoms:bandit", {
        x: city.location.x + Math.cos(angle) * r,
        y: city.location.y,
        z: city.location.z + Math.sin(angle) * r
      });
      entity.setDynamicProperty("kc:rebel_id", city.id);
      entity.nameTag = "\xA7c[Rebel]";
    } catch {}
  }
}

function cleanDeadEntitiesRebelCity(city) {
  try {
    const dim = world7.getDimension(city.location.dimension);
    const liveIds = new Set(dim.getEntities({ type: "kingdoms:bandit" }).filter((e) => e.getDynamicProperty("kc:rebel_id") === city.id).map((e) => e.id));
    const before = city.entityIds.length;
    city.entityIds = city.entityIds.filter((id) => liveIds.has(id));
    const killed = before - city.entityIds.length;
    if (killed > 0) city.strength = Math.max(0, city.strength - killed);
    saveRebelCity(city);
  } catch {}
}

function disbandRebelCity(cityId, killerPlayerName) {
  const city = getRebelCity(cityId);
  if (!city) return;
  try {
    const dim = world7.getDimension(city.location.dimension);
    const live = dim.getEntities({ type: "kingdoms:bandit" }).filter((e) => e.getDynamicProperty("kc:rebel_id") === cityId);
    for (const e of live) { try { e.kill(); } catch {} }
    // Drop loot at city center
    const cx = Math.floor(city.location.x);
    const cy = Math.floor(city.location.y) + 1;
    const cz = Math.floor(city.location.z);
    dim.runCommand(`give @a[r=200] minecraft:emerald 20`);
    dim.runCommand(`give @a[r=200] minecraft:diamond 5`);
    dim.runCommand(`give @a[r=200] minecraft:iron_ingot 20`);
    dim.runCommand(`give @a[r=200] minecraft:gold_ingot 10`);
    dim.runCommand(`summon minecraft:item ${cx} ${cy} ${cz} minecraft:netherite_scrap 2`);
    dim.runCommand(`summon minecraft:item ${cx} ${cy} ${cz} minecraft:enchanted_golden_apple 1`);
  } catch {}
  deleteRebelCity(cityId);
  if (killerPlayerName) {
    awardCityDefeated(killerPlayerName);
    const ach = getPlayerAchievements(killerPlayerName);
    notifyPlayer(killerPlayerName, `\xA76\u2605\u2605 ACHIEVEMENT: Rebel city defeated! Riches claimed! (Total: \xA7e${ach.citiesDefeated}\xA76 cities, \xA7e${ach.campsDestroyed}\xA76 camps)`);
  }
  // Notify all players
  for (const p of world7.getAllPlayers()) {
    if (p.name !== killerPlayerName) {
      p.sendMessage(`\xA76[Kingdoms] \xA7f${killerPlayerName ?? "Someone"} has defeated a \xA7cRebel City\xA7f! Loot distributed to all nearby players.`);
    }
  }
}

function tryWorldSpawnRebelCity() {
  const cities = getAllRebelCities();
  if (cities.length >= MAX_REBEL_CITIES) return;
  if (Math.random() > 0.15) return;
  const villages = getAllVillages();
  if (villages.length === 0) return;
  const anchor = villages[Math.floor(Math.random() * villages.length)];
  const angle = Math.random() * Math.PI * 2;
  const dist = 300 + Math.random() * 400;
  const cx = anchor.location.x + Math.cos(angle) * dist;
  const cz = anchor.location.z + Math.sin(angle) * dist;
  for (const v of villages) {
    if (distance(v.location, { x: cx, y: v.location.y, z: cz }) < 200) return;
  }
  for (const c of cities) {
    if (distance(c.location, { x: cx, y: c.location.y, z: cz }) < 300) return;
  }
  const strength = REBEL_CITY_MIN_STRENGTH + Math.floor(Math.random() * (REBEL_CITY_MAX_STRENGTH - REBEL_CITY_MIN_STRENGTH));
  const city = {
    id: generateId(),
    location: { x: cx, y: anchor.location.y, z: cz, dimension: anchor.location.dimension },
    strength,
    entityIds: []
  };
  saveRebelCity(city);
  trySpawnEntitiesRebelCity(city);
  system.run(() => {
    try { buildRebelCityStructure(world7.getDimension(city.location.dimension), city.location); } catch {}
  });
  // Warn all online players
  for (const p of world7.getAllPlayers()) {
    p.sendMessage(`\xA7c\u26A0 A \xA7lRebel City\xA7r\xA7c has risen in the world! Strength: \xA7e${strength}\xA7c. Conquer it for great rewards!`);
  }
}

function tickRebelCities() {
  const cities = getAllRebelCities();
  for (const city of cities) {
    cleanDeadEntitiesRebelCity(city);
    const fresh = getRebelCity(city.id);
    if (!fresh) continue;
    if (fresh.strength <= 0) {
      const killer = findNearestPlayer(fresh.location, 200);
      disbandRebelCity(fresh.id, killer?.name);
      continue;
    }
    trySpawnEntitiesRebelCity(fresh);
  }
}

function tickRebelCityWarnings(currentTick) {
  if (currentTick % 100 !== 0) return;
  const cities = getAllRebelCities();
  if (cities.length === 0) return;
  for (const p of world7.getAllPlayers()) {
    for (const city of cities) {
      if (city.location.dimension !== p.dimension.id) continue;
      const d = distance(p.location, city.location);
      if (d <= REBEL_WARN_RADIUS) {
        const key = `${p.name}:${city.id}`;
        const last = lastRebelWarn.get(key) ?? 0;
        if (currentTick - last > 400) {
          p.sendMessage(`\xA7c\u26A0 \xA7lDANGER!\xA7r\xA7c A Rebel City is nearby (${Math.round(d)} blocks)! Strength: \xA7e${city.strength}\xA7c rebels inside.`);
          lastRebelWarn.set(key, currentTick);
        }
      }
    }
  }
}
// ── End Rebel City ──────────────────────────────────────────────────────────

// src/systems/military.ts
var RECRUIT_COSTS = {
  cityGuards: 5,
  spearmen: 8,
  archers: 8,
  cavalry: 12,
  samurai: 15,
  heavyKnights: 15
};
function recruitTroop(village, type, count = 1) {
  if (!village.granaryLocation || !village.treasuryLocation) {
    notifyPlayer(village.owner, `\xA7c\u26A0 Cannot recruit soldiers \u2014 \xA7bGranary\xA7c and \xA7bTreasury\xA7c must both be built and active in \xA7b${village.name}\xA7c!`);
    return false;
  }
  const totalSoldiers = village.troops.cityGuards + village.troops.spearmen + village.troops.archers + village.troops.cavalry + (village.troops.samurai ?? 0) + (village.troops.heavyKnights ?? 0);
  if (totalSoldiers + count > MAX_VILLAGE_SOLDIERS) {
    notifyPlayer(village.owner, `\xA7cSoldier cap of \xA7b${MAX_VILLAGE_SOLDIERS}\xA7c reached in \xA7b${village.name}\xA7c. Disband some troops first.`);
    return false;
  }
  const costEach = RECRUIT_COSTS[type];
  const totalCost = costEach * count;
  if (village.treasury < totalCost) {
    notifyPlayer(village.owner, `\xA7cNeed ${totalCost}\u{1F48E} to recruit ${count} ${type}.`);
    return false;
  }
  village.treasury -= totalCost;
  village.troops[type] += count;
  saveVillage(village);
  notifyPlayer(village.owner, `\xA7aRecruited ${count} ${type} in \xA7b${village.name}\xA7a.`);
  return true;
}
function disbandTroop(village, type, count = 1) {
  if (village.troops[type] < count) return false;
  village.troops[type] -= count;
  saveVillage(village);
  notifyPlayer(village.owner, `\xA7eDisbanded ${count} ${type} in \xA7b${village.name}\xA7a.`);
  return true;
}
function tickWages(village) {
  const currentDay = getCurrentDay();
  const daysSinceWage = daysSince(village.lastWageDay);
  if (daysSinceWage < WAGE_INTERVAL_DAYS) return;
  const totalWages = village.troops.cityGuards * TROOP_WAGES.cityGuards + village.troops.spearmen * TROOP_WAGES.spearmen + village.troops.archers * TROOP_WAGES.archers + village.troops.cavalry * TROOP_WAGES.cavalry + (village.troops.samurai ?? 0) * TROOP_WAGES.samurai + (village.troops.heavyKnights ?? 0) * TROOP_WAGES.heavyKnights;
  if (totalWages === 0) {
    village.lastWageDay = currentDay;
    saveVillage(village);
    return;
  }
  if (village.treasury >= totalWages) {
    village.treasury -= totalWages;
    village.missedWages = 0;
    village.lastWageDay = currentDay;
    notifyPlayer(village.owner, `\xA7aPaid wages (${totalWages}\u{1F48E}) in \xA7b${village.name}\xA7a.`);
  } else {
    village.missedWages++;
    village.lastWageDay = currentDay;
    switch (village.missedWages) {
      case 1:
        notifyPlayer(
          village.owner,
          `\xA7e\u26A0 Missed wage payment in \xA7b${village.name}\xA7e! Soldiers are unhappy.`
        );
        break;
      case 2:
        village.prosperity = Math.max(0, village.prosperity - 15);
        notifyPlayer(
          village.owner,
          `\xA7c\u26A0 Second missed payment in \xA7b${village.name}\xA7c! Morale is low.`
        );
        break;
      case 3:
        handleDesertion(village);
        break;
    }
  }
  saveVillage(village);
}
function handleDesertion(village) {
  const deserters = {};
  const keys = ["cityGuards", "spearmen", "archers", "cavalry"];
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
    `\xA7c${totalDeserters} soldiers deserted \xA7b${village.name}\xA7c and joined the bandits!`
  );
  spawnBanditDeserters(village, totalDeserters);
}
function upgradeBarracks(village) {
  const maxLevel = 5;
  if (village.barracksLevel >= maxLevel) {
    notifyPlayer(village.owner, "\xA7cBarracks already at maximum level.");
    return false;
  }
  const cost = village.barracksLevel * 15;
  if (village.treasury < cost) {
    notifyPlayer(village.owner, `\xA7cNeed ${cost}\u{1F48E} to upgrade barracks.`);
    return false;
  }
  village.treasury -= cost;
  village.barracksLevel++;
  saveVillage(village);
  notifyPlayer(village.owner, `\xA7aBarracks upgraded to level ${village.barracksLevel} in \xA7b${village.name}\xA7a!`);
  return true;
}
function getTotalTroops(village) {
  return village.troops.cityGuards + village.troops.spearmen + village.troops.archers + village.troops.cavalry + (village.troops.samurai ?? 0) + (village.troops.heavyKnights ?? 0);
}
function processAllWages() {
  for (const village of getAllVillages()) {
    tickWages(village);
  }
}

// src/systems/conquest.ts
init_storage();
import { world as world10 } from "@minecraft/server";

// src/systems/watchtower.ts
import { world as world8 } from "@minecraft/server";
init_storage();
var DETECTION_INTERVAL_TICKS = 100;
var lastDetectionTick = 0;
var THREAT_ALERT_COOLDOWN = 600;
var lastAlertedThreat = /* @__PURE__ */ new Map();
function tickWatchtowers(currentTick) {
  if (currentTick - lastDetectionTick < DETECTION_INTERVAL_TICKS) return;
  lastDetectionTick = currentTick;
  for (const village of getAllVillages()) {
    if (!village.owner) continue;
    const watchtowers = village.guardPoles.filter((p) => p.type === "watchtower");
    if (watchtowers.length === 0) continue;
    for (const tower of watchtowers) {
      scanFromWatchtower(village, tower, currentTick);
    }
  }
}
function scanFromWatchtower(village, tower, currentTick) {
  const dim = world8.getDimension(village.location.dimension);
  const query = {
    location: tower.location,
    maxDistance: WATCHTOWER_DETECTION_RADIUS,
    excludeTypes: [
      "minecraft:item",
      "minecraft:arrow",
      "minecraft:experience_orb"
    ]
  };
  const nearby = dim.getEntities(query);
  const kingdom = getKingdom(village.kingdomId);
  for (const entity of nearby) {
    if (entity.typeId === "kingdoms:bandit") {
      const alertKey = `${village.id}:bandits`;
      const lastAlert = lastAlertedThreat.get(alertKey) ?? 0;
      if (currentTick - lastAlert >= THREAT_ALERT_COOLDOWN) {
        const d = Math.round(distance(entity.location, tower.location));
        notifyAlert(village.owner, `\xA7c\u26A0 Watchtower detected bandits near \xA7b${village.name}\xA7c! (${d}m away)`);
        lastAlertedThreat.set(alertKey, currentTick);
      }
      return;
    }
    if (entity.typeId === "minecraft:player") {
      const playerName = entity.name;
      if (playerName === village.owner) continue;
      if (kingdom && isAllied(playerName, kingdom.id)) continue;
      if (isEnemyPlayer(playerName, village.kingdomId)) {
        const alertKey = `${village.id}:${playerName}`;
        const lastAlert = lastAlertedThreat.get(alertKey) ?? 0;
        if (currentTick - lastAlert >= THREAT_ALERT_COOLDOWN) {
          notifyAlert(
            village.owner,
            `\xA7c\u2694 Enemy player \xA74${playerName}\xA7c detected near \xA7b${village.name}\xA7c! Village may be under attack!`
          );
          lastAlertedThreat.set(alertKey, currentTick);
        }
        return;
      }
    }
  }
}
function getPlayerKingdom(playerName) {
  return getAllKingdoms().find(
    (k) => k.king === playerName || k.villageIds.some((vid) => {
      const v = getVillage(vid);
      return v?.owner === playerName;
    })
  );
}
function isAllied(playerName, kingdomId) {
  const playerKingdom = getPlayerKingdom(playerName);
  if (!playerKingdom) return false;
  const kingdom = getKingdom(kingdomId);
  return kingdom ? kingdom.alliances.includes(playerKingdom.id) : false;
}
function isEnemyPlayer(playerName, kingdomId) {
  const playerKingdom = getPlayerKingdom(playerName);
  if (!playerKingdom) return false;
  const kingdom = getKingdom(kingdomId);
  return kingdom ? kingdom.wars.includes(playerKingdom.id) : false;
}
function notifyVillageUnderSiege(villageId) {
  const village = getVillage(villageId);
  if (!village) return;
  notifyAlert(village.owner, `\xA74\u{1F514} \xA7b${village.name}\xA74 IS UNDER SIEGE!`);
  const kingdom = getKingdom(village.kingdomId);
  if (kingdom) {
    for (const vid of kingdom.villageIds) {
      const v = getVillage(vid);
      if (v && v.owner !== village.owner) {
        notifyAlert(v.owner, `\xA7c\u2694 Your allied village \xA7b${village.name}\xA7c is under siege!`);
      }
    }
  }
}

// src/systems/deployTroops.ts
init_storage();
import { ItemStack as ItemStack2, EntityInventoryComponent as EntityInventoryComponent3 } from "@minecraft/server";
var TROOP_TOKEN_MAP = {
  "kingdoms:guard_token":        { troopType: "cityGuards",   entityId: "kingdoms:city_guard",   label: "City Guard" },
  "kingdoms:spearman_token":     { troopType: "spearmen",     entityId: "kingdoms:spearman",     label: "Spearman" },
  "kingdoms:archer_token":       { troopType: "archers",      entityId: "kingdoms:archer",       label: "Archer" },
  "kingdoms:cavalry_token":      { troopType: "cavalry",      entityId: "kingdoms:cavalry",      label: "Cavalry" },
  "kingdoms:samurai_token":      { troopType: "samurai",      entityId: "kingdoms:samurai",      label: "Samurai" },
  "kingdoms:heavy_knight_token": { troopType: "heavyKnights", entityId: "kingdoms:heavy_knight", label: "Heavy Knight" }
};
function pickupTroops(player, village, pickup) {
  const total = pickup.cityGuards + pickup.spearmen + pickup.archers + pickup.cavalry + (pickup.samurai ?? 0) + (pickup.heavyKnights ?? 0);
  if (total <= 0) {
    notifyPlayer(player.name, "\xA7cSelect at least one troop to pick up.");
    return false;
  }
  const setsNeeded = Math.ceil(total / 10);
  const cost = setsNeeded * 10;
  if (village.treasury < cost) {
    notifyPlayer(player.name, `\xA7cNeed \xA7b${cost}\u{1F48E}\xA7c to withdraw ${total} soldiers (${setsNeeded} set${setsNeeded > 1 ? "s" : ""} \xD7 10\u{1F48E}). Treasury: ${village.treasury}\u{1F48E}.`);
    return false;
  }
  if (pickup.cityGuards > village.troops.cityGuards) {
    notifyPlayer(player.name, `\xA7cNot enough City Guards (have ${village.troops.cityGuards}).`);
    return false;
  }
  if (pickup.spearmen > village.troops.spearmen) {
    notifyPlayer(player.name, `\xA7cNot enough Spearmen (have ${village.troops.spearmen}).`);
    return false;
  }
  if (pickup.archers > village.troops.archers) {
    notifyPlayer(player.name, `\xA7cNot enough Archers (have ${village.troops.archers}).`);
    return false;
  }
  if (pickup.cavalry > village.troops.cavalry) {
    notifyPlayer(player.name, `\xA7cNot enough Cavalry (have ${village.troops.cavalry}).`);
    return false;
  }
  if ((pickup.samurai ?? 0) > (village.troops.samurai ?? 0)) {
    notifyPlayer(player.name, `\xA7cNot enough Samurai (have ${village.troops.samurai ?? 0}).`);
    return false;
  }
  if ((pickup.heavyKnights ?? 0) > (village.troops.heavyKnights ?? 0)) {
    notifyPlayer(player.name, `\xA7cNot enough Heavy Knights (have ${village.troops.heavyKnights ?? 0}).`);
    return false;
  }
  const inv = player.getComponent(EntityInventoryComponent3.componentId);
  if (!inv?.container) {
    notifyPlayer(player.name, "\xA7cInventory unavailable.");
    return false;
  }
  const container = inv.container;
  const toGive = [
    { itemId: "kingdoms:guard_token",        count: pickup.cityGuards },
    { itemId: "kingdoms:spearman_token",     count: pickup.spearmen },
    { itemId: "kingdoms:archer_token",       count: pickup.archers },
    { itemId: "kingdoms:cavalry_token",      count: pickup.cavalry },
    { itemId: "kingdoms:samurai_token",      count: pickup.samurai ?? 0 },
    { itemId: "kingdoms:heavy_knight_token", count: pickup.heavyKnights ?? 0 }
  ].filter((t) => t.count > 0);
  let slotsNeeded = 0;
  for (const { count } of toGive) slotsNeeded += Math.ceil(count / 64);
  let freeSlots = 0;
  for (let i = 0; i < container.size; i++) {
    if (!container.getItem(i)) freeSlots++;
  }
  if (freeSlots < slotsNeeded) {
    notifyPlayer(player.name, `\xA7cNot enough inventory space (need ${slotsNeeded} free slots).`);
    return false;
  }
  village.troops.cityGuards -= pickup.cityGuards;
  village.troops.spearmen -= pickup.spearmen;
  village.troops.archers -= pickup.archers;
  village.troops.cavalry -= pickup.cavalry;
  village.troops.samurai = (village.troops.samurai ?? 0) - (pickup.samurai ?? 0);
  village.troops.heavyKnights = (village.troops.heavyKnights ?? 0) - (pickup.heavyKnights ?? 0);
  village.treasury -= cost;
  saveVillage(village);
  for (const { itemId, count } of toGive) {
    let remaining = count;
    for (let i = 0; i < container.size && remaining > 0; i++) {
      const slot = container.getItem(i);
      if (!slot) {
        const give = Math.min(remaining, 64);
        container.setItem(i, new ItemStack2(itemId, give));
        remaining -= give;
      } else if (slot.typeId === itemId && slot.amount < 64) {
        const give = Math.min(remaining, 64 - slot.amount);
        slot.amount += give;
        container.setItem(i, slot);
        remaining -= give;
      }
    }
  }
  const summary = toGive.map(({ itemId, count }) => `${count} ${TROOP_TOKEN_MAP[itemId]?.label}`).join(", ");
  notifyPlayer(player.name, `\xA7a\u2694 Picked up: \xA7f${summary}\xA7a from \xA7b${village.name}\xA7a (\xA7c-${cost}\\u{1F48E}\xA7a). Right-click any token to deploy!`);
  return true;
}
function releaseTroops(player) {
  const inv = player.getComponent(EntityInventoryComponent3.componentId);
  if (!inv?.container) return false;
  const container = inv.container;
  const found = {};
  for (let i = 0; i < container.size; i++) {
    const slot = container.getItem(i);
    if (!slot) continue;
    if (TROOP_TOKEN_MAP[slot.typeId]) {
      found[slot.typeId] = (found[slot.typeId] ?? 0) + slot.amount;
    }
  }
  const total = Object.values(found).reduce((a, b) => a + b, 0);
  if (total === 0) return false;
  for (let i = 0; i < container.size; i++) {
    const slot = container.getItem(i);
    if (slot && TROOP_TOKEN_MAP[slot.typeId]) {
      container.setItem(i, void 0);
    }
  }
  const loc = player.location;
  const dim = player.dimension;
  const parts = [];
  for (const [itemId, count] of Object.entries(found)) {
    const info = TROOP_TOKEN_MAP[itemId];
    if (!info) continue;
    let spawned = 0;
    for (let n = 0; n < count; n++) {
      try {
        const offset = {
          x: loc.x + (Math.random() * 4 - 2),
          y: loc.y,
          z: loc.z + (Math.random() * 4 - 2)
        };
        const entity = dim.spawnEntity(info.entityId, offset);
        entity.nameTag = `${player.name}'s ${info.label}`;
        entity.setDynamicProperty("kc:owner", player.name);
        spawned++;
      } catch {
      }
    }
    if (spawned > 0) parts.push(`${spawned} ${info.label}`);
  }
  if (parts.length === 0) {
    notifyPlayer(player.name, "\xA7cCould not deploy troops (chunk not loaded).");
    return false;
  }
  notifyPlayer(player.name, `\xA7c\u2694 DEPLOYED: \xA7f${parts.join(", ")}\xA7c into battle!`);
  return true;
}
function deploySingleToken(player, itemId) {
  const info = TROOP_TOKEN_MAP[itemId];
  if (!info) return;
  const inv = player.getComponent(EntityInventoryComponent3.componentId);
  if (!inv?.container) return;
  const container = inv.container;
  let consumed = false;
  for (let i = 0; i < container.size; i++) {
    const slot = container.getItem(i);
    if (!slot || slot.typeId !== itemId) continue;
    if (slot.amount > 1) {
      const updated = new ItemStack2(slot.typeId, slot.amount - 1);
      container.setItem(i, updated);
    } else {
      container.setItem(i, void 0);
    }
    consumed = true;
    break;
  }
  if (!consumed) return;
  const loc = player.location;
  const dim = player.dimension;
  const angle = Math.random() * Math.PI * 2;
  try {
    const entity = dim.spawnEntity(info.entityId, {
      x: loc.x + Math.cos(angle) * 2,
      y: loc.y,
      z: loc.z + Math.sin(angle) * 2
    });
    entity.nameTag = `${player.name}'s ${info.label}`;
    entity.setDynamicProperty("kc:owner", player.name);
    notifyPlayer(player.name, `\xA7c\u2694 Deployed 1x \xA7f${info.label}\xA7c! Right-click token again for more.`);
  } catch {
    notifyPlayer(player.name, "\xA7cCould not deploy troop (chunk not loaded).");
    const inv2 = player.getComponent(EntityInventoryComponent3.componentId);
    if (inv2?.container) {
      let placed = false;
      for (let i = 0; i < inv2.container.size; i++) {
        const s = inv2.container.getItem(i);
        if (s?.typeId === itemId) {
          const updated = new ItemStack2(itemId, s.amount + 1);
          inv2.container.setItem(i, updated);
          placed = true; break;
        }
        if (!s && !placed) { inv2.container.setItem(i, new ItemStack2(itemId, 1)); placed = true; }
      }
    }
  }
}
var ENTITY_TO_TOKEN = {
  "kingdoms:city_guard": "kingdoms:guard_token",
  "kingdoms:spearman": "kingdoms:spearman_token",
  "kingdoms:archer": "kingdoms:archer_token",
  "kingdoms:cavalry": "kingdoms:cavalry_token"
};
var RECALL_RADIUS = 48;
function recallNearbyTroops(player) {
  const dim = player.dimension;
  const loc = player.location;
  const found = {};
  const toRemove = [];
  for (const entityType of Object.keys(ENTITY_TO_TOKEN)) {
    try {
      const entities = dim.getEntities({ type: entityType, location: loc, maxDistance: RECALL_RADIUS });
      for (const entity of entities) {
        if (entity.getDynamicProperty("kc:owner") === player.name) {
          found[entityType] = (found[entityType] ?? 0) + 1;
          toRemove.push(entity);
        }
      }
    } catch {
    }
  }
  if (toRemove.length === 0) {
    notifyPlayer(player.name, "\xA7eNo your soldiers found within 48 blocks.");
    return false;
  }
  const inv = player.getComponent(EntityInventoryComponent3.componentId);
  if (!inv?.container) return false;
  const container = inv.container;
  const parts = [];
  for (const [entityType, count] of Object.entries(found)) {
    const tokenId = ENTITY_TO_TOKEN[entityType];
    const info = TROOP_TOKEN_MAP[tokenId];
    if (!tokenId || !info) continue;
    let remaining = count;
    for (let i = 0; i < container.size && remaining > 0; i++) {
      const slot = container.getItem(i);
      if (!slot) {
        const give = Math.min(remaining, 64);
        container.setItem(i, new ItemStack2(tokenId, give));
        remaining -= give;
      } else if (slot.typeId === tokenId && slot.amount < 64) {
        const give = Math.min(remaining, 64 - slot.amount);
        slot.amount += give;
        container.setItem(i, slot);
        remaining -= give;
      }
    }
    const recalled = count - remaining;
    if (recalled > 0) parts.push(`${recalled} ${info.label}`);
  }
  for (const entity of toRemove) {
    try {
      entity.remove();
    } catch {
    }
  }
  if (parts.length === 0) {
    notifyPlayer(player.name, "\xA7cInventory full \u2014 soldiers had nowhere to go.");
    return false;
  }
  notifyPlayer(player.name, `\xA7a\u{1F4DC} Recalled: \xA7f${parts.join(", ")}\xA7a to your inventory.`);
  return true;
}
function garrisonDeployedSoldiers(attackerName, village, dimension) {
  const entityToTroop = {
    "kingdoms:city_guard": "cityGuards",
    "kingdoms:spearman": "spearmen",
    "kingdoms:archer": "archers",
    "kingdoms:cavalry": "cavalry"
  };
  const loc = village.townHallLocation;
  let total = 0;
  for (const [entityType, troopType] of Object.entries(entityToTroop)) {
    try {
      const entities = dimension.getEntities({ type: entityType, location: loc, maxDistance: 64 });
      for (const entity of entities) {
        if (entity.getDynamicProperty("kc:owner") === attackerName) {
          village.troops[troopType]++;
          total++;
          try {
            entity.remove();
          } catch {
          }
        }
      }
    } catch {
    }
  }
  if (total > 0) saveVillage(village);
  return total;
}
function countTroopTokens(player) {
  const inv = player.getComponent(EntityInventoryComponent3.componentId);
  const result = { cityGuards: 0, spearmen: 0, archers: 0, cavalry: 0, samurai: 0, heavyKnights: 0 };
  if (!inv?.container) return result;
  const container = inv.container;
  for (let i = 0; i < container.size; i++) {
    const slot = container.getItem(i);
    if (!slot) continue;
    const info = TROOP_TOKEN_MAP[slot.typeId];
    if (info) result[info.troopType] += slot.amount;
  }
  return result;
}

// src/systems/border.ts
init_storage();
import { world as world9 } from "@minecraft/server";
var BORDER_RADIUS = VILLAGE_CLAIM_RADIUS;
var SIEGE_ELIGIBILITY_TICKS = 2400;
var REMINDER_INTERVAL_TICKS = 400;
var PARTICLE_INTERVAL_TICKS = 40;
var PARTICLE_STEP = 10;
var PARTICLE_Y_OFFSETS = [0, 3];
var activeIntrusions = /* @__PURE__ */ new Map();
var lastParticleTick = 0;
function intrusionKey(playerName, villageId) {
  return `${playerName}:${villageId}`;
}
function isInsideBorder(px, pz, vx, vz) {
  return Math.abs(px - vx) <= BORDER_RADIUS && Math.abs(pz - vz) <= BORDER_RADIUS;
}
function tickBorders(tick) {
  const players = world9.getPlayers();
  const villages = getAllVillages();
  const currentKeys = /* @__PURE__ */ new Set();
  for (const player of players) {
    const playerKingdom = getKingdomOf(player.name);
    if (!playerKingdom) continue;
    for (const village of villages) {
      if (!village.owner) continue;
      if (village.kingdomId === playerKingdom.id) continue;
      if (!areAtWar(playerKingdom.id, village.kingdomId)) continue;
      const { x: vx, z: vz } = village.location;
      const inBorder = isInsideBorder(
        player.location.x,
        player.location.z,
        vx,
        vz
      );
      if (!inBorder) continue;
      const key = intrusionKey(player.name, village.id);
      currentKeys.add(key);
      let intrusion = activeIntrusions.get(key);
      if (!intrusion) {
        intrusion = {
          playerName: player.name,
          villageId: village.id,
          entryTick: tick,
          lastReminderTick: tick,
          siegeEligible: false
        };
        activeIntrusions.set(key, intrusion);
        const countdownSec = Math.floor(SIEGE_ELIGIBILITY_TICKS / 20);
        notifyAlert(
          village.owner,
          `\xA7c\u2694 Border Alert: \xA7e${player.name}\xA7c has entered \xA7b${village.name}\xA7c's territory! Siege eligible in ${countdownSec}s.`
        );
        notifyPlayer(
          player.name,
          `\xA7e\u26A0 You crossed into enemy territory: \xA7b${village.name}\xA7e. Siege eligible in \xA7f${countdownSec}s\xA7e if you remain.`
        );
      }
      if (!intrusion.siegeEligible) {
        const elapsed = tick - intrusion.entryTick;
        if (elapsed >= SIEGE_ELIGIBILITY_TICKS) {
          intrusion.siegeEligible = true;
          notifyPlayer(
            player.name,
            `\xA7a\u2694 Siege eligibility unlocked for \xA7b${village.name}\xA7a! Type \xA7f/siege ${village.name}\xA7a to begin.`
          );
          notifyAlert(
            village.owner,
            `\xA74\u{1F514} SIEGE READY: \xA7c${player.name}\xA74 is now eligible to besiege \xA7b${village.name}\xA74!`
          );
        } else if (tick - intrusion.lastReminderTick >= REMINDER_INTERVAL_TICKS) {
          const remaining = Math.ceil(
            (SIEGE_ELIGIBILITY_TICKS - elapsed) / 20
          );
          notifyPlayer(
            player.name,
            `\xA76\u23F3 Siege eligible in \xA7f${remaining}s\xA76 \u2014 stay inside \xA7b${village.name}\xA76's border.`
          );
          notifyAlert(
            village.owner,
            `\xA7c\u26A0 \xA7e${player.name}\xA7c is still inside \xA7b${village.name}\xA7c's border \u2014 siege eligible in \xA7f${remaining}s\xA7c.`
          );
          intrusion.lastReminderTick = tick;
        }
      }
    }
  }
  for (const [key, intrusion] of activeIntrusions.entries()) {
    if (currentKeys.has(key)) continue;
    const village = getVillage(intrusion.villageId);
    notifyPlayer(
      intrusion.playerName,
      `\xA77You left the border of \xA7b${village?.name ?? "a village"}\xA77. Siege eligibility lost.`
    );
    if (village?.owner && intrusion.siegeEligible) {
      notifyPlayer(
        village.owner,
        `\xA7a${intrusion.playerName} has left the border of \xA7b${village.name}\xA7a.`
      );
    }
    activeIntrusions.delete(key);
  }
  if (tick - lastParticleTick >= PARTICLE_INTERVAL_TICKS) {
    lastParticleTick = tick;
    renderBordersForPlayers();
  }
}
function renderBordersForPlayers() {
  const players = world9.getPlayers();
  const villages = getAllVillages();
  for (const player of players) {
    const playerKingdom = getKingdomOf(player.name);
    const px = player.location.x;
    const pz = player.location.z;
    const py = player.location.y;
    const dim = player.dimension;
    for (const village of villages) {
      if (!village.owner) continue;
      const vx = village.location.x;
      const vz = village.location.z;
      const isEnemy = playerKingdom && village.kingdomId !== playerKingdom.id && areAtWar(playerKingdom.id, village.kingdomId);
      const edgeDist = Math.max(
        Math.abs(px - vx) - BORDER_RADIUS,
        Math.abs(pz - vz) - BORDER_RADIUS
      );
      if (edgeDist > 16 || edgeDist < -16) continue;
      const particleId = isEnemy ? "minecraft:basic_flame_particle" : "minecraft:villager_happy";
      renderBorderParticles(village, dim, py, particleId);
    }
  }
}
function renderBorderParticles(village, dimension, playerY, particleId) {
  const cx = village.location.x;
  const cz = village.location.z;
  const r = BORDER_RADIUS;
  const baseY = Math.floor(playerY);
  for (const yOff of PARTICLE_Y_OFFSETS) {
    const y = baseY + yOff;
    for (let x = cx - r; x <= cx + r; x += PARTICLE_STEP) {
      trySpawnParticle(dimension, particleId, x, y, cz - r);
      trySpawnParticle(dimension, particleId, x, y, cz + r);
    }
    for (let z = cz - r + PARTICLE_STEP; z < cz + r; z += PARTICLE_STEP) {
      trySpawnParticle(dimension, particleId, cx - r, y, z);
      trySpawnParticle(dimension, particleId, cx + r, y, z);
    }
  }
}
function trySpawnParticle(dimension, particleId, x, y, z) {
  try {
    dimension.spawnParticle(particleId, { x, y, z });
  } catch {
  }
}
function isSiegeEligible(playerName, villageId) {
  const key = intrusionKey(playerName, villageId);
  return activeIntrusions.get(key)?.siegeEligible ?? false;
}
function getActiveBorderIntrusions() {
  return [...activeIntrusions.values()];
}
function clearBorderIntrusion(playerName, villageId) {
  activeIntrusions.delete(intrusionKey(playerName, villageId));
}

// src/systems/conquest.ts
var SIEGE_RADIUS = 48;
var CAPTURE_PROXIMITY = 5;
var activeSieges = /* @__PURE__ */ new Map();
function initiateSiege(attacker, targetVillageId) {
  const target = getVillage(targetVillageId);
  if (!target || !target.owner) {
    notifyPlayer(attacker.name, "\xA7cNo valid village to siege.");
    return false;
  }
  const attackerKingdom = getAttackerKingdom(attacker.name);
  if (!attackerKingdom) {
    notifyPlayer(attacker.name, "\xA7cYou must be in a kingdom to siege.");
    return false;
  }
  if (!areAtWar(attackerKingdom.id, target.kingdomId)) {
    notifyPlayer(attacker.name, "\xA7cYou are not at war with that kingdom.");
    return false;
  }
  const d = distance(attacker.location, target.townHallLocation);
  if (d > SIEGE_RADIUS) {
    notifyPlayer(attacker.name, `\xA7cYou must be within ${SIEGE_RADIUS} blocks of the Town Hall.`);
    return false;
  }
  if (activeSieges.has(targetVillageId)) {
    notifyPlayer(attacker.name, "\xA7cThat village is already under siege.");
    return false;
  }
  if (!isSiegeEligible(attacker.name, targetVillageId)) {
    notifyPlayer(
      attacker.name,
      `\xA7cYou must enter \xA7b${target.name}\xA7c's border and wait for the siege countdown before initiating a siege.`
    );
    return false;
  }
  const siege = {
    attackerKingdomId: attackerKingdom.id,
    attackerName: attacker.name,
    targetVillageId,
    startTick: world10.getAbsoluteTime(),
    progress: 0
  };
  activeSieges.set(targetVillageId, siege);
  clearBorderIntrusion(attacker.name, targetVillageId);
  notifyPlayer(attacker.name, `\xA7c\u2694 Siege of \xA7b${target.name}\xA7c has begun!`);
  notifyAlert(target.owner, `\xA74\u{1F514} \xA7b${target.name}\xA74 is under siege by \xA7c${attacker.name}\xA74!`);
  notifyVillageUnderSiege(targetVillageId);
  return true;
}
function tickSieges(_currentTick) {
  for (const [villageId, siege] of activeSieges.entries()) {
    const target = getVillage(villageId);
    if (!target) {
      activeSieges.delete(villageId);
      continue;
    }
    const players = world10.getPlayers();
    const attacker = players.find((p) => p.name === siege.attackerName);
    if (!attacker) {
      siege.progress = Math.max(0, siege.progress - 1);
      if (siege.progress <= 0) {
        activeSieges.delete(villageId);
        notifyPlayer(target.owner, `\xA7aSiege of \xA7b${target.name}\xA7a has been lifted.`);
      }
      continue;
    }
    const d = distance(attacker.location, target.townHallLocation);
    if (d <= CAPTURE_PROXIMITY) {
      siege.progress++;
      if (siege.progress >= 600) {
        captureVillage(siege, target);
        activeSieges.delete(villageId);
      } else if (siege.progress % 100 === 0) {
        const percent = Math.floor(siege.progress / 600 * 100);
        notifyPlayer(siege.attackerName, `\xA76Capturing... ${percent}%`);
        notifyAlert(target.owner, `\xA7cTown Hall being captured! (${percent}%)`);
      }
    } else if (d > SIEGE_RADIUS * 2) {
      siege.progress = Math.max(0, siege.progress - 2);
    }
  }
}
function captureVillage(siege, target) {
  const attackerKingdom = getKingdom(siege.attackerKingdomId);
  if (!attackerKingdom) return;
  const defenderKingdomId = target.kingdomId;
  const oldOwner = target.owner;
  const transferredTreasury = target.treasury;
  notifyPlayer(oldOwner, `\xA74\u2694 \xA7b${target.name}\xA74 has been captured by \xA7c${attackerKingdom.name}\xA74!`);
  removeVillageFromKingdom(defenderKingdomId, target.id);
  addVillageToKingdom(siege.attackerKingdomId, target.id);
  target.owner = siege.attackerName;
  target.kingdomId = siege.attackerKingdomId;
  target.treasury = 0;
  saveVillage(target);
  const attackerKingdomUpdated = getKingdom(siege.attackerKingdomId);
  if (attackerKingdomUpdated) {
    const attackerVillages = attackerKingdomUpdated.villageIds.map((id) => getVillage(id)).filter((v) => !!v && v.owner === siege.attackerName);
    if (attackerVillages.length > 0) {
      attackerVillages[0].treasury += transferredTreasury;
      saveVillage(attackerVillages[0]);
    }
  }
  const attacker = world10.getPlayers().find((p) => p.name === siege.attackerName);
  const dim = attacker?.dimension ?? world10.getDimension("overworld");
  const garrisoned = garrisonDeployedSoldiers(siege.attackerName, target, dim);
  const garrisonMsg = garrisoned > 0 ? ` \xA77(${garrisoned} surviving soldiers now garrison the village.)` : "";
  notifyPlayer(siege.attackerName, `\xA7a\u2694 \xA7b${target.name}\xA7a has been captured! Treasury: \xA76${transferredTreasury}\u{1F48E}\xA7a.${garrisonMsg}`);
}
function captureVillageByForce(attacker, target) {
  const attackerKingdom = getAttackerKingdom(attacker.name);
  if (!attackerKingdom) {
    notifyPlayer(attacker.name, "\xA7cYou must be in a kingdom to capture a village.");
    return false;
  }
  if (!areAtWar(attackerKingdom.id, target.kingdomId)) {
    notifyPlayer(attacker.name, "\xA7cYou are not at war with that kingdom.");
    return false;
  }
  if (target.owner === attacker.name) return false;
  const siege = {
    attackerKingdomId: attackerKingdom.id,
    attackerName: attacker.name,
    targetVillageId: target.id,
    startTick: world10.getAbsoluteTime(),
    progress: 600
  };
  activeSieges.delete(target.id);
  captureVillage(siege, target);
  return true;
}
function getActiveSiege(villageId) {
  return activeSieges.get(villageId);
}
function isSiegeActive(villageId) {
  return activeSieges.has(villageId);
}
function getAttackerKingdom(playerName) {
  return getAllKingdoms().find(
    (k) => k.king === playerName || k.villageIds.some((vid) => {
      const v = getVillage(vid);
      return v?.owner === playerName;
    })
  );
}

// src/systems/treasury.ts
init_storage();
import { ItemStack as ItemStack3, EntityInventoryComponent as EntityInventoryComponent4 } from "@minecraft/server";
function depositEmeralds(player, villageId, amount) {
  const village = getVillage(villageId);
  if (!village || village.owner !== player.name) return false;
  const inv = player.getComponent(EntityInventoryComponent4.componentId);
  if (!inv) return false;
  const container = inv.container;
  if (!container) return false;
  let removed = 0;
  for (let i = 0; i < container.size && removed < amount; i++) {
    const item = container.getItem(i);
    if (!item || item.typeId !== "minecraft:emerald") continue;
    const take = Math.min(item.amount, amount - removed);
    removed += take;
    if (take >= item.amount) {
      container.setItem(i, void 0);
    } else {
      item.amount -= take;
      container.setItem(i, item);
    }
  }
  if (removed === 0) {
    notifyPlayer(player.name, "\xA7cNo emeralds in inventory to deposit.");
    return false;
  }
  village.treasury += removed;
  saveVillage(village);
  notifyPlayer(player.name, `\xA7aDeposited \xA76${removed}\u{1F48E}\xA7a into \xA7b${village.name}\xA7a treasury. (Total: \xA76${village.treasury}\u{1F48E}\xA7a)`);
  return true;
}
function withdrawEmeralds(player, villageId, amount) {
  const village = getVillage(villageId);
  if (!village || village.owner !== player.name) return false;
  if (village.treasury < amount) {
    notifyPlayer(player.name, `\xA7cNot enough emeralds in treasury (${village.treasury}\u{1F48E}).`);
    return false;
  }
  const inv = player.getComponent(EntityInventoryComponent4.componentId);
  if (!inv?.container) return false;
  const container = inv.container;
  let remaining = amount;
  for (let i = 0; i < container.size && remaining > 0; i++) {
    const slot = container.getItem(i);
    if (!slot) {
      const give = Math.min(remaining, 64);
      container.setItem(i, new ItemStack3("minecraft:emerald", give));
      remaining -= give;
    } else if (slot.typeId === "minecraft:emerald" && slot.amount < 64) {
      const give = Math.min(remaining, 64 - slot.amount);
      slot.amount += give;
      container.setItem(i, slot);
      remaining -= give;
    }
  }
  if (remaining > 0) {
    notifyPlayer(player.name, "\xA7cInventory full \u2014 not all emeralds could be withdrawn.");
    const withdrawn = amount - remaining;
    village.treasury -= withdrawn;
    saveVillage(village);
    notifyPlayer(player.name, `\xA7aWithdrew \xA76${withdrawn}\u{1F48E}\xA7a. (Treasury: \xA76${village.treasury}\u{1F48E}\xA7a)`);
    return false;
  }
  village.treasury -= amount;
  saveVillage(village);
  notifyPlayer(player.name, `\xA7aWithdrew \xA76${amount}\u{1F48E}\xA7a from \xA7b${village.name}\xA7a. (Treasury: \xA76${village.treasury}\u{1F48E}\xA7a)`);
  return true;
}
function getTreasuryReport(village) {
  const wages = { cityGuards: 1, spearmen: 2, archers: 2, cavalry: 3 };
  const dailyWages = (village.troops.cityGuards * wages.cityGuards + village.troops.spearmen * wages.spearmen + village.troops.archers * wages.archers + village.troops.cavalry * wages.cavalry) / 3;
  return [
    `\xA7b${village.name} Treasury\xA7r`,
    `\xA77Balance: \xA76${village.treasury}\u{1F48E}`,
    `\xA77Daily wage cost: \xA7c~${dailyWages.toFixed(1)}\u{1F48E}/day`,
    `\xA77Wages covered: \xA7f${dailyWages > 0 ? Math.floor(village.treasury / dailyWages) + " days" : "\u221E"}`,
    ``,
    `\xA77Deposit emeralds from inventory to fund the treasury.`,
    `\xA77Emeralds are spent on wages, recruitment, upgrades & trade.`
  ].join("\n");
}

// src/systems/blacksmith.ts
import { ItemStack as ItemStack4, EntityInventoryComponent as EntityInventoryComponent5 } from "@minecraft/server";
init_storage();
var WEAPON_UPGRADE_COSTS = [
  { material: "minecraft:cobblestone", materialCount: 1, emeralds: 1 },
  { material: "minecraft:iron_ingot", materialCount: 1, emeralds: 1 },
  { material: "minecraft:gold_ingot", materialCount: 1, emeralds: 1 },
  { material: "minecraft:diamond", materialCount: 1, emeralds: 1 },
  { material: "minecraft:netherite_scrap", materialCount: 1, emeralds: 1 }
];
var ARMOR_UPGRADE_COSTS = [
  { material: "minecraft:iron_ingot", materialCount: 2, emeralds: 1 },
  { material: "minecraft:gold_ingot", materialCount: 2, emeralds: 1 },
  { material: "minecraft:diamond", materialCount: 2, emeralds: 1 },
  { material: "minecraft:netherite_scrap", materialCount: 2, emeralds: 1 }
];
function upgradeWeapons(player, villageId) {
  const village = getVillage(villageId);
  if (!village || village.owner !== player.name) return false;
  const currentTier = village.blacksmith.weaponTier;
  if (currentTier >= WEAPON_TIERS.length - 1) {
    notifyPlayer(player.name, "\xA7cWeapons already at maximum tier (Netherite).");
    return false;
  }
  const cost = WEAPON_UPGRADE_COSTS[currentTier];
  if (!cost) return false;
  const totalSoldiers = village.troops.cityGuards + village.troops.spearmen + village.troops.archers + village.troops.cavalry;
  const totalMaterial = cost.materialCount * totalSoldiers;
  const totalEmeralds = cost.emeralds * totalSoldiers;
  if (!consumeItems(player, cost.material, totalMaterial)) {
    notifyPlayer(
      player.name,
      `\xA7cNeed ${totalMaterial}x ${cost.material.replace("minecraft:", "")} to upgrade ${totalSoldiers} soldiers.`
    );
    return false;
  }
  if (!consumeItems(player, "minecraft:emerald", totalEmeralds)) {
    notifyPlayer(player.name, `\xA7cNeed ${totalEmeralds} emeralds for upgrades.`);
    giveBackItems(player, cost.material, totalMaterial);
    return false;
  }
  village.blacksmith.weaponTier++;
  saveVillage(village);
  const newTier = WEAPON_TIERS[village.blacksmith.weaponTier];
  notifyPlayer(
    player.name,
    `\xA7aWeapons upgraded to \xA7b${newTier}\xA7a tier for ${totalSoldiers} soldiers in \xA7b${village.name}\xA7a!`
  );
  return true;
}
function upgradeArmor(player, villageId) {
  const village = getVillage(villageId);
  if (!village || village.owner !== player.name) return false;
  const currentTier = village.blacksmith.armorTier;
  if (currentTier >= ARMOR_TIERS.length - 1) {
    notifyPlayer(player.name, "\xA7cArmor already at maximum tier (Netherite).");
    return false;
  }
  const cost = ARMOR_UPGRADE_COSTS[currentTier];
  if (!cost) return false;
  const totalSoldiers = village.troops.cityGuards + village.troops.spearmen + village.troops.archers + village.troops.cavalry;
  const totalMaterial = cost.materialCount * totalSoldiers;
  const totalEmeralds = cost.emeralds * totalSoldiers;
  if (!consumeItems(player, cost.material, totalMaterial)) {
    notifyPlayer(
      player.name,
      `\xA7cNeed ${totalMaterial}x ${cost.material.replace("minecraft:", "")} for armor upgrade.`
    );
    return false;
  }
  if (!consumeItems(player, "minecraft:emerald", totalEmeralds)) {
    notifyPlayer(player.name, `\xA7cNeed ${totalEmeralds} emeralds for armor upgrades.`);
    giveBackItems(player, cost.material, totalMaterial);
    return false;
  }
  village.blacksmith.armorTier++;
  saveVillage(village);
  const newTier = ARMOR_TIERS[village.blacksmith.armorTier];
  notifyPlayer(
    player.name,
    `\xA7aArmor upgraded to \xA7b${newTier}\xA7a tier for ${totalSoldiers} soldiers in \xA7b${village.name}\xA7a!`
  );
  return true;
}
function consumeItems(player, typeId, amount) {
  const inv = player.getComponent(EntityInventoryComponent5.componentId);
  if (!inv) return false;
  const container = inv.container;
  if (!container) return false;
  let total = 0;
  for (let i = 0; i < container.size; i++) {
    const item = container.getItem(i);
    if (item && item.typeId === typeId) total += item.amount;
  }
  if (total < amount) return false;
  let remaining = amount;
  for (let i = 0; i < container.size && remaining > 0; i++) {
    const item = container.getItem(i);
    if (!item || item.typeId !== typeId) continue;
    const take = Math.min(item.amount, remaining);
    remaining -= take;
    if (take >= item.amount) {
      container.setItem(i, void 0);
    } else {
      item.amount -= take;
      container.setItem(i, item);
    }
  }
  return true;
}
function giveBackItems(player, typeId, amount) {
  const inv = player.getComponent(EntityInventoryComponent5.componentId);
  if (!inv) return;
  const container = inv.container;
  if (!container) return;
  let remaining = amount;
  for (let i = 0; i < container.size && remaining > 0; i++) {
    const item = container.getItem(i);
    if (item === void 0) {
      const give = Math.min(remaining, 64);
      container.setItem(i, new ItemStack4(typeId, give));
      remaining -= give;
    }
  }
}
function getBlacksmithSummary(village) {
  const wt = WEAPON_TIERS[village.blacksmith.weaponTier] ?? "unknown";
  const at = ARMOR_TIERS[village.blacksmith.armorTier] ?? "unknown";
  const nextWT = WEAPON_TIERS[village.blacksmith.weaponTier + 1];
  const nextAT = ARMOR_TIERS[village.blacksmith.armorTier + 1];
  const wCost = WEAPON_UPGRADE_COSTS[village.blacksmith.weaponTier];
  const aCost = ARMOR_UPGRADE_COSTS[village.blacksmith.armorTier];
  const soldiers = village.troops.cityGuards + village.troops.spearmen + village.troops.archers + village.troops.cavalry;
  return [
    `\xA7b${village.name} Blacksmith\xA7r`,
    `Weapon Tier: \xA7a${wt}\xA7r ${nextWT ? `\u2192 ${nextWT}` : "(MAX)"}`,
    `Armor Tier: \xA7a${at}\xA7r ${nextAT ? `\u2192 ${nextAT}` : "(MAX)"}`,
    soldiers > 0 && wCost ? `Weapon upgrade cost: ${wCost.materialCount * soldiers}x ${wCost.material.replace("minecraft:", "")} + ${wCost.emeralds * soldiers}\u{1F48E}` : "",
    soldiers > 0 && aCost ? `Armor upgrade cost: ${aCost.materialCount * soldiers}x ${aCost.material.replace("minecraft:", "")} + ${aCost.emeralds * soldiers}\u{1F48E}` : ""
  ].filter(Boolean).join("\n");
}

// src/systems/commands.ts
var TROOP_TYPES = ["cityGuards", "spearmen", "archers", "cavalry"];
function registerCommands() {
  system2.afterEvents.scriptEventReceive.subscribe(
    (event) => {
      const player = event.sourceEntity;
      if (!player || typeof player.name !== "string") return;
      const subcommand = event.id.replace("kc:", "");
      const args = event.message.trim().split(/\s+/).filter(Boolean);
      handleKcCommand(player, subcommand, args);
    },
    { namespaces: ["kc"] }
  );
}
function handleKcCommand(player, subcommand, args) {
  switch (subcommand) {
    case "help":
      showHelp(player);
      break;
    case "status":
    case "s":
      showMyStatus(player);
      break;
    case "kingdom":
    case "k":
      showKingdomStatus(player);
      break;
    case "villages":
    case "v":
      showVillageList(player);
      break;
    case "village":
      showVillageDetail(player, args[0]);
      break;
    case "granary":
    case "g":
      showGranaryStatus(player, args[0]);
      break;
    case "treasury":
    case "t":
      showTreasuryStatus(player, args[0]);
      break;
    case "recruit":
      cmdRecruit(player, args);
      break;
    case "disband":
      cmdDisband(player, args);
      break;
    case "barracks":
      cmdUpgradeBarracks(player, args[0]);
      break;
    case "workers":
      cmdSetWorkers(player, args);
      break;
    case "war":
      cmdWar(player, args[0]);
      break;
    case "peace":
      cmdPeace(player, args[0]);
      break;
    case "ally":
      cmdAlly(player, args[0]);
      break;
    case "kingdoms":
      cmdListKingdoms(player);
      break;
    case "blacksmith":
    case "bs":
      cmdBlacksmith(player, args[0]);
      break;
    case "map":
    case "m":
      showMap(player);
      break;
    case "siege":
      cmdSiege(player, args[0]);
      break;
    case "border":
    case "b":
      showBorderStatus(player);
      break;
    case "intel":
      cmdIntel(player, args[0]);
      break;
    case "alerts":
      cmdToggleAlerts(player);
      break;
    case "collect":
      cmdCollect(player, args[0]);
      break;
    case "tutorial":
    case "guide":
      cmdTutorial(player, args[0]);
      break;
    case "bandits":
      cmdBandits(player);
      break;
    case "achievements":
    case "stats":
      cmdAchievements(player);
      break;
    case "stratmap":
    case "formation":
    case "raid":
      void cmdStratMap(player);
      break;
    case "repair":
      cmdRepair(player);
      break;
    case "reset":
      cmdReset(player);
      break;
    default:
      notifyPlayer(player.name, `\xA7cUnknown /kc command: "${subcommand}". Use /scriptevent kc:help`);
  }
}
function showHelp(player) {
  const lines = [
    "\xA7b=== Kingdoms & Conquest Commands ===\xA7r",
    "\xA7e/scriptevent kc:help\xA7r \u2014 this list",
    "\xA7e/scriptevent kc:repair\xA7r \u2014 \xA7afix broken/negative village data (safe to run anytime)\xA7r",
    "\xA7c/scriptevent kc:reset\xA7r \u2014 \xA7cDELETE ALL addon data (irreversible!)\xA7r",
    "\xA7e/scriptevent kc:tutorial\xA7r \u2014 \xA7aIN-GAME TUTORIAL (start here!)\xA7r",
    "\xA7e/scriptevent kc:status\xA7r \u2014 your villages & kingdom",
    "\xA7e/scriptevent kc:kingdom\xA7r \u2014 full kingdom overview",
    "\xA7e/scriptevent kc:villages\xA7r \u2014 list all your villages",
    "\xA7e/scriptevent kc:village <id>\xA7r \u2014 village detail",
    "\xA7e/scriptevent kc:granary <id>\xA7r \u2014 granary contents",
    "\xA7e/scriptevent kc:treasury <id>\xA7r \u2014 treasury balance",
    "\xA7e/scriptevent kc:recruit <id> <type> <n>\xA7r \u2014 hire troops",
    "\xA7e/scriptevent kc:disband <id> <type> <n>\xA7r \u2014 release troops",
    "\xA7e/scriptevent kc:barracks <id>\xA7r \u2014 upgrade barracks",
    "\xA7e/scriptevent kc:workers <id> f:<n> w:<n>\xA7r \u2014 set farmers/workers",
    "\xA7e/scriptevent kc:war <kingdomName>\xA7r \u2014 declare war",
    "\xA7e/scriptevent kc:peace <kingdomName>\xA7r \u2014 sue for peace",
    "\xA7e/scriptevent kc:ally <kingdomName>\xA7r \u2014 propose alliance",
    "\xA7e/scriptevent kc:kingdoms\xA7r \u2014 list all kingdoms",
    "\xA7e/scriptevent kc:blacksmith <id>\xA7r \u2014 smithy summary",
    "\xA7e/scriptevent kc:map\xA7r \u2014 strategic overview of all villages",
    "\xA7e/scriptevent kc:siege <villageName>\xA7r \u2014 begin siege (must be border-eligible)",
    "\xA7e/scriptevent kc:border\xA7r \u2014 see border intrusion status",
    "\xA7e/scriptevent kc:intel <kingdomName>\xA7r \u2014 scout an enemy kingdom",
    "\xA7e/scriptevent kc:alerts\xA7r \u2014 toggle incoming-attack alerts on/off",
    "\xA7e/scriptevent kc:collect <id>\xA7r \u2014 collect NPC-harvested crops to your inventory",
    "\xA7e/scriptevent kc:achievements\xA7r \u2014 \xA76view your combat achievements (camps destroyed, rebel cities defeated)\xA7r",
    "\xA7e/scriptevent kc:bandits\xA7r \u2014 list active bandit camps \xA7cand rebel cities\xA7r",
    "\xA7c\u2694 WAR TIP: Place 3 black wool in a line inside an enemy village to declare war!",
    "\xA76\u{1F5FA} /scriptevent kc:stratmap\xA7r \u2014 open Strategic Formation Map (bird's-eye view, place troops)",
    "\xA77Troop types: cityGuards, spearmen, archers, cavalry"
  ];
  for (const line of lines) notifyPlayer(player.name, line);
}
function cmdRepair(player) {
  if (!player.isOp()) {
    notifyPlayer(player.name, "\xA7cOnly operators can run kc:repair.");
    return;
  }
  notifyPlayer(player.name, "\xA7eRunning village data repair\u2026");
  const villages = getAllVillages();
  let fixed = 0;
  for (const v of villages) {
    let dirty = false;
    // Fix negative numeric fields
    for (const key of ["population", "foodStorage", "treasury", "housingCapacity", "marketLevel", "foodShortageStage"]) {
      if (typeof v[key] !== "number" || v[key] < 0) {
        v[key] = Math.max(0, typeof v[key] === "number" ? v[key] : 0);
        dirty = true;
      }
    }
    // Ensure nested objects exist
    if (!v.workers || typeof v.workers !== "object") { v.workers = { farmers: 0, builders: 0 }; dirty = true; }
    if (!v.troops || typeof v.troops !== "object") { v.troops = { cityGuards: 0, spearmen: 0, archers: 0, cavalry: 0 }; dirty = true; }
    if (!Array.isArray(v.allies)) { v.allies = []; dirty = true; }
    if (!Array.isArray(v.villageIds)) { v.villageIds = []; dirty = true; }
    // Ensure population >= 1 if village exists
    if (v.population < 1) { v.population = 1; dirty = true; }
    // Sync lastPopulationDay
    if (typeof v.lastPopulationDay !== "number") { v.lastPopulationDay = v.lastDayProcessed ?? getCurrentDay(); dirty = true; }
    if (dirty) { saveVillage(v); fixed++; }
  }
  const kingdoms = getAllKingdoms();
  let kFixed = 0;
  for (const k of kingdoms) {
    let dirty = false;
    if (!Array.isArray(k.villageIds)) { k.villageIds = []; dirty = true; }
    if (!Array.isArray(k.members)) { k.members = []; dirty = true; }
    if (dirty) { saveKingdom(k); kFixed++; }
  }
  notifyPlayer(player.name, `\xA7aRepair complete: fixed ${fixed}/${villages.length} villages, ${kFixed}/${kingdoms.length} kingdoms.`);
}
function cmdReset(player) {
  if (!player.isOp()) {
    notifyPlayer(player.name, "\xA7cOnly operators can run kc:reset.");
    return;
  }
  notifyPlayer(player.name, "\xA7c\u26A0 [kc:reset] Deleting ALL Kingdoms & Conquest data\u2026");
  const villages = getAllVillages();
  for (const v of villages) {
    try { deleteVillage(v.id); } catch {}
  }
  const kingdoms = getAllKingdoms();
  for (const k of kingdoms) {
    try { deleteKingdom(k.id); } catch {}
  }
  try {
    const camps = getAllBanditCamps ? getAllBanditCamps() : [];
    for (const c of camps) { try { deleteBanditCamp(c.id); } catch {} }
  } catch {}
  try {
    for (const p of world16.getPlayers()) {
      try { world16.setDynamicProperty(KC_FIRST_SPAWN_PROP + p.name, void 0); } catch {}
    }
  } catch {}
  notifyPlayer(player.name, "\xA7aAll addon data has been reset. All kingdoms, villages, and first-spawn flags cleared. Players will receive starter items on next login.");
}
function showMyStatus(player) {
  const myVillages = getAllVillages().filter((v) => v.owner === player.name);
  if (myVillages.length === 0) {
    notifyPlayer(player.name, "\xA7eYou don't own any villages yet. Place a Town Hall block to claim one.");
    return;
  }
  const kingdom = getKingdomOf(player.name);
  notifyPlayer(player.name, `\xA7b=== ${kingdom?.name ?? "No Kingdom"} ===`);
  for (const v of myVillages) {
    const troops = getTotalTroops(v);
    const food = getGranaryFoodUnits(v) + v.foodStorage;
    notifyPlayer(
      player.name,
      `\xA7a${v.name}\xA7r [${v.id.slice(0, 6)}] | Pop:${v.population} | \u{1F48E}${v.treasury} | \u{1F33E}${food} | \u2694${troops}`
    );
  }
}
function showKingdomStatus(player) {
  const kingdom = getKingdomOf(player.name);
  if (!kingdom) {
    notifyPlayer(player.name, "\xA7cYou are not in any kingdom.");
    return;
  }
  const summary = getKingdomSummary(kingdom.id);
  for (const line of summary.split("\n")) notifyPlayer(player.name, line);
}
function showVillageList(player) {
  const myVillages = getAllVillages().filter((v) => v.owner === player.name);
  if (myVillages.length === 0) {
    notifyPlayer(player.name, "\xA7eNo villages owned.");
    return;
  }
  notifyPlayer(player.name, "\xA7b=== Your Villages ===");
  for (const v of myVillages) {
    notifyPlayer(player.name, `\xA7a${v.name}\xA7r  id: \xA7e${v.id.slice(0, 8)}`);
  }
}
function showVillageDetail(player, idPrefix) {
  const village = resolveVillage(player, idPrefix);
  if (!village) return;
  const summary = getVillageSummary(village);
  for (const line of summary.split("\n")) notifyPlayer(player.name, line);
}
function showGranaryStatus(player, idPrefix) {
  const village = resolveVillage(player, idPrefix);
  if (!village) return;
  const report = getGranaryReport(village);
  for (const line of report.split("\n")) notifyPlayer(player.name, line);
}
function showTreasuryStatus(player, idPrefix) {
  const village = resolveVillage(player, idPrefix);
  if (!village) return;
  const report = getTreasuryReport(village);
  for (const line of report.split("\n")) notifyPlayer(player.name, line);
}
function cmdRecruit(player, args) {
  const village = resolveVillage(player, args[0]);
  if (!village) return;
  const type = args[1];
  if (!TROOP_TYPES.includes(type)) {
    notifyPlayer(player.name, `\xA7cInvalid troop type. Use: ${TROOP_TYPES.join(", ")}`);
    return;
  }
  const count = parseInt(args[2] ?? "1", 10);
  if (isNaN(count) || count < 1) {
    notifyPlayer(player.name, "\xA7cCount must be a positive number.");
    return;
  }
  recruitTroop(village, type, count);
}
function cmdDisband(player, args) {
  const village = resolveVillage(player, args[0]);
  if (!village) return;
  const type = args[1];
  if (!TROOP_TYPES.includes(type)) {
    notifyPlayer(player.name, `\xA7cInvalid troop type. Use: ${TROOP_TYPES.join(", ")}`);
    return;
  }
  const count = parseInt(args[2] ?? "1", 10);
  if (isNaN(count) || count < 1) {
    notifyPlayer(player.name, "\xA7cCount must be a positive number.");
    return;
  }
  disbandTroop(village, type, count);
}
function cmdUpgradeBarracks(player, idPrefix) {
  const village = resolveVillage(player, idPrefix);
  if (!village) return;
  upgradeBarracks(village);
}
function cmdSetWorkers(player, args) {
  const village = resolveVillage(player, args[0]);
  if (!village) return;
  let farmers = village.workers.farmers;
  let workers = village.workers.workers;
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("f:")) farmers = parseInt(arg.slice(2), 10);
    else if (arg.startsWith("w:")) workers = parseInt(arg.slice(2), 10);
  }
  if (isNaN(farmers) || isNaN(workers) || farmers < 0 || workers < 0) {
    notifyPlayer(player.name, "\xA7cUsage: /scriptevent kc:workers <id> f:<n> w:<n>");
    return;
  }
  const available = village.population - village.troops.cityGuards - village.troops.spearmen - village.troops.archers - village.troops.cavalry;
  if (farmers + workers > available) {
    notifyPlayer(player.name, `\xA7cNot enough available workers (${available} free).`);
    return;
  }
  village.workers.farmers = farmers;
  village.workers.workers = workers;
  saveVillage(village);
  notifyPlayer(player.name, `\xA7aWorkers set in \xA7b${village.name}\xA7a: ${farmers} farmers, ${workers} workers.`);
}
function cmdWar(player, kingdomName) {
  if (!kingdomName) {
    notifyPlayer(player.name, "\xA7cUsage: /scriptevent kc:war <kingdomName>");
    return;
  }
  const myKingdom = getKingdomOf(player.name);
  if (!myKingdom) return;
  const target = getAllKingdoms().find((k) => k.name.toLowerCase() === kingdomName.toLowerCase());
  if (!target) {
    notifyPlayer(player.name, `\xA7cKingdom "${kingdomName}" not found.`);
    return;
  }
  declareWar(myKingdom.id, target.id);
}
function cmdPeace(player, kingdomName) {
  if (!kingdomName) {
    notifyPlayer(player.name, "\xA7cUsage: /scriptevent kc:peace <kingdomName>");
    return;
  }
  const myKingdom = getKingdomOf(player.name);
  if (!myKingdom) return;
  const target = getAllKingdoms().find((k) => k.name.toLowerCase() === kingdomName.toLowerCase());
  if (!target) {
    notifyPlayer(player.name, `\xA7cKingdom "${kingdomName}" not found.`);
    return;
  }
  makePeace(myKingdom.id, target.id);
}
function cmdAlly(player, kingdomName) {
  if (!kingdomName) {
    notifyPlayer(player.name, "\xA7cUsage: /scriptevent kc:ally <kingdomName>");
    return;
  }
  const myKingdom = getKingdomOf(player.name);
  if (!myKingdom) return;
  const target = getAllKingdoms().find((k) => k.name.toLowerCase() === kingdomName.toLowerCase());
  if (!target) {
    notifyPlayer(player.name, `\xA7cKingdom "${kingdomName}" not found.`);
    return;
  }
  formAlliance(myKingdom.id, target.id);
}
function cmdListKingdoms(player) {
  const kingdoms = getAllKingdoms();
  if (kingdoms.length === 0) {
    notifyPlayer(player.name, "\xA7eNo kingdoms exist yet.");
    return;
  }
  notifyPlayer(player.name, "\xA7b=== All Kingdoms ===");
  for (const k of kingdoms) {
    notifyPlayer(player.name, `\xA7a${k.name}\xA7r  King: \xA7e${k.king}\xA7r  Villages: ${k.villageIds.length}`);
  }
}
function cmdBlacksmith(player, idPrefix) {
  const village = resolveVillage(player, idPrefix);
  if (!village) return;
  const summary = getBlacksmithSummary(village);
  for (const line of summary.split("\n")) notifyPlayer(player.name, line);
}
function showMap(player) {
  const myVillages = getAllVillages().filter((v) => v.owner === player.name);
  const kingdom = getKingdomOf(player.name);
  if (myVillages.length === 0) {
    notifyPlayer(player.name, "\xA7eYou don't own any villages yet.");
    return;
  }
  notifyPlayer(player.name, `\xA7b\u2550\u2550\u2550 ${kingdom?.name ?? "No Kingdom"} \u2014 Strategic Map \u2550\u2550\u2550`);
  for (const v of myVillages) {
    const troops = v.troops.cityGuards + v.troops.spearmen + v.troops.archers + v.troops.cavalry;
    const training = v.trainingQueue?.length ?? 0;
    const siegeFlag = isSiegeActive(v.id) ? " \xA7c\u2694 UNDER SIEGE\xA7r" : "";
    const trainingTag = training > 0 ? ` \xA7e\u{1FA96}+${training}\xA7r` : "";
    const merchants = v.activeMerchants.length;
    notifyPlayer(
      player.name,
      `\xA7a${v.name}\xA7r${siegeFlag}`
    );
    notifyPlayer(
      player.name,
      `  \u{1F48E}${v.treasury}  \u2694${troops}${trainingTag}  \u{1F465}${v.population}  \u{1F9ED}${merchants} merchants`
    );
    notifyPlayer(
      player.name,
      `  \xA77${Math.round(v.townHallLocation.x)},${Math.round(v.townHallLocation.y)},${Math.round(v.townHallLocation.z)}  Iron:${v.resourceStorage.iron} Gold:${v.resourceStorage.gold}`
    );
  }
  const conductingSieges = getAllVillages().filter((v) => v.owner !== player.name).map((v) => ({ v, siege: getActiveSiege(v.id) })).filter(({ siege }) => siege?.attackerName === player.name);
  if (conductingSieges.length > 0) {
    notifyPlayer(player.name, `\xA7c\u2694 Your Active Sieges:`);
    for (const { v, siege } of conductingSieges) {
      const pct = Math.floor(siege.progress / 600 * 100);
      notifyPlayer(player.name, `  \xA7c${v.name}\xA7r (${v.owner}) \u2014 \xA76${pct}% captured`);
    }
  }
  if (kingdom?.wars && kingdom.wars.length > 0) {
    const warNames = kingdom.wars.map((id) => getKingdom(id)?.name ?? id).join(", ");
    notifyPlayer(player.name, `\xA7c\u{1F3F4} At war with: \xA7f${warNames}`);
  }
  if (kingdom?.alliances && kingdom.alliances.length > 0) {
    const allyNames = kingdom.alliances.map((id) => getKingdom(id)?.name ?? id).join(", ");
    notifyPlayer(player.name, `\xA7a\u{1F91D} Allied with: \xA7f${allyNames}`);
  }
}
function cmdSiege(player, villageNameOrId) {
  if (!villageNameOrId) {
    notifyPlayer(player.name, "\xA7cUsage: /scriptevent kc:siege <villageName or id>");
    return;
  }
  const myKingdom = getKingdomOf(player.name);
  if (!myKingdom) {
    notifyPlayer(player.name, "\xA7cYou must be in a kingdom to siege.");
    return;
  }
  const allVillages = getAllVillages();
  const target = allVillages.find(
    (v) => v.owner !== player.name && (v.name.toLowerCase().startsWith(villageNameOrId.toLowerCase()) || v.id.startsWith(villageNameOrId))
  );
  if (!target) {
    notifyPlayer(player.name, `\xA7cNo enemy village found matching "${villageNameOrId}".`);
    return;
  }
  if (!areAtWar(myKingdom.id, target.kingdomId)) {
    notifyPlayer(player.name, `\xA7cYou are not at war with \xA7b${target.name}\xA7c's kingdom.`);
    return;
  }
  initiateSiege(player, target.id);
}
function showBorderStatus(player) {
  const intrusions = getActiveBorderIntrusions().filter(
    (i) => i.playerName === player.name
  );
  if (intrusions.length === 0) {
    notifyPlayer(player.name, "\xA77You are not inside any enemy borders.");
    return;
  }
  notifyPlayer(player.name, "\xA7b=== Border Status ===");
  for (const intrusion of intrusions) {
    const village = getAllVillages().find((v) => v.id === intrusion.villageId);
    const name = village?.name ?? intrusion.villageId;
    const eligible = isSiegeEligible(player.name, intrusion.villageId);
    if (eligible) {
      notifyPlayer(player.name, `\xA7a\u2694 \xA7b${name}\xA7a \u2014 SIEGE ELIGIBLE. Use /scriptevent kc:siege ${name}`);
    } else {
      notifyPlayer(player.name, `\xA7e\u23F3 \xA7b${name}\xA7e \u2014 Countdown in progress. Remain inside to unlock siege.`);
    }
  }
  const myVillageIds = new Set(
    getAllVillages().filter((v) => v.owner === player.name).map((v) => v.id)
  );
  const incomingIntrusions = getActiveBorderIntrusions().filter(
    (i) => i.playerName !== player.name && myVillageIds.has(i.villageId)
  );
  if (incomingIntrusions.length > 0) {
    notifyPlayer(player.name, "\xA7c=== Enemy Intrusions Into Your Borders ===");
    for (const intrusion of incomingIntrusions) {
      const village = getAllVillages().find((v) => v.id === intrusion.villageId);
      const eligible = isSiegeEligible(intrusion.playerName, intrusion.villageId);
      const status = eligible ? "\xA74SIEGE ELIGIBLE" : "\xA7e counting down";
      notifyPlayer(
        player.name,
        `\xA7c${intrusion.playerName}\xA7r in \xA7b${village?.name ?? "a village"}\xA7r \u2014 ${status}`
      );
    }
  }
}
function cmdIntel(player, kingdomName) {
  if (!kingdomName) {
    notifyPlayer(player.name, "\xA7cUsage: /scriptevent kc:intel <kingdomName>");
    return;
  }
  const target = getAllKingdoms().find(
    (k) => k.name.toLowerCase() === kingdomName.toLowerCase()
  );
  if (!target) {
    notifyPlayer(player.name, `\xA7cKingdom "${kingdomName}" not found.`);
    return;
  }
  const myKingdom = getKingdomOf(player.name);
  const atWar = myKingdom ? areAtWar(myKingdom.id, target.id) : false;
  const strength = getKingdomStrength(target.id);
  const totalVillages = target.villageIds.length;
  const allVillages = getAllVillages();
  let totalPop = 0;
  let totalFood = 0;
  const villageNames = [];
  for (const vid of target.villageIds) {
    const v = allVillages.find((vv) => vv.id === vid);
    if (!v) continue;
    totalPop += v.population;
    totalFood += v.foodStorage;
    villageNames.push(v.name);
  }
  notifyPlayer(player.name, `\xA7b=== Intel: ${target.name} ===`);
  notifyPlayer(player.name, `\xA77King: \xA7f${target.king}  \xA77Villages: \xA7f${totalVillages}`);
  notifyPlayer(player.name, `\xA77Population: \xA7f${totalPop}  \xA77Food reserve: \xA7f${totalFood}`);
  notifyPlayer(player.name, `\xA77Military strength: \xA7c${strength}`);
  notifyPlayer(player.name, `\xA77Territories: \xA7f${villageNames.join(", ") || "none"}`);
  notifyPlayer(player.name, atWar ? `\xA74\u2694 You are AT WAR with this kingdom.` : `\xA7aNot currently at war.`);
  notifyPlayer(player.name, `\xA77Allies: \xA7f${target.alliances.length}  \xA77Wars: \xA7f${target.wars.length}`);
}
function cmdToggleAlerts(player) {
  const enabled = toggleAlerts(player.name);
  if (enabled) {
    notifyPlayer(player.name, `\xA7a\u{1F514} Incoming-attack alerts \xA7lENABLED\xA7r\xA7a. You will be notified of raids, border intrusions, and siege events.`);
  } else {
    notifyPlayer(player.name, `\xA77\u{1F515} Incoming-attack alerts \xA7lDISABLED\xA7r\xA77. You will not receive threat notifications until you run /kc:alerts again.`);
  }
}
function cmdCollect(player, idPrefix) {
  const village = resolveVillage(player, idPrefix);
  if (!village) return;
  const { alertsEnabled } = getPlayerSettings(player.name);
  collectFieldStorage(player, village);
  if (!alertsEnabled) {
    notifyPlayer(player.name, `\xA77Tip: alerts are currently OFF. Use \xA7f/scriptevent kc:alerts\xA77 to re-enable.`);
  }
}
function cmdBandits(player) {
  const summary = getBanditCampSummary();
  notifyPlayer(player.name, "\xA7c\u2550\u2550\u2550 Active Bandit Camps \u2550\u2550\u2550");
  for (const line of summary.split("\n")) notifyPlayer(player.name, line);
  const cities = getAllRebelCities();
  if (cities.length > 0) {
    notifyPlayer(player.name, `\xA74\u2550\u2550\u2550 Rebel Cities (${cities.length}) \u2550\u2550\u2550`);
    for (const city of cities) {
      notifyPlayer(player.name, `\xA74\u2694\u2694 Rebel City\xA7r  Strength: \xA7e${city.strength}\xA7r  Pos: \xA77${Math.round(city.location.x)},${Math.round(city.location.z)}`);
    }
  }
}
function cmdAchievements(player) {
  const ach = getPlayerAchievements(player.name);
  const send = (msg) => notifyPlayer(player.name, msg);
  send(`\xA76\u2550\u2550\u2550 ${player.name}'s Achievements \u2550\u2550\u2550`);
  send(`\xA7c\u2694 Bandit Camps Destroyed: \xA7e${ach.campsDestroyed}`);
  send(`\xA74\u2694\u2694 Rebel Cities Defeated: \xA7e${ach.citiesDefeated}`);
  const totalScore = ach.campsDestroyed * 10 + ach.citiesDefeated * 50;
  send(`\xA76\u2605 Combat Score: \xA7e${totalScore} pts`);
  if (ach.citiesDefeated === 0 && ach.campsDestroyed === 0) {
    send(`\xA77Tip: Destroy bandit camps and defeat rebel cities to earn achievements!`);
  } else if (ach.citiesDefeated >= 3) {
    send(`\xA7d\u2605\u2605\u2605 LEGEND \u2014 You have conquered 3 or more rebel cities!`);
  } else if (ach.campsDestroyed >= 10) {
    send(`\xA7b\u2605\u2605 WARLORD \u2014 10+ bandit camps cleared!`);
  }
}
function cmdTutorial(player, topic) {
  const send = (msg) => notifyPlayer(player.name, msg);
  const TOPICS = {
    start: "Getting Started",
    claim: "Getting Started",
    recruit: "Recruiting Troops",
    troops: "Recruiting Troops",
    upgrade: "Upgrades",
    upgrades: "Upgrades",
    farm: "Farming & Granary",
    granary: "Farming & Granary",
    siege: "Siege & Conquest",
    occupy: "Siege & Conquest",
    trade: "Trade Stations",
    rail: "Trade Stations",
    diplo: "Diplomacy",
    war: "Diplomacy"
  };
  if (!topic) {
    send("\xA7b\u2554\u2550\u2550\u2550\u2550\u2550\u2550 Kingdoms & Conquest \u2014 Tutorial \u2550\u2550\u2550\u2550\u2550\u2550\u2557");
    send("\xA7b\u2551  \xA7eRun a topic command to see the guide:\xA7b      \u2551");
    send("\xA7b\u2551  \xA7f/scriptevent kc:tutorial start\xA7b             \u2551");
    send("\xA7b\u2551  \xA7f/scriptevent kc:tutorial recruit\xA7b           \u2551");
    send("\xA7b\u2551  \xA7f/scriptevent kc:tutorial upgrade\xA7b           \u2551");
    send("\xA7b\u2551  \xA7f/scriptevent kc:tutorial farm\xA7b              \u2551");
    send("\xA7b\u2551  \xA7f/scriptevent kc:tutorial siege\xA7b             \u2551");
    send("\xA7b\u2551  \xA7f/scriptevent kc:tutorial trade\xA7b             \u2551");
    send("\xA7b\u2551  \xA7f/scriptevent kc:tutorial diplo\xA7b             \u2551");
    send("\xA7b\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D");
    return;
  }
  const resolvedName = TOPICS[topic.toLowerCase()];
  if (!resolvedName) {
    send(`\xA7cUnknown tutorial topic: "${topic}". Run /scriptevent kc:tutorial to see topics.`);
    return;
  }
  switch (resolvedName) {
    case "Getting Started":
      tutorialStart(player);
      break;
    case "Recruiting Troops":
      tutorialRecruit(player);
      break;
    case "Upgrades":
      tutorialUpgrades(player);
      break;
    case "Farming & Granary":
      tutorialFarm(player);
      break;
    case "Siege & Conquest":
      tutorialSiege(player);
      break;
    case "Trade Stations":
      tutorialTrade(player);
      break;
    case "Diplomacy":
      tutorialDiplo(player);
      break;
  }
}
function tutorialStart(player) {
  const s = (m) => notifyPlayer(player.name, m);
  s("\xA7b\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 Tutorial: Getting Started \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
  s("\xA7e Step 1 \u2014 Claim Your Village");
  s("\xA7f  \u2022 You start with a \xA7bTown Hall\xA7f block and \xA7b10 cobblestone\xA7f in your inventory.");
  s("\xA7f  \u2022 Place the Town Hall near \xA7b3+ villagers\xA7f \u2014 the starter village has them ready.");
  s("\xA7f  \u2022 A form appears \u2014 enter your Kingdom Name and Village Name.");
  s("\xA7f  \u2022 Costs \xA7b10 cobblestone\xA7f (consumed on claim). Your kingdom is created!");
  s("\xA7e Step 2 \u2014 Place Your Buildings");
  s("\xA7f  \u2022 Tap each building block to open its menu:");
  s("\xA7f    \xA7a\u{1F3DB} Town Hall\xA7f \u2014 kingdom overview, diplomacy, treasury, merchants");
  s("\xA7f    \xA7a\u2694 Barracks\xA7f  \u2014 recruit, train, upgrade troops");
  s("\xA7f    \xA7a\u{1F3EA} Market\xA7f   \u2014 sell food, buy seeds, upgrade market");
  s("\xA7f    \xA7a\u{1F528} Blacksmith\xA7f \u2014 upgrade weapon & armor tiers");
  s("\xA7f    \xA7a\u{1F33E} Granary\xA7f  \u2014 food storage, field harvest, field worker upgrades");
  s("\xA7f    \xA7a\u{1F48E} Treasury\xA7f \u2014 deposit emeralds, view balance");
  s("\xA7f    \xA7a\u{1F689} Trade Station\xA7f \u2014 dispatch & receive rail shipments");
  s("\xA7e Step 3 \u2014 Fund Your Village");
  s("\xA7f  \u2022 Hold \xA76emeralds\xA7f and tap your \xA7bTreasury\xA7f to deposit instantly.");
  s("\xA7f  \u2022 Hold \xA7afood\xA7f and tap your \xA7bGranary\xA7f to deposit instantly.");
  s("\xA7e Step 4 \u2014 Assign Workers");
  s("\xA7f  \u2022 Run: \xA7e/scriptevent kc:workers <villageId> f:5 w:2");
  s("\xA7f  \u2022 Farmers produce crops each game day. Workers build village speed.");
  s("\xA7f  \u2022 Available workers = population \u2212 troops assigned.");
  s("\xA77  Tip: run /scriptevent kc:status to see your village IDs.");
  s("\xA7b\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
}
function tutorialRecruit(player) {
  const s = (m) => notifyPlayer(player.name, m);
  s("\xA7b\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 Tutorial: Recruiting Troops \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
  s("\xA7e Method 1 \u2014 Barracks Menu (Tap the Barracks block)");
  s("\xA7f  Buttons you'll see:");
  s("\xA7f  \u2022 \xA7aRecruit City Guard\xA7f (5\u{1F48E}) \u2014 sturdy, cheap defenders");
  s("\xA7f  \u2022 \xA7aRecruit Spearman\xA7f (8\u{1F48E}) \u2014 medium infantry");
  s("\xA7f  \u2022 \xA7aRecruit Archer\xA7f (8\u{1F48E}) \u2014 ranged, good vs cavalry");
  s("\xA7f  \u2022 \xA7aRecruit Cavalry\xA7f (12\u{1F48E}) \u2014 fast, high damage");
  s("\xA7f  Troops are paid from the village \xA7btreasury\xA7f (emeralds).");
  s("\xA7e Method 2 \u2014 Command Line");
  s("\xA7f  /scriptevent kc:recruit <villageId> cityGuards 5");
  s("\xA7f  /scriptevent kc:recruit <villageId> spearmen 3");
  s("\xA7f  /scriptevent kc:recruit <villageId> archers 3");
  s("\xA7f  /scriptevent kc:recruit <villageId> cavalry 2");
  s("\xA7e Picking Up Troops (Deploy to Battle)");
  s("\xA7f  \u2022 Open Barracks \u2192 tap \xA7b\u2694 Pick Up Troops\xA7f.");
  s("\xA7f  \u2022 Use sliders to choose how many of each type to carry.");
  s("\xA7f  \u2022 Troops are added to your \xA7binventory\xA7f as troop tokens.");
  s("\xA7f  \u2022 Tokens are \xA74consumed\xA7f when you use them (recall scroll or deploy).");
  s("\xA7e Returning Troops");
  s("\xA7f  \u2022 Open Barracks \u2192 \xA7b\u{1F3F9} Return Troops to Barracks\xA7f.");
  s("\xA7f  \u2022 Returns all troop tokens in your inventory back to the garrison.");
  s("\xA7e Training Queue");
  s("\xA7f  \u2022 Open Barracks \u2192 \xA7b\u{1FA96} Train Troops\xA7f.");
  s("\xA7f  \u2022 Choose type & amount \u2014 they train over time and auto-join garrison.");
  s("\xA7f  \u2022 Queue holds up to 10 batches. Higher barracks level = faster training.");
  s("\xA7e Disbanding");
  s("\xA7f  \u2022 Open Barracks \u2192 \xA7cDisband 1 Guard/Spearman\xA7f.");
  s("\xA7f  \u2022 Or command: \xA7e/scriptevent kc:disband <id> cityGuards 2");
  s("\xA7b\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
}
function tutorialUpgrades(player) {
  const s = (m) => notifyPlayer(player.name, m);
  s("\xA7b\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 Tutorial: Upgrades \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
  s("\xA7e 1 \u2014 Barracks Upgrade");
  s("\xA7f  Tap Barracks \u2192 \xA7aUpgrade Barracks\xA7f (cost: level \xD7 15\u{1F48E}).");
  s("\xA7f  Each level increases training speed and troop capacity.");
  s("\xA7f  Or: \xA7e/scriptevent kc:barracks <villageId>");
  s("\xA7e 2 \u2014 Blacksmith: Weapons & Armor");
  s("\xA7f  Tap Blacksmith block \u2192 \xA7aUpgrade Weapons\xA7f or \xA7aUpgrade Armor\xA7f.");
  s("\xA7f  Each tier costs more emeralds. Higher tiers increase combat power.");
  s("\xA7f  Max Lv5 for each. View current tier: \xA7e/scriptevent kc:blacksmith <id>");
  s("\xA7e 3 \u2014 Market Upgrade");
  s("\xA7f  Tap Market \u2192 \xA7aUpgrade Market\xA7f (cost: level \xD7 20\u{1F48E}).");
  s("\xA7f  Higher level = more merchant slots + better seed variety.");
  s("\xA7e 4 \u2014 Field Worker Upgrade (Farming)");
  s("\xA7f  Tap Granary \u2192 \xA7a\u2B06 Upgrade Field Workers\xA7f (20\u{1F48E} per level).");
  s("\xA7f  Max Lv5. Each level adds +50 crops that NPCs auto-harvest per day.");
  s("\xA7f  Lv0 = 50 crops/day cap.  Lv5 = 300 crops/day cap.");
  s("\xA7e 5 \u2014 Population Growth (automatic)");
  s("\xA7f  Population grows automatically when food is plentiful.");
  s("\xA7f  More population = more available workers & troops.");
  s("\xA7e Upgrade Priority Suggestion:");
  s("\xA7f  Barracks Lv2 \u2192 Field Workers Lv2 \u2192 Blacksmith Lv2 \u2192 Market Lv2");
  s("\xA7f  Then push all to Lv5 for full power.");
  s("\xA7b\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
}
function tutorialFarm(player) {
  const s = (m) => notifyPlayer(player.name, m);
  s("\xA7b\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 Tutorial: Farming & Granary \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
  s("\xA7e How Food Works");
  s("\xA7f  Food sustains your population. Low food \u2192 shortage stages \u2192 population drop.");
  s("\xA7f  Two food pools:");
  s("\xA7f  \u2022 \xA7bfoodStorage\xA7f \u2014 village's direct food reserve (feeds population)");
  s("\xA7f  \u2022 \xA7bfieldStorage\xA7f \u2014 NPC field harvest buffer (you collect it to granary)");
  s("\xA7e Depositing Food (instant shortcut)");
  s("\xA7f  Hold any food item and \xA7aTap your Granary block\xA7f.");
  s("\xA7f  Deposits up to 64 at once directly to granary storage.");
  s("\xA7e NPC Auto-Harvest (every game day ~24000 ticks)");
  s("\xA7f  Assigned \xA7bfarmers\xA7f auto-harvest crops into \xA7bfieldStorage\xA7f buffer.");
  s("\xA7f  Daily cap = 50 + (Field Worker Level \xD7 50) crops.");
  s("\xA7f  You must collect field storage to move it into the village food supply.");
  s("\xA7e Collecting Field Harvest");
  s("\xA7f  Tap Granary \u2192 \xA7a\u{1F33E} Collect Field Harvest\xA7f \u2014 moves field buffer \u2192 your inventory.");
  s("\xA7f  Or command: \xA7e/scriptevent kc:collect <villageId>");
  s("\xA7e Viewing Field Storage");
  s("\xA7f  Tap Granary \u2192 \xA7a\u{1F4E6} View Field Storage\xA7f \u2014 shows what's buffered.");
  s("\xA7e Player Manual Harvest");
  s("\xA7f  Break a fully-grown crop inside your village territory.");
  s("\xA7f  Crops go \xA7adirectly into the granary\xA7f (not your inventory).");
  s("\xA7f  Use \xA7e/scriptevent kc:granary\xA7f to see current levels.");
  s("\xA7e Selling Food");
  s("\xA7f  Tap Market \u2192 \xA7a\u{1F33E} Sell Food (bulk)\xA7f \u2014 converts granary food to emeralds.");
  s("\xA7f  Or: \xA7a\u{1F4B0} Sell Food (abstract, 10\u{1F48E}/10)\xA7f \u2014 instant sale from village reserve.");
  s("\xA7e Seed Shop");
  s("\xA7f  Tap Market \u2192 \xA7a\u{1F331} Seed Shop\xA7f \u2014 buy seeds with emeralds from your inventory.");
  s("\xA7f  Plant them near your village. Farmers will auto-harvest when grown.");
  s("\xA7b\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
}
function tutorialSiege(player) {
  const s = (m) => notifyPlayer(player.name, m);
  s("\xA7b\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 Tutorial: Siege & Conquest \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
  s("\xA7e Step 1 \u2014 Declare War");
  s("\xA7f  You must be at war before sieging.");
  s("\xA7f  Command: \xA7e/scriptevent kc:war <KingdomName>");
  s("\xA7f  Example: \xA7e/scriptevent kc:war IronKingdom");
  s("\xA7f  See all kingdoms: \xA7e/scriptevent kc:kingdoms");
  s("\xA7e Step 2 \u2014 Enter Enemy Territory");
  s("\xA7f  Walk inside the border of an enemy village (within ~64 blocks of their Town Hall).");
  s("\xA7f  You'll see a \xA7ccountdown alert\xA7f \u2014 stay inside to become \xA74siege-eligible\xA7r.");
  s("\xA7f  Check your status: \xA7e/scriptevent kc:border");
  s("\xA7e Step 3 \u2014 Initiate Siege");
  s("\xA7f  Once eligible, run: \xA7e/scriptevent kc:siege <VillageName>");
  s("\xA7f  Example: \xA7e/scriptevent kc:siege Redfort");
  s("\xA7f  A siege begins. Progress builds over time (0\u2013600 ticks to capture).");
  s("\xA7e Step 4 \u2014 Siege Progress");
  s("\xA7f  \u2022 Remain inside the border to advance progress.");
  s("\xA7f  \u2022 Leaving pauses or slows the siege.");
  s("\xA7f  \u2022 Defenders can fight you off \u2014 getting killed stops the siege.");
  s("\xA7f  \u2022 Watch your siege % with: \xA7e/scriptevent kc:map");
  s("\xA7e Step 5 \u2014 Capture / Occupy");
  s("\xA7f  When siege reaches 100%, the village is \xA7bcaptured\xA7f and joins your kingdom.");
  s("\xA7f  \xA76Alternative \u2014 Break the Town Hall:\xA7f");
  s("\xA7f  \u2022 Breaking an \xA7cenemy\xA7f Town Hall while at war = \xA74instant capture\xA7f.");
  s("\xA7f  \u2022 The village owner is changed to you immediately.");
  s("\xA7f  \u2022 Defenders will be notified. Enemy troops at that village become neutral.");
  s("\xA7e Defending Against a Siege");
  s("\xA7f  \u2022 You'll receive \xA7calerts\xA7f (if alerts are on) when enemies enter your border.");
  s("\xA7f  \u2022 Return to your village and eliminate the invader to cancel the siege.");
  s("\xA7f  \u2022 Toggle alerts: \xA7e/scriptevent kc:alerts");
  s("\xA7e Peace & Alliance");
  s("\xA7f  End war: \xA7e/scriptevent kc:peace <KingdomName>");
  s("\xA7f  Form alliance: \xA7e/scriptevent kc:ally <KingdomName>");
  s("\xA7b\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
}
function tutorialTrade(player) {
  const s = (m) => notifyPlayer(player.name, m);
  s("\xA7b\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 Tutorial: Trade Stations \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
  s("\xA7e Setup");
  s("\xA7f  \u2022 Place a \xA7bkingdoms:trade_station\xA7f block in your village.");
  s("\xA7f  \u2022 Do the same in the village you want to trade with.");
  s("\xA7f  \u2022 Connect them with \xA7bMinecraft rail tracks\xA7f. No poles needed.");
  s("\xA7e Dispatching Resources (KC Shipment)");
  s("\xA7f  1. Tap your Trade Station \u2192 \xA7a\u{1F4E6} Dispatch Resources\xA7f.");
  s("\xA7f  2. Pick a destination village from the list.");
  s("\xA7f  3. Enter amounts for food, emeralds, iron, etc.");
  s("\xA7f  4. Resources are deducted immediately; a \xA7bchest minecart\xA7f spawns at your station.");
  s("\xA7f  5. Push the minecart onto the rail toward the destination.");
  s("\xA7f  6. When it arrives within ~5 blocks of the destination station, it delivers automatically.");
  s("\xA7e Dispatching Troops (KC Military)");
  s("\xA7f  Tap Trade Station \u2192 \xA7a\u{1F5E1} Dispatch Reinforcements\xA7f.");
  s("\xA7f  Works the same as resources \u2014 troop tokens are sent as a minecart cargo.");
  s("\xA7e Manual Delivery (Untagged Minecart)");
  s("\xA7f  \u2022 Place a chest minecart and fill it with items from your inventory.");
  s("\xA7f  \u2022 Push it to any allied village's trade station.");
  s("\xA7f  \u2022 The station auto-detects it and converts items:");
  s("\xA7f    \xA76Emerald \xA7f\u2192 treasury  |  \xA77Iron Ingot \xA7f\u2192 iron storage");
  s("\xA7f    \xA76Gold Ingot \xA7f\u2192 gold  |  \xA78Coal \xA7f\u2192 coal  |  \xA7aAny Log \xA7f\u2192 wood");
  s("\xA7f    \xA77Stone/Cobblestone \xA7f\u2192 stone  |  \xA7bDiamond \xA7f\u2192 diamonds");
  s("\xA7f    \xA7aFood items \xA7f\u2192 food storage");
  s("\xA7e Viewing Shipments");
  s("\xA7f  Tap Trade Station \u2192 \xA7a\u{1F682} Active Shipments\xA7f \u2014 see carts you dispatched.");
  s("\xA7f  Tap Trade Station \u2192 \xA7a\u{1F4CB} Trade History\xA7f \u2014 last 10 arrivals at this station.");
  s("\xA7e Resource Storage");
  s("\xA7f  Tap Trade Station \u2192 \xA7a\u{1F4CA} Resource Storage\xA7f \u2014 view iron/gold/coal/wood/stone balance.");
  s("\xA77  Tip: resources in storage are used automatically by production buildings.");
  s("\xA7b\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
}
function tutorialDiplo(player) {
  const s = (m) => notifyPlayer(player.name, m);
  s("\xA7b\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 Tutorial: Diplomacy \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
  s("\xA7e See All Kingdoms");
  s("\xA7f  /scriptevent kc:kingdoms \u2014 list all active kingdoms");
  s("\xA7f  /scriptevent kc:intel <KingdomName> \u2014 scout their strength & villages");
  s("\xA7e Declaring War");
  s("\xA7f  /scriptevent kc:war <KingdomName>");
  s("\xA7f  \u2022 Required before you can siege enemy villages.");
  s("\xA7f  \u2022 Both kingdoms are notified. Alert system fires for defenders.");
  s("\xA7e Making Peace");
  s("\xA7f  /scriptevent kc:peace <KingdomName>");
  s("\xA7f  \u2022 Ends all active sieges between the two kingdoms.");
  s("\xA7f  \u2022 Both sides receive the peace notification.");
  s("\xA7e Forming an Alliance");
  s("\xA7f  /scriptevent kc:ally <KingdomName>");
  s("\xA7f  \u2022 Allied kingdoms cannot siege each other.");
  s("\xA7f  \u2022 Trade between allies gets no restriction.");
  s("\xA7f  \u2022 Alliance remains until a war declaration breaks it.");
  s("\xA7e Diplomacy Menu (In-Game)");
  s("\xA7f  Tap your Town Hall \u2192 \xA7aDiplomacy\xA7f button.");
  s("\xA7f  Shows current wars, alliances, and quick action buttons.");
  s("\xA7e Kingdom Overview");
  s("\xA7f  Tap Town Hall \u2192 \xA7aKingdom Overview\xA7f.");
  s("\xA7f  Shows all your villages, total troops, food, treasury.");
  s("\xA7f  Or: \xA7e/scriptevent kc:kingdom");
  s("\xA7e Alert System");
  s("\xA7f  You receive warnings when enemies enter your territory.");
  s("\xA7f  Toggle on/off: \xA7e/scriptevent kc:alerts");
  s("\xA7b\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
}
function resolveVillage(player, idPrefix) {
  const myVillages = getAllVillages().filter((v) => v.owner === player.name);
  if (!idPrefix) {
    if (myVillages.length === 1) return myVillages[0];
    notifyPlayer(player.name, `\xA7cYou own multiple villages. Specify a village ID prefix. Use /scriptevent kc:villages`);
    return void 0;
  }
  const match = myVillages.find((v) => v.id.startsWith(idPrefix) || v.name.toLowerCase().startsWith(idPrefix.toLowerCase()));
  if (!match) {
    notifyPlayer(player.name, `\xA7cNo village found matching "${idPrefix}". Use /scriptevent kc:villages`);
    return void 0;
  }
  return match;
}

// src/systems/food.ts
init_storage();
function drainGranaryToFoodStorage(village) {
  let converted = 0;
  for (const [item, count] of Object.entries(village.granaryItems)) {
    const value = FOOD_ITEM_VALUES[item] ?? 0;
    if (value <= 0 || count <= 0) continue;
    const units = value * count;
    converted += units;
    removeFromGranary(village, item, count);
  }
  if (converted > 0) {
    village.foodStorage += converted;
  }
  return converted;
}
function getFoodProduction(village) {
  const farmerOutput = village.workers.farmers * 3;
  return farmerOutput;
}
function getFoodConsumption(village) {
  const soldiers = village.troops.cityGuards + village.troops.spearmen + village.troops.archers + village.troops.cavalry;
  const civilians = village.population - soldiers;
  return Math.max(0, civilians) * FOOD_PER_VILLAGER_PER_DAY + soldiers * FOOD_PER_SOLDIER_PER_DAY;
}
function tickFood(village) {
  const currentDay = getCurrentDay();
  if (!isNewDay(village.lastDayProcessed)) return false;
  const drained = drainGranaryToFoodStorage(village);
  if (drained > 0) {
    notifyPlayer(
      village.owner,
      `\xA77${drained} food units converted from \xA7b${village.name}\xA77 granary to daily reserve.`
    );
  }
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
function updateFoodShortageStage(village, dailyConsumption) {
  const prev = village.foodShortageStage;
  if (village.foodStorage <= 0 && dailyConsumption > 0) {
    const newStage = Math.min(4, village.foodShortageStage + 1);
    village.foodShortageStage = newStage;
    switch (newStage) {
      case 1:
        notifyPlayer(
          village.owner,
          `\xA7e\u26A0 Food warning in \xA7b${village.name}\xA7e! Stores are running low.`
        );
        break;
      case 2:
        notifyPlayer(
          village.owner,
          `\xA7c\u26A0 Food shortage in \xA7b${village.name}\xA7c! Population growth paused.`
        );
        break;
      case 3:
        village.prosperity = Math.max(0, village.prosperity - 10);
        notifyPlayer(
          village.owner,
          `\xA7c\u26A0 Severe food shortage in \xA7b${village.name}\xA7c! Morale dropping.`
        );
        break;
      case 4:
        notifyPlayer(
          village.owner,
          `\xA74\u26A0 FAMINE in \xA7b${village.name}\xA74! Population is dying!`
        );
        break;
    }
  } else if (village.foodStorage > dailyConsumption * 3) {
    if (village.foodShortageStage > 0) {
      village.foodShortageStage = Math.max(0, village.foodShortageStage - 1);
      if (prev > 0 && village.foodShortageStage === 0) {
        notifyPlayer(village.owner, `\xA7aFood stores recovered in \xA7b${village.name}\xA7a.`);
      }
    }
  }
}
function buyFood(village, amount) {
  const costPerUnit = 2;
  const total = amount * costPerUnit;
  if (village.treasury < total) return false;
  village.treasury -= total;
  village.foodStorage += amount;
  saveVillage(village);
  notifyPlayer(village.owner, `\xA7aBought ${amount} food for ${total}\u{1F48E} in \xA7b${village.name}\xA7a.`);
  return true;
}
function sellFood(village, amount) {
  if (!village.granaryLocation || !village.treasuryLocation) {
    notifyPlayer(village.owner, `\xA7c\u26A0 Market income halted in \xA7b${village.name}\xA7c \u2014 Granary and Treasury must both be active!`);
    return false;
  }
  const sellPricePerUnit = 1;
  if (village.foodStorage < amount) return false;
  village.foodStorage -= amount;
  village.treasury += amount * sellPricePerUnit;
  saveVillage(village);
  notifyPlayer(village.owner, `\xA7aSold ${amount} food for ${amount * sellPricePerUnit}\u{1F48E}.`);
  return true;
}
function processAllFood() {
  for (const village of getAllVillages()) {
    tickFood(village);
  }
}

// src/systems/population.ts
import { world as world11 } from "@minecraft/server";
init_storage();
var GROWTH_CHANCE = 0.6;
var MORTALITY_CHANCE = 0.4;
var HOUSING_UNIT_SIZE = 5;
function tickPopulation(village) {
  const popDay = village.lastPopulationDay ?? village.lastDayProcessed ?? 0;
  if (daysSince(popDay) < POPULATION_GROWTH_INTERVAL_DAYS) return;
  village.lastPopulationDay = getCurrentDay();
  if (village.foodShortageStage >= 4) {
    handlePopulationDecline(village);
    saveVillage(village);
    return;
  }
  if (village.foodShortageStage >= 2) {
    saveVillage(village);
    return;
  }
  const bedCapacity = village.housingCapacity ?? 0;
  if (bedCapacity <= village.population) {
    if (village.population < MAX_VILLAGE_POPULATION && village.owner) {
      notifyPlayer(village.owner, `\xA7e\uD83D\uDECF \xA7b${village.name}\xA7e needs more \xA7bhouse beds\xA7e to grow! Buy a \xA7bHouse\xA7e from the Building Shop.`);
    }
    saveVillage(village);
    return;
  }
  const canGrow = village.population < MAX_VILLAGE_POPULATION && village.foodStorage > 10;
  if (canGrow) {
    village.population += 1;
    village.workers.farmers = Math.max(
      village.workers.farmers,
      Math.floor(village.population * 0.3)
    );
    notifyPlayer(village.owner, `\xA7aNew villager in \xA7b${village.name}\xA7a! Population: ${village.population}/${MAX_VILLAGE_POPULATION}`);
  }
  saveVillage(village);
  spawnVillagerEntity(village);
}
function handlePopulationDecline(village) {
  if (village.population > 1 && Math.random() < MORTALITY_CHANCE) {
    village.population -= 1;
    const totalSoldiers = village.troops.cityGuards + village.troops.spearmen + village.troops.archers + village.troops.cavalry;
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
      `\xA7cPopulation declined in \xA7b${village.name}\xA7c due to starvation! (${village.population})`
    );
  }
}
function checkAndGrowStructures(village) {
  const builtUnits = village.builtHousingUnits ?? 0;
  const unitsNeeded = Math.floor(village.population / HOUSING_UNIT_SIZE);
  if (unitsNeeded <= builtUnits) return;
  placeFarmlandUnit(village);
  village.builtHousingUnits = builtUnits + 1;
  village.housingCapacity = Math.max(village.housingCapacity, (builtUnits + 1) * HOUSING_UNIT_SIZE + 5);
  saveVillage(village);
  notifyPlayer(village.owner, `\xA76New farm and housing unit built for \xA7b${village.name}\xA76! Capacity: ${village.housingCapacity}`);
}
function placeFarmlandUnit(village) {
  try {
    const dim = world11.getDimension(village.location.dimension);
    const builtUnits = village.builtHousingUnits ?? 0;
    const angle = builtUnits * 72 * Math.PI / 180;
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
  }
}
function findSolidY(dim, x, startY, z) {
  for (let y = startY; y >= startY - 10; y--) {
    try {
      const block = dim.getBlock({ x, y, z });
      if (block && block.typeId !== "minecraft:air" && block.typeId !== "minecraft:water") {
        return y;
      }
    } catch {
      break;
    }
  }
  return startY;
}
function spawnVillagerEntity(village) {
  const dim = world11.getDimension(village.location.dimension);
  const loc = village.townHallLocation;
  const query = {
    type: "minecraft:villager_v2",
    location: { x: loc.x, y: loc.y, z: loc.z },
    maxDistance: 64
  };
  const existingVillagers = dim.getEntities(query);
  if (existingVillagers.length < village.population) {
    try {
      const spawnX = loc.x + (Math.random() * 6 - 3);
      const spawnZ = loc.z + (Math.random() * 6 - 3);
      const entity = dim.spawnEntity("minecraft:villager_v2", {
        x: spawnX,
        y: loc.y,
        z: spawnZ
      });
      entity.setDynamicProperty("kc:village_id", village.id);
      entity.nameTag = `Villager [${village.name}]`;
      try {
        dim.runCommand(`event entity @e[type=minecraft:villager_v2,x=${Math.floor(spawnX)},y=${Math.floor(loc.y)},z=${Math.floor(spawnZ)},r=3] minecraft:become_farmer`);
      } catch {
      }
    } catch {
    }
  }
}
function processAllPopulation() {
  for (const village of getAllVillages()) {
    tickPopulation(village);
  }
}

// src/systems/market.ts
init_storage();
import { world as world12, ItemStack as ItemStack5, EntityInventoryComponent as EntityInventoryComponent6 } from "@minecraft/server";
var MERCHANT_OUTER_SPAWN_MIN = 70;
var MERCHANT_OUTER_SPAWN_MAX = 100;
var MERCHANT_MOVE_SPEED = 2;
var MERCHANT_ARRIVE_RADIUS = 2.5;
var MERCHANT_DANGER_RADIUS = 5;
var MERCHANT_SPAWN_INTERVAL = 1200;
var MERCHANT_STOCK_TEMPLATES = {
  common: {
    "minecraft:iron_ingot": 32,
    "minecraft:gold_ingot": 8,
    "minecraft:coal": 64
  },
  rare: {
    "minecraft:diamond": 5,
    "minecraft:iron_ingot": 48,
    "minecraft:gold_ingot": 16
  },
  food: {
    "minecraft:bread": 64,
    "minecraft:cooked_beef": 32,
    "minecraft:apple": 48
  },
  bobsFarm: {
    "twb_farm:garlic": 16,
    "twb_farm:onion": 12,
    "twb_farm:rice": 12,
    "twb_farm:broccoli": 10,
    "twb_farm:pineapple": 6
  }
};
var SEED_SHOP = [
  { itemId: "minecraft:wheat_seeds", label: "Wheat Seeds", quantityPerPurchase: 8, emeraldCost: 1 },
  { itemId: "minecraft:carrot", label: "Carrots (seed)", quantityPerPurchase: 8, emeraldCost: 2 },
  { itemId: "minecraft:potato", label: "Potatoes (seed)", quantityPerPurchase: 8, emeraldCost: 2 },
  { itemId: "minecraft:beetroot_seeds", label: "Beetroot Seeds", quantityPerPurchase: 8, emeraldCost: 1 },
  { itemId: "minecraft:pumpkin_seeds", label: "Pumpkin Seeds", quantityPerPurchase: 8, emeraldCost: 2 },
  { itemId: "minecraft:melon_seeds", label: "Melon Seeds", quantityPerPurchase: 8, emeraldCost: 2 },
  { itemId: "minecraft:nether_wart", label: "Nether Wart", quantityPerPurchase: 4, emeraldCost: 3 },
  { itemId: "twb_farm:garlic", label: "\xA72Garlic \xA77[Bob's Farm]", quantityPerPurchase: 6, emeraldCost: 2 },
  { itemId: "twb_farm:onion", label: "\xA72Onion \xA77[Bob's Farm]", quantityPerPurchase: 6, emeraldCost: 2 },
  { itemId: "twb_farm:rice", label: "\xA72Rice \xA77[Bob's Farm]", quantityPerPurchase: 8, emeraldCost: 2 },
  { itemId: "twb_farm:broccoli", label: "\xA72Broccoli \xA77[Bob's Farm]", quantityPerPurchase: 6, emeraldCost: 2 },
  { itemId: "twb_farm:cauliflower", label: "\xA72Cauliflower \xA77[Bob's Farm]", quantityPerPurchase: 6, emeraldCost: 3 },
  { itemId: "twb_farm:chili", label: "\xA72Chili \xA77[Bob's Farm]", quantityPerPurchase: 6, emeraldCost: 3 },
  { itemId: "twb_farm:eggplant", label: "\xA72Eggplant \xA77[Bob's Farm]", quantityPerPurchase: 6, emeraldCost: 2 },
  { itemId: "twb_farm:leek", label: "\xA72Leek \xA77[Bob's Farm]", quantityPerPurchase: 6, emeraldCost: 2 },
  { itemId: "twb_farm:grape", label: "\xA72Grape \xA77[Bob's Farm]", quantityPerPurchase: 8, emeraldCost: 3 },
  { itemId: "twb_farm:pineapple", label: "\xA72Pineapple \xA77[Bob's Farm]", quantityPerPurchase: 4, emeraldCost: 5 }
];
var FOOD_SELL_RATES = [
  { itemId: "minecraft:wheat", label: "Wheat", itemsPerEmerald: 3, minBatch: 6 },
  { itemId: "minecraft:carrot", label: "Carrot", itemsPerEmerald: 3, minBatch: 6 },
  { itemId: "minecraft:potato", label: "Potato", itemsPerEmerald: 3, minBatch: 6 },
  { itemId: "minecraft:baked_potato", label: "Baked Potato", itemsPerEmerald: 2, minBatch: 4 },
  { itemId: "minecraft:bread", label: "Bread", itemsPerEmerald: 1, minBatch: 2 },
  { itemId: "minecraft:beetroot", label: "Beetroot", itemsPerEmerald: 4, minBatch: 8 },
  { itemId: "minecraft:apple", label: "Apple", itemsPerEmerald: 2, minBatch: 4 },
  { itemId: "minecraft:cooked_beef", label: "Cooked Beef", itemsPerEmerald: 1, minBatch: 2 },
  { itemId: "minecraft:cooked_porkchop", label: "Cooked Pork", itemsPerEmerald: 1, minBatch: 2 },
  { itemId: "minecraft:cooked_chicken", label: "Cooked Chicken", itemsPerEmerald: 1, minBatch: 2 },
  { itemId: "minecraft:cooked_mutton", label: "Cooked Mutton", itemsPerEmerald: 1, minBatch: 2 },
  { itemId: "minecraft:cooked_salmon", label: "Cooked Salmon", itemsPerEmerald: 1, minBatch: 2 },
  { itemId: "minecraft:melon_slice", label: "Melon Slice", itemsPerEmerald: 4, minBatch: 8 },
  { itemId: "twb_farm:garlic", label: "Garlic [Bob's Farm]", itemsPerEmerald: 3, minBatch: 6 },
  { itemId: "twb_farm:onion", label: "Onion [Bob's Farm]", itemsPerEmerald: 3, minBatch: 6 },
  { itemId: "twb_farm:rice", label: "Rice [Bob's Farm]", itemsPerEmerald: 3, minBatch: 6 },
  { itemId: "twb_farm:broccoli", label: "Broccoli [Bob's Farm]", itemsPerEmerald: 2, minBatch: 4 },
  { itemId: "twb_farm:cauliflower", label: "Cauliflower [Bob's Farm]", itemsPerEmerald: 2, minBatch: 4 },
  { itemId: "twb_farm:chili", label: "Chili [Bob's Farm]", itemsPerEmerald: 2, minBatch: 4 },
  { itemId: "twb_farm:eggplant", label: "Eggplant [Bob's Farm]", itemsPerEmerald: 2, minBatch: 4 },
  { itemId: "twb_farm:leek", label: "Leek [Bob's Farm]", itemsPerEmerald: 2, minBatch: 4 },
  { itemId: "twb_farm:grape", label: "Grape [Bob's Farm]", itemsPerEmerald: 2, minBatch: 4 },
  { itemId: "twb_farm:pineapple", label: "Pineapple [Bob's Farm]", itemsPerEmerald: 1, minBatch: 2 }
];
function getMaxMerchants(village) {
  return Math.floor(village.marketLevel * 3 + village.population / 8);
}
function tickAllMerchantsSpawn(currentTick) {
  if (currentTick % MERCHANT_SPAWN_INTERVAL !== 0) return;
  for (const village of getAllVillages()) {
    cleanupDespawnedMerchants(village);
    if (village.activeMerchants.length < getMaxMerchants(village)) {
      spawnMerchant(village);
    }
  }
}
function tickAllMerchantMovement() {
  for (const village of getAllVillages()) {
    if (village.activeMerchants.length === 0) continue;
    tickMerchantMovement(village);
  }
}
var TRADE_CART_FOLLOW_DIST = 3.5;
var TRADE_CART_SPEED = 0.2;
var TRADE_CART_ABANDON_DIST = 200;
var _lastCartTick = -4;
function tickTradeCartMovement() {
  const _ctick = getCurrentTick();
  if (_ctick - _lastCartTick < 4) return;
  _lastCartTick = _ctick;
  for (const dimId of ["overworld", "nether", "the_end"]) {
    try {
      const dim = world16.getDimension(dimId);
      const carts = dim.getEntities({ type: "kingdoms:trade_cart" });
      if (carts.length === 0) continue;
      const merchants = dim.getEntities({ type: "kingdoms:merchant" });
      for (const cart of carts) {
        try {
          if (merchants.length === 0) continue;
          let nearest = null;
          let nearestDist = TRADE_CART_ABANDON_DIST;
          const merchantId = cart.getDynamicProperty("kc:merchant_id");
          for (const m of merchants) {
            const dx2 = m.location.x - cart.location.x;
            const dz2 = m.location.z - cart.location.z;
            const dist = Math.sqrt(dx2 * dx2 + dz2 * dz2);
            if (merchantId && m.id === merchantId) { nearest = m; nearestDist = dist; break; }
            if (dist < nearestDist) { nearestDist = dist; nearest = m; }
          }
          if (!nearest) continue;
          if (nearestDist <= TRADE_CART_FOLLOW_DIST) continue;
          const dx = nearest.location.x - cart.location.x;
          const dz = nearest.location.z - cart.location.z;
          const d2d = Math.sqrt(dx * dx + dz * dz);
          if (d2d < 0.1) continue;
          const ratio = TRADE_CART_SPEED / d2d;
          cart.teleport(
            { x: cart.location.x + dx * ratio, y: nearest.location.y, z: cart.location.z + dz * ratio },
            { dimension: dim }
          );
        } catch {}
      }
    } catch {}
  }
}
function spawnMerchant(village) {
  const dim = world12.getDimension(village.location.dimension);
  const marketLoc = village.tradeStationLocation ?? village.townHallLocation;
  const templates = Object.keys(MERCHANT_STOCK_TEMPLATES);
  const templateKey = templates[Math.floor(Math.random() * templates.length)];
  const stock = { ...MERCHANT_STOCK_TEMPLATES[templateKey] };
  const angle = Math.random() * Math.PI * 2;
  const spawnDist = MERCHANT_OUTER_SPAWN_MIN + Math.random() * (MERCHANT_OUTER_SPAWN_MAX - MERCHANT_OUTER_SPAWN_MIN);
  const spawnX = marketLoc.x + Math.cos(angle) * spawnDist;
  const spawnZ = marketLoc.z + Math.sin(angle) * spawnDist;
  try {
    const entity = dim.spawnEntity("kingdoms:merchant", { x: spawnX, y: marketLoc.y, z: spawnZ });
    const merchantData = {
      entityId: entity.id,
      stock,
      destinationVillageId: village.id,
      currentPoleIndex: 0,
      arrived: false,
      lastNotifyDist: -1
    };
    entity.setDynamicProperty("kc:merchant_data", JSON.stringify(merchantData));
    entity.setDynamicProperty("kc:village_id", village.id);
    const hasMarket = !!village.tradeStationLocation;
    entity.nameTag = `\xA76Merchant \xA77[\u2192 ${village.name}${hasMarket ? " Market" : ""}]`;
    village.activeMerchants.push(merchantData);
    saveVillage(village);
    notifyPlayer(
      village.owner,
      `\xA76\uD83D\uDED2 A travelling merchant has set out for \xA7b${village.name}\xA76's ${hasMarket ? "market" : "town hall"}! (${Math.round(spawnDist)} blocks away \u2014 Stock: ${Object.keys(stock).length} types)`
    );
  } catch {
  }
}
function tickMerchantMovement(village) {
  const dim = world12.getDimension(village.location.dimension);
  const poles = village.tradePoles ?? [];
  const finalDest = village.tradeStationLocation ?? village.townHallLocation;
  const destLabel = village.tradeStationLocation ? "market" : "town hall";
  let changed = false;
  for (const merchantData of village.activeMerchants) {
    try {
      const entities = dim.getEntities({ type: "kingdoms:merchant" });
      const entity = entities.find((e) => e.id === merchantData.entityId);
      if (!entity) continue;
      if (merchantData.arrived) {
        const dx0 = finalDest.x - entity.location.x;
        const dz0 = finalDest.z - entity.location.z;
        if (Math.sqrt(dx0 * dx0 + dz0 * dz0) > MERCHANT_ARRIVE_RADIUS * 3) {
          entity.teleport({ x: finalDest.x, y: finalDest.y, z: finalDest.z }, { keepVelocity: false });
        }
        continue;
      }
      const loc = entity.location;
      let target;
      let onPole = false;
      if (poles.length > 0 && merchantData.currentPoleIndex < poles.length) {
        target = poles[merchantData.currentPoleIndex].location;
        onPole = true;
      } else {
        target = finalDest;
      }
      const dx = target.x - loc.x;
      const dz = target.z - loc.z;
      const dist2D = Math.sqrt(dx * dx + dz * dz);
      if (dist2D < MERCHANT_ARRIVE_RADIUS) {
        if (onPole) {
          merchantData.currentPoleIndex++;
          changed = true;
        } else {
          merchantData.arrived = true;
          changed = true;
          entity.nameTag = `\xA76Merchant \xA77[${village.name} Market]`;
          notifyPlayer(village.owner, `\xA76\uD83D\uDED2 A merchant has arrived at \xA7b${village.name}\xA76's ${destLabel} safely! Ready to trade.`);
          entity.teleport({ x: finalDest.x, y: finalDest.y, z: finalDest.z }, { keepVelocity: false });
        }
        continue;
      }
      const dxFinal = finalDest.x - loc.x;
      const dzFinal = finalDest.z - loc.z;
      const distToFinal = Math.sqrt(dxFinal * dxFinal + dzFinal * dzFinal);
      const notifyBucket = Math.floor(distToFinal / 30);
      if (merchantData.lastNotifyDist === void 0 || merchantData.lastNotifyDist === -1) merchantData.lastNotifyDist = notifyBucket + 99;
      if (notifyBucket < merchantData.lastNotifyDist) {
        merchantData.lastNotifyDist = notifyBucket;
        changed = true;
        if (distToFinal < 25) {
          notifyPlayer(village.owner, `\xA76\uD83D\uDED2 Merchant is approaching \xA7b${village.name}\xA76's ${destLabel}! (~${Math.round(distToFinal)}m away)`);
        } else if (Math.random() < 0.35) {
          const poleInfo = onPole ? ` \xA77(following trade road)` : "";
          notifyPlayer(village.owner, `\xA77\uD83D\uDED2 Merchant en route to \xA7b${village.name}\xA77 ${destLabel}${poleInfo} \u2014 ${Math.round(distToFinal)}m remaining.`);
        }
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
          if (Math.random() < 0.06) {
            notifyPlayer(village.owner, `\xA7c\u26A0 MERCHANT UNDER ATTACK! Heading to \xA7b${village.name}\xA7c ${destLabel} \u2014 ${Math.round(distToFinal)}m away! Send guards!`);
          }
        }
      } catch {
      }
      if (onPole) {
        try {
          const nearbyGuards = dim.getEntities({ location: loc, maxDistance: 20, type: "kingdoms:city_guard" });
          for (const guard of nearbyGuards) {
            const guardOwner = guard.getDynamicProperty("kc:owner");
            if (guardOwner === village.owner || guard.getDynamicProperty("kc:village_id") === village.id) {
              const guardHostiles = dim.getEntities({ location: guard.location, maxDistance: 16, families: ["monster"] });
              for (const h of guardHostiles) { try { guard.target = h; } catch {} }
            }
          }
        } catch {}
      }
    } catch {
    }
  }
  if (changed) saveVillage(village);
}
function cleanupDespawnedMerchants(village) {
  const dim = world12.getDimension(village.location.dimension);
  const allEntities = dim.getEntities({ type: "kingdoms:merchant" });
  const activeIds = new Set(allEntities.map((e) => e.id));
  const before = village.activeMerchants.length;
  village.activeMerchants = village.activeMerchants.filter((m) => activeIds.has(m.entityId));
  if (village.activeMerchants.length < before) {
    saveVillage(village);
  }
}
function tradeMerchant(village, merchantEntityId, itemTypeId, buyAmount) {
  const merchantIdx = village.activeMerchants.findIndex((m) => m.entityId === merchantEntityId);
  if (merchantIdx === -1) return false;
  const merchant = village.activeMerchants[merchantIdx];
  const availableStock = merchant.stock[itemTypeId] ?? 0;
  if (availableStock < buyAmount) {
    notifyPlayer(village.owner, `\xA7cMerchant only has ${availableStock} of that item.`);
    return false;
  }
  const pricePer = getMerchantPrice(itemTypeId);
  const totalCost = pricePer * buyAmount;
  if (village.treasury < totalCost) {
    notifyPlayer(village.owner, `\xA7cNeed ${totalCost}\u{1F48E} to buy ${buyAmount}x ${itemTypeId}.`);
    return false;
  }
  village.treasury -= totalCost;
  merchant.stock[itemTypeId] -= buyAmount;
  if (merchant.stock[itemTypeId] <= 0) {
    delete merchant.stock[itemTypeId];
  }
  routeMerchantGoods(village, itemTypeId, buyAmount);
  const totalRemaining = Object.values(merchant.stock).reduce((a, b) => a + b, 0);
  if (totalRemaining <= 0) {
    removeMerchant(village, merchantEntityId);
  } else {
    saveVillage(village);
  }
  return true;
}
function routeMerchantGoods(village, itemTypeId, amount) {
  const matKey = MERCHANT_MATERIAL_MAP[itemTypeId];
  if (matKey) {
    village.resourceStorage ?? (village.resourceStorage = { ...EMPTY_RESOURCE_STORAGE });
    village.resourceStorage[matKey] = (village.resourceStorage[matKey] ?? 0) + amount;
    notifyPlayer(village.owner, `\xA77Merchant delivered: ${amount}x ${itemTypeId.replace("minecraft:", "")} \u2192 \xA7bMaterial Storage`);
    return;
  }
  if (FOOD_SELL_RATES?.find?.((e) => e.itemId === itemTypeId)) {
    village.granaryItems ?? (village.granaryItems = {});
    village.granaryItems[itemTypeId] = (village.granaryItems[itemTypeId] ?? 0) + amount;
    notifyPlayer(village.owner, `\xA77Merchant delivered: ${amount}x ${itemTypeId.replace("minecraft:", "")} \u2192 \xA7aGranary`);
    return;
  }
  if (ALL_ARMORY_ITEMS?.has?.(itemTypeId)) {
    village.armoryItems ?? (village.armoryItems = {});
    village.armoryItems[itemTypeId] = (village.armoryItems[itemTypeId] ?? 0) + amount;
    notifyPlayer(village.owner, `\xA77Merchant delivered: ${amount}x ${itemTypeId.replace("minecraft:", "")} \u2192 \xA76Armory`);
  }
}
function removeMerchant(village, merchantEntityId) {
  const dim = world12.getDimension(village.location.dimension);
  try {
    const entities = dim.getEntities({ type: "kingdoms:merchant" });
    const entity = entities.find((e) => e.id === merchantEntityId);
    if (entity) entity.remove();
  } catch {
  }
  village.activeMerchants = village.activeMerchants.filter((m) => m.entityId !== merchantEntityId);
  saveVillage(village);
}
function getMerchantPrice(itemTypeId) {
  const prices = {
    "minecraft:iron_ingot": 1,
    "minecraft:gold_ingot": 3,
    "minecraft:diamond": 8,
    "minecraft:coal": 1,
    "minecraft:bread": 1,
    "minecraft:cooked_beef": 1,
    "minecraft:apple": 1
  };
  return prices[itemTypeId] ?? 2;
}
function upgradeMarket(village) {
  if (village.marketLevel >= 5) {
    notifyPlayer(village.owner, "\xA7cMarket already at maximum level.");
    return false;
  }
  const cost = village.marketLevel * 20;
  if (village.treasury < cost) {
    notifyPlayer(village.owner, `\xA7cNeed ${cost}\u{1F48E} to upgrade market.`);
    return false;
  }
  village.treasury -= cost;
  village.marketLevel++;
  saveVillage(village);
  notifyPlayer(village.owner, `\xA7aMarket upgraded to level \xA7b${village.marketLevel}\xA7a in \xA7b${village.name}\xA7a!`);
  return true;
}
function buySeedsFromMarket(player, village, entry) {
  if (village.marketLevel < 1) {
    notifyPlayer(player.name, "\xA7cBuild and upgrade the market first.");
    return false;
  }
  const inv = player.getComponent(EntityInventoryComponent6.componentId);
  if (!inv?.container) return false;
  const container = inv.container;
  let emeraldsHeld = 0;
  for (let i = 0; i < container.size; i++) {
    const slot = container.getItem(i);
    if (slot?.typeId === "minecraft:emerald") emeraldsHeld += slot.amount;
  }
  if (emeraldsHeld < entry.emeraldCost) {
    notifyPlayer(player.name, `\xA7cNeed \xA76${entry.emeraldCost} emeralds\xA7c (you have ${emeraldsHeld}) to buy ${entry.quantityPerPurchase}x ${entry.label}.`);
    return false;
  }
  let emeraldsToRemove = entry.emeraldCost;
  for (let i = 0; i < container.size && emeraldsToRemove > 0; i++) {
    const slot = container.getItem(i);
    if (!slot || slot.typeId !== "minecraft:emerald") continue;
    const take = Math.min(slot.amount, emeraldsToRemove);
    emeraldsToRemove -= take;
    if (take >= slot.amount) {
      container.setItem(i, void 0);
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
      container.setItem(i, new ItemStack5(entry.itemId, give));
      remaining -= give;
    } else if (slot.typeId === entry.itemId && slot.amount < 64) {
      const give = Math.min(remaining, 64 - slot.amount);
      slot.amount += give;
      container.setItem(i, slot);
      remaining -= give;
    }
  }
  if (remaining > 0) {
    notifyPlayer(player.name, "\xA7cInventory full \u2014 some seeds couldn't be delivered.");
  }
  notifyPlayer(player.name, `\xA7aBought \xA7b${entry.quantityPerPurchase - remaining}x ${entry.label}\xA7a for \xA76${entry.emeraldCost}\u{1F48E}\xA7a.`);
  return true;
}
function sellFoodBulk(player, village, entry, batches) {
  if (!village.granaryLocation || !village.treasuryLocation) {
    notifyPlayer(player.name, `\xA7c\u26A0 Market income halted \u2014 Granary and Treasury must both be active in \xA7b${village.name}\xA7c first!`);
    return false;
  }
  const totalItems = entry.itemsPerEmerald * batches;
  const emeraldsEarned = batches;
  if (batches < 1) {
    notifyPlayer(player.name, "\xA7cMinimum 1 batch.");
    return false;
  }
  const granaryHas = village.granaryItems[entry.itemId] ?? 0;
  const inv = player.getComponent(EntityInventoryComponent6.componentId);
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
      `\xA7cNeed \xA7b${totalItems}x ${entry.label}\xA7c to sell (granary: ${granaryHas}, inventory: ${inventoryHas}).`
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
        container.setItem(i, void 0);
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
    `\xA7aSold \xA7b${totalItems}x ${entry.label}\xA7a \u2192 \xA76+${emeraldsEarned}\u{1F48E}\xA7a added to \xA7b${village.name}\xA7a treasury. (Total: \xA76${village.treasury}\u{1F48E}\xA7a)`
  );
  return true;
}

// src/systems/trade.ts
init_storage();
import { world as world13, EntityInventoryComponent as EntityInventoryComponent7 } from "@minecraft/server";

// src/systems/tradeStation.ts
init_storage();
function registerTradeStation(village, location) {
  village.hasTradeStation = true;
  village.tradeStationLocation = { x: location.x, y: location.y, z: location.z };
  if (!village.resourceStorage) {
    village.resourceStorage = { ...EMPTY_RESOURCE_STORAGE };
  }
  saveVillage(village);
  notifyPlayer(village.owner, `\xA7aTrade Station built in \xA7b${village.name}\xA7a. Railway logistics enabled!`);
}
function removeTradeStation(village) {
  village.hasTradeStation = false;
  village.tradeStationLocation = void 0;
  saveVillage(village);
  notifyPlayer(village.owner, `\xA7cTrade Station destroyed! \xA7b${village.name}\xA7c can no longer send or receive railway shipments.`);
}
function getConnectedVillages(village) {
  return getAllVillages().filter(
    (v) => v.id !== village.id && v.hasTradeStation
  );
}
function getTradeStationSummary(village) {
  const v = getVillage(village.id) ?? village;
  const rs = v.resourceStorage ?? { ...EMPTY_RESOURCE_STORAGE };
  const t = v.troops;
  const resourceLines = Object.keys(RESOURCE_LABELS).filter((k) => (rs[k] ?? 0) > 0).map((k) => `  ${RESOURCE_LABELS[k]}: ${rs[k]}`).join("\n") || "  (none)";
  const activeCarts = v.activeCarts.filter((c) => c.isRailShipment).length;
  return [
    `\xA7b${v.name}\xA7r \u2014 Trade Station`,
    `\xA77Population: \xA7f${v.population}/${v.housingCapacity}`,
    `\xA77Treasury: \xA76${v.treasury}\u{1F48E}`,
    `\xA77Food: \xA7a${v.foodStorage}\u{1F33E}`,
    ``,
    `\xA77\u2500\u2500 Resource Storage \u2500\u2500`,
    resourceLines,
    ``,
    `\xA77\u2500\u2500 Barracks \u2500\u2500`,
    `  City Guards: ${t.cityGuards}  Spearmen: ${t.spearmen}`,
    `  Archers: ${t.archers}  Cavalry: ${t.cavalry}`,
    ``,
    `\xA77Active Rail Shipments: \xA7f${activeCarts}`
  ].join("\n");
}
function getCargoSummary(cargo) {
  const parts = [];
  if (cargo.food > 0) parts.push(`${cargo.food}\u{1F33E}`);
  if (cargo.emeralds > 0) parts.push(`${cargo.emeralds}\u{1F48E}`);
  if (cargo.iron > 0) parts.push(`${cargo.iron} Iron`);
  if (cargo.gold > 0) parts.push(`${cargo.gold} Gold`);
  if (cargo.coal > 0) parts.push(`${cargo.coal} Coal`);
  if (cargo.wood > 0) parts.push(`${cargo.wood} Wood`);
  if (cargo.stone > 0) parts.push(`${cargo.stone} Stone`);
  if (cargo.diamonds > 0) parts.push(`${cargo.diamonds} Diamonds`);
  const troops = cargo.troops ?? {};
  if ((troops.cityGuards ?? 0) > 0) parts.push(`${troops.cityGuards} Guards`);
  if ((troops.spearmen ?? 0) > 0) parts.push(`${troops.spearmen} Spearmen`);
  if ((troops.archers ?? 0) > 0) parts.push(`${troops.archers} Archers`);
  if ((troops.cavalry ?? 0) > 0) parts.push(`${troops.cavalry} Cavalry`);
  return parts.join(", ") || "Empty";
}
function ensureResourceStorage(village) {
  if (!village.resourceStorage) {
    village.resourceStorage = { ...EMPTY_RESOURCE_STORAGE };
  }
}

// src/systems/trade.ts
var TRADE_STATION_DETECT_RADIUS = 5;
var STATION_TICK_INTERVAL = 40;
var lastStationTick = 0;
var ITEM_RESOURCE_MAP = {
  "minecraft:emerald": { target: "treasury" },
  "minecraft:iron_ingot": { target: "iron" },
  "minecraft:gold_ingot": { target: "gold" },
  "minecraft:coal": { target: "coal" },
  "minecraft:charcoal": { target: "coal" },
  "minecraft:oak_log": { target: "wood" },
  "minecraft:spruce_log": { target: "wood" },
  "minecraft:birch_log": { target: "wood" },
  "minecraft:jungle_log": { target: "wood" },
  "minecraft:acacia_log": { target: "wood" },
  "minecraft:dark_oak_log": { target: "wood" },
  "minecraft:mangrove_log": { target: "wood" },
  "minecraft:stone": { target: "stone" },
  "minecraft:cobblestone": { target: "stone" },
  "minecraft:diamond": { target: "diamonds" }
};
function sendTradeCart(fromVillageId, toVillageId, cargo) {
  const from = getVillage(fromVillageId);
  const to = getVillage(toVillageId);
  if (!from || !to) return false;
  if (from.treasury < cargo.emeralds) {
    notifyPlayer(from.owner, `\xA7cNot enough emeralds. Have: ${from.treasury}, Need: ${cargo.emeralds}.`);
    return false;
  }
  if (from.foodStorage < cargo.food) {
    notifyPlayer(from.owner, `\xA7cNot enough food. Have: ${from.foodStorage}, Need: ${cargo.food}.`);
    return false;
  }
  from.treasury -= cargo.emeralds;
  from.foodStorage -= cargo.food;
  ensureResourceStorage(to);
  to.treasury += cargo.emeralds;
  to.foodStorage += cargo.food;
  saveVillage(from);
  saveVillage(to);
  const summary = getCargoSummary(cargo);
  notifyPlayer(from.owner, `\xA7a\u{1F4E6} Transfer sent to \xA7b${to.name}\xA7a. [${summary}]`);
  if (to.owner !== from.owner) {
    notifyPlayer(to.owner, `\xA7a\u{1F4E6} Transfer received from \xA7b${from.name}\xA7a! [${summary}]`);
  }
  return true;
}
function sendRailShipment(fromVillageId, toVillageId, cargo) {
  const from = getVillage(fromVillageId);
  const to = getVillage(toVillageId);
  if (!from || !to) return false;
  if (!from.hasTradeStation) {
    notifyPlayer(from.owner, `\xA7c\xA7b${from.name}\xA7c has no Trade Station.`);
    return false;
  }
  if (!to.hasTradeStation) {
    notifyPlayer(from.owner, `\xA7c\xA7b${to.name}\xA7c has no Trade Station to receive shipments.`);
    return false;
  }
  if (from.treasury < cargo.emeralds) {
    notifyPlayer(from.owner, `\xA7cNot enough emeralds. Have: ${from.treasury}, Need: ${cargo.emeralds}.`);
    return false;
  }
  if (from.foodStorage < cargo.food) {
    notifyPlayer(from.owner, `\xA7cNot enough food. Have: ${from.foodStorage}, Need: ${cargo.food}.`);
    return false;
  }
  ensureResourceStorage(from);
  const rs = from.resourceStorage;
  if ((cargo.iron ?? 0) > rs.iron) {
    notifyPlayer(from.owner, `\xA7cNot enough Iron.`);
    return false;
  }
  if ((cargo.gold ?? 0) > rs.gold) {
    notifyPlayer(from.owner, `\xA7cNot enough Gold.`);
    return false;
  }
  if ((cargo.coal ?? 0) > rs.coal) {
    notifyPlayer(from.owner, `\xA7cNot enough Coal.`);
    return false;
  }
  if ((cargo.wood ?? 0) > rs.wood) {
    notifyPlayer(from.owner, `\xA7cNot enough Wood.`);
    return false;
  }
  if ((cargo.stone ?? 0) > rs.stone) {
    notifyPlayer(from.owner, `\xA7cNot enough Stone.`);
    return false;
  }
  if ((cargo.diamonds ?? 0) > rs.diamonds) {
    notifyPlayer(from.owner, `\xA7cNot enough Diamonds.`);
    return false;
  }
  const troops = cargo.troops ?? {};
  if ((troops.cityGuards ?? 0) > from.troops.cityGuards) {
    notifyPlayer(from.owner, `\xA7cNot enough City Guards.`);
    return false;
  }
  if ((troops.spearmen ?? 0) > from.troops.spearmen) {
    notifyPlayer(from.owner, `\xA7cNot enough Spearmen.`);
    return false;
  }
  if ((troops.archers ?? 0) > from.troops.archers) {
    notifyPlayer(from.owner, `\xA7cNot enough Archers.`);
    return false;
  }
  if ((troops.cavalry ?? 0) > from.troops.cavalry) {
    notifyPlayer(from.owner, `\xA7cNot enough Cavalry.`);
    return false;
  }
  from.treasury -= cargo.emeralds;
  from.foodStorage -= cargo.food;
  rs.iron -= cargo.iron ?? 0;
  rs.gold -= cargo.gold ?? 0;
  rs.coal -= cargo.coal ?? 0;
  rs.wood -= cargo.wood ?? 0;
  rs.stone -= cargo.stone ?? 0;
  rs.diamonds -= cargo.diamonds ?? 0;
  from.troops.cityGuards -= troops.cityGuards ?? 0;
  from.troops.spearmen -= troops.spearmen ?? 0;
  from.troops.archers -= troops.archers ?? 0;
  from.troops.cavalry -= troops.cavalry ?? 0;
  const dim = world13.getDimension(from.location.dimension);
  const spawnLoc = from.tradeStationLocation ?? from.townHallLocation;
  let cartEntity;
  try {
    cartEntity = dim.spawnEntity("minecraft:chest_minecart", {
      x: spawnLoc.x + 0.5,
      y: spawnLoc.y + 0.5,
      z: spawnLoc.z + 0.5
    });
  } catch {
    from.treasury += cargo.emeralds;
    from.foodStorage += cargo.food;
    rs.iron += cargo.iron ?? 0;
    rs.gold += cargo.gold ?? 0;
    rs.coal += cargo.coal ?? 0;
    rs.wood += cargo.wood ?? 0;
    rs.stone += cargo.stone ?? 0;
    rs.diamonds += cargo.diamonds ?? 0;
    from.troops.cityGuards += troops.cityGuards ?? 0;
    from.troops.spearmen += troops.spearmen ?? 0;
    from.troops.archers += troops.archers ?? 0;
    from.troops.cavalry += troops.cavalry ?? 0;
    saveVillage(from);
    notifyPlayer(from.owner, "\xA7cCould not spawn minecart (chunk not loaded). Resources refunded.");
    return false;
  }
  const isMilitary = Object.values(troops).some((v) => (v ?? 0) > 0);
  const cartData = {
    entityId: cartEntity.id,
    sourceVillageId: fromVillageId,
    destinationVillageId: toVillageId,
    cargo,
    currentPoleIndex: 0,
    isMilitary,
    isRailShipment: true
  };
  cartEntity.setDynamicProperty("kc:cart_data", JSON.stringify(cartData));
  cartEntity.nameTag = isMilitary ? `\u{1F5E1} \u2192 ${to.name}` : `\u{1F4E6} \u2192 ${to.name}`;
  from.activeCarts.push(cartData);
  saveVillage(from);
  const summary = getCargoSummary(cargo);
  notifyPlayer(
    from.owner,
    `\xA7a\u{1F4E6} Shipment ready! Push the \xA7bchest minecart\xA7a at \xA7b${from.name}\xA7a's trade station along rails to \xA7b${to.name}\xA7a. [${summary}]`
  );
  notifyPlayer(to.owner, `\xA7e\u{1F682} Incoming shipment from \xA7b${from.name}\xA7e! [${summary}]`);
  return true;
}
var MAX_HISTORY_ENTRIES = 10;
function recordTradeHistory(village, fromVillageName, summary, isManual) {
  village.tradeHistory ?? (village.tradeHistory = []);
  const entry = {
    timestamp: Date.now(),
    fromVillageName,
    summary,
    isManual
  };
  village.tradeHistory.unshift(entry);
  if (village.tradeHistory.length > MAX_HISTORY_ENTRIES) {
    village.tradeHistory.length = MAX_HISTORY_ENTRIES;
  }
}
var lastPoleTick = 0;
var POLE_TICK_INTERVAL = 40;
var TRADE_POLE_DETECT_RADIUS = 5;
function tickTradePoles(currentTick) {
  if (currentTick - lastPoleTick < POLE_TICK_INTERVAL) return;
  lastPoleTick = currentTick;
  for (const village of getAllVillages()) {
    if (!village.tradePoles || village.tradePoles.length === 0) continue;
    for (const pole of village.tradePoles) {
      processTradePoleCarts(village, pole);
    }
  }
}
function processTradePoleCarts(village, pole) {
  const dim = world13.getDimension(village.location.dimension);
  let minecarts;
  try {
    minecarts = dim.getEntities({
      type: "minecraft:chest_minecart",
      location: pole.location,
      maxDistance: TRADE_POLE_DETECT_RADIUS
    });
  } catch {
    return;
  }
  let changed = false;
  for (const cart of minecarts) {
    if (extractTradePoleCargo(cart, village)) changed = true;
  }
  if (changed) saveVillage(village);
}
function extractTradePoleCargo(cart, village) {
  const inv = cart.getComponent(EntityInventoryComponent7.componentId);
  if (!inv?.container) return false;
  ensureResourceStorage(village);
  const rs = village.resourceStorage;
  const received = [];
  let hasCargo = false;
  for (let i = 0; i < inv.container.size; i++) {
    const item = inv.container.getItem(i);
    if (!item || item.amount === 0) continue;
    hasCargo = true;
    const troopInfo = TROOP_TOKEN_MAP[item.typeId];
    if (troopInfo) {
      village.troops[troopInfo.troopType] = (village.troops[troopInfo.troopType] ?? 0) + item.amount;
      received.push(`${item.amount}x ${troopInfo.label}`);
      continue;
    }
    const mapping = ITEM_RESOURCE_MAP[item.typeId];
    const foodValue = FOOD_ITEM_VALUES[item.typeId];
    if (mapping) {
      if (mapping.target === "treasury") {
        village.treasury += item.amount;
        received.push(`${item.amount}\u{1F48E}`);
      } else {
        rs[mapping.target] += item.amount;
        received.push(`${item.amount} ${mapping.target}`);
      }
    } else if (foodValue !== void 0 && foodValue >= 0) {
      const units = item.amount * foodValue;
      village.foodStorage += units;
      received.push(`${units}\u{1F33E}`);
    }
  }
  if (!hasCargo || received.length === 0) return false;
  try { cart.remove(); } catch {}
  const summary = received.join(", ");
  notifyPlayer(
    village.owner,
    `\xA7a\u{1F682} Trade Pole received cargo at \xA7b${village.name}\xA7a: ${summary}`
  );
  recordTradeHistory(village, "Trade Pole Delivery", summary, true);
  return true;
}
function tickTradeStations(currentTick) {
  if (currentTick - lastStationTick < STATION_TICK_INTERVAL) return;
  lastStationTick = currentTick;
  for (const village of getAllVillages()) {
    if (!village.hasTradeStation || !village.tradeStationLocation) continue;
    processArrivingMinecarts(village);
  }
}
function processArrivingMinecarts(village) {
  const dim = world13.getDimension(village.location.dimension);
  const stationLoc = village.tradeStationLocation;
  let minecarts;
  try {
    minecarts = dim.getEntities({
      type: "minecraft:chest_minecart",
      location: stationLoc,
      maxDistance: TRADE_STATION_DETECT_RADIUS
    });
  } catch {
    return;
  }
  let changed = false;
  for (const cart of minecarts) {
    const cartDataRaw = cart.getDynamicProperty("kc:cart_data");
    if (cartDataRaw) {
      try {
        const cartData = JSON.parse(cartDataRaw);
        if (deliverTaggedMinecart(cartData, village, cart)) changed = true;
      } catch {
        if (extractUntaggedMinecart(cart, village)) changed = true;
      }
    } else {
      if (extractUntaggedMinecart(cart, village)) changed = true;
    }
  }
  if (changed) saveVillage(village);
}
function deliverTaggedMinecart(cartData, destVillage, cartEntity) {
  ensureResourceStorage(destVillage);
  const { cargo } = cartData;
  destVillage.treasury += cargo.emeralds;
  destVillage.foodStorage += cargo.food;
  destVillage.resourceStorage.iron += cargo.iron ?? 0;
  destVillage.resourceStorage.gold += cargo.gold ?? 0;
  destVillage.resourceStorage.coal += cargo.coal ?? 0;
  destVillage.resourceStorage.wood += cargo.wood ?? 0;
  destVillage.resourceStorage.stone += cargo.stone ?? 0;
  destVillage.resourceStorage.diamonds += cargo.diamonds ?? 0;
  for (const [troopType, count] of Object.entries(cargo.troops ?? {})) {
    const key = troopType;
    destVillage.troops[key] = (destVillage.troops[key] ?? 0) + (count ?? 0);
  }
  const srcVillage = getVillage(cartData.sourceVillageId);
  if (srcVillage) {
    srcVillage.activeCarts = srcVillage.activeCarts.filter((c) => c.entityId !== cartData.entityId);
    saveVillage(srcVillage);
  }
  try {
    cartEntity.remove();
  } catch {
  }
  const summary = getCargoSummary(cargo);
  const prefix = cartData.isMilitary ? "\xA7a\u{1F5E1} Reinforcements" : "\xA7a\u{1F4E6} Shipment";
  notifyPlayer(destVillage.owner, `${prefix} arrived at \xA7b${destVillage.name}\xA7a! [${summary}]`);
  if (srcVillage && srcVillage.owner !== destVillage.owner) {
    notifyPlayer(srcVillage.owner, `\xA7a\u{1F4E6} Shipment delivered to \xA7b${destVillage.name}\xA7a.`);
  }
  recordTradeHistory(destVillage, srcVillage?.name ?? "Unknown", summary, false);
  return true;
}
function extractUntaggedMinecart(cart, village) {
  const inv = cart.getComponent(EntityInventoryComponent7.componentId);
  if (!inv?.container) return false;
  ensureResourceStorage(village);
  const rs = village.resourceStorage;
  const received = [];
  for (let i = 0; i < inv.container.size; i++) {
    const item = inv.container.getItem(i);
    if (!item || item.amount === 0) continue;
    const mapping = ITEM_RESOURCE_MAP[item.typeId];
    const foodValue = FOOD_ITEM_VALUES[item.typeId];
    if (mapping) {
      if (mapping.target === "treasury") {
        village.treasury += item.amount;
        received.push(`${item.amount}\u{1F48E}`);
      } else {
        rs[mapping.target] += item.amount;
        received.push(`${item.amount} ${mapping.target}`);
      }
    } else if (foodValue !== void 0 && foodValue >= 0) {
      const units = item.amount * foodValue;
      village.foodStorage += units;
      received.push(`${units}\u{1F33E}`);
    }
  }
  if (received.length === 0) return false;
  try {
    cart.remove();
  } catch {
  }
  const receivedSummary = received.join(", ");
  notifyPlayer(
    village.owner,
    `\xA7a\u{1F682} Minecart arrived at \xA7b${village.name}\xA7a's trade station! Received: ${receivedSummary}`
  );
  recordTradeHistory(village, "Manual Delivery", receivedSummary, true);
  return true;
}

// src/systems/training.ts
init_storage();
var TRAINING_COSTS = {
  cityGuards:  { emeralds: 2, iron: 5,  gold: 0 },
  spearmen:    { emeralds: 3, iron: 8,  gold: 0 },
  archers:     { emeralds: 3, iron: 6,  gold: 2 },
  cavalry:     { emeralds: 5, iron: 10, gold: 3 },
  samurai:     { emeralds: 6, iron: 8,  gold: 4 },
  heavyKnights:{ emeralds: 6, iron: 12, gold: 4 }
};
var TRAINING_TICKS = {
  cityGuards:   400,
  spearmen:     400,
  archers:      400,
  cavalry:      400,
  samurai:      600,
  heavyKnights: 600
};
var TROOP_LABELS = {
  cityGuards:   "City Guard",
  spearmen:     "Spearman",
  archers:      "Archer",
  cavalry:      "Cavalry",
  samurai:      "Samurai",
  heavyKnights: "Heavy Knight"
};
var MAX_QUEUE_SIZE = 10;
function canAffordTraining(village, troopType, count) {
  const cost = TRAINING_COSTS[troopType];
  const rs = village.resourceStorage;
  if (village.treasury < cost.emeralds * count) {
    return `\xA7cNeed \xA7f${cost.emeralds * count}\u{1F48E}\xA7c emeralds (treasury: \xA7f${village.treasury}\xA7c).`;
  }
  if (rs.iron < cost.iron * count) {
    return `\xA7cNeed \xA7f${cost.iron * count}\xA7c iron (have \xA7f${rs.iron}\xA7c).`;
  }
  if (cost.gold > 0 && rs.gold < cost.gold * count) {
    return `\xA7cNeed \xA7f${cost.gold * count}\xA7c gold (have \xA7f${rs.gold}\xA7c).`;
  }
  return null;
}
function queueTraining(village, troopType, count, currentTick) {
  if (village.trainingQueue.length >= MAX_QUEUE_SIZE) {
    notifyPlayer(village.owner, `\xA7cTraining queue is full (max ${MAX_QUEUE_SIZE} jobs).`);
    return false;
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
  const ticksNeeded = TRAINING_TICKS[troopType] * count;
  const lastJobEnd = village.trainingQueue.length > 0 ? village.trainingQueue[village.trainingQueue.length - 1].completeTick : currentTick;
  const job = {
    troopType,
    count,
    completeTick: Math.max(lastJobEnd, currentTick) + ticksNeeded
  };
  village.trainingQueue.push(job);
  saveVillage(village);
  const label = TROOP_LABELS[troopType];
  const cost2 = TRAINING_COSTS[troopType];
  const costStr = [
    `${cost2.emeralds * count}\u{1F48E}`,
    cost2.iron * count > 0 ? `${cost2.iron * count} iron` : "",
    cost2.gold * count > 0 ? `${cost2.gold * count} gold` : ""
  ].filter(Boolean).join(", ");
  const secRemaining = Math.ceil((job.completeTick - currentTick) / 20);
  notifyPlayer(village.owner, `\xA7a\u{1FA96} Training \xA7f${count} ${label}\xA7a started. Cost: \xA7f${costStr}\xA7a. Ready in \xA7f~${secRemaining}s\xA7a.`);
  return true;
}
function tickTraining(village, currentTick) {
  if (!village.trainingQueue || village.trainingQueue.length === 0) return;
  let changed = false;
  const remaining = [];
  for (const job of village.trainingQueue) {
    if (currentTick >= job.completeTick) {
      village.troops[job.troopType] += job.count;
      const label = TROOP_LABELS[job.troopType];
      notifyPlayer(village.owner, `\xA7a\u{1FA96} \xA7f${job.count} ${label}\xA7a finished training and joined \xA7b${village.name}\xA7a's garrison!`);
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
function getTrainingQueueSummary(village, currentTick) {
  if (!village.trainingQueue || village.trainingQueue.length === 0) {
    return "\xA77No troops in training.";
  }
  return village.trainingQueue.map((job, i) => {
    const label = TROOP_LABELS[job.troopType];
    const secLeft = Math.max(0, Math.ceil((job.completeTick - currentTick) / 20));
    return `\xA77[${i + 1}] \xA7f${job.count}x ${label} \xA77\u2014 \xA7e~${secLeft}s`;
  }).join("\n");
}

// src/systems/autoDefense.ts
import { world as world14 } from "@minecraft/server";
init_storage();
var THREAT_SCAN_INTERVAL = 60;
var RAID_NOTIFY_COOLDOWN = 300;
var lastRaidNotify = /* @__PURE__ */ new Map();
var AUTO_DISPATCH_PROP = "kc:auto_dispatch";
var AUTO_TROOP_TYPE_PROP = "kc:auto_troop_type";
var TROOP_ENTITY_MAP = {
  cityGuards: "kingdoms:city_guard",
  spearmen: "kingdoms:spearman",
  archers: "kingdoms:archer",
  cavalry: "kingdoms:cavalry",
  samurai: "kingdoms:samurai",
  heavyKnights: "kingdoms:heavy_knight"
};
var TROOP_PRIORITY = ["spearmen", "archers", "cityGuards", "cavalry", "samurai", "heavyKnights"];
function tickAutoDefense(currentTick) {
  if (currentTick % THREAT_SCAN_INTERVAL !== 0) return;
  const _adPlayers = world14.getPlayers();
  const _adKingdoms = new Map();
  for (const _p of _adPlayers) {
    const _k = getKingdomOf(_p.name);
    if (_k) _adKingdoms.set(_p.name, _k);
  }
  for (const village of getAllVillages()) {
    if (!village.owner) continue;
    scanVillageThreat(village, currentTick, _adPlayers, _adKingdoms);
  }
}
var MOB_DEPLOY_THRESHOLD = 5;
var MOB_SECOND_WAVE_THRESHOLD = 8;
function scanVillageThreat(village, currentTick, cachedPlayers, cachedKingdoms) {
  const dim = world14.getDimension(village.location.dimension);
  const center = village.townHallLocation;
  let mobCount = 0;
  let playerRaider = null;
  try {
    const hostiles = dim.getEntities({
      location: center,
      maxDistance: VILLAGE_CLAIM_RADIUS,
      families: ["monster"]
    });
    mobCount = hostiles.length;
  } catch {}
  const _scanPlayers = cachedPlayers ?? world14.getPlayers();
  for (const p of _scanPlayers) {
    if (p.name === village.owner) continue;
    const theirKingdom = cachedKingdoms ? cachedKingdoms.get(p.name) : getKingdomOf(p.name);
    if (!theirKingdom) continue;
    if (!areAtWar(village.kingdomId, theirKingdom.id)) continue;
    if (distance(p.location, center) <= VILLAGE_CLAIM_RADIUS) {
      if (!playerRaider) playerRaider = p.name;
    }
  }
  if (playerRaider) {
    const key = `${village.id}:player`;
    const last = lastRaidNotify.get(key) ?? 0;
    if (currentTick - last > RAID_NOTIFY_COOLDOWN) {
      notifyAlert(village.owner, `\xA7c\u{1F514} RAID ALERT! \xA7f${playerRaider}\xA7c has entered \xA7b${village.name}\xA7c!`);
      lastRaidNotify.set(key, currentTick);
    }
  }
  const shouldDefend = playerRaider !== null || mobCount >= MOB_DEPLOY_THRESHOLD;
  if (!shouldDefend) {
    recallAutoDispatched(village);
    return;
  }
  if (mobCount >= MOB_DEPLOY_THRESHOLD) {
    const key = `${village.id}:mob`;
    const last = lastRaidNotify.get(key) ?? 0;
    if (currentTick - last > RAID_NOTIFY_COOLDOWN) {
      notifyAlert(village.owner, `\xA7c\u2694 \xA7b${village.name}\xA7c is under attack! (${mobCount} mob${mobCount > 1 ? "s" : ""} inside village radius \u2014 deploying defenders!)`);
      lastRaidNotify.set(key, currentTick);
    }
  }
  dispatchTroops(village, mobCount, playerRaider !== null);
}
function countAutoDispatched(village) {
  const dim = world14.getDimension(village.location.dimension);
  const center = village.townHallLocation;
  let count = 0;
  for (const entityType of Object.values(TROOP_ENTITY_MAP)) {
    try {
      const entities = dim.getEntities({ type: entityType, location: center, maxDistance: VILLAGE_CLAIM_RADIUS * 2 });
      for (const e of entities) {
        if (e.getDynamicProperty(AUTO_DISPATCH_PROP) === village.id) count++;
      }
    } catch {
    }
  }
  return count;
}
function dispatchTroops(village, mobCount, hasPlayerRaider) {
  const totalBarracks = Object.values(village.troops).reduce((s, v) => s + (v ?? 0), 0);
  if (totalBarracks <= 0) return;
  const dim = world14.getDimension(village.location.dimension);
  const center = village.townHallLocation;
  let polesCleared = false;
  for (const pole of (village.guardPoles ?? [])) {
    if (pole.entityIds && pole.entityIds.length > 0) {
      despawnPoleGuards(village, pole);
      polesCleared = true;
    }
  }
  const alreadyOut = countAutoDispatched(village);
  const WAVE_SIZE = 10;
  let wavesNeeded = 0;
  if (mobCount >= MOB_DEPLOY_THRESHOLD) wavesNeeded = 1;
  if (mobCount > MOB_SECOND_WAVE_THRESHOLD) wavesNeeded = 2;
  if (hasPlayerRaider && wavesNeeded < 1) wavesNeeded = 1;
  const targetOut = Math.min(wavesNeeded * WAVE_SIZE, totalBarracks);
  const needed = targetOut - alreadyOut;
  if (needed <= 0) {
    if (polesCleared) saveVillage(village);
    return;
  }
  const availablePool = [];
  for (const troopType of TROOP_PRIORITY) {
    const inBarracks = (village.troops[troopType] ?? 0) - (village.guardPoles ?? []).filter(p => p.troopType === troopType).reduce((s, p) => s + (p.assignedGuards ?? 0), 0);
    for (let i = 0; i < Math.max(0, inBarracks); i++) {
      availablePool.push(troopType);
    }
  }
  for (let i = availablePool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availablePool[i], availablePool[j]] = [availablePool[j], availablePool[i]];
  }
  const toDispatch = availablePool.slice(0, needed);
  const dispatchCounts = {};
  for (const t of toDispatch) {
    dispatchCounts[t] = (dispatchCounts[t] ?? 0) + 1;
  }
  let dispatched = 0;
  for (const [troopType, count] of Object.entries(dispatchCounts)) {
    village.troops[troopType] -= count;
    for (let i = 0; i < count; i++) {
      try {
        const angle = Math.random() * Math.PI * 2;
        const r = 6 + Math.random() * 12;
        const entity = dim.spawnEntity(TROOP_ENTITY_MAP[troopType], {
          x: center.x + Math.cos(angle) * r,
          y: center.y,
          z: center.z + Math.sin(angle) * r
        });
        entity.setDynamicProperty(AUTO_DISPATCH_PROP, village.id);
        entity.setDynamicProperty(AUTO_TROOP_TYPE_PROP, troopType);
        entity.nameTag = `\u2694 [${village.name}]`;
        dispatched++;
      } catch {}
    }
  }
  if (dispatched > 0 || polesCleared) {
    saveVillage(village);
    if (dispatched > 0) {
      const waveLabel = wavesNeeded === 2 ? " (2nd wave!)" : "";
      notifyPlayer(village.owner, `\xA7e\u2694 ${dispatched} troop${dispatched > 1 ? "s" : ""} deployed from barracks to defend \xA7b${village.name}\xA7e${waveLabel}!${polesCleared ? " Guard pole soldiers have left their posts to assist." : ""}`);
    }
  }
}
function recallAutoDispatched(village) {
  const dim = world14.getDimension(village.location.dimension);
  const center = village.townHallLocation;
  const survivors = {};
  let recalled = 0;
  for (const [troopType, entityType] of Object.entries(TROOP_ENTITY_MAP)) {
    try {
      const entities = dim.getEntities({ type: entityType, location: center, maxDistance: VILLAGE_CLAIM_RADIUS * 2 });
      for (const e of entities) {
        if (e.getDynamicProperty(AUTO_DISPATCH_PROP) !== village.id) continue;
        const tt = e.getDynamicProperty(AUTO_TROOP_TYPE_PROP) ?? troopType;
        survivors[tt] = (survivors[tt] ?? 0) + 1;
        try { e.remove(); } catch {}
        recalled++;
      }
    } catch {}
  }
  const polesNeedingRestore = (village.guardPoles ?? []).filter(p => p.assignedGuards > 0 && p.entityIds.length === 0);
  if (recalled > 0) {
    for (const [tt, count] of Object.entries(survivors)) {
      village.troops[tt] = (village.troops[tt] ?? 0) + count;
    }
  }
  if (polesNeedingRestore.length > 0) {
    const troopTotals = {};
    for (const [tt] of Object.entries(TROOP_ENTITY_MAP)) {
      troopTotals[tt] = village.troops[tt] ?? 0;
    }
    for (const pole of polesNeedingRestore) {
      const tt = pole.troopType;
      const alreadyClaimed = (village.guardPoles ?? []).filter(p => p !== pole && p.troopType === tt).reduce((s, p) => s + (p.assignedGuards ?? 0), 0);
      const canHave = Math.max(0, (troopTotals[tt] ?? 0) - alreadyClaimed);
      pole.assignedGuards = Math.min(pole.assignedGuards, canHave);
      if (pole.assignedGuards > 0) {
        try { spawnPoleGuards(village, pole); } catch {}
      }
    }
  }
  if (recalled > 0 || polesNeedingRestore.length > 0) {
    saveVillage(village);
    if (recalled > 0) {
      notifyPlayer(village.owner, `\xA7a\u2705 Threat cleared! \xA7f${recalled}\xA7a troop${recalled > 1 ? "s" : ""} returned to \xA7b${village.name}\xA7a barracks.${polesNeedingRestore.length > 0 ? " Guard pole soldiers have returned to their posts." : ""}`);
    } else if (polesNeedingRestore.length > 0) {
      notifyPlayer(village.owner, `\xA7a\u2705 Threat cleared! Guard pole soldiers have returned to their posts at \xA7b${village.name}\xA7a.`);
    }
  }
}

// src/systems/guards.ts
import { world as world15 } from "@minecraft/server";
init_storage();
var GUARD_ENTITY_MAP = {
  cityGuards: "kingdoms:city_guard",
  spearmen: "kingdoms:spearman",
  archers: "kingdoms:archer",
  cavalry: "kingdoms:cavalry"
};
function getBestAvailableTroopType(village) {
  const types = ["cityGuards", "spearmen", "archers", "cavalry"];
  for (const t of types) {
    if (village.troops[t] > 0) return t;
  }
  return "cityGuards";
}
function countAssignedTroops(village, troopType) {
  return village.guardPoles.reduce((sum, pole) => {
    return sum + (pole.troopType === troopType ? pole.assignedGuards : 0);
  }, 0);
}
function availableTroops(village, troopType) {
  return Math.max(0, village.troops[troopType] - countAssignedTroops(village, troopType));
}
function registerGuardPole(village, location, type) {
  if (village.guardPoles.length >= 32) {
    notifyPlayer(village.owner, "\xA7cMaximum guard poles reached for this village.");
    return false;
  }
  const troopType = getBestAvailableTroopType(village);
  const maxCanAssign = Math.min(MAX_GUARDS_PER_POLE, availableTroops(village, troopType));
  const pole = {
    id: generateId(),
    location,
    type,
    assignedGuards: maxCanAssign,
    requestedGuards: MAX_GUARDS_PER_POLE,
    troopType,
    entityIds: []
  };
  village.guardPoles.push(pole);
  if (maxCanAssign > 0) {
    spawnPoleGuards(village, pole);
    notifyPlayer(
      village.owner,
      `\xA7aGuard pole (${type}) placed \u2014 \xA7b${maxCanAssign}/${MAX_GUARDS_PER_POLE} guards assigned\xA7a in \xA7b${village.name}\xA7a.`
    );
  } else {
    notifyPlayer(
      village.owner,
      `\xA7eGuard pole (${type}) placed in \xA7b${village.name}\xA7e \u2014 no guards available yet, will fill when recruited.`
    );
  }
  saveVillage(village);
  return true;
}
function removeGuardPole(village, poleId) {
  const idx = village.guardPoles.findIndex((p) => p.id === poleId);
  if (idx === -1) return;
  const pole = village.guardPoles[idx];
  despawnPoleGuards(village, pole);
  village.guardPoles.splice(idx, 1);
  saveVillage(village);
}
function fillUnderstaffedPoles(village) {
  let changed = false;
  for (const pole of village.guardPoles) {
    if (pole.assignedGuards >= pole.requestedGuards) continue;
    const needed = pole.requestedGuards - pole.assignedGuards;
    const free = availableTroops(village, pole.troopType);
    if (free <= 0) continue;
    const toAdd = Math.min(needed, free);
    despawnPoleGuards(village, pole);
    pole.assignedGuards += toAdd;
    spawnPoleGuards(village, pole);
    changed = true;
    notifyPlayer(
      village.owner,
      `\xA7e+${toAdd} guard(s) filled post in \xA7b${village.name}\xA7e. (${pole.assignedGuards}/${pole.requestedGuards} at this pole)`
    );
  }
  if (changed) saveVillage(village);
}
function spawnPoleGuards(village, pole) {
  const dim = world15.getDimension(village.location.dimension);
  const entityType = GUARD_ENTITY_MAP[pole.troopType];
  pole.entityIds = [];
  for (let i = 0; i < pole.assignedGuards; i++) {
    try {
      const count = Math.max(pole.assignedGuards, 1);
      const angle = i / count * Math.PI * 2;
      const entity = dim.spawnEntity(entityType, {
        x: pole.location.x + Math.cos(angle) * 2,
        y: pole.location.y,
        z: pole.location.z + Math.sin(angle) * 2
      });
      entity.setDynamicProperty("kc:pole_id", pole.id);
      entity.setDynamicProperty("kc:village_id", village.id);
      entity.nameTag = `${pole.troopType} [${village.name}]`;
      pole.entityIds.push(entity.id);
    } catch {
    }
  }
}
function despawnPoleGuards(village, pole) {
  const dim = world15.getDimension(village.location.dimension);
  const POLE_SEARCH_RADIUS = 8;
  for (const eid of pole.entityIds) {
    try {
      const nearby = dim.getEntities({
        type: GUARD_ENTITY_MAP[pole.troopType],
        location: pole.location,
        maxDistance: POLE_SEARCH_RADIUS
      });
      const entity = nearby.find((e) => e.id === eid);
      if (entity) entity.remove();
    } catch {
    }
  }
  pole.entityIds = [];
}
function refreshAllGuards() {
  for (const village of getAllVillages()) {
    if (!village.owner) continue;
    for (const pole of village.guardPoles) {
      if (pole.assignedGuards > 0 && pole.entityIds.length === 0) {
        spawnPoleGuards(village, pole);
      }
    }
    fillUnderstaffedPoles(village);
  }
}

// src/systems/reinforcements.ts
init_storage();
function sendReinforcements(fromVillageId, toVillageId, troops) {
  const from = getVillage(fromVillageId);
  const to = getVillage(toVillageId);
  if (!from || !to) return false;
  for (const [type, count] of Object.entries(troops)) {
    if ((count ?? 0) <= 0) continue;
    if (from.troops[type] < (count ?? 0)) {
      notifyPlayer(from.owner, `\xA7cNot enough ${type} in \xA7b${from.name}\xA7c to send.`);
      return false;
    }
  }
  for (const [type, count] of Object.entries(troops)) {
    if ((count ?? 0) <= 0) continue;
    from.troops[type] -= count ?? 0;
  }
  saveVillage(from);
  const cargo = {
    food: 0,
    emeralds: 0,
    iron: 0,
    gold: 0,
    coal: 0,
    wood: 0,
    stone: 0,
    diamonds: 0,
    troops
  };
  const success = sendTradeCart(fromVillageId, toVillageId, cargo);
  if (!success) {
    for (const [type, count] of Object.entries(troops)) {
      if ((count ?? 0) <= 0) continue;
      from.troops[type] += count ?? 0;
    }
    saveVillage(from);
    return false;
  }
  const summary = Object.entries(troops).filter(([, c]) => (c ?? 0) > 0).map(([t, c]) => `${c} ${t}`).join(", ");
  notifyPlayer(from.owner, `\xA7aSent reinforcements (${summary}) from \xA7b${from.name}\xA7a to \xA7b${to.name}\xA7a.`);
  return true;
}

// src/systems/structureBuilder.ts
var STRUCTURE_BLOCK_IDS = /* @__PURE__ */ new Set([
  "kingdoms:town_hall",
  "kingdoms:barracks",
  "kingdoms:market",
  "kingdoms:granary",
  "kingdoms:blacksmith",
  "kingdoms:trade_station",
  "kingdoms:treasury",
  "kingdoms:storage",
  "kingdoms:armory",
  "kingdoms:tower",
  "kingdoms:wall_long",
  "kingdoms:wall_short",
  "kingdoms:wall_tall",
  "kingdoms:stone_gate",
  "kingdoms:king_castle",
  "kingdoms:house",
  "kingdoms:fence_enclosure",
  "kingdoms:barn",
  "kingdoms:farm_plot"
]);
function blk(x, y, z, b) {
  return { x, y, z, b };
}
function fill(x1, y1, z1, x2, y2, z2, b) {
  const out = [];
  for (let x = x1; x <= x2; x++)
    for (let y = y1; y <= y2; y++)
      for (let z = z1; z <= z2; z++)
        out.push({ x, y, z, b });
  return out;
}
function ring(x1, z1, x2, z2, y1, y2, b) {
  const out = [];
  for (let x = x1; x <= x2; x++)
    for (let z = z1; z <= z2; z++)
      if (x === x1 || x === x2 || z === z1 || z === z2)
        for (let y = y1; y <= y2; y++)
          out.push({ x, y, z, b });
  return out;
}
function townHallBlueprint() {
  const p = [];
  p.push(...fill(-4, 1, -4, 4, 12, 4, "minecraft:air"));
  p.push(...fill(-4, 0, -4, 4, 0, 4, "minecraft:stone_bricks"));
  for (const [cx, cz] of [[-4, -4], [-4, 4], [4, -4], [4, 4]]) {
    p.push(...fill(cx, 1, cz, cx, 6, cz, "minecraft:oak_log"));
  }
  p.push(...fill(-3, 1, -4, 3, 5, -4, "minecraft:oak_planks"));
  p.push(...fill(4, 1, -3, 4, 5, 3, "minecraft:oak_planks"));
  p.push(...fill(-4, 1, -3, -4, 5, 3, "minecraft:oak_planks"));
  for (let x = -3; x <= 3; x++)
    for (let y = 1; y <= 5; y++)
      if (!(x >= -1 && x <= 1 && y <= 2))
        p.push(blk(x, y, 4, "minecraft:oak_planks"));
  for (const wx of [-2, 0, 2]) {
    p.push(blk(wx, 2, -4, "minecraft:glass"), blk(wx, 3, -4, "minecraft:glass"));
    p.push(blk(wx, 2, 4, "minecraft:glass"), blk(wx, 3, 4, "minecraft:glass"));
  }
  for (const wz of [-2, 0, 2]) {
    p.push(blk(4, 2, wz, "minecraft:glass"), blk(4, 3, wz, "minecraft:glass"));
    p.push(blk(-4, 2, wz, "minecraft:glass"), blk(-4, 3, wz, "minecraft:glass"));
  }
  const filtered = p.filter((b) => !(b.z === 4 && b.x >= -1 && b.x <= 1 && b.y <= 2));
  p.length = 0;
  p.push(...filtered);
  p.push(...fill(-4, 6, -4, 4, 6, 4, "minecraft:stone_bricks"));
  p.push(...fill(-3, 7, -3, 3, 7, 3, "minecraft:stone_bricks"));
  p.push(...fill(-2, 8, -2, 2, 8, 2, "minecraft:stone_bricks"));
  p.push(...fill(-1, 9, -1, 1, 9, 1, "minecraft:stone_bricks"));
  p.push(blk(0, 10, 0, "minecraft:stone_bricks"));
  p.push(blk(0, 11, 0, "minecraft:lantern"));
  p.push(blk(-3, 1, -3, "minecraft:bookshelf"), blk(-3, 2, -3, "minecraft:bookshelf"));
  p.push(blk(3, 1, -3, "minecraft:bookshelf"), blk(3, 2, -3, "minecraft:bookshelf"));
  p.push(blk(-2, 1, -3, "minecraft:bookshelf"), blk(2, 1, -3, "minecraft:bookshelf"));
  p.push(blk(2, 1, 0, "minecraft:crafting_table"));
  p.push(blk(-2, 1, 0, "minecraft:lectern"));
  p.push(blk(0, 1, 2, "minecraft:sea_lantern"));
  return p;
}
function barracksBlueprint() {
  const p = [];
  // Clear volume
  p.push(...fill(-8, 1, -6, 8, 12, 6, "minecraft:air"));
  // Foundation (cobblestone)
  p.push(...fill(-8, 0, -6, 8, 0, 6, "minecraft:cobblestone"));
  // Outer walls: stone bricks (y=1-7)
  p.push(...fill(-8, 1, -6, 8, 7, -6, "minecraft:stone_bricks")); // north
  p.push(...fill(-8, 1,  6, 8, 7,  6, "minecraft:stone_bricks")); // south
  p.push(...fill(-8, 1, -5, -8, 7,  5, "minecraft:stone_bricks")); // west
  p.push(...fill( 8, 1, -5,  8, 7,  5, "minecraft:stone_bricks")); // east
  // Timber frame: dark oak corner columns
  for (const [cx, cz] of [[-8,-6],[-8,6],[8,-6],[8,6]])
    p.push(...fill(cx, 1, cz, cx, 8, cz, "minecraft:dark_oak_log"));
  // Mid-wall dark oak posts (structural rhythm)
  for (const mpx of [-4, 0, 4]) {
    p.push(...fill(mpx, 1, -6, mpx, 7, -6, "minecraft:dark_oak_log"));
    p.push(...fill(mpx, 1,  6, mpx, 7,  6, "minecraft:dark_oak_log"));
  }
  for (const mpz of [-2, 2]) {
    p.push(...fill(-8, 1, mpz, -8, 7, mpz, "minecraft:dark_oak_log"));
    p.push(...fill( 8, 1, mpz,  8, 7, mpz, "minecraft:dark_oak_log"));
  }
  // Triple-wide door opening (south wall, x=-1..1, y=1-3)
  for (let x = -1; x <= 1; x++) for (let y = 1; y <= 3; y++) p.push(blk(x, y, 6, "minecraft:air"));
  // Windows: 2-high glass panes on each wall
  for (const wx of [-6, -2, 2, 6])     { p.push(blk(wx, 3, -6, "minecraft:glass"), blk(wx, 4, -6, "minecraft:glass")); } // north
  for (const wx of [-5, -3, 3, 5])     { p.push(blk(wx, 3,  6, "minecraft:glass"), blk(wx, 4,  6, "minecraft:glass")); } // south flanking door
  for (const wz of [-4, -1, 1, 4])     {
    p.push(blk(-8, 3, wz, "minecraft:glass"), blk(-8, 4, wz, "minecraft:glass")); // west
    p.push(blk( 8, 3, wz, "minecraft:glass"), blk( 8, 4, wz, "minecraft:glass")); // east
  }
  // Flat roof (cobblestone y=8) + stone brick crenellations (y=9)
  p.push(...fill(-8, 8, -6, 8, 8, 6, "minecraft:cobblestone"));
  for (let x = -8; x <= 8; x += 2) { p.push(blk(x, 9, -6, "minecraft:stone_bricks")); p.push(blk(x, 9, 6, "minecraft:stone_bricks")); }
  for (let z = -5; z <= 5; z += 2) { p.push(blk(-8, 9, z, "minecraft:stone_bricks")); p.push(blk(8, 9, z, "minecraft:stone_bricks")); }
  // Entry watchtower above south door (y=8-11)
  p.push(...fill(-1, 8, 6, 1, 11, 6, "minecraft:stone_bricks"));
  p.push(blk(0, 9, 6, "minecraft:air")); // arrow slit window
  p.push(blk(-1, 12, 6, "minecraft:stone_bricks"), blk(0, 12, 6, "minecraft:stone_bricks"), blk(1, 12, 6, "minecraft:stone_bricks"));
  // Interior floor
  p.push(...fill(-7, 1, -5, 7, 1, 5, "minecraft:cobblestone"));
  p.push(...fill( 0, 1, -5, 0, 1, 5, "minecraft:red_carpet")); // central aisle
  // ── BUNK ROOM (north zone, z=-5 to -1) ──────────────────────────────────
  p.push(blk(-5, 1, -4, "minecraft:white_bed"), blk(-5, 1, -2, "minecraft:white_bed")); // left lower bunks
  p.push(blk( 5, 1, -4, "minecraft:white_bed"), blk( 5, 1, -2, "minecraft:white_bed")); // right lower bunks
  p.push(blk(-7, 1, -4, "minecraft:chest"), blk(-7, 1, -2, "minecraft:chest")); // personal chests L
  p.push(blk( 7, 1, -4, "minecraft:chest"), blk( 7, 1, -2, "minecraft:chest")); // personal chests R
  p.push(blk(-7, 2, -4, "minecraft:bookshelf"), blk(-7, 2, -2, "minecraft:bookshelf")); // shelving above chests
  p.push(blk( 7, 2, -4, "minecraft:bookshelf"), blk( 7, 2, -2, "minecraft:bookshelf"));
  // Upper bunk platform (dark oak, y=2, over lower beds)
  p.push(...fill(-6, 2, -4, -4, 2, -2, "minecraft:dark_oak_planks"));
  p.push(...fill( 4, 2, -4,  6, 2, -2, "minecraft:dark_oak_planks"));
  p.push(blk(-6, 2, -4, "minecraft:dark_oak_log"), blk(-6, 2, -2, "minecraft:dark_oak_log")); // L support posts
  p.push(blk(-4, 2, -4, "minecraft:dark_oak_log"), blk(-4, 2, -2, "minecraft:dark_oak_log"));
  p.push(blk( 4, 2, -4, "minecraft:dark_oak_log"), blk( 4, 2, -2, "minecraft:dark_oak_log")); // R support posts
  p.push(blk( 6, 2, -4, "minecraft:dark_oak_log"), blk( 6, 2, -2, "minecraft:dark_oak_log"));
  p.push(blk(-7, 2, -5, "minecraft:bookshelf"), blk(-5, 2, -5, "minecraft:bookshelf")); // north wall shelf
  p.push(blk( 5, 2, -5, "minecraft:bookshelf"), blk( 7, 2, -5, "minecraft:bookshelf"));
  // ── EQUIPMENT ZONE (center, z=-1 to 1) ──────────────────────────────────
  p.push(blk(-3, 1, 0, "minecraft:anvil"));
  p.push(blk(-2, 1, 0, "minecraft:smithing_table"));
  p.push(blk( 2, 1, 0, "minecraft:crafting_table"));
  p.push(blk( 3, 1, 0, "minecraft:grindstone"));
  p.push(blk(-7, 1, 0, "minecraft:chest"), blk(7, 1, 0, "minecraft:chest")); // equipment chests
  p.push(blk(-7, 2, 0, "minecraft:barrel"), blk(7, 2, 0, "minecraft:barrel")); // supply barrels
  for (let iy = 1; iy <= 3; iy++) { // weapon rack bars (flanking equipment)
    p.push(blk(-5, iy, 0, "minecraft:iron_bars"), blk(-6, iy, 0, "minecraft:iron_bars"));
    p.push(blk( 5, iy, 0, "minecraft:iron_bars"), blk( 6, iy, 0, "minecraft:iron_bars"));
  }
  // ── TRAINING YARD (south zone, z=2 to 5) ────────────────────────────────
  p.push(...fill(-6, 1, 2, 6, 1, 5, "minecraft:gravel")); // gravel training floor
  p.push(blk( 0, 1, 4, "minecraft:dark_oak_log"), blk(0, 2, 4, "minecraft:dark_oak_log"), blk(0, 3, 4, "minecraft:dark_oak_log")); // training post
  p.push(blk(-1, 3, 4, "minecraft:iron_bars"), blk(1, 3, 4, "minecraft:iron_bars")); // crossarms on post
  p.push(blk(-4, 1, 3, "minecraft:oak_fence"), blk(4, 1, 3, "minecraft:oak_fence")); // sparring ring markers
  p.push(blk(-4, 1, 5, "minecraft:oak_fence"), blk(4, 1, 5, "minecraft:oak_fence"));
  // ── GRAND ENTRANCE (south exterior) ─────────────────────────────────────
  p.push(...fill(-3, 0, 7, 3, 0, 10, "minecraft:stone_bricks")); // raised approach platform
  p.push(...fill(-4, 1, 7, -4, 3, 10, "minecraft:stone_bricks")); // left guard pillar
  p.push(...fill( 4, 1, 7,  4, 3, 10, "minecraft:stone_bricks")); // right guard pillar
  p.push(blk(-4, 4, 9, "minecraft:torch"), blk(4, 4, 9, "minecraft:torch")); // pillar torches
  // ── LIGHTING ────────────────────────────────────────────────────────────
  p.push(blk(0, 7, -3, "minecraft:sea_lantern")); // bunk room chandelier
  p.push(blk(0, 7,  0, "minecraft:sea_lantern")); // equipment zone
  p.push(blk(0, 7,  3, "minecraft:sea_lantern")); // training yard
  for (const tz of [-4, -1, 2, 5]) {
    p.push(blk(-7, 4, tz, "minecraft:torch"), blk(7, 4, tz, "minecraft:torch")); // wall torches
  }
  p.push(blk(0, 4, -5, "minecraft:torch"), blk(0, 4, 5, "minecraft:torch")); // N + S wall torches
  return p;
}
function marketBlueprint() {
  const p = [];
  p.push(...fill(-5, 1, -5, 5, 5, 5, "minecraft:air"));
  p.push(...fill(-5, 0, -5, 5, 0, 5, "minecraft:cobblestone"));
  p.push(...ring(-5, -5, 5, 5, 0, 0, "minecraft:stone_bricks"));
  const postPositions = [
    [-5, -5],
    [-5, 0],
    [-5, 5],
    [0, -5],
    [0, 5],
    [5, -5],
    [5, 0],
    [5, 5]
  ];
  for (const [px, pz] of postPositions)
    p.push(...fill(px, 1, pz, px, 4, pz, "minecraft:oak_log"));
  p.push(...fill(-5, 5, -5, 5, 5, 5, "minecraft:oak_planks"));
  for (const [lx, lz] of [[-2, -2], [-2, 2], [2, -2], [2, 2], [0, 0]])
    p.push(blk(lx, 5, lz, "minecraft:sea_lantern"));
  p.push(blk(-3, 1, -3, "minecraft:crafting_table"), blk(-3, 1, 0, "minecraft:crafting_table"));
  p.push(blk(3, 1, -3, "minecraft:crafting_table"), blk(3, 1, 0, "minecraft:crafting_table"));
  p.push(blk(0, 1, -3, "minecraft:crafting_table"), blk(0, 1, 3, "minecraft:crafting_table"));
  p.push(blk(-3, 1, 3, "minecraft:crafting_table"), blk(3, 1, 3, "minecraft:crafting_table"));
  p.push(blk(-4, 1, 0, "minecraft:barrel"), blk(4, 1, 0, "minecraft:barrel"));
  p.push(blk(0, 1, -4, "minecraft:barrel"), blk(0, 1, 4, "minecraft:barrel"));
  return p;
}
function granaryBlueprint() {
  const p = [];
  // Clear volume (bigger 9x9 footprint, 12 tall)
  p.push(...fill(-4, 1, -4, 4, 12, 4, "minecraft:air"));
  // Foundation (birch planks — warm barn look)
  p.push(...fill(-4, 0, -4, 4, 0, 4, "minecraft:birch_planks"));
  // Corner structural posts (spruce log, full height)
  for (const [cx, cz] of [[-4,-4],[-4,4],[4,-4],[4,4]])
    p.push(...fill(cx, 1, cz, cx, 8, cz, "minecraft:spruce_log"));
  // Mid-wall posts (spruce log) for structural rhythm
  for (const mpx of [-4, 4]) {
    p.push(...fill(mpx, 1, 0, mpx, 6, 0, "minecraft:spruce_log")); // E/W mid post
  }
  p.push(...fill(0, 1, -4, 0, 6, -4, "minecraft:spruce_log")); // N mid post
  p.push(...fill(0, 1,  4, 0, 6,  4, "minecraft:spruce_log")); // S mid post
  // Walls (spruce planks, y=1-6)
  p.push(...fill(-3, 1, -4, 3, 6, -4, "minecraft:spruce_planks")); // north
  p.push(...fill(-3, 1,  4, 3, 6,  4, "minecraft:spruce_planks")); // south
  p.push(...fill(-4, 1, -3, -4, 6, 3, "minecraft:spruce_planks")); // west
  p.push(...fill( 4, 1, -3,  4, 6, 3, "minecraft:spruce_planks")); // east
  // Door opening: south wall, double-wide (x=-1..1, y=1-2)
  for (let x = -1; x <= 1; x++) for (let y = 1; y <= 2; y++) p.push(blk(x, y, 4, "minecraft:air"));
  // Doorstep (birch planks outside, z=5)
  p.push(blk(-1, 0, 5, "minecraft:birch_planks"), blk(0, 0, 5, "minecraft:birch_planks"), blk(1, 0, 5, "minecraft:birch_planks"));
  // Windows: 2-high glass on each wall (2 per wall)
  for (const wx of [-2, 2]) {
    p.push(blk(wx, 3, -4, "minecraft:glass"), blk(wx, 4, -4, "minecraft:glass")); // north
    p.push(blk(wx, 3,  4, "minecraft:glass"), blk(wx, 4,  4, "minecraft:glass")); // south
  }
  for (const wz of [-2, 2]) {
    p.push(blk(-4, 3, wz, "minecraft:glass"), blk(-4, 4, wz, "minecraft:glass")); // west
    p.push(blk( 4, 3, wz, "minecraft:glass"), blk( 4, 4, wz, "minecraft:glass")); // east
  }
  // Upper wall (solid, y=7 above windows)
  p.push(...fill(-3, 7, -4, 3, 7, -4, "minecraft:spruce_planks"));
  p.push(...fill(-3, 7,  4, 3, 7,  4, "minecraft:spruce_planks"));
  p.push(...fill(-4, 7, -3, -4, 7, 3, "minecraft:spruce_planks"));
  p.push(...fill( 4, 7, -3,  4, 7, 3, "minecraft:spruce_planks"));
  // Ventilation slits at y=6 (every other block along top of walls)
  for (let x = -3; x <= 3; x += 2) {
    p.push(blk(x, 6, -4, "minecraft:glass")); // north vent
    p.push(blk(x, 6,  4, "minecraft:glass")); // south vent
  }
  for (let z = -3; z <= 3; z += 2) {
    p.push(blk(-4, 6, z, "minecraft:glass")); // west vent
    p.push(blk( 4, 6, z, "minecraft:glass")); // east vent
  }
  // Hay pyramid roof (thematic and recognizable)
  p.push(...fill(-4, 8, -4, 4, 8, 4, "minecraft:hay_block"));
  p.push(...fill(-3, 9, -3, 3, 9, 3, "minecraft:hay_block"));
  p.push(...fill(-2,10, -2, 2,10, 2, "minecraft:hay_block"));
  p.push(...fill(-1,11, -1, 1,11, 1, "minecraft:hay_block"));
  p.push(blk(0, 12, 0, "minecraft:hay_block"));
  // Interior floor (birch planks)
  p.push(...fill(-3, 1, -3, 3, 1, 3, "minecraft:birch_planks"));
  // Barrel rows along east & west walls (stacked 2-high for a full granary look)
  p.push(blk(-3, 1, -3, "minecraft:barrel"), blk(-3, 2, -3, "minecraft:barrel"));
  p.push(blk(-3, 1, -2, "minecraft:barrel"), blk(-3, 2, -2, "minecraft:barrel"));
  p.push(blk(-3, 1,  1, "minecraft:barrel"), blk(-3, 2,  1, "minecraft:barrel"));
  p.push(blk(-3, 1,  2, "minecraft:barrel"), blk(-3, 2,  2, "minecraft:barrel"));
  p.push(blk( 3, 1, -3, "minecraft:barrel"), blk( 3, 2, -3, "minecraft:barrel"));
  p.push(blk( 3, 1, -2, "minecraft:barrel"), blk( 3, 2, -2, "minecraft:barrel"));
  p.push(blk( 3, 1,  1, "minecraft:barrel"), blk( 3, 2,  1, "minecraft:barrel"));
  p.push(blk( 3, 1,  2, "minecraft:barrel"), blk( 3, 2,  2, "minecraft:barrel"));
  // Hay bales (north storage section)
  p.push(blk(-2, 1, -3, "minecraft:hay_block"), blk(0, 1, -3, "minecraft:hay_block"), blk(2, 1, -3, "minecraft:hay_block"));
  p.push(blk(-2, 2, -3, "minecraft:hay_block"), blk(0, 2, -3, "minecraft:hay_block"), blk(2, 2, -3, "minecraft:hay_block")); // 2nd tier
  // Chest (central record-keeping) and composter
  p.push(blk(0, 1, -1, "minecraft:chest"));
  p.push(blk(0, 1,  2, "minecraft:composter"));
  // Ceiling beam (spruce log ridge beam at y=7 center)
  p.push(...fill(0, 7, -3, 0, 7, 3, "minecraft:spruce_log"));
  // Lighting: hanging lanterns from beam + wall torches
  p.push(blk(0, 7, -2, "minecraft:lantern"), blk(0, 7, 0, "minecraft:lantern"), blk(0, 7, 2, "minecraft:lantern"));
  p.push(blk(-3, 3,  3, "minecraft:torch"), blk(3, 3,  3, "minecraft:torch")); // near door torches
  p.push(blk(-3, 3, -3, "minecraft:torch"), blk(3, 3, -3, "minecraft:torch")); // back wall torches
  return p;
}
function blacksmithBlueprint() {
  const p = [];
  p.push(...fill(-3, 1, -2, 3, 5, 2, "minecraft:air"));
  p.push(...fill(-3, 0, -2, 3, 0, 2, "minecraft:stone_bricks"));
  p.push(...fill(-3, 1, -2, 3, 3, -2, "minecraft:cobblestone"));
  p.push(...fill(3, 1, -1, 3, 3, 1, "minecraft:cobblestone"));
  p.push(...fill(-3, 1, -1, -3, 3, 1, "minecraft:cobblestone"));
  for (let x = -3; x <= 3; x++)
    for (let y = 1; y <= 3; y++)
      if (!(x >= -1 && x <= 1 && y <= 2))
        p.push(blk(x, y, 2, "minecraft:cobblestone"));
  p.push(...fill(-3, 4, -2, 3, 4, 2, "minecraft:cobblestone"));
  p.push(...fill(1, 5, -1, 2, 7, 0, "minecraft:cobblestone"));
  p.push(...fill(1, 8, -1, 2, 8, 0, "minecraft:air"));
  p.push(blk(-2, 2, -2, "minecraft:glass"), blk(2, 2, -2, "minecraft:glass"));
  p.push(blk(-3, 2, 0, "minecraft:glass"), blk(3, 2, 0, "minecraft:glass"));
  p.push(blk(-2, 1, -1, "minecraft:blast_furnace"));
  p.push(blk(-1, 1, -1, "minecraft:blast_furnace"));
  p.push(blk(2, 1, -1, "minecraft:anvil"));
  p.push(blk(2, 1, 0, "minecraft:smithing_table"));
  p.push(blk(-2, 1, 1, "minecraft:chest"));
  p.push(blk(1, 1, 0, "minecraft:sea_lantern"));
  return p;
}
function tradeStationBlueprint() {
  const p = [];
  p.push(...fill(-4, 1, -3, 4, 5, 3, "minecraft:air"));
  p.push(...fill(-4, 0, -3, 4, 0, 3, "minecraft:oak_planks"));
  p.push(...fill(-4, 1, -3, 4, 3, -3, "minecraft:birch_planks"));
  p.push(...fill(-4, 1, -2, -4, 3, 2, "minecraft:birch_planks"));
  p.push(...fill(4, 1, -2, 4, 3, 2, "minecraft:birch_planks"));
  p.push(...fill(-4, 1, 3, -4, 4, 3, "minecraft:oak_log"));
  p.push(...fill(4, 1, 3, 4, 4, 3, "minecraft:oak_log"));
  for (const wx of [-2, 0, 2]) p.push(blk(wx, 2, -3, "minecraft:glass"));
  p.push(blk(-4, 2, 0, "minecraft:glass"), blk(4, 2, 0, "minecraft:glass"));
  p.push(...fill(-4, 4, -3, 4, 4, 3, "minecraft:oak_planks"));
  p.push(...fill(-4, 5, 2, 4, 5, 3, "minecraft:oak_planks"));
  p.push(blk(-3, 1, -2, "minecraft:chest"), blk(3, 1, -2, "minecraft:chest"));
  p.push(blk(-2, 1, 0, "minecraft:crafting_table"));
  p.push(blk(2, 1, 0, "minecraft:lectern"));
  p.push(blk(0, 1, -1, "minecraft:sea_lantern"));
  for (let x = -3; x <= 3; x++) p.push(blk(x, 1, 3, "minecraft:iron_bars"));
  return p;
}
function treasuryBlueprint() {
  const p = [];
  // Clear volume (9x9, 10 tall)
  p.push(...fill(-4, 1, -4, 4, 10, 4, "minecraft:air"));
  // Foundation (deepslate bricks — heavy, secure)
  p.push(...fill(-4, 0, -4, 4, 0, 4, "minecraft:deepslate_bricks"));
  // Reinforced corner columns (double-thick deepslate)
  for (const [cx, cz] of [[-4,-4],[-4,4],[4,-4],[4,4]])
    p.push(...fill(cx, 1, cz, cx, 8, cz, "minecraft:deepslate_bricks"));
  // Outer walls (deepslate bricks, y=1-7, full solid vault construction)
  p.push(...fill(-3, 1, -4, 3, 7, -4, "minecraft:deepslate_bricks")); // north
  p.push(...fill(-3, 1,  4, 3, 7,  4, "minecraft:deepslate_bricks")); // south
  p.push(...fill(-4, 1, -3, -4, 7, 3, "minecraft:deepslate_bricks")); // west
  p.push(...fill( 4, 1, -3,  4, 7, 3, "minecraft:deepslate_bricks")); // east
  // Narrow door opening (south wall, single-wide x=0, y=1-2 — vault entrance)
  p.push(blk(0, 1, 4, "minecraft:air"), blk(0, 2, 4, "minecraft:air"));
  // Iron bar vault door frame flanking entrance (x=-1 and +1, y=1-3)
  for (let y = 1; y <= 3; y++) {
    p.push(blk(-1, y, 4, "minecraft:iron_bars"));
    p.push(blk( 1, y, 4, "minecraft:iron_bars"));
  }
  // Arrow-slit windows (narrow 1-block glass — secure, not traversable)
  p.push(blk(-2, 4, -4, "minecraft:glass"), blk(-2, 5, -4, "minecraft:glass")); // north L
  p.push(blk( 2, 4, -4, "minecraft:glass"), blk( 2, 5, -4, "minecraft:glass")); // north R
  p.push(blk(-4, 4, -1, "minecraft:glass"), blk(-4, 5, -1, "minecraft:glass")); // west upper
  p.push(blk(-4, 4,  1, "minecraft:glass"), blk(-4, 5,  1, "minecraft:glass")); // west lower
  p.push(blk( 4, 4, -1, "minecraft:glass"), blk( 4, 5, -1, "minecraft:glass")); // east upper
  p.push(blk( 4, 4,  1, "minecraft:glass"), blk( 4, 5,  1, "minecraft:glass")); // east lower
  p.push(blk(-2, 4,  4, "minecraft:glass"), blk( 2, 4,  4, "minecraft:glass")); // south (above vault door)
  // Decorative iron bar cross-grill pattern on upper walls (y=6)
  for (let x = -3; x <= 3; x += 2) {
    p.push(blk(x, 6, -4, "minecraft:iron_bars"), blk(x, 6, 4, "minecraft:iron_bars"));
  }
  for (let z = -3; z <= 3; z += 2) {
    p.push(blk(-4, 6, z, "minecraft:iron_bars"), blk(4, 6, z, "minecraft:iron_bars"));
  }
  // Solid roof (deepslate bricks y=8) + crenellations at y=9
  p.push(...fill(-4, 8, -4, 4, 8, 4, "minecraft:deepslate_bricks"));
  for (let x = -4; x <= 4; x += 2) {
    p.push(blk(x, 9, -4, "minecraft:deepslate_bricks"));
    p.push(blk(x, 9,  4, "minecraft:deepslate_bricks"));
  }
  for (let z = -3; z <= 3; z += 2) {
    p.push(blk(-4, 9, z, "minecraft:deepslate_bricks"));
    p.push(blk( 4, 9, z, "minecraft:deepslate_bricks"));
  }
  // Interior floor (polished andesite — elegant vault floor)
  p.push(...fill(-3, 1, -3, 3, 1, 3, "minecraft:polished_andesite"));
  // Gold block vault display (back north wall — treasure on pedestals)
  p.push(...fill(-3, 1, -3, 3, 1, -3, "minecraft:gold_block")); // gold row
  p.push(blk(-3, 2, -3, "minecraft:gold_block"), blk(0, 2, -3, "minecraft:gold_block"), blk(3, 2, -3, "minecraft:gold_block")); // pedestal tops
  // Chest vault storage (main double-rows)
  p.push(blk(-2, 1, -2, "minecraft:chest"), blk(-1, 1, -2, "minecraft:chest")); // double chest L
  p.push(blk( 1, 1, -2, "minecraft:chest"), blk( 2, 1, -2, "minecraft:chest")); // double chest R
  // Side chest stacks (against E/W inner walls)
  p.push(blk(-3, 1, -1, "minecraft:chest"), blk(-3, 2, -1, "minecraft:barrel"));
  p.push(blk(-3, 1,  1, "minecraft:chest"), blk(-3, 2,  1, "minecraft:barrel"));
  p.push(blk( 3, 1, -1, "minecraft:chest"), blk( 3, 2, -1, "minecraft:barrel"));
  p.push(blk( 3, 1,  1, "minecraft:chest"), blk( 3, 2,  1, "minecraft:barrel"));
  // Enchanting table + bookshelves (NW corner — royal enchantments)
  p.push(blk(-3, 1, -3, "minecraft:enchanting_table"));
  p.push(blk(-3, 2, -2, "minecraft:bookshelf"), blk(-2, 2, -3, "minecraft:bookshelf")); // boosting bookshelves
  p.push(blk( 3, 1, -3, "minecraft:bookshelf"), blk( 3, 2, -3, "minecraft:bookshelf")); // NE shelves
  // Brewing stand (alchemy/treasury apothecary)
  p.push(blk(0, 1, -1, "minecraft:brewing_stand"));
  // Lighting (sea lanterns + wall torches for a rich vault glow)
  p.push(blk(0, 7, 0, "minecraft:sea_lantern")); // central chandelier
  p.push(blk(-2, 3, -3, "minecraft:torch"), blk(2, 3, -3, "minecraft:torch")); // back wall torches
  p.push(blk(-3, 3,  0, "minecraft:torch"), blk(3, 3,  0, "minecraft:torch")); // side wall torches
  p.push(blk( 0, 3,  4, "minecraft:torch")); // above entrance
  return p;
}
function storageBlueprint() {
  const p = [];
  p.push(...fill(-3, 1, -3, 3, 5, 3, "minecraft:air"));
  p.push(...fill(-3, 0, -3, 3, 0, 3, "minecraft:cobblestone"));
  p.push(...fill(-3, 1, -3, 3, 4, -3, "minecraft:oak_log"));
  p.push(...fill(-3, 1, -3, -3, 4, 3, "minecraft:oak_log"));
  p.push(...fill(3, 1, -3, 3, 4, 3, "minecraft:oak_log"));
  for (let x = -3; x <= 3; x++) for (let y = 1; y <= 4; y++) if (!(x >= -1 && x <= 1 && y <= 2)) p.push(blk(x, y, 3, "minecraft:oak_planks"));
  for (let x = -2; x <= 2; x++) for (let y = 1; y <= 4; y++) p.push(blk(x, y, -3, "minecraft:oak_planks"));
  for (let z = -2; z <= 2; z++) for (let y = 1; y <= 4; y++) p.push(blk(-3, y, z, "minecraft:oak_planks"), blk(3, y, z, "minecraft:oak_planks"));
  p.push(...fill(-3, 5, -3, 3, 5, 3, "minecraft:oak_planks"));
  p.push(blk(-2, 2, -3, "minecraft:glass"), blk(2, 2, -3, "minecraft:glass"));
  p.push(blk(-3, 2, 0, "minecraft:glass"), blk(3, 2, 0, "minecraft:glass"));
  p.push(blk(-2, 1, -2, "minecraft:barrel"), blk(2, 1, -2, "minecraft:barrel"));
  p.push(blk(-2, 1, 0, "minecraft:barrel"), blk(2, 1, 0, "minecraft:barrel"));
  p.push(blk(-2, 1, 2, "minecraft:barrel"), blk(2, 1, 2, "minecraft:barrel"));
  p.push(blk(2, 1, 2, "minecraft:chest"));
  p.push(blk(0, 2, 0, "minecraft:sea_lantern"));
  return p;
}
function armoryBlueprint() {
  const p = [];
  p.push(...fill(-6, 1, -2, 6, 6, 2, "minecraft:air"));
  p.push(...fill(-6, 0, -2, 6, 0, 2, "minecraft:stone_bricks"));
  p.push(...fill(-6, 1, -2, 6, 5, -2, "minecraft:stone_bricks"));
  p.push(...fill(-6, 1, -1, -6, 5, 1, "minecraft:stone_bricks"));
  p.push(...fill(6, 1, -1, 6, 5, 1, "minecraft:stone_bricks"));
  for (let x = -6; x <= 6; x++) for (let y = 1; y <= 5; y++) if (!(x >= -1 && x <= 1 && y <= 2)) p.push(blk(x, y, 2, "minecraft:stone_bricks"));
  p.push(...fill(-6, 6, -2, 6, 6, 2, "minecraft:stone_bricks"));
  p.push(blk(-4, 3, -2, "minecraft:glass"), blk(-1, 3, -2, "minecraft:glass"), blk(2, 3, -2, "minecraft:glass"));
  p.push(blk(-4, 3, 2, "minecraft:glass"), blk(-1, 3, 2, "minecraft:glass"), blk(2, 3, 2, "minecraft:glass"));
  for (const ax of [-5, -3, -1, 1, 3, 5]) {
    p.push(blk(ax, 1, -1, "minecraft:chiseled_stone_bricks"), blk(ax, 1, 1, "minecraft:chiseled_stone_bricks"));
    p.push(blk(ax, 2, -1, "minecraft:iron_bars"), blk(ax, 2, 1, "minecraft:iron_bars"));
  }
  p.push(blk(-4, 5, 0, "minecraft:sea_lantern"), blk(0, 5, 0, "minecraft:sea_lantern"), blk(4, 5, 0, "minecraft:sea_lantern"));
  p.push(blk(-5, 1, 0, "minecraft:chest"), blk(5, 1, 0, "minecraft:chest"));
  return p;
}
function towerBlueprint() {
  const p = [];
  p.push(...fill(-2, 1, -2, 2, 12, 2, "minecraft:air"));
  p.push(...fill(-2, 0, -2, 2, 0, 2, "minecraft:stone_bricks"));
  for (let y = 1; y <= 11; y++) {
    for (let x = -2; x <= 2; x++) {
      for (let z = -2; z <= 2; z++) {
        if (x === -2 || x === 2 || z === -2 || z === 2) {
          if (!(x === 0 && z === 2 && y <= 2)) p.push(blk(x, y, z, "minecraft:stone_bricks"));
        }
      }
    }
  }
  for (let x = -2; x <= 2; x++) {
    for (let z = -2; z <= 2; z++) {
      p.push(blk(x, 12, z, x % 2 === 0 || z % 2 === 0 ? "minecraft:stone_bricks" : "minecraft:air"));
    }
  }
  p.push(blk(-2, 4, 0, "minecraft:glass"), blk(2, 4, 0, "minecraft:glass"), blk(0, 4, -2, "minecraft:glass"));
  p.push(blk(-2, 8, 0, "minecraft:glass"), blk(2, 8, 0, "minecraft:glass"), blk(0, 8, -2, "minecraft:glass"));
  for (let y = 1; y <= 10; y++) p.push(blk(1, y, 1, "minecraft:ladder"));
  p.push(blk(0, 6, 0, "minecraft:sea_lantern"), blk(0, 11, 0, "minecraft:sea_lantern"));
  p.push(blk(0, 12, 0, "minecraft:sea_lantern"));
  return p;
}
function wallLongBlueprint() {
  const p = [];
  p.push(...fill(-5, 1, -1, 5, 5, 1, "minecraft:air"));
  p.push(...fill(-5, 0, -1, 5, 0, 1, "minecraft:stone_bricks"));
  p.push(...fill(-5, 1, -1, 5, 4, 1, "minecraft:stone_bricks"));
  for (let x = -5; x <= 5; x++) {
    if ((x + 5) % 2 === 0) {
      p.push(blk(x, 5, -1, "minecraft:stone_bricks"), blk(x, 5, 0, "minecraft:stone_bricks"), blk(x, 5, 1, "minecraft:stone_bricks"));
    }
  }
  p.push(blk(-5, 3, 0, "minecraft:torch"), blk(0, 3, 0, "minecraft:torch"), blk(5, 3, 0, "minecraft:torch"));
  return p;
}
function wallShortBlueprint() {
  const p = [];
  p.push(...fill(-2, 1, -1, 2, 5, 1, "minecraft:air"));
  p.push(...fill(-2, 0, -1, 2, 0, 1, "minecraft:stone_bricks"));
  p.push(...fill(-2, 1, -1, 2, 4, 1, "minecraft:stone_bricks"));
  for (let x = -2; x <= 2; x++) {
    if ((x + 2) % 2 === 0) {
      p.push(blk(x, 5, -1, "minecraft:stone_bricks"), blk(x, 5, 0, "minecraft:stone_bricks"), blk(x, 5, 1, "minecraft:stone_bricks"));
    }
  }
  p.push(blk(0, 3, 0, "minecraft:torch"));
  return p;
}

// ── Tall Stone Wall (5 wide × 10 tall, same z-depth as other walls) ─────────
function wallTallBlueprint() {
  const p = [];
  p.push(...fill(-2, 1, -1, 2, 11, 1, "minecraft:air"));
  p.push(...fill(-2, 0, -1, 2, 0, 1, "minecraft:stone_bricks")); // foundation
  p.push(...fill(-2, 1, -1, 2, 9, 1, "minecraft:stone_bricks")); // wall body
  // Battlements at y=10 (same alternating pattern as wallShortBlueprint)
  for (let x = -2; x <= 2; x++) {
    if ((x + 2) % 2 === 0) {
      p.push(blk(x, 10, -1, "minecraft:stone_bricks"), blk(x, 10, 0, "minecraft:stone_bricks"), blk(x, 10, 1, "minecraft:stone_bricks"));
    }
  }
  // Torches at mid-height on inner face
  p.push(blk(-2, 5, 0, "minecraft:torch"), blk(0, 5, 0, "minecraft:torch"), blk(2, 5, 0, "minecraft:torch"));
  return p;
}

// ── King's Castle (25×21 grand keep, two floors, four towers, throne hall) ───
// Origin block = throne room floor centre.
// Interior access to upper floor: place a ladder on the north interior wall.
function kingCastleBlueprint() {
  const p = [];

  // === CLEAR VOLUME (26w × 21d × 23h) ===
  p.push(...fill(-12, 1, -10, 12, 23, 10, "minecraft:air"));

  // === FOUNDATION ===
  p.push(...fill(-12, 0, -10, 12, 0, 10, "minecraft:stone_bricks"));

  // === FULL PERIMETER OUTER WALLS (y=1-14, 1-block thick) ===
  p.push(...fill(-12, 1, -10, 12, 14, -10, "minecraft:stone_bricks")); // North
  p.push(...fill(-12, 1,  10, 12, 14,  10, "minecraft:stone_bricks")); // South
  p.push(...fill(-12, 1,  -9, -12, 14,  9, "minecraft:stone_bricks")); // West
  p.push(...fill( 12, 1,  -9,  12, 14,  9, "minecraft:stone_bricks")); // East

  // === MAIN GATE OPENING (south wall, 5 wide × 4 tall) ===
  p.push(...fill(-2, 1, 10, 2, 4, 10, "minecraft:air"));
  // Iron bar portcullis hanging over gate arch (y=5)
  for (let x = -2; x <= 2; x++) p.push(blk(x, 5, 10, "minecraft:iron_bars"));

  // === CORNER TOWERS (4×4, y=1-20, tower core hollow y=1-18) ===
  for (const [tx, tz] of [[-12,-10], [9,-10], [-12,7], [9,7]]) {
    p.push(...fill(tx, 1, tz, tx+3, 20, tz+3, "minecraft:stone_bricks"));
    p.push(...fill(tx+1, 1, tz+1, tx+2, 18, tz+2, "minecraft:air")); // hollow core
    // Arrow slit windows on outer faces
    p.push(blk(tx+1, 6, tz, "minecraft:glass"), blk(tx+2, 6, tz, "minecraft:glass"));
    p.push(blk(tx, 6, tz+1, "minecraft:glass"), blk(tx, 6, tz+2, "minecraft:glass"));
    p.push(blk(tx+1, 13, tz, "minecraft:glass"), blk(tx+2, 13, tz, "minecraft:glass"));
    p.push(blk(tx, 13, tz+1, "minecraft:glass"), blk(tx, 13, tz+2, "minecraft:glass"));
  }
  // Tower battlements (y=21, alternating merlons)
  for (const [tx, tz] of [[-12,-10],[9,-10],[-12,7],[9,7]]) {
    for (let dx = 0; dx <= 3; dx++) {
      for (let dz = 0; dz <= 3; dz++) {
        if ((dx + dz) % 2 === 0) p.push(blk(tx+dx, 21, tz+dz, "minecraft:stone_bricks"));
      }
    }
  }

  // === MAIN WALL BATTLEMENTS (y=15, alternating merlons) ===
  for (let x = -12; x <= 12; x += 2) {
    p.push(blk(x, 15, -10, "minecraft:stone_bricks")); // North
    p.push(blk(x, 15,  10, "minecraft:stone_bricks")); // South
  }
  for (let z = -9; z <= 9; z += 2) {
    p.push(blk(-12, 15, z, "minecraft:stone_bricks")); // West
    p.push(blk( 12, 15, z, "minecraft:stone_bricks")); // East
  }

  // === MAIN WALL WINDOWS (ground level & upper level) ===
  // North wall
  for (const wx of [-7, -4, 4, 7]) {
    p.push(blk(wx, 5, -10, "minecraft:glass"), blk(wx, 6, -10, "minecraft:glass"));
    p.push(blk(wx, 11, -10, "minecraft:glass"), blk(wx, 12, -10, "minecraft:glass"));
  }
  // West / East walls
  for (const wz of [-5, 0, 5]) {
    p.push(blk(-12, 5, wz, "minecraft:glass"), blk(-12, 6, wz, "minecraft:glass"));
    p.push(blk(-12, 11, wz, "minecraft:glass"), blk(-12, 12, wz, "minecraft:glass"));
    p.push(blk(12, 5, wz, "minecraft:glass"), blk(12, 6, wz, "minecraft:glass"));
    p.push(blk(12, 11, wz, "minecraft:glass"), blk(12, 12, wz, "minecraft:glass"));
  }

  // === 2ND FLOOR PLATFORM (y=9, dark oak planks ceiling/floor) ===
  p.push(...fill(-11, 9, -9, 11, 9, 9, "minecraft:dark_oak_planks"));

  // ─────────────────────────────────────────────────────────────────────────
  // GROUND FLOOR INTERIOR (y=1 – 8)
  // ─────────────────────────────────────────────────────────────────────────

  // Interior floor (stone bricks border, polished andesite main hall)
  p.push(...fill(-11, 1, -9, 11, 1, 9, "minecraft:stone_bricks"));
  p.push(...fill( -8, 1, -8,  8, 1, 8, "minecraft:polished_andesite"));
  // Red carpet aisle (gate → throne, z-axis)
  p.push(...fill(-1, 1, -9, 1, 1, 9, "minecraft:red_carpet"));

  // === THRONE (north end, z=-8 to -9) ===
  p.push(...fill(-3, 1, -9, 3, 1, -8, "minecraft:obsidian")); // throne dais
  p.push(blk(0, 2, -9, "minecraft:gold_block")); // throne seat
  p.push(blk(-2, 2, -9, "minecraft:obsidian"), blk(2, 2, -9, "minecraft:obsidian")); // armrests
  p.push(blk(-2, 3, -9, "minecraft:gold_block"), blk(0, 3, -9, "minecraft:gold_block"), blk(2, 3, -9, "minecraft:gold_block")); // throne back rail
  p.push(blk( 0, 4, -9, "minecraft:gold_block")); // throne crown peak
  p.push(blk(0, 2, -8, "minecraft:lectern")); // royal lectern
  p.push(blk(-1, 1, -8, "minecraft:obsidian"), blk(1, 1, -8, "minecraft:obsidian")); // dais step accent
  p.push(blk(0, 8, -7, "minecraft:bell")); // ceremonial bell above throne

  // === INTERIOR COLUMNS (stripped dark oak, y=2-8) ===
  for (const [cx, cz] of [[-7,-7],[7,-7],[-7,0],[7,0],[-7,7],[7,7]]) {
    p.push(...fill(cx, 2, cz, cx, 8, cz, "minecraft:stripped_dark_oak_log"));
  }

  // === BANQUET TABLES (oak planks at y=2, flanking the aisle) ===
  p.push(...fill(-7, 2, -5, -3, 2, 5, "minecraft:oak_planks")); // West table
  p.push(...fill( 3, 2, -5,  7, 2, 5, "minecraft:oak_planks")); // East table
  // Barrel chairs around tables
  for (let z = -4; z <= 4; z += 2) {
    p.push(blk(-8, 1, z, "minecraft:barrel"), blk(-2, 1, z, "minecraft:barrel")); // west table
    p.push(blk( 2, 1, z, "minecraft:barrel"), blk( 8, 1, z, "minecraft:barrel")); // east table
  }
  // Table centrepiece lanterns
  p.push(blk(-5, 3, -3, "minecraft:lantern"), blk(-5, 3, 0, "minecraft:sea_lantern"), blk(-5, 3, 3, "minecraft:lantern"));
  p.push(blk( 5, 3, -3, "minecraft:lantern"), blk( 5, 3, 0, "minecraft:sea_lantern"), blk( 5, 3, 3, "minecraft:lantern"));

  // === BOOKSHELVES (inner north wall, flanking throne) ===
  p.push(...fill(-11, 2, -8, -9, 5, -5, "minecraft:bookshelf")); // NW shelves
  p.push(...fill(  9, 2, -8, 11, 5, -5, "minecraft:bookshelf")); // NE shelves
  p.push(...fill(-11, 2,  3, -9, 5,  6, "minecraft:bookshelf")); // SW shelves
  p.push(...fill(  9, 2,  3, 11, 5,  6, "minecraft:bookshelf")); // SE shelves

  // === FIREPLACE (west wall, centre) ===
  p.push(...fill(-12, 2, -1, -11, 6, 1, "minecraft:stone_bricks")); // chimney stack
  p.push(blk(-12, 1, 0, "minecraft:netherrack")); // hearth
  p.push(blk(-12, 2, -1, "minecraft:stone_bricks"), blk(-12, 2, 1, "minecraft:stone_bricks")); // hearth wings

  // === EAST WING — trophy / store ===
  p.push(blk(12, 1, -5, "minecraft:gold_block"), blk(12, 1, 5, "minecraft:gold_block")); // trophy pedestals
  p.push(blk(12, 2, -5, "minecraft:chest"), blk(12, 2, 5, "minecraft:chest")); // chests on pedestals
  p.push(blk(10, 1, 7, "minecraft:brewing_stand")); // court alchemist stand

  // === ENTRANCE STORAGE (south corners) ===
  p.push(blk(-9, 1, 8, "minecraft:chest"), blk(-8, 1, 8, "minecraft:chest"));
  p.push(blk( 8, 1, 8, "minecraft:chest"), blk( 9, 1, 8, "minecraft:chest"));
  p.push(blk(-10, 1, 6, "minecraft:crafting_table")); // entrance crafting station

  // === GRAND ENTRANCE STAIRCASE (south exterior, outside south gate z=10) ===
  // Raised stone approach platform
  p.push(...fill(-4, 0, 11, 4, 0, 15, "minecraft:stone_bricks"));
  // Flanking guard pillars with torches
  p.push(...fill(-5, 1, 11, -5, 4, 15, "minecraft:stone_bricks"));
  p.push(...fill( 5, 1, 11,  5, 4, 15, "minecraft:stone_bricks"));
  p.push(blk(-5, 5, 15, "minecraft:torch"), blk(5, 5, 15, "minecraft:torch"));
  // Step tiers (rise from platform to gate level)
  p.push(...fill(-3, 1, 11, 3, 1, 11, "minecraft:stone_bricks")); // step 1
  p.push(...fill(-3, 2, 12, 3, 2, 12, "minecraft:stone_bricks")); // step 2
  // Gate approach wall caps
  p.push(blk(-4, 1, 12, "minecraft:stone_bricks"), blk(4, 1, 12, "minecraft:stone_bricks"));

  // === FLAGPOLES on corner tower tops ===
  for (const [tx, tz] of [[-12,-10],[9,-10],[-12,7],[9,7]]) {
    // Oak fence flagpole (3 tall above tower top)
    p.push(blk(tx+1, 22, tz+1, "minecraft:oak_fence"));
    p.push(blk(tx+1, 23, tz+1, "minecraft:oak_fence"));
    p.push(blk(tx+1, 24, tz+1, "minecraft:oak_fence"));
    // Red wool flag (2 blocks extending from pole)
    p.push(blk(tx+2, 23, tz+1, "minecraft:red_wool"));
    p.push(blk(tx+2, 24, tz+1, "minecraft:red_wool"));
    p.push(blk(tx+3, 24, tz+1, "minecraft:red_wool")); // flag tip
  }

  // === INTERIOR STAIRCASE (NW corner, y=1 → y=10 upper floor) ===
  // Rising step-blocks along the west inner wall northward
  for (let s = 0; s < 9; s++) {
    p.push(blk(-10, 1+s, -7+s, "minecraft:stone_bricks")); // stair step block
  }
  // West walkway along upper floor perimeter
  p.push(...fill(-11, 9, -8, -11, 9, 7, "minecraft:dark_oak_planks"));

  // === UPPER FLOOR BALCONY RAILS (iron bars along 2nd floor edges) ===
  for (let x = -10; x <= 10; x++) {
    if (x < -1 || x > 1) p.push(blk(x, 10, 8, "minecraft:iron_bars")); // south edge
  }
  for (let z = -7; z <= 7; z++) {
    p.push(blk(-10, 10, z, "minecraft:iron_bars")); // west edge
    p.push(blk( 10, 10, z, "minecraft:iron_bars")); // east edge
  }

  // === THRONE DAIS ENHANCEMENTS ===
  // Purple carpet on dais
  for (let x = -2; x <= 2; x++) p.push(blk(x, 2, -9, "minecraft:purple_carpet"));
  // Flanking throne pillars
  p.push(blk(-4, 2, -8, "minecraft:stone_bricks"), blk(-4, 3, -8, "minecraft:stone_bricks"), blk(-4, 4, -8, "minecraft:stone_bricks"));
  p.push(blk( 4, 2, -8, "minecraft:stone_bricks"), blk( 4, 3, -8, "minecraft:stone_bricks"), blk( 4, 4, -8, "minecraft:stone_bricks"));

  // === GROUND FLOOR CHANDELIERS (sea lanterns at y=8) ===
  p.push(blk( 0, 8, -4, "minecraft:sea_lantern"), blk( 0, 8, 0, "minecraft:sea_lantern"), blk( 0, 8, 4, "minecraft:sea_lantern"));
  p.push(blk(-5, 8, -4, "minecraft:sea_lantern"), blk(-5, 8, 4, "minecraft:sea_lantern"));
  p.push(blk( 5, 8, -4, "minecraft:sea_lantern"), blk( 5, 8, 4, "minecraft:sea_lantern"));
  p.push(blk(-9, 8,  0, "minecraft:lantern"), blk( 9, 8, 0, "minecraft:lantern")); // side hall lanterns

  // ─────────────────────────────────────────────────────────────────────────
  // UPPER FLOOR (y=10 – 14)
  // ─────────────────────────────────────────────────────────────────────────
  p.push(...fill(-11, 10, -9, 11, 14, 9, "minecraft:air")); // clear upper interior

  // Upper carpet runner
  p.push(...fill(-1, 10, -8, 1, 10, 8, "minecraft:red_carpet"));
  p.push(...fill(-4, 10, -8, 4, 10, -4, "minecraft:red_carpet")); // royal wing carpet

  // === ROYAL CHAMBERS (north side) ===
  p.push(blk( 0, 11, -7, "minecraft:white_bed")); // royal bed
  p.push(blk(-3, 11, -7, "minecraft:chest"), blk(3, 11, -7, "minecraft:chest")); // royal chests
  p.push(blk(-5, 11, -5, "minecraft:enchanting_table")); // enchanting
  p.push(blk( 5, 11, -5, "minecraft:brewing_stand")); // brewing
  p.push(blk(-5, 11, -3, "minecraft:crafting_table")); // royal crafting
  p.push(blk( 5, 11, -3, "minecraft:chest")); // supplies
  p.push(...fill(-9, 11, -8, -6, 13, -8, "minecraft:bookshelf")); // N bookshelves
  p.push(...fill( 6, 11, -8,  9, 13, -8, "minecraft:bookshelf"));

  // === PARTITION WALL separating chambers from south lounge ===
  p.push(...fill(-9, 11, -2, -4, 13, -2, "minecraft:stone_bricks"));
  p.push(...fill( 4, 11, -2,  9, 13, -2, "minecraft:stone_bricks"));
  p.push(...fill(-1, 11, -2,  1, 13, -2, "minecraft:air")); // doorway

  // === UPPER LOUNGE / BALCONY AREA (south) ===
  p.push(blk(-6, 11, 4, "minecraft:barrel"), blk(6, 11, 4, "minecraft:barrel")); // lounge seating
  p.push(blk(-4, 11, 6, "minecraft:chest"), blk(4, 11, 6, "minecraft:chest")); // upper storage
  p.push(blk( 0, 11, 7, "minecraft:lectern")); // balcony overlook lectern
  p.push(...fill(-9, 11, 3, -6, 13, 3, "minecraft:bookshelf")); // south bookshelves
  p.push(...fill( 6, 11, 3,  9, 13, 3, "minecraft:bookshelf"));

  // === UPPER FLOOR CHANDELIERS ===
  p.push(blk( 0, 14, -5, "minecraft:sea_lantern"), blk( 0, 14, 3, "minecraft:sea_lantern"));
  p.push(blk(-5, 14, -5, "minecraft:sea_lantern"), blk(5, 14, -5, "minecraft:sea_lantern"));
  p.push(blk(-5, 14,  3, "minecraft:sea_lantern"), blk(5, 14,  3, "minecraft:sea_lantern"));

  return p;
}

// ── Stone Gate (9 wide, joinable with all wall types — same z-depth) ─────────
// Placing tip: gate left end (x=-4) should align with the end of an adjacent wall.
// e.g., place gate origin 9 blocks past a wall_long origin (gap-free join).
function stoneGateBlueprint() {
  const p = [];
  // Clear volume
  p.push(...fill(-4, 1, -1, 4, 9, 1, "minecraft:air"));
  // Foundation across full width
  p.push(...fill(-4, 0, -1, 4, 0, 1, "minecraft:stone_bricks"));
  // ── Left tower (x=-4 to -3, y=1-7) ─────────────────────────────────────
  p.push(...fill(-4, 1, -1, -3, 7, 1, "minecraft:stone_bricks"));
  // ── Right tower (x=3 to 4, y=1-7) ──────────────────────────────────────
  p.push(...fill(3, 1, -1, 4, 7, 1, "minecraft:stone_bricks"));
  // ── Left inner pillar (x=-2, y=1-4) matches wall_long height ───────────
  p.push(...fill(-2, 1, -1, -2, 4, 1, "minecraft:stone_bricks"));
  // ── Right inner pillar (x=2, y=1-4) ────────────────────────────────────
  p.push(...fill(2, 1, -1, 2, 4, 1, "minecraft:stone_bricks"));
  // ── Gate arch lintel (y=5, x=-2 to +2, full z-depth) ───────────────────
  p.push(...fill(-2, 5, -1, 2, 5, 1, "minecraft:stone_bricks"));
  // ── Wall walk on top of arch (y=6, x=-2 to +2) ──────────────────────────
  p.push(...fill(-2, 6, -1, 2, 6, 1, "minecraft:stone_bricks"));
  // ── Crenelation / battlements on arch walk (y=7, alternating) ───────────
  for (let x = -2; x <= 2; x++) {
    if (x % 2 === 0) {
      p.push(blk(x, 7, -1, "minecraft:stone_bricks"), blk(x, 7, 1, "minecraft:stone_bricks"));
    }
  }
  // ── Tower battlements (y=8, alternating) ────────────────────────────────
  for (const tx of [-4, -3, 3, 4]) {
    p.push(blk(tx, 8, -1, "minecraft:stone_bricks"), blk(tx, 8, 1, "minecraft:stone_bricks"));
    if (tx === -3 || tx === 3) p.push(blk(tx, 8, 0, "minecraft:stone_bricks"));
  }
  // ── Iron-bar portcullis in gateway arch (y=3-5 at z=0, above head-height) ─
  // Hangs from the arch lintel — decorative, allows passage at y=1-2
  for (let y = 3; y <= 5; y++) {
    p.push(blk(-1, y, 0, "minecraft:iron_bars"));
    p.push(blk(0, y, 0, "minecraft:iron_bars"));
    p.push(blk(1, y, 0, "minecraft:iron_bars"));
  }
  // ── Torches on inner tower faces ────────────────────────────────────────
  p.push(blk(-3, 4, 0, "minecraft:torch"), blk(3, 4, 0, "minecraft:torch"));
  // ── Arrow slits on tower outer faces (glass) ────────────────────────────
  p.push(blk(-4, 4, 0, "minecraft:glass"), blk(4, 4, 0, "minecraft:glass"));
  // ── Sea lantern on arch walk ceiling (y=6, center) ──────────────────────
  p.push(blk(0, 6, 0, "minecraft:sea_lantern"));
  return p;
}
// ── House blueprints (3 random designs, each with 2-3 beds) ────────────────
function houseBlueprintCottage() {
  const p = [];
  // Clear volume (7x6 footprint, 7 tall)
  p.push(...fill(-3, 1, -2, 3, 7, 3, "minecraft:air"));
  // Foundation (cobblestone)
  p.push(...fill(-3, 0, -2, 3, 0, 3, "minecraft:cobblestone"));
  // Corner log posts (oak log)
  for (const [cx, cz] of [[-3,-2],[-3,3],[3,-2],[3,3]])
    p.push(...fill(cx, 1, cz, cx, 5, cz, "minecraft:oak_log"));
  // Walls (oak planks)
  p.push(...fill(-2, 1, -2, 2, 4, -2, "minecraft:oak_planks")); // back/north wall
  p.push(...fill(-2, 1,  3, 2, 4,  3, "minecraft:oak_planks")); // front/south wall
  p.push(...fill(-3, 1, -1, -3, 4,  2, "minecraft:oak_planks")); // west wall
  p.push(...fill( 3, 1, -1,  3, 4,  2, "minecraft:oak_planks")); // east wall
  // Double-wide door opening (south wall, x=-1..0, y=1-2)
  p.push(blk(-1, 1, 3, "minecraft:air"), blk(0, 1, 3, "minecraft:air"));
  p.push(blk(-1, 2, 3, "minecraft:air"), blk(0, 2, 3, "minecraft:air"));
  // Doorstep
  p.push(blk(-1, 0, 4, "minecraft:cobblestone"), blk(0, 0, 4, "minecraft:cobblestone"));
  // Windows (2-high glass, each wall)
  p.push(blk(-1, 3, -2, "minecraft:glass"), blk(1, 3, -2, "minecraft:glass")); // north 2-wide
  p.push(blk(-1, 4, -2, "minecraft:glass"), blk(1, 4, -2, "minecraft:glass"));
  p.push(blk(-3, 3,  1, "minecraft:glass"), blk(-3, 4,  1, "minecraft:glass")); // west
  p.push(blk( 3, 3,  1, "minecraft:glass"), blk( 3, 4,  1, "minecraft:glass")); // east
  p.push(blk( 2, 3,  3, "minecraft:glass")); // south flanking door
  // Stepped pyramid roof (oak planks)
  p.push(...fill(-3, 5, -2, 3, 5, 3, "minecraft:oak_planks"));
  p.push(...fill(-2, 6, -1, 2, 6, 2, "minecraft:oak_planks"));
  p.push(...fill(-1, 7,  0, 1, 7, 1, "minecraft:oak_planks"));
  // Interior floor (oak planks + carpet strip)
  p.push(...fill(-2, 1, -1, 2, 1, 2, "minecraft:oak_planks"));
  p.push(blk(0, 1, -1, "minecraft:brown_carpet"), blk(0, 1, 0, "minecraft:brown_carpet"), blk(0, 1, 1, "minecraft:brown_carpet"), blk(0, 1, 2, "minecraft:brown_carpet"));
  // 2 beds (against east wall)
  p.push(blk( 2, 1, 0, "minecraft:white_bed"), blk(2, 1, 2, "minecraft:white_bed"));
  // Furniture — cozy cottage feel
  p.push(blk(-2, 1, -1, "minecraft:crafting_table")); // workbench corner
  p.push(blk(-2, 1,  0, "minecraft:furnace"));          // fireplace/cooking
  p.push(blk(-2, 2,  0, "minecraft:stone_bricks"));     // chimney above furnace
  p.push(blk(-2, 3,  0, "minecraft:stone_bricks"));
  p.push(blk(-2, 1,  2, "minecraft:chest"));            // personal storage
  p.push(blk( 2, 1, -1, "minecraft:bookshelf"));        // bookshelf by bed
  p.push(blk(-2, 2, -1, "minecraft:bookshelf"));        // wall shelf
  p.push(blk(-2, 1,  1, "minecraft:barrel"));           // food barrel
  p.push(blk( 0, 1, -1, "minecraft:flower_pot"));       // decorative pot
  // Lighting
  p.push(blk(0, 5, 1, "minecraft:lantern"));             // ceiling lantern
  p.push(blk(-2, 3, 1, "minecraft:torch"), blk(2, 3, 1, "minecraft:torch")); // wall torches
  p.push(blk(-2, 3, -1, "minecraft:torch")); // back wall torch
  return p;
}
function houseBlueprintStone() {
  const p = [];
  // Clear volume (9x7 footprint, 9 tall)
  p.push(...fill(-4, 1, -3, 4, 9, 3, "minecraft:air"));
  // Foundation (cobblestone)
  p.push(...fill(-4, 0, -3, 4, 0, 3, "minecraft:cobblestone"));
  // Stone brick walls (y=1-6)
  p.push(...fill(-4, 1, -3, 4, 6, -3, "minecraft:stone_bricks")); // north
  p.push(...fill(-4, 1,  3, 4, 6,  3, "minecraft:stone_bricks")); // south
  p.push(...fill(-4, 1, -2, -4, 6,  2, "minecraft:stone_bricks")); // west
  p.push(...fill( 4, 1, -2,  4, 6,  2, "minecraft:stone_bricks")); // east
  // Corner dark oak columns
  for (const [cx, cz] of [[-4,-3],[-4,3],[4,-3],[4,3]])
    p.push(...fill(cx, 1, cz, cx, 7, cz, "minecraft:dark_oak_log"));
  // Double-wide door opening (south wall, x=-1..0, y=1-3)
  p.push(blk(-1, 1, 3, "minecraft:air"), blk(0, 1, 3, "minecraft:air"));
  p.push(blk(-1, 2, 3, "minecraft:air"), blk(0, 2, 3, "minecraft:air"));
  p.push(blk(-1, 3, 3, "minecraft:air"), blk(0, 3, 3, "minecraft:air"));
  // Doorstep
  p.push(blk(-1, 0, 4, "minecraft:stone_bricks"), blk(0, 0, 4, "minecraft:stone_bricks"), blk(1, 0, 4, "minecraft:stone_bricks"));
  // Windows (2-high glass, multiple per wall)
  for (const wx of [-2, 2]) {
    p.push(blk(wx, 3, -3, "minecraft:glass"), blk(wx, 4, -3, "minecraft:glass")); // north 2 windows
    p.push(blk(wx, 3,  3, "minecraft:glass"), blk(wx, 4,  3, "minecraft:glass")); // south flanking door
  }
  p.push(blk(-4, 3, 0, "minecraft:glass"), blk(-4, 4, 0, "minecraft:glass")); // west center window
  p.push(blk( 4, 3, 0, "minecraft:glass"), blk( 4, 4, 0, "minecraft:glass")); // east center window
  // Flat stepped stone roof
  p.push(...fill(-4, 7, -3, 4, 7, 3, "minecraft:stone_bricks"));
  p.push(...fill(-3, 8, -2, 3, 8, 2, "minecraft:stone_bricks"));
  p.push(...fill(-2, 9, -1, 2, 9, 1, "minecraft:stone_bricks"));
  // Roof crenellations
  for (let x = -4; x <= 4; x += 2) { p.push(blk(x, 8, -3, "minecraft:stone_bricks")); p.push(blk(x, 8, 3, "minecraft:stone_bricks")); }
  // Interior floor (cobblestone + red carpet runner)
  p.push(...fill(-3, 1, -2, 3, 1, 2, "minecraft:cobblestone"));
  p.push(blk(0, 1, -2, "minecraft:red_carpet"), blk(0, 1, -1, "minecraft:red_carpet"), blk(0, 1, 0, "minecraft:red_carpet"), blk(0, 1, 1, "minecraft:red_carpet"), blk(0, 1, 2, "minecraft:red_carpet"));
  // 3 beds (along north wall — this house holds a small family)
  p.push(blk(-2, 1, -1, "minecraft:white_bed"), blk(0, 1, -1, "minecraft:white_bed"), blk(2, 1, -1, "minecraft:white_bed"));
  // Furniture — stone manor style
  p.push(blk(-3, 1, -2, "minecraft:chest"), blk(-2, 1, -2, "minecraft:chest")); // double chest storage
  p.push(blk( 2, 1, -2, "minecraft:chest"), blk( 3, 1, -2, "minecraft:chest")); // double chest storage
  p.push(blk(-3, 2, -2, "minecraft:bookshelf"), blk(-2, 2, -2, "minecraft:bookshelf")); // shelving above chests
  p.push(blk( 2, 2, -2, "minecraft:bookshelf"), blk( 3, 2, -2, "minecraft:bookshelf"));
  p.push(blk(-3, 1, -1, "minecraft:furnace"));  // cooking hearth
  p.push(blk(-3, 2, -1, "minecraft:stone_bricks")); // chimney
  p.push(blk(-3, 3, -1, "minecraft:stone_bricks"));
  p.push(blk( 3, 1, -1, "minecraft:crafting_table")); // workstation
  p.push(blk( 3, 1,  0, "minecraft:barrel"));          // storage barrel
  p.push(blk(-3, 1,  1, "minecraft:flower_pot"));      // window sill decoration
  p.push(blk( 3, 2, -2, "minecraft:bookshelf"));       // book nook
  // Lighting
  p.push(blk(0, 6, 0, "minecraft:sea_lantern")); // ceiling chandelier
  p.push(blk(-3, 4, 0, "minecraft:torch"), blk(3, 4, 0, "minecraft:torch")); // wall torches
  p.push(blk(0, 4, -3, "minecraft:torch")); // north wall torch
  return p;
}
function houseBlueprintFarmhouse() {
  const p = [];
  // Clear volume (8x6 footprint, 7 tall)
  p.push(...fill(-4, 1, -2, 3, 7, 3, "minecraft:air"));
  // Foundation (cobblestone)
  p.push(...fill(-4, 0, -2, 3, 0, 3, "minecraft:cobblestone"));
  // Spruce log corner posts
  for (const [cx, cz] of [[-4,-2],[-4,3],[3,-2],[3,3]])
    p.push(...fill(cx, 1, cz, cx, 5, cz, "minecraft:spruce_log"));
  // Birch plank walls (y=1-4)
  p.push(...fill(-3, 1, -2, 2, 4, -2, "minecraft:birch_planks")); // north
  p.push(...fill(-3, 1,  3, 2, 4,  3, "minecraft:birch_planks")); // south
  p.push(...fill(-4, 1, -1, -4, 4,  2, "minecraft:birch_planks")); // west
  p.push(...fill( 3, 1, -1,  3, 4,  2, "minecraft:birch_planks")); // east
  // Double-wide door (south, x=-1..0, y=1-2)
  p.push(blk(-1, 1, 3, "minecraft:air"), blk(0, 1, 3, "minecraft:air"));
  p.push(blk(-1, 2, 3, "minecraft:air"), blk(0, 2, 3, "minecraft:air"));
  p.push(blk(-1, 0, 4, "minecraft:cobblestone"), blk(0, 0, 4, "minecraft:cobblestone")); // doorstep
  // Windows (2-high glass on each wall)
  p.push(blk(-1, 3, -2, "minecraft:glass"), blk(-1, 4, -2, "minecraft:glass")); // north L
  p.push(blk( 1, 3, -2, "minecraft:glass"), blk( 1, 4, -2, "minecraft:glass")); // north R
  p.push(blk(-4, 3,  0, "minecraft:glass"), blk(-4, 4,  0, "minecraft:glass")); // west
  p.push(blk( 3, 3,  0, "minecraft:glass"), blk( 3, 4,  0, "minecraft:glass")); // east
  p.push(blk( 2, 3,  3, "minecraft:glass")); // south flanking door
  // Gabled birch roof (pyramid style)
  p.push(...fill(-4, 5, -2, 3, 5, 3, "minecraft:birch_planks"));
  p.push(...fill(-3, 6, -1, 2, 6, 2, "minecraft:birch_planks"));
  p.push(...fill(-2, 7,  0, 1, 7, 1, "minecraft:birch_planks"));
  // Interior floor (birch planks + green carpet runner — farm fresh)
  p.push(...fill(-3, 1, -1, 2, 1, 2, "minecraft:birch_planks"));
  p.push(blk(0, 1, -1, "minecraft:green_carpet"), blk(0, 1, 0, "minecraft:green_carpet"), blk(0, 1, 1, "minecraft:green_carpet"), blk(0, 1, 2, "minecraft:green_carpet"));
  // 2 beds (east wall)
  p.push(blk( 2, 1, 0, "minecraft:white_bed"), blk(2, 1, 2, "minecraft:white_bed"));
  // Furniture — farmhouse style
  p.push(blk(-3, 1, -1, "minecraft:barrel"));    // food barrel (crop storage)
  p.push(blk(-3, 1,  0, "minecraft:chest"));     // personal chest
  p.push(blk(-3, 1,  1, "minecraft:furnace"));   // cooking/hearth
  p.push(blk(-3, 2,  1, "minecraft:stone_bricks")); // chimney
  p.push(blk(-3, 3,  1, "minecraft:stone_bricks"));
  p.push(blk( 2, 1, -1, "minecraft:crafting_table")); // workbench
  p.push(blk( 1, 1, -1, "minecraft:composter"));  // compost bin (farm theme)
  p.push(blk(-3, 2, -1, "minecraft:bookshelf"));  // recipe books
  p.push(blk(-3, 2,  0, "minecraft:bookshelf"));
  p.push(blk( 2, 2, -1, "minecraft:flower_pot")); // window sill pot
  // Lighting
  p.push(blk(0, 5, 1, "minecraft:lantern"));      // ceiling lantern
  p.push(blk(-3, 3, -1, "minecraft:torch"), blk(2, 3, 1, "minecraft:torch")); // wall torches
  p.push(blk(0, 4, -2, "minecraft:torch")); // north wall torch
  return p;
}
function houseBlueprint() {
  const design = Math.floor(Math.random() * 3);
  if (design === 0) return houseBlueprintCottage();
  if (design === 1) return houseBlueprintStone();
  return houseBlueprintFarmhouse();
}

// ── Livestock Pen (large fenced enclosure) ─────────────────────────────────
function fenceEnclosureBlueprint() {
  const p = [];
  p.push(...fill(-10, 1, -10, 10, 4, 10, "minecraft:air"));
  p.push(...fill(-9, 0, -9, 9, 0, 9, "minecraft:dirt")); // interior floor
  // Perimeter fence posts (oak log, 3 tall) then fence between
  for (const [cx, cz] of [[-10,-10],[-10,10],[10,-10],[10,10]])
    p.push(...fill(cx, 1, cz, cx, 3, cz, "minecraft:oak_log"));
  // North and south fence runs
  for (let x = -9; x <= 9; x++) {
    p.push(blk(x, 1, -10, "minecraft:oak_fence"), blk(x, 2, -10, "minecraft:oak_fence"));
    p.push(blk(x, 1,  10, "minecraft:oak_fence"), blk(x, 2,  10, "minecraft:oak_fence"));
  }
  // West and east fence runs
  for (let z = -9; z <= 9; z++) {
    p.push(blk(-10, 1, z, "minecraft:oak_fence"), blk(-10, 2, z, "minecraft:oak_fence"));
    p.push(blk( 10, 1, z, "minecraft:oak_fence"), blk( 10, 2, z, "minecraft:oak_fence"));
  }
  // Fence gate on south wall (3 wide opening)
  p.push(blk(-1, 1, 10, "minecraft:fence_gate"), blk(0, 1, 10, "minecraft:fence_gate"), blk(1, 1, 10, "minecraft:fence_gate"));
  p.push(blk(-1, 2, 10, "minecraft:air"), blk(0, 2, 10, "minecraft:air"), blk(1, 2, 10, "minecraft:air"));
  // Interior: hay bales as feed stations
  p.push(blk(-8, 1, -8, "minecraft:hay_block"), blk(-7, 1, -8, "minecraft:hay_block"));
  p.push(blk( 8, 1, -8, "minecraft:hay_block"), blk( 7, 1, -8, "minecraft:hay_block"));
  // Water troughs (cauldrons)
  p.push(blk(-1, 1, -7, "minecraft:cauldron"), blk(0, 1, -7, "minecraft:cauldron"), blk(1, 1, -7, "minecraft:cauldron"));
  // Composter for feed
  p.push(blk(0, 1, 8, "minecraft:composter"));
  return p;
}

// ── Barn (large multi-purpose cattle building) ─────────────────────────────
function barnBlueprint() {
  const p = [];
  p.push(...fill(-6, 1, -4, 6, 10, 4, "minecraft:air"));
  p.push(...fill(-6, 0, -4, 6, 0, 4, "minecraft:cobblestone"));
  // Frame posts (dark oak log)
  for (const cx of [-6, -3, 0, 3, 6]) {
    p.push(...fill(cx, 1, -4, cx, 6, -4, "minecraft:dark_oak_log"));
    p.push(...fill(cx, 1,  4, cx, 6,  4, "minecraft:dark_oak_log"));
  }
  // Back and front walls (oak planks between posts)
  p.push(...fill(-5, 1, -4, 5, 5, -4, "minecraft:oak_planks"));
  p.push(...fill(-5, 1,  4, 5, 5,  4, "minecraft:oak_planks"));
  // Side walls (west and east)
  for (let z = -3; z <= 3; z++) {
    for (let y = 1; y <= 5; y++) {
      p.push(blk(-6, y, z, "minecraft:oak_planks"));
      p.push(blk( 6, y, z, "minecraft:oak_planks"));
    }
  }
  // Wide barn-door opening on front (x=-2..+2, y=1..4)
  for (let x = -2; x <= 2; x++) for (let y = 1; y <= 4; y++) p.push(blk(x, y, 4, "minecraft:air"));
  // Windows
  p.push(blk(-4, 4, -4, "minecraft:glass"), blk(4, 4, -4, "minecraft:glass"));
  p.push(blk(-4, 4,  4, "minecraft:glass"), blk(4, 4,  4, "minecraft:glass"));
  p.push(blk(-6, 4,  0, "minecraft:glass"), blk(6, 4,  0, "minecraft:glass"));
  // Hay-block roof (layered pyramid)
  p.push(...fill(-6, 7, -4, 6, 7, 4, "minecraft:hay_block"));
  p.push(...fill(-5, 8, -3, 5, 8, 3, "minecraft:hay_block"));
  p.push(...fill(-4, 9, -2, 4, 9, 2, "minecraft:hay_block"));
  p.push(...fill(-3,10, -1, 3,10, 1, "minecraft:hay_block"));
  // Interior dirt floor
  p.push(...fill(-5, 1, -3, 5, 1, 3, "minecraft:dirt"));
  // Stall hay bales (corners)
  p.push(blk(-4, 1, -3, "minecraft:hay_block"), blk(-4, 2, -3, "minecraft:hay_block"));
  p.push(blk( 4, 1, -3, "minecraft:hay_block"), blk( 4, 2, -3, "minecraft:hay_block"));
  p.push(blk(-4, 1,  2, "minecraft:hay_block"), blk(-4, 2,  2, "minecraft:hay_block"));
  p.push(blk( 4, 1,  2, "minecraft:hay_block"), blk( 4, 2,  2, "minecraft:hay_block"));
  // Stall dividers (fence)
  p.push(blk(-2, 1, 0, "minecraft:oak_fence"), blk(-2, 2, 0, "minecraft:oak_fence"));
  p.push(blk( 2, 1, 0, "minecraft:oak_fence"), blk( 2, 2, 0, "minecraft:oak_fence"));
  // Water troughs
  p.push(blk(-3, 1, 0, "minecraft:cauldron"), blk(3, 1, 0, "minecraft:cauldron"));
  // Storage chests
  p.push(blk(-5, 1, -3, "minecraft:chest"), blk(5, 1, -3, "minecraft:chest"));
  // Lighting
  p.push(blk(0, 6, 0, "minecraft:sea_lantern"));
  p.push(blk(-4, 5, 0, "minecraft:torch"), blk(4, 5, 0, "minecraft:torch"));
  return p;
}

// ── Farm Plot Blueprints (large, open, ready-to-plant) ─────────────────────
function farmPlotBlueprintWheat() {
  const p = [];
  // Clear a tall volume first
  p.push(...fill(-12, 1, -12, 22, 6, 22, "minecraft:air"));
  // === LARGE FARM PLOT A (20 wide x 20 deep) ===
  // Outer fence perimeter
  p.push(...fill(-12, 1, -12, 22, 1, -12, "minecraft:oak_fence")); // N
  p.push(...fill(-12, 1,  22, 22, 1,  22, "minecraft:oak_fence")); // S
  p.push(...fill(-12, 1, -11, -12, 1, 21, "minecraft:oak_fence")); // W
  p.push(...fill( 22, 1, -11,  22, 1, 21, "minecraft:oak_fence")); // E
  // Corner pillars
  for (const [fx, fz] of [[-12,-12],[-12,22],[22,-12],[22,22]])
    p.push(blk(fx, 1, fz, "minecraft:oak_fence"), blk(fx, 2, fz, "minecraft:oak_fence"), blk(fx, 3, fz, "minecraft:oak_fence"));
  // Gate opening south side
  p.push(blk(4, 1, 22, "minecraft:air"), blk(5, 1, 22, "minecraft:air"));
  // === 4 LARGE PLANTING STRIPS (each 9 wide x 20 long) with water channels ===
  // Strip 1 (columns x=-11..x=-3)
  p.push(...fill(-11, 0, -11, -3, 0, 21, "minecraft:farmland"));
  p.push(blk(-7, 0, -11, "minecraft:water")); // irrigation source (buried)
  for (let z = -10; z <= 21; z += 4) p.push(blk(-7, 0, z, "minecraft:water"));
  p.push(...fill(-7, 1, -11, -7, 1, 21, "minecraft:air")); // air above water
  // Strip 2 (columns x=-1..x=7)
  p.push(...fill(-1, 0, -11, 7, 0, 21, "minecraft:farmland"));
  p.push(blk(3, 0, -11, "minecraft:water"));
  for (let z = -10; z <= 21; z += 4) p.push(blk(3, 0, z, "minecraft:water"));
  p.push(...fill(3, 1, -11, 3, 1, 21, "minecraft:air"));
  // Strip 3 (columns x=9..x=17)
  p.push(...fill(9, 0, -11, 17, 0, 21, "minecraft:farmland"));
  p.push(blk(13, 0, -11, "minecraft:water"));
  for (let z = -10; z <= 21; z += 4) p.push(blk(13, 0, z, "minecraft:water"));
  p.push(...fill(13, 1, -11, 13, 1, 21, "minecraft:air"));
  // Divider paths (dirt paths between strips)
  p.push(...fill(-2, 0, -11, -2, 0, 21, "minecraft:dirt_path")); // between strip 1 & 2
  p.push(...fill( 8, 0, -11,  8, 0, 21, "minecraft:dirt_path")); // between strip 2 & 3
  // North & South edge paths
  p.push(...fill(-11, 0, -12, 21, 0, -12, "minecraft:dirt_path"));
  p.push(...fill(-11, 0,  22, 21, 0,  22, "minecraft:dirt_path"));
  // === TOOL SHED (east side, 5x4) ===
  p.push(...fill(19, 0, -11, 21, 0, -5, "minecraft:oak_planks")); // floor
  p.push(...fill(19, 1, -11, 21, 3, -11, "minecraft:oak_planks")); // N wall
  p.push(...fill(19, 1, -5,  21, 3,  -5, "minecraft:oak_planks")); // S wall
  p.push(...fill(19, 1, -10, 19, 3,  -6, "minecraft:oak_planks")); // W wall
  p.push(...fill(21, 1, -10, 21, 3,  -6, "minecraft:oak_planks")); // E wall
  p.push(blk(20, 1, -5, "minecraft:air"), blk(20, 2, -5, "minecraft:air")); // door
  p.push(...fill(19, 4, -11, 21, 4, -5, "minecraft:oak_planks")); // roof
  p.push(blk(19, 1, -10, "minecraft:chest"), blk(19, 1, -9, "minecraft:barrel")); // storage
  p.push(blk(19, 1, -7, "minecraft:composter"), blk(19, 1, -6, "minecraft:crafting_table"));
  p.push(blk(20, 3, -8, "minecraft:lantern"));
  return p;
}
function farmPlotBlueprintMixed() {
  const p = [];
  // Clear volume
  p.push(...fill(-12, 1, -12, 22, 6, 22, "minecraft:air"));
  // Fence perimeter
  p.push(...fill(-12, 1, -12, 22, 1, -12, "minecraft:oak_fence")); // N
  p.push(...fill(-12, 1,  22, 22, 1,  22, "minecraft:oak_fence")); // S
  p.push(...fill(-12, 1, -11, -12, 1, 21, "minecraft:oak_fence")); // W
  p.push(...fill( 22, 1, -11,  22, 1, 21, "minecraft:oak_fence")); // E
  for (const [fx, fz] of [[-12,-12],[-12,22],[22,-12],[22,22]])
    p.push(blk(fx, 1, fz, "minecraft:oak_fence"), blk(fx, 2, fz, "minecraft:oak_fence"), blk(fx, 3, fz, "minecraft:oak_fence"));
  p.push(blk(4, 1, 22, "minecraft:air"), blk(5, 1, 22, "minecraft:air")); // gate
  // === 4 QUARTER PLOTS (each 10x10, separated by paths + water) ===
  // NW plot
  p.push(...fill(-11, 0, -11, -2, 0, -2, "minecraft:farmland"));
  p.push(blk(-6, 0, -11, "minecraft:water")); // N channel source
  for (let z = -10; z <= -2; z += 3) p.push(blk(-6, 0, z, "minecraft:water"));
  p.push(...fill(-6, 1, -11, -6, 1, -2, "minecraft:air"));
  // NE plot
  p.push(...fill(1, 0, -11, 10, 0, -2, "minecraft:farmland"));
  p.push(blk(5, 0, -11, "minecraft:water"));
  for (let z = -10; z <= -2; z += 3) p.push(blk(5, 0, z, "minecraft:water"));
  p.push(...fill(5, 1, -11, 5, 1, -2, "minecraft:air"));
  // SW plot
  p.push(...fill(-11, 0, 2, -2, 0, 21, "minecraft:farmland"));
  p.push(blk(-6, 0, 2, "minecraft:water"));
  for (let z = 3; z <= 21; z += 3) p.push(blk(-6, 0, z, "minecraft:water"));
  p.push(...fill(-6, 1, 2, -6, 1, 21, "minecraft:air"));
  // SE plot
  p.push(...fill(1, 0, 2, 10, 0, 21, "minecraft:farmland"));
  p.push(blk(5, 0, 2, "minecraft:water"));
  for (let z = 3; z <= 21; z += 3) p.push(blk(5, 0, z, "minecraft:water"));
  p.push(...fill(5, 1, 2, 5, 1, 21, "minecraft:air"));
  // Center cross paths
  p.push(...fill(-11, 0, -1, 21, 0, 0, "minecraft:dirt_path")); // EW center path
  p.push(...fill(-1, 0, -11, 0, 0, 21, "minecraft:dirt_path")); // NS center path
  // Center water junction
  p.push(blk(-1, 0, -1, "minecraft:water"), blk(-1, 0, 0, "minecraft:water"), blk(0, 0, -1, "minecraft:water"), blk(0, 0, 0, "minecraft:water"));
  // === TOOL SHED east side ===
  p.push(...fill(12, 0, -11, 21, 0, -5, "minecraft:birch_planks"));
  p.push(...fill(12, 1, -11, 21, 3, -11, "minecraft:birch_planks"));
  p.push(...fill(12, 1, -5,  21, 3,  -5, "minecraft:birch_planks"));
  p.push(...fill(12, 1, -10, 12, 3, -6, "minecraft:birch_planks"));
  p.push(...fill(21, 1, -10, 21, 3, -6, "minecraft:birch_planks"));
  p.push(blk(16, 1, -5, "minecraft:air"), blk(16, 2, -5, "minecraft:air"));
  p.push(...fill(12, 4, -11, 21, 4, -5, "minecraft:birch_planks"));
  p.push(blk(12, 1, -10, "minecraft:chest"), blk(12, 1, -9, "minecraft:barrel"), blk(12, 1, -8, "minecraft:composter"));
  p.push(blk(16, 3, -8, "minecraft:lantern"));
  return p;
}
function farmPlotBlueprintPlantation() {
  const p = [];
  // Clear a large volume
  p.push(...fill(-14, 1, -14, 24, 7, 24, "minecraft:air"));
  // Fence perimeter (extra large plantation)
  p.push(...fill(-14, 1, -14, 24, 1, -14, "minecraft:oak_fence")); // N
  p.push(...fill(-14, 1,  24, 24, 1,  24, "minecraft:oak_fence")); // S
  p.push(...fill(-14, 1, -13, -14, 1, 23, "minecraft:oak_fence")); // W
  p.push(...fill( 24, 1, -13,  24, 1, 23, "minecraft:oak_fence")); // E
  for (const [fx, fz] of [[-14,-14],[-14,24],[24,-14],[24,24]])
    p.push(blk(fx, 1, fz, "minecraft:oak_fence"), blk(fx, 2, fz, "minecraft:oak_fence"), blk(fx, 3, fz, "minecraft:oak_fence"));
  // Gate south center
  p.push(blk(4, 1, 24, "minecraft:air"), blk(5, 1, 24, "minecraft:air"));
  // === 6 LARGE PLANTING STRIPS (each ~6 wide x 38 long) ===
  const strips = [-13, -6, 1, 8, 15, 19]; // x starts of each strip (width ~5)
  const waterCols = [-10, -3, 4, 11, 17]; // x of water channel in each strip
  for (let s = 0; s < 5; s++) {
    const x0 = strips[s]; const x1 = strips[s + 1] - 2; const wx = waterCols[s];
    p.push(...fill(x0, 0, -13, x1, 0, 23, "minecraft:farmland"));
    p.push(blk(wx, 0, -13, "minecraft:water"));
    for (let z = -12; z <= 23; z += 4) p.push(blk(wx, 0, z, "minecraft:water"));
    p.push(...fill(wx, 1, -13, wx, 1, 23, "minecraft:air"));
    // Dirt path dividers between strips
    if (s < 4) {
      const px = strips[s + 1] - 1;
      p.push(...fill(px, 0, -13, px, 0, 23, "minecraft:dirt_path"));
    }
  }
  // North & south edge paths
  p.push(...fill(-13, 0, -14, 23, 0, -14, "minecraft:dirt_path"));
  p.push(...fill(-13, 0,  24, 23, 0,  24, "minecraft:dirt_path"));
  // Scarecrows
  p.push(blk(-8, 1, 6, "minecraft:oak_fence"), blk(-8, 2, 6, "minecraft:hay_block"), blk(-8, 3, 6, "minecraft:carved_pumpkin"));
  p.push(blk( 6, 1, -5, "minecraft:oak_fence"), blk(6, 2, -5, "minecraft:hay_block"), blk(6, 3, -5, "minecraft:carved_pumpkin"));
  p.push(blk(16, 1, 15, "minecraft:oak_fence"), blk(16, 2, 15, "minecraft:hay_block"), blk(16, 3, 15, "minecraft:carved_pumpkin"));
  // === STORAGE BARN (east corner, 6x12 footprint) ===
  p.push(...fill(20, 0, -13, 23, 0, 5, "minecraft:spruce_planks")); // floor
  p.push(...fill(20, 1, -13, 23, 5, -13, "minecraft:spruce_planks")); // N wall
  p.push(...fill(20, 1,  5,  23, 5,   5, "minecraft:spruce_planks")); // S wall
  p.push(...fill(20, 1, -12, 20, 5,   4, "minecraft:spruce_planks")); // W wall
  p.push(...fill(23, 1, -12, 23, 5,   4, "minecraft:spruce_planks")); // E wall
  p.push(blk(21, 1, 5, "minecraft:air"), blk(21, 2, 5, "minecraft:air")); // door
  p.push(blk(21, 3, -13, "minecraft:glass"), blk(21, 3, 5, "minecraft:glass")); // windows
  p.push(blk(20, 3, -5, "minecraft:glass"), blk(23, 3, -5, "minecraft:glass"));
  p.push(...fill(20, 6, -13, 23, 6, 5, "minecraft:spruce_planks")); // roof
  p.push(blk(20, 1, -12, "minecraft:barrel"), blk(20, 2, -12, "minecraft:barrel"));
  p.push(blk(20, 1, -10, "minecraft:chest"), blk(20, 1, -9, "minecraft:chest"));
  p.push(blk(20, 1, 3, "minecraft:hay_block"), blk(20, 1, 4, "minecraft:hay_block"));
  p.push(blk(23, 1, -11, "minecraft:barrel"), blk(23, 1, -10, "minecraft:barrel"));
  p.push(blk(21, 5, -4, "minecraft:lantern"));
  return p;
}
function farmPlotBlueprint() {
  const designs = [farmPlotBlueprintWheat, farmPlotBlueprintMixed, farmPlotBlueprintPlantation];
  return designs[Math.floor(Math.random() * designs.length)]();
}
var BLUEPRINTS = {
  "kingdoms:town_hall": townHallBlueprint,
  "kingdoms:barracks": barracksBlueprint,
  "kingdoms:market": marketBlueprint,
  "kingdoms:granary": granaryBlueprint,
  "kingdoms:blacksmith": blacksmithBlueprint,
  "kingdoms:trade_station": tradeStationBlueprint,
  "kingdoms:treasury": treasuryBlueprint,
  "kingdoms:storage": storageBlueprint,
  "kingdoms:armory": armoryBlueprint,
  "kingdoms:tower": towerBlueprint,
  "kingdoms:wall_long": wallLongBlueprint,
  "kingdoms:wall_short": wallShortBlueprint,
  "kingdoms:wall_tall": wallTallBlueprint,
  "kingdoms:stone_gate": stoneGateBlueprint,
  "kingdoms:king_castle": kingCastleBlueprint,
  "kingdoms:house": houseBlueprint,
  "kingdoms:fence_enclosure": fenceEnclosureBlueprint,
  "kingdoms:barn": barnBlueprint,
  "kingdoms:farm_plot": farmPlotBlueprint
};
function generateStructure(dimension, origin, blockTypeId) {
  const blueprint = BLUEPRINTS[blockTypeId];
  if (!blueprint) return;
  const placements = blueprint();
  for (const bp of placements) {
    if (bp.x === 0 && bp.z === 0 && bp.y <= 1) continue;
    try {
      const loc = {
        x: origin.x + bp.x,
        y: origin.y + bp.y,
        z: origin.z + bp.z
      };
      dimension.getBlock(loc)?.setType(bp.b);
    } catch {
    }
  }
}

// src/main.ts
var CUSTOM_BLOCKS = {
  TOWN_HALL: "kingdoms:town_hall",
  GUARD_POLE_VILLAGE: "kingdoms:guard_pole_village",
  GUARD_POLE_GATE: "kingdoms:guard_pole_gate",
  GUARD_POLE_ROAD: "kingdoms:guard_pole_road",
  GUARD_POLE_WATCHTOWER: "kingdoms:guard_pole_watchtower",
  TRADE_POLE: "kingdoms:trade_pole",
  TRADE_STATION: "kingdoms:trade_station",
  BARRACKS: "kingdoms:barracks",
  MARKET: "kingdoms:market",
  GRANARY: "kingdoms:granary",
  TREASURY_BLOCK: "kingdoms:treasury",
  BLACKSMITH: "kingdoms:blacksmith",
  STORAGE: "kingdoms:storage",
  ARMORY: "kingdoms:armory",
  TOWER: "kingdoms:tower",
  WALL_LONG: "kingdoms:wall_long",
  WALL_SHORT: "kingdoms:wall_short"
};
function destroyStructure(dimension, origin, blockTypeId) {
  const blueprint = BLUEPRINTS[blockTypeId];
  if (!blueprint) return;
  const placements = blueprint();
  for (const bp of placements) {
    if (bp.x === 0 && bp.y === 0 && bp.z === 0) continue;
    try {
      dimension.getBlock({ x: origin.x + bp.x, y: origin.y + bp.y, z: origin.z + bp.z })?.setType("minecraft:air");
    } catch {}
  }
}
function dropItemsAtLoc(dimension, location, itemTypeId, amount) {
  let remaining = amount;
  while (remaining > 0) {
    const stack = Math.min(remaining, 64);
    try { dimension.spawnItem(new ItemStack6(itemTypeId, stack), location); } catch {}
    remaining -= stack;
  }
}
function findVillageAt2(location) {
  return getAllVillages().find(
    (v) => Math.abs(v.location.x - location.x) < 64 && Math.abs(v.location.z - location.z) < 64
  );
}
var STRUCT_DISPLAY_NAMES = {
  "kingdoms:town_hall": "\u{1F3DB} Town Hall",
  "kingdoms:barracks": "\u2694\uFE0F Barracks",
  "kingdoms:market": "\u{1F3EA} Market",
  "kingdoms:blacksmith": "\u{1F528} Blacksmith",
  "kingdoms:granary": "\u{1F33E} Granary",
  "kingdoms:treasury": "\u{1F4B8} Treasury",
  "kingdoms:trade_station": "\u{1F682} Trade Station",
  "kingdoms:trade_pole": "\u{1F682} Trade Pole",
  "kingdoms:storage": "\u{1F4E6} Storage",
  "kingdoms:armory": "\u{1F6E1}\uFE0F Armory",
  "kingdoms:king_castle": "\u{1F451} King's Castle"
};
var STRUCT_MENU_KEYS = {
  "kingdoms:town_hall": "town_hall",
  "kingdoms:barracks": "barracks",
  "kingdoms:market": "market",
  "kingdoms:blacksmith": "blacksmith",
  "kingdoms:granary": "granary",
  "kingdoms:treasury": "treasury",
  "kingdoms:trade_station": "trade_station",
  "kingdoms:trade_pole": "trade_pole",
  "kingdoms:storage": "storage",
  "kingdoms:armory": "armory",
  "kingdoms:king_castle": "king_castle"
};
var STRUCT_HUB_OFFSETS = {
  "king_castle": { x: 0, y: 2, z: 11 },
  "barracks":    { x: 0, y: 1, z: 6 },
  "market":      { x: 0, y: 1, z: 5 },
  "blacksmith":  { x: 0, y: 1, z: 4 },
  "trade_station": { x: 0, y: 1, z: 4 },
  "armory":      { x: 0, y: 1, z: 4 },
  "granary":     { x: 0, y: 1, z: 3 },
  "treasury":    { x: 0, y: 1, z: 3 },
  "storage":     { x: 0, y: 1, z: 4 },
  "town_hall":   { x: 0, y: 1, z: 4 }
};
function spawnStructureHub(block, structKey) {
  try {
    const loc = block.location;
    const dimId = block.dimension.id;
    removeStructureHub(loc);
    const off = STRUCT_HUB_OFFSETS[structKey] ?? { x: 0, y: 1, z: 0 };
    const hub = world16.getDimension(dimId).spawnEntity("kingdoms:structure_hub", {
      x: loc.x + off.x + 0.5,
      y: loc.y + off.y,
      z: loc.z + off.z + 0.5
    });
    hub.nameTag = "\xA76\u25B6 " + (STRUCT_DISPLAY_NAMES[block.typeId] ?? structKey) + "\n\xA7e\u25C6 Tap to open menu";
    hub.setDynamicProperty("kc:structure_type", structKey);
    hub.setDynamicProperty("kc:block_loc", JSON.stringify({ x: loc.x, y: loc.y, z: loc.z, dimension: dimId }));
    world16.setDynamicProperty("kc:hub:" + loc.x + "," + loc.y + "," + loc.z, hub.id);
  } catch {}
}
function removeStructureHub(loc) {
  try {
    const key = "kc:hub:" + loc.x + "," + loc.y + "," + loc.z;
    world16.setDynamicProperty(key, void 0);
    for (const dimId of ["overworld", "nether", "the_end"]) {
      try {
        const hubs = world16.getDimension(dimId).getEntities({ type: "kingdoms:structure_hub" });
        for (const h of hubs) {
          try {
            const ls = h.getDynamicProperty("kc:block_loc");
            if (!ls) continue;
            const l = JSON.parse(ls);
            if (l.x === loc.x && l.y === loc.y && l.z === loc.z) { h.remove(); return; }
          } catch {}
        }
      } catch {}
    }
  } catch {}
}
function openStructureMenu(player, structKey, block) {
  switch (structKey) {
    case "town_hall": void showTownHallMenu(player, block); break;
    case "barracks": void showBarracksMenu(player, block); break;
    case "market": void showMarketMenu(player, block); break;
    case "blacksmith": void showBlacksmithMenu(player, block); break;
    case "granary": void showGranaryStorageMenu(player, block); break;
    case "treasury": void showTreasuryBlockMenu(player, block); break;
    case "trade_station": void showTradeStationMenu(player, block); break;
    case "trade_pole": void showTradePoleMenu(player, block); break;
    case "storage": void showStorageMenu(player, block); break;
    case "armory": void showArmoryMenu(player, block); break;
    case "king_castle": void showKingCastleMenu(player, block); break;
  }
}
world16.afterEvents.playerPlaceBlock.subscribe((event) => {
  const { player, block } = event;
  if (!player) return;
  const typeId = block.typeId;
  if (typeId === CUSTOM_BLOCKS.TOWN_HALL) {
    void showClaimVillageForm(player, block);
  }
  if (typeId === "minecraft:black_wool") {
    const woolVillage = findVillageAt2(block.location);
    if (woolVillage && woolVillage.owner && woolVillage.owner !== player.name) {
      if (hasWoolWarLine(block.location, player.dimension)) {
        void triggerWoolWarDeclaration(player, woolVillage);
      }
    }
  }
  if (typeId.startsWith("kingdoms:guard_pole")) {
    const typeMap = {
      "kingdoms:guard_pole_village": "village",
      "kingdoms:guard_pole_gate": "gate",
      "kingdoms:guard_pole_road": "road",
      "kingdoms:guard_pole_watchtower": "watchtower"
    };
    const village = findVillageAt2(block.location);
    if (!village) {
      notifyPlayer(player.name, "\xA7cNo village territory here. Claim a village first.");
      return;
    }
    if (village.owner !== player.name) {
      notifyPlayer(player.name, "\xA7cThis is not your village.");
      return;
    }
    const poleType = typeMap[typeId] ?? "village";
    registerGuardPole(village, block.location, poleType);
  }
  if (typeId === CUSTOM_BLOCKS.TRADE_STATION) {
    const village = findVillageAt2(block.location);
    if (!village) {
      notifyPlayer(player.name, "\xA7cNo village territory here. Claim a village first.");
      return;
    }
    if (village.owner !== player.name) {
      notifyPlayer(player.name, "\xA7cThis is not your village.");
      return;
    }
    if (village.hasTradeStation) {
      notifyPlayer(player.name, `\xA7c\xA7b${village.name}\xA7c already has a Trade Station.`);
      return;
    }
    registerTradeStation(village, block.location);
  }
  if (typeId === CUSTOM_BLOCKS.TRADE_POLE) {
    const village = findVillageAt2(block.location);
    if (!village) {
      notifyPlayer(player.name, "\xA7cNo village territory here. Claim a village first.");
      return;
    }
    if (village.owner !== player.name) {
      notifyPlayer(player.name, "\xA7cThis is not your village.");
      return;
    }
    if (!village.tradePoles) village.tradePoles = [];
    village.tradePoles.push({ id: generateId(), location: { x: block.location.x, y: block.location.y, z: block.location.z } });
    saveVillage(village);
    notifyPlayer(player.name, `\xA7a\u{1F682} Trade Pole placed in \xA7b${village.name}\xA7a. Chest minecarts arriving on nearby rails will auto-route: \xA7femerald\xA7a\u2192treasury, \xA7afood\xA7a\u2192granary, \xA7etroop tokens\xA7a\u2192barracks.`);
  }
  if (typeId === CUSTOM_BLOCKS.GRANARY) {
    const village = findVillageAt2(block.location);
    if (village && village.owner === player.name) {
      village.granaryLocation = block.location;
      saveVillage(village);
      notifyPlayer(player.name, `\xA7aGranary registered for \xA7b${village.name}\xA7a.`);
    }
  }
  if (typeId === CUSTOM_BLOCKS.TREASURY_BLOCK) {
    const village = findVillageAt2(block.location);
    if (village && village.owner === player.name) {
      village.treasuryLocation = block.location;
      saveVillage(village);
      notifyPlayer(player.name, `\xA7aVillage Treasury registered for \xA7b${village.name}\xA7a.`);
    }
  }
  if (typeId === CUSTOM_BLOCKS.STORAGE) {
    const village = findVillageAt2(block.location);
    if (village && village.owner === player.name) {
      village.storageLocation = block.location;
      saveVillage(village);
      notifyPlayer(player.name, `\xA7aMaterial Storage registered for \xA7b${village.name}\xA7a. Hold a material and tap to deposit.`);
    }
  }
  if (typeId === CUSTOM_BLOCKS.ARMORY) {
    const village = findVillageAt2(block.location);
    if (village && village.owner === player.name) {
      village.armoryLocation = block.location;
      saveVillage(village);
      notifyPlayer(player.name, `\xA7aArmory registered for \xA7b${village.name}\xA7a. Hold a weapon or armor piece and tap to deposit.`);
    }
  }
  if (typeId === CUSTOM_BLOCKS.MARKET) {
    const village = findVillageAt2(block.location);
    if (village && village.owner === player.name) {
      spawnMarketShopkeepers(village, block.location, block.dimension.id);
    }
  }
  if (STRUCTURE_BLOCK_IDS.has(typeId)) {
    const origin = { x: block.location.x, y: block.location.y, z: block.location.z };
    const dimension = block.dimension;
    const dimId = block.dimension.id;
    notifyPlayer(player.name, `\xA77Building \xA7b${typeId.replace("kingdoms:", "").replace(/_/g, " ")}\xA77\u2026`);
    system3.run(() => {
      generateStructure(dimension, origin, typeId);
      if (typeId === "kingdoms:house") {
        const v2 = findVillageAt2(origin);
        if (v2) system3.runTimeout(() => updateHousingCapacity(v2.id), 10);
      }
    });
  }
  if (STRUCT_MENU_KEYS[typeId]) {
    system3.run(() => { try { spawnStructureHub(block, STRUCT_MENU_KEYS[typeId]); } catch {} });
  }
});
function spawnMarketShopkeepers(village, marketLoc, dimId) {
  try {
    if (!Array.isArray(village.marketShopkeeperIds)) village.marketShopkeeperIds = [];
    const dim = world16.getDimension(dimId);
    const angles = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3];
    for (let i = 0; i < 3; i++) {
      const angle = angles[i];
      const sx = marketLoc.x + 0.5 + Math.cos(angle) * 3;
      const sz = marketLoc.z + 0.5 + Math.sin(angle) * 3;
      try {
        const shopkeeper = dim.spawnEntity("kingdoms:shopkeeper", { x: sx, y: marketLoc.y + 1, z: sz });
        shopkeeper.nameTag = "\xA76\u{1F6CD} Market Shopkeeper";
        shopkeeper.setDynamicProperty("kc:village_id", village.id);
        shopkeeper.setDynamicProperty("kc:market_loc", JSON.stringify({ x: marketLoc.x, y: marketLoc.y, z: marketLoc.z, dimension: dimId }));
        village.marketShopkeeperIds.push(shopkeeper.id);
      } catch {}
    }
    saveVillage(village);
  } catch {}
}
var MENU_COOLDOWN_TICKS = 10;
var lastMenuTick = /* @__PURE__ */ new Map();
function canOpenMenu(playerName) {
  const tick = getCurrentTick();
  const last = lastMenuTick.get(playerName) ?? -99;
  if (tick - last < MENU_COOLDOWN_TICKS) return false;
  lastMenuTick.set(playerName, tick);
  return true;
}
world16.afterEvents.playerInteractWithEntity.subscribe((event) => {
  const { player, target } = event;
  if (!target) return;
  if (target.typeId === "kingdoms:shopkeeper") {
    if (!canOpenMenu(player.name)) return;
    system3.run(async () => {
      try {
        const mLocStr = target.getDynamicProperty("kc:market_loc");
        if (!mLocStr) {
          notifyPlayer(player.name, "\xA7cThis shopkeeper has no market location.");
          return;
        }
        const ml = JSON.parse(mLocStr);
        const block = world16.getDimension(ml.dimension ?? "overworld").getBlock(ml);
        if (!block) {
          notifyPlayer(player.name, "\xA7cCould not find the market block.");
          return;
        }
        await showMarketMenu(player, block);
      } catch {}
    });
    return;
  }
  if (target.typeId !== "kingdoms:structure_hub") return;
  const structKey = target.getDynamicProperty("kc:structure_type");
  if (!structKey || !canOpenMenu(player.name)) return;
  try {
    const bLocStr = target.getDynamicProperty("kc:block_loc");
    if (!bLocStr) return;
    const bl = JSON.parse(bLocStr);
    const block = world16.getDimension(bl.dimension ?? "overworld").getBlock(bl);
    if (!block) return;
    openStructureMenu(player, structKey, block);
  } catch {}
});
world16.afterEvents.playerInteractWithBlock.subscribe((event) => {
  const { player, block } = event;
  if (!player || !block) return;
  const structKey = STRUCT_MENU_KEYS[block.typeId];
  if (!structKey || !canOpenMenu(player.name)) return;
  openStructureMenu(player, structKey, block);
});
world16.afterEvents.itemStartUseOn.subscribe((event) => {
  const player = event.source;
  const block = event.block;
  const itemStack = event.itemStack;
  if (!player) return;
  const typeId = block.typeId;
  if (typeId === CUSTOM_BLOCKS.GRANARY && itemStack) {
    const village = findVillageAt2(block.location);
    if (village && village.owner === player.name) {
      const foodEntry = FOOD_SELL_RATES.find((e) => e.itemId === itemStack.typeId);
      if (foodEntry) {
        depositPlayerItemsToGranary(player, village, itemStack.typeId, 64);
        return;
      }
    }
  }
  if (typeId === CUSTOM_BLOCKS.TREASURY_BLOCK && itemStack?.typeId === "minecraft:emerald") {
    const village = findVillageAt2(block.location);
    if (village && village.owner === player.name) {
      depositEmeralds(player, village.id, itemStack.amount);
      return;
    }
  }
  if (typeId === CUSTOM_BLOCKS.ARMORY && itemStack) {
    const village = findVillageAt2(block.location);
    if (village && village.owner === player.name) {
      if (ALL_ARMORY_ITEMS.has(itemStack.typeId)) {
        const inv = player.getComponent(EntityInventoryComponent8.componentId);
        const container = inv?.container;
        if (container) {
          let deposited = 0;
          for (let i = 0; i < container.size; i++) {
            const slot = container.getItem(i);
            if (slot?.typeId === itemStack.typeId) { deposited += slot.amount; container.setItem(i, void 0); }
          }
          if (deposited > 0) {
            village.armoryItems ?? (village.armoryItems = {});
            village.armoryItems[itemStack.typeId] = (village.armoryItems[itemStack.typeId] ?? 0) + deposited;
            saveVillage(village);
            notifyPlayer(player.name, `\xA7aDeposited ${deposited}x ${itemStack.typeId.replace("minecraft:", "")} into \xA7b${village.name}\xA7a armory.`);
          }
          return;
        }
      }
    }
  }
  if (!canOpenMenu(player.name)) return;
  switch (typeId) {
    case CUSTOM_BLOCKS.TOWN_HALL:
      void showTownHallMenu(player, block);
      break;
    case CUSTOM_BLOCKS.BARRACKS:
      void showBarracksMenu(player, block);
      break;
    case CUSTOM_BLOCKS.MARKET:
      void showMarketMenu(player, block);
      break;
    case CUSTOM_BLOCKS.BLACKSMITH:
      void showBlacksmithMenu(player, block);
      break;
    case CUSTOM_BLOCKS.GRANARY:
      void showGranaryStorageMenu(player, block);
      break;
    case CUSTOM_BLOCKS.TREASURY_BLOCK:
      void showTreasuryBlockMenu(player, block);
      break;
    case CUSTOM_BLOCKS.TRADE_STATION:
      void showTradeStationMenu(player, block);
      break;
    case CUSTOM_BLOCKS.STORAGE:
      void showStorageMenu(player, block);
      break;
    case CUSTOM_BLOCKS.ARMORY:
      void showArmoryMenu(player, block);
      break;
  }
});
world16.afterEvents.playerBreakBlock.subscribe((event) => {
  const { player } = event;
  if (!player) return;
  const typeId = event.brokenBlockPermutation.type.id;
  const blockLoc = event.block.location;
  if (typeId === CUSTOM_BLOCKS.TOWN_HALL) {
    const village = findVillageAt2(blockLoc);
    if (!village) {
    } else if (village.owner === player.name) {
      notifyPlayer(player.name, `\xA7e\xA7b${village.name}\xA7e Town Hall broken. Rebuild to access menu.`);
    } else if (village.owner) {
      const captured = captureVillageByForce(player, village);
      if (!captured) {
        notifyPlayer(player.name, `\xA7cYou cannot capture \xA7b${village.name}\xA7c \u2014 you are not at war with that kingdom.`);
      }
    }
  }
  if (typeId.startsWith("kingdoms:guard_pole")) {
    const village = findVillageAt2(blockLoc);
    if (village) {
      const pole = village.guardPoles.find(
        (p) => p.location.x === blockLoc.x && p.location.y === blockLoc.y && p.location.z === blockLoc.z
      );
      if (pole) {
        removeGuardPole(village, pole.id);
        notifyPlayer(player.name, `\xA7eGuard pole removed.`);
      }
    }
  }
  if (typeId === CUSTOM_BLOCKS.TRADE_STATION) {
    const village = findVillageAt2(blockLoc);
    if (village) {
      const loc = village.tradeStationLocation;
      if (loc && loc.x === blockLoc.x && loc.y === blockLoc.y && loc.z === blockLoc.z) {
        removeTradeStation(village);
      }
    }
  }
  if (typeId === CUSTOM_BLOCKS.GRANARY) {
    const village = findVillageAt2(blockLoc);
    if (village && village.granaryLocation) {
      const loc = village.granaryLocation;
      if (loc.x === blockLoc.x && loc.y === blockLoc.y && loc.z === blockLoc.z) {
        const dim = event.block.dimension;
        const droppedItems = { ...village.granaryItems ?? {} };
        system3.run(() => {
          for (const [itemId, count] of Object.entries(droppedItems)) {
            if (count > 0) dropItemsAtLoc(dim, loc, itemId, count);
          }
        });
        village.granaryLocation = void 0;
        village.granaryItems = {};
        saveVillage(village);
        notifyPlayer(player.name, `\xA7eGranary removed \u2014 stored food dropped.`);
      }
    }
  }
  if (typeId === CUSTOM_BLOCKS.TREASURY_BLOCK) {
    const village = findVillageAt2(blockLoc);
    if (village && village.treasuryLocation) {
      const loc = village.treasuryLocation;
      if (loc.x === blockLoc.x && loc.y === blockLoc.y && loc.z === blockLoc.z) {
        const dim = event.block.dimension;
        const emeralds = village.treasury ?? 0;
        system3.run(() => {
          if (emeralds > 0) dropItemsAtLoc(dim, loc, "minecraft:emerald", emeralds);
        });
        village.treasury = 0;
        village.treasuryLocation = void 0;
        saveVillage(village);
        notifyPlayer(player.name, `\xA7eTreasury removed \u2014 ${emeralds} emerald(s) dropped.`);
      }
    }
  }
  if (typeId === CUSTOM_BLOCKS.STORAGE) {
    const village = findVillageAt2(blockLoc);
    if (village && village.storageLocation) {
      const loc = village.storageLocation;
      if (loc.x === blockLoc.x && loc.y === blockLoc.y && loc.z === blockLoc.z) {
        const dim = event.block.dimension;
        const res = { ...village.resourceStorage ?? {} };
        system3.run(() => {
          for (const [key, count] of Object.entries(res)) {
            const itemId = RESOURCE_ITEM_IDS[key];
            if (itemId && count > 0) dropItemsAtLoc(dim, loc, itemId, count);
          }
        });
        village.storageLocation = void 0;
        village.resourceStorage = { ...EMPTY_RESOURCE_STORAGE };
        saveVillage(village);
        notifyPlayer(player.name, `\xA7eMaterial Storage removed \u2014 stored materials dropped.`);
      }
    }
  }
  if (typeId === CUSTOM_BLOCKS.ARMORY) {
    const village = findVillageAt2(blockLoc);
    if (village && village.armoryLocation) {
      const loc = village.armoryLocation;
      if (loc.x === blockLoc.x && loc.y === blockLoc.y && loc.z === blockLoc.z) {
        const dim = event.block.dimension;
        const items = { ...village.armoryItems ?? {} };
        system3.run(() => {
          for (const [itemId, count] of Object.entries(items)) {
            if (count > 0) dropItemsAtLoc(dim, loc, itemId, count);
          }
        });
        village.armoryLocation = void 0;
        village.armoryItems = {};
        saveVillage(village);
        notifyPlayer(player.name, `\xA7eArmory removed \u2014 stored equipment dropped.`);
      }
    }
  }
  if (typeId === CUSTOM_BLOCKS.TRADE_POLE) {
    const village = findVillageAt2(blockLoc);
    if (village && village.tradePoles) {
      village.tradePoles = village.tradePoles.filter(
        (p) => !(p.location.x === blockLoc.x && p.location.y === blockLoc.y && p.location.z === blockLoc.z)
      );
      saveVillage(village);
      notifyPlayer(player.name, `\xA7eTrade pole removed from \xA7b${village.name}\xA7e.`);
    }
  }
  if (STRUCT_MENU_KEYS[typeId]) {
    removeStructureHub(blockLoc);
  }
});
world16.beforeEvents.playerPlaceBlock.subscribe((event) => {
  const { player, permutationBeingPlaced, block } = event;
  if (!player) return;
  const typeId = permutationBeingPlaced?.type?.id ?? "";
  if (typeId === CUSTOM_BLOCKS.TOWN_HALL) {
    const inv = player.getComponent(EntityInventoryComponent8.componentId);
    const container = inv?.container;
    if (!container) { event.cancel = true; return; }
    let cobbleCount = 0;
    for (let i = 0; i < container.size; i++) {
      const item = container.getItem(i);
      if (item?.typeId === "minecraft:cobblestone") cobbleCount += item.amount;
    }
    if (cobbleCount < CLAIM_COST_COBBLESTONE) {
      event.cancel = true;
      system3.run(() => {
        notifyPlayer(player.name, `\xA7cYou need \xA7b${CLAIM_COST_COBBLESTONE} cobblestone\xA7c to place a Town Hall and claim a village. (Have: ${cobbleCount})`);
      });
    }
  }
});
// ── World Life System ────────────────────────────────────────────────────────
var WORLD_SEEDS_PROP = "kc:world_seeds";
var MAX_WORLD_SEEDS = 50;
var WORLD_SEED_MIN_SEP = 120;
var WORLD_LIFE_INTERVAL = 12000;
var WORLD_GEN_DIST_MIN = 80;
var WORLD_GEN_DIST_MAX = 220;
var lastWorldLifeTick = 0;

function getWorldSeeds() {
  try { const r = world16.getDynamicProperty(WORLD_SEEDS_PROP); return r ? JSON.parse(r) : []; } catch { return []; }
}
function saveWorldSeed(seed) {
  try {
    const seeds = getWorldSeeds();
    seeds.push(seed);
    if (seeds.length > MAX_WORLD_SEEDS) seeds.shift();
    world16.setDynamicProperty(WORLD_SEEDS_PROP, JSON.stringify(seeds));
  } catch {}
}
function isAreaSeeded(x, z) {
  return getWorldSeeds().some((s) => Math.sqrt((s.x - x) ** 2 + (s.z - z) ** 2) < WORLD_SEED_MIN_SEP);
}

// Bandit camp visual structure
function buildBanditCampStructure(dim, loc) {
  const x = Math.floor(loc.x);
  const z = Math.floor(loc.z);
  const y = Math.floor(loc.y);
  try {
    dim.runCommand(`fill ${x - 4} ${y + 1} ${z - 4} ${x + 4} ${y + 4} ${z + 4} minecraft:air replace minecraft:air`);
    dim.runCommand(`fill ${x - 4} ${y} ${z - 4} ${x + 4} ${y} ${z + 4} minecraft:dirt`);
    dim.runCommand(`setblock ${x} ${y + 1} ${z} minecraft:campfire`);
    dim.runCommand(`setblock ${x - 2} ${y + 1} ${z} minecraft:oak_log`);
    dim.runCommand(`setblock ${x + 2} ${y + 1} ${z} minecraft:oak_log`);
    dim.runCommand(`setblock ${x} ${y + 1} ${z - 2} minecraft:oak_log`);
    dim.runCommand(`setblock ${x} ${y + 1} ${z + 2} minecraft:oak_log`);
    dim.runCommand(`setblock ${x - 3} ${y + 1} ${z - 3} minecraft:barrel`);
    dim.runCommand(`setblock ${x + 3} ${y + 1} ${z + 3} minecraft:barrel`);
    dim.runCommand(`setblock ${x - 3} ${y + 1} ${z + 3} minecraft:crafting_table`);
    dim.runCommand(`setblock ${x + 3} ${y + 1} ${z - 3} minecraft:chest`);
    const wallOffsets = [[-4, 0], [4, 0], [0, -4], [0, 4], [-4, -2], [-4, 2], [4, -2], [4, 2], [-2, -4], [2, -4], [-2, 4], [2, 4]];
    for (const [ox, oz] of wallOffsets) {
      dim.runCommand(`setblock ${x + ox} ${y + 1} ${z + oz} minecraft:cobblestone_wall`);
    }
    dim.runCommand(`setblock ${x - 2} ${y + 2} ${z + 4} minecraft:torch`);
    dim.runCommand(`setblock ${x + 2} ${y + 2} ${z - 4} minecraft:torch`);
    dim.runCommand(`setblock ${x + 4} ${y + 2} ${z + 2} minecraft:torch`);
    dim.runCommand(`setblock ${x - 4} ${y + 2} ${z - 2} minecraft:torch`);
  } catch {}
}

// NPC house blueprint
function buildNpcHouse(dim, cx, y, cz, material) {
  const m = material || "minecraft:oak_planks";
  try {
    dim.runCommand(`fill ${cx - 3} ${y} ${cz - 3} ${cx + 3} ${y + 4} ${cz + 3} ${m} hollow`);
    dim.runCommand(`fill ${cx - 2} ${y + 1} ${cz - 2} ${cx + 2} ${y + 3} ${cz + 2} minecraft:air`);
    dim.runCommand(`setblock ${cx} ${y + 1} ${cz + 3} minecraft:air`);
    dim.runCommand(`setblock ${cx} ${y + 2} ${cz + 3} minecraft:air`);
    dim.runCommand(`setblock ${cx - 2} ${y + 2} ${cz - 3} minecraft:glass`);
    dim.runCommand(`setblock ${cx + 2} ${y + 2} ${cz - 3} minecraft:glass`);
    dim.runCommand(`setblock ${cx - 3} ${y + 2} ${cz} minecraft:glass`);
    dim.runCommand(`setblock ${cx + 3} ${y + 2} ${cz} minecraft:glass`);
    dim.runCommand(`fill ${cx - 3} ${y + 5} ${cz - 3} ${cx + 3} ${y + 5} ${cz + 3} ${m}`);
    dim.runCommand(`setblock ${cx} ${y + 4} ${cz} minecraft:glowstone`);
  } catch {}
}

// Farm blueprint
function buildFarmPlot(dim, fx, y, fz) {
  try {
    dim.runCommand(`fill ${fx} ${y} ${fz} ${fx + 10} ${y} ${fz + 8} minecraft:farmland`);
    dim.runCommand(`fill ${fx} ${y + 1} ${fz} ${fx + 10} ${y + 1} ${fz + 8} minecraft:wheat[growth=7]`);
    dim.runCommand(`fill ${fx + 5} ${y} ${fz} ${fx + 5} ${y} ${fz + 8} minecraft:water`);
    dim.runCommand(`fill ${fx + 5} ${y + 1} ${fz} ${fx + 5} ${y + 1} ${fz + 8} minecraft:air`);
    dim.runCommand(`fill ${fx - 1} ${y + 1} ${fz - 1} ${fx + 11} ${y + 1} ${fz + 9} minecraft:oak_fence hollow`);
    dim.runCommand(`fill ${fx + 12} ${y} ${fz} ${fx + 16} ${y + 4} ${fz + 5} minecraft:oak_planks hollow`);
    dim.runCommand(`setblock ${fx + 14} ${y + 3} ${fz + 2} minecraft:glowstone`);
    dim.runCommand(`setblock ${fx + 13} ${y + 1} ${fz + 6} minecraft:air`);
    dim.runCommand(`setblock ${fx + 14} ${y + 1} ${fz + 6} minecraft:air`);
  } catch {}
}

// Well blueprint
function buildWell(dim, wx, y, wz) {
  try {
    dim.runCommand(`fill ${wx - 1} ${y} ${wz - 1} ${wx + 1} ${y + 2} ${wz + 1} minecraft:stone_bricks hollow`);
    dim.runCommand(`setblock ${wx} ${y + 1} ${wz} minecraft:water`);
    dim.runCommand(`setblock ${wx} ${y + 2} ${wz} minecraft:air`);
    dim.runCommand(`fill ${wx - 1} ${y + 3} ${wz - 1} ${wx + 1} ${y + 3} ${wz + 1} minecraft:oak_slab`);
  } catch {}
}

// NPC village generator
function spawnNpcVillage(dim, anchor, size) {
  const x = Math.floor(anchor.x);
  const z = Math.floor(anchor.z);
  const y = Math.floor(anchor.y);
  const isCity = size === "city";
  const ring = isCity ? 22 : 13;
  const buildingCount = isCity ? 6 : 2;
  const villagerCount = isCity ? 12 : 4;
  const mat = isCity ? "minecraft:stone_bricks" : "minecraft:oak_planks";
  try {
    dim.runCommand(`fill ${x - ring} ${y} ${z - ring} ${x + ring} ${y} ${z + ring} minecraft:grass_block`);
    dim.runCommand(`fill ${x - ring} ${y + 1} ${z} ${x + ring} ${y + 1} ${z} minecraft:gravel`);
    dim.runCommand(`fill ${x} ${y + 1} ${z - ring} ${x} ${y + 1} ${z + ring} minecraft:gravel`);
  } catch {}
  buildWell(dim, x, y + 1, z);
  const step = (Math.PI * 2) / buildingCount;
  for (let i = 0; i < buildingCount; i++) {
    const angle = i * step;
    const bx = Math.round(x + Math.cos(angle) * ring * 0.7);
    const bz = Math.round(z + Math.sin(angle) * ring * 0.7);
    buildNpcHouse(dim, bx, y + 1, bz, mat);
    try { dim.spawnEntity("minecraft:villager_v2", { x: bx, y: y + 2, z: bz }); } catch {}
  }
  buildFarmPlot(dim, x + ring + 3, y + 1, z - 4);
  try { dim.spawnEntity("minecraft:villager_v2", { x: x + ring + 8, y: y + 2, z: z }); } catch {}
  const extra = Math.max(0, villagerCount - buildingCount - 1);
  for (let i = 0; i < extra; i++) {
    const vx = x + Math.floor(Math.random() * 12 - 6);
    const vz = z + Math.floor(Math.random() * 12 - 6);
    try { dim.spawnEntity("minecraft:villager_v2", { x: vx, y: y + 2, z: vz }); } catch {}
  }
  if (isCity) {
    const w = ring + 6;
    try {
      dim.runCommand(`fill ${x - w} ${y + 1} ${z - w} ${x + w} ${y + 4} ${z - w} minecraft:stone_bricks`);
      dim.runCommand(`fill ${x - w} ${y + 1} ${z + w} ${x + w} ${y + 4} ${z + w} minecraft:stone_bricks`);
      dim.runCommand(`fill ${x - w} ${y + 1} ${z - w} ${x - w} ${y + 4} ${z + w} minecraft:stone_bricks`);
      dim.runCommand(`fill ${x + w} ${y + 1} ${z - w} ${x + w} ${y + 4} ${z + w} minecraft:stone_bricks`);
      dim.runCommand(`fill ${x - 3} ${y + 1} ${z - w - 1} ${x + 3} ${y + 3} ${z - w + 1} minecraft:air`);
      dim.runCommand(`fill ${x - 3} ${y + 1} ${z + w - 1} ${x + 3} ${y + 3} ${z + w + 1} minecraft:air`);
    } catch {}
  }
}

// Pillager patrol spawner
function spawnPillagerPatrol(dim, loc) {
  const count = 3 + Math.floor(Math.random() * 4);
  for (let i = 0; i < count; i++) {
    const px = loc.x + (Math.random() * 14 - 7);
    const pz = loc.z + (Math.random() * 14 - 7);
    try { dim.spawnEntity("minecraft:pillager", { x: px, y: loc.y, z: pz }); } catch {}
  }
  try { dim.spawnEntity("minecraft:pillager", { x: loc.x + 1, y: loc.y, z: loc.z + 1 }); } catch {}
}

// ── Villager Territory Respawn ──────────────────────────────────────────────
var VILLAGER_RESPAWN_INTERVAL = 200;
var lastVillagerRespawnTick = -1;
function tickVillagerRespawn(currentTick) {
  if (currentTick - lastVillagerRespawnTick < VILLAGER_RESPAWN_INTERVAL) return;
  lastVillagerRespawnTick = currentTick;
  const villages = getAllVillages();
  if (villages.length === 0) return;
  const dims = new Map();
  for (const village of villages) {
    const dimId = village.location.dimension;
    if (!dims.has(dimId)) {
      try { dims.set(dimId, world16.getDimension(dimId)); } catch {}
    }
  }
  for (const [dimId, dim] of dims) {
    let villagers;
    try {
      villagers = dim.getEntities({ type: "minecraft:villager_v2" });
    } catch { continue; }
    for (const villager of villagers) {
      const vLoc = villager.location;
      const villageId = villager.getDynamicProperty("kc:village_id");
      let homeVillage = null;
      if (villageId) {
        homeVillage = villages.find((v) => v.id === villageId && v.location.dimension === dimId);
      }
      if (!homeVillage) {
        homeVillage = villages.find((v) =>
          v.location.dimension === dimId &&
          Math.abs(v.townHallLocation.x - vLoc.x) < VILLAGE_CLAIM_RADIUS &&
          Math.abs(v.townHallLocation.z - vLoc.z) < VILLAGE_CLAIM_RADIUS
        );
        if (homeVillage) {
          try { villager.setDynamicProperty("kc:village_id", homeVillage.id); } catch {}
        }
      }
      if (!homeVillage) continue;
      const th = homeVillage.townHallLocation;
      const dx = Math.abs(vLoc.x - th.x);
      const dz = Math.abs(vLoc.z - th.z);
      if (dx > VILLAGE_CLAIM_RADIUS || dz > VILLAGE_CLAIM_RADIUS) {
        const spawnX = th.x + (Math.random() * 10 - 5);
        const spawnZ = th.z + (Math.random() * 10 - 5);
        try {
          villager.teleport({ x: spawnX, y: th.y + 1, z: spawnZ });
        } catch {}
      }
    }
  }
}
// ── End Villager Territory Respawn ──────────────────────────────────────────

// World life tick — runs periodically, spawns content near players
function tickWorldLife(currentTick) {
  if (currentTick - lastWorldLifeTick < WORLD_LIFE_INTERVAL) return;
  lastWorldLifeTick = currentTick;
  const players = world16.getAllPlayers();
  for (const player of players) {
    const loc = player.location;
    const dim = player.dimension;
    const dimId = dim.id;
    const angle = Math.random() * Math.PI * 2;
    const dist = WORLD_GEN_DIST_MIN + Math.random() * (WORLD_GEN_DIST_MAX - WORLD_GEN_DIST_MIN);
    const cx = loc.x + Math.cos(angle) * dist;
    const cz = loc.z + Math.sin(angle) * dist;
    if (isAreaSeeded(cx, cz)) continue;
    const roll = Math.random();
    const anchor = { x: cx, y: loc.y, z: cz };
    if (roll < 0.18) {
      spawnNpcVillage(dim, anchor, "city");
      saveWorldSeed({ x: cx, z: cz, type: "city" });
    } else if (roll < 0.50) {
      spawnNpcVillage(dim, anchor, "village");
      saveWorldSeed({ x: cx, z: cz, type: "village" });
    } else if (roll < 0.68) {
      buildFarmPlot(dim, Math.floor(cx), Math.floor(loc.y) + 1, Math.floor(cz));
      saveWorldSeed({ x: cx, z: cz, type: "farm" });
    } else if (roll < 0.84) {
      spawnPillagerPatrol(dim, anchor);
      saveWorldSeed({ x: cx, z: cz, type: "pillager" });
    } else {
      if (getAllBanditCamps().length < MAX_WORLD_CAMPS) {
        const camp2 = { id: generateId(), location: { x: cx, y: loc.y, z: cz, dimension: dimId }, strength: 3 + Math.floor(Math.random() * 5), originKingdomId: "", entityIds: [] };
        saveBanditCamp(camp2);
        trySpawnEntities(camp2);
        buildBanditCampStructure(dim, camp2.location);
        saveWorldSeed({ x: cx, z: cz, type: "bandit" });
      }
    }
  }
}
// ── End World Life ─────────────────────────────────────────────────────────────

system3.runInterval(() => {
  const tick = getCurrentTick();
  tickWatchtowers(tick);
  tickTradeStations(tick);
  tickTradePoles(tick);
  tickSieges(tick);
  tickBorders(tick);
  tickAutoDefense(tick);
  tickRebelCityWarnings(tick);
  for (const village of getAllVillages()) {
    tickTraining(village, tick);
  }
  tickAllMerchantsSpawn(tick);
  tickAllMerchantMovement();
  tickTradeCartMovement();
  tickWorldLife(tick);
  tickVillagerRespawn(tick);
}, 20);
system3.runInterval(() => {
  processAllFood();
  processAllWages();
  processAllPopulation();
  tickBandits();
  processAllSoldierFood();
  autoHarvestAllVillages();
}, 24e3);
system3.runInterval(() => {
  refreshAllGuards();
  const _pruneTick = getCurrentTick();
  for (const [key, alertTick] of lastAlertedThreat) {
    if (_pruneTick - alertTick > 36e3) lastAlertedThreat.delete(key);
  }
}, 12e3);
system3.runInterval(() => {
  for (const village of getAllVillages()) {
    updateHousingCapacity(village.id);
  }
}, 72e3);
// World merchant spawner — independent of villages, spawns travelling merchants + trade carts near players
system3.runInterval(() => {
  const players = world16.getAllPlayers();
  for (const player of players) {
    if (Math.random() > 0.5) continue;
    try {
      const dim = player.dimension;
      const nearby = dim.getEntities({ type: "kingdoms:merchant", location: player.location, maxDistance: 150 });
      if (nearby.length >= 3) continue;
      const angle = Math.random() * Math.PI * 2;
      const d = 60 + Math.random() * 80;
      const mx = player.location.x + Math.cos(angle) * d;
      const mz = player.location.z + Math.sin(angle) * d;
      const m = dim.spawnEntity("kingdoms:merchant", { x: mx, y: player.location.y, z: mz });
      m.nameTag = "\xA76Travelling Merchant";
      const cartCount = 1 + Math.floor(Math.random() * 2);
      for (let ci = 0; ci < cartCount; ci++) {
        const ca = (ci / cartCount) * Math.PI * 2;
        try {
          const cart = dim.spawnEntity("kingdoms:trade_cart", {
            x: mx + Math.cos(ca) * 3,
            y: player.location.y,
            z: mz + Math.sin(ca) * 3
          });
          cart.nameTag = "\xA77Trade Cart";
          cart.setDynamicProperty("kc:merchant_id", m.id);
        } catch {}
      }
    } catch {}
  }
}, 6e3);
// Intercept vanilla wandering_trader + trader_llama — replace with kingdoms travelling merchant
world16.afterEvents.entitySpawn.subscribe((event) => {
  const entity = event.entity;
  if (!entity) return;
  if (entity.typeId === "minecraft:wandering_trader") {
    const loc = { x: entity.location.x, y: entity.location.y, z: entity.location.z };
    const dim = entity.dimension;
    system3.run(() => {
      try {
        entity.remove();
        const nearestVillage = getAllVillages()
          .filter((v) => v.location.dimension === dim.id)
          .sort((a, b) => {
            const da = (a.townHallLocation.x - loc.x) ** 2 + (a.townHallLocation.z - loc.z) ** 2;
            const db = (b.townHallLocation.x - loc.x) ** 2 + (b.townHallLocation.z - loc.z) ** 2;
            return da - db;
          })[0];
        const m = dim.spawnEntity("kingdoms:merchant", loc);
        if (nearestVillage) {
          const dest = nearestVillage.tradeStationLocation ?? nearestVillage.townHallLocation;
          const destLabel = nearestVillage.tradeStationLocation ? "Market" : "Town Hall";
          m.nameTag = `\xA76Travelling Merchant \xA77[\u2192 ${nearestVillage.name} ${destLabel}]`;
          const templates = Object.keys(MERCHANT_STOCK_TEMPLATES);
          const stock = { ...MERCHANT_STOCK_TEMPLATES[templates[Math.floor(Math.random() * templates.length)]] };
          const merchantData = {
            entityId: m.id,
            stock,
            destinationVillageId: nearestVillage.id,
            currentPoleIndex: 0,
            arrived: false,
            lastNotifyDist: -1
          };
          m.setDynamicProperty("kc:merchant_data", JSON.stringify(merchantData));
          m.setDynamicProperty("kc:village_id", nearestVillage.id);
          nearestVillage.activeMerchants.push(merchantData);
          saveVillage(nearestVillage);
          if (nearestVillage.owner) {
            notifyPlayer(nearestVillage.owner, `\xA76\uD83D\uDED2 A travelling merchant has appeared and is heading to \xA7b${nearestVillage.name}\xA76's ${destLabel.toLowerCase()}!`);
          }
        } else {
          m.nameTag = "\xA76Travelling Merchant";
        }
        const cartAngle = Math.random() * Math.PI * 2;
        const cart = dim.spawnEntity("kingdoms:trade_cart", {
          x: loc.x + Math.cos(cartAngle) * 2.5,
          y: loc.y,
          z: loc.z + Math.sin(cartAngle) * 2.5
        });
        cart.nameTag = "\xA77Trade Cart";
        cart.setDynamicProperty("kc:merchant_id", m.id);
      } catch {}
    });
  } else if (entity.typeId === "minecraft:trader_llama") {
    system3.run(() => { try { entity.remove(); } catch {} });
  }
});
world16.beforeEvents.playerBreakBlock.subscribe((event) => {
  const { player, block } = event;
  if (!isCropBlock(block.typeId)) return;
  const permutation = block.permutation;
  const age = permutation.getState("age");
  if (age === void 0) return;
  const maxAge = CROP_MAX_AGES[block.typeId];
  if (age < maxAge) return;
  const village = findVillageAt2(block.location);
  if (!village) return;
  event.cancel = true;
  const blockTypeId = block.typeId;
  const blockAge = age;
  const loc = { x: block.location.x, y: block.location.y, z: block.location.z };
  const dimId = player.dimension.id;
  system3.run(() => {
    try {
      const dim = world16.getDimension(dimId);
      const freshBlock = dim.getBlock(loc);
      if (!freshBlock) return;
      const freshAge = freshBlock.permutation.getState("age");
      if (freshAge !== blockAge) return;
      freshBlock.setPermutation(freshBlock.permutation.withState("age", 0));
      handleCropBreak(player, blockTypeId, blockAge, loc, dimId);
    } catch {
      handleCropBreak(player, blockTypeId, blockAge, loc, dimId);
    }
  });
});
world16.afterEvents.itemUse.subscribe((event) => {
  const player = event.source;
  if (!player) return;
  const itemId = event.itemStack?.typeId;
  if (!itemId) return;
  if (itemId === "kingdoms:recall_scroll") {
    system3.run(() => {
      recallNearbyTroops(player);
    });
    return;
  }
  if (itemId === "kingdoms:formation_scroll") {
    system3.run(() => {
      void cmdStratMap(player);
    });
    return;
  }
  if (itemId === "kingdoms:village_spawner") {
    system3.run(async () => {
      const form = new ActionFormData().title("\xA76\u{1F3D9} Village Spawner").body("Select what to build near you:\n\n\xA76Big City\xA7r: Walled city, 6 stone buildings, 12 villagers, large farm\n\xA7aSmall Village\xA7r: 2 wooden houses, 4 villagers, small farm").button("\xA76\u{1F3D9} Spawn Big City").button("\xA7a\u{1F3E0} Spawn Small Village").button("Cancel");
      const resp = await form.show(player);
      if (resp.canceled || resp.selection === 2) return;
      const size = resp.selection === 0 ? "city" : "village";
      const d = size === "city" ? 80 : 50;
      const ang = Math.random() * Math.PI * 2;
      const anchor = { x: player.location.x + Math.cos(ang) * d, y: player.location.y, z: player.location.z + Math.sin(ang) * d };
      const dim2 = world16.getDimension(player.dimension.id);
      spawnNpcVillage(dim2, anchor, size);
      notifyPlayer(player.name, `\xA7a\u2714 ${size === "city" ? "\xA76City" : "\xA7aVillage"}\xA7a spawning \xA7b~${Math.round(d)}\xA7a blocks away!`);
      try {
        const inv2 = player.getComponent("minecraft:inventory");
        if (inv2?.container) {
          const si = player.selectedSlotIndex;
          const it = inv2.container.getItem(si);
          if (it && it.typeId === "kingdoms:village_spawner") {
            it.amount -= 1;
            if (it.amount <= 0) inv2.container.setItem(si, void 0);
            else inv2.container.setItem(si, it);
          }
        }
      } catch {}
    });
    return;
  }
  if (TROOP_TOKEN_MAP[itemId]) {
    system3.run(() => {
      deploySingleToken(player, itemId);
    });
  }
});
world16.afterEvents.itemUseOn.subscribe((event) => {
  const player = event.source;
  if (!player) return;
  const itemId = event.itemStack?.typeId;
  if (!itemId) return;
  if (itemId === "kingdoms:formation_scroll") {
    system3.run(() => { void cmdStratMap(player); });
    return;
  }
  if (TROOP_TOKEN_MAP[itemId]) {
    system3.run(() => { deploySingleToken(player, itemId); });
  }
});
registerCommands();
var guardGreetCooldown = /* @__PURE__ */ new Map();
system3.runInterval(() => {
  try {
    for (const player of world16.getAllPlayers()) {
      const guards = player.dimension.getEntities({ type: "kingdoms:city_guard", maxDistance: 4, location: player.location });
      if (guards.length > 0) {
        const now = getCurrentTick();
        const last = guardGreetCooldown.get(player.name) ?? 0;
        if (now - last > 300) {
          guardGreetCooldown.set(player.name, now);
          player.sendMessage("\xA76\uD83D\uDC51 \xA7o\"Your Majesty!\"\xA7r");
        }
      }
    }
  } catch {}
}, 60);
var KC_FIRST_SPAWN_PROP = "kc:first_spawned:";
function hasFirstSpawned(playerName) {
  try { return world16.getDynamicProperty(KC_FIRST_SPAWN_PROP + playerName) === true; } catch { return false; }
}
function markFirstSpawned(playerName) {
  try { world16.setDynamicProperty(KC_FIRST_SPAWN_PROP + playerName, true); } catch {}
}
function buildStarterHouse(dim, ox, oy, oz) {
  for (let x = 0; x < 5; x++) {
    for (let y = 1; y <= 3; y++) {
      for (let z = 0; z < 5; z++) {
        if (x === 0 || x === 4 || z === 0 || z === 4) {
          if (!(z === 4 && x >= 1 && x <= 3 && y <= 2)) {
            try { dim.getBlock({ x: ox + x, y: oy + y, z: oz + z })?.setType("minecraft:cobblestone"); } catch {}
          }
        }
      }
    }
  }
  for (let x = 0; x < 5; x++)
    for (let z = 0; z < 5; z++)
      try { dim.getBlock({ x: ox + x, y: oy, z: oz + z })?.setType("minecraft:cobblestone"); } catch {}
  for (let x = 0; x < 5; x++)
    for (let z = 0; z < 5; z++)
      try { dim.getBlock({ x: ox + x, y: oy + 4, z: oz + z })?.setType("minecraft:oak_planks"); } catch {}
  try { dim.getBlock({ x: ox + 2, y: oy + 3, z: oz + 2 })?.setType("minecraft:sea_lantern"); } catch {}
}
function generateStarterVillage(player) {
  const dim = player.dimension;
  const px = Math.floor(player.location.x);
  const py = Math.floor(player.location.y);
  const pz = Math.floor(player.location.z);
  buildStarterHouse(dim, px + 8, py, pz);
  buildStarterHouse(dim, px - 13, py, pz + 5);
  for (let i = 0; i < 3; i++) {
    try {
      const angle = (i / 3) * Math.PI * 2;
      const r = 7;
      dim.spawnEntity("minecraft:villager_v2", {
        x: px + Math.cos(angle) * r,
        y: py,
        z: pz + Math.sin(angle) * r
      });
    } catch {}
  }
  notifyPlayer(player.name, "\xA7a\u{1F3E1} Welcome to Kingdoms & Conquest! A starter village has been built near you.");
  notifyPlayer(player.name, "\xA7e  \u2022 Check your inventory: you have a \xA7bTown Hall\xA7e block + \xA7b10 cobblestone\xA7e.");
  notifyPlayer(player.name, "\xA7e  \u2022 Place the \xA7bTown Hall\xA7e block near the 3 villagers to claim your kingdom!");
  notifyPlayer(player.name, "\xA7e  \u2022 Run \xA7f/scriptevent kc:tutorial start\xA7e for a full guide.");
}
world16.afterEvents.playerSpawn.subscribe((event) => {
  if (!event.initialSpawn) return;
  const player = event.player;
  if (hasFirstSpawned(player.name)) return;
  markFirstSpawned(player.name);
  system3.runTimeout(() => {
    try {
      for (const { id, count } of [
        { id: "kingdoms:town_hall", count: 1 },
        { id: "kingdoms:village_spawner", count: 1 },
        { id: "minecraft:cobblestone", count: 10 },
        { id: "minecraft:bread", count: 8 }
      ]) {
        try { player.runCommand(`give @s ${id} ${count}`); } catch {}
      }
      generateStarterVillage(player);
      system3.runTimeout(() => {
        notifyPlayer(player.name, "\xA76\u2605 Welcome to Kingdoms & Conquest! \xA76\u2605");
        notifyPlayer(player.name, "\xA7fYou received:\xA7a Town Hall\xA7f (place to claim your village) \xA7b+\xA7a Village Spawner\xA7f (right-click ground to summon a small village structure).");
        notifyPlayer(player.name, "\xA77Step 1: Right-click the\xA7a Village Spawner\xA77 on the ground to generate your starter village.");
        notifyPlayer(player.name, "\xA77Step 2: Place the\xA7a Town Hall\xA77 block inside it, then right-click to claim and name your kingdom.");
        notifyPlayer(player.name, "\xA77Step 3: Use\xA7e /scriptevent kc:help\xA77 to see all commands.");
        notifyPlayer(player.name, "\xA7c\u26A0 Soldiers from other kingdoms are hostile unless you are allied. Use\xA7e kc:ally <kingdom>\xA7c to establish peace.");
      }, 120);
    } catch {}
  }, 60);
});
system3.runInterval(() => {
  try {
    const players = [...world16.getPlayers()];
    if (players.length < 1) return;
    for (const player of players) {
      try {
        const playerKingdom = getKingdomOf(player.name);
        const nearEntities = player.dimension.getEntities({
          location: player.location,
          maxDistance: 24,
          families: ["kingdoms_guard"]
        });
        for (const entity of nearEntities) {
          try {
            let ownerKingdom = null;
            const directOwner = entity.getDynamicProperty("kc:owner")
                             || entity.getDynamicProperty("kc:strat_raid_owner");
            if (directOwner) {
              if (directOwner === player.name) continue;
              ownerKingdom = getKingdomOf(directOwner);
            } else {
              const villageId = entity.getDynamicProperty("kc:auto_dispatch");
              if (villageId) {
                const v = getVillage(villageId);
                if (!v) continue;
                if (v.owner === player.name) continue;
                ownerKingdom = getKingdomOf(v.owner);
              }
            }
            if (!ownerKingdom) continue;
            if (playerKingdom && ownerKingdom.id === playerKingdom.id) continue;
            if (playerKingdom && ownerKingdom.alliances?.includes(playerKingdom.id)) continue;
            player.addTag("kc:aggro_target");
            try { entity.runCommand("attack @p[r=25,tag=kc:aggro_target]"); } catch {}
            player.removeTag("kc:aggro_target");
          } catch {}
        }
      } catch {}
    }
  } catch {}
}, 80);
async function showClaimVillageForm(player, block) {
  const form = new ModalFormData().title("Claim Village").textField("Kingdom Name", "Enter your kingdom name...").textField("Village Name", "Enter a name for this village...");
  const response = await form.show(player);
  if (response.canceled) return;
  const [kingdomName, _villageName] = response.formValues;
  if (!kingdomName) return;
  claimVillage(player, block, kingdomName);
}
async function showTownHallMenu(player, block) {
  const village = findVillageAt2(block.location);
  if (!village) {
    notifyPlayer(player.name, "\xA7cNo village data. Place a Town Hall and claim first.");
    return;
  }
  const isOwner = village.owner === player.name;
  const summary = getVillageSummary(village);
  const form = new ActionFormData().title(`${village.name} \u2014 Town Hall`).body(summary);
  if (isOwner) {
    form.button("Kingdom Overview").button("Diplomacy").button("Rename Village").button("\xA7a\uD83C\uDFDB Purchase Buildings");
  } else {
    form.button("Close");
  }
  const response = await form.show(player);
  if (response.canceled || !isOwner) return;
  switch (response.selection) {
    case 0:
      await showKingdomOverview(player);
      break;
    case 1:
      await showDiplomacyMenu(player);
      break;
    case 2:
      await showRenameForm(player, village.id);
      break;
    case 3:
      await new Promise((r) => system3.runTimeout(r, 3));
      await showBuildingShopMenu(player, village);
      break;
  }
}
var LOG_ITEM_TYPES = [
  "minecraft:oak_log","minecraft:spruce_log","minecraft:birch_log","minecraft:jungle_log",
  "minecraft:acacia_log","minecraft:dark_oak_log","minecraft:mangrove_log","minecraft:cherry_log",
  "minecraft:bamboo_block","minecraft:crimson_stem","minecraft:warped_stem"
];
var SHOP_ITEMS = [
  { id: "kingdoms:granary_item", label: "Granary", desc: "Stores food, enables market income and soldiers", prereq: false,
    costs: [{ items: LOG_ITEM_TYPES, count: 30, label: "30 Wood Logs (any type)" }, { itemId: "minecraft:chest", count: 20, label: "20 Chests" }] },
  { id: "kingdoms:treasury_item", label: "Treasury", desc: "Stores emeralds, enables all village income", prereq: false,
    costs: [{ items: LOG_ITEM_TYPES, count: 30, label: "30 Wood Logs (any type)" }, { itemId: "minecraft:chest", count: 20, label: "20 Chests" }] },
  { id: "kingdoms:house_item", label: "House (2-3 Beds)", desc: "Residential house with beds - required for population growth!", prereq: true,
    costs: [{ items: LOG_ITEM_TYPES, count: 50, label: "50 Wood Logs (any type)" }] },
  { id: "kingdoms:barracks_item", label: "Barracks", desc: "Train and manage your soldiers", prereq: true,
    costs: [{ itemId: "minecraft:stone", count: 100, label: "100 Stone" }, { itemId: "minecraft:iron_ingot", count: 5, label: "5 Iron Ingots" }] },
  { id: "kingdoms:market_item", label: "Market", desc: "Generates passive income from food trade", prereq: true,
    costs: [{ items: LOG_ITEM_TYPES, count: 30, label: "30 Wood Logs (any type)" }, { itemId: "minecraft:copper_ingot", count: 20, label: "20 Copper Ingots" }] },
  { id: "kingdoms:blacksmith_item", label: "Blacksmith", desc: "Forge and upgrade soldier weapons and armor", prereq: true,
    costs: [{ itemId: "minecraft:stone", count: 80, label: "80 Stone" }, { itemId: "minecraft:iron_ingot", count: 5, label: "5 Iron Ingots" }] },
  { id: "kingdoms:storage_item", label: "Material Storage", desc: "Warehouse for iron, gold, diamond, coal, wood, stone", prereq: true,
    costs: [{ items: LOG_ITEM_TYPES, count: 30, label: "30 Wood Logs (any type)" }, { itemId: "minecraft:chest", count: 20, label: "20 Chests" }] },
  { id: "kingdoms:armory_item", label: "Armory", desc: "Store and equip soldiers with weapons and armor", prereq: true,
    costs: [{ itemId: "minecraft:crafting_table", count: 10, label: "10 Crafting Tables" }, { itemId: "minecraft:smithing_table", count: 3, label: "3 Smithing Tables" }] },
  { id: "kingdoms:barn_item", label: "Barn", desc: "Large barn for cattle and multipurpose livestock storage", prereq: true,
    costs: [{ items: LOG_ITEM_TYPES, count: 60, label: "60 Wood Logs (any type)" }, { itemId: "minecraft:hay_block", count: 10, label: "10 Hay Bales" }] },
  { id: "kingdoms:farm_plot_item", label: "Farm Plot", desc: "Instant farm: fenced crop plots, irrigation channels and tool shed", prereq: true,
    costs: [{ items: LOG_ITEM_TYPES, count: 60, label: "60 Wood Logs (any type)" }] },
  { id: "kingdoms:guard_pole_village_item", label: "Guard Pole", desc: "Patrol point for city guards", prereq: true,
    costs: [{ items: LOG_ITEM_TYPES, count: 10, label: "10 Wood Logs (any type)" }, { itemId: "minecraft:torch", count: 20, label: "20 Torches" }] },
  { id: "kingdoms:trade_pole_item", label: "Trade Pole", desc: "Attracts merchant caravans to your village", prereq: true,
    costs: [{ items: LOG_ITEM_TYPES, count: 20, label: "20 Wood Logs (any type)" }, { itemId: "minecraft:torch", count: 30, label: "30 Torches" }] },
  { id: "kingdoms:trade_station_item", label: "Trade Station", desc: "Full trading hub for buying goods from merchants", prereq: true,
    costs: [{ items: LOG_ITEM_TYPES, count: 30, label: "30 Wood Logs (any type)" }, { itemId: "minecraft:torch", count: 40, label: "40 Torches" }] },
  { id: "kingdoms:tower_item", label: "Watch Tower", desc: "Tall stone tower for defense and visibility", prereq: true,
    costs: [{ itemId: "minecraft:stone", count: 30, label: "30 Stone" }, { itemId: "minecraft:torch", count: 60, label: "60 Torches" }] },
  { id: "kingdoms:wall_long_item", label: "Long Stone Wall (10x5)", desc: "Wide defensive wall with battlements", prereq: true,
    costs: [{ itemId: "minecraft:stone", count: 40, label: "40 Stone" }] },
  { id: "kingdoms:wall_short_item", label: "Short Stone Wall (5x5)", desc: "Short defensive wall segment with battlements", prereq: true,
    costs: [{ itemId: "minecraft:stone", count: 20, label: "20 Stone" }] },
  { id: "kingdoms:wall_tall_item", label: "Tall Stone Wall (5x10)", desc: "5-wide wall 10 blocks tall - matches short wall for seamless joining", prereq: true,
    costs: [{ itemId: "minecraft:stone", count: 40, label: "40 Stone" }] },
  { id: "kingdoms:stone_gate_item", label: "Stone Gate", desc: "9-wide gate with towers arch and portcullis bars", prereq: true,
    costs: [{ itemId: "minecraft:stone", count: 30, label: "30 Stone" }, { itemId: "minecraft:iron_bars", count: 2, label: "2 Iron Bars" }] },
  { id: "kingdoms:king_castle_item", label: "King's Castle", desc: "Grand two-story keep with throne hall royal chambers 4 towers and world leaderboard", prereq: true,
    costs: [{ itemId: "minecraft:stone", count: 500, label: "500 Stone" }, { itemId: "minecraft:emerald", count: 50, label: "50 Emeralds" }] },
  { id: "kingdoms:town_hall_item", label: "Occupy: Town Hall", desc: "Place in a defeated or unclaimed village to take ownership", prereq: true,
    costs: [{ itemId: "minecraft:emerald", count: 100, label: "100 Emeralds" }] }
];
async function showBuildingShopMenu(player, village) {
  const hasInfra = !!(village.granaryLocation && village.treasuryLocation);
  const available = SHOP_ITEMS.filter((i) => !i.prereq || hasInfra);
  let bodyText = hasInfra
    ? `\xA77Village:\xA7f ${village.name}\n\xA77Villagers:\xA7f ${village.population}/${MAX_VILLAGE_POPULATION}\n\n\xA7fAll materials are taken from your inventory.\xA7f Select a structure to purchase.`
    : `\xA7c! You must build a Granary and Treasury first!\n\xA7fAll other structures are locked until both are active.\n\nOnly Granary and Treasury are available for purchase.`;
  const form = new ActionFormData().title(`${village.name} - Building Shop`).body(bodyText);
  for (const item of available) {
    const costStr = item.costs.map((r) => r.label).join(" + ");
    form.button(`${item.label}\n\xA77Cost: ${costStr}`);
  }
  form.button("\xA77Close");
  const response = await form.show(player);
  if (response.canceled || response.selection === void 0) return;
  if (response.selection >= available.length) return;
  const chosen = available[response.selection];
  purchaseBuilding(player, village, chosen);
}
function purchaseBuilding(player, village, shopItem) {
  const inv = player.getComponent(EntityInventoryComponent8.componentId);
  const container = inv?.container;
  if (!container) return;
  const inventory = {};
  for (let i = 0; i < container.size; i++) {
    const slot = container.getItem(i);
    if (slot) inventory[slot.typeId] = (inventory[slot.typeId] ?? 0) + slot.amount;
  }
  for (const req of shopItem.costs) {
    const have = req.items
      ? req.items.reduce((s, id) => s + (inventory[id] ?? 0), 0)
      : (inventory[req.itemId] ?? 0);
    if (have < req.count) {
      notifyPlayer(player.name, `\xA7cNeed ${req.label} to purchase ${shopItem.label}. Have: ${have}.`);
      return;
    }
  }
  for (const req of shopItem.costs) {
    let remaining = req.count;
    const targetIds = req.items ?? [req.itemId];
    for (let i = 0; i < container.size && remaining > 0; i++) {
      const slot = container.getItem(i);
      if (!slot || !targetIds.includes(slot.typeId)) continue;
      const take = Math.min(slot.amount, remaining);
      remaining -= take;
      if (take >= slot.amount) {
        container.setItem(i, void 0);
      } else {
        slot.amount -= take;
        container.setItem(i, slot);
      }
    }
  }
  let placed = false;
  for (let i = 0; i < container.size; i++) {
    if (!container.getItem(i)) {
      try { container.setItem(i, new ItemStack6(shopItem.id, 1)); placed = true; break; } catch {}
    }
  }
  const costStr = shopItem.costs.map((r) => r.label).join(" + ");
  if (placed) {
    notifyPlayer(player.name, `\xA7aPurchased ${shopItem.label}! Cost: ${costStr}. Place it in your village to construct it.`);
  } else {
    notifyPlayer(player.name, `\xA7cInventory full - ${shopItem.label} could not be received. Materials have been refunded at your feet.`);
    for (const req of shopItem.costs) {
      const ids = req.items ?? [req.itemId];
      const perType = Math.ceil(req.count / ids.length);
      for (const id of ids) dropItemsAtLoc(world16.getDimension(village.location.dimension), player.location, id, perType);
    }
  }
}
async function showBarracksMenu(player, block) {
  const village = findVillageAt2(block.location);
  if (!village || village.owner !== player.name) {
    notifyPlayer(player.name, "\xA7cYou don't own this village.");
    return;
  }
  const t = village.troops;
  const carried = countTroopTokens(player);
  const carriedTotal = carried.cityGuards + carried.spearmen + carried.archers + carried.cavalry;
  const tick = getCurrentTick();
  const queueSummary = getTrainingQueueSummary(village, tick);
  const queueCount = village.trainingQueue?.length ?? 0;
  const form = new ActionFormData().title(`${village.name} \u2014 Barracks Lv${village.barracksLevel}`).body(
    `\xA77\u2500\u2500 Stationed \u2500\u2500
Guards: ${t.cityGuards}  Spearmen: ${t.spearmen}
Archers: ${t.archers}  Cavalry: ${t.cavalry}

\xA77\u2500\u2500 Carried in Inventory \u2500\u2500
Guards: ${carried.cityGuards}  Spearmen: ${carried.spearmen}
Archers: ${carried.archers}  Cavalry: ${carried.cavalry}

\xA77\u2500\u2500 Training Queue (${queueCount}/10) \u2500\u2500
${queueSummary}

Treasury: ${village.treasury}\u{1F48E}  Iron: ${village.resourceStorage.iron}  Gold: ${village.resourceStorage.gold}
\xA77Withdraw cost: \xA7b10\u{1F48E} per 10 soldiers`
  );
  form.button("Recruit City Guard (5\u{1F48E} each)");
  form.button("Recruit Spearman (8\u{1F48E} each)");
  form.button("Recruit Archer (8\u{1F48E} each)");
  form.button("Recruit Cavalry (12\u{1F48E} each)");
  form.button("Recruit Samurai (15\u{1F48E} each)");
  form.button("Recruit Heavy Knight (15\u{1F48E} each)");
  form.button("Disband Guards");
  form.button("Disband Spearmen");
  form.button(`Upgrade Barracks (${village.barracksLevel * 15}\u{1F48E})`);
  form.button(`\u2694 Pick Up Troops\n\xA77${t.cityGuards + t.spearmen + t.archers + t.cavalry + (t.samurai ?? 0) + (t.heavyKnights ?? 0)} total stationed`);
  form.button(carriedTotal > 0 ? `\u{1F3F9} Return Troops (${carriedTotal} carried)` : "\u{1F3F9} Return Troops (none carried)");
  form.button(`\xA7a\u{1FA96} Train Troops (queue: ${queueCount}/10)`);
  form.button(`\xA76Get Formation Set x10 (Free)`);
  form.button("\xA7eGet Recall Scroll (Free)");
  const response = await form.show(player);
  if (response.canceled) return;
  switch (response.selection) {
    case 0: await showRecruitSlider(player, village, "cityGuards", "City Guard", 5); break;
    case 1: await showRecruitSlider(player, village, "spearmen", "Spearman", 8); break;
    case 2: await showRecruitSlider(player, village, "archers", "Archer", 8); break;
    case 3: await showRecruitSlider(player, village, "cavalry", "Cavalry", 12); break;
    case 4: await showRecruitSlider(player, village, "samurai", "Samurai", 15); break;
    case 5: await showRecruitSlider(player, village, "heavyKnights", "Heavy Knight", 15); break;
    case 6: await showDisbandSlider(player, village, "cityGuards", "City Guards"); break;
    case 7: await showDisbandSlider(player, village, "spearmen", "Spearmen"); break;
    case 8:
      upgradeBarracks(village);
      break;
    case 9:
      await showPickUpTroopsForm(player, village);
      break;
    case 10:
      await showReturnTroopsForm(player, village);
      break;
    case 11:
      await showTrainTroopsForm(player, village);
      break;
    case 12:
      await showGetFormationSetForm(player, village);
      break;
    case 13: {
      const inv11 = player.getComponent(EntityInventoryComponent8.componentId);
      const c11 = inv11?.container;
      if (!c11) break;
      let gave11 = false;
      for (let i = 0; i < c11.size; i++) {
        if (!c11.getItem(i)) { try { c11.setItem(i, new ItemStack6("kingdoms:recall_scroll", 1)); gave11 = true; } catch {} break; }
      }
      notifyPlayer(player.name, gave11 ? `\xA7eRecall Scroll obtained! Right-click to recall nearby troops.` : "\xA7cInventory full - no space for Recall Scroll.");
      break;
    }
  }
}
async function showRecruitSlider(player, village, troopKey, label, costPer) {
  const maxAfford = Math.floor(village.treasury / costPer);
  if (maxAfford <= 0) {
    notifyPlayer(player.name, `\xA7cNot enough treasury emeralds to recruit ${label}. Need ${costPer}\u{1F48E} each.`);
    return;
  }
  const maxRecruit = Math.min(maxAfford, 50);
  const form = new ModalFormData()
    .title(`Recruit ${label}`)
    .slider(`How many ${label}s? (${costPer}\u{1F48E} each, treasury: ${village.treasury}\u{1F48E})`, 1, maxRecruit, 1, 1);
  const resp = await form.show(player);
  if (resp.canceled) return;
  const qty = resp.formValues[0];
  for (let i = 0; i < qty; i++) recruitTroop(village, troopKey, 1);
  notifyPlayer(player.name, `\xA7aRecruited ${qty}x ${label}. Treasury: ${village.treasury}\u{1F48E}`);
}
async function showDisbandSlider(player, village, troopKey, label) {
  const available = village.troops[troopKey] ?? 0;
  if (available <= 0) { notifyPlayer(player.name, `\xA7cNo ${label} to disband.`); return; }
  const form = new ModalFormData()
    .title(`Disband ${label}`)
    .slider(`How many ${label} to disband?`, 1, available, 1, 1);
  const resp = await form.show(player);
  if (resp.canceled) return;
  const qty = resp.formValues[0];
  for (let i = 0; i < qty; i++) disbandTroop(village, troopKey, 1);
  notifyPlayer(player.name, `\xA7eDisbanded ${qty}x ${label}.`);
}
async function showPickUpTroopsForm(player, village) {
  const t = village.troops;
  const total = t.cityGuards + t.spearmen + t.archers + t.cavalry + (t.samurai ?? 0) + (t.heavyKnights ?? 0);
  if (total === 0) {
    notifyPlayer(player.name, `\xA7cNo troops stationed in \xA7b${village.name}\xA7c to pick up.`);
    return;
  }
  const form = new ModalFormData()
    .title(`\u2694 Pick Up Troops \u2014 ${village.name}`)
    .slider(`City Guards (${t.cityGuards} available)`, 0, Math.max(t.cityGuards, 1), 1, 0)
    .slider(`Spearmen (${t.spearmen} available)`, 0, Math.max(t.spearmen, 1), 1, 0)
    .slider(`Archers (${t.archers} available)`, 0, Math.max(t.archers, 1), 1, 0)
    .slider(`Cavalry (${t.cavalry} available)`, 0, Math.max(t.cavalry, 1), 1, 0)
    .slider(`Samurai (${t.samurai ?? 0} available)`, 0, Math.max(t.samurai ?? 0, 1), 1, 0)
    .slider(`Heavy Knights (${t.heavyKnights ?? 0} available)`, 0, Math.max(t.heavyKnights ?? 0, 1), 1, 0);
  const response = await form.show(player);
  if (response.canceled) return;
  const [guards, spearmen, archers, cavalry, samurai, heavyKnights] = response.formValues;
  pickupTroops(player, village, { cityGuards: guards, spearmen, archers, cavalry, samurai, heavyKnights });
}
async function showReturnTroopsForm(player, village) {
  const carried = countTroopTokens(player);
  const total = carried.cityGuards + carried.spearmen + carried.archers + carried.cavalry + (carried.samurai ?? 0) + (carried.heavyKnights ?? 0);
  if (total === 0) {
    notifyPlayer(player.name, "\xA7cYou are not carrying any troops.");
    return;
  }
  const form = new ActionFormData().title(`Return Troops \u2014 ${village.name}`).body(
    `\xA77Return all carried troops to this barracks.

\xA7fCarrying:
  Guards: ${carried.cityGuards}
  Spearmen: ${carried.spearmen}
  Archers: ${carried.archers}
  Cavalry: ${carried.cavalry}
  Samurai: ${carried.samurai ?? 0}
  Heavy Knights: ${carried.heavyKnights ?? 0}

\xA7aTotal: ${total} troops`
  ).button("Return All Troops").button("Cancel");
  const response = await form.show(player);
  if (response.canceled || response.selection !== 0) return;
  const inv = player.getComponent(EntityInventoryComponent8.componentId);
  if (!inv?.container) return;
  const container = inv.container;
  for (let i = 0; i < container.size; i++) {
    const slot = container.getItem(i);
    if (!slot) continue;
    const info = TROOP_TOKEN_MAP[slot.typeId];
    if (!info) continue;
    village.troops[info.troopType] += slot.amount;
    container.setItem(i, void 0);
  }
  saveVillage(village);
  notifyPlayer(player.name, `\xA7a${total} troops returned to \xA7b${village.name}\xA7a barracks.`);
}
async function showTrainTroopsForm(player, village) {
  const tick = getCurrentTick();
  const queueCount = village.trainingQueue?.length ?? 0;
  const troopTypes = ["cityGuards", "spearmen", "archers", "cavalry"];
  const makeCostLine = (type) => {
    const c = TRAINING_COSTS[type];
    const secs = Math.ceil(TRAINING_TICKS[type] / 20);
    const parts = [`${c.emeralds}\u{1F48E}`, `${c.iron} iron`];
    if (c.gold > 0) parts.push(`${c.gold} gold`);
    return `${parts.join(", ")} | ~${secs}s/unit`;
  };
  const rs = village.resourceStorage;
  const queueSummary = getTrainingQueueSummary(village, tick);
  const form = new ActionFormData().title(`Train Troops \u2014 ${village.name}`).body(
    `\xA77\u2500\u2500 Resources \u2500\u2500
Treasury: \xA7f${village.treasury}\u{1F48E}  \xA77Iron: \xA7f${rs.iron}  \xA77Gold: \xA7f${rs.gold}

\xA77\u2500\u2500 Queue (${queueCount}/10) \u2500\u2500
${queueSummary}

\xA77Select a troop type to queue training:`
  ).button(`City Guard
\xA77${makeCostLine("cityGuards")}`).button(`Spearman
\xA77${makeCostLine("spearmen")}`).button(`Archer
\xA77${makeCostLine("archers")}`).button(`Cavalry
\xA77${makeCostLine("cavalry")}`).button("Back");
  const response = await form.show(player);
  if (response.canceled || response.selection === 4) return;
  const selectedType = troopTypes[response.selection];
  const countForm = new ModalFormData().title(`Train ${TROOP_LABELS[selectedType]}`).slider(`How many to train? (cost x N)`, 1, 20, 1, 1);
  const countResponse = await countForm.show(player);
  if (countResponse.canceled || countResponse.formValues == null) return;
  const count = countResponse.formValues[0];
  queueTraining(village, selectedType, count, tick);
}
async function showMarketMenu(player, block) {
  const village = findVillageAt2(block.location);
  if (!village || village.owner !== player.name) {
    notifyPlayer(player.name, "\xA7cYou don't own this village.");
    return;
  }
  const maxMerchants = Math.floor(village.marketLevel * 1.5 + village.population / 20);
  const merchantList = village.activeMerchants.map(
    (m, i) => `Merchant ${i + 1}: ${Object.entries(m.stock).map(([k, v]) => `${k.replace("minecraft:", "")}\xD7${v}`).join(", ")}`
  ).join("\n") || "No merchants present.";
  const form = new ActionFormData().title(`${village.name} \u2014 Market Lv${village.marketLevel}`).body(
    `\xA7bTreasury: \xA76${village.treasury}\u{1F48E}\xA7r  |  Merchants: ${village.activeMerchants.length}/${maxMerchants}

${merchantList}

\xA77Tip: hold food and right-click granary to deposit instantly.
\xA77Hold emeralds and right-click treasury to deposit instantly.`
  ).button("\u{1F331} Seed Shop").button("\u{1F33E} Sell Food (bulk)").button(`\u2B06 Upgrade Market (${village.marketLevel * 20}\u{1F48E})`).button("\u{1F35E} Buy Food (abstract, 20\u{1F48E}/10)").button("\u{1F4B0} Sell Food (abstract, 10\u{1F48E}/10)").button("\u{1F33F} Bob's Farming Seeds").button("\uD83D\uDC04 Livestock Pen\n\xA7730\u{1F48E} \u2014 large fenced enclosure").button("\uD83D\uDED6 Barn\n\xA7740\u{1F48E} \u2014 multipurpose cattle barn").button("Close");
  const response = await form.show(player);
  if (response.canceled) return;
  switch (response.selection) {
    case 0:
      await showSeedShopMenu(player, village);
      break;
    case 1:
      await showFoodSellMenu(player, village);
      break;
    case 2:
      upgradeMarket(village);
      break;
    case 3:
      buyFood(village, 10);
      break;
    case 4:
      sellFood(village, 10);
      break;
    case 5:
      await showBobsFarmingShopMenu(player, village);
      break;
    case 6:
      purchaseBuilding(player, village, { id: "kingdoms:fence_enclosure_item", label: "Livestock Pen", cost: 30, costItem: "minecraft:emerald" });
      break;
    case 7:
      purchaseBuilding(player, village, { id: "kingdoms:barn_item", label: "Barn", cost: 40, costItem: "minecraft:emerald" });
      break;
  }
}
async function showSeedShopMenu(player, village) {
  const form = new ActionFormData().title(`${village.name} \u2014 Seed Shop`).body(
    `\xA7bBuy seeds with emeralds from your inventory.
\xA77Market Lv${village.marketLevel} (needs Lv1+)

Seeds help villager farmers auto-replant crops.`
  );
  for (const entry of SEED_SHOP) {
    form.button(`${entry.label} \xD7${entry.quantityPerPurchase}  [${entry.emeraldCost}\u{1F48E}]`);
  }
  form.button("Back");
  const response = await form.show(player);
  if (response.canceled || response.selection === void 0) return;
  if (response.selection >= SEED_SHOP.length) return;
  buySeedsFromMarket(player, village, SEED_SHOP[response.selection]);
}
async function showFoodSellMenu(player, village) {
  const form = new ActionFormData().title(`${village.name} \u2014 Sell Food`).body(
    `\xA7bSell food in bulk for emeralds (to your inventory).
\xA77Sources: granary first, then player inventory.
\xA7cMinimum batch required \u2014 low rates by design.`
  );
  for (const entry2 of FOOD_SELL_RATES) {
    const granaryStock = village.granaryItems[entry2.itemId] ?? 0;
    const batchVal = entry2.itemsPerEmerald;
    form.button(`${entry2.label}  [${batchVal} items = 1\u{1F48E}]  Granary: ${granaryStock}`);
  }
  form.button("Back");
  const response = await form.show(player);
  if (response.canceled || response.selection === void 0) return;
  if (response.selection >= FOOD_SELL_RATES.length) return;
  const entry = FOOD_SELL_RATES[response.selection];
  const batchForm = new ModalFormData().title(`Sell ${entry.label}`).slider(`Batches to sell (${entry.itemsPerEmerald} items = 1\u{1F48E}, min ${entry.minBatch} items)`, 1, 10, 1, 1);
  const batchResp = await batchForm.show(player);
  if (batchResp.canceled || batchResp.formValues === void 0) return;
  const batches = batchResp.formValues[0];
  sellFoodBulk(player, village, entry, batches);
}
async function showBobsFarmingShopMenu(player, village) {
  const BOB_SEEDS = [
    { itemId: "twb_farm:garlic", label: "Garlic", qty: 6, cost: 2 },
    { itemId: "twb_farm:onion", label: "Onion", qty: 6, cost: 2 },
    { itemId: "twb_farm:rice", label: "Rice", qty: 8, cost: 2 },
    { itemId: "twb_farm:broccoli", label: "Broccoli", qty: 6, cost: 2 },
    { itemId: "twb_farm:cauliflower", label: "Cauliflower", qty: 6, cost: 3 },
    { itemId: "twb_farm:chili", label: "Chili", qty: 6, cost: 3 },
    { itemId: "twb_farm:eggplant", label: "Eggplant", qty: 6, cost: 2 },
    { itemId: "twb_farm:leek", label: "Leek", qty: 6, cost: 2 },
    { itemId: "twb_farm:grape", label: "Grape", qty: 8, cost: 3 },
    { itemId: "twb_farm:pineapple", label: "Pineapple", qty: 4, cost: 5 }
  ];
  const form = new ActionFormData()
    .title(`${village.name} \u2014 \u{1F33F} Bob's Farming`)
    .body(`\xA7aBuy Bob's Farming seeds with treasury emeralds.\n\xA77Treasury: \xA76${village.treasury}\u{1F48E}\n\xA7cRequires Bob's Farming addon to be installed.`);
  for (const s of BOB_SEEDS) {
    form.button(`${s.label} \xD7${s.qty}  [${s.cost}\u{1F48E}]`);
  }
  form.button("Back");
  const resp = await form.show(player);
  if (resp.canceled || resp.selection === void 0 || resp.selection >= BOB_SEEDS.length) return;
  const seed = BOB_SEEDS[resp.selection];
  if (village.treasury < seed.cost) {
    notifyPlayer(player.name, `\xA7cNeed \xA76${seed.cost}\u{1F48E}\xA7c but treasury has \xA76${village.treasury}\u{1F48E}`);
    return;
  }
  try {
    const inv = player.getComponent("minecraft:inventory");
    const container = inv?.container;
    if (!container) return;
    let placed = false;
    for (let i2 = 0; i2 < container.size; i2++) {
      if (!container.getItem(i2)) {
        container.setItem(i2, new ItemStack6(seed.itemId, seed.qty));
        placed = true;
        break;
      }
    }
    if (!placed) { notifyPlayer(player.name, "\xA7cInventory full! Make room first."); return; }
    village.treasury -= seed.cost;
    saveVillage(village);
    notifyPlayer(player.name, `\xA7aBought \xA7b${seed.qty}\xD7${seed.label}\xA7a for \xA76${seed.cost}\u{1F48E}`);
  } catch (e2) {
    notifyPlayer(player.name, `\xA7cFailed to give item \u2014 ensure Bob's Farming addon is active. (${e2?.message ?? ""})`);
  }
}
async function showBlacksmithMenu(player, block) {
  const village = findVillageAt2(block.location);
  if (!village || village.owner !== player.name) {
    notifyPlayer(player.name, "\xA7cYou don't own this village.");
    return;
  }
  const summary = getBlacksmithSummary(village);
  const res = village.resourceStorage ?? { ...EMPTY_RESOURCE_STORAGE };
  const storageLine = `\n\xA77Storage: Iron=${res.iron} Gold=${res.gold} \u{1F48E}=${res.diamonds}`;
  const scrollLabel = "\xA7b\uD83D\uDCDC Buy Formation Scroll\n\xA7715\u{1F48E} from inventory \u2014 opens Strategic Map";
  const form = new ActionFormData()
    .title(`${village.name} \u2014 Blacksmith`)
    .body(summary + storageLine)
    .button("\u2B06 Upgrade Weapons")
    .button("\u2B06 Upgrade Armor")
    .button("\uD83D\uDD28 Bulk Forge Iron Sets")
    .button("\uD83D\uDD28 Bulk Forge Diamond Sets")
    .button("\uD83D\uDD27 Bulk Repair (4 Iron)")
    .button("\u2694 Bulk Equip from Armory")
    .button(scrollLabel)
    .button("Close");
  const response = await form.show(player);
  if (response.canceled) return;
  switch (response.selection) {
    case 0:
      upgradeWeapons(player, village.id);
      break;
    case 1:
      upgradeArmor(player, village.id);
      break;
    case 2:
      bulkForge(player, village, "iron");
      break;
    case 3:
      bulkForge(player, village, "diamond");
      break;
    case 4:
      bulkRepair(player, village);
      break;
    case 5:
      if (village.armoryLocation) {
        await showArmoryEquipMenu(player, village);
      } else {
        notifyPlayer(player.name, "\xA7cNo Armory built in this village. Build one first.");
      }
      break;
    case 6: {
      const inv6 = player.getComponent(EntityInventoryComponent8.componentId);
      const c6 = inv6?.container;
      if (!c6) break;
      const scrollCost = 15;
      let em6 = 0;
      for (let i = 0; i < c6.size; i++) { const s = c6.getItem(i); if (s?.typeId === "minecraft:emerald") em6 += s.amount; }
      if (em6 < scrollCost) {
        notifyPlayer(player.name, `\xA7cNeed ${scrollCost}\u{1F48E} in your inventory to buy a Formation Scroll. Have: ${em6}.`);
        break;
      }
      let rem6 = scrollCost;
      for (let i = 0; i < c6.size && rem6 > 0; i++) {
        const s = c6.getItem(i);
        if (s?.typeId !== "minecraft:emerald") continue;
        const take = Math.min(s.amount, rem6); rem6 -= take;
        if (take >= s.amount) c6.setItem(i, void 0);
        else { s.amount -= take; c6.setItem(i, s); }
      }
      let gave6 = false;
      for (let i = 0; i < c6.size; i++) {
        if (!c6.getItem(i)) { try { c6.setItem(i, new ItemStack6("kingdoms:formation_scroll", 1)); gave6 = true; } catch {} break; }
      }
      notifyPlayer(player.name, gave6
        ? `\xA7b\uD83D\uDCDC Formation Scroll purchased for ${scrollCost}\u{1F48E}! Right-click to open the Strategic Map.`
        : "\xA7cInventory full \u2014 free up a slot. Emeralds refunded.");
      if (!gave6) dropItemsAtLoc(player.dimension, player.location, "minecraft:emerald", scrollCost);
      break;
    }
  }
}
function bulkForge(player, village, tier) {
  const recipe = FORGE_RECIPES[tier];
  if (!recipe) { notifyPlayer(player.name, "\xA7cUnknown tier."); return; }
  village.resourceStorage ?? (village.resourceStorage = { ...EMPTY_RESOURCE_STORAGE });
  const res = village.resourceStorage;
  const soldiers = Math.max(1, (village.soldiers?.cityGuards ?? 0) + (village.soldiers?.spearmen ?? 0) + (village.soldiers?.archers ?? 0) + (village.soldiers?.cavalry ?? 0));
  const wCost = recipe.weaponCost * soldiers;
  const aCost = recipe.armorCost * soldiers;
  const mat = res[recipe.materialKey] ?? 0;
  if (mat < wCost + aCost) {
    notifyPlayer(player.name, `\xA7cNeed ${wCost + aCost} ${recipe.materialKey} to forge ${soldiers} set(s). Have: ${mat}.`);
    return;
  }
  res[recipe.materialKey] -= wCost + aCost;
  village.armoryItems ?? (village.armoryItems = {});
  village.armoryItems[recipe.weaponItem] = (village.armoryItems[recipe.weaponItem] ?? 0) + soldiers;
  village.armoryItems[recipe.armorPiece] = (village.armoryItems[recipe.armorPiece] ?? 0) + soldiers;
  saveVillage(village);
  notifyPlayer(player.name, `\xA7aForged ${soldiers} ${tier} weapon(s) and armor piece(s)! Check the Armory to equip soldiers.`);
}
function bulkRepair(player, village) {
  const cost = 4;
  village.resourceStorage ?? (village.resourceStorage = { ...EMPTY_RESOURCE_STORAGE });
  const res = village.resourceStorage;
  if ((res.iron ?? 0) < cost) {
    notifyPlayer(player.name, `\xA7cNeed ${cost} iron ingots to repair. Have: ${res.iron ?? 0}.`);
    return;
  }
  res.iron -= cost;
  saveVillage(village);
  notifyPlayer(player.name, "\xA7aAll soldier equipment repaired! Soldiers fight at peak effectiveness.");
}
async function showStorageMenu(player, block) {
  const village = findVillageAt2(block.location);
  if (!village || village.owner !== player.name) {
    notifyPlayer(player.name, "\xA7cYou don't own this village.");
    return;
  }
  village.resourceStorage ?? (village.resourceStorage = { ...EMPTY_RESOURCE_STORAGE });
  const res = village.resourceStorage;
  const lines = Object.entries(RESOURCE_LABELS).map(([k, label]) => `${label}: ${res[k] ?? 0}`).join("\n");
  const form = new ActionFormData()
    .title(`${village.name} \u2014 Material Storage`)
    .body(lines + "\n\n\xA77Use Deposit or Withdraw buttons below:")
    .button("\xA7a\u2795 Deposit Materials")
    .button("\xA7e\u2796 Withdraw Materials")
    .button("Close");
  const response = await form.show(player);
  if (response.canceled || response.selection === void 0 || response.selection === 2) return;
  if (response.selection === 0) {
    await showStorageDepositSlider(player, village);
  } else if (response.selection === 1) {
    await showStorageWithdrawSlider(player, village);
  }
}
async function showStorageDepositSlider(player, village) {
  village.resourceStorage ?? (village.resourceStorage = { ...EMPTY_RESOURCE_STORAGE });
  const inv = player.getComponent(EntityInventoryComponent8.componentId);
  const container = inv?.container;
  if (!container) return;
  const available = {};
  for (let i = 0; i < container.size; i++) {
    const slot = container.getItem(i);
    if (!slot) continue;
    const key = MERCHANT_MATERIAL_MAP[slot.typeId];
    if (key) available[key] = (available[key] ?? 0) + slot.amount;
  }
  const depositable = Object.entries(available).filter(([, v]) => v > 0);
  if (depositable.length === 0) { notifyPlayer(player.name, "\xA7cNo storable materials in your inventory."); return; }
  const matOpts = depositable.map(([k, v]) => `${RESOURCE_LABELS[k]} (have ${v})`);
  const matForm = new ActionFormData().title("Deposit \u2014 Choose Material").body("Select which material to deposit:");
  for (const opt of matOpts) matForm.button(opt);
  matForm.button("Cancel");
  const matResp = await matForm.show(player);
  if (matResp.canceled || matResp.selection === void 0 || matResp.selection >= depositable.length) return;
  const [key, maxAmt] = depositable[matResp.selection];
  const sliderForm = new ModalFormData()
    .title(`Deposit ${RESOURCE_LABELS[key]}`)
    .slider(`Amount to deposit (have ${maxAmt}):`, 1, maxAmt, 1, maxAmt);
  const sliderResp = await sliderForm.show(player);
  if (sliderResp.canceled) return;
  const qty = sliderResp.formValues[0];
  const itemId = RESOURCE_ITEM_IDS[key];
  if (!itemId) return;
  let remaining = qty;
  for (let i = 0; i < container.size && remaining > 0; i++) {
    const slot = container.getItem(i);
    if (slot?.typeId !== itemId) continue;
    const take = Math.min(slot.amount, remaining); remaining -= take;
    if (take >= slot.amount) container.setItem(i, void 0);
    else { slot.amount -= take; container.setItem(i, slot); }
  }
  const deposited = qty - remaining;
  village.resourceStorage[key] = (village.resourceStorage[key] ?? 0) + deposited;
  saveVillage(village);
  notifyPlayer(player.name, `\xA7aDeposited ${deposited}x ${RESOURCE_LABELS[key]} into storage.`);
}
async function showStorageWithdrawSlider(player, village) {
  village.resourceStorage ?? (village.resourceStorage = { ...EMPTY_RESOURCE_STORAGE });
  const res = village.resourceStorage;
  const withdrawable = Object.entries(res).filter(([, v]) => v > 0);
  if (withdrawable.length === 0) { notifyPlayer(player.name, "\xA7cStorage is empty."); return; }
  const matForm = new ActionFormData().title("Withdraw \u2014 Choose Material").body("Select which material to withdraw:");
  for (const [k, v] of withdrawable) matForm.button(`${RESOURCE_LABELS[k]} (${v} in storage)`);
  matForm.button("Cancel");
  const matResp = await matForm.show(player);
  if (matResp.canceled || matResp.selection === void 0 || matResp.selection >= withdrawable.length) return;
  const [key, maxAmt] = withdrawable[matResp.selection];
  const sliderForm = new ModalFormData()
    .title(`Withdraw ${RESOURCE_LABELS[key]}`)
    .slider(`Amount to withdraw (${maxAmt} in storage):`, 1, maxAmt, 1, Math.min(16, maxAmt));
  const sliderResp = await sliderForm.show(player);
  if (sliderResp.canceled) return;
  const qty = sliderResp.formValues[0];
  const itemId = RESOURCE_ITEM_IDS[key];
  if (!itemId) return;
  const inv = player.getComponent(EntityInventoryComponent8.componentId);
  const container = inv?.container;
  if (!container) return;
  let given = 0;
  for (let i = 0; i < container.size && given < qty; i++) {
    const slot = container.getItem(i);
    if (!slot) { const toGive = Math.min(qty - given, 64); try { container.setItem(i, new ItemStack6(itemId, toGive)); given += toGive; } catch {} }
  }
  res[key] = Math.max(0, (res[key] ?? 0) - given);
  saveVillage(village);
  if (given > 0) notifyPlayer(player.name, `\xA7aWithdrew ${given}x ${RESOURCE_LABELS[key]} from storage.`);
  else notifyPlayer(player.name, "\xA7cInventory full \u2014 could not withdraw.");
  if (given > 0 && given < qty) notifyPlayer(player.name, `\xA7eInventory partially full. Only ${given}/${qty} withdrawn.`);
}
function _storageMenuOld_unused() {
}
async function showArmoryMenu(player, block) {
  const village = findVillageAt2(block.location);
  if (!village || village.owner !== player.name) {
    notifyPlayer(player.name, "\xA7cYou don't own this village.");
    return;
  }
  village.armoryItems ?? (village.armoryItems = {});
  const items = Object.entries(village.armoryItems).filter(([, v]) => v > 0);
  const soldiers = (village.soldiers?.cityGuards ?? 0) + (village.soldiers?.spearmen ?? 0) + (village.soldiers?.archers ?? 0) + (village.soldiers?.cavalry ?? 0);
  const bodyLines = items.length > 0 ? items.map(([id, cnt]) => `${id.replace("minecraft:", "")} \xD7${cnt}`).join("\n") : "\xA77Armory is empty.\nHold a weapon or armor piece and tap to deposit.";
  const form = new ActionFormData()
    .title(`${village.name} \u2014 Armory`)
    .body(bodyLines + `\n\nSoldiers: ${soldiers}\n\xA77Hold a weapon/armor and tap block to deposit.`);
  for (const [id] of items) form.button(`Withdraw 4x ${id.replace("minecraft:", "")}`);
  form.button("\u2694 Equip Soldiers from Armory");
  form.button("Close");
  const response = await form.show(player);
  if (response.canceled || response.selection === void 0) return;
  if (response.selection < items.length) {
    const [itemId] = items[response.selection];
    const amount = Math.min(4, village.armoryItems[itemId] ?? 0);
    if (amount <= 0) { notifyPlayer(player.name, "\xA7cNone in armory."); return; }
    const inv = player.getComponent(EntityInventoryComponent8.componentId);
    const container = inv?.container;
    if (!container) return;
    let given = 0;
    for (let i = 0; i < container.size && given < amount; i++) {
      const slot = container.getItem(i);
      if (!slot) { const qty = Math.min(amount - given, 64); try { container.setItem(i, new ItemStack6(itemId, qty)); given += qty; } catch {} }
    }
    village.armoryItems[itemId] -= given;
    saveVillage(village);
    if (given > 0) notifyPlayer(player.name, `\xA7aWithdrew ${given}x ${itemId.replace("minecraft:", "")} from armory.`);
  } else if (response.selection === items.length) {
    await showArmoryEquipMenu(player, village);
  }
}
async function showArmoryEquipMenu(player, village) {
  village.armoryItems ?? (village.armoryItems = {});
  const bsm = village.blacksmith ?? { weaponTier: "wood", armorTier: "leather" };
  const soldiers = Math.max(1, (village.soldiers?.cityGuards ?? 0) + (village.soldiers?.spearmen ?? 0) + (village.soldiers?.archers ?? 0) + (village.soldiers?.cavalry ?? 0));
  const availWeapons = WEAPON_TIERS.filter((t) => (village.armoryItems[`minecraft:${t}_sword`] ?? 0) + (village.armoryItems[`minecraft:${t}_axe`] ?? 0) > 0);
  const availArmors = ARMOR_TIERS.filter((t) => (village.armoryItems[`minecraft:${t}_chestplate`] ?? 0) + (village.armoryItems[`minecraft:${t}_helmet`] ?? 0) > 0);
  const body = `Current: \xA7aWeapons: ${bsm.weaponTier}\xA7r | \xA7aArmor: ${bsm.armorTier}\xA7r\n\nSoldiers: ${soldiers}\nSelect what to equip (1 weapon or 4 armor pieces per soldier):`;
  const form = new ActionFormData().title("Equip Soldiers \u2014 Armory").body(body);
  const options = [];
  for (const t of availWeapons) {
    const cnt = (village.armoryItems[`minecraft:${t}_sword`] ?? 0) + (village.armoryItems[`minecraft:${t}_axe`] ?? 0);
    form.button(`\u2694 ${t.charAt(0).toUpperCase() + t.slice(1)} Weapons (${cnt} avail)`);
    options.push({ type: "weapon", tier: t });
  }
  for (const t of availArmors) {
    const cnt = (village.armoryItems[`minecraft:${t}_chestplate`] ?? 0) + (village.armoryItems[`minecraft:${t}_helmet`] ?? 0);
    form.button(`\uD83D\uDEE1 ${t.charAt(0).toUpperCase() + t.slice(1)} Armor (${cnt} avail)`);
    options.push({ type: "armor", tier: t });
  }
  form.button("Back");
  const response = await form.show(player);
  if (response.canceled || response.selection === void 0 || response.selection >= options.length) return;
  const chosen = options[response.selection];
  if (chosen.type === "weapon") {
    const swordId = `minecraft:${chosen.tier}_sword`;
    const axeId = `minecraft:${chosen.tier}_axe`;
    const total = (village.armoryItems[swordId] ?? 0) + (village.armoryItems[axeId] ?? 0);
    if (total < soldiers) { notifyPlayer(player.name, `\xA7cNeed ${soldiers} weapons, have ${total}.`); return; }
    let need = soldiers;
    const fromSword = Math.min(need, village.armoryItems[swordId] ?? 0);
    village.armoryItems[swordId] = (village.armoryItems[swordId] ?? 0) - fromSword;
    need -= fromSword;
    if (need > 0) village.armoryItems[axeId] = (village.armoryItems[axeId] ?? 0) - need;
    bsm.weaponTier = chosen.tier;
    village.blacksmith = bsm;
    saveVillage(village);
    notifyPlayer(player.name, `\xA7aSoldiers equipped with \xA7b${chosen.tier}\xA7a weapons!`);
  } else {
    const piecesNeeded = soldiers * 4;
    const totalArmor = Object.entries(village.armoryItems).filter(([id]) => id.includes(chosen.tier) && (id.includes("_helmet") || id.includes("_chestplate") || id.includes("_leggings") || id.includes("_boots"))).reduce((s, [, c]) => s + c, 0);
    if (totalArmor < piecesNeeded) { notifyPlayer(player.name, `\xA7cNeed ${piecesNeeded} ${chosen.tier} armor pieces, have ${totalArmor}.`); return; }
    let need2 = piecesNeeded;
    for (const suffix of ["_helmet", "_chestplate", "_leggings", "_boots"]) {
      const key = `minecraft:${chosen.tier}${suffix}`;
      const take = Math.min(soldiers, village.armoryItems[key] ?? 0);
      village.armoryItems[key] = (village.armoryItems[key] ?? 0) - take;
      need2 -= take;
    }
    bsm.armorTier = chosen.tier;
    village.blacksmith = bsm;
    saveVillage(village);
    notifyPlayer(player.name, `\xA7aSoldiers equipped with \xA7b${chosen.tier}\xA7a armor!`);
  }
}
async function showGranaryStorageMenu(player, block) {
  const village = findVillageAt2(block.location);
  if (!village || village.owner !== player.name) {
    notifyPlayer(player.name, "\xA7cYou don't own this village.");
    return;
  }
  const report = getGranaryReport(village);
  const items = Object.entries(village.granaryItems).filter(([, count]) => count > 0);
  const prod = getFoodProduction(village);
  const cons = getFoodConsumption(village);
  const fieldTotal = getFieldStorageTotal(village);
  const fieldBtn = `\u{1F33E} Collect Field Harvest${fieldTotal > 0 ? ` (${fieldTotal} food units ready)` : " (empty)"}`;
  const form = new ActionFormData().title(`${village.name} \u2014 Granary`).body(
    `${report}

Farmers: ${village.workers.farmers}  Daily: +${prod}/-${cons}
Shortage: ${village.foodShortageStage}/4`
  );
  const withdrawable = [];
  for (const [item, count] of items) {
    form.button(`Withdraw from Granary\n\xA77${item.replace("minecraft:", "")} (${count} stored)`);
    withdrawable.push({ item, count });
  }
  const fwLevel = village.fieldWorkerLevel ?? 0;
  const fwBtn = fwLevel >= 5 ? `\u{1F9D1}\u200D\u{1F33E} Field Workers Lv5 (maxed)` : `\u2B06 Upgrade Field Workers Lv${fwLevel}\u2192${fwLevel + 1} (20\u{1F48E})`;
  form.button("\xA7a\u2795 Deposit Food from Inventory");
  form.button(fieldBtn);
  form.button("\u{1F4E6} View Field Storage");
  form.button(fwBtn);
  form.button("Close");
  const response = await form.show(player);
  if (response.canceled || response.selection === void 0) return;
  if (response.selection < withdrawable.length) {
    const { item, count } = withdrawable[response.selection];
    const sliderForm = new ModalFormData()
      .title(`Withdraw ${item.replace("minecraft:", "")}`)
      .slider(`How many to withdraw? (${count} stored)`, 1, count, 1, Math.min(16, count));
    const sliderResp = await sliderForm.show(player);
    if (sliderResp.canceled) return;
    const qty = sliderResp.formValues[0];
    if (item === "minecraft:wheat") {
      const maxBread = Math.floor(count / 3);
      const formatForm = new ActionFormData()
        .title("Withdraw Wheat - Choose Form")
        .body(`Stored: ${count} Wheat\nWithdraw ${qty} as:\n\n  - Wheat: receive ${qty} wheat\n  - Bread: every 3 wheat = 1 bread (receive ${Math.floor(qty / 3)} bread from ${Math.floor(qty / 3) * 3} wheat)`)
        .button("Withdraw as Wheat")
        .button(`Withdraw as Bread (${Math.floor(qty / 3)} loaves)`);
      const formatResp = await formatForm.show(player);
      if (formatResp.canceled) return;
      if (formatResp.selection === 1) {
        const loaves = Math.floor(qty / 3);
        if (loaves <= 0) { notifyPlayer(player.name, "\xA7cNeed at least 3 wheat to make 1 bread."); return; }
        const wheatUsed = loaves * 3;
        withdrawFromGranary(player, village, "minecraft:wheat", wheatUsed);
        const inv = player.getComponent(EntityInventoryComponent8.componentId);
        const c = inv?.container;
        if (c) {
          let removed = wheatUsed;
          for (let i = 0; i < c.size && removed > 0; i++) {
            const s = c.getItem(i);
            if (s?.typeId !== "minecraft:wheat") continue;
            const take = Math.min(s.amount, removed); removed -= take;
            if (take >= s.amount) c.setItem(i, void 0);
            else { s.amount -= take; c.setItem(i, s); }
          }
          let given = 0;
          for (let i = 0; i < c.size && given < loaves; i++) {
            const s = c.getItem(i);
            if (!s) { const g = Math.min(loaves - given, 64); try { c.setItem(i, new ItemStack6("minecraft:bread", g)); given += g; } catch {} }
            else if (s.typeId === "minecraft:bread" && s.amount < 64) { const g = Math.min(loaves - given, 64 - s.amount); s.amount += g; c.setItem(i, s); given += g; }
          }
          notifyPlayer(player.name, `\xA7aWithdrew ${loaves} Bread (used ${wheatUsed} wheat).`);
        }
        return;
      }
    }
    withdrawFromGranary(player, village, item, qty);
  } else if (response.selection === withdrawable.length) {
    await showGranaryDepositMenu(player, village);
  } else if (response.selection === withdrawable.length + 1) {
    collectFieldStorage(player, village);
  } else if (response.selection === withdrawable.length + 2) {
    const rpt = getFieldStorageReport(village);
    for (const line of rpt.split("\n")) notifyPlayer(player.name, line);
  } else if (response.selection === withdrawable.length + 3) {
    upgradeFieldWorkers(village);
  }
}
async function showGranaryDepositMenu(player, village) {
  const foodItems = Object.keys(FOOD_ITEM_VALUES).filter((k) => (FOOD_ITEM_VALUES[k] ?? 0) > 0);
  const inv = player.getComponent(EntityInventoryComponent8.componentId);
  const container = inv?.container;
  const inInventory = {};
  if (container) {
    for (let i = 0; i < container.size; i++) {
      const slot = container.getItem(i);
      if (slot && foodItems.includes(slot.typeId)) inInventory[slot.typeId] = (inInventory[slot.typeId] ?? 0) + slot.amount;
    }
  }
  const available = foodItems.filter((k) => (inInventory[k] ?? 0) > 0);
  if (available.length === 0) { notifyPlayer(player.name, "\xA7cNo depositable food in your inventory."); return; }
  const form = new ActionFormData().title(`Deposit Food \u2014 ${village.name}`).body("Select a food type to deposit:");
  for (const item of available) form.button(`${item.replace("minecraft:", "")} (have ${inInventory[item]})`);
  form.button("Cancel");
  const response = await form.show(player);
  if (response.canceled || response.selection === void 0 || response.selection >= available.length) return;
  const chosen = available[response.selection];
  const maxAmt = inInventory[chosen] ?? 0;
  if (maxAmt <= 0) return;
  const sliderForm = new ModalFormData()
    .title(`Deposit ${chosen.replace("minecraft:", "")}`)
    .slider(`How many to deposit? (have ${maxAmt})`, 1, maxAmt, 1, maxAmt);
  const sliderResp = await sliderForm.show(player);
  if (sliderResp.canceled) return;
  depositPlayerItemsToGranary(player, village, chosen, sliderResp.formValues[0]);
}
async function showTreasuryBlockMenu(player, block) {
  const village = findVillageAt2(block.location);
  if (!village || village.owner !== player.name) {
    notifyPlayer(player.name, "\xA7cYou don't own this village.");
    return;
  }
  const report = getTreasuryReport(village);
  const form = new ActionFormData().title(`${village.name} \u2014 Treasury`).body(report).button("Deposit 10\u{1F48E} from inventory").button("Deposit 64\u{1F48E} from inventory").button("Deposit all emeralds").button("Withdraw 10\u{1F48E} to inventory").button("Withdraw 64\u{1F48E} to inventory").button("Close");
  const response = await form.show(player);
  if (response.canceled) return;
  switch (response.selection) {
    case 0:
      depositEmeralds(player, village.id, 10);
      break;
    case 1:
      depositEmeralds(player, village.id, 64);
      break;
    case 2:
      depositEmeralds(player, village.id, 9999);
      break;
    case 3:
      withdrawEmeralds(player, village.id, 10);
      break;
    case 4:
      withdrawEmeralds(player, village.id, 64);
      break;
  }
}
async function showTreasuryMenu(player, villageId) {
  const village = getVillage(villageId);
  if (!village) return;
  const report = getTreasuryReport(village);
  const form = new ActionFormData().title(`${village.name} \u2014 Treasury`).body(report).button("Deposit 10\u{1F48E} from inventory").button("Deposit 64\u{1F48E} from inventory").button("Deposit all emeralds").button("Withdraw 10\u{1F48E} to inventory").button("Withdraw 64\u{1F48E} to inventory").button("Back");
  const response = await form.show(player);
  if (response.canceled) return;
  switch (response.selection) {
    case 0:
      depositEmeralds(player, villageId, 10);
      break;
    case 1:
      depositEmeralds(player, villageId, 64);
      break;
    case 2:
      depositEmeralds(player, villageId, 9999);
      break;
    case 3:
      withdrawEmeralds(player, villageId, 10);
      break;
    case 4:
      withdrawEmeralds(player, villageId, 64);
      break;
  }
}
async function showKingdomOverview(player) {
  const kingdom = getKingdomOf(player.name);
  if (!kingdom) {
    notifyPlayer(player.name, "\xA7cYou are not part of a kingdom.");
    return;
  }
  const summary = getKingdomSummary(kingdom.id);
  const form = new ActionFormData().title(kingdom.name).body(summary).button("Diplomacy").button("Close");
  const response = await form.show(player);
  if (response.canceled) return;
  if (response.selection === 0) await showDiplomacyMenu(player);
}
async function showDiplomacyMenu(player) {
  const myKingdom = getKingdomOf(player.name);
  if (!myKingdom) return;
  const others = getAllKingdoms().filter((k) => k.id !== myKingdom.id);
  if (others.length === 0) {
    notifyPlayer(player.name, "\xA7eNo other kingdoms exist yet.");
    return;
  }
  const form = new ActionFormData().title("Diplomacy").body(`Kingdom: ${myKingdom.name}
Wars: ${myKingdom.wars.length}  Alliances: ${myKingdom.alliances.length}`);
  for (const k of others) {
    const rel = myKingdom.wars.includes(k.id) ? "\xA7c[WAR]" : myKingdom.alliances.includes(k.id) ? "\xA7a[ALLY]" : "\xA77[NEUTRAL]";
    form.button(`${k.name} ${rel}`);
  }
  const response = await form.show(player);
  if (response.canceled || response.selection === void 0) return;
  const target = others[response.selection];
  await showDiplomacyActions(player, myKingdom, target);
}
async function showDiplomacyActions(player, myKingdom, target) {
  const atWar = myKingdom.wars.includes(target.id);
  const allied = myKingdom.alliances.includes(target.id);
  const form = new ActionFormData().title(`Diplomacy \u2014 ${target.name}`).body(`King: ${target.king}
Villages: ${target.villageIds.length}
Relation: ${atWar ? "\xA7cAt War" : allied ? "\xA7aAllied" : "\xA77Neutral"}`);
  const actions = [];
  if (!atWar) {
    form.button("\xA7cDeclare War");
    actions.push(() => declareWar(myKingdom.id, target.id));
  }
  if (atWar) {
    form.button("\xA7aSue for Peace");
    actions.push(() => makePeace(myKingdom.id, target.id));
  }
  if (!allied && !atWar) {
    form.button("\xA7aPropose Alliance");
    actions.push(() => formAlliance(myKingdom.id, target.id));
  }
  form.button("Cancel");
  const response = await form.show(player);
  if (response.canceled || response.selection === void 0) return;
  if (response.selection < actions.length) actions[response.selection]();
}
async function showReinforcementsMenu(player, villageId) {
  const village = getVillage(villageId);
  if (!village) return;
  const kingdom = getKingdomOf(player.name);
  if (!kingdom) return;
  const otherVillages = kingdom.villageIds.filter((id) => id !== villageId).flatMap((id) => {
    const v = getVillage(id);
    return v ? [v] : [];
  });
  if (otherVillages.length === 0) {
    notifyPlayer(player.name, "\xA7cNo other villages in your kingdom.");
    return;
  }
  const form = new ActionFormData().title("Send Resources / Reinforcements").body(`From: \xA7b${village.name}\xA7r
Treasury: ${village.treasury}\u{1F48E}  Food: ${village.foodStorage}\u{1F33E}
Guards: ${village.troops.cityGuards}  Spearmen: ${village.troops.spearmen}
Archers: ${village.troops.archers}  Cavalry: ${village.troops.cavalry}

Select destination:`);
  for (const v of otherVillages) {
    const total = v.troops.cityGuards + v.troops.spearmen + v.troops.archers + v.troops.cavalry;
    form.button(`${v.name} (${total} troops)`);
  }
  const response = await form.show(player);
  if (response.canceled || response.selection === void 0) return;
  await showSendAmountsForm(player, villageId, otherVillages[response.selection].id);
}
async function showSendAmountsForm(player, fromId, toId) {
  const from = getVillage(fromId);
  const to = getVillage(toId);
  if (!from || !to) return;
  const form = new ModalFormData().title(`${from.name} \u2192 ${to.name}`).slider("City Guards", 0, Math.max(from.troops.cityGuards, 1), 1, 0).slider("Spearmen", 0, Math.max(from.troops.spearmen, 1), 1, 0).slider("Archers", 0, Math.max(from.troops.archers, 1), 1, 0).slider("Cavalry", 0, Math.max(from.troops.cavalry, 1), 1, 0).slider("Emeralds", 0, Math.max(from.treasury, 1), 1, 0).slider("Food", 0, Math.max(from.foodStorage, 1), 1, 0);
  const response = await form.show(player);
  if (response.canceled) return;
  const [guards, spearmen, archers, cavalry, emeralds, food] = response.formValues;
  if (guards > 0 || spearmen > 0 || archers > 0 || cavalry > 0) {
    sendReinforcements(fromId, toId, { cityGuards: guards, spearmen, archers, cavalry });
  }
  if (emeralds > 0 || food > 0) {
    sendTradeCart(fromId, toId, {
      emeralds,
      food,
      iron: 0,
      gold: 0,
      coal: 0,
      wood: 0,
      stone: 0,
      diamonds: 0,
      troops: {}
    });
  }
}
async function showRenameForm(player, villageId) {
  const form = new ModalFormData().title("Rename Village").textField("New Name", "Enter new village name...");
  const response = await form.show(player);
  if (response.canceled) return;
  const [newName] = response.formValues;
  if (newName) renameVillage(player.name, villageId, newName);
}
async function showActiveMerchantsMenu(player, village) {
  if (village.activeMerchants.length === 0) {
    notifyPlayer(player.name, "\xA7eNo merchants are visiting \xA7b" + village.name + "\xA7e right now.");
    return;
  }
  const form = new ActionFormData().title(`${village.name} \u2014 Merchants`).body(`Active merchants: ${village.activeMerchants.length}
Select a merchant to trade with:`);
  for (const m of village.activeMerchants) {
    const stockSummary = Object.entries(m.stock).slice(0, 3).map(([k, v]) => `${k.replace("minecraft:", "")}\xD7${v}`).join(", ");
    form.button(`Merchant (${stockSummary})`);
  }
  form.button("Back");
  const response = await form.show(player);
  if (response.canceled || response.selection === void 0) return;
  if (response.selection >= village.activeMerchants.length) return;
  const merchant = village.activeMerchants[response.selection];
  await showMerchantTradeMenu(player, village, merchant, merchant.entityId);
}
async function showMerchantTradeMenu(player, village, merchant, entityId) {
  const stockText = Object.entries(merchant.stock).map(([item, count]) => `${item.replace("minecraft:", "")} \xD7${count}`).join("\n") || "Sold out!";
  const form = new ActionFormData().title("Travelling Merchant").body(`Available:
${stockText}

Village Treasury: ${village.treasury}\u{1F48E}`).button("Buy Iron \xD78 (8\u{1F48E})").button("Buy Gold \xD74 (12\u{1F48E})").button("Buy Diamond \xD71 (8\u{1F48E})").button("Buy Bread \xD716 (16\u{1F48E})").button("Close");
  const response = await form.show(player);
  if (response.canceled) return;
  switch (response.selection) {
    case 0:
      tradeMerchant(village, entityId, "minecraft:iron_ingot", 8);
      break;
    case 1:
      tradeMerchant(village, entityId, "minecraft:gold_ingot", 4);
      break;
    case 2:
      tradeMerchant(village, entityId, "minecraft:diamond", 1);
      break;
    case 3:
      tradeMerchant(village, entityId, "minecraft:bread", 16);
      break;
  }
}
// ── Rail validator — scans a cube around location for any rail block ─────────
function hasNearbyRail(dimension, location, radius) {
  if (radius === void 0) radius = 8;
  const railTypes = new Set([
    "minecraft:rail", "minecraft:powered_rail",
    "minecraft:detector_rail", "minecraft:activator_rail"
  ]);
  const cx = Math.floor(location.x), cy = Math.floor(location.y), cz = Math.floor(location.z);
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dz = -radius; dz <= radius; dz++) {
      for (let dy = -2; dy <= 2; dy++) {
        try {
          const b = dimension.getBlock({ x: cx + dx, y: cy + dy, z: cz + dz });
          if (b && railTypes.has(b.typeId)) return true;
        } catch {}
      }
    }
  }
  return false;
}

// ── Power / leaderboard helpers ───────────────────────────────────────────────
function calcKingdomPower(ownerName) {
  let power = 0;
  for (const v of getAllVillages().filter((v2) => v2.owner === ownerName)) {
    power += 200; // base per village
    power += (v.population ?? 0) * 3;
    power += (v.prosperity ?? 0) * 2;
    power += (v.troops?.cityGuards ?? 0) * 5;
    power += (v.troops?.spearmen ?? 0) * 10;
    power += (v.troops?.archers ?? 0) * 10;
    power += (v.troops?.cavalry ?? 0) * 20;
    power += Math.min(v.treasury ?? 0, 2000);
    power += Math.floor((v.foodStorage ?? 0) * 0.2);
    const armory = v.armoryItems ?? {};
    power += Object.values(armory).reduce((s, n) => s + (n ?? 0), 0) * 2;
    power += (v.tradePoles?.length ?? 0) * 20;
    power += (v.guardPoles?.length ?? 0) * 10;
  }
  return Math.round(power);
}
function buildKingdomLeaderboard() {
  const ownerVillages = new Map();
  for (const v of getAllVillages()) {
    if (!v.owner) continue;
    ownerVillages.set(v.owner, (ownerVillages.get(v.owner) ?? 0) + 1);
  }
  return [...ownerVillages.keys()]
    .map((name) => ({ name, villages: ownerVillages.get(name), power: calcKingdomPower(name) }))
    .sort((a, b) => b.power - a.power)
    .slice(0, 10);
}

async function showTradePoleMenu(player, block) {
  const village = findVillageAt2(block.location);
  if (!village) {
    notifyPlayer(player.name, "\xA7cNo village here. Claim a village first.");
    return;
  }
  const isOwner = village.owner === player.name;
  const poleCount = village.tradePoles?.length ?? 0;
  const spawnDist = TRADE_POLE_DETECT_RADIUS + 3;
  const railsFound = hasNearbyRail(block.dimension, block.location);
  const railStatus = railsFound
    ? "\xA7aRails detected nearby \u2014 cart will be ready to push!"
    : "\xA7c\u26A0 No rails within 8 blocks! Place rails before spawning.";
  const form = new ActionFormData()
    .title(`${village.name} \u2014 Trade Pole`)
    .body(
      `\xA77Village:\xA7f ${village.name}\n\xA77Trade Poles:\xA7f ${poleCount}\n\xA77Detection radius:\xA7f ${TRADE_POLE_DETECT_RADIUS} blocks\n\n` +
      `\xA7fAuto-delivery routing (arriving carts):\n` +
      `\xA7e Emeralds \xA7f\u2192 Treasury\n\xA7e Food \xA7f\u2192 Granary\n\xA7e Troop tokens \xA7f\u2192 Barracks\n\xA7e Resources \xA7f\u2192 Storage\n\n` +
      railStatus + `\n\xA7eCarts spawn ${spawnDist} blocks north \u2014 load then push!`
    );
  if (isOwner) {
    const btnLabel = railsFound
      ? `\xA7a\u{1F682} Spawn Minecart with Chest\n\xA77Spawns ${spawnDist} blocks away \u2014 load then push!`
      : `\xA7e\u{1F682} Spawn Minecart with Chest\n\xA7c\u26A0 No rails detected \u2014 spawn anyway?`;
    form.button(btnLabel);
  }
  form.button("\xA77Close");
  const response = await form.show(player);
  if (response.canceled) return;
  if (!isOwner || response.selection !== 0) return;
  try {
    const poleLoc = block.location;
    const dim = block.dimension;
    const cart = dim.spawnEntity("minecraft:chest_minecart", {
      x: poleLoc.x + 0.5,
      y: poleLoc.y + 1,
      z: poleLoc.z - spawnDist + 0.5
    });
    cart.nameTag = `\xA76\u{1F4E6} ${village.name} \u2014 Load me then push!`;
    const msg = railsFound
      ? `\xA7a\u{1F682} Cart spawned ${spawnDist} blocks north! Load supplies then push toward destination.`
      : `\xA7e\u{1F682} Cart spawned! \xA7cNo rails nearby \u2014 lay track before pushing.`;
    notifyPlayer(player.name, msg);
  } catch {
    notifyPlayer(player.name, "\xA7cCould not spawn minecart \u2014 is the area loaded?");
  }
}

// ── King's Castle menu ────────────────────────────────────────────────────────
async function showKingCastleMenu(player, block) {
  const village = findVillageAt2(block.location);
  const isOwner = village?.owner === player.name;
  const leaderboard = buildKingdomLeaderboard();
  const myRank = leaderboard.findIndex((r) => r.name === player.name);
  const myPower = myRank >= 0 ? leaderboard[myRank].power : calcKingdomPower(player.name);
  const rankText = myRank >= 0
    ? `\xA7eRank #${myRank + 1}\xA7f with \xA7e${myPower.toLocaleString()} power`
    : `\xA77No villages yet \u2014 conquer land to rank up!`;
  const form = new ActionFormData()
    .title("\u{1F451} King\u2019s Castle \u2014 Kingdom Registry")
    .body(
      `\xA76\xA7l${village?.name ?? "The Realm"}\xA7r\u2019s Castle\n\n` +
      `${rankText}\n\n` +
      `\xA77Power is earned from:\n` +
      `\xA77\u2022 Villages owned (200 ea)\n` +
      `\xA77\u2022 Troops (5\u201320 power ea)\n` +
      `\xA77\u2022 Treasury emeralds & food\n` +
      `\xA77\u2022 Population & prosperity\n` +
      `\xA77\u2022 Trade poles & guard poles\n` +
      `\xA77\u2022 Armory equipment\n\n` +
      `\xA7aTip: Place a ladder on the north interior wall to reach the Royal Chambers above.`
    );
  form.button("\xA7e\u{1F4CA} World Kingdom Leaderboard");
  if (isOwner) form.button("\xA7b\u{1F3F0} My Kingdom Overview");
  form.button("\xA77Close");
  const response = await form.show(player);
  if (response.canceled) return;
  if (response.selection === 0) {
    void showLeaderboardMenu(player, leaderboard);
  } else if (isOwner && response.selection === 1) {
    void showKingdomOverviewMenu(player, village, leaderboard);
  }
}

async function showLeaderboardMenu(player, leaderboard) {
  const MEDALS = ["\xA7e\uD83E\uDD47", "\xA77\uD83E\uDD48", "\xA76\uD83E\uDD49", "\xA7f4.", "\xA7f5.", "\xA7f6.", "\xA7f7.", "\xA7f8.", "\xA7f9.", "\xA7f10."];
  let body = "\xA76\xA7l\u2694 World Kingdom Power Rankings \u2694\xA7r\n\xA77Calculated from villages, troops, treasury & more\n\n";
  if (leaderboard.length === 0) {
    body += "\xA7cNo kingdoms registered yet.\nClaim a village to appear on the leaderboard!";
  } else {
    for (let i = 0; i < leaderboard.length; i++) {
      const r = leaderboard[i];
      body += `${MEDALS[i] ?? `\xA7f${i + 1}.`} \xA7f${r.name}\n`;
      body += `\xA77   Power: \xA7e${r.power.toLocaleString()}\xA77 | Villages: \xA7a${r.villages}\n\n`;
    }
  }
  const myRank = leaderboard.findIndex((r) => r.name === player.name);
  if (myRank >= 0) {
    body += `\xA7a\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n`;
    body += `\xA7aYou are ranked \xA7e#${myRank + 1}\xA7a with \xA7e${leaderboard[myRank].power.toLocaleString()} power\xA7a.`;
  } else {
    body += `\xA77You have no villages. Conquer or claim territory to rank up!`;
  }
  const form = new ActionFormData()
    .title("\xA7e\u{1F4CA} Kingdom Leaderboard")
    .body(body)
    .button("\xA77Close");
  await form.show(player);
}

async function showKingdomOverviewMenu(player, village, leaderboard) {
  const myVillages = getAllVillages().filter((v) => v.owner === player.name);
  const myRank = leaderboard.findIndex((r) => r.name === player.name);
  const myPower = myRank >= 0 ? leaderboard[myRank].power : calcKingdomPower(player.name);
  let soldiers = 0, totalTreasury = 0, totalPop = 0, totalProsperity = 0;
  for (const v of myVillages) {
    const t = v.troops ?? {};
    soldiers += (t.cityGuards ?? 0) + (t.spearmen ?? 0) + (t.archers ?? 0) + (t.cavalry ?? 0);
    totalTreasury += v.treasury ?? 0;
    totalPop += v.population ?? 0;
    totalProsperity += v.prosperity ?? 0;
  }
  const avgProsperity = myVillages.length > 0 ? Math.round(totalProsperity / myVillages.length) : 0;
  const body =
    `\xA76\xA7l${player.name}\u2019s Kingdom\xA7r\n\n` +
    `\xA7e\u26A1 Power: \xA7f${myPower.toLocaleString()} \xA77(Rank \xA7e#${myRank >= 0 ? myRank + 1 : "Unranked"}\xA77)\n\n` +
    `\xA77Domains: \xA7f${myVillages.length}\n` +
    `\xA77Population: \xA7f${totalPop}\n` +
    `\xA77Army: \xA7f${soldiers} troops\n` +
    `\xA77Treasury: \xA7f${totalTreasury} \xA77emeralds\n` +
    `\xA77Avg Prosperity: \xA7f${avgProsperity}\n\n` +
    `\xA77Power Breakdown:\n` +
    `\xA77  Villages: \xA7e+${myVillages.length * 200}\n` +
    `\xA77  Population: \xA7e+${totalPop * 3}\n` +
    `\xA77  Treasury: \xA7e+${Math.min(totalTreasury, 2000)}\n` +
    `\xA77  Prosperity: \xA7e+${avgProsperity * 2 * myVillages.length}`;
  const form = new ActionFormData()
    .title(`\u{1F451} Kingdom of ${player.name}`)
    .body(body)
    .button("\xA77Close");
  await form.show(player);
}
async function showTradeStationMenu(player, block) {
  const village = findVillageAt2(block.location);
  if (!village) {
    notifyPlayer(player.name, "\xA7cNo village here. Claim a village first.");
    return;
  }
  const isOwner = village.owner === player.name;
  const summary = getTradeStationSummary(village);
  const poles = village.tradePoles ?? [];
  const poleStatus = poles.length > 0
    ? `\xA7a\u2714 ${poles.length} Trade Pole(s) active \u2014 detect radius: ${TRADE_POLE_DETECT_RADIUS} blocks\n\xA77Place a chest minecart on rails within ${TRADE_POLE_DETECT_RADIUS} blocks of a pole.\n\xA77Poles auto-receive: \xA7aemerald\xA77\u2192treasury, \xA7afood\xA77\u2192granary, \xA7etroop tokens\xA77\u2192barracks.`
    : `\xA7c\u26D4 No Trade Poles placed yet.\n\xA77Place a \xA7bkingdoms:trade_pole\xA77 block near rails to receive incoming minecarts.`;
  const stationLoc = village.tradeStationLocation;
  const stationStr = stationLoc
    ? `\xA77Station at: \xA7f${Math.round(stationLoc.x)},${Math.round(stationLoc.y)},${Math.round(stationLoc.z)}`
    : `\xA7cStation not registered.`;
  const body = [
    summary,
    ``,
    `\xA77\u2500\u2500 Rail Detection \u2500\u2500`,
    poleStatus,
    ``,
    stationStr,
    `\xA77\u2500\u2500 Manual Shipping \u2500\u2500`,
    `\xA7fSpawn a chest minecart \u2192 fill with tokens or goods \u2192 push onto rails toward destination's Trade Pole.`
  ].join("\n");
  const form = new ActionFormData().title(`${village.name} \u2014 Trade Station`).body(body);
  if (isOwner) {
    form
      .button("\u{1F682} Spawn Chest Minecart\n\xA77Spawns at this station for manual shipping")
      .button("\u{1F4E6} Dispatch Resources\n\xA77Send resources to another village via rail")
      .button("\u{1F4CA} Resource Storage")
      .button("\u{1F682} Active Shipments")
      .button("\u{1F4CB} Trade History");
  } else {
    form.button("Close");
  }
  const response = await form.show(player);
  if (response.canceled || !isOwner) return;
  switch (response.selection) {
    case 0: {
      const spawnLoc = village.tradeStationLocation ?? block.location;
      try {
        player.dimension.spawnEntity("minecraft:chest_minecart", {
          x: spawnLoc.x + 0.5,
          y: spawnLoc.y + 0.5,
          z: spawnLoc.z + 0.5
        });
        notifyPlayer(player.name, `\xA7a\u{1F682} Chest minecart spawned at the Trade Station! Fill it with troop tokens or goods, then push it onto rails toward your destination\u2019s Trade Pole.`);
      } catch {
        notifyPlayer(player.name, "\xA7cCould not spawn minecart \u2014 make sure the station chunk is loaded.");
      }
      break;
    }
    case 1:
      await showDispatchResourceMenu(player, village.id);
      break;
    case 2:
      await showResourceStorageMenu(player, village.id);
      break;
    case 3:
      await showActiveShipmentsMenu(player, village.id);
      break;
    case 4:
      await showTradeHistoryMenu(player, village.id);
      break;
  }
}
async function showDispatchResourceMenu(player, fromVillageId) {
  const from = getVillage(fromVillageId);
  if (!from) return;
  ensureResourceStorage(from);
  const rs = from.resourceStorage;
  const connected = getConnectedVillages(from);
  if (connected.length === 0) {
    notifyPlayer(
      player.name,
      `\xA7cNo villages with Trade Stations found. Build Trade Stations in other villages and connect them with rails.`
    );
    return;
  }
  const form = new ActionFormData().title(`${from.name} \u2014 Dispatch Resources`).body(
    `\xA77Select destination village.

\xA7bAvailable:
\xA7f  Food: ${from.foodStorage}\u{1F33E}  Treasury: ${from.treasury}\u{1F48E}
  Iron: ${rs.iron}  Gold: ${rs.gold}  Coal: ${rs.coal}
  Wood: ${rs.wood}  Stone: ${rs.stone}  Diamonds: ${rs.diamonds}`
  );
  for (const v of connected) {
    const stationIcon = v.hasTradeStation ? "\u{1F689}" : "\u26D4";
    form.button(`${stationIcon} ${v.name} (${v.owner})`);
  }
  form.button("Cancel");
  const response = await form.show(player);
  if (response.canceled || response.selection === void 0) return;
  if (response.selection >= connected.length) return;
  const to = connected[response.selection];
  await showResourceAmountsForm(player, fromVillageId, to.id);
}
async function showResourceAmountsForm(player, fromId, toId) {
  const from = getVillage(fromId);
  const to = getVillage(toId);
  if (!from || !to) return;
  ensureResourceStorage(from);
  const rs = from.resourceStorage;
  const form = new ModalFormData().title(`\u{1F4E6} ${from.name} \u2192 ${to.name}`).slider("Food \u{1F33E}", 0, Math.max(from.foodStorage, 1), 1, 0).slider("Emeralds \u{1F48E}", 0, Math.max(from.treasury, 1), 1, 0).slider("Iron", 0, Math.max(rs.iron, 1), 1, 0).slider("Gold", 0, Math.max(rs.gold, 1), 1, 0).slider("Coal", 0, Math.max(rs.coal, 1), 1, 0).slider("Wood", 0, Math.max(rs.wood, 1), 1, 0).slider("Stone", 0, Math.max(rs.stone, 1), 1, 0).slider("Diamonds", 0, Math.max(rs.diamonds, 1), 1, 0);
  const response = await form.show(player);
  if (response.canceled) return;
  const [food, emeralds, iron, gold, coal, wood, stone, diamonds] = response.formValues;
  if (food === 0 && emeralds === 0 && iron === 0 && gold === 0 && coal === 0 && wood === 0 && stone === 0 && diamonds === 0) {
    notifyPlayer(player.name, "\xA7cNo resources selected.");
    return;
  }
  sendRailShipment(fromId, toId, {
    food,
    emeralds,
    iron,
    gold,
    coal,
    wood,
    stone,
    diamonds,
    troops: {}
  });
}
async function showDispatchMilitaryMenu(player, fromVillageId) {
  const from = getVillage(fromVillageId);
  if (!from) return;
  const connected = getConnectedVillages(from);
  if (connected.length === 0) {
    notifyPlayer(
      player.name,
      `\xA7cNo villages with Trade Stations found. Build Trade Stations and connect with rails.`
    );
    return;
  }
  const t = from.troops;
  const form = new ActionFormData().title(`${from.name} \u2014 Dispatch Reinforcements`).body(
    `\xA77Select destination village.

\xA7bAvailable Troops:
\xA7f  Guards: ${t.cityGuards}  Spearmen: ${t.spearmen}
  Archers: ${t.archers}  Cavalry: ${t.cavalry}`
  );
  for (const v of connected) {
    const vt = v.troops;
    const total = vt.cityGuards + vt.spearmen + vt.archers + vt.cavalry;
    form.button(`\u{1F689} ${v.name} (${total} troops)`);
  }
  form.button("Cancel");
  const response = await form.show(player);
  if (response.canceled || response.selection === void 0) return;
  if (response.selection >= connected.length) return;
  const to = connected[response.selection];
  await showMilitaryAmountsForm(player, fromVillageId, to.id);
}
async function showMilitaryAmountsForm(player, fromId, toId) {
  const from = getVillage(fromId);
  const to = getVillage(toId);
  if (!from || !to) return;
  const t = from.troops;
  const form = new ModalFormData().title(`\u{1F5E1} ${from.name} \u2192 ${to.name}`).slider("City Guards", 0, Math.max(t.cityGuards, 1), 1, 0).slider("Spearmen", 0, Math.max(t.spearmen, 1), 1, 0).slider("Archers", 0, Math.max(t.archers, 1), 1, 0).slider("Cavalry", 0, Math.max(t.cavalry, 1), 1, 0);
  const response = await form.show(player);
  if (response.canceled) return;
  const [guards, spearmen, archers, cavalry] = response.formValues;
  if (guards === 0 && spearmen === 0 && archers === 0 && cavalry === 0) {
    notifyPlayer(player.name, "\xA7cNo troops selected.");
    return;
  }
  sendRailShipment(fromId, toId, {
    food: 0,
    emeralds: 0,
    iron: 0,
    gold: 0,
    coal: 0,
    wood: 0,
    stone: 0,
    diamonds: 0,
    troops: { cityGuards: guards, spearmen, archers, cavalry }
  });
}
async function showResourceStorageMenu(player, villageId) {
  const village = getVillage(villageId);
  if (!village) return;
  ensureResourceStorage(village);
  const rs = village.resourceStorage;
  const resourceKeys = Object.keys(RESOURCE_LABELS);
  const storageLines = resourceKeys.map((k) => `  ${RESOURCE_LABELS[k]}: ${rs[k]}`).join("\n");
  const form = new ActionFormData().title(`${village.name} \u2014 Resource Storage`).body(`\xA77Railway deliveries are stored here.

\xA7b\u2500\u2500 Storage \u2500\u2500
\xA7f${storageLines}

\xA77Treasury: \xA76${village.treasury}\u{1F48E}\xA77  Food: \xA7a${village.foodStorage}\u{1F33E}`);
  const depositOptions = [];
  for (const k of resourceKeys) {
    if (rs[k] > 0) {
      depositOptions.push({ key: k, label: RESOURCE_LABELS[k], amount: rs[k] });
      form.button(`Withdraw ${RESOURCE_LABELS[k]} (${rs[k]})`);
    }
  }
  form.button("Close");
  const response = await form.show(player);
  if (response.canceled || response.selection === void 0) return;
  if (response.selection >= depositOptions.length) return;
  const opt = depositOptions[response.selection];
  notifyPlayer(player.name, `\xA7aWithdrew ${opt.amount} ${opt.label} from storage. (Note: use /give for actual items)`);
  rs[opt.key] = 0;
  saveVillage(village);
}
async function showActiveShipmentsMenu(player, villageId) {
  const village = getVillage(villageId);
  if (!village) return;
  const railCarts = village.activeCarts.filter((c) => c.isRailShipment);
  if (railCarts.length === 0) {
    notifyPlayer(player.name, `\xA7eNo active rail shipments from \xA7b${village.name}\xA7e.`);
    return;
  }
  const lines = railCarts.map((c, i) => {
    const dest = getVillage(c.destinationVillageId);
    const type = c.isMilitary ? "\u{1F5E1}" : "\u{1F4E6}";
    const cargo = [
      c.cargo.food > 0 ? `${c.cargo.food}\u{1F33E}` : "",
      c.cargo.emeralds > 0 ? `${c.cargo.emeralds}\u{1F48E}` : "",
      c.cargo.iron > 0 ? `${c.cargo.iron}Fe` : "",
      c.cargo.gold > 0 ? `${c.cargo.gold}Au` : ""
    ].filter(Boolean).join(" ");
    return `${type} #${i + 1} \u2192 ${dest?.name ?? "Unknown"}: ${cargo || "Troops"}`;
  }).join("\n");
  const form = new ActionFormData().title(`${village.name} \u2014 Active Shipments`).body(`\xA7b${railCarts.length} rail shipment(s) in transit:

\xA7f${lines}

\xA77Shipments travel physically. If destroyed, cargo is lost.`).button("Close");
  await form.show(player);
}
async function showTradeHistoryMenu(player, villageId) {
  const village = getVillage(villageId);
  if (!village) return;
  const history = village.tradeHistory ?? [];
  if (history.length === 0) {
    const form2 = new ActionFormData().title(`${village.name} \u2014 Trade History`).body("\xA77No trade deliveries recorded yet.\n\nPush a chest minecart to this trade station to log an arrival.").button("Close");
    await form2.show(player);
    return;
  }
  const now = Date.now();
  const lines = history.map((entry, i) => {
    const icon = entry.isManual ? "\u{1F682}" : "\u{1F4E6}";
    const minsAgo = Math.round((now - entry.timestamp) / 6e4);
    const timeLabel = minsAgo < 1 ? "just now" : minsAgo < 60 ? `${minsAgo}m ago` : `${Math.floor(minsAgo / 60)}h ${minsAgo % 60}m ago`;
    const label = i === 0 ? " \xA7a(latest)" : "";
    return `\xA7e${icon} #${i + 1}${label}
\xA77From: \xA7f${entry.fromVillageName}
\xA77Cargo: \xA7f${entry.summary}
\xA78${timeLabel}`;
  });
  const form = new ActionFormData().title(`${village.name} \u2014 Trade History`).body(`\xA7bLast ${history.length} arrival(s):

` + lines.join("\n\n")).button("Close");
  await form.show(player);
}

// ===== Black Wool War Declaration =====
function hasWoolWarLine(loc, dim) {
  const checks = [
    [{dx:1,dz:0},{dx:2,dz:0}],
    [{dx:-1,dz:0},{dx:-2,dz:0}],
    [{dx:0,dz:1},{dx:0,dz:2}],
    [{dx:0,dz:-1},{dx:0,dz:-2}],
    [{dx:-1,dz:0},{dx:1,dz:0}],
    [{dx:0,dz:-1},{dx:0,dz:1}],
  ];
  for (const [d1, d2] of checks) {
    try {
      const b1 = dim.getBlock({x:loc.x+d1.dx, y:loc.y, z:loc.z+d1.dz});
      const b2 = dim.getBlock({x:loc.x+d2.dx, y:loc.y, z:loc.z+d2.dz});
      if (b1?.typeId === "minecraft:black_wool" && b2?.typeId === "minecraft:black_wool") return true;
    } catch {}
  }
  return false;
}
async function triggerWoolWarDeclaration(player, village) {
  const myKingdom = getKingdomOf(player.name);
  const enemyKingdom = getKingdom(village.kingdomId);
  if (!myKingdom || !enemyKingdom) return;
  if (myKingdom.id === enemyKingdom.id) return;
  if (areAtWar(myKingdom.id, enemyKingdom.id)) {
    notifyPlayer(player.name, `\xA7c\u2694 Already at war with ${enemyKingdom.name}.`);
    return;
  }
  const form = new MessageFormData()
    .title("\u2694 War Declaration")
    .body(
      `You have placed 3 black wool in ${village.name}'s territory!\n\n` +
      `\xA7cDeclare WAR on kingdom "\xA7b${enemyKingdom.name}\xA7c" (owner: ${village.owner})?\n\n` +
      `\xA77This cannot be undone without a peace treaty.`
    )
    .button1("\u2694 Declare War!")
    .button2("Cancel");
  const response = await form.show(player);
  if (response.canceled) return;
  if (response.selection === 0) {
    declareWar(myKingdom.id, enemyKingdom.id);
    for (const p of world16.getPlayers()) {
      notifyPlayer(
        p.name,
        `\xA7c\u2694 WAR DECLARED! \xA7f${player.name} \xA77(${myKingdom.name}) \xA7chas declared war on \xA7b${enemyKingdom.name}\xA7c by placing black wool in their territory!`
      );
    }
  } else {
    notifyPlayer(player.name, "\xA77War declaration cancelled.");
  }
}

// ===== Strategic Formation Map =====
var STRAT_GRID = [
  {id:1,  angle:0,   dist:10, label:"N  \xb710"},
  {id:2,  angle:45,  dist:10, label:"NE \xb710"},
  {id:3,  angle:90,  dist:10, label:"E  \xb710"},
  {id:4,  angle:135, dist:10, label:"SE \xb710"},
  {id:5,  angle:180, dist:10, label:"S  \xb710"},
  {id:6,  angle:225, dist:10, label:"SW \xb710"},
  {id:7,  angle:270, dist:10, label:"W  \xb710"},
  {id:8,  angle:315, dist:10, label:"NW \xb710"},
  {id:9,  angle:0,   dist:22, label:"N  \xb722"},
  {id:10, angle:45,  dist:22, label:"NE \xb722"},
  {id:11, angle:90,  dist:22, label:"E  \xb722"},
  {id:12, angle:135, dist:22, label:"SE \xb722"},
  {id:13, angle:180, dist:22, label:"S  \xb722"},
  {id:14, angle:225, dist:22, label:"SW \xb722"},
  {id:15, angle:270, dist:22, label:"W  \xb722"},
  {id:16, angle:315, dist:22, label:"NW \xb722"},
];
var STRAT_MIN_TOWNHALL_DIST = 15;
var STRAT_LEASH_DIST = 30;
var stratFormations = new Map();
var stratMarkerEntities = new Map();
var STRAT_TROOP_LABELS = {
  cityGuards:   "City Guards",
  spearmen:     "Spearmen",
  archers:      "Archers",
  cavalry:      "Cavalry",
  samurai:      "Samurai",
  heavyKnights: "Heavy Knights"
};
var STRAT_TROOP_KEYS = ["cityGuards","spearmen","archers","cavalry","samurai","heavyKnights"];
var STRAT_TOKEN_IDS  = {
  cityGuards:   "kingdoms:guard_token",
  spearmen:     "kingdoms:spearman_token",
  archers:      "kingdoms:archer_token",
  cavalry:      "kingdoms:cavalry_token",
  samurai:      "kingdoms:samurai_token",
  heavyKnights: "kingdoms:heavy_knight_token"
};
var STRAT_ENTITY_MAP = {
  cityGuards:   "kingdoms:city_guard",
  spearmen:     "kingdoms:spearman",
  archers:      "kingdoms:archer",
  cavalry:      "kingdoms:cavalry",
  samurai:      "kingdoms:samurai",
  heavyKnights: "kingdoms:heavy_knight"
};
function countInventoryTokens(player) {
  const inv = player.getComponent(EntityInventoryComponent8.componentId);
  const result = {cityGuards:0, spearmen:0, archers:0, cavalry:0};
  if (!inv?.container) return result;
  const c = inv.container;
  for (let i = 0; i < c.size; i++) {
    const slot = c.getItem(i);
    if (!slot) continue;
    const info = TROOP_TOKEN_MAP[slot.typeId];
    if (info) result[info.troopType] += slot.amount;
  }
  return result;
}
function consumeInventoryTokens(player, toConsume) {
  const inv = player.getComponent(EntityInventoryComponent8.componentId);
  if (!inv?.container) return;
  const c = inv.container;
  for (const key of STRAT_TROOP_KEYS) {
    let need = toConsume[key] ?? 0;
    if (need <= 0) continue;
    const tid = STRAT_TOKEN_IDS[key];
    for (let i = 0; i < c.size && need > 0; i++) {
      const slot = c.getItem(i);
      if (!slot || slot.typeId !== tid) continue;
      const take = Math.min(slot.amount, need);
      need -= take;
      if (slot.amount - take <= 0) { c.setItem(i, void 0); }
      else { slot.amount -= take; c.setItem(i, slot); }
    }
  }
}
function getGridWorldPos(center, gp) {
  const rad = (gp.angle * Math.PI) / 180;
  return {
    x: center.x + Math.sin(rad) * gp.dist,
    y: center.y + 1,
    z: center.z - Math.cos(rad) * gp.dist
  };
}
function spawnStratMarkers(player, center, targetVillage) {
  const markers = [];
  try {
    const dim = player.dimension;
    for (const gp of STRAT_GRID) {
      try {
        const pos = getGridWorldPos(center, gp);
        const e = dim.spawnEntity("minecraft:armor_stand", pos);
        const blocked = !!targetVillage && gp.dist < STRAT_MIN_TOWNHALL_DIST;
        e.nameTag = blocked
          ? `\xA7c[${gp.id}] ${gp.label} BLOCKED`
          : `\xA7e[${gp.id}]\xA7f ${gp.label}`;
        e.setDynamicProperty("kc:strat_marker", "1");
        markers.push(e);
      } catch {}
    }
  } catch {}
  stratMarkerEntities.set(player.name, markers);
}
function clearStratMarkers(player) {
  const markers = stratMarkerEntities.get(player.name) ?? [];
  for (const e of markers) { try { e.remove(); } catch {} }
  stratMarkerEntities.delete(player.name);
}
async function cmdStratMap(player) {
  const loc = player.location;
  let targetVillage = null;
  let minDist = 150;
  for (const v of getAllVillages()) {
    if (v.owner === player.name) continue;
    const d = Math.hypot(v.townHallLocation.x - loc.x, v.townHallLocation.z - loc.z);
    if (d < minDist) { targetVillage = v; minDist = d; }
  }
  const center = targetVillage
    ? {x: targetVillage.townHallLocation.x, y: targetVillage.townHallLocation.y, z: targetVillage.townHallLocation.z}
    : {x: Math.floor(loc.x), y: Math.floor(loc.y), z: Math.floor(loc.z)};
  try {
    player.camera.setCamera("minecraft:free", {
      location: {x: center.x + 0.5, y: center.y + 45, z: center.z + 0.5},
      rotation:  {x: 90, y: 0}
    });
  } catch {}
  spawnStratMarkers(player, center, targetVillage);
  await stratMapMainMenu(player, center, targetVillage);
  clearStratMarkers(player);
  try { player.camera.clear(); } catch {}
}
async function stratMapMainMenu(player, center, targetVillage) {
  const isMobMode = !targetVillage;
  const tt = countInventoryTokens(player);
  const totalAvail = STRAT_TROOP_KEYS.reduce((s, k) => s + tt[k], 0);
  const preset = stratFormations.get(player.name);
  const placedTotal = preset ? preset.positions.reduce((s, p) => s + p.count, 0) : 0;

  let presetStr = "\xA77No formation planned yet.";
  if (preset && preset.positions.length > 0) {
    presetStr = "\xA7aSaved formation:\n" + preset.positions.map((p) => {
      const gp = STRAT_GRID.find((g) => g.id === p.gridId);
      return `  \xA7f${p.count}x ${STRAT_TROOP_LABELS[p.troopType]} \xA77@ pos ${p.gridId} (${gp?.label ?? "?"})`;
    }).join("\n");
    if (preset.savedAt) {
      presetStr += `\n\xA7e\u26A0 Stay within ${STRAT_LEASH_DIST} blocks of save point or formation resets!`;
    }
  }

  const modeHeader = isMobMode
    ? `\xA76[Anti-Mob] No player village in 150 blocks.\n\xA77Troops will engage nearby zombies, pillagers & hostiles.`
    : `\xA7cTarget: \xA7f${targetVillage.name} \xA77(${targetVillage.owner})\n\xA7cPos 1-8 (inner ring) blocked \u2014 too close to townhall.`;

  const body = [
    modeHeader,
    `\xA7eInventory tokens: \xA7fG:${tt.cityGuards}  Sp:${tt.spearmen}  Ar:${tt.archers}  Ca:${tt.cavalry} \xA77(${totalAvail})`,
    `\xA77Planned: ${placedTotal}  Remaining: ${totalAvail - placedTotal}`,
    "\xA77Get tokens from Barracks \u2192 'Get Formation Set x10'.",
    "",
    presetStr
  ].join("\n");

  const deployLabel = isMobMode
    ? "\xA76[Anti-Mob] Deploy Formation"
    : "\xA7c\u2694 Execute Raid";

  const form = new ActionFormData()
    .title("\xA76[Strategic Map]" + (isMobMode ? " Anti-Mob" : ` \u2014 ${targetVillage.name}`))
    .body(body)
    .button("\u2795 Plan Troop Position")
    .button("[Clear] Formation")
    .button("[Set] Lock Formation & Hold")
    .button(deployLabel)
    .button("[X] Close Map");

  const response = await form.show(player);
  if (response.canceled || response.selection === 4) return;

  switch (response.selection) {
    case 0:
      await stratAddTroopForm(player, center, targetVillage, tt, totalAvail);
      await stratMapMainMenu(player, center, targetVillage);
      break;
    case 1:
      stratFormations.delete(player.name);
      notifyPlayer(player.name, "\xA77Formation cleared.");
      await stratMapMainMenu(player, center, targetVillage);
      break;
    case 2: {
      const p2 = stratFormations.get(player.name);
      if (!p2 || p2.positions.length === 0) {
        notifyPlayer(player.name, "\xA7cNo positions planned. Add troops first.");
        await stratMapMainMenu(player, center, targetVillage);
      } else {
        p2.targetVillageId = targetVillage?.id ?? null;
        p2.center = center;
        p2.savedAt = {x: player.location.x, y: player.location.y, z: player.location.z};
        stratFormations.set(player.name, p2);
        notifyPlayer(
          player.name,
          `\xA7a[Set] Formation locked (${p2.positions.length} pos). \xA7eDo NOT move more than ${STRAT_LEASH_DIST} blocks! Open Strategic Map then Deploy.`
        );
      }
      break;
    }
    case 3:
      await executeStratRaid(player, center, targetVillage, isMobMode);
      break;
  }
}
async function stratAddTroopForm(player, center, targetVillage, tt, totalAvail) {
  const preset = stratFormations.get(player.name) ?? {positions:[]};
  const placedTotal = preset.positions.reduce((s, p) => s + p.count, 0);
  const remaining = totalAvail - placedTotal;
  if (remaining <= 0) {
    notifyPlayer(player.name, `\xA7cAll ${totalAvail} tokens are planned. Clear some positions first.`);
    return;
  }
  // When targeting a village, block inner ring (< STRAT_MIN_TOWNHALL_DIST)
  const availGrid = STRAT_GRID.filter((g) => !targetVillage || g.dist >= STRAT_MIN_TOWNHALL_DIST);
  if (availGrid.length === 0) {
    notifyPlayer(player.name, "\xA7cNo valid grid positions available.");
    return;
  }
  const troopOpts = STRAT_TROOP_KEYS.map((k) => `${STRAT_TROOP_LABELS[k]} (${tt[k]} tokens)`);
  const posOpts   = availGrid.map((g) => {
    const placed = preset.positions.find((p) => p.gridId === g.id);
    return placed
      ? `[${g.id}] ${g.label} \u2014 ${placed.count}x ${STRAT_TROOP_LABELS[placed.troopType]}`
      : `[${g.id}] ${g.label} (empty)`;
  });
  const form = new ModalFormData()
    .title("Plan Troops on Map")
    .dropdown("Troop Type", troopOpts, 0)
    .dropdown("Grid Position (watch markers in world)", posOpts, 0)
    .slider("Count", 1, Math.max(1, remaining), 1, 1);
  const response = await form.show(player);
  if (response.canceled) return;
  const [typeIdx, posIdx, count] = response.formValues;
  const troopType = STRAT_TROOP_KEYS[typeIdx];
  const gridId    = availGrid[posIdx].id;
  const alreadyOfType = preset.positions
    .filter((p) => p.troopType === troopType)
    .reduce((s, p) => s + p.count, 0);
  const availOfType = tt[troopType] - alreadyOfType;
  if (count > availOfType) {
    notifyPlayer(player.name, `\xA7cNot enough ${STRAT_TROOP_LABELS[troopType]} tokens. Only ${availOfType} available.`);
    return;
  }
  const existIdx = preset.positions.findIndex((p) => p.gridId === gridId);
  if (existIdx >= 0) {
    preset.positions[existIdx] = {gridId, troopType, count};
  } else {
    preset.positions.push({gridId, troopType, count});
  }
  stratFormations.set(player.name, preset);
  const markers = stratMarkerEntities.get(player.name) ?? [];
  const fullGridIdx = STRAT_GRID.findIndex((g) => g.id === gridId);
  if (markers[fullGridIdx]) {
    try { markers[fullGridIdx].nameTag = `\xA7a[${gridId}]\xA7f ${count}x ${STRAT_TROOP_LABELS[troopType]}`; } catch {}
  }
  notifyPlayer(player.name, `\xA7a[OK] ${count}x ${STRAT_TROOP_LABELS[troopType]} planned at pos ${gridId} (${availGrid[posIdx].label}).`);
}
async function executeStratRaid(player, center, targetVillage, isMobMode) {
  const preset = stratFormations.get(player.name);
  if (!preset || preset.positions.length === 0) {
    notifyPlayer(player.name, "\xA7cNo formation set. Plan positions then press [Set] Formation.");
    return;
  }
  // 30-block leash check
  if (preset.savedAt) {
    const dist = Math.hypot(player.location.x - preset.savedAt.x, player.location.z - preset.savedAt.z);
    if (dist > STRAT_LEASH_DIST) {
      stratFormations.delete(player.name);
      notifyPlayer(player.name, `\xA7c[!] Formation RESET \u2014 moved more than ${STRAT_LEASH_DIST} blocks from save point.`);
      return;
    }
  }
  // Village raid requires war declaration
  if (!isMobMode && targetVillage) {
    const myKingdom = getKingdomOf(player.name);
    if (!myKingdom || !areAtWar(myKingdom.id, targetVillage.kingdomId)) {
      notifyPlayer(player.name, `\xA7cDeclare war on \xA7b${targetVillage.owner}\xA7c's kingdom first (place 3 black wool or /scriptevent kc:war).`);
      return;
    }
  }
  // Validate inventory tokens
  const toConsume = {cityGuards:0, spearmen:0, archers:0, cavalry:0};
  for (const pl of preset.positions) toConsume[pl.troopType] = (toConsume[pl.troopType] ?? 0) + pl.count;
  const held = countInventoryTokens(player);
  for (const key of STRAT_TROOP_KEYS) {
    if ((toConsume[key] ?? 0) > held[key]) {
      notifyPlayer(player.name, `\xA7cNot enough ${STRAT_TROOP_LABELS[key]} tokens! Need ${toConsume[key]}, have ${held[key]}.`);
      return;
    }
  }
  // Consume tokens from inventory
  consumeInventoryTokens(player, toConsume);
  // Deploy entities at formation positions
  const dim = player.dimension;
  let totalDeployed = 0;
  for (const placement of preset.positions) {
    const gp = STRAT_GRID.find((g) => g.id === placement.gridId);
    if (!gp) continue;
    const worldPos = getGridWorldPos(center, gp);
    const entityType = STRAT_ENTITY_MAP[placement.troopType];
    if (!entityType) continue;
    for (let i = 0; i < placement.count; i++) {
      try {
        const e = dim.spawnEntity(entityType, {
          x: worldPos.x + (Math.random() - 0.5) * 4,
          y: worldPos.y,
          z: worldPos.z + (Math.random() - 0.5) * 4
        });
        e.nameTag = isMobMode
          ? `\xA76[${player.name}] Anti-Mob`
          : `\xA7c\u2694 [${player.name} \u2192 ${targetVillage?.name}]`;
        e.setDynamicProperty("kc:strat_raid_owner", player.name);
        e.setDynamicProperty("kc:strat_mob_mode", isMobMode ? "1" : "0");
        totalDeployed++;
      } catch {}
    }
  }
  stratFormations.delete(player.name);
  if (isMobMode) {
    notifyPlayer(player.name, `\xA76[Anti-Mob] ${totalDeployed} troop(s) deployed, engaging nearby hostiles.`);
  } else {
    notifyPlayer(player.name, `\xA7c\u2694 RAID LAUNCHED! ${totalDeployed} troop(s) in formation at \xA7b${targetVillage?.name}\xA7c!`);
    if (targetVillage) notifyPlayer(targetVillage.owner, `\xA7c\u2694 TACTICAL RAID! ${player.name} launched a formation attack on \xA7b${targetVillage.name}\xA7c!`);
  }
}

// Tick watcher: reset formation if player moves 30+ blocks from saved position
system3.runInterval(() => {
  const _onlinePlayers = new Set(world16.getPlayers().map((pl) => pl.name));
  for (const [playerName, preset] of stratFormations) {
    if (!_onlinePlayers.has(playerName)) {
      stratFormations.delete(playerName);
      for (const [eid] of stratMarkerEntities) {
        if (eid.startsWith(playerName + ":")) stratMarkerEntities.delete(eid);
      }
      continue;
    }
    if (!preset.savedAt) continue;
    const p = world16.getPlayers().find((pl) => pl.name === playerName);
    if (!p) continue;
    const dist = Math.hypot(p.location.x - preset.savedAt.x, p.location.z - preset.savedAt.z);
    if (dist > STRAT_LEASH_DIST) {
      stratFormations.delete(playerName);
      notifyPlayer(playerName, `\xA7c[!] Formation RESET \u2014 moved more than ${STRAT_LEASH_DIST} blocks from save point.`);
    }
  }
}, 40);

// Barracks: Get Formation Set (1 set = 10 soldiers as tokens)
async function showGetFormationSetForm(player, village) {
  const t = village.troops;
  const maxSetsPerType = STRAT_TROOP_KEYS.map((k) => Math.floor(t[k] / 10));
  const maxSets = Math.max(...maxSetsPerType);
  if (maxSets === 0) {
    notifyPlayer(player.name, "\xA7cNeed at least 10 troops of one type in barracks to get a Formation Set (1 set = 10 soldiers).");
    return;
  }
  const troopOpts = STRAT_TROOP_KEYS.map((k, i) => `${STRAT_TROOP_LABELS[k]} (${maxSetsPerType[i]} sets avail, ${t[k]} stored)`);
  const form = new ModalFormData()
    .title("Get Formation Set (x10)")
    .dropdown("Troop type", troopOpts, 0)
    .slider("Sets to withdraw (1 set = 10 soldiers)", 1, Math.max(1, maxSets), 1, 1);
  const response = await form.show(player);
  if (response.canceled) return;
  const [typeIdx, sets] = response.formValues;
  const troopType = STRAT_TROOP_KEYS[typeIdx];
  const needed = sets * 10;
  if (needed > village.troops[troopType]) {
    notifyPlayer(player.name, `\xA7cNot enough ${STRAT_TROOP_LABELS[troopType]}. Need ${needed}, have ${village.troops[troopType]}.`);
    return;
  }
  const tokenId = STRAT_TOKEN_IDS[troopType];
  const inv = player.getComponent(EntityInventoryComponent8.componentId);
  if (!inv?.container) { notifyPlayer(player.name, "\xA7cInventory unavailable."); return; }
  const container = inv.container;
  let leftToGive = needed;
  for (let i = 0; i < container.size && leftToGive > 0; i++) {
    const slot = container.getItem(i);
    if (!slot) {
      const give = Math.min(leftToGive, 64);
      try { container.setItem(i, new ItemStack2(tokenId, give)); leftToGive -= give; } catch {}
    } else if (slot.typeId === tokenId && slot.amount < 64) {
      const give = Math.min(leftToGive, 64 - slot.amount);
      slot.amount += give;
      container.setItem(i, slot);
      leftToGive -= give;
    }
  }
  const actualGiven = needed - leftToGive;
  village.troops[troopType] -= actualGiven;
  saveVillage(village);
  if (leftToGive > 0) {
    notifyPlayer(player.name, `\xA7eInventory full! Gave ${actualGiven} tokens. Free up space and try again for the rest.`);
  } else {
    notifyPlayer(player.name, `\xA7a[OK] Got ${sets} set(s) = ${needed} ${STRAT_TROOP_LABELS[troopType]} tokens. Use /scriptevent kc:stratmap to deploy!`);
  }
}
