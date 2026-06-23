import { world } from "@minecraft/server";

world.beforeEvents.worldInitialize.subscribe((initEvent) => {
    initEvent.blockComponentRegistry.registerCustomComponent("faye:lights_on", {
        onPlayerInteract: e => {
            const { player, block, dimension } = e;
            const blockCenter = block.center();

            const chairEntity = dimension.spawnEntity("faye:ejecutes",{ x: blockCenter.x, y: blockCenter.y - 0.2, z: blockCenter.z })

            const faceLocation = block.permutation.getState("minecraft:cardinal_direction");

            switch(faceLocation){
                case 'north':
                    chairEntity.runCommand(`function lightson`)
                    break;
                case 'south':
                    chairEntity.runCommand(`function lightson`)
                    break;
                case 'east':
                    chairEntity.runCommand(`function lightson`)
                    break;
                case 'west':
                    chairEntity.runCommand(`function lightson`)
                    break;
            }

        },
    });
});

world.beforeEvents.worldInitialize.subscribe((initEvent) => {
    initEvent.blockComponentRegistry.registerCustomComponent("faye:lights_off", {
        onPlayerInteract: e => {
            const { player, block, dimension } = e;
            const blockCenter = block.center();

            const chairEntity = dimension.spawnEntity("faye:ejecutes",{ x: blockCenter.x, y: blockCenter.y - 0.2, z: blockCenter.z })

            const faceLocation = block.permutation.getState("minecraft:cardinal_direction");

            switch(faceLocation){
                case 'north':
                    chairEntity.runCommand(`function lightsoff`)
                    break;
                case 'south':
                    chairEntity.runCommand(`function lightsoff`)
                    break;
                case 'east':
                    chairEntity.runCommand(`function lightsoff`)
                    break;
                case 'west':
                    chairEntity.runCommand(`function lightsoff`)
                    break;
            }

        },
    });
});

