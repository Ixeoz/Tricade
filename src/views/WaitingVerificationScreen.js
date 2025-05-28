import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, SafeAreaView, Animated, Easing, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth, reload, sendEmailVerification } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { setDoc } from 'firebase/firestore';
import NetInfo from '@react-native-community/netinfo';
import RetroButton from '../components/RetroButton';
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

const pixelFont = 'PressStart2P_400Regular';

export default function WaitingVerificationScreen({ route, navigation }) {
  const { userId, username, email } = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(true);
  const auth = getAuth();
  const db = getFirestore();

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const glowAnim = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const netInfo = await NetInfo.fetch();
        setIsConnected(netInfo.isConnected);
        if (!netInfo.isConnected) {
          setError('No hay conexión a internet. Por favor, verifica tu conexión.');
        }
      } catch (error) {
        console.error('Error checking connection:', error);
        setIsConnected(false);
        setError('Error al verificar la conexión a internet.');
      }
    };

    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      if (!state.isConnected) {
        setError('No hay conexión a internet. Por favor, verifica tu conexión.');
      } else {
        setError('');
      }
    });

    checkConnection();

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    let fadeAnimation = null;
    let slideAnimation = null;
    let glowAnimation = null;

    const startAnimations = () => {
      fadeAnimation = Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      });

      slideAnimation = Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      });

      glowAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.7,
            duration: 1200,
            useNativeDriver: false,
          }),
        ])
      );

      Animated.parallel([fadeAnimation, slideAnimation]).start();
      glowAnimation.start();
    };

    startAnimations();

    return () => {
      if (fadeAnimation) fadeAnimation.stop();
      if (slideAnimation) slideAnimation.stop();
      if (glowAnimation) glowAnimation.stop();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    let timeoutId;

    const checkVerification = async () => {
      if (!isConnected) {
        console.log('[WaitingVerificationScreen] No hay conexión a internet');
        return;
      }

      try {
        console.log('[WaitingVerificationScreen] Verificando estado...');
        const user = auth.currentUser;
        if (!user) {
          throw new Error('Usuario no encontrado');
        }

        await reload(user);
        console.log('[WaitingVerificationScreen] Usuario recargado');

        if (user.emailVerified) {
          console.log('[WaitingVerificationScreen] Email verificado');
          
          // Crear el usuario final en Firestore
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            displayName: username,
            email: email,
            photoURL: null,
            createdAt: new Date().toISOString(),
            level: 0,
            exp: 0,
            emailVerified: true,
            lastVerifiedAt: new Date().toISOString(),
            verificationStatus: 'verified'
          }, { merge: true });
          
          console.log('[WaitingVerificationScreen] Usuario final creado en Firestore');
          
          if (isMounted) {
            navigation.replace('Home');
          }
          return;
        }

        // Si no está verificado, incrementar contador de intentos
        if (isMounted) {
          setError('Demasiados intentos. Por favor, intenta de nuevo más tarde.');
        }

        // Programar siguiente verificación
        timeoutId = setTimeout(checkVerification, 3000);
      } catch (e) {
        console.error('[WaitingVerificationScreen] Error checking verification:', e);
        if (isMounted) {
          setError('Error al verificar el email. Por favor, intenta de nuevo.');
        }
      }
    };

    checkVerification();

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isConnected]);

  const handleRetry = async () => {
    if (!isConnected) {
      setError('No hay conexión a internet. Por favor, verifica tu conexión.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      await sendEmailVerification(user);
      console.log('[WaitingVerificationScreen] Email de verificación reenviado');
      
      // Actualizar intentos en Firestore
      await setDoc(doc(db, 'users', user.uid), {
        lastVerificationAttempt: new Date().toISOString(),
        verificationAttempts: 1
      }, { merge: true });

      setIsLoading(false);
    } catch (e) {
      console.error('[WaitingVerificationScreen] Error al reenviar verificación:', e);
      setError('Error al reenviar el email de verificación. Por favor, intenta de nuevo.');
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a23' }}>
      <View style={styles.container}>
        <View style={styles.cornerDotTL} />
        <View style={styles.cornerDotTR} />
        <View style={styles.cornerDotBL} />
        <View style={styles.cornerDotBR} />
        <Ionicons name="mail-unread" size={scaleDimension(64)} color="#00fff7" style={{ marginBottom: scaleDimension(24) }} />
        <View style={styles.content}>
          <Text style={[styles.title, { fontFamily: pixelFont }]}>Verificación de Email</Text>
          
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { fontFamily: pixelFont }]}>{error}</Text>
              <RetroButton
                title="Reintentar"
                onPress={handleRetry}
                style={styles.retryButton}
                textStyle={{ fontFamily: pixelFont }}
              />
            </View>
          ) : (
            <>
              <Text style={[styles.message, { fontFamily: pixelFont }]}>
                Por favor, verifica tu email: {email}
              </Text>
              <Text style={[styles.subMessage, { fontFamily: pixelFont }]}>
                Te hemos enviado un enlace de verificación.
              </Text>
              <ActivityIndicator size="large" color="#00fff7" style={styles.loader} />
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a23',
    alignItems: 'center',
    justifyContent: 'center',
    padding: scaleDimension(24),
    width: '100%',
    maxWidth: scaleDimension(420),
    alignSelf: 'center',
  },
  title: {
    color: '#fff',
    fontSize: scaleFont(24),
    marginBottom: scaleDimension(16),
    textAlign: 'center',
    textShadowColor: '#00fff7',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: scaleDimension(12),
    fontFamily: pixelFont,
  },
  message: {
    color: '#fff',
    fontSize: scaleFont(16),
    textAlign: 'center',
    marginBottom: scaleDimension(10),
    fontFamily: pixelFont,
  },
  subMessage: {
    color: '#ff2e7e',
    fontSize: scaleFont(14),
    textAlign: 'center',
    marginBottom: scaleDimension(20),
    fontFamily: pixelFont,
  },
  loader: {
    marginVertical: scaleDimension(20),
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: scaleDimension(20),
  },
  errorText: {
    color: '#ff2e7e',
    fontSize: scaleFont(16),
    textAlign: 'center',
    marginBottom: scaleDimension(20),
    fontFamily: pixelFont,
  },
  retryButton: {
    marginTop: scaleDimension(10),
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
  content: {
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    padding: 20,
  },
}); 