import { Player, ItemStack, EntityInventoryComponent } from "@minecraft/server";
import type { VillageData } from "../types/index.js";
import { getVillage, saveVillage, getAllVillages } from "../storage/index.js";
import { notifyPlayer } from "../utils/notify.js";

export function depositEmeralds(player: Player, villageId: string, amount: number): boolean {
  const village = getVillage(villageId);
  if (!village || village.owner !== player.name) return false;

  const inv = player.getComponent(EntityInventoryComponent.componentId) as EntityInventoryComponent | undefined;
  if (!inv) return false;
  const container = inv.container;
  if (!container) return false;

  let removed = 0;

  for (let i = 0; i < container.size && removed < amount; i++) {
    const item = container.getItem(i);
    if (!item || item.typeId !== "minecraft:emerald") continue;
    const take = Math.min(item.amount, amount - removed);
    removed += take;
    if (take >= item.amount) {
      container.setItem(i, undefined);
    } else {
      item.amount -= take;
      container.setItem(i, item);
    }
  }

  if (removed === 0) {
    notifyPlayer(player.name, "§cNo emeralds in inventory.");
    return false;
  }

  village.treasury += removed;
  saveVillage(village);
  notifyPlayer(player.name, `§aDeposited ${removed}💎 into §b${village.name}§a treasury. (Total: ${village.treasury}💎)`);
  return true;
}

export function withdrawEmeralds(player: Player, villageId: string, amount: number): boolean {
  const village = getVillage(villageId);
  if (!village || village.owner !== player.name) return false;
  if (village.treasury < amount) {
    notifyPlayer(player.name, `§cNot enough emeralds in treasury (${village.treasury}💎).`);
    return false;
  }

  const inv = player.getComponent(EntityInventoryComponent.componentId) as EntityInventoryComponent | undefined;
  if (!inv) return false;
  const container = inv.container;
  if (!container) return false;

  let remaining = amount;
  for (let i = 0; i < container.size && remaining > 0; i++) {
    if (container.getItem(i) === undefined) {
      const stackSize = Math.min(remaining, 64);
      const item = new ItemStack("minecraft:emerald", stackSize);
      container.setItem(i, item);
      remaining -= stackSize;
    }
  }

  if (remaining > 0) {
    notifyPlayer(player.name, "§cInventory full.");
    return false;
  }

  village.treasury -= amount;
  saveVillage(village);
  notifyPlayer(player.name, `§aWithdrew ${amount}💎 from §b${village.name}§a. (Remaining: ${village.treasury}💎)`);
  return true;
}

export function transferEmeralds(
  fromVillageId: string,
  toVillageId: string,
  amount: number,
  ownerName: string
): boolean {
  const from = getVillage(fromVillageId);
  const to = getVillage(toVillageId);
  if (!from || !to) return false;
  if (from.owner !== ownerName && from.kingdomId !== to.kingdomId) return false;
  if (from.treasury < amount) return false;

  from.treasury -= amount;
  to.treasury += amount;
  saveVillage(from);
  saveVillage(to);
  notifyPlayer(ownerName, `§aTransferred ${amount}💎 from §b${from.name}§a to §b${to.name}§a.`);
  return true;
}

export function collectTax(kingdomId: string, taxRate: number): void {
  const villages = getAllVillages().filter((v) => v.kingdomId === kingdomId);
  for (const village of villages) {
    const tax = Math.floor(village.treasury * taxRate);
    if (tax > 0) {
      village.treasury -= tax;
      saveVillage(village);
    }
  }
}

export function getTreasuryReport(village: VillageData): string {
  const { TROOP_WAGES } = { TROOP_WAGES: { cityGuards: 1, spearmen: 2, archers: 2, cavalry: 3 } };
  const dailyWages =
    (village.troops.cityGuards * TROOP_WAGES.cityGuards +
      village.troops.spearmen * TROOP_WAGES.spearmen +
      village.troops.archers * TROOP_WAGES.archers +
      village.troops.cavalry * TROOP_WAGES.cavalry) /
    3;

  return [
    `§b${village.name} Treasury§r`,
    `Balance: ${village.treasury}💎`,
    `Daily wage cost: ~${dailyWages.toFixed(1)}💎/day`,
    `Days of wages remaining: ${dailyWages > 0 ? Math.floor(village.treasury / dailyWages) : "∞"}`,
  ].join("\n");
}
