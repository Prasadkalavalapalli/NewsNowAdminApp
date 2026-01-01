import React, { useContext } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppContext } from '../Store/contexts/app-context';
import { pallette } from '../Screens/helpers/colors';
import { h, w } from '../constants/dimensions';
import { medium } from '../Screens/helpers/fonts';
import HomeScreen from '../Screens/home screens/home';
import NewsDashboard from '../Screens/news/NewsDashboard';
import HelpScreen from '../Screens/help screens/help';
import AccountTabs from '../Screens/accounts/account';
import ReporterRegistration from '../Screens/Reporter Screens/ReporterRegister';
import ReporterList from '../Screens/Reporter Screens/ReporterList';
import ReporterDetailsScreen from '../Screens/Reporter Screens/ReporterDetailsScreen';
import NewsDetails from '../Screens/news screen/newsdetail';
import NewsViewScreen from '../Screens/news screen/newsview';
import PrivacyPolicy from '../Screens/accounts/PrivacyPolicy';
import AboutNewsNow from '../Screens/accounts/AboutNewsNow';
import LoginScreen from '../Screens/login screens/login-screen';
import EditPendingNews from '../Screens/news/EditPendingNews';
import UploadScreen from '../Screens/news/UploadScreen';
import ProfileScreen from '../Screens/accounts/profile-screen';
import VerifiedNewsScreen from '../Screens/news/verifiednews';
import RejectedNewsScreen from '../Screens/news/rejectednews';




// Define your strings (create a strings file or define here)
const strings = {
  AdminHome: 'Home',
  upload: 'Upload',
  NewsStatus: 'News Status',
  ReporterHome: 'News',
  home: 'Home',
  // UserProfile:'User Profile'
};



const ReporterScreen = () => (
  <View style={styles.screen}>
    <Text style={styles.screenText}>Reporter Screen</Text>
  </View>
);

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Stack Navigators for each tab
const AdminHomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="HelpScreen" component={HelpScreen} />
    <Stack.Screen name="AccountTabs" component={AccountTabs} />
    <Stack.Screen name="ReporterRegistration" component={ReporterRegistration}/>
    <Stack.Screen name="ReporterList" component={ReporterList}/>
    <Stack.Screen name='ReporterDetailsScreen'component={ReporterDetailsScreen}/>
      <Stack.Screen name='PrivacyPolicy'component={PrivacyPolicy}/>
       <Stack.Screen name='AboutNewsNow'component={AboutNewsNow}/>
       <Stack.Screen name='ProfileScreen'component={ProfileScreen}/>
       
        {/* Add more admin screens here */}
  </Stack.Navigator>
);

const UploadStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
   
   
      <Stack.Screen name="UploadScreen" component={UploadScreen} />

   <Stack.Screen name="HelpScreen" component={HelpScreen} />
    <Stack.Screen name="AccountTabs" component={AccountTabs} />
    <Stack.Screen name="ReporterRegistration" component={ReporterRegistration}/>
    <Stack.Screen name="ReporterList" component={ReporterList}/>
    <Stack.Screen name='ReporterDetailsScreen'component={ReporterDetailsScreen}/>
      <Stack.Screen name='PrivacyPolicy'component={PrivacyPolicy}/>
       <Stack.Screen name='AboutNewsNow'component={AboutNewsNow}/>
       <Stack.Screen name='ProfileScreen'component={ProfileScreen}/>
    {/* Add more upload screens here */}
  </Stack.Navigator>
);

const NewsStatusStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="NewsStatusMain" component={NewsDashboard} />
    <Stack.Screen name="NewsDetails" component={NewsDetails} />
     <Stack.Screen name="EditPendingNews" component={EditPendingNews} />
     <Stack.Screen name="VerifiedNewsScreen" component={VerifiedNewsScreen}/>
     <Stack.Screen name="RejectedNewsScreen" component={RejectedNewsScreen} />

    {/* Add more news status screens here */}
   
  </Stack.Navigator>
);

const ReporterHomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
     <Stack.Screen name="NewsViewScreen" component={NewsViewScreen} />
  </Stack.Navigator>
);
// const UserProfile= () => (
//   <Stack.Navigator screenOptions={{ headerShown: false }}>
//     <Stack.Screen name="AccountTabs" component={AccountTabs} />
//   </Stack.Navigator>
// );

// Main Tab Navigator
const TabNav = () => {
  const { user } = useAppContext();
const role = user?.role?.toLowerCase();
console.log(role);
  // Define tabs based on user role (example)
  const userTabs = [
    {
      name: strings.AdminHome,
      component: AdminHomeStack,
      title: strings.AdminHome,
      activeIcon: 'home',
      inactiveIcon: 'home-outline',
      show: role === 'admin' || role === 'reporter', // Control visibility
    },
    {
      name: strings.upload,
      component: UploadStack,
      title: strings.upload,
      activeIcon: 'cloud-upload',
      inactiveIcon: 'cloud-upload-outline',
      show: role === 'reporter' || role === 'admin',
    },
    {
      name: strings.ReporterHome,
      component: ReporterHomeStack,
      title: strings.ReporterHome,
      activeIcon: 'book-open-page-variant',
      inactiveIcon: 'book-open-page-variant-outline',
      show: true, // Show for all users
    },
    {
      name: strings.NewsStatus,
      component: NewsStatusStack,
      title: strings.NewsStatus,
      activeIcon: 'newspaper-variant',
      inactiveIcon: 'newspaper-variant-outline',
      show: role === 'reporter'|| role === 'admin'
    },
    // {
    //   name: strings.UserProfile,
    //   component: UserProfile,
    //   title: strings.UserProfile,
    //   activeIcon: 'account-circle',
    //   inactiveIcon: 'account-circle-outline',
    //   show: user?.role === 'user', // Show for all users
    // },
    
  ];

  // Filter tabs based on user role and visibility
  const filteredTabs = userTabs.filter(tab => tab.show);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: h * 0.08,
          elevation: 0,
          borderTopWidth: 0,
          backgroundColor: pallette.white,
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      {filteredTabs.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{
            unmountOnBlur: true,
            tabBarIcon: ({ focused }) => (
              <Icon
                name={focused ? tab.activeIcon : tab.inactiveIcon}
                size={26}
                color={focused ? pallette.primary : pallette.grey}
              />
            ),
            tabBarLabel: ({ focused }) => (
              <Text
                style={[
                  styles.label,
                  { color: focused ? pallette.primary : pallette.grey },
                ]}>
                {tab.title}
              </Text>
            ),
            tabBarButton: props => (
              <Pressable 
                {...props} 
                android_ripple={{ color: 'transparent' }} 
              />
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
};

export default TabNav;

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    fontFamily: medium,
    marginBottom: 4,
  },
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: pallette.white,
  },
  screenText: {
    fontSize: 20,
    fontFamily: medium,
    color: pallette.black,
  },
});