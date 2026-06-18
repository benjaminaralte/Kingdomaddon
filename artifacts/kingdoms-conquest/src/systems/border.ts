import { world } from "@minecraft/server";
import type { Dimension } from "@minecraft/server";
import { getAllVillages, getVillage } from "../storage/index.js";
import { getKingdomOf, areAtWar } from "./kingdom.js";
import { notifyPlayer } from "../utils/notify.js";
import { VILLAGE_CLAIM_RADIUS } from "../types/index.js";
import type { VillageData } from "../types/index.js";

export const BORDER_RADIUS = VILLAGE_CLAIM_RADIUS;
export const SIEGE_ELIGIBILITY_TICKS = 2400; // 2 minutes at 20 ticks/s
const REMINDER_INTERVAL_TICKS = 400; // ~20 second countdown reminders
const PARTICLE_INTERVAL_TICKS = 40; // render border particles every 2 s
const PARTICLE_STEP = 10; // blocks between particles along the border edge
const PARTICLE_Y_OFFSETS = [0, 3]; // show particles at two heights

interface BorderIntrusion {
  playerName: string;
  villageId: string;
  entryTick: number;
  lastReminderTick: number;
  siegeEligible: boolean;
}

const activeIntrusions = new Map<string, BorderIntrusion>();
let lastParticleTick = 0;

function intrusionKey(playerName: string, villageId: string): string {
  return `${playerName}:${villageId}`;
}

function isInsideBorder(
  px: number,
  pz: number,
  vx: number,
  vz: number
): boolean {
  return (
    Math.abs(px - vx) <= BORDER_RADIUS && Math.abs(pz - vz) <= BORDER_RADIUS
  );
}

export function tickBorders(tick: number): void {
  const players = world.getPlayers();
  const villages = getAllVillages();
  const currentKeys = new Set<string>();

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
          siegeEligible: false,
        };
        activeIntrusions.set(key, intrusion);

        const countdownSec = Math.floor(SIEGE_ELIGIBILITY_TICKS / 20);
        notifyPlayer(
          village.owner,
          `§c⚔ Border Alert: §e${player.name}§c has entered §b${village.name}§c's territory! Siege eligible in ${countdownSec}s.`
        );
        notifyPlayer(
          player.name,
          `§e⚠ You crossed into enemy territory: §b${village.name}§e. Siege eligible in §f${countdownSec}s§e if you remain.`
        );
      }

      if (!intrusion.siegeEligible) {
        const elapsed = tick - intrusion.entryTick;

        if (elapsed >= SIEGE_ELIGIBILITY_TICKS) {
          intrusion.siegeEligible = true;
          notifyPlayer(
            player.name,
            `§a⚔ Siege eligibility unlocked for §b${village.name}§a! Type §f/siege ${village.name}§a to begin.`
          );
          notifyPlayer(
            village.owner,
            `§4🔔 SIEGE READY: §c${player.name}§4 is now eligible to besiege §b${village.name}§4!`
          );
        } else if (tick - intrusion.lastReminderTick >= REMINDER_INTERVAL_TICKS) {
          const remaining = Math.ceil(
            (SIEGE_ELIGIBILITY_TICKS - elapsed) / 20
          );
          notifyPlayer(
            player.name,
            `§6⏳ Siege eligible in §f${remaining}s§6 — stay inside §b${village.name}§6's border.`
          );
          notifyPlayer(
            village.owner,
            `§c⚠ §e${player.name}§c is still inside §b${village.name}§c's border — siege eligible in §f${remaining}s§c.`
          );
          intrusion.lastReminderTick = tick;
        }
      }
    }
  }

  // Players who left a border
  for (const [key, intrusion] of activeIntrusions.entries()) {
    if (currentKeys.has(key)) continue;
    const village = getVillage(intrusion.villageId);
    notifyPlayer(
      intrusion.playerName,
      `§7You left the border of §b${village?.name ?? "a village"}§7. Siege eligibility lost.`
    );
    if (village?.owner && intrusion.siegeEligible) {
      notifyPlayer(
        village.owner,
        `§a${intrusion.playerName} has left the border of §b${village.name}§a.`
      );
    }
    activeIntrusions.delete(key);
  }

  // Render border particles periodically
  if (tick - lastParticleTick >= PARTICLE_INTERVAL_TICKS) {
    lastParticleTick = tick;
    renderBordersForPlayers();
  }
}

function renderBordersForPlayers(): void {
  const players = world.getPlayers();
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
      const isEnemy =
        playerKingdom &&
        village.kingdomId !== playerKingdom.id &&
        areAtWar(playerKingdom.id, village.kingdomId);

      // Only render border particles if the player is near this village's edge
      const edgeDist = Math.max(
        Math.abs(px - vx) - BORDER_RADIUS,
        Math.abs(pz - vz) - BORDER_RADIUS
      );

      if (edgeDist > 16 || edgeDist < -16) continue;

      const particleId = isEnemy
        ? "minecraft:basic_flame_particle"
        : "minecraft:villager_happy";

      renderBorderParticles(village, dim, py, particleId);
    }
  }
}

function renderBorderParticles(
  village: VillageData,
  dimension: Dimension,
  playerY: number,
  particleId: string
): void {
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

function trySpawnParticle(
  dimension: Dimension,
  particleId: string,
  x: number,
  y: number,
  z: number
): void {
  try {
    dimension.spawnParticle(particleId, { x, y, z });
  } catch {
    // Out of range or unsupported particle — silently ignore
  }
}

export function isSiegeEligible(
  playerName: string,
  villageId: string
): boolean {
  const key = intrusionKey(playerName, villageId);
  return activeIntrusions.get(key)?.siegeEligible ?? false;
}

export function getActiveBorderIntrusions(): BorderIntrusion[] {
  return [...activeIntrusions.values()];
}

export function clearBorderIntrusion(
  playerName: string,
  villageId: string
): void {
  activeIntrusions.delete(intrusionKey(playerName, villageId));
}
