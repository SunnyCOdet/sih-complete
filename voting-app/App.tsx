import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { theme } from './src/theme/theme';
import { AuthProvider } from './src/context/AuthContext';
import { VotingProvider } from './src/context/VotingContext';

// Screens
import SplashScreen from './src/screens/SplashScreen';
import FingerprintAuthScreen from './src/screens/FingerprintAuthScreen';
import UserNameScreen from './src/screens/UserNameScreen';
import VotingScreen from './src/screens/VotingScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import AdminScreen from './src/screens/AdminScreen';

type RootStackParamList = {
  Splash: undefined;
  FingerprintAuth: undefined;
  UserName: {
    fingerprintId: string;
    isNewUser: boolean;
    userData?: any;
  };
  Voting: {
    userData?: any;
    isNewUser?: boolean;
  };
  Results: undefined;
  Admin: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <VotingProvider>
            <NavigationContainer>
              <StatusBar style="light" />
              <Stack.Navigator
                initialRouteName="Splash"
                screenOptions={{
                  headerShown: false,
                  cardStyle: { backgroundColor: '#f8f9fa' },
                }}
              >
                <Stack.Screen name="Splash" component={SplashScreen} />
                <Stack.Screen name="FingerprintAuth" component={FingerprintAuthScreen} />
                <Stack.Screen name="UserName" component={UserNameScreen} />
                <Stack.Screen name="Voting" component={VotingScreen} />
                <Stack.Screen name="Results" component={ResultsScreen} />
                <Stack.Screen name="Admin" component={AdminScreen} />
              </Stack.Navigator>
            </NavigationContainer>
          </VotingProvider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}