import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
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
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'vendor-lucide': ['lucide-react'],
          'vendor-leaflet': ['leaflet', 'react-leaflet'],
          // Portal chunks (each portal = separate chunk for code-splitting)
          'portal-citizen': ['./src/pages/portals/CitizenPortal.tsx'],
          'portal-gov': ['./src/pages/portals/GovPortal.tsx'],
          'portal-univ': ['./src/pages/portals/UniversityPortal.tsx'],
          'portal-industry': ['./src/pages/portals/IndustryPortal.tsx'],
          'portal-admin': ['./src/pages/portals/AdminPortal.tsx'],
          'portal-community': ['./src/pages/portals/CommunityPortal.tsx'],
          'portal-pri': ['./src/pages/portals/PRIPortal.tsx'],
          'portal-ulb': ['./src/pages/portals/ULBPortal.tsx'],
          'portal-lab': ['./src/pages/portals/LabPortal.tsx'],
          // Shared services chunk
          'services': [
            './src/services/firebaseService.ts',
            './src/services/workflowStore.ts',
            './src/services/workflowLifecycle.ts',
            './src/services/universityData.ts',
            './src/services/mapDataService.ts',
            './src/services/aiTriageEngine.ts',
            './src/services/heiMatchingEngine.ts',
            './src/services/aiVisionClassifier.ts',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  server: {
    port: 3000,
    open: true,
  },
});
