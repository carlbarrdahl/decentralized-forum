import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import polyfillNode from "rollup-plugin-polyfill-node";
import { esbuildCommonjs } from "@originjs/vite-plugin-commonjs";
import { viteCommonjs } from "@originjs/vite-plugin-commonjs";

// import builtins from "rollup-plugin-node-builtins";

// https://vitejs.dev/config/
export default defineConfig({
  define: { "process.env": {} },
  resolve: { alias: { path: "path-browserify" } },
  plugins: [
    react(),
    polyfillNode(),

    // viteCommonjs({
    //   include: ["@self.id/framework"],
    // }),
  ],
  // optimizeDeps: {
  //   esbuildOptions: {
  //     plugins: [esbuildCommonjs(["@self.id/react"])],
  //   },
  // },
  // build: {
  //   commonjsOptions: {
  //     include: [/node_modules/],
  //   },
  // },
  // optimizeDeps: {
  //   include: ["@self.id/framework"],
  //   // },
  //   //   // include: ["@self.id/framework"],
  //   esbuildOptions: {
  //     // plugins: [esbuildCommonjs(["@self.id/framework"])],
  //   },
  //   //   // exclude: ["web3", ], // <= The libraries that need shimming should be excluded from dependency optimization.
  // },
});
