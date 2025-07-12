import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './AppNavigator';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../redux/store/store';
import { initializeSocket } from '../utils/customSocket/Socket';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RootNavigator = () => {
  useEffect(() => {
    const initSocketConnection = async () => {
      try {
        // Get token from AsyncStorage
        const token = await AsyncStorage.getItem('authToken');
        
        if (token) {
          // Initialize socket with the token
          initializeSocket(token);
          console.log('Socket initialized with token');
        } else {
          console.log('No auth token found in AsyncStorage');
        }
      } catch (error) {
        console.error('Error initializing socket:', error);
      }
    };

    initSocketConnection();

    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
};

export default RootNavigator;