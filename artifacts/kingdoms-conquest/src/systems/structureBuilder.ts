import { Dimension, Vector3 } from "@minecraft/server";

export const STRUCTURE_BLOCK_IDS = new Set([
  "kingdoms:town_hall",
  "kingdoms:barracks",
  "kingdoms:market",
  "kingdoms:granary",
  "kingdoms:blacksmith",
  "kingdoms:trade_station",
  "kingdoms:treasury",
  "kingdoms:waypoint",
]);

type BP = { x: number; y: number; z: number; b: string };

function blk(x: number, y: number, z: number, b: string): BP {
  return { x, y, z, b };
}

function fill(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, b: string): BP[] {
  const out: BP[] = [];
  for (let x = x1; x <= x2; x++)
    for (let y = y1; y <= y2; y++)
      for (let z = z1; z <= z2; z++)
        out.push({ x, y, z, b });
  return out;
}

function ring(x1: number, z1: number, x2: number, z2: number, y1: number, y2: number, b: string): BP[] {
  const out: BP[] = [];
  for (let x = x1; x <= x2; x++)
    for (let z = z1; z <= z2; z++)
      if (x === x1 || x === x2 || z === z1 || z === z2)
        for (let y = y1; y <= y2; y++)
          out.push({ x, y, z, b });
  return out;
}

// ─── TOWN HALL ────────────────────────────────────────────────────────────────
// 9×9 footprint, 12 blocks tall with stepped pyramid roof
// Oak log corner pillars, oak plank walls, glass windows, stone brick pyramid
function townHallBlueprint(): BP[] {
  const p: BP[] = [];

  // Clear air space above
  p.push(...fill(-4, 1, -4, 4, 12, 4, "minecraft:air"));

  // Stone brick floor
  p.push(...fill(-4, 0, -4, 4, 0, 4, "minecraft:stone_bricks"));

  // Oak log corner pillars (y 1-6)
  for (const [cx, cz] of [[-4,-4],[-4,4],[4,-4],[4,4]] as [number,number][]) {
    p.push(...fill(cx, 1, cz, cx, 6, cz, "minecraft:oak_log"));
  }

  // Walls y=1-5: oak planks on all four sides
  p.push(...fill(-3, 1, -4, 3, 5, -4, "minecraft:oak_planks")); // north
  p.push(...fill(4,  1, -3, 4, 5,  3, "minecraft:oak_planks")); // east
  p.push(...fill(-4, 1, -3,-4, 5,  3, "minecraft:oak_planks")); // west
  // South wall — door gap x=[-1..1], y=[1..2]
  for (let x = -3; x <= 3; x++)
    for (let y = 1; y <= 5; y++)
      if (!(x >= -1 && x <= 1 && y <= 2))
        p.push(blk(x, y, 4, "minecraft:oak_planks"));

  // Glass windows y=2-3 on each wall, evenly spaced
  for (const wx of [-2, 0, 2]) {
    p.push(blk(wx, 2, -4, "minecraft:glass"), blk(wx, 3, -4, "minecraft:glass")); // north
    p.push(blk(wx, 2,  4, "minecraft:glass"), blk(wx, 3,  4, "minecraft:glass")); // south (not door columns)
  }
  for (const wz of [-2, 0, 2]) {
    p.push(blk(4, 2, wz, "minecraft:glass"), blk(4, 3, wz, "minecraft:glass"));   // east
    p.push(blk(-4, 2, wz, "minecraft:glass"), blk(-4, 3, wz, "minecraft:glass")); // west
  }
  // Remove windows that overlap door
  const filtered = p.filter(b => !(b.z === 4 && b.x >= -1 && b.x <= 1 && b.y <= 2));
  p.length = 0;
  p.push(...filtered);
  // Re-add since we cleared — just skip south door overlap directly:
  // (already handled by door logic above — windows only placed at -2,0,2 which don't overlap ±1 door)

  // Stone brick roof cap (y=6)
  p.push(...fill(-4, 6, -4, 4, 6, 4, "minecraft:stone_bricks"));

  // Stepped pyramid y=7-10
  p.push(...fill(-3, 7, -3, 3, 7, 3, "minecraft:stone_bricks"));
  p.push(...fill(-2, 8, -2, 2, 8, 2, "minecraft:stone_bricks"));
  p.push(...fill(-1, 9, -1, 1, 9, 1, "minecraft:stone_bricks"));
  p.push( blk(0, 10, 0, "minecraft:stone_bricks"));
  p.push( blk(0, 11, 0, "minecraft:lantern")); // beacon light

  // Interior: bookshelves along back wall, lectern and crafting table
  p.push(blk(-3, 1, -3, "minecraft:bookshelf"), blk(-3, 2, -3, "minecraft:bookshelf"));
  p.push(blk( 3, 1, -3, "minecraft:bookshelf"), blk( 3, 2, -3, "minecraft:bookshelf"));
  p.push(blk(-2, 1, -3, "minecraft:bookshelf"), blk( 2, 1, -3, "minecraft:bookshelf"));
  p.push(blk( 2, 1,  0, "minecraft:crafting_table"));
  p.push(blk(-2, 1,  0, "minecraft:lectern"));
  p.push(blk( 0, 1,  2, "minecraft:sea_lantern")); // floor light

  return p;
}

