// src/components/Header.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { pallette } from '../helpers/colors';
import { medium, bold } from '../helpers/fonts';
import HelpScreen from '../help screens/help';
import AccountTabs from '../accounts/account';
import HomeScreen from '../home screens/home';

const { width: w, height: h } = Dimensions.get('window');

const MainHeader = () => {
  const navigation = useNavigation();

  const handleHelpPress = () => {
    navigation.navigate(HelpScreen);
  };

  const handleProfilePress = () => {
    navigation.navigate(AccountTabs);
  };

  const handleLogoPress = () => {
    navigation.navigate(HomeScreen);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Logo and Brand */}
        <TouchableOpacity 
          style={styles.brandContainer}
          onPress={handleLogoPress}
          activeOpacity={0.7}
        >
          <Image
            source={require('../../Asserts/newsfulllogo.png')}
            style={styles.logo}
          />
          <View style={styles.brandTextContainer}>
            <Text style={styles.brandName}>NewsNow</Text>
            <Text style={styles.brandTagline}>Stay Informed • Stay Ahead</Text>
          </View>
        </TouchableOpacity>

        {/* Action Icons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleHelpPress}
            activeOpacity={0.6}
          >
            <View style={[styles.iconWrapper, styles.helpIconWrapper]}>
              <Icon name="help-outline" size={20} color={pallette.white} />
            </View>
            <Text style={styles.actionLabel}>Help</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleProfilePress}
            activeOpacity={0.6}
          >
            <View style={[styles.iconWrapper, styles.profileIconWrapper]}>
              <Icon name="person-outline" size={20} color={pallette.white} />
            </View>
            <Text style={styles.actionLabel}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: pallette.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    shadowColor: pallette.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: h * 0.08,
    backgroundColor: pallette.white,
    paddingHorizontal: w * 0.04,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: w * 0.1,
    height: w * 0.1,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
  },
  brandTextContainer: {
    marginLeft: 12,
  },
  brandName: {
    fontSize: 18,
    fontFamily: bold,
    color: pallette.primary,
    letterSpacing: 0.3,
    fontWeight: '700',
  },
  brandTagline: {
    fontSize: 11,
    fontFamily: medium,
    color: pallette.grey,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    marginLeft: 16,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  helpIconWrapper: {
    backgroundColor: '#4CAF50', // Green
  },
  profileIconWrapper: {
    backgroundColor: '#FF6B6B', // Coral red
  },
  actionLabel: {
    fontSize: 10,
    fontFamily: medium,
    color: '#666',
    fontWeight: '500',
  },
});

export default MainHeader;