import { world, system, EntityInventoryComponent, ItemStack } from "@minecraft/server";
import { ActionFormData, ModalFormData, MessageFormData } from "@minecraft/server-ui";
import type { VillageData, KingdomData, MerchantData, ResourceStorage, TroopType, TroopData } from "./types/index.js";
import { RESOURCE_LABELS } from "./types/index.js";
import { getCurrentTick } from "./utils/tick.js";
import { notifyPlayer } from "./utils/notify.js";
import { getAllVillages, getVillage, getKingdom, getAllKingdoms, saveVillage, saveKingdom } from "./storage/index.js";
import {
  handleCropBreak,
  isCropBlock,
  CROP_MAX_AGES,
  FOOD_ITEM_VALUES,
  withdrawFromGranary,
  depositPlayerItemsToGranary,
  getGranaryReport,
  processAllSoldierFood,
  collectFieldStorage,
  getFieldStorageReport,
  getFieldStorageTotal,
  autoHarvestAllVillages,
  upgradeFieldWorkers,
} from "./systems/harvest.js";
import { registerCommands } from "./systems/commands.js";
import {
  claimVillage,
  getVillageSummary,
  updateHousingCapacity,
  renameVillage,
} from "./systems/village.js";
import { processAllFood, getFoodProduction, getFoodConsumption, buyFood, sellFood } from "./systems/food.js";
import { processAllWages, upgradeBarracks } from "./systems/military.js";
import { processAllPopulation } from "./systems/population.js";
import {
  tickAllMerchantsSpawn,
  tickAllMerchantMovement,
  tradeMerchant,
  upgradeMarket,
  buySeedsFromMarket,
  sellFoodBulk,
  SEED_SHOP,
  SEED_PURCHASE_MATERIALS,
  FOOD_SELL_RATES,
} from "./systems/market.js";
import { tickBandits } from "./systems/bandit.js";
import { checkDailyCrisisAlerts } from "./systems/villageAlerts.js";
import { tickTradeStations, sendTradeCart, sendRailShipment } from "./systems/trade.js";
import {
  queueTraining,
  tickTraining,
  getTrainingQueueSummary,
  TRAINING_COSTS,
  TRAINING_TICKS,
  TROOP_LABELS,
} from "./systems/training.js";
import { tickWatchtowers } from "./systems/watchtower.js";
import { tickSieges, captureVillageByForce, loadSiegesFromStorage } from "./systems/conquest.js";
import { tickBorders } from "./systems/border.js";
import { tickAutoDefense } from "./systems/autoDefense.js";
import {
  refreshAllGuards,
  enforceGuardPositions,
  registerGuardPole,
  removeGuardPole,
} from "./systems/guards.js";
import {
  declareWar,
  makePeace,
  formAlliance,
  getKingdomSummary,
  getKingdomOf,
} from "./systems/kingdom.js";
import {
  depositEmeralds,
  withdrawEmeralds,
  getTreasuryReport,
} from "./systems/treasury.js";
import {
  upgradeWeapons, upgradeArmor, getBlacksmithSummary,
  craftForArmory, ARMORY_RECIPES, canCraftArmoryRecipe,
} from "./systems/blacksmith.js";
import { sendReinforcements, tickPendingReinforcements, cancelReinforcement, getInTransitMarches } from "./systems/reinforcements.js";
import {
  registerTradeStation,
  removeTradeStation,
  getConnectedVillages,
  getTradeStationSummary,
  ensureResourceStorage,
} from "./systems/tradeStation.js";
import {
  registerMaterialStorage,
  removeMaterialStorage,
  getMaterialStorageSummary,
  tickAllMinerProduction,
} from "./systems/materialStorage.js";
import {
  pickupTroops,
  releaseTroops,
  recallNearbyTroops,
  countTroopTokens,
  TROOP_TOKEN_MAP,
  type TroopPickup,
} from "./systems/deployTroops.js";
import type { GuardPoleType } from "./types/index.js";
import { generateStructure, demolishStructure, STRUCTURE_BLOCK_IDS } from "./systems/structureBuilder.js";
import { registerWaypoint, removeWaypoint, showWaypointMenu } from "./systems/waypoint.js";
import { areAtWar } from "./systems/kingdom.js";
import { TICKS_PER_DAY } from "./types/index.js";
import { startVillagerBowSystem } from "./systems/villagerBow.js";
import { tickChargeSystem, registerChargeSystem } from "./systems/chargeAttack.js";
import { tickFormations, openTacticsMenu } from "./systems/formations.js";

// ── Wool Diplomacy ────────────────────────────────────────────────────────────
// FIX: Diplomacy state is now persisted in KingdomData so it survives world
// reloads. The old in-memory Maps were wiped on every server restart, allowing
// peace-cooldown bypass and silently dropping pending offers on relog.

function checkThreeWool(woolType: string, loc: { x: number; y: number; z: number }, dim: import("@minecraft/server").Dimension): boolean {
  const dirs: [number, number][] = [[1, 0], [0, 1]];
  for (const [dx, dz] of dirs) {
    const b1 = dim.getBlock({ x: loc.x + dx, y: loc.y, z: loc.z + dz });
    const b2 = dim.getBlock({ x: loc.x + dx * 2, y: loc.y, z: loc.z + dz * 2 });
    const b3 = dim.getBlock({ x: loc.x - dx, y: loc.y, z: loc.z - dz });
    if (b1?.typeId === woolType && b2?.typeId === woolType) return true;
    if (b1?.typeId === woolType && b3?.typeId === woolType) return true;
  }
  return false;
}

async function triggerWoolDiplomacy(
  player: import("@minecraft/server").Player,
  targetVillage: VillageData,
  isBlack: boolean
): Promise<void> {
  const myKingdom = getKingdomOf(player.name);
  if (!myKingdom) {
    notifyPlayer(player.name, "§cYou must be in a kingdom to use wool diplomacy.");
    return;
  }
  const enemyKingdom = getKingdom(targetVillage.kingdomId);
  if (!enemyKingdom) return;

  if (isBlack) {
    if (areAtWar(myKingdom.id, enemyKingdom.id)) {
      notifyPlayer(player.name, `§cAlready at war with §b${enemyKingdom.name}§c.`);
      return;
    }
    const form = new MessageFormData()
      .title("⚔ Declare War?")
      .body(
        `You placed 3 black wool in §b${targetVillage.name}§r!\n\nThis declares WAR on §c${enemyKingdom.name}§r (King: ${enemyKingdom.king}).\n\n§7This cannot be undone without a peace treaty.`
      )
      .button1("⚔ DECLARE WAR")
      .button2("Cancel");
    const resp = await form.show(player);
    if (resp.selection === 0) {
      declareWar(myKingdom.id, enemyKingdom.id);
      for (const p of world.getPlayers()) {
        notifyPlayer(p.name, `§c⚔ WAR DECLARED! §f${player.name} §7(${myKingdom.name}) §chas declared war on §b${enemyKingdom.name}§c!`);
      }
    }
    return;
  }

  // White wool — peace if at war, alliance if neutral
  const atWar = areAtWar(myKingdom.id, enemyKingdom.id);
  const requestType: "peace" | "alliance" = atWar ? "peace" : "alliance";
  const cooldownKey = `${myKingdom.id}:${enemyKingdom.id}`;

  // FIX: read cooldown from persisted KingdomData instead of in-memory Map
  const cooldownExpiry = myKingdom.peaceCooldowns?.[cooldownKey] ?? 0;

  if (getCurrentTick() < cooldownExpiry) {
    const days = ((cooldownExpiry - getCurrentTick()) / TICKS_PER_DAY).toFixed(1);
    notifyPlayer(player.name, `§c${enemyKingdom.name} denied your last request. Wait §e${days}§c more in-game days.`);
    return;
  }

  if (!atWar && enemyKingdom.alliances?.includes(myKingdom.id)) {
    notifyPlayer(player.name, `§aAlready allied with §b${enemyKingdom.name}§a.`);
    return;
  }

  const label = requestType === "peace" ? "✉ Peace Offer" : "✉ Alliance Offer";

  // FIX: persist pending diplomacy request on the target kingdom
  enemyKingdom.pendingDiplomacy = {
    fromKingdomId: myKingdom.id,
    toKingdomId:   enemyKingdom.id,
    type:          requestType,
    senderName:    player.name,
    cooldownKey,
  };
  saveKingdom(enemyKingdom);

  notifyPlayer(player.name, `§a${label} sent to §b${enemyKingdom.name}§a (${enemyKingdom.king}). Awaiting response...`);
  notifyPlayer(enemyKingdom.king, `§e📜 §b${myKingdom.name}§e sent a §f${label}§e. Interact with any waypoint or use /scriptevent kc:diplomacy to respond.`);

  const targetOnline = world.getPlayers().find((p) => p.name === enemyKingdom.king);
  if (targetOnline) void showPendingDiplomacyRequest(targetOnline);
}

async function showPendingDiplomacyRequest(player: import("@minecraft/server").Player): Promise<void> {
  // FIX: load pending request from persisted KingdomData instead of in-memory Map
  const playerKingdom = getKingdomOf(player.name);
  const req = playerKingdom?.pendingDiplomacy;
  if (!req || !playerKingdom) return;

  const senderKingdom = getKingdom(req.fromKingdomId);
  if (!senderKingdom) {
    playerKingdom.pendingDiplomacy = undefined;
    saveKingdom(playerKingdom);
    return;
  }

  const label = req.type === "peace" ? "✉ Peace Offer" : "✉ Alliance Offer";
  const body = req.type === "peace"
    ? `§b${senderKingdom.name}§r has offered PEACE.\nSent by: §f${req.senderName}\n\nAccept = end the war.\nDeny = block requests for 2 in-game days.`
    : `§b${senderKingdom.name}§r requests an ALLIANCE.\nSent by: §f${req.senderName}\n\nAccept = form alliance (soldiers won't clash).\nDeny = block requests for 2 in-game days.`;

  const form = new MessageFormData()
    .title(label)
    .body(body)
    .button1("✅ Accept")
    .button2("❌ Deny");

  const resp = await form.show(player);

  // Clear the pending request regardless of response
  playerKingdom.pendingDiplomacy = undefined;
  saveKingdom(playerKingdom);

  if (resp.selection === 0) {
    if (req.type === "peace") {
      makePeace(req.fromKingdomId, req.toKingdomId);
      notifyPlayer(req.senderName, `§a✅ ${player.name} accepted peace! The war with §b${senderKingdom.name}§a is over.`);
      notifyPlayer(player.name, `§aPeace established with §b${senderKingdom.name}§a.`);
    } else {
      formAlliance(req.fromKingdomId, req.toKingdomId);
      notifyPlayer(req.senderName, `§a✅ ${player.name} accepted the alliance with §b${senderKingdom.name}§a!`);
      notifyPlayer(player.name, `§aAlliance formed with §b${senderKingdom.name}§a!`);
    }
  } else {
    // FIX: persist cooldown on the sender's KingdomData
    const freshSender = getKingdom(req.fromKingdomId);
    if (freshSender) {
      freshSender.peaceCooldowns ??= {};
      freshSender.peaceCooldowns[req.cooldownKey] = getCurrentTick() + TICKS_PER_DAY * 2;
      saveKingdom(freshSender);
    }
    notifyPlayer(req.senderName, `§c${player.name} denied your ${req.type} offer. Try again in 2 in-game days.`);
    notifyPlayer(player.name, `§eOffer denied.`);
  }
}

// ── Constants ─────────────────────────────────────────────────────────────────
const CUSTOM_BLOCKS = {
  MATERIAL_STORAGE: "kingdoms:storage",
  TOWN_HALL: "kingdoms:town_hall",
  GUARD_POLE_VILLAGE: "kingdoms:guard_pole_village",
  GUARD_POLE_GATE: "kingdoms:guard_pole_gate",
  GUARD_POLE_ROAD: "kingdoms:guard_pole_road",
  GUARD_POLE_WATCHTOWER: "kingdoms:guard_pole_watchtower",
  TRADE_POLE: "kingdoms:trade_pole",
  TRADE_STATION: "kingdoms:trade_station",
  BARRACKS: "kingdoms:barracks",
  MARKET: "kingdoms:market",
  GRANARY: "kingdoms:granary",
  TREASURY_BLOCK: "kingdoms:treasury",
  BLACKSMITH: "kingdoms:blacksmith",
  CASTLE: "kingdoms:castle",
};

// FIX: use proper circular radius instead of AABB so two villages near a corner
// cannot simultaneously satisfy both territory checks (up to ~90 blocks diagonally
// the old box allowed, vs the correct 64-block radius circle here).
function findVillageAt(location: { x: number; y: number; z: number }): VillageData | undefined {
  return getAllVillages().find((v) => {
    const dx = v.location.x - location.x;
    const dz = v.location.z - location.z;
    return Math.sqrt(dx * dx + dz * dz) < 64;
  });
}

// ── Troop type → token item ID ─────────────────────────────────────────────
const TROOP_TYPE_TO_TOKEN: Record<TroopType, string> = {
  cityGuards:      "kingdoms:guard_token",
  spearmen:        "kingdoms:spearman_token",
  archers:         "kingdoms:archer_token",
  cavalry:         "kingdoms:cavalry_token",
  heavyKnight:     "kingdoms:heavy_knight_token",
  samurai:         "kingdoms:samurai_token",
  mercenaryLancer: "kingdoms:mercenary_lancer_token",
  legionary:       "kingdoms:legionary_token",
};

// ── ResourceStorage key → Minecraft item ID ────────────────────────────────
const RESOURCE_DROP_MAP: Record<keyof ResourceStorage, string> = {
  iron:     "minecraft:iron_ingot",
  gold:     "minecraft:gold_ingot",
  coal:     "minecraft:coal",
  wood:     "minecraft:oak_log",
  stone:    "minecraft:cobblestone",
  diamonds: "minecraft:diamond",
};

function dropItemsAtLocation(
  dimension: import("@minecraft/server").Dimension,
  location: { x: number; y: number; z: number },
  itemId: string,
  totalCount: number
): void {
  if (totalCount <= 0) return;
  const dropLoc = { x: location.x + 0.5, y: location.y + 1, z: location.z + 0.5 };
  let remaining = totalCount;
  while (remaining > 0) {
    const stackSize = Math.min(remaining, 64);
    try {
      dimension.spawnItem(new ItemStack(itemId, stackSize), dropLoc);
    } catch { /* skip invalid items */ }
    remaining -= stackSize;
  }
}