// ─── BARRACKS ─────────────────────────────────────────────────────────────────
// 9×7 footprint, 5 tall, stone brick military fortress
function barracksBlueprint(): BP[] {
  const p: BP[] = [];

  p.push(...fill(-4, 1, -3, 4, 5, 3, "minecraft:air"));
  p.push(...fill(-4, 0, -3, 4, 0, 3, "minecraft:cobblestone")); // floor

  // Walls stone bricks
  p.push(...fill(-4, 1, -3, 4, 4, -3, "minecraft:stone_bricks")); // north
  p.push(...fill(4,  1, -2, 4, 4,  2, "minecraft:stone_bricks")); // east
  p.push(...fill(-4, 1, -2,-4, 4,  2, "minecraft:stone_bricks")); // west
  for (let x = -4; x <= 4; x++)
    for (let y = 1; y <= 4; y++)
      if (!(x >= -1 && x <= 1 && y <= 2))
        p.push(blk(x, y, 3, "minecraft:stone_bricks"));          // south + door

  // Arrow slit windows at y=3
  for (const wx of [-3, 0, 3]) {
    p.push(blk(wx, 3, -3, "minecraft:glass"));
    p.push(blk(wx, 3,  3, "minecraft:glass"));
  }
  p.push(blk(-4, 3, 0, "minecraft:glass"), blk(4, 3, 0, "minecraft:glass"));

  // Stone brick roof
  p.push(...fill(-4, 5, -3, 4, 5, 3, "minecraft:stone_bricks"));
  // Battlement crenellations (every other block)
  for (let x = -4; x <= 4; x += 2) {
    p.push(blk(x, 6, -3, "minecraft:stone_bricks"));
    p.push(blk(x, 6,  3, "minecraft:stone_bricks"));
  }
  for (let z = -2; z <= 2; z += 2) {
    p.push(blk(-4, 6, z, "minecraft:stone_bricks"));
    p.push(blk( 4, 6, z, "minecraft:stone_bricks"));
  }

  // Interior
  p.push(blk(-3, 1, -2, "minecraft:chest"), blk(3, 1, -2, "minecraft:chest"));
  p.push(blk( 0, 1, -2, "minecraft:smithing_table"));
  for (let x = -3; x <= 3; x += 2) p.push(blk(x, 1, 1, "minecraft:red_carpet"));
  p.push(blk( 0, 1,  2, "minecraft:sea_lantern"));

  return p;
}

