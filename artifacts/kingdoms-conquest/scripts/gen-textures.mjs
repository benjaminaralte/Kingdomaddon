import { PNG } from "pngjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const blocksDir = path.join(root, "resource_pack/textures/blocks");
const itemsDir = path.join(root, "resource_pack/textures/items");
const entityDir = path.join(root, "resource_pack/textures/entity");

fs.mkdirSync(blocksDir, { recursive: true });
fs.mkdirSync(itemsDir, { recursive: true });
fs.mkdirSync(entityDir, { recursive: true });

// ── Helpers ───────────────────────────────────────────────────────────────────

function hex(h) {
  const n = parseInt(h.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function writePng(filePath, width, height, drawFn) {
  const png = new PNG({ width, height, filterType: -1 });
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      png.data[idx] = r;
      png.data[idx + 1] = g;
      png.data[idx + 2] = b;
      png.data[idx + 3] = a ?? 255;
    }
  }
  fs.writeFileSync(filePath, PNG.sync.write(png));
  console.log("  wrote", path.relative(root, filePath));
}

function noise(x, y, scale = 20) {
  return ((Math.sin(x * 127.1 + y * 311.7) * 43758.5453) % 1) * scale;
}

// ── Block texture generator ───────────────────────────────────────────────────
// Draws a 16x16 stone-tile-like pattern with a base color and highlight color

function blockTile(base, highlight, border = null, emit = null) {
  const [br, bg, bb] = hex(base);
  const [hr, hg, hb] = hex(highlight);
  return (x, y) => {
    const n = Math.floor(noise(x, y)) - 10;
    const isBorder = border && (x === 0 || y === 0 || x === 15 || y === 15);
    const isDot = (x % 4 === 2 && y % 4 === 2);
    if (border && isBorder) {
      const [er, eg, eb] = hex(border);
      return [er, eg, eb];
    }
    if (isDot && emit) {
      const [er, eg, eb] = hex(emit);
      return [er + 40, eg + 40, eb + 40];
    }
    if (isDot) {
      return [hr, hg, hb];
    }
    return [br + n, bg + n, bb + n];
  };
}

function poleTexture(wood, ring) {
  const [wr, wg, wb] = hex(wood);
  const [rr, rg, rb] = hex(ring);
  return (x, y) => {
    const isRing = (y % 5 === 0);
    const isEdge = (x < 3 || x > 12);
    if (isRing) return [rr, rg, rb];
    if (isEdge) return [wr - 20, wg - 20, wb - 20];
    return [wr, wg, wb];
  };
}

// ── Block textures ────────────────────────────────────────────────────────────

const blocks = {
  town_hall:             blockTile("#7A7A7A", "#B0B080", "#C8A800"),
  barracks:              blockTile("#4A4A4A", "#707070", "#888888"),
  market:                blockTile("#C89000", "#F0C000", "#FF9800"),
  granary:               blockTile("#C8A000", "#F0D000", "#A07800"),
  blacksmith:            blockTile("#303030", "#555555", "#FF6600"),
  treasury:              blockTile("#D4A000", "#F5D000", "#A07800"),
  trade_station:         blockTile("#4A7A8A", "#6AAABB", "#2A5A6A"),
  guard_pole_village:    poleTexture("#8B6226", "#6B4216"),
  guard_pole_gate:       poleTexture("#4A3016", "#2A1A0A"),
  guard_pole_road:       poleTexture("#6A5040", "#4A3020"),
  guard_pole_watchtower: poleTexture("#909090", "#606060"),
  trade_pole:            poleTexture("#D4A000", "#A07800"),
};

for (const [name, drawFn] of Object.entries(blocks)) {
  writePng(path.join(blocksDir, `${name}.png`), 16, 16, drawFn);
}

// ── Item textures (16x16 silhouettes) ─────────────────────────────────────────

function itemSilhouette(base, accent) {
  const [br, bg, bb] = hex(base);
  const [ar, ag, ab] = hex(accent);
  return (x, y) => {
    const cx = 7.5, cy = 7.5;
    const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
    if (dist > 7) return [0, 0, 0, 0]; // transparent outside circle
    const isEdge = dist > 5.5;
    if (isEdge) return [ar, ag, ab];
    return [br, bg, bb];
  };
}

const items = {
  town_hall_tex:             itemSilhouette("#7A7A7A", "#C8A800"),
  treasury_tex:              itemSilhouette("#D4A000", "#F5D000"),
  barracks_tex:              itemSilhouette("#4A4A4A", "#888888"),
  market_tex:                itemSilhouette("#C89000", "#F0C000"),
  granary_tex:               itemSilhouette("#C8A000", "#F0D000"),
  blacksmith_tex:            itemSilhouette("#303030", "#FF6600"),
  guard_pole_village_tex:    itemSilhouette("#8B6226", "#F0C000"),
  guard_pole_watchtower_tex: itemSilhouette("#909090", "#E0E0E0"),
  trade_pole_tex:            itemSilhouette("#D4A000", "#FFFFFF"),
  recall_scroll_tex:         itemSilhouette("#F0E8C0", "#C8A050"),
  guard_token_tex:           itemSilhouette("#1A3A8A", "#7090C0"),
  spearman_token_tex:        itemSilhouette("#2D5A27", "#70C070"),
  archer_token_tex:          itemSilhouette("#8B6914", "#C8A050"),
  cavalry_token_tex:         itemSilhouette("#8B1A1A", "#C05050"),
};

