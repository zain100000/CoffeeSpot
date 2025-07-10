import React, {useState} from 'react';
import {StatusBar} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {theme} from '../styles/theme';

/* Shared Imports */
import Splash from '../screens/shared/Splash';
import OnBoarding from '../screens/shared/OnBoarding';

/* Auth Imports */
import Signin from '../screens/auth/Signin';
import Signup from '../screens/auth/Signup';

// Home Imports
import BottomNavigator from './bottomNavigator/BottomNavigator';
import CoffeeCategory from '../screens/dashBoard/coffeeCategoryScreens/CoffeeCategory';
import ProductDetail from '../screens/dashBoard/coffeeCategoryScreens/ProductDetail';

// Order(Cart + CheckOut) Imports
import CheckOut from '../screens/checkoutModule/CheckOut';
import Receipt from '../screens/receiptModule/Receipt';
import TrackOrder from '../screens/trackingModule/TrackOrder';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const [statusBarColor, setStatusBarColor] = useState(theme.colors.primary);

  return (
    <>
      <StatusBar backgroundColor={statusBarColor} barStyle="light-content" />
      <Stack.Navigator
        screenOptions={{headerShown: false}}
        initialRouteName="Splash">
        {/* Shared Routes */}
        <Stack.Screen name="Splash">
          {props => <Splash {...props} setStatusBarColor={setStatusBarColor} />}
        </Stack.Screen>

        <Stack.Screen name="OnBoard">
          {props => (
            <OnBoarding {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        {/* Auth Routes */}
        <Stack.Screen name="Signin">
          {props => <Signin {...props} setStatusBarColor={setStatusBarColor} />}
        </Stack.Screen>

        <Stack.Screen name="Signup">
          {props => <Signup {...props} setStatusBarColor={setStatusBarColor} />}
        </Stack.Screen>

        {/* Home Routes */}
        <Stack.Screen name="Main">
          {props => (
            <BottomNavigator {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        <Stack.Screen name="CategoryProducts">
          {props => (
            <CoffeeCategory {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        <Stack.Screen name="ProductDetail">
          {props => (
            <ProductDetail {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        {/* CheckOut Routes */}
        <Stack.Screen name="CheckOut">
          {props => (
            <CheckOut {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        <Stack.Screen name="Receipt">
          {props => (
            <Receipt {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        <Stack.Screen name="Tracking">
          {props => (
            <TrackOrder {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </>
  );
};

export default AppNavigator;
