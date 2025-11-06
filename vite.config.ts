import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
        },
    },
    build: {
        outDir: path.resolve(__dirname, "dist"),
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, "src/index.html"),
                nested: path.resolve(__dirname, "src/project/index.html"),
            },
        },
    },
    plugins: [react(), tailwindcss()],
    root: "src",
});

console.log(path.resolve(__dirname, "pages/index.html"));
