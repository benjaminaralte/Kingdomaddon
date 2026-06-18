import { Player, ItemStack, EntityInventoryComponent } from "@minecraft/server";
import type { VillageData } from "../types/index.js";
import { WEAPON_TIERS, ARMOR_TIERS } from "../types/index.js";
import { getVillage, saveVillage } from "../storage/index.js";
import { notifyPlayer } from "../utils/notify.js";

interface UpgradeCost {
  material: string;
  materialCount: number;
  emeralds: number;
}

const WEAPON_UPGRADE_COSTS: UpgradeCost[] = [
  { material: "minecraft:cobblestone", materialCount: 1, emeralds: 1 },
  { material: "minecraft:iron_ingot", materialCount: 1, emeralds: 1 },
  { material: "minecraft:gold_ingot", materialCount: 1, emeralds: 1 },
  { material: "minecraft:diamond", materialCount: 1, emeralds: 1 },
  { material: "minecraft:netherite_scrap", materialCount: 1, emeralds: 1 },
];

const ARMOR_UPGRADE_COSTS: UpgradeCost[] = [
  { material: "minecraft:iron_ingot", materialCount: 2, emeralds: 1 },
  { material: "minecraft:gold_ingot", materialCount: 2, emeralds: 1 },
  { material: "minecraft:diamond", materialCount: 2, emeralds: 1 },
  { material: "minecraft:netherite_scrap", materialCount: 2, emeralds: 1 },
];

export function getWeaponUpgradeCost(currentTier: number): UpgradeCost | undefined {
  return WEAPON_UPGRADE_COSTS[currentTier];
}

export function getArmorUpgradeCost(currentTier: number): UpgradeCost | undefined {
  return ARMOR_UPGRADE_COSTS[currentTier];
}

export function upgradeWeapons(player: Player, villageId: string): boolean {
  const village = getVillage(villageId);
  if (!village || village.owner !== player.name) return false;

  const currentTier = village.blacksmith.weaponTier;
  if (currentTier >= WEAPON_TIERS.length - 1) {
    notifyPlayer(player.name, "§cWeapons already at maximum tier (Netherite).");
    return false;
  }

  const cost = WEAPON_UPGRADE_COSTS[currentTier];
  if (!cost) return false;

  const totalSoldiers =
    village.troops.cityGuards +
    village.troops.spearmen +
    village.troops.archers +
    village.troops.cavalry;

  const totalMaterial = cost.materialCount * totalSoldiers;
  const totalEmeralds = cost.emeralds * totalSoldiers;

  if (!consumeItems(player, cost.material, totalMaterial)) {
    notifyPlayer(
      player.name,
      `§cNeed ${totalMaterial}x ${cost.material.replace("minecraft:", "")} to upgrade ${totalSoldiers} soldiers.`
    );
    return false;
  }

  if (!consumeItems(player, "minecraft:emerald", totalEmeralds)) {
    notifyPlayer(player.name, `§cNeed ${totalEmeralds} emeralds for upgrades.`);
    giveBackItems(player, cost.material, totalMaterial);
    return false;
  }

  village.blacksmith.weaponTier++;
  saveVillage(village);

  const newTier = WEAPON_TIERS[village.blacksmith.weaponTier];
  notifyPlayer(
    player.name,
    `§aWeapons upgraded to §b${newTier}§a tier for ${totalSoldiers} soldiers in §b${village.name}§a!`
  );
  return true;
}

