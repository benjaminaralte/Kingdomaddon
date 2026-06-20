import { world, system } from "@minecraft/server";
import type { VillageData, BanditCampData } from "../types/index.js";
import { BANDIT_MIGRATE_DISTANCE } from "../types/index.js";
import {
  generateId,
  getAllBanditCamps,
  getAllVillages,
  getBanditCamp,
  saveBanditCamp,
  deleteBanditCamp,
} from "../storage/index.js";
import { distance } from "../utils/tick.js";
import { notifyAlert } from "../utils/notify.js";
import { triggerAttackAlert } from "./villageAlerts.js";

const MAX_WORLD_CAMPS = 5;
const MIN_WORLD_SPAWN_DIST = 300;
const MAX_WORLD_SPAWN_DIST = 600;
const RAID_FOOD_STEAL_PER_STRENGTH = 3;
const MAX_RAID_FOOD_PCT = 0.15;
const MAX_ENTITIES_PER_CAMP = 10;

// ── Deserter Spawn (triggered by military.ts on food shortage) ────────────────

export function spawnBanditDeserters(village: VillageData, count: number): void {
  const loc = village.location;

  const angle = Math.random() * Math.PI * 2;
  const campX = loc.x + Math.cos(angle) * BANDIT_MIGRATE_DISTANCE;
  const campZ = loc.z + Math.sin(angle) * BANDIT_MIGRATE_DISTANCE;

  let nearestCamp: BanditCampData | undefined;
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
    const camp: BanditCampData = {
      id: generateId(),
      location: { x: campX, y: loc.y, z: campZ, dimension: loc.dimension },
      strength: count,
      originKingdomId: village.kingdomId,
      entityIds: [],
    };
    saveBanditCamp(camp);
    trySpawnEntities(camp);
  }
}

// ── World Spawn (organic — runs on the daily tick) ────────────────────────────

function tryWorldSpawn(): void {
  const camps = getAllBanditCamps();
  if (camps.length >= MAX_WORLD_CAMPS) return;

  const villages = getAllVillages();
  if (villages.length === 0) return;

  const anchor = villages[Math.floor(Math.random() * villages.length)];
  const angle = Math.random() * Math.PI * 2;
  const dist = MIN_WORLD_SPAWN_DIST + Math.random() * (MAX_WORLD_SPAWN_DIST - MIN_WORLD_SPAWN_DIST);
  const campX = anchor.location.x + Math.cos(angle) * dist;
  const campZ = anchor.location.z + Math.sin(angle) * dist;

  // Don't spawn if too close to any village
  for (const v of villages) {
    if (distance(v.location, { x: campX, y: v.location.y, z: campZ }) < MIN_WORLD_SPAWN_DIST) return;
  }

  // Don't spawn too close to an existing camp
  for (const c of camps) {
    if (distance(c.location, { x: campX, y: c.location.y, z: campZ }) < 150) return;
  }

  const strength = 3 + Math.floor(Math.random() * 5);
  const camp: BanditCampData = {
    id: generateId(),
    location: { x: campX, y: anchor.location.y, z: campZ, dimension: anchor.location.dimension },
    strength,
    originKingdomId: "",
    entityIds: [],
  };
  saveBanditCamp(camp);
  trySpawnEntities(camp);
}

// ── Entity Management ─────────────────────────────────────────────────────────

function trySpawnEntities(camp: BanditCampData): void {
  const dim = world.getDimension(camp.location.dimension);
  const liveEntities = getLiveEntities(dim, camp);
  const target = Math.min(camp.strength, MAX_ENTITIES_PER_CAMP);
  const toSpawn = target - liveEntities.length;

  for (let i = 0; i < toSpawn; i++) {
    try {
      const entity = dim.spawnEntity("kingdoms:bandit", {
        x: camp.location.x + (Math.random() * 10 - 5),
        y: camp.location.y,
        z: camp.location.z + (Math.random() * 10 - 5),
      });
      entity.setDynamicProperty("kc:camp_id", camp.id);
      if (!camp.entityIds.includes(entity.id)) {
        camp.entityIds.push(entity.id);
      }
    } catch {
      // chunk not loaded — skip
    }
  }
  saveBanditCamp(camp);
}

function getLiveEntities(
  dim: import("@minecraft/server").Dimension,
  camp: BanditCampData
): import("@minecraft/server").Entity[] {
  const all = dim.getEntities({ type: "kingdoms:bandit" });
  const alive = all.filter((e) => camp.entityIds.includes(e.id));
  return alive;
}

function cleanDeadEntities(camp: BanditCampData): void {
  try {
    const dim = world.getDimension(camp.location.dimension);
    const liveIds = new Set(
      dim.getEntities({ type: "kingdoms:bandit" }).map((e) => e.id)
    );
    const before = camp.entityIds.length;
    camp.entityIds = camp.entityIds.filter((id) => liveIds.has(id));
    const killed = before - camp.entityIds.length;
    if (killed > 0) {
      // Reduce strength proportionally when players kill bandit entities
      camp.strength = Math.max(0, camp.strength - killed);
    }
    saveBanditCamp(camp);
  } catch { /* dimension not loaded */ }
}

