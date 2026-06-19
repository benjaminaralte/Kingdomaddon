export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Vec3WithDim extends Vec3 {
  dimension: string;
}

export type TroopType = "cityGuards" | "spearmen" | "archers" | "cavalry";

export interface TroopData {
  cityGuards: number;
  spearmen: number;
  archers: number;
  cavalry: number;
}

export interface WorkerAssignments {
  farmers: number;
  workers: number;
}

export type GuardPoleType = "village" | "gate" | "road" | "watchtower";

export interface GuardPoleData {
  id: string;
  location: Vec3;
  type: GuardPoleType;
  assignedGuards: number;
  requestedGuards: number;
  troopType: TroopType;
  entityIds: string[];
}

export interface TradeHistoryEntry {
  timestamp: number;
  fromVillageName: string;
  summary: string;
  isManual: boolean;
}

export interface TradePoleData {
  id: string;
  location: Vec3;
  order: number;
}

export interface BlacksmithData {
  weaponTier: number;
  armorTier: number;
}

export type FoodShortageStage = 0 | 1 | 2 | 3 | 4;

export interface MerchantData {
  entityId: string;
  stock: Record<string, number>;
  destinationVillageId: string;
  currentPoleIndex: number;
}

export interface ResourceStorage {
  iron: number;
  gold: number;
  coal: number;
  wood: number;
  stone: number;
  diamonds: number;
}

export interface TradeCartCargo {
  food: number;
  emeralds: number;
  iron: number;
  gold: number;
  coal: number;
  wood: number;
  stone: number;
  diamonds: number;
  troops: Partial<TroopData>;
}

export interface TradeCartData {
  entityId: string;
  destinationVillageId: string;
  sourceVillageId: string;
  cargo: TradeCartCargo;
  currentPoleIndex: number;
  isMilitary: boolean;
  isRailShipment: boolean;
}

export interface TrainingJob {
  troopType: TroopType;
  count: number;
  completeTick: number;
}

export interface VillageData {
  id: string;
  name: string;
  owner: string;
  kingdomId: string;
  location: Vec3WithDim;
  townHallLocation: Vec3;
  population: number;
  housingCapacity: number;
  treasury: number;
  foodStorage: number;
  granaryItems: Record<string, number>;
  lastSoldierFeedDay: number;
  granaryLocation?: Vec3;
  treasuryLocation?: Vec3;
  marketLevel: number;
  barracksLevel: number;
  prosperity: number;
  tradeCartCount: number;
  troops: TroopData;
  missedWages: number;
  lastDayProcessed: number;
  lastWageDay: number;
  foodShortageStage: FoodShortageStage;
  guardPoles: GuardPoleData[];
  tradePoles: TradePoleData[];
  workers: WorkerAssignments;
  blacksmith: BlacksmithData;
  activeMerchants: MerchantData[];
  activeCarts: TradeCartData[];
  builtHousingUnits: number;
  hasTradeStation: boolean;
  tradeStationLocation?: Vec3;
  resourceStorage: ResourceStorage;
  trainingQueue: TrainingJob[];
  fieldStorage?: Record<string, number>;
  fieldWorkerLevel?: number;
  tradeHistory?: TradeHistoryEntry[];
}

export interface KingdomData {
  id: string;
  name: string;
  king: string;
  villageIds: string[];
  wars: string[];
  alliances: string[];
}

export interface BanditCampData {
  id: string;
  location: Vec3WithDim;
  strength: number;
  originKingdomId: string;
  entityIds: string[];
}

export interface RegistryData {
  villageIds: string[];
  kingdomIds: string[];
  banditCampIds: string[];
}

export const WEAPON_TIERS = ["wood", "stone", "iron", "gold", "diamond", "netherite"] as const;
export const ARMOR_TIERS = ["leather", "iron", "gold", "diamond", "netherite"] as const;

export const TROOP_WAGES: Record<TroopType, number> = {
  cityGuards: 1,
  spearmen: 2,
  archers: 2,
  cavalry: 3,
};

export const EMPTY_RESOURCE_STORAGE: ResourceStorage = {
  iron: 0,
  gold: 0,
  coal: 0,
  wood: 0,
  stone: 0,
  diamonds: 0,
};

export const RESOURCE_LABELS: Record<keyof ResourceStorage, string> = {
  iron: "Iron",
  gold: "Gold",
  coal: "Coal",
  wood: "Wood",
  stone: "Stone",
  diamonds: "Diamonds",
};

export const TICKS_PER_DAY = 24000;

export const CLAIM_COST_EMERALDS = 10;
export const VILLAGE_CLAIM_RADIUS = 64;
export const MIN_VILLAGERS_TO_CLAIM = 3;
export const FOOD_PER_VILLAGER_PER_DAY = 1;
export const FOOD_PER_SOLDIER_PER_DAY = 2;
export const POPULATION_GROWTH_INTERVAL_DAYS = 2;
export const WAGE_INTERVAL_DAYS = 3;
export const MAX_GUARDS_PER_POLE = 3;
export const GUARD_PATROL_RADIUS = 16;
export const WATCHTOWER_DETECTION_RADIUS = 48;
export const MERCHANT_SPAWN_RADIUS = 8;
export const BANDIT_MIGRATE_DISTANCE = 200;
