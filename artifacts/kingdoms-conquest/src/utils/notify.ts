import { world } from "@minecraft/server";
import { isAlertsEnabled } from "../systems/playerSettings.js";

export function sendCrisisTitle(
  playerName: string,
  title: string,
  subtitle: string,
  sound = "raid.horn"
): void {
  const player = world.getPlayers().find((p) => p.name === playerName);
  if (!player) return;
  player.onScreenDisplay.setTitle(title, {
    subtitle,
    fadeInDuration: 10,
    stayDuration: 80,
    fadeOutDuration: 20,
  });
  try {
    player.playSound(sound, { volume: 1.0, pitch: 1.0 });
  } catch { /* sound may not exist */ }
}

export function notifyPlayer(playerName: string, message: string): void {
  const player = world.getPlayers().find((p) => p.name === playerName);
  if (player) {
    player.sendMessage(`§6[Kingdoms]§r ${message}`);
  }
}

/**
 * Like notifyPlayer but respects the player's alert-toggle setting.
 * Use this for all incoming-attack / border-intrusion / siege alerts
 * sent to the DEFENDER (not for the attacker's own action feedback).
 */
export function notifyAlert(playerName: string, message: string): void {
  if (!isAlertsEnabled(playerName)) return;
  notifyPlayer(playerName, message);
}

export function notifyAllPlayers(message: string): void {
  for (const player of world.getPlayers()) {
    player.sendMessage(`§6[Kingdoms]§r ${message}`);
  }
}

export function notifyKingdom(kingName: string, villageOwners: string[], message: string): void {
  const players = world.getPlayers();
  const recipients = new Set([kingName, ...villageOwners]);
  for (const player of players) {
    if (recipients.has(player.name)) {
      player.sendMessage(`§d[Kingdom]§r ${message}`);
    }
  }
}

export function warningMessage(msg: string): string {
  return `§c⚠ ${msg}§r`;
}

export function infoMessage(msg: string): string {
  return `§a✔ ${msg}§r`;
}

export function alertMessage(msg: string): string {
  return `§e⚡ ${msg}§r`;
}
