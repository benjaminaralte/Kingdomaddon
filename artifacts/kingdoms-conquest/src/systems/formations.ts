/**
 * formations.ts
 *
 * Tactical formation system for player-owned troops.
 *
 * The player right-clicks a Tactics Horn to open a menu.
 * Each preset:
 *   1. Finds all owned troops of the relevant type within SEARCH_RADIUS.
 *   2. Computes formation positions relative to player location + facing.
 *   3. Teleports troops to those positions.
 *   4. Tags each troop with its formation mode + index (for HOLD modes only).
 *
 * HOLD modes re-enforce positions every HOLD_TICK_INTERVAL ticks so troops
 * stay in formation even while fighting.  LAUNCH modes place once then let AI run.
 */

import { world, system } from "@minecraft/server";
import type { Entity, Player, Vector3 } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { notifyPlayer } from "../utils/notify.js";

// ── Tunables ─────────────────────────────────────────────────────────────────

const SEARCH_RADIUS          = 48;   // blocks — how far we look for owned troops
const HOLD_TICK_INTERVAL     = 20;   // ticks between position re-enforcement
const LINE_SPACING           = 2.5;  // blocks between troops in a line
const LINE_FORWARD_DIST      = 5;    // blocks ahead of player for line formations
const PERIMETER_RADIUS       = 6;    // blocks for perimeter ring
const BODYGUARD_RADIUS       = 3;    // blocks for tight bodyguard ring
const VANGUARD_FORWARD       = 4;    // blocks ahead for vanguard
const FLANK_LATERAL          = 8;    // blocks left/right for mountedArcher flanks
const ARC_BACK_DIST          = 8;    // blocks behind for archer arc
const ARC_SPACING            = 3;    // spacing for archer arc
const ESCORT_LATERAL         = 3;    // blocks to side for mountedArcher escort
const SCATTER_RADIUS         = 10;   // radius for scatter formation
const RALLY_RADIUS           = 4;    // radius for rally

// ── Formation mode identifiers ────────────────────────────────────────────────

type FormationMode =
  | "spear_line_attack"
  | "spear_line_hold"
  | "spear_perimeter"
  | "cavalry_flanks"
  | "cavalry_escort"
  | "archer_arc"
  | "archer_scatter"
  | "heavy_vanguard"
  | "heavy_bodyguard"
  | "all_rally";

/** Modes that re-enforce position every HOLD_TICK_INTERVAL ticks. */
const HOLD_MODES = new Set<FormationMode>([
  "spear_line_hold",
  "spear_perimeter",
  "cavalry_escort",
  "heavy_vanguard",
  "heavy_bodyguard",
]);

/** Which entity types each formation targets. */
const FORMATION_TARGETS: Record<FormationMode, string[]> = {
  spear_line_attack: ["kingdoms:spearman"],
  spear_line_hold:   ["kingdoms:spearman"],
  spear_perimeter:   ["kingdoms:spearman"],
  cavalry_flanks:    ["kingdoms:cavalry", "kingdoms:mercenary_lancer"],
  cavalry_escort:    ["kingdoms:cavalry", "kingdoms:mercenary_lancer"],
  archer_arc:        ["kingdoms:archer"],
  archer_scatter:    ["kingdoms:archer"],
  heavy_vanguard:    ["kingdoms:heavy_knight", "kingdoms:samurai", "kingdoms:legionary"],
  heavy_bodyguard:   ["kingdoms:heavy_knight", "kingdoms:samurai", "kingdoms:legionary"],
  all_rally: [
    "kingdoms:spearman", "kingdoms:cavalry", "kingdoms:mercenary_lancer",
    "kingdoms:archer", "kingdoms:heavy_knight", "kingdoms:samurai",
    "kingdoms:legionary", "kingdoms:city_guard",
  ],
};

// ── Dynamic-property keys ─────────────────────────────────────────────────────

const PROP_F_MODE  = "kc:formation_mode";   // string
const PROP_F_INDEX = "kc:formation_index";  // number
const PROP_F_OWNER = "kc:formation_owner";  // string (player name)

// ── Vector helpers ────────────────────────────────────────────────────────────

function xzNorm(v: Vector3): { x: number; z: number } {
  const len = Math.sqrt(v.x * v.x + v.z * v.z) || 1;
  return { x: v.x / len, z: v.z / len };
}

function right90(f: { x: number; z: number }): { x: number; z: number } {
  return { x: f.z, z: -f.x };
}

// ── Position computation ──────────────────────────────────────────────────────

