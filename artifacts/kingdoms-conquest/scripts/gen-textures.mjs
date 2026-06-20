import { PNG } from "pngjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const blocksDir = path.join(root, "resource_pack/textures/blocks");
const itemsDir  = path.join(root, "resource_pack/textures/items");
const entityDir = path.join(root, "resource_pack/textures/entity");
fs.mkdirSync(blocksDir, { recursive: true });
fs.mkdirSync(itemsDir,  { recursive: true });
fs.mkdirSync(entityDir, { recursive: true });

// ─── Canvas API ───────────────────────────────────────────────────────────────

function Canvas(w, h) {
  const data = new Uint8Array(w * h * 4).fill(0);
  const c = {
    w, h, data,
    px(x, y, r, g, b, a = 255) {
      if (x < 0 || x >= w || y < 0 || y >= h) return;
      const i = (y * w + x) * 4;
      data[i]=cl(r); data[i+1]=cl(g); data[i+2]=cl(b); data[i+3]=a;
    },
    rect(x0, y0, x1, y1, r, g, b, a = 255) {
      for (let y = y0; y < y1; y++)
        for (let x = x0; x < x1; x++)
          c.px(x, y, r, g, b, a);
    },
    // Noisy fill — adds procedural texture variation
    nrect(x0, y0, x1, y1, r, g, b, amt = 12) {
      for (let y = y0; y < y1; y++)
        for (let x = x0; x < x1; x++) {
          const n = nz(x, y) * amt;
          c.px(x, y, r+n, g+n, b+n);
        }
    },
    // Shaded fill — top-left light source darkens bottom/right
    srect(x0, y0, x1, y1, r, g, b, amt = 12) {
      const dw = x1 - x0, dh = y1 - y0;
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const n = nz(x, y) * 8;
          const sh = (1 - ((x-x0)/dw)*0.25 - ((y-y0)/dh)*0.25);
          c.px(x, y, r*sh+n, g*sh+n, b*sh+n);
        }
      }
    },
  };
  return c;
}

function cl(v) { return Math.max(0, Math.min(255, Math.floor(v))); }
function nz(x, y) { return ((Math.sin(x * 127.1 + y * 311.7) * 43758.5453) % 1) * 2 - 1; }
function h2rgb(hex) {
  const n = parseInt(hex.replace("#",""), 16);
  return [(n>>16)&255, (n>>8)&255, n&255];
}

function writeCanvas(canvas, fp) {
  const png = new PNG({ width: canvas.w, height: canvas.h, filterType: -1 });
  png.data = Buffer.from(canvas.data);
  fs.writeFileSync(fp, PNG.sync.write(png));
  console.log("  wrote", path.relative(root, fp));
}

// ─── Drawing helpers ──────────────────────────────────────────────────────────

// Classic Minecraft brick pattern: 4px high bricks, alternating mortar joints
function isBrickMortar(x, y) {
  if (y % 4 === 0) return true;
  const offset = (Math.floor(y / 4) % 2) * 4;
  return (x + offset) % 8 === 0;
}

// Horizontal plank pattern: every 4 rows a darker line, subtle grain noise
function isPlankLine(y) { return y % 4 === 3; }

// ─── Block texture builder ────────────────────────────────────────────────────
// All blocks are 16x16

function blockStone(c, br, bg, bb, mr, mg, mb) {
  // Lay brickwork
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      if (isBrickMortar(x, y)) {
        c.px(x, y, mr+nz(x,y)*5, mg+nz(x,y)*5, mb+nz(x,y)*5);
      } else {
        // Top edge of each brick is lighter (lit), bottom darker (shadow)
        const rowIn = y % 4;
        const lit = rowIn === 1 ? 20 : rowIn === 3 ? -12 : 0;
        c.px(x, y, br+lit+nz(x,y)*10, bg+lit+nz(x,y)*10, bb+lit+nz(x,y)*10);
      }
    }
  }
}

function blockWood(c, wr, wg, wb) {
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const grain = nz(x*3, y) * 10;
      const dark = isPlankLine(y) ? -20 : 0;
      c.px(x, y, wr+dark+grain, wg+dark+grain*0.7, wb+dark+grain*0.4);
    }
  }
}

// Composite an 8x8 bitmap icon centered on a 16x16 canvas
// icon: array of 8 strings, each 8 chars: '.' = skip, '#' = draw
function drawIcon(c, icon, r, g, b, offX = 4, offY = 4) {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (icon[row][col] === '#') c.px(offX + col, offY + row, r, g, b);
    }
  }
}

