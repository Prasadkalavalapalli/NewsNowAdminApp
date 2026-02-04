// screens/AdvertisementListScreen.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { pallette } from '../helpers/colors';
import { regular, medium, semibold, bold } from '../helpers/fonts';
import { h, w, adjust } from '../../constants/dimensions';
import ToastMessage from '../helpers/ToastMessage';
import AlertMessage from '../helpers/alertmessage';
import apiService from '../../Axios/Api';
import Loader from '../helpers/loader';
import Header from '../helpers/header';
import ErrorMessage from '../helpers/errormessage';
import { useLocation } from '../news screen/location/LocationContext';

const AdvertisementListScreen = () => {
  const navigation = useNavigation();


  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [advertisements, setAdvertisements] = useState([]);
  const [toast, setToast] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, inactive
  // const coordinates = { lat: '15.26', log: '80.04' };
  const {coordinates}=useLocation();
 
  console.log(coordinates);
  const loadAdvertisements = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllAdvertisements();
      console.log('API Response:', response);
      
      if (response.error === false) {
        // Map API response to your component's expected structure
        const mappedAds = (response.data || []).map(ad => ({
          id: ad.id,
          _id: ad.id,
          title: ad.title || 'No Title',
          description: ad.description || '',
          imageUrl: ad.mediaUrl,
          districts: ad.district ? [ad.district] : [],
          startDate: ad.createdAt,
          endDate: ad.endDate || ad.createdAt,
          type: ad.type || 'ad',
          active: ad.active,
          isActive: ad.active,
          createdAt: ad.createdAt,
          // Add any other properties from API that might be useful
          ...ad
        }));
        
        setAdvertisements(mappedAds);
      } else {
        throw new Error(response.message || 'Failed to load advertisements');
      }
    } catch (error) {
      console.error('Load advertisements error:', error);
      setErrorMsg(error.message || 'Failed to load advertisements');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAdvertisements();
    }, [loadAdvertisements])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadAdvertisements();
  };

  const handleCreateNew = () => {
    navigation.navigate('AdvertisementUpload', { isEdit: false });
  };

  const handleEdit = (advertisement) => {
    navigation.navigate('AdvertisementUpload', {
      isEdit: true,
      advertisementId: advertisement.id || advertisement._id,
    });
  };

  const handleDelete = (id) => {
   
     deleteAdvertisement(id)
  };

  const deleteAdvertisement = async (id) => {
    try {
      setLoading(true);
      const response = await apiService.deleteAdvertisement(id);
      
      if (response.error === false) {
        setToast({
          message: 'Advertisement deleted successfully!',
          type: 'success'
        });
        
        // Refresh list
        loadAdvertisements();
      } else {
        throw new Error(response.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setErrorMsg(error.message || 'Failed to delete advertisement');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (advertisement) => {
    try {
      setLoading(true);
      const newStatus = !advertisement.active;
      const response = await apiService.updateAdvertisementStatus(
        advertisement.id || advertisement._id,
        newStatus
      );
      
      if (response.error === false) {
        setToast({
          message: `Advertisement ${newStatus ? 'activated' : 'deactivated'} successfully!`,
          type: 'success'
        });
        
        // Refresh list
        loadAdvertisements();
      } else {
        throw new Error(response.message || 'Status update failed');
      }
    } catch (error) {
      console.error('Toggle status error:', error);
      setErrorMsg(error.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const filteredAdvertisements = advertisements.filter(ad => {
    if (filter === 'active') return ad.active === true;
    if (filter === 'inactive') return ad.active === false;
    return true;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getDistrictsText = (districts) => {
    if (!Array.isArray(districts) || districts.length === 0) {
      return 'All Districts';
    }
    if (districts[0] === 'All Districts' || districts.includes('All Districts')) {
      return 'All Districts';
    }
    if (districts.length <= 2) return districts.join(', ');
    return `${districts.length} districts`;
  };

  const AdvertisementCard = ({ advertisement }) => (
    <View style={[styles.adCard, !advertisement.active && styles.inactiveCard]}>
      <View style={styles.adHeader}>
        <View style={styles.adImageContainer}>
          {advertisement.imageUrl ? (
            <Image source={{ uri: advertisement.imageUrl }} style={styles.adImage} resizeMode="cover" />
          ) : (
            <View style={styles.adImagePlaceholder}>
              <Icon name="image" size={24} color={pallette.grey} />
            </View>
          )}
        </View>
        
        <View style={styles.adInfo}>
          <View style={styles.adStatusRow}>
            <View style={[
              styles.statusBadge,
              { backgroundColor: advertisement.active ? pallette.green : pallette.red }
            ]}>
              <Text style={styles.statusText}>
                {advertisement.active ? 'Active' : 'Inactive'}
              </Text>
            </View>
            
            <Text style={styles.adType}>
              {advertisement.type === 'banner' ? 'Banner' : 'Ad'}
            </Text>
          </View>
          
          <Text style={styles.adTitle} numberOfLines={1}>
            {advertisement.title}
          </Text>
          
          <View style={styles.adMeta}>
            <View style={styles.metaItem}>
              <Icon name="calendar" size={12} color={pallette.grey} />
              <Text style={styles.metaText}>
                Created: {formatDate(advertisement.createdAt)}
              </Text>
            </View>
            
            <View style={styles.metaItem}>
              <Icon name="location-dot" size={12} color={pallette.grey} />
              <Text style={styles.metaText}>
                {getDistrictsText(advertisement.districts)}
              </Text>
            </View>
          </View>
        </View>
      </View>
      
      <Text style={styles.adDescription} numberOfLines={2}>
        {advertisement.description}
      </Text>
      
      <View style={styles.adActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.toggleButton]}
          onPress={() => handleToggleStatus(advertisement)}
        >
          <Icon 
            name={advertisement.active ? 'eye-slash' : 'eye'} 
            size={14} 
            color={pallette.white} 
          />
          <Text style={styles.actionButtonText}>
            {advertisement.active ? 'Deactivate' : 'Activate'}
          </Text>
        </TouchableOpacity>
        
        {/* <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEdit(advertisement)}
        >
          <Icon name="pen-to-square" size={14} color={pallette.white} />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity> */}
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(advertisement.id)}
        >
          <Icon name="trash" size={14} color={pallette.white} />
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return <Loader />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={pallette.white} />
      
      <Header 
        title="Advertisement Management"
        onback={navigation.goBack}
        active={1}
        onSkip={() => {}}
        skippable={false}
        hastitle={true}
      />
      
      {toast && (
        <ToastMessage
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      {errorMsg && (
        <ErrorMessage
          message={errorMsg}
          onClose={() => setErrorMsg('')}
        />
      )}

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
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statsCard}>
            <Text style={styles.statsNumber}>{advertisements.length}</Text>
            <Text style={styles.statsLabel}>Total Ads</Text>
          </View>
          
          <View style={styles.statsCard}>
            <Text style={styles.statsNumber}>
              {advertisements.filter(ad => ad.active).length}
            </Text>
            <Text style={styles.statsLabel}>Active</Text>
          </View>
          
          <View style={styles.statsCard}>
            <Text style={styles.statsNumber}>
              {advertisements.filter(ad => !ad.active).length}
            </Text>
            <Text style={styles.statsLabel}>Inactive</Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterTab, filter === 'active' && styles.filterTabActive]}
            onPress={() => setFilter('active')}
          >
            <Text style={[styles.filterText, filter === 'active' && styles.filterTextActive]}>
              Active
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterTab, filter === 'inactive' && styles.filterTabActive]}
            onPress={() => setFilter('inactive')}
          >
            <Text style={[styles.filterText, filter === 'inactive' && styles.filterTextActive]}>
              Inactive
            </Text>
          </TouchableOpacity>
        </View>

        {/* Create New Button */}
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateNew}
        >
          <Icon name="plus" size={18} color={pallette.white} />
          <Text style={styles.createButtonText}>Create New Advertisement</Text>
        </TouchableOpacity>

        {/* Advertisement List */}
        {filteredAdvertisements.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="ad" size={60} color={pallette.lightgrey} />
            <Text style={styles.emptyTitle}>No Advertisements Found</Text>
            <Text style={styles.emptyText}>
              {filter === 'all' 
                ? 'No advertisements have been created yet.' 
                : `No ${filter} advertisements found.`}
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={handleCreateNew}
            >
              <Text style={styles.emptyButtonText}>Create Your First Advertisement</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredAdvertisements.map((advertisement) => (
            <AdvertisementCard 
              key={advertisement.id || advertisement._id} 
              advertisement={advertisement} 
            />
          ))
        )}

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
    paddingBottom: h * 0.05,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: w * 0.04,
    marginTop: h * 0.02,
  },
  statsCard: {
    flex: 1,
    backgroundColor: pallette.white,
    borderRadius: 12,
    padding: w * 0.04,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: pallette.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statsNumber: {
    fontSize: adjust(24),
    fontFamily: bold,
    color: pallette.primary,
    marginBottom: h * 0.005,
  },
  statsLabel: {
    fontSize: adjust(12),
    fontFamily: medium,
    color: pallette.grey,
    textTransform: 'uppercase',
  },
  filterContainer: {
    flexDirection: 'row',
    marginHorizontal: w * 0.04,
    marginTop: h * 0.03,
    backgroundColor: pallette.white,
    borderRadius: 12,
    padding: 4,
  },
  filterTab: {
    flex: 1,
    paddingVertical: h * 0.012,
    alignItems: 'center',
    borderRadius: 8,
  },
  filterTabActive: {
    backgroundColor: pallette.primary,
  },
  filterText: {
    fontSize: adjust(14),
    fontFamily: medium,
    color: pallette.darkgrey,
  },
  filterTextActive: {
    color: pallette.white,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: pallette.primary,
    marginHorizontal: w * 0.04,
    marginTop: h * 0.03,
    paddingVertical: h * 0.018,
    borderRadius: 12,
    gap: 10,
    shadowColor: pallette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonText: {
    fontSize: adjust(16),
    fontFamily: semibold,
    color: pallette.white,
  },
  adCard: {
    backgroundColor: pallette.white,
    marginHorizontal: w * 0.04,
    marginTop: h * 0.02,
    borderRadius: 12,
    padding: w * 0.04,
    shadowColor: pallette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inactiveCard: {
    opacity: 0.7,
    backgroundColor: `${pallette.grey}15`,
  },
  adHeader: {
    flexDirection: 'row',
    marginBottom: h * 0.015,
  },
  adImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: w * 0.03,
  },
  adImage: {
    width: '100%',
    height: '100%',
  },
  adImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: pallette.lightgrey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adInfo: {
    flex: 1,
  },
  adStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: h * 0.008,
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
  adType: {
    fontSize: adjust(11),
    fontFamily: medium,
    color: pallette.grey,
    textTransform: 'uppercase',
  },
  adTitle: {
    fontSize: adjust(16),
    fontFamily: semibold,
    color: pallette.black,
    marginBottom: h * 0.01,
  },
  adMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: adjust(11),
    fontFamily: regular,
    color: pallette.grey,
  },
  adDescription: {
    fontSize: adjust(13),
    fontFamily: regular,
    color: pallette.darkgrey,
    lineHeight: adjust(18),
    marginBottom: h * 0.015,
  },
  adActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: h * 0.012,
    borderRadius: 8,
    gap: 6,
  },
  toggleButton: {
    backgroundColor: pallette.blue,
  },
  editButton: {
    backgroundColor: pallette.primary,
  },
  deleteButton: {
    backgroundColor: pallette.red,
  },
  actionButtonText: {
    fontSize: adjust(12),
    fontFamily: medium,
    color: pallette.white,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: h * 0.1,
    paddingHorizontal: w * 0.1,
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
  },
  emptyButton: {
    backgroundColor: pallette.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: pallette.white,
    fontSize: adjust(14),
    fontFamily: medium,
  },
  bottomSpacer: {
    height: h * 0.05,
  },
});

export default AdvertisementListScreen;