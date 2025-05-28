import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [audioOn, setAudioOn] = useState(true);

  useEffect(() => {
    // Load audio preference from storage
    const loadAudioPreference = async () => {
      try {
        const savedAudioState = await AsyncStorage.getItem('audioOn');
        if (savedAudioState !== null) {
          setAudioOn(JSON.parse(savedAudioState));
        }
      } catch (error) {
        console.error('Error loading audio preference:', error);
      }
    };

    loadAudioPreference();
  }, []);

  const toggleAudio = async () => {
    try {
      const newAudioState = !audioOn;
      setAudioOn(newAudioState);
      await AsyncStorage.setItem('audioOn', JSON.stringify(newAudioState));
    } catch (error) {
      console.error('Error saving audio preference:', error);
    }
  };

  return (
    <AudioContext.Provider value={{ audioOn, toggleAudio }}>
      {children}
    </AudioContext.Provider>
  );
}; 