const ICONS = {
  tower: [
    "#.#.#.#.",
    "########",
    "##....##",
    "##.##.##",
    "########",
    "##....##",
    "##.##.##",
    "########",
  ],
  swords: [
    "#.....#.",
    ".#...#..",
    "..###...",
    "...#....",
    "..###...",
    ".#...#..",
    "#.....#.",
    "###.###.",
  ],
  coin: [
    "..####..",
    ".##..##.",
    "#.####.#",
    "#.#$$#.#",
    "#.####.#",
    "#......#",
    ".##..##.",
    "..####..",
  ],
  wheat: [
    "...#....",
    "..###...",
    ".#.#.#..",
    "...#....",
    "...#....",
    "..###...",
    "...#....",
    "...####.",
  ],
  anvil: [
    "........",
    ".######.",
    ".######.",
    "..####..",
    "...##...",
    "..####..",
    "..####..",
    "..####..",
  ],
  chest: [
    ".######.",
    "#######.",
    "#.###..#",
    "########",
    "#.####.#",
    "#.####.#",
    "#......#",
    ".######.",
  ],
  cart: [
    ".####...",
    "#....#..",
    "#.##.#..",
    "#....#..",
    ".######.",
    "#.#..#.#",
    "#.#..#.#",
    ".#....#.",
  ],
  pole: [
    "...##...",
    "...##...",
    "..####..",
    "...##...",
    "...##...",
    "..####..",
    "...##...",
    "...##...",
  ],
};

// ─── Generate block textures ──────────────────────────────────────────────────

function makeBlock(name, fn) {
  const c = Canvas(16, 16);
  fn(c);
  writeCanvas(c, path.join(blocksDir, `${name}.png`));
}

// Town Hall — warm limestone bricks + tower icon + flag strip
makeBlock("town_hall", c => {
  blockStone(c, 168,158,142,  118,110,100);
  drawIcon(c, ICONS.tower, 220, 200, 50);
  // red banner stripe at x=7..8, y=2..7
  c.rect(7, 2, 9, 7, 180, 30, 30);
});

// Barracks — charcoal stone + crossed swords
makeBlock("barracks", c => {
  blockStone(c, 72,72,76,  50,50,54);
  drawIcon(c, ICONS.swords, 200, 200, 210);
  // dark vignette on edges
  for (let i = 0; i < 16; i++) {
    c.px(0, i, 30,30,34); c.px(15, i, 30,30,34);
    c.px(i, 0, 30,30,34); c.px(i, 15, 30,30,34);
  }
});

// Market — warm oak planks + gold coin
makeBlock("market", c => {
  blockWood(c, 158, 108, 52);
  drawIcon(c, ICONS.coin, 210, 172, 30);
});

// Granary — golden straw planks + wheat icon
makeBlock("granary", c => {
  blockWood(c, 180, 145, 50);
  drawIcon(c, ICONS.wheat, 80, 55, 15, 4, 4);
  // golden warm tint horizontal stripes
  for (let y = 0; y < 16; y += 5)
    c.rect(0, y, 16, y+1, 210, 172, 60, 120);
});

// Blacksmith — near-black stone + forge glow
makeBlock("blacksmith", c => {
  blockStone(c, 55,52,50,  38,36,34);
  // forge glow at bottom — orange/red gradient
  for (let y = 9; y < 16; y++) {
    const t = (y - 9) / 6;
    const r = cl(180 * t + 80), g = cl(90 * t + 20), b = 10;
    for (let x = 2; x < 14; x++) c.px(x, y, r+nz(x,y)*15, g, b);
  }
  drawIcon(c, ICONS.anvil, 200, 200, 210, 4, 1);
});

// Treasury — cold grey stone + vault ribs + emerald dots
makeBlock("treasury", c => {
  blockStone(c, 125,122,128,  85,82,88);
  drawIcon(c, ICONS.chest, 195, 165, 30);
  // emerald corner accents
  const gems = [[2,2],[13,2],[2,13],[13,13]];
  for (const [gx,gy] of gems) c.rect(gx, gy, gx+2, gy+2, 30, 180, 80);
});

// Trade Station — medium brown wood + cart wheel
makeBlock("trade_station", c => {
  blockWood(c, 130, 88, 42);
  drawIcon(c, ICONS.cart, 200, 170, 100);
});

// Guard pole variants — wooden pole with metal bands
function makePole(name, poleR, poleG, poleB, bandR, bandG, bandB) {
  makeBlock(name, c => {
    // Background: dark earth
    c.nrect(0, 0, 16, 16, 60, 48, 32, 10);
    // Pole center (5 wide)
    for (let y = 0; y < 16; y++) {
      c.px(5, y, poleR-30+nz(5,y)*8, poleG-30+nz(5,y)*8, poleB-30+nz(5,y)*8);
      c.px(6, y, poleR+20+nz(6,y)*5, poleG+20+nz(6,y)*5, poleB+20+nz(6,y)*5);
      c.px(7, y, poleR+nz(7,y)*8,    poleG+nz(7,y)*8,    poleB+nz(7,y)*8);
      c.px(8, y, poleR-10+nz(8,y)*8, poleG-10+nz(8,y)*8, poleB-10+nz(8,y)*8);
      c.px(9, y, poleR-25+nz(9,y)*6, poleG-25+nz(9,y)*6, poleB-25+nz(9,y)*6);
    }
    // Metal ring bands every 5 rows
    for (let y = 0; y < 16; y += 5) {
      c.rect(5, y, 10, y+2, bandR, bandG, bandB);
    }
  });
}

