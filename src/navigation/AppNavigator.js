import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../views/HomeScreen';
import LoadingScreen from '../views/LoadingScreen';
import GamesScreen from '../views/GamesScreen';
// import GamesScreen from '../views/GamesScreen'; // Puedes crear esta pantalla después

const Stack = createStackNavigator();

const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Loading" component={LoadingScreen} />
      <Stack.Screen name="Games" component={GamesScreen} />
      {/* <Stack.Screen name="Games" component={GamesScreen} /> */}
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator; 