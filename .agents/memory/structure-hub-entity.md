---
name: Structure hub entity
description: Invisible entity trick for reopening structure block GUIs in Bedrock
---
Problem: Bedrock won't re-fire the block interaction event for the same block after the first use (GUI closed = block already "used").
Solution: Spawn kingdoms:structure_hub (runtime_identifier: minecraft:pig, invisible 1px transparent PNG texture, unkillable via damage_sensor) at block center (x+0.5, z+0.5). Subscribe to playerInteractWithEntity to open the menu again.
Also keep playerInteractWithBlock subscription as fallback for freshly placed blocks.

**Why:** Bedrock's block interact afterEvent only fires reliably once per block placement in some versions; the entity-based approach is always reliable.

**How to apply:** spawnStructureHub() called from playerPlaceBlock afterEvent. removeStructureHub() called from playerBreakBlock afterEvent. Entity stores kc:structure_type and kc:block_loc dynamic properties.
