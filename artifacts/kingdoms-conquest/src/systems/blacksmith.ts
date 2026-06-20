import { Player, ItemStack, EntityInventoryComponent } from "@minecraft/server";
import type { VillageData, ArmoryItemKey } from "../types/index.js";
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
  { material: "minecraft:iron_ingot",  materialCount: 1, emeralds: 1 },
  { material: "minecraft:gold_ingot",  materialCount: 1, emeralds: 1 },
  { material: "minecraft:diamond",     materialCount: 1, emeralds: 1 },
  { material: "minecraft:netherite_scrap", materialCount: 1, emeralds: 1 },
];

const ARMOR_UPGRADE_COSTS: UpgradeCost[] = [
  { material: "minecraft:iron_ingot",      materialCount: 2, emeralds: 1 },
  { material: "minecraft:gold_ingot",      materialCount: 2, emeralds: 1 },
  { material: "minecraft:diamond",         materialCount: 2, emeralds: 1 },
  { material: "minecraft:netherite_scrap", materialCount: 2, emeralds: 1 },
];

export interface ArmoryRecipe {
  key: ArmoryItemKey;
  name: string;
  produces: number;
  costIron: number;
  costGold: number;
  costDiamonds: number;
  costWood: number;
  costStone: number;
  costEmeralds: number;
}

export const ARMORY_RECIPES: ArmoryRecipe[] = [
  { key: "woodenSwords",  name: "Wooden Swords (×5)",      produces: 5,  costWood: 10, costStone: 0,  costIron: 0,  costGold: 0,  costDiamonds: 0,  costEmeralds: 0 },
  { key: "stoneSwords",   name: "Stone Swords (×5)",       produces: 5,  costWood: 0,  costStone: 10, costIron: 0,  costGold: 0,  costDiamonds: 0,  costEmeralds: 0 },
  { key: "ironSwords",    name: "Iron Swords (×5)",        produces: 5,  costWood: 0,  costStone: 0,  costIron: 10, costGold: 0,  costDiamonds: 0,  costEmeralds: 1 },
  { key: "goldSwords",    name: "Gold Swords (×5)",        produces: 5,  costWood: 0,  costStone: 0,  costIron: 0,  costGold: 10, costDiamonds: 0,  costEmeralds: 1 },
  { key: "diamondSwords", name: "Diamond Swords (×5)",     produces: 5,  costWood: 0,  costStone: 0,  costIron: 0,  costGold: 0,  costDiamonds: 10, costEmeralds: 2 },
  { key: "ironArmor",     name: "Iron Armor Set (helmet+chest+legs+boots)", produces: 1, costWood: 0, costStone: 0, costIron: 24, costGold: 0,  costDiamonds: 0,  costEmeralds: 2 },
  { key: "goldArmor",     name: "Gold Armor Set",          produces: 1,  costWood: 0,  costStone: 0,  costIron: 0,  costGold: 24, costDiamonds: 0,  costEmeralds: 2 },
  { key: "diamondArmor",  name: "Diamond Armor Set",       produces: 1,  costWood: 0,  costStone: 0,  costIron: 0,  costGold: 0,  costDiamonds: 24, costEmeralds: 5 },
];

export function canCraftArmoryRecipe(village: VillageData, recipe: ArmoryRecipe): boolean {
  const rs = village.resourceStorage;
  return (
    (recipe.costIron     === 0 || rs.iron     >= recipe.costIron)     &&
    (recipe.costGold     === 0 || rs.gold     >= recipe.costGold)     &&
    (recipe.costDiamonds === 0 || rs.diamonds >= recipe.costDiamonds) &&
    (recipe.costWood     === 0 || rs.wood     >= recipe.costWood)     &&
    (recipe.costStone    === 0 || rs.stone    >= recipe.costStone)    &&
    (recipe.costEmeralds === 0 || village.treasury >= recipe.costEmeralds)
  );
}

