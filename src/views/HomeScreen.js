import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, ScrollView, Animated, Easing } from 'react-native';
import RetroButton from '../components/RetroButton';

const { width, height } = Dimensions.get('window');
const pixelFont = 'PressStart2P_400Regular';

// Borde pixelado grueso para texto
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

const HomeScreen = ({ navigation }) => {
  // Animación para puntos decorativos
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(anim, { toValue: 0, duration: 900, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    ).start();
  }, []);

  // Parpadeo para el texto START
  const [showCursor, setShowCursor] = useState(true);
  useEffect(() => {
    const interval = setInterval(() => setShowCursor(v => !v), 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0a23' }}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Líneas superiores tipo consola */}
        <View style={styles.topLines}>
          {[...Array(6)].map((_, i) => (
            <Animated.View key={i} style={[styles.topLine, { top: i * 4, opacity: anim.interpolate({inputRange: [0,1], outputRange: [0.7, 1]}) }]} />
          ))}
        </View>
        {/* Puntos de las esquinas mejor distribuidos */}
        <Animated.View style={[styles.cornerDot, styles.dotTopLeft, { transform: [{ scale: anim.interpolate({inputRange: [0,1], outputRange: [1,1.2]}) }] }]} />
        <Animated.View style={[styles.cornerDot, styles.dotTopRight, { transform: [{ scale: anim.interpolate({inputRange: [0,1], outputRange: [1,1.2]}) }] }]} />
        <Animated.View style={[styles.cornerDot, styles.dotBottomLeft, { transform: [{ scale: anim.interpolate({inputRange: [0,1], outputRange: [1,1.2]}) }] }]} />
        <Animated.View style={[styles.cornerDot, styles.dotBottomRight, { transform: [{ scale: anim.interpolate({inputRange: [0,1], outputRange: [1,1.2]}) }] }]} />
        {/* Más bolitas decorativas, mejor dispersas */}
        <Animated.View style={[styles.cornerDot, styles.dotMidLeft, { opacity: anim }]} />
        <Animated.View style={[styles.cornerDot, styles.dotMidRight, { opacity: anim }]} />
        <Animated.View style={[styles.cornerDotBlue, styles.dotBottomLeftBlue, { opacity: anim }]} />
        <Animated.View style={[styles.cornerDotBlue, styles.dotBottomRightBlue, { opacity: anim }]} />
        <Animated.View style={[styles.cornerDotBlue, styles.dotTopLeftBlue, { opacity: anim }]} />
        <Animated.View style={[styles.cornerDotBlue, styles.dotTopRightBlue, { opacity: anim }]} />

        {/* Pantalla central con scanlines */}
        <View style={styles.screenWrapper}>
          <View style={styles.screenBorder}>
            <View style={styles.screen}>
              {/* Scanlines efecto CRT */}
              <View pointerEvents="none" style={styles.scanlines} />
              {/* ¡Bienvenido! */}
              <Text style={[styles.pixelText, styles.welcome, ...pixelStroke]}>¡Bienvenido!</Text>
              {/* TRICADE con borde pixelado */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                {/* TRI */}
                <Text style={[
                  styles.pixelText,
                  styles.tri,
                  styles.title,
                  ...pixelStroke,
                ]}>TRI</Text>
                {/* CADE */}
                <Text style={[
                  styles.pixelText,
                  styles.cade,
                  styles.title,
                  ...pixelStroke,
                ]}>CADE</Text>
              </View>
              {/* Centro de juegos */}
              <Text style={[styles.pixelText, styles.subtitle, ...pixelStroke]}>Centro de juegos</Text>
            </View>
          </View>
        </View>

        {/* Espaciado extra para bajar los íconos */}
        <View style={{ height: height * 0.04 }} />

        {/* Íconos de juegos */}
        <View style={styles.iconsContainer}>
          <View style={styles.iconsRow}>
            <Image source={require('../assets/tic-tac-toe.png')} style={[styles.icon, styles.iconBlue]} resizeMode="contain" />
            <Image source={require('../assets/cards.png')} style={[styles.icon, styles.iconBlue]} resizeMode="contain" />
            <Image source={require('../assets/snake.png')} style={[styles.icon, styles.iconBlue]} resizeMode="contain" />
          </View>
        </View>

        {/* Espaciado extra para bajar el botón START */}
        <View style={{ height: height * 0.06 }} />

        {/* Botón START */}
        <View style={styles.buttonWrapper}>
          <RetroButton 
            title="¡START!"
            onPress={() => navigation && navigation.navigate ? navigation.navigate('Loading') : null}
            style={styles.startButton}
          />
        </View>

        {/* Espaciado para que el contenido no quede pegado abajo */}
        <View style={{ height: height * 0.04 }} />

        {/* Controles tipo D-pad y fichas */}
        <View style={styles.controlsRow}>
          {/* D-pad simulado */}
          <View style={styles.dpad}>
            <View style={[styles.dpadBtn, styles.dpadUp]} />
            <View style={[styles.dpadBtn, styles.dpadDown]} />
            <View style={[styles.dpadBtn, styles.dpadLeft]} />
            <View style={[styles.dpadBtn, styles.dpadRight]} />
            <View style={styles.dpadCenter} />
          </View>
          {/* Fichas simuladas */}
          <View style={styles.tokens}>
            <View style={[styles.token, { backgroundColor: '#00fff7' }]} />
            <View style={[styles.token, { backgroundColor: '#ff2e7e' }]} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const scanlineColor = 'rgba(255,255,255,0.07)';
const scanlineCount = 18;
const scanlineHeight = 2;

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingBottom: height * 0.04,
    backgroundColor: '#0a0a23',
  },
  topLines: {
    position: 'absolute',
    top: height * 0.02,
    left: '5%',
    width: '90%',
    height: height * 0.03,
    zIndex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  topLine: {
    width: '100%',
    height: Math.min(2, height * 0.002),
    backgroundColor: '#22223a',
    borderRadius: 1,
    marginBottom: Math.min(2, height * 0.002),
    opacity: 0.7,
    position: 'absolute',
  },
  cornerDot: {
    width: Math.min(10, width * 0.025),
    height: Math.min(10, width * 0.025),
    backgroundColor: '#ff2e7e',
    borderRadius: Math.min(5, width * 0.0125),
    position: 'absolute',
    zIndex: 2,
  },
  cornerDotBlue: {
    width: Math.min(12, width * 0.03),
    height: Math.min(12, width * 0.03),
    backgroundColor: '#00fff7',
    borderRadius: Math.min(6, width * 0.015),
    position: 'absolute',
    zIndex: 2,
    opacity: 0.8,
  },
  dotTopLeft: { top: height * 0.03, left: width * 0.03 },
  dotTopRight: { top: height * 0.03, right: width * 0.03 },
  dotBottomLeft: { bottom: height * 0.03, left: width * 0.03 },
  dotBottomRight: { bottom: height * 0.03, right: width * 0.03 },
  dotMidLeft: { top: height * 0.5, left: width * 0.06 },
  dotMidRight: { top: height * 0.5, right: width * 0.06 },
  dotBottomLeftBlue: { bottom: height * 0.05, left: width * 0.15 },
  dotBottomRightBlue: { bottom: height * 0.05, right: width * 0.15 },
  dotTopLeftBlue: { top: height * 0.12, left: width * 0.18 },
  dotTopRightBlue: { top: height * 0.12, right: width * 0.18 },
  screenWrapper: {
    marginTop: height * 0.06,
    borderRadius: Math.min(22, width * 0.06),
    borderWidth: Math.min(10, width * 0.03),
    borderColor: '#00fff7',
    backgroundColor: '#101926',
    alignItems: 'center',
    width: Math.min(width * 0.85, 370),
    maxWidth: 400,
    alignSelf: 'center',
    padding: 0,
    boxSizing: 'border-box',
    position: 'relative',
    overflow: 'hidden',
  },
  scanlines: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    pointerEvents: 'none',
    flexDirection: 'column',
    justifyContent: 'space-between',
    opacity: 0.5,
    // Render scanlines as repeated backgrounds
    backgroundRepeat: 'repeat-y',
    backgroundImage: `repeating-linear-gradient(180deg, transparent, transparent 6px, ${scanlineColor} 7px, transparent 8px)`
  },
  screenBorder: {
    borderWidth: Math.min(2, width * 0.006),
    borderColor: '#ff2e7e',
    borderRadius: Math.min(14, width * 0.04),
    marginVertical: Math.min(10, height * 0.015),
    marginHorizontal: Math.min(8, width * 0.02),
    paddingVertical: Math.min(28, height * 0.04),
    paddingHorizontal: Math.min(8, width * 0.02),
    backgroundColor: '#23233a',
    maxWidth: 400,
    alignItems: 'center',
    boxSizing: 'border-box',
  },
  screen: {
    alignItems: 'center',
    padding: 0,
    margin: 0,
    width: '100%',
    position: 'relative',
  },
  pixelText: {
    fontFamily: pixelFont,
    letterSpacing: 0,
    lineHeight: undefined,
  },
  welcome: {
    color: '#fff',
    fontSize: Math.min(width * 0.06, 24),
    marginTop: Math.min(10, height * 0.015),
    marginBottom: Math.min(12, height * 0.02),
    textAlign: 'center',
    lineHeight: Math.min(width * 0.07, 28),
  },
  title: {
    fontSize: Math.min(width * 0.09, 36),
    marginBottom: Math.min(12, height * 0.02),
    textAlign: 'center',
    lineHeight: Math.min(width * 0.1, 40),
    letterSpacing: 1,
  },
  tri: {
    color: '#00fff7',
  },
  cade: {
    color: '#ff2e7e',
  },
  subtitle: {
    color: '#fff',
    fontSize: Math.min(width * 0.06, 24),
    marginTop: Math.min(8, height * 0.01),
    marginBottom: Math.min(8, height * 0.01),
    textAlign: 'center',
    lineHeight: Math.min(width * 0.07, 28),
  },
  iconsContainer: {
    backgroundColor: 'rgba(0,255,247,0.07)',
    borderRadius: 18,
    paddingVertical: Math.min(16, height * 0.02),
    paddingHorizontal: Math.min(18, width * 0.04),
    marginTop: Math.min(10, height * 0.015),
    marginBottom: Math.min(10, height * 0.015),
    alignItems: 'center',
    width: '80%',
    alignSelf: 'center',
  },
  iconsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    gap: Math.min(18, width * 0.04),
  },
  icon: {
    width: Math.min(width * 0.18, 70),
    height: Math.min(width * 0.18, 70),
    marginHorizontal: Math.min(8, width * 0.02),
    marginVertical: Math.min(6, height * 0.008),
  },
  buttonWrapper: {
    width: '90%',
    alignItems: 'center',
    marginTop: Math.min(10, height * 0.015),
    marginBottom: Math.min(10, height * 0.015),
    alignSelf: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    maxWidth: 260,
    marginTop: height * 0.01,
    marginBottom: height * 0.01,
    alignSelf: 'center',
  },
  dpad: {
    width: Math.min(width * 0.12, 48),
    height: Math.min(width * 0.12, 48),
    position: 'relative',
    marginRight: Math.min(20, width * 0.05),
  },
  dpadBtn: {
    position: 'absolute',
    width: Math.min(width * 0.04, 16),
    height: Math.min(width * 0.04, 16),
    backgroundColor: '#00fff7',
    borderRadius: Math.min(4, width * 0.01),
  },
  dpadUp: { top: 0, left: '35%' },
  dpadDown: { bottom: 0, left: '35%' },
  dpadLeft: { left: 0, top: '35%' },
  dpadRight: { right: 0, top: '35%' },
  dpadCenter: {
    position: 'absolute',
    left: '35%',
    top: '35%',
    width: Math.min(width * 0.04, 16),
    height: Math.min(width * 0.04, 16),
    backgroundColor: '#22223a',
    borderRadius: Math.min(4, width * 0.01),
    borderWidth: Math.min(2, width * 0.005),
    borderColor: '#00fff7',
  },
  tokens: {
    flexDirection: 'row',
    marginLeft: Math.min(20, width * 0.05),
  },
  token: {
    width: Math.min(width * 0.045, 18),
    height: Math.min(width * 0.045, 18),
    borderRadius: Math.min(9, width * 0.0225),
    marginHorizontal: Math.min(4, width * 0.01),
    borderWidth: Math.min(2, width * 0.005),
    borderColor: '#22223a',
  },
  iconBlue: { tintColor: '#00fff7' },
});

export default HomeScreen; 