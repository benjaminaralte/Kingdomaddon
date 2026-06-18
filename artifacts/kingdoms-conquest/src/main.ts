import { world, system } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import type { VillageData, KingdomData, MerchantData, ResourceStorage } from "./types/index.js";
import { RESOURCE_LABELS } from "./types/index.js";
import { getCurrentTick } from "./utils/tick.js";
import { notifyPlayer } from "./utils/notify.js";
import { getAllVillages, getVillage, getAllKingdoms, saveVillage } from "./storage/index.js";
import {
  handleCropBreak,
  isCropBlock,
  CROP_MAX_AGES,
  withdrawFromGranary,
  depositPlayerItemsToGranary,
  getGranaryReport,
  processAllSoldierFood,
} from "./systems/harvest.js";
import { registerCommands } from "./systems/commands.js";
import {
  claimVillage,
  getVillageSummary,
  updateHousingCapacity,
  renameVillage,
} from "./systems/village.js";
import { processAllFood, getFoodProduction, getFoodConsumption, buyFood, sellFood } from "./systems/food.js";
import { processAllWages, recruitTroop, disbandTroop, upgradeBarracks } from "./systems/military.js";
import { processAllPopulation } from "./systems/population.js";
import {
  processAllMarkets,
  tradeMerchant,
  upgradeMarket,
  buySeedsFromMarket,
  sellFoodBulk,
  SEED_SHOP,
  FOOD_SELL_RATES,
} from "./systems/market.js";
import { tickBandits } from "./systems/bandit.js";
import { tickTradeCarts, registerTradePole, removeTradePole, sendTradeCart, sendRailShipment } from "./systems/trade.js";
import { tickWatchtowers } from "./systems/watchtower.js";
import { tickSieges } from "./systems/conquest.js";
import {
  refreshAllGuards,
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
import { upgradeWeapons, upgradeArmor, getBlacksmithSummary } from "./systems/blacksmith.js";
import { sendReinforcements } from "./systems/reinforcements.js";
import {
  registerTradeStation,
  removeTradeStation,
  getConnectedVillages,
  getTradeStationSummary,
  ensureResourceStorage,
} from "./systems/tradeStation.js";
import {
  pickupTroops,
  releaseTroops,
  recallNearbyTroops,
  countTroopTokens,
  TROOP_TOKEN_MAP,
} from "./systems/deployTroops.js";
import type { GuardPoleType } from "./types/index.js";

const CUSTOM_BLOCKS = {
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
};

function findVillageAt(location: { x: number; y: number; z: number }): VillageData | undefined {
  return getAllVillages().find(
    (v) =>
      Math.abs(v.location.x - location.x) < 64 &&
      Math.abs(v.location.z - location.z) < 64
  );
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

  if (typeId === CUSTOM_BLOCKS.TRADE_POLE) {
    const village = findVillageAt(block.location);
    if (!village) {
      notifyPlayer(player.name, "§cNo village territory here. Claim a village first.");
      return;
    }
    if (village.owner !== player.name) {
      notifyPlayer(player.name, "§cThis is not your village.");
      return;
    }
    registerTradePole(village, block.location);
  }

  if (typeId === CUSTOM_BLOCKS.TRADE_STATION) {
    const village = findVillageAt(block.location);
    if (!village) {
      notifyPlayer(player.name, "§cNo village territory here. Claim a village first.");
      return;
    }
    if (village.owner !== player.name) {
      notifyPlayer(player.name, "§cThis is not your village.");
      return;
    }
    if (village.hasTradeStation) {
      notifyPlayer(player.name, `§c§b${village.name}§c already has a Trade Station.`);
      return;
    }
    registerTradeStation(village, block.location);
  }

  if (typeId === CUSTOM_BLOCKS.GRANARY) {
    const village = findVillageAt(block.location);
    if (village && village.owner === player.name) {
      village.granaryLocation = block.location;
      saveVillage(village);
      notifyPlayer(player.name, `§aGranary registered for §b${village.name}§a.`);
    }
  }

  if (typeId === CUSTOM_BLOCKS.TREASURY_BLOCK) {
    const village = findVillageAt(block.location);
    if (village && village.owner === player.name) {
      village.treasuryLocation = block.location;
      saveVillage(village);
      notifyPlayer(player.name, `§aVillage Treasury registered for §b${village.name}§a.`);
    }
  }
});

