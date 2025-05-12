import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, Animated, Pressable } from 'react-native';
import RetroButton from '../components/RetroButton';

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

const games = [
  {
    key: 'triki',
    icon: require('../assets/tic-tac-toe.png'),
    iconTint: undefined,
    titleTri: 'TRI',
    titleCade: 'KI',
    desc: '¡Conecta tu estrategia y',
    desc2: 'domina el tablero digital!',
  },
  {
    key: 'snake',
    icon: require('../assets/snake.png'),
    iconTint: '#00fff7',
    titleTri: 'SNA',
    titleCade: 'KE',
    desc: 'Deslízate por el neón infinito.',
    desc2: '¡Más largo, más rápido, más épico!',
  },
  {
    key: 'cards',
    icon: require('../assets/cards.png'),
    iconTint: '#00fff7',
    titleTri: 'DÚ',
    titleCade: 'OS',
    desc: 'Activa tu memoria y encuentra',
    desc2: 'las parejas',
    desc3: 'perdidas del hiperespacio.',
  },
];

export default function GamesScreen() {
  // Animación bounce para el icono
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const [activeTab, setActiveTab] = useState('home');
  const [activeGame, setActiveGame] = useState(0);

  const handleIconPressIn = () => {
    Animated.spring(bounceAnim, {
      toValue: 1.15,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };
  const handleIconPressOut = () => {
    Animated.spring(bounceAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const game = games[activeGame];

  return (
    <View style={styles.root}>
      {/* Logo TRICADE */}
      <View style={styles.logoBox}>
        <Text style={[styles.logoTri, ...pixelStroke]}>TRI</Text>
        <Text style={[styles.logoCade, ...pixelStroke]}>CADE</Text>
      </View>

      {/* Card principal dinámica */}
      <View style={styles.cardWrapper}>
        <View style={styles.cardBorder}>
          <View style={styles.cardContent}>
            <Pressable
              onPressIn={handleIconPressIn}
              onPressOut={handleIconPressOut}
              style={{ alignItems: 'center', justifyContent: 'center' }}
            >
              <Animated.Image
                source={game.icon}
                style={[styles.cardIcon, { transform: [{ scale: bounceAnim }], tintColor: game.iconTint }]}
                resizeMode="contain"
              />
            </Pressable>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              <Text style={[styles.cardTitle, styles.cardTitleTri, ...pixelStroke]}>{game.titleTri}</Text>
              <Text style={[styles.cardTitle, styles.cardTitleCade, ...pixelStroke]}>{game.titleCade}</Text>
            </View>
            <Text style={styles.cardDesc} numberOfLines={2} adjustsFontSizeToFit>{game.desc}</Text>
            <Text style={styles.cardDesc2} numberOfLines={2} adjustsFontSizeToFit>{game.desc2}</Text>
            {game.desc3 && (
              <Text style={styles.cardDesc2} numberOfLines={2} adjustsFontSizeToFit>{game.desc3}</Text>
            )}
            <View style={{ marginTop: 18 }}>
              <RetroButton
                title="¡EXPLORAR!"
                onPress={() => {}}
                style={styles.exploreBtn}
                activeOpacity={0.7}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Paginador de puntos interactivo */}
      <View style={styles.paginator}>
        {games.map((g, i) => (
          <TouchableOpacity
            key={g.key}
            style={[styles.dot, i === activeGame ? styles.dotActive : styles.dotInactive]}
            onPress={() => setActiveGame(i)}
            accessibilityLabel={`Paginador ${g.key}`}
          />
        ))}
      </View>

      {/* Bottom tab */}
      <View style={styles.bottomTab}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'trophy' && styles.tabBtnActive]}
          onPressIn={() => setActiveTab('trophy')}
        >
          <Image source={activeTab === 'trophy' ? require('../assets/trophy-pink.png') : require('../assets/trophy-blue.png')} style={styles.tabIcon} resizeMode="contain" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'home' && styles.tabBtnActive]}
          onPressIn={() => setActiveTab('home')}
        >
          <Image source={activeTab === 'home' ? require('../assets/home-pink.png') : require('../assets/home-blue.png')} style={styles.tabIcon} resizeMode="contain" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'user' && styles.tabBtnActive]}
          onPressIn={() => setActiveTab('user')}
        >
          <Image source={activeTab === 'user' ? require('../assets/user-pink.png') : require('../assets/user-blue.png')} style={styles.tabIcon} resizeMode="contain" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0a0a23',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: height * 0.025,
    paddingBottom: height * 0.025,
  },
  logoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#23233a',
    borderRadius: 10,
    borderWidth: 4,
    borderColor: '#7d2fff',
    paddingHorizontal: 18,
    paddingVertical: 4,
    marginBottom: height * 0.01,
    marginTop: height * 0.01,
  },
  logoTri: {
    color: '#00fff7',
    fontFamily: pixelFont,
    fontSize: Math.min(width * 0.1, 40),
    letterSpacing: 2,
    marginRight: 2,
    marginLeft: 2,
  },
  logoCade: {
    color: '#ff2e7e',
    fontFamily: pixelFont,
    fontSize: Math.min(width * 0.1, 40),
    letterSpacing: 2,
    marginLeft: 2,
    marginRight: 2,
  },
  cardWrapper: {
    width: '94%',
    maxWidth: 440,
    alignSelf: 'center',
    marginTop: height * 0.01,
    marginBottom: height * 0.01,
  },
  cardBorder: {
    borderWidth: 6,
    borderColor: '#00fff7',
    borderRadius: 22,
    padding: 8,
    backgroundColor: '#23233a',
    shadowColor: '#00fff7',
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
  cardContent: {
    borderWidth: 4,
    borderColor: '#ff2e7e',
    borderRadius: 18,
    backgroundColor: '#101926',
    alignItems: 'center',
    paddingVertical: height * 0.045,
    paddingHorizontal: width * 0.06,
    shadowColor: '#ff2e7e',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  cardIcon: {
    width: Math.min(width * 0.22, 80),
    height: Math.min(width * 0.22, 80),
    marginBottom: 10,
    tintColor: '#00fff7',
  },
  cardTitle: {
    fontFamily: pixelFont,
    fontSize: Math.min(width * 0.11, 44),
    letterSpacing: 2,
    marginBottom: 0,
    textAlign: 'center',
  },
  cardTitleTri: {
    color: '#00fff7',
  },
  cardTitleCade: {
    color: '#ff2e7e',
  },
  cardDesc: {
    color: '#fff',
    fontFamily: pixelFont,
    fontSize: Math.min(width * 0.042, 18),
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 2,
    lineHeight: Math.min(width * 0.06, 26),
  },
  cardDesc2: {
    color: '#fff',
    fontFamily: pixelFont,
    fontSize: Math.min(width * 0.038, 16),
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 2,
    lineHeight: Math.min(width * 0.055, 22),
  },
  exploreBtn: {
    shadowColor: '#00fff7',
    shadowOpacity: 0.7,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    minWidth: Math.min(width * 0.7, 260),
    alignSelf: 'center',
  },
  paginator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: height * 0.012,
    gap: 16,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dotInactive: {
    backgroundColor: '#00fff7',
  },
  dotActive: {
    backgroundColor: '#ff2e7e',
    borderColor: '#fff',
    borderWidth: 3,
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  bottomTab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '94%',
    maxWidth: 370,
    backgroundColor: 'transparent',
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#00fff7',
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignSelf: 'center',
    marginTop: height * 0.01,
    shadowColor: '#00fff7',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    minHeight: 48,
  },
  tabBtnActive: {
    borderBottomWidth: 4,
    borderBottomColor: '#ff2e7e',
    shadowColor: '#ff2e7e',
    shadowOpacity: 0.7,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  tabIcon: {
    width: 36,
    height: 36,
  },
}); 