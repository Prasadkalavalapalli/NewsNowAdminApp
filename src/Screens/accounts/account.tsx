import React, { useEffect } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from "@react-navigation/native";
import { useDispatch, useSelector } from 'react-redux';

import { w } from "../../constants/dimensions";
import { pallette } from "../helpers/colors";

// import { getUserDetails, logout } from '../../redux/AuthSlice';
// import { useAppContext } from '../../contexts/app-context';
import { ID } from '../../constants/dimensions';
import { useAppContext } from "../../Store/contexts/app-context";
import LoginScreen from "../login screens/login-screen";
import Icon from "react-native-vector-icons/MaterialIcons";
import Header from "../helpers/header";
import ReporterList from "../Reporter Screens/ReporterList";
import HelpScreen from "../help screens/help";
import PrivacyPolicy from "./PrivacyPolicy";
import AboutNewsNow from "./AboutNewsNow";
import { logoutUser } from "../../Store/redux/AuthSlice";

/**
 * Interface for menu item configuration
 */
interface MenuItem {
  id: string;
  title: string;
  icon: string;
  onPress: () => void;
  gap?: boolean;
}

/**
 * Interface for component props
 */
interface AccountTabsProps {
  navigation: any;
}

/**
 * Account Tabs Component
 * 
 * Displays user profile information and navigation menu for account-related features
 * including bookings, vehicles, address, profile, and settings.
 */
const AccountTabs: React.FC<AccountTabsProps> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { logout: contextLogout,user } = useAppContext();
  // Get user data from Redux store
 
  // const { contextState } = useAppContext();
  const userId  =user?.id;

  /**
   * Navigation menu items configuration
   */
  const menuItems: MenuItem[] = [
    // { 
    //   id: "1", 
    //   title: "My Bookings", 
    //   icon: "calendar-check", 
    //   onPress: () => navigation.navigate()
    // },
    // { 
    //   id: "2", 
    //   title: "Favourite Stations", 
    //   icon: "heart", 
    //   onPress: () =>nav(navigation, strings.favstations) ,  
     
    // },
    // { 
    //   id: "3", 
    //   title: "My Vehicles", 
    //   icon: "car-alt", 
    //   onPress: () => nav(navigation, strings.devices) 
    // },
    // { 
    //   id: "4", 
    //   title: "My Address", 
    //   icon: "map-marker-alt", 
    //   onPress: () => nav(navigation, strings.address)
    // },
    // { 
    //   id: "5", 
    //   title: "Profile", 
    //   icon: "user-alt", 
    //   onPress: () => nav(navigation, strings.profile, { from: 'account' }) 
    // },
    { 
      id: "6", 
      title: "Reporters", 
      icon: "credit-card", 
      onPress: () => navigation.navigate(ReporterList)
      
    },
    { 
      id: "7", 
      title: "Help Center", 
      icon: "headset", 
      onPress: () => navigation.navigate(HelpScreen) 
    },
    { 
      id: "8", 
      title: "Privacy Policy", 
      icon: "clipboard-list", 
      onPress: () => navigation.navigate(PrivacyPolicy) 
    },
    { 
      id: "9", 
      title: "About Evya", 
      icon: "info-circle", 
      onPress: () => navigation.navigate(AboutNewsNow)
     
    },
  ];

  /**
   * Fetch user details when component mounts or userId changes
   */
  useEffect(() => {
    if (userId && (!user || Object.keys(user).length === 0)) {
      // dispatch(getUserDetails(userId));
    }
  }, [userId, user, dispatch]);

  /**
   * Handle user logout process
   * Clears storage, resets state, and navigates to landing page
   */
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem(ID);
      dispatch(logoutUser());
      await contextLogout();
      
      setTimeout(() => {
        navigation.navigate(LoginScreen)
      }, 100);
      
    } catch (error) {
        navigation.navigate(LoginScreen);
    }
  };

  /**
   * Get display data for user profile section
   */
  const getDisplayData = () => {
    if (!user) {
      return { username: "Guest User", mobileNumber: "" };
    }

    const username = user.username || user.name || "Guest User";
    const mobileNumber = user.mobileNumber || user.phone || user.email||'';

    return { username, mobileNumber };
  };

  const { username, mobileNumber } = getDisplayData();

  return (

     <View style={styles.container}>
       <Header 
          title="Account"
          onback={navigation.goBack}
          active={1}
          onSkip={() => {}}
          skippable={false}
          hastitle={true}
        />
    {/* <View style={styles.container}> */}
      {/* Profile Section */}
      <TouchableOpacity 
        style={styles.profileSection} 
        onPress={() =>navigation.navigate()}
      >
        <View style={styles.profileImage}> 
           <Icon name="account-circle" size={82} color={pallette.primary}   />
        </View>
       
        {/* <Image 
          source={require('../../assets/images/account/avatar.png')} 
          style={styles.profileImage} 
        /> */}
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{username}</Text>
          <Text style={styles.phoneNumber}>
            {mobileNumber ? `+91 ${mobileNumber}` : "Add phone number"}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </TouchableOpacity>

      {/* Navigation Menu List */}
      <View style={styles.menuList}>
        {menuItems.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={[
              styles.menuItem, 
              { marginBottom: item.gap ? 20 : 8 }
            ]} 
            onPress={item.onPress}
          >
            <FontAwesome5 
              name={item.icon} 
              size={18} 
              color="#444" 
              style={styles.menuIcon} 
            />
            <Text style={styles.menuText}>{item.title}</Text>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Ionicons name="log-out-outline" size={18} color="#D9534F" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles kept exactly the same as original
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingBottom:10,
    paddingTop:20,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
  },
  profileImage: {
    width: w * 0.2,
    height: w * 0.2,
    borderRadius: 25,
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
  },
  phoneNumber: {
    fontSize: 14,
    color: "#666",
  },
  menuList: {
    marginTop: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor: pallette.lightgrey,
    padding: 14,
    marginBottom: 8,
  },
  menuIcon: {
    width: 24,
    textAlign: "center",
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    color: '#000',
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: w * 0.04,
    borderRadius: 8,
    marginTop: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#D9534F",
    marginLeft: 6,
  },
});

export default AccountTabs;