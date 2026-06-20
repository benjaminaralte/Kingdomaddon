import { getAllVillages } from "../storage/index.js";
import { sendCrisisTitle, notifyPlayer } from "../utils/notify.js";
import { getCurrentDay } from "../utils/tick.js";

// Per-day dedup: key = `<type>_<villageId>_<day>`
const alertedKeys = new Set<string>();

function makeKey(type: string, villageId: string): string {
  return `${type}_${villageId}_${getCurrentDay()}`;
}

/** Called once per day from the main daily tick. Checks population and treasury. */
export function checkDailyCrisisAlerts(): void {
  for (const village of getAllVillages()) {
    if (!village.owner) continue;

    // ── Treasury dry ──────────────────────────────────────────────────────────
    if (village.treasury === 0) {
      const key = makeKey("treasury", village.id);
      if (!alertedKeys.has(key)) {
        alertedKeys.add(key);
        sendCrisisTitle(
          village.owner,
          "§6§lTREASURY EMPTY",
          `§e${village.name} has run out of funds!`,
          "random.anvil_land"
        );
        notifyPlayer(
          village.owner,
          `§c⚠ §b${village.name}§c treasury is empty — troops may desert!`
        );
      }
    }

    // ── Population critical ───────────────────────────────────────────────────
    if (village.population > 0 && village.population < 5) {
      const key = makeKey("population", village.id);
      if (!alertedKeys.has(key)) {
        alertedKeys.add(key);
        sendCrisisTitle(
          village.owner,
          "§c§lVILLAGE DYING",
          `§e${village.name} — only ${village.population} citizens left!`,
          "mob.villager.death"
        );
        notifyPlayer(
          village.owner,
          `§c⚠ §b${village.name}§c is critically low on population (${village.population})!`
        );
      }
    }
  }
}

/** Fires immediately when bandits begin a raid on a village. */
export function triggerAttackAlert(ownerName: string, villageName: string, campStrength: number): void {
  sendCrisisTitle(
    ownerName,
    "§c§l⚔  UNDER ATTACK!",
    `§eBandits (${campStrength}) are raiding ${villageName}!`,
    "raid.horn"
  );
  notifyPlayer(
    ownerName,
    `§c⚔ §b${villageName}§c is under bandit attack! (Camp strength: ${campStrength})`
  );
}
