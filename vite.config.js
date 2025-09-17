import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: './',
//   build: {
//     outDir: 'dist',
//     assetsDir: '.',
//     rollupOptions: {
//       external: ['vue'],
//       output: {
//         entryFileNames: '[name].js',
//         chunkFileNames: '[name].js',
//         assetFileNames: '[name].[ext]',
//         globals: {
//           vue: 'Vue'
//         }
//       }
//     }
//   },
//   server: {
//     port: 5173,
//     strictPort: true
//   },
//   optimizeDeps: {
//     include: ['vue']
//   }
})