for (const [name, drawFn] of Object.entries(items)) {
  writePng(path.join(itemsDir, `${name}.png`), 16, 16, drawFn);
}

// ── Entity skins (64x64 Minecraft humanoid UV layout) ─────────────────────────
// Fills skin regions with appropriate colors matching each troop type

function makeSkin(
  skinColor,   // face/hands color
  armorColor,  // body/legs armor color
  accentColor, // trim/detail color
  eyeColor = "#111111"
) {
  const [sr, sg, sb] = hex(skinColor);
  const [ar, ag, ab] = hex(armorColor);
  const [tr, tg, tb] = hex(accentColor);
  const [er, eg, eb] = hex(eyeColor);

  return (x, y) => {
    // Default transparent
    let r = 0, g = 0, b = 0, a = 0;

    // ── Head layer (0-31, 0-15) ──────────────────────────────────────────────
    // Top/bottom of head: x=8..23, y=0..7
    if (x >= 8 && x < 24 && y >= 0 && y < 8) {
      [r, g, b, a] = [ar, ag, ab, 255]; // helmet top
    }
    // Head sides/front/back: x=0..31, y=8..15
    if (y >= 8 && y < 16) {
      if (x >= 8 && x < 16) { // front face
        // Eyes
        const ey = y - 8;
        const ex = x - 8;
        if (ey === 2 && (ex === 1 || ex === 2 || ex === 5 || ex === 6)) {
          [r, g, b, a] = [er, eg, eb, 255];
        } else {
          [r, g, b, a] = [sr, sg, sb, 255];
        }
      } else if ((x >= 0 && x < 8) || (x >= 16 && x < 32)) {
        [r, g, b, a] = [sr, sg, sb, 255]; // sides/back of head
      }
    }

    // ── Body (16-47, 16-31) ───────────────────────────────────────────────────
    if (x >= 16 && x < 40 && y >= 16 && y < 32) {
      const shade = (y < 20) ? 0 : (x >= 20 && x < 28 ? 0 : -20);
      [r, g, b, a] = [ar + shade, ag + shade, ab + shade, 255];
      // Accent stripe down middle
      if (x >= 23 && x < 25 && y >= 20 && y < 32) {
        [r, g, b, a] = [tr, tg, tb, 255];
      }
    }

    // ── Right arm (40-55, 16-31) ──────────────────────────────────────────────
    if (x >= 40 && x < 56 && y >= 16 && y < 32) {
      [r, g, b, a] = [ar - 10, ag - 10, ab - 10, 255];
    }

    // ── Right leg (0-15, 16-31) ───────────────────────────────────────────────
    if (x >= 0 && x < 16 && y >= 16 && y < 32) {
      [r, g, b, a] = [ar - 15, ag - 15, ab - 15, 255];
    }

    // ── Left arm + left leg (second layer area, y=48-63) ─────────────────────
    if (y >= 48 && y < 64) {
      if (x >= 32 && x < 64) {
        [r, g, b, a] = [ar - 10, ag - 10, ab - 10, 255]; // left arm
      }
      if (x >= 16 && x < 32) {
        [r, g, b, a] = [ar - 15, ag - 15, ab - 15, 255]; // left leg
      }
    }

    // clamp
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));

    return [r, g, b, a];
  };
}

const soldiers = {
  city_guard:  makeSkin("#C8A878", "#1A3A8A", "#7090C0"),
  spearman:    makeSkin("#C8A878", "#2D5A27", "#70C070"),
  archer:      makeSkin("#C8A878", "#8B6914", "#C8A050"),
  cavalry:     makeSkin("#C8A878", "#8B1A1A", "#C05050"),
  bandit:      makeSkin("#707070", "#2A2A2A", "#606060", "#FF0000"),
};

for (const [name, drawFn] of Object.entries(soldiers)) {
  writePng(path.join(entityDir, `${name}.png`), 64, 64, drawFn);
}

// ── Copy pack icon to behavior pack too ───────────────────────────────────────
const rpIcon = path.join(root, "resource_pack/pack_icon.png");
const bpIcon = path.join(root, "behavior_pack/pack_icon.png");
if (fs.existsSync(rpIcon)) {
  fs.copyFileSync(rpIcon, bpIcon);
  console.log("  copied pack_icon.png to behavior_pack/");
}

console.log("\n✅ All textures generated.");
