import { world, Player, Block, EntityQueryOptions, EntityInventoryComponent } from "@minecraft/server";
import type { VillageData } from "../types/index.js";
import {
  CLAIM_COST_EMERALDS,
  VILLAGE_CLAIM_RADIUS,
  MIN_VILLAGERS_TO_CLAIM,
  EMPTY_RESOURCE_STORAGE,
} from "../types/index.js";
import {
  generateId,
  getAllVillages,
  getAllKingdoms,
  getVillage,
  saveVillage,
} from "../storage/index.js";
import { getCurrentDay } from "../utils/tick.js";
import { notifyPlayer } from "../utils/notify.js";
import { createKingdom, addVillageToKingdom, removeVillageFromKingdom } from "./kingdom.js";

export function claimVillage(
  player: Player,
  townHallBlock: Block,
  kingdomName: string
): boolean {
  const loc = townHallBlock.location;
  const dim = player.dimension;

  const existing = getAllVillages().find(
    (v) =>
      v.location.dimension === dim.id &&
      Math.abs(v.location.x - loc.x) < VILLAGE_CLAIM_RADIUS &&
      Math.abs(v.location.z - loc.z) < VILLAGE_CLAIM_RADIUS
  );

  if (existing && existing.owner) {
    notifyPlayer(player.name, `§cThis territory already belongs to "${existing.name}".`);
    return false;
  }

  const query: EntityQueryOptions = {
    type: "minecraft:villager",
    location: loc,
    maxDistance: VILLAGE_CLAIM_RADIUS,
  };

  const villagers = dim.getEntities(query);
  if (villagers.length < MIN_VILLAGERS_TO_CLAIM) {
    notifyPlayer(
      player.name,
      `§cNeed at least ${MIN_VILLAGERS_TO_CLAIM} villagers within ${VILLAGE_CLAIM_RADIUS} blocks to claim.`
    );
    return false;
  }

  const inv = player.getComponent(EntityInventoryComponent.componentId) as EntityInventoryComponent | undefined;
  if (!inv) return false;
  const container = inv.container;
  if (!container) return false;

  let emeraldsFound = 0;
  const slotsToConsume: Array<{ slot: number; amount: number }> = [];

  for (let i = 0; i < container.size; i++) {
    const item = container.getItem(i);
    if (item && item.typeId === "minecraft:emerald") {
      const needed = CLAIM_COST_EMERALDS - emeraldsFound;
      const take = Math.min(needed, item.amount);
      slotsToConsume.push({ slot: i, amount: take });
      emeraldsFound += take;
      if (emeraldsFound >= CLAIM_COST_EMERALDS) break;
    }
  }

  if (emeraldsFound < CLAIM_COST_EMERALDS) {
    notifyPlayer(player.name, `§cNeed ${CLAIM_COST_EMERALDS} emeralds to claim a village.`);
    return false;
  }

  for (const { slot, amount } of slotsToConsume) {
    const item = container.getItem(slot);
    if (!item) continue;
    if (item.amount <= amount) {
      container.setItem(slot, undefined);
    } else {
      item.amount -= amount;
      container.setItem(slot, item);
    }
  }

  let kingdom = getKingdomOf(player.name);
  if (!kingdom) {
    kingdom = createKingdom(player.name, kingdomName);
  }

  const villageName =
    existing?.name ?? `${player.name}'s Village ${Math.floor(Math.random() * 1000)}`;
  const villageId = existing?.id ?? generateId();

  const village: VillageData = {
    id: villageId,
    name: villageName,
    owner: player.name,
    kingdomId: kingdom.id,
    location: { x: loc.x, y: loc.y, z: loc.z, dimension: dim.id },
    townHallLocation: { x: loc.x, y: loc.y, z: loc.z },
    population: villagers.length,
    housingCapacity: villagers.length + 4,
    treasury: 0,
    foodStorage: 20,
    marketLevel: 1,
    barracksLevel: 1,
    prosperity: 50,
    tradeCartCount: 0,
    troops: { cityGuards: 0, spearmen: 0, archers: 0, cavalry: 0 },
    missedWages: 0,
    lastDayProcessed: getCurrentDay(),
    lastWageDay: getCurrentDay(),
    foodShortageStage: 0,
    guardPoles: [],
    tradePoles: [],
    workers: { farmers: Math.max(1, Math.floor(villagers.length * 0.5)), workers: 0 },
    blacksmith: { weaponTier: 0, armorTier: 0 },
    activeMerchants: [],
    activeCarts: [],
    granaryItems: {},
    lastSoldierFeedDay: getCurrentDay(),
    builtHousingUnits: 0,
    hasTradeStation: false,
    resourceStorage: { ...EMPTY_RESOURCE_STORAGE },
    trainingQueue: [],
  };

  saveVillage(village);
  addVillageToKingdom(kingdom.id, villageId);
  notifyPlayer(
    player.name,
    `§aVillage "§b${villageName}§a" claimed for kingdom "§b${kingdom.name}§a"!`
  );
  return true;
}

