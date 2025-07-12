import React, {useState} from 'react';
import {StatusBar} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {theme} from '../styles/theme';

// Shared Screens
import Splash from '../screens/shared/Splash';
import OnBoarding from '../screens/shared/OnBoarding';

// Auth Screens
import Signin from '../screens/auth/Signin';
import Signup from '../screens/auth/Signup';

// Main (Dashboard) Screens
import BottomNavigator from './bottomNavigator/BottomNavigator';
import CoffeeCategory from '../screens/dashBoard/coffeeCategoryScreens/CoffeeCategory';
import ProductDetail from '../screens/dashBoard/coffeeCategoryScreens/ProductDetail';

// Order Flow Screens
import CheckOut from '../screens/checkoutModule/CheckOut';
import Receipt from '../screens/receiptModule/Receipt';

// Profile & Legal Screens
import PrivacyPolicy from '../screens/profileModule/profileSubScreens/PrivacyPolicy';
import TermsAndConditions from '../screens/profileModule/profileSubScreens/AppUsage';
import Account from '../screens/profileModule/profileSubScreens/Account';
import Orders from '../screens/profileModule/profileSubScreens/orderScreens/Orders';

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

        {/* Main App Routes */}
        <Stack.Screen name="Main">
          {props => (
            <BottomNavigator {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        <Stack.Screen name="Category_Products">
          {props => (
            <CoffeeCategory {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        <Stack.Screen name="Product_Detail">
          {props => (
            <ProductDetail {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        {/* Checkout & Order Routes */}
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

        {/* Legal & Info Screens */}

        <Stack.Screen name="My_Account">
          {props => (
            <Account {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>       

        <Stack.Screen name="Privacy_Policy">
          {props => (
            <PrivacyPolicy {...props} setStatusBarColor={setStatusBarColor} />
          )}
        </Stack.Screen>

        <Stack.Screen name="App_Usage">
          {props => (
            <TermsAndConditions
              {...props}
              setStatusBarColor={setStatusBarColor}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="My_Orders">
          {props => (
            <Orders
              {...props}
              setStatusBarColor={setStatusBarColor}
            />
          )}
        </Stack.Screen>

      </Stack.Navigator>
    </>
  );
};

export default AppNavigator;
