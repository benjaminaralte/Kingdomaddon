import { world, EntityQueryOptions } from "@minecraft/server";
import type { VillageData, GuardPoleData } from "../types/index.js";
import { WATCHTOWER_DETECTION_RADIUS } from "../types/index.js";
import { getAllVillages, getAllKingdoms, getKingdom, getVillage } from "../storage/index.js";
import { distance } from "../utils/tick.js";
import { notifyPlayer } from "../utils/notify.js";

const DETECTION_INTERVAL_TICKS = 100;
let lastDetectionTick = 0;

export function tickWatchtowers(currentTick: number): void {
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

function scanFromWatchtower(village: VillageData, tower: GuardPoleData): void {
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
      const d = Math.round(distance(entity.location, tower.location));
      notifyPlayer(village.owner, `§c⚠ Watchtower detected bandits near §b${village.name}§c! (${d}m away)`);
      return;
    }

    if (entity.typeId === "minecraft:player") {
      const playerName = (entity as unknown as { name: string }).name;
      if (playerName === village.owner) continue;
      if (kingdom && isAllied(playerName, kingdom.id)) continue;

      if (isEnemyPlayer(playerName, village.kingdomId)) {
        notifyPlayer(
          village.owner,
          `§c⚔ Enemy player §4${playerName}§c detected near §b${village.name}§c!`
        );
        notifyPlayer(village.owner, `§cVillage may be under attack!`);
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
  notifyPlayer(village.owner, `§4🔔 WATCHTOWER UNDER ATTACK in §b${village.name}§4!`);
}

export function notifyVillageUnderSiege(villageId: string): void {
  const village = getVillage(villageId);
  if (!village) return;
  notifyPlayer(village.owner, `§4🔔 §b${village.name}§4 IS UNDER SIEGE!`);

  const kingdom = getKingdom(village.kingdomId);
  if (kingdom) {
    for (const vid of kingdom.villageIds) {
      const v = getVillage(vid);
      if (v && v.owner !== village.owner) {
        notifyPlayer(v.owner, `§c⚔ Your allied village §b${village.name}§c is under siege!`);
      }
    }
  }
}
