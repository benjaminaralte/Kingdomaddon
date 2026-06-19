import { system, Player } from "@minecraft/server";
import type { VillageData } from "../types/index.js";
import { getAllVillages, getAllKingdoms, getKingdom, saveVillage } from "../storage/index.js";
import { getVillageSummary } from "./village.js";
import { getKingdomSummary, getKingdomOf, declareWar, makePeace, formAlliance, getKingdomStrength, areAtWar } from "./kingdom.js";
import { recruitTroop, disbandTroop, upgradeBarracks, getTotalTroops } from "./military.js";
import { isSiegeActive, getActiveSiege, initiateSiege } from "./conquest.js";
import { getGranaryFoodUnits, getGranaryReport, collectFieldStorage } from "./harvest.js";
import { getTreasuryReport } from "./treasury.js";
import { getBlacksmithSummary } from "./blacksmith.js";
import { notifyPlayer } from "../utils/notify.js";
import { getActiveBorderIntrusions, isSiegeEligible } from "./border.js";
import { toggleAlerts, getPlayerSettings } from "./playerSettings.js";
import type { TroopType } from "../types/index.js";

const TROOP_TYPES: TroopType[] = ["cityGuards", "spearmen", "archers", "cavalry"];

export function registerCommands(): void {
  system.afterEvents.scriptEventReceive.subscribe(
    (event) => {
      const player = event.sourceEntity as Player | undefined;
      if (!player || typeof player.name !== "string") return;

      const subcommand = event.id.replace("kc:", "");
      const args = event.message.trim().split(/\s+/).filter(Boolean);

      handleKcCommand(player, subcommand, args);
    },
    { namespaces: ["kc"] }
  );
}

function handleKcCommand(player: Player, subcommand: string, args: string[]): void {
  switch (subcommand) {
    case "help":
      showHelp(player);
      break;
    case "status":
    case "s":
      showMyStatus(player);
      break;
    case "kingdom":
    case "k":
      showKingdomStatus(player);
      break;
    case "villages":
    case "v":
      showVillageList(player);
      break;
    case "village":
      showVillageDetail(player, args[0]);
      break;
    case "granary":
    case "g":
      showGranaryStatus(player, args[0]);
      break;
    case "treasury":
    case "t":
      showTreasuryStatus(player, args[0]);
      break;
    case "recruit":
      cmdRecruit(player, args);
      break;
    case "disband":
      cmdDisband(player, args);
      break;
    case "barracks":
      cmdUpgradeBarracks(player, args[0]);
      break;
    case "workers":
      cmdSetWorkers(player, args);
      break;
    case "war":
      cmdWar(player, args[0]);
      break;
    case "peace":
      cmdPeace(player, args[0]);
      break;
    case "ally":
      cmdAlly(player, args[0]);
      break;
    case "kingdoms":
      cmdListKingdoms(player);
      break;
    case "blacksmith":
    case "bs":
      cmdBlacksmith(player, args[0]);
      break;
    case "map":
    case "m":
      showMap(player);
      break;
    case "siege":
      cmdSiege(player, args[0]);
      break;
    case "border":
    case "b":
      showBorderStatus(player);
      break;
    case "intel":
      cmdIntel(player, args[0]);
      break;
    case "alerts":
      cmdToggleAlerts(player);
      break;
    case "collect":
      cmdCollect(player, args[0]);
      break;
    case "tutorial":
    case "guide":
      cmdTutorial(player, args[0]);
      break;
    default:
      notifyPlayer(player.name, `§cUnknown /kc command: "${subcommand}". Use /scriptevent kc:help`);
  }
}

function showHelp(player: Player): void {
  const lines = [
    "§b=== Kingdoms & Conquest Commands ===§r",
    "§e/scriptevent kc:help§r — this list",
    "§e/scriptevent kc:tutorial§r — §aIN-GAME TUTORIAL (start here!)§r",
    "§e/scriptevent kc:status§r — your villages & kingdom",
    "§e/scriptevent kc:kingdom§r — full kingdom overview",
    "§e/scriptevent kc:villages§r — list all your villages",
    "§e/scriptevent kc:village <id>§r — village detail",
    "§e/scriptevent kc:granary <id>§r — granary contents",
    "§e/scriptevent kc:treasury <id>§r — treasury balance",
    "§e/scriptevent kc:recruit <id> <type> <n>§r — hire troops",
    "§e/scriptevent kc:disband <id> <type> <n>§r — release troops",
    "§e/scriptevent kc:barracks <id>§r — upgrade barracks",
    "§e/scriptevent kc:workers <id> f:<n> w:<n>§r — set farmers/workers",
    "§e/scriptevent kc:war <kingdomName>§r — declare war",
    "§e/scriptevent kc:peace <kingdomName>§r — sue for peace",
    "§e/scriptevent kc:ally <kingdomName>§r — propose alliance",
    "§e/scriptevent kc:kingdoms§r — list all kingdoms",
    "§e/scriptevent kc:blacksmith <id>§r — smithy summary",
    "§e/scriptevent kc:map§r — strategic overview of all villages",
    "§e/scriptevent kc:siege <villageName>§r — begin siege (must be border-eligible)",
    "§e/scriptevent kc:border§r — see border intrusion status",
    "§e/scriptevent kc:intel <kingdomName>§r — scout an enemy kingdom",
    "§e/scriptevent kc:alerts§r — toggle incoming-attack alerts on/off",
    "§e/scriptevent kc:collect <id>§r — collect NPC-harvested crops to your inventory",
    "§7Troop types: cityGuards, spearmen, archers, cavalry",
  ];
  for (const line of lines) notifyPlayer(player.name, line);
}

