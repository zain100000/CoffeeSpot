import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import {theme} from '../../styles/theme';
import {globalStyles} from '../../styles/globalStyles';
import Header from '../../utils/customComponents/customHeader/Header';
import Feather from 'react-native-vector-icons/Feather';
import {useRoute, useNavigation} from '@react-navigation/native';
import Button from '../../utils/customComponents/customButton/Button';
import {useDispatch} from 'react-redux';
import Toast from 'react-native-toast-message';
import {placeOrder} from '../../redux/slices/orderSlice';
import {removeAllFromCart} from '../../redux/slices/cartSlice';
import LeftIcon from '../../assets/icons/chevron-left.png';
import BottomSheet from '../../utils/customComponents/customBottomSheet/BottomSheet';
import CustomModal from '../../utils/customModals/CustomModal';

const {width, height} = Dimensions.get('screen');

const paymentIcons = {
  JazzCash: require('../../assets/paymentMethodIcons/jazzcash-payment-method.png'),
  EasyPaisa: require('../../assets/paymentMethodIcons/easypaisa-payment-method.png'),
  CashOnDelivery: require('../../assets/paymentMethodIcons/cash-on-delivery-payment-method.png'),
};

const CheckOut = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {cartItems, userDetails, totalAmount, shippingFee} = route.params;
  const [selectedMethod, setSelectedMethod] = useState('JazzCash');
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [showPaymentInfoModal, setShowPaymentInfoModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const paymentAnim = new Animated.Value(0);

  const paymentMethods = [
    {
      id: 'JazzCash',
      name: 'JazzCash (+92-3090207411)',
      icon: paymentIcons.JazzCash,
    },
    {
      id: 'EasyPaisa',
      name: 'EasyPaisa (+92-3147718070)',
      icon: paymentIcons.EasyPaisa,
    },
    {
      id: 'CashOnDelivery',
      name: 'Cash on Delivery',
      icon: paymentIcons.CashOnDelivery,
    },
  ];

  const handlePlaceOrder = async () => {
    console.log('handlePlaceOrder: Starting order process...');
    setLoading(true);

    const orderItems = cartItems.map(item => ({
      productId: item.product,
      quantity: item.quantity,
    }));

    const subtotal = cartItems.reduce(
      (acc, item) => acc + item.unitPrice * item.quantity,
      0,
    );

    const recalculatedTotal = subtotal + Number(shippingFee);

    const orderData = {
      items: orderItems,
      shippingAddress: userDetails.address,
      shippingFee: shippingFee.toString(),
      totalAmount: recalculatedTotal,
      paymentMethod: selectedMethod,
    };

    console.log('handlePlaceOrder: Prepared orderData:', orderData);

    try {
      const resultAction = await dispatch(placeOrder(orderData));
      console.log('handlePlaceOrder: resultAction:', resultAction);

      if (placeOrder.fulfilled.match(resultAction)) {
        const placedOrder = resultAction.payload.order; // <-- Note the change here to access .order

        Toast.show({
          type: 'success',
          text1: 'Order Successful!',
          text2: 'Your order has been placed.',
        });

        // Clear cart
        for (const item of cartItems) {
          await dispatch(removeAllFromCart({productId: item.product}));
        }

        // Format receipt data
        const date = new Date(placedOrder.placedAt);
        const formattedDate = date.toLocaleDateString();
        const formattedTime = date.toLocaleTimeString();

        const receiptData = {
          orderId: placedOrder._id,
          date: formattedDate,
          time: formattedTime,
          items: cartItems.map(item => ({
            name: item.title || 'Product',
            description: item.description || '',
            quantity: item.quantity,
            price: item.unitPrice || 0,
          })),
          shippingAddress: placedOrder.shippingAddress,
          paymentSummary: {
            subtotal: subtotal,
            shippingFee: placedOrder.shippingFee, // Changed from just 'shipping' to 'shippingFee'
            total: placedOrder.totalAmount,
            paymentMethod: placedOrder.paymentMethod,
            paymentStatus: placedOrder.payment,
            status: placedOrder.status,
            deliveryTime: '20 Minutes',
          },
        };

        console.log('handlePlaceOrder: Prepared receiptData:', receiptData); // <-- Add this for debugging

        // Navigate with receipt data
        navigation.navigate('Receipt', {receiptData});
      } else {
        throw new Error(
          resultAction.payload?.message || 'Something went wrong',
        );
      }
    } catch (error) {
      console.log('handlePlaceOrder: Caught error:', error.message);
      Toast.show({
        type: 'error',
        text1: 'Order Failed',
        text2: error?.message || 'Please try again.',
      });
    } finally {
      setLoading(false);
      console.log('handlePlaceOrder: Finished order process.');
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );

  return (
    <SafeAreaView style={globalStyles.container}>
      <Header
        logo={require('../../assets/splashScreen/splash-logo.png')}
        title="Coffee Spot"
        leftIcon={LeftIcon}
        onPressLeft={() => navigation.goBack()}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather
              name="truck"
              size={width * 0.06}
              color={theme.colors.primary}
            />
            <Text style={styles.sectionTitle}>Delivery To</Text>
          </View>
          <View style={styles.deliveryInfo}>
            <View style={styles.iconContainer}>
              <Feather
                name="map-pin"
                size={width * 0.06}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.addressContainer}>
              <Text style={styles.addressText}>{userDetails.address}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather
              name="credit-card"
              size={width * 0.06}
              color={theme.colors.primary}
            />
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => setShowPaymentInfoModal(true)}>
              <Feather
                name="info"
                size={width * 0.06}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </View>
          <Animated.View style={styles.paymentMethods}>
            {paymentMethods.map(method => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethod,
                  selectedMethod === method.id && styles.selectedPaymentMethod,
                ]}
                onPress={() => {
                  Animated.timing(paymentAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                  }).start(() => {
                    setSelectedMethod(method.id);
                    paymentAnim.setValue(0);
                  });
                }}>
                <Image
                  source={method.icon}
                  style={styles.paymentIcon}
                  resizeMode="contain"
                />
                <Text style={styles.paymentMethodText}>{method.name}</Text>
                {selectedMethod === method.id && (
                  <Feather
                    name="check-circle"
                    size={width * 0.06}
                    color={theme.colors.primary}
                    style={styles.checkIcon}
                  />
                )}
              </TouchableOpacity>
            ))}
          </Animated.View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather
              name="clipboard"
              size={width * 0.06}
              color={theme.colors.primary}
            />
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => setIsSheetVisible(true)}>
              <Feather
                name="info"
                size={width * 0.06}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.orderSummary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>PKR {subtotal}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>PKR {shippingFee}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                PKR {subtotal + Number(shippingFee)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          onPress={handlePlaceOrder}
          title={loading ? 'Placing Order...' : 'Place Order'}
          backgroundColor={theme.colors.primary}
          textColor={theme.colors.white}
          disabled={!cartItems.length || loading}
          width={width * 0.94}
        />
      </View>

      <CustomModal
        visible={showPaymentInfoModal}
        onClose={() => setShowPaymentInfoModal(false)}
        title="Payment Method Information"
        contentList={paymentMethods}
      />

      <BottomSheet
        visible={isSheetVisible}
        onClose={() => {
          setIsSheetVisible(false);
        }}
        cartItems={cartItems}
      />
    </SafeAreaView>
  );
};

