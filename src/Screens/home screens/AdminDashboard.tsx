import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useNavigation } from '@react-navigation/native';
import { pallette } from '../helpers/colors';
import { semibold, regular, medium } from '../helpers/fonts';
import apiService, { userAPI } from '../../Axios/Api';
import UploadScreen from '../news/UploadScreen';
import { Screen } from 'react-native-screens';
import { AppContext, useAppContext } from '../../Store/contexts/app-context';
import Loader from '../helpers/loader';
import AdvertisementListScreen from '../ads/AdvertisementListScreen';



const AdminDashboard = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any>(null);
const { user } = useAppContext();
const roleId=(user.role==='REPORTER')?2:1
  console.log(user);
  const fetchData = async () => {
    try {
      const data = await apiService.getDashboardStats({userId:user.userId,roleId});
      setStats(data.data);
      console.log(data)
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };
// Helper function to get stats safely
const getTotalStat = (key) => stats?.total[key] || 0;
const getTodayStat = (key) => stats?.today[key] || 0;

const overallStats = [
  {
    title: 'Total News',
    value: getTotalStat("Total News"),
    icon: 'newspaper',
    color: '#4361ee',
    onPress: () => navigation.navigate('NewsList', { filter: 'all' }),
  },
  {
    title: 'Pending',
    value: getTotalStat("Pending News"),
    icon: 'clock',
    color: '#ff9e00',
    onPress: () => navigation.navigate('NewsList', { filter: 'pending' }),
  },
  {
    title: 'Verified',
    value: getTotalStat("Published News"), // Map API's "Published News" to "Verified"
    icon: 'circle-check',
    color: '#00b894',
    onPress: () => navigation.navigate('NewsList', { filter: 'verified' }),
  },
  {
    title: 'Rejected',
    value: getTotalStat("Rejected News"),
    icon: 'circle-xmark',
    color: '#ff6b6b',
    onPress: () => navigation.navigate('NewsList', { filter: 'rejected' }),
  },
];

const todayStats = [
  {
    title: 'New Today',
    value: getTodayStat("Total News"),
    icon: 'arrow-up',
    color: '#00b894',
    onPress: () => navigation.navigate('NewsList', { filter: 'all', timeframe: 'today' }),
  },
  {
    title: 'Pending Today',
    value: getTodayStat("Pending News"),
    icon: 'clock',
    color: '#ff9e00',
    onPress: () => navigation.navigate('NewsList', { filter: 'pending', timeframe: 'today' }),
  },
  {
    title: 'Verified Today',
    value: getTodayStat("Published News"), // Map API's "Published News" to "Verified Today"
    icon: 'check',
    color: '#4361ee',
    onPress: () => navigation.navigate('NewsList', { filter: 'verified', timeframe: 'today' }),
  },
  {
    title: 'Rejected Today',
    value: getTodayStat("Rejected News"),
    icon: 'circle-xmark',
    color: '#ff6b6b',
    onPress: () => navigation.navigate('NewsList', { filter: 'rejected', timeframe: 'today' }),
  },
];

  const actionCards = [
    {
      title: 'Reporters',
      value: stats?.total['Reporter Management'] || 0,
      icon: 'users',
      color: '#6c5ce7',
      onPress: () => navigation.navigate('ReporterList'),
    },
    {
      title: 'Notifications',
      value: stats?.totalNotifications || 0,
      icon: 'bell',
      color: '#00cec9',
      onPress: () => navigation.navigate('AdvertisementList'),
    },
  ];

  const quickActions = [
          {
  title: 'Add News',
  icon: 'plus',
  onPress: () => navigation.navigate('Upload', { screen: 'UploadScreen' }),
  // onPress: () =>{},
  color: pallette.primary,
},
    {
      title: 'Add Reporter',
      icon: 'user-plus',
      onPress: () => navigation.navigate('ReporterRegistration'),
      color: pallette.primary,
    },
    {
      title: 'Create Banner',
      icon: 'megaphone',
      // onPress: () => navigation.navigate('CreateBanner'),
       onPress: () => navigation.navigate('AdvertisementList'),
      color: pallette.primary,
    },
    {
      title: 'Analytics',
      icon: 'chart-column',
      // onPress: () => navigation.navigate('Analytics'),
      onPress: () =>{},
      color: pallette.primary,
    },
  ];

  if (loading) {
    return (
      <Loader/>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={pallette.primary} />
        }
      >
        {/* Overall Summary - Using Today's Summary style */}
        <View style={styles.summaryBox}>
<View style={styles.summaryHeader}>
  <Text style={styles.summaryTitle}>Overall Summary</Text>
  <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
    <Icon name="arrows-rotate" size={20} color={pallette.primary} />
  </TouchableOpacity>
</View>
          
          <View style={styles.summaryGrid}>
            {overallStats.slice(0, 2).map((stat, index) => (
              <TouchableOpacity key={index} style={styles.summaryItem} onPress={stat.onPress}>
                <View style={[styles.summaryIcon, { backgroundColor: `${stat.color}15` }]}>
                  <Icon name={stat.icon} size={16} color={stat.color} />
                </View>
                <View>
                  <Text style={styles.summaryLabel}>{stat.title}</Text>
                  <Text style={styles.summaryValue}>{stat.value}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryGrid}>
            {overallStats.slice(2).map((stat, index) => (
              <TouchableOpacity key={index} style={styles.summaryItem} onPress={stat.onPress}>
                <View style={[styles.summaryIcon, { backgroundColor: `${stat.color}15` }]}>
                  <Icon name={stat.icon} size={16} color={stat.color} />
                </View>
                <View>
                  <Text style={styles.summaryLabel}>{stat.title}</Text>
                  <Text style={styles.summaryValue}>{stat.value}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Today's Summary */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>Today's Summary</Text>
          <View style={styles.summaryRow}>
            {todayStats.slice(0,2).map((stat, index) => (
              <View key={index} style={styles.summaryItem}>
                <View style={[styles.summaryIcon, { backgroundColor: `${stat.color}15` }]}>
                  <Icon name={stat.icon} size={16} color={stat.color} />
                </View>
                <View>
                  <Text style={styles.summaryLabel}>{stat.title}</Text>
                  <Text style={styles.summaryValue}>{stat.value}</Text>
                </View>
              </View>
            ))}
          </View>
           <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
            {todayStats.slice(2).map((stat, index) => (
              <View key={index} style={styles.summaryItem}>
                <View style={[styles.summaryIcon, { backgroundColor: `${stat.color}15` }]}>
                  <Icon name={stat.icon} size={16} color={stat.color} />
                </View>
                <View>
                  <Text style={styles.summaryLabel}>{stat.title}</Text>
                  <Text style={styles.summaryValue}>{stat.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

      {user?.role.toLowerCase()=='admin'?<View>
        {/* Management Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Management</Text>
          <View style={styles.row}>
            {actionCards.map((card, index) => (
              <TouchableOpacity key={index} style={styles.managementCard} onPress={card.onPress}>
                <Icon name={card.icon} size={26} color={card.color} />
                <Text style={styles.managementValue}>{card.value}</Text>
                <Text style={styles.managementTitle}>{card.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.actionBtn} 
                onPress={action.onPress}
              >
                <Icon name={action.icon} size={18} color={action.color} />
                <Text style={styles.actionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View></View>:null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    fontFamily: semibold,
  },
  refreshBtn: {
    padding: 8,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 12,
    fontFamily: semibold,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryBox: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 16,
    fontFamily: semibold,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
    fontFamily: regular,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    fontFamily: semibold,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginBottom: 16,
  },
  managementCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  managementValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginVertical: 8,
    fontFamily: semibold,
  },
  managementTitle: {
    fontSize: 14,
    color: '#666',
    fontFamily: regular,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionBtn: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionText: {
    fontSize: 14,
    color: '#1a1a1a',
    marginLeft: 10,
    fontFamily: medium,
  },
  summaryHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 16,
},
});

export default AdminDashboard;