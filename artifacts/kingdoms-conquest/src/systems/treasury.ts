import { Player, ItemStack, EntityInventoryComponent } from "@minecraft/server";
import type { VillageData } from "../types/index.js";
import { WAGE_INTERVAL_DAYS } from "../types/index.js";
import { getVillage, saveVillage } from "../storage/index.js";
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
    notifyPlayer(player.name, "§cNo emeralds in inventory to deposit.");
    return false;
  }

  village.treasury += removed;
  saveVillage(village);
  notifyPlayer(player.name, `§aDeposited §6${removed}💎§a into §b${village.name}§a treasury. (Total: §6${village.treasury}💎§a)`);
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
  if (!inv?.container) return false;
  const container = inv.container;

  let remaining = amount;
  for (let i = 0; i < container.size && remaining > 0; i++) {
    const slot = container.getItem(i);
    if (!slot) {
      const give = Math.min(remaining, 64);
      container.setItem(i, new ItemStack("minecraft:emerald", give));
      remaining -= give;
    } else if (slot.typeId === "minecraft:emerald" && slot.amount < 64) {
      const give = Math.min(remaining, 64 - slot.amount);
      slot.amount += give;
      container.setItem(i, slot);
      remaining -= give;
    }
  }

  if (remaining > 0) {
    notifyPlayer(player.name, "§cInventory full — not all emeralds could be withdrawn.");
    const withdrawn = amount - remaining;
    village.treasury -= withdrawn;
    saveVillage(village);
    notifyPlayer(player.name, `§aWithdrew §6${withdrawn}💎§a. (Treasury: §6${village.treasury}💎§a)`);
    return false;
  }

  village.treasury -= amount;
  saveVillage(village);
  notifyPlayer(player.name, `§aWithdrew §6${amount}💎§a from §b${village.name}§a. (Treasury: §6${village.treasury}💎§a)`);
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
  notifyPlayer(ownerName, `§aTransferred §6${amount}💎§a from §b${from.name}§a to §b${to.name}§a.`);
  return true;
}

export function getTreasuryReport(village: VillageData): string {
  const wages = { cityGuards: 2, spearmen: 3, archers: 3, cavalry: 5, heavyKnight: 8, samurai: 12, mercenaryLancer: 10, legionary: 10 };
  const dailyWages =
    (village.troops.cityGuards          * wages.cityGuards      +
     village.troops.spearmen            * wages.spearmen        +
     village.troops.archers             * wages.archers         +
     village.troops.cavalry             * wages.cavalry         +
     (village.troops.heavyKnight      ?? 0) * wages.heavyKnight     +
     (village.troops.samurai          ?? 0) * wages.samurai         +
     (village.troops.mercenaryLancer  ?? 0) * wages.mercenaryLancer +
     (village.troops.legionary        ?? 0) * wages.legionary) / WAGE_INTERVAL_DAYS;

  return [
    `§b${village.name} Treasury§r`,
    `§7Balance: §6${village.treasury}💎`,
    `§7Daily wage cost: §c~${dailyWages.toFixed(1)}💎/day`,
    `§7Wages covered: §f${dailyWages > 0 ? Math.floor(village.treasury / dailyWages) + " days" : "∞"}`,
    ``,
    `§7Deposit emeralds from inventory to fund the treasury.`,
    `§7Emeralds are spent on wages, recruitment, upgrades & trade.`,
  ].join("\n");
}