world.afterEvents.itemUseOn.subscribe((event) => {
  const player = event.source;
  const block = event.block;
  if (!player) return;

  const typeId = block.typeId;
  const heldItem = event.itemStack;

  if (typeId === CUSTOM_BLOCKS.GRANARY && heldItem) {
    const village = findVillageAt(block.location);
    if (village && village.owner === player.name) {
      const foodEntry = FOOD_SELL_RATES.find((e) => e.itemId === heldItem.typeId);
      if (foodEntry) {
        depositPlayerItemsToGranary(player, village, heldItem.typeId, 64);
        return;
      }
    }
  }

  if (typeId === CUSTOM_BLOCKS.TREASURY_BLOCK && heldItem?.typeId === "minecraft:emerald") {
    const village = findVillageAt(block.location);
    if (village && village.owner === player.name) {
      depositEmeralds(player, village.id, heldItem.amount);
      return;
    }
  }

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
  }
});

world.afterEvents.playerBreakBlock.subscribe((event) => {
  const { player } = event;
  if (!player) return;
  const typeId = event.brokenBlockPermutation.type.id;
  const blockLoc = event.block.location;

  if (typeId === CUSTOM_BLOCKS.TOWN_HALL) {
    const village = findVillageAt(blockLoc);
    if (village && village.owner === player.name) {
      notifyPlayer(player.name, `§e§b${village.name}§e Town Hall broken. Rebuild to access menu.`);
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

  if (typeId === CUSTOM_BLOCKS.TRADE_POLE) {
    const village = findVillageAt(blockLoc);
    if (village) {
      const pole = village.tradePoles.find(
        (p) =>
          p.location.x === blockLoc.x &&
          p.location.y === blockLoc.y &&
          p.location.z === blockLoc.z
      );
      if (pole) {
        removeTradePole(village, pole.id);
        notifyPlayer(player.name, `§eTrade pole removed.`);
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

  if (typeId === CUSTOM_BLOCKS.GRANARY) {
    const village = findVillageAt(blockLoc);
    if (village && village.granaryLocation) {
      const loc = village.granaryLocation;
      if (loc.x === blockLoc.x && loc.y === blockLoc.y && loc.z === blockLoc.z) {
        village.granaryLocation = undefined;
        saveVillage(village);
      }
    }
  }

  if (typeId === CUSTOM_BLOCKS.TREASURY_BLOCK) {
    const village = findVillageAt(blockLoc);
    if (village && village.treasuryLocation) {
      const loc = village.treasuryLocation;
      if (loc.x === blockLoc.x && loc.y === blockLoc.y && loc.z === blockLoc.z) {
        village.treasuryLocation = undefined;
        saveVillage(village);
      }
    }
  }
});

system.runInterval(() => {
  const tick = getCurrentTick();
  tickWatchtowers(tick);
  tickTradeCarts(tick);
  tickSieges(tick);
}, 20);

system.runInterval(() => {
  processAllFood();
  processAllWages();
  processAllPopulation();
  processAllMarkets();
  tickBandits();
  processAllSoldierFood();
}, 24000);

system.runInterval(() => {
  refreshAllGuards();
}, 12000);

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

  if (TROOP_TOKEN_MAP[itemId]) {
    system.run(() => {
      releaseTroops(player);
    });
  }
});

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
      .button("Rename Village");
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
  }
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
  const carried = countTroopTokens(player);
  const carriedTotal = carried.cityGuards + carried.spearmen + carried.archers + carried.cavalry;

  const form = new ActionFormData()
    .title(`${village.name} — Barracks Lv${village.barracksLevel}`)
    .body(
      `§7── Stationed ──\n` +
      `Guards: ${t.cityGuards}  Spearmen: ${t.spearmen}\n` +
      `Archers: ${t.archers}  Cavalry: ${t.cavalry}\n\n` +
      `§7── Carried in Inventory ──\n` +
      `Guards: ${carried.cityGuards}  Spearmen: ${carried.spearmen}\n` +
      `Archers: ${carried.archers}  Cavalry: ${carried.cavalry}\n\n` +
      `Treasury: ${village.treasury}💎  Pop: ${village.population}/${village.housingCapacity}`
    )
    .button("Recruit City Guard (5💎)")
    .button("Recruit Spearman (8💎)")
    .button("Recruit Archer (8💎)")
    .button("Recruit Cavalry (12💎)")
    .button("Disband 1 Guard")
    .button("Disband 1 Spearman")
    .button(`Upgrade Barracks (${village.barracksLevel * 15}💎)`)
    .button(`⚔ Pick Up Troops (${t.cityGuards + t.spearmen + t.archers + t.cavalry} available)`)
    .button(carriedTotal > 0 ? `🏹 Return Troops to Barracks (${carriedTotal} carried)` : "🏹 Return Troops (none carried)");

  const response = await form.show(player);
  if (response.canceled) return;

  switch (response.selection) {
    case 0: recruitTroop(village, "cityGuards", 1); break;
    case 1: recruitTroop(village, "spearmen", 1); break;
    case 2: recruitTroop(village, "archers", 1); break;
    case 3: recruitTroop(village, "cavalry", 1); break;
    case 4: disbandTroop(village, "cityGuards", 1); break;
    case 5: disbandTroop(village, "spearmen", 1); break;
    case 6: upgradeBarracks(village); break;
    case 7: await showPickUpTroopsForm(player, village); break;
    case 8: await showReturnTroopsForm(player, village); break;
  }
}

async function showPickUpTroopsForm(
  player: import("@minecraft/server").Player,
  village: VillageData
): Promise<void> {
  const t = village.troops;
  const total = t.cityGuards + t.spearmen + t.archers + t.cavalry;

  if (total === 0) {
    notifyPlayer(player.name, `§cNo troops stationed in §b${village.name}§c to pick up.`);
    return;
  }

  const form = new ModalFormData()
    .title(`⚔ Pick Up Troops — ${village.name}`)
    .slider(`City Guards (${t.cityGuards} available)`, 0, Math.max(t.cityGuards, 1), 1, 0)
    .slider(`Spearmen (${t.spearmen} available)`, 0, Math.max(t.spearmen, 1), 1, 0)
    .slider(`Archers (${t.archers} available)`, 0, Math.max(t.archers, 1), 1, 0)
    .slider(`Cavalry (${t.cavalry} available)`, 0, Math.max(t.cavalry, 1), 1, 0);

  const response = await form.show(player);
  if (response.canceled) return;

  const [guards, spearmen, archers, cavalry] = response.formValues as number[];
  pickupTroops(player, village, { cityGuards: guards, spearmen, archers, cavalry });
}

async function showReturnTroopsForm(
  player: import("@minecraft/server").Player,
  village: VillageData
): Promise<void> {
  const carried = countTroopTokens(player);
  const total = carried.cityGuards + carried.spearmen + carried.archers + carried.cavalry;

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
      `  Cavalry: ${carried.cavalry}\n\n` +
      `§aTotal: ${total} troops`
    )
    .button("Return All Troops")
    .button("Cancel");

  const response = await form.show(player);
  if (response.canceled || response.selection !== 0) return;

  const { EntityInventoryComponent: EIC } = await import("@minecraft/server");
  const inv = player.getComponent(EIC.componentId) as import("@minecraft/server").EntityInventoryComponent | undefined;
  if (!inv?.container) return;
  const container = inv.container;

  for (let i = 0; i < container.size; i++) {
    const slot = container.getItem(i);
    if (!slot) continue;
    const info = TROOP_TOKEN_MAP[slot.typeId];
    if (!info) continue;
    village.troops[info.troopType] += slot.amount;
    container.setItem(i, undefined);
  }

  saveVillage(village);
  notifyPlayer(player.name, `§a${total} troops returned to §b${village.name}§a barracks.`);
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
  const form = new ActionFormData()
    .title(`${village.name} — Seed Shop`)
    .body(
      `§bBuy seeds with emeralds from your inventory.\n§7Market Lv${village.marketLevel} (needs Lv1+)\n\nSeeds help villager farmers auto-replant crops.`
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
    .button("Upgrade Weapons")
    .button("Upgrade Armor")
    .button("Close");

  const response = await form.show(player);
  if (response.canceled) return;

  switch (response.selection) {
    case 0: upgradeWeapons(player, village.id); break;
    case 1: upgradeArmor(player, village.id); break;
  }
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
  form.button("Deposit Food from Inventory");
  form.button("Close");

  const response = await form.show(player);
  if (response.canceled || response.selection === undefined) return;

  if (response.selection < withdrawable.length) {
    withdrawFromGranary(player, village, withdrawable[response.selection], 8);
  } else if (response.selection === withdrawable.length) {
    await showGranaryDepositMenu(player, village);
  }
}

async function showGranaryDepositMenu(
  player: import("@minecraft/server").Player,
  village: VillageData
): Promise<void> {
  const { FOOD_ITEM_VALUES } = await import("./systems/harvest.js");
  const foodItems = Object.keys(FOOD_ITEM_VALUES).filter((k) => (FOOD_ITEM_VALUES[k] ?? 0) > 0);

  const form = new ActionFormData()
    .title(`Deposit Food — ${village.name}`)
    .body("Select a food type to deposit 16 of from your inventory:");

  for (const item of foodItems) {
    form.button(item.replace("minecraft:", ""));
  }
  form.button("Cancel");

  const response = await form.show(player);
  if (response.canceled || response.selection === undefined || response.selection >= foodItems.length) return;

  depositPlayerItemsToGranary(player, village, foodItems[response.selection], 16);
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

  if (otherVillages.length === 0) {
    notifyPlayer(player.name, "§cNo other villages in your kingdom.");
    return;
  }

  const form = new ActionFormData()
    .title("Send Resources / Reinforcements")
    .body(`From: §b${village.name}§r\nTreasury: ${village.treasury}💎  Food: ${village.foodStorage}🌾\nGuards: ${village.troops.cityGuards}  Spearmen: ${village.troops.spearmen}\nArchers: ${village.troops.archers}  Cavalry: ${village.troops.cavalry}\n\nSelect destination:`);

  for (const v of otherVillages) {
    const total = v.troops.cityGuards + v.troops.spearmen + v.troops.archers + v.troops.cavalry;
    form.button(`${v.name} (${total} troops)`);
  }

  const response = await form.show(player);
  if (response.canceled || response.selection === undefined) return;

  await showSendAmountsForm(player, villageId, otherVillages[response.selection].id);
}

async function showSendAmountsForm(
  player: import("@minecraft/server").Player,
  fromId: string,
  toId: string
): Promise<void> {
  const from = getVillage(fromId);
  const to = getVillage(toId);
  if (!from || !to) return;

  const form = new ModalFormData()
    .title(`${from.name} → ${to.name}`)
    .slider("City Guards", 0, Math.max(from.troops.cityGuards, 1), 1, 0)
    .slider("Spearmen", 0, Math.max(from.troops.spearmen, 1), 1, 0)
    .slider("Archers", 0, Math.max(from.troops.archers, 1), 1, 0)
    .slider("Cavalry", 0, Math.max(from.troops.cavalry, 1), 1, 0)
    .slider("Emeralds", 0, Math.max(from.treasury, 1), 1, 0)
    .slider("Food", 0, Math.max(from.foodStorage, 1), 1, 0);

  const response = await form.show(player);
  if (response.canceled) return;

  const [guards, spearmen, archers, cavalry, emeralds, food] = response.formValues as number[];

  if (guards > 0 || spearmen > 0 || archers > 0 || cavalry > 0) {
    sendReinforcements(fromId, toId, { cityGuards: guards, spearmen, archers, cavalry });
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
      .button("📊 Resource Storage")
      .button("🚂 Active Shipments");
  } else {
    form.button("Close");
  }

  const response = await form.show(player);
  if (response.canceled || !isOwner) return;

  switch (response.selection) {
    case 0: await showDispatchResourceMenu(player, village.id); break;
    case 1: await showDispatchMilitaryMenu(player, village.id); break;
    case 2: await showResourceStorageMenu(player, village.id); break;
    case 3: await showActiveShipmentsMenu(player, village.id); break;
  }
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
  const form = new ModalFormData()
    .title(`🗡 ${from.name} → ${to.name}`)
    .slider("City Guards", 0, Math.max(t.cityGuards, 1), 1, 0)
    .slider("Spearmen", 0, Math.max(t.spearmen, 1), 1, 0)
    .slider("Archers", 0, Math.max(t.archers, 1), 1, 0)
    .slider("Cavalry", 0, Math.max(t.cavalry, 1), 1, 0);

  const response = await form.show(player);
  if (response.canceled) return;

  const [guards, spearmen, archers, cavalry] = response.formValues as number[];

  if (guards === 0 && spearmen === 0 && archers === 0 && cavalry === 0) {
    notifyPlayer(player.name, "§cNo troops selected.");
    return;
  }

  sendRailShipment(fromId, toId, {
    food: 0, emeralds: 0, iron: 0, gold: 0, coal: 0, wood: 0, stone: 0, diamonds: 0,
    troops: { cityGuards: guards, spearmen, archers, cavalry },
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
  notifyPlayer(player.name, `§aWithdrew ${opt.amount} ${opt.label} from storage. (Note: use /give for actual items)`);
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
