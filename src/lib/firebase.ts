import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { logger } from "@/utils/logger";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

// Configure Firestore for real-time synchronization
if (typeof window !== "undefined") {
  try {
    logger.firestore.info("Configuring Firestore for real-time updates");

    // Use Firestore's setLogLevel to enable detailed logging in development
    // import { setLogLevel } from 'firebase/firestore';
    // setLogLevel('debug');

    // Force immediate synchronization with server
    const firestoreSettings = {
      experimentalForceLongPolling: true, // Use long polling for more reliable connections
    };

    // Apply settings to Firestore instance
    // @ts-ignore - Firestore settings method exists but TypeScript doesn't recognize it
    db._setSettings(firestoreSettings);

    logger.firestore.info("Firestore configured for real-time synchronization");
  } catch (error) {
    logger.firestore.error("Error configuring Firebase:", error);
  }
}

export { auth, provider, db };
