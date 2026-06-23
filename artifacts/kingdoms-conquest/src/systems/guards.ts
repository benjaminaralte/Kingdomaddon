import { world } from "@minecraft/server";
import type { VillageData, GuardPoleData, GuardPoleType, TroopType } from "../types/index.js";
import { spawnMountedUnit, MOUNTED_ENTITIES } from "./deployTroops.js";
import { MAX_GUARDS_PER_POLE } from "../types/index.js";
import { generateId, saveVillage, getAllVillages } from "../storage/index.js";
import { notifyPlayer } from "../utils/notify.js";

// Clockwise patrol route around the kingdom outer wall (offsets from spawn centre)
const WALL_PATROL_OFFSETS: Array<{ dx: number; dz: number }> = [
  { dx:   0, dz: -27 }, // 0: north wall centre
  { dx:  27, dz: -27 }, // 1: NE corner
  { dx:  27, dz:   0 }, // 2: east wall centre
  { dx:   4, dz:  27 }, // 3: gate — right tower
  { dx:  -4, dz:  27 }, // 4: gate — left tower
  { dx: -27, dz:  27 }, // 5: SW corner
  { dx: -27, dz:   0 }, // 6: west wall centre
  { dx: -27, dz: -27 }, // 7: NW corner
];

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

  if (availableTroops(village, troopType) + (pole.troopType === troopType ? pole.assignedGuards : 0) < count) {
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

  // Wall/gate poles get first pick of troops (highest priority → lowest):
  // gate > watchtower > road > village
  const PRIORITY: Record<GuardPoleType, number> = {
    gate: 0, watchtower: 1, road: 2, village: 3,
  };
  const orderedPoles = [...village.guardPoles].sort(
    (a, b) => PRIORITY[a.type] - PRIORITY[b.type]
  );

  for (const pole of orderedPoles) {
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

/**
 * Auto-registers spearmen-only wall-patrol guard poles for a spawned kingdom.
 * Called once when a city settlement is claimed. Poles are placed at 8 strategic
 * positions around the outer wall. They are filled immediately if spearmen are
 * available, otherwise they remain as unfilled requests — fillUnderstaffedPoles
 * will staff them (with gate/watchtower priority) whenever spearmen are trained.
 * Also persists the patrol route and kingdom centre so tickWallPatrols can move
 * the guards along the perimeter.
 */
export function setupKingdomWallGuards(
  village: VillageData,
  center: { x: number; y: number; z: number }
): void {
  const dim = world.getDimension(village.location.dimension);

  // 8 posts ordered to match WALL_PATROL_OFFSETS (same clockwise sequence)
  const posts: Array<{ dx: number; dz: number; type: GuardPoleType }> = [
    { dx:   0, dz: -27, type: "watchtower" }, // north wall centre
    { dx:  27, dz: -27, type: "watchtower" }, // NE corner
    { dx:  27, dz:   0, type: "watchtower" }, // east wall centre
    { dx:   4, dz:  27, type: "gate"       }, // south gate — right tower
    { dx:  -4, dz:  27, type: "gate"       }, // south gate — left tower
    { dx: -27, dz:  27, type: "watchtower" }, // SW corner
    { dx: -27, dz:   0, type: "watchtower" }, // west wall centre
    { dx: -27, dz: -27, type: "watchtower" }, // NW corner
  ];

  let assigned = 0;

  for (const { dx, dz, type } of posts) {
    if (village.guardPoles.length >= 32) break;

    const location = { x: center.x + dx, y: center.y, z: center.z + dz };
    const toAssign = Math.min(MAX_GUARDS_PER_POLE, availableTroops(village, "spearmen"));

    const pole: GuardPoleData = {
      id: generateId(),
      location,
      type,
      assignedGuards: toAssign,
      requestedGuards: MAX_GUARDS_PER_POLE,
      troopType: "spearmen",
      entityIds: [],
    };

    village.guardPoles.push(pole);

    if (toAssign > 0) {
      spawnPoleGuards(village, pole);
      assigned += toAssign;
    }
  }

  // Persist the clockwise patrol route (absolute coords) and the kingdom centre
  // so that tickWallPatrols can move guards along the perimeter without needing
  // to re-derive the geometry on every tick.
  const route = WALL_PATROL_OFFSETS.map(({ dx, dz }) => ({
    x: center.x + dx,
    y: center.y,
    z: center.z + dz,
  }));
  try {
    world.setDynamicProperty(`kc:wpatrol_${village.id}`, JSON.stringify(route));
    world.setDynamicProperty(`kc:wcenter_${village.id}`, JSON.stringify(center));
  } catch { /* skip if world property limit hit */ }

  // Stagger initial patrol-waypoint indices so spawned guards spread out
  // immediately rather than all heading to the same first waypoint.
  if (assigned > 0) {
    let stagger = 0;
    const wallPoles = village.guardPoles.filter(
      (p) => p.type === "watchtower" || p.type === "gate"
    );
    for (const pole of wallPoles) {
      try {
        const guards = dim.getEntities({
          type: GUARD_ENTITY_MAP["spearmen"],
          location: pole.location,
          maxDistance: 5,
        });
        for (const ent of guards) {
          if (!pole.entityIds.includes(ent.id)) continue;
          ent.setDynamicProperty("kc:patrol_wp", stagger % route.length);
          stagger++;
        }
      } catch { /* chunk not loaded */ }
    }
  }

  saveVillage(village);

  if (assigned > 0) {
    notifyPlayer(
      village.owner,
      `§a⚔ ${assigned} spearmen deployed to kingdom wall posts (${posts.length} posts). Train more to fill remaining slots.`
    );
  } else {
    notifyPlayer(
      village.owner,
      `§e⚔ Kingdom wall posts established (${posts.length} stations). Train spearmen — they will be assigned with priority when ready.`
    );
  }
}

/**
 * Called on a short interval (~20 ticks). Moves each wall patrol guard
 * (watchtower / gate poles) one step along the clockwise perimeter route.
 * When a guard reaches its current waypoint it advances to the next one.
 * enforceGuardPositions skips these poles so it does not fight the patrol.
 */
export function tickWallPatrols(): void {
  for (const village of getAllVillages()) {
    if (!village.owner) continue;

    // Load the pre-computed route and kingdom centre for this village
    let route: Array<{ x: number; y: number; z: number }> | null = null;
    let center: { x: number; y: number; z: number }  | null = null;
    try {
      const rRaw = world.getDynamicProperty(`kc:wpatrol_${village.id}`) as string | undefined;
      const cRaw = world.getDynamicProperty(`kc:wcenter_${village.id}`) as string | undefined;
      if (!rRaw || !cRaw) continue;
      route  = JSON.parse(rRaw);
      center = JSON.parse(cRaw);
    } catch { continue; }
    if (!route || !center || route.length === 0) continue;

    const wallPoles = village.guardPoles.filter(
      (p) => (p.type === "watchtower" || p.type === "gate") && p.entityIds.length > 0
    );
    if (wallPoles.length === 0) continue;

    const dim = world.getDimension(village.location.dimension);
    const allEntityIds = new Set(wallPoles.flatMap((p) => p.entityIds));

    try {
      // Search within 50 blocks of the kingdom centre (outer wall ≤ 38 blocks away)
      const candidates = dim.getEntities({
        type: GUARD_ENTITY_MAP["spearmen"],
        location: center,
        maxDistance: 50,
      });

      for (const entity of candidates) {
        if (!allEntityIds.has(entity.id)) continue;

        // Read the guard's current patrol-waypoint index
        let wpIdx = 0;
        try {
          const stored = entity.getDynamicProperty("kc:patrol_wp");
          if (typeof stored === "number") wpIdx = stored;
        } catch { /* default to 0 */ }

        const target = route[wpIdx % route.length];
        const loc    = entity.location;
        const dx     = target.x - loc.x;
        const dz     = target.z - loc.z;
        const dist   = Math.sqrt(dx * dx + dz * dz);

        if (dist < 3) {
          // Reached this waypoint — advance clockwise
          try {
            entity.setDynamicProperty("kc:patrol_wp", (wpIdx + 1) % route.length);
          } catch { /* skip */ }
        } else {
          // Step toward the waypoint (4 blocks per second at 20-tick interval)
          const step = Math.min(4, dist - 0.5);
          try {
            entity.teleport({
              x: loc.x + (dx / dist) * step,
              y: loc.y,
              z: loc.z + (dz / dist) * step,
            });
          } catch { /* chunk unloaded */ }
        }
      }
    } catch { /* chunk unloaded */ }
  }
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
      // Wall patrol guards move freely along the perimeter — tickWallPatrols
      // handles their positioning, so enforcement would fight the patrol.
      if (pole.type === "watchtower" || pole.type === "gate") continue;
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
