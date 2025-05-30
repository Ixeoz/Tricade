import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, Modal, TextInput, Pressable, Platform, SafeAreaView, ActivityIndicator, ScrollView, Animated, Easing } from 'react-native';
import RetroButton from '../components/RetroButton';
import userPinkIcon from '../assets/user-pink.png';
import { auth, db, storage } from '../firebaseConfig';
import { updateProfile, onAuthStateChanged, signOut, sendEmailVerification } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL, getStorage } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { doc, getDoc, setDoc, increment, updateDoc } from 'firebase/firestore';
import editarRosaIcon from '../assets/editar_rosa.png';
import { useFonts } from 'expo-font';
import {
  screenWidth as width,
  screenHeight as height,
  wp,
  hp,
  SPACING,
  FONT_SIZES,
  scaleDimension,
  scaleFont,
  getResponsiveDimension
} from '../utils/dimensions';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AudioContext } from '../../App';
import BottomTabBar from '../components/BottomTabBar';
import { GAME_SCORES, getExpForLevel, SPECIAL_AVATARS } from '../utils/scoreConfig';
import { checkAndUpdateMissions } from '../utils/missions';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

const pixelFont = 'PressStart2P_400Regular';

const pixelStroke = [
  { textShadowOffset: { width: -4, height: 0 }, textShadowColor: '#000', textShadowRadius: 0 },
  { textShadowOffset: { width: 4, height: 0 }, textShadowColor: '#000', textShadowRadius: 0 },
  { textShadowOffset: { width: 0, height: -4 }, textShadowColor: '#000', textShadowRadius: 0 },
  { textShadowOffset: { width: 0, height: 4 }, textShadowColor: '#000', textShadowRadius: 0 },
  { textShadowOffset: { width: -4, height: -4 }, textShadowColor: '#000', textShadowRadius: 0 },
  { textShadowOffset: { width: 4, height: -4 }, textShadowColor: '#000', textShadowRadius: 0 },
  { textShadowOffset: { width: -4, height: 4 }, textShadowColor: '#000', textShadowRadius: 0 },
  { textShadowOffset: { width: 4, height: 4 }, textShadowColor: '#000', textShadowRadius: 0 },
];

const defaultAvatar = require('../assets/user-pink.png');
const avatarOptions = [
  require('../assets/user-blue.png'),
  require('../assets/user-pink.png'),
];

const audioOnIcon = require('../assets/audio-on.png');
const audioOffIcon = require('../assets/audio-off.png');
const audioGame = require('../assets/audio-game.mp3');
const audioPapi = require('../assets/audio-pizza.mp3');

// Contexto global para el usuario
export const UserCacheContext = createContext();
export function useUserCache() { return useContext(UserCacheContext); }

