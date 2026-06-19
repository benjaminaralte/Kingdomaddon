import { world, EntityInventoryComponent } from "@minecraft/server";
import type { VillageData, TradeCartData, TradeCartCargo, ResourceStorage } from "../types/index.js";
import { getVillage, saveVillage, getAllVillages } from "../storage/index.js";
import { notifyPlayer } from "../utils/notify.js";
import { getCargoSummary, ensureResourceStorage } from "./tradeStation.js";
import { FOOD_ITEM_VALUES } from "./harvest.js";

// ── Constants ─────────────────────────────────────────────────────────────────

const TRADE_STATION_DETECT_RADIUS = 5;
const STATION_TICK_INTERVAL = 40;
let lastStationTick = 0;

// Maps vanilla item IDs to trade station resources.
// Players can load these into a chest minecart and send it via rails.
const ITEM_RESOURCE_MAP: Record<string, { target: "treasury" | keyof ResourceStorage }> = {
  "minecraft:emerald":           { target: "treasury" },
  "minecraft:iron_ingot":        { target: "iron" },
  "minecraft:gold_ingot":        { target: "gold" },
  "minecraft:coal":              { target: "coal" },
  "minecraft:charcoal":          { target: "coal" },
  "minecraft:oak_log":           { target: "wood" },
  "minecraft:spruce_log":        { target: "wood" },
  "minecraft:birch_log":         { target: "wood" },
  "minecraft:jungle_log":        { target: "wood" },
  "minecraft:acacia_log":        { target: "wood" },
  "minecraft:dark_oak_log":      { target: "wood" },
  "minecraft:mangrove_log":      { target: "wood" },
  "minecraft:stone":             { target: "stone" },
  "minecraft:cobblestone":       { target: "stone" },
  "minecraft:diamond":           { target: "diamonds" },
};

// ── Immediate Transfer (no rails needed, e.g. allied villages) ─────────────────

/**
 * Immediately transfers cargo between two villages owned by the same player.
 * No trade station or rails required — used by village management menus.
 */
export function sendTradeCart(
  fromVillageId: string,
  toVillageId: string,
  cargo: TradeCartCargo
): boolean {
  const from = getVillage(fromVillageId);
  const to = getVillage(toVillageId);
  if (!from || !to) return false;

  if (from.treasury < cargo.emeralds) {
    notifyPlayer(from.owner, `§cNot enough emeralds. Have: ${from.treasury}, Need: ${cargo.emeralds}.`);
    return false;
  }
  if (from.foodStorage < cargo.food) {
    notifyPlayer(from.owner, `§cNot enough food. Have: ${from.foodStorage}, Need: ${cargo.food}.`);
    return false;
  }

  from.treasury -= cargo.emeralds;
  from.foodStorage -= cargo.food;

  ensureResourceStorage(to);
  to.treasury += cargo.emeralds;
  to.foodStorage += cargo.food;

  saveVillage(from);
  saveVillage(to);

  const summary = getCargoSummary(cargo);
  notifyPlayer(from.owner, `§a📦 Transfer sent to §b${to.name}§a. [${summary}]`);
  if (to.owner !== from.owner) {
    notifyPlayer(to.owner, `§a📦 Transfer received from §b${from.name}§a! [${summary}]`);
  }
  return true;
}

// ── Rail Shipment (real minecart on player-built rails) ───────────────────────

/**
 * Deducts resources from the source village, then spawns a tagged
 * minecraft:chest_minecart at the source trade station.
 * The player physically pushes it onto rails toward the destination.
 * When the minecart arrives within range of the destination trade station,
 * tickTradeStations() automatically delivers the cargo.
 */
