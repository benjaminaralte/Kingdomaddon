import './faye/all.js';
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/types/index.ts
var WEAPON_TIERS, ARMOR_TIERS, TROOP_WAGES, EMPTY_RESOURCE_STORAGE, RESOURCE_LABELS, TICKS_PER_DAY, CLAIM_COST_EMERALDS, VILLAGE_CLAIM_RADIUS, MIN_VILLAGERS_TO_CLAIM, FOOD_PER_VILLAGER_PER_DAY, POPULATION_GROWTH_INTERVAL_DAYS, WAGE_INTERVAL_DAYS, MAX_GUARDS_PER_POLE, WATCHTOWER_DETECTION_RADIUS, BANDIT_MIGRATE_DISTANCE;
var init_types = __esm({
  "src/types/index.ts"() {
    "use strict";
    WEAPON_TIERS = ["wood", "stone", "iron", "gold", "diamond", "netherite"];
    ARMOR_TIERS = ["leather", "iron", "gold", "diamond", "netherite"];
    TROOP_WAGES = {
      cityGuards: 2,
      spearmen: 3,
      archers: 3,
      cavalry: 5,
      heavyKnight: 8,
      samurai: 12,
      mercenaryLancer: 10,
      legionary: 10,
      cavalryLancerElite: 15
    };
    EMPTY_RESOURCE_STORAGE = {
      iron: 0,
      gold: 0,
      coal: 0,
      wood: 0,
      stone: 0,
      diamonds: 0
    };
    RESOURCE_LABELS = {
      iron: "Iron",
      gold: "Gold",
      coal: "Coal",
      wood: "Wood",
      stone: "Stone",
      diamonds: "Diamonds"
    };
    TICKS_PER_DAY = 24e3;
    CLAIM_COST_EMERALDS = 10;
    VILLAGE_CLAIM_RADIUS = 64;
    MIN_VILLAGERS_TO_CLAIM = 3;
    FOOD_PER_VILLAGER_PER_DAY = 1;
    POPULATION_GROWTH_INTERVAL_DAYS = 2;
    WAGE_INTERVAL_DAYS = 3;
    MAX_GUARDS_PER_POLE = 3;
    WATCHTOWER_DETECTION_RADIUS = 48;
    BANDIT_MIGRATE_DISTANCE = 200;
  }
});

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
var init_tick = __esm({
  "src/utils/tick.ts"() {
    "use strict";
    init_types();
  }
});

// src/systems/playerSettings.ts
import { world as world2 } from "@minecraft/server";
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
var DEFAULT_SETTINGS;
var init_playerSettings = __esm({
  "src/systems/playerSettings.ts"() {
    "use strict";
    DEFAULT_SETTINGS = {
      alertsEnabled: true
    };
  }
});

// src/utils/notify.ts
import { world as world3 } from "@minecraft/server";
function sendCrisisTitle(playerName, title, subtitle, sound = "raid.horn") {
  const player = world3.getPlayers().find((p) => p.name === playerName);
  if (!player) return;
  player.onScreenDisplay.setTitle(title, {
    subtitle,
    fadeInDuration: 10,
    stayDuration: 80,
    fadeOutDuration: 20
  });
  try {
    player.playSound(sound, { volume: 1, pitch: 1 });
  } catch {
  }
}
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
var init_notify = __esm({
  "src/utils/notify.ts"() {
    "use strict";
    init_playerSettings();
  }
});

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
  if (!raw) return { villageIds: [], kingdomIds: [], banditCampIds: [] };
  try {
    return JSON.parse(raw);
  } catch {
    return { villageIds: [], kingdomIds: [], banditCampIds: [] };
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
function getAllVillages() {
  const reg = getRegistry();
  return reg.villageIds.flatMap((id) => {
    const v = getVillage(id);
    return v ? [v] : [];
  });
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
var REGISTRY_KEY, VILLAGE_PREFIX, KINGDOM_PREFIX, BANDIT_PREFIX;
var init_storage = __esm({
  "src/storage/index.ts"() {
    "use strict";
    REGISTRY_KEY = "kc:registry";
    VILLAGE_PREFIX = "kc:village:";
    KINGDOM_PREFIX = "kc:kingdom:";
    BANDIT_PREFIX = "kc:bandit:";
  }
});

// src/systems/villageAlerts.ts
function makeKey(type, villageId) {
  return `${type}_${villageId}_${getCurrentDay()}`;
}
function checkDailyCrisisAlerts() {
  for (const village of getAllVillages()) {
    if (!village.owner) continue;
    if (village.treasury === 0) {
      const key = makeKey("treasury", village.id);
      if (!alertedKeys.has(key)) {
        alertedKeys.add(key);
        sendCrisisTitle(
          village.owner,
          "\xA76\xA7lTREASURY EMPTY",
          `\xA7e${village.name} has run out of funds!`,
          "random.anvil_land"
        );
        notifyPlayer(
          village.owner,
          `\xA7c\u26A0 \xA7b${village.name}\xA7c treasury is empty \u2014 troops may desert!`
        );
      }
    }
    if (village.population > 0 && village.population < 5) {
      const key = makeKey("population", village.id);
      if (!alertedKeys.has(key)) {
        alertedKeys.add(key);
        sendCrisisTitle(
          village.owner,
          "\xA7c\xA7lVILLAGE DYING",
          `\xA7e${village.name} \u2014 only ${village.population} citizens left!`,
          "mob.villager.death"
        );
        notifyPlayer(
          village.owner,
          `\xA7c\u26A0 \xA7b${village.name}\xA7c is critically low on population (${village.population})!`
        );
      }
    }
  }
}
function triggerAttackAlert(ownerName, villageName, campStrength) {
  sendCrisisTitle(
    ownerName,
    "\xA7c\xA7l\u2694  UNDER ATTACK!",
    `\xA7eBandits (${campStrength}) are raiding ${villageName}!`,
    "raid.horn"
  );
  notifyPlayer(
    ownerName,
    `\xA7c\u2694 \xA7b${villageName}\xA7c is under bandit attack! (Camp strength: ${campStrength})`
  );
}
var alertedKeys;
var init_villageAlerts = __esm({
  "src/systems/villageAlerts.ts"() {
    "use strict";
    init_storage();
    init_notify();
    init_tick();
    alertedKeys = /* @__PURE__ */ new Set();
  }
});

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
      saveVillage(village);
    }
  }
  for (const other of getAllKingdoms()) {
    if (other.id === kingdomId) continue;
    let changed = false;
    if (other.wars.includes(kingdomId)) {
      other.wars = other.wars.filter((id) => id !== kingdomId);
      changed = true;
    }
    if (other.alliances.includes(kingdomId)) {
      other.alliances = other.alliances.filter((id) => id !== kingdomId);
      changed = true;
    }
    if (changed) saveKingdom(other);
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
      total += village.troops.cityGuards * 1 + village.troops.spearmen * 2 + village.troops.archers * 2 + village.troops.cavalry * 3 + (village.troops.heavyKnight ?? 0) * 5 + (village.troops.samurai ?? 0) * 7 + (village.troops.mercenaryLancer ?? 0) * 6 + (village.troops.legionary ?? 0) * 6 + (village.troops.cavalryLancerElite ?? 0) * 8;
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
function notifyAlliedKings(kingdomId, message) {
  const kingdom = getKingdom(kingdomId);
  if (!kingdom || kingdom.alliances.length === 0) return;
  for (const allyId of kingdom.alliances) {
    const ally = getKingdom(allyId);
    if (ally) notifyAlert(ally.king, message);
  }
}
function getKingdomOf(playerName) {
  return getAllKingdoms().find(
    (k) => k.king === playerName || k.villageIds.some((vid) => {
      const v = getVillage(vid);
      return v?.owner === playerName;
    })
  );
}
var init_kingdom = __esm({
  "src/systems/kingdom.ts"() {
    "use strict";
    init_storage();
    init_notify();
  }
});

// src/systems/bandit.ts
var bandit_exports = {};
__export(bandit_exports, {
  disbandBanditCamp: () => disbandBanditCamp,
  getBanditCampSummary: () => getBanditCampSummary,
  getBanditThreatLevel: () => getBanditThreatLevel,
  spawnBanditDeserters: () => spawnBanditDeserters,
  spawnTypedDeserters: () => spawnTypedDeserters,
  tickBandits: () => tickBandits
});
import { world as world5, system } from "@minecraft/server";
function spawnTypedDeserters(village, deserters) {
  const loc = village.location;
  const angle = Math.random() * Math.PI * 2;
  const campX = loc.x + Math.cos(angle) * BANDIT_MIGRATE_DISTANCE;
  const campZ = loc.z + Math.sin(angle) * BANDIT_MIGRATE_DISTANCE;
  let camp;
  let nearestDist = 80;
  for (const c of getAllBanditCamps()) {
    if (c.location.dimension !== loc.dimension) continue;
    const d = distance(c.location, { x: campX, y: loc.y, z: campZ });
    if (d < nearestDist) {
      nearestDist = d;
      camp = c;
    }
  }
  let totalCount = 0;
  for (const n of Object.values(deserters)) totalCount += n ?? 0;
  if (!camp) {
    camp = {
      id: generateId(),
      location: { x: campX, y: loc.y, z: campZ, dimension: loc.dimension },
      strength: 0,
      originKingdomId: village.kingdomId,
      entityIds: []
    };
    saveBanditCamp(camp);
  }
  camp.strength += totalCount;
  const dim = world5.getDimension(loc.dimension);
  for (const [troopKey, count] of Object.entries(deserters)) {
    if (!count || count <= 0) continue;
    const entityId = TROOP_ENTITY_IDS[troopKey] ?? "kingdoms:bandit";
    for (let i = 0; i < count; i++) {
      try {
        const entity = dim.spawnEntity(entityId, {
          x: camp.location.x + (Math.random() * 10 - 5),
          y: camp.location.y,
          z: camp.location.z + (Math.random() * 10 - 5)
        });
        entity.setDynamicProperty("kc:camp_id", camp.id);
        if (!camp.entityIds.includes(entity.id)) camp.entityIds.push(entity.id);
      } catch {
      }
    }
  }
  saveBanditCamp(camp);
}
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
}
function trySpawnEntities(camp) {
  const dim = world5.getDimension(camp.location.dimension);
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
  try {
    return dim.getEntities({
      location: camp.location,
      maxDistance: 80
    }).filter((e) => {
      try {
        return e.getDynamicProperty("kc:camp_id") === camp.id;
      } catch {
        return false;
      }
    });
  } catch {
    return [];
  }
}
function cleanDeadEntities(camp) {
  try {
    const dim = world5.getDimension(camp.location.dimension);
    const liveEntities = getLiveEntities(dim, camp);
    const liveIds = new Set(liveEntities.map((e) => e.id));
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
  const camps = getAllBanditCamps();
  for (const camp of camps) {
    cleanDeadEntities(camp);
    const fresh = getBanditCamp(camp.id);
    if (!fresh) continue;
    if (fresh.strength <= 0) {
      disbandBanditCamp(fresh.id);
      continue;
    }
    trySpawnEntities(fresh);
    if (Math.random() < 0.3) {
      raidNearbyTargets(fresh);
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
      const defense = getTotalVillageDefense(village);
      if (camp.strength > defense * 0.4 || d < 100) {
        targetDist = d;
        target = village;
      }
    }
  }
  if (!target) return;
  triggerAttackAlert(target.owner, target.name, camp.strength);
  notifyAlliedKings(
    target.kingdomId,
    `\xA7c\u{1F3F4} Allied village \xA7b${target.name}\xA7c is being raided by bandits! (Strength: ${camp.strength})`
  );
  const dim = world5.getDimension(camp.location.dimension);
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
  return village.troops.cityGuards * 1 + village.troops.spearmen * 2 + village.troops.archers * 2 + village.troops.cavalry * 3 + (village.troops.heavyKnight ?? 0) * 5 + (village.troops.samurai ?? 0) * 7 + (village.troops.mercenaryLancer ?? 0) * 6 + (village.troops.legionary ?? 0) * 6 + (village.troops.cavalryLancerElite ?? 0) * 8;
}
function disbandBanditCamp(campId) {
  const camp = getBanditCamp(campId);
  if (!camp) return;
  try {
    const dim = world5.getDimension(camp.location.dimension);
    const live = getLiveEntities(dim, camp);
    for (const entity of live) {
      try {
        entity.kill();
      } catch {
      }
    }
  } catch {
  }
  deleteBanditCamp(campId);
}
function getBanditThreatLevel(village) {
  let closestStrength = 0;
  for (const camp of getAllBanditCamps()) {
    if (camp.location.dimension !== village.location.dimension) continue;
    const d = distance(camp.location, village.location);
    if (d < 300) {
      closestStrength = Math.max(closestStrength, camp.strength);
    }
  }
  if (closestStrength === 0) return "none";
  if (closestStrength < 5) return "low";
  if (closestStrength < 15) return "medium";
  return "high";
}
function getBanditCampSummary() {
  const camps = getAllBanditCamps();
  if (camps.length === 0) return "\xA77No active bandit camps.";
  return camps.map(
    (c, i) => `\xA7c\u2694 Camp #${i + 1}\xA7r  Strength: \xA7e${c.strength}\xA7r  Entities: ${c.entityIds.length}  Pos: \xA77${Math.round(c.location.x)},${Math.round(c.location.z)}`
  ).join("\n");
}
var MAX_WORLD_CAMPS, MIN_WORLD_SPAWN_DIST, MAX_WORLD_SPAWN_DIST, RAID_FOOD_STEAL_PER_STRENGTH, MAX_RAID_FOOD_PCT, MAX_ENTITIES_PER_CAMP, TROOP_ENTITY_IDS;
var init_bandit = __esm({
  "src/systems/bandit.ts"() {
    "use strict";
    init_types();
    init_storage();
    init_tick();
    init_notify();
    init_villageAlerts();
    init_kingdom();
    MAX_WORLD_CAMPS = 5;
    MIN_WORLD_SPAWN_DIST = 300;
    MAX_WORLD_SPAWN_DIST = 600;
    RAID_FOOD_STEAL_PER_STRENGTH = 3;
    MAX_RAID_FOOD_PCT = 0.15;
    MAX_ENTITIES_PER_CAMP = 10;
    TROOP_ENTITY_IDS = {
      cityGuards: "kingdoms:city_guard",
      spearmen: "kingdoms:spearman",
      archers: "kingdoms:archer",
      cavalry: "kingdoms:cavalry",
      heavyKnight: "kingdoms:heavy_knight",
      samurai: "kingdoms:samurai",
      mercenaryLancer: "kingdoms:mercenary_lancer",
      legionary: "kingdoms:legionary",
      cavalryLancerElite: "kingdoms:cavalry_lancer_elite"
    };
  }
});

// src/main.ts
init_types();
init_tick();
init_notify();
init_storage();
import { world as world20, system as system6, EntityInventoryComponent as EntityInventoryComponent8, ItemStack as ItemStack6 } from "@minecraft/server";
import { ActionFormData as ActionFormData3, ModalFormData, MessageFormData } from "@minecraft/server-ui";

// src/systems/harvest.ts
init_storage();
init_tick();
init_notify();
init_types();
import { world as world6, ItemStack, EntityInventoryComponent } from "@minecraft/server";
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
  if (remaining > 0) {
    notifyPlayer(player.name, "\xA7cInventory full.");
    return false;
  }
  removeFromGranary(village, itemTypeId, amount);
  notifyPlayer(player.name, `\xA7aWithdrew ${amount}x ${itemTypeId.replace("minecraft:", "")} from \xA7b${village.name}\xA7a granary.`);
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
  const soldiers = village.troops.cityGuards + village.troops.spearmen + village.troops.archers + village.troops.cavalry + (village.troops.heavyKnight ?? 0) + (village.troops.samurai ?? 0) + (village.troops.mercenaryLancer ?? 0) + (village.troops.legionary ?? 0) + (village.troops.cavalryLancerElite ?? 0);
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
      `\xA7e${soldiers} soldiers in \xA7b${village.name}\xA7e consumed food from granary.`
    );
  } else {
    village.missedSoldierFeedDays = (village.missedSoldierFeedDays ?? 0) + 1;
    if (village.missedSoldierFeedDays === 1) {
      notifyPlayer(
        village.owner,
        `\xA7c\u26A0 Soldiers in \xA7b${village.name}\xA7c couldn't be fully fed! They are starving \u2014 feed them or they will desert.`
      );
      village.prosperity = Math.max(0, village.prosperity - 10);
    } else {
      const deserters = {};
      const troopKeys = [
        "cityGuards",
        "spearmen",
        "archers",
        "cavalry",
        "heavyKnight",
        "samurai",
        "mercenaryLancer",
        "legionary"
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
        `\xA74\u2694 ${totalDeserters} starving soldiers deserted \xA7b${village.name}\xA74 and turned hostile!`
      );
      if (totalDeserters > 0) {
        void Promise.resolve().then(() => (init_bandit(), bandit_exports)).then(({ spawnTypedDeserters: spawnTypedDeserters2 }) => {
          spawnTypedDeserters2(village, deserters);
        });
      }
    }
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
  return getAllVillages().find((v) => {
    if (v.location.dimension !== dimensionId) return false;
    const dx = v.location.x - location.x;
    const dz = v.location.z - location.z;
    return Math.sqrt(dx * dx + dz * dz) < VILLAGE_CLAIM_RADIUS;
  });
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
  const dim = world6.getDimension(village.location.dimension);
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
import { system as system3 } from "@minecraft/server";

// src/systems/village.ts
init_types();
init_storage();
init_tick();
init_notify();
init_kingdom();
import { world as world7, EntityInventoryComponent as EntityInventoryComponent2 } from "@minecraft/server";
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
    troops: { cityGuards: 0, spearmen: 0, archers: 0, cavalry: 0, heavyKnight: 0, samurai: 0, mercenaryLancer: 0, legionary: 0, cavalryLancerElite: 0 },
    missedWages: 0,
    lastDayProcessed: getCurrentDay(),
    lastWageDay: getCurrentDay(),
    foodShortageStage: 0,
    guardPoles: [],
    tradePoles: [],
    workers: { farmers: Math.max(1, Math.floor(villagers.length * 0.5)), workers: 0, miners: 0 },
    blacksmith: { weaponTier: 0, armorTier: 0 },
    activeMerchants: [],
    activeCarts: [],
    granaryItems: {},
    lastSoldierFeedDay: getCurrentDay(),
    missedSoldierFeedDays: 0,
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
  const hk = t.heavyKnight ?? 0;
  const sa = t.samurai ?? 0;
  const ml = t.mercenaryLancer ?? 0;
  const le = t.legionary ?? 0;
  const cle = t.cavalryLancerElite ?? 0;
  const totalSoldiers = t.cityGuards + t.spearmen + t.archers + t.cavalry + hk + sa + ml + le + cle;
  const stages = ["\u2714 None", "\u26A0 Stage 1", "\u26A0 Stage 2", "\xA7c Stage 3", "\xA7c Stage 4"];
  const rs = village.resourceStorage ?? { iron: 0, gold: 0, coal: 0, wood: 0, stone: 0, diamonds: 0 };
  const hasStation = village.hasTradeStation ? "\xA7a\u2714 Active" : "\xA7c\u2718 None";
  return [
    `\xA7b${village.name}\xA7r (${village.owner})`,
    `Pop: ${village.population}/${village.housingCapacity}  Prosperity: ${village.prosperity}`,
    `Treasury: ${village.treasury}\u{1F48E}  Food: ${village.foodStorage}\u{1F33E}`,
    `Market Lv${village.marketLevel}  Barracks Lv${village.barracksLevel}`,
    `Troops: ${totalSoldiers} (G:${t.cityGuards} Sp:${t.spearmen} Ar:${t.archers} Ca:${t.cavalry} HK:${hk}${sa > 0 ? ` Sa:${sa}` : ""}${ml > 0 ? ` ML:${ml}` : ""}${le > 0 ? ` Le:${le}` : ""}${cle > 0 ? ` CLE:${cle}` : ""})`,
    `Food Shortage: ${stages[village.foodShortageStage] ?? "Unknown"}`,
    `Weapon Tier: ${village.blacksmith.weaponTier}  Armor Tier: ${village.blacksmith.armorTier}`,
    `Trade Station: ${hasStation}`,
    `Resources: Fe:${rs.iron} Au:${rs.gold} C:${rs.coal} W:${rs.wood} St:${rs.stone} Di:${rs.diamonds}`
  ].join("\n");
}
function updateHousingCapacity(villageId) {
  const village = getVillage(villageId);
  if (!village) return;
  const dim = world7.getDimension(village.location.dimension);
  const loc = village.townHallLocation;
  let beds = 0;
  for (let dx = -VILLAGE_CLAIM_RADIUS; dx <= VILLAGE_CLAIM_RADIUS; dx += 1) {
    for (let dz = -VILLAGE_CLAIM_RADIUS; dz <= VILLAGE_CLAIM_RADIUS; dz += 1) {
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
  return getAllKingdoms().find(
    (k) => k.king === playerName || k.villageIds.some((vid) => {
      const v = getVillage(vid);
      return v?.owner === playerName;
    })
  );
}

// src/systems/commands.ts
init_kingdom();

// src/systems/military.ts
init_types();
init_storage();
init_tick();
init_notify();
init_bandit();
var ELITE_TYPES = /* @__PURE__ */ new Set(["samurai", "mercenaryLancer", "legionary", "cavalryLancerElite"]);
var RECRUIT_COSTS = {
  cityGuards: 6,
  spearmen: 10,
  archers: 10,
  cavalry: 16,
  heavyKnight: 25,
  samurai: 42,
  mercenaryLancer: 36,
  legionary: 36,
  cavalryLancerElite: 55
};
function recruitTroop(village, type, count = 1) {
  if (type === "heavyKnight" && village.barracksLevel < 3) {
    notifyPlayer(village.owner, `\xA7cHeavy Knights require \xA7bBarracks Level 3\xA7c (currently Lv${village.barracksLevel}).`);
    return false;
  }
  if (ELITE_TYPES.has(type)) {
    if (!village.hasCastle) {
      notifyPlayer(village.owner, `\xA7cElite troops require a \xA7bCastle\xA7c built in this village.`);
      return false;
    }
    const playerVillageCount = getAllVillages().filter((v) => v.owner === village.owner).length;
    if (playerVillageCount < 3) {
      notifyPlayer(
        village.owner,
        `\xA7cElite troops require \xA7boccupation of 3 villages\xA7c (you have \xA7f${playerVillageCount}\xA7c).`
      );
      return false;
    }
  }
  const costEach = RECRUIT_COSTS[type];
  const totalCost = costEach * count;
  const availableWorkers = village.population - village.troops.cityGuards - village.troops.spearmen - village.troops.archers - village.troops.cavalry - (village.troops.heavyKnight ?? 0) - (village.troops.samurai ?? 0) - (village.troops.mercenaryLancer ?? 0) - (village.troops.legionary ?? 0) - (village.troops.cavalryLancerElite ?? 0) - village.workers.farmers - village.workers.workers;
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
  const hk = village.troops.heavyKnight ?? 0;
  const sa = village.troops.samurai ?? 0;
  const ml = village.troops.mercenaryLancer ?? 0;
  const le = village.troops.legionary ?? 0;
  const cle = village.troops.cavalryLancerElite ?? 0;
  const totalWages = village.troops.cityGuards * TROOP_WAGES.cityGuards + village.troops.spearmen * TROOP_WAGES.spearmen + village.troops.archers * TROOP_WAGES.archers + village.troops.cavalry * TROOP_WAGES.cavalry + hk * TROOP_WAGES.heavyKnight + sa * TROOP_WAGES.samurai + ml * TROOP_WAGES.mercenaryLancer + le * TROOP_WAGES.legionary + cle * TROOP_WAGES.cavalryLancerElite;
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
  const keys = ["cityGuards", "spearmen", "archers", "cavalry", "heavyKnight", "samurai", "mercenaryLancer", "legionary", "cavalryLancerElite"];
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
  return village.troops.cityGuards + village.troops.spearmen + village.troops.archers + village.troops.cavalry + (village.troops.heavyKnight ?? 0) + (village.troops.samurai ?? 0) + (village.troops.mercenaryLancer ?? 0) + (village.troops.legionary ?? 0) + (village.troops.cavalryLancerElite ?? 0);
}
function processAllWages() {
  for (const village of getAllVillages()) {
    tickWages(village);
  }
}

// src/systems/conquest.ts
init_storage();
init_tick();
init_notify();
init_kingdom();
import { world as world10 } from "@minecraft/server";

// src/systems/watchtower.ts
init_types();
init_storage();
init_tick();
init_notify();
import { world as world8 } from "@minecraft/server";
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
  const BANDIT_TYPE_IDS = /* @__PURE__ */ new Set([
    "kingdoms:bandit",
    "kingdoms:deserter",
    "kingdoms:city_guard",
    "kingdoms:spearman",
    "kingdoms:archer",
    "kingdoms:cavalry",
    "kingdoms:heavy_knight",
    "kingdoms:samurai",
    "kingdoms:mercenary_lancer",
    "kingdoms:legionary",
    "kingdoms:cavalry_lancer_elite"
  ]);
  for (const entity of nearby) {
    if (BANDIT_TYPE_IDS.has(entity.typeId) && !entity.getDynamicProperty("kc:village_id")) {
      const alertKey = `${village.id}:bandits`;
      const lastAlert = lastAlertedThreat.get(alertKey) ?? 0;
      if (currentTick - lastAlert >= THREAT_ALERT_COOLDOWN) {
        const d = Math.round(distance(entity.location, tower.location));
        notifyAlert(village.owner, `\xA7c\u26A0 Watchtower detected hostiles near \xA7b${village.name}\xA7c! (${d}m away)`);
        lastAlertedThreat.set(alertKey, currentTick);
      }
      return;
    }
    if (entity.typeId === "minecraft:player") {
      const playerEntity = world8.getPlayers().find((p) => p.id === entity.id);
      if (!playerEntity) continue;
      const playerName = playerEntity.name;
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
init_notify();
import { ItemStack as ItemStack2, EntityInventoryComponent as EntityInventoryComponent3, system as system2 } from "@minecraft/server";
var TROOP_TOKEN_MAP = {
  "kingdoms:guard_token": { troopType: "cityGuards", entityId: "kingdoms:city_guard", label: "City Guard" },
  "kingdoms:spearman_token": { troopType: "spearmen", entityId: "kingdoms:spearman", label: "Spearman" },
  "kingdoms:archer_token": { troopType: "archers", entityId: "kingdoms:archer", label: "Archer" },
  "kingdoms:cavalry_token": { troopType: "cavalry", entityId: "kingdoms:cavalry", label: "Cavalry" },
  "kingdoms:heavy_knight_token": { troopType: "heavyKnight", entityId: "kingdoms:heavy_knight", label: "Heavy Knight" },
  "kingdoms:samurai_token": { troopType: "samurai", entityId: "kingdoms:samurai", label: "Samurai" },
  "kingdoms:mercenary_lancer_token": { troopType: "mercenaryLancer", entityId: "kingdoms:mercenary_lancer", label: "Mercenary Lancer" },
  "kingdoms:legionary_token": { troopType: "legionary", entityId: "kingdoms:legionary", label: "Legionary" },
  "kingdoms:cavalry_lancer_elite_token": { troopType: "cavalryLancerElite", entityId: "kingdoms:cavalry_lancer_elite", label: "Cavalry Lancer Elite" }
};
var MOUNTED_ENTITIES = /* @__PURE__ */ new Set(["kingdoms:cavalry", "kingdoms:mercenary_lancer", "kingdoms:cavalry_lancer_elite"]);
var _horseCounter = 0;
function spawnMountedUnit(dim, entityId, offset) {
  const tag = `kc_wh_${_horseCounter++}`;
  const horse = dim.spawnEntity("kingdoms:war_horse", offset);
  horse.addTag(tag);
  horse.addTag("kc_mounting");
  const rider = dim.spawnEntity(entityId, offset);
  system2.runTimeout(() => {
    try {
      horse.runCommandAsync(`replaceitem entity @s slot.saddle 0 minecraft:saddle`);
    } catch {
    }
    try {
      rider.runCommandAsync(`ride @s start_riding @e[tag=${tag},c=1]`);
    } catch {
    }
    try {
      horse.removeTag(tag);
    } catch {
    }
    try {
      horse.removeTag("kc_mounting");
    } catch {
    }
  }, 20);
  return rider;
}
function cleanupOrphanedHorses() {
  const dims = ["overworld", "nether", "the_end"];
  for (const dimId of dims) {
    let dim;
    try {
      dim = world20.getDimension(dimId);
    } catch {
      continue;
    }
    let horses;
    try {
      horses = dim.getEntities({ type: "kingdoms:war_horse" });
    } catch {
      continue;
    }
    if (horses.length === 0) continue;
    const mountedHorseIds = /* @__PURE__ */ new Set();
    for (const riderId of ["kingdoms:cavalry", "kingdoms:mercenary_lancer"]) {
      try {
        for (const rider of dim.getEntities({ type: riderId })) {
          try {
            const vehicle = rider.getVehicle?.();
            if (vehicle) mountedHorseIds.add(vehicle.id);
          } catch {
          }
        }
      } catch {
      }
    }
    for (const horse of horses) {
      try {
        if (!mountedHorseIds.has(horse.id) && !horse.hasTag("kc_mounting")) {
          horse.remove();
        }
      } catch {
      }
    }
  }
}
function pickupTroops(player, village, pickup) {
  const total = pickup.cityGuards + pickup.spearmen + pickup.archers + pickup.cavalry + pickup.heavyKnight + pickup.samurai + pickup.mercenaryLancer + pickup.legionary;
  if (total <= 0) {
    notifyPlayer(player.name, "\xA7cSelect at least one troop to pick up.");
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
  if (pickup.heavyKnight > (village.troops.heavyKnight ?? 0)) {
    notifyPlayer(player.name, `\xA7cNot enough Heavy Knights (have ${village.troops.heavyKnight ?? 0}).`);
    return false;
  }
  if (pickup.samurai > (village.troops.samurai ?? 0)) {
    notifyPlayer(player.name, `\xA7cNot enough Samurai (have ${village.troops.samurai ?? 0}).`);
    return false;
  }
  if (pickup.mercenaryLancer > (village.troops.mercenaryLancer ?? 0)) {
    notifyPlayer(player.name, `\xA7cNot enough Mercenary Lancers (have ${village.troops.mercenaryLancer ?? 0}).`);
    return false;
  }
  if (pickup.legionary > (village.troops.legionary ?? 0)) {
    notifyPlayer(player.name, `\xA7cNot enough Legionaries (have ${village.troops.legionary ?? 0}).`);
    return false;
  }
  const inv = player.getComponent(EntityInventoryComponent3.componentId);
  if (!inv?.container) {
    notifyPlayer(player.name, "\xA7cInventory unavailable.");
    return false;
  }
  const container = inv.container;
  const toGive = [
    { itemId: "kingdoms:guard_token", count: pickup.cityGuards },
    { itemId: "kingdoms:spearman_token", count: pickup.spearmen },
    { itemId: "kingdoms:archer_token", count: pickup.archers },
    { itemId: "kingdoms:cavalry_token", count: pickup.cavalry },
    { itemId: "kingdoms:heavy_knight_token", count: pickup.heavyKnight },
    { itemId: "kingdoms:samurai_token", count: pickup.samurai },
    { itemId: "kingdoms:mercenary_lancer_token", count: pickup.mercenaryLancer },
    { itemId: "kingdoms:legionary_token", count: pickup.legionary }
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
  village.troops.heavyKnight = (village.troops.heavyKnight ?? 0) - pickup.heavyKnight;
  village.troops.samurai = (village.troops.samurai ?? 0) - pickup.samurai;
  village.troops.mercenaryLancer = (village.troops.mercenaryLancer ?? 0) - pickup.mercenaryLancer;
  village.troops.legionary = (village.troops.legionary ?? 0) - pickup.legionary;
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
  notifyPlayer(player.name, `\xA7a\u2694 Picked up: \xA7f${summary}\xA7a from \xA7b${village.name}\xA7a. Right-click any token to deploy!`);
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
  const loc = player.location;
  const dim = player.dimension;
  const parts = [];
  const actuallySpawned = {};
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
        let entity;
        if (MOUNTED_ENTITIES.has(info.entityId)) {
          entity = spawnMountedUnit(dim, info.entityId, offset);
        } else {
          entity = dim.spawnEntity(info.entityId, offset);
        }
        entity.nameTag = `${player.name}'s ${info.label}`;
        entity.setDynamicProperty("kc:owner", player.name);
        spawned++;
      } catch {
        break;
      }
    }
    if (spawned > 0) {
      actuallySpawned[itemId] = spawned;
      parts.push(`${spawned} ${info.label}`);
    }
  }
  if (parts.length === 0) {
    notifyPlayer(player.name, "\xA7cCould not deploy troops (chunk not loaded).");
    return false;
  }
  for (const [itemId, spawnedCount] of Object.entries(actuallySpawned)) {
    let toRemove = spawnedCount;
    for (let i = 0; i < container.size && toRemove > 0; i++) {
      const slot = container.getItem(i);
      if (!slot || slot.typeId !== itemId) continue;
      if (slot.amount <= toRemove) {
        toRemove -= slot.amount;
        container.setItem(i, void 0);
      } else {
        slot.amount -= toRemove;
        container.setItem(i, slot);
        toRemove = 0;
      }
    }
  }
  notifyPlayer(player.name, `\xA7c\u2694 DEPLOYED: \xA7f${parts.join(", ")}\xA7c into battle!`);
  return true;
}
var ENTITY_TO_TOKEN = {
  "kingdoms:city_guard": "kingdoms:guard_token",
  "kingdoms:spearman": "kingdoms:spearman_token",
  "kingdoms:archer": "kingdoms:archer_token",
  "kingdoms:cavalry": "kingdoms:cavalry_token",
  "kingdoms:heavy_knight": "kingdoms:heavy_knight_token",
  "kingdoms:samurai": "kingdoms:samurai_token",
  "kingdoms:mercenary_lancer": "kingdoms:mercenary_lancer_token",
  "kingdoms:legionary": "kingdoms:legionary_token",
  "kingdoms:cavalry_lancer_elite": "kingdoms:cavalry_lancer_elite_token"
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
      const mount = entity.getVehicle?.();
      if (mount) mount.remove();
    } catch {
    }
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
    "kingdoms:cavalry": "cavalry",
    "kingdoms:heavy_knight": "heavyKnight",
    "kingdoms:samurai": "samurai",
    "kingdoms:mercenary_lancer": "mercenaryLancer",
    "kingdoms:legionary": "legionary"
  };
  const loc = village.townHallLocation;
  let total = 0;
  for (const [entityType, troopType] of Object.entries(entityToTroop)) {
    try {
      const entities = dimension.getEntities({ type: entityType, location: loc, maxDistance: 64 });
      for (const entity of entities) {
        if (entity.getDynamicProperty("kc:owner") === attackerName) {
          village.troops[troopType] = (village.troops[troopType] ?? 0) + 1;
          total++;
          try {
            const mount = entity.getVehicle?.();
            if (mount) mount.remove();
          } catch {
          }
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
  const result = {
    cityGuards: 0,
    spearmen: 0,
    archers: 0,
    cavalry: 0,
    heavyKnight: 0,
    samurai: 0,
    mercenaryLancer: 0,
    legionary: 0,
    cavalryLancerElite: 0
  };
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
init_kingdom();
init_notify();
init_types();
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
function loadSiegesFromStorage() {
  for (const village of getAllVillages()) {
    if (!village.activeSiegeData) continue;
    const d = village.activeSiegeData;
    activeSieges.set(village.id, {
      attackerKingdomId: d.attackerKingdomId,
      attackerName: d.attackerName,
      targetVillageId: village.id,
      startTick: d.startTick,
      progress: d.progress,
      offlineTicks: d.offlineTicks
    });
  }
}
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
    progress: 0,
    offlineTicks: 0
  };
  activeSieges.set(targetVillageId, siege);
  persistSiege(target, siege);
  clearBorderIntrusion(attacker.name, targetVillageId);
  notifyPlayer(attacker.name, `\xA7c\u2694 Siege of \xA7b${target.name}\xA7c has begun!`);
  notifyAlert(target.owner, `\xA74\u{1F514} \xA7b${target.name}\xA74 is under siege by \xA7c${attacker.name}\xA74!`);
  notifyVillageUnderSiege(targetVillageId);
  return true;
}
var SIEGE_OFFLINE_ABANDON_TICKS = 600;
function persistSiege(village, siege) {
  village.activeSiegeData = {
    attackerKingdomId: siege.attackerKingdomId,
    attackerName: siege.attackerName,
    startTick: siege.startTick,
    progress: siege.progress,
    offlineTicks: siege.offlineTicks
  };
  saveVillage(village);
}
function clearSiegePersist(village) {
  village.activeSiegeData = void 0;
  saveVillage(village);
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
      siege.offlineTicks++;
      if (siege.offlineTicks >= SIEGE_OFFLINE_ABANDON_TICKS) {
        activeSieges.delete(villageId);
        clearSiegePersist(target);
        notifyPlayer(target.owner, `\xA7aSiege of \xA7b${target.name}\xA7a has been lifted \u2014 attacker went offline.`);
      } else {
        persistSiege(target, siege);
      }
      continue;
    }
    siege.offlineTicks = 0;
    const d = distance(attacker.location, target.townHallLocation);
    if (d <= CAPTURE_PROXIMITY) {
      siege.progress++;
      if (siege.progress >= 600) {
        captureVillage(siege, target);
        activeSieges.delete(villageId);
        clearSiegePersist(target);
      } else {
        if (siege.progress % 100 === 0) {
          const percent = Math.floor(siege.progress / 600 * 100);
          notifyPlayer(siege.attackerName, `\xA76Capturing... ${percent}%`);
          notifyAlert(target.owner, `\xA7cTown Hall being captured! (${percent}%)`);
        }
        persistSiege(target, siege);
      }
    } else if (d > SIEGE_RADIUS * 2) {
      siege.progress = Math.max(0, siege.progress - 2);
      persistSiege(target, siege);
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
    progress: 600,
    offlineTicks: 0
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

// src/systems/commands.ts
init_bandit();

// src/systems/treasury.ts
init_types();
init_storage();
init_notify();
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
  const wages = { cityGuards: 2, spearmen: 3, archers: 3, cavalry: 5, heavyKnight: 8, samurai: 12, mercenaryLancer: 10, legionary: 10 };
  const dailyWages = (village.troops.cityGuards * wages.cityGuards + village.troops.spearmen * wages.spearmen + village.troops.archers * wages.archers + village.troops.cavalry * wages.cavalry + (village.troops.heavyKnight ?? 0) * wages.heavyKnight + (village.troops.samurai ?? 0) * wages.samurai + (village.troops.mercenaryLancer ?? 0) * wages.mercenaryLancer + (village.troops.legionary ?? 0) * wages.legionary) / WAGE_INTERVAL_DAYS;
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
init_types();
init_storage();
init_notify();
import { ItemStack as ItemStack4, EntityInventoryComponent as EntityInventoryComponent5 } from "@minecraft/server";
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
var ARMORY_RECIPES = [
  { key: "woodenSwords", name: "Wooden Swords (\xD75)", produces: 5, costWood: 10, costStone: 0, costIron: 0, costGold: 0, costDiamonds: 0, costEmeralds: 0 },
  { key: "stoneSwords", name: "Stone Swords (\xD75)", produces: 5, costWood: 0, costStone: 10, costIron: 0, costGold: 0, costDiamonds: 0, costEmeralds: 0 },
  { key: "ironSwords", name: "Iron Swords (\xD75)", produces: 5, costWood: 0, costStone: 0, costIron: 10, costGold: 0, costDiamonds: 0, costEmeralds: 1 },
  { key: "goldSwords", name: "Gold Swords (\xD75)", produces: 5, costWood: 0, costStone: 0, costIron: 0, costGold: 10, costDiamonds: 0, costEmeralds: 1 },
  { key: "diamondSwords", name: "Diamond Swords (\xD75)", produces: 5, costWood: 0, costStone: 0, costIron: 0, costGold: 0, costDiamonds: 10, costEmeralds: 2 },
  { key: "ironArmor", name: "Iron Armor Set (helmet+chest+legs+boots)", produces: 1, costWood: 0, costStone: 0, costIron: 24, costGold: 0, costDiamonds: 0, costEmeralds: 2 },
  { key: "goldArmor", name: "Gold Armor Set", produces: 1, costWood: 0, costStone: 0, costIron: 0, costGold: 24, costDiamonds: 0, costEmeralds: 2 },
  { key: "diamondArmor", name: "Diamond Armor Set", produces: 1, costWood: 0, costStone: 0, costIron: 0, costGold: 0, costDiamonds: 24, costEmeralds: 5 }
];
function canCraftArmoryRecipe(village, recipe) {
  const rs = village.resourceStorage;
  return (recipe.costIron === 0 || rs.iron >= recipe.costIron) && (recipe.costGold === 0 || rs.gold >= recipe.costGold) && (recipe.costDiamonds === 0 || rs.diamonds >= recipe.costDiamonds) && (recipe.costWood === 0 || rs.wood >= recipe.costWood) && (recipe.costStone === 0 || rs.stone >= recipe.costStone) && (recipe.costEmeralds === 0 || village.treasury >= recipe.costEmeralds);
}
function craftForArmory(village, recipeIndex, count) {
  if (recipeIndex < 0 || recipeIndex >= ARMORY_RECIPES.length) return false;
  const recipe = ARMORY_RECIPES[recipeIndex];
  const totalIron = recipe.costIron * count;
  const totalGold = recipe.costGold * count;
  const totalDiamonds = recipe.costDiamonds * count;
  const totalWood = recipe.costWood * count;
  const totalStone = recipe.costStone * count;
  const totalEmeralds = recipe.costEmeralds * count;
  const rs = village.resourceStorage;
  if (totalIron > 0 && rs.iron < totalIron) {
    notifyPlayer(village.owner, `\xA7cNeed ${totalIron} iron (have ${rs.iron}).`);
    return false;
  }
  if (totalGold > 0 && rs.gold < totalGold) {
    notifyPlayer(village.owner, `\xA7cNeed ${totalGold} gold (have ${rs.gold}).`);
    return false;
  }
  if (totalDiamonds > 0 && rs.diamonds < totalDiamonds) {
    notifyPlayer(village.owner, `\xA7cNeed ${totalDiamonds} diamonds (have ${rs.diamonds}).`);
    return false;
  }
  if (totalWood > 0 && rs.wood < totalWood) {
    notifyPlayer(village.owner, `\xA7cNeed ${totalWood} wood (have ${rs.wood}).`);
    return false;
  }
  if (totalStone > 0 && rs.stone < totalStone) {
    notifyPlayer(village.owner, `\xA7cNeed ${totalStone} stone (have ${rs.stone}).`);
    return false;
  }
  if (totalEmeralds > 0 && village.treasury < totalEmeralds) {
    notifyPlayer(village.owner, `\xA7cNeed ${totalEmeralds}\u{1F48E} (treasury: ${village.treasury}).`);
    return false;
  }
  rs.iron -= totalIron;
  rs.gold -= totalGold;
  rs.diamonds -= totalDiamonds;
  rs.wood -= totalWood;
  rs.stone -= totalStone;
  village.treasury -= totalEmeralds;
  if (!village.armory) village.armory = {};
  const prev = village.armory[recipe.key] ?? 0;
  village.armory[recipe.key] = prev + recipe.produces * count;
  saveVillage(village);
  const total = recipe.produces * count;
  notifyPlayer(
    village.owner,
    `\xA7a\u2692 Crafted \xA7b${total}x ${recipe.name}\xA7a \u2192 stored in \xA7b${village.name}\xA7a armory. (Total: \xA7f${village.armory[recipe.key]}\xA7a)`
  );
  return true;
}
function getArmorySummary(village) {
  const armory = village.armory ?? {};
  const entries = Object.entries(armory).filter(([, v]) => (v ?? 0) > 0);
  if (entries.length === 0) return "\xA77Armory is empty.";
  const labels = {
    woodenSwords: "Wooden Swords",
    stoneSwords: "Stone Swords",
    ironSwords: "Iron Swords",
    goldSwords: "Gold Swords",
    diamondSwords: "Diamond Swords",
    ironArmor: "Iron Armor Sets",
    goldArmor: "Gold Armor Sets",
    diamondArmor: "Diamond Armor Sets"
  };
  return entries.map(([k, v]) => `  \xA7f${v}x \xA77${labels[k] ?? k}`).join("\n");
}
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
  const totalSoldiers = village.troops.cityGuards + village.troops.spearmen + village.troops.archers + village.troops.cavalry + (village.troops.heavyKnight ?? 0) + (village.troops.samurai ?? 0) + (village.troops.mercenaryLancer ?? 0) + (village.troops.legionary ?? 0) + (village.troops.cavalryLancerElite ?? 0);
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
  const totalSoldiers = village.troops.cityGuards + village.troops.spearmen + village.troops.archers + village.troops.cavalry + (village.troops.heavyKnight ?? 0) + (village.troops.samurai ?? 0) + (village.troops.mercenaryLancer ?? 0) + (village.troops.legionary ?? 0) + (village.troops.cavalryLancerElite ?? 0);
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
  const soldiers = village.troops.cityGuards + village.troops.spearmen + village.troops.archers + village.troops.cavalry + (village.troops.heavyKnight ?? 0) + (village.troops.samurai ?? 0) + (village.troops.mercenaryLancer ?? 0) + (village.troops.legionary ?? 0) + (village.troops.cavalryLancerElite ?? 0);
  const rs = village.resourceStorage;
  return [
    `\xA7b${village.name} Blacksmith\xA7r`,
    `Weapon Tier: \xA7a${wt}\xA7r ${nextWT ? `\u2192 ${nextWT}` : "(MAX)"}`,
    `Armor Tier: \xA7a${at}\xA7r ${nextAT ? `\u2192 ${nextAT}` : "(MAX)"}`,
    soldiers > 0 && wCost ? `Weapon upgrade cost: ${wCost.materialCount * soldiers}x ${wCost.material.replace("minecraft:", "")} + ${wCost.emeralds * soldiers}\u{1F48E}` : "",
    soldiers > 0 && aCost ? `Armor upgrade cost: ${aCost.materialCount * soldiers}x ${aCost.material.replace("minecraft:", "")} + ${aCost.emeralds * soldiers}\u{1F48E}` : "",
    `
\xA77\u2500\u2500 Storage \u2500\u2500
Iron: \xA7f${rs.iron}\xA77  Gold: \xA7f${rs.gold}\xA77  Diamonds: \xA7f${rs.diamonds}\xA77  Wood: \xA7f${rs.wood}\xA77  Stone: \xA7f${rs.stone}`,
    `\xA77\u2500\u2500 Armory \u2500\u2500`,
    getArmorySummary(village)
  ].filter(Boolean).join("\n");
}

// src/systems/commands.ts
init_notify();
init_playerSettings();
var TROOP_TYPES = ["cityGuards", "spearmen", "archers", "cavalry", "heavyKnight", "samurai", "mercenaryLancer", "legionary"];
function registerCommands() {
  system3.afterEvents.scriptEventReceive.subscribe(
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
    default:
      notifyPlayer(player.name, `\xA7cUnknown /kc command: "${subcommand}". Use /scriptevent kc:help`);
  }
}
function showHelp(player) {
  const lines = [
    "\xA7b=== Kingdoms & Conquest Commands ===\xA7r",
    "\xA7e/scriptevent kc:help\xA7r \u2014 this list",
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
    "\xA77Troop types: cityGuards, spearmen, archers, cavalry"
  ];
  for (const line of lines) notifyPlayer(player.name, line);
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
  const available = village.population - village.troops.cityGuards - village.troops.spearmen - village.troops.archers - village.troops.cavalry - (village.troops.heavyKnight ?? 0) - (village.troops.samurai ?? 0) - (village.troops.mercenaryLancer ?? 0) - (village.troops.legionary ?? 0);
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
  s("\xA7f  \u2022 Craft/obtain a \xA7bkingdoms:town_hall\xA7f block.");
  s("\xA7f  \u2022 Place it anywhere in the world.");
  s("\xA7f  \u2022 A form appears \u2014 enter your Kingdom Name and Village Name.");
  s("\xA7f  \u2022 Your kingdom is now created. The Town Hall block is your village hub.");
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
init_types();
init_storage();
init_tick();
init_notify();
init_kingdom();
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
  return village.workers.farmers * 4;
}
function getFoodConsumption(village) {
  const totalSoldiers = village.troops.cityGuards + village.troops.spearmen + village.troops.archers + village.troops.cavalry + (village.troops.heavyKnight ?? 0) + (village.troops.samurai ?? 0) + (village.troops.mercenaryLancer ?? 0) + (village.troops.legionary ?? 0);
  const civilians = Math.max(0, village.population - totalSoldiers);
  return civilians * FOOD_PER_VILLAGER_PER_DAY;
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
        notifyAlliedKings(
          village.kingdomId,
          `\xA74\u26A0 Allied village \xA7b${village.name}\xA74 is suffering FAMINE!`
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
  const costPerUnit = 3;
  const total = amount * costPerUnit;
  if (village.treasury < total) return false;
  village.treasury -= total;
  village.foodStorage += amount;
  saveVillage(village);
  notifyPlayer(village.owner, `\xA7aBought ${amount} food for ${total}\u{1F48E} in \xA7b${village.name}\xA7a.`);
  return true;
}
function sellFood(village, amount) {
  const sellPricePerUnit = 2;
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
init_types();
init_storage();
init_tick();
init_notify();
init_notify();
import { world as world11 } from "@minecraft/server";
var GROWTH_CHANCE = 0.6;
var MORTALITY_CHANCE = 0.4;
var HOUSING_UNIT_SIZE = 5;
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
    checkAndGrowStructures(village);
  }
  spawnVillagerEntity(village);
}
function handlePopulationDecline(village) {
  if (village.population > 1 && Math.random() < MORTALITY_CHANCE) {
    village.population -= 1;
    const totalSoldiers = village.troops.cityGuards + village.troops.spearmen + village.troops.archers + village.troops.cavalry + (village.troops.heavyKnight ?? 0) + (village.troops.samurai ?? 0) + (village.troops.mercenaryLancer ?? 0) + (village.troops.legionary ?? 0);
    if (village.population < totalSoldiers + village.workers.farmers + village.workers.workers) {
      if (village.troops.cityGuards > 0) village.troops.cityGuards--;
      else if (village.troops.spearmen > 0) village.troops.spearmen--;
      else if (village.troops.archers > 0) village.troops.archers--;
      else if (village.troops.cavalry > 0) village.troops.cavalry--;
      else if ((village.troops.heavyKnight ?? 0) > 0) village.troops.heavyKnight--;
      else if ((village.troops.samurai ?? 0) > 0) village.troops.samurai--;
      else if ((village.troops.mercenaryLancer ?? 0) > 0) village.troops.mercenaryLancer--;
      else if ((village.troops.legionary ?? 0) > 0) village.troops.legionary--;
      else if (village.workers.workers > 0) village.workers.workers--;
      else if (village.workers.farmers > 0) village.workers.farmers--;
    }
    notifyPlayer(
      village.owner,
      `\xA7cPopulation declined in \xA7b${village.name}\xA7c due to starvation! (${village.population})`
    );
    if (village.population < 5 && village.population > 0) {
      sendCrisisTitle(
        village.owner,
        "\xA7c\xA7lVILLAGE DYING",
        `\xA7e${village.name} \u2014 only ${village.population} citizens left!`,
        "mob.villager.death"
      );
    }
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
  let villagerCount = 0;
  try {
    const nearby = dim.getEntities({
      type: "minecraft:villager_v2",
      location: { x: loc.x, y: loc.y, z: loc.z },
      maxDistance: 64
    });
    for (const e of nearby) {
      try {
        if (e.getDynamicProperty("kc:village_id") === village.id) villagerCount++;
      } catch {
      }
    }
  } catch {
    return;
  }
  if (villagerCount < village.population) {
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
init_notify();
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
  }
};
var SEED_PURCHASE_MATERIALS = [];
var SEED_SHOP = [
  // ── Vanilla Seeds ──────────────────────────────────────────────────────────
  { itemId: "minecraft:wheat_seeds", label: "Wheat Seeds", quantityPerPurchase: 16, emeraldCost: 1 },
  { itemId: "minecraft:carrot", label: "Carrots", quantityPerPurchase: 16, emeraldCost: 1 },
  { itemId: "minecraft:potato", label: "Potatoes", quantityPerPurchase: 16, emeraldCost: 1 },
  { itemId: "minecraft:beetroot_seeds", label: "Beetroot Seeds", quantityPerPurchase: 16, emeraldCost: 1 },
  { itemId: "minecraft:pumpkin_seeds", label: "Pumpkin Seeds", quantityPerPurchase: 12, emeraldCost: 1 },
  { itemId: "minecraft:melon_seeds", label: "Melon Seeds", quantityPerPurchase: 12, emeraldCost: 1 },
  { itemId: "minecraft:nether_wart", label: "Nether Wart", quantityPerPurchase: 8, emeraldCost: 2 },
  // ── Bob's Farming Crops (twb_farm) ─────────────────────────────────────────
  { itemId: "twb_farm:garlic", label: "\u{1F9C4} Garlic", quantityPerPurchase: 8, emeraldCost: 2 },
  { itemId: "twb_farm:onion", label: "\u{1F9C5} Onion", quantityPerPurchase: 8, emeraldCost: 2 },
  { itemId: "twb_farm:rice", label: "\u{1F33E} Rice", quantityPerPurchase: 8, emeraldCost: 2 },
  { itemId: "twb_farm:broccoli", label: "\u{1F966} Broccoli", quantityPerPurchase: 8, emeraldCost: 2 },
  { itemId: "twb_farm:cauliflower", label: "\u{1F96C} Cauliflower", quantityPerPurchase: 8, emeraldCost: 2 },
  { itemId: "twb_farm:chili", label: "\u{1F336} Chili", quantityPerPurchase: 8, emeraldCost: 2 },
  { itemId: "twb_farm:eggplant", label: "\u{1F346} Eggplant", quantityPerPurchase: 8, emeraldCost: 2 },
  { itemId: "twb_farm:leek", label: "\u{1F33F} Leek", quantityPerPurchase: 8, emeraldCost: 2 },
  { itemId: "twb_farm:grape", label: "\u{1F347} Grape", quantityPerPurchase: 8, emeraldCost: 3 },
  { itemId: "twb_farm:pineapple", label: "\u{1F34D} Pineapple", quantityPerPurchase: 8, emeraldCost: 3 }
];
var FOOD_SELL_RATES = [
  { itemId: "minecraft:wheat", label: "Wheat", itemsPerEmerald: 5, minBatch: 10 },
  { itemId: "minecraft:carrot", label: "Carrot", itemsPerEmerald: 4, minBatch: 8 },
  { itemId: "minecraft:potato", label: "Potato", itemsPerEmerald: 5, minBatch: 10 },
  { itemId: "minecraft:baked_potato", label: "Baked Potato", itemsPerEmerald: 3, minBatch: 6 },
  { itemId: "minecraft:bread", label: "Bread", itemsPerEmerald: 2, minBatch: 4 },
  { itemId: "minecraft:beetroot", label: "Beetroot", itemsPerEmerald: 6, minBatch: 12 },
  { itemId: "minecraft:apple", label: "Apple", itemsPerEmerald: 4, minBatch: 8 },
  { itemId: "minecraft:cooked_beef", label: "Cooked Beef", itemsPerEmerald: 1, minBatch: 2 },
  { itemId: "minecraft:cooked_porkchop", label: "Cooked Pork", itemsPerEmerald: 1, minBatch: 2 },
  { itemId: "minecraft:cooked_chicken", label: "Cooked Chicken", itemsPerEmerald: 2, minBatch: 4 },
  { itemId: "minecraft:cooked_mutton", label: "Cooked Mutton", itemsPerEmerald: 2, minBatch: 4 },
  { itemId: "minecraft:cooked_salmon", label: "Cooked Salmon", itemsPerEmerald: 2, minBatch: 4 },
  { itemId: "minecraft:melon_slice", label: "Melon Slice", itemsPerEmerald: 6, minBatch: 12 }
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
function spawnMerchant(village) {
  const dim = world12.getDimension(village.location.dimension);
  const loc = village.townHallLocation;
  const templates = Object.keys(MERCHANT_STOCK_TEMPLATES);
  const templateKey = templates[Math.floor(Math.random() * templates.length)];
  const stock = { ...MERCHANT_STOCK_TEMPLATES[templateKey] };
  const angle = Math.random() * Math.PI * 2;
  const distance2 = MERCHANT_OUTER_SPAWN_MIN + Math.random() * (MERCHANT_OUTER_SPAWN_MAX - MERCHANT_OUTER_SPAWN_MIN);
  try {
    const entity = dim.spawnEntity("kingdoms:merchant", {
      x: loc.x + Math.cos(angle) * distance2,
      y: loc.y,
      z: loc.z + Math.sin(angle) * distance2
    });
    const merchantData = {
      entityId: entity.id,
      stock,
      destinationVillageId: village.id,
      currentPoleIndex: 0
    };
    entity.setDynamicProperty("kc:merchant_data", JSON.stringify(merchantData));
    entity.setDynamicProperty("kc:village_id", village.id);
    entity.nameTag = `\xA76Merchant \xA77[${village.name}]`;
    village.activeMerchants.push(merchantData);
    saveVillage(village);
    notifyPlayer(
      village.owner,
      `\xA76A merchant has set out for \xA7b${village.name}\xA76! (${Math.round(distance2)} blocks away, Stock: ${Object.keys(stock).length} types)`
    );
  } catch {
  }
}
function tickMerchantMovement(village) {
  const dim = world12.getDimension(village.location.dimension);
  const poles = village.tradePoles;
  const townHall = village.townHallLocation;
  let changed = false;
  for (const merchantData of village.activeMerchants) {
    try {
      const entities = dim.getEntities({ type: "kingdoms:merchant" });
      const entity = entities.find((e) => e.id === merchantData.entityId);
      if (!entity) continue;
      const loc = entity.location;
      let target;
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
            notifyPlayer(village.owner, `\xA7c\u26A0 A merchant heading to \xA7b${village.name}\xA7c is under mob attack! (${Math.round(dist2D)} blocks out)`);
          }
        }
      } catch {
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
  const totalRemaining = Object.values(merchant.stock).reduce((a, b) => a + b, 0);
  if (totalRemaining <= 0) {
    removeMerchant(village, merchantEntityId);
  } else {
    saveVillage(village);
  }
  return true;
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
    "minecraft:iron_ingot": 3,
    "minecraft:gold_ingot": 5,
    "minecraft:diamond": 12,
    "minecraft:coal": 2,
    "minecraft:bread": 2,
    "minecraft:cooked_beef": 2,
    "minecraft:apple": 1
  };
  return prices[itemTypeId] ?? 3;
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
function countItem(container, itemId) {
  let total = 0;
  for (let i = 0; i < container.size; i++) {
    const slot = container.getItem(i);
    if (slot?.typeId === itemId) total += slot.amount;
  }
  return total;
}
function removeItems(container, itemId, amount) {
  let toRemove = amount;
  for (let i = 0; i < container.size && toRemove > 0; i++) {
    const slot = container.getItem(i);
    if (!slot || slot.typeId !== itemId) continue;
    const take = Math.min(slot.amount, toRemove);
    toRemove -= take;
    if (take >= slot.amount) container.setItem(i, void 0);
    else {
      slot.amount -= take;
      container.setItem(i, slot);
    }
  }
}
function buySeedsFromMarket(player, village, entry) {
  if (village.marketLevel < 1) {
    notifyPlayer(player.name, "\xA7cBuild and upgrade the market first.");
    return false;
  }
  const inv = player.getComponent(EntityInventoryComponent6.componentId);
  if (!inv?.container) return false;
  const container = inv.container;
  const emeraldsHeld = countItem(container, "minecraft:emerald");
  if (emeraldsHeld < entry.emeraldCost) {
    notifyPlayer(player.name, `\xA7cNeed \xA76${entry.emeraldCost} emeralds\xA7c (you have ${emeraldsHeld}).`);
    return false;
  }
  const missing = [];
  for (const mat of SEED_PURCHASE_MATERIALS) {
    if (countItem(container, mat.itemId) < mat.amount) {
      missing.push(`\xA7e${mat.label}`);
    }
  }
  if (missing.length > 0) {
    notifyPlayer(player.name, `\xA7cAlso need: ${missing.join("\xA7c, ")}`);
    return false;
  }
  removeItems(container, "minecraft:emerald", entry.emeraldCost);
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
  if (remaining > 0) notifyPlayer(player.name, "\xA7cInventory full \u2014 some seeds couldn't be delivered.");
  notifyPlayer(
    player.name,
    `\xA7aBought \xA7b${entry.quantityPerPurchase - remaining}x ${entry.label}\xA7a for \xA76${entry.emeraldCost} emerald(s)\xA7a.`
  );
  return true;
}
function sellFoodBulk(player, village, entry, batches) {
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

// src/main.ts
init_bandit();
init_villageAlerts();

// src/systems/trade.ts
init_storage();
init_notify();
import { world as world13, EntityInventoryComponent as EntityInventoryComponent7 } from "@minecraft/server";

// src/systems/tradeStation.ts
init_types();
init_storage();
init_notify();
function registerTradeStation(village, location) {
  village.hasTradeStation = true;
  village.tradeStationLocation = { x: location.x, y: location.y, z: location.z };
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
  if ((troops.heavyKnight ?? 0) > (from.troops.heavyKnight ?? 0)) {
    notifyPlayer(from.owner, `\xA7cNot enough Heavy Knights.`);
    return false;
  }
  if ((troops.samurai ?? 0) > (from.troops.samurai ?? 0)) {
    notifyPlayer(from.owner, `\xA7cNot enough Samurai.`);
    return false;
  }
  if ((troops.mercenaryLancer ?? 0) > (from.troops.mercenaryLancer ?? 0)) {
    notifyPlayer(from.owner, `\xA7cNot enough Mercenary Lancers.`);
    return false;
  }
  if ((troops.legionary ?? 0) > (from.troops.legionary ?? 0)) {
    notifyPlayer(from.owner, `\xA7cNot enough Legionaries.`);
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
  from.troops.heavyKnight = (from.troops.heavyKnight ?? 0) - (troops.heavyKnight ?? 0);
  from.troops.samurai = (from.troops.samurai ?? 0) - (troops.samurai ?? 0);
  from.troops.mercenaryLancer = (from.troops.mercenaryLancer ?? 0) - (troops.mercenaryLancer ?? 0);
  from.troops.legionary = (from.troops.legionary ?? 0) - (troops.legionary ?? 0);
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
    from.troops.heavyKnight = (from.troops.heavyKnight ?? 0) + (troops.heavyKnight ?? 0);
    from.troops.samurai = (from.troops.samurai ?? 0) + (troops.samurai ?? 0);
    from.troops.mercenaryLancer = (from.troops.mercenaryLancer ?? 0) + (troops.mercenaryLancer ?? 0);
    from.troops.legionary = (from.troops.legionary ?? 0) + (troops.legionary ?? 0);
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
        const dx = cart.location.x - stationLoc.x;
        const dy = cart.location.y - stationLoc.y;
        const dz = cart.location.z - stationLoc.z;
        if (dx * dx + dy * dy + dz * dz <= 4) {
          if (extractUntaggedMinecart(cart, village)) changed = true;
        }
      }
    } else {
      const dx = cart.location.x - stationLoc.x;
      const dy = cart.location.y - stationLoc.y;
      const dz = cart.location.z - stationLoc.z;
      if (dx * dx + dy * dy + dz * dz <= 4) {
        if (extractUntaggedMinecart(cart, village)) changed = true;
      }
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
init_notify();
var TRAINING_COSTS = {
  cityGuards: { emeralds: 2, iron: 4, gold: 0, diamonds: 0 },
  spearmen: { emeralds: 3, iron: 6, gold: 0, diamonds: 0 },
  archers: { emeralds: 3, iron: 5, gold: 2, diamonds: 0 },
  cavalry: { emeralds: 6, iron: 8, gold: 3, diamonds: 0 },
  heavyKnight: { emeralds: 10, iron: 12, gold: 5, diamonds: 2 },
  samurai: { emeralds: 20, iron: 15, gold: 8, diamonds: 5 },
  mercenaryLancer: { emeralds: 18, iron: 12, gold: 6, diamonds: 4 },
  legionary: { emeralds: 18, iron: 12, gold: 6, diamonds: 4 },
  cavalryLancerElite: { emeralds: 25, iron: 15, gold: 10, diamonds: 8 }
};
var TRAINING_TICKS = {
  cityGuards: 1200,
  spearmen: 1800,
  archers: 1600,
  cavalry: 2400,
  heavyKnight: 6e3,
  samurai: 9e3,
  mercenaryLancer: 8e3,
  legionary: 8e3,
  cavalryLancerElite: 10e3
};
var TROOP_LABELS = {
  cityGuards: "City Guard",
  spearmen: "Spearman",
  archers: "Archer",
  cavalry: "Cavalry",
  heavyKnight: "Heavy Knight",
  samurai: "Samurai",
  mercenaryLancer: "Mercenary Lancer",
  legionary: "Legionary",
  cavalryLancerElite: "Cavalry Lancer Elite"
};
var ELITE_TROOP_TYPES = ["samurai", "mercenaryLancer", "legionary", "cavalryLancerElite"];
var MAX_QUEUE_SIZE = 10;
function canAffordTraining(village, troopType, count) {
  const cost = TRAINING_COSTS[troopType];
  const rs = village.resourceStorage;
  if (village.treasury < cost.emeralds * count) {
    return `\xA7cNeed \xA7f${cost.emeralds * count} emeralds\xA7c in treasury (have \xA7f${village.treasury}\xA7c).`;
  }
  if (rs.iron < cost.iron * count) {
    return `\xA7cNeed \xA7f${cost.iron * count} iron\xA7c in storage (have \xA7f${rs.iron}\xA7c).`;
  }
  if (cost.gold > 0 && rs.gold < cost.gold * count) {
    return `\xA7cNeed \xA7f${cost.gold * count} gold\xA7c in storage (have \xA7f${rs.gold}\xA7c).`;
  }
  if (cost.diamonds > 0 && rs.diamonds < cost.diamonds * count) {
    return `\xA7cNeed \xA7f${cost.diamonds * count} diamonds\xA7c in storage (have \xA7f${rs.diamonds}\xA7c).`;
  }
  return null;
}
function queueTraining(village, troopType, count, currentTick, playerVillageCount = 0) {
  if (village.trainingQueue.length >= MAX_QUEUE_SIZE) {
    notifyPlayer(village.owner, `\xA7cTraining queue is full (max ${MAX_QUEUE_SIZE} jobs).`);
    return false;
  }
  if (troopType === "heavyKnight" && village.barracksLevel < 3) {
    notifyPlayer(village.owner, `\xA7cHeavy Knights require \xA7bBarracks Level 3+\xA7c (currently Lv${village.barracksLevel}).`);
    return false;
  }
  if (ELITE_TROOP_TYPES.includes(troopType)) {
    if (!village.hasCastle) {
      notifyPlayer(village.owner, `\xA7cElite troops require a \xA7bCastle\xA7c built in this village.`);
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
  const lastJobEnd = village.trainingQueue.length > 0 ? village.trainingQueue[village.trainingQueue.length - 1].completeTick : currentTick;
  const job = {
    troopType,
    count,
    completeTick: Math.max(lastJobEnd, currentTick) + ticksNeeded
  };
  village.trainingQueue.push(job);
  saveVillage(village);
  const label = TROOP_LABELS[troopType];
  const costStr = [
    `${cost.emeralds * count} emeralds`,
    cost.iron * count > 0 ? `${cost.iron * count} iron` : "",
    cost.gold * count > 0 ? `${cost.gold * count} gold` : "",
    cost.diamonds * count > 0 ? `${cost.diamonds * count} diamonds` : ""
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
      village.troops[job.troopType] = (village.troops[job.troopType] ?? 0) + job.count;
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
init_types();
init_storage();
init_notify();
init_tick();
init_kingdom();
import { world as world14 } from "@minecraft/server";
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
  heavyKnight: "kingdoms:heavy_knight",
  samurai: "kingdoms:samurai",
  mercenaryLancer: "kingdoms:mercenary_lancer",
  legionary: "kingdoms:legionary",
  cavalryLancerElite: "kingdoms:cavalry_lancer_elite"
};
var TROOP_PRIORITY = ["cavalryLancerElite", "samurai", "mercenaryLancer", "legionary", "heavyKnight", "spearmen", "archers", "cavalry", "cityGuards"];
function tickAutoDefense(currentTick) {
  if (currentTick % THREAT_SCAN_INTERVAL !== 0) return;
  for (const village of getAllVillages()) {
    if (!village.owner) continue;
    scanVillageThreat(village, currentTick);
  }
}
function scanVillageThreat(village, currentTick) {
  const dim = world14.getDimension(village.location.dimension);
  const center = village.townHallLocation;
  let threatCount = 0;
  let playerRaider = null;
  try {
    const hostiles = dim.getEntities({
      location: center,
      maxDistance: VILLAGE_CLAIM_RADIUS,
      families: ["monster"]
    });
    threatCount += hostiles.length;
  } catch {
  }
  for (const p of world14.getPlayers()) {
    if (p.name === village.owner) continue;
    const theirKingdom = getKingdomOf(p.name);
    if (!theirKingdom) continue;
    if (!areAtWar(village.kingdomId, theirKingdom.id)) continue;
    if (distance(p.location, center) <= VILLAGE_CLAIM_RADIUS) {
      threatCount++;
      if (!playerRaider) playerRaider = p.name;
    }
  }
  if (playerRaider) {
    const key = `${village.id}:player`;
    const last = lastRaidNotify.get(key) ?? 0;
    if (currentTick - last > RAID_NOTIFY_COOLDOWN) {
      notifyAlert(village.owner, `\xA7c\u{1F514} RAID ALERT! \xA7f${playerRaider}\xA7c has entered \xA7b${village.name}\xA7c!`);
      notifyAlliedKings(
        village.kingdomId,
        `\xA7c\u{1F514} Allied village \xA7b${village.name}\xA7c is being raided by \xA7f${playerRaider}\xA7c!`
      );
      lastRaidNotify.set(key, currentTick);
    }
  }
  if (threatCount === 0) {
    recallAutoDispatched(village);
    return;
  }
  if (threatCount > 0) {
    const key = `${village.id}:mob`;
    const last = lastRaidNotify.get(key) ?? 0;
    if (currentTick - last > RAID_NOTIFY_COOLDOWN) {
      notifyAlert(village.owner, `\xA7c\u2694 \xA7b${village.name}\xA7c is under attack! (${threatCount} threat${threatCount > 1 ? "s" : ""} nearby)`);
      lastRaidNotify.set(key, currentTick);
    }
  }
  dispatchTroops(village, threatCount);
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
function dispatchTroops(village, threatCount) {
  const totalBarracks = village.troops.cityGuards + village.troops.spearmen + village.troops.archers + village.troops.cavalry + (village.troops.heavyKnight ?? 0) + (village.troops.samurai ?? 0) + (village.troops.mercenaryLancer ?? 0) + (village.troops.legionary ?? 0);
  if (totalBarracks <= 0) return;
  const alreadyOut = countAutoDispatched(village);
  const needed = Math.min(threatCount * 2, totalBarracks) - alreadyOut;
  if (needed <= 0) return;
  const dim = world14.getDimension(village.location.dimension);
  const center = village.townHallLocation;
  let dispatched = 0;
  for (const troopType of TROOP_PRIORITY) {
    if (dispatched >= needed) break;
    if ((village.troops[troopType] ?? 0) <= 0) continue;
    const toSend = Math.min(village.troops[troopType] ?? 0, needed - dispatched);
    village.troops[troopType] -= toSend;
    for (let i = 0; i < toSend; i++) {
      try {
        const angle = Math.random() * Math.PI * 2;
        const r = 6 + Math.random() * 12;
        const offset = {
          x: center.x + Math.cos(angle) * r,
          y: center.y,
          z: center.z + Math.sin(angle) * r
        };
        const entityId = TROOP_ENTITY_MAP[troopType];
        const entity = MOUNTED_ENTITIES.has(entityId) ? spawnMountedUnit(dim, entityId, offset) : dim.spawnEntity(entityId, offset);
        entity.setDynamicProperty(AUTO_DISPATCH_PROP, village.id);
        entity.setDynamicProperty(AUTO_TROOP_TYPE_PROP, troopType);
        entity.nameTag = `\u2694 [${village.name}]`;
        dispatched++;
      } catch {
      }
    }
  }
  if (dispatched > 0) {
    saveVillage(village);
    notifyPlayer(village.owner, `\xA7e\u2694 ${dispatched} troop${dispatched > 1 ? "s" : ""} auto-dispatched to defend \xA7b${village.name}\xA7e!`);
  }
}
function recallAutoDispatched(village) {
  const dim = world14.getDimension(village.location.dimension);
  const center = village.townHallLocation;
  const survivors = {};
  let recalled = 0;
  const RECALL_RADIUS2 = VILLAGE_CLAIM_RADIUS * 6;
  for (const [troopType, entityType] of Object.entries(TROOP_ENTITY_MAP)) {
    try {
      const entities = dim.getEntities({ type: entityType, location: center, maxDistance: RECALL_RADIUS2 });
      for (const e of entities) {
        if (e.getDynamicProperty(AUTO_DISPATCH_PROP) !== village.id) continue;
        const tt = e.getDynamicProperty(AUTO_TROOP_TYPE_PROP) ?? troopType;
        survivors[tt] = (survivors[tt] ?? 0) + 1;
        try {
          const mount = e.getVehicle?.();
          if (mount) mount.remove();
        } catch {
        }
        try {
          e.remove();
        } catch {
        }
        recalled++;
      }
    } catch {
    }
  }
  if (recalled > 0) {
    for (const [tt, count] of Object.entries(survivors)) {
      village.troops[tt] += count;
    }
    saveVillage(village);
    notifyPlayer(village.owner, `\xA7a\u2705 Attack repelled! \xA7f${recalled}\xA7a troop${recalled > 1 ? "s" : ""} returned to \xA7b${village.name}\xA7a barracks.`);
  }
}

// src/systems/guards.ts
import { world as world15 } from "@minecraft/server";
init_types();
init_storage();
init_notify();
var GUARD_ENTITY_MAP = {
  cityGuards: "kingdoms:city_guard",
  spearmen: "kingdoms:spearman",
  archers: "kingdoms:archer",
  cavalry: "kingdoms:cavalry",
  heavyKnight: "kingdoms:heavy_knight",
  samurai: "kingdoms:samurai",
  mercenaryLancer: "kingdoms:mercenary_lancer",
  legionary: "kingdoms:legionary"
};
function getBestAvailableTroopType(village) {
  const types = ["samurai", "legionary", "mercenaryLancer", "heavyKnight", "cavalry", "spearmen", "archers", "cityGuards"];
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
      const offset = {
        x: pole.location.x + Math.cos(angle) * 2,
        y: pole.location.y,
        z: pole.location.z + Math.sin(angle) * 2
      };
      const entity = MOUNTED_ENTITIES.has(entityType) ? spawnMountedUnit(dim, entityType, offset) : dim.spawnEntity(entityType, offset);
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
      if (entity) {
        try {
          const mount = entity.getVehicle?.();
          if (mount) mount.remove();
        } catch {
        }
        entity.remove();
      }
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
var POLE_RETURN_THRESHOLD = 18;
var PATROL_RADIUS = 8;
function _randomPatrolOffset() {
  const angle = Math.random() * Math.PI * 2;
  const r = Math.random() * PATROL_RADIUS;
  return { dx: Math.cos(angle) * r, dz: Math.sin(angle) * r };
}
function enforceGuardPositions() {
  for (const village of getAllVillages()) {
    if (!village.owner) continue;
    const dim = world15.getDimension(village.location.dimension);
    for (const pole of village.guardPoles) {
      if (pole.entityIds.length === 0) continue;
      const entityType = GUARD_ENTITY_MAP[pole.troopType];
      if (!entityType) continue;
      const stillPresent = [];
      try {
        const nearby = dim.getEntities({
          type: entityType,
          location: pole.location,
          maxDistance: POLE_RETURN_THRESHOLD + 32
        });
        for (const eid of pole.entityIds) {
          const entity = nearby.find((e) => e.id === eid);
          if (!entity) continue;
          stillPresent.push(eid);
          const dx = entity.location.x - pole.location.x;
          const dz = entity.location.z - pole.location.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist > POLE_RETURN_THRESHOLD) {
            const off = _randomPatrolOffset();
            try {
              entity.teleport({
                x: pole.location.x + off.dx,
                y: pole.location.y,
                z: pole.location.z + off.dz
              });
            } catch {
            }
          } else if (dist <= PATROL_RADIUS && Math.random() < 0.25) {
            const off = _randomPatrolOffset();
            try {
              entity.teleport({
                x: pole.location.x + off.dx,
                y: pole.location.y,
                z: pole.location.z + off.dz
              });
            } catch {
            }
          }
        }
      } catch {
      }
      pole.entityIds = stillPresent;
    }
  }
}

// src/main.ts
init_kingdom();

// src/systems/reinforcements.ts
init_storage();
init_tick();
init_notify();
var BASE_TRAVEL_TICKS = 600;
var TICKS_PER_5_BLOCKS = 20;
var TICKS_PER_TROOP = 15;
function calcTravelTicks(from, to, totalTroops) {
  const dist = distance(from, to);
  return BASE_TRAVEL_TICKS + Math.floor(dist / 5) * TICKS_PER_5_BLOCKS + totalTroops * TICKS_PER_TROOP;
}
function sendReinforcements(fromVillageId, toVillageId, troops) {
  const from = getVillage(fromVillageId);
  const to = getVillage(toVillageId);
  if (!from || !to) return false;
  for (const [type, count] of Object.entries(troops)) {
    if ((count ?? 0) <= 0) continue;
    if ((from.troops[type] ?? 0) < (count ?? 0)) {
      notifyPlayer(from.owner, `\xA7cNot enough ${type} in \xA7b${from.name}\xA7c to send.`);
      return false;
    }
  }
  const totalTroops = Object.values(troops).reduce((s, c) => s + (c ?? 0), 0);
  if (totalTroops === 0) return false;
  for (const [type, count] of Object.entries(troops)) {
    if ((count ?? 0) <= 0) continue;
    from.troops[type] -= count ?? 0;
  }
  const travelTicks = calcTravelTicks(from.location, to.location, totalTroops);
  const arriveTick = getCurrentTick() + travelTicks;
  const etaSecs = Math.ceil(travelTicks / 20);
  const etaMins = Math.floor(etaSecs / 60);
  const etaLabel = etaMins > 0 ? `${etaMins}m ${etaSecs % 60}s` : `${etaSecs}s`;
  const pr = {
    id: generateId(),
    sourceVillageId: fromVillageId,
    sourceVillageName: from.name,
    senderName: from.owner,
    troops,
    arriveTick
  };
  to.pendingReinforcements ?? (to.pendingReinforcements = []);
  to.pendingReinforcements.push(pr);
  saveVillage(from);
  saveVillage(to);
  const summary = Object.entries(troops).filter(([, c]) => (c ?? 0) > 0).map(([t, c]) => `${c} ${t}`).join(", ");
  notifyPlayer(
    from.owner,
    `\xA7a\u2694 Reinforcements dispatched (${summary}) from \xA7b${from.name}\xA7a \u2192 \xA7b${to.name}\xA7a. ETA: \xA7e~${etaLabel}\xA7a.`
  );
  if (to.owner !== from.owner) {
    notifyAlert(
      to.owner,
      `\xA7e\u2694 Incoming reinforcements (${summary}) from \xA7b${from.name}\xA7e. ETA: \xA7e~${etaLabel}\xA7e.`
    );
  }
  return true;
}
function tickPendingReinforcements(currentTick) {
  for (const village of getAllVillages()) {
    if (!village.pendingReinforcements || village.pendingReinforcements.length === 0) continue;
    const remaining = [];
    let changed = false;
    for (const pr of village.pendingReinforcements) {
      if (currentTick < pr.arriveTick) {
        remaining.push(pr);
        continue;
      }
      for (const [type, count] of Object.entries(pr.troops)) {
        if ((count ?? 0) <= 0) continue;
        village.troops[type] = (village.troops[type] ?? 0) + count;
      }
      const summary = Object.entries(pr.troops).filter(([, c]) => (c ?? 0) > 0).map(([t, c]) => `${c} ${t}`).join(", ");
      notifyPlayer(
        village.owner,
        `\xA7a\u2694 Reinforcements arrived at \xA7b${village.name}\xA7a! (${summary}) from \xA7b${pr.sourceVillageName}\xA7a.`
      );
      if (pr.senderName !== village.owner) {
        notifyPlayer(pr.senderName, `\xA7a\u2694 Your reinforcements reached \xA7b${village.name}\xA7a!`);
      }
      changed = true;
    }
    if (changed) {
      village.pendingReinforcements = remaining;
      saveVillage(village);
    }
  }
}
function cancelReinforcement(reinforcementId, toVillageId) {
  const to = getVillage(toVillageId);
  if (!to || !to.pendingReinforcements) return false;
  const idx = to.pendingReinforcements.findIndex((pr2) => pr2.id === reinforcementId);
  if (idx === -1) return false;
  const pr = to.pendingReinforcements[idx];
  to.pendingReinforcements.splice(idx, 1);
  saveVillage(to);
  const from = getVillage(pr.sourceVillageId);
  if (from) {
    for (const [type, count] of Object.entries(pr.troops)) {
      if ((count ?? 0) <= 0) continue;
      from.troops[type] = (from.troops[type] ?? 0) + count;
    }
    saveVillage(from);
    notifyPlayer(from.owner, `\xA7e\u21A9 March recalled \u2014 troops returned to \xA7b${from.name}\xA7e.`);
  }
  if (to.owner !== (from?.owner ?? "")) {
    notifyPlayer(to.owner, `\xA7e\u21A9 Incoming march from \xA7b${pr.sourceVillageName}\xA7e to \xA7b${to.name}\xA7e was recalled.`);
  }
  return true;
}
function getInTransitMarches(playerName) {
  const result = [];
  for (const village of getAllVillages()) {
    if (!village.pendingReinforcements) continue;
    for (const pr of village.pendingReinforcements) {
      if (pr.senderName === playerName) {
        result.push({ pr, toVillageId: village.id, toName: village.name });
      }
    }
  }
  return result;
}

// src/systems/materialStorage.ts
init_types();
init_storage();
init_notify();
function registerMaterialStorage(village, location) {
  village.hasStorage = true;
  village.storageLocation = { x: location.x, y: location.y, z: location.z };
  if (!village.resourceStorage) {
    village.resourceStorage = { ...EMPTY_RESOURCE_STORAGE };
  }
  saveVillage(village);
  notifyPlayer(
    village.owner,
    `\xA7aMaterial Storage built in \xA7b${village.name}\xA7a! Assign workers at the Town Hall to gather resources.`
  );
}
function removeMaterialStorage(village) {
  village.hasStorage = false;
  village.storageLocation = void 0;
  saveVillage(village);
  notifyPlayer(
    village.owner,
    `\xA7cMaterial Storage destroyed in \xA7b${village.name}\xA7c! Workers will idle until a new one is built.`
  );
}
function getMaterialStorageSummary(village) {
  const v = getVillage(village.id) ?? village;
  const rs = v.resourceStorage ?? { ...EMPTY_RESOURCE_STORAGE };
  const miners = v.workers?.miners ?? 0;
  const resourceLines = Object.keys(RESOURCE_LABELS).map((k) => `  ${RESOURCE_LABELS[k]}: \xA7f${rs[k] ?? 0}`).join("\n");
  return [
    `\xA7b${v.name}\xA7r \u2014 Material Storage`,
    ``,
    `\xA77\u2500\u2500 Stored Resources \u2500\u2500`,
    resourceLines,
    ``,
    `\xA77\u2500\u2500 Miners \u2500\u2500`,
    `  \xA7fAssigned Miners: \xA77${miners}`,
    `  \xA77(Miners passively gather iron, coal, stone, wood, gold & diamonds)`,
    `  \xA77Assign miners via the \xA7bTown Hall \u2192 Workers\xA77 menu.`
  ].join("\n");
}
var MINER_TICK_INTERVAL = 1200;
var MINER_RATES = {
  iron: { min: 2, max: 5 },
  coal: { min: 3, max: 7 },
  stone: { min: 4, max: 8 },
  wood: { min: 3, max: 6 },
  gold: { min: 0, max: 2 },
  diamonds: { min: 0, max: 1 }
};
function tickMinerProduction(village, tick) {
  if (!village.hasStorage) return;
  const miners = village.workers?.miners ?? 0;
  if (miners === 0) return;
  if (tick % MINER_TICK_INTERVAL !== 0) return;
  if (!village.resourceStorage) {
    village.resourceStorage = { ...EMPTY_RESOURCE_STORAGE };
  }
  const rs = village.resourceStorage;
  for (const key of Object.keys(MINER_RATES)) {
    const rate = MINER_RATES[key];
    const perMiner = rate.min + Math.floor(Math.random() * (rate.max - rate.min + 1));
    rs[key] = (rs[key] ?? 0) + Math.floor(perMiner * miners);
  }
  saveVillage(village);
}
function tickAllMinerProduction(tick) {
  for (const village of getAllVillages()) {
    tickMinerProduction(village, tick);
  }
}

// src/systems/structureBuilder.ts
import { BlockPermutation } from "@minecraft/server";
var STRUCTURE_BLOCK_IDS = /* @__PURE__ */ new Set([
  "kingdoms:town_hall",
  "kingdoms:barracks",
  "kingdoms:market",
  "kingdoms:granary",
  "kingdoms:blacksmith",
  "kingdoms:trade_station",
  "kingdoms:treasury",
  "kingdoms:waypoint",
  "kingdoms:castle",
  "kingdoms:storage",
  "kingdoms:greenhouse",
  "kingdoms:banner_hall"
]);
function blk(x, y, z, b) {
  return { x, y, z, b };
}
function door(x, y, z, type = "minecraft:oak_door", direction = 1) {
  return [
    { x, y, z, b: type, states: { direction, door_hinge_bit: false, open_bit: false, upper_block_bit: false } },
    { x, y: y + 1, z, b: type, states: { direction, door_hinge_bit: false, open_bit: false, upper_block_bit: true } }
  ];
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
  p.push(...fill(-4, 1, -3, 4, 5, 3, "minecraft:air"));
  p.push(...fill(-4, 0, -3, 4, 0, 3, "minecraft:cobblestone"));
  p.push(...fill(-4, 1, -3, 4, 4, -3, "minecraft:stone_bricks"));
  p.push(...fill(4, 1, -2, 4, 4, 2, "minecraft:stone_bricks"));
  p.push(...fill(-4, 1, -2, -4, 4, 2, "minecraft:stone_bricks"));
  for (let x = -4; x <= 4; x++)
    for (let y = 1; y <= 4; y++)
      if (!(x >= -1 && x <= 1 && y <= 2))
        p.push(blk(x, y, 3, "minecraft:stone_bricks"));
  for (const wx of [-3, 0, 3]) {
    p.push(blk(wx, 3, -3, "minecraft:glass"));
    p.push(blk(wx, 3, 3, "minecraft:glass"));
  }
  p.push(blk(-4, 3, 0, "minecraft:glass"), blk(4, 3, 0, "minecraft:glass"));
  p.push(...fill(-4, 5, -3, 4, 5, 3, "minecraft:stone_bricks"));
  for (let x = -4; x <= 4; x += 2) {
    p.push(blk(x, 6, -3, "minecraft:stone_bricks"));
    p.push(blk(x, 6, 3, "minecraft:stone_bricks"));
  }
  for (let z = -2; z <= 2; z += 2) {
    p.push(blk(-4, 6, z, "minecraft:stone_bricks"));
    p.push(blk(4, 6, z, "minecraft:stone_bricks"));
  }
  p.push(...door(0, 1, 3, "minecraft:iron_door", 1));
  p.push(blk(-3, 1, -2, "minecraft:chest"), blk(3, 1, -2, "minecraft:chest"));
  p.push(blk(0, 1, -2, "minecraft:smithing_table"));
  for (let x = -3; x <= 3; x += 2) p.push(blk(x, 1, 1, "minecraft:red_carpet"));
  p.push(blk(0, 1, 2, "minecraft:sea_lantern"));
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
  p.push(...fill(-3, 1, -3, 3, 8, 3, "minecraft:air"));
  p.push(...fill(-3, 0, -3, 3, 0, 3, "minecraft:birch_planks"));
  p.push(...ring(-3, -3, 3, 3, 1, 4, "minecraft:spruce_planks"));
  for (let y = 1; y <= 2; y++) p.push(blk(0, y, 3, "minecraft:air"));
  p.push(...door(0, 1, 3, "minecraft:spruce_door", 1));
  p.push(blk(-3, 2, 0, "minecraft:glass"), blk(3, 2, 0, "minecraft:glass"));
  p.push(blk(0, 2, -3, "minecraft:glass"), blk(0, 2, 3, "minecraft:glass"));
  for (const [cx, cz] of [[-3, -3], [-3, 3], [3, -3], [3, 3]])
    p.push(...fill(cx, 1, cz, cx, 5, cz, "minecraft:spruce_log"));
  p.push(...fill(-3, 5, -3, 3, 5, 3, "minecraft:hay_block"));
  p.push(...fill(-2, 6, -2, 2, 6, 2, "minecraft:hay_block"));
  p.push(...fill(-1, 7, -1, 1, 7, 1, "minecraft:hay_block"));
  p.push(blk(0, 8, 0, "minecraft:hay_block"));
  p.push(blk(-2, 1, -2, "minecraft:barrel"), blk(2, 1, -2, "minecraft:barrel"));
  p.push(blk(-2, 1, 2, "minecraft:barrel"), blk(2, 1, 2, "minecraft:barrel"));
  p.push(blk(0, 1, -2, "minecraft:chest"));
  p.push(blk(0, 1, 0, "minecraft:sea_lantern"));
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
function materialStorageBlueprint() {
  const p = [];
  p.push(...fill(-3, 1, -3, 3, 6, 3, "minecraft:air"));
  p.push(...fill(-3, 0, -3, 3, 0, 3, "minecraft:stone_bricks"));
  p.push(...ring(-3, -3, 3, 3, 1, 4, "minecraft:cobblestone"));
  p.push(...ring(-3, -3, 3, 3, 4, 4, "minecraft:stone_bricks"));
  for (let y = 1; y <= 2; y++) p.push(blk(0, y, 3, "minecraft:air"));
  p.push(...door(0, 1, 3, "minecraft:iron_door", 1));
  p.push(blk(-2, 2, -3, "minecraft:iron_bars"), blk(0, 2, -3, "minecraft:iron_bars"), blk(2, 2, -3, "minecraft:iron_bars"));
  p.push(blk(-3, 2, -1, "minecraft:iron_bars"), blk(-3, 2, 1, "minecraft:iron_bars"));
  p.push(blk(3, 2, -1, "minecraft:iron_bars"), blk(3, 2, 1, "minecraft:iron_bars"));
  p.push(...fill(-3, 5, -3, 3, 5, 3, "minecraft:stone_bricks"));
  p.push(...fill(-1, 6, -1, 1, 6, 1, "minecraft:stone_bricks"));
  for (const [bx, bz] of [[-2, -2], [2, -2], [-2, 2], [2, 2]])
    p.push(blk(bx, 1, bz, "minecraft:barrel"));
  p.push(blk(-2, 1, 0, "minecraft:chest"), blk(2, 1, 0, "minecraft:chest"));
  p.push(blk(0, 1, -2, "minecraft:chest"));
  p.push(blk(0, 1, 1, "minecraft:sea_lantern"));
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
  for (let x = -3; x <= -1; x++) p.push(blk(x, 1, 3, "minecraft:iron_bars"));
  for (let x = 1; x <= 3; x++) p.push(blk(x, 1, 3, "minecraft:iron_bars"));
  p.push(...door(0, 1, 3, "minecraft:oak_door", 1));
  return p;
}
function treasuryBlueprint() {
  const p = [];
  p.push(...fill(-3, 1, -3, 3, 6, 3, "minecraft:air"));
  p.push(...fill(-3, 0, -3, 3, 0, 3, "minecraft:deepslate_bricks"));
  p.push(...ring(-3, -3, 3, 3, 1, 4, "minecraft:deepslate_bricks"));
  p.push(...ring(-2, -2, 2, 2, 1, 4, "minecraft:deepslate_bricks"));
  for (let y = 1; y <= 2; y++) {
    p.push(blk(0, y, 3, "minecraft:air"));
    p.push(blk(0, y, 2, "minecraft:air"));
  }
  p.push(...door(0, 1, 3, "minecraft:iron_door", 1));
  p.push(blk(-1, 1, 2, "minecraft:iron_bars"), blk(1, 1, 2, "minecraft:iron_bars"));
  p.push(blk(-1, 2, 2, "minecraft:iron_bars"), blk(1, 2, 2, "minecraft:iron_bars"));
  p.push(blk(3, 4, 0, "minecraft:air"), blk(-3, 4, 0, "minecraft:air"));
  p.push(...fill(-3, 5, -3, 3, 5, 3, "minecraft:deepslate_bricks"));
  for (let x = -3; x <= 3; x += 2) {
    p.push(blk(x, 6, -3, "minecraft:deepslate_bricks"));
    p.push(blk(x, 6, 3, "minecraft:deepslate_bricks"));
  }
  for (let z = -2; z <= 2; z += 2) {
    p.push(blk(-3, 6, z, "minecraft:deepslate_bricks"));
    p.push(blk(3, 6, z, "minecraft:deepslate_bricks"));
  }
  p.push(blk(-1, 1, -2, "minecraft:gold_block"), blk(1, 1, -2, "minecraft:gold_block"));
  p.push(blk(0, 1, -2, "minecraft:gold_block"));
  p.push(blk(-1, 1, 0, "minecraft:chest"), blk(1, 1, 0, "minecraft:chest"));
  p.push(blk(0, 2, 0, "minecraft:sea_lantern"));
  return p;
}
function waypointBlueprint() {
  const p = [];
  p.push(...fill(-1, 1, -1, 1, 6, 1, "minecraft:air"));
  p.push(...fill(-1, 0, -1, 1, 0, 1, "minecraft:smooth_stone"));
  p.push(...fill(0, 1, 0, 0, 4, 0, "minecraft:stone_bricks"));
  p.push(blk(-1, 2, 0, "minecraft:chiseled_stone_bricks"), blk(1, 2, 0, "minecraft:chiseled_stone_bricks"));
  p.push(blk(0, 2, -1, "minecraft:chiseled_stone_bricks"), blk(0, 2, 1, "minecraft:chiseled_stone_bricks"));
  p.push(blk(0, 5, 0, "minecraft:glowstone"));
  p.push(blk(-1, 0, -1, "minecraft:sea_lantern"), blk(1, 0, -1, "minecraft:sea_lantern"));
  p.push(blk(-1, 0, 1, "minecraft:sea_lantern"), blk(1, 0, 1, "minecraft:sea_lantern"));
  p.push(blk(2, 0, 0, "minecraft:smooth_stone"));
  p.push(blk(2, 1, 0, "minecraft:chest"));
  return p;
}
function demolishStructure(dimension, origin, blockTypeId) {
  const blueprint = BLUEPRINTS[blockTypeId];
  if (!blueprint) return;
  const placements = blueprint();
  for (const bp of placements) {
    if (bp.b === "minecraft:air") continue;
    if (bp.x === 0 && bp.y === 0 && bp.z === 0) continue;
    try {
      const loc = {
        x: origin.x + bp.x,
        y: origin.y + bp.y,
        z: origin.z + bp.z
      };
      dimension.getBlock(loc)?.setType("minecraft:air");
    } catch {
    }
  }
}
function castleBlueprint() {
  const p = [];
  const sb = "minecraft:stone_bricks";
  const cracked = "minecraft:cracked_stone_bricks";
  const moss = "minecraft:mossy_stone_bricks";
  p.push(...ring(-7, -7, 7, 7, 1, 5, sb));
  for (let x = -6; x <= 6; x += 2) {
    p.push(blk(x, 6, -7, sb));
    p.push(blk(x, 6, 7, sb));
  }
  for (let z = -5; z <= 5; z += 2) {
    p.push(blk(-7, 6, z, sb));
    p.push(blk(7, 6, z, sb));
  }
  for (let gx = -1; gx <= 1; gx++) {
    p.push(blk(gx, 1, 7, "minecraft:air"));
    p.push(blk(gx, 2, 7, "minecraft:air"));
    p.push(blk(gx, 3, 7, "minecraft:air"));
  }
  p.push(...fill(-6, 0, -6, 6, 0, 6, "minecraft:cobblestone"));
  for (const [cx, cz] of [[-7, -7], [7, -7], [-7, 7], [7, 7]]) {
    p.push(...fill(cx - 1, 1, cz - 1, cx + 1, 10, cz + 1, sb));
    p.push(...fill(cx, 2, cz, cx, 9, cz, "minecraft:air"));
    p.push(blk(cx - 1, 1, cz, cracked));
    p.push(blk(cx + 1, 1, cz, cracked));
    p.push(blk(cx, 1, cz - 1, cracked));
    p.push(blk(cx, 1, cz + 1, cracked));
    p.push(blk(cx - 1, 11, cz - 1, sb));
    p.push(blk(cx + 1, 11, cz - 1, sb));
    p.push(blk(cx - 1, 11, cz + 1, sb));
    p.push(blk(cx + 1, 11, cz + 1, sb));
  }
  p.push(...ring(-3, -3, 3, 3, 1, 8, sb));
  p.push(...fill(-2, 0, -2, 2, 0, 2, sb));
  for (let x = -3; x <= 3; x++) {
    p.push(blk(x, 1, -3, moss));
    p.push(blk(x, 1, 3, moss));
  }
  for (let z = -2; z <= 2; z++) {
    p.push(blk(-3, 1, z, moss));
    p.push(blk(3, 1, z, moss));
  }
  p.push(blk(0, 1, 3, "minecraft:air"));
  p.push(blk(0, 2, 3, "minecraft:air"));
  p.push(blk(1, 1, 3, "minecraft:air"));
  p.push(blk(1, 2, 3, "minecraft:air"));
  p.push(blk(-1, 1, 3, "minecraft:air"));
  p.push(blk(-1, 2, 3, "minecraft:air"));
  for (let x = -3; x <= 3; x += 2) {
    p.push(blk(x, 9, -3, sb));
    p.push(blk(x, 9, 3, sb));
  }
  for (let z = -2; z <= 2; z += 2) {
    p.push(blk(-3, 9, z, sb));
    p.push(blk(3, 9, z, sb));
  }
  p.push(blk(0, 9, 0, "minecraft:oak_fence"));
  p.push(blk(0, 10, 0, "minecraft:oak_fence"));
  p.push(blk(0, 11, 0, "minecraft:oak_fence"));
  p.push(blk(1, 11, 0, "minecraft:red_wool"));
  p.push(blk(1, 10, 0, "minecraft:red_wool"));
  p.push(...fill(-2, 1, -2, 2, 7, 2, "minecraft:air"));
  for (let iz = -2; iz <= 2; iz++) p.push(blk(0, 1, iz, "minecraft:red_carpet"));
  p.push(blk(0, 1, -2, "minecraft:gold_block"));
  p.push(blk(0, 2, -2, "minecraft:stone_bricks"));
  p.push(blk(-1, 1, -2, "minecraft:stone_bricks"));
  p.push(blk(1, 1, -2, "minecraft:stone_bricks"));
  p.push(blk(0, 4, -3, "minecraft:red_wool"));
  p.push(blk(0, 5, -3, "minecraft:red_wool"));
  p.push(blk(0, 6, -3, "minecraft:red_wool"));
  p.push(blk(-3, 4, 0, "minecraft:red_wool"), blk(-3, 5, 0, "minecraft:red_wool"));
  p.push(blk(3, 4, 0, "minecraft:red_wool"), blk(3, 5, 0, "minecraft:red_wool"));
  p.push(blk(-2, 1, -2, "minecraft:chest"));
  p.push(blk(2, 1, -2, "minecraft:chest"));
  p.push(blk(2, 1, 0, "minecraft:furnace"));
  p.push(blk(2, 2, 0, "minecraft:cobblestone"));
  p.push(blk(2, 3, 0, "minecraft:cobblestone"));
  p.push(blk(0, 7, 0, "minecraft:glowstone"));
  p.push(blk(-2, 4, 0, "minecraft:lantern"));
  p.push(blk(2, 4, 0, "minecraft:lantern"));
  p.push(blk(-2, 1, -1, "minecraft:bookshelf"));
  p.push(blk(-2, 2, -1, "minecraft:bookshelf"));
  p.push(...fill(-2, 4, -2, 2, 4, 2, "minecraft:stone_brick_slab"));
  p.push(blk(-1, 5, -2, "minecraft:white_carpet"));
  p.push(blk(1, 5, -2, "minecraft:white_carpet"));
  p.push(blk(-2, 5, -1, "minecraft:white_carpet"));
  p.push(blk(2, 5, -1, "minecraft:white_carpet"));
  p.push(blk(0, 6, 0, "minecraft:lantern"));
  p.push(blk(0, 5, -2, "minecraft:chest"));
  return p;
}
function greenhouseBlueprint() {
  const p = [];
  p.push(...fill(-5, 1, -5, 5, 7, 5, "minecraft:air"));
  p.push(...fill(-5, 0, -5, 5, 0, 5, "minecraft:dirt"));
  for (const [cx, cz] of [[-5, -5], [-5, 5], [5, -5], [5, 5]])
    p.push(...fill(cx, 1, cz, cx, 6, cz, "minecraft:oak_log"));
  for (const [cx, cz] of [[-5, 0], [5, 0], [0, -5], [0, 5]])
    p.push(...fill(cx, 1, cz, cx, 6, cz, "minecraft:oak_log"));
  p.push(...ring(-5, -5, 5, 5, 1, 5, "minecraft:glass"));
  for (let y = 1; y <= 2; y++) {
    p.push(blk(-1, y, 5, "minecraft:air"));
    p.push(blk(0, y, 5, "minecraft:air"));
    p.push(blk(1, y, 5, "minecraft:air"));
  }
  for (const [cx, cz] of [[-5, -5], [-5, 5], [5, -5], [5, 5], [-5, 0], [5, 0], [0, -5], [0, 5]])
    p.push(...fill(cx, 1, cz, cx, 6, cz, "minecraft:oak_log"));
  p.push(...fill(-5, 7, -5, 5, 7, 5, "minecraft:glass"));
  p.push(...fill(-5, 7, 0, 5, 7, 0, "minecraft:oak_log"));
  p.push(...fill(0, 7, -5, 0, 7, 5, "minecraft:oak_log"));
  p.push(...door(0, 1, 5, "minecraft:oak_door", 1));
  p.push(...fill(-4, 0, -2, 4, 0, -2, "minecraft:water"));
  p.push(...fill(-4, 0, 2, 4, 0, 2, "minecraft:water"));
  p.push(...fill(-4, 0, -5, 4, 0, -3, "minecraft:farmland"));
  p.push(...fill(-4, 0, -1, 4, 0, 1, "minecraft:farmland"));
  p.push(...fill(-4, 0, 3, 4, 0, 5, "minecraft:farmland"));
  p.push(...fill(-4, 1, -5, 4, 1, -3, "minecraft:wheat"));
  p.push(...fill(-4, 1, 3, 4, 1, 5, "minecraft:wheat"));
  p.push(blk(-4, 1, 0, "minecraft:barrel"));
  p.push(blk(4, 1, 0, "minecraft:barrel"));
  p.push(blk(-4, 1, -4, "minecraft:composter"));
  p.push(blk(4, 1, -4, "minecraft:composter"));
  p.push(blk(0, 1, 0, "minecraft:sea_lantern"));
  p.push(blk(-3, 1, -4, "minecraft:sea_lantern"));
  p.push(blk(3, 1, -4, "minecraft:sea_lantern"));
  p.push(blk(-3, 1, 4, "minecraft:sea_lantern"));
  p.push(blk(3, 1, 4, "minecraft:sea_lantern"));
  return p;
}
function bannerHallBlueprint() {
  const p = [];
  p.push(...fill(-4, 1, -2, 4, 7, 2, "minecraft:air"));
  p.push(...fill(-4, 0, -2, 4, 0, 2, "minecraft:smooth_stone"));
  p.push(...fill(-4, 1, -2, 4, 2, -2, "minecraft:stone_bricks"));
  p.push(...fill(-4, 1, -1, -4, 2, 2, "minecraft:stone_bricks"));
  p.push(...fill(4, 1, -1, 4, 2, 2, "minecraft:stone_bricks"));
  p.push(blk(-4, 3, -2, "minecraft:lantern"), blk(4, 3, -2, "minecraft:lantern"));
  for (let x = -3; x <= 3; x += 2) {
    p.push(blk(x, 1, 0, "dcfb:flagpole_block"));
  }
  p.push(blk(0, 1, -1, "dcfb:banner_table"));
  p.push(...fill(-1, 0, 3, 1, 0, 5, "minecraft:stone_bricks"));
  return p;
}
var BLUEPRINTS = {
  "kingdoms:town_hall": townHallBlueprint,
  "kingdoms:barracks": barracksBlueprint,
  "kingdoms:market": marketBlueprint,
  "kingdoms:granary": granaryBlueprint,
  "kingdoms:blacksmith": blacksmithBlueprint,
  "kingdoms:trade_station": tradeStationBlueprint,
  "kingdoms:treasury": treasuryBlueprint,
  "kingdoms:waypoint": waypointBlueprint,
  "kingdoms:castle": castleBlueprint,
  "kingdoms:storage": materialStorageBlueprint,
  "kingdoms:greenhouse": greenhouseBlueprint,
  "kingdoms:banner_hall": bannerHallBlueprint
};
function generateStructure(dimension, origin, blockTypeId) {
  const blueprint = BLUEPRINTS[blockTypeId];
  if (!blueprint) return;
  const placements = blueprint();
  for (const bp of placements) {
    if (bp.x === 0 && bp.y === 0 && bp.z === 0) continue;
    try {
      const loc = {
        x: origin.x + bp.x,
        y: origin.y + bp.y,
        z: origin.z + bp.z
      };
      if (bp.states) {
        dimension.getBlock(loc)?.setPermutation(BlockPermutation.resolve(bp.b, bp.states));
      } else {
        dimension.getBlock(loc)?.setType(bp.b);
      }
    } catch {
    }
  }
}

// src/systems/waypoint.ts
init_storage();
init_notify();
import { world as world16 } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
var WAYPOINT_PROP = "kc:waypoint_village_id";
function registerWaypoint(village, location) {
  if (village.waypointLocation) {
    notifyPlayer(
      village.owner,
      `\xA7c\xA7b${village.name}\xA7c already has a waypoint. Break the existing one to move it.`
    );
    return false;
  }
  village.waypointLocation = location;
  const dim = world16.getDimension(village.location.dimension);
  try {
    const entity = dim.spawnEntity("kingdoms:structure_hub", {
      x: location.x + 0.5,
      y: location.y + 1,
      z: location.z + 0.5
    });
    entity.setDynamicProperty(WAYPOINT_PROP, village.id);
    entity.nameTag = `\xA7b\u2726 ${village.name}`;
    village.waypointEntityId = entity.id;
  } catch {
  }
  saveVillage(village);
  notifyPlayer(
    village.owner,
    `\xA7a\u2726 Waypoint registered for \xA7b${village.name}\xA7a! Right-click the marker to teleport to any of your villages.`
  );
  return true;
}
function removeWaypoint(village) {
  if (village.waypointEntityId) {
    const dim = world16.getDimension(village.location.dimension);
    try {
      for (const entityType of ["kingdoms:structure_hub"]) {
        const entities = dim.getEntities({ type: entityType });
        const e = entities.find((x) => x.id === village.waypointEntityId);
        if (e) {
          e.remove();
          break;
        }
      }
    } catch {
    }
    village.waypointEntityId = void 0;
  }
  village.waypointLocation = void 0;
  saveVillage(village);
  notifyPlayer(village.owner, `\xA7eWaypoint removed from \xA7b${village.name}\xA7e.`);
}
function depositAllToWaypointChest(player, village) {
  if (!village.waypointLocation) {
    notifyPlayer(player.name, `\xA7cNo waypoint chest found.`);
    return;
  }
  const chestLoc = {
    x: village.waypointLocation.x + 2,
    y: village.waypointLocation.y + 1,
    z: village.waypointLocation.z
  };
  const dim = world16.getDimension(village.location.dimension);
  const chestBlock = dim.getBlock(chestLoc);
  const chestInv = chestBlock?.getComponent("inventory");
  if (!chestInv?.container) {
    notifyPlayer(player.name, `\xA7cWaypoint chest not found \u2014 make sure the structure has been built.`);
    return;
  }
  const playerInv = player.getComponent("inventory");
  if (!playerInv?.container) return;
  const playerContainer = playerInv.container;
  const chestContainer = chestInv.container;
  let deposited = 0;
  let noRoom = 0;
  for (let i = 0; i < playerContainer.size; i++) {
    const item = playerContainer.getItem(i);
    if (!item) continue;
    let placed = false;
    for (let c = 0; c < chestContainer.size; c++) {
      const existing = chestContainer.getItem(c);
      if (existing && existing.typeId === item.typeId && existing.amount < existing.maxAmount) {
        const space = existing.maxAmount - existing.amount;
        const toMove = Math.min(space, item.amount);
        existing.amount += toMove;
        chestContainer.setItem(c, existing);
        if (toMove >= item.amount) {
          playerContainer.setItem(i, void 0);
          deposited++;
          placed = true;
          break;
        } else {
          item.amount -= toMove;
        }
      }
    }
    if (placed) continue;
    let foundSlot = false;
    for (let c = 0; c < chestContainer.size; c++) {
      if (!chestContainer.getItem(c)) {
        chestContainer.setItem(c, item);
        playerContainer.setItem(i, void 0);
        deposited++;
        foundSlot = true;
        break;
      }
    }
    if (!foundSlot) noRoom++;
  }
  if (deposited > 0 && noRoom === 0) {
    notifyPlayer(player.name, `\xA7a\u{1F4E6} All items deposited into the waypoint chest.`);
  } else if (deposited > 0 && noRoom > 0) {
    notifyPlayer(player.name, `\xA7e\u{1F4E6} Deposited ${deposited} item(s). \xA7c${noRoom} item(s) didn't fit \u2014 chest is full.`);
  } else if (deposited === 0 && noRoom > 0) {
    notifyPlayer(player.name, `\xA7cChest is full \u2014 no items could be deposited.`);
  } else {
    notifyPlayer(player.name, `\xA77Your inventory is already empty.`);
  }
}
function collectAllFromWaypointChest(player, village) {
  if (!village.waypointLocation) {
    notifyPlayer(player.name, `\xA7cNo waypoint chest found.`);
    return;
  }
  const chestLoc = {
    x: village.waypointLocation.x + 2,
    y: village.waypointLocation.y + 1,
    z: village.waypointLocation.z
  };
  const dim = world16.getDimension(village.location.dimension);
  const chestBlock = dim.getBlock(chestLoc);
  const chestInv = chestBlock?.getComponent("inventory");
  if (!chestInv?.container) {
    notifyPlayer(player.name, `\xA7cWaypoint chest not found \u2014 make sure the structure has been built.`);
    return;
  }
  const playerInv = player.getComponent("inventory");
  if (!playerInv?.container) return;
  const playerContainer = playerInv.container;
  const chestContainer = chestInv.container;
  let collected = 0;
  let noRoom = 0;
  for (let c = 0; c < chestContainer.size; c++) {
    const item = chestContainer.getItem(c);
    if (!item) continue;
    let placed = false;
    for (let i = 0; i < playerContainer.size; i++) {
      const existing = playerContainer.getItem(i);
      if (existing && existing.typeId === item.typeId && existing.amount < existing.maxAmount) {
        const space = existing.maxAmount - existing.amount;
        const toMove = Math.min(space, item.amount);
        existing.amount += toMove;
        playerContainer.setItem(i, existing);
        if (toMove >= item.amount) {
          chestContainer.setItem(c, void 0);
          collected++;
          placed = true;
          break;
        } else {
          item.amount -= toMove;
        }
      }
    }
    if (placed) continue;
    let foundSlot = false;
    for (let i = 0; i < playerContainer.size; i++) {
      if (!playerContainer.getItem(i)) {
        playerContainer.setItem(i, item);
        chestContainer.setItem(c, void 0);
        collected++;
        foundSlot = true;
        break;
      }
    }
    if (!foundSlot) noRoom++;
  }
  if (collected > 0 && noRoom === 0) {
    notifyPlayer(player.name, `\xA7a\u{1F4E6} All items collected from the waypoint chest.`);
  } else if (collected > 0 && noRoom > 0) {
    notifyPlayer(player.name, `\xA7e\u{1F4E6} Collected ${collected} item(s). \xA7c${noRoom} item(s) didn't fit \u2014 your inventory is full.`);
  } else if (collected === 0 && noRoom > 0) {
    notifyPlayer(player.name, `\xA7cInventory is full \u2014 no items could be collected.`);
  } else {
    notifyPlayer(player.name, `\xA77The chest is already empty.`);
  }
}
async function showWaypointMenu(player, currentVillage) {
  const destinations = getAllVillages().filter(
    (v) => v.owner === player.name && v.waypointLocation
  );
  const hasChest = !!currentVillage?.waypointLocation;
  if (destinations.length === 0 && !hasChest) {
    notifyPlayer(
      player.name,
      `\xA7cNo waypoints found. Place a \xA7bVillage Waypoint\xA7c block inside your village first.`
    );
    return;
  }
  const form = new ActionFormData().title("\xA7b\u2726 Village Waypoints").body(
    `\xA77${destinations.length} waypoint(s) registered.
\xA7fSelect a destination to teleport to, or manage the chest:`
  );
  if (hasChest) {
    form.button(`\xA76\u{1F4E6} Deposit All to Chest
\xA77Sweep your inventory into the chest`);
    form.button(`\xA7a\u{1F4E5} Collect All from Chest
\xA77Pull everything back into your inventory`);
  }
  for (const v of destinations) {
    const loc2 = v.waypointLocation;
    form.button(`\xA7b${v.name}
\xA77${Math.round(loc2.x)}, ${Math.round(loc2.y)}, ${Math.round(loc2.z)}`);
  }
  form.button("\xA77Cancel");
  const response = await form.show(player);
  if (response.canceled || response.selection === void 0) return;
  let selection = response.selection;
  if (hasChest) {
    if (selection === 0) {
      depositAllToWaypointChest(player, currentVillage);
      return;
    }
    if (selection === 1) {
      collectAllFromWaypointChest(player, currentVillage);
      return;
    }
    selection -= 2;
  }
  if (selection >= destinations.length) return;
  const dest = destinations[selection];
  const loc = dest.waypointLocation;
  const inventory = player.getComponent("inventory");
  if (inventory?.container) {
    const container = inventory.container;
    const disallowed = [];
    for (let i = 0; i < container.size; i++) {
      const item = container.getItem(i);
      if (!item) continue;
      if (item.typeId === "minecraft:flint_and_steel" && item.amount === 1) continue;
      disallowed.push(item.typeId);
    }
    if (disallowed.length > 0) {
      notifyPlayer(
        player.name,
        `\xA7c\u2726 Waypoint travel only allows \xA7f1 Flint & Steel\xA7c. Store everything else in the \xA7bchest\xA7c first.`
      );
      return;
    }
  }
  try {
    const dim = world16.getDimension(dest.location.dimension);
    player.teleport(
      { x: loc.x + 0.5, y: loc.y + 1, z: loc.z + 0.5 },
      { dimension: dim }
    );
    notifyPlayer(player.name, `\xA7a\u2726 Teleported to \xA7b${dest.name}\xA7a!`);
  } catch {
    notifyPlayer(player.name, `\xA7cTeleport failed \u2014 chunk may not be loaded.`);
  }
}

// src/main.ts
init_kingdom();
init_types();

// src/systems/villagerBow.ts
import { world as world17, system as system4 } from "@minecraft/server";
var VILLAGER_TYPES = ["minecraft:villager_v2", "minecraft:villager"];
var CHECK_INTERVAL_TICKS = 40;
var BOW_ANIM = "animation.kingdoms.bow_greeting";
var BOW_DURATION = 2.5;
var BOW_RADIUS = 4;
function startVillagerBowSystem() {
  system4.runInterval(() => {
    try {
      for (const player of world17.getAllPlayers()) {
        const dim = player.dimension;
        const loc = player.location;
        for (const type of VILLAGER_TYPES) {
          try {
            const nearby = dim.getEntities({
              type,
              location: loc,
              maxDistance: BOW_RADIUS
            });
            for (const entity of nearby) {
              try {
                entity.runCommandAsync(
                  `playanimation @s ${BOW_ANIM} false ${BOW_DURATION}`
                );
              } catch {
              }
            }
          } catch {
          }
        }
      }
    } catch {
    }
  }, CHECK_INTERVAL_TICKS);
}

// src/systems/chargeAttack.ts
init_tick();
import { world as world18 } from "@minecraft/server";
var VELOCITY_CHECK_INTERVAL = 5;
var GALLOP_THRESHOLD = 0.18;
var CHARGE_WINDOW_TICKS = 60;
var CHARGE_BONUS = {
  "kingdoms:cavalry": 5,
  // base 5 → effective 10 on charge
  "kingdoms:mercenary_lancer": 8
  // base 7 → effective 15 on charge
};
var CHARGE_KNOCKBACK = {
  "kingdoms:cavalry": 0.9,
  "kingdoms:mercenary_lancer": 1.3
};
var PROP_READY = "kc:charge_ready";
var PROP_TICK = "kc:charge_tick";
function horizontalSpeed(entity) {
  try {
    const v = entity.getVelocity();
    return Math.sqrt(v.x * v.x + v.z * v.z);
  } catch {
    return 0;
  }
}
function setChargeReady(entity, tick) {
  try {
    entity.setDynamicProperty(PROP_READY, true);
    entity.setDynamicProperty(PROP_TICK, tick);
  } catch {
  }
}
function clearCharge(entity) {
  try {
    entity.setDynamicProperty(PROP_READY, false);
  } catch {
  }
}
function isChargeReady(entity, currentTick) {
  try {
    if (!entity.getDynamicProperty(PROP_READY)) return false;
    const set = entity.getDynamicProperty(PROP_TICK);
    if (set === void 0) return false;
    return currentTick - set <= CHARGE_WINDOW_TICKS;
  } catch {
    return false;
  }
}
function tickChargeSystem(currentTick) {
  if (currentTick % VELOCITY_CHECK_INTERVAL !== 0) return;
  for (const entityId of Object.keys(CHARGE_BONUS)) {
    for (const dim of ["overworld", "nether", "the_end"]) {
      try {
        const entities = world18.getDimension(dim).getEntities({ type: entityId });
        for (const entity of entities) {
          const speed = horizontalSpeed(entity);
          if (speed >= GALLOP_THRESHOLD) {
            setChargeReady(entity, currentTick);
          } else {
            const set = entity.getDynamicProperty(PROP_TICK);
            if (entity.getDynamicProperty(PROP_READY) && set !== void 0 && currentTick - set > CHARGE_WINDOW_TICKS) {
              clearCharge(entity);
            }
          }
        }
      } catch {
      }
    }
  }
}
var SPEAR_COUNTER_DAMAGE = 6;
var SPEAR_ENTITY_ID = "kingdoms:spearman";
function registerChargeSystem() {
  world18.afterEvents.entityHitEntity.subscribe((event) => {
    const attacker = event.damagingEntity;
    const victim = event.hitEntity;
    if (!attacker || !victim) return;
    const typeId = attacker.typeId;
    const bonus = CHARGE_BONUS[typeId];
    if (bonus === void 0) return;
    const tick = getCurrentTick();
    if (!isChargeReady(attacker, tick)) return;
    if (victim.typeId === SPEAR_ENTITY_ID) {
      try {
        attacker.applyDamage(SPEAR_COUNTER_DAMAGE, { cause: "entityAttack", damagingEntity: victim });
      } catch {
      }
      try {
        const vPos = victim.location;
        const aPos = attacker.location;
        const dx = aPos.x - vPos.x;
        const dz = aPos.z - vPos.z;
        const mag = Math.sqrt(dx * dx + dz * dz) || 1;
        attacker.applyKnockback(dx / mag * 1, dz / mag * 1, 0.5, 0.4);
      } catch {
      }
      try {
        victim.dimension.spawnParticle("minecraft:large_explosion", victim.location);
        victim.runCommandAsync(
          `title @a[r=32] actionbar \xA7c\u{1F6E1} Spearmen Counter!`
        ).catch(() => {
        });
      } catch {
      }
    }
    clearCharge(attacker);
    try {
      victim.applyDamage(bonus, { cause: "entityAttack", damagingEntity: attacker });
    } catch {
    }
    const kb = CHARGE_KNOCKBACK[typeId] ?? 0.9;
    try {
      const aPos = attacker.location;
      const vPos = victim.location;
      const dx = vPos.x - aPos.x;
      const dz = vPos.z - aPos.z;
      const mag = Math.sqrt(dx * dx + dz * dz) || 1;
      victim.applyKnockback(
        dx / mag * kb,
        dz / mag * kb,
        kb * 0.5,
        // horizontal magnitude
        0.35
        // vertical kick
      );
    } catch {
    }
    const chargeLabel = typeId === "kingdoms:mercenary_lancer" ? "\xA76\u2694 Lancer Charge!" : "\xA7e\u26A1 Cavalry Charge!";
    const { x, y, z } = victim.location;
    try {
      victim.dimension.spawnParticle("minecraft:large_explosion", { x, y, z });
    } catch {
    }
    try {
      attacker.runCommandAsync(
        `playsound random.explode @a[r=24] ${x} ${y} ${z} 0.6 1.4`
      ).catch(() => {
      });
    } catch {
    }
    try {
      attacker.runCommandAsync(
        `title @a[r=32] actionbar ${chargeLabel}`
      ).catch(() => {
      });
    } catch {
    }
  });
}

// src/systems/formations.ts
init_notify();
import { world as world19, system as system5 } from "@minecraft/server";
import { ActionFormData as ActionFormData2 } from "@minecraft/server-ui";
var SEARCH_RADIUS = 48;
var HOLD_TICK_INTERVAL = 20;
var LINE_SPACING = 2.5;
var LINE_FORWARD_DIST = 5;
var PERIMETER_RADIUS = 6;
var BODYGUARD_RADIUS = 3;
var VANGUARD_FORWARD = 4;
var FLANK_LATERAL = 8;
var ARC_BACK_DIST = 8;
var ARC_SPACING = 3;
var ESCORT_LATERAL = 3;
var SCATTER_RADIUS = 10;
var RALLY_RADIUS = 4;
var HOLD_MODES = /* @__PURE__ */ new Set([
  "spear_line_hold",
  "spear_perimeter",
  "cavalry_escort",
  "heavy_vanguard",
  "heavy_bodyguard"
]);
var FORMATION_TARGETS = {
  spear_line_attack: ["kingdoms:spearman"],
  spear_line_hold: ["kingdoms:spearman"],
  spear_perimeter: ["kingdoms:spearman"],
  cavalry_flanks: ["kingdoms:cavalry", "kingdoms:mercenary_lancer"],
  cavalry_escort: ["kingdoms:cavalry", "kingdoms:mercenary_lancer"],
  archer_arc: ["kingdoms:archer"],
  archer_scatter: ["kingdoms:archer"],
  heavy_vanguard: ["kingdoms:heavy_knight", "kingdoms:samurai", "kingdoms:legionary"],
  heavy_bodyguard: ["kingdoms:heavy_knight", "kingdoms:samurai", "kingdoms:legionary"],
  all_rally: [
    "kingdoms:spearman",
    "kingdoms:cavalry",
    "kingdoms:mercenary_lancer",
    "kingdoms:archer",
    "kingdoms:heavy_knight",
    "kingdoms:samurai",
    "kingdoms:legionary",
    "kingdoms:city_guard"
  ]
};
var PROP_F_MODE = "kc:formation_mode";
var PROP_F_INDEX = "kc:formation_index";
var PROP_F_OWNER = "kc:formation_owner";
function xzNorm(v) {
  const len = Math.sqrt(v.x * v.x + v.z * v.z) || 1;
  return { x: v.x / len, z: v.z / len };
}
function right90(f) {
  return { x: f.z, z: -f.x };
}
function computePositions(mode, base, viewDir, count) {
  const fwd = xzNorm(viewDir);
  const rgt = right90(fwd);
  const positions = [];
  switch (mode) {
    case "spear_line_attack":
    case "spear_line_hold": {
      for (let i = 0; i < count; i++) {
        const offset = (i - (count - 1) / 2) * LINE_SPACING;
        positions.push({
          x: base.x + fwd.x * LINE_FORWARD_DIST + rgt.x * offset,
          y: base.y,
          z: base.z + fwd.z * LINE_FORWARD_DIST + rgt.z * offset
        });
      }
      break;
    }
    case "spear_perimeter": {
      for (let i = 0; i < count; i++) {
        const angle = i / count * Math.PI * 2;
        positions.push({
          x: base.x + Math.cos(angle) * PERIMETER_RADIUS,
          y: base.y,
          z: base.z + Math.sin(angle) * PERIMETER_RADIUS
        });
      }
      break;
    }
    case "cavalry_flanks": {
      const half = Math.ceil(count / 2);
      for (let i = 0; i < count; i++) {
        const side = i < half ? -1 : 1;
        const depth = (i < half ? i : i - half) * 2;
        positions.push({
          x: base.x + rgt.x * side * FLANK_LATERAL + fwd.x * depth,
          y: base.y,
          z: base.z + rgt.z * side * FLANK_LATERAL + fwd.z * depth
        });
      }
      break;
    }
    case "cavalry_escort": {
      for (let i = 0; i < count; i++) {
        const side = i % 2 === 0 ? -1 : 1;
        const depth = Math.floor(i / 2) * 2;
        positions.push({
          x: base.x + rgt.x * side * ESCORT_LATERAL + fwd.x * depth,
          y: base.y,
          z: base.z + rgt.z * side * ESCORT_LATERAL + fwd.z * depth
        });
      }
      break;
    }
    case "archer_arc": {
      for (let i = 0; i < count; i++) {
        const offset = (i - (count - 1) / 2) * ARC_SPACING;
        positions.push({
          x: base.x - fwd.x * ARC_BACK_DIST + rgt.x * offset,
          y: base.y,
          z: base.z - fwd.z * ARC_BACK_DIST + rgt.z * offset
        });
      }
      break;
    }
    case "archer_scatter": {
      for (let i = 0; i < count; i++) {
        const angle = i / count * Math.PI * 2;
        positions.push({
          x: base.x + Math.cos(angle) * SCATTER_RADIUS,
          y: base.y,
          z: base.z + Math.sin(angle) * SCATTER_RADIUS
        });
      }
      break;
    }
    case "heavy_vanguard": {
      for (let i = 0; i < count; i++) {
        const offset = (i - (count - 1) / 2) * 2;
        positions.push({
          x: base.x + fwd.x * VANGUARD_FORWARD + rgt.x * offset,
          y: base.y,
          z: base.z + fwd.z * VANGUARD_FORWARD + rgt.z * offset
        });
      }
      break;
    }
    case "heavy_bodyguard": {
      for (let i = 0; i < count; i++) {
        const angle = i / count * Math.PI * 2;
        positions.push({
          x: base.x + Math.cos(angle) * BODYGUARD_RADIUS,
          y: base.y,
          z: base.z + Math.sin(angle) * BODYGUARD_RADIUS
        });
      }
      break;
    }
    case "all_rally": {
      for (let i = 0; i < count; i++) {
        const angle = i / count * Math.PI * 2;
        const r = RALLY_RADIUS + i % 3;
        positions.push({
          x: base.x + Math.cos(angle) * r,
          y: base.y,
          z: base.z + Math.sin(angle) * r
        });
      }
      break;
    }
  }
  return positions;
}
function findOwnedTroops(player, entityTypes) {
  const dim = player.dimension;
  const loc = player.location;
  const found = [];
  for (const entityType of entityTypes) {
    try {
      const entities = dim.getEntities({ type: entityType, location: loc, maxDistance: SEARCH_RADIUS });
      for (const e of entities) {
        if (e.getDynamicProperty("kc:owner") === player.name) {
          found.push(e);
        }
      }
    } catch {
    }
  }
  return found;
}
function clearFormationTag(entity) {
  try {
    entity.setDynamicProperty(PROP_F_MODE, "");
  } catch {
  }
}
function applyFormation(player, mode) {
  const troops = findOwnedTroops(player, FORMATION_TARGETS[mode]);
  if (troops.length === 0) return 0;
  const positions = computePositions(
    mode,
    player.location,
    player.getViewDirection(),
    troops.length
  );
  const isHold = HOLD_MODES.has(mode);
  troops.forEach((troop, i) => {
    const pos = positions[i];
    if (!pos) return;
    try {
      troop.setDynamicProperty("kc:f_target", `${pos.x},${pos.y},${pos.z}`);
      troop.setDynamicProperty(PROP_F_OWNER, player.name);
    } catch {
    }
    if (isHold) {
      try {
        troop.setDynamicProperty(PROP_F_MODE, mode);
        troop.setDynamicProperty(PROP_F_INDEX, i);
        troop.setDynamicProperty(PROP_F_OWNER, player.name);
      } catch {
      }
    } else {
      clearFormationTag(troop);
    }
  });
  return troops.length;
}
var FORMATION_MOVE_STEP = 0.45;
var FORMATION_ARRIVE_THRESHOLD = 1.2;
function tickFormationMovement() {
  for (const player of world19.getPlayers()) {
    const allTypes = [...new Set(Object.values(FORMATION_TARGETS).flat())];
    const dim = player.dimension;
    const loc = player.location;
    for (const entityType of allTypes) {
      try {
        const entities = dim.getEntities({ type: entityType, location: loc, maxDistance: SEARCH_RADIUS * 2 });
        for (const e of entities) {
          if (e.getDynamicProperty(PROP_F_OWNER) !== player.name) continue;
          const raw = e.getDynamicProperty("kc:f_target");
          if (!raw || typeof raw !== "string" || raw === "") continue;
          const parts = raw.split(",");
          if (parts.length < 3) continue;
          const tx = parseFloat(parts[0]), ty = parseFloat(parts[1]), tz = parseFloat(parts[2]);
          if (isNaN(tx) || isNaN(ty) || isNaN(tz)) continue;
          const ex = e.location.x, ey = e.location.y, ez = e.location.z;
          const dx = tx - ex, dz = tz - ez;
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist < FORMATION_ARRIVE_THRESHOLD) {
            try { e.teleport({ x: tx, y: ty, z: tz }, { dimension: dim }); } catch {}
            try { e.setDynamicProperty("kc:f_target", ""); } catch {}
            continue;
          }
          const step = Math.min(FORMATION_MOVE_STEP, dist);
          const nx = ex + (dx / dist) * step;
          const nz = ez + (dz / dist) * step;
          try { e.teleport({ x: nx, y: ty, z: nz }, { dimension: dim }); } catch {}
        }
      } catch {}
    }
  }
}
function dismissAllFormations(player) {
  const all = findOwnedTroops(player, FORMATION_TARGETS["all_rally"]);
  for (const e of all) clearFormationTag(e);
  return all.length;
}
function tickFormations(currentTick) {
  if (currentTick % HOLD_TICK_INTERVAL !== 0) return;
  for (const player of world19.getPlayers()) {
    for (const entityTypes of Object.values(FORMATION_TARGETS)) {
      try {
        const dim = player.dimension;
        const loc = player.location;
        const viewDir = player.getViewDirection();
        const groups = /* @__PURE__ */ new Map();
        for (const entityType of entityTypes) {
          try {
            const entities = dim.getEntities({
              type: entityType,
              location: loc,
              maxDistance: SEARCH_RADIUS * 2
            });
            for (const e of entities) {
              if (e.getDynamicProperty(PROP_F_OWNER) !== player.name) continue;
              const mode = e.getDynamicProperty(PROP_F_MODE);
              if (!mode || !HOLD_MODES.has(mode)) continue;
              if (!groups.has(mode)) groups.set(mode, []);
              groups.get(mode).push(e);
            }
          } catch {
          }
        }
        for (const [mode, troops] of groups) {
          const positions = computePositions(
            mode,
            loc,
            viewDir,
            troops.length
          );
          troops.forEach((troop, i) => {
            const idx = troop.getDynamicProperty(PROP_F_INDEX) ?? i;
            const pos = positions[idx] ?? positions[i];
            if (!pos) return;
            try {
              troop.teleport(pos, { dimension: dim });
            } catch {
            }
          });
        }
      } catch {
      }
    }
  }
}
var MENU_COOLDOWN_MS = 500;
var lastMenuTime = /* @__PURE__ */ new Map();
function openTacticsMenu(player) {
  const now = Date.now();
  const last = lastMenuTime.get(player.name) ?? 0;
  if (now - last < MENU_COOLDOWN_MS) return;
  lastMenuTime.set(player.name, now);
  void showMainMenu(player);
}
async function showMainMenu(player) {
  const form = new ActionFormData2().title("\u2694 Tactical Command").body("\xA77Choose a unit type to issue orders to your nearby troops.\n\xA78Range: 48 blocks \xB7 Only your deployed soldiers respond.").button("\u{1F5E1} Spearmen Tactics").button("\u{1F434} Cavalry / Lancer Tactics").button("\u{1F3F9} Archer Tactics").button("\u{1F6E1} Heavy Infantry Tactics").button("\u{1F514} Rally All Troops").button("\u2716 Dismiss All Formations");
  const resp = await form.show(player);
  if (resp.canceled) return;
  switch (resp.selection) {
    case 0:
      await showSpearmenMenu(player);
      break;
    case 1:
      await showCavalryMenu(player);
      break;
    case 2:
      await showArcherMenu(player);
      break;
    case 3:
      await showHeavyMenu(player);
      break;
    case 4: {
      const n = applyFormation(player, "all_rally");
      if (n === 0) notifyPlayer(player.name, "\xA7eNo deployed troops nearby to rally.");
      else notifyPlayer(player.name, `\xA7a\u{1F514} \xA7f${n}\xA7a troop${n > 1 ? "s" : ""} rallied to your position!`);
      break;
    }
    case 5: {
      const n = dismissAllFormations(player);
      if (n === 0) notifyPlayer(player.name, "\xA7eNo troops in formation nearby.");
      else notifyPlayer(player.name, `\xA7e\u2716 Formations dismissed. \xA7f${n}\xA7e troop${n > 1 ? "s" : ""} released.`);
      break;
    }
  }
}
async function showSpearmenMenu(player) {
  const form = new ActionFormData2().title("\u{1F5E1} Spearmen Tactics").body(
    "\xA7eSpearmen excel in defensive lines and perimeter control.\n\n\xA7f\u25B6 Line + Attack \xA77\u2014 Line up ahead of you, then charge enemies.\n\xA7f\u25B6 Line + Hold \xA77\u2014 Hold a defensive line. Re-enforced every second.\n\xA7f\u25B6 Perimeter \xA77\u2014 Ring of pikes around you. Ideal vs. surrounded attacks.\n\xA78Counter-charge: Spearmen deal \xA7c+6 damage \xA78back to charging cavalry!"
  ).button("\u2694 Line Formation \u2014 Attack").button("\u{1F6E1} Line Formation \u2014 Hold").button("\u{1F504} Perimeter Defense").button("\u2190 Back");
  const resp = await form.show(player);
  if (resp.canceled) return;
  switch (resp.selection) {
    case 0:
      issueOrder(player, "spear_line_attack", "\xA7aSpearmen advance in line!");
      break;
    case 1:
      issueOrder(player, "spear_line_hold", "\xA7aSpearmen holding the line!");
      break;
    case 2:
      issueOrder(player, "spear_perimeter", "\xA7aSpearmen forming perimeter!");
      break;
    case 3:
      await showMainMenu(player);
      break;
  }
}
async function showCavalryMenu(player) {
  const form = new ActionFormData2().title("\u{1F434} Cavalry / Lancer Tactics").body(
    "\xA7eMounted units are fast and devastating on the charge.\n\n\xA7f\u25B6 Charge Flanks \xA77\u2014 Split left & right, then unleash AI. Best for open battles.\n\xA7f\u25B6 Escort \xA77\u2014 Ride alongside you. Re-enforced. Great for moving through enemy territory.\n\xA78Charge bonus: \xA76+5 dmg \xA78(Cavalry) / \xA76+8 dmg \xA78(Lancer) + knockback on first hit after gallop."
  ).button("\u26A1 Charge Flanks").button("\u{1F40E} Escort Formation").button("\u2190 Back");
  const resp = await form.show(player);
  if (resp.canceled) return;
  switch (resp.selection) {
    case 0:
      issueOrder(player, "cavalry_flanks", "\xA7aCavalry splitting to flanks!");
      break;
    case 1:
      issueOrder(player, "cavalry_escort", "\xA7aCavalry moving to escort position!");
      break;
    case 2:
      await showMainMenu(player);
      break;
  }
}
async function showArcherMenu(player) {
  const form = new ActionFormData2().title("\u{1F3F9} Archer Tactics").body(
    "\xA7eArchers deal sustained ranged damage from a distance.\n\n\xA7f\u25B6 Ranged Arc \xA77\u2014 Arched line behind you, firing over your front line.\n\xA7f\u25B6 Scatter & Cover \xA77\u2014 Spread wide around the battlefield."
  ).button("\u{1F3F9} Ranged Arc").button("\u{1F310} Scatter & Cover").button("\u2190 Back");
  const resp = await form.show(player);
  if (resp.canceled) return;
  switch (resp.selection) {
    case 0:
      issueOrder(player, "archer_arc", "\xA7aArchers forming ranged arc!");
      break;
    case 1:
      issueOrder(player, "archer_scatter", "\xA7aArchers scattering to cover positions!");
      break;
    case 2:
      await showMainMenu(player);
      break;
  }
}
async function showHeavyMenu(player) {
  const form = new ActionFormData2().title("\u{1F6E1} Heavy Infantry Tactics").body(
    "\xA7eHeavy Knights, Samurai & Legionaries are elite front-line fighters.\n\n\xA7f\u25B6 Vanguard \xA77\u2014 Form a wall just ahead of you. Re-enforced. Ideal for sieges.\n\xA7f\u25B6 Bodyguard \xA77\u2014 Tight ring around you. Re-enforced. Maximum personal protection."
  ).button("\u2694 Vanguard Line").button("\u{1F6E1} Bodyguard Ring").button("\u2190 Back");
  const resp = await form.show(player);
  if (resp.canceled) return;
  switch (resp.selection) {
    case 0:
      issueOrder(player, "heavy_vanguard", "\xA7aHeavy infantry moving to vanguard!");
      break;
    case 1:
      issueOrder(player, "heavy_bodyguard", "\xA7aElite guard forming bodyguard ring!");
      break;
    case 2:
      await showMainMenu(player);
      break;
  }
}
function issueOrder(player, mode, successMsg) {
  system5.run(() => {
    const n = applyFormation(player, mode);
    if (n === 0) {
      const targets = FORMATION_TARGETS[mode];
      const label = targets.map((t) => t.replace("kingdoms:", "").replace(/_/g, " ")).join(", ");
      notifyPlayer(player.name, `\xA7eNo ${label} found within ${SEARCH_RADIUS} blocks.`);
    } else {
      notifyPlayer(player.name, `${successMsg} \xA7f(${n} unit${n > 1 ? "s" : ""})`);
    }
  });
}

// src/main.ts
function checkThreeWool(woolType, loc, dim) {
  const dirs = [[1, 0], [0, 1]];
  for (const [dx, dz] of dirs) {
    const b1 = dim.getBlock({ x: loc.x + dx, y: loc.y, z: loc.z + dz });
    const b2 = dim.getBlock({ x: loc.x + dx * 2, y: loc.y, z: loc.z + dz * 2 });
    const b3 = dim.getBlock({ x: loc.x - dx, y: loc.y, z: loc.z - dz });
    if (b1?.typeId === woolType && b2?.typeId === woolType) return true;
    if (b1?.typeId === woolType && b3?.typeId === woolType) return true;
  }
  return false;
}
async function triggerWoolDiplomacy(player, targetVillage, isBlack) {
  const myKingdom = getKingdomOf(player.name);
  if (!myKingdom) {
    notifyPlayer(player.name, "\xA7cYou must be in a kingdom to use wool diplomacy.");
    return;
  }
  const enemyKingdom = getKingdom(targetVillage.kingdomId);
  if (!enemyKingdom) return;
  if (isBlack) {
    if (areAtWar(myKingdom.id, enemyKingdom.id)) {
      notifyPlayer(player.name, `\xA7cAlready at war with \xA7b${enemyKingdom.name}\xA7c.`);
      return;
    }
    const form = new MessageFormData().title("\u2694 Declare War?").body(
      `You placed 3 black wool in \xA7b${targetVillage.name}\xA7r!

This declares WAR on \xA7c${enemyKingdom.name}\xA7r (King: ${enemyKingdom.king}).

\xA77This cannot be undone without a peace treaty.`
    ).button1("\u2694 DECLARE WAR").button2("Cancel");
    const resp = await form.show(player);
    if (resp.selection === 0) {
      declareWar(myKingdom.id, enemyKingdom.id);
      for (const p of world20.getPlayers()) {
        notifyPlayer(p.name, `\xA7c\u2694 WAR DECLARED! \xA7f${player.name} \xA77(${myKingdom.name}) \xA7chas declared war on \xA7b${enemyKingdom.name}\xA7c!`);
      }
    }
    return;
  }
  const atWar = areAtWar(myKingdom.id, enemyKingdom.id);
  const requestType = atWar ? "peace" : "alliance";
  const cooldownKey = `${myKingdom.id}:${enemyKingdom.id}`;
  const cooldownExpiry = myKingdom.peaceCooldowns?.[cooldownKey] ?? 0;
  if (getCurrentTick() < cooldownExpiry) {
    const days = ((cooldownExpiry - getCurrentTick()) / TICKS_PER_DAY).toFixed(1);
    notifyPlayer(player.name, `\xA7c${enemyKingdom.name} denied your last request. Wait \xA7e${days}\xA7c more in-game days.`);
    return;
  }
  if (!atWar && enemyKingdom.alliances?.includes(myKingdom.id)) {
    notifyPlayer(player.name, `\xA7aAlready allied with \xA7b${enemyKingdom.name}\xA7a.`);
    return;
  }
  const label = requestType === "peace" ? "\u2709 Peace Offer" : "\u2709 Alliance Offer";
  enemyKingdom.pendingDiplomacy = {
    fromKingdomId: myKingdom.id,
    toKingdomId: enemyKingdom.id,
    type: requestType,
    senderName: player.name,
    cooldownKey
  };
  saveKingdom(enemyKingdom);
  notifyPlayer(player.name, `\xA7a${label} sent to \xA7b${enemyKingdom.name}\xA7a (${enemyKingdom.king}). Awaiting response...`);
  notifyPlayer(enemyKingdom.king, `\xA7e\u{1F4DC} \xA7b${myKingdom.name}\xA7e sent a \xA7f${label}\xA7e. Interact with any waypoint or use /scriptevent kc:diplomacy to respond.`);
  const targetOnline = world20.getPlayers().find((p) => p.name === enemyKingdom.king);
  if (targetOnline) void showPendingDiplomacyRequest(targetOnline);
}
async function showPendingDiplomacyRequest(player) {
  const playerKingdom = getKingdomOf(player.name);
  const req = playerKingdom?.pendingDiplomacy;
  if (!req || !playerKingdom) return;
  const senderKingdom = getKingdom(req.fromKingdomId);
  if (!senderKingdom) {
    playerKingdom.pendingDiplomacy = void 0;
    saveKingdom(playerKingdom);
    return;
  }
  const label = req.type === "peace" ? "\u2709 Peace Offer" : "\u2709 Alliance Offer";
  const body = req.type === "peace" ? `\xA7b${senderKingdom.name}\xA7r has offered PEACE.
Sent by: \xA7f${req.senderName}

Accept = end the war.
Deny = block requests for 2 in-game days.` : `\xA7b${senderKingdom.name}\xA7r requests an ALLIANCE.
Sent by: \xA7f${req.senderName}

Accept = form alliance (soldiers won't clash).
Deny = block requests for 2 in-game days.`;
  const form = new MessageFormData().title(label).body(body).button1("\u2705 Accept").button2("\u274C Deny");
  const resp = await form.show(player);
  playerKingdom.pendingDiplomacy = void 0;
  saveKingdom(playerKingdom);
  if (resp.selection === 0) {
    if (req.type === "peace") {
      makePeace(req.fromKingdomId, req.toKingdomId);
      notifyPlayer(req.senderName, `\xA7a\u2705 ${player.name} accepted peace! The war with \xA7b${senderKingdom.name}\xA7a is over.`);
      notifyPlayer(player.name, `\xA7aPeace established with \xA7b${senderKingdom.name}\xA7a.`);
    } else {
      formAlliance(req.fromKingdomId, req.toKingdomId);
      notifyPlayer(req.senderName, `\xA7a\u2705 ${player.name} accepted the alliance with \xA7b${senderKingdom.name}\xA7a!`);
      notifyPlayer(player.name, `\xA7aAlliance formed with \xA7b${senderKingdom.name}\xA7a!`);
    }
  } else {
    const freshSender = getKingdom(req.fromKingdomId);
    if (freshSender) {
      freshSender.peaceCooldowns ?? (freshSender.peaceCooldowns = {});
      freshSender.peaceCooldowns[req.cooldownKey] = getCurrentTick() + TICKS_PER_DAY * 2;
      saveKingdom(freshSender);
    }
    notifyPlayer(req.senderName, `\xA7c${player.name} denied your ${req.type} offer. Try again in 2 in-game days.`);
    notifyPlayer(player.name, `\xA7eOffer denied.`);
  }
}
var CUSTOM_BLOCKS = {
  MATERIAL_STORAGE: "kingdoms:storage",
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
  CASTLE: "kingdoms:castle"
};
function findVillageAt2(location) {
  return getAllVillages().find((v) => {
    const dx = v.location.x - location.x;
    const dz = v.location.z - location.z;
    return Math.sqrt(dx * dx + dz * dz) < 64;
  });
}
var TROOP_TYPE_TO_TOKEN = {
  cityGuards: "kingdoms:guard_token",
  spearmen: "kingdoms:spearman_token",
  archers: "kingdoms:archer_token",
  cavalry: "kingdoms:cavalry_token",
  heavyKnight: "kingdoms:heavy_knight_token",
  samurai: "kingdoms:samurai_token",
  mercenaryLancer: "kingdoms:mercenary_lancer_token",
  legionary: "kingdoms:legionary_token"
};
var RESOURCE_DROP_MAP = {
  iron: "minecraft:iron_ingot",
  gold: "minecraft:gold_ingot",
  coal: "minecraft:coal",
  wood: "minecraft:oak_log",
  stone: "minecraft:cobblestone",
  diamonds: "minecraft:diamond"
};
function dropItemsAtLocation(dimension, location, itemId, totalCount) {
  if (totalCount <= 0) return;
  const dropLoc = { x: location.x + 0.5, y: location.y + 1, z: location.z + 0.5 };
  let remaining = totalCount;
  while (remaining > 0) {
    const stackSize = Math.min(remaining, 64);
    try {
      dimension.spawnItem(new ItemStack6(itemId, stackSize), dropLoc);
    } catch {
    }
    remaining -= stackSize;
  }
}
world20.afterEvents.playerPlaceBlock.subscribe((event) => {
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
    const tsVillage = findVillageAt2(block.location);
    const tsLoc = { x: block.location.x, y: block.location.y, z: block.location.z };
    const tsDim = block.dimension;
    let tsDenyMsg = "";
    if (!tsVillage || tsVillage.owner !== player.name) {
      tsDenyMsg = "\xA7cClaim a village first before placing a Trade Station.";
    } else if (tsVillage.hasTradeStation) {
      tsDenyMsg = `\xA7c\xA7b${tsVillage.name}\xA7c already has a Trade Station. Break the old one first.`;
    }
    if (tsDenyMsg) {
      notifyPlayer(player.name, tsDenyMsg);
      system6.run(() => {
        try {
          tsDim.runCommand(`setblock ${tsLoc.x} ${tsLoc.y} ${tsLoc.z} air destroy`);
          tsDim.spawnItem(new ItemStack6(CUSTOM_BLOCKS.TRADE_STATION, 1), { x: tsLoc.x + 0.5, y: tsLoc.y + 1, z: tsLoc.z + 0.5 });
        } catch {
        }
      });
      return;
    }
    registerTradeStation(tsVillage, block.location);
  }
  if (typeId === CUSTOM_BLOCKS.MATERIAL_STORAGE) {
    const stVillage = findVillageAt2(block.location);
    const stLoc = { x: block.location.x, y: block.location.y, z: block.location.z };
    const stDim = block.dimension;
    let stDenyMsg = "";
    if (!stVillage || stVillage.owner !== player.name) {
      stDenyMsg = "\xA7cClaim a village first before placing a Material Storage.";
    } else if (stVillage.hasStorage) {
      stDenyMsg = `\xA7c\xA7b${stVillage.name}\xA7c already has a Material Storage. Break the old one first.`;
    }
    if (stDenyMsg) {
      notifyPlayer(player.name, stDenyMsg);
      system6.run(() => {
        try {
          stDim.runCommand(`setblock ${stLoc.x} ${stLoc.y} ${stLoc.z} air destroy`);
          stDim.spawnItem(new ItemStack6(CUSTOM_BLOCKS.MATERIAL_STORAGE, 1), { x: stLoc.x + 0.5, y: stLoc.y + 1, z: stLoc.z + 0.5 });
        } catch {
        }
      });
      return;
    }
    registerMaterialStorage(stVillage, block.location);
  }
  if (typeId === CUSTOM_BLOCKS.GRANARY) {
    const village = findVillageAt2(block.location);
    if (village && village.owner === player.name) {
      village.granaryLocation = block.location;
      village.hasGranary = true;
      saveVillage(village);
      notifyPlayer(player.name, `\xA7aGranary registered for \xA7b${village.name}\xA7a.`);
    }
  }
  if (typeId === CUSTOM_BLOCKS.TREASURY_BLOCK) {
    const village = findVillageAt2(block.location);
    if (village && village.owner === player.name) {
      village.treasuryLocation = block.location;
      village.hasTreasury = true;
      saveVillage(village);
      notifyPlayer(player.name, `\xA7aVillage Treasury registered for \xA7b${village.name}\xA7a.`);
    }
  }
  if (typeId === "kingdoms:waypoint") {
    const village = findVillageAt2(block.location);
    if (!village) {
      notifyPlayer(player.name, "\xA7cNo village territory here. Must be inside a claimed village.");
      return;
    }
    if (village.owner !== player.name) {
      notifyPlayer(player.name, "\xA7cThis is not your village.");
      return;
    }
    registerWaypoint(village, block.location);
  }
  if (typeId === CUSTOM_BLOCKS.CASTLE) {
    const village = findVillageAt2(block.location);
    if (!village) {
      notifyPlayer(player.name, "\xA7cNo village territory here. Claim a village first.");
      return;
    }
    if (village.owner !== player.name) {
      notifyPlayer(player.name, "\xA7cThis is not your village.");
      return;
    }
    if (village.hasCastle) {
      notifyPlayer(player.name, `\xA7c\xA7b${village.name}\xA7c already has a Castle.`);
      return;
    }
    village.hasCastle = true;
    saveVillage(village);
    notifyPlayer(player.name, `\xA7a\u{1F3F0} Castle established in \xA7b${village.name}\xA7a! Elite troops are now available.`);
  }
  if (typeId === "minecraft:black_wool" || typeId === "minecraft:white_wool") {
    const woolVillage = findVillageAt2(block.location);
    if (woolVillage && woolVillage.owner && woolVillage.owner !== player.name) {
      if (checkThreeWool(typeId, block.location, block.dimension)) {
        void triggerWoolDiplomacy(player, woolVillage, typeId === "minecraft:black_wool");
      }
    }
  }
  if (typeId === CUSTOM_BLOCKS.BARRACKS) {
    const bVillage = findVillageAt2(block.location);
    let denyMsg = "";
    if (!bVillage || bVillage.owner !== player.name) {
      denyMsg = "\xA7cClaim a village first before building a Barracks.";
    } else if (!bVillage.hasGranary) {
      denyMsg = "\xA7cBarracks requires a \xA7bGranary\xA7c to be built in this village first.";
    } else if (!bVillage.hasTreasury) {
      denyMsg = "\xA7cBarracks requires a \xA7bTreasury\xA7c to be built in this village first.";
    }
    if (denyMsg) {
      notifyPlayer(player.name, denyMsg);
      const bLoc = { x: block.location.x, y: block.location.y, z: block.location.z };
      const bDim = block.dimension;
      system6.run(() => {
        try {
          bDim.runCommand(`setblock ${bLoc.x} ${bLoc.y} ${bLoc.z} air destroy`);
          bDim.spawnItem(
            new ItemStack6(CUSTOM_BLOCKS.BARRACKS, 1),
            { x: bLoc.x + 0.5, y: bLoc.y + 1, z: bLoc.z + 0.5 }
          );
        } catch {
        }
      });
      return;
    }
  }
  if (STRUCTURE_BLOCK_IDS.has(typeId)) {
    const origin = { x: block.location.x, y: block.location.y, z: block.location.z };
    const dimension = block.dimension;
    notifyPlayer(player.name, `\xA77Building \xA7b${typeId.replace("kingdoms:", "").replace(/_/g, " ")}\xA77\u2026`);
    system6.run(() => {
      generateStructure(dimension, origin, typeId);
      spawnStructureHub(dimension, origin, typeId);
    });
  }
});
var MENU_COOLDOWN_TICKS = 10;
var lastMenuTick = /* @__PURE__ */ new Map();
function canOpenMenu(playerName) {
  const tick = getCurrentTick();
  const last = lastMenuTick.get(playerName) ?? -99;
  if (tick - last < MENU_COOLDOWN_TICKS) return false;
  lastMenuTick.set(playerName, tick);
  return true;
}
function spawnStructureHub(dimension, blockLocation, blockTypeId) {
  try {
    removeStructureHub(dimension, blockLocation);
    const entity = dimension.spawnEntity(
      "kingdoms:structure_hub",
      { x: blockLocation.x + 0.5, y: blockLocation.y, z: blockLocation.z + 0.5 }
    );
    entity.setDynamicProperty("kc:structure_type", blockTypeId);
    entity.setDynamicProperty("kc:block_loc", JSON.stringify(blockLocation));
  } catch {
  }
}
function removeStructureHub(dimension, blockLocation) {
  try {
    const nearby = dimension.getEntities({
      type: "kingdoms:structure_hub",
      location: { x: blockLocation.x + 0.5, y: blockLocation.y, z: blockLocation.z + 0.5 },
      maxDistance: 2
    });
    for (const entity of nearby) {
      try {
        entity.remove();
      } catch {
      }
    }
  } catch {
  }
}
world20.afterEvents.itemStartUseOn.subscribe((event) => {
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
    case CUSTOM_BLOCKS.MATERIAL_STORAGE:
      void showMaterialStorageMenu(player, block);
      break;
    case "kingdoms:waypoint": {
      const wpVillage = findVillageAt2(block.location);
      if (wpVillage && wpVillage.waypointLocation) {
        void showWaypointMenu(player, wpVillage);
        const wpKingdom = getKingdomOf(player.name);
        if (wpKingdom?.pendingDiplomacy) {
          system6.runTimeout(() => {
            void showPendingDiplomacyRequest(player);
          }, 40);
        }
      }
      break;
    }
  }
});
world20.afterEvents.playerBreakBlock.subscribe((event) => {
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
  if (typeId === CUSTOM_BLOCKS.MATERIAL_STORAGE) {
    const village = findVillageAt2(blockLoc);
    if (village) {
      const loc = village.storageLocation;
      if (loc && loc.x === blockLoc.x && loc.y === blockLoc.y && loc.z === blockLoc.z) {
        const rs = village.resourceStorage;
        if (rs) {
          const dim = player.dimension;
          for (const [key, itemId] of Object.entries(RESOURCE_DROP_MAP)) {
            dropItemsAtLocation(dim, blockLoc, itemId, rs[key] ?? 0);
          }
          village.resourceStorage = { iron: 0, gold: 0, coal: 0, wood: 0, stone: 0, diamonds: 0 };
        }
        removeMaterialStorage(village);
        notifyPlayer(player.name, `\xA7eAll stored resources dropped from \xA7b${village.name}\xA7e Material Storage!`);
      }
    }
  }
  if (typeId === CUSTOM_BLOCKS.BARRACKS) {
    const village = findVillageAt2(blockLoc);
    if (village) {
      const dim = player.dimension;
      const troops = village.troops;
      let droppedAny = false;
      for (const [troopType, tokenId] of Object.entries(TROOP_TYPE_TO_TOKEN)) {
        const count = troops[troopType] ?? 0;
        if (count > 0) {
          dropItemsAtLocation(dim, blockLoc, tokenId, count);
          droppedAny = true;
        }
      }
      village.troops = { cityGuards: 0, spearmen: 0, archers: 0, cavalry: 0, heavyKnight: 0, samurai: 0, mercenaryLancer: 0, legionary: 0 };
      saveVillage(village);
      if (droppedAny) {
        notifyPlayer(player.name, `\xA7eTroop tokens dropped from \xA7b${village.name}\xA7e Barracks!`);
      }
    }
  }
  if (typeId === CUSTOM_BLOCKS.GRANARY) {
    const village = findVillageAt2(blockLoc);
    if (village && village.granaryLocation) {
      const loc = village.granaryLocation;
      if (loc.x === blockLoc.x && loc.y === blockLoc.y && loc.z === blockLoc.z) {
        const dim = player.dimension;
        if (village.granaryItems) {
          for (const [itemId, amount] of Object.entries(village.granaryItems)) {
            if (amount > 0) dropItemsAtLocation(dim, blockLoc, itemId, amount);
          }
          village.granaryItems = {};
        }
        village.foodStorage = 0;
        village.granaryLocation = void 0;
        saveVillage(village);
        notifyPlayer(player.name, `\xA7eStored food dropped from \xA7b${village.name}\xA7e Granary!`);
      }
    }
  }
  if (typeId === CUSTOM_BLOCKS.TREASURY_BLOCK) {
    const village = findVillageAt2(blockLoc);
    if (village && village.treasuryLocation) {
      const loc = village.treasuryLocation;
      if (loc.x === blockLoc.x && loc.y === blockLoc.y && loc.z === blockLoc.z) {
        const dim = player.dimension;
        const emeraldCount = village.treasury ?? 0;
        if (emeraldCount > 0) {
          dropItemsAtLocation(dim, blockLoc, "minecraft:emerald", emeraldCount);
          village.treasury = 0;
        }
        village.treasuryLocation = void 0;
        saveVillage(village);
        notifyPlayer(player.name, `\xA7eStored emeralds dropped from \xA7b${village.name}\xA7e Treasury!`);
      }
    }
  }
  if (typeId === "kingdoms:waypoint") {
    const village = findVillageAt2(blockLoc);
    if (village && village.waypointLocation) {
      const loc = village.waypointLocation;
      if (loc.x === blockLoc.x && loc.y === blockLoc.y && loc.z === blockLoc.z) {
        removeWaypoint(village);
      }
    }
  }
  if (typeId === CUSTOM_BLOCKS.CASTLE) {
    const village = findVillageAt2(blockLoc);
    if (village && village.hasCastle) {
      village.hasCastle = false;
      saveVillage(village);
      notifyPlayer(player.name, `\xA7c\u{1F3F0} Castle in \xA7b${village.name}\xA7c has been destroyed. Elite troops are no longer available.`);
    }
  }
  if (STRUCTURE_BLOCK_IDS.has(typeId)) {
    const origin = { x: blockLoc.x, y: blockLoc.y, z: blockLoc.z };
    const dimension = player.dimension;
    system6.run(() => {
      demolishStructure(dimension, origin, typeId);
      removeStructureHub(dimension, origin);
    });
  }
});
world20.afterEvents.playerInteractWithEntity.subscribe((event) => {
  const player = event.player;
  const entity = event.target;
  if (!player || !entity) return;
  if (entity.typeId !== "kingdoms:structure_hub") return;
  if (!canOpenMenu(player.name)) return;
  const structureType = entity.getDynamicProperty("kc:structure_type");
  const blockLocStr = entity.getDynamicProperty("kc:block_loc");
  if (!structureType || !blockLocStr) return;
  let blockLoc;
  try {
    blockLoc = JSON.parse(blockLocStr);
  } catch {
    return;
  }
  const block = player.dimension.getBlock(blockLoc);
  if (!block) return;
  switch (structureType) {
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
    case CUSTOM_BLOCKS.MATERIAL_STORAGE:
      void showMaterialStorageMenu(player, block);
      break;
    case "kingdoms:waypoint": {
      const wpVillage = findVillageAt2(blockLoc);
      if (wpVillage && wpVillage.waypointLocation) {
        void showWaypointMenu(player, wpVillage);
        const wpKingdom = getKingdomOf(player.name);
        if (wpKingdom?.pendingDiplomacy) {
          system6.runTimeout(() => {
            void showPendingDiplomacyRequest(player);
          }, 40);
        }
      }
      break;
    }
  }
});
world20.afterEvents.playerJoin.subscribe((event) => {
  const playerName = event.playerName;
  system6.runTimeout(() => {
    const player = world20.getPlayers().find((p) => p.name === playerName);
    if (!player) return;
    const starterKey = `kc:starter_${playerName}`;
    if (!world20.getDynamicProperty(starterKey)) {
      const inv = player.getComponent(EntityInventoryComponent8.componentId);
      if (inv?.container) {
        inv.container.addItem(new ItemStack6("kingdoms:town_hall_item", 1));
        inv.container.addItem(new ItemStack6("kingdoms:village_spawner", 1));
        inv.container.addItem(new ItemStack6("dg:hammer", 1));
        inv.container.addItem(new ItemStack6("minecraft:emerald", 60));
        inv.container.addItem(new ItemStack6("minecraft:wheat", 60));
        world20.setDynamicProperty(starterKey, true);
        player.sendMessage(
          `\xA7a\xA7lWelcome to Kingdoms & Conquest!\xA7r
\xA77You received: \xA7f1 Town Hall\xA77, \xA7f1 Village Spawner\xA77, \xA7f1 Quick Craft Hammer\xA77, \xA7f60 Emeralds\xA77, \xA7f60 Wheat\xA77.
\xA7ePlace the Village Spawner first, then build your Town Hall! \xA7bBuild a Castle\xA7e to unlock the Quick Craft Hammer.`
        );
      }
    }
    const kingdom = getKingdomOf(playerName);
    if (kingdom?.pendingDiplomacy) void showPendingDiplomacyRequest(player);
  }, 100);
});
startVillagerBowSystem();
registerChargeSystem();
loadSiegesFromStorage();
system6.runInterval(() => {
  tickFormationMovement();
}, 3);
system6.runInterval(() => {
  const tick = getCurrentTick();
  tickWatchtowers(tick);
  tickTradeStations(tick);
  tickSieges(tick);
  tickBorders(tick);
  tickAutoDefense(tick);
  tickChargeSystem(tick);
  tickFormations(tick);
  tickPendingReinforcements(tick);
  for (const village of getAllVillages()) {
    tickTraining(village, tick);
  }
  tickAllMerchantsSpawn(tick);
  tickAllMerchantMovement();
  tickAllMinerProduction(tick);
}, 20);
system6.runInterval(() => {
  processAllFood();
  processAllWages();
  processAllPopulation();
  tickBandits();
  processAllSoldierFood();
  autoHarvestAllVillages();
  checkDailyCrisisAlerts();
}, 24e3);
system6.runInterval(() => {
  refreshAllGuards();
}, 12e3);
system6.runInterval(() => {
  enforceGuardPositions();
}, 600);
system6.runInterval(() => {
  cleanupOrphanedHorses();
}, 400);
system6.runInterval(() => {
  for (const village of getAllVillages()) {
    updateHousingCapacity(village.id);
  }
}, 72e3);
world20.beforeEvents.itemUse.subscribe((event) => {
  const player = event.source;
  const itemId = event.itemStack?.typeId;
  if (itemId !== "dg:hammer") return;
  const ownedVillages = getAllVillages().filter((v) => v.owner === player.name);
  const castleVillage = ownedVillages.find((v) => v.hasCastle);
  if (!castleVillage) {
    event.cancel = true;
    system6.run(() => {
      notifyPlayer(player.name, "\xA7c\u{1F3F0} You need a \xA7bCastle\xA7c built in your kingdom to use the Quick Craft Hammer!");
    });
    return;
  }
  const HAMMER_WOOD_COST = 20;
  const HAMMER_STONE_COST = 15;
  const HAMMER_FOOD_COST = 10;
  const rs = castleVillage.resourceStorage;
  if ((rs.wood ?? 0) < HAMMER_WOOD_COST || (rs.stone ?? 0) < HAMMER_STONE_COST || (castleVillage.foodStorage ?? 0) < HAMMER_FOOD_COST) {
    event.cancel = true;
    system6.run(() => {
      notifyPlayer(
        player.name,
        `\xA7c\u{1F528} Quick Craft requires \xA7f${HAMMER_WOOD_COST} Wood\xA7c, \xA7f${HAMMER_STONE_COST} Stone\xA7c, \xA7f${HAMMER_FOOD_COST} Food\xA7c in \xA7b${castleVillage.name}\xA7c.\n\xA77Current \u2014 Wood: \xA7f${rs.wood ?? 0}\xA77, Stone: \xA7f${rs.stone ?? 0}\xA77, Food: \xA7f${Math.floor(castleVillage.foodStorage ?? 0)}`
      );
    });
    return;
  }
  rs.wood = (rs.wood ?? 0) - HAMMER_WOOD_COST;
  rs.stone = (rs.stone ?? 0) - HAMMER_STONE_COST;
  castleVillage.foodStorage = (castleVillage.foodStorage ?? 0) - HAMMER_FOOD_COST;
  saveVillage(castleVillage);
  system6.run(() => {
    notifyPlayer(
      player.name,
      `\xA7a\u{1F528} Quick Craft ready! \xA77Cost: \xA7f-${HAMMER_WOOD_COST} Wood, -${HAMMER_STONE_COST} Stone, -${HAMMER_FOOD_COST} Food\xA77 from \xA7b${castleVillage.name}`
    );
  });
});
world20.beforeEvents.playerBreakBlock.subscribe((event) => {
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
  system6.run(() => {
    try {
      const dim = world20.getDimension(dimId);
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
world20.afterEvents.itemUse.subscribe((event) => {
  const player = event.source;
  if (!player) return;
  const itemId = event.itemStack?.typeId;
  if (!itemId) return;
  if (itemId === "kingdoms:recall_scroll") {
    system6.run(() => {
      recallNearbyTroops(player);
    });
    return;
  }
  if (itemId === "kingdoms:tactics_horn") {
    openTacticsMenu(player);
    return;
  }
  if (itemId === "kingdoms:formation_horn") {
    system6.run(() => {
      triggerFormationHorn(player);
    });
    return;
  }
  if (TROOP_TOKEN_MAP[itemId]) {
    system6.run(() => {
      releaseTroops(player);
    });
    return;
  }
  if (itemId === "kingdoms:village_spawner") {
    void showVillageSpawnerMenu(player);
    return;
  }
  if (itemId === "kingdoms:formation_scroll") {
    openTacticsMenu(player);
  }
});
async function showVillageSpawnerMenu(player) {
  const lastRaw = world20.getDynamicProperty("kc_lastSettlement");
  const hasLast = !!lastRaw;
  const form = new ActionFormData3().title("Village Spawner").body("Choose what to spawn near you.\n\xA77A settlement will appear ~80 blocks away.").button("\u{1F3D9} Spawn Kingdom City\n\xA77Large walled kingdom").button(hasLast ? "\u{1F4CD} Teleport to Last Settlement\n\xA77Return to previously spawned site" : "\u{1F4CD} No Settlement Yet\n\xA77Spawn one first");
  const response = await form.show(player);
  if (response.canceled || response.selection === void 0) return;
  if (response.selection === 1) {
    if (!lastRaw) {
      notifyPlayer(player.name, "\xA7cNo settlement has been spawned yet.");
      return;
    }
    try {
      const saved = JSON.parse(lastRaw);
      player.teleport({ x: saved.x, y: saved.y + 1, z: saved.z + 35 });
      notifyPlayer(player.name, `\xA7aTeleported to \xA7b${saved.type}\xA7a. Gate is just ahead.`);
    } catch {
      notifyPlayer(player.name, "\xA7cCouldn't read last settlement location.");
    }
    return;
  }
  const type = "city";
  const dim = player.dimension;
  const loc = player.location;
  const angle = Math.random() * Math.PI * 2;
  const dist = 80;
  const anchor = {
    x: Math.round(loc.x + Math.cos(angle) * dist),
    y: Math.round(loc.y),
    z: Math.round(loc.z + Math.sin(angle) * dist)
  };
  notifyPlayer(player.name, `\xA77Spawning \xA7b${type}\xA77\u2026 (check ~${dist} blocks away)`);
  system6.run(() => spawnNpcVillage(dim, anchor, type));
}
function _buildMedievalHouse(b, v, cmd, cx, cz, w, d, wall, post) {
  const hw = Math.floor(w / 2), hd = Math.floor(d / 2);
  v(cx - hw, -1, cz - hd, cx + hw, -1, cz + hd, "minecraft:cobblestone");
  v(cx - hw, 0, cz - hd, cx + hw, 0, cz + hd, "minecraft:oak_planks");
  for (const [px, pz] of [
    [cx - hw, cz - hd],
    [cx + hw, cz - hd],
    [cx - hw, cz + hd],
    [cx + hw, cz + hd]
  ])
    for (let y = 1; y <= 5; y++) b(px, y, pz, post);
  for (let y = 1; y <= 4; y++) {
    for (let x = cx - hw + 1; x <= cx + hw - 1; x++) {
      b(x, y, cz - hd, wall);
      b(x, y, cz + hd, wall);
    }
    for (let z = cz - hd + 1; z <= cz + hd - 1; z++) {
      b(cx - hw, y, z, wall);
      b(cx + hw, y, z, wall);
    }
  }
  for (let x = cx - hw + 1; x <= cx + hw - 1; x++) {
    b(x, 5, cz - hd, post);
    b(x, 5, cz + hd, post);
  }
  for (let z = cz - hd + 1; z <= cz + hd - 1; z++) {
    b(cx - hw, 5, z, post);
    b(cx + hw, 5, z, post);
  }
  b(cx - 1, 2, cz - hd, "minecraft:glass_pane");
  b(cx - 1, 3, cz - hd, "minecraft:glass_pane");
  b(cx + 1, 2, cz - hd, "minecraft:glass_pane");
  b(cx + 1, 3, cz - hd, "minecraft:glass_pane");
  b(cx - 1, 2, cz + hd, "minecraft:glass_pane");
  b(cx - 1, 3, cz + hd, "minecraft:glass_pane");
  b(cx + 1, 2, cz + hd, "minecraft:glass_pane");
  b(cx + 1, 3, cz + hd, "minecraft:glass_pane");
  b(cx - hw, 2, cz, "minecraft:glass_pane");
  b(cx - hw, 3, cz, "minecraft:glass_pane");
  b(cx + hw, 2, cz, "minecraft:glass_pane");
  b(cx + hw, 3, cz, "minecraft:glass_pane");
  b(cx, 1, cz + hd, "minecraft:air");
  b(cx, 2, cz + hd, "minecraft:air");
  const roofSteps = Math.min(hw, hd);
  for (let step = 0; step <= roofSteps; step++) {
    const x1 = cx - hw + step, x2 = cx + hw - step, z1 = cz - hd + step, z2 = cz + hd - step;
    if (x1 > x2 || z1 > z2) break;
    v(x1, 6 + step, z1, x2, 6 + step, z2, "minecraft:brick_block");
  }
  const roofTop = 6 + roofSteps;
  const chX = cx + hw - 1, chZ = cz - hd + 1;
  b(chX, roofTop, chZ, "minecraft:cobblestone");
  b(chX, roofTop + 1, chZ, "minecraft:cobblestone");
  cmd(chX, roofTop + 2, chZ, "minecraft:campfire", '"extinguished"=false');
  const ix1 = cx - hw + 1, ix2 = cx + hw - 1;
  const iz1 = cz - hd + 1, iz2 = cz + hd - 1;
  b(cx, 4, cz, "minecraft:lantern");
  b(ix1, 3, cz, "minecraft:lantern");
  for (let rz = iz1; rz <= iz2; rz++) b(cx, 1, rz, "minecraft:red_carpet");
  cmd(ix1, 1, iz1, "minecraft:red_bed", '"direction"=2,"occupied_bit"=false,"head_piece_bit"=true');
  cmd(ix1, 1, iz1 + 1, "minecraft:red_bed", '"direction"=2,"occupied_bit"=false,"head_piece_bit"=false');
  if (w >= 9) {
    cmd(ix2, 1, iz1, "minecraft:red_bed", '"direction"=2,"occupied_bit"=false,"head_piece_bit"=true');
    cmd(ix2, 1, iz1 + 1, "minecraft:red_bed", '"direction"=2,"occupied_bit"=false,"head_piece_bit"=false');
  }
  b(cx, 2, iz1, "minecraft:bookshelf");
  b(cx, 3, iz1, "minecraft:bookshelf");
  b(ix2, 1, iz1, "minecraft:furnace");
  b(ix2, 2, iz1, "minecraft:cobblestone");
  b(ix1, 1, iz2 - 1, "minecraft:crafting_table");
  b(ix2, 1, iz2 - 1, "minecraft:chest");
  b(ix1, 1, cz, "minecraft:barrel");
  b(cx, 1, iz1, "minecraft:flower_pot");
  cmd(cx, 1, cz + hd, "minecraft:oak_door", '"direction"=1,"door_hinge_bit"=false,"open_bit"=false,"upper_block_bit"=false');
  cmd(cx, 2, cz + hd, "minecraft:oak_door", '"direction"=1,"door_hinge_bit"=false,"open_bit"=false,"upper_block_bit"=true');
  const fyZ2 = cz + hd + 4;
  const fxL = cx - hw - 1;
  const fxR = cx + hw + 1;
  for (let fz = cz + hd; fz <= fyZ2; fz++) {
    b(fxL, 1, fz, "minecraft:oak_fence");
    b(fxR, 1, fz, "minecraft:oak_fence");
  }
  for (let fx = fxL + 1; fx <= fxR - 1; fx++) {
    if (fx !== cx) b(fx, 1, fyZ2, "minecraft:oak_fence");
  }
  cmd(cx, 1, fyZ2, "minecraft:oak_fence_gate", '"direction"=1,"in_wall_bit"=false,"open_bit"=false');
  b(fxL, 2, fyZ2, "minecraft:oak_fence");
  b(fxL, 3, fyZ2, "minecraft:lantern");
  b(fxR, 2, fyZ2, "minecraft:oak_fence");
  b(fxR, 3, fyZ2, "minecraft:lantern");
  v(cx - 1, 0, cz + hd + 1, cx + 1, 0, fyZ2 - 1, "minecraft:dirt_path");
  b(fxL + 1, 1, cz + hd + 2, "minecraft:flower_pot");
  b(fxR - 1, 1, cz + hd + 2, "minecraft:flower_pot");
}
function _buildTower(b, v, tx, tz, r, h, wall, crown) {
  for (let y = 1; y <= h; y++)
    for (let dx = -r; dx <= r; dx++) {
      b(tx + dx, y, tz - r, wall);
      b(tx + dx, y, tz + r, wall);
      b(tx - r, y, tz + dx, wall);
      b(tx + r, y, tz + dx, wall);
    }
  v(tx - r + 1, 1, tz - r + 1, tx + r - 1, 1, tz + r - 1, "minecraft:cobblestone");
  for (let dx = -r; dx <= r; dx += 2) {
    b(tx + dx, h + 1, tz - r, crown);
    b(tx + dx, h + 1, tz + r, crown);
  }
  for (let dz = -r + 1; dz <= r - 1; dz += 2) {
    b(tx - r, h + 1, tz + dz, crown);
    b(tx + r, h + 1, tz + dz, crown);
  }
}
function spawnNpcVillage(dim, anchor, type) {
  let groundY = anchor.y;
  try {
    const top = dim.getTopmostBlock({ x: anchor.x, z: anchor.z });
    if (top) groundY = top.y;
  } catch {
  }
  const BX = Math.round(anchor.x), BY = groundY, BZ = Math.round(anchor.z);
  const ops = [];
  const cmds = [];
  const b = (x, y, z, id) => ops.push([BX + x, BY + y, BZ + z, id]);
  const v = (x1, y1, z1, x2, y2, z2, id) => {
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++)
      for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++)
        for (let z = Math.min(z1, z2); z <= Math.max(z1, z2); z++)
          ops.push([BX + x, BY + y, BZ + z, id]);
  };
  const rng = (x1, z1, x2, z2, y1, y2, id) => {
    for (let y = y1; y <= y2; y++) {
      for (let x = x1; x <= x2; x++) {
        b(x, y, z1, id);
        b(x, y, z2, id);
      }
      for (let z = z1 + 1; z <= z2 - 1; z++) {
        b(x1, y, z, id);
        b(x2, y, z, id);
      }
    }
  };
  const cmd = (x, y, z, blockId, states) => {
    const st = states ? ` [${states}]` : "";
    cmds.push(`setblock ${BX + x} ${BY + y} ${BZ + z} ${blockId}${st}`);
  };
  if (type === "city") {
    _buildKingdom(b, v, rng, cmd);
  } else {
    const _villagePreset = Math.random() < 0.5 ? _buildFarmersVillage : _buildTransformedPlains;
    _villagePreset(b);
  }
  try {
    world20.setDynamicProperty("kc_lastSettlement", JSON.stringify({ x: BX, y: BY, z: BZ, type }));
  } catch {
  }
  const villagerCount = type === "city" ? 10 : 4;
  let cursor = 0;
  const BATCH = 700;
  const handle = system6.runInterval(() => {
    const end = Math.min(cursor + BATCH, ops.length);
    for (let i = cursor; i < end; i++) {
      const [x, y, z, id] = ops[i];
      try {
        dim.getBlock({ x, y, z })?.setType(id);
      } catch {
      }
    }
    cursor = end;
    if (cursor >= ops.length) {
      system6.clearRun(handle);
      for (const c of cmds) {
        dim.runCommandAsync(c).catch(() => {
        });
      }
      for (let i = 0; i < villagerCount; i++) {
        try {
          dim.spawnEntity("minecraft:villager_v2", {
            x: BX + (Math.random() * 20 - 10),
            y: BY + 1,
            z: BZ + (Math.random() * 20 - 10)
          });
        } catch {
        }
      }
      if (type === "city") {
        const kingdomGuards = [
          { type: "kingdoms:castle_guard", x: BX - 2, y: BY + 1, z: BZ + 27, name: "\xA7cGate Guard" },
          { type: "kingdoms:castle_guard", x: BX + 2, y: BY + 1, z: BZ + 27, name: "\xA7cGate Guard" },
          { type: "kingdoms:patrol_soldier", x: BX + 28, y: BY + 1, z: BZ + 28, name: "\xA76Tower Patrol" },
          { type: "kingdoms:patrol_soldier", x: BX - 28, y: BY + 1, z: BZ + 28, name: "\xA76Tower Patrol" },
          { type: "kingdoms:patrol_soldier", x: BX + 28, y: BY + 1, z: BZ - 28, name: "\xA76Tower Patrol" },
          { type: "kingdoms:patrol_soldier", x: BX - 28, y: BY + 1, z: BZ - 28, name: "\xA76Tower Patrol" },
          { type: "kingdoms:castle_guard", x: BX - 2, y: BY + 1, z: BZ - 20, name: "\xA7cKeep Guard" },
          { type: "kingdoms:castle_guard", x: BX + 2, y: BY + 1, z: BZ - 20, name: "\xA7cKeep Guard" }
        ];
        for (const g of kingdomGuards) {
          try {
            const guard = dim.spawnEntity(g.type, { x: g.x, y: g.y, z: g.z });
            guard.nameTag = g.name;
          } catch {
          }
        }
      } else {
        const villageGuardSpots = [
          { x: BX - 1, y: BY + 1, z: BZ + 22 },
          { x: BX + 1, y: BY + 1, z: BZ + 22 }
        ];
        for (const spot of villageGuardSpots) {
          try {
            const guard = dim.spawnEntity("kingdoms:patrol_soldier", spot);
            guard.nameTag = "\xA76Village Guard";
          } catch {
          }
        }
      }
    }
  }, 1);
}
function _buildKingdom(b, v, rng, cmd) {
  const SB = "minecraft:stone_bricks";
  const CSB = "minecraft:chiseled_stone_bricks";
  const COBB = "minecraft:cobblestone";
  const OAK = "minecraft:oak_planks";
  const DOAK = "minecraft:dark_oak_planks";
  const LOG = "minecraft:stripped_oak_log";
  const DLOG = "minecraft:stripped_dark_oak_log";
  const GPNE = "minecraft:glass_pane";
  const IRBT = "minecraft:iron_bars";
  const PATH = "minecraft:dirt_path";
  const LNTN = "minecraft:lantern";
  const ANDE = "minecraft:polished_andesite";
  const AIR = "minecraft:air";
  const WATR = "minecraft:water";
  const OLEG = "minecraft:oak_log";
  const OLAV = "minecraft:oak_leaves";
  const FENC = "minecraft:oak_fence";
  const RWOL = "minecraft:red_wool";
  const WWOL = "minecraft:white_wool";
  v(-34, 1, -34, 34, 22, 34, AIR);
  v(-30, 0, -30, 30, 0, 30, COBB);
  rng(-30, -30, 30, 30, 1, 6, SB);
  for (let x = -30; x <= 30; x += 2) {
    b(x, 7, -30, CSB);
    b(x, 7, 30, CSB);
  }
  for (let z = -29; z <= 29; z += 2) {
    b(-30, 7, z, CSB);
    b(30, 7, z, CSB);
  }
  for (const [tx, tz] of [[-30, -30], [30, -30], [-30, 30], [30, 30]]) {
    _buildTower(b, v, tx, tz, 2, 10, SB, CSB);
    b(tx, 12, tz, FENC);
    b(tx, 13, tz, WWOL);
  }
  for (let y = 1; y <= 4; y++) {
    b(-1, y, 30, AIR);
    b(0, y, 30, AIR);
    b(1, y, 30, AIR);
  }
  b(-1, 5, 30, SB);
  b(0, 5, 30, IRBT);
  b(1, 5, 30, SB);
  for (const gtx of [-5, 5]) {
    _buildTower(b, v, gtx, 30, 2, 13, SB, CSB);
    b(gtx, 15, 30, FENC);
    b(gtx, 16, 30, RWOL);
  }
  v(-1, 0, 31, 1, 0, 40, PATH);
  v(-1, 0, 26, 1, 0, 29, PATH);
  b(-2, 5, 30, IRBT);
  b(2, 5, 30, IRBT);
  v(-1, 0, -28, 1, 0, 25, PATH);
  v(-28, 0, -1, 28, 0, 1, PATH);
  for (let pz = -24; pz <= 20; pz += 8) {
    b(-3, 1, pz, FENC);
    b(-3, 2, pz, FENC);
    b(-3, 3, pz, LNTN);
    b(3, 1, pz, FENC);
    b(3, 2, pz, FENC);
    b(3, 3, pz, LNTN);
  }
  for (let px = -24; px <= 24; px += 8) {
    b(px, 1, -3, FENC);
    b(px, 2, -3, FENC);
    b(px, 3, -3, LNTN);
    b(px, 1, 3, FENC);
    b(px, 2, 3, FENC);
    b(px, 3, 3, LNTN);
  }
  v(-9, 0, -9, 9, 0, 9, SB);
  v(-2, 1, -2, 2, 1, 2, SB);
  b(0, 2, 0, SB);
  for (const [fx, fz] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]])
    b(fx, 1, fz, WATR);
  for (const [lx, lz] of [[-8, -8], [8, -8], [-8, 8], [8, 8]]) {
    b(lx, 1, lz, SB);
    b(lx, 2, lz, FENC);
    b(lx, 3, lz, LNTN);
  }
  for (const [bx, bz] of [[-4, 0], [4, 0], [0, -4], [0, 4]])
    b(bx, 1, bz, "minecraft:oak_slab");
  _buildMedievalHouse(b, v, cmd, -19, -19, 10, 8, OAK, LOG);
  _buildMedievalHouse(b, v, cmd, 19, -19, 10, 8, OAK, LOG);
  _buildMedievalHouse(b, v, cmd, -21, 2, 8, 10, DOAK, DLOG);
  _buildMedievalHouse(b, v, cmd, 21, 2, 8, 10, DOAK, DLOG);
  _buildMedievalHouse(b, v, cmd, -19, 19, 10, 8, OAK, LOG);
  _buildMedievalHouse(b, v, cmd, 19, 19, 10, 8, OAK, LOG);
  _buildMedievalHouse(b, v, cmd, -12, -15, 7, 6, OAK, LOG);
  _buildMedievalHouse(b, v, cmd, 12, -15, 7, 6, OAK, LOG);
  v(-27, 0, -17, -24, 0, -13, "minecraft:farmland");
  v(-27, 1, -17, -24, 1, -13, "minecraft:wheat");
  rng(-28, -18, -23, -12, 1, 1, FENC);
  v(24, 0, -17, 27, 0, -13, "minecraft:farmland");
  v(24, 1, -17, 27, 1, -13, "minecraft:wheat");
  rng(23, -18, 28, -12, 1, 1, FENC);
  v(-27, 0, 12, -24, 0, 16, "minecraft:farmland");
  v(-27, 1, 12, -24, 1, 16, "minecraft:wheat");
  v(24, 0, 12, 27, 0, 16, "minecraft:farmland");
  v(24, 1, 12, 27, 1, 16, "minecraft:wheat");
  for (const [tx, tz] of [
    [-26, -26],
    [26, -26],
    [-26, 26],
    [26, 26],
    // outer ward corners
    [-20, 10],
    [20, 10],
    // flanking EW road mid-point
    [-20, -5],
    [20, -5]
    // near inner keep wall
  ]) {
    const h = 5 + Math.floor((Math.abs(tx) + Math.abs(tz)) % 3);
    for (let y = 1; y <= h; y++) b(tx, y, tz, OLEG);
    v(tx - 2, h - 1, tz - 2, tx + 2, h + 2, tz + 2, OLAV);
    b(tx, h + 3, tz, OLAV);
  }
  rng(-14, -30, 14, -12, 1, 5, SB);
  for (let y = 1; y <= 3; y++) {
    b(-1, y, -12, AIR);
    b(0, y, -12, AIR);
    b(1, y, -12, AIR);
  }
  for (let x = -14; x <= 14; x += 2) b(x, 6, -12, CSB);
  v(-1, 0, -12, 1, 0, -3, PATH);
  b(-3, 1, -12, FENC);
  b(-3, 2, -12, FENC);
  b(-3, 3, -12, LNTN);
  b(3, 1, -12, FENC);
  b(3, 2, -12, FENC);
  b(3, 3, -12, LNTN);
  rng(-11, -29, 11, -15, 1, 10, ANDE);
  v(-10, 2, -28, 10, 10, -16, AIR);
  v(-10, 1, -28, 10, 1, -16, SB);
  for (let z = -26; z >= -18; z -= 4) {
    b(-11, 4, z, GPNE);
    b(-11, 5, z, GPNE);
    b(-11, 6, z, GPNE);
    b(11, 4, z, GPNE);
    b(11, 5, z, GPNE);
    b(11, 6, z, GPNE);
  }
  for (let x = -8; x <= 8; x += 4) {
    b(x, 4, -29, GPNE);
    b(x, 5, -29, GPNE);
  }
  for (let y = 1; y <= 3; y++) {
    b(-1, y, -15, AIR);
    b(0, y, -15, AIR);
    b(1, y, -15, AIR);
  }
  for (const [px, pz] of [[-7, -26], [7, -26], [-7, -20], [7, -20]])
    for (let y = 1; y <= 9; y++) b(px, y, pz, SB);
  for (let rz = -24; rz <= -16; rz++) b(0, 1, rz, "minecraft:red_carpet");
  b(0, 1, -26, "minecraft:gold_block");
  b(0, 2, -26, SB);
  b(0, 3, -26, SB);
  b(-1, 1, -26, SB);
  b(1, 1, -26, SB);
  b(0, 5, -28, RWOL);
  b(0, 6, -28, RWOL);
  b(0, 7, -28, RWOL);
  b(-1, 5, -28, RWOL);
  b(1, 5, -28, RWOL);
  b(-10, 5, -24, RWOL);
  b(-10, 6, -24, RWOL);
  b(10, 5, -24, RWOL);
  b(10, 6, -24, RWOL);
  cmd(2, 1, -28, "minecraft:campfire", '"extinguished"=false');
  b(2, 2, -28, COBB);
  b(2, 3, -28, COBB);
  b(2, 4, -28, COBB);
  b(0, 9, -22, "minecraft:glowstone");
  for (const [lx, lz] of [[-5, -24], [5, -24], [-5, -20], [5, -20], [-5, -17], [5, -17]])
    b(lx, 3, lz, LNTN);
  v(-4, 2, -21, 4, 2, -21, "minecraft:stripped_oak_log");
  v(-4, 1, -22, 4, 1, -22, "minecraft:oak_slab");
  v(-4, 1, -20, 4, 1, -20, "minecraft:oak_slab");
  b(0, 3, -21, LNTN);
  b(-9, 1, -17, "minecraft:chest");
  b(9, 1, -17, "minecraft:chest");
  b(-9, 2, -17, IRBT);
  b(9, 2, -17, IRBT);
  v(-9, 5, -28, 9, 5, -17, SB);
  for (let ly = 2; ly <= 4; ly++) cmd(9, ly, -18, "minecraft:ladder", '"facing_direction"=4');
  cmd(-7, 6, -27, "minecraft:red_bed", '"direction"=3,"occupied_bit"=false,"head_piece_bit"=true');
  cmd(-7, 6, -26, "minecraft:red_bed", '"direction"=3,"occupied_bit"=false,"head_piece_bit"=false');
  cmd(-5, 6, -27, "minecraft:red_bed", '"direction"=3,"occupied_bit"=false,"head_piece_bit"=true');
  cmd(-5, 6, -26, "minecraft:red_bed", '"direction"=3,"occupied_bit"=false,"head_piece_bit"=false');
  cmd(7, 6, -27, "minecraft:red_bed", '"direction"=2,"occupied_bit"=false,"head_piece_bit"=true');
  cmd(7, 6, -26, "minecraft:red_bed", '"direction"=2,"occupied_bit"=false,"head_piece_bit"=false');
  cmd(5, 6, -27, "minecraft:red_bed", '"direction"=2,"occupied_bit"=false,"head_piece_bit"=true');
  cmd(5, 6, -26, "minecraft:red_bed", '"direction"=2,"occupied_bit"=false,"head_piece_bit"=false');
  b(-8, 6, -20, "minecraft:chest");
  b(8, 6, -20, "minecraft:chest");
  b(0, 7, -24, LNTN);
  b(-6, 7, -23, LNTN);
  b(6, 7, -23, LNTN);
  for (const [tx, tz] of [[-11, -29], [11, -29], [-11, -15], [11, -15]]) {
    _buildTower(b, v, tx, tz, 2, 16, SB, CSB);
    b(tx, 4, tz - 2, GPNE);
    b(tx, 4, tz + 2, GPNE);
    b(tx, 5, tz - 2, GPNE);
    b(tx, 5, tz + 2, GPNE);
    b(tx, 18, tz, FENC);
    b(tx, 19, tz, RWOL);
  }
  for (const [tx, tz] of [
    [-38, -22],
    [-40, -6],
    [-38, 14],
    [-40, 26],
    [38, -22],
    [40, -6],
    [38, 14],
    [40, 26],
    [-12, 38],
    [12, 38],
    [0, -42],
    [24, -40],
    [-24, -40],
    [-44, 0],
    [44, 0],
    [0, 44]
  ]) {
    const h = 5 + Math.abs(tx * 3 + tz) % 4;
    for (let y = 1; y <= h; y++) b(tx, y, tz, OLEG);
    v(tx - 2, h - 1, tz - 2, tx + 2, h + 2, tz + 2, OLAV);
    b(tx, h + 3, tz, OLAV);
  }
  b(-19, 1, -19, "faye:table1");
  cmd(-19, 1, -18, "faye:chair_01", '"minecraft:cardinal_direction"="north"');
  cmd(-19, 1, -20, "faye:chair_01", '"minecraft:cardinal_direction"="south"');
  cmd(-20, 1, -19, "faye:chair_01", '"minecraft:cardinal_direction"="east"');
  cmd(-18, 1, -19, "faye:chair_01", '"minecraft:cardinal_direction"="west"');
  b(-22, 2, -19, "faye:shelf1");
  b(-22, 1, -21, "faye:potted_plant1");
  b(-22, 1, -17, "faye:potted_plant2");
  b(-15, 2, -19, "faye:painting_horizontal");
  b(19, 1, -19, "faye:table1");
  cmd(19, 1, -18, "faye:chair_01", '"minecraft:cardinal_direction"="north"');
  cmd(19, 1, -20, "faye:chair_01", '"minecraft:cardinal_direction"="south"');
  cmd(18, 1, -19, "faye:chair_01", '"minecraft:cardinal_direction"="east"');
  cmd(20, 1, -19, "faye:chair_01", '"minecraft:cardinal_direction"="west"');
  b(23, 2, -19, "faye:shelf1");
  b(23, 1, -21, "faye:potted_plant1");
  b(15, 2, -19, "faye:painting_horizontal");
  b(-21, 1, 2, "faye:table1");
  cmd(-21, 1, 3, "faye:chair_01", '"minecraft:cardinal_direction"="north"');
  cmd(-21, 1, 1, "faye:chair_01", '"minecraft:cardinal_direction"="south"');
  cmd(-22, 1, 2, "faye:chair_01", '"minecraft:cardinal_direction"="east"');
  cmd(-20, 1, 2, "faye:chair_01", '"minecraft:cardinal_direction"="west"');
  b(-24, 2, 2, "faye:shelf1");
  b(-24, 3, 2, "faye:books");
  b(-24, 1, -1, "faye:potted_plant1");
  b(-17, 2, 2, "faye:painting_vertical");
  b(21, 1, 2, "faye:table1");
  cmd(21, 1, 3, "faye:chair_01", '"minecraft:cardinal_direction"="north"');
  cmd(21, 1, 1, "faye:chair_01", '"minecraft:cardinal_direction"="south"');
  cmd(20, 1, 2, "faye:chair_01", '"minecraft:cardinal_direction"="east"');
  cmd(22, 1, 2, "faye:chair_01", '"minecraft:cardinal_direction"="west"');
  b(24, 2, 2, "faye:shelf1");
  b(24, 3, 2, "faye:books");
  b(17, 2, 2, "faye:painting_vertical");
  b(-19, 1, 19, "faye:table2");
  cmd(-19, 1, 20, "faye:chair_01", '"minecraft:cardinal_direction"="north"');
  cmd(-19, 1, 18, "faye:chair_01", '"minecraft:cardinal_direction"="south"');
  cmd(-20, 1, 19, "faye:stool_1", '"minecraft:cardinal_direction"="east"');
  cmd(-18, 1, 19, "faye:stool_1", '"minecraft:cardinal_direction"="west"');
  b(-22, 2, 19, "faye:shelf1");
  b(-22, 1, 21, "faye:potted_plant2");
  b(19, 1, 19, "faye:table2");
  cmd(19, 1, 20, "faye:chair_01", '"minecraft:cardinal_direction"="north"');
  cmd(19, 1, 18, "faye:chair_01", '"minecraft:cardinal_direction"="south"');
  cmd(20, 1, 19, "faye:stool_1", '"minecraft:cardinal_direction"="east"');
  cmd(18, 1, 19, "faye:stool_1", '"minecraft:cardinal_direction"="west"');
  b(23, 2, 19, "faye:shelf1");
  b(23, 1, 21, "faye:potted_plant2");
  b(-12, 1, -15, "faye:table1");
  cmd(-12, 1, -14, "faye:stool_1", '"minecraft:cardinal_direction"="north"');
  cmd(-12, 1, -16, "faye:stool_1", '"minecraft:cardinal_direction"="south"');
  b(-13, 2, -15, "faye:books");
  b(12, 1, -15, "faye:table1");
  cmd(12, 1, -14, "faye:stool_1", '"minecraft:cardinal_direction"="north"');
  cmd(12, 1, -16, "faye:stool_1", '"minecraft:cardinal_direction"="south"');
  b(13, 2, -15, "faye:books");
  cmd(-3, 7, -22, "faye:chair_01", '"minecraft:cardinal_direction"="east"');
  cmd(3, 7, -22, "faye:chair_01", '"minecraft:cardinal_direction"="west"');
  cmd(-3, 7, -19, "faye:chair_01", '"minecraft:cardinal_direction"="east"');
  cmd(3, 7, -19, "faye:chair_01", '"minecraft:cardinal_direction"="west"');
  b(-4, 7, -17, "faye:potted_plant1");
  b(4, 7, -17, "faye:potted_plant1");
}
function _buildVillage(b, v, rng, cmd) {
  const SB = "minecraft:stone_bricks";
  const CSB = "minecraft:chiseled_stone_bricks";
  const OAK = "minecraft:oak_planks";
  const SOAK = "minecraft:spruce_planks";
  const LOG = "minecraft:stripped_oak_log";
  const SLOG = "minecraft:stripped_spruce_log";
  const PATH = "minecraft:dirt_path";
  const LNTN = "minecraft:lantern";
  const FENC = "minecraft:oak_fence";
  const AIR = "minecraft:air";
  const WATR = "minecraft:water";
  const OLEG = "minecraft:oak_log";
  const OLAV = "minecraft:oak_leaves";
  v(-22, 1, -22, 22, 14, 22, AIR);
  v(-20, 0, -20, 20, 0, 20, "minecraft:cobblestone");
  rng(-18, -18, 18, 18, 1, 4, SB);
  for (let x = -18; x <= 18; x += 2) {
    b(x, 5, -18, CSB);
    b(x, 5, 18, CSB);
  }
  for (let z = -17; z <= 17; z += 2) {
    b(-18, 5, z, CSB);
    b(18, 5, z, CSB);
  }
  for (let y = 1; y <= 3; y++) {
    b(-1, y, 18, AIR);
    b(0, y, 18, AIR);
    b(1, y, 18, AIR);
  }
  v(-1, 0, -16, 1, 0, 16, PATH);
  v(-16, 0, -1, 16, 0, 1, PATH);
  for (let pz = -13; pz <= 13; pz += 5) {
    b(-3, 1, pz, FENC);
    b(-3, 2, pz, FENC);
    b(-3, 3, pz, LNTN);
    b(3, 1, pz, FENC);
    b(3, 2, pz, FENC);
    b(3, 3, pz, LNTN);
  }
  for (let px = -13; px <= 13; px += 5) {
    b(px, 1, -3, FENC);
    b(px, 2, -3, FENC);
    b(px, 3, -3, LNTN);
    b(px, 1, 3, FENC);
    b(px, 2, 3, FENC);
    b(px, 3, 3, LNTN);
  }
  v(-1, 1, -1, 1, 1, 1, SB);
  b(0, 1, 0, WATR);
  for (const [wx, wz] of [[-2, 0], [2, 0], [0, -2], [0, 2]])
    b(wx, 1, wz, FENC);
  b(-1, 2, -1, OLEG);
  b(1, 2, -1, OLEG);
  b(-1, 2, 1, OLEG);
  b(1, 2, 1, OLEG);
  b(-1, 3, 0, OAK);
  b(1, 3, 0, OAK);
  b(0, 3, -1, OAK);
  b(0, 3, 1, OAK);
  b(0, 3, 0, LNTN);
  v(4, 0, -3, 8, 0, 3, "minecraft:farmland");
  v(4, 1, -3, 8, 1, 3, "minecraft:wheat");
  for (let ff = 3; ff <= 9; ff++) {
    b(ff, 1, -4, FENC);
    b(ff, 1, 4, FENC);
  }
  b(3, 1, -4, FENC);
  b(3, 1, 4, FENC);
  b(9, 1, -4, FENC);
  b(9, 1, 4, FENC);
  for (let fz = -4; fz <= 4; fz++) {
    b(3, 1, fz, FENC);
    b(9, 1, fz, FENC);
  }
  _buildMedievalHouse(b, v, cmd, -11, -11, 8, 7, OAK, LOG);
  _buildMedievalHouse(b, v, cmd, 11, -11, 8, 7, SOAK, SLOG);
  _buildMedievalHouse(b, v, cmd, -12, 2, 7, 8, OAK, LOG);
  _buildMedievalHouse(b, v, cmd, 12, 2, 7, 8, SOAK, SLOG);
  _buildMedievalHouse(b, v, cmd, 0, 11, 8, 7, OAK, LOG);
  for (const [tx, tz] of [
    [-15, -14],
    [15, -14],
    [-15, 14]
  ]) {
    const h = 4 + Math.abs(tx + tz) % 2;
    for (let y = 1; y <= h; y++) b(tx, y, tz, OLEG);
    v(tx - 2, h - 1, tz - 2, tx + 2, h + 2, tz + 2, OLAV);
    b(tx, h + 3, tz, OLAV);
  }
  for (const [tx, tz] of [
    [-26, -14],
    [26, -14],
    [-26, 14],
    [26, 14],
    [0, -28],
    [-16, 26],
    [16, 26],
    [-28, 0],
    [28, 0]
  ]) {
    const h = 5 + Math.abs(tx * 2 + tz) % 3;
    for (let y = 1; y <= h; y++) b(tx, y, tz, OLEG);
    v(tx - 2, h - 1, tz - 2, tx + 2, h + 2, tz + 2, OLAV);
    b(tx, h + 3, tz, OLAV);
  }
}
registerCommands();
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
  const form = new ActionFormData3().title(`${village.name} \u2014 Town Hall`).body(summary);
  if (isOwner) {
    form.button("Kingdom Overview").button("Treasury").button("Diplomacy").button("Send Reinforcements").button("Merchants").button("Rename Village").button("\u{1F3EA} Shop");
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
    case 6:
      await showTownHallShop(player, village);
      break;
  }
}
var TOWN_HALL_SHOP_ITEMS = [
  { label: "\u{1F33E} Granary", desc: "Stores food. Required before Barracks.", itemId: "kingdoms:granary_item", cost: 20 },
  { label: "\u{1F4B0} Treasury", desc: "Stores emeralds & wages workers.", itemId: "kingdoms:treasury_item", cost: 20 },
  { label: "\u2694 Barracks", desc: "Train & station troops. Needs Granary+Treasury.", itemId: "kingdoms:barracks_item", cost: 40 },
  { label: "\u{1F6D2} Market", desc: "Unlocks trade, seeds & merchant visits.", itemId: "kingdoms:market_item", cost: 30 },
  { label: "\u{1F528} Blacksmith", desc: "Upgrade troop weapons & armour.", itemId: "kingdoms:blacksmith_item", cost: 50 },
  { label: "\u{1F4E6} Material Storage", desc: "Stores mined iron, gold, diamonds & more.", itemId: "kingdoms:storage_item", cost: 30 },
  { label: "\u{1F3F0} Castle", desc: "Unlocks elite troops (Samurai, Lancer, Legion).", itemId: "kingdoms:castle_item", cost: 200 },
  { label: "\u{1F5FA} Waypoint", desc: "Fast-travel point for your village.", itemId: "kingdoms:waypoint", cost: 30 },
  { label: "\u{1F33F} Greenhouse", desc: "Glass farming structure with farmland, water channels & wheat.", itemId: "kingdoms:greenhouse_item", cost: 60 },
  { label: "\u{1F6A9} Banner Hall", desc: "Decorative flag display with 4 flagpoles & banner crafting table.", itemId: "kingdoms:banner_hall_item", cost: 40 }
];
async function showTownHallShop(player, village) {
  const form = new ActionFormData3().title(`\u{1F3EA} Town Hall Shop \u2014 ${village.name}`).body(`\xA77Treasury: \xA76${village.treasury}\u{1F48E}\xA7r
\xA77Purchase buildings & items for your village.
`);
  for (const item of TOWN_HALL_SHOP_ITEMS) {
    const affordable = village.treasury >= item.cost ? "\xA7a" : "\xA7c";
    form.button(`${item.label}
${affordable}${item.cost}\u{1F48E}\xA77 \u2014 ${item.desc}`);
  }
  form.button("\xA77\u2190 Back");
  const response = await form.show(player);
  if (response.canceled || response.selection === void 0) return;
  if (response.selection >= TOWN_HALL_SHOP_ITEMS.length) return;
  const selected = TOWN_HALL_SHOP_ITEMS[response.selection];
  const fresh = getVillage(village.id);
  if (!fresh) return;
  if (fresh.treasury < selected.cost) {
    notifyPlayer(player.name, `\xA7cNot enough treasury funds. Need \xA7f${selected.cost}\u{1F48E}\xA7c, have \xA7f${fresh.treasury}\u{1F48E}\xA7c.`);
    return;
  }
  const inv = player.getComponent(EntityInventoryComponent8.componentId);
  if (!inv?.container) return;
  const leftover = inv.container.addItem(new ItemStack6(selected.itemId, 1));
  if (leftover) {
    notifyPlayer(player.name, "\xA7cYour inventory is full. Make room first.");
    return;
  }
  fresh.treasury -= selected.cost;
  saveVillage(fresh);
  notifyPlayer(player.name, `\xA7aPurchased \xA7f${selected.label}\xA7a for \xA76${selected.cost}\u{1F48E}\xA7a! Place it inside your village territory.`);
}
async function showBarracksMenu(player, block) {
  const village = findVillageAt2(block.location);
  if (!village || village.owner !== player.name) {
    notifyPlayer(player.name, "\xA7cYou don't own this village.");
    return;
  }
  const t = village.troops;
  const hk = t.heavyKnight ?? 0;
  const sm = t.samurai ?? 0;
  const ml = t.mercenaryLancer ?? 0;
  const lg = t.legionary ?? 0;
  const cle = t.cavalryLancerElite ?? 0;
  const carried = countTroopTokens(player);
  const carriedTotal = carried.cityGuards + carried.spearmen + carried.archers + carried.cavalry + (carried.heavyKnight ?? 0) + (carried.samurai ?? 0) + (carried.mercenaryLancer ?? 0) + (carried.legionary ?? 0) + (carried.cavalryLancerElite ?? 0);
  const tick = getCurrentTick();
  const queueSummary = getTrainingQueueSummary(village, tick);
  const queueCount = village.trainingQueue?.length ?? 0;
  const rs = village.resourceStorage;
  const hkLocked = village.barracksLevel < 3;
  const castleBuilt = village.hasCastle ?? false;
  const hkLine = hkLocked ? `\xA77Heavy Knights: \xA7c${hk} \xA77(\u{1F512} needs Barracks Lv3)` : `\xA7aHeavy Knights: ${hk}`;
  const eliteLine = castleBuilt ? `\xA76Samurai: ${sm}  Lancer: ${ml}  Legionary: ${lg}  CLE: ${cle}` : `\xA77Elite Troops: \xA7c\u{1F512} needs Castle`;
  const form = new ActionFormData3().title(`${village.name} \u2014 Barracks Lv${village.barracksLevel}`).body(
    `\xA77\u2500\u2500 Stationed \u2500\u2500
City Guards: ${t.cityGuards}  Spearmen: ${t.spearmen}
Archers: ${t.archers}  Cavalry: ${t.cavalry}
${hkLine}
${eliteLine}

\xA77\u2500\u2500 Carried in Inventory \u2500\u2500
Guards: ${carried.cityGuards}  Spearmen: ${carried.spearmen}
Archers: ${carried.archers}  Cavalry: ${carried.cavalry}  HK: ${carried.heavyKnight ?? 0}
Samurai: ${carried.samurai ?? 0}  Lancer: ${carried.mercenaryLancer ?? 0}  Legionary: ${carried.legionary ?? 0}  CLE: ${carried.cavalryLancerElite ?? 0}

\xA77\u2500\u2500 Training Queue (${queueCount}/10) \u2500\u2500
${queueSummary}

Treasury: ${village.treasury} emeralds  Iron: ${rs.iron}  Gold: ${rs.gold}  Diamonds: ${rs.diamonds}`
  ).button(`\u{1FA96} Train Troops (queue: ${queueCount}/10)
\xA77Select troop type and quantity`).button(`\u2694 Pick Up Troops (${t.cityGuards + t.spearmen + t.archers + t.cavalry + hk + sm + ml + lg + cle} stationed)`).button(carriedTotal > 0 ? `\u{1F3F9} Return Troops to Barracks (${carriedTotal} carried)` : "\u{1F3F9} Return Troops (none carried)").button(`\u2B06 Upgrade Barracks (${village.barracksLevel * 15} emeralds)`).button("\u{1F4EF} Tactics Horn\n\xA77Take a formation command horn").button("\u{1F3BA} Formation Horn\n\xA77Rally troops with a battle signal");
  const response = await form.show(player);
  if (response.canceled) return;
  switch (response.selection) {
    case 0:
      await showTrainTroopsForm(player, village);
      break;
    case 1:
      await showPickUpTroopsForm(player, village);
      break;
    case 2:
      await showReturnTroopsForm(player, village);
      break;
    case 3:
      upgradeBarracks(village);
      break;
    case 4:
      giveTacticsHorn(player);
      break;
    case 5:
      giveFormationHorn(player);
      break;
  }
}
function _buildFarmersVillage(b) {
    const PAL = ["minecraft:barrel","minecraft:beehive","minecraft:beetroots","minecraft:bell","minecraft:birch_log","minecraft:birch_stairs","minecraft:birch_wall_sign","minecraft:bricks","minecraft:brown_bed","minecraft:brown_carpet","minecraft:campfire","minecraft:carrots","minecraft:chain","minecraft:chest","minecraft:cobblestone","minecraft:cobblestone_slab","minecraft:cobblestone_wall","minecraft:composter","minecraft:crafting_table","minecraft:dark_oak_fence","minecraft:dark_oak_planks","minecraft:dark_oak_slab","minecraft:dark_oak_stairs","minecraft:dark_oak_trapdoor","minecraft:dirt","minecraft:farmland","minecraft:furnace","minecraft:glass_pane","minecraft:grass","minecraft:grass_path","minecraft:gray_bed","minecraft:green_bed","minecraft:hay_block","minecraft:jungle_trapdoor","minecraft:ladder","minecraft:lantern","minecraft:light_gray_bed","minecraft:mossy_cobblestone","minecraft:oak_leaves","minecraft:oak_log","minecraft:oak_planks","minecraft:oak_slab","minecraft:oak_stairs","minecraft:orange_tulip","minecraft:oxeye_daisy","minecraft:pink_tulip","minecraft:potatoes","minecraft:red_bed","minecraft:red_flower","minecraft:red_tulip","minecraft:scaffolding","minecraft:spruce_door","minecraft:spruce_fence","minecraft:spruce_planks","minecraft:spruce_slab","minecraft:spruce_stairs","minecraft:spruce_trapdoor","minecraft:stone_brick_slab","minecraft:stone_brick_stairs","minecraft:stone_stairs","minecraft:stonebrick","minecraft:water","minecraft:wheat","minecraft:white_tulip","minecraft:yellow_flower"];
    const D = "1c4a3f8e1c4a3f8f1c4a3f901c4a3f911c4a3f921c4a3f931c4a3f941c4a3f951c4a3f961c4a3f971c4a3f981c4a3f991c4a3fa01c4a3fa11c4a3fa21c4a3fa31c4a3fa4184a3fa5184a3fa7184a3fa8184a3fa9184a3faa184a3fab184a3fad184a3fae184a3faf184a3fb0184a3fb1184a3fb2184a3fb3184a3fb4184a3fb51c4b3f8c1c4b3f8d1c4b3f8e1c4b3f8f1c4b3f901c4b3f911c4b3f921c4b3f931c4b3f941c4b3f951c4b3f961c4b3f971c4b3f981c4b3f991c4b3f9a1c4b3f9f1c4b3fa01c4b3fa1"+
    "1c4b3fa21c4b3fa31c4b3fa4184b3fa5184b3fa6184b3fa7184b3fa8184b3fa9184b3faa184b3fab184b3fac184b3fad184b3faf184b3fb0184b3fb1184b3fb2184b3fb31c4c3f8a1c4c3f8b1c4c3f8c1c4c3f8d1c4c3f8e1c4c3f8f1c4c3f901c4c3f91184c3f92184c3f931c4c3f941c4c3f951c4c3f961c4c3f971c4c3f981c4c3f991c4c3f9a1c4c3f9d1c4c3f9e1c4c3f9f1c4c3fa01c4c3fa11c4c3fa2184c3fa6184c3faa184c3fab184c3fad184c3fae184c3faf184c3fb0184c3fb1184c3fb21c4d3f89"+
    "1c4d3f8a1c4d3f8b1c4d3f8c1c4d3f8d1c4d3f8e1c4d3f8f184d3f90184d3f91184d3f92184d3f931c4d3f941c4d3f951c4d3f961c4d3f971c4d3f981c4d3f991c4d3f9a1c4d3f9b1c4d3f9c1c4d3f9d1c4d3f9e1c4d3f9f1c4d3fa01c4d3fa1184d3fa4184d3fa5184d3fa8184d3fa9184d3faa184d3fad184d3fae184d3faf184d3fb0184d3fb1184d3fb21c4e3f871c4e3f881c4e3f891c4e3f8a1c4e3f8b1c4e3f8c1c4e3f8d1c4e3f8e184e3f8f184e3f90184e3f91184e3f92184e3f93184e3f941c4e3f95"+
    "1c4e3f961c4e3f971c4e3f981c4e3f991c4e3f9a1c4e3f9b1c4e3f9c1c4e3f9d1c4e3f9e1c4e3f9f1c4e3fa0184e3fa1184e3fa2184e3fa4184e3fa5184e3fa6184e3fa8184e3fa9184e3faa184e3fab184e3fac184e3fad184e3fae184e3faf184e3fb01c4f3f7a1c4f3f7b1c4f3f861c4f3f871c4f3f881c4f3f891c4f3f8a1c4f3f8b1c4f3f8c184f3f8d184f3f8e184f3f8f184f3f90184f3f91184f3f92184f3f93184f3f941c4f3f951c4f3f961c4f3f971c4f3f981c4f3f991c4f3f9a1c4f3f9b1c4f3f9c"+
    "1c4f3f9d1c4f3f9e1c4f3f9f184f3fa0184f3fa1184f3fa2184f3fa3184f3fa4184f3fa7184f3fa8184f3fa9184f3faa184f3fab184f3fac184f3fad184f3fae184f3faf1c503f791c503f7a1c503f7b1c503f7c1c503f7d1c503f7e1c503f801c503f841c503f851c503f861c503f871c503f881c503f891c503f8a1c503f8b18503f8c18503f8d18503f8e18503f8f18503f9018503f9118503f9218503f9318503f941c503f951c503f961c503f971c503f981c503f991c503f9a1c503f9b1c503f9c1c503f9d"+
    "1c503f9e18503f9f18503fa018503fa118503fa218503fa318503fa418503fa518503fa618503fa718503fa818503fa918503faa18503fab18503fac18503fad18503fae18503faf1c513f781c513f791c513f7a1c513f7b1c513f7c1c513f7d1c513f7e1c513f7f1c513f801c513f821c513f831c513f841c513f851c513f861c513f871c513f8818513f8918513f8a18513f8b18513f8c18513f8d18513f8e18513f8f18513f9018513f9118513f9218513f9318513f941c513f951c513f961c513f971c513f98"+
    "1c513f991c513f9a1c513f9b1c513f9c1c513f9d1c513f9e18513f9f18513fa018513fa118513fa218513fa318513fa418513fa518513fa618513fa718513fa818513fa918513faa18513fac18513fad18513fae1c523f771c523f781c523f791c523f7a1c523f7b1c523f7c1c523f7d1c523f7e1c523f7f1c523f801c523f811c523f821c523f831c523f841c523f851c523f8618523f8718523f8818523f8918523f8a18523f8b18523f8c18523f8d18523f8e18523f8f18523f9018523f9118523f9218523f93"+
    "18523f941c523f951c523f961c523f971c523f981c523f991c523f9a1c523f9b1c523f9c1c523f9d18523f9e18523f9f18523fa018523fa118523fa218523fa318523fa418523fa518523fa618523fa718523fa818523fa918523faa18523fad1c533f761c533f771c533f781c533f791c533f7a1c533f7b1c533f7c1c533f7d1c533f7e1c533f7f1c533f801c533f811c533f821c533f831c533f841c533f8518533f8618533f8718533f8818533f8918533f8a18533f8b18533f8c18533f8d18533f8e18533f8f"+
    "18533f9018533f9118533f9218533f9318533f9418533f951c533f961c533f971c533f981c533f9918533f9a18533f9b18533f9c18533f9d18533f9e18533f9f18533fa018533fa118533fa218533fa318533fa418533fa518533fa618533fa718533fa818533fa918533faa18533fab1c543f741c543f751c543f761c543f771c543f781c543f791c543f7a1c543f7b1c543f7c1c543f7d1c543f7e1c543f7f1c543f801c543f811c543f821c543f8318543f8418543f8518543f8618543f8718543f8818543f89"+
    "18543f8a18543f8b18543f8c18543f8d18543f8e18543f8f18543f9018543f9118543f9218543f9518543f9618543f9718543f9818543f9918543f9a18543f9b18543f9c18543f9d18543f9e18543f9f18543fa018543fa118543fa218543fa318543fa418543fa518543fa818543fa918543faa18543fab1c553f721c553f731c553f741c553f751c553f761c553f771c553f781c553f791c553f7a1c553f7b1c553f7c1c553f7d1c553f7e1c553f7f1c553f801c553f8118553f8218553f8318553f8418553f85"+
    "18553f8618553f8718553f8818553f8918553f8a18553f8b18553f8c18553f8d18553f8e18553f8f18553f9018553f9118553f9218553f9418553f9518553f9618553f9718553f9818553f9918553f9a18553f9b18553f9c18553f9d18553f9e18553f9f18553fa018553fa118553fa218553fa318553fa418553fa618553fa718553fa91c563f721c563f731c563f741c563f751c563f761c563f771c563f781c563f791c563f7a1c563f7b1c563f7c1c563f7d1c563f7e1c563f7f1c563f8018563f8118563f82"+
    "18563f8318563f8418563f8518563f8618563f8718563f8818563f8918563f8a18563f8b18563f8c18563f8d18563f8e18563f8f18563f9118563f9318563f9518563f9618563f9718563f9818563f9918563f9a18563f9b18563f9c18563f9d18563f9e18563f9f18563fa018563fa118563fa218563fa318563fa518563fa718563fa818563fa91c573f701c573f711c573f721c573f731c573f741c573f751c573f761c573f771c573f7818573f7918573f7a18573f7b18573f7c18573f7d18573f7e18573f7f"+
    "18573f8018573f8118573f8218573f8318573f8418573f8518573f8618573f8718573f8818573f8918573f8a18573f8b18573f8c18573f8d18573f8e18573f8f18573f9118573f9218573f9618573f9718573f9818573f9918573f9a18573f9b18573f9c18573f9d18573f9e18573f9f18573fa018573fa118573fa218573fa318573fa518573fa618573fa718573fa81c583f6f1c583f701c583f711c583f721c583f731c583f741c583f7518583f7618583f7719583f7819583f7919583f7a19583f7b19583f7c"+
    "18583f7d18583f7e18583f7f18583f8018583f8118583f8218583f8318583f8418583f8518583f8618583f8718583f8818583f8918583f8a18583f8b18583f8c18583f8d18583f8e18583f8f18583f9018583f9118583f9218583f9318583f9418583f9518583f9618583f9718583f9818583f9918583f9a18583f9b18583f9c18583f9d18583f9e18583f9f18583fa018583fa118583fa218583fa318583fa418583fa618583fa71c593f6f1c593f701c593f711c593f721c593f7318593f7419593f7519593f76"+
    "19593f7719593f7819593f7919593f7a19593f7b18593f7c18593f7d18593f7e18593f7f18593f8018593f8118593f8218593f8318593f8418593f8518593f8618593f8718593f8818593f8918593f8a18593f8b18593f8c18593f8d18593f8f18593f9018593f9218593f9318593f9418593f9518593f9618593f9818593f9918593f9a18593f9b18593f9c18593f9d18593f9e18593f9f18593fa018593fa118593fa218593fa418593fa518593fa61c5a3f6f1c5a3f701c5a3f71185a3f72195a3f73195a3f74"+
    "195a3f75195a3f76195a3f77365a3f78195a3f79195a3f7a185a3f7b185a3f7c185a3f7d185a3f7e185a3f7f185a3f80185a3f81185a3f82185a3f83185a3f84185a3f85185a3f86185a3f87185a3f88185a3f89185a3f8a185a3f8d185a3f91185a3f93185a3f95185a3f96185a3f97185a3f98185a3f99185a3f9a185a3f9b185a3f9c185a3f9d185a3f9e185a3f9f185a3fa0185a3fa1185a3fa2185a3fa4185a3fa51c5b3f6e1c5b3f6f185b3f70195b3f71195b3f72195b3f73195b3f74195b3f75195b3f76"+
    "195b3f77195b3f78195b3f79195b3f7a185b3f7b185b3f7c185b3f7d185b3f7e185b3f7f185b3f80185b3f81185b3f82185b3f83185b3f84185b3f85185b3f86185b3f87185b3f88185b3f89185b3f8d185b3f8e185b3f92185b3f93185b3f95185b3f96185b3f97185b3f98185b3f99185b3f9a185b3f9b185b3f9c185b3f9d185b3f9e185b3f9f185b3fa0185b3fa1185b3fa3185b3fa41c5c3f6d1c5c3f6e185c3f6f195c3f70195c3f71365c3f72195c3f73195c3f74195c3f75195c3f76195c3f77195c3f78"+
    "195c3f79185c3f7a185c3f7b185c3f7c185c3f7d185c3f7e185c3f7f185c3f80185c3f81185c3f82185c3f83185c3f84185c3f85185c3f86185c3f88185c3f8b185c3f8c185c3f8d185c3f8e185c3f8f185c3f91185c3f92185c3f93185c3f94185c3f95185c3f96185c3f97185c3f98185c3f99185c3f9a185c3f9b185c3f9c185c3f9d185c3f9e185c3f9f185c3fa0185c3fa1185c3fa21c5d3f6b1c5d3f6c1c5d3f6d185d3f6e195d3f6f195d3f70195d3f71195d3f72195d3f73365d3f74195d3f75195d3f76"+
    "195d3f77195d3f78195d3f79185d3f7a185d3f7b185d3f7c185d3f7d185d3f7e185d3f7f185d3f80185d3f81185d3f82185d3f83185d3f84185d3f85185d3f86185d3f87185d3f88185d3f8c185d3f8f185d3f90185d3f91185d3f92185d3f93185d3f94185d3f95185d3f96185d3f97185d3f98185d3f99185d3f9a185d3f9c185d3f9d185d3f9e185d3f9f185d3fa0185d3fa1185d3fa21c5e3f6a1c5e3f6b1c5e3f6c185e3f6d195e3f6e195e3f6f195e3f70195e3f71195e3f72195e3f73195e3f74195e3f75"+
    "195e3f76195e3f77195e3f78195e3f79195e3f7a195e3f7b185e3f7c185e3f7d185e3f7e185e3f7f185e3f80185e3f81185e3f82185e3f83185e3f84185e3f85185e3f86185e3f88185e3f8c185e3f8e185e3f90185e3f91185e3f92185e3f93185e3f94185e3f95185e3f96185e3f97185e3f98185e3f99185e3f9b185e3f9c185e3f9d185e3f9e185e3f9f185e3fa01c5f3f691c5f3f6a1c5f3f6b185f3f6c195f3f6d195f3f6e195f3f6f195f3f70195f3f71195f3f72195f3f73195f3f74195f3f75195f3f76"+
    "195f3f77195f3f78195f3f79195f3f7a195f3f7b185f3f7c185f3f7d185f3f7e185f3f7f185f3f80185f3f81185f3f82185f3f84185f3f85185f3f86185f3f87185f3f88185f3f89185f3f8a185f3f8b185f3f8c185f3f8d185f3f8e185f3f8f185f3f90185f3f91185f3f92185f3f93185f3f94185f3f95185f3f96185f3f97185f3f98185f3f99185f3f9a185f3f9b185f3f9f185f3fa01c603f691c603f6a18603f6b19603f6c19603f6d19603f6e19603f6f19603f7019603f7119603f7219603f7319603f74"+
    "19603f7519603f7619603f7719603f7819603f7919603f7a19603f7b19603f7c18603f7d18603f7e18603f7f18603f8018603f8118603f8218603f8318603f8518603f8618603f8718603f8818603f8918603f8c18603f8d18603f8e18603f8f18603f9018603f9118603f9218603f9318603f9418603f9518603f9618603f9718603f9918603f9c18603f9d18603f9f1c613f681c613f6918613f6a19613f6b19613f6c19613f6d19613f6e36613f6f19613f7019613f7119613f7219613f7319613f7419613f75"+
    "19613f7619613f7719613f7836613f7919613f7a19613f7b19613f7c18613f7d18613f7e18613f7f18613f8018613f8118613f8218613f8318613f8418613f8518613f8618613f8718613f8818613f8a18613f8b18613f8c18613f8d18613f8e18613f8f18613f9018613f9118613f9218613f9318613f9418613f9518613f9618613f9c18613f9d18613f9e18623f681c623f6918623f6a19623f6b19623f6c19623f6d19623f6e19623f6f19623f7019623f7119623f7219623f7319623f7419623f7519623f76"+
    "19623f7719623f7819623f7919623f7a19623f7b18623f7c18623f7d18623f7e18623f7f18623f8018623f8118623f8218623f8318623f8418623f8918623f8a18623f8c18623f8d18623f8e18623f8f18623f9018623f9218623f9318623f9418623f9518623f9618623f9918623f9a18623f9b18623f9c18623f9d1c633f6718633f6818633f6919633f6a19633f6b19633f6c19633f6d19633f6e19633f6f19633f7019633f7119633f7219633f7319633f7419633f7519633f7619633f7719633f7819633f79"+
    "19633f7a19633f7b18633f7c18633f7d18633f7e18633f7f18633f8018633f8118633f8218633f8318633f8418633f8618633f8818633f8918633f8a18633f8b18633f8c18633f8d18633f8e18633f8f18633f9118633f9218633f9318633f9418633f9618633f9718633f9b18633f9c18643f671d643f681d643f6919643f6a19643f6b19643f6c19643f6d19643f6e19643f6f19643f7019643f7119643f7219643f7319643f7419643f7519643f7619643f7719643f7819643f7919643f7a18643f7b18643f7c"+
    "18643f7d18643f7e18643f7f18643f8018643f8118643f8418643f8518643f8618643f8718643f8818643f8918643f8a18643f8b18643f8c18643f8d18643f8f18643f9018643f9118643f9318643f9418643f9518643f9618643f9718643f9b29653f651d653f661d653f6718653f6819653f6919653f6a19653f6b19653f6c19653f6d19653f6e19653f6f19653f7019653f7119653f7219653f7319653f7419653f7519653f7619653f7719653f7819653f7918653f7a18653f7b18653f7c18653f7d18653f7e"+
    "18653f7f18653f8018653f8118653f8218653f8318653f8418653f8518653f8618653f8718653f8818653f8918653f8a18653f8b18653f8c18653f8d18653f8e18653f8f18653f9018653f9318653f9518653f9618653f9918653f9a29663f6429663f6518663f6618663f671d663f6819663f6919663f6a19663f6b19663f6c36663f6d19663f6e19663f6f19663f7019663f7119663f7219663f7319663f7419663f7519663f7619663f7719663f7819663f7918663f7a18663f7b18663f7c18663f7d18663f7e"+
    "18663f7f18663f8018663f8118663f8218663f8318663f8418663f8518663f8618663f8718663f8818663f8918663f8a18663f8b18663f8c18663f8e18663f8f18663f9018663f9118663f9218663f9318663f9418663f9518663f9618663f9818663f9929673f6429673f651d673f6618673f6719673f6919673f6a19673f6b19673f6c19673f6d19673f6e19673f6f19673f7019673f7119673f7219673f7319673f7419673f7519673f7619673f7719673f7818673f7918673f7a18673f7b18673f7c18673f7d"+
    "18673f7e18673f7f18673f8018673f8118673f8218673f8318673f8418673f8518673f8618673f8718673f8818673f8918673f8a18673f8b18673f8c18673f8d18673f8e18673f8f18673f9318673f9518673f9618673f9718673f9818683f6619683f6819683f6919683f6a19683f6b19683f6c19683f6d19683f6e19683f6f19683f7019683f7119683f7219683f7319683f7419683f7519683f7619683f7718683f7818683f7918683f7a18683f7b18683f7c18683f7d18683f7e18683f7f18683f8018683f81"+
    "18683f8218683f8318683f8418683f8518683f8618683f8718683f8818683f8918683f8a18683f8b18683f8c18683f8d18683f8e18683f9018683f9218683f9518683f970e693f520e693f5325693f5425693f5619693f6719693f6819693f6919693f6a18693f6b18693f6c18693f6d19693f6e19693f6f19693f7019693f7119693f7236693f7319693f7419693f7519693f7619693f7718693f7818693f7918693f7a18693f7b18693f7c18693f7d18693f7e18693f7f18693f8018693f8118693f8218693f83"+
    "18693f8418693f8518693f8618693f8718693f8818693f8b18693f8c18693f8d18693f8e18693f8f18693f9018693f9118693f9318693f9418693f9518693f960f6a3f4e0f6a3f4f0e6a3f503e6a3f533e6a3f543e6a3f550e6a3f560e6a3f570e6a3f65196a3f66196a3f67186a3f68186a3f691c6a3f6a1c6a3f6b1c6a3f6c186a3f6d186a3f6e186a3f6f186a3f70196a3f71196a3f72196a3f73196a3f74196a3f75196a3f76186a3f77186a3f78186a3f79186a3f7a186a3f7b186a3f7c186a3f7d186a3f7e"+
    "186a3f7f186a3f80186a3f81186a3f82186a3f83186a3f84186a3f85186a3f86186a3f87186a3f88186a3f89186a3f8a186a3f8b186a3f8d186a3f8e186a3f8f186a3f90186a3f92186a3f93186a3f94186a3f953e6b3f533e6b3f543e6b3f553e6b3f563e6b3f57256b3f59276b3f5e276b3f5f276b3f63276b3f64276b3f65276b3f661c6b3f671c6b3f681c6b3f691c6b3f6a1c6b3f6b1c6b3f6c1c6b3f6d1c6b3f6e1c6b3f6f186b3f70186b3f71196b3f72196b3f73196b3f74196b3f75186b3f76186b3f77"+
    "186b3f78186b3f79186b3f7a186b3f7b186b3f7c186b3f7d186b3f7e186b3f7f186b3f80186b3f81186b3f82186b3f83186b3f84186b3f85186b3f86186b3f87186b3f88186b3f89186b3f8a186b3f8b186b3f8c186b3f8d186b3f8e186b3f8f186b3f90186b3f91186b3f93186b3f940f6b3fae3e6c3f523e6c3f533e6c3f543e6c3f553e6c3f563e6c3f573e6c3f58276c3f5b276c3f5c1c6c3f68186c3f691c6c3f6a1c6c3f6b1c6c3f6c1c6c3f6d1c6c3f6e1c6c3f6f1c6c3f70186c3f71196c3f72196c3f73"+
    "196c3f74186c3f75186c3f76186c3f77186c3f78186c3f79186c3f7a186c3f7b186c3f7c186c3f7d186c3f7e186c3f7f186c3f80186c3f81186c3f82186c3f83186c3f84186c3f85186c3f86186c3f87186c3f88186c3f89186c3f8a186c3f8b186c3f8c186c3f8d186c3f8e186c3f8f186c3f90186c3f91186c3f92186c3f930f6c3faa3e6d3f523e6d3f533e6d3f543e6d3f553e6d3f563e6d3f573e6d3f58276d3f59106d3f621c6d3f671c6d3f681c6d3f691c6d3f6a1c6d3f6b1c6d3f6c1c6d3f6d1c6d3f6e"+
    "1c6d3f6f186d3f70196d3f71196d3f72196d3f73186d3f74186d3f75186d3f76186d3f77186d3f78186d3f79186d3f7a186d3f7b186d3f7c186d3f7d186d3f7e186d3f7f186d3f80186d3f81186d3f82186d3f83186d3f84186d3f85186d3f86186d3f87186d3f88186d3f89186d3f8a186d3f8b186d3f8c186d3f8f186d3f91186d3f92256d3fa83e6e3f513e6e3f52206e3f533e6e3f543e6e3f553e6e3f563e6e3f57276e3f581c6e3f661c6e3f671c6e3f681c6e3f691c6e3f6a1c6e3f6b1c6e3f6c1c6e3f6d"+
    "1c6e3f6e1c6e3f6f186e3f70186e3f71186e3f72186e3f73186e3f74186e3f75186e3f76186e3f77186e3f78186e3f79186e3f7a186e3f7b186e3f7c186e3f7d186e3f7e186e3f7f186e3f80186e3f81186e3f82186e3f83186e3f84186e3f85186e3f86186e3f87186e3f88186e3f89186e3f8a186e3f8b186e3f8e186e3f8f186e3f90186e3f91256e3fa60f6e3fb23e6f3f4f3e6f3f503e6f3f513e6f3f523e6f3f533e6f3f543e6f3f55276f3f56266f3f631c6f3f641c6f3f65076f3f66076f3f67076f3f68"+
    "076f3f69076f3f6a076f3f6b076f3f6c076f3f6d1c6f3f6e1c6f3f6f186f3f70186f3f71186f3f72186f3f73186f3f74186f3f75186f3f76186f3f77186f3f78186f3f79186f3f7a186f3f7b186f3f7c186f3f7d186f3f7e186f3f7f186f3f80186f3f81186f3f82186f3f83186f3f84186f3f85186f3f86186f3f87186f3f88186f3f89186f3f8a186f3f8d186f3f8f1c6f3f91256f3fa53e703f4e3e703f4f3e703f503e703f513e703f523e703f533e703f5427703f550f703f5a18703f631c703f6407703f65"+
    "19703f6619703f6719703f6819703f6919703f6a19703f6b07703f6c1c703f6d18703f6e18703f6f18703f7018703f7118703f7218703f7318703f7418703f7518703f7618703f7718703f7818703f7918703f7a18703f7b18703f7c18703f7d18703f7e18703f7f18703f8018703f8118703f8218703f8318703f8418703f8518703f8718703f8918703f8a18703f8b18703f8c18703f8d18703f8e1c703f901c703f911c703f961c703f971c703f981c703f990e703fa43e703fa53e703fa63e703fa70f703fb0"+
    "3e713f4d3e713f4e3e713f4f3e713f503e713f513e713f523e713f5327713f540f713f570e713f580e713f590f713f5a29713f5e29713f5f29713f6018713f621c713f6307713f6419713f6519713f6619713f6719713f6819713f6919713f6a07713f6b1c713f6c18713f6d18713f6e18713f6f18713f7018713f7118713f7218713f7318713f7418713f7518713f7618713f7718713f7818713f7918713f7a18713f7b18713f7c18713f7d18713f7e18713f7f18713f8018713f8118713f8218713f8318713f84"+
    "18713f8618713f8718713f8818713f8918713f8a18713f8b18713f8c18713f8d18713f8e1c713f8f1c713f901c713f921c713f931c713f941c713f951c713f961c713f971c713f9825713fa23e713fa33e713fa43e713fa53e713fa63e713fa73e713fa80f713fae3e723f4c3e723f4d3e723f4e3e723f4f3e723f503e723f513e723f5227723f530f723f550e723f560c723f570e723f5918723f5c1d723f5d1d723f5e1d723f5f18723f6027723f610e723f620e723f630e723f6427723f6519723f6636723f67"+
    "19723f6819723f6907723f6a1c723f6b18723f6c18723f6d18723f6e18723f6f18723f7018723f7118723f7218723f7318723f7418723f7518723f7618723f7718723f7818723f7918723f7a18723f7b18723f7c18723f7d18723f7e18723f7f18723f8018723f8118723f8218723f8318723f8518723f8618723f8718723f8818723f8918723f8a18723f8b18723f8d1c723f8e1c723f8f1c723f901c723f911c723f921c723f931c723f941c723f951c723f961c723f971c723f983e723fa23e723fa320723fa4"+
    "3e723fa53e723fa63e723fa73e723fa80e723fad3e723fb53e723fb63e733f4a3e733f4b3e733f4c3e733f4d3e733f4e3e733f4f3e733f503e733f5127733f520e733f550e733f580f733f5918733f5a18733f5b1d733f5c1d733f5d1d733f5e18733f5f0e733f6028733f6128733f6228733f630e733f6419733f6519733f6619733f6719733f6807733f691c733f6a18733f6b18733f6c18733f6d18733f6e18733f6f18733f7018733f7118733f7218733f7318733f7418733f7518733f7618733f7718733f78"+
    "18733f7918733f7a18733f7b18733f7c18733f7d18733f7e18733f7f18733f8018733f8118733f8218733f8318733f8518733f8718733f8818733f8918733f8b18733f8c1c733f8d1c733f8e1c733f8f1c733f901c733f911c733f931c733f941c733f951c733f961c733f9725733fa03e733fa13e733fa23e733fa33e733fa43e733fa53e733fa63e733fa73e733fa83e733fa93e733faa0e733fac3e733fb23e733fb33e733fb43e733fb53e733fb63e743f4a3e743f4b3e743f4c3e743f4d3e743f4e3e743f4f"+
    "27743f500f743f540e743f550e743f560f743f5718743f5918743f5a1d743f5b1d743f5c18743f5d1d743f5e0e743f5f28743f6028743f6128743f6227743f630e743f6427743f6519743f6619743f6707743f681c743f6918743f6a18743f6b18743f6c18743f6d18743f6e18743f6f18743f7018743f7118743f7218743f7318743f7418743f7518743f7618743f7718743f7818743f7918743f7a18743f7b18743f7c18743f7d18743f7e18743f7f18743f8018743f8118743f8218743f8418743f8518743f86"+
    "18743f8818743f8a18743f8b1c743f8c1c743f8d1c743f8e1c743f8f1c743f931c743f943e743f9f3e743fa03e743fa13e743fa23e743fa33e743fa43e743fa520743fa63e743fa73e743fa83e743fa93e743faa0e743fab3e743fac3e743fad3e743fae3e743faf3e743fb03e743fb13e743fb23e743fb33e743fb43e743fb53e743fb63e753f4a3e753f4b3e753f4c3e753f4d3e753f4e27753f4f0f753f5418753f5818753f5918753f5a1d753f5b18753f5c1d753f5d0e753f5e28753f5f28753f6028753f61"+
    "28753f6228753f630e753f6407753f6507753f6607753f671c753f6818753f6918753f6a18753f6b18753f6c18753f6d18753f6e18753f6f18753f7018753f7118753f7218753f7318753f7418753f7518753f7618753f7718753f7818753f7918753f7a18753f7b18753f7c18753f7d18753f7e18753f7f18753f8018753f8118753f8218753f8318753f8518753f8618753f8718753f8818753f8918753f8a1c753f8b1c753f8c1c753f8d3e753f9e3e753f9f3e753fa03e753fa13e753fa23e753fa33e753fa4"+
    "3e753fa53e753fa63e753fa73e753fa83e753fa925753faa3e753fab3e753fac3e753fad3e753fae3e753faf3e753fb03e753fb13e753fb23e753fb33e753fb43e753fb53e753fb63e763f4a3e763f4b3e763f4c3e763f4d27763f4e1c763f5318763f5418763f5518763f561c763f5718763f5818763f591d763f5a1d763f5b1d763f5c0e763f5d28763f5e28763f5f28763f6028763f6128763f620e763f631c763f641c763f651c763f661c763f6718763f6818763f6918763f6a18763f6b18763f6c18763f6d"+
    "18763f6e18763f6f18763f7018763f7118763f7218763f7318763f7418763f7518763f7618763f7718763f7818763f7918763f7a18763f7b18763f7c18763f7d18763f7e18763f7f18763f8018763f8118763f8218763f8418763f8518763f8618763f8718763f891c763f8a1c763f8b27763f960e763f9c3e763f9d3e763f9e3e763f9f3e763fa03e763fa13e763fa23e763fa33e763fa43e763fa53e763fa63e763fa73e763fa83e763fa93e763fab3e763fac20763fad3e763fae3e763faf3e763fb03e763fb1"+
    "3e763fb23e763fb33e763fb43e763fb520763fb63e773f4a3e773f4b3e773f4c27773f4d1c773f4f1c773f501c773f5118773f521c773f5318773f541c773f5518773f5618773f571d773f5818773f5918773f5a18773f5b0e773f5c28773f5d28773f5e3c773f5f3c773f603c773f610e773f621c773f631c773f641c773f6518773f6618773f6718773f6818773f6918773f6a18773f6b18773f6c18773f6d18773f6e18773f6f18773f7018773f7118773f7218773f7318773f7418773f7518773f7618773f77"+
    "18773f7818773f7918773f7a18773f7b18773f7c18773f7d18773f7e18773f7f18773f8018773f8118773f8218773f8318773f8518773f8618773f871c773f891c773f8a0e773f9b3e773f9c3e773f9d3e773f9e3e773f9f3e773fa03e773fa13e773fa23e773fa33e773fa43e773fa53e773fa63e773fa73e773fa80e773fa93e773faa3e773fab3e773fac3e773fad3e773fae3e773faf3e773fb03e773fb13e773fb23e773fb33e773fb43e773fb53e773fb63e783f4a3e783f4b27783f4c1c783f4d18783f4e"+
    "18783f4f18783f5018783f5118783f5218783f5318783f5418783f5518783f561d783f5718783f581d783f5918783f5a27783f5b0e783f5c0e783f5d3c783f5e3c783f5f3c783f6027783f611c783f621c783f631c783f6418783f6518783f6618783f6718783f6818783f6918783f6a18783f6b18783f6c18783f6d18783f6f18783f7018783f7118783f7218783f7318783f7418783f7518783f7618783f7718783f7818783f7918783f7a18783f7b18783f7c18783f7d18783f7e18783f7f18783f8018783f81"+
    "18783f8218783f8318783f8418783f8518783f8618783f871c783f881c783f891c783f8a0e783f9b3e783f9c3e783f9d20783f9e3e783f9f3e783fa03e783fa13e783fa23e783fa33e783fa43e783fa53e783fa63e783fa725783fa83e783fa93e783faa3e783fab3e783fac3e783fad3e783fae3e783faf3e783fb03e783fb13e783fb23e783fb33e783fb43e783fb53e783fb627793f4a1c793f4b1c793f4c18793f4d18793f4e18793f4f18793f5018793f5118793f5218793f5318793f5418793f551d793f56"+
    "18793f571d793f5818793f5918793f5a1c793f5b1c793f5c3c793f5d3c793f5e3c793f5f1c793f601c793f611c793f6218793f6318793f6418793f6518793f6618793f6818793f6918793f6b18793f6e18793f7118793f7218793f7318793f7418793f7518793f7618793f7718793f7818793f7918793f7a18793f7b18793f7c18793f7d18793f7e18793f7f18793f8118793f8218793f8318793f8418793f861c793f871c793f881c793f891c793f8a25793f9a3e793f9b3e793f9c3e793f9d3e793f9e3e793f9f"+
    "3e793fa03e793fa120793fa23e793fa33e793fa43e793fa53e793fa619793fa73e793fa919793faa19793fab3e793fac3e793fad3e793fae3e793faf3e793fb019793fb119793fb219793fb319793fb43e793fb527793fb61c7a3f4a1c7a3f4b187a3f4c187a3f4d187a3f4e187a3f4f187a3f50187a3f51187a3f52187a3f53187a3f54187a3f55187a3f56187a3f57187a3f581c7a3f59187a3f5a1c7a3f5b1c7a3f5c1c7a3f5d1c7a3f5e1c7a3f5f1c7a3f60187a3f68187a3f69187a3f6b187a3f70187a3f71"+
    "187a3f72187a3f73187a3f74187a3f75187a3f76187a3f77187a3f78187a3f79187a3f7a187a3f7b187a3f7c187a3f7d187a3f7e187a3f7f187a3f81187a3f83187a3f84187a3f851c7a3f861c7a3f871c7a3f88277a3f8e257a3f9a3e7a3f9b3e7a3f9c3e7a3f9d3e7a3f9e3e7a3f9f3e7a3fa03e7a3fa13e7a3fa23e7a3fa33e7a3fa4197a3fa5197a3fa60e7a3fa7197a3fa8197a3fa9197a3faa197a3fab197a3fac3e7a3fad3e7a3fae197a3faf197a3fb0197a3fb1197a3fb2197a3fb3197a3fb4187a3fb5"+
    "1c7a3fb6187b3f4a187b3f4b187b3f4c187b3f4d187b3f4e187b3f4f187b3f50187b3f51187b3f52187b3f53187b3f54187b3f55187b3f56187b3f57187b3f58187b3f59187b3f5a187b3f5b187b3f5c1c7b3f5d1c7b3f5e187b3f5f1c7b3f60187b3f61187b3f62187b3f63187b3f64187b3f65187b3f66187b3f68187b3f6a187b3f6d187b3f6e187b3f6f187b3f70187b3f71187b3f72187b3f73187b3f74187b3f75187b3f76187b3f77187b3f78187b3f79187b3f7a187b3f7b187b3f7c187b3f7d187b3f7e"+
    "187b3f7f187b3f80187b3f81187b3f83187b3f841c7b3f851c7b3f861c7b3f871c7b3f881c7b3f891c7b3f8a1c7b3f8b257b3f9a3e7b3f9b3e7b3f9c3e7b3f9d3e7b3f9e3e7b3f9f3e7b3fa03e7b3fa1197b3fa2197b3fa3197b3fa4197b3fa5197b3fa6197b3fa8197b3fa9197b3faa197b3fab197b3fac197b3fad197b3fae197b3faf197b3fb0367b3fb1197b3fb2197b3fb3187b3fb41c7b3fb5187b3fb6187c3f4a187c3f4b187c3f4c187c3f4d187c3f4e187c3f4f187c3f50187c3f51187c3f52187c3f53"+
    "187c3f54187c3f55187c3f56187c3f57187c3f59187c3f5a187c3f5b187c3f5d187c3f5e187c3f61187c3f63187c3f66187c3f67187c3f69187c3f6a187c3f6b187c3f6c187c3f6d187c3f6e187c3f71187c3f72187c3f73187c3f74187c3f75187c3f76187c3f77187c3f78187c3f79187c3f7a187c3f7b187c3f7c187c3f7d187c3f7e187c3f7f187c3f80187c3f81187c3f82187c3f831c7c3f841c7c3f851c7c3f861c7c3f871c7c3f881c7c3f89277c3f8a1c7c3f8b257c3f993e7c3f9a3e7c3f9b3e7c3f9c"+
    "3e7c3f9d3e7c3f9e197c3f9f197c3fa0197c3fa1197c3fa2197c3fa3197c3fa4197c3fa50e7c3fa6197c3fa7197c3fa8197c3fa9367c3faa197c3fab197c3fac197c3fad197c3fae197c3faf197c3fb0197c3fb1187c3fb21c7c3fb31c7c3fb4187c3fb5187c3fb6187d3f4a187d3f4b187d3f4c187d3f4d187d3f4e187d3f4f187d3f50187d3f51187d3f52187d3f53187d3f54187d3f56187d3f58187d3f5a187d3f5b187d3f5f187d3f62187d3f64187d3f65187d3f66187d3f67187d3f68187d3f69187d3f6b"+
    "187d3f6c187d3f6d187d3f6e187d3f70187d3f71187d3f72187d3f73187d3f74187d3f75187d3f76187d3f77187d3f78187d3f79187d3f7a187d3f7b187d3f7c187d3f7d187d3f7e187d3f7f187d3f80187d3f81187d3f821c7d3f831c7d3f841c7d3f851c7d3f861c7d3f871c7d3f88277d3f891c7d3f8a1c7d3f8b1c7d3f8c1c7d3f98257d3f9a3e7d3f9b3e7d3f9c197d3f9d197d3f9e197d3f9f197d3fa0367d3fa1197d3fa2197d3fa3197d3fa4197d3fa6197d3fa7197d3fa8197d3fa9197d3faa197d3fab"+
    "197d3fac197d3fad197d3fae197d3faf187d3fb01c7d3fb11c7d3fb21c7d3fb3187d3fb4187d3fb5187d3fb6187e3f4a187e3f4b187e3f4c187e3f4d187e3f4e187e3f4f187e3f50187e3f51187e3f53187e3f54187e3f55187e3f56187e3f57187e3f58187e3f59187e3f5a187e3f5b187e3f5c187e3f5f187e3f60187e3f63187e3f66187e3f68187e3f69187e3f6a187e3f6b187e3f6d187e3f6e187e3f6f187e3f70187e3f71187e3f72187e3f73187e3f74187e3f75187e3f76187e3f77187e3f78187e3f79"+
    "187e3f7a187e3f7b187e3f7c187e3f7d187e3f7e187e3f7f187e3f80187e3f811c7e3f821c7e3f831c7e3f841c7e3f851c7e3f86277e3f87277e3f88277e3f89277e3f8a1c7e3f8b1c7e3f971c7e3f981c7e3f99257e3f9c197e3f9d197e3f9e197e3f9f197e3fa0197e3fa1197e3fa2197e3fa3187e3fa4197e3fa5187e3fa6187e3fa7187e3fa8197e3fa9197e3faa197e3fab197e3fac187e3fad187e3fae1c7e3faf1c7e3fb0187e3fb1187e3fb2187e3fb3187e3fb4187e3fb5187e3fb6187f3f4a187f3f4b"+
    "187f3f4c187f3f4d187f3f4e187f3f4f187f3f50187f3f52187f3f53187f3f54187f3f55187f3f56187f3f57187f3f58187f3f59187f3f5a187f3f5c187f3f5d187f3f5e187f3f5f187f3f62187f3f63187f3f65187f3f66187f3f67187f3f68187f3f69187f3f6a187f3f6c187f3f6d187f3f6e187f3f6f187f3f70187f3f71187f3f72187f3f73187f3f74187f3f75187f3f76187f3f77187f3f78187f3f79187f3f7a187f3f7b187f3f7c187f3f7d187f3f7e187f3f7f187f3f801c7f3f811c7f3f821c7f3f83"+
    "1c7f3f841c7f3f851c7f3f861c7f3f87277f3f881c7f3f891c7f3f8a277f3f8d1c7f3f96187f3f97187f3f98187f3f99187f3f9a1c7f3f9b257f3f9c0e7f3f9d197f3f9e197f3f9f197f3fa0197f3fa1197f3fa2187f3fa3187f3fa41c7f3fa51c7f3fa61c7f3fa7187f3fa8187f3fa9187f3faa187f3fab1c7f3fac1c7f3fad187f3fae187f3faf187f3fb0187f3fb3187f3fb4187f3fb5187f3fb618803f4a18803f4b18803f4c18803f4d18803f4e18803f4f18803f5118803f5318803f5418803f5618803f57"+
    "18803f5818803f5918803f5a18803f5b18803f5d18803f5f18803f6118803f6218803f6318803f6418803f6518803f6718803f6818803f6918803f6a18803f6b18803f6c18803f6e18803f6f18803f7018803f7118803f7218803f7318803f7418803f7518803f7618803f7718803f7818803f7918803f7a18803f7b18803f7c18803f7d18803f7e18803f7f1c803f801c803f811c803f821c803f831c803f841c803f851c803f861c803f871c803f881c803f891c803f8a1c803f941c803f951d803f9618803f97"+
    "1d803f981d803f9918803f9a18803f9b1c803f9c18803f9d18803f9e19803f9f19803fa018803fa11c803fa21c803fa31c803fa41c803fa51c803fa61c803fa71c803fa81c803fa91c803faa1c803fab18803fad18803fae18803faf18803fb018803fb418803fb518803fb618813f4a18813f4b18813f4c18813f4d18813f4e18813f4f18813f5118813f5318813f5418813f5518813f5618813f5718813f5818813f5918813f5a18813f5b18813f5c18813f5d18813f6018813f6218813f6318813f6618813f68"+
    "18813f6a18813f6b18813f6c18813f6d18813f6e18813f6f18813f7018813f7118813f7218813f7318813f7418813f7518813f7618813f7718813f7818813f7918813f7a18813f7b18813f7c18813f7d18813f7e1c813f7f1c813f801c813f811c813f821c813f831c813f841c813f851c813f861c813f871c813f881c813f891c813f931c813f941d813f951d813f961d813f971d813f981d813f9918813f9a18813f9b1c813f9c1c813f9d18813f9e18813f9f1c813fa01c813fa11c813fa21c813fa318813fa4"+
    "1c813fa51c813fa61c813fa71c813fa81c813fa918813faa18813fab18813fad18813fae18813fb118813fb218813fb518813fb618823f4a18823f4b18823f4c18823f4d18823f4e18823f4f18823f5018823f5118823f5218823f5418823f5518823f5818823f5b18823f5d18823f5e18823f6218823f6418823f6518823f6618823f6718823f6818823f6918823f6b18823f6c18823f6d18823f6e18823f6f18823f7018823f7118823f7218823f7318823f7418823f7518823f7618823f7718823f7818823f79"+
    "18823f7a18823f7b18823f7c18823f7d1c823f7e1c823f7f1c823f801c823f811c823f821c823f831c823f841c823f851c823f861c823f871c823f921c823f931d823f941d823f9518823f9618823f9718823f9818823f991c823f9a18823f9b1c823f9c1c823f9d18823f9e1c823f9f1c823fa018823fa11c823fa21c823fa318823fa41c823fa51c823fa61c823fa71c823fa818823fa918823fad18823faf18823fb018823fb418823fb518823fb618833f4a18833f4b18833f4c18833f4d18833f4e18833f50"+
    "18833f5118833f5318833f5418833f5a18833f5b18833f5c18833f5e18833f5f18833f6018833f6218833f6318833f6418833f6518833f6618833f6718833f6918833f6a18833f6b18833f6c18833f6d18833f6e18833f6f18833f7018833f7118833f7218833f7318833f7418833f7518833f7618833f7718833f7818833f7918833f7a18833f7b18833f7c1c833f7d1c833f7e1c833f7f1c833f801c833f811c833f821c833f831c833f841c833f851c833f861c833f901c833f9118833f9218833f9318833f94"+
    "18833f9518833f9618833f9718833f9818833f991c833f9a1c833f9b1c833f9c18833f9d18833f9e18833f9f18833fa018833fa118833fa218833fa318833fa418833fa51c833fa618833fa818833fab18833fac18833fae18833fb018833fb118833fb218833fb318833fb418833fb518833fb618843f4a18843f4b18843f4c18843f4f18843f5018843f5118843f5218843f5318843f5518843f5618843f5a18843f5d18843f5f18843f6018843f6118843f6318843f6418843f6518843f6618843f6718843f68"+
    "18843f6918843f6a18843f6b18843f6c18843f6d18843f6e18843f6f18843f7018843f7118843f7218843f7318843f7418843f7518843f7618843f7718843f7818843f7918843f7a18843f7b1c843f7c1c843f7d1c843f7e1c843f7f1c843f801c843f811c843f821c843f831c843f841c843f851c843f861c843f8e1c843f8f18843f901c843f9118843f9218843f9318843f9418843f9518843f9618843f9718843f9818843f9918843f9a18843f9b18843f9c18843f9d18843f9e18843f9f18843fa018843fa1"+
    "18843fa218843fa318843fa418843fa518843fa618843fa918843faa18843fab18843fac18843fad18843fae18843faf18843fb318843fb418843fb518843fb618853f4a18853f4b18853f4d18853f4e18853f5018853f5218853f5318853f5518853f5618853f5918853f5a18853f5b18853f5d18853f6118853f6218853f6318853f6418853f6818853f6918853f6a18853f6b18853f6c18853f6d18853f6e18853f6f18853f7018853f7118853f7218853f7318853f7418853f7518853f7618853f7718853f78"+
    "18853f7918853f7a1c853f7b1c853f7c1c853f7d1c853f7e1c853f7f1c853f801c853f811c853f821c853f831c853f841c853f851c853f8d18853f8e1c853f8f1c853f901c853f9118853f9218853f9318853f9418853f9518853f9618853f9718853f9818853f9918853f9a18853f9b18853f9c18853f9d18853f9e18853f9f18853fa018853fa118853fa218853fa818853fa918853fae18853fb018853fb118853fb218853fb318853fb418853fb518853fb618863f4a18863f4b18863f4d18863f4e18863f4f"+
    "18863f5018863f5118863f5218863f5318863f5418863f5518863f5718863f5818863f5b18863f5e18863f5f18863f6018863f6118863f6218863f6318863f6518863f6618863f6718863f6818863f6918863f6a18863f6b18863f6c18863f6d18863f6e18863f6f18863f7018863f7118863f7218863f7318863f7418863f7518863f7618863f7718863f7818863f791c863f7a1c863f7b1c863f7c1c863f7d1c863f7e1c863f7f1c863f801c863f811c863f821c863f831c863f841c863f8c1c863f8d18863f8e"+
    "18863f8f18863f9018863f9118863f9218863f9318863f9418863f9518863f9618863f9718863f9818863f9918863f9a18863f9b18863f9c18863f9d18863f9f18863fa018863fa218863fa818863fa918863faa18863fac18863fad18863faf18863fb218863fb318863fb418863fb518863fb618873f4a18873f4b18873f4c18873f4d18873f4e18873f4f18873f5018873f5118873f5218873f5318873f5418873f5518873f5618873f5718873f5818873f5918873f5a18873f5b18873f5c18873f5e18873f5f"+
    "18873f6018873f6118873f6218873f6318873f6418873f6518873f6618873f6718873f6818873f6918873f6a18873f6b18873f6c18873f6d18873f6e18873f6f18873f7018873f7118873f7218873f7318873f7418873f7518873f7618873f7718873f781c873f791c873f7a1c873f7b1c873f7c1c873f7d1c873f7e1c873f7f1c873f801c873f811c873f821c873f8325873f8b18873f8c19873f8d19873f8e19873f8f18873f9018873f9118873f9218873f9318873f9418873f9518873f9618873f9718873f98"+
    "18873f9918873f9a18873f9b18873f9c18873f9d18873f9e18873fa418873fa618873fa718873fa918873fac18873fad18873fae18873faf18873fb018873fb118873fb218873fb318873fb418873fb518873fb618883f4a18883f4b18883f4c18883f4d18883f4e18883f4f18883f5018883f5118883f5218883f5318883f5418883f5518883f5618883f5718883f5818883f5918883f5a18883f5b18883f5c18883f5d18883f5f18883f6018883f6118883f6218883f6318883f6418883f6518883f6618883f67"+
    "18883f6818883f6918883f6a18883f6b18883f6c18883f6d18883f6e18883f6f18883f7018883f7118883f7218883f7318883f7418883f7518883f7618883f771c883f781c883f791c883f7a1c883f7b1c883f7c1c883f7d1c883f7e1c883f7f1c883f801c883f811c883f821c883f831c883f841c883f851c883f861c883f870e883f8825883f8919883f8a19883f8b19883f8c19883f8d19883f8e19883f8f19883f9018883f9118883f9218883f9318883f9418883f9518883f9618883f9718883f9818883f99"+
    "18883f9a18883f9c18883f9d18883f9e18883fa918883faa18883fac18883fad18883fae18883fb018883fb118883fb218883fb318883fb418883fb518883fb618893f4a18893f4b18893f4c18893f4d18893f4e18893f4f18893f5018893f5118893f5218893f5318893f5418893f5518893f5618893f5718893f5818893f5918893f5a18893f5b18893f5c18893f5d18893f5e18893f5f18893f6018893f6118893f6218893f6318893f6418893f6518893f6618893f6718893f6818893f6918893f6a18893f6b"+
    "18893f6c18893f6d18893f6e18893f6f18893f7018893f7118893f7218893f7318893f7418893f7518893f761c893f771c893f781c893f791c893f7a1c893f7b1c893f7c1c893f7d1c893f7e1c893f7f1c893f801c893f811c893f821c893f831c893f8418893f8518893f8619893f8719893f8819893f8919893f8a19893f8b19893f8c19893f8d19893f8e19893f8f18893f9018893f9118893f9218893f9318893f9418893f9518893f9618893f9718893f9818893f9918893f9a18893f9b18893f9c18893f9d"+
    "18893fa618893fab18893fac18893fae18893faf18893fb018893fb118893fb218893fb318893fb418893fb518893fb6188a3f4a188a3f4b188a3f4c188a3f4d188a3f4e188a3f4f188a3f50188a3f51188a3f52188a3f54188a3f553d8a3f563d8a3f57188a3f58188a3f59188a3f5a188a3f5c188a3f5d188a3f5e188a3f5f188a3f60188a3f61188a3f62188a3f63188a3f64188a3f65188a3f66188a3f67188a3f68188a3f69188a3f6a188a3f6b188a3f6c188a3f6d188a3f6e188a3f6f188a3f70188a3f71"+
    "188a3f72188a3f73188a3f74188a3f751c8a3f761c8a3f771c8a3f781c8a3f791c8a3f7a1c8a3f7b1c8a3f7c1c8a3f7d1c8a3f7e1c8a3f7f1c8a3f801c8a3f811c8a3f82188a3f83198a3f84198a3f85198a3f86198a3f87198a3f88198a3f89198a3f8a198a3f8b198a3f8c198a3f8d188a3f8e188a3f90188a3f91188a3f92188a3f93188a3f94188a3f95188a3f96188a3f97188a3f99188a3f9a188a3f9b188a3f9c188a3f9e188a3fa0188a3fa5188a3fa7188a3faa188a3fac188a3fad188a3fae188a3faf"+
    "188a3fb0188a3fb1188a3fb2188a3fb3188a3fb4188a3fb5188a3fb6188b3f4a188b3f4b188b3f4d188b3f4e188b3f4f188b3f50188b3f52188b3f53188b3f543d8b3f553d8b3f56188b3f57188b3f58188b3f59188b3f5a188b3f5b188b3f5c188b3f5d188b3f5e188b3f5f188b3f60188b3f61188b3f62188b3f63188b3f64188b3f65188b3f66188b3f67188b3f68188b3f69188b3f6a188b3f6b188b3f6c188b3f6d188b3f6e188b3f6f188b3f70188b3f71188b3f72188b3f73188b3f741c8b3f751c8b3f76"+
    "1c8b3f771c8b3f781c8b3f791c8b3f7a1c8b3f7b1c8b3f7c1c8b3f7d1c8b3f7e1c8b3f7f1c8b3f80188b3f81198b3f82198b3f83198b3f84198b3f85198b3f86198b3f87198b3f88368b3f89198b3f8a198b3f8b198b3f8c188b3f8d188b3f8e188b3f8f188b3f91188b3f92188b3f93188b3f94188b3f95188b3f96188b3f97188b3f9a188b3f9e188b3fa2188b3fa3188b3fa4188b3fa6188b3fa7188b3fa8188b3faa188b3fab188b3fad188b3fae188b3faf188b3fb0188b3fb1188b3fb2188b3fb3188b3fb4"+
    "188b3fb5188c3f4a188c3f4b188c3f4c188c3f4d188c3f4e188c3f52188c3f53188c3f54188c3f55188c3f56188c3f57188c3f58188c3f5a188c3f5b188c3f5d188c3f5e188c3f5f188c3f60188c3f61188c3f62188c3f63188c3f64188c3f65188c3f66188c3f67188c3f68188c3f69188c3f6a188c3f6b188c3f6c188c3f6d188c3f6e188c3f6f188c3f70188c3f71188c3f72188c3f731c8c3f741c8c3f751c8c3f761c8c3f771c8c3f781c8c3f791c8c3f7a1c8c3f7b1c8c3f7c1c8c3f7d1c8c3f7e188c3f7f"+
    "198c3f80198c3f81198c3f82198c3f83198c3f84198c3f85198c3f86198c3f87198c3f88198c3f89198c3f8a198c3f8b188c3f8c188c3f8d188c3f8e188c3f8f188c3f90188c3f93188c3f94188c3f96188c3f98188c3f99188c3fa0188c3fa2188c3fa5188c3fa6188c3fa7188c3fa8188c3fa9188c3faa188c3fac188c3fad188c3fae188c3faf188c3fb0188c3fb1188c3fb2188c3fb3188c3fb4188c3fb5188d3f4a188d3f4b188d3f4c188d3f4d188d3f4f188d3f50188d3f51188d3f52188d3f53188d3f54"+
    "188d3f55188d3f56188d3f57188d3f5b188d3f5c188d3f5d188d3f5f188d3f60188d3f61188d3f62188d3f63188d3f64188d3f65188d3f66188d3f67188d3f68188d3f69188d3f6a188d3f6b188d3f6c188d3f6d188d3f6e188d3f6f188d3f70188d3f71188d3f721c8d3f731c8d3f741c8d3f751c8d3f761c8d3f771c8d3f781c8d3f791c8d3f7a1c8d3f7b1c8d3f7c1c8d3f7d188d3f7e198d3f7f198d3f80198d3f81198d3f82198d3f83198d3f84198d3f85198d3f86198d3f87198d3f88198d3f89188d3f8a"+
    "188d3f8b188d3f8d188d3f8e188d3f8f188d3f90188d3f92188d3f93188d3f94188d3f95188d3f96188d3f98188d3f9a188d3f9b188d3f9c188d3fa0188d3fa2188d3fa6188d3fa7188d3fa9188d3faa188d3fab188d3fac188d3fad188d3fae188d3faf188d3fb0188d3fb1188d3fb2188d3fb3188d3fb4188d3fb6188e3f4a188e3f4b188e3f4c188e3f4d188e3f4e188e3f50188e3f51188e3f53188e3f54188e3f55188e3f59188e3f5b188e3f5c188e3f5e188e3f5f188e3f60188e3f61188e3f62188e3f63"+
    "188e3f64188e3f65188e3f66188e3f67188e3f68188e3f69188e3f6a188e3f6b188e3f6c188e3f6d188e3f6e188e3f6f188e3f70188e3f711c8e3f721c8e3f731c8e3f741c8e3f751c8e3f761c8e3f771c8e3f781c8e3f791c8e3f7a1c8e3f7b1c8e3f7c188e3f7d198e3f7e198e3f7f198e3f80368e3f81198e3f82198e3f83198e3f84198e3f85198e3f86198e3f87188e3f88188e3f89188e3f8a188e3f8b188e3f8d188e3f8e188e3f90188e3f91188e3f93188e3f97188e3f9b188e3f9f188e3fa3188e3fa4"+
    "188e3fa5188e3fa6188e3fa7188e3fa8188e3fa9188e3fab188e3fac188e3fad188e3fae188e3faf188e3fb0188e3fb2188e3fb4188e3fb5188e3fb6188f3f4a188f3f4b188f3f4d188f3f4e188f3f4f188f3f51188f3f52188f3f54188f3f55188f3f57188f3f58188f3f59188f3f5b188f3f5c188f3f5d188f3f5e188f3f5f188f3f60188f3f61188f3f62188f3f63188f3f64188f3f65188f3f66188f3f67188f3f68188f3f69188f3f6a188f3f6b188f3f6c188f3f6d188f3f6e188f3f6f188f3f701c8f3f71"+
    "1c8f3f721c8f3f731c8f3f741c8f3f751c8f3f761c8f3f771c8f3f781c8f3f791c8f3f7a1c8f3f7b1c8f3f7c188f3f7d198f3f7e198f3f7f198f3f80198f3f81198f3f82198f3f83198f3f84188f3f86188f3f87188f3f88188f3f89188f3f8a188f3f8b188f3f8c188f3f8e188f3f8f188f3f90188f3f92188f3f93188f3f95188f3f97188f3f99188f3f9a188f3f9c188f3f9d188f3fa0188f3fa1188f3fa3188f3fa4188f3fa7188f3fa8188f3faa188f3fab188f3fac188f3fad188f3fae188f3faf188f3fb0"+
    "188f3fb1188f3fb2188f3fb5188f3fb618903f4c18903f4e18903f5118903f5418903f5518903f5818903f5918903f5a18903f5c18903f5d18903f5e18903f5f18903f6018903f6118903f6218903f6318903f6418903f6518903f6618903f6718903f6818903f6918903f6a18903f6b18903f6c18903f6d18903f6e18903f6f1c903f701c903f711c903f721c903f731c903f741c903f751c903f761c903f771c903f781c903f791c903f7a1c903f7b18903f7c19903f7d19903f7e19903f7f19903f8019903f81"+
    "19903f8218903f8318903f8518903f8718903f8818903f8918903f8a18903f8b18903f8e18903f8f18903f9018903f9118903f9218903f9418903f9718903f9b18903f9c18903f9f18903fa018903fa218903fa518903fa718903fa818903fa918903faa18903fab18903fae18903faf18903fb018903fb118903fb218903fb518913f4e18913f5218913f5418913f5618913f5718913f5818913f5918913f5a18913f5b18913f5c18913f5d18913f5e18913f5f18913f6018913f6118913f6218913f6318913f64"+
    "18913f6518913f6618913f6718913f6818913f6918913f6a18913f6b18913f6c18913f6d18913f6e1c913f6f1c913f701c913f711c913f721c913f731c913f741c913f751c913f761c913f771c913f781c913f791c913f7a1c913f7b19913f7c19913f7d36913f7e19913f7f19913f8019913f8118913f8218913f8318913f8418913f8518913f8618913f8718913f8918913f8b18913f8c18913f8d18913f8e18913f8f18913f9018913f9118913f9418913f9518913f9818913f9918913f9d18913fa018913fa2"+
    "18913fa318913fa418913fa518913fa618913fa718913fa818913fa918913fab18913fac18913fb018913fb118923f4c18923f4e18923f5018923f5118923f5418923f5518923f5618923f5718923f5818923f5918923f5a18923f5b18923f5c18923f5e18923f5f18923f6018923f6118923f6218923f6318923f6418923f6518923f6618923f6718923f6818923f6918923f6a18923f6b18923f6c18923f6d1c923f6e1c923f6f1c923f701c923f711c923f721c923f731c923f741c923f751c923f761c923f77"+
    "1c923f781c923f791c923f7a19923f7b19923f7c19923f7d19923f7e19923f7f18923f8018923f8218923f8318923f8418923f8618923f8718923f8818923f8918923f8a18923f8b18923f8c18923f8d18923f8f18923f9018923f9218923f9318923f9518923f9d18923f9e18923f9f18923fa018923fa218923fa418923fa518923fa618923fa718923fa818923fa918923faa18923fab18923fac18923fae18933f4e18933f5018933f5318933f5618933f5718933f5818933f5918933f5a18933f5c18933f5d"+
    "18933f5e18933f5f18933f6018933f6118933f6218933f6318933f6418933f6518933f6618933f6718933f6818933f6918933f6a18933f6b18933f6c1c933f6d1c933f6e1c933f6f1c933f701c933f711c933f721c933f731c933f741c933f751c933f761c933f771c933f781c933f791c933f7a19933f7b19933f7c19933f7d18933f7e18933f8018933f8118933f8218933f8418933f8518933f8618933f8718933f8818933f8a18933f8b18933f8c18933f8e18933f8f18933f9018933f9118933f9218933f97"+
    "18933f9a18933f9b18933f9c18933f9e18933f9f18933fa318933fa418933fa518933fa618933fa718933fa818933fa918933faa18933fab18943f5118943f5218943f5518943f5618943f5718943f5818943f5918943f5a18943f5b18943f5c18943f5d18943f5e18943f5f18943f6018943f6118943f6218943f6318943f6418943f6518943f6618943f6718943f6818943f6918943f6a18943f6b1c943f6c1c943f6d1c943f6e1c943f6f1c943f701c943f711c943f721c943f731c943f741c943f751c943f76"+
    "1c943f771c943f7818943f7919943f7a19943f7b18943f7c18943f7d18943f7e18943f8018943f8118943f8418943f8518943f8818943f8918943f8a18943f8b18943f8d18943f8e18943f8f18943f9018943f9218943f9418943f9618943f9718943f9818943f9918943f9a18943f9c18943f9d18943fa318943fa418943fa718943fa818943faa18943fab18943fad18953f5018953f5518953f5718953f5a18953f5b18953f5c18953f5d18953f5e18953f5f18953f6018953f6118953f6218953f6318953f64"+
    "18953f6518953f6618953f6718953f6818953f6918953f6a1c953f6b1c953f6c1c953f6d1c953f6e1c953f6f1c953f701c953f711c953f7218953f7318953f741c953f751c953f761c953f7718953f7818953f7918953f7a18953f7b18953f7c18953f7d18953f7e18953f7f18953f8018953f8118953f8518953f8618953f8918953f8a18953f8b18953f8c18953f8e18953f8f18953f9018953f9418953f9518953f9618953f9718953f9918953f9b18953f9d18953fa118953fa218953fa618953fa818953fa9"+
    "18953faa18953fac18963f5318963f5418963f5518963f5718963f5818963f5918963f5a18963f5b18963f5c18963f5d18963f5e18963f5f18963f6018963f6118963f6218963f6318963f6418963f6518963f6618963f6718963f6818963f691c963f6a1c963f6b1c963f6c1c963f6d1c963f6e1c963f6f1c963f7018963f7119963f7219963f7318963f7418963f7518963f7618963f7718963f7818963f7918963f7a18963f7b18963f7c18963f7e18963f8018963f8118963f8318963f8518963f8618963f87"+
    "18963f8818963f8918963f8a18963f8b18963f8d18963f8f18963f9018963f9218963f9418963f9518963f9718963f9818963f9a18963f9b18963f9c18963f9e18963fa018973f5118973f5318973f5618973f5718973f5918973f5a18973f5b18973f5c18973f5d18973f5e18973f5f18973f6018973f6118973f6218973f6318973f6418973f6518973f6618973f6718973f681c973f691c973f6a1c973f6b1c973f6c1c973f6d1c973f6e1c973f6f18973f7019973f7119973f7219973f7319973f7419973f75"+
    "19973f7618973f7718973f7818973f7918973f7a18973f7b18973f7c18973f7d18973f7e18973f8418973f8518973f8618973f8718973f8818973f8918973f8a18973f8b18973f8c18973f8d18973f8e18973f9018973f9118973f9218973f9318973f9518973f9618973f9a18973f9b18973f9c18973f9d18973f9e18973fa118983f5018983f5118983f5318983f5418983f5518983f5618983f5718983f5818983f5918983f5a18983f5b18983f5c18983f5d18983f5e18983f5f18983f6018983f6118983f62"+
    "18983f6318983f6418983f6518983f6618983f671c983f681c983f691c983f6a1c983f6b1c983f6c1c983f6d1c983f6e19983f6f19983f7019983f7119983f7219983f7319983f7419983f7518983f7618983f7718983f7818983f7918983f7a18983f7b18983f7c18983f7d18983f7e18983f8118983f8218983f8318983f8418983f8518983f8618983f8718983f8818983f8918983f8a18983f8c18983f8d18983f8f18983f9018983f9118983f9218983f9318983f9418983f9518983f9618983f9a18983f9c"+
    "18983f9d18993f5018993f5118993f5218993f5418993f5518993f5618993f5718993f5818993f5918993f5a18993f5b18993f5c18993f5d18993f5e18993f5f18993f6018993f6118993f6218993f6318993f6418993f6518993f661c993f671c993f681c993f691c993f6a1c993f6b1c993f6c19993f6d19993f6e19993f6f19993f7019993f7119993f7219993f7319993f7419993f7518993f7618993f7718993f7818993f7918993f7a18993f7b18993f7c18993f7d18993f7e18993f7f18993f8018993f81"+
    "18993f8218993f8318993f8418993f8518993f8618993f8718993f8818993f8918993f8a18993f8c18993f8d18993f8e18993f8f18993f9118993f9318993f9418993f9518993f9618993f9718993f9818993f9918993f9b18993f9c18993f9d18993f9e189a3f4d189a3f50189a3f51189a3f52189a3f53189a3f54189a3f55189a3f56189a3f57189a3f58189a3f59189a3f5a189a3f5b189a3f5c189a3f5d189a3f5e189a3f5f189a3f60189a3f61189a3f62189a3f63189a3f64189a3f651c9a3f661c9a3f67"+
    "1c9a3f681c9a3f691c9a3f6a1c9a3f6b199a3f6c199a3f6d199a3f6e199a3f6f199a3f70369a3f71199a3f72199a3f73199a3f74199a3f75189a3f76189a3f77189a3f78189a3f79189a3f7a189a3f7b189a3f7c189a3f7d189a3f7e189a3f7f189a3f80189a3f81189a3f82189a3f83189a3f84189a3f85189a3f86189a3f87189a3f88189a3f89189a3f8a189a3f8b189a3f8c189a3f8d189a3f8e189a3f8f189a3f90189a3f92189a3f95189a3f96189a3f98189a3f99189a3f9a189a3f9c189b3f4b189b3f4d"+
    "189b3f4e189b3f4f189b3f50189b3f51189b3f52189b3f53189b3f54189b3f55189b3f56189b3f57189b3f58189b3f59189b3f5a189b3f5b189b3f5c189b3f5d189b3f5e189b3f5f189b3f60189b3f61189b3f62189b3f63189b3f641c9b3f651c9b3f661c9b3f671c9b3f68189b3f69199b3f6a199b3f6b199b3f6c199b3f6d199b3f6e199b3f6f199b3f70199b3f71199b3f72199b3f73189b3f74189b3f75189b3f76189b3f77189b3f78189b3f79189b3f7a189b3f7b189b3f7c189b3f7d189b3f7e189b3f7f"+
    "189b3f80189b3f81189b3f82189b3f83189b3f84189b3f85189b3f86189b3f87189b3f88189b3f89189b3f8a189b3f8b189b3f8c189b3f8d189b3f8e189b3f8f189b3f90189b3f91189b3f92189b3f93189b3f94189b3f95189b3f96189b3f97189b3f98189b3f9a189b3f9b189c3f4d189c3f4e189c3f4f189c3f50189c3f51189c3f52189c3f53189c3f54189c3f55189c3f56189c3f57189c3f58189c3f59189c3f5a189c3f5b189c3f5c189c3f5d189c3f5e189c3f5f189c3f60189c3f61189c3f62189c3f63"+
    "1c9c3f641c9c3f651c9c3f661c9c3f67189c3f68199c3f69199c3f6a199c3f6b199c3f6c199c3f6d199c3f6e199c3f6f199c3f70199c3f71189c3f72189c3f73189c3f74189c3f75189c3f76189c3f77189c3f78189c3f79189c3f7a189c3f7b189c3f7c189c3f7d189c3f7e189c3f7f189c3f80189c3f81189c3f82189c3f83189c3f84189c3f85189c3f86189c3f87189c3f88189c3f89189c3f8a189c3f8b189c3f8c189c3f8d189c3f8e189c3f8f189c3f90189c3f91189c3f92189c3f93189c3f94189c3f96"+
    "189c3f97189c3f98189c3f99189c3f9a189c3fab189c3fac189d3f4b189d3f4e189d3f4f189d3f50189d3f51189d3f52189d3f53189d3f54189d3f55189d3f56189d3f57189d3f58189d3f59189d3f5a189d3f5b189d3f5c189d3f5d189d3f5e189d3f5f189d3f60189d3f61189d3f621c9d3f631c9d3f641c9d3f651c9d3f66189d3f67199d3f68199d3f69369d3f6a199d3f6b199d3f6c199d3f6d199d3f6e199d3f6f189d3f70189d3f71189d3f72189d3f73189d3f74189d3f75189d3f76189d3f77189d3f78"+
    "189d3f79189d3f7a189d3f7b189d3f7c189d3f7d189d3f7e189d3f7f189d3f80189d3f81189d3f82189d3f83189d3f84189d3f85189d3f86189d3f87189d3f88189d3f89189d3f8a189d3f8b189d3f8c189d3f8d189d3f8e189d3f8f189d3f90189d3f91189d3f93189d3f94189d3f95189d3f97189d3f98189d3f99189d3fab189d3fac189e3f4a189e3f4b189e3f4c189e3f4d189e3f4e189e3f4f189e3f50189e3f51189e3f52189e3f53189e3f54189e3f55189e3f56189e3f57189e3f58189e3f59189e3f5a"+
    "189e3f5b189e3f5c189e3f5d189e3f5e189e3f5f189e3f60189e3f611c9e3f621c9e3f631c9e3f64189e3f65199e3f66199e3f67199e3f68199e3f69199e3f6a199e3f6b199e3f6c189e3f6d189e3f6e189e3f6f189e3f70189e3f71189e3f72189e3f73189e3f74189e3f75189e3f76189e3f77189e3f78189e3f79189e3f7a189e3f7b189e3f7c189e3f7d189e3f7e189e3f7f189e3f80189e3f81189e3f82189e3f83189e3f84189e3f85189e3f86189e3f87189e3f88189e3f89189e3f8a189e3f8b189e3f8c"+
    "189e3f8d189e3f8e189e3f8f189e3f92189e3f94189e3f95189e3f96189e3f97189e3fa9189e3faa189e3fab189e3fae189e3fb1189e3fb4189e3fb5189e3fb6189f3f4b189f3f4c189f3f4d189f3f4e189f3f4f189f3f50189f3f51189f3f52189f3f53189f3f54189f3f55189f3f56189f3f57189f3f58189f3f59189f3f5a189f3f5b189f3f5c189f3f5d189f3f5e189f3f5f189f3f601c9f3f611c9f3f621c9f3f63189f3f64199f3f65199f3f66199f3f67199f3f68199f3f69199f3f6a189f3f6b189f3f6c"+
    "189f3f6d189f3f6e189f3f6f189f3f70189f3f71189f3f72189f3f73189f3f74189f3f75189f3f76189f3f77189f3f78189f3f79189f3f7a189f3f7b189f3f7c189f3f7d189f3f7e189f3f7f189f3f80189f3f81189f3f82189f3f83189f3f84189f3f85189f3f86189f3f87189f3f88189f3f89189f3f8a189f3f8b189f3f8c189f3f8d189f3f8e189f3f90189f3f91189f3f93189f3f95189f3fa9189f3fab189f3fad189f3fae189f3faf189f3fb1189f3fb2189f3fb3189f3fb4189f3fb518a03f4a18a03f4b"+
    "18a03f4c18a03f4d18a03f4e18a03f4f18a03f5018a03f5118a03f5218a03f5318a03f5418a03f5518a03f5618a03f5718a03f5818a03f5918a03f5a18a03f5b18a03f5c18a03f5d18a03f5e18a03f5f1ca03f601ca03f6118a03f6218a03f6318a03f6419a03f6519a03f6619a03f6719a03f6818a03f6918a03f6a18a03f6b18a03f6c18a03f6d18a03f6e18a03f6f18a03f7018a03f7118a03f7218a03f7318a03f7418a03f7518a03f7618a03f7718a03f7818a03f7918a03f7a18a03f7b18a03f7c18a03f7d"+
    "18a03f7e18a03f7f18a03f8018a03f8118a03f8218a03f8318a03f8418a03f8518a03f8618a03f8718a03f8818a03f8918a03f8a18a03f8b18a03f8c18a03f8e18a03f8f18a03f9318a03f9418a03f9718a03fa918a03faa18a03fab18a03fac18a03fad18a03fae18a03fb018a03fb118a03fb218a03fb418a03fb618a13f4a18a13f4b18a13f4c18a13f4d18a13f4e18a13f4f18a13f5018a13f5118a13f5218a13f5318a13f5418a13f5518a13f5618a13f5718a13f5818a13f5918a13f5a18a13f5b18a13f5c"+
    "18a13f5d18a13f5e1ca13f5f1ca13f6018a13f6118a13f6218a13f6318a13f6419a13f6519a13f6618a13f6718a13f6818a13f6918a13f6a18a13f6b18a13f6c18a13f6d18a13f6e18a13f6f18a13f7018a13f7118a13f7218a13f7318a13f7418a13f7518a13f7618a13f7718a13f7818a13f7918a13f7a18a13f7b18a13f7c18a13f7d18a13f7e18a13f7f18a13f8018a13f8118a13f8218a13f8318a13f8418a13f8518a13f8618a13f8718a13f8818a13f8918a13f8a18a13f8b18a13f8c18a13f8d18a13f8e"+
    "18a13f8f18a13fa818a13faa18a13fab18a13fad18a13fae18a13faf18a13fb018a13fb118a13fb218a13fb318a13fb418a13fb518a13fb618a23f4a18a23f4b18a23f4c18a23f4d18a23f4e18a23f4f18a23f5018a23f5118a23f5218a23f5318a23f5418a23f5518a23f5618a23f5718a23f5818a23f5918a23f5a18a23f5b18a23f5c18a23f5d1ca23f5e1ca23f5f18a23f6018a23f6118a23f6218a23f6318a23f6418a23f6518a23f6618a23f6718a23f6818a23f6918a23f6a18a23f6b18a23f6c18a23f6d"+
    "18a23f6e18a23f6f18a23f7018a23f7118a23f7218a23f7318a23f7418a23f7518a23f7618a23f7718a23f7818a23f7918a23f7a18a23f7b18a23f7c18a23f7d18a23f7e18a23f7f18a23f8018a23f8118a23f8218a23f8318a23f8418a23f8518a23f8618a23f8718a23f8818a23f8918a23f8a18a23f8c18a23f8d18a23f8e18a23f8f18a23f9118a23f9218a23f9418a23f9518a23f9718a23f9818a23fa518a23fa618a23fa718a23fa818a23fa918a23faa18a23fab18a23fad18a23fae18a23faf18a23fb0"+
    "18a23fb118a23fb218a23fb318a23fb418a23fb518a23fb618a33f4a18a33f4b18a33f4c18a33f4d18a33f4e18a33f4f18a33f5018a33f5118a33f5218a33f5318a33f5418a33f5518a33f5618a33f5718a33f5818a33f591ca33f5a1ca33f5b18a33f5c1ca33f5d1ca33f5e18a33f5f18a33f6018a33f6118a33f6218a33f6318a33f6418a33f6518a33f6618a33f6718a33f6818a33f6918a33f6a18a33f6b18a33f6c18a33f6d18a33f6e18a33f6f18a33f7018a33f7118a33f7218a33f7318a33f7418a33f75"+
    "18a33f7618a33f7718a33f7818a33f7918a33f7a18a33f7b18a33f7c18a33f7d18a33f7e18a33f7f18a33f8018a33f8118a33f8218a33f8318a33f8418a33f8518a33f8618a33f8718a33f8818a33f8918a33f8b18a33f8c18a33f8e18a33f8f18a33f9018a33f9118a33f9218a33f9318a33f9418a33f9518a33f9618a33fa418a33fa718a33fa918a33fab18a33fac18a33fae18a33faf18a33fb018a33fb118a33fb218a33fb318a33fb418a33fb518a33fb618a43f4a18a43f4b18a43f4c18a43f4d18a43f4e"+
    "18a43f4f18a43f5018a43f5118a43f5218a43f5318a43f5418a43f5518a43f5618a43f571ca43f581ca43f591ca43f5a1ca43f5b18a43f5c1ca43f5d18a43f5e18a43f5f18a43f6018a43f6118a43f6218a43f6318a43f6418a43f6518a43f6618a43f6718a43f6818a43f6918a43f6a18a43f6b18a43f6c18a43f6d18a43f6e18a43f6f18a43f7018a43f7118a43f7218a43f7318a43f7418a43f7518a43f7618a43f7718a43f7818a43f7918a43f7a18a43f7b18a43f7c18a43f7d18a43f7e18a43f7f18a43f80"+
    "18a43f8118a43f8218a43f8318a43f8418a43f8518a43f8618a43f8718a43f8818a43f8918a43f8a18a43f8c18a43f8d18a43f8f18a43f9118a43f9218a43f9318a43f9518a43f9618a43f9718a43fa418a43fa518a43fa618a43fa718a43fa818a43fa918a43fab18a43fac18a43fae18a43faf18a43fb018a43fb118a43fb218a43fb318a43fb418a43fb518a43fb618a53f4a18a53f4b18a53f4c18a53f4d18a53f4e18a53f4f18a53f5018a53f5118a53f5218a53f5318a53f5418a53f551ca53f561ca53f57"+
    "1ca53f581ca53f591ca53f5a18a53f5b18a53f5c18a53f5d18a53f5e18a53f5f18a53f6018a53f6118a53f6218a53f6318a53f6418a53f6518a53f6618a53f6718a53f6818a53f6918a53f6a18a53f6b18a53f6c18a53f6d18a53f6e18a53f6f18a53f7018a53f7118a53f7218a53f7318a53f7418a53f7518a53f7618a53f7718a53f7818a53f7918a53f7a18a53f7b18a53f7c18a53f7d18a53f7e18a53f7f18a53f8018a53f8118a53f8218a53f8318a53f8418a53f8518a53f8618a53f8718a53f8818a53f89"+
    "18a53f8a18a53f8b18a53f8c18a53f8d18a53f8e18a53f8f18a53f9018a53f9118a53f9218a53f9318a53f9418a53f9518a53f9618a53fa318a53fa418a53fa518a53fa618a53fa718a53fa818a53fa918a53fab18a53fac18a53fad18a53fae18a53faf18a53fb018a53fb118a53fb218a53fb318a53fb418a53fb518a53fb618a63f4a18a63f4b18a63f4c18a63f4d18a63f4e18a63f4f18a63f5018a63f5118a63f521ca63f531ca63f541ca63f551ca63f561ca63f571ca63f581ca63f5918a63f5a18a63f5b"+
    "18a63f5c18a63f5d18a63f5e18a63f5f18a63f6018a63f6118a63f6218a63f6318a63f6418a63f6518a63f6618a63f6718a63f6818a63f6918a63f6a18a63f6b18a63f6c18a63f6d18a63f6e18a63f6f18a63f7018a63f7118a63f7218a63f7318a63f7418a63f7518a63f7618a63f7718a63f7818a63f7918a63f7a18a63f7b18a63f7c18a63f7d18a63f7e18a63f7f18a63f8018a63f8118a63f8218a63f8318a63f8418a63f8618a63f8718a63f8d18a63f8e18a63f8f18a63f9018a63f9118a63f9318a63f94"+
    "18a63f9518a63fa118a63fa218a63fa418a63fa518a63fa718a63fa818a63fa918a63faa18a63fab18a63fac18a63fad18a63fae18a63faf18a63fb018a63fb118a63fb218a63fb318a63fb418a63fb518a63fb618a73f4a18a73f4b18a73f4c18a73f4d18a73f4e18a73f4f18a73f5018a73f511ca73f521ca73f531ca73f541ca73f551ca73f561ca73f571ca73f5818a73f5918a73f5a18a73f5b18a73f5c18a73f5d18a73f5e18a73f5f18a73f6018a73f6118a73f6218a73f6318a73f6418a73f6518a73f66"+
    "18a73f6718a73f6818a73f6918a73f6a18a73f6b18a73f6c18a73f6d18a73f6e18a73f6f18a73f7018a73f7118a73f7218a73f7318a73f7418a73f7518a73f7618a73f7718a73f7818a73f7918a73f7a18a73f7b18a73f7c18a73f7d18a73f7e18a73f7f18a73f8018a73f8118a73f8218a73f8418a73f8518a73f8618a73f8718a73f8818a73f8918a73f8a18a73f8b18a73f8c18a73f8d18a73f8e18a73f8f18a73f9018a73f9218a73f9318a73f9418a73fa018a73fa118a73fa327a73fa627a73fa727a73fa8"+
    "18a73fa918a73faa18a73fab18a73fac18a73fad18a73fae18a73faf18a73fb018a73fb118a73fb218a73fb318a73fb418a73fb518a73fb618a83f4a18a83f4b18a83f4c18a83f4d18a83f4e18a83f4f1ca83f501ca83f511ca83f521ca83f531ca83f541ca83f551ca83f561ca83f5718a83f5818a83f5918a83f5a18a83f5b18a83f5c18a83f5d18a83f5e18a83f5f18a83f6018a83f6118a83f6218a83f6318a83f6418a83f6518a83f6618a83f6718a83f6818a83f6918a83f6a18a83f6b18a83f6c18a83f6d"+
    "18a83f6e18a83f6f18a83f7018a83f7118a83f7218a83f7318a83f7418a83f7518a83f7618a83f7718a83f7818a83f7918a83f7a18a83f7b18a83f7c18a83f7d18a83f7e18a83f7f18a83f8018a83f8118a83f8218a83f8318a83f8418a83f8618a83f8718a83f8818a83f8918a83f8a18a83f8b18a83f8c18a83f8e18a83f8f18a83f9018a83f9118a83f9218a83f9318a83f9418a83f9618a83f9718a83f9818a83f9e18a83fa018a83fa118a83fa218a83fa318a83fa418a83fa518a83fa718a83fa818a83fa9"+
    "18a83faa18a83fab18a83fac18a83fad18a83fae18a83faf18a83fb018a83fb118a83fb218a83fb327a83fb427a83fb527a83fb618a93f4a18a93f4b18a93f4c18a93f4d18a93f4e1ca93f4f1ca93f501ca93f511ca93f521ca93f531ca93f541ca93f551ca93f5618a93f5718a93f5818a93f5918a93f5a18a93f5b18a93f5c18a93f5d18a93f5e18a93f5f18a93f6018a93f6118a93f6218a93f6318a93f6418a93f6518a93f6618a93f6718a93f6818a93f6918a93f6a18a93f6b18a93f6c18a93f6d18a93f6e"+
    "18a93f6f18a93f7018a93f7118a93f7218a93f7318a93f7418a93f7518a93f7618a93f7718a93f7818a93f7918a93f7a18a93f7b18a93f7c18a93f7d18a93f7e18a93f7f18a93f8018a93f8118a93f8218a93f8418a93f8618a93f8818a93f8918a93f8a18a93f8c18a93f8d18a93f8e18a93f8f18a93f9018a93f9118a93f9218a93f9318a93f9418a93f9518a93f9618a93f9718a93f9918a93f9c18a93f9d18a93f9e18a93f9f18a93fa018a93fa118a93fa427a93fa518a93fa618a93fa718a93fa818a93fa9"+
    "18a93faa18a93fab18a93fac18a93fad18a93fae18a93faf18a93fb018a93fb118a93fb218a93fb318a93fb418a93fb518a93fb618aa3f4a18aa3f4b18aa3f4c18aa3f4d1caa3f4e1caa3f4f1caa3f501caa3f511caa3f521caa3f531caa3f541caa3f5518aa3f5618aa3f5718aa3f5818aa3f5918aa3f5a18aa3f5b18aa3f5c18aa3f5d18aa3f5e18aa3f5f18aa3f6018aa3f6118aa3f6218aa3f6318aa3f6418aa3f6518aa3f6618aa3f6718aa3f6818aa3f6918aa3f6a18aa3f6b18aa3f6c18aa3f6d18aa3f6e"+
    "18aa3f6f18aa3f7018aa3f7118aa3f7218aa3f7318aa3f7418aa3f7518aa3f7618aa3f7718aa3f7818aa3f7918aa3f7a18aa3f7b18aa3f7c18aa3f7d18aa3f7e18aa3f7f18aa3f8118aa3f8218aa3f8318aa3f8418aa3f8518aa3f8618aa3f8718aa3f8918aa3f8b18aa3f8c18aa3f8d18aa3f8e18aa3f8f18aa3f9018aa3f9118aa3f9218aa3f9318aa3f9418aa3f9518aa3f9618aa3f9c18aa3f9e18aa3f9f18aa3fa018aa3fa218aa3fa418aa3fa518aa3fa618aa3fa718aa3fa818aa3fa918aa3faa18aa3fab"+
    "18aa3fac18aa3fad18aa3fae18aa3faf18aa3fb018aa3fb118aa3fb227aa3fb318aa3fb418aa3fb518aa3fb618ab3f4a18ab3f4b18ab3f4c1cab3f4d1cab3f4e1cab3f4f1cab3f501cab3f511cab3f521cab3f531cab3f5418ab3f5518ab3f5618ab3f5718ab3f5818ab3f5918ab3f5a18ab3f5b18ab3f5c18ab3f5d18ab3f5e18ab3f5f18ab3f6018ab3f6118ab3f6218ab3f6318ab3f6418ab3f6518ab3f6618ab3f6718ab3f6818ab3f6918ab3f6a18ab3f6b18ab3f6c18ab3f6d18ab3f6e18ab3f6f18ab3f70"+
    "18ab3f7118ab3f7218ab3f7318ab3f7418ab3f7518ab3f7618ab3f7718ab3f7818ab3f7918ab3f7a18ab3f7b18ab3f7c18ab3f7d18ab3f8018ab3f8118ab3f8218ab3f8418ab3f8518ab3f8618ab3f8718ab3f8818ab3f8918ab3f8a18ab3f8b18ab3f8c18ab3f8d18ab3f8e18ab3f8f18ab3f9018ab3f9118ab3f9218ab3f9318ab3f9418ab3f9518ab3f9618ab3f9718ab3f9c18ab3f9e18ab3f9f18ab3fa018ab3fa218ab3fa318ab3fa418ab3fa518ab3fa618ab3fa718ab3fa818ab3fa918ab3faa18ab3fab"+
    "18ab3fac18ab3fad18ab3fae18ab3faf18ab3fb018ab3fb118ab3fb218ab3fb318ab3fb418ab3fb518ab3fb618ac3f4a18ac3f4b18ac3f4c1cac3f4d1cac3f4e1cac3f4f1cac3f501cac3f511cac3f521cac3f5318ac3f5418ac3f5518ac3f5618ac3f5718ac3f5818ac3f5918ac3f5a18ac3f5b18ac3f5c18ac3f5d18ac3f5e18ac3f5f18ac3f6018ac3f6118ac3f6218ac3f6318ac3f6418ac3f6518ac3f6618ac3f6718ac3f6818ac3f6918ac3f6a18ac3f6b18ac3f6c18ac3f6d18ac3f6e18ac3f6f18ac3f70"+
    "18ac3f7118ac3f7218ac3f7318ac3f7418ac3f7518ac3f7618ac3f7718ac3f7818ac3f7918ac3f7a18ac3f7b18ac3f7c18ac3f7d18ac3f7e18ac3f7f18ac3f8118ac3f8218ac3f8318ac3f8418ac3f8518ac3f8618ac3f8718ac3f8818ac3f8918ac3f8a18ac3f8b18ac3f8c18ac3f8d18ac3f8e18ac3f8f18ac3f9018ac3f9118ac3f9218ac3f9318ac3f9418ac3f9518ac3f9618ac3f9718ac3f9818ac3f9918ac3f9a18ac3f9b18ac3f9c18ac3f9e18ac3f9f18ac3fa018ac3fa118ac3fa218ac3fa318ac3fa4"+
    "18ac3fa518ac3fa618ac3fa718ac3fa818ac3fa918ac3faa18ac3fab18ac3fac18ac3fad18ac3fae18ac3faf18ac3fb018ac3fb118ac3fb218ac3fb318ac3fb418ac3fb518ac3fb618ad3f4a1cad3f4b1cad3f4c1cad3f4d1cad3f4e1cad3f4f1cad3f501cad3f511cad3f5218ad3f5318ad3f5418ad3f5518ad3f5618ad3f5718ad3f5818ad3f5918ad3f5a18ad3f5b18ad3f5c18ad3f5d18ad3f5e18ad3f5f18ad3f6018ad3f6118ad3f6218ad3f6318ad3f6418ad3f6518ad3f6618ad3f6718ad3f6818ad3f69"+
    "18ad3f6a18ad3f6b18ad3f6c18ad3f6d18ad3f6e18ad3f6f18ad3f7018ad3f7118ad3f7218ad3f7318ad3f7418ad3f7518ad3f7618ad3f7718ad3f7818ad3f7918ad3f7a18ad3f7c18ad3f7d18ad3f7e18ad3f7f18ad3f8018ad3f8118ad3f8418ad3f8518ad3f8618ad3f8718ad3f8818ad3f8918ad3f8a18ad3f8b18ad3f8c18ad3f8d18ad3f8e18ad3f8f18ad3f9018ad3f9118ad3f9218ad3f9318ad3f9418ad3f9518ad3f9618ad3f9718ad3f9818ad3f9918ad3f9a18ad3f9b18ad3f9c18ad3f9d18ad3f9e"+
    "18ad3f9f18ad3fa018ad3fa118ad3fa218ad3fa318ad3fa418ad3fa518ad3fa618ad3fa71cad3fa818ad3fa918ad3faa18ad3fab18ad3fac18ad3fad18ad3fae18ad3faf18ad3fb018ad3fb118ad3fb218ad3fb318ad3fb418ad3fb518ad3fb618ae3f4a1cae3f4b1cae3f4c1cae3f4d1cae3f4e1cae3f4f1cae3f501cae3f5118ae3f5218ae3f5318ae3f5418ae3f5518ae3f5618ae3f5718ae3f5818ae3f5918ae3f5a18ae3f5b18ae3f5c18ae3f5d18ae3f5e18ae3f5f18ae3f6018ae3f6118ae3f6218ae3f63"+
    "18ae3f6418ae3f6518ae3f6618ae3f6718ae3f6818ae3f6918ae3f6a18ae3f6b18ae3f6c18ae3f6d18ae3f6e18ae3f6f18ae3f7018ae3f7118ae3f7218ae3f7318ae3f7418ae3f7518ae3f7618ae3f7718ae3f7818ae3f7918ae3f7a18ae3f7b18ae3f7c18ae3f7d18ae3f7e18ae3f7f18ae3f8018ae3f8218ae3f8318ae3f8418ae3f8518ae3f8618ae3f8718ae3f8818ae3f8918ae3f8a18ae3f8b18ae3f8c18ae3f8d18ae3f8e18ae3f8f18ae3f9018ae3f9118ae3f9218ae3f9318ae3f9418ae3f9518ae3f96"+
    "18ae3f9718ae3f9818ae3f9918ae3f9a18ae3f9b18ae3f9c18ae3f9d18ae3f9e18ae3f9f18ae3fa018ae3fa118ae3fa218ae3fa318ae3fa418ae3fa51cae3fa61cae3fa718ae3fa818ae3fa918ae3faa18ae3fab18ae3fac18ae3fad18ae3fae18ae3faf18ae3fb018ae3fb118ae3fb218ae3fb318ae3fb418ae3fb518ae3fb61caf3f4a1caf3f4b1caf3f4c1caf3f4d1caf3f4e1caf3f4f1caf3f5018af3f5118af3f5218af3f5318af3f5418af3f5518af3f5618af3f5718af3f5818af3f5918af3f5a18af3f5b"+
    "18af3f5c18af3f5d18af3f5e18af3f5f18af3f6018af3f6118af3f6218af3f6318af3f6418af3f6518af3f6618af3f6718af3f6818af3f6918af3f6a18af3f6b18af3f6c18af3f6d18af3f6e18af3f6f18af3f7018af3f7118af3f7218af3f7318af3f7418af3f7618af3f7718af3f7918af3f7a18af3f7b18af3f7c18af3f7d18af3f7e18af3f8018af3f8118af3f8218af3f8318af3f8418af3f8518af3f8618af3f8718af3f8818af3f8918af3f8a18af3f8b18af3f8c18af3f8d18af3f8e18af3f8f18af3f90"+
    "18af3f9118af3f9218af3f9318af3f9418af3f9518af3f9618af3f9718af3f9818af3f9918af3f9a18af3f9b18af3f9c18af3f9d18af3f9e18af3f9f18af3fa018af3fa118af3fa218af3fa318af3fa418af3fa51caf3fa61caf3fa718af3fa818af3fa918af3faa18af3fab18af3fac18af3fad18af3fae18af3faf18af3fb018af3fb118af3fb218af3fb318af3fb41caf3fb51caf3fb61cb03f4a1cb03f4b1cb03f4c1cb03f4d18b03f4e18b03f4f18b03f5018b03f5118b03f5218b03f5318b03f5418b03f55"+
    "18b03f5618b03f5718b03f5818b03f5918b03f5a18b03f5b18b03f5c18b03f5d18b03f5e18b03f5f18b03f6018b03f6118b03f6218b03f6318b03f6418b03f6518b03f6618b03f6718b03f6818b03f6918b03f6a18b03f6b18b03f6c18b03f6d18b03f6e18b03f6f18b03f7018b03f7118b03f7218b03f7318b03f7418b03f7618b03f7718b03f7818b03f7918b03f7a18b03f7b18b03f7c18b03f7d18b03f7f18b03f8018b03f8118b03f8218b03f8318b03f8418b03f8518b03f8618b03f8718b03f8818b03f89"+
    "18b03f8a18b03f8b18b03f8c18b03f8d18b03f8e18b03f8f18b03f9018b03f9118b03f9218b03f9318b03f9418b03f9518b03f9618b03f9718b03f9818b03f9918b03f9a18b03f9b18b03f9c18b03f9d18b03f9e18b03f9f18b03fa018b03fa118b03fa218b03fa318b03fa418b03fa518b03fa61cb03fa718b03fa818b03fa918b03faa18b03fab18b03fac18b03fad18b03fae18b03faf18b03fb018b03fb118b03fb218b03fb318b03fb418b03fb51cb03fb61cb13f4a18b13f4b18b13f4c18b13f4d18b13f4e"+
    "18b13f4f18b13f5018b13f5118b13f5218b13f5318b13f5418b13f5518b13f5618b13f5718b13f5818b13f5918b13f5a18b13f5b18b13f5c18b13f5d18b13f5e18b13f5f18b13f6018b13f6118b13f6218b13f6318b13f6418b13f6518b13f6618b13f6718b13f6818b13f6918b13f6a18b13f6b18b13f6c18b13f6d18b13f6e18b13f6f18b13f7018b13f7118b13f7218b13f7318b13f7418b13f7518b13f7718b13f7818b13f7918b13f7a18b13f7b18b13f7c18b13f7d18b13f7f18b13f8018b13f8118b13f82"+
    "18b13f8318b13f8418b13f8518b13f8618b13f8718b13f8818b13f8918b13f8a18b13f8b18b13f8c18b13f8d18b13f8e18b13f8f18b13f9018b13f9118b13f9218b13f9318b13f9418b13f9518b13f9618b13f9718b13f9818b13f9918b13f9a18b13f9b18b13f9c18b13f9d18b13f9e18b13f9f18b13fa018b13fa118b13fa218b13fa318b13fa418b13fa51cb13fa618b13fa718b13fa818b13fa918b13faa18b13fab18b13fac18b13fad18b13fae18b13faf18b13fb018b13fb118b13fb218b13fb318b13fb4"+
    "1cb13fb51cb13fb618b23f4a18b23f4b18b23f4c18b23f4d18b23f4e18b23f4f18b23f5018b23f5118b23f5218b23f5318b23f5418b23f5518b23f5618b23f5718b23f5818b23f5918b23f5a18b23f5b18b23f5c18b23f5d18b23f5e18b23f5f18b23f6018b23f6118b23f6218b23f6318b23f6418b23f6518b23f6618b23f6718b23f6818b23f6918b23f6a18b23f6b18b23f6c18b23f6d18b23f6e18b23f6f18b23f7018b23f7218b23f7318b23f7418b23f7518b23f7718b23f7818b23f7918b23f7a18b23f7c"+
    "18b23f7d18b23f7e18b23f7f18b23f8018b23f8118b23f8218b23f8318b23f8418b23f8518b23f8618b23f8718b23f8818b23f8918b23f8a18b23f8b18b23f8c18b23f8d18b23f8e18b23f8f18b23f9018b23f9118b23f9218b23f9318b23f9418b23f9518b23f9618b23f9718b23f9818b23f9918b23f9a18b23f9b18b23f9c18b23f9d18b23f9e18b23f9f18b23fa018b23fa11cb23fa218b23fa31cb23fa41cb23fa518b23fa618b23fa718b23fa818b23fa918b23faa18b23fab18b23fac18b23fad18b23fae"+
    "18b23faf18b23fb018b23fb118b23fb218b23fb318b23fb418b23fb518b23fb618b33f4a18b33f4b18b33f4c1cb33f4d18b33f4e18b33f4f18b33f5018b33f5118b33f5218b33f5318b33f5418b33f5518b33f5618b33f5718b33f5818b33f5918b33f5a18b33f5b18b33f5c18b33f5d18b33f5e18b33f5f18b33f6018b33f6118b33f6218b33f6318b33f6418b33f6518b33f6618b33f6718b33f6818b33f6918b33f6a18b33f6b18b33f6c18b33f6d18b33f6e18b33f6f18b33f7118b33f7318b33f7418b33f75"+
    "18b33f7618b33f7718b33f7818b33f7918b33f7b18b33f7c18b33f7d18b33f7f18b33f8018b33f8118b33f8218b33f8318b33f8418b33f8518b33f8618b33f8718b33f8818b33f8918b33f8a18b33f8b18b33f8c18b33f8d18b33f8e18b33f8f18b33f9018b33f9118b33f9218b33f9318b33f9418b33f9518b33f9618b33f9718b33f9818b33f9918b33f9a18b33f9b18b33f9c18b33f9d18b33f9e18b33f9f18b33fa018b33fa11cb33fa218b33fa318b33fa418b33fa518b33fa618b33fa718b33fa818b33fa9"+
    "18b33faa18b33fab18b33fac18b33fad18b33fae18b33faf18b33fb018b33fb118b33fb218b33fb318b33fb418b33fb518b33fb618b43f4a18b43f4b1cb43f4c18b43f4d18b43f4e18b43f4f18b43f5018b43f5118b43f5218b43f5318b43f5418b43f5518b43f5618b43f5718b43f5818b43f5918b43f5a18b43f5b18b43f5c18b43f5d18b43f5e18b43f5f18b43f6018b43f6118b43f6218b43f6318b43f6418b43f6518b43f6618b43f6718b43f6818b43f6918b43f6a18b43f6b18b43f6c18b43f6d18b43f6e"+
    "18b43f6f18b43f7118b43f7218b43f7318b43f7418b43f7618b43f7718b43f7818b43f7a18b43f7b18b43f7c18b43f7d18b43f7e18b43f7f18b43f8018b43f8118b43f8218b43f8318b43f8418b43f8518b43f8618b43f8718b43f8818b43f8918b43f8a18b43f8b18b43f8c18b43f8d18b43f8e18b43f8f18b43f9018b43f9118b43f9218b43f9318b43f9418b43f9518b43f9618b43f9718b43f9818b43f9918b43f9a18b43f9b18b43f9c18b43f9d18b43f9e18b43f9f18b43fa018b43fa118b43fa218b43fa3"+
    "18b43fa418b43fa518b43fa618b43fa718b43fa818b43fa918b43faa27b43fab18b43fac18b43fad18b43fae18b43faf18b43fb018b43fb118b43fb218b43fb318b43fb418b43fb518b43fb618b53f4a1cb53f4b18b53f4c18b53f4d18b53f4e18b53f4f18b53f5018b53f5118b53f5218b53f5318b53f5418b53f5518b53f5618b53f5718b53f5818b53f5918b53f5a18b53f5b18b53f5c18b53f5d18b53f5e18b53f5f18b53f6018b53f6118b53f6218b53f6318b53f6418b53f6518b53f6618b53f6718b53f68"+
    "18b53f6918b53f6a18b53f6b18b53f6c18b53f6d18b53f6e18b53f7118b53f7318b53f7418b53f7518b53f7618b53f7718b53f7818b53f7918b53f7a18b53f7b18b53f7c18b53f7d18b53f7e18b53f7f18b53f8018b53f8118b53f8218b53f8318b53f8418b53f8518b53f8618b53f8718b53f8818b53f8918b53f8a18b53f8b18b53f8c18b53f8d18b53f8e18b53f8f18b53f9018b53f9118b53f9218b53f9318b53f9418b53f9518b53f9618b53f9718b53f9818b53f9918b53f9a18b53f9b18b53f9c18b53f9d"+
    "18b53f9e18b53f9f18b53fa018b53fa118b53fa218b53fa318b53fa418b53fa518b53fa618b53fa718b53fa818b53fa918b53faa18b53fab18b53fac18b53fad18b53fae18b53faf18b53fb018b53fb118b53fb218b53fb318b53fb418b53fb518b53fb61c4a40a51c4a40a71c4a40a81c4a40a9184a40aa184a40ab184a40ad184a40ae184a40af184a40b0184a40b1184a40b2184a40b3184a40b4184a40b51c4b40a51c4b40a61c4b40a71c4b40a81c4b40a9184b40aa184b40ab184b40ac184b40ad184b40af"+
    "184b40b0184b40b1184b40b2184b40b31c4c40921c4c40931c4c40a6184c40aa184c40ab184c40ad184c40ae184c40af184c40b0184c40b1184c40b21c4d40901c4d40911c4d40921c4d40931c4d40a41c4d40a5184d40a8184d40a9184d40aa184d40ad184d40ae184d40af184d40b0184d40b1184d40b21c4e408f1c4e40901c4e40911c4e40921c4e40931c4e40941c4e40a11c4e40a21c4e40a41c4e40a51c4e40a6184e40a8184e40a9184e40aa184e40ab184e40ac184e40ad184e40ae184e40af184e40b0"+
    "1c4f408d1c4f408e1c4f408f1c4f40901c4f40911c4f40921c4f40931c4f40941c4f40a01c4f40a11c4f40a21c4f40a31c4f40a4184f40a7184f40a8184f40a9184f40aa184f40ab184f40ac184f40ad184f40ae184f40af1c50408c1c50408d1850408e1850408f1850409018504091185040921c5040931c5040941c50409f1c5040a01c5040a11c5040a21c5040a31c5040a41c5040a5185040a6185040a7185040a8185040a9185040aa185040ab185040ac185040ad185040ae185040af1c5140891c51408a"+
    "1c51408b1851408c1951408d1951408e1951408f195140901951409118514092185140931c5140941c51409f1c5140a01c5140a11c5140a21c5140a31c5140a4185140a5185140a6185140a7185140a8185140a9185140aa185140ac185140ad185140ae1c5240871c524088185240891852408a1952408b1952408c1952408d1952408e1952408f195240901952409119524092185240931c5240941c52409e1c52409f1c5240a01c5240a11c5240a21c5240a3185240a4185240a5185240a6185240a7185240a8"+
    "185240a9185240aa185240ad1c5340861853408719534088195340891953408a1953408b1953408c1953408d1953408e1953408f1953409019534091185340921c5340931c5340941c5340951c53409a1c53409b1c53409c1c53409d1c53409e1c53409f1c5340a01c5340a1185340a2185340a3185340a4185340a5185340a6185340a7185340a8185340a9185340aa185340ab1c5440841c544085185440861954408719544088195440891954408a1954408b1954408c1954408d1954408e1954408f19544090"+
    "19544091185440921c5440931c5440941c5440951c5440961c5440971c5440981c5440991c54409a1c54409b1c54409c1c54409d1c54409e1c54409f1c5440a0185440a1185440a2185440a3185440a4185440a5185440a8185440a9185440aa185440ab1c5540821c5540831c55408418554085195540861955408736554088195540891955408a3655408b1955408c1955408d1955408e1955408f19554090195540911c5540921c5540931c5540941c5540951c5540961c5540971c5540981c5540991c55409a"+
    "1c55409b1c55409c1c55409d1c55409e1855409f185540a0185540a1185540a2185540a3185540a4185540a6185540a7185540a91c5640811c564082185640831956408419564085195640861956408719564088195640891956408a1956408b1956408c1956408d1956408e1956408f195640901956409119564092195640931c5640951c5640961c5640971c5640981c5640991c56409a1c56409b1c56409c1c56409d1856409e1856409f185640a0185640a1185640a2185640a3185640a5185640a7185640a8"+
    "185640a9255740792557407a2557407c0e57407d2557407e2557407f185740801c57408118574082195740831957408419574085195740861957408719574088195740891957408a1957408b1957408c1957408d1957408e3657408f1957409019574091195740921c5740961c5740971c5740981c5740991c57409a1c57409b1857409c1857409d1857409e1857409f185740a0185740a1185740a2185740a3185740a5185740a6185740a7185740a8255840760e5840773e5840783e5840793e58407a3e58407b"+
    "3e58407c1958407d1958407e1958407f185840801958408119584082195840831958408419584085195840861958408719584088195840891958408a1958408b1958408c1958408d1958408e1958408f195840901958409119584092185840931c5840941c5840951c5840961c5840971c5840981c5840991c58409a1858409b1858409c1858409d1858409e1858409f185840a0185840a1185840a2185840a3185840a4185840a6185840a7255940743e5940753e5940763e5940773e5940783e5940793e59407a"+
    "3e59407b1959407c1959407d1959407e1959407f185940801959408119594082195940833659408419594085195940861959408719594088195940891959408a1959408b1959408c1959408d1959408e1959408f195940901959409118594092185940931c5940941c5940951c5940961c5940981c5940991859409a1859409b1859409c1859409d1859409e1859409f185940a0185940a1185940a2185940a4185940a5185940a63e5a40733e5a40743e5a40753e5a40763e5a4077205a40783e5a40793e5a407a"+
    "195a407b195a407c195a407d195a407e195a407f185a4080195a4081195a4082195a4083195a4084195a4085195a4086195a4087195a4088195a4089195a408a195a408b195a408c195a408d195a408e195a408f195a4090185a4091185a4093185a40951c5a40961c5a40971c5a4098185a4099185a409a185a409b185a409c185a409d185a409e185a409f185a40a0185a40a1185a40a2185a40a4185a40a50e5b40703e5b40713e5b40723e5b40733e5b40743e5b40753e5b40763e5b40773e5b40783e5b4079"+
    "3e5b407a195b407b365b407c195b407d195b407e195b407f255b4080195b4081195b4082195b4083195b4084195b4085195b4086195b4087195b4088195b4089195b408a195b408b195b408c195b408d195b408e195b408f185b4092185b4093185b4095185b4096185b4097185b4098185b4099185b409a185b409b185b409c185b409d185b409e185b409f185b40a0185b40a1185b40a3185b40a40e5c406f3e5c40703e5c4071205c40723e5c40733e5c40743e5c40753e5c40763e5c40773e5c40783e5c4079"+
    "195c407a195c407b195c407c195c407d195c407e195c407f195c4082195c4083195c4084195c4085195c4086195c4087195c4088365c4089195c408a195c408b195c408c195c408d185c408e185c408f185c4091185c4092185c4093185c4094185c4095185c4096185c4097185c4098185c4099185c409a185c409b185c409c185c409d185c409e185c409f185c40a0185c40a1185c40a2255d406e3e5d406f3e5d40703e5d40713e5d40723e5d4073205d40743e5d40753e5d40763e5d40773e5d40783e5d4079"+
    "195d407a195d407b195d407c195d407d195d407e195d407f195d4080255d4081195d4082195d4083195d4084195d4085195d4086195d4087195d4088195d4089195d408a195d408b195d408c185d408f185d4090185d4091185d4092185d4093185d4094185d4095185d4096185d4097185d4098185d4099185d409a185d409c185d409d185d409e185d409f185d40a0185d40a1185d40a2255e406d3e5e406e3e5e406f3e5e40703e5e40713e5e40723e5e40733e5e40743e5e40753e5e40763e5e40773e5e4078"+
    "3e5e40793e5e407a3e5e407b195e407c195e407d195e407e195e407f195e40800e5e40810e5e4082195e4083195e4084195e4085195e4086195e4087195e4088195e4089195e408a195e408b185e408c185e408e185e4090185e4091185e4092185e4093185e4094185e4095185e4096185e4097185e4098185e4099185e409b185e409c185e409d185e409e185e409f185e40a03e5f406d3e5f406e3e5f406f3e5f40703e5f40713e5f40723e5f40733e5f40743e5f40753e5f40763e5f40773e5f40783e5f4079"+
    "3e5f407a3e5f407b195f407c195f407d195f407e195f407f195f4080195f4081255f4082195f4084195f4085195f4086195f4087195f4088195f4089195f408a185f408b185f408c185f408d185f408e185f408f185f4090185f4091185f4092185f4093185f4094185f4095185f4096185f4097185f4098185f4099185f409a185f409b185f409f185f40a00e60406b3e60406c3e60406d3e60406e3e60406f3e6040703e6040713e6040723e6040733e6040743e6040753e6040763e6040773e6040783e604079"+
    "3e60407a3e60407b3e60407c1960407d1960407e1960407f1960408019604081196040820e60408319604084196040851960408619604087196040881860408c1860408d1860408e1860408f1860409018604091186040921860409318604094186040951860409618604097186040991860409c1860409d1860409f3e61406b3e61406c3e61406d3e61406e2061406f3e6140703e6140713e6140723e6140733e6140743e6140753e6140763e6140773e614078206140793e61407a3e61407b3e61407c1961407d"+
    "1961407e3661407f19614080196140811961408218614083186140841861408518614086186140871c6140881861408a1861408b1861408c1861408d1861408e1861408f186140901861409118614092186140931861409418614095186140961861409c1861409d1861409e0e62406a3e62406b3e62406c3e62406d3e62406e3e62406f3e6240703e6240713e6240723e6240733e6240743e6240753e6240763e6240773e6240783e6240793e62407a3e62407b1962407c1962407d1962407e1962407f19624080"+
    "19624081186240821c6240831c624084186240891862408a1862408c1862408d1862408e1862408f186240901862409218624093186240941862409518624096186240991862409a1862409b1862409c1862409d0e6340693e63406a3e63406b3e63406c3e63406d3e63406e3e63406f3e6340703e6340713e6340723e6340733e6340743e6340753e6340763e6340773e6340783e6340793e63407a3e63407b1963407c1963407d1963407e1963407f19634080186340811c6340821c6340831c6340841c634086"+
    "18634088186340891863408a1863408b1863408c1863408d1863408e1863408f1863409118634092186340931863409418634096186340971863409b1863409c3e64406a3e64406b3e64406c3e64406d3e64406e3e64406f3e6440703e6440713e6440723e6440733e6440743e6440753e6440763e6440773e6440783e6440793e64407a1964407b1964407c1964407d1964407e1964407f19644080186440811c6440841c644085186440861864408718644088186440891864408a1864408b1864408c1864408d"+
    "1864408f186440901864409118644093186440941864409518644096186440971864409b3e6540693e65406a3e65406b3e65406c3e65406d3e65406e3e65406f3e6540703e6540713e6540723e6540733e6540743e6540753e6540763e6540773e6540783e6540791965407a1965407b1965407c1965407d1965407e1965407f186540801c6540811c6540821c6540831865408418654085186540861865408718654088186540891865408a1865408b1865408c1865408d1865408e1865408f1865409018654093"+
    "1865409518654096186540991865409a3e6640693e66406a3e66406b3e66406c2066406d3e66406e3e66406f3e6640703e6640713e6640723e6640733e6640743e6640753e6640763e6640773e6640783e6640791966407a1966407b1966407c1966407d1966407e1866407f186640801866408118664082186640831866408418664085186640861866408718664088186640891866408a1866408b1866408c1866408e1866408f1866409018664091186640921866409318664094186640951866409618664098"+
    "186640990e6740683e6740693e67406a3e67406b3e67406c3e67406d3e67406e3e67406f3e6740703e6740713e6740723e6740733e6740743e6740753e6740763e6740773e674078196740791967407a1967407b1967407c1867407d1967407e1967407f186740801867408118674082186740831867408418674085186740861867408718674088186740891867408a1867408b1867408c1867408d1867408e1867408f18674093186740951867409618674097186740980e6840673e6840683e6840693e68406a"+
    "3e68406b3e68406c3e68406d3e68406e3e68406f3e6840703e6840713e6840723e6840733e6840743e6840753e6840763e68407719684078196840791968407a1968407b1868407c1968407d1968407e1868407f186840801868408118684082186840831868408418684085186840861868408718684088186840891868408a1868408b1868408c1868408d1868408e186840901868409218684095186840970f6940530f6940563e6940673e6940683e6940693e69406a2769406b2769406c2769406d3e69406e"+
    "3e69406f3e6940703e6940713e694072206940733e6940743e6940753e6940763e69407719694078366940791969407a1869407b1969407c1969407d1969407e1869407f1869408018694081186940821869408318694084186940851869408618694087186940881869408b1869408c1869408d1869408e1869408f1869409018694091186940931869409418694095186940960f6a4058256a40653e6a40663e6a4067276a4068276a4069276a406d276a406e276a406f276a40703e6a40713e6a40723e6a4073"+
    "3e6a40743e6a40753e6a4076196a4077196a4078196a407a196a407b196a407c196a407d186a407e186a407f186a4080186a4081186a4082186a4083186a4084186a4085186a4086186a4087186a4088186a4089186a408a186a408b186a408d186a408e186a408f186a4090186a4092186a4093186a4094186a40950f6b40580f6b4059276b405e276b405f276b4063276b4064276b4065276b4066276b4070276b40713e6b40723e6b40733e6b40743e6b4075196b4076196b4077196b4079196b407a366b407b"+
    "196b407c196b407d186b407e186b407f186b4080186b4081186b4082186b4083186b4084186b4085186b4086186b4087186b4088186b4089186b408a186b408b186b408c186b408d186b408e186b408f186b4090186b4091186b4093186b40940f6c4059276c405b276c405c276c4069276c40713e6c40723e6c40733e6c4074196c4075196c4076196c4078196c4079196c407a196c407b196c407c196c407d186c407e186c407f186c4080186c4081186c4082186c4083186c4084186c4085186c4086186c4087"+
    "186c4088186c4089186c408a186c408b186c408c186c408d186c408e186c408f186c4090186c4091186c4092186c4093276d4059236d4062276d40703e6d40713e6d40723e6d4073196d4074256d4075196d4076196d4077196d4078196d4079196d407a196d407b196d407c196d407d196d407e186d407f186d4080186d4081186d4082186d4083186d4084186d4085186d4086186d4087186d4088186d4089186d408a186d408b186d408c186d408f186d4091186d4092276e4058276e4070256e4071196e4074"+
    "196e4075196e4076196e4077196e4078196e4079196e407a196e407b196e407c196e407d196e407e186e407f186e4080186e4081186e4082186e4083186e4084186e4085186e4086186e4087186e4088186e4089186e408a186e408b186e408e186e408f186e4090186e4091276f4056106f4066106f4067106f4068106f4069106f406a106f406b106f406c106f406d276f4070196f4071196f4072196f4073196f4074196f4075196f4076196f4077196f4078196f4079196f407a196f407b196f407c196f407d"+
    "186f407e186f407f186f4080186f4081186f4082186f4083186f4084186f4085186f4086186f4087186f4088186f4089186f408a186f408d186f408f0f6f40a527704055107040650b7040660b7040670b7040680b7040690b70406a0b70406b1070406c1c70406e1870406f197040701970407119704072197040733670407419704075197040761970407719704078197040793670407a1970407b1970407c1870407d1870407e1870407f18704080187040811870408218704083187040841870408518704087"+
    "187040891870408a1870408b1870408c1870408d1870408e27714054107140580f714059107140640b7140650b7140660b7140670b7140680b7140690b71406a1071406b1c71406d1871406e1971406f197140701971407119714072197140731971407419714075197140761971407719714078197140791971407a1971407b1971407c1871407d1871407e1871407f1871408018714081187140821871408318714084187140861871408718714088187140891871408a1871408b1871408c1871408d1871408e"+
    "0f7140a2277240530f7240560c72405710724059277240610e7240620e72406333724064277240650b724066117240670b7240680b7240691072406a1c72406c1872406d1972406e1972406f197240701972407119724072197240731972407419724075197240761972407719724078197240791872407a1872407b1872407c1c72407d1c72407e1872407f1872408018724081187240821872408318724085187240861872408718724088187240891872408a1872408b1872408d27734052107340550f734058"+
    "0e73406001734061017340620e7340640b7340650b7340660b7340670b734068107340691c73406b2773406c1973406d1973406e1973406f197340701973407118734072187340731873407418734075187340761873407718734078187340791c73407a1873407b1873407c1c73407d1873407e1873407f18734080187340811873408218734083187340851873408718734088187340891873408b1873408c0f7340ac277440500f744055107440563374405f0674406006744061277440630e74406427744065"+
    "0b7440660b744067107440681c74406a1c74406b1874406c1974406d1974406e1874406f187440701874407118744072187440731874407418744075187440761874407718744078187440791c74407a1c74407b1874407c1874407d1874407e1874407f187440801874408118744082187440841874408518744086187440881874408a1874408b0f74409e2775404f3375405e08754062087540630e7540641075406510754066107540671c7540691c75406a1875406b1875406c1875406d1d75406e1875406f"+
    "1d754070187540711d7540721d7540731d7540741d7540751d7540761d7540771d7540781d7540791875407a1875407b1875407c1875407d1875407e1875407f1875408018754081187540821875408318754085187540861875408718754088187540891875408a0f75409d0f7540aa2776404e107640570e76405d0576405e0676405f0e764063267640641c7640681c7640691876406a1c76406b1d76406c1d76406d1d76406e1d76406f1d7640701d764071187640721d7640731d764074187640751d764076"+
    "187640771d764078187640791876407a1876407b1876407c1876407d1876407e1876407f1876408018764081187640821876408418764085187640861876408718764089277640960f76409c0f7640aa2777404d0e77405c3277405d0d77405f1a774060127740610e7740621c7740661c7740671c774068187740691c77406a1877406b1d77406c1d77406d1877406e1877406f1d7740701d7740711d7740721d774073187740741d7740751d7740761d77407718774078187740791877407a1877407b1877407c"+
    "1877407d1877407e1877407f187740801877408118774082187740831877408518774086187740870f7740a92778404c0778404e0778404f07784050077840510778405207784053077840542778405b0e78405c0e78405d3c78405e0a78405f3c784060277840611c784065187840661c7840671c784068187840691d78406a1d78406b1d78406c1878406d1878406f1878407018784071187840721878407318784074187840751c7840761878407718784078187840791878407a1878407b1878407c1878407d"+
    "1878407e1878407f1878408018784081187840821878408318784084187840851878408618784087257840a82779404a0779404d1979404e1979404f197940501979405119794052077940533c79405d3c79405e3c79405f1c7940631c7940641c7940651c79406618794067187940681d7940691d79406a1879406b1879406c1c79406d1879406e187940701c7940711c794072187940731c79407418794075187940761879407718794078187940791879407a1879407b1879407c1879407d1879407e1879407f"+
    "18794081187940821879408318794084187940860f79409a3e7940a73e7940aa3e7940ab3e7940b13e7940b23e7940b33e7940b4277940b6077a404c197a404d367a404e197a404f197a4050197a4051077a4052297a4055297a4056297a4057187a4061187a4062187a4063187a4064187a4065187a4066187a40671d7a4068187a4069187a406a187a406b187a406c1c7a406d1c7a406e187a4070187a4071187a4072187a4073187a4074187a4075187a4076187a4077187a4078187a4079187a407a187a407b"+
    "187a407c187a407d187a407e187a407f187a4081187a4083187a4084187a4085277a408e3e7a40a53e7a40a60e7a40a73e7a40a83e7a40a93e7a40aa3e7a40ab3e7a40ac3e7a40af3e7a40b03e7a40b13e7a40b23e7a40b33e7a40b4277a40b5277b404a0e7b404b0e7b404c0e7b404d0e7b404e0e7b404f0e7b40500e7b4051277b4052187b40531d7b4054187b40551d7b4056187b4057187b40581c7b40591c7b405a187b405b187b405c267b4060187b4061187b4062187b4063187b40641d7b4065187b4066"+
    "1d7b40671d7b4068187b4069187b406a1c7b406b187b406c1c7b406d1c7b406e187b406f187b4070187b4071187b4072187b4073187b4074187b4075187b4076187b4077187b4078187b4079187b407a187b407b187b407c187b407d187b407e187b407f187b4080187b4081187b4083187b4084257b409a3e7b40a23e7b40a33e7b40a43e7b40a53e7b40a60e7b40a73e7b40a83e7b40a93e7b40aa3e7b40ab3e7b40ac3e7b40ad3e7b40ae3e7b40af3e7b40b0207b40b13e7b40b23e7b40b3277b40b40e7b40b6"+
    "287c404a287c404b287c404c287c404d287c404e287c404f287c40500e7c40511d7c40521d7c40531d7c4054187c4055187c4056187c4057187c4058187c40591c7c405a187c405b1c7c405c187c405f187c4060187c4061187c40621d7c40631d7c40641d7c4065187c40661d7c40671d7c4068187c4069187c406a187c406b1c7c406c1c7c406d187c406e187c4071187c4072187c4073187c4074187c4075187c4076187c4077187c4078187c4079187c407a187c407b187c407c187c407d187c407e187c407f"+
    "187c4080187c4081187c4082187c4083277c408a0e7c40993e7c409f3e7c40a03e7c40a13e7c40a23e7c40a33e7c40a43e7c40a50e7c40a63e7c40a73e7c40a83e7c40a9207c40aa3e7c40ab3e7c40ac3e7c40ad3e7c40ae3e7c40af3e7c40b03e7c40b1277c40b20e7c40b5287c40b6287d404a287d404b287d404c287d404d287d404e287d404f0e7d4050187d40511d7d40521d7d40531d7d4054187d40551c7d40561c7d40571c7d40581c7d4059187d405a187d405b187d405c187d405d187d405e1d7d405f"+
    "1d7d40601d7d40611d7d40621d7d4063187d4064187d40651d7d4066187d4067187d40681c7d4069187d406a1c7d406b1c7d406c187d406d187d406e187d4070187d4071187d4072187d4073187d4074187d4075187d4076187d4077187d4078187d4079187d407a187d407b187d407c187d407d187d407e187d407f187d4080187d4081187d4082277d40890e7d40990e7d409a3e7d409d3e7d409e3e7d409f3e7d40a0207d40a13e7d40a23e7d40a33e7d40a43e7d40a63e7d40a73e7d40a83e7d40a93e7d40aa"+
    "3e7d40ab3e7d40ac3e7d40ad3e7d40ae3e7d40af277d40b00e7d40b4287d40b5287d40b6287e404a287e404b3c7e404c3c7e404d3c7e404e0e7e404f1d7e40501d7e40511d7e40521d7e4053187e4054187e4055187e4056187e4057187e4058187e40591c7e405a187e405b1d7e405c1d7e405d1d7e405e1d7e405f187e40601d7e40611d7e4062187e4063077e4064077e4065077e4066077e4067077e40681c7e40691c7e406a187e406b187e406d187e406e187e406f187e4070187e4071187e4072187e4073"+
    "187e4074187e4075187e4076187e4077187e4078187e4079187e407a187e407b187e407c187e407d187e407e187e407f187e4080187e4081277e4087277e4088277e4089277e408a0e7e409a257e409b3e7e409d3e7e409e3e7e409f3e7e40a03e7e40a13e7e40a23e7e40a30e7e40a43e7e40a5277e40a6277e40a7277e40a83e7e40a93e7e40aa3e7e40ab3e7e40ac277e40ad277e40ae1c7e40b11c7e40b20e7e40b3287e40b4287e40b5287e40b6277f404a3c7f404b3c7f404c3c7f404d277f404e187f404f"+
    "1d7f40501d7f40511d7f4052187f4053187f4054187f4055187f4056187f4057187f4058187f4059187f405a1d7f405b1d7f405c187f405d187f405e1d7f405f187f4060187f40611d7f4062077f4063197f4064197f4065197f4066077f40671c7f40681c7f4069187f406a187f406c187f406d187f406e187f406f187f4070187f4071187f4072187f4073187f4074187f4075187f4076187f4077187f4078187f4079187f407a187f407b187f407c187f407d187f407e187f407f187f4080277f4088277f408d"+
    "257f409c0e7f409d3e7f409e3e7f409f3e7f40a03e7f40a13e7f40a2277f40a3277f40a4277f40a8277f40a9277f40aa277f40ab1c7f40ae1c7f40af1c7f40b01c7f40b10e7f40b2287f40b3287f40b4287f40b50e7f40b63c80404a3c80404b3c80404c1880404d1880404e1880404f1880405018804051188040521880405318804054188040561880405718804058188040591d80405a1d80405b1d80405c1880405d1880405e1880405f1d804060188040610780406236804063198040641980406507804066"+
    "1c80406718804068188040691880406a1880406b1880406c1880406e1880406f188040701880407118804072188040731880407418804075188040761880407718804078188040791880407a1880407b1880407c1880407d1880407e1880407f0e80409d0e80409e3e80409f3e8040a0278040a11c8040ac1c8040ad1c8040ae1c8040af1c8040b0278040b10e8040b20e8040b30e8040b4278040b51c8040b61c81404a1c81404b1881404c1881404d1881404e1881404f18814051188140531881405418814055"+
    "188140561c81405718814058188140591d81405a1881405b1881405c2781405d0e81405e0e81405f0e814060278140610e8140620e8140630e8140642781406518814066188140681881406a1881406b1881406c1881406d1881406e1881406f188140701881407118814072188140731881407418814075188140761881407718814078188140791881407a1881407b1881407c1881407d1881407e2781409f1c8140aa1c8140ab1c8140ac188140ad188140ae1c8140af1c8140b01c8140b1188140b2188140b5"+
    "188140b61882404a1882404b1882404c1882404d1882404e1882404f1882405018824051188240521882405418824055188240571d8240581d8240591d82405a1882405b0e82405c2882405d2882405e2882405f288240602882406128824062288240630e82406418824065188240661882406718824068188240691882406b1882406c1882406d1882406e1882406f188240701882407118824072188240731882407418824075188240761882407718824078188240791882407a1882407b1882407c1882407d"+
    "2982409629824097298240982782409e268240a31c8240a91c8240aa188240ab1c8240ac1c8240ad1c8240ae1c8240af188240b0188240b4188240b5188240b61883404a1883404b1883404c1883404d1883404e18834050188340511883405318834054188340561883405718834058188340591883405a0e83405b2883405c2883405d2883405e2883405f2883406028834061288340620e83406318834064188340651883406618834067188340691883406a1883406b1883406c1883406d1883406e1883406f"+
    "188340701883407118834072188340731883407418834075188340761883407718834078188340791883407a1883407b1883407c188340941d8340951d8340961d83409718834098188340992783409d1883409e188340a1188340a2188340a7188340a81c8340ab188340ac188340ae188340b0188340b1188340b2188340b3188340b4188340b5188340b61884404a1884404b1884404c1884404f1884405018844051188440521884405318844055188440560e84405a2884405b2884405c2884405d2884405e"+
    "2884405f28844060288440610e844062188440631884406418844065188440661884406718844068188440691884406a1884406b1884406c1884406d1884406e1884406f188440701884407118844072188440731884407418844075188440761884407718844078188440791884407a1884407b18844093188440941d8440951d8440961884409718844098188440991884409a1884409b2784409c1884409d1884409e1884409f188440a0188440a1188440a2188440a3188440a4188440a5188440a6188440a9"+
    "188440aa188440ab188440ac188440ad188440ae188440af188440b3188440b4188440b5188440b61885404a1885404b1885404d1885404e18854050188540521885405318854055188540560e8540592885405a2885405b2885405c2885405d2885405e2885405f288540600e85406118854062188540631885406418854068188540691885406a1885406b1885406c1885406d1885406e1885406f188540701885407118854072188540731885407418854075188540761885407718854078188540791885407a"+
    "188540921d8540931d8540941d8540951d8540961d8540971d854098188540991885409a1885409b1d85409c1d85409d1d85409e1d85409f1d8540a01d8540a11d8540a2188540a31d8540a4188540a5188540a8188540a9188540ae188540b0188540b1188540b2188540b3188540b4188540b5188540b61886404a1886404b1886404d1886404e1886404f188640501886405118864052188640531886405418864055188640570e864058288640592886405a2886405b2886405c3c86405d3c86405e3c86405f"+
    "0e86406018864061188640621886406318864065188640661886406718864068188640691886406a1886406b1886406c1886406d1886406e1886406f188640701886407118864072188640731886407418864075188640761886407718864078188640790e86408e0e86408f0e864090188640911d8640921d864093188640941d8640951d8640961d8640971d8640981d8640991d86409a1d86409b1d86409c1d86409d1d86409e1d86409f1d8640a0188640a11d8640a21d8640a3188640a4188640a8188640a9"+
    "188640aa188640ac188640ad188640af188640b2188640b3188640b4188640b5188640b61887404a1887404b1887404c1887404d1887404e1887404f18874050188740511887405218874053188740541887405518874056278740570e8740580e8740590e87405a2787405b3c87405c3c87405d3c87405e2787405f188740601887406118874062188740631887406418874065188740661887406718874068188740691887406a1887406b1887406c1887406d1887406e1887406f188740701887407118874072"+
    "1887407318874074188740751887407618874077188740782587408b0e87408c3e87408d3e87408e3e87408f2587409025874091188740921d8740931d8740941d8740951d8740961d8740971d8740981d8740991887409a1d87409b1d87409c1887409d1d87409e1d87409f188740a0188740a11d8740a2188740a3188740a4188740a6188740a7188740a9188740ac188740ad188740ae188740af188740b0188740b1188740b2188740b3188740b4188740b5188740b61888404a1888404b1888404c1888404d"+
    "1888404e1888404f188840501888405118884052188840531888405418884055188840561888405718884058188840591888405a3c88405b3c88405c3c88405d1888405f188840601888406118884062188840631888406418884065188840661888406718884068188840691888406a1888406b1888406c1888406d1888406e1888406f18884070188840711888407218884073188840741888407518884076188840770e8840880e8840893e88408a3e88408b3e88408c3e88408d3e88408e3e88408f3e884090"+
    "0e8840910e8840920e884093258840940e884095258840962588409718884098188840991888409a1888409b1888409c1888409d1d88409e1d88409f188840a0188840a1188840a2188840a9188840aa188840ac188840ad188840ae188840b0188840b1188840b2188840b3188840b4188840b5188840b61889404a1889404b1889404c1889404d1889404e1889404f188940501889405118894052188940531889405418894055188940561889405718894058188940591889405a1889405b1889405c1889405d"+
    "1889405e1889405f188940601889406118894062188940631889406418894065188940661889406718894068188940691889406a1889406b1889406c1889406d1889406e1889406f188940701889407118894072188940731889407418894075188940760e8940863e8940873e8940883e8940893e89408a3e89408b3e89408c3e89408d3e89408e3e89408f19894090198940911889409218894093188940941889409518894096188940971c894098188940991889409a2789409b0e89409c0e89409d0e89409e"+
    "2789409f0e8940a0278940a11c8940a2188940a6188940ab188940ac188940ae188940af188940b0188940b1188940b2188940b3188940b4188940b5188940b6188a404a188a404b188a404c188a404d188a404e188a404f188a4050188a4051188a4052188a4054188a40553d8a40563d8a4057188a4058188a4059188a405a188a405c188a405d188a405e188a405f188a4060188a4061188a4062188a4063188a4064188a4065188a4066188a4067188a4068188a4069188a406a188a406b188a406c188a406d"+
    "188a406e188a406f188a4070188a4071188a4072188a4073188a4074188a4075258a40833e8a40843e8a40853e8a40863e8a40873e8a40883e8a40893e8a408a3e8a408b3e8a408c3e8a408d198a408e198a408f198a4090188a4091188a4092188a4093188a4094188a40951c8a4096188a40971c8a4098188a40990e8a409a288a409b288a409c288a409d288a409e288a409f0e8a40a0188a40a5188a40a7188a40aa188a40ac188a40ad188a40ae188a40af188a40b0188a40b1188a40b2188a40b3188a40b4"+
    "188a40b5188a40b6188b404a188b404b188b404d188b404e188b404f188b4050188b4052188b4053188b40543d8b40553d8b4056188b4057188b4058188b4059188b405a188b405b188b405c188b405d188b405e188b405f188b4060188b4061188b4062188b4063188b4064188b4065188b4066188b4067188b4068188b4069188b406a188b406b188b406c188b406d188b406e188b406f188b4070188b4071188b4072188b4073188b40740e8b40813e8b40823e8b40833e8b40843e8b40853e8b40863e8b4087"+
    "3e8b4088208b40893e8b408a3e8b408b3e8b408c198b408d198b408e198b408f188b4090188b4091188b4092188b4093188b4094188b4095188b4096188b40970e8b4099288b409a288b409b288b409c278b409d288b409e278b409f188b40a2188b40a3188b40a4188b40a6188b40a7188b40a8188b40aa188b40ab188b40ad188b40ae188b40af188b40b0188b40b1188b40b2188b40b3188b40b4188b40b5188c404a188c404b188c404c188c404d188c404e188c4052188c4053188c4054188c4055188c4056"+
    "188c4057188c4058188c405a188c405b188c405d188c405e188c405f188c4060188c4061188c4062188c4063188c4064188c4065188c4066188c4067188c4068188c4069188c406a188c406b188c406c188c406d188c406e188c406f188c4070188c4071188c4072188c4073258c407f3e8c40803e8c40813e8c40823e8c40833e8c40843e8c40853e8c40863e8c40873e8c40883e8c40893e8c408a3e8c408b198c408c198c408d198c408e198c408f188c4090188c4093188c4094188c40960e8c40983c8c4099"+
    "3c8c409a3c8c409b288c409c288c409d0e8c409e188c40a0188c40a2188c40a5188c40a6188c40a7188c40a8188c40a9188c40aa188c40ac188c40ad188c40ae188c40af188c40b0188c40b1188c40b2188c40b3188c40b4188c40b5188d404a188d404b188d404c188d404d188d404f188d4050188d4051188d4052188d4053188d4054188d4055188d4056188d4057188d405b188d405c188d405d188d405f188d4060188d4061188d4062188d4063188d4064188d4065188d4066188d4067188d4068188d4069"+
    "188d406a188d406b188d406c188d406d188d406e188d406f188d4070188d4071188d40723e8d407f3e8d40803e8d40813e8d40823e8d40833e8d40843e8d40853e8d40863e8d40873e8d40883e8d4089198d408a198d408b368d408c198d408d198d408e188d408f188d4090188d4092188d4093188d4094188d4095188d4096278d40973c8d40983c8d40993c8d409a0e8d409b0e8d409c278d409d188d40a0188d40a2188d40a6188d40a7188d40a9188d40aa188d40ab188d40ac188d40ad188d40ae188d40af"+
    "188d40b0188d40b1188d40b2188d40b3188d40b4188d40b6188e404a188e404b188e404c188e404d188e404e188e4050188e4051188e4053188e4054188e4055188e4059188e405b188e405c188e405e188e405f188e4060188e4061188e4062188e4063188e4064188e4065188e4066188e4067188e4068188e4069188e406a188e406b188e406c188e406d188e406e188e406f188e4070188e40713e8e407e3e8e407f3e8e4080208e40813e8e40823e8e40833e8e40843e8e40853e8e40863e8e4087198e4088"+
    "198e4089198e408a198e408b198e408c188e408d188e408e188e4090188e4091188e40933c8e40973c8e40983c8e4099188e409b188e409f188e40a3188e40a4188e40a5188e40a6188e40a7188e40a8188e40a9188e40ab188e40ac188e40ad188e40ae188e40af188e40b0188e40b2188e40b4188e40b5188e40b6188f404a188f404b188f404d188f404e188f404f188f4051188f4052188f4054188f4055188f4057188f4058188f4059188f405b188f405c188f405d188f405e188f405f188f4060188f4061"+
    "188f4062188f4063188f4064188f4065188f4066188f4067188f4068188f4069188f406a188f406b188f406c188f406d188f406e188f406f188f4070258f407d3e8f407e3e8f407f3e8f40803e8f40813e8f40823e8f40833e8f4084198f4085198f4086198f4087198f4088198f4089198f408a198f408b188f408c188f408e188f408f188f4090188f4092188f4093188f4095188f4097188f4099188f409a188f409c188f409d188f40a0188f40a1188f40a3188f40a4188f40a7188f40a8188f40aa188f40ab"+
    "188f40ac188f40ad188f40ae188f40af188f40b0188f40b1188f40b2188f40b4188f40b5188f40b61890404c1890404e18904051189040541890405518904058189040591890405a1890405c1890405d1890405e1890405f189040601890406118904062189040631890406418904065189040661890406718904068189040691890406a1890406b1890406c1890406d1890406e1890406f3e90407d3e90407e3e90407f3e9040803e9040813e904082199040831990408419904085199040861990408719904088"+
    "199040891990408a1890408b1890408e1890408f18904090189040911890409218904094189040971890409b1890409c1890409f189040a0189040a2189040a5189040a7189040a8189040a9189040aa189040ab189040ae189040af189040b0189040b1189040b2189040b4189040b51891404e1891405218914054189140561891405718914058189140591891405a1891405b1891405c1891405d1891405e1891405f189140601891406118914062189140631891406418914065189140661891406718914068"+
    "189140691891406a1891406b1891406c1c91406d1c91406e3e91407c3e91407d2091407e3e91407f3e9140803e91408119914082199140831991408419914085199140861991408719914088189140891891408b1891408c1891408d1891408e1891408f1891409018914091189140941891409518914098189140991891409d189140a0189140a2189140a3189140a4189140a5189140a6189140a7189140a8189140a9189140ab189140ac189140b0189140b1189140b3189140b4189140b51892404c1892404e"+
    "1892405018924051189240531892405418924055189240561892405718924058189240591892405a1892405b1892405c1892405e1892405f189240601892406118924062189240631892406418924065189240661892406718924068189240691c92406a1c92406b1c92406c1c92406d3e92407b3e92407c3e92407d3e92407e3e92407f199240801992408119924082199240831992408419924085199240861892408718924088189240891892408a1892408b1892408c1892408d1892408f1892409018924092"+
    "18924093189240951892409d1892409e1892409f189240a0189240a2189240a4189240a5189240a6189240a7189240a8189240a9189240aa189240ab189240ac189240ae189240b0189240b2189240b51893404c1893404e18934050189340511893405218934053189340561893405718934058189340591893405a1893405c1893405d1893405e1893405f18934060189340611893406218934063189340641893406518934066189340671c9340681c9340691c93406a1c93406b1c93406c3e93407b3e93407c"+
    "3e93407d1993407e1993407f1993408036934081199340821993408319934084199340851893408618934087189340881893408a1893408b1893408c1893408e1893408f189340901893409118934092189340971893409a1893409b1893409c1893409e1893409f189340a3189340a4189340a5189340a6189340a7189340a8189340a9189340aa189340ab189340b3189340b41894404a1894404c1894404f189440511894405218944055189440561894405718944058189440591894405a1894405b1894405c"+
    "1894405d1894405e1894405f189440601894406118944062189440631894406418944065189440661c9440671c9440681c9440691c94406a1c94406b259440793e94407a3e94407b1994407c1994407d1994407e1994407f19944080199440811994408219944083199440841894408518944088189440891894408a1894408b1894408d1894408e1894408f189440901894409218944094189440961894409718944098189440991894409a1894409c1894409d1894409f189440a0189440a3189440a4189440a7"+
    "189440a8189440aa189440ab189440ad1895404c1895404d1895404f1895405018954055189540571895405a1895405b1895405c1895405d1895405e1895405f189540601895406118954062189540631895406418954065189540661c9540671c9540681c9540691c95406a0e9540730e954074199540791995407a1995407b1995407c1995407d1995407e1995407f199540801995408119954082189540831895408518954086189540891895408a1895408b1895408c1895408e1895408f1895409018954094"+
    "189540951895409618954097189540991895409b1895409d1895409e1895409f189540a0189540a1189540a2189540a3189540a4189540a6189540a8189540a9189540aa189540ac189540b1189540b31896404b1896404e1896405318964054189640551896405718964058189640591896405a1896405b1896405c1896405d1896405e1896405f1896406018964061189640621896406318964064189640651c9640661c9640671c9640681c964069259640713e9640723e9640730e9640752596407625964077"+
    "19964078199640791996407a1996407b1996407c1996407d1996407e1996407f1996408019964081189640821896408318964085189640861896408718964088189640891896408a1896408b1896408d1896408f1896409018964092189640941896409518964097189640981896409a1896409b1896409c1896409e189640a0189640a3189640a5189640a7189640a8189640ac189640af189640b1189640b2189640b3189640b4189640b61897404e18974051189740531897405618974057189740591897405a"+
    "1897405b1897405c1897405d1897405e1897405f189740601897406118974062189740631c9740641c9740651c9740661c974067189740683e9740713e9740723e9740733e9740743e9740753e97407619974078199740791997407a1997407b1997407c1997407d1997407e1997407f19974080189740811897408418974085189740861897408718974088189740891897408a1897408b1897408c1897408d1897408e1897409018974091189740921897409318974095189740961897409a1897409b1897409c"+
    "1897409d1897409e189740a1189740a3189740a4189740a7189740a9189740aa189740ab189740ad189740af189740b0189740b2189740b3189740b61898404b1898404e18984050189840511898405318984054189840551898405618984057189840581c9840591c98405a1898405b1898405c1898405d1898405e1898405f18984060189840611c9840621c9840631c9840641c9840651c9840661c9840673e98406f3e9840703e9840713e9840723e9840733e9840743e9840750e9840761998407719984078"+
    "199840791998407a1998407b1998407c1998407d1998407e1998407f189840801898408118984082189840831898408418984085189840861898408718984088189840891898408a1898408c1898408d1898408f189840901898409118984092189840931898409418984095189840961898409a1898409c1898409d189840a3189840a6189840a7189840a8189840a9189840ac189840ae189840b0189840b1189840b5189840b61899404a1899404b1899404e1899405018994051189940521899405418994055"+
    "18994056189940571c9940581c9940591899405a1899405b1899405c1899405d1899405e1899405f1c9940601c9940611c9940621c9940631c9940641c9940651c9940663e99406d3e99406e3e99406f3e9940703e9940713e9940723e9940733e9940743e9940750e9940761999407719994078369940791999407a1999407b1999407c1999407d1899407e1899407f189940801899408118994082189940831899408418994085189940861899408718994088189940891899408a1899408c1899408d1899408e"+
    "1899408f18994091189940931899409418994095189940961899409718994098189940991899409b1899409c1899409d1899409e189940a1189940a2189940a3189940a4189940a5189940a6189940ac189940ae189940af189940b0189940b2189940b3189940b4189a404b189a404c189a404d189a4050189a4051189a4052189a4053189a4054189a40551c9a40561c9a40571c9a40581c9a4059189a405a189a405b189a405c189a405d1c9a405e1c9a405f1c9a40601c9a40611c9a40621c9a40631c9a4064"+
    "1c9a40653e9a406c3e9a406d3e9a406e3e9a406f3e9a4070209a40713e9a40723e9a40733e9a40743e9a4075199a4077199a4078199a4079199a407a199a407b189a407c189a407d189a407e189a407f189a4080189a4081189a4082189a4083189a4084189a4085189a4086189a4087189a4088189a4089189a408a189a408b189a408c189a408d189a408e189a408f189a4090189a4092189a4095189a4096189a4098189a4099189a409a189a409c189a409f189a40a0189a40a2189a40a3189a40a6189a40a7"+
    "189a40a8189a40ac189a40ad189a40af189a40b0189a40b4189a40b5189a40b6189b404b189b404d189b404e189b404f189b4050189b4051189b4052189b4053189b40541c9b40551c9b40561c9b40571c9b40581c9b4059189b405a189b405b1c9b405c1c9b405d1c9b405e1c9b405f1c9b40601c9b40611c9b40621c9b40631c9b40640e9b40693e9b406a3e9b406b3e9b406c3e9b406d3e9b406e3e9b406f3e9b40703e9b40713e9b40723e9b4073199b4074199b4075189b4076189b4077189b4078199b4079"+
    "189b407a189b407b189b407c189b407d189b407e189b407f189b4080189b4081189b4082189b4083189b4084189b4085189b4086189b4087189b4088189b4089189b408a189b408b189b408c189b408d189b408e189b408f189b4090189b4091189b4092189b4093189b4094189b4095189b4096189b4097189b4098189b409a189b409b189b409e189b409f189b40a9189b40aa189b40ac189b40ad189b40af189b40b1189b40b3189b40b4189b40b5189c404a189c404b189c404d189c404e189c404f189c4050"+
    "189c4051189c40521c9c40531c9c40541c9c40551c9c40561c9c40571c9c40581c9c40591c9c405a1c9c405b1c9c405c1c9c405d1c9c405e1c9c405f1c9c40601c9c40611c9c40621c9c4063259c40683e9c40693e9c406a3e9c406b3e9c406c3e9c406d3e9c406e3e9c406f3e9c40703e9c4071199c4072199c4073199c4074199c4075199c4076199c4077189c4078189c4079189c407a189c407b189c407c189c407d189c407e189c407f189c4080189c4081189c4082189c4083189c4084189c4085189c4086"+
    "189c4087189c4088189c4089189c408a189c408b189c408c189c408d189c408e189c408f189c4090189c4091189c4092189c4093189c4094189c4096189c4097189c4098189c4099189c409a189c409c189c40a9189c40aa189c40ab189c40ac189c40af189c40b0189c40b2189c40b5189d404b189d404e189d404f189d4050189d4051189d40521c9d40531c9d40541c9d40551c9d40561c9d40571c9d40581c9d40591c9d405a1c9d405b1c9d405c1c9d405d1c9d405e1c9d405f1c9d40601c9d40611c9d4062"+
    "3e9d40683e9d4069209d406a3e9d406b3e9d406c3e9d406d3e9d406e3e9d406f199d4070199d4071199d4072199d4073199d4074199d4075199d4076199d4077199d4078199d4079189d407a189d407b189d407c189d407d189d407e189d407f189d4080189d4081189d4082189d4083189d4084189d4085189d4086189d4087189d4088189d4089189d408a189d408b189d408c189d408d189d408e189d408f189d4090189d4091189d4093189d4094189d4095189d4097189d4098189d4099189d409a189d409b"+
    "189d409c189d409d189d409e189d40a7189d40a8189d40a9189d40aa189d40ab189d40ac189d40af189d40b0189d40b1189d40b3189d40b4189e404a189e404b189e404c189e404d189e404e189e404f189e4050189e40511c9e40521c9e40531c9e40541c9e40551c9e40561c9e40571c9e40581c9e40591c9e405a1c9e405b1c9e405c1c9e405d1c9e405e1c9e405f1c9e40601c9e4061259e40653e9e40663e9e40673e9e40683e9e40693e9e406a3e9e406b3e9e406c199e406d199e406e199e406f199e4070"+
    "199e4071199e4072199e4073369e4074199e4075199e4076199e4077189e4078199e4079199e407a199e407b199e407c189e407d189e407e189e407f189e4080189e4081189e4082189e4083189e4084189e4085189e4086189e4087189e4088189e4089189e408a189e408b189e408c189e408d189e408e189e408f189e4092189e4094189e4095189e4096189e4097189e409a189e409b189e409c189e409d189e40a6189e40a7189e40a8189e40a9189e40aa189e40ab189e40ae189e40af189e40b1189e40b4"+
    "189e40b5189e40b6189f404b189f404c189f404d189f404e189f404f189f4050189f40511c9f40521c9f40531c9f40541c9f40551c9f40561c9f40571c9f40581c9f40591c9f405a1c9f405b1c9f405c1c9f405d1c9f405e1c9f405f1c9f40600e9f40643e9f40653e9f40663e9f40673e9f40683e9f40693e9f406a199f406b199f406c199f406d199f406e199f406f199f4070199f4071199f4072199f4073199f4074189f4075189f4076199f4077199f4078199f4079199f407a199f407b199f407c189f407d"+
    "189f407e189f407f189f4080189f4081189f4082189f4083189f4084189f4085189f4086189f4087189f4088189f4089189f408a189f408b189f408c189f408d189f408e189f4090189f4091189f4093189f4095189f409a189f409c189f40a5189f40a6189f40a7189f40a8189f40a9189f40ab189f40ad189f40ae189f40af189f40b1189f40b2189f40b3189f40b4189f40b518a0404a18a0404b18a0404c18a0404d18a0404e18a0404f18a0405018a040511ca040521ca040531ca040541ca040551ca04056"+
    "1ca040571ca040581ca040591ca0405a1ca0405b1ca0405c1ca0405d1ca0405e1ca0405f19a0406319a040643ea040653ea040663ea040673ea0406819a0406919a0406a19a0406b19a0406c19a0406d19a0406e19a0406f19a0407019a0407119a0407218a0407319a0407419a0407519a0407619a0407719a0407819a0407919a0407a19a0407b18a0407c18a0407d18a0407e18a0407f18a0408018a0408118a0408218a0408318a0408418a0408518a0408618a0408718a0408818a0408918a0408a18a0408b"+
    "18a0408c18a0408e18a0408f18a0409318a0409418a0409718a0409818a0409a18a0409b18a040a318a040a418a040a518a040a618a040a718a040a818a040a918a040aa18a040ab18a040ac18a040ad18a040ae18a040b018a040b118a040b218a040b418a040b618a1404a18a1404b18a1404c18a1404d18a1404e18a1404f18a140501ca140511ca140521ca140531ca140541ca140551ca140561ca140571ca140581ca140591ca1405a1ca1405b1ca1405c1ca1405d1ca1405e19a1406219a1406319a14064"+
    "3ea140653ea1406619a1406719a1406819a1406919a1406a36a1406b19a1406c19a1406d19a1406e19a1406f19a1407018a1407119a1407219a1407319a1407419a1407519a1407619a1407719a1407819a1407919a1407a19a1407b18a1407c18a1407d18a1407e18a1407f18a1408018a1408118a1408218a1408318a1408418a1408518a1408618a1408718a1408818a1408918a1408a18a1408b18a1408c18a1408d18a1408e18a1408f18a1409718a1409818a1409a18a1409e18a1409f18a140a218a140a3"+
    "18a140a418a140a518a140a618a140a718a140a818a140aa18a140ab18a140ad18a140ae18a140af18a140b018a140b118a140b218a140b318a140b418a140b518a140b618a2404a18a2404b18a2404c18a2404d18a2404e18a2404f1ca240501ca240511ca240521ca240531ca240541ca240551ca240561ca240571ca240581ca240591ca2405a1ca2405b1ca2405c1ca2405d19a2406136a2406219a2406319a2406419a2406519a2406619a2406719a2406819a2406919a2406a19a2406b19a2406c19a2406d"+
    "19a2406e19a2406f18a2407019a2407119a2407219a2407319a2407419a2407536a2407619a2407719a2407819a2407919a2407a18a2407b18a2407c18a2407d18a2407e18a2407f18a2408018a2408118a2408218a2408318a2408418a2408518a2408618a2408718a2408818a2408918a2408a18a2408c18a2408d18a2408e18a2408f18a2409118a2409218a2409418a2409518a2409718a2409818a2409d18a240a118a240a218a240a318a240a418a240a518a240a618a240a718a240a818a240a918a240aa"+
    "18a240ab18a240ad18a240ae18a240af18a240b018a240b118a240b218a240b318a240b418a240b518a240b618a3404a18a3404b18a3404c18a3404d18a3404e18a3404f1ca340501ca340511ca340521ca340531ca340541ca340551ca340561ca340571ca340581ca340591ca3405c0ea3405f19a3406019a3406119a3406219a3406319a3406436a3406519a3406619a3406719a3406819a3406919a3406a19a3406b19a3406c19a3406d18a3406e19a3406f19a3407019a3407136a3407219a3407319a34074"+
    "19a3407519a3407619a3407719a3407819a3407918a3407a18a3407b18a3407c18a3407d18a3407e18a3407f18a3408018a3408118a3408218a3408318a3408418a3408518a3408618a3408718a3408818a3408918a3408b18a3408c18a3408e18a3408f18a3409018a3409118a3409218a3409318a3409418a3409518a3409618a3409c18a3409d18a3409f18a340a118a340a318a340a418a340a718a340a918a340ab18a340ac18a340ae18a340af18a340b018a340b118a340b218a340b318a340b418a340b5"+
    "18a340b618a4404a18a4404b18a4404c18a4404d1ca4404e1ca4404f1ca440501ca440511ca440521ca440531ca440541ca440551ca440561ca440571ca4405c1ca4405e25a4405f19a4406019a4406119a4406219a4406319a4406419a4406519a4406619a4406719a4406819a4406919a4406a19a4406b19a4406c18a4406d19a4406e19a4406f19a4407019a4407119a4407219a4407319a4407419a4407519a4407619a4407719a4407818a4407918a4407a18a4407b18a4407c18a4407d18a4407e18a4407f"+
    "18a4408018a4408118a4408218a4408318a4408418a4408518a4408618a4408718a4408818a4408918a4408a18a4408c18a4408d18a4408f18a4409118a4409218a4409318a4409518a4409618a4409718a4409c18a4409d18a4409e18a440a018a440a118a440a418a440a518a440a618a440a718a440a818a440a918a440ab18a440ac18a440ae18a440af18a440b018a440b118a440b21ca440b31ca440b41ca440b518a440b618a5404a18a5404b18a5404c1ca5404d1ca5404e1ca5404f1ca540501ca54051"+
    "1ca540521ca540531ca540541ca540551ca5405b1ca5405c1ca5405d1ca5405e18a5405f18a5406019a5406119a5406219a5406319a5406419a5406519a5406619a5406719a5406819a5406919a5406a18a5406b18a5406c19a5406d19a5406e19a5406f19a5407019a5407119a5407219a5407319a5407419a5407519a5407618a5407718a5407818a5407918a5407a18a5407b18a5407c18a5407d18a5407e18a5407f18a5408018a5408118a5408218a5408318a5408418a5408518a5408618a5408718a54088"+
    "18a5408918a5408a18a5408b18a5408c18a5408d18a5408e18a5408f18a5409018a5409118a5409218a5409318a5409418a5409518a5409618a5409718a5409818a5409918a5409a18a5409b18a5409c18a5409d18a540a018a540a118a540a218a540a318a540a418a540a518a540a618a540a718a540a818a540a91ca540ab1ca540ac1ca540ad1ca540ae1ca540af1ca540b01ca540b11ca540b21ca540b31ca540b41ca540b518a540b61ca6404a1ca6404b1ca6404c1ca6404d1ca6404e1ca6404f1ca64050"+
    "1ca640511ca640521ca6405a1ca6405b1ca6405c1ca6405d1ca6405e1ca6405f18a6406018a6406118a6406219a6406319a6406419a6406519a6406618a6406718a6406818a640691ca6406a18a6406b19a6406c19a6406d19a6406e19a6406f19a6407019a6407119a6407219a6407318a6407418a6407518a6407618a6407718a6407818a6407918a6407a18a6407b18a6407c18a6407d18a6407e18a6407f18a6408018a6408118a6408218a6408318a6408418a6408618a6408718a6408d18a6408e18a6408f"+
    "18a6409018a6409118a6409318a6409418a6409518a6409618a6409718a6409818a6409918a6409b18a6409d18a6409e18a6409f18a640a018a640a118a640a218a640a418a640a527a640a718a640a81ca640a91ca640aa1ca640ab1ca640ac1ca640ad1ca640ae1ca640af1ca640b01ca640b11ca640b21ca640b31ca640b41ca640b51ca640b61ca7404a1ca7404b1ca7404c1ca7404d1ca7404e1ca7404f1ca740501ca740511ca740591ca7405a1ca7405b1ca7405c1ca7405d1ca7405e1ca7405f1ca74060"+
    "1ca7406118a7406218a7406318a7406418a740651ca740661ca740671ca740681ca740691ca7406a18a7406b19a7406c19a7406d19a7406e19a7406f19a7407019a7407118a7407218a7407318a7407418a7407518a7407618a7407718a7407818a7407918a7407a18a7407b18a7407c18a7407d18a7407e18a7407f18a7408018a7408118a7408218a7408418a7408518a7408618a7408718a7408818a7408918a7408a18a7408b18a7408c18a7408d18a7408e18a7408f18a7409018a7409218a7409318a74094"+
    "18a7409518a7409618a7409718a7409818a7409b18a7409d18a7409e18a7409f18a740a018a740a118a740a327a740a527a740a627a740a727a740a81ca740a91ca740aa1ca740ab1ca740ac1ca740ad1ca740ae1ca740af1ca740b01ca740b11ca740b21ca740b31ca740b427a740b51ca740b61ca8404a1ca8404b1ca8404c1ca8404d1ca8404e1ca8404f1ca840581ca840591ca8405a1ca8405b1ca8405c1ca8405d1ca8405e1ca8405f1ca840601ca840611ca840621ca840631ca840641ca840651ca84066"+
    "1ca840671ca840681ca8406918a8406a19a8406b36a8406c19a8406d19a8406e19a8406f18a8407018a8407118a8407218a8407318a8407418a8407518a8407618a8407718a8407818a8407918a8407a18a8407b18a8407c18a8407d18a8407e18a8407f18a8408018a8408118a8408218a8408318a8408418a8408618a8408718a8408818a8408918a8408a18a8408b18a8408c18a8408e18a8408f18a8409018a8409118a8409218a8409318a8409418a8409518a8409618a8409718a8409818a8409c18a8409d"+
    "18a8409e18a840a018a840a118a840a218a840a318a840a41ca840a527a840a61ca840a71ca840a81ca840a91ca840aa1ca840ab1ca840ac1ca840ad1ca840ae1ca840af1ca840b01ca840b11ca840b227a840b327a840b427a840b527a840b61ca9404a1ca9404b1ca9404c1ca9404d1ca9404e1ca940571ca940581ca940591ca9405a1ca9405b1ca9405c1ca9405d1ca9405e1ca9405f1ca940601ca940611ca940621ca940631ca940641ca940651ca940661ca940671ca9406818a9406919a9406a19a9406b"+
    "19a9406c18a9406d18a9406e18a9406f18a9407018a9407118a9407218a9407318a9407418a9407518a9407618a9407718a9407818a9407918a9407a18a9407b18a9407c18a9407d18a9407e18a9407f18a9408018a9408118a9408218a9408418a9408618a9408818a9408918a9408a18a9408c18a9408d18a9408e18a9408f18a9409018a9409118a9409218a9409318a9409418a9409518a9409618a9409718a9409818a9409918a9409a18a9409b18a9409c18a9409d18a9409e18a9409f18a940a018a940a1"+
    "1ca940a427a940a51ca940a61ca940a71ca940a81ca940a91ca940aa1ca940ab1ca940ac1ca940ad1ca940ae1ca940af1ca940b01ca940b11ca940b21ca940b327a940b41ca940b51ca940b61caa404a1caa404b1caa404c1caa404d1caa40561caa40571caa40581caa40591caa405a1caa405b1caa405c1caa405d1caa405e1caa405f1caa40601caa40611caa40621caa40631caa40641caa40651caa40661caa406718aa406818aa406919aa406a18aa406b18aa406c18aa406d18aa406e18aa406f18aa4070"+
    "18aa407118aa407218aa407318aa407418aa407518aa407618aa407718aa407818aa407918aa407a18aa407b18aa407c18aa407d18aa407e18aa407f18aa408118aa408218aa408318aa408418aa408518aa408618aa408718aa408918aa408b18aa408c18aa408d18aa408e18aa408f18aa409018aa409118aa409218aa409318aa409418aa409518aa409618aa409818aa409918aa409a18aa409c18aa409e18aa409f18aa40a01caa40a21caa40a41caa40a51caa40a61caa40a71caa40a81caa40a91caa40aa"+
    "1caa40ab1caa40ac1caa40ad1caa40ae1caa40af1caa40b01caa40b11caa40b227aa40b31caa40b41caa40b51caa40b61cab404a1cab404b1cab404c1cab40551cab40561cab40571cab40581cab40591cab405a1cab405b1cab405c1cab405d1cab405e1cab405f1cab40601cab40611cab406218ab406318ab40641cab406518ab406618ab406718ab406818ab406918ab406a18ab406b18ab406c18ab406d18ab406e18ab406f18ab407018ab407118ab407218ab407318ab407418ab407518ab407618ab4077"+
    "18ab407818ab407918ab407a18ab407b18ab407c18ab407d18ab408018ab408118ab408218ab408418ab408518ab408618ab408718ab408818ab408918ab408a18ab408b18ab408c18ab408d18ab408e18ab408f18ab409018ab409118ab409218ab409318ab409418ab409518ab409618ab409718ab409818ab409c18ab409e18ab409f18ab40a01cab40a21cab40a31cab40a41cab40a51cab40a61cab40a71cab40a81cab40a91cab40aa1cab40ab1cab40ac1cab40ad1cab40ae1cab40af1cab40b01cab40b1"+
    "1cab40b21cab40b31cab40b41cab40b51cab40b61cac404a1cac404b1cac404c1cac40541cac40551cac40561cac40571cac40581cac40591cac405a1cac405b1cac405c1cac405d1cac405e1cac405f1cac40601cac40611cac406218ac406318ac406418ac406518ac406618ac406718ac406818ac406918ac406a18ac406b18ac406c18ac406d18ac406e18ac406f18ac407018ac407118ac407218ac407318ac407418ac407518ac407618ac407718ac407818ac407918ac407a18ac407b18ac407c18ac407d"+
    "18ac407e18ac407f18ac408118ac408218ac408318ac408418ac408518ac408618ac408718ac408818ac408918ac408a18ac408b18ac408c18ac408d18ac408e18ac408f18ac409018ac409118ac409218ac409318ac409418ac409518ac409618ac409718ac409818ac409918ac409a18ac409b18ac409c18ac409e18ac409f1cac40a01cac40a11cac40a21cac40a31cac40a41cac40a51cac40a61cac40a71cac40a81cac40a91cac40aa1cac40ab1cac40ac1cac40ad1cac40ae1cac40af1cac40b01cac40b1"+
    "1cac40b21cac40b31cac40b41cac40b51cac40b61cad404a1cad40531cad40541cad40551cad40561cad40571cad40581cad40591cad405a1cad405b1cad405c1cad405d1cad405e1cad405f18ad406018ad406118ad406218ad406318ad406418ad406518ad406618ad406718ad406818ad406918ad406a18ad406b18ad406c18ad406d18ad406e18ad406f18ad407018ad407118ad407218ad407318ad407418ad407518ad407618ad407718ad407818ad407918ad407a18ad407c18ad407d18ad407e18ad407f"+
    "18ad408018ad408118ad408418ad408518ad408618ad408718ad408818ad408918ad408a18ad408b18ad408c18ad408d18ad408e18ad408f18ad409018ad409118ad409218ad409318ad409418ad409518ad409618ad409718ad409818ad409918ad409a18ad409b18ad409c18ad409d18ad409e1cad409f1cad40a01cad40a11cad40a21cad40a31cad40a41cad40a51cad40a61cad40a71cad40a91cad40aa1cad40ab1cad40ac1cad40ad1cad40ae1cad40af1cad40b01cad40b11cad40b21cad40b31cad40b4"+
    "1cad40b51cad40b61cae404a1cae40521cae40531cae40541cae40551cae40561cae40571cae40581cae40591cae405a1cae405b1cae405c1cae405d1cae405e1cae405f18ae406018ae406118ae406218ae406318ae406418ae406518ae406618ae406718ae406818ae406918ae406a18ae406b18ae406c18ae406d18ae406e18ae406f18ae407018ae407118ae407218ae407318ae407418ae407518ae407618ae407718ae407818ae407918ae407a18ae407b18ae407c18ae407d18ae407e18ae407f18ae4080"+
    "18ae408218ae408318ae408418ae408518ae408618ae408718ae408818ae408918ae408a18ae408b18ae408c18ae408d18ae408e18ae408f18ae409018ae409118ae409218ae409318ae409418ae409518ae409618ae409718ae409818ae409918ae409a18ae409b18ae409c18ae409d1cae409e1cae409f1cae40a01cae40a11cae40a21cae40a31cae40a41cae40a51cae40a81cae40a91cae40aa1cae40ab1cae40ac1cae40ad1cae40ae1cae40af1cae40b01cae40b11cae40b21cae40b31cae40b41cae40b5"+
    "1cae40b61caf40511caf40521caf40531caf40541caf40551caf40561caf40571caf40581caf40591caf405a1caf405b1caf405c1caf405d1caf405e1caf405f1caf40601caf40611caf40621caf406318af406418af406518af406618af406718af406818af406918af406a18af406b18af406c18af406d18af406e18af406f18af407018af407118af407218af407318af407418af407618af407718af407918af407a18af407b18af407c18af407d18af407e18af408018af408118af408218af408318af4084"+
    "18af408518af408618af408718af408818af408918af408a18af408b18af408c18af408d18af408e18af408f18af409018af409118af409218af409318af409418af409518af409618af409718af409818af409918af409a18af409b18af409c1caf409d1caf409e1caf409f1caf40a01caf40a11caf40a21caf40a31caf40a41caf40a51caf40a81caf40a91caf40aa1caf40ab1caf40ac1caf40ad1caf40ae1caf40af1caf40b01caf40b11caf40b21caf40b31caf40b41cb0404e1cb0404f1cb040501cb04051"+
    "1cb040521cb040531cb040541cb040551cb040561cb040571cb040581cb040591cb0405a1cb0405b1cb0405c1cb0405d1cb0405e1cb0405f1cb040601cb040611cb0406218b0406318b0406418b0406518b0406618b0406718b0406818b0406918b0406a18b0406b18b0406c18b0406d18b0406e18b0406f18b0407018b0407118b0407218b0407318b0407418b0407618b0407718b0407818b0407918b0407a18b0407b18b0407c18b0407d18b0407f18b0408018b0408118b0408218b0408318b0408418b04085"+
    "18b0408618b0408718b0408818b0408918b0408a18b0408b18b0408c18b0408d18b0408e18b0408f18b0409018b0409118b0409218b0409318b0409418b0409518b0409618b0409718b0409818b0409918b0409a18b0409b1cb0409c1cb0409d1cb0409e1cb0409f1cb040a01cb040a11cb040a21cb040a31cb040a41cb040a51cb040a61cb040a81cb040a91cb040aa1cb040ab1cb040ac1cb040ad1cb040ae1cb040af1cb040b01cb040b11cb040b21cb040b31cb040b41cb040b51cb1404b1cb1404c1cb1404d"+
    "1cb1404e1cb1404f1cb140501cb140511cb140521cb140531cb140541cb140551cb140561cb1405718b140581cb140591cb1405a1cb1405b1cb1405c1cb1405d1cb1405e1cb1405f1cb140601cb140611cb1406218b1406318b1406418b1406518b1406618b1406718b1406818b1406918b1406a18b1406b18b1406c18b1406d18b1406e18b1406f18b1407018b1407118b1407218b1407318b1407418b1407518b1407718b1407818b1407918b1407a18b1407b18b1407c18b1407d18b1407f18b1408018b14081"+
    "18b1408218b1408318b1408418b1408518b1408618b1408718b1408818b1408918b1408a18b1408b18b1408c18b1408d18b1408e18b1408f18b1409018b1409118b1409218b1409318b1409418b1409518b1409618b1409718b1409818b1409918b1409a1cb1409b1cb1409c1cb1409d1cb1409e1cb1409f1cb140a01cb140a11cb140a21cb140a31cb140a41cb140a51cb140a71cb140a81cb140a91cb140aa1cb140ab1cb140ac1cb140ad1cb140ae1cb140af1cb140b01cb140b11cb140b21cb140b31cb140b4"+
    "1cb2404a1cb2404b1cb2404c1cb2404d1cb2404e1cb2404f1cb240501cb240511cb240521cb240531cb240541cb240551cb240561cb240571cb240581cb240591cb2405a1cb2405b1cb2405c1cb2405d1cb2405e1cb2405f1cb240601cb240611cb240621cb240631cb2406418b2406518b2406618b2406718b2406818b2406918b2406a18b2406b18b2406c18b2406d18b2406e18b2406f18b2407018b2407218b2407318b2407418b2407518b2407718b2407818b2407918b2407a18b2407c18b2407d18b2407e"+
    "18b2407f18b2408018b2408118b2408218b2408318b2408418b2408518b2408618b2408718b2408818b2408918b2408a18b2408b18b2408c18b2408d18b2408e18b2408f18b2409018b2409118b2409218b2409318b2409418b2409518b2409618b2409718b2409818b2409918b2409a1cb2409b1cb2409c1cb2409d1cb2409e1cb2409f1cb240a01cb240a11cb240a31cb240a61cb240a71cb240a81cb240a91cb240aa1cb240ab1cb240ac1cb240ad1cb240ae1cb240af1cb240b01cb240b11cb240b21cb240b3"+
    "1cb240b41cb240b51cb240b61cb3404a1cb3404b1cb3404c1cb3404e1cb3404f1cb340501cb340511cb340521cb340531cb340541cb340551cb340561cb340571cb340581cb340591cb3405a1cb3405b1cb3405c1cb3405d1cb3405e1cb3405f1cb340601cb340611cb340621cb3406318b3406418b3406518b3406618b3406718b3406818b3406918b3406a18b3406b18b3406c18b3406d18b3406e18b3406f18b3407118b3407318b3407418b3407518b3407618b3407718b3407818b3407918b3407b18b3407c"+
    "18b3407d18b3407f18b3408018b3408118b3408218b3408318b3408418b3408518b3408618b3408718b3408818b3408918b3408a18b3408b18b3408c18b3408d18b3408e18b3408f18b3409018b3409118b3409218b3409318b3409418b3409518b3409618b3409718b3409818b340991cb3409a1cb3409b1cb3409c1cb3409d1cb3409e1cb3409f1cb340a01cb340a11cb340a31cb340a41cb340a51cb340a61cb340a71cb340a81cb340a91cb340aa1cb340ab1cb340ac1cb340ad1cb340ae1cb340af1cb340b0"+
    "1cb340b11cb340b21cb340b31cb340b41cb340b51cb340b61cb4404a1cb4404b1cb4404d1cb4404e1cb4404f1cb440501cb440511cb440521cb440531cb440541cb440551cb440561cb440571cb440581cb440591cb4405a1cb4405b1cb4405c1cb4405d1cb4405e1cb4405f1cb440601cb440611cb4406218b4406318b4406418b4406518b4406618b4406718b4406818b4406918b4406a18b4406b18b4406c18b4406d18b4406e18b4406f18b4407118b4407218b4407318b4407418b4407618b4407718b44078"+
    "18b4407a18b4407b18b4407c18b4407d18b4407e18b4407f18b4408018b4408118b4408218b4408318b4408418b4408518b4408618b4408718b4408818b4408918b4408a1cb4408b1cb4408c1cb4408d18b4408e18b4408f18b4409018b4409118b4409218b4409318b4409418b4409518b4409618b4409718b440981cb440991cb4409a1cb4409b1cb4409c1cb4409d1cb4409e1cb4409f1cb440a01cb440a11cb440a21cb440a31cb440a41cb440a51cb440a61cb440a71cb440a81cb440a91cb440aa27b440ab"+
    "1cb440ac1cb440ad1cb440ae1cb440af1cb440b01cb440b11cb440b21cb440b31cb440b41cb440b51cb440b61cb5404a1cb5404c1cb5404d1cb5404e1cb5404f1cb540501cb540511cb540521cb540531cb540541cb540551cb540561cb540571cb540581cb540591cb5405a1cb5405b1cb5405c1cb5405d1cb5405e1cb5405f1cb5406018b5406118b5406218b5406318b5406418b5406518b5406618b5406718b5406818b5406918b5406a18b5406b18b5406c18b5406d18b5406e18b5407118b5407318b54074"+
    "18b5407518b5407618b5407718b5407818b5407918b5407a18b5407b18b5407c18b5407d18b5407e18b5407f18b5408018b5408118b5408218b5408318b5408418b5408518b5408618b5408718b5408818b540891cb5408a1cb5408b1cb5408c1cb5408d18b5408e18b5408f18b5409018b5409118b5409218b5409318b5409418b5409518b5409618b540971cb540981cb540991cb5409a1cb5409b1cb5409c1cb5409d1cb5409e1cb5409f1cb540a01cb540a11cb540a21cb540a31cb540a41cb540a51cb540a6"+
    "1cb540a71cb540a81cb540a927b540aa1cb540ab1cb540ac1cb540ad1cb540ae1cb540af1cb540b01cb540b11cb540b21cb540b31cb540b41cb540b51cb540b61c4a41aa1c4a41ab1c4a41ad1c4a41ae1c4a41af1c4a41b01c4a41b11c4a41b2184a41b3184a41b4184a41b51c4b41aa1c4b41ab1c4b41ac1c4b41ad1c4b41af1c4b41b01c4b41b11c4b41b2184b41b31c4c41aa1c4c41ab1c4c41ad1c4c41ae1c4c41af1c4c41b0184c41b1184c41b21c4d41a81c4d41a91c4d41aa1c4d41ad1c4d41ae1c4d41af"+
    "184d41b0184d41b1184d41b21c4e41a81c4e41a91c4e41aa1c4e41ab1c4e41ac1c4e41ad1c4e41ae184e41af184e41b01c4f41a71c4f41a81c4f41a91c4f41aa1c4f41ab1c4f41ac1c4f41ad184f41ae184f41af0e50418f25504190255041910e5041921c5041a61c5041a71c5041a81c5041a91c5041aa1c5041ab185041ac185041ad185041ae185041af2551418c3e51418d3e51418e3e51418f3e5141903e514191255141920e5141931c5141a51c5141a61c5141a71c5141a81c5141a9185141aa1c5141ac"+
    "185141ad185141ae255241892552418a3e52418b3e52418c3e52418d3e52418e3e52418f3e5241903e5241913e524192255241931c5241a41c5241a51c5241a61c5241a71c5241a81c5241a91c5241aa1c5241ad3e5341883e5341893e53418a3e53418b3e53418c3e53418d3e53418e3e53418f3e5341903e5341911c5341a21c5341a31c5341a41c5341a51c5341a61c5341a71c5341a81c5341a91c5341aa1c5341ab255441863e5441873e5441883e5441893e54418a3e54418b3e54418c3e54418d3e54418e"+
    "3e54418f3e5441903e5441911c5441a11c5441a21c5441a31c5441a41c5441a51c5441a81c5441a91c5441aa1c5441ab0e5541853e5541863e554187205541883e5541893e55418a2055418b3e55418c3e55418d3e55418e3e55418f3e5541903e5541912c55419c2c55419d1c55419f1c5541a01c5541a11c5541a21c5541a31c5541a41c5541a61c5541a71c5541a93e5641843e5641853e5641863e5641873e5641883e5641893e56418a3e56418b3e56418c3e56418d3e56418e3e56418f3e5641903e564191"+
    "3e5641923e564193255641941c56419e1c56419f1c5641a01c5641a11c5641a21c5641a31c5641a51c5641a71c5641a81c5641a90f57417b0f57417c2557417e0e57417f255741823e5741833e5741843e5741853e5741863e5741873e5741883e5741893e57418a3e57418b3e57418c3e57418d3e57418e2057418f3e5741903e5741913e5741921c57419c1c57419d1c57419e1c57419f1c5741a01c5741a11c5741a21c5741a31c5741a51c5741a61c5741a71c5741a80f5841773e58417d3e58417e3e58417f"+
    "255841803e5841813e5841823e5841833e5841843e5841853e5841863e5841873e5841883e5841893e58418a3e58418b3e58418c3e58418d3e58418e3e58418f3e5841903e5841913e5841920e5841931c58419b1c58419c1c58419d1c58419e1c58419f1c5841a01c5841a11c5841a21c5841a31c5841a41c5841a61c5841a70f5941743e59417c3e59417d3e59417e3e59417f0e5941803e5941813e5941823e594183205941843e5941853e5941863e5941873e5941883e5941893e59418a3e59418b3e59418c"+
    "3e59418d3e59418e3e59418f3e5941903e5941911c5941931c59419a1c59419b1c59419c1c59419d1c59419e1c59419f185941a0185941a1185941a2185941a41c5941a51c5941a60f5a41723e5a417b3e5a417c3e5a417d3e5a417e3e5a417f3e5a41813e5a41823e5a41833e5a41843e5a41853e5a41863e5a41873e5a41883e5a41893e5a418a3e5a418b3e5a418c3e5a418d3e5a418e3e5a418f3e5a41901c5a41921c5a41931c5a41951c5a41991c5a419a1c5a419b1c5a419c1c5a419d1c5a419e1c5a419f"+
    "1c5a41a0185a41a1185a41a2185a41a4185a41a50f5b41703e5b417b205b417c3e5b417d3e5b417e3e5b417f255b41803e5b41813e5b41823e5b41833e5b41843e5b41853e5b41863e5b41873e5b41883e5b41893e5b418a3e5b418b3e5b418c3e5b418d3e5b418e3e5b418f1c5b41921c5b41931c5b41951c5b41961c5b41971c5b41981c5b41991c5b419a1c5b419b1c5b419c1c5b419d1c5b419e185b419f185b41a0185b41a1185b41a3185b41a43e5c417a3e5c417b3e5c417c3e5c417d3e5c417e3e5c417f"+
    "0e5c4180255c41813e5c41823e5c41833e5c41843e5c41853e5c41863e5c41873e5c4188205c41893e5c418a3e5c418b3e5c418c3e5c418d0e5c418e1c5c418f1c5c41911c5c41921c5c41931c5c41941c5c41951c5c41961c5c41971c5c41981c5c41991c5c419a1c5c419b1c5c419c185c419d185c419e185c419f185c41a0185c41a1185c41a23e5d417a3e5d417b3e5d417c3e5d417d3e5d417e3e5d417f3e5d41803e5d41823e5d41833e5d41843e5d41853e5d41863e5d41873e5d41883e5d41893e5d418a"+
    "3e5d418b3e5d418c0e5d418d1c5d418f1c5d41901c5d41911c5d41921c5d41931c5d41941c5d41951c5d41961c5d41971c5d41981c5d41991c5d419a185d419c185d419d185d419e185d419f185d41a0185d41a1185d41a20f5e416d3e5e417c3e5e417d3e5e417e3e5e417f3e5e4180255e41823e5e41833e5e41843e5e41853e5e41863e5e41873e5e41883e5e41893e5e418a3e5e418b255e418c1c5e418e1c5e41901c5e41911c5e41921c5e41931c5e41941c5e41951c5e41961c5e41971c5e41981c5e4199"+
    "185e419b185e419c185e419d185e419e185e419f185e41a03e5f417c3e5f417d3e5f417e3e5f417f3e5f41803e5f41810e5f41820e5f41833e5f41843e5f41853e5f41863e5f41873e5f41883e5f41893e5f418a1c5f418c1c5f418d1c5f418e1c5f418f1c5f41901c5f41911c5f41921c5f41931c5f41941c5f41951c5f41961c5f4197185f4198185f4199185f419a185f419b185f419f185f41a00f60416b3e60417d3e60417e3e60417f3e6041803e6041813e6041823e6041843e6041853e6041863e604187"+
    "3e6041880e6041891c60418c1c60418d1c60418e1c60418f1c6041901c6041911c6041921c604193186041941c6041951c60419618604197186041991860419c1860419d1860419f3e61417d3e61417e2061417f3e6141803e6141813e6141820e614183256141840e6141850e6141871c61418a1c61418b1c61418c1c61418d1c61418e1c61418f1c6141901861419118614192186141931861419418614195186141961861419c1861419d1861419e0f62416a3e62417c3e62417d3e62417e3e62417f3e624180"+
    "3e6241810e6241821c6241891c62418a1c62418c1c62418d1c62418e1c62418f1c6241901862419218624193186241941862419518624196186241991862419a1862419b1862419c1862419d3e63417c3e63417d3e63417e3e63417f3e634180256341811c6341881c6341891c63418a1c63418b1c63418c1c63418d1c63418e1c63418f1863419118634192186341931863419418634196186341971863419b1863419c3e64417b3e64417c3e64417d3e64417e3e64417f3e6441800e6441811c6441861c644187"+
    "1c6441881c6441891c64418a1c64418b1c64418c1c64418d1c64418f1c6441901864419118644193186441941864419518644196186441971864419b3e65417a3e65417b3e65417c3e65417d3e65417e3e65417f256541801c6541841c6541851c6541861c6541871c6541881c6541891c65418a1c65418b1c65418c1c65418d1c65418e1c65418f1c654190186541931865419518654196186541991865419a3e66417a3e66417b3e66417c3e66417d3e66417e0e66417f256641800e6641812566418218664183"+
    "1c6641841c6641851c6641861c6641871c6641881c6641891c66418a1c66418b1c66418c1c66418e1c66418f1c66419018664191186641921866419318664194186641951866419618664198186641990f6741683e6741793e67417a3e67417b3e67417c2567417d3e67417e3e67417f19674180196741811967418218674183186741841c6741851c6741861c6741871c6741881c6741891c67418a1c67418b1c67418c1c67418d1c67418e1c67418f18674193186741951867419618674197186741980f684167"+
    "3e6841783e6841793e68417a3e68417b3e68417d3e68417e1968417f19684180196841811968418219684183186841841c6841851c6841861c6841871c6841881c6841891c68418a1c68418b1c68418c1c68418d1c68418e1c6841901c68419218684195186841970f6941662769416b0069416c2769416d3e694178206941793e69417a3e69417c3e69417d3e69417e1969417f19694180196941811969418219694183186941841c6941851c6941861c6941871c6941881c69418b1c69418c1c69418d1c69418e"+
    "1c69418f1c6941901c6941911c6941931c6941941869419518694196276a4168276a4169276a416d006a416e276a416f276a41703e6a41773e6a41780e6a41793e6a417a3e6a417b3e6a417c3e6a417d196a417e196a417f196a4180196a4181196a4182196a4183186a41841c6a41851c6a4186186a4187186a41881c6a41891c6a418a1c6a418b1c6a418d1c6a418e1c6a418f1c6a41901c6a41921c6a41931c6a4194186a4195276b415e276b415f006b4163276b4164276b4165276b4166276b4170276b4171"+
    "3e6b41763e6b4177256b41783e6b41793e6b417a206b417b3e6b417c3e6b417d196b417e196b417f366b4180196b4181196b4182196b4183256b4184186b41851d6b4186186b4187186b41881c6b41891c6b418a1c6b418b1c6b418c1c6b418d1c6b418e1c6b418f1c6b41901c6b41911c6b41931c6b4194006c415b006c415c276c4169276c41713e6c41753e6c4176256c41773e6c41783e6c41793e6c417a3e6c417b3e6c417c3e6c417d196c417e196c417f196c4180196c4181196c4182196c41831d6c4184"+
    "1d6c41851d6c41861d6c4187186c41881c6c41891c6c418a1c6c418b1c6c418c1c6c418d1c6c418e1c6c418f1c6c41901c6c41911c6c41921c6c4193276d4159346d4168346d4169266d416a006d41703e6d4174256d41753e6d41763e6d41773e6d41783e6d41793e6d417a3e6d417b3e6d417c3e6d417d3e6d417e196d417f196d4180196d4181196d4182186d41831d6d41841d6d41851d6d4186186d4187186d41881c6d41891c6d418a1c6d418b1c6d418c1c6d418f1c6d41911c6d4192276e4158266e4168"+
    "276e4170256e41710e6e41733e6e41743e6e41753e6e41763e6e41773e6e41783e6e41793e6e417a3e6e417b3e6e417c3e6e417d3e6e417e196e417f366e4180196e41811d6e4182186e4183186e4184186e41851d6e4186186e41871c6e41881c6e41891c6e418a1c6e418b1c6e418e1c6e418f1c6e41901c6e4191276f4156276f41703e6f41713e6f41723e6f41733e6f41743e6f41753e6f41763e6f41773e6f41783e6f41793e6f417a3e6f417b3e6f417c3e6f417d196f417e196f417f196f4180256f4181"+
    "1c6f41821d6f41831d6f41841d6f41851c6f41861c6f41871c6f41881c6f41891c6f418a1c6f418d1c6f418f277041552770416f3e7041703e7041713e7041723e704173207041743e7041753e7041763e7041773e7041783e7041792070417a3e70417b3e70417c1970417d1970417e0e70417f1c70418018704181187041821d7041831d7041841c7041851c704187187041891870418a1870418b1870418c1c70418d1c70418e27714154107141582771416e3e71416f3e7141703e7141713e7141723e714173"+
    "3e7141743e7141753e7141763e7141773e7141783e7141793e71417a3e71417b3e71417c1971417d0e71417e1c71417f187141801d7141811d7141821d714183187141841c7141861871418718714188187141891871418a1871418b1871418c1871418d1871418e277241530c7241571072415927724161357241623572416333724164277241652772416d3e72416e3e72416f3e7241703e7241713e7241723e7241733e7241743e7241753e7241763e7241773e7241783e7241792572417c1872417f1d724180"+
    "1d7241811d7241821872418318724185187241861872418718724188187241891872418a1872418b1872418d2773415210734155357341601b734164217341652773416c3e73416d3e73416e3e73416f3e7341703e7341712573417225734173257341740e7341750e734176257341781c73417e1d73417f1d7341801d7341811873418218734183187341851873418718734188187341891873418b1c73418c27744150107441563374415f2774416335744164277441652774416c3e74416d3e74416e25744170"+
    "1874417d1874417e1d74417f1d744180187441811c744182187441841874418518744186187441881c74418a1c74418b26744197267441992674419a2674419c2775414f3375415e357541642775416b0e75416d2975417a1d75417b1875417c1875417d1d75417e1d75417f1c7541801c7541811c7541821c754183187541851c7541861c7541871c7541881c7541891c75418a267541972776414e237641573576415d1b764163217641642776416a297641791d76417a1d76417b1d76417c1d76417d1876417e"+
    "1876417f1c7641801c7641811c7641821c7641841c7641851c7641861c7641871c76418927764196267641972777414d3577415c0977415d3577416227774169297741781d7741791d77417a1d77417b1d77417c1d77417d1d77417e1d77417f1c774180187741811c7741821c7741831c7741851c7741861c77418726774194267741962778414c1078414e1078414f10784150107841511078415210784153107841542778415b1b78415c3578415d3c78415e3c7841602778416127784166277841692778416d"+
    "2778416e107841721c78417718784178187841791878417a1878417b1d78417c1d78417d1d78417e1878417f1c7841801c7841811c7841821c7841831c7841841c7841851c7841861c78418726784194267841952779414a1079414d2e79414e2e79414f2e7941502e7941512e794152107941532179415c3c79415d3c79415e3c79415f1079416b2779416e2779416f187941761979417719794178197941791879417a1d79417b1d79417c1d79417d1879417e1c79417f1c7941811c7941821c7941831c794184"+
    "1c7941862679418d26794190267941930f7941a8277941b6107a414c2e7a414d117a414e2e7a414f2e7a41502e7a4151107a4152277a416f257a4171257a4173197a4174197a4175197a4176197a4177197a4178197a4179197a417a197a417b197a417c187a417d187a417e1c7a417f1c7a41811c7a41831c7a41841c7a4185267a418d277a418e267a4190267a4191277a41b5277b414a0e7b414b0e7b414c0e7b414d0e7b414e337b414f337b41500e7b4151277b4152277b416f197b4170197b4171197b4172"+
    "197b4173197b4174197b4175197b4176197b4177197b4178197b4179197b417a197b417b197b417c197b417d187b417e1c7b417f1c7b4180187b41811c7b41831c7b4184267b418b267b418d267b418e267b418f0f7b419a0f7b41a7277b41b40e7b41b6127c414a0d7c414b337c4151267c4159107c4162267c416a277c416e197c416f197c4170197c4171197c4172197c4173197c4174197c4175197c4176197c4177367c4178197c4179197c417a197c417b197c417c197c417d187c417e187c417f187c4180"+
    "1c7c41811c7c41821c7c4183267c418a0f7c41a6277c41b20e7c41b5067d414c337d4150107d4155267d415c277d416d197d416e197d416f197d4170197d4171197d4172197d4173197d4174197d4175197d4176197d4177197d4178197d4179197d417a197d417b197d417c187d417d187d417e187d417f187d4180187d4181187d4182277d4189267d418d0f7d41990f7d41a5277d41b00e7d41b4017d41b5067d41b6327e414a057e414b127e414c1a7e414d0d7e414e0e7e414f277e41550e7e41560e7e4157"+
    "0e7e4158277e4159107e4164107e4165107e4166107e4167107e4168277e416b197e416c197e416d367e416e197e416f197e4170197e4171197e4172197e4173197e4174197e4175197e4176197e4177197e4178197e4179197e417a197e417b187e417c187e417d187e417e187e417f187e4180187e4181277e4188277e4189267e418c267e418e267e418f267e41900f7e419a277e41a6277e41a7277e41a8277e41ad277e41ae0e7e41b3017e41b4067e41b5247e41b6277f414a3c7f414b0a7f414c3c7f414d"+
    "277f414e0e7f4154287f4155287f4156287f41570e7f4158107f41632e7f41642e7f41652e7f4166107f4167277f416a197f416b197f416c197f416d197f416e197f416f197f4170197f4171197f4172197f4173197f4174197f4175197f4176197f4177197f4178197f4179197f417a187f417b187f417c187f417d187f417e187f417f187f4180267f418c277f418d267f418f267f41900f7f419c0f7f419d277f41a3277f41a4277f41a8277f41a9277f41aa277f41ab0e7f41b2017f41b3067f41b4247f41b5"+
    "0e7f41b63c80414a3c80414b3c80414c2980414f29804150298041510e8041532880415428804155288041560e80415710804162118041632e8041642e804165108041662680416718804168198041691980416a1980416b1980416c1980416d1980416e1980416f198041701980417119804172198041731980417436804175198041761980417719804178198041791880417a1880417b1880417c1880417d1880417e1880417f2680418a2680418d0f80419d0f80419e278041a1278041b10e8041b20e8041b3"+
    "0e8041b4278041b51881414d1d81414e1d81414f18814150188141510e8141522881415328814154288141550e814156268141572781415d0e81415e3381415f33814160278141610e8141620e81416333814164278141651c81416619814168198141691981416a1981416b1981416c1981416d1981416e1981416f198141701981417119814172198141731981417419814175198141761981417719814178188141791881417a1881417b1881417c1881417d1881417e0f81419e2781419f1c8141b21c8141b3"+
    "1c8141b41c8141b51c8141b61882414a1882414b1882414c1d82414d1d82414e1882414f1d8241502782415128824152288241532882415427824155278241560e82415c05824161328241620e8241641c824165188241661982416719824168198241691982416a1982416b1982416c1982416d1982416e1982416f19824170198241711982417219824173198241741982417519824176188241771c824178188241791882417a1882417b1882417c1882417d2782419e1c8241b0188241b1188241b4188241b5"+
    "188241b61c83414a1883414b1d83414c1d83414d1d83414e1d83414f0e834150288341512883415228834153288341540e8341552983415729834158298341590e83415b2a83415c068341600e8341631c8341641c834165188341661983416719834168198341691983416a1983416b1983416c1983416d1983416e1983416f198341701983417119834172198341731983417419834175188341761c8341771c8341781c8341791883417a1883417b1883417c108341992783419d268341a2188341a9188341aa"+
    "1c8341ac1c8341ad188341ae1c8341af188341b0188341b1188341b2188341b3188341b4188341b5188341b61884414a1d84414b1d84414c1d84414d1d84414e0e84414f288441502884415128844152288441530e84415418844155188441561d8441571d844158188441590e84415a2a84415b06844160018441610e8441621c8441631c84416418844165198441661984416736844168198441691984416a1984416b1984416c1984416d1984416e1984416f1984417019844171198441721984417318844174"+
    "1c8441751c8441761c8441771c844178188441791884417a1884417b2784419c188441a7188441a8188441a9188441aa188441ab188441ac188441ad188441ae1c8441af188441b3188441b4188441b5188441b61885414a1885414b1885414c1885414d0e85414e2885414f2885415028854151288541520e854153188541541d8541551885415618854157188541580e8541590d85415a0685415f018541600e8541611c8541621c8541631885416419854165198541661985416719854168198541691985416a"+
    "1985416b1985416c3685416d1985416e1985416f1985417019854171188541721c8541731c8541741c8541751c8541761c85417718854178188541791885417a298541a51d8541a61d8541a71d8541a81d8541a91d8541aa188541ab1d8541ac188541ad188541ae188541b0188541b1188541b2188541b3188541b4188541b5188541b61886414a1886414b0e86414d2886414e2886414f28864150288641510e864152188641531d8641541d8641551d864156188641570e864158068641590586415a0586415b"+
    "0686415c3a86415d1a86415e3a86415f0e8641601c8641611c864162188641631986416419864165198641661986416719864168198641691986416a1986416b1986416c1986416d1986416e1886416f188641701c8641711c8641721c8641731c8641741c8641751c8641761c86417718864178188641790f86418e0e864190298641a41d8641a5188641a6188641a7188641a81d8641a91d8641aa1d8641ab1d8641ac188641ad188641af188641b2188641b3188641b4188641b5188641b61887414a1887414b"+
    "0e87414c2887414d2887414e2887414f288741500e8741511887415218874153188741541887415518874156278741570e8741580e8741590e87415a2787415b3c87415c0a87415d3c87415e2787415f1c8741601887416119874162198741631987416419874165198741661987416719874168198741691987416a1987416b1887416c1887416d1c87416e1c87416f1c8741701c8741711c874172188741731c8741741c8741751c8741761c874177188741780f87418c258741900e874191298741a31d8741a4"+
    "188741a51d8741a61d8741a7188741a81d8741a91d8741aa1d8741ab188741ac188741ad188741ae188741af188741b0188741b1188741b2188741b3188741b4188741b5188741b61888414a2788414b0e88414c0e88414d0e88414e0e88414f278841501888415118884152188841531888415418884155188841561888415718884158188841591888415a3c88415b3c88415c3c88415d1c88415e1c88415f18884160198841611988416219884163198841641988416519884166198841671988416819884169"+
    "1888416a1888416b1888416c1888416d1c88416e1c88416f1c8841701c8841711c8841721c8841731c8841741c8841751c884176188841770f8841880e8841910e884193258841952588419625884197278841981088419a188841a3188841a4188841a5188841a6188841a7188841a8188841a9188841aa188841ab188841ac188841ad188841ae188841b0188841b1188841b2188841b3188841b4188841b5188841b61889414a1889414b1889414c1889414d1889414e1889414f188941501889415118894152"+
    "188941531889415418894155188941560e8941570e894158188941591889415a1c89415b1c89415c1c89415d1c89415e1889415f198941601989416119894162198941631989416419894165198941661989416719894168188941691889416a1889416b1889416c1889416d1c89416e1c89416f1c8941701c8941711c8941721c8941731c89417418894175188941760f8941850f8941863e8941903e8941911989419219894193198941941989419519894196278941972789419b0e89419c3389419d3389419e"+
    "2789419f0e8941a0278941a1188941a3188941a4188941a6188941ab188941ac188941ae188941af188941b0188941b1188941b2188941b3188941b4188941b5188941b6188a414a188a414b188a414c188a414d188a414e188a414f188a4150188a4151188a4152188a41540e8a41553d8a41563d8a41570e8a4158188a41591c8a415a1c8a415b1c8a415c1c8a415d188a415e198a415f198a4160198a4161368a4162198a4163198a4164198a4165198a4166188a4167188a4168188a4169188a416a188a416b"+
    "188a416c188a416d1c8a416e1c8a416f1c8a41701c8a41711c8a41721c8a4173188a4174188a41750f8a41833e8a418e3e8a418f3e8a4190198a4191198a4192198a4193198a4194278a41951c8a41990e8a419a058a419b228a419f0e8a41a01c8a41a11c8a41a2188a41a5188a41a7188a41aa188a41ac188a41ad188a41ae188a41af188a41b0188a41b1188a41b2188a41b3188a41b4188a41b5188a41b6188b414a188b414b188b414d188b414e188b414f188b4150188b4152188b41530e8b41543d8b4155"+
    "3d8b41560e8b4157188b4158188b4159188b415a188b415b188b415c188b415d188b415e198b415f198b4160198b4161198b4162198b4163198b4164198b4165188b4166188b4167188b4168188b4169188b416a188b416b188b416c1c8b416d1c8b416e1c8b416f1c8b41701c8b41711c8b41721c8b41731c8b41743e8b418d3e8b418e3e8b418f198b4190198b4191198b4192198b4193278b41941c8b41951c8b41961c8b41971c8b41980e8b4199068b419a278b419d278b419f1c8b41a01c8b41a11c8b41a2"+
    "1c8b41a3188b41a4188b41a6188b41a7188b41a8188b41aa188b41ab188b41ad188b41ae188b41af188b41b0188b41b1188b41b2188b41b3188b41b4188b41b5188c414a188c414b188c414c188c414d188c414e188c4152188c41530e8c41540e8c4155188c4156188c4157188c4158188c415a188c415b188c415d188c415e188c415f198c4160198c4161198c4162198c4163198c4164188c4165188c4166188c4167188c4168188c4169188c416a188c416b1c8c416c1c8c416d1c8c416e1c8c416f1c8c4170"+
    "1c8c41711c8c41721c8c41730f8c417f3e8c418c3e8c418d3e8c418e3e8c418f198c4190198c4191198c4192188c41931c8c41941c8c41951c8c41961c8c41970e8c4198128c41991a8c419a0d8c419b1e8c419c1e8c419d0e8c419e1c8c419f1c8c41a01c8c41a1188c41a2188c41a5188c41a6188c41a7188c41a8188c41a9188c41aa188c41ac188c41ad188c41ae188c41af188c41b0188c41b1188c41b2188c41b3188c41b4188c41b5188d414a188d414b188d414c188d414d188d414f188d4150188d4151"+
    "188d4152188d4153188d4154188d4155188d4156188d4157188d415b188d415c188d415d188d415f198d4160198d4161198d4162188d4163188d4164188d4165188d4166188d4167188d4168188d4169188d416a1c8d416b1c8d416c1c8d416d1c8d416e1c8d416f1c8d41701c8d41711c8d41723e8d418a3e8d418b208d418c3e8d418d3e8d418e198d418f368d4190198d4191188d41921c8d41931c8d41941c8d41951c8d4196278d41973c8d41980a8d41993c8d419a0e8d419b0e8d419c278d419d1c8d419e"+
    "1c8d419f1c8d41a0188d41a2188d41a6188d41a7188d41a9188d41aa188d41ab188d41ac188d41ad188d41ae188d41af188d41b0188d41b1188d41b2188d41b3188d41b4188d41b6188e414a188e414b188e414c188e414d188e414e188e4150188e4151188e4153188e4154188e4155188e4159188e415b188e415c188e415e198e415f198e4160198e4161188e4162188e4163188e4164188e41651c8e4166188e4167188e4168188e41691c8e416a1c8e416b1c8e416c1c8e416d1c8e416e1c8e416f1c8e4170"+
    "1c8e41710f8e417d3e8e41883e8e41893e8e418a3e8e418b3e8e418c198e418d198e418e198e418f198e4190198e41911c8e41931c8e41941c8e41951c8e41963c8e41973c8e41983c8e41991c8e419a1c8e419b1c8e419c1c8e419d188e419f188e41a3188e41a4188e41a5188e41a6188e41a7188e41a8188e41a9188e41ab188e41ac188e41ad188e41ae188e41af188e41b0188e41b2188e41b4188e41b5188e41b6188f414a188f414b188f414d188f414e188f414f188f4151188f4152188f4154188f4155"+
    "188f4157188f4158188f4159188f415b188f415c188f415d188f415e188f415f188f4160188f4161188f41621c8f41631c8f41641c8f41651c8f41661c8f4167188f41681c8f41691c8f416a1c8f416b1c8f416c1c8f416d1c8f416e1c8f416f1c8f41703e8f41853e8f41863e8f41873e8f41883e8f41893e8f418a3e8f418b198f418c198f418d198f418e198f418f198f41901c8f41921c8f4193188f4195188f4197188f4199188f419a188f419c188f419d188f41a0188f41a1188f41a3188f41a4188f41a7"+
    "188f41a8188f41aa188f41ab188f41ac188f41ad188f41ae188f41af188f41b0188f41b1188f41b2188f41b4188f41b5188f41b61890414c1890414e18904151189041541890415518904158189041591890415a1890415c1890415d1890415e1890415f189041601c9041611c9041621c9041631c9041641c9041651c9041661c9041671c9041681c9041691c90416a1c90416b1c90416c1c90416d1c90416e1c90416f0f90417c3e9041833e9041843e9041853e9041863e9041873e9041883e9041893e90418a"+
    "1990418b1990418c1990418d1990418e1990418f189041901c9041911890419218904194189041971890419b1890419c1890419f189041a0189041a2189041a5189041a7189041a8189041a9189041aa189041ab189041ae189041af189041b0189041b1189041b2189041b4189041b51891414e1891415218914154189141561891415718914158189141591891415a1891415b1891415c1891415d1891415e1c91415f1c9141601c9141611c9141621c9141631c9141641c9141651c9141661c9141671c914168"+
    "1c9141691c91416a1c91416b1c91416c3e9141823e9141833e9141843e9141853e9141863e9141873e914188199141891991418a1991418b1991418c1991418d1991418e1891418f1c91419018914191189141941891419518914198189141991891419d189141a0189141a2189141a3189141a4189141a5189141a6189141a7189141a8189141a9189141ab189141ac189141b0189141b1189141b3189141b4189141b51892414c1892414e18924150189241511892415318924154189241551892415618924157"+
    "18924158189241591892415a1892415b1892415c1c92415d1892415e1c92415f1c9241601c9241611c9241621c9241631c9241641c9241651c9241661c9241671c9241681c9241693e9241803e9241813e9241823e9241833e9241843e9241853e9241861992418719924188199241891992418a1992418b1992418c1992418d1892418f189241901892419218924193189241951892419d1892419e1892419f189241a0189241a2189241a4189241a5189241a6189241a7189241a8189241a9189241aa189241ab"+
    "189241ac189241ae189241b0189241b2189241b51893414c1893414e18934150189341511893415218934153189341561893415718934158189341591893415a1893415c1c93415d1c93415e1c93415f1c9341601c9341611c9341621c9341631c9341641c9341651c9341661c9341673e93417e3e93417f3e934180209341813e9341823e9341833e9341843e934185199341861993418719934188199341891993418a1993418b1993418c1993418d1893418e1893418f18934190189341911893419218934197"+
    "1893419a1893419b1893419c1893419e1893419f189341a3189341a4189341a5189341a6189341a7189341a8189341a9189341aa189341ab189341b1189341b3189341b41894414a1894414c1894414f189441511894415218944155189441561894415718944158189441591894415a1894415b1c94415c1c94415d1c94415e1c94415f1c9441601c944161189441621c9441631c9441641c9441651c944166259441793e94417c3e94417d3e94417e3e94417f3e9441803e9441813e9441823e9441833e944184"+
    "19944185199441861994418719944188199441891994418a1994418b1994418c1894418d1894418e1894418f189441901894419218944194189441961894419718944198189441991894419a1894419c1894419d1894419f189441a0189441a3189441a4189441a7189441a8189441aa189441ab189441ad1895414c1895414d1895414f1895415018954155189541571895415a1c95415b1c95415c1c95415d1c95415e1c95415f1c954160189541611c9541621c9541631c9541641c9541651c9541660f954173"+
    "259541783e9541793e95417a3e95417b3e95417c3e95417d3e95417e3e95417f3e9541803e9541813e954182199541831995418419954185199541861995418719954188199541891995418a1895418b1895418c1895418e1895418f1895419018954194189541951895419618954197189541991895419b1895419d1895419e1895419f189541a0189541a1189541a2189541a3189541a4189541a6189541a8189541a9189541aa189541ac189541b1189541b31896414b1896414e189641531896415418964155"+
    "1896415718964158189641591c96415a1c96415b1c96415c1c96415d1c96415e1c96415f1c9641601c9641611c9641621c9641631c9641641c9641650f9641710f9641750f9641760e9641773e9641783e9641793e96417a3e96417b3e96417c3e96417d3e96417e3e96417f3e9641803e96418119964182199641831996418419964185369641861996418719964188199641891896418a1896418b1896418c1896418d1896418f1896419018964192189641941896419518964197189641981896419a1896419b"+
    "1896419c1896419e189641a0189641a3189641a5189641a7189641a8189641ac189641af189641b1189641b2189641b3189641b4189641b61897414e1897415118974153189741561c974157189741581c9741591c97415a1c97415b1c97415c1c97415d1c97415e1c97415f1c9741601c9741611c9741621c974163049741680f974170259741773e9741783e9741793e97417a3e97417b3e97417c3e97417d3e97417e3e97417f3e97418019974181199741821997418319974184199741851997418619974187"+
    "18974188189741891897418a1897418b1897418c1897418d1897418e1897419018974191189741921897419318974195189741961897419a1897419b1897419c1897419d1897419e189741a1189741a3189741a4189741a7189741a9189741aa189741ab189741ad189741af189741b0189741b2189741b3189741b61898414b1898414e18984150189841511898415318984154189841551c9841561c9841571c9841581c98415b1c98415c1c98415d1c98415e1c98415f1c9841601c9841613e9841773e984178"+
    "3e9841793e98417a3e98417b3e98417c3e98417d3e98417e3e98417f199841801998418119984182199841831998418419984185189841861898418718984188189841891898418a1898418c1898418d1898418f189841901898419118984192189841931898419418984195189841961898419a1898419c1898419d189841a3189841a6189841a7189841a8189841a9189841ac189841ae189841b0189841b1189841b5189841b61899414a1899414b1899414e1899415018994151189941521c9941541c994155"+
    "1c9941561c9941571c99415a1c99415b1c99415c1c99415d1c99415e1c99415f3e9941773e994178209941793e99417a3e99417b3e99417c3e99417d1999417e1999417f199941801999418119994182199941831899418418994185189941861899418718994188189941891899418a1899418c1899418d1899418e1899418f18994191189941931899419418994195189941961899419718994198189941991899419b1899419c1899419d1899419e189941a1189941a2189941a3189941a4189941a5189941a6"+
    "189941ac189941ae189941af189941b0189941b2189941b3189941b4189a414b189a414c189a414d189a4150189a4151189a41521c9a41531c9a41541c9a41551c9a415a1c9a415b1c9a415c1c9a415d3e9a41773e9a41783e9a41793e9a417a3e9a417b199a417c199a417d199a417e369a417f199a4180199a4181199a4182189a4183189a4184189a4185189a4186189a4187189a4188189a4189189a418a189a418b189a418c189a418d189a418e189a418f189a4190189a4192189a4195189a4196189a4198"+
    "189a4199189a419a189a419c189a419f189a41a0189a41a2189a41a3189a41a6189a41a7189a41a8189a41ac189a41ad189a41af189a41b0189a41b4189a41b5189a41b6189b414b189b414d189b414e189b414f189b4150189b41511c9b41521c9b41531c9b41541c9b415a1c9b415b3e9b41743e9b4175259b4176259b4177259b41783e9b4179199b417a199b417b199b417c199b417d199b417e199b417f199b4180199b4181189b4182189b4183189b4184189b4185189b4186189b4187189b4188189b4189"+
    "189b418a189b418b189b418c189b418d189b418e189b418f189b4190189b4191189b4192189b4193189b4194189b4195189b4196189b4197189b4198189b419a189b419b189b419e189b419f189b41a5189b41a6189b41a9189b41aa189b41ac189b41ad189b41af189b41b1189b41b3189b41b4189b41b5189c414a189c414b189c414d189c414e189c414f189c41501c9c41511c9c41520f9c41683e9c41723e9c41733e9c41743e9c41753e9c41763e9c4177259c4178199c417b199c417c199c417d199c417e"+
    "259c417f189c4180189c4181189c4182189c4183189c4184189c4185189c4186189c4187189c4188189c4189189c418a189c418b189c418c189c418d189c418e189c418f189c4190189c4191189c4192189c4193189c4194189c4196189c4197189c4198189c4199189c419a189c419c189c41a1189c41a2189c41a3189c41a8189c41a9189c41aa189c41ab189c41ac189c41af189c41b0189c41b2189c41b5189d414b189d414e189d414f1c9d41501c9d41511c9d41520f9d41673e9d41703e9d41713e9d4172"+
    "3e9d41733e9d41743e9d41753e9d41763e9d41773e9d41783e9d4179259d417a259d417c259d417d199d417e199d417f199d4180189d4181189d4182189d4183189d4184189d4185189d4186189d4187189d4188189d4189189d418a189d418b189d418c189d418d189d418e189d418f189d4190189d4191189d4193189d4194189d4195189d4197189d4198189d4199189d419a189d419b189d419c189d419d189d419e189d419f189d41a2189d41a3189d41a6189d41a7189d41a8189d41a9189d41aa189d41ab"+
    "189d41ac189d41af189d41b0189d41b1189d41b3189d41b4189e414a189e414b189e414c189e414d189e414e1c9e414f1c9e41501c9e41510e9e41653e9e416d3e9e416e3e9e416f3e9e41703e9e41713e9e41723e9e4173209e41743e9e41753e9e41763e9e4177259e41783e9e41793e9e417a3e9e417b3e9e417c199e417d199e417e199e417f199e4180189e4181189e4182189e4183189e4184189e4185189e4186189e4187189e4188189e4189189e418a189e418b189e418c189e418d189e418e189e418f"+
    "189e4192189e4194189e4195189e4196189e4197189e419a189e419b189e419c189e419d189e419e189e419f189e41a0189e41a1189e41a2189e41a3189e41a4189e41a5189e41a6189e41a7189e41a8189e41a9189e41aa189e41ab189e41ae189e41af189e41b1189e41b4189e41b5189e41b6189f414b189f414c189f414d1c9f414e1c9f414f1c9f41501c9f4151259f41643e9f416b3e9f416c3e9f416d3e9f416e3e9f416f3e9f41703e9f41713e9f41723e9f41733e9f4174259f41763e9f41773e9f4178"+
    "3e9f41793e9f417a3e9f417b3e9f417c199f417d199f417e199f417f189f4180189f4181189f4182189f4183189f4184189f4185189f4186189f4187189f4188189f4189189f418a189f418b189f418c189f418d189f418e189f4190189f4191189f4193189f4195189f419a189f419c189f419d189f419e189f419f189f41a0189f41a1189f41a2189f41a3189f41a4189f41a53d9f41a63d9f41a7189f41a8189f41a9189f41ab189f41ad189f41ae189f41af189f41b1189f41b2189f41b3189f41b4189f41b5"+
    "18a0414a18a0414b18a0414c1ca0414d1ca0414e1ca0414f1ca041501ca041510ea041623ea041633ea041643ea041693ea0416a3ea0416b3ea0416c3ea0416d3ea0416e3ea0416f3ea041703ea041713ea0417225a041733ea041743ea041753ea041763ea041773ea041783ea041793ea0417a3ea0417b19a0417c19a0417d19a0417e19a0417f18a0418018a0418118a0418218a0418318a0418418a0418518a0418618a0418718a0418818a0418918a0418a18a0418b18a0418c18a0418e18a0418f18a04193"+
    "18a0419418a0419718a0419818a0419a18a0419b18a0419c18a0419d18a0419e18a041a018a041a118a041a318a041a43da041a53da041a618a041a718a041a818a041a918a041aa18a041ab18a041ac18a041ad18a041ae18a041b018a041b118a041b218a041b41ca041b61ca1414a1ca1414b1ca1414c1ca1414d1ca1414e1ca1414f1ca141500ea141613ea141623ea141633ea141643ea141673ea141683ea141693ea1416a20a1416b3ea1416c3ea1416d3ea1416e3ea1416f3ea141700ea141713ea14172"+
    "3ea141733ea141743ea141753ea141763ea141773ea141783ea141793ea1417a3ea1417b19a1417c19a1417d36a1417e19a1417f19a1418019a1418118a1418218a1418318a1418418a1418518a1418618a1418718a1418818a1418918a1418a18a1418b18a1418c18a1418d18a1418e18a1418f18a1419718a1419818a1419a18a1419b18a1419c18a1419d18a1419e18a1419f18a141a018a141a118a141a218a141a318a141a418a141a518a141a618a141a718a141a818a141aa18a141ab18a141ad18a141ae"+
    "18a141af18a141b018a141b118a141b218a141b31ca141b41ca141b51ca141b61ca2414a1ca2414b1ca2414c1ca2414d1ca2414e1ca2414f3ea2416120a241623ea241633ea241643ea241653ea241663ea241673ea241683ea241693ea2416a3ea2416b3ea2416c3ea2416d3ea2416e3ea2416f3ea241713ea241723ea241733ea241743ea2417520a241763ea241773ea241783ea241793ea2417a19a2417b19a2417c19a2417d19a2417e19a2417f19a2418018a2418118a2418218a2418318a2418418a24185"+
    "18a2418618a2418718a2418818a2418918a2418a18a2418c18a2418d18a2418e18a2418f18a2419118a2419218a2419418a2419518a2419718a2419818a2419a18a2419c18a2419d18a2419e18a241a018a241a118a241a218a241a318a241a418a241a518a241a618a241a718a241a818a241a918a241aa18a241ab18a241ad18a241ae18a241af18a241b018a241b118a241b21ca241b31ca241b41ca241b51ca241b61ca3414a1ca3414b1ca3414c1ca3414d1ca3414e1ca3414f25a3415f3ea341603ea34161"+
    "3ea341623ea341633ea3416420a341653ea341663ea341673ea341683ea341693ea3416a3ea3416b3ea3416c3ea3416d0ea3416e3ea3416f3ea341703ea3417120a341723ea341733ea341743ea341753ea341763ea341773ea341783ea3417919a3417a19a3417b19a3417c19a3417d19a3417e19a3417f18a3418018a3418118a3418218a3418318a3418418a3418518a3418618a3418718a3418818a3418918a3418b18a3418c18a3418e18a3418f18a3419018a3419118a3419218a3419318a3419418a34195"+
    "18a3419618a3419918a3419b18a3419c18a3419d18a3419f18a341a118a341a318a341a418a341a718a341a91ca341ab1ca341ac1ca341ae1ca341af1ca341b01ca341b11ca341b21ca341b31ca341b41ca341b51ca341b61ca4414a1ca4414b1ca4414c1ca4414d25a4415f3ea441603ea441613ea441623ea441633ea441643ea441653ea441663ea441673ea441683ea441693ea4416a3ea4416b3ea4416c25a4416d3ea4416e3ea4416f3ea441703ea441713ea441723ea441733ea441743ea441753ea44176"+
    "3ea441773ea4417819a4417919a4417a19a4417b19a4417c19a4417d19a4417e18a4417f18a4418018a4418118a4418218a4418318a4418418a4418518a4418618a4418718a4418818a4418918a4418a18a4418c18a4418d18a4418f18a4419118a4419218a4419318a4419518a4419618a4419718a4419818a4419918a4419c18a4419d18a4419e18a441a018a441a118a441a418a441a518a441a61ca441a71ca441a81ca441a91ca441ab1ca441ac1ca441ae1ca441af1ca441b01ca441b11ca441b21ca441b6"+
    "1ca5414a1ca5414b1ca5414c0ea541603ea541613ea541623ea541633ea541643ea541653ea541663ea541673ea541683ea541693ea5416a0ea5416b0ea5416c3ea5416d3ea5416e3ea5416f3ea541703ea541713ea541723ea541733ea541743ea541753ea5417619a5417719a5417819a5417919a5417a19a5417b19a5417c19a5417d18a5417e18a5417f18a5418018a5418118a5418218a5418318a5418418a5418518a5418618a5418718a5418818a5418918a5418a18a5418b18a5418c18a5418d18a5418e"+
    "18a5418f18a5419018a5419118a5419218a5419318a5419418a5419518a5419618a5419718a5419818a5419918a5419a18a5419b18a5419c18a5419d18a5419f18a541a018a541a118a541a218a541a318a541a418a541a51ca541a61ca541a71ca541a81ca541a91ca541b60ea6416025a6416125a641623ea641633ea641643ea641653ea6416625a641670ea641693ea6416c3ea6416d3ea6416e3ea6416f3ea641703ea641713ea641723ea6417319a6417419a6417519a6417619a6417719a6417819a64179"+
    "19a6417a19a6417b19a6417c19a6417d18a6417e18a6417f18a6418018a6418118a6418218a6418318a6418418a6418618a6418718a6418d18a6418e18a6418f18a6419018a6419118a6419318a6419418a6419518a6419618a6419718a6419818a6419918a6419b18a6419d18a6419e18a6419f18a641a018a641a118a641a218a641a41ca641a527a641a71ca641a80ea7416225a741630ea7416425a7416b3ea7416c3ea7416d3ea7416e3ea7416f3ea741703ea7417119a7417219a7417319a7417419a74175"+
    "19a7417619a7417719a7417836a7417919a7417a19a7417b19a7417c18a7417d18a7417e18a7417f18a7418018a7418118a7418218a7418418a7418518a7418618a7418718a7418818a7418918a7418a18a7418b18a7418c18a7418d18a7418e18a7418f18a7419018a7419218a7419318a7419418a7419518a7419618a7419718a7419818a7419b18a7419d18a7419e18a7419f18a741a018a741a11ca741a327a741a527a741a627a741a727a741a827a741b525a8416a3ea8416b20a8416c3ea8416d3ea8416e"+
    "3ea8416f19a8417019a8417119a8417219a8417319a8417419a8417519a8417619a8417719a8417819a8417919a8417a19a8417b18a8417c18a8417d18a8417e18a8417f18a8418018a8418118a8418218a8418318a8418418a8418618a8418718a8418818a8418918a8418a18a8418b18a8418c18a8418e18a8418f18a8419018a8419118a8419218a8419318a8419418a8419518a8419618a8419718a8419818a8419c18a8419d18a8419e18a841a018a841a11ca841a21ca841a31ca841a427a841a627a841b3"+
    "27a841b427a841b527a841b63ea9416a3ea9416b3ea9416c19a9416d19a9416e19a9416f36a9417019a9417119a9417219a9417319a9417419a9417519a9417619a9417719a9417819a9417919a9417a19a9417b18a9417c18a9417d18a9417e18a9417f18a9418018a9418118a9418218a9418418a9418618a9418818a9418918a9418a18a9418c18a9418d18a9418e18a9418f18a9419018a9419118a9419218a9419318a9419418a9419518a9419618a9419718a9419818a9419918a9419a18a9419b18a9419c"+
    "18a9419d18a9419e18a9419f1ca941a01ca941a127a941a527a941b41caa416825aa41693eaa416a19aa416b19aa416c19aa416d19aa416e19aa416f19aa417019aa417119aa417219aa417319aa417419aa417519aa417619aa417719aa417819aa417919aa417a18aa417b18aa417c18aa417d18aa417e18aa417f18aa418118aa418218aa418318aa418418aa418518aa418618aa418718aa418918aa418b18aa418c18aa418d18aa418e18aa418f18aa419018aa419118aa419218aa419318aa419418aa4195"+
    "18aa419618aa419818aa419918aa419a18aa419c18aa419e1caa419f1caa41a027aa41b31cab41631cab41641cab41661cab41671cab416818ab416a19ab416b19ab416c19ab416d19ab416e19ab416f19ab417019ab417119ab417219ab417319ab417419ab417519ab417619ab417719ab417818ab417918ab417a18ab417b18ab417c18ab417d18ab418018ab418118ab418218ab418418ab418518ab418618ab418718ab418818ab418918ab418a18ab418b18ab418c18ab418d18ab418e18ab418f18ab4190"+
    "18ab419118ab419218ab419318ab419418ab419518ab419618ab419718ab419818ab419c1cab419e1cab419f1cab41a01cac41631cac41641cac41651cac41661cac41671cac41681cac416918ac416a18ac416b18ac416c19ac416d19ac416e19ac416f19ac41701cac41711cac41721cac417318ac417418ac417518ac417618ac41771cac41781cac41791cac417a18ac417b18ac417c18ac417d18ac417e18ac417f18ac418118ac418218ac418318ac418418ac418518ac418618ac418718ac418818ac4189"+
    "18ac418a18ac418b18ac418c18ac418d18ac418e18ac418f18ac419018ac419118ac419218ac419318ac419418ac419518ac419618ac419718ac419818ac419918ac419a1cac419b1cac419c1cac419e1cac419f1cad41601cad41611cad41621cad41631cad41641cad41651cad41661cad41671cad41681cad41691cad416a1cad416b18ad416c18ad416d18ad416e18ad416f1cad41701cad41711cad41721cad41731cad41741cad41751cad41761cad41771cad41781cad417918ad417a18ad417c18ad417d"+
    "18ad417e18ad417f18ad418018ad418118ad418418ad418518ad418618ad418718ad418818ad418918ad418a18ad418b18ad418c18ad418d18ad418e18ad418f18ad419018ad419118ad419218ad419318ad419418ad419518ad419618ad41971cad41981cad41991cad419a1cad419b1cad419c1cad419d1cad419e1cae41601cae41611cae41621cae41631cae41641cae41651cae41661cae41671cae41681cae41691cae416a1cae416b1cae416c1cae416d1cae416e1cae416f1cae41701cae41711cae4172"+
    "1cae41731cae41741cae41751cae41761cae41771cae41781cae417918ae417a18ae417b18ae417c18ae417d18ae417e18ae417f18ae418018ae418218ae418318ae418418ae418518ae418618ae418718ae418818ae418918ae418a18ae418b18ae418c18ae418d18ae418e18ae418f18ae419018ae419118ae419218ae41931cae41941cae41951cae41961cae41971cae41981cae41991cae419a1cae419b1cae419c1cae419d1caf41641caf41651caf41661caf41671caf41681caf41691caf416a1caf416b"+
    "1caf416c1caf416d1caf416e1caf416f1caf41701caf41711caf41721caf41731caf41741caf417618af417718af417918af417a18af417b18af417c18af417d18af417e18af418018af418118af418218af418318af418418af418518af418618af418718af418818af41891caf418a18af418b18af418c18af418d18af418e18af418f18af419018af41911caf41921caf41931caf41941caf41951caf41961caf41971caf41981caf41991caf419a1caf419b1caf419c1cb041631cb041641cb041651cb04166"+
    "1cb041671cb041681cb041691cb0416a1cb0416b1cb0416c1cb0416d1cb0416e1cb0416f1cb041701cb041711cb041721cb0417318b0417418b0417618b0417718b0417818b0417918b0417a18b0417b18b0417c18b0417d18b0417f18b0418018b0418118b0418218b0418318b0418418b0418518b0418618b041871cb0418818b0418918b0418a18b0418b18b0418c18b0418d1cb0418e18b0418f1cb041901cb041911cb041921cb041931cb041941cb041951cb041961cb041971cb041981cb041991cb0419a"+
    "1cb0419b04b141581cb141631cb141641cb141651cb141661cb141671cb141681cb141691cb1416a1cb1416b1cb1416c1cb1416d1cb1416e1cb1416f1cb141701cb1417118b1417218b1417318b1417418b1417518b1417718b1417818b1417918b1417a18b1417b18b1417c18b1417d1cb1417f18b1418018b1418118b1418218b1418318b141841cb141851cb141861cb141871cb141881cb141891cb1418a1cb1418b1cb1418c18b1418d18b1418e1cb1418f1cb141901cb141911cb141921cb141931cb14194"+
    "1cb141951cb141961cb141971cb141981cb141991cb1419a1cb241651cb241661cb241671cb241681cb241691cb2416a1cb2416b1cb2416c1cb2416d18b2416e18b2416f18b2417018b2417218b2417318b2417418b2417518b2417718b2417818b241791cb2417a1cb2417c1cb2417d1cb2417e18b2417f18b2418018b2418118b2418218b241831cb241841cb241851cb241861cb241871cb241881cb241891cb2418a1cb2418b1cb2418c1cb2418d1cb2418e1cb2418f1cb241901cb241911cb241921cb24193"+
    "1cb241941cb241951cb241961cb241971cb241981cb241991cb2419a1cb341641cb341651cb341661cb341671cb341681cb341691cb3416a1cb3416b1cb3416c18b3416d18b3416e18b3416f18b3417118b3417318b3417418b3417518b3417618b341771cb341781cb341791cb3417b1cb3417c1cb3417d18b3417f18b3418018b3418118b341821cb341831cb341841cb341851cb341861cb341871cb341881cb341891cb3418a1cb3418b1cb3418c1cb3418d1cb3418e1cb3418f1cb341901cb341911cb34192"+
    "1cb341931cb341941cb341951cb341961cb341971cb341981cb341991cb441631cb441641cb441651cb4416618b441671cb441681cb441691cb4416a1cb4416b18b4416c18b4416d18b4416e18b4416f18b4417118b4417218b4417318b441741cb441761cb441771cb441781cb4417a1cb4417b1cb4417c1cb4417d1cb4417e1cb4417f1cb441801cb441811cb441821cb441831cb441841cb441851cb441861cb441871cb441881cb441891cb4418a1cb4418e1cb4418f1cb441901cb441911cb441921cb44193"+
    "1cb441941cb441951cb441961cb441971cb4419827b441ab1cb541611cb541621cb541631cb541641cb541651cb541661cb541671cb541681cb5416918b5416a18b5416b18b5416c18b5416d18b5416e18b541711cb541731cb541741cb541751cb541761cb541771cb541781cb541791cb5417a1cb5417b1cb5417c1cb5417d1cb5417e1cb5417f1cb541801cb541811cb541821cb541831cb541841cb541851cb541861cb541871cb541881cb541891cb5418e1cb5418f1cb541901cb541911cb541921cb54193"+
    "1cb541941cb541951cb541961cb5419727b541aa1c4a42b31c4a42b41c4a42b51c4b42b31c4c42b11c4c42b21c4d42b01c4d42b11c4d42b21c4e42af1c4e42b01c4f42ae1c4f42af0f50428e0f5042900f5042921c5042ac1c5042ad1c5042ae1c5042af0f5142920f5142931c5142aa1c5142ad1c5142ae0f5242890f52428a0f5242930f5342870f5442920f5642830f5642940f57427f0f5742800f5742820f5742930f584280255842930f5942801c5942a01c5942a11c5942a21c5942a40f5a4280255a4291"+
    "1c5a42a11c5a42a21c5a42a41c5a42a50f5b42801c5b429f1c5b42a01c5b42a11c5b42a31c5b42a40f5c42811c5c429d1c5c429e1c5c429f1c5c42a01c5c42a11c5c42a2255d428d1c5d429c1c5d429d1c5d429e1c5d429f1c5d42a01c5d42a11c5d42a20f5e42810f5e4282255e428c1c5e429b1c5e429c1c5e429d1c5e429e1c5e429f1c5e42a00f5f4282255f428b1c5f42981c5f42991c5f429a185f429b185f429f185f42a01c6042941c6042971c6042991860429c1860429d1860429f0f6142850f614286"+
    "1c6142911c6142921c6142931c6142941c6142951c6142961861429c1861429d1861429e0f6242821c6242921c6242931c6242941c6242951c6242961c6242991c62429a1c62429b1c62429c1862429d0f6342811c6342911c6342921c6342931c6342941c6342961c6342971c63429b1c63429c0f6442811c6442911c6442931c6442941c6442951c6442961c6442971c64429b1c6542931c6542951c6542961c6542991c65429a0f66427f25664282256642831c6642911c6642921c6642931c6642941c664295"+
    "1c6642961c6642981c6642990f67427d3e6742803e6742813e67428225674283256742841c6742931c6742951c6742961c6742971c6742983e68427f3e6842803e6842813e6842823e6842831c6842951c6842973869426b3869426c3869426d3e69427f3e6942803e6942813e6942823e694283256942841c6942951c694296386a4268006a4269006a426d386a426e386a426f006a42700f6a42793e6a427e3e6a427f3e6a42803e6a42813e6a42823e6a42831c6a4295006b425e386b425f386b4263386b4264"+
    "276b4265006b4266266b4269386b4270386b42713e6b427e3e6b427f206b42803e6b42813e6b42823e6b4283256b4284386c425b386c425c346c4267276c4268346c4269266c426a266c426b006c42710f6c42773e6c427e3e6c427f3e6c42803e6c42813e6c42823e6c4283386d4259346d4269266d426a266d426b386d42703e6d427f3e6d42803e6d42813e6d4282006e4258266e4264266e4267346e4268266e4269276e42700f6e42710f6e42723e6e427f206e42803e6e4281386f4256266f4267276f4270"+
    "3e6f427e3e6f427f3e6f42800e6f4281007042550070426f3e70427d3e70427e2570427f1c7042891c70428a1c70428b1c70428c387142540f714257107142580f71425a167142611671426216714266167142672771426e3e71427d2571427e1c7142871c7142881c7142891c71428a1c71428b1c71428c1c71428d1c71428e277242530c72425710724259167242602772426135724262357242633572426427724265157242662772426d0f72427a0f72427b0e72427c1c7242851c7242861c7242871c724288"+
    "1c7242891c72428a1c72428b1c72428d27734252107342551573425f35734260357342641773426515734266167342672773426c0f7342730f7342740f7342781c7342851c7342871c7342881c7342891c73428b2673429a2673429b277442500f744254107442560f7442571774425e3574425f277442633574426427744265167442662774426c0f74426f1074427e1c7442841c7442851c7442861c7442880075424f1775425d3575425e357542640075426b0f75426d1c75428527754298267542992776424e"+
    "1576425c3576425d357642632776426a2676429526764297267642992676429a2777424d1677425b3577425c35774262347742663477426727774269267742942777429526774296267742972778424c1678425a2778425b3578425c3578425d3c78425e3c784260277842611678426227784266007842692778426d2778426e23784272257842780e7842792678428c26784292267842962779424a167942591679425a3c79425d3c79425e3c79425f1679426016794261267942632379426b0079426e2779426f"+
    "0e794275257942763e7942773e7942783e7942792579427a2679428a2679428f2679429026794293277942b6217a424e277a426f3e7a42743e7a42753e7a42763e7a42773e7a42783e7a42793e7a427a3e7a427b3e7a427c257a427d257a427e267a428d277a428f267a4291267a4292277a42b5277b424a357b424b357b424c1b7b424d357b424e337b424f337b4250357b4251277b4252277b426f3e7b42703e7b42713e7b42723e7b42733e7b42743e7b42753e7b42763e7b42773e7b42783e7b42793e7b427a"+
    "3e7b427b3e7b427c3e7b427d1c7b4281267b4288267b428a267b428b277b428c267b428d267b428e267b4291277b42b4357b42b6337c4251237c4262277c426e3e7c426f3e7c42703e7c42713e7c42723e7c42733e7c42743e7c42753e7c42763e7c4277207c42783e7c42793e7c427a3e7c427b3e7c427c3e7c427d0e7c427e1c7c427f1c7c4280277c4289267c428b267c428d267c428e267c4290277c42b2217c42b41b7c42b5337d4250237d4255277d426d3e7d426e3e7d426f3e7d42703e7d42713e7d4272"+
    "3e7d42733e7d42743e7d42753e7d42763e7d42773e7d42783e7d42793e7d427a3e7d427b3e7d427c0e7d427d1c7d427e1c7d427f1c7d42801c7d42811c7d4282277d4289267d428b267d428c267d428e267d4290267d4291277d42b0357d42b4097e424a357e424f277e4255357e4256357e4257357e4258277e4259277e426b3e7e426c3e7e426d207e426e3e7e426f3e7e42703e7e42713e7e42723e7e42733e7e42743e7e42753e7e42763e7e42773e7e42783e7e42793e7e427a3e7e427b1c7e427d1c7e427e"+
    "1c7e427f1c7e42801c7e4281277e4288277e4289267e428a267e428b277e428d267e428e267e428f277e42a6277e42a7277e42a8007e42ad277e42ae357e42b3277f424a3c7f424b3c7f424d277f424e357f4254207f4255207f4256207f4257357f4258277f426a3e7f426b3e7f426c3e7f426d3e7f426e3e7f426f3e7f42703e7f42713e7f42723e7f42733e7f42743e7f42753e7f42763e7f42773e7f42783e7f42793e7f427a0e7f427b1c7f427c1c7f427d1c7f427e1c7f427f1c7f4280277f428e267f4290"+
    "267f4291277f42a3007f42a4277f42a8277f42a9277f42aa277f42ab357f42b2357f42b63c80424a3c80424b3c80424c3580425320804254208042552080425635804257278042683e8042693e80426a3e80426b3e80426c3e80426d3e80426e3e80426f3e8042703e8042713e8042723e8042733e804274208042753e8042763e8042773e8042783e8042792580427a1c80427b1c80427c1c80427d1c80427e1c80427f2680428c2680428d278042a1278042b1358042b21b8042b3358042b4278042b535814252"+
    "2081425420814255358142562781425d0081425e3381425f338142602781426135814262358142633381426427814265278142673e8142683e8142693e81426a3e81426b3e81426c3e81426d3e81426e3e81426f3e8142703e8142713e8142723e8142733e8142743e8142753e8142763e8142773e8142781c81427a1c81427b1c81427c1c81427d1c81427e2681428d2781429f218142b21082424c278242512082425427824255278242563582425c0982426235824264278242663e8242673e8242683e824269"+
    "3e82426a3e82426b3e82426c3e82426d3e82426e3e82426f3e8242703e8242713e8242723e8242733e8242743e8242753e824276258242771c8242791c82427a1c82427b1c82427c1c82427d2782429e278242b20e8242b30e8242b40e8242b5278242b63383425022834254358342552183425a1b83425b35834263278342663e8342673e8342683e8342693e83426a3e83426b3e83426c3e83426d3e83426e3e83426f3e8342703e8342713e8342723e8342733e8342743e834275258342761c83427a1c83427b"+
    "1c83427c238342992783429d268342aa0e8342b1288342b2288342b3288342b4278342b50e8342b62784424a3384424f2084425335844254108442553584425a2a84425b35844262278442653e8442663e844267208442683e8442693e84426a3e84426b3e84426c3e84426d3e84426e3e84426f3e8442703e8442713e8442723e8442731c8442791c84427a1c84427b0084429c108442a70e8442b0288442b1288442b2288442b3288442b4288442b50e8442b62985424a2985424b2985424c3585424e20854252"+
    "35854253008542592a85425a35854261278542643e8542653e8542663e8542673e8542683e8542693e85426a3e85426b3e85426c2085426d3e85426e3e85426f3e8542703e8542710e8542721c8542781c8542791c85427a0e8542af288542b0288542b1288542b2288542b3288542b40e8542b51d8542b61886424a1d86424b1886424c3586424d2086424e2086425020864251358642523586425835864260278642633e8642643e8642653e8642663e8642673e8642683e8642693e86426a3e86426b3e86426c"+
    "3e86426d3e86426e0e86426f258642701c8642781c8642790f8642900e8642ae3c8642af3c8642b03c8642b1288642b2288642b30e8642b41d8642b51d8642b61887424a1887424b3587424c2087424d2087424e2087424f20874250358742512987425329874254298742552787425735874258358742593587425a2787425b3c87425c3c87425e2787425f278742613e8742623e8742633e8742643e8742653e8742663e8742673e8742683e8742693e87426a3e87426b2587426c2587426d278742731c874278"+
    "0f874291278742ad3c8742ae3c8742af3c8742b0278742b10e8742b2278742b3188742b4188742b5188742b61888424a2788424b3588424c3588424d3588424e3588424f2788425018884251188842521d8842531d884254188842551c8842561c8842571c884258188842591c88425a3c88425b3c88425c3c88425d278842603e8842613e8842623e8842633e8842643e8842653e8842663e8842673e8842683e8842690e88426a1c88426b1c88426c1c88426d1c8842770f8842910e8842920e88429325884294"+
    "25884296278842982388429a298842a8298842a9298842aa1c8842ac3c8842ad3c8842ae3c8842af188842b0188842b1188842b2188842b3188842b4188842b5188842b61889424a1889424b1889424c1889424d1889424e1889424f188942501d8942511d8942521d894253188942541c894255188942560e8942570e894258188942591c89425a2689425c2789425f3e8942603e8942613e8942623e8942633e8942643e8942653e8942663e8942673e894268258942691c89426a1c89426b1c89426c1c89426d"+
    "1c8942751c8942763e8942923e8942933e8942943e8942953e894296278942972789429b3589429c3389429d3389429e2789429f1b8942a0278942a1188942a5188942a61d8942a71d8942a81d8942a9188942aa1c8942ab188942ac188942ae188942af188942b0188942b1188942b2188942b3188942b4188942b5188942b6188a424a188a424b188a424c188a424d1d8a424e188a424f1d8a4250188a42511d8a4252188a4253188a42540e8a42553d8a42563d8a42570e8a42581c8a4259278a425e3e8a425f"+
    "3e8a42603e8a4261208a42623e8a42633e8a42643e8a42653e8a4266258a42671c8a42681c8a42691c8a426a1c8a426b1c8a426c1c8a426d1c8a42741c8a42753e8a42913e8a42923e8a42933e8a4294278a4295358a429a228a429f358a42a0188a42a3188a42a4188a42a51d8a42a61d8a42a71d8a42a8188a42a9188a42aa188a42ac188a42ad188a42ae188a42af188a42b0188a42b1188a42b2188a42b3188a42b4188a42b5188a42b6188b424a188b424b188b424c1d8b424d1d8b424e1d8b424f188b4250"+
    "188b4251188b42521c8b42530e8b42543d8b42550c8b42560e8b4257188b42581c8b42591c8b425a1c8b425b1c8b425c1c8b425d278b425e3e8b425f3e8b42603e8b42613e8b42623e8b42633e8b42643e8b4265258b42661c8b42671c8b42681c8b42691c8b426a1c8b426b1c8b426c3e8b42903e8b42913e8b42923e8b4293278b4294358b4299278b429d278b429f188b42a41d8b42a51d8b42a61d8b42a7188b42a8188b42aa188b42ab188b42ad188b42ae188b42af188b42b0188b42b1188b42b2188b42b3"+
    "188b42b4188b42b5188c424a188c424b1d8c424c188c424d1d8c424e1d8c424f188c4250188c42511c8c4252188c42530e8c42540e8c4255188c42561c8c42571c8c42581c8c42591c8c425a1c8c425b1c8c425c1c8c425d278c425e278c425f3e8c42603e8c42613e8c42623e8c42633e8c42640e8c42651c8c42661c8c42671c8c42681c8c42691c8c426a1c8c426b3e8c42903e8c42913e8c4292278c4293358c4298358c429e188c42a2188c42a3188c42a4188c42a5188c42a6188c42a7188c42a8188c42a9"+
    "188c42aa188c42ac188c42ad188c42ae188c42af188c42b0188c42b1188c42b2188c42b3188c42b4188c42b5188c42b6188d424a188d424b188d424c188d424d188d424e188d424f1c8d42501c8d42511c8d4252188d42531c8d42541c8d42551c8d42561c8d42571c8d42581c8d4259188d425a1c8d425b1c8d425c1c8d425d1c8d425e278d425f3e8d42603e8d42613e8d42620e8d42631c8d42641c8d42651c8d42661c8d42671c8d42681c8d42691c8d426a3e8d428f208d42903e8d4291278d4292278d4297"+
    "3c8d42983c8d429a358d429b358d429c278d429d1c8d42a1188d42a2188d42a6188d42a7188d42a9188d42aa188d42ab188d42ac188d42ad188d42ae188d42af188d42b0188d42b1188d42b2188d42b3188d42b4188d42b6188e424a188e424b188e424c188e424d188e424e188e4250188e4251188e4253188e4254188e42551c8e42571c8e42581c8e42591c8e425a1c8e425b1c8e425c1c8e425d278e425e3e8e425f3e8e42603e8e4261258e42621c8e42631c8e42641c8e42651c8e42671c8e42681c8e4269"+
    "3e8e428d3e8e428e3e8e428f3e8e42903e8e4291278e42923c8e42973c8e42983c8e42991c8e429e1c8e429f188e42a3188e42a4188e42a5188e42a6188e42a7188e42a8188e42a9188e42ab188e42ac188e42ad188e42ae188e42af188e42b0188e42b2188e42b4188e42b5188e42b6188f424a188f424b188f424d188f424e188f424f188f4251188f4252188f4254188f4255188f4257188f42581c8f42591c8f425a1c8f425b1c8f425c1c8f425d278f425e0e8f425f1c8f42611c8f42621c8f42683e8f428c"+
    "3e8f428d3e8f428e3e8f428f3e8f4290278f42911c8f42941c8f42951c8f42961c8f42971c8f42981c8f42991c8f429a1c8f429b188f429c1c8f429d1c8f429e188f42a0188f42a1188f42a3188f42a4188f42a7188f42a8188f42aa188f42ab188f42ac188f42ad188f42ae188f42af188f42b0188f42b1188f42b2188f42b4188f42b5188f42b61890424c1890424e1890425118904254189042551c9042581c9042591890425a1c90425b1c90425c2790425d1c90425e1c90425f1c9042603e90428b3e90428c"+
    "3e90428d3e90428e3e90428f279042901c9042921c9042931c9042941c9042951c9042961c9042971c9042981c9042991c90429a1890429b1c90429c1890429f189042a0189042a2189042a5189042a7189042a8189042a9189042aa189042ab189042ae189042af189042b0189042b1189042b2189042b4189042b51891424e189142521891425418914256189142571c914258189142591891425a1c91425b2791425c1c91425d1891425e3e9142893e91428a3e91428b3e91428c3e91428d3e91428e2791428f"+
    "1c9142911c914292189142931c9142941c9142951c9142961c9142971c914298189142991c91429a1891429b1891429d189142a0189142a2189142a3189142a4189142a5189142a6189142a7189142a8189142a9189142ab189142ac189142b0189142b1189142b3189142b4189142b51892424c1892424e1892425018924251189242531892425418924255189242561892425718924258189242591892425a2792425b1892425c3e9242873e9242883e9242893e92428a3e92428b3e92428c3e92428d2792428e"+
    "1c92428f1c9242901c9242911c9242921c9242931c9242941c9242951c9242961c92429718924298189242991892429d1892429e1892429f189242a0189242a2189242a4189242a5189242a6189242a7189242a8189242a9189242aa189242ab189242ac189242ae189242b0189242b2189242b51893424c1893424e18934250189342511893425218934253189342561893425718934258189342591d93425a1d93425b2993425c3e9342863e9342873e9342883e9342893e93428a3e93428b3e93428c3e93428d"+
    "2793428e1c93428f1c9342901c9342911c9342921c9342931c9342971893429a1893429b1893429c1893429e1893429f189342a3189342a4189342a5189342a6189342a7189342a8189342a9189342aa189342ab189342b1189342b3189342b41894424a1894424c1894424f1894425118944252189442551894425618944257189442581d9442591d94425a2994425b1c9442623e9442853e9442863e9442873e9442883e9442893e94428a3e94428b3e94428c2794428d1c94428e1894428f1894429018944292"+
    "18944294189442961894429718944298189442991894429a1894429c1894429d1894429f189442a0189442a3189442a4189442a7189442a8189442aa189442ab189442ad1895424c1895424d1895424f1895425018954255189542571d954258189542592995425a1c9542610f9542783e9542833e9542843e9542853e9542863e9542873e9542883e9542893e95428a2795428b1c95428c1c95428d1895428e1895428f1895429018954294189542951895429618954297189542991895429b1895429d1895429e"+
    "1895429f189542a0189542a1189542a2189542a3189542a4189542a6189542a8189542a9189542aa189542ac189542b1189542b31896424b1896424e18964253189642541896425518964256279642573e9642823e9642833e9642843e964285209642863e9642873e9642883e9642892796428a1c96428b1c96428c1896428d1896428e1896428f1896429018964292189642941896429518964297189642981896429a1896429b1896429c1896429e189642a0189642a3189642a5189642a7189642a8189642ac"+
    "189642af189642b1189642b2189642b3189642b4189642b61897424e18974251189742531c9742541897425527974256049742680f9742773e9742813e9742823e9742833e9742843e9742853e9742863e974287279742881c9742891c97428a1c97428b1897428c1897428d1897428e1897429018974291189742921897429318974295189742961897429a1897429b1897429c1897429d1897429e189742a1189742a3189742a4189742a7189742a9189742aa189742ab189742ad189742af189742b0189742b2"+
    "189742b3189742b61898424b1898424e18984250189842511898425318984254279842553e9842803e9842813e9842823e9842833e9842843e984285279842861c9842871c9842881c9842891c98428a1898428b1898428c1898428d1898428f189842901898429118984292189842931898429418984295189842961898429a1898429c1898429d189842a3189842a6189842a7189842a8189842a9189842ac189842ae189842b0189842b1189842b5189842b61899424a1899424b1899424e1899425018994251"+
    "1c994252279942530f9942763e99427e3e99427f3e9942803e9942813e9942823e994283279942841c9942851c9942861c9942871c9942881c9942891899428a1899428b1899428c1899428d1899428e1899428f18994291189942931899429418994295189942961899429718994298189942991899429b1899429c1899429d1899429e189942a1189942a2189942a3189942a4189942a5189942a6189942ac189942ae189942af189942b0189942b2189942b3189942b4189a424b189a424c189a424d189a4250"+
    "1c9a4251279a42523e9a427c3e9a427d3e9a427e209a427f3e9a42803e9a42813e9a4282279a42831c9a42841c9a42851c9a42861c9a42871c9a4288189a4289189a428a189a428b189a428c189a428d189a428e189a428f189a4290189a4292189a4295189a4296189a4298189a4299189a429a189a429c189a429f189a42a0189a42a2189a42a3189a42a6189a42a7189a42a8189a42ac189a42ad189a42af189a42b0189a42b4189a42b5189a42b6189b424b189b424d189b424e189b424f1c9b4250279b4251"+
    "0f9b42760f9b42773e9b427a3e9b427b3e9b427c3e9b427d3e9b427e3e9b427f3e9b42803e9b4281279b42821c9b42831c9b42841c9b42851c9b42861c9b42871c9b42881c9b42891c9b428a1c9b428b1c9b428c189b428d189b428e189b428f189b4290189b4291189b4292189b4293189b4294189b4295189b4296189b4297189b4298189b429a189b429b189b429e189b429f189b42a5189b42a6189b42a9189b42aa189b42ac189b42ad189b42af189b42b1189b42b3189b42b4189b42b5189c424a189c424b"+
    "189c424d1c9c424e1c9c424f279c4250259c4278259c42790e9c427a3e9c427b3e9c427c3e9c427d3e9c427e259c427f0e9c4280279c42811c9c42821c9c42831c9c42841c9c42851c9c42861c9c42871c9c42881c9c4289189c428a189c428b1c9c428c1c9c428d189c428e189c428f189c4290189c4291189c4292189c4293189c4294189c4296189c4297189c4298189c4299189c429a189c429c189c42a1189c42a2189c42a3189c42a8189c42a9189c42aa189c42ab189c42ac189c42af189c42b0189c42b2"+
    "189c42b5189d424b1c9d424d189d424e1c9d424f0e9d427c0e9d427d3e9d427e3e9d427f3e9d4280279d42811c9d42821c9d42831c9d42841c9d42851c9d42861c9d42871c9d42881c9d4289189d428a189d428b189d428c189d428d189d428e189d428f189d4290189d4291189d4293189d4294189d4295189d4297189d4298189d4299189d429a189d429b189d429c189d429d189d429e189d429f189d42a2189d42a3189d42a6189d42a7189d42a8189d42a9189d42aa189d42ab189d42ac189d42af189d42b0"+
    "189d42b1189d42b3189d42b4189e424a189e424b1c9e424c189e424d1c9e424e0f9e42783e9e427d3e9e427e3e9e427f3e9e4280279e42811c9e42821c9e42831c9e42841c9e42851c9e42861c9e42871c9e4288189e4289199e428a189e428b189e428c189e428d189e428e189e428f189e4292189e4294189e4295189e4296189e4297189e429a189e429b189e429c189e429d189e429e189e429f189e42a0189e42a1189e42a2189e42a3189e42a4189e42a5189e42a6189e42a7189e42a8189e42a9189e42aa"+
    "189e42ab189e42ae189e42af189e42b1189e42b4189e42b5189e42b6189f424b1c9f424c1c9f424d0f9f42640f9f42753e9f427d3e9f427e3e9f427f279f42801c9f42811c9f42821c9f42831c9f4284189f4285189f4286189f4287199f4288199f4289189f428a189f428b189f428c189f428d189f428e189f4290189f4291189f4293189f4295189f429a189f429c189f429d189f429e189f429f189f42a0189f42a1189f42a2189f42a3189f42a4189f42a53d9f42a63d9f42a7189f42a8189f42a9189f42ab"+
    "189f42ad189f42ae189f42af189f42b1189f42b2189f42b3189f42b4189f42b51ca0424a1ca0424b1ca0424c0fa042733ea0427c3ea0427d3ea0427e3ea0427f27a0428027a0428127a0428218a0428319a0428419a0428519a0428619a0428719a0428819a0428918a0428a18a0428b18a0428c18a0428e18a0428f18a0429318a0429418a0429718a0429818a0429a18a0429b18a0429c18a0429d18a0429e18a042a018a042a118a042a318a042a43da042a53da042a618a042a718a042a818a042a918a042aa"+
    "1ca042ab1ca042ac18a042ad18a042ae18a042b018a042b11ca042b21ca042b40fa142713ea1427c3ea1427d20a1427e3ea1427f3ea142803ea1428119a1428219a1428319a1428419a1428519a1428619a1428719a1428818a1428918a1428a18a1428b18a1428c18a1428d18a1428e18a1428f18a1429718a1429818a1429a18a1429b18a1429c18a1429d18a1429e18a1429f18a142a018a142a118a142a218a142a318a142a418a142a518a142a618a142a718a142a81ca142aa1ca142ab1ca142ad1ca142ae"+
    "1ca142af1ca142b01ca142b11ca142b21ca142b30fa242603ea2427b3ea2427c3ea2427d3ea2427e3ea2427f3ea2428019a2428119a2428236a2428319a2428419a2428519a2428619a2428718a2428818a2428918a2428a18a2428c18a2428d18a2428e18a2428f18a2429118a2429218a2429418a2429518a2429718a2429818a2429a18a2429c18a2429d18a2429e18a242a018a242a118a242a218a242a318a242a418a242a518a242a618a242a71ca242a81ca242a91ca242aa1ca242ab1ca242ad1ca242ae"+
    "1ca242af1ca242b01ca242b11ca242b23ea3427a3ea3427b3ea3427c3ea3427d3ea3427e3ea3427f19a3428019a3428119a3428219a3428319a3428419a3428519a3428618a3428718a3428818a3428918a3428b18a3428c18a3428e18a3428f18a3429018a3429118a3429218a3429318a3429418a3429518a3429618a3429918a3429b18a3429c18a3429d18a3429f18a342a118a342a318a342a41ca342a71ca342a90fa4426d3ea442793ea4427a3ea4427b3ea4427c3ea4427d3ea4427e19a4427f19a44280"+
    "19a4428119a4428219a4428319a4428418a4428518a4428618a4428718a4428818a4428918a4428a18a4428c18a4428d18a4428f18a4429118a4429218a4429318a4429518a4429618a4429718a4429818a4429918a4429c18a4429d18a4429e18a442a018a442a118a442a41ca442a51ca442a60fa542600fa5426b0fa5426c3ea542773ea542783ea542793ea5427a3ea5427b3ea5427c3ea5427d19a5427e19a5427f19a5428019a5428119a5428219a5428318a5428418a5428518a5428618a5428718a54288"+
    "18a5428918a5428a18a5428b18a5428c18a5428d18a5428e18a5428f18a5429018a5429118a5429218a5429318a5429418a5429518a5429618a5429718a5429818a5429918a5429a18a5429b18a5429c18a5429d18a5429f18a542a018a542a118a542a218a542a31ca542a41ca542a50fa642600fa642610fa642690fa6426b3ea642743ea642753ea642763ea642773ea642783ea642793ea6427a3ea6427b3ea6427c3ea6427d19a6427e19a6427f19a6428019a6428119a6428218a6428318a6428418a64286"+
    "18a6428718a6428d18a6428e18a6428f18a6429018a6429118a6429318a6429418a6429518a6429618a6429718a6429818a6429918a6429b18a6429d18a6429e18a6429f18a642a018a642a118a642a21ca642a40fa742630fa742640fa742650fa7426b3ea742723ea742733ea742743ea742753ea742763ea742773ea7427820a742793ea7427a3ea7427b3ea7427c19a7427d19a7427e19a7427f19a7428019a7428118a7428218a7428318a7428418a7428518a7428618a7428718a7428818a7428918a7428a"+
    "18a7428b18a7428c18a7428d18a7428e18a7428f18a7429018a7429218a7429318a7429418a7429518a7429618a7429718a7429818a7429b18a7429d18a7429e18a7429f18a742a018a742a127a742a627a742a70fa8426a3ea842703ea842713ea842723ea842733ea842743ea842753ea842763ea842773ea842783ea842793ea8427a3ea8427b19a8427c19a8427d36a8427e19a8427f19a8428018a8428118a8428218a8428318a8428418a8428618a8428718a8428818a8428918a8428a18a8428b18a8428c"+
    "18a8428e18a8428f18a8429018a8429118a8429218a8429318a8429418a8429518a8429618a8429718a8429818a8429c18a8429d18a8429e1ca842a01ca842a127a842a627a842b427a842b50fa942693ea9426d3ea9426e3ea9426f20a942703ea942713ea942723ea942733ea942743ea942753ea942763ea942773ea942783ea942793ea9427a3ea9427b19a9427c19a9427d19a9427e18a9427f1ca942801ca9428118a9428218a9428418a9428618a9428818a9428918a9428a18a9428c18a9428d18a9428e"+
    "18a9428f18a9429018a9429118a9429218a9429318a9429418a9429518a942961ca9429718a9429818a9429918a9429a18a9429b18a9429c18a9429d18a9429e1ca9429f27a942b43eaa426b3eaa426c3eaa426d3eaa426e3eaa426f3eaa42703eaa42713eaa42723eaa42733eaa42743eaa42753eaa42763eaa42773eaa42783eaa42793eaa427a19aa427b19aa427c18aa427d1caa427e1caa427f1caa42801caa428118aa42821caa42831caa42841caa428518aa428618aa428718aa428918aa428b18aa428c"+
    "18aa428d18aa428e18aa428f18aa429018aa429118aa429218aa429318aa429418aa42951caa429618aa429818aa429918aa429a18aa429b18aa429c1caa429e26aa42a125ab426925ab426a3eab426b3eab426c3eab426d3eab426e3eab426f3eab42703eab42713eab42723eab42733eab42743eab42753eab42763eab42773eab427825ab42791cab427c1cab427d1cab427e1cab427f1cab42801cab42811cab42821cab42831cab42841cab42851cab42861cab42871cab42881cab428918ab428a18ab428b"+
    "1cab428c1cab428d18ab428e18ab428f18ab429018ab429118ab429218ab42931cab42941cab42951cab42961cab429718ab42981cab42991cab429a1cab429b27ab429c26ab42af0eac426a25ac426b0eac426c3eac426d3eac426e3eac426f3eac427025ac42740eac42771cac427b1cac427c1cac427d1cac427e1cac427f1cac42801cac42811cac42821cac42831cac42841cac42851cac42861cac42871cac42881cac42891cac428a18ac428b1cac428c18ac428d18ac428e18ac428f18ac429018ac4291"+
    "18ac42921cac42931cac42941cac42951cac42961cac42971cac429827ac429927ac429a0ead426d25ad426e1cad427a1cad427c1cad427d1cad427e1cad427f1cad42801cad42811cad42841cad42851cad42861cad42871cad42881cad42891cad428a18ad428b18ad428c18ad428d1dad428e18ad428f1dad429018ad42911cad42921cad429318ad429427ad429527ad429627ad42971cae427a1cae427b1cae427c1cae427d1cae427e1cae427f1cae42801cae42821cae42831cae42841cae42851cae4286"+
    "1cae42871cae42881cae42891cae428a1cae428b27ae428c1dae428d1dae428e1dae428f18ae429018ae429118ae42921cae42931caf42771caf42791caf427a1caf427b1caf427c1caf427d1caf427e1caf42801caf42811caf42821caf42831caf42841caf42851caf42861caf42871caf42881caf42891daf428c18af428d1daf428e18af428f1caf42901caf429126b0425826b042591cb042741cb042761cb042771cb042781cb042791cb0427a1cb0427b1cb0427c1cb0427d1cb0427f1cb042801cb04281"+
    "1cb042821cb042831cb042841cb042851cb042861cb0428710b0428a29b0428b29b0428c29b0428d18b0428f04b142581cb142721cb142731cb142741cb142751cb142771cb142781cb142791cb1427a1cb1427b1cb1427c1cb1427d1cb142801cb142811cb142821cb142831cb1428426b242551cb2426e1cb2426f1cb242701cb242721cb242731cb242741cb242751cb242771cb242781cb242791cb2427f1cb242801cb242811cb242821cb242831cb3426d1cb3426e1cb3426f1cb342711cb342731cb34274"+
    "1cb342751cb342761cb342771cb3427f1cb342801cb342811cb3428226b342af04b442671cb4426c1cb4426d1cb4426e1cb4426f1cb442711cb442721cb442731cb442741cb5426a1cb5426b1cb5426c1cb5426d1cb5426e1cb5427126b542a526b542a627b542aa0f5943920f5f438b1c5f439b1c5f439f1c5f43a01c60439c1c60439d1c60439f1c61439c1c61439d1c61439e1c62439d0f6643810f6643830f6743840f694384386a4369266a436a266a436b386a436d386a43700f6a4384386b435e006b4365"+
    "386b4366266b4368266b4369346b436a346b436b0f6b4384266c4366346c4367266c4368346c4369266c436a266c436b266c436c386c4371346d4365346d4366266d4367266d4368266d4369386e4358266e4363266e4364266e4365266e4367266e4368006e4370266f4366276f43700f6f4381387043553870436f0f70437f0f7143580f714359167143621671436316714365167143660071436e0f71437e007243530f7243560f7243570f7243580f7243591672436135724362357243633572436416724365"+
    "3872436d2672439a2672439c387343520f7343550f7343560f7343570f73435816734360167343611673436316734364177343650073436c2673439826734399007443500f7443550f7443561774435e1674435f167443602374436116744362167443631674436416744365167443662774436c2374437e2674439726744398267443992774439a2674439c2674439d3875434f1775435d1675435e1675435f16754361167543621675436335754364167543653875436b26754396267543972675439826754399"+
    "2675439a2675439c2776434e1676435d1676435e237643613576436326764366347643672776436a2676439326764396267643982777434d1677435c1677435d357743621677436326774364267743653477436626774367277743692677439126774392277743952677439626774397267743982778434c1678435b3578435c3578435d3c78435e3c784360167843611678436226784363347843642778436534784366387843690078436d3878436e0f78437a26784393267843953879434a1679435a1679435b"+
    "3c79435d3c79435e3c79435f267943602679436134794362347943633879436e3879436f0f7943750f79437a2679438a2679438b2679438c2679438d2679438e267943912679439226794394277943b6167a434a167a434b167a434c157a434d177a434e157a434f177a4350177a4351157a4352167a4353167a4354267a4360347a4361007a436f0f7a43720f7a437e267a4389267a438a267a438b267a438c267a438d267a438e277a438f267a4390267a4391267a4392007a43b5167a43b6277b434a357b434b"+
    "357b434c357b434d357b434e357b434f357b4350357b4351277b4352167b4353277b436f0f7b437e267b4387277b4388267b4389267b438b267b438c267b438d267b438e267b438f267b4390387b43b4157b43b5357b43b6357c4351277c436e0e7c437e267c4384267c4385277c4388277c438a267c438b267c438c267c438d267c438f267c4391007c43b2177c43b4357c43b5357d4350277d436d0e7d437d267d4384267d4386267d4388267d4389277d438a277d438b267d438c277d438d267d438e267d438f"+
    "267d4390277d43b0157d43b3357d43b4397e434d357e434f277e4355347e4356347e4357347e4358277e4359007e436b0e7e437c267e4384267e4386277e4387267e4388267e438c267e438d267e438f267e4390267e4391007e43a6387e43a7007e43a8387e43ad277e43ae167e43b2357e43b3277f434a3c7f434b3c7f434d277f434e167f434f347f4354207f4355207f4356207f4357347f4358277f436a0e7f437b277f4387267f4388267f4389267f438a267f438b267f438c267f438d277f438e267f4391"+
    "277f43a3387f43a4277f43a8387f43a9007f43aa387f43ab167f43b1357f43b2357f43b63c80434a3c80434b3c80434c1680434d1680434e348043532080435534804357278043680e80437a268043892680438a2680438b2680438f278043a1168043b0278043b1358043b2358043b3358043b4278043b5168043b63481435220814355348143562781435d3581435e3581435f358143602781436135814362358143633581436427814365278143670e8143792681438e2781439f168143af168143b0168143b4"+
    "168143b52382434c2782435127824355278243560082435c2382435e35824364278243662682438a2682438b2782439e278243b20e8243b30e8243b40e8243b5278243b63383435022834354358343553583435b2383436235834363278343662783439d0e8343b11f8343b21f8343b3278343b50e8343b62784434a3384434f35844354238443553584435a35844362278443653884439c238443a70e8443b00e8443b63585434e2085435235854353358543592a85435a35854361278543640e8543af338543b5"+
    "3586434d208643513586435200864358288643592a86435a3a86435d3a86435e3a86435f35864360278643630f86436f0f8643700e8643ae128643af1a8643b00d8643b1338643b43587434c2087434e20874350358743512787435735874358358743593587435a2787435b3c87435c3c87435e2787435f278743610e87436c0e87436d27874373278743ad3c8743ae0a8743af3c8743b0278743b10e8743b2278743b3298743b4298743b5298743b62788434b3588434c3588434d3588434e3588434f27884350"+
    "0f8843592688435a3c88435b3c88435c3c88435d278843602588436a0f8843940f8843950f884396278843981688439b1688439c1588439d1788439e1788439f158843a0178843a1158843a2168843a33c8843ad3c8843ae3c8843af1c8843b0188843b1188843b21d8843b31d8843b41d8843b5188843b61889434a1889434b1889434c1889434d0f8943560e8943570e8943580f8943592789435f278943971689439a2789439b3589439c3589439d3589439e2789439f358943a0278943a1168943a2108943a6"+
    "1c8943ac1c8943ad1c8943ae188943af188943b01d8943b11d8943b21d8943b31d8943b4188943b51d8943b61d8a434a1d8a434b1d8a434c298a434d0f8a43540e8a43550e8a4358278a435e258a4367278a4395358a439a228a439f358a43a01c8a43aa1c8a43ab1c8a43ac188a43ad1d8a43ae1d8a43af1d8a43b01d8a43b11d8a43b21d8a43b3188a43b41d8a43b51d8a43b61d8b434a1d8b434b298b434c0e8b43540c8b43560e8b43570f8b4358278b435e278b4394358b4399278b439d278b439f1c8b43a9"+
    "1c8b43aa1c8b43ab188b43ac1d8b43ad1d8b43ae1d8b43af188b43b01d8b43b11d8b43b21d8b43b31d8b43b4188b43b5188b43b61d8c434a298c434b108c43510f8c43530e8c43540e8c43550f8c4356278c435e278c435f0e8c4365278c4393358c4398358c439e298c43a4298c43a5298c43a6188c43a71c8c43a81c8c43a91c8c43aa188c43ab1d8c43ac1d8c43ad188c43ae188c43af188c43b0188c43b1188c43b2188c43b3188c43b4188c43b5188c43b60f8d4353278d435a278d435f258d4363278d4392"+
    "168d4396278d43973c8d43983c8d439a358d439b358d439c278d439d168d439e188d43a2188d43a3188d43a41d8d43a5188d43a61c8d43a71c8d43a81c8d43a9188d43aa188d43ab188d43ac1d8d43ad188d43ae188d43af188d43b0188d43b1188d43b2188d43b3188d43b41c8d43b5188d43b6188e434a188e434b1c8e434c1c8e434d1c8e434e1c8e434f1c8e43501c8e43511c8e43521c8e4353188e43541c8e43551c8e4356278e435e278e4392168e4395168e43963c8e43973c8e43983c8e4399168e439a"+
    "168e439b168e439c168e439d188e43a0188e43a1188e43a2188e43a3188e43a4188e43a5188e43a6188e43a7188e43a8188e43a91d8e43aa1d8e43ab1d8e43ac188e43ad188e43ae188e43af188e43b0188e43b2188e43b41c8e43b51c8e43b61c8f434a188f434b188f434d188f434e188f434f1c8f43501c8f43511c8f43521c8f4353188f43541c8f43551c8f43561c8f43571c8f4358278f435e258f435f278f43911c8f439f188f43a0188f43a1188f43a2188f43a3188f43a4188f43a5188f43a6188f43a7"+
    "188f43a8188f43a9188f43aa188f43ab188f43ac188f43ad188f43ae188f43af188f43b0188f43b1188f43b2188f43b4188f43b5188f43b61890434c1890434e1c9043501c9043511c904352189043531c90435418904355189043561c9043572790435d279043901890439d1890439e1890439f189043a0189043a1189043a2189043a5189043a6189043a7189043a8189043a9189043aa189043ab189043ae189043af189043b0189043b1189043b2189043b4189043b51891434e1c9143501891435118914352"+
    "1891435318914354189143561c9143572791435c2791438f279143931891439c1891439d1891439e1891439f189143a0189143a2189143a3189143a4189143a5189143a6189143a7189143a8189143a9189143ab189143ac189143b0189143b1189143b3189143b4189143b51892434c1892434e1892435018924351189243531892435418924355189243561892435718924358189243592792435b2792438e1892439a1892439b1892439c1892439d1892439e1892439f189243a0189243a2189243a4189243a5"+
    "189243a6189243a7189243a8189243a9189243aa189243ab189243ac189243ae189243b0189243b2189243b51893434c1893434e18934350189343511893435218934353189343561d9343571d934358299343592793438e3c9343943c9343953c934396189343981d9343991d93439a1893439b1893439c1893439e1893439f189343a3189343a4189343a5189343a6189343a7189343a8189343a9189343aa189343ab189343b1189343b3189343b41894434a1894434c1894434f189443511894435218944355"+
    "1d94435618944357299443582794438d0794438f0794439007944391279443923c9443933c9443943c944395279443961d9443971d9443981d9443991894439a1894439b1894439c1894439d1894439f189443a0189443a3189443a4189443a7189443a8189443aa189443ab189443ad1895434c1895434d1895434f18954350189543541d9543551895435629954357269543692795438b0795438e1c95438f1c9543900e9543913c9543923c9543933c9543940e9543951d9543961d9543971d95439818954399"+
    "1895439b1895439d1895439e1895439f189543a0189543a1189543a2189543a3189543a4189543a6189543a8189543a9189543aa189543ac189543b1189543b31896434b1896434e1896435318964354189643552796435726964368269643692796438a0796438d1c96438e1c96438f0e9643902896439128964392289643930e9643941d9643951d96439618964397189643981896439a1896439b1c96439c1896439e189643a0189643a3189643a5189643a7189643a8189643ac189643af189643b1189643b2"+
    "189643b3189643b4189643b61897434e189743511897435218974353279743562697436704974368279743880797438c1c97438d1c97438e0e97438f2897439028974391289743920e9743931d9743941d9743951d9743961897439718974398189743991c97439a1c97439b1897439c1897439d1897439e189743a1189743a3189743a4189743a7189743a9189743aa189743ab189743ad189743af189743b0189743b2189743b3189743b61898434b1898434e18984350189843511c9843522798435527984386"+
    "0798438b1c98438c1c98438d0e98438e2898438f28984390289843910e98439218984393189843941d98439518984396189843971c9843981898439a1898439c1898439d189843a3189843a6189843a7189843a8189843a9189843ac189843ae189843b0189843b1189843b5189843b61899434a1899434b1899434e1c9943501c9943512799435326994364279943840799438a1c99438b1c99438c0e99438d2899438e2899438f289943900e994391189943921d99439318994394189943951c9943961c994397"+
    "18994398189943991899439b1899439c1899439d1899439e189943a1189943a2189943a3189943a4189943a5189943a6189943ac189943ae189943af189943b0189943b2189943b3189943b4189a434b189a434c189a434d1c9a434f1c9a4350279a4352279a4383079a4389079a438a079a438b279a438c0e9a438d0e9a438e0e9a438f279a4390189a43911d9a4392189a4393189a4394189a43951c9a4396189a4398189a4399189a439a189a439c189a439f189a43a0189a43a2189a43a3189a43a6189a43a7"+
    "189a43a8189a43ac189a43ad189a43af189a43b0189a43b4189a43b5189a43b6189b434b189b434d1c9b434e1c9b434f279b4351279b4382189b438e189b438f189b43901d9b43911d9b4392189b43931c9b4394189b4395189b4396189b4397189b4398189b439a189b439b189b439e189b439f189b43a5189b43a6189b43a9189b43aa189b43ac189b43ad189b43af189b43b1189b43b3189b43b4189b43b5189c434a189c434b1c9c434d279c43500f9c43780f9c437f0f9c4380279c4381189c438e1d9c438f"+
    "1d9c43901d9c4391189c4392189c43931c9c4394189c4396189c4397189c4398189c4399189c439a189c439c189c43a1189c43a2189c43a3189c43a8189c43a9189c43aa189c43ab189c43ac189c43af189c43b0189c43b2189c43b5189d434b1c9d434c279d434e0f9d437b0f9d437d279d4381279d438b279d438c279d438d1d9d438e1d9d438f1d9d4390279d43911c9d43931c9d43941c9d4395189d4397189d4398189d4399189d439a189d439b189d439c189d439d189d439e189d439f189d43a2189d43a3"+
    "189d43a6189d43a7189d43a8189d43a9189d43aa189d43ab189d43ac189d43af189d43b0189d43b1189d43b3189d43b4189e434a1c9e434b279e434d279e4381279e43893e9e438a259e438b189e438c1d9e438d1d9e438e1d9e438f189e43901c9e4391189e43921c9e4393189e4394189e4395189e4396189e4397189e439a189e439b189e439c189e439d189e439e189e439f189e43a0189e43a1189e43a2189e43a3189e43a4189e43a5189e43a60e9e43a70e9e43a8189e43a9189e43aa1c9e43ab1c9e43ac"+
    "1c9e43ad1c9e43ae189e43af189e43b11c9e43b41c9e43b51c9e43b6279f434a279f434b279f4380279f4385279f4386279f43873e9f43883e9f4389189f438b1d9f438c1d9f438d1d9f438e189f438f189f4390189f4391189f4393189f4395189f439a189f439c189f439d189f439e189f439f189f43a0189f43a1189f43a2189f43a3189f43a40e9f43a53d9f43a63d9f43a70e9f43a8189f43a91c9f43aa1c9f43ab279f43ac279f43ad189f43ae189f43af189f43b1189f43b2279f43b3279f43b4279f43b5"+
    "27a0438027a0438127a0438227a043833ea043843ea043853ea043863ea043873ea043883ea0438925a0438a18a0438b1da0438c18a0438d18a0438e1ca0438f1ca0439018a0439318a0439418a0439718a0439818a0439a18a0439b18a0439c18a0439d18a0439e18a043a018a043a118a043a30ea043a43da043a53da043a60ea043a718a043a81ca043a927a043aa1ca043ad1ca043ae1ca043b01ca043b13ea143823ea143833ea143843ea143853ea143863ea143873ea143880ea1438918a1438a1da1438b"+
    "1ca1438c1ca1438d18a1438e1ca1438f1ca1439118a1439718a1439818a1439a18a1439b18a1439c18a1439d18a1439e18a1439f18a143a018a143a118a143a218a143a30ea143a40ea143a518a143a618a143a727a143a83ea243813ea2438220a243833ea243843ea243853ea243863ea243870ea243881ca243891ca2438a1ca2438b1ca2438c1ca2438d18a2438e18a2438f1ca2439018a243913ca2439218a2439318a2439418a2439518a2439718a2439818a2439a18a2439c18a2439d18a2439e18a243a0"+
    "18a243a118a243a218a243a318a243a418a243a51ca243a627a243a73ea343803ea343813ea343823ea343833ea343843ea343853ea343861ca343881ca343891ca3438a1ca3438b1ca3438c1ca3438d18a3438e1ca3438f18a3439018a3439118a3439218a3439318a3439418a3439518a3439618a3439918a3439b18a3439c18a3439d18a3439f18a343a11ca343a31ca343a41ca343a527a343a63ea4437f3ea443803ea443813ea443823ea443833ea4438425a443851ca443861ca443871ca443881ca44389"+
    "1ca4438a1ca4438b1ca4438c1ca4438d1ca4438f18a4439118a4439218a4439318a4439518a4439618a4439718a4439818a4439918a4439c18a4439d18a4439e18a443a018a443a11ca443a21ca443a327a443a43ea5437e3ea5437f3ea543803ea543813ea543823ea543831ca543851ca543861ca543871ca543881ca543891ca5438a1ca5438b1ca5438c18a5438d1ca5438e1ca5438f1ca5439018a5439118a5439218a5439318a5439418a5439518a5439618a5439718a5439818a5439918a5439a18a5439b"+
    "18a5439c18a5439d18a5439f18a543a01ca543a11ca543a227a543a33ea6437e3ea6437f3ea643803ea643813ea643820ea643831ca643841ca643851ca643861ca643871ca643881ca643891ca6438a1ca6438b1ca6438d1ca6438e1ca6438f18a6439018a6439118a6439318a643941da643951da643961da6439718a6439818a6439918a6439b18a6439d18a6439e18a6439f1ca643a01ca643a127a643a23ea7437d3ea7437e3ea7437f3ea743803ea7438125a743821ca743831ca743841ca743851ca74386"+
    "1ca743871ca743881ca743891ca7438a18a7438b1ca7438c1ca7438d1ca7438e18a7438f18a7439018a7439218a743931da743941da743951da7439618a7439718a7439818a7439b18a7439d18a7439e1ca7439f1ca743a027a743a127a743a627a743a73ea8437c3ea8437d20a8437e3ea8437f3ea843800ea843811ca843821ca843831ca843841ca843851ca843861ca843871ca843881ca843891ca8438a18a8438b1ca8438c1ca8438d18a8438e18a8438f18a8439018a8439118a843921da8439318a84394"+
    "1da8439518a8439618a8439718a843981ca8439918a8439c18a8439d1ca8439e27a8439f27a843a627a843b427a843b53ea9437c3ea9437d3ea9437e0ea9437f1ca943821ca943831ca943841ca943851ca943861ca943871ca943881ca9438918a9438a1ca9438b1ca9438c18a9438d18a9438e18a9438f18a9439018a943911da943921da943931da9439418a9439518a943961ca9439818a9439918a9439a18a9439b18a9439c1ca9439d27a9439e27a943a627a943b43eaa437b3eaa437c1caa43821caa4386"+
    "1caa43871caa43881caa438927aa438a1caa438b1caa438c1caa438d1caa438e18aa438f18aa43901daa43911daa439218aa439318aa439418aa43951caa43971caa43981caa43991caa439a1caa439b1caa439c27aa439d26aa43a126aa43a426aa43a727aa43b40fab436a0eab437927ab438a27ab438b18ab438f18ab43901dab439118ab439218ab43931cab439827ab439c26ab43a226ab43af26ab43b226ab43b50fac436c0fac43740fac437525ac437727ac438b29ac438f29ac439029ac439127ac4399"+
    "27ac439a26ac43a526ac43b00fad436c0fad436d0fad436f27ad438b27ad438c27ad439427ad439527ad439627ad439726ad43a326ad43b327ae438c27ae439027ae439127ae439226ae43b126af435826af435926af435c26b0435926b0435a26b0435b23b0438a26b043ad26b1435626b1435704b1435826b143ab26b2435826b2435926b243ae26b343a926b343ac26b343af26b4435526b4435626b4435804b4436726b443a426b443a726b443a827b443aa26b5435526b5435726b543a326b543a426b543a5"+
    "27b543aa2669446c266a446a266a446b266a446c386b4465266b4467266b4468266b446a346b446b266b446c266c4466266c4467266c446a266d4464346d4465266e4464266e4465266e4466386e4470266f4463006f44701671446316714464167144653871446e387244531672446235724463167244641673446114734462167344633873446c26734498267344992673449c387444501674446014744461167444623874446c267444992674449a2674449b1675445f14754460167544611675446216754463"+
    "1675446416754465267544682675449a0076444e1676445e1476445f147644601476446114764462357644631676446434764467267644683876446a267644942676449a3877444d1677445d1477445e3c77445f3c7744603c77446116774462167744632677446500774469267744982778444c1678445c3578445d3c78445e3c784460267844642678446534784466267844673878446d267844901679445b1679445c3c79445d3c79445e3c79445f267944613479446226794463347944653479446626794467"+
    "2679448c26794493007944b6177a444e177a4450177a4451267a4461267a4462267a4464387a446f267a4487267a4489267a448b267a4491387a44b5167b444a167b444b167b444c167b444d167b444e167b444f167b4450167b4451167b4452167b4453267b4460277b446f267b4486267b448b267b4491167b44b6167c444a167c444b167c444c167c444d167c444e167c444f167c4450357c4451167c4452277c446e267c448a277c448d267c448e267c448f267c4490267c4491387c44b2177c44b4167c44b5"+
    "167c44b6357d4450277d446d267d4488267d4489267d448a267d448c267d448d267d448f007d44b0167d44b4167d44b5167e444a167e444b3a7e444c3c7e444d3a7e444e357e444f167e4450277e4455347e4456347e4457347e4458277e4459387e446b267e4486277e4487267e4489267e448a267e448b267e448c267e448d387e44a6387e44a8387e44ae167e44b3167e44b4167e44b6167f444a3c7f444b3c7f444d167f444e167f444f347f4454207f4455207f4457347f4458277f446a0f7f447b267f4486"+
    "267f4487277f4488267f448a267f4490387f44a3007f44a8387f44aa167f44b2167f44b3167f44b5167f44b63c80444b34804453348044573780445e3680445f388044603680446137804462278044682680448726804489008044a1168044b1358044b2358044b3358044b4168044b534814452348144563781445c2781445d3581445e3581445f35814460278144613581446235814463008144642781446537814466278144672681448b3881449f168144b0168144b1168144b3168144b42782445127824455"+
    "278244563682445b3582445c2a82445d2882445e2882445f288244602882446128824462288244633582446436824465008244660082449e278244b2358244b31b8244b4358244b5278244b63583445022834454358344553883445a3583445b2883445d2883445e2883445f288344602883446128834462358344633883446438834466268344793883449d358344b1278344b51b8344b62784444a3584444f358444543584445a2884445c2884445d2884445e2884445f28844460288444613584446227844465"+
    "1b8444b0358444b63585444e3585445338854458358544592885445b2885445c2885445d2885445e2885445f28854460358544613885446227854464268544771b8544af338544b53586444d208644513586445236864457358644582a86445a2886445b2886445c3c86445d3c86445e3c86445f35864460368644612786446326864472268644732686447426864476358644ae338644b43587444c2387444d2087445035874451378744562787445735874458358744593587445a2787445b3c87445c3c87445e"+
    "2787445f37874460008744610f87446c26874470268744712787447326874474278744ad3c8744ae3c8744b0278744b1358744b2278744b32788444b3588444c3588444d3588444e3588444f27884450378844563688445738884458368844593788445a3c88445b3c88445c3c88445d388844600f88446a2688447126884474278844981788449e1788449f178844a13c8844ad3c8844ae3c8844af1089444a108944570f8944582789445f0f894469278944971689449a1689449b1689449c1689449d1689449e"+
    "2789449f008944a0278944a1168944a2238944a60f8a4455108a4458278a445e278a4495168a4499358a449a168a449b168a449c168a449d358a449e228a449f358a44a0168a44a1268a44ab108a44ad108b44540c8b44560f8b4457278b445e278b4494358b4499278b449d358b449e278b449f238c44510f8c4454108c4455278c445e008c445f0f8c4465278c4493168c4497358c4498168c4499168c449a168c449b358c449e168c449f078c44af078c44b0078c44b1078c44b2078c44b3078c44b4078c44b5"+
    "278d445a388d445f278d4492168d4496168d44973c8d44983c8d449a168d449b168d449c168d449d168d449e268d44a9078d44ae198d44af198d44b0198d44b1198d44b2198d44b3078d44b4278e445e0f8e4462278e44923c8e44973c8e44983c8e4499298e44a2298e44a3298e44a43c8e44a63c8e44a73c8e44a8078e44ad368e44ae198e44af198e44b0198e44b1198e44b2078e44b31c8e44b4188f444b188f444c1c8f444d1c8f444e1c8f444f278f445e0f8f4460008f4491188f44a01d8f44a11d8f44a2"+
    "1d8f44a33c8f44a43c8f44a53c8f44a63c8f44a73c8f44a8298f44a9298f44aa298f44ab278f44ac0e8f44ad0e8f44ae0e8f44af0e8f44b00e8f44b1278f44b21c8f44b31c8f44b41c8f44b51c8f44b61c90444a1890444b1c90444c1c90444d1890444e1c90444f2790445d279044903490449334904494269044951890449e1890449f1d9044a01d9044a11d9044a23c9044a33c9044a43c9044a53c9044a63c9044a71d9044a81d9044a91d9044aa0e9044ab289044ac289044ad289044ae289044af289044b0"+
    "0e9044b11c9044b21c9044b31c9044b41c9044b51c9044b61891444a1891444b1c91444c1891444d1891444e1c91444f18914455189144560091445c2791448f279144931891449d1891449e1d91449f1d9144a0189144a13c9144a23c9144a33c9144a43c9144a53c9144a6189144a71d9144a81d9144a90e9144aa289144ab289144ac289144ad289144ae289144af279144b00e9144b1279144b21c9144b31c9144b4189144b5189144b61892444a1892444b1892444c1892444d1892444e1892444f18924450"+
    "1892445118924452189244531892445418924455189244563892445b0092448e1892449d1d92449e1d92449f1d9244a01d9244a13c9244a23c9244a33c9244a41d9244a51d9244a61d9244a71d9244a80e9244a9289244aa289244ab289244ac289244ad289244ae289244af289244b00e9244b11c9244b2189244b31d9244b41d9244b51d9244b61d93444a1d93444b1d93444c1d93444d1d93444e1d93444f18934450189344511d934452189344531d93445418934455299344562793448e3c9344943c934495"+
    "3c9344962993449b1d93449c1d93449d1893449e1d93449f1d9344a0189344a11d9344a21d9344a31d9344a41d9344a51d9344a61d9344a70e9344a8289344a9289344aa289344ab289344ac289344ad289344ae3c9344af3c9344b03c9344b11d9344b21d9344b31d9344b4189344b51d9344b61d94444a1d94444b1d94444c1d94444d1d94444e1d94444f1d9444501d9444511d944452189444531d944454299444550094448d1094448f1094449010944491279444923c9444930a9444943c94449527944496"+
    "2994449a1d94449b1894449c1894449d1894449e1d94449f1d9444a0189444a11d9444a21d9444a31d9444a41d9444a51d9444a60e9444a7289444a8289444a9289444aa289444ab289444ac289444ad3c9444ae3c9444af3c9444b01d9444b11d9444b21d9444b31d9444b41d9444b51d9444b61d95444a1895444b1d95444c1d95444d1895444e1d95444f1d9544501d9544511d9544521d95445329954454269544692795448b1095448e3f95448f2b9544900e9544910e954495299544991d95449a1d95449b"+
    "1895449c1895449d1d95449e1d95449f1d9544a01d9544a11d9544a21d9544a31d9544a4189544a50e9544a6289544a7289544a8289544a9289544aa289544ab289544ac3c9544ad3c9544ae3c9544af189544b0189544b11d9544b2279544b30e9544b40e9544b50e9544b60e96444a0e96444b0e96444c0e96444d0e96444e0e96444f0e9644500e964451279644521096445500964457269644682796448a1096448d2b96448e3196448f0e96449033964494189644991896449a1896449b2796449d0e96449e"+
    "0e96449f0e9644a0279644a1189644a21d9644a31d9644a40e9644a5289644a6289644a7289644a80e9644a90e9644aa0e9644ab289644ac0e9644ad189644ae1d9644af189644b01d9644b10e9644b2289644b3289644b4289644b5289644b62897444a2897444b2897444c2897444d2897444e2897444f289744500e974451279744562697446704974468279744881097448c3f97448d2b97448e0e97448f339744930e97449c2897449d2897449e2897449f0e9744a01d9744a11d9744a21d9744a3279744a4"+
    "0e9744a50e9744a60e9744a70e9744a8289744a90e9744aa0e9744ab279744ac189744ad1d9744ae189744af1d9744b00e9744b1289744b2289744b3289744b4289744b5289744b62898444a2898444b2898444c2898444d2898444e2898444f0e98445000984455279844861098448b2d98448c3f98448d3398448e0e984492279844990e98449a2798449b2898449c2898449d2898449e0e98449f1d9844a01d9844a11d9844a21d9844a31d9844a41d9844a50e9844a60e9844a70e9844a80e9844a90e9844aa"+
    "189844ab189844ac1d9844ad1d9844ae1d9844af0e9844b0289844b1289844b2289844b3289844b4289844b5289844b62899444a2899444b2899444c2899444d2899444e0e99444f27994453279944841099448a3199448b3199448c0e99448d0e994491109944950e994498289944992899449a2899449b2899449c3c99449d3c99449e3c99449f189944a0189944a11d9944a21d9944a31d9944a4189944a50e9944a60e9944a70e9944a8189944a9189944aa189944ab189944ac1d9944ad1d9944ae0e9944af"+
    "289944b0289944b1289944b2289944b3289944b4289944b5289944b6289a444a289a444b289a444c289a444d0e9a444e279a4452269a4464279a4483109a4489109a448a109a448b279a448c0e9a448d0e9a448e0e9a448f279a44900e9a4497289a4498289a4499289a449a289a449b3c9a449c3c9a449d3c9a449e189a449f1d9a44a01d9a44a11d9a44a21d9a44a3189a44a4189a44a5189a44a61d9a44a7189a44a81d9a44a9189a44aa189a44ab1d9a44ac1d9a44ad0e9a44ae289a44af289a44b0289a44b1"+
    "289a44b2289a44b3289a44b4289a44b5289a44b6289b444a289b444b289b444c0e9b444d279b4451279b4482269b44940e9b4496289b4497289b4498289b4499289b449a3c9b449b3c9b449c3c9b449d189b449e189b449f1d9b44a01d9b44a11d9b44a21d9b44a31d9b44a41d9b44a51d9b44a61d9b44a71d9b44a81d9b44a91d9b44aa1d9b44ab189b44ac0e9b44ad289b44ae289b44af289b44b0289b44b1289b44b2289b44b3289b44b4289b44b5289b44b6289c444a289c444b0e9c444c279c4450279c4481"+
    "279c44950e9c44960e9c44970e9c44980e9c44990e9c449a279c449b1c9c449c189c449d189c449e189c449f1d9c44a01d9c44a11d9c44a21d9c44a3189c44a4189c44a51d9c44a61d9c44a7189c44a81d9c44a9189c44aa189c44ab0e9c44ac289c44ad289c44ae289c44af289c44b0289c44b1289c44b2289c44b3289c44b4289c44b5289c44b6289d444a0e9d444b279d444e009d4481279d448b279d448c279d448d279d4491279d4492079d44961c9d44971c9d44981c9d4499079d449a1c9d449b1c9d449c"+
    "1c9d449d189d449e1d9d449f1d9d44a01d9d44a1189d44a2189d44a3189d44a4189d44a51c9d44a61c9d44a7189d44a8189d44a9189d44aa279d44ab0e9d44ac0e9d44ad0e9d44ae0e9d44af0e9d44b00e9d44b10e9d44b20e9d44b30e9d44b40e9d44b50e9d44b6279e444a279e444d279e4481279e4489279e44921c9e4494079e44951c9e44961c9e44971c9e4498079e44991c9e449a1c9e449b189e449c1d9e449d1d9e449e189e449f189e44a0189e44a1189e44a2189e44a31c9e44a41c9e44a5189e44a6"+
    "0e9e44a70e9e44a8189e44a91c9e44aa1c9e44af1c9e44b01c9e44b11c9e44b21c9e44b3279f444a279f444b009f4480279f4485279f4486279f4487279f44911c9f44921c9f4493079f4494079f44951c9f44961c9f4497079f44981c9f44991c9f449a189f449b1d9f449c1d9f449d1d9f449e279f449f0e9f44a00e9f44a10e9f44a2279f44a3189f44a40e9f44a53d9f44a60c9f44a70e9f44a81c9f44a9279f44ac279f44ad279f44ae279f44af279f44b0279f44b1279f44b2279f44b3279f44b4279f44b5"+
    "27a0448027a0448127a0448227a0448325a0448a10a0448e27a044911ca044921ca0449327a044940ea044950ea044960ea044970ea044980ea0449927a0449a1da0449b1da0449c1da0449d0ea0449e28a0449f28a044a03ca044a13ca044a23ca044a30ea044a43da044a53da044a60ea044a718a044a827a044aa0ea1448927a144903ca144923ca144933ca1449428a1449528a1449628a1449728a144980ea144991da1449a1da1449b1da1449c0ea1449d28a1449e28a1449f3ca144a03ca144a13ca144a2"+
    "18a144a30ea144a40ea144a518a144a61ca144a727a144a80ea2448827a2448f3ca244913ca244923ca2449328a2449428a2449528a2449628a244970ea2449818a244991da2449a1da2449b0ea2449c28a2449d28a2449e3ca2449f3ca244a03ca244a11ca244a218a244a31ca244a41ca244a527a244a70ea3448727a3448e3ca344903ca344913ca3449228a3449328a3449428a3449528a344960ea344971da3449818a344991da3449a0ea3449b28a3449c28a3449d28a3449e0ea3449f07a344a007a344a1"+
    "07a344a227a344a625a4448527a4448e27a444900ea4449127a4449228a4449328a4449428a444950ea4449618a444971da444981da444990ea4449a28a4449b28a4449c28a4449d0ea4449e1ca4449f1ca444a007a444a127a444a425a5448427a5448d0ea5449128a5449228a5449328a544940ea5449529a5449629a5449729a544980ea5449928a5449a28a5449b28a5449c0ea5449d1ca5449e1ca5449f07a544a027a544a327a6448c27a644900ea644910ea644920ea6449327a644940ea6449828a64499"+
    "28a6449a28a6449b0ea6449c1ca6449d1ca6449e07a6449f27a644a226a644a727a644a80ea7448227a7448b07a7448f1ca744901ca744911ca7449207a7449327a744970ea744980ea744990ea7449a27a7449b1ca7449c1ca7449d07a7449e27a744a127a744a826a744a926a744ab26a744b527a744b60ea8448127a8448b07a8448e1ca8448f1ca844901ca8449107a8449207a8449a1ca8449b1ca8449c07a8449d27a8449f26a844a027a844a427a844a526a844a626a844a726a844a926a844ab27a844b6"+
    "26a9444a26a9444c0fa9447f27a9448a07a9448d07a9448e07a9448f07a9449007a9449110a9449507a9449907a9449a07a9449b07a9449c27a9449e26a944a527a944a726a944aa26a944ab26a944ae27a944b227a944b326a944b426a944b526aa444a26aa444c0faa447d27aa448a27aa449d26aa449f26aa44a026aa44a126aa44a226aa44a627aa44a726aa44a826aa44b327aa44b526ab444b26ab444c0fab44790fab447a27ab448a27ab448b27ab449c26ab44a626ab44ad26ab44ae26ab44af26ab44b0"+
    "26ab44b427ab44b526ab44b60fac447727ac448b27ac449927ac449a26ac44a426ac44a526ac44b427ad448b27ad448c27ad449427ad449527ad449627ad449726ad44b226ad44b326ae445a26ae445b27ae448c27ae449027ae449127ae449226af445a26af445b26b0445726b0445826b0445926b1445704b1445826b1445926b1445b26b1445c26b144ab26b144ac26b2445426b2445526b2445926b2445b26b2446726b244aa26b3445426b3445626b3445826b3445a26b3446a26b344a726b344a827b344a9"+
    "26b344aa26b344ae26b344af26b344b026b344b126b4445326b4445726b4445926b4445a26b4445b26b4446604b4446726b444a526b444a627b444a926b444ab26b5445426b5445626b5446526b5446626b5446726b544a526b544a626b544a726b544a926b544aa27b544ab27b544ac26b544b0266a4569266a456a266a456b266b456a266b456b266d4565266d4566266e4564386f457016714564157245632672459c1573456215744561267445992674459a1575456026754595267545992675459a3876454e"+
    "1576455f15764560157645611576456215764563167645642676456726764598267645992676459a1577455e3a77455f3c7745603a77456126774564267745653877456926774595267745960078454c1578455d3c78455e3c784560267845662678458f26784594267845951679455c3a79455d3c79455e3a79455f2679456226794563347945662679458c2679458f387945b6267a4561267a4562267a4563267a4565267a458e267a458f267a4590267b4562387b456f267b4586267b4589267b458b267b458e"+
    "267b458f267b4590267b4591167c454a167c454b167c454c167c454d167c454e167c454f167c4550167c4551167c4552007c456e267c4588267c4589267c458a267c458b267c458c267c458f267c4590167c45b6147d454a147d454b147d454c147d454d147d454e147d454f357d4550167d4551167d4556167d455a387d456d267d4584267d4589267d458a267d458b267d458d267d458e267d458f387d45b0167d45b5147d45b6167e454a167e454b167e454c3c7e454d167e454e167e454f167e4550177e4554"+
    "007e4555347e4556347e4557347e4558007e4559177e455a277e4587267e458a267e458c267e458f267e4590167e45b4147e45b5167e45b63c7f454b3c7f454d177f4553357f4554357f4558177f4559387f456a267f4584277f4588267f458b267f458e267f458f387f45a8167f45b3147f45b4167f45b53c80454b178045523580455335804557178045582780455e3580455f3580456000804561278045623880456826804584268045852680458a388045a1168045b2358045b3168045b41781455135814552"+
    "38814553388145543881455535814556178145572781455c1281456035814561358145620081456335814564358145652781456600814567268145842681458a168145b1168145b2168145b3388245502782455136824552368245533682455427824555278245563582455b0682456005824561068245621e8245631e8245643582456538824566268245853882459e278245b2358245b31b8245b4358245b5278245b63883454f0083455036834551368345523683455322834554008345553583455a32834560"+
    "068345633583456426834577358345b1278345b51b8345b62784454a3884454e0084454f3684455036844551368445523684455300844554358445593584456338844565268445761b8445b0358445b63885454d0085454e3685454f36854550368545513685455200854553358545583585456200854564268545732685457426854576268545781b8545af358545b53886454c0086454d3686454e3686454f368645503686455100864552358645573c86455d3c86455e3c86455f128645600086456138864563"+
    "26864573268645742786457526864577358645ae3a8645af398645b03a8645b1358645b43887454b0087454c3687454d3687454e3687454f3687455000874551278745563c87455c3c87455e3587455f27874560388745612687456f2687457027874572278745ad3c8745ae3c8745b0278745b1358745b2278745b33888454a2788454b0088454c0088454d0088454e0088454f27884550278845563588455735884558358845592788455a3c88455b3c88455c3c88455d2688457126884572278845983c8845ad"+
    "3c8845ae3c8845af2389454a108945573889455f2689456f388945972789459f008945a0278945a1108a4558008a455e008a4595168a4599168a459a168a459b168a459c168a459d008a459e228a459f008a45a0168a45a1238a45ad108b45540c8b4556388b455e388b4594168b4598358b4599148b459a148b459b148b459c278b459d008b459e278b459f168b45a0108c4555278c455e388c455f278c4593168c4597168c45983c8c45993c8c459a3c8c459b168c459c168c459d168c459e168c459f108c45af"+
    "108c45b0108c45b1108c45b2108c45b3108c45b4108c45b5348d4559278d455a348d455b388d45923c8d45983c8d459a108d45ae028d45af028d45b0028d45b1028d45b2028d45b3108d45b4348e4558388e455e278e45923a8e45973c8e45983a8e45993c8e45a63c8e45a73c8e45a8108e45ad118e45ae028e45af028e45b0028e45b1028e45b2108e45b3008f455e388f4591268f45943c8f45a43c8f45a53c8f45a63c8f45a73c8f45a8278f45ac358f45ad358f45ae338f45af338f45b0358f45b1278f45b2"+
    "3890455d0090459027904593269045943c9045a33c9045a4229045a53c9045a63c9045a7359045ab069045af019045b0359045b1269045b52691454f3891455c2791458f269145922691459326914594109145a13c9145a23c9145a33c9145a53c9145a6109145a7359145aa389145ab369145ac009145ad059145ae069145af279145b0359145b1279145b21092454a26924551109245533892458e3c9245a2339245a33c9245a4339245a9009245ac369245ad369245ae009245af3c9245b10093458e3c934594"+
    "3c9345953c934596339345a8059345ab059345ad3a9345af3c9345b03c9345b1269445692694456b3894458d279445923c9445933c94459527944596359445a7069445aa069445ac1a9445ae0a9445af3c9445b02795458b3595459135954595359545a63a9545ad3c9545ae3c9545af279545b30e9545b40e9545b50e9545b60e96454a0e96454b0e96454c0e96454d0e96454e0e96454f0e9645500e96455127964552239645553896455726964566269645682796458a1b964590339645942796459d0e96459e"+
    "3396459f0e9645a0279645a1359645a5129645a60d9645a70d9645a80e9645a90e9645ab3c9645ad0e9645b2209645b3209645b4209645b5209645b62097454a2097454b2097454c2097454e2097454f209745500e974551279745562697456604974568279745883597458f339745930e97459c1297459d0e9745a0279745a4359745a5359745a6359745a70e9745a8229745a90e9745aa359745ab279745ac0e9745b1209745b2209745b52098454a2098454c2098454d2098454e2098454f0e98455038984555"+
    "26984565279845863398458e00984592279845990e98459a2798459b0e98459f0e9845a60e9845a70e9845a80e9845a90e9845aa339845b02099454d2099454e0e99454f009945532699456526994566279945843599458d1b994591239945950e994598059945993a99459d3c99459e3c99459f0e9945a60e9945a70e9945a8109945ab339945af209945b6209a454d0e9a454e389a4552279a4583279a458c009a458d1b9a458e359a458f279a45900e9a4597069a45981a9a459c0a9a459d3c9a459e0e9a45ae"+
    "209a45b2209a45b3209a45b5209b454a209b454c0e9b454d279b4551279b45820e9b4596229b45973a9b459b3c9b459c3c9b459d0e9b45ad209b45ae209b45b0209b45b1209b45b5209b45b6209c454a209c454b0e9c454c009c4550279c4581279c45950e9c45960e9c45970e9c4598339c45990e9c459a279c459b0e9c45ac209c45ad209c45ae209c45af209c45b0209c45b3209c45b4209c45b5209c45b6209d454a0e9d454b279d454e389d4581279d458b279d458c279d458d279d4591279d4592109d4596"+
    "409d4597409d4598409d4599109d459a109d459d0f9d45a9279d45ab0e9d45ac0e9d45ad0e9d45ae0e9d45af0e9d45b00e9d45b10e9d45b20e9d45b30e9d45b40e9d45b50e9d45b6279e454a279e454d279e4581009e4589279e4592109e4595409e4596409e4597409e4598109e4599269e459b269e45a30f9e45a60e9e45a70e9e45a80f9e45a9279f454a279f454b389f4580279f4585279f4586279f45870f9f458a279f4591109f4594109f4595409f4596409f4597109f4598279f459f0e9f45a00e9f45a1"+
    "0e9f45a2279f45a30f9f45a40e9f45a50c9f45a70e9f45a8279f45ac279f45ad279f45ae279f45af279f45b0279f45b1279f45b2279f45b3009f45b4279f45b527a0458000a0458127a0458200a045830fa0458a23a0458e27a0459126a0459227a045940ea045950ea045960ea045970ea045980ea0459927a0459a0ea0459e0da0459f3aa045a13ca045a23ca045a30ea045a40ea045a70fa045a827a045aa0fa1458927a145903ca145923ca1459312a1459501a145960da145980ea1459933a1459d1aa145a0"+
    "0aa145a13ca145a20fa145a30ea145a40ea145a50fa145a627a145a827a2458f3ca245911aa2459206a2459533a2459833a2459c3aa2459f3ca245a03ca245a10fa245a300a245a70fa3458727a3458e3ca345903ca345911fa345921fa3459306a3459406a3459633a345970ea3459b05a3459c06a3459d12a3459e0ea3459f10a345a010a345a110a345a200a345a60fa4458527a4458e27a445900ea4459127a4459232a4459405a445950ea445960ea4459a32a4459b06a4459c01a4459d0ea4459e30a4459f"+
    "30a445a010a445a127a445a40fa5458427a5458d0ea5459106a545940ea545950ea5459933a5459d30a5459e30a5459f10a545a027a545a326a545a80fa6458327a6458c27a6459033a645910ea645920ea6459327a645940ea645982fa645992fa6459a0ea6459c30a6459d30a6459e10a6459f00a645a227a645a726a645a826a645a926a645b627a7458b10a7458f40a7459040a7459140a7459210a7459327a745970ea745980ea745990ea7459a27a7459b30a7459c30a7459d10a7459e27a745a126a745a2"+
    "26a745a426a745a627a745a826a745a927a745b526a745b626a8454a27a8458b10a8458e40a8458f40a8459040a8459110a8459210a8459a30a8459b30a8459c10a8459d27a8459f26a845a026a845a326a845a626a845a726a845b026a845b226a845b427a845b626a9454a27a9458a10a9458d10a9458e10a9458f10a9459010a9459123a9459510a9459910a9459a10a9459b10a9459c27a9459e26a9459f27a945a226a945ae26a945b126a945b426a945b527aa458a27aa459d26aa459e26aa45a926aa45ad"+
    "27aa45b027ab458a27ab458b27ab459c26ab45a626ab45a826ab45ac26ac454a00ac458b27ac459927ac459a26ac45b426ac45b627ad458b27ad458c27ad459427ad459527ad459600ad459726ae455926ae455a27ae458c27ae459027ae459127ae459226af455826b0455526b0455826b0455926b0455c26b0455d04b1455826b1455926b1455c26b1456926b1456b26b2455326b2455526b2455726b2455826b2456a26b245a826b245aa26b3455726b3455826b3455b26b3456a26b345a726b345a826b345a9"+
    "26b345b226b4455326b4455526b4455926b4455b26b4456604b4456726b4456a26b445a827b445ae26b445b126b5455626b5455726b5456526b5456726b545a126b545a226b545a526b545a626b545a926b545aa26b545ad26b545b02674469b267546972675469926764696267646973c77466026774665267746963878464c3c78465e3c784660267846943c79465e2679466326794666267a4663267a4689267a468d267a468e267a4690267b4688267b468d267b468e387c466e267c4687267c468b267c468c"+
    "267c468e157d464a157d464b157d464c157d464d157d464e157d464f157d4650167d4651177d4655147d4656147d465a177d465b267d4687277d4688267d4689267d468a267d468b267d468e157d46b63c7e464d177e4654007e4655347e4656347e4657347e4658007e4659177e465a267e4685267e4686267e4687267e4688267e4689267e468a267e468d267e468e267e468f157e46b53c7f464b3c7f464d177f4653357f4654237f4656357f4658177f4659217f4661267f4684277f4685267f4686267f4687"+
    "277f4688267f468c267f468d267f468f157f46b43c80464b178046523580465335804657178046582780465e3580465f1b8046603580466127804662268046852680468626804687158046b3178146513581465234814653348146543481465535814656178146572781465c3581466135814662358146633581466435814665278146663881466726814686168146b2168146b31682464a1682464b3882464f388246502782465120824652208246532082465427824655278246560082465b3582466526824679"+
    "2682467a26824680268246812682468526824686168246b1278246b2358246b3358246b4358246b5278246b61683464a1683464b1683464c3883464e2083464f2083465020834651348346553583465a098346603583466426834679158346b0358346b1278346b5358346b62784464a1684464b3884464d2084464e2084464f2084465034844654218446581b8446591b844663218446642684467526844677178446af358446b0358446b63885464c2085464d2085464e20854651208546523485465335854658"+
    "35854662388546642685467426854675268546762785467726854679178546ae358546af358546b53886464b2086464c2086464f208646502086465134864652358646573c86465d3c86465e3c86465f12864660358646612686467126864672268646732686467526864676158646ad358646ae3c8646af3a8646b03c8646b1358646b43887464a2087464d2087464e2087464f2087465034874651278746563c87465c3c87465e3587465f278746602687466f2787467226874673268746742687467526874676"+
    "26874677168746ac278746ad3c8746ae3c8746b0278746b1358746b2278746b3168746b4388746b63888464a2788464b3588464c3588464d3588464e3588464f2788465027884656358846571b884658358846592788465a3c88465b3c88465c3c88465d2688466f26884673268846742688467500884698378846a0358846a1378846a2168846ab168846ac3c8846ad3c8846ae3c8846af168846b0168846b1168846b2168846b30f894656108946570f8946592689466e3789469e2789469f008946a0278946a1"+
    "378946a2108a4658388a465e268a466f268a4670388a4695358a469d008a469e228a469f008a46a0358a46a1108b46540c8b4656168b4698158b4699158b469a158b469b378b469c278b469d008b469e278b469f378b46a00f8c4653108c46550f8c4656268c4659268c465b268c465d388c465e008c46933c8c46993c8c469a3c8c469b378c469c358c469d378c469e268d4658268d4659348d465a278d465b348d465c348d465d3c8d46983c8d469a268e4656348e4657348e4658348e465a388e4692268e4695"+
    "3a8e46983a8e46a63c8e46a73a8e46a8268f4656268f4657388f465e268f4693348f4694268f46953a8f46a43c8f46a53c8f46a63c8f46a73a8f46a8278f46ac358f46ad358f46ae338f46af338f46b0008f46b1278f46b2389046902690469234904693269046943c9046a33c9046a4229046a53c9046a63c9046a7359046ab1b9046b1219046b22791468f2691469126914693239146a13a9146a23c9146a33c9146a53a9146a6239146a7009146aa279146b0359146b1279146b22392464a2392465326924692"+
    "3a9246a2339246a33a9246a4339246a93c9246b13893468e16934692169346933c9346943c9346953c9346961693469716934698339346a83a9346af3c9346b03c9346b116944691279446923c9446933c9446952794469616944697219446a6359446a73c9446b03895468b159546903595469135954695159546961b9546a63a9546ad3c9546ae3c9546af279546b3359546b4359546b5359546b63596464a3596464b3596464c3596464d3596464e3596464f3596465035964651279646522696466826964669"+
    "0096468a1796468f3596469035964694179646952796469d3596469e3396469f359646a0279646a1009646a50e9646a90e9646ab3c9646ad359646b2209646b32097464a2097464b2097464f209746503597465138974656269746652697466604974668389746881597468e3597468f00974693179746942197469b1b97469c1b9746a0219746a1279746a4009746a51b9746a6359746a70e9746a8229746a90e9746aa359746ab279746ac359746b12098464d2098464f35984650269846662698466727984686"+
    "1798468d3598468e3598469215984693279846993598469a2798469b3598469f219846a53b9846a60e9846a70e9846a80e9846a93b9846aa339846b03599464f3899465326994666279946841599468c3599468d359946911799469221994697359946983c99469e3c99469f3b9946a60e9946a73b9946a8239946ab339946af209a464d359a464e009a4683169a468b279a468c359a468d359a468e009a468f279a4690159a46911b9a46973c9a469e359a46ae359b464d279b4651389b4682169b468a169b468b"+
    "169b468f169b4690359b4696229b46973c9b469c3c9b469d359b46ad209b46b1209b46b5209b46b6209c464b359c464c389c4650009c4681279c4695359c46961b9c4697359c4698339c4699359c469a279c469b359c46ac209c46ad209c46af209c46b3209c46b4209c46b5209c46b6209d464a359d464b389d464e279d468b279d468c009d468d279d4691279d4692219d4696409d4697409d4698409d4699239d469d279d46ab359d46ac359d46ad359d46ae359d46af359d46b0359d46b1359d46b2359d46b3"+
    "359d46b4359d46b5359d46b6279e464a009e464d389e4681389e4689009e4692409e4696409e4697409e4698219e46a2109e46a70f9e46a8389f464a389f464b279f4685279f4686009f4687279f4691409f4696409f4697219f4699279f469f359f46a01b9f46a1359f46a2279f46a30f9f46a50c9f46a7109f46a8009f46ac279f46ad279f46ae009f46af279f46b0009f46b1279f46b2279f46b3389f46b4389f46b500a0468038a0468127a0468238a0468327a0469127a0469435a0469535a0469635a04697"+
    "1ba0469835a0469927a0469a35a0469e3ca046a23ca046a310a046a40fa046a738a046aa27a146903aa146923ca1469335a1469933a1469d10a146a03ca146a20fa146a410a146a527a146a827a2468f3ca2469133a2469833a2469c3ca246a03ca246a138a246a727a3468e3aa346903ca3469133a3469700a3469b35a3469f38a346a626a346aa27a4468e27a4469035a4469127a4469209a4469435a4469635a4469a09a4469b35a4469e30a4469f30a446a027a446a426a446ab26a5464b27a5468d21a54690"+
    "1ba5469135a546951ba5469933a5469d30a5469e30a5469f27a546a326a546a526a546aa26a546ab26a6464c27a6468c27a6469033a6469135a6469235a6469327a6469421a6469735a6469835a6469c30a6469d30a6469e38a646a226a646a427a646a726a646ab26a646b326a7464b26a7464c00a7468b40a7469040a7469140a7469227a7469700a746981ba7469935a7469a27a7469b30a7469c30a7469d00a746a126a746a326a746a527a746a826a746b227a746b526a8464c27a8468b40a8468f40a84690"+
    "40a8469121a8469830a8469b30a8469c27a8469f26a846a126a846a626a846ab26a846b126a846b327a846b627a9468a27a9469e26a9469f26a946a326a946a526a946a626a946af26a946b426aa464c27aa468a27aa469d26aa469f26aa46a126aa46a626aa46a926aa46ad26aa46b126aa46b326aa46b427ab468a27ab468b00ab469c26ab469f26ab46a126ab46ad26ab46af26ab46b426ac464a38ac468b00ac469938ac469a26ac46a026ac46a326ac46ad26ac46af27ad468b00ad468c00ad469438ad4695"+
    "00ad469638ad469726ad46ae26ad46b126ae465926ae465a27ae468c27ae469000ae469127ae469226af465b26b0465d26b1465426b1465604b1465826b1465926b1465a26b1465c26b1465d26b146ad26b146b026b2465826b2465926b2466826b2466926b2466a26b2466b26b246af26b246b126b3465326b3465426b3465526b3465626b3465726b3465826b3465c26b3466626b3466926b3466a26b346a726b346a826b346a926b346aa26b346af26b346b126b4465426b4465726b4465826b4465926b44665"+
    "04b4466726b4466926b4466a26b446a526b446aa26b446ab26b446ad26b446b126b5465426b5465526b5465626b5465726b5465826b5465a26b5466326b5466526b5466826b546a126b546a526b546aa26b546af3a7747603a78475e0a78475f3a7847603a79475e267a478c267b478a267c478b267c478c267c478d167d4756167d4757157d4758167d4759167d475a267d4786277d4788267d4789267d478b3a7e474d147e4755007e4756007e4757007e4758147e4759267e4784267e4786267e4787277e478a"+
    "3a7f474b0a7f474c3a7f474d147f4754357f4755357f4756357f4757147f4758167f475e167f475f217f4761167f4763167f4764267f4784277f4785267f4786267f47873a80474b14804753358047543580475535804756148047571680475c1680475d2780475e3580475f1b804760358047612780476216804763168047641680476516804766168047671680476826804781268047832680478426804785278047872680478a168147511681475235814753358147543581475516814756168147581681475b"+
    "2781475c1681475d358147613581476235814763358147643581476527814766168147672681478426814786168147b3168147b4168147b61682474a27824751208247522082475327824755278247563582475b00824765168247b2358247b3358247b4358247b5168247b620834750348347553583475a35834764268347772683478026834781168347b1168347b2168347b4168347b5168347b61684474a1684474b2084474e2084474f2084475034844754218447581b8447591b8447632184476426844775"+
    "268447772684477826844779178447af168447b0168447b1168447b3168447b4168447b5358447b61685474a34854753358547580085476226854777178547ae168547af168547b0358547b52086474f2086475134864752008647573c86475d3c86475e3c86475f0d8647603586476126864776168647ae3c8647af3c8647b03c8647b1168647b2168647b3358647b4168647b52087474e2087474f20874750348747511687475527874756168747571687475b3c87475c3c87475e3587475f2787476016874761"+
    "2687477026874776168747ad3c8747ae3c8747b0168747b1168747b2168747b3168747b42788474b3588474c0088474d3588474e3588474f27884750168847541688475527884756358847571b884758358847592788475a3c88475b3c88475c3c88475d1688475e1688475f168847602688477538884798368847a0358847a1368847a2168847ac3c8847ad3c8847ae3c8847af168847b0168847b61689475016894754168947550f8947570f894758168947591689475a1689475b268947713689479e368947a2"+
    "0f8a47550f8a47560f8a47570f8a4758358a479d068a479e358a47a10f8b47540f8b47550f8b47560f8b4757268b475c268b475d268b475f368b479c058b479d328b479e368b47a00f8c47540f8c4755348c475b348c475c348c475e268c475f388c47933a8c47993c8c479a3a8c479b368c479c358c479d368c479e268d4757268d4758268d475a348d475b348d475d268d475e3c8d47983c8d479a268e4756268e4757268e4759348e475a348e475b388e4798398e47a7268f4756348f4759268f475a268f4794"+
    "3c8f47a53c8f47a63c8f47a7278f47ac008f47ad358f47ae358f47af358f47b0358f47b1278f47b22690475826904794399047a33c9047a4229047a53c9047a6399047a7359047ab359047b13891478f2691479226914793269147943c9147a33a9147a43c9147a5359147aa279147b0359147b1279147b2399247a3359247a93c9247b1169347933c9347943c9347953c93479616934797359347a83a9347af3c9347b03c9347b12694476b169447923c9447933c94479516944796359447a7399447ae3c9447b0"+
    "179447b3179447b4179447b5179447b61795474a1795474b1795474c1795474d1795474e1795474f1795475017954751179547521795475317954754169547913c9547923c9547933c95479416954795359547a63a9547ad3c9547ae3c9547af179547b2279547b3359547b4359547b5359547b63596474a3596474b3596474c3596474d3596474e3596474f35964750359647512796475217964753269647683896478a1796478f16964790169647911696479316964794179647952796479d3596479e3596479f"+
    "359647a0279647a1359647a50e9647a90e9647aa0e9647ab3c9647ad359647b220974750359747512697476626974767049747681697478f169747901697479216974793179747943597479c359747a0279747a4359747a5359747a6359747a70e9747a8229747a90e9747aa359747ab279747ac359747b135984750389847861798478d1698478e1698478f1698479116984792279847993598479a2798479b3598479f0e9847a70e9847a80e9847a9359847b03599474f26994765009947841699478d1699478e"+
    "16994790169947911799479235994798239947993a99479d3c99479e3c99479f3b9947a7359947af359a474e269a4765389a4783169a478c359a478d009a478e359a478f169a4790359a4797399a479c3c9a479e359a47ae359b474d389b4751169b478b169b478c169b478e169b478f009b4796229b47973a9b479b3c9b479c3c9b479d359b47ad359c474c389c4781279c4795359c4796359c4797009c4798359c4799359c479a279c479b359c47ac209c47b4209d474a359d474b389d478b009d478c389d478d"+
    "009d4791279d4792179d47aa279d47ab359d47ac359d47ad359d47ae359d47af359d47b0359d47b1359d47b2359d47b3359d47b4359d47b5359d47b6279e474a179e474b389e474d389e4792219e47a2109e47a7179e47a9179e47aa179e47ab179e47ac179e47ad179e47ae179e47af179e47b0179e47b1179e47b2179e47b3179e47b4179e47b5179e47b6179f474a389f4785009f4786389f4787009f4791169f4794169f4795169f4796169f4797169f479b169f479c279f479f359f47a01b9f47a1359f47a2"+
    "279f47a30c9f47a7109f47a8389f47ac279f47ad279f47ae389f47af279f47b0389f47b1009f47b2389f47b338a0478038a0478227a0479116a0479327a0479435a0479535a0479600a0479735a0479835a0479927a0479a16a0479b35a0479e3aa047a13ca047a23ca047a310a047a427a147903ca1479310a1479435a1479915a1479a35a1479d3aa147a03ca147a210a147a538a147a800a2478f3ca2479110a2479335a2479817a2479935a2479c3aa2479f3ca247a03ca247a138a3478e3ca3479110a34792"+
    "35a3479717a3479835a3479b35a3479f26a347a926a347aa26a347ae26a347af00a4478e16a4478f27a4479035a4479127a4479235a4479615a4479700a4479a35a4479e38a447a426a447a926a5474a26a5474b26a5474f26a5475027a5478d16a5478e16a5478f16a5479035a5479135a5479516a5479635a5479935a5479d00a547a326a547a826a547a926a547aa26a6474a27a6478c16a6478f27a6479035a6479135a6479235a6479327a6479416a6479535a6479835a6479c27a647a726a647a826a647a9"+
    "27a647aa26a647ab26a647b626a7474a26a7474b38a7478b16a7478e16a7478f16a7479316a7479427a7479735a747981ba7479935a7479a27a7479b38a747a126a747a226a747a526a747a626a747a726a747a826a747a926a747aa27a747b526a747b626a8474a27a8474b26a8474c00a8478b21a8479800a8479f26a847a426a847a526a847a627a847a726a847a826a847b026a847b326a847b426a847b526a847b626a9474a26a9474b38a9478a27a9479e26a947a326a947a826a947b226a947b326a947b4"+
    "27a947b526a947b627aa478a00aa479d26aa47a726aa47b126aa47b600ab478a38ab478b38ab479c26ab47a126ab47a626ab47b538ac479926ac47af26ac47b400ad478b38ad478c38ad479438ad479600ae478c00ae479038ae479127ae479226af475826af475926b0475626b0475826b0475a26b0475b26b1475504b1475826b1475926b1475a26b2475726b2475926b2475a26b2475b26b2476926b2476b26b247aa26b247af26b3475526b3475626b3475726b3475926b3475a26b3475b26b3476726b34768"+
    "26b3476b26b347a926b4475326b4475426b4475626b4475726b4475826b4475a26b4476426b4476504b4476726b4476a26b447a726b447a826b447ad26b5475526b5475626b5475826b5476526b5476626b547a326b547a426b547a626b547a827b547a926b547aa26b547ab26b547ac387748603878485e387848603879485e267a488b267a488c267b4888267b488a267b488c267b488e267c4887157d4857157d4858157d4859277d4888267d488a267d488e387e484d157e4856147e4857157e4858267e4884"+
    "267e4885267e4886267e4887267e4888267e4889277e488a387f484b387f484d177f4854157f4855147f4856157f4857177f4858167f485f167f4860167f4862167f4863277f4885267f4886267f4888267f488a3880484b1580485414804855158048561680485e3580485f3580486035804861168048622680488326804884268048852680488627804887268048882680488914814851158148531581485415814855148148581681485b1681485c1681485d1681485e2381485f168148601681486116814862"+
    "1681486316814864168148651681486616814867268148822681488426814887168148b4168148b5168148b6278248512082485227824855278248561682485a3582485b1682485c1682485d1682485f1682486016824861168248621682486316824864358248651682486626824881168248b3358248b4168248b5348348553583485a35834864268348772683488026834881168348b2148348b3168348b42084484f3484485400844859358448632684487626844877168448b1148448b2168448b3168448b4"+
    "168448b5168448b61685484a34854853358548583585486226854875268548762685487726854879168548b0148548b1148548b2148548b3148548b4358548b5168548b62086485134864852168648563586485716864858168648591686485b1686485c3c86485d3c86485e3c86485f1686486035864861168648622686487226864873268648763c8648af3c8648b03c8648b1168648b2168648b3168648b4168648b52087484f3487485116874855168748561687485716874858238748591687485a1687485b"+
    "3c87485c3c87485e1687485f168748601687486126874871268748723c8748ae3c8748b02788484b3588484c3588484d3588484e0088484f27884850168848563588485735884858358848591688485a3c88485b3c88485c3c88485d348848a13c8848ad3c8848ae3c8848af148848b6148948501689485516894856168948581689485926894872348a489d348a48a1098b489e268c485a348c485b268c485c268c485d268c485e3c8c489a348c489d268d4858268d485c268d485d3a8d48980a8d48993a8d489a"+
    "268e4859348e485b388e4898158e48ac158e48ad158e48b3158e48b4268f4858268f4859268f485a268f485b108f48a53c8f48a6108f48a7158f48ab278f48ac358f48ad358f48ae008f48af358f48b0358f48b1278f48b2158f48b326904858269048593c9048a4229048a53c9048a6159048aa009048ab359048b1159048b2159048b3159048b42691485726914893109148a33c9148a4109148a5159148a9359148aa279148b0359148b1279148b2159148b3159248a8359248a93c9248b13a9348943c934895"+
    "3a934896159348a7009348a83c9348b03a9348b13c9448933c944895159448a6359448a73c9448ae3c9448b0269548682695486a169548923c954893169548943795489e3895489f389548a0389548a1379548a2159548a5359548a63c9548ae3a9548af149548b2149548b3149548b4149548b5149548b61496484a1496484b1496484c1496484d1496484e1496484f149648501496485114964852149648531696489114964892169648932796489d2896489e2896489f289648a0279648a1159648a4359648a5"+
    "0e9648a90e9648aa0e9648ab3c9648ad359648b23597485126974867269748681697489014974891169748922797489c2897489d2897489e2897489f279748a0159748a3279748a4359748a5359748a6009748a70e9748a8229748a90e9748aa359748ab279748ac159748ad359748b135984850269848651698488f149848901698489137984898279848992798489a2798489b2898489c2898489d2898489e2798489f159848a2159848a3109848a70e9848a8109848a9159848aa159848ab159848ac349848b0"+
    "3499484f26994866389948841699488e1499488f169948903899489728994898289948992899489a2899489b2899489c3c99489d3c99489e3c99489f349948af349a484e169a488d359a488e169a488f389a4896289a4897289a4898289a4899289a489a289a489b3c9a489c3c9a489e349a48ae349b484d169b488c169b488d169b488e389b4895289b4896229b4897289b4898289b4899289b489a3c9b489b3c9b489c3c9b489d359b48ad359c484c379c4894279c4895279c4896279c4897279c4898279c4899"+
    "279c489a279c489b359c48ac359d484b389d488c389d4891279d4892149d48aa149d48ab149d48ac149d48ad149d48ae149d48af149d48b0149d48b1149d48b2149d48b3149d48b4149d48b5149d48b6149e484a149e484b169e489f169e48a0169e48a4169e48a50f9e48a6109e48a70f9e48a9389f4886389f4891169f4897169f4898169f489a169f489b169f489e279f489f359f48a0359f48a1359f48a2279f48a3169f48a40c9f48a7109f48a8009f48ad389f48ae389f48b0389f48b238a0489116a04893"+
    "16a0489416a0489516a0489635a0489700a0489835a0489916a0489a16a0489d35a0489e3aa048a13ca048a23ca048a310a048a400a1489016a148923ca148933ca1489416a1489516a1489616a1489816a1489916a1489c35a1489d3ca148a03ca148a20fa148a310a148a50fa148a638a2488f3ca248913ca2489323a2489516a2489716a2489817a2489916a2489b35a2489c3aa2489f3ca248a03ca248a126a248ae26a248af16a348903ca348913ca3489216a3489316a3489416a3489616a3489717a34898"+
    "16a3489a35a3489b35a3489f16a348a026a4484f26a4485038a4488e16a4488f16a4489016a4489116a4489216a4489323a4489416a4489516a4489616a4489935a4489a35a4489e16a4489f26a448a926a448ab00a5488d16a5489116a5489216a5489416a5489516a5489835a5489935a5489d16a5489e38a548a326a548a527a548a826a548aa26a548ab26a548ac26a548ae26a6484a26a6484c38a6488c16a6489035a6489135a6489235a6489316a6489416a6489735a6489835a6489c16a6489d26a648a8"+
    "26a648a927a648aa26a648ab26a648b327a648b626a7484b26a7484c26a7484d26a7484f16a7488f16a7489016a7489216a7489316a7489627a7489735a7489835a7489900a7489a27a7489b16a7489c27a748a526a748a826a748a926a748ab26a748b626a8484a27a8484b26a8484c38a8488b16a8489516a8489616a8489a16a8489b38a8489f26a848a426a848a627a848a726a848a927a848b326a848b626a9484a26a9484c27a9489e26a948a226a948a326a948a426a948b226a948b427a948b526aa484a"+
    "00aa488a38aa489d26aa48a526aa48b026aa48b126aa48b238ab488a26ab48a326ab48b326ac48b138ad488b26ae485926ae485a26ae485b38ae488c38ae489038ae489226af485826af485a26b0485526b0485826b0485926b0485a26b1485426b1485604b1485826b1485926b1485b26b1486a26b2485526b2485626b2485926b2485a26b2485b26b2486826b2486a26b248ad26b3485426b3485526b3485626b3485826b3485926b3485a26b3485b26b3486926b3486b26b348a726b348a826b348a926b348ab"+
    "26b4485626b4485826b4485926b4486526b4486604b4486726b4486826b4486a26b448a626b448a826b448ac26b448ad26b448ae26b5485526b5485626b5485926b5486526b5486726b5486926b548a426b548a526b548a626b548a727b548a926b548aa26b548ac26b548af26b548b0387749603878495e387849603879495e267b4988277c4988267c4989267c498b267d4986267d4987267d4989267d498b387e494d267e4986387f494b387f494d167f4960167f4961167f4962267f4985267f4986267f498c"+
    "3880494b1680495f3580496016804961268049842680498526804986278049872680498a1481495114814952158149531581495614814957148149581681495e1481495f168149602681498526814988168149b53882494f2782495027824951278249522782495327824954278249552782495627824957388249581682495a1682495b1682495c1682495d1482495e1682495f168249601682496116824962168249631682496416824965168249662682498226824985158249b434834955168349593583495a"+
    "1683495b1683495c1683495d1683495e1683495f1683496016834961168349621683496335834964168349652683498426834985158349b334844954358449592384495a238449623584496326844978158449b2348549531685495735854958168549591685495a1685495b1685495c1685495d1685495e1685495f1685496016854961358549621685496326854976158549b1158549b2158549b3158549b4158549b5168549b634864952168649561686495716864958168649591486495a1686495b1686495c"+
    "3c86495d3c86495e3c86495f16864960168649611686496226864973268649743a8649af3c8649b03a8649b13487495116874958148749591687495a3c87495c3c87495e268749712687497326874974178749a1178749a2178749a33c8749ae3c8749b0388749b62788494a2788494b2788494c2788494d2788494e2788494f2788495027884951388849521688495735884958168849593c88495b3c88495c3c88495d1788499f348849a1178849a33a8849ad3c8849ae3a8849af148849b61489494a1589494b"+
    "1589494e1489494f148949501689495616894957168949581789499d178949a3178a499c348a499d348a49a1178a49a2178b499b178b49a1268c495b268c495d3a8c499a178c499b348c499d178c499f268d4959268d495a268d495c388d4998388d499a178d499b178d499c178d499d268e495b268e495c388e4998158e49ad158e49ae158e49af158e49b1158e49b2158e49b3268f4958108f49a53c8f49a6108f49a7158f49ac148f49ad358f49ae358f49af358f49b0148f49b1158f49b23c9049a4229049a5"+
    "3c9049a6159049ab149049ac159049ad159049af149049b0159049b1109149a33c9149a4109149a5159149aa149149ab159149ac239149ad159149ae149149af159149b0159149b1159149b2159149b3159249a9149249aa159249ab159249ad149249ae149249af149249b0149249b1159249b23c934995159349a8149349a9159349aa159349ac159349ad159349ae159349af3c9349b0159349b13c9449933c944995159449a7149449a8159449a9239449ac3c9449ae3c9449b02695496a3c9549932795499e"+
    "3595499f359549a0359549a1279549a2159549a6149549a7159549a8159549aa159549ab159549ac159549ad3c9549ae159549af149549b2149549b3149549b4149549b5149549b61496494a1496494b1496494c1496494d1496494e1496494f149649501496495114964952149649532696496726964968159649920096499d2f96499e0696499f019649a0009649a1159649a5149649a6159649a70e9649a90e9649aa0e9649ab149649ac149649ad159649ae159649b1359649b2169649b3169649b4169649b5"+
    "169649b61697494a1697494b1697494c1697494d1697494e1697494f16974950359749512697496626974967159749913597499c2f97499d0697499e0197499f359749a0159749a4149749a5359749a6359749a70e9749a8229749a90e9749aa159749ab159749ac159749ad359749b135984950269849661598499027984998009849993598499a3598499b0698499d0198499e3598499f159849a3159849a4159849a5109849a70e9849a8109849a9349849b03499494f269949661599498f3599499712994998"+
    "3c99499d3c99499e3c99499f349949af349a494e159a498e359a49960d9a4997069a499a3c9a499c3c9a499e349a49ae349b494d169b498d359b49950d9b4996059b4999329b499a3c9b499b3c9b499c3c9b499d359b49ad359c494c279c4994359c4995359c4996359c4997359c4998359c4999009c499a279c499b159c49ab359c49ac169c49ad169c49ae169c49af169c49b0169c49b1169c49b2169c49b3169c49b4169c49b5169c49b6169d494a359d494b389d4992149d49aa149d49ab149d49ac149d49ad"+
    "149d49ae149d49af149d49b0149d49b1149d49b2149d49b3149d49b4149d49b5149d49b6149e494a149e494b169e49a0169e49a1169e49a3169e49a40f9e49a70f9e49a8169f4998169f4999169f499a169f499f359f49a0359f49a1359f49a2169f49a30f9f49a50f9f49a60f9f49a70f9f49a8389f49ad16a0499735a0499816a0499916a0499e16a0499f16a049a13ca049a23aa049a30fa049a40fa049a50fa049a60fa049a738a1499016a149923ca1499316a1499416a1499516a1499614a1499716a14998"+
    "16a1499d16a1499e3ca149a03ca149a20fa149a40fa149a53ca249913ca2499314a2499414a2499514a2499616a2499716a2499c16a2499d16a2499f3ca249a03aa249a126a249ae26a249af16a349903ca3499116a3499216a3499316a3499414a3499516a3499616a3499b16a3499c16a3499e16a3499f26a349ae26a4494f26a4495016a4499314a4499416a4499516a4499a16a4499b16a4499d16a4499e26a449a826a449ab26a449ad26a5494f38a5498d16a5499214a5499316a5499416a5499916a5499a"+
    "23a5499b16a5499c16a5499d26a549a626a549a727a549a826a549a926a549aa26a549ab26a549ac26a549b626a6494c26a6494e16a6499135a6499216a6499316a6499816a6499916a6499b16a6499c26a649a526a649a726a649a927a649aa26a649b426a649b527a649b626a7494a26a7494b26a7494c26a7494d16a7499016a7499116a7499216a7499735a7499835a7499935a7499a16a7499b27a749a526a749a626a749a726a749a826a749a926a749aa26a749ab26a749b326a749b526a8494a27a8494b"+
    "16a8499616a8499716a8499916a8499a26a849a126a849a527a849a727a849b326a849b426a849b526a849b626a9494a26a9494b26a9494c38a9499e26a949a826a949af26a949b327a949b538aa498a26aa49a126aa49a326aa49a526aa49a726aa49b626ab49a326ab49a426ab49af26ab49b126ab49b326ab49b526ac49b126ac49b226ae495a26af495926af495d26b0495526b0495926b0495a26b1495504b1495826b1495b26b1495c26b2495326b2495526b2495626b2495726b2495926b2495a26b2495b"+
    "26b2495c26b2496926b2496b26b249ac26b249ad26b3495426b3495526b3495626b3495c26b3496626b3496a26b349a826b349a926b349ab26b349ad26b349af26b4495126b4495326b4495726b4495826b4495a26b4496626b4496726b449a326b449a726b449a826b5495526b5495726b549a426b549a527b549a926b549ab26b549af267a4a8a267a4a8c267a4a8f267b4a88267c4a86277c4a88267c4a8c267c4a8e267c4a90267d4a86267d4a8a267d4a8d267e4a84267e4a87267e4a88267e4a89267e4a8d"+
    "167f4a61267f4a84267f4a85267f4a88267f4a89267f4a8c15804a6026804a8226804a8426804a8526804a8626804a8916814a5114814a5214814a5316814a5416814a5514814a5614814a5716814a5815814a5f26814a8226814a8326814a8526814a8714824a5014824a5114824a5214824a5314824a5414824a5514824a5614824a5715824a5e26824a8126824a8226824a8817834a4f34834a5517834a5616834a5916834a5a16834a5b16834a5c16834a5d16834a5e16834a5f16834a6016834a6116834a62"+
    "16834a6316834a6416834a6526834a8426834a8534844a5416844a5835844a5914844a5a14844a5b14844a5c14844a5d14844a5e14844a5f14844a6014844a6114844a6235844a6316844a6434854a5316854a5716854a5816854a5916854a5a16854a5b16854a5c16854a5d16854a5e16854a5f16854a6016854a6116854a6216854a6334864a5215864a5a3a864a5d3c864a5e3a864a5f3c864ab017874a4b34874a5117874a5215874a593c874a5c3c874a5e17874aa117874aa217874aa33c874aae3c874ab0"+
    "14884a4a14884a4b14884a4c14884a4d14884a4e14884a4f14884a5014884a5115884a583a884a5b3c884a5c3a884a5d17884a9f15884aa016884aa115884aa217884aa33c884aae16884ab614894a4a14894a4b16894a4c16894a4d14894a4e14894a4f16894a5016894a5717894a9d15894a9e15894a9f15894aa115894aa217894aa3178a4a9c168a4a9d238a4a9f168a4aa1178a4aa2178b4a9b158b4a9c158b4a9d158b4a9f158b4aa0178b4aa1388c4a9a178c4a9b158c4a9c168c4a9d158c4a9e178c4a9f"+
    "388d4a98388d4a9a178d4a9b178d4a9c178d4a9d388e4a983a8e4aa6398e4aa73a8e4aa8158e4aaf158e4ab0158e4ab13a8f4aa43c8f4aa53c8f4aa63c8f4aa73a8f4aa8158f4aae148f4aaf158f4ab039904aa33c904aa422904aa53c904aa639904aa715904aad14904aae15904aaf3a914aa23c914aa33c914aa43c914aa53a914aa615914aac14914aad15914aae3a924aa239924aa33a924aa415924aab14924aac15924aad3a934a9515934aaa14934aab15934aac15934aad15934aae15934aaf3c934ab0"+
    "15934ab13a944a930a944a943a944a9521944aa015944aa914944aaa14944aab14944aac14944aad3c944aae3c944ab03a954a9327954a9e35954a9f1b954aa035954aa127954aa215954aa814954aa915954aaa15954aab15954aac15954aad3c954aae15954aaf16954ab216954ab316954ab416954ab516954ab616964a4a16964a4b16964a4c16964a4d16964a4e16964a4f16964a5016964a5116964a5216964a5335964a9d35964aa115964aa714964aa80e964aa90e964aaa0e964aab14964ab114964ab2"+
    "14964ab314964ab414964ab514964ab614974a4a14974a4b14974a4c14974a4d14974a4e14974a4f14974a5014974a5114974a5226974a6726974a6835974a9c1b974aa015974aa614974aa70e974aa822974aa90e974aaa38974aab15974ab035974ab116974ab216974ab316974ab416974ab516974ab616984a4a16984a4b16984a4c16984a4d16984a4e16984a4f35984a5026984a6727984a9800984a9935984a9a35984a9b35984a9f21984aa015984aa515984aa60e984aa70e984aa80e984aa935984ab0"+
    "35994a4f35994a973c994a9d3c994a9e3c994a9f38994aa735994aaf359a4a4e219a4a951b9a4a963c9a4a9c3c9a4a9e359a4aae359b4a4d359b4a95099b4a9a3c9b4a9b3c9b4a9c3c9b4a9d159b4aac359b4aad169b4aae169b4aaf169b4ab0169b4ab1169b4ab2169b4ab3169b4ab4169b4ab5169b4ab6169c4a4a169c4a4b359c4a4c279c4a94359c4a951b9c4a96359c4a97359c4a98359c4a99359c4a9a279c4a9b149c4aab149c4aac149c4aad149c4aae149c4aaf149c4ab0149c4ab1149c4ab2149c4ab3"+
    "149c4ab4149c4ab5149c4ab6149d4a4a149d4a4b149d4a4c219d4a94219d4a96169d4aaa169d4aab169d4aac169d4aad169d4aae169d4aaf169d4ab0169d4ab1169d4ab2169d4ab3169d4ab4169d4ab5169d4ab6169e4a4a169e4a4b169e4aa1169e4aa2169e4aa3169f4a99169f4aa0359f4aa1169f4aa215a04a9816a04a9f14a04aa016a04aa13ca04aa23ca14a9315a14a9716a14a9e14a14a9f3ca14aa03ca14aa23ca24a913ca24a9315a24a9415a24a9515a24a9616a24a9d14a24a9e16a24a9f3ca24aa0"+
    "26a24aaa26a24aab3ca34a9115a34a9516a34a9c14a34a9d16a34a9e26a34aaa26a34aad26a44a4b26a44a4c15a44a9416a44a9b14a44a9c16a44a9d26a44aa726a44aaa26a54a4b26a54a4e15a54a9316a54a9a14a54a9b16a54a9c26a54aa527a54aa826a54aa926a54aaa26a54aab26a54ab526a64a4b15a64a9216a64a9914a64a9a16a64a9b26a64aa326a64aa926a64aaa26a64ab327a64ab626a74a4a26a74a4b26a74a4c16a74a9116a74a9835a74a9916a74a9a26a74aa926a74ab126a84a4a26a84a4b"+
    "16a84a9716a84a9816a84a9926a84aa426a84aa626a84aa826a84aa926a94a4a26a94aa426a94aa627a94aa726a94ab226a94ab426a94ab626aa4a4a26aa4aa726aa4ab226aa4ab427aa4ab526ab4ab526ae4a5a26ae4a5b26af4a5726af4a5c26af4a5d26b04a5826b04a5926b04a5b26b14a5404b14a5826b14a5926b14a5a26b14a5b26b14a5c26b24a5426b24a5626b24a5726b24a5826b24a5a26b24a5b26b24a5c26b24a6926b34a5626b34a5826b34a5926b34a5a26b34a5b26b34a6726b34a6a26b34aa7"+
    "26b34aa826b34aa926b44a5526b44a5626b44a5726b44a5926b44a6526b44a6626b44a6826b44a6926b44aa326b44aa427b44aa926b44aaa26b44aac26b54a5226b54a5626b54a5726b54a6426b54a6526b54a6726b54aa326b54aa526b54aa626b54aa726b54aa826b54aaa26b54aac267b4b88267b4b89267b4b8e267b4b90267c4b85267c4b86267c4b89267c4b8a267c4b8f267d4b87267d4b8a267e4b84267e4b8a267f4b84267f4b86267f4b8a26804b8726804b8815814b5215814b5315814b5415814b55"+
    "15814b5615814b5726814b8426814b8514824b5014824b5114824b5214824b5314824b5414824b5514824b5614824b5726824b8316834b4f34834b5516834b5626834b8226834b8326834b8434844b5416844b5815844b5915844b5a15844b5b15844b5c15844b5d15844b5e15844b5f15844b6015844b6115844b6215844b6316844b6434854b5334864b523c864b5e3a864bb016874b4b34874b5116874b523c874b5c3c874b5e3a874bae0a874baf3a874bb014884b4a14884b4b14884b4c14884b4d14884b4e"+
    "14884b4f14884b5014884b513c884b5c3a884bae15894b4a15894b4b15894b4c15894b4d15894b4e15894b4f13894b9f14894ba013894ba1148a4b9e148a4b9f148a4ba0138b4b9d148b4b9e138b4b9f398e4ba6398e4ba7398e4ba8398f4ba4278f4ba5358f4ba6278f4ba7398f4ba839904ba335904ba422904ba535904ba639904ba739914ba227914ba335914ba427914ba539914ba639924ba239924ba339924ba438934b953c934bb038944b9338944b9516944b9e16944b9f16944ba316944ba43c944bae"+
    "3c944bb038954b9316954b9d27954b9e35954b9f35954ba035954ba127954ba216954ba30f954baa3b954bab0f954bac3c954bae16964b9c35964b9d35964ba115964ba20f964ba80e964ba90e964baa0e964bab0f964bac14964bb115964bb215964bb315964bb415964bb515964bb614974b4a14974b4b14974b4c15974b4d15974b4e15974b4f15974b5015974b5114974b5226974b6726974b6816974b9816974b9916974b9a16974b9b35974b9c35974ba017974ba13b974ba70e974ba822974ba90e974baa"+
    "3b974bab14974bb014974bb114974bb214974bb314974bb414974bb514974bb614984b4a14984b4b14984b4c14984b4d14984b4e14984b4f14984b5014984b5116984b9727984b9835984b9935984b9a35984b9b35984b9f15984ba00f984ba60e984ba70e984ba80e984ba90f984baa15984baf35984bb016984bb116984bb216984bb316984bb416984bb516984bb616994b4a16994b4b16994b4c16994b4d16994b4e35994b4f35994b973c994b9d3c994b9e3a994b9f0f994ba63b994ba70f994ba815994bae"+
    "35994baf23994bb123994bb5239a4b4c359a4b4e359a4b963c9a4b9c3c9a4b9e159a4bad359a4bae169a4baf169a4bb0169a4bb1169a4bb2169a4bb3169a4bb4169a4bb5169a4bb6169b4b4a169b4b4b169b4b4c359b4b4d359b4b953c9b4b9b3c9b4b9c3a9b4b9d149b4bac149b4bad149b4bae149b4baf149b4bb0149b4bb1149b4bb2149b4bb3149b4bb4149b4bb5149b4bb6149c4b4a149c4b4b149c4b4c149c4b4d169c4b93279c4b94359c4b95359c4b96359c4b97359c4b98359c4b99359c4b9a279c4b9b"+
    "169c4b9c149c4bab159c4bac159c4bad159c4bae159c4baf159c4bb0149c4bb1149c4bb2149c4bb3159c4bb4159c4bb5159c4bb6159d4b4a159d4b4b149d4b4c169d4b92169d4b93159d4b94179d4b95159d4b96169d4b97169d4b98169d4b99169d4b9a169d4b9b169e4ba2159f4ba115a04ba03aa04ba23aa14b9315a14b9f3aa14ba00aa14ba13aa14ba23aa24b910aa24b923aa24b9315a24b9e3aa24ba026a24baa26a24bab3aa34b9115a34b9d26a34ba726a34bad26a34bae26a44b4b26a44b4c15a44b9c"+
    "26a44ba826a44baa26a44bac26a44bad26a44bb526a54b4e26a54b4f15a54b9b26a54ba626a54ba926a54baa26a54bab26a54bad26a54bb626a64b4b26a64b4d26a64b4e15a64b9a26a64ba326a64ba626a64ba726a64baa26a64bab26a64bb426a74b4a26a74b4b26a74b4c26a74b4e15a74b9926a74ba226a74ba626a74ba726a74ba826a74bab26a74bb126a74bb426a74bb526a84b4b26a84b4c16a84b9826a84ba226a84ba526a84ba926a84bb026a84bb426a84bb526a84bb626a94b4c26a94b9f26a94ba1"+
    "26a94ba327a94ba726a94ba926a94bb026a94bb326aa4b4a26aa4ba726aa4bad26aa4baf26aa4bb127aa4bb526ab4b4a26ab4ba026ab4ba326ab4ba526ab4bb526ac4bae26ac4bb126ac4bb326ae4b5b26af4b5826af4b5a26b04b5826b04b5a26b04b5c26b04b5d04b14b5826b14b5926b14b5a26b14b5b26b14b5d26b24b5526b24b5626b24b5726b24b5826b24b5926b24b5a26b24b5b26b24bab26b24bad26b24bb026b34b5526b34b5726b34b5826b34b5926b34b6826b34b6926b34ba726b34ba926b44b52"+
    "26b44b5526b44b5726b44b5826b44b5926b44b5a26b44b6626b44b6726b44ba626b44ba726b44ba827b44ba926b44bad26b44baf26b44bb126b54b5226b54b5526b54b5626b54b5826b54b6726b54ba126b54ba226b54ba426b54ba626b54ba726b54bab26b54bae267a4c88267a4c8b267a4c8c267b4c86267b4c8c267b4c8d267b4c8e267c4c87267c4c89267c4c8a267c4c8c267c4c8f267d4c84267d4c8a267d4c8b267d4c8e267e4c86267e4c8b267f4c85267f4c8626804c8626804c8726804c8926814c83"+
    "26814c8916824c5014824c5114824c5214824c5314824c5414824c5514824c5616824c5726824c8814834c4f16834c5016834c5116834c5216834c5316834c5434834c5514834c5626834c8434844c5426844c8434854c5334864c523c864c5e38864cb014874c4b16874c4c16874c4d16874c4e16874c4f16874c5034874c5114874c523c874c5c3c874c5e38874cae38874cb016884c4a14884c4b14884c4c14884c4d14884c4e14884c4f14884c5016884c513c884c5c38884cae16894ca0168a4c9e148a4c9f"+
    "168a4ca0168b4c9e378e4ca6348e4ca7378e4ca8378f4ca4348f4ca5348f4ca7378f4ca834904ca334904ca737914ca234914ca334914ca537914ca637924ca234924ca337924ca438934c953c934cb038944c9338944c9516944c9f16944ca016944ca216944ca338944cac3c944cae0a944caf3a944cb038954c9316954c9e35954c9f35954ca035954ca116954ca20f954caa0e954cab0f954cac3c954cae16964c9d16964c9e16964ca016964ca10f964ca80f964cac26974c6816974c9c16974c9d23974c9e"+
    "16974c9f16974ca017974ca138974ca60e974ca70e974cab38974cac16974cb016974cb116974cb216974cb316974cb416974cb516974cb616984c4a16984c4b16984c4c16984c4d16984c4e16984c4f16984c5016984c5116984c9716984c9816984c9916984c9a16984c9b16984c9c16984c9e16984c9f0f984ca60f984caa14984caf14984cb014984cb114984cb214984cb314984cb414984cb514984cb614994c4a14994c4b14994c4c14994c4d14994c4e14994c4f14994c5016994c9635994c9716994c98"+
    "16994c9916994c9a16994c9b3c994c9d3c994c9e0f994ca60e994ca70f994ca814994cae14994caf14994cb014994cb114994cb214994cb314994cb414994cb514994cb6149a4c4a149a4c4b149a4c4c149a4c4d149a4c4e149a4c4f359a4c96239a4c983c9a4c9c3a9a4c9e389a4ca6149a4cad149a4cae149a4caf149a4cb0149a4cb1149a4cb2149a4cb3149a4cb4149a4cb5149a4cb6149b4c4a149b4c4b149b4c4c149b4c4d149b4c4e169b4c94359b4c95169b4c96169b4c97169b4c98169b4c99169b4c9a"+
    "3c9b4c9b3c9b4c9c169b4cac169b4cad169b4cae169b4caf169b4cb0169b4cb1169b4cb2169b4cb3169b4cb4169b4cb5169b4cb6169c4c4a169c4c4b169c4c4c169c4c4d169c4c93169c4c94169c4c95169c4c96169c4c97169c4c98169c4c99169c4c9a169c4c9b179d4c9538a04ca238a14c9338a14ca038a14ca238a24c9138a24c9338a24ca026a24cab26a24cac26a24cad38a34c9126a34cac26a44c4c26a44c4d26a44c4e26a44caa26a44cab26a54c4d26a54ca726a54ca826a64c4b26a64c4c26a64ca5"+
    "26a64ca926a64cab26a64cb526a64cb626a74ca526a74cab26a74cb326a84c4a26a84c4c26a84ca526a84ca826a84cb326a94c4c26a94ca026a94ca526a94ca626a94ca926a94caa26a94cb326a94cb626aa4c9f26aa4ca126aa4ca626aa4ca726aa4cae26aa4cb326aa4cb426ab4c4a26ab4c4b26ab4cad26ab4caf26ab4cb426ab4cb526ae4c5a26af4c5826af4c5b26af4c5c26b04c5626b04c5d26b14c5504b14c5826b24c5426b24c5826b24c5926b24c5a26b24c5b26b34c5526b34c5726b34c5926b34c5a"+
    "26b34ca826b34ca926b34caa26b34caf26b34cb126b44c5526b44c5626b44c5826b44c6626b44c6726b44ca426b44ca526b44ca626b44ca726b44ca826b44caa26b44cab26b44cb026b54c5426b54c5826b54c5926b54c6726b54ca126b54ca826b54cab26794d8b267a4d89267b4d87267c4d8b267c4d8d267d4d84267d4d86267e4d86267f4d85267f4d86267f4d87267f4d89267f4d8a26814d8415824d5115824d5215824d5315824d5415824d5515824d5626824d8516834d4f14834d5014834d5114834d52"+
    "14834d5314834d5414834d5514834d5616844d4e16844d4f16844d5016844d5116844d5216844d5334844d5416844d5515854d4d23854d5034854d5315854d5416864d4c16864d4d16864d4e16864d4f16864d5016864d5134864d5216864d533a864d5e38864db014874d4b14874d4c14874d4d14874d4e14874d4f14874d5014874d5116874d523a874d5c0a874d5d3a874d5e38874dae38874db015884d4b15884d4c15884d4d15884d4e15884d4f15884d503a884d5c38884dae148a4d9f348e4da6348e4da8"+
    "348f4da4238f4da7348f4da80c904da634914da234914da634924da234924da43a934db016944da016944da116944da23c944dae38944db016954d9f35954da016954da110954dab3a954dae16964d9e14964d9f16964da016974d9d14974d9e16974d9f10974da710974dab16984d9c14984d9d16984d9e15984db515984db615994d4a16994d9616994d9716994d9816994d9916994d9a16994d9b14994d9c3c994d9d3a994d9e10994da715994dae15994daf15994db015994db115994db215994db315994db4"+
    "15994db515994db6159a4d4a159a4d4b159a4d4c159a4d4d159a4d4e159a4d4f169a4d95359a4d96149a4d97149a4d98149a4d99149a4d9a149a4d9b3c9a4d9c0a9a4d9d389a4d9e159a4db3159a4db4159a4db5169b4d94169b4d95169b4d96169b4d97169b4d98169b4d99169b4d9a3c9b4d9b3a9b4d9c38a04da238a14d9338a14da038a14da226a14dab38a24d9138a24d9338a24da026a24dab26a34d4c38a34d9126a34da726a44d4c26a44da626a44dac26a44db526a54da626a54da826a54da926a54db4"+
    "26a64d4d26a64da926a64daa26a64db426a64db626a74d4a26a74da426a74da926a84d4a26a84d4b26a84da126a84da426a84da526a84dab26a84db226a94d4a26a94da026a94da326a94da526a94da626a94da826a94daf26a94db226a94db326aa4d4c26aa4da126aa4da226aa4da326aa4da926aa4dae26aa4db126aa4db326aa4db426aa4db626ab4da326ab4da426ab4da726ab4daf26ab4db026ab4db126ac4d4a26ac4db126ac4db226ac4db526af4d5826b04d5526b04d5626b04d5926b04d5b26b14d55"+
    "26b14d5626b14d5704b14d5826b24d5526b24d5926b24da926b24dac26b24dad26b34d5526b34d5626b34d5726b34d5826b34da726b34dad26b34dae26b34daf26b44d5326b44d5426b44d5526b44d5626b44d5826b44d5926b44d6726b44da826b44daa26b44dab26b44dad26b44db026b54d5826b54da326b54da526b54da826b54da926b54dab26b54dac26b54daf267b4e87267b4e88267c4e87267c4e88267c4e89267e4e8426814e8615834e5015834e5115834e5215834e5315834e5415834e5516844e4e"+
    "14844e4f14844e5014844e5114844e5214844e5314844e5416844e5514854e4d14854e4e14854e4f14854e5014854e5114854e5214854e5314854e5416864e4c14864e4d14864e4e14864e4f14864e5014864e5114864e5216864e5338864e5e15874e4c15874e4d15874e4e15874e4f15874e5015874e5138874e5c38874e5e38884e5c138a4e9f348e4ea6348e4ea8348f4ea4348f4ea803904ea50c904ea634914ea234914ea634924ea234924ea438934eb016944ea138944eae38944eb015954ea034954eab"+
    "38954eae15964e9f15974e9e34974ea734974eab15984e9d15994e9c3a994e9d38994e9e34994ea7169a4e95159a4e96159a4e97159a4e98159a4e99159a4e9a159a4e9b3c9a4e9c389a4e9e3a9b4e9b389b4e9c26a34eaa26a44eab26a54e4b26a64e4c26a64ea526a64ea626a64ea826a64ea926a64eaa26a74ea926a74eb326a74eb426a74eb626a84e4a26a84e4b26a84ea926a84eab26a94e4a26a94ea226a94ea426aa4e4a26aa4e4c26aa4ea826aa4eb026aa4eb226ab4ea626ab4eb626ac4ea426ac4eb4"+
    "26ad4eb226ae4e5a26ae4e5b26b04e5926b14e5604b14e5826b14e5a26b14eac26b24e5426b24e5726b24e5926b24eaa26b34e5426b34e5526b34e5626b34e5826b34ea726b34ea826b44e5526b44e5726b44e5826b44e5926b44eac26b44eae26b54ea526b54ea7267c4f8715854f4e15854f4f15854f5015854f5115854f5215854f5338864f5e38874f5c38874f5e38884f5c138a4f9f178d4fa7178d4fa8178d4fa9178e4fa5348e4fa6348e4fa8178e4fa9178f4fa3348f4fa4348f4fa8178f4fa917904fa2"+
    "0c904fa50c904fa617904fa817914fa134914fa234914fa617914fa717924fa134924fa234924fa417924fa517934fa117934fa217934fa317944fab17944fad34954fab17964fa734974fa734974fab17984fa523984fa634994fa73a9a4f9c179a4fa5179a4fa726a44fa926a64f4a26a74fab26a94f4c26a94fa626a94fa726a94fa826aa4fa726aa4fa826aa4fb426aa4fb526aa4fb626ab4fb526ab4fb626b04f5726b04f5826b14f5526b14f5626b14f5704b14f5826b14f5926b14f5b26b24f5526b24f56"+
    "26b34f5626b34f5726b34f5826b34fa826b34fa926b44f5526b44fa826b44fa926b44faa26b54f5526b54f5626b54f5826b54f5a26b54fa626b54fa7178d50a7178d50a8178d50a9178e50a5158e50a6168e50a7158e50a8178e50a9178f50a3158f50a4148f50a5148f50a6148f50a7158f50a8178f50a9179050a2169050a3149050a4139050a5149050a6169050a7179050a8179150a1159150a2149150a3149150a4149150a5159150a6179150a7179250a1159250a2169250a3159250a4179250a5179350a1"+
    "179350a2179350a3179450ab159450ac179450ad159550a9149550aa149550ab149550ac159550ad179650a7149650a8159650a9159650ab149650ac179650ad159750a6149750a7149750ab159750ac179850a5149850a6159850a7159850a9149850aa179850ab159950a5149950a6149950a7149950a8159950a9179a50a5159a50a6179a50a726a950a826aa50b626af505726af505926af505c26b0505726b0505826b1505504b1505826b1505926b2505526b2505926b3505326b3505426b3505826b45055"+
    "26b4505726b4505826b4505926b4505a26b450a426b450a726b450a826b450a926b5505326b5505626b550a626b550a7138f51a5148f51a6138f51a7149051a4149051a5149051a6139151a3149151a4139151a5169551ab149651a9149651aa149651ab169751a7149751a8149751aa169751ab149851a7149851a8149851a9169951a726af515b04b1515826b1515926b1515a26b3515326b3515426b3515826b3515926b3515a26b4515326b4515526b4515726b4515926b451a526b5515426b55156168f52a6"+
    "169052a4149052a5169052a6169152a4139652a9149652aa139652ab149752a8149752aa139852a7149852a8139852a926ae525a26af525926af525b26b0525826b0525926b0525b26b1525426b1525604b1525826b2525826b2525926b3525426b3525526b3525626b352a826b4525326b4525426b4525626b4525826b452a526b452a726b5525426b5525726b552a326b552a526b552a6149053a5169653aa169753a8149753a9169753aa169853a826ae535b26af535826af535b26b1535626b2535726b35358"+
    "26b353a726b4535426b4535926b453a526b453a826b55354149054a5149754a926af545926b0545826b0545926b1545626b1545726b1545926b2545626b2545726b3545526b454a726b5545626b554a526b554a6139055a5139755a926b15557139056a5139756a9";
    for (let i = 0; i < D.length; i += 8) {
      const pi = parseInt(D.substr(i,2),16);
      const x = parseInt(D.substr(i+2,2),16) - 128;
      const y = parseInt(D.substr(i+4,2),16) - 64;
      const z = parseInt(D.substr(i+6,2),16) - 128;
      b(x, y, z, PAL[pi]);
    }
  }

function _buildTransformedPlains(b) {
    const PAL = ["minecraft:beetroots","minecraft:bell","minecraft:birch_leaves","minecraft:birch_log","minecraft:birch_trapdoor","minecraft:brewing_stand","minecraft:cauldron","minecraft:chest","minecraft:cobblestone","minecraft:cobblestone_slab","minecraft:cobblestone_wall","minecraft:composter","minecraft:crafting_table","minecraft:dirt","minecraft:farmland","minecraft:fence","minecraft:furnace","minecraft:glass_pane","minecraft:grass","minecraft:grass_path","minecraft:hay_block","minecraft:ladder","minecraft:lantern","minecraft:melon","minecraft:melon_stem","minecraft:mossy_cobblestone","minecraft:mossy_stone_bricks","minecraft:oak_leaves","minecraft:oak_log","minecraft:oak_planks","minecraft:oak_stairs","minecraft:potatoes","minecraft:pumpkin","minecraft:pumpkin_stem","minecraft:red_bed","minecraft:smooth_stone_slab","minecraft:spruce_door","minecraft:spruce_fence","minecraft:spruce_fence_gate","minecraft:spruce_planks","minecraft:spruce_slab","minecraft:spruce_stairs","minecraft:spruce_trapdoor","minecraft:stone_brick_slab","minecraft:stone_brick_stairs","minecraft:stone_stairs","minecraft:stonebrick","minecraft:trapdoor","minecraft:water","minecraft:wheat","minecraft:yellow_flower"];
    const D = "1c3d3f491b3d3f4e1b3d3f4f1b3d3f501b3d3f511b3d3f521b3d3f561b3d3f571b3d3f581b3d3f591b3d3f5a1b3d3f671b3d3f681b3d3f691b3d3f6a123d3f72123d3f73123d3f740d3d3f750d3d3f760d3d3f770d3d3f780d3d3f790d3d3f7a0d3d3f7b0d3d3f7c0d3d3f7d0d3d3f7e0d3d3f7f0d3d3f800d3d3f810d3d3f820d3d3f830d3d3f840d3d3f850d3d3f860d3d3f870d3d3f88123d3f89123d3f9e123d3fa0123d3fa1123d3fa2123d3fa3123d3fa4123d3fa5123d3fa6123d3fa7123d3fa80d3d3fa9"+
    "0d3d3faa0d3d3fab0d3d3fac0d3d3fad0d3d3fae123d3faf123d3fb0123d3fb1123d3fb2123d3fb3123d3fb4123d3fb51c3e3f521b3e3f581b3e3f591b3e3f5a1b3e3f5b1b3e3f601b3e3f611c3e3f621b3e3f631b3e3f64123e3f79123e3f7c123e3f7d123e3f7e0d3e3f7f0d3e3f800d3e3f810d3e3f820d3e3f830d3e3f840d3e3f850d3e3f860d3e3f870d3e3f880d3e3f890d3e3f8a0d3e3f8b0d3e3f8c0d3e3f8d0d3e3f8e0d3e3f8f0d3e3f900d3e3f910d3e3f920d3e3f93123e3f94123e3f9b123e3f9f"+
    "123e3fa6123e3fa7123e3fa8123e3fa9123e3faa123e3fab123e3fac123e3fad123e3fae123e3faf123e3fb00d3e3fb10d3e3fb20d3e3fb30d3e3fb40d3e3fb50d3e3fb60d3e3fb70d3e3fb80d3e3fb90d3e3fba123e3fbb123e3fbc123e3fbd123e3fbe123f3f42123f3f43023f3f61023f3f62023f3f63023f3f641b3f3f6a1b3f3f6b1b3f3f6c1b3f3f6d1b3f3f6e123f3f83123f3f84123f3f85123f3f86123f3f870d3f3f880d3f3f890d3f3f8a0d3f3f8b0d3f3f8c0d3f3f8d0d3f3f8e0d3f3f8f0d3f3f90"+
    "0d3f3f910d3f3f920d3f3f930d3f3f940d3f3f950d3f3f960d3f3f970d3f3f980d3f3f990d3f3f9a0d3f3f9b0d3f3f9c0d3f3f9d123f3f9e123f3fa40d3f3fa5123f3fa6123f3fa70d3f3fa80d3f3fa9123f3faa123f3fab123f3fad123f3fae0d3f3faf123f3fb00d3f3fb10d3f3fb2123f3fb3123f3fb4123f3fb5123f3fb6123f3fb7123f3fb8123f3fb90d3f3fba0d3f3fbb0d3f3fbc0d3f3fbd0d3f3fbe0d403f420d403f430d403f440d403f450d403f460d403f470d403f480d403f490d403f4a12403f4b"+
    "12403f4c12403f4d12403f5702403f6302403f6402403f6502403f6602403f6a02403f6b02403f6c02403f6d02403f6e1b403f751b403f761b403f771b403f7812403f8d12403f8e12403f8f0d403f900d403f910d403f920d403f930d403f940d403f950d403f960d403f970d403f980d403f990d403f9a0d403f9b0d403f9c0d403f9d0d403f9e0d403f9f0d403fa00d403fa10d403fa20d403fa30d403fa40d403fa50d403fa60d403fa70d403fa812403fa912403fad0d403fae0d403faf0d403fb00d403fb1"+
    "0d403fb20d403fb30d403fb40d403fb512403fb60d403fb70d403fb80d403fb90d403fba0d403fbb0d403fbc0d403fbd12403fbe12413f4212413f430d413f440d413f450d413f460d413f470d413f480d413f490d413f4a0d413f4b0d413f4c0d413f4d0d413f4e0d413f4f0d413f500d413f510d413f520d413f530d413f540d413f550d413f560d413f5712413f5812413f5912413f5b12413f5c0d413f5d12413f5e12413f5f12413f6012413f6112413f6212413f6302413f6d02413f6e02413f6f02413f70"+
    "02413f7102413f7402413f7503413f7602413f7702413f781b413f901b413f911b413f9212413f9612413f9712413f980d413f990d413f9a0d413f9b0d413f9c0d413f9d0d413f9e0d413f9f0d413fa00d413fa10d413fa20d413fa30d413fa40d413fa50d413fa60d413fa70d413fa80d413fa90d413faa0d413fab0d413fac0d413fad0d413fae0d413faf0d413fb00d413fb10d413fb20d413fb30d413fb412413fb50d413fb60d413fb70d413fb80d413fb90d413fba0d413fbb0d413fbc0d413fbd0d413fbe"+
    "0d423f420d423f430d423f440d423f450d423f460d423f470d423f480d423f490d423f4a0d423f4b0d423f4c0d423f4d0d423f4e0d423f4f0d423f500d423f510d423f520d423f530d423f540d423f550d423f560d423f570d423f580d423f590d423f5a0d423f5b0d423f5c0d423f5d0d423f5e0d423f5f0d423f600d423f610d423f620d423f630d423f640d423f650d423f660d423f670d423f680d423f690d423f6a12423f6b12423f6c12423f6d12423f6e02423f7702423f7803423f7902423f7a02423f7b"+
    "02423f7e02423f7f02423f8002423f8102423f821c423f881b423f991b423f9a1b423f9b1b423f9c1b423f9d12423f9f12423fa00d423fa10d423fa20d423fa30d423fa40d423fa50d423fa60d423fa70d423fa80d423fa90d423faa0d423fab0d423fac0d423fad0d423fae0d423faf0d423fb00d423fb10d423fb20d423fb30d423fb40d423fb50d423fb60d423fb70d423fb80d423fb90d423fba0d423fbb0d423fbc0d423fbd0d423fbe0d433f420d433f430d433f440d433f450d433f460d433f470d433f48"+
    "0d433f490d433f4a0d433f4b0d433f4c0d433f4d0d433f4e0d433f4f0d433f500d433f510d433f520d433f530d433f540d433f550d433f560d433f570d433f580d433f590d433f5a0d433f5b0d433f5c0d433f5d0d433f5e0d433f5f0d433f600d433f610d433f620d433f630d433f640d433f650d433f660d433f670d433f680d433f690d433f6a0d433f6b0d433f6c0d433f6d0d433f6e0d433f6f0d433f700d433f710d433f720d433f730d433f740d433f7512433f7612433f7702433f8102433f8202433f83"+
    "02433f8402433f8502433f8802433f8902433f8a02433f8b12433f9012433f9112433f9212433f9312433f9412433f9512433f9612433f971c433fa01b433fa31b433fa41c433fa51b433fa61b433fa712433fa812433fa90d433faa0d433fab0d433fac0d433fad0d433fae0d433faf0d433fb00d433fb10d433fb20d433fb30d433fb40d433fb50d433fb60d433fb70d433fb80d433fb90d433fba0d433fbb0d433fbc0d433fbd0d433fbe0d443f420d443f430d443f440d443f450d443f460d443f470d443f48"+
    "0d443f490d443f4a0d443f4b0d443f4c0d443f4d0d443f4e0d443f4f0d443f500d443f510d443f520d443f530d443f540d443f550d443f560d443f570d443f580d443f590d443f5a0d443f5b0d443f5c0d443f5d0d443f5e0d443f5f0d443f600d443f610d443f620d443f630d443f640d443f650d443f660d443f670d443f680d443f690d443f6a0d443f6b0d443f6c0d443f6d0d443f6e0d443f6f0d443f700d443f710d443f720d443f730d443f740d443f750d443f760d443f770d443f780d443f790d443f7a"+
    "0d443f7b0d443f7c0d443f7d0d443f7e0d443f7f0d443f8012443f8112443f8202443f8b02443f8c02443f8d02443f8e02443f8f1b443f901b443f9112443f9912443f9a12443f9b12443f9c12443f9d12443f9e12443f9f12443fa012443fa112443fa20d443fa31b443fad1b443fae1b443faf1b443fb012443fb112443fb20d443fb30d443fb40d443fb50d443fb60d443fb70d443fb80d443fb90d443fba0d443fbb0d443fbc0d443fbd0d443fbe0d453f420d453f430d453f440d453f450d453f460d453f47"+
    "0d453f480d453f490d453f4a0d453f4b0d453f4c0d453f4d0d453f4e0d453f4f0d453f500d453f510d453f520d453f530d453f540d453f550d453f560d453f570d453f580d453f590d453f5a0d453f5b0d453f5c0d453f5d0d453f5e0d453f5f0d453f600d453f610d453f620d453f630d453f640d453f650d453f660d453f670d453f680d453f690d453f6a0d453f6b0d453f6c0d453f6d0d453f6e0d453f6f0d453f700d453f710d453f720d453f730d453f740d453f750d453f760d453f770d453f780d453f79"+
    "0d453f7a0d453f7b0d453f7c0d453f7d0d453f7e0d453f7f0d453f800d453f810d453f820d453f830d453f840d453f850d453f860d453f870d453f880d453f890d453f8a0d453f8b1b453f931b453f981b453f991b453f9a1b453f9b1b453f9c12453fa212453fa30d453fa40d453fa50d453fa60d453fa70d453fa80d453fa912453faa12453fab12453fac12453fad12453fae1b453fb41b453fb51b453fb61b453fb81b453fb91b453fba12453fbb0d453fbc0d453fbd0d453fbe0d463f420d463f430d463f44"+
    "0d463f450d463f460d463f470d463f480d463f490d463f4a0d463f4b0d463f4c0d463f4d0d463f4e0d463f4f0d463f500d463f510d463f520d463f530d463f540d463f550d463f560d463f570d463f580d463f590d463f5a0d463f5b0d463f5c0d463f5d0d463f5e0d463f5f0d463f600d463f610d463f620d463f630d463f640d463f650d463f660d463f670d463f680d463f690d463f6a0d463f6b0d463f6c0d463f6d0d463f6e0d463f6f0d463f700d463f710d463f720d463f730d463f740d463f750d463f76"+
    "0d463f770d463f780d463f790d463f7a0d463f7b0d463f7c0d463f7d0d463f7e0d463f7f0d463f800d463f810d463f820d463f830d463f840d463f850d463f860d463f870d463f880d463f890d463f8a0d463f8b0d463f8c0d463f8d0d463f8e0d463f8f0d463f900d463f910d463f920d463f9312463f9412463f951b463f9c1c463f9d1b463f9e1b463fa21b463fa31c463fa41b463fa51b463fa61c463faa12463fac12463fad0d463fae0d463faf0d463fb00d463fb10d463fb212463fb312463fb412463fb5"+
    "12463fb612463fb71b463fbd1b463fbe1b473f421b473f431b473f4412473f470d473f480d473f490d473f4a0d473f4b0d473f4c0d473f4d0d473f4e0d473f4f0d473f500d473f510d473f520d473f530d473f540d473f550d473f560d473f570d473f580d473f590d473f5a0d473f5b0d473f5c0d473f5d0d473f5e0d473f5f0d473f600d473f610d473f620d473f630d473f640d473f650d473f660d473f670d473f680d473f690d473f6a0d473f6b0d473f6c0d473f6d0d473f6e0d473f6f0d473f700d473f71"+
    "0d473f720d473f730d473f740d473f750d473f760d473f770d473f780d473f790d473f7a0d473f7b0d473f7c0d473f7d0d473f7e0d473f7f0d473f800d473f810d473f820d473f830d473f840d473f850d473f860d473f870d473f880d473f890d473f8a0d473f8b0d473f8c0d473f8d0d473f8e0d473f8f0d473f900d473f910d473f920d473f930d473f940d473f950d473f960d473f970d473f980d473f990d473f9a0d473f9b0d473f9c12473f9d12473f9e1b473fa61b473fa71b473fa81b473fac1b473fad"+
    "1b473fae1b473faf1b473fb012473fb412473fb512473fb60d473fb70d473fb80d473fb90d473fba0d473fbb0d473fbc12473fbd12473fbe12483f4212483f431b483f4a1b483f4b1c483f4c1b483f4d1b483f4e12483f5012483f510d483f520d483f530d483f540d483f550d483f560d483f570d483f580d483f590d483f5a0d483f5b0d483f5c0d483f5d0d483f5e0d483f5f0d483f600d483f610d483f620d483f630d483f640d483f650d483f660d483f670d483f680d483f690d483f6a0d483f6b0d483f6c"+
    "0d483f6d0d483f6e0d483f6f0d483f700d483f710d483f720d483f730d483f740d483f750d483f760d483f770d483f780d483f790d483f7a0d483f7b0d483f7c0d483f7d0d483f7e0d483f7f0d483f800d483f810d483f820d483f830d483f840d483f850d483f860d483f870d483f880d483f890d483f8a0d483f8b0d483f8c0d483f8d0d483f8e0d483f8f0d483f900d483f910d483f920d483f930d483f940d483f950d483f960d483f970d483f980d483f990d483f9a0d483f9b0d483f9c0d483f9d0d483f9e"+
    "0d483f9f0d483fa00d483fa10d483fa20d483fa30d483fa40d483fa512483fa612483fa71b483fb61b483fb71b483fb81b483fb912483fbc12483fbd12483fbe12493f420d493f430d493f440d493f450d493f460d493f470d493f480d493f4912493f4a12493f4b12493f4c1b493f541b493f551b493f561b493f571b493f5812493f5912493f5a0d493f5b0d493f5c0d493f5d0d493f5e0d493f5f0d493f600d493f610d493f620d493f630d493f640d493f650d493f660d493f670d493f680d493f690d493f6a"+
    "0d493f6b0d493f6c0d493f6d0d493f6e0d493f6f0d493f700d493f710d493f720d493f730d493f740d493f750d493f760d493f780d493f790d493f7a0d493f7b0d493f7c0d493f7d0d493f7e0d493f7f0d493f800d493f810d493f820d493f830d493f840d493f850d493f860d493f870d493f880d493f890d493f8a0d493f8b0d493f8c0d493f8d0d493f8e0d493f8f0d493f900d493f910d493f920d493f930d493f940d493f950d493f960d493f970d493f980d493f990d493f9a0d493f9b0d493f9c0d493f9d"+
    "0d493f9e0d493f9f0d493fa00d493fa10d493fa20d493fa30d493fa40d493fa50d493fa60d493fa70d493fa80d493fa90d493faa0d493fab0d493fac0d493fad0d493fae0d493faf12493fb0124a3f47124a3f48124a3f49124a3f4a124a3f4b0d4a3f4c0d4a3f4d0d4a3f4e0d4a3f4f0d4a3f500d4a3f510d4a3f520d4a3f53124a3f54124a3f55124a3f561b4a3f5f1b4a3f601b4a3f611b4a3f62124a3f630d4a3f640d4a3f650d4a3f660d4a3f670d4a3f680d4a3f690d4a3f6a0d4a3f6b0d4a3f6c0d4a3f6d"+
    "0d4a3f6e0d4a3f6f0d4a3f700d4a3f710d4a3f720d4a3f730d4a3f740d4a3f750d4a3f760d4a3f770d4a3f780d4a3f790d4a3f7a0d4a3f7b0d4a3f7c0d4a3f7d0d4a3f7e0d4a3f7f0d4a3f800d4a3f810d4a3f820d4a3f830d4a3f840d4a3f850d4a3f860d4a3f870d4a3f880d4a3f890d4a3f8a0d4a3f8b0d4a3f8c0d4a3f8d0d4a3f8e0d4a3f8f0d4a3f900d4a3f910d4a3f920d4a3f930d4a3f940d4a3f950d4a3f960d4a3f970d4a3f980d4a3f990d4a3f9a0d4a3f9b0d4a3f9c0d4a3f9d0d4a3f9e0d4a3f9f"+
    "0d4a3fa00d4a3fa10d4a3fa20d4a3fa30d4a3fa40d4a3fa50d4a3fa60d4a3fa70d4a3fa80d4a3fa90d4a3faa0d4a3fab0d4a3fac0d4a3fad0d4a3fae0d4a3faf0d4a3fb00d4a3fb10d4a3fb20d4a3fb30d4a3fb40d4a3fb50d4a3fb60d4a3fb70d4a3fb8124a3fb9124b3f50124b3f51124b3f52124b3f530d4b3f540d4b3f550d4b3f560d4b3f570d4b3f580d4b3f590d4b3f5a0d4b3f5b0d4b3f5c124b3f5d124b3f5e124b3f5f124b3f6c124b3f6d0d4b3f6e0d4b3f6f0d4b3f700d4b3f710d4b3f720d4b3f73"+
    "0d4b3f740d4b3f750d4b3f760d4b3f770d4b3f780d4b3f790d4b3f7a0d4b3f7b0d4b3f7c0d4b3f7d0d4b3f7e0d4b3f7f0d4b3f800d4b3f810d4b3f820d4b3f830d4b3f840d4b3f850d4b3f860d4b3f870d4b3f880d4b3f890d4b3f8a0d4b3f8b0d4b3f8c0d4b3f8d0d4b3f8e0d4b3f8f0d4b3f900d4b3f910d4b3f920d4b3f930d4b3f940d4b3f950d4b3f960d4b3f970d4b3f980d4b3f990d4b3f9a0d4b3f9b0d4b3f9c0d4b3f9d0d4b3f9e0d4b3f9f0d4b3fa00d4b3fa10d4b3fa20d4b3fa30d4b3fa40d4b3fa5"+
    "0d4b3fa60d4b3fa70d4b3fa80d4b3fa90d4b3faa0d4b3fab0d4b3fac0d4b3fad0d4b3fae0d4b3faf0d4b3fb00d4b3fb10d4b3fb20d4b3fb30d4b3fb40d4b3fb50d4b3fb60d4b3fb70d4b3fb80d4b3fb90d4b3fba0d4b3fbb0d4b3fbc0d4b3fbd0d4b3fbe0d4c3f420d4c3f430d4c3f440d4c3f45124c3f46124c3f5a124c3f5b124c3f5c0d4c3f5d0d4c3f5e0d4c3f5f0d4c3f600d4c3f610d4c3f620d4c3f630d4c3f640d4c3f65124c3f66124c3f67124c3f68124c3f75124c3f760d4c3f770d4c3f780d4c3f79"+
    "0d4c3f7a0d4c3f7b0d4c3f7c0d4c3f7d0d4c3f7e0d4c3f7f0d4c3f800d4c3f810d4c3f820d4c3f830d4c3f840d4c3f850d4c3f860d4c3f870d4c3f880d4c3f890d4c3f8a0d4c3f8b0d4c3f8c0d4c3f8d0d4c3f8e0d4c3f8f0d4c3f900d4c3f910d4c3f92194c3f930d4c3f940d4c3f950d4c3f960d4c3f970d4c3f980d4c3f990d4c3f9a0d4c3f9b0d4c3f9c0d4c3f9d0d4c3f9e0d4c3f9f0d4c3fa00d4c3fa10d4c3fa20d4c3fa30d4c3fa40d4c3fa50d4c3fa60d4c3fa70d4c3fa80d4c3fa90d4c3faa0d4c3fab"+
    "0d4c3fac0d4c3fad0d4c3fae0d4c3faf0d4c3fb00d4c3fb10d4c3fb20d4c3fb30d4c3fb40d4c3fb50d4c3fb60d4c3fb70d4c3fb80d4c3fb90d4c3fba0d4c3fbb0d4c3fbc0d4c3fbd0d4c3fbe0d4d3f420d4d3f430d4d3f440d4d3f450d4d3f460d4d3f470d4d3f480d4d3f490d4d3f4a0d4d3f4b0d4d3f4c0d4d3f4d0d4d3f4e0d4d3f4f0d4d3f50124d3f63124d3f64124d3f650d4d3f660d4d3f670d4d3f680d4d3f690d4d3f6a0d4d3f6b0d4d3f6c0d4d3f6d0d4d3f6e124d3f6f124d3f70124d3f7e124d3f7f"+
    "124d3f800d4d3f810d4d3f820d4d3f830d4d3f840d4d3f850d4d3f860d4d3f870d4d3f880d4d3f890d4d3f8a0d4d3f8b0d4d3f8c0d4d3f8d0d4d3f8e0d4d3f8f0d4d3f900d4d3f910d4d3f920d4d3f930d4d3f940d4d3f950d4d3f960d4d3f970d4d3f980d4d3f990d4d3f9a0d4d3f9b0d4d3f9c0d4d3f9d0d4d3f9e0d4d3f9f0d4d3fa00d4d3fa10d4d3fa20d4d3fa30d4d3fa40d4d3fa50d4d3fa60d4d3fa70d4d3fa80d4d3fa90d4d3faa0d4d3fab0d4d3fac0d4d3fad0d4d3fae0d4d3faf0d4d3fb00d4d3fb1"+
    "0d4d3fb20d4d3fb30d4d3fb40d4d3fb50d4d3fb60d4d3fb70d4d3fb80d4d3fb90d4d3fba0d4d3fbb0d4d3fbc0d4d3fbd0d4d3fbe0d4e3f420d4e3f430d4e3f440d4e3f450d4e3f460d4e3f470d4e3f480d4e3f490d4e3f4a0d4e3f4b0d4e3f4c0d4e3f4d0d4e3f4e0d4e3f4f0d4e3f500d4e3f510d4e3f520d4e3f530d4e3f540d4e3f550d4e3f560d4e3f570d4e3f580d4e3f59124e3f5a124e3f6d124e3f6e124e3f6f0d4e3f700d4e3f710d4e3f720d4e3f730d4e3f740d4e3f750d4e3f760d4e3f770d4e3f78"+
    "124e3f791c4e3f83124e3f86124e3f87124e3f88124e3f890d4e3f8a0d4e3f8b0d4e3f8c0d4e3f8d0d4e3f8e0d4e3f8f0d4e3f900d4e3f910d4e3f920d4e3f930d4e3f940d4e3f950d4e3f960d4e3f970d4e3f980d4e3f990d4e3f9a0d4e3f9b0d4e3f9c0d4e3f9d0d4e3f9e0d4e3f9f0d4e3fa00d4e3fa10d4e3fa20d4e3fa30d4e3fa40d4e3fa50d4e3fa60d4e3fa70d4e3fa80d4e3fa90d4e3faa0d4e3fab0d4e3fac0d4e3fad0d4e3fae0d4e3faf0d4e3fb00d4e3fb10d4e3fb20d4e3fb30d4e3fb40d4e3fb5"+
    "0d4e3fb60d4e3fb70d4e3fb80d4e3fb90d4e3fba0d4e3fbb0d4e3fbc0d4e3fbd0d4e3fbe0d4f3f420d4f3f430d4f3f440d4f3f450d4f3f460d4f3f470d4f3f480d4f3f490d4f3f4a0d4f3f4b0d4f3f4c0d4f3f4d0d4f3f4e0d4f3f4f0d4f3f500d4f3f510d4f3f520d4f3f530d4f3f540d4f3f550d4f3f560d4f3f570d4f3f580d4f3f590d4f3f5a0d4f3f5b0d4f3f5c0d4f3f5d0d4f3f5e0d4f3f5f0d4f3f600d4f3f610d4f3f620d4f3f63124f3f641b4f3f6f1b4f3f701b4f3f71124f3f77124f3f78124f3f79"+
    "0d4f3f7a0d4f3f7b0d4f3f7c0d4f3f7d0d4f3f7e0d4f3f7f0d4f3f80124f3f81124f3f82124f3f83124f3f8f124f3f90124f3f91124f3f92124f3f930d4f3f940d4f3f950d4f3f960d4f3f970d4f3f980d4f3f990d4f3f9a0d4f3f9b0d4f3f9c0d4f3f9d0d4f3f9e0d4f3f9f0d4f3fa00d4f3fa10d4f3fa20d4f3fa30d4f3fa40d4f3fa50d4f3fa60d4f3fa70d4f3fa80d4f3fa90d4f3faa0d4f3fab0d4f3fac0d4f3fad0d4f3fae0d4f3faf0d4f3fb00d4f3fb10d4f3fb20d4f3fb30d4f3fb40d4f3fb50d4f3fb6"+
    "0d4f3fb70d4f3fb80d4f3fb90d4f3fba0d4f3fbb0d4f3fbc0d4f3fbd0d4f3fbe0d503f420d503f430d503f440d503f450d503f460d503f470d503f480d503f490d503f4a0d503f4b0d503f4c0d503f4d0d503f4e0d503f4f0d503f500d503f510d503f520d503f530d503f540d503f550d503f560d503f570d503f580d503f590d503f5a0d503f5b0d503f5c0d503f5d0d503f5e0d503f5f0d503f600d503f610d503f620d503f630d503f640d503f650d503f660d503f670d503f680d503f690d503f6a0d503f6b"+
    "0d503f6c0d503f6d0d503f6e1b503f791b503f7a1b503f7b12503f8112503f8212503f830d503f840d503f850d503f860d503f870d503f880d503f8912503f8a12503f8b1c503f9212503f9712503f9812503f9912503f9a12503f9b12503f9c0d503f9d0d503f9e0d503f9f0d503fa00d503fa10d503fa20d503fa30d503fa40d503fa50d503fa60d503fa70d503fa80d503fa90d503faa0d503fab0d503fac0d503fad0d503fae0d503faf0d503fb00d503fb10d503fb20d503fb30d503fb40d503fb50d503fb6"+
    "0d503fb70d503fb80d503fb90d503fba0d503fbb0d503fbc0d503fbd0d503fbe0d513f420d513f430d513f440d513f450d513f460d513f470d513f480d513f490d513f4a0d513f4b0d513f4c0d513f4d0d513f4e0d513f4f0d513f500d513f510d513f520d513f530d513f540d513f550d513f560d513f570d513f580d513f590d513f5a0d513f5b0d513f5c0d513f5d0d513f5e0d513f5f0d513f600d513f610d513f620d513f630d513f640d513f650d513f660d513f670d513f680d513f690d513f6a0d513f6b"+
    "0d513f6c0d513f6d0d513f6e0d513f6f0d513f700d513f710d513f720d513f730d513f740d513f750d513f760d513f770d513f7812513f791c513f831b513f841b513f851c513f8a12513f8b12513f8c12513f8d0d513f8e0d513f8f0d513f900d513f9112513f9212513f9312513f9412513f9f12513fa012513fa112513fa212513fa312513fa412513fa512513fa612513fa70d513fa80d513fa90d513faa0d513fab0d513fac0d513fad0d513fae0d513faf0d513fb00d513fb10d513fb20d513fb30d513fb4"+
    "0d513fb50d513fb60d513fb70d513fb80d513fb90d513fba0d513fbb0d513fbc0d513fbd0d513fbe0d523f420d523f430d523f440d523f450d523f460d523f470d523f480d523f490d523f4a0d523f4b0d523f4c0d523f4d0d523f4e0d523f4f0d523f500d523f510d523f520d523f530d523f540d523f550d523f560d523f570d523f580d523f590d523f5a0d523f5b0d523f5c0d523f5d0d523f5e0d523f5f0d523f600d523f610d523f620d523f630d523f640d523f650d523f660d523f670d523f680d523f69"+
    "0d523f6a0d523f6b0d523f6c0d523f6d0d523f6e0d523f6f0d523f700d523f710d523f720d523f730d523f740d523f750d523f760d523f770d523f780d523f790d523f7a0d523f7b0d523f7c0d523f7d0d523f7e0d523f7f0d523f800d523f810d523f8212523f831b523f8d1b523f8e1b523f8f12523f9612523f970d523f980d523f9912523f9a12523f9b12523f9c12523fa712523fa812523fa912523faa12523fab12523fac12523fad12523fae12523faf12523fb012523fb10d523fb20d523fb30d523fb4"+
    "0d523fb50d523fb60d523fb70d523fb80d523fb90d523fba0d523fbb0d523fbc0d523fbd0d523fbe0d533f420d533f430d533f440d533f450d533f460d533f470d533f480d533f490d533f4a0d533f4b0d533f4c0d533f4d0d533f4e0d533f4f0d533f500d533f510d533f520d533f530d533f540d533f550d533f560d533f570d533f580d533f590d533f5a0d533f5b0d533f5c0d533f5d0d533f5e0d533f5f0d533f600d533f610d533f620d533f630d533f640d533f650d533f660d533f670d533f680d533f69"+
    "0d533f6a0d533f6b0d533f6c0d533f6d0d533f6e0d533f6f0d533f700d533f710d533f720d533f730d533f740d533f750d533f760d533f770d533f780d533f790d533f7a0d533f7b0d533f7c0d533f7d0d533f7e0d533f7f0d533f800d533f810d533f820d533f830d533f840d533f850d533f860d533f870d533f880d533f890d533f8a0d533f8b0d533f8c0d533f8d1b533f971b533f9812533fa012533fa10d533fa212533fa312533fa412533fa512533fa632533faa12533fb112533fb212533fb312533fb4"+
    "12533fb512533fb612533fb712533fb812533fb912533fba12533fbb0d533fbc0d533fbd0d533fbe0d543f420d543f430d543f440d543f450d543f460d543f470d543f480d543f490d543f4a0d543f4b0d543f4c0d543f4d0d543f4e0d543f4f0d543f500d543f510d543f520d543f530d543f540d543f550d543f560d543f570d543f580d543f590d543f5a0d543f5b0d543f5c0d543f5d0d543f5e0d543f5f0d543f600d543f610d543f620d543f630d543f640d543f650d543f660d543f670d543f680d543f69"+
    "0d543f6a0d543f6b0d543f6c0d543f6d0d543f6e0d543f6f0d543f700d543f710d543f720d543f730d543f740d543f750d543f760d543f770d543f780d543f790d543f7a0d543f7b0d543f7c0d543f7d0d543f7e0d543f7f0d543f800d543f810d543f820d543f830d543f840d543f850d543f860d543f870d543f880d543f890d543f8a0d543f8b0d543f8c0d543f8d0d543f8e0d543f8f0d543f900d543f910d543f920d543f930d543f940d543f950d543f960d543f9712543f981c543fa912543faa12543fab"+
    "12543fac12543fad12543fae12543faf32543fb012543fbb12543fbc12543fbd12543fbe12553f4212553f4312553f4412553f4512553f4612553f470d553f480d553f490d553f4a0d553f4b0d553f4c0d553f4d0d553f4e0d553f4f0d553f500d553f510d553f520d553f530d553f540d553f550d553f560d553f570d553f580d553f590d553f5a0d553f5b0d553f5c0d553f5d0d553f5e0d553f5f0d553f600d553f610d553f620d553f630d553f640d553f650d553f660d553f670d553f680d553f690d553f6a"+
    "0d553f6b0d553f6c0d553f6d0d553f6e0d553f6f0d553f700d553f710d553f720d553f730d553f740d553f750d553f760d553f770d553f780d553f790d553f7a0d553f7b0d553f7c0d553f7d0d553f7e0d553f7f0d553f800d553f810d553f820d553f830d553f840d553f850d553f860d553f870d553f880d553f890d553f8a0d553f8b0d553f8c0d553f8d0d553f8e0d553f8f0d553f900d553f910d553f920d553f930d553f940d553f950d553f960d553f970d553f980d553f990d553f9a0d553f9b0d553f9c"+
    "0d553f9d0d553f9e0d553f9f0d553fa00d553fa10d553fa21b553fab1b553fac1b553fad1b553fae12553fb412553fb512553fb612553fb712553fb812553fb912563f4812563f4912563f4a12563f4b12563f4c12563f4d12563f4e12563f4f12563f5012563f5112563f520d563f530d563f540d563f550d563f560d563f570d563f580d563f590d563f5a0d563f5b0d563f5c0d563f5d0d563f5e0d563f5f0d563f600d563f610d563f620d563f630d563f640d563f650d563f660d563f670d563f680d563f69"+
    "0d563f6a0d563f6b0d563f6c0d563f6d0d563f6e0d563f6f0d563f700d563f710d563f720d563f730d563f740d563f750d563f760d563f770d563f780d563f790d563f7a0d563f7b0d563f7c0d563f7d0d563f7e0d563f7f0d563f800d563f810d563f820d563f830d563f840d563f850d563f860d563f870d563f880d563f890d563f8a0d563f8b0d563f8c0d563f8d0d563f8e0d563f8f0d563f900d563f910d563f920d563f930d563f940d563f950d563f960d563f970d563f980d563f990d563f9a0d563f9b"+
    "0d563f9c0d563f9d0d563f9e0d563f9f0d563fa00d563fa10d563fa20d563fa30d563fa40d563fa50d563fa60d563fa70d563fa80d563fa90d563faa0d563fab0d563fac12563fad1b563fb51b563fb61b563fb71b563fb812563fbe12573f4212573f4312573f4412573f4512573f5212573f5312573f5412573f5512573f5612573f5712573f5812573f5912573f5a12573f5b0d573f5c0d573f5d0d573f5e0d573f5f0d573f600d573f610d573f620d573f630d573f640d573f650d573f660d573f670d573f68"+
    "0d573f690d573f6a0d573f6b0d573f6c0d573f6d0d573f6e0d573f6f0d573f700d573f710d573f720d573f730d573f740d573f750d573f760d573f770d573f780d573f790d573f7a0d573f7b0d573f7c0d573f7d0d573f7e0d573f7f0d573f800d573f810d573f820d573f830d573f840d573f850d573f860d573f870d573f880d573f890d573f8a0d573f8b0d573f8c0d573f8d0d573f8e0d573f8f0d573f900d573f910d573f920d573f930d573f940d573f950d573f960d573f970d573f980d573f990d573f9a"+
    "0d573f9b0d573f9c0d573f9d0d573f9e0d573f9f0d573fa00d573fa10d573fa20d573fa30d573fa40d573fa50d573fa60d573fa70d573fa80d573fa90d573faa0d573fab0d573fac0d573fad0d573fae0d573faf0d573fb00d573fb10d573fb20d573fb30d573fb40d573fb50d573fb60d573fb71b583f421c583f431b583f441b583f450d583f4b12583f4c12583f4d12583f4e12583f4f12583f5012583f5b12583f5c12583f5d12583f5e12583f5f12583f6012583f6112583f6212583f6312583f6412583f65"+
    "0d583f660d583f670d583f680d583f690d583f6a0d583f6b0d583f6c0d583f6d0d583f6e0d583f6f0d583f700d583f710d583f720d583f730d583f740d583f750d583f760d583f770d583f780d583f790d583f7a0d583f7b0d583f7c0d583f7d0d583f7e0d583f7f0d583f800d583f810d583f820d583f830d583f840d583f850d583f860d583f870d583f880d583f890d583f8a0d583f8b0d583f8c0d583f8d0d583f8e0d583f8f0d583f900d583f910d583f920d583f930d583f940d583f950d583f960d583f97"+
    "0d583f980d583f990d583f9a0d583f9b0d583f9c0d583f9d0d583f9e0d583f9f0d583fa00d583fa10d583fa20d583fa30d583fa40d583fa50d583fa60d583fa70d583fa80d583fa90d583faa0d583fab0d583fac0d583fad0d583fae0d583faf0d583fb00d583fb10d583fb20d583fb30d583fb40d583fb50d583fb60d583fb70d583fb80d583fb90d583fba0d583fbb0d583fbc0d583fbd0d583fbe0d593f420d593f430d593f4412593f4512593f461b593f4c1b593f4d1b593f4e1b593f4f32593f5512593f56"+
    "12593f5712593f580d593f5912593f5a12593f5b1c593f5c12593f6512593f6612593f6712593f6812593f6912593f6a12593f6b12593f6c12593f6d12593f6e0d593f6f0d593f700d593f710d593f720d593f730d593f740d593f750d593f760d593f770d593f780d593f790d593f7a0d593f7b0d593f7c0d593f7d0d593f7e0d593f7f0d593f800d593f810d593f820d593f830d593f840d593f850d593f860d593f870d593f880d593f890d593f8a0d593f8b0d593f8c0d593f8d0d593f8e0d593f8f0d593f90"+
    "0d593f910d593f920d593f930d593f940d593f950d593f960d593f970d593f980d593f990d593f9a0d593f9b0d593f9c0d593f9d0d593f9e0d593f9f0d593fa00d593fa10d593fa20d593fa30d593fa40d593fa50d593fa60d593fa70d593fa80d593fa90d593faa0d593fab0d593fac0d593fad0d593fae0d593faf0d593fb00d593fb10d593fb20d593fb30d593fb40d593fb50d593fb60d593fb70d593fb80d593fb90d593fba0d593fbb0d593fbc0d593fbd0d593fbe0d5a3f420d5a3f430d5a3f440d5a3f45"+
    "0d5a3f460d5a3f470d5a3f480d5a3f490d5a3f4a0d5a3f4b0d5a3f4c0d5a3f4d0d5a3f4e125a3f4f125a3f501b5a3f561b5a3f571b5a3f581b5a3f59125a3f60125a3f61125a3f62125a3f63125a3f64125a3f65125a3f66325a3f69125a3f6e125a3f6f125a3f70125a3f71125a3f72125a3f73125a3f74125a3f75125a3f76125a3f770d5a3f780d5a3f790d5a3f7a0d5a3f7b0d5a3f7c0d5a3f7d0d5a3f7e0d5a3f7f0d5a3f800d5a3f810d5a3f820d5a3f830d5a3f840d5a3f850d5a3f860d5a3f870d5a3f88"+
    "0d5a3f890d5a3f8a0d5a3f8b0d5a3f8c0d5a3f8d0d5a3f8e0d5a3f8f0d5a3f900d5a3f910d5a3f920d5a3f930d5a3f940d5a3f950d5a3f960d5a3f970d5a3f980d5a3f990d5a3f9a0d5a3f9b0d5a3f9c0d5a3f9d0d5a3f9e0d5a3f9f0d5a3fa00d5a3fa10d5a3fa20d5a3fa30d5a3fa40d5a3fa50d5a3fa60d5a3fa70d5a3fa80d5a3fa90d5a3faa0d5a3fab0d5a3fac0d5a3fad0d5a3fae0d5a3faf0d5a3fb00d5a3fb10d5a3fb20d5a3fb30d5a3fb40d5a3fb50d5a3fb60d5a3fb70d5a3fb80d5a3fb90d5a3fba"+
    "0d5a3fbb0d5a3fbc0d5a3fbd0d5a3fbe0d5b3f420d5b3f430d5b3f440d5b3f450d5b3f460d5b3f470d5b3f480d5b3f490d5b3f4a0d5b3f4b0d5b3f4c0d5b3f4d0d5b3f4e0d5b3f4f0d5b3f500d5b3f510d5b3f520d5b3f530d5b3f540d5b3f550d5b3f560d5b3f570d5b3f58125b3f59125b3f5a025b3f63025b3f64025b3f65025b3f66025b3f67125b3f6b125b3f6c125b3f6d125b3f6e125b3f6f125b3f70125b3f71125b3f76125b3f77125b3f78125b3f79125b3f7a125b3f7b125b3f7c125b3f7d125b3f7e"+
    "125b3f7f125b3f800d5b3f810d5b3f820d5b3f830d5b3f840d5b3f850d5b3f860d5b3f870d5b3f880d5b3f890d5b3f8a0d5b3f8b0d5b3f8c0d5b3f8d0d5b3f8e0d5b3f8f0d5b3f900d5b3f910d5b3f920d5b3f930d5b3f940d5b3f950d5b3f960d5b3f970d5b3f980d5b3f990d5b3f9a0d5b3f9b0d5b3f9c0d5b3f9d0d5b3fa00d5b3fa10d5b3fa20d5b3fa30d5b3fa40d5b3fa50d5b3fa60d5b3fa70d5b3fa90d5b3faa0d5b3fab0d5b3fac0d5b3fad0d5b3fae0d5b3faf0d5b3fb00d5b3fb10d5b3fb20d5b3fb3"+
    "0d5b3fb40d5b3fb50d5b3fb60d5b3fb70d5b3fb80d5b3fb90d5b3fba0d5b3fbb0d5b3fbc0d5b3fbd0d5b3fbe0d5c3f420d5c3f430d5c3f440d5c3f450d5c3f460d5c3f470d5c3f480d5c3f490d5c3f4a0d5c3f4b0d5c3f4c0d5c3f4d0d5c3f4e0d5c3f4f0d5c3f500d5c3f510d5c3f520d5c3f530d5c3f540d5c3f550d5c3f560d5c3f570d5c3f580d5c3f590d5c3f5a0d5c3f5b0d5c3f5c0d5c3f5d0d5c3f5e0d5c3f5f0d5c3f600d5c3f610d5c3f620d5c3f63125c3f64025c3f6d025c3f6e025c3f6f025c3f70"+
    "025c3f71125c3f77125c3f78125c3f79125c3f7a125c3f7e125c3f7f125c3f80125c3f81125c3f82125c3f83125c3f84125c3f85125c3f86125c3f870d5c3f880d5c3f890d5c3f8a0d5c3f8b0d5c3f8c0d5c3f8d0d5c3f8e0d5c3f8f0d5c3f900d5c3f910d5c3f920d5c3f930d5c3f940d5c3f950d5c3f960d5c3f970d5c3f980d5c3f990d5c3f9a0d5c3f9b0d5c3f9c0d5c3f9d0d5c3f9e0d5c3f9f0d5c3fa00d5c3fa10d5c3fa20d5c3fa30d5c3fa40d5c3fa50d5c3fa60d5c3fb00d5c3fb10d5c3fb40d5c3fb5"+
    "0d5c3fb60d5c3fb70d5c3fb80d5c3fb90d5c3fba0d5c3fbb0d5c3fbc0d5c3fbd0d5c3fbe0d5d3f420d5d3f430d5d3f440d5d3f450d5d3f460d5d3f470d5d3f480d5d3f490d5d3f4a0d5d3f4b0d5d3f4c0d5d3f4d0d5d3f4e0d5d3f4f0d5d3f500d5d3f510d5d3f520d5d3f530d5d3f540d5d3f550d5d3f560d5d3f570d5d3f580d5d3f590d5d3f5a0d5d3f5b0d5d3f5c0d5d3f5d0d5d3f5e0d5d3f5f0d5d3f600d5d3f610d5d3f620d5d3f630d5d3f640d5d3f650d5d3f660d5d3f670d5d3f680d5d3f690d5d3f6a"+
    "0d5d3f6b0d5d3f6c0d5d3f6d125d3f6e125d3f6f025d3f77025d3f78035d3f79025d3f7a025d3f7b035d3f7d125d3f88125d3f89125d3f8a125d3f8b125d3f8c125d3f8d125d3f8e0d5d3f8f0d5d3f900d5d3f910d5d3f920d5d3f930d5d3f940d5d3f950d5d3f960d5d3f970d5d3f980d5d3f990d5d3f9a0d5d3f9b0d5d3f9c0d5d3f9d0d5d3f9e0d5d3f9f0d5d3fa00d5d3fa10d5d3fa20d5d3fa30d5d3fa40d5d3fa50d5d3fa60d5d3fa70d5d3fa80d5d3fa90d5d3faa0d5d3fab0d5d3fac0d5d3fad0d5d3fae"+
    "0d5d3fbb0d5d3fbc0d5d3fbe0d5e3f420d5e3f430d5e3f440d5e3f450d5e3f460d5e3f470d5e3f480d5e3f490d5e3f4a0d5e3f4b0d5e3f4c0d5e3f4d0d5e3f4e0d5e3f4f0d5e3f500d5e3f510d5e3f520d5e3f530d5e3f540d5e3f550d5e3f560d5e3f570d5e3f580d5e3f590d5e3f5a0d5e3f5b0d5e3f5c0d5e3f5d0d5e3f5e0d5e3f5f0d5e3f600d5e3f610d5e3f620d5e3f630d5e3f640d5e3f650d5e3f660d5e3f670d5e3f680d5e3f690d5e3f6a0d5e3f6b0d5e3f6c0d5e3f6d0d5e3f6e0d5e3f6f0d5e3f70"+
    "0d5e3f710d5e3f720d5e3f730d5e3f740d5e3f750d5e3f760d5e3f77125e3f78125e3f79125e3f7a025e3f81025e3f82025e3f83025e3f84025e3f85125e3f91125e3f92125e3f93125e3f94125e3f95125e3f96125e3f970d5e3f980d5e3f990d5e3f9a0d5e3f9b0d5e3f9c0d5e3f9d0d5e3f9e0d5e3f9f0d5e3fa00d5e3fa10d5e3fa20d5e3fa30d5e3fa40d5e3fa50d5e3fa60d5e3fa70d5e3fa80d5e3fa90d5e3faa0d5e3fab0d5e3fac0d5e3fad0d5e3fae0d5e3faf0d5e3fb00d5e3fb10d5e3fb20d5e3fb3"+
    "0d5e3fb40d5e3fb50d5e3fb60d5e3fb70d5e3fb80d5f3f470d5f3f4b0d5f3f4c0d5f3f4d0d5f3f4e0d5f3f4f0d5f3f500d5f3f510d5f3f520d5f3f530d5f3f540d5f3f550d5f3f560d5f3f570d5f3f580d5f3f590d5f3f5a0d5f3f5b0d5f3f5c0d5f3f5d0d5f3f5e0d5f3f5f0d5f3f600d5f3f610d5f3f620d5f3f630d5f3f640d5f3f650d5f3f660d5f3f670d5f3f680d5f3f690d5f3f6a0d5f3f6b0d5f3f6c0d5f3f6d0d5f3f6e0d5f3f6f0d5f3f700d5f3f710d5f3f720d5f3f730d5f3f740d5f3f750d5f3f76"+
    "0d5f3f770d5f3f780d5f3f790d5f3f7a0d5f3f7b0d5f3f7c0d5f3f7d0d5f3f7e0d5f3f7f0d5f3f80125f3f81125f3f82125f3f83125f3f84025f3f8a025f3f8b025f3f8c025f3f8d025f3f8e025f3f8f1b5f3f901b5f3f91125f3f9b125f3f9c125f3f9d125f3f9e125f3f9f125f3fa0125f3fa10d5f3fa20d5f3fa30d5f3fa40d5f3fa50d5f3fa60d5f3fa70d5f3fa80d5f3fa90d5f3faa0d5f3fab0d5f3fac0d5f3fad0d5f3fae0d5f3faf0d5f3fb00d5f3fb10d5f3fb20d5f3fb30d5f3fb40d5f3fb50d5f3fb6"+
    "0d5f3fb70d5f3fb80d5f3fb90d5f3fba0d5f3fbb0d5f3fbc0d5f3fbd0d5f3fbe0d603f420d603f430d603f440d603f450d603f500d603f510d603f540d603f550d603f560d603f570d603f580d603f590d603f5a0d603f5b0d603f5c0d603f5d0d603f5e0d603f5f0d603f600d603f610d603f620d603f630d603f640d603f650d603f660d603f670d603f680d603f690d603f6a0d603f6b0d603f6c0d603f6d0d603f6e0d603f6f0d603f700d603f710d603f720d603f730d603f740d603f750d603f760d603f77"+
    "0d603f780d603f790d603f7a0d603f7b0d603f7c0d603f7d0d603f7e0d603f7f0d603f800d603f810d603f820d603f830d603f840d603f850d603f860d603f870d603f880d603f890d603f8a12603f8b12603f8c12603f8d12603f8e12603f8f02603f9303603f9402603f951b603f971b603f981b603f991b603f9a1b603f9b12603fa512603fa612603fa712603fa812603fa912603faa12603fab0d603fac0d603fad0d603fae0d603faf0d603fb00d603fb10d603fb20d603fb30d603fb40d603fb50d603fb6"+
    "0d603fb70d603fb80d603fb90d603fba0d603fbb0d603fbc0d603fbd19603fbe0d613f420d613f430d613f440d613f450d613f460d613f470d613f480d613f490d613f4a0d613f4b0d613f4c0d613f4d0d613f4e0d613f4f0d613f5e0d613f5f0d613f600d613f610d613f620d613f630d613f640d613f650d613f660d613f670d613f680d613f690d613f6a0d613f6b0d613f6c0d613f6d0d613f6e0d613f6f0d613f700d613f710d613f720d613f730d613f740d613f750d613f760d613f770d613f780d613f79"+
    "0d613f7a0d613f7b0d613f7c0d613f7d0d613f7e0d613f7f0d613f800d613f810d613f820d613f830d613f840d613f850d613f860d613f870d613f880d613f890d613f8a0d613f8b0d613f8c0d613f8d0d613f8e0d613f8f0d613f900d613f910d613f920d613f930d613f9412613f9512613f9612613f9712613f9812613f991b613f9c02613f9e1b613fa11b613fa21c613fa31b613fa41b613fa512613faf12613fb012613fb112613fb212613fb312613fb412613fb512613fb60d613fb70d613fb80d613fb9"+
    "0d613fba0d613fbb0d613fbc0d613fbd0d613fbe0d623f420d623f430d623f440d623f450d623f460d623f470d623f480d623f490d623f4b0d623f4c0d623f4d0d623f4e0d623f4f0d623f500d623f510d623f520d623f530d623f540d623f550d623f560d623f570d623f580d623f590d623f5a0d623f5b0d623f610d623f620d623f680d623f690d623f6a0d623f6b0d623f6c0d623f6d0d623f6e0d623f6f0d623f700d623f710d623f720d623f730d623f740d623f750d623f760d623f770d623f780d623f79"+
    "0d623f7a0d623f7b0d623f7c0d623f7d0d623f7e0d623f7f0d623f800d623f810d623f820d623f830d623f840d623f850d623f860d623f870d623f880d623f890d623f8a0d623f8b0d623f8c0d623f8d0d623f8e0d623f8f0d623f900d623f910d623f920d623f930d623f940d623f950d623f960d623f970d623f980d623f990d623f9a0d623f9b0d623f9c0d623f9d12623f9e12623f9f12623fa012623fa112623fa21b623fab1b623fac1b623fad1b623fae1b623faf12623fb912623fba12623fbb12623fbc"+
    "12623fbd12623fbe12633f4212633f4312633f440d633f450d633f460d633f470d633f480d633f490d633f4a0d633f4b0d633f4c0d633f4d0d633f4e0d633f4f0d633f500d633f510d633f520d633f530d633f540d633f550d633f560d633f570d633f580d633f590d633f5a0d633f5b0d633f5c0d633f5d0d633f5e0d633f5f0d633f600d633f610d633f620d633f630d633f640d633f650d633f660d633f670d633f680d633f690d633f6c0d633f6d0d633f710d633f720d633f730d633f740d633f750d633f76"+
    "0d633f770d633f780d633f790d633f7a0d633f7b0d633f7c0d633f7d0d633f7e0d633f7f0d633f800d633f810d633f820d633f830d633f840d633f850d633f860d633f870d633f880d633f890d633f8a0d633f8b0d633f8c0d633f8d0d633f8e0d633f8f0d633f900d633f910d633f920d633f930d633f940d633f950d633f960d633f970d633f980d633f990d633f9a0d633f9b0d633f9c0d633f9d0d633f9e0d633f9f0d633fa00d633fa10d633fa20d633fa30d633fa40d633fa50d633fa60d633fa712633fa8"+
    "12633fa91b633fb61b633fb71b633fb81b633fb925643f451c643f462e643f472e643f482e643f491c643f4a2e643f4b2e643f4c2e643f4d2e643f4e2e643f4f1c643f500d643f510d643f520d643f530d643f540d643f550d643f560d643f570d643f580d643f590d643f5a0d643f5b0d643f5c0d643f5d0d643f5e0d643f5f0d643f600d643f610d643f620d643f630d643f640d643f650d643f660d643f670d643f680d643f690d643f6a0d643f6b0d643f6c0d643f6d0d643f6e0d643f6f0d643f700d643f71"+
    "0d643f760d643f770d643f780d643f790d643f7a0d643f7b0d643f7c0d643f7d0d643f7e0d643f7f0d643f800d643f810d643f820d643f830d643f840d643f850d643f860d643f870d643f880d643f890d643f8a0d643f8b0d643f8c0d643f8d0d643f8e0d643f8f0d643f900d643f910d643f920d643f930d643f940d643f950d643f960d643f970d643f980d643f990d643f9a0d643f9b0d643f9c0d643f9d0d643f9e0d643f9f0d643fa00d643fa10d643fa20d643fa30d643fa40d643fa50d643fa60d643fa7"+
    "0d643fa80d643fa90d643faa0d643fab0d643fac0d643fad0d643fae0d643faf0d643fb012643fb112643fb22e653f501d653f511d653f521d653f531d653f541d653f551d653f561d653f571d653f581d653f592e653f5a0d653f5b0d653f5c0d653f5d0d653f5e0d653f5f0d653f600d653f610d653f620d653f630d653f640d653f650d653f660d653f670d653f680d653f690d653f6a0d653f6b0d653f6c0d653f6d0d653f6e0d653f6f0d653f700d653f720d653f730d653f740d653f750d653f760d653f77"+
    "0d653f780d653f790d653f7a0d653f7b0d653f7c0d653f7d0d653f7e0d653f7f0d653f800d653f810d653f820d653f830d653f840d653f850d653f860d653f870d653f880d653f890d653f8a0d653f8b0d653f8c0d653f8d0d653f8e0d653f8f0d653f900d653f910d653f920d653f930d653f940d653f950d653f960d653f970d653f980d653f990d653f9a0d653f9b0d653f9c0d653f9d0d653f9e0d653f9f0d653fa00d653fa10d653fa20d653fa30d653fa40d653fa50d653fa60d653fa70d653fa80d653fa9"+
    "0d653faa0d653fab0d653fac0d653fad0d653fae0d653faf0d653fb00d653fb10d653fb20d653fb30d653fb40d653fb50d653fb60d653fb70d653fb80d653fb912653fba12653fbb12663f592e663f5a1d663f5b1d663f5c1d663f5d1d663f5e1d663f5f1d663f601d663f611d663f621d663f632e663f640d663f650d663f660d663f670d663f680d663f690d663f6a0d663f6b0d663f6c0d663f6d0d663f6e0d663f6f0d663f700d663f710d663f720d663f730d663f740d663f750d663f760d663f770d663f78"+
    "0d663f790d663f7a0d663f7b0d663f7c0d663f7d0d663f7e0d663f7f0d663f800d663f810d663f820d663f830d663f840d663f850d663f860d663f870d663f880d663f890d663f8a0d663f8b0d663f8c0d663f8d0d663f8e0d663f8f0d663f900d663f910d663f920d663f930d663f940d663f950d663f960d663f970d663f980d663f990d663f9a0d663f9d0d663f9e0d663f9f0d663fa00d663fa10d663fa20d663fa30d663fa40d663fa50d663fa60d663fa70d663fa80d663fa90d663faa0d663fab0d663fac"+
    "0d663fad0d663fae0d663faf0d663fb00d663fb10d663fb20d663fb30d663fb40d663fb50d663fb60d663fb70d663fb80d663fb90d663fba0d663fbb0d663fbc0d663fbd0d663fbe0d673f420d673f430d673f440d673f4512673f4612673f471b673f541b673f552e673f641d673f651d673f661d673f671d673f681d673f691d673f6a1d673f6b1d673f6c1d673f6d2e673f6e19673f6f0d673f700d673f7119673f7212673f730d673f740d673f750d673f760d673f770d673f780d673f790d673f7a0d673f7b"+
    "0d673f7c0d673f7d0d673f7e0d673f7f0d673f800d673f810d673f820d673f830d673f840d673f850d673f860d673f870d673f880d673f890d673f8a0d673f8b0d673f8c0d673f8d0d673f8e0d673f8f0d673f900d673f910d673f920d673f930d673f940d673f950d673f960d673f970d673f980d673f990d673f9a0d673f9b0d673f9c0d673f9d0d673f9e0d673f9f0d673fa00d673fa10d673fa20d673fa30d673fa40d673fa50d673fa60d673fa90d673faa0d673fab0d673fac0d673fad0d673fae0d673faf"+
    "0d673fb00d673fb10d673fb20d673fb30d673fb40d673fb50d673fb60d673fb70d673fb80d673fb90d673fba0d673fbb0d673fbc0d673fbd0d673fbe0d683f420d683f430d683f440d683f450d683f460d683f470d683f480d683f490d683f4a0d683f4b0d683f4c0d683f4d12683f4e12683f4f12683f501b683f5b1b683f5c1b683f5e1c683f5f1b683f6012683f6d1c683f6e1d683f6f1d683f701d683f711c683f721d683f731d683f741d683f751d683f761d683f772e683f7808683f7b12683f7d0d683f7e"+
    "0d683f7f0d683f800d683f810d683f820d683f830d683f840d683f850d683f860d683f870d683f880d683f890d683f8a0d683f8b0d683f8c0d683f8d0d683f8e0d683f8f0d683f900d683f910d683f920d683f930d683f940d683f950d683f960d683f970d683f980d683f990d683f9a0d683f9b0d683f9c0d683f9d0d683f9e0d683f9f0d683fa00d683fa10d683fa20d683fa30d683fa40d683fa50d683fa60d683fa70d683fa80d683fa90d683faa0d683fab0d683fac0d683fae0d683fb00d683fb20d683fb4"+
    "0d683fb50d683fb60d683fb70d683fb80d683fb90d683fba0d683fbb0d683fbc0d683fbd0d683fbe0d693f420d693f430d693f440d693f450d693f460d693f470d693f480d693f490d693f4a0d693f4b0d693f4c0d693f4d0d693f4e0d693f4f0d693f500d693f510d693f520d693f530d693f540d693f550d693f5612693f5712693f5812693f591c693f651b693f661b693f691b693f6a02693f6b02693f6c02693f6d2e693f781d693f791d693f7a1d693f7b1d693f7c1d693f7d1d693f7e1d693f7f1d693f80"+
    "1d693f812e693f8208693f8308693f8419693f8512693f870d693f880d693f890d693f8a0d693f8b0d693f8c0d693f8d0d693f8e0d693f8f0d693f900d693f910d693f920d693f930d693f940d693f950d693f960d693f970d693f980d693f990d693f9a0d693f9b0d693f9c0d693f9d0d693f9e0d693f9f0d693fa00d693fa10d693fa20d693fa30d693fa40d693fa50d693fa60d693fa70d693fa80d693fa90d693faa0d693fab0d693fac0d693fad0d693fae0d693faf0d693fb00d693fb10d693fb20d693fb3"+
    "0d693fb40d693fb50d693fb60d693fbb0d693fbd0d693fbe0d6a3f420d6a3f430d6a3f440d6a3f450d6a3f460d6a3f470d6a3f480d6a3f490d6a3f4a0d6a3f4b0d6a3f4c0d6a3f4d0d6a3f4e0d6a3f4f0d6a3f500d6a3f510d6a3f520d6a3f530d6a3f540d6a3f550d6a3f560d6a3f570d6a3f580d6a3f590d6a3f5a0d6a3f5b0d6a3f5c0d6a3f5d0d6a3f5e126a3f5f126a3f60126a3f61126a3f621b6a3f6f026a3f73026a3f74026a3f75026a3f76026a3f772e6a3f821d6a3f831d6a3f841d6a3f851d6a3f86"+
    "1d6a3f871d6a3f881d6a3f891d6a3f8a1d6a3f8b2e6a3f8c196a3f8e086a3f90126a3f910d6a3f920d6a3f930d6a3f940d6a3f950d6a3f960d6a3f970d6a3f980d6a3f990d6a3f9a0d6a3f9b0d6a3f9c0d6a3f9d0d6a3f9e0d6a3f9f0d6a3fa00d6a3fa10d6a3fa20d6a3fa30d6a3fa40d6a3fa50d6a3fa60d6a3fa70d6a3fa80d6a3fa90d6a3faa0d6a3fab0d6a3fac0d6a3fad0d6a3fae0d6a3faf0d6a3fb00d6a3fb10d6a3fb20d6a3fb30d6a3fb40d6a3fb50d6a3fb60d6a3fb70d6a3fb80d6a3fb90d6a3fba"+
    "0d6a3fbb0d6a3fbc0d6a3fbd0d6a3fbe0d6b3f420d6b3f440d6b3f4a0d6b3f4b0d6b3f4c0d6b3f4d0d6b3f4e0d6b3f4f0d6b3f500d6b3f510d6b3f520d6b3f530d6b3f540d6b3f550d6b3f560d6b3f570d6b3f580d6b3f590d6b3f5a0d6b3f5b0d6b3f5c0d6b3f5d0d6b3f5e0d6b3f5f0d6b3f600d6b3f610d6b3f620d6b3f630d6b3f640d6b3f650d6b3f660d6b3f67126b3f68126b3f69126b3f6a126b3f6b026b3f7d026b3f7e036b3f7f026b3f80026b3f812e6b3f8c1d6b3f8d1d6b3f8e1d6b3f8f1d6b3f90"+
    "1d6b3f911d6b3f921d6b3f931d6b3f941d6b3f952e6b3f96086b3f97086b3f99196b3f9a0d6b3f9b0d6b3f9c0d6b3f9d0d6b3f9e0d6b3f9f0d6b3fa00d6b3fa10d6b3fa20d6b3fa30d6b3fa40d6b3fa50d6b3fa60d6b3fa70d6b3fa80d6b3fa90d6b3faa0d6b3fab0d6b3fac0d6b3fad0d6b3fae0d6b3faf0d6b3fb00d6b3fb10d6b3fb20d6b3fb30d6b3fb40d6b3fb50d6b3fb60d6b3fb70d6b3fb80d6b3fb90d6b3fba0d6b3fbb0d6b3fbc0d6b3fbd0d6b3fbe0d6c3f420d6c3f430d6c3f440d6c3f450d6c3f46"+
    "0d6c3f470d6c3f480d6c3f490d6c3f4a0d6c3f4b0d6c3f4c0d6c3f4d0d6c3f570d6c3f580d6c3f590d6c3f5a0d6c3f5b0d6c3f5c0d6c3f5d0d6c3f5e0d6c3f5f0d6c3f600d6c3f610d6c3f620d6c3f630d6c3f640d6c3f650d6c3f660d6c3f670d6c3f680d6c3f690d6c3f6a0d6c3f6b0d6c3f6c0d6c3f6d0d6c3f6e0d6c3f6f0d6c3f700d6c3f71126c3f72126c3f73126c3f74026c3f87026c3f88026c3f89026c3f8a026c3f8b1c6c3f962e6c3f972e6c3f982e6c3f992e6c3f9a2e6c3f9b2e6c3f9c2e6c3f9d"+
    "2e6c3f9e2e6c3f9f1c6c3fa02d6c3fa1086c3fa22d6c3fa4126c3fa50d6c3fa60d6c3fa70d6c3fa80d6c3fa90d6c3faa0d6c3fab0d6c3fac0d6c3fad0d6c3fae0d6c3faf0d6c3fb00d6c3fb10d6c3fb20d6c3fb30d6c3fb40d6c3fb50d6c3fb60d6c3fb70d6c3fb80d6c3fb90d6c3fba0d6c3fbb0d6c3fbc0d6c3fbd0d6c3fbe0d6d3f420d6d3f430d6d3f440d6d3f450d6d3f460d6d3f470d6d3f480d6d3f490d6d3f4a0d6d3f4b0d6d3f4c0d6d3f4d0d6d3f4e0d6d3f4f0d6d3f500d6d3f510d6d3f520d6d3f53"+
    "0d6d3f540d6d3f550d6d3f560d6d3f570d6d3f580d6d3f5b0d6d3f5e0d6d3f5f0d6d3f600d6d3f610d6d3f620d6d3f630d6d3f640d6d3f650d6d3f660d6d3f670d6d3f680d6d3f690d6d3f6a0d6d3f6b0d6d3f6c0d6d3f6d0d6d3f6e0d6d3f6f0d6d3f700d6d3f710d6d3f720d6d3f730d6d3f740d6d3f750d6d3f760d6d3f770d6d3f780d6d3f790d6d3f7a0d6d3f7b126d3f7c126d3f7d026d3f92026d3f93026d3f94126d3fa2126d3fa3126d3fa4126d3fa5126d3fa6126d3fa7126d3fa8126d3fa9126d3faa"+
    "236d3fab2d6d3fac236d3fad236d3fae126d3faf0d6d3fb00d6d3fb10d6d3fb20d6d3fb30d6d3fb40d6d3fb50d6d3fb60d6d3fb70d6d3fb80d6d3fb90d6d3fba0d6d3fbb0d6d3fbc0d6d3fbd0d6d3fbe0d6e3f420d6e3f430d6e3f440d6e3f450d6e3f460d6e3f470d6e3f480d6e3f490d6e3f4a0d6e3f4b0d6e3f4c0d6e3f4d0d6e3f4e0d6e3f4f0d6e3f500d6e3f510d6e3f520d6e3f530d6e3f540d6e3f550d6e3f560d6e3f570d6e3f580d6e3f590d6e3f5a0d6e3f5b0d6e3f5c0d6e3f5d0d6e3f5e0d6e3f5f"+
    "0d6e3f600d6e3f610d6e3f620d6e3f630d6e3f690d6e3f6a0d6e3f6b0d6e3f6c0d6e3f6d0d6e3f6e0d6e3f6f0d6e3f700d6e3f710d6e3f720d6e3f730d6e3f740d6e3f750d6e3f760d6e3f770d6e3f780d6e3f790d6e3f7a0d6e3f7b0d6e3f7c0d6e3f7d0d6e3f7e0d6e3f7f0d6e3f800d6e3f810d6e3f820d6e3f830d6e3f840d6e3f85126e3f86126e3f871b6e3fab126e3fac126e3fad126e3fae126e3faf126e3fb0126e3fb1126e3fb2126e3fb31b6e3fb4236e3fb6096e3fb71b6e3fb9126e3fba0d6e3fbb"+
    "0d6e3fbc0d6e3fbd0d6e3fbe0d6f3f420d6f3f430d6f3f440d6f3f450d6f3f460d6f3f470d6f3f480d6f3f490d6f3f4a0d6f3f4b0d6f3f4c0d6f3f4d0d6f3f4e0d6f3f4f0d6f3f500d6f3f510d6f3f520d6f3f530d6f3f540d6f3f550d6f3f560d6f3f570d6f3f580d6f3f59196f3f5a0d6f3f5b0d6f3f5c0d6f3f5d0d6f3f5e0d6f3f5f0d6f3f600d6f3f610d6f3f620d6f3f630d6f3f640d6f3f650d6f3f660d6f3f670d6f3f680d6f3f690d6f3f6a0d6f3f6c0d6f3f6f0d6f3f710d6f3f730d6f3f740d6f3f75"+
    "0d6f3f760d6f3f770d6f3f780d6f3f790d6f3f7a0d6f3f7b0d6f3f7c0d6f3f7d0d6f3f7e0d6f3f7f0d6f3f800d6f3f810d6f3f820d6f3f830d6f3f840d6f3f850d6f3f860d6f3f870d6f3f880d6f3f890d6f3f8a0d6f3f8b0d6f3f8c0d6f3f8d0d6f3f8e126f3f8f126f3f90126f3f911b6f3fb7126f3fb81b6f3fbb126f3fbc1b6f3fbd1b6f3fbe1b703f470d703f480d703f490d703f4a0d703f4b0d703f4c0d703f4d0d703f4e0d703f4f0d703f500d703f510d703f520d703f530d703f540d703f550d703f56"+
    "0d703f570d703f580d703f590d703f5a0d703f5b0d703f5c0d703f5d0d703f5e0d703f5f0d703f600d703f610d703f620d703f630d703f640d703f650d703f660d703f670d703f680d703f690d703f6a0d703f6b0d703f6c0d703f6d0d703f6e0d703f6f0d703f700d703f710d703f720d703f730d703f740d703f790d703f7a0d703f7d0d703f7e0d703f7f0d703f800d703f810d703f820d703f830d703f840d703f850d703f860d703f870d703f880d703f890d703f8a0d703f8b0d703f8c0d703f8d0d703f8e"+
    "0d703f8f0d703f900d703f910d703f920d703f930d703f940d703f950d703f960d703f970d703f9812703f9912703f9a12703f9b0a713f5012713f520d713f530d713f540d713f550d713f560d713f570d713f580d713f590d713f5a0d713f5b0d713f5c0d713f5d0d713f5e0d713f5f0d713f600d713f610d713f620d713f630d713f640d713f650d713f660d713f670d713f680d713f690d713f6a0d713f6b0d713f6c0d713f6d0d713f6e0d713f6f0d713f700d713f710d713f720d713f730d713f740d713f75"+
    "0d713f760d713f770d713f780d713f790d713f7a0d713f7b0d713f7c0d713f7d0d713f7e0d713f810d713f820d713f830d713f850d713f860d713f870d713f880d713f890d713f8a0d713f8b0d713f8c0d713f8d0d713f8e0d713f8f0d713f900d713f910d713f920d713f930d713f940d713f950d713f960d713f970d713f980d713f990d713f9a0d713f9b0d713f9c0d713f9d0d713f9e0d713f9f0d713fa00d713fa10d713fa212713fa312713fa41b723f5a12723f5c0d723f5d0d723f5e0d723f5f0d723f60"+
    "0d723f610d723f620d723f630d723f640d723f650d723f660d723f670d723f680d723f690d723f6a0d723f6b0d723f6c0d723f6d0d723f6e0d723f6f0d723f700d723f710d723f720d723f730d723f740d723f750d723f760d723f770d723f780d723f790d723f7a0d723f7b0d723f7c0d723f7d0d723f7e0d723f7f0d723f800d723f810d723f820d723f830d723f840d723f850d723f860d723f870d723f880d723f890d723f8b0d723f8c0d723f8d0d723f8e0d723f8f0d723f900d723f910d723f920d723f93"+
    "0d723f940d723f950d723f960d723f970d723f980d723f990d723f9a0d723f9b0d723f9c0d723f9d0d723f9e0d723f9f0d723fa00d723fa10d723fa20d723fa30d723fa40d723fa50d723fa60d723fa70d723fa80d723fa90d723faa0d723fab12723fac12723fad12723fae1b733f4212733f660d733f670d733f680d733f690d733f6a0d733f6b0d733f6c0d733f6d0d733f6e0d733f6f0d733f700d733f710d733f720d733f730d733f740d733f750d733f760d733f770d733f780d733f790d733f7a0d733f7b"+
    "0d733f7c0d733f7d0d733f7e0d733f7f0d733f800d733f810d733f820d733f830d733f840d733f850d733f860d733f870d733f880d733f890d733f8a0d733f8b0d733f8c0d733f8d0d733f8e0d733f8f0d733f900d733f910d733f920d733f930d733f940d733f950d733f960d733f970d733f980d733f990d733f9a0d733f9b0d733f9c0d733f9d0d733f9e0d733f9f0d733fa00d733fa10d733fa20d733fa30d733fa40d733fa50d733fa60d733fa70d733fa80d733fa90d733faa0d733fab0d733fac0d733fad"+
    "0d733fae0d733faf0d733fb00d733fb10d733fb20d733fb30d733fb40d733fb512733fb612733fb712733fb81b743f4c1b743f4d12743f700d743f710d743f720d743f730d743f740d743f750d743f760d743f770d743f780d743f790d743f7a0d743f7b0d743f7c0d743f7d0d743f7e0d743f7f0d743f800d743f810d743f820d743f830d743f840d743f850d743f860d743f870d743f880d743f890d743f8a0d743f8b0d743f8c0d743f8d0d743f8e0d743f8f0d743f900d743f910d743f920d743f930d743f94"+
    "0d743f950d743f960d743f970d743f980d743f990d743f9a0d743f9b0d743f9c0d743f9d0d743f9e0d743f9f0d743fa00d743fa10d743fa20d743fa30d743fa40d743fa50d743fa60d743fa70d743fa80d743fa90d743faa0d743fab0d743fac0d743fad0d743fae0d743faf0d743fb00d743fb10d743fb20d743fb30d743fb40d743fb50d743fb60d743fb70d743fb80d743fb90d743fba0d743fbb0d743fbc0d743fbd0d743fbe0d753f4212753f4312753f441b753f561b753f572a753f6828753f6929753f6a"+
    "28753f6b28753f6d29753f6e28753f6f2a753f7012753f7a12753f7b0d753f7c0d753f7d0d753f7e0d753f7f0d753f800d753f810d753f820d753f830d753f840d753f850d753f860d753f870d753f880d753f890d753f8a0d753f8b0d753f8c0d753f8d0d753f8e0d753f8f0d753f900d753f910d753f920d753f930d753f940d753f950d753f960d753f970d753f980d753f990d753f9a0d753f9b0d753f9c0d753f9d0d753f9e0d753f9f0d753fa00d753fa10d753fa20d753fa30d753fa40d753fa50d753fa6"+
    "0d753fa70d753fa80d753fa90d753faa0d753fab0d753fac0d753fad0d753fae0d753faf0d753fb00d753fb10d753fb20d753fb30d753fb40d753fb50d753fb60d753fb70d753fb80d753fb90d753fba0d753fbb0d753fbc0d753fbd0d753fbe0d763f420d763f430d763f440d763f450d763f460d763f470d763f480d763f490d763f4a0d763f4b0d763f4c12763f4d12763f4e1b763f601b763f612a763f7228763f7327763f7427763f7527763f7627763f7727763f7828763f792a763f7a12763f850d763f86"+
    "0d763f870d763f880d763f890d763f8a0d763f8b0d763f8c0d763f8d0d763f8e0d763f8f0d763f900d763f910d763f920d763f930d763f940d763f950d763f960d763f970d763f980d763f990d763f9a0d763f9b0d763f9c0d763f9d0d763f9e0d763f9f0d763fa00d763fa10d763fa20d763fa30d763fa40d763fa50d763fa60d763fa70d763fa80d763fa90d763faa0d763fab0d763fac0d763fad0d763fae0d763faf0d763fb00d763fb10d763fb20d763fb30d763fb40d763fb50d763fb60d763fb70d763fb8"+
    "0d763fb90d763fba0d763fbb0d763fbc0d763fbd0d763fbe0d773f420d773f430d773f440d773f450d773f460d773f470d773f480d773f490d773f4a0d773f4b0d773f4c0d773f4d0d773f4e0d773f4f0d773f500d773f510d773f520d773f530d773f540d773f5512773f5612773f571b773f6a2a773f7c28773f7d27773f7e28773f7f28773f8127773f8228773f832a773f841b773f8f12773f900d773f910d773f920d773f930d773f940d773f950d773f960d773f970d773f980d773f990d773f9a0d773f9b"+
    "0d773f9c0d773f9d0d773f9e0d773f9f0d773fa00d773fa10d773fa20d773fa30d773fa40d773fa50d773fa60d773fa70d773fa80d773fa90d773faa0d773fab0d773fac0d773fad0d773fae0d773faf0d773fb00d773fb10d773fb20d773fb30d773fb40d773fb50d773fb60d773fb70d773fb80d773fb90d773fba0d773fbb0d773fbc0d773fbd0d773fbe0d783f420d783f430d783f440d783f450d783f460d783f470d783f480d783f490d783f4a0d783f4b0d783f4c0d783f4d0d783f4e0d783f4f0d783f50"+
    "0d783f510d783f520d783f530d783f540d783f550d783f560d783f570d783f580d783f590d783f5a0d783f5b0d783f5c0d783f5d0d783f5e12783f5f12783f6012783f612a783f8628783f8727783f8828783f8916783f8a28783f8b27783f8c28783f8d2a783f8e1b783f9a12783f9b0d783f9c0d783f9d0d783f9e0d783f9f0d783fa00d783fa10d783fa20d783fa30d783fa40d783fa50d783fa60d783fa70d783fa80d783fa90d783faa0d783fab0d783fac0d783fad0d783fae0d783faf0d783fb00d783fb1"+
    "0d783fb20d783fb30d783fb40d783fb50d783fb60d783fb70d783fb80d783fb90d783fba0d783fbb0d783fbc0d783fbd0d783fbe0d793f420d793f430d793f440d793f450d793f460d793f470d793f480d793f490d793f4a0d793f4b0d793f4c0d793f4d0d793f4e0d793f4f0d793f500d793f510d793f520d793f530d793f540d793f550d793f560d793f570d793f580d793f590d793f5a0d793f5b0d793f5c0d793f5d0d793f5e0d793f5f0d793f600d793f610d793f620d793f630d793f640d793f650d793f66"+
    "0d793f670d793f6812793f6912793f6a2a793f9028793f9127793f9228793f9328793f9527793f9628793f972a793f981b793fa312793fa50d793fa60d793fa70d793fa80d793fa90d793faa0d793fab0d793fac0d793fad0d793fae0d793faf0d793fb00d793fb10d793fb20d793fb30d793fb40d793fb50d793fb60d793fb70d793fb80d793fb90d793fba0d793fbb0d793fbc0d793fbd0d793fbe0d7a3f420d7a3f430d7a3f440d7a3f450d7a3f460d7a3f470d7a3f480d7a3f490d7a3f4a0d7a3f4b0d7a3f4c"+
    "0d7a3f4d0d7a3f4e0d7a3f4f0d7a3f500d7a3f510d7a3f520d7a3f530d7a3f540d7a3f550d7a3f560d7a3f570d7a3f580d7a3f590d7a3f5a0d7a3f5b0d7a3f5c0d7a3f5d0d7a3f5e0d7a3f5f0d7a3f600d7a3f610d7a3f620d7a3f630d7a3f640d7a3f650d7a3f660d7a3f67127a3f68127a3f69127a3f6a127a3f6b0d7a3f6c127a3f6d127a3f6e0d7a3f6f127a3f700d7a3f71127a3f72127a3f732a7a3f9a287a3f9b277a3f9c287a3f9d287a3f9f277a3fa0287a3fa12a7a3fa21b7a3fae127a3faf127a3fb0"+
    "0d7a3fb10d7a3fb20d7a3fb30d7a3fb40d7a3fb50d7a3fb60d7a3fb70d7a3fb80d7a3fb90d7a3fba0d7a3fbb0d7a3fbc0d7a3fbd0d7a3fbe0d7b3f420d7b3f430d7b3f440d7b3f450d7b3f460d7b3f470d7b3f480d7b3f490d7b3f4a0d7b3f4b0d7b3f4c0d7b3f4d0d7b3f4e0d7b3f4f0d7b3f500d7b3f510d7b3f520d7b3f530d7b3f540d7b3f550d7b3f560d7b3f570d7b3f580d7b3f590d7b3f5a0d7b3f5b0d7b3f5c0d7b3f5d0d7b3f5e0d7b3f5f0d7b3f600d7b3f610d7b3f620d7b3f630d7b3f640d7b3f65"+
    "0d7b3f660d7b3f670d7b3f680d7b3f690d7b3f6a0d7b3f6b0d7b3f6c0d7b3f6d0d7b3f6e0d7b3f6f127b3f70127b3f72127b3f741b7b3f76127b3f77127b3f7a1b7b3f7b127b3f7d2a7b3fa4287b3fa5277b3fa6287b3fa7287b3fa9277b3faa287b3fab2a7b3fac127b3fba127b3fbb127b3fbc0d7b3fbd0d7b3fbe0d7c3f420d7c3f430d7c3f440d7c3f450d7c3f460d7c3f470d7c3f480d7c3f490d7c3f4a0d7c3f4b0d7c3f4c0d7c3f4d0d7c3f4e0d7c3f4f0d7c3f500d7c3f510d7c3f520d7c3f530d7c3f54"+
    "0d7c3f550d7c3f560d7c3f570d7c3f580d7c3f590d7c3f5a0d7c3f5b0d7c3f5c0d7c3f5d0d7c3f5e0d7c3f5f0d7c3f600d7c3f610d7c3f620d7c3f630d7c3f640d7c3f650d7c3f660d7c3f670d7c3f680d7c3f690d7c3f6a0d7c3f6b0d7c3f6c0d7c3f6d0d7c3f6e0d7c3f6f0d7c3f700d7c3f710d7c3f720d7c3f730d7c3f740d7c3f750d7c3f760d7c3f770d7c3f780d7c3f791b7c3f7a2a7c3fae287c3faf277c3fb0287c3fb1287c3fb3277c3fb4287c3fb52a7c3fb6127d3f48127d3f49127d3f4a0d7d3f4b"+
    "0d7d3f4c0d7d3f4d0d7d3f4e0d7d3f4f0d7d3f500d7d3f510d7d3f520d7d3f530d7d3f540d7d3f550d7d3f560d7d3f570d7d3f580d7d3f590d7d3f5a0d7d3f5b0d7d3f5c0d7d3f5d0d7d3f5e0d7d3f5f0d7d3f600d7d3f610d7d3f620d7d3f630d7d3f640d7d3f650d7d3f660d7d3f670d7d3f680d7d3f690d7d3f6a0d7d3f6b0d7d3f6c0d7d3f6d0d7d3f6e0d7d3f6f0d7d3f700d7d3f710d7d3f720d7d3f730d7d3f740d7d3f750d7d3f760d7d3f770d7d3f780d7d3f790d7d3f7a0d7d3f7b0d7d3f7c0d7d3f7d"+
    "0d7d3f7e0d7d3f7f0d7d3f800d7d3f81127d3f82127d3f832a7d3fb8287d3fb9277d3fba287d3fbb287d3fbd277d3fbe287e3f422a7e3f431b7e3f501b7e3f52127e3f540d7e3f550d7e3f560d7e3f570d7e3f580d7e3f590d7e3f5a0d7e3f5b0d7e3f5c0d7e3f5d0d7e3f5e0d7e3f5f0d7e3f600d7e3f610d7e3f620d7e3f630d7e3f640d7e3f650d7e3f660d7e3f670d7e3f680d7e3f690d7e3f6a0d7e3f6b0d7e3f6c0d7e3f6d0d7e3f6e0d7e3f6f0d7e3f700d7e3f710d7e3f720d7e3f730d7e3f740d7e3f75"+
    "0d7e3f760d7e3f770d7e3f780d7e3f790d7e3f7a0d7e3f7b0d7e3f7c0d7e3f7d0d7e3f7e0d7e3f7f0d7e3f800d7e3f810d7e3f820d7e3f830d7e3f840d7e3f850d7e3f860d7e3f870d7e3f880d7e3f890d7e3f8a0d7e3f8b127e3f8c2a7f3f45287f3f46277f3f47277f3f48277f3f49277f3f4a277f3f4b287f3f4c2a7f3f4d1b7f3f5e127f3f5f0d7f3f600d7f3f610d7f3f620d7f3f630d7f3f640d7f3f650d7f3f660d7f3f670d7f3f680d7f3f690d7f3f6a0d7f3f6b0d7f3f6c0d7f3f6d0d7f3f6e0d7f3f6f"+
    "0d7f3f700d7f3f710d7f3f720d7f3f730d7f3f740d7f3f750d7f3f760d7f3f770d7f3f780d7f3f790d7f3f7a0d7f3f7b0d7f3f7c0d7f3f7d0d7f3f7e0d7f3f7f0d7f3f800d7f3f810d7f3f820d7f3f830d7f3f840d7f3f850d7f3f860d7f3f870d7f3f880d7f3f890d7f3f8a0d7f3f8b0d7f3f8c0d7f3f8d0d7f3f8e0d7f3f8f0d7f3f900d7f3f910d7f3f920d7f3f930d7f3f94127f3f952a803f4f28803f5029803f5128803f5228803f5428803f5528803f562a803f5725803f581b803f661b803f6912803f6a"+
    "0d803f6b0d803f6c0d803f6d0d803f6e0d803f6f0d803f700d803f710d803f720d803f730d803f740d803f750d803f760d803f770d803f780d803f790d803f7a0d803f7b0d803f7c0d803f7d0d803f7e0d803f7f0d803f800d803f810d803f820d803f830d803f840d803f850d803f860d803f870d803f880d803f890d803f8a0d803f8b0d803f8c0d803f8d0d803f8e0d803f8f0d803f900d803f910d803f920d803f930d803f940d803f950d803f960d803f970d803f980d803f990d803f9a0d803f9b0d803f9c"+
    "0d803f9d0d803f9e1b803f9f1b803fa012813f7512813f760d813f770d813f780d813f790d813f7a0d813f7b0d813f7c0d813f7d0d813f7e0d813f7f0d813f800d813f810d813f820d813f830d813f840d813f850d813f860d813f870d813f880d813f890d813f8a0d813f8b0d813f8c0d813f8d0d813f8e0d813f8f0d813f900d813f910d813f920d813f930d813f940d813f950d813f960d813f970d813f980d813f990d813f9a0d813f9b0d813f9c0d813f9d0d813f9e0d813f9f0d813fa00d813fa10d813fa2"+
    "0d813fa30d813fa40d813fa50d813fa612813fa712813fa812813fa91b823f7d12823f8012823f810d823f820d823f830d823f840d823f850d823f860d823f870d823f880d823f890d823f8a0d823f8b0d823f8c0d823f8d0d823f8e0d823f8f0d823f900d823f910d823f920d823f930d823f940d823f950d823f960d823f970d823f980d823f990d823f9a0d823f9b0d823f9c0d823f9d0d823f9e0d823f9f0d823fa00d823fa10d823fa20d823fa30d823fa40d823fa50d823fa60d823fa70d823fa80d823fa9"+
    "0d823faa0d823fab0d823fac0d823fad0d823fae0d823faf12823fb012823fb21b833f8a12833f8b12833f8c0d833f8d0d833f8e0d833f8f0d833f900d833f910d833f921c833f930d833f940d833f950d833f960d833f970d833f980d833f990d833f9a0d833f9b0d833f9c0d833f9d0d833f9e0d833f9f0d833fa00d833fa10d833fa20d833fa30d833fa40d833fa50d833fa60d833fa70d833fa80d833fa90d833faa0d833fab0d833fac0d833fad0d833fae0d833faf0d833fb00d833fb10d833fb20d833fb3"+
    "0d833fb40d833fb512833fb612833fb712833fb81b833fb925843f7725843f8f1c843f912a843f921c843f931c843f941c843f951c843f961c843f971c843f981c843f991c843f9a1c843f9b1c843f9c1c843f9e1c843f9f0d843fa00d843fa10d843fa20d843fa30d843fa40d843fa50d843fa60d843fa70d843fa80d843fa90d843faa0d843fab0d843fac0d843fad0d843fae0d843faf0d843fb00d843fb10d843fb20d843fb312843fb40d843fb50d843fb612843fb70d843fb80d843fb912843fba12843fbb"+
    "0d843fbc1b843fbd12843fbe12853f4212853f431b853f4409853fa82e853fa908853faa0d853fab0d853fac0d853fad0d853fae0d853faf0d853fb00d853fb10d853fb20d853fb30d853fb40d853fb50d853fb60d853fb70d853fb80d853fb90d853fba0d853fbb0d853fbc0d853fbd12853fbe12863f421b863f461b863f4a1b863f4e09863fb123863fb20d863fb60d863fb70d863fb80d863fb90d863fba0d863fbb0d863fbc0d863fbd0d863fbe0d873f420d873f430d873f440d873f450d873f460d873f47"+
    "0d873f480d873f4912873f4a12873f4b1b873f4e2e873f4f1b873f511b873f530a873f602d873fbb08873fbd0d873fbe0d883f420d883f430d883f440d883f450d883f460d883f470d883f480d883f490d883f4a0d883f4b0d883f4c0d883f4d0d883f4e0d883f4f0d883f500d883f510d883f520d883f530d883f5419883f552d883f5623883f5726883f6a2a893f4209893f470d893f4a0d893f4b1c893f4c0d893f4d0d893f4e0d893f4f0d893f500d893f510d893f520d893f530d893f540d893f550d893f56"+
    "0d893f570d893f580d893f590d893f5a0d893f5b0d893f5c19893f5d2d893f5f09893f6025893f741c8a3f4d1c8a3f4e2a8a3f4f1c8a3f50098a3f51198a3f520d8a3f530d8a3f540d8a3f550d8a3f560d8a3f570d8a3f580d8a3f590d8a3f5a0d8a3f5b0d8a3f5c0d8a3f5d0d8a3f5e0d8a3f5f0d8a3f600d8a3f610d8a3f620d8a3f630d8a3f650d8a3f66198a3f672d8a3f68238a3f69238a3f6a258b3f461b8b3f5a1c8b3f5b0d8b3f5c0d8b3f5d0d8b3f5e0d8b3f5f0d8b3f600d8b3f610d8b3f620d8b3f63"+
    "0d8b3f640d8b3f650d8b3f660d8b3f670d8b3f680d8b3f690d8b3f6a0d8b3f6b0d8b3f6c0d8b3f6d0d8b3f6e0d8b3f6f0d8b3f702d8b3f72098b3f73098b3f74168b3f81258c3f5c1b8c3f64128c3f651c8c3f660d8c3f670d8c3f680d8c3f690d8c3f6a0d8c3f6b0d8c3f6c0d8c3f6d0d8c3f6e0d8c3f6f0d8c3f700d8c3f710d8c3f720d8c3f730d8c3f740d8c3f750d8c3f760d8c3f770d8c3f780d8c3f790d8c3f7a098c3f7c098c3f7d1b8d3f701c8d3f710d8d3f720d8d3f731c8d3f740d8d3f750d8d3f76"+
    "0d8d3f770d8d3f780d8d3f790d8d3f7a0d8d3f7b0d8d3f7c0d8d3f7d0d8d3f7e0d8d3f7f0d8d3f800d8d3f810d8d3f82088d3f83088d3f842d8d3f85238d3f861b8d3f8a258d3f95298d3fb6298d3fb7298d3fb9298d3fba1b8e3f7b128e3f7c128e3f7d1c8e3f7e0d8e3f7f0d8e3f800d8e3f810d8e3f820d8e3f830d8e3f840d8e3f850d8e3f860d8e3f870d8e3f880d8e3f8a0d8e3f8b0d8e3f8c088e3f8d198e3f8e238e3f8f238e3f90298f3f431d8f3f441d8f3f451d8f3f46298f3f471b8f3f871b8f3f88"+
    "1c8f3f890d8f3f8a0d8f3f8b0d8f3f8c0d8f3f8d0d8f3f910d8f3f920d8f3f940d8f3f950d8f3f96088f3f98098f3f9929903f4d29903f4e29903f5029903f511b903f9212903f930d903f940d903f950d903f970d903f9a0d903f9b0d903f9c0d903f9d12903f9e0d903f9f2d903fa12d903fa223903fa31b903fa529913f5729913f5829913f5a29913f5b12913f9e0d913f9f0d913fa00d913fa10d913fa20d913fa30d913fa41c913fa51c913fa612913fa712913fa819913fa919913faa23913fab23913fac"+
    "29923f6129923f6216923f6329923f6429923f651b923fa812923fa91c923faa1c923fab1c923fac1c923fad1c923fae1b923faf1b923fb01b923fb32d923fb425933f5529933f6b29933f6c29933f6e29933f6f1b933fb412933fb51b933fb71b933fba09933fbe29943f7529943f7629943f7829943f791c943fa51d943fa61d943fa71d943fa81d943fa91d943faa1d943fab1d943fac1c943fad1b953f4a29953f7f29953f8029953f8229953f832a953fae1d953faf1d953fb72a953fb825963f4829963f89"+
    "29963f8a29963f8c29963f8d11963fb911973f4429973f931d973f941d973f951d973f9629973f972a983f451d983f461d983f4e2a983f4f29983f9d29983f9e29983fa029983fa11c993f501d993f511d993f521d993f531d993f541d993f551d993f561d993f571c993f582a993f6b2a993f6c29993f9929993f9a29993f9b29993f9c29993f9d29993f9e29993f9f29993fa0259a3f66299a3f732a9a3f74299a3f75299a3f762a9a3f77299a3f78169a3f80259a3f82299a3fa31d9a3fa4299a3fa5299a3fa6"+
    "299a3fa7299a3fa81d9a3fa9299a3faa2a9b3f7d2a9b3f821d9b3fae169b3fb11d9b3fb32a9c3f872a9c3f8c299c3fb71d9c3fb8299c3fb9299c3fba299c3fbb299c3fbc1d9c3fbd299c3fbe249d3f912a9d3f96299e3f44299e3f45299e3f46299e3f47299e3f48299e3f49299e3f4a299e3f4b299e3f84299e3f85299e3f862a9e3f9b2a9e3fa0299f3f8e1d9f3f8f299f3f902a9f3fa52a9f3faa29a03f9827a03f9929a03f9a29a03faf2aa03fb029a03fb129a03fb22aa03fb329a03fb425a03fb916a03fbb"+
    "29a13fa227a13fa329a13fa42aa13fbb2aa13fbc29a23fac27a23fad29a23fae29a33fb61da33fb729a33fb829a53f4329a53f4429a53f4516a63f6025a63f622aa63f822aa63f832aa63f842aa63f852aa63f8628a73f8c29a73f8d29a73f8e29a73f8f28a73f9025a83f6016a83f8525a83f871ca83f951da83f961da83f971da83f981da83f991da83f9a1ca83f9b1da93f9f1da93fa51daa3fa91daa3faf2aab3f932aab3f9616ab3f982aab3f991cab3fa72aab3fa82aab3faa1cab3fab2aab3fac2aab3fae"+
    "1cab3faf2aab3fb02aab3fb21cab3fb31dab3fb92aac3f8b2aac3f8d2aac3f9d1cac3f9e27ac3f9f27ac3fa027ac3fa11cac3fa22aac3fa316ac3fb316ac3fb716ac3fbb27ac3fbd1dad3f461cad3f941dad3f9511ad3f961dad3f971cad3f982aad3fa727ad3fa827ad3fac2aad3fad2aad3fba2aad3fbb2aad3fbc2aad3fbd2aad3fbe2aae3f422aae3f432aae3f442aae3f452aae3f462aae3f472aae3f482aae3f4927ae3f4a1dae3f502aae3f672aae3f682aae3f692aae3f6a2aae3f6b2aae3f6c2aae3f6d"+
    "2aae3f6e2aae3f6f2aae3f702aae3f711dae3f9e1dae3fa22aae3fac2aae3fad2aae3fae2aae3faf2aae3fb02aae3fb11cae3fb21cae3fb62aae3fb72aae3fb82aae3fb92aae3fba2aae3fbb2aae3fbc28af3f4728af3f4828af3f4928af3f4a28af3f4b28af3f4c28af3f4d28af3f4e28af3f4f28af3f5028af3f5128af3f5228af3f5327af3f541daf3f5a28af3f7128af3f7228af3f7328af3f7428af3f7528af3f7628af3f7728af3f7828af3f7928af3f7a28af3f7b1daf3fa81daf3fac28af3fb628af3fb7"+
    "28af3fb828af3fb928af3fba1caf3fbb25af3fbc25b03f431cb03f4428b03f4528b03f4628b03f4728b03f4828b03f4927b03f5127b03f5227b03f5327b03f5427b03f5527b03f5627b03f5727b03f5827b03f5927b03f5a27b03f5b27b03f5c27b03f5d27b03f5e1db03f6427b03f7b27b03f7c27b03f7d27b03f7e27b03f7f27b03f8027b03f8127b03f8227b03f8327b03f8427b03f851db03fb21db03fb629b13f4327b13f4427b13f4527b13f4627b13f471cb13f481cb13f4e27b13f4f27b13f5027b13f51"+
    "27b13f5229b13f5328b13f5b28b13f5c28b13f5d28b13f5e28b13f5f28b13f6028b13f6128b13f6228b13f6328b13f6428b13f6528b13f6628b13f671cb13f681db13f691db13f6a1db13f6b1db13f6c1db13f6d1cb13f6e28b13f851db13f8628b13f8728b13f8828b13f8928b13f8a28b13f8b28b13f8c28b13f8d1db13f8e28b13f8f1db13fbc1db23f4328b23f4d27b23f4e28b23f4f28b23f5028b23f511cb23f521cb23f551cb23f5828b23f5928b23f5a28b23f5b27b23f5c28b23f5d2ab23f652ab23f66"+
    "2ab23f672ab23f682ab23f692ab23f6a2ab23f6b2ab23f6c2ab23f6d2ab23f6e2ab23f6f2ab23f702ab23f712ab23f7229b23f8529b23f8629b23f8729b23f8829b23f8929b23f8a29b23f8b29b23f8c29b23f8d1db23f9016b23f941db23f981db33f491db33f4d29b33f5727b33f5827b33f5927b33f5a27b33f5b1cb33f5c1cb33f6227b33f6327b33f6427b33f6527b33f6629b33f6725b33f6a16b33f6c29b33f8f1db33f9029b33f9129b33f9229b33f9329b33f9429b33f951db33f9629b33f9728b33f99"+
    "1db33f9a28b33f9b28b33f9c28b33f9d28b33f9e28b33f9f28b33fa028b33fa11db33fa228b33fa325b43f4a1cb43f531db43f5411b43f551db43f561cb43f5728b43f6128b43f6228b43f6328b43f6428b43f651cb43f6625b43f6725b43f6b1cb43f6c28b43f6d28b43f6e28b43f6f28b43f7028b43f711db43f9a16b43f9d1db43fa027b43fa327b43fa427b43fa527b43fa627b43fa727b43fa827b43fa927b43faa27b43fab27b43fac27b43fad2ab53f5e2ab53f602ab53f6b2ab53f6c2ab53f6d2ab53f6e"+
    "2ab53f6f2ab53f701cb53f7127b53f7227b53f7327b53f741cb53f752ab53f762ab53f772ab53f782ab53f792ab53f7a2ab53f7b29b53fa31db53fa429b53fa529b53fa629b53fa729b53fa829b53fa91db53faa29b53fab28b53fad28b53fae28b53faf28b53fb028b53fb128b53fb228b53fb328b53fb428b53fb528b53fb628b53fb729b63fad29b63fae29b63faf29b63fb029b63fb129b63fb229b63fb329b63fb429b63fb52ab63fb72ab63fb82ab63fb92ab63fba2ab63fbb2ab63fbc2ab63fbd2ab63fbe"+
    "2ab73f422ab73f432ab73f442ab73f871b3d404e1b3d404f1b3d40501b3d40511b3d40521b3d40561b3d40571b3d40581b3d40591b3d405a1b3d40681b3d40691b3d406a1b3d406b123d4075123d4076123d4077123d40780d3d40790d3d407a0d3d407b0d3d407c0d3d407d0d3d407e0d3d407f0d3d40800d3d40810d3d40820d3d40830d3d40840d3d40850d3d4086123d4087123d4088123d40a9123d40aa123d40ab123d40ac123d40ad123d40ae1b3e40521b3e40591b3e405a1b3e405b1b3e405c1b3e4060"+
    "1b3e40611c3e40621b3e40631b3e4064123e407f123e4080123e40810d3e40820d3e40830d3e40840d3e40850d3e40860d3e40870d3e40880d3e40890d3e408a0d3e408b0d3e408c0d3e408d0d3e408e0d3e408f0d3e40900d3e4091123e4092123e4093123e40b1123e40b2123e40b3123e40b4123e40b5123e40b6123e40b7123e40b8123e40b9123e40ba1b3f405b1c3f405c1b3f405d023f4061023f4062023f4063023f40641b3f406a1b3f406b1b3f406c1b3f406d1b3f406e123f4088123f4089123f408a"+
    "0d3f408b0d3f408c0d3f408d0d3f408e0d3f408f0d3f40900d3f40910d3f40920d3f40930d3f40940d3f40950d3f40960d3f40970d3f40980d3f40990d3f409a0d3f409b0d3f409c123f409d123f40a5123f40a8123f40a9123f40af123f40b1123f40b2123f40ba123f40bb123f40bc123f40bd123f40be12404042124040431240404412404045124040461240404712404048124040491240404a0240406402404065024040660240406a0240406b0240406c0240406d0240406e1b4040741b4040751b404076"+
    "1b4040771b404078124040901240409112404092124040930d4040940d4040950d4040960d4040970d4040980d4040990d40409a0d40409b0d40409c0d40409d0d40409e0d40409f0d4040a00d4040a10d4040a20d4040a30d4040a40d4040a50d4040a6124040a7124040a8124040ae124040af124040b0124040b1124040b2124040b3124040b4124040b5124040b7124040b8124040b9124040ba124040bb124040bc124040bd1241404412414045124140461241404712414048124140491241404a1241404b"+
    "1241404c1241404d1241404e1241404f12414050124140511241405212414053124140541241405512414056124140571241405d0241406d0241406e0241406f024140700241407102414074024140750341407602414077024140781b41408b1b41408c1b41408d1b41408e1b4140901b4140911b414092124140991241409a1241409b1241409c0d41409d0d41409e0d41409f0d4140a00d4140a10d4140a20d4140a30d4140a40d4140a50d4140a60d4140a70d4140a80d4140a90d4140aa0d4140ab0d4140ac"+
    "0d4140ad0d4140ae0d4140af0d4140b0124140b1124140b2124140b3124140b4124140b6124140b7124140b8124140b9124140ba124140bb124140bc124140bd124140be12424042124240431242404412424045124240461242404712424048124240491242404a1242404b1242404c1242404d1242404e1242404f124240501242405112424052124240531242405412424055124240561242405712424058124240591242405a1242405b1242405c1242405d1242405e1242405f124240601242406112424062"+
    "124240631242406412424065124240661242406712424068124240691242406a0242407702424078034240790242407a0242407b0242407e0242407f0242408002424081024240821c4240881b4240941b4240951b4240961b4240971b4240981b4240991b42409a1b42409b1b42409c1b42409d124240a1124240a2124240a3124240a4124240a5124240a60d4240a70d4240a80d4240a90d4240aa0d4240ab0d4240ac0d4240ad0d4240ae0d4240af0d4240b00d4240b10d4240b20d4240b30d4240b40d4240b5"+
    "0d4240b60d4240b70d4240b80d4240b90d4240ba124240bb124240bc124240bd124240be12434042124340431243404412434045124340461243404712434048124340491243404a1243404b1243404c1243404d1243404e1243404f124340501243405112434052124340531243405412434055124340561243405712434058124340591243405a1243405b1243405c1243405d1243405e1243405f124340601243406112434062124340631243406412434065124340661243406712434068124340691243406a"+
    "1243406b1243406c1243406d1243406e1243406f124340701243407112434072124340731243407412434075024340810243408202434083024340840243408502434088024340890243408a0243408b1b43409e1b43409f1c4340a01b4340a11b4340a21b4340a31b4340a41c4340a51b4340a61b4340a7124340aa124340ab124340ac124340ad124340ae124340af0d4340b00d4340b10d4340b20d4340b30d4340b40d4340b50d4340b60d4340b70d4340b80d4340b90d4340ba0d4340bb0d4340bc0d4340bd"+
    "0d4340be0d4440420d4440430d4440440d4440450d4440461244404712444048124440491244404a1244404b1244404c1244404d1244404e1244404f124440501244405112444052124440531244405412444055124440561244405712444058124440591244405a1244405b1244405c1244405d1244405e1244405f124440601244406112444062124440631244406412444065124440661244406712444068124440691244406a1244406b1244406c1244406d1244406e1244406f124440701244407112444072"+
    "124440731244407412444075124440761244407712444078124440791244407a1244407b1244407c1244407d1244407e1244407f124440800244408c0244408d0244408e1b44408f1b4440901b4440911c4440a31b4440a81b4440a91b4440aa1b4440ab1b4440ac1b4440ad1b4440ae1b4440af1b4440b01b4440b1124440b3124440b4124440b5124440b60d4440b7124440b80d4440b90d4440ba0d4440bb0d4440bc0d4440bd0d4440be0d4540420d4540430d4540440d4540450d4540460d4540470d454048"+
    "0d4540490d45404a0d45404b0d45404c0d45404d0845404e0d45404f124540501245405112454052124540531245405412454055124540561245405712454058124540591245405a1245405b1245405c1245405d1245405e1245405f124540601245406112454062124540631245406412454065124540661245406712454068124540691245406a1245406b1245406c1245406d1245406e1245406f124540701245407112454072124540731245407412454075124540761245407712454078124540791245407a"+
    "1245407b1245407c1245407d1245407e1245407f124540801245408112454082124540831245408412454085124540861245408712454088124540891245408a1245408b1b4540931b4540981b4540991b45409a1b45409b1b45409c124540a4124540a5124540a6124540a7124540a81c4540a91b4540b21b4540b31b4540b41b4540b51b4540b61b4540b71b4540b81b4540b91b4540ba124540bc124540bd124540be0d4640420d4640430d4640440d4640450d4640460d4640470d4640480d4640490d46404a"+
    "0d46404b0d46404c0d46404d0d46404e0d46404f0d4640500d4640510d4640520d4640530d4640540d4640550d464058084640591246405a1246405b1246405c1246405d1246405e1246405f124640601246406112464062124640631246406412464065124640661246406712464068124640691246406a1246406b1246406c1246406d1246406e1246406f124640701246407112464072124640731246407412464075124640761246407712464078124640791246407a1246407b1246407c1246407d1246407e"+
    "1246407f124640801246408112464082124640831246408412464085124640861246408712464088124640891246408a1246408b1246408c1246408d1246408e1246408f124640901246409112464092124640931b46409c1b46409d1b46409e1b4640a21b4640a31c4640a41b4640a51b4640a61c4640aa124640ae124640af124640b0124640b1124640b21b4640bd1b4640be1b4740421b4740431b47404412474048124740490d47404a0d47404b0d47404c0d47404d0d47404e0d47404f0d4740500d474051"+
    "0d4740520d4740530d4740540d4740550d4740560d4740570d4740580d4740590d47405a0d47405b0d47405c0d47405d0d47405e0d47405f0d474061084740621247406412474065124740661247406712474068124740691247406a1247406b1247406c1247406d1247406e1247406f124740701247407112474072124740731247407412474075124740761247407712474078124740791247407a1247407b1247407c1247407d1247407e1247407f124740801247408112474082124740831247408412474085"+
    "124740861247408712474088124740891247408a1247408b1247408c1247408d1247408e1247408f124740901247409112474092124740931247409412474095124740961247409712474098124740991247409a1247409b1247409c1b4740a71b4740ac1b4740ad1b4740ae1b4740af1b4740b0124740b7124740b8124740b9124740ba124740bb124740bc1b48404a1b48404b1c48404c1b48404d1b48404e124840520d4840530d4840540d4840550d4840560d4840570d4840580d4840590d48405a0d48405b"+
    "0d48405c0d48405d0d48405e0d48405f0d4840600d4840610d4840620d4840630d4840640d4840650d4840660d484067124840681948406a0848406c1248406e1248406f124840701248407112484072124840731248407412484075124840761248407712484078124840791248407a1248407b1248407c1248407d1248407e1248407f124840801248408112484082124840831248408412484085124840861248408712484088124840891248408a1248408b1248408c1248408d1248408e1248408f12484090"+
    "1248409112484092124840931248409412484095124840961248409712484098124840991248409a1248409b1248409c1248409d1248409e1248409f124840a0124840a1124840a2124840a3124840a4124840a51b4840b71b4840b81b4840b91b4840ba124940431249404412494045124940461249404712494048124940491b4940541b4940551b4940561b4940571b4940581249405b0d49405c0d49405d0d49405e0d49405f0d4940600d4940610d4940620d4940630d4940640d4940650d4940660d494067"+
    "0d4940680d4940690d49406a0d49406b0d49406c0d49406d0d49406e0d49406f0d4940700d49407112494072084940750849407712494078124940791249407a1249407b1249407c1249407d1249407e1249407f124940801249408112494082124940831249408412494085124940861249408712494088124940891249408a1249408b1249408c1249408d1249408e1249408f124940901249409112494092124940931249409412494095124940961249409712494098124940991249409a1249409b1249409c"+
    "1249409d1249409e1249409f124940a0124940a1124940a2124940a3124940a4124940a5124940a6124940a7124940a8124940a9124940aa124940ab124940ac124940ad124940ae124940af124a404c124a404d124a404e124a404f124a4050124a4051124a4052124a40531b4a405e1b4a405f1b4a40601b4a40611b4a4062124a4064124a40650d4a40660d4a40670d4a40680d4a40690d4a406a0d4a406b0d4a406c0d4a406d0d4a406e0d4a406f0d4a40700d4a40710d4a40720d4a40730d4a40740d4a4075"+
    "0d4a40760d4a40770d4a40780d4a40790d4a407a0d4a407b0d4a407c194a407d084a407e124a4082124a4083124a4084124a4085124a4086124a4087124a4088124a4089124a408a124a408b124a408c124a408d124a408e124a408f124a4090124a4091124a4092124a4093124a4094124a4095124a4096124a4097124a4098124a4099124a409a124a409b124a409c124a409d124a409e124a409f124a40a0124a40a1124a40a2124a40a3124a40a4124a40a5124a40a6124a40a7124a40a8124a40a9124a40aa"+
    "124a40ab124a40ac124a40ad124a40ae124a40af124a40b0124a40b1124a40b2124a40b3124a40b4124a40b5124a40b6124a40b7124a40b80d4b4054124b4055124b4056124b4057124b4058124b4059124b405a124b405b124b405c124b406e0d4b406f0d4b40700d4b40710d4b40720d4b40730d4b40740d4b40750d4b40760d4b40770d4b40780d4b40790d4b407a0d4b407b0d4b407c0d4b407d0d4b407e0d4b407f0d4b40800d4b40810d4b40820d4b40830d4b40840d4b40850d4b4086194b4087194b4089"+
    "124b408c124b408d124b408e124b408f124b4090124b4091124b4092124b4093124b4094124b4095124b4096124b4097124b4098124b4099124b409a124b409b124b409c124b409d124b409e124b409f124b40a0124b40a1124b40a2124b40a3124b40a4124b40a5124b40a6124b40a7124b40a8124b40a9124b40aa124b40ab124b40ac124b40ad124b40ae124b40af124b40b0124b40b1124b40b2124b40b3124b40b4124b40b5124b40b6124b40b7124b40b8124b40b9124b40ba124b40bb124b40bc124b40bd"+
    "124b40be124c4042124c4043124c4044124c4045124c405d124c405e124c405f124c4060124c40610d4c4062124c4063124c4064124c40651b4c406d1b4c406e1b4c406f1b4c40701b4c4071124c40770d4c40780d4c40790d4c407a0d4c407b0d4c407c0d4c407d0d4c407e0d4c407f0d4c40800d4c40810d4c40820d4c40830d4c40840d4c40850d4c40860d4c40870d4c40880d4c40890d4c408a0d4c408b0d4c408c0d4c408d0d4c408e0d4c408f0d4c4090124c4091194c4093124c4096124c4097124c4098"+
    "124c4099124c409a124c409b124c409c124c409d124c409e124c409f124c40a0124c40a1124c40a2124c40a3124c40a4124c40a5124c40a6124c40a7124c40a8124c40a9124c40aa124c40ab124c40ac124c40ad124c40ae124c40af124c40b0124c40b1124c40b2124c40b3124c40b4124c40b5124c40b6124c40b7124c40b8124c40b9124c40ba124c40bb124c40bc124c40bd124c40be124d4042124d4043124d4044124d4045124d4046124d4047124d4048124d4049124d404a124d404b124d404c124d404d"+
    "124d404e124d404f124d4050124d4066124d4067124d4068124d4069124d406a124d406b124d406c124d406d124d406e1b4d40771b4d40781b4d40791b4d407a1b4d407b124d4081124d40820d4d40830d4d40840d4d40850d4d40860d4d40870d4d40880d4d40890d4d408a0d4d408b0d4d408c0d4d408d0d4d408e0d4d408f0d4d40900d4d40910d4d40920d4d40930d4d40940d4d40950d4d40960d4d40970d4d40980d4d40990d4d409a124d409b194d409c194d409e124d40a0124d40a1124d40a2124d40a3"+
    "124d40a4124d40a5124d40a6124d40a7124d40a8124d40a9124d40aa124d40ab124d40ac124d40ad124d40ae124d40af124d40b0124d40b1124d40b2124d40b3124d40b4124d40b5124d40b6124d40b7124d40b8124d40b9124d40ba124d40bb124d40bc124d40bd124d40be124e4042124e4043124e4044124e4045124e4046124e4047124e4048124e4049124e404a124e404b124e404c124e404d124e404e124e404f124e4050124e4051124e4052124e4053124e4054124e4055124e4056124e4057124e4058"+
    "124e4059124e4070124e4071124e4072124e4073124e4074124e4075124e4076124e4077124e40781b4e40811b4e40821c4e40831b4e40841b4e4085124e408a124e408b0d4e408c0d4e408d0d4e408e0d4e408f0d4e40900d4e40910d4e40920d4e40930d4e40940d4e40950d4e40960d4e40970d4e40980d4e40990d4e409a0d4e409b0d4e409c0d4e409d0d4e409e0d4e409f0d4e40a00d4e40a10d4e40a20d4e40a30d4e40a40d4e40a5194e40a60d4e40a70d4e40a8194e40a9124e40aa124e40ab124e40ac"+
    "124e40ad124e40ae124e40af124e40b0124e40b1124e40b20d4e40b30d4e40b40d4e40b5124e40b6124e40b7124e40b8124e40b9124e40ba124e40bb124e40bc124e40bd124e40be124f4042124f4043124f4044124f4045124f4046124f4047124f4048124f4049124f404a124f404b124f404c124f404d124f404e124f404f124f4050124f4051124f4052124f4053124f4054124f4055124f4056124f4057124f4058124f4059124f405a124f405b124f405c124f405d124f405e124f405f124f4060124f4061"+
    "124f4062124f4063124f407a124f407b124f407c124f407d124f407e124f407f124f40801b4f408b1b4f408c1b4f408d1b4f408e1b4f408f124f4094124f40950d4f40960d4f40970d4f40980d4f40990d4f409a0d4f409b0d4f409c0d4f409d0d4f409e0d4f409f0d4f40a00d4f40a10d4f40a20d4f40a30d4f40a40d4f40a50d4f40a60d4f40a70d4f40a80d4f40a90d4f40aa0d4f40ab0d4f40ac0d4f40ad0d4f40ae0d4f40af0d4f40b00d4f40b10d4f40b20d4f40b3124f40b4124f40b5124f40b6124f40b7"+
    "0d4f40b80d4f40b90d4f40ba0d4f40bb0d4f40bc0d4f40bd0d4f40be0d5040420d5040431250404412504045125040461250404712504048125040491250404a1250404b1250404c1250404d1250404e1250404f125040501250405112504052125040531250405412504055125040561250405712504058125040591250405a1250405b1250405c1250405d1250405e1250405f125040601250406112504062125040631250406412504065125040661250406712504068125040691250406a1250406b1250406c"+
    "1250406d1250406e1b5040791250408412504085125040861250408712504088125040891c5040921b5040951b5040961b5040971b5040981b5040991250409d1250409e0d50409f0d5040a00d5040a10d5040a20d5040a30d5040a40d5040a50d5040a60d5040a70d5040a80d5040a90d5040aa0d5040ab0d5040ac0d5040ad0d5040ae0d5040af0d5040b00d5040b10d5040b20d5040b30d5040b40d5040b50d5040b60d5040b70d5040b80d5040b90d5040ba0d5040bb0d5040bc0d5040bd125040be0d514042"+
    "0d5140430d5140440d5140450d5140460d5140470d5140480d5140490d51404a0d51404b0d51404c0d51404d0d51404e0d51404f0d5140501251405112514052125140531251405412514055125140561251405712514058125140591251405a1251405b1251405c1251405d1251405e1251405f125140601251406112514062125140631251406412514065125140661251406712514068125140691251406a1251406b1251406c1251406d1251406e1251406f1251407012514071125140721251407312514074"+
    "125140751251407612514077125140781c5140831b5140841c51408a1251408e1251408f12514090125140910d5140a80d5140a90d5140aa0d5140ab0d5140ac0d5140ad0d5140ae0d5140af0d5140b00d5140b10d5140b20d5140b30d5140b40d5140b50d5140b60d5140b70d5140b80d5140b90d5140ba0d5140bb0d5140bc0d5140bd0d5140be0d5240420d5240430d5240440d5240450d5240460d5240470d5240480d5240490d52404a0d52404b0d52404c0d52404d0d52404e0d52404f0d5240500d524051"+
    "0d5240520d5240530d5240540d5240550d5240560d5240570d5240580d5240590d52405a0d52405b0d52405c1252405d1252405e1252405f125240601252406112524062125240631252406412524065125240661252406712524068125240691252406a1252406b1252406c1252406d1252406e1252406f125240701252407112524072125240731252407412524075125240761252407712524078125240791252407a1252407b1252407c1252407d1252407e1252407f1252408012524081125240821b52408d"+
    "1252409812524099125240b20d5240b30d5240b40d5240b50d5240b60d5240b70d5240b80d5240b90d5240ba0d5240bb0d5240bc0d5240bd0d5240be0d5340420d5340430d5340440d5340450d5340460d5340470d5340480d5340490d53404a0d53404b0d53404c0d53404d0d53404e0d53404f0d5340500d5340510d5340520d5340530d5340540d5340550d5340560d5340570d5340580d5340590d53405a0d53405b0d53405c0d53405d0d53405e0d53405f0d5340600d5340610d5340620d5340630d534064"+
    "0d5340650d5340660d5340670d5340680d5340691253406a1253406b1253406c1253406d1253406e1253406f125340701253407112534072125340731253407412534075125340761253407712534078125340791253407a1253407b1253407c1253407d1253407e1253407f125340801253408112534082125340831253408412534085125340861253408712534088125340891253408a1253408b1253408c1253408d125340a2325340a6125340bc0d5340bd0d5340be0d5440420d5440430d5440440d544045"+
    "0d5440460d5440470d5440480d5440490d54404a0d54404b0d54404c0d54404d0d54404e0d54404f0d5440500d5440510d5440520d5440530d5440540d5440550d5440560d5440570d5440580d5440590d54405a0d54405b0d54405c0d54405d0d54405e0d54405f0d5440600d5440610d5440620d5440630d5440640d5440650d5440660d5440670d5440680d5440690d54406a0d54406b0d54406c0d54406d0d54406e0d54406f0d5440700d5440710d5440720d5440730d5440740d5440750d54407612544077"+
    "12544078125440791254407a1254407b1254407c1254407d1254407e1254407f125440801254408112544082125440831254408412544085125440861254408712544088125440891254408a1254408b1254408c1254408d1254408e1254408f12544090125440911254409212544093125440941254409512544096125440971c5440a9325440aa325440ab325440b012554048125540490d55404a0d55404b0d55404c0d55404d0d55404e0d55404f0d5540500d5540510d5540520d5540530d5540540d554055"+
    "0d5540560d5540570d5540580d5540590d55405a0d55405b0d55405c0d55405d0d55405e0d55405f0d5540600d5540610d5540620d5540630d5540640d5540650d5540660d5540670d5540680d5540690d55406a0d55406b0d55406c0d55406d0d55406e0d55406f0d5540700d5540710d5540720d5540730d5540740d5540750d5540760d5540770d5540780d5540790d55407a0d55407b0d55407c0d55407d0d55407e0d55407f0d5540800d5540810d5540820d55408312554084125540851255408612554087"+
    "12554088125540891255408a1255408b1255408c1255408d1255408e1255408f125540901255409112554092125540931255409412554095125540961255409712554098125540991255409a1255409b1255409c1255409d1255409e1255409f125540a0125540a1125540a2325540b50d5640530d5640540d5640550d5640560d5640570d5640580d5640590d56405a0d56405b0d56405c0d56405d0d56405e0d56405f0d5640600d5640610d5640620d5640630d5640640d5640650d5640660d5640670d564068"+
    "0d5640690d56406a0d56406b0d56406c0d56406d0d56406e0d56406f0d5640700d5640710d5640720d5640730d5640740d5640750d5640760d5640770d5640780d5640790d56407a0d56407b0d56407c0d56407d0d56407e0d56407f0d5640800d5640810d5640820d5640830d5640840d5640850d5640860d5640870d5640880d5640890d56408a0d56408b0d56408c0d56408d0d56408e0d56408f0d5640901256409112564092125640931256409412564095125640961256409712564098125640991256409a"+
    "1256409b1256409c1256409d1256409e1256409f125640a0125640a1125640a2125640a3125640a4125640a5125640a6125640a7125640a8125640a9125640aa125640ab125640ac1b5640b63257404232574044325740451b5740471b5740481b5740491b57404a1257405c0d57405d0d57405e0d57405f0d5740600d5740610d5740620d5740630d5740640d5740650d5740660d5740670d5740680d5740690d57406a0d57406b0d57406c0d57406d0d57406e0d57406f0d5740700d5740710d5740720d574073"+
    "0d5740740d5740750d5740760d5740770d5740780d5740790d57407a0d57407b0d57407c0d57407d0d57407e0d57407f0d5740800d5740810d5740820d5740830d5740840d5740850d5740860d5740870d5740880d5740890d57408a0d57408b0d57408c0d57408d0d57408e0d57408f0d5740900d5740910d5740920d5740930d5740940d5740950d5740960d5740970d5740980d5740990d57409a0d57409b0d57409c0d57409d1257409e1257409f125740a0125740a1125740a2125740a3125740a4125740a5"+
    "125740a6125740a7125740a8125740a9125740aa0d5740ab125740ac125740ad125740ae125740af125740b0125740b1125740b2125740b3125740b4125740b5125740b6125740b71b5840421c5840431b5840440358404b3258404d1b5840501b5840511b5840521b5840531b584054125840660d5840670d5840680d5840690d58406a0d58406b0d58406c0d58406d0d58406e0d58406f0d5840700d5840710d5840720d5840730d5840740d5840750d5840760d5840770d5840780d5840790d58407a0d58407b"+
    "0d58407c0d58407d0d58407e0d58407f0d5840800d5840810d5840820d5840830d5840840d5840850d5840860d5840870d5840880d5840890d58408a0d58408b0d58408c0d58408d0d58408e0d58408f0d5840900d5840910d5840920d5840930d5840940d5840950d5840960d5840970d5840980d5840990d58409a0d58409b0d58409c0d58409d0d58409e0d58409f0d5840a00d5840a10d5840a20d5840a30d5840a40d5840a50d5840a60d5840a70d5840a80d5840a9125840aa125840ab125840ac125840ad"+
    "125840ae125840af125840b0125840b1125840b2125840b3125840b4125840b5125840b6125840b7125840b8125840b9125840ba125840bb125840bc125840bd125840be1259404212594043125940441b59404d325940551c5940591b59405a1b59405b1c59405c1b59405d1b59405e1259406f0d5940700d5940710d5940720d5940730d5940740d5940750d5940760d5940770d5940780d5940790d59407a0d59407b0d59407c0d59407d0d59407e0d59407f0d5940800d5940810d5940820d5940830d594084"+
    "0d5940850d5940860d5940870d5940880d5940890d59408a0d59408b0d59408c0d59408d0d59408e0d59408f0d5940900d5940910d5940920d5940930d5940940d5940950d5940960d5940970d5940980d5940990d59409a0d59409b0d59409c0d59409d0d59409e0d59409f0d5940a00d5940a10d5940a20d5940a30d5940a40d5940a50d5940a60d5940a70d5940a80d5940a90d5940aa0d5940ab0d5940ac0d5940ad0d5940ae0d5940af0d5940b00d5940b10d5940b20d5940b30d5940b4125940b5125940b6"+
    "125940b7125940b8125940b9125940ba125940bb125940bc125940bd125940be125a4042125a4043125a4044125a4045125a4046125a4047125a4048125a4049125a404a125a404b125a404c125a404d125a404e1b5a40641b5a40651b5a40661b5a40671b5a4068325a4069125a4078125a4079125a407a0d5a407b0d5a407c0d5a407d0d5a407e0d5a407f0d5a40800d5a40810d5a40820d5a40830d5a40840d5a40850d5a40860d5a40870d5a40880d5a40890d5a408a0d5a408b0d5a408c0d5a408d0d5a408e"+
    "0d5a408f0d5a40900d5a40910d5a40920d5a40930d5a40940d5a40950d5a40960d5a40970d5a40980d5a40990d5a409a0d5a409b0d5a409c0d5a409d0d5a409e0d5a409f0d5a40a00d5a40a10d5a40a20d5a40a30d5a40a40d5a40a50d5a40a60d5a40a70d5a40a80d5a40a90d5a40aa0d5a40ab0d5a40ac0d5a40ad0d5a40ae0d5a40af0d5a40b00d5a40b10d5a40b20d5a40b30d5a40b40d5a40b50d5a40b60d5a40b70d5a40b80d5a40b90d5a40ba0d5a40bb0d5a40bc0d5a40bd0d5a40be0d5b4042125b4043"+
    "125b4044125b4045125b4046125b4047125b4048125b4049125b404a125b404b125b404c125b404d125b404e125b404f125b4050125b4051125b4052125b4053125b4054125b4055125b4056125b4057125b4058025b4063025b4064025b4065025b40661b5b406f1b5b40701b5b40711b5b4072125b4081125b4082125b4083125b40840d5b40850d5b40860d5b40870d5b40880d5b40890d5b408a0d5b408b0d5b408c0d5b408d0d5b408e0d5b408f0d5b40900d5b40910d5b40920d5b40930d5b40940d5b4095"+
    "0d5b40960d5b40970d5b40980d5b40990d5b409a0d5b409b0d5b409c0d5b409d0d5b409e0d5b409f0d5b40a00d5b40a10d5b40a20d5b40a30d5b40a40d5b40a50d5b40a60d5b40a70d5b40a80d5b40a90d5b40aa0d5b40ab0d5b40ac0d5b40ad0d5b40ae0d5b40af0d5b40b00d5b40b10d5b40b20d5b40b30d5b40b40d5b40b50d5b40b60d5b40b70d5b40b80d5b40b90d5b40ba0d5b40bb0d5b40bc0d5b40bd0d5b40be0d5c40420d5c40430d5c40440d5c40450d5c40460d5c40470d5c40480d5c40490d5c404a"+
    "0d5c404b0d5c404c125c404d125c404e125c404f125c4050125c4051125c4052125c4053125c4054125c4055125c4056125c4057125c4058125c4059125c405a125c405b125c405c125c405d125c405e125c405f125c4060125c4061125c4062125c4063025c406d025c406e025c406f025c4070025c4071325c4077125c4088125c4089125c408a125c408b125c408c125c408d125c408e125c408f0d5c40900d5c40910d5c40920d5c40930d5c40940d5c40950d5c40960d5c40970d5c40980d5c40990d5c409a"+
    "0d5c409b0d5c409c0d5c409d0d5c409e0d5c409f0d5c40a00d5c40a10d5c40a20d5c40a30d5c40a40d5c40a50d5c40a60d5c40a70d5c40a80d5c40a90d5c40aa0d5c40ab0d5c40ac0d5c40ad0d5c40ae0d5c40af0d5c40b00d5c40b10d5c40b20d5c40b30d5c40b40d5c40b50d5c40b60d5c40b70d5c40b80d5c40b90d5c40ba0d5c40bb0d5c40bc0d5c40bd0d5c40be0d5d40420d5d40430d5d40440d5d40450d5d40460d5d40470d5d40480d5d40490d5d404a0d5d404b0d5d404c0d5d404d0d5d404e0d5d404f"+
    "0d5d40500d5d40510d5d40520d5d40530d5d40540d5d40550d5d4056125d4057125d4058125d4059125d405a125d405b125d405c125d405d125d405e125d405f125d4060125d4061125d4062125d4063125d4064125d4065125d4066125d4067125d4068125d4069125d406a125d406b125d406c125d406d025d4077025d4078035d4079025d407a025d407b035d407d125d408f125d4090125d4091125d4092125d4093125d4094125d4095125d4096125d4097125d4098125d4099125d409a0d5d409b0d5d409c"+
    "0d5d409d0d5d409e0d5d409f0d5d40a00d5d40a10d5d40a20d5d40a30d5d40a40d5d40a50d5d40a60d5d40a70d5d40a80d5d40a90d5d40aa0d5d40ab0d5d40ac0d5d40ad0d5d40ae0d5d40af0d5d40b00d5d40b10d5d40b20d5d40b30d5d40b40d5d40b50d5d40b60d5d40b70d5d40b80d5d40bb0d5d40bc0d5d40bd0d5d40be0d5e40420d5e40430d5e40440d5e40450d5e40460d5e40470d5e40480d5e40490d5e404a0d5e404b0d5e404c0d5e404d0d5e404e0d5e404f0d5e40500d5e40510d5e40520d5e4053"+
    "0d5e40540d5e40550d5e40560d5e40570d5e40580d5e40590d5e405a0d5e405b0d5e405c0d5e405d0d5e405e0d5e405f0d5e40600d5e4061125e4062125e4063125e4064125e4065125e4066125e4067125e4068125e4069125e406a125e406b125e406c125e406d125e406e125e406f125e4070125e4071125e4072125e4073125e4074125e4075125e4076125e4077025e4081025e4082025e4083025e4084025e4085125e4098125e4099125e409a125e409b125e409c125e409d125e409e0d5e409f125e40a0"+
    "125e40a1125e40a50d5e40a6125e40a70d5e40a80d5e40a9125e40aa0d5e40ab125e40ac0d5e40ad0d5e40ae0d5e40af0d5e40b00d5e40b10d5e40b20d5e40b30d5e40b40d5e40b50d5e40b60d5e40b70d5e40b80d5e40b90d5e40ba0d5e40bb0d5e40bc0d5e40bd0d5e40be0d5f40420d5f40430d5f40440d5f40450d5f40470d5f40480d5f40490d5f404a0d5f404b0d5f404c0d5f404d0d5f404e0d5f404f0d5f40500d5f40510d5f40520d5f40530d5f40540d5f40550d5f40560d5f40570d5f40580d5f4059"+
    "0d5f405a0d5f405b0d5f405c0d5f405d0d5f405e0d5f405f0d5f40600d5f40610d5f40620d5f40630d5f40640d5f40650d5f40660d5f40670d5f40680d5f40690d5f406a0d5f406b125f406c125f406d125f406e125f406f125f4070125f4071125f4072125f4073125f4074125f4075125f4076125f4077125f4078125f4079125f407a125f407b125f407c125f407d125f407e125f407f125f4080025f408a025f408b025f408c025f408d025f408e1b5f408f1b5f4090125f40a2125f40a3125f40a4125f40a5"+
    "125f40a6125f40a7195f40aa085f40ab195f40ac195f40ad195f40b0195f40b1195f40b2195f40b5195f40b70d5f40b90d5f40bb125f40bc0d5f40bd0d5f40be0d6040420d6040430d6040440d6040450d6040460d6040470d6040480d6040490d60404a0d60404b0d60404c0d60404d0d60404e0d60404f0d6040500d6040510d6040520d6040530d6040540d6040550d6040560d6040570d6040580d6040590d60405a0d60405b0d60405c0d60405d0d60405e0d60405f0d6040600d6040610d6040620d604063"+
    "0d6040640d6040650d6040660d6040670d6040680d6040690d60406a0d60406b0d60406c0d60406d0d60406e0d60406f0d6040700d6040710d6040720d6040730d6040740d6040750d6040761260407712604078126040791260407a1260407b1260407c1260407d1260407e1260407f126040801260408112604082126040831260408412604085126040861260408712604088126040891260408a0260409302604094026040951b6040971b6040981b6040991b60409a1b60409b126040ac126040ad126040ae"+
    "126040af126040b0196040b2196040b6086040b8196040b9196040ba196040bc086040bd196040be0861404219614045086140460d61404a0d61404b0d61404c0d61404d0d61404e0d61404f0d6140500d6140510d6140520d6140530d6140540d6140550d6140570d6140590d61405a0d61405b0d61405c0d61405d0d61405e0d61405f0d6140600d6140610d6140620d6140630d6140640d6140650d6140660d6140670d6140680d6140690d61406a0d61406b0d61406c0d61406d0d61406e0d61406f0d614070"+
    "0d6140710d6140720d6140730d6140740d6140750d6140760d6140770d6140780d6140790d61407a0d61407b0d61407c0d61407d0d61407e0d61407f0d6140801261408112614082126140831261408412614085126140861261408712614088126140891261408a1261408b1261408c1261408d1261408e1261408f12614090126140911261409212614093126140940261409e1b6140a11b6140a21c6140a31b6140a41b6140a5126140b7126140b8126140b9086140bc196140bd086240421962404319624044"+
    "086240451962404708624048196240491962404b0862404d0862404e0862404f1962405019624051196240530d6240550d6240560d6240570d6240580d6240590d62405a0d62405b0d62405c0d62405d0d62405e0d62405f0d6240600d6240610d6240620d6240630d6240640d6240650d6240660d6240670d6240680d6240690d62406a0d62406b0d62406c0d62406d0d62406e0d62406f0d6240700d6240710d6240720d6240730d6240740d6240750d6240760d6240770d6240780d6240790d62407a0d62407b"+
    "0d62407c0d62407d0d62407e0d62407f0d6240800d6240810d6240820d6240830d6240840d6240850d6240860d6240870d6240880d6240890d62408a1262408b1262408c1262408d1262408e1262408f126240901262409112624092126240931262409412624095126240961262409712624098126240991262409a1262409b1262409c1262409d1b6240ab1b6240ac1b6240ad1b6240ae1b6240af256240b9256240bd126340451263404619634047196340490863404a1963404b1963404c0863404d1963404f"+
    "086340501963405119634052196340591963405a1963405c0d63405f0d6340600d6340610d6340620d6340630d6340640d6340650d6340660d6340670d6340680d6340690d63406a0d63406b0d63406c0d63406d0d63406e0d63406f0d6340700d6340710d6340720d6340730d6340740d6340750d6340760d6340770d6340780d6340790d63407a0d63407b0d63407c0d63407d0d63407e0d63407f0d6340800d6340810d6340820d6340830d6340840d6340850d6340860d6340870d6340880d6340890d63408a"+
    "0d63408b0d63408c0d63408d0d63408e0d63408f0d6340900d6340910d6340920d6340931263409412634095126340961263409712634098126340991263409a1263409b1263409c1263409d1263409e1263409f126340a0126340a1126340a2126340a3126340a4126340a5126340a6126340a71b6340b51b6340b61b6340b71b6340b81b6340b9256440451c6440462e6440472e6440482e6440491c64404a2e64404b2e64404c2e64404d2e64404e2e64404f1c64405019644052086440531964405508644056"+
    "086440570e6440580e6440590e64405a0e64405b0e64405c0e64405d0e64405e0e64405f0e6440600e6440610e644062196440651964406619644068126440690d64406a0d64406b0d64406c0d64406d0d64406e0d64406f0d6440700d6440710d6440720d6440730d6440740d6440750d6440760d6440770d6440780d6440790d64407a0d64407b0d64407c0d64407d0d64407e0d64407f0d6440800d6440810d6440820d6440830d6440840d6440850d6440860d6440870d6440880d6440890d64408a0d64408b"+
    "0d64408c0d64408d0d64408e0d64408f0d6440900d6440910d6440920d6440930d6440940d6440950d6440960d6440970d6440980d6440990d64409a0d64409b0d64409c0d64409d1264409e1264409f126440a0126440a1126440a2126440a3126440a4126440a5126440a6126440a7126440a8126440a9126440aa126440ab126440ac126440ad126440ae126440af126440b02e654050156540521765405717654058176540592e65405a2d65405b1965405c2d65405d2d65405e0865405f086540600e654061"+
    "0e6540620e6540630e6540640e6540650e6540660e6540670e6540680e6540690e65406a0e65406b0e65406c0e65406d1965406f086540701965407108654072126540730d6540740d6540750d6540760d6540770d6540780d6540790d65407a0d65407b0d65407c0d65407d0d65407e0d65407f0d6540800d6540810d6540820d6540830d6540840d6540850d6540860d6540870d6540880d6540890d65408a0d65408b0d65408c0d65408d0d65408e0d65408f0d6540900d6540910d6540920d6540930d654094"+
    "0d6540950d6540960d6540970d6540980d6540990d65409a0d65409b0d65409c0d65409d0d65409e0d65409f0d6540a00d6540a10d6540a20d6540a30d6540a40d6540a50d6540a60d6540a7126540a8126540a9126540aa126540ab126540ac126540ad126540ae126540af126540b0126540b1126540b2126540b3126540b4126540b5126540b6126540b7126540b8126540b92e66405a1766406117664062176640632e664064236640652d6640662366406723664068126640691266406a0e66406b0e66406c"+
    "0b66406d0e66406e0e66406f0e6640700e6640710e6640720e6640730e6640740e6640750e6640760e66407708664078086640791966407a1266407e0d66407f0d6640800d6640810d6640820d6640830d6640840d6640850d6640860d6640870d6640880d6640890d66408a0d66408b0d66408c0d66408d0d66408e0d66408f0d6640900d6640910d6640920d6640930d6640940d6640950d6640960d6640970d6640980d6640990d66409a0d66409b0d66409c0d66409d0d66409e0d66409f0d6640a00d6640a1"+
    "0d6640a20d6640a30d6640a40d6640a50d6640a60d6640a70d6640a80d6640a90d6640aa0d6640ab0d6640ac0d6640ad0d6640ae0d6640af0d6640b0126640b1126640b2126640b3126640b4126640b5126640b6126640b7126640b8126640b9126640ba126640bb126640bc126640bd126640be126740421267404312674044126740451b6740552e6740641767406b1767406c1767406d2e67406e23674070096740711b674073126740740e6740750e6740760e6740770e6740780e6740790e67407a0e67407b"+
    "0e67407c2867407d0e67407e0e67407f0e6740800e6740810e6740821967408319674084196740851967408612674088126740890d67408a0d67408b0d67408c0d67408d0d67408e0d67408f0d6740900d6740910d6740920d6740930d6740940d6740950d6740960d67409712674098126740991267409a0d67409b0d67409c0d67409d0d67409e0d67409f0d6740a00d6740a10d6740a20d6740a30d6740a40d6740a50d6740a60d6740a70d6740a80d6740a90d6740aa0d6740ab0d6740ac0d6740ad0d6740ae"+
    "0d6740af0d6740b00d6740b10d6740b20d6740b30d6740b40d6740b50d6740b60d6740b70d6740b80d6740b9126740ba126740bb126740bc126740bd126740be12684042126840431268404412684045126840461268404712684048126840491268404a1268404b1268404c1268404d1b68405b1b68405e1b68405f1b6840602568406d1c68406e1d68406f1d6840701d6840711c6840722e6840781268407e1268407f0e6840800e6840810e684082286840830e6840840e6840850e6840860e6840870e684088"+
    "0e6840890e68408a0e68408b0e68408c1968408d0868408e086840900868409112684093126840940d684095126840960d6840970d6840980d6840990d68409a0d68409b0868409c0868409d0868409e0868409f0d6840a0126840a2126840a3126840a4126840a5126840a6126840a70d6840a8126840a90d6840aa0d6840ab0d6840ac0d6840ad0d6840ae0d6840af0d6840b00d6840b10d6840b20d6840b30d6840b40d6840b50d6840b60d6840b70d6840b80d6840b90d6840ba0d6840bb0d6840bc0d6840bd"+
    "0d6840be0d6940420d694043126940440d6940451269404619694048196940491969404a0d69404b1269404c1269404d1269404e1269404f126940501269405112694052126940531269405412694055126940561b6940651b6940661b6940692e694078146940791469407a1469407b2069407f24694082126940880e6940890e69408a0e69408b0e69408c0e69408d0e69408e0e69408f0e6940900e6940910e6940920e6940930e6940940e6940950e69409619694098196940990869409a1969409b1969409c"+
    "1269409f196940a2086940a3196940a4196940a5086940a6086940a7086940a8086940a9086940aa086940ab196940ae196940af0d6940b50d6940b60d6940b70d6940b80d6940b90d6940ba0d6940bb0d6940bc0d6940bd0d6940be0d6a40420d6a4043126a40440d6a40450d6a4046126a40470d6a40480d6a4049126a404a126a404b0d6a404c126a404d196a404f196a4050196a4053086a4055196a4057126a4058126a4059126a405a126a405b126a405c126a405d126a405e1b6a406f026a4074026a4075"+
    "2e6a4082146a4083146a4084206a4089206a408a246a408c1b6a4091126a40920e6a40930e6a40940e6a40950e6a40960e6a40970e6a40980e6a40990e6a409a0e6a409b0e6a409c0e6a409d0e6a409e0e6a409f0e6a40a0196a40a2086a40a3196a40a5196a40a6196a40a7196a40a9086a40ac196a40ad086a40ae086a40b2086a40b3086a40b9196a40ba086a40bb0d6b40420d6b40430d6b40440d6b40450d6b40460d6b40470d6b40480d6b40490d6b404a0d6b404b0d6b404c0d6b404d0d6b404e0d6b404f"+
    "196b4053196b4055196b4057196b4058196b405a196b405c086b405e196b405f086b4062196b4064026b407e036b407f026b40802e6b408c146b408d146b408e146b408f206b4092206b4093206b4094206b40952e6b4096126b409b126b409c0e6b409d0e6b409e286b409f0e6b40a00e6b40a10e6b40a20e6b40a30b6b40a40e6b40a50e6b40a6286b40a70e6b40a80e6b40a90e6b40aa0e6b40ab196b40ac196b40ae196b40b1086b40b3196b40b4196b40b5086b40b6086b40b7196b40b8196c4043086c4047"+
    "196c4049086c404a0d6c404c0d6c404d0d6c404e0d6c404f086c40500d6c40510d6c40520d6c40530d6c40540d6c40550d6c40560d6c40570d6c40580d6c4059086c405a086c405b196c405d196c405f086c4062086c4063086c4066086c4067196c4068196c4069086c406a196c406b196c406e196c4070196c4071026c4088026c40891c6c40962e6c40972e6c40982e6c40992e6c409a2e6c409b2e6c409c2e6c409d2e6c409e2e6c409f1c6c40a01b6c40a5126c40a60e6c40a70e6c40a80e6c40a90e6c40aa"+
    "0e6c40ab0e6c40ac0e6c40ad0e6c40ae0e6c40af0e6c40b00e6c40b10e6c40b20e6c40b30e6c40b40e6c40b5086c40b6196c40b7196c40b9086c40ba086c40bb196c40bc086c40bd196c40be086d4042196d4043196d4044196d4046196d4047196d4048196d404a196d404b196d404e196d4052086d40530d6d40550d6d40560d6d40570d6d40580d6d40590d6d405a0d6d405b0d6d405c0d6d405d0d6d405e0d6d405f0d6d40600d6d40610d6d40620d6d40630d6d4064196d4066086d4068086d4069196d406b"+
    "086d406e086d406f196d4070196d4073196d4074196d407b1b6d40a90e6d40b00e6d40b10e6d40b20e6d40b30e6d40b40e6d40b50e6d40b60e6d40b70e6d40b80e6d40b90e6d40ba0e6d40bb0e6d40bc0e6d40bd0e6d40be0e6e40420e6e40430e6e4044086e4045126e40470d6e4048196e404a086e404b126e404d126e404e086e4050196e4051086e4052196e4055086e4057086e4058196e405c0d6e405d0d6e405e0d6e405f0d6e4060196e40610d6e40620d6e40630d6e40640d6e40650d6e40660d6e4067"+
    "0d6e40680d6e40690d6e406a0d6e406b0d6e406c0d6e406d196e406e086e4070196e4072196e4073196e4074126e4078126e4079126e407a0d6e407b126e407c126e407d0d6e407e126e407f0d6e4080126e4081126e40850e6e40bb0e6e40bc0e6e40bd0e6e40be0e6f40420e6f40430e6f40440e6f40450e6f40460e6f40470e6f40480e6f40490e6f404a0e6f404b0e6f404c0e6f404d0e6f404e0e6f404f126f4050126f4051126f4052126f4053126f4054126f4055126f4056126f4057126f4058126f4059"+
    "196f405a196f405c086f4060126f4061126f40620d6f4063126f4064126f40650d6f40660d6f40670d6f40680d6f40690d6f406a0d6f406b0d6f406c0d6f406d0d6f406e0d6f406f0d6f40700d6f40710d6f40720d6f40730d6f40740d6f4075126f4076126f4077126f4078126f4079196f407a196f407b196f407c0d6f407f126f4080126f40810d6f40820e6f40830d6f40840d6f40850e6f40860d6f40870d6f4088126f4089126f408a126f408b126f408c126f408d126f408e1b7040470e7040480e704049"+
    "0e70404a0e70404b2870404c0e70404d0e70404e0e70404f0e7040500e7040510e7040520e7040530e704054287040550e7040560e70405712704058127040591270405a1270405b1270405c1270405d1270405e1270405f0d7040601270406112704062127040630d70406419704066087040671270406a0d70406b0d70406c0d70406d0d70406e0d70406f0d7040700d7040710d7040720d7040730d7040740d7040750d7040760d7040770d7040780d7040790d70407a0d70407b0d70407c0d70407d0d70407e"+
    "0d70407f0d7040801270408112704082127040830d70408412704085127040860d70408712704088127040890d70408a0d70408b2870408c1270408d1270408e1270408f12704090127040910d7040920e704093127040940d704095127040961270409712704098257140501b7140520e7140530e7140540e7140550e7140560e7140570e7140580e7140592871405a0e71405b0e71405c0b71405d0e71405e0e71405f0e7140600e7140611271406212714063127140641271406512714066127140670e714068"+
    "0d7140691271406a0d71406b0d71406c1271406d1271406e1971406f19714071127140740d7140750d7140760d7140770d7140780d7140790d71407a0d71407b0d71407c0d71407d0d71407e0d71407f0d7140800d7140810d7140820d7140830d7140840d7140850d7140860d7140870d7140880d7140890d71408a1271408b1271408c1271408d0e71408e0d71408f127140900e714091127140920d7140930e7140940d714095127140961271409712714098127140991271409a1271409b0d71409c0d71409d"+
    "1271409e0e71409f127140a0127140a1127140a21b72405c0e72405d0e72405e0e72405f0e7240600e7240610e7240620e7240630e7240640e7240650e7240660e7240670e7240680e7240690e72406a0e72406b1272406c1272406d1272406e1272406f0e7240700d7240710d72407212724073127240740d72407512724076127240770d724078197240791972407b1972407c0872407d0d72407e0d72407f0d7240800d7240810d7240820d7240830d7240840d7240850d7240860d7240870d7240880d724089"+
    "0d72408a0d72408b0d72408c0d72408d0d72408e0d72408f0d7240900d7240910d7240920d7240930d7240941272409512724096127240970d724098127240991272409a1272409b1272409c1272409d1272409e1272409f127240a00d7240a10e7240a2127240a3127240a4127240a50d7240a6127240a70d7240a8127240a9127240aa127240ab1b7340421b7340660e7340670e7340680e7340690e73406a0e73406b0e73406c0e73406d0e73406e0e73406f0e7340700e7340710e7340720e73407312734074"+
    "12734075127340761273407712734078127340791273407a1273407b0d73407c1273407d2873407e1273407f127340800e734081127340820d73408308734085197340870d7340880d7340890d73408a0d73408b0d73408c0d73408d0d73408e0d73408f0d7340900d7340910d7340920d7340930d7340940d7340950d7340960d7340970d7340980d7340990d73409a0d73409b0d73409c0d73409d0d73409e1273409f127340a00d7340a1127340a2287340a3127340a4127340a50d7340a60e7340a70d7340a8"+
    "127340a90d7340aa0d7340ab127340ac0d7340ad127340ae287340af127340b0127340b10e7340b20d7340b3127340b4127340b51c74404c1c74404d0e7440710e744072287440730e7440740e7440750e7440760e7440770e7440780e7440790e74407a0e74407b0e74407c1274407d1274407e1274407f12744080127440811274408212744083127440840d744085127440861274408712744088127440891274408a0d74408b1274408c1274408d0874409008744091127440920d7440930d7440940d744095"+
    "0d7440960d7440970d7440980d7440990d74409a0d74409b0d74409c0d74409d0d74409e0d74409f0d7440a00d7440a10d7440a20d7440a30d7440a40d7440a50d7440a60d7440a70d7440a8127440a90d7440aa0e7440ab127440ac127440ad127440ae0d7440af0d7440b00d7440b1127440b2287440b3127440b40e7440b5127440b6127440b7127440b8127440b9127440ba127440bb127440bc127440bd0d7440be127540421b7540561b7540572a75406b2875406c2a75406d0e75407c0e75407d0e75407e"+
    "0e75407f0e7540800e7540810e7540820e754083287540840e7540850e7540860e75408712754088127540891275408a0e75408b0d75408c2875408d0d75408e0d75408f0e7540900d7540911275409212754093127540940e754095127540960d754097197540981975409b1275409c0d75409d0d75409e0d75409f0d7540a00d7540a10d7540a20d7540a30d7540a40d7540a50d7540a60d7540a70d7540a80d7540a90d7540aa0d7540ab0d7540ac0d7540ad0d7540ae0d7540af0d7540b00d7540b10d7540b2"+
    "127540b3127540b4127540b5127540b60d7540b7127540b80e7540b90d7540ba127540bb0d7540bc0d7540bd127540be127640420d7640430d7640440d7640450d764046127640470d764048127640491276404a1276404b1276404c1b7640601b7640612a764075287640762a7640770e7640860e7640870e7640880e7640892876408a0e76408b0e76408c0e76408d0e76408e0e76408f0e7640901276409112764092127640931276409412764095127640961276409712764098127640990d76409a0d76409b"+
    "0d76409c1276409d1276409e0d76409f127640a0087640a40d7640a60d7640a70d7640a80d7640a90d7640aa0d7640ab0d7640ac0d7640ad0d7640ae0d7640af0d7640b00d7640b10d7640b20d7640b30d7640b40d7640b50d7640b60d7640b70d7640b80d7640b90d7640ba0d7640bb0d7640bc127640bd127640be12774042127740430e7740440d77404512774046127740470d7740480e7740491277404a1277404b0d77404c0e77404d1277404e0d77404f0e774050127740510d7740520e7740530d774054"+
    "127740551b7740561b77406a2a77407f287740802a7740810e7740910e7740920e7740930e7740940e7740950e7740960e7740970e7740980e7740991277409a1277409b1277409c1277409d0d77409e1277409f127740a0127740a1127740a20d7740a30d7740a4127740a50e7740a6127740a7127740a80d7740a9127740aa087740ac087740ad127740af0d7740b00d7740b10d7740b20d7740b30d7740b40d7740b50d7740b60d7740b70d7740b80d7740b90d7740ba0d7740bb0d7740bc0d7740bd0d7740be"+
    "0d7840420d7840430d7840440d7840450d7840460d7840470d784048127840491278404a1278404b0d78404c0d78404d0d78404e1278404f0d7840500d7840511278405212784053127840540d784055127840560d78405712784058127840591278405a1278405b1278405c1278405d1278405e1b78405f2a7840892878408a2a78408b1b78409a0e78409c0e78409d0e78409e0e78409f0e7840a00e7840a1127840a2127840a3127840a4127840a5127840a6127840a70d7840a8127840a90e7840aa0d7840ab"+
    "127840ac0e7840ad127840ae127840af127840b00d7840b1127840b2127840b30d7840b4197840b6197840b7197840b80d7840b90d7840ba0d7840bb0d7840bc0d7840bd0d7840be0d7940420d7940430d7940440d7940450d7940460d7940470d7940480d7940490d79404a0d79404b0d79404c0d79404d0d79404e0d79404f0d7940500d7940510d7940521279405312794054127940550e79405612794057127940580e7940591279405a0e79405b1279405c1279405d1279405e1279405f127940600d794061"+
    "127940621279406312794064127940651279406612794067127940682a794093287940942a7940950e7940a60e7940a70e7940a80e7940a9127940aa127940ab127940ac127940ad127940ae127940af0d7940b00e7940b1127940b20d7940b3127940b4127940b50d7940b60d7940b7127940b80d7940b9287940ba0d7940bb0d7940bc0d7940bd127940be197a4043127a40460d7a40470d7a40480d7a40490d7a404a0d7a404b0d7a404c0d7a404d0d7a404e0d7a404f0d7a40500d7a40510d7a40520d7a4053"+
    "0d7a40540d7a40550d7a40560d7a40570d7a40580d7a40590d7a405a0d7a405b0d7a405c127a405d127a405e127a405f127a4060127a4061127a40620d7a4063127a4064127a4065127a4066127a40671b7a40681b7a406a127a406c1b7a406d127a406f1b7a4070127a40711b7a40722a7a409d287a409e2a7a409f1b7a40b00e7a40b1127a40b2127a40b3127a40b4127a40b5127a40b6127a40b7127a40b80d7a40b9127a40ba127a40bb127a40bc127a40bd127a40be127b40420d7b4043127b4044127b4045"+
    "127b40460d7b4047127b4048127b4049127b404a127b404b087b404c197b404f0d7b40500d7b40510d7b40520d7b40530d7b40540d7b40550d7b40560d7b40570d7b40580d7b40590d7b405a0d7b405b0d7b405c0d7b405d0d7b405e0d7b405f0d7b40600d7b40610d7b40620d7b40630d7b40640d7b40650d7b4066127b4067127b4068127b4069127b406a287b406b127b406c127b406d0d7b406e127b406f1b7b40702a7b40a7287b40a82a7b40a91b7b40bb1b7b40bc127b40bd127b40be127c4042127c4043"+
    "0d7c40440e7c4045127c40460d7c4047127c4048127c4049127c404a287c404b127c404c127c404d127c404e0d7c404f0e7c4050127c40510d7c4052127c4053127c4054127c4055197c4057087c40580d7c405a0d7c405b0d7c405c0d7c405d0d7c405e0d7c405f0d7c40600d7c40610d7c40620d7c40630d7c40640d7c40650d7c40660d7c40670d7c40680d7c40690d7c406a0d7c406b0d7c406c0d7c406d0d7c406e0d7c406f0d7c4070127c4071127c40720e7c4073127c40740d7c4075127c4076127c4077"+
    "127c4078127c40792a7c40b1287c40b22a7c40b31b7d4049127d404b0d7d404c0d7d404d127d404e127d404f287d40500d7d4051127d40520d7d4053127d4054127d40550d7d4056127d4057127d4058127d4059127d405a0d7d405b127d405c127d405d127d405e127d405f197d40600d7d40610d7d40620d7d40630d7d40640d7d40650d7d40660d7d40670d7d40680d7d40690d7d406a0d7d406b0d7d406c0d7d406d0d7d406e0d7d406f0d7d40700d7d40710d7d40720d7d40730d7d40740d7d40750d7d4076"+
    "0d7d40770d7d40780d7d40790d7d407a127d407b127d407c0d7d407d127d407e127d407f127d4080127d40811b7d40822a7d40bb287d40bc2a7d40bd127e4055127e40560e7e4057127e4058127e4059127e405a127e405b127e405c0e7e405d127e405e0d7e405f127e40600e7e4061127e4062127e4063127e40640d7e40650e7e4066127e4067127e4068127e40690d7e406a0d7e406b0d7e406c0d7e406d0d7e406e0d7e406f0d7e40700d7e40710d7e40720d7e40730d7e40740d7e40750d7e40760d7e4077"+
    "0d7e40780d7e40790d7e407a0d7e407b0d7e407c0d7e407d0d7e407e0d7e407f0d7e40800d7e40810d7e40820d7e40830d7e4084127e4085127e4086127e40870d7e40880e7e4089127e408a127e408b2a7f4048287f40492a7f404a1b7f405f127f40600d7f40610d7f4062127f40630e7f4064127f4065127f4066127f4067127f4068127f40690d7f406a0d7f406b127f406c127f406d287f406e127f406f127f4070127f4071127f4072127f40730d7f40740d7f40750d7f40760d7f40770d7f40780d7f4079"+
    "0d7f407a0d7f407b0d7f407c0d7f407d0d7f407e0d7f407f0d7f40800d7f40810d7f40820d7f40830d7f40840d7f40850d7f40860d7f40870d7f40880d7f40890d7f408a0d7f408b0d7f408c0d7f408d127f408e127f408f127f4090127f4091127f4092127f4093127f40941b7f40952a804052288040532a8040541b8040691280406b0d80406c1280406d0d80406e0d80406f0d8040701280407112804072128040730e8040741280407512804076128040770d804078128040791280407a1280407b1280407c"+
    "1280407d0d80407e0d80407f0d8040800d8040810d8040820d8040830d8040840d8040850d8040860d8040870d8040880d8040890d80408a0d80408b0d80408c0d80408d0d80408e0d80408f0d8040900d8040910d8040920d8040930d8040940d8040950d8040960d80409712804098128040991280409a1280409b1280409c1280409d1280409e1b80409f1b81407612814077128140780d8140790d81407a1281407b2881407c1281407d0d81407e1281407f128140800d814081128140820e8140830d814084"+
    "1281408512814086128140870d8140880d8140890d81408a0d81408b0d81408c0d81408d0d81408e0d81408f0d8140900d8140910d8140920d8140930d8140940d8140950d8140960d8140970d8140980d8140990d81409a0d81409b0d81409c0d81409d0d81409e0d81409f0d8140a00d8140a1128140a2128140a3128140a4128140a5128140a61b8140a71b82408112824082128240830e824084128240851282408612824087128240880e8240890d82408a1282408b1282408c1282408d0d82408e1282408f"+
    "12824090128240910d8240920d8240930d8240940d8240950d8240960d8240970d8240980d8240990d82409a0d82409b0d82409c0d82409d0d82409e0d82409f0d8240a00d8240a10d8240a20d8240a30d8240a40d8240a50d8240a60d8240a70d8240a80d8240a90d8240aa128240ab128240ac128240ad128240ae128240af1b8240b01283408d1283408e1283408f12834090128340910d8340921c8340931283409412834095128340960d8340970d834098128340991283409a0d83409b0d83409c0d83409d"+
    "0d83409e0d83409f0d8340a00d8340a10d8340a20d8340a30d8340a40d8340a50d8340a60d8340a70d8340a80d8340a90d8340aa0d8340ab128340ac128340ad0d8340ae0d8340af0d8340b0128340b1128340b20d8340b3128340b4128340b51b8340b82a8440911c8440931c8440941c8440951c8440961c8440971c8440981c8440991c84409a1c84409b1c84409c1c84409e1c84409f1c8440a0128440a1128440a2128440a30d8440a40d8440a50d8440a60d8440a70d8440a80d8440a90d8440aa0d8440ab"+
    "0d8440ac0d8440ad0d8440ae0d8440af0d8440b00d8440b10d8440b20d8440b3128440b5128440b6128440b8128440b9128440bc0a8540a91c8540ab128540ac0d8540ad0d8540ae0d8540af0d8540b00d8540b10d8540b20d8540b30d8540b40d8540b50d8540b60d8540b70d8540b80d8540b90d8540ba0d8540bb128540bc128540bd1b8640421c8640b60d8640b70d8640b80d8640b90d8640ba0d8640bb0d8640bc0d8640bd0d8640be0d8740420d8740430d8740440d8740450d8740460d8740470d874048"+
    "128740491b87404a1b87404b0a87404f25874060238740be238840421c8840430d8840440d8840450d8840460d8840470d8840480d8840490d88404a0d88404b0d88404c0d88404d0d88404e0d88404f0d884050198840522d884053098840542389404a1989404b1c89404c0d89404d0d89404e0d89404f0d8940500d8940510d8940520d8940530d8940540d8940550d8940560d8940570d8940580d8940590889405b2d89405c0989405d1c8a404d2a8a404e2a8a4050238a4053198a40540d8a40550d8a4056"+
    "0d8a40570d8a40580d8a40590d8a405a0d8a405b0d8a405c0d8a405d0d8a405e0d8a405f0d8a40600d8a40610d8a40620d8a4063088a4064238a40661c8b405b098b405c2d8b405d198b405e0d8b405f0d8b40600d8b40610d8b40620d8b40630d8b40640d8b40650d8b40660d8b40670d8b40680d8b40690d8b406a0d8b406b0d8b406c0d8b406d088b406e088b406f098b4070258b40811b8c40651c8c4066098c40670d8c406a0d8c406b0d8c406c0d8c406d0d8c406e0d8c406f0d8c40700d8c40710d8c4072"+
    "0d8c40730d8c40740d8c40750d8c4076198c4079098c407a268c408b1c8d40711c8d40721c8d40731c8d40740d8d40750d8d40760d8d40770d8d40780d8d40790d8d407a0d8d407b0d8d407c0d8d407d0d8d407e0d8d407f0d8d4080198d40822d8d4083238d40840a8d4095298d40b7298d40b8298d40b91b8e407d1c8e407e0d8e407f0d8e40800d8e40810d8e40820d8e40830d8e40840d8e40850d8e40860d8e40870d8e40880d8e40890d8e408a198e408b238e408d298f40441d8f4045298f40461b8f4088"+
    "1c8f40890d8f408a0d8f408b0d8f408c0d8f408d0d8f408e0d8f408f0d8f40900d8f40910d8f40920d8f40931c8f4094198f40952d8f4096238f40972990404e2790404f299040501c9040940d9040950d9040960d9040970d9040980d9040990d90409a0d90409b0d90409c1c90409d1b90409e2390409f29914058279140592991405a1b91409e1c91409f0d9140a00d9140a10d9140a20d9140a30d9140a41c9140a51c9140a61b9140a82e9140a92992406227924063299240641b9240a91c9240aa1c9240ab"+
    "1c9240ac1c9240ad1c9240ae1b9240b02993406c2793406d2993406e2993409a2993409b2993409c2993409d2993409e2993409f299340a0299340a1299340a2299340a3299340a41b9340b5299440762794407729944078299440a41c9440a51d9440a61d9440a71d9440a81d9440a91d9440aa1d9440ab1d9440ac1c9440ad299440ae2995408027954081299540822a9540ae1d9540af1d9540b72a9540b8259640482996408a2796408b2996408c119640b911974044299740941d974095299740962a984045"+
    "1d9840461d98404e2a98404f1698405c2998409e2998409f299840a02999404f1c9940501d9940511d9940521d9940531d9940541d9940551d9940561d9940571c99405829994059299a4059299a405a299a405b299a405c299a405d299a405e299a405f299a4060299a4061299a4062299a40632a9a40742a9a40752a9a40762a9a4077259a4080269a40810a9a4082299a40a3299a40a4299a40a5299a40a6299a40a7299a40a8299a40a9299a40aa2a9b407d2a9b4082299b40ad1d9b40ae279b40af279b40b0"+
    "279b40b1279b40b21d9b40b3299b40b42a9c40872a9c408c299c40b7299c40b8299c40b9299c40ba299c40bb299c40bc299c40bd299c40be2a9d40912a9d4096299e40852a9e409b2a9e40a0289f408f2a9f40a52a9f40aa28a040992aa040b02aa040b12aa040b22aa040b30aa040b926a040ba25a040bb28a140a328a240ad28a340b729a5404425a6406026a640610aa6406229a7408a29a7408b29a7409129a7409225a8408526a840860aa8408729a840941ca840951da840961da840971da840981da84099"+
    "1da8409a1ca8409b29a8409c29a9409e1da9409f1da940a529a940a62aaa409c29aa409d2aaa409e2aaa409f2aaa40a029aa40a12aaa40a22aaa40a32aaa40a429aa40a52aaa40a62aaa40a727aa40a81daa40a91daa40af29aa40b02aab409328ab409429ab409528ab409629ab409728ab40982aab409928ab40a61cab40a727ab40a828ab40a927ab40aa1cab40ab27ab40ac28ab40ad27ab40ae1cab40af27ab40b028ab40b127ab40b21cab40b31dab40b929ab40ba29ac408929ac408a2aac408b2aac408d"+
    "29ac408e29ac408f2aac409d28ac409e27ac409f27ac40a027ac40a128ac40a22aac40a327ac40b027ac40b127ac40b227ac40b327ac40b427ac40b527ac40b627ac40b727ac40b827ac40b927ac40ba27ac40bb27ac40bc27ac40bd1dad404629ad404729ad40931cad40941dad409511ad40961dad40971cad409829ad40992aad40a728ad40a827ad40a928ad40aa27ad40ab28ad40ac2aad40ad28ad40ba28ad40bb28ad40bc28ad40bd28ad40be28ae404228ae404328ae404428ae404528ae404628ae4047"+
    "28ae404829ae404927ae404a1dae405029ae405129ae409d1dae409e1dae40a229ae40a32aae40b11cae40b21cae40b62aae40b72aaf40472aaf40482aaf40492aaf404a2aaf404b2aaf404c2aaf404d2aaf404e2aaf404f2aaf40502aaf40512aaf405229af405327af40541daf405a29af405b29af40a71daf40a81daf40ac29af40ad1caf40bb25af40bc25b040431cb0404429b0405d27b0405e1db0406429b0406529b040b11db040b21db040b629b040b725b1404825b1404e29b140671cb140681db14069"+
    "1db1406a1db1406b1db1406c1db1406d1cb1406e29b1406f2ab140852ab140862ab140872ab140882ab140892ab1408a2ab1408b2ab1408c2ab1408d2ab1408e2ab1408f29b140bb1db140bc1db2404329b240442ab2404d2ab2404e2ab2404f2ab240502ab2405125b240521cb2405525b240582ab240592ab2405a2ab2405b2ab2405c2ab2405d29b2407129b2407229b2407829b2407928b2408f28b2409028b2409128b2409228b2409328b2409428b2409528b2409628b2409728b2409828b2409929b34048"+
    "1db340491db3404d29b3404e25b3405c25b340620ab3406a26b3406b25b3406c29b3408f29b3409029b3409129b3409229b3409329b3409429b3409529b3409629b340972ab340992ab3409a2ab3409b2ab3409c2ab3409d2ab3409e2ab3409f2ab340a02ab340a12ab340a22ab340a329b440521cb440531db4405411b440551db440561cb4405729b440581cb4406625b4406725b4406b1cb4406c29b440991db4409a27b4409b27b4409c27b4409d27b4409e27b4409f1db440a029b440a129b5405c29b5405d"+
    "2ab5405e2ab5406029b5406129b540621cb5407125b5407225b5407325b540741cb5407529b540a329b540a429b540a529b540a629b540a729b540a829b540a929b540aa29b540ab0fb740861cb740872fb7408804b840911b3d41471b3d41481b3d41491b3d414a1b3d414f1b3d41501b3d41511b3d4158123d4179123d417a0d3d417b123d417c123d417d123d417e123d417f123d4180123d4181123d4182123d4183123d4184123d4185123d41861b3e41501b3e41511b3e41521b3e41531b3e41541b3e4161"+
    "1c3e41621b3e4163123e41820d3e41830d3e41840d3e41850d3e41860d3e4187123e4188123e4189123e418a123e418b123e418c123e418d123e418e123e418f123e4190123e41911b3f415a1b3f415b1b3f415c1b3f415d1b3f415e1b3f416c1b3f416d123f418b0d3f418c0d3f418d0d3f418e0d3f418f0d3f41900d3f41910d3f4192123f4193123f4194123f4195123f4196123f4199123f419a123f419b123f419c1b4041641b4041651b4041661b4041671b4041680240416b0240416c1240419412404195"+
    "0d4041960d4041970d4041980d4041990d40419a0d40419b0d40419c1240419d1240419e1240419f124041a4124041a5124041a60241416f024141701b4141710241417503414176024141771b41418b1b41418c1b41418d1b4141901b4141911b4141921241419d1241419e0d41419f0d4141a00d4141a10d4141a20d4141a30d4141a40d4141a50d4141a60d4141a7124141a8124141a9194141ab124141ae124141af124141b002424178034241790242417a024241801c4241881b4241941b4241951b424196"+
    "1b4241971b4241981b4241991b42419a1b42419b1b42419c1b42419d124241a70d4241a80d4241a90d4241aa0d4241ab0d4241ac0d4241ad0d4241ae0d4241af0d4241b00d4241b1124241b2124241b3194241b6084241b7124241b9124241ba02434182024341831b43419e1b43419f1c4341a01b4341a11b4341a21b4341a31b4341a41b4341a51b4341a61b4341a7124341b00d4341b10d4341b20d4341b30d4341b40d4341b50d4341b60d4341b70d4341b80d4341b90d4341ba0d4341bb124341bc0d4341bd"+
    "084341be084441421944414408444145124441461c4441a31b4441a81b4441a91b4441aa1b4441ab1b4441ac1b4441ad1b4441ae1b4441af1b4441b01b4441b1124441b7124441b9124441ba0d4441bb0d4441bc0d4441bd0d4441be0d4541420d4541430d4541440d4541450d4541460d4541470d454148124541491245414a0845414b2d45414e0845414f1b4541501b4541991b45419a1c4541a91b4541b31b4541b41b4541b51b4541b81b4541b91b4541ba1246414212464143124641440d4641450d464146"+
    "0d4641470d4641480d4641490d46414a0d46414b0d46414c0d46414d0d46414e0d46414f0d4641500d4641510d4641520d464153124641542d4641562346415723464158234641591b4641a31c4641a41b4641a51c4641aa1b4741421b4741431247414a0d47414b0d47414c0d47414d0d47414e0d47414f0d4741500d4741510d4741520d4741530d4741540d4741550d4741560d4741570d4741580d4741590d47415a0d47415b0d47415c0d47415d1247415e2347415f09474160094741611b4741ae1b4741af"+
    "1b48414b1c48414c1b48414d124841530d4841540d4841550d4841560d4841570d4841580d4841590d48415a0d48415b0d48415c0d48415d0d48415e0d48415f0d4841600d4841610d4841620d4841630d4841640d4841650d4841660d4841671b4941551b4941561249415c1249415d0d49415e0d49415f0d4941600d4941610d4941620d4941630d4941640d4941650d4941660d4941670d4941680d4941690d49416a0d49416b0d49416c0d49416d0d49416e0d49416f0d494170124941711b494172124a4166"+
    "0d4a41670d4a41680d4a41690d4a416a0d4a416b0d4a416c0d4a416d0d4a416e0d4a416f0d4a41700d4a41710d4a41720d4a41730d4a41740d4a41750d4a41760d4a41770d4a41780d4a41790d4a417a0d4a417b124a417c034b4154124b416f0d4b41700d4b41710d4b41720d4b41730d4b41740d4b41750d4b41760d4b41770d4b41780d4b41790d4b417a0d4b417b0d4b417c0d4b417d0d4b417e0d4b417f0d4b41800d4b41810d4b41820d4b41830d4b41840d4b4185124b41861c4c41621b4c416e1b4c416f"+
    "1b4c4170124c41780d4c41790d4c417a0d4c417b0d4c417c0d4c417d0d4c417e0d4c417f0d4c41800d4c41810d4c41820d4c41830d4c41840d4c41850d4c41860d4c41870d4c41880d4c41890d4c418a0d4c418b0d4c418c0d4c418d0d4c418e0d4c418f124c41901b4d41771b4d41781b4d41791b4d417a1b4d417b0d4d41830d4d41840d4d41850d4d41860d4d41870d4d41880d4d41890d4d418a0d4d418b0d4d418c0d4d418d0d4d418e0d4d418f0d4d41900d4d41910d4d41920d4d41930d4d41940d4d4195"+
    "0d4d41960d4d41970d4d41980d4d4199124d419a1b4d419b1b4d41aa1b4e417d1b4e417e1b4e417f1b4e41811b4e41821c4e41831b4e41841b4e4185124e418c0d4e418d0d4e418e0d4e418f0d4e41900d4e41910d4e41920d4e41930d4e41940d4e41950d4e41960d4e41970d4e41980d4e41990d4e419a0d4e419b0d4e419c0d4e419d0d4e419e0d4e419f0d4e41a00d4e41a10d4e41a20d4e41a30d4e41a4124e41a5234e41a7094e41a81b4e41af1b4e41b01b4e41b2124e41b3124e41b4124e41b51b4e41b6"+
    "1b4f41751b4f41761b4f41771b4f41781b4f41861b4f41871b4f41881b4f41891b4f418a1b4f418b1b4f418c1b4f418d1b4f418e1b4f418f0d4f41960d4f41970d4f41980d4f41990d4f419a0d4f419b0d4f419c0d4f419d0d4f419e0d4f419f0d4f41a00d4f41a10d4f41a20d4f41a30d4f41a40d4f41a50d4f41a60d4f41a70d4f41a80d4f41a90d4f41aa0d4f41ab0d4f41ac0d4f41ad0d4f41ae124f41af234f41b02d4f41b1234f41b2094f41b31b4f41b61b4f41b7124f41b8124f41b9124f41ba124f41bb"+
    "124f41bc124f41bd124f41be12504142125041431b5041441b5041451b5041791b50417e1b50417f1b5041801b5041811b5041821b5041901b5041911c5041921b5041931b5041941b5041951b5041961b5041971b5041981b5041991250419f0d5041a00d5041a10d5041a20d5041a30d5041a40d5041a50d5041a60d5041a70d5041a80d5041a90d5041aa0d5041ab0d5041ac0d5041ad0d5041ae0d5041af0d5041b00d5041b10d5041b20d5041b30d5041b40d5041b50d5041b60d5041b70d5041b8125041b9"+
    "2d5041ba2d5041bc235041bd1b5041be12514142125141431251414412514145125141461251414712514148125141491251414a1251414b1251414c1251414d1251414e1251414f125141501b5141511b5141831b5141841b5141881b5141891c51418a1b51418b1b51418c1b51419a1b51419b1b51419c1b51419d1b51419e125141a80d5141a90d5141aa0d5141ab0d5141ac0d5141ad0d5141ae0d5141af0d5141b00d5141b10d5141b20d5141b30d5141b40d5141b50d5141b60d5141b70d5141b80d5141b9"+
    "0d5141ba0d5141bb0d5141bc0d5141bd0d5141be0d5241420d5241430d5241440d52414512524146195241492d52414a1252414b1252414c1252414d1252414e1252414f125241500d5241510d5241520d5241530d5241540d5241550d5241560d5241570d524158125241591252415a1252415b1252415c1b52415d1b52415e1b52418d1b5241921b5241931b5241941b5241951b5241961b5241a51b5241a61b5241a71b5241a80d5241b30d5241b40d5241b50d5241b60d5241b70d5241b80d5241b90d5241ba"+
    "0d5241bb0d5241bc0d5241bd0d5241be0d5341420d5341430d5341440d5341450d5341460d5341470d5341480d5341490d53414a0d53414b0d53414c0d53414d0d53414e0d53414f0d534150085341521953415412534155125341561253415712534158125341590d53415a0d53415b0d53415c0d53415d0d53415e0d53415f0d5341600d5341610d5341620d5341631253416412534165125341661253416712534168125341691b53416a1b53416c1b53419c1b53419d1b53419e1b53419f325341a6125341bd"+
    "0d5341be0d5441420d5441430d5441440d5441450d5441460d5441470d5441480d5441490d54414a0d54414b0d54414c0d54414d0d54414e0d54414f0d5441500d5441510d5441520d5441530d5441540d5441550d5441560d5441570d5441580d5441591254415a0854415b1954415c1254415f1254416012544161125441620d5441630d5441640d5441650d5441660d5441670d5441680d5441690d54416a0d54416b0d54416c0d54416d0d54416e0d54416f1254417012544171125441721254417312544174"+
    "12544175125441761b5441781b5441791c5441a9325441aa325441ab0d55414a0d55414b0d55414c0d55414d0d55414e0d55414f0d5541500d5541510d5541520d5541530d5541540d5541550d5541560d5541570d5541580d5541590d55415a0d55415b0d55415c0d55415d0d55415e0d55415f0d5541600d5541610d5541620d55416312554164195541650855416719554168125541691255416a1255416b1255416c0d55416d0d55416e0d55416f0d5541700d5541710d5541720d5541730d5541740d554175"+
    "0d5541760d5541770d5541780d5541790d55417a0d55417b0d55417c0d55417d0d55417e0d55417f125541801255418112554182125541831b554185325541b5125641530d5641540d5641550d5641560d5641570d5641580d5641590d56415a0d56415b0d56415c0d56415d0d56415e0d56415f0d5641600d5641610d5641620d5641630d5641640d5641650d5641660d5641670d5641680d5641690d56416a0d56416b0d56416c0d56416d1256416e125641731256417412564175125641760d5641770d564178"+
    "0d5641790d56417a0d56417b0d56417c0d56417d0d56417e0d56417f0d5641800d5641810d5641820d5641830d5641840d5641850d5641860d5641870d5641880d5641890d56418a0d56418b0d56418c1256418d1256418e1256418f125641901b5641911b5641931b5641b63257414232574144325741451b5741461b5741471b5741481b5741490d57415d0d57415e0d57415f0d5741600d5741610d5741620d5741630d5741640d5741650d5741660d5741670d5741680d5741690d57416a0d57416b0d57416c"+
    "0d57416d0d57416e0d57416f0d5741700d5741710d5741720d5741730d5741740d5741750d5741760d5741770d5741780d5741790d57417a0d57417b1257417d1257417e1257417f0d5741800d5741810d5741820d5741830d5741840d5741850d5741860d5741870d5741880d5741890d57418a0d57418b0d57418c0d57418d0d57418e0d57418f0d5741900d5741910d5741920d5741930d5741940d5741950d5741960d5741970d5741980d5741991257419a1257419b1257419c1257419d1b57419f1b584142"+
    "1b5841431b5841440358414b3258414d1b5841501b5841511b5841521b5841531b584154125841670d5841680d5841690d58416a0d58416b0d58416c0d58416d0d58416e0d58416f0d5841700d5841710d5841720d5841730d5841740d5841750d5841760d5841770d5841780d5841790d58417a0d58417b0d58417c0d58417d0d58417e0d58417f0d5841800d5841810d5841820d5841830d5841840d5841850d5841861258418712584188125841890d58418a0d58418b0d58418c0d58418d0d58418e0d58418f"+
    "0d5841900d5841910d5841920d5841930d5841940d5841950d5841960d5841970d5841980d5841990d58419a0d58419b0d58419c0d58419d0d58419e0d58419f0d5841a00d5841a10d5841a20d5841a30d5841a40d5841a50d5841a60d5841a7125841a8125841a91b5841aa1b59414d1c5941591b59415a1b59415b1c59415c1b59415d1b59415e125941700d5941710d5941720d5941730d5941740d5941750d5941760d5941770d5941780d5941790d59417a0d59417b0d59417c0d59417d0d59417e0d59417f"+
    "0d5941800d5941810d5941820d5941830d5941840d5941850d5941860d5941870d5941880d5941890d59418a0d59418b0d59418c0d59418d0d59418e0d59418f0d594190125941910d5941920d5941930d5941940d5941950d5941960d5941970d5941980d5941990d59419a0d59419b0d59419c0d59419d0d59419e0d59419f0d5941a00d5941a10d5941a20d5941a30d5941a40d5941a50d5941a60d5941a70d5941a80d5941a90d5941aa0d5941ab0d5941ac0d5941ad0d5941ae0d5941af0d5941b00d5941b1"+
    "0d5941b2125941b3125941b41b5a41641b5a41651b5a41661b5a41671b5a4168125a417b0d5a417c0d5a417d0d5a417e0d5a417f0d5a41800d5a41810d5a41820d5a41830d5a41840d5a41850d5a41860d5a41870d5a41880d5a41890d5a418a0d5a418b0d5a418c0d5a418d0d5a418e0d5a418f0d5a41900d5a41910d5a41920d5a41930d5a41940d5a41950d5a41960d5a41970d5a41980d5a41990d5a419a0d5a419b0d5a419c0d5a419d0d5a419e0d5a419f0d5a41a00d5a41a10d5a41a20d5a41a30d5a41a4"+
    "0d5a41a50d5a41a60d5a41a70d5a41a80d5a41a90d5a41aa0d5a41ab0d5a41ac0d5a41ad0d5a41ae0d5a41af0d5a41b00d5a41b10d5a41b20d5a41b30d5a41b40d5a41b50d5a41b60d5a41b70d5a41b80d5a41b90d5a41ba0d5a41bb0d5a41bc0d5a41bd125a41be125b41421b5b416f1b5b41701b5b41711b5b41721b5b4184125b4185125b41860d5b41870d5b41880d5b41890d5b418a0d5b418b0d5b418c0d5b418d0d5b418e0d5b418f0d5b41900d5b41910d5b41920d5b41930d5b41940d5b41950d5b4196"+
    "0d5b41970d5b41980d5b41990d5b419a0d5b419b0d5b419c0d5b419d0d5b419e0d5b419f0d5b41a00d5b41a10d5b41a20d5b41a30d5b41a40d5b41a50d5b41a60d5b41a70d5b41a80d5b41a90d5b41aa0d5b41ab0d5b41ac0d5b41ad0d5b41ae0d5b41af0d5b41b00d5b41b10d5b41b20d5b41b30d5b41b40d5b41b50d5b41b60d5b41b70d5b41b80d5b41b90d5b41ba0d5b41bb0d5b41bc0d5b41bd0d5b41be0d5c41420d5c41430d5c41440d5c41450d5c41460d5c41470d5c41480d5c41490d5c414a125c414b"+
    "125c414c1b5c414d025c416e025c416f025c4170325c4177125c41900d5c41910d5c41920d5c41930d5c41940d5c41950d5c41960d5c41970d5c41980d5c41990d5c419a0d5c419b0d5c419c0d5c419d0d5c419e0d5c419f0d5c41a00d5c41a10d5c41a20d5c41a30d5c41a40d5c41a50d5c41a60d5c41a70d5c41a80d5c41a90d5c41aa0d5c41ab0d5c41ac0d5c41ad0d5c41ae0d5c41af0d5c41b00d5c41b10d5c41b20d5c41b30d5c41b40d5c41b50d5c41b60d5c41b70d5c41b80d5c41b90d5c41ba0d5c41bb"+
    "0d5c41bc0d5c41bd0d5c41be0d5d41420d5d41430d5d41440d5d41450d5d41460d5d41470d5d41480d5d41490d5d414a0d5d414b0d5d414c0d5d414d0d5d414e0d5d414f0d5d41500d5d41510d5d41520d5d41530d5d41540d5d4155125d4156025d4178035d4179025d417a035d417d125d419b125d419c0d5d419d0d5d419e0d5d419f125d41a0125d41a10d5d41a20d5d41a30d5d41a40d5d41a50d5d41a60d5d41a70d5d41a80d5d41a90d5d41aa0d5d41ab0d5d41ac0d5d41ad0d5d41ae0d5d41af0d5d41b0"+
    "0d5d41b10d5d41b20d5d41b30d5d41b40d5d41b50d5d41b60d5d41b70d5d41b80d5d41b90d5d41ba0d5d41bb0d5d41bc0d5d41bd0d5d41be0d5e41420d5e41430d5e41440d5e41450d5e41460d5e41470d5e41480d5e41490d5e414a0d5e414b0d5e414c0d5e414d0d5e414e0d5e414f0d5e41500d5e41510d5e41520d5e41530d5e41540d5e41550d5e41560d5e41570d5e41580d5e41590d5e415a0d5e415b0d5e415c0d5e415d0d5e415e0d5e415f125e4160125e41611b5e4162025e4183025e41842e5e419f"+
    "1b5e41a0125e41a61b5e41a7125e41a8125e41a91b5e41aa125e41ab125e41ad125e41ae0d5e41af125e41b0125e41b10d5e41b20d5e41b30d5e41b40d5e41b50d5e41b60d5e41b70d5e41b80d5e41b90d5e41ba0d5e41bb0d5e41bc0d5e41bd0d5e41be0d5f41420d5f41430d5f41440d5f41450d5f41460d5f41470d5f41480d5f41490d5f414a0d5f414b0d5f414c0d5f414d0d5f414e0d5f414f0d5f41500d5f41510d5f41520d5f41530d5f41540d5f41550d5f41560d5f41570d5f41580d5f41590d5f415a"+
    "0d5f415b0d5f415c0d5f415d0d5f415e0d5f415f0d5f41600d5f41610d5f41620d5f41630d5f41640d5f41650d5f41660d5f41670d5f41680d5f4169125f416a125f416b1b5f41a72e5f41b9125f41bb1b5f41bc125f41bd0d5f41be0d6041420d6041430d6041440d6041450d6041460d6041470d6041480d6041490d60414a0d60414b0d60414c0d60414d0d60414e0d6041500d6041510d6041520d6041530d6041540d6041550d6041560d6041570d6041580d6041590d60415a0d60415b0d60415c0d60415d"+
    "0d60415e0d60415f0d6041600d6041610d6041620d6041630d6041640d6041650d6041660d6041670d6041680d6041690d60416a0d60416b0d60416c0d60416d0d60416e0d60416f0d6041700d6041710d6041720d6041730d60417412604175126041761b6041771b6041991b60419a1261414a0d61414b0d61414c0d61414d0d61414e0d61414f0d6141500d6141510d6141520d6141530d6141540d6141550d6141560d6141570d6141580d6141590d61415a0d61415b0d61415c0d61415d0d61415e0d61415f"+
    "0d6141600d6141610d6141620d6141630d6141640d6141650d6141660d6141670d6141680d6141690d61416a0d61416b0d61416c0d61416d0d61416e0d61416f0d6141700d6141710d6141720d6141730d6141740d6141750d6141760d6141770d6141780d6141790d61417a0d61417b0d61417c0d61417d0d61417e1261417f126141801b6141a21c6141a31b6141a4126241550d6241560d6241570d6241580d6241590d62415a0d62415b0d62415c0d62415d0d62415e0d62415f0d6241600d6241610d624162"+
    "0d6241630d6241640d6241650d6241660d6241670d6241680d6241690d62416a0d62416b0d62416c0d62416d0d62416e0d62416f0d6241700d6241710d6241720d6241730d6241740d6241750d6241760d6241770d6241780d6241790d62417a0d62417b0d62417c0d62417d0d62417e0d62417f0d6241800d6241810d6241820d6241830d6241840d6241850d6241860d6241870d624188126241891262418a1b62418b1b6241ad1b6241ae256241b9256241bd1b6341461263415f0d6341600d6341610d634162"+
    "0d6341630d6341640d6341650d6341660d6341670d6341680d6341690d63416a0d63416b0d63416c0d63416d0d63416e0d63416f0d6341700d6341710d6341720d6341730d6341740d6341750d6341760d6341770d6341780d6341790d63417a0d63417b0d63417c0d63417d0d63417e0d63417f0d6341800d6341810d6341820d6341830d6341840d6341850d6341860d6341870d6341880d6341890d63418a0d63418b0d63418c0d63418d0d63418e0d63418f0d6341900d634191126341921263419325644145"+
    "1c6441461d6441471d6441481d6441491c64414a1d64414b1d64414c2564414d1d64414e1d64414f1c64415000644158006441590064415a0064415b0064415c0064415d0064415e0064415f0064416000644161006441621b6441690d64416a0d64416b0d64416c0d64416d0d64416e0d64416f0d6441700d6441710d6441720d6441730d6441740d6441750d6441770d6441780d6441790d64417a0d64417b0d64417c0d64417d0d64417e0d64417f0d6441800d6441810d6441820d6441830d6441840d644185"+
    "0d6441860d6441870d6441880d6441890d64418a0d64418b0d64418c0d64418d0d64418e0d64418f0d6441900d6441910d6441920d6441930d6441940d6441950d6441960d6441970d6441980d6441990d64419a0d64419b1264419c1264419d1d6541501565415217654158176541591d65415a0065416100654162006541630065416400654165006541660065416700654168006541690065416a0065416b0065416c0065416d126541740d6541750d6541760d6541770d6541780d6541790d65417a0d65417b"+
    "0d65417c0d65417d0d65417e08654180126541820d6541830d6541840d6541850d6541860d6541870d6541880d6541890d65418a0d65418b0d65418c0d65418d0d65418e0d65418f0d6541900d6541910d6541920d6541930d6541940d6541950d6541960d6541970d6541980d6541990d65419a0d65419b0d65419c0d65419d0d65419e0d65419f0d6541a00d6541a10d6541a20d6541a30d6541a40d6541a5126541a6126541a71d66415a1766416117664162176641631d6641640066416b0066416c0066416e"+
    "0066416f00664170006641710066417200664173006641740066417500664176006641771b66417e1266417f0d6641800d6641810d6641820d6641830d6641840d6641850d664186126641871966418b1966418c1266418d1266418e0d66418f126641900d6641910d6641920d6641930d6641940d6641950d6641960d6641970d6641980d6641990d66419a0d66419b0d66419c0d66419d0d66419e0d66419f0d6641a00d6641a10d6641a20d6641a30d6641a40d6641a50d6641a60d6641a70d6641a80d6641a9"+
    "0d6641aa0d6641ab0d6641ac0d6641ad0d6641ae0d6641af126641b01d6741641767416c2567416e00674175006741760067417700674178006741790067417a0067417b0067417c2567417d0067417e0067417f0067418000674181006741821b6741891267418a1267418b0d67418c0d67418d0d67418e0d67418f0d6741901267419119674193196741942d67419519674196126741971b6741981b67419a1267419b1267419c0d67419d1267419e1267419f0d6741a00d6741a10d6741a20d6741a30d6741a4"+
    "0d6741a50d6741a60d6741a70d6741a80d6741a90d6741aa0d6741ab0d6741ac0d6741ad0d6741ae0d6741af0d6741b00d6741b10d6741b20d6741b30d6741b40d6741b5126741b60d6741b70d6741b8126741b92568416d1c68416e1d68416f1d6841701d6841711c6841721d684178006841800068418100684182256841830068418400684185006841860068418700684188006841890068418a0068418b0068418c1268419512684197126841980d6841991268419a1268419b2d68419c2d68419d2d68419e"+
    "0968419f236841a01b6841a21b6841a51b6841a6126841a8126841aa126841ab126841ac0d6841ad0d6841ae0d6841af0d6841b00d6841b10d6841b20d6841b30d6841b40d6841b50d6841b60d6841b70d6841b80d6841b90d6841ba126841bb126841bc0d6841bd126841be12694142126941431b694144126941452e69414b1d6941781469417a246941821b694188006941890069418a0069418b0069418c0069418d0069418e0069418f00694190006941910069419200694193006941940069419500694196"+
    "236941a5236941a6236941a7096941a8236941b32d6941b4196941b6196941b80d6941ba126941bb0d6941bc126941bd126941be126a4142126a4143126a4145126a41461b6a41472e6a4148126a41491b6a414a126a414c1b6a414d026a41751d6a4182146a4183146a4184246a418c006a4193006a4194006a4195006a4196006a4197006a4198006a4199006a419a006a419b006a419c006a419d006a419e006a419f006a41a0096a41b1236a41bc236a41bd2d6a41be196b4142196b4144086b414b196b414c"+
    "2d6b414d236b414e096b414f026b417e026b417f026b41801d6b418c146b418d146b418e206b4193206b4194206b41951d6b41961b6b419b006b419d006b419e256b419f006b41a0006b41a1006b41a2006b41a3006b41a5006b41a6256b41a7006b41a8006b41a9006b41aa006b41ab096c4149236c414a2d6c414b196c414c196c414f086c4150196c4151086c4152086c4153086c4155196c41562d6c4157236c4158096c4159026c41891c6c41961d6c41971d6c4198256c41991d6c419a1d6c419b1d6c419c"+
    "1d6c419d1d6c419e1d6c419f1c6c41a0006c41a7006c41a8006c41a9006c41aa006c41ab006c41ac006c41ad006c41ae006c41af006c41b0006c41b1006c41b2006c41b3006c41b4006c41b5096d41532d6d4154086d4155086d415b196d415d196d415e086d4160086d41612d6d4162236d4163096d4164006d41b0006d41b1006d41b2006d41b3006d41b4006d41b5006d41b6006d41b7006d41b8006d41b9006d41ba006d41bb006d41bc006d41bd006d41be006e4142006e4143006e41442e6e4148126e415d"+
    "126e415e196e4161196e4162196e4163196e4164136e4165086e4166196e4167086e4168196e416b2d6e416c096e416d006e41bb006e41bc006e41bd006e41be006f4142006f4143006f4144006f4145006f4146006f4147006f4148006f4149006f414a006f414b006f414c006f414d006f414e006f414f1b6f41521b6f4161126f41631b6f41641b6f4165126f4166126f4167126f4168126f4169196f416c136f416e136f416f136f4170126f4171126f4172126f4173126f4174126f41751b6f4176186f4183"+
    "176f4184176f4185186f418600704148007041490070414a0070414b2570414c0070414d0070414e0070414f00704150007041510070415200704153007041542570415500704156007041571b70415a207041601270416b1270416c1270416d1270416e1270416f1270417012704171127041721270417308704174087041761270417713704178137041791370417a1370417b1370417c1370417d1270417e1270417f127041801b70418117704184177041872570418c1770419218704193177041951671414e"+
    "25714150007141530071415400714155007141560071415700714158007141592571415a0071415b0071415c0071415e0071415f00714160007141611b71416321714168207141691b71417412714175127141761271417712714178127141791271417a1271417b1c71417c2e71417d2e71417e2e71417f2e7141802e7141811c714182127141831371418413714185137141861371418713714188127141891271418a1b71418b1871418e1771418f1871419117714193187141941871419f1b72415c0072415d"+
    "0072415e0072415f007241600072416100724162007241630072416400724165007241660072416700724168007241690072416a0072416b1b72416c1b72416d21724170207241711272417e1272417f1272418012724181127241821272418312724184127241852e7241861d7241871d7241881d7241891d72418a1d72418b2e72418c1272418d1272418e1372418f1372419013724191137241921272419312724194177241a1187241a2177241a81b7341420073416700734168007341690073416a0073416b"+
    "0073416c0073416d0073416e0073416f007341700073417100734172007341732573417e217341812e73418312734188127341891c73418a2e73418b2e73418c1c73418d2e73418e2e73418f1c7341901d7341911d7341921d7341931d7341941d7341951c7341962e7341972e7341981c7341992e73419a2e73419b1c73419c1273419d1273419e1b73419f257341a3187341a7177341ab177341ad257341af187341b21b74414c1b74414d1b74414f007441710074417225744173007441740074417500744176"+
    "0074417700744178007441790074417a0074417b0074417c1b74417f2074418b1b744192127441932e7441941d7441951d7441961d7441971d7441981d7441991d74419a1d74419b1d74419c1d74419d1d74419e1d74419f1d7441a01d7441a11d7441a21d7441a31d7441a41d7441a52e7441a6127441a7127441a8177441aa187441ab177441b1257441b3187441b51b7541561b7541571c7541581c7541591b75415a0075417c0075417d0075417e0075417f0075418000754181007541820075418325754184"+
    "0075418500754186007541871b7541882175418b2075418c2575418d2175419020754191217541951275419d2e75419e1d75419f1d7541a01d7541a11d7541a21d7541a31d7541a41d7541a51d7541a61d7541a71d7541a81d7541a91d7541aa1d7541ab1d7541ac1d7541ad1d7541ae1d7541af2e7541b0127541b1127541b2177541b7187541b9177541ba177641461b7641601b7641611b764163007641860076418700764188007641892576418a0076418b0076418c0076418d0076418e0076418f00764190"+
    "1b7641922076419c2076419f127641a6127641a72e7641a81d7641a91d7641aa1d7641ab1d7641ac1d7641ad1d7641ae1d7641af1d7641b01d7641b11d7641b21d7641b31d7641b41d7641b51d7641b61d7641b71d7641b81d7641b92e7641ba127641bb127641bc1877414417774148187741491777414c1877414d1877415018774153177741541b77416a0077419100774192007741930077419400774195007741960077419700774198007741991b77419b207741a3217741a61b7741af127741b0127741b1"+
    "2e7741b21d7741b31d7741b41d7741b51d7741b61d7741b71d7741b81d7741b91d7741ba1d7741bb1d7741bc1d7741bd1d7741be1d7841421d7841431d7841441d7841451d7841462e784147127841481b7841491778414c17784151177841550078419c0078419d0078419e0078419f007841a0007841a11b7841a4217841aa207841ab217841ad127841b9127841ba127841bb1c7841bc2e7841bd2e7841be1c7941422e7941432e7941441c7941451d7941461d7941471d7941481d7941491d79414a1c79414b"+
    "2e79414c2e79414d1c79414e2e79414f2e7941501c794151127941521b79415318794156187941591879415b1b7941631b7941651b794168007941a6007941a7007941a8007941a91b7941ab1b7941ac207941b0217941b1257941ba1b7a4146127a4147127a4148127a4149127a414a127a414b127a414c197a414d127a414e2e7a414f1d7a41501d7a41511d7a41521d7a41531d7a41542e7a4155137a4156137a4157137a4158127a4159127a415a127a415b127a415c177a41631b7a4167007a41b11b7a41b4"+
    "127b4150127b4151127b4152127b4153197b4154197b4156127b41582e7b41591d7b415a1d7b415b1d7b415c1d7b415d1d7b415e2e7b415f137b4160137b4161137b4162137b4163127b4164127b4165127b4166257b416b177b416e1b7b41bd207c4144217c4145257c414b207c414f217c4150127c415a127c415b197c415d197c415e127c4161127c41621c7c41631d7c41641d7c41651d7c41661d7c41671d7c41681c7c4169137c416a137c416b137c416c137c416d137c416e127c416f127c41701b7c4171"+
    "187c4173177c41751b7c41791b7d4149207d414d257d4150207d41531b7d415f237d4161097d4162097d4163127d4164127d4165197d4169197d416b197d416c2e7d416d1d7d416e1d7d416f1d7d41701d7d41711d7d41722e7d4173137d4174137d4175137d4176137d4177137d4178127d4179127d417a177d417d217e4157217e415d217e4161207e4165217e41661b7e4169237e416a2d7e416b197e416c2d7e416d127e416e087e4172127e41762e7e41771d7e41781d7e41791d7e417a1d7e417b1d7e417c"+
    "2e7e417d127e417e137e417f137e4180137e4181137e4182127e4183127e41841b7e4185177e4188187e4189217f4164207f416a207f416b257f416e2d7f4174197f4175197f4177127f4178087f417a087f417b197f417c087f417e197f41801c7f41812e7f41822e7f41832e7f41842e7f41852e7f41861c7f4187137f4188137f4189137f418a137f418b127f418c127f418d1b7f418e1b8041692080416e218041741b80417d1980417e1980418008804181088041821980418408804187198041881980418a"+
    "1280418b1280418c1380418d1380418e1380418f13804190138041911380419213804193138041941280419512804196128041971b80419e2081417a2581417c21814183208141841b8141861b8141871981418a138141961381419713814198138141991381419a1381419b1381419c1381419d1281419e1281419f128141a0128141a11b8141a21b8141a51b8141a621824184218241892082418a1b8241911982419319824195198241991982419a1982419d1982419f138241a1138241a2138241a3138241a4"+
    "138241a5128241a6128241a7128241a8128241a9128241aa1b8241ab1c8341931c83419b1983419d0883419f088341a0198341a1198341a5198341a6198341a7128341aa128341ab1b8341ad128341ae128341af128341b01b8341b2128341b31c8441932a8441942a8441951c8441961c8441971c8441981c8441991c84419a1c84419b1c84419c1c84419e1c84419f1c8441a01c8441a4198441a6198441a9198441ad198441af128441b2128441b31b8441b61b8441b8258541a91c8541ab1c8541ad198541ae"+
    "198541af198541b3198541b4198541b5198541b6088541b7198541b9128541bb1b8541bc1c8641b6198641ba198641bc198641bd19874142198741442e874147128741481b87414a2587414f1c8841431988414419884145088841472e8841482e8841492e88414a2d884150098841511c89414c088941502e8941510889415219894153088941542e8941552d8941590989415a2a8a414d098a41552d8a4156198a41592e8a415a198a415e088a415f2d8a4163238a41642a8b415b098b415f238b41602d8b4161"+
    "088b4162088b41632e8b4164198b4165088b4166198b4167088b4168198b4169198b416a198b416b2d8b416c098b416d238b416e1c8c41662d8c416a198c416b088c416d2e8c416e198c416f198c4174198c41762d8c4177238c41781c8d41711c8d41721c8d41731c8d4174088d4175088d41782e8d4179088d417a088d417c2e8d417d098d4181258d4195298d41b81c8e417e088e4180198e4182088e41832e8e41842e8e41852e8e4186088e4188098e418a288f41451c8f4189088f418a088f418b198f418c"+
    "198f418f198f4191088f41921c8f41942890414f1c90419419904197089041981c90419d289141591c91419f199141a1199141a2089141a41c9141a51c9141a61b9141a80a9141a9289241631c9241aa1c9241ab1c9241ac1c9241ad1c9241ae2893416d28944177299441a4299441a5299441a6299441a7299441a8299441a9299441aa299441ab299441ac299441ad299441ae28954181299541ae1d9541af299541b0299541b1299541b2299541b3299541b4299541b5299541b61d9541b7299541b80a964148"+
    "2896418b1d9641b9169641bc1d9741442697415228974195299841451d9841462998414729984148299841492998414a2998414b2998414c2998414d1d98414e2998414f2598415c2998419f2999414f299941502999415129994152299941532999415429994155299941562999415729994158299941592a9a41732a9a41742a9a41752a9a41762a9a41772a9a4178259a4182289b417d289b417e289b417f289b4180289b4181289b4182299b41ad289b41ae289b41af289b41b0289b41b1289b41b2289b41b3"+
    "299b41b4299c4187299c4188299c4189299c418a299c418b299c418c2a9d41912a9d41922a9d41932a9d41942a9d41952a9d4196299e419b299e419c299e419d299e419e299e419f299e41a0289f41a5289f41a6289f41a7289f41a8289f41a9289f41aa2aa041af2aa041b02aa041b12aa041b22aa041b32aa041b425a041b925a6416229a7418b29a7418c2aa7418d2aa7418f29a7419029a7419125a8418729a841951da841961da8419711a841981da841991da8419a29a8419b29a9419f29a941a029a941a4"+
    "29a941a528aa419c28aa419d28aa419e28aa419f28aa41a028aa41a128aa41a228aa41a328aa41a428aa41a528aa41a628aa41a728aa41a829aa41a929aa41aa29aa41ae29aa41af2aab41962aab41a62aab41a72aab41a82aab41a92aab41aa2aab41ab2aab41ac2aab41ad2aab41ae2aab41af2aab41b02aab41b12aab41b229ab41b329ab41b429ab41b829ab41b929ac418a29ac418b29ac418d29ac418e2aac41a029ac41bd29ac41be29ad414529ad414629ad41941dad41951dad41961dad419729ad4198"+
    "2aad41aa29ae414a29ae414b29ae414f29ae415029ae419e29ae419f29ae41a129ae41a21cae41b21cae41b31cae41b41cae41b51cae41b629af415429af415529af415929af415a29af41a829af41a929af41ab29af41ac1caf41bb25af41bc25b041431cb0414429b0415e29b0415f29b0416329b0416429b041b229b041b316b041b429b041b529b041b61cb141481cb1414e29b141681db141691db1416a11b1416b1db1416c1db1416d29b1416e29b141bc29b141bd29b2414229b241431cb241521cb24155"+
    "1cb2415829b2417229b241732ab241742ab2417629b2417729b2417829b3414929b3414a29b3414c29b3414d1cb3415c1cb3416225b3416a29b441531db441541db441551db4415629b441571cb4416625b4416725b4416b1cb4416c29b4419928b4419a28b4419b28b4419c28b4419d28b4419e28b4419f28b441a029b441a129b5415d29b5415e29b5416029b541611cb541711cb541721cb541731cb541741cb541750fb741861cb7418704b841911b3d42471b3d42481b3d42491b3d424a1b3d424b1b3d424c"+
    "1b3d42501b3d4258123d427b1b3e42501b3e42511b3e42521b3e42531b3e42541b3e42551b3e42611b3e42621b3e4263123e4283123e4284123e4285123e4286123e42871b3f425a1b3f425b1b3f425c1b3f425d1b3f425e1b3f426c123f428c123f428d123f428e123f428f123f4290123f4291123f42921b3f42951b3f42961b3f42991b4042641b4042651b4042661b4042671b4042680240426c1b4042731b4042741b4042751b404276124042961240429712404298124042991240429a1240429b1240429c"+
    "1b40429f0241426f1b4142701b4142710241427502414276024142771b41427c1b41427d1b41427e1b41427f1b4142801241429f124142a0124142a1124142a2124142a3124142a4124142a5124142a6124142a71b4142ae02424278024242790242427a024242801b4242861b4242871c4242881b4242891b42428a1b4242951b4242961b42429b124242a8124242a9144242aa1c4242ab2e4242ac2e4242ad2e4242ae2e4242af1c4242b0124242b11b4242b31b4242b9024342831b4342901b4342911b434292"+
    "1b4342931b4342941b4342951b4342961b43429f1c4342a01b4342a11b4342a41b4342a51b4342a6124342b1144342b20d4342b30d4342b42e4342b51d4342b61d4342b71d4342b81d4342b92e4342ba124342bb2e4342bd1b4442951b4442961b4442971b44429b1b44429c1b44429d1b44429e1b44429f1b4442a01b4442a11c4442a31b4442aa1b4442ab1b4442af124442bb0d4442bc144442bd0d4442be2e4542421d4542431d4542441d4542451d4542462e454247124542481b45429a1b45429e1b45429f"+
    "1b4542a01b4542a11b4542a21b4542a71b4542a81c4542a91b4542aa1b4542ab12464245124642461346424712464248124642491446424a1446424b2e46424c1d46424d1d46424e1d46424f1d4642502e46425112464252124642531b4642a31b4642a41b4642a51b4642a81b4642a91c4642aa1b4642ab1b4642ac1b4642b11b4642b21b4642b31b4642b41b4642b51b4742421247424b1247424c1247424d1247424e1247424f1347425014474251124742521247425312474254124742551c4742561d474257"+
    "1d4742581d4742591d47425a1c47425b1247425c1247425d1b47425e1b4742ae1b4742b21b4742b31b4742b41b4742b51b4742b61b4742bb1b4742bc1b4742bd1b4742be1b4842421b48424b1b48424c1b48424d1248425412484255124842561248425712484258134842591348425a1448425b1448425c1248425d1248425e1448425f2e4842601d4842611d4842621d4842631d4842642e48426512484266124842671b4842bd1b4842be1b4942421b4942561249425e1249425f0d4942601249426112494262"+
    "134942631349426413494265124942660d494267144942680d4942692e49426a1d49426b1d49426c1d49426d1d49426e2e49426f12494270124a4267124a42680d4a4269144a426a144a426b124a426c134a426d144a426e134a426f124a4270144a4271144a42720d4a42732e4a42741d4a42751d4a42761d4a42771d4a42782e4a4279124a427a124a427b034b4254124b4270124b4271124b42720d4b4273124b4274124b4275124b4276134b4277134b4278144b4279134b427a124b427b144b427c124b427d"+
    "1c4b427e2e4b427f2e4b42802e4b42812e4b42821c4b4283124b4284124b42851b4b42861c4c4262124c4279124c427a124c427b124c427c144c427d124c427e124c427f124c4280134c4281134c4282134c4283134c4284134c4285134c4286124c4287124c4288134c4289134c428a134c428b124c428c124c428d124c428e124c428f1b4d42791b4d427a124d4283124d4284124d4285124d4286144d4287144d4288124d4289134d428a134d428b134d428c134d428d134d428e134d428f134d4290134d4291"+
    "134d4292134d4293134d4294134d4295134d4296124d4297124d4298124d42991b4e427c1b4e427d1b4e427e1b4e427f1b4e42821c4e42831b4e4284124e428d124e428e124e428f124e4290124e4291124e4292124e4293134e4294134e4295134e4296134e4297134e4298134e4299134e429a134e429b134e429c134e429d134e429e134e429f134e42a0124e42a1124e42a2124e42a3124e42a41b4f42741b4f42751b4f42761b4f42771b4f42781b4f42861b4f42871b4f42881b4f42891b4f428a1b4f428c"+
    "1b4f428d1b4f428e124f4296124f4297124f4298124f4299124f429a124f429b124f429c124f429d124f429e144f429f124f42a0124f42a1124f42a2124f42a3124f42a4124f42a5134f42a6134f42a7134f42a8134f42a9134f42aa124f42ab124f42ac124f42ad124f42ae1b4f42b71b50427e1b50427f1b5042801b5042811b5042821b5042901b5042911c5042921b5042931b504294125042a0125042a1125042a2125042a3125042a4145042a5145042a6125042a7125042a8125042a9125042aa125042ab"+
    "125042ac125042ad125042ae125042af125042b0125042b1135042b2135042b3135042b4135042b5125042b6125042b7125042b81b5042b91b5142471b51424b1b51424c1b5142881b5142891c51428a1b51428b1b51428c1b51429a1b51429b1b51429c1b51429d1b51429e125142a9125142aa125142ab125142ac125142ad125142ae125142af125142b0125142b1125142b2125142b3125142b4125142b5125142b6125142b7125142b8125142b9125142ba125142bb125142bc135142bd135142be13524242"+
    "1352424312524244125242451b52425012524251125242521252425312524254125242551252425612524257125242581b5242921b5242931b5242941b5242951b5242961b5242971b5242a51b5242a61b5242a7125242b3125242b4125242b5125242b6145242b7125242b8125242b9145242ba125242bb125242bc125242bd145242be12534242125342431253424412534245125342461253424712534248125342491353424a1353424b1353424c1353424d1253424e1253424f2e5342501b5342591c53425a"+
    "2e53425b2e53425c2e53425d1c53425e1253425f0e5342600e53426112534262125342631b5342641b53429c1b53429d1b53429e1b53429f1b5342a01b5342a1125342be125442421254424312544244125442450d544246145442470d5442480d5442490d54424a1454424b1254424c1254424d1254424e1254424f125442501254425112544252135442531354425413544255135442561354425712544258125442591b54425a125442632e5442641d5442651d5442661d5442672e544268125442690e54426a"+
    "0e54426b0e54426c0e54426d1254426e1254426f1b5442721b5442741b5442a71b5442a81c5442a91b5442aa1b5442ab1255424a1255424b1c55424c2e55424d2e55424e2e55424f1c5542502e5542512e5542522e5542531c5542542e5542552e5542562e5542571c554258125542591255425a1355425b1355425c1355425d1355425e1355425f135542601355426112554262125542631255426d2e55426e1d55426f1d5542701d5542712e5542720e5542730e5542740e5542750e5542760e5542770e554278"+
    "0e5542791255427a1255427b1255427c1255427d1255427e1255427f1b5542b11b5542b21b5542b31b5542b41b5542b5025542b612564254125642552e5642561d5642571d5642581d5642591d56425a1d56425b1d56425c1d56425d1d56425e1d56425f1d5642601d5642612e564262135642631356426413564265135642661356426713564268135642691356426a1356426b1356426c1256426d1b56426e1b564276125642772e5642781d5642791d56427a1d56427b2e56427c0e56427d0e56427e0e56427f"+
    "0e5642800e5642810e5642820e5642830e5642840e5642850e5642860e5642870e5642880e5642891256428a1256428b1256428c1b56428e1b5642bb1b5642bc1b5642bd1b5642be1b574242025742431257425d1257425e1257425f2e5742601d5742611d5742621d5742631d5742641d5742651d5742661d5742671d5742681d5742691d57426a1d57426b2e57426c1357426d1357426e1357426f135742701357427112574272125742731357427413574275135742761257427712574278095742790957427a"+
    "2357427b12574280125742812e5742821d5742831d5742841d5742852e5742860e5742870e5742880e5742892857428a0e57428b0e57428c0e57428d0e57428e0e57428f0e5742900e5742910e5742920e5742930e5742940e5742950e5742960e57429712574298125742991b57429c025842490258424a0358424b0258424c0258424d1b5842511b5842521b58425312584268125842692e58426a1d58426b1d58426c1d58426d1d58426e1d58426f1d5842701d5842711d5842721d5842731d5842741d584275"+
    "2e5842761358427713584278135842791358427a1258427b1258427c1258427d1358427e1358427f135842801358428112584282095842832358428423584285235842861b5842881b5842891258428a1258428b2e58428c1d58428d1d58428e1d58428f2e584290125842910e5842920e5842930e5842940e5842950e5842960e5842970e5842980e5842990e58429a0e58429b0e58429c0e58429d2858429e0e58429f0e5842a00e5842a10e5842a2125842a3125842a4125842a5125842a6125842a702594253"+
    "025942540259425502594256025942571c5942591b59425b1c59425c1b59425d1259427112594272125942732e5942741d5942751d5942761d5942771d5942781d5942791d59427a1d59427b1d59427c1d59427d1d59427e1d59427f2e5942801359428113594282135942831259428412594285125942861259428712594288135942891359428a1359428b1259428c2d59428d1959428e2d59428f2d594290125942921259429312594294125942951c5942962e5942972e5942982e5942991c59429a1259429b"+
    "0e59429c0e59429d0e59429e0e59429f0b5942a00e5942a10e5942a2285942a30e5942a40e5942a50e5942a60e5942a70e5942a80e5942a90e5942aa0e5942ab0e5942ac125942ad125942ae125942af125942b0125942b1125942b21b5942b3025a425d025a425e025a425f025a42601b5a4266125a427c125a427d2e5a427e1d5a427f1d5a42801d5a42811d5a42821d5a42831d5a42841d5a42851d5a42861d5a42871d5a42881d5a42892e5a428a125a428b125a428c125a428d125a428e125a428f125a4290"+
    "125a4291125a4292135a4293135a4294135a4295135a4296085a4299125a429b125a429c125a429d135a429e135a429f135a42a0135a42a1135a42a2125a42a3125a42a4125a42a50e5a42a60e5a42a70e5a42a80e5a42a90e5a42aa0e5a42ab0e5a42ac0e5a42ad0e5a42ae0e5a42af0e5a42b00e5a42b10e5a42b20e5a42b30e5a42b40e5a42b5125a42b61c5a42b72e5a42b82e5a42b92e5a42ba1c5a42bb125a42bc125a42bd1b5a42be1b5b4242025b4267025b4268025b4269025b426a025b426b1b5b4286"+
    "125b42871c5b42882e5b42892e5b428a2e5b428b1c5b428c2e5b428d2e5b428e2e5b428f1c5b42902e5b42912e5b42922e5b42931c5b4294125b4295125b4296125b4297125b4298125b4299125b429a125b429b125b429c135b429d135b429e135b429f135b42a0085b42a1195b42a2195b42a3135b42a5135b42a6135b42a7135b42a8135b42a9135b42aa135b42ab135b42ac135b42ad135b42ae135b42af135b42b00e5b42b10e5b42b20e5b42b30e5b42b40e5b42b50e5b42b60e5b42b70e5b42b80e5b42b9"+
    "0e5b42ba0e5b42bb0e5b42bc0e5b42bd135b42be0e5c4242125c42432e5c42441d5c42451d5c42461d5c42472e5c4248125c4249125c424a025c426f025c4271025c4272025c4273025c4274025c4275125c4291125c4292125c4293125c4294125c4295125c4296125c4297125c4298125c4299125c429a125c429b125c429c125c429d125c429e125c429f125c42a0125c42a1125c42a2125c42a3125c42a4125c42a5135c42a6135c42a7135c42a8135c42a9135c42aa195c42ac085c42ae135c42b0135c42b1"+
    "135c42b2135c42b3135c42b4135c42b5135c42b6135c42b7135c42b8135c42b9135c42ba135c42bb135c42bc135c42bd135c42be0e5d42420e5d42430e5d42440e5d42450e5d4246135d4247135d4248135d4249135d424a135d424b135d424c135d424d2e5d424e1d5d424f1d5d42501d5d42512e5d4252125d4253125d4254125d4255025d4278025d4279025d427a025d427b025d427c035d427d025d427e025d427f1b5d429b125d429d125d429e125d429f1b5d42a1125d42a2125d42a3125d42a4125d42a5"+
    "125d42a6125d42a7125d42a8125d42a9125d42aa125d42ab125d42ac125d42ad125d42ae125d42af135d42b0135d42b1135d42b2125d42b3125d42b4135d42ba135d42bb0e5d42bc0e5d42bd0e5d42be135e4242135e4243135e4244135e4245135e4246135e4247135e4248135e4249135e424a135e424b135e424c0e5e424d135e424e135e424f135e4250135e4251135e4252135e4253135e4254135e4255135e4256135e42572e5e42581d5e42591d5e425a1d5e425b2e5e425c125e425d125e425e125e425f"+
    "025e4283025e4285025e4286025e4287025e4288025e42890a5e429f1b5e42a71b5e42ad1b5e42ae125e42af1b5e42b1125e42b2125e42b3125e42b4125e42b5125e42b6125e42b7125e42b8145e42b9135e42ba135e42bb135e42bc125e42bd125e42be125f4242195f4244195f42450e5f42470e5f42480e5f42490e5f424a0e5f424b0e5f424c0e5f424d0e5f424e0e5f424f135f4250135f4251135f4252135f4253135f4254135f4255135f4256135f4257135f4258135f4259135f425a135f425b135f425c"+
    "135f425d135f425e135f425f135f4260125f42611c5f42621c5f42631d5f42641d5f42651c5f4266125f4267125f4268125f42691b5f426a025f428f025f4290025f4291025f42920a5f42b91b5f42bd125f42be12604242126042430d60424414604245146042461360424713604248136042491260424a1260424b1260424c1960424d1960424f0e6042510e6042520e6042530e6042540e6042550b6042560e6042570e6042580e6042590e60425a0e60425b0e60425c1360425d1360425e1360425f13604260"+
    "1360426113604262136042631360426413604265136042661260426712604268126042691260426a1260426b1260426c2e60426d1d60426e1d60426f2e604270126042711260427212604273126042741b6042751b6042991261424b1261424c0d61424d0d61424e1261424f1261425013614251136142521461425312614254126142550861425719614258086142590861425a0e61425b0e61425c0e61425d2861425e0e61425f0e6142600e6142610e6142620e6142630e6142640e6142650e6142660e614267"+
    "12614268126142691261426a1361426b1361426c1361426d1361426e1261426f126142701261427112614272126142731261427412614275126142762e6142771d6142781d6142792e61427a1261427b1261427c1261427d1261427e1b6142a21b6142a31b6142a41b62425512624256126242570d6242580d6242591362425a1462425b1362425c1462425d0d62425e1262425f19624261196242630e6242640e6242650e6242660e6242670e6242680e6242690e62426a0e62426b0e62426c0e62426d0e62426e"+
    "0e62426f0e6242700e6242711262427212624273126242741c6242752e6242762e6242772e6242781c6242791262427a1262427b1262427c1262427d1262427e1262427f126242801c6242812e6242822e6242831c624284126242851262428612624287126242881b62428a1b6242ad256242b9256242bd12634260126342610d63426212634263136342641363426514634266126342670d634268126342691963426b2d63426c0d63426e0e63426f0e6342700e6342710e6342720e6342730e6342740e634275"+
    "0e6342760e6342770e634278286342790e63427a1263427b1c63427c2e63427d2e63427e1d63427f1d6342801d6342811d6342821d6342832e6342842e6342851c6342861263428712634288126342891263428a1263428b1263428c1263428d1263428e1263428f1263429012634291256442451c6442461d6442471d6442481d6442491c64424a1d64424b1d64424c2564424d1d64424e1d64424f1c6442501264426a1264426b0d64426c0d64426d1364426e1364426f0d644270126442711264427212644273"+
    "2d6442742d644275236442762d6442770e6442780e6442790e64427a0e64427b0e64427c0e64427d0e64427e2864427f0e6442800e6442810e6442820e6442830e644284126442852e6442861d6442871d6442881d6442891d64428a1d64428b1d64428c1d64428d1d64428e1d64428f2e6442901264429112644292126442931264429412644295126442961264429712644298126442991264429a1264429b1b64429c1d65425015654252176542591d65425a126542751265427612654277126542780d654279"+
    "0d65427a0d65427b1265427c1265427d0965427e2365427f0965428023654281126542830e6542840e6542850e6542860e6542870e6542880e6542890e65428a0e65428b0e65428c0e65428d0e65428e0e65428f2e6542901d6542911d6542921d6542931d6542941d6542951d6542961d6542971d6542981d6542992e65429a1265429b1265429c1265429d1265429e1265429f126542a0126542a1126542a2126542a3126542a4126542a51b6542a62566425a176642621d6642641b66427f1266428012664281"+
    "1266428212664283126642840d6642850d6642861b6642872366428a1b66428d1266428f0e6642910e6642920e6642930e6642940e6642950e6642960e6642970e664298126642991c66429a2e66429b2e66429c1c66429d2e66429e2e66429f2e6642a01c6642a12e6642a22e6642a31c6642a4126642a5126642a6126642a7126642a8126642a9126642aa126642ab126642ac126642ad126642ae126642af1b6642b01d6742642567426e1667427d1b67428b1267428c1267428d1267428e0d67428f12674290"+
    "1b6742911b6742981b67429c1267429d1b67429e126742a0126742a10e6742a2126742a3126742a4126742a5126742a6126742a7126742a8126742a9126742aa126742ab126742ac126742ad126742ae126742af126742b0126742b1126742b2126742b3126742b4126742b51b6742b6126742b7126742b81b6742b92568426d1c68426e1d68426f1d6842701d6842711c6842721d684278166842831b684297126842991b6842ab1b6842ac126842ad126842ae126842af126842b0126842b1126842b2126842b3"+
    "126842b4126842b5126842b6126842b7126842b8126842b9126842ba1b6842bc126842bd1b6942421b6942430a69424b1d6942781d6942822e6942ba1b6942bb126942bc1b6942bd1b6a42421b6a42460a6a42481d6a4282146a4283146a42841d6a428c1d6b428c146b428d206b42941d6b4296166b429f166b42a71c6c42961d6c42971d6c4298256c42991d6c429a1d6c429b1d6c429c1d6c429d1d6c429e1d6c429f1c6c42a00a6e42481670424c167042551b70426c1b70426d2a7042742a7042761b704280"+
    "1670428c2571424e2671424f0a7142501671425a1b7142751c71427c2e71427d2a71427e2a7142802e7142811c7142821b71428b1b72426d1b72427e2e7242862e72428c1b7242941b7342421b7342441b7342451b7342461673427e0a7342831c73428a2e73428b2e73428c1c73428d2e73428e2e73428f1c7342901c7342962e7342972e7342981c7342992e73429a2e73429b1c73429c167342a3167342af1b74424c1b74424d1b74424e1b74424f1b7442501b744251167442732e7442942e74429a1574429b"+
    "1574429f2e7442a02e7442a6167442b31b7542561b7542571b7542581b7542591b75425a1b75425b167542841675428d1b75429d2e75429e2e7542b01b7542b21b7642601b7642611b7642621b7642631b7642641b7642651676428a2e7642a82e7642ba1b7642bb1b77426a1b77426c1b77426d1b77426e1b77429b2e7742b22e7842471b7842491b7842ba1c7842bc2e7842bd2e7842be1c7942422e7942432e7942441c7942450679424a1c79424b2e79424c2479424d1c79424e2e79424f2e7942501c794251"+
    "167942ba2e7a424f2e7a42551b7b42502e7b42592e7b425f1b7b4266167b426b1b7b42bd167c424b297c425e1c7c42631e7c42641e7c42651e7c42661e7c42671e7c42681c7c4269167d42501b7d4264257d42671c7d4268257d42692e7d426d1d7d426e1d7d426f1d7d42701d7d42711d7d42722e7d42731b7d427a2e7e42771d7e42781d7e42791d7e427a1d7e427b1d7e427c2e7e427d167f426e1b7f42801c7f42812e7f42822e7f42832e7f42842e7f42852e7f42861c7f42871b7f428e1b80428b1b804297"+
    "1681427c1b8142872581428f1c814290258142912982429a1b8242aa2a8342931c83429b1b8342ab1b8342ae2a8442931c8442962a8442972a8442981c8442992a84429a2a84429b1c84429c1c84429e2a84429f2a8442a01c8442a4168542a7258542a91c8542ab1c8542ad1c8642b60a8742471b8742482587424f1c8842432c8842481a8842492c88424a1c89424c1a8942513089425230894253308942542e894255168942632c8a425a308a425b308a425c308a425d308a425e308a425f2c8a42602e8b4264"+
    "308b4265308b42662e8b4267308b4268308b42691a8b426a2a8c42662c8c426e308c426f308c4270308c4271308c4272308c42732c8c42741c8d42712a8d42722a8d42731c8d42741a8d4279308d427a308d427b308d427c2e8d427d1c8e427e2c8e42841a8e42852c8e42861c8f42891c8f42941c9042941c90429d1c91429f1c9142a51c9142a6259142a91c9242aa1c9242ab1c9242ac1c9242ad1c9242ae299542ae299542af299542b0299542b1299542b2299542b3299542b4299542b5299542b6299542b7"+
    "299542b825964248299642b81d9642b9279642ba279642bb279642bc279642bd279642be27974242279742431d9742442997424529984245299842462998424729984248299842492998424a2998424b2998424c2998424d2998424e2998424f2a9d42912a9d42922a9d42932a9d42942a9d42952a9d429629a7428c29a7428d29a7428f29a7429029a842961da842971da842981da8429929a8429a29a942a029a942a129a942a329a942a429aa42aa29aa42ab29aa42ad29aa42ae29ab42b429ab42b529ab42b7"+
    "29ab42b829ac428b29ac428c29ac428d29ac42be29ad424229ad424429ad424529ad42951dad429629ad42972aad42aa29ae424b29ae424c29ae424e29ae424f29ae429f27ae42a029ae42a129ae42b227ae42b31cae42b427ae42b529ae42b629af425529af425629af425829af425929af42a927af42aa29af42ab29af42bb27af42bc29af42bd29b0424227b0424329b0424429b0425f29b0426029b0426229b0426329b042b327b042b429b042b527b1424829b1424929b1424d27b1424e29b142691db1426a"+
    "1db1426b1db1426c29b1426d29b142bd27b142be29b242422ab242511cb242521cb242551cb242582ab2425929b2427329b2427429b2427629b2427729b3424a27b3424b29b3424c27b3425c29b3425d29b3426127b3426229b442541db4425529b4425629b4426627b4426729b4426829b4426a27b4426b29b4426c29b5425e29b5425f29b5426029b5427127b542721cb5427327b5427429b542752ab6427d0fb742861cb742872fb7428804b842911b3d43471b3d43481b3d43491b3d434a1b3d434b1b3d434c"+
    "1b3e43501b3e43511b3e43521b3e43531b3e43541b3e43551b3f435a1b3f435b1b3f435c1b3f435d1b3f435e1b3f43951b4043641b4043651b4043661b4043671b4043681b4043731b4043741b4043751b4043761b41436f1b4143701b4143711b41437c1b41437d1b41437e1b41437f1b4143801b4243861b4243871c4243881b4243891b42438a1b42438e1b42438f1b4243901b424396254243a8254243a9254243aa1c4243ab2e4243ac2e4243ad2e4243ae2e4243af1c4243b01b4343901b4343911b434392"+
    "1b4343931b4343941b4343951b4343961b4343971b4343981b4343991b43439a1b43439b1b43439f1b4343a01b4343a1254343b1254343b22e4343b5144343b6144343b7144343b92e4343ba0a4343bd1b4443941b4443951b4443961b4443971b44439a1b44439b1b44439c1b44439d1b44439e1b44439f1b4443a01b4443a11b4443a21c4443a31b4443a41b4443a51b4443aa254443bb2e45434214454343144543462e4543471b45439e1b45439f1b4543a01b4543a11b4543a21b4543a71b4543a81c4543a9"+
    "1b4543aa1b4543ab1b4543ac1b4543ad1b4543ae1b4543af254643482e46434c144643502e4643511b4643a81b4643a91c4643aa1b4643ab1b4643ac1b4643b11b4643b21b4643b31b4643b41b4643b51b4643b61b4643b71b4643b81b4643b9254743521c47435614474357144743581447435a1c47435b1b4743b21b4743b31b4743b41b4743b51b4743b61b4743bc1b4743bd1b4743be1b4843422648435c2e484360144843612e4843651b4843bc1b4843bd1b4843be1b4943421b4943431449436025494366"+
    "2e49436a1449436b1449436e2e49436f024a4348024a4349024a434a024a434b024a434c144a4369254a4370254a43712e4a4374144a4375144a43782e4a4379024b4352024b4353034b4354024b4355024b4356144b4373254b437b254b437c254b437d1c4b437e2e4b437f244b4380244b43812e4b43821c4b4383024c435c024c435d024c435e024c435f024c43601c4c4362024d4367024d4368024d43691b4d43791b4e43821b4e43831b4e43841b4f43871b4f43881b4f438d254f4397254f4398254f4399"+
    "254f439a254f439b254f439c254f439d254f439e264f439f254f43a0254f43a1254f43a2254f43a31b4f43ae1b50437f1b5043801b5043811b5043911c5043921b504393255043a1255043ad1b5143891c51438a1b51438b1b51439b1b51439c1b51439d255143ab255143b71b5243521b5243531b5243541b5243571b5243931b5243941b5243951b524396255243b5255343440a5343501c53435a2e53435b2e53435c2e53435d1c53435e31534360315343611b5343631b53439d1b53439e1b53439f1b5343a0"+
    "1b5343a1255443421454434614544348145443491454434a2554434e1b5443592e544364225443672e5443683154436a3154436b3154436c3154436d1b5443a71b5443a81c5443a91b5443aa1b5443ab1c55434c2e55434d2e55434e2e55434f1c5543502e5543512e5543522e5543531c5543542e5543552e5543562e5543571c5543582e55436e0755436f225543712e554372315543733155437431554375315543763155437731554378315543791b55437a1b55437f1b5543b11b5543b21b5543b31b5543b4"+
    "1b5543b5025543b62e5643562e5643621b56436d2e564378075643792e56437c3156437e3156437f3156438031564381315643823156438331564385315643863156438731564388315643891b56438a1b56438c1b5643bb1b5643bc1b5643bd1b5643be1b574342025743431b5743441b5743451b5743462e5743602457436c1b5743781b5743812e5743820c5743852e5743863157438731574388315743892557438a3157438b3157438c3157438d3157438e3157438f31574390315743913157439231574393"+
    "315743943157439531574396315743971b574399025843490258434a0358434b0258434c1b58434d1b58434e1b58434f1b5843501b5843511b5843522e58436a245843762e58438c1058438f2e58439031584392315843933158439431584395315843963158439731584398315843993158439a3158439b3158439c3158439d2558439e3158439f315843a0315843a11b5843a41b5843a7025943530259435402594355025943561b5943571b5943581c5943591b59435a1b59435b1b59435c1b59435d2e594374"+
    "2e5943801b59438c1b5943921c59439624594397245943982e5943991c59439a3159439c3159439d3159439e3159439f315943a1315943a2255943a3315943a4315943a5315943a6315943a7315943a8315943a9315943aa315943ab315943ac025a435d025a435e025a435f025a43601b5a43611b5a43621b5a43631b5a43641b5a43651b5a43662e5a437e2e5a438a1b5a439b1b5a43a4315a43a6315a43a7315a43a8315a43a9315a43aa315a43ab315a43ac315a43ad315a43ae315a43af315a43b0315a43b1"+
    "315a43b2315a43b3315a43b4315a43b51c5a43b72e5a43b82e5a43b92e5a43ba1c5a43bb025b4368025b4369025b436a025b436b1b5b436c1b5b436d1b5b436e1b5b436f1c5b43882e5b43892e5b438a2e5b438b1c5b438c2e5b438d2e5b438e2e5b438f1c5b43902e5b43912e5b43922e5b43931c5b4394315b43b1315b43b2315b43b3315b43b4315b43b5315b43b6315b43b7315b43b8315b43b9315b43ba315b43bb315b43bc315b43bd315c43422e5c4344075c43450c5c43472e5c43481b5c4349025c4371"+
    "025c4372025c4373025c4374025c4375315d4342315d4343315d4344315d4345315d4346245d434e105d43512e5d43521b5d4355025d437b025d437c035d437d025d437e025d437f1b5d439f1b5d43a31b5d43a61b5d43b41f5d43bc1f5d43bd1f5d43be315e434d245e43582e5e435c025e4385025e4386025e4387025e4388025e4389255e439f1f5f43471f5f43481f5f43491f5f434a1f5f434b1f5f434c1f5f434d1f5f434e1f5f434f1c5f43621c5f43631c5f4366025f438f025f4390025f4391025f4392"+
    "255f43b91b5f43bd1b5f43be146043441b60434c1f6043511f6043521f6043531f6043541f6043551f6043571f6043581f6043591f60435a1f60435b1f60435c2e60436d2260436f2e6043701461434d1461434e1f61435b1f61435c1f61435d2561435e1f61435f1f6143601f6143611f6143621f6143631f6143641f6143651f6143661f6143671b6143711b6143762e614377226143792e61437a1b61437b14624358146243591462435e1b62435f1f6243641f6243651f6243661f6243671f6243681f624369"+
    "1f62436a1f62436b1f62436c1f62436d1f62436e1f62436f1f6243701f6243711b6243721c62437524624376246243772e6243781c6243791b62437a1c6243812e6243822e6243831c6243841b624388296243b8296243b9296243ba296243bb296243bc296243bd296243be286343422a6343432863434429634345296343462963434714634362146343682e63436e1f63436f1f6343701f6343711f6343721f6343731f6343741f6343751f6343761f6343771f634378256343791f63437a1c63437c2e63437d"+
    "2e63437e2763437f15634382276343832e6343842e6343851c6343861b63438d1b63438f296443451c6443461d6443471d6443481d6443491c64434a1d64434b1d64434c1d64434d1d64434e1d64434f1c644350296443511b64436a1464436c1464436d146443701b6443731f6443781f6443791f64437a1f64437b1f64437c1f64437d1f64437e2564437f1f6443801f6443811f6443821f6443831f6443842e644386076443870764438e0c64438f2e6443901d654350156543521e6543541d65435a1b654375"+
    "146543791465437a1465437b1f6543841f6543851f6543861f6543871f6543881f6543891f65438a1f65438b1f65438c1f65438d1f65438e1f65438f2e654390076543910c654393106543992e65439a2566435a1666435e1d66436414664385146643861b6643871f6643911f6643921f6643931f6643941f6643951f6643961f6643971f6643981c66439a2e66439b2e66439c1c66439d2e66439e2e66439f2e6643a01c6643a12e6643a22e6643a31c6643a41d6743641e6743681d67436e1b67438c1467438f"+
    "1b67439c1f6743a21b6743a91b6743ad1b6743b41b6743b72568436d1c68436e1d68436f1d6843701d6843711c6843721d6843781b6843991b6843ac1b6843ae1b6843b01b6843b51b6843b91b6843ba1b6843bd2569434b1d6943781d6943820a6943ba1b6943bc256a43481d6a43821d6a438c1d6b438c1d6b4396296c43951c6c43961d6c43971d6c43981d6c43991d6c439a1d6c439b1d6c439c1d6c439d1d6c439e1d6c439f1c6c43a0296c43a1296d439f296d43a0296d43a1286d43a22a6d43a3286d43a4"+
    "296d43a5296d43a6296d43a7296d43a8296d43a9296d43aa296d43ab256e43482a7043742a704376257143501c71437c2771437d2a71437e2a714380277143811c714382277243862772438c1b7343421b7343441b7343451b734346257343831c73438a2773438b1173438c1c73438d1173438e2773438f1c7343901c73439627734397117343981c7343991173439a2773439b1c73439c1b74434c1b74434d1b74434e1b74434f1b7443501b744351277443942e74439a1574439b1574439f2e7443a0277443a6"+
    "1b7543561b7543571b7543581b7543591b75435a1b75435b1175439e117543b01b7643601b7643611b7643621b7643631b7643641b764365117643a8117643ba1b77436a1b77436c1b77436d1b77436e277743b2277843471c7843bc277843bd117843be1c79434211794343277943441c7943451c79434b2779434c2479434d1c79434e1179434f277943501c794351277a434f277a4355117b4359117b435f1c7c43631c7c4369277d4368117d436d057d4370117d4373277e4377277e437d1b7f43801c7f4381"+
    "277f4382117f4383277f4384117f4385277f43861c7f43871681438f278143902a83439b2a8443962a8443992a84439c2a84439e1c8443a4258543a7268543a80a8543a92a8543ab1c8543ad1c8643b6258743470a87434f2a8843432b884349268843591c89434c0a8943510a89435525894363308a435d2b8b4364308b43660a8b4367308b43682b8b436a308c43712a8d43711c8d43740a8d43790a8d437d2a8e437e2b8e43851c8f43892a8f43941c9043941c90439d2a91439f2a9143a51c9143a6259143a9"+
    "169143ab2a9243aa1c9243ab2a9243ac1c9243ad1c9243ae299643b8289643b9289643ba289643bb289643bc289643bd289643be2897434228974343289743442997434529a7438d29a7438e29a7438f29a843971da8439829a8439929a943a127a943a229a943a329aa43ab27aa43ac29aa43ad29ab43b527ab43b629ab43b729ac438c29ad434227ad434329ad434428ad439629ae434c27ae434d29ae434e28ae43a029ae43b31cae43b429ae43b529af435627af435729af435828af43aa1caf43bc27af43bd"+
    "27b043421cb0434329b0436027b0436129b0436228b043b429b1434827b1434927b1434d29b1434e29b1436a1db1436b29b1436c28b143be1cb243521cb243551cb2435829b2437429b2437529b2437628b3434b29b3435c27b3435d27b3436129b3436228b443551cb4436727b4436827b4436a1cb4436b29b5435f29b543721cb5437329b543740fb743861cb7438704b843911b3d44471b3d44481b3d44491b3d444a1b3d444b1b3d444c1b3e44521b3e44531b3e44541b3e44551b3f445b1b3f445c1b3f445d"+
    "1b4044661b41447d1b41447e1b41447f1b4244871c4244881b4244891b42448e1b42448f1b4244901b4244911c4244ab1d4244ac1d4244ad254244ae1d4244af1c4244b01b4344911b4344921b4344971b4344981b4344991b43449a1b43449b1d4344b5144344b61d4344ba254344bd1b44449f1b4444a11b4444a21c4444a31b4444a41b4444a51d454442254544471b45449f1b4544a01b4544a81c4544a91b4544aa1b4544ab1b4544ac1b4544ad1b4544ae1b4544af1d46444c144644501d4644511b4644a9"+
    "1c4644aa1b4644ab1b4644b21b4644b31b4644b41b4644b61b4644b71b4644b81c474456144744571c47445b1b4744b31b4744b41d4844601d484465024844bb024844bc024844bd024844be1d49446a1449446b2549446f024a4448024a4449024a444a024a444b024a444c1b4a444d1b4a444e1b4a444f1b4a44501d4a44741d4a4479024b4452024b4453034b4454024b4455024b44561b4b44571b4b44581b4b44591b4b445a1c4b447e1d4b447f244b4480244b44811d4b44821c4b4483024c445c024c445d"+
    "024c445e024c445f024c44601b4c44611c4c44621b4c44631b4c4464164c448e024d4466024d4467024d4468024d4469024d446a1b4d446b1b4d446c1b4d446d1b4d446e1b4e44741b4e44751b4e44761b4e44771b4e44781b4f4488254f4497254f449a254f449d254f44a0254f44a31b5044801b5044911b5044921b5044931b5144891b51448a1b51448b1b51449c2a5244512a5244531b524494255344501c53445a1d53445b1153445c1d53445d1c53445e1b53449f1d5444641d5444682a5444691b5444a8"+
    "1c5444a91b5444aa1c55444c1d55444d1d55444e1d55444f1c5544501d5544511d5544521d5544531c5544541d5544551d5544561d5544571c5544581d55446e115544721b5544b31b5544b41d5644561d5644622a5644771d5644781d56447c2a56447d025644be025744421b5744431b5744441b5744451b5744461d5744602457446c115744821d5744861657448a0258444a0358444b0258444c1b58444d1b58444e1b58444f1b5844501b5844511d58446a245844762a58448b1d58448c1d5844901658449e"+
    "0259445402594455025944561b5944571b5944581c5944591b59445a1b59445b1d5944741d5944801c59449624594497245944981d5944991c59449a165944a32a5944ae2a5944b01b5a44611b5a44621b5a44631b5a44641b5a44651d5a447e1d5a448a1c5a44b71d5a44b8115a44b91d5a44ba1c5a44bb1b5b446c1b5b446d1b5b446e1b5b446f1c5b44881d5b4489255b448a1d5b448b1c5b448c1d5b448d255b448e1d5b448f1c5b44901d5b4491255b44921d5b44931c5b44941d5c44441d5c44482a5c4449"+
    "025c4472025c4473245d444e115d4452025d447c035d447d025d447e245e44581d5e445c2a5e445d025e4487255e449f1c5f44621c5f44631c5f4466255f44b91b5f44bd1160446d1d604470166044b31661445e2a6144761d6144771d61447a1b61447b16624450146244582a6244741c6244752462447624624477276244781c6244792a62447a1c624481116244821d6244831c6244842a634443146344620a63446e166344791c63447c1163447d2763447e2763447f15634482276344832763448411634485"+
    "1c6344862a63448b2a63448d296444451c6444461d6444471d6444481d6444491c64444a2964444b2964444c2964444d2964444e2964444f29644450296444511664447f27644486276444902965444f1d654450156544521d65445429654455296544562965445729654458296544591d65445a2965445b1465447a276544902765449a1d66445a1d66445e1d664464166644651c66449a2766449b2766449c1c66449d2766449e1166449f276644a01c6644a1276644a2276644a31c6644a41d6744641d674468"+
    "1d67446e2a6744a82a6744aa2568446d1c68446e1d68446f1d6844701d6844711c684472256844782569444b1d6944781d694482256944ba256a44481d6a44821d6a448c166b445f296b448b1d6b448c296b448d296b448e296b448f296b4490296b4491296b4492296b4493296b4494296b44951d6b4496296b4497166b44b1166c445c296c4495296c4496296c4497296c4498296c4499296c449a296c449b296c449c296c449d296c449e296c449f296c44a0296c44a12a6d44a3256e44482a7044742a704476"+
    "1b7044ab1c71447c2771447d2a71447e2a714480277144811c7144821b7144b51b7144b62a72447f2a7244802a7244812a7244822a7244832a7244842a724485277244862772448c2a72448d2a72448e2a72448f2a7244902a7244912a7244922a7244931b7344421b7344431b7344441b7344451b7344462573448316734485167344891c73448a2773448b1173448c1c73448d1173448e2773448f1c7344901c73449627734497117344981c7344991173449a2773449b1c73449c1b74444c1b74444d1b74444e"+
    "1b74444f1b7444501b744451277444942e74449a1574449b1574449f2e7444a0277444a61b7544561b7544571b7544581b7544591b75445a1b75445b1175449e117544b01b7644601b7644611b7644621b7644631b7644641b764465117644a8117644ba1b77446a1b77446c1b77446d1b77446e277744b2277844471c7844bc277844bd117844be1c79444211794443277944441c7944451c79444b2779444c2779444d1c79444e1179444f277944501c7944512a7a44482a7a44492a7a444a2a7a444b2a7a444c"+
    "2a7a444d2a7a444e277a444f277a44552a7a44562a7a44572a7a44582a7a44592a7a445a2a7a445b2a7a445c117b4459117b445f1c7c44631c7c4469257d4468117d446d117d4473277e4477277e447d017f447c1c7f4481277f4482117f4483277f4484117f4485277f44861c7f4487258144902a8444a4258544a91c8544ad2a8644b6258744472587444f2a89444c1689445b308a445d308b44662e8b4467308b4468308c44712a8d44742a8f44891c9044941c90449d2a9144a60a9144a9269144aa259144ab"+
    "2a9244ab2a9244ad1c9244ae29a7448e28a8449828a944a228aa44ac28ab44b628ad444328ae444d1cae44b428af44571caf44bc27af44bd27b044421cb0444328b0446127b1444927b1444d28b1446b1cb244521cb244551cb2445829b2447527b3445d27b344611cb4446727b4446827b4446a1cb4446b1cb544730fb744861cb744872fb7448804b844911b3d45471b3d45481b3d45491b3d454a1b3d454b1b3e45521b3e45531b3e45541b41457e2841459f294145a0294145a1294145a6294145a71b424587"+
    "1b4245881b424589284245a9284245aa1c4245ab1d4245ac1d4245ad254245ae1d4245af1c4245b0294245b11b4345921b4345981b4345991b43459a2a4345b32a4345b41d4345b51d4345ba284345bb254345bd164445421b44459f1b4445a21c4445a31b4445a4164445be1d4545421d4545472a4545481b4545a01b4545a81b4545a91b4545aa1b4545ad1d46454c1d464551284645521b4645a91b4645aa1b4645ab1b4645b31c4745561c47455b2947455c1b4745b41d4845601d484565284845661d49456a"+
    "1d49456f2a494570024a454a024a454b1b4a454d1b4a454e1b4a454f1b4a45502a4a45722a4a45731d4a45741d4a4579284a457a024b4553034b4554024b45551b4b45561b4b45571b4b45581b4b45591b4b455a284b457c284b457d1c4b457e1d4b457f1d4b45801d4b45811d4b45821c4b4583294b4584024c455d024c455e024c455f1b4c45601b4c45611c4c45621b4c45631b4c4564284c4586294c4587294c4588294c458d294c458e1b4d456a1b4d456b1b4d456c1b4d456d1b4d456e1b4e45741b4e4575"+
    "1b4e45761b4e45771b4e45782a4f4596254f4597284f4598284f4599254f459a284f459b284f459c254f459d284f459e284f459f254f45a0284f45a1284f45a2254f45a32a4f45a4285045a0285045a1285045a2285045a3285045a4285045a5285045a6285045a7285045a8285045a9285045aa285045ab285045ac285045ad285045ae2a5145aa2a5145ab2a5145ac2a5145ad2a5145ae2a5145af2a5145b02a5145b12a5145b22a5145b32a5145b42a5145b52a5145b62a5145b72a5145b82a52454f2a524555"+
    "25534550165345522a5345591c53455a1d53455b1d53455c1d53455d1c53455e2a53455f1b53459f165445472a5445631d5445641d5445682a5445691b5445a81b5445a91b5445aa1c55454c1d55454d1d55454e1d55454f1c5545501d5545511d5545521d5545531c5545541d5545551d5545561d5545571c5545582a55456d1d55456e1655456f1d5545722a5545731b5545b31d5645561d5645622a5645771d5645781d56457c2a56457d025645be1d5745601d57456c2a5745811d5745821d5745862a574587"+
    "0258454a0258454b0258454c1b58454e1b58454f1b5845501d58456a1d5845762a58458b1d58458c1d5845902a584591025945551b5945581c5945591b59455a1d5945741d5945802a5945951c5945961d5945971d5945981d5945991c59459a2a59459b2a5945ae2a5945b01b5a45631d5a457e1d5a458a2a5a459f2a5a45a51c5a45b71d5a45b8115a45b91d5a45ba1c5a45bb1c5b45881d5b4589255b458a1d5b458b1c5b458c1d5b458d255b458e1d5b458f1c5b45901d5b4591255b45921d5b45931c5b4594"+
    "1d5c45441d5c45482a5c4549025c45731d5d454e115d4552025d457c025d457d025d457e1d5e45581d5e455c2a5e455d025e45870a5e459f1c5f45621c5f45631c5f4566265f45a90a5f45b91d60456d1d604570256045b326614546166145761d614577166145791d61457a256245502a624571166245721c6245752762457627624577276245781c6245792a62457d1c6245811d6245821d6245831c6245842563456e2a63457b1c63457c2763457d2763457e2763457f15634582276345832763458427634585"+
    "1c6345862a6345872a63458a2a63458b2a63458c2a63458d2a63458e2a63458f1c6445461d6445471d6445481d6445491c64454a2a64458527644586276445902a6445912865454f1d654550156545521d65455428654555286545562865455728654558286545592865455a2865455b2a65458f2765459016654591166545992765459a2a65459b286645591d66455a1d66455e2766455f2766456027664561276645622766456327664564276645652a6645991c66459a2766459b2766459c1c66459d2766459e"+
    "1166459f276645a01c6645a1276645a2276645a31c6645a42a6645a5286745631d6745641d674568286745692867456a2867456b2867456c2867456d1d67456e2867456f2a6745a32a6745a82a6745aa2a6745af2568456d1c68456e1d68456f1d6845701d6845711c68457228684573286845742868457528684576286845771d684578286845790a69454b286945771d694578286945792869457a2869457b2869457c2869457d2869457e2869457f28694580286945811d69458228694583256945ba0a6a4548"+
    "266a4555286a4581276a4582276a4583276a4584276a4585276a4586276a4587276a4588276a4589276a458a276a458b276a458c276a458d266b4552256b455f286b458b286b458c286b458d286b458e286b458f286b4590286b4591286b4592286b4593286b4594286b4595286b4596286b4597256b45b1166c4551256c455c266c45bb0a6e45481b7045ab1c71457c2771457d2771457e2771457f27714580277145811c7145821b7145b51b7145b62a72457f2a7245802a7245812a7245822a7245832a724584"+
    "2a724585277245862772458c2a72458d2a72458e2a72458f2a7245902a7245912a7245922a7245931b7345421b7345430a7345832673458425734585287345892973458a2873458b2873458c2873458d2873458e2973458f1c7345901c7345962973459728734598287345992873459a2873459b2973459c2873459d1b74454c1b74454d1b74454f297445932774459429744595297445962974459729744598297445992e74459a1574459b1574459f2e7445a0297445a1297445a2297445a3297445a4297445a5"+
    "277445a6297445a71b7545561b7545571b7545581b7545591b75455a2775459e277545b01b7645601b7645611b764563277645a8277645ba1b77456a297745b1277745b2297745b3297745b4297745b5297745b6297745b70a7745b80a7745be29784542297845432978454429784545297845462778454729784548287845bb297845bc287845bd287845be2879454228794543297945441c7945451c79454b2979454c2879454d2879454e2879454f2879455029794551287945522a7a45482a7a45492a7a454a"+
    "2a7a454b2a7a454c2a7a454d2a7a454e277a454f277a45552a7a45562a7a45572a7a45582a7a45592a7a455a2a7a455b2a7a455c277b4559277b455f1c7c45631c7c4569257d4568277d456d277d4573277e4577277e457d257f457c1c7f4581277f4582277f4583277f4584277f4585277f45861c7f4587258145902a8545ad0a874547268845512589455b308a455d308b4566308b4567308b4568308c45712a9045942a90459d259145a92a9245ae1cae45b41caf45bc27af45bd27b045421cb0454327b14549"+
    "27b1454d1cb245521cb245551cb2455827b3455d27b345611cb4456727b4456827b4456a1cb4456b1cb545732fb745812fb745832fb745850fb745861cb745870fb745880fb745890fb7458a0fb7458b0fb7458c0fb7458d04b845911b3d4649294146a1294146a2294146a5294146a6294246ab1d4246ac1d4246ad1d4246ae1d4246af294246b01b4346992a4346b32a4346b4294346b5294346b6294346b9294346ba0a4346bd264346be254446421b4446a21b4446a31b4446a4284446bd284446be29454642"+
    "2945464329454646294546472a4546481b4546ad2846464a2946464b2746464c2946464d29464650294646512a4746542947465527474656294746572947465a2947465b2848465e2948465f2748466029484661294846642948466528494668284946692949466a2949466b2949466e2949466f2a494670024a464a2a4a46722a4a4673294a4674294a4675294a4678294a4679024b4653024b4654024b46551b4b4658294b467e1d4b467f1d4b46801d4b46811d4b4682294b4683024c465e1b4c46611c4c4662"+
    "1b4c4663294c4688294c4689294c468c294c468d1b4d466b1b4d466c2a4f46962a4f46972a4f469a2a4f469d2a4f46a02a4f46a32a4f46a42a5146aa2a5146ab2a5146ac2a5146ad2a5146ae2a5146af2a5146b02a5146b12a5146b22a5146b32a5146b42a5146b52a5146b62a5146b72a5146b82a52464f28524650275246512852465227524653285246542a524655285246b4285246b5285246b6285246b7285246b8285246b9285246ba285246bb285246bc285246bd285246be285346422853464328534644"+
    "285346450a53465026534651255346522a5346592853465a2753465b1d53465c2753465d2853465e2a53465f295346be29544642295446432954464429544645295446462954464729544648295446492954464a2954464b2954464c2954464d2954464e2954464f2a54466328544664275446652854466627544667285446682a5446692955464b1c55464c1d55464d1d55464e1d55464f1c5546501d5546511d5546521d5546531c5546541d5546551d5546561d5546571c554658295546592a55466d2855466e"+
    "2755466f2855467027554671285546722a5546731d5646561d5646622a56467728564678275646792856467a2756467b2856467c2a56467d1d5746601d57466c2a57468128574682275746832857468427574685285746862a5746871b58464f1d58466a1d5846762a58468b2858468c2758468d2858468e2758468f285846902a5846911b5946581b5946591b59465a1d5946741d5946802a59469528594696275946971d594698275946992859469a2a59469b295946ac295946ad295946ae285946af295946b0"+
    "295946b1295946b21b5a46631d5a467e1d5a468a2a5a469f285a46a0275a46a1285a46a2275a46a3285a46a42a5a46a5295a46b61c5a46b71d5a46b81d5a46b91d5a46ba1c5a46bb295a46bc295b46871c5b46881d5b46891d5b468a1d5b468b1c5b468c1d5b468d1d5b468e1d5b468f1c5b46901d5b46911d5b46921d5b46931c5b4694295b46952a5c46431d5c46441d5c4648295c4691295c4692285c46932a5c4694285c4695295c4696285c46972a5c4698285c4699295c469a285c469b2a5c469c285c469d"+
    "295c469e295c469f115d464e1d5d46522a5e46571d5e46581d5e465c255e469f295f46611c5f46621c5f46631c5f46641c5f46651c5f4666295f4667255f46b92960466b2760466c2760466d2760466e2760466f27604670286046712961466b2861466c2a61466d2861466e2961466f276146762761467727614678276146792761467a2761467b2a6246712862467227624673286246741c6246752762467627624677276246781c6246792862467a2762467b2862467c2a62467d286246802862468128624682"+
    "2862468328624684286246851663466c2563466e2a63467b2863467c2763467d2763467e2763467f286346802863468115634682276346832763468427634685286346862a6346872a63468a2a63468b2a63468c2a63468d2a63468e2a63468f1c6446461d6446471d6446481d6446491c64464a2a644685286446862764468728644688286446892864468a2864468b2864468c2864468d2864468e2764468f286446902a6446911d654650156546521d6546542a65468f28654690276546912865469228654693"+
    "2865469428654695286546962865469728654698276546992865469a2a65469b1d66465a1d66465e2a6646992866469a2766469b2766469c1c66469d2766469e2766469f276646a01c6646a1276646a2276646a3286646a42a6646a5286746631d6746641d674668286746692867466a2867466b2867466c2867466d2867466e2867466f2a6746a3286746a4276746a5286746a6296746a7286746a82a6746a9286746aa296746ab286746ac276746ad286746ae2a6746af2868466d1c68466e1d68466f1d684670"+
    "1d6846711c684672286846732868467428684675286846762868467728684678286846792569464b2869467728694678286946792869467a2869467b2869467c2869467d2869467e2869467f286946802869468128694682286946830a6946ba256a4648266b4647256c4651256e46482a70467116704672167046782a7046791b7046ab2a71467b1c71467c2771467d2771467e1171467f27714680277146811c7146822a7146831b7146b51b7146b62a724685277246862772468c2a72468d1b7346421b734643"+
    "257346832a73468f1c7346900a7346910a7346951c7346962a7346971b74464c1b74464d297446932974469429744695297446962974469729744698277446992e74469a1574469b1574469f2e7446a0277446a1297446a2297446a3297446a4297446a5297446a6297446a71b7546562975469d2775469e2975469f297546a0297546a1297546a2297546a30a7546a40a7546aa297546ab297546ac297546ad297546ae297546af277546b0297546b1297646a7277646a8297646a9297646aa297646ab297646ac"+
    "297646ad0a7646ae0a7646b4297646b5297646b6297646b7297646b8297646b9277646ba297646bb297746b1297746b2297746b3297746b4297746b5297746b6277746b72e7746b82e7746be277846422978464329784644297846452978464629784647297846482a7946441c7946450a7946460a79464a1c79464b2a79464c2a7a464e277a464f277a46552a7a46562a7b46542a7b4658277b4659277b465f2a7b4660297c465e2a7c46621c7c4663297c4664297c46681c7c46692a7c466a297d4667277d4668"+
    "297d46692a7d466c277d466d277d46732a7d4674287e46722a7e4676277e4677297e4678297e467c277e467d2a7e467e277f467c2a7f46801c7f4681277f4682277f4683277f4684277f4685277f46861c7f46872a7f4688288046862a80468a2a8046922881468f27814690288146912982469a2a8346a4258746472aad46a92aad46aa2aad46ab2aae46b21cae46b42aae46b62aaf46bb1caf46bc27af46bd29af46be27b046421cb046432ab046442ab1464727b1464927b1464d2ab1464f2ab246511cb24652"+
    "29b246531cb2465529b246571cb246582ab246592ab3465b27b3465d1cb3465f27b346612ab346632ab446661cb4466727b446681cb4466927b4466a1cb4466b2ab4466c2ab546711cb546732ab546751cb6467d2ab746801cb746811cb746821cb746831cb746841cb746851cb746861cb746871cb746881cb746891cb7468a1cb7468b1cb7468c1cb7468d2ab7468e04b8468b04b8468c04b8468d04b8468e04b8468f04b8469004b8469104b8469204b8469304b8469404b8469504b8469604b84697294147a2"+
    "294147a3294147a4294147a5294247ac1d4247ad1d4247ae294247af294347b6294347b7294347b8294347b9254347bd294547432945474429454745294547462946474d2946474e2946474f294647502a4747542a4747552a4747562947475729474758294747592947475a294847612948476229484763294847642949476b2949476c2949476d2949476e294a4775294a4776294a4777294a47781b4b4758294b477f1d4b47801d4b4781294b47821b4c47611b4c47621b4c4763294c4789294c478a294c478b"+
    "294c478c1b4d476c2a524752255347502a53475c2a5447662955474b2955474c2955474d2955474e2955474f295547502955475129554752295547532955475429554755295547562955475729554758295547592a554770295647551d5647562856475728564758285647592856475a2856475b2856475c2856475d2856475e2856475f28564760285647611d564762295647632a56477a1d5747601d57476c1657476d2a5747842558476a255847762a58478e1d5947741d5947802a5947982a5947af295a477d"+
    "1d5a477e285a477f285a4780285a4781285a4782285a4783285a4784285a4785285a4786285a4787285a4788285a47891d5a478a295a478b2a5a47a2295a47b6295a47b7295a47b8295a47b9295a47ba295a47bb295a47bc295b4787295b4788295b4789295b478a295b478b295b478c295b478d295b478e295b478f295b4790295b4791295b4792295b4793295b4794295b4795295c47431d5c4744295c4745295c4746295c47471d5c4748295c47492a5c47942a5c47982a5c479c1d5d474e165d47501d5d4752"+
    "295e47571d5e4758295e4759295e475a295e475b1d5e475c295e475d295f4761295f4762295f4763295f4764295f4765295f4766295f47672a60476c2a60476d2a60476e2a60476f2a6047702a6047711c61476b1d61476c1d61476d1d61476e1c61476f2a6247741d62477507624776076247771d6247792a62477a296247bb2563476c2663476d0a63476e2a63477e1d63477f1d6347832a6347841c6447461d6447471d6447481d6447491c64474a2a6447881d6447891d64478d2a64478e1d65475015654752"+
    "1d6547542a6547921d65479322654794226547961d6547972a654798296647591d66475a1d66475e2966475f2a66479c1d66479d2266479e226647a01d6647a12a6647a21d6747641d6747682a6747a61c6747a71d6747a81d6747a91d6747aa1c6747ab2a6747ac1c68476e1d68476f1d6847701d6847711c6847722969477a256947ba2a704771287047722970477329704777287047782a7047792a71477b2771477c2771477d2771477e1171477f2771478027714781277147822a7147832a72478528724786"+
    "277247872772478b2872478c2a72478d1b7347422a73478f1c7347902e7347910a7347920a7347942e7347951c7347962a7347972a7447992e74479a1574479b1574479f2e7447a02a7447a12975479d2975479e2975479f297547a0297547a1297547a2297547a32e7547a42e7547aa297547ab297547ac297547ad297547ae297547af297547b0297547b1297647a7297647a8297647a9297647aa297647ab297647ac297647ad2e7647ae2e7647b4297647b5297647b6297647b7297647b8297647b9297647ba"+
    "297647bb2a7747b72e7747b82e7747be2a7847422a7947441c7947452e7947460a7947470a7947492e79474a1c79474b2a79474c2a7a474e287a474f277a4750277a4754287a47552a7a47562a7b47542a7b4758287b4759277b475a277b475e287b475f2a7b47602a7c475e2a7c4762287c4763277c4764277c4768287c47692a7c476a257d4767257d4768257d47692a7d476c287d476d277d476e277d4772287d47732a7d4774297e47722a7e4776287e4777277e4778297e4779297e477b277e477c287e477d"+
    "2a7e477e2a7f4780297f4781277f4782277f4783277f4784277f4785277f4786297f47872a7f4788298047862a80478a2880478b2980478c29804790288047912a8047922581478f25814790258147912a82479a2a8347a42aad47aa2aae47b228ae47b329ae47b428ae47b52aae47b62aaf47bb27af47bc27af47bd27af47be27b0474227b047432ab0474428b1474827b1474927b1474d28b1474e2ab2475129b2475227b247531cb2475527b2475729b247582ab2475928b3475c27b3475d27b3476128b34762"+
    "2ab4476627b4476727b4476827b4476927b4476a27b4476b2ab4476c2ab5477128b5477229b5477328b547742ab547750fb747810fb747820fb747830fb747840fb747850fb747861cb747870fb747882fb747892fb7478b2fb7478d04b84791294148a3294148a4294248ad294248ae294348b7294348b829454844294548452946484e2946484f294748582947485929484862294848632949486c2949486d294a4876294a4877294b4880294b4881294c488a294c488b28564855285648562856485728564858"+
    "285648592856485a2856485b2856485c2856485d2856485e2856485f285648602856486128564862285648632857485f275748602757486127574862275748632757486427574865275748662757486727574868275748692757486a2757486b2757486c2857486d285848691d58486a2858486b2858486c2858486d2858486e2858486f2858487028584871285848722858487328584874285848751d58487628584877285948732759487427594875275948762759487727594878275948792759487a2759487b"+
    "2759487c2759487d2759487e2759487f2759488028594881285a487d285a487e285a487f285a4880285a4881285a4882285a4883285a4884285a4885285a4886285a4887285a4888285a4889285a488a285a488b295c4843295c4844295c4845295c4846295c4847295c4848295c4849295d484d1d5d484e275d484f275d4850275d48511d5d4852295d4853295e4857295e4858295e4859295e485a295e485b295e485c295e485d2a6048622a6048641c61486b1d61486c1161486d1d61486e1c61486f2a6148b1"+
    "1d6248751d6248792a6248b9296248ba1c6248bb296248bc2a6248bd2563486e1d63487f1d6348832a6448451d6448461d6448471d6448481d6448491d64484a2a64484b1d6448891d64488d2965484f1d6548501d654851156548521d6548531d654854296548551d6548931d6548972a6648581c6648591d66485a1d66485b1d66485c1d66485d1d66485e1c66485f2a6648601d66489d1d6648a1296748631d6748641d6748651d6748661d6748671d674868296748691c6748a71d6748a8116748a91d6748aa"+
    "1c6748ab2a68486d1d68486e1d68486f1d6848701d6848711d6848722a6848732a6848b22a6848b42a694878296948791c69487a2969487b2a69487c2a6a4884297048732970487429704876297048772971487d2771487e2771487f277148802971488129724887297248882972488a2972488b1c7348902e7348912e7348920a7348932e7348942e7348951c7348962e74489a1574489b1574489f2e7448a02e7548a42e7548aa2e7648ae2e7648b42e7748b82e7748be1c7948452e7948462e7948470a794848"+
    "2e7948492e79484a1c79484b297a4850297a4851297a4853297a4854297b485a297b485b297b485d297b485e297c4864297c4865297c4867297c4868257d4868297d486e297d486f297d4871297d4872297e4878277e4879297e487a277e487b297e487c297f4882277f4883277f4884277f4885297f48862980488c2980488d2980488f29804890258148902aaf48bd29af48be2ab048422ab1484928b1484a29b1484b28b1484c2ab1484d29b2485329b2485429b2485629b248572ab3485d28b3485e29b3485f"+
    "28b348602ab3486128b4486829b448692ab4486a2fb748861cb748870fb7488804b848912a5849692a58496a2a58496b2a58496c2a58496d2a58496e2a58496f2a5849702a5849712a5849722a5849732a5849742a5849752a5849762a584977295d494d285d494e285d494f285d4950285d4951285d4952295d495329604960296049612a6049622a60496429604965296049662961496a1c61496b1d61496c1161496d1d61496e1c61496f296149702a6149b02a6149b12a6149b2296249741d6249751d624979"+
    "2962497a2a6249b92a6249ba2a6249bc2a6249bd2963497e1d63497f1d634983296349842a6449451c6449461c64494a2a64494b296449881d6449891d64498d2964498e2a65494e2a65494f2a6549552a654956296549921d6549931d654997296549982a6649582a6649602966499c1d66499d1d6649a1296649a22a6749622a6749632a6749692a67496a296749a61c6749a71d6749a8116749a91d6749aa1c6749ab296749ac2a68496d1c68496e1c6849722a684973296849b0296849b12a6849b22a6849b4"+
    "296849b5296849b62a6949782a6949792a69497b2a69497c2a6a49832a6a49842a6a49852970497429704975297049762971497e2771497f2971498029724988277249892972498a1c7349902e7349912e7349922e7349932e7349942e7349951c7349962e74499a1574499b1574499f2e7449a0117549a4117549aa117649ae117649b42e7749b82e7749be1c7949452e7949462e7949472e7949482e7949492e79494a1c79494b297a4951277a4952297a4953297b495b277b495c297b495d297c4965277c4966"+
    "297c4967167d4968297d496f277d4970297d4971297e4979277e497a297e497b297f4983277f4984297f49852980498d2980498e2980498f168149902ab1494b2ab2495428b249552ab249562ab3495f1cb749870fb7498804b8499129604a6129604a6229604a6429604a6529614a6b1d614a6c1d614a6d1d614a6e29614a6f29624a7529624a7629624a7829624a7929634a7f29634a8029634a8229634a831c644a461c644a4a29644a8929644a8a16644a8b29644a8c29644a8d29654a9329654a9429654a96"+
    "29654a9729664a9d29664a9e29664aa029664aa129674aa71d674aa81d674aa91d674aaa29674aab1c684a6e1c684a7229684ab129684ab229684ab429684ab528704a7528714a7f28724a891c734a902e734a912e734a922e734a932e734a942e734a951c734a962e744a9a15744a9b15744a9f2e744aa011754aa411754aaa11764aae11764ab42e774ab82e774abe1c794a452e794a462e794a472e794a482e794a492e794a4a1c794a4b287a4a52287b4a5c287c4a66287d4a70287e4a7a287f4a8428804a8e"+
    "2fb74a861cb74a870fb74a8804b84a9129604b6229604b6329604b6429614b6c1d614b6d29614b6e29624b7627624b7729624b782a624bb82a624bbe29634b8027634b8129634b821c644b461c644b4a29644b8a27644b8b29644b8c29654b9427654b9529654b9629664b9e27664b9f29664ba029674ba81d674ba929674baa1c684b6e1c684b7229684bb229684bb329684bb42a694b772a694b7d29724b8629724b8929724b8c29734b8f1c734b902e734b912e734b922e734b932e734b942e734b951c734b96"+
    "29734b972e744b9a15744b9b1d744b9c1d744b9d1d744b9e15744b9f2e744ba02e754ba41d754ba51d754ba61d754ba71d754ba81d754ba92e754baa2e764bae1d764baf1d764bb01d764bb11d764bb21d764bb32e764bb42e774bb81d774bb91d774bba1d774bbb1d774bbc1d774bbd2e774bbe29794b441c794b452e794b462e794b472e794b482e794b492e794b4a1c794b4b29794b4c297a4b4f297a4b52297a4b551cb74b870fb74b8804b84b9129604c6328614c6d28624c772a624cb829624cb928624cba"+
    "28624cbb28624cbc29624cbd2a624cbe28634c8129644c4527644c4629644c4729644c4927644c4a29644c4b28644c8b28654c4f29654c5029654c5428654c5528654c9528664c5928664c5f28664c9f28674c6329674c6429674c6828674c6928674ca929684c6d27684c6e29684c6f29684c7127684c7229684c7329684cb32a694c7729694c7828694c7928694c7a28694c7b29694c7c2a694c7d1c724c862a724c872a724c881c724c892a724c8a2a724c8b1c724c8c1c734c8f1c734c9025734c912a734c92"+
    "2a734c932a734c9425734c951c734c961c734c972a744c9925744c9a25744ca02a744ca12a754ca32a754ca42a754caa2a754cab2a764cad2a764cae2a764cb42a764cb52a774cb725774cb825774cbe2a784c421c794c441c794c4525794c462a794c472a794c482a794c4925794c4a1c794c4b1c794c4c1c7a4c4f2a7a4c502a7a4c511c7a4c522a7a4c532a7a4c541c7a4c552fb74c861cb74c870fb74c8804b84c912a624dba29624dbb2a624dbc28644d4627644d4729644d4827644d4928644d4a2a654d4f"+
    "27654d5027654d5128654d5227654d5327654d542a654d5529664d5929664d5a28664d5b16664d5c28664d5d29664d5e29664d5f2a674d6327674d6427674d6528674d6627674d6727674d682a674d6928684d6e27684d6f29684d7027684d7128684d722a694d7929694d7a2a694d7b2a724d8628724d892a724d8c2a734d8f1c734d9025734d9125734d951c734d962a734d9725744d9a25744da025774db825774dbe2a794d441c794d4525794d4625794d4a1c794d4b2a794d4c2a7a4d4f287a4d522a7a4d55"+
    "2ab74d872a644e4828654e5127654e5228654e532a664e5a27664e5b28664e5c27664e5d2a664e5e28674e6527674e6628674e672a684e701c734e9025734e9125734e951c734e9625744e9a25744ea025774eb825774ebe1c794e4525794e4625794e4a1c794e4b2a664f5c2a724f852a724f8d2a734f8f1c734f9025734f9125734f951c734f962a734f972a744f9925744f9a25744fa02a744fa12a754fa32a754fab2a764fad2a764fb52a774fb725774fb825774fbe2a784f422a794f441c794f4525794f46"+
    "25794f4a1c794f4b2a794f4c2a7a4f4e2a7a4f562a7250852872508629725087287250882a7250892872508a2972508b2872508c2a72508d2a73508f2873509029735091287350922a7350932873509429735095287350962a7350972a7450992874509a2974509b2874509c2a74509d2874509e2974509f287450a02a7450a12a7550a3287550a4297550a5287550a62a7550a7287550a8297550a9287550aa2a7550ab2a7650ad287650ae297650af287650b02a7650b1287650b2297650b3287650b42a7650b5"+
    "2a7750b7287750b8297750b9287750ba2a7750bb287750bc297750bd287750be2a7850422a7950442879504529795046287950472a795048287950492979504a2879504b2a79504c2a7a504e287a504f297a5050287a50512a7a5052287a5053297a5054287a50552a7a50562a725188287251892a72518a2a735192287351932a7351942a74519c2874519d2a74519e2a7551a6287551a72a7551a82a7651b0287651b12a7651b22a7751ba287751bb2a7751bc2a795147287951482a7951492a7a5151287a5152"+
    "2a7a5153";
    for (let i = 0; i < D.length; i += 8) {
      const pi = parseInt(D.substr(i,2),16);
      const x = parseInt(D.substr(i+2,2),16) - 128;
      const y = parseInt(D.substr(i+4,2),16) - 64;
      const z = parseInt(D.substr(i+6,2),16) - 128;
      b(x, y, z, PAL[pi]);
    }
  }

function giveTacticsHorn(player) {
  const inv = player.getComponent(EntityInventoryComponent8.componentId);
  if (!inv?.container) return;
  const container = inv.container;
  for (let i = 0; i < container.size; i++) {
    const slot = container.getItem(i);
    if (slot?.typeId === "kingdoms:tactics_horn") {
      notifyPlayer(player.name, "\xA7eYou already have a Tactics Horn.");
      return;
    }
  }
  for (let i = 0; i < container.size; i++) {
    if (!container.getItem(i)) {
      container.setItem(i, new ItemStack6("kingdoms:tactics_horn", 1));
      notifyPlayer(player.name, "\xA7a\u{1F4EF} Tactics Horn added to your inventory. Right-click to command your troops!");
      return;
    }
  }
  notifyPlayer(player.name, "\xA7cInventory full \u2014 make room and try again.");
}
function giveFormationHorn(player) {
  const inv = player.getComponent(EntityInventoryComponent8.componentId);
  if (!inv?.container) return;
  const container = inv.container;
  for (let i = 0; i < container.size; i++) {
    const slot = container.getItem(i);
    if (slot?.typeId === "kingdoms:formation_horn") {
      notifyPlayer(player.name, "\xA7eYou already have a Formation Horn.");
      return;
    }
  }
  for (let i = 0; i < container.size; i++) {
    if (!container.getItem(i)) {
      container.setItem(i, new ItemStack6("kingdoms:formation_horn", 1));
      notifyPlayer(player.name, "\xA7a\u{1F3BA} Formation Horn added to your inventory. Right-click to signal your troops!");
      return;
    }
  }
  notifyPlayer(player.name, "\xA7cInventory full \u2014 make room and try again.");
}
var HORN_SEARCH_RADIUS = 48;
var HORN_PULSE_PARTICLE = "minecraft:critical_hit_emitter";
function triggerFormationHorn(player) {
  const dim = player.dimension;
  const loc = player.location;
  const allTypes = [...new Set(Object.values(FORMATION_TARGETS).flat())];
  const respondingTroops = [];
  for (const entityType of allTypes) {
    try {
      const entities = dim.getEntities({ type: entityType, location: loc, maxDistance: HORN_SEARCH_RADIUS });
      for (const e of entities) {
        if (e.getDynamicProperty("kc:owner") === player.name) {
          respondingTroops.push(e);
        }
      }
    } catch {}
  }
  if (respondingTroops.length === 0) {
    notifyPlayer(player.name, `\xA7eNo deployed troops in range to signal (${HORN_SEARCH_RADIUS} blocks).`);
    return;
  }
  try {
    player.playSound("raid.horn", { volume: 1.2, pitch: 0.9 });
  } catch {}
  for (const troop of respondingTroops) {
    try {
      const tLoc = troop.location;
      dim.spawnParticle(HORN_PULSE_PARTICLE, { x: tLoc.x, y: tLoc.y + 1.5, z: tLoc.z });
      dim.spawnParticle(HORN_PULSE_PARTICLE, { x: tLoc.x + 0.4, y: tLoc.y + 0.8, z: tLoc.z });
      dim.spawnParticle(HORN_PULSE_PARTICLE, { x: tLoc.x - 0.4, y: tLoc.y + 0.8, z: tLoc.z });
    } catch {}
  }
  notifyPlayer(
    player.name,
    `\xA76\u{1F3BA} \xA7eFormation Horn sounded! \xA7f${respondingTroops.length}\xA7e troop${respondingTroops.length > 1 ? "s" : ""} acknowledged \u2014 rallying in 2 seconds\u2026`
  );
  system6.runTimeout(() => {
    const n = applyFormation(player, "all_rally");
    if (n > 0) {
      notifyPlayer(player.name, `\xA7a\u{1F514} \xA7f${n}\xA7a troop${n > 1 ? "s" : ""} are marching to rally point!`);
    }
  }, 40);
}
async function showPickUpTroopsForm(player, village) {
  const t = village.troops;
  const hk = t.heavyKnight ?? 0;
  const sm2 = t.samurai ?? 0;
  const ml2 = t.mercenaryLancer ?? 0;
  const lg2 = t.legionary ?? 0;
  const cle2 = t.cavalryLancerElite ?? 0;
  const total = t.cityGuards + t.spearmen + t.archers + t.cavalry + hk + sm2 + ml2 + lg2 + cle2;
  if (total === 0) {
    notifyPlayer(player.name, `\xA7cNo troops stationed in \xA7b${village.name}\xA7c to pick up.`);
    return;
  }
  const entries = [
    { key: "cityGuards", label: "City Guards", count: t.cityGuards },
    { key: "spearmen", label: "Spearmen", count: t.spearmen },
    { key: "archers", label: "Archers", count: t.archers },
    { key: "cavalry", label: "Cavalry", count: t.cavalry },
    { key: "heavyKnight", label: "Heavy Knights", count: hk },
    { key: "samurai", label: "Samurai", count: sm2 },
    { key: "mercenaryLancer", label: "Mercenary Lancers", count: ml2 },
    { key: "legionary", label: "Legionaries", count: lg2 },
    { key: "cavalryLancerElite", label: "Cavalry Lancer Elite", count: t.cavalryLancerElite ?? 0 }
  ].filter((e) => e.count > 0);
  const form = new ModalFormData().title(`\u2694 Pick Up Troops \u2014 ${village.name}`);
  for (const e of entries) {
    form.slider(`${e.label} (${e.count} stationed)`, 0, e.count, 1, 0);
  }
  const response = await form.show(player);
  if (response.canceled) return;
  const values = response.formValues;
  const pickup = {
    cityGuards: 0,
    spearmen: 0,
    archers: 0,
    cavalry: 0,
    heavyKnight: 0,
    samurai: 0,
    mercenaryLancer: 0,
    legionary: 0,
    cavalryLancerElite: 0
  };
  entries.forEach((e, i) => {
    pickup[e.key] = values[i] ?? 0;
  });
  pickupTroops(player, village, pickup);
}
async function showReturnTroopsForm(player, village) {
  const carried = countTroopTokens(player);
  const hkCarried = carried.heavyKnight ?? 0;
  const smCarried = carried.samurai ?? 0;
  const mlCarried = carried.mercenaryLancer ?? 0;
  const lgCarried = carried.legionary ?? 0;
  const cleCarried = carried.cavalryLancerElite ?? 0;
  const total = carried.cityGuards + carried.spearmen + carried.archers + carried.cavalry + hkCarried + smCarried + mlCarried + lgCarried + cleCarried;
  if (total === 0) {
    notifyPlayer(player.name, "\xA7cYou are not carrying any troops.");
    return;
  }
  const form = new ActionFormData3().title(`Return Troops \u2014 ${village.name}`).body(
    `\xA77Return all carried troops to this barracks.

\xA7fCarrying:
  Guards: ${carried.cityGuards}
  Spearmen: ${carried.spearmen}
  Archers: ${carried.archers}
  Cavalry: ${carried.cavalry}
  Heavy Knights: ${hkCarried}
  Samurai: ${smCarried}
  Mercenary Lancers: ${mlCarried}
  Legionaries: ${lgCarried}
  Cavalry Lancer Elite: ${cleCarried}

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
    village.troops[info.troopType] = (village.troops[info.troopType] ?? 0) + slot.amount;
    container.setItem(i, void 0);
  }
  saveVillage(village);
  notifyPlayer(player.name, `\xA7a${total} troops returned to \xA7b${village.name}\xA7a barracks.`);
}
async function showTrainTroopsForm(player, village) {
  const tick = getCurrentTick();
  const queueCount = village.trainingQueue?.length ?? 0;
  const troopTypes = [
    "cityGuards",
    "spearmen",
    "archers",
    "cavalry",
    "heavyKnight",
    "samurai",
    "mercenaryLancer",
    "legionary",
    "cavalryLancerElite"
  ];
  const makeCostLine = (type) => {
    const c = TRAINING_COSTS[type];
    const secs = Math.ceil(TRAINING_TICKS[type] / 20);
    const parts = [`${c.emeralds} emeralds`, `${c.iron} iron`];
    if (c.gold > 0) parts.push(`${c.gold} gold`);
    if (c.diamonds > 0) parts.push(`${c.diamonds} diamonds`);
    return `${parts.join(", ")} | ~${secs}s/unit`;
  };
  const rs = village.resourceStorage;
  const queueSummary = getTrainingQueueSummary(village, tick);
  const hkAvailable = village.barracksLevel >= 3;
  const castleAvailable = village.hasCastle ?? false;
  const playerVillages = getAllVillages().filter((v) => v.owner === player.name);
  const eliteAvailable = castleAvailable;
  const eliteLockMsg = !castleAvailable ? "\u{1F512} needs Castle" : "";
  const form = new ActionFormData3().title(`Train Troops \u2014 ${village.name}`).body(
    `\xA77\u2500\u2500 Resources \u2500\u2500
Treasury: \xA7f${village.treasury}\u{1F48E}  \xA77Iron: \xA7f${rs.iron}  \xA77Gold: \xA7f${rs.gold}  \xA77Di: \xA7f${rs.diamonds}

\xA77\u2500\u2500 Queue (${queueCount}/10) \u2500\u2500
${queueSummary}

\xA77Select a troop type to queue training:`
  ).button(`City Guard
\xA77${makeCostLine("cityGuards")}`).button(`Spearman
\xA77${makeCostLine("spearmen")}`).button(`Archer
\xA77${makeCostLine("archers")}`).button(`Cavalry
\xA77${makeCostLine("cavalry")}`).button(hkAvailable ? `Heavy Knight
\xA77${makeCostLine("heavyKnight")}` : `\xA77Heavy Knight (\u{1F512} Barracks Lv3 needed)
\xA77${makeCostLine("heavyKnight")}`).button(eliteAvailable ? `\u2B50 Samurai
\xA77${makeCostLine("samurai")}` : `\xA77Samurai (${eliteLockMsg})
\xA77${makeCostLine("samurai")}`).button(eliteAvailable ? `\u2B50 Mercenary Lancer
\xA77${makeCostLine("mercenaryLancer")}` : `\xA77Mercenary Lancer (${eliteLockMsg})
\xA77${makeCostLine("mercenaryLancer")}`).button(eliteAvailable ? `\u2B50 Legionary
\xA77${makeCostLine("legionary")}` : `\xA77Legionary (${eliteLockMsg})
\xA77${makeCostLine("legionary")}`).button(eliteAvailable ? `\u2B50 Cavalry Lancer Elite
\xA77${makeCostLine("cavalryLancerElite")}` : `\xA77Cavalry Lancer Elite (${eliteLockMsg})
\xA77${makeCostLine("cavalryLancerElite")}`).button("Back");
  const response = await form.show(player);
  if (response.canceled || response.selection === 9) return;
  const selectedType = troopTypes[response.selection];
  const countForm = new ModalFormData().title(`Train ${TROOP_LABELS[selectedType]}`).slider(`How many to train? (cost x N)`, 1, 20, 1, 1);
  const countResponse = await countForm.show(player);
  if (countResponse.canceled || countResponse.formValues == null) return;
  const count = countResponse.formValues[0];
  queueTraining(village, selectedType, count, tick, playerVillages.length);
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
  const form = new ActionFormData3().title(`${village.name} \u2014 Market Lv${village.marketLevel}`).body(
    `\xA7bTreasury: \xA76${village.treasury}\u{1F48E}\xA7r  |  Merchants: ${village.activeMerchants.length}/${maxMerchants}

${merchantList}

\xA77Tip: hold food and right-click granary to deposit instantly.
\xA77Hold emeralds and right-click treasury to deposit instantly.`
  ).button("\u{1F331} Seed Shop").button("\u{1F33E} Sell Food (bulk)").button(`\u2B06 Upgrade Market (${village.marketLevel * 20}\u{1F48E})`).button("\u{1F35E} Buy Food (abstract, 20\u{1F48E}/10)").button("\u{1F4B0} Sell Food (abstract, 10\u{1F48E}/10)").button("Close");
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
  }
}
async function showSeedShopMenu(player, village) {
  const matLine = SEED_PURCHASE_MATERIALS.map((m) => m.label).join(" + ");
  const form = new ActionFormData3().title(`${village.name} \u2014 Seed Shop`).body(
    `\xA7bBuy seeds for emeralds + farming materials.
\xA77Market Lv${village.marketLevel} (needs Lv1+)

\xA7eEach purchase also requires:
\xA7f${matLine}`
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
  const form = new ActionFormData3().title(`${village.name} \u2014 Sell Food`).body(
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
async function showBlacksmithMenu(player, block) {
  const village = findVillageAt2(block.location);
  if (!village || village.owner !== player.name) {
    notifyPlayer(player.name, "\xA7cYou don't own this village.");
    return;
  }
  const summary = getBlacksmithSummary(village);
  const form = new ActionFormData3().title(`${village.name} \u2014 Blacksmith`).body(summary).button("Upgrade Weapons\n\xA77(pay from inventory)").button("Upgrade Armor\n\xA77(pay from inventory)").button("\u2692 Craft for Armory\n\xA77(pay from village storage)").button("Close");
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
      await showArmoryCraftMenu(player, village);
      break;
  }
}
async function showArmoryCraftMenu(player, village) {
  const rs = village.resourceStorage;
  const makeCostStr = (r) => {
    const parts = [];
    if (r.costIron > 0) parts.push(`${r.costIron} iron`);
    if (r.costGold > 0) parts.push(`${r.costGold} gold`);
    if (r.costDiamonds > 0) parts.push(`${r.costDiamonds} \u{1F4A0}`);
    if (r.costWood > 0) parts.push(`${r.costWood} wood`);
    if (r.costStone > 0) parts.push(`${r.costStone} stone`);
    if (r.costEmeralds > 0) parts.push(`${r.costEmeralds}\u{1F48E}`);
    return parts.join(", ");
  };
  const form = new ActionFormData3().title(`${village.name} \u2014 Craft for Armory`).body(
    `\xA77Craft gear from village resource storage.
\xA77Storage: \xA7fFe:${rs.iron} Au:${rs.gold} \u{1F4A0}:${rs.diamonds} W:${rs.wood} St:${rs.stone}
\xA77Treasury: \xA7f${village.treasury}\u{1F48E}

\xA77Select an item to craft (\xD71 batch):`
  );
  for (const recipe2 of ARMORY_RECIPES) {
    const canCraft = canCraftArmoryRecipe(village, recipe2);
    const icon = canCraft ? "\xA7a\u2714" : "\xA7c\u2718";
    form.button(`${icon} ${recipe2.name}
\xA77Cost: ${makeCostStr(recipe2)}`);
  }
  form.button("Back");
  const response = await form.show(player);
  if (response.canceled || response.selection === ARMORY_RECIPES.length) return;
  const recipeIdx = response.selection;
  const recipe = ARMORY_RECIPES[recipeIdx];
  const countForm = new ModalFormData().title(`Craft ${recipe.name}`).slider(`How many batches? (cost \xD7N)`, 1, 20, 1, 1);
  const countResp = await countForm.show(player);
  if (countResp.canceled || countResp.formValues == null) return;
  const batches = countResp.formValues[0];
  craftForArmory(village, recipeIdx, batches);
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
  const form = new ActionFormData3().title(`${village.name} \u2014 Granary`).body(
    `${report}

Farmers: ${village.workers.farmers}  Daily: +${prod}/-${cons}
Shortage: ${village.foodShortageStage}/4`
  );
  const withdrawable = [];
  for (const [item] of items) {
    form.button(`Withdraw 8x ${item.replace("minecraft:", "")}`);
    withdrawable.push(item);
  }
  const fwLevel = village.fieldWorkerLevel ?? 0;
  const fwBtn = fwLevel >= 5 ? `\u{1F9D1}\u200D\u{1F33E} Field Workers Lv5 (maxed)` : `\u2B06 Upgrade Field Workers Lv${fwLevel}\u2192${fwLevel + 1} (20\u{1F48E})`;
  form.button("Deposit Food from Inventory");
  form.button(fieldBtn);
  form.button("\u{1F4E6} View Field Storage");
  form.button(fwBtn);
  form.button("Close");
  const response = await form.show(player);
  if (response.canceled || response.selection === void 0) return;
  if (response.selection < withdrawable.length) {
    withdrawFromGranary(player, village, withdrawable[response.selection], 8);
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
  if (!inv?.container) return;
  const container = inv.container;
  const inventoryCounts = {};
  for (let i = 0; i < container.size; i++) {
    const item = container.getItem(i);
    if (!item) continue;
    if (foodItems.includes(item.typeId)) {
      inventoryCounts[item.typeId] = (inventoryCounts[item.typeId] ?? 0) + item.amount;
    }
  }
  const available = foodItems.filter((id) => (inventoryCounts[id] ?? 0) > 0);
  if (available.length === 0) {
    notifyPlayer(player.name, "\xA7cYou have no food in your inventory to deposit.");
    return;
  }
  const form = new ModalFormData().title(`Deposit Food \u2014 ${village.name}`);
  for (const id of available) {
    const count = inventoryCounts[id];
    const label = id.replace("minecraft:", "");
    form.slider(`${label} (you have ${count})`, 0, count, 1, count);
  }
  const response = await form.show(player);
  if (response.canceled || response.formValues == null) return;
  const values = response.formValues;
  available.forEach((id, i) => {
    const amt = values[i] ?? 0;
    if (amt > 0) depositPlayerItemsToGranary(player, village, id, amt);
  });
}
async function showTreasuryBlockMenu(player, block) {
  const village = findVillageAt2(block.location);
  if (!village || village.owner !== player.name) {
    notifyPlayer(player.name, "\xA7cYou don't own this village.");
    return;
  }
  const report = getTreasuryReport(village);
  const form = new ActionFormData3().title(`${village.name} \u2014 Treasury`).body(report).button("Deposit 10\u{1F48E} from inventory").button("Deposit 64\u{1F48E} from inventory").button("Deposit all emeralds").button("Withdraw 10\u{1F48E} to inventory").button("Withdraw 64\u{1F48E} to inventory").button("Close");
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
  const form = new ActionFormData3().title(`${village.name} \u2014 Treasury`).body(report).button("Deposit 10\u{1F48E} from inventory").button("Deposit 64\u{1F48E} from inventory").button("Deposit all emeralds").button("Withdraw 10\u{1F48E} to inventory").button("Withdraw 64\u{1F48E} to inventory").button("Back");
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
  const form = new ActionFormData3().title(kingdom.name).body(summary).button("Diplomacy").button("Close");
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
  const form = new ActionFormData3().title("Diplomacy").body(`Kingdom: ${myKingdom.name}
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
  const form = new ActionFormData3().title(`Diplomacy \u2014 ${target.name}`).body(`King: ${target.king}
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
  const inTransit = getInTransitMarches(player.name);
  const inTransitLabel = inTransit.length > 0 ? `\u23F3 In-Transit Marches (${inTransit.length} active)` : `\u23F3 In-Transit Marches (none)`;
  const troopLine = (v) => {
    const t = v.troops;
    const hk = t.heavyKnight ?? 0;
    const sa = t.samurai ?? 0;
    const ml = t.mercenaryLancer ?? 0;
    const le = t.legionary ?? 0;
    return `${t.cityGuards + t.spearmen + t.archers + t.cavalry + hk + sa + ml + le} troops`;
  };
  const form = new ActionFormData3().title("Reinforcements & Resources").body(
    `\xA77From: \xA7b${village.name}
\xA77Treasury: \xA7f${village.treasury}\u{1F48E}  \xA77Food: \xA7f${village.foodStorage}\u{1F33E}
\xA77Troops: \xA7f${troopLine(village)}

\xA77Select destination to send, or view in-transit marches.`
  ).button(inTransitLabel);
  for (const v of otherVillages) {
    form.button(`${v.name}
\xA77${troopLine(v)}`);
  }
  const response = await form.show(player);
  if (response.canceled || response.selection === void 0) return;
  if (response.selection === 0) {
    await showInTransitMenu(player);
  } else {
    await showSendAmountsForm(player, villageId, otherVillages[response.selection - 1].id);
  }
}
async function showInTransitMenu(player) {
  const marches = getInTransitMarches(player.name);
  const tick = getCurrentTick();
  if (marches.length === 0) {
    notifyPlayer(player.name, "\xA77No reinforcements currently in transit.");
    return;
  }
  const form = new ActionFormData3().title("\u23F3 In-Transit Marches").body(
    `\xA77You have \xA7f${marches.length}\xA77 active march(es).
\xA77Click a march to recall it \u2014 troops will be instantly refunded.
`
  );
  for (const { pr, toName } of marches) {
    const troopSummary = Object.entries(pr.troops).filter(([, c]) => (c ?? 0) > 0).map(([t, c]) => `${c}\xD7${t}`).join(", ");
    const ticksLeft = Math.max(0, pr.arriveTick - tick);
    const secsLeft = Math.ceil(ticksLeft / 20);
    const etaLabel = secsLeft >= 60 ? `${Math.floor(secsLeft / 60)}m ${secsLeft % 60}s` : `${secsLeft}s`;
    const status = ticksLeft <= 0 ? "\xA7aArriving\u2026" : `\xA7eETA ~${etaLabel}`;
    form.button(
      `\u21A9 ${pr.sourceVillageName} \u2192 ${toName}
\xA77${troopSummary}  ${status}`
    );
  }
  form.button("Back");
  const response = await form.show(player);
  if (response.canceled || response.selection === void 0) return;
  if (response.selection === marches.length) return;
  const chosen = marches[response.selection];
  const confirm = new MessageFormData().title("\u21A9 Recall March?").body(
    `Recall the march from \xA7b${chosen.pr.sourceVillageName}\xA7r \u2192 \xA7b${chosen.toName}\xA7r?

\xA77All troops will be immediately returned to \xA7b${chosen.pr.sourceVillageName}\xA77.
\xA77This cannot be undone.`
  ).button1("\u21A9 Recall").button2("Cancel");
  const confirmResp = await confirm.show(player);
  if (confirmResp.canceled || confirmResp.selection !== 0) return;
  const success = cancelReinforcement(chosen.pr.id, chosen.toVillageId);
  if (!success) {
    notifyPlayer(player.name, "\xA7cMarch already arrived or could not be recalled.");
  }
}
async function showSendAmountsForm(player, fromId, toId) {
  const from = getVillage(fromId);
  const to = getVillage(toId);
  if (!from || !to) return;
  const sliders = [];
  const troopDefs = [
    { key: "cityGuards", label: "City Guards" },
    { key: "spearmen", label: "Spearmen" },
    { key: "archers", label: "Archers" },
    { key: "cavalry", label: "Cavalry" },
    { key: "heavyKnight", label: "Heavy Knights" },
    { key: "samurai", label: "Samurai" },
    { key: "mercenaryLancer", label: "Mercenary Lancers" },
    { key: "legionary", label: "Legionaries" }
  ];
  for (const { key, label } of troopDefs) {
    const count = from.troops[key] ?? 0;
    if (count > 0) sliders.push({ key, label, max: count });
  }
  if (from.treasury > 0) sliders.push({ key: "emeralds", label: "Emeralds", max: from.treasury });
  if (from.foodStorage > 0) sliders.push({ key: "food", label: "Food", max: from.foodStorage });
  if (sliders.length === 0) {
    notifyPlayer(player.name, `\xA7c\xA7b${from.name}\xA7c has no troops, emeralds, or food to send.`);
    return;
  }
  const form = new ModalFormData().title(`${from.name} \u2192 ${to.name}`);
  for (const s of sliders) {
    form.slider(s.label, 0, Math.max(s.max, 1), 1, 0);
  }
  const response = await form.show(player);
  if (response.canceled || !response.formValues) return;
  const values = response.formValues;
  const troops = {};
  let emeralds = 0;
  let food = 0;
  sliders.forEach((s, i) => {
    const v = Math.min(values[i] ?? 0, s.max);
    if (v <= 0) return;
    if (s.key === "emeralds") {
      emeralds = v;
    } else if (s.key === "food") {
      food = v;
    } else {
      troops[s.key] = v;
    }
  });
  if (Object.keys(troops).length > 0) {
    sendReinforcements(fromId, toId, troops);
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
  const form = new ActionFormData3().title(`${village.name} \u2014 Merchants`).body(`Active merchants: ${village.activeMerchants.length}
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
  const form = new ActionFormData3().title("Travelling Merchant").body(`Available:
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
async function showTradeStationMenu(player, block) {
  const village = findVillageAt2(block.location);
  if (!village) {
    notifyPlayer(player.name, "\xA7cNo village here. Claim a village first.");
    return;
  }
  const isOwner = village.owner === player.name;
  const summary = getTradeStationSummary(village);
  const form = new ActionFormData3().title(`${village.name} \u2014 Trade Station`).body(summary);
  if (isOwner) {
    form.button("\u{1F4E6} Dispatch Resources").button("\u{1F5E1} Dispatch Reinforcements").button("\u{1F682} Active Shipments").button("\u{1F4CB} Trade History");
  } else {
    form.button("Close");
  }
  const response = await form.show(player);
  if (response.canceled || !isOwner) return;
  switch (response.selection) {
    case 0:
      await showDispatchResourceMenu(player, village.id);
      break;
    case 1:
      await showDispatchMilitaryMenu(player, village.id);
      break;
    case 2:
      await showActiveShipmentsMenu(player, village.id);
      break;
    case 3:
      await showTradeHistoryMenu(player, village.id);
      break;
  }
}
async function showMaterialStorageMenu(player, block) {
  const village = findVillageAt2(block.location);
  if (!village) {
    notifyPlayer(player.name, "\xA7cNo village here. Claim a village first.");
    return;
  }
  const isOwner = village.owner === player.name;
  const summary = getMaterialStorageSummary(village);
  const form = new ActionFormData3().title(`${village.name} \u2014 Material Storage`).body(summary);
  if (isOwner) {
    form.button("\u{1F4E4} Withdraw Resources").button("\u{1F477} Assign Miners");
  } else {
    form.button("Close");
  }
  const response = await form.show(player);
  if (response.canceled || !isOwner) return;
  switch (response.selection) {
    case 0:
      await showResourceStorageMenu(player, village.id);
      break;
    case 1:
      await showAssignMinersMenu(player, village.id);
      break;
  }
}
async function showAssignMinersMenu(player, villageId) {
  const village = getVillage(villageId);
  if (!village) return;
  const totalWorkers = village.workers.workers;
  const currentMiners = village.workers.miners ?? 0;
  const form = new ModalFormData().title(`${village.name} \u2014 Assign Miners`).slider(`Miners (0\u2013${totalWorkers})`, 0, Math.max(1, totalWorkers), 1, currentMiners);
  const response = await form.show(player);
  if (response.canceled || response.formValues === void 0) return;
  const newMiners = response.formValues[0];
  if (newMiners > totalWorkers) {
    notifyPlayer(player.name, `\xA7cNot enough workers! \xA7b${village.name}\xA7c only has ${totalWorkers} workers total.`);
    return;
  }
  village.workers.miners = newMiners;
  saveVillage(village);
  notifyPlayer(
    player.name,
    `\xA7a${newMiners} miner(s) assigned in \xA7b${village.name}\xA7a. They will gather resources every minute into the Material Storage.`
  );
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
  const form = new ActionFormData3().title(`${from.name} \u2014 Dispatch Resources`).body(
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
  const form = new ActionFormData3().title(`${from.name} \u2014 Dispatch Reinforcements`).body(
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
  const hk = t.heavyKnight ?? 0;
  const sa = t.samurai ?? 0;
  const ml = t.mercenaryLancer ?? 0;
  const le = t.legionary ?? 0;
  const form = new ModalFormData().title(`\u{1F5E1} ${from.name} \u2192 ${to.name}`).slider("City Guards", 0, Math.max(t.cityGuards, 1), 1, 0).slider("Spearmen", 0, Math.max(t.spearmen, 1), 1, 0).slider("Archers", 0, Math.max(t.archers, 1), 1, 0).slider("Cavalry", 0, Math.max(t.cavalry, 1), 1, 0).slider("Heavy Knights", 0, Math.max(hk, 1), 1, 0).slider("Samurai", 0, Math.max(sa, 1), 1, 0).slider("Lancers", 0, Math.max(ml, 1), 1, 0).slider("Legionaries", 0, Math.max(le, 1), 1, 0);
  const response = await form.show(player);
  if (response.canceled) return;
  const [guards, spearmen, archers, cavalry, heavyKnight, samurai, mercenaryLancer, legionary] = response.formValues;
  if (guards === 0 && spearmen === 0 && archers === 0 && cavalry === 0 && heavyKnight === 0 && samurai === 0 && mercenaryLancer === 0 && legionary === 0) {
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
    troops: { cityGuards: guards, spearmen, archers, cavalry, heavyKnight, samurai, mercenaryLancer, legionary }
  });
}
async function showResourceStorageMenu(player, villageId) {
  const village = getVillage(villageId);
  if (!village) return;
  ensureResourceStorage(village);
  const rs = village.resourceStorage;
  const resourceKeys = Object.keys(RESOURCE_LABELS);
  const storageLines = resourceKeys.map((k) => `  ${RESOURCE_LABELS[k]}: ${rs[k]}`).join("\n");
  const form = new ActionFormData3().title(`${village.name} \u2014 Resource Storage`).body(`\xA77Railway deliveries are stored here.

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
  const itemId = RESOURCE_DROP_MAP[opt.key];
  if (itemId) {
    dropItemsAtLocation(player.dimension, player.location, itemId, opt.amount);
    notifyPlayer(player.name, `\xA7aWithdrew \xA7f${opt.amount}x ${opt.label}\xA7a from \xA7b${village.name}\xA7a's resource storage.`);
  }
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
  const form = new ActionFormData3().title(`${village.name} \u2014 Active Shipments`).body(`\xA7b${railCarts.length} rail shipment(s) in transit:

\xA7f${lines}

\xA77Shipments travel physically. If destroyed, cargo is lost.`).button("Close");
  await form.show(player);
}
async function showTradeHistoryMenu(player, villageId) {
  const village = getVillage(villageId);
  if (!village) return;
  const history = village.tradeHistory ?? [];
  if (history.length === 0) {
    const form2 = new ActionFormData3().title(`${village.name} \u2014 Trade History`).body("\xA77No trade deliveries recorded yet.\n\nPush a chest minecart to this trade station to log an arrival.").button("Close");
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
  const form = new ActionFormData3().title(`${village.name} \u2014 Trade History`).body(`\xA7bLast ${history.length} arrival(s):

` + lines.join("\n\n")).button("Close");
  await form.show(player);
}
