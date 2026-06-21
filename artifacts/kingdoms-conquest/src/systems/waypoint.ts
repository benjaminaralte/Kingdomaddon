import { world, Player } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import type { VillageData } from "../types/index.js";
import { getAllVillages, saveVillage } from "../storage/index.js";
import { notifyPlayer } from "../utils/notify.js";

export const WAYPOINT_PROP = "kc:waypoint_village_id";

export function registerWaypoint(
  village: VillageData,
  location: { x: number; y: number; z: number }
): boolean {
  if (village.waypointLocation) {
    notifyPlayer(
      village.owner,
      `§c§b${village.name}§c already has a waypoint. Break the existing one to move it.`
    );
    return false;
  }

  village.waypointLocation = location;

  const dim = world.getDimension(village.location.dimension);
  try {
    const entity = dim.spawnEntity("kingdoms:structure_hub", {
      x: location.x + 0.5,
      y: location.y + 1,
      z: location.z + 0.5,
    });
    entity.setDynamicProperty(WAYPOINT_PROP, village.id);
    entity.nameTag = `§b✦ ${village.name}`;
    village.waypointEntityId = entity.id;
  } catch { /* chunk not loaded */ }

  saveVillage(village);
  notifyPlayer(
    village.owner,
    `§a✦ Waypoint registered for §b${village.name}§a! Right-click the marker to teleport to any of your villages.`
  );
  return true;
}

export function removeWaypoint(village: VillageData): void {
  if (village.waypointEntityId) {
    const dim = world.getDimension(village.location.dimension);
    try {
      for (const entityType of ["kingdoms:structure_hub"]) {
        const entities = dim.getEntities({ type: entityType });
        const e = entities.find((x) => x.id === village.waypointEntityId);
        if (e) { e.remove(); break; }
      }
    } catch {}
    village.waypointEntityId = undefined;
  }
  village.waypointLocation = undefined;
  saveVillage(village);
  notifyPlayer(village.owner, `§eWaypoint removed from §b${village.name}§e.`);
}

/** Move all items from the player's inventory into the waypoint chest.
 *  Returns the number of items successfully deposited. */
function depositAllToWaypointChest(player: Player, village: VillageData): void {
  if (!village.waypointLocation) {
    notifyPlayer(player.name, `§cNo waypoint chest found.`);
    return;
  }

  const chestLoc = {
    x: village.waypointLocation.x + 2,
    y: village.waypointLocation.y + 1,
    z: village.waypointLocation.z,
  };

  const dim = world.getDimension(village.location.dimension);
  const chestBlock = dim.getBlock(chestLoc);
  const chestInv = chestBlock?.getComponent("inventory");

  if (!chestInv?.container) {
    notifyPlayer(player.name, `§cWaypoint chest not found — make sure the structure has been built.`);
    return;
  }

  const playerInv = player.getComponent("inventory");
  if (!playerInv?.container) return;

  const playerContainer = playerInv.container;
  const chestContainer = chestInv.container;

  let deposited = 0;
  let noRoom = 0;

  for (let i = 0; i < playerContainer.size; i++) {
    const item = playerContainer.getItem(i);
    if (!item) continue;

    // Try to find a matching stack in chest to stack onto first
    let placed = false;
    for (let c = 0; c < chestContainer.size; c++) {
      const existing = chestContainer.getItem(c);
      if (
        existing &&
        existing.typeId === item.typeId &&
        existing.amount < existing.maxAmount
      ) {
        const space = existing.maxAmount - existing.amount;
        const toMove = Math.min(space, item.amount);
        existing.amount += toMove;
        chestContainer.setItem(c, existing);
        if (toMove >= item.amount) {
          playerContainer.setItem(i, undefined);
          deposited++;
          placed = true;
          break;
        } else {
          item.amount -= toMove;
        }
      }
    }
    if (placed) continue;

    // Find an empty slot
    let foundSlot = false;
    for (let c = 0; c < chestContainer.size; c++) {
      if (!chestContainer.getItem(c)) {
        chestContainer.setItem(c, item);
        playerContainer.setItem(i, undefined);
        deposited++;
        foundSlot = true;
        break;
      }
    }
    if (!foundSlot) noRoom++;
  }

  if (deposited > 0 && noRoom === 0) {
    notifyPlayer(player.name, `§a📦 All items deposited into the waypoint chest.`);
  } else if (deposited > 0 && noRoom > 0) {
    notifyPlayer(player.name, `§e📦 Deposited ${deposited} item(s). §c${noRoom} item(s) didn't fit — chest is full.`);
  } else if (deposited === 0 && noRoom > 0) {
    notifyPlayer(player.name, `§cChest is full — no items could be deposited.`);
  } else {
    notifyPlayer(player.name, `§7Your inventory is already empty.`);
  }
}

