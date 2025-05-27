import React, { useEffect, useState } from 'react';
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
import { getFirestore } from 'firebase/firestore';
import { setDoc, doc } from 'firebase/firestore';

const pixelFont = 'PressStart2P_400Regular';

export default function WaitingVerificationScreen({ route, navigation }) {
  const { firebaseUser } = route.params;
  const [error, setError] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const checkVerification = async () => {
      try {
        setIsChecking(true);
        setError(null);
        
        // Reload user to get latest verification status
        await reload(firebaseUser);
        
        if (firebaseUser.emailVerified) {
          try {
            // Update verification status in Firestore
            const db = getFirestore();
            await setDoc(doc(db, 'users', firebaseUser.uid), {
              emailVerified: true,
              lastVerifiedAt: new Date().toISOString()
            }, { merge: true });
            
            if (isMounted) {
              navigation.replace('Home');
            }
          } catch (firestoreError) {
            console.error('Error updating Firestore:', firestoreError);
            if (isMounted) {
              setError('Error al actualizar el estado de verificación. Por favor, intenta iniciar sesión nuevamente.');
            }
          }
        }
      } catch (error) {
        console.error('Error checking verification:', error);
        if (isMounted) {
          setError('Error al verificar el estado. Por favor, intenta nuevamente.');
        }
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    };

    // Initial check
    checkVerification();

    // Set up interval for periodic checks
    const interval = setInterval(checkVerification, 3000);

    // Cleanup
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [firebaseUser, navigation]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a23' }}>
      <View style={styles.container}>
        <View style={styles.cornerDotTL} />
        <View style={styles.cornerDotTR} />
        <View style={styles.cornerDotBL} />
        <View style={styles.cornerDotBR} />
        <Ionicons name="mail-unread" size={scaleDimension(64)} color="#00fff7" style={{ marginBottom: scaleDimension(24) }} />
        <Text style={styles.title}>Verificando tu cuenta…</Text>
        <Text style={styles.msg}>
          {error ? error : 'Revisa tu correo y haz clic en el enlace de verificación. Esta ventana se cerrará automáticamente cuando completes la verificación.'}
        </Text>
        {isChecking && <ActivityIndicator size="large" color="#00fff7" style={{ marginTop: scaleDimension(32) }} />}
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