// ─── MARKET ───────────────────────────────────────────────────────────────────
// 11×11 open-air market with oak log posts, cobblestone floor, oak plank roof
function marketBlueprint(): BP[] {
  const p: BP[] = [];

  p.push(...fill(-5, 1, -5, 5, 5, 5, "minecraft:air"));
  p.push(...fill(-5, 0, -5, 5, 0, 5, "minecraft:cobblestone")); // courtyard floor

  // Stone slab market stall floor elevated by 0 — just decorative stone ring
  p.push(...ring(-5, -5, 5, 5, 0, 0, "minecraft:stone_bricks")); // border trim

  // Oak log posts at corners and mid-edges (y=1-4)
  const postPositions: [number, number][] = [
    [-5,-5], [-5,0], [-5,5],
    [ 0,-5],         [ 0,5],
    [ 5,-5], [ 5,0], [ 5,5],
  ];
  for (const [px, pz] of postPositions)
    p.push(...fill(px, 1, pz, px, 4, pz, "minecraft:oak_log"));

  // Oak plank roof at y=5 (solid top between posts)
  p.push(...fill(-5, 5, -5, 5, 5, 5, "minecraft:oak_planks"));

  // Roof lanterns
  for (const [lx, lz] of [[-2,-2],[-2,2],[2,-2],[2,2],[0,0]] as [number,number][])
    p.push(blk(lx, 5, lz, "minecraft:sea_lantern"));

  // Market stall tables (crafting tables = workbenches / trading tables)
  p.push(blk(-3, 1, -3, "minecraft:crafting_table"), blk(-3, 1, 0, "minecraft:crafting_table"));
  p.push(blk( 3, 1, -3, "minecraft:crafting_table"), blk( 3, 1, 0, "minecraft:crafting_table"));
  p.push(blk( 0, 1, -3, "minecraft:crafting_table"), blk( 0, 1, 3, "minecraft:crafting_table"));
  p.push(blk(-3, 1,  3, "minecraft:crafting_table"), blk( 3, 1,  3, "minecraft:crafting_table"));

  // Barrels as storage
  p.push(blk(-4, 1, 0, "minecraft:barrel"), blk(4, 1, 0, "minecraft:barrel"));
  p.push(blk(0, 1, -4, "minecraft:barrel"), blk(0, 1, 4, "minecraft:barrel"));

  return p;
}

// ─── GRANARY ──────────────────────────────────────────────────────────────────
// 7×7 barn with spruce plank walls, birch floor, hay bale gabled roof
function granaryBlueprint(): BP[] {
  const p: BP[] = [];

  p.push(...fill(-3, 1, -3, 3, 8, 3, "minecraft:air"));
  p.push(...fill(-3, 0, -3, 3, 0, 3, "minecraft:birch_planks")); // floor

  // Spruce plank walls y=1-4
  p.push(...ring(-3, -3, 3, 3, 1, 4, "minecraft:spruce_planks"));
  // Door gap south wall
  for (let y = 1; y <= 2; y++) p.push(blk(0, y, 3, "minecraft:air"));

  // Windows
  p.push(blk(-3, 2, 0, "minecraft:glass"), blk(3, 2, 0, "minecraft:glass"));
  p.push(blk(0, 2, -3, "minecraft:glass"), blk(0, 2, 3, "minecraft:glass"));

  // Spruce log corner pillars y=1-5
  for (const [cx, cz] of [[-3,-3],[-3,3],[3,-3],[3,3]] as [number,number][])
    p.push(...fill(cx, 1, cz, cx, 5, cz, "minecraft:spruce_log"));

  // Gabled roof: hay bales for a barn look
  // Layer y=5 — full 7×7 cap
  p.push(...fill(-3, 5, -3, 3, 5, 3, "minecraft:hay_block"));
  // Layer y=6 — inset
  p.push(...fill(-2, 6, -2, 2, 6, 2, "minecraft:hay_block"));
  // Layer y=7 — inset
  p.push(...fill(-1, 7, -1, 1, 7, 1, "minecraft:hay_block"));
  p.push(blk(0, 8, 0, "minecraft:hay_block"));

  // Interior: barrels of food
  p.push(blk(-2, 1, -2, "minecraft:barrel"), blk( 2, 1, -2, "minecraft:barrel"));
  p.push(blk(-2, 1,  2, "minecraft:barrel"), blk( 2, 1,  2, "minecraft:barrel"));
  p.push(blk( 0, 1, -2, "minecraft:chest"));
  p.push(blk( 0, 1,  0, "minecraft:sea_lantern")); // center light (not at 0,0,0)

  return p;
}

