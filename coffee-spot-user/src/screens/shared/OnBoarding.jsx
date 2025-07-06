import React, {useState, useRef, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Image,
  SafeAreaView,
  Dimensions,
  Animated,
  Easing,
  StatusBar,
} from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import {useNavigation} from '@react-navigation/native';
import {theme} from '../../styles/theme';
import {globalStyles} from '../../styles/globalStyles';
import Button from '../../utils/customComponents/customButton/Button';

const {width, height} = Dimensions.get('screen');

const images = {
  image1: require('../../assets/onBoardingScreen/onBoard-1.jpg'),
  image2: require('../../assets/onBoardingScreen/onBoard-2.jpg'),
  image3: require('../../assets/onBoardingScreen/onBoard-3.jpg'),
};

const slides = [
  {
    key: '1',
    image: images.image1,
    title: 'Choose and customize your drinks with simplicity',
    description:
      'You want your drink and you want it your way so be bold and customize the way that makes you the happiest!',
  },
  {
    key: '2',
    image: images.image2,
    title: 'No time to waste when you need your coffee',
    description:
      'We’ve crafted a quick and easy way for you to order your favorite coffee or treats thats fast!',
  },
  {
    key: '3',
    image: images.image3,
    title: 'Who doesn’t love rewards? We LOVE rewards!',
    description:
      'If you’re like us you love getting freebies and rewards! That’s why we have the best reward program in the coffee game!',
  },
];

const beans = {
  active: require('../../assets/onBoardingScreen/bean-active.png'),
  inactive: require('../../assets/onBoardingScreen/bean-inactive.png'),
};

const OnBoarding = () => {
  const navigation = useNavigation();
  const [activeIndex, setActiveIndex] = useState(0);
  const sliderRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const imageScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const statusBarColor = theme.colors.tertiary;
    StatusBar.setBackgroundColor(statusBarColor);
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.spring(imageScale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, [activeIndex]);

  const handleSlideChange = index => {
    setActiveIndex(index);
    fadeAnim.setValue(0);
    imageScale.setValue(0.8);
  };

  const goToNextSlide = () => {
    if (sliderRef.current && activeIndex < slides.length - 1) {
      const newIndex = activeIndex + 1;
      sliderRef.current.goToSlide(newIndex);
      handleSlideChange(newIndex);
    } else {
      handleOnComplete();
    }
  };

  const handleOnComplete = () => {
    navigation.replace('Signin');
  };

  const renderItem = ({item, index}) => (
    <SafeAreaView style={[globalStyles.container, styles.primaryContainer]}>
      <Animated.View
        style={[
          styles.imageWrapper,
          {
            opacity: fadeAnim,
            transform: [{scale: imageScale}],
          },
        ]}>
        <Image
          source={item.image}
          style={styles.illustration}
          resizeMode="contain"
        />
      </Animated.View>

      <View style={styles.textContainer}>
        <Animated.Text
          style={[
            styles.title,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}>
          {item.title}
        </Animated.Text>

        <Animated.Text
          style={[
            styles.description,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}>
          {item.description}
        </Animated.Text>
      </View>

      <View style={styles.bottomArea}>
        <View style={styles.paginationContainer}>
          {slides.map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.iconWrapper,
                {
                  transform: [
                    {
                      scale: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1.2],
                      }),
                    },
                  ],
                },
              ]}>
              <Image
                source={activeIndex === i ? beans.active : beans.inactive}
                style={styles.beanIcon}
              />
            </Animated.View>
          ))}
        </View>

        <Button
          title={index === slides.length - 1 ? 'Get Started' : 'Next'}
          width={width * 0.44}
          onPress={
            index === slides.length - 1 ? handleOnComplete : goToNextSlide
          }
          backgroundColor={theme.colors.primary}
          textColor={theme.colors.white}
        />
      </View>
    </SafeAreaView>
  );

  return (
    <AppIntroSlider
      ref={sliderRef}
      renderItem={renderItem}
      data={slides}
      renderPagination={() => null}
      onSlideChange={handleSlideChange}
      showSkipButton={false}
      showDoneButton={false}
      showNextButton={false}
    />
  );
};

export default OnBoarding;

const styles = StyleSheet.create({
  primaryContainer: {
    flex: 1,
    paddingHorizontal: width * 0.04,
    backgroundColor: theme.colors.tertiary,
  },

  imageWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: height * 0.08,
  },

  illustration: {
    width: width * 0.7,
    height: height * 0.3,
  },

  textContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: width * 0.06,
    justifyContent: 'center',
  },

  title: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.poppins.semiBold,
    textAlign: 'justify',
    marginBottom: height * 0.02,
    color: theme.colors.dark,
  },

  description: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.poppins.regular,
    textAlign: 'justify',
    marginBottom: height * 0.02,
    color: theme.colors.dark,
  },

  bottomArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: height * 0.04,
    gap: theme.gap(2),
  },

  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconWrapper: {
    marginHorizontal: width * 0.012,
  },

  beanIcon: {
    width: width * 0.05,
    height: height * 0.05,
    resizeMode: 'contain',
  },
});
