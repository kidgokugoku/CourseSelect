import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

import { resolve } from 'path'
// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'), // 设置 `@` 指向 `src` 目录
    },
  },

  plugins: [react()],
})
