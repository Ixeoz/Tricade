import React, { useEffect, useState, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/firebaseConfig';
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import AppNavigator from './src/navigation/AppNavigator';
import LoadingScreen from './src/views/LoadingScreen';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const AudioContext = React.createContext({ audioOn: false, toggleAudio: () => {} });

export default function App() {
  const [fontsLoaded] = useFonts({
    PressStart2P_400Regular,
  });
  const [user, setUser] = useState(undefined); // undefined = loading
  const [audioOn, setAudioOn] = useState(false);
  const [sound, setSound] = useState(null);
  const webAudioRef = useRef(null);

  // Leer preferencia de audio al iniciar
  useEffect(() => {
    (async () => {
      try {
        const savedAudio = await AsyncStorage.getItem('audioOn');
        if (savedAudio === 'true') {
          setAudioOn(true);
        }
      } catch (e) {}
    })();
  }, []);

  // Manejar reproducción global multiplataforma
  useEffect(() => {
    let isMounted = true;
    async function playAudio() {
      if (audioOn) {
        if (Platform.OS === 'web') {
          if (!webAudioRef.current) {
            const audio = new window.Audio(require('./src/assets/audio-game.mp3'));
            audio.loop = true;
            audio.volume = 0.05; // volumen muy bajo
            webAudioRef.current = audio;
            try { await audio.play(); } catch (e) {}
          } else {
            try { await webAudioRef.current.play(); } catch (e) {}
          }
        } else if (!sound) {
          try {
            const { sound: newSound } = await Audio.Sound.createAsync(require('./src/assets/audio-game.mp3'), { shouldPlay: true, isLooping: true, volume: 0.05 });
            if (isMounted) setSound(newSound);
          } catch (e) {}
        }
      } else {
        if (Platform.OS === 'web' && webAudioRef.current) {
          webAudioRef.current.pause();
          webAudioRef.current.currentTime = 0;
        } else if (sound) {
          await sound.stopAsync();
          await sound.unloadAsync();
          if (isMounted) setSound(null);
        }
      }
    }
    playAudio();
    return () => {
      isMounted = false;
      if (Platform.OS === 'web' && webAudioRef.current) {
        webAudioRef.current.pause();
        webAudioRef.current = null;
      }
      if (sound) sound.unloadAsync();
    };
  }, [audioOn]);

  const toggleAudio = async () => {
    if (audioOn) {
      setAudioOn(false);
      await AsyncStorage.setItem('audioOn', 'false');
    } else {
      setAudioOn(true);
      await AsyncStorage.setItem('audioOn', 'true');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser || null);
    });
    return () => unsubscribe();
  }, []);

  if (!fontsLoaded || user === undefined) return <LoadingScreen />;
  return (
    <AudioContext.Provider value={{ audioOn, toggleAudio }}>
      <AppNavigator user={user} />
    </AudioContext.Provider>
  );
} 