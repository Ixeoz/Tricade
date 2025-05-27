import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const RetroButton = ({ title, onPress, style, textStyle }) => (
  <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
    <Text style={[styles.text, textStyle]}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#0a0a23',
    borderColor: '#00fff7',
    borderWidth: Math.min(3, width * 0.008),
    borderRadius: Math.min(10, width * 0.025),
    paddingVertical: Math.min(10, height * 0.018),
    paddingHorizontal: Math.min(50, width * 0.12),
    marginTop: Math.min(16, height * 0.02),
    boxShadow: '0px 0px 6px #00fff7',
    alignItems: 'center',
    width: Math.min(width * 0.75, 280),
    minWidth: Math.min(width * 0.6, 200),
  },
  text: {
    color: '#00fff7',
    fontSize: Math.min(width * 0.045, 18),
    fontWeight: 'bold',
    fontFamily: 'PressStart2P_400Regular',
    letterSpacing: 2,
    textAlign: 'center',
    lineHeight: Math.min(width * 0.055, 22),
  },
});

export default RetroButton; 