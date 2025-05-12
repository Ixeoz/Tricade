import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const RetroButton = ({ title, onPress }) => (
  <TouchableOpacity style={styles.button} onPress={onPress}>
    <Text style={styles.text}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#0a0a23',
    borderColor: '#00fff7',
    borderWidth: 3,
    borderRadius: 10,
    paddingVertical: 22,
    paddingHorizontal: 60,
    marginTop: 20,
    shadowColor: '#00fff7',
    shadowOpacity: 0.5,
    shadowRadius: 6,
    alignItems: 'center',
  },
  text: {
    color: '#00fff7',
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
});

export default RetroButton; 