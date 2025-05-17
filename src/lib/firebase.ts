import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, enableMultiTabIndexedDbPersistence, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';
import { logger } from '@/utils/logger';

const firebaseConfig = {
  apiKey: "AIzaSyDFmYGZy-LbYIfab112I548WX4rxk6yEA8",
  authDomain: "organic-funda.firebaseapp.com",
  projectId: "organic-funda",
  storageBucket: "organic-funda.firebasestorage.app",
  messagingSenderId: "824428894547",
  appId: "1:824428894547:web:8e0cb49ead055b935aa9a6",
  measurementId: "G-KSSYZDPSET"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

// Configure Firestore for real-time synchronization
if (typeof window !== 'undefined') {
  try {
    logger.firestore.info('Configuring Firestore for real-time updates');
    
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
    
    logger.firestore.info('Firestore configured for real-time synchronization');
  } catch (error) {
    logger.firestore.error('Error configuring Firebase:', error);
  }
}

export { auth, provider, db };