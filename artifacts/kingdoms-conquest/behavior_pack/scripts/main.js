// src/main.ts
import { world as world12, system } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";

// src/utils/tick.ts
import { world } from "@minecraft/server";

// src/types/index.ts
var WEAPON_TIERS = ["wood", "stone", "iron", "gold", "diamond", "netherite"];
var ARMOR_TIERS = ["leather", "iron", "gold", "diamond", "netherite"];
var TROOP_WAGES = {
  cityGuards: 1,
  spearmen: 2,
  archers: 2,
  cavalry: 3
};
var TICKS_PER_DAY = 24e3;
var CLAIM_COST_EMERALDS = 10;
var VILLAGE_CLAIM_RADIUS = 64;
var MIN_VILLAGERS_TO_CLAIM = 3;
var FOOD_PER_VILLAGER_PER_DAY = 1;
var FOOD_PER_SOLDIER_PER_DAY = 2;
var POPULATION_GROWTH_INTERVAL_DAYS = 2;
var WAGE_INTERVAL_DAYS = 3;
var WATCHTOWER_DETECTION_RADIUS = 48;
var MERCHANT_SPAWN_RADIUS = 8;
var BANDIT_MIGRATE_DISTANCE = 200;

// src/utils/tick.ts
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
function moveToward(from, to, speed) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dz = to.z - from.z;
  const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
  if (dist <= speed) return { ...to };
  const ratio = speed / dist;
  return {
    x: from.x + dx * ratio,
    y: from.y + dy * ratio,
    z: from.z + dz * ratio
  };
}

// src/utils/notify.ts
import { world as world2 } from "@minecraft/server";
function notifyPlayer(playerName, message) {
  const player = world2.getPlayers().find((p) => p.name === playerName);
  if (player) {
    player.sendMessage(`\xA76[Kingdoms]\xA7r ${message}`);
  }
}
function notifyKingdom(kingName, villageOwners, message) {
  const players = world2.getPlayers();
  const recipients = /* @__PURE__ */ new Set([kingName, ...villageOwners]);
  for (const player of players) {
    if (recipients.has(player.name)) {
      player.sendMessage(`\xA7d[Kingdom]\xA7r ${message}`);
    }
  }
}

