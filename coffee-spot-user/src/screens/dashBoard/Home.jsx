import React, {useEffect, useState, useMemo} from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import {theme} from '../../styles/theme';
import {globalStyles} from '../../styles/globalStyles';
import Header from '../../utils/customComponents/customHeader/Header';
import {useDispatch, useSelector} from 'react-redux';
import {getUser} from '../../redux/slices/userSlice';
import Feather from 'react-native-vector-icons/Feather';
import {getAllProducts} from '../../redux/slices/productSlice';
import ProductCard from '../../utils/customComponents/customCards/productCards/ProductCard';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Loader from '../../utils/customComponents/customLoader/Loader';

const {width, height} = Dimensions.get('screen');

const Home = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [greeting, setGreeting] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const user = useSelector(state => state.auth.user);
  const userProfile = useSelector(state => state.user.user);
  const products = useSelector(state => state.product.products);

  const categories = useMemo(() => {
    const categoryMap = {};
    products.forEach(product => {
      try {
        const parsedCategory = JSON.parse(product.category[0]);
        parsedCategory.forEach(cat => {
          if (!categoryMap[cat]) {
            categoryMap[cat] = {
              id: cat,
              name: cat.replace(/([A-Z])/g, ' $1').trim(),
              image: product.productImage,
            };
          }
        });
      } catch {}
    });
    return Object.values(categoryMap);
  }, [products]);

  const chunkArray = (arr, size) => {
    return Array.from({length: Math.ceil(arr.length / size)}, (_, index) =>
      arr.slice(index * size, index * size + size),
    );
  };

  useEffect(() => {
    const statusBarColor = theme.colors.primary;
    StatusBar.setBackgroundColor(statusBarColor);
    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user?.id) {
      dispatch(getUser(user.id));
      dispatch(getAllProducts());
    }
  }, [dispatch, user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const updateGreeting = () => {
    const hour = new Date().getHours();
    let newGreeting = '';
    if (hour < 12) newGreeting = 'Good Morning';
    else if (hour < 17) newGreeting = 'Good Afternoon';
    else if (hour < 20) newGreeting = 'Good Evening';
    setGreeting(newGreeting);
  };

  const handleCategoryPress = categoryId => {
    const categoryProducts = products.filter(product => {
      try {
        const parsed = JSON.parse(product.category[0]);
        return parsed.includes(categoryId);
      } catch {
        return false;
      }
    });
    navigation.navigate('CategoryProducts', {
      categoryId,
      products: chunkArray(categoryProducts, 2),
    });
  };

  return (
    <SafeAreaView
      style={[globalStyles.container, {backgroundColor: theme.colors.white}]}>
      <View style={styles.headerContainer}>
        <Header
          logo={require('../../assets/splashScreen/splash-logo.png')}
          title="CoffeeSpot"
          profile={
            userProfile?.profilePicture
              ? {uri: userProfile.profilePicture}
              : require('../../assets/placeholders/default-avatar.png')
          }
        />
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <Loader />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greetingTitle}>{greeting}!</Text>
            <Text style={styles.greetingDescription}>
              Let's get this Coffee!{' '}
              <Feather
                name={'coffee'}
                size={width * 0.044}
                color={theme.colors.primary}
              />
            </Text>
          </View>

          <View style={styles.coffeeSection}>
            <View style={styles.sectionContainer}>
              <ImageBackground
                source={require('../../assets/backgroundImages/coffee-beans-bg.jpg')}
                style={styles.sectionBackground}
                imageStyle={styles.backgroundImageStyle}>
                <LinearGradient
                  colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)']}
                  style={styles.gradientOverlay}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Coffees</Text>
                    <TouchableOpacity style={styles.seeAllButton}>
                      <Text style={styles.seeAllText}>Explore</Text>
                      <Feather
                        name="arrow-right"
                        size={16}
                        color={theme.colors.white}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.categoriesContainer}>
                    {chunkArray(categories, 2).map((row, rowIndex) => (
                      <View style={styles.categoryRow} key={rowIndex}>
                        {row.map(category => (
                          <View key={category.id} style={styles.cardWrapper}>
                            <ProductCard
                              title={category.name}
                              imageUrl={category.image}
                              onPress={() => handleCategoryPress(category.id)}
                              cardStyle={styles.elevatedCard}
                              titleStyle={styles.cardTitle}
                            />
                          </View>
                        ))}
                      </View>
                    ))}
                  </View>
                </LinearGradient>
              </ImageBackground>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  greetingContainer: {
    marginTop: height * 0.04,
    paddingHorizontal: width * 0.06,
  },

  greetingTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.poppins.semiBold,
    color: theme.colors.primary,
  },

  greetingDescription: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.poppins.medium,
    color: theme.colors.tertiary,
  },

  sectionContainer: {
    marginTop: height * 0.03,
    borderRadius: theme.borderRadius.medium,
    overflow: 'hidden',
    marginHorizontal: width * 0.014,
    elevation: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },

  sectionBackground: {
    width: '100%',
  },

  backgroundImageStyle: {
    opacity: 0.84,
  },

  gradientOverlay: {
    paddingVertical: height * 0.03,
    paddingHorizontal: width * 0.04,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: height * 0.02,
    paddingHorizontal: width * 0.02,
  },

  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.poppins.bold,
    color: theme.colors.white,
    letterSpacing: 0.5,
  },

  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: height * 0.006,
    paddingHorizontal: width * 0.034,
    borderRadius: theme.borderRadius.circle,
  },

  seeAllText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.poppins.semiBold,
    color: theme.colors.white,
    top: height * 0.002,
  },

  categoriesContainer: {
    paddingHorizontal: width * 0.01,
  },

  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: height * 0.015,
    marginTop: height * 0.015,
    gap: theme.gap(1),
  },

  elevatedCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  cardTitle: {
    color: theme.colors.tertiary,
    fontFamily: theme.typography.poppins.bold,
    fontSize: theme.typography.fontSize.md,
  },

  scrollContent: {
    paddingBottom: height * 0.1,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