export function craftForArmory(village: VillageData, recipeIndex: number, count: number): boolean {
  if (recipeIndex < 0 || recipeIndex >= ARMORY_RECIPES.length) return false;
  const recipe = ARMORY_RECIPES[recipeIndex];

  const totalIron     = recipe.costIron     * count;
  const totalGold     = recipe.costGold     * count;
  const totalDiamonds = recipe.costDiamonds * count;
  const totalWood     = recipe.costWood     * count;
  const totalStone    = recipe.costStone    * count;
  const totalEmeralds = recipe.costEmeralds * count;

  const rs = village.resourceStorage;

  if (totalIron     > 0 && rs.iron     < totalIron)     { notifyPlayer(village.owner, `§cNeed ${totalIron} iron (have ${rs.iron}).`);         return false; }
  if (totalGold     > 0 && rs.gold     < totalGold)     { notifyPlayer(village.owner, `§cNeed ${totalGold} gold (have ${rs.gold}).`);         return false; }
  if (totalDiamonds > 0 && rs.diamonds < totalDiamonds) { notifyPlayer(village.owner, `§cNeed ${totalDiamonds} diamonds (have ${rs.diamonds}).`); return false; }
  if (totalWood     > 0 && rs.wood     < totalWood)     { notifyPlayer(village.owner, `§cNeed ${totalWood} wood (have ${rs.wood}).`);         return false; }
  if (totalStone    > 0 && rs.stone    < totalStone)    { notifyPlayer(village.owner, `§cNeed ${totalStone} stone (have ${rs.stone}).`);       return false; }
  if (totalEmeralds > 0 && village.treasury < totalEmeralds) { notifyPlayer(village.owner, `§cNeed ${totalEmeralds}💎 (treasury: ${village.treasury}).`); return false; }

  rs.iron     -= totalIron;
  rs.gold     -= totalGold;
  rs.diamonds -= totalDiamonds;
  rs.wood     -= totalWood;
  rs.stone    -= totalStone;
  village.treasury -= totalEmeralds;

  if (!village.armory) village.armory = {};
  const prev = village.armory[recipe.key] ?? 0;
  village.armory[recipe.key] = prev + recipe.produces * count;

  saveVillage(village);

  const total = recipe.produces * count;
  notifyPlayer(
    village.owner,
    `§a⚒ Crafted §b${total}x ${recipe.name}§a → stored in §b${village.name}§a armory. ` +
    `(Total: §f${village.armory[recipe.key]}§a)`
  );
  return true;
}

export function getArmorySummary(village: VillageData): string {
  const armory = village.armory ?? {};
  const entries = Object.entries(armory).filter(([, v]) => (v ?? 0) > 0);
  if (entries.length === 0) return "§7Armory is empty.";
  const labels: Record<ArmoryItemKey, string> = {
    woodenSwords:  "Wooden Swords",
    stoneSwords:   "Stone Swords",
    ironSwords:    "Iron Swords",
    goldSwords:    "Gold Swords",
    diamondSwords: "Diamond Swords",
    ironArmor:     "Iron Armor Sets",
    goldArmor:     "Gold Armor Sets",
    diamondArmor:  "Diamond Armor Sets",
  };
  return entries.map(([k, v]) => `  §f${v}x §7${labels[k as ArmoryItemKey] ?? k}`).join("\n");
}

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
    village.troops.cavalry +
    (village.troops.heavyKnight ?? 0);

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
    village.troops.cavalry +
    (village.troops.heavyKnight ?? 0);

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
    village.troops.cavalry +
    (village.troops.heavyKnight ?? 0);

  const rs = village.resourceStorage;

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
    `\n§7── Storage ──\nIron: §f${rs.iron}§7  Gold: §f${rs.gold}§7  Diamonds: §f${rs.diamonds}§7  Wood: §f${rs.wood}§7  Stone: §f${rs.stone}`,
    `§7── Armory ──`,
    getArmorySummary(village),
  ]
    .filter(Boolean)
    .join("\n");
}
