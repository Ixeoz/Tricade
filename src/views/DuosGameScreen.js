import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, Image, Modal, Animated } from 'react-native';
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
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { checkAndUpdateMissions } from '../utils/missions';
import { GAME_SCORES, getExpForLevel, SPECIAL_AVATARS } from '../utils/scoreConfig';

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

const cartaAbajo = require('../assets/carta-abajo.png');
const cartaCorazon = require('../assets/carta-corazon.png');
const cartaEstrella = require('../assets/carta-estrella.png');

const EASY_PAIRS = [
  { type: 'corazon', image: cartaCorazon },
  { type: 'corazon', image: cartaCorazon },
  { type: 'estrella', image: cartaEstrella },
  { type: 'estrella', image: cartaEstrella },
  { type: 'corazon', image: cartaCorazon },
  { type: 'corazon', image: cartaCorazon },
  { type: 'estrella', image: cartaEstrella },
  { type: 'estrella', image: cartaEstrella },
];

const HARD_PAIRS = [
  { type: 'corazon', image: cartaCorazon },
  { type: 'corazon', image: cartaCorazon },
  { type: 'estrella', image: cartaEstrella },
  { type: 'estrella', image: cartaEstrella },
  { type: 'corazon', image: cartaCorazon },
  { type: 'corazon', image: cartaCorazon },
  { type: 'estrella', image: cartaEstrella },
  { type: 'estrella', image: cartaEstrella },
  { type: 'corazon', image: cartaCorazon },
  { type: 'corazon', image: cartaCorazon },
  { type: 'estrella', image: cartaEstrella },
  { type: 'estrella', image: cartaEstrella },
  { type: 'corazon', image: cartaCorazon },
  { type: 'corazon', image: cartaCorazon },
  { type: 'estrella', image: cartaEstrella },
  { type: 'estrella', image: cartaEstrella },
];

// Función para actualizar estadísticas en Firestore
const updateDuosStats = async (isWin, tiempoStr, scoreToAdd = 0) => {
  try {
    if (!auth.currentUser) return;
    const statsRef = doc(db, 'users', auth.currentUser.uid, 'duosStats', 'stats');
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    const statsDoc = await getDoc(statsRef);
    let prev = { victorias: 0, derrotas: 0, mejorTiempo: null };
    if (statsDoc.exists()) {
      prev = statsDoc.data();
    }
    let mejorTiempo = prev.mejorTiempo || null;
    // Si ganó, actualiza mejor tiempo si es mejor
    if (isWin) {
      // Si no hay mejor tiempo o el nuevo es menor, actualiza
      if (!mejorTiempo || mejorTiempo === '0:00' || tiempoMenor(tiempoStr, mejorTiempo)) {
        mejorTiempo = tiempoStr;
      }
    }
    await setDoc(statsRef, {
      victorias: prev.victorias + (isWin ? 1 : 0),
      derrotas: prev.derrotas + (isWin ? 0 : 1),
      mejorTiempo: mejorTiempo || tiempoStr
    }, { merge: true });

    // Si ganó, actualizar nivel y revisar trofeos
    if (isWin) {
      // Calcular score basado en tiempo y dificultad
      const [mins, secs] = tiempoStr.split(':').map(Number);
      const tiempoTotal = mins * 60 + secs;
      const tiempoMaximo = difficulty === 'Facil' ? 480 : 240; // 8 min o 4 min
      const tiempoBonus = Math.floor((tiempoMaximo - tiempoTotal) * 2); // 2 puntos por segundo restante
      const dificultadBonus = difficulty === 'Facil' ? 100 : 200;
      const scoreFinal = scoreToAdd + tiempoBonus + dificultadBonus;

      // Actualizar nivel
      await updateDoc(userDocRef, { level: increment(scoreFinal) });

      // Verificar misiones
      const missionReward = await checkAndUpdateMissions(
        auth.currentUser.uid,
        'DUOS',
        {
          victorias: prev.victorias + 1,
          derrotas: prev.derrotas,
          mejorTiempo: mejorTiempo
        }
      );

      // Si hay recompensa por misiones, sumarla al nivel
      if (missionReward > 0) {
        await updateDoc(userDocRef, { level: increment(missionReward) });
      }

      // Trofeo personalizado: Memorion (gana una partida de Duos en difícil)
      if (difficulty === 'Dificil') {
        const trophyRef = doc(db, 'users', auth.currentUser.uid, 'trophies', 'memorion');
        await setDoc(trophyRef, {
          unlocked: true,
          date: new Date().toISOString(),
          name: 'Memorion',
          description: 'Gana una partida de DuOS en difícil'
        }, { merge: true });
      }

      // Revisar para trofeos progresivos
      const victoriasActualizadas = prev.victorias + 1;
      if (victoriasActualizadas > 0 && victoriasActualizadas % 50 === 0) {
        const trophyId = `duos${victoriasActualizadas}`;
        const trophyRef = doc(db, 'users', auth.currentUser.uid, 'trophies', trophyId);
        await setDoc(trophyRef, { 
          unlocked: true, 
          date: new Date().toISOString(), 
          count: victoriasActualizadas,
          name: `Duos Master ${victoriasActualizadas}`,
          description: `¡Has ganado ${victoriasActualizadas} partidas de Duos!`
        });
        // Bonus de nivel por trofeo
        await updateDoc(userDocRef, { level: increment(10) });
      }
    }
  } catch (e) {
    console.error('Error guardando stats de Duos:', e);
  }
};

