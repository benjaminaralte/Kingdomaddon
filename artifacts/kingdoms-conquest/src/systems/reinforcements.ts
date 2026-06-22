import type { TroopData, PendingReinforcement } from "../types/index.js";
import { getAllVillages, getVillage, saveVillage, generateId } from "../storage/index.js";
import { getCurrentTick, distance } from "../utils/tick.js";
import { notifyPlayer, notifyAlert } from "../utils/notify.js";

// ── Travel-time constants ─────────────────────────────────────────────────────
// Base + distance-based + troop-mass component so larger armies march slower.
// Formula: BASE + floor(blocks / 5) * 20 ticks + troops * 15 ticks
//   e.g. 200 blocks, 20 troops → 600 + 800 + 300 = 1 700 ticks (~85 s)
//   e.g. 500 blocks, 50 troops → 600 + 2000 + 750 = 3 350 ticks (~167 s)
const BASE_TRAVEL_TICKS    = 600;   // 30-second minimum march time
const TICKS_PER_5_BLOCKS   = 20;    // 1 s per 5 blocks of distance
const TICKS_PER_TROOP      = 15;    // 0.75 s per troop (mass penalty)

function calcTravelTicks(
  from: { x: number; y: number; z: number },
  to:   { x: number; y: number; z: number },
  totalTroops: number
): number {
  const dist = distance(from, to);
  return (
    BASE_TRAVEL_TICKS +
    Math.floor(dist / 5) * TICKS_PER_5_BLOCKS +
    totalTroops * TICKS_PER_TROOP
  );
}

// ── Send reinforcements (now with travel time) ────────────────────────────────

export function sendReinforcements(
  fromVillageId: string,
  toVillageId:   string,
  troops:        Partial<TroopData>
): boolean {
  const from = getVillage(fromVillageId);
  const to   = getVillage(toVillageId);
  if (!from || !to) return false;

  // Validate availability
  for (const [type, count] of Object.entries(troops) as Array<[keyof TroopData, number]>) {
    if ((count ?? 0) <= 0) continue;
    if ((from.troops[type] ?? 0) < (count ?? 0)) {
      notifyPlayer(from.owner, `§cNot enough ${type} in §b${from.name}§c to send.`);
      return false;
    }
  }

  const totalTroops = (Object.values(troops) as number[]).reduce((s, c) => s + (c ?? 0), 0);
  if (totalTroops === 0) return false;

  // Deduct from source immediately
  for (const [type, count] of Object.entries(troops) as Array<[keyof TroopData, number]>) {
    if ((count ?? 0) <= 0) continue;
    from.troops[type] -= count ?? 0;
  }

  // Calculate travel time based on distance + troop count
  const travelTicks = calcTravelTicks(from.location, to.location, totalTroops);
  const arriveTick  = getCurrentTick() + travelTicks;
  const etaSecs     = Math.ceil(travelTicks / 20);
  const etaMins     = Math.floor(etaSecs / 60);
  const etaLabel    = etaMins > 0
    ? `${etaMins}m ${etaSecs % 60}s`
    : `${etaSecs}s`;

  // Store as a pending reinforcement on the destination village
  const pr: PendingReinforcement = {
    id:               generateId(),
    sourceVillageId:  fromVillageId,
    sourceVillageName: from.name,
    senderName:       from.owner,
    troops,
    arriveTick,
  };
  to.pendingReinforcements ??= [];
  to.pendingReinforcements.push(pr);

  saveVillage(from);
  saveVillage(to);

  const summary = Object.entries(troops)
    .filter(([, c]) => (c ?? 0) > 0)
    .map(([t, c]) => `${c} ${t}`)
    .join(", ");

  notifyPlayer(
    from.owner,
    `§a⚔ Reinforcements dispatched (${summary}) from §b${from.name}§a → §b${to.name}§a. ETA: §e~${etaLabel}§a.`
  );
  if (to.owner !== from.owner) {
    notifyAlert(
      to.owner,
      `§e⚔ Incoming reinforcements (${summary}) from §b${from.name}§e. ETA: §e~${etaLabel}§e.`
    );
  }
  return true;
}

// ── Tick: deliver pending reinforcements when travel time has elapsed ─────────

export function tickPendingReinforcements(currentTick: number): void {
  for (const village of getAllVillages()) {
    if (!village.pendingReinforcements || village.pendingReinforcements.length === 0) continue;

    const remaining: PendingReinforcement[] = [];
    let changed = false;

    for (const pr of village.pendingReinforcements) {
      if (currentTick < pr.arriveTick) {
        remaining.push(pr);
        continue;
      }

      // Deliver troops to destination
      for (const [type, count] of Object.entries(pr.troops) as Array<[keyof TroopData, number]>) {
        if ((count ?? 0) <= 0) continue;
        village.troops[type] = (village.troops[type] ?? 0) + count;
      }

      const summary = Object.entries(pr.troops)
        .filter(([, c]) => (c ?? 0) > 0)
        .map(([t, c]) => `${c} ${t}`)
        .join(", ");

      notifyPlayer(
        village.owner,
        `§a⚔ Reinforcements arrived at §b${village.name}§a! (${summary}) from §b${pr.sourceVillageName}§a.`
      );
      if (pr.senderName !== village.owner) {
        notifyPlayer(pr.senderName, `§a⚔ Your reinforcements reached §b${village.name}§a!`);
      }
      changed = true;
    }

    if (changed) {
      village.pendingReinforcements = remaining;
      saveVillage(village);
    }
  }
}

// ── Cancel an in-transit march and refund troops to the source ───────────────

export function cancelReinforcement(
  reinforcementId: string,
  toVillageId:     string
): boolean {
  const to = getVillage(toVillageId);
  if (!to || !to.pendingReinforcements) return false;

  const idx = to.pendingReinforcements.findIndex((pr) => pr.id === reinforcementId);
  if (idx === -1) return false;

  const pr = to.pendingReinforcements[idx];
  to.pendingReinforcements.splice(idx, 1);
  saveVillage(to);

  // Refund troops to source village
  const from = getVillage(pr.sourceVillageId);
  if (from) {
    for (const [type, count] of Object.entries(pr.troops) as Array<[keyof TroopData, number]>) {
      if ((count ?? 0) <= 0) continue;
      from.troops[type] = (from.troops[type] ?? 0) + count;
    }
    saveVillage(from);
    notifyPlayer(from.owner, `§e↩ March recalled — troops returned to §b${from.name}§e.`);
  }

  if (to.owner !== (from?.owner ?? "")) {
    notifyPlayer(to.owner, `§e↩ Incoming march from §b${pr.sourceVillageName}§e to §b${to.name}§e was recalled.`);
  }

  return true;
}

// ── Get all pending reinforcements owned by a player ─────────────────────────

export interface InTransitEntry {
  pr:          PendingReinforcement;
  toVillageId: string;
  toName:      string;
}

export function getInTransitMarches(playerName: string): InTransitEntry[] {
  const result: InTransitEntry[] = [];
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

export function recallTroops(
  fromVillageId: string,
  toVillageId:   string,
  troops:        Partial<TroopData>
): boolean {
  return sendReinforcements(fromVillageId, toVillageId, troops);
}
