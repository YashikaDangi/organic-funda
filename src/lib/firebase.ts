import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDFmYGZy-LbYIfab112I548WX4rxk6yEA8",
  authDomain: "organic-funda.firebaseapp.com",
  projectId: "organic-funda",
  storageBucket: "organic-funda.firebasestorage.app",
  messagingSenderId: "824428894547",
  appId: "1:824428894547:web:8e0cb49ead055b935aa9a6",
  measurementId: "G-KSSYZDPSET"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, provider, db };