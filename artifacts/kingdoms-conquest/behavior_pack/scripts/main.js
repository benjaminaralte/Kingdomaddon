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
      legionary: 10
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
      total += village.troops.cityGuards * 1 + village.troops.spearmen * 2 + village.troops.archers * 2 + village.troops.cavalry * 3 + (village.troops.heavyKnight ?? 0) * 5 + (village.troops.samurai ?? 0) * 7 + (village.troops.mercenaryLancer ?? 0) * 6 + (village.troops.legionary ?? 0) * 6;
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
  return village.troops.cityGuards * 1 + village.troops.spearmen * 2 + village.troops.archers * 2 + village.troops.cavalry * 3 + (village.troops.heavyKnight ?? 0) * 5 + (village.troops.samurai ?? 0) * 7 + (village.troops.mercenaryLancer ?? 0) * 6 + (village.troops.legionary ?? 0) * 6;
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
      legionary: "kingdoms:legionary"
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
  const soldiers = village.troops.cityGuards + village.troops.spearmen + village.troops.archers + village.troops.cavalry + (village.troops.heavyKnight ?? 0) + (village.troops.samurai ?? 0) + (village.troops.mercenaryLancer ?? 0) + (village.troops.legionary ?? 0);
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
    troops: { cityGuards: 0, spearmen: 0, archers: 0, cavalry: 0, heavyKnight: 0, samurai: 0, mercenaryLancer: 0, legionary: 0 },
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
  const totalSoldiers = t.cityGuards + t.spearmen + t.archers + t.cavalry + hk + sa + ml + le;
  const stages = ["\u2714 None", "\u26A0 Stage 1", "\u26A0 Stage 2", "\xA7c Stage 3", "\xA7c Stage 4"];
  const rs = village.resourceStorage ?? { iron: 0, gold: 0, coal: 0, wood: 0, stone: 0, diamonds: 0 };
  const hasStation = village.hasTradeStation ? "\xA7a\u2714 Active" : "\xA7c\u2718 None";
  return [
    `\xA7b${village.name}\xA7r (${village.owner})`,
    `Pop: ${village.population}/${village.housingCapacity}  Prosperity: ${village.prosperity}`,
    `Treasury: ${village.treasury}\u{1F48E}  Food: ${village.foodStorage}\u{1F33E}`,
    `Market Lv${village.marketLevel}  Barracks Lv${village.barracksLevel}`,
    `Troops: ${totalSoldiers} (G:${t.cityGuards} Sp:${t.spearmen} Ar:${t.archers} Ca:${t.cavalry} HK:${hk}${sa > 0 ? ` Sa:${sa}` : ""}${ml > 0 ? ` ML:${ml}` : ""}${le > 0 ? ` Le:${le}` : ""})`,
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
var ELITE_TYPES = /* @__PURE__ */ new Set(["samurai", "mercenaryLancer", "legionary"]);
var RECRUIT_COSTS = {
  cityGuards: 8,
  spearmen: 12,
  archers: 12,
  cavalry: 20,
  heavyKnight: 35,
  samurai: 60,
  mercenaryLancer: 50,
  legionary: 50
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
  const availableWorkers = village.population - village.troops.cityGuards - village.troops.spearmen - village.troops.archers - village.troops.cavalry - (village.troops.heavyKnight ?? 0) - (village.troops.samurai ?? 0) - (village.troops.mercenaryLancer ?? 0) - (village.troops.legionary ?? 0) - village.workers.farmers - village.workers.workers;
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
  const totalWages = village.troops.cityGuards * TROOP_WAGES.cityGuards + village.troops.spearmen * TROOP_WAGES.spearmen + village.troops.archers * TROOP_WAGES.archers + village.troops.cavalry * TROOP_WAGES.cavalry + hk * TROOP_WAGES.heavyKnight + sa * TROOP_WAGES.samurai + ml * TROOP_WAGES.mercenaryLancer + le * TROOP_WAGES.legionary;
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
  const keys = ["cityGuards", "spearmen", "archers", "cavalry", "heavyKnight", "samurai", "mercenaryLancer", "legionary"];
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
  return village.troops.cityGuards + village.troops.spearmen + village.troops.archers + village.troops.cavalry + (village.troops.heavyKnight ?? 0) + (village.troops.samurai ?? 0) + (village.troops.mercenaryLancer ?? 0) + (village.troops.legionary ?? 0);
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
    "kingdoms:legionary"
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
  "kingdoms:legionary_token": { troopType: "legionary", entityId: "kingdoms:legionary", label: "Legionary" }
};
var MOUNTED_ENTITIES = /* @__PURE__ */ new Set(["kingdoms:cavalry", "kingdoms:mercenary_lancer"]);
var _horseCounter = 0;
function spawnMountedUnit(dim, entityId, offset) {
  const tag = `kc_wh_${_horseCounter++}`;
  const horse = dim.spawnEntity("kingdoms:war_horse", offset);
  horse.addTag(tag);
  const rider = dim.spawnEntity(entityId, offset);
  system2.runTimeout(() => {
    try {
      rider.runCommandAsync(`ride @s start_riding @e[tag=${tag},c=1]`);
    } catch {
    }
    try {
      horse.removeTag(tag);
    } catch {
    }
  }, 10);
  return rider;
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
  "kingdoms:legionary": "kingdoms:legionary_token"
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
    legionary: 0
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
  const totalSoldiers = village.troops.cityGuards + village.troops.spearmen + village.troops.archers + village.troops.cavalry + (village.troops.heavyKnight ?? 0) + (village.troops.samurai ?? 0) + (village.troops.mercenaryLancer ?? 0) + (village.troops.legionary ?? 0);
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
  const totalSoldiers = village.troops.cityGuards + village.troops.spearmen + village.troops.archers + village.troops.cavalry + (village.troops.heavyKnight ?? 0) + (village.troops.samurai ?? 0) + (village.troops.mercenaryLancer ?? 0) + (village.troops.legionary ?? 0);
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
  const soldiers = village.troops.cityGuards + village.troops.spearmen + village.troops.archers + village.troops.cavalry + (village.troops.heavyKnight ?? 0) + (village.troops.samurai ?? 0) + (village.troops.mercenaryLancer ?? 0) + (village.troops.legionary ?? 0);
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
  legionary: { emeralds: 18, iron: 12, gold: 6, diamonds: 4 }
};
var TRAINING_TICKS = {
  cityGuards: 1200,
  spearmen: 1800,
  archers: 1600,
  cavalry: 2400,
  heavyKnight: 6e3,
  samurai: 9e3,
  mercenaryLancer: 8e3,
  legionary: 8e3
};
var TROOP_LABELS = {
  cityGuards: "City Guard",
  spearmen: "Spearman",
  archers: "Archer",
  cavalry: "Cavalry",
  heavyKnight: "Heavy Knight",
  samurai: "Samurai",
  mercenaryLancer: "Mercenary Lancer",
  legionary: "Legionary"
};
var ELITE_TROOP_TYPES = ["samurai", "mercenaryLancer", "legionary"];
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
  legionary: "kingdoms:legionary"
};
var TROOP_PRIORITY = ["samurai", "mercenaryLancer", "legionary", "heavyKnight", "spearmen", "archers", "cavalry", "cityGuards"];
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
            try {
              entity.teleport({
                x: pole.location.x + (Math.random() * 4 - 2),
                y: pole.location.y,
                z: pole.location.z + (Math.random() * 4 - 2)
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
  "kingdoms:storage"
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
  "kingdoms:storage": materialStorageBlueprint
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
      troop.teleport(pos, { dimension: player.dimension });
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
        inv.container.addItem(new ItemStack6("minecraft:cobblestone", 10));
        inv.container.addItem(new ItemStack6("minecraft:emerald", 50));
        world20.setDynamicProperty(starterKey, true);
        player.sendMessage(
          `\xA7a\xA7lWelcome to Kingdoms & Conquest!\xA7r
\xA77You received: \xA7f1 Town Hall\xA77, \xA7f1 Village Spawner\xA77, \xA7f10 Cobblestone\xA77, \xA7f50 Emeralds\xA77.
\xA7ePlace the Village Spawner first to create your village, then build your Town Hall inside it!`
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
  for (const village of getAllVillages()) {
    updateHousingCapacity(village.id);
  }
}, 72e3);
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
  const form = new ActionFormData3().title("Village Spawner").body("Choose what to spawn near you.\n\xA77A settlement will appear ~50-80 blocks away.").button("\u{1F3D9} Spawn City\n\xA77Large walled settlement").button("\u{1F3D8} Spawn Village\n\xA77Small wooden village");
  const response = await form.show(player);
  if (response.canceled || response.selection === void 0) return;
  const type = response.selection === 0 ? "city" : "village";
  const dim = player.dimension;
  const loc = player.location;
  const angle = Math.random() * Math.PI * 2;
  const dist = type === "city" ? 80 : 50;
  const anchor = {
    x: Math.round(loc.x + Math.cos(angle) * dist),
    y: Math.round(loc.y),
    z: Math.round(loc.z + Math.sin(angle) * dist)
  };
  notifyPlayer(player.name, `\xA77Spawning \xA7b${type}\xA77\u2026 (check ~${dist} blocks away)`);
  system6.run(() => spawnNpcVillage(dim, anchor, type));
}
function _buildMedievalHouse(b, v, cx, cz, w, d, wall, post) {
  const hw = Math.floor(w / 2), hd = Math.floor(d / 2);
  v(cx - hw, 0, cz - hd, cx + hw, 0, cz + hd, "minecraft:oak_planks");
  for (const [px, pz] of [[cx - hw, cz - hd], [cx + hw, cz - hd], [cx - hw, cz + hd], [cx + hw, cz + hd]])
    for (let y = 1; y <= 5; y++) b(px, y, pz, post);
  for (let y = 1; y <= 4; y++) {
    for (let x = cx - hw; x <= cx + hw; x++) {
      b(x, y, cz - hd, wall);
      b(x, y, cz + hd, wall);
    }
    for (let z = cz - hd + 1; z <= cz + hd - 1; z++) {
      b(cx - hw, y, z, wall);
      b(cx + hw, y, z, wall);
    }
  }
  for (let x = cx - hw; x <= cx + hw; x++) {
    b(x, 5, cz - hd, post);
    b(x, 5, cz + hd, post);
  }
  for (let z = cz - hd + 1; z <= cz + hd - 1; z++) {
    b(cx - hw, 5, z, post);
    b(cx + hw, 5, z, post);
  }
  b(cx, 2, cz - hd, "minecraft:glass_pane");
  b(cx, 3, cz - hd, "minecraft:glass_pane");
  b(cx, 2, cz + hd, "minecraft:glass_pane");
  b(cx, 3, cz + hd, "minecraft:glass_pane");
  if (w >= 8) {
    b(cx - hw, 2, cz, "minecraft:glass_pane");
    b(cx - hw, 3, cz, "minecraft:glass_pane");
    b(cx + hw, 2, cz, "minecraft:glass_pane");
    b(cx + hw, 3, cz, "minecraft:glass_pane");
  }
  b(cx, 1, cz + hd, "minecraft:air");
  b(cx, 2, cz + hd, "minecraft:air");
  for (let step = 0; step <= Math.min(hw, hd); step++) {
    const x1 = cx - hw + step, x2 = cx + hw - step, z1 = cz - hd + step, z2 = cz + hd - step;
    if (x1 > x2 || z1 > z2) break;
    v(x1, 6 + step, z1, x2, 6 + step, z2, "minecraft:brick_block");
  }
  b(cx, 1, cz, "minecraft:lantern");
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
  if (type === "city") {
    _buildKingdom(b, v, rng);
  } else {
    _buildVillage(b, v, rng);
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
    }
  }, 1);
}
function _buildKingdom(b, v, rng) {
  const SB = "minecraft:stone_bricks";
  const CSB = "minecraft:chiseled_stone_bricks";
  const COBB = "minecraft:cobblestone";
  const OAK = "minecraft:oak_planks";
  const DOAK = "minecraft:dark_oak_planks";
  const BRCK = "minecraft:brick_block";
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
  v(-34, 1, -34, 34, 20, 34, AIR);
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
  v(-1, 0, 31, 1, 0, 38, PATH);
  v(-1, 0, 26, 1, 0, 29, PATH);
  v(-1, 0, -28, 1, 0, 25, PATH);
  v(-28, 0, -1, 28, 0, 1, PATH);
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
  _buildMedievalHouse(b, v, -19, -19, 10, 8, OAK, LOG);
  _buildMedievalHouse(b, v, 19, -19, 10, 8, OAK, LOG);
  _buildMedievalHouse(b, v, -21, 2, 8, 10, DOAK, DLOG);
  _buildMedievalHouse(b, v, 21, 2, 8, 10, DOAK, DLOG);
  _buildMedievalHouse(b, v, -19, 19, 10, 8, OAK, LOG);
  _buildMedievalHouse(b, v, 19, 19, 10, 8, OAK, LOG);
  _buildMedievalHouse(b, v, -12, -15, 7, 6, OAK, LOG);
  _buildMedievalHouse(b, v, 12, -15, 7, 6, OAK, LOG);
  rng(-14, -30, 14, -12, 1, 5, SB);
  for (let y = 1; y <= 3; y++) {
    b(-1, y, -12, AIR);
    b(0, y, -12, AIR);
    b(1, y, -12, AIR);
  }
  for (let x = -14; x <= 14; x += 2) b(x, 6, -12, CSB);
  v(-1, 0, -12, 1, 0, -3, PATH);
  rng(-11, -29, 11, -15, 1, 10, ANDE);
  v(-10, 2, -28, 10, 10, -16, AIR);
  v(-10, 1, -28, 10, 1, -16, SB);
  for (let z = -26; z >= -18; z -= 4) {
    b(-11, 5, z, GPNE);
    b(-11, 6, z, GPNE);
    b(11, 5, z, GPNE);
    b(11, 6, z, GPNE);
  }
  for (let x = -8; x <= 8; x += 4) b(x, 5, -29, GPNE);
  for (let y = 1; y <= 3; y++) {
    b(-1, y, -15, AIR);
    b(0, y, -15, AIR);
    b(1, y, -15, AIR);
  }
  for (const [px, pz] of [[-7, -26], [7, -26], [-7, -20], [7, -20]])
    for (let y = 1; y <= 9; y++) b(px, y, pz, SB);
  for (const [lx, lz] of [[-4, -24], [4, -24], [-4, -20], [4, -20], [0, -22]])
    b(lx, 2, lz, LNTN);
  for (const [tx, tz] of [[-11, -29], [11, -29], [-11, -15], [11, -15]]) {
    _buildTower(b, v, tx, tz, 2, 16, SB, CSB);
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
    [-24, -40]
  ]) {
    const h = 5 + Math.floor(Math.random() * 3);
    for (let y = 1; y <= h; y++) b(tx, y, tz, OLEG);
    v(tx - 2, h - 1, tz - 2, tx + 2, h + 2, tz + 2, OLAV);
    b(tx, h + 3, tz, OLAV);
  }
}
function _buildVillage(b, v, rng) {
  const SB = "minecraft:stone_bricks";
  const CSB = "minecraft:chiseled_stone_bricks";
  const OAK = "minecraft:oak_planks";
  const SOAK = "minecraft:spruce_planks";
  const BRCK = "minecraft:brick_block";
  const LOG = "minecraft:stripped_oak_log";
  const SLOG = "minecraft:stripped_spruce_log";
  const GPNE = "minecraft:glass_pane";
  const PATH = "minecraft:dirt_path";
  const LNTN = "minecraft:lantern";
  const FENC = "minecraft:oak_fence";
  const AIR = "minecraft:air";
  const WATR = "minecraft:water";
  const OLEG = "minecraft:oak_log";
  const OLAV = "minecraft:oak_leaves";
  v(-22, 1, -22, 22, 12, 22, AIR);
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
  v(-1, 1, -1, 1, 1, 1, SB);
  b(0, 1, 0, WATR);
  for (const [wx, wz] of [[-2, 0], [2, 0], [0, -2], [0, 2]])
    b(wx, 1, wz, FENC);
  _buildMedievalHouse(b, v, -11, -11, 8, 7, OAK, LOG);
  _buildMedievalHouse(b, v, 11, -11, 8, 7, SOAK, SLOG);
  _buildMedievalHouse(b, v, -12, 2, 7, 8, OAK, LOG);
  _buildMedievalHouse(b, v, 12, 2, 7, 8, SOAK, SLOG);
  _buildMedievalHouse(b, v, 0, 11, 8, 7, OAK, LOG);
  for (const [tx, tz] of [
    [-26, -14],
    [26, -14],
    [-26, 14],
    [26, 14],
    [0, -28],
    [-16, 26],
    [16, 26]
  ]) {
    for (let y = 1; y <= 5; y++) b(tx, y, tz, OLEG);
    v(tx - 2, 4, tz - 2, tx + 2, 7, tz + 2, OLAV);
    b(tx, 8, tz, OLAV);
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
  { label: "\u{1F5FA} Waypoint", desc: "Fast-travel point for your village.", itemId: "kingdoms:waypoint", cost: 30 }
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
  const carried = countTroopTokens(player);
  const carriedTotal = carried.cityGuards + carried.spearmen + carried.archers + carried.cavalry + (carried.heavyKnight ?? 0) + (carried.samurai ?? 0) + (carried.mercenaryLancer ?? 0) + (carried.legionary ?? 0);
  const tick = getCurrentTick();
  const queueSummary = getTrainingQueueSummary(village, tick);
  const queueCount = village.trainingQueue?.length ?? 0;
  const rs = village.resourceStorage;
  const hkLocked = village.barracksLevel < 3;
  const castleBuilt = village.hasCastle ?? false;
  const hkLine = hkLocked ? `\xA77Heavy Knights: \xA7c${hk} \xA77(\u{1F512} needs Barracks Lv3)` : `\xA7aHeavy Knights: ${hk}`;
  const eliteLine = castleBuilt ? `\xA76Samurai: ${sm}  Lancer: ${ml}  Legionary: ${lg}` : `\xA77Elite Troops: \xA7c\u{1F512} needs Castle`;
  const form = new ActionFormData3().title(`${village.name} \u2014 Barracks Lv${village.barracksLevel}`).body(
    `\xA77\u2500\u2500 Stationed \u2500\u2500
City Guards: ${t.cityGuards}  Spearmen: ${t.spearmen}
Archers: ${t.archers}  Cavalry: ${t.cavalry}
${hkLine}
${eliteLine}

\xA77\u2500\u2500 Carried in Inventory \u2500\u2500
Guards: ${carried.cityGuards}  Spearmen: ${carried.spearmen}
Archers: ${carried.archers}  Cavalry: ${carried.cavalry}  HK: ${carried.heavyKnight ?? 0}
Samurai: ${carried.samurai ?? 0}  Lancer: ${carried.mercenaryLancer ?? 0}  Legionary: ${carried.legionary ?? 0}

\xA77\u2500\u2500 Training Queue (${queueCount}/10) \u2500\u2500
${queueSummary}

Treasury: ${village.treasury} emeralds  Iron: ${rs.iron}  Gold: ${rs.gold}  Diamonds: ${rs.diamonds}`
  ).button(`\u{1FA96} Train Troops (queue: ${queueCount}/10)
\xA77Select troop type and quantity`).button(`\u2694 Pick Up Troops (${t.cityGuards + t.spearmen + t.archers + t.cavalry + hk + sm + ml + lg} stationed)`).button(carriedTotal > 0 ? `\u{1F3F9} Return Troops to Barracks (${carriedTotal} carried)` : "\u{1F3F9} Return Troops (none carried)").button(`\u2B06 Upgrade Barracks (${village.barracksLevel * 15} emeralds)`).button("\u{1F4EF} Tactics Horn\n\xA77Take a formation command horn");
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
async function showPickUpTroopsForm(player, village) {
  const t = village.troops;
  const hk = t.heavyKnight ?? 0;
  const sm2 = t.samurai ?? 0;
  const ml2 = t.mercenaryLancer ?? 0;
  const lg2 = t.legionary ?? 0;
  const total = t.cityGuards + t.spearmen + t.archers + t.cavalry + hk + sm2 + ml2 + lg2;
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
    { key: "legionary", label: "Legionaries", count: lg2 }
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
    legionary: 0
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
  const total = carried.cityGuards + carried.spearmen + carried.archers + carried.cavalry + hkCarried + smCarried + mlCarried + lgCarried;
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
    "legionary"
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
\xA77${makeCostLine("legionary")}`).button("Back");
  const response = await form.show(player);
  if (response.canceled || response.selection === 8) return;
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
