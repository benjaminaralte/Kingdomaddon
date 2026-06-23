import { world } from '@minecraft/server';
world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('faye:sit', {
        onPlayerInteract(e) {
            const { block, player } = e;

            const entity = block.dimension.spawnEntity('faye:sit', { x: block.location.x + 0.5, y: block.location.y + 0.6, z: block.location.z + 0.5 });

            const direction = block.permutation.getState("minecraft:cardinal_direction");
            const { x, y, z } = entity.location;

            player.runCommandAsync('ride @s start_riding @e[family=sit,tag=!has_rider,c=1]');

            switch (direction) {
                case 'north':
                    entity.teleport(entity.location, { facingLocation: { x, y, z: z + 1 } });
                    break;
                case 'east':
                    entity.teleport(entity.location, { facingLocation: { x: x - 1, y, z } });
                    break;
                case 'south':
                    entity.teleport(entity.location, { facingLocation: { x, y, z: z - 1 } });
                    break;
                case 'west':
                    entity.teleport(entity.location, { facingLocation: { x: x + 1, y, z } });
                    break;
                default:
                    console.warn(`Unexpected direction: ${direction}`);
            }
        }
    });
});