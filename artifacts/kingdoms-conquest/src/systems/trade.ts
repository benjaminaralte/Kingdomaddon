import { world } from "@minecraft/server";
import type { VillageData, TradePoleData, TradeCartData, TradeCartCargo } from "../types/index.js";
import { generateId, getVillage, saveVillage, getAllVillages } from "../storage/index.js";
import { distance, moveToward } from "../utils/tick.js";
import { notifyPlayer } from "../utils/notify.js";

const CART_SPEED = 0.4;
const POLE_ARRIVE_DISTANCE = 3;
const CART_UPDATE_INTERVAL = 20;

let lastCartTick = 0;

export function registerTradePole(
  village: VillageData,
  location: { x: number; y: number; z: number }
): boolean {
  if (village.tradePoles.length >= 64) {
    notifyPlayer(village.owner, "§cMaximum trade poles reached for this village.");
    return false;
  }

  const pole: TradePoleData = {
    id: generateId(),
    location,
    order: village.tradePoles.length,
  };

  village.tradePoles.push(pole);
  saveVillage(village);
  notifyPlayer(village.owner, `§aTrade pole registered in §b${village.name}§a. (${village.tradePoles.length} total)`);
  return true;
}

export function removeTradePole(village: VillageData, poleId: string): void {
  village.tradePoles = village.tradePoles.filter((p) => p.id !== poleId);
  village.tradePoles.forEach((p, i) => (p.order = i));
  saveVillage(village);
}

export function sendTradeCart(
  fromVillageId: string,
  toVillageId: string,
  cargo: TradeCartCargo
): boolean {
  const from = getVillage(fromVillageId);
  const to = getVillage(toVillageId);
  if (!from || !to) return false;

  if (from.treasury < cargo.emeralds) {
    notifyPlayer(from.owner, "§cNot enough emeralds in treasury to send.");
    return false;
  }

  if (from.foodStorage < cargo.food) {
    notifyPlayer(from.owner, "§cNot enough food in granary to send.");
    return false;
  }

  from.treasury -= cargo.emeralds;
  from.foodStorage -= cargo.food;

  const dim = world.getDimension(from.location.dimension);
  const spawnLoc = from.townHallLocation;

  let cartEntity;
  try {
    cartEntity = dim.spawnEntity("kingdoms:trade_cart", {
      x: spawnLoc.x + (Math.random() * 4 - 2),
      y: spawnLoc.y,
      z: spawnLoc.z + (Math.random() * 4 - 2),
    });
  } catch {
    notifyPlayer(from.owner, "§cCould not spawn trade cart (chunk not loaded).");
    from.treasury += cargo.emeralds;
    from.foodStorage += cargo.food;
    saveVillage(from);
    return false;
  }

  const cartData: TradeCartData = {
    entityId: cartEntity.id,
    sourceVillageId: fromVillageId,
    destinationVillageId: toVillageId,
    cargo,
    currentPoleIndex: 0,
    isMilitary: Object.values(cargo.troops ?? {}).some((v) => (v ?? 0) > 0),
  };

  cartEntity.setDynamicProperty("kc:cart_data", JSON.stringify(cartData));
  cartEntity.setDynamicProperty("kc:village_id", fromVillageId);
  cartEntity.nameTag = `Cart → ${to.name}`;

  from.activeCarts.push(cartData);
  from.tradeCartCount++;
  saveVillage(from);

  notifyPlayer(
    from.owner,
    `§aTrade cart dispatched from §b${from.name}§a to §b${to.name}§a.`
  );
  return true;
}

export function tickTradeCarts(currentTick: number): void {
  if (currentTick - lastCartTick < CART_UPDATE_INTERVAL) return;
  lastCartTick = currentTick;

  for (const village of getAllVillages()) {
    if (village.activeCarts.length === 0) continue;
    processVillageCarts(village);
  }
}

function processVillageCarts(village: VillageData): void {
  const dim = world.getDimension(village.location.dimension);
  let changed = false;

  for (let i = village.activeCarts.length - 1; i >= 0; i--) {
    const cart = village.activeCarts[i];
    const cartEntities = dim.getEntities({ type: "kingdoms:trade_cart" });
    const entity = cartEntities.find((e) => e.id === cart.entityId);

    if (!entity) {
      village.activeCarts.splice(i, 1);
      changed = true;
      continue;
    }

    const dest = getVillage(cart.destinationVillageId);
    if (!dest) {
      entity.remove();
      village.activeCarts.splice(i, 1);
      changed = true;
      continue;
    }

    const destPoles = dest.tradePoles.sort((a, b) => a.order - b.order);

    if (destPoles.length === 0) {
      moveEntityToward(entity, dest.townHallLocation);
      const d = distance(entity.location, dest.townHallLocation);
      if (d < POLE_ARRIVE_DISTANCE) {
        deliverCart(cart, village, dest, entity, i);
        changed = true;
      }
      continue;
    }

    const currentPole = destPoles[Math.min(cart.currentPoleIndex, destPoles.length - 1)];
    moveEntityToward(entity, currentPole.location);

    const d = distance(entity.location, currentPole.location);
    if (d < POLE_ARRIVE_DISTANCE) {
      if (cart.currentPoleIndex >= destPoles.length - 1) {
        deliverCart(cart, village, dest, entity, i);
        changed = true;
      } else {
        cart.currentPoleIndex++;
      }
    }
  }

  if (changed) saveVillage(village);
}

function moveEntityToward(
  entity: { teleport: (loc: { x: number; y: number; z: number }) => void; location: { x: number; y: number; z: number } },
  target: { x: number; y: number; z: number }
): void {
  const newPos = moveToward(entity.location, target, CART_SPEED);
  try {
    (entity as unknown as import("@minecraft/server").Entity).teleport(newPos);
  } catch { /* chunk unloaded */ }
}

function deliverCart(
  cart: TradeCartData,
  sourceVillage: VillageData,
  destVillage: VillageData,
  entity: import("@minecraft/server").Entity,
  cartIndex: number
): void {
  destVillage.treasury += cart.cargo.emeralds;
  destVillage.foodStorage += cart.cargo.food;

  for (const [troopType, count] of Object.entries(cart.cargo.troops ?? {})) {
    const key = troopType as keyof typeof destVillage.troops;
    destVillage.troops[key] = (destVillage.troops[key] ?? 0) + (count ?? 0);
  }

  saveVillage(destVillage);

  entity.remove();
  sourceVillage.activeCarts.splice(cartIndex, 1);
  sourceVillage.tradeCartCount = Math.max(0, sourceVillage.tradeCartCount - 1);

  notifyPlayer(
    destVillage.owner,
    `§aTrade cart arrived at §b${destVillage.name}§a! (+${cart.cargo.emeralds}💎, +${cart.cargo.food}🌾)`
  );

  if (sourceVillage.tradeCartCount <= 0) {
    spawnDepotCart(sourceVillage);
  }
}

function spawnDepotCart(village: VillageData): void {
  village.tradeCartCount = 1;
  saveVillage(village);
}

export function upgradeBarracks(village: VillageData): boolean {
  if (village.barracksLevel >= 5) {
    notifyPlayer(village.owner, "§cBarracks already at maximum level.");
    return false;
  }

  const cost = village.barracksLevel * 15;
  if (village.treasury < cost) {
    notifyPlayer(village.owner, `§cNeed ${cost}💎 to upgrade barracks.`);
    return false;
  }

  village.treasury -= cost;
  village.barracksLevel++;
  saveVillage(village);
  notifyPlayer(village.owner, `§aBarracks upgraded to level §b${village.barracksLevel}§a in §b${village.name}§a!`);
  return true;
}
