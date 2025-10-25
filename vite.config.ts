import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-ui': [
            '@radix-ui/react-slot',
            '@radix-ui/react-dialog',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            'class-variance-authority',
            'clsx',
            'tailwind-merge'
          ],
          'vendor-supabase': ['@supabase/supabase-js', '@supabase/auth-ui-react'],
          'vendor-icons': ['lucide-react'],
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'vendor-charts': ['recharts'],
          'vendor-utils': ['date-fns', 'sonner'],
          
          // Feature chunks
          'chunk-auth': [
            './src/context/AuthContext',
            './src/pages/LoginPage',
            './src/pages/AuthCallbackPage'
          ],
          'chunk-dashboard': [
            './src/pages/DashboardPage',
            './src/pages/Index'
          ],
          'chunk-generators': [
            './src/pages/CaptionGeneratorPage',
            './src/pages/TaskGeneratorPage',
            './src/pages/TwitterGeneratorPage',
            './src/pages/RedditGeneratorPage',
            './src/pages/ResponseTemplatesPage'
          ],
          'chunk-tracking': [
            './src/pages/SubTrackerPage',
            './src/pages/TributeTrackerPage',
            './src/pages/ChecklistPage'
          ],
          'chunk-ai': [
            './src/pages/ChatAssistantPage',
            './src/pages/ImageVisionPage',
            './src/hooks/use-gemini',
            './src/hooks/use-ai-analytics'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      }
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react',
      'sonner'
    ]
  }
});