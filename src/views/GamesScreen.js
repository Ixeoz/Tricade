import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, Animated, Pressable, ScrollView, SafeAreaView } from 'react-native';
import RetroButton from '../components/RetroButton';
import trophyGray from '../assets/trophy-gray.png';
import ProfileScreen from './ProfileScreen';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';

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
    desc: 'Activa tu memoria y',
    desc2: 'encuentra las parejas',
    desc3: 'perdidas del hiperespacio.',
  },
];

const loadingMessages = [
  {
    main: 'Cargando...\nno soples el cartucho,',
    sub: 'no funciona aquí.'
  },
  {
    main: 'Cargando secretos que\nnadie encontrará...',
    sub: 'probablemente.'
  },
  {
    main: 'Revisando si\npulsaste START',
    sub: 'correctamente.'
  }
];

export default function GamesScreen({ navigation }) {
  // Animación bounce para el icono
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const [activeTab, setActiveTab] = useState('home');
  const [activeGame, setActiveGame] = useState(0);
  const scrollRef = useRef();
  const [cardWidth, setCardWidth] = useState(Dimensions.get('window').width);
  const [showLoading, setShowLoading] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [lastLoadingIndex, setLastLoadingIndex] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [triki100Unlocked, setTriki100Unlocked] = useState(false);
  const [trikiTrophies, setTrikiTrophies] = useState([]);
  const [trikiVictorias, setTrikiVictorias] = useState(0);
  const [trophiesUnlocked, setTrophiesUnlocked] = useState(0);
  const [trophiesTotal, setTrophiesTotal] = useState(0);

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

  // Sincroniza el paginador con el slide
  const onScroll = (e) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / cardWidth);
    if (page !== activeGame) setActiveGame(page);
  };
  // Cuando se toca un punto, desliza el ScrollView
  const goToGame = (i) => {
    setActiveGame(i);
    scrollRef.current?.scrollTo({ x: i * width, animated: true });
  };

  // Actualiza el ancho de la tarjeta si cambia el tamaño de la ventana (web)
  useEffect(() => {
    const updateWidth = () => setCardWidth(Dimensions.get('window').width);
    Dimensions.addEventListener('change', updateWidth);
    return () => Dimensions.removeEventListener('change', updateWidth);
  }, []);

  // Animación de loading
  useEffect(() => {
    let interval;
    if (showLoading) {
      setLoadingProgress(0);
      interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 12) {
            clearInterval(interval);
            setTimeout(() => {
              setShowLoading(false);
              if (selectedGame === 'triki') {
                navigation.navigate('TrikiDetailScreen');
              }
              if (selectedGame === 'snake') {
                navigation.navigate('SnakeDetailScreen');
              }
              setSelectedGame(null);
            }, 600);
            return 12;
          }
          return prev + 1;
        });
      }, 120);
    }
    return () => clearInterval(interval);
  }, [showLoading]);

  useEffect(() => {
    async function fetchTrophies() {
      try {
        if (!auth.currentUser) {
          console.log('No hay usuario autenticado');
          return;
        }
        
        // Leer victorias
        let victorias = 0;
        const statsRef = doc(db, 'users', auth.currentUser.uid, 'trikiStats', 'stats');
        try {
          const statsDoc = await getDoc(statsRef);
          victorias = statsDoc.exists() ? statsDoc.data().victorias || 0 : 0;
          setTrikiVictorias(victorias);
        } catch (error) {
          console.error('Error al leer stats:', error);
        }

        // Trofeos progresivos cada 50
        const maxTrophy = Math.max(50, Math.ceil(victorias / 50) * 50, 200);
        const trophySteps = [];
        for (let i = 50; i <= maxTrophy; i += 50) {
          trophySteps.push(i);
        }
        setTrophiesTotal(trophySteps.length + 3);

        // Leer trofeos desbloqueados
        try {
          const trophiesCol = collection(db, 'users', auth.currentUser.uid, 'trophies');
          const trophiesSnap = await getDocs(trophiesCol);
          const unlocked = {};
          trophiesSnap.forEach(doc => { unlocked[doc.id] = doc.data(); });
          
          setTrikiTrophies(trophySteps.map(step => ({
            id: `triki${step}`,
            step,
            unlocked: !!unlocked[`triki${step}`],
          })));

          // Calcular cuántos trofeos están desbloqueados
          let unlockedCount = 0;
          trophySteps.forEach(step => { if (unlocked[`triki${step}`]) unlockedCount++; });
          if (unlocked['primeraSangre']) unlockedCount++;
          if (unlocked['memorion']) unlockedCount++;
          if (unlocked['python']) unlockedCount++;
          setTrophiesUnlocked(unlockedCount);
        } catch (error) {
          console.error('Error al leer trofeos:', error);
        }
      } catch (error) {
        console.error('Error general en fetchTrophies:', error);
      }
    }
    fetchTrophies();
  }, []);

  // Mostrar solo el trofeo progresivo más próximo y los ya desbloqueados
  const nextTrikiTrophyIndex = trikiTrophies.findIndex(t => !t.unlocked);
  const visibleTrikiTrophies = trikiTrophies.filter((t, i) => t.unlocked || i === nextTrikiTrophyIndex);

  if (showLoading) {
    const msg = loadingMessages[loadingIndex];
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a23' }}>
        <View style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center', paddingVertical: height * 0.06 }}>
          {/* Puntitos decorativos arriba */}
          <View style={{ position: 'absolute', left: width * 0.08, top: height * 0.04, width: 12, height: 12, backgroundColor: '#ff2e7e', borderRadius: 6 }} />
          <View style={{ position: 'absolute', right: width * 0.08, top: height * 0.04, width: 12, height: 12, backgroundColor: '#ff2e7e', borderRadius: 6 }} />
          {/* Logo TRICADE en caja morada */}
          <View style={{ alignSelf: 'center', marginBottom: height * 0.045, backgroundColor: '#3a2172', borderRadius: Math.max(18, width * 0.045), borderWidth: 4, borderColor: '#7d2fff', paddingVertical: height * 0.012, paddingHorizontal: width * 0.13, shadowColor: '#7d2fff', shadowOpacity: 0.5, shadowRadius: 12, shadowOffset: { width: 0, height: 0 } }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: pixelFont, fontSize: Math.min(width * 0.11, 38), color: '#00fff7', textAlign: 'center', textShadowColor: '#000', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 0 }}>TRI</Text>
              <Text style={{ fontFamily: pixelFont, fontSize: Math.min(width * 0.11, 38), color: '#ff2e7e', textAlign: 'center', textShadowColor: '#000', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 0 }}>CADE</Text>
            </View>
          </View>
          {/* Caja central con doble borde */}
          <View style={{ borderWidth: 5, borderColor: '#00fff7', borderRadius: Math.max(18, width * 0.045), backgroundColor: '#101926', padding: 0, marginBottom: height * 0.06, alignSelf: 'center', shadowColor: '#00fff7', shadowOpacity: 0.18, shadowRadius: 18, shadowOffset: { width: 0, height: 0 } }}>
            <View style={{ borderWidth: 4, borderColor: '#ff2e7e', borderRadius: Math.max(14, width * 0.03), backgroundColor: '#18182e', paddingVertical: height * 0.045, paddingHorizontal: width * 0.08, minWidth: width * 0.7, minHeight: height * 0.16, alignItems: 'center', justifyContent: 'center' }}>
              {/* Texto principal con salto de línea y colores */}
              <Text style={{ fontFamily: pixelFont, color: '#00fff7', fontSize: Math.min(width * 0.052, 20), textAlign: 'center', textShadowColor: '#000', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 0, lineHeight: 28 }}>
                {msg.main.split('\n').map((line, i) => (
                  <Text key={i} style={{ color: '#00fff7' }}>{line}{'\n'}</Text>
                ))}
                <Text style={{ color: '#ff2e7e' }}>{msg.sub}</Text>
              </Text>
            </View>
          </View>
          {/* Texto de carga y puntitos decorativos a los lados */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: height * 0.025 }}>
            <View style={{ width: 12, height: 12, backgroundColor: '#ff2e7e', borderRadius: 6, marginRight: 12 }} />
            <Text style={{ fontFamily: pixelFont, color: '#fff', fontSize: Math.min(width * 0.045, 18), textAlign: 'center', textShadowColor: '#000', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 0 }}>Cargando juego Bip Bop ...</Text>
            <View style={{ width: 12, height: 12, backgroundColor: '#ff2e7e', borderRadius: 6, marginLeft: 12 }} />
          </View>
          {/* Barra de progreso pequeña con borde morado */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 0 }}>
            <View style={{ flexDirection: 'row', backgroundColor: 'transparent', borderWidth: 3, borderColor: '#7d2fff', borderRadius: 6, padding: 2 }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <View key={i} style={{ width: 18, height: 13, marginHorizontal: 2, borderRadius: 2, backgroundColor: i < Math.round((loadingProgress/12)*8) ? '#00fff7' : 'transparent' }} />
              ))}
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a23' }}>
      <View style={styles.root}>
        {/* Logo TRICADE */}
        <View style={styles.logoBox}>
          <Text style={[styles.logoTri, ...pixelStroke]}>TRI</Text>
          <Text style={[styles.logoCade, ...pixelStroke]}>CADE</Text>
        </View>

        {/* Renderiza trofeos o juegos según el tab activo */}
        <View style={{ flex: 1, width: '100%', paddingBottom: height * 0.11 }}>
          {activeTab === 'trophy' && (
            <View style={styles.trophiesSection}>
              <Text style={[styles.trophiesTitle, ...pixelStroke]}>Trofeos</Text>
              <View style={styles.trophiesProgressBox}>
                <Text style={styles.trophiesProgressText}>¡Haz desbloqueado {trophiesUnlocked} de {trophiesTotal} trofeos!</Text>
                <View style={styles.trophiesProgressBarBg}>
                  <View style={[styles.trophiesProgressBarFill, { width: `${Math.round((trophiesUnlocked/trophiesTotal)*100)}%` }]} />
                </View>
              </View>
              {/* Lista de trofeos progresivos de Triki */}
              <View style={styles.trophyList}>
                {visibleTrikiTrophies.map(trophy => (
                  <View key={trophy.id} style={[styles.trophyCard, !trophy.unlocked && styles.trophyCardLocked]}>
                    <Image source={trophy.unlocked ? require('../assets/trophy-pink.png') : trophyGray} style={trophy.unlocked ? styles.trophyIcon : styles.trophyIconGray} resizeMode="contain" />
                    <View style={styles.trophyTextBox}>
                      <Text style={[trophy.unlocked ? styles.trophyTitle : styles.trophyTitleGray, ...pixelStroke]}>Triki: {trophy.step} victorias</Text>
                      <Text style={trophy.unlocked ? styles.trophyDesc : styles.trophyDescGray}>Gana {trophy.step} partidas de Triki</Text>
                    </View>
                  </View>
                ))}
                {/* Trofeo desbloqueado */}
                <View style={styles.trophyCard}>
                  <Image source={require('../assets/trophy-pink.png')} style={styles.trophyIcon} resizeMode="contain" />
                  <View style={styles.trophyTextBox}>
                    <Text style={[styles.trophyTitle, ...pixelStroke]}>Primera sangre</Text>
                    <Text style={styles.trophyDesc}>Gana tu primera partida de Triki</Text>
                  </View>
                </View>
                {/* Trofeo desbloqueado */}
                <View style={styles.trophyCard}>
                  <Image source={require('../assets/trophy-pink.png')} style={styles.trophyIcon} resizeMode="contain" />
                  <View style={styles.trophyTextBox}>
                    <Text style={[styles.trophyTitle, ...pixelStroke]}>Memorion</Text>
                    <Text style={styles.trophyDesc}>Gana una partida de DÚOS en difícil</Text>
                  </View>
                </View>
                {/* Trofeo bloqueado */}
                <View style={[styles.trophyCard, styles.trophyCardLocked]}>
                  <Image source={trophyGray} style={styles.trophyIconGray} resizeMode="contain" />
                  <View style={styles.trophyTextBox}>
                    <Text style={[styles.trophyTitleGray, ...pixelStroke]}>¿Python?</Text>
                    <Text style={styles.trophyDescGray}>Come 30 pixeles en Snake</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
          {activeTab === 'home' && (
            <>
              {/* Card principal deslizable */}
              <View style={styles.cardsScrollWrapper}>
                <ScrollView
                  ref={scrollRef}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onScroll={onScroll}
                  scrollEventThrottle={16}
                  style={styles.cardsScroll}
                  contentContainerStyle={{ alignItems: 'center' }}
                >
                  {games.map((game, idx) => (
                    <View style={[styles.cardScrollItem, { width: cardWidth }]} key={game.key}>
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
                          <View style={{ width: '100%', alignItems: 'center' }}>
                            <Text style={styles.cardDesc} numberOfLines={2} adjustsFontSizeToFit>{game.desc}</Text>
                            <Text style={styles.cardDesc2} numberOfLines={2} adjustsFontSizeToFit>{game.desc2}</Text>
                            {game.desc3 && (
                              <Text style={styles.cardDesc2} numberOfLines={2} adjustsFontSizeToFit>{game.desc3}</Text>
                            )}
                          </View>
                          <View style={{ width: '100%', alignItems: 'center', marginBottom: height * 0.01 }}>
                            <RetroButton
                              title="¡EXPLORAR!"
                              onPress={() => {
                                let next;
                                do {
                                  next = Math.floor(Math.random() * loadingMessages.length);
                                } while (loadingMessages.length > 1 && next === lastLoadingIndex);
                                setLoadingIndex(next);
                                setLastLoadingIndex(next);
                                setSelectedGame(game.key);
                                setShowLoading(true);
                              }}
                              style={styles.exploreBtn}
                              activeOpacity={0.7}
                            />
                          </View>
                        </View>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
              {/* Paginador de puntos interactivo */}
              <View style={styles.paginator}>
                {games.map((g, i) => (
                  <TouchableOpacity
                    key={g.key}
                    style={[styles.dot, i === activeGame ? styles.dotActive : styles.dotInactive]}
                    onPress={() => goToGame(i)}
                    accessibilityLabel={`Paginador ${g.key}`}
                  />
                ))}
              </View>
            </>
          )}
          {activeTab === 'user' && (
            <View style={{ flex: 1 }}>
              <ProfileScreen isTab />
            </View>
          )}
        </View>
        {/* Bottom tab fijo */}
        <View style={styles.fixedTabBar}>
          <View style={styles.bottomTab}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'trophy' && styles.tabBtnActive]}
              onPress={() => setActiveTab('trophy')}
            >
              <Image source={activeTab === 'trophy' ? require('../assets/trophy-pink.png') : require('../assets/trophy-blue.png')} style={styles.tabIcon} resizeMode="contain" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'home' && styles.tabBtnActive]}
              onPress={() => setActiveTab('home')}
            >
              <Image source={activeTab === 'home' ? require('../assets/home-pink.png') : require('../assets/home-blue.png')} style={styles.tabIcon} resizeMode="contain" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'user' && styles.tabBtnActive]}
              onPress={() => setActiveTab('user')}
            >
              <Image source={activeTab === 'user' ? require('../assets/user-pink.png') : require('../assets/user-blue.png')} style={styles.tabIcon} resizeMode="contain" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0a0a23',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    alignSelf: 'center',
  },
  logoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#23233a',
    borderRadius: Math.max(18, width * 0.025),
    borderWidth: width * 0.01,
    borderColor: '#7d2fff',
    paddingHorizontal: width * 0.045,
    paddingVertical: height * 0.01,
    marginBottom: height * 0.01,
    marginTop: height * 0.01,
  },
  logoTri: {
    color: '#00fff7',
    fontFamily: pixelFont,
    fontSize: Math.min(width * 0.1, 38),
    letterSpacing: 2,
    marginRight: 2,
    marginLeft: 2,
  },
  logoCade: {
    color: '#ff2e7e',
    fontFamily: pixelFont,
    fontSize: Math.min(width * 0.1, 38),
    letterSpacing: 2,
    marginLeft: 2,
    marginRight: 2,
  },
  cardsScrollWrapper: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardsScroll: {
    width: '100%',
    alignSelf: 'center',
  },
  cardScrollItem: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    height: Math.max(height * 0.56, 0.5 * height),
    marginTop: height * 0.04,
    marginBottom: height * 0.04,
  },
  cardBorder: {
    borderWidth: Math.max(width * 0.018, 5),
    borderColor: '#00fff7',
    borderRadius: Math.max(18, width * 0.08),
    padding: Math.max(width * 0.035, 5),
    backgroundColor: '#23233a',
    shadowColor: '#00fff7',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 6 },
    height: '100%',
  },
  cardContent: {
    borderWidth: Math.max(width * 0.012, 3),
    borderColor: '#ff2e7e',
    borderRadius: Math.max(14, width * 0.06),
    backgroundColor: '#101926',
    alignItems: 'center',
    paddingVertical: Math.max(height * 0.045, 5),
    paddingHorizontal: Math.max(width * 0.08, 5),
    shadowColor: '#ff2e7e',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    height: '100%',
    justifyContent: 'space-between',
  },
  cardIcon: {
    width: Math.min(width * 0.19, 60),
    height: Math.min(width * 0.19, 60),
    marginBottom: Math.max(height * 0.018, 5),
    tintColor: '#00fff7',
  },
  cardTitle: {
    fontFamily: pixelFont,
    fontSize: Math.min(width * 0.11, 32),
    letterSpacing: 2,
    marginBottom: Math.max(height * 0.012, 5),
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
    fontSize: Math.min(width * 0.045, 16),
    textAlign: 'center',
    marginTop: Math.max(height * 0.012, 5),
    marginBottom: 2,
    lineHeight: Math.min(width * 0.06, 22),
  },
  cardDesc2: {
    color: '#fff',
    fontFamily: pixelFont,
    fontSize: Math.min(width * 0.04, 14),
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 2,
    lineHeight: Math.min(width * 0.055, 20),
  },
  exploreBtn: {
    shadowColor: '#00fff7',
    shadowOpacity: 0.7,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    minWidth: Math.min(width * 0.7, 180),
    alignSelf: 'center',
    marginTop: Math.max(height * 0.025, 5),
  },
  paginator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Math.max(height * 0.01, 5),
    marginBottom: Math.max(height * 0.025, 5),
    gap: Math.max(width * 0.04, 5),
  },
  dot: {
    width: Math.max(width * 0.035, 5),
    height: Math.max(width * 0.035, 5),
    borderRadius: Math.max(14, width * 0.0175),
    marginHorizontal: Math.max(width * 0.015, 5),
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
    width: Math.max(width * 0.045, 5),
    height: Math.max(width * 0.045, 5),
    borderRadius: Math.max(14, width * 0.0225),
  },
  fixedTabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingBottom: Math.max(height * 0.015, 5),
  },
  bottomTab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: Math.min(width * 0.9, 370),
    maxWidth: 370,
    backgroundColor: 'transparent',
    borderRadius: Math.max(18, width * 0.045),
    borderWidth: 3,
    borderColor: '#00fff7',
    paddingVertical: Math.max(height * 0.012, 5),
    paddingHorizontal: Math.max(width * 0.045, 5),
    alignSelf: 'center',
    marginTop: 0,
    marginBottom: 0,
    shadowColor: '#00fff7',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Math.max(height * 0.012, 5),
    minHeight: 40,
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
    width: Math.max(width * 0.09, 5),
    height: Math.max(width * 0.09, 5),
  },
  trophiesSection: {
    width: '96%',
    alignSelf: 'center',
    marginBottom: Math.max(height * 0.01, 5),
    marginTop: Math.max(height * 0.01, 5),
  },
  trophiesTitle: {
    color: '#00fff7',
    fontFamily: pixelFont,
    fontSize: Math.min(width * 0.09, 32),
    textAlign: 'center',
    marginBottom: Math.max(height * 0.025, 5),
    letterSpacing: 2,
  },
  trophiesProgressBox: {
    backgroundColor: '#18182e',
    borderRadius: Math.max(14, width * 0.03),
    borderWidth: Math.max(width * 0.01, 5),
    borderColor: '#00fff7',
    padding: Math.max(width * 0.025, 5),
    marginBottom: Math.max(height * 0.025, 5),
    marginTop: Math.max(height * 0.01, 5),
  },
  trophiesProgressText: {
    color: '#ff2e7e',
    fontFamily: pixelFont,
    fontSize: Math.min(width * 0.045, 15),
    marginBottom: 6,
    textAlign: 'center',
  },
  trophiesProgressBarBg: {
    width: '100%',
    height: Math.max(10, height * 0.018),
    backgroundColor: '#23233a',
    borderRadius: Math.max(14, width * 0.03),
    overflow: 'hidden',
    borderWidth: Math.max(width * 0.008, 5),
    borderColor: '#ff2e7e',
  },
  trophiesProgressBarFill: {
    height: '100%',
    backgroundColor: '#ff2e7e',
    borderRadius: Math.max(14, width * 0.03),
    width: '80%',
  },
  trophyList: {
    marginTop: Math.max(height * 0.018, 5),
    gap: Math.max(height * 0.022, 5),
  },
  trophyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18182e',
    borderRadius: Math.max(14, width * 0.03),
    borderWidth: Math.max(width * 0.01, 5),
    borderColor: '#00fff7',
    padding: Math.max(width * 0.025, 5),
    marginBottom: 0,
  },
  trophyCardLocked: {
    borderColor: '#aaa',
    backgroundColor: '#23233a',
    opacity: 0.7,
  },
  trophyIcon: {
    width: Math.min(width * 0.13, 38),
    height: Math.min(width * 0.13, 38),
    marginRight: Math.max(width * 0.04, 5),
    tintColor: '#ff2e7e',
  },
  trophyIconGray: {
    width: Math.min(width * 0.13, 38),
    height: Math.min(width * 0.13, 38),
    marginRight: Math.max(width * 0.04, 5),
    tintColor: undefined,
  },
  trophyTextBox: {
    flex: 1,
  },
  trophyTitle: {
    color: '#00fff7',
    fontFamily: pixelFont,
    fontSize: Math.min(width * 0.045, 15),
    marginBottom: 2,
  },
  trophyTitleGray: {
    color: '#aaa',
    fontFamily: pixelFont,
    fontSize: Math.min(width * 0.045, 15),
    marginBottom: 2,
  },
  trophyDesc: {
    color: '#ff2e7e',
    fontFamily: pixelFont,
    fontSize: Math.min(width * 0.035, 12),
  },
  trophyDescGray: {
    color: '#aaa',
    fontFamily: pixelFont,
    fontSize: Math.min(width * 0.035, 12),
  },
}); 