import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    },
    server: {
        host: true,
        port: 5174,
        proxy: {
            '/api': {
                target: 'http://localhost:9090',
                changeOrigin: true
            },
            '/ws': {
                target: 'ws://localhost:9090',
                ws: true
            }
        }
    },
    build: {
        target: 'esnext',
        sourcemap: false
    }
});
