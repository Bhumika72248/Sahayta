import React from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { store } from './app/store/store';
import { initializeI18n } from './app/i18n/i18n';
import { initializeDatabase } from './app/database/database';

// Screens
import SplashScreen from './app/screens/SplashScreen';
import LanguageSelectionScreen from './app/screens/LanguageSelectionScreen';
import PermissionsScreen from './app/screens/PermissionsScreen';
import VoiceProfileScreen from './app/screens/VoiceProfileScreen';
import HomeScreen from './app/screens/HomeScreen';
import VoiceInteractionScreen from './app/screens/VoiceInteractionScreen';
import ProcessSelectorScreen from './app/screens/ProcessSelectorScreen';
import WorkflowStepperScreen from './app/screens/WorkflowStepperScreen';
import OCRCameraScreen from './app/screens/OCRCameraScreen';
import FormFillingScreen from './app/screens/FormFillingScreen';
import SubmissionScreen from './app/screens/SubmissionScreen';
import HistoryScreen from './app/screens/HistoryScreen';
import SettingsScreen from './app/screens/SettingsScreen';
import HelpScreen from './app/screens/HelpScreen';

const Stack = createStackNavigator();

// Initialize services
initializeI18n();
initializeDatabase();

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor="#0F4C81" />
        <Stack.Navigator 
          initialRouteName="Splash"
          screenOptions={{
            headerShown: false,
            gestureEnabled: false
          }}
        >
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
          <Stack.Screen name="Permissions" component={PermissionsScreen} />
          <Stack.Screen name="VoiceProfile" component={VoiceProfileScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="VoiceInteraction" component={VoiceInteractionScreen} />
          <Stack.Screen name="ProcessSelector" component={ProcessSelectorScreen} />
          <Stack.Screen name="WorkflowStepper" component={WorkflowStepperScreen} />
          <Stack.Screen name="OCRCamera" component={OCRCameraScreen} />
          <Stack.Screen name="FormFilling" component={FormFillingScreen} />
          <Stack.Screen name="Submission" component={SubmissionScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Help" component={HelpScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}