makePole("guard_pole_village",    138, 98, 48, 100, 100, 110);
makePole("guard_pole_gate",       85, 62, 32, 80, 80, 90);
makePole("guard_pole_road",       105, 78, 40, 90, 90, 100);
makePole("guard_pole_watchtower", 138, 98, 48, 170, 140, 50); // gold band watchtower

// Trade pole — ornate golden pole
makeBlock("trade_pole", c => {
  c.nrect(0, 0, 16, 16, 60, 50, 28, 8);
  for (let y = 0; y < 16; y++) {
    c.px(6, y, 130+nz(6,y)*8, 98+nz(6,y)*8, 18+nz(6,y)*5);
    c.px(7, y, 210+nz(7,y)*5, 168+nz(7,y)*5, 38);
    c.px(8, y, 192+nz(8,y)*5, 150+nz(8,y)*5, 28);
    c.px(9, y, 128+nz(9,y)*8, 95+nz(9,y)*8, 18);
  }
  c.rect(4, 0, 12, 3, 210, 168, 40); // flag holder cap
});

// ─── Item icon textures (16x16) ───────────────────────────────────────────────

function itemIcon(name, bgR, bgG, bgB, fgR, fgG, fgB, iconPattern, extraFn = null) {
  const c = Canvas(16, 16);
  // Background circle
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const cx = 7.5, cy = 7.5;
      const d = Math.sqrt((x-cx)**2 + (y-cy)**2);
      if (d > 7.5) { c.px(x, y, 0,0,0,0); continue; }
      const sh = 1 - d/16 * 0.4 + nz(x,y)*0.05;
      const rim = d > 6;
      if (rim) c.px(x, y, cl(bgR*0.6), cl(bgG*0.6), cl(bgB*0.6));
      else     c.px(x, y, cl(bgR*sh+nz(x,y)*8), cl(bgG*sh+nz(x,y)*8), cl(bgB*sh+nz(x,y)*8));
    }
  }
  if (iconPattern) drawIcon(c, iconPattern, fgR, fgG, fgB);
  if (extraFn) extraFn(c);
  writeCanvas(c, path.join(itemsDir, `${name}.png`));
}

// Building items — match block art
itemIcon("town_hall_tex",    145,135,120, 220,200,50, ICONS.tower);
itemIcon("barracks_tex",      60, 60, 64, 200,200,210, ICONS.swords);
itemIcon("market_tex",       148,100, 48, 210,172, 30, ICONS.coin);
itemIcon("granary_tex",      168,135, 46, 80, 55, 15, ICONS.wheat);
itemIcon("blacksmith_tex",    44, 42, 40, 230,130, 20, ICONS.anvil);
itemIcon("treasury_tex",     115,112,118, 200,165,30, ICONS.chest);
itemIcon("guard_pole_village_tex",   128, 92, 44, 100,100,110, ICONS.pole);
itemIcon("guard_pole_watchtower_tex",128, 92, 44, 190,158, 40, ICONS.pole);
itemIcon("trade_pole_tex",   190,150, 30, 230,200, 60, ICONS.pole);

// Recall scroll — parchment with red wax seal
itemIcon("recall_scroll_tex", 220, 200, 158, 180, 40, 40, null, c => {
  c.rect(4, 3, 12, 13, 235,215,170);
  c.rect(5, 4, 11, 12, 245,225,185);
  for (let row = 5; row < 12; row += 2)
    c.rect(6, row, 10, row+1, 160,130,80);
  c.rect(6, 11, 10, 13, 190,30,30);  // red seal
  c.rect(7, 12, 9, 13, 220,50,50);
});

// Troop tokens — coin-like medallions with distinctive symbols
const SHIELD_ICON = [
  ".######.",
  "#......#",
  "#.####.#",
  "#.#..#.#",
  ".#.##.#.",
  "..#..#..",
  "...##...",
  "...##...",
];
const SPEAR_ICON = [
  "...###..",
  "....##..",
  "....#...",
  "...#....",
  "..#.....",
  ".#......",
  "#.......",
  "#.......",
];
const BOW_ICON = [
  "..#.....",
  ".#.#....",
  "#..#....",
  "#...####",
  "#..#....",
  ".#.#....",
  "..#.....",
  "........",
];
const HORSEHEAD = [
  "..####..",
  ".##..#..",
  ".#...#..",
  ".####...",
  "..##....",
  ".####...",
  ".#..#...",
  ".#..#...",
];
const LONGSWORD = [
  "...#....",
  "..###...",
  "...#....",
  "...#....",
  "...#....",
  ".#####..",
  "...#....",
  "...#....",
];
const SKULL_ICON = [
  ".######.",
  "#.#..#.#",
  "##.##.##",
  "#......#",
  ".######.",
  "..#..#..",
  "..####..",
  "........",
];

itemIcon("guard_token_tex",        40, 60,140, 220,230,255, SHIELD_ICON);
itemIcon("spearman_token_tex",     55, 90, 50, 200,230,200, SPEAR_ICON);
itemIcon("archer_token_tex",      130, 90, 30, 230,210,130, BOW_ICON);
itemIcon("cavalry_token_tex",     140, 28, 38, 255,200,200, HORSEHEAD);
itemIcon("heavy_knight_token_tex", 20, 20, 26, 210,175, 40, LONGSWORD);