export function sendRailShipment(
  fromVillageId: string,
  toVillageId: string,
  cargo: TradeCartCargo
): boolean {
  const from = getVillage(fromVillageId);
  const to = getVillage(toVillageId);
  if (!from || !to) return false;

  if (!from.hasTradeStation) {
    notifyPlayer(from.owner, `§c§b${from.name}§c has no Trade Station.`);
    return false;
  }
  if (!to.hasTradeStation) {
    notifyPlayer(from.owner, `§c§b${to.name}§c has no Trade Station to receive shipments.`);
    return false;
  }

  // ── Validate ──────────────────────────────────────────────────────────────
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
  if ((cargo.iron    ?? 0) > rs.iron)     { notifyPlayer(from.owner, `§cNot enough Iron.`);     return false; }
  if ((cargo.gold    ?? 0) > rs.gold)     { notifyPlayer(from.owner, `§cNot enough Gold.`);     return false; }
  if ((cargo.coal    ?? 0) > rs.coal)     { notifyPlayer(from.owner, `§cNot enough Coal.`);     return false; }
  if ((cargo.wood    ?? 0) > rs.wood)     { notifyPlayer(from.owner, `§cNot enough Wood.`);     return false; }
  if ((cargo.stone   ?? 0) > rs.stone)    { notifyPlayer(from.owner, `§cNot enough Stone.`);    return false; }
  if ((cargo.diamonds ?? 0) > rs.diamonds){ notifyPlayer(from.owner, `§cNot enough Diamonds.`); return false; }

  const troops = cargo.troops ?? {};
  if ((troops.cityGuards ?? 0) > from.troops.cityGuards) { notifyPlayer(from.owner, `§cNot enough City Guards.`);  return false; }
  if ((troops.spearmen   ?? 0) > from.troops.spearmen)   { notifyPlayer(from.owner, `§cNot enough Spearmen.`);    return false; }
  if ((troops.archers    ?? 0) > from.troops.archers)    { notifyPlayer(from.owner, `§cNot enough Archers.`);     return false; }
  if ((troops.cavalry    ?? 0) > from.troops.cavalry)    { notifyPlayer(from.owner, `§cNot enough Cavalry.`);     return false; }

  // ── Deduct ────────────────────────────────────────────────────────────────
  from.treasury    -= cargo.emeralds;
  from.foodStorage -= cargo.food;
  rs.iron     -= (cargo.iron     ?? 0);
  rs.gold     -= (cargo.gold     ?? 0);
  rs.coal     -= (cargo.coal     ?? 0);
  rs.wood     -= (cargo.wood     ?? 0);
  rs.stone    -= (cargo.stone    ?? 0);
  rs.diamonds -= (cargo.diamonds ?? 0);
  from.troops.cityGuards -= (troops.cityGuards ?? 0);
  from.troops.spearmen   -= (troops.spearmen   ?? 0);
  from.troops.archers    -= (troops.archers    ?? 0);
  from.troops.cavalry    -= (troops.cavalry    ?? 0);

  // ── Spawn chest minecart at source trade station ──────────────────────────
  const dim = world.getDimension(from.location.dimension);
  const spawnLoc = from.tradeStationLocation ?? from.townHallLocation;

  let cartEntity;
  try {
    cartEntity = dim.spawnEntity("minecraft:chest_minecart", {
      x: spawnLoc.x + 0.5,
      y: spawnLoc.y + 0.5,
      z: spawnLoc.z + 0.5,
    });
  } catch {
    // Refund everything
    from.treasury    += cargo.emeralds;
    from.foodStorage += cargo.food;
    rs.iron     += (cargo.iron     ?? 0);
    rs.gold     += (cargo.gold     ?? 0);
    rs.coal     += (cargo.coal     ?? 0);
    rs.wood     += (cargo.wood     ?? 0);
    rs.stone    += (cargo.stone    ?? 0);
    rs.diamonds += (cargo.diamonds ?? 0);
    from.troops.cityGuards += (troops.cityGuards ?? 0);
    from.troops.spearmen   += (troops.spearmen   ?? 0);
    from.troops.archers    += (troops.archers    ?? 0);
    from.troops.cavalry    += (troops.cavalry    ?? 0);
    saveVillage(from);
    notifyPlayer(from.owner, "§cCould not spawn minecart (chunk not loaded). Resources refunded.");
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
  cartEntity.nameTag = isMilitary ? `🗡 → ${to.name}` : `📦 → ${to.name}`;

  from.activeCarts.push(cartData);
  saveVillage(from);

  const summary = getCargoSummary(cargo);
  notifyPlayer(
    from.owner,
    `§a📦 Shipment ready! Push the §bchest minecart§a at §b${from.name}§a's trade station along rails to §b${to.name}§a. [${summary}]`
  );
  notifyPlayer(to.owner, `§e🚂 Incoming shipment from §b${from.name}§e! [${summary}]`);
  return true;
}

// ── Trade Station Detector ─────────────────────────────────────────────────────

/**
 * Runs every 40 ticks. For each village with a trade station, scans for any
 * minecraft:chest_minecart within TRADE_STATION_DETECT_RADIUS blocks.
 *
 * Two delivery modes:
 *   1. KC-tagged minecart (sent via sendRailShipment) — delivers virtual cargo
 *   2. Untagged player minecart — extracts actual items from its chest inventory
 */
export function tickTradeStations(currentTick: number): void {
  if (currentTick - lastStationTick < STATION_TICK_INTERVAL) return;
  lastStationTick = currentTick;

  for (const village of getAllVillages()) {
    if (!village.hasTradeStation || !village.tradeStationLocation) continue;
    processArrivingMinecarts(village);
  }
}

function processArrivingMinecarts(village: VillageData): void {
  const dim = world.getDimension(village.location.dimension);
  const stationLoc = village.tradeStationLocation!;

  let minecarts;
  try {
    minecarts = dim.getEntities({
      type: "minecraft:chest_minecart",
      location: stationLoc,
      maxDistance: TRADE_STATION_DETECT_RADIUS,
    });
  } catch {
    return;
  }

  let changed = false;

  for (const cart of minecarts) {
    const cartDataRaw = cart.getDynamicProperty("kc:cart_data") as string | undefined;

    if (cartDataRaw) {
      // KC-tagged: deliver virtual cargo
      try {
        const cartData = JSON.parse(cartDataRaw) as TradeCartData;
        if (deliverTaggedMinecart(cartData, village, cart)) changed = true;
      } catch {
        // Malformed data — treat as untagged
        if (extractUntaggedMinecart(cart, village)) changed = true;
      }
    } else {
      // Player's own minecart — read its actual chest inventory
      if (extractUntaggedMinecart(cart, village)) changed = true;
    }
  }

  if (changed) saveVillage(village);
}

function deliverTaggedMinecart(
  cartData: TradeCartData,
  destVillage: VillageData,
  cartEntity: import("@minecraft/server").Entity
): boolean {
  ensureResourceStorage(destVillage);
  const { cargo } = cartData;

  destVillage.treasury        += cargo.emeralds;
  destVillage.foodStorage     += cargo.food;
  destVillage.resourceStorage.iron     += (cargo.iron     ?? 0);
  destVillage.resourceStorage.gold     += (cargo.gold     ?? 0);
  destVillage.resourceStorage.coal     += (cargo.coal     ?? 0);
  destVillage.resourceStorage.wood     += (cargo.wood     ?? 0);
  destVillage.resourceStorage.stone    += (cargo.stone    ?? 0);
  destVillage.resourceStorage.diamonds += (cargo.diamonds ?? 0);

  for (const [troopType, count] of Object.entries(cargo.troops ?? {})) {
    const key = troopType as keyof typeof destVillage.troops;
    destVillage.troops[key] = (destVillage.troops[key] ?? 0) + (count ?? 0);
  }

  // Remove from source village's active carts list
  const srcVillage = getVillage(cartData.sourceVillageId);
  if (srcVillage) {
    srcVillage.activeCarts = srcVillage.activeCarts.filter((c) => c.entityId !== cartData.entityId);
    saveVillage(srcVillage);
  }

  try { cartEntity.remove(); } catch { /* already gone */ }

  const summary = getCargoSummary(cargo);
  const prefix = cartData.isMilitary ? "§a🗡 Reinforcements" : "§a📦 Shipment";
  notifyPlayer(destVillage.owner, `${prefix} arrived at §b${destVillage.name}§a! [${summary}]`);
  if (srcVillage && srcVillage.owner !== destVillage.owner) {
    notifyPlayer(srcVillage.owner, `§a📦 Shipment delivered to §b${destVillage.name}§a.`);
  }
  return true;
}

function extractUntaggedMinecart(
  cart: import("@minecraft/server").Entity,
  village: VillageData
): boolean {
  const inv = cart.getComponent(EntityInventoryComponent.componentId) as EntityInventoryComponent | undefined;
  if (!inv?.container) return false;

  ensureResourceStorage(village);
  const rs = village.resourceStorage;
  const received: string[] = [];

  for (let i = 0; i < inv.container.size; i++) {
    const item = inv.container.getItem(i);
    if (!item || item.amount === 0) continue;

    const mapping = ITEM_RESOURCE_MAP[item.typeId];
    const foodValue = FOOD_ITEM_VALUES[item.typeId];

    if (mapping) {
      if (mapping.target === "treasury") {
        village.treasury += item.amount;
        received.push(`${item.amount}💎`);
      } else {
        (rs as unknown as Record<string, number>)[mapping.target] += item.amount;
        received.push(`${item.amount} ${mapping.target}`);
      }
    } else if (foodValue !== undefined && foodValue >= 0) {
      const units = item.amount * foodValue;
      village.foodStorage += units;
      received.push(`${units}🌾`);
    }
  }

  if (received.length === 0) return false;

  try { cart.remove(); } catch { /* already gone */ }

  notifyPlayer(
    village.owner,
    `§a🚂 Minecart arrived at §b${village.name}§a's trade station! Received: ${received.join(", ")}`
  );
  return true;
}