function computePositions(
  mode: FormationMode,
  base: Vector3,
  viewDir: Vector3,
  count: number
): Vector3[] {
  const fwd = xzNorm(viewDir);
  const rgt = right90(fwd);
  const positions: Vector3[] = [];

  switch (mode) {

    case "spear_line_attack":
    case "spear_line_hold": {
      // Horizontal line in front of the player
      for (let i = 0; i < count; i++) {
        const offset = (i - (count - 1) / 2) * LINE_SPACING;
        positions.push({
          x: base.x + fwd.x * LINE_FORWARD_DIST + rgt.x * offset,
          y: base.y,
          z: base.z + fwd.z * LINE_FORWARD_DIST + rgt.z * offset,
        });
      }
      break;
    }

    case "spear_perimeter": {
      // Equally spaced ring around the player
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        positions.push({
          x: base.x + Math.cos(angle) * PERIMETER_RADIUS,
          y: base.y,
          z: base.z + Math.sin(angle) * PERIMETER_RADIUS,
        });
      }
      break;
    }

    case "cavalry_flanks": {
      // Split evenly — left half on left, right half on right
      const half = Math.ceil(count / 2);
      for (let i = 0; i < count; i++) {
        const side   = i < half ? -1 : 1;
        const depth  = (i < half ? i : i - half) * 2;
        positions.push({
          x: base.x + rgt.x * side * FLANK_LATERAL + fwd.x * depth,
          y: base.y,
          z: base.z + rgt.z * side * FLANK_LATERAL + fwd.z * depth,
        });
      }
      break;
    }

    case "cavalry_escort": {
      // Alternating left / right alongside player
      for (let i = 0; i < count; i++) {
        const side  = i % 2 === 0 ? -1 : 1;
        const depth = Math.floor(i / 2) * 2;
        positions.push({
          x: base.x + rgt.x * side * ESCORT_LATERAL + fwd.x * depth,
          y: base.y,
          z: base.z + rgt.z * side * ESCORT_LATERAL + fwd.z * depth,
        });
      }
      break;
    }

    case "archer_arc": {
      // Arc behind and spread — archers stay back and fire over the line
      for (let i = 0; i < count; i++) {
        const offset = (i - (count - 1) / 2) * ARC_SPACING;
        positions.push({
          x: base.x - fwd.x * ARC_BACK_DIST + rgt.x * offset,
          y: base.y,
          z: base.z - fwd.z * ARC_BACK_DIST + rgt.z * offset,
        });
      }
      break;
    }

    case "archer_scatter": {
      // Spread widely at range — autonomous fire
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        positions.push({
          x: base.x + Math.cos(angle) * SCATTER_RADIUS,
          y: base.y,
          z: base.z + Math.sin(angle) * SCATTER_RADIUS,
        });
      }
      break;
    }

    case "heavy_vanguard": {
      // Tight line slightly in front — heavy troops absorb hits for player
      for (let i = 0; i < count; i++) {
        const offset = (i - (count - 1) / 2) * 2;
        positions.push({
          x: base.x + fwd.x * VANGUARD_FORWARD + rgt.x * offset,
          y: base.y,
          z: base.z + fwd.z * VANGUARD_FORWARD + rgt.z * offset,
        });
      }
      break;
    }

    case "heavy_bodyguard": {
      // Tight protective ring directly around the player
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        positions.push({
          x: base.x + Math.cos(angle) * BODYGUARD_RADIUS,
          y: base.y,
          z: base.z + Math.sin(angle) * BODYGUARD_RADIUS,
        });
      }
      break;
    }

    case "all_rally": {
      // Scatter within a small radius near the player
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const r = RALLY_RADIUS + (i % 3);
        positions.push({
          x: base.x + Math.cos(angle) * r,
          y: base.y,
          z: base.z + Math.sin(angle) * r,
        });
      }
      break;
    }
  }

  return positions;
}

// ── Troop finder ──────────────────────────────────────────────────────────────

function findOwnedTroops(player: Player, entityTypes: string[]): Entity[] {
  const dim     = player.dimension;
  const loc     = player.location;
  const found: Entity[] = [];
  for (const entityType of entityTypes) {
    try {
      const entities = dim.getEntities({ type: entityType, location: loc, maxDistance: SEARCH_RADIUS });
      for (const e of entities) {
        if (e.getDynamicProperty("kc:owner") === player.name) {
          found.push(e);
        }
      }
    } catch { /* chunk unloaded */ }
  }
  return found;
}

function clearFormationTag(entity: Entity): void {
  try { entity.setDynamicProperty(PROP_F_MODE, ""); } catch { }
}

