// screens/PendingNewsScreen.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Alert,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { pallette } from '../helpers/colors';
import { medium, bold } from '../helpers/fonts';
import { h, w, adjust } from '../../constants/dimensions';
import ErrorMessage from '../helpers/errormessage';
import NewsDetails from '../news screen/newsdetail';
import Loader from '../helpers/loader';
import { useAppContext } from '../../Store/contexts/app-context';
import Toast from 'react-native-toast-message';
import apiService from '../../Axios/Api';

const PendingNewsScreen = ({ dateFilter }) => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingNews, setPendingNews] = useState([]);
  const [error, setError] = useState(null);
const { user } = useAppContext();
  // Fetch pending news
  const fetchPendingNews = async () => {
  try {
    setError(null);
    
    // Get user ID from context/app state
    const userId = user?.id || user?.userId; // Adjust based on your user object
    
    if (!userId) {
      throw new Error('User ID not found');
    }
    
    // Build parameters according to your API endpoint
    const params = {
      userId: userId,
      status: 'PENDING',
      ...(dateFilter.startDate && { startDate: dateFilter.startDate }),
      ...(dateFilter.endDate && { endDate: dateFilter.endDate }),
      page: 1,
      limit: 20,
    };

    
    console.log('Fetching pending news with params:', params);
    
    // Assuming userAPI.getPendingNews is already defined
    const response = await  apiService.getAllNews(params);
    console.log('API Response:', response);
    
    // Check response structure - adjust based on your actual API response
    if (response.error === false) {
      // Access data correctly
      const newsData = response.data?.news || response.data?.data || response.data || [];
      setPendingNews(Array.isArray(newsData) ? newsData : []);
    } else {
      throw new Error(response.message || 'Failed to fetch pending news');
    }
  } catch (err) {
    console.error('Fetch pending news error:', err);
    setError(err.message || 'Failed to load pending news');
    setPendingNews([]);
    
    // Show error toast if needed
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: err.message || 'Failed to load news',
    });
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};
  
  // Initial load and when date filter changes
 useFocusEffect(
    useCallback(() => {
      
      fetchPendingNews();

      // Optional cleanup
      return () => {
        console.log('Screen lost focus');
      };
    }, [dateFilter]) // Re-run when dateFilter changes
  );
  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchPendingNews();
  };

  // Handle news item press
  const handleNewsPress = (id) => {
    navigation.navigate('NewsDetails', { newsId: id });
  };

  // Handle approve/reject actions
  const handleApprove = async (newsId, e) => {
    e?.stopPropagation();
    try {
      console.log('Approving news:', newsId);
      // Call approve API
      const response = await userAPI.approveNews(newsId);
      if (response.success) {
        // Remove from list or update status
        setPendingNews(prev => prev.filter(item => item._id !== newsId));
      }
    } catch (error) {
      console.error('Approve error:', error);
    }
  };