function showMyStatus(player: Player): void {
  const myVillages = getAllVillages().filter((v) => v.owner === player.name);
  if (myVillages.length === 0) {
    notifyPlayer(player.name, "§eYou don't own any villages yet. Place a Town Hall block to claim one.");
    return;
  }
  const kingdom = getKingdomOf(player.name);
  notifyPlayer(player.name, `§b=== ${kingdom?.name ?? "No Kingdom"} ===`);
  for (const v of myVillages) {
    const troops = getTotalTroops(v);
    const food = getGranaryFoodUnits(v) + v.foodStorage;
    notifyPlayer(
      player.name,
      `§a${v.name}§r [${v.id.slice(0, 6)}] | Pop:${v.population} | 💎${v.treasury} | 🌾${food} | ⚔${troops}`
    );
  }
}

function showKingdomStatus(player: Player): void {
  const kingdom = getKingdomOf(player.name);
  if (!kingdom) {
    notifyPlayer(player.name, "§cYou are not in any kingdom.");
    return;
  }
  const summary = getKingdomSummary(kingdom.id);
  for (const line of summary.split("\n")) notifyPlayer(player.name, line);
}

function showVillageList(player: Player): void {
  const myVillages = getAllVillages().filter((v) => v.owner === player.name);
  if (myVillages.length === 0) {
    notifyPlayer(player.name, "§eNo villages owned.");
    return;
  }
  notifyPlayer(player.name, "§b=== Your Villages ===");
  for (const v of myVillages) {
    notifyPlayer(player.name, `§a${v.name}§r  id: §e${v.id.slice(0, 8)}`);
  }
}

function showVillageDetail(player: Player, idPrefix: string | undefined): void {
  const village = resolveVillage(player, idPrefix);
  if (!village) return;
  const summary = getVillageSummary(village);
  for (const line of summary.split("\n")) notifyPlayer(player.name, line);
}

function showGranaryStatus(player: Player, idPrefix: string | undefined): void {
  const village = resolveVillage(player, idPrefix);
  if (!village) return;
  const report = getGranaryReport(village);
  for (const line of report.split("\n")) notifyPlayer(player.name, line);
}

function showTreasuryStatus(player: Player, idPrefix: string | undefined): void {
  const village = resolveVillage(player, idPrefix);
  if (!village) return;
  const report = getTreasuryReport(village);
  for (const line of report.split("\n")) notifyPlayer(player.name, line);
}

function cmdRecruit(player: Player, args: string[]): void {
  const village = resolveVillage(player, args[0]);
  if (!village) return;
  const type = args[1] as TroopType;
  if (!TROOP_TYPES.includes(type)) {
    notifyPlayer(player.name, `§cInvalid troop type. Use: ${TROOP_TYPES.join(", ")}`);
    return;
  }
  const count = parseInt(args[2] ?? "1", 10);
  if (isNaN(count) || count < 1) {
    notifyPlayer(player.name, "§cCount must be a positive number.");
    return;
  }
  recruitTroop(village, type, count);
}

function cmdDisband(player: Player, args: string[]): void {
  const village = resolveVillage(player, args[0]);
  if (!village) return;
  const type = args[1] as TroopType;
  if (!TROOP_TYPES.includes(type)) {
    notifyPlayer(player.name, `§cInvalid troop type. Use: ${TROOP_TYPES.join(", ")}`);
    return;
  }
  const count = parseInt(args[2] ?? "1", 10);
  if (isNaN(count) || count < 1) {
    notifyPlayer(player.name, "§cCount must be a positive number.");
    return;
  }
  disbandTroop(village, type, count);
}

function cmdUpgradeBarracks(player: Player, idPrefix: string | undefined): void {
  const village = resolveVillage(player, idPrefix);
  if (!village) return;
  upgradeBarracks(village);
}

