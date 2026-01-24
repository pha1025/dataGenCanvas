import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  // --- 请新增/修改下面这一段 ---
  server: {
    // 监听所有地址，方便局域网手机测试
    host: '0.0.0.0',
    // 强制开启轮询 (修复 Windows 下热更新失效的核心设置)
    watch: {
      usePolling: true
    },
    // 如果你的端口被占用，可以在这里指定
    // port: 5173
  }
})