world.afterEvents.playerPlaceBlock.subscribe((event) => {
  const { player, block } = event;
  if (!player) return;

  const typeId = block.typeId;

  if (typeId === CUSTOM_BLOCKS.TOWN_HALL) {
    void showClaimVillageForm(player, block);
  }

  if (typeId.startsWith("kingdoms:guard_pole")) {
    const typeMap: Record<string, GuardPoleType> = {
      "kingdoms:guard_pole_village": "village",
      "kingdoms:guard_pole_gate": "gate",
      "kingdoms:guard_pole_road": "road",
      "kingdoms:guard_pole_watchtower": "watchtower",
    };
    const village = findVillageAt(block.location);
    if (!village) {
      notifyPlayer(player.name, "§cNo village territory here. Claim a village first.");
      return;
    }
    if (village.owner !== player.name) {
      notifyPlayer(player.name, "§cThis is not your village.");
      return;
    }
    const poleType = typeMap[typeId] ?? "village";
    registerGuardPole(village, block.location, poleType);
  }

  if (typeId === CUSTOM_BLOCKS.TRADE_STATION) {
    const tsVillage = findVillageAt(block.location);
    const tsLoc = { x: block.location.x, y: block.location.y, z: block.location.z };
    const tsDim = block.dimension;
    let tsDenyMsg = "";
    if (!tsVillage || tsVillage.owner !== player.name) {
      tsDenyMsg = "§cClaim a village first before placing a Trade Station.";
    } else if (tsVillage.hasTradeStation) {
      tsDenyMsg = `§c§b${tsVillage.name}§c already has a Trade Station. Break the old one first.`;
    }
    if (tsDenyMsg) {
      notifyPlayer(player.name, tsDenyMsg);
      system.run(() => {
        try {
          tsDim.runCommand(`setblock ${tsLoc.x} ${tsLoc.y} ${tsLoc.z} air destroy`);
          tsDim.spawnItem(new ItemStack(CUSTOM_BLOCKS.TRADE_STATION, 1), { x: tsLoc.x + 0.5, y: tsLoc.y + 1, z: tsLoc.z + 0.5 });
        } catch { /* chunk issue */ }
      });
      return;
    }
    registerTradeStation(tsVillage, block.location);
  }

  if (typeId === CUSTOM_BLOCKS.MATERIAL_STORAGE) {
    const stVillage = findVillageAt(block.location);
    const stLoc = { x: block.location.x, y: block.location.y, z: block.location.z };
    const stDim = block.dimension;
    let stDenyMsg = "";
    if (!stVillage || stVillage.owner !== player.name) {
      stDenyMsg = "§cClaim a village first before placing a Material Storage.";
    } else if (stVillage.hasStorage) {
      stDenyMsg = `§c§b${stVillage.name}§c already has a Material Storage. Break the old one first.`;
    }
    if (stDenyMsg) {
      notifyPlayer(player.name, stDenyMsg);
      system.run(() => {
        try {
          stDim.runCommand(`setblock ${stLoc.x} ${stLoc.y} ${stLoc.z} air destroy`);
          stDim.spawnItem(new ItemStack(CUSTOM_BLOCKS.MATERIAL_STORAGE, 1), { x: stLoc.x + 0.5, y: stLoc.y + 1, z: stLoc.z + 0.5 });
        } catch { /* chunk issue */ }
      });
      return;
    }
    registerMaterialStorage(stVillage, block.location);
  }

  if (typeId === CUSTOM_BLOCKS.GRANARY) {
    const village = findVillageAt(block.location);
    if (village && village.owner === player.name) {
      village.granaryLocation = block.location;
      village.hasGranary = true;
      saveVillage(village);
      notifyPlayer(player.name, `§aGranary registered for §b${village.name}§a.`);
    }
  }

  if (typeId === CUSTOM_BLOCKS.TREASURY_BLOCK) {
    const village = findVillageAt(block.location);
    if (village && village.owner === player.name) {
      village.treasuryLocation = block.location;
      village.hasTreasury = true;
      saveVillage(village);
      notifyPlayer(player.name, `§aVillage Treasury registered for §b${village.name}§a.`);
    }
  }

  // ── Waypoint block ──
  if (typeId === "kingdoms:waypoint") {
    const village = findVillageAt(block.location);
    if (!village) {
      notifyPlayer(player.name, "§cNo village territory here. Must be inside a claimed village.");
      return;
    }
    if (village.owner !== player.name) {
      notifyPlayer(player.name, "§cThis is not your village.");
      return;
    }
    registerWaypoint(village, block.location);
  }

  // ── Castle block ──
  if (typeId === CUSTOM_BLOCKS.CASTLE) {
    const village = findVillageAt(block.location);
    if (!village) {
      notifyPlayer(player.name, "§cNo village territory here. Claim a village first.");
      return;
    }
    if (village.owner !== player.name) {
      notifyPlayer(player.name, "§cThis is not your village.");
      return;
    }
    if (village.hasCastle) {
      notifyPlayer(player.name, `§c§b${village.name}§c already has a Castle.`);
      return;
    }
    village.hasCastle = true;
    saveVillage(village);
    notifyPlayer(player.name, `§a🏰 Castle established in §b${village.name}§a! Elite troops are now available.`);
  }

  // ── Wool diplomacy ──
  if (typeId === "minecraft:black_wool" || typeId === "minecraft:white_wool") {
    const woolVillage = findVillageAt(block.location);
    if (woolVillage && woolVillage.owner && woolVillage.owner !== player.name) {
      if (checkThreeWool(typeId, block.location, block.dimension)) {
        void triggerWoolDiplomacy(player, woolVillage, typeId === "minecraft:black_wool");
      }
    }
  }

  // Barracks placement prereq: requires Granary and Treasury already built
  // FIX: invalid placements now actually remove the block and return the item
  // instead of just showing a message while leaving the block in the world.
  if (typeId === CUSTOM_BLOCKS.BARRACKS) {
    const bVillage = findVillageAt(block.location);
    let denyMsg = "";
    if (!bVillage || bVillage.owner !== player.name) {
      denyMsg = "§cClaim a village first before building a Barracks.";
    } else if (!bVillage.hasGranary) {
      denyMsg = "§cBarracks requires a §bGranary§c to be built in this village first.";
    } else if (!bVillage.hasTreasury) {
      denyMsg = "§cBarracks requires a §bTreasury§c to be built in this village first.";
    }
    if (denyMsg) {
      notifyPlayer(player.name, denyMsg);
      const bLoc = { x: block.location.x, y: block.location.y, z: block.location.z };
      const bDim = block.dimension;
      system.run(() => {
        try {
          bDim.runCommand(`setblock ${bLoc.x} ${bLoc.y} ${bLoc.z} air destroy`);
          bDim.spawnItem(
            new ItemStack(CUSTOM_BLOCKS.BARRACKS, 1),
            { x: bLoc.x + 0.5, y: bLoc.y + 1, z: bLoc.z + 0.5 }
          );
        } catch { /* chunk issue — silent */ }
      });
      return;
    }
  }

  // Generate multi-block structure for any kingdoms structure block
  if (STRUCTURE_BLOCK_IDS.has(typeId)) {
    const origin = { x: block.location.x, y: block.location.y, z: block.location.z };
    const dimension = block.dimension;
    notifyPlayer(player.name, `§7Building §b${typeId.replace("kingdoms:", "").replace(/_/g, " ")}§7…`);
    system.run(() => {
      generateStructure(dimension, origin, typeId);
      // Spawn the invisible hub entity so players can interact (open menu) reliably
      // on all platforms including mobile touch / flint use.
      spawnStructureHub(dimension, origin, typeId);
    });
  }
});

// Per-player debounce: prevents rapid duplicate menu opens.
// playerInteractWithBlock fires once per press, but the guard handles edge cases
// (e.g. slight timing delays between the event and form.show() async setup).
const MENU_COOLDOWN_TICKS = 10;
const lastMenuTick = new Map<string, number>();

function canOpenMenu(playerName: string): boolean {
  const tick = getCurrentTick();
  const last = lastMenuTick.get(playerName) ?? -99;
  if (tick - last < MENU_COOLDOWN_TICKS) return false;
  lastMenuTick.set(playerName, tick);
  return true;
}

// ── Structure Hub helpers ─────────────────────────────────────────────────────
// An invisible kingdoms:structure_hub entity sits at each placed structure block.
// playerInteractWithEntity fires reliably on all platforms (including mobile touch)
// whereas itemStartUseOn can be inconsistent when using flint or empty hand.

function spawnStructureHub(
  dimension: import("@minecraft/server").Dimension,
  blockLocation: { x: number; y: number; z: number },
  blockTypeId: string
): void {
  try {
    // Remove any existing hub at this location first (idempotent re-placement)
    removeStructureHub(dimension, blockLocation);
    const entity = dimension.spawnEntity(
      "kingdoms:structure_hub",
      { x: blockLocation.x + 0.5, y: blockLocation.y, z: blockLocation.z + 0.5 }
    );
    entity.setDynamicProperty("kc:structure_type", blockTypeId);
    entity.setDynamicProperty("kc:block_loc", JSON.stringify(blockLocation));
  } catch { /* unloaded chunk — silent */ }
}

function removeStructureHub(
  dimension: import("@minecraft/server").Dimension,
  blockLocation: { x: number; y: number; z: number }
): void {
  try {
    const nearby = dimension.getEntities({
      type: "kingdoms:structure_hub",
      location: { x: blockLocation.x + 0.5, y: blockLocation.y, z: blockLocation.z + 0.5 },
      maxDistance: 2,
    });
    for (const entity of nearby) {
      try { entity.remove(); } catch { /* already gone */ }
    }
  } catch { /* chunk issue */ }
}

// Use itemStartUseOn (fires exactly ONCE when the player first presses use on a block).
// The old itemUseOn fired every tick while the button was held, causing
// menus to spam-open on every interaction.
world.afterEvents.itemStartUseOn.subscribe((event) => {
  const player = event.source;
  const block = event.block;
  const itemStack = event.itemStack;
  if (!player) return;

  const typeId = block.typeId;

  // ── Quick deposit shortcuts (instant actions — no cooldown needed) ──────
  if (typeId === CUSTOM_BLOCKS.GRANARY && itemStack) {
    const village = findVillageAt(block.location);
    if (village && village.owner === player.name) {
      const foodEntry = FOOD_SELL_RATES.find((e) => e.itemId === itemStack.typeId);
      if (foodEntry) {
        depositPlayerItemsToGranary(player, village, itemStack.typeId, 64);
        return;
      }
    }
  }

  if (typeId === CUSTOM_BLOCKS.TREASURY_BLOCK && itemStack?.typeId === "minecraft:emerald") {
    const village = findVillageAt(block.location);
    if (village && village.owner === player.name) {
      depositEmeralds(player, village.id, itemStack.amount);
      return;
    }
  }

  // ── Block menus (debounced to prevent accidental double-opens) ───────────
  if (!canOpenMenu(player.name)) return;

  switch (typeId) {
    case CUSTOM_BLOCKS.TOWN_HALL:
      void showTownHallMenu(player, block);
      break;
    case CUSTOM_BLOCKS.BARRACKS:
      void showBarracksMenu(player, block);
      break;
    case CUSTOM_BLOCKS.MARKET:
      void showMarketMenu(player, block);
      break;
    case CUSTOM_BLOCKS.BLACKSMITH:
      void showBlacksmithMenu(player, block);
      break;
    case CUSTOM_BLOCKS.GRANARY:
      void showGranaryStorageMenu(player, block);
      break;
    case CUSTOM_BLOCKS.TREASURY_BLOCK:
      void showTreasuryBlockMenu(player, block);
      break;
    case CUSTOM_BLOCKS.TRADE_STATION:
      void showTradeStationMenu(player, block);
      break;
    case CUSTOM_BLOCKS.MATERIAL_STORAGE:
      void showMaterialStorageMenu(player, block);
      break;
    case "kingdoms:waypoint": {
      const wpVillage = findVillageAt(block.location);
      if (wpVillage && wpVillage.waypointLocation) {
        void showWaypointMenu(player, wpVillage);
        // FIX: check persisted KingdomData.pendingDiplomacy instead of in-memory Map
        const wpKingdom = getKingdomOf(player.name);
        if (wpKingdom?.pendingDiplomacy) {
          system.runTimeout(() => { void showPendingDiplomacyRequest(player); }, 40);
        }
      }
      break;
    }
  }
});

