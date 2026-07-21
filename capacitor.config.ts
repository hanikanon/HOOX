import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.cryptvora.app",
  appName: "Hoox",
  webDir: "dist",
  backgroundColor: "#000000",
  android: {
    backgroundColor: "#000000",
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 400,
      backgroundColor: "#000000",
      showSpinner: false,
      androidSplashResourceName: "splash",
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#000000",
      overlaysWebView: false,
    },
    Keyboard: {
      resize: "body",
      resizeOnFullScreen: true,
    },
  },
};

export default config;