function cmdSetWorkers(player: Player, args: string[]): void {
  const village = resolveVillage(player, args[0]);
  if (!village) return;

  let farmers = village.workers.farmers;
  let workers = village.workers.workers;

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("f:")) farmers = parseInt(arg.slice(2), 10);
    else if (arg.startsWith("w:")) workers = parseInt(arg.slice(2), 10);
  }

  if (isNaN(farmers) || isNaN(workers) || farmers < 0 || workers < 0) {
    notifyPlayer(player.name, "§cUsage: /scriptevent kc:workers <id> f:<n> w:<n>");
    return;
  }

  const available = village.population - village.troops.cityGuards - village.troops.spearmen - village.troops.archers - village.troops.cavalry;
  if (farmers + workers > available) {
    notifyPlayer(player.name, `§cNot enough available workers (${available} free).`);
    return;
  }

  village.workers.farmers = farmers;
  village.workers.workers = workers;

  saveVillage(village);
  notifyPlayer(player.name, `§aWorkers set in §b${village.name}§a: ${farmers} farmers, ${workers} workers.`);
}

function cmdWar(player: Player, kingdomName: string | undefined): void {
  if (!kingdomName) {
    notifyPlayer(player.name, "§cUsage: /scriptevent kc:war <kingdomName>");
    return;
  }
  const myKingdom = getKingdomOf(player.name);
  if (!myKingdom) return;
  const target = getAllKingdoms().find((k) => k.name.toLowerCase() === kingdomName.toLowerCase());
  if (!target) {
    notifyPlayer(player.name, `§cKingdom "${kingdomName}" not found.`);
    return;
  }
  declareWar(myKingdom.id, target.id);
}

function cmdPeace(player: Player, kingdomName: string | undefined): void {
  if (!kingdomName) {
    notifyPlayer(player.name, "§cUsage: /scriptevent kc:peace <kingdomName>");
    return;
  }
  const myKingdom = getKingdomOf(player.name);
  if (!myKingdom) return;
  const target = getAllKingdoms().find((k) => k.name.toLowerCase() === kingdomName.toLowerCase());
  if (!target) {
    notifyPlayer(player.name, `§cKingdom "${kingdomName}" not found.`);
    return;
  }
  makePeace(myKingdom.id, target.id);
}

function cmdAlly(player: Player, kingdomName: string | undefined): void {
  if (!kingdomName) {
    notifyPlayer(player.name, "§cUsage: /scriptevent kc:ally <kingdomName>");
    return;
  }
  const myKingdom = getKingdomOf(player.name);
  if (!myKingdom) return;
  const target = getAllKingdoms().find((k) => k.name.toLowerCase() === kingdomName.toLowerCase());
  if (!target) {
    notifyPlayer(player.name, `§cKingdom "${kingdomName}" not found.`);
    return;
  }
  formAlliance(myKingdom.id, target.id);
}

function cmdListKingdoms(player: Player): void {
  const kingdoms = getAllKingdoms();
  if (kingdoms.length === 0) {
    notifyPlayer(player.name, "§eNo kingdoms exist yet.");
    return;
  }
  notifyPlayer(player.name, "§b=== All Kingdoms ===");
  for (const k of kingdoms) {
    notifyPlayer(player.name, `§a${k.name}§r  King: §e${k.king}§r  Villages: ${k.villageIds.length}`);
  }
}

function cmdBlacksmith(player: Player, idPrefix: string | undefined): void {
  const village = resolveVillage(player, idPrefix);
  if (!village) return;
  const summary = getBlacksmithSummary(village);
  for (const line of summary.split("\n")) notifyPlayer(player.name, line);
}

function showMap(player: Player): void {
  const myVillages = getAllVillages().filter((v) => v.owner === player.name);
  const kingdom = getKingdomOf(player.name);

  if (myVillages.length === 0) {
    notifyPlayer(player.name, "§eYou don't own any villages yet.");
    return;
  }

  notifyPlayer(player.name, `§b═══ ${kingdom?.name ?? "No Kingdom"} — Strategic Map ═══`);

  for (const v of myVillages) {
    const troops = v.troops.cityGuards + v.troops.spearmen + v.troops.archers + v.troops.cavalry;
    const training = (v.trainingQueue?.length ?? 0);
    const siegeFlag = isSiegeActive(v.id) ? " §c⚔ UNDER SIEGE§r" : "";
    const trainingTag = training > 0 ? ` §e🪖+${training}§r` : "";
    const merchants = v.activeMerchants.length;

    notifyPlayer(player.name,
      `§a${v.name}§r${siegeFlag}`
    );
    notifyPlayer(player.name,
      `  💎${v.treasury}  ⚔${troops}${trainingTag}  👥${v.population}  🧭${merchants} merchants`
    );
    notifyPlayer(player.name,
      `  §7${Math.round(v.townHallLocation.x)},${Math.round(v.townHallLocation.y)},${Math.round(v.townHallLocation.z)}  Iron:${v.resourceStorage.iron} Gold:${v.resourceStorage.gold}`
    );
  }

  const conductingSieges = getAllVillages()
    .filter((v) => v.owner !== player.name)
    .map((v) => ({ v, siege: getActiveSiege(v.id) }))
    .filter(({ siege }) => siege?.attackerName === player.name);

  if (conductingSieges.length > 0) {
    notifyPlayer(player.name, `§c⚔ Your Active Sieges:`);
    for (const { v, siege } of conductingSieges) {
      const pct = Math.floor(((siege!.progress) / 600) * 100);
      notifyPlayer(player.name, `  §c${v.name}§r (${v.owner}) — §6${pct}% captured`);
    }
  }

  if (kingdom?.wars && kingdom.wars.length > 0) {
    const warNames = kingdom.wars.map((id) => getKingdom(id)?.name ?? id).join(", ");
    notifyPlayer(player.name, `§c🏴 At war with: §f${warNames}`);
  }
  if (kingdom?.alliances && kingdom.alliances.length > 0) {
    const allyNames = kingdom.alliances.map((id) => getKingdom(id)?.name ?? id).join(", ");
    notifyPlayer(player.name, `§a🤝 Allied with: §f${allyNames}`);
  }
}