world.afterEvents.playerBreakBlock.subscribe((event) => {
  const { player } = event;
  if (!player) return;
  const typeId = event.brokenBlockPermutation.type.id;
  const blockLoc = event.block.location;

  if (typeId === CUSTOM_BLOCKS.TOWN_HALL) {
    const village = findVillageAt(blockLoc);
    if (!village) {
      // nothing to do
    } else if (village.owner === player.name) {
      notifyPlayer(player.name, `§e§b${village.name}§e Town Hall broken. Rebuild to access menu.`);
    } else if (village.owner) {
      const captured = captureVillageByForce(player, village);
      if (!captured) {
        notifyPlayer(player.name, `§cYou cannot capture §b${village.name}§c — you are not at war with that kingdom.`);
      }
    }
  }

  if (typeId.startsWith("kingdoms:guard_pole")) {
    const village = findVillageAt(blockLoc);
    if (village) {
      const pole = village.guardPoles.find(
        (p) =>
          p.location.x === blockLoc.x &&
          p.location.y === blockLoc.y &&
          p.location.z === blockLoc.z
      );
      if (pole) {
        removeGuardPole(village, pole.id);
        notifyPlayer(player.name, `§eGuard pole removed.`);
      }
    }
  }

  if (typeId === CUSTOM_BLOCKS.TRADE_STATION) {
    const village = findVillageAt(blockLoc);
    if (village) {
      const loc = village.tradeStationLocation;
      if (loc && loc.x === blockLoc.x && loc.y === blockLoc.y && loc.z === blockLoc.z) {
        removeTradeStation(village);
      }
    }
  }

  if (typeId === CUSTOM_BLOCKS.MATERIAL_STORAGE) {
    const village = findVillageAt(blockLoc);
    if (village) {
      const loc = village.storageLocation;
      if (loc && loc.x === blockLoc.x && loc.y === blockLoc.y && loc.z === blockLoc.z) {
        const rs = village.resourceStorage;
        if (rs) {
          const dim = player.dimension;
          for (const [key, itemId] of Object.entries(RESOURCE_DROP_MAP) as [keyof ResourceStorage, string][]) {
            dropItemsAtLocation(dim, blockLoc, itemId, rs[key] ?? 0);
          }
          village.resourceStorage = { iron: 0, gold: 0, coal: 0, wood: 0, stone: 0, diamonds: 0 };
        }
        removeMaterialStorage(village);
        notifyPlayer(player.name, `§eAll stored resources dropped from §b${village.name}§e Material Storage!`);
      }
    }
  }

  if (typeId === CUSTOM_BLOCKS.BARRACKS) {
    const village = findVillageAt(blockLoc);
    if (village) {
      const dim = player.dimension;
      const troops = village.troops;
      let droppedAny = false;
      // Drop all garrisoned troops as troop tokens
      for (const [troopType, tokenId] of Object.entries(TROOP_TYPE_TO_TOKEN) as [TroopType, string][]) {
        const count = troops[troopType] ?? 0;
        if (count > 0) {
          dropItemsAtLocation(dim, blockLoc, tokenId, count);
          droppedAny = true;
        }
      }
      // Clear garrison
      village.troops = { cityGuards: 0, spearmen: 0, archers: 0, cavalry: 0, heavyKnight: 0, samurai: 0, mercenaryLancer: 0, legionary: 0 };
      saveVillage(village);
      if (droppedAny) {
        notifyPlayer(player.name, `§eTroop tokens dropped from §b${village.name}§e Barracks!`);
      }
    }
  }

  if (typeId === CUSTOM_BLOCKS.GRANARY) {
    const village = findVillageAt(blockLoc);
    if (village && village.granaryLocation) {
      const loc = village.granaryLocation;
      if (loc.x === blockLoc.x && loc.y === blockLoc.y && loc.z === blockLoc.z) {
        const dim = player.dimension;
        // Drop all stored food items
        if (village.granaryItems) {
          for (const [itemId, amount] of Object.entries(village.granaryItems)) {
            if (amount > 0) dropItemsAtLocation(dim, blockLoc, itemId, amount);
          }
          village.granaryItems = {};
        }
        village.foodStorage = 0;
        village.granaryLocation = undefined;
        saveVillage(village);
        notifyPlayer(player.name, `§eStored food dropped from §b${village.name}§e Granary!`);
      }
    }
  }

  if (typeId === CUSTOM_BLOCKS.TREASURY_BLOCK) {
    const village = findVillageAt(blockLoc);
    if (village && village.treasuryLocation) {
      const loc = village.treasuryLocation;
      if (loc.x === blockLoc.x && loc.y === blockLoc.y && loc.z === blockLoc.z) {
        const dim = player.dimension;
        // Drop all stored emeralds
        const emeraldCount = village.treasury ?? 0;
        if (emeraldCount > 0) {
          dropItemsAtLocation(dim, blockLoc, "minecraft:emerald", emeraldCount);
          village.treasury = 0;
        }
        village.treasuryLocation = undefined;
        saveVillage(village);
        notifyPlayer(player.name, `§eStored emeralds dropped from §b${village.name}§e Treasury!`);
      }
    }
  }

  if (typeId === "kingdoms:waypoint") {
    const village = findVillageAt(blockLoc);
    if (village && village.waypointLocation) {
      const loc = village.waypointLocation;
      if (loc.x === blockLoc.x && loc.y === blockLoc.y && loc.z === blockLoc.z) {
        removeWaypoint(village);
      }
    }
  }

  if (typeId === CUSTOM_BLOCKS.CASTLE) {
    const village = findVillageAt(blockLoc);
    if (village && village.hasCastle) {
      village.hasCastle = false;
      saveVillage(village);
      notifyPlayer(player.name, `§c🏰 Castle in §b${village.name}§c has been destroyed. Elite troops are no longer available.`);
    }
  }

  // Demolish the physical multi-block structure for any kingdoms building
  if (STRUCTURE_BLOCK_IDS.has(typeId)) {
    const origin = { x: blockLoc.x, y: blockLoc.y, z: blockLoc.z };
    const dimension = player.dimension;
    system.run(() => {
      demolishStructure(dimension, origin, typeId);
      removeStructureHub(dimension, origin);
    });
  }
});

// ── Structure Hub: playerInteractWithEntity ───────────────────────────────────
// This is the primary GUI trigger for mobile (touch/long-press) and for players
// using flint or empty hand on a structure block.  The invisible structure_hub
// entity is always interactable regardless of what the player holds.
world.afterEvents.playerInteractWithEntity.subscribe((event) => {
  const player = event.player;
  const entity = event.target;
  if (!player || !entity) return;
  if (entity.typeId !== "kingdoms:structure_hub") return;
  if (!canOpenMenu(player.name)) return;

  const structureType = entity.getDynamicProperty("kc:structure_type") as string | undefined;
  const blockLocStr = entity.getDynamicProperty("kc:block_loc") as string | undefined;
  if (!structureType || !blockLocStr) return;

  let blockLoc: { x: number; y: number; z: number };
  try { blockLoc = JSON.parse(blockLocStr as string); } catch { return; }

  const block = player.dimension.getBlock(blockLoc);
  if (!block) return;

  switch (structureType) {
    case CUSTOM_BLOCKS.TOWN_HALL:
      void showTownHallMenu(player, block);
      break;
    case CUSTOM_BLOCKS.BARRACKS:
      void showBarracksMenu(player, block);
      break;
    case CUSTOM_BLOCKS.MARKET:
      void showMarketMenu(player, block);
      break;
    case CUSTOM_BLOCKS.BLACKSMITH:
      void showBlacksmithMenu(player, block);
      break;
    case CUSTOM_BLOCKS.GRANARY:
      void showGranaryStorageMenu(player, block);
      break;
    case CUSTOM_BLOCKS.TREASURY_BLOCK:
      void showTreasuryBlockMenu(player, block);
      break;
    case CUSTOM_BLOCKS.TRADE_STATION:
      void showTradeStationMenu(player, block);
      break;
    case CUSTOM_BLOCKS.MATERIAL_STORAGE:
      void showMaterialStorageMenu(player, block);
      break;
    case "kingdoms:waypoint": {
      const wpVillage = findVillageAt(blockLoc);
      if (wpVillage && wpVillage.waypointLocation) {
        void showWaypointMenu(player, wpVillage);
        const wpKingdom = getKingdomOf(player.name);
        if (wpKingdom?.pendingDiplomacy) {
          system.runTimeout(() => { void showPendingDiplomacyRequest(player); }, 40);
        }
      }
      break;
    }
  }
});

// Waypoint menu is opened from itemStartUseOn (same pattern as all other blocks).

// ── Show pending diplomacy on player join ─────────────────────────────────────
// FIX: check persisted KingdomData.pendingDiplomacy instead of in-memory Map
world.afterEvents.playerJoin.subscribe((event) => {
  const playerName = event.playerName;
  system.runTimeout(() => {
    const player = world.getPlayers().find((p) => p.name === playerName);
    if (!player) return;

    // ── Starter kit (once per player) ─────────────────────────────────────
    const starterKey = `kc:starter_${playerName}`;
    if (!world.getDynamicProperty(starterKey)) {
      const inv = player.getComponent(EntityInventoryComponent.componentId) as EntityInventoryComponent | undefined;
      if (inv?.container) {
        inv.container.addItem(new ItemStack("kingdoms:town_hall_item", 1));
        inv.container.addItem(new ItemStack("kingdoms:village_spawner", 1));
        inv.container.addItem(new ItemStack("minecraft:cobblestone", 10));
        inv.container.addItem(new ItemStack("minecraft:emerald", 50));
        world.setDynamicProperty(starterKey, true);
        player.sendMessage(
          `§a§lWelcome to Kingdoms & Conquest!§r\n` +
          `§7You received: §f1 Town Hall§7, §f1 Village Spawner§7, §f10 Cobblestone§7, §f50 Emeralds§7.\n` +
          `§ePlace the Village Spawner first to create your village, then build your Town Hall inside it!`
        );
      }
    }

    const kingdom = getKingdomOf(playerName);
    if (kingdom?.pendingDiplomacy) void showPendingDiplomacyRequest(player);
  }, 100);
});

startVillagerBowSystem();
registerChargeSystem();
loadSiegesFromStorage();

system.runInterval(() => {
  const tick = getCurrentTick();
  tickWatchtowers(tick);
  tickTradeStations(tick);
  tickSieges(tick);
  tickBorders(tick);
  tickAutoDefense(tick);
  tickChargeSystem(tick);
  tickFormations(tick);
  tickPendingReinforcements(tick);

  for (const village of getAllVillages()) {
    tickTraining(village, tick);
  }
  tickAllMerchantsSpawn(tick);
  tickAllMerchantMovement();
  tickAllMinerProduction(tick);
}, 20);

system.runInterval(() => {
  processAllFood();
  processAllWages();
  processAllPopulation();
  tickBandits();
  processAllSoldierFood();
  autoHarvestAllVillages();
  checkDailyCrisisAlerts();
}, 24000);

system.runInterval(() => {
  refreshAllGuards();
}, 12000);

system.runInterval(() => {
  enforceGuardPositions();
}, 600);

system.runInterval(() => {
  for (const village of getAllVillages()) {
    updateHousingCapacity(village.id);
  }
}, 72000);


world.beforeEvents.playerBreakBlock.subscribe((event) => {
  const { player, block } = event;
  if (!isCropBlock(block.typeId)) return;

  const permutation = block.permutation;
  const age = permutation.getState("age") as number | undefined;
  if (age === undefined) return;

  const maxAge = CROP_MAX_AGES[block.typeId];
  if (age < maxAge) return;

  const village = findVillageAt(block.location);
  if (!village) return;

  event.cancel = true;

  const blockTypeId = block.typeId;
  const blockAge = age;
  const loc = { x: block.location.x, y: block.location.y, z: block.location.z };
  const dimId = player.dimension.id;

  system.run(() => {
    try {
      const dim = world.getDimension(dimId);
      const freshBlock = dim.getBlock(loc);
      if (!freshBlock) return;
      const freshAge = freshBlock.permutation.getState("age") as number | undefined;
      if (freshAge !== blockAge) return;
      freshBlock.setPermutation(freshBlock.permutation.withState("age", 0));
      handleCropBreak(player, blockTypeId, blockAge, loc, dimId);
    } catch {
      handleCropBreak(player, blockTypeId, blockAge, loc, dimId);
    }
  });
});

world.afterEvents.itemUse.subscribe((event) => {
  const player = event.source;
  if (!player) return;
  const itemId = event.itemStack?.typeId;
  if (!itemId) return;

  if (itemId === "kingdoms:recall_scroll") {
    system.run(() => {
      recallNearbyTroops(player);
    });
    return;
  }

  if (itemId === "kingdoms:tactics_horn") {
    openTacticsMenu(player);
    return;
  }

  if (TROOP_TOKEN_MAP[itemId]) {
    system.run(() => {
      releaseTroops(player);
    });
    return;
  }

  if (itemId === "kingdoms:village_spawner") {
    void showVillageSpawnerMenu(player);
    return;
  }

  if (itemId === "kingdoms:formation_scroll") {
    openTacticsMenu(player);
  }
});

// ── Village Spawner ──────────────────────────────────────────────────────────
// Spawns a small procedural NPC settlement (city or village) near the player.

async function showVillageSpawnerMenu(
  player: import("@minecraft/server").Player
): Promise<void> {
  const lastRaw = world.getDynamicProperty("kc_lastSettlement") as string | undefined;
  const hasLast = !!lastRaw;

  const form = new ActionFormData()
    .title("Village Spawner")
    .body("Choose what to spawn near you.\n§7A settlement will appear ~50-80 blocks away.")
    .button("🏙 Spawn City\n§7Large walled kingdom")
    .button("🏘 Spawn Village\n§7Small walled village")
    .button(hasLast ? "📍 Teleport to Last Settlement\n§7Return to previously spawned site" : "📍 No Settlement Yet\n§7Spawn one first");

  const response = await form.show(player);
  if (response.canceled || response.selection === undefined) return;

  if (response.selection === 2) {
    if (!lastRaw) {
      notifyPlayer(player.name, "§cNo settlement has been spawned yet.");
      return;
    }
    try {
      const saved = JSON.parse(lastRaw) as { x: number; y: number; z: number; type: string };
      player.teleport({ x: saved.x, y: saved.y + 1, z: saved.z + 35 });
      notifyPlayer(player.name, `§aTeleported to §b${saved.type}§a. Gate is just ahead.`);
    } catch {
      notifyPlayer(player.name, "§cCouldn't read last settlement location.");
    }
    return;
  }

  const type = response.selection === 0 ? "city" : "village";
  const dim = player.dimension;
  const loc = player.location;

  const angle = Math.random() * Math.PI * 2;
  const dist = type === "city" ? 80 : 50;
  const anchor = {
    x: Math.round(loc.x + Math.cos(angle) * dist),
    y: Math.round(loc.y),
    z: Math.round(loc.z + Math.sin(angle) * dist),
  };

  notifyPlayer(player.name, `§7Spawning §b${type}§7… (check ~${dist} blocks away)`);
  system.run(() => spawnNpcVillage(dim, anchor, type));
}

// ── Helpers shared by both kingdom generators ─────────────────────────────────
type _BlkFn  = (x: number, y: number, z: number, id: string) => void;
type _VolFn  = (x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, id: string) => void;
type _RingFn = (x1: number, z1: number, x2: number, z2: number, y1: number, y2: number, id: string) => void;
type _CmdFn  = (cmd: string) => void;

