import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const RetroButton = ({ title, onPress }) => (
  <TouchableOpacity style={styles.button} onPress={onPress}>
    <Text style={styles.text}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#0a0a23',
    borderColor: '#00fff7',
    borderWidth: Math.min(3, width * 0.008),
    borderRadius: Math.min(10, width * 0.025),
    paddingVertical: Math.min(18, height * 0.025),
    paddingHorizontal: Math.min(50, width * 0.12),
    marginTop: Math.min(16, height * 0.02),
    shadowColor: '#00fff7',
    shadowOpacity: 0.5,
    shadowRadius: 6,
    alignItems: 'center',
    width: Math.min(width * 0.75, 280),
    minWidth: Math.min(width * 0.6, 200),
  },
  text: {
    color: '#00fff7',
    fontSize: Math.min(width * 0.07, 28),
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 2,
    textAlign: 'center',
  },
});

export default RetroButton; 