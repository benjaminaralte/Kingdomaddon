import { Player, ItemStack, EntityInventoryComponent, Entity, system } from "@minecraft/server";
import type { VillageData, TroopType } from "../types/index.js";
import { saveVillage } from "../storage/index.js";
import { notifyPlayer } from "../utils/notify.js";

export const TROOP_TOKEN_MAP: Record<string, { troopType: TroopType; entityId: string; label: string }> = {
  "kingdoms:guard_token":               { troopType: "cityGuards",      entityId: "kingdoms:city_guard",        label: "City Guard"       },
  "kingdoms:spearman_token":            { troopType: "spearmen",         entityId: "kingdoms:spearman",          label: "Spearman"         },
  "kingdoms:archer_token":              { troopType: "archers",          entityId: "kingdoms:archer",            label: "Archer"           },
  "kingdoms:cavalry_token":             { troopType: "cavalry",          entityId: "kingdoms:cavalry",           label: "Cavalry"          },
  "kingdoms:heavy_knight_token":        { troopType: "heavyKnight",      entityId: "kingdoms:heavy_knight",      label: "Heavy Knight"     },
  "kingdoms:samurai_token":             { troopType: "samurai",          entityId: "kingdoms:samurai",           label: "Samurai"          },
  "kingdoms:mercenary_lancer_token":    { troopType: "mercenaryLancer",  entityId: "kingdoms:mercenary_lancer",  label: "Mercenary Lancer" },
  "kingdoms:legionary_token":           { troopType: "legionary",        entityId: "kingdoms:legionary",         label: "Legionary"        },
};

export const MOUNTED_ENTITIES = new Set(["kingdoms:cavalry", "kingdoms:mercenary_lancer"]);

let _horseCounter = 0;

export function spawnMountedUnit(
  dim: import("@minecraft/server").Dimension,
  entityId: string,
  offset: { x: number; y: number; z: number }
): Entity {
  const tag = `kc_wh_${_horseCounter++}`;
  const horse = dim.spawnEntity("kingdoms:war_horse", offset);
  horse.addTag(tag);
  const rider = dim.spawnEntity(entityId, offset);
  system.runTimeout(() => {
    try {
      rider.runCommandAsync(`ride @s start_riding @e[tag=${tag},c=1]`);
    } catch { /* entity may have been removed */ }
    try { horse.removeTag(tag); } catch { /* ok */ }
  }, 10);
  return rider;
}

export interface TroopPickup {
  cityGuards: number;
  spearmen: number;
  archers: number;
  cavalry: number;
  heavyKnight: number;
  samurai: number;
  mercenaryLancer: number;
  legionary: number;
}

