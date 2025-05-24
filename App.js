import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/firebaseConfig';
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import AppNavigator from './src/navigation/AppNavigator';
import LoadingScreen from './src/views/LoadingScreen';

export default function App() {
  const [fontsLoaded] = useFonts({
    PressStart2P_400Regular,
  });
  const [user, setUser] = useState(undefined); // undefined = loading

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser || null);
    });
    return () => unsubscribe();
  }, []);

  if (!fontsLoaded || user === undefined) return <LoadingScreen />;
  return <AppNavigator user={user} />;
} 