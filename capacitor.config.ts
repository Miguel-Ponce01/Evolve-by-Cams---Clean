import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'studio.evolve.pos',
  appName: 'Evolve by Cams',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    // During local development, developers can uncomment the server URL to load from the dev server.
    // e.g. url: 'http://10.0.2.2:3000', // standard android emulator loopback to localhost:3000
    cleartext: true
  }
};

export default config;
