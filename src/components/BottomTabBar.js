import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const BottomTabBar = ({ activeTab, onTabPress }) => {
  return (
    <View style={styles.fixedTabBar}>
      <View style={styles.bottomTab}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'trophy' && styles.tabBtnActive]}
          onPress={() => onTabPress('trophy')}
        >
          <View style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
            <Image
              source={activeTab === 'trophy' ? require('../assets/trophy-pink.png') : require('../assets/trophy-blue.png')}
              style={{ width: 48, height: 48, position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -24 }, { translateY: -24 }] }}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'home' && styles.tabBtnActive]}
          onPress={() => onTabPress('home')}
        >
          <View style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
            <Image
              source={activeTab === 'home' ? require('../assets/home-pink.png') : require('../assets/home-blue.png')}
              style={{ width: 48, height: 48, position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -24 }, { translateY: -24 }] }}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'user' && styles.tabBtnActive]}
          onPress={() => onTabPress('user')}
        >
          <View style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
            <Image
              source={activeTab === 'user' ? require('../assets/user-pink.png') : require('../assets/user-blue.png')}
              style={{ width: 48, height: 48, position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -24 }, { translateY: -24 }] }}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fixedTabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingBottom: Math.max(height * 0.015, 5),
  },
  bottomTab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: Math.min(width * 0.9, 370),
    maxWidth: 370,
    backgroundColor: 'transparent',
    borderRadius: Math.max(18, width * 0.045),
    borderWidth: 3,
    borderColor: '#00fff7',
    paddingVertical: Math.max(height * 0.012, 5),
    paddingHorizontal: Math.max(width * 0.045, 5),
    alignSelf: 'center',
    marginTop: 0,
    marginBottom: 0,
    shadowColor: '#00fff7',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
    maxHeight: 60,
    height: 60,
    borderWidth: 3,
    borderColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 0,
    marginVertical: 0,
  },
  tabBtnActive: {
    borderColor: '#ffb300',
    shadowColor: '#ff2e7e',
    shadowOpacity: 0.7,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  tabIcon: {
    width: 32,
    height: 32,
    margin: 0,
    padding: 0,
    resizeMode: 'contain',
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
});

export default BottomTabBar; 