// Cavalry spear — iron tip on wooden shaft
const c_spear = Canvas(16, 16);
for (let y = 0; y < 16; y++) {  // shaft
  const x = 12 - y; if (x < 0 || x > 15) continue;
  c_spear.px(x, y, 120+nz(x,y)*12, 85+nz(x,y)*12, 38);
  if (x-1 >= 0) c_spear.px(x-1, y, 100, 68, 28);
}
// iron tip top-left corner
c_spear.px(14,0, 188,195,205); c_spear.px(15,0, 210,218,228);
c_spear.px(13,1, 178,185,195); c_spear.px(14,1, 200,208,218);
c_spear.px(12,2, 165,172,182); c_spear.px(13,2, 188,195,205);
c_spear.px(11,3, 155,162,172);
c_spear.px(15,1, 230,238,248); // highlight
writeCanvas(c_spear, path.join(itemsDir, "cavalry_spear_tex.png"));

// Heavy knight longsword — broad iron blade + gold cross guard
const c_sword = Canvas(16, 16);
// blade (3px wide, diagonal-ish vertical)
for (let y = 0; y < 10; y++) {
  c_sword.px(7, y, 188+nz(7,y)*8, 196+nz(7,y)*8, 208);
  c_sword.px(8, y, 210+nz(8,y)*5, 218+nz(8,y)*5, 230); // highlight
  c_sword.px(9, y, 158+nz(9,y)*8, 165+nz(9,y)*8, 175);
  if (y < 3) {
    c_sword.px(6, y, 175,182,192); // tip wider
    c_sword.px(10, y, 145,152,162);
  }
}
// gold cross guard
c_sword.rect(4, 10, 12, 12, 192, 158, 32);
c_sword.rect(5, 10,  7, 12, 220, 185, 55); // highlight on guard
// handle
for (let y = 12; y < 16; y++) {
  c_sword.px(7, y, 120+nz(7,y)*10, 82, 36);
  c_sword.px(8, y, 105+nz(8,y)*10, 68, 28);
}
c_sword.rect(6, 15, 10, 16, 80, 55, 20); // pommel
writeCanvas(c_sword, path.join(itemsDir, "heavy_knight_sword_tex.png"));

// ─── Spawn egg icons ──────────────────────────────────────────────────────────
// Each is 16x16: egg background + distinctive symbol + entity color tint

function spawnEgg(name, baseR, baseG, baseB, dotR, dotG, dotB, sym, symR, symG, symB) {
  const c = Canvas(16, 16);
  // Draw egg oval
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const nx = (x - 7.5) / 5.5, ny = (y - 8.5) / 7;
      const d = nx*nx + ny*ny;
      if (d > 1) { c.px(x, y, 0,0,0,0); continue; }
      const rim = d > 0.75;
      const sh = 1 - d * 0.4 + nz(x,y) * 0.05;
      if (rim) c.px(x, y, cl(baseR*0.55), cl(baseG*0.55), cl(baseB*0.55));
      else     c.px(x, y, cl(baseR*sh), cl(baseG*sh+nz(x,y)*8), cl(baseB*sh));
    }
  }
  // Spots on right half
  const spots = [[10,5],[11,9],[9,12],[12,7],[8,13]];
  for (const [sx,sy] of spots) {
    c.px(sx, sy, dotR, dotG, dotB);
    if (sx < 16 && sy < 16) c.px(sx-1, sy, cl(dotR*0.8), cl(dotG*0.8), cl(dotB*0.8));
  }
  // Symbol icon (3x6 miniature, centered left half)
  if (sym) drawIcon(c, sym, symR, symG, symB, 2, 5);
  writeCanvas(c, path.join(itemsDir, `${name}.png`));
}

// Mini icons for spawn eggs (6x6 portion of 8x8 array, using first 6 rows/cols)
const EGG_SHIELD = ["######","#....#","#.##.#","#.##.#","######","..##..","..##..","......"];
const EGG_SPEAR  = ["..##..","..#...","..#...","..#...","..#...","#####.","......","......"];
const EGG_BOW    = ["#.....","##....","#.##..","#...##","#.##..","##....","#.....","......"];
const EGG_HORSE  = ["..###.","..#.#.","..###.","..##..","..###.","..#.#.","......","......"];
const EGG_SWORD  = ["..#...","..#...","#####.","..#...","..#...","..#...","......","......"];
const EGG_SKULL  = [".####.","#.#.##","######","#....#",".####.","..##..","......","......"];

spawnEgg("city_guard_spawn_egg",   50, 80,150, 200,220,255, EGG_SHIELD, 230,240,255);
spawnEgg("spearman_spawn_egg",     60,100, 55, 200,240,200, EGG_SPEAR,  220,245,220);
spawnEgg("archer_spawn_egg",      130, 95, 35, 230,210,130, EGG_BOW,    245,225,150);
spawnEgg("cavalry_spawn_egg",     145, 30, 42, 255,200,200, EGG_HORSE,  255,220,220);
spawnEgg("heavy_knight_spawn_egg",  20, 20, 28, 192,158, 32, EGG_SWORD, 210,178, 50);
spawnEgg("bandit_spawn_egg",       50, 42, 35, 180, 30, 30, EGG_SKULL,  200, 50, 50);