export function upgradeArmor(player: Player, villageId: string): boolean {
  const village = getVillage(villageId);
  if (!village || village.owner !== player.name) return false;

  const currentTier = village.blacksmith.armorTier;
  if (currentTier >= ARMOR_TIERS.length - 1) {
    notifyPlayer(player.name, "§cArmor already at maximum tier (Netherite).");
    return false;
  }

  const cost = ARMOR_UPGRADE_COSTS[currentTier];
  if (!cost) return false;

  const totalSoldiers =
    village.troops.cityGuards +
    village.troops.spearmen +
    village.troops.archers +
    village.troops.cavalry;

  const totalMaterial = cost.materialCount * totalSoldiers;
  const totalEmeralds = cost.emeralds * totalSoldiers;

  if (!consumeItems(player, cost.material, totalMaterial)) {
    notifyPlayer(
      player.name,
      `§cNeed ${totalMaterial}x ${cost.material.replace("minecraft:", "")} for armor upgrade.`
    );
    return false;
  }

  if (!consumeItems(player, "minecraft:emerald", totalEmeralds)) {
    notifyPlayer(player.name, `§cNeed ${totalEmeralds} emeralds for armor upgrades.`);
    giveBackItems(player, cost.material, totalMaterial);
    return false;
  }

  village.blacksmith.armorTier++;
  saveVillage(village);

  const newTier = ARMOR_TIERS[village.blacksmith.armorTier];
  notifyPlayer(
    player.name,
    `§aArmor upgraded to §b${newTier}§a tier for ${totalSoldiers} soldiers in §b${village.name}§a!`
  );
  return true;
}

function consumeItems(player: Player, typeId: string, amount: number): boolean {
  const inv = player.getComponent(EntityInventoryComponent.componentId) as EntityInventoryComponent | undefined;
  if (!inv) return false;
  const container = inv.container;
  if (!container) return false;

  let total = 0;
  for (let i = 0; i < container.size; i++) {
    const item = container.getItem(i);
    if (item && item.typeId === typeId) total += item.amount;
  }

  if (total < amount) return false;

  let remaining = amount;
  for (let i = 0; i < container.size && remaining > 0; i++) {
    const item = container.getItem(i);
    if (!item || item.typeId !== typeId) continue;
    const take = Math.min(item.amount, remaining);
    remaining -= take;
    if (take >= item.amount) {
      container.setItem(i, undefined);
    } else {
      item.amount -= take;
      container.setItem(i, item);
    }
  }

  return true;
}

function giveBackItems(player: Player, typeId: string, amount: number): void {
  const inv = player.getComponent(EntityInventoryComponent.componentId) as EntityInventoryComponent | undefined;
  if (!inv) return;
  const container = inv.container;
  if (!container) return;

  let remaining = amount;
  for (let i = 0; i < container.size && remaining > 0; i++) {
    const item = container.getItem(i);
    if (item === undefined) {
      const give = Math.min(remaining, 64);
      container.setItem(i, new ItemStack(typeId, give));
      remaining -= give;
    }
  }
}

export function getBlacksmithSummary(village: VillageData): string {
  const wt = WEAPON_TIERS[village.blacksmith.weaponTier] ?? "unknown";
  const at = ARMOR_TIERS[village.blacksmith.armorTier] ?? "unknown";

  const nextWT = WEAPON_TIERS[village.blacksmith.weaponTier + 1];
  const nextAT = ARMOR_TIERS[village.blacksmith.armorTier + 1];

  const wCost = WEAPON_UPGRADE_COSTS[village.blacksmith.weaponTier];
  const aCost = ARMOR_UPGRADE_COSTS[village.blacksmith.armorTier];

  const soldiers =
    village.troops.cityGuards +
    village.troops.spearmen +
    village.troops.archers +
    village.troops.cavalry;

  return [
    `§b${village.name} Blacksmith§r`,
    `Weapon Tier: §a${wt}§r ${nextWT ? `→ ${nextWT}` : "(MAX)"}`,
    `Armor Tier: §a${at}§r ${nextAT ? `→ ${nextAT}` : "(MAX)"}`,
    soldiers > 0 && wCost
      ? `Weapon upgrade cost: ${wCost.materialCount * soldiers}x ${wCost.material.replace("minecraft:", "")} + ${wCost.emeralds * soldiers}💎`
      : "",
    soldiers > 0 && aCost
      ? `Armor upgrade cost: ${aCost.materialCount * soldiers}x ${aCost.material.replace("minecraft:", "")} + ${aCost.emeralds * soldiers}💎`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}
