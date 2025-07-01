import React, {useEffect, useRef} from 'react';
import {
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  useColorScheme,
  View,
} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import LinearGradient from 'react-native-linear-gradient';
import {theme} from '../../styles/theme';

import Home from    '../../screens/dashBoard/Home';
import Menu from    '../../screens/menuModule/Menu';
import Cart from    '../../screens/cartModule/Cart';
import Profile from '../../screens/profileModule/Profile';

const Tab = createBottomTabNavigator();
const {width, height} = Dimensions.get('screen');

// ✅ Animated Icon with Glow
const AnimatedTabIcon = ({focused, source}) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleValue, {
      toValue: focused ? 1.2 : 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <Animated.View
      style={[styles.iconWrapper, {transform: [{scale: scaleValue}]}]}>
      {focused && (
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.tertiary]}
          style={styles.iconGlow}
          start={{x: 0.2, y: 0.2}}
          end={{x: 0.8, y: 0.8}}
        />
      )}
      <Image
        source={source}
        style={[
          styles.icon,
          {tintColor: focused ? theme.colors.primary : theme.colors.gray},
        ]}
      />
    </Animated.View>
  );
};

// ✅ Tab Navigator
const BottomNavigator = () => {
  const colorScheme = useColorScheme();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.gray,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: theme.colors.white,
            ...theme.elevation.depth3,
          },
        ],
      }}>
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({focused}) => (
            <AnimatedTabIcon
              focused={focused}
              source={
                focused
                  ? require('../../assets/navigatorIcons/home-filled.png')
                  : require('../../assets/navigatorIcons/home.png')
              }
            />
          ),
        }}
      />
      <Tab.Screen
        name="Categories"
        component={Menu}
        options={{
          tabBarLabel: 'Categories',
          tabBarIcon: ({focused}) => (
            <AnimatedTabIcon
              focused={focused}
              source={
                focused
                  ? require('../../assets/navigatorIcons/menu-filled.png')
                  : require('../../assets/navigatorIcons/menu.png')
              }
            />
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={Cart}
        options={{
          tabBarLabel: 'Cart',
          tabBarIcon: ({focused}) => (
            <AnimatedTabIcon
              focused={focused}
              source={
                focused
                  ? require('../../assets/navigatorIcons/cart-filled.png')
                  : require('../../assets/navigatorIcons/cart.png')
              }
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({focused}) => (
            <AnimatedTabIcon
              focused={focused}
              source={
                focused
                  ? require('../../assets/navigatorIcons/profile-filled.png')
                  : require('../../assets/navigatorIcons/profile.png')
              }
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomNavigator;

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: width * 0.04,
    right: width * 0.04,
    height: height * 0.085,
    paddingTop: height * 0.02,
    borderTopWidth: 0,
    borderRadius: theme.borderRadius.large,
  },

  tabBarLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.poppins.semiBold,
    marginBottom: height * 0.008,
  },

  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  icon: {
    width: width * 0.07,
    height: height * 0.04,
    resizeMode: 'contain',
    zIndex: 10,
  },

  iconGlow: {
    position: 'absolute',
    width: width * 0.12,
    height: width * 0.12,
    borderRadius: theme.borderRadius.circle,
    opacity: 0.35,
    zIndex: 1,
  },
});