// ─── Entity skins (64×32 — geometry.zombie UV layout) ────────────────────────
//
// KEY UV REGIONS in a 64×32 skin (all Y coordinates are in 0-31 range):
//   Head front:   x[8-16),  y[8-16)     — face we see
//   Head sides:   x[0-8),   y[8-16)     — right side
//                 x[16-24), y[8-16)     — left side  
//   Head back:    x[24-32), y[8-16)
//   Head top:     x[8-16),  y[0-8)
//   Body front:   x[20-28), y[20-32)    — chest
//   Body right:   x[16-20), y[20-32)
//   Body left:    x[28-32), y[20-32)
//   Body back:    x[32-40), y[20-32)
//   R Leg front:  x[4-8),   y[20-32)
//   R Arm front:  x[44-48), y[20-32)
//   R Arm right:  x[40-44), y[20-32)

function makeSkin(name, def) {
  const c = Canvas(64, 32);
  const S = def;

  // ── Head top ──────────────────────────────────────────────────────────────
  c.srect(8, 0, 16, 8, ...S.helm);

  // ── Head front (face) ─────────────────────────────────────────────────────
  // base fill
  c.nrect(8, 8, 16, 16, ...S.helm, 6);

  // face opening (skin area) — depends on helm style
  if (S.helmStyle === "open") {
    // Cheek guards on sides, open center
    c.rect(10, 10, 14, 15, ...S.skin);         // skin face center
    c.nrect(8, 8, 16, 10, ...S.helm, 5);       // brow band
    c.nrect(8, 15, 16, 16, ...S.helmDark, 4);  // chin band
    c.nrect(8, 10, 10, 15, ...S.helmDark, 4);  // left cheek guard
    c.nrect(14, 10, 16, 15, ...S.helmDark, 4); // right cheek guard
    // visor accent line
    c.rect(9, 9, 15, 10, ...S.helmLight);
    // eyes
    c.rect(10, 11, 12, 12, ...S.eye);
    c.rect(13, 11, 15, 12, ...S.eye);
    // mouth
    c.rect(11, 13, 14, 14, ...S.skin);
    c.px(11, 13, ...S.mouthDark); c.px(12, 13, ...S.mouthDark); c.px(13, 13, ...S.mouthDark);
  } else if (S.helmStyle === "half") {
    // Half-helm: steel top half, skin lower
    c.nrect(8, 8, 16, 12, ...S.helm, 5);       // iron half
    c.rect(9, 12, 15, 16, ...S.skin);           // skin lower
    // cheek guard nubs
    c.px(8, 12, ...S.helmDark); c.px(15, 12, ...S.helmDark);
    c.px(8, 13, ...S.helmDark); c.px(15, 13, ...S.helmDark);
    // brow highlight
    c.rect(9, 8, 15, 9, ...S.helmLight);
    // eyes (in the steel half, like visor slits)
    c.rect(10, 10, 12, 11, ...S.eye);
    c.rect(13, 10, 15, 11, ...S.eye);
    // nose
    c.px(11, 12, ...S.skinDark); c.px(12, 12, ...S.skinDark);
    // mouth
    c.px(10, 14, ...S.mouthDark); c.px(11, 14, ...S.mouthDark);
    c.px(12, 14, ...S.mouthDark); c.px(13, 14, ...S.mouthDark);
  } else if (S.helmStyle === "hood") {
    // Leather hood: soft hood, fully visible face
    c.nrect(8, 8, 16, 16, ...S.helm, 4);      // hood
    c.rect(9, 9, 15, 15, ...S.skin);           // face visible
    // hood shadow under brow
    c.rect(9, 9, 15, 10, ...S.helmDark);
    // eyes
    c.rect(10, 11, 12, 12, ...S.eye);
    c.rect(13, 11, 15, 12, ...S.eye);
    // nose highlight
    c.px(11, 12, ...S.skinLight); c.px(12, 12, ...S.skinLight);
    // friendly mouth
    c.px(10, 13, ...S.mouthDark); c.px(14, 13, ...S.mouthDark);
    c.rect(11, 14, 14, 15, ...S.mouthDark);
  } else if (S.helmStyle === "fullvisor") {
    // Full helm with gold visor (cavalry red)
    c.nrect(8, 8, 16, 16, ...S.helm, 5);
    c.rect(9, 8, 15, 9, ...S.helmLight);       // helm highlight
    // visor T-shape in gold
    c.rect(10, 10, 14, 12, ...S.visor);        // horizontal
    c.rect(11, 12, 13, 16, ...S.visor);        // vertical nose
    c.rect(9, 10, 11, 11, ...S.helmDark);      // left temple dark
    c.rect(13, 10, 15, 11, ...S.helmDark);     // right temple dark
    // cheek rivets
    c.px(9, 13, ...S.helmLight); c.px(14, 13, ...S.helmLight);
  } else if (S.helmStyle === "darkfull") {
    // Heavy Knight: black iron full helm, gold T-visor
    c.rect(8, 8, 16, 16, ...S.helm);
    // subtle surface variation
    for (let y=8;y<16;y++) for (let x=8;x<16;x++) {
      const n = nz(x,y)*12;
      c.px(x, y, S.helm[0]+n, S.helm[1]+n, S.helm[2]+n);
    }
    // top highlight edge
    c.rect(9, 8, 15, 9, S.helm[0]+30, S.helm[1]+30, S.helm[2]+30);
    // gold T-visor: horizontal bar
    c.rect(9, 11, 15, 12, ...S.visor);
    c.rect(9, 10, 15, 11, S.visor[0]+25, S.visor[1]+20, S.visor[2]);  // highlight
    // vertical nose bridge
    c.rect(11, 12, 13, 16, ...S.visor);
    c.rect(11, 12, 12, 16, S.visor[0]+20, S.visor[1]+15, S.visor[2]);
    // dark temples
    c.rect(8, 11, 10, 16, S.helm[0]-5, S.helm[1]-5, S.helm[2]-5);
    c.rect(14, 11, 16, 16, S.helm[0]-5, S.helm[1]-5, S.helm[2]-5);
  } else if (S.helmStyle === "bandit") {
    // Bandit: dark hood, menacing eyes, scar
    c.nrect(8, 8, 16, 16, ...S.helm, 6);
    c.rect(9, 10, 15, 16, ...S.skin);          // exposed face
    // hood shadow frames face
    c.rect(8, 8, 16, 11, ...S.helmDark);       // brow
    c.px(8, 11, ...S.helmDark); c.px(15, 11, ...S.helmDark);
    c.px(8, 12, ...S.helmDark); c.px(15, 12, ...S.helmDark);
    // menacing red eyes
    c.rect(9, 11, 11, 12, ...S.eye);
    c.rect(13, 11, 15, 12, ...S.eye);
    // eye glow
    c.px(10, 11, S.eye[0]+30, S.eye[1]+10, S.eye[2]+10);
    c.px(13, 11, S.eye[0]+30, S.eye[1]+10, S.eye[2]+10);
    // scar (from eye to cheek)
    c.px(12, 12, ...S.scar); c.px(13, 13, ...S.scar); c.px(13, 14, ...S.scar);
    // scowl
    c.rect(10, 14, 15, 15, ...S.mouthDark);
    c.px(10, 15, ...S.mouthDark); c.px(14, 15, ...S.mouthDark);
  }

  // ── Head sides / back ─────────────────────────────────────────────────────
  c.nrect(0, 8, 8, 16, ...S.helm, 5);          // right side
  c.nrect(16, 8, 24, 16, ...S.helmDark, 5);    // left side (slightly darker)
  c.nrect(24, 8, 32, 16, ...S.helm, 5);        // back

  // ── Body front (chest) ────────────────────────────────────────────────────
  c.srect(20, 20, 28, 32, ...S.armor);
  // Chest detail
  if (S.bodyStyle === "plate") {
    // Plate: shoulder plates at top, center emblem
    c.rect(20, 20, 28, 21, ...S.armorLight);   // shoulder highlight
    c.rect(20, 21, 28, 22, ...S.armor);
    // center vertical line
    c.rect(23, 20, 25, 32, S.armor[0]-8, S.armor[1]-8, S.armor[2]-8);
    // trim accent lines
    c.rect(20, 24, 28, 25, ...S.trim);         // belt line
    // lower torso (slightly darker)
    c.srect(20, 25, 28, 32, S.armor[0]-10, S.armor[1]-10, S.armor[2]-10);
    // chest emblem
    if (S.emblem) {
      const [er,eg,eb] = S.emblem;
      c.px(23, 21, er,eg,eb); c.px(24, 21, er,eg,eb);
      c.rect(22, 22, 26, 23, er,eg,eb);
      c.px(23, 23, er,eg,eb); c.px(24, 23, er,eg,eb);
    }
  } else if (S.bodyStyle === "chain") {
    // Chain mail: dot/ring pattern
    for (let y = 20; y < 32; y++) {
      for (let x = 20; x < 28; x++) {
        const ring = (x + y) % 2 === 0;
        if (ring) c.px(x, y, S.armor[0]+18, S.armor[1]+18, S.armor[2]+18);
      }
    }
    c.rect(20, 20, 28, 21, ...S.armorLight);
    c.rect(20, 24, 28, 25, ...S.trim); // belt
  } else if (S.bodyStyle === "leather") {
    c.srect(20, 20, 28, 32, ...S.armor);
    c.rect(20, 24, 28, 26, ...S.trim);  // belt
    c.rect(23, 20, 25, 24, S.armor[0]+12, S.armor[1]+12, S.armor[2]+12); // seam
    c.rect(20, 20, 28, 21, ...S.armorLight);
  } else if (S.bodyStyle === "rags") {
    // Ragged: uneven patches
    for (let y = 20; y < 32; y++) {
      for (let x = 20; x < 28; x++) {
        const rag = Math.abs(nz(x*2, y*2)) > 0.4;
        c.px(x, y, S.armor[0]+(rag?10:-10)+nz(x,y)*15, S.armor[1]+(rag?8:-8), S.armor[2]+(rag?6:-6));
      }
    }
  }

  // ── Body sides / back ─────────────────────────────────────────────────────
  c.srect(16, 20, 20, 32, S.armor[0]-18, S.armor[1]-18, S.armor[2]-18);
  c.srect(28, 20, 32, 32, S.armor[0]-12, S.armor[1]-12, S.armor[2]-12);
  c.srect(32, 20, 40, 32, S.armor[0]-8,  S.armor[1]-8,  S.armor[2]-8);

  // ── Right arm ─────────────────────────────────────────────────────────────
  c.srect(44, 20, 48, 32, ...S.arm);
  c.srect(40, 20, 44, 32, S.arm[0]-18, S.arm[1]-18, S.arm[2]-18);
  c.rect(44, 20, 48, 21, ...S.armorLight); // shoulder highlight
  // gauntlet at bottom
  c.rect(44, 28, 48, 32, ...S.gauntlet);
  c.rect(44, 28, 48, 29, cl(S.gauntlet[0]+20), cl(S.gauntlet[1]+20), cl(S.gauntlet[2]+20));

  // ── Right leg ─────────────────────────────────────────────────────────────
  c.srect(4, 20, 8, 32, ...S.leg);
  c.srect(0, 20, 4, 32, S.leg[0]-18, S.leg[1]-18, S.leg[2]-18);
  // boot at bottom
  c.rect(4, 28, 8, 32, ...S.boot);
  c.rect(4, 28, 8, 29, cl(S.boot[0]+20), cl(S.boot[1]+20), cl(S.boot[2]+20));

  // ── Fill remaining areas (back of arms, legs) ─────────────────────────────
  c.srect(48, 20, 56, 32, S.arm[0]-12, S.arm[1]-12, S.arm[2]-12);
  c.srect(8, 20, 16, 32, S.leg[0]-12, S.leg[1]-12, S.leg[2]-12);

  writeCanvas(c, path.join(entityDir, `${name}.png`));
}

