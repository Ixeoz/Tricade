import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

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

let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
  setPersistence(auth, browserLocalPersistence).catch((e) => {
    console.warn('No se pudo establecer persistencia de sesión:', e);
  });
} else {
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  } catch (error) {
    console.warn('Error al inicializar Auth con persistencia:', error);
    // Fallback a la inicialización básica si hay error
    auth = getAuth(app);
  }
}

export { auth };
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app; 