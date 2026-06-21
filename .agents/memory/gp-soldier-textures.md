---
name: GP soldier textures
description: Guard & Patrol RP asset IDs now used for all KC soldier RP entities — replaced Village Defense assets
---

KC soldiers are now fully powered by Guard & Patrol 105 RP assets (from connect/). Both `artifacts/kingdoms-conquest/resource_pack/` and `KingdomsConquest_RP/` must stay in sync.

## Soldier → GP Asset Mapping

| KC Soldier    | GP Style          | Geometry                     | Texture               | Anim Controller                    | Render Controller               |
|---------------|-------------------|------------------------------|-----------------------|------------------------------------|---------------------------------|
| city_guard    | Templar Footman   | geometry.templar_footman     | pn_templar_swordman   | controller.animation.pn_roman.setup | controller.render.mercenary_pn.templar |
| spearman      | Roman Spearman    | geometry.mercenary_roman_spear | pn_roman            | controller.animation.pn_roman.setup | controller.render.mercenary_pn.sword |
| archer        | Roman Bowman      | geometry.mercenary_roman_bow | pn_roman              | controller.animation.got_troop2    | controller.render.got1          |
| cavalry       | Viking Axeman     | geometry.viking_axeman       | pn_viking_axeman      | controller.animation.pn_roman.setup | controller.render.mercenary_pn.viking |
| heavy_knight  | Templar Bodyguard | geometry.templar_bodyguard   | pn_templar_backup     | controller.animation.pn_roman.setup | controller.render.mercenary_pn.templar |

## Key Animation IDs
- Templar Footman: `animation.mercenary_templar_footmanidle`, `animation.mercenary_templar_footmanmove`, `animation.mercenary_templar_footmanmove_target`, `animation.mercenary_templar_footman.attack`, `animation.mercenary_templar_footmanstay_target`
- Roman Spearman: `animation.roman_spearman.idle/move/move_target/attack/stay_target`
- Roman Bowman: `animation.roman_bowman.idle/move/move_target/attack/target`
- Viking Axeman: `animation.mercenary_viking_axe.idle/move/move_target/attack/stay_target`
- Templar Bodyguard: `animation.templar.sword_idle/move/move_target/attack/stay_target`

## Material key
All GP entities use `"default": "skeleton"` (not `entity_alphatest`). Render controllers use `Array.skins[query.variant]` with var0/var1 texture slots.

## Model file quirk
`mercenary_templar_swordman.json` defines `geometry.templar_footman` (not templar_swordman) — file name vs geo ID mismatch from the original addon.

**Why:** GP addon uses `pn:` namespace and `skeleton` material. Must not use VD's `geometry.piki_villagedefense.villager` — those assets are no longer in KC RP.

**How to apply:** When adding/editing soldier RP entities, use the GP asset IDs above. Always sync changes to both RP folders.
