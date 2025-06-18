import { defineConfig } from "vite";


export default defineConfig({
    root: "src/client/bundled",
    base: "/_/dist/",
    build: {
        target: "esnext",
        outDir: "../static/dist",
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: {
            output: {
                entryFileNames: "[name].js",
                chunkFileNames: "[name].js",
                assetFileNames: "[name].[ext]",
                sourcemapFileNames: "[name].js.map",
            },
        }
    }
});
