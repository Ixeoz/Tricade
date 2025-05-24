import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ActivityIndicator, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import RetroButton from '../components/RetroButton';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
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

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [focusInput, setFocusInput] = useState('');
  const [registerPressed, setRegisterPressed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleLogin = async (e) => {
    if (e) {
      e.preventDefault();
    }
    if (!email.trim() || !password.trim()) {
      setError('Completa email y contraseña');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // El listener de App.js se encargará del resto
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
      }, 1500);
    } catch (e) {
      setError('Email o contraseña incorrectos');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a23' }}>
      <View style={{ flex: 1 }}>
        {/* Detalles pixelados en esquinas */}
        <View style={styles.cornerDotTL} />
        <View style={styles.cornerDotTR} />
        <View style={styles.cornerDotBL} />
        <View style={styles.cornerDotBR} />
        <View style={styles.root}>
          <Text style={[styles.title, styles.titleGlow, ...pixelStroke]}>Inicio de sesión</Text>
          <View style={styles.msgBoxBorder}>
            <View style={styles.msgBox}>
              <Text style={styles.msgText}>
                <Text style={styles.msgTextRed}>
                  "Iniciando protocolo de autenticación mental...{"\n"}
                  Verificando si eres humano, androide, o snack inteligente.{"\n"}
                </Text>
                <Text style={styles.msgTextGreen}>
                  Bienvenido de nuevo, agente. El cosmos espera tus movimientos."
                </Text>
              </Text>
            </View>
          </View>
          {!isSuccess ? (
            <View style={{ width: '100%', alignItems: 'center' }}>
              <View style={[styles.inputBox, focusInput === 'email' && styles.inputBoxGlow]}>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={t => { setEmail(t); setError(''); }}
                  placeholder="Email"
                  placeholderTextColor="#00fff7"
                  maxLength={64}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onFocus={() => setFocusInput('email')}
                  onBlur={() => setFocusInput('')}
                  editable={!isLoading}
                  autoComplete="email"
                  returnKeyType="next"
                  onSubmitEditing={() => {
                    // Focus password input if needed
                  }}
                />
              </View>
              <View style={[styles.inputBox, focusInput === 'pass' && styles.inputBoxGlow]}>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={t => { setPassword(t); setError(''); }}
                  placeholder="Contraseña"
                  placeholderTextColor="#00fff7"
                  secureTextEntry
                  maxLength={32}
                  onFocus={() => setFocusInput('pass')}
                  onBlur={() => setFocusInput('')}
                  editable={!isLoading}
                  autoComplete="current-password"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
              </View>
              {/* Barra pixelada separadora */}
              <View style={styles.pixelBarSeparator}>
                {Array.from({ length: 18 }).map((_, i) => (
                  <View key={i} style={[styles.pixelBarChunk, i % 2 === 0 ? styles.pixelBarChunkBlue : styles.pixelBarChunkPink]} />
                ))}
              </View>
              {error ? <Text style={styles.errorMsg}>{error}</Text> : null}
              <RetroButton
                title="Iniciar sesión"
                onPress={handleLogin}
                style={[styles.glowBtn, email.trim() && password.trim() ? undefined : styles.disabledBtn]}
                disabled={!email.trim() || !password.trim() || isLoading}
              />
              <Pressable
                style={styles.forgotBtn}
                onPress={() => navigation.navigate('ResetPassword')}
                disabled={isLoading}
              >
                <Text style={styles.forgotBtnText}>¿Olvidaste tu contraseña?</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.registerBtn, registerPressed || pressed ? styles.registerBtnActive : null]}
                onPressIn={() => setRegisterPressed(true)}
                onPressOut={() => setRegisterPressed(false)}
                onPress={() => navigation && navigation.navigate && navigation.navigate('Register')}
                disabled={isLoading}
              >
                <Text style={styles.registerBtnText}>Registrarse</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>¡Inicio de sesión exitoso!</Text>
              <Text style={styles.successSubText}>Redirigiendo...</Text>
            </View>
          )}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00fff7" />
              <Text style={styles.loadingText}>Iniciando sesión...</Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0a0a23',
    alignItems: 'center',
    justifyContent: 'center',
    padding: scaleDimension(24),
  },
  container: {
    width: '100%',
    maxWidth: scaleDimension(420),
    alignItems: 'center',
  },
  title: {
    color: '#ff2e7e',
    fontFamily: pixelFont,
    fontSize: scaleFont(32),
    marginBottom: scaleDimension(24),
    textAlign: 'center',
  },
  titleGlow: {
    textShadowColor: '#00fff7',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  msgBoxBorder: {
    borderWidth: 6,
    borderColor: '#00fff7',
    borderRadius: 16,
    padding: 6,
    backgroundColor: '#23233a',
    marginBottom: scaleDimension(3),
    alignSelf: 'center',
    width: wp(90),
  },
  msgBox: {
    borderWidth: 4,
    borderColor: '#ff2e7e',
    borderRadius: 12,
    backgroundColor: '#101926',
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  msgText: {
    fontFamily: pixelFont,
    fontSize: scaleFont(14),
    textAlign: 'center',
    color: '#fff',
  },
  msgTextRed: {
    color: '#ff2e7e',
  },
  msgTextGreen: {
    color: '#00fff7',
  },
  inputBox: {
    width: wp(88),
    maxWidth: scaleDimension(340),
    alignSelf: 'center',
    marginVertical: scaleDimension(8),
    borderWidth: scaleDimension(3),
    borderColor: '#00fff7',
    borderRadius: scaleDimension(12),
    backgroundColor: '#23233a',
    paddingHorizontal: scaleDimension(8),
    paddingVertical: scaleDimension(10),
  },
  input: {
    color: '#00fff7',
    fontFamily: pixelFont,
    fontSize: scaleFont(16),
    textAlign: 'center',
    paddingVertical: scaleDimension(8),
    paddingHorizontal: scaleDimension(8),
    letterSpacing: scaleDimension(1),
  },
  errorMsg: {
    color: '#ff2e7e',
    fontFamily: pixelFont,
    fontSize: scaleFont(13),
    textAlign: 'center',
    marginTop: scaleDimension(8),
    marginBottom: scaleDimension(4),
    backgroundColor: 'rgba(35,35,58,0.92)',
    borderRadius: scaleDimension(14),
    paddingHorizontal: scaleDimension(12),
    paddingVertical: scaleDimension(8),
    borderWidth: scaleDimension(1.5),
    borderColor: '#ff2e7e',
    alignSelf: 'center',
    maxWidth: wp(85),
  },
  disabledBtn: {
    opacity: 0.5,
    paddingVertical: scaleDimension(8),
  },
  registerBtn: {
    width: wp(88),
    maxWidth: scaleDimension(340),
    alignSelf: 'center',
    marginTop: scaleDimension(8),
    borderWidth: scaleDimension(2),
    borderColor: '#ff2e7e',
    borderRadius: scaleDimension(10),
    backgroundColor: '#23233a',
    paddingVertical: scaleDimension(14),
    paddingHorizontal: scaleDimension(10),
  },
  registerBtnText: {
    color: '#ff2e7e',
    fontFamily: pixelFont,
    fontSize: scaleFont(18),
    textAlign: 'center',
  },
  glowBtn: {
    shadowColor: '#00fff7',
    shadowOpacity: 0.85,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
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
  inputBoxGlow: {
    shadowColor: '#00fff7',
    shadowOpacity: 0.85,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    borderColor: '#fff',
  },
  pixelBarSeparator: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginVertical: scaleDimension(12),
    marginBottom: scaleDimension(18),
    gap: scaleDimension(2),
  },
  pixelBarChunk: {
    width: scaleDimension(10),
    height: scaleDimension(8),
    borderRadius: scaleDimension(2),
  },
  pixelBarChunkBlue: {
    backgroundColor: '#00fff7',
  },
  pixelBarChunkPink: {
    backgroundColor: '#ff2e7e',
  },
  registerBtnActive: {
    borderColor: '#fff',
    backgroundColor: '#ff2e7e',
    shadowColor: '#ff2e7e',
    shadowOpacity: 0.7,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 10, 35, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#00fff7',
    fontFamily: pixelFont,
    fontSize: scaleFont(18),
    marginTop: scaleDimension(16),
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: scaleDimension(20),
  },
  successText: {
    color: '#00fff7',
    fontFamily: pixelFont,
    fontSize: scaleFont(18),
    textAlign: 'center',
    marginBottom: scaleDimension(8),
  },
  successSubText: {
    color: '#ff2e7e',
    fontFamily: pixelFont,
    fontSize: scaleFont(14),
    textAlign: 'center',
  },
  forgotBtn: {
    marginTop: scaleDimension(16),
    alignSelf: 'center',
  },
  forgotBtnText: {
    color: '#00fff7',
    fontFamily: pixelFont,
    fontSize: scaleFont(13),
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 10, 35, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
}); 