// ─── Soldier definitions ──────────────────────────────────────────────────────
//  Each troop type gets a distinct medieval look

makeSkin("city_guard", {
  helmStyle: "open",
  helm:      [62, 82, 148],   helmetDark: [40, 55, 110],  // deep royal blue
  helmDark:  [40, 55, 110],
  helmLight: [100, 128, 200],
  skin:      [198, 160, 118],  skinDark: [165, 125, 85], skinLight: [218, 182, 145],
  eye:       [22, 18, 14],
  mouthDark: [145, 90, 65],
  scar:      [150,50,50],
  armor:     [52, 72, 138],   armorLight: [88, 112, 185],
  trim:      [198, 165, 35],
  emblem:    [198, 165, 35],  // gold cross
  arm:       [48, 68, 130],
  gauntlet:  [38, 55, 105],
  leg:       [44, 62, 122],
  boot:      [28, 38, 70],
  bodyStyle: "plate",
  visor:     [198, 165, 35],
});

makeSkin("spearman", {
  helmStyle: "half",
  helm:      [120, 128, 140],
  helmDark:  [85, 92, 102],
  helmLight: [168, 176, 188],
  skin:      [200, 162, 120],  skinDark: [168, 128, 88], skinLight: [220, 185, 148],
  eye:       [30, 22, 14],
  mouthDark: [148, 92, 68],
  scar:      [160,60,60],
  armor:     [105, 112, 122],  armorLight: [148, 156, 168],
  trim:      [175, 182, 192],
  arm:       [98, 105, 115],
  gauntlet:  [78, 85, 95],
  leg:       [95, 102, 112],
  boot:      [62, 55, 42],
  bodyStyle: "chain",
  emblem:    null,
  visor:     [180, 188, 200],
});

