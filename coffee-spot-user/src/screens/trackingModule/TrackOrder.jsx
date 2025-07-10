import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {globalStyles} from '../../styles/globalStyles';
import LeftIcon from '../../assets/icons/chevron-left.png';
import {theme} from '../../styles/theme';
import Header from '../../utils/customComponents/customHeader/Header';

const {width, height} = Dimensions.get('screen');

const TrackingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {orderId} = route.params;

  const statusItems = [
    {id: 1, label: 'Order has been received', completed: false},
    {id: 2, label: 'Prepare your order', completed: false},
    {id: 3, label: 'Your order is complete!', completed: true},
  ];

  return (
    <SafeAreaView style={[globalStyles.container, styles.container]}>
      <View style={styles.headerContainer}>
        <Header
          logo={require('../../assets/splashScreen/splash-logo.png')}
          title={'CoffeeSpot'}
          leftIcon={LeftIcon}
          onPressLeft={() => navigation.goBack()}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles.trackingContainer}>
          <Text style={styles.title}>Tracking order</Text>

          <View style={styles.statusContainer}>
            {statusItems.map(item => (
              <View key={item.id} style={styles.statusItem}>
                <View style={styles.checkboxContainer}>
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      item.completed && styles.checkboxChecked,
                    ]}>
                    {item.completed && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                </View>
                <Text
                  style={[
                    styles.statusText,
                    item.completed && styles.statusTextCompleted,
                  ]}>
                  {item.label}
                </Text>
              </View>
            ))}
            <Text style={styles.pickupText}>Meet us at the pickup area.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TrackingScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: height * 0.1,
  },
  headerContainer: {
    marginBottom: height * 0.02,
  },
  trackingContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.large,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    margin: height * 0.02,
    padding: height * 0.03,
  },
  title: {
    fontSize: theme.typography.fontSize.xxl,
    fontFamily: theme.typography.poppins.bold,
    color: theme.colors.primary,
    marginBottom: height * 0.03,
    textAlign: 'center',
  },
  statusContainer: {
    marginTop: height * 0.02,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.02,
  },
  checkboxContainer: {
    marginRight: width * 0.04,
  },
  checkbox: {
    width: width * 0.06,
    height: width * 0.06,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.small,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
  },
  checkmark: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
  },
  statusText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.poppins.regular,
    color: theme.colors.tertiary,
    flex: 1,
  },
  statusTextCompleted: {
    textDecorationLine: 'line-through',
    color: theme.colors.primary,
  },
  pickupText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.poppins.regular,
    color: theme.colors.tertiary,
    marginTop: height * 0.01,
    marginLeft: width * 0.1,
  },
});
