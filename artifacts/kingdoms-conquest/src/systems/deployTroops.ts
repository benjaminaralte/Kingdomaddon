import { Player, ItemStack, EntityInventoryComponent } from "@minecraft/server";
import type { VillageData, TroopType } from "../types/index.js";
import { saveVillage } from "../storage/index.js";
import { notifyPlayer } from "../utils/notify.js";

export const TROOP_TOKEN_MAP: Record<string, { troopType: TroopType; entityId: string; label: string }> = {
  "kingdoms:guard_token":    { troopType: "cityGuards", entityId: "kingdoms:city_guard", label: "City Guard" },
  "kingdoms:spearman_token": { troopType: "spearmen",   entityId: "kingdoms:spearman",   label: "Spearman"   },
  "kingdoms:archer_token":   { troopType: "archers",    entityId: "kingdoms:archer",     label: "Archer"     },
  "kingdoms:cavalry_token":  { troopType: "cavalry",    entityId: "kingdoms:cavalry",    label: "Cavalry"    },
};

export interface TroopPickup {
  cityGuards: number;
  spearmen: number;
  archers: number;
  cavalry: number;
}

export function pickupTroops(
  player: Player,
  village: VillageData,
  pickup: TroopPickup
): boolean {
  const total = pickup.cityGuards + pickup.spearmen + pickup.archers + pickup.cavalry;
  if (total <= 0) {
    notifyPlayer(player.name, "§cSelect at least one troop to pick up.");
    return false;
  }

  if (pickup.cityGuards > village.troops.cityGuards) {
    notifyPlayer(player.name, `§cNot enough City Guards (have ${village.troops.cityGuards}).`);
    return false;
  }
  if (pickup.spearmen > village.troops.spearmen) {
    notifyPlayer(player.name, `§cNot enough Spearmen (have ${village.troops.spearmen}).`);
    return false;
  }
  if (pickup.archers > village.troops.archers) {
    notifyPlayer(player.name, `§cNot enough Archers (have ${village.troops.archers}).`);
    return false;
  }
  if (pickup.cavalry > village.troops.cavalry) {
    notifyPlayer(player.name, `§cNot enough Cavalry (have ${village.troops.cavalry}).`);
    return false;
  }

  const inv = player.getComponent(EntityInventoryComponent.componentId) as EntityInventoryComponent | undefined;
  if (!inv?.container) {
    notifyPlayer(player.name, "§cInventory unavailable.");
    return false;
  }
  const container = inv.container;

  const toGive: Array<{ itemId: string; count: number }> = [
    { itemId: "kingdoms:guard_token",    count: pickup.cityGuards },
    { itemId: "kingdoms:spearman_token", count: pickup.spearmen   },
    { itemId: "kingdoms:archer_token",   count: pickup.archers    },
    { itemId: "kingdoms:cavalry_token",  count: pickup.cavalry    },
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

  village.troops.cityGuards -= pickup.cityGuards;
  village.troops.spearmen   -= pickup.spearmen;
  village.troops.archers    -= pickup.archers;
  village.troops.cavalry    -= pickup.cavalry;
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

  for (let i = 0; i < container.size; i++) {
    const slot = container.getItem(i);
    if (slot && TROOP_TOKEN_MAP[slot.typeId]) {
      container.setItem(i, undefined);
    }
  }

  const loc = player.location;
  const dim = player.dimension;
  const parts: string[] = [];

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
        const entity = dim.spawnEntity(info.entityId, offset);
        entity.nameTag = `${player.name}'s ${info.label}`;
        entity.setDynamicProperty("kc:owner", player.name);
        spawned++;
      } catch {
        // chunk unloaded
      }
    }

    if (spawned > 0) parts.push(`${spawned} ${info.label}`);
  }

  if (parts.length === 0) {
    notifyPlayer(player.name, "§cCould not deploy troops (chunk not loaded).");
    return false;
  }

  notifyPlayer(player.name, `§c⚔ DEPLOYED: §f${parts.join(", ")}§c into battle!`);
  return true;
}

export function countTroopTokens(player: Player): Record<TroopType, number> {
  const inv = player.getComponent(EntityInventoryComponent.componentId) as EntityInventoryComponent | undefined;
  const result: Record<TroopType, number> = { cityGuards: 0, spearmen: 0, archers: 0, cavalry: 0 };
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