makeSkin("archer", {
  helmStyle: "hood",
  helm:      [52, 80, 45],
  helmDark:  [35, 55, 30],
  helmLight: [75, 108, 68],
  skin:      [200, 162, 120],  skinDark: [168, 128, 88], skinLight: [220, 185, 148],
  eye:       [30, 22, 14],
  mouthDark: [148, 92, 68],
  scar:      [150,50,50],
  armor:     [62, 92, 55],    armorLight: [88, 128, 78],
  trim:      [130, 88, 38],   // brown belt
  arm:       [55, 85, 48],
  gauntlet:  [128, 85, 36],   // leather bracers
  leg:       [55, 80, 48],
  boot:      [88, 62, 28],
  bodyStyle: "leather",
  emblem:    null,
  visor:     [75, 108, 68],
});

makeSkin("cavalry", {
  helmStyle: "fullvisor",
  helm:      [148, 32, 44],
  helmDark:  [105, 22, 30],
  helmLight: [195, 58, 72],
  skin:      [200, 162, 120],  skinDark: [168, 128, 88], skinLight: [220, 185, 148],
  eye:       [22, 14, 10],
  mouthDark: [148, 92, 68],
  scar:      [150,50,50],
  armor:     [132, 28, 40],    armorLight: [178, 52, 65],
  trim:      [198, 162, 30],
  emblem:    [198, 162, 30],
  arm:       [122, 25, 36],
  gauntlet:  [188, 152, 28],   // gold gauntlets
  leg:       [118, 22, 32],
  boot:      [88, 15, 22],
  bodyStyle: "plate",
  visor:     [198, 162, 30],
});

