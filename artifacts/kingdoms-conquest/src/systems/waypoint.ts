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

export async function showWaypointMenu(player: Player): Promise<void> {
  const destinations = getAllVillages().filter(
    (v) => v.owner === player.name && v.waypointLocation
  );

  if (destinations.length === 0) {
    notifyPlayer(
      player.name,
      `§cNo waypoints found. Place a §bVillage Waypoint§c block inside your village first.`
    );
    return;
  }

  const form = new ActionFormData()
    .title("§b✦ Village Waypoints")
    .body(
      `§7${destinations.length} waypoint(s) registered.\n§fSelect a destination to teleport to:`
    );

  for (const v of destinations) {
    const loc = v.waypointLocation!;
    form.button(`§b${v.name}\n§7${Math.round(loc.x)}, ${Math.round(loc.y)}, ${Math.round(loc.z)}`);
  }
  form.button("§7Cancel");

  const response = await form.show(player);
  if (response.canceled || response.selection === undefined) return;
  if (response.selection >= destinations.length) return;

  const dest = destinations[response.selection];
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