/** Pull all items from the waypoint chest back into the player's inventory. */
function collectAllFromWaypointChest(player: Player, village: VillageData): void {
  if (!village.waypointLocation) {
    notifyPlayer(player.name, `§cNo waypoint chest found.`);
    return;
  }

  const chestLoc = {
    x: village.waypointLocation.x + 2,
    y: village.waypointLocation.y + 1,
    z: village.waypointLocation.z,
  };

  const dim = world.getDimension(village.location.dimension);
  const chestBlock = dim.getBlock(chestLoc);
  const chestInv = chestBlock?.getComponent("inventory");

  if (!chestInv?.container) {
    notifyPlayer(player.name, `§cWaypoint chest not found — make sure the structure has been built.`);
    return;
  }

  const playerInv = player.getComponent("inventory");
  if (!playerInv?.container) return;

  const playerContainer = playerInv.container;
  const chestContainer = chestInv.container;

  let collected = 0;
  let noRoom = 0;

  for (let c = 0; c < chestContainer.size; c++) {
    const item = chestContainer.getItem(c);
    if (!item) continue;

    // Try stacking onto existing matching stacks in player inventory first
    let placed = false;
    for (let i = 0; i < playerContainer.size; i++) {
      const existing = playerContainer.getItem(i);
      if (
        existing &&
        existing.typeId === item.typeId &&
        existing.amount < existing.maxAmount
      ) {
        const space = existing.maxAmount - existing.amount;
        const toMove = Math.min(space, item.amount);
        existing.amount += toMove;
        playerContainer.setItem(i, existing);
        if (toMove >= item.amount) {
          chestContainer.setItem(c, undefined);
          collected++;
          placed = true;
          break;
        } else {
          item.amount -= toMove;
        }
      }
    }
    if (placed) continue;

    // Find an empty player slot
    let foundSlot = false;
    for (let i = 0; i < playerContainer.size; i++) {
      if (!playerContainer.getItem(i)) {
        playerContainer.setItem(i, item);
        chestContainer.setItem(c, undefined);
        collected++;
        foundSlot = true;
        break;
      }
    }
    if (!foundSlot) noRoom++;
  }

  if (collected > 0 && noRoom === 0) {
    notifyPlayer(player.name, `§a📦 All items collected from the waypoint chest.`);
  } else if (collected > 0 && noRoom > 0) {
    notifyPlayer(player.name, `§e📦 Collected ${collected} item(s). §c${noRoom} item(s) didn't fit — your inventory is full.`);
  } else if (collected === 0 && noRoom > 0) {
    notifyPlayer(player.name, `§cInventory is full — no items could be collected.`);
  } else {
    notifyPlayer(player.name, `§7The chest is already empty.`);
  }
}

export async function showWaypointMenu(player: Player, currentVillage?: VillageData): Promise<void> {
  const destinations = getAllVillages().filter(
    (v) => v.owner === player.name && v.waypointLocation
  );

  const hasChest = !!(currentVillage?.waypointLocation);

  if (destinations.length === 0 && !hasChest) {
    notifyPlayer(
      player.name,
      `§cNo waypoints found. Place a §bVillage Waypoint§c block inside your village first.`
    );
    return;
  }

  const form = new ActionFormData()
    .title("§b✦ Village Waypoints")
    .body(
      `§7${destinations.length} waypoint(s) registered.\n§fSelect a destination to teleport to, or manage the chest:`
    );

  // Chest buttons — always first if we're at a waypoint with a chest
  if (hasChest) {
    form.button(`§6📦 Deposit All to Chest\n§7Sweep your inventory into the chest`);
    form.button(`§a📥 Collect All from Chest\n§7Pull everything back into your inventory`);
  }

  for (const v of destinations) {
    const loc = v.waypointLocation!;
    form.button(`§b${v.name}\n§7${Math.round(loc.x)}, ${Math.round(loc.y)}, ${Math.round(loc.z)}`);
  }
  form.button("§7Cancel");

  const response = await form.show(player);
  if (response.canceled || response.selection === undefined) return;

  let selection = response.selection;

  // Chest actions (2 buttons when hasChest)
  if (hasChest) {
    if (selection === 0) {
      depositAllToWaypointChest(player, currentVillage!);
      return;
    }
    if (selection === 1) {
      collectAllFromWaypointChest(player, currentVillage!);
      return;
    }
    selection -= 2; // shift index past both chest buttons
  }

  // Cancel button
  if (selection >= destinations.length) return;

  const dest = destinations[selection];
  const loc = dest.waypointLocation!;

  const inventory = player.getComponent("inventory");
  if (inventory?.container) {
    const container = inventory.container;
    let hasItems = false;
    for (let i = 0; i < container.size; i++) {
      const item = container.getItem(i);
      if (item) { hasItems = true; break; }
    }
    if (hasItems) {
      notifyPlayer(
        player.name,
        `§c✦ Waypoint travel requires an empty inventory! Use the §bchest§c beside the waypoint to store your items first.`
      );
      return;
    }
  }

  try {
    const dim = world.getDimension(dest.location.dimension);
    player.teleport(
      { x: loc.x + 0.5, y: loc.y + 1, z: loc.z + 0.5 },
      { dimension: dim }
    );
    notifyPlayer(player.name, `§a✦ Teleported to §b${dest.name}§a!`);
  } catch {
    notifyPlayer(player.name, `§cTeleport failed — chunk may not be loaded.`);
  }
}