makeSkin("heavy_knight", {
  helmStyle: "darkfull",
  helm:      [24, 24, 30],
  helmDark:  [14, 14, 18],
  helmLight: [52, 52, 62],
  skin:      [200, 162, 120],  skinDark: [168, 128, 88], skinLight: [220, 185, 148],
  eye:       [22, 14, 10],
  mouthDark: [22, 14, 10],
  scar:      [80,60,30],
  armor:     [32, 32, 40],     armorLight: [58, 58, 72],
  trim:      [192, 155, 30],
  emblem:    [192, 155, 30],   // gold cross emblem
  arm:       [28, 28, 36],
  gauntlet:  [192, 155, 30],   // gold knuckles
  leg:       [26, 26, 34],
  boot:      [192, 155, 30],   // gold sabatons
  bodyStyle: "plate",
  visor:     [192, 155, 30],
});

makeSkin("bandit", {
  helmStyle: "bandit",
  helm:      [42, 36, 30],
  helmDark:  [28, 22, 18],
  helmLight: [62, 54, 46],
  skin:      [118, 98, 78],    skinDark: [88, 68, 52], skinLight: [145, 122, 100],
  eye:       [200, 20, 20],
  mouthDark: [80, 32, 25],
  scar:      [175, 80, 60],
  armor:     [55, 48, 40],     armorLight: [78, 68, 58],
  trim:      [72, 60, 48],
  arm:       [48, 40, 32],
  gauntlet:  [38, 30, 24],
  leg:       [45, 38, 30],
  boot:      [32, 25, 18],
  bodyStyle: "rags",
  emblem:    null,
  visor:     [72, 60, 48],
});

// Also copy heavy_knight skin (already made separately — overwrite with quality version)
makeSkin("heavy_knight", {
  helmStyle: "darkfull",
  helm:      [24, 24, 30],
  helmDark:  [14, 14, 18],
  helmLight: [52, 52, 62],
  skin:      [200, 162, 120],  skinDark: [168, 128, 88], skinLight: [220, 185, 148],
  eye:       [22, 14, 10],
  mouthDark: [22, 14, 10],
  scar:      [80,60,30],
  armor:     [32, 32, 40],     armorLight: [58, 58, 72],
  trim:      [192, 155, 30],
  emblem:    [192, 155, 30],
  arm:       [28, 28, 36],
  gauntlet:  [192, 155, 30],
  leg:       [26, 26, 34],
  boot:      [192, 155, 30],
  bodyStyle: "plate",
  visor:     [192, 155, 30],
});

// ─── Update entity client files to use custom spawn egg textures ──────────────
const entityMap = {
  "kingdoms:city_guard":  "city_guard_spawn_egg",
  "kingdoms:spearman":    "spearman_spawn_egg",
  "kingdoms:archer":      "archer_spawn_egg",
  "kingdoms:cavalry":     "cavalry_spawn_egg",
  "kingdoms:heavy_knight":"heavy_knight_spawn_egg",
  "kingdoms:bandit":      "bandit_spawn_egg",
};

const rpEntityDir = path.join(root, "resource_pack/entity");
for (const file of fs.readdirSync(rpEntityDir)) {
  if (!file.endsWith(".entity.json")) continue;
  const fp = path.join(rpEntityDir, file);
  const obj = JSON.parse(fs.readFileSync(fp, "utf8"));
  const desc = obj["minecraft:client_entity"].description;
  const texKey = entityMap[desc.identifier];
  if (texKey) {
    desc.spawn_egg = { texture: texKey, texture_index: 0 };
    fs.writeFileSync(fp, JSON.stringify(obj, null, 2));
    console.log("  updated spawn_egg for", desc.identifier);
  }
}

// Register new spawn egg textures in item_texture.json
const itFp = path.join(root, "resource_pack/textures/item_texture.json");
const itJson = JSON.parse(fs.readFileSync(itFp, "utf8"));
for (const [, texKey] of Object.entries(entityMap)) {
  itJson.texture_data[texKey] = { textures: `textures/items/${texKey}` };
}
fs.writeFileSync(itFp, JSON.stringify(itJson, null, 2));
console.log("  updated item_texture.json with spawn egg entries");

// ─── Copy pack icon ───────────────────────────────────────────────────────────
const rpIcon = path.join(root, "resource_pack/pack_icon.png");
const bpIcon = path.join(root, "behavior_pack/pack_icon.png");
if (fs.existsSync(rpIcon)) {
  fs.copyFileSync(rpIcon, bpIcon);
  console.log("  copied pack_icon.png to behavior_pack/");
}

console.log("\n✅ All textures generated.");
