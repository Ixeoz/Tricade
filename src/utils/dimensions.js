import { Dimensions } from 'react-native';

// Dimensiones base del diseño (iPhone 14 Pro Max)
const BASE_WIDTH = 430;
const BASE_HEIGHT = 932;

// Obtener dimensiones actuales de la pantalla
const { width, height } = Dimensions.get('window');

// Calcular factores de escala
export const widthScale = width / BASE_WIDTH;
export const heightScale = height / BASE_HEIGHT;
export const scale = Math.min(widthScale, heightScale);

// Función para escalar dimensiones
export const scaleDimension = (size) => {
  return Math.round(size * scale);
};

// Función para escalar fuentes
export const scaleFont = (size) => {
  return Math.round(size * scale);
};

// Función para escalar padding/margin
export const scaleSpace = (size) => {
  return Math.round(size * scale);
};

// Dimensiones de la pantalla
export const screenWidth = width;
export const screenHeight = height;

// Porcentajes útiles
export const wp = (percentage) => {
  return (width * percentage) / 100;
};

export const hp = (percentage) => {
  return (height * percentage) / 100;
};

// Constantes de diseño
export const SPACING = {
  xs: scaleSpace(4),
  sm: scaleSpace(8),
  md: scaleSpace(16),
  lg: scaleSpace(24),
  xl: scaleSpace(32),
  xxl: scaleSpace(40),
};

export const FONT_SIZES = {
  xs: scaleFont(12),
  sm: scaleFont(14),
  md: scaleFont(16),
  lg: scaleFont(20),
  xl: scaleFont(24),
  xxl: scaleFont(32),
};

// Función para obtener dimensiones responsivas
export const getResponsiveDimension = (dimension, minSize = 0) => {
  const scaled = scaleDimension(dimension);
  return Math.max(scaled, minSize);
};

// Función para manejar dimensiones condicionales
export const getDynamicValue = (defaultValue, minValue, maxValue) => {
  const scaled = scaleDimension(defaultValue);
  return Math.min(Math.max(scaled, minValue), maxValue);
};

// Listener para cambios de dimensión
export const addDimensionListener = (callback) => {
  return Dimensions.addEventListener('change', callback);
}; 