function cmdSiege(player: Player, villageNameOrId: string | undefined): void {
  if (!villageNameOrId) {
    notifyPlayer(player.name, "§cUsage: /scriptevent kc:siege <villageName or id>");
    return;
  }

  const myKingdom = getKingdomOf(player.name);
  if (!myKingdom) {
    notifyPlayer(player.name, "§cYou must be in a kingdom to siege.");
    return;
  }

  // Find any enemy village matching the name/id (not owned by player)
  const allVillages = getAllVillages();
  const target = allVillages.find(
    (v) =>
      v.owner !== player.name &&
      (v.name.toLowerCase().startsWith(villageNameOrId.toLowerCase()) ||
        v.id.startsWith(villageNameOrId))
  );

  if (!target) {
    notifyPlayer(player.name, `§cNo enemy village found matching "${villageNameOrId}".`);
    return;
  }

  if (!areAtWar(myKingdom.id, target.kingdomId)) {
    notifyPlayer(player.name, `§cYou are not at war with §b${target.name}§c's kingdom.`);
    return;
  }

  initiateSiege(player, target.id);
}

function showBorderStatus(player: Player): void {
  const intrusions = getActiveBorderIntrusions().filter(
    (i) => i.playerName === player.name
  );

  if (intrusions.length === 0) {
    notifyPlayer(player.name, "§7You are not inside any enemy borders.");
    return;
  }

  notifyPlayer(player.name, "§b=== Border Status ===");
  for (const intrusion of intrusions) {
    const village = getAllVillages().find((v) => v.id === intrusion.villageId);
    const name = village?.name ?? intrusion.villageId;
    const eligible = isSiegeEligible(player.name, intrusion.villageId);
    if (eligible) {
      notifyPlayer(player.name, `§a⚔ §b${name}§a — SIEGE ELIGIBLE. Use /scriptevent kc:siege ${name}`);
    } else {
      notifyPlayer(player.name, `§e⏳ §b${name}§e — Countdown in progress. Remain inside to unlock siege.`);
    }
  }

  // Also show if anyone is inside the player's own borders
  const myVillageIds = new Set(
    getAllVillages().filter((v) => v.owner === player.name).map((v) => v.id)
  );
  const incomingIntrusions = getActiveBorderIntrusions().filter(
    (i) => i.playerName !== player.name && myVillageIds.has(i.villageId)
  );

  if (incomingIntrusions.length > 0) {
    notifyPlayer(player.name, "§c=== Enemy Intrusions Into Your Borders ===");
    for (const intrusion of incomingIntrusions) {
      const village = getAllVillages().find((v) => v.id === intrusion.villageId);
      const eligible = isSiegeEligible(intrusion.playerName, intrusion.villageId);
      const status = eligible ? "§4SIEGE ELIGIBLE" : "§e counting down";
      notifyPlayer(
        player.name,
        `§c${intrusion.playerName}§r in §b${village?.name ?? "a village"}§r — ${status}`
      );
    }
  }
}

