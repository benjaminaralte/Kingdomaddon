import { world } from "@minecraft/server";
import type { VillageData, GuardPoleData, GuardPoleType, TroopType } from "../types/index.js";
import { MAX_GUARDS_PER_POLE } from "../types/index.js";
import { generateId, saveVillage, getAllVillages } from "../storage/index.js";
import { notifyPlayer } from "../utils/notify.js";

const GUARD_ENTITY_MAP: Record<TroopType, string> = {
  cityGuards: "kingdoms:city_guard",
  spearmen: "kingdoms:spearman",
  archers: "kingdoms:archer",
  cavalry: "kingdoms:cavalry",
};

export function registerGuardPole(
  village: VillageData,
  location: { x: number; y: number; z: number },
  type: GuardPoleType
): boolean {
  if (village.guardPoles.length >= 32) {
    notifyPlayer(village.owner, "§cMaximum guard poles reached for this village.");
    return false;
  }

  const pole: GuardPoleData = {
    id: generateId(),
    location,
    type,
    assignedGuards: 0,
    troopType: "cityGuards",
    entityIds: [],
  };

  village.guardPoles.push(pole);
  saveVillage(village);
  notifyPlayer(village.owner, `§aGuard pole (${type}) registered in §b${village.name}§a.`);
  return true;
}

export function removeGuardPole(village: VillageData, poleId: string): void {
  const idx = village.guardPoles.findIndex((p) => p.id === poleId);
  if (idx === -1) return;

  const pole = village.guardPoles[idx];
  despawnPoleGuards(village, pole);
  village.guardPoles.splice(idx, 1);
  saveVillage(village);
}

export function assignGuardsToPole(
  village: VillageData,
  poleId: string,
  count: number,
  troopType: TroopType
): boolean {
  const pole = village.guardPoles.find((p) => p.id === poleId);
  if (!pole) return false;

  if (count > MAX_GUARDS_PER_POLE) {
    notifyPlayer(village.owner, `§cMax ${MAX_GUARDS_PER_POLE} guards per pole.`);
    return false;
  }

  if (village.troops[troopType] < count) {
    notifyPlayer(village.owner, `§cNot enough ${troopType} in barracks.`);
    return false;
  }

  despawnPoleGuards(village, pole);

  pole.assignedGuards = count;
  pole.troopType = troopType;

  spawnPoleGuards(village, pole);
  saveVillage(village);

  notifyPlayer(
    village.owner,
    `§aAssigned ${count} ${troopType} to guard pole in §b${village.name}§a.`
  );
  return true;
}

function spawnPoleGuards(village: VillageData, pole: GuardPoleData): void {
  const dim = world.getDimension(village.location.dimension);
  const entityType = GUARD_ENTITY_MAP[pole.troopType];
  pole.entityIds = [];

  for (let i = 0; i < pole.assignedGuards; i++) {
    try {
      const angle = (i / pole.assignedGuards) * Math.PI * 2;
      const entity = dim.spawnEntity(entityType, {
        x: pole.location.x + Math.cos(angle) * 2,
        y: pole.location.y,
        z: pole.location.z + Math.sin(angle) * 2,
      });

      entity.setDynamicProperty("kc:pole_id", pole.id);
      entity.setDynamicProperty("kc:village_id", village.id);
      entity.nameTag = `${pole.troopType} [${village.name}]`;
      pole.entityIds.push(entity.id);
    } catch {
      // chunk not loaded
    }
  }
}

function despawnPoleGuards(village: VillageData, pole: GuardPoleData): void {
  const dim = world.getDimension(village.location.dimension);
  for (const eid of pole.entityIds) {
    try {
      const entities = dim.getEntities({ type: GUARD_ENTITY_MAP[pole.troopType] });
      const entity = entities.find((e) => e.id === eid);
      if (entity) entity.remove();
    } catch { /* ignore */ }
  }
  pole.entityIds = [];
}

export function refreshAllGuards(): void {
  for (const village of getAllVillages()) {
    if (!village.owner) continue;
    for (const pole of village.guardPoles) {
      if (pole.assignedGuards > 0 && pole.entityIds.length === 0) {
        spawnPoleGuards(village, pole);
      }
    }
  }
}

export function recallGuardsFromPole(village: VillageData, poleId: string): void {
  const pole = village.guardPoles.find((p) => p.id === poleId);
  if (!pole) return;
  despawnPoleGuards(village, pole);
  pole.assignedGuards = 0;
  saveVillage(village);
  notifyPlayer(village.owner, `§eGuards recalled from pole in §b${village.name}§e.`);
}
