import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Easing, ScrollView, Image, SafeAreaView } from 'react-native';
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

const TOTAL_BARS = 14;
const ANIMATION_DURATION = 2200; // ms
const MAX_CONTAINER_WIDTH = 340;
const getFontSize = (factor) => Math.max(14, Math.min(32, width * factor));
const CENTER_TEXT_FONT_FACTOR = 0.052;

const scanlineColor = 'rgba(255,255,255,0.07)';

const LoadingScreen = ({ navigation }) => {
  const [progress, setProgress] = useState(0);
  const [showBlink, setShowBlink] = useState(true);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const scanlineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < TOTAL_BARS) return prev + 1;
        clearInterval(interval);
        setTimeout(() => {
          navigation && navigation.navigate && navigation.navigate('Games');
        }, 500);
        return prev;
      });
    }, ANIMATION_DURATION / TOTAL_BARS);
    return () => clearInterval(interval);
  }, []);

  // Animación de brillo en la barra de progreso
  useEffect(() => {
    Animated.loop(
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: false,
        easing: Easing.inOut(Easing.ease),
      })
    ).start();
  }, []);

  // Parpadeo en el texto principal
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, { toValue: 0.3, duration: 400, useNativeDriver: false }),
        Animated.timing(blinkAnim, { toValue: 1, duration: 400, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  // Animación de scanlines en movimiento
  useEffect(() => {
    Animated.loop(
      Animated.timing(scanlineAnim, {
        toValue: 1,
        duration: 2200,
        useNativeDriver: false,
        easing: Easing.linear,
      })
    ).start();
  }, []);

  // Scanlines dinámicas
  const scanlineCount = 32;
  const scanlineHeight = 3;
  const scanlineSpacing = 2;
  const scanlineOffset = scanlineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, scanlineSpacing + scanlineHeight],
  });

  function RenderScanlines() {
    return (
      <Animated.View
        pointerEvents="none"
        style={[styles.scanlinesContainer, { top: scanlineOffset }]}
      >
        {Array.from({ length: scanlineCount }).map((_, i) => (
          <View
            key={i}
            style={{
              width: '100%',
              height: scanlineHeight,
              backgroundColor: 'rgba(0,255,247,0.18)',
              marginBottom: scanlineSpacing,
            }}
          />
        ))}
      </Animated.View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Líneas superiores tipo consola */}
          <View style={styles.topLines}>
            {[...Array(6)].map((_, i) => (
              <View key={i} style={[styles.topLine, { top: i * 4 }]} />
            ))}
          </View>
          {/* Puntos decorativos mejor distribuidos */}
          <View style={[styles.cornerDot, styles.dotTopLeft]} />
          <View style={[styles.cornerDot, styles.dotTopRight]} />
          <View style={[styles.cornerDot, styles.dotBottomLeft]} />
          <View style={[styles.cornerDot, styles.dotBottomRight]} />
          <View style={[styles.cornerDotBlue, styles.dotMidLeft]} />
          <View style={[styles.cornerDotBlue, styles.dotMidRight]} />
          <View style={[styles.cornerDotBlue, styles.dotBottomLeftBlue]} />
          <View style={[styles.cornerDotBlue, styles.dotBottomRightBlue]} />

          {/* Logo principal */}
          <View style={styles.logoWrapper}>
            <Text style={[styles.logoTri, ...pixelStroke]}>TRI</Text>
            <Text style={[styles.logoCade, ...pixelStroke]}>CADE</Text>
          </View>

          {/* Espaciado reducido */}
          <View style={{ height: height * 0.02 }} />

          {/* Recuadro central con scanlines y moneda */}
          <View style={styles.centerBoxWrapper}>
            <View style={styles.centerBoxBorder}>
              <View style={styles.centerBox}>
                <RenderScanlines />
                <Text
                  style={[
                    styles.centerText,
                    { color: '#00fff7' },
                    ...pixelStroke,
                  ]}
                  numberOfLines={2}
                  adjustsFontSizeToFit
                >
                  Insertando monedas...
                </Text>
                <Text style={[styles.centerText, { color: '#ff2e7e', marginTop: 2, lineHeight: getFontSize(CENTER_TEXT_FONT_FACTOR * 1.1) }, ...pixelStroke]}>¡gratis esta vez!</Text>
              </View>
            </View>
          </View>

          {/* Espaciado reducido */}
          <View style={{ height: height * 0.03 }} />

          {/* Bloque de sistema y barra de progreso */}
          <View style={styles.systemBlock}>
            <View style={styles.systemRow}>
              <View style={styles.sideDot} />
              <View style={styles.systemMsgWrapper}>
                <Text style={[styles.systemMsg, styles.systemMsgTwoLines, ...pixelStroke]}>
                  Iniciando sistema{"\n"}Bip Bop...
                </Text>
              </View>
              <View style={styles.sideDot} />
            </View>
            <View style={{ height: height * 0.025 }} />
            <View style={styles.progressRow}>
              <View style={styles.sideDot} />
              <View style={styles.progressBarWrapper}>
                <View style={styles.progressBarBorder}>
                  <View style={styles.progressBar}>
                    {[...Array(TOTAL_BARS)].map((_, i) => (
                      <Animated.View
                        key={i}
                        style={[
                          styles.progressBarItem,
                          {
                            backgroundColor: i < progress ? '#00fff7' : 'transparent',
                            borderColor: '#00fff7',
                            shadowColor: '#00fff7',
                            shadowOpacity: progressAnim.interpolate({inputRange: [0,1], outputRange: [0.2, 0.7]}),
                            shadowRadius: progressAnim.interpolate({inputRange: [0,1], outputRange: [2, 6]}),
                          },
                        ]}
                      />
                    ))}
                  </View>
                </View>
              </View>
              <View style={styles.sideDot} />
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a23',
    alignItems: 'center',
    justifyContent: 'center',
    padding: scaleDimension(24),
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: height * 0.04,
    backgroundColor: '#0a0a23',
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  topLines: {
    position: 'absolute',
    top: height * 0.015,
    left: '5%',
    width: '90%',
    height: 32,
    zIndex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  topLine: {
    width: '100%',
    height: 3,
    backgroundColor: '#22223a',
    borderRadius: 2,
    marginBottom: 3,
    opacity: 0.7,
    position: 'absolute',
  },
  cornerDot: {
    width: width * 0.035,
    height: width * 0.035,
    backgroundColor: '#ff2e7e',
    borderRadius: width * 0.0175,
    position: 'absolute',
    zIndex: 2,
  },
  cornerDotBlue: {
    width: width * 0.045,
    height: width * 0.045,
    backgroundColor: '#00fff7',
    borderRadius: width * 0.0225,
    position: 'absolute',
    zIndex: 2,
    opacity: 0.8,
  },
  dotTopLeft: { top: height * 0.03, left: width * 0.05 },
  dotTopRight: { top: height * 0.03, right: width * 0.05 },
  dotBottomLeft: { bottom: height * 0.03, left: width * 0.05 },
  dotBottomRight: { bottom: height * 0.03, right: width * 0.05 },
  dotMidLeft: { top: height * 0.22, left: width * 0.08 },
  dotMidRight: { top: height * 0.22, right: width * 0.08 },
  dotBottomLeftBlue: { bottom: height * 0.12, left: width * 0.18 },
  dotBottomRightBlue: { bottom: height * 0.12, right: width * 0.18 },
  logoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: height * 0.04,
    marginBottom: 0,
    alignSelf: 'center',
    backgroundColor: '#23233a',
    borderRadius: 12,
    borderWidth: 5,
    borderColor: '#00fff7',
    paddingHorizontal: 18,
    paddingVertical: height * 0.01,
    maxWidth: MAX_CONTAINER_WIDTH,
    width: '90%',
    flexShrink: 0,
  },
  logoTri: {
    color: '#00fff7',
    fontFamily: pixelFont,
    fontSize: getFontSize(0.09),
    letterSpacing: 2,
    marginRight: 4,
    marginLeft: 4,
    maxWidth: '50%',
  },
  logoCade: {
    color: '#ff2e7e',
    fontFamily: pixelFont,
    fontSize: getFontSize(0.09),
    letterSpacing: 2,
    marginLeft: 4,
    marginRight: 4,
    maxWidth: '50%',
  },
  centerBoxWrapper: {
    marginTop: 0,
    marginBottom: 0,
    alignSelf: 'center',
    width: '90%',
    maxWidth: MAX_CONTAINER_WIDTH,
    flexShrink: 0,
  },
  centerBoxBorder: {
    borderWidth: 5,
    borderColor: '#00fff7',
    borderRadius: Math.max(18, width * 0.045),
    padding: 6,
    backgroundColor: '#23233a',
    maxWidth: MAX_CONTAINER_WIDTH,
  },
  centerBox: {
    borderWidth: 4,
    borderColor: '#ff2e7e',
    borderRadius: Math.max(18, width * 0.045),
    backgroundColor: '#101926',
    paddingVertical: height * 0.025,
    paddingHorizontal: width * 0.04,
    alignItems: 'center',
    minWidth: 180,
    maxWidth: MAX_CONTAINER_WIDTH,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  scanlinesContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    pointerEvents: 'none',
    flexDirection: 'column',
    opacity: 0.5,
  },
  centerText: {
    fontFamily: pixelFont,
    fontSize: getFontSize(CENTER_TEXT_FONT_FACTOR),
    textAlign: 'center',
    lineHeight: getFontSize(CENTER_TEXT_FONT_FACTOR * 1.25),
    marginBottom: 0,
    maxWidth: '100%',
  },
  systemBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
    marginBottom: 0,
    width: '100%',
    maxWidth: MAX_CONTAINER_WIDTH + 40,
    alignSelf: 'center',
  },
  systemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 0,
    marginBottom: 8,
    maxWidth: MAX_CONTAINER_WIDTH + 40,
    alignSelf: 'center',
  },
  systemMsgWrapper: {
    alignItems: 'center',
    flex: 1,
    maxWidth: MAX_CONTAINER_WIDTH,
  },
  systemMsg: {
    color: '#fff',
    fontFamily: pixelFont,
    fontSize: getFontSize(0.052),
    textAlign: 'center',
    lineHeight: getFontSize(0.062),
    maxWidth: '100%',
    marginBottom: 0,
  },
  sideDot: {
    width: 16,
    height: 16,
    backgroundColor: '#ff2e7e',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 0,
    marginBottom: 0,
    flexShrink: 0,
    maxWidth: MAX_CONTAINER_WIDTH + 40,
    alignSelf: 'center',
  },
  progressBarWrapper: {
    marginTop: 0,
    alignSelf: 'center',
    width: '100%',
    maxWidth: MAX_CONTAINER_WIDTH,
  },
  progressBarBorder: {
    borderWidth: 4,
    borderColor: '#7d2fff',
    borderRadius: 12,
    padding: 4,
    backgroundColor: '#23233a',
    width: '100%',
    maxWidth: MAX_CONTAINER_WIDTH,
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 4,
    width: '100%',
    maxWidth: MAX_CONTAINER_WIDTH - 8,
  },
  progressBarItem: {
    flex: 1,
    height: 24,
    borderRadius: 5,
    borderWidth: 2,
    marginHorizontal: 2,
    minWidth: 10,
    maxWidth: 24,
  },
  systemMsgTwoLines: {
    lineHeight: getFontSize(0.058),
    marginBottom: height * 0.008,
    fontSize: getFontSize(0.052),
    textAlign: 'center',
  },
  loadingText: {
    color: '#00fff7',
    fontFamily: pixelFont,
    fontSize: scaleFont(24),
    marginBottom: scaleDimension(24),
    textAlign: 'center',
    textShadowColor: '#00fff7',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: scaleDimension(12),
  },
  loadingBar: {
    width: wp(80),
    height: scaleDimension(20),
    backgroundColor: '#23233a',
    borderRadius: scaleDimension(10),
    overflow: 'hidden',
    borderWidth: scaleDimension(3),
    borderColor: '#00fff7',
  },
  loadingFill: {
    height: '100%',
    backgroundColor: '#00fff7',
    borderRadius: scaleDimension(10),
  },
  pixelDot: {
    width: scaleDimension(12),
    height: scaleDimension(12),
    backgroundColor: '#ff2e7e',
    borderRadius: scaleDimension(6),
    position: 'absolute',
  },
  cornerDotTL: {
    top: scaleDimension(18),
    left: scaleDimension(18),
  },
  cornerDotTR: {
    top: scaleDimension(18),
    right: scaleDimension(18),
  },
  cornerDotBL: {
    bottom: scaleDimension(18),
    left: scaleDimension(18),
  },
  cornerDotBR: {
    bottom: scaleDimension(18),
    right: scaleDimension(18),
  },
});

export default LoadingScreen; 