import { world } from '@minecraft/server';

world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('simjue:connected', {
        onPlace(e) {
            const { block } = e;
            const utara = block.north();
            const selatan = block.south();
            const barat = block.west();
            const timur = block.east();
            const tags = block.getTags();

            const hasCommonTag = (blockState) => {
                const neighborTags = blockState.getTags();
                return tags.some(tag => neighborTags.includes(tag));
            };

            if (utara && hasCommonTag(utara)) {
                utara.setPermutation(utara.permutation.withState('simjue:south_neighbor', 1));
                block.setPermutation(block.permutation.withState('simjue:north_neighbor', 1));
            }
            if (selatan && hasCommonTag(selatan)) {
                selatan.setPermutation(selatan.permutation.withState('simjue:north_neighbor', 1));
                block.setPermutation(block.permutation.withState('simjue:south_neighbor', 1));
            }
            if (barat && hasCommonTag(barat)) {
                barat.setPermutation(barat.permutation.withState('simjue:east_neighbor', 1));
                block.setPermutation(block.permutation.withState('simjue:west_neighbor', 1));
            }
            if (timur && hasCommonTag(timur)) {
                timur.setPermutation(timur.permutation.withState('simjue:west_neighbor', 1));
                block.setPermutation(block.permutation.withState('simjue:east_neighbor', 1));
            }
        }
    });
});
world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('simjue:connects', {
        onPlayerDestroy(e) {
            const { block } = e;
            const utara = block.north();
            const selatan = block.south();
            const barat = block.west();
            const timur = block.east();

             // Pengecekan state pada neighbors
             if (utara) {
                const stateUtara = utara.permutation.getState('simjue:south_neighbor');
                if (stateUtara) {
                    utara.setPermutation(utara.permutation.withState('simjue:south_neighbor', 0));
                }
            }

            if (selatan) {
                const stateSelatan = selatan.permutation.getState('simjue:north_neighbor');
                if (stateSelatan) {
                    selatan.setPermutation(selatan.permutation.withState('simjue:north_neighbor', 0));
                }
            }

            if (barat) {
                const stateBarat = barat.permutation.getState('simjue:east_neighbor');
                if (stateBarat) {
                    barat.setPermutation(barat.permutation.withState('simjue:east_neighbor', 0));
                }
            }

            if (timur) {
                const stateTimur = timur.permutation.getState('simjue:west_neighbor');
                if (stateTimur) {
                    timur.setPermutation(timur.permutation.withState('simjue:west_neighbor', 0));
                }
            }
        }
    });
});
