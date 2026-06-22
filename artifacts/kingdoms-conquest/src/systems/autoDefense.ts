import { world } from "@minecraft/server";
import type { VillageData, TroopType } from "../types/index.js";
import { VILLAGE_CLAIM_RADIUS } from "../types/index.js";
import { getAllVillages, saveVillage } from "../storage/index.js";
import { notifyPlayer, notifyAlert } from "../utils/notify.js";
import { distance } from "../utils/tick.js";
import { areAtWar, getKingdomOf, notifyAlliedKings } from "./kingdom.js";
import { spawnMountedUnit, MOUNTED_ENTITIES } from "./deployTroops.js";

const THREAT_SCAN_INTERVAL = 60;
const RAID_NOTIFY_COOLDOWN = 300;
const lastRaidNotify = new Map<string, number>();

const AUTO_DISPATCH_PROP = "kc:auto_dispatch";
const AUTO_TROOP_TYPE_PROP = "kc:auto_troop_type";

const TROOP_ENTITY_MAP: Record<TroopType, string> = {
  cityGuards:      "kingdoms:city_guard",
  spearmen:        "kingdoms:spearman",
  archers:         "kingdoms:archer",
  cavalry:         "kingdoms:cavalry",
  heavyKnight:     "kingdoms:heavy_knight",
  samurai:         "kingdoms:samurai",
  mercenaryLancer: "kingdoms:mercenary_lancer",
  legionary:       "kingdoms:legionary",
};

const TROOP_PRIORITY: TroopType[] = ["samurai", "mercenaryLancer", "legionary", "heavyKnight", "spearmen", "archers", "cavalry", "cityGuards"];

export function tickAutoDefense(currentTick: number): void {
  if (currentTick % THREAT_SCAN_INTERVAL !== 0) return;
  for (const village of getAllVillages()) {
    if (!village.owner) continue;
    scanVillageThreat(village, currentTick);
  }
}

function scanVillageThreat(village: VillageData, currentTick: number): void {
  const dim = world.getDimension(village.location.dimension);
  const center = village.townHallLocation;
  let threatCount = 0;
  let playerRaider: string | null = null;

  try {
    const hostiles = dim.getEntities({
      location: center,
      maxDistance: VILLAGE_CLAIM_RADIUS,
      families: ["monster"],
    });
    threatCount += hostiles.length;
  } catch { /* family query fallback — not critical */ }

  for (const p of world.getPlayers()) {
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
      notifyAlert(village.owner, `§c🔔 RAID ALERT! §f${playerRaider}§c has entered §b${village.name}§c!`);
      notifyAlliedKings(
        village.kingdomId,
        `§c🔔 Allied village §b${village.name}§c is being raided by §f${playerRaider}§c!`
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
      notifyAlert(village.owner, `§c⚔ §b${village.name}§c is under attack! (${threatCount} threat${threatCount > 1 ? "s" : ""} nearby)`);
      lastRaidNotify.set(key, currentTick);
    }
  }

  dispatchTroops(village, threatCount);
}

function countAutoDispatched(village: VillageData): number {
  const dim = world.getDimension(village.location.dimension);
  const center = village.townHallLocation;
  let count = 0;
  for (const entityType of Object.values(TROOP_ENTITY_MAP)) {
    try {
      const entities = dim.getEntities({ type: entityType, location: center, maxDistance: VILLAGE_CLAIM_RADIUS * 2 });
      for (const e of entities) {
        if (e.getDynamicProperty(AUTO_DISPATCH_PROP) === village.id) count++;
      }
    } catch {}
  }
  return count;
}

function dispatchTroops(village: VillageData, threatCount: number): void {
  const totalBarracks =
    village.troops.cityGuards               +
    village.troops.spearmen                 +
    village.troops.archers                  +
    village.troops.cavalry                  +
    (village.troops.heavyKnight      ?? 0)  +
    (village.troops.samurai          ?? 0)  +
    (village.troops.mercenaryLancer  ?? 0)  +
    (village.troops.legionary        ?? 0);
  if (totalBarracks <= 0) return;

  const alreadyOut = countAutoDispatched(village);
  const needed = Math.min(threatCount * 2, totalBarracks) - alreadyOut;
  if (needed <= 0) return;

  const dim = world.getDimension(village.location.dimension);
  const center = village.townHallLocation;
  let dispatched = 0;

  for (const troopType of TROOP_PRIORITY) {
    if (dispatched >= needed) break;
    if (village.troops[troopType] <= 0) continue;

    const toSend = Math.min(village.troops[troopType], needed - dispatched);
    village.troops[troopType] -= toSend;

    for (let i = 0; i < toSend; i++) {
      try {
        const angle = Math.random() * Math.PI * 2;
        const r = 6 + Math.random() * 12;
        const offset = {
          x: center.x + Math.cos(angle) * r,
          y: center.y,
          z: center.z + Math.sin(angle) * r,
        };
        const entityId = TROOP_ENTITY_MAP[troopType];
        const entity = MOUNTED_ENTITIES.has(entityId)
          ? spawnMountedUnit(dim, entityId, offset)
          : dim.spawnEntity(entityId, offset);
        entity.setDynamicProperty(AUTO_DISPATCH_PROP, village.id);
        entity.setDynamicProperty(AUTO_TROOP_TYPE_PROP, troopType);
        entity.nameTag = `⚔ [${village.name}]`;
        dispatched++;
      } catch { /* chunk not loaded */ }
    }
  }

  if (dispatched > 0) {
    saveVillage(village);
    notifyPlayer(village.owner, `§e⚔ ${dispatched} troop${dispatched > 1 ? "s" : ""} auto-dispatched to defend §b${village.name}§e!`);
  }
}

function recallAutoDispatched(village: VillageData): void {
  const dim = world.getDimension(village.location.dimension);
  const center = village.townHallLocation;
  const survivors: Partial<Record<TroopType, number>> = {};
  let recalled = 0;

  // Large radius so stragglers that chased enemies far are still recovered
  const RECALL_RADIUS = VILLAGE_CLAIM_RADIUS * 6;

  for (const [troopType, entityType] of Object.entries(TROOP_ENTITY_MAP) as [TroopType, string][]) {
    try {
      const entities = dim.getEntities({ type: entityType, location: center, maxDistance: RECALL_RADIUS });
      for (const e of entities) {
        if (e.getDynamicProperty(AUTO_DISPATCH_PROP) !== village.id) continue;
        const tt = (e.getDynamicProperty(AUTO_TROOP_TYPE_PROP) as TroopType | undefined) ?? troopType;
        survivors[tt] = (survivors[tt] ?? 0) + 1;
        try {
          const mount = e.getVehicle();
          if (mount) mount.remove();
        } catch {}
        try { e.remove(); } catch {}
        recalled++;
      }
    } catch {}
  }

  if (recalled > 0) {
    for (const [tt, count] of Object.entries(survivors) as [TroopType, number][]) {
      village.troops[tt] += count;
    }
    saveVillage(village);
    notifyPlayer(village.owner, `§a✅ Attack repelled! §f${recalled}§a troop${recalled > 1 ? "s" : ""} returned to §b${village.name}§a barracks.`);
  }
}
