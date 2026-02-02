// screens/AllNewsScreen.jsx
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

import { medium, bold } from '../helpers/fonts';
import { h, w, adjust } from '../../constants/dimensions';
import apiService from '../../Axios/Api';
import ErrorMessage from '../helpers/errormessage';
import { pallette } from '../helpers/colors';
import Loader from '../helpers/loader';
import { useAppContext } from '../../Store/contexts/app-context';
import NewsDetails from '../news screen/newsdetail';


const AllNewsScreen = ({ dateFilter }) => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newsList, setNewsList] = useState([]);
  const [error, setError] = useState(null);
 const {user}=useAppContext();
  // Fetch all news
 const fetchAllNews = async () => {
  try {
    setError(null);
    
    // Use correct user ID property
    const userId = user?.userId || user?.id || user?.UserId;
    
    if (!userId) {
      throw new Error('User ID not found');
    }
    
    const params = {
      userId: userId,
      ...(dateFilter.startDate && { startDate: dateFilter.startDate }),
      ...(dateFilter.endDate && { endDate: dateFilter.endDate }),
      page: 1,
      limit: 20,
    };

    console.log('Fetching all news with params:', params);
    
    const response = await apiService.getAllNews(params);
    console.log('Raw API Response:', response);
    
    // Handle raw response (if API service returns axios response directly)
    if (response.data) {
      const apiData = response.data;
      
      // Check if API returned error
      if (response.error === false ) {
        const newsData = apiData.data?.news || apiData.data || apiData.news || apiData || [];
        setNewsList(Array.isArray(newsData) ? newsData : []);
      } else {
        throw new Error(response.message || 'API returned error');
      }
    } else {
      throw new Error('Invalid API response');
    }
  } catch (err) {
    console.error('Fetch all news error:', err);
    setError(err.message || 'Failed to load news');
    setNewsList([]);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};
  // Initial load and when date filter changes
  useEffect(() => {
    fetchAllNews();
  }, [dateFilter]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchAllNews();
  };

  // Handle news item press
 const handleNewsPress = (id) => {
  console.log(id);
   navigation.navigate('NewsDetails', { newsId: id });
};

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  // Render news item
  const renderNewsItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.newsItem}
      onPress={() => handleNewsPress(item.newsId)}
      activeOpacity={0.7}
    >
      <View style={styles.newsHeader}>
        <Text style={styles.newsTitle} numberOfLines={1}>
          {item.headline}
        </Text>
        <Text style={styles.newsTime}>
          {formatTime(item.uploadedAt || item.date)||'--'}
        </Text>
      </View>
      <Text style={styles.newsDescription} numberOfLines={3}>
        {item.content|| 'No description available'}
      </Text>
      {index < newsList.length - 1 && <View style={styles.separator} />}
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <Loader/>
    );
  }

  return (
    <>
      <FlatList
        data={newsList}
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
        // ListHeaderComponent={
        //   newsList.length > 0 && (
        //     <View style={styles.listHeader}>
        //       {/* <Text style={styles.listHeaderTitle}>Recent total News</Text> */}
        //     </View>
        //   )
        // }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="newspaper" size={adjust(60)} color={pallette.lightgrey} />
            <Text style={styles.emptyText}>No news articles found</Text>
            <Text style={styles.emptySubtext}>
              Try changing your date filter
            </Text>
          </View>
        }
      />
      
      <ErrorMessage message={error} />
    </>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingVertical: h * 0.02,
  },
  listHeader: {
    paddingHorizontal: w * 0.04,
    marginBottom: h * 0.02,
  },
  listHeaderTitle: {
    fontSize: adjust(16),
    fontFamily: bold,
    color: pallette.black,
  },
  newsItem: {
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
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: h * 0.01,
  },
  newsTitle: {
    flex: 1,
    fontSize: adjust(16),
    fontFamily: bold,
    color: pallette.black,
    marginRight: w * 0.02,
  },
  newsTime: {
    fontSize: adjust(12),
    fontFamily: medium,
    color: pallette.grey,
  },
  newsDescription: {
    fontSize: adjust(14),
    fontFamily: medium,
    color: pallette.grey,
    lineHeight: adjust(20),
  },
  separator: {
    height: 1,
    backgroundColor: pallette.lightgrey,
    marginTop: h * 0.02,
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

export default AllNewsScreen;