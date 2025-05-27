import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, Animated, Modal } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc, increment, updateDoc } from 'firebase/firestore';
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
import { checkAndUpdateMissions } from '../utils/missions';
import { GAME_SCORES, getExpForLevel, SPECIAL_AVATARS } from '../utils/scoreConfig';

const pixelFont = 'PressStart2P_400Regular';
const BOARD_SIZE = 20;
const BOARD_MARGIN = scaleDimension(20);
const MAX_BOARD_SIZE = Math.min(wp(90), hp(70)) - BOARD_MARGIN * 2;
const CELL_SIZE = Math.floor(MAX_BOARD_SIZE / BOARD_SIZE);
const BOARD_PIXEL_SIZE = CELL_SIZE * BOARD_SIZE;
const INITIAL_SPEED = 100;
const SPEED_INCREMENT = 3;
const INIT_SNAKE = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];
const INIT_DIRECTION = 'right';

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

function getRandomFood(snake) {
  let food;
  do {
    food = {
      x: Math.floor(Math.random() * (BOARD_SIZE - 2)) + 1,
      y: Math.floor(Math.random() * (BOARD_SIZE - 2)) + 1,
    };
  } while (snake.some(seg => seg.x === food.x && seg.y === food.y));
  return food;
}

const OPPOSITE_DIRECTIONS = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

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