// Compara dos strings de tiempo 'm:ss', retorna true si t1 < t2
function tiempoMenor(t1, t2) {
  const [m1, s1] = t1.split(':').map(Number);
  const [m2, s2] = t2.split(':').map(Number);
  return m1 < m2 || (m1 === m2 && s1 < s2);
}

// Función para cambiar el avatar con animación
const changeAvatarWithAnimation = (newAvatar) => {
  Animated.sequence([
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }),
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }),
  ]).start();
  setAvatar(newAvatar);
};

// Sumar experiencia y nivel al ganar en Duos
async function addDuosWinExp() {
  if (!auth.currentUser) return;
  const userRef = doc(db, 'users', auth.currentUser.uid);
  const userDoc = await getDoc(userRef);
  let exp = 0, level = 0;
  if (userDoc.exists()) {
    exp = userDoc.data().exp || 0;
    level = userDoc.data().level || 0;
  }
  exp += GAME_SCORES.duos;
  let newLevel = level;
  let expMax = getExpForLevel(newLevel + 1);
  // Subir solo un nivel por victoria
  if (exp >= expMax) {
    exp -= expMax;
    newLevel += 1;
  }
  let updates = { exp, level: newLevel };
  const special = SPECIAL_AVATARS.find(a => a.level === newLevel);
  if (special) {
    updates.photoURL = null;
    updates.avatarSpecial = special.image; // Store only the filename string
  }
  await setDoc(userRef, updates, { merge: true });

  // Actualizar estadísticas y trofeos
  const statsRef = doc(db, 'users', auth.currentUser.uid, 'duosStats', 'stats');
  const statsDoc = await getDoc(statsRef);
  let prev = { victorias: 0, derrotas: 0 };
  if (statsDoc.exists()) {
    prev = statsDoc.data();
  }
  await setDoc(statsRef, {
    victorias: prev.victorias + 1,
    derrotas: prev.derrotas
  }, { merge: true });

  // Verificar misiones
  const missionReward = await checkAndUpdateMissions(
    auth.currentUser.uid,
    'DUOS',
    {
      victorias: prev.victorias + 1,
      derrotas: prev.derrotas
    }
  );

  // Si hay recompensa por misiones, sumarla al nivel
  if (missionReward > 0) {
    await updateDoc(userRef, { level: increment(missionReward) });
  }
}