function cmdIntel(player: Player, kingdomName: string | undefined): void {
  if (!kingdomName) {
    notifyPlayer(player.name, "§cUsage: /scriptevent kc:intel <kingdomName>");
    return;
  }

  const target = getAllKingdoms().find(
    (k) => k.name.toLowerCase() === kingdomName.toLowerCase()
  );
  if (!target) {
    notifyPlayer(player.name, `§cKingdom "${kingdomName}" not found.`);
    return;
  }

  const myKingdom = getKingdomOf(player.name);
  const atWar = myKingdom ? areAtWar(myKingdom.id, target.id) : false;
  const strength = getKingdomStrength(target.id);
  const totalVillages = target.villageIds.length;
  const allVillages = getAllVillages();

  let totalPop = 0;
  let totalFood = 0;
  const villageNames: string[] = [];
  for (const vid of target.villageIds) {
    const v = allVillages.find((vv) => vv.id === vid);
    if (!v) continue;
    totalPop += v.population;
    totalFood += v.foodStorage;
    villageNames.push(v.name);
  }

  notifyPlayer(player.name, `§b=== Intel: ${target.name} ===`);
  notifyPlayer(player.name, `§7King: §f${target.king}  §7Villages: §f${totalVillages}`);
  notifyPlayer(player.name, `§7Population: §f${totalPop}  §7Food reserve: §f${totalFood}`);
  notifyPlayer(player.name, `§7Military strength: §c${strength}`);
  notifyPlayer(player.name, `§7Territories: §f${villageNames.join(", ") || "none"}`);
  notifyPlayer(player.name, atWar ? `§4⚔ You are AT WAR with this kingdom.` : `§aNot currently at war.`);
  notifyPlayer(player.name, `§7Allies: §f${target.alliances.length}  §7Wars: §f${target.wars.length}`);
}

function cmdToggleAlerts(player: Player): void {
  const enabled = toggleAlerts(player.name);
  if (enabled) {
    notifyPlayer(player.name, `§a🔔 Incoming-attack alerts §lENABLED§r§a. You will be notified of raids, border intrusions, and siege events.`);
  } else {
    notifyPlayer(player.name, `§7🔕 Incoming-attack alerts §lDISABLED§r§7. You will not receive threat notifications until you run /kc:alerts again.`);
  }
}

function cmdCollect(player: Player, idPrefix: string | undefined): void {
  const village = resolveVillage(player, idPrefix);
  if (!village) return;
  const { alertsEnabled } = getPlayerSettings(player.name);
  collectFieldStorage(player, village);
  if (!alertsEnabled) {
    notifyPlayer(player.name, `§7Tip: alerts are currently OFF. Use §f/scriptevent kc:alerts§7 to re-enable.`);
  }
}

// ── Tutorial System ───────────────────────────────────────────────────────────

function cmdTutorial(player: Player, topic: string | undefined): void {
  const send = (msg: string) => notifyPlayer(player.name, msg);

  const TOPICS: Record<string, string> = {
    start:    "Getting Started",
    claim:    "Getting Started",
    recruit:  "Recruiting Troops",
    troops:   "Recruiting Troops",
    upgrade:  "Upgrades",
    upgrades: "Upgrades",
    farm:     "Farming & Granary",
    granary:  "Farming & Granary",
    siege:    "Siege & Conquest",
    occupy:   "Siege & Conquest",
    trade:    "Trade Stations",
    rail:     "Trade Stations",
    diplo:    "Diplomacy",
    war:      "Diplomacy",
  };

  if (!topic) {
    send("§b╔══════ Kingdoms & Conquest — Tutorial ══════╗");
    send("§b║  §eRun a topic command to see the guide:§b      ║");
    send("§b║  §f/scriptevent kc:tutorial start§b             ║");
    send("§b║  §f/scriptevent kc:tutorial recruit§b           ║");
    send("§b║  §f/scriptevent kc:tutorial upgrade§b           ║");
    send("§b║  §f/scriptevent kc:tutorial farm§b              ║");
    send("§b║  §f/scriptevent kc:tutorial siege§b             ║");
    send("§b║  §f/scriptevent kc:tutorial trade§b             ║");
    send("§b║  §f/scriptevent kc:tutorial diplo§b             ║");
    send("§b╚════════════════════════════════════════════╝");
    return;
  }

  const resolvedName = TOPICS[topic.toLowerCase()];
  if (!resolvedName) {
    send(`§cUnknown tutorial topic: "${topic}". Run /scriptevent kc:tutorial to see topics.`);
    return;
  }

  switch (resolvedName) {
    case "Getting Started":     tutorialStart(player); break;
    case "Recruiting Troops":   tutorialRecruit(player); break;
    case "Upgrades":            tutorialUpgrades(player); break;
    case "Farming & Granary":   tutorialFarm(player); break;
    case "Siege & Conquest":    tutorialSiege(player); break;
    case "Trade Stations":      tutorialTrade(player); break;
    case "Diplomacy":           tutorialDiplo(player); break;
  }
}

