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
    FirebaseAuthentication: {
      // Enables Google as a sign-in provider on the native layer. Also
      // needs: (1) android/app/google-services.json from Firebase Console,
      // (2) Google enabled under Authentication → Sign-in method, and
      // (3) your keystore's SHA-1 registered on the Android app in Firebase
      // Console → Project settings. See CALL_FIX_README_AR.md.
      providers: ["google.com"],
    },
  },
};

export default config;
