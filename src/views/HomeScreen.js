import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
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
  return (
    <View style={styles.root}>
      {/* Líneas superiores tipo consola */}
      <View style={styles.topLines}>
        {[...Array(6)].map((_, i) => (
          <View key={i} style={[styles.topLine, { top: i * 4 }]} />
        ))}
      </View>
      {/* Puntos de las esquinas */}
      <View style={[styles.cornerDot, styles.dotTopLeft]} />
      <View style={[styles.cornerDot, styles.dotTopRight]} />
      <View style={[styles.cornerDot, styles.dotBottomLeft]} />
      <View style={[styles.cornerDot, styles.dotBottomRight]} />
      {/* Puntos decorativos adicionales */}
      <View style={[styles.cornerDot, styles.dotBottomLeftSmall]} />
      <View style={[styles.cornerDot, styles.dotBottomRightSmall]} />
      <View style={[styles.cornerDotBlue, styles.dotBottomLeftBlue]} />
      <View style={[styles.cornerDotBlue, styles.dotBottomRightBlue]} />

      {/* Pantalla central */}
      <View style={styles.screenWrapper}>
        <View style={styles.screenBorder}>
          <View style={styles.screen}>
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

      {/* Íconos de juegos */}
      <View style={styles.iconsRow}>
        <Image source={require('../assets/tic-tac-toe.png')} style={styles.icon} resizeMode="contain" />
        <Image source={require('../assets/cards.png')} style={styles.icon} resizeMode="contain" />
        <Image source={require('../assets/snake.png')} style={styles.icon} resizeMode="contain" />
      </View>

      {/* Botón START */}
      <View style={styles.buttonWrapper}>
        <RetroButton title="¡START!" onPress={() => navigation && navigation.navigate ? navigation.navigate('Loading') : null} />
      </View>

      {/* Controles tipo D-pad y fichas (simulados con View) */}
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
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0a0a23',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: '100%',
    minHeight: height,
    paddingVertical: 0,
    position: 'relative',
  },
  topLines: {
    position: 'absolute',
    top: height * 0.03,
    left: '10%',
    width: '80%',
    height: 24,
    zIndex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  topLine: {
    width: '100%',
    height: 2,
    backgroundColor: '#22223a',
    borderRadius: 1,
    marginBottom: 2,
    opacity: 0.7,
    position: 'absolute',
  },
  cornerDot: {
    width: 14,
    height: 14,
    backgroundColor: '#ff2e7e',
    borderRadius: 7,
    position: 'absolute',
    zIndex: 2,
  },
  cornerDotBlue: {
    width: 18,
    height: 18,
    backgroundColor: '#00fff7',
    borderRadius: 9,
    position: 'absolute',
    zIndex: 2,
    opacity: 0.8,
  },
  dotTopLeft: { top: height * 0.05, left: width * 0.05 },
  dotTopRight: { top: height * 0.05, right: width * 0.05 },
  dotBottomLeft: { bottom: height * 0.05, left: width * 0.05 },
  dotBottomRight: { bottom: height * 0.05, right: width * 0.05 },
  dotBottomLeftSmall: { bottom: height * 0.03, left: width * 0.13, width: 12, height: 12, borderRadius: 6 },
  dotBottomRightSmall: { bottom: height * 0.03, right: width * 0.13, width: 12, height: 12, borderRadius: 6 },
  dotBottomLeftBlue: { bottom: height * 0.07, left: width * 0.19 },
  dotBottomRightBlue: { bottom: height * 0.07, right: width * 0.19 },
  screenWrapper: {
    marginTop: height * 0.14,
    borderRadius: 22,
    borderWidth: 10,
    borderColor: '#00fff7',
    backgroundColor: '#101926',
    alignItems: 'center',
    width: width > 400 ? 370 : '96%',
    maxWidth: 400,
    alignSelf: 'center',
    padding: 0,
    boxSizing: 'border-box',
  },
  screenBorder: {
    borderWidth: 2,
    borderColor: '#ff2e7e',
    borderRadius: 14,
    marginVertical: 10,
    marginHorizontal: 8,
    paddingVertical: 28,
    paddingHorizontal: 8,
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
  },
  pixelText: {
    fontFamily: pixelFont,
    letterSpacing: 0,
    lineHeight: undefined,
  },
  welcome: {
    color: '#fff',
    fontSize: width > 400 ? 26 : 18,
    marginTop: 10,
    marginBottom: 22,
    textAlign: 'center',
    lineHeight: width > 400 ? 32 : 22,
  },
  title: {
    fontSize: width > 400 ? 42 : 26,
    marginBottom: 22,
    textAlign: 'center',
    lineHeight: width > 400 ? 48 : 30,
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
    fontSize: width > 400 ? 26 : 18,
    marginTop: 22,
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: width > 400 ? 32 : 22,
  },
  iconsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: height * 0.06,
    marginTop: height * 0.06,
    width: '80%',
  },
  icon: {
    width: width > 400 ? 60 : 36,
    height: width > 400 ? 60 : 36,
    marginHorizontal: 12,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '70%',
    maxWidth: 260,
    marginTop: height * 0.01,
    marginBottom: height * 0.03,
    alignSelf: 'center',
  },
  dpad: {
    width: width > 400 ? 56 : 32,
    height: width > 400 ? 56 : 32,
    position: 'relative',
    marginRight: 28,
  },
  dpadBtn: {
    position: 'absolute',
    width: width > 400 ? 18 : 10,
    height: width > 400 ? 18 : 10,
    backgroundColor: '#00fff7',
    borderRadius: 4,
  },
  dpadUp: { top: 0, left: '35%' },
  dpadDown: { bottom: 0, left: '35%' },
  dpadLeft: { left: 0, top: '35%' },
  dpadRight: { right: 0, top: '35%' },
  dpadCenter: {
    position: 'absolute',
    left: '35%',
    top: '35%',
    width: width > 400 ? 18 : 10,
    height: width > 400 ? 18 : 10,
    backgroundColor: '#22223a',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#00fff7',
  },
  tokens: {
    flexDirection: 'row',
    marginLeft: 28,
  },
  token: {
    width: width > 400 ? 22 : 12,
    height: width > 400 ? 22 : 12,
    borderRadius: 11,
    marginHorizontal: 6,
    borderWidth: 2,
    borderColor: '#22223a',
  },
  buttonWrapper: {
    width: '80%',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: height * 0.01,
    alignSelf: 'center',
  },
});

export default HomeScreen; 