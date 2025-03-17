
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.skiniq.app',
  appName: 'SkinIQ',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  ios: {
    contentInset: 'always'
  }
};

export default config;
