import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (timer > 0 && !gameOver && !paused) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer, gameOver, paused]);

  // Simple AI: pick first empty
  useEffect(() => {
    if (turn === 'O' && !gameOver && !paused) {
      const empty = [];
      board.forEach((row, i) => row.forEach((cell, j) => { if (!cell) empty.push([i, j]); }));
      if (empty.length > 0) {
        setTimeout(() => {
          const [i, j] = empty[Math.floor(Math.random() * empty.length)];
          makeMove(i, j);
        }, 600);
      }
    }
  }, [turn, board, gameOver, paused]);

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

      // Si es victoria, revisar para subir nivel y trofeo progresivo
      if (result === 'victorias') {
        const victorias = currentStats.victorias || 0;
        // Cada 5 victorias, sube 2 niveles
        if (victorias > 0 && victorias % 5 === 0) {
          await setDoc(userDocRef, { level: increment(2) }, { merge: true });
        }
        // Trofeos progresivos cada 50 victorias
        if (victorias > 0 && victorias % 50 === 0) {
          const trophyId = `triki${victorias}`;
          const trophyRef = doc(userRef, 'trophies', trophyId);
          await setDoc(trophyRef, { unlocked: true, date: new Date().toISOString(), count: victorias });
          await setDoc(userDocRef, { level: increment(10) }, { merge: true });
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
          <View style={styles.pauseOverlay}>
            <View style={styles.pauseBoxBorder}>
              <View style={styles.pauseBox}>
                <Text style={styles.exitMsg}>¿Seguro que que quieres salir?</Text>
                <Text style={styles.exitWarn}>No se guardara el progreso</Text>
                <View style={styles.exitBtnRow}>
                  <TouchableOpacity style={[styles.pauseBtn, { marginRight: 10, borderColor: '#ff2e7e', flex: 1 }]} onPress={() => { setShowExitConfirm(false); navigation.goBack(); }}>
                    <Text style={[styles.pauseBtnText, { color: '#ff2e7e' }]}>Salir</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.pauseBtn, { borderColor: '#00fff7', flex: 1 }]} onPress={() => setShowExitConfirm(false)}>
                    <Text style={[styles.pauseBtnText, { color: '#00fff7' }]}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
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
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '92%',
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
  pauseOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10,10,35,0.93)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Math.max(18, width * 0.03),
    zIndex: 100,
  },
  pauseBoxBorder: {
    borderWidth: 6,
    borderColor: '#00fff7',
    borderRadius: Math.max(22, width * 0.045),
    backgroundColor: '#23233a',
    padding: Math.max(6, width * 0.005),
    shadowColor: '#00fff7',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  pauseBox: {
    borderWidth: 4,
    borderColor: '#ff2e7e',
    borderRadius: Math.max(16, width * 0.045),
    backgroundColor: '#101926',
    paddingVertical: Math.max(height * 0.03, width * 0.06),
    paddingHorizontal: Math.max(width * 0.06, 220),
    alignItems: 'center',
    maxWidth: Math.min(width * 0.9, 370),
    minWidth: Math.max(220, width * 0.06),
  },
  pauseTitle: {
    color: '#ff2e7e',
    fontFamily: pixelFont,
    fontSize: Math.min(width * 0.06, 26),
    textAlign: 'center',
    marginBottom: Math.max(10, width * 0.005),
    letterSpacing: 1,
  },
  pauseMsg: {
    color: '#fff',
    fontFamily: pixelFont,
    fontSize: Math.min(width * 0.045, 18),
    textAlign: 'center',
    marginBottom: Math.max(18, width * 0.005),
  },
  pauseBtn: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#101926',
    borderWidth: 3,
    borderColor: '#00fff7',
    borderRadius: Math.max(12, width * 0.045),
    paddingVertical: Math.max(height * 0.022, width * 0.03),
    marginTop: Math.max(height * 0.01, width * 0.005),
    shadowColor: '#00fff7',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  pauseBtnText: {
    color: '#00fff7',
    fontFamily: pixelFont,
    fontSize: Math.min(width * 0.06, 22),
    textAlign: 'center',
    letterSpacing: 2,
  },
  exitMsg: {
    color: '#fff',
    fontFamily: pixelFont,
    fontSize: Math.min(width * 0.045, 18),
    textAlign: 'center',
    marginBottom: Math.max(8, width * 0.005),
  },
  exitWarn: {
    color: '#ff2e7e',
    fontFamily: pixelFont,
    fontSize: Math.min(width * 0.042, 16),
    textAlign: 'center',
    marginBottom: Math.max(18, width * 0.005),
  },
  exitBtnRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 2,
    gap: 10,
  },
}); 