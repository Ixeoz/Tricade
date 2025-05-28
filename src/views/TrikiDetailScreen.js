import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, SafeAreaView, Animated, Modal, ActivityIndicator } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
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

const logoTriki = require('../assets/logo-triki.png');
const questionSymbol = require('../assets/question-symbol.png');
const equisTriki = require('../assets/equis-triki.png');
const circleTriki = require('../assets/circle-triki.png');
const trophyIcon = require('../assets/trophy-pink.png');

export default function TrikiDetailScreen({ navigation }) {
  // Animación para el glow del botón START
  const glowAnim = useRef(new Animated.Value(0)).current;
  const [stats, setStats] = useState({
    victorias: 0,
    derrotas: 0,
    empates: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      const loadStats = async () => {
        if (!auth.currentUser) return;
        try {
          const statsRef = doc(db, 'users', auth.currentUser.uid, 'trikiStats', 'stats');
          const statsDoc = await getDoc(statsRef);
          if (statsDoc.exists() && isActive) {
            setStats(statsDoc.data());
          }
        } catch (error) {
          console.error('Error loading stats:', error);
        } finally {
          if (isActive) setIsLoading(false);
        }
      };
      setIsLoading(true);
      loadStats();
      return () => { isActive = false; };
    }, [])
  );

  // Glow animado para el botón
  const startBtnShadow = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.25, 0.7],
  });

  const [showHelp, setShowHelp] = React.useState(false);
  const [showGameLoading, setShowGameLoading] = React.useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a23' }}>
      {/* Scanlines sutiles de fondo */}
      <View pointerEvents="none" style={styles.scanlinesBg}>
        {Array.from({ length: 32 }).map((_, i) => (
          <View key={i} style={styles.scanline} />
        ))}
      </View>
      {/* Puntos decorativos en las esquinas */}
      <View style={styles.cornerDotTL} />
      <View style={styles.cornerDotTR} />
      <View style={styles.cornerDotBL} />
      <View style={styles.cornerDotBR} />
      <View style={styles.root}>
        {/* Botón volver */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation && navigation.goBack && navigation.goBack()}>
          <View style={styles.backBox}>
            <Text style={styles.backArrow}>{'<'}</Text>
          </View>
        </TouchableOpacity>
        {/* Logo TRIKI con glow y fondo neón */}
        <View style={styles.logoBoxWrapper}>
          <View style={styles.logoBoxGlow} />
          <View style={styles.logoBox}>
            <Text style={[styles.logoTri, styles.pixelStroke]}>TRI</Text>
            <Text style={[styles.logoCade, styles.pixelStroke]}>KI</Text>
          </View>
        </View>
        {/* Imagen central con doble borde y glow */}
        <View style={styles.centerBoxBorder}>
          <View style={styles.centerBox}>
            <Image source={logoTriki} style={styles.centerImg} resizeMode="contain" />
          </View>
        </View>
        {/* Stats con íconos y alineación mejorada */}
        <View style={styles.statsBox}>
          {isLoading ? (
            <View style={styles.loadingStats}>
              <ActivityIndicator size="large" color="#00fff7" />
            </View>
          ) : (
            <>
              <View style={styles.statRow}>
                <Image source={trophyIcon} style={styles.statIcon} resizeMode="contain" />
                <Text style={styles.statLabel}>Victorias:</Text>
                <Text style={styles.statValue}>{stats.victorias}</Text>
              </View>
              <View style={styles.statRow}>
                <Image source={trophyIcon} style={styles.statIcon} resizeMode="contain" />
                <Text style={styles.statLabel}>Derrotas:</Text>
                <Text style={styles.statValue}>{stats.derrotas}</Text>
              </View>
              <View style={styles.statRow}>
                <Image source={trophyIcon} style={styles.statIcon} resizeMode="contain" />
                <Text style={styles.statLabel}>Empates:</Text>
                <Text style={styles.statValue}>{stats.empates}</Text>
              </View>
            </>
          )}
        </View>
        {/* Símbolos grandes y separados */}
        <View style={styles.symbolsRow}>
          <Image source={equisTriki} style={styles.symbolBig} resizeMode="contain" />
          <TouchableOpacity onPress={() => setShowHelp(true)} activeOpacity={0.7}>
            <Image source={questionSymbol} style={styles.symbolSmall} resizeMode="contain" />
          </TouchableOpacity>
          <Image source={circleTriki} style={styles.symbolBig} resizeMode="contain" />
        </View>
        {/* Botón START grande, doble borde, glow animado y con ícono */}
        <TouchableOpacity style={styles.startBtn} activeOpacity={0.8} onPress={() => {
          setShowGameLoading(true);
          setTimeout(() => {
            setShowGameLoading(false);
            navigation.navigate('TrikiGameScreen');
          }, 1500);
        }}>
          <View style={styles.startBtnContent}>
            <Text style={styles.startBtnText}>¡START!</Text>
          </View>
        </TouchableOpacity>
      </View>
      {/* Modal de ayuda */}
      <Modal
        visible={showHelp}
        transparent
        animationType="fade"
        onRequestClose={() => setShowHelp(false)}
      >
        <View style={styles.helpOverlay}>
          <View style={styles.helpBoxBorder}>
            <View style={styles.helpBox}>
              <View style={styles.helpLogoBox}>
                <Text style={[styles.helpTitle, styles.pixelStroke]}>TRIKI</Text>
              </View>
              <Text style={styles.helpVoice}>
                (Voz de androide entrenado en estrategia galáctica)
              </Text>
              <Text style={styles.helpIntro}>
                <Text style={styles.helpIntroWhite}>
                  "Bienvenido al campo de batalla geométrico más legendario del cosmos: <Text style={styles.helpCyan}>TRIKI 3000</Text>.{"\n"}
                  Dicen que fue creado por sabios del siglo XX con palitos y circuititos...{"\n"}
                  <Text style={styles.helpPink}>Y aún nadie lo ha dominado completamente.</Text>"
                </Text>
              </Text>
              <Text style={styles.helpSectionTitle}>¿Cómo se juega?</Text>
              <View style={styles.helpHowToList}>
                <Text style={styles.helpHowTo}><Text style={styles.helpCyan}>1.</Text> Eres <Text style={styles.helpCyan}>"X"</Text> o <Text style={styles.helpCyan}>"O"</Text>. No, no puedes elegir ser una banana.</Text>
                <Text style={styles.helpHowTo}><Text style={styles.helpCyan}>2.</Text> Turno a turno, colocas tu símbolo en la cuadrícula <Text style={styles.helpCyan}>3x3</Text>.</Text>
                <Text style={styles.helpHowTo}><Text style={styles.helpCyan}>3.</Text> Forma una línea de <Text style={styles.helpCyan}>3 símbolos</Text> (horizontal, vertical o diagonal) antes que tu oponente.</Text>
                <Text style={styles.helpHowTo}><Text style={styles.helpCyan}>4.</Text> Si nadie gana, <Text style={styles.helpPink}>empate</Text>. Aunque seamos sinceros... ambos pierden dignidad.</Text>
              </View>
              <Text style={styles.helpSectionTitle}>Tip de la IA</Text>
              <Text style={styles.helpTip}>
                <Text style={styles.helpPink}>¿Quieres un truco?</Text> Comienza en una <Text style={styles.helpCyan}>esquina</Text>. <Text style={styles.helpPink}>Shhh... no lo escuchaste de mí.</Text>
              </Text>
              <TouchableOpacity style={styles.helpBtn} onPress={() => setShowHelp(false)} activeOpacity={0.8}>
                <Text style={styles.helpBtnText}>¡Listo!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {showGameLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <Text style={styles.loadingText}>Cargando... {'\n'}¡Empezando juego!</Text>
            <View style={styles.loadingBarBg}>
              <View style={styles.loadingBarFill} />
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    paddingTop: height * 0.03,
    width: '100%',
    justifyContent: 'flex-start',
  },
  scanlinesBg: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    flexDirection: 'column',
    justifyContent: 'space-between',
    opacity: 0.13,
  },
  scanline: {
    width: '100%',
    height: 3,
    backgroundColor: '#fff',
    marginBottom: 7,
    opacity: 0.18,
  },
  cornerDotTL: {
    position: 'absolute', top: 18, left: 18, width: 12, height: 12, backgroundColor: '#ff2e7e', borderRadius: 6, zIndex: 2,
  },
  cornerDotTR: {
    position: 'absolute', top: 18, right: 18, width: 12, height: 12, backgroundColor: '#00fff7', borderRadius: 6, zIndex: 2,
  },
  cornerDotBL: {
    position: 'absolute', bottom: 18, left: 18, width: 12, height: 12, backgroundColor: '#00fff7', borderRadius: 6, zIndex: 2,
  },
  cornerDotBR: {
    position: 'absolute', bottom: 18, right: 18, width: 12, height: 12, backgroundColor: '#ff2e7e', borderRadius: 6, zIndex: 2,
  },
  backBtn: {
    position: 'absolute',
    top: height * 0.055,
    left: width * 0.04,
    zIndex: 10,
  },
  backBox: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: '#3a2172',
    borderWidth: 1.5,
    borderColor: '#ff2e7e',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff2e7e',
    shadowOpacity: 0.18,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 0 },
  },
  backArrow: {
    color: '#ff2e7e',
    fontFamily: pixelFont,
    fontSize: Math.min(width * 0.045, 16),
    marginLeft: 1,
    marginTop: -1,
  },
  logoBoxWrapper: {
    marginTop: height * 0.08,
    marginBottom: height * 0.025,
    alignSelf: 'center',
    position: 'relative',
  },
  logoBoxGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 22,
    backgroundColor: '#7d2fff',
    opacity: 0.25,
    zIndex: 0,
    shadowColor: '#7d2fff',
    shadowOpacity: 0.7,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
  },
  logoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#3a2172',
    borderRadius: 18,
    borderWidth: 4,
    borderColor: '#7d2fff',
    paddingHorizontal: width * 0.13,
    paddingVertical: height * 0.012,
    shadowColor: '#7d2fff',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    zIndex: 1,
  },
  logoTri: {
    color: '#00fff7',
    fontFamily: pixelFont,
    fontSize: Math.min(width * 0.11, 38),
    letterSpacing: 2,
    marginRight: 2,
    marginLeft: 2,
  },
  logoCade: {
    color: '#ff2e7e',
    fontFamily: pixelFont,
    fontSize: Math.min(width * 0.11, 38),
    letterSpacing: 2,
    marginLeft: 2,
    marginRight: 2,
  },
  pixelStroke: {
    textShadowOffset: { width: 2, height: 2 },
    textShadowColor: '#000',
    textShadowRadius: 0,
  },
  centerBoxBorder: {
    borderWidth: 5,
    borderColor: '#00fff7',
    borderRadius: 22,
    padding: 8,
    backgroundColor: '#23233a',
    marginBottom: height * 0.025,
    alignSelf: 'center',
    zIndex: 1,
  },
  centerBox: {
    borderWidth: 4,
    borderColor: '#ff2e7e',
    borderRadius: 16,
    backgroundColor: '#101926',
    paddingVertical: height * 0.025,
    paddingHorizontal: width * 0.04,
    alignItems: 'center',
    minWidth: 120,
    minHeight: 80,
  },
  centerImg: {
    width: Math.min(width * 0.22, 80),
    height: Math.min(width * 0.22, 80),
  },
  statsBox: {
    width: '92%',
    marginBottom: height * 0.018,
    marginTop: height * 0.01,
    gap: height * 0.012,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#18182e',
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#00fff7',
    paddingVertical: height * 0.018,
    paddingHorizontal: width * 0.06,
    marginBottom: 0,
    shadowColor: '#00fff7',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    gap: 12,
  },
  statIcon: {
    width: Math.min(width * 0.07, 28),
    height: Math.min(width * 0.07, 28),
    marginRight: 8,
  },
  statLabel: {
    color: '#fff',
    fontFamily: pixelFont,
    fontSize: Math.min(width * 0.045, 15),
    flex: 1,
    textAlign: 'left',
  },
  statValue: {
    color: '#00fff7',
    fontFamily: pixelFont,
    fontSize: Math.min(width * 0.045, 15),
    textAlign: 'right',
    minWidth: 32,
  },
  symbolsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '70%',
    alignSelf: 'center',
    marginBottom: height * 0.035,
    marginTop: height * 0.018,
    gap: 18,
  },
  symbolBig: {
    width: Math.min(width * 0.19, 64),
    height: Math.min(width * 0.19, 64),
    shadowColor: '#00fff7',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  symbolSmall: {
    width: Math.min(width * 0.21, 72),
    height: Math.min(width * 0.21, 72),
    marginHorizontal: 18,
    shadowColor: '#7d2fff',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  startBtn: {
    width: '84%',
    alignSelf: 'center',
    backgroundColor: '#101926',
    borderWidth: 4,
    borderColor: '#00fff7',
    borderRadius: 16,
    paddingVertical: height * 0.028,
    marginTop: height * 0.01,
    marginBottom: height * 0.04,
    shadowColor: '#00fff7',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    zIndex: 1,
  },
  startBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  startBtnText: {
    color: '#00fff7',
    fontFamily: pixelFont,
    fontSize: Math.min(width * 0.07, 26),
    textAlign: 'center',
    letterSpacing: 2,
  },
  helpOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10,10,35,0.93)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    zIndex: 100,
  },
  helpBoxBorder: {
    borderWidth: 6,
    borderColor: '#00fff7',
    borderRadius: 22,
    backgroundColor: '#23233a',
    padding: 6,
    shadowColor: '#00fff7',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  helpBox: {
    borderWidth: 4,
    borderColor: '#ff2e7e',
    borderRadius: 16,
    backgroundColor: '#101926',
    paddingVertical: height * 0.03,
    paddingHorizontal: width * 0.06,
    alignItems: 'center',
    maxWidth: 370,
    minWidth: 260,
  },
  helpLogoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#3a2172',
    borderRadius: 18,
    borderWidth: 4,
    borderColor: '#7d2fff',
    paddingHorizontal: width * 0.13,
    paddingVertical: height * 0.012,
    marginBottom: height * 0.018,
    shadowColor: '#7d2fff',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  helpTitle: {
    color: '#00fff7',
    fontFamily: pixelFont,
    fontSize: Math.min(width * 0.13, 38),
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 2,
  },
  helpVoice: {
    color: '#ff2e7e',
    fontFamily: pixelFont,
    fontSize: Math.min(width * 0.038, 15),
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 2,
  },
  helpIntro: {
    marginBottom: 14,
  },
  helpIntroWhite: {
    color: '#fff',
    fontFamily: pixelFont,
    fontSize: Math.min(width * 0.038, 15),
    textAlign: 'center',
  },
  helpCyan: {
    color: '#00fff7',
    fontFamily: pixelFont,
  },
  helpPink: {
    color: '#ff2e7e',
    fontFamily: pixelFont,
  },
  helpSectionTitle: {
    color: '#ff2e7e',
    fontFamily: pixelFont,
    fontSize: Math.min(width * 0.045, 18),
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 6,
    letterSpacing: 1,
  },
  helpHowToList: {
    alignSelf: 'stretch',
    marginBottom: 10,
    gap: 2,
  },
  helpHowTo: {
    color: '#fff',
    fontFamily: pixelFont,
    fontSize: Math.min(width * 0.034, 13),
    textAlign: 'left',
    marginBottom: 2,
  },
  helpTip: {
    color: '#fff',
    fontFamily: pixelFont,
    fontSize: Math.min(width * 0.038, 15),
    textAlign: 'center',
    marginBottom: 16,
    marginTop: 2,
  },
  helpBtn: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#101926',
    borderWidth: 3,
    borderColor: '#00fff7',
    borderRadius: 12,
    paddingVertical: height * 0.022,
    marginTop: height * 0.01,
    shadowColor: '#00fff7',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  helpBtnText: {
    color: '#00fff7',
    fontFamily: pixelFont,
    fontSize: Math.min(width * 0.06, 22),
    textAlign: 'center',
    letterSpacing: 2,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,10,35,0.97)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  loadingBox: {
    borderWidth: 5,
    borderColor: '#00fff7',
    borderRadius: 18,
    backgroundColor: '#23233a',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#00fff7',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  loadingText: {
    color: '#00fff7',
    fontFamily: pixelFont,
    fontSize: Math.min(width * 0.052, 20),
    textAlign: 'center',
    marginBottom: 18,
  },
  loadingBarBg: {
    width: 120,
    height: 14,
    backgroundColor: '#18182e',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#7d2fff',
    overflow: 'hidden',
  },
  loadingBarFill: {
    width: '80%',
    height: '100%',
    backgroundColor: '#00fff7',
    borderRadius: 8,
  },
  loadingStats: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 