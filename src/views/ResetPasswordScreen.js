import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ActivityIndicator, Pressable, SafeAreaView, ScrollView } from 'react-native';
import RetroButton from '../components/RetroButton';
import { sendPasswordResetEmail } from 'firebase/auth';
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

export default function ResetPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async () => {
    setError('');
    if (!email.trim()) {
      setError('Ingresa tu email');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSuccess(true);
    } catch (e) {
      setError('No se pudo enviar el correo. Verifica el email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a23' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', minHeight: height }} showsVerticalScrollIndicator={false}>
        <View style={styles.root}>
          <Text style={[styles.title]}>Restablecer contraseña</Text>
          {!success ? (
            <>
              <Text style={styles.infoText}>Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email"
                  placeholderTextColor="#00fff7"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!loading}
                />
              </View>
              {error ? <Text style={styles.errorMsg}>{error}</Text> : null}
              <RetroButton
                title={loading ? 'Enviando...' : 'Enviar'}
                onPress={handleReset}
                disabled={loading || !email.trim()}
                style={styles.sendBtn}
              />
              <Pressable onPress={() => navigation.replace('Login')} style={styles.backBtn}>
                <Text style={styles.backBtnText}>Volver al inicio de sesión</Text>
              </Pressable>
            </>
          ) : (
            <View style={styles.successBox}>
              <Text style={styles.successText}>¡Correo enviado!</Text>
              <Text style={styles.infoText}>Revisa tu correo y sigue el enlace para restablecer tu contraseña.</Text>
              <RetroButton title="Volver al login" onPress={() => navigation.replace('Login')} style={styles.sendBtn} />
            </View>
          )}
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#00fff7" />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a0a23',
    padding: scaleDimension(24),
    width: '100%',
    maxWidth: scaleDimension(420),
    alignSelf: 'center',
  },
  title: {
    color: '#ff2e7e',
    fontFamily: pixelFont,
    fontSize: scaleFont(28),
    marginBottom: scaleDimension(18),
    textAlign: 'center',
  },
  infoText: {
    color: '#fff',
    fontFamily: pixelFont,
    fontSize: scaleFont(14),
    textAlign: 'center',
    marginBottom: scaleDimension(18),
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
    marginBottom: scaleDimension(8),
  },
  input: {
    color: '#00fff7',
    fontFamily: pixelFont,
    fontSize: scaleFont(16),
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
  sendBtn: {
    marginTop: scaleDimension(12),
    marginBottom: scaleDimension(8),
  },
  backBtn: {
    marginTop: scaleDimension(8),
    alignSelf: 'center',
  },
  backBtnText: {
    color: '#00fff7',
    fontFamily: pixelFont,
    fontSize: scaleFont(14),
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  successBox: {
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