function _buildMedievalHouse(
  b: _BlkFn, v: _VolFn, cmd: _CmdFn,
  cx: number, cz: number, w: number, d: number,
  wall: string, post: string
): void {
  const hw = Math.floor(w / 2), hd = Math.floor(d / 2);
  // Floor
  v(cx-hw, 0, cz-hd, cx+hw, 0, cz+hd, "minecraft:oak_planks");
  // Corner posts full-height
  for (const [px, pz] of [[cx-hw,cz-hd],[cx+hw,cz-hd],[cx-hw,cz+hd],[cx+hw,cz+hd]] as [number,number][])
    for (let y = 1; y <= 5; y++) b(px, y, pz, post);
  // Walls y=1-4
  for (let y = 1; y <= 4; y++) {
    for (let x = cx-hw; x <= cx+hw; x++) { b(x, y, cz-hd, wall); b(x, y, cz+hd, wall); }
    for (let z = cz-hd+1; z <= cz+hd-1; z++) { b(cx-hw, y, z, wall); b(cx+hw, y, z, wall); }
  }
  // Top beam row
  for (let x = cx-hw; x <= cx+hw; x++) { b(x, 5, cz-hd, post); b(x, 5, cz+hd, post); }
  for (let z = cz-hd+1; z <= cz+hd-1; z++) { b(cx-hw, 5, z, post); b(cx+hw, 5, z, post); }
  // Windows
  b(cx, 2, cz-hd, "minecraft:glass_pane"); b(cx, 3, cz-hd, "minecraft:glass_pane");
  b(cx, 2, cz+hd, "minecraft:glass_pane"); b(cx, 3, cz+hd, "minecraft:glass_pane");
  if (w >= 8) {
    b(cx-hw, 2, cz, "minecraft:glass_pane"); b(cx-hw, 3, cz, "minecraft:glass_pane");
    b(cx+hw, 2, cz, "minecraft:glass_pane"); b(cx+hw, 3, cz, "minecraft:glass_pane");
  }
  // Door opening (south wall)
  b(cx, 1, cz+hd, "minecraft:air"); b(cx, 2, cz+hd, "minecraft:air");
  // Stepped brick pyramid roof
  for (let step = 0; step <= Math.min(hw, hd); step++) {
    const x1 = cx-hw+step, x2 = cx+hw-step, z1 = cz-hd+step, z2 = cz+hd-step;
    if (x1 > x2 || z1 > z2) break;
    v(x1, 6+step, z1, x2, 6+step, z2, "minecraft:brick_block");
  }
  // Interior ceiling lantern
  b(cx, 4, cz, "minecraft:lantern");

  // ── Interior furniture ────────────────────────────────────────────────────
  const ix1 = cx - hw + 1, ix2 = cx + hw - 1;
  const iz1 = cz - hd + 1, iz2 = cz + hd - 1;
  // Bed along north wall (two blocks: head near wall, foot toward center)
  cmd(`setblock ${ix1} 1 ${iz1} minecraft:red_bed ["direction"=2,"occupied_bit"=false,"head_piece_bit"=true]`);
  cmd(`setblock ${ix1} 1 ${iz1+1} minecraft:red_bed ["direction"=2,"occupied_bit"=false,"head_piece_bit"=false]`);
  // Second bed if house is wide enough
  if (w >= 9) {
    cmd(`setblock ${ix2} 1 ${iz1} minecraft:red_bed ["direction"=2,"occupied_bit"=false,"head_piece_bit"=true]`);
    cmd(`setblock ${ix2} 1 ${iz1+1} minecraft:red_bed ["direction"=2,"occupied_bit"=false,"head_piece_bit"=false]`);
  }
  // Bookshelf along north inner wall
  b(cx, 2, iz1, "minecraft:bookshelf");
  b(cx, 3, iz1, "minecraft:bookshelf");
  // Crafting table near northwest corner
  b(ix1, 1, iz2-1, "minecraft:crafting_table");
  // Chest near northeast corner
  b(ix2, 1, iz2-1, "minecraft:chest");
  // Furnace near east wall center
  b(ix2, 1, cz, "minecraft:furnace");
  // Barrel / storage near west wall
  b(ix1, 1, cz, "minecraft:barrel");
  // Oak door (bottom + top half) via command so block states are set correctly
  cmd(`setblock ${cx} 1 ${cz+hd} minecraft:oak_door ["direction"=1,"door_hinge_bit"=false,"open_bit"=false,"upper_block_bit"=false]`);
  cmd(`setblock ${cx} 2 ${cz+hd} minecraft:oak_door ["direction"=1,"door_hinge_bit"=false,"open_bit"=false,"upper_block_bit"=true]`);
}

function _buildTower(
  b: _BlkFn, v: _VolFn,
  tx: number, tz: number, r: number, h: number,
  wall: string, crown: string
): void {
  for (let y = 1; y <= h; y++)
    for (let dx = -r; dx <= r; dx++) {
      b(tx+dx, y, tz-r, wall); b(tx+dx, y, tz+r, wall);
      b(tx-r, y, tz+dx, wall); b(tx+r, y, tz+dx, wall);
    }
  v(tx-r+1, 1, tz-r+1, tx+r-1, 1, tz+r-1, "minecraft:cobblestone");
  for (let dx = -r; dx <= r; dx += 2) { b(tx+dx, h+1, tz-r, crown); b(tx+dx, h+1, tz+r, crown); }
  for (let dz = -r+1; dz <= r-1; dz += 2) { b(tx-r, h+1, tz+dz, crown); b(tx+r, h+1, tz+dz, crown); }
}

function spawnNpcVillage(
  dim: import("@minecraft/server").Dimension,
  anchor: { x: number; y: number; z: number },
  type: "city" | "village"
): void {
  let groundY = anchor.y;
  try {
    const top = dim.getTopmostBlock({ x: anchor.x, z: anchor.z });
    if (top) groundY = top.y;
  } catch { /* use player Y */ }

  const BX = Math.round(anchor.x), BY = groundY, BZ = Math.round(anchor.z);

  const ops: Array<[number, number, number, string]> = [];
  const cmds: string[] = [];

  const b: _BlkFn  = (x, y, z, id) => ops.push([BX+x, BY+y, BZ+z, id]);
  const v: _VolFn  = (x1, y1, z1, x2, y2, z2, id) => {
    for (let x = Math.min(x1,x2); x <= Math.max(x1,x2); x++)
      for (let y = Math.min(y1,y2); y <= Math.max(y1,y2); y++)
        for (let z = Math.min(z1,z2); z <= Math.max(z1,z2); z++)
          ops.push([BX+x, BY+y, BZ+z, id]);
  };
  const rng: _RingFn = (x1, z1, x2, z2, y1, y2, id) => {
    for (let y = y1; y <= y2; y++) {
      for (let x = x1; x <= x2; x++) { b(x, y, z1, id); b(x, y, z2, id); }
      for (let z = z1+1; z <= z2-1; z++) { b(x1, y, z, id); b(x2, y, z, id); }
    }
  };
  const cmd: _CmdFn = (c) => cmds.push(c);

  if (type === "city") {
    _buildKingdom(b, v, rng, cmd);
  } else {
    _buildVillage(b, v, rng, cmd);
  }

  // Save location for teleport button
  try {
    world.setDynamicProperty("kc_lastSettlement", JSON.stringify({ x: BX, y: BY, z: BZ, type }));
  } catch { /* skip */ }

  const villagerCount = type === "city" ? 10 : 4;
  let cursor = 0;
  const BATCH = 700;
  const handle = system.runInterval(() => {
    const end = Math.min(cursor + BATCH, ops.length);
    for (let i = cursor; i < end; i++) {
      const [x, y, z, id] = ops[i];
      try { dim.getBlock({ x, y, z })?.setType(id); } catch { /* unloaded chunk */ }
    }
    cursor = end;
    if (cursor >= ops.length) {
      system.clearRun(handle);
      // Run command-based placements (doors, beds — need block states)
      for (const c of cmds) {
        dim.runCommandAsync(c).catch(() => { /* skip */ });
      }
      // Spawn villagers
      for (let i = 0; i < villagerCount; i++) {
        try {
          dim.spawnEntity("minecraft:villager_v2", {
            x: BX + (Math.random() * 20 - 10),
            y: BY + 1,
            z: BZ + (Math.random() * 20 - 10),
          });
        } catch { /* skip */ }
      }
    }
  }, 1);
}

// ─── KINGDOM (CITY) GENERATOR ─────────────────────────────────────────────────
function _buildKingdom(b: _BlkFn, v: _VolFn, rng: _RingFn, cmd: _CmdFn): void {
  const SB   = "minecraft:stone_bricks";
  const CSB  = "minecraft:chiseled_stone_bricks";
  const COBB = "minecraft:cobblestone";
  const OAK  = "minecraft:oak_planks";
  const DOAK = "minecraft:dark_oak_planks";
  const BRCK = "minecraft:brick_block";
  const LOG  = "minecraft:stripped_oak_log";
  const DLOG = "minecraft:stripped_dark_oak_log";
  const GPNE = "minecraft:glass_pane";
  const IRBT = "minecraft:iron_bars";
  const PATH = "minecraft:dirt_path";
  const LNTN = "minecraft:lantern";
  const ANDE = "minecraft:polished_andesite";
  const AIR  = "minecraft:air";
  const WATR = "minecraft:water";
  const OLEG = "minecraft:oak_log";
  const OLAV = "minecraft:oak_leaves";
  const FENC = "minecraft:oak_fence";
  const RWOL = "minecraft:red_wool";
  const WWOL = "minecraft:white_wool";

  // 1. Clear overhead
  v(-34, 1, -34, 34, 20, 34, AIR);

  // 2. Ward floor
  v(-30, 0, -30, 30, 0, 30, COBB);

  // 3. Outer wall (x=±30, z=±30, 1-thick, 6 tall)
  rng(-30, -30, 30, 30, 1, 6, SB);
  for (let x = -30; x <= 30; x += 2) { b(x, 7, -30, CSB); b(x, 7, 30, CSB); }
  for (let z = -29; z <= 29; z += 2) { b(-30, 7, z, CSB); b(30, 7, z, CSB); }

  // 4. Corner towers (5×5, 10 tall, battlements at 11)
  for (const [tx, tz] of [[-30,-30],[30,-30],[-30,30],[30,30]] as [number,number][]) {
    _buildTower(b, v, tx, tz, 2, 10, SB, CSB);
    b(tx, 12, tz, FENC);
    b(tx, 13, tz, WWOL);
  }

  // 5. Gatehouse (south, z=+30) — twin towers flanking 3-wide gate
  for (let y = 1; y <= 4; y++) { b(-1, y, 30, AIR); b(0, y, 30, AIR); b(1, y, 30, AIR); }
  b(-1, 5, 30, SB); b(0, 5, 30, IRBT); b(1, 5, 30, SB);
  for (const gtx of [-5, 5] as number[]) {
    _buildTower(b, v, gtx, 30, 2, 13, SB, CSB);
    b(gtx, 15, 30, FENC); b(gtx, 16, 30, RWOL);
  }
  v(-1, 0, 31, 1, 0, 38, PATH);
  v(-1, 0, 26, 1, 0, 29, PATH);

  // 6. Internal roads
  v(-1, 0, -28, 1, 0, 25, PATH);
  v(-28, 0, -1, 28, 0, 1, PATH);

  // 7. Central plaza (stone brick) + fountain
  v(-9, 0, -9, 9, 0, 9, SB);
  v(-2, 1, -2, 2, 1, 2, SB);
  b(0, 2, 0, SB);
  for (const [fx, fz] of [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]] as [number,number][])
    b(fx, 1, fz, WATR);
  for (const [lx, lz] of [[-8,-8],[8,-8],[-8,8],[8,8]] as [number,number][]) {
    b(lx, 1, lz, SB); b(lx, 2, lz, FENC); b(lx, 3, lz, LNTN);
  }

  // 8. Town buildings in the outer ward
  _buildMedievalHouse(b, v, -19, -19, 10, 8, OAK,  LOG);
  _buildMedievalHouse(b, v,  19, -19, 10, 8, OAK,  LOG);
  _buildMedievalHouse(b, v, -21,   2,  8, 10, DOAK, DLOG);
  _buildMedievalHouse(b, v,  21,   2,  8, 10, DOAK, DLOG);
  _buildMedievalHouse(b, v, -19,  19, 10, 8, OAK,  LOG);
  _buildMedievalHouse(b, v,  19,  19, 10, 8, OAK,  LOG);
  _buildMedievalHouse(b, v, -12, -15,  7, 6, OAK,  LOG);
  _buildMedievalHouse(b, v,  12, -15,  7, 6, OAK,  LOG);

  // 9. Inner keep wall (x=±14, z=-30 to -12)
  rng(-14, -30, 14, -12, 1, 5, SB);
  for (let y = 1; y <= 3; y++) { b(-1, y, -12, AIR); b(0, y, -12, AIR); b(1, y, -12, AIR); }
  for (let x = -14; x <= 14; x += 2) b(x, 6, -12, CSB);
  v(-1, 0, -12, 1, 0, -3, PATH);

  // 10. Keep main body (x=±11, z=-29 to -15, 10 tall)
  rng(-11, -29, 11, -15, 1, 10, ANDE);
  v(-10, 2, -28, 10, 10, -16, AIR);
  v(-10, 1, -28, 10,  1, -16, SB);
  // Keep windows
  for (let z = -26; z >= -18; z -= 4) {
    b(-11, 5, z, GPNE); b(-11, 6, z, GPNE);
    b( 11, 5, z, GPNE); b( 11, 6, z, GPNE);
  }
  for (let x = -8; x <= 8; x += 4) b(x, 5, -29, GPNE);
  for (let y = 1; y <= 3; y++) { b(-1, y, -15, AIR); b(0, y, -15, AIR); b(1, y, -15, AIR); }
  // Interior support pillars + lights
  for (const [px, pz] of [[-7,-26],[7,-26],[-7,-20],[7,-20]] as [number,number][])
    for (let y = 1; y <= 9; y++) b(px, y, pz, SB);
  for (const [lx, lz] of [[-4,-24],[4,-24],[-4,-20],[4,-20],[0,-22]] as [number,number][])
    b(lx, 2, lz, LNTN);

  // 11. Keep corner towers (5×5, 16 tall, red flag)
  for (const [tx, tz] of [[-11,-29],[11,-29],[-11,-15],[11,-15]] as [number,number][]) {
    _buildTower(b, v, tx, tz, 2, 16, SB, CSB);
    b(tx, 5, tz-2, GPNE); b(tx, 5, tz+2, GPNE);
    b(tx, 18, tz, FENC); b(tx, 19, tz, RWOL);
  }

  // 12. Trees outside outer wall
  for (const [tx, tz] of [
    [-38,-22],[-40,-6],[-38,14],[-40,26],
    [38,-22],[40,-6],[38,14],[40,26],
    [-12,38],[12,38],[0,-42],[24,-40],[-24,-40],
  ] as [number,number][]) {
    const h = 5 + Math.floor(Math.random() * 3);
    for (let y = 1; y <= h; y++) b(tx, y, tz, OLEG);
    v(tx-2, h-1, tz-2, tx+2, h+2, tz+2, OLAV);
    b(tx, h+3, tz, OLAV);
  }
}

