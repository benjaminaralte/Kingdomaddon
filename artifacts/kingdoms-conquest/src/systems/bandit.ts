import { world } from "@minecraft/server";
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
import { notifyPlayer } from "../utils/notify.js";

export function spawnBanditDeserters(village: VillageData, count: number): void {
  const loc = village.location;

  const migrateAngle = Math.random() * Math.PI * 2;
  const campX = loc.x + Math.cos(migrateAngle) * BANDIT_MIGRATE_DISTANCE;
  const campZ = loc.z + Math.sin(migrateAngle) * BANDIT_MIGRATE_DISTANCE;

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
    spawnBanditEntities(nearestCamp, count);
  } else {
    const camp: BanditCampData = {
      id: generateId(),
      location: { x: campX, y: loc.y, z: campZ, dimension: loc.dimension },
      strength: count,
      originKingdomId: village.kingdomId,
      entityIds: [],
    };
    saveBanditCamp(camp);
    spawnBanditEntities(camp, count);
  }
}

function spawnBanditEntities(camp: BanditCampData, count: number): void {
  const dim = world.getDimension(camp.location.dimension);
  for (let i = 0; i < Math.min(count, 5); i++) {
    try {
      const entity = dim.spawnEntity("kingdoms:bandit", {
        x: camp.location.x + (Math.random() * 10 - 5),
        y: camp.location.y,
        z: camp.location.z + (Math.random() * 10 - 5),
      });
      entity.setDynamicProperty("kc:camp_id", camp.id);
      camp.entityIds.push(entity.id);
    } catch {
      // chunk not loaded
    }
  }
  saveBanditCamp(camp);
}

export function tickBandits(): void {
  for (const camp of getAllBanditCamps()) {
    if (Math.random() < 0.3) {
      raidNearbyTargets(camp);
    }
  }
}

function raidNearbyTargets(camp: BanditCampData): void {
  const villages = getAllVillages();
  let target: VillageData | undefined;
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

  const dim = world.getDimension(camp.location.dimension);

  const merchants = dim.getEntities({ type: "kingdoms:merchant" });
  for (const merchant of merchants) {
    const d = distance(merchant.location, camp.location);
    if (d < 120) {
      notifyPlayer(target.owner, `§c⚔ A merchant near §b${target.name}§c is under bandit attack!`);
      merchant.applyDamage(10);
      break;
    }
  }

  const carts = dim.getEntities({ type: "kingdoms:trade_cart" });
  for (const cart of carts) {
    const d = distance(cart.location, camp.location);
    if (d < 120) {
      notifyPlayer(target.owner, `§c⚔ A supply cart near §b${target.name}§c is under bandit attack!`);
      cart.applyDamage(15);
      break;
    }
  }
}

function getTotalVillageDefense(village: VillageData): number {
  return (
    village.troops.cityGuards * 1 +
    village.troops.spearmen * 2 +
    village.troops.archers * 2 +
    village.troops.cavalry * 3
  );
}

export function disbandBanditCamp(campId: string): void {
  const camp = getBanditCamp(campId);
  if (!camp) return;

  const dim = world.getDimension(camp.location.dimension);
  for (const eid of camp.entityIds) {
    try {
      const entities = dim.getEntities({ type: "kingdoms:bandit" });
      const entity = entities.find((e) => e.id === eid);
      if (entity) entity.kill();
    } catch { /* ignore */ }
  }

  deleteBanditCamp(campId);
}

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
