import { defineConfig } from "vite"
import { resolve } from "path"

const port = 3000

export default defineConfig({
    root: resolve("./src/client/internal/"),
    server: {
        proxy: {
            "/socket": `http://localhost:${port}/socket`,
        },
        host: "0.0.0.0",
    },
    define: {
        serverUrl: `"http://localhost:${port}"`,
    }
})