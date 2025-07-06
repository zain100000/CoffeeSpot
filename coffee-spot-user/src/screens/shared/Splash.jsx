import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  StatusBar,
  ImageBackground,
  Image,
  Text,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {theme} from '../../styles/theme';
import {globalStyles} from '../../styles/globalStyles';

const {width, height} = Dimensions.get('screen');

const Splash = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [animationStage, setAnimationStage] = useState(1); // 1: initial, 2: slide out

  useEffect(() => {
    const statusBarColor = theme.colors.tertiary;
    StatusBar.setBackgroundColor(statusBarColor);
  }, []);

  useEffect(() => {
    // Stage 1: Initial logo appears (bounce in)
    // After 2 seconds, move to stage 2
    const timer = setTimeout(() => {
      setAnimationStage(2);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 3500)); // Wait for animations to complete
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          navigation.reset({index: 0, routes: [{name: 'Main'}]});
        } else {
          navigation.reset({index: 0, routes: [{name: 'OnBoard'}]});
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  return (
    <SafeAreaView style={[globalStyles.container]}>
      <ImageBackground
        source={require('../../assets/splashScreen/splash-bg.png')}
        style={styles.backgroundContainer}
        resizeMode="cover">
        <View style={styles.contentContainer}>
          <Animatable.View
            animation={animationStage === 1 ? 'bounceIn' : ''}
            duration={2000}
            style={styles.iconContainer}>
            <Animatable.View
              animation={
                animationStage === 2
                  ? {
                      from: {translateX: 0},
                      to: {translateX: width * 0.01},
                    }
                  : null
              }
              duration={500}
              delay={0}
              useNativeDriver={true}>
              <Image
                source={require('../../assets/splashScreen/splash-logo.png')}
                style={styles.icon}
                resizeMode="contain"
              />
            </Animatable.View>
          </Animatable.View>

          {animationStage >= 2 && (
            <Animatable.View
              style={styles.textContainer}
              animation={{
                from: {
                  translateX: -width * 0.1,
                  opacity: 0,
                },
                to: {
                  translateX: width * 0.004,
                  opacity: 1,
                },
              }}
              duration={500}
              delay={0}
              useNativeDriver={true}>
              <Text style={styles.brandText}>Coffee Spot</Text>
            </Animatable.View>
          )}
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default Splash;

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -width * 0.034,
  },

  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  icon: {
    width: width * 0.4,
    height: width * 0.5,
  },

  textContainer: {
    top: height * 0.01,
  },

  brandText: {
    color: theme.colors.dark,
    fontSize: theme.typography.fontSize.xxl,
    fontFamily: theme.typography.dancingScript.bold,
  },
});