// ─── BLACKSMITH ───────────────────────────────────────────────────────────────
// 7×5 forge with cobblestone walls, anvil, blast furnace, smithing table
function blacksmithBlueprint(): BP[] {
  const p: BP[] = [];

  p.push(...fill(-3, 1, -2, 3, 5, 2, "minecraft:air"));
  p.push(...fill(-3, 0, -2, 3, 0, 2, "minecraft:stone_bricks")); // floor

  // Cobblestone walls y=1-3
  p.push(...fill(-3, 1, -2, 3, 3, -2, "minecraft:cobblestone")); // north
  p.push(...fill( 3, 1, -1, 3, 3,  1, "minecraft:cobblestone")); // east
  p.push(...fill(-3, 1, -1,-3, 3,  1, "minecraft:cobblestone")); // west
  for (let x = -3; x <= 3; x++)
    for (let y = 1; y <= 3; y++)
      if (!(x >= -1 && x <= 1 && y <= 2))
        p.push(blk(x, y, 2, "minecraft:cobblestone"));          // south + door

  // Stone brick roof y=4
  p.push(...fill(-3, 4, -2, 3, 4, 2, "minecraft:cobblestone"));
  // Chimney stack
  p.push(...fill(1, 5, -1, 2, 7, 0, "minecraft:cobblestone"));
  p.push(...fill(1, 8, -1, 2, 8, 0, "minecraft:air")); // open top

  // Windows
  p.push(blk(-2, 2, -2, "minecraft:glass"), blk(2, 2, -2, "minecraft:glass"));
  p.push(blk(-3, 2,  0, "minecraft:glass"), blk(3, 2,  0, "minecraft:glass"));

  // Forge equipment
  p.push(blk(-2, 1, -1, "minecraft:blast_furnace"));
  p.push(blk(-1, 1, -1, "minecraft:blast_furnace"));
  p.push(blk( 2, 1, -1, "minecraft:anvil"));
  p.push(blk( 2, 1,  0, "minecraft:smithing_table"));
  p.push(blk(-2, 1,  1, "minecraft:chest"));
  p.push(blk( 1, 1,  0, "minecraft:sea_lantern"));

  return p;
}

// ─── TRADE STATION ────────────────────────────────────────────────────────────
// 9×7 trading post with birch plank walls, oak plank platform, open front
function tradeStationBlueprint(): BP[] {
  const p: BP[] = [];

  p.push(...fill(-4, 1, -3, 4, 5, 3, "minecraft:air"));
  p.push(...fill(-4, 0, -3, 4, 0, 3, "minecraft:oak_planks")); // platform floor

  // Birch plank walls y=1-3
  p.push(...fill(-4, 1, -3, 4, 3, -3, "minecraft:birch_planks")); // back
  p.push(...fill(-4, 1, -2,-4, 3,  2, "minecraft:birch_planks")); // left
  p.push(...fill( 4, 1, -2, 4, 3,  2, "minecraft:birch_planks")); // right
  // Front open — only corner posts
  p.push(...fill(-4, 1, 3, -4, 4, 3, "minecraft:oak_log")); // front-left post
  p.push(...fill( 4, 1, 3,  4, 4, 3, "minecraft:oak_log")); // front-right post

  // Windows
  for (const wx of [-2, 0, 2]) p.push(blk(wx, 2, -3, "minecraft:glass"));
  p.push(blk(-4, 2, 0, "minecraft:glass"), blk(4, 2, 0, "minecraft:glass"));

  // Roof canopy y=4-5
  p.push(...fill(-4, 4, -3, 4, 4, 3, "minecraft:oak_planks"));
  // Decorative overhang at front y=5
  p.push(...fill(-4, 5, 2, 4, 5, 3, "minecraft:oak_planks"));

  // Interior
  p.push(blk(-3, 1, -2, "minecraft:chest"), blk(3, 1, -2, "minecraft:chest"));
  p.push(blk(-2, 1,  0, "minecraft:crafting_table"));
  p.push(blk( 2, 1,  0, "minecraft:lectern"));
  p.push(blk( 0, 1, -1, "minecraft:sea_lantern"));

  // Iron bar fence along front edge
  for (let x = -3; x <= 3; x++) p.push(blk(x, 1, 3, "minecraft:iron_bars"));

  return p;
}

