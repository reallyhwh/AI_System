import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // 配置开发服务器代理，解决 CORS 问题
  server: {
    proxy: {
      '/api/dify': {
        target: 'https://api.dify.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/dify/, ''),
        secure: true,
      },
    },
  },

  assetsInclude: ['**/*.svg', '**/*.csv'],
})
