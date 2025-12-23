import React, { useState, useEffect, useRef } from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { pallette } from '../helpers/colors';
import { regular, medium, semibold, bold } from '../helpers/fonts';
import Loader from '../helpers/loader';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const NewsViewScreen = () => {
  // Refs
  const flatListRef = useRef(null);
  const commentInputRef = useRef(null);
  
  // State
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newsList, setNewsList] = useState([]);
  const [comments, setComments] = useState({});
  const [likes, setLikes] = useState({});
  const [saved, setSaved] = useState({});
  const [shares, setShares] = useState({});

  // Initial data load
  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      // In production, replace with API call
      const mockNews = generateMockNews();
      setNewsList(mockNews);
      
      // Initialize states for each news item
      initializeNewsStates(mockNews);
    } catch (error) {
      console.error('Error initializing data:', error);
    } finally {
      setLoading(false);
    }
  };

 const generateMockNews = () => {
  return [
    {
      id: 1,
      headline: 'AI Breakthrough Revolutionizes Healthcare',
      description: 'New artificial intelligence system can detect diseases with 99% accuracy.',
      image: 'https://picsum.photos/400/300?random=1',
      category: 'Technology',
      time: 'Just now',
      content: 'Researchers have developed an AI system that can analyze medical scans and detect early signs of cancer, heart disease, and neurological disorders with unprecedented accuracy. This breakthrough could save millions of lives through early detection.',
      initialLikes: 423,
      initialComments: 67,
      initialShares: 89,
    },
    {
      id: 2,
      headline: 'Global Summit Addresses Climate Crisis',
      description: 'World leaders unite to announce new climate action commitments.',
      image: 'https://picsum.photos/400/300?random=2',
      category: 'Environment',
      time: '30 minutes ago',
      content: 'At the annual climate summit, 150 nations pledged to cut carbon emissions by 50% before 2030. The agreement includes major investments in renewable energy and a global carbon trading system.',
      initialLikes: 587,
      initialComments: 142,
      initialShares: 234,
    },
    {
      id: 3,
      headline: 'Tech Giant Unveils Revolutionary Smartphone',
      description: 'New device features holographic display and week-long battery life.',
      image: 'https://picsum.photos/400/300?random=3',
      category: 'Technology',
      time: '1 hour ago',
      content: 'The latest smartphone innovation includes a holographic display that projects 3D images, revolutionary battery technology that lasts 7 days on a single charge, and advanced AI capabilities that learn user patterns.',
      initialLikes: 321,
      initialComments: 89,
      initialShares: 156,
    },
    {
      id: 4,
      headline: 'Historic Peace Treaty Signed',
      description: 'After decades of conflict, nations reach landmark peace agreement.',
      image: 'https://picsum.photos/400/300?random=4',
      category: 'Politics',
      time: '2 hours ago',
      content: 'In a historic ceremony, leaders of two long-feuding nations signed a comprehensive peace treaty ending 40 years of conflict. The agreement includes economic cooperation, cultural exchanges, and joint security measures.',
      initialLikes: 892,
      initialComments: 245,
      initialShares: 567,
    },
    {
      id: 5,
      headline: 'Breakthrough in Renewable Energy Storage',
      description: 'Scientists develop battery that stores solar energy for months.',
      image: 'https://picsum.photos/400/300?random=5',
      category: 'Science',
      time: '3 hours ago',
      content: 'Researchers have created a revolutionary energy storage system that can hold solar energy for up to 6 months with minimal loss. This breakthrough solves the biggest challenge in renewable energy adoption.',
      initialLikes: 456,
      initialComments: 78,
      initialShares: 189,
    },
    {
      id: 6,
      headline: 'Olympic Games Break Viewership Records',
      description: 'Global audience reaches 5 billion viewers for opening ceremony.',
      image: 'https://picsum.photos/400/300?random=6',
      category: 'Sports',
      time: '4 hours ago',
      content: 'The Olympic Games shattered viewership records with 5 billion people tuning in worldwide. Historic performances, stunning venues, and unity celebrations made this edition particularly memorable.',
      initialLikes: 678,
      initialComments: 156,
      initialShares: 345,
    },
    {
      id: 7,
      headline: 'Major Breakthrough in Cancer Treatment',
      description: 'New therapy shows 95% success rate in clinical trials.',
      image: 'https://picsum.photos/400/300?random=7',
      category: 'Health',
      time: '5 hours ago',
      content: 'A revolutionary cancer treatment using targeted immunotherapy has shown remarkable results in phase 3 clinical trials, achieving 95% remission rates in patients with advanced stages of the disease.',
      initialLikes: 1245,
      initialComments: 289,
      initialShares: 678,
    },
    {
      id: 8,
      headline: 'Cryptocurrency Market Hits $5 Trillion',
      description: 'Digital assets reach new milestone as institutional adoption grows.',
      image: 'https://picsum.photos/400/300?random=8',
      category: 'Finance',
      time: '6 hours ago',
      content: 'The total cryptocurrency market capitalization has surpassed $5 trillion for the first time, driven by increased institutional investment and widespread adoption by major corporations.',
      initialLikes: 345,
      initialComments: 89,
      initialShares: 123,
    },
    {
      id: 9,
      headline: 'Ancient City Discovered in Amazon',
      description: 'Archaeologists uncover lost civilization dating back 3000 years.',
      image: 'https://picsum.photos/400/300?random=9',
      category: 'History',
      time: '7 hours ago',
      content: 'Using advanced satellite imaging and LiDAR technology, archaeologists have discovered a massive ancient city complex in the Amazon rainforest, complete with pyramids, roads, and irrigation systems.',
      initialLikes: 567,
      initialComments: 134,
      initialShares: 256,
    },
    {
      id: 10,
      headline: 'Electric Vehicle Sales Surge 300%',
      description: 'Global EV adoption accelerates faster than expected.',
      image: 'https://picsum.photos/400/300?random=10',
      category: 'Automotive',
      time: '8 hours ago',
      content: 'Electric vehicle sales have increased by 300% year-over-year as charging infrastructure expands and prices become more competitive. This rapid adoption signals a major shift in the automotive industry.',
      initialLikes: 432,
      initialComments: 98,
      initialShares: 187,
    }
  ];
};
  const initializeNewsStates = (newsData) => {
    const initialComments = {};
    const initialLikes = {};
    const initialSaved = {};
    const initialShares = {};
    
    newsData.forEach(news => {
      initialComments[news.id] = [
        { id: 1, user: 'John Doe', text: 'Great news! Looking forward to this.', time: '1 hour ago' },
        { id: 2, user: 'Sarah Smith', text: 'Finally some positive development!', time: '2 hours ago' },
      ];
      initialLikes[news.id] = { count: news.initialLikes, liked: false };
      initialSaved[news.id] = false;
      initialShares[news.id] = { count: news.initialShares };
    });
    
    setComments(initialComments);
    setLikes(initialLikes);
    setSaved(initialSaved);
    setShares(initialShares);
  };

  // Current news data
  const currentNews = newsList[currentIndex] || {};
  const currentNewsId = currentNews.id;

  // Navigation handlers
  const handleBackPress = () => {
    // navigation.goBack(); // Uncomment when navigation is available
  };

  const handleSwipe = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);
    setCurrentIndex(index);
    setShowComments(false);
  };

  const goToNews = (index) => {
    if (index >= 0 && index < newsList.length) {
      flatListRef.current?.scrollToIndex({
        index,
        animated: true,
      });
      setCurrentIndex(index);
      setShowComments(false);
    }
  };

  const goToNextNews = () => goToNews(currentIndex + 1);
  const goToPrevNews = () => goToNews(currentIndex - 1);

  // Interaction handlers
  const toggleLike = () => {
    if (!currentNewsId) return;
    
    setLikes(prev => ({
      ...prev,
      [currentNewsId]: {
        count: prev[currentNewsId].liked ? prev[currentNewsId].count - 1 : prev[currentNewsId].count + 1,
        liked: !prev[currentNewsId].liked
      }
    }));
  };

  const toggleSave = () => {
    if (!currentNewsId) return;
    
    setSaved(prev => ({
      ...prev,
      [currentNewsId]: !prev[currentNewsId]
    }));
  };

  const incrementShare = () => {
    if (!currentNewsId) return;
    
    setShares(prev => ({
      ...prev,
      [currentNewsId]: {
        count: prev[currentNewsId].count + 1
      }
    }));
    // TODO: Implement native share dialog
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  const submitComment = () => {
    if (!currentNewsId || newComment.trim() === '') return;
    
    const newCommentObj = {
      id: Date.now(),
      user: 'You',
      text: newComment.trim(),
      time: 'Just now'
    };
    
    setComments(prev => ({
      ...prev,
      [currentNewsId]: [newCommentObj, ...prev[currentNewsId]]
    }));
    
    setNewComment('');
    commentInputRef.current?.blur();
  };

  // Component: Comments Panel
  const CommentsPanel = () => {
    if (!showComments || !comments[currentNewsId]) return null;

    return (
      <View style={styles.commentsContainer}>
        <View style={styles.commentsHeader}>
          <Text style={styles.commentsTitle}>
            Comments ({comments[currentNewsId].length})
          </Text>
          <TouchableOpacity onPress={toggleComments}>
            <Icon name="xmark" size={20} color={pallette.grey} />
          </TouchableOpacity>
        </View>
        
       {/* Comments List */}
<ScrollView 
  style={styles.commentsList}
  showsVerticalScrollIndicator={false}
>
  {comments[currentNewsId].map((item) => (
    <View key={item.id.toString()} style={styles.commentItem}>
      <View style={styles.commentUser}>
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
    </View>
  ))}
</ScrollView>
        
        <View style={styles.addCommentContainer}>
          <TextInput
            ref={commentInputRef}
            style={styles.commentInput}
            placeholder="Write a comment..."
            value={newComment}
            onChangeText={setNewComment}
            multiline
            placeholderTextColor={pallette.grey}
            maxLength={500}
          />
          <TouchableOpacity 
            style={[styles.submitButton, !newComment.trim() && styles.submitButtonDisabled]}
            onPress={submitComment}
            disabled={!newComment.trim()}
          >
            <Icon name="paper-plane" size={18} color={pallette.white} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Component: Action Bar
  const ActionBar = ({ newsId }) => (
    <View style={styles.actionBar}>
      <TouchableOpacity 
        style={styles.actionButton} 
        onPress={toggleLike}
      >
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
          {likes[newsId]?.count || 0}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.actionButton} 
        onPress={toggleComments}
      >
        <Icon 
          name="comment" 
          size={22} 
          color={showComments && currentNewsId === newsId ? pallette.primary : pallette.darkgrey} 
        />
        <Text style={[
          styles.actionCount,
          showComments && currentNewsId === newsId && styles.activeText
        ]}>
          {comments[newsId]?.length || 0}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.actionButton} 
        onPress={incrementShare}
      >
        <Icon name="share" size={22} color={pallette.darkgrey} />
        <Text style={styles.actionCount}>
          {shares[newsId]?.count || 0}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.actionButton} 
        onPress={toggleSave}
      >
        <Icon 
          name="bookmark" 
          size={22} 
          solid={saved[newsId]}
          color={saved[newsId] ? pallette.primary : pallette.darkgrey} 
        />
        <Text style={styles.actionText}>Save</Text>
      </TouchableOpacity>
    </View>
  );

  // Component: News Item
  const NewsItem = ({ item }) => (
    <View style={styles.newsContainer}>
      {/* Header with Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.newsImage} />
        <View style={styles.imageOverlay} />
        
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Icon name="arrow-left" size={24} color={pallette.white} />
        </TouchableOpacity>

        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headline}>{item.headline}</Text>
        <Text style={styles.time}>{item.time}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.fullContent}>{item.content}</Text>
        <View style={styles.contentSpacer} />
      </ScrollView>

      <ActionBar newsId={item.id} />
    </View>
  );

  // Component: Navigation Dots
  const NavigationDots = () => (
    <View style={styles.dotsContainer}>
      {newsList.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === currentIndex && styles.activeDot,
          ]}
        />
      ))}
    </View>
  );

  // Loading state
  if (loading) {
    return <Loader />;
  }

  // Empty state
  if (newsList.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={pallette.black} />
        <View style={styles.emptyContainer}>
          <Icon name="newspaper" size={60} color={pallette.grey} />
          <Text style={styles.emptyText}>No news available</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* News Carousel */}
        <FlatList
          ref={flatListRef}
          data={newsList}
          renderItem={NewsItem}
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
          onScrollToIndexFailed={() => {
            setTimeout(() => {
              flatListRef.current?.scrollToIndex({
                index: currentIndex,
                animated: true,
              });
            }, 100);
          }}
        />

        {/* Navigation Indicators */}
        <NavigationDots />
        
        {/* Swipe Hint */}
        {!showComments && (
          <View style={styles.swipeHint}>
            <Icon name="arrows-left-right" size={16} color={pallette.white} />
            <Text style={styles.swipeHintText}>Swipe for more news</Text>
          </View>
        )}

        {/* Comments Panel */}
        <CommentsPanel />
      </KeyboardAvoidingView>
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
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: medium,
    color: pallette.white,
    marginTop: 12,
    textAlign: 'center',
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
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  categoryBadge: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: pallette.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 1,
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
    fontSize: 24,
    fontFamily: bold,
    color: pallette.black,
    marginBottom: 8,
    lineHeight: 32,
  },
  time: {
    fontSize: 14,
    fontFamily: medium,
    color: pallette.grey,
    marginBottom: 6,
  },
  description: {
    fontSize: 16,
    fontFamily: medium,
    color: pallette.black,
    lineHeight: 24,
    marginBottom: 16,
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
  // Action Bar
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
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: pallette.lightgrey,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
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
  activeText: {
    color: pallette.primary,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
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
    alignItems: 'center',
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
    backgroundColor: pallette.white,
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
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontFamily: regular,
  },
});

export default NewsViewScreen;