import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'studio.evolve.pos',
  appName: 'Evolve by Cams POS',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;
