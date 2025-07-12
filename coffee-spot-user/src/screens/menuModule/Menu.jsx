import React, {useEffect, useState, useRef} from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Animated,
  Text,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {getAllProducts} from '../../redux/slices/productSlice';
import {theme} from '../../styles/theme';
import {globalStyles} from '../../styles/globalStyles';
import Header from '../../utils/customComponents/customHeader/Header';
import ProductCard from '../../utils/customComponents/customCards/productCards/ProductCard';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import InputField from '../../utils/customComponents/customInputField/InputField';
import {useNavigation} from '@react-navigation/native';
import Loader from '../../utils/customComponents/customLoader/Loader';
import LinearGradient from 'react-native-linear-gradient';

const {width, height} = Dimensions.get('screen');

const Menu = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const products = useSelector(state => state.product.products);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const noProductFadeAnim = useRef(new Animated.Value(0)).current;
  const noProductBounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    StatusBar.setBackgroundColor(theme.colors.primary);
    dispatch(getAllProducts());
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
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
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  useEffect(() => {
    if (!loading && filteredProducts.length === 0) {
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
    }
  }, [filteredProducts, loading]);

  const chunkArray = (arr, size) => {
    return Array.from({length: Math.ceil(arr.length / size)}, (_, index) =>
      arr.slice(index * size, index * size + size),
    );
  };

  const handleProductPress = product => {
    navigation.navigate('Product_Detail', {product});
  };

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.tertiary]}
      style={styles.gradient}>
      <SafeAreaView style={globalStyles.container}>
        <View style={styles.headerContainer}>
          <Header
            logo={require('../../assets/splashScreen/splash-logo.png')}
            title="Menu"
          />
        </View>

        <Animated.View
          style={[
            styles.searchContainer,
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

        {loading ? (
          <View style={styles.loaderContainer}>
            <Loader />
          </View>
        ) : filteredProducts.length > 0 ? (
          <Animated.View
            style={{
              flex: 1,
              opacity: fadeAnim,
              transform: [{scale: scaleAnim}],
            }}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContainer}>
              <View style={styles.productsContainer}>
                {chunkArray(filteredProducts, 2).map((row, rowIndex) => (
                  <View style={styles.productRow} key={rowIndex}>
                    {row.map(product => (
                      <View key={product.id} style={styles.cardWrapper}>
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
                ))}
              </View>
            </ScrollView>
          </Animated.View>
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
              color={theme.colors.white}
            />
            <Text style={styles.noProductTitle}>Not available!</Text>
          </Animated.View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

export default Menu;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },

  searchContainer: {
    marginHorizontal: width * 0.024,
    marginBottom: height * 0.015,
  },

  scrollContainer: {
    paddingHorizontal: width * 0.045,
    paddingBottom: height * 0.1,
    flexGrow: 1,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  productsContainer: {
    flexDirection: 'column',
  },

  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: height * 0.025,
  },

  cardWrapper: {
    flex: 1,
    marginHorizontal: width * 0.01,
  },

  card: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },

  cardTitle: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.poppins.semiBold,
    color: theme.colors.tertiary,
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
    color: theme.colors.white,
  },
});
