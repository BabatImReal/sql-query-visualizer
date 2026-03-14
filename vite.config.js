import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  logLevel: 'error', // Suppress warnings, only show errors
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    // Uncomment below when using Base44 (requires @base44/vite-plugin to be installed)
    // base44({
    //   legacySDKImports: import.meta.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
    //   hmrNotifier: true,
    //   navigationNotifier: true,
    //   analyticsTracker: true,
    //   visualEditAgent: true
    // }),
    react(),
  ]
});