export function pickupTroops(
  player: Player,
  village: VillageData,
  pickup: TroopPickup
): boolean {
  const total =
    pickup.cityGuards + pickup.spearmen + pickup.archers + pickup.cavalry +
    pickup.heavyKnight + pickup.samurai + pickup.mercenaryLancer + pickup.legionary;

  if (total <= 0) {
    notifyPlayer(player.name, "§cSelect at least one troop to pick up.");
    return false;
  }

  if (pickup.cityGuards     > village.troops.cityGuards)                             { notifyPlayer(player.name, `§cNot enough City Guards (have ${village.troops.cityGuards}).`);           return false; }
  if (pickup.spearmen       > village.troops.spearmen)                               { notifyPlayer(player.name, `§cNot enough Spearmen (have ${village.troops.spearmen}).`);                 return false; }
  if (pickup.archers        > village.troops.archers)                                { notifyPlayer(player.name, `§cNot enough Archers (have ${village.troops.archers}).`);                   return false; }
  if (pickup.cavalry        > village.troops.cavalry)                                { notifyPlayer(player.name, `§cNot enough Cavalry (have ${village.troops.cavalry}).`);                   return false; }
  if (pickup.heavyKnight    > (village.troops.heavyKnight ?? 0))                     { notifyPlayer(player.name, `§cNot enough Heavy Knights (have ${village.troops.heavyKnight ?? 0}).`);   return false; }
  if (pickup.samurai        > (village.troops.samurai ?? 0))                         { notifyPlayer(player.name, `§cNot enough Samurai (have ${village.troops.samurai ?? 0}).`);             return false; }
  if (pickup.mercenaryLancer > (village.troops.mercenaryLancer ?? 0))                { notifyPlayer(player.name, `§cNot enough Mercenary Lancers (have ${village.troops.mercenaryLancer ?? 0}).`); return false; }
  if (pickup.legionary      > (village.troops.legionary ?? 0))                       { notifyPlayer(player.name, `§cNot enough Legionaries (have ${village.troops.legionary ?? 0}).`);       return false; }

  const inv = player.getComponent(EntityInventoryComponent.componentId) as EntityInventoryComponent | undefined;
  if (!inv?.container) {
    notifyPlayer(player.name, "§cInventory unavailable.");
    return false;
  }
  const container = inv.container;

  const toGive: Array<{ itemId: string; count: number }> = [
    { itemId: "kingdoms:guard_token",            count: pickup.cityGuards      },
    { itemId: "kingdoms:spearman_token",         count: pickup.spearmen        },
    { itemId: "kingdoms:archer_token",           count: pickup.archers         },
    { itemId: "kingdoms:cavalry_token",          count: pickup.cavalry         },
    { itemId: "kingdoms:heavy_knight_token",     count: pickup.heavyKnight     },
    { itemId: "kingdoms:samurai_token",          count: pickup.samurai         },
    { itemId: "kingdoms:mercenary_lancer_token", count: pickup.mercenaryLancer },
    { itemId: "kingdoms:legionary_token",        count: pickup.legionary       },
  ].filter((t) => t.count > 0);

  let slotsNeeded = 0;
  for (const { count } of toGive) slotsNeeded += Math.ceil(count / 64);

  let freeSlots = 0;
  for (let i = 0; i < container.size; i++) {
    if (!container.getItem(i)) freeSlots++;
  }

  if (freeSlots < slotsNeeded) {
    notifyPlayer(player.name, `§cNot enough inventory space (need ${slotsNeeded} free slots).`);
    return false;
  }

  village.troops.cityGuards       -= pickup.cityGuards;
  village.troops.spearmen         -= pickup.spearmen;
  village.troops.archers          -= pickup.archers;
  village.troops.cavalry          -= pickup.cavalry;
  village.troops.heavyKnight       = (village.troops.heavyKnight ?? 0) - pickup.heavyKnight;
  village.troops.samurai           = (village.troops.samurai ?? 0) - pickup.samurai;
  village.troops.mercenaryLancer   = (village.troops.mercenaryLancer ?? 0) - pickup.mercenaryLancer;
  village.troops.legionary         = (village.troops.legionary ?? 0) - pickup.legionary;
  saveVillage(village);

  for (const { itemId, count } of toGive) {
    let remaining = count;
    for (let i = 0; i < container.size && remaining > 0; i++) {
      const slot = container.getItem(i);
      if (!slot) {
        const give = Math.min(remaining, 64);
        container.setItem(i, new ItemStack(itemId, give));
        remaining -= give;
      } else if (slot.typeId === itemId && slot.amount < 64) {
        const give = Math.min(remaining, 64 - slot.amount);
        slot.amount += give;
        container.setItem(i, slot);
        remaining -= give;
      }
    }
  }

  const summary = toGive.map(({ itemId, count }) => `${count} ${TROOP_TOKEN_MAP[itemId]?.label}`).join(", ");
  notifyPlayer(player.name, `§a⚔ Picked up: §f${summary}§a from §b${village.name}§a. Right-click any token to deploy!`);
  return true;
}

export function releaseTroops(player: Player): boolean {
  const inv = player.getComponent(EntityInventoryComponent.componentId) as EntityInventoryComponent | undefined;
  if (!inv?.container) return false;
  const container = inv.container;

  const found: Record<string, number> = {};
  for (let i = 0; i < container.size; i++) {
    const slot = container.getItem(i);
    if (!slot) continue;
    if (TROOP_TOKEN_MAP[slot.typeId]) {
      found[slot.typeId] = (found[slot.typeId] ?? 0) + slot.amount;
    }
  }

  const total = Object.values(found).reduce((a, b) => a + b, 0);
  if (total === 0) return false;

  const loc = player.location;
  const dim = player.dimension;
  const parts: string[] = [];
  const actuallySpawned: Record<string, number> = {};

  // Spawn first — only deduct tokens for units that actually made it in-world
  for (const [itemId, count] of Object.entries(found)) {
    const info = TROOP_TOKEN_MAP[itemId];
    if (!info) continue;

    let spawned = 0;
    for (let n = 0; n < count; n++) {
      try {
        const offset = {
          x: loc.x + (Math.random() * 4 - 2),
          y: loc.y,
          z: loc.z + (Math.random() * 4 - 2),
        };
        let entity: Entity;
        if (MOUNTED_ENTITIES.has(info.entityId)) {
          entity = spawnMountedUnit(dim, info.entityId, offset);
        } else {
          entity = dim.spawnEntity(info.entityId, offset);
        }
        entity.nameTag = `${player.name}'s ${info.label}`;
        entity.setDynamicProperty("kc:owner", player.name);
        spawned++;
      } catch {
        break; // chunk not loaded — stop trying this type
      }
    }

    if (spawned > 0) {
      actuallySpawned[itemId] = spawned;
      parts.push(`${spawned} ${info.label}`);
    }
  }

  if (parts.length === 0) {
    notifyPlayer(player.name, "§cCould not deploy troops (chunk not loaded).");
    return false;
  }

  // Remove only the tokens for units that were successfully spawned
  for (const [itemId, spawnedCount] of Object.entries(actuallySpawned)) {
    let toRemove = spawnedCount;
    for (let i = 0; i < container.size && toRemove > 0; i++) {
      const slot = container.getItem(i);
      if (!slot || slot.typeId !== itemId) continue;
      if (slot.amount <= toRemove) {
        toRemove -= slot.amount;
        container.setItem(i, undefined);
      } else {
        slot.amount -= toRemove;
        container.setItem(i, slot);
        toRemove = 0;
      }
    }
  }

  notifyPlayer(player.name, `§c⚔ DEPLOYED: §f${parts.join(", ")}§c into battle!`);
  return true;
}

