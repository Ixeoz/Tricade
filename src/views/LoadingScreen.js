import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
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
const MAX_FONT_SIZE = 32;
const MIN_FONT_SIZE = 14;
const getFontSize = (factor) => Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, width * factor));
const CENTER_TEXT_FONT_FACTOR = 0.042; // Reducido para que quepa mejor

const LoadingScreen = ({ navigation }) => {
  const [progress, setProgress] = useState(0);

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

  return (
    <View style={styles.root}>
      {/* Líneas superiores tipo consola */}
      <View style={styles.topLines}>
        {[...Array(6)].map((_, i) => (
          <View key={i} style={[styles.topLine, { top: i * 4 }]} />
        ))}
      </View>
      {/* Puntos de las esquinas superiores */}
      <View style={[styles.cornerDot, styles.dotTopLeft]} />
      <View style={[styles.cornerDot, styles.dotTopRight]} />
      {/* Contenido principal centrado verticalmente */}
      <View style={{ flex: 1, justifyContent: 'space-evenly', alignItems: 'center', width: '100%' }}>
        <View style={styles.logoWrapper}>
          <Text style={[styles.logoTri, ...pixelStroke]}>TRI</Text>
          <Text style={[styles.logoCade, ...pixelStroke]}>CADE</Text>
        </View>
        <View style={styles.centerBoxWrapper}>
          <View style={styles.centerBoxBorder}>
            <View style={styles.centerBox}>
              <Text style={[styles.centerText, { color: '#00fff7' }, ...pixelStroke]}>Insertando monedas virtuales...</Text>
              <Text style={[styles.centerText, { color: '#ff2e7e', marginTop: 8 }, ...pixelStroke]}>¡gratis esta vez!</Text>
            </View>
          </View>
        </View>
        <View style={styles.systemBlock}>
          <View style={styles.systemRow}>
            <View style={styles.sideDot} />
            <View style={styles.systemMsgWrapper}>
              <Text style={[styles.systemMsg, ...pixelStroke]}>Iniciando sistema.{"\n"}Bip Bop ...</Text>
            </View>
            <View style={styles.sideDot} />
          </View>
          <View style={styles.progressRow}>
            <View style={styles.sideDot} />
            <View style={styles.progressBarWrapper}>
              <View style={styles.progressBarBorder}>
                <View style={styles.progressBar}>
                  {[...Array(TOTAL_BARS)].map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.progressBarItem,
                        { backgroundColor: i < progress ? '#00fff7' : 'transparent', borderColor: '#00fff7' },
                      ]}
                    />
                  ))}
                </View>
              </View>
            </View>
            <View style={styles.sideDot} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0a0a23',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 18,
    width: '100%',
    height: '100%',
    minHeight: height,
    paddingVertical: 0,
    position: 'relative',
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
    width: width * 0.045,
    height: width * 0.045,
    backgroundColor: '#ff2e7e',
    borderRadius: width * 0.0225,
    position: 'absolute',
    zIndex: 2,
  },
  dotTopLeft: { top: height * 0.03, left: width * 0.04 },
  dotTopRight: { top: height * 0.03, right: width * 0.04 },
  logoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
    marginBottom: 8,
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
    marginBottom: 12,
    alignSelf: 'center',
    width: '90%',
    maxWidth: MAX_CONTAINER_WIDTH,
    flexShrink: 0,
  },
  centerBoxBorder: {
    borderWidth: 5,
    borderColor: '#00fff7',
    borderRadius: 22,
    padding: 6,
    backgroundColor: '#23233a',
    maxWidth: MAX_CONTAINER_WIDTH,
  },
  centerBox: {
    borderWidth: 4,
    borderColor: '#ff2e7e',
    borderRadius: 16,
    backgroundColor: '#101926',
    paddingVertical: height * 0.035,
    paddingHorizontal: width * 0.04,
    alignItems: 'center',
    minWidth: 180,
    maxWidth: MAX_CONTAINER_WIDTH,
    width: '100%',
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
    fontSize: getFontSize(0.042),
    textAlign: 'center',
    lineHeight: getFontSize(0.052),
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
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    marginHorizontal: 2,
    minWidth: 10,
    maxWidth: 24,
  },
});

export default LoadingScreen; 