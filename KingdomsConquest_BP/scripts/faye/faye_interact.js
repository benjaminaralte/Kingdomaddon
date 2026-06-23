import { world, GameMode, BlockPermutation } from "@minecraft/server";

world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent("faye:open", {
        onPlayerInteract: e => {
            const { player, block, dimension } = e;
            const blockCenter = block.center();
            const faceLocation = block.permutation.getState("minecraft:cardinal_direction");

            switch(faceLocation){
                case 'north':
                    block.setPermutation(block.permutation.withState("faye:interact",true))
                    break;
                case 'south':
                    block.setPermutation(block.permutation.withState("faye:interact",true))
                    break;
                case 'east':
                    block.setPermutation(block.permutation.withState("faye:interact",true))
                    break;
                case 'west':
                    block.setPermutation(block.permutation.withState("faye:interact",true))
                    break;
            }
        },
    });
});

world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent("faye:close", {
        onPlayerInteract: e => {
            const { player, block, dimension } = e;
            const blockCenter = block.center();
            const faceLocation = block.permutation.getState("minecraft:cardinal_direction");

            switch(faceLocation){
                case 'north':
                    block.setPermutation(block.permutation.withState("faye:interact",false))
                    break;
                case 'south':
                    block.setPermutation(block.permutation.withState("faye:interact",false))
                    break;
                case 'east':
                    block.setPermutation(block.permutation.withState("faye:interact",false))
                    break;
                case 'west':
                    block.setPermutation(block.permutation.withState("faye:interact",false))
                    break;
            }
        },
    });
});

//ticking 6,6