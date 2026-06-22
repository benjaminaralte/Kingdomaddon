import { world } from "@minecraft/server";
import type { VillageData, GuardPoleData, GuardPoleType, TroopType } from "../types/index.js";
import { spawnMountedUnit, MOUNTED_ENTITIES } from "./deployTroops.js";
import { MAX_GUARDS_PER_POLE } from "../types/index.js";
import { generateId, saveVillage, getAllVillages } from "../storage/index.js";
import { notifyPlayer } from "../utils/notify.js";

const GUARD_ENTITY_MAP: Record<TroopType, string> = {
  cityGuards:      "kingdoms:city_guard",
  spearmen:        "kingdoms:spearman",
  archers:         "kingdoms:archer",
  cavalry:         "kingdoms:cavalry",
  heavyKnight:     "kingdoms:heavy_knight",
  samurai:         "kingdoms:samurai",
  mercenaryLancer: "kingdoms:mercenary_lancer",
  legionary:       "kingdoms:legionary",
};

function getBestAvailableTroopType(village: VillageData): TroopType {
  const types: TroopType[] = ["samurai", "legionary", "mercenaryLancer", "heavyKnight", "cavalry", "spearmen", "archers", "cityGuards"];
  for (const t of types) {
    if (village.troops[t] > 0) return t;
  }
  return "cityGuards";
}

function countAssignedTroops(village: VillageData, troopType: TroopType): number {
  return village.guardPoles.reduce((sum, pole) => {
    return sum + (pole.troopType === troopType ? pole.assignedGuards : 0);
  }, 0);
}

function availableTroops(village: VillageData, troopType: TroopType): number {
  return Math.max(0, village.troops[troopType] - countAssignedTroops(village, troopType));
}

export function registerGuardPole(
  village: VillageData,
  location: { x: number; y: number; z: number },
  type: GuardPoleType
): boolean {
  if (village.guardPoles.length >= 32) {
    notifyPlayer(village.owner, "§cMaximum guard poles reached for this village.");
    return false;
  }

  const troopType = getBestAvailableTroopType(village);
  const maxCanAssign = Math.min(MAX_GUARDS_PER_POLE, availableTroops(village, troopType));

  const pole: GuardPoleData = {
    id: generateId(),
    location,
    type,
    assignedGuards: maxCanAssign,
    requestedGuards: MAX_GUARDS_PER_POLE,
    troopType,
    entityIds: [],
  };

  village.guardPoles.push(pole);

  if (maxCanAssign > 0) {
    spawnPoleGuards(village, pole);
    notifyPlayer(
      village.owner,
      `§aGuard pole (${type}) placed — §b${maxCanAssign}/${MAX_GUARDS_PER_POLE} guards assigned§a in §b${village.name}§a.`
    );
  } else {
    notifyPlayer(
      village.owner,
      `§eGuard pole (${type}) placed in §b${village.name}§e — no guards available yet, will fill when recruited.`
    );
  }

  saveVillage(village);
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

  if (availableTroops(village, troopType) + pole.assignedGuards < count) {
    notifyPlayer(village.owner, `§cNot enough available ${troopType} (need ${count}, free: ${availableTroops(village, troopType) + (pole.troopType === troopType ? pole.assignedGuards : 0)}).`);
    return false;
  }

  despawnPoleGuards(village, pole);

  pole.assignedGuards = count;
  pole.requestedGuards = count;
  pole.troopType = troopType;

  spawnPoleGuards(village, pole);
  saveVillage(village);

  notifyPlayer(
    village.owner,
    `§aAssigned ${count} ${troopType} to guard pole in §b${village.name}§a.`
  );
  return true;
}

export function fillUnderstaffedPoles(village: VillageData): void {
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
      `§e+${toAdd} guard(s) filled post in §b${village.name}§e. (${pole.assignedGuards}/${pole.requestedGuards} at this pole)`
    );
  }

  if (changed) saveVillage(village);
}

function spawnPoleGuards(village: VillageData, pole: GuardPoleData): void {
  const dim = world.getDimension(village.location.dimension);
  const entityType = GUARD_ENTITY_MAP[pole.troopType];
  pole.entityIds = [];

  for (let i = 0; i < pole.assignedGuards; i++) {
    try {
      const count = Math.max(pole.assignedGuards, 1);
      const angle = (i / count) * Math.PI * 2;
      const offset = {
        x: pole.location.x + Math.cos(angle) * 2,
        y: pole.location.y,
        z: pole.location.z + Math.sin(angle) * 2,
      };
      const entity = MOUNTED_ENTITIES.has(entityType)
        ? spawnMountedUnit(dim, entityType, offset)
        : dim.spawnEntity(entityType, offset);

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
  const POLE_SEARCH_RADIUS = 8;
  for (const eid of pole.entityIds) {
    try {
      const nearby = dim.getEntities({
        type: GUARD_ENTITY_MAP[pole.troopType],
        location: pole.location,
        maxDistance: POLE_SEARCH_RADIUS,
      });
      const entity = nearby.find((e) => e.id === eid);
      if (entity) {
        try {
          const mount = (entity as unknown as { getVehicle?: () => import("@minecraft/server").Entity | undefined }).getVehicle?.();
          if (mount) mount.remove();
        } catch {}
        entity.remove();
      }
    } catch { /* chunk not loaded or invalid query */ }
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
    fillUnderstaffedPoles(village);
  }
}

const POLE_RETURN_THRESHOLD = 18;

export function enforceGuardPositions(): void {
  for (const village of getAllVillages()) {
    if (!village.owner) continue;
    const dim = world.getDimension(village.location.dimension);
    for (const pole of village.guardPoles) {
      if (pole.entityIds.length === 0) continue;
      const entityType = GUARD_ENTITY_MAP[pole.troopType];
      if (!entityType) continue;

      const stillPresent: string[] = [];
      try {
        const nearby = dim.getEntities({
          type: entityType,
          location: pole.location,
          maxDistance: POLE_RETURN_THRESHOLD + 32,
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
                z: pole.location.z + (Math.random() * 4 - 2),
              });
            } catch { /* chunk not loaded */ }
          }
        }
      } catch { /* chunk not loaded */ }

      pole.entityIds = stillPresent;
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
