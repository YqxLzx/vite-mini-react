const path = require('path');
import { defineConfig } from 'vite'
export default defineConfig({
  esbuild: {
    

  },
  resolve: {
    // 配置路径别名
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})