import { world } from "@minecraft/server";
import type { VillageData, TradePoleData, TradeCartData, TradeCartCargo } from "../types/index.js";
import { generateId, getVillage, saveVillage, getAllVillages } from "../storage/index.js";
import { distance, moveToward } from "../utils/tick.js";
import { notifyPlayer } from "../utils/notify.js";
import { getCargoSummary, ensureResourceStorage } from "./tradeStation.js";

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

  const isMilitary = Object.values(cargo.troops ?? {}).some((v) => (v ?? 0) > 0);
  const cartData: TradeCartData = {
    entityId: cartEntity.id,
    sourceVillageId: fromVillageId,
    destinationVillageId: toVillageId,
    cargo,
    currentPoleIndex: 0,
    isMilitary,
    isRailShipment: false,
  };

  cartEntity.setDynamicProperty("kc:cart_data", JSON.stringify(cartData));
  cartEntity.setDynamicProperty("kc:village_id", fromVillageId);
  cartEntity.nameTag = isMilitary ? `🗡 Cart → ${to.name}` : `📦 Cart → ${to.name}`;

  from.activeCarts.push(cartData);
  from.tradeCartCount++;
  saveVillage(from);

  notifyPlayer(
    from.owner,
    `§aTrade cart dispatched from §b${from.name}§a to §b${to.name}§a.`
  );
  return true;
}

