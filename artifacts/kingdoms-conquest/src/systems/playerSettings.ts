import { world } from "@minecraft/server";

export interface PlayerSettings {
  alertsEnabled: boolean;
}

const DEFAULT_SETTINGS: PlayerSettings = {
  alertsEnabled: true,
};

function settingsKey(playerName: string): string {
  return `kc:settings:${playerName}`;
}

export function getPlayerSettings(playerName: string): PlayerSettings {
  const raw = world.getDynamicProperty(settingsKey(playerName)) as string | undefined;
  if (!raw) return { ...DEFAULT_SETTINGS };
  try {
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<PlayerSettings>) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function savePlayerSettings(playerName: string, settings: PlayerSettings): void {
  world.setDynamicProperty(settingsKey(playerName), JSON.stringify(settings));
}

export function isAlertsEnabled(playerName: string): boolean {
  return getPlayerSettings(playerName).alertsEnabled;
}

export function toggleAlerts(playerName: string): boolean {
  const settings = getPlayerSettings(playerName);
  settings.alertsEnabled = !settings.alertsEnabled;
  savePlayerSettings(playerName, settings);
  return settings.alertsEnabled;
}
