import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import dyadComponentTagger from '@dyad-sh/react-vite-component-tagger';

export default defineConfig({
  plugins: [dyadComponentTagger(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
          ],
          charts: ['recharts'],
          utils: ['date-fns', 'clsx', 'tailwind-merge'],
          
          // Feature chunks
          auth: ['@supabase/auth-ui-react', '@supabase/auth-ui-shared'],
          ai: ['@tanstack/react-query'],
          
          // Page chunks
          dashboard: [
            './src/pages/DashboardPage.tsx',
            './src/components/TributeChart.tsx',
            './src/components/AIInsightsDashboard.tsx'
          ],
          chat: [
            './src/pages/ChatAssistantPage.tsx',
            './src/components/AIContentSuggestions.tsx',
            './src/components/AIChatbot.tsx',
            './src/components/SentimentAnalysis.tsx'
          ],
          generators: [
            './src/pages/TwitterGeneratorPage.tsx',
            './src/pages/RedditGeneratorPage.tsx',
            './src/pages/CaptionGeneratorPage.tsx'
          ],
          tracking: [
            './src/pages/SubTrackerPage.tsx',
            './src/pages/TributeTrackerPage.tsx'
          ]
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `js/[name]-[hash].js`;
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: true,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
    ],
  },
});