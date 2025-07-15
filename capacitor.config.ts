import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.saber.app',
  appName: 'saber-movil',
  webDir: 'dist/libmovil/browser',
   server: {
    androidScheme: 'http',
    allowNavigation: [
      'http://192.168.1.8:5229/*',
      'https://192.168.1.8:5229/*'
    ]
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
  android: {
    allowMixedContent: true
  }
  
};

export default config;
