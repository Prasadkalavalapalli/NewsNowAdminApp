// screens/RejectedNewsScreen.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useNavigation } from '@react-navigation/native';
import { pallette } from '../helpers/colors';
import { medium, bold } from '../helpers/fonts';
import { h, w, adjust } from '../../constants/dimensions';

import ErrorMessage from '../helpers/errormessage';
import Loader from '../helpers/loader';
import apiService from '../../Axios/Api';
import { useAppContext } from '../../Store/contexts/app-context';

const RejectedNewsScreen = ({ dateFilter }) => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rejectedNews, setRejectedNews] = useState([]);
  const [error, setError] = useState(null);
  const { user } = useAppContext();

  // Fetch rejected news
  const fetchRejectedNews = async () => {
    try {
      setError(null);
          
      // Get user ID from context/app state
      const userId = user?.id || user?.userId;
      
      if (!userId) {
        throw new Error('User ID not found');
      }
      
     const formatDateToYMD = (dateString) => {
  if (!dateString) return null;
  
  // If already in YYYY-MM-DD format, return as is
  if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateString;
  }
  
  // If it's ISO format, extract YYYY-MM-DD
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return null;
  }
};

    const params = {
  userId: userId,
  status: 'REJECTED',
     ...(dateFilter.startDate && { dateFilter:'CUSTOM'}), // Use the actual filter value
  ...(dateFilter.startDate && { fromDate: formatDateToYMD(dateFilter.startDate) }),
  ...(dateFilter.endDate && { toDate: formatDateToYMD(dateFilter.endDate) }),
  page: 1,
  limit: 20,
};

      
      const response = await apiService.getAllNews(params);
      
      if (response.error === false) {
        setRejectedNews(response.data.news || response.data || []);
      } else {
        throw new Error(response.message || 'Failed to fetch rejected news');
      }
    } catch (err) {
      console.error('Fetch rejected news error:', err);
      setError(err.message || 'Failed to load rejected news');
      setRejectedNews([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load and when date filter changes
  useEffect(() => {
    fetchRejectedNews();
  }, [dateFilter]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchRejectedNews();
  };

  // Handle news item press
  const handleNewsPress = (id) => {
    navigation.navigate('NewsDetails', { newsId: id });
  };

  // Handle edit icon press
  const handleEditPress = (item) => {
    navigation.navigate('EditPendingNews', {
      mode: "APPROVE",
      news: item
    });
  };

  // Format rejection reason
  const getRejectionReason = (item) => {
    return item.rejectionReason || 'News doesn\'t contain detailed information clarity is low';
  };

  // Render category tags
  const renderCategories = (categories) => {
    if (!categories || !Array.isArray(categories)) return null;
    
    return (
      <View style={styles.categoriesContainer}>
        {categories.slice(0, 2).map((category, index) => (
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
      <Text style={styles.newsDescription} numberOfLines={3}>
        {item.content || 'No description available'}
      </Text>

      {/* Rejection Reason */}
      <View style={styles.rejectionContainer}>
        <Text style={styles.reasonLabel}>Reason : </Text>
        <Text style={styles.reasonText}>{getRejectionReason(item)}</Text>
      </View>

      {/* Categories */}
      {renderCategories(item.categories || [item.category] || ['Politics', 'Local News'])}

      {/* Separator */}
      <View style={styles.cardSeparator} />

      {/* Edit Icon - Bottom Right */}
        {item.uploadedAt?.includes(new Date().toISOString().split('T')[0]) && (
          <TouchableOpacity
            style={styles.editIconContainer}
            onPress={(e) => {
              e.stopPropagation();
              handleEditPress(item);
            }}
            activeOpacity={0.7}
          >
            <Icon name="pen-to-square" size={18} color={pallette.primary} />
          </TouchableOpacity>
        )}
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      {/* News List */}
      <FlatList
        data={rejectedNews}
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
            <Icon name="circle-xmark" size={adjust(60)} color={pallette.lightgrey} />
            <Text style={styles.emptyText}>No rejected news articles</Text>
            <Text style={styles.emptySubtext}>
              Rejected news will appear here
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
    paddingBottom: h * 0.015,
    shadowColor: pallette.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative', // Added for absolute positioning
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
    marginBottom: h * 0.008,
  },
  rejectionContainer: {
    flexDirection: 'row',
    marginTop: h * 0.012,
    marginBottom: h * 0.01,
    alignItems: 'flex-start',
  },
  reasonLabel: {
    fontSize: adjust(13),
    fontFamily: bold,
    color: pallette.red,
  },
  reasonText: {
    flex: 1,
    fontSize: adjust(13),
    fontFamily: medium,
    color: pallette.red,
    lineHeight: adjust(18),
  },
  categoriesContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: h * 0.008,
  },
  categoryTag: {
    backgroundColor: `${pallette.red}10`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: `${pallette.red}30`,
  },
  categoryText: {
    fontSize: adjust(12),
    fontFamily: medium,
    color: pallette.red,
  },
  cardSeparator: {
    // Already using borderBottom on newsCard
  },
  // Edit Icon Styles
  editIconContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${pallette.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${pallette.primary}30`,
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

export default RejectedNewsScreen;