function tutorialStart(player: Player): void {
  const s = (m: string) => notifyPlayer(player.name, m);
  s("§b════════ Tutorial: Getting Started ════════");
  s("§e Step 1 — Claim Your Village");
  s("§f  • Craft/obtain a §bkingdoms:town_hall§f block.");
  s("§f  • Place it anywhere in the world.");
  s("§f  • A form appears — enter your Kingdom Name and Village Name.");
  s("§f  • Your kingdom is now created. The Town Hall block is your village hub.");
  s("§e Step 2 — Place Your Buildings");
  s("§f  • Tap each building block to open its menu:");
  s("§f    §a🏛 Town Hall§f — kingdom overview, diplomacy, treasury, merchants");
  s("§f    §a⚔ Barracks§f  — recruit, train, upgrade troops");
  s("§f    §a🏪 Market§f   — sell food, buy seeds, upgrade market");
  s("§f    §a🔨 Blacksmith§f — upgrade weapon & armor tiers");
  s("§f    §a🌾 Granary§f  — food storage, field harvest, field worker upgrades");
  s("§f    §a💎 Treasury§f — deposit emeralds, view balance");
  s("§f    §a🚉 Trade Station§f — dispatch & receive rail shipments");
  s("§e Step 3 — Fund Your Village");
  s("§f  • Hold §6emeralds§f and tap your §bTreasury§f to deposit instantly.");
  s("§f  • Hold §afood§f and tap your §bGranary§f to deposit instantly.");
  s("§e Step 4 — Assign Workers");
  s("§f  • Run: §e/scriptevent kc:workers <villageId> f:5 w:2");
  s("§f  • Farmers produce crops each game day. Workers build village speed.");
  s("§f  • Available workers = population − troops assigned.");
  s("§7  Tip: run /scriptevent kc:status to see your village IDs.");
  s("§b══════════════════════════════════════════");
}

function tutorialRecruit(player: Player): void {
  const s = (m: string) => notifyPlayer(player.name, m);
  s("§b════════ Tutorial: Recruiting Troops ════════");
  s("§e Method 1 — Barracks Menu (Tap the Barracks block)");
  s("§f  Buttons you'll see:");
  s("§f  • §aRecruit City Guard§f (5💎) — sturdy, cheap defenders");
  s("§f  • §aRecruit Spearman§f (8💎) — medium infantry");
  s("§f  • §aRecruit Archer§f (8💎) — ranged, good vs cavalry");
  s("§f  • §aRecruit Cavalry§f (12💎) — fast, high damage");
  s("§f  Troops are paid from the village §btreasury§f (emeralds).");
  s("§e Method 2 — Command Line");
  s("§f  /scriptevent kc:recruit <villageId> cityGuards 5");
  s("§f  /scriptevent kc:recruit <villageId> spearmen 3");
  s("§f  /scriptevent kc:recruit <villageId> archers 3");
  s("§f  /scriptevent kc:recruit <villageId> cavalry 2");
  s("§e Picking Up Troops (Deploy to Battle)");
  s("§f  • Open Barracks → tap §b⚔ Pick Up Troops§f.");
  s("§f  • Use sliders to choose how many of each type to carry.");
  s("§f  • Troops are added to your §binventory§f as troop tokens.");
  s("§f  • Tokens are §4consumed§f when you use them (recall scroll or deploy).");
  s("§e Returning Troops");
  s("§f  • Open Barracks → §b🏹 Return Troops to Barracks§f.");
  s("§f  • Returns all troop tokens in your inventory back to the garrison.");
  s("§e Training Queue");
  s("§f  • Open Barracks → §b🪖 Train Troops§f.");
  s("§f  • Choose type & amount — they train over time and auto-join garrison.");
  s("§f  • Queue holds up to 10 batches. Higher barracks level = faster training.");
  s("§e Disbanding");
  s("§f  • Open Barracks → §cDisband 1 Guard/Spearman§f.");
  s("§f  • Or command: §e/scriptevent kc:disband <id> cityGuards 2");
  s("§b══════════════════════════════════════════");
}

function tutorialUpgrades(player: Player): void {
  const s = (m: string) => notifyPlayer(player.name, m);
  s("§b════════ Tutorial: Upgrades ════════");
  s("§e 1 — Barracks Upgrade");
  s("§f  Tap Barracks → §aUpgrade Barracks§f (cost: level × 15💎).");
  s("§f  Each level increases training speed and troop capacity.");
  s("§f  Or: §e/scriptevent kc:barracks <villageId>");
  s("§e 2 — Blacksmith: Weapons & Armor");
  s("§f  Tap Blacksmith block → §aUpgrade Weapons§f or §aUpgrade Armor§f.");
  s("§f  Each tier costs more emeralds. Higher tiers increase combat power.");
  s("§f  Max Lv5 for each. View current tier: §e/scriptevent kc:blacksmith <id>");
  s("§e 3 — Market Upgrade");
  s("§f  Tap Market → §aUpgrade Market§f (cost: level × 20💎).");
  s("§f  Higher level = more merchant slots + better seed variety.");
  s("§e 4 — Field Worker Upgrade (Farming)");
  s("§f  Tap Granary → §a⬆ Upgrade Field Workers§f (20💎 per level).");
  s("§f  Max Lv5. Each level adds +50 crops that NPCs auto-harvest per day.");
  s("§f  Lv0 = 50 crops/day cap.  Lv5 = 300 crops/day cap.");
  s("§e 5 — Population Growth (automatic)");
  s("§f  Population grows automatically when food is plentiful.");
  s("§f  More population = more available workers & troops.");
  s("§e Upgrade Priority Suggestion:");
  s("§f  Barracks Lv2 → Field Workers Lv2 → Blacksmith Lv2 → Market Lv2");
  s("§f  Then push all to Lv5 for full power.");
  s("§b══════════════════════════════════════════");
}