// src/storage/index.ts
import { world as world3 } from "@minecraft/server";
var REGISTRY_KEY = "kc:registry";
var VILLAGE_PREFIX = "kc:village:";
var KINGDOM_PREFIX = "kc:kingdom:";
var BANDIT_PREFIX = "kc:bandit:";
function getRegistry() {
  const raw = world3.getDynamicProperty(REGISTRY_KEY);
  if (!raw) return { villageIds: [], kingdomIds: [], banditCampIds: [] };
  try {
    return JSON.parse(raw);
  } catch {
    return { villageIds: [], kingdomIds: [], banditCampIds: [] };
  }
}
function saveRegistry(data) {
  world3.setDynamicProperty(REGISTRY_KEY, JSON.stringify(data));
}
function getVillage(id) {
  const raw = world3.getDynamicProperty(VILLAGE_PREFIX + id);
  if (!raw) return void 0;
  try {
    return JSON.parse(raw);
  } catch {
    return void 0;
  }
}
function saveVillage(data) {
  world3.setDynamicProperty(VILLAGE_PREFIX + data.id, JSON.stringify(data));
  const reg = getRegistry();
  if (!reg.villageIds.includes(data.id)) {
    reg.villageIds.push(data.id);
    saveRegistry(reg);
  }
}
function getAllVillages() {
  const reg = getRegistry();
  return reg.villageIds.flatMap((id) => {
    const v = getVillage(id);
    return v ? [v] : [];
  });
}
function getKingdom(id) {
  const raw = world3.getDynamicProperty(KINGDOM_PREFIX + id);
  if (!raw) return void 0;
  try {
    return JSON.parse(raw);
  } catch {
    return void 0;
  }
}
function saveKingdom(data) {
  world3.setDynamicProperty(KINGDOM_PREFIX + data.id, JSON.stringify(data));
  const reg = getRegistry();
  if (!reg.kingdomIds.includes(data.id)) {
    reg.kingdomIds.push(data.id);
    saveRegistry(reg);
  }
}
function deleteKingdom(id) {
  world3.setDynamicProperty(KINGDOM_PREFIX + id, void 0);
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
  const raw = world3.getDynamicProperty(BANDIT_PREFIX + id);
  if (!raw) return void 0;
  try {
    return JSON.parse(raw);
  } catch {
    return void 0;
  }
}
function saveBanditCamp(data) {
  world3.setDynamicProperty(BANDIT_PREFIX + data.id, JSON.stringify(data));
  const reg = getRegistry();
  if (!reg.banditCampIds.includes(data.id)) {
    reg.banditCampIds.push(data.id);
    saveRegistry(reg);
  }
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

// src/systems/village.ts
import { world as world4, EntityInventoryComponent } from "@minecraft/server";

// src/systems/kingdom.ts
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
  const inv = player.getComponent(EntityInventoryComponent.componentId);
  if (!inv) return false;
  const container = inv.container;
  if (!container) return false;
  let emeraldsFound = 0;
  const slotsToConsume = [];
  for (let i = 0; i < container.size; i++) {
    const item = container.getItem(i);
    if (item && item.typeId === "minecraft:emerald") {
      const needed = CLAIM_COST_EMERALDS - emeraldsFound;
      const take = Math.min(needed, item.amount);
      slotsToConsume.push({ slot: i, amount: take });
      emeraldsFound += take;
      if (emeraldsFound >= CLAIM_COST_EMERALDS) break;
    }
  }
  if (emeraldsFound < CLAIM_COST_EMERALDS) {
    notifyPlayer(player.name, `\xA7cNeed ${CLAIM_COST_EMERALDS} emeralds to claim a village.`);
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
    troops: { cityGuards: 0, spearmen: 0, archers: 0, cavalry: 0 },
    missedWages: 0,
    lastDayProcessed: getCurrentDay(),
    lastWageDay: getCurrentDay(),
    foodShortageStage: 0,
    guardPoles: [],
    tradePoles: [],
    workers: { farmers: Math.max(1, Math.floor(villagers.length * 0.5)), workers: 0 },
    blacksmith: { weaponTier: 0, armorTier: 0 },
    activeMerchants: [],
    activeCarts: []
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
  const totalSoldiers = t.cityGuards + t.spearmen + t.archers + t.cavalry;
  const stages = ["\u2714 None", "\u26A0 Stage 1", "\u26A0 Stage 2", "\xA7c Stage 3", "\xA7c Stage 4"];
  return [
    `\xA7b${village.name}\xA7r (${village.owner})`,
    `Pop: ${village.population}/${village.housingCapacity}  Prosperity: ${village.prosperity}`,
    `Treasury: ${village.treasury}\u{1F48E}  Food: ${village.foodStorage}\u{1F33E}`,
    `Market Lv${village.marketLevel}  Barracks Lv${village.barracksLevel}`,
    `Troops: ${totalSoldiers} (G:${t.cityGuards} Sp:${t.spearmen} Ar:${t.archers} Ca:${t.cavalry})`,
    `Food Shortage: ${stages[village.foodShortageStage] ?? "Unknown"}`,
    `Weapon Tier: ${village.blacksmith.weaponTier}  Armor Tier: ${village.blacksmith.armorTier}`
  ].join("\n");
}
function updateHousingCapacity(villageId) {
  const village = getVillage(villageId);
  if (!village) return;
  const dim = world4.getDimension(village.location.dimension);
  const loc = village.townHallLocation;
  let beds = 0;
  for (let dx = -VILLAGE_CLAIM_RADIUS; dx <= VILLAGE_CLAIM_RADIUS; dx += 4) {
    for (let dz = -VILLAGE_CLAIM_RADIUS; dz <= VILLAGE_CLAIM_RADIUS; dz += 4) {
      try {
        const block = dim.getBlock({ x: loc.x + dx, y: loc.y, z: loc.z + dz });
        if (block && block.typeId.includes("bed")) beds++;
      } catch {
      }
    }
  }
  village.housingCapacity = Math.max(beds, village.population);
  saveVillage(village);
}
function getKingdomOf2(playerName) {
  return getAllKingdoms().find((k) => k.king === playerName);
}

// src/systems/food.ts
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

// src/systems/bandit.ts
import { world as world5 } from "@minecraft/server";
function spawnBanditDeserters(village, count) {
  const loc = village.location;
  const migrateAngle = Math.random() * Math.PI * 2;
  const campX = loc.x + Math.cos(migrateAngle) * BANDIT_MIGRATE_DISTANCE;
  const campZ = loc.z + Math.sin(migrateAngle) * BANDIT_MIGRATE_DISTANCE;
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
    spawnBanditEntities(nearestCamp, count);
  } else {
    const camp = {
      id: generateId(),
      location: { x: campX, y: loc.y, z: campZ, dimension: loc.dimension },
      strength: count,
      originKingdomId: village.kingdomId,
      entityIds: []
    };
    saveBanditCamp(camp);
    spawnBanditEntities(camp, count);
  }
}
function spawnBanditEntities(camp, count) {
  const dim = world5.getDimension(camp.location.dimension);
  for (let i = 0; i < Math.min(count, 5); i++) {
    try {
      const entity = dim.spawnEntity("kingdoms:bandit", {
        x: camp.location.x + (Math.random() * 10 - 5),
        y: camp.location.y,
        z: camp.location.z + (Math.random() * 10 - 5)
      });
      entity.setDynamicProperty("kc:camp_id", camp.id);
      camp.entityIds.push(entity.id);
    } catch {
    }
  }
  saveBanditCamp(camp);
}
function tickBandits() {
  for (const camp of getAllBanditCamps()) {
    if (Math.random() < 0.3) {
      raidNearbyTargets(camp);
    }
  }
}
function raidNearbyTargets(camp) {
  const villages = getAllVillages();
  let target;
  let targetDist = 300;
  for (const village of villages) {
    if (village.location.dimension !== camp.location.dimension) continue;
    const d = distance(village.location, camp.location);
    if (d < targetDist) {
      const strength = getTotalVillageDefense(village);
      if (camp.strength > strength * 0.5 || d < 80) {
        targetDist = d;
        target = village;
      }
    }
  }
  if (!target) return;
  const dim = world5.getDimension(camp.location.dimension);
  const merchants = dim.getEntities({ type: "kingdoms:merchant" });
  for (const merchant of merchants) {
    const d = distance(merchant.location, camp.location);
    if (d < 120) {
      notifyPlayer(target.owner, `\xA7c\u2694 A merchant near \xA7b${target.name}\xA7c is under bandit attack!`);
      merchant.applyDamage(10);
      break;
    }
  }
  const carts = dim.getEntities({ type: "kingdoms:trade_cart" });
  for (const cart of carts) {
    const d = distance(cart.location, camp.location);
    if (d < 120) {
      notifyPlayer(target.owner, `\xA7c\u2694 A supply cart near \xA7b${target.name}\xA7c is under bandit attack!`);
      cart.applyDamage(15);
      break;
    }
  }
}
function getTotalVillageDefense(village) {
  return village.troops.cityGuards * 1 + village.troops.spearmen * 2 + village.troops.archers * 2 + village.troops.cavalry * 3;
}

