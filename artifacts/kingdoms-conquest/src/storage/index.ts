import { world } from "@minecraft/server";
import type { VillageData, KingdomData, BanditCampData, RegistryData } from "../types/index.js";

const REGISTRY_KEY = "kc:registry";
const VILLAGE_PREFIX = "kc:village:";
const KINGDOM_PREFIX = "kc:kingdom:";
const BANDIT_PREFIX = "kc:bandit:";

function getRegistry(): RegistryData {
  const raw = world.getDynamicProperty(REGISTRY_KEY) as string | undefined;
  if (!raw) return { villageIds: [], kingdomIds: [], banditCampIds: [] };
  try {
    return JSON.parse(raw) as RegistryData;
  } catch {
    return { villageIds: [], kingdomIds: [], banditCampIds: [] };
  }
}

function saveRegistry(data: RegistryData): void {
  world.setDynamicProperty(REGISTRY_KEY, JSON.stringify(data));
}

export function getVillage(id: string): VillageData | undefined {
  const raw = world.getDynamicProperty(VILLAGE_PREFIX + id) as string | undefined;
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as VillageData;
  } catch {
    return undefined;
  }
}

export function saveVillage(data: VillageData): void {
  world.setDynamicProperty(VILLAGE_PREFIX + data.id, JSON.stringify(data));
  const reg = getRegistry();
  if (!reg.villageIds.includes(data.id)) {
    reg.villageIds.push(data.id);
    saveRegistry(reg);
  }
}

export function deleteVillage(id: string): void {
  world.setDynamicProperty(VILLAGE_PREFIX + id, undefined);
  const reg = getRegistry();
  reg.villageIds = reg.villageIds.filter((v) => v !== id);
  saveRegistry(reg);
}

export function getAllVillages(): VillageData[] {
  const reg = getRegistry();
  return reg.villageIds.flatMap((id) => {
    const v = getVillage(id);
    return v ? [v] : [];
  });
}

export function getVillageByOwner(playerName: string): VillageData[] {
  return getAllVillages().filter((v) => v.owner === playerName);
}

export function getKingdom(id: string): KingdomData | undefined {
  const raw = world.getDynamicProperty(KINGDOM_PREFIX + id) as string | undefined;
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as KingdomData;
  } catch {
    return undefined;
  }
}

export function saveKingdom(data: KingdomData): void {
  world.setDynamicProperty(KINGDOM_PREFIX + data.id, JSON.stringify(data));
  const reg = getRegistry();
  if (!reg.kingdomIds.includes(data.id)) {
    reg.kingdomIds.push(data.id);
    saveRegistry(reg);
  }
}

export function deleteKingdom(id: string): void {
  world.setDynamicProperty(KINGDOM_PREFIX + id, undefined);
  const reg = getRegistry();
  reg.kingdomIds = reg.kingdomIds.filter((k) => k !== id);
  saveRegistry(reg);
}

export function getAllKingdoms(): KingdomData[] {
  const reg = getRegistry();
  return reg.kingdomIds.flatMap((id) => {
    const k = getKingdom(id);
    return k ? [k] : [];
  });
}

export function getKingdomByKing(playerName: string): KingdomData | undefined {
  return getAllKingdoms().find((k) => k.king === playerName);
}

export function getBanditCamp(id: string): BanditCampData | undefined {
  const raw = world.getDynamicProperty(BANDIT_PREFIX + id) as string | undefined;
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as BanditCampData;
  } catch {
    return undefined;
  }
}

export function saveBanditCamp(data: BanditCampData): void {
  world.setDynamicProperty(BANDIT_PREFIX + data.id, JSON.stringify(data));
  const reg = getRegistry();
  if (!reg.banditCampIds.includes(data.id)) {
    reg.banditCampIds.push(data.id);
    saveRegistry(reg);
  }
}

export function deleteBanditCamp(id: string): void {
  world.setDynamicProperty(BANDIT_PREFIX + id, undefined);
  const reg = getRegistry();
  reg.banditCampIds = reg.banditCampIds.filter((b) => b !== id);
  saveRegistry(reg);
}

export function getAllBanditCamps(): BanditCampData[] {
  const reg = getRegistry();
  return reg.banditCampIds.flatMap((id) => {
    const b = getBanditCamp(id);
    return b ? [b] : [];
  });
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