function tutorialFarm(player: Player): void {
  const s = (m: string) => notifyPlayer(player.name, m);
  s("§b════════ Tutorial: Farming & Granary ════════");
  s("§e How Food Works");
  s("§f  Food sustains your population. Low food → shortage stages → population drop.");
  s("§f  Two food pools:");
  s("§f  • §bfoodStorage§f — village's direct food reserve (feeds population)");
  s("§f  • §bfieldStorage§f — NPC field harvest buffer (you collect it to granary)");
  s("§e Depositing Food (instant shortcut)");
  s("§f  Hold any food item and §aTap your Granary block§f.");
  s("§f  Deposits up to 64 at once directly to granary storage.");
  s("§e NPC Auto-Harvest (every game day ~24000 ticks)");
  s("§f  Assigned §bfarmers§f auto-harvest crops into §bfieldStorage§f buffer.");
  s("§f  Daily cap = 50 + (Field Worker Level × 50) crops.");
  s("§f  You must collect field storage to move it into the village food supply.");
  s("§e Collecting Field Harvest");
  s("§f  Tap Granary → §a🌾 Collect Field Harvest§f — moves field buffer → your inventory.");
  s("§f  Or command: §e/scriptevent kc:collect <villageId>");
  s("§e Viewing Field Storage");
  s("§f  Tap Granary → §a📦 View Field Storage§f — shows what's buffered.");
  s("§e Player Manual Harvest");
  s("§f  Break a fully-grown crop inside your village territory.");
  s("§f  Crops go §adirectly into the granary§f (not your inventory).");
  s("§f  Use §e/scriptevent kc:granary§f to see current levels.");
  s("§e Selling Food");
  s("§f  Tap Market → §a🌾 Sell Food (bulk)§f — converts granary food to emeralds.");
  s("§f  Or: §a💰 Sell Food (abstract, 10💎/10)§f — instant sale from village reserve.");
  s("§e Seed Shop");
  s("§f  Tap Market → §a🌱 Seed Shop§f — buy seeds with emeralds from your inventory.");
  s("§f  Plant them near your village. Farmers will auto-harvest when grown.");
  s("§b══════════════════════════════════════════");
}

function tutorialSiege(player: Player): void {
  const s = (m: string) => notifyPlayer(player.name, m);
  s("§b════════ Tutorial: Siege & Conquest ════════");
  s("§e Step 1 — Declare War");
  s("§f  You must be at war before sieging.");
  s("§f  Command: §e/scriptevent kc:war <KingdomName>");
  s("§f  Example: §e/scriptevent kc:war IronKingdom");
  s("§f  See all kingdoms: §e/scriptevent kc:kingdoms");
  s("§e Step 2 — Enter Enemy Territory");
  s("§f  Walk inside the border of an enemy village (within ~64 blocks of their Town Hall).");
  s("§f  You'll see a §ccountdown alert§f — stay inside to become §4siege-eligible§r.");
  s("§f  Check your status: §e/scriptevent kc:border");
  s("§e Step 3 — Initiate Siege");
  s("§f  Once eligible, run: §e/scriptevent kc:siege <VillageName>");
  s("§f  Example: §e/scriptevent kc:siege Redfort");
  s("§f  A siege begins. Progress builds over time (0–600 ticks to capture).");
  s("§e Step 4 — Siege Progress");
  s("§f  • Remain inside the border to advance progress.");
  s("§f  • Leaving pauses or slows the siege.");
  s("§f  • Defenders can fight you off — getting killed stops the siege.");
  s("§f  • Watch your siege % with: §e/scriptevent kc:map");
  s("§e Step 5 — Capture / Occupy");
  s("§f  When siege reaches 100%, the village is §bcaptured§f and joins your kingdom.");
  s("§f  §6Alternative — Break the Town Hall:§f");
  s("§f  • Breaking an §cenemy§f Town Hall while at war = §4instant capture§f.");
  s("§f  • The village owner is changed to you immediately.");
  s("§f  • Defenders will be notified. Enemy troops at that village become neutral.");
  s("§e Defending Against a Siege");
  s("§f  • You'll receive §calerts§f (if alerts are on) when enemies enter your border.");
  s("§f  • Return to your village and eliminate the invader to cancel the siege.");
  s("§f  • Toggle alerts: §e/scriptevent kc:alerts");
  s("§e Peace & Alliance");
  s("§f  End war: §e/scriptevent kc:peace <KingdomName>");
  s("§f  Form alliance: §e/scriptevent kc:ally <KingdomName>");
  s("§b══════════════════════════════════════════");
}