// ─── VILLAGE GENERATOR ────────────────────────────────────────────────────────
function _buildVillage(b: _BlkFn, v: _VolFn, rng: _RingFn): void {
  const SB   = "minecraft:stone_bricks";
  const CSB  = "minecraft:chiseled_stone_bricks";
  const OAK  = "minecraft:oak_planks";
  const SOAK = "minecraft:spruce_planks";
  const BRCK = "minecraft:brick_block";
  const LOG  = "minecraft:stripped_oak_log";
  const SLOG = "minecraft:stripped_spruce_log";
  const GPNE = "minecraft:glass_pane";
  const PATH = "minecraft:dirt_path";
  const LNTN = "minecraft:lantern";
  const FENC = "minecraft:oak_fence";
  const AIR  = "minecraft:air";
  const WATR = "minecraft:water";
  const OLEG = "minecraft:oak_log";
  const OLAV = "minecraft:oak_leaves";

  v(-22, 1, -22, 22, 12, 22, AIR);
  v(-20, 0, -20, 20, 0, 20, "minecraft:cobblestone");

  // Low stone wall
  rng(-18, -18, 18, 18, 1, 4, SB);
  for (let x = -18; x <= 18; x += 2) { b(x, 5, -18, CSB); b(x, 5, 18, CSB); }
  for (let z = -17; z <= 17; z += 2) { b(-18, 5, z, CSB); b(18, 5, z, CSB); }
  for (let y = 1; y <= 3; y++) { b(-1, y, 18, AIR); b(0, y, 18, AIR); b(1, y, 18, AIR); }

  v(-1, 0, -16, 1, 0, 16, PATH);
  v(-16, 0, -1, 16, 0, 1, PATH);

  // Well
  v(-1, 1, -1, 1, 1, 1, SB);
  b(0, 1, 0, WATR);
  for (const [wx, wz] of [[-2,0],[2,0],[0,-2],[0,2]] as [number,number][])
    b(wx, 1, wz, FENC);

  // Houses
  _buildMedievalHouse(b, v, -11, -11, 8, 7, OAK,  LOG);
  _buildMedievalHouse(b, v,  11, -11, 8, 7, SOAK, SLOG);
  _buildMedievalHouse(b, v, -12,   2, 7, 8, OAK,  LOG);
  _buildMedievalHouse(b, v,  12,   2, 7, 8, SOAK, SLOG);
  _buildMedievalHouse(b, v,   0,  11, 8, 7, OAK,  LOG);

  // Trees outside
  for (const [tx, tz] of [
    [-26,-14],[26,-14],[-26,14],[26,14],[0,-28],[-16,26],[16,26]
  ] as [number,number][]) {
    for (let y = 1; y <= 5; y++) b(tx, y, tz, OLEG);
    v(tx-2, 4, tz-2, tx+2, 7, tz+2, OLAV);
    b(tx, 8, tz, OLAV);
  }
}

registerCommands();

async function showClaimVillageForm(
  player: import("@minecraft/server").Player,
  block: import("@minecraft/server").Block
): Promise<void> {
  const form = new ModalFormData()
    .title("Claim Village")
    .textField("Kingdom Name", "Enter your kingdom name...")
    .textField("Village Name", "Enter a name for this village...");

  const response = await form.show(player);
  if (response.canceled) return;

  const [kingdomName, _villageName] = response.formValues as [string, string];
  if (!kingdomName) return;

  claimVillage(player, block, kingdomName);
}

async function showTownHallMenu(
  player: import("@minecraft/server").Player,
  block: import("@minecraft/server").Block
): Promise<void> {
  const village = findVillageAt(block.location);
  if (!village) {
    notifyPlayer(player.name, "§cNo village data. Place a Town Hall and claim first.");
    return;
  }

  const isOwner = village.owner === player.name;
  const summary = getVillageSummary(village);

  const form = new ActionFormData()
    .title(`${village.name} — Town Hall`)
    .body(summary);

  if (isOwner) {
    form
      .button("Kingdom Overview")
      .button("Treasury")
      .button("Diplomacy")
      .button("Send Reinforcements")
      .button("Merchants")
      .button("Rename Village")
      .button("🏪 Shop");
  } else {
    form.button("Close");
  }

  const response = await form.show(player);
  if (response.canceled || !isOwner) return;

  switch (response.selection) {
    case 0: await showKingdomOverview(player); break;
    case 1: await showTreasuryMenu(player, village.id); break;
    case 2: await showDiplomacyMenu(player); break;
    case 3: await showReinforcementsMenu(player, village.id); break;
    case 4: await showActiveMerchantsMenu(player, village); break;
    case 5: await showRenameForm(player, village.id); break;
    case 6: await showTownHallShop(player, village); break;
  }
}

const TOWN_HALL_SHOP_ITEMS: Array<{
  label: string;
  desc: string;
  itemId: string;
  cost: number;
}> = [
  { label: "🌾 Granary",           desc: "Stores food. Required before Barracks.",         itemId: "kingdoms:granary_item",    cost: 20  },
  { label: "💰 Treasury",          desc: "Stores emeralds & wages workers.",                itemId: "kingdoms:treasury_item",   cost: 20  },
  { label: "⚔ Barracks",           desc: "Train & station troops. Needs Granary+Treasury.", itemId: "kingdoms:barracks_item",   cost: 40  },
  { label: "🛒 Market",            desc: "Unlocks trade, seeds & merchant visits.",         itemId: "kingdoms:market_item",     cost: 30  },
  { label: "🔨 Blacksmith",        desc: "Upgrade troop weapons & armour.",                 itemId: "kingdoms:blacksmith_item", cost: 50  },
  { label: "📦 Material Storage",  desc: "Stores mined iron, gold, diamonds & more.",      itemId: "kingdoms:storage_item",    cost: 30  },
  { label: "🏰 Castle",            desc: "Unlocks elite troops (Samurai, Lancer, Legion).", itemId: "kingdoms:castle_item",     cost: 200 },
  { label: "🗺 Waypoint",          desc: "Fast-travel point for your village.",             itemId: "kingdoms:waypoint",        cost: 30  },
];

async function showTownHallShop(
  player: import("@minecraft/server").Player,
  village: VillageData
): Promise<void> {
  const form = new ActionFormData()
    .title(`🏪 Town Hall Shop — ${village.name}`)
    .body(`§7Treasury: §6${village.treasury}💎§r\n§7Purchase buildings & items for your village.\n`);

  for (const item of TOWN_HALL_SHOP_ITEMS) {
    const affordable = village.treasury >= item.cost ? "§a" : "§c";
    form.button(`${item.label}\n${affordable}${item.cost}💎§7 — ${item.desc}`);
  }
  form.button("§7← Back");

  const response = await form.show(player);
  if (response.canceled || response.selection === undefined) return;
  if (response.selection >= TOWN_HALL_SHOP_ITEMS.length) return;

  const selected = TOWN_HALL_SHOP_ITEMS[response.selection];

  const fresh = getVillage(village.id);
  if (!fresh) return;

  if (fresh.treasury < selected.cost) {
    notifyPlayer(player.name, `§cNot enough treasury funds. Need §f${selected.cost}💎§c, have §f${fresh.treasury}💎§c.`);
    return;
  }

  const inv = player.getComponent(EntityInventoryComponent.componentId) as EntityInventoryComponent | undefined;
  if (!inv?.container) return;

  const leftover = inv.container.addItem(new ItemStack(selected.itemId, 1));
  if (leftover) {
    notifyPlayer(player.name, "§cYour inventory is full. Make room first.");
    return;
  }

  fresh.treasury -= selected.cost;
  saveVillage(fresh);
  notifyPlayer(player.name, `§aPurchased §f${selected.label}§a for §6${selected.cost}💎§a! Place it inside your village territory.`);
}

async function showBarracksMenu(
  player: import("@minecraft/server").Player,
  block: import("@minecraft/server").Block
): Promise<void> {
  const village = findVillageAt(block.location);
  if (!village || village.owner !== player.name) {
    notifyPlayer(player.name, "§cYou don't own this village.");
    return;
  }

  const t = village.troops;
  const hk = t.heavyKnight ?? 0;
  const sm = t.samurai ?? 0;
  const ml = t.mercenaryLancer ?? 0;
  const lg = t.legionary ?? 0;
  const carried = countTroopTokens(player);
  const carriedTotal = carried.cityGuards + carried.spearmen + carried.archers + carried.cavalry +
    (carried.heavyKnight ?? 0) + (carried.samurai ?? 0) + (carried.mercenaryLancer ?? 0) + (carried.legionary ?? 0);

  const tick = getCurrentTick();
  const queueSummary = getTrainingQueueSummary(village, tick);
  const queueCount = village.trainingQueue?.length ?? 0;
  const rs = village.resourceStorage;

  const hkLocked = village.barracksLevel < 3;
  const castleBuilt = village.hasCastle ?? false;
  const hkLine = hkLocked
    ? `§7Heavy Knights: §c${hk} §7(🔒 needs Barracks Lv3)`
    : `§aHeavy Knights: ${hk}`;
  const eliteLine = castleBuilt
    ? `§6Samurai: ${sm}  Lancer: ${ml}  Legionary: ${lg}`
    : `§7Elite Troops: §c🔒 needs Castle`;

  const form = new ActionFormData()
    .title(`${village.name} — Barracks Lv${village.barracksLevel}`)
    .body(
      `§7── Stationed ──\n` +
      `City Guards: ${t.cityGuards}  Spearmen: ${t.spearmen}\n` +
      `Archers: ${t.archers}  Cavalry: ${t.cavalry}\n` +
      `${hkLine}\n` +
      `${eliteLine}\n\n` +
      `§7── Carried in Inventory ──\n` +
      `Guards: ${carried.cityGuards}  Spearmen: ${carried.spearmen}\n` +
      `Archers: ${carried.archers}  Cavalry: ${carried.cavalry}  HK: ${carried.heavyKnight ?? 0}\n` +
      `Samurai: ${carried.samurai ?? 0}  Lancer: ${carried.mercenaryLancer ?? 0}  Legionary: ${carried.legionary ?? 0}\n\n` +
      `§7── Training Queue (${queueCount}/10) ──\n` +
      `${queueSummary}\n\n` +
      `Treasury: ${village.treasury} emeralds  Iron: ${rs.iron}  Gold: ${rs.gold}  Diamonds: ${rs.diamonds}`
    )
    .button(`🪖 Train Troops (queue: ${queueCount}/10)\n§7Select troop type and quantity`)
    .button(`⚔ Pick Up Troops (${t.cityGuards + t.spearmen + t.archers + t.cavalry + hk + sm + ml + lg} stationed)`)
    .button(carriedTotal > 0 ? `🏹 Return Troops to Barracks (${carriedTotal} carried)` : "🏹 Return Troops (none carried)")
    .button(`⬆ Upgrade Barracks (${village.barracksLevel * 15} emeralds)`)
    .button("📯 Tactics Horn\n§7Take a formation command horn");

  const response = await form.show(player);
  if (response.canceled) return;

  switch (response.selection) {
    case 0: await showTrainTroopsForm(player, village); break;
    case 1: await showPickUpTroopsForm(player, village); break;
    case 2: await showReturnTroopsForm(player, village); break;
    case 3: upgradeBarracks(village); break;
    case 4: giveTacticsHorn(player); break;
  }
}

function giveTacticsHorn(player: import("@minecraft/server").Player): void {
  const inv = player.getComponent(EntityInventoryComponent.componentId) as EntityInventoryComponent | undefined;
  if (!inv?.container) return;
  const container = inv.container;
  for (let i = 0; i < container.size; i++) {
    const slot = container.getItem(i);
    if (slot?.typeId === "kingdoms:tactics_horn") {
      notifyPlayer(player.name, "§eYou already have a Tactics Horn.");
      return;
    }
  }
  for (let i = 0; i < container.size; i++) {
    if (!container.getItem(i)) {
      container.setItem(i, new ItemStack("kingdoms:tactics_horn", 1));
      notifyPlayer(player.name, "§a📯 Tactics Horn added to your inventory. Right-click to command your troops!");
      return;
    }
  }
  notifyPlayer(player.name, "§cInventory full — make room and try again.");
}

async function showPickUpTroopsForm(
  player: import("@minecraft/server").Player,
  village: VillageData
): Promise<void> {
  const t = village.troops;
  const hk  = t.heavyKnight ?? 0;
  const sm2 = t.samurai ?? 0;
  const ml2 = t.mercenaryLancer ?? 0;
  const lg2 = t.legionary ?? 0;
  const total = t.cityGuards + t.spearmen + t.archers + t.cavalry + hk + sm2 + ml2 + lg2;

  if (total === 0) {
    notifyPlayer(player.name, `§cNo troops stationed in §b${village.name}§c to pick up.`);
    return;
  }

  type TroopEntry = { key: keyof TroopPickup; label: string; count: number };
  const entries: TroopEntry[] = ([
    { key: "cityGuards",       label: "City Guards",      count: t.cityGuards },
    { key: "spearmen",         label: "Spearmen",          count: t.spearmen  },
    { key: "archers",          label: "Archers",           count: t.archers   },
    { key: "cavalry",          label: "Cavalry",           count: t.cavalry   },
    { key: "heavyKnight",      label: "Heavy Knights",     count: hk          },
    { key: "samurai",          label: "Samurai",           count: sm2         },
    { key: "mercenaryLancer",  label: "Mercenary Lancers", count: ml2         },
    { key: "legionary",        label: "Legionaries",       count: lg2         },
  ] as TroopEntry[]).filter((e) => e.count > 0);

  const form = new ModalFormData().title(`⚔ Pick Up Troops — ${village.name}`);
  for (const e of entries) {
    form.slider(`${e.label} (${e.count} stationed)`, 0, e.count, 1, 0);
  }

  const response = await form.show(player);
  if (response.canceled) return;

  const values = response.formValues as number[];
  const pickup: TroopPickup = {
    cityGuards: 0, spearmen: 0, archers: 0, cavalry: 0,
    heavyKnight: 0, samurai: 0, mercenaryLancer: 0, legionary: 0,
  };
  entries.forEach((e, i) => { pickup[e.key] = values[i] ?? 0; });
  pickupTroops(player, village, pickup);
}

