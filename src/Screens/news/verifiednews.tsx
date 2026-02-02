// screens/VerifiedNewsScreen.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useNavigation } from '@react-navigation/native';
import { pallette } from '../helpers/colors';
import { medium, bold } from '../helpers/fonts';
import { h, w, adjust } from '../../constants/dimensions';
import ErrorMessage from '../helpers/errormessage';
import Loader from '../helpers/loader';
import Toast from 'react-native-toast-message';
import { useAppContext } from '../../Store/contexts/app-context';
import apiService from '../../Axios/Api';

const VerifiedNewsScreen = ({ dateFilter }) => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [verifiedNews, setVerifiedNews] = useState([]);
  const [error, setError] = useState(null);
  const { user } = useAppContext();

  // Fetch verified news
  const fetchVerifiedNews = async () => {
    try {
      setError(null);
    
      const userId = user?.id || user?.userId;
      
      if (!userId) {
        throw new Error('User ID not found');
      }
      
      const params = {
        userId: userId,
        status: 'PUBLISHED',
        ...(dateFilter.startDate && { startDate: dateFilter.startDate }),
        ...(dateFilter.endDate && { endDate: dateFilter.endDate }),
        page: 1,
        limit: 20,
      };
      
      const response = await apiService.getAllNews(params);
      
      if (response.error === false) {
        setVerifiedNews(response.data.news || response.data || []);
      } else {
        throw new Error(response.message || 'Failed to fetch verified news');
      }
    } catch (err) {
      console.error('Fetch verified news error:', err);
      setError(err.message || 'Failed to load verified news');
      setVerifiedNews([]);
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
  useEffect(() => {
    fetchVerifiedNews();
  }, [dateFilter]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchVerifiedNews();
  };

  // Handle news item press
  const handleNewsPress = (id) => {
    navigation.navigate('NewsDetails', { newsId: id });
  };

  // Handle delete news
  const handleDeleteNews = (newsItem) => {
    Alert.alert(
      'Delete News',
      `Are you sure you want to delete "${newsItem.headline}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteNewsItem(newsItem.newsId)
        },
      ]

    );
  };

  const deleteNewsItem = async (newsId) => {
    try {
      const userId = user?.id || user?.userId;
      setLoading(true);
      const response = await apiService.deleteNews(newsId, userId);
      
      if (response.error === false) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'News deleted successfully'
        });
        
        fetchVerifiedNews();
      } else {
        throw new Error(response.message || 'Failed to delete news');
      }
    } catch (error) {
      console.error('Delete error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to delete news'
      });
    } finally {
      setLoading(false);
    }
  };

  // Format stats
  const formatNumber = (num) => {
    if (!num && num !== 0) return '0';
    if (num < 1000) return num.toString();
    return `${(num / 1000).toFixed(1)}k`;
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

  // Render stats row with delete icon
  const renderStats = (item) => {
    return (
      <View style={styles.statsContainer}>
        {/* Replies */}
        <View style={styles.statItem}>
          <Icon name="comment" size={adjust(14)} color={pallette.grey} />
          <Text style={styles.statValue}>{formatNumber(item.commentCount || 0)}</Text>
        </View>
        
        {/* Views */}
        <View style={styles.statItem}>
          <Icon name="eye" size={adjust(14)} color={pallette.grey} />
          <Text style={styles.statValue}>{formatNumber(item.saveCount || 0)}</Text>
        </View>
        
        {/* Reads */}
        <View style={styles.statItem}>
          <Icon name="heart" size={adjust(14)} color={pallette.grey} />
          <Text style={styles.statValue}>{formatNumber(item.likeCount || 0)}</Text>
        </View>
        
        {/* Shares */}
        <View style={styles.statItem}>
          <Icon name="share-nodes" size={adjust(14)} color={pallette.grey} />
          <Text style={styles.statValue}>{formatNumber(item.shareCount || 0)}</Text>
        </View>
        
       
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
        {item.content || 'No description available'}
      </Text>

      {/* Stats Row */}
      {renderStats(item)}

      {/* Categories */}
      {renderCategories(item.categories || [item.category] || ['Politics', 'Local News', 'Breaking News'])}
      
         {user?.role?.toLocaleLowerCase()==='admin'?<View>
       {/* Delete Icon */}
        <TouchableOpacity
          style={styles.deleteIconContainer}
          onPress={(e) => {
            e.stopPropagation();
            handleDeleteNews(item);
          }}
          activeOpacity={0.7}
        >
          <Icon name="trash-can" size={adjust(16)} color={pallette.red} />
        </TouchableOpacity></View>:null}
      {/* Separator */}
      {/* <View style={styles.cardSeparator} /> */}
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={verifiedNews}
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
            <Icon name="circle-check" size={adjust(60)} color={pallette.lightgrey} />
            <Text style={styles.emptyText}>No verified news articles</Text>
            <Text style={styles.emptySubtext}>
              Approved news will appear here
            </Text>
          </View>
        }
      />
      
      <ErrorMessage message={error} />
      <Toast />
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
    position: 'relative',
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
    color: pallette.darkgrey,
    lineHeight: adjust(20),
    marginBottom: h * 0.015,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: h * 0.015,
    paddingBottom: h * 0.01,
    borderBottomWidth: 1,
    borderBottomColor: pallette.lightgrey,
    position: 'relative',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: adjust(14),
    fontFamily: bold,
    color: pallette.black,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryTag: {
    backgroundColor: `${pallette.primary}10`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: adjust(12),
    fontFamily: medium,
    color: pallette.primary,
  },
  cardSeparator: {
    height: 1,
    backgroundColor: pallette.lightgrey,
    marginTop: h * 0.015,
  },
  // Delete icon styles
  deleteIconContainer: {
    position: 'absolute',
    right: 20,
    bottom:10,   width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: pallette.lightred,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: pallette.red,
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

export default VerifiedNewsScreen;