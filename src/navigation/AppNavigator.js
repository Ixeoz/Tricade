import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../views/HomeScreen';
import LoadingScreen from '../views/LoadingScreen';
import GamesScreen from '../views/GamesScreen';
import ProfileScreen from '../views/ProfileScreen';
import LoginScreen from '../views/LoginScreen';
import RegisterScreen from '../views/RegisterScreen';
import VerificationScreen from '../views/VerificationScreen';
import EmailValidatorScreen from '../views/EmailValidatorScreen';
import WaitingVerificationScreen from '../views/WaitingVerificationScreen';
import ResetPasswordScreen from '../views/ResetPasswordScreen';
import TrikiDetailScreen from '../views/TrikiDetailScreen';
import TrikiGameScreen from '../views/TrikiGameScreen';
import SnakeDetailScreen from '../views/SnakeDetailScreen';
import SnakeGameScreen from '../views/SnakeGameScreen';
// import GamesScreen from '../views/GamesScreen'; // Puedes crear esta pantalla después

const Stack = createStackNavigator();

const AppNavigator = ({ user }) => (
  <NavigationContainer>
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#0a0a23' }
      }}
    >
      {user ? (
        <>
          <Stack.Screen name="Games" component={GamesScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="TrikiDetailScreen" component={TrikiDetailScreen} />
          <Stack.Screen name="TrikiGameScreen" component={TrikiGameScreen} />
          <Stack.Screen name="SnakeDetailScreen" component={SnakeDetailScreen} />
          <Stack.Screen name="SnakeGameScreen" component={SnakeGameScreen} />
        </>
      ) : (
        <>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Verification" component={VerificationScreen} />
      <Stack.Screen name="EmailValidator" component={EmailValidatorScreen} />
      <Stack.Screen name="WaitingVerification" component={WaitingVerificationScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        </>
      )}
      {/* <Stack.Screen name="Games" component={GamesScreen} /> */}
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator; 