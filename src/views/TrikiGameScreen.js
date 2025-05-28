import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, SafeAreaView, Modal } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc, increment } from 'firebase/firestore';
import Svg, { Line } from 'react-native-svg';
import { addTrikiWinExp } from './ProfileScreen';
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

const pixelFont = 'PressStart2P_400Regular';

const equisTriki = require('../assets/equis-triki.png');
const circleTriki = require('../assets/circle-triki.png');

const initialBoard = [
  ['', '', ''],
  ['', '', ''],
  ['', '', ''],
];

const MAX_BOARD_SIZE = Math.min(width * 0.98, 380);

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString();
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function TrikiGameScreen({ navigation }) {
  const [board, setBoard] = useState(initialBoard);
  const [turn, setTurn] = useState('X');
  const [score, setScore] = useState({ user: 0, ai: 0 });
  const [timer, setTimer] = useState(240); // 4:00 in seconds
  const [gameOver, setGameOver] = useState(false);
  const [winnerLine, setWinnerLine] = useState(null);
  const [paused, setPaused] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [boardLayout, setBoardLayout] = useState({ width: 0, height: 0 });
  const [statsUpdated, setStatsUpdated] = useState(false);
  const aiThinking = useRef(false);

  useEffect(() => {
    if (timer > 0 && !gameOver && !paused) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer, gameOver, paused]);

  useEffect(() => {
    if (turn === 'O' && !gameOver && !paused && !aiThinking.current) {
      aiThinking.current = true;
      setTimeout(() => {
        // Verifica que sigue siendo el turno de la IA y el juego no terminó
        if (turn !== 'O' || gameOver || paused) {
          aiThinking.current = false;
          return;
        }
        const empty = [];
        board.forEach((row, i) => row.forEach((cell, j) => { if (!cell) empty.push([i, j]); }));
        if (empty.length > 0) {
          // Primero intentar ganar
          const winningMove = findBestMove(board, 'O');
          if (winningMove) {
            makeMove(winningMove[0], winningMove[1]);
          } else {
            // Luego intentar bloquear al jugador
            const blockingMove = findBestMove(board, 'X');
            if (blockingMove) {
              makeMove(blockingMove[0], blockingMove[1]);
            } else {
              // Si no hay movimientos estratégicos, elegir aleatoriamente
              const [i, j] = empty[Math.floor(Math.random() * empty.length)];
              makeMove(i, j);
            }
          }
        }
        aiThinking.current = false;
      }, 600);
    } else if (turn === 'X') {
      aiThinking.current = false;
    }
  }, [turn, gameOver, paused]);

  // Función para encontrar el mejor movimiento
  function findBestMove(board, player) {
    // Verificar filas
    for (let i = 0; i < 3; i++) {
      const row = board[i];
      if (row.filter(cell => cell === player).length === 2 && row.includes('')) {
        return [i, row.indexOf('')];
      }
    }
    // Verificar columnas
    for (let j = 0; j < 3; j++) {
      const col = [board[0][j], board[1][j], board[2][j]];
      if (col.filter(cell => cell === player).length === 2 && col.includes('')) {
        return [col.indexOf(''), j];
      }
    }
    // Verificar diagonales
    const diag1 = [board[0][0], board[1][1], board[2][2]];
    if (diag1.filter(cell => cell === player).length === 2 && diag1.includes('')) {
      const index = diag1.indexOf('');
      return [index, index];
    }
    const diag2 = [board[0][2], board[1][1], board[2][0]];
    if (diag2.filter(cell => cell === player).length === 2 && diag2.includes('')) {
      const index = diag2.indexOf('');
      return [index, 2 - index];
    }
    return null;
  }

  async function updateStats(result) {
    if (!auth.currentUser) return;
    const userRef = doc(db, 'users', auth.currentUser.uid);
    const statsRef = doc(userRef, 'trikiStats', 'stats');
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    try {
      const statsDoc = await getDoc(statsRef);
      if (!statsDoc.exists()) {
        await setDoc(statsRef, {
          victorias: 0,
          derrotas: 0,
          empates: 0
        });
      }
      // Incrementar el contador correspondiente
      await setDoc(statsRef, {
        [result]: increment(1)
      }, { merge: true });

      // Obtener estadísticas actualizadas
      const updatedStatsDoc = await getDoc(statsRef);
      const currentStats = updatedStatsDoc.data();

      // Verificar misiones
      const missionReward = await checkAndUpdateMissions(
        auth.currentUser.uid,
        'TRIKI',
        currentStats
      );

      // Si es victoria, subir solo un nivel
      if (result === 'victorias') {
        await setDoc(userDocRef, { level: increment(1) }, { merge: true });
        
        // Trofeos progresivos cada 50 victorias (solo el trofeo, sin nivel extra)
        const victorias = currentStats.victorias || 0;
        if (victorias > 0 && victorias % 50 === 0) {
          const trophyId = `triki${victorias}`;
          const trophyRef = doc(userRef, 'trophies', trophyId);
          await setDoc(trophyRef, { unlocked: true, date: new Date().toISOString(), count: victorias });
        }
      }

      // Si hay recompensa por misiones, sumarla al nivel
      if (missionReward > 0) {
        await setDoc(userDocRef, { level: increment(missionReward) }, { merge: true });
      }
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  }

  function checkWinner(b) {
    // Rows
    for (let i = 0; i < 3; i++) {
      if (b[i][0] && b[i][0] === b[i][1] && b[i][1] === b[i][2]) {
        return { line: ['row', i] };
      }
    }
    // Columns
    for (let i = 0; i < 3; i++) {
      if (b[0][i] && b[0][i] === b[1][i] && b[1][i] === b[2][i]) {
        return { line: ['col', i] };
      }
    }
    // Diagonals
    if (b[0][0] && b[0][0] === b[1][1] && b[1][1] === b[2][2]) {
      return { line: ['diag', 0] };
    }
    if (b[0][2] && b[0][2] === b[1][1] && b[1][1] === b[2][0]) {
      return { line: ['diag', 1] };
    }
    return null;
  }

  function makeMove(i, j) {
    if (board[i][j] || gameOver || paused) return;
    
    const newBoard = board.map(row => [...row]);
    newBoard[i][j] = turn;
    setBoard(newBoard);
    
    const win = checkWinner(newBoard);
    if (win) {
      setGameOver(true);
      setWinnerLine(win.line);
      if (!statsUpdated) {
        setStatsUpdated(true);
        if (turn === 'X') {
          setScore(s => ({ ...s, user: s.user + 1 }));
          updateStats('victorias');
          addTrikiWinExp();
        } else {
          setScore(s => ({ ...s, ai: s.ai + 1 }));
          updateStats('derrotas');
        }
      }
      setTimeout(resetBoard, 1800);
    } else if (newBoard.flat().every(cell => cell)) {
      setGameOver(true);
      if (!statsUpdated) {
        setStatsUpdated(true);
        updateStats('empates');
      }
      setTimeout(resetBoard, 1800);
    } else {
      setTurn(turn === 'X' ? 'O' : 'X');
    }
  }

  function resetBoard() {
    setBoard(initialBoard);
    setTurn('X');
    setGameOver(false);
    setWinnerLine(null);
    setStatsUpdated(false);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a23' }}>
      <View style={styles.root}>
        {/* Encabezado TRIKI centrado */}
        <View style={styles.headerBox}>
          <Text style={styles.headerTitle}>TRIKI</Text>
        </View>
        {/* Top bar mejorada */}
        <View style={styles.topBar}>
          {/* Botón de volver */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topBtn}>
            <Text style={styles.topTextIcon}>{'<'}</Text>
          </TouchableOpacity>
          {/* Botón de pausa */}
          <TouchableOpacity onPress={() => setPaused(!paused)} style={[styles.topBtn, styles.topBtnGlow]}>
            <Text style={[styles.topTextIcon, { color: '#00fff7', textShadowColor: '#00fff7', textShadowRadius: 8, textShadowOffset: { width: 0, height: 0 } }]}>{paused ? '>' : '∥'}</Text>
          </TouchableOpacity>
          {/* Botón de salir */}
          <TouchableOpacity onPress={() => setShowExitConfirm(true)} style={[styles.topBtn, styles.topBtnGlow]}>
            <Text style={[styles.topTextIcon, { color: '#ff2e7e', textShadowColor: '#ff2e7e', textShadowRadius: 8, textShadowOffset: { width: 0, height: 0 } }]}>✖</Text>
          </TouchableOpacity>
        </View>
        {/* Turno actual */}
        <View style={styles.turnBox}>
          <Text style={styles.turnLabel}>Turno de:</Text>
          <Text style={[styles.turnIcon, { color: turn === 'X' ? '#00fff7' : '#ff2e7e', fontSize: Math.min(width * 0.06, 36), textShadowColor: turn === 'X' ? '#00fff7' : '#ff2e7e', textShadowRadius: 8 }]}>{turn}</Text>
        </View>
        {/* Board */}
        <View
          style={styles.boardBorder}
        >
          <View
            style={styles.boardInner}
            onLayout={e => setBoardLayout(e.nativeEvent.layout)}
          >
            {board.map((row, i) => (
              <View key={i} style={styles.boardRow}>
                {row.map((cell, j) => (
                  <TouchableOpacity
                    key={j}
                    style={styles.cell}
                    activeOpacity={cell || gameOver || turn === 'O' || paused ? 1 : 0.7}
                    onPress={() => turn === 'X' && !cell && !gameOver && !paused ? makeMove(i, j) : null}
                  >
                    {cell === 'X' && <Image source={equisTriki} style={styles.cellIcon} resizeMode="contain" />}
                    {cell === 'O' && <Image source={circleTriki} style={styles.cellIcon} resizeMode="contain" />}
                  </TouchableOpacity>
                ))}
              </View>
            ))}
            {/* Winner line */}
            {winnerLine && <WinnerLine line={winnerLine} boardLayout={boardLayout} winnerSymbol={turn} />}
          </View>
        </View>
        {/* Score and timer */}
        <View style={styles.scoreRow}>
          <View style={styles.scoreBox}><Text style={styles.scoreLabel}>TÚ</Text><Text style={styles.scoreValue}>{score.user}</Text></View>
          <View style={styles.scoreBox}><Text style={styles.scoreLabel}>IA</Text><Text style={styles.scoreValue}>{score.ai}</Text></View>
        </View>
        <View style={styles.timerBox}>
          <Text style={styles.timerText}>{formatTime(timer)}</Text>
        </View>
        {/* Modal de confirmación de salida */}
        <Modal
          visible={showExitConfirm}
          transparent
          animationType="fade"
          onRequestClose={() => setShowExitConfirm(false)}
        >
          <View style={styles.exitModal}>
            <View style={styles.exitBox}>
              <Text style={styles.exitTitle}>¿Seguro que que quieres salir?</Text>
              <Text style={styles.exitText}>No se guardara el progreso</Text>
              <View style={styles.exitButtons}>
                <TouchableOpacity style={styles.exitButton} onPress={() => { setShowExitConfirm(false); navigation.goBack(); }}>
                  <Text style={styles.exitButtonText}>Salir</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.exitButtonCancel} onPress={() => setShowExitConfirm(false)}>
                  <Text style={styles.exitButtonCancelText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

function WinnerLine({ line, boardLayout, winnerSymbol }) {
  if (!boardLayout.width || !boardLayout.height) return null;
  const lineThickness = 10;
  const glowThickness = 22;
  const cellW = boardLayout.width / 3;
  const cellH = boardLayout.height / 3;
  const color = winnerSymbol === 'X' ? '#00fff7' : '#ff2e7e';
  const glowColor = winnerSymbol === 'X' ? '#00fff7aa' : '#ff2e7eaa';

  let x1, y1, x2, y2;
  if (line[0] === 'row') {
    x1 = cellW / 2;
    y1 = cellH * line[1] + cellH / 2;
    x2 = boardLayout.width - cellW / 2;
    y2 = y1;
  } else if (line[0] === 'col') {
    x1 = cellW * line[1] + cellW / 2;
    y1 = cellH / 2;
    x2 = x1;
    y2 = boardLayout.height - cellH / 2;
  } else if (line[0] === 'diag' && line[1] === 0) {
    x1 = cellW / 2;
    y1 = cellH / 2;
    x2 = boardLayout.width - cellW / 2;
    y2 = boardLayout.height - cellH / 2;
  } else if (line[0] === 'diag' && line[1] === 1) {
    x1 = boardLayout.width - cellW / 2;
    y1 = cellH / 2;
    x2 = cellW / 2;
    y2 = boardLayout.height - cellH / 2;
  }

  return (
    <Svg
      style={{ position: 'absolute', left: 0, top: 0, width: boardLayout.width, height: boardLayout.height, pointerEvents: 'none' }}
      width={boardLayout.width}
      height={boardLayout.height}
    >
      {/* Glow */}
      <Line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={glowColor}
        strokeWidth={glowThickness}
        strokeLinecap="round"
        opacity={0.45}
      />
      {/* Línea principal */}
      <Line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={lineThickness}
        strokeLinecap="round"
        opacity={0.98}
      />
    </Svg>
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
  headerBox: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 2,
  },
  headerTitle: {
    fontFamily: pixelFont,
    color: '#00fff7',
    fontSize: Math.min(width * 0.13, 38),
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
    maxWidth: '90%',
    alignSelf: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '96%',
    marginTop: Math.max(12, height * 0.018),
    marginBottom: Math.max(12, height * 0.01),
    alignSelf: 'center',
  },
  topBtn: {
    backgroundColor: '#3a2172',
    borderWidth: 2,
    borderColor: '#ff2e7e',
    borderRadius: 8,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff2e7e',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  topBtnGlow: {
    shadowColor: '#ff2e7e',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  topIcon: {
    width: 28,
    height: 28,
  },
  topTextIcon: {
    fontFamily: pixelFont,
    fontSize: Math.min(width * 0.06, 22),
    textAlign: 'center',
    marginLeft: 2,
    marginTop: -2,
    color: '#ff2e7e',
  },
  turnBox: {
    backgroundColor: '#23233a',
    borderWidth: 3,
    borderColor: '#00fff7',
    borderRadius: Math.max(18, width * 0.045),
    paddingHorizontal: Math.max(12, width * 0.06),
    paddingVertical: Math.max(4, width * 0.03),
    alignItems: 'center',
    justifyContent: 'center',
  },
  turnLabel: {
    color: '#fff',
    fontFamily: pixelFont,
    fontSize: Math.min(width * 0.06, 26),
    marginBottom: Math.max(2, width * 0.005),
  },
  turnIcon: {
    fontFamily: pixelFont,
    fontSize: Math.min(width * 0.06, 36),
  },
  boardBorder: {
    borderWidth: 7,
    borderColor: '#00fff7',
    borderRadius: Math.max(22, width * 0.045),
    backgroundColor: '#23233a',
    padding: Math.max(6, width * 0.005),
    marginTop: Math.max(12, width * 0.005),
    marginBottom: Math.max(12, width * 0.005),
    alignSelf: 'center',
    width: '99%',
    maxWidth: undefined,
  },
  boardInner: {
    borderWidth: 5,
    borderColor: '#ff2e7e',
    borderRadius: Math.max(18, width * 0.045),
    backgroundColor: '#101926',
    width: '100%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    maxWidth: undefined,
  },
  boardRow: {
    flexDirection: 'row',
    width: '100%',
    height: '33.33%',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#00fff7',
    margin: Math.max(2, width * 0.005),
    aspectRatio: 1,
    backgroundColor: 'transparent',
  },
  cellIcon: {
    width: '80%',
    height: '80%',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: Math.max(12, width * 0.01),
    marginBottom: 0,
    alignSelf: 'center',
  },
  scoreBox: {
    backgroundColor: '#18182e',
    borderWidth: 4,
    borderColor: '#00fff7',
    borderRadius: Math.max(14, width * 0.045),
    paddingVertical: Math.max(16, width * 0.03),
    paddingHorizontal: Math.max(32, width * 0.06),
    alignItems: 'center',
    minWidth: Math.max(80, width * 0.09),
  },
  scoreLabel: {
    color: '#fff',
    fontFamily: pixelFont,
    fontSize: Math.min(width * 0.06, 26),
    marginBottom: Math.max(2, width * 0.005),
  },
  scoreValue: {
    color: '#00fff7',
    fontFamily: pixelFont,
    fontSize: Math.min(width * 0.09, 32),
  },
  timerBox: {
    marginTop: Math.max(16, width * 0.01),
    backgroundColor: '#23233a',
    borderWidth: 4,
    borderColor: '#7d2fff',
    borderRadius: Math.max(14, width * 0.045),
    paddingVertical: Math.max(12, width * 0.03),
    paddingHorizontal: Math.max(36, width * 0.06),
    alignItems: 'center',
    alignSelf: 'center',
  },
  timerText: {
    color: '#fff',
    fontFamily: pixelFont,
    fontSize: Math.min(width * 0.09, 32),
    letterSpacing: 2,
  },
  exitModal: {
    flex: 1,
    backgroundColor: 'rgba(10,10,35,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  exitBox: {
    backgroundColor: '#23233a',
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#ff2e7e',
    padding: 24,
    width: '90%',
    maxWidth: 320,
    alignItems: 'center',
    shadowColor: '#ff2e7e',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  exitTitle: {
    color: '#ff2e7e',
    fontFamily: pixelFont,
    fontSize: Math.min(width * 0.06, 22),
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 1,
  },
  exitText: {
    color: '#fff',
    fontFamily: pixelFont,
    fontSize: Math.min(width * 0.045, 16),
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  exitButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    width: '100%',
  },
  exitButton: {
    backgroundColor: '#3a2172',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#00fff7',
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 100,
  },
  exitButtonText: {
    color: '#00fff7',
    fontFamily: pixelFont,
    fontSize: Math.min(width * 0.045, 16),
    textAlign: 'center',
  },
  exitButtonCancel: {
    backgroundColor: '#3a2172',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#00fff7',
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 100,
  },
  exitButtonCancelText: {
    color: '#ff2e7e',
    fontFamily: pixelFont,
    fontSize: Math.min(width * 0.045, 16),
    textAlign: 'center',
  },
}); 