import type { KingdomData } from "../types/index.js";
import {
  generateId,
  getAllKingdoms,
  getKingdom,
  getKingdomByKing,
  getVillage,
  saveKingdom,
  deleteKingdom,
} from "../storage/index.js";
import { notifyPlayer, notifyKingdom } from "../utils/notify.js";

export function createKingdom(king: string, name: string): KingdomData {
  const existing = getKingdomByKing(king);
  if (existing) return existing;

  const kingdom: KingdomData = {
    id: generateId(),
    name,
    king,
    villageIds: [],
    wars: [],
    alliances: [],
  };
  saveKingdom(kingdom);
  notifyPlayer(king, `Your kingdom "§b${name}§r" has been founded!`);
  return kingdom;
}

export function addVillageToKingdom(kingdomId: string, villageId: string): void {
  const kingdom = getKingdom(kingdomId);
  if (!kingdom) return;
  if (!kingdom.villageIds.includes(villageId)) {
    kingdom.villageIds.push(villageId);
    saveKingdom(kingdom);
  }
}

export function removeVillageFromKingdom(kingdomId: string, villageId: string): void {
  const kingdom = getKingdom(kingdomId);
  if (!kingdom) return;
  kingdom.villageIds = kingdom.villageIds.filter((id) => id !== villageId);
  if (kingdom.villageIds.length === 0) {
    collapseKingdom(kingdomId);
  } else {
    saveKingdom(kingdom);
  }
}

export function collapseKingdom(kingdomId: string): void {
  const kingdom = getKingdom(kingdomId);
  if (!kingdom) return;

  notifyPlayer(kingdom.king, `§cYour kingdom "${kingdom.name}" has collapsed!`);
  notifyAllKingdomMembers(kingdom, `§cThe kingdom of "${kingdom.name}" has fallen!`);

  for (const vid of kingdom.villageIds) {
    const village = getVillage(vid);
    if (village) {
      village.kingdomId = "";
      village.owner = "";
    }
  }

  deleteKingdom(kingdomId);
}

export function declareWar(attackerId: string, defenderId: string): void {
  const attacker = getKingdom(attackerId);
  const defender = getKingdom(defenderId);
  if (!attacker || !defender) return;

  if (!attacker.wars.includes(defenderId)) attacker.wars.push(defenderId);
  if (!defender.wars.includes(attackerId)) defender.wars.push(attackerId);

  attacker.alliances = attacker.alliances.filter((id) => id !== defenderId);
  defender.alliances = defender.alliances.filter((id) => id !== attackerId);

  saveKingdom(attacker);
  saveKingdom(defender);

  notifyPlayer(attacker.king, `§cWar declared against "${defender.name}"!`);
  notifyPlayer(defender.king, `§c"${attacker.name}" has declared war on your kingdom!`);
}

export function makePeace(kingdomAId: string, kingdomBId: string): void {
  const a = getKingdom(kingdomAId);
  const b = getKingdom(kingdomBId);
  if (!a || !b) return;

  a.wars = a.wars.filter((id) => id !== kingdomBId);
  b.wars = b.wars.filter((id) => id !== kingdomAId);
  saveKingdom(a);
  saveKingdom(b);

  notifyPlayer(a.king, `§aPeace made with "${b.name}".`);
  notifyPlayer(b.king, `§aPeace made with "${a.name}".`);
}

export function formAlliance(kingdomAId: string, kingdomBId: string): void {
  const a = getKingdom(kingdomAId);
  const b = getKingdom(kingdomBId);
  if (!a || !b) return;
  if (a.wars.includes(kingdomBId) || b.wars.includes(kingdomAId)) return;

  if (!a.alliances.includes(kingdomBId)) a.alliances.push(kingdomBId);
  if (!b.alliances.includes(kingdomAId)) b.alliances.push(kingdomAId);
  saveKingdom(a);
  saveKingdom(b);

  notifyPlayer(a.king, `§aAlliance formed with "${b.name}"!`);
  notifyPlayer(b.king, `§aAlliance formed with "${a.name}"!`);
}

export function areAtWar(kingdomAId: string, kingdomBId: string): boolean {
  const a = getKingdom(kingdomAId);
  return a ? a.wars.includes(kingdomBId) : false;
}

export function areAllied(kingdomAId: string, kingdomBId: string): boolean {
  const a = getKingdom(kingdomAId);
  return a ? a.alliances.includes(kingdomBId) : false;
}

export function getKingdomStrength(kingdomId: string): number {
  const kingdom = getKingdom(kingdomId);
  if (!kingdom) return 0;

  let total = 0;
  for (const vid of kingdom.villageIds) {
    const village = getVillage(vid);
    if (village) {
      total +=
        village.troops.cityGuards              * 1 +
        village.troops.spearmen                * 2 +
        village.troops.archers                 * 2 +
        village.troops.cavalry                 * 3 +
        (village.troops.heavyKnight      ?? 0) * 5 +
        (village.troops.samurai          ?? 0) * 7 +
        (village.troops.mercenaryLancer  ?? 0) * 6 +
        (village.troops.legionary        ?? 0) * 6;
    }
  }
  return total;
}

export function getKingdomSummary(kingdomId: string): string {
  const kingdom = getKingdom(kingdomId);
  if (!kingdom) return "Unknown kingdom";

  let totalPop = 0;
  let totalTreasury = 0;
  let totalFood = 0;

  for (const vid of kingdom.villageIds) {
    const v = getVillage(vid);
    if (v) {
      totalPop += v.population;
      totalTreasury += v.treasury;
      totalFood += v.foodStorage;
    }
  }

  const strength = getKingdomStrength(kingdomId);
  return [
    `§b${kingdom.name}§r (King: ${kingdom.king})`,
    `Villages: ${kingdom.villageIds.length}  Population: ${totalPop}`,
    `Treasury: ${totalTreasury}💎  Food: ${totalFood}🌾`,
    `Military: ${strength} strength`,
    `Wars: ${kingdom.wars.length}  Alliances: ${kingdom.alliances.length}`,
  ].join("\n");
}

function notifyAllKingdomMembers(kingdom: KingdomData, message: string): void {
  const owners: string[] = [];
  for (const vid of kingdom.villageIds) {
    const v = getVillage(vid);
    if (v && v.owner) owners.push(v.owner);
  }
  notifyKingdom(kingdom.king, owners, message);
}

export function getKingdomOf(playerName: string): KingdomData | undefined {
  return getAllKingdoms().find(
    (k) => k.king === playerName || k.villageIds.some((vid) => {
      const v = getVillage(vid);
      return v?.owner === playerName;
    })
  );
}
