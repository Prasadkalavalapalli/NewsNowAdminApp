import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useNavigation } from '@react-navigation/native';
import { pallette } from '../helpers/colors';
import { regular, medium, semibold, bold } from '../helpers/fonts';
import { h, w, adjust } from '../../constants/dimensions';
import ToastMessage from '../helpers/ToastMessage';
import apiService, { reporterAPI, userAPI } from '../../Axios/Api';
import ReporterDetailsScreen from './ReporterDetailsScreen';
import Loader from '../helpers/loader';

const ReporterList = () => {
  const navigation = useNavigation();
  
  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reporters, setReporters] = useState([]);
  const [toast, setToast] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filteredReporters, setFilteredReporters] = useState([]);
  const [stats, setStats] = useState({
    all: 0,
    active: 0,
    pending: 0,
    suspended: 0,
  });
console.log(reporters)
  // Filter options
  const filterOptions = [
    { id: 'all', label: 'All', icon: 'users' },
    { id: 'active', label: 'Active', icon: 'circle-check' },
    // { id: 'pending', label: 'Pending', icon: 'clock' },
    { id: 'suspended', label: 'Suspended', icon: 'user-slash' },
  ];

  // Fetch reporters
  const fetchReporters = async () => {
    try {
      const response = await apiService.getAllReporters(1);
      console.log(response);
      if (response.error===false) {
        const reportersData = response.data|| [];
        setReporters(reportersData);
          // Add status to each reporter
  const reportersWithStatus = reportersData.map(reporter => ({
    ...reporter,
    status: reporter ? 
            (reporter.enabled === true ? 'active' : 'suspended') : 
            'pending'
  }));
  
  setReporters(reportersWithStatus);
  
  // Calculate stats based on status
  const newStats = {
    all: reportersWithStatus.length,
    active: reportersWithStatus.filter(r => r.status === 'active').length,
    pending: reportersWithStatus.filter(r => r.status === 'pending').length,
    suspended: reportersWithStatus.filter(r => r.status === 'suspended').length,
  };
        setStats(newStats);
      }
    } catch (err) {
      setToast({
        message: 'Failed to load reporters',
        type: 'error'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchReporters();
  }, []);

  // Apply filters when status changes
  useEffect(() => {
    if (filterStatus === 'all') {
      setFilteredReporters(reporters);
    } else {
      const filtered = reporters.filter(reporter => reporter.status === filterStatus);
      setFilteredReporters(filtered);
    }
  }, [filterStatus, reporters]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchReporters();
  };

  // Handle filter change
  const handleFilterChange = (status) => {
    setFilterStatus(status);
  };

  // Handle reporter press
  const handleReporterPress = (reporter) => {
    navigation.navigate('ReporterDetailsScreen', { reporterId: reporter.userId || reporter._id });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return pallette.primary;
      case 'pending': return pallette.gold;
      case 'suspended': return pallette.red;
      default: return pallette.grey;
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'pending': return 'Pending';
      case 'suspended': return 'Suspended';
      default: return 'Unknown';
    }
  };

  // Render reporter item
  const renderReporterItem = ({ item }) => (
    <TouchableOpacity
      style={styles.reporterCard}
      onPress={() => handleReporterPress(item)}
      activeOpacity={0.9}
    >
      <View style={styles.cardHeader}>
        <View style={styles.reporterInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.name?.charAt(0)?.toUpperCase() || 'R'}
            </Text>
          </View>
          <View style={styles.nameContainer}>
            <Text style={styles.reporterName} numberOfLines={1}>
              {item.name || 'Unnamed Reporter'}
            </Text>
            <Text style={styles.reporterEmail} numberOfLines={1}>
              {item.email || 'No email'}
            </Text>
          </View>
        </View>
        
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.contactInfo}>
        <View style={styles.contactItem}>
          <Icon name="phone" size={12} color={pallette.grey} />
          <Text style={styles.contactText}>{item.mobileNumber || 'No phone'}</Text>
        </View>
        <View style={styles.contactItem}>
          <Icon name="location-dot" size={12} color={pallette.grey} />
          <Text style={styles.contactText}>
            {item.city || 'Unknown'} • {item.state || 'Unknown'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="users" size={adjust(60)} color={pallette.lightgrey} />
      <Text style={styles.emptyTitle}>No Reporters Found</Text>
      <Text style={styles.emptyText}>
        {filterStatus !== 'all'
          ? 'Try changing your filter'
          : 'No reporters have registered yet'}
      </Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('ReporterRegistration')}
      >
        <Icon name="user-plus" size={16} color={pallette.white} />
        <Text style={styles.addButtonText}>Add First Reporter</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return <Loader />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={pallette.white} />
      
      {toast && (
        <ToastMessage
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <View style={styles.content}>
        <View style={styles.headerSection}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Icon name="arrow-left" size={adjust(20)} color={pallette.black} />
              <Text style={styles.title}>Reporters</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.addReporterButton}
              onPress={() => navigation.navigate('ReporterRegistration')}
            >
              <Icon name="user-plus" size={16} color={pallette.white} />
              <Text style={styles.addButtonText}>Add Reporter</Text>
            </TouchableOpacity>
          </View>         
        </View>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          // style={styles.filterContainer}
          contentContainerStyle={styles.filterContentContainer}
        >
          {filterOptions.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                filterStatus === filter.id && styles.filterButtonActive,
              ]}
              onPress={() => handleFilterChange(filter.id)}
            >
              <Icon
                name={filter.icon}
                size={14}
                color={filterStatus === filter.id ? pallette.white : pallette.grey}
              />
              <Text
                style={[
                  styles.filterText,
                  filterStatus === filter.id && styles.filterTextActive,
                ]}
              >
                {filter.label} ({stats[filter.id]})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <FlatList
          data={filteredReporters}
          renderItem={renderReporterItem}
          keyExtractor={(item) => item.id?.toString() || item._id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[pallette.primary]}
              tintColor={pallette.primary}
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: pallette.lightgrey,
    paddingTop: 20,
  },
  content: {
    flex: 1,
  },
  headerSection: {
    backgroundColor: pallette.white,
    paddingHorizontal: w * 0.04,
    paddingVertical: h * 0.02,
    borderBottomWidth: 1,
    borderBottomColor: pallette.lightgrey,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: adjust(18),
    fontFamily: bold,
    color: pallette.black,
    marginLeft: 10,
  },
  addReporterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: pallette.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: pallette.white,
    fontSize: adjust(14),
    fontFamily: medium,
  },
  filterContainer: {
    backgroundColor: pallette.white,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: pallette.lightgrey,
  },
  filterContentContainer: {
    paddingHorizontal: w * 0.04,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: pallette.lightgrey,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: pallette.primary,
  },
  filterText: {
    fontSize: adjust(12),
    fontFamily: medium,
    color: pallette.grey,
  },
  filterTextActive: {
    color: pallette.white,
  },
  listContent: {
    paddingHorizontal: w * 0.04,
    paddingTop: h * 0.015,
    paddingBottom: h * 0.02,
    flexGrow: 1,
  },
  reporterCard: {
    backgroundColor: pallette.white,
    borderRadius: 12,
    padding: w * 0.04,
    marginBottom: h * 0.015,
    shadowColor: pallette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: h * 0.015,
  },
  reporterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: pallette.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: w * 0.03,
  },
  avatarText: {
    color: pallette.white,
    fontSize: adjust(20),
    fontFamily: bold,
  },
  nameContainer: {
    flex: 1,
  },
  reporterName: {
    fontSize: adjust(16),
    fontFamily: semibold,
    color: pallette.black,
    marginBottom: h * 0.005,
  },
  reporterEmail: {
    fontSize: adjust(12),
    fontFamily: regular,
    color: pallette.grey,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: adjust(10),
    fontFamily: bold,
    color: pallette.white,
    textTransform: 'uppercase',
  },
  contactInfo: {
    flexDirection: 'row',
    paddingTop: h * 0.01,
    borderTopWidth: 1,
    borderTopColor: pallette.lightgrey,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: w * 0.04,
  },
  contactText: {
    fontSize: adjust(12),
    fontFamily: regular,
    color: pallette.grey,
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: h * 0.15,
  },
  emptyTitle: {
    fontSize: adjust(18),
    fontFamily: semibold,
    color: pallette.darkgrey,
    marginTop: h * 0.02,
    marginBottom: h * 0.01,
  },
  emptyText: {
    fontSize: adjust(14),
    fontFamily: regular,
    color: pallette.grey,
    textAlign: 'center',
    marginBottom: h * 0.03,
    paddingHorizontal: w * 0.1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: pallette.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
});

export default ReporterList;