export default function DuosGameScreen({ navigation, route }) {
  const { difficulty } = route.params;
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(difficulty === 'Facil' ? 480 : 240); // 8:00 o 4:00 en segundos
  const [gameOver, setGameOver] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [paused, setPaused] = useState(false);
  const flipAnimations = useRef({}).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Calculate dynamic card styles based on difficulty
  const cardDynamicStyles = {
    maxWidth: difficulty === 'Facil' ? 100 : 72,
    aspectRatio: 0.65,
    margin: 8,
    minWidth: 52,
    minHeight: 68,
  };

  // Initialize game
  useEffect(() => {
    initializeGame();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timer > 0 && !gameOver && !paused) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    } else if (timer === 0 && !gameOver) {
      handleGameOver();
    }
  }, [timer, gameOver, paused]);

  // Check for matches
  useEffect(() => {
    const checkMatch = async () => {
      if (flippedIndices.length === 2) {
        const [firstIndex, secondIndex] = flippedIndices;
        const firstCard = cards[firstIndex];
        const secondCard = cards[secondIndex];

        if (firstCard.type === secondCard.type) {
          await new Promise(resolve => setTimeout(resolve, 300));
          setMatchedPairs(prev => [...prev, firstIndex, secondIndex]);
          setScore(prev => prev + 100);
          setFlippedIndices([]);
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000));
          animateCard(firstIndex, 0);
          animateCard(secondIndex, 0);
          setFlippedIndices([]);
        }
      }
    };

    checkMatch();
  }, [flippedIndices]);

  // Check for win
  useEffect(() => {
    const totalCards = difficulty === 'Facil' ? 8 : 16;
    if (matchedPairs.length === totalCards) {
      handleGameOver(true);
    }
  }, [matchedPairs]);

  const initializeGame = () => {
    const gamePairs = difficulty === 'Facil' ? EASY_PAIRS : HARD_PAIRS;
    const shuffledPairs = [...gamePairs]
      .sort(() => Math.random() - 0.5)
      .map((card, index) => ({
        ...card,
        index
      }));
    
    setCards(shuffledPairs);
    setFlippedIndices([]);
    setMatchedPairs([]);
    setScore(0);
    setGameOver(false);
    setTimer(difficulty === 'Facil' ? 480 : 240); // 480s = 8min, 240s = 4min

    // Inicializa flipAnimations para cada carta
    shuffledPairs.forEach((_, idx) => {
      flipAnimations[idx] = new Animated.Value(0);
    });
  };

  const animateCard = (index, toValue) => {
    Animated.timing(flipAnimations[index], {
      toValue,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleCardPress = (index) => {
    if (
      flippedIndices.length === 2 ||
      flippedIndices.includes(index) ||
      matchedPairs.includes(index) ||
      gameOver ||
      paused
    ) {
      return;
    }

    animateCard(index, 1);
    setFlippedIndices(prev => [...prev, index]);
  };

  const handleGameOver = (isWin = false) => {
    setGameOver(true);
    let finalScore = score;
    if (isWin) {
      finalScore = score + Math.floor(timer * 10); // Bonus points for remaining time
      setScore(finalScore);
      addDuosWinExp();
    }
    // Guardar stats y sumar score a nivel
    const tiempoStr = formatTime(timer);
    updateDuosStats(isWin, tiempoStr, finalScore);
  };

  const handleBack = () => {
    setShowExitConfirm(true);
    setPaused(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Organize cards into rows
  const renderCards = () => {
    const rows = [];
    const cardsPerRow = difficulty === 'Facil' ? [4, 4] : [4, 4, 4, 4];
    let currentIndex = 0;

    cardsPerRow.forEach((numCards, rowIndex) => {
      const rowCards = cards.slice(currentIndex, currentIndex + numCards);

      rows.push(
        <View key={rowIndex} style={styles.cardRow}>
          {rowCards.map((card, index) => {
            const cardIndex = currentIndex + index;
            const isFlipped = flippedIndices.includes(cardIndex);
            const isMatched = matchedPairs.includes(cardIndex);
            
            const scale = flipAnimations[cardIndex].interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [1, 0.8, 1]
            });

            return (
              <TouchableOpacity
                key={card.index}
                style={[
                  styles.card,
                  cardDynamicStyles,
                  (isFlipped || isMatched) && styles.cardFlipped
                ]}
                onPress={() => handleCardPress(cardIndex)}
                activeOpacity={0.7}
                disabled={isMatched || isFlipped || flippedIndices.length === 2}
              >
                <Animated.View style={[
                  styles.cardInner,
                  {
                    transform: [{ scale }]
                  }
                ]}>
                  <Image
                    source={isFlipped || isMatched ? card.image : cartaAbajo}
                    style={styles.cardImage}
                    resizeMode="contain"
                  />
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </View>
      );
      currentIndex += numCards;
    });

    return rows;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <View style={styles.backBox}>
          <Text style={styles.backText}>←</Text>
        </View>
      </TouchableOpacity>

      {/* Corner dots */}
      <View style={styles.cornerDotTL} />
      <View style={styles.cornerDotTR} />
      <View style={styles.cornerDotBL} />
      <View style={styles.cornerDotBR} />

      <View style={styles.header}>
        <Text style={[styles.title, ...pixelStroke]}>DUOS</Text>
        <View style={styles.scoreContainer}>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>Parejas encontradas</Text>
            <Text style={styles.scoreValue}>{matchedPairs.length / 2}</Text>
          </View>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>Parejas restantes</Text>
            <Text style={styles.scoreValue}>
              {(difficulty === 'Facil' ? 4 : 8) - matchedPairs.length / 2}
            </Text>
          </View>
        </View>
        <View style={styles.timerBox}>
          <Text style={styles.timerText}>{formatTime(timer)}</Text>
        </View>
      </View>

      <View style={styles.boardContainer}>
        <View style={styles.boardBorder}>
          <View style={styles.board}>
            {renderCards()}
          </View>
        </View>
      </View>

      {/* Game Over Modal */}
      <Modal
        visible={gameOver}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {matchedPairs.length === (difficulty === 'Facil' ? 8 : 16) ? '¡Victoria!' : 'Game Over'}
            </Text>
            <Text style={styles.modalScore}>Score: {score}</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  initializeGame();
                }}
              >
                <Text style={styles.modalButtonText}>Reintentar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonExit]}
                onPress={() => {
                  setGameOver(false);
                  navigation.navigate('DuosDetailScreen');
                }}
              >
                <Text style={styles.modalButtonText}>Salir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Exit Confirmation Modal */}
      <Modal
        visible={showExitConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowExitConfirm(false);
          setPaused(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>¿Salir del juego?</Text>
            <Text style={styles.modalText}>Perderás el progreso actual</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setShowExitConfirm(false);
                  setPaused(false);
                }}
              >
                <Text style={styles.modalButtonText}>Continuar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonExit]}
                onPress={() => {
                  setShowExitConfirm(false);
                  setPaused(false);
                  navigation.navigate('DuosDetailScreen');
                }}
              >
                <Text style={styles.modalButtonText}>Salir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a23',
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
  backButton: {
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
    boxShadow: '0px 0px 6px #ff2e7e',
  },
  backText: {
    color: '#ff2e7e',
    fontFamily: pixelFont,
    fontSize: scaleFont(22),
    marginLeft: scaleDimension(2),
    marginTop: -scaleDimension(2),
  },
  header: {
    alignItems: 'center',
    marginTop: hp(5),
    marginBottom: hp(3),
    width: '100%',
    paddingHorizontal: wp(4),
  },
  title: {
    fontSize: scaleFont(42),
    fontFamily: pixelFont,
    color: '#ff2e7e',
    marginBottom: hp(3),
    textAlign: 'center',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: wp(95),
    marginBottom: hp(2),
    paddingHorizontal: wp(2),
  },
  scoreBox: {
    backgroundColor: '#18182e',
    borderWidth: 3,
    borderColor: '#00fff7',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 15,
    alignItems: 'center',
    width: '48%',
    boxShadow: '0px 0px 6px #00fff7',
  },
  scoreLabel: {
    color: '#fff',
    fontFamily: pixelFont,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  scoreValue: {
    color: '#00fff7',
    fontFamily: pixelFont,
    fontSize: 28,
    textAlign: 'center',
  },
  timerBox: {
    backgroundColor: '#18182e',
    borderWidth: 3,
    borderColor: '#ff2e7e',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 25,
    marginTop: hp(2),
    boxShadow: '0px 0px 6px #ff2e7e',
  },
  timerText: {
    color: '#ff2e7e',
    fontFamily: pixelFont,
    fontSize: 32,
    textAlign: 'center',
  },
  boardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(1),
    marginTop: hp(2),
  },
  boardBorder: {
    width: '100%',
    aspectRatio: 0.75,
    maxWidth: 400,
    backgroundColor: '#23233a',
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#00fff7',
    padding: 12,
    boxShadow: '0px 0px 10px #00fff7',
  },
  board: {
    flex: 1,
    backgroundColor: '#0a0a23',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#ff2e7e',
    padding: 20,
    justifyContent: 'space-evenly',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 0,
  },
  card: {
    backgroundColor: '#23233a',
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#00fff7',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
    boxShadow: '0px 0px 4px #00fff7',
  },
  cardFlipped: {
    backgroundColor: '#3a2172',
    borderColor: '#ff2e7e',
    boxShadow: '0px 0px 6px #ff2e7e',
  },
  cardInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImage: {
    width: '75%',
    height: '75%',
    resizeMode: 'contain',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '90%',
    maxWidth: 340,
    backgroundColor: '#23233a',
    borderRadius: 16,
    borderWidth: 5,
    borderColor: '#00fff7',
    padding: 6,
    boxShadow: '0px 0px 10px #00fff7',
  },
  modalTitle: {
    color: '#ff2e7e',
    fontFamily: pixelFont,
    fontSize: 24,
    textAlign: 'center',
    marginVertical: 20,
  },
  modalScore: {
    color: '#00fff7',
    fontFamily: pixelFont,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalText: {
    color: '#fff',
    fontFamily: pixelFont,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#00fff7',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ff2e7e',
    paddingHorizontal: 20,
    paddingVertical: 10,
    boxShadow: '0px 0px 6px #ff2e7e',
  },
  modalButtonExit: {
    backgroundColor: '#ff2e7e',
    borderColor: '#00fff7',
    boxShadow: '0px 0px 6px #00fff7',
  },
  modalButtonText: {
    color: '#0a0a23',
    fontFamily: pixelFont,
    fontSize: 14,
  },
}); 