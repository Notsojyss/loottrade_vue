import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        vueDevTools(),
        tailwindcss(),
    ],
    server: {
        host: '0.0.0.0',  // Allows external access from Docker
        port: 5173,       // Change to 5173 if needed
        strictPort: true, // Ensures only this port is used
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        },
    },
    build: {
        outDir: resolve(__dirname, '../../loot_trade'), // Corrected for ESM compatibility
        emptyOutDir: true, // Cleans the directory before building
    },
    base: process.env.NODE_ENV === 'production' ? '/loot_trade/' : '/'
})
