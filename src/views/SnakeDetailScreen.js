import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, Animated, Modal, ActivityIndicator } from 'react-native';
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

const logoSnake = require('../assets/snake.png');
const questionSymbol = require('../assets/question-symbol.png');

export default function SnakeDetailScreen({ navigation }) {
  // Animación para el glow del botón START
  const glowAnim = useRef(new Animated.Value(0)).current;
  const [stats, setStats] = useState({
    bestScore: 0,
    lastScore: 0,
    totalGames: 0,
    totalPixels: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      const loadStats = async () => {
        if (!auth.currentUser) return;
        try {
          const statsRef = doc(db, 'users', auth.currentUser.uid, 'snakeStats', 'stats');
          const statsDoc = await getDoc(statsRef);
          if (statsDoc.exists() && isActive) {
            setStats({
              bestScore: statsDoc.data().bestScore || 0,
              lastScore: statsDoc.data().lastScore || 0,
              totalGames: statsDoc.data().totalGames || 0,
              totalPixels: statsDoc.data().totalPixels || 0,
            });
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
        {/* Logo SNAKE con glow y fondo neón */}
        <View style={styles.logoBoxWrapper}>
          <View style={styles.logoBoxGlow} />
          <View style={styles.logoBox}>
            <Text style={[styles.logoTri, styles.pixelStroke]}>SNA</Text>
            <Text style={[styles.logoCade, styles.pixelStroke]}>KE</Text>
          </View>
        </View>
        {/* Imagen central con doble borde y glow */}
        <View style={styles.centerBoxBorder}>
          <View style={styles.centerBox}>
            <Image source={logoSnake} style={styles.centerImg} resizeMode="contain" />
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
                <Text style={styles.statLabel}>Mejor Puntuación:</Text>
                <Text style={styles.statValue}>{stats.bestScore}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Última puntuación</Text>
                <Text style={styles.statValue}>{stats.lastScore}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Partidas totales:</Text>
                <Text style={styles.statValue}>{stats.totalGames}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Total píxeles comidos:</Text>
                <Text style={styles.statValue}>{stats.totalPixels}</Text>
              </View>
            </>
          )}
        </View>
        {/* Botón de ayuda */}
        <View style={styles.symbolsRow}>
          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={() => setShowHelp(true)} activeOpacity={0.7}>
            <Image source={questionSymbol} style={styles.symbolSmall} resizeMode="contain" />
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
        </View>
        {/* Botón START grande, doble borde, glow animado y con ícono */}
        <TouchableOpacity style={styles.startBtn} activeOpacity={0.8} onPress={() => {
          setShowGameLoading(true);
          setTimeout(() => {
            setShowGameLoading(false);
            navigation.navigate('SnakeGameScreen');
          }, 1200);
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
                <Text style={[styles.helpTitle, styles.pixelStroke]}>SNAKE</Text>
              </View>
              <Text style={[styles.helpVoice, { color: '#ff2e7e' }] }>
                (Voz de presentador de televisión ochentera)
              </Text>
              <Text style={[styles.helpIntroWhite, { marginBottom: 16, color: '#00fff7', textAlign: 'center' }] }>
                "¡Prepárate para deslizarte a velocidades absurdas en SNAKEX, la versión vitaminada del clásico que devoró horas de tu infancia!"
              </Text>
              <Text style={[styles.helpSectionTitle, { color: '#ff2e7e', marginTop: 8 }]}>Cómo se juega:</Text>
              <View style={styles.helpHowToList}>
                <Text style={styles.helpHowTo}><Text style={{ color: '#00fff7' }}>1.</Text> Eres una serpiente digital. Tranquilo, no muerde. Eres tú quien muerde... píxeles.</Text>
                <Text style={styles.helpHowTo}><Text style={{ color: '#00fff7' }}>2.</Text> Usa los controles para moverla: arriba, abajo, izquierda, derecha.</Text>
                <Text style={styles.helpHowTo}><Text style={{ color: '#00fff7' }}>3.</Text> Come las cápsulas brillantes para crecer. Más grande = más poder... y más caídas estrepitosas.</Text>
                <Text style={styles.helpHowTo}><Text style={{ color: '#00fff7' }}>4.</Text> No choques contigo mismo, con las paredes, o con el ego del jugador anterior.</Text>
              </View>
              <Text style={[styles.helpSectionTitle, { color: '#ff2e7e', marginTop: 8 }]}>Tip de la IA:</Text>
              <Text style={[styles.helpTip, { color: '#00fff7', marginBottom: 18 }] }>
                "Cuanto más larga la serpiente, más alta la tensión. Literalmente. ¿Por qué crees que no tenemos seguro médico para jugadores?"
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
    paddingTop: hp(3),
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
    height: scaleDimension(3),
    backgroundColor: '#fff',
    marginBottom: scaleDimension(7),
    opacity: 0.18,
  },
  cornerDotTL: {
    position: 'absolute',
    top: scaleDimension(18),
    left: scaleDimension(18),
    width: scaleDimension(12),
    height: scaleDimension(12),
    backgroundColor: '#ff2e7e',
    borderRadius: scaleDimension(6),
    zIndex: 2,
  },
  cornerDotTR: {
    position: 'absolute',
    top: scaleDimension(18),
    right: scaleDimension(18),
    width: scaleDimension(12),
    height: scaleDimension(12),
    backgroundColor: '#00fff7',
    borderRadius: scaleDimension(6),
    zIndex: 2,
  },
  cornerDotBL: {
    position: 'absolute',
    bottom: scaleDimension(18),
    left: scaleDimension(18),
    width: scaleDimension(12),
    height: scaleDimension(12),
    backgroundColor: '#00fff7',
    borderRadius: scaleDimension(6),
    zIndex: 2,
  },
  cornerDotBR: {
    position: 'absolute',
    bottom: scaleDimension(18),
    right: scaleDimension(18),
    width: scaleDimension(12),
    height: scaleDimension(12),
    backgroundColor: '#ff2e7e',
    borderRadius: scaleDimension(6),
    zIndex: 2,
  },
  backBtn: {
    position: 'absolute',
    top: hp(2.5),
    left: wp(4),
    zIndex: 10,
  },
  backBox: {
    width: scaleDimension(36),
    height: scaleDimension(36),
    borderRadius: scaleDimension(8),
    backgroundColor: '#3a2172',
    borderWidth: scaleDimension(2),
    borderColor: '#ff2e7e',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff2e7e',
    shadowOpacity: 0.3,
    shadowRadius: scaleDimension(6),
    shadowOffset: { width: 0, height: 0 },
  },
  backArrow: {
    color: '#ff2e7e',
    fontFamily: pixelFont,
    fontSize: scaleFont(22),
    marginLeft: scaleDimension(2),
    marginTop: scaleDimension(-2),
  },
  logoBoxWrapper: {
    marginTop: hp(3),
    marginBottom: hp(2.5),
    alignSelf: 'center',
    position: 'relative',
  },
  logoBoxGlow: {
    position: 'absolute',
    top: scaleDimension(-10),
    left: scaleDimension(-10),
    right: scaleDimension(-10),
    bottom: scaleDimension(-10),
    borderRadius: scaleDimension(22),
    backgroundColor: '#7d2fff',
    opacity: 0.25,
    zIndex: 0,
    shadowColor: '#7d2fff',
    shadowOpacity: 0.7,
    shadowRadius: scaleDimension(24),
    shadowOffset: { width: 0, height: 0 },
  },
  logoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#3a2172',
    borderRadius: scaleDimension(18),
    borderWidth: scaleDimension(4),
    borderColor: '#7d2fff',
    paddingHorizontal: wp(13),
    paddingVertical: hp(1.2),
    shadowColor: '#7d2fff',
    shadowOpacity: 0.3,
    shadowRadius: scaleDimension(8),
    shadowOffset: { width: 0, height: 0 },
    zIndex: 1,
  },
  logoTri: {
    color: '#00fff7',
    fontFamily: pixelFont,
    fontSize: scaleFont(38),
    letterSpacing: scaleDimension(2),
    marginRight: scaleDimension(2),
    marginLeft: scaleDimension(2),
  },
  logoCade: {
    color: '#ff2e7e',
    fontFamily: pixelFont,
    fontSize: scaleFont(38),
    letterSpacing: scaleDimension(2),
    marginLeft: scaleDimension(2),
    marginRight: scaleDimension(2),
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
    marginBottom: hp(2.5),
    alignSelf: 'center',
    zIndex: 1,
  },
  centerBox: {
    borderWidth: 4,
    borderColor: '#ff2e7e',
    borderRadius: 16,
    backgroundColor: '#101926',
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(4),
    alignItems: 'center',
    minWidth: 120,
    minHeight: 80,
  },
  centerImg: {
    width: getResponsiveDimension(80),
    height: getResponsiveDimension(80),
  },
  statsBox: {
    width: '92%',
    marginBottom: hp(0.18),
    marginTop: hp(0.01),
    gap: hp(0.012),
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#18182e',
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#00fff7',
    paddingVertical: hp(0.018),
    paddingHorizontal: wp(0.06),
    marginBottom: 0,
    shadowColor: '#00fff7',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    gap: 12,
  },
  statIcon: {
    width: getResponsiveDimension(28),
    height: getResponsiveDimension(28),
    marginRight: getResponsiveDimension(8),
  },
  statLabel: {
    color: '#fff',
    fontFamily: pixelFont,
    fontSize: getResponsiveDimension(15),
    flex: 1,
    textAlign: 'left',
  },
  statValue: {
    color: '#00fff7',
    fontFamily: pixelFont,
    fontSize: getResponsiveDimension(15),
    textAlign: 'right',
    minWidth: getResponsiveDimension(32),
  },
  symbolsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '70%',
    alignSelf: 'center',
    marginBottom: hp(0.035),
    marginTop: hp(0.018),
    gap: getResponsiveDimension(18),
  },
  symbolBig: {
    width: getResponsiveDimension(64),
    height: getResponsiveDimension(64),
    shadowColor: '#00fff7',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  symbolSmall: {
    width: getResponsiveDimension(72),
    height: getResponsiveDimension(72),
    marginHorizontal: getResponsiveDimension(18),
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
    paddingVertical: hp(0.028),
    marginTop: hp(0.01),
    marginBottom: hp(0.04),
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
    gap: getResponsiveDimension(16),
  },
  startBtnText: {
    color: '#00fff7',
    fontFamily: pixelFont,
    fontSize: scaleFont(26),
    textAlign: 'center',
    letterSpacing: scaleDimension(2),
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
    paddingVertical: hp(0.03),
    paddingHorizontal: wp(0.06),
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
    paddingHorizontal: wp(13),
    paddingVertical: hp(1.2),
    marginBottom: hp(0.018),
    shadowColor: '#7d2fff',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  helpTitle: {
    color: '#00fff7',
    fontFamily: pixelFont,
    fontSize: scaleFont(38),
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: scaleDimension(2),
  },
  helpVoice: {
    color: '#ff2e7e',
    fontFamily: pixelFont,
    fontSize: scaleFont(15),
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
    fontSize: scaleFont(15),
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
    fontSize: scaleFont(18),
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
    fontSize: scaleFont(13),
    textAlign: 'left',
    marginBottom: 2,
  },
  helpTip: {
    color: '#fff',
    fontFamily: pixelFont,
    fontSize: scaleFont(15),
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
    paddingVertical: hp(0.022),
    marginTop: hp(0.01),
    shadowColor: '#00fff7',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  helpBtnText: {
    color: '#00fff7',
    fontFamily: pixelFont,
    fontSize: scaleFont(22),
    textAlign: 'center',
    letterSpacing: scaleDimension(2),
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
    fontSize: scaleFont(20),
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
    height: '100%',
    backgroundColor: '#7d2fff',
    width: '80%',
    borderRadius: 8,
  },
}); 