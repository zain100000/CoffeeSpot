import React, {useRef, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  Text,
  Animated,
  Easing,
} from 'react-native';
import {theme} from '../../../styles/theme';

const {width, height} = Dimensions.get('screen');

const BottomSheet = ({visible, onClose, cartItems}) => {
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const totalAmount = cartItems.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0,
  );

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height * 0.4,
          duration: 300,
          useNativeDriver: false,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 250,
          useNativeDriver: false,
          easing: Easing.in(Easing.ease),
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal
      animationType="none"
      transparent
      visible={visible}
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, {opacity: fadeAnim}]} />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.sheet, {top: slideAnim}]}>
        <View style={styles.container}>
          <Text style={styles.title}>Order Summary</Text>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Cart Items</Text>
            {cartItems.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <Text style={styles.itemText}>{item.title}</Text>
                <Text style={styles.itemPrice}>
                  PKR {item.unitPrice.toLocaleString()} × {item.quantity}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              PKR {totalAmount.toLocaleString()}
            </Text>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
};

export default BottomSheet;

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },

  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: height * 0.6,
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.borderRadius.large,
    borderTopRightRadius: theme.borderRadius.large,
    paddingTop: height * 0.03,
    paddingHorizontal: width * 0.05,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },

  container: {
    flex: 1,
    justifyContent: 'space-between',
  },

  title: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.poppins.semiBold,
    color: theme.colors.dark,
  },

  section: {
    marginBottom: height * 0.2,
  },

  sectionLabel: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.poppins.medium,
    color: theme.colors.gray700,
    marginBottom: height * 0.015,
  },

  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: height * 0.012,
  },

  itemText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.poppins.medium,
    color: theme.colors.black,
    flex: 1,
  },

  itemPrice: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.poppins.medium,
    color: theme.colors.gray600,
  },

  divider: {
    height: 1,
    backgroundColor: theme.colors.gray,
    marginVertical: height * 0.015,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  totalLabel: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.poppins.semiBold,
    color: theme.colors.dark,
  },

  totalValue: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.poppins.semiBold,
    color: theme.colors.primary,
  },
});