// ─── TREASURY ─────────────────────────────────────────────────────────────────
// 7×7 vault with deepslate brick walls, iron door, gold accent interior
function treasuryBlueprint(): BP[] {
  const p: BP[] = [];

  p.push(...fill(-3, 1, -3, 3, 6, 3, "minecraft:air"));
  p.push(...fill(-3, 0, -3, 3, 0, 3, "minecraft:deepslate_bricks")); // floor

  // Thick deepslate brick walls y=1-4
  p.push(...ring(-3, -3, 3, 3, 1, 4, "minecraft:deepslate_bricks"));
  // Extra inner wall layer for vault effect
  p.push(...ring(-2, -2, 2, 2, 1, 4, "minecraft:deepslate_bricks"));

  // Door gap on south (outer + inner)
  for (let y = 1; y <= 2; y++) {
    p.push(blk( 0, y, 3, "minecraft:air"));
    p.push(blk( 0, y, 2, "minecraft:air"));
  }
  // Iron bars as vault door frame
  p.push(blk(-1, 1, 2, "minecraft:iron_bars"), blk(1, 1, 2, "minecraft:iron_bars"));
  p.push(blk(-1, 2, 2, "minecraft:iron_bars"), blk(1, 2, 2, "minecraft:iron_bars"));

  // Windows — none (it's a vault)
  // Small air vents at y=4
  p.push(blk(3, 4, 0, "minecraft:air"), blk(-3, 4, 0, "minecraft:air"));

  // Deepslate brick roof cap y=5
  p.push(...fill(-3, 5, -3, 3, 5, 3, "minecraft:deepslate_bricks"));
  // Battlements on roof
  for (let x = -3; x <= 3; x += 2) {
    p.push(blk(x, 6, -3, "minecraft:deepslate_bricks"));
    p.push(blk(x, 6,  3, "minecraft:deepslate_bricks"));
  }
  for (let z = -2; z <= 2; z += 2) {
    p.push(blk(-3, 6, z, "minecraft:deepslate_bricks"));
    p.push(blk( 3, 6, z, "minecraft:deepslate_bricks"));
  }

  // Interior vault — gold block accents
  p.push(blk(-1, 1, -2, "minecraft:gold_block"), blk(1, 1, -2, "minecraft:gold_block"));
  p.push(blk( 0, 1, -2, "minecraft:gold_block"));
  p.push(blk(-1, 1,  0, "minecraft:chest"), blk(1, 1, 0, "minecraft:chest"));
  p.push(blk( 0, 2,  0, "minecraft:sea_lantern"));

  return p;
}

// ─── WAYPOINT ─────────────────────────────────────────────────────────────────
// 3×3 base, 5-tall stone obelisk with glowstone cap and lantern accents
function waypointBlueprint(): BP[] {
  const p: BP[] = [];
  // Clear air above
  p.push(...fill(-1, 1, -1, 1, 6, 1, "minecraft:air"));
  // Smooth stone base platform (flat 3×3, y=0)
  p.push(...fill(-1, 0, -1, 1, 0, 1, "minecraft:smooth_stone"));
  // Stone brick pillar y=1-4
  p.push(...fill(0, 1, 0, 0, 4, 0, "minecraft:stone_bricks"));
  // Chiseled stone accents at y=2
  p.push(blk(-1, 2, 0, "minecraft:chiseled_stone_bricks"), blk(1, 2, 0, "minecraft:chiseled_stone_bricks"));
  p.push(blk(0, 2, -1, "minecraft:chiseled_stone_bricks"), blk(0, 2, 1, "minecraft:chiseled_stone_bricks"));
  // Glowstone cap at y=5
  p.push(blk(0, 5, 0, "minecraft:glowstone"));
  // Sea lanterns at base corners y=0
  p.push(blk(-1, 0, -1, "minecraft:sea_lantern"), blk(1, 0, -1, "minecraft:sea_lantern"));
  p.push(blk(-1, 0,  1, "minecraft:sea_lantern"), blk(1, 0,  1, "minecraft:sea_lantern"));
  return p;
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────────

const BLUEPRINTS: Record<string, () => BP[]> = {
  "kingdoms:town_hall":    townHallBlueprint,
  "kingdoms:barracks":     barracksBlueprint,
  "kingdoms:market":       marketBlueprint,
  "kingdoms:granary":      granaryBlueprint,
  "kingdoms:blacksmith":   blacksmithBlueprint,
  "kingdoms:trade_station": tradeStationBlueprint,
  "kingdoms:treasury":     treasuryBlueprint,
  "kingdoms:waypoint":     waypointBlueprint,
};

/**
 * Generate the multi-block structure for the given kingdoms block.
 * Call this from afterEvents.playerPlaceBlock via system.run.
 * The kingdoms block at `origin` is left intact; only surrounding blocks are modified.
 */
export function generateStructure(
  dimension: Dimension,
  origin: Vector3,
  blockTypeId: string
): void {
  const blueprint = BLUEPRINTS[blockTypeId];
  if (!blueprint) return;

  const placements = blueprint();

  for (const bp of placements) {
    // Never overwrite the kingdoms block itself
    if (bp.x === 0 && bp.y === 0 && bp.z === 0) continue;
    try {
      const loc = {
        x: origin.x + bp.x,
        y: origin.y + bp.y,
        z: origin.z + bp.z,
      };
      dimension.getBlock(loc)?.setType(bp.b);
    } catch {
      // Skip unloaded chunks or out-of-bounds positions
    }
  }
}