const ENTITY_TO_TOKEN: Record<string, string> = {
  "kingdoms:city_guard":        "kingdoms:guard_token",
  "kingdoms:spearman":          "kingdoms:spearman_token",
  "kingdoms:archer":            "kingdoms:archer_token",
  "kingdoms:cavalry":           "kingdoms:cavalry_token",
  "kingdoms:heavy_knight":      "kingdoms:heavy_knight_token",
  "kingdoms:samurai":           "kingdoms:samurai_token",
  "kingdoms:mercenary_lancer":  "kingdoms:mercenary_lancer_token",
  "kingdoms:legionary":         "kingdoms:legionary_token",
};

const RECALL_RADIUS = 48;

export function recallNearbyTroops(player: Player): boolean {
  const dim = player.dimension;
  const loc = player.location;

  const found: Record<string, number> = {};
  const toRemove: Entity[] = [];

  for (const entityType of Object.keys(ENTITY_TO_TOKEN)) {
    try {
      const entities = dim.getEntities({ type: entityType, location: loc, maxDistance: RECALL_RADIUS });
      for (const entity of entities) {
        if (entity.getDynamicProperty("kc:owner") === player.name) {
          found[entityType] = (found[entityType] ?? 0) + 1;
          toRemove.push(entity);
        }
      }
    } catch { /* chunk unloaded */ }
  }

  if (toRemove.length === 0) {
    notifyPlayer(player.name, "§eNo your soldiers found within 48 blocks.");
    return false;
  }

  const inv = player.getComponent(EntityInventoryComponent.componentId) as EntityInventoryComponent | undefined;
  if (!inv?.container) return false;
  const container = inv.container;

  const parts: string[] = [];

  for (const [entityType, count] of Object.entries(found)) {
    const tokenId = ENTITY_TO_TOKEN[entityType];
    const info = TROOP_TOKEN_MAP[tokenId];
    if (!tokenId || !info) continue;

    let remaining = count;
    for (let i = 0; i < container.size && remaining > 0; i++) {
      const slot = container.getItem(i);
      if (!slot) {
        const give = Math.min(remaining, 64);
        container.setItem(i, new ItemStack(tokenId, give));
        remaining -= give;
      } else if (slot.typeId === tokenId && slot.amount < 64) {
        const give = Math.min(remaining, 64 - slot.amount);
        slot.amount += give;
        container.setItem(i, slot);
        remaining -= give;
      }
    }

    const recalled = count - remaining;
    if (recalled > 0) parts.push(`${recalled} ${info.label}`);
  }

  for (const entity of toRemove) {
    try {
      const mount = entity.getVehicle();
      if (mount) mount.remove();
    } catch {}
    try { entity.remove(); } catch { /* already removed */ }
  }

  if (parts.length === 0) {
    notifyPlayer(player.name, "§cInventory full — soldiers had nowhere to go.");
    return false;
  }

  notifyPlayer(player.name, `§a📜 Recalled: §f${parts.join(", ")}§a to your inventory.`);
  return true;
}

export function garrisonDeployedSoldiers(
  attackerName: string,
  village: VillageData,
  dimension: import("@minecraft/server").Dimension
): number {
  const entityToTroop: Record<string, TroopType> = {
    "kingdoms:city_guard":        "cityGuards",
    "kingdoms:spearman":          "spearmen",
    "kingdoms:archer":            "archers",
    "kingdoms:cavalry":           "cavalry",
    "kingdoms:heavy_knight":      "heavyKnight",
    "kingdoms:samurai":           "samurai",
    "kingdoms:mercenary_lancer":  "mercenaryLancer",
    "kingdoms:legionary":         "legionary",
  };

  const loc = village.townHallLocation;
  let total = 0;

  for (const [entityType, troopType] of Object.entries(entityToTroop)) {
    try {
      const entities = dimension.getEntities({ type: entityType, location: loc, maxDistance: 64 });
      for (const entity of entities) {
        if (entity.getDynamicProperty("kc:owner") === attackerName) {
          village.troops[troopType] = (village.troops[troopType] ?? 0) + 1;
          total++;
          try { entity.remove(); } catch { /* already removed */ }
        }
      }
    } catch { /* chunk unloaded */ }
  }

  if (total > 0) saveVillage(village);
  return total;
}

export function countTroopTokens(player: Player): Record<TroopType, number> {
  const inv = player.getComponent(EntityInventoryComponent.componentId) as EntityInventoryComponent | undefined;
  const result: Record<TroopType, number> = {
    cityGuards: 0, spearmen: 0, archers: 0, cavalry: 0, heavyKnight: 0,
    samurai: 0, mercenaryLancer: 0, legionary: 0,
  };
  if (!inv?.container) return result;
  const container = inv.container;

  for (let i = 0; i < container.size; i++) {
    const slot = container.getItem(i);
    if (!slot) continue;
    const info = TROOP_TOKEN_MAP[slot.typeId];
    if (info) result[info.troopType] += slot.amount;
  }

  return result;
}