export function renameVillage(playerName: string, villageId: string, newName: string): boolean {
  const village = getVillage(villageId);
  if (!village || village.owner !== playerName) return false;
  village.name = newName;
  saveVillage(village);
  notifyPlayer(playerName, `Village renamed to "§b${newName}§r".`);
  return true;
}

export function surrenderVillage(playerName: string, villageId: string): void {
  const village = getVillage(villageId);
  if (!village || village.owner !== playerName) return;
  removeVillageFromKingdom(village.kingdomId, villageId);
  village.owner = "";
  village.kingdomId = "";
  saveVillage(village);
  notifyPlayer(playerName, `§eVillage "${village.name}" surrendered.`);
}

export function getVillageSummary(village: VillageData): string {
  const t = village.troops;
  const totalSoldiers = t.cityGuards + t.spearmen + t.archers + t.cavalry;
  const stages = ["✔ None", "⚠ Stage 1", "⚠ Stage 2", "§c Stage 3", "§c Stage 4"];
  const rs = village.resourceStorage ?? { iron: 0, gold: 0, coal: 0, wood: 0, stone: 0, diamonds: 0 };
  const hasStation = village.hasTradeStation ? "§a✔ Active" : "§c✘ None";

  return [
    `§b${village.name}§r (${village.owner})`,
    `Pop: ${village.population}/${village.housingCapacity}  Prosperity: ${village.prosperity}`,
    `Treasury: ${village.treasury}💎  Food: ${village.foodStorage}🌾`,
    `Market Lv${village.marketLevel}  Barracks Lv${village.barracksLevel}`,
    `Troops: ${totalSoldiers} (G:${t.cityGuards} Sp:${t.spearmen} Ar:${t.archers} Ca:${t.cavalry})`,
    `Food Shortage: ${stages[village.foodShortageStage] ?? "Unknown"}`,
    `Weapon Tier: ${village.blacksmith.weaponTier}  Armor Tier: ${village.blacksmith.armorTier}`,
    `Trade Station: ${hasStation}`,
    `Resources: Fe:${rs.iron} Au:${rs.gold} C:${rs.coal} W:${rs.wood} St:${rs.stone} Di:${rs.diamonds}`,
  ].join("\n");
}

export function updateHousingCapacity(villageId: string): void {
  const village = getVillage(villageId);
  if (!village) return;

  const dim = world.getDimension(village.location.dimension);
  const loc = village.townHallLocation;

  let beds = 0;
  for (let dx = -VILLAGE_CLAIM_RADIUS; dx <= VILLAGE_CLAIM_RADIUS; dx += 4) {
    for (let dz = -VILLAGE_CLAIM_RADIUS; dz <= VILLAGE_CLAIM_RADIUS; dz += 4) {
      try {
        const block = dim.getBlock({ x: loc.x + dx, y: loc.y, z: loc.z + dz });
        if (block && block.typeId.includes("bed")) beds++;
      } catch {
        // out of loaded chunks
      }
    }
  }

  village.housingCapacity = Math.max(beds, village.population);
  saveVillage(village);
}

function getKingdomOf(playerName: string): import("../types/index.js").KingdomData | undefined {
  return getAllKingdoms().find((k) => k.king === playerName);
}
