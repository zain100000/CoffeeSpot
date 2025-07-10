import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  ScrollView,
  Animated,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {theme} from '../../../styles/theme';
import Header from '../../../utils/customComponents/customHeader/Header';
import ProductCard from '../../../utils/customComponents/customCards/productCards/ProductCard';
import LeftIcon from '../../../assets/icons/chevron-left.png';
import InputField from '../../../utils/customComponents/customInputField/InputField';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Feather from 'react-native-vector-icons/Feather';
import Loader from '../../../utils/customComponents/customLoader/Loader';

const {width, height} = Dimensions.get('screen');

const CoffeeCategory = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {categoryId, products} = route.params;

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [isLoading, setIsLoading] = useState(true);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const noProductFadeAnim = useRef(new Animated.Value(0)).current;
  const noProductBounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start();

      // Start no product animation if no products
      if (products.length === 0) {
        startNoProductAnimation();
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = products
        .map(row =>
          row.filter(product => product.title.toLowerCase().includes(query)),
        )
        .filter(row => row.length > 0);
      setFilteredProducts(filtered);

      // Start animation when search results are empty
      if (filtered.length === 0) {
        startNoProductAnimation();
      }
    }
  }, [searchQuery, products]);

  const startNoProductAnimation = () => {
    Animated.parallel([
      Animated.timing(noProductFadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(noProductBounceAnim, {
            toValue: 10,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(noProductBounceAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ),
    ]).start();
  };

  const handleProductPress = product => {
    navigation.navigate('ProductDetail', {product});
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerWrapper}>
        <Header
          logo={require('../../../assets/splashScreen/splash-logo.png')}
          title={categoryId.replace(/([A-Z])/g, ' $1').trim()}
          leftIcon={LeftIcon}
          onPressLeft={() => navigation.goBack()}
        />
      </View>

      <Animated.View
        style={[
          styles.searchWrapper,
          {opacity: fadeAnim, transform: [{scale: scaleAnim}]},
        ]}>
        <InputField
          placeholder="Search"
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={
            <Feather
              name={'search'}
              size={width * 0.044}
              color={theme.colors.primary}
            />
          }
        />
      </Animated.View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <Loader />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.row}>
                {row.map((product, index) => (
                  <View key={product.id || index} style={styles.cardWrapper}>
                    <ProductCard
                      title={product.title}
                      imageUrl={product.productImage}
                      price={product.price}
                      cardStyle={styles.card}
                      titleStyle={styles.cardTitle}
                      onPress={() => handleProductPress(product)}
                    />
                  </View>
                ))}
              </View>
            ))
          ) : (
            <Animated.View
              style={[
                styles.noProductView,
                {
                  opacity: noProductFadeAnim,
                  transform: [{translateY: noProductBounceAnim}],
                },
              ]}>
              <FontAwesome6
                name={'box-open'}
                size={width * 0.28}
                color={theme.colors.primary}
              />
              <Text style={styles.noProductTitle}>No Product Found!</Text>
            </Animated.View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default CoffeeCategory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  headerWrapper: {
    marginBottom: height * 0.015,
    paddingBottom: height * 0.01,
  },

  searchWrapper: {
    marginHorizontal: width * 0.024,
    marginBottom: height * 0.015,
  },

  scrollContainer: {
    paddingHorizontal: width * 0.045,
    paddingBottom: height * 0.1,
    flexGrow: 1,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: height * 0.025,
    gap: width * 0.04,
  },

  cardWrapper: {
    flex: 1,
  },

  card: {
    backgroundColor: theme.colors.white,
    borderRadius: 18,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },

  cardTitle: {
    fontFamily: theme.typography.poppins.semiBold,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.primary,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  noProductView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.gap(2),
  },

  noProductTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.poppins.semiBold,
    color: theme.colors.primary,
  },
});