export default CheckOut;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: height * 0.02,
    backgroundColor: theme.colors.white,
  },

  section: {
    marginBottom: height * 0.03,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.01,
    gap: theme.gap(1),
  },

  sectionTitle: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.poppins.bold,
    color: theme.colors.dark,
  },

  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: height * 0.015,
    backgroundColor: '#D9CBB5',
    borderRadius: theme.borderRadius.large,
  },

  iconContainer: {
    backgroundColor: '#C1A97B',
    padding: height * 0.01,
    borderRadius: theme.borderRadius.circle,
  },

  addressContainer: {
    flex: 1,
    marginLeft: width * 0.04,
  },

  addressText: {
    fontSize: width * 0.04,
    fontFamily: theme.typography.poppins.semiBold,
    color: theme.colors.dark,
  },

  paymentMethods: {
    borderRadius: theme.borderRadius.medium,
    overflow: 'hidden',
  },

  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: height * 0.018,
    backgroundColor: '#F7EFD2',
    marginBottom: height * 0.012,
    borderRadius: theme.borderRadius.large,
  },

  selectedPaymentMethod: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: '#E9D8A6',
  },

  paymentIcon: {
    width: width * 0.08,
    height: height * 0.04,
  },

  paymentMethodText: {
    marginLeft: width * 0.04,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.poppins.medium,
    color: theme.colors.dark,
    flex: 1,
  },

  checkIcon: {
    marginLeft: 'auto',
  },

  orderSummary: {
    backgroundColor: '#FFF2DC',
    borderRadius: theme.borderRadius.large,
    padding: height * 0.015,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: height * 0.008,
  },

  summaryLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.poppins.medium,
    color: '#7B6F5E',
  },

  summaryValue: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.poppins.medium,
    color: '#40342D',
  },

  divider: {
    height: 1,
    backgroundColor: theme.colors.primary,
    marginVertical: height * 0.012,
  },

  totalLabel: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.poppins.bold,
    color: '#40342D',
  },

  totalValue: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.poppins.medium,
    color: theme.colors.primary,
  },

  footer: {
    padding: height * 0.01,
    borderTopColor: theme.colors.tertiary,
    borderTopWidth: 1,
    alignItems: 'center',
    backgroundColor: '#FDF6EC',
  },
});
