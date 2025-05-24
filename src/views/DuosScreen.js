import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import RetroButton from '../components/RetroButton';
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

export default function DuosScreen({ navigation }) {
  const [selectedDifficulty, setSelectedDifficulty] = useState('Facil');

  const handleBack = () => {
    navigation.goBack();
  };

  const handleStart = () => {
    navigation.navigate('DuosLoading', { difficulty: selectedDifficulty });
  };

  const handleExplore = () => {
    navigation.navigate('DuosLoading', { difficulty: selectedDifficulty });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a23' }}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Puntos decorativos en las esquinas */}
        <View style={styles.cornerDotTL} />
        <View style={styles.cornerDotTR} />
        <View style={styles.cornerDotBL} />
        <View style={styles.cornerDotBR} />

        {/* Botón de retroceso */}
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <View style={styles.backBox}>
            <Text style={styles.backText}>←</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.container}>
          {/* Título DUOS */}
          <View style={styles.titleContainer}>
            <Text style={[styles.title, ...pixelStroke]}>DUOS</Text>
          </View>

          {/* Contenedor de estadísticas */}
          <View style={styles.statsContainer}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Victorias:</Text>
              <Text style={styles.statValue}>6</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Derrotas:</Text>
              <Text style={styles.statValue}>4</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Mejor tiempo:</Text>
              <Text style={styles.statValue}>1:30</Text>
            </View>
          </View>

          {/* Selector de dificultad */}
          <View style={styles.difficultyContainer}>
            <TouchableOpacity 
              style={[
                styles.difficultyButton,
                selectedDifficulty === 'Facil' && styles.difficultyButtonActive
              ]}
              onPress={() => setSelectedDifficulty('Facil')}
            >
              <Text style={[
                styles.difficultyText,
                selectedDifficulty === 'Facil' && styles.difficultyTextActive
              ]}>Facil</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.difficultyButton,
                selectedDifficulty === 'Dificil' && styles.difficultyButtonActive
              ]}
              onPress={() => setSelectedDifficulty('Dificil')}
            >
              <Text style={[
                styles.difficultyText,
                selectedDifficulty === 'Dificil' && styles.difficultyTextActive
              ]}>Dificil</Text>
            </TouchableOpacity>
          </View>

          {/* Botones de acción */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.exploreButton} onPress={handleExplore}>
              <Text style={styles.exploreButtonText}>EXPLORAR</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.startButton} onPress={handleStart}>
              <Text style={styles.startButtonText}>¡START!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#0a0a23',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: scaleDimension(24),
    paddingTop: height * 0.1,
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
  titleContainer: {
    backgroundColor: '#23233a',
    borderRadius: 12,
    borderWidth: 5,
    borderColor: '#00fff7',
    paddingHorizontal: scaleDimension(24),
    paddingVertical: scaleDimension(12),
    marginBottom: scaleDimension(32),
  },
  title: {
    fontSize: scaleFont(38),
    fontFamily: pixelFont,
    color: '#ff2e7e',
    letterSpacing: 2,
    textAlign: 'center',
  },
  statsContainer: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#23233a',
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#00fff7',
    padding: scaleDimension(20),
    marginBottom: scaleDimension(32),
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scaleDimension(12),
  },
  statLabel: {
    color: '#00fff7',
    fontFamily: pixelFont,
    fontSize: scaleFont(16),
  },
  statValue: {
    color: '#ff2e7e',
    fontFamily: pixelFont,
    fontSize: scaleFont(16),
  },
  difficultyContainer: {
    width: '100%',
    maxWidth: 340,
    marginBottom: scaleDimension(32),
  },
  difficultyButton: {
    width: '100%',
    backgroundColor: '#23233a',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#00fff7',
    padding: scaleDimension(16),
    marginBottom: scaleDimension(12),
  },
  difficultyButtonActive: {
    backgroundColor: '#00fff7',
    borderColor: '#ff2e7e',
  },
  difficultyText: {
    color: '#00fff7',
    fontFamily: pixelFont,
    fontSize: scaleFont(18),
    textAlign: 'center',
  },
  difficultyTextActive: {
    color: '#0a0a23',
  },
  actionButtonsContainer: {
    width: '100%',
    maxWidth: 340,
    gap: scaleDimension(12),
  },
  exploreButton: {
    width: '100%',
    backgroundColor: '#23233a',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#00fff7',
    padding: scaleDimension(16),
    shadowColor: '#00fff7',
    shadowOpacity: 0.6,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  exploreButtonText: {
    color: '#00fff7',
    fontFamily: pixelFont,
    fontSize: scaleFont(24),
    textAlign: 'center',
  },
  startButton: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#ff2e7e',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#00fff7',
    padding: scaleDimension(16),
    shadowColor: '#ff2e7e',
    shadowOpacity: 0.6,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  startButtonText: {
    color: '#fff',
    fontFamily: pixelFont,
    fontSize: scaleFont(24),
    textAlign: 'center',
  },
}); 