function applyFormation(player: Player, mode: FormationMode): number {
  const troops = findOwnedTroops(player, FORMATION_TARGETS[mode]);
  if (troops.length === 0) return 0;

  const positions = computePositions(
    mode,
    player.location,
    player.getViewDirection(),
    troops.length
  );

  const isHold = HOLD_MODES.has(mode);

  troops.forEach((troop, i) => {
    const pos = positions[i];
    if (!pos) return;
    try {
      troop.teleport(pos, { dimension: player.dimension });
    } catch { /* entity removed */ }

    if (isHold) {
      try {
        troop.setDynamicProperty(PROP_F_MODE,  mode as string);
        troop.setDynamicProperty(PROP_F_INDEX, i);
        troop.setDynamicProperty(PROP_F_OWNER, player.name);
      } catch { /* entity removed */ }
    } else {
      clearFormationTag(troop);
    }
  });

  return troops.length;
}

function dismissAllFormations(player: Player): number {
  const all = findOwnedTroops(player, FORMATION_TARGETS["all_rally"]);
  for (const e of all) clearFormationTag(e);
  return all.length;
}

// ── Hold-mode tick enforcement ────────────────────────────────────────────────

export function tickFormations(currentTick: number): void {
  if (currentTick % HOLD_TICK_INTERVAL !== 0) return;

  for (const player of world.getPlayers()) {
    // Gather all troops in a hold formation owned by this player
    for (const entityTypes of Object.values(FORMATION_TARGETS)) {
      try {
        const dim     = player.dimension;
        const loc     = player.location;
        const viewDir = player.getViewDirection();

        // Group entities by their formation mode to batch-compute positions
        const groups = new Map<string, Entity[]>();

        for (const entityType of entityTypes) {
          try {
            const entities = dim.getEntities({
              type: entityType,
              location: loc,
              maxDistance: SEARCH_RADIUS * 2,
            });
            for (const e of entities) {
              if (e.getDynamicProperty(PROP_F_OWNER) !== player.name) continue;
              const mode = e.getDynamicProperty(PROP_F_MODE) as string | undefined;
              if (!mode || !HOLD_MODES.has(mode as FormationMode)) continue;
              if (!groups.has(mode)) groups.set(mode, []);
              groups.get(mode)!.push(e);
            }
          } catch { /* chunk unloaded */ }
        }

        for (const [mode, troops] of groups) {
          const positions = computePositions(
            mode as FormationMode,
            loc,
            viewDir,
            troops.length
          );
          troops.forEach((troop, i) => {
            const idx = (troop.getDynamicProperty(PROP_F_INDEX) as number | undefined) ?? i;
            const pos = positions[idx] ?? positions[i];
            if (!pos) return;
            try { troop.teleport(pos, { dimension: dim }); } catch { /* entity removed */ }
          });
        }
      } catch { /* player dimension error */ }
    }
  }
}

// ── Menu ──────────────────────────────────────────────────────────────────────

const MENU_COOLDOWN_MS = 500;
const lastMenuTime = new Map<string, number>();

export function openTacticsMenu(player: Player): void {
  const now = Date.now();
  const last = lastMenuTime.get(player.name) ?? 0;
  if (now - last < MENU_COOLDOWN_MS) return;
  lastMenuTime.set(player.name, now);
  void showMainMenu(player);
}

async function showMainMenu(player: Player): Promise<void> {
  const form = new ActionFormData()
    .title("⚔ Tactical Command")
    .body("§7Choose a unit type to issue orders to your nearby troops.\n§8Range: 48 blocks · Only your deployed soldiers respond.")
    .button("🗡 Spearmen Tactics")
    .button("🐴 Mounted Archer / Lancer Tactics")
    .button("🏹 Archer Tactics")
    .button("🛡 Heavy Infantry Tactics")
    .button("🔔 Rally All Troops")
    .button("✖ Dismiss All Formations");

  const resp = await form.show(player);
  if (resp.canceled) return;

  switch (resp.selection) {
    case 0: await showSpearmenMenu(player); break;
    case 1: await showMountedArcherMenu(player);  break;
    case 2: await showArcherMenu(player);   break;
    case 3: await showHeavyMenu(player);    break;
    case 4: {
      const n = applyFormation(player, "all_rally");
      if (n === 0) notifyPlayer(player.name, "§eNo deployed troops nearby to rally.");
      else notifyPlayer(player.name, `§a🔔 §f${n}§a troop${n > 1 ? "s" : ""} rallied to your position!`);
      break;
    }
    case 5: {
      const n = dismissAllFormations(player);
      if (n === 0) notifyPlayer(player.name, "§eNo troops in formation nearby.");
      else notifyPlayer(player.name, `§e✖ Formations dismissed. §f${n}§e troop${n > 1 ? "s" : ""} released.`);
      break;
    }
  }
}

