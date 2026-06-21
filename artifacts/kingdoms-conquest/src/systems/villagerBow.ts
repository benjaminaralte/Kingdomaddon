import { world, system } from "@minecraft/server";

const VILLAGER_TYPES = ["minecraft:villager_v2", "minecraft:villager"];
const CHECK_INTERVAL_TICKS = 40;
const BOW_ANIM = "animation.kingdoms.bow_greeting";
const BOW_DURATION = 2.5;
const BOW_RADIUS = 4;

export function startVillagerBowSystem(): void {
  system.runInterval(() => {
    try {
      for (const player of world.getAllPlayers()) {
        const dim = player.dimension;
        const loc = player.location;

        for (const type of VILLAGER_TYPES) {
          try {
            const nearby = dim.getEntities({
              type,
              location: loc,
              maxDistance: BOW_RADIUS,
            });
            for (const entity of nearby) {
              try {
                entity.runCommandAsync(
                  `playanimation @s ${BOW_ANIM} false ${BOW_DURATION}`
                );
              } catch {
                // entity invalid
              }
            }
          } catch {
            // type not loaded
          }
        }
      }
    } catch {
      // world not ready
    }
  }, CHECK_INTERVAL_TICKS);
}
