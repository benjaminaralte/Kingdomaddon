import type { TroopData, TradeCartCargo } from "../types/index.js";
import { getVillage, saveVillage } from "../storage/index.js";
import { notifyPlayer } from "../utils/notify.js";
import { sendTradeCart } from "./trade.js";

export function sendReinforcements(
  fromVillageId: string,
  toVillageId: string,
  troops: Partial<TroopData>
): boolean {
  const from = getVillage(fromVillageId);
  const to = getVillage(toVillageId);
  if (!from || !to) return false;

  for (const [type, count] of Object.entries(troops) as Array<[keyof TroopData, number]>) {
    if ((count ?? 0) <= 0) continue;
    if (from.troops[type] < (count ?? 0)) {
      notifyPlayer(from.owner, `§cNot enough ${type} in §b${from.name}§c to send.`);
      return false;
    }
  }

  for (const [type, count] of Object.entries(troops) as Array<[keyof TroopData, number]>) {
    if ((count ?? 0) <= 0) continue;
    from.troops[type] -= count ?? 0;
  }

  saveVillage(from);

  const cargo: TradeCartCargo = {
    food: 0,
    emeralds: 0,
    iron: 0,
    gold: 0,
    coal: 0,
    wood: 0,
    stone: 0,
    diamonds: 0,
    troops,
  };

  const success = sendTradeCart(fromVillageId, toVillageId, cargo);

  if (!success) {
    for (const [type, count] of Object.entries(troops) as Array<[keyof TroopData, number]>) {
      if ((count ?? 0) <= 0) continue;
      from.troops[type] += count ?? 0;
    }
    saveVillage(from);
    return false;
  }

  const summary = Object.entries(troops)
    .filter(([, c]) => (c ?? 0) > 0)
    .map(([t, c]) => `${c} ${t}`)
    .join(", ");

  notifyPlayer(from.owner, `§aSent reinforcements (${summary}) from §b${from.name}§a to §b${to.name}§a.`);
  return true;
}

export function recallTroops(
  fromVillageId: string,
  toVillageId: string,
  troops: Partial<TroopData>
): boolean {
  return sendReinforcements(fromVillageId, toVillageId, troops);
}
