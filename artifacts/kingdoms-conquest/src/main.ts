import { world, system } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import type { VillageData, KingdomData, MerchantData } from "./types/index.js";
import { getCurrentTick } from "./utils/tick.js";
import { notifyPlayer } from "./utils/notify.js";
import { getAllVillages, getVillage, getAllKingdoms } from "./storage/index.js";
import {
  claimVillage,
  getVillageSummary,
  updateHousingCapacity,
  renameVillage,
} from "./systems/village.js";
import { processAllFood, getFoodProduction, getFoodConsumption, buyFood, sellFood } from "./systems/food.js";
import { processAllWages, recruitTroop, disbandTroop, upgradeBarracks } from "./systems/military.js";
import { processAllPopulation } from "./systems/population.js";
import { processAllMarkets, tradeMerchant, upgradeMarket } from "./systems/market.js";
import { tickBandits } from "./systems/bandit.js";
import { tickTradeCarts, registerTradePole, removeTradePole, sendTradeCart } from "./systems/trade.js";
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
import type { GuardPoleType } from "./types/index.js";

const CUSTOM_BLOCKS = {
  TOWN_HALL: "kingdoms:town_hall",
  GUARD_POLE_VILLAGE: "kingdoms:guard_pole_village",
  GUARD_POLE_GATE: "kingdoms:guard_pole_gate",
  GUARD_POLE_ROAD: "kingdoms:guard_pole_road",
  GUARD_POLE_WATCHTOWER: "kingdoms:guard_pole_watchtower",
  TRADE_POLE: "kingdoms:trade_pole",
  BARRACKS: "kingdoms:barracks",
  MARKET: "kingdoms:market",
  GRANARY: "kingdoms:granary",
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
});

world.afterEvents.itemUseOn.subscribe((event) => {
  const player = event.source;
  const block = event.block;
  if (!player) return;

  const typeId = block.typeId;

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
      void showGranaryMenu(player, block);
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
}, 24000);

system.runInterval(() => {
  refreshAllGuards();
}, 12000);

system.runInterval(() => {
  for (const village of getAllVillages()) {
    updateHousingCapacity(village.id);
  }
}, 72000);

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
  const form = new ActionFormData()
    .title(`${village.name} — Barracks Lv${village.barracksLevel}`)
    .body(
      `Guards: ${t.cityGuards}  Spearmen: ${t.spearmen}\nArchers: ${t.archers}  Cavalry: ${t.cavalry}\n\nTreasury: ${village.treasury}💎  Pop: ${village.population}/${village.housingCapacity}`
    )
    .button("Recruit City Guard (5💎)")
    .button("Recruit Spearman (8💎)")
    .button("Recruit Archer (8💎)")
    .button("Recruit Cavalry (12💎)")
    .button("Disband 1 Guard")
    .button("Disband 1 Spearman")
    .button(`Upgrade Barracks (${village.barracksLevel * 15}💎)`);

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
  }
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
    .body(`Active: ${village.activeMerchants.length}/${maxMerchants} merchants\n${merchantList}\n\nTreasury: ${village.treasury}💎`)
    .button("Buy 10 Food (20💎)")
    .button("Sell 10 Food (10💎)")
    .button(`Upgrade Market (${village.marketLevel * 20}💎)`)
    .button("Close");

  const response = await form.show(player);
  if (response.canceled) return;

  switch (response.selection) {
    case 0: buyFood(village, 10); break;
    case 1: sellFood(village, 10); break;
    case 2: upgradeMarket(village); break;
  }
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

async function showGranaryMenu(
  player: import("@minecraft/server").Player,
  block: import("@minecraft/server").Block
): Promise<void> {
  const village = findVillageAt(block.location);
  if (!village || village.owner !== player.name) {
    notifyPlayer(player.name, "§cYou don't own this village.");
    return;
  }

  const prod = getFoodProduction(village);
  const cons = getFoodConsumption(village);

  const form = new ActionFormData()
    .title(`${village.name} — Granary`)
    .body(
      `Food Storage: ${village.foodStorage}🌾\nDaily Production: +${prod}\nDaily Consumption: -${cons}\nNet per day: ${prod >= cons ? "+" : ""}${prod - cons}\n\nFarmers: ${village.workers.farmers}\nShortage Stage: ${village.foodShortageStage}/4`
    )
    .button("Close");

  await form.show(player);
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
    .button("Deposit 10💎")
    .button("Deposit 64💎")
    .button("Withdraw 10💎")
    .button("Withdraw 64💎")
    .button("Back");

  const response = await form.show(player);
  if (response.canceled) return;

  switch (response.selection) {
    case 0: depositEmeralds(player, villageId, 10); break;
    case 1: depositEmeralds(player, villageId, 64); break;
    case 2: withdrawEmeralds(player, villageId, 10); break;
    case 3: withdrawEmeralds(player, villageId, 64); break;
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
    sendTradeCart(fromId, toId, { emeralds, food, troops: {} });
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
