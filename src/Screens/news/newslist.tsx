// screens/NewsList.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useNavigation, useRoute } from '@react-navigation/native';
import { pallette } from '../helpers/colors';
import { medium, bold } from '../helpers/fonts';
import { h, w, adjust } from '../../constants/dimensions';
// import { userAPI } from '../Axios/Api';
import ErrorMessage from '../helpers/ErrorMessage';
import Loader from '../helpers/Loader';
import DateRangeFilter from '../helpers/filter';
import TopTabs from '../helpers/top-tabs';
import AllNewsScreen from './allnews';
import VerifiedNewsScreen from './verifiednews';
import PendingNewsScreen from './pendingnews';
import RejectedNewsScreen from './rejectednews';
// import DateRangeFilter from '../helpers/DateRangeFilter';
// import TopTabs from '../helpers/TopTabs';

// // Import different screens for each tab
// import AllNewsScreen from './AllNewsScreen';
// import VerifiedNewsScreen from './VerifiedNewsScreen';
// import PendingNewsScreen from './PendingNewsScreen';
// import RejectedNewsScreen from './RejectedNewsScreen';

const NewsList = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { initialTab = 0 } = route.params || {}; // 0: All, 1: Verified, 2: Pending, 3: Rejected

  const [activeTab, setActiveTab] = useState(initialTab);
  const [dateFilter, setDateFilter] = useState({
    filter: 'all',
    startDate: null,
    endDate: null,
  });

  // Tab configuration
  const tabs = ['All', 'Verified', 'Pending', 'Rejected'];

  // Handle tab change
  const handleTabChange = (index: number) => {
    setActiveTab(index);
  };

  // Handle date filter change
  const handleDateFilterChange = (filterData) => {
    setDateFilter(filterData);
  };

  // Handle back press
  const handleBackPress = () => {
    navigation.goBack();
  };

  // Get current time for display
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={pallette.white} />
      
      {/* Header */}
     

      {/* News Title */}
      {/* <View style={styles.titleContainer}>
        <Text style={styles.titleText}>News</Text>
      </View> */}

      {/* Top Tabs */}
      
      <View style={styles.header}>
        {/* <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBackPress}
          >
            <Icon name="arrow-left" size={adjust(20)} color={pallette.black} />
          </TouchableOpacity> */}
          <View>
            <Text style={styles.headerTitle}></Text>
            {/* <Text style={styles.headerTime}>{getCurrentTime()}</Text> */}
          {/* </View> */}
        </View>
        
        {/* Date Filter */}
        
        <DateRangeFilter
          onFilterChange={handleDateFilterChange}
          buttonText="Date"
          initialFilter="all"
        />
      </View>
      <TopTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
 
      {/* Render appropriate screen based on active tab */}
      <View style={styles.contentContainer}>
        {activeTab === 0 && (
          <AllNewsScreen 
            dateFilter={dateFilter}
            key={`all-${dateFilter.filter}`}
          />
        )}
        {activeTab === 1 && (
          <VerifiedNewsScreen
            dateFilter={dateFilter}
            key={`verified-${dateFilter.filter}`}
          />
        )}
        {activeTab === 2 && (
          <PendingNewsScreen
            dateFilter={dateFilter}
            key={`pending-${dateFilter.filter}`}
          />
        )}
        {activeTab === 3 && (
          <RejectedNewsScreen
            dateFilter={dateFilter}
            key={`rejected-${dateFilter.filter}`}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: pallette.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: w * 0.04,
    paddingVertical: h * 0.016,
    backgroundColor: pallette.white,
    borderBottomWidth: 1,
    borderBottomColor: pallette.lightgrey,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: w * 0.03,
  },
  backButton: {
    padding: adjust(4),
  },
  headerTitle: {
    fontSize: adjust(16),
    fontFamily: medium,
    color: pallette.black,
    textTransform: 'uppercase',
  },
  headerTime: {
    fontSize: adjust(14),
    fontFamily: medium,
    color: pallette.grey,
    marginTop: h * 0.004,
  },
  titleContainer: {
    paddingHorizontal: w * 0.04,
    paddingVertical: h * 0.016,
    backgroundColor: pallette.white,
  },
  titleText: {
    fontSize: adjust(20),
    fontFamily: bold,
    color: pallette.black,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: pallette.lightgrey,
  },
});

export default NewsList;