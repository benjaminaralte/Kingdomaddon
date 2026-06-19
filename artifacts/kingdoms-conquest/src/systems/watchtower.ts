import { world, EntityQueryOptions } from "@minecraft/server";
import type { VillageData, GuardPoleData } from "../types/index.js";
import { WATCHTOWER_DETECTION_RADIUS } from "../types/index.js";
import { getAllVillages, getAllKingdoms, getKingdom, getVillage } from "../storage/index.js";
import { distance } from "../utils/tick.js";
import { notifyAlert } from "../utils/notify.js";

const DETECTION_INTERVAL_TICKS = 100;
let lastDetectionTick = 0;

// Per-threat cooldown: key = `${villageId}:${threatId}` (player name or "bandits")
const THREAT_ALERT_COOLDOWN = 600; // ~30s — don't re-alert for the same threat this often
const lastAlertedThreat = new Map<string, number>();

export function tickWatchtowers(currentTick: number): void {
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

function scanFromWatchtower(village: VillageData, tower: GuardPoleData, currentTick: number): void {
  const dim = world.getDimension(village.location.dimension);

  const query: EntityQueryOptions = {
    location: tower.location,
    maxDistance: WATCHTOWER_DETECTION_RADIUS,
    excludeTypes: [
      "minecraft:item",
      "minecraft:arrow",
      "minecraft:experience_orb",
    ],
  };

  const nearby = dim.getEntities(query);
  const kingdom = getKingdom(village.kingdomId);

  for (const entity of nearby) {
    if (entity.typeId === "kingdoms:bandit") {
      const alertKey = `${village.id}:bandits`;
      const lastAlert = lastAlertedThreat.get(alertKey) ?? 0;
      if (currentTick - lastAlert >= THREAT_ALERT_COOLDOWN) {
        const d = Math.round(distance(entity.location, tower.location));
        notifyAlert(village.owner, `§c⚠ Watchtower detected bandits near §b${village.name}§c! (${d}m away)`);
        lastAlertedThreat.set(alertKey, currentTick);
      }
      return;
    }

    if (entity.typeId === "minecraft:player") {
      const playerName = (entity as unknown as { name: string }).name;
      if (playerName === village.owner) continue;
      if (kingdom && isAllied(playerName, kingdom.id)) continue;

      if (isEnemyPlayer(playerName, village.kingdomId)) {
        const alertKey = `${village.id}:${playerName}`;
        const lastAlert = lastAlertedThreat.get(alertKey) ?? 0;
        if (currentTick - lastAlert >= THREAT_ALERT_COOLDOWN) {
          notifyAlert(
            village.owner,
            `§c⚔ Enemy player §4${playerName}§c detected near §b${village.name}§c! Village may be under attack!`
          );
          lastAlertedThreat.set(alertKey, currentTick);
        }
        return;
      }
    }
  }
}

function getPlayerKingdom(playerName: string) {
  return getAllKingdoms().find(
    (k) =>
      k.king === playerName ||
      k.villageIds.some((vid) => {
        const v = getVillage(vid);
        return v?.owner === playerName;
      })
  );
}

function isAllied(playerName: string, kingdomId: string): boolean {
  const playerKingdom = getPlayerKingdom(playerName);
  if (!playerKingdom) return false;
  const kingdom = getKingdom(kingdomId);
  return kingdom ? kingdom.alliances.includes(playerKingdom.id) : false;
}

function isEnemyPlayer(playerName: string, kingdomId: string): boolean {
  const playerKingdom = getPlayerKingdom(playerName);
  if (!playerKingdom) return false;
  const kingdom = getKingdom(kingdomId);
  return kingdom ? kingdom.wars.includes(playerKingdom.id) : false;
}

export function notifyWatchtowerUnderAttack(villageId: string): void {
  const village = getVillage(villageId);
  if (!village) return;
  notifyAlert(village.owner, `§4🔔 WATCHTOWER UNDER ATTACK in §b${village.name}§4!`);
}

export function notifyVillageUnderSiege(villageId: string): void {
  const village = getVillage(villageId);
  if (!village) return;
  notifyAlert(village.owner, `§4🔔 §b${village.name}§4 IS UNDER SIEGE!`);

  const kingdom = getKingdom(village.kingdomId);
  if (kingdom) {
    for (const vid of kingdom.villageIds) {
      const v = getVillage(vid);
      if (v && v.owner !== village.owner) {
        notifyAlert(v.owner, `§c⚔ Your allied village §b${village.name}§c is under siege!`);
      }
    }
  }
}
