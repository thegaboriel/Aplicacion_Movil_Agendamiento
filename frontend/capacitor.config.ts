import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'Evento',
  webDir: 'www',
    server: {
    cleartext: true,
    androidScheme: 'http'
  }
};

export default config;
