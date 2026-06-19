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
    default:
      notifyPlayer(player.name, `§cUnknown /kc command: "${subcommand}". Use /scriptevent kc:help`);
  }
}

function showHelp(player: Player): void {
  const lines = [
    "§b=== Kingdoms & Conquest Commands ===§r",
    "§e/scriptevent kc:help§r — this list",
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
