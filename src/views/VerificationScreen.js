import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Animated, Easing, SafeAreaView } from 'react-native';
import RetroButton from '../components/RetroButton';
import { Ionicons } from '@expo/vector-icons';
import { getAuth, sendEmailVerification, createUserWithEmailAndPassword, signInWithEmailAndPassword, reload, updateEmail, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import app from '../firebaseConfig';
import { LinearGradient } from 'expo-linear-gradient';
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

export default function VerificationScreen({ route, navigation }) {
  const { username, password } = route.params;
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [firebaseUser, setFirebaseUser] = useState(null);
  const auth = getAuth(app);

  // Animaciones
  const formFadeAnim = useRef(new Animated.Value(0)).current;
  const formSlideAnim = useRef(new Animated.Value(30)).current;
  const glowAnim = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(formFadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(formSlideAnim, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.loop(
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
      ).start(),
    ]).start();
  }, []);

  const handleEmailVerification = async () => {
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
      // Crear usuario en Auth con correo real, contraseña y nombre de usuario
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(userCredential.user, { displayName: username });
      setFirebaseUser(userCredential.user);
      await sendEmailVerification(userCredential.user);
      // Guardar en Firestore
      const db = getFirestore();
      const userData = {
        uid: userCredential.user.uid,
        displayName: username,
        email: email.trim(),
        photoURL: null,
        createdAt: new Date().toISOString(),
        level: 0,
        exp: 0
      };
      await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      setIsEmailSent(true);
      setTimeout(() => {
        navigation.replace('WaitingVerification', { 
          firebaseUser: userCredential.user,
          username,
          userId: userCredential.user.uid
        });
      }, 1200);
    } catch (e) {
      setError(e.message || 'Error al verificar email');
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
        // Guardar en Firestore después de la verificación, con el email real
        const db = getFirestore();
        const userData = {
          uid: firebaseUser.uid,
          displayName: username,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL || null,
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', firebaseUser.uid), userData);
        console.log('Usuario guardado en Firestore después de verificación');
        setIsVerified(true);
        setTimeout(() => {
          navigation.navigate('Home');
        }, 2000);
      } else {
        setError('Tu correo aún no ha sido verificado. Por favor, revisa tu email.');
      }
    } catch (e) {
      setError('Error al comprobar la verificación.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a23' }}>
      <View style={{ flex: 1 }}>
        {/* Esquinas decorativas */}
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
                  { fontSize: Math.min(width * 0.07, 24), maxWidth: width * 0.9 },
                ]}
                adjustsFontSizeToFit
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                Verificación
              </Text>
              <Animated.View style={{ opacity: formFadeAnim, transform: [{ translateY: formSlideAnim }], width: '100%', alignItems: 'center' }}>
                {!isVerified ? (
                  !isEmailSent ? (
                    <>
                      <Animated.View style={[styles.inputBox, { shadowOpacity: glowAnim }]}> 
                        <TextInput
                          style={styles.input}
                          value={email}
                          onChangeText={t => { setEmail(t); setError(''); }}
                          placeholder="Email"
                          placeholderTextColor="#00fff7"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoComplete="email"
                          editable={!isLoading}
                        />
                      </Animated.View>
                      {error ? <Text style={styles.errorMsg}>{error}</Text> : null}
                      <Animated.View style={{ width: '100%', alignItems: 'center', shadowOpacity: glowAnim }}>
                        <RetroButton
                          title="Enviar Verificación"
                          onPress={handleEmailVerification}
                          style={[styles.verifyButton, { shadowColor: '#00fff7', shadowRadius: glowAnim.interpolate({ inputRange: [0.7, 1], outputRange: [8, 18] }) }]}
                          disabled={isLoading || !email.trim()}
                        />
                      </Animated.View>
                    </>
                  ) : (
                    <>
                      <View style={styles.emailSentContainer}>
                        <Ionicons name="mail" size={48} color="#00fff7" />
                        <Text style={styles.emailSentText}>¡Email enviado!</Text>
                        <Text style={styles.emailSentSubText}>Por favor, revisa tu correo y haz clic en el enlace de verificación</Text>
                      </View>
                      {error ? <Text style={styles.errorMsg}>{error}</Text> : null}
                      <RetroButton
                        title="Ya verifiqué"
                        onPress={handleCheckVerification}
                        style={styles.verifyButton}
                        disabled={isLoading}
                      />
                    </>
                  )
                ) : (
                  <View style={styles.verifiedContainer}>
                    <Ionicons name="checkmark-circle" size={48} color="#00fff7" />
                    <Text style={styles.verifiedText}>¡Verificación exitosa!</Text>
                    <Text style={styles.verifiedSubText}>Redirigiendo a la aplicación...</Text>
                  </View>
                )}
                {isLoading && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#00fff7" />
                    <Text style={styles.loadingText}>
                      {isEmailSent ? 'Comprobando verificación...' : 'Enviando verificación...'}
                    </Text>
                  </View>
                )}
                <RetroButton
                  title="Cancelar"
                  onPress={() => navigation.goBack()}
                  style={styles.cancelBtn}
                  textStyle={styles.cancelBtnText}
                />
              </Animated.View>
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
    fontFamily: pixelFont,
    letterSpacing: scaleDimension(2),
    color: '#fff',
    textAlign: 'center',
    marginBottom: hp(2.5),
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
    fontFamily: pixelFont,
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
    fontFamily: pixelFont,
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
    fontFamily: pixelFont,
    fontSize: scaleFont(18),
    textAlign: 'center',
  },
  emailSentContainer: {
    alignItems: 'center',
    marginBottom: scaleDimension(20),
  },
  emailSentText: {
    color: '#00fff7',
    fontFamily: pixelFont,
    fontSize: scaleFont(18),
    marginTop: scaleDimension(20),
    textAlign: 'center',
  },
  emailSentSubText: {
    color: '#ff2e7e',
    fontFamily: pixelFont,
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
    fontFamily: pixelFont,
    fontSize: scaleFont(14),
    marginTop: scaleDimension(10),
  },
  verifiedContainer: {
    alignItems: 'center',
    marginTop: scaleDimension(20),
  },
  verifiedText: {
    color: '#00fff7',
    fontFamily: pixelFont,
    fontSize: scaleFont(18),
    marginTop: scaleDimension(20),
    textAlign: 'center',
  },
  verifiedSubText: {
    color: '#ff2e7e',
    fontFamily: pixelFont,
    fontSize: scaleFont(14),
    marginTop: scaleDimension(10),
    textAlign: 'center',
  },
  cornerDotTL: {
    position: 'absolute',
    top: scaleDimension(18),
    left: scaleDimension(18),
    width: scaleDimension(12),
    height: scaleDimension(12),
    backgroundColor: '#ff2e7e',
    borderRadius: scaleDimension(3),
    zIndex: 2,
  },
  cornerDotTR: {
    position: 'absolute',
    top: scaleDimension(18),
    right: scaleDimension(18),
    width: scaleDimension(12),
    height: scaleDimension(12),
    backgroundColor: '#00fff7',
    borderRadius: scaleDimension(3),
    zIndex: 2,
  },
  cornerDotBL: {
    position: 'absolute',
    bottom: scaleDimension(18),
    left: scaleDimension(18),
    width: scaleDimension(12),
    height: scaleDimension(12),
    backgroundColor: '#00fff7',
    borderRadius: scaleDimension(3),
    zIndex: 2,
  },
  cornerDotBR: {
    position: 'absolute',
    bottom: scaleDimension(18),
    right: scaleDimension(18),
    width: scaleDimension(12),
    height: scaleDimension(12),
    backgroundColor: '#ff2e7e',
    borderRadius: scaleDimension(3),
    zIndex: 2,
  },
}); 