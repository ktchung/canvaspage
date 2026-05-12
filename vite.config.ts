import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import pkg from './package.json'

export default defineConfig({
  publicDir: resolve(__dirname, 'public'),
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version)
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  plugins: [
    TanStackRouterVite({
      routesDirectory: resolve(__dirname, 'src/routes'),
      generatedRouteTree: resolve(__dirname, 'src/routeTree.gen.ts')
    }),
    tailwindcss(),
    react()
  ],
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true
  }
})
