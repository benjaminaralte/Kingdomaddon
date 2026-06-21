---
name: VD soldier textures
description: Village Defense addon asset IDs for Kingdoms & Conquest soldier RP entities
---
Geometry ID: geometry.piki_villagedefense.villager
Animation prefix: animation.piki_villagedefense.villager.*  (idle, walk, run, attack, charge_bow, shoot_bow)
Material key (in RP entity): "villager" (not "default") paired with entity_alphatest
Texture paths: textures/piki/vd/entity/villager_{warrior,fighter,archer,farmer,blacksmith,miner}
Render controller: controller.render.kingdoms.soldier (at render_controllers/kingdoms_soldier.json)

**Why:** VD addon uses piki_ prefix for all its geometry/animation IDs; the material key must match the render controller's material array key.

**How to apply:** All soldier RP entity files (city_guard, spearman, archer, cavalry) use these IDs. Both KingdomsConquest_RP/entity/ and artifacts/kingdoms-conquest/resource_pack/entity/ must be kept in sync.
