import AsyncStorage from "@react-native-async-storage/async-storage";
import { FirebaseError } from "firebase/app";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const environmentConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Object.values(environmentConfig).every(Boolean);

// A non-secret, inert config keeps static Expo exports renderable before a developer
// supplies .env.local. Auth actions stay disabled while this fallback is active.
const firebaseConfig = isFirebaseConfigured
  ? environmentConfig
  : {
      apiKey: "not-configured",
      authDomain: "not-configured.firebaseapp.com",
      projectId: "not-configured",
      storageBucket: "not-configured.firebasestorage.app",
      messagingSenderId: "000000000000",
      appId: "1:000000000000:web:not-configured",
    };

const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = (() => {
  try {
    return initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    if (
      error instanceof FirebaseError &&
      error.code !== "auth/already-initialized"
    ) {
      throw error;
    }
    return getAuth(firebaseApp);
  }
})();

export const db = getFirestore(firebaseApp);
