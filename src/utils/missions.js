import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

// Definición de misiones por juego
export const MISSIONS = {
  DUOS: {
    SPEED_MASTER: {
      id: 'duos_speed_master',
      name: 'Maestro de la Velocidad',
      description: 'Completa una partida de Duos en menos de 2 minutos',
      reward: 50,
      check: (stats) => {
        const [mins, secs] = stats.mejorTiempo.split(':').map(Number);
        return (mins * 60 + secs) <= 120;
      }
    },
    PERFECT_MATCH: {
      id: 'duos_perfect_match',
      name: 'Emparejador Perfecto',
      description: 'Gana una partida de Duos sin cometer errores',
      reward: 100,
      check: (stats) => stats.victorias > 0 && stats.derrotas === 0
    },
    DUOS_MASTER: {
      id: 'duos_master',
      name: 'Maestro de Duos',
      description: 'Gana 10 partidas de Duos',
      reward: 200,
      check: (stats) => stats.victorias >= 10
    }
  },
  SNAKE: {
    SNAKE_GROWER: {
      id: 'snake_grower',
      name: 'Serpiente Crecida',
      description: 'Alcanza una longitud de 20 en Snake',
      reward: 50,
      check: (stats) => stats.bestScore >= 20
    },
    PIXEL_EATER: {
      id: 'pixel_eater',
      name: 'Devorador de Píxeles',
      description: 'Come 100 píxeles en total',
      reward: 100,
      check: (stats) => stats.totalPixels >= 100
    },
    SNAKE_MASTER: {
      id: 'snake_master',
      name: 'Maestro de la Serpiente',
      description: 'Juega 20 partidas de Snake',
      reward: 200,
      check: (stats) => stats.totalGames >= 20
    }
  },
  TRIKI: {
    TRIKI_WINNER: {
      id: 'triki_winner',
      name: 'Ganador de Triki',
      description: 'Gana tu primera partida de Triki',
      reward: 50,
      check: (stats) => stats.victorias > 0
    },
    TRIKI_MASTER: {
      id: 'triki_master',
      name: 'Maestro del Triki',
      description: 'Gana 5 partidas de Triki',
      reward: 100,
      check: (stats) => stats.victorias >= 5
    },
    UNDEFEATED: {
      id: 'triki_undefeated',
      name: 'Imbatible',
      description: 'Gana 3 partidas de Triki sin perder',
      reward: 200,
      check: (stats) => stats.victorias >= 3 && stats.derrotas === 0
    }
  }
};

// Función para verificar y actualizar misiones
export const checkAndUpdateMissions = async (userId, gameType, stats) => {
  try {
    const missionsRef = doc(db, 'users', userId, 'missions', 'progress');
    const missionsDoc = await getDoc(missionsRef);
    let currentMissions = {};
    
    if (missionsDoc.exists()) {
      currentMissions = missionsDoc.data();
    }

    const gameMissions = MISSIONS[gameType];
    let updated = false;
    let totalReward = 0;

    for (const [key, mission] of Object.entries(gameMissions)) {
      const missionId = mission.id;
      
      // Si la misión no está completada y cumple las condiciones
      if (!currentMissions[missionId]?.completed && mission.check(stats)) {
        currentMissions[missionId] = {
          completed: true,
          completedAt: new Date().toISOString(),
          reward: mission.reward
        };
        totalReward += mission.reward;
        updated = true;
      }
    }

    if (updated) {
      await setDoc(missionsRef, currentMissions, { merge: true });
      return totalReward;
    }

    return 0;
  } catch (error) {
    console.error('Error checking missions:', error);
    return 0;
  }
}; 