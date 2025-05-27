// Configuración de puntajes y niveles para los juegos

export const GAME_SCORES = {
  duos: 20,    // Duos: 20 puntos por victoria
  triki: 10,   // Triki: 10 puntos por victoria
  snake: 15,   // Snake: 15 puntos por victoria
};

// Umbral base de experiencia para subir de nivel
export const BASE_EXP = 100;

// Función para calcular el exp necesario para cada nivel
export function getExpForLevel(level) {
  // Ejemplo: cada nivel requiere 100 puntos más que el anterior
  return BASE_EXP + (level - 1) * 100;
}

// Avatares especiales por nivel
export const SPECIAL_AVATARS = [
  { level: 5,   image: 'hidden.1.jpg' },
  { level: 10,  image: 'hidden.2.jpg' },
  { level: 20,  image: 'hidden.3.jpg' },
]; 