export function sendRailShipment(
  fromVillageId: string,
  toVillageId: string,
  cargo: TradeCartCargo
): boolean {
  const from = getVillage(fromVillageId);
  const to = getVillage(toVillageId);
  if (!from || !to) return false;

  if (!from.hasTradeStation) {
    notifyPlayer(from.owner, "§c§b" + from.name + "§c has no Trade Station. Build one first.");
    return false;
  }
  if (!to.hasTradeStation) {
    notifyPlayer(from.owner, "§c§b" + to.name + "§c has no Trade Station. They cannot receive rail shipments.");
    return false;
  }

  if (from.treasury < cargo.emeralds) {
    notifyPlayer(from.owner, `§cNot enough emeralds. Have: ${from.treasury}, Need: ${cargo.emeralds}.`);
    return false;
  }
  if (from.foodStorage < cargo.food) {
    notifyPlayer(from.owner, `§cNot enough food. Have: ${from.foodStorage}, Need: ${cargo.food}.`);
    return false;
  }

  ensureResourceStorage(from);
  const rs = from.resourceStorage;
  if ((cargo.iron ?? 0) > 0 && rs.iron < cargo.iron) {
    notifyPlayer(from.owner, `§cNot enough Iron. Have: ${rs.iron}, Need: ${cargo.iron}.`);
    return false;
  }
  if ((cargo.gold ?? 0) > 0 && rs.gold < cargo.gold) {
    notifyPlayer(from.owner, `§cNot enough Gold. Have: ${rs.gold}, Need: ${cargo.gold}.`);
    return false;
  }
  if ((cargo.coal ?? 0) > 0 && rs.coal < cargo.coal) {
    notifyPlayer(from.owner, `§cNot enough Coal. Have: ${rs.coal}, Need: ${cargo.coal}.`);
    return false;
  }
  if ((cargo.wood ?? 0) > 0 && rs.wood < cargo.wood) {
    notifyPlayer(from.owner, `§cNot enough Wood. Have: ${rs.wood}, Need: ${cargo.wood}.`);
    return false;
  }
  if ((cargo.stone ?? 0) > 0 && rs.stone < cargo.stone) {
    notifyPlayer(from.owner, `§cNot enough Stone. Have: ${rs.stone}, Need: ${cargo.stone}.`);
    return false;
  }
  if ((cargo.diamonds ?? 0) > 0 && rs.diamonds < cargo.diamonds) {
    notifyPlayer(from.owner, `§cNot enough Diamonds. Have: ${rs.diamonds}, Need: ${cargo.diamonds}.`);
    return false;
  }

  const troops = cargo.troops ?? {};
  if ((troops.cityGuards ?? 0) > from.troops.cityGuards) {
    notifyPlayer(from.owner, `§cNot enough City Guards. Have: ${from.troops.cityGuards}.`);
    return false;
  }
  if ((troops.spearmen ?? 0) > from.troops.spearmen) {
    notifyPlayer(from.owner, `§cNot enough Spearmen. Have: ${from.troops.spearmen}.`);
    return false;
  }
  if ((troops.archers ?? 0) > from.troops.archers) {
    notifyPlayer(from.owner, `§cNot enough Archers. Have: ${from.troops.archers}.`);
    return false;
  }
  if ((troops.cavalry ?? 0) > from.troops.cavalry) {
    notifyPlayer(from.owner, `§cNot enough Cavalry. Have: ${from.troops.cavalry}.`);
    return false;
  }

  from.treasury -= cargo.emeralds;
  from.foodStorage -= cargo.food;
  rs.iron -= (cargo.iron ?? 0);
  rs.gold -= (cargo.gold ?? 0);
  rs.coal -= (cargo.coal ?? 0);
  rs.wood -= (cargo.wood ?? 0);
  rs.stone -= (cargo.stone ?? 0);
  rs.diamonds -= (cargo.diamonds ?? 0);
  from.troops.cityGuards -= (troops.cityGuards ?? 0);
  from.troops.spearmen -= (troops.spearmen ?? 0);
  from.troops.archers -= (troops.archers ?? 0);
  from.troops.cavalry -= (troops.cavalry ?? 0);

  const dim = world.getDimension(from.location.dimension);
  const spawnLoc = from.tradeStationLocation ?? from.townHallLocation;

  let cartEntity;
  try {
    const isMil = Object.values(troops).some((v) => (v ?? 0) > 0);
    const entityType = isMil ? "kingdoms:military_transport" : "kingdoms:trade_cart";
    cartEntity = dim.spawnEntity(entityType, {
      x: spawnLoc.x + (Math.random() * 2 - 1),
      y: spawnLoc.y,
      z: spawnLoc.z + (Math.random() * 2 - 1),
    });
  } catch {
    notifyPlayer(from.owner, "§cCould not spawn rail shipment (chunk not loaded). Resources refunded.");
    from.treasury += cargo.emeralds;
    from.foodStorage += cargo.food;
    rs.iron += (cargo.iron ?? 0);
    rs.gold += (cargo.gold ?? 0);
    rs.coal += (cargo.coal ?? 0);
    rs.wood += (cargo.wood ?? 0);
    rs.stone += (cargo.stone ?? 0);
    rs.diamonds += (cargo.diamonds ?? 0);
    from.troops.cityGuards += (troops.cityGuards ?? 0);
    from.troops.spearmen += (troops.spearmen ?? 0);
    from.troops.archers += (troops.archers ?? 0);
    from.troops.cavalry += (troops.cavalry ?? 0);
    saveVillage(from);
    return false;
  }

  const isMilitary = Object.values(troops).some((v) => (v ?? 0) > 0);
  const cartData: TradeCartData = {
    entityId: cartEntity.id,
    sourceVillageId: fromVillageId,
    destinationVillageId: toVillageId,
    cargo,
    currentPoleIndex: 0,
    isMilitary,
    isRailShipment: true,
  };

  cartEntity.setDynamicProperty("kc:cart_data", JSON.stringify(cartData));
  cartEntity.setDynamicProperty("kc:village_id", fromVillageId);
  cartEntity.nameTag = isMilitary
    ? `🗡 Reinforcements → ${to.name}`
    : `📦 Shipment → ${to.name}`;

  from.activeCarts.push(cartData);
  saveVillage(from);

  const summary = getCargoSummary(cargo);
  notifyPlayer(from.owner, `§aRail shipment dispatched: §b${from.name} → ${to.name}§a [${summary}]`);
  notifyPlayer(to.owner, `§eIncoming rail shipment from §b${from.name}§e! [${summary}]`);
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

    const allEntities = dim.getEntities({
      type: cart.isMilitary && cart.isRailShipment
        ? "kingdoms:military_transport"
        : "kingdoms:trade_cart",
    });
    const entity = allEntities.find((e) => e.id === cart.entityId);

    if (!entity) {
      if (cart.isRailShipment) {
        const summary = getCargoSummary(cart.cargo);
        notifyPlayer(village.owner, `§c⚠ Rail shipment DESTROYED en route to §b${getVillage(cart.destinationVillageId)?.name ?? "unknown"}§c! Cargo lost: [${summary}]`);
      }
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
    const targetLoc = dest.tradeStationLocation ?? dest.townHallLocation;

    if (destPoles.length === 0) {
      moveEntityToward(entity, targetLoc);
      const d = distance(entity.location, targetLoc);
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
  ensureResourceStorage(destVillage);

  destVillage.treasury += cart.cargo.emeralds;
  destVillage.foodStorage += cart.cargo.food;
  destVillage.resourceStorage.iron += (cart.cargo.iron ?? 0);
  destVillage.resourceStorage.gold += (cart.cargo.gold ?? 0);
  destVillage.resourceStorage.coal += (cart.cargo.coal ?? 0);
  destVillage.resourceStorage.wood += (cart.cargo.wood ?? 0);
  destVillage.resourceStorage.stone += (cart.cargo.stone ?? 0);
  destVillage.resourceStorage.diamonds += (cart.cargo.diamonds ?? 0);

  for (const [troopType, count] of Object.entries(cart.cargo.troops ?? {})) {
    const key = troopType as keyof typeof destVillage.troops;
    destVillage.troops[key] = (destVillage.troops[key] ?? 0) + (count ?? 0);
  }

  saveVillage(destVillage);

  entity.remove();
  sourceVillage.activeCarts.splice(cartIndex, 1);
  if (!cart.isRailShipment) {
    sourceVillage.tradeCartCount = Math.max(0, sourceVillage.tradeCartCount - 1);
  }

  const summary = getCargoSummary(cart.cargo);
  const prefix = cart.isRailShipment ? "§a🚂 Rail shipment" : "§aTrade cart";
  notifyPlayer(destVillage.owner, `${prefix} arrived at §b${destVillage.name}§a! [${summary}]`);
  if (destVillage.owner !== sourceVillage.owner) {
    notifyPlayer(sourceVillage.owner, `§aShipment delivered to §b${destVillage.name}§a.`);
  }

  if (!cart.isRailShipment && sourceVillage.tradeCartCount <= 0) {
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