async function showReturnTroopsForm(
  player: import("@minecraft/server").Player,
  village: VillageData
): Promise<void> {
  const carried = countTroopTokens(player);
  const hkCarried = carried.heavyKnight ?? 0;
  const smCarried = carried.samurai ?? 0;
  const mlCarried = carried.mercenaryLancer ?? 0;
  const lgCarried = carried.legionary ?? 0;
  const total = carried.cityGuards + carried.spearmen + carried.archers + carried.cavalry +
    hkCarried + smCarried + mlCarried + lgCarried;

  if (total === 0) {
    notifyPlayer(player.name, "§cYou are not carrying any troops.");
    return;
  }

  const form = new ActionFormData()
    .title(`Return Troops — ${village.name}`)
    .body(
      `§7Return all carried troops to this barracks.\n\n` +
      `§fCarrying:\n` +
      `  Guards: ${carried.cityGuards}\n` +
      `  Spearmen: ${carried.spearmen}\n` +
      `  Archers: ${carried.archers}\n` +
      `  Cavalry: ${carried.cavalry}\n` +
      `  Heavy Knights: ${hkCarried}\n` +
      `  Samurai: ${smCarried}\n` +
      `  Mercenary Lancers: ${mlCarried}\n` +
      `  Legionaries: ${lgCarried}\n\n` +
      `§aTotal: ${total} troops`
    )
    .button("Return All Troops")
    .button("Cancel");

  const response = await form.show(player);
  if (response.canceled || response.selection !== 0) return;

  const inv = player.getComponent(EntityInventoryComponent.componentId) as EntityInventoryComponent | undefined;
  if (!inv?.container) return;
  const container = inv.container;

  for (let i = 0; i < container.size; i++) {
    const slot = container.getItem(i);
    if (!slot) continue;
    const info = TROOP_TOKEN_MAP[slot.typeId];
    if (!info) continue;
    village.troops[info.troopType] = (village.troops[info.troopType] ?? 0) + slot.amount;
    container.setItem(i, undefined);
  }

  saveVillage(village);
  notifyPlayer(player.name, `§a${total} troops returned to §b${village.name}§a barracks.`);
}

async function showTrainTroopsForm(
  player: import("@minecraft/server").Player,
  village: VillageData
): Promise<void> {
  const tick = getCurrentTick();
  const queueCount = village.trainingQueue?.length ?? 0;

  const troopTypes: TroopType[] = [
    "cityGuards", "spearmen", "archers", "cavalry", "heavyKnight",
    "samurai", "mercenaryLancer", "legionary",
  ];

  const makeCostLine = (type: TroopType) => {
    const c = TRAINING_COSTS[type];
    const secs = Math.ceil(TRAINING_TICKS[type] / 20);
    const parts = [`${c.emeralds} emeralds`, `${c.iron} iron`];
    if (c.gold > 0) parts.push(`${c.gold} gold`);
    if (c.diamonds > 0) parts.push(`${c.diamonds} diamonds`);
    return `${parts.join(", ")} | ~${secs}s/unit`;
  };

  const rs = village.resourceStorage;
  const queueSummary = getTrainingQueueSummary(village, tick);
  const hkAvailable = village.barracksLevel >= 3;
  const castleAvailable = village.hasCastle ?? false;
  const playerVillages = getAllVillages().filter(v => v.owner === player.name);
  const eliteAvailable = castleAvailable;
  const eliteLockMsg = !castleAvailable ? "🔒 needs Castle" : "";

  const form = new ActionFormData()
    .title(`Train Troops — ${village.name}`)
    .body(
      `§7── Resources ──\n` +
      `Treasury: §f${village.treasury}💎  §7Iron: §f${rs.iron}  §7Gold: §f${rs.gold}  §7Di: §f${rs.diamonds}\n\n` +
      `§7── Queue (${queueCount}/10) ──\n${queueSummary}\n\n` +
      `§7Select a troop type to queue training:`
    )
    .button(`City Guard\n§7${makeCostLine("cityGuards")}`)
    .button(`Spearman\n§7${makeCostLine("spearmen")}`)
    .button(`Archer\n§7${makeCostLine("archers")}`)
    .button(`Cavalry\n§7${makeCostLine("cavalry")}`)
    .button(hkAvailable
      ? `Heavy Knight\n§7${makeCostLine("heavyKnight")}`
      : `§7Heavy Knight (🔒 Barracks Lv3 needed)\n§7${makeCostLine("heavyKnight")}`)
    .button(eliteAvailable
      ? `⭐ Samurai\n§7${makeCostLine("samurai")}`
      : `§7Samurai (${eliteLockMsg})\n§7${makeCostLine("samurai")}`)
    .button(eliteAvailable
      ? `⭐ Mercenary Lancer\n§7${makeCostLine("mercenaryLancer")}`
      : `§7Mercenary Lancer (${eliteLockMsg})\n§7${makeCostLine("mercenaryLancer")}`)
    .button(eliteAvailable
      ? `⭐ Legionary\n§7${makeCostLine("legionary")}`
      : `§7Legionary (${eliteLockMsg})\n§7${makeCostLine("legionary")}`)
    .button("Back");

  const response = await form.show(player);
  if (response.canceled || response.selection === 8) return;

  const selectedType = troopTypes[response.selection!];

  const countForm = new ModalFormData()
    .title(`Train ${TROOP_LABELS[selectedType]}`)
    .slider(`How many to train? (cost x N)`, 1, 20, 1, 1);

  const countResponse = await countForm.show(player);
  if (countResponse.canceled || countResponse.formValues == null) return;

  const count = countResponse.formValues[0] as number;
  queueTraining(village, selectedType, count, tick, playerVillages.length);
}

async function showMarketMenu(
  player: import("@minecraft/server").Player,
  block: import("@minecraft/server").Block
): Promise<void> {
  const village = findVillageAt(block.location);
  if (!village || village.owner !== player.name) {
    notifyPlayer(player.name, "§cYou don't own this village.");
    return;
  }

  const maxMerchants = Math.floor(village.marketLevel * 1.5 + village.population / 20);
  const merchantList = village.activeMerchants
    .map((m, i) =>
      `Merchant ${i + 1}: ${Object.entries(m.stock).map(([k, v]) => `${k.replace("minecraft:", "")}×${v}`).join(", ")}`
    )
    .join("\n") || "No merchants present.";

  const form = new ActionFormData()
    .title(`${village.name} — Market Lv${village.marketLevel}`)
    .body(
      `§bTreasury: §6${village.treasury}💎§r  |  Merchants: ${village.activeMerchants.length}/${maxMerchants}\n\n${merchantList}\n\n§7Tip: hold food and right-click granary to deposit instantly.\n§7Hold emeralds and right-click treasury to deposit instantly.`
    )
    .button("🌱 Seed Shop")
    .button("🌾 Sell Food (bulk)")
    .button(`⬆ Upgrade Market (${village.marketLevel * 20}💎)`)
    .button("🍞 Buy Food (abstract, 20💎/10)")
    .button("💰 Sell Food (abstract, 10💎/10)")
    .button("Close");

  const response = await form.show(player);
  if (response.canceled) return;

  switch (response.selection) {
    case 0: await showSeedShopMenu(player, village); break;
    case 1: await showFoodSellMenu(player, village); break;
    case 2: upgradeMarket(village); break;
    case 3: buyFood(village, 10); break;
    case 4: sellFood(village, 10); break;
  }
}

async function showSeedShopMenu(
  player: import("@minecraft/server").Player,
  village: VillageData
): Promise<void> {
  const matLine = SEED_PURCHASE_MATERIALS.map((m) => m.label).join(" + ");
  const form = new ActionFormData()
    .title(`${village.name} — Seed Shop`)
    .body(
      `§bBuy seeds for emeralds + farming materials.\n§7Market Lv${village.marketLevel} (needs Lv1+)\n\n§eEach purchase also requires:\n§f${matLine}`
    );

  for (const entry of SEED_SHOP) {
    form.button(`${entry.label} ×${entry.quantityPerPurchase}  [${entry.emeraldCost}💎]`);
  }
  form.button("Back");

  const response = await form.show(player);
  if (response.canceled || response.selection === undefined) return;
  if (response.selection >= SEED_SHOP.length) return;

  buySeedsFromMarket(player, village, SEED_SHOP[response.selection]);
}

async function showFoodSellMenu(
  player: import("@minecraft/server").Player,
  village: VillageData
): Promise<void> {
  const form = new ActionFormData()
    .title(`${village.name} — Sell Food`)
    .body(
      `§bSell food in bulk for emeralds (to your inventory).\n§7Sources: granary first, then player inventory.\n§cMinimum batch required — low rates by design.`
    );

  for (const entry of FOOD_SELL_RATES) {
    const granaryStock = village.granaryItems[entry.itemId] ?? 0;
    const batchVal = entry.itemsPerEmerald;
    form.button(`${entry.label}  [${batchVal} items = 1💎]  Granary: ${granaryStock}`);
  }
  form.button("Back");

  const response = await form.show(player);
  if (response.canceled || response.selection === undefined) return;
  if (response.selection >= FOOD_SELL_RATES.length) return;

  const entry = FOOD_SELL_RATES[response.selection];

  const batchForm = new ModalFormData()
    .title(`Sell ${entry.label}`)
    .slider(`Batches to sell (${entry.itemsPerEmerald} items = 1💎, min ${entry.minBatch} items)`, 1, 10, 1, 1);

  const batchResp = await batchForm.show(player);
  if (batchResp.canceled || batchResp.formValues === undefined) return;

  const batches = batchResp.formValues[0] as number;
  sellFoodBulk(player, village, entry, batches);
}

async function showBlacksmithMenu(
  player: import("@minecraft/server").Player,
  block: import("@minecraft/server").Block
): Promise<void> {
  const village = findVillageAt(block.location);
  if (!village || village.owner !== player.name) {
    notifyPlayer(player.name, "§cYou don't own this village.");
    return;
  }

  const summary = getBlacksmithSummary(village);
  const form = new ActionFormData()
    .title(`${village.name} — Blacksmith`)
    .body(summary)
    .button("Upgrade Weapons\n§7(pay from inventory)")
    .button("Upgrade Armor\n§7(pay from inventory)")
    .button("⚒ Craft for Armory\n§7(pay from village storage)")
    .button("Close");

  const response = await form.show(player);
  if (response.canceled) return;

  switch (response.selection) {
    case 0: upgradeWeapons(player, village.id); break;
    case 1: upgradeArmor(player, village.id); break;
    case 2: await showArmoryCraftMenu(player, village); break;
  }
}

async function showArmoryCraftMenu(
  player: import("@minecraft/server").Player,
  village: VillageData
): Promise<void> {
  const rs = village.resourceStorage;

  const makeCostStr = (r: typeof ARMORY_RECIPES[0]) => {
    const parts: string[] = [];
    if (r.costIron     > 0) parts.push(`${r.costIron} iron`);
    if (r.costGold     > 0) parts.push(`${r.costGold} gold`);
    if (r.costDiamonds > 0) parts.push(`${r.costDiamonds} 💠`);
    if (r.costWood     > 0) parts.push(`${r.costWood} wood`);
    if (r.costStone    > 0) parts.push(`${r.costStone} stone`);
    if (r.costEmeralds > 0) parts.push(`${r.costEmeralds}💎`);
    return parts.join(", ");
  };

  const form = new ActionFormData()
    .title(`${village.name} — Craft for Armory`)
    .body(
      `§7Craft gear from village resource storage.\n` +
      `§7Storage: §fFe:${rs.iron} Au:${rs.gold} 💠:${rs.diamonds} W:${rs.wood} St:${rs.stone}\n` +
      `§7Treasury: §f${village.treasury}💎\n\n` +
      `§7Select an item to craft (×1 batch):`
    );

  for (const recipe of ARMORY_RECIPES) {
    const canCraft = canCraftArmoryRecipe(village, recipe);
    const icon = canCraft ? "§a✔" : "§c✘";
    form.button(`${icon} ${recipe.name}\n§7Cost: ${makeCostStr(recipe)}`);
  }
  form.button("Back");

  const response = await form.show(player);
  if (response.canceled || response.selection === ARMORY_RECIPES.length) return;

  const recipeIdx = response.selection!;
  const recipe = ARMORY_RECIPES[recipeIdx];

  const countForm = new ModalFormData()
    .title(`Craft ${recipe.name}`)
    .slider(`How many batches? (cost ×N)`, 1, 20, 1, 1);

  const countResp = await countForm.show(player);
  if (countResp.canceled || countResp.formValues == null) return;

  const batches = countResp.formValues[0] as number;
  craftForArmory(village, recipeIdx, batches);
}

async function showGranaryStorageMenu(
  player: import("@minecraft/server").Player,
  block: import("@minecraft/server").Block
): Promise<void> {
  const village = findVillageAt(block.location);
  if (!village || village.owner !== player.name) {
    notifyPlayer(player.name, "§cYou don't own this village.");
    return;
  }

  const report = getGranaryReport(village);
  const items = Object.entries(village.granaryItems).filter(([, count]) => count > 0);
  const prod = getFoodProduction(village);
  const cons = getFoodConsumption(village);

  const fieldTotal = getFieldStorageTotal(village);
  const fieldBtn = `🌾 Collect Field Harvest${fieldTotal > 0 ? ` (${fieldTotal} food units ready)` : " (empty)"}`;

  const form = new ActionFormData()
    .title(`${village.name} — Granary`)
    .body(
      `${report}\n\nFarmers: ${village.workers.farmers}  Daily: +${prod}/-${cons}\nShortage: ${village.foodShortageStage}/4`
    );

  const withdrawable: string[] = [];
  for (const [item] of items) {
    form.button(`Withdraw 8x ${item.replace("minecraft:", "")}`);
    withdrawable.push(item);
  }
  const fwLevel = village.fieldWorkerLevel ?? 0;
  const fwBtn = fwLevel >= 5
    ? `🧑‍🌾 Field Workers Lv5 (maxed)`
    : `⬆ Upgrade Field Workers Lv${fwLevel}→${fwLevel + 1} (20💎)`;

  form.button("Deposit Food from Inventory");
  form.button(fieldBtn);
  form.button("📦 View Field Storage");
  form.button(fwBtn);
  form.button("Close");

  const response = await form.show(player);
  if (response.canceled || response.selection === undefined) return;

  if (response.selection < withdrawable.length) {
    withdrawFromGranary(player, village, withdrawable[response.selection], 8);
  } else if (response.selection === withdrawable.length) {
    await showGranaryDepositMenu(player, village);
  } else if (response.selection === withdrawable.length + 1) {
    collectFieldStorage(player, village);
  } else if (response.selection === withdrawable.length + 2) {
    const rpt = getFieldStorageReport(village);
    for (const line of rpt.split("\n")) notifyPlayer(player.name, line);
  } else if (response.selection === withdrawable.length + 3) {
    upgradeFieldWorkers(village);
  }
}

