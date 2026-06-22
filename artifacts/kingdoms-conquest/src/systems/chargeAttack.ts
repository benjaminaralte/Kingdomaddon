/**
 * chargeAttack.ts
 *
 * Charge mechanic for mounted units (Cavalry & Mercenary Lancer).
 *
 * How it works:
 *  - Every VELOCITY_CHECK_INTERVAL ticks, all live cavalry / lancer entities
 *    have their horizontal velocity sampled.
 *  - If speed exceeds GALLOP_THRESHOLD (blocks/tick), the entity is flagged
 *    kc:charge_ready = true and a charge-expiry tick is recorded.
 *  - The flag auto-expires after CHARGE_WINDOW_TICKS of no attack.
 *  - On entityHitEntity, if the attacker is a mounted unit AND charge_ready,
 *    bonus damage is applied via a second applyDamage call and knockback is
 *    pushed onto the victim.  The flag is then cleared.
 */

import { world } from "@minecraft/server";
import type { Entity, EntityHitEntityAfterEvent } from "@minecraft/server";
import { getCurrentTick } from "../utils/tick.js";

// ── Tunables ────────────────────────────────────────────────────────────────

const VELOCITY_CHECK_INTERVAL = 5;          // ticks between speed samples

/** Minimum horizontal speed (blocks/tick) that counts as a gallop.
 *  At base movement 0.45–0.48 + melee_attack speed_multiplier 1.2–1.3,
 *  a charging mounted unit easily clears 0.18 b/t; idling ones do not. */
const GALLOP_THRESHOLD = 0.18;

/** How long (ticks) a charge stays primed after the entity slows below the threshold. */
const CHARGE_WINDOW_TICKS = 60;            // 3 seconds

/** Bonus damage applied on top of the entity's normal melee hit. */
const CHARGE_BONUS: Record<string, number> = {
  "kingdoms:cavalry":          5,   // base 5 → effective 10 on charge
  "kingdoms:mercenary_lancer": 8,   // base 7 → effective 15 on charge
};

/** Horizontal knockback impulse magnitude on charge. */
const CHARGE_KNOCKBACK: Record<string, number> = {
  "kingdoms:cavalry":          0.9,
  "kingdoms:mercenary_lancer": 1.3,
};

// ── Dynamic-property keys ────────────────────────────────────────────────────

const PROP_READY = "kc:charge_ready";   // boolean
const PROP_TICK  = "kc:charge_tick";    // number — world tick when charge was set

// ── Helpers ──────────────────────────────────────────────────────────────────

function horizontalSpeed(entity: Entity): number {
  try {
    const v = entity.getVelocity();
    return Math.sqrt(v.x * v.x + v.z * v.z);
  } catch {
    return 0;
  }
}

function setChargeReady(entity: Entity, tick: number): void {
  try {
    entity.setDynamicProperty(PROP_READY, true);
    entity.setDynamicProperty(PROP_TICK,  tick);
  } catch { /* entity removed */ }
}

function clearCharge(entity: Entity): void {
  try {
    entity.setDynamicProperty(PROP_READY, false);
  } catch { /* entity removed */ }
}

function isChargeReady(entity: Entity, currentTick: number): boolean {
  try {
    if (!entity.getDynamicProperty(PROP_READY)) return false;
    const set = entity.getDynamicProperty(PROP_TICK) as number | undefined;
    if (set === undefined) return false;
    return (currentTick - set) <= CHARGE_WINDOW_TICKS;
  } catch {
    return false;
  }
}

// ── Velocity sampling — call every tick from main loop ───────────────────────

