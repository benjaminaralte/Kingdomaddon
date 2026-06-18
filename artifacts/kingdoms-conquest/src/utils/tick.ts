import { world } from "@minecraft/server";
import { TICKS_PER_DAY } from "../types/index.js";

export function getCurrentDay(): number {
  return Math.floor(world.getAbsoluteTime() / TICKS_PER_DAY);
}

export function getCurrentTick(): number {
  return world.getAbsoluteTime();
}

export function isNewDay(lastProcessedDay: number): boolean {
  return getCurrentDay() > lastProcessedDay;
}

export function daysSince(day: number): number {
  return getCurrentDay() - day;
}

export function distanceSq(
  a: { x: number; y: number; z: number },
  b: { x: number; y: number; z: number }
): number {
  return (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2;
}

export function distance(
  a: { x: number; y: number; z: number },
  b: { x: number; y: number; z: number }
): number {
  return Math.sqrt(distanceSq(a, b));
}

export function moveToward(
  from: { x: number; y: number; z: number },
  to: { x: number; y: number; z: number },
  speed: number
): { x: number; y: number; z: number } {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dz = to.z - from.z;
  const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
  if (dist <= speed) return { ...to };
  const ratio = speed / dist;
  return {
    x: from.x + dx * ratio,
    y: from.y + dy * ratio,
    z: from.z + dz * ratio,
  };
}
