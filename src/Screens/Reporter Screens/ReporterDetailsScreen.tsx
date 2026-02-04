import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Linking,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useNavigation, useRoute } from '@react-navigation/native';
import { pallette } from '../helpers/colors';
import { regular, medium, semibold, bold } from '../helpers/fonts';
import { h, w, adjust } from '../../constants/dimensions';
import ToastMessage from '../helpers/ToastMessage';
import AlertMessage from '../helpers/alertmessage';
import apiService from '../../Axios/Api';
import Loader from '../helpers/loader';
import Header from '../helpers/header';
import { useAppContext } from '../../Store/contexts/app-context';

const ReporterDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { reporterId } = route.params || {};
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reporter, setReporter] = useState(null);
  const [stats, setStats] = useState({
    today: {
      "Total News": 0,
      "Pending News": 0,
      "Published News": 0,
      "Rejected News": 0
    },
    total: {
      "Total News": 0,
      "Pending News": 0,
      "Published News": 0,
      "Rejected News": 0
    }
  });
  const [toast, setToast] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');
const { user } = useAppContext();
  const fetchReporterDetails = async () => {
    try {
      const reporterResponse = await apiService.getReporterById(reporterId, 2);
      
      if (reporterResponse.error === false) {
        setReporter(reporterResponse.data);
        
        const statsResponse = await apiService.getDashboardStats({userId: reporterId, roleId: 2});
        if (statsResponse.error === false) {
          setStats(statsResponse.data);
        }
      } else {
        throw new Error(reporterResponse.message || 'Failed to fetch reporter details');
      }
    } catch (error) {
      console.error('Fetch reporter details error:', error);
      setToast({
        message: error.message || 'Failed to load reporter details',
        type: 'error'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (reporterId) {
      fetchReporterDetails();
    } else {
      setToast({
        message: 'Reporter ID is required',
        type: 'error'
      });
      setTimeout(() => navigation.goBack(), 1500);
    }
  }, [reporterId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReporterDetails();
  };

  const handleCallPress = () => {
    if (reporter?.mobileNumber) {
      Linking.openURL(`tel:${reporter.mobileNumber}`).catch(() => {
        setAlertMessage('Unable to make phone call');
      });
    } else {
      setAlertMessage('Phone number not available');
    }
  };

  const handleEmailPress = () => {
    if (reporter?.email) {
      Linking.openURL(`mailto:${reporter.email}`).catch(() => {
        setAlertMessage('Unable to open email app');
      });
    } else {
      setAlertMessage('Email not available');
    }
  };

  const handleToggleStatus = async () => {
    try {
      setLoading(true);
      const response = await apiService.updateReporterStatus(reporterId);
      
      if (response.error === false) {
        setToast({
          message: `Reporter ${reporter.enabled ? 'suspended' : 'activated'} successfully`,
          type: 'success'
        });
        fetchReporterDetails(); // Refresh data
      } else {
        throw new Error(response.message || 'Failed to update reporter');
      }
    } catch (error) {
      setToast({
        message: error.message || 'Failed to update reporter',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewNewsByStatus = (status) => {
    if (!reporter) return;
    
    navigation.navigate('NewsList', { 
      reporterId,
      status,
      reporterName: reporter.name 
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getStatusColor = () => {
    if (!reporter?.verified) return pallette.gold;
    if (reporter?.enabled) return pallette.primary;
    return pallette.red;
  };

  const getStatusText = () => {
    if (!reporter?.verified) return 'Pending';
    if (reporter?.enabled) return 'Active';
    return 'Suspended';
  };

  if (loading && !refreshing) {
    return <Loader />;
  }

  const handleEditPress = () => {
    navigation.navigate('ReporterUpdate', { reporterId });
  };

  if (!reporterId || !reporter) {
    return (
      <SafeAreaView style={styles.container}>
        <Header
          onback={() => navigation.goBack()}
          active={1}
          onSkip={() => {}}
          skippable={false}
          hastitle={true}
          title={'Reporter Details'}
        />
        <View style={styles.errorContainer}>
          <Icon name="user-slash" size={adjust(60)} color={pallette.lightgrey} />
          <Text style={styles.errorText}>Reporter not found</Text>
          <TouchableOpacity 
            style={styles.goBackButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.goBackText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const StatCard = ({ title, value, color, status }) => (
    <TouchableOpacity 
      style={styles.statCard}
      onPress={() => handleViewNewsByStatus(status || 'all')}
    >
      <Text style={[styles.statNumber, color && { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{title}</Text>
    </TouchableOpacity>
  );

  const DetailRow = ({ icon, label, value }) => (
    <View style={styles.detailItem}>
      <Icon name={icon} size={16} color={pallette.grey} />
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || 'Not provided'}</Text>
    </View>
  );

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
      
      <Header
        onback={() => navigation.goBack()}
        active={1}
        onSkip={() => {}}
        skippable={false}
        hastitle={true}
        title={'Reporter Details'}
      />

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[pallette.primary]}
            tintColor={pallette.primary}
          />
        }
        contentContainerStyle={styles.scrollContent}>
              {user?.role?.toLowerCase() === 'admin' && (
            <TouchableOpacity 
              style={styles.editButton}
              onPress={handleEditPress}
            >
              <Icon name="pen-to-square" size={18} color={pallette.white} />
              <Text style={styles.editButtonText}>Edit Reporter</Text>
            </TouchableOpacity>
          )}
  
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {reporter.name?.charAt(0)?.toUpperCase() || 'R'}
              </Text>
            </View>
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
              <Text style={styles.statusText}>{reporter.enabled?'Active':'Suspend'}</Text>
            </View>
          </View>
          
          <Text style={styles.reporterName}>{reporter.name || 'Unnamed Reporter'}</Text>
          <Text style={styles.reporterId}>ID: {reporter.id || reporter._id?.substring(0, 8) || 'N/A'}</Text>
          
          <View style={styles.contactButtons}>
            <TouchableOpacity 
              style={[styles.contactButton, !reporter.mobileNumber && styles.disabledButton]}
              onPress={handleCallPress}
              disabled={!reporter.mobileNumber}
            >
              <Icon name="phone" size={16} color={pallette.white} />
              <Text style={styles.contactButtonText}>Call</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.contactButton, !reporter.email && styles.disabledButton]}
              onPress={handleEmailPress}
              disabled={!reporter.email}
            >
              <Icon name="envelope" size={16} color={pallette.white} />
              <Text style={styles.contactButtonText}>Email</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Details</Text>
          <DetailRow icon="phone" label="Phone" value={reporter.mobileNumber} />
          <DetailRow icon="envelope" label="Email" value={reporter.email} />
          <DetailRow 
            icon="location-dot" 
            label="Location" 
            value={`${[reporter.address, reporter.city, reporter.state].filter(Boolean).join(', ')}${reporter.pincode ? ` - ${reporter.pincode}` : ''}`}
          />
        </View>

        {/* Identification Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Identification</Text>
          {reporter.idProofNumber && (
            <DetailRow 
              icon="id-card" 
              label="ID Proof" 
              value={`${reporter.idProofType ? `${reporter.idProofType.toUpperCase()}: ` : ''}${reporter.idProofNumber}`}
            />
          )}
          {/* <DetailRow icon="calendar" label="Joined" value={formatDate(reporter.createdAt)} /> */}
          {reporter.experience && (
            <DetailRow icon="briefcase" label="Experience" value={`${reporter.experience} years`} />
          )}
        </View>

        {/* Total News Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Total News Statistics</Text>
          <View style={styles.statsGrid}>
            <StatCard title="Total News" value={stats.total["Total News"] || 0} />
            <StatCard title="Pending" value={stats.total["Pending News"] || 0} color={pallette.gold} status="pending" />
            <StatCard title="Verified" value={stats.total["Published News"] || 0} color={pallette.primary} status="verified" />
            <StatCard title="Rejected" value={stats.total["Rejected News"] || 0} color={pallette.red} status="rejected" />
          </View>
        </View>

        {/* Today News Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today News Statistics</Text>
          <View style={styles.statsGrid}>
            <StatCard title="Total News" value={stats.today["Total News"] || 0} />
            <StatCard title="Pending" value={stats.today["Pending News"] || 0} color={pallette.gold} status="pending" />
            <StatCard title="Verified" value={stats.today["Published News"] || 0} color={pallette.primary} status="verified" />
            <StatCard title="Rejected" value={stats.today["Rejected News"] || 0} color={pallette.red} status="rejected" />
          </View>
        </View>

        {/* Toggle Status Button */}
        <TouchableOpacity 
          style={[
            styles.toggleButton, 
            { backgroundColor: reporter.enabled ? pallette.red : pallette.primary }
          ]}
          onPress={handleToggleStatus}
          disabled={loading}
        >
          <Icon name={reporter.enabled ? "user-slash" : "user-check"} size={18} color={pallette.white} />
          <Text style={styles.toggleButtonText}>
            {reporter.enabled ? 'Suspend Reporter' : 'Activate Reporter'}
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {alertMessage && (
        <AlertMessage
          message={alertMessage}
          onClose={() => setAlertMessage('')}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: pallette.lightgrey,
    paddingTop: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: w * 0.1,
  },
  profileSection: {
    backgroundColor: pallette.white,
    alignItems: 'center',
    paddingVertical: h * 0.03,
    // marginBottom: h * 0.02,
  },
  avatarContainer: {
    position: 'relative',
    // marginBottom: h * 0.02,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: pallette.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: h * 0.01,
  },
  avatarText: {
    color: pallette.white,
    fontSize: adjust(40),
    fontFamily: bold,
  },
  statusBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: pallette.white,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
    shadowColor: pallette.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: adjust(10),
    fontFamily: bold,
    color: pallette.black,
    textTransform: 'uppercase',
  },
  reporterName: {
    fontSize: adjust(20),
    fontFamily: bold,
    color: pallette.black,
    marginBottom: h * 0.005,
    textAlign: 'center',
    paddingHorizontal: w * 0.1,
  },
  reporterId: {
    fontSize: adjust(14),
    fontFamily: medium,
    color: pallette.grey,
    marginBottom: h * 0.02,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: pallette.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: pallette.grey,
    opacity: 0.6,
  },
  contactButtonText: {
    color: pallette.white,
    fontSize: adjust(14),
    fontFamily: medium,
  },
  section: {
    backgroundColor: pallette.white,
    marginHorizontal: w * 0.04,
    marginBottom: h * 0.02,
    borderRadius: 12,
    padding: w * 0.04,
    shadowColor: pallette.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: adjust(16),
    fontFamily: semibold,
    color: pallette.black,
    marginBottom: h * 0.02,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: h * 0.015,
    gap: 12,
  },
  detailLabel: {
    fontSize: adjust(14),
    fontFamily: medium,
    color: pallette.grey,
    width: 80,
  },
  detailValue: {
    flex: 1,
    fontSize: adjust(14),
    fontFamily: regular,
    color: pallette.black,
    flexWrap: 'wrap',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: pallette.lightgrey,
    padding: w * 0.04,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: adjust(28),
    fontFamily: bold,
    color: pallette.black,
    marginBottom: h * 0.005,
  },
  statLabel: {
    fontSize: adjust(12),
    fontFamily: medium,
    color: pallette.grey,
    textTransform: 'uppercase',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: w * 0.04,
    paddingVertical: h * 0.018,
    borderRadius: 12,
    gap: 10,
    marginTop: h * 0.02,
  },
  toggleButtonText: {
    fontSize: adjust(16),
    fontFamily: semibold,
    color: pallette.white,
  },
  errorText: {
    fontSize: adjust(16),
    fontFamily: medium,
    color: pallette.darkgrey,
    marginTop: h * 0.02,
    marginBottom: h * 0.03,
    textAlign: 'center',
  },
  goBackButton: {
    backgroundColor: pallette.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  goBackText: {
    color: pallette.white,
    fontSize: adjust(14),
    fontFamily: medium,
  },
  bottomSpacer: {
    height: h * 0.03,
  },
  editButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: pallette.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
    shadowColor: pallette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 1000,
  },
  editButtonText: {
    color: pallette.white,
    fontSize: adjust(14),
    fontFamily: semibold,
  },
});

export default ReporterDetailsScreen;