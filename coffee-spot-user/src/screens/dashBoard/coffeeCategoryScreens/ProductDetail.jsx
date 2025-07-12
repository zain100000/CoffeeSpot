import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {theme} from '../../../styles/theme';
import {globalStyles} from '../../../styles/globalStyles';
import Header from '../../../utils/customComponents/customHeader/Header';
import LeftIcon from '../../../assets/icons/chevron-left.png';
import {useDispatch, useSelector} from 'react-redux';
import {addToCart} from '../../../redux/slices/cartSlice';
import Toast from 'react-native-toast-message';
import Feather from 'react-native-vector-icons/Feather';

const {width, height} = Dimensions.get('screen');

const ProductDetail = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {product} = useRoute().params;
  const userDetails = useSelector(state => state.user.user);
  const shippingFee = 50; // You can set your shipping fee here or fetch it from somewhere

  const handleAddToCart = async () => {
    try {
      const resultAction = await dispatch(addToCart({productId: product._id}));
      if (addToCart.fulfilled.match(resultAction)) {
        Toast.show({
          type: 'success',
          text1: 'Added to cart',
          text2: `${product.title} has been added successfully 👌`,
        });
      } else {
        throw new Error(resultAction.payload || 'Something went wrong');
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message,
      });
    }
  };

  const handleBuyNow = () => {
    // Create a mock cart item for direct checkout
    const cartItem = {
      product: product._id,
      title: product.title,
      description: product.description,
      unitPrice: product.price,
      quantity: 1,
      productImage: product.productImage,
    };

    // Calculate total amount
    const totalAmount = product.price + shippingFee;

    navigation.navigate('CheckOut', {
      cartItems: [cartItem], // Pass the single product as an array
      userDetails,
      totalAmount,
      shippingFee,
    });
  };

  return (
    <SafeAreaView style={[globalStyles.container, styles.primaryContainer]}>
      <View style={styles.imageContainer}>
        <Image source={{uri: product.productImage}} style={styles.image} />
      </View>
      <View style={styles.headerContainer}>
        <Header
          logo={require('../../../assets/splashScreen/splash-logo.png')}
          title={'CoffeeSpot'}
          leftIcon={LeftIcon}
          onPressLeft={() => navigation.goBack()}
          transparent
        />
      </View>

      <View style={styles.bottomSheet}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{product.title}</Text>
          <Text style={styles.description}>{product.description}</Text>

          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>Category</Text>
            <Text style={styles.infoValue}>
              {JSON.parse(product.category[0]).join(', ')}
            </Text>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>Stock</Text>
            <Text
              style={[
                styles.infoValue,
                {
                  color:
                    product.stock > 0
                      ? theme.colors.success
                      : theme.colors.error,
                },
              ]}>
              {product.stock > 0
                ? `${product.stock} available`
                : 'Out of stock'}
            </Text>
          </View>

          <View style={styles.footerContainer}>
            <Text style={styles.price}>PKR {product.price}</Text>

            <View style={styles.btnContainer}>
              <TouchableOpacity
                onPress={handleAddToCart}
                style={styles.iconContainer}>
                <Feather
                  name="shopping-bag"
                  size={width * 0.06}
                  color={theme.colors.tertiary}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleBuyNow} // 👈 Updated to use handleBuyNow
                style={styles.iconContainer}>
                <Feather
                  name="credit-card"
                  size={width * 0.06}
                  color={theme.colors.tertiary}
                />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default ProductDetail;

const styles = StyleSheet.create({
  primaryContainer: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },

  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },

  imageContainer: {
    height: height * 0.5,
    width: '100%',
  },

  image: {
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: theme.borderRadius.large,
    borderBottomRightRadius: theme.borderRadius.large,
  },

  bottomSheet: {
    flex: 1,
    backgroundColor: theme.colors.white,
    paddingHorizontal: width * 0.04,
    paddingTop: height * 0.04,
    borderTopLeftRadius: theme.borderRadius.large,
    borderTopRightRadius: theme.borderRadius.large,
    marginTop: -height * 0.02,
  },

  title: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.poppins.bold,
    color: theme.colors.primary,
    marginBottom: height * 0.01,
  },

  description: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.poppins.regular,
    color: theme.colors.tertiary,
    lineHeight: theme.typography.lineHeight.md,
    marginBottom: height * 0.01,
  },

  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: height * 0.012,
    marginBottom: height * 0.01,
  },

  infoLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary,
    fontFamily: theme.typography.poppins.medium,
  },

  infoValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    fontFamily: theme.typography.poppins.medium,
  },

  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: height * 0.07,
    paddingBottom: height * 0.02,
    justifyContent: 'space-between',
  },

  price: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.poppins.bold,
    color: theme.colors.primary,
    top: height * 0.006,
  },

  btnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.gap(2),
  },

  iconContainer: {
    backgroundColor: theme.colors.primary,
    padding: height * 0.014,
    borderRadius: theme.borderRadius.circle,
  },
});
