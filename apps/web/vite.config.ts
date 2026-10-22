import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// .env vive en la raíz del monorepo
export default defineConfig({ plugins: [react()], envDir: '../..' })