const handlePhonePress = (phone): void => {
  const phoneUrl = `tel:${phone}`;
        Linking.openURL(phoneUrl).catch(() => {
      Alert.alert("Error", "Failed to initiate phone call");
    });
};
  const handleReject = async (newsId, e) => {
    e?.stopPropagation();
    try {
      console.log('Rejecting news:', newsId);
      // Call reject API
      const response = await userAPI.rejectNews(newsId);
      if (response.success) {
        // Remove from list or update status
        setPendingNews(prev => prev.filter(item => item._id !== newsId));
      }
    } catch (error) {
      console.error('Reject error:', error);
    }
  };

  // Format time ago
  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}min ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}hr ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
    }
  };

  // Render category tags
  const renderCategories = (categories) => {
    if (!categories || !Array.isArray(categories)) return null;
    
    return (
      <View style={styles.categoriesContainer}>
        {categories.slice(0, 3).map((category, index) => (
          <View key={index} style={styles.categoryTag}>
            <Text style={styles.categoryText}>{category}</Text>
          </View>
        ))}
      </View>
    );
  };

  // Render news item
  const renderNewsItem = ({ item }) => (
    <TouchableOpacity
      style={styles.newsCard}
      onPress={() => handleNewsPress(item.newsId)}
      activeOpacity={0.9}
    >
      {/* News Title */}
      <Text style={styles.newsTitle} numberOfLines={1}>
        {item.headline}
      </Text>

      {/* News Description */}
      <Text style={styles.newsDescription} numberOfLines={2}>
        {item.content|| 'No description available'}
      </Text>

      {/* Upload Info and Views */}
      <View style={styles.metaInfo}>
        <View style={styles.uploadInfo}>
          <Icon name="clock" size={adjust(12)} color={pallette.grey} />
          <Text style={styles.uploadText}>
            uploaded {getTimeAgo(item.createdAt || item.uploadedAt)}
          </Text>
        </View>
        <View style={styles.viewsInfo}>
          <Icon name="person" size={adjust(12)} color={pallette.grey} />
          <Text style={styles.viewsText}>
            {item.reporterName || 0} 
          </Text>
        </View>
      </View>

      {/* Categories */}
      {renderCategories(item.categories || item.tags)}
       {user?.role?.toLocaleLowerCase()==='admin'?<View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
        
          style={[styles.actionButton,{ borderColor: `{pallette.primary}` }]}
          onPress={(e) => handlePhonePress(item.reporterPhone||8688113655)}
          activeOpacity={0.7}
        >
          <Text style={styles.approveButtonText}><Icon name="phone" size={adjust(12)} color={pallette.primary} /></Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => navigation.navigate('EditPendingNews',{mode:"REJECT",news:item,})}
          // activeOpacity={0.7}
        >
          <Text style={styles.rejectButtonText}>Rejected</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.approveButton]}
          onPress={() => navigation.navigate('EditPendingNews',{mode:"APPROVE",news:item})}
        >
          <Text style={styles.approveButtonText}>Approved</Text>
        </TouchableOpacity>
      </View></View>:null}

      {/* Separator */}
      {/* <View style={styles.cardSeparator} /> */}
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <Loader/>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Section */}
      {/* <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>Recent Pending News Today</Text>
        <Text style={styles.headerCount}>{pendingNews.length} pending</Text>
      </View> */}

      {/* News List */}
      <FlatList
        data={pendingNews}
        renderItem={renderNewsItem}
        keyExtractor={(item) => item.newsId || item.newsId.toString()}
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
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="clock" size={adjust(60)} color={pallette.lightgrey} />
            <Text style={styles.emptyText}>No pending news articles</Text>
            <Text style={styles.emptySubtext}>
              All news have been reviewed
            </Text>
          </View>
        }
      />
      
      <ErrorMessage message={error} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: pallette.lightgrey,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: pallette.lightgrey,
  },
  headerSection: {
    paddingHorizontal: w * 0.04,
    paddingTop: h * 0.02,
    paddingBottom: h * 0.01,
    backgroundColor: pallette.white,
  },
  headerTitle: {
    fontSize: adjust(18),
    fontFamily: bold,
    color: pallette.black,
    marginBottom: h * 0.005,
  },
  headerCount: {
    fontSize: adjust(14),
    fontFamily: medium,
    color: pallette.grey,
  },
  listContent: {
    paddingBottom: h * 0.02,
  },
  newsCard: {
    backgroundColor: pallette.white,
    marginHorizontal: w * 0.04,
    marginTop: h * 0.02,
    borderRadius: 8,
    paddingHorizontal: w * 0.04,
    paddingTop: h * 0.02,
    paddingBottom: h * 0.01,
    shadowColor: pallette.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  newsTitle: {
    fontSize: adjust(16),
    fontFamily: bold,
    color: pallette.black,
    marginBottom: h * 0.01,
  },
  newsDescription: {
    fontSize: adjust(14),
    fontFamily: medium,
    color: pallette.grey,
    lineHeight: adjust(20),
    marginBottom: h * 0.015,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: h * 0.015,
  },
  uploadInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  uploadText: {
    fontSize: adjust(12),
    fontFamily: medium,
    color: pallette.grey,
  },
  viewsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewsText: {
    fontSize: adjust(12),
    fontFamily: medium,
    color: pallette.l4,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: h * 0.02,
  },
  categoryTag: {
    backgroundColor: `${pallette.primary}15`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${pallette.primary}30`,
  },
  categoryText: {
    fontSize: adjust(11),
    fontFamily: medium,
    color: pallette.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: h * 0.015,
  },
  actionButton: {
    flex: 1,
    paddingVertical: h * 0.012,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  rejectButton: {
    backgroundColor: pallette.white,
    borderColor: pallette.red,
  },
  rejectButtonText: {
    fontSize: adjust(14),
    fontFamily: medium,
    color: pallette.red,
  },
  approveButton: {
    backgroundColor: pallette.primary,
    borderColor: pallette.primary,
  },
  approveButtonText: {
    fontSize: adjust(14),
    fontFamily: medium,
    color: pallette.white,
  },
  cardSeparator: {
    height: 1,
    backgroundColor: pallette.lightgrey,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: h * 0.2,
  },
  emptyText: {
    fontSize: adjust(16),
    fontFamily: medium,
    color: pallette.grey,
    marginTop: h * 0.02,
  },
  emptySubtext: {
    fontSize: adjust(14),
    fontFamily: medium,
    color: pallette.grey,
    marginTop: h * 0.01,
  },
});

export default PendingNewsScreen;