import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  FlatList,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Share,
  Modal
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { pallette } from '../helpers/colors';
import { regular, medium, semibold, bold } from '../helpers/fonts';
import Loader from '../helpers/loader';
import apiService from '../../Axios/Api';
import { useAppContext } from '../../Store/contexts/app-context';
import ErrorMessage from '../helpers/errormessage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Filter options
const CATEGORIES = [
  'BUSINESS', 'POLITICS', 'TECHNOLOGY', 'SPORTS', 'ENTERTAINMENT', 
  'HEALTH', 'SCIENCE', 'ENVIRONMENT', 'EDUCATION'
];

const NEWS_TYPES = ['LOCAL', 'NATIONAL', 'INTERNATIONAL'];
const PRIORITIES = ['BREAKING', 'FLASH', 'NORMAL'];

// Comments Panel Component (moved outside to prevent re-renders)
const CommentsPanel = React.memo(({ 
  showComments, 
  toggleComments, 
  currentNewsId, 
  comments, 
  counts, 
  newComment, 
  setNewComment, 
  submitComment 
}) => {
  const commentInputRef = useRef(null);

  if (!showComments || !comments[currentNewsId]) return null;

  return (
    <View style={styles.commentsContainer}>
      <View style={styles.commentsHeader}>
        <Text style={styles.commentsTitle}>
          Comments ({counts[currentNewsId]?.comments || 0})
        </Text>
        <TouchableOpacity onPress={toggleComments}>
          <Icon name="xmark" size={20} color={pallette.grey} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.addCommentContainer}>
        <TextInput
          ref={commentInputRef}
          style={styles.commentInput}
          placeholder="Write a comment..."
          value={newComment}
          onChangeText={setNewComment}
          keyboardType="default"
          multiline={true}
          placeholderTextColor={pallette.grey}
          blurOnSubmit={false}
          onSubmitEditing={submitComment}
        />
        <TouchableOpacity 
          style={[styles.submitButton, !newComment.trim() && styles.submitButtonDisabled]}
          onPress={submitComment}
          disabled={!newComment.trim()}
        >
          <Icon name="paper-plane" size={18} color={pallette.white} />
        </TouchableOpacity>
      </View>
      <ScrollView 
        style={styles.commentsList}
        keyboardShouldPersistTaps="handled"
      >
        {comments[currentNewsId].map((item) => (
          <View key={item.id} style={styles.commentItem}>
            <View style={styles.commentAvatar}>
              <Text style={styles.commentAvatarText}>
                {item.user.charAt(0)}
              </Text>
            </View>
            <View style={styles.commentContent}>
              <View style={styles.commentHeader}>
                <Text style={styles.commentUserName}>{item.user}</Text>
                <Text style={styles.commentTime}>{item.time}</Text>
              </View>
              <Text style={styles.commentText}>{item.text}</Text>
            </View>
          </View>
        ))}
        
        {comments[currentNewsId].length === 0 && (
          <View style={styles.noCommentsContainer}>
            <Icon name="comment-slash" size={40} color={pallette.grey} />
            <Text style={styles.noCommentsText}>No comments yet</Text>
          </View>
        )}
      </ScrollView>
      
      
    </View>
  );
});

