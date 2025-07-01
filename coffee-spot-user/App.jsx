import React from 'react';
import {StyleSheet, Dimensions} from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';
import Toast, {BaseToast, ErrorToast} from 'react-native-toast-message';
import {theme} from './src/styles/theme';

const {width} = Dimensions.get('screen');

const App = () => {
  const toastConfig = {
    error: props => (
      <ErrorToast
        {...props}
        style={{
          borderLeftColor: theme.colors.error, // Your error color
          backgroundColor: theme.colors.white,
          borderRadius: theme.borderRadius.medium,
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowOffset: {width: 0, height: 4},
          shadowRadius: 6,
          paddingHorizontal: width * 0.02,
        }}
        contentContainerStyle={{paddingHorizontal: width * 0.02}}
        text1Style={{
          fontSize: width * 0.04,
          fontFamily: theme.typography.fontFamilyBold,
          color: theme.colors.error,
        }}
        text2Style={{
          fontSize: width * 0.04,
          fontFamily: theme.typography.fontFamilyBold,
          color: theme.colors.error,
        }}
      />
    ),
  };

  return (
    <>
      <RootNavigator />
      <Toast config={toastConfig} />
    </>
  );
};

export default App;

const styles = StyleSheet.create({});
