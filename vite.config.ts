import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import dyadComponentTagger from '@dyad-sh/react-vite-component-tagger';

// Switch to function form so we can detect dev vs build and only enable the
// dyad component tagger during development (it can produce sourcemap issues in prod).
export default defineConfig(({ command }) => {
  const isDev = command === 'serve';

  return {
    plugins: [
      ...(isDev ? [dyadComponentTagger()] : []),
      react(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      commonjsOptions: {
        include: [/react-window/, /node_modules/],
        transformMixedEsModules: true
      },
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
        'sonner',
        'react-window'
      ]
    }
  };
});