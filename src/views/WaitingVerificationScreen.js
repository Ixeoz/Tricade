import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { reload } from 'firebase/auth';
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
  const { firebaseUser } = route.params;

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await reload(firebaseUser);
        if (firebaseUser.emailVerified) {
          clearInterval(interval);
          navigation.replace('Games');
        }
      } catch (e) {
        // Puedes mostrar un error si quieres
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a23' }}>
      <View style={styles.container}>
        <View style={styles.cornerDotTL} />
        <View style={styles.cornerDotTR} />
        <View style={styles.cornerDotBL} />
        <View style={styles.cornerDotBR} />
        <Ionicons name="mail-unread" size={scaleDimension(64)} color="#00fff7" style={{ marginBottom: scaleDimension(24) }} />
        <Text style={styles.title}>Verificando tu cuenta…</Text>
        <Text style={styles.msg}>Revisa tu correo y haz clic en el enlace de verificación. Esta ventana se cerrará automáticamente cuando completes la verificación.</Text>
        <ActivityIndicator size="large" color="#00fff7" style={{ marginTop: scaleDimension(32) }} />
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
    fontFamily: pixelFont,
    fontSize: scaleFont(24),
    marginBottom: scaleDimension(16),
    textAlign: 'center',
    textShadowColor: '#00fff7',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: scaleDimension(12),
  },
  msg: {
    color: '#ff2e7e',
    fontFamily: pixelFont,
    fontSize: scaleFont(14),
    textAlign: 'center',
    marginBottom: scaleDimension(12),
    paddingHorizontal: scaleDimension(10),
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