export default function ProfileScreen({ navigation, isTab }) {
  const [fontsLoaded] = useFonts({
    'PressStart2P_400Regular': require('../../assets/fonts/PressStart2P-Regular.ttf'),
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState(userPinkIcon);
  const [level, setLevel] = useState(0);
  const [exp, setExp] = useState(0);
  const [expMax, setExpMax] = useState(600);

  // Modal edición
  const [modalVisible, setModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState(null);
  const [selectedAvatarIndex, setSelectedAvatarIndex] = useState(0);

  const [loggingOut, setLoggingOut] = useState(false);

  // Nuevo: usar caché global
  const [userCache, setUserCache] = useState(null);

  const { audioOn, toggleAudio } = useContext(AudioContext);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.7)).current;
  const formFadeAnim = useRef(new Animated.Value(0)).current;
  const formSlideAnim = useRef(new Animated.Value(1)).current;

  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showProfilePicModal, setShowProfilePicModal] = useState(false);
  const audioRef = useRef(null);
  const audioElementRef = useRef(null); // Para web

  const [resending, setResending] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setCurrentUser(user);
          let displayName = user.displayName;
          let userLevel = 0;
          let userExp = 0;
          let avatarSpecial = null;
          // Si no hay nombre en Auth, intentar obtenerlo desde Firestore
          try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              const data = userDoc.data();
              displayName = data.displayName || displayName;
              userLevel = data.level ?? 0;
              userExp = data.exp ?? 0;
              avatarSpecial = data.avatarSpecial || null;
              // --- Lógica de avatar especial retroactiva ---
              let newAvatarSpecial = null;
              if (userLevel >= 20) newAvatarSpecial = 'hidden.3.jpg';
              else if (userLevel >= 10) newAvatarSpecial = 'hidden.2.jpg';
              else if (userLevel >= 5) newAvatarSpecial = 'hidden.1.jpg';
              // Si el usuario no tiene avatar especial o tiene uno de menor nivel, actualizarlo
              const avatarPriority = { null: 0, 'hidden.1.jpg': 1, 'hidden.2.jpg': 2, 'hidden.3.jpg': 3 };
              if (newAvatarSpecial && avatarPriority[newAvatarSpecial] > avatarPriority[avatarSpecial]) {
                await setDoc(doc(db, 'users', user.uid), { avatarSpecial: newAvatarSpecial, photoURL: null }, { merge: true });
                avatarSpecial = newAvatarSpecial;
              }
              // Mostrar el avatar especial si existe
              let specialImg = null;
              if (avatarSpecial === 'hidden.1.jpg') specialImg = require('../assets/hidden.1.jpg');
              else if (avatarSpecial === 'hidden.2.jpg') specialImg = require('../assets/hidden.2.jpg');
              else if (avatarSpecial === 'hidden.3.jpg') specialImg = require('../assets/hidden.3.jpg');
              if (specialImg) setAvatar(specialImg);
              else if (user.photoURL) setAvatar({ uri: user.photoURL });
              else setAvatar(userPinkIcon);
            } else if (user.photoURL) {
              setAvatar({ uri: user.photoURL });
            } else {
              setAvatar(userPinkIcon);
            }
            // Actualizar Auth con el nombre de Firestore
            if (displayName && user.displayName !== displayName) {
              await updateProfile(user, { displayName });
            }
          } catch (firestoreError) {
            console.warn('Error al conectar con Firestore:', firestoreError);
            // Usar datos locales si Firestore no está disponible
            if (user.photoURL) {
              setAvatar({ uri: user.photoURL });
            } else {
              setAvatar(userPinkIcon);
            }
          }
          setUsername(displayName || '');
          setEditName(displayName || '');
          setLevel(userLevel);
          setExp(userExp);
          // Guardar en caché global
          setUserCache({
            uid: user.uid,
            displayName,
            level: userLevel,
            exp: userExp,
            photoURL: user.photoURL || null,
            avatar: user.photoURL ? { uri: user.photoURL } : userPinkIcon
          });
        } else {
          if (!isTab) {
            navigation.replace && navigation.replace('Login');
          } else {
            setCurrentUser(null);
          }
          setUserCache(null);
        }
      } catch (error) {
        console.error('Error en la autenticación:', error);
        // Manejar el error de manera apropiada
        if (!isTab) {
          navigation.replace && navigation.replace('Login');
        } else {
          setCurrentUser(null);
        }
        setUserCache(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [navigation, isTab]);

  // Detectar pantalla activa por navigation (si navigation.getState existe)
  let activeTab = 'user';
  if (navigation && navigation.getState) {
    const route = navigation.getState().routes[navigation.getState().index];
    if (route && route.name === 'Profile') activeTab = 'user';
    else if (route && route.name === 'Games') activeTab = 'home';
    else if (route && route.name === 'Home') activeTab = 'trophy';
  }

  // Usar caché global para el modal
  const openEdit = () => {
    const cache = userCache || {};
    setEditName(cache.displayName || username);
    setEditAvatar(cache.avatar || avatar);
    setModalVisible(true);
  };

  const pickImage = async () => {
    if (Platform.OS === 'web') {
      // En web, usamos un input file nativo
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          try {
            const storage = getStorage();
            const storageRef = ref(storage, `avatars/${currentUser.uid}.jpg`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            await updateProfile(currentUser, { photoURL: url });
            setAvatar({ uri: url });
            // Guarda la URL en Firestore
            if (currentUser && currentUser.uid) {
              await setDoc(
                doc(db, 'users', currentUser.uid),
                { photoURL: url },
                { merge: true }
              );
            }
          } catch (error) {
            console.error('Error al subir la imagen:', error);
          }
        }
      };
      input.click();
    } else {
      // En móvil, usamos expo-image-picker
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const image = result.assets[0];
        try {
          const storage = getStorage();
          const storageRef = ref(storage, `avatars/${currentUser.uid}.jpg`);
          const response = await fetch(image.uri);
          const blob = await response.blob();
          await uploadBytes(storageRef, blob);
          const url = await getDownloadURL(storageRef);
          await updateProfile(currentUser, { photoURL: url });
          setAvatar({ uri: url });
          // Guarda la URL en Firestore
          if (currentUser && currentUser.uid) {
            await setDoc(
              doc(db, 'users', currentUser.uid),
              { photoURL: url },
              { merge: true }
            );
          }
        } catch (error) {
          console.error('Error al subir la imagen:', error);
        }
      }
    }
  };

  const saveEdit = async () => {
    const newName = editName.trim() ? editName : username;
    setUsername(newName);
    setAvatar(editAvatar);
    setModalVisible(false);
    // Actualiza el nombre en Firebase Auth
    await updateProfile(currentUser, { displayName: newName });
    // Actualiza el nombre en Firestore
    if (currentUser && currentUser.uid) {
      await setDoc(
        doc(db, 'users', currentUser.uid),
        { displayName: newName },
        { merge: true }
      );
    }
  };

  // Función para cambiar el avatar con animación
  const changeAvatarWithAnimation = (newAvatar) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: false,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }),
    ]).start();
    setAvatar(newAvatar);
  };

  // Reproducir audio al abrir el modal de avatar (web y móvil)
  useEffect(() => {
    if (showAvatarModal) {
      if (Platform.OS === 'web') {
        // Web: usar <audio>
        if (audioElementRef.current) {
          audioElementRef.current.currentTime = 0;
          audioElementRef.current.volume = 0.4;
          audioElementRef.current.play();
        }
      } else {
        // Móvil: usar expo-av
        (async () => {
          if (audioRef.current) {
            await audioRef.current.unloadAsync();
          }
          const { sound } = await Audio.Sound.createAsync(audioPapi);
          audioRef.current = sound;
          await sound.setVolumeAsync(0.4);
          await sound.playAsync();
        })();
      }
    } else {
      if (Platform.OS === 'web') {
        if (audioElementRef.current) {
          audioElementRef.current.pause();
          audioElementRef.current.currentTime = 0;
        }
      } else {
        if (audioRef.current) {
          audioRef.current.unloadAsync();
          audioRef.current = null;
        }
      }
    }
    return () => {
      if (Platform.OS === 'web') {
        if (audioElementRef.current) {
          audioElementRef.current.pause();
          audioElementRef.current.currentTime = 0;
        }
      } else {
        if (audioRef.current) {
          audioRef.current.unloadAsync();
          audioRef.current = null;
        }
      }
    };
  }, [showAvatarModal]);

  // Reproducir audio al abrir el modal de foto de perfil
  useEffect(() => {
    if (showProfilePicModal) {
      if (Platform.OS === 'web') {
        if (audioElementRef.current) {
          audioElementRef.current.currentTime = 0;
          audioElementRef.current.volume = 0.4;
          audioElementRef.current.play();
        }
      } else {
        (async () => {
          if (audioRef.current) {
            await audioRef.current.unloadAsync();
          }
          const { sound } = await Audio.Sound.createAsync(audioPapi);
          audioRef.current = sound;
          await sound.setVolumeAsync(0.4);
          await sound.playAsync();
        })();
      }
    } else {
      if (Platform.OS === 'web') {
        if (audioElementRef.current) {
          audioElementRef.current.pause();
          audioElementRef.current.currentTime = 0;
        }
      } else {
        if (audioRef.current) {
          audioRef.current.unloadAsync();
          audioRef.current = null;
        }
      }
    }
    return () => {
      if (Platform.OS === 'web') {
        if (audioElementRef.current) {
          audioElementRef.current.pause();
          audioElementRef.current.currentTime = 0;
        }
      } else {
        if (audioRef.current) {
          audioRef.current.unloadAsync();
          audioRef.current = null;
        }
      }
    };
  }, [showProfilePicModal]);

  const handleResendVerification = async () => {
    try {
      setResending(true);
      await sendEmailVerification(auth.currentUser);
      setResending(false);
      setVerificationSent(true);
      setTimeout(() => setVerificationSent(false), 5000);
    } catch (error) {
      setResending(false);
      // Siempre mostrar el mensaje de verificación, independientemente del error
      setVerificationSent(true);
      setTimeout(() => setVerificationSent(false), 5000);
    }
  };

  if (!fontsLoaded) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a23' }}>
        <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#00fff7" />
        </View>
      </SafeAreaView>
    );
  }

  // Si no hay usuario, mostrar pantalla de carga o nada
  if (!currentUser) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a23' }}>
        <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={[styles.title, ...pixelStroke]}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <UserCacheContext.Provider value={userCache}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a23' }}>
        <View style={styles.root}>
          <View style={styles.content}>
            {/* Título */}
            <Text style={[styles.title, ...pixelStroke, { fontFamily: pixelFont }]}>PERFIL DE USUARIO</Text>

            {/* Avatar */}
            <TouchableOpacity activeOpacity={0.8} onPress={() => setShowProfilePicModal(true)}>
              <Animated.View style={[styles.avatarBox, { opacity: fadeAnim }]}> 
                <Image source={avatar} style={styles.avatar} resizeMode="contain" />
              </Animated.View>
            </TouchableOpacity>

            {/* Modal para ver la foto de perfil */}
            <Modal
              visible={showProfilePicModal}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setShowProfilePicModal(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.profilePicModalContent}>
                  <Image 
                    source={avatar} 
                    style={styles.enlargedAvatar}
                    resizeMode="contain"
                  />
                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={() => setShowProfilePicModal(false)}
                  >
                    <Text style={styles.closeButtonText}>SALIR</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            {/* Nombre de usuario */}
            <View style={styles.usernameBox}>
              <Text style={[styles.username, ...pixelStroke, { fontFamily: pixelFont }]}>{username}</Text>
            </View>

            {/* Nivel y barra de experiencia */}
            <View style={styles.levelBox}>
              <View style={styles.levelRow}>
                <Text style={[styles.levelText, { fontFamily: pixelFont }]}>Nivel {level}</Text>
                <Text style={[styles.expText, { fontFamily: pixelFont }]}>Exp {exp}/{expMax}</Text>
              </View>
              <View style={styles.expBarBg}>
                <View style={[styles.expBarFill, { width: `${(exp/expMax)*100}%` }]} />
              </View>
            </View>

            {/* Botón Editar perfil */}
            <TouchableOpacity style={styles.editBtn} activeOpacity={0.7} onPress={openEdit} disabled={!currentUser}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={styles.editBtnText}>Editar perfil</Text>
                <Image source={editarRosaIcon} style={styles.editIcon} resizeMode="contain" />
              </View>
            </TouchableOpacity>

            {/* Botón de audio */}
            <TouchableOpacity style={styles.editBtn} activeOpacity={0.7} onPress={toggleAudio}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={styles.editBtnText}>{audioOn ? 'Apagar sonido' : 'Encender sonido'}</Text>
                <Image 
                  source={audioOn ? audioOnIcon : audioOffIcon} 
                  style={[styles.editIcon, { tintColor: audioOn ? '#ff2e7e' : '#aaa' }]} 
                  resizeMode="contain" 
                />
              </View>
            </TouchableOpacity>

            {/* Botón Salir */}
            {!loggingOut && (
              <RetroButton 
                title="Salir" 
                onPress={async () => {
                  setLoggingOut(true);
                  await signOut(auth);
                  setLoggingOut(false);
                  if (!isTab) {
                    navigation.replace('Login');
                  } else {
                    setCurrentUser(null);
                  }
                }} 
                style={[styles.logoutBtn, { alignSelf: 'center', width: '90%', marginTop: 12 }]}
                textStyle={styles.logoutBtnText}
              />
            )}

            {!currentUser?.emailVerified && (
              <View style={styles.verificationContainer}>
                <Text style={styles.verificationText}>
                  Por favor, verifica tu correo electrónico para acceder a todas las funciones.
                </Text>
                {verificationSent ? (
                  <Text style={[styles.verificationText, { color: '#00ff00' }]}>
                    ¡Correo de verificación enviado! Revisa tu bandeja de entrada.
                  </Text>
                ) : (
                  <TouchableOpacity 
                    style={styles.resendButton} 
                    onPress={handleResendVerification}
                    disabled={resending}
                  >
                    <Text style={styles.resendButtonText}>
                      {resending ? 'Enviando...' : 'Reenviar correo de verificación'}
                    </Text>
                  </TouchableOpacity>
                )}
                {error && (
                  <Text style={[styles.verificationText, { color: '#ff2e7e' }]}>
                    {error}
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Menú inferior siempre visible */}
          {(!isTab) && (
            <BottomTabBar
              activeTab={activeTab}
              onTabPress={(tab) => {
                if (tab === 'trophy') navigation.navigate('Home');
                if (tab === 'home') navigation.navigate('Games');
                if (tab === 'user') navigation.navigate('Profile');
              }}
            />
          )}
        </View>
      </SafeAreaView>
    </UserCacheContext.Provider>
  );
}

export async function addTrikiWinExp() {
  if (!auth.currentUser) return;
  try {
    const userRef = doc(db, 'users', auth.currentUser.uid);
    const userDoc = await getDoc(userRef);
    let exp = 0, level = 0;
    if (userDoc.exists()) {
      exp = userDoc.data().exp || 0;
      level = userDoc.data().level || 0;
    }
    // Sumar puntos por victoria en Triki
    exp += GAME_SCORES.triki;
    let newLevel = level;
    let expMax = getExpForLevel(newLevel + 1);
    // Subir solo un nivel por victoria
    if (exp >= expMax) {
      exp -= expMax;
      newLevel += 1;
    }
    // Cambiar avatar si corresponde
    let updates = { exp, level: newLevel };
    const special = SPECIAL_AVATARS.find(a => a.level === newLevel);
    if (special) {
      updates.photoURL = null;
      updates.avatarSpecial = special.image; // Store only the filename string
    }
    await setDoc(userRef, updates, { merge: true });
    // Ya NO actualizar estadísticas ni victorias aquí
  } catch (error) {
    console.error('Error al actualizar experiencia:', error);
    // No propagar el error para no interrumpir el flujo del juego
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0a0a23',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    alignSelf: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: height * 0.02,
  },
  title: {
    color: '#fff',
    fontSize: scaleFont(24),
    marginBottom: scaleDimension(18),
    textAlign: 'center',
    textShadowColor: '#00fff7',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: scaleDimension(12),
    fontFamily: pixelFont,
  },
  avatarBox: {
    borderWidth: width * 0.015,
    borderColor: '#00fff7',
    borderRadius: width * 0.08,
    padding: width * 0.02,
    backgroundColor: '#23233a',
    alignSelf: 'center',
    marginBottom: height * 0.015,
    shadowColor: '#00fff7',
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
  avatar: {
    width: Math.min(width * 0.3, 100),
    height: Math.min(width * 0.3, 100),
    borderRadius: width * 0.06,
  },
  usernameBox: {
    alignSelf: 'center',
    marginVertical: height * 0.01,
    borderWidth: width * 0.01,
    borderColor: '#00fff7',
    borderRadius: width * 0.03,
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.01,
    backgroundColor: '#23233a',
  },
  username: {
    color: '#00fff7',
    fontSize: scaleFont(18),
    textAlign: 'center',
    fontFamily: pixelFont,
  },
  levelBox: {
    width: '90%',
    alignSelf: 'center',
    marginVertical: height * 0.015,
    borderWidth: width * 0.01,
    borderColor: '#00fff7',
    borderRadius: width * 0.04,
    backgroundColor: '#23233a',
    padding: width * 0.03,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  levelText: {
    color: '#ff2e7e',
    fontSize: scaleFont(14),
    fontFamily: pixelFont,
  },
  expText: {
    color: '#ff2e7e',
    fontSize: scaleFont(12),
    fontFamily: pixelFont,
  },
  expBarBg: {
    width: '100%',
    height: Math.max(10, height * 0.012),
    backgroundColor: '#101926',
    borderRadius: width * 0.03,
    overflow: 'hidden',
    borderWidth: width * 0.008,
    borderColor: '#ff2e7e',
  },
  expBarFill: {
    height: '100%',
    backgroundColor: '#ff2e7e',
    borderRadius: width * 0.03,
  },
  editBtn: {
    width: '90%',
    alignSelf: 'center',
    marginTop: height * 0.01,
    marginBottom: height * 0.01,
    borderWidth: width * 0.01,
    borderColor: '#00fff7',
    borderRadius: width * 0.03,
    backgroundColor: '#101926',
    paddingVertical: height * 0.012,
    paddingHorizontal: width * 0.04,
  },
  editBtnText: {
    color: '#fff',
    fontSize: scaleFont(13),
    textAlign: 'center',
    fontFamily: pixelFont,
  },
  bottomTab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '94%',
    backgroundColor: 'transparent',
    borderRadius: width * 0.045,
    borderWidth: width * 0.01,
    borderColor: '#00fff7',
    paddingVertical: height * 0.012,
    paddingHorizontal: width * 0.045,
    alignSelf: 'center',
    marginTop: 'auto',
    shadowColor: '#00fff7',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: height * 0.012,
    minHeight: 40,
  },
  tabBtnActive: {
    borderBottomWidth: 4,
    borderBottomColor: '#ff2e7e',
    shadowColor: '#ff2e7e',
    shadowOpacity: 0.7,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  tabIcon: {
    width: width * 0.09,
    height: width * 0.09,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10,10,35,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBox: {
    width: Math.min(width * 0.88, 340),
    backgroundColor: '#23233a',
    borderRadius: Math.max(18, width * 0.045),
    borderWidth: 4,
    borderColor: '#00fff7',
    padding: 22,
    alignItems: 'center',
    shadowColor: '#00fff7',
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
  modalTitle: {
    color: '#ff2e7e',
    fontSize: scaleFont(22),
    marginBottom: 18,
    textAlign: 'center',
    fontFamily: pixelFont,
  },
  modalAvatarRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    gap: 12,
  },
  modalAvatarOption: {
    borderWidth: 2,
    borderColor: '#00fff7',
    borderRadius: 16,
    padding: 4,
    marginHorizontal: 6,
    backgroundColor: '#101926',
  },
  modalAvatarActive: {
    borderColor: '#ff2e7e',
    backgroundColor: '#18182e',
    shadowColor: '#ff2e7e',
    shadowOpacity: 0.7,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  modalAvatarImg: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  modalInput: {
    width: '90%',
    borderWidth: 2,
    borderColor: '#00fff7',
    borderRadius: 10,
    backgroundColor: '#101926',
    color: '#00fff7',
    fontSize: scaleFont(18),
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 18,
    textAlign: 'center',
    fontFamily: pixelFont,
  },
  modalBtnRowColumn: {
    flexDirection: 'column',
    width: '100%',
    gap: 10,
    marginTop: 8,
  },
  editAvatarBtn: {
    marginTop: 10,
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#00fff7',
    backgroundColor: '#181828',
    alignSelf: 'center',
  },
  editAvatarBtnText: {
    color: '#00fff7',
    fontSize: scaleFont(16),
    textAlign: 'center',
    fontFamily: pixelFont,
  },
  cancelBtn: {
    backgroundColor: '#ff2e7e',
    borderColor: '#ff2e7e',
    marginTop: 6,
  },
  cancelBtnText: {
    color: '#fff',
    fontSize: scaleFont(16),
    textAlign: 'center',
    fontFamily: pixelFont,
  },
  logoutBtn: {
    backgroundColor: '#ff2e7e',
    borderColor: '#ff2e7e',
    marginTop: 16,
  },
  logoutBtnText: {
    color: '#fff',
    fontSize: scaleFont(16),
    textAlign: 'center',
    fontFamily: 'PressStart2P_400Regular',
    letterSpacing: 2,
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10,10,35,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingBox: {
    backgroundColor: '#23233a',
    borderRadius: 18,
    borderWidth: 4,
    borderColor: '#ff2e7e',
    padding: 32,
    alignItems: 'center',
    shadowColor: '#ff2e7e',
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
  loadingText: {
    color: '#ff2e7e',
    fontSize: scaleFont(18),
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: pixelFont,
  },
  editIcon: {
    width: 28,
    height: 28,
    marginLeft: 14,
    marginBottom: -3,
  },
  cornerDotTL: {
    position: 'absolute',
    top: hp(2.5),
    left: wp(4),
    width: scaleDimension(12),
    height: scaleDimension(12),
    backgroundColor: '#ff2e7e',
    borderRadius: scaleDimension(6),
    zIndex: 2,
  },
  cornerDotTR: {
    position: 'absolute',
    top: hp(2.5),
    right: wp(4),
    width: scaleDimension(12),
    height: scaleDimension(12),
    backgroundColor: '#00fff7',
    borderRadius: scaleDimension(6),
    zIndex: 2,
  },
  cornerDotBL: {
    position: 'absolute',
    bottom: hp(2.5),
    left: wp(4),
    width: scaleDimension(12),
    height: scaleDimension(12),
    backgroundColor: '#00fff7',
    borderRadius: scaleDimension(6),
    zIndex: 2,
  },
  cornerDotBR: {
    position: 'absolute',
    bottom: hp(2.5),
    right: wp(4),
    width: scaleDimension(12),
    height: scaleDimension(12),
    backgroundColor: '#ff2e7e',
    borderRadius: scaleDimension(6),
    zIndex: 2,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: height * 0.02,
  },
  audioContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#0a0a23',
    borderBottomWidth: 1,
    borderBottomColor: '#18182e',
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    backgroundColor: '#18182e',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#00fff7',
    padding: 12,
  },
  audioText: {
    color: '#fff',
    fontSize: scaleFont(20),
  },
  audioIcon: {
    width: 32,
    height: 32,
    marginLeft: 8,
  },
  verificationContainer: {
    width: '90%',
    alignSelf: 'center',
    marginTop: height * 0.01,
    padding: 12,
    borderWidth: 2,
    borderColor: '#00fff7',
    borderRadius: 8,
    backgroundColor: '#23233a',
  },
  verificationText: {
    color: '#fff',
    fontSize: scaleFont(14),
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: pixelFont,
  },
  resendButton: {
    backgroundColor: '#ff2e7e',
    borderColor: '#ff2e7e',
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
  },
  resendButtonText: {
    color: '#fff',
    fontSize: scaleFont(16),
    textAlign: 'center',
    fontFamily: pixelFont,
  },
  enlargedAvatar: {
    width: Math.min(width * 0.8, 400),
    height: Math.min(width * 0.8, 400),
    borderRadius: width * 0.1,
  },
  profilePicModalContent: {
    padding: width * 0.05,
    backgroundColor: '#23233a',
    borderRadius: width * 0.1,
    borderWidth: width * 0.01,
    borderColor: '#00fff7',
    shadowColor: '#00fff7',
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    alignItems: 'center',
    gap: width * 0.04,
  },
  closeButton: {
    width: '80%',
    paddingHorizontal: width * 0.04,
    paddingVertical: width * 0.02,
    backgroundColor: '#ff2e7e',
    borderWidth: width * 0.008,
    borderColor: '#00fff7',
    borderRadius: width * 0.02,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff2e7e',
    shadowOpacity: 0.6,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  closeButtonText: {
    color: '#fff',
    fontSize: scaleFont(16),
    fontFamily: pixelFont,
    textAlign: 'center',
  },
}); 