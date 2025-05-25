import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, Image, Modal } from 'react-native';
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

const CARD_PAIRS = [
  { id: 1, icon: '🚀' },
  { id: 2, icon: '👾' },
  { id: 3, icon: '🌟' },
  { id: 4, icon: '🎮' },
  { id: 5, icon: '💫' },
  { id: 6, icon: '🌌' },
];

export default function DuosGameScreen({ navigation, route }) {
  const { difficulty } = route.params;
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(difficulty === 'Facil' ? 120 : 90); // 2:00 or 1:30 in seconds
  const [gameOver, setGameOver] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [paused, setPaused] = useState(false);

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
    if (flippedIndices.length === 2) {
      const [firstIndex, secondIndex] = flippedIndices;
      if (cards[firstIndex].id === cards[secondIndex].id) {
        setMatchedPairs([...matchedPairs, cards[firstIndex].id]);
        setScore(score + 100);
        setFlippedIndices([]);
      } else {
        setTimeout(() => {
          setFlippedIndices([]);
        }, 1000);
      }
    }
  }, [flippedIndices]);

  // Check for win
  useEffect(() => {
    if (matchedPairs.length === CARD_PAIRS.length) {
      handleGameOver(true);
    }
  }, [matchedPairs]);

  const initializeGame = () => {
    const gameCards = [...CARD_PAIRS, ...CARD_PAIRS]
      .sort(() => Math.random() - 0.5)
      .map((card, index) => ({ ...card, index }));
    setCards(gameCards);
    setFlippedIndices([]);
    setMatchedPairs([]);
    setScore(0);
    setGameOver(false);
  };

  const handleCardPress = (index) => {
    if (
      flippedIndices.length === 2 ||
      flippedIndices.includes(index) ||
      matchedPairs.includes(cards[index].id) ||
      gameOver
    ) {
      return;
    }

    setFlippedIndices([...flippedIndices, index]);
  };

  const handleGameOver = (isWin = false) => {
    setGameOver(true);
    if (isWin) {
      setScore(score + Math.floor(timer * 10)); // Bonus points for remaining time
    }
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
          <Text style={styles.score}>Score: {score}</Text>
          <Text style={styles.timer}>Time: {formatTime(timer)}</Text>
        </View>
      </View>

      <View style={styles.boardContainer}>
        <View style={styles.boardBorder}>
          <View style={styles.board}>
            {cards.map((card, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.card,
                  (flippedIndices.includes(index) || matchedPairs.includes(card.id)) && styles.cardFlipped
                ]}
                onPress={() => handleCardPress(index)}
                activeOpacity={0.7}
              >
                <Text style={styles.cardText}>
                  {flippedIndices.includes(index) || matchedPairs.includes(card.id)
                    ? card.icon
                    : '?'}
                </Text>
              </TouchableOpacity>
            ))}
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
              {matchedPairs.length === CARD_PAIRS.length ? '¡Victoria!' : 'Game Over'}
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
                onPress={() => navigation.navigate('Games')}
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
                onPress={() => navigation.navigate('Games')}
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
    top: 18,
    left: 18,
    width: 12,
    height: 12,
    backgroundColor: '#ff2e7e',
    borderRadius: 6,
    zIndex: 2,
  },
  cornerDotTR: {
    position: 'absolute',
    top: 18,
    right: 18,
    width: 12,
    height: 12,
    backgroundColor: '#00fff7',
    borderRadius: 6,
    zIndex: 2,
  },
  cornerDotBL: {
    position: 'absolute',
    bottom: 18,
    left: 18,
    width: 12,
    height: 12,
    backgroundColor: '#00fff7',
    borderRadius: 6,
    zIndex: 2,
  },
  cornerDotBR: {
    position: 'absolute',
    bottom: 18,
    right: 18,
    width: 12,
    height: 12,
    backgroundColor: '#ff2e7e',
    borderRadius: 6,
    zIndex: 2,
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
    fontSize: scaleFont(22),
    marginLeft: 2,
    marginTop: -2,
  },
  header: {
    alignItems: 'center',
    marginTop: height * 0.08,
    marginBottom: height * 0.04,
  },
  title: {
    fontSize: scaleFont(38),
    fontFamily: pixelFont,
    color: '#ff2e7e',
    marginBottom: height * 0.02,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    maxWidth: 300,
  },
  score: {
    color: '#00fff7',
    fontFamily: pixelFont,
    fontSize: scaleFont(16),
  },
  timer: {
    color: '#ff2e7e',
    fontFamily: pixelFont,
    fontSize: scaleFont(16),
  },
  boardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: width * 0.05,
  },
  boardBorder: {
    width: '100%',
    aspectRatio: 1,
    maxWidth: 400,
    backgroundColor: '#23233a',
    borderRadius: 16,
    borderWidth: 5,
    borderColor: '#00fff7',
    padding: 6,
  },
  board: {
    flex: 1,
    backgroundColor: '#0a0a23',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#ff2e7e',
    padding: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '22%',
    aspectRatio: 1,
    margin: '1.5%',
    backgroundColor: '#23233a',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#00fff7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFlipped: {
    backgroundColor: '#3a2172',
    borderColor: '#ff2e7e',
  },
  cardText: {
    fontSize: scaleFont(24),
    color: '#fff',
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
  },
  modalTitle: {
    color: '#ff2e7e',
    fontFamily: pixelFont,
    fontSize: scaleFont(24),
    textAlign: 'center',
    marginVertical: 20,
  },
  modalScore: {
    color: '#00fff7',
    fontFamily: pixelFont,
    fontSize: scaleFont(18),
    textAlign: 'center',
    marginBottom: 20,
  },
  modalText: {
    color: '#fff',
    fontFamily: pixelFont,
    fontSize: scaleFont(14),
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
  },
  modalButtonExit: {
    backgroundColor: '#ff2e7e',
    borderColor: '#00fff7',
  },
  modalButtonText: {
    color: '#0a0a23',
    fontFamily: pixelFont,
    fontSize: scaleFont(14),
  },
}); 