// src/systems/military.ts
var RECRUIT_COSTS = {
  cityGuards: 5,
  spearmen: 8,
  archers: 8,
  cavalry: 12
};
function recruitTroop(village, type, count = 1) {
  const costEach = RECRUIT_COSTS[type];
  const totalCost = costEach * count;
  const availableWorkers = village.population - village.troops.cityGuards - village.troops.spearmen - village.troops.archers - village.troops.cavalry - village.workers.farmers - village.workers.workers;
  if (availableWorkers < count) {
    notifyPlayer(village.owner, `\xA7cNot enough available workers to recruit ${count} ${type}.`);
    return false;
  }
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
  const totalWages = village.troops.cityGuards * TROOP_WAGES.cityGuards + village.troops.spearmen * TROOP_WAGES.spearmen + village.troops.archers * TROOP_WAGES.archers + village.troops.cavalry * TROOP_WAGES.cavalry;
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
function processAllWages() {
  for (const village of getAllVillages()) {
    tickWages(village);
  }
}

// src/systems/population.ts
import { world as world6 } from "@minecraft/server";
var GROWTH_CHANCE = 0.6;
var MORTALITY_CHANCE = 0.4;
function tickPopulation(village) {
  if (daysSince(village.lastDayProcessed) < POPULATION_GROWTH_INTERVAL_DAYS) return;
  if (village.foodShortageStage >= 4) {
    handlePopulationDecline(village);
    return;
  }
  if (village.foodShortageStage >= 2) {
    return;
  }
  const canGrow = village.population < village.housingCapacity && village.foodStorage > 10;
  if (canGrow && Math.random() < GROWTH_CHANCE) {
    village.population += 1;
    village.workers.farmers = Math.max(
      village.workers.farmers,
      Math.floor(village.population * 0.3)
    );
    notifyPlayer(village.owner, `\xA7aPopulation grew in \xA7b${village.name}\xA7a! (${village.population})`);
  }
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
function spawnVillagerEntity(village) {
  const dim = world6.getDimension(village.location.dimension);
  const loc = village.townHallLocation;
  const query = {
    type: "minecraft:villager",
    location: { x: loc.x, y: loc.y, z: loc.z },
    maxDistance: 64
  };
  const existingVillagers = dim.getEntities(query);
  if (existingVillagers.length < village.population) {
    try {
      dim.spawnEntity("minecraft:villager", {
        x: loc.x + (Math.random() * 6 - 3),
        y: loc.y,
        z: loc.z + (Math.random() * 6 - 3)
      });
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
import { world as world7 } from "@minecraft/server";
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
  }
};
function getMaxMerchants(village) {
  return Math.floor(village.marketLevel * 1.5 + village.population / 20);
}
function tickMarket(village) {
  if (!isNewDay(village.lastDayProcessed)) return;
  cleanupDespawnedMerchants(village);
  const maxMerchants = getMaxMerchants(village);
  const currentCount = village.activeMerchants.length;
  if (currentCount >= maxMerchants) return;
  const spawnChance = 0.2 + village.prosperity / 100 * 0.5;
  if (Math.random() < spawnChance) {
    spawnMerchant(village);
  }
}
function spawnMerchant(village) {
  const dim = world7.getDimension(village.location.dimension);
  const loc = village.townHallLocation;
  const templates = Object.keys(MERCHANT_STOCK_TEMPLATES);
  const templateKey = templates[Math.floor(Math.random() * templates.length)];
  const stock = { ...MERCHANT_STOCK_TEMPLATES[templateKey] };
  try {
    const entity = dim.spawnEntity("kingdoms:merchant", {
      x: loc.x + (Math.random() * MERCHANT_SPAWN_RADIUS * 2 - MERCHANT_SPAWN_RADIUS),
      y: loc.y,
      z: loc.z + (Math.random() * MERCHANT_SPAWN_RADIUS * 2 - MERCHANT_SPAWN_RADIUS)
    });
    const merchantData = {
      entityId: entity.id,
      stock,
      destinationVillageId: village.id,
      currentPoleIndex: 0
    };
    entity.setDynamicProperty("kc:merchant_data", JSON.stringify(merchantData));
    entity.setDynamicProperty("kc:village_id", village.id);
    entity.nameTag = `Merchant [${village.name}]`;
    village.activeMerchants.push(merchantData);
    saveVillage(village);
    notifyPlayer(
      village.owner,
      `\xA76A merchant has arrived at \xA7b${village.name}\xA76! (Stock: ${Object.keys(stock).length} types)`
    );
  } catch {
  }
}
function cleanupDespawnedMerchants(village) {
  const dim = world7.getDimension(village.location.dimension);
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
  const totalRemaining = Object.values(merchant.stock).reduce((a, b) => a + b, 0);
  if (totalRemaining <= 0) {
    removeMerchant(village, merchantEntityId);
  } else {
    saveVillage(village);
  }
  return true;
}
function removeMerchant(village, merchantEntityId) {
  const dim = world7.getDimension(village.location.dimension);
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
function processAllMarkets() {
  for (const village of getAllVillages()) {
    tickMarket(village);
  }
}

// src/systems/trade.ts
import { world as world8 } from "@minecraft/server";
var CART_SPEED = 0.4;
var POLE_ARRIVE_DISTANCE = 3;
var CART_UPDATE_INTERVAL = 20;
var lastCartTick = 0;
function registerTradePole(village, location) {
  if (village.tradePoles.length >= 64) {
    notifyPlayer(village.owner, "\xA7cMaximum trade poles reached for this village.");
    return false;
  }
  const pole = {
    id: generateId(),
    location,
    order: village.tradePoles.length
  };
  village.tradePoles.push(pole);
  saveVillage(village);
  notifyPlayer(village.owner, `\xA7aTrade pole registered in \xA7b${village.name}\xA7a. (${village.tradePoles.length} total)`);
  return true;
}
function removeTradePole(village, poleId) {
  village.tradePoles = village.tradePoles.filter((p) => p.id !== poleId);
  village.tradePoles.forEach((p, i) => p.order = i);
  saveVillage(village);
}
function sendTradeCart(fromVillageId, toVillageId, cargo) {
  const from = getVillage(fromVillageId);
  const to = getVillage(toVillageId);
  if (!from || !to) return false;
  if (from.treasury < cargo.emeralds) {
    notifyPlayer(from.owner, "\xA7cNot enough emeralds in treasury to send.");
    return false;
  }
  if (from.foodStorage < cargo.food) {
    notifyPlayer(from.owner, "\xA7cNot enough food in granary to send.");
    return false;
  }
  from.treasury -= cargo.emeralds;
  from.foodStorage -= cargo.food;
  const dim = world8.getDimension(from.location.dimension);
  const spawnLoc = from.townHallLocation;
  let cartEntity;
  try {
    cartEntity = dim.spawnEntity("kingdoms:trade_cart", {
      x: spawnLoc.x + (Math.random() * 4 - 2),
      y: spawnLoc.y,
      z: spawnLoc.z + (Math.random() * 4 - 2)
    });
  } catch {
    notifyPlayer(from.owner, "\xA7cCould not spawn trade cart (chunk not loaded).");
    from.treasury += cargo.emeralds;
    from.foodStorage += cargo.food;
    saveVillage(from);
    return false;
  }
  const cartData = {
    entityId: cartEntity.id,
    sourceVillageId: fromVillageId,
    destinationVillageId: toVillageId,
    cargo,
    currentPoleIndex: 0,
    isMilitary: Object.values(cargo.troops ?? {}).some((v) => (v ?? 0) > 0)
  };
  cartEntity.setDynamicProperty("kc:cart_data", JSON.stringify(cartData));
  cartEntity.setDynamicProperty("kc:village_id", fromVillageId);
  cartEntity.nameTag = `Cart \u2192 ${to.name}`;
  from.activeCarts.push(cartData);
  from.tradeCartCount++;
  saveVillage(from);
  notifyPlayer(
    from.owner,
    `\xA7aTrade cart dispatched from \xA7b${from.name}\xA7a to \xA7b${to.name}\xA7a.`
  );
  return true;
}
function tickTradeCarts(currentTick) {
  if (currentTick - lastCartTick < CART_UPDATE_INTERVAL) return;
  lastCartTick = currentTick;
  for (const village of getAllVillages()) {
    if (village.activeCarts.length === 0) continue;
    processVillageCarts(village);
  }
}
function processVillageCarts(village) {
  const dim = world8.getDimension(village.location.dimension);
  let changed = false;
  for (let i = village.activeCarts.length - 1; i >= 0; i--) {
    const cart = village.activeCarts[i];
    const cartEntities = dim.getEntities({ type: "kingdoms:trade_cart" });
    const entity = cartEntities.find((e) => e.id === cart.entityId);
    if (!entity) {
      village.activeCarts.splice(i, 1);
      changed = true;
      continue;
    }
    const dest = getVillage(cart.destinationVillageId);
    if (!dest) {
      entity.remove();
      village.activeCarts.splice(i, 1);
      changed = true;
      continue;
    }
    const destPoles = dest.tradePoles.sort((a, b) => a.order - b.order);
    if (destPoles.length === 0) {
      moveEntityToward(entity, dest.townHallLocation);
      const d2 = distance(entity.location, dest.townHallLocation);
      if (d2 < POLE_ARRIVE_DISTANCE) {
        deliverCart(cart, village, dest, entity, i);
        changed = true;
      }
      continue;
    }
    const currentPole = destPoles[Math.min(cart.currentPoleIndex, destPoles.length - 1)];
    moveEntityToward(entity, currentPole.location);
    const d = distance(entity.location, currentPole.location);
    if (d < POLE_ARRIVE_DISTANCE) {
      if (cart.currentPoleIndex >= destPoles.length - 1) {
        deliverCart(cart, village, dest, entity, i);
        changed = true;
      } else {
        cart.currentPoleIndex++;
      }
    }
  }
  if (changed) saveVillage(village);
}
function moveEntityToward(entity, target) {
  const newPos = moveToward(entity.location, target, CART_SPEED);
  try {
    entity.teleport(newPos);
  } catch {
  }
}
function deliverCart(cart, sourceVillage, destVillage, entity, cartIndex) {
  destVillage.treasury += cart.cargo.emeralds;
  destVillage.foodStorage += cart.cargo.food;
  for (const [troopType, count] of Object.entries(cart.cargo.troops ?? {})) {
    const key = troopType;
    destVillage.troops[key] = (destVillage.troops[key] ?? 0) + (count ?? 0);
  }
  saveVillage(destVillage);
  entity.remove();
  sourceVillage.activeCarts.splice(cartIndex, 1);
  sourceVillage.tradeCartCount = Math.max(0, sourceVillage.tradeCartCount - 1);
  notifyPlayer(
    destVillage.owner,
    `\xA7aTrade cart arrived at \xA7b${destVillage.name}\xA7a! (+${cart.cargo.emeralds}\u{1F48E}, +${cart.cargo.food}\u{1F33E})`
  );
  if (sourceVillage.tradeCartCount <= 0) {
    spawnDepotCart(sourceVillage);
  }
}
function spawnDepotCart(village) {
  village.tradeCartCount = 1;
  saveVillage(village);
}

// src/systems/watchtower.ts
import { world as world9 } from "@minecraft/server";
var DETECTION_INTERVAL_TICKS = 100;
var lastDetectionTick = 0;
function tickWatchtowers(currentTick) {
  if (currentTick - lastDetectionTick < DETECTION_INTERVAL_TICKS) return;
  lastDetectionTick = currentTick;
  for (const village of getAllVillages()) {
    if (!village.owner) continue;
    const watchtowers = village.guardPoles.filter((p) => p.type === "watchtower");
    if (watchtowers.length === 0) continue;
    for (const tower of watchtowers) {
      scanFromWatchtower(village, tower);
    }
  }
}
function scanFromWatchtower(village, tower) {
  const dim = world9.getDimension(village.location.dimension);
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
      const d = Math.round(distance(entity.location, tower.location));
      notifyPlayer(village.owner, `\xA7c\u26A0 Watchtower detected bandits near \xA7b${village.name}\xA7c! (${d}m away)`);
      return;
    }
    if (entity.typeId === "minecraft:player") {
      const playerName = entity.name;
      if (playerName === village.owner) continue;
      if (kingdom && isAllied(playerName, kingdom.id)) continue;
      if (isEnemyPlayer(playerName, village.kingdomId)) {
        notifyPlayer(
          village.owner,
          `\xA7c\u2694 Enemy player \xA74${playerName}\xA7c detected near \xA7b${village.name}\xA7c!`
        );
        notifyPlayer(village.owner, `\xA7cVillage may be under attack!`);
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

// src/systems/conquest.ts
import { world as world10 } from "@minecraft/server";
var SIEGE_RADIUS = 48;
var CAPTURE_PROXIMITY = 5;
var activeSieges = /* @__PURE__ */ new Map();
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
        notifyPlayer(target.owner, `\xA7cTown Hall being captured! (${percent}%)`);
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
  notifyPlayer(siege.attackerName, `\xA7a\u2694 \xA7b${target.name}\xA7a has been captured! Treasury: ${transferredTreasury}\u{1F48E}`);
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
}

// src/systems/guards.ts
import { world as world11 } from "@minecraft/server";
var GUARD_ENTITY_MAP = {
  cityGuards: "kingdoms:city_guard",
  spearmen: "kingdoms:spearman",
  archers: "kingdoms:archer",
  cavalry: "kingdoms:cavalry"
};
function registerGuardPole(village, location, type) {
  if (village.guardPoles.length >= 32) {
    notifyPlayer(village.owner, "\xA7cMaximum guard poles reached for this village.");
    return false;
  }
  const pole = {
    id: generateId(),
    location,
    type,
    assignedGuards: 0,
    troopType: "cityGuards",
    entityIds: []
  };
  village.guardPoles.push(pole);
  saveVillage(village);
  notifyPlayer(village.owner, `\xA7aGuard pole (${type}) registered in \xA7b${village.name}\xA7a.`);
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
function spawnPoleGuards(village, pole) {
  const dim = world11.getDimension(village.location.dimension);
  const entityType = GUARD_ENTITY_MAP[pole.troopType];
  pole.entityIds = [];
  for (let i = 0; i < pole.assignedGuards; i++) {
    try {
      const angle = i / pole.assignedGuards * Math.PI * 2;
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
  const dim = world11.getDimension(village.location.dimension);
  for (const eid of pole.entityIds) {
    try {
      const entities = dim.getEntities({ type: GUARD_ENTITY_MAP[pole.troopType] });
      const entity = entities.find((e) => e.id === eid);
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
  }
}

// src/systems/treasury.ts
import { ItemStack, EntityInventoryComponent as EntityInventoryComponent2 } from "@minecraft/server";
function depositEmeralds(player, villageId, amount) {
  const village = getVillage(villageId);
  if (!village || village.owner !== player.name) return false;
  const inv = player.getComponent(EntityInventoryComponent2.componentId);
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
    notifyPlayer(player.name, "\xA7cNo emeralds in inventory.");
    return false;
  }
  village.treasury += removed;
  saveVillage(village);
  notifyPlayer(player.name, `\xA7aDeposited ${removed}\u{1F48E} into \xA7b${village.name}\xA7a treasury. (Total: ${village.treasury}\u{1F48E})`);
  return true;
}
function withdrawEmeralds(player, villageId, amount) {
  const village = getVillage(villageId);
  if (!village || village.owner !== player.name) return false;
  if (village.treasury < amount) {
    notifyPlayer(player.name, `\xA7cNot enough emeralds in treasury (${village.treasury}\u{1F48E}).`);
    return false;
  }
  const inv = player.getComponent(EntityInventoryComponent2.componentId);
  if (!inv) return false;
  const container = inv.container;
  if (!container) return false;
  let remaining = amount;
  for (let i = 0; i < container.size && remaining > 0; i++) {
    if (container.getItem(i) === void 0) {
      const stackSize = Math.min(remaining, 64);
      const item = new ItemStack("minecraft:emerald", stackSize);
      container.setItem(i, item);
      remaining -= stackSize;
    }
  }
  if (remaining > 0) {
    notifyPlayer(player.name, "\xA7cInventory full.");
    return false;
  }
  village.treasury -= amount;
  saveVillage(village);
  notifyPlayer(player.name, `\xA7aWithdrew ${amount}\u{1F48E} from \xA7b${village.name}\xA7a. (Remaining: ${village.treasury}\u{1F48E})`);
  return true;
}
function getTreasuryReport(village) {
  const { TROOP_WAGES: TROOP_WAGES2 } = { TROOP_WAGES: { cityGuards: 1, spearmen: 2, archers: 2, cavalry: 3 } };
  const dailyWages = (village.troops.cityGuards * TROOP_WAGES2.cityGuards + village.troops.spearmen * TROOP_WAGES2.spearmen + village.troops.archers * TROOP_WAGES2.archers + village.troops.cavalry * TROOP_WAGES2.cavalry) / 3;
  return [
    `\xA7b${village.name} Treasury\xA7r`,
    `Balance: ${village.treasury}\u{1F48E}`,
    `Daily wage cost: ~${dailyWages.toFixed(1)}\u{1F48E}/day`,
    `Days of wages remaining: ${dailyWages > 0 ? Math.floor(village.treasury / dailyWages) : "\u221E"}`
  ].join("\n");
}

// src/systems/blacksmith.ts
import { ItemStack as ItemStack2, EntityInventoryComponent as EntityInventoryComponent3 } from "@minecraft/server";
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
  const inv = player.getComponent(EntityInventoryComponent3.componentId);
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
  const inv = player.getComponent(EntityInventoryComponent3.componentId);
  if (!inv) return;
  const container = inv.container;
  if (!container) return;
  let remaining = amount;
  for (let i = 0; i < container.size && remaining > 0; i++) {
    const item = container.getItem(i);
    if (item === void 0) {
      const give = Math.min(remaining, 64);
      container.setItem(i, new ItemStack2(typeId, give));
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

// src/systems/reinforcements.ts
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

// src/main.ts
var CUSTOM_BLOCKS = {
  TOWN_HALL: "kingdoms:town_hall",
  GUARD_POLE_VILLAGE: "kingdoms:guard_pole_village",
  GUARD_POLE_GATE: "kingdoms:guard_pole_gate",
  GUARD_POLE_ROAD: "kingdoms:guard_pole_road",
  GUARD_POLE_WATCHTOWER: "kingdoms:guard_pole_watchtower",
  TRADE_POLE: "kingdoms:trade_pole",
  BARRACKS: "kingdoms:barracks",
  MARKET: "kingdoms:market",
  GRANARY: "kingdoms:granary",
  BLACKSMITH: "kingdoms:blacksmith"
};
function findVillageAt(location) {
  return getAllVillages().find(
    (v) => Math.abs(v.location.x - location.x) < 64 && Math.abs(v.location.z - location.z) < 64
  );
}
world12.afterEvents.playerPlaceBlock.subscribe((event) => {
  const { player, block } = event;
  if (!player) return;
  const typeId = block.typeId;
  if (typeId === CUSTOM_BLOCKS.TOWN_HALL) {
    void showClaimVillageForm(player, block);
  }
  if (typeId.startsWith("kingdoms:guard_pole")) {
    const typeMap = {
      "kingdoms:guard_pole_village": "village",
      "kingdoms:guard_pole_gate": "gate",
      "kingdoms:guard_pole_road": "road",
      "kingdoms:guard_pole_watchtower": "watchtower"
    };
    const village = findVillageAt(block.location);
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
  if (typeId === CUSTOM_BLOCKS.TRADE_POLE) {
    const village = findVillageAt(block.location);
    if (!village) {
      notifyPlayer(player.name, "\xA7cNo village territory here. Claim a village first.");
      return;
    }
    if (village.owner !== player.name) {
      notifyPlayer(player.name, "\xA7cThis is not your village.");
      return;
    }
    registerTradePole(village, block.location);
  }
});
world12.afterEvents.itemUseOn.subscribe((event) => {
  const player = event.source;
  const block = event.block;
  if (!player) return;
  const typeId = block.typeId;
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
      void showGranaryMenu(player, block);
      break;
  }
});
world12.afterEvents.playerBreakBlock.subscribe((event) => {
  const { player } = event;
  if (!player) return;
  const typeId = event.brokenBlockPermutation.type.id;
  const blockLoc = event.block.location;
  if (typeId === CUSTOM_BLOCKS.TOWN_HALL) {
    const village = findVillageAt(blockLoc);
    if (village && village.owner === player.name) {
      notifyPlayer(player.name, `\xA7e\xA7b${village.name}\xA7e Town Hall broken. Rebuild to access menu.`);
    }
  }
  if (typeId.startsWith("kingdoms:guard_pole")) {
    const village = findVillageAt(blockLoc);
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
  if (typeId === CUSTOM_BLOCKS.TRADE_POLE) {
    const village = findVillageAt(blockLoc);
    if (village) {
      const pole = village.tradePoles.find(
        (p) => p.location.x === blockLoc.x && p.location.y === blockLoc.y && p.location.z === blockLoc.z
      );
      if (pole) {
        removeTradePole(village, pole.id);
        notifyPlayer(player.name, `\xA7eTrade pole removed.`);
      }
    }
  }
});
system.runInterval(() => {
  const tick = getCurrentTick();
  tickWatchtowers(tick);
  tickTradeCarts(tick);
  tickSieges(tick);
}, 20);
system.runInterval(() => {
  processAllFood();
  processAllWages();
  processAllPopulation();
  processAllMarkets();
  tickBandits();
}, 24e3);
system.runInterval(() => {
  refreshAllGuards();
}, 12e3);
system.runInterval(() => {
  for (const village of getAllVillages()) {
    updateHousingCapacity(village.id);
  }
}, 72e3);
async function showClaimVillageForm(player, block) {
  const form = new ModalFormData().title("Claim Village").textField("Kingdom Name", "Enter your kingdom name...").textField("Village Name", "Enter a name for this village...");
  const response = await form.show(player);
  if (response.canceled) return;
  const [kingdomName, _villageName] = response.formValues;
  if (!kingdomName) return;
  claimVillage(player, block, kingdomName);
}
async function showTownHallMenu(player, block) {
  const village = findVillageAt(block.location);
  if (!village) {
    notifyPlayer(player.name, "\xA7cNo village data. Place a Town Hall and claim first.");
    return;
  }
  const isOwner = village.owner === player.name;
  const summary = getVillageSummary(village);
  const form = new ActionFormData().title(`${village.name} \u2014 Town Hall`).body(summary);
  if (isOwner) {
    form.button("Kingdom Overview").button("Treasury").button("Diplomacy").button("Send Reinforcements").button("Merchants").button("Rename Village");
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
      await showTreasuryMenu(player, village.id);
      break;
    case 2:
      await showDiplomacyMenu(player);
      break;
    case 3:
      await showReinforcementsMenu(player, village.id);
      break;
    case 4:
      await showActiveMerchantsMenu(player, village);
      break;
    case 5:
      await showRenameForm(player, village.id);
      break;
  }
}
async function showBarracksMenu(player, block) {
  const village = findVillageAt(block.location);
  if (!village || village.owner !== player.name) {
    notifyPlayer(player.name, "\xA7cYou don't own this village.");
    return;
  }
  const t = village.troops;
  const form = new ActionFormData().title(`${village.name} \u2014 Barracks Lv${village.barracksLevel}`).body(
    `Guards: ${t.cityGuards}  Spearmen: ${t.spearmen}
Archers: ${t.archers}  Cavalry: ${t.cavalry}

Treasury: ${village.treasury}\u{1F48E}  Pop: ${village.population}/${village.housingCapacity}`
  ).button("Recruit City Guard (5\u{1F48E})").button("Recruit Spearman (8\u{1F48E})").button("Recruit Archer (8\u{1F48E})").button("Recruit Cavalry (12\u{1F48E})").button("Disband 1 Guard").button("Disband 1 Spearman").button(`Upgrade Barracks (${village.barracksLevel * 15}\u{1F48E})`);
  const response = await form.show(player);
  if (response.canceled) return;
  switch (response.selection) {
    case 0:
      recruitTroop(village, "cityGuards", 1);
      break;
    case 1:
      recruitTroop(village, "spearmen", 1);
      break;
    case 2:
      recruitTroop(village, "archers", 1);
      break;
    case 3:
      recruitTroop(village, "cavalry", 1);
      break;
    case 4:
      disbandTroop(village, "cityGuards", 1);
      break;
    case 5:
      disbandTroop(village, "spearmen", 1);
      break;
    case 6:
      upgradeBarracks(village);
      break;
  }
}
async function showMarketMenu(player, block) {
  const village = findVillageAt(block.location);
  if (!village || village.owner !== player.name) {
    notifyPlayer(player.name, "\xA7cYou don't own this village.");
    return;
  }
  const maxMerchants = Math.floor(village.marketLevel * 1.5 + village.population / 20);
  const merchantList = village.activeMerchants.map(
    (m, i) => `Merchant ${i + 1}: ${Object.entries(m.stock).map(([k, v]) => `${k.replace("minecraft:", "")}\xD7${v}`).join(", ")}`
  ).join("\n") || "No merchants present.";
  const form = new ActionFormData().title(`${village.name} \u2014 Market Lv${village.marketLevel}`).body(`Active: ${village.activeMerchants.length}/${maxMerchants} merchants
${merchantList}

Treasury: ${village.treasury}\u{1F48E}`).button("Buy 10 Food (20\u{1F48E})").button("Sell 10 Food (10\u{1F48E})").button(`Upgrade Market (${village.marketLevel * 20}\u{1F48E})`).button("Close");
  const response = await form.show(player);
  if (response.canceled) return;
  switch (response.selection) {
    case 0:
      buyFood(village, 10);
      break;
    case 1:
      sellFood(village, 10);
      break;
    case 2:
      upgradeMarket(village);
      break;
  }
}
async function showBlacksmithMenu(player, block) {
  const village = findVillageAt(block.location);
  if (!village || village.owner !== player.name) {
    notifyPlayer(player.name, "\xA7cYou don't own this village.");
    return;
  }
  const summary = getBlacksmithSummary(village);
  const form = new ActionFormData().title(`${village.name} \u2014 Blacksmith`).body(summary).button("Upgrade Weapons").button("Upgrade Armor").button("Close");
  const response = await form.show(player);
  if (response.canceled) return;
  switch (response.selection) {
    case 0:
      upgradeWeapons(player, village.id);
      break;
    case 1:
      upgradeArmor(player, village.id);
      break;
  }
}
async function showGranaryMenu(player, block) {
  const village = findVillageAt(block.location);
  if (!village || village.owner !== player.name) {
    notifyPlayer(player.name, "\xA7cYou don't own this village.");
    return;
  }
  const prod = getFoodProduction(village);
  const cons = getFoodConsumption(village);
  const form = new ActionFormData().title(`${village.name} \u2014 Granary`).body(
    `Food Storage: ${village.foodStorage}\u{1F33E}
Daily Production: +${prod}
Daily Consumption: -${cons}
Net per day: ${prod >= cons ? "+" : ""}${prod - cons}

Farmers: ${village.workers.farmers}
Shortage Stage: ${village.foodShortageStage}/4`
  ).button("Close");
  await form.show(player);
}
async function showTreasuryMenu(player, villageId) {
  const village = getVillage(villageId);
  if (!village) return;
  const report = getTreasuryReport(village);
  const form = new ActionFormData().title(`${village.name} \u2014 Treasury`).body(report).button("Deposit 10\u{1F48E}").button("Deposit 64\u{1F48E}").button("Withdraw 10\u{1F48E}").button("Withdraw 64\u{1F48E}").button("Back");
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
      withdrawEmeralds(player, villageId, 10);
      break;
    case 3:
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
    sendTradeCart(fromId, toId, { emeralds, food, troops: {} });
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
