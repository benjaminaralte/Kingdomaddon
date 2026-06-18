import { world } from "@minecraft/server";

export function notifyPlayer(playerName: string, message: string): void {
  const player = world.getPlayers().find((p) => p.name === playerName);
  if (player) {
    player.sendMessage(`§6[Kingdoms]§r ${message}`);
  }
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
