import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.findomassistant',
  appName: 'Findom Assistant',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#111827",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      spinnerStyle: "large",
      spinnerColor: "#6366f1"
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#111827'
    },
    App: {
      appendUserAgent: 'FindomAssistant/1.0'
    }
  }
};

export default config;