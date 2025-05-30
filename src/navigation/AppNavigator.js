import React from 'react';
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
import DuosDetailScreen from '../views/DuosDetailScreen';
import DuosLoadingScreen from '../views/DuosLoadingScreen';
import DuosGameScreen from '../views/DuosGameScreen';
// import GamesScreen from '../views/GamesScreen'; // Puedes crear esta pantalla después

const Stack = createStackNavigator();

const AppNavigator = ({ user }) => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: '#0a0a23' }
    }}
    initialRouteName="Login"
  >
    {/* Auth screens - always available */}
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="Verification" component={VerificationScreen} />
    <Stack.Screen name="EmailValidator" component={EmailValidatorScreen} />
    <Stack.Screen name="WaitingVerification" component={WaitingVerificationScreen} />
    <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />

    {/* Game screens - only available when user is logged in */}
    {user && (
      <>
        <Stack.Screen name="Games" component={GamesScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="TrikiDetailScreen" component={TrikiDetailScreen} />
        <Stack.Screen name="TrikiGameScreen" component={TrikiGameScreen} />
        <Stack.Screen name="SnakeDetailScreen" component={SnakeDetailScreen} />
        <Stack.Screen name="SnakeGameScreen" component={SnakeGameScreen} />
        <Stack.Screen name="DuosDetailScreen" component={DuosDetailScreen} />
        <Stack.Screen name="DuosLoading" component={DuosLoadingScreen} />
        <Stack.Screen name="DuosGame" component={DuosGameScreen} />
      </>
    )}
    {/* <Stack.Screen name="Games" component={GamesScreen} /> */}
  </Stack.Navigator>
);

export default AppNavigator; 