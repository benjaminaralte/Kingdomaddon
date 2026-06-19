import { world, Player } from "@minecraft/server";
import type { VillageData, KingdomData } from "../types/index.js";
import {
  getAllKingdoms,
  getKingdom,
  getVillage,
  saveVillage,
} from "../storage/index.js";
import { distance } from "../utils/tick.js";
import { notifyPlayer, notifyAlert } from "../utils/notify.js";
import {
  addVillageToKingdom,
  removeVillageFromKingdom,
  areAtWar,
} from "./kingdom.js";
import { notifyVillageUnderSiege } from "./watchtower.js";
import { garrisonDeployedSoldiers } from "./deployTroops.js";
import { isSiegeEligible, clearBorderIntrusion } from "./border.js";

const SIEGE_RADIUS = 48;
const CAPTURE_PROXIMITY = 5;

export interface SiegeData {
  attackerKingdomId: string;
  attackerName: string;
  targetVillageId: string;
  startTick: number;
  progress: number;
}

const activeSieges = new Map<string, SiegeData>();

export function initiateSiege(attacker: Player, targetVillageId: string): boolean {
  const target = getVillage(targetVillageId);
  if (!target || !target.owner) {
    notifyPlayer(attacker.name, "§cNo valid village to siege.");
    return false;
  }

  const attackerKingdom = getAttackerKingdom(attacker.name);
  if (!attackerKingdom) {
    notifyPlayer(attacker.name, "§cYou must be in a kingdom to siege.");
    return false;
  }

  if (!areAtWar(attackerKingdom.id, target.kingdomId)) {
    notifyPlayer(attacker.name, "§cYou are not at war with that kingdom.");
    return false;
  }

  const d = distance(attacker.location, target.townHallLocation);
  if (d > SIEGE_RADIUS) {
    notifyPlayer(attacker.name, `§cYou must be within ${SIEGE_RADIUS} blocks of the Town Hall.`);
    return false;
  }

  if (activeSieges.has(targetVillageId)) {
    notifyPlayer(attacker.name, "§cThat village is already under siege.");
    return false;
  }

  if (!isSiegeEligible(attacker.name, targetVillageId)) {
    notifyPlayer(
      attacker.name,
      `§cYou must enter §b${target.name}§c's border and wait for the siege countdown before initiating a siege.`
    );
    return false;
  }

  const siege: SiegeData = {
    attackerKingdomId: attackerKingdom.id,
    attackerName: attacker.name,
    targetVillageId,
    startTick: world.getAbsoluteTime(),
    progress: 0,
  };

  activeSieges.set(targetVillageId, siege);
  clearBorderIntrusion(attacker.name, targetVillageId);

  notifyPlayer(attacker.name, `§c⚔ Siege of §b${target.name}§c has begun!`);
  notifyAlert(target.owner, `§4🔔 §b${target.name}§4 is under siege by §c${attacker.name}§4!`);
  notifyVillageUnderSiege(targetVillageId);

  return true;
}

export function tickSieges(_currentTick: number): void {
  for (const [villageId, siege] of activeSieges.entries()) {
    const target = getVillage(villageId);
    if (!target) {
      activeSieges.delete(villageId);
      continue;
    }

    const players = world.getPlayers();
    const attacker = players.find((p) => p.name === siege.attackerName);

    if (!attacker) {
      siege.progress = Math.max(0, siege.progress - 1);
      if (siege.progress <= 0) {
        activeSieges.delete(villageId);
        notifyPlayer(target.owner, `§aSiege of §b${target.name}§a has been lifted.`);
      }
      continue;
    }

    const d = distance(attacker.location, target.townHallLocation);

    if (d <= CAPTURE_PROXIMITY) {
      siege.progress++;
      if (siege.progress >= 600) {
        captureVillage(siege, target);
        activeSieges.delete(villageId);
      } else if (siege.progress % 100 === 0) {
        const percent = Math.floor((siege.progress / 600) * 100);
        notifyPlayer(siege.attackerName, `§6Capturing... ${percent}%`);
        notifyAlert(target.owner, `§cTown Hall being captured! (${percent}%)`);
      }
    } else if (d > SIEGE_RADIUS * 2) {
      siege.progress = Math.max(0, siege.progress - 2);
    }
  }
}

function captureVillage(siege: SiegeData, target: VillageData): void {
  const attackerKingdom = getKingdom(siege.attackerKingdomId);
  if (!attackerKingdom) return;

  const defenderKingdomId = target.kingdomId;
  const oldOwner = target.owner;
  const transferredTreasury = target.treasury;

  notifyPlayer(oldOwner, `§4⚔ §b${target.name}§4 has been captured by §c${attackerKingdom.name}§4!`);

  removeVillageFromKingdom(defenderKingdomId, target.id);
  addVillageToKingdom(siege.attackerKingdomId, target.id);

  target.owner = siege.attackerName;
  target.kingdomId = siege.attackerKingdomId;
  target.treasury = 0;

  saveVillage(target);

  const attackerKingdomUpdated = getKingdom(siege.attackerKingdomId);
  if (attackerKingdomUpdated) {
    const attackerVillages = attackerKingdomUpdated.villageIds
      .map((id) => getVillage(id))
      .filter((v): v is VillageData => !!v && v.owner === siege.attackerName);

    if (attackerVillages.length > 0) {
      attackerVillages[0].treasury += transferredTreasury;
      saveVillage(attackerVillages[0]);
    }
  }

  const attacker = world.getPlayers().find((p) => p.name === siege.attackerName);
  const dim = attacker?.dimension ?? world.getDimension("overworld");
  const garrisoned = garrisonDeployedSoldiers(siege.attackerName, target, dim);

  const garrisonMsg = garrisoned > 0
    ? ` §7(${garrisoned} surviving soldiers now garrison the village.)`
    : "";
  notifyPlayer(siege.attackerName, `§a⚔ §b${target.name}§a has been captured! Treasury: §6${transferredTreasury}💎§a.${garrisonMsg}`);
}

export function captureVillageByForce(attacker: Player, target: VillageData): boolean {
  const attackerKingdom = getAttackerKingdom(attacker.name);
  if (!attackerKingdom) {
    notifyPlayer(attacker.name, "§cYou must be in a kingdom to capture a village.");
    return false;
  }
  if (!areAtWar(attackerKingdom.id, target.kingdomId)) {
    notifyPlayer(attacker.name, "§cYou are not at war with that kingdom.");
    return false;
  }
  if (target.owner === attacker.name) return false;

  const siege: SiegeData = {
    attackerKingdomId: attackerKingdom.id,
    attackerName: attacker.name,
    targetVillageId: target.id,
    startTick: world.getAbsoluteTime(),
    progress: 600,
  };

  activeSieges.delete(target.id);
  captureVillage(siege, target);
  return true;
}

export function getActiveSiege(villageId: string): SiegeData | undefined {
  return activeSieges.get(villageId);
}

export function isSiegeActive(villageId: string): boolean {
  return activeSieges.has(villageId);
}

function getAttackerKingdom(playerName: string): KingdomData | undefined {
  return getAllKingdoms().find(
    (k) =>
      k.king === playerName ||
      k.villageIds.some((vid) => {
        const v = getVillage(vid);
        return v?.owner === playerName;
      })
  );
}