// Sumar experiencia y nivel al terminar una partida de Snake
async function addSnakeWinExp() {
  if (!auth.currentUser) return;
  const userRef = doc(db, 'users', auth.currentUser.uid);
  const userDoc = await getDoc(userRef);
  let exp = 0, level = 0;
  if (userDoc.exists()) {
    exp = userDoc.data().exp || 0;
    level = userDoc.data().level || 0;
  }
  exp += GAME_SCORES.snake;
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
  const statsRef = doc(db, 'users', auth.currentUser.uid, 'snakeStats', 'stats');
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
    'SNAKE',
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

export default function SnakeGameScreen({ navigation }) {
  const [snake, setSnake] = useState([...INIT_SNAKE]);
  const [direction, setDirection] = useState(INIT_DIRECTION);
  const [food, setFood] = useState(getRandomFood(INIT_SNAKE));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [lastScore, setLastScore] = useState(0);
  const [totalGames, setTotalGames] = useState(0);
  const [totalPixels, setTotalPixels] = useState(0);
  const [foodsEaten, setFoodsEaten] = useState(0);
  const gameLoopRef = useRef(null);
  const lastDirectionRef = useRef(INIT_DIRECTION);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const resetGame = () => {
    setSnake([...INIT_SNAKE]);
    setDirection(INIT_DIRECTION);
    lastDirectionRef.current = INIT_DIRECTION;
    setFood(getRandomFood(INIT_SNAKE));
    setScore(0);
    setFoodsEaten(0);
    setGameOver(false);
    setIsPaused(false);
    fadeAnim.setValue(1);
    shakeAnim.setValue(0);
  };

  const updateStatsInFirestore = async (score) => {
    try {
      if (!auth.currentUser) return;
      const statsRef = doc(db, 'users', auth.currentUser.uid, 'snakeStats', 'stats');
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const statsDoc = await getDoc(statsRef);
      let prev = { bestScore: 0, lastScore: 0, totalGames: 0, totalPixels: 0 };
      if (statsDoc.exists()) {
        prev = statsDoc.data();
      }
      const newStats = {
        bestScore: Math.max(prev.bestScore || 0, score),
        lastScore: score,
        totalGames: (prev.totalGames || 0) + 1,
        totalPixels: (prev.totalPixels || 0) + score,
      };
      await setDoc(statsRef, newStats, { merge: true });

      // Verificar misiones
      const missionReward = await checkAndUpdateMissions(
        auth.currentUser.uid,
        'SNAKE',
        newStats
      );

      // Si hay recompensa por misiones, sumarla al nivel
      if (missionReward > 0) {
        await updateDoc(userDocRef, { level: increment(missionReward) });
      }

      // Sumar experiencia y nivel al terminar una partida de Snake
      await addSnakeWinExp();
    } catch (e) {
      console.error('Error updating snake stats:', e);
    }
  };

  const handleGameOver = () => {
    setGameOver(true);
    updateStatsInFirestore(score);
    
    // Game over animation
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();

    Alert.alert(
      'Game Over',
      `Comidas: ${foodsEaten}\nPuntos: ${score}`,
      [{ text: 'Jugar de nuevo', onPress: resetGame }]
    );
  };

  const moveSnake = () => {
    if (gameOver || isPaused) return;

    setSnake(prevSnake => {
      const head = { ...prevSnake[0] };
      const currentDirection = lastDirectionRef.current;

      switch (currentDirection) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
      }

      if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
        handleGameOver();
        return prevSnake;
      }

      const selfCollision = prevSnake.some((segment) => {
        return segment.x === head.x && segment.y === head.y;
      });

      if (selfCollision) {
        handleGameOver();
        return prevSnake;
      }

      const newSnake = [head, ...prevSnake];

      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 2);
        setFoodsEaten(prev => prev + 1);
        setFood(getRandomFood(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameOver) return;

      const key = e.key.toLowerCase();
      let newDirection = null;

      switch (key) {
        case 'arrowup':
        case 'w':
          newDirection = 'up';
          break;
        case 'arrowdown':
        case 's':
          newDirection = 'down';
          break;
        case 'arrowleft':
        case 'a':
          newDirection = 'left';
          break;
        case 'arrowright':
        case 'd':
          newDirection = 'right';
          break;
        case ' ':
          setIsPaused(prev => !prev);
          return;
      }

      if (newDirection && OPPOSITE_DIRECTIONS[newDirection] !== lastDirectionRef.current) {
        lastDirectionRef.current = newDirection;
        setDirection(newDirection);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameOver]);

  useEffect(() => {
    const speed = Math.max(INITIAL_SPEED - (score * SPEED_INCREMENT), 120);
    gameLoopRef.current = setInterval(moveSnake, speed);
    return () => clearInterval(gameLoopRef.current);
  }, [score, gameOver, isPaused]);

  useEffect(() => {
    const pulse = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.08,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ]);

    Animated.loop(pulse).start();

    return () => {
      pulseAnim.stopAnimation();
    };
  }, []);

  const renderBoard = () => {
    return Array(BOARD_SIZE).fill().map((_, y) => (
      <View key={`row-${y}`} style={styles.row}>
        {Array(BOARD_SIZE).fill().map((_, x) => {
          const isSnake = snake.some(segment => segment.x === x && segment.y === y);
          const isHead = snake[0].x === x && snake[0].y === y;
          const isFood = food.x === x && food.y === y;
          const snakeIndex = snake.findIndex(segment => segment.x === x && segment.y === y);

          return (
            <View
              key={`cell-${x}-${y}`}
              style={[
                styles.cell,
                isSnake && (isHead ? styles.snakeHead : styles.snakeBody),
              ]}
            >
              {isSnake && !isHead && (
                <View style={styles.scale} />
              )}
              {isHead && (
                <>
                  <View style={styles.scaleTop} />
                  <View style={[
                    styles.snakeEye,
                    {
                      top: CELL_SIZE * 0.25,
                      left: CELL_SIZE * 0.25,
                    }
                  ]} />
                  <View style={[
                    styles.snakeEye,
                    {
                      top: CELL_SIZE * 0.25,
                      right: CELL_SIZE * 0.25,
                    }
                  ]} />
                </>
              )}
              {isFood && (
                <Animated.View style={[
                  styles.food,
                  { transform: [{ scale: pulseAnim }] }
                ]}>
                  {/* Stem */}
                  <View style={{
                    position: 'absolute',
                    width: CELL_SIZE * 0.14,
                    height: CELL_SIZE * 0.18,
                    backgroundColor: '#8B4513',
                    top: -CELL_SIZE * 0.09,
                    left: (CELL_SIZE * 0.8) / 2 - (CELL_SIZE * 0.07),
                    borderRadius: CELL_SIZE * 0.07,
                    zIndex: 2,
                  }} />
                  {/* Leaf */}
                  <View style={{
                    position: 'absolute',
                    width: CELL_SIZE * 0.18,
                    height: CELL_SIZE * 0.12,
                    backgroundColor: '#228B22',
                    top: -CELL_SIZE * 0.11,
                    left: (CELL_SIZE * 0.8) / 2,
                    borderTopLeftRadius: CELL_SIZE * 0.09,
                    borderTopRightRadius: CELL_SIZE * 0.09,
                    transform: [{ rotate: '-25deg' }],
                    zIndex: 1,
                  }} />
                </Animated.View>
              )}
            </View>
          );
        })}
      </View>
    ));
  };

  const handleDirectionPress = (newDirection) => {
    if (gameOver || isPaused) return;
    if (OPPOSITE_DIRECTIONS[newDirection] !== lastDirectionRef.current) {
      lastDirectionRef.current = newDirection;
      setDirection(newDirection);
    }
  };

  const handleBack = () => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <View style={styles.backBox}>
          <Text style={styles.backText}>{'<'}</Text>
        </View>
      </TouchableOpacity>

      {/* Corner dots */}
      <View style={styles.cornerDotTL} />
      <View style={styles.cornerDotTR} />
      <View style={styles.cornerDotBL} />
      <View style={styles.cornerDotBR} />

      {/* Scanlines effect */}
      <View style={styles.scanlinesBg}>
        {Array.from({ length: 20 }).map((_, i) => (
          <View key={i} style={styles.scanline} />
        ))}
      </View>

      <View style={styles.header}>
        <Text style={[styles.title, ...pixelStroke]}>SNAKE</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.score}>Score: {score}</Text>
          <Text style={styles.highScore}>High Score: {highScore}</Text>
        </View>
      </View>

      <View style={styles.boardContainer}>
        <View style={styles.boardBorder}>
          <View style={styles.board}>
            {renderBoard()}
            {gameOver && (
              <Animated.View 
                style={[
                  styles.gameOverOverlay,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateX: shakeAnim }]
                  }
                ]}
              >
                <View style={styles.gameOverBox}>
                  <Text style={[styles.gameOverText, ...pixelStroke]}>GAME</Text>
                  <Text style={[styles.gameOverText, ...pixelStroke]}>OVER</Text>
                </View>
              </Animated.View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.controls}>
        <View style={styles.controlRow}>
          <TouchableOpacity
            style={[styles.controlButton, styles.glowBtn]}
            onPress={() => handleDirectionPress('up')}
          >
            <Text style={styles.controlText}>↑</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.controlRow}>
          <TouchableOpacity
            style={[styles.controlButton, styles.glowBtn]}
            onPress={() => handleDirectionPress('left')}
          >
            <Text style={styles.controlText}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlButton, styles.pauseButton, styles.glowBtn]}
            onPress={() => setIsPaused(prev => !prev)}
          >
            <Text style={styles.controlText}>{isPaused ? '▶' : '⏸'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlButton, styles.glowBtn]}
            onPress={() => handleDirectionPress('right')}
          >
            <Text style={styles.controlText}>→</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.controlRow}>
          <TouchableOpacity
            style={[styles.controlButton, styles.glowBtn]}
            onPress={() => handleDirectionPress('down')}
          >
            <Text style={styles.controlText}>↓</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ alignItems: 'center', marginTop: 10, marginBottom: 20 }}>
        <TouchableOpacity
          style={[styles.restartButton, styles.glowBtn, { marginTop: 0 }]}
          onPress={resetGame}
        >
          <Text style={styles.restartButtonText}>
            {gameOver ? 'Play Again' : 'Restart'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a23',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: scaleDimension(24),
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
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    zIndex: 1,
  },
  title: {
    fontSize: scaleFont(38),
    fontFamily: pixelFont,
    color: '#00fff7',
    marginBottom: SPACING.sm,
    letterSpacing: 2,
  },
  scoreContainer: {
    backgroundColor: '#23233a',
    borderRadius: getResponsiveDimension(14),
    borderWidth: scaleDimension(5),
    borderColor: '#00fff7',
    padding: SPACING.md,
    alignItems: 'center',
  },
  score: {
    fontSize: scaleFont(18),
    fontFamily: pixelFont,
    color: '#ff2e7e',
    marginBottom: SPACING.xs,
  },
  highScore: {
    fontSize: scaleFont(14),
    fontFamily: pixelFont,
    color: '#00fff7',
  },
  boardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.xl,
    zIndex: 1,
  },
  boardBorder: {
    borderWidth: scaleDimension(5),
    borderColor: '#00fff7',
    borderRadius: getResponsiveDimension(22),
    padding: SPACING.sm,
    backgroundColor: '#23233a',
    shadowColor: '#00fff7',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  board: {
    width: BOARD_PIXEL_SIZE,
    height: BOARD_PIXEL_SIZE,
    backgroundColor: '#101926',
    borderWidth: scaleDimension(4),
    borderColor: '#ff2e7e',
    borderRadius: getResponsiveDimension(16),
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderWidth: 0.5,
    borderColor: '#16213e',
    position: 'relative',
  },
  snakeHead: {
    backgroundColor: '#ff2e7e',
    borderRadius: CELL_SIZE / 3,
    shadowColor: '#ff2e7e',
    shadowOpacity: 0.8,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    borderWidth: 1,
    borderColor: '#ff69b4',
    position: 'relative',
    overflow: 'hidden',
    width: CELL_SIZE,
    height: CELL_SIZE,
  },
  snakeBody: {
    backgroundColor: '#00fff7',
    borderRadius: CELL_SIZE / 4,
    shadowColor: '#00fff7',
    shadowOpacity: 0.6,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    borderWidth: 1,
    borderColor: '#7fffd4',
    position: 'relative',
    overflow: 'hidden',
    width: CELL_SIZE,
    height: CELL_SIZE,
  },
  scale: {
    position: 'absolute',
    width: CELL_SIZE * 0.7,
    height: CELL_SIZE * 0.7,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: CELL_SIZE * 0.35,
    top: CELL_SIZE * 0.15,
    left: CELL_SIZE * 0.15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  scaleTop: {
    position: 'absolute',
    width: CELL_SIZE * 0.7,
    height: CELL_SIZE * 0.7,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: CELL_SIZE * 0.35,
    top: CELL_SIZE * 0.15,
    left: CELL_SIZE * 0.15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  snakeEye: {
    position: 'absolute',
    width: CELL_SIZE * 0.2,
    height: CELL_SIZE * 0.2,
    backgroundColor: '#000',
    borderRadius: CELL_SIZE * 0.1,
    borderWidth: 1,
    borderColor: '#fff',
  },
  food: {
    width: CELL_SIZE * 0.8,
    height: CELL_SIZE * 0.8,
    backgroundColor: '#ff0000',
    borderRadius: (CELL_SIZE * 0.8) / 2,
    shadowColor: '#ff0000',
    shadowOpacity: 0.8,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    position: 'absolute',
    left: CELL_SIZE * 0.1,
    top: CELL_SIZE * 0.1,
    overflow: 'visible',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    marginTop: SPACING.xl,
    alignItems: 'center',
    zIndex: 1,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: SPACING.xs,
  },
  controlButton: {
    width: getResponsiveDimension(60),
    height: getResponsiveDimension(60),
    backgroundColor: '#23233a',
    borderRadius: getResponsiveDimension(8),
    justifyContent: 'center',
    alignItems: 'center',
    margin: SPACING.xs,
    borderWidth: scaleDimension(2),
    borderColor: '#00fff7',
  },
  pauseButton: {
    backgroundColor: '#16213e',
    borderColor: '#ff2e7e',
  },
  controlText: {
    fontSize: scaleFont(24),
    fontFamily: pixelFont,
    color: '#fff',
  },
  restartButton: {
    backgroundColor: '#23233a',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 0,
    borderWidth: 2,
    borderColor: '#ff2e7e',
    zIndex: 1,
  },
  restartButtonText: {
    color: '#ff2e7e',
    fontSize: scaleFont(18),
    fontFamily: pixelFont,
  },
  glowBtn: {
    shadowColor: '#00fff7',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  backButton: {
    position: 'absolute',
    top: height * 0.025,
    left: width * 0.04,
    zIndex: 10,
  },
  backBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#3a2172',
    borderWidth: 2,
    borderColor: '#ff2e7e',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff2e7e',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  backText: {
    color: '#ff2e7e',
    fontFamily: pixelFont,
    fontSize: Math.min(width * 0.06, 22),
    marginLeft: 2,
    marginTop: -2,
  },
  gameOverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: getResponsiveDimension(16),
  },
  gameOverBox: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
    borderColor: '#00fff7',
    borderRadius: 20,
    backgroundColor: '#0a0a23',
    padding: SPACING.xl,
    width: '80%',
    shadowColor: '#00fff7',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },
  gameOverText: {
    color: '#ff2e7e',
    fontSize: scaleFont(36),
    fontFamily: pixelFont,
    letterSpacing: 2,
    marginVertical: 2,
  },
}); 