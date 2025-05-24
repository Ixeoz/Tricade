import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Animated, Easing, SafeAreaView } from 'react-native';
import RetroButton from '../components/RetroButton';
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a23' }}>
      <View style={{ flex: 1 }}>
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
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: Math.max(12, width * 0.03) }}>
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
              onPress={() => navigation && navigation.navigate ? navigation.navigate('Games') : null}
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
    </SafeAreaView>
  );
};

const scanlineColor = 'rgba(255,255,255,0.07)';
const scanlineCount = 18;
const scanlineHeight = 2;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0a0a23',
    width: '100%',
    alignSelf: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingBottom: hp(4),
  },
  topLines: {
    position: 'absolute',
    top: hp(2),
    left: '5%',
    width: '90%',
    height: hp(3),
    zIndex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  topLine: {
    width: '100%',
    height: Math.max(2, hp(0.2)),
    backgroundColor: '#22223a',
    borderRadius: 1,
    marginBottom: Math.max(2, hp(0.2)),
    opacity: 0.7,
    position: 'absolute',
  },
  cornerDot: {
    width: Math.max(10, wp(2.5)),
    height: Math.max(10, wp(2.5)),
    backgroundColor: '#ff2e7e',
    borderRadius: Math.max(5, wp(1.25)),
    position: 'absolute',
    zIndex: 2,
  },
  cornerDotBlue: {
    width: Math.max(12, wp(3)),
    height: Math.max(12, wp(3)),
    backgroundColor: '#00fff7',
    borderRadius: Math.max(6, wp(1.5)),
    position: 'absolute',
    zIndex: 2,
    opacity: 0.8,
  },
  dotTopLeft: { top: hp(3), left: wp(3) },
  dotTopRight: { top: hp(3), right: wp(3) },
  dotBottomLeft: { bottom: hp(3), left: wp(3) },
  dotBottomRight: { bottom: hp(3), right: wp(3) },
  dotMidLeft: { top: hp(5), left: wp(6) },
  dotMidRight: { top: hp(5), right: wp(6) },
  dotBottomLeftBlue: { bottom: hp(5), left: wp(15) },
  dotBottomRightBlue: { bottom: hp(5), right: wp(15) },
  dotTopLeftBlue: { top: hp(12), left: wp(18) },
  dotTopRightBlue: { top: hp(12), right: wp(18) },
  screenWrapper: {
    width: wp(90),
    aspectRatio: 1.2,
    marginTop: hp(5),
    alignSelf: 'center',
  },
  scanlines: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    pointerEvents: 'none',
    flexDirection: 'column',
    justifyContent: 'space-between',
    opacity: 0.5,
  },
  screenBorder: {
    flex: 1,
    borderWidth: scaleDimension(5),
    borderColor: '#00fff7',
    borderRadius: getResponsiveDimension(22, 12),
    padding: SPACING.md,
    backgroundColor: '#23233a',
  },
  screen: {
    flex: 1,
    borderWidth: scaleDimension(4),
    borderColor: '#ff2e7e',
    borderRadius: getResponsiveDimension(16, 8),
    backgroundColor: '#101926',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pixelText: {
    fontFamily: pixelFont,
    letterSpacing: 0,
    lineHeight: undefined,
  },
  welcome: {
    fontSize: scaleFont(24),
    color: '#fff',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: scaleFont(38),
    letterSpacing: scaleDimension(2),
  },
  tri: {
    color: '#00fff7',
  },
  cade: {
    color: '#ff2e7e',
  },
  subtitle: {
    fontSize: scaleFont(16),
    color: '#fff',
    marginTop: SPACING.md,
  },
  iconsContainer: {
    width: wp(80),
    alignItems: 'center',
    marginTop: hp(4),
  },
  iconsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  icon: {
    width: getResponsiveDimension(60, 40),
    height: getResponsiveDimension(60, 40),
  },
  buttonWrapper: {
    width: wp(80),
    alignItems: 'center',
    marginTop: hp(4),
  },
  startButton: {
    minWidth: wp(60),
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    maxWidth: 260,
    marginTop: hp(1),
    marginBottom: hp(1),
    alignSelf: 'center',
  },
  dpad: {
    width: Math.max(wp(12), 32),
    height: Math.max(wp(12), 32),
    position: 'relative',
    marginRight: Math.max(20, wp(5)),
  },
  dpadBtn: {
    position: 'absolute',
    width: Math.max(wp(4), 10),
    height: Math.max(wp(4), 10),
    backgroundColor: '#00fff7',
    borderRadius: Math.max(4, wp(1)),
  },
  dpadUp: { top: 0, left: '35%' },
  dpadDown: { bottom: 0, left: '35%' },
  dpadLeft: { left: 0, top: '35%' },
  dpadRight: { right: 0, top: '35%' },
  dpadCenter: {
    position: 'absolute',
    left: '35%',
    top: '35%',
    width: Math.max(wp(4), 10),
    height: Math.max(wp(4), 10),
    backgroundColor: '#22223a',
    borderRadius: Math.max(4, wp(1)),
    borderWidth: Math.max(2, wp(0.5)),
    borderColor: '#00fff7',
  },
  tokens: {
    flexDirection: 'row',
    marginLeft: Math.max(20, wp(5)),
  },
  token: {
    width: Math.max(wp(4.5), 12),
    height: Math.max(wp(4.5), 12),
    borderRadius: Math.max(9, wp(2.25)),
    marginHorizontal: Math.max(4, wp(1)),
    borderWidth: Math.max(2, wp(0.5)),
    borderColor: '#22223a',
  },
  iconBlue: {
    tintColor: '#00fff7',
  },
});

export default HomeScreen; 