async function showGranaryDepositMenu(
  player: import("@minecraft/server").Player,
  village: VillageData
): Promise<void> {
  const foodItems = Object.keys(FOOD_ITEM_VALUES).filter((k) => (FOOD_ITEM_VALUES[k] ?? 0) > 0);

  const inv = player.getComponent(EntityInventoryComponent.componentId) as EntityInventoryComponent | undefined;
  if (!inv?.container) return;
  const container = inv.container;

  const inventoryCounts: Record<string, number> = {};
  for (let i = 0; i < container.size; i++) {
    const item = container.getItem(i);
    if (!item) continue;
    if (foodItems.includes(item.typeId)) {
      inventoryCounts[item.typeId] = (inventoryCounts[item.typeId] ?? 0) + item.amount;
    }
  }

  const available = foodItems.filter((id) => (inventoryCounts[id] ?? 0) > 0);

  if (available.length === 0) {
    notifyPlayer(player.name, "§cYou have no food in your inventory to deposit.");
    return;
  }

  const form = new ModalFormData().title(`Deposit Food — ${village.name}`);
  for (const id of available) {
    const count = inventoryCounts[id]!;
    const label = id.replace("minecraft:", "");
    form.slider(`${label} (you have ${count})`, 0, count, 1, count);
  }

  const response = await form.show(player);
  if (response.canceled || response.formValues == null) return;

  const values = response.formValues as number[];
  available.forEach((id, i) => {
    const amt = values[i] ?? 0;
    if (amt > 0) depositPlayerItemsToGranary(player, village, id, amt);
  });
}

async function showTreasuryBlockMenu(
  player: import("@minecraft/server").Player,
  block: import("@minecraft/server").Block
): Promise<void> {
  const village = findVillageAt(block.location);
  if (!village || village.owner !== player.name) {
    notifyPlayer(player.name, "§cYou don't own this village.");
    return;
  }

  const report = getTreasuryReport(village);

  const form = new ActionFormData()
    .title(`${village.name} — Treasury`)
    .body(report)
    .button("Deposit 10💎 from inventory")
    .button("Deposit 64💎 from inventory")
    .button("Deposit all emeralds")
    .button("Withdraw 10💎 to inventory")
    .button("Withdraw 64💎 to inventory")
    .button("Close");

  const response = await form.show(player);
  if (response.canceled) return;

  switch (response.selection) {
    case 0: depositEmeralds(player, village.id, 10); break;
    case 1: depositEmeralds(player, village.id, 64); break;
    case 2: depositEmeralds(player, village.id, 9999); break;
    case 3: withdrawEmeralds(player, village.id, 10); break;
    case 4: withdrawEmeralds(player, village.id, 64); break;
  }
}

async function showTreasuryMenu(
  player: import("@minecraft/server").Player,
  villageId: string
): Promise<void> {
  const village = getVillage(villageId);
  if (!village) return;

  const report = getTreasuryReport(village);

  const form = new ActionFormData()
    .title(`${village.name} — Treasury`)
    .body(report)
    .button("Deposit 10💎 from inventory")
    .button("Deposit 64💎 from inventory")
    .button("Deposit all emeralds")
    .button("Withdraw 10💎 to inventory")
    .button("Withdraw 64💎 to inventory")
    .button("Back");

  const response = await form.show(player);
  if (response.canceled) return;

  switch (response.selection) {
    case 0: depositEmeralds(player, villageId, 10); break;
    case 1: depositEmeralds(player, villageId, 64); break;
    case 2: depositEmeralds(player, villageId, 9999); break;
    case 3: withdrawEmeralds(player, villageId, 10); break;
    case 4: withdrawEmeralds(player, villageId, 64); break;
  }
}

async function showKingdomOverview(player: import("@minecraft/server").Player): Promise<void> {
  const kingdom = getKingdomOf(player.name);
  if (!kingdom) {
    notifyPlayer(player.name, "§cYou are not part of a kingdom.");
    return;
  }

  const summary = getKingdomSummary(kingdom.id);
  const form = new ActionFormData()
    .title(kingdom.name)
    .body(summary)
    .button("Diplomacy")
    .button("Close");

  const response = await form.show(player);
  if (response.canceled) return;
  if (response.selection === 0) await showDiplomacyMenu(player);
}

async function showDiplomacyMenu(player: import("@minecraft/server").Player): Promise<void> {
  const myKingdom = getKingdomOf(player.name);
  if (!myKingdom) return;

  const others = getAllKingdoms().filter((k) => k.id !== myKingdom.id);
  if (others.length === 0) {
    notifyPlayer(player.name, "§eNo other kingdoms exist yet.");
    return;
  }

  const form = new ActionFormData()
    .title("Diplomacy")
    .body(`Kingdom: ${myKingdom.name}\nWars: ${myKingdom.wars.length}  Alliances: ${myKingdom.alliances.length}`);

  for (const k of others) {
    const rel = myKingdom.wars.includes(k.id) ? "§c[WAR]" : myKingdom.alliances.includes(k.id) ? "§a[ALLY]" : "§7[NEUTRAL]";
    form.button(`${k.name} ${rel}`);
  }

  const response = await form.show(player);
  if (response.canceled || response.selection === undefined) return;

  const target = others[response.selection];
  await showDiplomacyActions(player, myKingdom, target);
}

async function showDiplomacyActions(
  player: import("@minecraft/server").Player,
  myKingdom: KingdomData,
  target: KingdomData
): Promise<void> {
  const atWar = myKingdom.wars.includes(target.id);
  const allied = myKingdom.alliances.includes(target.id);

  const form = new ActionFormData()
    .title(`Diplomacy — ${target.name}`)
    .body(`King: ${target.king}\nVillages: ${target.villageIds.length}\nRelation: ${atWar ? "§cAt War" : allied ? "§aAllied" : "§7Neutral"}`);

  const actions: Array<() => void> = [];
  if (!atWar) {
    form.button("§cDeclare War");
    actions.push(() => declareWar(myKingdom.id, target.id));
  }
  if (atWar) {
    form.button("§aSue for Peace");
    actions.push(() => makePeace(myKingdom.id, target.id));
  }
  if (!allied && !atWar) {
    form.button("§aPropose Alliance");
    actions.push(() => formAlliance(myKingdom.id, target.id));
  }
  form.button("Cancel");

  const response = await form.show(player);
  if (response.canceled || response.selection === undefined) return;
  if (response.selection < actions.length) actions[response.selection]();
}

async function showReinforcementsMenu(
  player: import("@minecraft/server").Player,
  villageId: string
): Promise<void> {
  const village = getVillage(villageId);
  if (!village) return;

  const kingdom = getKingdomOf(player.name);
  if (!kingdom) return;

  const otherVillages = kingdom.villageIds
    .filter((id) => id !== villageId)
    .flatMap((id) => { const v = getVillage(id); return v ? [v] : []; });

  const inTransit = getInTransitMarches(player.name);
  const inTransitLabel = inTransit.length > 0
    ? `⏳ In-Transit Marches (${inTransit.length} active)`
    : `⏳ In-Transit Marches (none)`;

  const troopLine = (v: VillageData): string => {
    const t = v.troops;
    const hk = t.heavyKnight ?? 0;
    const sa = t.samurai ?? 0;
    const ml = t.mercenaryLancer ?? 0;
    const le = t.legionary ?? 0;
    return `${t.cityGuards + t.spearmen + t.archers + t.cavalry + hk + sa + ml + le} troops`;
  };

  const form = new ActionFormData()
    .title("Reinforcements & Resources")
    .body(
      `§7From: §b${village.name}\n` +
      `§7Treasury: §f${village.treasury}💎  §7Food: §f${village.foodStorage}🌾\n` +
      `§7Troops: §f${troopLine(village)}\n\n` +
      `§7Select destination to send, or view in-transit marches.`
    )
    .button(inTransitLabel);

  for (const v of otherVillages) {
    form.button(`${v.name}\n§7${troopLine(v)}`);
  }

  const response = await form.show(player);
  if (response.canceled || response.selection === undefined) return;

  if (response.selection === 0) {
    await showInTransitMenu(player);
  } else {
    await showSendAmountsForm(player, villageId, otherVillages[response.selection - 1].id);
  }
}

async function showInTransitMenu(player: import("@minecraft/server").Player): Promise<void> {
  const marches = getInTransitMarches(player.name);
  const tick = getCurrentTick();

  if (marches.length === 0) {
    notifyPlayer(player.name, "§7No reinforcements currently in transit.");
    return;
  }

  const form = new ActionFormData()
    .title("⏳ In-Transit Marches")
    .body(
      `§7You have §f${marches.length}§7 active march(es).\n` +
      `§7Click a march to recall it — troops will be instantly refunded.\n`
    );

  for (const { pr, toName } of marches) {
    const troopSummary = Object.entries(pr.troops)
      .filter(([, c]) => (c ?? 0) > 0)
      .map(([t, c]) => `${c}×${t}`)
      .join(", ");
    const ticksLeft = Math.max(0, pr.arriveTick - tick);
    const secsLeft  = Math.ceil(ticksLeft / 20);
    const etaLabel  = secsLeft >= 60
      ? `${Math.floor(secsLeft / 60)}m ${secsLeft % 60}s`
      : `${secsLeft}s`;
    const status    = ticksLeft <= 0 ? "§aArriving…" : `§eETA ~${etaLabel}`;

    form.button(
      `↩ ${pr.sourceVillageName} → ${toName}\n§7${troopSummary}  ${status}`
    );
  }

  form.button("Back");

  const response = await form.show(player);
  if (response.canceled || response.selection === undefined) return;
  if (response.selection === marches.length) return; // Back

  const chosen = marches[response.selection];

  // Confirm before recalling
  const confirm = new MessageFormData()
    .title("↩ Recall March?")
    .body(
      `Recall the march from §b${chosen.pr.sourceVillageName}§r → §b${chosen.toName}§r?\n\n` +
      `§7All troops will be immediately returned to §b${chosen.pr.sourceVillageName}§7.\n` +
      `§7This cannot be undone.`
    )
    .button1("↩ Recall")
    .button2("Cancel");

  const confirmResp = await confirm.show(player);
  if (confirmResp.canceled || confirmResp.selection !== 0) return;

  const success = cancelReinforcement(chosen.pr.id, chosen.toVillageId);
  if (!success) {
    notifyPlayer(player.name, "§cMarch already arrived or could not be recalled.");
  }
}

// FIX: shows all 8 troop types (not just the basic 4), only shows sliders for
// troops the village actually owns to avoid confusing 0-max sliders, and
// correctly clamps values to actual available counts so you can never send more
// than you have even if the slider max rounds up.
async function showSendAmountsForm(
  player: import("@minecraft/server").Player,
  fromId: string,
  toId: string
): Promise<void> {
  const from = getVillage(fromId);
  const to = getVillage(toId);
  if (!from || !to) return;

  type SliderSpec = { key: TroopType | "emeralds" | "food"; label: string; max: number };
  const sliders: SliderSpec[] = [];

  const troopDefs: Array<{ key: TroopType; label: string }> = [
    { key: "cityGuards",      label: "City Guards" },
    { key: "spearmen",        label: "Spearmen" },
    { key: "archers",         label: "Archers" },
    { key: "cavalry",         label: "Cavalry" },
    { key: "heavyKnight",     label: "Heavy Knights" },
    { key: "samurai",         label: "Samurai" },
    { key: "mercenaryLancer", label: "Mercenary Lancers" },
    { key: "legionary",       label: "Legionaries" },
  ];

  for (const { key, label } of troopDefs) {
    const count = from.troops[key] ?? 0;
    if (count > 0) sliders.push({ key, label, max: count });
  }
  if (from.treasury > 0)    sliders.push({ key: "emeralds", label: "Emeralds", max: from.treasury });
  if (from.foodStorage > 0) sliders.push({ key: "food",     label: "Food",     max: from.foodStorage });

  if (sliders.length === 0) {
    notifyPlayer(player.name, `§c§b${from.name}§c has no troops, emeralds, or food to send.`);
    return;
  }

  const form = new ModalFormData().title(`${from.name} → ${to.name}`);
  for (const s of sliders) {
    form.slider(s.label, 0, Math.max(s.max, 1), 1, 0);
  }

  const response = await form.show(player);
  if (response.canceled || !response.formValues) return;

  const values = response.formValues as number[];
  const troops: Partial<TroopData> = {};
  let emeralds = 0;
  let food = 0;

  sliders.forEach((s, i) => {
    const v = Math.min(values[i] ?? 0, s.max);
    if (v <= 0) return;
    if (s.key === "emeralds") { emeralds = v; }
    else if (s.key === "food") { food = v; }
    else { (troops as Record<string, number>)[s.key] = v; }
  });

  if (Object.keys(troops).length > 0) {
    sendReinforcements(fromId, toId, troops);
  }

  if (emeralds > 0 || food > 0) {
    sendTradeCart(fromId, toId, {
      emeralds, food,
      iron: 0, gold: 0, coal: 0, wood: 0, stone: 0, diamonds: 0,
      troops: {},
    });
  }
}

async function showRenameForm(
  player: import("@minecraft/server").Player,
  villageId: string
): Promise<void> {
  const form = new ModalFormData()
    .title("Rename Village")
    .textField("New Name", "Enter new village name...");

  const response = await form.show(player);
  if (response.canceled) return;

  const [newName] = response.formValues as [string];
  if (newName) renameVillage(player.name, villageId, newName);
}

async function showActiveMerchantsMenu(
  player: import("@minecraft/server").Player,
  village: VillageData
): Promise<void> {
  if (village.activeMerchants.length === 0) {
    notifyPlayer(player.name, "§eNo merchants are visiting §b" + village.name + "§e right now.");
    return;
  }

  const form = new ActionFormData()
    .title(`${village.name} — Merchants`)
    .body(`Active merchants: ${village.activeMerchants.length}\nSelect a merchant to trade with:`);

  for (const m of village.activeMerchants) {
    const stockSummary = Object.entries(m.stock)
      .slice(0, 3)
      .map(([k, v]) => `${k.replace("minecraft:", "")}×${v}`)
      .join(", ");
    form.button(`Merchant (${stockSummary})`);
  }
  form.button("Back");

  const response = await form.show(player);
  if (response.canceled || response.selection === undefined) return;
  if (response.selection >= village.activeMerchants.length) return;

  const merchant = village.activeMerchants[response.selection];
  await showMerchantTradeMenu(player, village, merchant, merchant.entityId);
}

