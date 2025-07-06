import React, {useEffect} from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import {theme} from '../../styles/theme';
import {globalStyles} from '../../styles/globalStyles';
import Header from '../../utils/customComponents/customHeader/Header';
import {useDispatch, useSelector} from 'react-redux';
import {getUser} from '../../redux/slices/userSlice';

const {width, height} = Dimensions.get('screen');

const Home = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const userProfile = useSelector(state => state.user.user);

  useEffect(() => {
    const statusBarColor = theme.colors.primary;
    StatusBar.setBackgroundColor(statusBarColor);
  }, []);

  useEffect(() => {
    if (user?.id) {
      dispatch(getUser(user.id));
    }
  }, [dispatch, user]);

  return (
    <SafeAreaView
      style={[
        globalStyles.container,
        styles.primaryContainer,
        {
          backgroundColor: theme.colors.white,
        },
      ]}>
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
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({});