async function showSpearmenMenu(player: Player): Promise<void> {
  const form = new ActionFormData()
    .title("🗡 Spearmen Tactics")
    .body(
      "§eSpearmen excel in defensive lines and perimeter control.\n\n" +
      "§f▶ Line + Attack §7— Line up ahead of you, then charge enemies.\n" +
      "§f▶ Line + Hold §7— Hold a defensive line. Re-enforced every second.\n" +
      "§f▶ Perimeter §7— Ring of pikes around you. Ideal vs. surrounded attacks.\n" +
      "§8Counter-charge: Spearmen deal §c+6 damage §8back to charging mountedArcher!"
    )
    .button("⚔ Line Formation — Attack")
    .button("🛡 Line Formation — Hold")
    .button("🔄 Perimeter Defense")
    .button("← Back");

  const resp = await form.show(player);
  if (resp.canceled) return;

  switch (resp.selection) {
    case 0: issueOrder(player, "spear_line_attack", "§aSpearmen advance in line!"); break;
    case 1: issueOrder(player, "spear_line_hold",   "§aSpearmen holding the line!"); break;
    case 2: issueOrder(player, "spear_perimeter",   "§aSpearmen forming perimeter!"); break;
    case 3: await showMainMenu(player); break;
  }
}

async function showMountedArcherMenu(player: Player): Promise<void> {
  const form = new ActionFormData()
    .title("🐴 Mounted Archer / Lancer Tactics")
    .body(
      "§eMounted units are fast and devastating on the charge.\n\n" +
      "§f▶ Charge Flanks §7— Split left & right, then unleash AI. Best for open battles.\n" +
      "§f▶ Escort §7— Ride alongside you. Re-enforced. Great for moving through enemy territory.\n" +
      "§8Charge bonus: §6+5 dmg §8(Mounted Archer) / §6+8 dmg §8(Lancer) + knockback on first hit after gallop."
    )
    .button("⚡ Charge Flanks")
    .button("🐎 Escort Formation")
    .button("← Back");

  const resp = await form.show(player);
  if (resp.canceled) return;

  switch (resp.selection) {
    case 0: issueOrder(player, "cavalry_flanks",  "§aMounted Archer splitting to flanks!"); break;
    case 1: issueOrder(player, "cavalry_escort",  "§aMounted Archer moving to escort position!"); break;
    case 2: await showMainMenu(player); break;
  }
}

async function showArcherMenu(player: Player): Promise<void> {
  const form = new ActionFormData()
    .title("🏹 Archer Tactics")
    .body(
      "§eArchers deal sustained ranged damage from a distance.\n\n" +
      "§f▶ Ranged Arc §7— Arched line behind you, firing over your front line.\n" +
      "§f▶ Scatter & Cover §7— Spread wide around the battlefield."
    )
    .button("🏹 Ranged Arc")
    .button("🌐 Scatter & Cover")
    .button("← Back");

  const resp = await form.show(player);
  if (resp.canceled) return;

  switch (resp.selection) {
    case 0: issueOrder(player, "archer_arc",     "§aArchers forming ranged arc!"); break;
    case 1: issueOrder(player, "archer_scatter", "§aArchers scattering to cover positions!"); break;
    case 2: await showMainMenu(player); break;
  }
}

async function showHeavyMenu(player: Player): Promise<void> {
  const form = new ActionFormData()
    .title("🛡 Heavy Infantry Tactics")
    .body(
      "§eHeavy Knights, Samurai & Legionaries are elite front-line fighters.\n\n" +
      "§f▶ Vanguard §7— Form a wall just ahead of you. Re-enforced. Ideal for sieges.\n" +
      "§f▶ Bodyguard §7— Tight ring around you. Re-enforced. Maximum personal protection."
    )
    .button("⚔ Vanguard Line")
    .button("🛡 Bodyguard Ring")
    .button("← Back");

  const resp = await form.show(player);
  if (resp.canceled) return;

  switch (resp.selection) {
    case 0: issueOrder(player, "heavy_vanguard",  "§aHeavy infantry moving to vanguard!"); break;
    case 1: issueOrder(player, "heavy_bodyguard", "§aElite guard forming bodyguard ring!"); break;
    case 2: await showMainMenu(player); break;
  }
}

function issueOrder(player: Player, mode: FormationMode, successMsg: string): void {
  system.run(() => {
    const n = applyFormation(player, mode);
    if (n === 0) {
      const targets = FORMATION_TARGETS[mode];
      const label   = targets.map((t) => t.replace("kingdoms:", "").replace(/_/g, " ")).join(", ");
      notifyPlayer(player.name, `§eNo ${label} found within ${SEARCH_RADIUS} blocks.`);
    } else {
      notifyPlayer(player.name, `${successMsg} §f(${n} unit${n > 1 ? "s" : ""})`);
    }
  });
}