// ── Daily Tick ────────────────────────────────────────────────────────────────

export function tickBandits(): void {
  // 1. World spawn — keep the world feeling alive
  tryWorldSpawn();

  const camps = getAllBanditCamps();
  for (const camp of camps) {
    // 2. Clean up dead / despawned entities and reduce strength
    cleanDeadEntities(camp);

    const fresh = getBanditCamp(camp.id);
    if (!fresh) continue;

    // 3. Disband camps that have been wiped out
    if (fresh.strength <= 0) {
      disbandBanditCamp(fresh.id);
      continue;
    }

    // 4. Try to re-fill entity slots for surviving camps
    trySpawnEntities(fresh);

    // 5. Raid nearby villages (30% chance per camp per day)
    if (Math.random() < 0.3) {
      raidNearbyTargets(fresh);
    }
  }
}

// ── Raiding ───────────────────────────────────────────────────────────────────

function raidNearbyTargets(camp: BanditCampData): void {
  const villages = getAllVillages();
  let target: VillageData | undefined;
  let targetDist = 300;

  for (const village of villages) {
    if (village.location.dimension !== camp.location.dimension) continue;
    const d = distance(village.location, camp.location);
    if (d < targetDist) {
      const defense = getTotalVillageDefense(village);
      // Camp will raid if strong enough relative to village defense, or very close
      if (camp.strength > defense * 0.4 || d < 100) {
        targetDist = d;
        target = village;
      }
    }
  }

  if (!target) return;

  // ── Crisis title alert ─────────────────────────────────────────────────────
  triggerAttackAlert(target.owner, target.name, camp.strength);

  const dim = world.getDimension(camp.location.dimension);

  // Attack merchants in range
  const merchants = dim.getEntities({ type: "kingdoms:merchant" });
  for (const merchant of merchants) {
    if (distance(merchant.location, camp.location) < 150) {
      notifyAlert(target.owner, `§c⚔ Bandits are attacking a merchant near §b${target.name}§c!`);
      merchant.applyDamage(12);
      break;
    }
  }

  // Steal food from village (the main raid effect)
  const stolen = Math.min(
    Math.floor(camp.strength * RAID_FOOD_STEAL_PER_STRENGTH),
    Math.floor(target.foodStorage * MAX_RAID_FOOD_PCT),
    50
  );

  if (stolen > 0) {
    target.foodStorage = Math.max(0, target.foodStorage - stolen);
    // Grow the camp a little from successful raid
    camp.strength = Math.min(camp.strength + 1, 30);
    saveBanditCamp(camp);

    // Import saveVillage lazily to avoid circular deps at module level
    system.run(() => {
      try {
        void import("../storage/index.js").then(({ saveVillage }) => {
          saveVillage(target!);
        });
      } catch { /* ignore */ }
    });

    notifyAlert(
      target.owner,
      `§c🏴 Bandits raided §b${target.name}§c! They stole §e${stolen}🌾§c food. (Camp strength: ${camp.strength})`
    );
  } else if (stolen === 0 && target.foodStorage === 0) {
    // Village has no food — bandits loot treasury instead
    const emeraldStolen = Math.min(Math.floor(camp.strength * 0.5), target.treasury, 10);
    if (emeraldStolen > 0) {
      target.treasury -= emeraldStolen;
      system.run(() => {
        void import("../storage/index.js").then(({ saveVillage }) => {
          saveVillage(target!);
        });
      });
      notifyAlert(
        target.owner,
        `§c🏴 Bandits raided §b${target.name}§c! No food — they looted §6${emeraldStolen}💎§c from the treasury.`
      );
    }
  }
}

// ── Defense Calculation ───────────────────────────────────────────────────────

function getTotalVillageDefense(village: VillageData): number {
  return (
    village.troops.cityGuards * 1 +
    village.troops.spearmen * 2 +
    village.troops.archers * 2 +
    village.troops.cavalry * 3
  );
}

// ── Camp Cleanup ──────────────────────────────────────────────────────────────

export function disbandBanditCamp(campId: string): void {
  const camp = getBanditCamp(campId);
  if (!camp) return;

  try {
    const dim = world.getDimension(camp.location.dimension);
    const live = getLiveEntities(dim, camp);
    for (const entity of live) {
      try { entity.kill(); } catch { /* ignore */ }
    }
  } catch { /* dimension not loaded */ }

  deleteBanditCamp(campId);
}

// ── Query Helpers ─────────────────────────────────────────────────────────────

export function getBanditThreatLevel(village: VillageData): "none" | "low" | "medium" | "high" {
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

export function getBanditCampSummary(): string {
  const camps = getAllBanditCamps();
  if (camps.length === 0) return "§7No active bandit camps.";
  return camps.map((c, i) =>
    `§c⚔ Camp #${i + 1}§r  Strength: §e${c.strength}§r  ` +
    `Entities: ${c.entityIds.length}  ` +
    `Pos: §7${Math.round(c.location.x)},${Math.round(c.location.z)}`
  ).join("\n");
}
