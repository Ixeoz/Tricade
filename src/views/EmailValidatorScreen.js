import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Dimensions, ActivityIndicator, Animated, Pressable, SafeAreaView, ScrollView } from 'react-native';
import RetroButton from '../components/RetroButton';
import { Ionicons } from '@expo/vector-icons';
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

export default function EmailValidatorScreen({ route, navigation }) {
  const { username } = route.params;
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSend = async () => {
    if (!email.trim()) {
      setError('Por favor ingresa un email válido');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Por favor ingresa un email válido');
      return;
    }
    setIsLoading(true);
    setError('');
    setTimeout(() => {
      setIsSent(true);
      setIsLoading(false);
      setTimeout(() => navigation.navigate('Home'), 2500);
    }, 1800);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a23' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', minHeight: height }} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <Animated.View
            style={[
              styles.animatedBlock,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text
              style={[
                styles.title,
                styles.titleGlow,
                ...pixelStroke,
                { fontSize: scaleFont(28) },
              ]}
              numberOfLines={2}
              adjustsFontSizeToFit
            >
              Verifica tu Email
            </Text>
            <View style={styles.msgBoxBorder}>
              <View style={styles.msgBox}>
                <Text style={styles.msgText}>
                  Ingresa tu correo electrónico para recibir el enlace de verificación.
                </Text>
              </View>
            </View>
            {!isSent ? (
              <>
                <View style={styles.inputBox}>
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
                </View>
                {error ? <Text style={styles.errorMsg}>{error}</Text> : null}
                <RetroButton
                  title={isLoading ? 'Enviando...' : 'Enviar Verificación'}
                  onPress={handleSend}
                  disabled={isLoading}
                  style={styles.verifyButton}
                />
              </>
            ) : (
              <View style={styles.verifiedContainer}>
                <Ionicons name="checkmark-circle" size={64} color="#00fff7" />
                <Text style={styles.verifiedText}>¡Verificación enviada!</Text>
                <Text style={styles.verifiedSubText}>Revisa tu correo y sigue el enlace.</Text>
              </View>
            )}
            {isLoading && <ActivityIndicator size="large" color="#00fff7" style={styles.loadingOverlay} />}
            <Pressable
              style={({ pressed }) => [styles.backButton, pressed && styles.backButtonActive]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>Volver</Text>
            </Pressable>
          </Animated.View>
        </View>
      </ScrollView>
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
  animatedBlock: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 24,
    backgroundColor: 'transparent',
    borderRadius: Math.max(18, width * 0.045),
  },
  title: {
    color: '#fff',
    fontFamily: pixelFont,
    letterSpacing: 2,
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
    marginBottom: scaleDimension(12),
    alignSelf: 'center',
    width: '100%',
    maxWidth: 340,
    shadowColor: '#00fff7',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  msgBox: {
    borderWidth: 4,
    borderColor: '#ff2e7e',
    borderRadius: 12,
    backgroundColor: '#101926',
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    shadowColor: '#ff2e7e',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  msgText: {
    fontFamily: pixelFont,
    fontSize: scaleFont(14),
    textAlign: 'center',
    color: '#fff',
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
  verifyButton: {
    width: wp(88),
    maxWidth: scaleDimension(340),
    marginTop: scaleDimension(16),
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
  backButton: {
    width: '100%',
    maxWidth: 340,
    alignSelf: 'center',
    marginTop: scaleDimension(12),
    borderWidth: scaleDimension(2),
    borderColor: '#ff2e7e',
    borderRadius: 10,
    backgroundColor: '#23233a',
    paddingVertical: scaleDimension(14),
    paddingHorizontal: scaleDimension(10),
    marginBottom: scaleDimension(10),
  },
  backButtonActive: {
    borderColor: '#fff',
    backgroundColor: '#ff2e7e',
    shadowColor: '#ff2e7e',
    shadowOpacity: 0.7,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  backButtonText: {
    color: '#ff2e7e',
    fontFamily: pixelFont,
    fontSize: scaleFont(18),
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
}); 