import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ActivityIndicator, TouchableOpacity, SafeAreaView, ScrollView, Pressable } from 'react-native';
import RetroButton from '../components/RetroButton';
import { LinearGradient } from 'expo-linear-gradient';
import app from '../firebaseConfig';
import { getAuth, createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
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

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');
  const [focusInput, setFocusInput] = useState('');
  const [loginPressed, setLoginPressed] = useState(false);
  const auth = getAuth(app);

  const handleRegister = async () => {
    if (!username.trim() || !password.trim() || !password2.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (password !== password2) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // No crear usuario aquí, solo navegar a verificación
    navigation.navigate('Verification', {
      username: username.trim(),
      password: password
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a23' }}>
      <View style={{ flex: 1 }}>
        {/* Esquinas decorativas */}
        <View style={styles.cornerDotTL} />
        <View style={styles.cornerDotTR} />
        <View style={styles.cornerDotBL} />
        <View style={styles.cornerDotBR} />
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', minHeight: height }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
          >
          <View style={styles.container}>
              <Text style={[styles.title, styles.titleGlow, ...pixelStroke]}>Registro</Text>
              <View style={styles.msgBoxBorder}>
                <View style={styles.msgBox}>
                  <Text style={styles.msgText}>
                    <Text style={styles.msgTextRed}>
                      "Estás a punto de unirte a la élite interdimensional de jugadores con dedos veloces y memoria selectiva. "
                    </Text>
                    <Text style={styles.msgTextGreen}>
                      Regístrate. El universo necesita otro héroe... o al menos alguien que no cierre la app a los 30 segundos."
                    </Text>
                  </Text>
                </View>
              </View>
              <View style={[styles.inputBox, focusInput === 'user' && styles.inputBoxGlow]}> 
                <TextInput
                  style={[styles.input, { fontFamily: 'PressStart2P_400Regular' }]}
                  value={username}
                  onChangeText={t => { setUsername(t); setError(''); }}
                  placeholder="Usuario"
                  placeholderTextColor="#00fff7"
                  maxLength={32}
                  autoCapitalize="none"
                  onFocus={() => setFocusInput('user')}
                  onBlur={() => setFocusInput('')}
                />
              </View>
              <View style={[styles.inputBox, focusInput === 'pass1' && styles.inputBoxGlow]}> 
                <TextInput
                  style={[styles.input, { fontFamily: 'PressStart2P_400Regular' }]}
                  value={password}
                  onChangeText={t => { setPassword(t); setError(''); }}
                  placeholder="Contraseña"
                  placeholderTextColor="#ff2e7e"
                  secureTextEntry
                  maxLength={32}
                  onFocus={() => setFocusInput('pass1')}
                  onBlur={() => setFocusInput('')}
                />
              </View>
              <View style={[
                styles.inputBox,
                focusInput === 'pass2' && styles.inputBoxGlow,
                error === 'Las contraseñas no coinciden' && styles.inputBoxError
              ]}> 
                <TextInput
                  style={[styles.input, { fontFamily: 'PressStart2P_400Regular' }]}
                  value={password2}
                  onChangeText={t => { setPassword2(t); setError(''); }}
                  placeholder="Confirmar"
                  placeholderTextColor="#ff2e7e"
                  secureTextEntry
                  maxLength={32}
                  onFocus={() => setFocusInput('pass2')}
                  onBlur={() => setFocusInput('')}
                />
              </View>
              <View style={styles.pixelBarSeparator}>
                {Array.from({ length: 18 }).map((_, i) => (
                  <View key={i} style={[styles.pixelBarChunk, i % 2 === 0 ? styles.pixelBarChunkBlue : styles.pixelBarChunkPink]} />
                ))}
              </View>
              {error ? <Text style={[styles.errorMsg, { fontFamily: 'PressStart2P_400Regular' }]}>{error}</Text> : null}
              <RetroButton
                title="Registrarse"
                onPress={handleRegister}
                style={[styles.glowBtn, username.trim() && password.trim() && password2.trim() ? undefined : styles.disabledBtn]}
                disabled={!username.trim() || !password.trim() || !password2.trim()}
                textStyle={{ fontFamily: 'PressStart2P_400Regular' }}
              />
              <Pressable
                style={({ pressed }) => [styles.loginBtn, loginPressed || pressed ? styles.loginBtnActive : null]}
                onPressIn={() => setLoginPressed(true)}
                onPressOut={() => setLoginPressed(false)}
                onPress={() => navigation.replace('Login')}
              >
                <Text style={[styles.loginBtnText, { fontFamily: 'PressStart2P_400Regular' }]}>Ya tengo cuenta</Text>
              </Pressable>
            </View>
          </ScrollView>
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
  },
  title: {
    color: '#ff2e7e',
    fontFamily: pixelFont,
    fontSize: scaleFont(28),
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
    borderRadius: scaleDimension(18),
    padding: 6,
    backgroundColor: '#23233a',
    marginBottom: scaleDimension(12),
    alignSelf: 'center',
    width: wp(90),
  },
  msgBox: {
    borderWidth: 4,
    borderColor: '#ff2e7e',
    borderRadius: scaleDimension(18),
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
  inputBoxGlow: {
    shadowColor: '#00fff7',
    shadowOpacity: 0.85,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    borderColor: '#fff',
  },
  inputBoxError: {
    borderColor: '#ff2e7e',
    shadowColor: '#ff2e7e',
    shadowOpacity: 0.7,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
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
  glowBtn: {
    shadowColor: '#00fff7',
    shadowOpacity: 0.85,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  disabledBtn: {
    opacity: 0.5,
    paddingVertical: 8,
  },
  pixelBarSeparator: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginVertical: scaleDimension(12),
    marginBottom: scaleDimension(18),
    gap: 2,
  },
  pixelBarChunk: {
    width: 10,
    height: 8,
    borderRadius: 2,
  },
  pixelBarChunkBlue: {
    backgroundColor: '#00fff7',
  },
  pixelBarChunkPink: {
    backgroundColor: '#ff2e7e',
  },
  loginBtn: {
    marginTop: scaleDimension(16),
    alignSelf: 'center',
  },
  loginBtnActive: {
    borderColor: '#fff',
    backgroundColor: '#ff2e7e',
    shadowColor: '#ff2e7e',
    shadowOpacity: 0.7,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  loginBtnText: {
    color: '#00fff7',
    fontFamily: pixelFont,
    fontSize: scaleFont(14),
    textAlign: 'center',
    textDecorationLine: 'underline',
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
}); 