async function showMerchantTradeMenu(
  player: import("@minecraft/server").Player,
  village: VillageData,
  merchant: MerchantData,
  entityId: string
): Promise<void> {
  const stockText = Object.entries(merchant.stock)
    .map(([item, count]) => `${item.replace("minecraft:", "")} ×${count}`)
    .join("\n") || "Sold out!";

  const form = new ActionFormData()
    .title("Travelling Merchant")
    .body(`Available:\n${stockText}\n\nVillage Treasury: ${village.treasury}💎`)
    .button("Buy Iron ×8 (8💎)")
    .button("Buy Gold ×4 (12💎)")
    .button("Buy Diamond ×1 (8💎)")
    .button("Buy Bread ×16 (16💎)")
    .button("Close");

  const response = await form.show(player);
  if (response.canceled) return;

  switch (response.selection) {
    case 0: tradeMerchant(village, entityId, "minecraft:iron_ingot", 8); break;
    case 1: tradeMerchant(village, entityId, "minecraft:gold_ingot", 4); break;
    case 2: tradeMerchant(village, entityId, "minecraft:diamond", 1); break;
    case 3: tradeMerchant(village, entityId, "minecraft:bread", 16); break;
  }
}

async function showTradeStationMenu(
  player: import("@minecraft/server").Player,
  block: import("@minecraft/server").Block
): Promise<void> {
  const village = findVillageAt(block.location);
  if (!village) {
    notifyPlayer(player.name, "§cNo village here. Claim a village first.");
    return;
  }

  const isOwner = village.owner === player.name;
  const summary = getTradeStationSummary(village);

  const form = new ActionFormData()
    .title(`${village.name} — Trade Station`)
    .body(summary);

  if (isOwner) {
    form
      .button("📦 Dispatch Resources")
      .button("🗡 Dispatch Reinforcements")
      .button("🚂 Active Shipments")
      .button("📋 Trade History");
  } else {
    form.button("Close");
  }

  const response = await form.show(player);
  if (response.canceled || !isOwner) return;

  switch (response.selection) {
    case 0: await showDispatchResourceMenu(player, village.id); break;
    case 1: await showDispatchMilitaryMenu(player, village.id); break;
    case 2: await showActiveShipmentsMenu(player, village.id); break;
    case 3: await showTradeHistoryMenu(player, village.id); break;
  }
}

async function showMaterialStorageMenu(
  player: import("@minecraft/server").Player,
  block: import("@minecraft/server").Block
): Promise<void> {
  const village = findVillageAt(block.location);
  if (!village) {
    notifyPlayer(player.name, "§cNo village here. Claim a village first.");
    return;
  }

  const isOwner = village.owner === player.name;
  const summary = getMaterialStorageSummary(village);

  const form = new ActionFormData()
    .title(`${village.name} — Material Storage`)
    .body(summary);

  if (isOwner) {
    form
      .button("📤 Withdraw Resources")
      .button("👷 Assign Miners");
  } else {
    form.button("Close");
  }

  const response = await form.show(player);
  if (response.canceled || !isOwner) return;

  switch (response.selection) {
    case 0: await showResourceStorageMenu(player, village.id); break;
    case 1: await showAssignMinersMenu(player, village.id); break;
  }
}

async function showAssignMinersMenu(
  player: import("@minecraft/server").Player,
  villageId: string
): Promise<void> {
  const village = getVillage(villageId);
  if (!village) return;

  const totalWorkers = village.workers.workers;
  const currentMiners = village.workers.miners ?? 0;

  const form = new ModalFormData()
    .title(`${village.name} — Assign Miners`)
    .slider(`Miners (0–${totalWorkers})`, 0, Math.max(1, totalWorkers), 1, currentMiners);

  const response = await form.show(player);
  if (response.canceled || response.formValues === undefined) return;

  const newMiners = response.formValues[0] as number;
  if (newMiners > totalWorkers) {
    notifyPlayer(player.name, `§cNot enough workers! §b${village.name}§c only has ${totalWorkers} workers total.`);
    return;
  }
  village.workers.miners = newMiners;
  saveVillage(village);
  notifyPlayer(
    player.name,
    `§a${newMiners} miner(s) assigned in §b${village.name}§a. They will gather resources every minute into the Material Storage.`
  );
}

async function showDispatchResourceMenu(
  player: import("@minecraft/server").Player,
  fromVillageId: string
): Promise<void> {
  const from = getVillage(fromVillageId);
  if (!from) return;

  ensureResourceStorage(from);
  const rs = from.resourceStorage;
  const connected = getConnectedVillages(from);

  if (connected.length === 0) {
    notifyPlayer(
      player.name,
      `§cNo villages with Trade Stations found. Build Trade Stations in other villages and connect them with rails.`
    );
    return;
  }

  const form = new ActionFormData()
    .title(`${from.name} — Dispatch Resources`)
    .body(
      `§7Select destination village.\n\n§bAvailable:\n§f  Food: ${from.foodStorage}🌾  Treasury: ${from.treasury}💎\n  Iron: ${rs.iron}  Gold: ${rs.gold}  Coal: ${rs.coal}\n  Wood: ${rs.wood}  Stone: ${rs.stone}  Diamonds: ${rs.diamonds}`
    );

  for (const v of connected) {
    const stationIcon = v.hasTradeStation ? "🚉" : "⛔";
    form.button(`${stationIcon} ${v.name} (${v.owner})`);
  }
  form.button("Cancel");

  const response = await form.show(player);
  if (response.canceled || response.selection === undefined) return;
  if (response.selection >= connected.length) return;

  const to = connected[response.selection];
  await showResourceAmountsForm(player, fromVillageId, to.id);
}

async function showResourceAmountsForm(
  player: import("@minecraft/server").Player,
  fromId: string,
  toId: string
): Promise<void> {
  const from = getVillage(fromId);
  const to = getVillage(toId);
  if (!from || !to) return;

  ensureResourceStorage(from);
  const rs = from.resourceStorage;

  const form = new ModalFormData()
    .title(`📦 ${from.name} → ${to.name}`)
    .slider("Food 🌾", 0, Math.max(from.foodStorage, 1), 1, 0)
    .slider("Emeralds 💎", 0, Math.max(from.treasury, 1), 1, 0)
    .slider("Iron", 0, Math.max(rs.iron, 1), 1, 0)
    .slider("Gold", 0, Math.max(rs.gold, 1), 1, 0)
    .slider("Coal", 0, Math.max(rs.coal, 1), 1, 0)
    .slider("Wood", 0, Math.max(rs.wood, 1), 1, 0)
    .slider("Stone", 0, Math.max(rs.stone, 1), 1, 0)
    .slider("Diamonds", 0, Math.max(rs.diamonds, 1), 1, 0);

  const response = await form.show(player);
  if (response.canceled) return;

  const [food, emeralds, iron, gold, coal, wood, stone, diamonds] = response.formValues as number[];

  if (food === 0 && emeralds === 0 && iron === 0 && gold === 0 && coal === 0 && wood === 0 && stone === 0 && diamonds === 0) {
    notifyPlayer(player.name, "§cNo resources selected.");
    return;
  }

  sendRailShipment(fromId, toId, {
    food, emeralds, iron, gold, coal, wood, stone, diamonds, troops: {},
  });
}

async function showDispatchMilitaryMenu(
  player: import("@minecraft/server").Player,
  fromVillageId: string
): Promise<void> {
  const from = getVillage(fromVillageId);
  if (!from) return;

  const connected = getConnectedVillages(from);

  if (connected.length === 0) {
    notifyPlayer(
      player.name,
      `§cNo villages with Trade Stations found. Build Trade Stations and connect with rails.`
    );
    return;
  }

  const t = from.troops;
  const form = new ActionFormData()
    .title(`${from.name} — Dispatch Reinforcements`)
    .body(
      `§7Select destination village.\n\n§bAvailable Troops:\n§f  Guards: ${t.cityGuards}  Spearmen: ${t.spearmen}\n  Archers: ${t.archers}  Cavalry: ${t.cavalry}`
    );

  for (const v of connected) {
    const vt = v.troops;
    const total = vt.cityGuards + vt.spearmen + vt.archers + vt.cavalry;
    form.button(`🚉 ${v.name} (${total} troops)`);
  }
  form.button("Cancel");

  const response = await form.show(player);
  if (response.canceled || response.selection === undefined) return;
  if (response.selection >= connected.length) return;

  const to = connected[response.selection];
  await showMilitaryAmountsForm(player, fromVillageId, to.id);
}

async function showMilitaryAmountsForm(
  player: import("@minecraft/server").Player,
  fromId: string,
  toId: string
): Promise<void> {
  const from = getVillage(fromId);
  const to = getVillage(toId);
  if (!from || !to) return;

  const t = from.troops;
  const hk = t.heavyKnight ?? 0;
  const sa = t.samurai ?? 0;
  const ml = t.mercenaryLancer ?? 0;
  const le = t.legionary ?? 0;
  const form = new ModalFormData()
    .title(`🗡 ${from.name} → ${to.name}`)
    .slider("City Guards", 0, Math.max(t.cityGuards, 1), 1, 0)
    .slider("Spearmen", 0, Math.max(t.spearmen, 1), 1, 0)
    .slider("Archers", 0, Math.max(t.archers, 1), 1, 0)
    .slider("Cavalry", 0, Math.max(t.cavalry, 1), 1, 0)
    .slider("Heavy Knights", 0, Math.max(hk, 1), 1, 0)
    .slider("Samurai", 0, Math.max(sa, 1), 1, 0)
    .slider("Lancers", 0, Math.max(ml, 1), 1, 0)
    .slider("Legionaries", 0, Math.max(le, 1), 1, 0);

  const response = await form.show(player);
  if (response.canceled) return;

  const [guards, spearmen, archers, cavalry, heavyKnight, samurai, mercenaryLancer, legionary] = response.formValues as number[];

  if (guards === 0 && spearmen === 0 && archers === 0 && cavalry === 0 &&
      heavyKnight === 0 && samurai === 0 && mercenaryLancer === 0 && legionary === 0) {
    notifyPlayer(player.name, "§cNo troops selected.");
    return;
  }

  sendRailShipment(fromId, toId, {
    food: 0, emeralds: 0, iron: 0, gold: 0, coal: 0, wood: 0, stone: 0, diamonds: 0,
    troops: { cityGuards: guards, spearmen, archers, cavalry, heavyKnight, samurai, mercenaryLancer, legionary },
  });
}

async function showResourceStorageMenu(
  player: import("@minecraft/server").Player,
  villageId: string
): Promise<void> {
  const village = getVillage(villageId);
  if (!village) return;

  ensureResourceStorage(village);
  const rs = village.resourceStorage;

  const resourceKeys = Object.keys(RESOURCE_LABELS) as Array<keyof ResourceStorage>;
  const storageLines = resourceKeys
    .map((k) => `  ${RESOURCE_LABELS[k]}: ${rs[k]}`)
    .join("\n");

  const form = new ActionFormData()
    .title(`${village.name} — Resource Storage`)
    .body(`§7Railway deliveries are stored here.\n\n§b── Storage ──\n§f${storageLines}\n\n§7Treasury: §6${village.treasury}💎§7  Food: §a${village.foodStorage}🌾`);

  const depositOptions: Array<{ key: keyof ResourceStorage; label: string; amount: number }> = [];
  for (const k of resourceKeys) {
    if (rs[k] > 0) {
      depositOptions.push({ key: k, label: RESOURCE_LABELS[k], amount: rs[k] });
      form.button(`Withdraw ${RESOURCE_LABELS[k]} (${rs[k]})`);
    }
  }
  form.button("Close");

  const response = await form.show(player);
  if (response.canceled || response.selection === undefined) return;
  if (response.selection >= depositOptions.length) return;

  const opt = depositOptions[response.selection];
  const itemId = RESOURCE_DROP_MAP[opt.key];
  if (itemId) {
    dropItemsAtLocation(player.dimension, player.location, itemId, opt.amount);
    notifyPlayer(player.name, `§aWithdrew §f${opt.amount}x ${opt.label}§a from §b${village.name}§a's resource storage.`);
  }
  rs[opt.key] = 0;
  saveVillage(village);
}

async function showActiveShipmentsMenu(
  player: import("@minecraft/server").Player,
  villageId: string
): Promise<void> {
  const village = getVillage(villageId);
  if (!village) return;

  const railCarts = village.activeCarts.filter((c) => c.isRailShipment);

  if (railCarts.length === 0) {
    notifyPlayer(player.name, `§eNo active rail shipments from §b${village.name}§e.`);
    return;
  }

  const lines = railCarts.map((c, i) => {
    const dest = getVillage(c.destinationVillageId);
    const type = c.isMilitary ? "🗡" : "📦";
    const cargo = [
      c.cargo.food > 0 ? `${c.cargo.food}🌾` : "",
      c.cargo.emeralds > 0 ? `${c.cargo.emeralds}💎` : "",
      c.cargo.iron > 0 ? `${c.cargo.iron}Fe` : "",
      c.cargo.gold > 0 ? `${c.cargo.gold}Au` : "",
    ].filter(Boolean).join(" ");
    return `${type} #${i + 1} → ${dest?.name ?? "Unknown"}: ${cargo || "Troops"}`;
  }).join("\n");

  const form = new ActionFormData()
    .title(`${village.name} — Active Shipments`)
    .body(`§b${railCarts.length} rail shipment(s) in transit:\n\n§f${lines}\n\n§7Shipments travel physically. If destroyed, cargo is lost.`)
    .button("Close");

  await form.show(player);
}

async function showTradeHistoryMenu(
  player: import("@minecraft/server").Player,
  villageId: string
): Promise<void> {
  const village = getVillage(villageId);
  if (!village) return;

  const history = village.tradeHistory ?? [];

  if (history.length === 0) {
    const form = new ActionFormData()
      .title(`${village.name} — Trade History`)
      .body("§7No trade deliveries recorded yet.\n\nPush a chest minecart to this trade station to log an arrival.")
      .button("Close");
    await form.show(player);
    return;
  }

  const now = Date.now();
  const lines = history.map((entry, i) => {
    const icon = entry.isManual ? "🚂" : "📦";
    const minsAgo = Math.round((now - entry.timestamp) / 60_000);
    const timeLabel =
      minsAgo < 1
        ? "just now"
        : minsAgo < 60
        ? `${minsAgo}m ago`
        : `${Math.floor(minsAgo / 60)}h ${minsAgo % 60}m ago`;
    const label = i === 0 ? " §a(latest)" : "";
    return `§e${icon} #${i + 1}${label}\n§7From: §f${entry.fromVillageName}\n§7Cargo: §f${entry.summary}\n§8${timeLabel}`;
  });

  const form = new ActionFormData()
    .title(`${village.name} — Trade History`)
    .body(`§bLast ${history.length} arrival(s):\n\n` + lines.join("\n\n"))
    .button("Close");

  await form.show(player);
}
