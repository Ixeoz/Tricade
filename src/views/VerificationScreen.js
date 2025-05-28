import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Animated, Easing, SafeAreaView } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import RetroButton from '../components/RetroButton';
import { Ionicons } from '@expo/vector-icons';
import { getAuth, sendEmailVerification, createUserWithEmailAndPassword, signInWithEmailAndPassword, reload, updateEmail, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import app from '../firebaseConfig';
import { LinearGradient } from 'expo-linear-gradient';
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

export default function VerificationScreen({ route, navigation }) {
  const [fontsLoaded] = useFonts({
    'PressStart2P_400Regular': require('../../assets/fonts/PressStart2P-Regular.ttf'),
  });

  const { username, password } = route.params;
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  const auth = getAuth(app);

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

  const handleEmailVerification = async () => {
    if (!isConnected) {
      setError('No hay conexión a internet. Por favor, verifica tu conexión.');
      return;
    }

    if (!email.trim()) {
      setError('Por favor ingresa un email válido');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Por favor ingresa un email válido');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      console.log('[VerificationScreen] Iniciando proceso de verificación...');

      // Crear usuario temporal
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;
      
      console.log('[VerificationScreen] Usuario temporal creado');

      // Enviar email de verificación inmediatamente
      await sendEmailVerification(user);
      console.log('[VerificationScreen] Email de verificación enviado');

      // Guardar datos temporales en Firestore
      const db = getFirestore();
      await setDoc(doc(db, 'users', user.uid), {
        email,
        username,
        emailVerified: false,
        verificationSent: true,
        lastVerificationAttempt: new Date().toISOString(),
        verificationAttempts: 1,
        createdAt: new Date().toISOString()
      }, { merge: true });

      console.log('[VerificationScreen] Datos temporales guardados en Firestore');
      
      setFirebaseUser(user);
      setIsEmailSent(true);
      navigation.replace('WaitingVerification', {
        userId: user.uid,
        username,
        email: email.trim()
      });
    } catch (e) {
      console.error('[VerificationScreen] Error:', e);
      let errorMessage = 'Error al enviar el email de verificación. Por favor, intenta de nuevo.';
      
      if (e.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email ya está registrado. Por favor, usa otro email.';
      } else if (e.code === 'auth/network-request-failed') {
        errorMessage = 'Error de conexión. Por favor, verifica tu conexión a internet.';
      } else if (e.code === 'auth/too-many-requests') {
        errorMessage = 'Demasiados intentos. Por favor, espera un momento antes de intentar de nuevo.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    if (!firebaseUser) {
      setError('No se encontró el usuario.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await reload(firebaseUser);
      if (firebaseUser.emailVerified) {
        // Guardar en Firestore después de la verificación
        const db = getFirestore();
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          emailVerified: true,
          lastVerifiedAt: new Date().toISOString()
        }, { merge: true });
        
        setIsVerified(true);
        setTimeout(() => {
          navigation.replace('Home');
        }, 2000);
      } else {
        setError('Tu correo aún no ha sido verificado. Por favor, revisa tu email.');
      }
    } catch (e) {
      console.error('Error al verificar:', e);
      setError('Error al comprobar la verificación. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a23' }}>
      <View style={{ flex: 1 }}>
        <View style={styles.cornerDotTL} />
        <View style={styles.cornerDotTR} />
        <View style={styles.cornerDotBL} />
        <View style={styles.cornerDotBR} />
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', minHeight: height }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
          >
            <View style={styles.root}>
              <Text
                style={[
                  styles.title,
                  styles.titleGlow,
                  { fontSize: Math.min(width * 0.07, 24), maxWidth: width * 0.9, fontFamily: 'PressStart2P_400Regular' }
                ]}
                adjustsFontSizeToFit
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                Verificación
              </Text>
              <View style={styles.content}>
                {!isVerified ? (
                  !isEmailSent ? (
                    <>
                      <View style={styles.inputBox}> 
                        <TextInput
                          style={[styles.input, { fontFamily: 'PressStart2P_400Regular' }]}
                          value={email}
                          onChangeText={t => { setEmail(t); setError(''); }}
                          placeholder="Email"
                          placeholderTextColor="#00fff7"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoComplete="email"
                          editable={!isLoading}
                        />
                      </View>
                      {error ? <Text style={[styles.errorMsg, { fontFamily: 'PressStart2P_400Regular' }]}>{error}</Text> : null}
                      <View style={styles.buttonContainer}>
                        <RetroButton
                          title="Enviar Verificación"
                          onPress={handleEmailVerification}
                          style={styles.verifyButton}
                          disabled={isLoading || !email.trim()}
                          textStyle={{ fontFamily: 'PressStart2P_400Regular' }}
                        />
                      </View>
                    </>
                  ) : (
                    <>
                      <View style={styles.emailSentContainer}>
                        <Ionicons name="mail" size={48} color="#00fff7" />
                        <Text style={[styles.emailSentText, { fontFamily: 'PressStart2P_400Regular' }]}>¡Email enviado!</Text>
                        <Text style={[styles.emailSentSubText, { fontFamily: 'PressStart2P_400Regular' }]}>Por favor, revisa tu correo y haz clic en el enlace de verificación</Text>
                      </View>
                      {error ? <Text style={[styles.errorMsg, { fontFamily: 'PressStart2P_400Regular' }]}>{error}</Text> : null}
                      <RetroButton
                        title="Ya verifiqué"
                        onPress={handleCheckVerification}
                        style={styles.verifyButton}
                        disabled={isLoading}
                        textStyle={{ fontFamily: 'PressStart2P_400Regular' }}
                      />
                    </>
                  )
                ) : (
                  <View style={styles.verifiedContainer}>
                    <Ionicons name="checkmark-circle" size={48} color="#00fff7" />
                    <Text style={[styles.verifiedText, { fontFamily: 'PressStart2P_400Regular' }]}>¡Verificación exitosa!</Text>
                    <Text style={[styles.verifiedSubText, { fontFamily: 'PressStart2P_400Regular' }]}>Redirigiendo a la aplicación...</Text>
                  </View>
                )}
                {isLoading && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#00fff7" />
                    <Text style={[styles.loadingText, { fontFamily: 'PressStart2P_400Regular' }]}>
                      {isEmailSent ? 'Comprobando verificación...' : 'Enviando verificación...'}
                    </Text>
                  </View>
                )}
                <RetroButton
                  title="Cancelar"
                  onPress={() => navigation.goBack()}
                  style={styles.cancelBtn}
                  textStyle={[styles.cancelBtnText, { fontFamily: 'PressStart2P_400Regular' }]}
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: scaleDimension(420),
    alignSelf: 'center',
  },
  title: {
    letterSpacing: scaleDimension(2),
    color: '#fff',
    textAlign: 'center',
    marginBottom: hp(2.5),
    fontFamily: 'PressStart2P_400Regular',
  },
  titleGlow: {
    textShadowColor: '#00fff7',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: scaleDimension(16),
  },
  inputBox: {
    width: wp(88),
    maxWidth: scaleDimension(340),
    alignSelf: 'center',
    marginVertical: hp(1.2),
    borderWidth: scaleDimension(3),
    borderColor: '#00fff7',
    borderRadius: scaleDimension(18),
    backgroundColor: '#23233a',
    paddingHorizontal: scaleDimension(8),
    paddingVertical: scaleDimension(10),
  },
  input: {
    color: '#ff2e7e',
    fontSize: scaleFont(18),
    textAlign: 'center',
    paddingVertical: scaleDimension(8),
    paddingHorizontal: scaleDimension(8),
    letterSpacing: scaleDimension(1),
    backgroundColor: 'transparent',
    width: '100%',
    borderWidth: 0,
    marginBottom: 0,
  },
  errorMsg: {
    color: '#ff2e7e',
    fontSize: scaleFont(15),
    textAlign: 'center',
    marginVertical: hp(1.2),
    backgroundColor: '#23233a',
    borderRadius: scaleDimension(8),
    paddingHorizontal: scaleDimension(8),
    paddingVertical: scaleDimension(4),
    borderWidth: scaleDimension(2),
    borderColor: '#ff2e7e',
    alignSelf: 'center',
  },
  verifyButton: {
    width: wp(88),
    maxWidth: scaleDimension(340),
    marginTop: scaleDimension(10),
    shadowColor: '#00fff7',
    shadowRadius: scaleDimension(18),
    shadowOffset: { width: 0, height: 0 },
  },
  cancelBtn: {
    width: wp(88),
    maxWidth: scaleDimension(340),
    alignSelf: 'center',
    marginTop: hp(1.8),
    borderWidth: scaleDimension(2),
    borderColor: '#ff2e7e',
    borderRadius: scaleDimension(10),
    backgroundColor: 'transparent',
    paddingVertical: scaleDimension(14),
    paddingHorizontal: scaleDimension(10),
  },
  cancelBtnText: {
    color: '#ff2e7e',
    fontSize: scaleFont(18),
    textAlign: 'center',
  },
  emailSentContainer: {
    alignItems: 'center',
    marginBottom: scaleDimension(20),
  },
  emailSentText: {
    color: '#00fff7',
    fontSize: scaleFont(18),
    marginTop: scaleDimension(20),
    textAlign: 'center',
  },
  emailSentSubText: {
    color: '#ff2e7e',
    fontSize: scaleFont(14),
    marginTop: scaleDimension(10),
    textAlign: 'center',
    paddingHorizontal: scaleDimension(20),
  },
  loadingContainer: {
    marginTop: scaleDimension(20),
    alignItems: 'center',
  },
  loadingText: {
    color: '#00fff7',
    fontSize: scaleFont(14),
    marginTop: scaleDimension(10),
  },
  verifiedContainer: {
    alignItems: 'center',
    marginTop: scaleDimension(20),
  },
  verifiedText: {
    color: '#00fff7',
    fontSize: scaleFont(18),
    marginTop: scaleDimension(20),
    textAlign: 'center',
  },
  verifiedSubText: {
    color: '#ff2e7e',
    fontSize: scaleFont(14),
    marginTop: scaleDimension(10),
    textAlign: 'center',
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
    width: '100%',
    alignItems: 'center',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
}); 