function tutorialTrade(player: Player): void {
  const s = (m: string) => notifyPlayer(player.name, m);
  s("§b════════ Tutorial: Trade Stations ════════");
  s("§e Setup");
  s("§f  • Place a §bkingdoms:trade_station§f block in your village.");
  s("§f  • Do the same in the village you want to trade with.");
  s("§f  • Connect them with §bMinecraft rail tracks§f. No poles needed.");
  s("§e Dispatching Resources (KC Shipment)");
  s("§f  1. Tap your Trade Station → §a📦 Dispatch Resources§f.");
  s("§f  2. Pick a destination village from the list.");
  s("§f  3. Enter amounts for food, emeralds, iron, etc.");
  s("§f  4. Resources are deducted immediately; a §bchest minecart§f spawns at your station.");
  s("§f  5. Push the minecart onto the rail toward the destination.");
  s("§f  6. When it arrives within ~5 blocks of the destination station, it delivers automatically.");
  s("§e Dispatching Troops (KC Military)");
  s("§f  Tap Trade Station → §a🗡 Dispatch Reinforcements§f.");
  s("§f  Works the same as resources — troop tokens are sent as a minecart cargo.");
  s("§e Manual Delivery (Untagged Minecart)");
  s("§f  • Place a chest minecart and fill it with items from your inventory.");
  s("§f  • Push it to any allied village's trade station.");
  s("§f  • The station auto-detects it and converts items:");
  s("§f    §6Emerald §f→ treasury  |  §7Iron Ingot §f→ iron storage");
  s("§f    §6Gold Ingot §f→ gold  |  §8Coal §f→ coal  |  §aAny Log §f→ wood");
  s("§f    §7Stone/Cobblestone §f→ stone  |  §bDiamond §f→ diamonds");
  s("§f    §aFood items §f→ food storage");
  s("§e Viewing Shipments");
  s("§f  Tap Trade Station → §a🚂 Active Shipments§f — see carts you dispatched.");
  s("§f  Tap Trade Station → §a📋 Trade History§f — last 10 arrivals at this station.");
  s("§e Resource Storage");
  s("§f  Tap Trade Station → §a📊 Resource Storage§f — view iron/gold/coal/wood/stone balance.");
  s("§7  Tip: resources in storage are used automatically by production buildings.");
  s("§b══════════════════════════════════════════");
}

function tutorialDiplo(player: Player): void {
  const s = (m: string) => notifyPlayer(player.name, m);
  s("§b════════ Tutorial: Diplomacy ════════");
  s("§e See All Kingdoms");
  s("§f  /scriptevent kc:kingdoms — list all active kingdoms");
  s("§f  /scriptevent kc:intel <KingdomName> — scout their strength & villages");
  s("§e Declaring War");
  s("§f  /scriptevent kc:war <KingdomName>");
  s("§f  • Required before you can siege enemy villages.");
  s("§f  • Both kingdoms are notified. Alert system fires for defenders.");
  s("§e Making Peace");
  s("§f  /scriptevent kc:peace <KingdomName>");
  s("§f  • Ends all active sieges between the two kingdoms.");
  s("§f  • Both sides receive the peace notification.");
  s("§e Forming an Alliance");
  s("§f  /scriptevent kc:ally <KingdomName>");
  s("§f  • Allied kingdoms cannot siege each other.");
  s("§f  • Trade between allies gets no restriction.");
  s("§f  • Alliance remains until a war declaration breaks it.");
  s("§e Diplomacy Menu (In-Game)");
  s("§f  Tap your Town Hall → §aDiplomacy§f button.");
  s("§f  Shows current wars, alliances, and quick action buttons.");
  s("§e Kingdom Overview");
  s("§f  Tap Town Hall → §aKingdom Overview§f.");
  s("§f  Shows all your villages, total troops, food, treasury.");
  s("§f  Or: §e/scriptevent kc:kingdom");
  s("§e Alert System");
  s("§f  You receive warnings when enemies enter your territory.");
  s("§f  Toggle on/off: §e/scriptevent kc:alerts");
  s("§b══════════════════════════════════════════");
}

// ── Village Resolution Helper ─────────────────────────────────────────────────

function resolveVillage(player: Player, idPrefix: string | undefined): VillageData | undefined {
  const myVillages = getAllVillages().filter((v) => v.owner === player.name);

  if (!idPrefix) {
    if (myVillages.length === 1) return myVillages[0];
    notifyPlayer(player.name, `§cYou own multiple villages. Specify a village ID prefix. Use /scriptevent kc:villages`);
    return undefined;
  }

  const match = myVillages.find((v) => v.id.startsWith(idPrefix) || v.name.toLowerCase().startsWith(idPrefix.toLowerCase()));
  if (!match) {
    notifyPlayer(player.name, `§cNo village found matching "${idPrefix}". Use /scriptevent kc:villages`);
    return undefined;
  }
  return match;
}
