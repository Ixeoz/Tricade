import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBglNhaA2Luybobsc7EejZdoKZ_8bofrU0',
  authDomain: 'tricade-f3804.firebaseapp.com',
  projectId: 'tricade-f3804',
  storageBucket: 'tricade-f3804.appspot.com',
  messagingSenderId: '84179101443',
  appId: '1:84179101443:web:5275d942ebf128ccbb6b36',
  measurementId: 'G-G3XC2GHPNN',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Forzar persistencia solo en web
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch((e) => {
    console.warn('No se pudo establecer persistencia de sesión:', e);
  });
}

export const db = getFirestore(app);
export const storage = getStorage(app);

export default app; 