export function tickChargeSystem(currentTick: number): void {
  if (currentTick % VELOCITY_CHECK_INTERVAL !== 0) return;

  for (const entityId of Object.keys(CHARGE_BONUS)) {
    for (const dim of ["overworld", "nether", "the_end"]) {
      try {
        const entities = world.getDimension(dim).getEntities({ type: entityId });
        for (const entity of entities) {
          const speed = horizontalSpeed(entity);
          if (speed >= GALLOP_THRESHOLD) {
            setChargeReady(entity, currentTick);
          } else {
            // Expire stale flags so the window resets properly
            const set = entity.getDynamicProperty(PROP_TICK) as number | undefined;
            if (
              entity.getDynamicProperty(PROP_READY) &&
              set !== undefined &&
              (currentTick - set) > CHARGE_WINDOW_TICKS
            ) {
              clearCharge(entity);
            }
          }
        }
      } catch { /* dimension not loaded */ }
    }
  }
}

// ── Spearmen counter-charge constants ────────────────────────────────────────

const SPEAR_COUNTER_DAMAGE = 6;  // damage reflected back to the charger
const SPEAR_ENTITY_ID      = "kingdoms:spearman";

// ── Event registration — call ONCE at startup ────────────────────────────────

export function registerChargeSystem(): void {
  world.afterEvents.entityHitEntity.subscribe((event: EntityHitEntityAfterEvent) => {
    const attacker = event.damagingEntity;
    const victim   = event.hitEntity;
    if (!attacker || !victim) return;

    const typeId = attacker.typeId;
    const bonus  = CHARGE_BONUS[typeId];
    if (bonus === undefined) return;

    const tick = getCurrentTick();
    if (!isChargeReady(attacker, tick)) return;

    // ── Spearmen counter — fires before the charge is consumed ───────────
    if (victim.typeId === SPEAR_ENTITY_ID) {
      try {
        attacker.applyDamage(SPEAR_COUNTER_DAMAGE, { cause: "entityAttack", damagingEntity: victim });
      } catch { /* attacker removed */ }
      try {
        const vPos = victim.location;
        const aPos = attacker.location;
        const dx   = aPos.x - vPos.x;
        const dz   = aPos.z - vPos.z;
        const mag  = Math.sqrt(dx * dx + dz * dz) || 1;
        attacker.applyKnockback((dx / mag) * 1.0, (dz / mag) * 1.0, 0.5, 0.4);
      } catch { /* attacker removed */ }
      try {
        victim.dimension.spawnParticle("minecraft:large_explosion", victim.location);
        victim.runCommandAsync(
          `title @a[r=32] actionbar §c🛡 Spearmen Counter!`
        ).catch(() => {});
      } catch { }
    }

    // Consume the charge immediately so it can only fire once per gallop
    clearCharge(attacker);

    // ── Bonus damage ─────────────────────────────────────────────────────
    try {
      victim.applyDamage(bonus, { cause: "entityAttack", damagingEntity: attacker });
    } catch { /* victim may already be dead from the base hit */ }

    // ── Knockback ────────────────────────────────────────────────────────
    const kb = CHARGE_KNOCKBACK[typeId] ?? 0.9;
    try {
      const aPos = attacker.location;
      const vPos = victim.location;
      const dx   = vPos.x - aPos.x;
      const dz   = vPos.z - aPos.z;
      const mag  = Math.sqrt(dx * dx + dz * dz) || 1;
      victim.applyKnockback(
        (dx / mag) * kb,
        (dz / mag) * kb,
        kb * 0.5,   // horizontal magnitude
        0.35        // vertical kick
      );
    } catch { /* victim removed or doesn't support knockback */ }

    // ── Visual & audio feedback ──────────────────────────────────────────
    const chargeLabel =
      typeId === "kingdoms:mercenary_lancer" ? "§6⚔ Lancer Charge!" : "§e⚡ Cavalry Charge!";
    const { x, y, z } = victim.location;
    try { victim.dimension.spawnParticle("minecraft:large_explosion", { x, y, z }); } catch { }
    try {
      attacker.runCommandAsync(
        `playsound random.explode @a[r=24] ${x} ${y} ${z} 0.6 1.4`
      ).catch(() => {});
    } catch { }
    try {
      attacker.runCommandAsync(
        `title @a[r=32] actionbar ${chargeLabel}`
      ).catch(() => {});
    } catch { }
  });
}
