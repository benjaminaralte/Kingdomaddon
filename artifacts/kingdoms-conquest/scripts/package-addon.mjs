import archiver from "archiver";
import { createWriteStream, existsSync, mkdirSync } from "fs";
import { join, resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const outDir = resolve(root, "dist");

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const outputPath = join(outDir, "kingdoms-conquest.mcaddon");
const output = createWriteStream(outputPath);
const archive = archiver("zip", { zlib: { level: 9 } });

output.on("close", () => {
  const sizeKb = (archive.pointer() / 1024).toFixed(1);
  console.log(`\n✅ Packaged: ${outputPath}`);
  console.log(`   Size: ${sizeKb} KB`);
  console.log("\nInstall: double-click kingdoms-conquest.mcaddon in your file manager.");
});

archive.on("error", (err) => {
  throw err;
});

archive.pipe(output);

const bpDir = join(root, "behavior_pack");

archive.directory(bpDir, "KingdomsConquest_BP");

await archive.finalize();