// Filter Modal Component (moved outside to prevent re-renders)
const FilterModal = React.memo(({ 
  showFilterModal, 
  setShowFilterModal, 
  selectedCategory, 
  setSelectedCategory, 
  selectedNewsType, 
  setSelectedNewsType, 
  selectedPriority, 
  setSelectedPriority, 
  clearFilters, 
  applyFilters 
}) => {
  const modalContentRef = useRef(null);

  const handleOverlayPress = (event) => {
    // Check if the press was on the overlay (not the modal content)
    if (modalContentRef.current && 
        !modalContentRef.current.measure) {
      return;
    }
    
    modalContentRef.current.measure((fx, fy, width, height, px, py) => {
      if (event.nativeEvent.pageY < py) {
        setShowFilterModal(false);
      }
    });
  };

  return (
    <Modal
      visible={showFilterModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowFilterModal(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={handleOverlayPress}
      >
        <View 
          ref={modalContentRef}
          style={styles.modalContent}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter News</Text>
            <TouchableOpacity 
              onPress={() => setShowFilterModal(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="xmark" size={20} color={pallette.black} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterOptions}>
            {/* Category Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Category</Text>
              <View style={styles.filterButtons}>
                {CATEGORIES.map(category => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.filterButton,
                      selectedCategory === category && styles.filterButtonActive
                    ]}
                    onPress={() => setSelectedCategory(
                      selectedCategory === category ? '' : category
                    )}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.filterButtonText,
                      selectedCategory === category && styles.filterButtonTextActive
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* News Type Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>News Type</Text>
              <View style={styles.filterButtons}>
                {NEWS_TYPES.map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.filterButton,
                      selectedNewsType === type && styles.filterButtonActive
                    ]}
                    onPress={() => setSelectedNewsType(
                      selectedNewsType === type ? '' : type
                    )}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.filterButtonText,
                      selectedNewsType === type && styles.filterButtonTextActive
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Priority Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Priority</Text>
              <View style={styles.filterButtons}>
                {PRIORITIES.map(priority => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.filterButton,
                      selectedPriority === priority && styles.filterButtonActive
                    ]}
                    onPress={() => setSelectedPriority(
                      selectedPriority === priority ? '' : priority
                    )}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.filterButtonText,
                      selectedPriority === priority && styles.filterButtonTextActive
                    ]}>
                      {priority}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.clearButton]}
              onPress={clearFilters}
              activeOpacity={0.7}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.applyButton]}
              onPress={applyFilters}
              activeOpacity={0.7}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
});

const NewsViewScreen = () => {
  // Refs
  const flatListRef = useRef(null);
  
  // State
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newsList, setNewsList] = useState([]);
  const [comments, setComments] = useState({});
  const [likes, setLikes] = useState({});
  const [saved, setSaved] = useState({});
  const [counts, setCounts] = useState({});
  
  // Filter state
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedNewsType, setSelectedNewsType] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [filterApplied, setFilterApplied] = useState(false);
  
  const { user } = useAppContext();
  const userId = user?.userId || 2;

  // Initial data load
  useEffect(() => {
    loadPublishedNews();
  }, []);

  // Load data when current news changes
  useEffect(() => {
    if (currentNewsId) {
      loadNewsData(currentNewsId);
    }
  }, [currentNewsId]);

  // Load published news with optional filters
  const loadPublishedNews = async (filters = {}) => {
    try {
      setLoading(true);
      const response = await apiService.getPublishedNews(filters);
      
      if (response.error === false) {
        setNewsList(response.data || []);
        initializeNewsStates(response.data || []);
        
        // Load data for first news if available
        if (response.data?.length > 0) {
          await loadNewsData(response.data[0].id);
        }
      }
    } catch (error) {
      ErrorMessage.show('Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  const initializeNewsStates = (newsData) => {
    const initialComments = {};
    const initialLikes = {};
    const initialSaved = {};
    const initialCounts = {};
    
    newsData.forEach(news => {
      initialComments[news.id] = [];
      initialLikes[news.id] = { liked: false };
      initialSaved[news.id] = false;
      initialCounts[news.id] = {
        likes: 0,
        comments: 0,
        shares: 0
      };
    });
    
    setComments(initialComments);
    setLikes(initialLikes);
    setSaved(initialSaved);
    setCounts(initialCounts);
  };

  // Load all data for a specific news item
  const loadNewsData = async (newsId) => {
    try {
      await Promise.all([
        loadLikeStatus(newsId),
        loadComments(newsId),
        loadCounts(newsId)
      ]);
    } catch (error) {
      console.error(`Error loading data for news ${newsId}:`, error);
    }
  };

  // Load like status
  const loadLikeStatus = async (newsId) => {
    try {
      const response = await apiService.checkLikeStatus(newsId, userId);
      if (response.error === false) {
        const liked = response.data?.[0]?.liked || false;
        setLikes(prev => ({
          ...prev,
          [newsId]: { liked }
        }));
      }
    } catch (error) {
      console.error(`Error loading like status:`, error);
    }
  };

  // Load comments
  const loadComments = async (newsId) => {
    try {
      const response = await apiService.getComments(newsId);
      
      if (Array.isArray(response.data)) {
        const formattedComments = response.data.map(comment => ({
          id: comment.id,
          userId: comment.userId,
          user: `${comment.userName}`,
          text: comment.comment,
          time: formatTime(comment.createdAt),
          createdAt: comment.createdAt
        }));
        
        setComments(prev => ({
          ...prev,
          [newsId]: formattedComments
        }));
        
        setCounts(prev => ({
          ...prev,
          [newsId]: {
            ...prev[newsId],
            comments: formattedComments.length
          }
        }));
      }
    } catch (error) {
      console.error(`Error loading comments:`, error);
      setComments(prev => ({
        ...prev,
        [newsId]: []
      }));
    }
  };

  // Load counts
  const loadCounts = async (newsId) => {
    try {
      const response = await apiService.getCounts(newsId);
      if (response.data) {
        setCounts(prev => ({
          ...prev,
          [newsId]: {
            likes: response.data.likes || 0,
            comments: response.data.comments || 0,
            shares: response.data.shares || 0
          }
        }));
      }
    } catch (error) {
      console.error(`Error loading counts:`, error);
    }
  };

  // Format time
  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      
      return date.toLocaleDateString();
    } catch (error) {
      return 'Recently';
    }
  };

  // Current news data
  const currentNews = newsList[currentIndex] || {};
  const currentNewsId = currentNews.id;

  // Handle swipe - useCallback to prevent unnecessary re-renders
  const handleSwipe = useCallback((event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);
    setCurrentIndex(index);
    setShowComments(false);
  }, []);

  const goToNews = useCallback((index) => {
    if (index >= 0 && index < newsList.length) {
      flatListRef.current?.scrollToIndex({
        index,
        animated: true,
      });
      setCurrentIndex(index);
      setShowComments(false);
    }
  }, [newsList.length]);

  // Filter functions
  const handleFilterPress = useCallback(() => {
    setShowFilterModal(true);
  }, []);

  const applyFilters = useCallback(async () => {
    try {
      const filters = {};
      if (selectedCategory) filters.category = selectedCategory;
      if (selectedNewsType) filters.newsType = selectedNewsType;
      if (selectedPriority) filters.priority = selectedPriority;
      
      await loadPublishedNews(filters);
      setFilterApplied(true);
      setShowFilterModal(false);
      setCurrentIndex(0);
    } catch (error) {
      ErrorMessage.show('Failed to apply filters');
    }
  }, [selectedCategory, selectedNewsType, selectedPriority]);

  const clearFilters = useCallback(async () => {
    setSelectedCategory('');
    setSelectedNewsType('');
    setSelectedPriority('');
    setFilterApplied(false);
    await loadPublishedNews();
    setShowFilterModal(false);
  }, []);

  // Toggle like
  const toggleLike = useCallback(async () => {
    if (!currentNewsId) return;
    
    try {
      const currentLiked = likes[currentNewsId]?.liked || false;
      
      // Optimistic update
      setLikes(prev => ({
        ...prev,
        [currentNewsId]: { liked: !currentLiked }
      }));
      
      setCounts(prev => ({
        ...prev,
        [currentNewsId]: {
          ...prev[currentNewsId],
          likes: currentLiked 
            ? Math.max(0, (prev[currentNewsId]?.likes || 0) - 1)
            : (prev[currentNewsId]?.likes || 0) + 1
        }
      }));

      await apiService.toggleLike(currentNewsId, userId);
    } catch (error) {
      // Revert on error
      const currentLiked = likes[currentNewsId]?.liked || false;
      setLikes(prev => ({
        ...prev,
        [currentNewsId]: { liked: currentLiked }
      }));
      ErrorMessage.show('Failed to update like');
    }
  }, [currentNewsId, likes, userId]);

  // Toggle save
  const toggleSave = useCallback(() => {
    if (!currentNewsId) return;
    setSaved(prev => ({
      ...prev,
      [currentNewsId]: !prev[currentNewsId]
    }));
  }, [currentNewsId]);

  // Share news with formatted template
const incrementShare = useCallback(async () => {
  if (!currentNewsId) return;
  
  try {
    setCounts(prev => ({
      ...prev,
      [currentNewsId]: {
        ...prev[currentNewsId],
        shares: (prev[currentNewsId]?.shares || 0) + 1
      }
    }));

    await apiService.shareNews(currentNewsId, userId);
    
    // Create formatted news template
    const shareTemplate = `
📰 *${currentNews.headline}* 

${currentNews.content.length > 300 ? currentNews.content.substring(0, 300) + '...' : currentNews.content}

 *Category:* ${currentNews.category}
 *Type:* ${currentNews.newsType}
 *Priority:* ${currentNews.priority}
*Published:* ${formatTime(currentNews.publishedAt)}

📲 *Shared via NewsApp*
👉 Read full story in the app for more details!

#${currentNews.category} #NewsApp
    `.trim();

    try {
      await Share.share({
        title: currentNews.headline,
        message: shareTemplate,
        url: currentNews.mediaUrl || 'https://your-app-link.com' // Add your app link if available
      });
    } catch (shareError) {
      console.log('Share dialog cancelled');
    }
  } catch (error) {
    ErrorMessage.show('Failed to share news');
  }
}, [currentNewsId, currentNews, userId]);

  const toggleComments = useCallback(() => {
    setShowComments(prev => !prev);
  }, []);

  // Submit comment - useCallback to prevent re-renders
  const submitComment = useCallback(async () => {
    if (!currentNewsId || newComment.trim() === '') return;
    
    const commentText = newComment.trim();
    
    try {
      // Clear input first
      setNewComment('');
      
      await apiService.addComment(currentNewsId, userId, { comment: commentText });
      
      // Refresh comments
      await loadComments(currentNewsId);
      
      ErrorMessage.show('Comment added successfully');
    } catch (error) {
      ErrorMessage.show('Failed to add comment');
      // Restore comment if failed
      setNewComment(commentText);
    }
  }, [currentNewsId, newComment, userId]);

  // Action Bar Component - memoized to prevent re-renders
  const ActionBar = React.memo(({ newsId }) => (
    <View style={styles.actionBar}>
      <TouchableOpacity style={styles.actionButton} onPress={toggleLike}>
        <Icon 
          name="heart" 
          size={22} 
          solid={likes[newsId]?.liked}
          color={likes[newsId]?.liked ? pallette.red : pallette.darkgrey} 
        />
        <Text style={[
          styles.actionCount,
          likes[newsId]?.liked && styles.likedText
        ]}>
          {counts[newsId]?.likes || 0}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton} onPress={toggleComments}>
        <Icon 
          name="comment" 
          size={22} 
          color={showComments && currentNewsId === newsId ? pallette.primary : pallette.darkgrey} 
        />
        <Text style={styles.actionCount}>
          {counts[newsId]?.comments || 0}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton} onPress={incrementShare}>
        <Icon name="share" size={22} color={pallette.darkgrey} />
        <Text style={styles.actionCount}>
          {counts[newsId]?.shares || 0}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton} onPress={toggleSave}>
        <Icon 
          name="bookmark" 
          size={22} 
          solid={saved[newsId]}
          color={saved[newsId] ? pallette.primary : pallette.darkgrey} 
        />
        <Text style={styles.actionText}>Save</Text>
      </TouchableOpacity>
    </View>
  ));

  // News Item Component - memoized to prevent re-renders
  const NewsItem = React.memo(({ item }) => (
    <View style={styles.newsContainer}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.mediaUrl || 'https://picsum.photos/400/300' }} style={styles.newsImage} />
        <View style={styles.imageOverlay} />
        
       {/* <TouchableOpacity style={styles.filterButton} onPress={handleFilterPress}>
          <Icon name="filter" size={24} color={pallette.white} />
          {filterApplied && <View style={styles.filterBadge} />}
        </TouchableOpacity> */}
          <TouchableOpacity 
        style={{
          position: 'absolute',
          top: 40,
          left: 20,
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: pallette.primary,
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }} 
        onPress={() => {
          console.log('BUTTON CLICKED');
          handleFilterPress();
        }}
      >
        <Icon name="filter" size={20} color={pallette.white} />
      </TouchableOpacity>

        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.headline}>{item.headline}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.time}>{formatTime(item.publishedAt)}</Text>
          <Text style={styles.newsType}>{item.newsType} • {item.priority}</Text>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.fullContent}>{item.content}</Text>
          <View style={styles.contentSpacer} />
        </ScrollView>
      </View>
      <ActionBar newsId={item.id} />
    </View>
  ));

  if (loading) return <Loader />;

  if (newsList.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={pallette.black} />
        <View style={styles.emptyContainer}>
          <Icon name="newspaper" size={60} color={pallette.grey} />
          <Text style={styles.emptyText}>No news available</Text>
          <TouchableOpacity 
            style={styles.filterButtonEmpty} 
            onPress={handleFilterPress}
            activeOpacity={0.7}
          >
            <Text style={styles.filterButtonEmptyText}>Try different filters</Text>
          </TouchableOpacity>
        </View>
        <FilterModal 
          showFilterModal={showFilterModal}
          setShowFilterModal={setShowFilterModal}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedNewsType={selectedNewsType}
          setSelectedNewsType={setSelectedNewsType}
          selectedPriority={selectedPriority}
          setSelectedPriority={setSelectedPriority}
          clearFilters={clearFilters}
          applyFilters={applyFilters}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      > */}
        <FlatList
          ref={flatListRef}
          data={newsList}
          renderItem={({ item }) => <NewsItem item={item} />}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleSwipe}
          initialScrollIndex={currentIndex}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          removeClippedSubviews={false}
          windowSize={5}
          maxToRenderPerBatch={3}
        />

        <CommentsPanel 
          showComments={showComments}
          toggleComments={toggleComments}
          currentNewsId={currentNewsId}
          comments={comments}
          counts={counts}
          newComment={newComment}
          setNewComment={setNewComment}
          submitComment={submitComment}
        />
        
        <FilterModal 
          showFilterModal={showFilterModal}
          setShowFilterModal={setShowFilterModal}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedNewsType={selectedNewsType}
          setSelectedNewsType={setSelectedNewsType}
          selectedPriority={selectedPriority}
          setSelectedPriority={setSelectedPriority}
          clearFilters={clearFilters}
          applyFilters={applyFilters}
        />
      {/* </KeyboardAvoidingView> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: pallette.black,
  },
  keyboardView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: pallette.black,
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: medium,
    color: pallette.white,
    marginTop: 12,
  },
  filterButtonEmpty: {
    marginTop: 20,
    backgroundColor: pallette.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  filterButtonEmptyText: {
    color: pallette.white,
    fontFamily: medium,
  },
  newsContainer: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  imageContainer: {
    height: SCREEN_HEIGHT * 0.35,
    position: 'relative',
  },
  newsImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  
  filterBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: pallette.red,
  },
  categoryBadge: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: pallette.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    color: pallette.white,
    fontSize: 12,
    fontFamily: bold,
    textTransform: 'uppercase',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: pallette.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    marginTop: -20,
  },
  headline: {
    fontSize: 18,
    fontFamily: bold,
    color: pallette.black,
    marginBottom: 8,
    lineHeight: 32,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  time: {
    fontSize: 14,
    fontFamily: medium,
    color: pallette.grey,
  },
  newsType: {
    fontSize: 14,
    fontFamily: medium,
    color: pallette.primary,
  },
  fullContent: {
    fontSize: 15,
    fontFamily: regular,
    color: pallette.darkgrey,
    lineHeight: 22,
  },
  contentSpacer: {
    height: 80,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: pallette.white,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: pallette.lightgrey,
  },
  actionButton: {
    alignItems: 'center',
    minWidth: 60,
    paddingVertical: 4,
  },
  actionCount: {
    fontSize: 12,
    fontFamily: medium,
    color: pallette.darkgrey,
    marginTop: 4,
  },
  actionText: {
    fontSize: 12,
    fontFamily: medium,
    color: pallette.darkgrey,
    marginTop: 4,
  },
  likedText: {
    color: pallette.red,
  },
  // Comments
  commentsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: pallette.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.6,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: pallette.lightgrey,
  },
  commentsTitle: {
    fontSize: 18,
    fontFamily: semibold,
    color: pallette.black,
  },
  commentsList: {
    maxHeight: SCREEN_HEIGHT * 0.4,
    paddingHorizontal: 20,
  },
  commentItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: pallette.lightgrey,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: pallette.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  commentAvatarText: {
    color: pallette.white,
    fontSize: 16,
    fontFamily: bold,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  commentUserName: {
    fontSize: 14,
    fontFamily: semibold,
    color: pallette.black,
  },
  commentTime: {
    fontSize: 12,
    fontFamily: regular,
    color: pallette.grey,
  },
  commentText: {
    fontSize: 14,
    fontFamily: regular,
    color: pallette.darkgrey,
    lineHeight: 20,
  },
  noCommentsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noCommentsText: {
    fontSize: 16,
    fontFamily: medium,
    color: pallette.darkgrey,
    marginTop: 12,
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: pallette.lightgrey,
  },
  commentInput: {
    flex: 1,
    backgroundColor: pallette.lightgrey,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: regular,
    color: pallette.black,
    maxHeight: 80,
    marginRight: 12,
  },
  submitButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: pallette.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: pallette.grey,
  },
  // Navigation
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: pallette.black,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  swipeHint: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  swipeHintText: {
    color:pallette.black,
    fontSize: 12,
    fontFamily: regular,
  },
  // Filter Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(66, 60, 60, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: pallette.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: pallette.lightgrey,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: bold,
    color: pallette.black,
  },
  filterOptions: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontFamily: medium,
    color: pallette.black,
    marginBottom: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  filterButton: {
    width: (SCREEN_WIDTH - 60) / 3,
    paddingVertical: 12,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: pallette.lightgrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: pallette.primary,
  },
  filterButtonText: {
    fontSize: 12,
    fontFamily: semibold,
    color: pallette.darkgrey,
  },
  filterButtonTextActive: {
    color: pallette.white,
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: pallette.lightgrey,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: pallette.lightgrey,
  },
  applyButton: {
    backgroundColor: pallette.primary,
  },
  clearButtonText: {
    color: pallette.darkgrey,
    fontSize: 16,
    fontFamily: medium,
  },
  applyButtonText: {
    color: pallette.white,
    fontSize: 16,
    fontFamily: medium,
  },
});

export default NewsViewScreen;