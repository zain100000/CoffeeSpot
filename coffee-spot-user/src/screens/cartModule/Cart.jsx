import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  StatusBar,
  SafeAreaView,
  FlatList,
  Text,
  Animated,
  RefreshControl,
  ScrollView,
} from 'react-native';
import {theme} from '../../styles/theme';
import {globalStyles} from '../../styles/globalStyles';
import Header from '../../utils/customComponents/customHeader/Header';
import CartCard from '../../utils/customComponents/customCards/cartCards/CartCard';
import {useDispatch, useSelector} from 'react-redux';
import {
  getAllCartItems,
  addToCart,
  removeFromCart,
  removeAllFromCart,
  updateCartItem,
} from '../../redux/slices/cartSlice';
import Loader from '../../utils/customComponents/customLoader/Loader';
import Feather from 'react-native-vector-icons/Feather';
import Button from '../../utils/customComponents/customButton/Button';
import {useNavigation} from '@react-navigation/native';
import LeftIcon from '../../assets/icons/chevron-left.png';
import LinearGradient from 'react-native-linear-gradient';

const {width, height} = Dimensions.get('screen');

const Cart = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {cartItems, loading} = useSelector(state => state.cart);
  const [removingAll, setRemovingAll] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fadeAnim = useState(new Animated.Value(0))[0];
  const bounceAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const statusBarColor = theme.colors.primary;
    StatusBar.setBackgroundColor(statusBarColor);
    dispatch(getAllCartItems());
  }, []);

  useEffect(() => {
    if (!loading && cartItems?.length === 0 && removingAll) {
      setRemovingAll(false);
    }
    if (!loading && cartItems?.length === 0) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(bounceAnim, {
              toValue: 10,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(bounceAnim, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
        ),
      ]).start();
    }
  }, [loading, cartItems]);

  const handleAddToCart = async productId => {
    dispatch(updateCartItem({productId, quantity: 1}));
    await dispatch(addToCart({productId}));
    dispatch(getAllCartItems());
  };

  const handleRemoveFromCart = async productId => {
    const item = cartItems.find(item => item.productId._id === productId);
    if (item.quantity > 1) {
      dispatch(updateCartItem({productId, quantity: -1}));
    }
    await dispatch(removeFromCart({productId}));
    dispatch(getAllCartItems());
  };

  const handleCompleteRemove = async productId => {
    setRemovingAll(true);
    await dispatch(removeAllFromCart({productId}));
    dispatch(getAllCartItems());
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(getAllCartItems());
    setRefreshing(false);
  };

  const shippingFee = 50;

  const handleNavigateCheckOut = () => {
    if (!cartItems.length) return;

    const formattedItems = cartItems.map(item => ({
      product: item.productId._id,
      title: item.productId.title,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    }));

    navigation.navigate('CheckOut', {
      userDetails: {
        _id: cartItems[0].userId._id,
        userName: cartItems[0].userId.userName,
        phone: cartItems[0].userId.phone,
        address: cartItems[0].userId.address,
      },
      cartItems: formattedItems,
      totalAmount: itemTotal,
      shippingFee,
      totalPayment: totalAmount,
    });
  };

  const itemTotal = Array.isArray(cartItems)
    ? cartItems.reduce(
        (sum, item) => sum + (item?.productId?.price || 0) * item.quantity,
        0,
      )
    : 0;

  const totalAmount = itemTotal + shippingFee;

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.tertiary]}
      style={styles.gradientBackground}>
      <SafeAreaView style={globalStyles.container}>
        <View style={styles.headerContainer}>
          <Header
            logo={require('../../assets/splashScreen/splash-logo.png')}
            title="Shopping Cart"            
          />
        </View>

        {loading && !removingAll ? (
          <View style={styles.loaderContainer}>
            <Loader />
          </View>
        ) : cartItems?.length > 0 ? (
          <FlatList
            data={cartItems}
            keyExtractor={item => item._id.toString()}
            renderItem={({item}) => (
              <CartCard
                title={item.productId.title}
                price={item.unitPrice}
                imageUrl={item.productId.productImage}
                onRemove={() => handleCompleteRemove(item.productId._id)}
                onIncrease={() => handleAddToCart(item.productId._id)}
                onDecrease={() => handleRemoveFromCart(item.productId._id)}
                quantity={item.quantity}
              />
            )}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
          />
        ) : (
          <ScrollView
            contentContainerStyle={styles.emptyContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }>
            <Animated.View
              style={[
                {opacity: fadeAnim, transform: [{translateY: bounceAnim}]},
              ]}>
              <View style={{alignSelf: 'center'}}>
                <Feather
                  name="shopping-cart"
                  size={width * 0.28}
                  color={theme.colors.white}
                />
              </View>
              <Text style={styles.emptyText}>Cart Is Empty</Text>
            </Animated.View>
          </ScrollView>
        )}

        <View style={styles.fixedBottomContainer}>
          <View style={styles.bottomContainer}>
            <View style={styles.priceContainer}>
              <Text style={styles.titleText}>Price</Text>
              <Text style={styles.amountText}>PKR {itemTotal}</Text>
            </View>

            <View style={styles.shippingFeeContainer}>
              <Text style={styles.titleText}>Shipping</Text>
              <Text style={styles.amountText}>PKR {shippingFee}</Text>
            </View>
          </View>

          <View style={styles.btnContainer}>
            <Button
              title="Checkout"
              backgroundColor={
                cartItems.length ? theme.colors.primary : theme.colors.gray
              }
              textColor={theme.colors.white}
              onPress={handleNavigateCheckOut}
              disabled={!cartItems.length}
            />
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default Cart;

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },

  primaryContainer: {
    flex: 1,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: height * 0.2,
    gap: theme.gap(2),
  },

  emptyText: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.poppins.semiBold,
    color: theme.colors.white,
    marginTop: height * 0.02,
  },

  listContainer: {
    paddingHorizontal: width * 0.04,
    paddingBottom: height * 0.02,
  },

  fixedBottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.white,
    paddingVertical: height * 0.1,
    paddingHorizontal: height * 0.01,
    borderTopLeftRadius: theme.borderRadius.large,
    borderTopRightRadius: theme.borderRadius.large,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },

  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    top: -height * 0.06,
    marginBottom: height * 0.02,
    gap: theme.gap(4),
  },

  shippingFeeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    top: -height * 0.06,
    gap: theme.gap(4),
  },

  titleText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.poppins.regular,
    color: theme.colors.primary,
  },

  amountText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.poppins.regular,
    color: theme.colors.black,
  },
});
