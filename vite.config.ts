import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');

    return {
        plugins: [react()],
        // Use a configurable subpath for deployments behind a shared domain.
        base: env.VITE_BASE_PATH || '/',
    };
});
