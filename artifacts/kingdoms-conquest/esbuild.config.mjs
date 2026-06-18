import * as esbuild from "esbuild";

const isWatch = process.argv.includes("--watch");

const ctx = await esbuild.context({
  entryPoints: ["src/main.ts"],
  bundle: true,
  format: "esm",
  external: [
    "@minecraft/server",
    "@minecraft/server-ui",
    "@minecraft/server-net",
    "@minecraft/server-admin",
  ],
  outfile: "behavior_pack/scripts/main.js",
  platform: "neutral",
  target: "es2020",
  sourcemap: false,
  minify: false,
  logLevel: "info",
});

if (isWatch) {
  await ctx.watch();
  console.log("Watching for changes...");
} else {
  await ctx.rebuild();
  await ctx.dispose();
  console.log("Build complete: behavior_pack/scripts/main.js");
}
